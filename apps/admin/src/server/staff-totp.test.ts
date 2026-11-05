import { describe, expect, it } from 'vitest';
import { generateStaffTotpSecret, staffTotpAuthenticatorSecret, staffTotpMatches, staffTotpMatchingStep } from './staff-totp';

describe('staff TOTP enrollment', () => {
  it('matches the RFC 6238 SHA-1 test vector and allows one time step of clock drift', () => {
    const secret = '12345678901234567890';
    expect(staffTotpMatches(secret, '287082', 59_000)).toBe(true);
    expect(staffTotpMatches(secret, '287082', 89_000)).toBe(true);
    expect(staffTotpMatches(secret, '287082', 119_000)).toBe(false);
    expect(staffTotpMatches(secret, '000000', 59_000)).toBe(false);
    expect(staffTotpMatches(secret, '28708x', 59_000)).toBe(false);
  });

  it('generates a valid base32 secret with 160 bits of entropy', () => {
    const secret = generateStaffTotpSecret();
    expect(secret).toMatch(/^[A-Z2-7]{32}$/);
    expect(generateStaffTotpSecret()).not.toBe(secret);
  });

  it('returns the matched step, including clock drift, for replay protection', () => {
    expect(staffTotpMatchingStep('12345678901234567890', '287082', 59_000)).toBe(1);
    expect(staffTotpMatchingStep('12345678901234567890', '287082', 89_000)).toBe(1);
    expect(staffTotpMatchingStep('12345678901234567890', '287082', 119_000)).toBeNull();
    expect(staffTotpMatchingStep('12345678901234567890', 'invalid', 59_000)).toBeNull();
  });

  it('encodes the UTF-8 TOTP key for authenticator-app URI enrollment', () => {
    expect(staffTotpAuthenticatorSecret('12345678901234567890')).toBe('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ');
  });
});
