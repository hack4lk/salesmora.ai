import assert from 'node:assert/strict';
import { createHash, createSign, generateKeyPairSync, randomBytes, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { makeSignature } from 'better-auth/crypto';
import { symmetricDecrypt, symmetricEncrypt } from 'better-auth/crypto';
import { isoCBOR } from '@simplewebauthn/server/helpers';
import { createDatabase } from '@salesmora/data';
import { generateStaffTotpSecret, staffTotpMatches } from './staff-totp';

const envFile = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);

const ownerURL = process.env.TEST_DATABASE_URL;
if (!ownerURL || !new URL(ownerURL).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(ownerURL).hostname)) {
  throw Error('Use the isolated local test database.');
}
const adminPassword = process.env.DB_ADMIN_APP_PASSWORD;
if (!adminPassword) throw Error('Set DB_ADMIN_APP_PASSWORD and run pnpm db:roles:test.');

const adminURL = new URL(ownerURL);
adminURL.username = 'salesmora_admin_app';
adminURL.password = adminPassword;
process.env.ADMIN_DATABASE_URL = adminURL.toString();
process.env.ADMIN_AUTH_SECRET = randomUUID() + randomUUID();
process.env.ADMIN_AUTH_URL = 'http://localhost:3003';

const owner = createDatabase(ownerURL);
await owner.withSchema('admin').table('staffRateLimits').delete();
const { auth } = await import('./auth');
const { getAdminSession } = await import('./get-admin-session');
const authContext = await auth.$context;
const email = `admin-auth-${randomUUID()}@karpukcreative.com`;
const password = `A-strong-admin-${randomUUID()}-Password`;
const userId = randomUUID();
const now = new Date();
const passwordHash = await authContext.password.hash(password);
let passed = 0;

async function request(
  path: string,
  method: 'GET' | 'POST',
  body?: unknown,
  cookie?: string,
  accessEmail: string | null = email,
) {
  const headers = new Headers({ origin: process.env.ADMIN_AUTH_URL! });
  if (accessEmail) headers.set('x-admin-access-email', accessEmail);
  if (body !== undefined) headers.set('content-type', 'application/json');
  if (cookie) headers.set('cookie', cookie);
  return auth.handler(new Request(`${process.env.ADMIN_AUTH_URL}/api/auth${path}`, {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  }));
}

async function signIn() {
  return request('/sign-in/email', 'POST', { email, password });
}

async function sessionCookie(token: string) {
  const signedToken = `${token}.${await makeSignature(token, authContext.secret)}`;
  return `${authContext.authCookies.sessionToken.name}=${signedToken}`;
}

function responseCookie(response: Response, name: string) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = response.headers.get('set-cookie')?.match(new RegExp(`(?:^|,\\s*)${escapedName}=([^;,]*)`));
  assert.ok(match, `expected ${name} cookie`);
  return `${name}=${match[1]}`;
}

