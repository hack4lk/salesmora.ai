import { createHash, randomUUID } from "node:crypto";
import type { Knex } from "knex";
import {
  createWorkOrderSchema, workOrderMutationSchema,
  type AuthorizationContext, type CreateWorkOrderInput, type PermissionId, type WorkOrderMutation,
} from "@salesmora/contracts";
import {
  authorize, WorkOrderLifecycleError, assertEditable, editsChangeIssuedContent, validateArchive, validateCompletion, validateDelete, validateReopen, validateStatusChange,
} from "@salesmora/domain";
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from "../authorization/store";
import { loadLinkableMaterials } from "../materials/snapshot";
import { notifyWorkOrderChange } from "./notify";
import { WorkOrderConflictError, WorkOrderValidationError, resource, scoped, selects, type Row } from "./store";

type Source = "ui" | "assistant-confirmed";
export type WorkOrderWriteOptions = { source?: Source; signoffRequired?: boolean };
const hashInput = (input: unknown) => createHash("sha256").update(JSON.stringify(input)).digest("hex");

function permit(context: AuthorizationContext, permission: PermissionId, row?: Row) {
  if (!authorize(context, { permission, ...(row ? { resource: resource(row) } : {}) }).allowed) throw new AuthorizationAccessError();
}
async function record(trx: Knex.Transaction, context: AuthorizationContext, id: string) {
  const row: Row | undefined = await scoped(trx, context).where("w.id", id).select(...selects(trx)).forUpdate("w").first();
  if (!row) throw new AuthorizationAccessError();
  return row;
}
async function receipt(trx: Knex.Transaction, context: AuthorizationContext, id: string, hash: string) {
  const previous = await trx("workOrderOperations").where({ workspaceId: context.workspaceId, submissionId: id }).first();
  if (previous && (previous.actorId !== context.userId || previous.inputHash !== hash)) throw new WorkOrderConflictError();
  return previous ? { workOrderId: previous.workOrderId as string, version: previous.version as number } : undefined;
}
async function log(trx: Knex.Transaction, context: AuthorizationContext, workOrderId: string, submissionId: string, version: number, hash: string, type: string, changes: unknown, source: Source) {
  const actor = await trx("users").where({ id: context.userId }).first("name");
  await trx("workOrderActivity").insert({ id: randomUUID(), workspaceId: context.workspaceId, workOrderId, actorId: context.userId, actorName: actor.name, source, type, changes: JSON.stringify(changes) });
  await trx("workOrderOperations").insert({ workspaceId: context.workspaceId, workOrderId, submissionId, actorId: context.userId, inputHash: hash, version });
}
async function assertMembers(trx: Knex.Transaction, context: AuthorizationContext, ids: string[]) {
  if (!ids.length) return;
  const rows = await trx("workspaceMemberships as m").join("users as u", "u.id", "m.userId")
    .where("m.workspaceId", context.workspaceId).whereIn("m.userId", ids).whereNull("u.deletionRequestedAt").select("m.userId");
  if (rows.length !== new Set(ids).size) throw new WorkOrderValidationError("Choose current workspace teammates.");
}
const task = (workspaceId: string, workOrderId: string, position: number, label: string, required: boolean, extra: object = {}) =>
  ({ id: randomUUID(), workspaceId, workOrderId, position, label, required, ...extra });

