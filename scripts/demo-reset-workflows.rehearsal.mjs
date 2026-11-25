import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDatabase } from '../packages/data/src/database.ts';
import { migrateFreshBaseline } from '../packages/data/src/baseline-runner.ts';
import { seedDemoCrm } from '../packages/data/src/demo/seed-crm.ts';
import { demoAccounts, seedDemoAccounts } from '../apps/web/src/server/demo/seed-accounts.ts';
import {
  collectDemoWorkflows, restoreDemoWorkflows, sameDemoWorkflowSnapshot, verifyDemoWorkflows,
} from '../apps/web/src/server/demo/workflow-preservation.mjs';
import { dropVerifiedDatabase } from './demo-reset-drop.mjs';

const env = fileURLToPath(new URL('../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL ||
    !new URL(connection).pathname.endsWith('_test') ||
    !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) {
  throw new Error('A separate local TEST_DATABASE_URL ending in _test is required.');
}
const admin = createDatabase(connection);
const names = ['source', 'restored'].map(part => `demo_workflow_${part}_${randomUUID().replaceAll('-', '')}_test`);
const urlFor = name => {
  const url = new URL(connection);
  url.pathname = `/${name}`;
  return url.toString();
};
const source = createDatabase(urlFor(names[0]));
const restored = createDatabase(urlFor(names[1]));
const created = new Set();
let restoredClosed = false;
try {
  for (const name of names) {
    await admin.raw('CREATE DATABASE ??', [name]);
    created.add(name);
  }
  await migrateFreshBaseline(source);
  await migrateFreshBaseline(restored);
  const credentials = Object.fromEntries(demoAccounts.map(account => [account.key, 'demo-test-password']));
  const now = new Date('2026-03-01T12:00:00Z');
  const context = await seedDemoAccounts(source, credentials, now, 'UTC');
  await seedDemoCrm(source, context, now);
  const workspaceId = context.workspaces.main;
  const userId = context.users.DEMO_OWNER_PASSWORD;
  const sourceId = randomUUID(), draftId = randomUUID();
  const configuration = { schemaVersion: 1, type: 'website', workflow: { assignment: { kind: 'default' } } };
  await source.transaction(async trx => {
    await trx('captureSources').insert({
      id: sourceId, workspaceId, name: 'Fictional website', type: 'website', version: 1,
      status: 'active', approvedVersion: 1, draftId, createdBy: userId,
    });
    await trx('captureSourceVersions').insert({
      id: randomUUID(), workspaceId, sourceId, sourceType: 'website', configurationVersion: 1,
      definitionVersion: 1, workflowVersion: 1, configuration: JSON.stringify(configuration),
      approvedBy: userId, approvedAt: now,
    });
    await trx('captureSourceDrafts').insert({
      id: draftId, workspaceId, sourceId, sourceType: 'website', version: 1,
      baseApprovedVersion: 1, configuration: JSON.stringify(configuration),
    });
    await trx('capturePublications').insert({
      id: randomUUID(), workspaceId, sourceId, sourceType: 'website', configurationVersion: 1,
      version: 1, publicKey: 'fixture-publication-key-1234567890',
    });
  });
  const common = { recipientId: userId, recipientName: 'Demo owner', timezone: 'UTC', notifications: { inApp: true, email: false } };
  const routingId = randomUUID(), serviceId = randomUUID();
  await source('workflows').insert([
    { id: routingId, workspaceId, name: 'Routing', rule: 'Route incoming leads', status: 'active', publisherId: userId,
      definition: JSON.stringify({ ...common, kind: 'lead_routing', sourceId, sourceName: 'Fictional website' }) },
    { id: serviceId, workspaceId, name: 'Service', rule: 'Review service', status: 'active', publisherId: userId,
      definition: JSON.stringify({ ...common, kind: 'service_due', service: 'maintenance', localTime: '09:00',
        rules: { intervalMonths: 6, includeExisting: true } }) },
  ]);
  await source('serviceEmailTemplates').where({ workspaceId, purpose: 'repeat' })
    .update({ subject: 'Fictional subject', body: 'Fictional body', version: 2 });
  const snapshot = JSON.parse(JSON.stringify(await collectDemoWorkflows(source, demoAccounts)));
  assert.equal(snapshot.workflows.length, 2);
  assert.equal(snapshot.sources.length, 1);
  assert(sameDemoWorkflowSnapshot(snapshot, { ...snapshot, workflows: [...snapshot.workflows].reverse() }));
  assert(!sameDemoWorkflowSnapshot(snapshot, {
    ...snapshot, workflows: snapshot.workflows.map(row => ({ ...row, name: 'changed' })),
  }));
  const targetContext = await seedDemoAccounts(restored, credentials, now, 'UTC', snapshot);
  await seedDemoCrm(restored, targetContext, now);
  await restoreDemoWorkflows(restored, snapshot);
  await verifyDemoWorkflows(restored, snapshot);
  assert.equal((await restored('workflowSteps').where({ workflowId: serviceId, recordKind: 'service_due_init' }).first()).status, 'held');
  assert.equal((await restored('captureSources').where({ id: sourceId }).first()).status, 'paused');

  const otherUser = randomUUID(), otherWorkspace = randomUUID();
  await source('users').insert({ id: otherUser, name: 'Other fixture', email: 'other-fixture@example.test',
    termsVersion: 'test', termsAcceptedAt: now, createdAt: now, updatedAt: now });
  await source.transaction(async trx => {
    await trx('workspaces').insert({ id: otherWorkspace, ownerId: otherUser, businessName: 'Other fixture',
      businessType: 'test', postalCode: '', serviceRange: '' });
    await trx('workspaceMemberships').insert({ workspaceId: otherWorkspace, userId: otherUser, role: 'owner' });
    await trx('workspacePolicies').insert({ workspaceId: otherWorkspace });
  });
  await source('workflows').insert({ id: randomUUID(), workspaceId: otherWorkspace, name: 'Other', rule: 'Other',
    status: 'active', publisherId: otherUser, definition: JSON.stringify({ ...common, recipientId: otherUser,
      kind: 'unscheduled_estimate', businessDays: 2 }) });
  await assert.rejects(collectDemoWorkflows(source, demoAccounts), /non-demo or ambiguous workspace/);

  await restored.destroy();
  restoredClosed = true;
  const blocker = createDatabase(urlFor(names[1]));
  await blocker.raw('SELECT 1');
  await assert.rejects(dropVerifiedDatabase(admin, createDatabase(urlFor(names[1])), names[1], async () => {}),
    /active connections/);
  assert.equal((await admin('pg_database').where({ datname: names[1] }).first('datallowconn')).datallowconn, true);
  await blocker.destroy();
  await assert.rejects(dropVerifiedDatabase(admin, createDatabase(urlFor(names[1])), names[1], async () => {
    throw new Error('changed fixture');
  }), /changed fixture/);
  assert.equal((await admin('pg_database').where({ datname: names[1] }).first('datallowconn')).datallowconn, true);
  await dropVerifiedDatabase(admin, createDatabase(urlFor(names[1])), names[1], async trx => {
    assert.equal((await admin('pg_database').where({ datname: names[1] }).first('datallowconn')).datallowconn, false);
    assert.equal((await trx('workflows').count('* as count').first()).count, '2');
  });
  created.delete(names[1]);
  assert.equal(await admin('pg_database').where({ datname: names[1] }).first(), undefined);
  console.log('Workflow configurations and source restore paused; unsupported workspaces and unsafe drops fail closed.');
} finally {
  await source.destroy();
  if (!restoredClosed) await restored.destroy();
  for (const name of created) await admin.raw('DROP DATABASE ??', [name]);
  await admin.destroy();
}
