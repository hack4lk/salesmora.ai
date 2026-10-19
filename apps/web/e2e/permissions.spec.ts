import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { createDatabase } from '@salesmora/data';
import type { WorkspacePolicy } from '@salesmora/contracts';

const url = process.env.TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith('_test') || url === process.env.DATABASE_URL) throw Error('Permissions tests require an isolated _test database.');
const db = createDatabase(url);
const headers = { Origin: 'http://127.0.0.1:3002' };
const password = 'Fictional-permissions-password-42!';
const require = createRequire(import.meta.url);
const addonRequire = createRequire(require.resolve('@storybook/addon-a11y'));
async function accessibility(page: Page, selector: string) {
  await page.addScriptTag({ path: addonRequire.resolve('axe-core/axe.min.js') });
  const violations = await page.evaluate(async selector => {
    const axe = (window as typeof window & { axe: { run: (root: Element, options: object) => Promise<{ violations: { id: string }[] }> } }).axe;
    return (await axe.run(document.querySelector(selector)!, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(item => item.id);
  }, selector);
  expect(violations).toEqual([]);
}
async function account(api: APIRequestContext, email: string) {
  expect((await api.post('/api/auth/sign-up/email', { headers, data: { name: 'Fictional teammate', email, password, termsAccepted: true } })).status()).toBe(200);
  return (await db('users').where({ email }).first()).id as string;
}
async function workspace(api: APIRequestContext) {
  const response = await api.post('/api/workspaces', { headers, data: { business: { businessName: 'Fictional permission editor', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } } });
  expect(response.status()).toBe(201);
  return (await response.json()).workspaceId as string;
}
async function policy(api: APIRequestContext, workspaceId: string): Promise<WorkspacePolicy> {
  const response = await api.get(`/api/permissions?workspace=${workspaceId}`);
  expect(response.status()).toBe(200);
  expect(response.headers()['cache-control']).toBe('no-store');
  return (await response.json()).policy;
}
function change(before: WorkspacePolicy, role = 'office', permission = 'leads.create') {
  return { expectedRevision: before.revision, policy: { ...before, revision: before.revision + 1, grants: before.grants.filter(grant => !(grant.role === role && grant.permission === permission)) } };
}
async function audits(workspaceId: string) { return db('authorizationAudit').where({ workspaceId, action: 'policy.saved' }); }
test.beforeEach(async () => { await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE'); });
test.afterAll(async () => { await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE'); await db.destroy(); });

test('Owner navigates from Home, reviews and persists changes with an audit; Office loses access immediately', async ({ page, request }) => {
  const ownerId = await account(page.context().request, 'owner-permissions@example.test');
  const workspaceId = await workspace(page.context().request);
  const officeId = await account(request, 'office-permissions@example.test');
  await db('workspaceMemberships').insert({ workspaceId, userId: officeId, role: 'office' });
  await page.goto(`/home?workspace=${workspaceId}`);
  await expect(page.getByRole('link', { name: 'Permissions', exact: true })).toHaveAttribute('href', `/settings/permissions?workspace=${workspaceId}`);
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await expect(page).toHaveURL(`/settings?workspace=${workspaceId}`);
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(page.getByRole('heading', { name: 'Settings', exact: true, level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Business profile', exact: true })).toBeVisible();
    await expect(page.getByText('Repairs', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await accessibility(page, 'main');
    await page.screenshot({ caret: 'initial', path: `/private/tmp/salesmora-settings-overview-${width}.png` });
  }
  await expect(page.getByRole('link', { name: 'Manage permissions' })).toHaveAttribute('href', `/settings/permissions?workspace=${workspaceId}`);
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await page.getByRole('link', { name: 'Permissions', exact: true }).click();
  await expect(page).toHaveURL(`/settings/permissions?workspace=${workspaceId}`);
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    if (width === 320) await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    await expect(page.getByRole('link', { name: 'Permissions', exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('link', { name: 'Settings', exact: true })).not.toHaveAttribute('aria-current');
    await expect(page.getByRole('heading', { name: 'Permissions', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await expect(page.getByRole('button', { name: 'Review changes', exact: true })).toBeDisabled();
    await page.screenshot({ caret: 'initial', path: `/private/tmp/salesmora-live-permissions-${width}.png`, fullPage: true });
    await accessibility(page, 'main');
  }
  await page.getByRole('switch', { name: 'Create leads', exact: true }).click();
  await page.getByRole('button', { name: 'Review changes', exact: true }).click();
  expect(await audits(workspaceId)).toHaveLength(0);
  await expect(page.getByRole('heading', { name: 'Review permission changes' })).toBeFocused();
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByText('Permissions saved', { exact: true })).toBeVisible();
  const saved = await policy(page.context().request, workspaceId);
  expect(saved.revision).toBe(1);
  expect(saved.grants.some(grant => grant.role === 'office' && grant.permission === 'leads.create')).toBe(false);
  const entries = await audits(workspaceId);
  expect(entries).toHaveLength(1);
  expect(entries[0]).toMatchObject({ actorId: ownerId, beforeRevision: 0, afterRevision: 1 });
  expect(entries[0].beforePolicy.grants.some((grant: {role:string;permission:string}) => grant.role === 'office' && grant.permission === 'leads.create')).toBe(true);
  await page.reload();
  await expect(page.getByRole('switch', { name: 'Create leads', exact: true })).not.toBeChecked();
  await page.getByRole('link', { name: 'Back to Settings', exact: true }).click();
  await expect(page).toHaveURL(`/settings?workspace=${workspaceId}`);
  await expect(page.getByRole('heading', { name: 'Business profile', exact: true })).toBeVisible();
  expect((await request.post('/api/leads', { headers, data: { workspaceId, submissionId: randomUUID(), lead: { name: 'Denied lead', email: '', phone: '', service: 'Repair', address: '', details: '', notes: '', source: 'other', stage: 'new', ownerId: '' } } })).status()).toBe(403);
});

test('non-Owners and other tenants cannot read or save permissions, even through direct requests', async ({ page, browser, request }) => {
  await account(page.context().request, 'owner-permissions@example.test');
  const workspaceId = await workspace(page.context().request);
  const before = await policy(page.context().request, workspaceId);
  expect((await request.get(`/api/permissions?workspace=${workspaceId}`)).status()).toBe(401);
  expect((await request.post('/api/permissions', { headers, data: change(before) })).status()).toBe(401);
  for (const role of ['admin', 'office', 'field'] as const) {
    const context = await browser.newContext();
    try {
      const userId = await account(context.request, `${role}-permissions@example.test`);
      await db('workspaceMemberships').insert({ workspaceId, userId, role });
      const member = await context.newPage();
      await member.goto(`/home?workspace=${workspaceId}`);
      await expect(member.getByRole('link', { name: 'Settings', exact: true })).toHaveCount(role === 'admin' ? 1 : 0);
      await expect(member.getByRole('link', { name: 'Permissions', exact: true })).toHaveCount(0);
      const settingsResponse = await context.request.get(`/settings?workspace=${workspaceId}`);
      expect(settingsResponse.status()).toBe(role === 'admin' ? 200 : 404);
      if (role === 'admin') {
        await member.goto(`/settings?workspace=${workspaceId}`);
        await expect(member.getByRole('heading', { name: 'Business profile', exact: true })).toBeVisible();
        await expect(member.getByRole('link', { name: 'Manage permissions' })).toHaveCount(0);
        await expect(member.getByRole('link', { name: 'Permissions', exact: true })).toHaveCount(0);
      }
      expect((await context.request.get(`/api/permissions?workspace=${workspaceId}`)).status()).toBe(403);
      expect((await context.request.post('/api/permissions', { headers, data: change(before) })).status()).toBe(403);
      expect((await context.request.get(`/settings/permissions?workspace=${workspaceId}`)).status()).toBe(404);
    } finally { await context.close(); }
  }
  await account(request, 'other-owner-permissions@example.test');
  await workspace(request);
  expect((await request.get(`/api/permissions?workspace=${workspaceId}`)).status()).toBe(403);
  expect((await request.get(`/settings?workspace=${workspaceId}`)).status()).toBe(404);
  expect((await request.post('/api/permissions', { headers, data: change(before) })).status()).toBe(403);
  expect(await audits(workspaceId)).toHaveLength(0);
});

test('forged, protected, unavailable and invalid dependency edits are rejected without writes', async ({ page }) => {
  await account(page.context().request, 'owner-permissions@example.test');
  const api = page.context().request;
  const workspaceId = await workspace(api);
  const before = await policy(api, workspaceId);
  expect((await api.post('/api/permissions', { headers: { Origin: 'https://untrusted.example' }, data: change(before) })).status()).toBe(403);
  expect((await api.post('/api/permissions', { headers: {}, data: change(before) })).status()).toBe(403);
  expect((await api.post('/api/permissions', { headers, data: { ...change(before), role: 'owner' } })).status()).toBe(422);
  expect((await api.post('/api/permissions', { headers, data: change(before, 'owner', 'permissions.manage') })).status()).toBe(422);
  expect((await api.post('/api/permissions', { headers, data: change(before, 'office', 'leads.read') })).status()).toBe(422);
  expect((await api.post('/api/permissions', { headers, data: change(before, 'office', 'campaigns.create') })).status()).toBe(403);
  const duplicate = change(before);
  duplicate.policy.grants.push(duplicate.policy.grants[0]);
  expect((await api.post('/api/permissions', { headers, data: duplicate })).status()).toBe(422);
  const escalated = change(before);
  escalated.policy.grants.push({ role: 'field', permission: 'leads.export', scope: 'enabled' });
  expect((await api.post('/api/permissions', { headers, data: escalated })).status()).toBe(422);
  expect((await api.post('/api/permissions', { headers, data: 'x'.repeat(65000) })).status()).toBe(413);
  expect((await policy(api, workspaceId)).revision).toBe(0);
  expect(await audits(workspaceId)).toHaveLength(0);
});

test('concurrent and replayed saves commit one revision and audit; stale editor reload is explicit', async ({ page }) => {
  await account(page.context().request, 'owner-permissions@example.test');
  const api = page.context().request;
  const workspaceId = await workspace(api);
  const before = await policy(api, workspaceId);
  await page.goto(`/settings/permissions?workspace=${workspaceId}`);
  await page.getByRole('switch', { name: 'Create leads', exact: true }).click();
  await page.getByRole('button', { name: 'Review changes', exact: true }).click();
  const responses = await Promise.all([api.post('/api/permissions', { headers, data: change(before, 'field', 'assistant.use') }), api.post('/api/permissions', { headers, data: change(before, 'field', 'home.access') })]);
  expect(responses.map(response => response.status()).sort()).toEqual([200, 409]);
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByText('Permissions changed elsewhere', { exact: true })).toBeVisible();
  await expect(page.getByText('1 unsaved change', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reload permissions and discard draft' }).click();
  await expect(page.getByText('No unsaved changes', { exact: true })).toBeVisible();
  await expect(page.getByRole('switch', { name: 'Create leads', exact: true })).toBeChecked();
  expect((await api.post('/api/permissions', { headers, data: change(before) })).status()).toBe(409);
  expect(await audits(workspaceId)).toHaveLength(1);
});

test('stale authentication requires password confirmation and retains the draft through cancel and retry', async ({ page }) => {
  const userId = await account(page.context().request, 'owner-permissions@example.test');
  const api = page.context().request;
  const workspaceId = await workspace(api);
  await db('sessions').where({ userId }).update({ createdAt: new Date(Date.now() - 20 * 60 * 1000) });
  await page.goto(`/settings/permissions?workspace=${workspaceId}`);
  await page.getByRole('switch', { name: 'Create leads', exact: true }).click();
  await page.getByRole('button', { name: 'Review changes', exact: true }).click();
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByText('Sign in again before saving this permission change. Your draft is still here.')).toBeVisible();
  expect(await audits(workspaceId)).toHaveLength(0);
  await page.getByRole('button', { name: 'Confirm identity', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Confirm your identity' });
  await expect(dialog).toBeVisible();
  await page.setViewportSize({ width: 320, height: 1000 });
  await expect(dialog.getByLabel(/^Password/)).toBeFocused();
  await accessibility(page, 'dialog[open]');
  await page.screenshot({ caret: 'initial', path: '/private/tmp/salesmora-permissions-identity-320.png' });
  await dialog.getByLabel(/^Password/).fill('Fictional-wrong-password');
  await dialog.getByRole('button', { name: 'Confirm identity', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('Your identity could not be confirmed.');
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText('1 unsaved change', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Confirm identity', exact: true }).click();
  await dialog.getByLabel(/^Password/).fill(password);
  await dialog.getByRole('button', { name: 'Confirm identity', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByText('Permissions saved', { exact: true })).toBeVisible();
  expect(await audits(workspaceId)).toHaveLength(1);
});

test('an Owner losing authority after opening the page cannot save', async ({ page, request }) => {
  const ownerId = await account(page.context().request, 'owner-permissions@example.test');
  const workspaceId = await workspace(page.context().request);
  const before = await policy(page.context().request, workspaceId);
  await page.goto(`/settings/permissions?workspace=${workspaceId}`);
  const successorId = await account(request, 'successor-permissions@example.test');
  await db.transaction(async trx => {
    await trx('workspaces').where({ id: workspaceId }).forUpdate().first();
    await trx('workspaceMemberships').where({ workspaceId, userId: ownerId }).update({ role: 'admin' });
    await trx('workspaceMemberships').insert({ workspaceId, userId: successorId, role: 'owner' });
    await trx('workspaces').where({ id: workspaceId }).update({ ownerId: successorId });
  });
  expect((await page.context().request.post('/api/permissions', { headers, data: change(before) })).status()).toBe(403);
  expect((await page.context().request.get(`/api/permissions?workspace=${workspaceId}`)).status()).toBe(403);
  expect(await audits(workspaceId)).toHaveLength(0);
});