try {
  await owner.withSchema('admin').table('staffUsers').insert({
    id: userId,
    name: 'Admin Auth Rehearsal',
    email,
    emailVerified: true,
    twoFactorEnabled: false,
    createdAt: now,
    updatedAt: now,
  });
  await owner.withSchema('admin').table('staffAccounts').insert({
    id: randomUUID(),
    userId,
    accountId: userId,
    providerId: 'credential',
    password: passwordHash,
    createdAt: now,
    updatedAt: now,
  });

  const signup = await request('/sign-up/email', 'POST', {
    name: 'Unexpected Account',
    email: `signup-${randomUUID()}@karpukcreative.com`,
    password,
  });
  assert.equal(signup.ok, false, 'public signup must be disabled');
  passed++;

  const legacyEmail = 'admin@salesmora.ai';
  const legacySignIn = await request('/sign-in/email', 'POST', {
    email: legacyEmail, password,
  }, undefined, legacyEmail);
  assert.equal(legacySignIn.status, 401, 'legacy staff domains are rejected even with a matching Access identity');
  passed++;

  const unverifiedIdentity = await request(
    '/sign-in/email',
    'POST',
    { email, password },
    undefined,
    null,
  );
  assert.equal(unverifiedIdentity.status, 401, 'staff sign-in must require a verified Access identity');
  passed++;

  const noFactor = await signIn();
  assert.equal(noFactor.status, 401, 'password-only sign-in must be denied');
  assert.equal((await owner.withSchema('admin').table('staffSessions').where({ userId })).length, 0);
  passed++;

  const credentialID = randomBytes(32).toString('base64url');
  const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const publicJwk = publicKey.export({ format: 'jwk' });
  assert.ok(publicJwk.x && publicJwk.y, 'generated passkey public key must use P-256');
  const cosePublicKey = isoCBOR.encode(new Map<number, number | Buffer>([
    [1, 2],
    [3, -7],
    [-1, 1],
    [-2, Buffer.from(publicJwk.x, 'base64url')],
    [-3, Buffer.from(publicJwk.y, 'base64url')],
  ]));
  await owner.withSchema('admin').table('staffPasskeys').insert({
    id: randomUUID(),
    publicKey: Buffer.from(cosePublicKey).toString('base64'),
    userId,
    credentialID,
    counter: 0,
    deviceType: 'singleDevice',
    backedUp: false,
  });
  const passkeyChallenge = await signIn();
  assert.equal(passkeyChallenge.ok, true, 'password + enrolled passkey must start a second-factor challenge');
  const passkeyChallengeBody = await passkeyChallenge.json() as { twoFactorRedirect?: boolean; twoFactorMethods?: string[] };
  assert.equal(passkeyChallengeBody.twoFactorRedirect, true);
  assert.deepEqual(passkeyChallengeBody.twoFactorMethods, ['passkey']);
  assert.equal((await owner.withSchema('admin').table('staffSessions').where({ userId })).length, 0);
  assert.match(passkeyChallenge.headers.get('set-cookie') ?? '', /sm_admin\.two_factor=/);

  const factorCookie = responseCookie(
    passkeyChallenge,
    authContext.createAuthCookie('two_factor').name,
  );
  const optionsResponse = await request(
    '/passkey/generate-authenticate-options',
    'GET',
    undefined,
    factorCookie,
  );
  assert.equal(optionsResponse.ok, true, 'passkey authentication options must be issued');
  const options = await optionsResponse.json() as { challenge: string };
  const webAuthnCookie = responseCookie(optionsResponse, 'sm_admin.sm_admin_passkey_challenge');
  const clientDataJSON = Buffer.from(JSON.stringify({
    type: 'webauthn.get',
    challenge: options.challenge,
    origin: process.env.ADMIN_AUTH_URL,
    crossOrigin: false,
  }));
  const authenticatorData = Buffer.concat([
    createHash('sha256').update('localhost').digest(),
    Buffer.from([0x05]),
    Buffer.from([0, 0, 0, 1]),
  ]);
  const signature = createSign('SHA256')
    .update(authenticatorData)
    .update(createHash('sha256').update(clientDataJSON).digest())
    .end()
    .sign(privateKey);
  const credentialId = Buffer.from(credentialID, 'base64url');
  const assertion = {
    id: credentialId.toString('base64url'),
    rawId: credentialId.toString('base64url'),
    response: {
      authenticatorData: authenticatorData.toString('base64url'),
      clientDataJSON: clientDataJSON.toString('base64url'),
      signature: signature.toString('base64url'),
      userHandle: null,
    },
    type: 'public-key',
    clientExtensionResults: {},
  };
  const verifyPasskey = () => request(
    '/passkey/verify-authentication',
    'POST',
    { response: assertion },
    `${factorCookie}; ${webAuthnCookie}`,
  );
  const passkeyVerification = await verifyPasskey();
  const passkeyVerificationBody = await passkeyVerification.clone().text();
  assert.equal(
    passkeyVerification.ok,
    true,
    `valid password-bound, user-verified passkey assertion must authenticate: ${passkeyVerification.status} ${passkeyVerificationBody}`,
  );
  const passkeySession = await passkeyVerification.json() as { session?: { token: string } };
  assert.ok(passkeySession.session?.token, 'successful second factor must establish an admin session');
  assert.ok(await getAdminSession(new Headers({ cookie: await sessionCookie(passkeySession.session.token) })));
  assert.equal((await verifyPasskey()).ok, false, 'a successful assertion challenge cannot be replayed');
  await owner.withSchema('admin').table('staffSessions').where({ token: passkeySession.session.token }).delete();
  passed++;

  await owner.withSchema('admin').table('staffUsers').where({ id: userId }).update({ twoFactorEnabled: true });
  const totpSecret = generateStaffTotpSecret();
  const totpCode = (await auth.api.generateTOTP({ body: { secret: totpSecret } })).code;
  assert.ok(staffTotpMatches(totpSecret, totpCode), 'generated TOTP code must match the staff verifier');
  const recoveryCode = 'ABCDE-FGHIJ';
  const encryptedTotpSecret = await symmetricEncrypt({ key: authContext.secret, data: totpSecret });
  assert.equal(await symmetricDecrypt({ key: authContext.secret, data: encryptedTotpSecret }), totpSecret);
  await owner.withSchema('admin').table('staffTwoFactors').insert({
    id: randomUUID(),
    userId,
    secret: encryptedTotpSecret,
    backupCodes: await symmetricEncrypt({ key: authContext.secret, data: JSON.stringify([recoveryCode]) }),
    verified: true,
  });
  const totpChallenge = await signIn();
  assert.equal(totpChallenge.ok, true, 'password + TOTP must start a second-factor challenge');
  const totpChallengeBody = await totpChallenge.json() as { twoFactorRedirect?: boolean; twoFactorMethods?: string[] };
  assert.equal(totpChallengeBody.twoFactorRedirect, true);
  assert.deepEqual(totpChallengeBody.twoFactorMethods, ['totp', 'passkey', 'backup']);
  assert.equal((await owner.withSchema('admin').table('staffSessions').where({ userId })).length, 0);
  passed++;

  const totpCookie = responseCookie(
    totpChallenge,
    authContext.createAuthCookie('two_factor').name,
  );
  const totpVerification = await request(
    '/two-factor/verify-totp',
    'POST',
    { code: totpCode, trustDevice: false },
    totpCookie,
  );
  assert.equal(
    totpVerification.ok,
    true,
    `valid TOTP must complete the password-bound challenge: ${totpVerification.status} ${await totpVerification.clone().text()}`,
  );
  const totpSession = await totpVerification.json() as { token?: string; user?: { email: string } };
  assert.ok(totpSession.token, 'successful TOTP verification must return the new session token');
  assert.ok(await getAdminSession(new Headers({ cookie: await sessionCookie(totpSession.token) })));
  const signedOutCookie = await sessionCookie(totpSession.token);
  const signOutResponse = await request('/sign-out', 'POST', {}, signedOutCookie);
  assert.equal(signOutResponse.ok, true, 'staff sign-out must succeed');
  assert.ok(signOutResponse.headers.get('set-cookie')?.includes('Max-Age=0'), 'sign-out must expire auth cookies');
  assert.equal(await owner.withSchema('admin').table('staffSessions').where({ token: totpSession.token }).first(), undefined);
  assert.equal(await getAdminSession(new Headers({ cookie: signedOutCookie })), null, 'revoked session cookie must not authorize Admin');
  passed++;

  await owner.withSchema('admin').table('staffRateLimits').delete();
  const recoveryChallenge = await signIn();
  assert.equal(
    recoveryChallenge.ok,
    true,
    `password must start a challenge before recovery-code verification: ${recoveryChallenge.status} ${await recoveryChallenge.clone().text()}`,
  );
  const recoveryCookie = responseCookie(
    recoveryChallenge,
    authContext.createAuthCookie('two_factor').name,
  );
  const recoveryVerification = await request(
    '/two-factor/verify-backup-code',
    'POST',
    { code: recoveryCode },
    recoveryCookie,
  );
  assert.equal(
    recoveryVerification.ok,
    true,
    `a valid recovery code must complete the password-bound challenge: ${recoveryVerification.status} ${await recoveryVerification.clone().text()}`,
  );
  const recoverySession = await recoveryVerification.json() as { token?: string; user?: { email: string } };
  assert.ok(recoverySession.token, 'successful recovery-code verification must return the new session token');
  assert.ok(await getAdminSession(new Headers({ cookie: await sessionCookie(recoverySession.token) })));
  assert.equal(
    (await request('/two-factor/verify-backup-code', 'POST', { code: recoveryCode }, recoveryCookie)).ok,
    false,
    'a recovery code cannot be reused',
  );
  await owner.withSchema('admin').table('staffSessions').where({ token: recoverySession.token }).delete();
  passed++;

  const customerCookieSession = await request(
    '/get-session',
    'GET',
    undefined,
    'better-auth.session_token=customer-session-token',
  );
  const customerSessionBody = await customerCookieSession.json() as { session?: unknown } | null;
  assert.ok(
    customerSessionBody === null || customerSessionBody.session === null,
    'customer auth cookies must not create admin sessions',
  );
  assert.equal(
    await getAdminSession(new Headers({ cookie: 'better-auth.session_token=customer-session-token' })),
    null,
    'the admin page session guard must reject customer auth cookies',
  );
  passed++;

  const idleCreatedAt = new Date(Date.now() - 31 * 60 * 1000);
  const idleToken = randomUUID();
  await owner.withSchema('admin').table('staffSessions').insert({
    id: randomUUID(),
    userId,
    token: idleToken,
    expiresAt: new Date(idleCreatedAt.getTime() + 8 * 60 * 60 * 1000),
    createdAt: idleCreatedAt,
    updatedAt: idleCreatedAt,
  });
  const idleCookie = await sessionCookie(idleToken);
  assert.equal(
    await getAdminSession(new Headers({ cookie: idleCookie })),
    null,
    'the admin page session guard must reject idle sessions',
  );
  passed++;

  const activeCreatedAt = new Date(Date.now() - 2 * 60 * 1000);
  const activeToken = randomUUID();
  await owner.withSchema('admin').table('staffSessions').insert({
    id: randomUUID(),
    userId,
    token: activeToken,
    expiresAt: new Date(activeCreatedAt.getTime() + 8 * 60 * 60 * 1000),
    createdAt: activeCreatedAt,
    updatedAt: activeCreatedAt,
  });
  const activeSession = await getAdminSession(new Headers({ cookie: await sessionCookie(activeToken) }));
  assert.ok(activeSession?.session, 'active sessions refresh within the absolute session lifetime');
  const refreshedSession = await owner.withSchema('admin').table('staffSessions').where({ token: activeToken }).first();
  assert.ok(new Date(refreshedSession.updatedAt).getTime() > activeCreatedAt.getTime());
  passed++;

  console.log(`Admin authentication rehearsal passed (${passed} checks).`);
} finally {
  await owner.withSchema('admin').table('staffVerifications').where({ value: userId }).delete();
  await owner.withSchema('admin').table('staffUsers').where({ id: userId }).delete();
  const adminPool = (globalThis as typeof globalThis & {
    salesmoraAdminAuthPool?: { end: () => Promise<void> };
  }).salesmoraAdminAuthPool;
  await Promise.all([owner.destroy(), ...(adminPool ? [adminPool.end()] : [])]);
}
