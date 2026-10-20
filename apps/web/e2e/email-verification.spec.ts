import { expect, test, type APIRequestContext } from '@playwright/test';
import { createHmac } from 'node:crypto';
import { createDatabase } from '@salesmora/data';
import { emailVerificationNoticeData as copy } from '../src/features/auth/email-verification-notice/email-verification-notice.data';
const testURL = process.env.TEST_DATABASE_URL;
if (!testURL || !new URL(testURL).pathname.endsWith('_test') || testURL === process.env.DATABASE_URL) throw new Error('Tests require an isolated _test database.');
const db = createDatabase(testURL);
const origin = 'http://127.0.0.1:3002';
const headers = { Origin: origin };
const mailpit = 'http://127.0.0.1:18025';
const addresses = new Set<string>();
let email: string;
const password = 'Fictional-verification-password-42!';
test.beforeEach(async () => {
  email = `verify-${crypto.randomUUID()}@example.com`; addresses.add(email);
  await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE');
});
test.afterAll(async () => {
  for (const address of addresses) {
    const messages = await inbox(address);
    if (messages.length) await fetch(`${mailpit}/api/v1/messages`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ IDs: messages.map(message => message.ID) }) });
  }
  await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE');
  await db.destroy();
});
async function inbox(address = email): Promise<Array<{ ID: string }>> {
  return (await (await fetch(`${mailpit}/api/v1/search?query=${encodeURIComponent(`to:${address}`)}`)).json()).messages;
}
async function seed(request: APIRequestContext) {
  expect((await request.post('/api/auth/sign-up/email', { headers, data: { name: 'Verification Tester', email, password, termsAccepted: true } })).ok()).toBe(true);
}
async function readLink() {
  await expect.poll(async () => (await inbox()).length).toBeGreaterThan(0);
  const [{ ID }] = await inbox();
  const message = await (await fetch(`${mailpit}/api/v1/message/${ID}`)).json();
  expect(message.Subject).toBe('Verify your SalesMora.ai email');
  expect(message.HTML).toContain('cid:salesmora-logo');
  expect(message.Text).toContain('1 hour');
  const link = message.Text.match(/http:\/\/127\.0\.0\.1:3002\/api\/auth\/verify-email\?[^\s]+/)?.[0];
  expect(link).toBeTruthy();
  expect(new URL(link!).searchParams.get('callbackURL')).toBe(`${origin}/verify-email`);
  const payload = JSON.parse(Buffer.from(new URL(link!).searchParams.get('token')!.split('.')[1], 'base64url').toString());
  expect(payload.exp - Math.floor(Date.now() / 1000)).toBeGreaterThan(3500);
  return link!;
}
async function resend(request: APIRequestContext, data: object = {}, requestOrigin = origin) {
  return request.post('/api/auth/send-verification-email', { headers: { Origin: requestOrigin }, data });
}
test('registration email verifies account, preserves setup access, and replays harmlessly', async ({ page }) => {
  await seed(page.context().request);
  await page.goto('/setup');
  await expect(page.getByRole('heading', { name: 'Set up your workspace', exact: true })).toBeVisible();
  expect((await db('users').where({ email }).first()).emailVerified).toBe(false);
  const link = await readLink();
  await page.goto(link);
  await expect(page).toHaveURL(`${origin}/verify-email`);
  await expect(page.getByRole('status')).toHaveAccessibleDescription(copy.verified);
  await expect(page.getByRole('button', { name: copy.resend })).toHaveCount(0);
  expect((await db('users').where({ email }).first()).emailVerified).toBe(true);
  expect((await page.context().request.get('/api/auth/get-session')).ok()).toBe(true);
  expect((await (await page.context().request.get('/api/auth/get-session')).json()).user.emailVerified).toBe(true);
  await page.reload();
  await expect(page.getByRole('status')).toHaveAccessibleDescription(copy.verified);
  await page.goto(link);
  await expect(page.getByRole('status')).toHaveAccessibleDescription(copy.verified);
  expect(await db('sessions')).toHaveLength(1);
  await page.getByRole('link', { name: copy.page.continue }).click();
  await expect(page).toHaveURL(/\/setup$/);
});
test('Home resend uses authenticated email, sends actual mail, and enforces cooldown on the server', async ({ page }) => {
  await seed(page.context().request);
  const response = await page.context().request.post('/api/workspaces', { headers, data: { business: { businessName: 'Verification Plumbing', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [{ email: 'invite@example.com', role: 'office' }] } } });
  expect(response.ok()).toBe(true);
  await page.goto('/home');
  const section = page.getByRole('region', { name: copy.title });
  await expect(section.getByText(email, { exact: true })).toBeVisible();
  const result = page.waitForResponse(response => response.url().endsWith('/send-verification-email'));
  await page.getByRole('button', { name: copy.resend }).click();
  expect((await result).status()).toBe(200);
  await expect(page.getByRole('status')).toHaveAccessibleDescription(copy.sent);
  await expect(page.getByRole('button', { name: copy.resend })).toBeDisabled();
  await expect.poll(async () => (await inbox()).length).toBe(2);
  expect((await resend(page.context().request)).status()).toBe(429);
  await page.goto(await readLink());
  await page.goto('/home');
  await expect(page.getByRole('region', { name: copy.title })).toHaveCount(0);
  await expect(page.getByRole('region', { name: copy.verifiedTitle })).toHaveCount(0);
  await expect(page.getByRole('button', { name: copy.resend })).toHaveCount(0);
  expect((await db('workspaceInvitations').first()).status).toBe('sent');
});
test('rejects signed-out requests, forged recipients, and untrusted origins without delivery', async ({ request }) => {
  expect((await resend(request, { email })).status()).toBe(401);
  await db('rateLimits').delete();
  await seed(request);
  expect((await resend(request, { email: 'another@example.com' })).status()).toBe(403);
  await db('rateLimits').delete();
  expect((await resend(request, {}, 'https://untrusted.example')).status()).toBe(403);
  await db('rateLimits').delete();
  const response = await resend(request, { callbackURL: 'https://untrusted.example' });
  expect(response.status()).toBe(403);
  expect(await inbox()).toHaveLength(1);
  await db('rateLimits').delete();
  expect((await resend(request, { callbackURL: '/unwanted-path' })).status()).toBe(200);
  await expect.poll(async () => (await inbox()).length).toBe(2);
  await readLink();
});
test('invalid, expired, and tampered tokens do not verify; untrusted redirects are blocked', async ({ page }) => {
  await seed(page.context().request);
  const valid = new URL(await readLink());
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const body = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ email, exp: Math.floor(Date.now() / 1000) - 60 })}`;
  const expired = `${body}.${createHmac('sha256', process.env.BETTER_AUTH_SECRET!).update(body).digest('base64url')}`;
  for (const token of ['invalid', expired, valid.searchParams.get('token')! + 'tampered']) {
    const link = new URL(valid); link.searchParams.set('token', token);
    await page.goto(link.href);
    await expect(page.getByRole('alert', { name: copy.page.errorTitle })).toHaveAccessibleDescription(copy.page.error);
    expect((await db('users').where({ email }).first()).emailVerified).toBe(false);
    expect(new URL(page.url()).searchParams.has('token')).toBe(false);
  }
  valid.searchParams.set('callbackURL', 'https://untrusted.example');
  expect((await page.context().request.get(valid.href, { maxRedirects: 0 })).status()).toBe(403);
  expect((await db('users').where({ email }).first()).emailVerified).toBe(false);
});
test('verification in a signed-out browser does not create a session or replace another user', async ({ page, request }) => {
  await seed(request);
  const link = await readLink();
  await page.goto(link);
  await expect(page.getByText(copy.page.signedOut)).toBeVisible();
  expect(await page.context().request.get('/api/auth/get-session').then(response => response.json())).toBeNull();
  expect((await db('users').where({ email }).first()).emailVerified).toBe(true);
  const first = email;
  email = `verify-other-${crypto.randomUUID()}@example.com`; addresses.add(email);
  await seed(page.context().request);
  await page.goto(link);
  const session = await (await page.context().request.get('/api/auth/get-session')).json();
  expect(session.user.email).toBe(email);
  expect(session.user.emailVerified).toBe(false);
  expect((await db('users').where({ email: first }).first()).emailVerified).toBe(true);
});
for (const width of [1440, 320]) test(`verification result fits ${width}px and resend retries safely`, async ({ page }) => {
  await seed(page.context().request);
  await page.setViewportSize({ width, height: 1000 });
  await page.goto('/verify-email?error=INVALID_TOKEN');
  await page.route('**/api/auth/send-verification-email', route => route.fulfill({ status: 503, body: 'Private SMTP detail' }));
  await page.getByRole('button', { name: copy.resend }).click();
  await expect(page.getByRole('alert', { name: copy.errorTitle })).toHaveAccessibleDescription(copy.error);
  await expect(page.getByText('Private SMTP detail')).toHaveCount(0);
  await page.unroute('**/api/auth/send-verification-email');
  await page.getByRole('button', { name: copy.resend }).click();
  await expect(page.getByRole('status')).toHaveAccessibleDescription(copy.sent);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `/private/tmp/salesmora-live-verification-${width}.png`, fullPage: true });
});
