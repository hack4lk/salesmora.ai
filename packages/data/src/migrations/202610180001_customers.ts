import type { Knex } from "knex";
export async function up(db: Knex) {
  await db.schema.createTable("customers", (t) => {
    t.uuid("id").primary();
    t.uuid("workspaceId")
      .notNullable()
      .references("id")
      .inTable("workspaces")
      .onDelete("CASCADE");
    t.integer("customerNumber").notNullable();
    for (const key of [
      "name",
      "type",
      "companyName",
      "email",
      "phone",
      "location",
      "internalNotes",
    ])
      t.text(key).notNullable();
    t.text("ownerId").references("id").inTable("users").onDelete("SET NULL");
    t.integer("version").notNullable().defaultTo(1);
    t.timestamp("createdAt", { useTz: true })
      .notNullable()
      .defaultTo(db.fn.now());
    t.timestamp("updatedAt", { useTz: true })
      .notNullable()
      .defaultTo(db.fn.now());
    t.timestamp("lastActivityAt", { useTz: true })
      .notNullable()
      .defaultTo(db.fn.now());
    t.timestamp("archivedAt", { useTz: true });
    t.unique(["workspaceId", "id"]);
    t.unique(["workspaceId", "customerNumber"]);
    t.index(["workspaceId", "archivedAt", "name", "id"]);
    t.index(["workspaceId", "ownerId"]);
    t.check(
      `type IN ('person','business') AND version > 0 AND "customerNumber" > 0`,
    );
  });
  await db.schema.createTable("workspaceCustomerCounters", (t) => {
    t.uuid("workspaceId")
      .primary()
      .references("id")
      .inTable("workspaces")
      .onDelete("CASCADE");
    t.integer("lastNumber").notNullable();
  });
  await db.raw(`CREATE FUNCTION assign_customer_number() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 INSERT INTO "workspaceCustomerCounters" ("workspaceId","lastNumber") VALUES (NEW."workspaceId",1) ON CONFLICT ("workspaceId") DO UPDATE SET "lastNumber"="workspaceCustomerCounters"."lastNumber"+1 RETURNING "lastNumber" INTO NEW."customerNumber"; RETURN NEW; END $$`);
  await db.raw(
    "CREATE TRIGGER assign_customer_number BEFORE INSERT ON customers FOR EACH ROW EXECUTE FUNCTION assign_customer_number()",
  );
  await db.schema.alterTable("leads", (t) => {
    t.uuid("customerId");
    t.foreign(["workspaceId", "customerId"])
      .references(["workspaceId", "id"])
      .inTable("customers");
    t.index(["workspaceId", "customerId"]);
  });
  await db.schema.createTable("customerActivity", (t) => {
    t.uuid("id").primary();
    t.uuid("workspaceId")
      .notNullable()
      .references("id")
      .inTable("workspaces")
      .onDelete("CASCADE");
    t.uuid("customerId").notNullable();
    t.foreign(["workspaceId", "customerId"])
      .references(["workspaceId", "id"])
      .inTable("customers")
      .onDelete("CASCADE");
    t.text("actorId").references("id").inTable("users").onDelete("SET NULL");
    t.text("actorName").notNullable();
    t.text("type").notNullable();
    t.text("body").notNullable().defaultTo("");
    t.timestamp("createdAt", { useTz: true })
      .notNullable()
      .defaultTo(db.fn.now());
    t.index(["workspaceId", "customerId", "createdAt", "id"]);
  });
  await db.schema.createTable("customerOperations", (t) => {
    t.uuid("id").primary();
    t.uuid("workspaceId")
      .notNullable()
      .references("id")
      .inTable("workspaces")
      .onDelete("CASCADE");
    t.uuid("customerId");
    t.text("actorId").references("id").inTable("users").onDelete("SET NULL");
    t.text("action").notNullable();
    t.text("requestHash").notNullable();
    t.integer("version").notNullable();
    t.timestamp("createdAt", { useTz: true })
      .notNullable()
      .defaultTo(db.fn.now());
  });
  await db.schema.createTable("customerExportAudit", (t) => {
    t.uuid("id").primary();
    t.uuid("workspaceId")
      .notNullable()
      .references("id")
      .inTable("workspaces")
      .onDelete("CASCADE");
    t.text("actorId").references("id").inTable("users").onDelete("SET NULL");
    t.integer("rowCount").notNullable();
    t.timestamp("createdAt", { useTz: true })
      .notNullable()
      .defaultTo(db.fn.now());
  });
  for (const field of ["name", "email"])
    await db.raw(
      "CREATE INDEX ?? ON customers USING gin (?? public.gin_trgm_ops)",
      [`customers_${field}_search`, field],
    );
  await db.raw(
    `CREATE INDEX customers_phone_search ON customers USING gin ((regexp_replace(phone,'[^0-9]','','g')) public.gin_trgm_ops)`,
  );
  // The agreed Field ceiling is related-only. Remove legacy configurable full grants atomically.
  const changed = await db("workspaceRolePolicies")
    .where({ role: "field" })
    .whereIn("permission", [
      "customers.read",
      "customers.create",
      "customers.update",
    ])
    .distinct("workspaceId");
  for (const { workspaceId } of changed) {
    const before = await db("workspaceRolePolicies")
      .where({ workspaceId })
      .select("role", "permission", "scope");
    const head = await db("workspacePolicies")
      .where({ workspaceId })
      .first("revision");
    await db("workspaceRolePolicies")
      .where({ workspaceId, role: "field" })
      .whereIn("permission", [
        "customers.read",
        "customers.create",
        "customers.update",
      ])
      .delete();
    const after = await db("workspaceRolePolicies")
      .where({ workspaceId })
      .select("role", "permission", "scope");
    await db("workspacePolicies")
      .where({ workspaceId })
      .update({ revision: head.revision + 1, updatedAt: db.fn.now() });
    await db("authorizationAudit").insert({
      workspaceId,
      actorId: null,
      action: "customers.field-ceiling-aligned",
      beforeRevision: head.revision,
      afterRevision: head.revision + 1,
      beforePolicy: JSON.stringify({
        workspaceId,
        revision: head.revision,
        grants: before,
      }),
      afterPolicy: JSON.stringify({
        workspaceId,
        revision: head.revision + 1,
        grants: after,
      }),
    });
  }
}
export async function down(db: Knex) {
  await db.schema.dropTable("customerExportAudit");
  await db.schema.dropTable("customerOperations");
  await db.schema.dropTable("customerActivity");
  await db.schema.alterTable("leads", (t) => {
    t.dropForeign(["workspaceId", "customerId"]);
    t.dropColumn("customerId");
  });
  await db.schema.dropTable("customers");
  await db.raw("DROP FUNCTION assign_customer_number()");
  await db.schema.dropTable("workspaceCustomerCounters");
  // Never restore formerly excessive Field grants during rollback.
}
