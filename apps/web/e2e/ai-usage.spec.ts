import { expect, test, type APIRequestContext } from '@playwright/test';
import { createDatabase, createAIUsageRecorder, configureWorkspaceAIBudget } from '@salesmora/data';
const url = process.env.TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith('_test') || url === process.env.DATABASE_URL) throw Error('Usage tests require the isolated test database');
const db = createDatabase(url);
const headers = { Origin: 'http://127.0.0.1:3002' };
async function account(api: APIRequestContext, email: string) {
  expect((await api.post('/api/auth/sign-up/email', { headers, data: { name: 'Fictional usage user', email, password: 'Fictional-usage-password-42!', termsAccepted: true } })).status()).toBe(200);
  return (await db('users').where({ email }).first()).id as string;
}
async function workspace(api: APIRequestContext) {
  const r = await api.post('/api/workspaces', { headers, data: { business: { businessName: 'Fictional AI usage workspace', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } } });
  expect(r.status()).toBe(201); return (await r.json()).workspaceId as string;
}
test.beforeEach(async () => { await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE'); });
test.afterAll(async () => { await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE'); await db.destroy(); });
test('Owner opens usage under Settings; ledger reservations, refresh, errors and mobile submenu work', async ({ page, request }) => {
  const api = page.context().request;
  const userId = await account(api, 'owner-ai-usage@example.test'); const workspaceId = await workspace(api);
  await configureWorkspaceAIBudget(db, workspaceId, 5000000);
  await createAIUsageRecorder(db, { workspaceId, userId }).start('fictional', 'answer', 1250000);
  await page.goto(`/settings?workspace=${workspaceId}`);
  await expect(page.getByRole('heading', { name: 'Business profile', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'View AI usage', exact: true }).click();
  await expect(page).toHaveURL(`/settings/ai-usage?workspace=${workspaceId}`);
  await expect(page.getByText('1,250,000', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'AI usage', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('link', { name: 'Permissions', exact: true })).toBeVisible();
  const response = await api.get(`/api/ai-usage?workspace=${workspaceId}`);
  expect(response.headers()['cache-control']).toBe('no-store');
  const { usage } = await response.json(); expect(Object.keys(usage).sort()).toEqual(['monthlyTokens', 'resetAt', 'usedOrReservedTokens']);
  const reset = new Date(); expect(usage.resetAt).toBe(new Date(Date.UTC(reset.getUTCFullYear(), reset.getUTCMonth() + 1, 1)).toISOString());
  await createAIUsageRecorder(db, { workspaceId, userId }).start('fictional', 'answer', 100);
  await page.getByRole('button', { name: 'Refresh usage' }).click();
  await expect(page.getByText('1,250,100', { exact: true })).toBeVisible();
  await page.route('**/api/ai-usage?*', route => route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }));
  await page.getByRole('button', { name: 'Refresh usage' }).click();
  await expect(page.getByRole('alert', { name: 'Usage could not be loaded' })).toContainText('Usage could not be loaded');
  await expect(page.getByText('1,250,100', { exact: true })).toHaveCount(0);
  await page.unroute('**/api/ai-usage?*'); await page.getByRole('button', { name: 'Refresh usage' }).click();
  await expect(page.getByText('1,250,100', { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: '/private/tmp/salesmora-ai-usage-1440.png', fullPage: true });
  await page.setViewportSize({ width: 320, height: 1000 });
  await page.screenshot({ path: '/private/tmp/salesmora-ai-usage-320.png', fullPage: true });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('link', { name: 'AI usage', exact: true })).toHaveAttribute('aria-current', 'page');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.getByRole('link', { name: 'Permissions', exact: true }).click();
  await expect(page).toHaveURL(`/settings/permissions?workspace=${workspaceId}`);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('link', { name: 'AI usage', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'AI usage', exact: true })).toBeVisible();
  const nextOwner = await account(request, 'next-owner-ai-usage@example.test');
  await db.transaction(async trx => {
    await trx('workspaces').where({ id: workspaceId }).update({ ownerId: nextOwner });
    await trx('workspaceMemberships').where({ workspaceId, userId }).update({ role: 'office' });
    await trx('workspaceMemberships').insert({ workspaceId, userId: nextOwner, role: 'owner' });
  });
  expect((await api.get(`/api/ai-usage?workspace=${workspaceId}`)).status()).toBe(403);
  await page.getByRole('button', { name: 'Refresh usage' }).click();
  await expect(page.getByText('1,250,100', { exact: true })).toHaveCount(0);
});
for (const role of ['admin', 'office', 'field']) test(`${role} cannot read usage through page, API or navigation`, async ({ page, request }) => {
  await account(request, 'owner-ai-usage@example.test'); const workspaceId = await workspace(request);
  const userId = await account(page.context().request, `${role}-ai-usage@example.test`);
  await db('workspaceMemberships').insert({ workspaceId, userId, role });
  const response = await page.context().request.get(`/api/ai-usage?workspace=${workspaceId}`);
  expect(response.status()).toBe(403); expect(await response.json()).not.toHaveProperty('usage');
  expect((await page.goto(`/settings/ai-usage?workspace=${workspaceId}`))?.status()).toBe(404);
  await page.goto(`/home?workspace=${workspaceId}`);
  await expect(page.getByRole('link', { name: 'AI usage', exact: true })).toHaveCount(0);
});
test('Authentication, workspace validation and cross-workspace Owner isolation', async ({ page, request }) => {
  expect((await request.get('/api/ai-usage')).status()).toBe(401);
  await account(request, 'owner-one-ai-usage@example.test'); const first = await workspace(request);
  await account(page.context().request, 'owner-two-ai-usage@example.test'); await workspace(page.context().request);
  expect((await page.context().request.get('/api/ai-usage?workspace=invalid')).status()).toBe(400);
  expect((await page.context().request.get(`/api/ai-usage?workspace=${first}`)).status()).toBe(403);
  expect((await page.goto(`/settings/ai-usage?workspace=${first}`))?.status()).toBe(404);
});
