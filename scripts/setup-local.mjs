import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';

if (!existsSync('.env.local')) {
  const password = randomBytes(24).toString('hex');
  writeFileSync('.env.local', [
    `POSTGRES_PASSWORD=${password}`,
    `DATABASE_URL=postgresql://salesmora:${password}@127.0.0.1:55432/salesmora`,
    `TEST_DATABASE_URL=postgresql://salesmora:${password}@127.0.0.1:55432/salesmora_test`,
    `BETTER_AUTH_SECRET=${randomBytes(32).toString('hex')}`,
    'BETTER_AUTH_URL=http://127.0.0.1:3000',
    'TERMS_VERSION=development-draft-2026-10-09',
    '',
  ].join('\n'), { mode: 0o600 });
  console.log('Created .env.local with random local credentials.');
}
if (!/^OBJECT_STORAGE_ENDPOINT=/m.test(readFileSync('.env.local', 'utf8'))) {
  appendFileSync('.env.local', [
    'OBJECT_STORAGE_ENDPOINT=http://127.0.0.1:59000',
    'OBJECT_STORAGE_BUCKET=salesmora-dev',
    'OBJECT_STORAGE_REGION=us-east-1',
    `OBJECT_STORAGE_ACCESS_KEY_ID=local${randomBytes(8).toString('hex')}`,
    `OBJECT_STORAGE_SECRET_ACCESS_KEY=${randomBytes(24).toString('hex')}`,
    'OBJECT_STORAGE_URL_STYLE=path',
    `FILE_MASTER_KEY=${randomBytes(32).toString('base64')}`,
    '',
  ].join('\n'));
  console.log('Added local object storage settings to .env.local.');
}
// Least-privilege database roles (docs/database-roles.md). Existing files are upgraded in
// place: the owner URL moves to MIGRATION_DATABASE_URL and the app connects as salesmora_web.
const env = readFileSync('.env.local', 'utf8');
if (!/^MIGRATION_DATABASE_URL=/m.test(env)) {
  const value = (key) => env.match(new RegExp(`^${key}=(.*)$`, 'm'))?.[1];
  const ownerURL = value('DATABASE_URL');
  const testOwnerURL = value('TEST_DATABASE_URL');
  if (!ownerURL || !testOwnerURL) throw new Error('.env.local is missing DATABASE_URL or TEST_DATABASE_URL.');
  const passwords = { web: randomBytes(24).toString('hex'), worker: randomBytes(24).toString('hex'), admin: randomBytes(24).toString('hex') };
  const asWeb = (url) => Object.assign(new URL(url), { username: 'salesmora_web', password: passwords.web }).toString();
  writeFileSync('.env.local', env.replace(/^DATABASE_URL=.*$/m, () => `DATABASE_URL=${asWeb(ownerURL)}`).replace(/\n*$/, '\n') + [
    `MIGRATION_DATABASE_URL=${ownerURL}`,
    `TEST_APP_DATABASE_URL=${asWeb(testOwnerURL)}`,
    `DB_WEB_PASSWORD=${passwords.web}`,
    `DB_WORKER_PASSWORD=${passwords.worker}`,
    `DB_ADMIN_APP_PASSWORD=${passwords.admin}`,
    'DATABASE_ROLE_ENFORCED=true',
    '',
  ].join('\n'), { mode: 0o600 });
  console.log('Added least-privilege database roles to .env.local.');
}
execFileSync('docker', ['compose', '--env-file', '.env.local', 'up', '-d', '--wait', 'postgres', 'mailpit', 'redis', 'objectstore'], { stdio: 'inherit' });
execFileSync('pnpm', ['db:migrate'], { stdio: 'inherit' });
execFileSync('pnpm', ['db:migrate:test'], { stdio: 'inherit' });
execFileSync('pnpm', ['db:roles'], { stdio: 'inherit' });
execFileSync('pnpm', ['db:roles:test'], { stdio: 'inherit' });
console.log('Local databases, Mailpit and object storage are ready. Start the app with pnpm dev. Read local emails at http://127.0.0.1:18025.');
