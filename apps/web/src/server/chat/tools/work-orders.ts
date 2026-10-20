import "server-only";
import { readToolRegistry } from "@salesmora/agent";
import { readWorkOrderDetail, readWorkOrders } from "@salesmora/data";
import { database } from "../../workspaces/store";
import { enabledPermissions } from "../../authorization/permissions";
import type { WorkOrderRowView } from "@salesmora/contracts";
import type { ChatToolHandler } from "./types";

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max)}…` : text);
const addDays = (date: string, days: number) => new Date(Date.parse(`${date}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);

/** Only the fields an assistant answer needs: no access notes, prices, costs, contact details or internal ids beyond the record link. */
const summary = (w: WorkOrderRowView) => ({
  number: w.number, title: clip(w.title, 120), status: w.status, job: w.jobNumber, customer: w.customerName, address: w.address,
  assignee: w.assigneeName, crew: w.crewNames, scheduledDate: w.scheduledDate, arrivalWindow: w.arrivalWindow,
  tasks: `${w.tasksDone}/${w.tasksTotal}`, overdue: w.overdue, archived: w.archived,
});

export const workOrdersQuery: ChatToolHandler = async (context, args) => {
  const input = readToolRegistry.work_orders_query.inputSchema.parse(args);
  await context.authorize("work_orders_query");
  const identity = { userId: context.identity.userId, workspaceId: context.identity.workspaceId };
  const base = { workspaceId: identity.workspaceId } as const;
  const db = database();
  if (input.operation === "details") {
    const number = input.workOrderNumber!.toUpperCase().replace(/^WO-0*(\d+)$/, (_, n: string) => `WO-${n.padStart(4, "0")}`);
    const found = await readWorkOrders(db, identity, enabledPermissions, { ...base, q: number, pageSize: 25 });
    const match = found.rows.find(w => w.number === number);
    if (!match) return { evidence: { type: "work-orders-result", untrusted: true, operation: "details", found: false } };
    const detail = await readWorkOrderDetail(db, identity, enabledPermissions, match.id);
    const w = detail.workOrder;
    return { evidence: { type: "work-orders-result", untrusted: true, operation: "details", found: true,
      workOrder: { ...summary(w), instructions: clip(w.instructions, 600), safetyNotes: clip(w.safetyNotes, 400), cancellationReason: w.cancellationReason, changedAfterIssue: w.changedAfterIssue },
      tasks: detail.tasks.slice(0, 40).map(t => ({ label: clip(t.label, 120), required: t.required, done: t.done })),
      materials: detail.materials.slice(0, 40).map(m => ({ name: clip(m.name, 120), quantity: m.quantity, unit: m.unit, status: m.status, fromCatalog: !!m.catalogId })),
      recentNotes: detail.notes.slice(0, 5).map(n => ({ author: n.authorName, at: n.createdAt, body: clip(n.body, 300) })),
      completion: detail.completion && { summary: clip(detail.completion.summary, 400), completedBy: detail.completion.completedByName, completedAt: detail.completion.completedAt, signedBy: detail.completion.signerName },
      link: `/work-orders/${w.id}` } };
  }
  const limit = input.limit ?? 10;
  const when = input.when ?? "any";
  const first = await readWorkOrders(db, identity, enabledPermissions, { ...base, pageSize: 25 });
  const today = first.today;
  const dates = when === "today" ? { scheduledFrom: today, scheduledTo: today } : when === "tomorrow" ? { scheduledFrom: addDays(today, 1), scheduledTo: addDays(today, 1) }
    : when === "this_week" ? { scheduledFrom: today, scheduledTo: addDays(today, 6) } : when === "overdue" ? { scheduledTo: addDays(today, -1) } : {};
  const filters = { ...base, q: input.query ?? "", mine: input.mine ?? false, ...dates, sort: "scheduledDate", direction: "asc", pageSize: 100 } as const;
  const results = when === "overdue" && !input.status
    ? (await Promise.all((["issued", "in-progress"] as const).map(status => readWorkOrders(db, identity, enabledPermissions, { ...filters, status })))).flatMap(r => r.rows)
    : (await readWorkOrders(db, identity, enabledPermissions, { ...filters, ...(input.status ? { status: input.status } : {}) })).rows;
  const rows = (when === "overdue" ? results.filter(w => w.overdue) : results).sort((a, b) => (a.scheduledDate ?? "9999").localeCompare(b.scheduledDate ?? "9999") || a.number.localeCompare(b.number));
  const params = new URLSearchParams({ workspace: identity.workspaceId });
  if (input.query) params.set("q", input.query);
  if (input.status) params.set("status", input.status);
  if (input.mine) params.set("mine", "true");
  if (dates.scheduledFrom) params.set("scheduledFrom", dates.scheduledFrom);
  if (dates.scheduledTo) params.set("scheduledTo", dates.scheduledTo);
  return { evidence: { type: "work-orders-result", untrusted: true, operation: "search", today, window: when, total: rows.length, truncated: rows.length > limit,
    workOrders: rows.slice(0, limit).map(summary), openInListPath: `/work-orders?${params}`,
    workspaceCounts: { inProgress: first.metrics.inProgress, overdue: first.metrics.overdue, awaitingSignoff: first.metrics.awaitingSignoff } } };
};
