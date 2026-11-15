import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDatabase } from './database';
import { migrateFreshBaseline } from './baseline-runner';

const envFile = fileURLToPath(new URL('../../../.env.local', import.meta.url));
if (process.env.NODE_ENV !== 'production' && existsSync(envFile)) process.loadEnvFile(envFile);
const isTest = process.argv.includes('--test');
// Migrations need the schema owner; DATABASE_URL may be a least-privilege runtime role.
const connection = isTest ? process.env.TEST_DATABASE_URL : process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL;
if (!connection) throw new Error('Missing database URL. Run pnpm db:setup.');
if (isTest && !new URL(connection).pathname.endsWith('_test')) throw new Error('Test migrations require a database ending in _test.');
const db = createDatabase(connection);
try {
  if (process.argv.includes('--rollback')) {
    throw new Error('The fresh baseline is forward-only. Rebuild a disposable database instead of rolling it back.');
  } else await migrateFreshBaseline(db);
  console.log(`Migrations complete (${isTest ? 'test' : process.env.NODE_ENV === 'production' ? 'deployment' : 'development'}).`);
} finally {
  await db.destroy();
}
