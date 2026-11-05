import { describe, expect, it } from 'vitest';
import { captureArchiveIssue as issue, type CaptureArchiveSource } from './capture-archive-restore-dialog.validation';
const source: CaptureArchiveSource = { id: 'source', version: 2, name: 'Website', type: 'website', status: 'active', canArchive: true, canRestore: true, restoreReadiness: 'ready' };
describe('archive/restore presentation guards', () => {
  it('allows archiving current sources and restoring archived sources only', () => {
    for (const status of ['draft', 'active', 'paused', 'scheduled'] as const) {
      expect(issue({ ...source, status }, 'archive')).toBeNull(); expect(issue({ ...source, status }, 'restore')).toBe('unavailable');
    }
    expect(issue({ ...source, status: 'archived' }, 'archive')).toBe('unavailable'); expect(issue({ ...source, status: 'archived' }, 'restore')).toBeNull();
  });
  it('uses independent archive and restore capabilities', () => {
    expect(issue({ ...source, canArchive: false }, 'archive')).toBe('forbidden'); expect(issue({ ...source, status: 'archived', canRestore: false }, 'restore')).toBe('forbidden');
  });
  it('requires resolved access/capacity checks on restoration, without blocking archival', () => {
    for (const restoreReadiness of ['checking', 'blocked'] as const) {
      expect(issue({ ...source, status: 'archived', restoreReadiness }, 'restore')).toBe(restoreReadiness);
      expect(issue({ ...source, restoreReadiness }, 'archive')).toBeNull();
    }
  });
  it('requires a valid current identity/version and supported lifecycle state', () => {
    expect(issue({ ...source, id: '' }, 'archive')).toBe('invalid'); expect(issue({ ...source, version: 0 }, 'archive')).toBe('invalid');
    expect(issue({ ...source, status: 'deleted' as CaptureArchiveSource['status'] }, 'archive')).toBe('unavailable');
  });
});
