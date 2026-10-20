import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDatabase } from './database';

const envFile = fileURLToPath(new URL('../../../.env.local', import.meta.url));
if (process.env.NODE_ENV !== 'production' && existsSync(envFile)) process.loadEnvFile(envFile);
const isTest = process.argv.includes('--test');
const connection = isTest ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
if (!connection) throw new Error('Missing database URL. Run pnpm db:setup.');
if (isTest && !new URL(connection).pathname.endsWith('_test')) throw new Error('Test migrations require a database ending in _test.');
const db = createDatabase(connection);
const config = { directory: fileURLToPath(new URL('./migrations', import.meta.url)), loadExtensions: ['.ts'] };
try {
  if (process.argv.includes('--rollback')) {
    if (!isTest) throw new Error('This rollback command is restricted to the disposable test database.');
    await db.migrate.rollback(config, true);
  } else await db.migrate.latest(config);
  console.log(`Migrations complete (${isTest ? 'test' : process.env.NODE_ENV === 'production' ? 'deployment' : 'development'}).`);
} finally {
  await db.destroy();
}
