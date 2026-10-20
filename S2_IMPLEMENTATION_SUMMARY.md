# S2 File Processing Worker Implementation

**Status**: ✅ Complete (S2a: thumbnails + HEIC conversion, mock scanning)  
**Date**: October 20, 2026  
**Scope**: Worker service that processes uploaded files: generates thumbnails, converts HEIC to JPEG, mock-scans for malware  

## Architecture

The file processing worker runs as part of the existing worker service (`apps/worker`), integrated with BullMQ for task queuing. It processes files in two concurrent tasks:

1. **File Processing Loop** (every 5 seconds)
   - Retrieves files in `uploading` or `scanning` status
   - Generates WebP thumbnails for images
   - Converts HEIC/HEIF to JPEG
   - Mock-scans for malware (TODO: integrate ClamAV in S2b)
   - Marks file as `ready` or `failed`

2. **Orphan Sweeper** (every 1 hour)
   - Cleans up files stuck in `uploading` state >24 hours
   - Cleans up files stuck in `scanning` state >2 hours
   - Deletes from storage, tombstones in DB

## Implementation Details

### Files Created

#### `packages/data/src/files/thumbnail-processor.ts` (84 lines)
Image processing using sharp library:
- `generateThumbnail(imageBytes, options)` → WebP thumbnail
- `convertHeicToJpeg(heicBytes)` → JPEG version
- `isHeic(imageBytes)` → detect HEIC format
- `isProcessableImage(fileBytes)` → detect image format

Key features:
- Auto-rotates based on EXIF metadata
- Returns `null` on non-images or processing errors
- Generates WebP thumbnails at 256×256 (cover fit, no upscale)
- Converts HEIC at 90% quality progressive JPEG

#### `packages/data/src/migrations/202610200004_add_file_processing.ts` (41 lines)
Adds columns to `files` table for processing results:
```sql
ALTER TABLE files ADD COLUMN:
  - thumbnailStorageKey (string, nullable)
  - thumbnailEncryptedDekB64 (string, nullable)
  - thumbnailSizeBytes (bigint, nullable)
  - heicOriginalStorageKey (string, nullable)
  - heicOriginalEncryptedDekB64 (string, nullable)
```

#### `packages/data/src/files/store.ts` (extended)
New methods on FileStore class:
- `storeThumbnail(trx, fileId, thumbnailBytes)` → encrypts and stores thumbnail
- `storeHeicOriginal(trx, fileId, heicBytes)` → encrypts and stores HEIC original
- `getFileForProcessing(fileId)` → retrieves file record
- `getFilesForProcessing(statuses, limit)` → batch retrieve files to process

All encryption uses the same DEK/KEK envelope system as main files.

#### `apps/worker/src/file-processing.ts` (155 lines)
Core worker logic:
- `processFileForStorage(db, storage, fileId)` → process single file
  - Retrieves encrypted file from S3
  - Detects if image
  - Generates thumbnail (if image)
  - Detects HEIC and converts (if image)
  - Mock-scans (100ms delay, TODO ClamAV)
  - Marks ready or failed
  - Records results in DB

- `sweepOrphanedFiles(db, storage)` → clean up stuck files
  - Deletes from S3
  - Tombstones in DB
  - Returns { cleaned, failed }

#### `apps/worker/src/file-processing-queue.ts` (48 lines)
Integration with worker service:
- `startFileProcessing(db)` → starts processing loops
- File processing tick every 5 seconds (max 10 files/batch)
- Orphan sweep every 1 hour
- Returns stop function for graceful shutdown

#### `apps/worker/src/file-processing-simple.test.ts` (112 lines)
Thumbnail processor tests:
- JPEG image detection ✓
- Thumbnail generation ✓
- HEIC detection ✓
- Non-image rejection ✓

### Integration Points

**Worker index.ts**
- Added `startFileProcessing(db)` to main startup
- Added `files` table check to migrations verification
- Integrated into shutdown sequence

**Data package exports**
- Exports: `generateThumbnail`, `convertHeicToJpeg`, `isHeic`, `isProcessableImage`, `ThumbnailOptions`

**Database**
- Uses existing file encryption/storage infrastructure
- Stores DEK + ciphertext for thumbnails and HEIC backups
- Uses same workspace/user authorization model (for S3+: future integration)

## Encryption & Security

**Thumbnail encryption**:
- Each thumbnail encrypted with a unique DEK (data encryption key)
- DEK encrypted with master KEK (key encryption key)
- IV, Auth Tag, encrypted key stored in DB as base64
- Ciphertext stored in S3 (path: `{storageKey}-thumbnail`)

**HEIC original encryption**:
- Same envelope encryption as thumbnails
- Stored at `{storageKey}-heic-original`
- Kept for audit/restore (can be deleted later if needed)

**Storage isolation**:
- Each workspace's files are isolated by workspace ID
- File IDs are random UUIDs (opaque, no pattern)
- Storage keys derived from file IDs (no directory structure)

## File Status Lifecycle

```
uploading (initial)
    ↓
[worker processes]
    ↓
ready (success) OR failed (error)
```

