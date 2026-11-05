import { describe, expect, it } from 'vitest';
import { auditArchiveLockResponseSchema, auditArchiveLockRulesSchema } from './audit-archive-lock';

describe('R2 archive lock contracts', () => {
  const rule = { id: 'one-year', enabled: true, prefix: 'admin-audit/', condition: { type: 'Age', maxAgeSeconds: 31_536_000 } };
  it('accepts the documented age/date/indefinite rules and optional bucket-wide prefix', () => {
    expect(auditArchiveLockRulesSchema.safeParse([
      rule,
      { id: 'date', enabled: true, condition: { type: 'Date', date: '2027-10-31T00:00:00.000Z' } },
      { id: 'offset-date', enabled: true, condition: { type: 'Date', date: '2027-10-31T05:00:00+05:00' } },
      { id: 'forever', enabled: true, condition: { type: 'Indefinite' } },
    ]).success).toBe(true);
  });
  it('rejects unbounded, malformed and unsupported rule data', () => {
    for (const condition of [
      { type: 'Age', maxAgeSeconds: 0 }, { type: 'Age', maxAgeSeconds: -1 },
      { type: 'Age', maxAgeSeconds: 1.5 }, { type: 'Age', maxAgeSeconds: Number.MAX_SAFE_INTEGER + 1 },
      { type: 'Date', date: 'invalid' }, { type: 'ObjectLock' }, { type: 'Indefinite', immutable: true },
    ]) expect(auditArchiveLockRulesSchema.safeParse([{ ...rule, condition }]).success).toBe(false);
    expect(auditArchiveLockRulesSchema.safeParse(Array.from({ length: 1001 }, () => rule)).success).toBe(false);
    expect(auditArchiveLockRulesSchema.safeParse(Array.from({ length: 1000 }, () => rule)).success).toBe(true);
    expect(auditArchiveLockRulesSchema.safeParse([{ ...rule, enabled: 'true' }]).success).toBe(false);
  });
  it('requires a successful error-free API envelope without inventing protection', () => {
    expect(auditArchiveLockResponseSchema.parse({ success: true, errors: [], result: {} }).result.rules).toBeUndefined();
    expect(auditArchiveLockResponseSchema.safeParse({ success: false, errors: [], result: { rules: [rule] } }).success).toBe(false);
    expect(auditArchiveLockResponseSchema.safeParse({ success: true, errors: [{}], result: { rules: [rule] } }).success).toBe(false);
    expect(auditArchiveLockResponseSchema.safeParse({ success: true, result: { rules: [rule] } }).success).toBe(false);
  });
});
