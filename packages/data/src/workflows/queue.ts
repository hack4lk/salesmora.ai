import type { Knex } from "knex";
import { z } from "zod";

export const workflowQueueTicketSchema = z.object({ id: z.uuid(), workspaceId: z.uuid(), version: z.number().int().positive() }).strict();
export type WorkflowQueueTicket = z.infer<typeof workflowQueueTicketSchema>;
export type WorkflowQueueEntry = WorkflowQueueTicket & { availableAt: Date; kind: "handoff_email" | "step" | "estimate_email" | "lead_email" | "briefing_email" | "visit_email" | "assignment_email" | "booking_email" | "cancellation_email" | "service_due_notice_email" | "service_outreach_email";
  handoffNoticeId:string|null;serviceDueNoticeId:string|null;serviceOutreachId:string|null; cancellationNoticeId:string|null; bookingNoticeId:string|null; assignmentNoticeId: string | null; visitNoticeId: string | null; stepId: string | null; estimateNoticeId: string | null; briefingNoticeId: string | null; leadNoticeId: string | null };

/** One shared indexed claim, including expired leases. No workspace/workflow enumeration. */
export async function claimWorkflowQueue(db: Knex, limit = 100): Promise<WorkflowQueueEntry[]> {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError("Invalid workflow queue batch size.");
  const result = await db.raw<{ rows: WorkflowQueueEntry[] }>(`WITH pending AS (
    SELECT id FROM "workflowQueueOutbox" WHERE "completedAt" IS NULL AND "nextDispatchAt" <= now()
    ORDER BY "nextDispatchAt",id FOR UPDATE SKIP LOCKED LIMIT ?
  ) UPDATE "workflowQueueOutbox" o SET "nextDispatchAt" = now() + interval '1 minute', version = version + 1
    FROM pending WHERE o.id = pending.id RETURNING o.*`, [limit]);
  return result.rows;
}

/** A lost Redis job is recovered at most ten minutes after its due time (or last dispatch). */
export async function acknowledgeWorkflowQueue(db: Knex, entries: readonly WorkflowQueueTicket[]) {
  if (!entries.length) return;
  await db.raw(`UPDATE "workflowQueueOutbox" o SET "nextDispatchAt" = greatest(o."availableAt",now()) + interval '10 minutes'
    FROM jsonb_to_recordset(?::jsonb) AS sent(id uuid, version int)
    WHERE o.id = sent.id AND o.version = sent.version AND o."completedAt" IS NULL`, [JSON.stringify(entries.map(({ id, version }) => ({ id, version })))]);
}

export async function readWorkflowQueueEntry(db: Knex, raw: unknown): Promise<WorkflowQueueEntry | undefined> {
  const ticket = workflowQueueTicketSchema.parse(raw);
  return db("workflowQueueOutbox").where(ticket).whereNull("completedAt").first<WorkflowQueueEntry>();
}

/** Queue handoff metadata is transient; the domain schedules and notification history remain intact. */
export async function cleanupWorkflowQueue(db: Knex) {
  const result = await db.raw<{ rowCount: number }>(`DELETE FROM "workflowQueueOutbox" WHERE id IN (
    SELECT id FROM "workflowQueueOutbox" WHERE "completedAt" < now() - interval '7 days'
    ORDER BY "completedAt",id LIMIT 1000 FOR UPDATE SKIP LOCKED)`);
  return result.rowCount;
}
