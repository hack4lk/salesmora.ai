/** Fresh disposable database only; configured app and test databases are never migrated. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { PermissionId, CaptureDraftConfiguration } from '@salesmora/contracts';
import { createDatabase } from '../database';
import { AuthorizationAccessError, initializeWorkspacePolicy } from '../authorization/store';
import { RUNTIME_LOGIN_ROLES, ADMIN_APP_ROLE } from '../runtime-roles';
import { readLeadAssignmentSettings, saveLeadAssignmentSettings, resolveCaptureAssignment, LeadAssignmentSettingsConflict, LeadAssignmentSettingsInvalid, LeadAssignmentSettingsUnavailable } from './store';
import { createCaptureDraft } from '../lead-capture/store';
import { readCapturePublicationReview, publishCaptureDraft, processCapturePublications } from '../lead-capture/publication';
const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url)); if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') || !['127.0.0.1', 'localhost'].includes(new URL(connection).hostname)) throw Error('Separate local test connection required.');
const name = `lead_assignment_${randomUUID().replaceAll('-', '')}_test`, owner = createDatabase(connection), url = new URL(connection); url.pathname = `/${name}`;
const db = createDatabase(url.toString());
const roleDB = (role: string) => { const target = new URL(url); target.searchParams.set('options', `-c role=${role}`); return createDatabase(target.toString()); };
const web = roleDB(RUNTIME_LOGIN_ROLES.web), worker = roleDB(RUNTIME_LOGIN_ROLES.worker), staff = roleDB(ADMIN_APP_ROLE);
const enabled: PermissionId[] = ['settings.business.read', 'settings.business.update', 'leadCapture.read', 'leadCapture.create', 'leadCapture.update', 'leadCapture.activate'];
let created = false, groups = 0;
async function check(label: string, run: () => Promise<void>) { await run(); groups++; console.log(`PASS ${label}`); }
async function user() { const id = `assignment-${randomUUID()}`, now = new Date(); await db('users').insert({ id, name: 'Fictional teammate', email: `${id}@example.test`, createdAt: now, updatedAt: now, termsVersion: 'test', termsAcceptedAt: now }); return id; }
async function workspace() {
  const identity = { workspaceId: randomUUID(), userId: await user() };
  await db.transaction(async trx => { await trx('workspaces').insert({ id: identity.workspaceId, ownerId: identity.userId, businessName: 'Fictional assignment workspace', businessType: 'plumbing', postalCode: '', serviceRange: '', timezone: 'America/New_York' }); await trx('workspaceMemberships').insert({ ...identity, role: 'owner' }); await initializeWorkspacePolicy(trx, identity); await trx('workspaceSubscriptions').insert({ workspaceId: identity.workspaceId, catalogVersion: 'fixture' }); }); return identity;
}
async function teammate(workspaceId: string, role = 'office') { const userId = await user(); await db('workspaceMemberships').insert({ workspaceId, userId, role }); return { workspaceId, userId }; }
type Identity = { workspaceId: string; userId: string };
const read = (identity: Identity) => readLeadAssignmentSettings(web, identity, enabled);
const command = async (identity: Identity, value = { kind: 'unassigned' } as { kind: 'unassigned' } | { kind: 'teammate'; teammateId: string }) => ({ workspaceId: identity.workspaceId, requestId: randomUUID(), expectedVersion: (await read(identity)).version, value });
const save = (identity: Identity, input: unknown) => saveLeadAssignmentSettings(web, identity, enabled, input);
const delivery = { websiteReady: async () => true, gmailReady: async () => false };
const configuration: CaptureDraftConfiguration = { schemaVersion: 1, type: 'website', contactRequired: true,
  fields: [{ id: 'name', key: 'name', type: 'short_text', label: 'Name', required: true, options: [] }, { id: 'service', key: 'service', type: 'short_text', label: 'Service', required: true, options: [] }, { id: 'email', key: 'email', type: 'email', label: 'Email', required: false, options: [] }],
  workflow: { assignment: { kind: 'default' }, stage: 'new', tags: [], notifyAssigned: true }, content: { businessName: 'Fixture', title: 'Request service', intro: '', submitLabel: 'Send', thankYou: 'Thanks', unavailableMessage: 'Unavailable', businessEmail: '', businessPhone: '', showBusinessEmail: false, showBusinessPhone: false, privacy: null, consent: null } };
const migrations = (await readdir(fileURLToPath(new URL('../migrations', import.meta.url)))).filter(name => name.endsWith('.ts')).sort();
const source = (initial: boolean) => ({ getMigrations: async () => migrations.filter(name => !initial || name !== '202610310003_lead_assignment_settings.ts'), getMigrationName: (name: string) => name, getMigration: (name: string) => import(new URL(`../migrations/${name}`, import.meta.url).href) });
try {
  await owner.raw('CREATE DATABASE ??', [name]); created = true;
  await db.migrate.latest({ migrationSource: source(true) }); const existing = await workspace();
  await db.migrate.latest({ migrationSource: source(false) });
  const a = await workspace(), b = await workspace(), member = await teammate(a.workspaceId), other = await teammate(b.workspaceId);
  await check('migration backfills existing workspaces and creation persists explicit unassigned version one', async () => {
    for (const identity of [existing, a, b]) { const result = await read(identity); assert.equal(result.version, 1); assert.deepEqual(result.value, { kind: 'unassigned' }); }
    const rolledBack = randomUUID(); await assert.rejects(db.transaction(async trx => { await trx('workspaces').insert({ id: rolledBack, ownerId: a.userId, businessName: 'Rollback fixture', businessType: 'test', postalCode: '', serviceRange: '' }); throw Error('rollback'); })); assert.equal(await db('leadAssignmentSettings').where({ workspaceId: rolledBack }).first(), undefined);
  });
  await check('tenant and settings-permission boundaries deny outsider, Office and forged writes', async () => {
    await assert.rejects(read({ workspaceId: b.workspaceId, userId: a.userId }), AuthorizationAccessError);
    await assert.rejects(read(member), AuthorizationAccessError);
    await assert.rejects(save(a, { ...await command(a), workspaceId: b.workspaceId }), AuthorizationAccessError);
    await assert.rejects(save(a, { ...await command(a), actorId: b.userId }), LeadAssignmentSettingsInvalid);
    await assert.rejects(save(a, await command(a, { kind: 'teammate', teammateId: other.userId })), LeadAssignmentSettingsInvalid);
  });
  let accepted: Awaited<ReturnType<typeof command>>;
  await check('racing versioned saves produce one audit event and one conflict', async () => {
    const inputs = [await command(a, { kind: 'teammate', teammateId: member.userId }), await command(a)];
    const results = await Promise.allSettled(inputs.map(input => save(a, input))); const index = results.findIndex(result => result.status === 'fulfilled'); assert.notEqual(index, -1); accepted = inputs[index];
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1); assert.ok(results.some(result => result.status === 'rejected' && result.reason instanceof LeadAssignmentSettingsConflict)); assert.equal((await db('leadAssignmentSettingsAudit').where({ workspaceId: a.workspaceId })).length, 1);
  });
  await check('exact retries reauthorize and reject changed payloads and actors', async () => {
    assert.deepEqual(await save(a, accepted), await read(a));
    await assert.rejects(save(a, { ...accepted, value: { kind: 'teammate', teammateId: a.userId } }), LeadAssignmentSettingsConflict);
    const admin = await teammate(a.workspaceId, 'admin'); await assert.rejects(save(admin, accepted), LeadAssignmentSettingsConflict);
    await db('workspaceRolePolicies').where({ workspaceId: a.workspaceId, role: 'admin', permission: 'settings.business.update' }).delete(); assert.equal((await read(admin)).canManage, false); await assert.rejects(save(admin, await command(a)), AuthorizationAccessError);
    await assert.rejects(saveLeadAssignmentSettings(web, a, ['settings.business.read'], accepted), AuthorizationAccessError);
  });
  await check('audit insertion failure rolls back the setting; historical evidence is immutable', async () => {
    const before = await read(a); await db.raw(`CREATE FUNCTION assignment_test_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fixture'; END $$`); await db.raw('CREATE TRIGGER assignment_test_failure BEFORE INSERT ON "leadAssignmentSettingsAudit" FOR EACH ROW EXECUTE FUNCTION assignment_test_failure()');
    try { await assert.rejects(save(a, await command(a))); assert.deepEqual(await read(a), before); } finally { await db.raw('DROP TRIGGER assignment_test_failure ON "leadAssignmentSettingsAudit"'); await db.raw('DROP FUNCTION assignment_test_failure()'); }
    await assert.rejects(web('leadAssignmentSettingsAudit').where({ workspaceId: a.workspaceId }).update({ actorId: 'forged' }));
  });
  await check('resolver binds current default/version while source overrides remain independent', async () => {
    const saved = await save(a, await command(a, { kind: 'teammate', teammateId: member.userId })); const resolved = await resolveCaptureAssignment(worker, a.workspaceId, { kind: 'default' }); assert.equal(resolved.assigneeId, member.userId); assert.equal(resolved.settingVersion, saved.version);
    assert.deepEqual(await resolveCaptureAssignment(worker, a.workspaceId, { kind: 'teammate', teammateId: a.userId }), { ready: true, assigneeId: a.userId, settingVersion: null, basis: 'source' });
    await save(a, await command(a)); assert.equal((await resolveCaptureAssignment(worker, a.workspaceId, { kind: 'default' })).assigneeId, null); assert.equal((await resolveCaptureAssignment(worker, a.workspaceId, { kind: 'default' })).ready, true);
  });
  await check('removed, suspended and deleting teammates are excluded and never become implicit unassigned', async () => {
    await save(a, await command(a, { kind: 'teammate', teammateId: member.userId }));
    for (const column of ['suspendedAt', 'deletionRequestedAt']) { await db('users').where({ id: member.userId }).update({ [column]: new Date(), ...(column === 'suspendedAt' ? { suspendedReason: 'Fixture' } : {}) }); assert.equal((await resolveCaptureAssignment(worker, a.workspaceId, { kind: 'default' })).reason, 'unavailable_teammate'); assert.ok(!(await read(a)).teammates.some(item => item.id === member.userId)); await assert.rejects(save(a, await command(a, { kind: 'teammate', teammateId: member.userId })), LeadAssignmentSettingsInvalid); await db('users').where({ id: member.userId }).update({ [column]: null, ...(column === 'suspendedAt' ? { suspendedReason: null } : {}) }); }
    await db('workspaceMemberships').where(member).delete(); assert.equal((await resolveCaptureAssignment(worker, a.workspaceId, { kind: 'default' })).ready, false); assert.equal((await resolveCaptureAssignment(worker, a.workspaceId, { kind: 'teammate', teammateId: a.userId })).ready, true);
  });
  await check('missing rules fail closed; staff role cannot update business settings', async () => {
    await db('leadAssignmentSettings').where({ workspaceId: b.workspaceId }).delete(); assert.equal((await resolveCaptureAssignment(worker, b.workspaceId, { kind: 'default' })).reason, 'missing_rule'); await assert.rejects(read(b), LeadAssignmentSettingsUnavailable);
    await assert.rejects(staff('leadAssignmentSettings').where({ workspaceId: a.workspaceId }).update({ value: '{"kind":"unassigned"}' }));
  });
  await check('publication and scheduler recheck the persisted default; real delivery remains blocked', async () => {
    const identity = await workspace(), target = await teammate(identity.workspaceId); await save(identity, await command(identity, { kind: 'teammate', teammateId: target.userId }));
    const draft = await createCaptureDraft(web, identity, enabled, { workspaceId: identity.workspaceId, requestId: randomUUID(), name: 'Inherited assignment', configuration });
    const query = { workspaceId: identity.workspaceId, sourceId: draft.sourceId }, review = await readCapturePublicationReview(web, identity, enabled, query, delivery); assert.equal(review.ready, true);
    const unavailable = await readCapturePublicationReview(web, identity, enabled, query); assert.equal(unavailable.ready, false); assert.ok(unavailable.checks.some(check => check.code === 'workflow' && check.ready));
    const scheduled = await publishCaptureDraft(web, identity, enabled, { ...query, requestId: randomUUID(), confirmed: true, expectedVersion: review.sourceVersion, draftVersion: review.draftVersion, configurationVersion: review.configurationVersion, baseApprovedVersion: review.baseApprovedVersion, timing: { kind: 'scheduled', at: new Date(Date.now() + 60000).toISOString(), timezone: 'America/New_York' } }, delivery);
    await db('workspaceMemberships').where(target).delete();
    await db.transaction(async trx => { await trx.raw('ALTER TABLE "capturePublicationTransitions" DISABLE TRIGGER capture_transition_immutable'); await trx('capturePublicationTransitions').where({ id: scheduled.transitionId }).update({ scheduledAt: new Date(Date.now() - 1000) }); await trx.raw('ALTER TABLE "capturePublicationTransitions" ENABLE TRIGGER capture_transition_immutable'); });
    assert.equal(await processCapturePublications(worker, enabled, delivery), 0); const transition = await db('capturePublicationTransitions').where({ id: scheduled.transitionId }).first(); assert.equal(transition.state, 'blocked'); assert.ok(transition.failures.includes('workflow'));
    await db('workspaceMemberships').insert({ ...target, role: 'office' }); assert.equal(await processCapturePublications(worker, enabled, delivery), 0); assert.equal((await db('captureSources').where({ id: draft.sourceId }).first()).status, 'paused');
  });
  await check('workspace suspension and account suspension revoke access, including stored receipts', async () => {
    await db('workspaces').where({ id: a.workspaceId }).update({ suspendedAt: new Date(), suspendedReason: 'Fixture' }); await assert.rejects(read(a)); await assert.rejects(save(a, accepted)); await db('workspaces').where({ id: a.workspaceId }).update({ suspendedAt: null, suspendedReason: null });
    await db('users').where({ id: a.userId }).update({ suspendedAt: new Date(), suspendedReason: 'Fixture' }); await assert.rejects(read(a), AuthorizationAccessError); await db('users').where({ id: a.userId }).update({ suspendedAt: null, suspendedReason: null });
  });
  console.log(`Lead assignment rehearsal passed (${groups} groups).`);
} finally { await Promise.all([web.destroy(), worker.destroy(), staff.destroy()]); await db.destroy(); if (created) await owner.raw('DROP DATABASE ??', [name]); await owner.destroy(); }
