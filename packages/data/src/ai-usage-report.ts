import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDatabase } from './database';
const file = fileURLToPath(new URL('../../../.env.local', import.meta.url));
if (existsSync(file)) process.loadEnvFile(file);
const connection = process.argv.includes('--test') ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
if (!connection) throw Error('Missing database configuration');
const url = new URL(connection);
if (!['127.0.0.1', 'localhost'].includes(url.hostname) || (process.argv.includes('--test') && !url.pathname.endsWith('_test'))) throw Error('Usage reporting is restricted to local development/test databases');
const db = createDatabase(connection);
try {
  const since = new Date(); since.setUTCDate(1); since.setUTCHours(0, 0, 0, 0);
  const rows = await db('aiUsageCalls').where('startedAt', '>=', since).groupBy('model', 'phase', 'outcome').select('model', 'phase', 'outcome')
    .select(db.raw('count(*)::int AS calls, count(*) FILTER (WHERE "totalTokens" IS NULL)::int AS "unknownUsageCalls", sum("inputTokens")::text AS "inputTokens", sum("outputTokens")::text AS "outputTokens", sum("totalTokens")::text AS "totalTokens", sum("cachedInputTokens")::text AS "cachedInputTokens", sum("reasoningTokens")::text AS "reasoningTokens", sum(coalesce("totalTokens", "reservationTokens"))::text AS "usedOrReservedTokens"'))
    .orderBy('model').orderBy('phase').orderBy('outcome');
  console.log(JSON.stringify({ since: since.toISOString(), scope: 'local database, all workspaces and shared ingestion', rows }, null, 2));
} finally { await db.destroy(); }
