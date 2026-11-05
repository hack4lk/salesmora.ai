import { describe, expect, it } from 'vitest';
import { isPasskeySecondFactorValid } from './admin-mfa-plugin';

describe('admin passkey second factor', () => {
  it('accepts a user-verified passkey only for the account that passed password verification', () => {
    expect(isPasskeySecondFactorValid('staff-1', 'staff-1', true)).toBe(true);
    expect(isPasskeySecondFactorValid('staff-1', 'staff-2', true)).toBe(false);
    expect(isPasskeySecondFactorValid('staff-1', 'staff-1', false)).toBe(false);
  });
});
