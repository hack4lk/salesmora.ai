import { describe, expect, it } from 'vitest';
import { auditQuerySchema, auditVerificationSchema } from './audit-viewer';

describe('admin audit boundaries', () => {
  it('defaults to the last seven days and first page', () => {
    expect(auditQuerySchema.parse({})).toEqual({ query: '', actor: '', category: 'all', range: 'week', page: 0 });
  });
  it('rejects unbounded, malformed and authorization-shaped inputs', () => {
    for (const input of [
      { query: 'x'.repeat(255) }, { actor: 'x'.repeat(129) }, { category: 'sql' }, { range: 'forever' },
      { page: -1 }, { page: 1.5 }, { page: 1_000_001 }, { asOf: 'yesterday' }, { throughSequence: '-1' },
      { throughSequence: '1 OR 1=1' }, { reviewerRole: 'super_admin' }, { pageSize: 50000 },
    ]) expect(auditQuerySchema.safeParse(input).success).toBe(false);
  });
  it('requires an authoritative verification scope rather than a success-shaped placeholder', () => {
    expect(auditVerificationSchema.safeParse({ state: 'intact', checked: 1, checkedAt: '2026-10-30T16:00:00Z' }).success).toBe(false);
    expect(auditVerificationSchema.safeParse({
      state: 'broken', checked: 1, checkedAt: '2026-10-30T16:00:00Z', sequence: '5', throughSequence: '8',
    }).success).toBe(true);
  });
});
