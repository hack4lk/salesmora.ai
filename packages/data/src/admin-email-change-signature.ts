import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type { AdminEmailChangeDelivery } from '@salesmora/contracts';

export const adminEmailChangeSignatureHeaders = {
  timestamp: 'x-salesmora-admin-email-change-timestamp',
  nonce: 'x-salesmora-admin-email-change-nonce',
  signature: 'x-salesmora-admin-email-change-signature',
} as const;

const signatureLifetimeMs = 60_000;

function serializedDelivery(delivery: AdminEmailChangeDelivery) {
  return JSON.stringify({
    requestId: delivery.requestId,
    oldEmail: delivery.oldEmail,
    newEmail: delivery.newEmail,
    token: delivery.token,
    callbackURL: delivery.callbackURL,
  });
}

export function adminEmailChangeTokenHash(token: string) {
  return createHash('sha256').update(`salesmora-admin-email-change\0${token}`).digest('hex');
}

export function signAdminEmailChangeDelivery(
  secret: string,
  delivery: AdminEmailChangeDelivery,
  now = Date.now(),
) {
  if (Buffer.byteLength(secret, 'utf8') < 32) throw new Error('Admin email-change signing requires a 32-byte secret.');
  const timestamp = String(now);
  const nonce = randomUUID();
  const signature = createHmac('sha256', secret)
    .update(`${timestamp}\n${nonce}\n${serializedDelivery(delivery)}`)
    .digest('hex');
  return { timestamp, nonce, signature };
}

export function verifyAdminEmailChangeDelivery(
  secret: string | undefined,
  headers: Headers,
  delivery: AdminEmailChangeDelivery,
  now = Date.now(),
) {
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) return false;
  const timestamp = headers.get(adminEmailChangeSignatureHeaders.timestamp);
  const nonce = headers.get(adminEmailChangeSignatureHeaders.nonce);
  const supplied = headers.get(adminEmailChangeSignatureHeaders.signature);
  if (!timestamp || !nonce || !supplied || !/^\d{13}$/.test(timestamp) ||
      !/^[0-9a-f-]{36}$/i.test(nonce) || !/^[a-f0-9]{64}$/i.test(supplied)) return false;
  const issuedAt = Number(timestamp);
  if (!Number.isSafeInteger(issuedAt) || Math.abs(now - issuedAt) > signatureLifetimeMs) return false;
  const expected = createHmac('sha256', secret)
    .update(`${timestamp}\n${nonce}\n${serializedDelivery(delivery)}`)
    .digest();
  const actual = Buffer.from(supplied, 'hex');
  return actual.length === expected.length && timingSafeEqual(expected, actual);
}
