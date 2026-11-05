// Allocate an isolated local database for this slice; never migrate or truncate a configured database.
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { randomBytes, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
process.loadEnvFile(fileURLToPath(new URL('../.env.local', import.meta.url)));
const require = createRequire(new URL('../packages/data/package.json', import.meta.url));
const knex = require('knex');
const target = process.env.TEST_DATABASE_URL;
if (!target || !new URL(target).pathname.endsWith('_test') || target === process.env.DATABASE_URL || !['127.0.0.1', 'localhost'].includes(new URL(target).hostname)) throw Error('A separate local test connection is required.');
const name = `capture_ui_${randomUUID().replaceAll('-', '')}_test`, owner = knex({ client: 'pg', connection: target });
const url = new URL(target); url.pathname = `/${name}`;
const runtime = new URL(url); runtime.searchParams.set('options', '-c role=salesmora_web');
const nextEnv = fileURLToPath(new URL('../apps/web/next-env.d.ts', import.meta.url));
const lifecycle = process.argv.includes('--lifecycle'), activation = process.argv.includes('--activation');
if (activation) rmSync(fileURLToPath(new URL('../apps/web/.next-e2e-capture-activation', import.meta.url)), { recursive: true, force: true });
const activationScope = Array.from({ length: 3 }, () => randomUUID()).join(',');
const activationEnv = activation ? { CAPTURE_WEBSITE_PUBLICATION_ENABLED: 'true', CAPTURE_PUBLICATION_WORKSPACE_IDS: activationScope, CAPTURE_SUBMISSIONS_ENABLED: 'true', CAPTURE_PUBLIC_ORIGIN: 'http://localhost:3024', CAPTURE_CONTEXT_SECRET: randomBytes(32).toString('base64'), CAPTURE_ABUSE_SECRET: randomBytes(32).toString('base64'), CAPTURE_READINESS_SECRET: randomBytes(32).toString('base64'), CAPTURE_CLIENT_IP_MODE: 'loopback', TURNSTILE_SITE_KEY: 'fixture', TURNSTILE_SECRET_KEY: 'local-fixture-no-provider-call' } : {};
const captureTypes = activation ? './.next-e2e-capture-activation/dev/types/routes.d.ts' : lifecycle ? './.next-e2e-capture-lifecycle/dev/types/routes.d.ts' : './.next-e2e-capture/dev/types/routes.d.ts';
const previousTypes = readFileSync(nextEnv, 'utf8').match(/import "([^"]*types\/routes\.d\.ts)";/)?.[1];
const restoreTypes = previousTypes && previousTypes !== captureTypes ? previousTypes : './.next/dev/types/routes.d.ts';
let created = false;
try {
  await owner.raw('CREATE DATABASE ??', [name]); created = true;
  const child = spawn('pnpm', ['--filter', '@salesmora/web', 'exec', 'playwright', 'test', activation ? 'lead-capture-activation.spec.ts' : lifecycle ? 'lead-capture-lifecycle.spec.ts' : 'lead-capture.spec.ts', '--reporter=line'], { stdio: 'inherit', cwd: fileURLToPath(new URL('..', import.meta.url)), env: { ...process.env, ...activationEnv, TEST_DATABASE_URL: url.toString(), TEST_APP_DATABASE_URL: runtime.toString(), SALESMORA_E2E_ORIGIN: activation ? 'http://127.0.0.1:3024' : lifecycle ? 'http://127.0.0.1:3022' : 'http://127.0.0.1:3014', SALESMORA_E2E_DIST_DIR: activation ? '.next-e2e-capture-activation' : lifecycle ? '.next-e2e-capture-lifecycle' : '.next-e2e-capture' } });
  process.exitCode = await new Promise(resolve => child.on('exit', code => resolve(code ?? 1)));
} finally {
  // Next generates this import for its temporary build directory. Preserve any
  // other concurrent edits and restore only this harness-owned path.
  const generated = readFileSync(nextEnv, 'utf8');
  if (generated.includes(captureTypes)) writeFileSync(nextEnv, generated.replace(captureTypes, restoreTypes));
  if (created) await owner.raw('DROP DATABASE ?? WITH (FORCE)', [name]); await owner.destroy(); }
