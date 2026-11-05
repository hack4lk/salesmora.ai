import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy, AuthorizationAccessError, withWorkspaceAuthorization } from '../authorization/store';
import { createCaptureDraft, saveCaptureDraft, listCaptureSources } from './store';
import { readCaptureForChat, captureChatStamp, captureChatEvidenceAllowed } from './assistant-read';
import { captureChatSnapshotSchema, type PermissionId } from '@salesmora/contracts';
const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url)); if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL || !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw Error('A separate local test connection is required.');
const owner = createDatabase(connection), name = `capture_chat_${randomUUID().replaceAll('-', '')}_test`, url = new URL(connection); url.pathname = `/${name}`;
const db = createDatabase(url.toString()), runtimeURL = new URL(url); runtimeURL.searchParams.set('options', '-c role=salesmora_web'); const runtime = createDatabase(runtimeURL.toString());
const enabled: PermissionId[] = ['assistant.use', 'leadCapture.read', 'leadCapture.create', 'leadCapture.update'];
const identity = { workspaceId: randomUUID(), userId: `capture-chat-${randomUUID()}` }, foreign = { workspaceId: randomUUID(), userId: `foreign-chat-${randomUUID()}` };
const query = { operation: 'sources', sourceId: null, search: null, type: null, status: null, archived: false, usePageFilters: false, page: 1, limit: 20 };
let created = false, checks = 0;
async function check(label: string, work: () => Promise<void>) { await work(); console.log(`PASS ${label}`); checks++; }
try {
  await owner.raw('CREATE DATABASE ??', [name]); created = true;
  await db.migrate.latest({ directory: fileURLToPath(new URL('../migrations', import.meta.url)), loadExtensions: ['.ts'] });
  for (const person of [identity, foreign]) {
    await db('users').insert({ id: person.userId, name: 'Fictional assistant owner', email: `${person.userId}@example.test`, createdAt: new Date(), updatedAt: new Date(), termsVersion: 'test', termsAcceptedAt: new Date() });
    await db.transaction(async trx => { await trx('workspaces').insert({ id: person.workspaceId, ownerId: person.userId, businessName: 'Fictional assistant workspace', businessType: 'plumbing', postalCode: '', serviceRange: '', timezone: 'America/New_York' }); await trx('workspaceMemberships').insert({ ...person, role: 'owner' }); await initializeWorkspacePolicy(trx, person); });
  }
  const sources: Awaited<ReturnType<typeof createCaptureDraft>>[] = [];
  for (let i = 0; i < 26; i++) sources.push(await createCaptureDraft(runtime, identity, enabled, { workspaceId: identity.workspaceId, requestId: randomUUID(), name: `Source ${i}`, configuration: { schemaVersion: 1, type: 'website' } }));
  const otherSource = await createCaptureDraft(runtime, foreign, enabled, { workspaceId: foreign.workspaceId, requestId: randomUUID(), name: 'PRIVATE FOREIGN SOURCE', configuration: { schemaVersion: 1, type: 'website' } });
  await check('runtime reads preserve canonical page behavior and complete disjoint bounded windows', async () => {
    const first = await readCaptureForChat(runtime, identity, enabled, query), second = await readCaptureForChat(runtime, identity, enabled, { ...query, page: 2 });
    if (!first.snapshot || !second.snapshot || first.snapshot.result.operation !== 'sources' || second.snapshot.result.operation !== 'sources') throw Error('Missing source list');
    assert.equal(first.snapshot.result.total, 26); assert.equal(first.snapshot.result.rows.length, 20); assert.equal(second.snapshot.result.rows.length, 6);
    assert.equal(new Set([...first.snapshot.result.rows, ...second.snapshot.result.rows].map(row => row.id)).size, 26);
    captureChatSnapshotSchema.parse(first.snapshot);
    assert.equal((await listCaptureSources(runtime, identity, enabled, { workspaceId: identity.workspaceId })).rows.length, 25);
    assert.ok(!JSON.stringify(first).includes('PRIVATE FOREIGN SOURCE'));
  });
  await check('assistant and source grants are independently required', async () => {
    for (const permission of ['assistant.use', 'leadCapture.read']) await assert.rejects(readCaptureForChat(runtime, identity, enabled.filter(p => p !== permission), query), AuthorizationAccessError);
    await assert.rejects(readCaptureForChat(runtime, { ...identity, workspaceId: foreign.workspaceId }, enabled, query), AuthorizationAccessError);
  });
  await check('current list filters are honored and absent filters never silently broaden a request', async () => {
    const read = await readCaptureForChat(runtime, identity, enabled, { ...query, usePageFilters: true }, { pageContext: { surface: 'lead_capture.list', filters: { search: 'Source 25', archived: false } } });
    assert.equal(read.snapshot?.result.operation, 'sources'); if (read.snapshot?.result.operation === 'sources') assert.equal(read.snapshot.result.total, 1);
    assert.ok('clarification' in await readCaptureForChat(runtime, identity, enabled, { ...query, usePageFilters: true }));
  });
  const recordQuery = { ...query, operation: 'source_details', sourceId: sources[0].sourceId, limit: 1 };
  await check('record reads accept only explicit current selection and deny foreign IDs', async () => {
    const selected = await readCaptureForChat(runtime, identity, enabled, { ...recordQuery, sourceId: null }, { pageContext: { surface: 'lead_capture.detail', sourceId: sources[0].sourceId } });
    assert.equal(selected.snapshot?.result.operation, 'source_details');
    assert.ok('clarification' in await readCaptureForChat(runtime, identity, enabled, { ...recordQuery, sourceId: null }));
    await assert.rejects(readCaptureForChat(runtime, identity, enabled, { ...recordQuery, sourceId: otherSource.sourceId }), AuthorizationAccessError);
  });
  await check('readiness and installation reads do not fabricate publication authority or artifacts', async () => {
    const installation = await readCaptureForChat(runtime, identity, enabled, { ...recordQuery, operation: 'installation' });
    if (installation.snapshot?.result.operation !== 'installation') throw Error('Missing installation result'); assert.equal(installation.snapshot.result.installation, null);
    const review = await readCaptureForChat(runtime, identity, enabled, { ...recordQuery, operation: 'publication_review' });
    if (review.snapshot?.result.operation !== 'publication_review') throw Error('Missing review'); assert.equal(review.snapshot.result.review.ready, false);
    assert.equal(Number((await db('capturePublications').count('* as n').first())?.n), 0); assert.equal(Number((await db('captureReceipts').count('* as n').first())?.n), 0); assert.equal(Number((await db('leads').count('* as n').first())?.n), 0);
  });
  const stamp = await withWorkspaceAuthorization(runtime, identity, enabled, false, (trx, context) => captureChatStamp(trx, context, 'delivery-off'));
  await check('deployment control effects and changed source configuration invalidate evidence', async () => {
    await withWorkspaceAuthorization(runtime, identity, enabled, false, async (trx, context) => { assert.equal(await captureChatEvidenceAllowed(trx, context, stamp, 'delivery-off'), true); assert.equal(await captureChatStamp(trx, { ...context, enabledPermissions: [...context.enabledPermissions].reverse(), policy: { ...context.policy, grants: [...context.policy.grants].reverse() } }, 'delivery-off'), stamp); assert.equal(await captureChatEvidenceAllowed(trx, context, stamp, 'delivery-on'), false); });
    await saveCaptureDraft(runtime, identity, enabled, { workspaceId: identity.workspaceId, sourceId: sources[0].sourceId, requestId: randomUUID(), expectedVersion: 1, expectedDraftVersion: 1, name: 'Changed source', configuration: { schemaVersion: 1, type: 'website' } });
    await withWorkspaceAuthorization(runtime, identity, enabled, false, async (trx, context) => { assert.equal(await captureChatEvidenceAllowed(trx, context, stamp, 'delivery-off'), false); });
  });
  await check('read metadata is actor-bound and ignores another workspace changes', async () => {
    const before = await withWorkspaceAuthorization(runtime, identity, enabled, false, (trx, context) => captureChatStamp(trx, context));
    await saveCaptureDraft(runtime, foreign, enabled, { workspaceId: foreign.workspaceId, sourceId: otherSource.sourceId, requestId: randomUUID(), expectedVersion: 1, expectedDraftVersion: 1, name: 'Changed private foreign source', configuration: { schemaVersion: 1, type: 'website' } });
    await withWorkspaceAuthorization(runtime, identity, enabled, false, async (trx, context) => { assert.equal(await captureChatEvidenceAllowed(trx, context, before), true); });
  });
  console.log(`PASS ${checks} capture assistant runtime-role database groups`);
} finally { await Promise.all([runtime.destroy(), db.destroy()]); if (created) await owner.raw('DROP DATABASE ?? WITH (FORCE)', [name]); await owner.destroy(); }
