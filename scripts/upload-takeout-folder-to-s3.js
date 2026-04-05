#!/usr/bin/env node

/* eslint-disable no-console */
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

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

const CONTENT_TYPE_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.m4v': 'video/x-m4v',
  '.3gp': 'video/3gpp',
  '.mkv': 'video/x-matroska',
  '.webm': 'video/webm',
};

const PROGRESS_EVERY = 100;

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const part = argv[i];
    if (!part.startsWith('--')) continue;
    const key = part.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function requireArg(args, key, fallback) {
  const value = args[key] || fallback;
  if (!value) {
    throw new Error(`Missing required --${key}`);
  }
  return value;
}

function normalizeRel(p) {
  return p.replace(/\\/g, '/').replace(/^\/+/, '').toLowerCase();
}

function canonicalTakeoutRel(p) {
  const normalized = normalizeRel(p);
  const parts = normalized.split('/').filter(Boolean);
  if (parts.length > 1 && /^takeout(?: \d+)?$/i.test(parts[0])) {
    return parts.slice(1).join('/');
  }
  return normalized;
}

function toIsoUtc(date) {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) {
    return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  }
  return value.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function toYyyyMmDd(iso) {
  return iso.slice(0, 10);
}

function buildS3Key({ prefix, owner, iso, ext }) {
  const yyyymmdd = toYyyyMmDd(iso);
  return `${prefix}date=${yyyymmdd}/owner=${owner}/ts=${iso}_${crypto.randomUUID()}${ext.toLowerCase()}`;
}

function toMetadataBase64(value) {
  return Buffer.from(String(value), 'utf8').toString('base64');
}

function isMediaPath(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MEDIA_EXTENSIONS.has(ext);
}

function isJsonPath(filePath) {
  return path.extname(filePath).toLowerCase() === '.json';
}

function sidecarCandidates(mediaRelPath) {
  const normalized = normalizeRel(mediaRelPath);
  const ext = path.extname(normalized);
  const noExt = ext ? normalized.slice(0, -ext.length) : normalized;
  const dir = path.posix.dirname(normalized);
  const base = path.posix.basename(normalized);

  return [
    `${normalized}.json`,
    `${noExt}.json`,
    `${dir}/${base}.supplemental-metadata.json`,
    `${dir}/${base}.supplemental-met.json`,
    `${dir}/${base}.supple.json`,
    `${dir}/${base}.suppl.json`,
  ];
}

function extractTimestampFromSidecar(json) {
  const candidates = [
    json?.photoTakenTime?.timestamp,
    json?.creationTime?.timestamp,
    json?.photoLastModifiedTime?.timestamp,
  ];
  for (const ts of candidates) {
    if (!ts) continue;
    const num = Number(ts);
    if (Number.isFinite(num) && num > 0) {
      return toIsoUtc(new Date(num * 1000));
    }
  }
  return null;
}

async function appendJsonLine(filePath, obj) {
  await fsp.appendFile(filePath, `${JSON.stringify(obj)}\n`, 'utf8');
}

async function loadSuccessSet(filePath, options = {}) {
  const includeDryRun = Boolean(options.includeDryRun);
  try {
    const text = await fsp.readFile(filePath, 'utf8');
    const set = new Set();
    for (const line of text.split('\n')) {
      if (!line.trim()) continue;
      try {
        const row = JSON.parse(line);
        if (
          row?.status === 'success' &&
          row?.uploadId &&
          (includeDryRun || !row?.dryRun)
        ) {
          set.add(row.uploadId);
        }
      } catch {
        // ignore malformed rows
      }
    }
    return set;
  } catch (error) {
    if (error.code === 'ENOENT') return new Set();
    throw error;
  }
}

async function walkFiles(rootDir) {
  const out = [];

  async function visit(current) {
    const entries = await fsp.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await visit(full);
      } else if (entry.isFile()) {
        out.push(full);
      }
    }
  }

  await visit(rootDir);
  return out;
}

async function removeEmptyDirs(rootDir) {
  async function prune(dir) {
    const entries = await fsp.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        await prune(path.join(dir, entry.name));
      }
    }

    const after = await fsp.readdir(dir);
    if (after.length === 0 && dir !== rootDir) {
      await fsp.rmdir(dir);
    }
  }

  await prune(rootDir);
}

