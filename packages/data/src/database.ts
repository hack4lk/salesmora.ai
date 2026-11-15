import knex from 'knex';
import type pg from 'pg';
import { instrumentDatabaseClient } from './database-metrics';

export type { Knex } from 'knex';

export function createDatabase(connectionString: string) {
  return knex({ client: 'pg', connection: connectionString, pool: { min: 0, max: 5,
    afterCreate(client: pg.Client, done: (error: Error | null, client: pg.Client) => void) {
      instrumentDatabaseClient(client, 'application');
      done(null, client);
    },
  } });
}