Duration expectations:
- `uploading` → `ready`: typically <5 seconds (next tick)
- `uploading` → `failed`: immediately if validation fails

Stuck file cleanup (orphan sweeper):
- `uploading` >24h → tombstone + delete from S3
- `scanning` >2h → tombstone + delete from S3

## Testing

Run thumbnail processor tests:
```bash
pnpm -C apps/worker test:file-processing
```

Expected output:
```
[S2 Worker Test] Starting thumbnail processor test...
✓ JPEG detected as processable image
✓ Thumbnail generated (44 bytes)
✓ JPEG correctly not detected as HEIC
✓ Text data correctly rejected as non-image
[S2 Worker Test] All thumbnail processor tests passed! ✓
```

## Configuration

**Environment variables** (inherited from S1):
- `FILE_MASTER_KEY` - Base64-encoded 32-byte key for DEK encryption
- `OBJECT_STORAGE_ENDPOINT` - S3-compatible storage endpoint
- `OBJECT_STORAGE_BUCKET` - Bucket name
- `OBJECT_STORAGE_REGION` - AWS region
- `OBJECT_STORAGE_ACCESS_KEY_ID` - Access key
- `OBJECT_STORAGE_SECRET_ACCESS_KEY` - Secret key

**Processing parameters** (hardcoded, can be config later):
- Thumbnail size: 256×256 px
- Thumbnail format: WebP @ 80% quality
- JPEG output: 90% quality, progressive
- File processing batch: 10 files/tick
- Processing interval: 5 seconds
- Orphan sweep interval: 1 hour
- Uploading timeout: 24 hours
- Scanning timeout: 2 hours

## Next Steps (S2b: Malware Scanning)

For S2b, replace mock scan with real ClamAV integration:

1. Add ClamAV container to docker-compose.yml
2. Add `node-clamscan` npm package
3. Replace mock scan (line ~68 in file-processing.ts) with:
   ```typescript
   const scanner = new NodeClam().init({ clamdscan: { host: 'clamd', port: 3310 } });
   const { isInfected } = await scanner.scanBuffer(encryptedData);
   if (isInfected) {
     await store.markFileFailed(trx, fileId, 'Malware detected');
     return result; // { success: false, ... }
   }
   ```
4. Update file `scanStatus` field (currently always 'clean')
5. Add event logging for infected files
6. Add Slack/webhook alert on infection

Estimated effort: 2-3 hours

## Assumptions & Decisions

**Mock scanning instead of real ClamAV**:
- Reason: S1 focus was storage + encryption, S2a focuses on image processing
- Allows separate S2b task to add security scanning
- Tests can verify the processing pipeline without ClamAV dependency
- Malware detection is non-critical for MVP (security scanning can be added later)

**Thumbnails not stored separately from main file**:
- Thumbnails stored in S3 at `{fileId}-thumbnail` key
- Metadata (encrypted DEK) stored in DB with main file record
- Enables independent thumbnail retrieval/deletion

**HEIC conversion stores original**:
- Main file record stays as HEIC
- Original HEIC stored at `{fileId}-heic-original` for audit
- Future decision: replace main file with JPEG version or keep HEIC as primary

**WebP thumbnails for web delivery**:
- Sharp outputs WebP by default (smaller, modern browser support)
- Falls back to JPEG in image processors that don't support WebP
- Can be configured to output JPEG if needed

**Orphan sweeper runs hourly, not on-demand**:
- Reason: Prevents database churn and S3 API costs
- Stuck files are rare edge case (network failures, process crashes)
- 1-hour resolution is acceptable for cleanup delay

## Known Limitations (Future Work)

1. **ClamAV integration** (S2b)
   - Currently mock-scans with 100ms delay
   - Real ClamAV needed for production

2. **Thumbnail MIME type**
   - WebP thumbnails may not be recognized by all clients
   - Consider JPEG fallback for compatibility

3. **HEIC/HEIF conversion decision**
   - Currently keeps original HEIC in main record
   - Should decide: replace main file or keep both?

4. **Batch size hardcoded**
   - 10 files per batch, 5-second interval
   - May need tuning based on image size and server capacity

5. **No progress tracking**
   - Long files may appear stuck during thumbnail generation
   - Could add progress events/webhooks in future

6. **Thumbnail customization**
   - Single 256×256 size
   - Could support multiple sizes (thumb, preview, full)
   - Could support per-file thumbnail options

## Deployment Checklist

- [x] Migrations created and tested locally
- [x] Encryption/storage adapter working
- [x] Thumbnail processor unit tested
- [x] Worker integration tested
- [x] Orphan sweeper logic verified
- [ ] Production config (Railway)
- [ ] ClamAV integration (S2b)
- [ ] Monitoring/logging (S3+)
- [ ] Performance testing with real images
- [ ] A/B test thumbnail generation on prod subset

## References

- `docs/file-storage-plan.md` § S2 - Requirements and design
- [Sharp documentation](https://sharp.pixelplumbing.com/)
- BullMQ worker pattern (similar to retention, account deletion)
- File encryption envelope format (S1 implementation)
