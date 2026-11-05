import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import knex from 'knex';
import pg from 'pg';
import { createDatabase } from './database';
import { appendAdminAuditEvent, hashAdminAuditEvent, serializeAdminAuditRecord, verifyAdminAuditChain, type AdminAuditRecord } from './admin-audit';
import {
  AUDIT_PREPARATION_LIMITS, AUDIT_PREPARATION_LOCK, assertAuditWorkerRole, prepareAdminAuditArchive,
} from './admin-audit-preparation';
import { ADMIN_APP_ROLE, AUDIT_WORKER_ROLE, applyAuditWorkerGrants, RUNTIME_LOGIN_ROLES } from './runtime-roles';
import { up, down } from './migrations/202610300009_admin_audit_preparation';

const envFile = fileURLToPath(new URL('../../../.env.local', import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);
const ownerURL = process.env.TEST_DATABASE_URL;
if (!ownerURL || !new URL(ownerURL).pathname.endsWith('_test') || ownerURL === process.env.DATABASE_URL ||
  !['localhost', '127.0.0.1'].includes(new URL(ownerURL).hostname)) {
  throw new Error('Use the isolated local test database.');
}
const owner = createDatabase(ownerURL);
const worker = knex({
  client: 'pg', connection: ownerURL, pool: {
    min: 0, max: 2,
    afterCreate(connection: pg.Client, done: (error: Error | null, connection: pg.Client) => void) {
      connection.query(`SET ROLE ${AUDIT_WORKER_ROLE}`, error => done(error, connection));
    },
  },
});
const ledgerId = randomUUID();
let createdRole = false;
let lockConnection: Awaited<ReturnType<typeof owner.client.acquireConnection>> | undefined;
let jobId: string | undefined;
let triggerCreated = false;

try {
  const alreadyProvisioned = await owner('pg_roles').where({ rolname: AUDIT_WORKER_ROLE }).first('rolname');
  if (!alreadyProvisioned) {
    await owner.raw(`CREATE ROLE ${AUDIT_WORKER_ROLE} NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS NOINHERIT`);
    createdRole = true;
  }
  // Migration up/down and grants are proved transactionally without touching other migrations.
  await owner.transaction(async trx => {
    if (await trx.schema.withSchema('admin').hasTable('auditArchiveJobs')) {
      assert.equal((await trx.withSchema('admin').table('auditArchiveJobs').count<{ count: string }[]>('* AS count'))[0].count, '0',
        'The isolated rehearsal must not overwrite existing archive jobs.');
      await down(trx);
    }
    await up(trx);
    await down(trx);
    await up(trx);
    await trx.rollback();
  });
  await owner.migrate.up({
    name: '202610300009_admin_audit_preparation.ts',
    directory: fileURLToPath(new URL('./migrations', import.meta.url)), loadExtensions: ['.ts'],
  });
  await applyAuditWorkerGrants(owner);
  assert.equal((await verifyAdminAuditChain(owner)).valid, true);
  await assert.rejects(assertAuditWorkerRole(owner), /dedicated/);
  await assertAuditWorkerRole(worker);

  for (const [table, grants] of [
    ['public.users', 'SELECT'], ['admin."staffUsers"', 'SELECT'], ['admin."staffSessions"', 'SELECT'],
    ['admin."auditEvents"', 'INSERT,UPDATE,DELETE'], ['admin."auditArchiveJobs"', 'DELETE'],
  ]) {
    const result = await owner.raw<{ rows: { allowed: boolean }[] }>(
      'SELECT has_table_privilege(?, ?, ?) AS allowed', [AUDIT_WORKER_ROLE, table, grants],
    );
    assert.equal(result.rows[0].allowed, false, `${table} ${grants} must be denied`);
  }
  for (const role of [ADMIN_APP_ROLE, ...Object.values(RUNTIME_LOGIN_ROLES)]) {
    if (!await owner('pg_roles').where({ rolname: role }).first()) continue;
    const result = await owner.raw<{ rows: { write: boolean; read: boolean }[] }>(
      `SELECT has_table_privilege(?, 'admin."auditArchiveJobs"', 'INSERT,UPDATE,DELETE') AS write,
        has_table_privilege(?, 'admin."auditArchiveJobs"', 'SELECT') AS read`, [role, role],
    );
    assert.equal(result.rows[0].write, false);
    assert.equal(result.rows[0].read, role === ADMIN_APP_ROLE);
  }
  // Each denied SQL operation runs separately so a failure cannot poison later assertions.
  await assert.rejects(worker.withSchema('admin').table('staffUsers').select('*'), { code: '42501' });
  await assert.rejects(worker.table('users').select('*'), { code: '42501' });
  await assert.rejects(worker.withSchema('admin').table('auditEvents').whereRaw('false').delete(), { code: '42501' });
  await owner.transaction(async trx => {
    await trx.raw(`GRANT SELECT ON admin."staffSessions" TO ${AUDIT_WORKER_ROLE}`);
    await trx.raw(`SET LOCAL ROLE ${AUDIT_WORKER_ROLE}`);
    await assert.rejects(assertAuditWorkerRole(trx), /dedicated/);
    await trx.raw('RESET ROLE');
    await trx.rollback();
  });

  // Nested worker transactions use savepoints on this borrowed connection. All synthetic
  // ledger replacement and resource-bound fixtures are rolled back before real job tests.
  await owner.transaction(async trx => {
    await trx.withSchema('admin').table('auditEvents').delete();
    await trx.raw(`SET LOCAL ROLE ${AUDIT_WORKER_ROLE}`);
    const empty = await prepareAdminAuditArchive(trx, ledgerId);
    assert.equal(empty.state, 'no_events');
    let syntheticJob = await trx.withSchema('admin').table('auditArchiveJobs').where({ ledgerId }).first();
    assert.equal(syntheticJob.scope, null);
    assert.equal(syntheticJob.attempts, 0);
    await trx.raw('RESET ROLE');
    const firstSynthetic = await appendAdminAuditEvent(trx, {
      staffUserId: null, staffRole: 'bootstrap', action: 'audit.preparation.synthetic',
      targetType: 'audit_rehearsal', targetId: ledgerId,
    });
    await trx.raw(`SET LOCAL ROLE ${AUDIT_WORKER_ROLE}`);
    assert.equal((await prepareAdminAuditArchive(trx, ledgerId)).state, 'prepared',
      'a durable no-events observation can capture the first subsequent scope');
    await trx.raw('RESET ROLE');
    const oldAction = (await trx.withSchema('admin').table('auditEvents').where({ id: firstSynthetic.id }).first()).action;
    await trx.withSchema('admin').table('auditEvents').where({ id: firstSynthetic.id }).update({ action: 'tampered' });
    await trx.raw(`SET LOCAL ROLE ${AUDIT_WORKER_ROLE}`);
    await assert.rejects(prepareAdminAuditArchive(trx, ledgerId), /preparation_failed/);
    syntheticJob = await trx.withSchema('admin').table('auditArchiveJobs').where({ ledgerId }).first();
    assert.equal(syntheticJob.state, 'failed');
    await trx.raw('RESET ROLE');
    await trx.withSchema('admin').table('auditEvents').where({ id: firstSynthetic.id }).update({ action: oldAction });
    const rewritten = await trx.withSchema('admin').table('auditEvents').where({ id: firstSynthetic.id }).first<AdminAuditRecord>();
    assert.ok(rewritten);
    rewritten.action = 'audit.preparation.rewritten';
    await trx.withSchema('admin').table('auditEvents').where({ id: firstSynthetic.id })
      .update({ action: rewritten.action, hash: hashAdminAuditEvent(rewritten) });
    await trx.raw(`SET LOCAL ROLE ${AUDIT_WORKER_ROLE}`);
    await assert.rejects(prepareAdminAuditArchive(trx, ledgerId), /evidence_changed/);
    await assert.rejects(prepareAdminAuditArchive(trx, ledgerId), /evidence_changed/,
      'a failed attempt must not erase the prior successful digest baseline');
    await trx.raw('RESET ROLE');
    await trx.rollback();
  });

  await owner.transaction(async trx => {
    await trx.withSchema('admin').table('auditEvents').delete();
    await appendAdminAuditEvent(trx, {
      staffUserId: null, staffRole: 'bootstrap', action: 'audit.preparation.synthetic',
      targetType: 'audit_rehearsal', targetId: ledgerId, after: { evidence: 'x'.repeat(32 * 1024 * 1024) },
    });
    await trx.raw(`SET LOCAL ROLE ${AUDIT_WORKER_ROLE}`);
    await assert.rejects(prepareAdminAuditArchive(trx, ledgerId), /preparation_failed/);
    const oversized = await trx.withSchema('admin').table('auditArchiveJobs').where({ ledgerId }).first();
    assert.equal(oversized.state, 'failed');
    assert.equal(oversized.checkpoint, null);
    await trx.raw('RESET ROLE');
    await trx.withSchema('admin').table('auditArchiveAttempts').where({ jobId: oversized.id }).delete();
    await trx.withSchema('admin').table('auditArchiveJobs').where({ id: oversized.id }).delete();
    const record = await trx.withSchema('admin').table('auditEvents').first<AdminAuditRecord>();
    assert.ok(record);
    record.after = { evidence: '' };
    const overhead = Buffer.byteLength(`${serializeAdminAuditRecord(record)}\n`, 'utf8');
    record.after = { evidence: 'x'.repeat(AUDIT_PREPARATION_LIMITS.maxBytes - overhead) };
    record.hash = hashAdminAuditEvent(record);
    assert.equal(Buffer.byteLength(`${serializeAdminAuditRecord(record)}\n`, 'utf8'), AUDIT_PREPARATION_LIMITS.maxBytes);
    await trx.withSchema('admin').table('auditEvents').where({ id: record.id })
      .update({ after: record.after, hash: record.hash });
    await trx.raw(`SET LOCAL ROLE ${AUDIT_WORKER_ROLE}`);
    const exactBytes = await prepareAdminAuditArchive(trx, ledgerId);
    assert.equal(exactBytes.state, 'prepared');
    if (exactBytes.state !== 'prepared') throw new Error('Exactly 32 MiB must prepare.');
    assert.equal(exactBytes.archive.ndjson.length, AUDIT_PREPARATION_LIMITS.maxBytes);
    await trx.raw('RESET ROLE');
    await trx.rollback();
  });

  await owner.transaction(async trx => {
    await trx.withSchema('admin').table('auditEvents').delete();
    const template: AdminAuditRecord = {
      sequence: '1', id: 'synthetic-1', occurredAt: '2026-10-30T00:00:00.000Z',
      staffUserId: null, staffRole: 'bootstrap', action: 'audit.synthetic', targetType: 'audit',
      targetId: ledgerId, workspaceId: null, reason: null, before: null, after: null,
      requestId: ledgerId, ipAddress: null, userAgent: null, prevHash: null, hash: '',
    };
    let previous: string | null = null;
    for (let offset = 0; offset < 50_001; offset += 500) {
      const batch: AdminAuditRecord[] = [];
      for (let index = offset; index < Math.min(offset + 500, 50_001); index++) {
        const record: AdminAuditRecord = { ...template, sequence: String(index + 1), id: `synthetic-${index + 1}`, prevHash: previous };
        record.hash = hashAdminAuditEvent(record);
        previous = record.hash;
        batch.push(record);
      }
      await trx.withSchema('admin').table('auditEvents').insert(batch);
    }
    await trx.raw(`SET LOCAL ROLE ${AUDIT_WORKER_ROLE}`);
    await assert.rejects(prepareAdminAuditArchive(trx, ledgerId), /preparation_failed/);
    const overCount = await trx.withSchema('admin').table('auditArchiveJobs').where({ ledgerId }).first();
    assert.equal(overCount.state, 'failed');
    await trx.raw('RESET ROLE');
    await trx.withSchema('admin').table('auditArchiveAttempts').where({ jobId: overCount.id }).delete();
    await trx.withSchema('admin').table('auditArchiveJobs').where({ id: overCount.id }).delete();
    await trx.withSchema('admin').table('auditEvents').where({ sequence: '50001' }).delete();
    await trx.raw(`SET LOCAL ROLE ${AUDIT_WORKER_ROLE}`);
    const exactCount = await prepareAdminAuditArchive(trx, ledgerId);
    assert.equal(exactCount.state, 'prepared');
    if (exactCount.state !== 'prepared') throw new Error('Exactly 50,000 must prepare.');
    assert.equal(JSON.parse(exactCount.archive.checkpoint.toString()).eventCount, 50_000);
    const realNow = Date.now;
    let calls = 0;
    try {
      Date.now = () => realNow() + calls++ * 60_000;
      await assert.rejects(prepareAdminAuditArchive(trx, ledgerId), /deadline_exceeded/);
    } finally { Date.now = realNow; }
    assert.equal((await trx.withSchema('admin').table('auditArchiveJobs').where({ ledgerId }).first()).state, 'failed');
    await trx.raw('RESET ROLE');
    await trx.rollback();
  });

  // Use the existing fictional chain, but ensure even a fresh test database is nonempty.
  await owner.transaction(trx => appendAdminAuditEvent(trx, {
    staffUserId: null, staffRole: 'bootstrap', action: 'audit.preparation.rehearsal',
    targetType: 'audit_rehearsal', targetId: ledgerId,
  }));
  const first = await prepareAdminAuditArchive(worker, ledgerId);
  assert.equal(first.state, 'prepared');
  if (first.state !== 'prepared') throw new Error('Expected prepared fixture.');
  jobId = first.jobId;
  const originalScope = (await owner.withSchema('admin').table('auditArchiveJobs').where({ id: jobId }).first()).scope;
  await owner.transaction(trx => appendAdminAuditEvent(trx, {
    staffUserId: null, staffRole: 'bootstrap', action: 'audit.preparation.backdated',
    targetType: 'audit_rehearsal', targetId: ledgerId, occurredAt: new Date('2026-01-01T00:00:00.000Z'),
  }));
  const second = await prepareAdminAuditArchive(worker, ledgerId);
  assert.equal(second.state, 'prepared');
  if (second.state !== 'prepared') throw new Error('Expected retry fixture.');
  assert.deepEqual(second.archive, first.archive, 'new/backdated appends cannot change captured retry scope');
  assert.equal(second.attempt, 2);

  lockConnection = await owner.client.acquireConnection();
  await owner.raw('SELECT pg_advisory_lock(hashtextextended(?, 0))', [AUDIT_PREPARATION_LOCK]).connection(lockConnection);
  await assert.rejects(prepareAdminAuditArchive(worker, ledgerId), /busy/);
  assert.equal((await owner.withSchema('admin').table('auditArchiveJobs').where({ id: jobId }).first()).attempts, 2);
  await owner.raw('SELECT pg_advisory_unlock(hashtextextended(?, 0))', [AUDIT_PREPARATION_LOCK]).connection(lockConnection);
  await owner.client.releaseConnection(lockConnection);
  lockConnection = undefined;

  await owner.withSchema('admin').table('auditArchiveJobs').where({ id: jobId })
    .update({ state: 'preparing', attempts: 3, checkpoint: null, checkpointSHA256: null });
  await owner.withSchema('admin').table('auditArchiveAttempts').insert({
    id: randomUUID(), jobId, attempt: 3, state: 'preparing',
  });
  const recovered = await prepareAdminAuditArchive(worker, ledgerId);
  assert.equal(recovered.state, 'prepared');
  const interrupted = await owner.withSchema('admin').table('auditArchiveAttempts').where({ jobId, attempt: 3 }).first();
  assert.equal(interrupted.state, 'interrupted');
  assert.equal(interrupted.failureCode, 'worker_interrupted');
  assert.ok(interrupted.finishedAt);
  assert.equal((await owner.withSchema('admin').table('auditArchiveJobs').where({ id: jobId }).first()).attempts, 4);

  // A failed final commit must roll back both success writes, then durably record failure.
  await owner.raw(`CREATE FUNCTION admin.audit_preparation_rehearsal_failure() RETURNS trigger
    LANGUAGE plpgsql AS $$ BEGIN
      IF NEW."state" = 'prepared' AND NEW."ledgerId" = '${ledgerId}'::uuid THEN
        RAISE EXCEPTION 'Injected rehearsal failure';
      END IF;
      RETURN NEW;
    END $$`);
  await owner.raw(`CREATE TRIGGER audit_preparation_rehearsal_failure BEFORE UPDATE ON admin."auditArchiveJobs"
    FOR EACH ROW EXECUTE FUNCTION admin.audit_preparation_rehearsal_failure()`);
  triggerCreated = true;
  await assert.rejects(prepareAdminAuditArchive(worker, ledgerId), /preparation_failed/);
  const failed = await owner.withSchema('admin').table('auditArchiveJobs').where({ id: jobId }).first();
  assert.equal(failed.state, 'failed');
  assert.equal(failed.checkpoint, null);
  assert.equal(failed.checkpointSHA256, null);
  assert.deepEqual(failed.scope, originalScope);
  const failedAttempt = await owner.withSchema('admin').table('auditArchiveAttempts').where({ jobId, attempt: 5 }).first();
  assert.equal(failedAttempt.state, 'failed');
  assert.equal(failedAttempt.failureCode, 'preparation_failed');
  assert.equal(failedAttempt.checkpoint, null);
  await owner.raw('DROP TRIGGER audit_preparation_rehearsal_failure ON admin."auditArchiveJobs"');
  await owner.raw('DROP FUNCTION admin.audit_preparation_rehearsal_failure()');
  triggerCreated = false;
  assert.equal((await prepareAdminAuditArchive(worker, ledgerId)).state, 'prepared');
  await assert.rejects(prepareAdminAuditArchive(worker, randomUUID()), /different archive ledger/);
  assert.deepEqual(AUDIT_PREPARATION_LIMITS, { maxEvents: 50_000, maxBytes: 33_554_432 });
  if (createdRole) {
    const password = randomBytes(32).toString('base64url');
    await owner.raw(`ALTER ROLE ${AUDIT_WORKER_ROLE} LOGIN PASSWORD ${pg.escapeLiteral(password)}`);
    const runtimeURL = new URL(ownerURL);
    runtimeURL.username = AUDIT_WORKER_ROLE;
    runtimeURL.password = password;
    const child = spawnSync(process.execPath, [
      '--import', 'tsx', fileURLToPath(new URL('../../../apps/audit-worker/src/index.ts', import.meta.url)),
    ], {
      env: { ...process.env, NODE_ENV: 'test', ADMIN_AUDIT_DATABASE_URL: runtimeURL.toString(), ADMIN_AUDIT_LEDGER_ID: ledgerId },
      encoding: 'utf8', timeout: 90_000,
    });
    assert.equal(child.status, 0, 'real one-shot CLI must succeed with a dedicated login');
    assert.equal(child.stdout.includes(password) || child.stderr.includes(password), false);
    const report = JSON.parse(child.stdout.trim());
    assert.equal(report.state, 'prepared');
    assert.equal(report.copied, false);
    assert.equal(report.externallyVerified, false);
  }
  console.log('Audit preparation database rehearsal passed (migration replay, least privilege, no-events, tampering/baseline preservation, 50,000/50,001, oversize/deadline, deterministic retries, durable failure/recovery, concurrency).');
} finally {
  if (lockConnection) {
    await owner.raw('SELECT pg_advisory_unlock(hashtextextended(?, 0))', [AUDIT_PREPARATION_LOCK]).connection(lockConnection);
    await owner.client.releaseConnection(lockConnection);
  }
  await worker.destroy();
  if (triggerCreated) {
    await owner.raw('DROP TRIGGER audit_preparation_rehearsal_failure ON admin."auditArchiveJobs"');
    await owner.raw('DROP FUNCTION admin.audit_preparation_rehearsal_failure()');
  }
  if (jobId) {
    await owner.withSchema('admin').table('auditArchiveAttempts').where({ jobId }).delete();
    await owner.withSchema('admin').table('auditArchiveJobs').where({ id: jobId }).delete();
  }
  if (createdRole) {
    await owner.raw(`DROP OWNED BY ${AUDIT_WORKER_ROLE}`);
    await owner.raw(`DROP ROLE ${AUDIT_WORKER_ROLE}`);
  }
  await owner.destroy();
}
