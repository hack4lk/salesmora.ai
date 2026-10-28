import { createHash, randomUUID } from "node:crypto";
import type { Knex } from "knex";
import {
  estimateArchiveCommandSchema, estimateHistoryQuerySchema, voidEstimateSchema,
  type AuthorizationContext, type EstimateArchiveReceipt, type EstimateLifecycleRead, type EstimateVoidReceipt, type PermissionId,
} from "@salesmora/contracts";
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from "../authorization/store";
import { EstimateDraftConflictError, EstimateDraftValidationError, loadEstimateLifecycleContext } from "./drafts";
import { stopEstimateDeliveries } from "./delivery";
import { projectEstimateActivity, type EstimateActivityRow } from "./history";

export async function readEstimateLifecycle(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown,
): Promise<EstimateLifecycleRead> {
  const input = estimateHistoryQuerySchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const { row, status, timezone, canVoid } = await loadEstimateLifecycleContext(trx, context, input.estimateId);
    const history = trx("estimate_activity").where({ workspaceId: identity.workspaceId, estimateId: row.id });
    const total = Number((await history.clone().count({ count: "*" }).first())?.count ?? 0);
    if (input.before) history.whereRaw('("createdAt", id) < (?::timestamptz, ?::uuid)', [input.before.createdAt, input.before.id]);
    const rows: EstimateActivityRow[] = await history.select("id", "source", "actorName", "type", "changes",
      trx.raw(`to_char("createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "createdAt"`))
      .orderBy("createdAt", "desc").orderBy("id", "desc").limit(26);
    const page = rows.slice(0, 25);
    const last = page.at(-1);
    return {
      estimate: {
        id: row.id, number: `EST-${String(row.estimateNumber).padStart(4, "0")}`, revision: row.revision,
        version: row.version, name: row.name, recipientName: row.recipientName, status, archived: row.archivedAt !== null,
      },
      canVoid, timezone, events: page.map(projectEstimateActivity), total,
      nextCursor: rows.length > 25 && last ? { createdAt: last.createdAt, id: last.id } : null,
    };
  });
}

export async function voidEstimate(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown,
): Promise<EstimateVoidReceipt> {
  const input = voidEstimateSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, (trx, context) =>
    voidEstimateInTransaction(trx, context, input));
}

/** Callers must hold the exclusive workspace authorization transaction. */
export async function voidEstimateInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, raw: unknown,
  source: "ui" | "assistant-confirmed" = "ui",
): Promise<EstimateVoidReceipt> {
  const identity = { userId: context.userId, workspaceId: context.workspaceId };
  const input = voidEstimateSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  const { row, status, canVoid } = await loadEstimateLifecycleContext(trx, context, input.estimateId);
  if (!canVoid) throw new AuthorizationAccessError();
  const inputHash = createHash("sha256").update(JSON.stringify(input)).digest("hex");
  const prior = await trx("estimate_operation_receipts")
    .where({ workspaceId: identity.workspaceId, submissionId: input.submissionId }).first();
  if (prior) {
    if (prior.actorId !== identity.userId || prior.estimateId !== input.estimateId ||
        prior.operation !== "void" || prior.inputHash !== inputHash) {
      throw new EstimateDraftConflictError("This confirmation was already used for a different request.");
    }

    if (row.status !== "void" || row.version !== prior.version) {
      throw new EstimateDraftConflictError("The withdrawn estimate changed. Reload its current details.");
    }
    return { estimateId: row.id, status: "void", version: row.version, updatedAt: row.updatedAt.toISOString() };
  }
  if (row.version !== input.expectedVersion) throw new EstimateDraftConflictError();
  if (row.archivedAt || !["sent", "published"].includes(status)) {
    throw new EstimateDraftValidationError("Only an active Sent or Published estimate can be withdrawn.");
  }
  const [updated] = await trx("estimates").where({ workspaceId: identity.workspaceId, id: row.id, version: input.expectedVersion })
    .update({ status: "void", voidReason: input.reason, version: row.version + 1, updatedAt: trx.fn.now() })
    .returning(["version", "updatedAt"]);
  if (!updated) throw new EstimateDraftConflictError();
  await trx("estimate_share_tokens").where({ workspaceId: identity.workspaceId, estimateId: row.id }).whereNull("revokedAt")
    .update({ revokedAt: trx.fn.now() });
  await stopEstimateDeliveries(trx, identity.workspaceId, row.id);
  const actor = await trx("users").where({ id: identity.userId }).first("name");
  await trx("estimate_activity").insert({
    id: randomUUID(), workspaceId: identity.workspaceId, estimateId: row.id,
    actorId: identity.userId, actorName: actor.name, source, type: "voided",
    changes: JSON.stringify({ status: { before: status, after: "void" }, reason: input.reason }),
  });
  await trx("estimate_operation_receipts").insert({
    workspaceId: identity.workspaceId, submissionId: input.submissionId, actorId: identity.userId,
    operation: "void", inputHash, estimateId: row.id, version: updated.version,
  });
  return { estimateId: row.id, status: "void", version: updated.version, updatedAt: updated.updatedAt.toISOString() };
}

