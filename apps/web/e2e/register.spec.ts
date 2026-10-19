import { expect, test } from '@playwright/test';
import { createDatabase } from '@salesmora/data';

const testURL = process.env.TEST_DATABASE_URL;
if (!testURL || !new URL(testURL).pathname.endsWith('_test') || testURL === process.env.DATABASE_URL) throw new Error('Tests require an isolated _test database.');
const db = createDatabase(testURL);
const origin = 'http://127.0.0.1:3002';
const password = ' Fictional-password-42! ';
const valid = { name: 'Alex Rivera', email: 'owner@example.com', password, termsAccepted: true };
test.beforeEach(async () => { await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE'); });
test.afterAll(async () => { await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE'); await db.destroy(); });
import { registrationScreenData as screen } from '../src/features/auth/registration-screen/registration-screen.data';
import { registrationFormData as form } from '../src/features/auth/registration-form/registration-form.data';

test('creates a persisted account and session, then protects and resumes setup', async ({ page, context }) => {
  await page.goto('/register');
  await expect(page).toHaveTitle(screen.documentTitle);
  await page.getByRole('button', { name: form.submit }).click();
  await expect(page.locator('input[name=name]')).toBeFocused();
  await page.locator('input[name=name]').fill('  Alex Rivera  ');
  await page.locator('input[name=email]').fill('Owner@Example.com');
  await page.locator('input[name=password]').fill(password);
  await page.locator('input[name=confirmPassword]').fill(form.stories.otherPassword);
  await page.getByRole('button', { name: form.submit }).click();
  await expect(page.locator('input[name=confirmPassword]')).toBeFocused();
  await page.locator('input[name=confirmPassword]').fill(password);
  await page.getByRole('checkbox').check();
  const submission = page.waitForRequest((request) => request.url().endsWith('/sign-up/email'));
  await page.getByRole('button', { name: form.submit }).dblclick();
  expect((await submission).postDataJSON()).not.toHaveProperty('confirmPassword');
  await expect(page).toHaveURL(/\/setup$/);
  await expect(page.getByText('owner@example.com', { exact: true })).toBeVisible();
  const user = await db('users').where({ email: 'owner@example.com' }).first();
  expect(user).toMatchObject({ name: 'Alex Rivera', emailVerified: false, onboardingStatus: 'pending', termsVersion: process.env.TERMS_VERSION });
  expect(user.termsAcceptedAt).toBeInstanceOf(Date);
  const account = await db('accounts').where({ userId: user.id }).first();
  expect(account.password).not.toBe(password);
  expect(account.password.length).toBeGreaterThan(64);
  expect(await db('sessions').where({ userId: user.id })).toHaveLength(1);
  const cookies = await context.cookies();
  expect(cookies.find((cookie) => cookie.name.endsWith('session_token'))).toMatchObject({ httpOnly: true, sameSite: 'Lax' });
  await page.reload();
  await expect(page.getByText('owner@example.com', { exact: true })).toBeVisible();
  await page.goto('/register');
  await expect(page).toHaveURL(/\/setup$/);
  const sessionResponse = await context.request.get('/api/auth/get-session');
  const sessionJSON = await sessionResponse.json();
  expect(sessionJSON.user.email).toBe('owner@example.com');
  expect(JSON.stringify(sessionJSON)).not.toContain(account.password);
  const cookieHeader = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ');
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(await db('sessions').where({ userId: user.id })).toHaveLength(0);
  const revoked = await context.request.get('/api/auth/get-session', { headers: { Cookie: cookieHeader } });
  expect(await revoked.json()).toBeNull();
  await page.goto('/setup');
  await expect(page).toHaveURL(/\/login$/);
});

for (const width of [1440, 320]) {
  test(`renders branded controls without overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: screen.title, level: 1 })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('fieldset').first()).toHaveCSS('border-width', '1px');
    await expect(page.locator('input[name=password]')).toHaveAttribute('autocomplete', 'new-password');
    await expect(page.getByRole('link', { name: screen.signIn })).toHaveAttribute('href', screen.loginHref);
    const logo = page.locator('header img');
    await expect(logo).toHaveAttribute('src', '/branding/salesmora-logo.svg');
    expect(await logo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  });
}

test('supports skip-link focus and local document previews without accepting terms', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/register');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to account content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await page.getByRole('link', { name: 'Terms of Service', exact: true }).click();
  await expect(page).toHaveURL(/#terms-preview$/);
  await page.locator('#terms-preview summary').click();
  await expect(page.locator('#terms-preview p')).toBeVisible();
  await page.getByRole('link', { name: 'Privacy Policy', exact: true }).click();
  await expect(page).toHaveURL(/#privacy-preview$/);
  await page.locator('#privacy-preview summary').click();
  await expect(page.locator('#privacy-preview p')).toBeVisible();
  await expect(page.getByRole('checkbox')).not.toBeChecked();
});

test('server rejects invalid input and missing acceptance without creating records', async ({ request }) => {
  for (const changes of [{ termsAccepted: false }, { name: '   ' }, { password: 'short' }, { password: 'x'.repeat(129) }, { email: 'invalid@' }]) {
    const response = await request.post('/api/auth/sign-up/email', { headers: { Origin: origin }, data: { ...valid, ...changes } });
    expect(response.status()).toBe(400);
  }
  expect(await db('users')).toHaveLength(0);
  expect(await db('accounts')).toHaveLength(0);
  expect(await db('sessions')).toHaveLength(0);
});

test('ignores forged server fields, rejects duplicate email, and preserves password whitespace', async ({ request }) => {
  const response = await request.post('/api/auth/sign-up/email', { headers: { Origin: origin }, data: {
    ...valid, emailVerified: true, onboardingStatus: 'complete', termsVersion: 'forged', termsAcceptedAt: '2000-01-01',
  } });
  expect(response.ok()).toBe(true);
  expect(await db('users').first()).toMatchObject({ emailVerified: false, onboardingStatus: 'pending', termsVersion: process.env.TERMS_VERSION });
  await request.post('/api/auth/sign-out', { headers: { Origin: origin }, data: {} });
  const duplicate = await request.post('/api/auth/sign-up/email', { headers: { Origin: origin }, data: { ...valid, email: 'OWNER@example.com' } });
  expect(duplicate.ok()).toBe(false);
  expect(await db('users')).toHaveLength(1);
  const wrong = await request.post('/api/auth/sign-in/email', { headers: { Origin: origin }, data: { email: valid.email, password: password.trim() } });
  expect(wrong.ok()).toBe(false);
  const correct = await request.post('/api/auth/sign-in/email', { headers: { Origin: origin }, data: { email: valid.email, password } });
  expect(correct.ok()).toBe(true);
});

test('rejects cross-origin registration and unauthenticated or forged setup access', async ({ page, request }) => {
  const response = await request.post('/api/auth/sign-up/email', { headers: { Origin: 'https://untrusted.example' }, data: valid });
  expect(response.status()).toBe(403);
  expect(await db('users')).toHaveLength(0);
  await page.goto('/setup');
  await expect(page).toHaveURL(/\/login$/);
  await page.context().addCookies([{ name: 'better-auth.session_token', value: 'forged', url: origin }]);
  await page.goto('/setup');
  await expect(page).toHaveURL(/\/login$/);
});

test('rejects expired sessions', async ({ page, context }) => {
  const response = await context.request.post('/api/auth/sign-up/email', { headers: { Origin: origin }, data: valid });
  expect(response.ok()).toBe(true);
  await page.goto('/setup');
  await expect(page.getByText(valid.email, { exact: true })).toBeVisible();
  await db('sessions').update({ expiresAt: new Date(Date.now() - 1000) });
  await page.goto('/setup');
  await expect(page).toHaveURL(/\/login$/);
});

test('rate limits concurrent registration attempts in PostgreSQL', async ({ request }) => {
  const responses = await Promise.all(Array.from({ length: 8 }, () => request.post('/api/auth/sign-up/email', {
    headers: { Origin: origin, 'X-Forwarded-For': Math.random().toString() }, data: { ...valid, termsAccepted: false },
  })));
  expect(responses.filter((response) => response.status() === 400)).toHaveLength(5);
  expect(responses.filter((response) => response.status() === 429)).toHaveLength(3);
  expect(await db('users')).toHaveLength(0);
});

test('rolls back user creation if credential persistence fails', async ({ request }) => {
  await db.raw(`CREATE FUNCTION test_reject_account() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test credential failure'; END $$`);
  await db.raw('CREATE TRIGGER test_reject_account BEFORE INSERT ON accounts FOR EACH ROW EXECUTE FUNCTION test_reject_account()');
  try {
    const response = await request.post('/api/auth/sign-up/email', { headers: { Origin: origin }, data: valid });
    expect(response.ok()).toBe(false);
    expect(await response.text()).not.toContain('test credential failure');
    expect(await db('users')).toHaveLength(0);
    expect(await db('accounts')).toHaveLength(0);
    expect(await db('sessions')).toHaveLength(0);
  } finally {
    await db.raw('DROP TRIGGER test_reject_account ON accounts');
    await db.raw('DROP FUNCTION test_reject_account()');
  }
});

test('shows a safe duplicate error, preserves inputs, and allows retry', async ({ page, request }) => {
  expect((await request.post('/api/auth/sign-up/email', { headers: { Origin: origin }, data: valid })).ok()).toBe(true);
  await page.goto('/register');
  for (const [name, value] of Object.entries({ name: valid.name, email: valid.email, password, confirmPassword: password })) {
    await page.locator(`input[name=${name}]`).fill(value);
  }
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: form.submit }).click();
  await expect(page.getByRole('alert', { name: 'Unable to continue' })).toHaveAccessibleDescription(screen.errors.unavailable);
  await expect(page.locator('input[name=email]')).toHaveValue(valid.email);
  await expect(page.locator('input[name=password]')).toHaveValue(password);
  await page.locator('input[name=email]').fill('retry@example.com');
  await page.getByRole('button', { name: form.submit }).click();
  await expect(page).toHaveURL(/\/setup$/);
  await expect(page.getByText('retry@example.com', { exact: true })).toBeVisible();
});
