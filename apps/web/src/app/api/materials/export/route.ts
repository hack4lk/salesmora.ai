import { exportMaterials } from "@salesmora/data";
import { materialExportRequestSchema } from "@salesmora/contracts";
import { materialRequest, materialHeaders } from "../../../../server/materials/http";
import { database } from "../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../server/authorization/permissions";

/** Exports the current filtered view. Notes and links are included; cost and price columns appear only when the person may see them. */
export function POST(request: Request) {
  return materialRequest(request, async (identity, body) => {
    const input = materialExportRequestSchema.parse(body);
    const csv = await exportMaterials(database(), identity, enabledPermissions, { query: { ...input.query, workspaceId: identity.workspaceId }, expectedCount: input.expectedCount });
    return new Response(csv, { headers: { ...materialHeaders, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="materials.csv"', "X-Content-Type-Options": "nosniff" } });
  }, true);
}
