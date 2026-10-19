// Validate a private restore in a disposable container BEFORE changing the original volume.
import { execFileSync } from 'node:child_process';
import { openSync, closeSync } from 'node:fs';
import assert from 'node:assert/strict';
const backup = process.argv[2];
if (!backup?.startsWith(`${process.cwd()}/.local/backups/`) || !backup.endsWith('.dump')) throw Error('Provide a private local backup path');
const name = `salesmora-vector-rehearsal-${Date.now()}`;
const tables = ['users', 'workspaces', 'workspaceMemberships', 'workspaceInvitations', 'leads'];
const sql = tables.map(table => `SELECT '${table}', count(*), md5(coalesce(jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)::text)::text, '[]')) FROM "${table}" t`).join(' UNION ALL ');
const docker = args => execFileSync('docker', args, { stdio: ['ignore', 'pipe', 'pipe'] });
const before = docker(['compose', '--env-file', '.env.local', 'exec', '-T', 'postgres', 'psql', '-U', 'salesmora', '-d', 'salesmora', '-At', '-c', sql]).toString();
try {
  docker(['run', '-d', '--name', name, '-e', 'POSTGRES_HOST_AUTH_METHOD=trust', '-e', 'POSTGRES_USER=salesmora', '-e', 'POSTGRES_DB=restore_test', '-p', '127.0.0.1:55439:5432', 'salesmora-postgres:17-pgvector-0.8.7']);
  for (let attempt = 0; ; attempt++) {
    try { docker(['exec', name, 'pg_isready', '-U', 'salesmora', '-d', 'restore_test']); break; }
    catch { if (attempt >= 30) throw Error('Restore server did not become ready'); await new Promise(resolve => setTimeout(resolve, 500)); }
  }
  const fd = openSync(backup, 'r');
  try { execFileSync('docker', ['exec', '-i', name, 'pg_restore', '-U', 'salesmora', '-d', 'restore_test', '--no-owner', '--exit-on-error'], { stdio: [fd, 'ignore', 'pipe'] }); }
  finally { closeSync(fd); }
  const restored = docker(['exec', name, 'psql', '-U', 'salesmora', '-d', 'restore_test', '-At', '-c', sql]).toString();
  assert.equal(restored, before, 'Restored account and CRM records must match');
  execFileSync(process.execPath, ['--import', 'tsx', 'src/migrate.ts', '--test'], { cwd: `${process.cwd()}/packages/data`, env: { ...process.env, TEST_DATABASE_URL: 'postgresql://salesmora@127.0.0.1:55439/restore_test' }, stdio: ['ignore', 'pipe', 'pipe'] });
  assert.equal(docker(['exec', name, 'psql', '-U', 'salesmora', '-d', 'restore_test', '-At', '-c', "SELECT extversion FROM pg_extension WHERE extname='vector'"]).toString().trim(), '0.8.7');
  assert.equal(docker(['exec', name, 'psql', '-U', 'salesmora', '-d', 'restore_test', '-At', '-c', sql]).toString(), before);
  console.log('PASS private restore, pgvector 0.8.7, latest migrations and unchanged account/CRM records.');
} finally { docker(['rm', '-f', '-v', name]); }
