import { processFileForStorage, sweepOrphanedFiles } from './file-processing.js';
import { createStorageAdapter } from '@salesmora/data';

/** Start the file processing worker loop. */
export async function startFileProcessing(db: any) {
  const storage = createStorageAdapter();

  let stopped = false;
  let running: Promise<void> | undefined;
  let sweeping: Promise<void> | undefined;

  function tick() {
    if (stopped || running) return;
    console.log(JSON.stringify({ event: 'worker.file_processing_tick', timestamp: new Date().toISOString() }));
    running = processFileBatch().catch((err) => {
      console.error(JSON.stringify({ event: 'worker.file_processing_failed', error: err?.message || String(err) }));
    }).finally(() => { running = undefined; });
  }

  async function processFileBatch() {
    const store = await import('@salesmora/data').then(m => m.createFileStore(db, storage));

    // Process files in uploading status
    const files = await store.getFilesForProcessing(['uploading'], 10);
    
    if (files.length > 0) {
      console.log(JSON.stringify({ event: 'worker.file_processing_batch', count: files.length, files: files.map(f => ({ id: f.id, name: f.name, status: f.status })) }));
    }

    for (const file of files) {
      const result = await processFileForStorage(db, storage, file.id);
      if (result.success) {
        console.log(JSON.stringify({ event: 'worker.file_processed', fileId: file.id, thumbnailCreated: result.thumbnailCreated, heicConverted: result.heicConverted }));
      } else {
        console.error(JSON.stringify({ event: 'worker.file_processing_error', fileId: file.id, error: result.error }));
      }
    }
  }

  async function sweepOrphans() {
    if (stopped || sweeping) return;
    sweeping = (async () => {
      try {
        await sweepOrphanedFiles(db, storage);
      } catch {
        console.error(JSON.stringify({ event: 'worker.orphan_sweep_failed' }));
      }
    })().finally(() => { sweeping = undefined; });
  }

  // Process files every 5 seconds
  const processTimer = setInterval(tick, 5000);
  tick();

  // Run orphan sweep every 1 hour
  const sweepTimer = setInterval(() => void sweepOrphans(), 60 * 60 * 1000);

  return async () => {
    stopped = true;
    clearInterval(processTimer);
    clearInterval(sweepTimer);
    await running;
    await sweeping;
  };
}
