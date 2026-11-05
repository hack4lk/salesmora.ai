/** Real draft use cases on a newly allocated local database; configured databases are never migrated or truncated. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy, AuthorizationAccessError } from '../authorization/store';
import { RUNTIME_LOGIN_ROLES } from '../runtime-roles';
import { captureConfigurationSchema, type PermissionId } from '@salesmora/contracts';
import { captureDraftStartContext, listCaptureSources, readCaptureSource, createCaptureDraft, saveCaptureDraft, beginCaptureRevision, CaptureDraftConflictError, CaptureDraftValidationError, CaptureDraftEntitlementError } from './store';
const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url)); if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL || !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw Error('A separate local test connection is required.');
const name = `capture_drafts_${randomUUID().replaceAll('-', '')}_test`, owner = createDatabase(connection), url = new URL(connection); url.pathname = `/${name}`;
const db = createDatabase(url.toString());
const runtimeURL = new URL(url); runtimeURL.searchParams.set('options', `-c role=${RUNTIME_LOGIN_ROLES.web}`); const runtime = createDatabase(runtimeURL.toString());
const enabled: PermissionId[] = ['leadCapture.read', 'leadCapture.create', 'leadCapture.update'];
const a = randomUUID(), b = randomUUID(), identity = { workspaceId: a, userId: 'draft-owner-a' }, other = { workspaceId: b, userId: 'draft-owner-b' };
const configuration = { schemaVersion: 1 as const, type: 'website' as const };
const input = () => ({ workspaceId: a, requestId: randomUUID(), name: 'Saved website', configuration });
let created = false, checks = 0;
async function check(label: string, run: () => Promise<void>) { await run(); console.log(`PASS ${label}`); checks++; }
try {
  await owner.raw('CREATE DATABASE ??', [name]); created = true;
  await db.migrate.latest({ directory: fileURLToPath(new URL('../migrations', import.meta.url)), loadExtensions: ['.ts'] });
  const timestamp = new Date();
  for (const person of [identity, other]) {
    await db('users').insert({ id: person.userId, name: 'Fictional draft owner', email: `${person.userId}@example.test`, createdAt: timestamp, updatedAt: timestamp, termsVersion: 'test', termsAcceptedAt: timestamp });
    await db.transaction(async trx => {
    await trx('workspaces').insert({ id: person.workspaceId, ownerId: person.userId, businessName: 'Fictional draft workspace', businessType: 'plumbing', postalCode: '', serviceRange: '' });
    await trx('workspaceMemberships').insert({ ...person, role: 'owner' });
    await initializeWorkspacePolicy(trx, person);
    });
  }
  await check('disabled surfaces and mismatched workspaces fail closed', async () => {
    await assert.rejects(captureDraftStartContext(runtime, identity, []), AuthorizationAccessError);
    await assert.rejects(createCaptureDraft(runtime, identity, enabled, { ...input(), workspaceId: b }), AuthorizationAccessError);
  });
  const request = input();
  const saved = await createCaptureDraft(runtime, identity, enabled, request);
  await check('server identity, draft context and idempotent creation have no publication side effects', async () => {
    assert.deepEqual(await createCaptureDraft(runtime, identity, enabled, request), saved);
    assert.equal((await db('captureSources').where({ workspaceId: a })).length, 1);
    assert.equal((await db('capturePublications')).length, 0); assert.equal((await db('captureSourceVersions')).length, 0); assert.equal((await db('leads')).length, 0);
    const context = await captureDraftStartContext(runtime, identity, enabled); assert.equal(context.business.businessEmail, ''); assert.equal(context.business.gmailAccess, 'upgrade-required');
    await assert.rejects(createCaptureDraft(runtime, identity, enabled, { ...request, name: 'Changed payload' }), CaptureDraftConflictError);
  });
  const detail = () => readCaptureSource(runtime, identity, enabled, { workspaceId: a, sourceId: saved.sourceId });
  const save = { ...input(), sourceId: saved.sourceId, expectedVersion: 1, expectedDraftVersion: 1, name: 'Updated draft' };
  await check('save advances both versions and retries replay the committed receipt', async () => {
    const response = await saveCaptureDraft(runtime, identity, enabled, save); assert.equal(response.sourceVersion, 2); assert.equal(response.draftVersion, 2);
    assert.deepEqual(await saveCaptureDraft(runtime, identity, enabled, save), response);
    assert.equal((await detail()).detail.source.name, 'Updated draft');
    await assert.rejects(saveCaptureDraft(runtime, identity, enabled, { ...save, name: 'Different' }), CaptureDraftConflictError);
  });
  await check('simultaneous stale saves commit once and preserve the winner', async () => {
    const results = await Promise.allSettled(['One', 'Two'].map(name => saveCaptureDraft(runtime, identity, enabled, { ...save, name, expectedVersion: 2, expectedDraftVersion: 2, requestId: randomUUID() })));
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1); assert.equal((await detail()).detail.source.version, 3);
  });
  await check('cross-workspace reads and writes conceal source existence', async () => {
    await assert.rejects(readCaptureSource(runtime, other, enabled, { workspaceId: b, sourceId: saved.sourceId }), AuthorizationAccessError);
    await assert.rejects(saveCaptureDraft(runtime, other, enabled, { ...save, workspaceId: b }), AuthorizationAccessError);
    assert.equal((await listCaptureSources(runtime, other, enabled, { workspaceId: b })).total, 0);
  });
  await check('strict inputs, Free Gmail gating and forged provider references are rejected', async () => {
    await assert.rejects(createCaptureDraft(runtime, identity, enabled, { ...input(), actorId: 'forged' }), CaptureDraftValidationError);
    await assert.rejects(createCaptureDraft(runtime, identity, enabled, { ...input(), configuration: { schemaVersion: 1, type: 'gmail' } }), CaptureDraftEntitlementError);
    await db('workspaces').where({ id: a }).update({ planOverride: 'standard', planOverrideEndsAt: new Date(Date.now() + 86_400_000), planOverrideReason: 'Fixture', planOverrideId: randomUUID() });
    await assert.rejects(createCaptureDraft(runtime, identity, enabled, { ...input(), configuration: { schemaVersion: 1, type: 'gmail', connectionId: randomUUID() } }), CaptureDraftValidationError);
    const gmail = await createCaptureDraft(runtime, identity, enabled, { ...input(), configuration: { schemaVersion: 1, type: 'gmail', rules: { phrases: [], location: 'both', mode: 'all' } } }); assert.ok(gmail.sourceId);
  });
  await check('selected teammates must be current active members of this workspace', async () => {
    await assert.rejects(createCaptureDraft(runtime, identity, enabled, { ...input(), configuration: { ...configuration, workflow: { assignment: { kind: 'teammate', teammateId: other.userId }, stage: 'new', tags: [], notifyAssigned: true } } }), CaptureDraftValidationError);
  });
  await check('literal filters, totals, paging and archived editing are scoped', async () => {
    await createCaptureDraft(runtime, identity, enabled, { ...input(), name: 'Literal %_ example' });
    const list = await listCaptureSources(runtime, identity, enabled, { workspaceId: a, search: '%_', page: 10 }); assert.equal(list.total, 1); assert.equal(list.page, 1);
    await db('captureSources').where({ id: saved.sourceId }).update({ status: 'archived' });
    assert.equal((await detail()).canEdit, false);
    await assert.rejects(saveCaptureDraft(runtime, identity, enabled, { ...save, requestId: randomUUID(), expectedVersion: 3, expectedDraftVersion: 3 }), CaptureDraftConflictError);
    assert.equal((await listCaptureSources(runtime, identity, enabled, { workspaceId: a, archived: true })).total, 1);
    await db('captureSources').where({ id: saved.sourceId }).update({ status: 'draft' });
  });
  await check('published revisions clone the approved snapshot without changing it or consuming another source', async () => {
    const published = await createCaptureDraft(runtime, identity, enabled, input());
    const approved = captureConfigurationSchema.parse({ ...configuration, fields: [{ id: 'name', key: 'name', label: 'Name', type: 'short_text', required: true, options: [] }, { id: 'service', key: 'service', label: 'Service', type: 'short_text', required: true, options: [] }, { id: 'email', key: 'email', label: 'Email', type: 'email', required: true, options: [] }], contactRequired: true, workflow: { assignment: { kind: 'default' }, stage: 'new', tags: [], notifyAssigned: true }, content: { businessName: 'Fixture', title: 'Contact us', intro: '', submitLabel: 'Send', thankYou: 'Thanks', unavailableMessage: 'Unavailable', businessEmail: '', businessPhone: '', showBusinessEmail: false, showBusinessPhone: false, privacy: null, consent: null } });
    await db('captureSourceVersions').insert({ id: randomUUID(), workspaceId: a, sourceId: published.sourceId, sourceType: 'website', configurationVersion: 1, definitionVersion: 1, workflowVersion: 1, configuration: JSON.stringify(approved), approvedBy: identity.userId, approvedAt: timestamp });
    await db('captureSources').where({ id: published.sourceId }).update({ approvedVersion: 1, draftId: null, status: 'active' });
    const count = (await db('captureSources')).length;
    const revision = { workspaceId: a, sourceId: published.sourceId, expectedVersion: 1, requestId: randomUUID() };
    const result = await beginCaptureRevision(runtime, identity, enabled, revision); assert.equal(result.draftVersion, 2); assert.deepEqual(await beginCaptureRevision(runtime, identity, enabled, revision), result);
    const current = await readCaptureSource(runtime, identity, enabled, { workspaceId: a, sourceId: published.sourceId }); assert.deepEqual(current.detail.draft?.configuration, approved); assert.deepEqual(current.detail.approved?.configuration, approved); assert.equal((await db('captureSources')).length, count);
    await saveCaptureDraft(runtime, identity, enabled, { ...save, sourceId: published.sourceId, expectedVersion: 2, expectedDraftVersion: 2, requestId: randomUUID() });
    assert.deepEqual((await readCaptureSource(runtime, identity, enabled, { workspaceId: a, sourceId: published.sourceId })).detail.approved?.configuration, approved);
  });
  await check('audit failure rolls back draft creation and its receipt', async () => {
    await db.raw(`CREATE FUNCTION capture_test_fail_event() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test event failure'; END $$`);
    await db.raw(`CREATE TRIGGER capture_test_fail_event BEFORE INSERT ON "captureSourceEvents" FOR EACH ROW EXECUTE FUNCTION capture_test_fail_event()`);
    const count = (await db('captureSources')).length; await assert.rejects(createCaptureDraft(runtime, identity, enabled, input()), /test event failure/); assert.equal((await db('captureSources')).length, count);
    await db.raw('DROP TRIGGER capture_test_fail_event ON "captureSourceEvents"');
  });
  await check('Office draft permissions are independent and Field cannot access capture sources', async () => {
    for (const role of ['office', 'field'] as const) {
      const userId = `draft-${role}`;
      await db('users').insert({ id: userId, name: role, email: `${userId}@example.test`, createdAt: timestamp, updatedAt: timestamp, termsVersion: 'test', termsAcceptedAt: timestamp });
      await db('workspaceMemberships').insert({ workspaceId: a, userId, role });
    }
    const office = { workspaceId: a, userId: 'draft-office' }, field = { workspaceId: a, userId: 'draft-field' };
    assert.equal((await listCaptureSources(runtime, office, enabled, { workspaceId: a })).permissions.canUpdate, true);
    await assert.rejects(listCaptureSources(runtime, field, enabled, { workspaceId: a }), AuthorizationAccessError);
    await assert.rejects(createCaptureDraft(runtime, office, enabled, request), CaptureDraftConflictError);
    await db('workspaceRolePolicies').where({ workspaceId: a, role: 'office', permission: 'leadCapture.update' }).delete();
    assert.equal((await listCaptureSources(runtime, office, enabled, { workspaceId: a })).permissions.canUpdate, false);
    await assert.rejects(saveCaptureDraft(runtime, office, enabled, save), AuthorizationAccessError);
    assert.ok(await createCaptureDraft(runtime, office, enabled, input()));
    await db('workspaceRolePolicies').where({ workspaceId: a, role: 'office', permission: 'leadCapture.create' }).delete();
    await assert.rejects(createCaptureDraft(runtime, office, enabled, input()), AuthorizationAccessError);
  });
  await check('revoked and suspended identities cannot replay successful requests', async () => {
    await db('users').where({ id: identity.userId }).update({ suspendedAt: new Date(), suspendedReason: 'Fixture' });
    await assert.rejects(createCaptureDraft(runtime, identity, enabled, request), AuthorizationAccessError);
    await db('users').where({ id: identity.userId }).update({ suspendedAt: null, suspendedReason: null });
    await db('workspaces').where({ id: a }).update({ suspendedAt: new Date(), suspendedReason: 'Fixture' });
    await assert.rejects(detail(), AuthorizationAccessError);
  });
  console.log(`Lead Capture draft store passed (${checks} groups).`);
} finally { await runtime.destroy(); await db.destroy(); if (created) await owner.raw('DROP DATABASE ??', [name]); await owner.destroy(); }
