// Allocates a fresh local DB and fictional Google app credentials. Never reads a mailbox.
import { readFileSync, writeFileSync } from 'node:fs';
import { randomBytes, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
process.loadEnvFile(fileURLToPath(new URL('../.env.local', import.meta.url)));
const require = createRequire(new URL('../packages/data/package.json', import.meta.url)), knex = require('knex');
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') || !['127.0.0.1', 'localhost'].includes(new URL(connection).hostname)) throw Error('A separate local test DB is required.');
const name = `gmail_browser_${randomUUID().replaceAll('-', '')}_test`, owner = knex({ client: 'pg', connection }), url = new URL(connection); url.pathname = `/${name}`;
const runtime = new URL(url); runtime.searchParams.set('options', '-c role=salesmora_web');
const nextEnv = fileURLToPath(new URL('../apps/web/next-env.d.ts', import.meta.url)), previous = readFileSync(nextEnv, 'utf8');
const workspaceId = randomUUID(), origin = 'http://127.0.0.1:3027'; let created = false;
try {
  await owner.raw('CREATE DATABASE ??', [name]); created = true;
  const child = spawn('pnpm', ['--filter', '@salesmora/web', 'exec', 'playwright', 'test', 'lead-capture-gmail.spec.ts', '--reporter=line'], { cwd: fileURLToPath(new URL('..', import.meta.url)), stdio: 'inherit', env: { ...process.env, TEST_DATABASE_URL: url.toString(), TEST_APP_DATABASE_URL: runtime.toString(), DATABASE_ROLE_ENFORCED: 'true', SALESMORA_E2E_ORIGIN: origin, SALESMORA_E2E_DIST_DIR: '.next-e2e-capture-gmail', SALESMORA_GMAIL_TEST_WORKSPACE: workspaceId, CAPTURE_GMAIL_CONNECTIONS_ENABLED: 'true', CAPTURE_GMAIL_ENVIRONMENT: 'local', CAPTURE_GMAIL_WORKSPACE_IDS: workspaceId, CAPTURE_GMAIL_CLIENT_ID: 'fictional.apps.googleusercontent.com', CAPTURE_GMAIL_CLIENT_SECRET: 'fictional-secret', CAPTURE_GMAIL_REDIRECT_URI: `${origin}/api/lead-capture/gmail/oauth/callback`, CAPTURE_GMAIL_ACTIVE_KEY_ID: 'test', CAPTURE_GMAIL_CREDENTIAL_KEYS: JSON.stringify({ test: randomBytes(32).toString('base64') }), CAPTURE_SUBMISSIONS_ENABLED: 'false', CAPTURE_WEBSITE_PUBLICATION_ENABLED: 'false', CAPTURE_SCHEDULER_ENABLED: 'false' } });
  process.exitCode = await new Promise(resolve => child.on('exit', code => resolve(code ?? 1)));
} finally {
  const current = readFileSync(nextEnv, 'utf8');
  if (current.includes('./.next-e2e-capture-gmail/dev/types/routes.d.ts')) writeFileSync(nextEnv, current.replace('./.next-e2e-capture-gmail/dev/types/routes.d.ts', previous.match(/import "([^"]*types\/routes\.d\.ts)";/)?.[1] ?? './.next/dev/types/routes.d.ts'));
  if (created) await owner.raw('DROP DATABASE ?? WITH (FORCE)', [name]); await owner.destroy();
}
