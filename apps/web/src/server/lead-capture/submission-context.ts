import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { captureSubmissionContextSchema as contextSchema } from '@salesmora/contracts';
type Binding = { publicKey: string; publicationVersion: number; configurationVersion: number };
const lifetime = 30 * 60;
function key(secret: string) {
  const decoded = Buffer.from(secret, 'base64');
  if (decoded.length !== 32 || decoded.toString('base64') !== secret) throw Error('Invalid capture context key.'); return decoded;
}
export function createCaptureSubmissionContext(binding: Binding, audience: string, secret: string, now = new Date()) {
  const issuedAt = Math.floor(now.getTime() / 1000);
  const payload = contextSchema.parse({ ...binding, purpose: 'capture_submission', audience, submissionId: randomUUID(), issuedAt, expiresAt: issuedAt + lifetime });
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${createHmac('sha256', key(secret)).update(body).digest('base64url')}`;
}
/** Expired signed contexts may identify only an already committed exact receipt. */
export function readCaptureSubmissionContext(token: string, audience: string, secret: string, now = new Date(), allowExpiredReceiptLookup = false) {
  try {
    if (token.length > 3000) return null; const parts = token.split('.'); if (parts.length !== 2 || !parts.every(part => /^[A-Za-z0-9_-]+$/.test(part))) return null;
    const expected = createHmac('sha256', key(secret)).update(parts[0]).digest(), signature = Buffer.from(parts[1], 'base64url');
    if (signature.length !== expected.length || !timingSafeEqual(expected, signature) || signature.toString('base64url') !== parts[1]) return null;
    const payload = contextSchema.safeParse(JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'))); if (!payload.success) return null;
    const value = payload.data, instant = Math.floor(now.getTime() / 1000);
    if (value.audience !== audience || value.issuedAt > instant || !allowExpiredReceiptLookup && value.expiresAt <= instant || value.expiresAt - value.issuedAt !== lifetime) return null;
    return value;
  } catch { return null; }
}
export function verifyCaptureSubmissionContext(token: string, binding: Binding, audience: string, secret: string, now = new Date()) {
  const value = readCaptureSubmissionContext(token, audience, secret, now);
  return value && value.publicKey === binding.publicKey && value.publicationVersion === binding.publicationVersion && value.configurationVersion === binding.configurationVersion ? value : null;
}
