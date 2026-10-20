import type { Knex } from "knex";

/** Seeded template grants (frozen here so later catalog edits never rewrite history). */
const grants: [string, string, string][] = [
  ["owner", "materials.read", "enabled"],
  ["admin", "materials.read", "enabled"],
  ["office", "materials.read", "enabled"],
  ["field", "materials.read", "enabled"],
  ["office", "materials.propose", "enabled"],
  ["owner", "materials.manage", "enabled"],
  ["admin", "materials.manage", "enabled"],
];

export async function up(db: Knex.Transaction) {
  if (!db.isTransaction) throw Error("Materials migration requires a transaction.");
  await db.schema.createTable("materialCatalog", t => {
    t.uuid("id").primary();
    t.uuid("workspaceId").notNullable().references("id").inTable("workspaces").onDelete("CASCADE");
    t.text("name").notNullable();
    t.text("sku").notNullable().defaultTo("");
    t.text("unit").notNullable().defaultTo("each");
    t.text("category").notNullable().defaultTo("");
    t.text("supplier").notNullable().defaultTo("");
    t.integer("costCents").notNullable().defaultTo(0);
    t.integer("priceCents").notNullable().defaultTo(0);
    t.text("notes").notNullable().defaultTo("");
    t.text("imageUrl").notNullable().defaultTo("");
    t.text("sourceUrl").notNullable().defaultTo("");
    t.text("status").notNullable().defaultTo("active");
    t.timestamp("archivedAt", { useTz: true }).nullable();
    t.integer("version").notNullable().defaultTo(1);
    t.text("createdBy").references("id").inTable("users").onDelete("SET NULL");
    t.text("proposedBy").references("id").inTable("users").onDelete("SET NULL");
    t.text("decidedBy").references("id").inTable("users").onDelete("SET NULL");
    t.timestamp("decidedAt", { useTz: true }).nullable();
    t.text("rejectionReason").notNullable().defaultTo("");
    t.timestamp("createdAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.timestamp("updatedAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.unique(["workspaceId", "id"]);
    t.index(["workspaceId", "status", "archivedAt"]);
    t.check(`status IN ('proposed','active','rejected') AND char_length(name) BETWEEN 1 AND 200 AND char_length(sku) <= 80 AND char_length(category) <= 80 AND char_length(supplier) <= 120`);
    t.check(`"costCents" >= 0 AND "priceCents" >= 0 AND unit IN ('each','ft','lb','box','gal','hr','other') AND char_length(notes) <= 1000 AND char_length("imageUrl") <= 2000 AND char_length("sourceUrl") <= 2000 AND version > 0`);
    t.check(`status = 'active' OR "archivedAt" IS NULL`);
  });
  // Only live items must be unique by SKU: proposals may duplicate so the approver can compare them, and archiving frees the SKU.
  await db.raw(`CREATE UNIQUE INDEX "materialCatalogSku" ON "materialCatalog" ("workspaceId", lower(sku)) WHERE sku <> '' AND status = 'active' AND "archivedAt" IS NULL`);
  await db.schema.createTable("materialAudit", t => {
    t.uuid("id").primary();
    t.uuid("workspaceId").notNullable().references("id").inTable("workspaces").onDelete("CASCADE");
    t.uuid("materialId").nullable();
    t.text("materialName").notNullable();
    t.text("action").notNullable();
    t.text("actorId").references("id").inTable("users").onDelete("SET NULL");
    t.text("source").notNullable().defaultTo("ui");
    t.jsonb("changes").notNullable().defaultTo("{}");
    t.timestamp("createdAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.index(["workspaceId", "materialId", "createdAt"]);
  });
  await db.schema.createTable("materialOperations", t => {
    t.uuid("workspaceId").notNullable().references("id").inTable("workspaces").onDelete("CASCADE");
    t.uuid("submissionId").notNullable();
    t.text("actorId").notNullable();
    t.text("inputHash").notNullable();
    t.uuid("materialId").notNullable();
    t.integer("version").notNullable();
    t.primary(["workspaceId", "submissionId"]);
  });
  await db.schema.createTable("materialExportAudit", t => {
    t.uuid("id").primary();
    t.uuid("workspaceId").notNullable().references("id").inTable("workspaces").onDelete("CASCADE");
    t.text("actorId").references("id").inTable("users").onDelete("SET NULL");
    t.integer("rowCount").notNullable();
    t.timestamp("createdAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.index(["workspaceId", "createdAt"]);
  });
  // No catalog existed before, so any saved id is unmatched; those rows become free text.
  await db("workOrderMaterials").whereNotNull("catalogId").update({ catalogId: null });
  await db.raw(`ALTER TABLE "workOrderMaterials" ADD CONSTRAINT "workOrderMaterialsCatalogFk" FOREIGN KEY ("workspaceId", "catalogId") REFERENCES "materialCatalog" ("workspaceId", "id") MATCH SIMPLE ON DELETE SET NULL ("catalogId")`);
  // Rows saved before the catalog existed may hold unmatched ids; they become free text.

  const workspaces = await db("workspaces").select("id", "ownerId").orderBy("id");
  for (const workspace of workspaces) {
    await db("workspaces").where({ id: workspace.id }).forUpdate().first();
    const head = await db("workspacePolicies").where({ workspaceId: workspace.id }).first();
    if (!head) continue;
    const before = await db("workspaceRolePolicies").where({ workspaceId: workspace.id }).select("role", "permission", "scope");
    await db("workspaceRolePolicies").insert(grants.map(([role, permission, scope]) => ({ workspaceId: workspace.id, role, permission, scope }))).onConflict(["workspaceId", "role", "permission"]).ignore();
    const after = await db("workspaceRolePolicies").where({ workspaceId: workspace.id }).select("role", "permission", "scope");
    await db("workspacePolicies").where({ workspaceId: workspace.id }).update({ revision: head.revision + 1, updatedAt: db.fn.now() });
    await db("authorizationAudit").insert({ workspaceId: workspace.id, actorId: workspace.ownerId, action: "migration.materials", beforeRevision: head.revision, afterRevision: head.revision + 1,
      beforePolicy: JSON.stringify({ workspaceId: workspace.id, revision: head.revision, grants: before }), afterPolicy: JSON.stringify({ workspaceId: workspace.id, revision: head.revision + 1, grants: after }) });
  }
}

export async function down(db: Knex) {
  await db.raw(`ALTER TABLE "workOrderMaterials" DROP CONSTRAINT "workOrderMaterialsCatalogFk"`);
  for (const table of ["materialExportAudit", "materialOperations", "materialAudit", "materialCatalog"]) await db.schema.dropTable(table);
}
