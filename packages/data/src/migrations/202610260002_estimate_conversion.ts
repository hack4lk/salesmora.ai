import type { Knex } from "knex";

export async function up(db: Knex) {
  await db.raw(`CREATE UNIQUE INDEX jobs_accepted_estimate_once
    ON jobs ("workspaceId", "acceptedEstimateId")
    WHERE "acceptedEstimateId" IS NOT NULL`);
}

export async function down(db: Knex) {
  await db.raw("DROP INDEX jobs_accepted_estimate_once");
}
