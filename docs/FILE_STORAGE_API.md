# File Storage API - Developer Guide

## Overview

The file storage system provides encrypted file upload, storage, download, and lifecycle management. All files are encrypted at the application level using AES-256-GCM before being sent to object storage.

## Quick Start

### Basic Upload + Download

```typescript
import { createDatabase, createStorageAdapter, createFileStore } from '@salesmora/data';

const db = createDatabase();
const storage = createStorageAdapter(); // reads env vars
const fileStore = await createFileStore(db, storage);

// Upload
const file = await fileStore.uploadFile(
  { userId, workspaceId, permissions: {} },
  {
    entityType: 'work-order',
    entityId: workOrderId,
    name: 'site-photo.jpg',
    mimeType: 'image/jpeg',
    data: jpegBuffer,
    categoryTag: 'before',
    caption: 'Damage location',
  }
);
console.log(file.id); // unique file ID

// Mark as ready (after worker processing)
await db.transaction(async (trx) => {
  await fileStore.markFileReady(trx, file.id);
});

// Download
const plaintext = await fileStore.downloadFile(
  { userId, workspaceId, permissions: {} },
  file.id
);

// Remove
await fileStore.removeFile(
  { userId, workspaceId, permissions: {} },
  file.id
);
```

## API Reference

### FileStore

```typescript
class FileStore {
  async uploadFile(
    context: AuthorizationContext,
    input: UploadFileInput
  ): Promise<FileRecord>

  async downloadFile(
    context: AuthorizationContext,
    fileId: string
  ): Promise<Buffer>

  async removeFile(
    context: AuthorizationContext,
    fileId: string
  ): Promise<void>

  async listEntityFiles(
    context: AuthorizationContext,
    entityType: string,
    entityId: string
  ): Promise<FileRecord[]>

  async getStorageUsage(
    db: Knex,
    workspaceId: string
  ): Promise<StorageUsage>

  async markFileReady(trx: Knex.Transaction, fileId: string): Promise<void>
  async markFileFailed(trx: Knex.Transaction, fileId: string, reason: string): Promise<void>
}
```

### Types

#### AuthorizationContext
```typescript
{
  userId: string;           // Current user ID
  workspaceId: string;      // Workspace being accessed
  permissions: Record<string, { allowed: boolean }>;
}
```

#### UploadFileInput
```typescript
{
  entityType: string;       // e.g., 'work-order', 'job', 'progress-note'
  entityId: string;         // UUID of the entity
  name: string;             // Original filename (e.g., 'photo.jpg')
  mimeType: string;         // MIME type (validated)
  data: Buffer;             // File contents (max 10 MB)
  categoryTag?: string;     // e.g., 'before', 'after', 'other', 'document'
  caption?: string;         // User description
}
```

#### FileRecord
```typescript
{
  id: string;               // UUID, opaque file ID
  workspaceId: string;
  entityType: string;
  entityId: string;
  uploadedByUserId: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  status: 'uploading' | 'scanning' | 'ready' | 'failed';
  scanStatus: string | null;
  failureReason: string | null;
  categoryTag: string | null;
  caption: string | null;
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601
}
```

#### StorageUsage
```typescript
{
  usedBytes: number;        // Current workspace usage
  quotaBytes: number;       // Workspace plan limit
  percentUsed: number;      // 0-100
}
```

### StorageAdapter

Low-level S3-compatible interface (usually not needed directly):

```typescript
class StorageAdapter {
  async put(key: string, object: { data: Buffer; contentType?: string; metadata?: Record<string, string> }): Promise<void>
  async get(key: string): Promise<Buffer>
  async head(key: string): Promise<{ size: number; contentType?: string; lastModified?: Date }>
  async delete(key: string): Promise<void>
  close(): void
}
```

### Encryption (Internal)

Encrypt/decrypt operations (typically handled by FileStore automatically):

```typescript
// Encrypt a file
const envelope = encryptFile(plaintext, optionalDek);
// envelope.dekIv, dekAuthTag, encryptedDek, fileIv, fileAuthTag, ciphertext

// Serialize for storage
const dekBytes = serializeDekEnvelope(envelope);     // Store in DB as base64
const ciphertext = serializeFileCiphertext(envelope); // Store in S3

// On download, reconstruct and decrypt
const envelope = {
  ...deserializeDekEnvelope(Buffer.from(storedDekEnvB64, 'base64')),
  ...deserializeFileCiphertext(s3Data),
};
const { plaintext, dek } = decryptFile(envelope);
```

## File Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│ UPLOADING (user can't download until ready)                 │
├─────────────────────────────────────────────────────────────┤
│ 1. Client calls uploadFile()                                │
│ 2. Server encrypts with unique DEK                          │
│ 3. Ciphertext uploaded to S3                                │
│ 4. Metadata + encrypted DEK stored in DB                    │
│ 5. File status = 'uploading', scanStatus = NULL             │
│ 6. 'created' event recorded                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ SCANNING (worker processes file)                            │
├─────────────────────────────────────────────────────────────┤
│ 1. Worker picks up 'uploading' status                       │
│ 2. Retrieves and decrypts file                              │
│ 3. Runs ClamAV malware scan                                 │
│ 4. Generates thumbnail                                      │
│ 5. Converts HEIC→JPEG if needed                             │
│ 6. File status = 'scanning', scanStatus = 'scanning'        │
└─────────────────────────────────────────────────────────────┘
                          ↓
          ┌───────────────┴───────────────┐
          ↓                               ↓
    ┌─────────────┐            ┌──────────────────┐
    │ READY       │            │ FAILED           │
    │ (clean)     │            │ (infected/error) │
    ├─────────────┤            ├──────────────────┤
    │ status=     │            │ status='failed'  │
    │ 'ready'     │            │ scanStatus=      │
    │ scanStatus= │            │ 'infected'|      │
    │ 'clean'     │            │ 'failed'         │
    │ User can    │            │ failureReason=   │
    │ download    │            │ "details..."     │
    └─────────────┘            └──────────────────┘
          ↓                              ↓
    ┌─────────────────────────────────────────────┐
    │ User calls removeFile()                      │
    │ 1. Mark deletedAt (tombstone)                │
    │ 2. Delete from S3                           │
    │ 3. Record 'removed' event                    │
    │ 4. Update usage quota                       │
    └─────────────────────────────────────────────┘
