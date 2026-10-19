/** Fictional, rollback-only fixtures in the isolated local test database. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createDatabase } from './database';
import { cleanupExpiredChat } from './chat-retention';
import { createAIUsageRecorder, workspaceAIAllowance } from './ai-usage';
process.loadEnvFile(fileURLToPath(new URL('../../../.env.local', import.meta.url)));
const target = process.env.TEST_DATABASE_URL;
if (process.env.NODE_ENV === 'production' || !target || !['localhost', '127.0.0.1'].includes(new URL(target).hostname) || !new URL(target).pathname.endsWith('_test') || target === process.env.DATABASE_URL) throw Error('Retention rehearsal requires the isolated local test database');
const db = createDatabase(target);
const trx = await db.transaction();
try {
  const userId = randomUUID(), workspaceId = randomUUID(), otherWorkspace = randomUUID(), otherUser = randomUUID();
  const now = new Date();
  await trx('users').insert([userId, otherUser].map(id => ({ id, name: 'Fictional retention user', email: `${id}@example.test`, createdAt: now, updatedAt: now, termsVersion: 'test', termsAcceptedAt: now })));
  await trx('workspaces').insert([{ id: workspaceId, ownerId: userId }, { id: otherWorkspace, ownerId: otherUser }].map(row => ({ ...row, businessName: 'Fictional retention workspace', businessType: 'test', postalCode: '', serviceRange: '' })));
  const old = trx.raw("CURRENT_TIMESTAMP - interval '91 days'");
  async function fixture(workspace = workspaceId, state = 'completed') {
    const threadId = randomUUID(), turnId = randomUUID(); const owner = workspace === workspaceId ? userId : otherUser;
    await trx('chatThreads').insert({ id: threadId, workspaceId: workspace, userId: owner, createdAt: old, updatedAt: old });
    await trx('chatTurns').insert({ id: turnId, threadId, workspaceId: workspace, userId: owner, clientTurnId: randomUUID(), requestHash: 'fictional', surfaceKey: 'home', state, createdAt: old, finishedAt: state === 'completed' ? old : null, leaseUntil: old });
    await trx('chatMessages').insert({ id: randomUUID(), turnId, role: 'user', text: 'Fictional retention message' });
    await trx('checkpoints').insert({ thread_id: turnId, checkpoint_id: 'fixture', checkpoint: '{}' });
    await trx('checkpoint_blobs').insert({ thread_id: turnId, channel: 'fixture', version: '1', type: 'json', blob: Buffer.from('{}') });
    await trx('checkpoint_writes').insert({ thread_id: turnId, checkpoint_id: 'fixture', task_id: 'fixture', idx: 0, channel: 'fixture', type: 'json', blob: Buffer.from('{}') });
    return { threadId, turnId };
  }
  const expired = await fixture();
  const recent = await fixture(otherWorkspace);
  await trx('chatThreads').where({ id: recent.threadId }).update({ updatedAt: trx.fn.now() });
  const active = await fixture(workspaceId, 'running');
  await trx('chatTurns').where({ id: active.turnId }).update({ leaseUntil: trx.raw("CURRENT_TIMESTAMP + interval '2 minutes'") });
  const crashed = await fixture(workspaceId, 'running');
  const boundary = await fixture();
  await trx('chatThreads').where({ id: boundary.threadId }).update({ updatedAt: trx.raw("CURRENT_TIMESTAMP - interval '90 days'") });
  const newerTurn = await fixture();
  await trx('chatTurns').where({ id: newerTurn.turnId }).update({ finishedAt: trx.fn.now() });
  const draftId = randomUUID();
  await trx('chatActionDrafts').insert({ id: draftId, turnId: expired.turnId, threadId: expired.threadId, workspaceId, userId, lead: '{}', inputHash: 'fictional', accessHash: 'fictional', expiresAt: old });
  await trx('chatActionAudit').insert({ id: randomUUID(), workspaceId, actorId: userId, draftId, action: 'draft.proposed', inputHash: 'fictional' });
  await createAIUsageRecorder(trx, { workspaceId, userId, turnId: expired.turnId }).start('fictional', 'answer', 100);
  const allowance = await workspaceAIAllowance(trx, workspaceId);

  // Failure after checkpoint deletes must roll them back with the transcript.
  await assert.rejects(trx.transaction(async failing => {
    await failing.raw(`CREATE FUNCTION retention_test_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
      IF OLD.id = '${expired.threadId}'::uuid THEN RAISE EXCEPTION 'fictional retention failure'; END IF; RETURN OLD; END $$`);
    await failing.raw('CREATE TRIGGER retention_test_failure BEFORE DELETE ON "chatThreads" FOR EACH ROW EXECUTE FUNCTION retention_test_failure()');
    await cleanupExpiredChat(failing, 1000);
  }), /fictional retention failure/);
  assert(await trx('checkpoints').where({ thread_id: expired.turnId }).first());
  assert(await trx('chatMessages').where({ turnId: expired.turnId }).first());
  await cleanupExpiredChat(trx, 1000);
  for (const fixture of [expired, crashed]) {
    assert.equal(await trx('chatThreads').where({ id: fixture.threadId }).first(), undefined);
    for (const table of ['checkpoints', 'checkpoint_blobs', 'checkpoint_writes']) assert.equal(await trx(table).where({ thread_id: fixture.turnId }).first(), undefined);
    assert.equal(await trx('chatTurns').where({ id: fixture.turnId }).first(), undefined);
    assert.equal(await trx('chatMessages').where({ turnId: fixture.turnId }).first(), undefined);
  }
  for (const fixture of [recent, active, boundary, newerTurn]) assert(await trx('chatThreads').where({ id: fixture.threadId }).first());
  assert.equal(await trx('chatActionDrafts').where({ id: draftId }).first(), undefined);
  assert(await trx('chatActionAudit').where({ draftId }).first());
  assert.deepEqual(await workspaceAIAllowance(trx, workspaceId), allowance);
  assert.equal((await cleanupExpiredChat(trx, 1000)).deletedThreads, 0);
  await assert.rejects(cleanupExpiredChat(trx, 0), /Invalid/);
  console.log('PASS expiry boundary, active/recent protection, crashed leases, cross-workspace isolation, atomic checkpoint/transcript/draft deletion, retained audit/allowance and repeat runs.');
} finally { await trx.rollback(); await db.destroy(); }
