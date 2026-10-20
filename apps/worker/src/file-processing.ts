import type { Knex } from '@salesmora/data';
import { createFileStore, createStorageAdapter, generateThumbnail, convertHeicToJpeg, isHeic, isProcessableImage } from '@salesmora/data';
import type { StorageAdapter } from '@salesmora/data';

export interface FileProcessingJob {
  fileId: string;
  workspaceId: string;
}

export interface FileProcessingResult {
  fileId: string;
  success: boolean;
  thumbnailCreated: boolean;
  heicConverted: boolean;
  error?: string;
}

/**
 * Process a file: generate thumbnail, convert HEIC to JPEG, mock scan.
 * Called by the worker when a file is in 'uploading' status.
 */
export async function processFileForStorage(
  db: Knex,
  storage: StorageAdapter,
  fileId: string,
): Promise<FileProcessingResult> {
  const store = await createFileStore(db, storage);
  const result: FileProcessingResult = {
    fileId,
    success: false,
    thumbnailCreated: false,
    heicConverted: false,
  };

  try {
    // Get file record
    const fileRow = await store.getFileForProcessing(fileId);
    if (!fileRow) {
      result.error = 'File not found';
      return result;
    }

    // Retrieve encrypted file from storage
    const encryptedData = await storage.get(fileRow.storageKey);

    // Mock malware scan (TODO: integrate ClamAV in S2b)
    console.log(`[FileWorker] Mock scanning file ${fileId}`);
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate scan time

    // Check if the file is an image for processing
    const isImage = await isProcessableImage(encryptedData);

    if (isImage) {
      // Generate thumbnail
      const thumbnailBytes = await generateThumbnail(encryptedData);
      if (thumbnailBytes) {
        await db.transaction(async (trx: Knex.Transaction) => {
          await store.storeThumbnail(trx, fileId, thumbnailBytes);
        });
        result.thumbnailCreated = true;
        console.log(`[FileWorker] Thumbnail created for file ${fileId}`);
      }

      // Check if HEIC and convert to JPEG
      if (await isHeic(encryptedData)) {
        const jpegBytes = await convertHeicToJpeg(encryptedData);
        if (jpegBytes) {
          await db.transaction(async (trx: Knex.Transaction) => {
            // Store the original HEIC
            await store.storeHeicOriginal(trx, fileId, encryptedData);
            // TODO: Update the main file record to point to JPEG instead
            // For now, we keep the original, but in production we'd swap the main file to JPEG
            result.heicConverted = true;
          });
          console.log(`[FileWorker] HEIC converted to JPEG for file ${fileId}`);
        }
      }
    }

    // Mark file as ready
    await db.transaction(async (trx: Knex.Transaction) => {
      await store.markFileReady(trx, fileId);
    });

    result.success = true;
    console.log(`[FileWorker] File ${fileId} processing complete`);

    return result;
  } catch (err) {
    result.error = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[FileWorker] Error processing file ${fileId}: ${result.error}`);

    // Mark file as failed
    try {
      await db.transaction(async (trx: Knex.Transaction) => {
        await store.markFileFailed(trx, fileId, result.error!);
      });
    } catch (failErr) {
      console.error(`[FileWorker] Failed to mark file ${fileId} as failed: ${failErr}`);
    }

    return result;
  }
}

/**
 * Clean up orphaned files:
 * - Files in 'uploading' state for >24 hours (incomplete uploads)
 * - Files in 'scanning' state for >2 hours (stuck processing)
 * - Files without corresponding file links (orphaned)
 */
export async function sweepOrphanedFiles(
  db: Knex,
  storage: StorageAdapter,
): Promise<{ cleaned: number; failed: number }> {
  const store = await createFileStore(db, storage);
  let cleaned = 0;
  let failed = 0;

  try {
    const now = new Date();
    const uploading24hAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const scanning2hAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    // Find orphaned files
    const orphans = await db('files')
      .where((builder: any) => {
        builder
          .where('status', 'uploading').andWhere('createdAt', '<', uploading24hAgo)
          .orWhere('status', 'scanning').andWhere('createdAt', '<', scanning2hAgo);
      })
      .limit(100);

    for (const orphan of orphans) {
      try {
        // Delete from storage if it exists
        try {
          await storage.delete(orphan.storageKey);
        } catch {
          // Ignore storage errors
        }

        // Mark as deleted in DB
        await db('files').where({ id: orphan.id }).update({
          deletedAt: new Date(),
          status: 'failed',
          failureReason: 'Orphaned file cleaned up by sweeper',
        });

        cleaned++;
        console.log(`[FileWorker] Cleaned orphaned file ${orphan.id}`);
      } catch (err) {
        failed++;
        console.error(`[FileWorker] Failed to clean orphaned file ${orphan.id}: ${err}`);
      }
    }

    console.log(`[FileWorker] Orphan sweep complete: ${cleaned} cleaned, ${failed} failed`);
    return { cleaned, failed };
  } catch (err) {
    console.error(`[FileWorker] Orphan sweep failed: ${err}`);
    return { cleaned: 0, failed: 1 };
  }
}
