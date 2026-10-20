import { expect, test, type APIRequestContext } from '@playwright/test';
import { createDatabase } from '@salesmora/data';
import { passwordRecoveryFormData as recovery } from '../src/features/auth/password-recovery-form/password-recovery-form.data';
import { resetPasswordFormData as reset } from '../src/features/auth/reset-password-form/reset-password-form.data';

const testURL = process.env.TEST_DATABASE_URL;
if (!testURL || !new URL(testURL).pathname.endsWith('_test') || testURL === process.env.DATABASE_URL) throw new Error('Tests require an isolated _test database.');
const db = createDatabase(testURL);
const origin = 'http://127.0.0.1:3002';
const mailpit = 'http://127.0.0.1:18025';
let email: string;
const password = 'Fictional-original-password-42!';
const nextPassword = ' Fictional-replacement-password-42! ';
const ownedMessages = new Set<string>();

test.beforeEach(async () => {
  email = `reset-${crypto.randomUUID()}@example.com`;
  await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE');
});
test.afterAll(async () => {
  // Delete only emails created by this test file, preserving the developer's inbox.
  for (const id of ownedMessages) await fetch(`${mailpit}/api/v1/messages`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ IDs: [id] }) });
  await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE');
  await db.destroy();
});
async function seed(request: APIRequestContext) {
  expect((await request.post('/api/auth/sign-up/email', { headers: { Origin: origin }, data: { name: 'Reset Tester', email, password, termsAccepted: true } })).ok()).toBe(true);
}
async function requestReset(request: APIRequestContext, address = email) {
  return request.post('/api/auth/request-password-reset', { headers: { Origin: origin }, data: { email: address, redirectTo: `${origin}/unwanted-path` } });
}
async function messages() {
  const response = await fetch(`${mailpit}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`);
  expect(response.ok).toBe(true);
  const all = (await response.json()).messages as Array<{ ID: string; Subject: string }>;
  for (const message of all) ownedMessages.add(message.ID);
  return all.filter(message => message.Subject === 'Reset your SalesMora.ai password');
}
async function readLink() {
  await expect.poll(async () => (await messages()).length).toBe(1);
  const [{ ID }] = await messages();
  ownedMessages.add(ID);
  const message = await (await fetch(`${mailpit}/api/v1/message/${ID}`)).json();
  expect(message.Subject).toBe('Reset your SalesMora.ai password');
  expect(message.HTML).toContain('#3B6FA5');
  expect(message.Text).toContain('30 minutes');
  const link = message.Text.match(/http:\/\/127\.0\.0\.1:3002\/api\/auth\/reset-password\/[^\s]+/)?.[0];
  expect(link).toBeTruthy();
  expect(new URL(link).searchParams.get('callbackURL')).toBe(`${origin}/reset-password`);
  return link as string;
}
async function token(request: APIRequestContext) {
  expect((await requestReset(request)).ok()).toBe(true);
  const link = await readLink();
  return { link, value: new URL(link).pathname.split('/').at(-1)! };
}

test('real email → reset UI → new login; revokes sessions and rejects reuse', async ({ page, request }) => {
  await seed(request);
  const originalCookie = (await request.storageState()).cookies.find((cookie) => cookie.name.endsWith('session_token'))!;
  await page.goto('/login');
  await page.getByRole('link', { name: 'Forgot password?' }).click();
  await page.locator('input[name=email]').fill(`  ${email.toUpperCase()}  `);
  await page.getByRole('button', { name: recovery.submit }).click();
  await expect(page.getByRole('main').getByRole('status')).toHaveAccessibleDescription(recovery.success);
  const link = await readLink();
  const rawToken = new URL(link).pathname.split('/').at(-1)!;
  const verification = await db('verifications').first();
  expect(verification.identifier).not.toContain(rawToken);
  expect(new Date(verification.expiresAt).getTime() - Date.now()).toBeGreaterThan(29 * 60_000);
  await page.goto(link);
  await expect(page).toHaveURL(/\/reset-password\?token=/);
  expect(await page.locator('meta[name=referrer]').getAttribute('content')).toBe('no-referrer');
  await page.locator('input[name=password]').fill(nextPassword);
  await page.locator('input[name=confirmation]').fill('different');
  await page.getByRole('button', { name: reset.submit }).click();
  await expect(page.getByText(reset.errors.confirmation)).toBeVisible();
  await page.locator('input[name=confirmation]').fill(nextPassword);
  await page.getByRole('button', { name: reset.submit }).click();
  await expect(page.getByRole('main').getByRole('status')).toHaveAccessibleDescription(reset.success);
  await expect(page).toHaveURL(/\/reset-password$/);
  expect(await db('sessions')).toHaveLength(0);
  expect(await db('verifications')).toHaveLength(0);
  const session = await request.get('/api/auth/get-session', { headers: { Cookie: `${originalCookie.name}=${originalCookie.value}` } });
  expect(await session.json()).toBeNull();
  await page.getByRole('link', { name: 'Back to sign in' }).click();
  await page.locator('input[name=email]').fill(email);
  await page.locator('input[name=password]').fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await page.locator('input[name=password]').fill(nextPassword);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/setup$/);
  await page.goto(link);
  await expect(page.getByRole('main').getByRole('alert')).toHaveAccessibleDescription(reset.errors.invalidLink);
});

