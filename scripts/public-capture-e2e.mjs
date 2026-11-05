// Allocate an isolated local database for this slice; never migrate or truncate a configured database.
import { readFileSync, writeFileSync } from 'node:fs';
import { randomUUID, randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
process.loadEnvFile(fileURLToPath(new URL('../.env.local', import.meta.url)));
const require = createRequire(new URL('../packages/data/package.json', import.meta.url));
const knex = require('knex');
const target = process.env.TEST_DATABASE_URL;
if (!target || !new URL(target).pathname.endsWith('_test') || target === process.env.DATABASE_URL || !['127.0.0.1', 'localhost'].includes(new URL(target).hostname)) throw Error('A separate local test connection is required.');
const name = `capture_public_ui_${randomUUID().replaceAll('-', '')}_test`, owner = knex({ client: 'pg', connection: target });
const url = new URL(target); url.pathname = `/${name}`;
const runtime = new URL(url); runtime.searchParams.set('options', '-c role=salesmora_web');
const nextEnv = fileURLToPath(new URL('../apps/web/next-env.d.ts', import.meta.url));
const captureTypes = './.next-e2e-public-capture/dev/types/routes.d.ts';
const previousTypes = readFileSync(nextEnv, 'utf8').match(/import "([^"]*types\/routes\.d\.ts)";/)?.[1];
const restoreTypes = previousTypes && previousTypes !== captureTypes ? previousTypes : './.next/dev/types/routes.d.ts';
let created = false;
try {
  await owner.raw('CREATE DATABASE ??', [name]); created = true;
  const child = spawn('pnpm', ['--filter', '@salesmora/web', 'exec', 'playwright', 'test', 'public-capture.spec.ts', '--reporter=line'], { stdio: 'inherit', cwd: fileURLToPath(new URL('..', import.meta.url)), env: { ...process.env, TEST_DATABASE_URL: url.toString(), TEST_APP_DATABASE_URL: runtime.toString(), SALESMORA_E2E_ORIGIN: 'http://127.0.0.1:3016', CAPTURE_PUBLIC_ORIGIN: 'http://localhost:3016', CAPTURE_CONTEXT_SECRET: randomBytes(32).toString('base64'), SALESMORA_E2E_DIST_DIR: '.next-e2e-public-capture' } });
  process.exitCode = await new Promise(resolve => child.on('exit', code => resolve(code ?? 1)));
} finally {
  // Next generates this import for its temporary build directory. Preserve any
  // other concurrent edits and restore only this harness-owned path.
  const generated = readFileSync(nextEnv, 'utf8');
  if (generated.includes(captureTypes)) writeFileSync(nextEnv, generated.replace(captureTypes, restoreTypes));
  if (created) await owner.raw('DROP DATABASE ?? WITH (FORCE)', [name]); await owner.destroy(); }
