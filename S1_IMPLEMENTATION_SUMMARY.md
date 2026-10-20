# S1 File Storage Implementation - Complete Summary

**Status**: ✅ Complete and Tested  
**Date**: October 20, 2026  
**Branch**: `file-storage`

## What Was Built

We've successfully implemented **Storage Slice 1 (S1)** from the [file-storage-plan.md](./docs/file-storage-plan.md), which includes the foundational infrastructure for encrypted file storage supporting work-order photos, job files, and future use cases.

### 1. Storage Adapter (`packages/data/src/files/storage-adapter.ts`)

**Purpose**: Abstract S3-compatible storage for both local development (RustFS) and production (Railway Tigris).

**Features**:
- AWS SDK v3 S3Client wrapper
- Methods: `put()`, `get()`, `head()`, `delete()`
- Configurable via environment variables:
  - `OBJECT_STORAGE_ENDPOINT` (e.g., `http://127.0.0.1:59000`)
  - `OBJECT_STORAGE_BUCKET` (e.g., `salesmora-dev`)
  - `OBJECT_STORAGE_REGION` (default: `us-east-1`)
  - `OBJECT_STORAGE_ACCESS_KEY_ID`
  - `OBJECT_STORAGE_SECRET_ACCESS_KEY`
  - `OBJECT_STORAGE_URL_STYLE` (set to `path` for RustFS/Tigris)

**Usage**:
```typescript
const storage = createStorageAdapter(); // reads from env
await storage.put('workspace-id/file-id', { data: buffer, contentType: 'image/jpeg' });
const data = await storage.get('workspace-id/file-id');
```

### 2. Encryption (`packages/data/src/files/encryption.ts`)

**Purpose**: Application-level AES-256-GCM envelope encryption for files, independent of bucket encryption.

**Architecture**:
- **Master Key (KEK)**: Stored in `FILE_MASTER_KEY` env var (base64-encoded 32-byte key)
- **Per-File Key (DEK)**: Unique 32-byte key generated per file, encrypted with master key
- **Cipher**: AES-256-GCM for authenticated encryption

**Format**:
- **Database (encryptedDekB64)**: `[dekIv (16)][dekAuthTag (16)][encryptedKey (32)]` = 64 bytes, base64-encoded
- **Storage (object)**: `[fileIv (16)][fileAuthTag (16)][ciphertext...]`

**Functions**:
- `encryptFile(plaintext, optionalDek)`: Returns envelope with separate DEK and file components
- `decryptFile(envelope)`: Recovers plaintext using master key to unwrap DEK
- `generateDataEncryptionKey()`: Creates random 32-byte DEK
- `serializeDekEnvelope()` / `deserializeDekEnvelope()`: Database persistence
- `serializeFileCiphertext()` / `deserializeFileCiphertext()`: Storage serialization

**Round-Trip Example**:
```typescript
const envelope = encryptFile(buffer);
const dekEnvB64 = serializeDekEnvelope(envelope).toString('base64');
const ciphertext = serializeFileCiphertext(envelope);

// Store to DB: encryptedDekB64 = dekEnvB64
// Store to S3: ciphertext

// On download:
const envelope = {
  ...deserializeDekEnvelope(Buffer.from(storedDekEnvB64, 'base64')),
  ...deserializeFileCiphertext(s3Ciphertext),
};
const result = decryptFile(envelope); // plaintext!
```

### 3. Database Schema (`packages/data/src/migrations/202610200003_file_storage.ts`)

**Files Table**:
```sql
id (uuid PRIMARY KEY)
workspaceId (uuid, FK workspaces.id)
entityType (varchar, e.g. 'work-order', 'job')
entityId (uuid, FK to entity)
uploadedByUserId (text, FK users.id)
name (varchar)
mimeType (varchar)
sizeBytes (bigint)
status (enum: uploading, scanning, ready, failed)
scanStatus (varchar, NULL)
failureReason (text, NULL)
storageKey (varchar, S3 key path)
encryptedDekB64 (varchar, base64 DEK envelope)
categoryTag (varchar, NULL - 'before', 'after', 'other', etc.)
caption (text, NULL)
createdAt, updatedAt, deletedAt (timestamps)
```

**FileLinks Table**:
```sql
id (uuid PRIMARY KEY)
fileId (uuid, FK files.id ON DELETE CASCADE)
workspaceId (uuid, FK workspaces.id)
linkedEntityType (varchar, e.g. 'progress-note')
linkedEntityId (uuid)
createdAt (timestamp)
```

**FileEvents Table** (audit trail):
```sql
id (uuid PRIMARY KEY)
fileId (uuid, FK files.id)
workspaceId (uuid, FK workspaces.id)
actorId (text, FK users.id)
eventType (enum: created, ready, failed, downloaded, removed)
metadata (jsonb)
createdAt (timestamp)
```

**WorkspaceStorageUsage Table**:
```sql
workspaceId (uuid PRIMARY KEY, FK workspaces.id)
usedBytes (bigint)
quotaBytes (bigint) - 1GB (free), 10GB (standard), 25GB (premium)
lastReconciled (timestamp)
createdAt, updatedAt (timestamps)
```

### 4. File Store (`packages/data/src/files/store.ts`)

**Core Class**: `FileStore`

**Key Methods**:

#### `uploadFile(context, input)`
- Validates MIME type (images, PDFs, documents allowed)
- Enforces 10 MB file size limit
- Checks workspace storage quota
- Encrypts file with unique DEK
- Uploads ciphertext to S3
- Stores metadata and encrypted DEK in DB
- Records `created` event
- Updates `workspaceStorageUsage`
- Returns: `FileRecord`

