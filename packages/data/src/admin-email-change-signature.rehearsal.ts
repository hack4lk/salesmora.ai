import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import {
  adminEmailChangeSignatureHeaders,
  adminEmailChangeTokenHash,
  signAdminEmailChangeDelivery,
  verifyAdminEmailChangeDelivery,
} from './admin-email-change-signature';

const secret = 'dedicated rehearsal secret with more than 32 bytes';
const now = 1_800_000_000_000;
const token = randomBytes(32).toString('base64url');
const delivery = {
  requestId: randomUUID(),
  oldEmail: 'current@example.test',
  newEmail: 'new@example.test',
  token,
  callbackURL: `https://app.example.test/change-email/confirm?token=${token}`,
};
const signed = signAdminEmailChangeDelivery(secret, delivery, now);
const headers = new Headers({
  [adminEmailChangeSignatureHeaders.timestamp]: signed.timestamp,
  [adminEmailChangeSignatureHeaders.nonce]: signed.nonce,
  [adminEmailChangeSignatureHeaders.signature]: signed.signature,
});

assert.equal(verifyAdminEmailChangeDelivery(secret, headers, delivery, now), true);
assert.equal(verifyAdminEmailChangeDelivery(secret, headers, { ...delivery, newEmail: 'other@example.test' }, now), false);
assert.equal(verifyAdminEmailChangeDelivery(secret, headers, delivery, now + 60_001), false);
assert.equal(verifyAdminEmailChangeDelivery(undefined, headers, delivery, now), false);
const changedNonce = new Headers(headers);
changedNonce.set(adminEmailChangeSignatureHeaders.nonce, randomUUID());
assert.equal(verifyAdminEmailChangeDelivery(secret, changedNonce, delivery, now), false);
assert.throws(() => signAdminEmailChangeDelivery('short', delivery, now));
assert.match(adminEmailChangeTokenHash(token), /^[a-f0-9]{64}$/);
assert.notEqual(adminEmailChangeTokenHash(token), adminEmailChangeTokenHash(randomBytes(32).toString('base64url')));
console.log('PASS dedicated email-change signatures and one-use token hashing');
