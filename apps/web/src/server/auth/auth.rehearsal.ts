import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDatabase } from '@salesmora/data/database';
import {
  adminEmailVerificationSignatureHeaders,
  signAdminEmailVerificationRequest,
} from '@salesmora/data/admin-email-verification-signature';

const env = fileURLToPath(new URL('../../../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const databaseURL = process.env.TEST_DATABASE_URL;
if (!databaseURL || databaseURL === process.env.DATABASE_URL || !new URL(databaseURL).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(databaseURL).hostname)) {
  throw new Error('Use an isolated local test database for the email-verification bridge rehearsal.');
}

const baseURL = 'http://localhost:3000';
const secret = randomUUID() + randomUUID();
process.env.DATABASE_URL = databaseURL;
process.env.BETTER_AUTH_SECRET = randomUUID() + randomUUID();
process.env.BETTER_AUTH_URL = baseURL;
process.env.TERMS_VERSION = 'email-verification-bridge-rehearsal';
process.env.ADMIN_EMAIL_VERIFICATION_SECRET = secret;

const database = createDatabase(databaseURL);
const { auth } = await import('./auth');
const context = await auth.$context;
const email = `missing-${randomUUID()}@example.test`;
const callbackURL = new URL('/verify-email', baseURL).href;
const signed = signAdminEmailVerificationRequest(secret, email, callbackURL);
const requestHeaders = new Headers({
  'content-type': 'application/json',
  origin: baseURL,
  [adminEmailVerificationSignatureHeaders.timestamp]: signed.timestamp,
  [adminEmailVerificationSignatureHeaders.nonce]: signed.nonce,
  [adminEmailVerificationSignatureHeaders.signature]: signed.signature,
});
const request = () => new Request(new URL('/api/auth/send-verification-email', baseURL), {
  method: 'POST',
  headers: requestHeaders,
  body: JSON.stringify({ email, callbackURL }),
});

try {
  const accepted = await auth.handler(request());
  assert.equal(accepted.status, 200);
  const acceptedBody: unknown = await accepted.json();
  assert.ok(acceptedBody && typeof acceptedBody === 'object' && 'status' in acceptedBody && acceptedBody.status === true);
  assert.equal(JSON.stringify(acceptedBody).includes(email), false);
  assert.ok(await database('rateLimits').where({ key: `admin-email-verification:${signed.nonce}` }).first('key'),
    'the web hook must consume each signed nonce');
  const replay = await auth.handler(request());
  assert.notEqual(replay.status, 200, 'a signed request nonce cannot be reused');
  console.log('PASS signed admin resend bypass, enumeration-safe response, and one-time nonce enforcement');
} finally {
  await database('rateLimits').where({ key: `admin-email-verification:${signed.nonce}` }).delete();
  await Promise.all([database.destroy(), context.options.database?.end?.()]);
}
