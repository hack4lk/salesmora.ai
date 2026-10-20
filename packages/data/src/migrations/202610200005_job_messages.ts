import type { Knex } from "knex";

export async function up(db: Knex) {
  await db.schema.createTable("jobMessages", t => {
    t.uuid("id").primary();
    t.uuid("workspaceId").notNullable().references("id").inTable("workspaces").onDelete("CASCADE");
    t.uuid("jobId").notNullable();
    t.text("authorId").nullable().references("id").inTable("users").onDelete("SET NULL");
    t.text("authorName").notNullable();
    t.text("text").notNullable();
    t.timestamp("createdAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    
    t.foreign(["workspaceId", "jobId"]).references(["workspaceId", "id"]).inTable("jobs").onDelete("CASCADE");
    t.index(["workspaceId", "jobId", "createdAt", "id"]);
    t.check(`length(text) <= 4000 AND length(text) > 0`);
  });
}

export async function down(db: Knex) {
  await db.schema.dropTable("jobMessages");
}
