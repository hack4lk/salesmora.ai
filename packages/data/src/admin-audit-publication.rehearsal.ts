import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import knex from 'knex';
import pg from 'pg';
import { createDatabase } from './database';
import { appendAdminAuditEvent, verifyAdminAuditChain } from './admin-audit';
import { createAuditBaselineStore } from './admin-audit-baseline';
import { copyNextAdminAuditArchive, verifyNextAdminAuditArchive } from './admin-audit-publication';
import { AUDIT_PREPARATION_LOCK, assertAuditWorkerRole } from './admin-audit-preparation';
import { AUDIT_WORKER_ROLE, AUDIT_VERIFIER_ROLE, applyAuditWorkerGrants } from './runtime-roles';
import { up, down } from './migrations/202610310001_admin_audit_publication';
import type { AuditArchiveReader, AuditArchiveWriter, AuditArchiveLockReader, AuditStoredObject } from './admin-audit-delivery';

const envFile = fileURLToPath(new URL('../../../.env.local', import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);
const ownerURL = process.env.TEST_DATABASE_URL;
if (!ownerURL || !['localhost', '127.0.0.1'].includes(new URL(ownerURL).hostname) ||
  !new URL(ownerURL).pathname.endsWith('_test') || ownerURL === process.env.DATABASE_URL) {
  throw new Error('Publication rehearsal requires the isolated local test database.');
}
const owner = createDatabase(ownerURL);
function roleDatabase(role: string) {
  return knex({ client: 'pg', connection: ownerURL, pool: { min: 0, max: 2,
    afterCreate(connection: pg.Client, done: (error: Error | null, connection: pg.Client) => void) {
      connection.query(`SET ROLE ${role}`, error => done(error, connection));
    },
  } });
}
const worker = roleDatabase(AUDIT_WORKER_ROLE), verifier = roleDatabase(AUDIT_VERIFIER_ROLE);
const createdRoles: string[] = [];
const directory = await mkdtemp(join(tmpdir(), 'salesmora-publication-rehearsal-'));
const stateDirectory = join(directory, 'private');
const baseline = await createAuditBaselineStore(stateDirectory);
const ledgerId = randomUUID();
const target = { accountId: 'a'.repeat(32), bucket: 'audit-fictional-only', jurisdiction: 'default' as const };
const objects = new Map<string, AuditStoredObject>();
let failCheckpoint = false;
let protection = true;
let reads = 0, writes = 0;
const reader: AuditArchiveReader = { target, async get(key, max, signal) {
  signal.throwIfAborted(); reads++;
  const object = objects.get(key);
  if (!object) return null;
  if (object.bytes.length > max) throw new Error('Fixture exceeds read limit.');
  return { ...object, bytes: Buffer.from(object.bytes) };
} };
const writer: AuditArchiveWriter = { target, async create(key, bytes, _contentType, signal) {
  signal.throwIfAborted(); writes++;
  if (failCheckpoint && key.endsWith('.json')) throw new Error('Injected checkpoint failure.');
  if (!objects.has(key)) objects.set(key, { bytes: Buffer.from(bytes), uploadedAt: new Date().toISOString() });
  return 'created';
} };
const locks: AuditArchiveLockReader = { target, async rules(signal) {
  signal.throwIfAborted();
  return protection ? [{ id: 'fictional-year', enabled: true, condition: { type: 'Age', maxAgeSeconds: 31_536_000 } }] : [];
} };
const copy = () => copyNextAdminAuditArchive(worker, ledgerId, writer, reader, locks);
const verify = () => verifyNextAdminAuditArchive(verifier, ledgerId, reader, locks, baseline);
let trigger = false;
let lockConnection: Awaited<ReturnType<typeof owner.client.acquireConnection>> | undefined;

try {
  for (const role of [AUDIT_WORKER_ROLE, AUDIT_VERIFIER_ROLE]) {
    if (!await owner('pg_roles').where({ rolname: role }).first()) {
      await owner.raw(`CREATE ROLE ${role} NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS NOINHERIT`);
      createdRoles.push(role);
    }
  }
  await owner.transaction(async trx => {
    if (await trx.schema.withSchema('admin').hasTable('auditArchiveCopies')) {
      assert.equal((await trx.withSchema('admin').table('auditArchiveCopies').count<{ count: string }[]>('* AS count'))[0].count, '0');
      await down(trx);
    }
    await up(trx); await down(trx); await up(trx); await trx.rollback();
  });
  const migration = {
    name: '202610310001_admin_audit_publication.ts',
    directory: fileURLToPath(new URL('./migrations', import.meta.url)), loadExtensions: ['.ts'],
  };
  if (await owner('knex_migrations').where({ name: migration.name }).first()) {
    await owner.migrate.down(migration);
  }
  await owner.migrate.up(migration);
  await applyAuditWorkerGrants(owner);
  await assertAuditWorkerRole(worker);
  await assertAuditWorkerRole(verifier, true);
  await assert.rejects(assertAuditWorkerRole(worker, true), /dedicated/);
  await assert.rejects(worker.withSchema('admin').table('auditArchiveChecks').insert({ id: randomUUID() }), { code: '42501' });
  await assert.rejects(worker.withSchema('admin').table('auditArchiveCopies').whereRaw('false').update({ scope: {} }), { code: '42501' });
  await assert.rejects(verifier.withSchema('admin').table('auditArchiveCopies').whereRaw('false').update({ state: 'copied' }), { code: '42501' });
  await assert.rejects(verifier.withSchema('admin').table('auditArchiveChecks').whereRaw('false').delete(), { code: '42501' });
  await assert.rejects(verifier.withSchema('admin').table('staffUsers').select('*'), { code: '42501' });
  assert.equal((await verifyAdminAuditChain(owner)).valid, true);
  await owner.transaction(trx => appendAdminAuditEvent(trx, {
    staffUserId: null, staffRole: 'bootstrap', action: 'audit.publication.fixture', targetType: 'fixture', targetId: ledgerId,
  }));
  const first = await copy();
  assert.equal(first.state, 'copied');
  if (first.state !== 'copied') throw new Error('Expected first copy.');
  assert.equal((await copy()).state, 'awaiting_verifier');
  assert.equal(await baseline.latest(), null);
  const later = await owner.transaction(trx => appendAdminAuditEvent(trx, {
    staffUserId: null, staffRole: 'bootstrap', action: 'audit.publication.backdated',
    targetType: 'fixture', targetId: ledgerId, occurredAt: new Date('2026-01-01T00:00:00.000Z'),
  }));

  // The filesystem commit succeeds, but database acceptance is injected to fail.
  await owner.raw(`CREATE FUNCTION admin.publication_rehearsal_failure() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN IF NEW."state" = 'accepted' THEN RAISE EXCEPTION 'Injected acceptance commit failure'; END IF; RETURN NEW; END $$`);
  await owner.raw(`CREATE TRIGGER publication_rehearsal_failure BEFORE INSERT ON admin."auditArchiveChecks"
    FOR EACH ROW EXECUTE FUNCTION admin.publication_rehearsal_failure()`);
  trigger = true;
  await assert.rejects(verify(), /operation_failed/);
  assert.ok(await baseline.latest(), 'retained checkpoint survives a failed DB acknowledgement');
  assert.equal((await owner.withSchema('admin').table('auditArchiveChecks').where({ copyId: first.copyId }).first()).state, 'failed');
  await assert.rejects(copy(), /verification_failed/);
  await owner.raw('DROP TRIGGER publication_rehearsal_failure ON admin."auditArchiveChecks"');
  await owner.raw('DROP FUNCTION admin.publication_rehearsal_failure()');
  trigger = false;
  assert.equal((await verify()).state, 'accepted');
  const acceptedFirst = await baseline.latest();
  assert.ok(acceptedFirst);
  assert.notEqual(acceptedFirst.scope.throughSequence, later.sequence);

  failCheckpoint = true;
  await assert.rejects(copy(), /operation_failed/);
  const pending = await owner.withSchema('admin').table('auditArchiveCopies').orderBy('throughSequence', 'desc').first();
  assert.equal(pending.state, 'failed');
  assert.equal((await verify()).state, 'awaiting_copy', 'an incomplete copy must not poison retry eligibility');
  assert.equal(pending.scope.previousCheckpoint.checkpointSHA256, acceptedFirst.checkpointSHA256);
  const writesBefore = writes;
  await owner.withSchema('admin').table('auditArchiveCopies').where({ id: pending.id })
    .update({ state: 'copying', attempts: 2 });
  await owner.withSchema('admin').table('auditArchiveCopyAttempts').insert({
    id: randomUUID(), copyId: pending.id, attempt: 2, state: 'copying',
  });
  failCheckpoint = false;
  assert.equal((await copy()).state, 'copied');
  const interrupted = await owner.withSchema('admin').table('auditArchiveCopyAttempts')
    .where({ copyId: pending.id, attempt: 2 }).first();
  assert.equal(interrupted.state, 'interrupted');
  assert.equal(interrupted.failureCode, 'worker_interrupted');
  assert.equal(writes - writesBefore, 1, 'retry reuses the orphaned segment and writes only its checkpoint');
  assert.equal((await copy()).state, 'awaiting_verifier');
  assert.equal((await verify()).state, 'accepted');
  assert.equal((await baseline.latest())?.scope.throughSequence, later.sequence);
  assert.equal((await copy()).state, 'no_events');
  assert.equal((await readdir(stateDirectory)).filter(name => name.endsWith('.json')).length, 2);

  // The verifier independently checks protection again and failure blocks new publication.
  protection = false;
  await assert.rejects(verify(), /lock_insufficient/);
  await assert.rejects(copy(), /verification_failed/);
  protection = true;
  assert.equal((await verify()).state, 'accepted');
  const emptyBaseline = await createAuditBaselineStore(join(directory, 'lost'));
  await assert.rejects(verifyNextAdminAuditArchive(verifier, ledgerId, reader, locks, emptyBaseline), /verifier_baseline_missing/);
  await owner.transaction(async trx => {
    await trx.withSchema('admin').table('auditEvents').where({ sequence: later.sequence }).delete();
    await trx.raw(`SET LOCAL ROLE ${AUDIT_VERIFIER_ROLE}`);
    await assert.rejects(verifyNextAdminAuditArchive(trx, ledgerId, reader, locks, baseline), /database_tail_or_head_changed/);
    await trx.raw('RESET ROLE');
    await trx.rollback();
  });
  await owner.transaction(async trx => {
    await trx.withSchema('admin').table('auditArchiveCopies').where({ id: pending.id })
      .update({ checkpointSHA256: 'b'.repeat(64) });
    await trx.raw(`SET LOCAL ROLE ${AUDIT_VERIFIER_ROLE}`);
    await assert.rejects(verifyNextAdminAuditArchive(trx, ledgerId, reader, locks, baseline), /retained_database_evidence_missing/);
    await trx.raw('RESET ROLE'); await trx.rollback();
  });
  await owner.transaction(async trx => {
    await appendAdminAuditEvent(trx, {
      staffUserId: null, staffRole: 'bootstrap', action: 'audit.publication.deadline',
      targetType: 'fixture', targetId: ledgerId,
    });
    await trx.raw(`SET LOCAL ROLE ${AUDIT_WORKER_ROLE}`);
    const original = reader.get;
    const now = Date.now;
    try {
      reader.get = async (...args) => {
        const result = await original(...args);
        Date.now = () => now() + 120_001;
        return result;
      };
      await assert.rejects(copyNextAdminAuditArchive(trx, ledgerId, writer, reader, locks), /deadline_exceeded/);
    } finally { reader.get = original; Date.now = now; }
    const failed = await trx.withSchema('admin').table('auditArchiveCopies').orderBy('throughSequence', 'desc').first();
    assert.equal(failed.state, 'failed');
    assert.equal(failed.failureCode, 'deadline_exceeded');
    await trx.raw('RESET ROLE'); await trx.rollback();
  });

  lockConnection = await owner.client.acquireConnection();
  await owner.raw('SELECT pg_advisory_lock(hashtextextended(?, 0))', [AUDIT_PREPARATION_LOCK]).connection(lockConnection);
  const counts = { reads, writes };
  await assert.rejects(copy(), /busy/);
  await assert.rejects(verify(), /busy/);
  assert.deepEqual({ reads, writes }, counts);
  await owner.raw('SELECT pg_advisory_unlock(hashtextextended(?, 0))', [AUDIT_PREPARATION_LOCK]).connection(lockConnection);
  await owner.client.releaseConnection(lockConnection); lockConnection = undefined;
  if (createdRoles.length === 2) {
    await owner.transaction(trx => appendAdminAuditEvent(trx, {
      staffUserId: null, staffRole: 'bootstrap', action: 'audit.publication.process_fixture',
      targetType: 'fixture', targetId: ledgerId,
    }));
    const credentials = new Map<string, string>();
    for (const role of createdRoles) {
      const password = randomBytes(32).toString('base64url');
      await owner.raw(`ALTER ROLE ${role} LOGIN PASSWORD ${pg.escapeLiteral(password)}`);
      const url = new URL(ownerURL);
      url.username = role; url.password = password;
      credentials.set(role, url.toString());
    }
    const objectFile = join(directory, 'fictional-objects.json');
    await writeFile(objectFile, JSON.stringify([...objects].map(([key, value]) => [
      key, { data: value.bytes.toString('base64'), uploadedAt: value.uploadedAt },
    ])), { mode: 0o600 });
    const moduleURL = new URL('../../../apps/audit-worker/src/publication.ts', import.meta.url).href;
    const childCode = `
      import { readFile, writeFile } from 'node:fs/promises';
      import { runAuditCopyRehearsal, runAuditVerifierRehearsal } from ${JSON.stringify(moduleURL)};
      const path = process.env.FICTIONAL_OBJECT_FILE;
      const objects = new Map(JSON.parse(await readFile(path, 'utf8')));
      const target = ${JSON.stringify(target)};
      const reader = { target, async get(key, max, signal) {
        signal.throwIfAborted();
        const object = objects.get(key);
        if (!object) return null;
        const bytes = Buffer.from(object.data, 'base64');
        if (bytes.length > max) throw Error('Fixture limit exceeded.');
        return { bytes, uploadedAt: object.uploadedAt };
      }};
      const locks = { target, async rules() { return [{
        id: 'fictional-year', enabled: true, condition: { type: 'Age', maxAgeSeconds: 31536000 },
      }]; }};
      const writer = { target, async create(key, bytes) {
        if (!objects.has(key)) objects.set(key, { data: bytes.toString('base64'), uploadedAt: new Date().toISOString() });
        await writeFile(path, JSON.stringify([...objects]), { mode: 0o600 });
        return 'created';
      }};
      const result = process.env.FICTIONAL_MODE === 'copy'
        ? await runAuditCopyRehearsal(process.env, { writer, reader, locks })
        : await runAuditVerifierRehearsal(process.env, { reader, locks });
      console.log(JSON.stringify({ state: result.state }));
    `;
    for (const mode of ['copy', 'verify']) {
      const childEnv: NodeJS.ProcessEnv = {
        PATH: process.env.PATH, NODE_ENV: 'test', ADMIN_AUDIT_REHEARSAL: 'fictional-storage',
        ADMIN_AUDIT_LEDGER_ID: ledgerId, FICTIONAL_MODE: mode, FICTIONAL_OBJECT_FILE: objectFile,
        ...(mode === 'copy'
          ? { ADMIN_AUDIT_DATABASE_URL: credentials.get(AUDIT_WORKER_ROLE) }
          : { ADMIN_AUDIT_VERIFIER_DATABASE_URL: credentials.get(AUDIT_VERIFIER_ROLE),
            ADMIN_AUDIT_VERIFIER_STATE_DIRECTORY: stateDirectory }),
      };
      const child = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', childCode], {
        env: childEnv, encoding: 'utf8', timeout: 150_000,
      });
      assert.equal(child.status, 0, 'separate one-shot rehearsal process must succeed');
      assert.equal(JSON.parse(child.stdout.trim()).state, mode === 'copy' ? 'copied' : 'accepted');
    }
  }
  console.log('Audit publication rehearsal passed (separate roles, verifier-only acceptance, private persistent baseline, partial-copy retry, crash reconciliation, failed protection, tail deletion, concurrent exclusion).');
} finally {
  if (lockConnection) {
    await owner.raw('SELECT pg_advisory_unlock(hashtextextended(?, 0))', [AUDIT_PREPARATION_LOCK]).connection(lockConnection);
    await owner.client.releaseConnection(lockConnection);
  }
  await worker.destroy(); await verifier.destroy();
  if (trigger) {
    await owner.raw('DROP TRIGGER publication_rehearsal_failure ON admin."auditArchiveChecks"');
    await owner.raw('DROP FUNCTION admin.publication_rehearsal_failure()');
  }
  if (await owner.schema.withSchema('admin').hasTable('auditArchiveCopies')) {
    const copies = owner.withSchema('admin').table('auditArchiveCopies').where({ ledgerId }).select('id');
    await owner.withSchema('admin').table('auditArchiveChecks').whereIn('copyId', copies.clone()).delete();
    await owner.withSchema('admin').table('auditArchiveCopyAttempts').whereIn('copyId', copies.clone()).delete();
    await owner.withSchema('admin').table('auditArchiveCopies').where({ ledgerId }).delete();
  }
  for (const role of createdRoles) {
    await owner.raw(`DROP OWNED BY ${role}`); await owner.raw(`DROP ROLE ${role}`);
  }
  await owner.destroy();
  await rm(directory, { recursive: true });
}
