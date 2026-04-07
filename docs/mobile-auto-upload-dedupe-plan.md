# Mobile Auto Upload Plan (Android + S3, TS Keys, No DB)

## Goal
- Build Android auto-upload similar to Google Photos behavior.
- Keep existing migrated S3 key format based on timestamp/date.
- Add duplicate detection without introducing a database.

## Constraints
- Shared S3 bucket for 2 users.
- Existing migrated objects already use `ts` key naming.
- Backend remains stateless; persistence lives in S3 objects.

## Current Key Strategy (Keep As-Is)
- Media object key:
  - `media/date=YYYY-MM-DD/owner=<ownerId>/ts=<ISO8601>_<uuid>.<ext>`
- Do not rename already migrated objects.
- Do not require hash-in-key for new uploads.

## Dedupe Strategy (New)
- Use S3-based dedupe index objects keyed by SHA-256:
  - `media-index/v1/owner=<ownerId>/sha256/<first2>/<sha256>.json`
- Dedupe marker payload:
```json
{
  "sha256": "hex",
  "sizeBytes": 1234567,
  "mimeType": "image/jpeg",
  "canonicalMediaKey": "media/date=2026-04-07/owner=1/ts=2026-04-07T10:12:03Z_x.jpg",
  "createdAt": "2026-04-07T10:12:20Z",
  "source": "android|takeout|web",
  "owner": "1"
}
```
- Duplicate rule:
  - Primary: exact `sha256`.
  - Optional safety check: `sizeBytes` must match marker value.

## Backend API Contract (v1)
- `POST /media` action: `init-upload`
  - Input: `owner`, `filename`, `contentType`, `sizeBytes`, `capturedAt`, `sha256`
  - Behavior:
    - Check dedupe marker by owner + sha256.
    - If marker exists: return `{ duplicate: true, existingKey }`.
    - If not: return `{ duplicate: false, uploadUrl, key, method: "PUT" }`.
- `POST /media` action: `complete-upload`
  - Input: `key`, `owner`, `sha256`, `sizeBytes`, `contentType`, `capturedAt`
  - Behavior:
    - Verify object exists.
    - Write dedupe marker (idempotent put).
    - Return success.
- `POST /media` action: `fail-upload` (optional)
  - Input: `key`, `reason`.
  - Behavior: log only (no state mutation required).

## Android App Plan
- Stack: native Android (Kotlin), WorkManager, Room.
- Discovery:
  - MediaStore initial scan.
  - ContentObserver for new items.
- Upload queue item fields:
  - `localUri`, `size`, `mime`, `dateTaken`, `sha256`, `status`, `attempts`, `lastError`.
- Upload flow:
  1. Read file metadata from MediaStore.
  2. Compute SHA-256 (streaming).
  3. Call `init-upload`.
  4. If duplicate: mark synced locally.
  5. Else PUT file to presigned URL.
  6. Call `complete-upload`.
  7. Mark synced locally.
- Background behavior:
  - WorkManager periodic + one-time work.
  - Constraints: network required; optional wifi/charging toggles.
  - Foreground service for large batches/videos.

## Migration Awareness Plan
- One-time S3 backfill job for migrated media:
  1. List `media/date=*/owner=*/ts=*`.
  2. Stream object, compute SHA-256.
  3. Write dedupe marker if missing.
- Result:
  - Android app can immediately detect duplicates against migrated content.

## Idempotency + Concurrency Rules
- `init-upload` can be called repeatedly for same file.
- `complete-upload` must be idempotent.
- Dedupe marker write should be "first writer wins", same canonical key acceptable.
- If duplicate marker appears between init and complete:
  - Keep uploaded object or schedule cleanup job; do not fail user flow.

## Security
- Auth required on all `/media` actions.
- Owner isolation in index paths and media prefixes.
- Presigned upload URL TTL: short (e.g., 10 minutes).
- Validate `contentType` and max file size before URL issuance.

## Observability
- Structured logs for:
  - init duplicate hit/miss,
  - upload complete,
  - marker write success/fail,
  - android retry causes.
- Counters:
  - uploads attempted/succeeded,
  - duplicate skips,
  - average upload duration.

## Rollout Phases
- Phase 1: Backend dedupe contract + index writer.
- Phase 2: Backfill hashes for migrated objects.
- Phase 3: Android MVP uploader (manual trigger + background worker).
- Phase 4: Auto-detect + reliability tuning (battery/network constraints).

## First Implementation Checklist
- Add backend actions:
  - `init-upload`, `complete-upload`.
- Add helper in server media service:
  - `getDedupeMarker(owner, sha256)`, `putDedupeMarker(...)`.
- Add script:
  - `scripts/backfill-s3-hash-index.js`.
- Add Android app skeleton repo/module:
  - MediaStore scan,
  - SHA-256 utility,
  - upload worker + queue storage.