export async function setEstimateArchived(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown,
): Promise<EstimateArchiveReceipt> {
  const input = estimateArchiveCommandSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, (trx, context) =>
    setEstimateArchivedInTransaction(trx, context, input));
}

/** Callers must hold the exclusive workspace authorization transaction. */
export async function setEstimateArchivedInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, raw: unknown,
  source: "ui" | "assistant-confirmed" = "ui",
): Promise<EstimateArchiveReceipt> {
  const identity = { userId: context.userId, workspaceId: context.workspaceId };
  const input = estimateArchiveCommandSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  const { row, status, canArchive } = await loadEstimateLifecycleContext(trx, context, input.estimateId);
  if (!canArchive) throw new AuthorizationAccessError();
  const archived = input.mode === "archive";
  const inputHash = createHash("sha256").update(JSON.stringify(input)).digest("hex");
  const prior = await trx("estimate_operation_receipts")
    .where({ workspaceId: identity.workspaceId, submissionId: input.submissionId }).first();
  if (prior) {
    if (prior.actorId !== identity.userId || prior.estimateId !== row.id ||
        prior.operation !== input.mode || prior.inputHash !== inputHash) {
      throw new EstimateDraftConflictError("This confirmation was already used for a different request.");
    }
    if (row.version !== prior.version || (row.archivedAt !== null) !== archived) {
      throw new EstimateDraftConflictError("The estimate changed. Reload its current details.");
    }
    return { estimateId: row.id, version: row.version, archived, updatedAt: row.updatedAt.toISOString() };
  }
  if (row.version !== input.expectedVersion) throw new EstimateDraftConflictError();
  if (archived) {
    if (row.archivedAt || !["declined", "expired", "superseded", "void"].includes(status)) {
      throw new EstimateDraftValidationError("Only an unarchived Declined, Expired, Superseded or Void estimate can be archived.");
    }
  } else if (!row.archivedAt) {
    throw new EstimateDraftValidationError("Only an archived estimate can be restored.");
  }
  const [updated] = await trx("estimates")
    .where({ workspaceId: identity.workspaceId, id: row.id, version: input.expectedVersion })
    .update({
      archivedAt: archived ? trx.fn.now() : null, archivedBy: archived ? identity.userId : null,
      version: row.version + 1, updatedAt: trx.fn.now(),
    }).returning(["version", "updatedAt"]);
  if (!updated) throw new EstimateDraftConflictError();
  const actor = await trx("users").where({ id: identity.userId }).first("name");
  await trx("estimate_activity").insert({
    id: randomUUID(), workspaceId: identity.workspaceId, estimateId: row.id,
    actorId: identity.userId, actorName: actor.name, source, type: archived ? "archived" : "restored",
    changes: JSON.stringify({}),
  });
  await trx("estimate_operation_receipts").insert({
    workspaceId: identity.workspaceId, submissionId: input.submissionId, actorId: identity.userId,
    operation: input.mode, inputHash, estimateId: row.id, version: updated.version,
  });
  return { estimateId: row.id, version: updated.version, archived, updatedAt: updated.updatedAt.toISOString() };
}
