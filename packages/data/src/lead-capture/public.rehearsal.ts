import assert from 'node:assert/strict';
import { readCaptureSource } from './store';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { CaptureDraftConfiguration, PermissionId } from '@salesmora/contracts';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy } from '../authorization/store';
import { createCaptureDraft, beginCaptureRevision, saveCaptureDraft } from './store';
import { readCapturePublicationReview, publishCaptureDraft, processCapturePublications } from './publication';
import { readPublicCapture } from './public';
const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url)); if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') || !['127.0.0.1', 'localhost'].includes(new URL(connection).hostname)) throw Error('Separate local test connection required.');
const name = `capture_public_${randomUUID().replaceAll('-', '')}_test`, owner = createDatabase(connection), url = new URL(connection); url.pathname = `/${name}`;
const db = createDatabase(url.toString()), runtimeURL = new URL(url); runtimeURL.searchParams.set('options', '-c role=salesmora_web'); const web = createDatabase(runtimeURL.toString());
const enabled: PermissionId[] = ['leadCapture.read', 'leadCapture.create', 'leadCapture.update', 'leadCapture.activate'];
const delivery = { websiteReady: async () => true, gmailReady: async () => false };
let created = false, groups = 0;
async function check(label: string, run: () => Promise<void>) { await run(); groups++; console.log(`PASS ${label}`); }
async function workspace() {
  const identity = { workspaceId: randomUUID(), userId: `public-${randomUUID()}` }, now = new Date();
  await db('users').insert({ id: identity.userId, name: 'Private owner', email: `${identity.userId}@example.test`, createdAt: now, updatedAt: now, termsVersion: 'test', termsAcceptedAt: now });
  await db.transaction(async trx => { await trx('workspaces').insert({ id: identity.workspaceId, ownerId: identity.userId, businessName: 'Private workspace', businessType: 'plumbing', postalCode: '', serviceRange: '', timezone: 'America/New_York' }); await trx('workspaceMemberships').insert({ ...identity, role: 'owner' }); await initializeWorkspacePolicy(trx, identity); await trx('workspaceSubscriptions').insert({ workspaceId: identity.workspaceId, catalogVersion: 'fixture' }); }); return identity;
}
const configuration: CaptureDraftConfiguration = { schemaVersion: 1, type: 'website', brief: 'PRIVATE BRIEF', contactRequired: true,
  fields: [{ id: 'name', key: 'name', type: 'short_text', label: 'Visitor name', required: true, options: [] }, { id: 'service', key: 'service', type: 'short_text', label: 'Service', required: true, options: [] }, { id: 'email', key: 'email', type: 'email', label: 'Email', required: false, options: [] }],
  workflow: { assignment: { kind: 'default' }, stage: 'new', tags: ['PRIVATE TAG'], notifyAssigned: true }, content: { businessName: 'Public business', title: 'Approved form', intro: 'Approved intro', submitLabel: 'Send request', thankYou: 'Thanks', unavailableMessage: 'Call our team', businessEmail: 'private-business@example.test', businessPhone: '+1 212 555 0100', showBusinessEmail: false, showBusinessPhone: true, privacy: null, consent: null } };
