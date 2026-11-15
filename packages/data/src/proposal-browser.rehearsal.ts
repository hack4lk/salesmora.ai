import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createDatabase } from './database';
import { migrateFreshBaseline } from './baseline-runner';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const envFile = fileURLToPath(new URL('../../../.env.local', import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL ||
  !new URL(connection).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) {
  throw new Error('A separate local TEST_DATABASE_URL ending in _test is required.');
}

const name = `proposal_browser_${randomUUID().replaceAll('-', '')}_test`;
if (process.argv.includes('--legacy')) throw new Error('The canonical-only proposal release does not support legacy browser rehearsals.');
const isolated = new URL(connection);
isolated.pathname = `/${name}`;
const runtime = new URL(isolated);
runtime.searchParams.set('options', '-c role=salesmora_web');
const owner = createDatabase(connection), db = createDatabase(isolated.toString());
const nextEnv = fileURLToPath(new URL('../../../apps/web/next-env.d.ts', import.meta.url));
const originalNextEnv = await readFile(nextEnv, 'utf8');
const generatedNextEnv = originalNextEnv.replace(
  /import "\.\/\.next[^"]*\/(?:dev\/)?types\/routes\.d\.ts";/,
  'import "./.next-e2e-proposal-canonical/dev/types/routes.d.ts";',
);
let created = false;

try {
  await owner.raw('CREATE DATABASE ??', [name]);
  created = true;
  await migrateFreshBaseline(db);
  const args = ['--filter', '@salesmora/web', 'test:e2e', 'e2e/chat-reports.spec.ts',
    ...process.argv.slice(2)];
  const child = spawn('pnpm', args, {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      TEST_DATABASE_URL: isolated.toString(),
      TEST_APP_DATABASE_URL: runtime.toString(),
      SALESMORA_LIVE_EVAL: '0',
      SALESMORA_PROXY_TEST: '0',
      SALESMORA_E2E_PRODUCTION: '0',
      SALESMORA_E2E_DIST_DIR: '.next-e2e-proposal-canonical',
      SALESMORA_PROPOSAL_BROWSER: '1',
      DATABASE_ROLE_ENFORCED: 'true',
    },
  });
  const result = await new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code, signal) => resolve({ code, signal }));
  });
  if (result.code !== 0) throw new Error(`Proposal browser rehearsal failed (${result.signal ?? result.code}).`);
} finally {
  await db.destroy();
  try {
    if (created) await owner.raw('DROP DATABASE ??', [name]);
  } finally {
    try {
      await owner.destroy();
    } finally {
      const currentNextEnv = await readFile(nextEnv, 'utf8');
      if (currentNextEnv === generatedNextEnv && currentNextEnv !== originalNextEnv)
        await writeFile(nextEnv, originalNextEnv);
      else if (currentNextEnv !== originalNextEnv)
        console.warn('Generated Next.js type references changed independently; leaving them untouched.');
    }
  }
}
