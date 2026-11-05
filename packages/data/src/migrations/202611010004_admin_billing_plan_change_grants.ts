import type { Knex } from 'knex';
import { applyRuntimeGrants } from '../runtime-roles';

/** Grants-only: enables the approved admin plan-change use case with column-limited writes. */
export async function up(db: Knex) {
  await applyRuntimeGrants(db);
}

export async function down() {}
