import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDatabase } from '../database';
import { associateBillingEvent } from './events';

const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const databaseURL = process.env.TEST_DATABASE_URL;
if (!databaseURL || databaseURL === process.env.DATABASE_URL || !new URL(databaseURL).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(databaseURL).hostname)) {
  throw new Error('Use an isolated local test database.');
}

const db = createDatabase(databaseURL);
const suffix = randomUUID();
const userId = `billing-webhook-scope-${suffix}`;
const workspaceId = randomUUID();
const eventIds = [randomUUID(), randomUUID(), randomUUID()].map(id => `evt_${id}`);
const now = new Date();

async function seed() {
  await db('users').insert({
    id: userId,
    name: 'Billing webhook scope rehearsal',
    email: `${userId}@example.test`,
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
    termsVersion: 'billing-webhook-scope-rehearsal',
    termsAcceptedAt: now,
  });
  await db.transaction(async trx => {
    await trx('workspaces').insert({
      id: workspaceId,
      ownerId: userId,
      businessName: 'Fictional billing event workspace',
      businessType: 'test',
      postalCode: '',
      serviceRange: '',
    });
    await trx('workspaceMemberships').insert({
      workspaceId,
      userId,
      role: 'owner',
    });
    await trx('workspacePolicies').insert({ workspaceId });
  });
  await db('workspaceSubscriptions').insert({
    workspaceId,
    plan: 'free',
    intendedPlan: 'free',
    catalogVersion: 'billing-webhook-scope-rehearsal',
    status: 'free',
  });
  await db('billingWebhookEvents').insert(eventIds.map((id, index) => ({
    id,
    type: 'customer.subscription.updated',
    objectId: `sub_rehearsal_${index}`,
  })));
}

async function cleanup() {
  await db('billingWebhookEvents').whereIn('id', eventIds).delete();
  await db('workspaceSubscriptions').where({ workspaceId }).delete();
  await db.transaction(async trx => {
    await trx('workspacePolicies').where({ workspaceId }).delete();
    await trx('workspaceMemberships').where({ workspaceId }).delete();
    await trx('workspaces').where({ id: workspaceId }).delete();
  });
  await db('users').where({ id: userId }).delete();
}

try {
  await seed();

  await associateBillingEvent(db, eventIds[0], workspaceId);
  assert.equal((await db('billingWebhookEvents').where({ id: eventIds[0] }).first('workspaceId'))?.workspaceId, workspaceId);

  await associateBillingEvent(db, eventIds[0], workspaceId);
  assert.equal((await db('billingWebhookEvents').where({ id: eventIds[0] }).first('workspaceId'))?.workspaceId, workspaceId);

  await assert.rejects(
    associateBillingEvent(db, eventIds[0], randomUUID()),
    /cannot be associated with this workspace/,
  );
  assert.equal((await db('billingWebhookEvents').where({ id: eventIds[0] }).first('workspaceId'))?.workspaceId, workspaceId);

  await db('billingWebhookEvents').where({ id: eventIds[1] }).update({ processedAt: now });
  await assert.rejects(
    associateBillingEvent(db, eventIds[1], workspaceId),
    /cannot be associated with this workspace/,
  );
  assert.equal((await db('billingWebhookEvents').where({ id: eventIds[1] }).first('workspaceId'))?.workspaceId, null);
  assert.equal((await db('billingWebhookEvents').where({ id: eventIds[2] }).first('workspaceId'))?.workspaceId, null);

  console.log('Billing webhook workspace rehearsal passed: association, idempotency, scope-conflict denial and unmapped/processed event isolation.');
} finally {
  await cleanup().catch(error => console.error('Billing webhook rehearsal cleanup failed:', error.message));
  await db.destroy();
}
