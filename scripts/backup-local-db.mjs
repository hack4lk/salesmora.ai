// Local Docker only. Keeps a private backup; optionally restores/migrates a disposable copy.
import { closeSync, mkdirSync, openSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import assert from 'node:assert/strict';
process.loadEnvFile(fileURLToPath(new URL('../.env.local', import.meta.url)));
const connection = new URL(process.env.DATABASE_URL);
if (!['127.0.0.1', 'localhost'].includes(connection.hostname) || connection.port !== '55432' || connection.pathname !== '/salesmora' || connection.username !== 'salesmora') throw Error('Backup command is restricted to the standard local Docker development database.');
const compose = ['compose', '--env-file', '.env.local', 'exec', '-T', 'postgres'];
function docker(args, options = {}) { return execFileSync('docker', [...compose, ...args], { stdio: ['ignore', 'pipe', 'pipe'], ...options }); }
const directory = fileURLToPath(new URL('../.local/backups/', import.meta.url));
mkdirSync(directory, { recursive: true, mode: 0o700 });
const filename = `${directory}salesmora-before-authorization-${Date.now()}.dump`;
const dumpFd = openSync(filename, 'wx', 0o600);
try { docker(['pg_dump', '-U', 'salesmora', '-Fc', 'salesmora'], { stdio: ['ignore', dumpFd, 'pipe'] }); }
finally { closeSync(dumpFd); }
console.log(`Private local backup saved: ${filename}`);
if (process.argv.includes('--rehearse')) {
  const target = `salesmora_restore_${randomBytes(8).toString('hex')}_test`;
  let created = false;
  const tables = ['users', 'workspaces', 'workspaceMemberships', 'workspaceInvitations', 'leads'];
  function fingerprint(database) {
    const sql = tables.map(table => `SELECT '${table}', count(*), md5(coalesce(jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)::text)::text, '[]')) FROM "${table}" t`).join(' UNION ALL ');
    return docker(['psql', '-U', 'salesmora', '-d', database, '-At', '-v', 'ON_ERROR_STOP=1', '-c', sql]).toString();
  }
  try {
    const before = fingerprint('salesmora');
    docker(['createdb', '-U', 'salesmora', target]); created = true;
    const readFd = openSync(filename, 'r');
    try { docker(['pg_restore', '-U', 'salesmora', '-d', target, '--exit-on-error', '--no-owner'], { stdio: [readFd, 'ignore', 'pipe'] }); }
    finally { closeSync(readFd); }
    assert.equal(fingerprint(target), before, 'Restored rows must match the source snapshot');
    const testURL = new URL(connection); testURL.pathname = `/${target}`;
    execFileSync(process.execPath, ['--import', 'tsx', 'src/migrate.ts', '--test'], {
      cwd: fileURLToPath(new URL('../packages/data/', import.meta.url)),
      env: { ...process.env, TEST_DATABASE_URL: testURL.href }, stdio: ['ignore', 'pipe', 'pipe'],
    });
    const checkpointTables = docker(['psql', '-U', 'salesmora', '-d', target, '-At', '-v', 'ON_ERROR_STOP=1', '-c', "SELECT count(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('checkpoints','checkpoint_blobs','checkpoint_writes','checkpoint_migrations')"]).toString().trim();
    assert.equal(checkpointTables, '4', 'Checkpoint setup must target the restored database');
    const invalid = docker(['psql', '-U', 'salesmora', '-d', target, '-At', '-v', 'ON_ERROR_STOP=1', '-c', `SELECT count(*) FROM workspaces w WHERE (SELECT count(*) FROM "workspaceMemberships" m WHERE m."workspaceId" = w.id AND m.role = 'owner' AND m."userId" = w."ownerId") <> 1 OR NOT EXISTS (SELECT 1 FROM "workspacePolicies" p WHERE p."workspaceId" = w.id)`]).toString().trim();
    assert.equal(invalid, '0');
    const profiles = docker(['psql', '-U', 'salesmora', '-d', target, '-At', '-c', `SELECT count(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name IN ('workspaceMemberships', 'workspaceInvitations') AND column_name = 'profile'`]).toString().trim();
    assert.equal(profiles, '0');
    console.log('PASS backup restore matches source records; copied database migrates with matching Owners and saved policies.');
  } finally { if (created) docker(['dropdb', '-U', 'salesmora', '--force', target]); }
}
