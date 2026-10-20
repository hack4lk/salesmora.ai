import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';
import { encryptFile, decryptFile, generateDataEncryptionKey, generateFileId, serializeDekEnvelope, deserializeDekEnvelope, serializeFileCiphertext, deserializeFileCiphertext } from './encryption';
import { StorageAdapter } from './storage-adapter';

// Use the contracts types which are more complete
type AuthorizationContext = { userId: string; workspaceId: string; permissions: Record<string, { allowed: boolean }> };
type PermissionId = string;

export class FileStorageError extends Error {}
export class FileNotFoundError extends FileStorageError {}
export class QuotaExceededError extends FileStorageError {}
export class UnauthorizedFileAccessError extends AuthorizationAccessError {}

const ALLOWED_MIME_TYPES = [
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const DEFAULT_QUOTAS_BY_PLAN: Record<string, bigint> = {
  free: BigInt(1024 * 1024 * 1024), // 1 GB
  standard: BigInt(10 * 1024 * 1024 * 1024), // 10 GB
  premium: BigInt(25 * 1024 * 1024 * 1024), // 25 GB
};

interface FileRow {
  id: string;
  workspaceId: string;
  entityType: string;
  entityId: string;
  uploadedByUserId: string;
  name: string;
  mimeType: string;
  sizeBytes: bigint;
  status: 'uploading' | 'scanning' | 'ready' | 'failed';
  scanStatus: string | null;
  failureReason: string | null;
  storageKey: string;
  encryptedDekB64: string;
  categoryTag: string | null;
  caption: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface FileRecord {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface UploadFileInput {
  entityType: string;
  entityId: string;
  name: string;
  mimeType: string;
  data: Buffer;
  categoryTag?: string;
  caption?: string;
}

export interface StorageUsage {
  usedBytes: number;
  quotaBytes: number;
  percentUsed: number;
}

function dto(row: FileRow): FileRecord {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    entityType: row.entityType,
    entityId: row.entityId,
    uploadedByUserId: row.uploadedByUserId,
    name: row.name,
    mimeType: row.mimeType,
    sizeBytes: Number(row.sizeBytes),
    status: row.status,
    scanStatus: row.scanStatus,
    failureReason: row.failureReason,
    categoryTag: row.categoryTag,
    caption: row.caption,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class FileStore {
  constructor(private db: Knex, private storage: StorageAdapter) {}

  async uploadFile(
    context: AuthorizationContext,
    input: UploadFileInput,
  ): Promise<FileRecord> {
    return await this.db.transaction(async (trx) => {
      // Validate file
      if (!ALLOWED_MIME_TYPES.includes(input.mimeType)) {
        throw new FileStorageError(`File type ${input.mimeType} is not allowed`);
      }

      if (input.data.length > MAX_FILE_SIZE) {
        throw new FileStorageError(`File size exceeds 10 MB limit`);
      }

      // Check quota
      const usage = await this.getStorageUsage(trx, context.workspaceId);
      const newUsedBytes = usage.usedBytes + input.data.length;
      if (newUsedBytes > usage.quotaBytes) {
        throw new QuotaExceededError('Workspace storage quota exceeded');
      }

      // Generate file ID and encryption key
      const fileId = generateFileId();
      const dek = generateDataEncryptionKey();

      // Encrypt the file
      const envelope = encryptFile(input.data, dek);
      const storedDekEnvelope = serializeDekEnvelope(envelope);
      const storedCiphertext = serializeFileCiphertext(envelope);
      const encryptedDekB64 = storedDekEnvelope.toString('base64');

      // Upload to storage
      const storageKey = `${context.workspaceId}/${fileId}`;
      await this.storage.put(storageKey, {
        data: storedCiphertext,
        contentType: 'application/octet-stream',
        metadata: {
          workspaceId: context.workspaceId,
          fileId: fileId,
        },
      });

      // Create file record
      const file: FileRow = {
        id: fileId,
        workspaceId: context.workspaceId,
        entityType: input.entityType,
        entityId: input.entityId,
        uploadedByUserId: context.userId,
        name: input.name,
        mimeType: input.mimeType,
        sizeBytes: BigInt(input.data.length),
        status: 'uploading',
        scanStatus: null,
        failureReason: null,
        storageKey: storageKey,
        encryptedDekB64: encryptedDekB64,
        categoryTag: input.categoryTag ?? null,
        caption: input.caption ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      await trx('files').insert(file);

      // Record event
      await trx('fileEvents').insert({
        id: randomUUID(),
        fileId: fileId,
        workspaceId: context.workspaceId,
        actorId: context.userId,
        eventType: 'created',
        metadata: { name: input.name, sizeBytes: input.data.length },
        createdAt: new Date(),
      });

      // Update usage
      await trx('workspaceStorageUsage')
        .where({ workspaceId: context.workspaceId })
        .update({ usedBytes: newUsedBytes });

      return dto(file);
    });
  }

  async downloadFile(
    context: AuthorizationContext,
    fileId: string,
  ): Promise<Buffer> {
    return await this.db.transaction(async (trx) => {
      // Get file record
      const row = (await trx('files')
        .where({ id: fileId, workspaceId: context.workspaceId, deletedAt: null })
        .first()) as FileRow | undefined;

      if (!row) {
        throw new FileNotFoundError('File not found');
      }

      // Check file is ready
      if (row.status !== 'ready') {
        throw new FileStorageError(`Cannot download file in ${row.status} status`);
      }

      // Retrieve from storage
      const encryptedData = await this.storage.get(row.storageKey);
      const { fileIv, fileAuthTag, ciphertext } = deserializeFileCiphertext(encryptedData);
      const { dekIv, dekAuthTag, encryptedDek } = deserializeDekEnvelope(Buffer.from(row.encryptedDekB64, 'base64'));

      const envelope = {
        dekIv,
        dekAuthTag,
        encryptedDek,
        fileIv,
        fileAuthTag,
        ciphertext,
      };

      const result = decryptFile(envelope);

      // Record download event
      await trx('fileEvents').insert({
        id: randomUUID(),
        fileId: fileId,
        workspaceId: context.workspaceId,
        actorId: context.userId,
        eventType: 'downloaded',
        metadata: { ipAddress: null },
        createdAt: new Date(),
      });

      return result.plaintext;
    });
  }

  async removeFile(
    context: AuthorizationContext,
    fileId: string,
  ): Promise<void> {
    return await this.db.transaction(async (trx) => {
      // Get file record
      const row = (await trx('files')
        .where({ id: fileId, workspaceId: context.workspaceId, deletedAt: null })
        .first()) as FileRow | undefined;

      if (!row) {
        throw new FileNotFoundError('File not found');
      }

      // Mark as deleted (tombstone)
      await trx('files').where({ id: fileId }).update({ deletedAt: new Date() });

      // Delete from storage
      try {
        await this.storage.delete(row.storageKey);
      } catch {
        // Log but don't fail if storage deletion fails
        console.error(`Failed to delete file ${fileId} from storage`);
      }

      // Record event
      await trx('fileEvents').insert({
        id: randomUUID(),
        fileId: fileId,
        workspaceId: context.workspaceId,
        actorId: context.userId,
        eventType: 'removed',
        metadata: { name: row.name },
        createdAt: new Date(),
      });

      // Update usage
      const currentUsage = await trx('workspaceStorageUsage')
        .where({ workspaceId: context.workspaceId })
        .first();

      if (currentUsage) {
        const newUsedBytes = Math.max(0, Number(currentUsage.usedBytes) - Number(row.sizeBytes));
        await trx('workspaceStorageUsage')
          .where({ workspaceId: context.workspaceId })
          .update({ usedBytes: newUsedBytes });
      }
    });
  }

  async listEntityFiles(
    context: AuthorizationContext,
    entityType: string,
    entityId: string,
  ): Promise<FileRecord[]> {
    const rows = (await this.db('files')
      .where({
        workspaceId: context.workspaceId,
        entityType,
        entityId,
        deletedAt: null,
      })
      .orderBy('createdAt', 'desc')) as FileRow[];

    return rows.map(dto);
  }

  async getStorageUsage(trx: Knex | Knex.Transaction, workspaceId: string): Promise<StorageUsage> {
    let usage = (await trx('workspaceStorageUsage')
      .where({ workspaceId })
      .first()) as { usedBytes: bigint; quotaBytes: bigint } | undefined;

    if (!usage) {
      // Initialize with default free tier quota
      const quotaBytes = DEFAULT_QUOTAS_BY_PLAN.free;
      await trx('workspaceStorageUsage').insert({
        workspaceId,
        usedBytes: 0,
        quotaBytes,
        lastReconciled: new Date(),
      });

      usage = { usedBytes: BigInt(0), quotaBytes };
    }

    return {
      usedBytes: Number(usage.usedBytes),
      quotaBytes: Number(usage.quotaBytes),
      percentUsed: Math.round((Number(usage.usedBytes) / Number(usage.quotaBytes)) * 100),
    };
  }

  async markFileReady(trx: Knex.Transaction, fileId: string): Promise<void> {
    await trx('files').where({ id: fileId }).update({
      status: 'ready',
      scanStatus: 'clean',
      updatedAt: new Date(),
    });
  }

  async markFileFailed(trx: Knex.Transaction, fileId: string, reason: string): Promise<void> {
    await trx('files').where({ id: fileId }).update({
      status: 'failed',
      scanStatus: 'failed',
      failureReason: reason,
      updatedAt: new Date(),
    });
  }
}

export async function createFileStore(
  db: Knex,
  storage: StorageAdapter,
): Promise<FileStore> {
  return new FileStore(db, storage);
}
