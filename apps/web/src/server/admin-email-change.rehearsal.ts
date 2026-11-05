import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDatabase } from '@salesmora/data/database';
import { adminEmailChangeTokenHash, signAdminEmailChangeDelivery } from '@salesmora/data/admin-email-change-signature';

const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const ownerURL = process.env.TEST_DATABASE_URL;
if (!ownerURL || ownerURL === process.env.DATABASE_URL || !new URL(ownerURL).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(ownerURL).hostname) || !process.env.DB_WEB_PASSWORD) {
  throw new Error('Use an isolated local test database and provision DB_WEB_PASSWORD.');
}
const webURL = new URL(ownerURL);
webURL.username = 'salesmora_web';
webURL.password = process.env.DB_WEB_PASSWORD;
const origin = 'https://app.example.test';
const secret = randomUUID() + randomUUID();
process.env.DATABASE_URL = webURL.href;
process.env.BETTER_AUTH_URL = origin;
process.env.ADMIN_EMAIL_CHANGE_SECRET = secret;
process.env.EMAIL_PROVIDER = 'resend';
process.env.EMAIL_FROM = 'SalesMora Rehearsal <no-reply@example.test>';
process.env.RESEND_API_KEY = 'rehearsal-only-key';

const owner = createDatabase(ownerURL);
const suffix = randomUUID();
const userId = `email-change-web-${suffix}`;
const oldEmail = `old-${suffix}@example.test`;
const newEmail = `new-${suffix}@example.test`;
const token = randomBytes(32).toString('base64url');
const deliveryToken = randomBytes(32).toString('base64url');
const deliveryNonceKey = `admin-email-change:`;
const now = new Date();
const sessionId = randomUUID();

const { deliverAdminEmailChange } = await import('./admin-email-change-delivery');
const confirmation = await import('../app/change-email/confirm/route');
const { adminEmailChangeSignatureHeaders } = await import('@salesmora/data/admin-email-change-signature');
const web = createDatabase(webURL.href);

function deliveryPayload(requestId: string, valueToken: string) {
  const callback = new URL('/change-email/confirm', origin);
  callback.searchParams.set('token', valueToken);
  return {
    requestId,
    oldEmail,
    newEmail,
    token: valueToken,
    callbackURL: callback.href,
  };
}

function deliveryRequest(payload: ReturnType<typeof deliveryPayload>, signed = signAdminEmailChangeDelivery(secret, payload)) {
  const headers = new Headers({
    'content-type': 'application/json',
    origin,
    [adminEmailChangeSignatureHeaders.timestamp]: signed.timestamp,
    [adminEmailChangeSignatureHeaders.nonce]: signed.nonce,
    [adminEmailChangeSignatureHeaders.signature]: signed.signature,
  });
  return new Request(`${origin}/api/auth/admin-email-change`, { method: 'POST', headers, body: JSON.stringify(payload) });
}

