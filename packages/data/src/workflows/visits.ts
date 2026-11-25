import { randomUUID } from "node:crypto";
import type { Knex } from "knex";
import { z } from "zod";
import { workflowVisitSnapshotSchema, workflowDefinitionSchema, permissionIds,
  type AuthorizationContext, type WorkflowDefinition, type PermissionId } from "@salesmora/contracts";
import { isVisitWorkflow, canPublishWorkflow, canReadWorkflowRecords } from "@salesmora/domain";
import { AuthorizationAccessError, withWorkspaceAuthorization } from "../authorization/store";
import { workflowParticipantsEligible } from "./execution";

/** Calendar's unassigned semantics: all active linked Jobs/Work Orders, including supporting teams. */
export function matchingWorkflowVisits(trx: Knex.Transaction, context: AuthorizationContext, workflowId: string, definition: WorkflowDefinition) {
  if (!isVisitWorkflow(definition) || !canReadWorkflowRecords(context, definition.kind)) throw new AuthorizationAccessError();
  return trx("calendarVisits as e").where("e.workspaceId", context.workspaceId)
    .whereRaw(`e."scheduledDate" > (clock_timestamp() AT TIME ZONE ?)::date`, [definition.timezone])
    .whereRaw(definition.kind === "visit_materials" ? `workflow_visit_has_pending_materials(e."workspaceId",e.id)` : `workflow_visit_unassigned(e."workspaceId",e.id)`)
    .whereNotExists(trx("workflowVisitNotifications as n").select(trx.raw("1"))
      .where({ "n.workspaceId": context.workspaceId, "n.workflowId": workflowId })
      .whereRaw('n."visitId" = e.id AND n."scheduledDate" = e."scheduledDate"'));
}

/** Shared bounded display projection. Alias v is the canonical visit; all active records contribute to assignment/counts. */
export const workflowVisitProjectionSQL = `WITH records AS MATERIALIZED (SELECT * FROM workflow_visit_records(v."workspaceId",v.id)),
  first_five AS (SELECT * FROM records ORDER BY type, number, id LIMIT 5)
  SELECT (array_agg(title ORDER BY type, number, id))[1] AS title,
    (array_agg("customerName" ORDER BY type, number, id))[1] AS "customerName",
    jsonb_agg((CASE WHEN type = 'job' THEN 'J-' ELSE 'WO-' END) || lpad(number::text,greatest(4,length(number::text)),'0') || ' · ' || title ORDER BY type, number, id) AS labels,
    (SELECT count(*) FROM records) AS total, (SELECT coalesce(bool_or(assigned),false) FROM records) AS assigned FROM first_five`;

/** Counts material lines, not quantities or catalog stock. Only affected Work Orders are displayed. */
export const workflowVisitMaterialsProjectionSQL = `WITH records AS MATERIALIZED (SELECT * FROM workflow_visit_material_records(v."workspaceId",v.id)),
  first_five AS (SELECT * FROM records ORDER BY number, id LIMIT 5)
  SELECT (array_agg(title ORDER BY number, id))[1] AS title,
    (array_agg("customerName" ORDER BY number, id))[1] AS "customerName",
    jsonb_agg('WO-' || lpad(number::text,greatest(4,length(number::text)),'0') || ' · ' || title || ': ' || needed || ' Needed, ' || ordered || ' Ordered' ORDER BY number, id) AS labels,
    (SELECT count(*) FROM records) AS total, false AS assigned FROM first_five`;

