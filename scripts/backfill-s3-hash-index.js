#!/usr/bin/env node

/* eslint-disable no-console */
const crypto = require('crypto');
const {
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} = require('@aws-sdk/client-s3');

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
  if (!value) throw new Error(`Missing required --${key}`);
  return value;
}

function normalizePrefix(value, withTrailingSlash = true) {
  let out = String(value || '').replace(/^\/+/, '');
  if (withTrailingSlash && out && !out.endsWith('/')) out += '/';
  return out;
}

function isMediaKey(key) {
  const lower = key.toLowerCase();
  if (lower.endsWith('.metadata.json')) return false;
  return [
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
  ].some((ext) => lower.endsWith(ext));
}

function ownerFromKey(key) {
  const m = key.match(/\/owner=([^/]+)\//);
  return m?.[1] || 'unknown';
}

function dedupeKey(indexPrefix, owner, sha256) {
  const shard = sha256.slice(0, 2);
  return `${indexPrefix}owner=${owner}/sha256/${shard}/${sha256}.json`;
}

async function sha256FromObjectBody(body) {
  const hash = crypto.createHash('sha256');
  for await (const chunk of body) {
    hash.update(chunk);
  }
  return hash.digest('hex');
}

async function markerExists(s3, bucket, key) {
  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
    return true;
  } catch (error) {
    const status = Number(error?.$metadata?.httpStatusCode || 0);
    return status !== 404;
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const bucket = requireArg(args, 'bucket', process.env.AWS_S3_BUCKET);
  const region = args.region || process.env.AWS_REGION || 'us-east-1';
  const mediaPrefix = normalizePrefix(args.mediaPrefix || 'media/');
  const indexPrefix = normalizePrefix(args.indexPrefix || 'media-index/v1/');
  const dryRun = Boolean(args.dryRun);
  const limit = Number(args.limit || 0) || 0;

  const s3 = new S3Client({
    region,
    endpoint: args.endpoint || process.env.AWS_S3_ENDPOINT || undefined,
    forcePathStyle: Boolean(
      args.forcePathStyle || process.env.AWS_S3_FORCE_PATH_STYLE === 'true',
    ),
  });

  let continuationToken = undefined;
  let scanned = 0;
  let mediaCount = 0;
  let indexed = 0;
  let skippedExisting = 0;
  let failed = 0;

  while (true) {
    const page = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: mediaPrefix,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      }),
    );

    for (const obj of page.Contents || []) {
      const key = obj.Key;
      scanned += 1;
      if (!key || !isMediaKey(key)) continue;
      mediaCount += 1;
      if (limit > 0 && mediaCount > limit) break;

      try {
        const getResp = await s3.send(
          new GetObjectCommand({
            Bucket: bucket,
            Key: key,
          }),
        );
        if (!getResp.Body) {
          failed += 1;
          console.error(`Failed (no body): ${key}`);
          continue;
        }

        const sha256 = await sha256FromObjectBody(getResp.Body);
        const owner = ownerFromKey(key);
        const indexKey = dedupeKey(indexPrefix, owner, sha256);
        const exists = await markerExists(s3, bucket, indexKey);
        if (exists) {
          skippedExisting += 1;
          continue;
        }

        const payload = {
          sha256,
          sizeBytes: Number(obj.Size || 0),
          canonicalMediaKey: key,
          createdAt: new Date().toISOString(),
          source: 'takeout-backfill',
          owner,
        };

        if (!dryRun) {
          await s3.send(
            new PutObjectCommand({
              Bucket: bucket,
              Key: indexKey,
              ContentType: 'application/json',
              Body: JSON.stringify(payload),
            }),
          );
        }

        indexed += 1;
        console.log(
          `${dryRun ? '[DRY] ' : ''}Indexed ${key} -> ${indexKey}`,
        );
      } catch (error) {
        failed += 1;
        console.error(`Failed: ${key} (${error.message})`);
      }
    }

    if ((limit > 0 && mediaCount >= limit) || !page.IsTruncated) {
      break;
    }
    continuationToken = page.NextContinuationToken;
  }

  console.log('Done.');
  console.log(`Scanned objects: ${scanned}`);
  console.log(`Media objects: ${mediaCount}`);
  console.log(`Indexed markers: ${indexed}`);
  console.log(`Skipped existing: ${skippedExisting}`);
  console.log(`Failed: ${failed}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

