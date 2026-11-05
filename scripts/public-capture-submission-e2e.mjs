// Allocate an isolated local database for this slice; never migrate or truncate a configured database.
import { createServer } from 'node:http';
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
const name = `capture_submit_ui_${randomUUID().replaceAll('-', '')}_test`, owner = knex({ client: 'pg', connection: target });
const url = new URL(target); url.pathname = `/${name}`;
const runtime = new URL(url); runtime.searchParams.set('options', '-c role=salesmora_web');
const nextEnv = fileURLToPath(new URL('../apps/web/next-env.d.ts', import.meta.url));
const captureTypes = './.next-e2e-capture-submit/dev/types/routes.d.ts';
const previousTypes = readFileSync(nextEnv, 'utf8').match(/import "([^"]*types\/routes\.d\.ts)";/)?.[1];
const restoreTypes = previousTypes && previousTypes !== captureTypes ? previousTypes : './.next/dev/types/routes.d.ts';
let created = false;
let verifications = 0, calls = 0, dropNext = false;
const decisions = new Map();
const provider = createServer(async (request, response) => {
  if (request.url === '/host' && request.method === 'GET') { response.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-store' }); response.end('<!doctype html><html><head><title>Customer website fixture</title></head><body></body></html>'); return; }
  if (request.url === '/drop-next' && request.method === 'POST') { dropNext = true; response.writeHead(204); response.end(); return; }
  if (request.url === '/stats') { response.writeHead(200, { 'Content-Type': 'application/json' }); response.end(JSON.stringify({ verifications, calls })); return; }
  if (request.url !== '/siteverify' || request.method !== 'POST') { response.writeHead(404); response.end(); return; }
  let text = ''; for await (const chunk of request) { text += chunk; if (text.length > 16000) { response.writeHead(413); response.end(); return; } }
  try {
    const body = JSON.parse(text); calls++;
    const match = /^fixture-turnstile:([a-f0-9]{64})$/.exec(body.response);
    let decision = decisions.get(body.idempotency_key);
    if (!decision) { verifications++; decision = { token: body.response, result: match && body.secret === 'fixture-provider-secret' ? { success: true, hostname: 'localhost', action: 'capture_submit', cdata: match[1], challenge_ts: new Date().toISOString() } : { success: false } }; decisions.set(body.idempotency_key, decision); }
    if (dropNext) { dropNext = false; response.destroy(); return; }
    response.writeHead(200, { 'Content-Type': 'application/json' }); response.end(JSON.stringify(decision.token === body.response ? decision.result : { success: false }));
  } catch { response.writeHead(400); response.end(); }
});
try {
  await new Promise((resolve, reject) => { provider.once('error', reject); provider.listen(3019, '127.0.0.1', resolve); });
  await owner.raw('CREATE DATABASE ??', [name]); created = true;
  const child = spawn('pnpm', ['--filter', '@salesmora/web', 'exec', 'playwright', 'test', 'public-capture-submission.spec.ts', '--reporter=line', ...(process.env.SALESMORA_CAPTURE_GREP ? ['--grep', process.env.SALESMORA_CAPTURE_GREP] : [])], { stdio: 'inherit', cwd: fileURLToPath(new URL('..', import.meta.url)), env: { ...process.env, TEST_DATABASE_URL: url.toString(), TEST_APP_DATABASE_URL: runtime.toString(), SALESMORA_E2E_ORIGIN: 'http://127.0.0.1:3018', CAPTURE_PUBLIC_ORIGIN: 'http://localhost:3018', CAPTURE_CONTEXT_SECRET: randomBytes(32).toString('base64'), CAPTURE_ABUSE_SECRET: randomBytes(32).toString('base64'), CAPTURE_SUBMISSIONS_ENABLED: 'true', CAPTURE_CLIENT_IP_MODE: 'loopback', TURNSTILE_SITE_KEY: 'fixture-site-key', TURNSTILE_SECRET_KEY: 'fixture-provider-secret', CAPTURE_TURNSTILE_TEST_ORIGIN: 'http://127.0.0.1:3019', SALESMORA_E2E_DIST_DIR: '.next-e2e-capture-submit' } });
  process.exitCode = await new Promise(resolve => child.on('exit', code => resolve(code ?? 1)));
} finally {
  await new Promise(resolve => provider.close(resolve));
  // Next generates this import for its temporary build directory. Preserve any
  // other concurrent edits and restore only this harness-owned path.
  const generated = readFileSync(nextEnv, 'utf8');
  if (generated.includes(captureTypes)) writeFileSync(nextEnv, generated.replace(captureTypes, restoreTypes));
  if (created) await owner.raw('DROP DATABASE ?? WITH (FORCE)', [name]); await owner.destroy(); }
