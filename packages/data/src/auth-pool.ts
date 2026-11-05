import pg from 'pg';

export function createAuthPool(connectionString: string, searchPath?: 'admin' | 'public') {
  return new pg.Pool({
    connectionString,
    max: 5,
    ...(searchPath ? { options: `-c search_path=${searchPath}` } : {}),
  });
}
