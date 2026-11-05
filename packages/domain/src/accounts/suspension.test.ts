import { describe, expect, it } from 'vitest';
import {
  isUserBlocked,
  normalizeSuspensionReason,
  suspensionReasonMaxLength,
  suspensionReasonMinLength,
  workspaceAccess,
} from './suspension';

const at = new Date('2026-10-28T12:00:00Z');

describe('isUserBlocked', () => {
  it('allows an active user', () => {
    expect(isUserBlocked({})).toBe(false);
    expect(isUserBlocked({ deletionRequestedAt: null, suspendedAt: null })).toBe(false);
  });
  it('blocks suspended and deleting users', () => {
    expect(isUserBlocked({ suspendedAt: at })).toBe(true);
    expect(isUserBlocked({ deletionRequestedAt: at.toISOString() })).toBe(true);
  });
});

describe('workspaceAccess', () => {
  it('returns active, suspended or deleting', () => {
    expect(workspaceAccess({})).toBe('active');
    expect(workspaceAccess({ suspendedAt: at })).toBe('suspended');
    expect(workspaceAccess({ deletionRequestedAt: at })).toBe('deleting');
  });
  it('treats deletion as stronger than suspension', () => {
    expect(workspaceAccess({ suspendedAt: at, deletionRequestedAt: at })).toBe('deleting');
  });
});

describe('normalizeSuspensionReason', () => {
  it('trims the reason', () => {
    expect(normalizeSuspensionReason('  Chargeback review  ')).toBe('Chargeback review');
  });
  it('rejects missing, short, non-string and overlong reasons', () => {
    for (const value of [undefined, null, '', '   ', 'x'.repeat(suspensionReasonMinLength - 1), 42]) {
      expect(() => normalizeSuspensionReason(value)).toThrow(RangeError);
    }
    expect(normalizeSuspensionReason('x'.repeat(suspensionReasonMinLength))).toHaveLength(suspensionReasonMinLength);
    expect(() => normalizeSuspensionReason('x'.repeat(suspensionReasonMaxLength + 1))).toThrow(RangeError);
    expect(normalizeSuspensionReason('x'.repeat(suspensionReasonMaxLength))).toHaveLength(suspensionReasonMaxLength);
  });
});