```

## Environment Variables

### Required
```bash
# Storage endpoint
OBJECT_STORAGE_ENDPOINT=http://127.0.0.1:59000  # Local: RustFS, Production: Railway

# Bucket configuration
OBJECT_STORAGE_BUCKET=salesmora-dev
OBJECT_STORAGE_REGION=us-east-1
OBJECT_STORAGE_ACCESS_KEY_ID=...
OBJECT_STORAGE_SECRET_ACCESS_KEY=...
OBJECT_STORAGE_URL_STYLE=path

# Encryption master key (32 bytes, base64)
FILE_MASTER_KEY=7SRWiz4NU4I4rKZu8zTU3M5V4jH4Z4avjAA8yaz08Cw=
```

### Optional (for dev/test)
```bash
TEST_DATABASE_URL=postgresql://.../_test  # For rehearsal tests
```

## Error Handling

```typescript
import {
  FileStorageError,
  FileNotFoundError,
  QuotaExceededError,
  UnauthorizedFileAccessError,
} from '@salesmora/data';

try {
  await fileStore.uploadFile(context, input);
} catch (error) {
  if (error instanceof QuotaExceededError) {
    // Show "Storage full" UI
  } else if (error instanceof FileStorageError) {
    // Validation error: invalid type, too large
  } else {
    // Network or DB error
  }
}

try {
  await fileStore.downloadFile(context, fileId);
} catch (error) {
  if (error instanceof FileNotFoundError) {
    // File doesn't exist or is deleted
  } else if (error instanceof UnauthorizedFileAccessError) {
    // User doesn't have permission (S2+)
  }
}
```

## Quotas

Files consume workspace storage quota:

```typescript
const usage = await fileStore.getStorageUsage(db, workspaceId);
console.log(`Using ${usage.usedBytes} of ${usage.quotaBytes} bytes`);

if (usage.percentUsed > 80) {
  // Show warning banner
}

if (usage.percentUsed >= 100) {
  // Reject new uploads with "quota full" error
  // Existing files remain downloadable
}
```

Quotas by plan:
- **Free**: 1 GB
- **Standard**: 10 GB
- **Premium**: 25 GB

Thumbnails and DR copies (S5) do NOT count toward user quota.

## Allowed File Types

```
Images:
  - image/jpeg
  - image/png
  - image/webp
  - image/gif

Documents:
  - application/pdf
  - application/msword
  - application/vnd.openxmlformats-officedocument.wordprocessingml.document
  - application/vnd.ms-excel
  - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
  - text/plain (for testing)
```

## Encryption Details

### Key Material

- **Master Key (KEK)**: 32 bytes, base64-encoded in `FILE_MASTER_KEY`
- **Data Key (DEK)**: 32 bytes, randomly generated per file
- **Cipher**: AES-256-GCM with authenticated encryption

### No Key Rotation (S1)

S1 is the MVP. Key rotation is deferred to future slices (S5+).

All files encrypted with current master key. When master key changes:
1. Decrypt all active files with old key
2. Re-encrypt with new key
3. Update database

This is a maintenance task, not user-facing.

### DEK Storage

The encrypted DEK is stored in the database so:
- We can decrypt files without querying S3 metadata
- The S3 object is just ciphertext (no key material exposed)
- DEK is protected by master key (in Railway secrets)

## Testing

### Run Full Test Suite
```bash
pnpm --filter @salesmora/data test:files
```

### Isolated Test Database
Tests use `TEST_DATABASE_URL` which must:
- Point to a dedicated PostgreSQL database (ends in `_test`)
- Be isolated from production and local dev database
- Auto-run migrations before tests

### Extend Tests

Add new test cases in `packages/data/src/files/store.rehearsal.ts`:

```typescript
// Test large file
const largeData = Buffer.alloc(9 * 1024 * 1024); // 9 MB
const file = await fileStore.uploadFile(context, {
  entityType: 'job',
  entityId: jobId,
  name: 'large.pdf',
  mimeType: 'application/pdf',
  data: largeData,
});

// Test quota enforcement
// ...
```

## Next: Integration with Routes (S1 → Web API)

In `apps/web/app/api/files/`, implement:

### POST /api/files/upload
```typescript
// Multipart form-data with field 'file' + metadata
// Returns: { fileId, uploadUrl?, ... }
```

### GET /api/files/:id/download
```typescript
// Returns: file content with Content-Disposition
// Sets: Cache-Control: private, no-store; X-Content-Type-Options: nosniff
```

### DELETE /api/files/:id
```typescript
// Removes file, returns 204
```

### GET /api/files/entity/:type/:id
```typescript
// Lists files for entity, returns: FileRecord[]
```

### GET /api/workspace/storage/usage
```typescript
// Returns: { usedBytes, quotaBytes, percentUsed }
```

---

**For S1 → S2 Integration**: See worker implementation roadmap in [file-storage-plan.md § S2](./docs/file-storage-plan.md#8-delivery-slices).
