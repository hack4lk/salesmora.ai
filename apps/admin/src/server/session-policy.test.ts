import { describe, expect, it } from 'vitest';
import {
  ADMIN_SESSION_ABSOLUTE_SECONDS,
  ADMIN_SESSION_IDLE_SECONDS,
  isAdminSessionWithinLimits,
} from './session-policy';

describe('admin session limits', () => {
  const now = Date.now();

  it('allows sessions within both absolute and idle limits', () => {
    expect(isAdminSessionWithinLimits(
      new Date(now - 60 * 60 * 1000),
      new Date(now - 10 * 60 * 1000),
      now,
    )).toBe(true);
  });

  it('rejects idle sessions at the 30-minute boundary and sessions at the 8-hour boundary', () => {
    expect(isAdminSessionWithinLimits(
      new Date(now - 60 * 60 * 1000),
      new Date(now - ADMIN_SESSION_IDLE_SECONDS * 1000 - 1),
      now,
    )).toBe(false);
    expect(isAdminSessionWithinLimits(
      new Date(now - ADMIN_SESSION_ABSOLUTE_SECONDS * 1000 - 1),
      new Date(now - 60 * 1000),
      now,
    )).toBe(false);
  });
});
