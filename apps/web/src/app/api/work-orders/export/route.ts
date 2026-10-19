import { exportWorkOrders } from "@salesmora/data";
import { workOrderExportColumns, workOrderExportRequestSchema } from "@salesmora/contracts";
import { workOrderRequest, workOrderHeaders } from "../../../../server/work-orders/http";
import { database } from "../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../server/authorization/permissions";

/** The button exports every column; the assistant path lets people choose columns. Access notes, prices and costs are never columns. */
export function POST(request: Request) {
  return workOrderRequest(request, async (identity, body) => {
    const input = workOrderExportRequestSchema.parse(body);
    const csv = await exportWorkOrders(database(), identity, enabledPermissions, { query: { ...input.query, workspaceId: identity.workspaceId }, columns: workOrderExportColumns, expectedCount: input.expectedCount });
    return new Response(csv, { headers: { ...workOrderHeaders, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="work-orders.csv"', "X-Content-Type-Options": "nosniff" } });
  }, true);
}
