import { expect, test, type APIRequestContext } from '@playwright/test';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { createDatabase, saveWorkspacePolicy } from '@salesmora/data';
import type { PermissionId, WorkspacePolicy } from '@salesmora/contracts';
const url = process.env.TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith('_test') || url === process.env.DATABASE_URL) throw Error('Authorization tests require isolated _test database.');
const db = createDatabase(url);
const headers = { Origin: 'http://127.0.0.1:3002' };
const password = 'Fictional-authorization-password-42!';
async function account(api: APIRequestContext, email: string) {
  expect((await api.post('/api/auth/sign-up/email', { headers, data: { name: email.split('@')[0], email, password, termsAccepted: true } })).status()).toBe(200);
  return (await db('users').where({ email }).first()).id as string;
}
async function workspace(api: APIRequestContext) {
  const response = await api.post('/api/workspaces', { headers, data: { business: { businessName: 'Fictional permissions workspace', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } } });
  expect(response.status()).toBe(201); return (await response.json()).workspaceId as string;
}
function lead(workspaceId: string, ownerId = '') {
  return { workspaceId, submissionId: randomUUID(), lead: { name: 'Fictional opportunity', email: '', phone: '', service: 'Repair', address: '', details: '', notes: '', source: 'other', stage: 'new', ownerId } };
}
async function policy(workspaceId: string): Promise<WorkspacePolicy> {
  return { workspaceId, revision: (await db('workspacePolicies').where({ workspaceId }).first()).revision,
    grants: await db('workspaceRolePolicies').where({ workspaceId }).select('role', 'permission', 'scope') };
}
const managementFeatures: PermissionId[] = ['permissions.read', 'permissions.manage'];
async function revoke(ownerId: string, workspaceId: string, role: string, prefix: string) {
  const before = await policy(workspaceId);
  const changed = { ...before, revision: before.revision + 1, grants: before.grants.filter(g => !(g.role === role && g.permission.startsWith(prefix))) };
  await saveWorkspacePolicy(db, { userId: ownerId, workspaceId }, managementFeatures, { expectedRevision: before.revision, policy: changed });
}
test.beforeEach(async () => { await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE'); });
test.afterAll(async () => { await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE'); await db.destroy(); });

test('all roles reach Home; only Owner/Admin/Office create leads through pages and direct API', async ({ page, browser }) => {
  await account(page.context().request, 'owner-auth@example.test'); const workspaceId = await workspace(page.context().request);
  for (const role of ['admin', 'office', 'field'] as const) {
    const context = await browser.newContext();
    try {
      const userId = await account(context.request, `${role}-auth@example.test`);
      await db('workspaceMemberships').insert({ workspaceId, userId, role });
      const member = await context.newPage();
      await member.goto(`/home?workspace=${workspaceId}`);
      await expect(member.getByRole('button', { name: 'SalesMora assistant How can I help?' })).toBeVisible();
      await expect(member.getByRole('link', { name: 'Create lead', exact: true })).toHaveCount(role === 'field' ? 0 : 1);
      await member.goto(`/leads/new?workspace=${workspaceId}`);
      await expect(member.getByRole('form', { name: 'Create a lead' })).toHaveCount(role === 'field' ? 0 : 1);
      expect((await context.request.post('/api/leads', { headers, data: lead(workspaceId) })).status()).toBe(role === 'field' ? 403 : 201);
    } finally { await context.close(); }
  }
  expect((await page.context().request.post('/api/leads', { headers, data: lead(workspaceId) })).status()).toBe(201);
});
test('policy and membership revocation affect existing sessions and stale create pages', async ({ page, request }) => {
  const ownerId = await account(page.context().request, 'owner-auth@example.test'); const workspaceId = await workspace(page.context().request);
  const userId = await account(request, 'office-auth@example.test');
  await db('workspaceMemberships').insert({ workspaceId, userId, role: 'office' });
  expect((await request.post('/api/leads', { headers, data: lead(workspaceId) })).status()).toBe(201);
  await revoke(ownerId, workspaceId, 'office', 'leads.create');
  expect((await request.post('/api/leads', { headers, data: lead(workspaceId) })).status()).toBe(403);
  await revoke(ownerId, workspaceId, 'office', 'leads.');
  const html = await (await request.get(`/home?workspace=${workspaceId}`)).text();
  expect(html).not.toContain('1 lead across your pipeline');
  await db('workspaceMemberships').where({ workspaceId, userId }).delete();
  expect((await request.post('/api/leads', { headers, data: lead(workspaceId) })).status()).toBe(403);
});
test('Field UI hides campaigns/settings even as coming-soon entries, and direct create URL denies', async ({ page, request }) => {
  await account(request, 'owner-auth@example.test'); const workspaceId = await workspace(request);
  const userId = await account(page.context().request, 'field-auth@example.test');
  await db('workspaceMemberships').insert({ workspaceId, userId, role: 'field' });
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/home?workspace=${workspaceId}`);
    if (width === 320) await page.getByRole('button', { name: 'Open navigation' }).click();
    await expect(page.getByRole('complementary')).not.toContainText('Campaigns');
    await expect(page.getByRole('complementary')).not.toContainText('Settings');
    await expect(page.getByRole('link', { name: 'Create lead', exact: true })).toHaveCount(0);
    await page.screenshot({ path: `/private/tmp/salesmora-field-authorization-${width}.png`, fullPage: true });
  }
  await page.goto(`/leads/new?workspace=${workspaceId}`);
  await expect(page.getByRole('form')).toHaveCount(0);
});
test('Owner sees permitted upcoming sections; saved revocation hides them without enabling future pages', async ({ page }) => {
  const ownerId = await account(page.context().request, 'owner-menu@example.test');
  const workspaceId = await workspace(page.context().request);
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/home?workspace=${workspaceId}`);
    if (width === 320) await page.getByRole('button', { name: 'Open navigation' }).click();
    for (const label of ['Leads', 'Intake Review', 'Customers', 'Jobs', 'Calendar', 'Estimates', 'Reports', 'Campaigns']) {
      await expect(page.getByRole('button', { name: `${label} Coming soon`, exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: `${label} Coming soon`, exact: true })).toBeDisabled();
    }
    await expect(page.getByRole('link', { name: 'Settings', exact: true })).toHaveAttribute('href', `/settings?workspace=${workspaceId}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await page.screenshot({ caret: 'initial', path: `/private/tmp/salesmora-owner-menu-${width}.png` });
  }
  await revoke(ownerId, workspaceId, 'owner', 'campaigns.');
  await page.goto(`/home?workspace=${workspaceId}`);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('button', { name: 'Campaigns Coming soon', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Jobs Coming soon', exact: true })).toBeDisabled();
  expect((await page.context().request.get('/campaigns')).status()).toBe(404);
  await revoke(ownerId, workspaceId, 'owner', 'settings.business.');
  await page.goto(`/settings?workspace=${workspaceId}`);
  await expect(page.getByRole('heading', { name: 'Business profile', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Manage permissions' })).toBeVisible();
});
test('Admin Settings access follows current business-read policy while Permissions remains Owner-only', async ({ page, request }) => {
  const ownerId = await account(request, 'owner-settings@example.test');
  const workspaceId = await workspace(request);
  const userId = await account(page.context().request, 'admin-settings@example.test');
  await db('workspaceMemberships').insert({ workspaceId, userId, role: 'admin' });
  await page.goto(`/settings?workspace=${workspaceId}`);
  await expect(page.getByRole('heading', { name: 'Business profile', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Manage permissions' })).toHaveCount(0);
  await revoke(ownerId, workspaceId, 'admin', 'settings.business.');
  expect((await page.context().request.get(`/settings?workspace=${workspaceId}`)).status()).toBe(404);
  expect((await page.context().request.get(`/settings/permissions?workspace=${workspaceId}`)).status()).toBe(404);
  await page.goto(`/home?workspace=${workspaceId}`);
  await expect(page.getByRole('link', { name: 'Settings', exact: true })).toHaveCount(0);
});
for (const scenario of ['inviter-removed', 'invite-permission-revoked', 'admin-cannot-grant-admin'] as const) test(`pending invitation rechecks current authority: ${scenario}`, async ({ page, request }) => {
  const ownerId = await account(request, 'owner-auth@example.test'); const workspaceId = await workspace(request);
  const userId = await account(page.context().request, 'recipient-auth@example.test');
  const token = randomBytes(32).toString('hex');
  let inviterId = ownerId;
  if (scenario !== 'invite-permission-revoked') {
    const actor = await db('users').insert({ id: randomUUID(), name: 'Fictional former inviter', email: 'inviter-auth@example.test', createdAt: new Date(), updatedAt: new Date(), termsVersion: 'test', termsAcceptedAt: new Date() }).returning('id');
    inviterId = actor[0].id;
    await db('workspaceMemberships').insert({ workspaceId, userId: inviterId, role: 'admin' });
  }
  await db('workspaceInvitations').insert({ id: randomUUID(), workspaceId, inviterId, email: 'recipient-auth@example.test', role: scenario === 'admin-cannot-grant-admin' ? 'admin' : 'field', status: 'sent', tokenHash: createHash('sha256').update(token).digest('hex'), expiresAt: new Date(Date.now() + 60000) });
  if (scenario === 'inviter-removed') await db('workspaceMemberships').where({ workspaceId, userId: inviterId }).delete();
  if (scenario === 'invite-permission-revoked') await revoke(ownerId, workspaceId, 'owner', 'team.invite');
  const response = await page.context().request.post('/api/invitations/accept', { headers, data: { token } });
  expect(response.status()).toBe(410);
  expect(await db('workspaceMemberships').where({ workspaceId, userId }).first()).toBeUndefined();
  expect((await db('workspaceInvitations').where({ workspaceId }).first()).status).toBe('sent');
});