**Example**:
```typescript
const file = await fileStore.uploadFile(context, {
  entityType: 'work-order',
  entityId: workOrderId,
  name: 'before-photo.jpg',
  mimeType: 'image/jpeg',
  data: jpegBuffer,
  categoryTag: 'before',
  caption: 'Foundation crack - before repair',
});
```

#### `downloadFile(context, fileId)`
- Retrieves encrypted file from S3
- Retrieves encrypted DEK from DB
- Decrypts using master key
- Validates file status is `ready`
- Records `downloaded` event
- Returns: plaintext `Buffer`

#### `removeFile(context, fileId)`
- Creates tombstone (soft delete) in DB
- Deletes ciphertext from S3
- Records `removed` event
- Updates usage quota

#### `listEntityFiles(context, entityType, entityId)`
- Returns all non-deleted files for an entity
- Sorted by creation date (newest first)

#### `getStorageUsage(trx, workspaceId)`
- Returns: `{ usedBytes, quotaBytes, percentUsed }`
- Initializes with free tier (1 GB) on first access

#### `markFileReady(trx, fileId)` / `markFileFailed(trx, fileId, reason)`
- Called by worker after scanning/processing
- Updates status and scanStatus
- Sets updatedAt

**Error Classes**:
- `FileStorageError`: General validation/operation errors
- `FileNotFoundError`: File doesn't exist
- `QuotaExceededError`: Workspace over quota
- `UnauthorizedFileAccessError`: Permission denied (stubbed for now)

### 5. Testing (`packages/data/src/files/store.rehearsal.ts`)

**Comprehensive Test Suite** against RustFS:

1. **Upload** - Create file, validate metadata, encrypt and store
2. **Mark Ready** - Simulate worker completion (no scanning yet in S1)
3. **Download** - Retrieve, decrypt, verify content matches
4. **List Files** - Query by entity
5. **Usage Tracking** - Verify quota accounting
6. **Remove** - Soft delete, cleanup, usage update

**Test Output**:
```
Test 1: Uploading a file to RustFS...
✓ File uploaded: [uuid]
  - Name: test-file.txt
  - Size: 28 bytes
  - Status: uploading

Test 2: Marking file as ready...
✓ File marked as ready

Test 3: Downloading the file from RustFS...
✓ File downloaded and decrypted successfully
  - Content matches original: true

Test 4: Listing entity files...
✓ Found 1 file(s)
  - test-file.txt (28 bytes)

Test 5: Checking storage usage...
✓ Storage usage: 28 / 1073741824 bytes (0%)

Test 6: Removing the file...
✓ File removed

✅ All rehearsal tests passed!
```

**Run Tests**:
```bash
pnpm --filter @salesmora/data test:files
```

## Environment Setup

### Local Development

RustFS is running in Docker (via `compose.yaml`):
```bash
docker compose --env-file .env.local up
```

**RustFS Configuration in .env.local**:
```
OBJECT_STORAGE_ENDPOINT=http://127.0.0.1:59000
OBJECT_STORAGE_BUCKET=salesmora-dev
OBJECT_STORAGE_REGION=us-east-1
OBJECT_STORAGE_ACCESS_KEY_ID=localfa27960cf40bcbd5
OBJECT_STORAGE_SECRET_ACCESS_KEY=04d809375f6f91a89536127664cc541dcf607d3c072fa086
OBJECT_STORAGE_URL_STYLE=path
FILE_MASTER_KEY=7SRWiz4NU4I4rKZu8zTU3M5V4jH4Z4avjAA8yaz08Cw=
```

### Production (Railway)

Will use Tigris bucket credentials:
- Separate buckets per environment (staging, production)
- Credentials via Railway service variables
- Same adapter code, no changes needed

## Dependencies Added

```json
{
  "@aws-sdk/client-s3": "^3.600.0"
}
```

Total AWS SDK bundle is ~2 MB, lazy-loaded by S3 adapter.

## Next Steps (S2-S6)

| Slice | What | Status |
|-------|------|--------|
| **S0** | RustFS setup, env vars, migrations | ✅ Complete |
| **S1** | Adapter, encryption, DB, store, rehearsal | ✅ Complete |
| **S2** | Worker: scan (ClamAV), thumbnails, HEIC→JPEG, orphan sweeper | Pending |
| **S3** | Wire UI: WorkOrderPhotos, JobFiles, lightbox, remove dialog, history | Pending |
| **S4** | Quotas, 80%/100% warnings, Billing usage card | Pending |
| **S5** | DR copies, restore drill, deletion integration | Pending |
| **S6** | Assistant read tools, other consumers (materials, customers, etc.) | Pending |

## Files Changed

### Created
- `packages/data/src/files/storage-adapter.ts` - S3 client wrapper
- `packages/data/src/files/encryption.ts` - AES-256-GCM encryption
- `packages/data/src/files/store.ts` - FileStore business logic
- `packages/data/src/files/store.rehearsal.ts` - Test suite
- `packages/data/src/migrations/202610200003_file_storage.ts` - DB schema

### Modified
- `packages/data/package.json` - Added `@aws-sdk/client-s3`, added `test:files` script
- `packages/data/src/index.ts` - Export file storage API

## Verification

✅ **All tests pass**:
```
pnpm --filter @salesmora/data test:files
```

✅ **Build succeeds**:
```
pnpm --filter @salesmora/data build
```

✅ **Migrations run**:
```
pnpm db:migrate
pnpm --filter @salesmora/data migrate -- --test
```

✅ **RustFS integration working**:
- Bucket created: `salesmora-dev`
- Files encrypted and uploaded
- Files retrieved and decrypted
- Round-trip encryption verified

---

**Ready for S2 (worker implementation) and S3 (UI wiring).**
