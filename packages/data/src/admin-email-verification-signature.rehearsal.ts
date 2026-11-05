import assert from 'node:assert/strict';
import {
  adminEmailVerificationSignatureHeaders,
  signAdminEmailVerificationRequest,
  verifyAdminEmailVerificationRequest,
} from './admin-email-verification-signature';

const secret = 'a rehearsal-only secret with at least 32 bytes';
const email = 'customer@example.test';
const callbackURL = 'https://app.example.test/verify-email';
const now = 1_800_000_000_000;
const signed = signAdminEmailVerificationRequest(secret, email, callbackURL, now);
const headers = new Headers({
  [adminEmailVerificationSignatureHeaders.timestamp]: signed.timestamp,
  [adminEmailVerificationSignatureHeaders.nonce]: signed.nonce,
  [adminEmailVerificationSignatureHeaders.signature]: signed.signature,
});

assert.equal(verifyAdminEmailVerificationRequest(secret, headers, email, callbackURL, now), true);
assert.equal(verifyAdminEmailVerificationRequest(secret, headers, 'other@example.test', callbackURL, now), false);
assert.equal(verifyAdminEmailVerificationRequest(secret, headers, email, 'https://app.example.test/other', now), false);
assert.equal(verifyAdminEmailVerificationRequest(secret, headers, email, callbackURL, now + 60_001), false);
assert.equal(verifyAdminEmailVerificationRequest(undefined, headers, email, callbackURL, now), false);
const changedNonceHeaders = new Headers(headers);
changedNonceHeaders.set(adminEmailVerificationSignatureHeaders.nonce, 'abcdefghijklmnopqrstuv');
assert.equal(verifyAdminEmailVerificationRequest(secret, changedNonceHeaders, email, callbackURL, now), false);
assert.throws(() => signAdminEmailVerificationRequest('short', email, callbackURL, now));
console.log('PASS admin email-verification request signature validation');
