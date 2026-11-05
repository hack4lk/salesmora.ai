import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Knex } from '@salesmora/data';

const mocks = vi.hoisted(() => ({
  createFileStore: vi.fn(),
  getFileForProcessing: vi.fn(),
  storageGet: vi.fn(),
}));
vi.mock('@salesmora/data', () => ({
  createFileStore: mocks.createFileStore,
  createStorageAdapter: vi.fn(),
  withoutSuspendedWorkspaces: vi.fn(),
  generateThumbnail: vi.fn(),
  convertHeicToJpeg: vi.fn(),
  isHeic: vi.fn(),
  isProcessableImage: vi.fn(),
  decryptFile: vi.fn(),
  deserializeFileCiphertext: vi.fn(),
  deserializeDekEnvelope: vi.fn(),
}));

import { processFileForStorage } from './file-processing';

describe('suspended workspace file-processing jobs', () => {
  const first = vi.fn();
  const query = {
    join: vi.fn(),
    where: vi.fn(),
    whereNotNull: vi.fn(),
    first,
  };
  const db = Object.assign(vi.fn(() => query), { transaction: vi.fn() }) as unknown as Knex;
  const storage = { get: mocks.storageGet } as never;

  beforeEach(() => {
    vi.clearAllMocks();
    query.join.mockReturnThis();
    query.where.mockReturnThis();
    query.whereNotNull.mockReturnThis();
    mocks.createFileStore.mockResolvedValue({ getFileForProcessing: mocks.getFileForProcessing });
    mocks.getFileForProcessing.mockResolvedValue(null);
  });

  afterEach(() => vi.restoreAllMocks());

  it('holds a selected file when its workspace was suspended before processing began', async () => {
    first.mockResolvedValue({ id: 'fixture-file' });
    const result = await processFileForStorage(db, storage, 'fixture-file');
    expect(result).toMatchObject({ success: false, held: true });
    expect(mocks.storageGet).not.toHaveBeenCalled();
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it('reports a genuinely missing file instead of treating it as held', async () => {
    first.mockResolvedValue(undefined);
    const result = await processFileForStorage(db, storage, 'missing-file');
    expect(result).toMatchObject({ success: false, held: false, error: 'File not found' });
  });
});
