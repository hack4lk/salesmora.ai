import { expect as baseExpect, test, type BrowserContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase, createCaptureDraft, publishCaptureDraft, readCapturePublicationReview, beginCaptureRevision } from '@salesmora/data';
import type { PermissionId } from '@salesmora/contracts';
const expect = baseExpect.configure({ timeout: 40_000 });
const target = process.env.TEST_DATABASE_URL;
if (!target || !new URL(target).pathname.endsWith('_test') || !['127.0.0.1', 'localhost'].includes(new URL(target).hostname)) throw Error('Disposable local test database required.');
const db = createDatabase(target), origin = process.env.SALESMORA_E2E_ORIGIN!;
const enabled: PermissionId[] = ['leadCapture.read', 'leadCapture.create', 'leadCapture.update', 'leadCapture.activate', 'leadCapture.pause', 'leadCapture.archive'];
const delivery = { websiteReady: async () => true, gmailReady: async () => false };
test.setTimeout(180000);
test.afterAll(async () => db.destroy());
async function fixture(context: BrowserContext, scheduled = false) {
  const headers = { Origin: origin };
  expect((await context.request.post('/api/auth/sign-up/email', { headers, data: { name: 'Lifecycle Owner', email: `lifecycle-${randomUUID()}@example.test`, password: 'Fictional-lifecycle-password-42!', termsAccepted: true, plan: 'free' } })).ok()).toBe(true);
  const created = await context.request.post('/api/workspaces', { headers, data: { business: { businessName: 'Lifecycle Test Business', businessType: 'plumbing' }, services: { services: ['drain-cleaning'], postalCode: '10013', serviceRange: '25-miles' }, team: { invitations: [] } } });
  expect(created.status()).toBe(201); const { workspaceId } = await created.json(); const workspace = await db('workspaces').where({ id: workspaceId }).first(); const userId = workspace.ownerId;
  const identity = { workspaceId, userId };
  const configuration = { schemaVersion: 1, type: 'website', contactRequired: true, fields: [{ id: 'name', key: 'name', type: 'short_text', label: 'Name', required: true, options: [] }, { id: 'service', key: 'service', type: 'short_text', label: 'Service', required: true, options: [] }, { id: 'email', key: 'email', type: 'email', label: 'Email', required: true, options: [] }], workflow: { assignment: { kind: 'default' }, stage: 'new', tags: [], notifyAssigned: false }, content: { businessName: 'Fictional business', title: 'Test request', intro: '', submitLabel: 'Send', thankYou: 'Thanks', unavailableMessage: 'Unavailable', businessEmail: '', businessPhone: '', showBusinessEmail: false, showBusinessPhone: false, privacy: null, consent: null } };
  const draft = await createCaptureDraft(db, identity, enabled, { workspaceId, requestId: randomUUID(), name: 'Lifecycle form', configuration });
  const review = await readCapturePublicationReview(db, identity, enabled, { workspaceId, sourceId: draft.sourceId }, delivery);
  const publication = await publishCaptureDraft(db, identity, enabled, { workspaceId, sourceId: draft.sourceId, requestId: randomUUID(), confirmed: true, expectedVersion: review.sourceVersion, draftVersion: review.draftVersion, configurationVersion: review.configurationVersion, baseApprovedVersion: review.baseApprovedVersion, timing: scheduled ? { kind: 'scheduled', at: new Date(Date.now() + 60000).toISOString(), timezone: workspace.timezone } : { kind: 'now' } }, delivery);
  return { identity, sourceId: draft.sourceId, publication };
}
test('list confirmation, lost acknowledgement retry, blocked resume and dashboard archive', async ({ context, page }) => {
  const { identity, sourceId } = await fixture(context); const commands: unknown[] = []; let lost = false;
  await page.goto(`/lead-capture?workspace=${identity.workspaceId}`);
  await page.getByRole('button', { name: 'Pause · Lifecycle form', exact: true }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible(); expect((await db('captureOperations').where({ workspaceId: identity.workspaceId, operation: 'source.pause' })).length).toBe(0);
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Pause · Lifecycle form', exact: true }).click();
  await page.route('**/api/lead-capture/*/lifecycle', async route => { commands.push(route.request().postDataJSON()); if (!lost) { lost = true; await route.fetch(); await route.abort('failed'); } else await route.continue(); });
  await page.getByRole('button', { name: 'Pause intake', exact: true }).click();
  await expect(page.getByText('The action could not be confirmed. Retry the same request.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Pause intake', exact: true }).click();
  await expect(page.getByRole('alertdialog')).not.toBeVisible(); await expect(page.getByRole('button', { name: 'Review and resume · Lifecycle form', exact: true })).toBeVisible();
  expect(commands).toHaveLength(2); expect(commands[0]).toEqual(commands[1]); expect((await db('captureOperations').where({ workspaceId: identity.workspaceId, operation: 'source.pause' })).length).toBe(1);
  await page.unroute('**/api/lead-capture/*/lifecycle');
  await page.getByRole('button', { name: 'Review and resume · Lifecycle form', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Resume intake', exact: true })).toBeDisabled(); await expect(page.getByText('Form or Gmail delivery is not enabled for this workspace.', { exact: true })).toBeVisible();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Open capture source · Lifecycle form', exact: true }).click();
  await page.getByRole('button', { name: 'Source actions', exact: true }).click(); await page.getByRole('menuitem', { name: 'Archive source', exact: true }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible(); await page.getByRole('button', { name: 'Archive source', exact: true }).click();
  await expect(page.getByRole('alertdialog')).not.toBeVisible(); await expect(page.getByRole('button', { name: 'Source actions', exact: true })).not.toBeVisible();
  expect((await db('captureSources').where({ id: sourceId }).first()).status).toBe('archived'); expect((await db('captureSourceVersions').where({ sourceId })).length).toBe(1);
});
test('dashboard conflict requires explicit reload and a fresh command', async ({ context, page }) => {
  const { identity, sourceId } = await fixture(context); const commands: { expectedVersion: number; requestId: string }[] = [];
  await page.goto(`/lead-capture/${sourceId}?workspace=${identity.workspaceId}`); await page.getByRole('button', { name: 'Source actions', exact: true }).click(); await page.getByRole('menuitem', { name: 'Pause intake', exact: true }).click(); await expect(page.getByRole('alertdialog')).toBeVisible();
  await beginCaptureRevision(db, identity, enabled, { workspaceId: identity.workspaceId, sourceId, expectedVersion: 2, requestId: randomUUID() });
  await page.route('**/api/lead-capture/*/lifecycle', async route => { commands.push(route.request().postDataJSON()); await route.continue(); });
  await page.getByRole('button', { name: 'Pause intake', exact: true }).click(); await expect(page.getByText('This source changed. Reload its latest details before confirming.', { exact: true })).toBeVisible(); await expect(page.getByRole('button', { name: 'Pause intake', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Reload source', exact: true }).click(); await expect(page.getByRole('button', { name: 'Pause intake', exact: true })).toBeEnabled(); await page.getByRole('button', { name: 'Pause intake', exact: true }).click(); await expect(page.getByRole('alertdialog')).not.toBeVisible();
  expect(commands).toHaveLength(2); expect(commands[0].expectedVersion).toBe(2); expect(commands[1].expectedVersion).toBe(3); expect(commands[0].requestId).not.toBe(commands[1].requestId); expect((await db('captureSources').where({ id: sourceId }).first()).status).toBe('paused');
});
test('revoked action permission clears the review and hides stale source details', async ({ context, page }) => {
  const { identity, sourceId } = await fixture(context);
  await page.goto(`/lead-capture/${sourceId}?workspace=${identity.workspaceId}`); await page.getByRole('button', { name: 'Source actions', exact: true }).click(); await page.getByRole('menuitem', { name: 'Archive source', exact: true }).click(); await expect(page.getByRole('alertdialog')).toBeVisible();
  await db('workspaceRolePolicies').where({ workspaceId: identity.workspaceId, role: 'owner', permission: 'leadCapture.archive' }).delete(); await page.getByRole('button', { name: 'Archive source', exact: true }).click();
  await expect(page.getByText('This capture source is unavailable.', { exact: true })).toBeVisible(); await expect(page.getByRole('alertdialog')).not.toBeVisible(); await expect(page.getByText('Lifecycle form', { exact: true })).not.toBeVisible(); expect((await db('captureSources').where({ id: sourceId }).first()).status).toBe('active');
});
test('list archive confirms cancellation of a scheduled launch and refreshes filtered rows', async ({ context, page }) => {
  const { identity, sourceId, publication } = await fixture(context, true);
  await page.goto(`/lead-capture?workspace=${identity.workspaceId}`); await page.getByRole('button', { name: 'Archive · Lifecycle form', exact: true }).click();
  await expect(page.getByText('Archiving cancels the scheduled launch. It will not be reinstated when you restore this source.', { exact: true })).toBeVisible(); await page.getByRole('button', { name: 'Archive source', exact: true }).click(); await expect(page.getByRole('alertdialog')).not.toBeVisible(); await expect(page.getByRole('button', { name: 'Open capture source · Lifecycle form', exact: true })).not.toBeVisible();
  expect((await db('captureSources').where({ id: sourceId }).first()).status).toBe('archived'); expect((await db('capturePublicationTransitions').where({ id: publication.transitionId }).first()).state).toBe('cancelled');
});
