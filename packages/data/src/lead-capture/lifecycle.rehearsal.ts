/** Real runtime-role lifecycle checks on a fresh disposable local database only. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { PermissionId } from '@salesmora/contracts';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy, AuthorizationAccessError, withWorkspaceAuthorization } from '../authorization/store';
import { suspendUser, unsuspendUser } from '../accounts/suspension';
import { createCaptureDraft, beginCaptureRevision, saveCaptureDraft, readCaptureSource, listCaptureSources } from './store';
import { publishCaptureDraft, readCapturePublicationReview, CapturePublicationError } from './publication';
import { changeCaptureLifecycle, captureLifecycleReviewInTransaction } from './lifecycle';
import { readPublicCapture } from './public';
import { prepareCaptureSubmission, commitCaptureSubmission } from './submissions';

const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') || !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw Error('Use a separate local test connection.');
const name = `capture_lifecycle_${randomUUID().replaceAll('-', '')}_test`;
const owner = createDatabase(connection), url = new URL(connection); url.pathname = `/${name}`;
const db = createDatabase(url.href), runtime = new URL(url); runtime.searchParams.set('options', '-c role=salesmora_web');
const web = createDatabase(runtime.href);
const enabled: PermissionId[] = ['leadCapture.read', 'leadCapture.create', 'leadCapture.update', 'leadCapture.activate', 'leadCapture.pause', 'leadCapture.archive'];
let created = false, checks = 0, ready = true;
const delivery = { websiteReady: async () => ready, gmailReady: async () => false };
async function check(label: string, run: () => Promise<void>) { await run(); checks++; console.log(`PASS ${label}`); }
async function workspace(premium = false) {
  const identity = { workspaceId: randomUUID(), userId: `lifecycle-${randomUUID()}` }, now = new Date();
  await db('users').insert({ id: identity.userId, name: 'Fictional lifecycle owner', email: `${identity.userId}@example.test`, createdAt: now, updatedAt: now, termsVersion: 'test', termsAcceptedAt: now });
  await db.transaction(async trx => {
    await trx('workspaces').insert({ id: identity.workspaceId, ownerId: identity.userId, businessName: 'Fictional lifecycle workspace', businessType: 'plumbing', postalCode: '', serviceRange: '', timezone: 'America/New_York', ...(premium ? { planOverride: 'premium', planOverrideEndsAt: new Date(Date.now() + 86400000), planOverrideReason: 'Fixture', planOverrideId: randomUUID() } : {}) });
    await trx('workspaceMemberships').insert({ ...identity, role: 'owner' }); await initializeWorkspacePolicy(trx, identity);
    await trx('workspaceSubscriptions').insert({ workspaceId: identity.workspaceId, catalogVersion: 'fixture' });
  }); return identity;
}
type Identity = Awaited<ReturnType<typeof workspace>>;
const configuration = { schemaVersion: 1 as const, type: 'website' as const, contactRequired: true, fields: [{ id: 'name', key: 'name' as const, label: 'Name', type: 'short_text' as const, required: true, options: [] }, { id: 'service', key: 'service' as const, label: 'Service', type: 'short_text' as const, required: true, options: [] }, { id: 'email', key: 'email' as const, label: 'Email', type: 'email' as const, required: true, options: [] }], workflow: { assignment: { kind: 'default' as const }, stage: 'new' as const, tags: ['Lifecycle'], notifyAssigned: false }, content: { businessName: 'Fictional business', title: 'Approved title', intro: '', submitLabel: 'Send', thankYou: 'Thanks', unavailableMessage: 'Unavailable', businessEmail: '', businessPhone: '', showBusinessEmail: false, showBusinessPhone: false, privacy: null, consent: null } };
const draft = (identity: Identity) => createCaptureDraft(web, identity, enabled, { workspaceId: identity.workspaceId, requestId: randomUUID(), name: 'Lifecycle form', configuration });
async function publish(identity: Identity, sourceId: string, scheduled = false) {
  const review = await readCapturePublicationReview(web, identity, enabled, { workspaceId: identity.workspaceId, sourceId }, delivery);
  return publishCaptureDraft(web, identity, enabled, { workspaceId: identity.workspaceId, sourceId, requestId: randomUUID(), confirmed: true, expectedVersion: review.sourceVersion, draftVersion: review.draftVersion, configurationVersion: review.configurationVersion, baseApprovedVersion: review.baseApprovedVersion, timing: scheduled ? { kind: 'scheduled', at: new Date(Date.now() + 60000).toISOString(), timezone: 'America/New_York' } : { kind: 'now' } }, delivery);
}
async function fixture() { const identity = await workspace(), source = await draft(identity); await publish(identity, source.sourceId); return { identity, sourceId: source.sourceId }; }
async function command(identity: Identity, sourceId: string, action: 'pause' | 'resume' | 'archive') {
  const source = await db('captureSources').where({ workspaceId: identity.workspaceId, id: sourceId }).first();
  return { workspaceId: identity.workspaceId, sourceId, requestId: randomUUID(), expectedVersion: source.version, action, confirmed: true, ...(action === 'resume' ? { configuration: { kind: 'approved', version: source.approvedVersion } } : {}) };
}
const change = async (identity: Identity, sourceId: string, action: 'pause' | 'resume' | 'archive') => changeCaptureLifecycle(web, identity, enabled, await command(identity, sourceId, action), delivery);
function submission(publication: { publicKey: string; version: number; configurationVersion: number }) {
  const issuedAt = Math.floor(Date.now() / 1000) - 1;
  return { proof: { purpose: 'capture_submission' as const, audience: 'https://forms.example.test', publicKey: publication.publicKey, publicationVersion: publication.version, configurationVersion: publication.configurationVersion, submissionId: randomUUID(), issuedAt, expiresAt: issuedAt + 1800 }, submission: { context: 'signature-validated-by-HTTP-boundary', requestId: randomUUID(), answers: { name: 'Fictional visitor', service: 'Repair', email: `${randomUUID()}@example.test` }, consent: null, website: '' }, clientHash: 'a'.repeat(64), limits: { challengeAfter: 5, hardLimit: 20, sourceRequestsPerMinute: 1000, maxPendingItems: 10000, maxRetainedBytes: 67108864 } };
}
try {
  await owner.raw('CREATE DATABASE ??', [name]); created = true;
  await db.migrate.latest({ directory: fileURLToPath(new URL('../migrations', import.meta.url)), loadExtensions: ['.ts'] });
  assert.equal((await web.raw('SELECT current_user AS role')).rows[0].role, 'salesmora_web');
  await check('pause/archive need their own grants, not activation, and replay is scoped, actor-bound and reauthorized', async () => {
    const { identity, sourceId } = await fixture(), input = await command(identity, sourceId, 'pause');
    const result = await changeCaptureLifecycle(web, identity, enabled.filter(permission => permission !== 'leadCapture.activate'), input);
    assert.deepEqual(await changeCaptureLifecycle(web, identity, enabled, input), result);
    await assert.rejects(changeCaptureLifecycle(web, identity, enabled, { ...input, expectedVersion: input.expectedVersion + 1 }), CapturePublicationError);
    const savedGrant = await db('workspaceRolePolicies').where({ workspaceId: identity.workspaceId, role: 'owner', permission: 'leadCapture.pause' }).first(); assert.ok(savedGrant);
    await db('workspaceRolePolicies').where({ workspaceId: identity.workspaceId, role: 'owner', permission: 'leadCapture.pause' }).delete();
    await assert.rejects(changeCaptureLifecycle(web, identity, enabled, input), AuthorizationAccessError); await db('workspaceRolePolicies').insert(savedGrant);
    const other = await workspace(); await assert.rejects(changeCaptureLifecycle(web, other, enabled, { ...input, workspaceId: other.workspaceId }), AuthorizationAccessError);
    const adminId = `admin-${randomUUID()}`, now = new Date(); await db('users').insert({ id: adminId, name: 'Fictional admin', email: `${adminId}@example.test`, createdAt: now, updatedAt: now, termsVersion: 'test', termsAcceptedAt: now }); await db('workspaceMemberships').insert({ workspaceId: identity.workspaceId, userId: adminId, role: 'admin' });
    await assert.rejects(changeCaptureLifecycle(web, { ...identity, userId: adminId }, enabled, input), CapturePublicationError);
    assert.equal((await db('captureOperations').where({ workspaceId: identity.workspaceId, operation: 'source.pause' })).length, 1);
    assert.equal((await db('captureSourceEvents').where({ sourceId, kind: 'source.paused' })).length, 1);
    await assert.rejects(changeCaptureLifecycle(web, identity, enabled.filter(p => p !== 'leadCapture.archive'), await command(identity, sourceId, 'archive')), AuthorizationAccessError);
    const fieldId = `field-${randomUUID()}`, officeId = `office-${randomUUID()}`;
    for (const [id, role] of [[fieldId, 'field'], [officeId, 'office']]) { await db('users').insert({ id, name: 'Fictional teammate', email: `${id}@example.test`, createdAt: now, updatedAt: now, termsVersion: 'test', termsAcceptedAt: now }); await db('workspaceMemberships').insert({ workspaceId: identity.workspaceId, userId: id, role }); }
    await db('workspaceRolePolicies').insert({ workspaceId: identity.workspaceId, role: 'field', permission: 'leadCapture.read', scope: 'workspace' }).onConflict(['workspaceId', 'role', 'permission']).merge({ scope: 'workspace' });
    const archive = await command(identity, sourceId, 'archive');
    await assert.rejects(changeCaptureLifecycle(web, { ...identity, userId: fieldId }, enabled, archive), AuthorizationAccessError);
    await changeCaptureLifecycle(web, { ...identity, userId: officeId }, enabled, archive);
  });
  await check('approved-only resume preserves draft edits, publication identity, receipts and intake on archive', async () => {
    const { identity, sourceId } = await fixture(), pub = await db('capturePublications').where({ sourceId }).first(), value = submission(pub);
    assert.equal((await prepareCaptureSubmission(web, value)).state, 'ready'); assert.equal((await commitCaptureSubmission(web, value)).state, 'accepted');
    const receipt = await db('captureReceipts').where({ sourceId, dedupeKey: value.submission.requestId }).first(); const evidence = JSON.stringify(receipt);
    const duplicate = { ...value, submission: { ...value.submission, requestId: randomUUID() } };
    assert.equal((await prepareCaptureSubmission(web, duplicate)).state, 'ready'); assert.equal((await commitCaptureSubmission(web, duplicate)).state, 'accepted');
    const intake = await db('intakeItems').where({ sourceId }).first(); assert.ok(intake); const intakeSnapshot = JSON.stringify(intake);
    const source = await db('captureSources').where({ id: sourceId }).first(); const revision = await beginCaptureRevision(web, identity, enabled, { workspaceId: identity.workspaceId, sourceId, expectedVersion: source.version, requestId: randomUUID() });
    await saveCaptureDraft(web, identity, enabled, { workspaceId: identity.workspaceId, sourceId, expectedVersion: revision.sourceVersion, expectedDraftVersion: revision.draftVersion, requestId: randomUUID(), name: 'Edited draft', configuration: { ...configuration, content: { ...configuration.content, title: 'Private draft' } } });
    await change(identity, sourceId, 'pause'); assert.equal((await readPublicCapture(web, pub.publicKey)).state, 'unavailable');
    const resume = await command(identity, sourceId, 'resume'); await assert.rejects(changeCaptureLifecycle(web, identity, enabled, resume), (error: unknown) => error instanceof CapturePublicationError && error.failures.includes('delivery')); ready = false; await assert.rejects(changeCaptureLifecycle(web, identity, enabled, resume, delivery), (error: unknown) => error instanceof CapturePublicationError && error.failures.includes('delivery'));
    ready = true; await assert.rejects(changeCaptureLifecycle(web, identity, enabled, { ...resume, configuration: { kind: 'approved', version: 9 } }, delivery), CapturePublicationError);
    const resumed = await changeCaptureLifecycle(web, identity, enabled, resume, delivery);
    const visible = await readPublicCapture(web, pub.publicKey); assert.equal(visible.state, 'ready'); if (visible.state === 'ready') assert.equal(visible.definition.content.title, 'Approved title');
    const retainedDraft = await db('captureSourceDrafts').where({ sourceId }).first(); assert.equal(retainedDraft.configuration.content.title, 'Private draft'); assert.equal((await db('capturePublications').where({ sourceId }).first()).version, pub.version);
    await change(identity, sourceId, 'archive'); assert.deepEqual(await changeCaptureLifecycle(web, identity, enabled, resume), resumed); assert.equal((await db('captureSources').where({ id: sourceId }).first()).status, 'archived'); assert.equal((await readPublicCapture(web, pub.publicKey)).state, 'unavailable'); assert.equal((await prepareCaptureSubmission(web, { ...value, submission: { ...value.submission, requestId: randomUUID() } })).state, 'unavailable'); assert.equal((await prepareCaptureSubmission(web, value)).state, 'accepted');
    assert.equal(JSON.stringify(await db('captureReceipts').where({ id: receipt.id }).first()), evidence); assert.equal(JSON.stringify(await db('intakeItems').where({ id: intake.id }).first()), intakeSnapshot); assert.equal((await db('leadCaptureData').where({ receiptId: receipt.id })).length, 1); assert.equal((await db('captureReceiptProcessing').where({ receiptId: receipt.id })).length, 1); assert.equal((await db('captureSourceVersions').where({ sourceId })).length, 1);
  });
  await check('resume checks live assignment and suspended-owner access; explicit reviewed recovery clears historical block', async () => {
    const { identity, sourceId } = await fixture(), pub = await db('capturePublications').where({ sourceId }).first(); await change(identity, sourceId, 'pause');
    const rule = await db('leadAssignmentSettings').where({ workspaceId: identity.workspaceId }).first(); await db('leadAssignmentSettings').where({ workspaceId: identity.workspaceId }).delete();
    await assert.rejects(change(identity, sourceId, 'resume'), (e: unknown) => e instanceof CapturePublicationError && e.failures.includes('workflow')); await db('leadAssignmentSettings').insert(rule);
    await change(identity, sourceId, 'resume'); const actor = { type: 'system' as const, id: 'lifecycle-rehearsal' };
    await suspendUser(db, { userId: identity.userId, actor, reason: 'Fictional access-loss check' }); assert.equal((await prepareCaptureSubmission(web, submission(pub))).state, 'unavailable');
    await assert.rejects(change(identity, sourceId, 'resume'), AuthorizationAccessError); await unsuspendUser(db, { userId: identity.userId, actor, reason: 'Fictional access restored' });
    assert.equal((await readPublicCapture(web, pub.publicKey)).state, 'unavailable'); await change(identity, sourceId, 'resume'); assert.equal((await readPublicCapture(web, pub.publicKey)).state, 'ready');
    assert.equal((await db('captureSources').where({ id: sourceId }).first()).block, 'none');
  });
  await check('pause cancels scheduled revisions and retains the approved future work as an editable draft', async () => {
    const { identity, sourceId } = await fixture(), source = await db('captureSources').where({ id: sourceId }).first(), pub = await db('capturePublications').where({ sourceId }).first();
    await beginCaptureRevision(web, identity, enabled, { workspaceId: identity.workspaceId, sourceId, expectedVersion: source.version, requestId: randomUUID() }); const scheduled = await publish(identity, sourceId, true);
    await change(identity, sourceId, 'pause'); assert.equal((await db('capturePublicationTransitions').where({ id: scheduled.transitionId }).first()).state, 'cancelled');
    const paused = await db('captureSources').where({ id: sourceId }).first(); assert.ok(paused.draftId); assert.equal(paused.approvedVersion, 1); assert.equal((await db('captureSourceVersions').where({ sourceId })).length, 2); assert.equal((await db('captureSourceDrafts').where({ id: paused.draftId }).first()).baseApprovedVersion, 1); assert.equal((await db('capturePublications').where({ sourceId }).first()).publicKey, pub.publicKey);
    await change(identity, sourceId, 'resume'); assert.equal((await db('captureSources').where({ id: sourceId }).first()).approvedVersion, 1);
  });
  await check('archive handles drafts and scheduled launches; illegal transitions and unconfirmed requests leave no receipts', async () => {
    const identity = await workspace(), source = await draft(identity); await assert.rejects(change(identity, source.sourceId, 'pause'), CapturePublicationError);
    await assert.rejects(changeCaptureLifecycle(web, identity, enabled, { ...await command(identity, source.sourceId, 'archive'), confirmed: false }), CapturePublicationError); await change(identity, source.sourceId, 'archive'); await assert.rejects(change(identity, source.sourceId, 'resume'), CapturePublicationError);
    const scheduledOwner = await workspace(), scheduledDraft = await draft(scheduledOwner); const scheduled = await publish(scheduledOwner, scheduledDraft.sourceId, true); await change(scheduledOwner, scheduledDraft.sourceId, 'archive');
    const archived = await db('captureSources').where({ id: scheduledDraft.sourceId }).first(); assert.equal(archived.status, 'archived'); assert.equal(archived.scheduledAt, null); assert.ok(archived.draftId); assert.equal((await db('capturePublicationTransitions').where({ id: scheduled.transitionId }).first()).state, 'cancelled');
  });
  await check('concurrent commands have one winner and one audit/operation receipt', async () => {
    const { identity, sourceId } = await fixture(), pause = await command(identity, sourceId, 'pause'), archive = await command(identity, sourceId, 'archive');
    const results = await Promise.allSettled([changeCaptureLifecycle(web, identity, enabled, pause), changeCaptureLifecycle(web, identity, enabled, archive)]); assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
    assert.equal((await db('captureOperations').where({ workspaceId: identity.workspaceId }).whereIn('operation', ['source.pause', 'source.archive'])).length, 1);
  });
  await check('capacity reconciliation is retained on conflict, then recovery can be reviewed without a retry loop', async () => {
    const identity = await workspace(true), first = await draft(identity), second = await draft(identity); await publish(identity, first.sourceId); await publish(identity, second.sourceId); await change(identity, first.sourceId, 'pause');
    await db('workspaces').where({ id: identity.workspaceId }).update({ planOverride: null, planOverrideEndsAt: null, planOverrideReason: null, planOverrideId: null });
    await assert.rejects(change(identity, first.sourceId, 'resume'), CapturePublicationError); const blocked = await db('captureSources').where({ id: first.sourceId }).first(); assert.equal(blocked.block, 'source_capacity');
    await change(identity, second.sourceId, 'archive'); await change(identity, first.sourceId, 'resume'); assert.equal((await db('captureSources').where({ id: first.sourceId }).first()).block, 'none');
  });
  await check('audit failure rolls back archive, schedule cancellation, restored draft and operation receipt together', async () => {
    const { identity, sourceId } = await fixture(), initial = await db('captureSources').where({ id: sourceId }).first();
    await beginCaptureRevision(web, identity, enabled, { workspaceId: identity.workspaceId, sourceId, expectedVersion: initial.version, requestId: randomUUID() }); const scheduled = await publish(identity, sourceId, true);
    const before = await db('captureSources').where({ id: sourceId }).first(), savedDraft = await db('captureSourceDrafts').where({ sourceId }).first();
    await db.raw(`CREATE FUNCTION reject_lifecycle_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.kind = 'source.archived' THEN RAISE EXCEPTION 'Controlled lifecycle audit failure'; END IF; RETURN NEW; END $$`);
    await db.raw('CREATE TRIGGER reject_lifecycle_audit BEFORE INSERT ON "captureSourceEvents" FOR EACH ROW EXECUTE FUNCTION reject_lifecycle_audit()');
    try { await assert.rejects(change(identity, sourceId, 'archive'), (error: { code?: string }) => error.code === 'P0001'); }
    finally { await db.raw('DROP TRIGGER reject_lifecycle_audit ON "captureSourceEvents"'); await db.raw('DROP FUNCTION reject_lifecycle_audit()'); }
    assert.deepEqual(await db('captureSources').where({ id: sourceId }).first(), before); assert.deepEqual(await db('captureSourceDrafts').where({ sourceId }).first(), savedDraft);
    assert.equal((await db('capturePublicationTransitions').where({ id: scheduled.transitionId }).first()).state, 'pending'); assert.equal((await db('captureOperations').where({ workspaceId: identity.workspaceId, operation: 'source.archive' })).length, 0);
  });
  await check('read-only lifecycle reviews bind current versions, expose real capabilities and share mutation readiness', async () => {
    const { identity, sourceId } = await fixture();
    const active = await readCaptureSource(web, identity, enabled, { workspaceId: identity.workspaceId, sourceId });
    assert.equal(active.lifecycleReview?.canPause, true); assert.equal(active.lifecycleReview.canArchive, true); assert.equal(active.lifecycleReview.canResume, false);
    const list = await listCaptureSources(web, identity, enabled, { workspaceId: identity.workspaceId }); assert.equal(list.permissions.canPause, true); assert.equal(list.permissions.canArchive, true);
    await change(identity, sourceId, 'pause');
    const before = await db('captureSources').where({ id: sourceId }).first(); const operations = (await db('captureOperations').where({ workspaceId: identity.workspaceId })).length;
    const paused = await readCaptureSource(web, identity, enabled, { workspaceId: identity.workspaceId, sourceId }); assert.ok(paused.lifecycleReview); assert.equal(paused.lifecycleReview.sourceVersion, before.version); assert.equal(paused.lifecycleReview.canResume, true); assert.equal(paused.lifecycleReview.resumeReady, false); assert.ok(paused.lifecycleReview.resumeFailures.includes('delivery'));
    const reviewed = await withWorkspaceAuthorization(web, identity, enabled, false, (trx, context) => captureLifecycleReviewInTransaction(trx, context, before, delivery)); assert.equal(reviewed.resumeReady, true);
    assert.deepEqual(await db('captureSources').where({ id: sourceId }).first(), before); assert.equal((await db('captureOperations').where({ workspaceId: identity.workspaceId })).length, operations);
    await db('workspaceRolePolicies').where({ workspaceId: identity.workspaceId, role: 'owner', permission: 'leadCapture.pause' }).delete();
    assert.equal((await readCaptureSource(web, identity, enabled, { workspaceId: identity.workspaceId, sourceId })).lifecycleReview?.canResume, false);
  });
  console.log(`Capture lifecycle rehearsal passed (${checks} groups).`);
} finally { await web.destroy(); await db.destroy(); if (created) await owner.raw('DROP DATABASE ??', [name]); await owner.destroy(); }
