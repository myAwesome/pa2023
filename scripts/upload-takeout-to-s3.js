#!/usr/bin/env node

/* eslint-disable no-console */
const fs = require('fs');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn, spawnSync } = require('child_process');
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

function runUnzipList(zipPath) {
  const result = spawnSync('unzip', ['-Z1', zipPath], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 256,
  });
  if (result.status !== 0) {
    throw new Error(`Failed to list zip entries: ${zipPath}\n${result.stderr}`);
  }
  return result.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function runUnzipReadText(zipPath, entryPath) {
  const result = spawnSync('unzip', ['-p', zipPath, entryPath], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 50,
  });
  if (result.status !== 0) {
    return null;
  }
  return result.stdout;
}

async function extractEntryToTemp(zipPath, entryPath, outPath) {
  await fsp.mkdir(path.dirname(outPath), { recursive: true });
  return new Promise((resolve, reject) => {
    const unzip = spawn('unzip', ['-p', zipPath, entryPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const out = fs.createWriteStream(outPath);

    let stderr = '';
    unzip.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    unzip.on('error', reject);
    out.on('error', reject);
    unzip.stdout.pipe(out);
    out.on('finish', () => {
      if (unzip.exitCode !== 0 && unzip.exitCode !== null) {
        reject(new Error(stderr || `unzip failed for ${entryPath}`));
        return;
      }
      resolve();
    });
    unzip.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `unzip failed for ${entryPath}`));
      }
    });
  });
}

function normalizeRel(p) {
  return p.replace(/\\/g, '/').replace(/^\/+/, '').toLowerCase();
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
      return new Date(num * 1000);
    }
  }
  return null;
}

function toIsoUtc(date) {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) {
    return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  }
  return value.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function toMmDd(iso) {
  return iso.slice(5, 10);
}

function buildS3Key({ prefix, owner, iso, ext }) {
  const mmdd = toMmDd(iso);
  return `${prefix}mmdd=${mmdd}/owner=${owner}/ts=${iso}_${crypto.randomUUID()}${ext.toLowerCase()}`;
}

async function appendJsonLine(filePath, obj) {
  await fsp.appendFile(filePath, `${JSON.stringify(obj)}\n`, 'utf8');
}

async function loadUploadedSet(filePath) {
  try {
    const text = await fsp.readFile(filePath, 'utf8');
    const set = new Set();
    for (const line of text.split('\n')) {
      if (!line.trim()) continue;
      try {
        const row = JSON.parse(line);
        if (row?.status === 'success' && row?.uploadId) {
          set.add(row.uploadId);
        }
      } catch {
        // skip malformed line
      }
    }
    return set;
  } catch (error) {
    if (error.code === 'ENOENT') return new Set();
    throw error;
  }
}

async function loadDoneZips(filePath) {
  try {
    const text = await fsp.readFile(filePath, 'utf8');
    return new Set(text.split('\n').map((x) => x.trim()).filter(Boolean));
  } catch (error) {
    if (error.code === 'ENOENT') return new Set();
    throw error;
  }
}

async function appendDoneZip(filePath, zipName) {
  await fsp.appendFile(filePath, `${zipName}\n`, 'utf8');
}

function isMediaPath(entryPath) {
  const ext = path.extname(entryPath).toLowerCase();
  return MEDIA_EXTENSIONS.has(ext);
}

function sidecarCandidates(entryPath) {
  const normalized = normalizeRel(entryPath);
  const ext = path.extname(normalized);
  const noExt = ext ? normalized.slice(0, -ext.length) : normalized;
  return [
    `${normalized}.json`,
    `${noExt}.json`,
    `${path.dirname(normalized)}/${path.basename(normalized)}.json`,
  ];
}

