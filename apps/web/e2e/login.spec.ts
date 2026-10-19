import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { createDatabase } from '@salesmora/data';
import { loginScreenData as screen } from '../src/features/auth/login-screen/login-screen.data';
import { loginFormData as form } from '../src/features/auth/login-form/login-form.data';
import { passwordRecoveryScreenData as recovery } from '../src/features/auth/password-recovery-screen/password-recovery-screen.data';

const testURL = process.env.TEST_DATABASE_URL;
if (!testURL || !new URL(testURL).pathname.endsWith('_test') || testURL === process.env.DATABASE_URL) throw new Error('Tests require an isolated _test database.');
const db = createDatabase(testURL);
const origin = 'http://127.0.0.1:3002';
const owner = { name: 'Alex Rivera', email: 'login-owner@example.com', password: ' Fictional-password-42! ', termsAccepted: true };
const alert = (page: Page) => page.getByRole('main').getByRole('alert');

test.beforeEach(async () => { await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE'); });
test.afterAll(async () => { await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE'); await db.destroy(); });

async function seedOwner(request: APIRequestContext) {
  expect((await request.post('/api/auth/sign-up/email', { headers: { Origin: origin }, data: owner })).ok()).toBe(true);
  expect((await request.post('/api/auth/sign-out', { headers: { Origin: origin }, data: {} })).ok()).toBe(true);
}

async function fill(page: Page, email = owner.email, password = owner.password) {
  await page.locator('input[name=email]').fill(email);
  await page.locator('input[name=password]').fill(password);
}

test('validates locally, gives generic credential errors, then signs in and revokes the session on sign-out', async ({ page, context, request }) => {
  await seedOwner(request);
  let submissions = 0;
  page.on('request', (request) => { if (request.url().endsWith('/sign-in/email')) submissions++; });
  await page.goto('/login');
  await expect(page).toHaveTitle(screen.documentTitle);
  await page.getByRole('button', { name: form.submit, exact: true }).click();
  await expect(page.locator('input[name=email]')).toBeFocused();
  expect(submissions).toBe(0);
  await fill(page, owner.email, 'wrong-password');
  await page.getByRole('button', { name: form.submit, exact: true }).click();
  await expect(alert(page)).toHaveAccessibleDescription(form.errors.submission);
  await expect(page.locator('input[name=password]')).toHaveValue('wrong-password');
  await page.locator('input[name=email]').fill('unknown@example.com');
  await page.getByRole('button', { name: form.submit, exact: true }).click();
  await expect(alert(page)).toHaveAccessibleDescription(form.errors.submission);
  expect(await db('sessions')).toHaveLength(0);
  await fill(page, '  LOGIN-OWNER@Example.com  ');
  const submission = page.waitForRequest((request) => request.url().endsWith('/sign-in/email'));
  await page.getByRole('button', { name: form.submit, exact: true }).click();
  expect((await submission).postDataJSON()).toEqual({ email: owner.email, password: owner.password });
  await expect(page).toHaveURL(/\/setup$/);
  await expect(page.getByText(owner.email, { exact: true })).toBeVisible();
  expect(submissions).toBe(3);
  expect(await db('users')).toHaveLength(1);
  expect(await db('sessions')).toHaveLength(1);
  expect((await context.cookies()).find((cookie) => cookie.name.endsWith('session_token'))).toMatchObject({ httpOnly: true, sameSite: 'Lax' });
  await page.reload();
  await expect(page.getByText(owner.email, { exact: true })).toBeVisible();
  for (const route of ['/login', '/register']) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/setup$/);
  }
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(await db('sessions')).toHaveLength(0);
  await page.goto('/setup');
  await expect(page).toHaveURL(/\/login$/);
});

test('disables pending controls and sends one real sign-in request on double click', async ({ page, request }) => {
  await seedOwner(request);
  let submissions = 0;
  await page.route('**/api/auth/sign-in/email', async (route) => {
    submissions++;
    await new Promise((resolve) => setTimeout(resolve, 400));
    await route.continue();
  });
  await page.goto('/login');
  await fill(page);
  await page.getByRole('button', { name: form.submit, exact: true }).dblclick();
  await expect(page.getByRole('button', { name: form.pending })).toBeDisabled();
  await expect(page.locator('input[name=email]')).toBeDisabled();
  await expect(page.locator('input[name=password]')).toBeDisabled();
  await expect(page).toHaveURL(/\/setup$/);
  expect(submissions).toBe(1);
  expect(await db('sessions')).toHaveLength(1);
});

test('shows a rate-limit message after repeated failed sign-ins', async ({ page }) => {
  await page.goto('/login');
  await fill(page);
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = page.waitForResponse((response) => response.url().endsWith('/sign-in/email'));
    await page.getByRole('button', { name: form.submit, exact: true }).click();
    expect((await response).status()).toBe(401);
    await expect(alert(page)).toHaveAccessibleDescription(form.errors.submission);
  }
  await page.getByRole('button', { name: form.submit, exact: true }).click();
  await expect(alert(page)).toHaveAccessibleDescription(screen.errors.rateLimited);
  await expect(page.locator('input[name=email]')).toHaveValue(owner.email);
  expect(await db('sessions')).toHaveLength(0);
});

test('handles network and service failures safely, preserves inputs, and retries against real auth', async ({ page, request }) => {
  await seedOwner(request);
  await page.goto('/login');
  await fill(page);
  await page.route('**/api/auth/sign-in/email', (route) => route.abort('failed'));
  await page.getByRole('button', { name: form.submit, exact: true }).click();
  await expect(alert(page)).toHaveAccessibleDescription(screen.errors.unavailable);
  await page.unroute('**/api/auth/sign-in/email');
  await page.route('**/api/auth/sign-in/email', (route) => route.fulfill({ status: 503, body: 'Internal service detail that must not be displayed' }));
  await page.getByRole('button', { name: form.submit, exact: true }).click();
  await expect(alert(page)).toHaveAccessibleDescription(screen.errors.unavailable);
  await expect(page.locator('input[name=password]')).toHaveValue(owner.password);
  await expect(page.getByText('Internal service detail that must not be displayed')).toHaveCount(0);
  await page.unroute('**/api/auth/sign-in/email');
  await page.getByRole('button', { name: form.submit, exact: true }).click();
  await expect(page).toHaveURL(/\/setup$/);
});

for (const width of [1440, 320]) {
  test(`renders the branded login page without overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: screen.title, level: 1 })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('header img')).toHaveAttribute('src', '/branding/salesmora-logo.svg');
    await expect(page.locator('input[name=email]')).toHaveAttribute('autocomplete', 'username');
    await expect(page.locator('input[name=password]')).toHaveAttribute('autocomplete', 'current-password');
    await expect(page.locator('fieldset').first()).toHaveCSS('border-width', '1px');
  });
}

test('supports skip navigation, the recovery page, and links between registration and login', async ({ page }) => {
  await page.goto('/login');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await page.getByRole('link', { name: form.forgotPassword }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);
  await expect(page).toHaveTitle(recovery.documentTitle);
  await expect(page.getByRole('button', { name: 'Send reset link' })).toBeEnabled();
  await page.getByRole('link', { name: recovery.backToLogin }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole('link', { name: screen.register, exact: true }).click();
  await expect(page).toHaveURL(/\/register$/);
  await page.getByRole('link', { name: form.submit, exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
});