try {
  await owner('users').insert({
    id: userId, name: userId, email: oldEmail, emailVerified: false,
    deletionRequestedAt: null, createdAt: now, updatedAt: now, termsVersion: 'rehearsal', termsAcceptedAt: now,
  });
  await owner('sessions').insert({
    id: sessionId, userId, token: randomUUID(), expiresAt: new Date(Date.now() + 3_600_000), createdAt: now, updatedAt: now,
  });
  const requestId = randomUUID();
  await owner.withSchema('admin').table('userEmailChanges').insert({
    id: requestId,
    tokenHash: adminEmailChangeTokenHash(token),
    userId,
    oldEmail,
    newEmail,
    reason: 'Customer requested an email change',
    requestedBy: `staff-${suffix}`,
    staffRole: 'super_admin',
    requestId,
    createdAt: now,
    expiresAt: new Date(Date.now() + 3_600_000),
  });

  const beforeGet = await owner.withSchema('admin').table('userEmailChanges').where({ id: requestId }).first('consumedAt');
  const getResponse = await confirmation.GET(new Request(`${origin}/change-email/confirm?token=${token}`));
  assert.equal(getResponse.status, 200);
  assert.equal(getResponse.headers.get('cache-control'), 'no-store, max-age=0');
  assert.equal(getResponse.headers.get('referrer-policy'), 'no-referrer');
  assert.match(await getResponse.text(), /<form method="post"/);
  assert.equal((await owner('users').where({ id: userId }).first('email')).email, oldEmail);
  assert.deepEqual(await owner.withSchema('admin').table('userEmailChanges').where({ id: requestId }).first('consumedAt'), beforeGet,
    'prefetched GET does not consume or complete the email change');
  assert.equal((await owner('sessions').where({ userId }).count<{ count: string }[]>('* as count'))[0].count, '1');

  const wrongOrigin = await confirmation.POST(new Request(`${origin}/change-email/confirm`, {
    method: 'POST', headers: { origin: 'https://attacker.example', 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ token }),
  }));
  assert.equal(wrongOrigin.status, 403);
  const postResponse = await confirmation.POST(new Request(`${origin}/change-email/confirm`, {
    method: 'POST', headers: { origin, 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ token }),
  }));
  assert.equal(postResponse.status, 200);
  assert.equal(postResponse.headers.get('location'), null);
  assert.equal(postResponse.headers.get('referrer-policy'), 'no-referrer');
  const confirmationHtml = await postResponse.text();
  assert.match(confirmationHtml, /All customer sessions have been revoked/);
  assert.equal(confirmationHtml.includes(token), false);
  assert.equal((await owner('users').where({ id: userId }).first('email')).email, newEmail);
  assert.equal((await owner('sessions').where({ userId }).count<{ count: string }[]>('* as count'))[0].count, '0');
  assert.equal((await confirmation.POST(new Request(`${origin}/change-email/confirm`, {
    method: 'POST', headers: { origin, 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ token }),
  }))).status, 409);

  const requests: Array<{ url: string; body: Record<string, unknown> }> = [];
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (input, init) => {
      requests.push({ url: String(input), body: JSON.parse(String(init?.body)) as Record<string, unknown> });
      return Response.json({ id: `rehearsal-${requests.length}` });
    };
    const delivery = deliveryPayload(randomUUID(), deliveryToken);
    const signature = signAdminEmailChangeDelivery(secret, delivery);
    const bridgeResponse = await deliverAdminEmailChange(deliveryRequest(delivery, signature));
    assert.equal(bridgeResponse.status, 200);
    const bridgeBody = await bridgeResponse.json();
    assert.deepEqual(bridgeBody, { status: true });
    assert.equal(JSON.stringify(bridgeBody).includes(deliveryToken), false);
    assert.equal(requests.length, 2);
    const verificationMail = requests.find(item => JSON.stringify(item.body).includes(deliveryToken));
    const oldAddressMail = requests.find(item => !JSON.stringify(item.body).includes(deliveryToken));
    assert.equal(verificationMail?.url, 'https://api.resend.com/emails');
    assert.deepEqual(verificationMail?.body.to, [newEmail]);
    assert.match(String(verificationMail?.body.html), new RegExp(deliveryToken));
    assert.deepEqual(oldAddressMail?.body.to, [oldEmail]);
    assert.equal(JSON.stringify(oldAddressMail?.body).includes(deliveryToken), false);
    const replay = await deliverAdminEmailChange(deliveryRequest(delivery, signature));
    assert.equal(replay.status, 401, 'signed delivery nonces are one-use');
    const nonceRows = await web('rateLimits').whereLike('key', `${deliveryNonceKey}%`).select<{ key: string }[]>('key');
    assert.equal(nonceRows.length, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
  console.log('PASS non-mutating confirmation GET, explicit one-use POST, fresh sign-in, and signed two-address email delivery');
} finally {
  await web('rateLimits').whereLike('key', `${deliveryNonceKey}%`).delete();
  await owner.withSchema('admin').table('userEmailChanges').where({ userId }).delete();
  await owner('users').where({ id: userId }).delete();
  await Promise.all([owner.destroy(), web.destroy()]);
}
