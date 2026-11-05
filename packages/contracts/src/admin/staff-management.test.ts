import { describe, expect, it } from 'vitest';
import { staffActionInputSchema, staffEmailSchema } from './staff-management';

describe('staff company identity', () => {
  it('normalizes a real company domain without allowing other domains or malformed addresses', () => {
    expect(staffEmailSchema.parse(' ADMIN@KARPUKCREATIVE.COM ')).toBe('admin@karpukcreative.com');
    for (const email of [
      'admin@salesmora.ai', 'admin@example.com', 'admin@sub.karpukcreative.com',
      'admin@karpukcreative.com.example.com', 'admin@evilkarpukcreative.com',
      'admin@@karpukcreative.com', 'admin name@karpukcreative.com', '',
      null, undefined, `${'a'.repeat(255)}@karpukcreative.com`,
    ]) expect(staffEmailSchema.safeParse(email).success).toBe(false);
  });
});

describe('staff action boundary', () => {
  const input = {
    action: { kind: 'invite', email: ' STAFF@karpukcreative.com ', role: 'support' },
    reason: ' On-call coverage ', decision: 'approve',
  };
  it('normalizes staff identity and reason', () => {
    expect(staffActionInputSchema.parse(input)).toMatchObject({
      action: { email: 'staff@karpukcreative.com' }, reason: 'On-call coverage',
    });
  });
  it('rejects unknown roles, foreign email, empty reasons and caller-supplied authorization', () => {
    for (const invalid of [
      { ...input, action: { ...input.action, role: 'owner' } },
      { ...input, action: { ...input.action, email: 'staff@karpukcreative.com.example.com' } },
      { ...input, reason: ' ' },
      { ...input, userId: 'spoofed' },
      { ...input, action: { ...input.action, approvedBy: 'spoofed' } },
    ]) expect(staffActionInputSchema.safeParse(invalid).success).toBe(false);
  });
  it('accepts only references, not browser-supplied target identity, for existing records', () => {
    const requestId = 'c3220a4b-f2e5-4db4-bf19-e30fc4a03e74';
    expect(staffActionInputSchema.safeParse({ ...input, action: { kind: 'approval', requestId } }).success).toBe(true);
    expect(staffActionInputSchema.safeParse({ ...input, action: { kind: 'approval', requestId, email: input.action.email } }).success).toBe(false);
  });
  it('requires a target version and rejects browser-supplied account state or previous role', () => {
    for (const kind of ['disable', 'enable', 'role_change']) {
      const action = { kind, userId: 'target-staff', expectedVersion: 3, ...(kind === 'role_change' ? { role: 'billing' } : {}) };
      expect(staffActionInputSchema.safeParse({ ...input, action }).success).toBe(true);
      for (const extra of [{ currentRole: 'support' }, { active: true }, { email: input.action.email }, { expectedVersion: -1 }, { expectedVersion: undefined }]) {
        expect(staffActionInputSchema.safeParse({ ...input, action: { ...action, ...extra } }).success).toBe(false);
      }
    }
  });
});
