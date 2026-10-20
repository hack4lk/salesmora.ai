import type { Knex } from "knex";

/** Rows linked before the image column existed get the catalog's current image once. */
export async function up(db: Knex.Transaction) {
  await db.raw(`UPDATE "workOrderMaterials" w SET "imageUrl" = m."imageUrl"
    FROM "materialCatalog" m
    WHERE w."catalogId" = m.id AND w."workspaceId" = m."workspaceId" AND w."imageUrl" = '' AND m."imageUrl" <> ''`);
}

export async function down() {}