type Identity = { workspaceId: string; userId: string };
async function publish(identity: Identity, sourceId: string, scheduled = false) {
  const review = await readCapturePublicationReview(web, identity, enabled, { workspaceId: identity.workspaceId, sourceId }, delivery);
  return publishCaptureDraft(web, identity, enabled, { workspaceId: identity.workspaceId, sourceId, requestId: randomUUID(), expectedVersion: review.sourceVersion, draftVersion: review.draftVersion, configurationVersion: review.configurationVersion, baseApprovedVersion: review.baseApprovedVersion, confirmed: true, timing: scheduled ? { kind: 'scheduled', at: new Date(Date.now() + 60000).toISOString(), timezone: 'America/New_York' } : { kind: 'now' } }, delivery);
}
try {
  await owner.raw('CREATE DATABASE ??', [name]); created = true; await db.migrate.latest({ directory: fileURLToPath(new URL('../migrations', import.meta.url)), loadExtensions: ['.ts'] });
  const identity = await workspace(), draft = await createCaptureDraft(web, identity, enabled, { workspaceId: identity.workspaceId, requestId: randomUUID(), name: 'PRIVATE SOURCE NAME', configuration });
  await publish(identity, draft.sourceId); const publication = await db('capturePublications').where({ sourceId: draft.sourceId }).first(); const key = publication.publicKey;
  await check('authorized installation uses persisted identity, fails closed without origin and denies other tenants', async () => {
    const query = { workspaceId: identity.workspaceId, sourceId: draft.sourceId };
    assert.equal((await readCaptureSource(web, identity, enabled, query)).installation, null);
    const result = await readCaptureSource(web, identity, enabled, query, 'http://localhost:3018');
    assert.equal(result.installation?.hostedUrl, `http://localhost:3018/f/${key}`); assert.equal(result.installation?.version, 1);
    const other = await workspace(); await assert.rejects(readCaptureSource(web, other, enabled, { ...query, workspaceId: other.workspaceId }, 'http://localhost:3018'));
    await assert.rejects(readCaptureSource(web, identity, [], query, 'http://localhost:3018'));
  });
  await check('public projections contain approved visitor data and omit hidden contacts, workflow and tenant IDs', async () => {
    const result = await readPublicCapture(web, key); assert.equal(result.state, 'ready'); if (result.state !== 'ready') throw Error('Expected ready');
    assert.equal(result.definition.content.title, 'Approved form'); assert.equal(result.definition.content.businessEmail, ''); assert.equal(result.definition.content.businessPhone, '+1 212 555 0100');
    const json = JSON.stringify(result); for (const privateValue of [identity.workspaceId, identity.userId, draft.sourceId, 'PRIVATE SOURCE NAME', 'PRIVATE BRIEF', 'PRIVATE TAG', 'private-business@example.test']) assert.ok(!json.includes(privateValue));
    assert.ok(result.now instanceof Date); assert.equal((await db('captureReceipts')).length, 0); assert.equal((await db('leads')).length, 0);
  });
  await check('unknown/malformed keys and unpublished drafts reveal no workspace information', async () => {
    for (const bad of ['invalid', 'a'.repeat(64), '../settings', key + 'extra']) assert.deepEqual(await readPublicCapture(web, bad), { state: 'not-found' });
  });
  await check('unpublished draft edits never replace the approved public form', async () => {
    const source = await db('captureSources').where({ id: draft.sourceId }).first(); const revision = await beginCaptureRevision(web, identity, enabled, { workspaceId: identity.workspaceId, sourceId: draft.sourceId, expectedVersion: source.version, requestId: randomUUID() });
    await saveCaptureDraft(web, identity, enabled, { workspaceId: identity.workspaceId, sourceId: draft.sourceId, expectedVersion: revision.sourceVersion, expectedDraftVersion: revision.draftVersion, requestId: randomUUID(), name: 'PRIVATE DRAFT NAME', configuration: { ...configuration, type: 'website', content: { ...configuration.content!, title: 'PRIVATE DRAFT TITLE' } } });
    const result = await readPublicCapture(web, key); assert.equal(result.state, 'ready'); assert.ok(!JSON.stringify(result).includes('PRIVATE DRAFT')); if (result.state === 'ready') assert.equal(result.definition.version, 1);
  });
  await check('reviewed revisions keep the public key and historical configuration intact', async () => {
    await publish(identity, draft.sourceId); const result = await readPublicCapture(web, key); assert.equal(result.state, 'ready'); if (result.state === 'ready') { assert.equal(result.definition.version, 2); assert.equal(result.definition.content.title, 'PRIVATE DRAFT TITLE'); assert.equal(result.binding.publicationVersion, 2); }
    assert.equal((await db('captureSourceVersions').where({ sourceId: draft.sourceId, configurationVersion: 1 }).first()).configuration.content.title, 'Approved form');
  });
  await check('scheduled revisions continue serving the old approved pointer until the worker switches', async () => {
    const source = await db('captureSources').where({ id: draft.sourceId }).first(); const revision = await beginCaptureRevision(web, identity, enabled, { workspaceId: identity.workspaceId, sourceId: draft.sourceId, expectedVersion: source.version, requestId: randomUUID() });
    await saveCaptureDraft(web, identity, enabled, { workspaceId: identity.workspaceId, sourceId: draft.sourceId, expectedVersion: revision.sourceVersion, expectedDraftVersion: revision.draftVersion, requestId: randomUUID(), name: 'Future revision', configuration }); const scheduled = await publish(identity, draft.sourceId, true);
    const before = await readPublicCapture(web, key); if (before.state !== 'ready') throw Error('Expected ready'); assert.equal(before.definition.version, 2);
    await db.transaction(async trx => { await trx.raw('ALTER TABLE "capturePublicationTransitions" DISABLE TRIGGER capture_transition_immutable'); await trx('capturePublicationTransitions').where({ id: scheduled.transitionId }).update({ scheduledAt: new Date(Date.now() - 1000) }); await trx.raw('ALTER TABLE "capturePublicationTransitions" ENABLE TRIGGER capture_transition_immutable'); });
    assert.equal(await processCapturePublications(web, enabled, delivery), 1); const after = await readPublicCapture(web, key); if (after.state !== 'ready') throw Error('Expected ready'); assert.equal(after.definition.version, 3);
  });
  await check('paused, scheduled, archived and explicitly blocked sources are immediately unavailable', async () => {
    for (const status of ['paused', 'scheduled', 'archived']) { await db('captureSources').where({ id: draft.sourceId }).update({ status, scheduledAt: status === 'scheduled' ? new Date(Date.now() + 60000) : null, timezone: status === 'scheduled' ? 'America/New_York' : null }); const result = await readPublicCapture(web, key); assert.equal(result.state, 'unavailable'); assert.ok(!JSON.stringify(result).includes('fields')); }
    await db('captureSources').where({ id: draft.sourceId }).update({ status: 'active', block: 'connection' }); assert.equal((await readPublicCapture(web, key)).state, 'unavailable'); await db('captureSources').where({ id: draft.sourceId }).update({ block: 'none' });
  });
  await check('workspace/account suspension and deletion stop public rendering', async () => {
    await db('workspaces').where({ id: identity.workspaceId }).update({ suspendedAt: new Date(), suspendedReason: 'Fixture' }); assert.equal((await readPublicCapture(web, key)).state, 'unavailable'); await db('workspaces').where({ id: identity.workspaceId }).update({ suspendedAt: null, suspendedReason: null });
    await db('users').where({ id: identity.userId }).update({ suspendedAt: new Date(), suspendedReason: 'Fixture' }); assert.equal((await readPublicCapture(web, key)).state, 'unavailable'); await db('users').where({ id: identity.userId }).update({ suspendedAt: null, suspendedReason: null });
    await db('workspaces').where({ id: identity.workspaceId }).update({ deletionRequestedAt: new Date() }); assert.equal((await readPublicCapture(web, key)).state, 'not-found'); await db('workspaces').where({ id: identity.workspaceId }).update({ deletionRequestedAt: null });
  });
  await check('missing assignment and effective capacity overflow deny before reconciliation', async () => {
    await db('leadAssignmentSettings').where({ workspaceId: identity.workspaceId }).delete(); assert.equal((await readPublicCapture(web, key)).state, 'unavailable'); assert.equal((await readCaptureSource(web, identity, enabled, { workspaceId: identity.workspaceId, sourceId: draft.sourceId }, 'http://localhost:3018')).installation?.status, 'blocked'); await db('leadAssignmentSettings').insert({ workspaceId: identity.workspaceId });
    await db('workspaces').where({ id: identity.workspaceId }).update({ planOverride: 'premium', planOverrideEndsAt: new Date(Date.now() + 86400000), planOverrideReason: 'Fixture', planOverrideId: randomUUID() });
    const second = await createCaptureDraft(web, identity, enabled, { workspaceId: identity.workspaceId, requestId: randomUUID(), name: 'Second form', configuration }); await publish(identity, second.sourceId);
    await db('workspaces').where({ id: identity.workspaceId }).update({ planOverride: null, planOverrideEndsAt: null, planOverrideReason: null, planOverrideId: null }); assert.equal((await readPublicCapture(web, key)).state, 'unavailable'); await db('captureSources').where({ id: second.sourceId }).update({ status: 'archived' });
  });
  await check('a queued access-loss incident stays unavailable after effective access recovers', async () => {
    await db('captureAccessChecks').insert({ id: randomUUID(), workspaceId: identity.workspaceId, targetPlan: 'free', effectiveAt: new Date(Date.now() - 1000), sources: JSON.stringify([{ id: draft.sourceId, reason: 'source_capacity' }]) });
    assert.equal((await readPublicCapture(web, key)).state, 'unavailable'); assert.equal((await db('captureAccessChecks').where({ workspaceId: identity.workspaceId }).first()).processedAt, null); assert.equal((await db('captureReceipts')).length, 0);
  });
  console.log(`Public capture rehearsal passed (${groups} groups).`);
} finally { await web.destroy(); await db.destroy(); if (created) await owner.raw('DROP DATABASE ??', [name]); await owner.destroy(); }
