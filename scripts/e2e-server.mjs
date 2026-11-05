import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { startBufferControl } from './proxy-buffer-control.mjs';
import { execFileSync, spawn } from 'node:child_process';

process.loadEnvFile(fileURLToPath(new URL('../.env.local', import.meta.url)));
const testURL = process.env.TEST_DATABASE_URL;
if (!testURL || !new URL(testURL).pathname.endsWith('_test') || testURL === process.env.DATABASE_URL) {
  throw new Error('E2E requires a separate database ending in _test. Run pnpm db:setup.');
}
execFileSync('pnpm', ['--filter', '@salesmora/data', 'migrate', '--test'], { stdio: 'inherit' });
const origin = new URL(process.env.SALESMORA_E2E_ORIGIN ?? 'http://127.0.0.1:3002');
if (origin.protocol !== 'http:' || origin.hostname !== '127.0.0.1' || !origin.port || origin.pathname !== '/') throw Error('E2E origin must be a local loopback HTTP origin.');
const liveEval = process.env.SALESMORA_LIVE_EVAL === '1' && process.env.SALESMORA_PROXY_TEST !== '1';
const bufferControl = process.env.SALESMORA_PROXY_TEST === '1' ? startBufferControl() : undefined;
// The app under test connects as the runtime role when provisioned; specs keep the owner URL for fixtures.
const appURL = process.env.TEST_APP_DATABASE_URL || testURL;
if (!new URL(appURL).pathname.endsWith('_test')) throw new Error('TEST_APP_DATABASE_URL must use the _test database.');
const appEnv = { ...process.env, DATABASE_URL: appURL, BETTER_AUTH_URL: process.env.SALESMORA_PROXY_TEST === '1' ? 'http://127.0.0.1:3003' : origin.origin, SALESMORA_TEST_SERVER: '1', BILLING_SANDBOX_ENABLED: process.env.SALESMORA_BILLING_TEST === '1' ? 'true' : 'false', CHAT_TEST_PROVIDER: liveEval ? '' : 'fixture', CHAT_ENABLED: liveEval ? 'true' : 'false', CHAT_MODEL: 'gpt-6-luna' };
const production = process.env.SALESMORA_E2E_PRODUCTION === '1';
if (production) execFileSync('pnpm', ['--filter', '@salesmora/web', 'build'], { stdio: 'inherit', env: appEnv });
const child = spawn(process.execPath, [createRequire(new URL('../apps/web/package.json', import.meta.url)).resolve('next/dist/bin/next'), production ? 'start' : 'dev', '--hostname', '127.0.0.1', '--port', origin.port], {
  stdio: 'inherit',
  env: appEnv,
});
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => child.kill(signal));
child.on('exit', (code) => { bufferControl?.close(); process.exit(code ?? 0); });
