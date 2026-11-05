/** Actual manual/chat service boundaries against a disposable database, without a model or HTTP server. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDatabase, initializeWorkspacePolicy, loadWorkspaceAuthorization, PlanCapacityError } from '@salesmora/data';
import { leadSchema, leadDraftReviewSchema } from '@salesmora/contracts';

const env = fileURLToPath(new URL('../../../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL || !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw new Error('Use an isolated local test database.');
if (!process.env.DB_WEB_PASSWORD) throw new Error('Provision the local web runtime role first.');
const databaseName = `lead_admission_${randomUUID().replaceAll('-', '')}_test`, scratchURL = new URL(connection); scratchURL.pathname = `/${databaseName}`;
const appURL = new URL(scratchURL); appURL.username = 'salesmora_web'; appURL.password = process.env.DB_WEB_PASSWORD;
const owner = createDatabase(connection), db = createDatabase(scratchURL.toString());
const previousURL = process.env.DATABASE_URL, previousBilling = process.env.BILLING_SANDBOX_ENABLED;
let created = false, checks = 0;
async function check(name: string, run: () => Promise<void>) { await run(); checks++; console.log(`PASS ${name}`); }
try {
  await owner.raw('CREATE DATABASE ??', [databaseName]); created = true;
  await db.migrate.latest({ directory: fileURLToPath(new URL('../../../../../packages/data/src/migrations', import.meta.url)), loadExtensions: ['.ts'] });
  process.env.DATABASE_URL = appURL.toString(); process.env.BILLING_SANDBOX_ENABLED = 'true';
  const { createLead, LeadConflictError } = await import('./store');
  const { enabledPermissions } = await import('../authorization/permissions');
  const { proposeLeadDraft, resolveLeadDraft } = await import('../chat/actions');
  const { chatAccessHash } = await import('../chat/access-hash');
  const workspaceId = randomUUID(), userId = `admission-owner-${randomUUID()}`, fieldId = `admission-field-${randomUUID()}`, timestamp = new Date();
  await db('users').insert([userId, fieldId].map((id, index) => ({ id, name: 'Fictional admission fixture', email: `${index}-${randomUUID()}@example.test`, createdAt: timestamp, updatedAt: timestamp, termsVersion: 'test', termsAcceptedAt: timestamp })));
  await db.transaction(async trx => {
    await trx('workspaces').insert({ id: workspaceId, ownerId: userId, businessName: 'Fictional admission fixture', businessType: 'test', postalCode: '', serviceRange: '' });
    await trx('workspaceMemberships').insert([{ workspaceId, userId, role: 'owner' }, { workspaceId, userId: fieldId, role: 'field' }]);
    await initializeWorkspacePolicy(trx, { workspaceId, userId });
    await trx('workspaceSubscriptions').insert({ workspaceId, plan: 'free', catalogVersion: 'test' });
  });
  const input = leadSchema.parse({ name: 'Fictional lead', email: 'fixture@example.test', phone: '', service: 'Repair', address: '', details: '', notes: '', source: 'website', stage: 'new', ownerId: '' });
  const submissionId = randomUUID();
  let manualId = '';
  await check('manual creation and concurrent retries use one lead, history event and admission', async () => {
    const [first, replay] = await Promise.all([createLead(userId, workspaceId, submissionId, input), createLead(userId, workspaceId, submissionId, input)]);
    assert.equal(first.id, replay.id); manualId = first.id;
    assert.equal((await db('leads').where({ workspaceId })).length, 1);
    assert.equal((await db('workspaceLeadAdmissions').where({ workspaceId })).length, 1);
    assert.equal((await db('leadActivity').where({ leadId: manualId, type: 'created' })).length, 1);
    await assert.rejects(createLead(userId, workspaceId, submissionId, { ...input, service: 'Changed' }), LeadConflictError);
  });
  await check('current Field and cross-workspace authority cannot create a lead', async () => {
    await assert.rejects(createLead(fieldId, workspaceId, randomUUID(), input));
    await assert.rejects(createLead(userId, randomUUID(), randomUUID(), input));
    assert.equal((await db('leads').where({ workspaceId })).length, 1);
  });
  const identity = { workspaceId, userId }, threadId = randomUUID(), turnId = randomUUID();
  const context = await loadWorkspaceAuthorization(db, identity, enabledPermissions);
  await db('chatThreads').insert({ ...identity, id: threadId });
  await db('chatTurns').insert({ ...identity, id: turnId, threadId, clientTurnId: randomUUID(), requestHash: 'fixture', surfaceKey: 'leads.create', state: 'running', leaseUntil: new Date(Date.now() + 60000), accessHash: chatAccessHash(context) });
  const proposal = await proposeLeadDraft(identity, turnId, { ...input, source: 'other' }, new AbortController().signal);
  await check('chat proposal does not create a lead and cannot confirm an unfinished turn', async () => {
    assert.equal((await db('leads').where({ workspaceId })).length, 1);
    await assert.rejects(resolveLeadDraft(identity, proposal.id, proposal.inputHash, 'confirm'));
    assert.equal((await db('leads').where({ workspaceId })).length, 1);
  });
  await db('chatTurns').where({ id: turnId }).update({ state: 'completed', finishedAt: new Date() });
  let chatLeadId = '';
  await check('explicit chat confirmation and concurrent retries commit one lead and one audit', async () => {
    const [first, replay] = await Promise.all([resolveLeadDraft(identity, proposal.id, proposal.inputHash, 'confirm'), resolveLeadDraft(identity, proposal.id, proposal.inputHash, 'confirm')]);
    const confirmed = leadDraftReviewSchema.parse(first), repeated = leadDraftReviewSchema.parse(replay);
    assert.equal(confirmed.state, 'confirmed'); assert.ok(confirmed.leadId); assert.equal(confirmed.leadId, repeated.leadId); chatLeadId = confirmed.leadId;
    assert.equal((await db('leads').where({ workspaceId })).length, 2);
    assert.equal((await db('workspaceLeadAdmissions').where({ workspaceId })).length, 2);
    assert.equal((await db('chatActionAudit').where({ draftId: proposal.id, action: 'draft.confirmed' })).length, 1);
  });
  await check('new creation uses the shared monthly limit while successful manual/chat retries remain safe', async () => {
    await db('workspaceLeadAdmissions').insert(Array.from({ length: 98 }, () => ({ workspaceId, leadId: randomUUID() })));
    await assert.rejects(createLead(userId, workspaceId, randomUUID(), input), PlanCapacityError);
    assert.equal((await createLead(userId, workspaceId, submissionId, input)).id, manualId);
    assert.equal(leadDraftReviewSchema.parse(await resolveLeadDraft(identity, proposal.id, proposal.inputHash, 'confirm')).leadId, chatLeadId);
    assert.equal((await db('leads').where({ workspaceId })).length, 2);
    assert.equal((await db('workspaceLeadAdmissions').where({ workspaceId })).length, 100);
  });
  console.log(`Manual/chat admission services passed (${checks} grouped checks).`);
} finally {
  const globalStore = globalThis as typeof globalThis & { workspaceDatabase?: ReturnType<typeof createDatabase> };
  if (globalStore.workspaceDatabase) { await globalStore.workspaceDatabase.destroy(); delete globalStore.workspaceDatabase; }
  if (previousURL === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = previousURL;
  if (previousBilling === undefined) delete process.env.BILLING_SANDBOX_ENABLED; else process.env.BILLING_SANDBOX_ENABLED = previousBilling;
  await db.destroy(); if (created) await owner.raw('DROP DATABASE ??', [databaseName]); await owner.destroy();
}