test('unknown and known accounts receive identical acknowledgements; unknown gets no email', async ({ request }) => {
  const unknown = await requestReset(request);
  expect(unknown.status()).toBe(200);
  expect(await messages()).toHaveLength(0);
  expect(await db('verifications')).toHaveLength(0);
  await seed(request);
  const known = await requestReset(request);
  expect(known.status()).toBe(200);
  expect(await known.json()).toEqual(await unknown.json());
  await readLink();
});

test('rejects expired, missing and arbitrary tokens without changing credentials', async ({ page, request }) => {
  await seed(request);
  const { link, value } = await token(request);
  await db('verifications').update({ expiresAt: new Date(Date.now() - 60_000) });
  const expired = await request.post('/api/auth/reset-password', { headers: { Origin: origin }, data: { token: value, newPassword: nextPassword } });
  expect(expired.status()).toBe(400);
  expect((await expired.json()).code).toBe('INVALID_TOKEN');
  for (const url of [link, '/reset-password', '/reset-password?token=invalid']) {
    await page.goto(url);
    await expect(page.getByRole('main').getByRole('alert')).toHaveAccessibleDescription(reset.errors.invalidLink);
    await expect(page.getByRole('link', { name: reset.requestLink })).toHaveAttribute('href', '/forgot-password');
  }
  expect((await request.post('/api/auth/sign-in/email', { headers: { Origin: origin }, data: { email, password } })).ok()).toBe(true);
});

test('enforces server password limits and atomically consumes a token on concurrent resets', async ({ request }) => {
  await seed(request);
  const { value } = await token(request);
  for (const newPassword of ['short', 'x'.repeat(129)]) {
    expect((await request.post('/api/auth/reset-password', { headers: { Origin: origin }, data: { token: value, newPassword } })).status()).toBe(400);
  }
  expect(await db('verifications')).toHaveLength(1);
  const responses = await Promise.all([nextPassword, 'Another-valid-password-42!'].map((newPassword) => request.post('/api/auth/reset-password', { headers: { Origin: origin }, data: { token: value, newPassword } })));
  expect(responses.map((response) => response.status()).sort()).toEqual([200, 400]);
  expect(await db('verifications')).toHaveLength(0);
  expect(await db('sessions')).toHaveLength(0);
});

test('rate limits reset requests and blocks untrusted origins', async ({ request }) => {
  const untrusted = await request.post('/api/auth/request-password-reset', { headers: { Origin: 'https://untrusted.example' }, data: { email } });
  expect(untrusted.status()).toBe(403);
  await db('rateLimits').delete();
  for (let attempt = 0; attempt < 3; attempt++) expect((await requestReset(request)).status()).toBe(200);
  expect((await requestReset(request)).status()).toBe(429);
});

for (const width of [1440, 320]) {
  test(`reset page fits ${width}px and handles retryable failures without exposing server details`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/reset-password?token=${'a'.repeat(24)}`);
    await page.locator('input[name=password]').fill(nextPassword);
    await page.locator('input[name=confirmation]').fill(nextPassword);
    await page.route('**/api/auth/reset-password', (route) => route.fulfill({ status: 503, body: 'Private service detail' }));
    await page.getByRole('button', { name: reset.submit }).click();
    await expect(page.getByRole('main').getByRole('alert')).toHaveAccessibleDescription(reset.errors.submission);
    await expect(page.getByText('Private service detail')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.unroute('**/api/auth/reset-password');
    await page.getByRole('button', { name: reset.submit }).click();
    await expect(page.getByRole('main').getByRole('alert')).toHaveAccessibleDescription(reset.errors.invalidLink);
    await expect(page.locator('input[name=password]')).toHaveValue('');
  });
}