export async function createWorkOrder(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: CreateWorkOrderInput, options: WorkOrderWriteOptions = {}) {
  const input = createWorkOrderSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  const source = options.source ?? "ui";
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    permit(context, "workorders.create");
    const hash = hashInput(input), previous = await receipt(trx, context, input.submissionId, hash);
    if (previous) { await record(trx, context, previous.workOrderId); return previous; }
    const job = await trx("jobs as j").where({ "j.workspaceId": context.workspaceId, "j.id": input.jobId }).select("j.id", "j.primaryOwnerId", "j.status",
      trx.raw(`(SELECT coalesce(array_agg(t."userId"), ARRAY[]::text[]) FROM "jobTeamMembers" t WHERE t."workspaceId"=j."workspaceId" AND t."jobId"=j.id) AS "teamUserIds"`)).first();
    if (!job || !authorize(context, { permission: "jobs.read", resource: { kind: "job", id: job.id, workspaceId: context.workspaceId, ownerId: job.primaryOwnerId, teamUserIds: job.teamUserIds } }).allowed) throw new AuthorizationAccessError();
    if (["completed", "canceled"].includes(job.status)) throw new WorkOrderValidationError("Reopen the job before adding a work order.");
    if (input.source.kind === "estimate") throw new WorkOrderValidationError("Creating from an estimate is not available yet.");
    await assertMembers(trx, context, input.assigneeId ? [input.assigneeId] : []);
    const id = randomUUID();
    let copied = { instructions: "", accessNotes: "", safetyNotes: "" }, tasks: { label: string; required: boolean }[] = [], materials: Record<string, unknown>[] = [];
    if (input.source.kind === "duplicate") {
      const from = await record(trx, context, input.source.workOrderId);
      if (from.jobId !== input.jobId) throw new WorkOrderValidationError("Duplicate from a work order on the same job.");
      permit(context, "workorders.read", from);
      copied = { instructions: from.instructions, accessNotes: from.accessNotes, safetyNotes: from.safetyNotes };
      tasks = await trx("workOrderTasks").where({ workspaceId: context.workspaceId, workOrderId: from.id }).orderBy("position").select("label", "required");
      const canPrices = authorize(context, { permission: "workorders.view_prices", resource: resource(from) }).allowed, canCosts = authorize(context, { permission: "workorders.view_costs", resource: resource(from) }).allowed;
      const source = await trx("workOrderMaterials").where({ workspaceId: context.workspaceId, workOrderId: from.id }).orderBy("position");
      // Linked rows get a fresh snapshot while the item is still active; otherwise they keep their old details as free text.
      const linkable = await loadLinkableMaterials(trx, context.workspaceId, source.map(m => m.catalogId).filter(Boolean));
      materials = source.map(m => {
        const item = m.catalogId ? linkable.get(m.catalogId) : undefined;
        return { id: randomUUID(), workspaceId: context.workspaceId, workOrderId: id, position: m.position, catalogId: item ? item.id : null, name: item?.name ?? m.name, quantity: m.quantity, unit: item?.unit ?? m.unit, imageUrl: item ? item.imageUrl : m.imageUrl,
          status: "needed", note: m.note, customerPriceCents: item ? item.priceCents : canPrices ? m.customerPriceCents : null, costCents: item ? item.costCents : canCosts ? m.costCents : null };
      });
    }
    await trx("workOrders").insert({ id, workspaceId: context.workspaceId, jobId: input.jobId, title: input.title, status: "draft", ...copied,
      primaryAssigneeId: input.assigneeId, sourceWorkOrderId: input.source.kind === "duplicate" ? input.source.workOrderId : null, createdBy: context.userId });
    if (tasks.length) await trx("workOrderTasks").insert(tasks.map((t, i) => task(context.workspaceId, id, i, t.label, t.required)));
    if (materials.length) await trx("workOrderMaterials").insert(materials);
    await log(trx, context, id, input.submissionId, 1, hash, "created", { title: input.title, jobId: input.jobId, assigneeId: input.assigneeId, source: input.source.kind }, source);
    return { workOrderId: id, version: 1 };
  });
}

