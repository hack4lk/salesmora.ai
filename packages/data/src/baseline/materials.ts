import type { Knex } from 'knex';

export async function createMaterialTables(db: Knex) {
  await db.schema.createTable('materialCatalog', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.text('name').notNullable();
    table.text('sku').notNullable().defaultTo('');
    table.text('unit').notNullable().defaultTo('each');
    for (const field of ['category', 'supplier']) table.text(field).notNullable().defaultTo('');
    for (const field of ['costCents', 'priceCents']) table.integer(field).notNullable().defaultTo(0);
    for (const field of ['notes', 'imageUrl', 'sourceUrl']) table.text(field).notNullable().defaultTo('');
    table.text('status').notNullable().defaultTo('active');
    table.timestamp('archivedAt', { useTz: true });
    table.integer('version').notNullable().defaultTo(1);
    for (const field of ['createdBy', 'proposedBy', 'decidedBy']) table.text(field).references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('decidedAt', { useTz: true });
    table.text('rejectionReason').notNullable().defaultTo('');
    for (const field of ['createdAt', 'updatedAt']) table.timestamp(field, { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.unique(['workspaceId', 'id']);
    table.index(['workspaceId', 'status', 'archivedAt']);
    table.check(`status IN ('proposed','active','rejected') AND char_length(name) BETWEEN 1 AND 200 AND char_length(sku) <= 80 AND char_length(category) <= 80 AND char_length(supplier) <= 120`);
    table.check(`"costCents" >= 0 AND "priceCents" >= 0 AND unit IN ('each','ft','lb','box','gal','hr','other') AND char_length(notes) <= 1000 AND char_length("imageUrl") <= 2000 AND char_length("sourceUrl") <= 2000 AND version > 0`);
    table.check(`status = 'active' OR "archivedAt" IS NULL`);
  });
  await db.raw(`CREATE UNIQUE INDEX "materialCatalogSku" ON "materialCatalog" ("workspaceId", lower(sku)) WHERE sku <> '' AND status = 'active' AND "archivedAt" IS NULL`);
  await db.schema.createTable('materialAudit', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('materialId');
    table.text('materialName').notNullable();
    table.text('action').notNullable();
    table.text('actorId').references('id').inTable('users').onDelete('SET NULL');
    table.text('source').notNullable().defaultTo('ui');
    table.jsonb('changes').notNullable().defaultTo('{}');
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.index(['workspaceId', 'materialId', 'createdAt']);
  });
  await db.schema.createTable('materialOperations', table => {
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('submissionId').notNullable();
    table.text('actorId').notNullable();
    table.text('inputHash').notNullable();
    table.uuid('materialId').notNullable();
    table.integer('version').notNullable();
    table.primary(['workspaceId', 'submissionId']);
  });
  await db.schema.createTable('materialExportAudit', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.text('actorId').references('id').inTable('users').onDelete('SET NULL');
    table.integer('rowCount').notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.index(['workspaceId', 'createdAt']);
  });
  await db.raw(`ALTER TABLE "workOrderMaterials" ADD CONSTRAINT "workOrderMaterialsCatalogFk" FOREIGN KEY ("workspaceId", "catalogId") REFERENCES "materialCatalog" ("workspaceId", "id") MATCH SIMPLE ON DELETE SET NULL ("catalogId")`);
  await db.schema.createTable('materialNotifications', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('materialId').notNullable().references('id').inTable('materialCatalog').onDelete('CASCADE');
    table.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('event').notNullable();
    table.text('materialName').notNullable();
    table.text('reason').notNullable().defaultTo('');
    table.text('actorName').notNullable().defaultTo('');
    table.timestamp('readAt', { useTz: true });
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.index(['workspaceId', 'userId', 'createdAt', 'id']);
    table.index(['materialId']);
  });
  await db.raw(`ALTER TABLE "materialNotifications" ADD CHECK (event IN ('proposed','approved','edited','rejected'))`);
  await db.schema.createTable('workOrderNotifications', table => {
    table.uuid('id').primary();
    table.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    table.uuid('workOrderId').notNullable().references('id').inTable('workOrders').onDelete('CASCADE');
    table.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('event').notNullable();
    table.text('actorName').notNullable().defaultTo('');
    table.timestamp('readAt', { useTz: true });
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
    table.index(['workspaceId', 'userId', 'createdAt', 'id']);
    table.index(['workOrderId']);
  });
  await db.raw(`ALTER TABLE "workOrderNotifications" ADD CHECK (event IN ('issued','assigned','rescheduled','changed','completed','canceled'))`);
}
