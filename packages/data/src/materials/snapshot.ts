import type { Knex } from "knex";

export type CatalogSnapshot = {
  id: string;
  name: string;
  unit: string;
  costCents: number;
  priceCents: number;
  imageUrl: string;
};

/** Only active, non-archived items of this workspace can be linked or re-snapshotted. */
export async function loadLinkableMaterials(
  trx: Knex.Transaction,
  workspaceId: string,
  ids: string[],
): Promise<Map<string, CatalogSnapshot>> {
  if (!ids.length) return new Map();
  const rows: CatalogSnapshot[] = await trx("materialCatalog")
    .where({ workspaceId, status: "active" })
    .whereNull("archivedAt")
    .whereIn("id", [...new Set(ids)])
    .select("id", "name", "unit", "costCents", "priceCents", "imageUrl");
  return new Map(rows.map((row) => [row.id, row]));
}
