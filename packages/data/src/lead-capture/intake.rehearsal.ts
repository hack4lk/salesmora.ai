/** Fictional fixtures in a fresh local scratch database. No Gmail/API/mail transport. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy, AuthorizationAccessError } from '../authorization/store';
import { PlanCapacityError } from '../billing/entitlements';
import { CaptureDraftConflictError, CaptureDraftValidationError } from './store';
import { listIntakeItems, readIntakeItem, prepareIntakeReview, decideIntake } from './intake-store';
import type { PermissionId, CaptureDraftConfiguration, CaptureIntakeDecision } from '@salesmora/contracts';
const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url)); if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') || !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw Error('Separate local test connection required.');
const name = `intake_${randomUUID().replaceAll('-', '')}_test`, owner = createDatabase(connection), url = new URL(connection); url.pathname = `/${name}`;
const db = createDatabase(url.toString()), roleURL = new URL(url); roleURL.searchParams.set('options', '-c role=salesmora_web'); const web = createDatabase(roleURL.toString());
const enabled: PermissionId[] = ['intake.read', 'intake.update', 'intake.approve', 'intake.dismiss', 'leads.read', 'leads.create', 'leads.update', 'leads.assign'];
let created = false, checks = 0;
async function check(label: string, run: () => Promise<void>) { await run(); checks++; console.log(`PASS ${label}`); }
async function fixture() {
  const identity = { workspaceId: randomUUID(), userId: `intake-${randomUUID()}` }, now = new Date(), sourceId = randomUUID();
  const configuration: CaptureDraftConfiguration = { schemaVersion: 1, type: 'gmail', contactRequired: true, fields: [{ id: 'name', key: 'name', label: 'Name', type: 'short_text', required: true, options: [] }, { id: 'email', key: 'email', label: 'Email', type: 'email', required: false, options: [] }, { id: 'service', key: 'service', label: 'Service', type: 'short_text', required: true, options: [] }], workflow: { assignment: { kind: 'default' }, stage: 'new', tags: ['Gmail'], notifyAssigned: false } };
  await db('users').insert({ id: identity.userId, name: 'Fictional owner', email: `${identity.userId}@example.test`, createdAt: now, updatedAt: now, termsVersion: 'test', termsAcceptedAt: now });
  await db.transaction(async trx => {
    await trx('workspaces').insert({ id: identity.workspaceId, ownerId: identity.userId, businessName: 'Fictional intake workspace', businessType: 'test', postalCode: '', serviceRange: '', timezone: 'America/New_York' });
    await trx('workspaceMemberships').insert({ ...identity, role: 'owner' }); await initializeWorkspacePolicy(trx, identity);
    await trx('workspaceSubscriptions').insert({ workspaceId: identity.workspaceId, plan: 'free', catalogVersion: 'fixture' });
    await trx('captureSources').insert({ id: sourceId, workspaceId: identity.workspaceId, name: 'Archived Gmail fixture', type: 'gmail', status: 'archived', version: 1, approvedVersion: 1 });
    await trx('captureSourceVersions').insert({ id: randomUUID(), workspaceId: identity.workspaceId, sourceId, sourceType: 'gmail', configurationVersion: 1, definitionVersion: 1, workflowVersion: 1, configuration: JSON.stringify(configuration), approvedBy: identity.userId, approvedAt: now });
  });
  return { identity, sourceId, configuration };
}
type Fixture = Awaited<ReturnType<typeof fixture>>;
async function item(f: Fixture, email = 'alex@example.test') {
  const id = randomUUID(), receiptId = randomUUID(), answers = { name: 'Alex Morgan', email, service: 'Water heater quote' };
  await db.transaction(async trx => {
    await trx('captureReceipts').insert({ id: receiptId, workspaceId: f.identity.workspaceId, sourceId: f.sourceId, sourceType: 'gmail', configurationVersion: 1, definitionVersion: 1, workflowVersion: 1, dedupeKey: id, inputHash: 'a'.repeat(64), admission: 'review', connectionId: randomUUID(), messageId: id, evidence: JSON.stringify({ schemaVersion: 1, type: 'gmail', from: 'sender@example.test', subject: 'Fictional request', body: 'Alex Morgan needs a water heater quote.', fields: [{ fieldId: 'name', uncertain: true, origin: { kind: 'email', location: 'body', quote: 'Alex Morgan' } }] }), originalAnswers: JSON.stringify(answers), receivedAt: new Date() });
    await trx('intakeItems').insert({ id, workspaceId: f.identity.workspaceId, sourceId: f.sourceId, receiptId, version: 1, definitionVersion: 1, workflowVersion: 1, status: 'awaiting', answers: JSON.stringify(answers), flags: JSON.stringify(['uncertain']) });
  });
  return { id, receiptId, answers };
}
type Item = Awaited<ReturnType<typeof item>>;
async function prepare(f: Fixture, i: Item, answers = i.answers, permissions = enabled) { return prepareIntakeReview(web, f.identity, permissions, { workspaceId: f.identity.workspaceId, intakeId: i.id, expectedVersion: 1, answers, requestId: randomUUID() }); }
function decision(f: Fixture, i: Item, reviewId: string, kind: 'create' | 'separate' | 'dismiss' = 'create'): CaptureIntakeDecision { const base = { workspaceId: f.identity.workspaceId, intakeId: i.id, expectedVersion: 1, reviewId, requestId: randomUUID() }; return kind === 'dismiss' ? { ...base, kind } : { ...base, kind, answers: i.answers, definitionVersion: 1, workflowVersion: 1 }; }
async function decide(f: Fixture, input: CaptureIntakeDecision, permissions = enabled) { return decideIntake(web, f.identity, permissions, input); }
try {
  await owner.raw('CREATE DATABASE ??', [name]); created = true; await db.migrate.latest({ directory: fileURLToPath(new URL('../migrations', import.meta.url)), loadExtensions: ['.ts'] });
  await check('runtime read is tenant-scoped, paginated and independent of archived source permissions', async () => {
    const f = await fixture(), i = await item(f), other = await fixture(); await item(other);
    const list = await listIntakeItems(web, f.identity, ['intake.read'], { workspaceId: f.identity.workspaceId, search: 'Alex', flag: 'attention' }); assert.equal(list.total, 1); assert.equal(list.rows[0].id, i.id); assert.equal(list.sources.length, 1);
    assert.equal((await listIntakeItems(web, f.identity, ['intake.read'], { workspaceId: f.identity.workspaceId, search: 'Fictional request' })).total, 1);
    assert.equal((await listIntakeItems(web, f.identity, ['intake.read'], { workspaceId: f.identity.workspaceId, search: '%' })).total, 0);
    const view = await readIntakeItem(web, f.identity, ['intake.read'], { workspaceId: f.identity.workspaceId, intakeId: i.id }); assert.equal(view.capabilities.canCreate, false);
    await assert.rejects(readIntakeItem(web, other.identity, enabled, { workspaceId: other.identity.workspaceId, intakeId: i.id }), AuthorizationAccessError);
    await assert.rejects(readIntakeItem(web, f.identity, [], { workspaceId: f.identity.workspaceId, intakeId: i.id }), AuthorizationAccessError);
  });
  await check('corrections require update permission, normalize consistently, and preserve original evidence', async () => {
    const f = await fixture(), i = await item(f), answers = { ...i.answers, name: '  Corrected Alex  ', email: 'ALEX@example.test' };
    await assert.rejects(prepare(f, i, answers, enabled.filter(p => p !== 'intake.update')), AuthorizationAccessError);
    const review = await prepare(f, i, answers); assert.equal(review.answers.name, 'Corrected Alex');
    await decide(f, { ...decision(f, i, review.reviewId), answers: review.answers } as CaptureIntakeDecision);
    const lead = await db('leads').where({ workspaceId: f.identity.workspaceId }).first(); assert.equal(lead.name, 'Corrected Alex'); assert.equal(lead.source, 'gmail');
    const receipt = await db('captureReceipts').where({ id: i.receiptId }).first(); assert.deepEqual(receipt.originalAnswers, i.answers); assert.equal((await db('leadCaptureData').where({ receiptId: i.receiptId }).first()).answers.name, 'Corrected Alex');
    await assert.rejects(web('captureReceipts').where({ id: i.receiptId }).update({ originalAnswers: '{}' }));
    assert.equal((await db('assignmentEmailOutbox')).length, 0);
  });
  await check('concurrent exact decision retries create one admission, event, provenance and result', async () => {
    const f = await fixture(), i = await item(f), review = await prepare(f, i), input = decision(f, i, review.reviewId);
    assert.deepEqual(await Promise.all([decide(f, input), decide(f, input)]), [{ ok: true }, { ok: true }]);
    for (const table of ['leads', 'workspaceLeadAdmissions', 'intakeDecisions', 'leadCaptureData']) assert.equal((await db(table).where({ workspaceId: f.identity.workspaceId })).length, 1);
    await assert.rejects(decide(f, { ...decision(f, i, review.reviewId, 'dismiss'), requestId: input.requestId }), CaptureDraftConflictError);
    await assert.rejects(web('intakeDecisions').where({ intakeId: i.id }).update({ decision: '{}' }));
  });
  await check('duplicates require an explicit choice and selected link fields are the only fields changed', async () => {
    const f = await fixture(), first = await item(f), a = await prepare(f, first); await decide(f, decision(f, first, a.reviewId));
    const i = await item(f), review = await prepare(f, i, { ...i.answers, name: 'New name', service: 'Different service' }); assert.equal(review.duplicateRequired, true); assert.equal(review.candidates.length, 1);
    await assert.rejects(decide(f, { ...decision(f, i, review.reviewId), answers: review.answers } as CaptureIntakeDecision), CaptureDraftValidationError);
    const candidate = review.candidates[0]; await decide(f, { workspaceId: f.identity.workspaceId, intakeId: i.id, expectedVersion: 1, reviewId: review.reviewId, requestId: randomUUID(), kind: 'link', leadId: candidate.leadId, expectedLeadVersion: candidate.leadVersion, changeIds: ['service'] });
    const lead = await db('leads').where({ id: candidate.leadId }).first(); assert.equal(lead.name, 'Alex Morgan'); assert.equal(lead.service, 'Different service'); assert.equal((await db('workspaceLeadAdmissions').where({ workspaceId: f.identity.workspaceId })).length, 1);
  });
  await check('a duplicate arriving after review, stale item version and expired snapshot conflict', async () => {
    const f = await fixture(), one = await item(f), two = await item(f), a = await prepare(f, one), b = await prepare(f, two); await decide(f, decision(f, one, a.reviewId));
    await assert.rejects(decide(f, decision(f, two, b.reviewId)), CaptureDraftConflictError);
    const fresh = await prepare(f, two), lead = fresh.candidates[0]; await db('leads').where({ id: lead.leadId }).update({ version: lead.leadVersion + 1 });
    await assert.rejects(decide(f, decision(f, two, fresh.reviewId, 'separate')), CaptureDraftConflictError);
    const expired = await prepare(f, two); await db.raw('ALTER TABLE "intakeReviewSnapshots" DISABLE TRIGGER capture_snapshot_immutable'); await db('intakeReviewSnapshots').where({ id: expired.reviewId }).update({ createdAt: new Date(Date.now() - 120000), expiresAt: new Date(Date.now() - 60000) }); await db.raw('ALTER TABLE "intakeReviewSnapshots" ENABLE TRIGGER capture_snapshot_immutable');
    await assert.rejects(decide(f, decision(f, two, expired.reviewId, 'dismiss')), CaptureDraftConflictError);
  });
  await check('capacity is rechecked on commit; dismiss remains possible and produces no lead', async () => {
    const f = await fixture(), i = await item(f), review = await prepare(f, i); await db('workspaceLeadAdmissions').insert(Array.from({ length: 100 }, () => ({ workspaceId: f.identity.workspaceId, leadId: randomUUID() })));
    await assert.rejects(decide(f, decision(f, i, review.reviewId)), PlanCapacityError); assert.equal((await db('intakeItems').where({ id: i.id }).first()).status, 'awaiting');
    const exhausted = await prepare(f, i); assert.equal(exhausted.capacity, 'exhausted'); await decide(f, decision(f, i, exhausted.reviewId, 'dismiss')); assert.equal((await db('leads').where({ workspaceId: f.identity.workspaceId })).length, 0);
  });
  await check('revoked actions and hidden duplicate identities fail closed', async () => {
    const f = await fixture(), one = await item(f), a = await prepare(f, one); await decide(f, decision(f, one, a.reviewId));
    const i = await item(f), review = await prepare(f, i, i.answers, enabled.filter(p => p !== 'leads.read')); assert.equal(review.duplicateRequired, true); assert.deepEqual(review.candidates, []);
    await assert.rejects(decide(f, decision(f, i, review.reviewId, 'dismiss'), enabled.filter(p => p !== 'intake.dismiss')), AuthorizationAccessError);
    const changed = await prepare(f, i); await db('workspacePolicies').where({ workspaceId: f.identity.workspaceId }).increment('revision', 1);
    await assert.rejects(decide(f, decision(f, i, changed.reviewId, 'separate')), CaptureDraftConflictError);
  });
  await check('assigned-only lead access redacts unrelated matches and cannot authorize a new lead', async () => {
    const f = await fixture(), one = await item(f), a = await prepare(f, one); await decide(f, decision(f, one, a.reviewId));
    await db('leads').where({ workspaceId: f.identity.workspaceId }).update({ ownerId: null });
    const office = `office-${randomUUID()}`, now = new Date();
    await db('users').insert({ id: office, name: 'Fictional office teammate', email: `${office}@example.test`, createdAt: now, updatedAt: now, termsVersion: 'test', termsAcceptedAt: now });
    await db('workspaceMemberships').insert({ workspaceId: f.identity.workspaceId, userId: office, role: 'field' });
    f.identity.userId = office;
    await db('workspaceRolePolicies').insert(['intake.read', 'intake.approve', 'intake.dismiss'].map(permission => ({ workspaceId: f.identity.workspaceId, role: 'field', permission, scope: 'workspace' })));
    await db('workspacePolicies').where({ workspaceId: f.identity.workspaceId }).increment('revision', 1);
    const i = await item(f), review = await prepare(f, i); assert.equal(review.duplicateRequired, true); assert.deepEqual(review.candidates, []);
    await assert.rejects(decide(f, decision(f, i, review.reviewId, 'separate')), AuthorizationAccessError);
    await decide(f, decision(f, i, review.reviewId, 'dismiss')); assert.equal((await db('leads').where({ workspaceId: f.identity.workspaceId })).length, 1);
  });
  console.log(`Passed ${checks} Intake Review database groups.`);
} finally { await web.destroy(); await db.destroy(); if (created) await owner.raw('DROP DATABASE ?? WITH (FORCE)', [name]); await owner.destroy(); }
