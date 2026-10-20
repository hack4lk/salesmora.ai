import { randomUUID } from "node:crypto";
import type { Knex } from "knex";
import { materialExportSchema, type PermissionId } from "@salesmora/contracts";
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from "../authorization/store";
import { csvLine } from "../leads/csv";
import { MaterialConflictError, MaterialValidationError, materialAccess, readMaterials } from "./store";

const pageSize = 100;

/** Exports the rows the current filters show. Only owners and admins may export, and cost and price columns follow the same permissions as the list. */
export async function exportMaterials(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const parsed = materialExportSchema.parse(raw);
  if (parsed.query.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  const access = await withWorkspaceAuthorization(db, identity, enabled, false, async (_trx, context) => materialAccess(context));
  if (!access.manage) throw new AuthorizationAccessError();
  const first = await readMaterials(db, identity, enabled, { ...parsed.query, page: 1, pageSize });
  if (first.total !== parsed.expectedCount || !first.total || first.total > 50000)
    throw new MaterialConflictError("Export scope changed or exceeds 50,000 rows. Prepare it again.");
  const columns = ["Name", "SKU", "Unit", "Category", "Supplier", ...(access.viewCosts ? ["Cost per unit"] : []), ...(access.viewPrices ? ["Price per unit"] : []), "Status", "Notes", "Supplier link", "Image link"];
  const lines = ["\uFEFF" + csvLine(columns)];
  let bytes = Buffer.byteLength(lines[0]);
  const dollars = (cents: number | null) => (cents === null ? "" : (cents / 100).toFixed(2));
  for (let page = 1; page <= Math.ceil(first.total / pageSize); page++) {
    const { rows } = page === 1 ? first : await readMaterials(db, identity, enabled, { ...parsed.query, page, pageSize });
    for (const row of rows) {
      const line = csvLine([row.name, row.sku, row.unit, row.category, row.supplier, ...(access.viewCosts ? [dollars(row.costCents)] : []), ...(access.viewPrices ? [dollars(row.priceCents)] : []),
        row.archived ? "archived" : row.status, row.notes, row.sourceUrl, row.imageUrl]);
      bytes += Buffer.byteLength(line);
      if (bytes > 32000000) throw new MaterialValidationError("Narrow the export filters to reduce the file size.");
      lines.push(line);
    }
  }
  await withWorkspaceAuthorization(db, identity, enabled, true, async trx => {
    await trx("materialExportAudit").insert({ id: randomUUID(), workspaceId: identity.workspaceId, actorId: identity.userId, rowCount: first.total });
  });
  return lines.join("");
}