async function buildMetadataIndex(zipFiles, indexFilePath) {
  const index = {};
  console.log(`Building metadata index from ${zipFiles.length} zip files...`);
  for (const zipPath of zipFiles) {
    const entries = runUnzipList(zipPath);
    const jsonEntries = entries.filter((e) => e.toLowerCase().endsWith('.json'));
    for (const entryPath of jsonEntries) {
      const raw = runUnzipReadText(zipPath, entryPath);
      if (!raw) continue;
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        continue;
      }
      const ts = extractTimestampFromSidecar(parsed);
      if (!ts) continue;
      const normalized = normalizeRel(entryPath);
      index[normalized] = toIsoUtc(ts);
      const title = parsed?.title;
      if (title && typeof title === 'string') {
        const byTitlePath = normalizeRel(path.posix.join(path.posix.dirname(normalized), title));
        if (!index[`${byTitlePath}.json`]) {
          index[`${byTitlePath}.json`] = toIsoUtc(ts);
        }
      }
    }
    console.log(`Indexed sidecars from ${path.basename(zipPath)} (${jsonEntries.length} json entries)`);
  }
  await fsp.writeFile(indexFilePath, JSON.stringify(index), 'utf8');
  console.log(`Metadata index saved: ${indexFilePath} (${Object.keys(index).length} keys)`);
  return index;
}

async function saveMetadataIndex(indexFilePath, index) {
  await fsp.writeFile(indexFilePath, JSON.stringify(index), 'utf8');
}

