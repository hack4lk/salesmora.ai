/** Full migration replay and upgrade on a newly created, isolated local database; never mutates existing test or application tables. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Knex } from 'knex';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy, loadWorkspaceAuthorization } from '../authorization/store';
import { ADMIN_APP_ROLE, RUNTIME_LOGIN_ROLES } from '../runtime-roles';
import { up as cutover } from '../migrations/202610300008_lead_capture_permissions';
import { captureConfigurationSchema, captureDraftConfigurationSchema } from '@salesmora/contracts';
import { authorize, validateWorkspacePolicy } from '@salesmora/domain';

const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL || !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw new Error('Use the isolated local test database connection.');
const databaseName = `capture_${randomUUID().replaceAll('-', '')}_test`;
const owner = createDatabase(connection), scratchURL = new URL(connection); scratchURL.pathname = `/${databaseName}`;
const db = createDatabase(scratchURL.toString());
const config = { directory: fileURLToPath(new URL('../migrations', import.meta.url)), loadExtensions: ['.ts'] };
let created = false, checks = 0;
const workspaces = Array.from({ length: 4 }, () => randomUUID());
const [a, b, customized, ambiguous] = workspaces;
async function check(name: string, run: () => Promise<void>) { await run(); checks++; console.log(`PASS ${name}`); }
async function rejects(run: (trx: Knex.Transaction) => Promise<unknown>, code: string) { await assert.rejects(db.transaction(run), (error: { code?: string }) => error.code === code); }
const timestamp = new Date();
const sourceA = randomUUID(), sourceB = randomUUID(), gmailSource = randomUUID(), versionA = randomUUID(), draftA = randomUUID(), publicationA = randomUUID(), receiptA = randomUUID(), intakeA = randomUUID(), reviewA = randomUUID(), leadA = randomUUID();
const emptyWebsite = { schemaVersion: 1, type: 'website' };
const fields = [{ id: 'name', key: 'name', label: 'Name', type: 'short_text', required: true, options: [] }, { id: 'email', key: 'email', label: 'Email', type: 'email', required: false, options: [] }, { id: 'service', key: 'service', label: 'Service', type: 'short_text', required: true, options: [] }];
const website = captureConfigurationSchema.parse({ schemaVersion: 1, type: 'website', fields, contactRequired: true, workflow: { assignment: { kind: 'default' }, stage: 'new', tags: [], notifyAssigned: true }, content: { businessName: 'Fixture', title: 'Request service', intro: '', submitLabel: 'Send', thankYou: 'Thanks', unavailableMessage: 'Unavailable', businessEmail: '', businessPhone: '', showBusinessEmail: false, showBusinessPhone: false, privacy: null, consent: null } });
const receipt = (patch = {}) => ({ id: randomUUID(), workspaceId: a, sourceId: sourceA, sourceType: 'website', configurationVersion: 1, definitionVersion: 1, workflowVersion: 1, publicationId: publicationA, dedupeKey: randomUUID(), inputHash: 'a'.repeat(64), admission: 'review', evidence: JSON.stringify({ schemaVersion: 1, type: 'website', answers: {}, consent: null, fields: [] }), originalAnswers: '{}', receivedAt: timestamp, ...patch });
const item = (id: string, receiptId: string) => ({ id, workspaceId: a, sourceId: sourceA, receiptId, version: 1, definitionVersion: 1, workflowVersion: 1, status: 'awaiting', answers: '{}', flags: '[]' });
const review = (id: string, intakeId: string) => ({ id, workspaceId: a, intakeId, intakeVersion: 1, definitionVersion: 1, workflowVersion: 1, actorId: 'capture-owner-0', policyRevision: 0, requestHash: 'b'.repeat(64), review: '{}', expiresAt: new Date(Date.now() + 3600000) });
const decision = (intakeId: string, reviewId: string, patch = {}) => ({ id: randomUUID(), workspaceId: a, intakeId, reviewId, expectedVersion: 1, requestId: randomUUID(), kind: 'dismiss', actor: JSON.stringify({ kind: 'user', userId: 'capture-owner-0' }), decision: '{}', ...patch });
try {
  await owner.raw('CREATE DATABASE ??', [databaseName]); created = true;
  const names = readdirSync(config.directory).filter(name => name.endsWith('.ts')).sort();
  for (const name of names.filter(name => name <= '202610110003_leads.ts')) await db.migrate.up({ ...config, name });
  await db('users').insert(workspaces.map((_id, i) => ({ id: `capture-owner-${i}`, name: 'Fictional capture owner', email: `capture-owner-${i}@example.test`, createdAt: timestamp, updatedAt: timestamp, termsVersion: 'test', termsAcceptedAt: timestamp })));
  await db('workspaces').insert(workspaces.map((id, i) => ({ id, ownerId: `capture-owner-${i}`, businessName: 'Fictional capture fixture', businessType: 'test', postalCode: '', serviceRange: '' })));
  await db('workspaceMemberships').insert(workspaces.map((workspaceId, i) => ({ workspaceId, userId: `capture-owner-${i}`, role: 'owner', profile: 'office' })));
  for (const name of names.filter(name => name > '202610110003_leads.ts' && name < '202610300007_lead_capture_foundation.ts')) await db.migrate.up({ ...config, name });
  const baseRevision = (await db('workspacePolicies').where({ workspaceId: a }).first()).revision;
  const beforeCustom = await db('workspaceRolePolicies').where({ workspaceId: customized }).select('role', 'permission', 'scope');
  const customHead = (await db('workspacePolicies').where({ workspaceId: customized }).first()).revision;
  await db('workspaceRolePolicies').where({ workspaceId: customized, role: 'office', permission: 'campaigns.pause' }).delete();
  const afterCustom = await db('workspaceRolePolicies').where({ workspaceId: customized }).select('role', 'permission', 'scope');
  await db('workspacePolicies').where({ workspaceId: customized }).update({ revision: customHead + 1 });
  await db('authorizationAudit').insert({ workspaceId: customized, actorId: 'capture-owner-2', action: 'policy.saved', beforeRevision: customHead, afterRevision: customHead + 1, beforePolicy: JSON.stringify({ workspaceId: customized, revision: customHead, grants: beforeCustom }), afterPolicy: JSON.stringify({ workspaceId: customized, revision: customHead + 1, grants: afterCustom }) });
  // An unrecognized audit history cannot be interpreted as an untouched default.
  const unknownHead = (await db('workspacePolicies').where({ workspaceId: ambiguous }).first()).revision;
  await db('authorizationAudit').insert({ workspaceId: ambiguous, actorId: 'capture-owner-3', action: 'legacy.unknown', beforeRevision: unknownHead, afterRevision: unknownHead, afterPolicy: '{}' });
  await db.migrate.up({ ...config, name: '202610300007_lead_capture_foundation.ts' });
  await check('conflicting legacy/canonical grants abort the cutover transaction without changing policy', async () => {
    await assert.rejects(db.transaction(async trx => {
      await trx('workspaceRolePolicies').insert({ workspaceId: a, role: 'office', permission: 'leadCapture.create', scope: 'workspace' });
      await cutover(trx);
    }), /Conflicting capture policy/);
    assert.equal((await db('workspacePolicies').where({ workspaceId: a }).first()).revision, baseRevision);
    assert.ok(await db('workspaceRolePolicies').where({ workspaceId: a, permission: 'campaigns.read' }).first());
  });
  await db.migrate.latest(config);
  await check('fresh full replay and legacy upgrade complete once with canonical grants and audited versions', async () => {
    assert.equal((await db('knex_migrations').count('* as count').first())?.count, String(names.length));
    assert.equal((await db('workspaceRolePolicies').where('permission', 'like', 'campaigns.%')).length, 0);
    assert.equal((await db('workspacePolicies').where({ workspaceId: a }).first()).revision, baseRevision + 1);
    assert.ok(await db('authorizationAudit').where({ workspaceId: a, action: 'migration.lead-capture' }).first());
    assert.equal((await db.migrate.latest(config))[1].length, 0);
  });
  await check('Office archive defaults change only for proven untouched policies', async () => {
    assert.ok(await db('workspaceRolePolicies').where({ workspaceId: a, role: 'office', permission: 'leadCapture.archive' }).first());
    for (const workspaceId of [customized, ambiguous]) assert.equal(await db('workspaceRolePolicies').where({ workspaceId, role: 'office', permission: 'leadCapture.archive' }).first(), undefined);
    assert.equal(await db('workspaceRolePolicies').where({ workspaceId: customized, role: 'office', permission: 'leadCapture.pause' }).first(), undefined);
    for (const workspaceId of workspaces) {
      const head = await db('workspacePolicies').where({ workspaceId }).first();
      assert.equal(validateWorkspacePolicy({ workspaceId, revision: head.revision, grants: await db('workspaceRolePolicies').where({ workspaceId }).select('role', 'permission', 'scope') }).ok, true);
    }
    await rejects(trx => trx('workspaceRolePolicies').insert({ workspaceId: a, role: 'office', permission: 'leads.archive', scope: 'workspace' }), '23514');
  });
  await check('new workspace initialization uses canonical defaults and source features stay disabled', async () => {
    const id = randomUUID(), userId = 'capture-owner-new';
    await db('users').insert({ id: userId, name: 'New fictional owner', email: 'capture-new@example.test', createdAt: timestamp, updatedAt: timestamp, termsVersion: 'test', termsAcceptedAt: timestamp });
    await db.transaction(async trx => {
      await trx('workspaces').insert({ id, ownerId: userId, businessName: 'New fictional workspace', businessType: 'test', postalCode: '', serviceRange: '' });
      await trx('workspaceMemberships').insert({ workspaceId: id, userId, role: 'owner' });
      await initializeWorkspacePolicy(trx, { userId, workspaceId: id });
    });
    assert.ok(await db('workspaceRolePolicies').where({ workspaceId: id, role: 'office', permission: 'leadCapture.archive' }).first());
    const context = await loadWorkspaceAuthorization(db, { workspaceId: id, userId }, []);
    assert.equal(authorize(context, { permission: 'leadCapture.read', resource: { kind: 'capture_source', workspaceId: id, id: sourceA } }).allowed, false);
  });
  await db('captureSources').insert([{ id: sourceA, workspaceId: a, name: 'Website A', type: 'website', version: 1, status: 'draft' }, { id: sourceB, workspaceId: b, name: 'Website B', type: 'website', version: 1, status: 'draft' }, { id: gmailSource, workspaceId: a, name: 'Gmail A', type: 'gmail', version: 1, status: 'draft' }]);
  await db('captureSourceVersions').insert({ id: versionA, workspaceId: a, sourceId: sourceA, sourceType: 'website', configurationVersion: 1, definitionVersion: 1, workflowVersion: 1, configuration: JSON.stringify(website), approvedBy: 'capture-owner-0', approvedAt: timestamp });
  await db('captureSourceDrafts').insert({ id: draftA, workspaceId: a, sourceId: sourceA, sourceType: 'website', version: 1, baseApprovedVersion: 1, configuration: JSON.stringify(captureDraftConfigurationSchema.parse(emptyWebsite)) });
  await db('captureSources').where({ id: sourceA }).update({ draftId: draftA });
  await db('capturePublications').insert({ id: publicationA, workspaceId: a, sourceId: sourceA, sourceType: 'website', configurationVersion: 1, version: 1, publicKey: randomUUID() });
  await check('tenant and source identities constrain configuration, drafts and publication', async () => {
    await rejects(trx => trx('captureSourceDrafts').insert({ id: randomUUID(), workspaceId: a, sourceId: sourceB, sourceType: 'website', version: 1, configuration: JSON.stringify(emptyWebsite) }), '23503');
    await rejects(trx => trx('captureSources').where({ id: sourceB }).update({ draftId: draftA }), '23503');
    await rejects(trx => trx('capturePublications').insert({ id: randomUUID(), workspaceId: a, sourceId: gmailSource, sourceType: 'gmail', configurationVersion: 1, version: 1, publicKey: randomUUID() }), '23514');
    await rejects(trx => trx('captureSourceDrafts').where({ id: draftA }).update({ configuration: '{}' }), '23514');
    await rejects(trx => trx('captureSourceDrafts').where({ id: draftA }).update({ version: 0 }), '23514');
  });
  await check('source state and configuration versions are separate and approved history is immutable', async () => {
    await db('captureSources').where({ id: sourceA }).update({ approvedVersion: 1, status: 'active', version: 2 });
    await db('captureSourceDrafts').where({ id: draftA }).update({ configuration: JSON.stringify({ ...emptyWebsite, brief: 'New draft' }), version: 2 });
    assert.equal((await db('captureSourceVersions').where({ id: versionA }).first()).configuration.content.title, 'Request service');
    await rejects(trx => trx('captureSourceVersions').where({ id: versionA }).update({ configuration: JSON.stringify(emptyWebsite) }), '23514');
    await rejects(trx => trx('captureSources').where({ id: sourceA }).update({ approvedVersion: 99 }), '23503');
    await rejects(trx => trx('captureSources').where({ id: sourceA }).update({ status: 'scheduled' }), '23514');
    await db('captureSources').where({ id: sourceA }).update({ status: 'paused' });
    await db('captureSources').where({ id: sourceA }).update({ status: 'archived' });
    assert.equal((await db('captureSources').where({ id: sourceA }).first()).approvedVersion, 1);
  });
  await check('Gmail sample evidence stays immutable and approval cannot survive a draft type change', async () => {
    const draftId = randomUUID(), sampleId = randomUUID();
    await db('captureSourceDrafts').insert({ id: draftId, workspaceId: a, sourceId: gmailSource, sourceType: 'gmail', version: 1, configuration: JSON.stringify({ schemaVersion: 1, type: 'gmail' }) });
    await db('captureSourceSamples').insert({ id: sampleId, workspaceId: a, sourceId: gmailSource, sourceType: 'gmail', draftId, draftVersion: 1, connectionId: randomUUID(), accountEmail: 'fixture@example.test', bindingHash: 'd'.repeat(64), evidence: JSON.stringify({ schemaVersion: 1, type: 'gmail', from: '', subject: '', body: 'Original sample', fields: [] }), answers: '{}' });
    await db('captureSourceSamples').where({ id: sampleId }).update({ reviewedBy: 'capture-owner-0', reviewedAt: new Date() });
    await rejects(trx => trx('captureSourceSamples').where({ id: sampleId }).update({ evidence: '{"schemaVersion":1,"type":"gmail","body":"forged"}' }), '23514');
    await rejects(trx => trx('captureSourceSamples').where({ id: sampleId }).update({ reviewedBy: 'someone-else' }), '23514');
    await db.transaction(async trx => { await trx('captureSources').where({ id: gmailSource }).update({ type: 'website', version: 2 }); await trx('captureSourceDrafts').where({ id: draftId }).update({ sourceType: 'website', version: 2, configuration: JSON.stringify(emptyWebsite) }); });
    const sample = await db('captureSourceSamples').where({ id: sampleId }).first(), draft = await db('captureSourceDrafts').where({ id: draftId }).first();
    assert.equal(sample.draftVersion, 1); assert.equal(draft.version, 2); assert.equal(sample.evidence.body, 'Original sample'); assert.equal(draft.configuration.sampleId, undefined);
  });
  const originalReceipt = receipt({ id: receiptA, dedupeKey: 'request-a' }); await db('captureReceipts').insert(originalReceipt);
  await check('inbound receipt uniqueness rejects retries and original evidence cannot be overwritten', async () => {
    await rejects(trx => trx('captureReceipts').insert({ ...originalReceipt, id: randomUUID() }), '23505');
    await rejects(trx => trx('captureReceipts').where({ id: receiptA }).update({ originalAnswers: '{"name":"forged"}' }), '23514');
    await rejects(trx => trx('captureReceipts').where({ id: receiptA }).delete(), '23514');
    await rejects(trx => trx('captureReceipts').insert(receipt({ workspaceId: b })), '23503');
  });
  await db('intakeItems').insert(item(intakeA, receiptA)); await db('intakeReviewSnapshots').insert(review(reviewA, intakeA));
  await check('proposal corrections do not alter originals and reviews retain their historical version', async () => {
    await db('intakeItems').where({ id: intakeA }).update({ answers: '{"name":"Corrected"}', version: 2 });
    assert.deepEqual((await db('captureReceipts').where({ id: receiptA }).first()).originalAnswers, {});
    assert.equal((await db('intakeReviewSnapshots').where({ id: reviewA }).first()).intakeVersion, 1);
    await rejects(trx => trx('intakeReviewSnapshots').where({ id: reviewA }).update({ review: '{"forged":true}' }), '23514');
    await rejects(trx => trx('intakeItems').insert({ ...item(randomUUID(), receiptA), workspaceId: b }), '23503');
    await rejects(trx => trx('intakeDecisions').insert(decision(intakeA, reviewA, { expectedVersion: 2 })), '23503');
  });
  await rejects(trx => trx('intakeDecisions').insert(decision(intakeA, reviewA)), '23514');
  const currentReview = randomUUID(); await db('intakeReviewSnapshots').insert({ ...review(currentReview, intakeA), intakeVersion: 2 });
  await db('intakeDecisions').insert(decision(intakeA, currentReview, { expectedVersion: 2 }));
  await check('terminal decisions cannot be repeated or rewritten', async () => {
    await rejects(trx => trx('intakeDecisions').insert(decision(intakeA, currentReview, { expectedVersion: 2 })), '23505');
    await rejects(trx => trx('intakeDecisions').where({ intakeId: intakeA }).update({ kind: 'create', resultingLeadId: leadA }), '23514');
  });
  await check('concurrent decisions admit one result for the same intake item', async () => {
    const receiptId = randomUUID(), intakeId = randomUUID(), reviewId = randomUUID();
    await db('captureReceipts').insert(receipt({ id: receiptId })); await db('intakeItems').insert(item(intakeId, receiptId)); await db('intakeReviewSnapshots').insert(review(reviewId, intakeId));
    const outcomes = await Promise.allSettled([db.transaction(trx => trx('intakeDecisions').insert(decision(intakeId, reviewId))), db.transaction(trx => trx('intakeDecisions').insert(decision(intakeId, reviewId)))]);
    assert.equal(outcomes.filter(outcome => outcome.status === 'fulfilled').length, 1);
    assert.equal(outcomes.filter(outcome => outcome.status === 'rejected').length, 1);
  });
  await check('automatic website acceptance cannot also create a pending intake item', async () => {
    const automatic = receipt({ admission: 'automatic' }); await db('captureReceipts').insert(automatic);
    await rejects(trx => trx('intakeItems').insert(item(randomUUID(), automatic.id)), '23503');
  });
  await check('operation receipts commit once, reject replacement and roll back with a failed transaction', async () => {
    const operation = { id: randomUUID(), workspaceId: a, requestId: randomUUID(), operation: 'intake.decide', inputHash: 'c'.repeat(64), actor: '{}', target: '{}', result: '{}' };
    await db('captureOperations').insert(operation);
    await rejects(trx => trx('captureOperations').insert({ ...operation, id: randomUUID(), inputHash: 'd'.repeat(64) }), '23505');
    await rejects(trx => trx('captureOperations').where({ id: operation.id }).update({ result: '{"forged":true}' }), '23514');
    const aborted = randomUUID(); await assert.rejects(db.transaction(async trx => { await trx('captureOperations').insert({ ...operation, id: aborted, requestId: randomUUID() }); throw new Error('abort'); }), /abort/);
    assert.equal(await db('captureOperations').where({ id: aborted }).first(), undefined);
  });
  await db('leads').insert({ id: leadA, workspaceId: a, createdBy: 'capture-owner-0', submissionId: randomUUID(), submissionHash: 'fixture', name: 'Fictional capture lead', email: '', phone: '', service: 'Kitchen', address: '', details: '', notes: '', source: 'website', stage: 'new', ownerId: null });
  const provenanceReceipt = receipt({ admission: 'automatic' }); await db('captureReceipts').insert(provenanceReceipt);
  await db('leadCaptureData').insert({ id: randomUUID(), workspaceId: a, sourceId: sourceA, configurationVersion: 1, receiptId: provenanceReceipt.id, leadId: leadA, resultingLeadId: leadA, definitionVersion: 1, answers: '{}' });
  await check('lead deletion preserves capture provenance, receipts, decisions and admission accounting', async () => {
    assert.ok(await db('workspaceLeadAdmissions').where({ leadId: leadA }).first());
    await db('leads').where({ id: leadA }).delete();
    const data = await db('leadCaptureData').where({ receiptId: provenanceReceipt.id }).first(); assert.equal(data.leadId, null); assert.equal(data.resultingLeadId, leadA);
    assert.ok(await db('captureReceipts').where({ id: receiptA }).first()); assert.ok(await db('intakeDecisions').where({ intakeId: intakeA }).first()); assert.ok(await db('workspaceLeadAdmissions').where({ leadId: leadA }).first());
  });
  await check('actual runtime/staff grants retain DML boundaries and protect migration metadata', async () => {
    for (const role of [...Object.values(RUNTIME_LOGIN_ROLES), ADMIN_APP_ROLE]) {
      if (!await db('pg_roles').where({ rolname: role }).first()) throw new Error(`Provision local test role ${role} before the rehearsal.`);
      await db.transaction(async trx => {
        await trx.raw('SET LOCAL ROLE ??', [role]);
        const rows = await trx('captureSources').select('id'); assert.ok(rows.length);
        const { rows: [facts] } = await trx.raw(`SELECT has_table_privilege(current_user, '"captureSources"', 'INSERT') AS write, has_table_privilege(current_user, 'knex_migrations', 'SELECT') AS ledger`);
        assert.equal(facts.write, role !== ADMIN_APP_ROLE); assert.equal(facts.ledger, false);
      });
    }
    await rejects(async trx => { await trx.raw('SET LOCAL ROLE ??', [ADMIN_APP_ROLE]); return trx('captureSources').where({ id: sourceA }).update({ name: 'forged' }); }, '42501');
    await rejects(async trx => { await trx.raw('SET LOCAL ROLE ??', [RUNTIME_LOGIN_ROLES.web]); return trx('captureReceipts').where({ id: receiptA }).update({ originalAnswers: '{}' }); }, '23514');
    const unlinked = receipt(); await db('captureReceipts').insert(unlinked);
    await rejects(async trx => { await trx.raw('SET LOCAL ROLE ??', [RUNTIME_LOGIN_ROLES.web]); await trx.raw('CREATE TEMP TABLE workspaces (id uuid)'); return trx('captureReceipts').where({ id: unlinked.id }).delete(); }, '23514');
    assert.ok(await db('captureReceipts').where({ id: unlinked.id }).first());

  });
  await check('workspace deletion removes capture rows without orphaning or weakening snapshot immutability', async () => {
    await db.transaction(async trx => { await trx('workspaceSubscriptions').where({ workspaceId: a }).delete(); await trx('workspaces').where({ id: a }).delete(); });
    for (const table of ['captureSources', 'captureSourceVersions', 'captureSourceDrafts', 'capturePublications', 'captureReceipts', 'intakeItems', 'intakeReviewSnapshots', 'intakeDecisions', 'captureOperations', 'leadCaptureData']) assert.equal((await db(table).where({ workspaceId: a })).length, 0);
  });
  console.log(`Lead Capture foundation rehearsal passed (${checks} grouped checks; ${names.length} migrations).`);
} finally {
  await db.destroy();
  if (created) await owner.raw('DROP DATABASE ??', [databaseName]);
  await owner.destroy();
}
