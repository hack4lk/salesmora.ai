import pg from 'pg';
import { instrumentDatabaseClient } from './database-metrics';

export function createAuthPool(connectionString: string, searchPath?: 'admin' | 'public') {
  const pool = new pg.Pool({
    connectionString,
    max: 5,
    ...(searchPath ? { options: `-c search_path=${searchPath}` } : {}),
  });
  pool.on('connect', client => instrumentDatabaseClient(client, 'authentication'));
  return pool;
}
