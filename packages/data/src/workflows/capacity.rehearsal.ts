import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { permissionIds, type WorkspacePlanId } from '@salesmora/contracts';
import { createDatabase } from '../database';
import { migrateFreshBaseline } from '../baseline-runner';
import { initializeWorkspacePolicy, withWorkspaceAuthorization } from '../authorization/store';
import { prepareWorkflowInTransaction, decideWorkflow } from './proposals';
import { readWorkflows, changeWorkflow } from './store';
import { readWorkflowEditData, editWorkflow, workflowEditValues } from './editing';
process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !['localhost','127.0.0.1'].includes(new URL(connection).hostname) || !new URL(connection).pathname.endsWith('_test')) throw Error('Separate local test database required.');
const admin = createDatabase(connection), name = `workflow_capacity_${randomUUID().replaceAll('-', '')}_test`, url = new URL(connection); url.pathname = '/' + name;
const db = createDatabase(url.toString()), runtimeUrl = new URL(url); runtimeUrl.searchParams.set('options', '-c role=salesmora_web'); const web = createDatabase(runtimeUrl.toString());
let created = false;
async function fixture(plan: WorkspacePlanId) {
  const workspaceId = randomUUID(), userId = randomUUID(), now = new Date();
  await db('users').insert({ id: userId, name: 'Fictional owner', email: `${userId}@example.test`, emailVerified: true, createdAt: now, updatedAt: now, termsVersion: 'fixture', termsAcceptedAt: now });
  await db.transaction(async trx => {
    await trx('workspaces').insert({ id: workspaceId, ownerId: userId, businessName: 'Capacity fixture', businessType: 'roofing', postalCode: '', serviceRange: '', timezone: 'America/New_York' });
    await trx('workspaceMemberships').insert({ workspaceId, userId, role: 'owner' });
    await initializeWorkspacePolicy(trx, { workspaceId, userId });
    await trx('workspaceSubscriptions').insert({ workspaceId, plan, status: plan === 'free' ? 'free' : 'active', catalogVersion: 'fixture', paidThrough: plan === 'free' ? null : new Date(Date.now() + 86400000) });
  });
  return { workspaceId, userId };
}
type Identity = Awaited<ReturnType<typeof fixture>>;
async function draft(identity: Identity) {
  const threadId = randomUUID(), turnId = randomUUID();
  await db('chatThreads').insert({ id: threadId, ...identity });
  await db('chatTurns').insert({ id: turnId, threadId, ...identity, clientTurnId: randomUUID(), requestHash: 'capacity-fixture', surfaceKey: 'workflows.list', state: 'completed', leaseUntil: new Date(), proposalFamilies: JSON.stringify(['workflow']) });
  return withWorkspaceAuthorization(web, identity, permissionIds, true, (trx, context) => prepareWorkflowInTransaction(trx, context, { threadId, turnId }, { kind: 'unassigned_lead', name: 'Capacity reminder', recipient: 'me', businessDays: 1 }));
}
async function seed(identity: Identity, count: number) {
  await db('workflows').insert(Array.from({ length: count }, (_, index) => ({ id: randomUUID(), workspaceId: identity.workspaceId, name: `Saved rule ${index}`, rule: 'Fixture', status: index % 2 ? 'paused' : 'active' })));
}
const publish = (identity: Identity, proposal: Awaited<ReturnType<typeof draft>>) => decideWorkflow(web, identity, permissionIds, { workspaceId: identity.workspaceId, id: proposal.id, inputHash: proposal.inputHash, decision: 'confirm' });
try {
  await admin.raw('CREATE DATABASE ??', [name]); created = true; await migrateFreshBaseline(db);
  for (const [plan, limit] of [['free',2],['standard',10],['premium',25]] as const) {
    const identity = await fixture(plan), pending = await draft(identity); await seed(identity, limit);
    await assert.rejects(publish(identity, pending), new RegExp(`includes ${limit} workflows`));
    await assert.rejects(draft(identity), new RegExp(`includes ${limit} workflows`));
    const list = await readWorkflows(web, identity, permissionIds, { workspaceId: identity.workspaceId });
    assert.equal(list.rows.length, limit); assert.equal(list.capacity.limit, limit); assert.equal(list.capacity.used, limit); assert.equal(list.capacity.plan, plan);
    const row = list.rows[0]; await changeWorkflow(web, identity, permissionIds, { workspaceId: identity.workspaceId, id: row.id, version: row.version, action: 'delete', confirmation: 'confirm' });
    await publish(identity, pending); await publish(identity, pending);
    const editable = await readWorkflowEditData(web, identity, permissionIds, { workspaceId: identity.workspaceId, id: pending.id, version: 1 });
    await editWorkflow(web, identity, permissionIds, { workspaceId: identity.workspaceId, id: pending.id, version: 1, requestId: randomUUID(), values: { ...workflowEditValues(editable.workflow.name, editable.workflow.definition), name: 'Edited at capacity' } });
    assert.equal((await readWorkflows(web, identity, permissionIds, { workspaceId: identity.workspaceId })).total, limit);
    console.log(`PASS ${plan}: limit ${limit}, active/paused count, deletion frees a slot, publication retries are idempotent`);
  }
  const concurrent = await fixture('free'), one = await draft(concurrent), two = await draft(concurrent); await seed(concurrent, 1);
  const results = await Promise.allSettled([publish(concurrent, one), publish(concurrent, two)]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal((await readWorkflows(web, concurrent, permissionIds, { workspaceId: concurrent.workspaceId })).total, 2);
  console.log('PASS simultaneous publication cannot overbook the last slot');
  const override = await fixture('free'); await seed(override, 2);
  await db('workspaces').where({ id: override.workspaceId }).update({ planOverride: 'premium', planOverrideReason: 'Fixture', planOverrideId: randomUUID(), planOverrideEndsAt: new Date(Date.now() + 86400000) });
  const proposal = await draft(override); await publish(override, proposal);
  await db('workspaces').where({ id: override.workspaceId }).update({ planOverrideEndsAt: new Date(0) });
  const retained = await readWorkflows(web, override, permissionIds, { workspaceId: override.workspaceId });
  assert.equal(retained.rows.length, 3); assert.equal(retained.capacity.limit, 2);
  await assert.rejects(draft(override), /Free includes 2/);
  const active = retained.rows.find(row => row.status === 'active')!;
  const paused = await changeWorkflow(web, override, permissionIds, { workspaceId: override.workspaceId, id: active.id, version: active.version, action: 'pause' });
  await changeWorkflow(web, override, permissionIds, { workspaceId: override.workspaceId, id: active.id, version: paused.version, action: 'resume' });
  assert.equal((await readWorkflows(web, override, permissionIds, { workspaceId: override.workspaceId })).total, 3);
  console.log('PASS effective overrides, expiry/downgrade retention, and lifecycle operations above the limit');
  console.log('Workflow capacity: 5 groups passed; disposable records only, no external delivery.');
} finally { await web.destroy(); await db.destroy(); if (created) await admin.raw('DROP DATABASE ?? WITH (FORCE)', [name]); await admin.destroy(); }