async function main() {
  const args = parseArgs(process.argv);
  const inputDir = path.resolve(requireArg(args, 'input', null));
  const bucket = requireArg(args, 'bucket', process.env.AWS_S3_BUCKET);
  const owner = requireArg(args, 'owner', '1');
  const region = args.region || process.env.AWS_REGION || 'us-east-1';
  const storageClass = args.storageClass || process.env.AWS_S3_UPLOAD_STORAGE_CLASS || 'GLACIER_IR';
  const dryRun = Boolean(args.dryRun);
  const allowMissingMetadata = Boolean(args.allowMissingMetadata);
  const uploadMetadata = !args.skipMetadataUpload;
  const uploadConcurrency = Math.max(
    1,
    Number(args.concurrency || args.uploadConcurrency || 8) || 8,
  );

  let prefix = args.prefix || 'media/';
  if (!prefix.endsWith('/')) prefix += '/';

  const stateDir = path.resolve(args.stateDir || '.takeout-folder-upload-state');
  await fsp.mkdir(stateDir, { recursive: true });

  const uploadedLog = path.join(stateDir, 'uploaded.jsonl');
  const failedLog = path.join(stateDir, 'failed.jsonl');
  const deferredLog = path.join(stateDir, 'deferred.jsonl');
  const metadataUploadedLog = path.join(stateDir, 'metadata-uploaded.jsonl');
  const metadataFailedLog = path.join(stateDir, 'metadata-failed.jsonl');

  const allFiles = await walkFiles(inputDir);
  const mediaFiles = allFiles.filter(isMediaPath);
  const jsonFiles = allFiles.filter(isJsonPath);

  console.log(`Scanned files: ${allFiles.length}`);
  console.log(`Media files: ${mediaFiles.length}`);
  console.log(`JSON files: ${jsonFiles.length}`);

  const metadataByJsonPath = new Map();
  const jsonRelByNormalized = new Map();
  const mediaIsoByPath = new Map();
  let jsonParsedCount = 0;

  for (const jsonPath of jsonFiles) {
    jsonParsedCount += 1;
    if (jsonParsedCount % PROGRESS_EVERY === 0) {
      console.log(`Indexing metadata JSON: ${jsonParsedCount}/${jsonFiles.length}`);
    }

    let parsed;
    try {
      parsed = JSON.parse(await fsp.readFile(jsonPath, 'utf8'));
    } catch {
      continue;
    }

    const iso = extractTimestampFromSidecar(parsed);
    if (!iso) continue;

    const relJsonRaw = path.relative(inputDir, jsonPath);
    const relJsonCanonical = canonicalTakeoutRel(relJsonRaw);
    metadataByJsonPath.set(relJsonCanonical, iso);
    if (!jsonRelByNormalized.has(relJsonCanonical)) {
      jsonRelByNormalized.set(relJsonCanonical, relJsonRaw);
    }

    const title = parsed?.title;
    if (title && typeof title === 'string') {
      const mediaRelByTitle = normalizeRel(
        path.posix.join(path.posix.dirname(relJsonCanonical), title),
      );
      if (!mediaIsoByPath.has(mediaRelByTitle)) {
        mediaIsoByPath.set(mediaRelByTitle, iso);
      }
    }
  }

  for (const [relJson, iso] of metadataByJsonPath.entries()) {
    const relWithoutSuffix = relJson.replace(/\.(supplemental-metadata|supplemental-met|supple|suppl)\.json$/i, '');
    if (relWithoutSuffix !== relJson && !mediaIsoByPath.has(relWithoutSuffix)) {
      mediaIsoByPath.set(relWithoutSuffix, iso);
    }

    const noJsonSuffix = relJson.replace(/\.json$/i, '');
    if (noJsonSuffix !== relJson && !mediaIsoByPath.has(noJsonSuffix)) {
      mediaIsoByPath.set(noJsonSuffix, iso);
    }
  }

  const s3 = new S3Client({ region });
  const uploadedSet = await loadSuccessSet(uploadedLog);

  let uploadedCount = 0;
  let deferredCount = 0;
  let failedCount = 0;
  let metadataUploadedCount = 0;
  let metadataFailedCount = 0;
  let inFlightUploads = 0;

  let mediaProcessedCount = 0;
  let nextMediaIndex = 0;

  const processOneMedia = async (mediaPath, workerId) => {
    mediaProcessedCount += 1;
    if (
      mediaProcessedCount % PROGRESS_EVERY === 0 ||
      mediaProcessedCount === mediaFiles.length
    ) {
      console.log(
        `Processing media files: ${mediaProcessedCount}/${mediaFiles.length} ` +
          `(uploaded=${uploadedCount}, deferred=${deferredCount}, failed=${failedCount})`,
      );
    }

    const relMedia = path.relative(inputDir, mediaPath);
    const relMediaNorm = normalizeRel(relMedia);
    const relMediaCanonical = canonicalTakeoutRel(relMedia);
    const uploadId = relMediaNorm;

    if (uploadedSet.has(uploadId)) {
      return;
    }

    const candidates = sidecarCandidates(relMediaCanonical);
    const capturedAt =
      mediaIsoByPath.get(relMediaCanonical) ||
      candidates.map((c) => metadataByJsonPath.get(c)).find(Boolean);

    if (!capturedAt && !allowMissingMetadata) {
      deferredCount += 1;
      await appendJsonLine(deferredLog, {
        uploadId,
        status: 'deferred-missing-metadata',
        mediaPath: relMedia,
        deferredAt: new Date().toISOString(),
      });
      return;
    }

    const finalCapturedAt = capturedAt || toIsoUtc(new Date());
    const ext = path.extname(mediaPath) || '';
    const s3Key = buildS3Key({ prefix, owner, iso: finalCapturedAt, ext });
    const matchedSidecarNorm = candidates.find(
      (c) => metadataByJsonPath.has(c) || jsonRelByNormalized.has(c),
    );
    const matchedSidecarRel = matchedSidecarNorm
      ? jsonRelByNormalized.get(matchedSidecarNorm) || matchedSidecarNorm
      : null;
    const detailsS3Key =
      uploadMetadata && matchedSidecarRel
        ? `${s3Key}.metadata.json`
        : null;
    const contentType =
      CONTENT_TYPE_BY_EXT[ext.toLowerCase()] || 'application/octet-stream';

    inFlightUploads += 1;
    try {
      if (!dryRun) {
        const uploads = [
          s3.send(
            new PutObjectCommand({
              Bucket: bucket,
              Key: s3Key,
              StorageClass: storageClass,
              ContentType: contentType,
              Body: fs.createReadStream(mediaPath),
              Metadata: {
                source: 'google-takeout-folder',
                owner,
                original_path_b64: toMetadataBase64(relMediaNorm),
                ...(detailsS3Key
                  ? { details_key_b64: toMetadataBase64(detailsS3Key) }
                  : {}),
              },
            }),
          ),
        ];

        if (detailsS3Key && matchedSidecarRel) {
          uploads.push(
            s3.send(
              new PutObjectCommand({
                Bucket: bucket,
                Key: detailsS3Key,
                StorageClass: storageClass,
                ContentType: 'application/json',
                Body: fs.createReadStream(path.join(inputDir, matchedSidecarRel)),
                Metadata: {
                  source: 'google-takeout-folder-media-details',
                  owner,
                  media_key_b64: toMetadataBase64(s3Key),
                  original_path_b64: toMetadataBase64(matchedSidecarRel),
                },
              }),
            ),
          );
        }

        await Promise.all(uploads);

        if (detailsS3Key && matchedSidecarRel) {
          const metadataUploadId = `${uploadId}::details`;
          metadataUploadedCount += 1;
          await appendJsonLine(metadataUploadedLog, {
            uploadId: metadataUploadId,
            status: 'success',
            mediaPath: relMedia,
            jsonPath: matchedSidecarRel,
            s3Key: detailsS3Key,
            uploadedAt: new Date().toISOString(),
            dryRun,
          });
        }
      }

      await appendJsonLine(uploadedLog, {
        uploadId,
        status: 'success',
        mediaPath: relMedia,
        s3Key,
        detailsS3Key,
        sidecarPath: matchedSidecarRel,
        capturedAt: finalCapturedAt,
        uploadedAt: new Date().toISOString(),
        dryRun,
      });

      uploadedSet.add(uploadId);
      uploadedCount += 1;

      if (!dryRun) {
        await fsp.rm(mediaPath, { force: true });
        if (matchedSidecarRel) {
          await fsp.rm(path.join(inputDir, matchedSidecarRel), { force: true });
        }
      }

      console.log(
        `[worker ${workerId}] Uploaded (in-flight=${inFlightUploads}): ${relMedia} -> s3://${bucket}/${s3Key}`,
      );
    } catch (error) {
      failedCount += 1;
      if (detailsS3Key && matchedSidecarRel) {
        metadataFailedCount += 1;
        await appendJsonLine(metadataFailedLog, {
          uploadId: `${uploadId}::details`,
          status: 'failed',
          mediaPath: relMedia,
          jsonPath: matchedSidecarRel,
          s3Key: detailsS3Key,
          error: error.message,
          failedAt: new Date().toISOString(),
        });
      }
      await appendJsonLine(failedLog, {
        uploadId,
        status: 'failed',
        mediaPath: relMedia,
        error: error.message,
        failedAt: new Date().toISOString(),
      });
      console.error(
        `[worker ${workerId}] Failed (in-flight=${inFlightUploads}): ${relMedia} (${error.message})`,
      );
    } finally {
      inFlightUploads = Math.max(0, inFlightUploads - 1);
    }
  };

  const workers = Array.from({ length: uploadConcurrency }, async (_, i) => {
    const workerId = i + 1;
    while (true) {
      const index = nextMediaIndex;
      nextMediaIndex += 1;
      if (index >= mediaFiles.length) {
        return;
      }
      await processOneMedia(mediaFiles[index], workerId);
    }
  });

  await Promise.all(workers);

  if (!dryRun) {
    await removeEmptyDirs(inputDir);
  }

  console.log('Done.');
  console.log(`Uploaded: ${uploadedCount}`);
  console.log(`Deferred: ${deferredCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log(`Metadata uploaded: ${metadataUploadedCount}`);
  console.log(`Metadata failed: ${metadataFailedCount}`);
  console.log(`Uploaded log: ${uploadedLog}`);
  console.log(`Deferred log: ${deferredLog}`);
  console.log(`Failed log: ${failedLog}`);
  if (uploadMetadata) {
    console.log(`Metadata uploaded log: ${metadataUploadedLog}`);
    console.log(`Metadata failed log: ${metadataFailedLog}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
