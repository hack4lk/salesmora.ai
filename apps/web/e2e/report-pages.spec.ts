import { expect, test } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import type { WorkspacePolicy } from '@salesmora/contracts';
import { createDatabase } from '@salesmora/data';

const origin = process.env.SALESMORA_E2E_ORIGIN ?? 'http://127.0.0.1:3002';
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw new Error('Use an isolated local test database.');
const db = createDatabase(connection);
let workspaceId: string | undefined, userId: string | undefined;
test.afterAll(async () => {
  try {
    if (workspaceId) {
      await db('workspaceSubscriptions').where({ workspaceId }).delete();
      await db('workspaces').where({ id: workspaceId }).delete();
    }
    if (userId) await db('users').where({ id: userId }).delete();
  } finally { await db.destroy(); }
});
const headers = { Origin: origin };
const reportAreas = [
  ['overview', 'Business overview'],
  ['leads', 'Leads and pipeline'],
  ['jobs', 'Jobs and deadlines'],
  ['team', 'Team workload'],
  ['estimates', 'Estimates and acceptance'],
  ['calendar', 'Calendar and scheduling'],
  ['sources', 'Lead-source effectiveness'],
  ['activity', 'CRM activity history'],
  ['financial', 'Sales value and recorded costs'],
] as const;

test('signed-in owner can navigate all report areas and manage a personal template', async ({ page }) => {
  test.setTimeout(240_000);
  const api = page.context().request;
  const email = `reports-${randomUUID()}@example.test`;
  const registration = await api.post('/api/auth/sign-up/email', { headers,
    data: { name: 'Report test owner', email, password: 'Fictional-report-password-42!', termsAccepted: true } });
  expect(registration.status()).toBe(200);
  userId = (await db('users').where({ email }).first('id')).id;
  const workspace = await api.post('/api/workspaces', { headers, data: {
    business: { businessName: 'Report test workspace', businessType: 'plumbing' },
    services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] },
  } });
  expect(workspace.status()).toBe(201);
  workspaceId = (await workspace.json() as { workspaceId: string }).workspaceId;
  const policyResponse = await api.get(`/api/permissions?workspace=${workspaceId}`);
  expect(policyResponse.status()).toBe(200);
  const { policy } = await policyResponse.json() as { policy: WorkspacePolicy };
  const save = await api.post('/api/permissions', { headers, data: {
    expectedRevision: policy.revision, policy: { ...policy, revision: policy.revision + 1,
      grants: [...policy.grants, { role: 'owner', permission: 'reports.financial.read', scope: 'enabled' }] },
  } });
  expect(save.status()).toBe(200);

  await page.goto(`/home?workspace=${workspaceId}`);
  await page.getByRole('link', { name: 'Reports', exact: true }).click();
  await expect(page).toHaveURL(`/reports?workspace=${workspaceId}`);
  await page.waitForLoadState('networkidle');
  for (const [area, label] of reportAreas) {
    await expect(page.getByRole('heading', { name: label, exact: true })).toBeVisible();
    await page.getByRole('button', { name: `View my templates: ${label}` }).click();
    await expect(page).toHaveURL(`/reports/${area}?workspace=${workspaceId}`, { timeout: 30_000 });
    await page.getByRole('button', { name: 'My Templates', exact: true }).click({ timeout: 30_000 });
    const modal = page.getByRole('dialog', { name: 'My Templates', exact: true });
    await expect(modal.getByRole('heading', { name: 'My templates', exact: true })).toBeVisible();
    await modal.getByRole('button', { name: 'Close', exact: true }).click();
    await page.getByRole('link', { name: 'Reports', exact: true }).click();
    await page.waitForLoadState('networkidle');
  }
  await page.getByRole('button', { name: 'View my templates: CRM activity history' }).click();
  await page.getByRole('button', { name: 'My Templates', exact: true }).click();
  await page.getByRole('button', { name: 'Create Report Template' }).click();
  await page.getByRole('textbox', { name: 'Template name' }).fill('Activity review');
  await page.getByRole('button', { name: 'Save personal template' }).click();
  await expect(page.getByRole('button', { name: 'Run report: Activity review' })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'My Templates', exact: true }).click();
  await page.getByRole('button', { name: 'Run report: Activity review' }).click();
  await expect(page.getByRole('button', { name: 'Update this template' })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'About saving report templates' }).click();
  await expect(page.getByText('Currently based on: Activity review.')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'My Templates', exact: true }).click();
  await page.getByRole('button', { name: 'Template options: Activity review' }).click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Delete template' }).click();
  await expect(page.getByText('No templates yet')).toBeVisible();
});
