import { randomUUID } from 'crypto';
import { Params } from '@feathersjs/feathers';
import { BadRequest, GeneralError } from '@feathersjs/errors';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  StorageClass,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Application } from '../../declarations';

dayjs.extend(utc);

type MediaQuery = {
  date?: string;
  mmdd?: string;
  key?: string;
  owner?: string;
  ranges?: string;
  pageToken?: string;
  pageSize?: string | number;
  onThisDay?: string | number | boolean;
};

type UploadInitBody = {
  action: 'init-upload' | 'complete-upload' | 'fail-upload';
  filename: string;
  mimeType?: string;
  capturedAt?: string;
  owner?: string;
  sha256?: string;
  sizeBytes?: number;
  key?: string;
  reason?: string;
};

type MediaRange = {
  start: string;
  end: string;
};

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 24;
const MEDIA_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.heic',
  '.heif',
  '.avif',
  '.mp4',
  '.mov',
  '.avi',
  '.m4v',
  '.3gp',
  '.mkv',
  '.webm',
]);

const toBool = (value: MediaQuery['onThisDay']) =>
  value === true || value === 'true' || value === 1 || value === '1';

const toIsoFromKey = (key: string) => {
  const tsMatch = key.match(/\/ts=([^_\/]+)_/);
  if (!tsMatch?.[1]) {
    return null;
  }
  const parsed = dayjs.utc(decodeURIComponent(tsMatch[1]));
  return parsed.isValid() ? parsed.toISOString() : null;
};

const keyContainsOwner = (key: string, owner?: string) =>
  !owner || key.includes(`/owner=${owner}/`);

const isMediaKey = (key: string) => {
  const lower = key.toLowerCase();
  const ext = lower.includes('.') ? `.${lower.split('.').pop() || ''}` : '';
  return MEDIA_EXTENSIONS.has(ext);
};

const isWithinRanges = (isoDate: string, ranges: MediaRange[]) =>
  ranges.some((range) => {
    const date = dayjs.utc(isoDate).valueOf();
    const start = dayjs.utc(range.start).startOf('day').valueOf();
    const end = dayjs.utc(range.end).endOf('day').valueOf();
    return date >= start && date <= end;
  });

const buildKey = ({
  capturedAt,
  owner,
  filename,
  prefix,
}: {
  capturedAt?: string;
  owner: string;
  filename: string;
  prefix: string;
}) => {
  const captured = dayjs.utc(capturedAt || new Date().toISOString());
  if (!captured.isValid()) {
    throw new BadRequest('Invalid capturedAt value');
  }

  const extension = filename.includes('.')
    ? `.${filename.split('.').pop() || ''}`.replace(/\.+$/, '')
    : '';
  const ts = captured.format('YYYY-MM-DDTHH:mm:ss[Z]');
  const yyyymmdd = captured.format('YYYY-MM-DD');
  return `${prefix}date=${yyyymmdd}/owner=${owner}/ts=${ts}_${randomUUID()}${extension}`;
};

export class MediaService {
  app: Application;
  s3: S3Client;
  bucket: string;
  prefix: string;
  getUrlTtlSeconds: number;
  putUrlTtlSeconds: number;
  uploadStorageClass?: StorageClass;
  dedupeIndexPrefix: string;

  constructor(app: Application) {
    this.app = app;
    const cfg = app.get('media') || {};
    this.bucket = cfg.bucket || process.env.AWS_S3_BUCKET || '';
    if (!this.bucket) {
      throw new Error('Missing media.bucket (or AWS_S3_BUCKET) configuration');
    }

    this.getUrlTtlSeconds = Number(cfg.getUrlTtlSeconds || 300);
    this.putUrlTtlSeconds = Number(cfg.putUrlTtlSeconds || 900);
    const uploadStorageClass = String(
      cfg.uploadStorageClass || process.env.AWS_S3_UPLOAD_STORAGE_CLASS || '',
    ).trim();
    this.uploadStorageClass = uploadStorageClass
      ? (uploadStorageClass as StorageClass)
      : undefined;
    this.prefix = String(cfg.prefix || 'media/').replace(/^\/+/, '');
    if (!this.prefix.endsWith('/')) {
      this.prefix += '/';
    }
    this.dedupeIndexPrefix = String(
      cfg.dedupeIndexPrefix || 'media-index/v1/',
    ).replace(/^\/+/, '');
    if (!this.dedupeIndexPrefix.endsWith('/')) {
      this.dedupeIndexPrefix += '/';
    }
    this.s3 = new S3Client({
      region: cfg.region || process.env.AWS_REGION || 'us-east-1',
      endpoint: cfg.endpoint || process.env.AWS_S3_ENDPOINT || undefined,
      forcePathStyle: Boolean(
        cfg.forcePathStyle || process.env.AWS_S3_FORCE_PATH_STYLE === 'true',
      ),
    });
  }

