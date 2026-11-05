import { expect as baseExpect, test, type BrowserContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase, createCaptureDraft, initializeWorkspacePolicy, processCapturePublications } from '@salesmora/data';
import type { PermissionId } from '@salesmora/contracts';
import { captureSchedulerConfiguration, workerCaptureDelivery } from '../../worker/src/capture-delivery';
const expect = baseExpect.configure({ timeout: 60000 });
const target = process.env.TEST_DATABASE_URL;
if (!target || !new URL(target).pathname.endsWith('_test') || !['localhost', '127.0.0.1'].includes(new URL(target).hostname)) throw Error('Disposable local database required.');
const db = createDatabase(target), runtimeURL = new URL(target); runtimeURL.searchParams.set('options', '-c role=salesmora_worker'); const worker = createDatabase(runtimeURL.toString());
const origin = process.env.SALESMORA_E2E_ORIGIN!, scope = process.env.CAPTURE_PUBLICATION_WORKSPACE_IDS!.split(',');
const enabled: PermissionId[] = ['leadCapture.read', 'leadCapture.create', 'leadCapture.update', 'leadCapture.activate', 'leadCapture.pause', 'leadCapture.archive'];
test.setTimeout(240000); test.afterAll(async () => { await Promise.all([db.destroy(), worker.destroy()]); });
async function fixture(context: BrowserContext, workspaceId: string) {
  const email = `activation-${randomUUID()}@example.test`;
  expect((await context.request.post('/api/auth/sign-up/email', { headers: { Origin: origin }, data: { name: 'Activation Owner', email, password: 'Fictional-activation-password-42!', termsAccepted: true, plan: 'free' } })).ok()).toBe(true);
  const user = await db('users').where({ email }).first(), identity = { userId: user.id as string, workspaceId };
  await db.transaction(async trx => {
    await trx('workspaces').insert({ id: workspaceId, ownerId: user.id, businessName: 'Activation Test', businessType: 'plumbing', postalCode: '10013', serviceRange: '25-miles', timezone: 'America/New_York' });
    await trx('workspaceMemberships').insert({ ...identity, role: 'owner' }); await initializeWorkspacePolicy(trx, identity); await trx('workspaceSubscriptions').insert({ workspaceId, catalogVersion: 'fixture' });
  });
  const configuration = { schemaVersion: 1, type: 'website', contactRequired: true, fields: [{ id: 'name', key: 'name', type: 'short_text', label: 'Name', required: true, options: [] }, { id: 'service', key: 'service', type: 'short_text', label: 'Service', required: true, options: [] }, { id: 'email', key: 'email', type: 'email', label: 'Email', required: true, options: [] }], workflow: { assignment: { kind: 'teammate', teammateId: user.id }, stage: 'new', tags: [], notifyAssigned: false }, content: { businessName: 'Activation Test', title: 'Fictional form', intro: '', submitLabel: 'Send', thankYou: 'Thanks', unavailableMessage: 'Unavailable', businessEmail: '', businessPhone: '', showBusinessEmail: false, showBusinessPhone: false, privacy: null, consent: null } };
  const draft = await createCaptureDraft(db, identity, enabled, { workspaceId, requestId: randomUUID(), name: 'Activation form', configuration });
  return { identity, sourceId: draft.sourceId };
}
async function publish(context: BrowserContext, identity: { workspaceId: string }, sourceId: string, scheduled = false) {
  const response = await context.request.get(`/api/lead-capture/${sourceId}/publication?workspace=${identity.workspaceId}`); expect(response.status()).toBe(200); const review = await response.json(); expect(review.ready).toBe(true);
  const result = await context.request.post(`/api/lead-capture/${sourceId}/publication`, { headers: { Origin: origin }, data: { workspaceId: identity.workspaceId, sourceId, requestId: randomUUID(), confirmed: true, expectedVersion: review.sourceVersion, draftVersion: review.draftVersion, configurationVersion: review.configurationVersion, baseApprovedVersion: review.baseApprovedVersion, timing: scheduled ? { kind: 'scheduled', at: new Date(Date.now() + 60000).toISOString(), timezone: 'America/New_York' } : { kind: 'now' } } });
  expect(result.status()).toBe(200); return result.json();
}
test('real authenticated review launches, exposes persisted installation and resumes with matching readiness', async ({ context, page }) => {
  const { identity, sourceId } = await fixture(context, scope[0]);
  await page.goto(`/lead-capture/${sourceId}/setup?workspace=${identity.workspaceId}&step=review`);
  await expect(page.getByRole('heading', { name: 'Review before launch', exact: true })).toBeVisible();
  for (const width of [1440, 768, 320]) { await page.setViewportSize({ width, height: 1000 }); await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
  await page.screenshot({ path: test.info().outputPath('ready-review-320.png'), fullPage: true });
  await page.getByRole('checkbox', { name: 'I reviewed this setup and approve the capture source to launch at the selected time.', exact: true }).check();
  await page.getByRole('button', { name: 'Approve and launch', exact: true }).click();
  await expect(page).toHaveURL(/tab=publication/); const publication = await db('capturePublications').where({ sourceId }).first();
  await expect(page.getByRole('textbox', { name: 'Hosted form link', exact: true })).toHaveValue(`http://localhost:3024/f/${publication.publicKey}`);
  const read = await (await context.request.get(`/api/lead-capture/${sourceId}?workspace=${identity.workspaceId}`)).json(); expect(read.installation.hostedUrl).toBe(`http://localhost:3024/f/${publication.publicKey}`); expect(read.lifecycleReview.canPause).toBe(true);
  expect((await context.request.post(`/api/lead-capture/${sourceId}/lifecycle`, { headers: { Origin: origin }, data: { workspaceId: identity.workspaceId, sourceId, requestId: randomUUID(), expectedVersion: read.detail.source.version, action: 'pause', confirmed: true } })).status()).toBe(200);
  await page.goto(`/lead-capture?workspace=${identity.workspaceId}`); await page.getByRole('button', { name: 'Review and resume · Activation form', exact: true }).click(); await expect(page.getByRole('button', { name: 'Resume intake', exact: true })).toBeEnabled(); await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel', exact: true }).focus(); await page.screenshot({ path: test.info().outputPath('ready-resume-320.png'), animations: 'disabled' }); await page.getByRole('button', { name: 'Resume intake', exact: true }).click(); await expect(page.getByRole('alertdialog')).not.toBeVisible();
  expect((await db('captureSources').where({ id: sourceId }).first()).status).toBe('active');
});
test('a non-allowlisted real workspace cannot publish or acquire installation authority', async ({ context, page }) => {
  const { identity, sourceId } = await fixture(context, randomUUID());
  const review = await (await context.request.get(`/api/lead-capture/${sourceId}/publication?workspace=${identity.workspaceId}`)).json(); expect(review.ready).toBe(false); expect(review.checks).toContainEqual({ code: 'delivery', ready: false });
  expect((await context.request.post(`/api/lead-capture/${sourceId}/publication`, { headers: { Origin: origin }, data: { workspaceId: identity.workspaceId, sourceId, requestId: randomUUID(), expectedVersion: review.sourceVersion, draftVersion: review.draftVersion, configurationVersion: review.configurationVersion, baseApprovedVersion: review.baseApprovedVersion, confirmed: true, timing: { kind: 'now' } } })).status()).toBe(422);
  const source = await (await context.request.get(`/api/lead-capture/${sourceId}?workspace=${identity.workspaceId}`)).json(); expect(source.installation).toBeNull();
  await page.goto(`/lead-capture/${sourceId}/setup?workspace=${identity.workspaceId}&step=review`); await expect(page.getByText('Form or Gmail delivery is not enabled for this workspace.', { exact: true })).toBeVisible();
  expect((await context.request.post('/api/internal/lead-capture/readiness', { data: { workspaceId: identity.workspaceId, requestId: randomUUID() } })).status()).toBe(401);
});
test('scheduled publication uses the real private web probe and readiness loss blocks a later launch', async ({ context, page }) => {
  const { identity, sourceId } = await fixture(context, scope[1]); const scheduled = await publish(context, identity, sourceId, true);
  const due = async (id: string) => db.transaction(async trx => { await trx.raw('ALTER TABLE "capturePublicationTransitions" DISABLE TRIGGER capture_transition_immutable'); await trx('capturePublicationTransitions').where({ id }).update({ scheduledAt: new Date(Date.now() - 1000) }); await trx.raw('ALTER TABLE "capturePublicationTransitions" ENABLE TRIGGER capture_transition_immutable'); });
  await due(scheduled.transitionId);
  const env = { ...process.env, CAPTURE_SCHEDULER_ENABLED: 'true', CAPTURE_READINESS_URL: origin + '/api/internal/lead-capture/readiness', NODE_ENV: 'test' as const };
  const warm = await context.request.post('/api/internal/lead-capture/readiness', { headers: { Authorization: 'Bearer ' + process.env.CAPTURE_READINESS_SECRET }, data: { workspaceId: identity.workspaceId, requestId: randomUUID() } }); expect(warm.status()).toBe(200); expect((await warm.json()).websiteReady).toBe(true);
  const authority = workerCaptureDelivery(captureSchedulerConfiguration(env)!);
  expect(await processCapturePublications(worker, enabled, authority, 100, [identity.workspaceId])).toBe(1); expect((await db('captureSources').where({ id: sourceId }).first()).status).toBe('active');
  await page.goto(`/lead-capture/${sourceId}?workspace=${identity.workspaceId}&tab=publication`); await expect(page.getByRole('heading', { name: 'Capture source dashboard', exact: true }).first()).toBeVisible();
  // A second workspace gets its own real sign-in and slot. An invalid probe credential models readiness loss.
  const blocked = await fixture(context, scope[2]), pending = await publish(context, blocked.identity, blocked.sourceId, true); await due(pending.transitionId);
  const unavailable = workerCaptureDelivery(captureSchedulerConfiguration({ ...env, CAPTURE_READINESS_SECRET: Buffer.alloc(32, 9).toString('base64') })!);
  expect(await processCapturePublications(worker, enabled, unavailable, 100, [blocked.identity.workspaceId])).toBe(0);
  expect((await db('capturePublicationTransitions').where({ id: pending.transitionId }).first()).state).toBe('blocked'); expect((await db('captureSources').where({ id: blocked.sourceId }).first()).status).toBe('paused');
  expect(await processCapturePublications(worker, enabled, authority, 100, [blocked.identity.workspaceId])).toBe(0);
});
