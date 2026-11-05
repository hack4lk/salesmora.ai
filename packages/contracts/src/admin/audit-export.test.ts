import { describe, expect, it } from 'vitest';
import { auditExportInputSchema, auditExportOperationSchema } from './audit-export';

const input = { snapshot: { filters: { query: '', actor: '', category: 'all', range: 'week' },
  count: 50_000, asOf: '2026-10-30T17:00:00.000Z', throughSequence: '50100' }, reason: ' Incident 42 ' };
describe('admin audit export contracts', () => {
  it('allows exactly 50,000, trims the reason and rejects partial/empty exports', () => {
    expect(auditExportInputSchema.parse(input).reason).toBe('Incident 42');
    for (const count of [0, -1, 50_001, 1.5, Number.MAX_SAFE_INTEGER]) {
      expect(auditExportInputSchema.safeParse({ ...input, snapshot: { ...input.snapshot, count } }).success).toBe(false);
    }
  });
  it('rejects unauthorized fields, paging, unbounded reasons and invalid anchors', () => {
    for (const value of [
      { ...input, reason: ' ' }, { ...input, reason: 'a'.repeat(1001) }, { ...input, role: 'super_admin' },
      { ...input, snapshot: { ...input.snapshot, asOf: 'invalid' } },
      { ...input, snapshot: { ...input.snapshot, throughSequence: '-1' } },
      { ...input, snapshot: { ...input.snapshot, filters: { ...input.snapshot.filters, page: 1 } } },
    ]) expect(auditExportInputSchema.safeParse(value).success).toBe(false);
  });
  it('commit accepts only the one-use token, never replacement scope or reason', () => {
    const commit = { operation: 'commit', token: 't'.repeat(43) };
    expect(auditExportOperationSchema.safeParse(commit).success).toBe(true);
    for (const value of [{ ...commit, input }, { ...commit, verified: true }, { ...commit, reason: 'changed' },
      { ...commit, token: '' }, { operation: 'factor', token: commit.token, method: 'totp', code: '12345' }]) {
      expect(auditExportOperationSchema.safeParse(value).success).toBe(false);
    }
  });
});
