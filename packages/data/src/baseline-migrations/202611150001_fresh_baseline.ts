import type { Knex } from 'knex';
import { createBaseline } from '../baseline';

export async function up(db: Knex) {
  await createBaseline(db);
}

export async function down() {
  throw new Error('The fresh database baseline is forward-only. Rebuild a disposable database instead.');
}
