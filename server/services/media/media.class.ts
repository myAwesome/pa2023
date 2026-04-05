import { randomUUID } from 'crypto';
import { Params } from '@feathersjs/feathers';
import { BadRequest, GeneralError } from '@feathersjs/errors';
import {
  GetObjectCommand,
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
  owner?: string;
  ranges?: string;
  pageToken?: string;
  pageSize?: string | number;
  onThisDay?: string | number | boolean;
};

type UploadInitBody = {
  action: 'init-upload';
  filename: string;
  mimeType?: string;
  capturedAt?: string;
  owner?: string;
};

type MediaRange = {
  start: string;
  end: string;
};

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 24;

const toBool = (value: MediaQuery['onThisDay']) =>
  value === true || value === 'true' || value === 1 || value === '1';

const toMmDd = (date: string) => dayjs.utc(date).format('MM-DD');

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
  const mmdd = captured.format('MM-DD');
  const yyyymmdd = captured.format('YYYY-MM-DD');
  return `${prefix}mmdd=${mmdd}/date=${yyyymmdd}/owner=${owner}/ts=${ts}_${randomUUID()}${extension}`;
};

export class MediaService {
  app: Application;
  s3: S3Client;
  bucket: string;
  prefix: string;
  getUrlTtlSeconds: number;
  putUrlTtlSeconds: number;
  uploadStorageClass?: StorageClass;

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
    this.s3 = new S3Client({
      region: cfg.region || process.env.AWS_REGION || 'us-east-1',
      endpoint: cfg.endpoint || process.env.AWS_S3_ENDPOINT || undefined,
      forcePathStyle: Boolean(
        cfg.forcePathStyle || process.env.AWS_S3_FORCE_PATH_STYLE === 'true',
      ),
    });
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

    const targetMmdd = query.mmdd || (date ? toMmDd(date.toISOString()) : null);
    const targetDate = date?.format('YYYY-MM-DD');
    const prefix = targetMmdd
      ? date && !onThisDay && targetDate
        ? `${this.prefix}mmdd=${targetMmdd}/date=${targetDate}/`
        : `${this.prefix}mmdd=${targetMmdd}/`
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
        if (!item.Key || !keyContainsOwner(item.Key, query.owner)) {
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
    if (!data || data.action !== 'init-upload') {
      throw new BadRequest('Unsupported action. Use action="init-upload".');
    }
    if (!data.filename) {
      throw new BadRequest('filename is required');
    }

    const owner = data.owner || String(params.user?.id || 'anonymous');
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
      key,
      uploadUrl,
      expiresIn: this.putUrlTtlSeconds,
      method: 'PUT',
      headers: {
        'Content-Type': data.mimeType || 'application/octet-stream',
      },
    };
  }
}
