import type { Knex } from "knex";
import { applyRuntimeGrants, revokeRuntimeGrants } from "../runtime-roles";

// No-op until `pnpm db:roles` provisions the roles; that script re-applies the grants.
export async function up(db: Knex) {
  await applyRuntimeGrants(db);
}

export async function down(db: Knex) {
  await revokeRuntimeGrants(db);
}
