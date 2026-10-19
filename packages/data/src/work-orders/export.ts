import { randomUUID } from "node:crypto";
import type { Knex } from "knex";
import { workOrderExportSchema, type PermissionId } from "@salesmora/contracts";
import { resolveAuthorizedCollectionScope } from "@salesmora/domain";
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from "../authorization/store";
import { csvLine } from "../leads/csv";
import { WorkOrderConflictError, WorkOrderValidationError, readWorkOrders } from "./store";

const headers = { number: "Work order", title: "Title", status: "Status", job: "Job", customer: "Customer", address: "Address", assignee: "Assignee",
  crew: "Crew", scheduledDate: "Scheduled date", arrivalWindow: "Arrival window", tasks: "Tasks done" } as const;
const pageSize = 100;

/** Exports the same scoped rows the list shows. Access notes, prices and costs are never columns. */
export async function exportWorkOrders(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const input = workOrderExportSchema.parse(raw);
  if (input.query.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  const check = await withWorkspaceAuthorization(db, identity, enabled, false, async (_trx, context) => resolveAuthorizedCollectionScope(context, "workorders.export").allowed);
  if (!check) throw new AuthorizationAccessError();
  const first = await readWorkOrders(db, identity, enabled, { ...input.query, page: 1, pageSize });
  if (first.total !== input.expectedCount || !first.total || first.total > 50000)
    throw new WorkOrderConflictError("Export scope changed or exceeds 50,000 rows. Prepare it again.");
  const lines = ["\uFEFF" + csvLine(input.columns.map(key => headers[key]))];
  let bytes = Buffer.byteLength(lines[0]);
  for (let page = 1; page <= Math.ceil(first.total / pageSize); page++) {
    const { rows } = page === 1 ? first : await readWorkOrders(db, identity, enabled, { ...input.query, page, pageSize });
    for (const row of rows) {
      const cells = { number: row.number, title: row.title, status: row.status, job: row.jobNumber, customer: row.customerName, address: row.address,
        assignee: row.assigneeName ?? "", crew: row.crewNames.join("; "), scheduledDate: row.scheduledDate ?? "", arrivalWindow: row.arrivalWindow ?? "",
        tasks: `${row.tasksDone}/${row.tasksTotal}` };
      const line = csvLine(input.columns.map(key => cells[key]));
      bytes += Buffer.byteLength(line);
      if (bytes > 32000000) throw new WorkOrderValidationError("Narrow the export filters to reduce the file size.");
      lines.push(line);
    }
  }
  await withWorkspaceAuthorization(db, identity, enabled, true, async trx => {
    await trx("workOrderExportAudit").insert({ id: randomUUID(), workspaceId: identity.workspaceId, actorId: identity.userId, rowCount: first.total });
  });
  return lines.join("");
}
