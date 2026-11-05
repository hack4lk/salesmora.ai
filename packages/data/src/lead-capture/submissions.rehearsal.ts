/** Isolated local database only. Provider authority is explicitly simulated; no external calls. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { CaptureDraftConfiguration, CapturePublicSubmission, CaptureSubmissionContext, PermissionId } from '@salesmora/contracts';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy } from '../authorization/store';
import { createCaptureDraft } from './store';
import { readCapturePublicationReview, publishCaptureDraft } from './publication';
import { prepareCaptureSubmission, commitCaptureSubmission, recordCaptureChallengeVerification, takeCaptureRequestBudget, purgeCaptureSubmissionAbuse, type CaptureSubmissionLimits } from './submissions';
import { processAssignmentEmails } from '../notifications/delivery';
const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url)); if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') || !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw Error('Separate local test connection required.');
const name = `capture_submit_${randomUUID().replaceAll('-', '')}_test`, owner = createDatabase(connection), url = new URL(connection); url.pathname = `/${name}`;
const db = createDatabase(url.toString()), roleURL = new URL(url); roleURL.searchParams.set('options', '-c role=salesmora_web'); const web = createDatabase(roleURL.toString()); roleURL.searchParams.set('options', '-c role=salesmora_worker'); const worker = createDatabase(roleURL.toString());
const enabled: PermissionId[] = ['leadCapture.read', 'leadCapture.create', 'leadCapture.update', 'leadCapture.activate', 'leads.read'];
const limits: CaptureSubmissionLimits = { challengeAfter: 5, hardLimit: 20, sourceRequestsPerMinute: 1000, maxPendingItems: 10000, maxRetainedBytes: 67108864 };
const delivery = { websiteReady: async () => true, gmailReady: async () => false };
let created = false, groups = 0; const priorBilling = process.env.BILLING_SANDBOX_ENABLED;
async function check(label: string, run: () => Promise<void>) { await run(); groups++; console.log(`PASS ${label}`); }
async function fixture(notify = true) {
  const identity = { workspaceId: randomUUID(), userId: `submission-${randomUUID()}` }, now = new Date();
  await db('users').insert({ id: identity.userId, name: 'Fixture owner', email: `${identity.userId}@example.test`, emailVerified: true, createdAt: now, updatedAt: now, termsVersion: 'test', termsAcceptedAt: now });
  await db.transaction(async trx => { await trx('workspaces').insert({ id: identity.workspaceId, ownerId: identity.userId, businessName: 'Fixture business', businessType: 'plumbing', postalCode: '', serviceRange: '', timezone: 'America/New_York' }); await trx('workspaceMemberships').insert({ ...identity, role: 'owner' }); await initializeWorkspacePolicy(trx, identity); await trx('workspaceSubscriptions').insert({ workspaceId: identity.workspaceId, plan: 'free', catalogVersion: 'fixture' }); });
  const configuration: CaptureDraftConfiguration = { schemaVersion: 1, type: 'website', contactRequired: true,
    fields: [{ id: 'name', key: 'name', label: 'Name', type: 'short_text', required: true, options: [] }, { id: 'service', key: 'service', label: 'Service', type: 'dropdown', required: true, options: [{ id: 'repair', label: 'Repair' }, { id: 'install', label: 'Installation' }] }, { id: 'email', key: 'email', label: 'Email', type: 'email', required: false, options: [] }, { id: 'custom', key: 'custom', label: 'Project details', type: 'long_text', required: false, options: [] }],
    workflow: { assignment: { kind: 'default' }, stage: 'contacted', tags: ['Website', 'Plumbing'], notifyAssigned: notify },
    content: { businessName: 'Fixture business', title: 'Request service', intro: '', submitLabel: 'Send request', thankYou: 'Thanks', unavailableMessage: 'Call our team', businessEmail: '', businessPhone: '', showBusinessEmail: false, showBusinessPhone: false, consent: { id: 'contact', version: 1, label: 'Contact me about this request.', required: true }, privacy: { label: 'Privacy', href: 'https://example.test/privacy' } } };
  const draft = await createCaptureDraft(web, identity, enabled, { workspaceId: identity.workspaceId, requestId: randomUUID(), name: 'Website', configuration }); const query = { workspaceId: identity.workspaceId, sourceId: draft.sourceId };
  const review = await readCapturePublicationReview(web, identity, enabled, query, delivery);
  await publishCaptureDraft(web, identity, enabled, { ...query, requestId: randomUUID(), confirmed: true, expectedVersion: review.sourceVersion, draftVersion: review.draftVersion, configurationVersion: review.configurationVersion, baseApprovedVersion: review.baseApprovedVersion, timing: { kind: 'now' } }, delivery);
  const pub = await db('capturePublications').where({ sourceId: draft.sourceId }).first(); return { identity, pub, sourceId: draft.sourceId };
}
type Fixture = Awaited<ReturnType<typeof fixture>>;
function input(f: Fixture, overrides: Partial<CapturePublicSubmission> = {}, policy = limits) {
  const issuedAt = Math.floor(Date.now() / 1000) - 2;
  const proof: CaptureSubmissionContext = { purpose: 'capture_submission', audience: 'https://forms.example.test', publicKey: f.pub.publicKey, publicationVersion: f.pub.version, configurationVersion: f.pub.configurationVersion, submissionId: randomUUID(), issuedAt, expiresAt: issuedAt + 1800 };
  const submission: CapturePublicSubmission = { context: 'fixture-signed-outside-data-boundary', requestId: randomUUID(), answers: { name: 'Visitor', email: `${randomUUID()}@example.test`, service: 'repair', custom: 'Original custom answer' }, consent: { id: 'contact', version: 1, accepted: true }, website: '', ...overrides };
  return { proof, submission, clientHash: 'a'.repeat(64), limits: policy };
}
type Input = ReturnType<typeof input>;
async function accept(value: Input) {
  const ready = await prepareCaptureSubmission(web, value); if (ready.state !== 'ready') return ready;
  assert.equal(ready.challengeRequired, false); return commitCaptureSubmission(web, value);
}
async function verify(value: Input) {
  const ready = await prepareCaptureSubmission(web, value); assert.equal(ready.state, 'ready'); if (ready.state !== 'ready' || !ready.tokenHash || !ready.verificationId) throw Error('Expected challenge identity');
  assert.equal(await recordCaptureChallengeVerification(web, ready.tokenHash, ready.verificationId, new Date(Date.now() + 290000)), true); return ready.tokenHash;
}
try {
  await owner.raw('CREATE DATABASE ??', [name]); created = true; await db.migrate.latest({ directory: fileURLToPath(new URL('../migrations', import.meta.url)), loadExtensions: ['.ts'] }); process.env.BILLING_SANDBOX_ENABLED = 'true';
  await check('automatic admission records one immutable receipt, lead, custom answers, consent, stage and tags', async () => {
    const f = await fixture(), value = input(f); assert.equal((await accept(value)).state, 'accepted');
    const lead = await db('leads').where({ workspaceId: f.identity.workspaceId }).first(); assert.equal(lead.service, 'Repair'); assert.equal(lead.stage, 'contacted'); assert.equal(lead.createdBy, null);
    const receipt = await db('captureReceipts').where({ workspaceId: f.identity.workspaceId }).first(); assert.equal(receipt.admission, 'automatic'); assert.equal(receipt.evidence.consent.wording, 'Contact me about this request.'); assert.equal(receipt.evidence.consent.privacyHref, 'https://example.test/privacy');
    assert.equal((await db('leadCaptureData').where({ receiptId: receipt.id }).first()).answers.custom, 'Original custom answer'); assert.equal((await db('workspaceLeadAdmissions').where({ workspaceId: f.identity.workspaceId })).length, 1); assert.equal((await db('leadTags').where({ leadId: lead.id })).length, 2);
    assert.equal((await db('leadActivity').where({ id: lead.id }).first()).changes.origin, 'lead_capture'); await assert.rejects(web('captureReceipts').where({ id: receipt.id }).update({ inputHash: 'x' }));
  });
  await check('concurrent exact retries create one outcome and changed payloads conflict', async () => {
    const f = await fixture(), value = input(f); const prepared = await Promise.all([prepareCaptureSubmission(web, value), prepareCaptureSubmission(web, value)]); assert.ok(prepared.every(result => result.state === 'ready'));
    const results = await Promise.all([commitCaptureSubmission(web, value), commitCaptureSubmission(web, value)]); assert.ok(results.every(result => result.state === 'accepted'));
    assert.equal((await db('captureReceipts').where({ workspaceId: f.identity.workspaceId })).length, 1); assert.equal((await db('leads').where({ workspaceId: f.identity.workspaceId })).length, 1);
    assert.equal((await prepareCaptureSubmission(web, { ...value, submission: { ...value.submission, answers: { ...value.submission.answers, name: 'Changed' } } })).state, 'conflict');
    await db('captureSources').where({ id: f.sourceId }).update({ status: 'paused' }); assert.equal((await prepareCaptureSubmission(web, { ...value, proof: { ...value.proof, expiresAt: 1 } })).state, 'accepted');
  });
  await check('possible duplicates are retained for review without changing the existing lead', async () => {
    const f = await fixture(), first = input(f); await accept(first); const next = input(f, { answers: { ...first.submission.answers, name: 'A possible duplicate' } }); assert.equal((await accept(next)).state, 'accepted');
    assert.equal((await db('leads').where({ workspaceId: f.identity.workspaceId })).length, 1); const item = await db('intakeItems').where({ workspaceId: f.identity.workspaceId }).first(); assert.ok(item.flags.includes('duplicate')); assert.equal(item.status, 'awaiting'); assert.equal((await db('leads').where({ workspaceId: f.identity.workspaceId }).first()).name, 'Visitor');
  });
  await check('eligible incomplete data enters Intake Review while unknown choices/fields, honeypots and consent fail', async () => {
    const f = await fixture(); assert.equal((await accept(input(f, { answers: { name: '', email: '', service: '' } }))).state, 'accepted'); assert.ok((await db('intakeItems').where({ workspaceId: f.identity.workspaceId }).first()).flags.includes('missing'));
    const invalid: Partial<CapturePublicSubmission>[] = [{ website: 'bot.example' }, { consent: null }, { consent: { id: 'contact', version: 2, accepted: true } }, { consent: { id: 'contact', version: 1, accepted: false } }, { answers: { name: 'Visitor', email: 'visitor@example.test', service: 'forged-choice' } }, { answers: { invented: 'injected' } }]; for (const bad of invalid) assert.equal((await prepareCaptureSubmission(web, input(f, bad))).state, 'invalid');
    assert.equal((await db('leads').where({ workspaceId: f.identity.workspaceId })).length, 0); assert.equal((await db('captureReceipts').where({ workspaceId: f.identity.workspaceId })).length, 1);
  });
  await check('the last monthly lead slot is atomic and exhausted capacity retains pending intake', async () => {
    process.env.BILLING_SANDBOX_ENABLED = 'false';
    const f = await fixture(); await db('workspaceLeadAdmissions').insert(Array.from({ length: 99 }, () => ({ workspaceId: f.identity.workspaceId, leadId: randomUUID() })));
    const one = input(f), two = input(f); await prepareCaptureSubmission(web, one); await prepareCaptureSubmission(web, two); const results = await Promise.all([commitCaptureSubmission(web, one), commitCaptureSubmission(web, two)]); assert.ok(results.every(result => result.state === 'accepted'));
    assert.equal((await db('leads').where({ workspaceId: f.identity.workspaceId })).length, 1); const item = await db('intakeItems').where({ workspaceId: f.identity.workspaceId }).first(); assert.ok(item.flags.includes('capacity')); assert.equal((await db('workspaceLeadAdmissions').where({ workspaceId: f.identity.workspaceId })).length, 100);
    process.env.BILLING_SANDBOX_ENABLED = 'true';
  });
  await check('first five attempts need no challenge; sixth needs verified proof and twenty-first is rate-limited', async () => {
    const f = await fixture(); const values = Array.from({ length: 21 }, () => input(f));
    for (let index = 0; index < 20; index++) { const result = await prepareCaptureSubmission(web, values[index]); assert.equal(result.state, 'ready'); if (result.state === 'ready') assert.equal(result.challengeRequired, index >= 5); }
    assert.equal((await commitCaptureSubmission(web, values[5])).state, 'challenge-required'); assert.equal((await prepareCaptureSubmission(web, values[20])).state, 'rate-limited');
    assert.equal((await db('captureSubmissionAttempts').where({ workspaceId: f.identity.workspaceId })).length, 20); assert.equal((await db('captureReceipts').where({ workspaceId: f.identity.workspaceId })).length, 0);
    const token = { ...values[5], submission: { ...values[5].submission, challengeToken: 'fictional-token-six' } }; const hash = await verify(token); assert.equal((await commitCaptureSubmission(web, token, hash)).state, 'accepted'); assert.equal((await prepareCaptureSubmission(web, token)).state, 'accepted');
  });
  await check('the approved existing-workspace transition defers enforcement without resetting usage', async () => {
    const f = await fixture(); await db('workspaceLeadAdmissions').insert(Array.from({ length: 100 }, () => ({ workspaceId: f.identity.workspaceId, leadId: randomUUID() })));
    await db('workspaceSubscriptions').where({ workspaceId: f.identity.workspaceId }).update({ transitionUntil: new Date(Date.now() + 60000) }); assert.equal((await accept(input(f))).state, 'accepted'); assert.equal((await db('leads').where({ workspaceId: f.identity.workspaceId })).length, 1);
    await db('workspaceSubscriptions').where({ workspaceId: f.identity.workspaceId }).update({ transitionUntil: new Date(Date.now() - 1000) }); assert.equal((await accept(input(f))).state, 'accepted'); assert.ok((await db('intakeItems').where({ workspaceId: f.identity.workspaceId }).first()).flags.includes('capacity')); assert.equal((await db('workspaceLeadAdmissions').where({ workspaceId: f.identity.workspaceId })).length, 101);
  });
  await check('provider retry identities survive retries; a token cannot authorize another request', async () => {
    const f = await fixture(), policy = { ...limits, challengeAfter: 1 }; await accept(input(f, {}, policy));
    const value = input(f, { challengeToken: 'fictional-retry-token' }, policy), one = await prepareCaptureSubmission(web, value), two = await prepareCaptureSubmission(web, value); assert.equal(one.state, 'ready'); assert.equal(two.state, 'ready'); if (one.state !== 'ready' || two.state !== 'ready') throw Error('Expected challenge'); assert.equal(one.verificationId, two.verificationId);
    const different = input(f, { challengeToken: 'fictional-retry-token' }, policy); assert.equal((await prepareCaptureSubmission(web, different)).state, 'challenge-error'); const hash = await verify(value); assert.equal((await commitCaptureSubmission(web, value, hash)).state, 'accepted');
  });
  await check('expired challenge proofs and policy escalation cannot bypass the final check', async () => {
    const f = await fixture(), policy = { ...limits, challengeAfter: 1 }, first = input(f, {}, policy), second = input(f, { challengeToken: 'fictional-expiry-token' }, policy);
    await prepareCaptureSubmission(web, first); const hash = await verify(second); await db('captureChallengeChecks').where({ tokenHash: hash }).update({ expiresAt: new Date(Date.now() - 1000) }); assert.equal((await commitCaptureSubmission(web, second, hash)).state, 'challenge-required');
    assert.equal((await commitCaptureSubmission(web, first)).state, 'challenge-required'); assert.equal((await db('captureReceipts').where({ workspaceId: f.identity.workspaceId })).length, 0);
  });
  await check('stale configuration and expired contexts do not create records', async () => {
    const f = await fixture(), value = input(f); assert.equal((await prepareCaptureSubmission(web, { ...value, proof: { ...value.proof, configurationVersion: 99 } })).state, 'stale'); assert.equal((await prepareCaptureSubmission(web, { ...value, proof: { ...value.proof, expiresAt: 1 } })).state, 'stale'); assert.equal((await db('captureReceipts').where({ workspaceId: f.identity.workspaceId })).length, 0);
  });
  await check('access loss after preparation commits reconciliation without an intake or silent recovery', async () => {
    const f = await fixture(), value = input(f); await prepareCaptureSubmission(web, value); await db('workspaces').where({ id: f.identity.workspaceId }).update({ suspendedAt: new Date(), suspendedReason: 'Fixture' }); assert.equal((await commitCaptureSubmission(web, value)).state, 'unavailable');
    const source = await db('captureSources').where({ id: f.sourceId }).first(); assert.equal(source.status, 'paused'); assert.equal(source.block, 'workspace'); assert.equal((await db('captureReceipts').where({ workspaceId: f.identity.workspaceId })).length, 0); await db('workspaces').where({ id: f.identity.workspaceId }).update({ suspendedAt: null, suspendedReason: null }); assert.equal((await prepareCaptureSubmission(web, value)).state, 'unavailable');
  });
  await check('receipt/audit failure rolls back lead, allowance, tags, notifications, evidence and storage', async () => {
    const f = await fixture(); await db('leadAssignmentSettings').where({ workspaceId: f.identity.workspaceId }).update({ value: JSON.stringify({ kind: 'teammate', teammateId: f.identity.userId }), version: 2 }); const value = input(f); await prepareCaptureSubmission(web, value);
    await db.raw(`CREATE FUNCTION capture_submit_test_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.kind = 'receipt.accepted' THEN RAISE EXCEPTION 'fixture'; END IF; RETURN NEW; END $$`); await db.raw('CREATE TRIGGER capture_submit_test_failure BEFORE INSERT ON "captureSourceEvents" FOR EACH ROW EXECUTE FUNCTION capture_submit_test_failure()');
    try { await assert.rejects(commitCaptureSubmission(web, value)); } finally { await db.raw('DROP TRIGGER capture_submit_test_failure ON "captureSourceEvents"'); await db.raw('DROP FUNCTION capture_submit_test_failure()'); }
    for (const table of ['leads', 'workspaceLeadAdmissions', 'captureReceipts', 'leadTags', 'assignmentNotifications', 'captureReceiptProcessing']) assert.equal((await db(table).where({ workspaceId: f.identity.workspaceId })).length, 0);
    assert.equal((await db('captureInputUsage').where({ workspaceId: f.identity.workspaceId }).first())?.retainedBytes ?? '0', '0'); assert.equal((await commitCaptureSubmission(web, value)).state, 'accepted');
  });
  await check('assignment resolution and notification intent are bound once and existing email preferences apply', async () => {
    const f = await fixture(); await db('leadAssignmentSettings').where({ workspaceId: f.identity.workspaceId }).update({ value: JSON.stringify({ kind: 'teammate', teammateId: f.identity.userId }), version: 2 }); const value = input(f); await accept(value); await prepareCaptureSubmission(web, value);
    const lead = await db('leads').where({ workspaceId: f.identity.workspaceId }).first(); assert.equal(lead.ownerId, f.identity.userId); const processing = await db('captureReceiptProcessing').where({ workspaceId: f.identity.workspaceId }).first(); assert.equal(processing.assignment.settingVersion, 2); assert.equal(processing.assignment.assigneeId, f.identity.userId); assert.equal((await db('assignmentNotifications').where({ workspaceId: f.identity.workspaceId })).length, 1);
    await db('notificationPreferences').insert({ userId: f.identity.userId, leadAssignedEmail: false }); const sent: string[] = []; await processAssignmentEmails(worker, enabled, async mail => { sent.push(mail.id); }, 100); assert.ok(!sent.includes((await db('assignmentNotifications').where({ workspaceId: f.identity.workspaceId }).first()).id)); assert.equal((await db('assignmentEmailOutbox as o').join('assignmentNotifications as n', 'n.id', 'o.id').where('n.workspaceId', f.identity.workspaceId).first('o.status')).status, 'skipped');
    const off = await fixture(false); await db('leadAssignmentSettings').where({ workspaceId: off.identity.workspaceId }).update({ value: JSON.stringify({ kind: 'teammate', teammateId: off.identity.userId }), version: 2 }); await accept(input(off)); assert.equal((await db('assignmentNotifications').where({ workspaceId: off.identity.workspaceId })).length, 0);
  });
  await check('unavailable assignment queues review without silently unassigning an automatic lead', async () => {
    const f = await fixture(); await db('leadAssignmentSettings').where({ workspaceId: f.identity.workspaceId }).update({ value: JSON.stringify({ kind: 'teammate', teammateId: 'removed-user' }), version: 2 }); assert.equal((await accept(input(f))).state, 'accepted'); assert.equal((await db('leads').where({ workspaceId: f.identity.workspaceId })).length, 0); assert.ok((await db('intakeItems').where({ workspaceId: f.identity.workspaceId }).first()).flags.includes('uncertain'));
  });
  await check('storage and pending budgets never acknowledge an unretained item', async () => {
    const f = await fixture(); assert.equal((await accept(input(f, {}, { ...limits, maxRetainedBytes: 1 }))).state, 'unavailable'); const missing = { answers: { name: '', service: '', email: '' } }; assert.equal((await accept(input(f, missing, { ...limits, maxPendingItems: 1 }))).state, 'accepted'); assert.equal((await accept(input(f, missing, { ...limits, maxPendingItems: 1 }))).state, 'unavailable'); assert.equal((await db('captureReceipts').where({ workspaceId: f.identity.workspaceId })).length, 1);
  });
  await check('abuse state expires without touching immutable receipts; general request budgets include retries', async () => {
    await db('captureSubmissionAttempts').update({ expiresAt: new Date(Date.now() - 1000) }); await db('captureChallengeChecks').update({ expiresAt: new Date(Date.now() - 1000) }); const before = (await db('captureReceipts')).length; await purgeCaptureSubmissionAbuse(worker); assert.equal((await db('captureSubmissionAttempts')).length, 0); assert.equal((await db('captureChallengeChecks')).length, 0); assert.equal((await db('captureReceipts')).length, before);
    assert.equal(await takeCaptureRequestBudget(web, 1), null); assert.equal((await takeCaptureRequestBudget(web, 1))?.state, 'rate-limited');
  });
  console.log(`Capture submission rehearsal passed (${groups} groups).`);
} finally { if (priorBilling === undefined) delete process.env.BILLING_SANDBOX_ENABLED; else process.env.BILLING_SANDBOX_ENABLED = priorBilling; await web.destroy(); await worker.destroy(); await db.destroy(); if (created) await owner.raw('DROP DATABASE ??', [name]); await owner.destroy(); }
