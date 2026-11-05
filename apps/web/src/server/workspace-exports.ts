import 'server-only';
import { createWriteStream } from 'node:fs';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import {
  createStorageAdapter,
  createStreamingFileDecryption,
} from '@salesmora/data';
import { database } from './workspaces/store';

const maxArtifactBytes = 500 * 1024 * 1024;
let activeDownloads = 0;

export class WorkspaceExportUnavailableError extends Error {
  constructor(readonly status = 404) { super('This workspace export is unavailable or has expired.'); }
}

export class WorkspaceExportDownloadBusyError extends Error {
  constructor() { super('Another workspace export download is already being prepared. Try again shortly.'); }
}

interface OwnerWorkspaceExport {
  workspaceName: string;
  expiresAt: Date | string;
  objectKey: string;
  encryptedDek: Buffer;
  fileIv: Buffer;
  fileAuthTag: Buffer;
  artifactSizeBytes: string | number;
}

function exportMasterKey() {
  const value = process.env.ADMIN_EXPORT_MASTER_KEY;
  if (!value) throw new Error('ADMIN_EXPORT_MASTER_KEY is required for Owner downloads.');
  const key = Buffer.from(value, 'base64');
  if (key.length !== 32 || key.toString('base64') !== value) {
    throw new Error('ADMIN_EXPORT_MASTER_KEY must be canonical base64 for exactly 32 random bytes.');
  }
  return key;
}

export async function readOwnerWorkspaceExport(requestId: string, userId: string) {
  const { rows } = await database().raw<{ rows: OwnerWorkspaceExport[] }>(
    'SELECT * FROM public.read_owner_workspace_export(?::uuid, ?::text)',
    [requestId, userId],
  );
  const record = rows[0];
  if (!record) throw new WorkspaceExportUnavailableError();
  return {
    workspaceName: record.workspaceName,
    expiresAt: new Date(record.expiresAt),
    objectKey: record.objectKey,
    encryptedDek: record.encryptedDek,
    fileIv: record.fileIv,
    fileAuthTag: record.fileAuthTag,
    artifactSizeBytes: Number(record.artifactSizeBytes),
  };
}

export async function prepareOwnerWorkspaceExportDownload(requestId: string, userId: string) {
  if (activeDownloads >= 1) throw new WorkspaceExportDownloadBusyError();
  activeDownloads++;
  let released = false;
  let directory: string | undefined;
  const release = () => {
    if (released) return;
    released = true;
    activeDownloads--;
  };
  let masterKey: Buffer | undefined;
  let storage: ReturnType<typeof createStorageAdapter> | undefined;
  try {
    const metadata = await readOwnerWorkspaceExport(requestId, userId);
    if (metadata.objectKey !== `admin-workspace-exports/${requestId}.zip.aesgcm` ||
      !Number.isSafeInteger(metadata.artifactSizeBytes) ||
      metadata.artifactSizeBytes < 1 ||
      metadata.artifactSizeBytes > maxArtifactBytes ||
      !Number.isFinite(metadata.expiresAt.getTime())) {
      throw new Error('Stored workspace export metadata is invalid.');
    }

    directory = await mkdtemp(join(tmpdir(), 'salesmora-owner-export-'));
    const filePath = join(directory, 'workspace-export.zip');
    masterKey = exportMasterKey();
    storage = createStorageAdapter();
    const encryptedStream = await storage.getStream(metadata.objectKey);
    await pipeline(
      encryptedStream,
      createStreamingFileDecryption(
        masterKey,
        metadata.encryptedDek,
        metadata.fileIv,
        metadata.fileAuthTag,
      ),
      createWriteStream(filePath, { flags: 'wx', mode: 0o600 }),
    );
    const file = await stat(filePath);
    if (!file.isFile() || file.size !== metadata.artifactSizeBytes) {
      throw new Error('Decrypted workspace export size does not match its stored metadata.');
    }

    const { rows: downloadRows } = await database().raw<{ rows: { recorded: boolean }[] }>(
      'SELECT public.record_owner_workspace_export_download(?::uuid, ?::text) AS recorded',
      [requestId, userId],
    );
    if (!downloadRows[0]?.recorded) throw new WorkspaceExportUnavailableError();
    return { directory, filePath, size: file.size, release };
  } catch (error) {
    if (directory) {
      await rm(directory, { recursive: true, force: true }).catch(cleanupError => {
        console.error(JSON.stringify({
          event: 'web.workspace_export_temp_cleanup_failed',
          requestId,
          error: cleanupError instanceof Error ? cleanupError.name : 'UnknownError',
        }));
      });
    }
    release();
    throw error;
  } finally {
    try {
      storage?.close();
    } catch (error) {
      console.error(JSON.stringify({
        event: 'web.workspace_export_storage_close_failed',
        requestId,
        error: error instanceof Error ? error.name : 'UnknownError',
      }));
    } finally {
      masterKey?.fill(0);
    }
  }
}

export async function cleanupOwnerWorkspaceExportDownload(directory: string) {
  await rm(directory, { recursive: true, force: true });
}