  buildDedupeKey(owner: string, sha256: string) {
    const shard = sha256.slice(0, 2);
    return `${this.dedupeIndexPrefix}owner=${owner}/sha256/${shard}/${sha256}.json`;
  }

  normalizeSha256(value?: string) {
    if (!value) return null;
    const normalized = value.trim().toLowerCase();
    if (!/^[a-f0-9]{64}$/.test(normalized)) {
      throw new BadRequest('sha256 must be a 64-character hex string');
    }
    return normalized;
  }

  async getDedupeMarker(owner: string, sha256?: string) {
    const normalized = this.normalizeSha256(sha256);
    if (!normalized) return null;

    const key = this.buildDedupeKey(owner, normalized);
    try {
      const result = await this.s3.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      const body = await result.Body?.transformToString();
      if (!body) return null;
      return JSON.parse(body);
    } catch (error: any) {
      const status = Number(error?.$metadata?.httpStatusCode || 0);
      if (status === 404 || error?.name === 'NoSuchKey') {
        return null;
      }
      throw new GeneralError('Failed to read dedupe marker', { error });
    }
  }

  async putDedupeMarker({
    owner,
    sha256,
    sizeBytes,
    mimeType,
    key,
    source,
  }: {
    owner: string;
    sha256: string;
    sizeBytes?: number;
    mimeType?: string;
    key: string;
    source: string;
  }) {
    const markerKey = this.buildDedupeKey(owner, sha256);
    const payload = {
      sha256,
      sizeBytes: Number(sizeBytes || 0) || undefined,
      mimeType: mimeType || undefined,
      canonicalMediaKey: key,
      createdAt: dayjs.utc().toISOString(),
      source,
      owner,
    };

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: markerKey,
          ContentType: 'application/json',
          Body: JSON.stringify(payload),
        }),
      );
    } catch (error) {
      throw new GeneralError('Failed to write dedupe marker', { error });
    }
  }

  async find(params: Params<MediaQuery>) {
    const query = params.query || {};
    const pageSize = Math.min(
      Number(query.pageSize || DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE,
    );
    const onThisDay = toBool(query.onThisDay);

    const date = query.date ? dayjs.utc(query.date) : null;
    if (query.date && (!date || !date.isValid())) {
      throw new BadRequest('Invalid date query');
    }

    let ranges: MediaRange[] = [];
    if (query.ranges) {
      try {
        ranges = JSON.parse(query.ranges) as MediaRange[];
      } catch {
        throw new BadRequest('Invalid ranges query JSON');
      }
    }

    const targetDate = date?.format('YYYY-MM-DD');
    const prefix =
      date && !onThisDay && targetDate
        ? `${this.prefix}date=${targetDate}/`
        : this.prefix;

    let continuationToken = query.pageToken;
    const collected: Array<{ key: string; createdAt: string }> = [];
    let pageGuard = 0;

    while (collected.length < pageSize && pageGuard < 20) {
      pageGuard += 1;
      const result = await this.s3.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: prefix,
          ContinuationToken: continuationToken,
          MaxKeys: 1000,
        }),
      );
      continuationToken = result.NextContinuationToken;
      const objects = result.Contents || [];

      for (const item of objects) {
        if (
          !item.Key ||
          !keyContainsOwner(item.Key, query.owner) ||
          !isMediaKey(item.Key)
        ) {
          continue;
        }
        const createdAt =
          toIsoFromKey(item.Key) || item.LastModified?.toISOString();
        if (!createdAt) {
          continue;
        }
        if (
          date &&
          !onThisDay &&
          dayjs.utc(createdAt).format('YYYY-MM-DD') !==
            date.format('YYYY-MM-DD')
        ) {
          continue;
        }
        if (ranges.length && !isWithinRanges(createdAt, ranges)) {
          continue;
        }
        collected.push({ key: item.Key, createdAt });
      }

      if (!result.IsTruncated) {
        break;
      }
    }

    collected.sort(
      (a, b) =>
        dayjs.utc(b.createdAt).valueOf() - dayjs.utc(a.createdAt).valueOf(),
    );
    const selected = collected.slice(0, pageSize);

    const mediaItems = await Promise.all(
      selected.map(async (item) => {
        try {
          const baseUrl = await getSignedUrl(
            this.s3,
            new GetObjectCommand({
              Bucket: this.bucket,
              Key: item.key,
            }),
            { expiresIn: this.getUrlTtlSeconds },
          );
          return {
            id: item.key,
            baseUrl,
            mediaMetadata: {
              creationTime: item.createdAt,
            },
          };
        } catch (error) {
          throw new GeneralError('Failed to sign media URL', { error });
        }
      }),
    );

    return {
      mediaItems,
      nextPageToken: continuationToken || null,
    };
  }

  async create(data: UploadInitBody, params: Params) {
    const owner = data.owner || String(params.user?.id || 'anonymous');
    const normalizedSha = this.normalizeSha256(data.sha256 || undefined);

    if (!data || !data.action) {
      throw new BadRequest(
        'Unsupported action. Use action="init-upload", "complete-upload", or "fail-upload".',
      );
    }

    if (data.action === 'complete-upload') {
      if (!data.key) {
        throw new BadRequest('key is required for complete-upload');
      }
      if (!keyContainsOwner(data.key, owner)) {
        throw new BadRequest('Not allowed to complete this media item');
      }

      try {
        await this.s3.send(
          new HeadObjectCommand({
            Bucket: this.bucket,
            Key: data.key,
          }),
        );
      } catch (error) {
        throw new GeneralError('Uploaded media object not found', { error });
      }

      if (normalizedSha) {
        await this.putDedupeMarker({
          owner,
          sha256: normalizedSha,
          sizeBytes: data.sizeBytes,
          mimeType: data.mimeType,
          key: data.key,
          source: 'mobile',
        });
      }

      return {
        key: data.key,
        completed: true,
        dedupeIndexed: Boolean(normalizedSha),
      };
    }

    if (data.action === 'fail-upload') {
      return {
        key: data.key || null,
        failed: true,
        reason: data.reason || null,
      };
    }

    if (data.action !== 'init-upload') {
      throw new BadRequest(
        'Unsupported action. Use action="init-upload", "complete-upload", or "fail-upload".',
      );
    }
    if (!data.filename) {
      throw new BadRequest('filename is required');
    }

    if (normalizedSha) {
      const marker = await this.getDedupeMarker(owner, normalizedSha);
      if (marker?.canonicalMediaKey) {
        return {
          duplicate: true,
          existingKey: marker.canonicalMediaKey,
          key: marker.canonicalMediaKey,
          uploadUrl: null,
          expiresIn: null,
          method: null,
          headers: null,
        };
      }
    }

    const key = buildKey({
      capturedAt: data.capturedAt,
      owner,
      filename: data.filename,
      prefix: this.prefix,
    });

    const uploadUrl = await getSignedUrl(
      this.s3,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: data.mimeType || 'application/octet-stream',
        ...(this.uploadStorageClass
          ? { StorageClass: this.uploadStorageClass }
          : {}),
        Metadata: {
          owner,
          captured_at: data.capturedAt || '',
        },
      }),
      { expiresIn: this.putUrlTtlSeconds },
    );

    return {
      duplicate: false,
      key,
      uploadUrl,
      expiresIn: this.putUrlTtlSeconds,
      method: 'PUT',
      headers: {
        'Content-Type': data.mimeType || 'application/octet-stream',
      },
    };
  }

  async remove(id: string | null, params: Params<MediaQuery>) {
    const query = params.query || {};
    const key = String(id || query.key || '').trim();
    if (!key) {
      throw new BadRequest('key is required');
    }

    const owner = String(params.user?.id || '');
    if (!owner || !keyContainsOwner(key, owner)) {
      throw new BadRequest('Not allowed to delete this media item');
    }

    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      // Best effort delete for paired metadata object.
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: `${key}.metadata.json`,
        }),
      );

      return {
        id: key,
        key,
        deleted: true,
      };
    } catch (error) {
      throw new GeneralError('Failed to delete media', { error });
    }
  }
}
