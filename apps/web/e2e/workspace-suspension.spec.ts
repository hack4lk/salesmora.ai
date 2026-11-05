import { expect, test, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase, suspendUser, suspendWorkspace, unsuspendUser, unsuspendWorkspace } from '@salesmora/data';

const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL) throw Error('Suspension checks require the isolated test database.');
const db = createDatabase(connection);
const origin = 'http://127.0.0.1:3002';
const headers = { Origin: origin };
const password = 'Fictional-suspension-password-42!';
const staff = { type: 'staff' as const, id: 'e2e-staff' };
const reason = 'Fictional staff-only suspension reason';
async function account(api: APIRequestContext, label: string) {
  const email = `suspend-${label}-${randomUUID()}@example.test`;
  expect((await api.post('/api/auth/sign-up/email', { headers, data: { name: label, email, password, termsAccepted: true } })).status()).toBe(200);
  return { email, id: (await db('users').where({ email }).first()).id as string };
}
async function createWorkspace(api: APIRequestContext, businessName: string) {
  const response = await api.post('/api/workspaces', { headers, data: { business: { businessName, businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '10013', serviceRange: '25-miles' }, team: { invitations: [] } } });
  expect(response.status()).toBe(201); return (await response.json()).workspaceId as string;
}
test.afterAll(async () => { await db.destroy(); });

test('a suspended workspace locks pages and APIs for members and unsuspend restores access', async ({ page, browser }) => {
  test.setTimeout(120000);
  await db('rateLimits').delete();
  page.setDefaultNavigationTimeout(30000);
  const ownerContext = await browser.newContext();
  try {
    await account(ownerContext.request, 'owner');
    const workspaceId = await createWorkspace(ownerContext.request, 'Fictional Suspended Workspace');
    const member = await account(page.context().request, 'member');
    await createWorkspace(page.context().request, 'Fictional Active Workspace');
    await db('workspaceMemberships').insert({ workspaceId, userId: member.id, role: 'office' });
    const api = page.context().request;
    expect((await api.get(`/api/leads?workspace=${workspaceId}`)).status()).toBe(200);

    await suspendWorkspace(db, { workspaceId, reason, actor: staff });
    await page.goto(`/home?workspace=${workspaceId}`);
    await expect(page).toHaveURL(/\/workspace-suspended$/);
    await expect(page.getByRole('heading', { name: 'This workspace has been suspended' })).toBeVisible();
    await expect(page.getByText(reason)).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Open Fictional Active Workspace' })).toBeVisible();
    const locked = await api.get(`/api/leads?workspace=${workspaceId}`);
    expect(locked.status()).toBe(423);
    const body = await locked.json();
    expect(body.code).toBe('workspace_suspended');
    expect(JSON.stringify(body)).not.toContain(reason);
    expect((await api.get(`/api/jobs/${randomUUID()}/messages?workspace=${workspaceId}`)).status()).toBe(423);

    // With no workspace requested, the member's active workspace is chosen instead of the suspended one.
    await page.goto('/home');
    await expect(page).not.toHaveURL(/workspace-suspended/);

    await unsuspendWorkspace(db, { workspaceId, reason: 'Owner confirmed service restoration', actor: staff });
    await page.goto(`/home?workspace=${workspaceId}`);
    await expect(page).not.toHaveURL(/workspace-suspended/);
    expect((await api.get(`/api/leads?workspace=${workspaceId}`)).status()).toBe(200);
  } finally { await ownerContext.close(); }
});

test('a suspended user is signed out, cannot sign in, and sees a generic message', async ({ page, browser }) => {
  test.setTimeout(90000);
  await db('rateLimits').delete();
  page.setDefaultNavigationTimeout(30000);
  const userContext = await browser.newContext();
  try {
    const user = await account(userContext.request, 'user');
    const workspaceId = await createWorkspace(userContext.request, 'Fictional User Workspace');
    expect((await userContext.request.get(`/api/leads?workspace=${workspaceId}`)).status()).toBe(200);

    await suspendUser(db, { userId: user.id, reason, actor: staff });
    expect((await userContext.request.get(`/api/leads?workspace=${workspaceId}`)).status()).toBe(401);
    const refused = await page.context().request.post('/api/auth/sign-in/email', { headers, data: { email: user.email, password } });
    expect(refused.status()).toBe(423);
    expect(await refused.text()).not.toContain(reason);
    expect(await db('sessions').where({ userId: user.id }).count<{ count: string }[]>('* as count')).toEqual([{ count: '0' }]);

    await page.goto('/login');
    await page.getByRole('textbox', { name: /Work email/ }).fill(user.email);
    await page.getByLabel('Password', { exact: false }).first().fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('alert', { name: 'Unable to continue' })).toContainText('This account is unavailable. Contact SalesMora support.');

    await unsuspendUser(db, { userId: user.id, reason: 'Resolved suspension condition', actor: staff });
    expect((await page.context().request.post('/api/auth/sign-in/email', { headers, data: { email: user.email, password } })).status()).toBe(200);
  } finally { await userContext.close(); }
});
