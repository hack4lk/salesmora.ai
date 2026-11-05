/** Fresh disposable database only. No Gmail requests, real credentials or application records. */
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Knex } from 'knex';
import { permissionIds } from '@salesmora/contracts';
import { createDatabase } from '../database';
import { AuthorizationAccessError, initializeWorkspacePolicy } from '../authorization/store';
import { ADMIN_APP_ROLE, RUNTIME_LOGIN_ROLES, applyRuntimeGrants } from '../runtime-roles';
import { createCaptureGmailCipher } from './gmail-credentials';
import { listCaptureGmailAccounts } from './gmail-accounts';

const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') || !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw Error('A separate local test connection is required.');
const name = `capture_gmail_${randomUUID().replaceAll('-', '')}_test`, owner = createDatabase(connection), url = new URL(connection);
url.pathname = `/${name}`;
const db = createDatabase(url.toString());
function runtime(role: string) {
  const roleUrl = new URL(url); roleUrl.searchParams.set('options', `-c role=${role}`);
  return createDatabase(roleUrl.toString());
}
const web = runtime(RUNTIME_LOGIN_ROLES.web), worker = runtime(RUNTIME_LOGIN_ROLES.worker), admin = runtime(ADMIN_APP_ROLE);
const identity = { workspaceId: randomUUID(), userId: `gmail-owner-${randomUUID()}` }, other = { workspaceId: randomUUID(), userId: `gmail-other-${randomUUID()}` };
const sourceId = randomUUID(), websiteId = randomUUID(), accountId = randomUUID(), otherAccountId = randomUUID();
const config = { directory: fileURLToPath(new URL('../migrations', import.meta.url)), loadExtensions: ['.ts'] };
const migration = '202611050002_capture_gmail_foundation.ts';
const cipher = createCaptureGmailCipher({ CAPTURE_GMAIL_ACTIVE_KEY_ID: 'test', CAPTURE_GMAIL_CREDENTIAL_KEYS: JSON.stringify({ test: randomBytes(32).toString('base64') }) });
const binding = { environment: 'local' as const, workspaceId: identity.workspaceId, recordId: accountId };
const envelope = cipher.sealTokens(binding, { refreshToken: 'fictional-refresh', accessToken: null, expiresAt: null, tokenType: 'Bearer', scopes: ['https://www.googleapis.com/auth/gmail.readonly'] });
let created = false, checks = 0;
async function check(label: string, work: () => Promise<void>) { await work(); checks++; console.log(`PASS ${label}`); }
async function rejects(work: (trx: Knex.Transaction) => Promise<unknown>, code: string, client = web) {
  await assert.rejects(client.transaction(work), (error: { code?: string }) => error.code === code);
}
try {
  await owner.raw('CREATE DATABASE ??', [name]); created = true;
  await db.migrate.latest(config);
  await check('fresh replay, empty rollback and re-upgrade of owned migration', async () => {
    await db.migrate.down({ ...config, name: '202611050004_capture_gmail_samples.ts' });
    await db.migrate.down({ ...config, name: '202611050003_capture_gmail_connections.ts' });
    await db.migrate.down({ ...config, name: migration });
    assert.equal(await db.schema.hasTable('captureGmailAccounts'), false);
    await db.migrate.up({ ...config, name: migration });
    await db.migrate.up({ ...config, name: '202611050003_capture_gmail_connections.ts' });
    await db.migrate.up({ ...config, name: '202611050004_capture_gmail_samples.ts' });
    assert.equal(await db.schema.hasTable('captureGmailAccounts'), true);
    assert.equal((await db.migrate.latest(config))[1].length, 0);
  });
  const now = new Date();
  for (const person of [identity, other]) {
    await db('users').insert({ id: person.userId, name: 'Fictional Gmail tester', email: `${person.userId}@example.test`, createdAt: now, updatedAt: now, termsVersion: 'test', termsAcceptedAt: now });
    await db.transaction(async trx => {
      await trx('workspaces').insert({ id: person.workspaceId, ownerId: person.userId, businessName: 'Fictional Gmail workspace', businessType: 'test', postalCode: '', serviceRange: '' });
      await trx('workspaceMemberships').insert({ ...person, role: 'owner' });
      await initializeWorkspacePolicy(trx, person);
    });
  }
  await web('captureSources').insert([{ id: sourceId, workspaceId: identity.workspaceId, name: 'Fictional Gmail source', type: 'gmail', status: 'draft', version: 1 }, { id: websiteId, workspaceId: identity.workspaceId, name: 'Fictional website', type: 'website', status: 'draft', version: 1 }]);
  await web('captureSourceVersions').insert({ id: randomUUID(), workspaceId: identity.workspaceId, sourceId, sourceType: 'gmail', configurationVersion: 1, definitionVersion: 1, workflowVersion: 1, configuration: JSON.stringify({ schemaVersion: 1, type: 'gmail' }), approvedBy: identity.userId, approvedAt: now });
  const account = { id: accountId, workspaceId: identity.workspaceId, providerSubject: 'fictional-google-sub', email: 'fictional@example.test', status: 'connected' };
  await web('captureGmailAccounts').insert([account, { ...account, id: otherAccountId, workspaceId: other.workspaceId }]);
  await check('stable provider identity is workspace scoped and credentials bind its generation', async () => {
    await rejects(trx => trx('captureGmailAccounts').insert({ ...account, id: randomUUID() }), '23505');
    await rejects(trx => trx('captureGmailAccounts').where({ id: accountId }).update({ providerSubject: 'different-account' }), '23514');
    await web('captureGmailCredentials').insert({ id: randomUUID(), workspaceId: identity.workspaceId, accountId, generation: 1, envelope: JSON.stringify(envelope) });
    await rejects(trx => trx('captureGmailCredentials').where({ accountId }).update({ generation: 2 }), '23503');
    await rejects(trx => trx('captureGmailCredentials').where({ accountId }).update({ envelope: JSON.stringify({ refreshToken: 'plaintext-forbidden' }) }), '23514');
    await rejects(trx => trx('captureGmailCredentials').where({ accountId }).update({ envelope: JSON.stringify({ ...envelope, plaintext: 'forbidden' }) }), '23514');
    await rejects(trx => trx('captureGmailCredentials').insert({ id: randomUUID(), workspaceId: identity.workspaceId, accountId: otherAccountId, envelope: JSON.stringify(envelope) }), '23503');
    const stored = await worker('captureGmailCredentials').where({ accountId }).first('envelope');
    assert.equal(cipher.openTokens(binding, stored.envelope).refreshToken, 'fictional-refresh');
  });
  await check('account API projection, tenant isolation, current grants and downgrade cleanup', async () => {
    const result = await listCaptureGmailAccounts(web, identity, permissionIds, { workspaceId: identity.workspaceId });
    assert.deepEqual(result.accounts, [{ id: accountId, email: account.email, status: 'connected', version: 1 }]);
    assert.equal(result.capabilities.canConnect, false); assert.equal(result.capabilities.canDisconnect, true);
    assert.equal(JSON.stringify(result).includes('fictional-google-sub'), false);
    assert.equal(JSON.stringify(result).includes('envelope'), false);
    assert.equal((await listCaptureGmailAccounts(web, other, permissionIds, { workspaceId: other.workspaceId })).accounts[0].id, otherAccountId);
    await assert.rejects(listCaptureGmailAccounts(web, identity, permissionIds, { workspaceId: other.workspaceId }), AuthorizationAccessError);
    await assert.rejects(listCaptureGmailAccounts(web, identity, [], { workspaceId: identity.workspaceId }), AuthorizationAccessError);
    await db('workspaces').where({ id: identity.workspaceId }).update({ planOverride: 'standard', planOverrideEndsAt: new Date(Date.now() + 86400000), planOverrideReason: 'Fictional test', planOverrideId: randomUUID() });
    assert.equal((await listCaptureGmailAccounts(web, identity, permissionIds, { workspaceId: identity.workspaceId })).capabilities.canConnect, true);
  });
  const attemptId = randomUUID(), attemptBinding = { ...binding, recordId: attemptId };
  const attempt = { id: attemptId, workspaceId: identity.workspaceId, sourceId, userId: identity.userId, requestId: randomUUID(), stateHash: 'a'.repeat(64), sessionHash: 'b'.repeat(64), envelope: JSON.stringify(cipher.sealOAuth(attemptBinding, { pkceVerifier: 'a'.repeat(43) })), expectedSourceVersion: 1, expectedDraftVersion: 1, createdAt: now, expiresAt: new Date(now.getTime() + 600000) };
  await check('OAuth storage is short lived and supports atomic one-use consumption', async () => {
    await web('captureGmailOAuthAttempts').insert(attempt);
    await rejects(trx => trx('captureGmailOAuthAttempts').insert({ ...attempt, id: randomUUID(), requestId: randomUUID(), stateHash: 'c'.repeat(64), expiresAt: new Date(now.getTime() + 600001) }), '23514');
    await rejects(trx => trx('captureGmailOAuthAttempts').insert({ ...attempt, id: randomUUID(), requestId: randomUUID(), stateHash: 'd'.repeat(64), reconnectAccountId: otherAccountId, expectedAccountVersion: 1 }), '23503');
    const consumed = await Promise.all([1, 2].map(() => web('captureGmailOAuthAttempts').where({ id: attemptId, state: 'pending' }).where('expiresAt', '>', web.fn.now()).update({ state: 'consumed', resolvedAt: web.fn.now() }).returning('id')));
    assert.equal(consumed.flat().length, 1);
    await rejects(trx => trx('captureGmailOAuthAttempts').where({ id: attemptId }).update({ resolvedAt: null }), '23514');
  });
  await check('reapplying runtime grants keeps staff and workers out of OAuth attempts', async () => {
    await applyRuntimeGrants(db);
    for (const table of ['captureGmailAccounts', 'captureGmailCredentials', 'captureGmailOAuthAttempts', 'captureGmailMailboxState', 'captureGmailEligibilityWindows', 'captureGmailMessageJobs', 'captureGmailDisconnectReviews', 'captureGmailConnectionEvents', 'captureGmailSamplePreviews', 'captureGmailSampleBindings']) {
      await assert.rejects(admin(table).select('*').limit(1), (error: { code?: string }) => error.code === '42501');
    }
    await assert.rejects(worker('captureGmailOAuthAttempts').first('envelope'), (error: { code?: string }) => error.code === '42501');
    await assert.rejects(worker('captureGmailDisconnectReviews').first('id'), (error: { code?: string }) => error.code === '42501');
    await assert.rejects(worker('captureGmailSamplePreviews').first('id'), (error: { code?: string }) => error.code === '42501');
    await rejects(trx => trx('captureGmailConnectionEvents').where({ id: randomUUID() }).update({ kind: 'connected' }), '42501');
    assert.ok(await web('captureGmailOAuthAttempts').first('id'));
    assert.ok(await worker('captureGmailCredentials').first('id'));
    await rejects(trx => trx('captureGmailAccounts').where({ id: accountId }).delete(), '42501');
    await rejects(trx => trx('captureGmailAccounts').insert({ ...account, id: randomUUID(), providerSubject: 'worker-forgery' }), '42501', worker);
    await rejects(trx => trx('captureGmailCredentials').where({ accountId }).delete(), '42501', worker);
  });
  const windowId = randomUUID();
  const window = { id: windowId, workspaceId: identity.workspaceId, sourceId, accountId, configurationVersion: 1, startHistoryId: '18446744073709551615', startedAt: now };
  await check('source eligibility binds Gmail type, tenant, account and immutable configuration', async () => {
    await web('captureGmailEligibilityWindows').insert(window);
    await rejects(trx => trx('captureGmailEligibilityWindows').insert({ ...window, id: randomUUID() }), '23505');
    await rejects(trx => trx('captureGmailEligibilityWindows').insert({ ...window, id: randomUUID(), sourceId: websiteId }), '23503');
    await rejects(trx => trx('captureGmailEligibilityWindows').where({ id: windowId }).update({ accountId: otherAccountId }), '23503');
    await rejects(trx => trx('captureGmailEligibilityWindows').where({ id: windowId }).update({ endedAt: new Date(now.getTime() - 1) }), '23514');
    await rejects(trx => trx('captureGmailEligibilityWindows').where({ id: windowId }).update({ configurationVersion: 2 }), '23503');
  });
  await check('durable message identities, retry obligations and leases reject invalid state', async () => {
    const job = { id: randomUUID(), workspaceId: identity.workspaceId, sourceId, accountId, windowId, configurationVersion: 1, messageId: 'fictional-message' };
    await worker('captureGmailMessageJobs').insert(job);
    await rejects(trx => trx('captureGmailMessageJobs').insert({ ...job, id: randomUUID() }), '23505', worker);
    await rejects(trx => trx('captureGmailMessageJobs').where({ id: job.id }).update({ configurationVersion: 2 }), '23503');
    await rejects(trx => trx('captureGmailMessageJobs').where({ id: job.id }).update({ state: 'accepted' }), '23514');
    await rejects(trx => trx('captureGmailMessageJobs').where({ id: job.id }).update({ state: 'processing', leaseId: randomUUID() }), '23514');
    await worker('captureGmailMessageJobs').where({ id: job.id }).update({ state: 'processing', leaseId: randomUUID(), leaseUntil: new Date(Date.now() + 60000) });
    await worker('captureGmailMessageJobs').where({ id: job.id }).update({ state: 'retry', leaseId: null, leaseUntil: null, failure: 'provider', attempts: 1 });
    const receipt = { id: randomUUID(), workspaceId: identity.workspaceId, sourceId, sourceType: 'gmail', configurationVersion: 1, definitionVersion: 1, workflowVersion: 1, connectionId: accountId, messageId: 'different-message', dedupeKey: randomUUID(), inputHash: 'a'.repeat(64), admission: 'review', evidence: JSON.stringify({ schemaVersion: 1, type: 'gmail', from: '', subject: '', body: 'Fictional fixture', fields: [] }), originalAnswers: '{}', receivedAt: now };
    await web('captureReceipts').insert(receipt);
    await rejects(trx => trx('captureGmailMessageJobs').where({ id: job.id }).update({ state: 'accepted', receiptId: receipt.id }), '23503');
    const acceptedId = randomUUID();
    await web('captureReceipts').insert({ ...receipt, id: acceptedId, messageId: job.messageId, dedupeKey: randomUUID() });
    await worker('captureGmailMessageJobs').where({ id: job.id }).update({ state: 'accepted', receiptId: acceptedId, failure: null });
    const mailbox = { id: randomUUID(), workspaceId: identity.workspaceId, accountId, historyId: '18446744073709551615' };
    await worker('captureGmailMailboxState').insert(mailbox);
    assert.equal((await worker('captureGmailMailboxState').where({ id: mailbox.id }).first('historyId')).historyId, mailbox.historyId);
    await rejects(trx => trx('captureGmailMailboxState').where({ id: mailbox.id }).update({ historyId: 'not-a-cursor' }), '23514');
  });
  await check('retained data blocks rollback; workspace deletion cascades credentials and work', async () => {
    await assert.rejects(db.migrate.down({ ...config, name: migration }), /Retained Gmail records/);
    assert.equal(await db.schema.hasTable('captureGmailAccounts'), true);
    await db('workspaces').where({ id: identity.workspaceId }).delete();
    for (const table of ['captureGmailAccounts', 'captureGmailCredentials', 'captureGmailOAuthAttempts', 'captureGmailMailboxState', 'captureGmailEligibilityWindows', 'captureGmailMessageJobs']) {
      assert.equal((await db(table).where({ workspaceId: identity.workspaceId })).length, 0);
    }
    assert.ok(await db('captureGmailAccounts').where({ id: otherAccountId }).first('id'));
  });
  console.log(`Gmail foundation passed (${checks} groups).`);
} finally {
  await Promise.all([web.destroy(), worker.destroy(), admin.destroy()]); await db.destroy();
  if (created) await owner.raw('DROP DATABASE ??', [name]);
  await owner.destroy();
}
