import { fileURLToPath } from 'node:url';
import { startBufferControl } from './proxy-buffer-control.mjs';
import { execFileSync, spawn } from 'node:child_process';

process.loadEnvFile(fileURLToPath(new URL('../.env.local', import.meta.url)));
const testURL = process.env.TEST_DATABASE_URL;
if (!testURL || !new URL(testURL).pathname.endsWith('_test') || testURL === process.env.DATABASE_URL) {
  throw new Error('E2E requires a separate database ending in _test. Run pnpm db:setup.');
}
execFileSync('pnpm', ['--filter', '@salesmora/data', 'migrate', '--test'], { stdio: 'inherit' });
const liveEval = process.env.SALESMORA_LIVE_EVAL === '1' && process.env.SALESMORA_PROXY_TEST !== '1';
const bufferControl = process.env.SALESMORA_PROXY_TEST === '1' ? startBufferControl() : undefined;
const appEnv = { ...process.env, DATABASE_URL: testURL, BETTER_AUTH_URL: process.env.SALESMORA_PROXY_TEST === '1' ? 'http://127.0.0.1:3003' : 'http://127.0.0.1:3002', SALESMORA_TEST_SERVER: '1', BILLING_SANDBOX_ENABLED: process.env.SALESMORA_BILLING_TEST === '1' ? 'true' : 'false', CHAT_TEST_PROVIDER: liveEval ? '' : 'fixture', CHAT_ENABLED: liveEval ? 'true' : 'false', CHAT_MODEL: 'gpt-6-luna' };
const production = process.env.SALESMORA_E2E_PRODUCTION === '1';
if (production) execFileSync('pnpm', ['--filter', '@salesmora/web', 'build'], { stdio: 'inherit', env: appEnv });
const child = spawn(process.execPath, [fileURLToPath(new URL('../apps/web/node_modules/next/dist/bin/next', import.meta.url)), production ? 'start' : 'dev', '--hostname', '127.0.0.1', '--port', '3002'], {
  stdio: 'inherit',
  env: appEnv,
});
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => child.kill(signal));
child.on('exit', (code) => { bufferControl?.close(); process.exit(code ?? 0); });
