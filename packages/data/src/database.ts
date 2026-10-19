import knex from 'knex';
import pg from 'pg';

export function createDatabase(connectionString: string) {
  return knex({ client: 'pg', connection: connectionString, pool: { min: 0, max: 5 } });
}

export function createAuthPool(connectionString: string) {
  return new pg.Pool({ connectionString, max: 5 });
}
