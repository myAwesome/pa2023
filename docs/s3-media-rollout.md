# S3 Media Rollout (Shared Bucket, No DB)

## What is implemented

- New authenticated backend service: `GET /media` and `POST /media`
- `GET /media` lists media from S3 and returns presigned read URLs
- `POST /media` with `{ "action": "init-upload", ... }` returns presigned upload URL
- Existing UI photo views now read from `/media` instead of Google Photos API

## Key format

Objects are expected under:

`media/mmdd=MM-DD/owner=<userId>/ts=<ISO8601>_<uuid>.<ext>`

Example:

`media/mmdd=04-04/owner=1/ts=2024-04-04T19:13:00Z_9d9e...jpg`

## Backend config

`config/default.json` now includes:

- `media.bucket`
- `media.region`
- `media.prefix`
- `media.uploadStorageClass` (set to `GLACIER_IR` if you want to skip Standard)
- `media.getUrlTtlSeconds`
- `media.putUrlTtlSeconds`

For production, set:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (if different from config)

Optional for S3-compatible storage:

- `AWS_S3_ENDPOINT`
- `AWS_S3_FORCE_PATH_STYLE=true`

## API contract

### List media

`GET /media?date=<iso>&pageSize=24&pageToken=<token>`

Optional:

- `mmdd=04-04`
- `owner=<id>`
- `ranges=[{"start":"...","end":"..."}]`
- `onThisDay=true`

Response:

```json
{
  "mediaItems": [
    {
      "id": "media/mmdd=04-04/owner=1/ts=2024-04-04T19:13:00Z_x.jpg",
      "baseUrl": "https://...",
      "mediaMetadata": { "creationTime": "2024-04-04T19:13:00.000Z" }
    }
  ],
  "nextPageToken": "..."
}
```

### Init upload

`POST /media`

```json
{
  "action": "init-upload",
  "filename": "IMG_1234.jpg",
  "mimeType": "image/jpeg",
  "capturedAt": "2024-04-04T19:13:00Z",
  "owner": "1"
}
```

Response includes `uploadUrl` and final `key`.

## Migration from Google Photos

1. Export both users with Google Takeout (Google Photos).
2. Unpack archives locally.
3. For each file, determine capture time (EXIF first, fallback to sidecar metadata).
4. Build key in the format above.
5. Upload originals to S3 using your preferred script/tool.
6. Validate:
   - object count
   - total bytes
   - random checksum spot checks
7. Open diary entries and verify `/media?date=...` returns expected files.

## Next implementation slice

- Add Android native uploader app (WorkManager + MediaStore) for true background sync
- Add lifecycle policy: Standard -> Glacier Instant Retrieval after 30 days
- Add optional MIME/size validation before issuing upload URLs
