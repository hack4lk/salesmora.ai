import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const adminEmailVerificationSignatureHeaders = {
  timestamp: 'x-salesmora-admin-signature-timestamp',
  nonce: 'x-salesmora-admin-signature-nonce',
  signature: 'x-salesmora-admin-signature',
} as const;

const routePath = '/send-verification-email';
const signatureWindowMilliseconds = 60_000;

function message(timestamp: string, nonce: string, email: string, callbackURL: string) {
  const body = JSON.stringify({ email: email.trim().toLowerCase(), callbackURL });
  return `POST\n${routePath}\n${timestamp}\n${nonce}\n${body}`;
}

function validSecret(secret: string) {
  return Buffer.byteLength(secret, 'utf8') >= 32;
}

export function signAdminEmailVerificationRequest(
  secret: string,
  email: string,
  callbackURL: string,
  now = Date.now(),
  nonce = randomBytes(16).toString('base64url'),
) {
  if (!validSecret(secret)) throw new Error('Admin email-verification secret must contain at least 32 bytes.');
  if (!Number.isSafeInteger(now) || now < 0) throw new Error('A valid signing timestamp is required.');
  if (!/^[\w-]{22}$/.test(nonce)) throw new Error('A valid request nonce is required.');
  const timestamp = String(now);
  const signature = createHmac('sha256', secret).update(message(timestamp, nonce, email, callbackURL)).digest('hex');
  return { timestamp, nonce, signature };
}

export function verifyAdminEmailVerificationRequest(
  secret: string | undefined,
  headers: Headers,
  email: string,
  callbackURL: string,
  now = Date.now(),
) {
  if (!secret || !validSecret(secret)) return false;
  const timestamp = headers.get(adminEmailVerificationSignatureHeaders.timestamp);
  const nonce = headers.get(adminEmailVerificationSignatureHeaders.nonce);
  const signature = headers.get(adminEmailVerificationSignatureHeaders.signature);
  if (!timestamp || !/^\d{13}$/.test(timestamp) || !nonce || !/^[\w-]{22}$/.test(nonce) ||
    !signature || !/^[a-f\d]{64}$/i.test(signature)) return false;
  const signedAt = Number(timestamp);
  if (!Number.isSafeInteger(signedAt) || Math.abs(now - signedAt) > signatureWindowMilliseconds) return false;

  const expected = createHmac('sha256', secret).update(message(timestamp, nonce, email, callbackURL)).digest();
  const received = Buffer.from(signature, 'hex');
  return received.length === expected.length && timingSafeEqual(received, expected);
}
