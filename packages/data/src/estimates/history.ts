import {
  estimateActivityChangesSchema,
  type EstimateHistoryChange, type EstimateHistoryEvent, type EstimateHistorySource,
} from "@salesmora/contracts";
import { EstimateDraftValidationError } from "./drafts";

export type EstimateActivityRow = {
  id: string; createdAt: string; source: string; actorName: string | null; type: string; changes: unknown;
};
/** Only allowlisted metadata is projected; legacy events never gain invented diffs. */
export function projectEstimateActivity(row: EstimateActivityRow): EstimateHistoryEvent {
  const parsed = estimateActivityChangesSchema.safeParse(row.changes);
  if (!parsed.success) throw new EstimateDraftValidationError("The estimate history contains invalid activity. Reload and try again.");
  const changes: EstimateHistoryChange[] = [];
  if (parsed.data.status) changes.push({ kind: "status", ...parsed.data.status });
  if (parsed.data.revision) changes.push({ kind: "revision", ...parsed.data.revision });
  if (parsed.data.convertedJob) changes.push({ kind: "converted-job", number: parsed.data.convertedJob.number });
  for (const field of new Set(parsed.data.fields ?? [])) changes.push({ kind: "field", field });
  const source: EstimateHistorySource | null = row.source === "worker" ? { type: "worker" }
    : row.source === "assistant-confirmed" ? { type: "chat" as const, actorName: row.actorName }
      : row.source === "ui" || row.source === "system" ? { type: row.source, actorName: row.actorName }
        : null;
  if (!source) throw new EstimateDraftValidationError("The estimate history contains an unsupported activity source.");
  const base = { id: row.id, createdAt: new Date(row.createdAt).toISOString(), source, changes };
  switch (row.type) {
    case "created": return { ...base, kind: "created" };
    case "draft.saved": return { ...base, kind: "updated" };
    case "sent": return { ...base, kind: "sent" };
    case "published": return { ...base, kind: "published" };
    case "revision-created": return { ...base, kind: "revision-created" };
    case "superseded": return { ...base, kind: "superseded" };
    case "expired": return { ...base, kind: "expired" };
    case "archived": return { ...base, kind: "archived" };
    case "restored": return { ...base, kind: "restored" };
    case "resent": return { ...base, kind: "delivery-queued" };
    case "email-sent": return { ...base, kind: "delivery-sent" };
    case "delivery-failed": return { ...base, kind: "delivery-failed" };
    case "viewed": return { ...base, kind: "viewed" };
    case "decision-recorded":
      if (!parsed.data.decision) {
        throw new EstimateDraftValidationError("The decision history is missing its recorded details.");
      }
      return { ...base, kind: "decision-recorded", ...parsed.data.decision };
    case "decision-corrected":
      if (!parsed.data.decision || !parsed.data.reason) {
        throw new EstimateDraftValidationError("The correction history is missing its recorded details or reason.");
      }
      return { ...base, kind: "decision-corrected", ...parsed.data.decision, reason: parsed.data.reason };
    case "converted":
      if (!parsed.data.convertedJob) {
        throw new EstimateDraftValidationError("The conversion history is missing its Job reference.");
      }
      return { ...base, kind: "converted" };
    case "voided":
      if (!parsed.data.reason) throw new EstimateDraftValidationError("The withdrawal history is missing its reason.");
      return { ...base, kind: "voided", reason: parsed.data.reason };
    default: throw new EstimateDraftValidationError("The estimate history contains an unsupported activity type.");
  }
}