/** A single set-based projection snapshots only five record labels per visit, never every evidence row. */
export async function deliverWorkflowVisits(trx: Knex.Transaction, context: AuthorizationContext, workflowId: string,
  definition: WorkflowDefinition, steps: readonly { id: string; visitId: string; visitDate: string }[]) {
  if (!steps.length) return 0;
  if (!isVisitWorkflow(definition) || !canReadWorkflowRecords(context, definition.kind)) throw new AuthorizationAccessError();
  const result = await trx.raw(`SELECT v.id, to_char(v."scheduledDate",'YYYY-MM-DD') AS date, v."arrivalWindow",
      summary.title, summary."customerName", summary.labels, summary.total
    FROM "calendarVisits" v CROSS JOIN LATERAL (${definition.kind === "visit_materials" ? workflowVisitMaterialsProjectionSQL : workflowVisitProjectionSQL}) summary
    WHERE v."workspaceId" = ? AND v.id = ANY(?::uuid[]) AND summary.total > 0`, [context.workspaceId, steps.map(step => step.visitId)]);
  const byId = new Map<string, { snapshot: unknown; stepId: string; date: string }>();
  for (const row of result.rows) {
    const step = steps.find(step => step.visitId === row.id && step.visitDate === row.date);
    if (!step) continue;
    byId.set(row.id, { stepId: step.id, date: row.date, snapshot: workflowVisitSnapshotSchema.parse({
      ...(definition.kind === "visit_materials" ? { reason: "materials" } : {}),
      title: row.title, customerName: row.customerName, scheduledDate: row.date, arrivalWindow: row.arrivalWindow,
      timezone: definition.timezone, recordLabels: row.labels, totalRecords: Number(row.total),
    }) });
  }
  if (!byId.size) return 0;
  const notices = await trx("workflowVisitNotifications").insert([...byId].map(([visitId, row]) => ({ id: randomUUID(),
    workspaceId: context.workspaceId, workflowId, stepId: row.stepId, visitId, scheduledDate: row.date, userId: definition.recipientId,
    snapshot: JSON.stringify(row.snapshot), inApp: definition.notifications?.inApp ?? true, emailStatus: definition.notifications?.email ? "queued" : "skipped",
  }))).onConflict(["workspaceId", "workflowId", "visitId", "scheduledDate", "userId"]).ignore().returning("id");
  await trx("workflowSteps").where({ workspaceId: context.workspaceId, workflowId }).whereIn("id", [...byId.values()].map(row => row.stepId))
    .update({ status: "completed" });
  return notices.length;
}

export const reviewedWorkflowVisitsSchema = z.array(z.object({ id: z.uuid(), date: z.iso.date() }).strict()).max(100);

/** Bounded initialization for this workflow only. Cursor state and next queue handoff commit together. */
export async function initializeWorkflowVisits(db: Knex, workspaceId: string, stepId: string, enabled: readonly PermissionId[] = permissionIds) {
  const candidate = await db("workflowSteps as s").join("workflows as w", "w.id", "s.workflowId")
    .where({ "s.id": stepId, "s.workspaceId": workspaceId, "s.status": "queued", "s.recordKind": "visit_init", "w.status": "active" }).first("w.publisherId");
  if (!candidate?.publisherId) return { enrolled: 0 };
  try {
    return await withWorkspaceAuthorization(db, { workspaceId, userId: candidate.publisherId }, enabled, true, async (trx, context) => {
      const step = await trx("workflowSteps as s").join("workflows as w", function () {
        this.on("w.id", "s.workflowId").andOn("w.workspaceId", "s.workspaceId");
      }).where({ "s.id": stepId, "s.workspaceId": workspaceId, "s.status": "queued", "w.status": "active" })
        .first("s.workflowId", "s.cursorDate", "s.cursorId", "w.definition", "w.publisherId");
      if (!step || step.publisherId !== candidate.publisherId) return { enrolled: 0 };
      const definition = workflowDefinitionSchema.parse(step.definition);
      if (!isVisitWorkflow(definition) || !canPublishWorkflow(context, definition.kind) ||
        !await workflowParticipantsEligible(trx, context, definition, candidate.publisherId)) return { enrolled: 0 };
      const query = trx("calendarVisits").where({ workspaceId }).whereRaw(`"scheduledDate" > (clock_timestamp() AT TIME ZONE ?)::date`, [definition.timezone]);
      if (step.cursorDate && step.cursorId) query.whereRaw('("scheduledDate",id) > (?::date,?::uuid)', [step.cursorDate, step.cursorId]);
      const rows = await query.orderBy("scheduledDate").orderBy("id").limit(100)
        .select("id", trx.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS date`));
      if (rows.length) await trx.raw(`SELECT workflow_sync_visit(?,id,?) FROM unnest(?::uuid[]) AS id`, [workspaceId, step.workflowId, rows.map(row => row.id)]);
      const last = rows.at(-1);
      await trx("workflowSteps").where({ id: stepId, workspaceId }).update({ status: rows.length === 100 ? "queued" : "completed",
        ...(last ? { cursorDate: last.date, cursorId: last.id } : {}), dueAt: new Date(Date.now() + 50) });
      return { enrolled: rows.length };
    });
  } catch (error) {
    if (error instanceof AuthorizationAccessError) return { enrolled: 0 };
    throw error;
  }
}
