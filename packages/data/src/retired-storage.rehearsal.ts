import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDatabase } from './database';
import { migrateFreshBaseline } from './baseline-runner';
import { down as rollbackBaseline } from './baseline-migrations/202611150001_fresh_baseline';
import { initializeProposalStorage, legacyProposalSources } from './proposal-storage-authority';

const env = fileURLToPath(new URL('../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname))
  throw new Error('Retired storage rehearsal requires a separate local test database.');

const name = `retired_storage_${randomUUID().replaceAll('-', '')}_test`;
const url = new URL(connection); url.pathname = `/${name}`;
const owner = createDatabase(connection), db = createDatabase(url.toString());
const checkpoints = ['checkpoint_blobs', 'checkpoint_writes', 'checkpoints', 'checkpoint_migrations'];
let created = false;
try {
  await owner.raw('CREATE DATABASE ??', [name]); created = true;
  await migrateFreshBaseline(db);
  const legacyTables = new Set(legacyProposalSources.flatMap(([, table, audit]) => audit ? [table, audit] : [table]));
  assert.equal(legacyTables.size, 26);
  for (const table of [...legacyTables, ...checkpoints, 'fileLinks'])
    assert.equal(await db.schema.hasTable(table), false, `${table} must not exist on a fresh baseline`);
  for (const table of ['chatThreads', 'chatTurns', 'chatMessages', 'chatProposals', 'chatProposalAudit',
    'files', 'fileEvents', 'workspaceStorageUsage'])
    assert.equal(await db.schema.hasTable(table), true, `${table} must remain available`);
  for (const table of ['auditEvents', 'auditArchiveJobs', 'auditArchiveCopies', 'auditArchiveChecks'])
    assert.equal(await db.schema.withSchema('admin').hasTable(table), true, `admin.${table} must remain available`);
  assert.equal(await initializeProposalStorage(db), 'canonical');
  await db.schema.createTable('checkpoints', table => table.uuid('id').primary());
  await assert.rejects(initializeProposalStorage(db), /checkpoint retirement/);
  await db.schema.dropTable('checkpoints');
  await assert.rejects(rollbackBaseline(), /forward-only/);
  assert.equal(await initializeProposalStorage(db), 'canonical');
  console.log('Fresh baseline excludes retired storage, preserves canonical data stores and rejects checkpoints.');
} finally {
  await db.destroy();
  try { if (created) await owner.raw('DROP DATABASE ??', [name]); } finally { await owner.destroy(); }
}