async function loadMetadataIndex(indexFilePath) {
  try {
    return JSON.parse(await fsp.readFile(indexFilePath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
}

async function mergeMetadataFromZip(zipPath, index) {
  const entries = runUnzipList(zipPath);
  const jsonEntries = entries.filter((e) => e.toLowerCase().endsWith('.json'));
  let added = 0;

  for (const entryPath of jsonEntries) {
    const raw = runUnzipReadText(zipPath, entryPath);
    if (!raw) continue;
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }
    const ts = extractTimestampFromSidecar(parsed);
    if (!ts) continue;

    const iso = toIsoUtc(ts);
    const normalized = normalizeRel(entryPath);
    if (!index[normalized]) {
      index[normalized] = iso;
      added += 1;
    }

    const title = parsed?.title;
    if (title && typeof title === 'string') {
      const byTitlePath = normalizeRel(path.posix.join(path.posix.dirname(normalized), title));
      if (!index[`${byTitlePath}.json`]) {
        index[`${byTitlePath}.json`] = iso;
        added += 1;
      }
    }
  }

  console.log(
    `Indexed sidecars from ${path.basename(zipPath)} (${jsonEntries.length} json entries, +${added} keys)`,
  );
}

async function main() {
  const args = parseArgs(process.argv);
  const inputDir = requireArg(args, 'input', null);
  const bucket = requireArg(args, 'bucket', process.env.AWS_S3_BUCKET);
  const owner = requireArg(args, 'owner', '1');
  const region = args.region || process.env.AWS_REGION || 'us-east-1';
  let prefix = args.prefix || 'media/';
  if (!prefix.endsWith('/')) prefix += '/';
  const storageClass = args.storageClass || process.env.AWS_S3_UPLOAD_STORAGE_CLASS || 'GLACIER_IR';
  const deleteArchives = Boolean(args.deleteArchives);
  const requireMetadata = !args.allowMissingMetadata;
  const stateDir = path.resolve(args.stateDir || '.takeout-upload-state');
  const includePattern = args.archive ? args.archive.toLowerCase() : null;

  await fsp.mkdir(stateDir, { recursive: true });
  const uploadedLog = path.join(stateDir, 'uploaded.jsonl');
  const failedLog = path.join(stateDir, 'failed.jsonl');
  const deferredLog = path.join(stateDir, 'deferred.jsonl');
  const doneZipsFile = path.join(stateDir, 'done-zips.txt');
  const metadataIndexFile = path.join(stateDir, 'metadata-index.json');

  const allZipFiles = (await fsp.readdir(inputDir))
    .filter((name) => name.toLowerCase().endsWith('.zip'))
    .filter((name) => (includePattern ? name.toLowerCase().includes(includePattern) : true))
    .sort()
    .map((name) => path.join(inputDir, name));

  if (!allZipFiles.length) {
    throw new Error(`No zip files found in ${inputDir}`);
  }

  const uploadedSet = await loadUploadedSet(uploadedLog);
  const doneZips = await loadDoneZips(doneZipsFile);

  let metadataIndex = {};
  if (args.rebuildIndex || !fs.existsSync(metadataIndexFile)) {
    metadataIndex = await buildMetadataIndex(allZipFiles, metadataIndexFile);
  } else {
    metadataIndex = await loadMetadataIndex(metadataIndexFile);
    console.log(`Loaded metadata index: ${Object.keys(metadataIndex).length} keys`);
    for (const zipPath of allZipFiles) {
      await mergeMetadataFromZip(zipPath, metadataIndex);
    }
    await saveMetadataIndex(metadataIndexFile, metadataIndex);
    console.log(`Updated metadata index: ${Object.keys(metadataIndex).length} keys`);
  }

  const s3 = new S3Client({ region });
  const tmpDir = path.join(os.tmpdir(), 'takeout-upload');
  await fsp.mkdir(tmpDir, { recursive: true });

  for (const zipPath of allZipFiles) {
    const zipName = path.basename(zipPath);
    if (doneZips.has(zipName)) {
      console.log(`Skipping already processed zip: ${zipName}`);
      continue;
    }

    console.log(`Processing zip: ${zipName}`);
    const entries = runUnzipList(zipPath);
    const mediaEntries = entries.filter(isMediaPath);
    let hasPendingOrFailed = false;

    for (const entryPath of mediaEntries) {
      const uploadId = `${zipName}::${entryPath}`;
      if (uploadedSet.has(uploadId)) {
        continue;
      }

      const ext = path.extname(entryPath) || '';
      const tmpFile = path.join(
        tmpDir,
        `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`,
      );

      try {
        await extractEntryToTemp(zipPath, entryPath, tmpFile);
        const candidates = sidecarCandidates(entryPath);
        const capturedAt = candidates.map((c) => metadataIndex[c]).find(Boolean);
        if (!capturedAt && requireMetadata) {
          hasPendingOrFailed = true;
          await appendJsonLine(deferredLog, {
            uploadId,
            status: 'deferred-missing-metadata',
            zipName,
            entryPath,
            deferredAt: new Date().toISOString(),
          });
          console.log(`Deferred (missing metadata): ${entryPath}`);
          continue;
        }

        const finalCapturedAt = capturedAt || toIsoUtc(new Date());
        const s3Key = buildS3Key({ prefix, owner, iso: finalCapturedAt, ext });
        const contentType = CONTENT_TYPE_BY_EXT[ext.toLowerCase()] || 'application/octet-stream';

        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: s3Key,
            StorageClass: storageClass,
            ContentType: contentType,
            Body: fs.createReadStream(tmpFile),
            Metadata: {
              source: 'google-takeout',
              owner,
              original_zip: zipName,
              original_entry: entryPath,
            },
          }),
        );

        await appendJsonLine(uploadedLog, {
          uploadId,
          status: 'success',
          zipName,
          entryPath,
          s3Key,
          capturedAt: finalCapturedAt,
          uploadedAt: new Date().toISOString(),
        });
        uploadedSet.add(uploadId);
        console.log(`Uploaded: ${entryPath} -> s3://${bucket}/${s3Key}`);
      } catch (error) {
        hasPendingOrFailed = true;
        await appendJsonLine(failedLog, {
          uploadId,
          status: 'failed',
          zipName,
          entryPath,
          error: error.message,
          failedAt: new Date().toISOString(),
        });
        console.error(`Failed: ${entryPath} (${error.message})`);
      } finally {
        await fsp.rm(tmpFile, { force: true });
      }
    }

    if (!hasPendingOrFailed) {
      await appendDoneZip(doneZipsFile, zipName);
    }

    if (deleteArchives && !hasPendingOrFailed) {
      await fsp.rm(zipPath, { force: true });
      console.log(`Deleted processed archive: ${zipName}`);
    } else if (hasPendingOrFailed) {
      console.log(
        `Keeping archive: ${zipName} (contains deferred/failed media that must be retried later)`,
      );
    }
  }

  console.log('Done.');
  console.log(`Uploaded log: ${uploadedLog}`);
  console.log(`Failed log: ${failedLog}`);
  console.log(`Deferred log: ${deferredLog}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
