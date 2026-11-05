// Fresh local database only; this harness never migrates or resets a configured database.
import { readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
process.loadEnvFile(fileURLToPath(new URL('../.env.local', import.meta.url)));
const require = createRequire(new URL('../packages/data/package.json', import.meta.url)), knex = require('knex');
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') || !['127.0.0.1', 'localhost'].includes(new URL(connection).hostname)) throw Error('A separate local test connection is required.');
const name = `capture_assistant_ui_${randomUUID().replaceAll('-', '')}_test`, owner = knex({ client: 'pg', connection }), url = new URL(connection); url.pathname = `/${name}`;
const runtime = new URL(url); runtime.searchParams.set('options', '-c role=salesmora_web');
const nextEnv = fileURLToPath(new URL('../apps/web/next-env.d.ts', import.meta.url)), previous = readFileSync(nextEnv, 'utf8');
// Reuse only this harness's development compilation cache; --clean explicitly rebuilds it.
if (process.argv.includes('--clean')) rmSync(fileURLToPath(new URL('../apps/web/.next-e2e-capture-assistant', import.meta.url)), { recursive: true, force: true });
mkdirSync(fileURLToPath(new URL('../.local/releases/capture-assistant-read-20261102/', import.meta.url)), { recursive: true });
const grepIndex = process.argv.indexOf('--grep'), grep = grepIndex >= 0 ? process.argv[grepIndex + 1] : undefined;
if (grepIndex >= 0 && !grep) throw Error('--grep requires a test title pattern.');
let created = false;
try {
  await owner.raw('CREATE DATABASE ??', [name]); created = true;
  const child = spawn('pnpm', ['--filter', '@salesmora/web', 'exec', 'playwright', 'test', 'chat-lead-capture.spec.ts', '--reporter=line', ...(grep ? ['--grep', grep] : [])], { stdio: 'inherit', cwd: fileURLToPath(new URL('..', import.meta.url)), env: { ...process.env, TEST_DATABASE_URL: url.toString(), TEST_APP_DATABASE_URL: runtime.toString(), DATABASE_ROLE_ENFORCED: 'true', CAPTURE_SUBMISSIONS_ENABLED: 'false', CAPTURE_WEBSITE_PUBLICATION_ENABLED: 'false', CAPTURE_SCHEDULER_ENABLED: 'false', SALESMORA_E2E_ORIGIN: 'http://127.0.0.1:3026', SALESMORA_E2E_DIST_DIR: '.next-e2e-capture-assistant' } });
  process.exitCode = await new Promise(resolve => child.on('exit', code => resolve(code ?? 1)));
} finally {
  const current = readFileSync(nextEnv, 'utf8'), generated = './.next-e2e-capture-assistant/dev/types/routes.d.ts';
  if (current.includes(generated)) writeFileSync(nextEnv, current.replace(generated, previous.match(/import "([^"]*types\/routes\.d\.ts)";/)?.[1] ?? './.next/dev/types/routes.d.ts'));
  if (created) await owner.raw('DROP DATABASE ?? WITH (FORCE)', [name]); await owner.destroy();
}
