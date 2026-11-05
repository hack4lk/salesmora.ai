import 'server-only';
import { randomUUID } from 'node:crypto';
import {
  adminEmailChangeDeliverySchema,
} from '@salesmora/contracts';
import { createDatabase } from '@salesmora/data/database';
import { sendEmail, verifyEmailDelivery } from '@salesmora/data/email/transport';
import {
  renderCustomerEmailChangeNotificationEmail,
  renderCustomerEmailChangeVerificationEmail,
} from '@salesmora/data/email/customer-email-change';
import {
  adminEmailChangeSignatureHeaders,
  verifyAdminEmailChangeDelivery,
} from '@salesmora/data/admin-email-change-signature';

type GlobalDatabase = typeof globalThis & { salesmoraAdminEmailChangeDb?: ReturnType<typeof createDatabase> };
const databaseURL = process.env.DATABASE_URL;
if (!databaseURL) throw new Error('Missing DATABASE_URL; admin email-change delivery cannot start.');
const globalDatabase = globalThis as GlobalDatabase;
const database = globalDatabase.salesmoraAdminEmailChangeDb ?? createDatabase(databaseURL);
if (process.env.NODE_ENV !== 'production') globalDatabase.salesmoraAdminEmailChangeDb = database;

const responseHeaders = {
  'cache-control': 'no-store',
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
};

function failure(status: number, message: string) {
  return Response.json({ error: message }, { status, headers: responseHeaders });
}

export async function deliverAdminEmailChange(request: Request) {
  const baseURL = process.env.BETTER_AUTH_URL;
  const secret = process.env.ADMIN_EMAIL_CHANGE_SECRET;
  if (!baseURL || !secret || Buffer.byteLength(secret, 'utf8') < 32) {
    return failure(503, 'Email-change delivery is not configured.');
  }
  let origin: string;
  try { origin = new URL(baseURL).origin; }
  catch { return failure(503, 'Email-change delivery is not configured correctly.'); }
  if (request.headers.get('origin') !== origin) return failure(403, 'Invalid request origin.');
  if (!request.headers.get('content-type')?.startsWith('application/json')) return failure(415, 'Use a JSON request.');
  const length = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(length) && length > 16_384) return failure(413, 'The email-change request is too large.');

  const reader = request.body?.getReader();
  if (!reader) return failure(400, 'Missing request body.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 16_384) {
      await reader.cancel();
      return failure(413, 'The email-change request is too large.');
    }
    chunks.push(value);
  }
  let value: unknown;
  try { value = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { return failure(400, 'Invalid JSON request.'); }
  const parsed = adminEmailChangeDeliverySchema.safeParse(value);
  if (!parsed.success) return failure(400, 'Invalid email-change delivery request.');
  const delivery = parsed.data;
  const expectedCallback = new URL('/change-email/confirm', origin);
  expectedCallback.searchParams.set('token', delivery.token);
  if (delivery.oldEmail === delivery.newEmail || delivery.callbackURL !== expectedCallback.href ||
      !verifyAdminEmailChangeDelivery(secret, request.headers, delivery)) {
    return failure(401, 'Invalid admin email-change request.');
  }

  const timestamp = request.headers.get(adminEmailChangeSignatureHeaders.timestamp);
  const nonce = request.headers.get(adminEmailChangeSignatureHeaders.nonce);
  if (!timestamp || !nonce) return failure(401, 'Invalid admin email-change request.');
  const now = Date.now();
  let consumed;
  try {
    await database('rateLimits').whereLike('key', 'admin-email-change:%').where('lastRequest', '<', now - 120_000).delete();
    consumed = await database('rateLimits').insert({
      id: randomUUID(),
      key: `admin-email-change:${nonce}`,
      count: 1,
      lastRequest: now,
    }).onConflict('key').ignore().returning('key');
  } catch {
    console.error('Signed admin email-change nonce could not be consumed.');
    return failure(503, 'Email-change delivery is temporarily unavailable.');
  }
  if (consumed.length !== 1) return failure(401, 'This admin email-change request was already used.');

  const verificationLink = new URL(delivery.callbackURL);
  try {
    await verifyEmailDelivery(origin);
    const deliveryResults = await Promise.allSettled([
      sendEmail({
        to: delivery.newEmail,
        ...renderCustomerEmailChangeVerificationEmail(verificationLink.href),
      }, origin),
      sendEmail({
        to: delivery.oldEmail,
        ...renderCustomerEmailChangeNotificationEmail(),
      }, origin),
    ]);
    if (deliveryResults.some(result => result.status === 'rejected')) {
      console.error('At least one customer email-change notification could not be delivered.');
      return failure(503, 'Email delivery is temporarily unavailable. Start a new request to try again.');
    }
  } catch {
    console.error('Customer email-change notifications could not be delivered.');
    return failure(503, 'Email delivery is temporarily unavailable. Start a new request to try again.');
  }
  return Response.json({ status: true }, { headers: responseHeaders });
}