export async function mutateWorkOrder(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown, options: WorkOrderWriteOptions = {}) {
  const input = workOrderMutationSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, (trx, context) => mutateWorkOrderInTransaction(trx, context, input, options));
}
const actionPermission = (input: WorkOrderMutation): PermissionId => {
  switch (input.action) {
    case "task-toggle": case "note": return "workorders.progress";
    case "complete": return "workorders.complete";
    case "reopen": return "workorders.reopen";
    case "archive": return "workorders.archive";
    case "delete": return "workorders.delete";
    case "status": return input.to === "issued" ? "workorders.issue" : input.to === "canceled" ? "workorders.cancel" : "workorders.progress";
    default: return "workorders.update";
  }
};
/** Assistant-confirmed actions and the HTTP routes must share this one transaction service. */
export async function mutateWorkOrderInTransaction(trx: Knex.Transaction, context: AuthorizationContext, raw: WorkOrderMutation, options: WorkOrderWriteOptions = {}) {
  const input = workOrderMutationSchema.parse(raw), source = options.source ?? "ui";
  if (input.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const row = await record(trx, context, input.workOrderId);
  permit(context, actionPermission(input), row);
  const hash = hashInput(input), previous = await receipt(trx, context, input.submissionId, hash);
  if (previous) { if (previous.workOrderId !== row.id) throw new WorkOrderConflictError(); return previous; }
  // Crew check items off and add notes concurrently, so these appends do not compare versions.
  if (input.action !== "task-toggle" && input.action !== "note" && row.version !== input.expectedVersion) throw new WorkOrderConflictError();
  const state = { status: row.status, archived: !!row.archivedAt };
  const patch: Record<string, unknown> = { version: row.version + 1, updatedAt: trx.fn.now() };
  const flagChange = () => { if (editsChangeIssuedContent(row.status)) patch.changedAfterIssueAt = trx.fn.now(); };
  let changes: unknown;
  switch (input.action) {
    case "edit": {
      assertEditable(state); flagChange();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- stripped so only editable fields remain
      const { workspaceId, workOrderId, submissionId, expectedVersion, action, ...values } = input;
      Object.assign(patch, values);
      changes = { from: Object.fromEntries(Object.keys(values).map(k => [k, (row as Record<string, unknown>)[k]])), to: values };
      break;
    }
    case "schedule":
      assertEditable(state); flagChange();
      Object.assign(patch, { scheduledDate: input.scheduledDate, arrivalWindow: input.arrivalWindow });
      changes = { from: { scheduledDate: row.scheduledDate, arrivalWindow: row.arrivalWindow }, to: { scheduledDate: input.scheduledDate, arrivalWindow: input.arrivalWindow } };
      break;
    case "assign":
      assertEditable(state); flagChange();
      if (input.assigneeId && input.crewIds.includes(input.assigneeId)) throw new WorkOrderValidationError("The assignee is already part of the crew.");
      await assertMembers(trx, context, [...(input.assigneeId ? [input.assigneeId] : []), ...input.crewIds]);
      patch.primaryAssigneeId = input.assigneeId;
      await trx("workOrderCrew").where({ workspaceId: context.workspaceId, workOrderId: row.id }).delete();
      if (input.crewIds.length) await trx("workOrderCrew").insert(input.crewIds.map(userId => ({ workspaceId: context.workspaceId, workOrderId: row.id, userId })));
      changes = { from: { assigneeId: row.primaryAssigneeId, crewIds: row.crewIds }, to: { assigneeId: input.assigneeId, crewIds: input.crewIds } };
      break;
    case "tasks": {
      assertEditable(state); flagChange();
      const existing = await trx("workOrderTasks").where({ workspaceId: context.workspaceId, workOrderId: row.id });
      const byId = new Map(existing.map(t => [t.id as string, t]));
      if (input.tasks.some(t => t.id && !byId.has(t.id))) throw new WorkOrderValidationError("A task no longer exists. Reload and try again.");
      await trx("workOrderTasks").where({ workspaceId: context.workspaceId, workOrderId: row.id }).delete();
      if (input.tasks.length) await trx("workOrderTasks").insert(input.tasks.map((t, i) => {
        const old = t.id ? byId.get(t.id) : undefined;
        return task(context.workspaceId, row.id, i, t.label, t.required, old ? { id: old.id, done: old.done, doneBy: old.doneBy, doneAt: old.doneAt } : {});
      }));
      changes = { from: existing.map(t => t.label), to: input.tasks.map(t => t.label) };
      break;
    }
    case "task-toggle": {
      assertEditable(state);
      if (row.status === "draft") throw new WorkOrderValidationError("Issue this work order before checking off tasks.");
      const updated = await trx("workOrderTasks").where({ id: input.taskId, workspaceId: context.workspaceId, workOrderId: row.id })
        .update(input.done ? { done: true, doneBy: context.userId, doneAt: trx.fn.now() } : { done: false, doneBy: null, doneAt: null });
      if (!updated) throw new WorkOrderValidationError("That task no longer exists.");
      // The first checked task starts the work.
      if (row.status === "issued" && input.done) Object.assign(patch, { status: "in-progress", startedAt: trx.fn.now() });
      changes = { taskId: input.taskId, done: input.done, ...(patch.status ? { from: "issued", to: "in-progress" } : {}) };
      break;
    }
    case "materials": {
      assertEditable(state); flagChange();
      const prices = authorize(context, { permission: "workorders.view_prices", resource: resource(row) }).allowed;
      const costs = authorize(context, { permission: "workorders.view_costs", resource: resource(row) }).allowed;
      const existing = await trx("workOrderMaterials").where({ workspaceId: context.workspaceId, workOrderId: row.id });
      const byId = new Map(existing.map(m => [m.id as string, m]));
      if (input.materials.some(m => m.id && !byId.has(m.id))) throw new WorkOrderValidationError("A material no longer exists. Reload and try again.");
      // Rows keep their saved snapshot unless they are newly linked or re-linked to a catalog item; then the server copies name, unit and cost itself.
      const isNewLink = (m: typeof input.materials[number]) => !!m.catalogId && (!m.id || byId.get(m.id)?.catalogId !== m.catalogId);
      const linkable = await loadLinkableMaterials(trx, context.workspaceId, input.materials.filter(isNewLink).map(m => m.catalogId!));
      if (input.materials.some(m => isNewLink(m) && !linkable.has(m.catalogId!))) throw new WorkOrderValidationError("That catalog item is no longer available. Pick another or add a custom item.");
      // Prices and costs the editor cannot see are never wiped or set by them.
      await trx("workOrderMaterials").where({ workspaceId: context.workspaceId, workOrderId: row.id }).delete();
      if (input.materials.length) await trx("workOrderMaterials").insert(input.materials.map((m, i) => {
        const old = m.id ? byId.get(m.id) : undefined, item = isNewLink(m) ? linkable.get(m.catalogId!) : undefined;
        const kept = !!m.catalogId && !!old && old.catalogId === m.catalogId;
        const price = prices ? m.customerPriceCents : old?.customerPriceCents ?? null;
        return { id: old?.id ?? randomUUID(), workspaceId: context.workspaceId, workOrderId: row.id, position: i, catalogId: m.catalogId,
          name: item?.name ?? (kept ? old.name : m.name), quantity: m.quantity, unit: item?.unit ?? (kept ? old.unit : m.unit), imageUrl: item ? item.imageUrl : kept ? old.imageUrl : "", status: m.status, note: m.note,
          customerPriceCents: item ? (prices && m.customerPriceCents !== null ? m.customerPriceCents : item.priceCents) : price,
          costCents: item ? item.costCents : kept ? old.costCents : costs ? m.costCents : old?.costCents ?? null };
      }));
      changes = { from: existing.map(m => m.name), to: input.materials.map(m => m.name), linked: input.materials.filter(isNewLink).map(m => linkable.get(m.catalogId!)!.name) };
      break;
    }
    case "status": {
      validateStatusChange({ ...state, assigneeId: row.primaryAssigneeId }, input);
      patch.status = input.to;
      if (input.to === "issued") patch.issuedAt = trx.fn.now();
      if (input.to === "in-progress") patch.startedAt = row.startedAt ?? trx.fn.now();
      if (input.to === "canceled") Object.assign(patch, { canceledAt: trx.fn.now(), cancellationReason: input.reason });
      changes = { from: row.status, to: input.to, ...(input.reason ? { reason: input.reason } : {}) };
      break;
    }
    case "complete": {
      const tasks = await trx("workOrderTasks").where({ workspaceId: context.workspaceId, workOrderId: row.id }).select("required", "done");
      validateCompletion({ ...state, tasks, signoffRequired: options.signoffRequired ?? !!(await trx("workspaces").where({ id: context.workspaceId }).first("workOrderSignoffRequired"))?.workOrderSignoffRequired, canOverride: context.membership.role !== "field" }, input);
      const actor = await trx("users").where({ id: context.userId }).first("name");
      await trx("workOrderCompletions").insert({ id: randomUUID(), workspaceId: context.workspaceId, workOrderId: row.id, summary: input.summary, followUp: input.followUp, followUpNote: input.followUpNote,
        completedBy: context.userId, completedByName: actor.name, completedAt: trx.fn.now(), signerName: input.signerName || null, signedAt: input.signerName ? trx.fn.now() : null,
        signatureImage: input.signerName ? input.signatureImage : null, overrideReason: input.overrideReason });
      Object.assign(patch, { status: "completed", completedAt: trx.fn.now() });
      changes = { from: row.status, to: "completed", summary: input.summary, followUp: input.followUp, signed: !!input.signatureImage, overrideReason: input.overrideReason };
      break;
    }
    case "reopen": {
      const to = validateReopen(state);
      // The completion record is removed from the live row but kept in the activity history.
      const completion = await trx("workOrderCompletions").where({ workspaceId: context.workspaceId, workOrderId: row.id }).first("summary", "signerName", "signedAt", "overrideReason");
      await trx("workOrderCompletions").where({ workspaceId: context.workspaceId, workOrderId: row.id }).delete();
      Object.assign(patch, { status: to, completedAt: null, canceledAt: null, cancellationReason: null, ...(to === "draft" ? { issuedAt: null, startedAt: null } : {}) });
      changes = { from: row.status, to, reason: input.reason, previousCompletion: completion ?? null, previousCancellationReason: row.cancellationReason };
      break;
    }
    case "note":
      if (row.archivedAt || !["issued", "in-progress", "completed"].includes(row.status)) throw new WorkOrderLifecycleError("Notes can be added once a work order is issued and until it is canceled.");
      changes = { body: input.body };
      break;
    case "archive":
      validateArchive(state, input.archived);
      patch.archivedAt = input.archived ? trx.fn.now() : null;
      changes = { archived: input.archived };
      break;
    case "delete": validateDelete(state); break;
  }
  if (input.action === "delete") {
    await trx("workOrderDeleteAudit").insert({ id: randomUUID(), workspaceId: context.workspaceId, workOrderNumber: row.workOrderNumber, title: row.title, actorId: context.userId, source });
    await trx("workOrders").where({ workspaceId: context.workspaceId, id: row.id }).delete();
    return { workOrderId: row.id, version: row.version };
  }
  await trx("workOrders").where({ workspaceId: context.workspaceId, id: row.id }).update(patch);
  await log(trx, context, row.id, input.submissionId, row.version + 1, hash, input.action, changes, source);
  await notifyWorkOrderChange(trx, context, row, input);
  return { workOrderId: row.id, version: row.version + 1 };
}
