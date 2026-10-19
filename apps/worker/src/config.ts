import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
export function localConfiguration() {
  const env = fileURLToPath(new URL('../../../.env.local', import.meta.url));
  if (existsSync(env)) process.loadEnvFile(env);
  if (process.env.NODE_ENV === 'production') throw Error('Development knowledge commands refuse production');
  const target = process.argv.includes('--test') ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
  if (!target) throw Error('Local database is not configured');
  const db = new URL(target);
  if (!['localhost', '127.0.0.1'].includes(db.hostname) || db.port !== '55432' || !['/salesmora', '/salesmora_test'].includes(db.pathname)) throw Error('Knowledge commands require the standard local development/test database');
  const redis = new URL(process.env.REDIS_URL ?? 'redis://127.0.0.1:56379');
  if (redis.protocol !== 'redis:' || !['localhost', '127.0.0.1'].includes(redis.hostname) || redis.port !== '56379' || redis.username || redis.password || (redis.pathname && redis.pathname !== '/')) throw Error('Knowledge queue requires the standard local Redis');
  return { databaseURL: target, queueName: db.pathname.endsWith('_test') ? 'help-ingestion-test' : 'help-ingestion-development', connection: { host: redis.hostname, port: Number(redis.port) } };
}

export interface WorkerConfiguration {
  databaseURL: string;
  queueName: string;
  connection: { host: string; port: number; username?: string; password?: string; db?: number; tls?: { servername: string }; connectTimeout?: number };
  tasks?: 'all' | 'retention';
}
function workerTasks(value?: string): 'all' | 'retention' {
  if (value === undefined || value === 'all') return 'all';
  if (value === 'retention') return value;
  throw Error('Invalid worker tasks');
}
function serviceURL(value: string | undefined, protocols: string[]) {
  try {
    if (!value) throw Error();
    const url = new URL(value);
    if (!protocols.includes(url.protocol) || !url.hostname || url.hash) throw Error();
    return url;
  } catch { throw Error('Invalid worker service configuration'); }
}
/** Pure parser: production never loads local secrets or silently selects test resources. */
export function productionConfiguration(env: NodeJS.ProcessEnv, args: readonly string[] = []): WorkerConfiguration {
  if (args.includes('--test')) throw Error('Production workers refuse test mode');
  const database = serviceURL(env.DATABASE_URL, ['postgres:', 'postgresql:']);
  if (!database.pathname || database.pathname === '/' || database.pathname.endsWith('_test')) throw Error('Invalid production worker database');
  const redis = serviceURL(env.REDIS_URL, ['redis:', 'rediss:']);
  if (redis.search || !/^\/(?:\d+)?$/.test(redis.pathname || '/') || (redis.port && Number(redis.port) < 1)) throw Error('Invalid worker Redis configuration');
  const queueName = env.WORKER_QUEUE_NAME;
  if (!queueName || !/^[a-z][a-z0-9-]{2,63}$/.test(queueName) || ['help-ingestion-test', 'help-ingestion-development'].includes(queueName)) throw Error('Configure a dedicated production worker queue');
  let username: string | undefined, password: string | undefined;
  try { username = redis.username ? decodeURIComponent(redis.username) : undefined; password = redis.password ? decodeURIComponent(redis.password) : undefined; }
  catch { throw Error('Invalid worker Redis credentials'); }
  const redisDB = Number(redis.pathname.slice(1) || 0);
  if (!Number.isSafeInteger(redisDB) || redisDB < 0) throw Error('Invalid worker Redis database');
  return { databaseURL: env.DATABASE_URL!, queueName, tasks: workerTasks(env.WORKER_TASKS), connection: {
    host: redis.hostname, port: Number(redis.port || 6379), username, password, db: redisDB, connectTimeout: 5000,
    ...(redis.protocol === 'rediss:' ? { tls: { servername: redis.hostname } } : {}),
  } };
}
export function workerConfiguration(): WorkerConfiguration {
  if (process.env.NODE_ENV === 'production') return productionConfiguration(process.env, process.argv);
  const local = localConfiguration();
  return { ...local, tasks: workerTasks(process.env.WORKER_TASKS) };
}
