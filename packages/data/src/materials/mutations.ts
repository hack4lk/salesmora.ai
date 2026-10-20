import { createHash, randomUUID } from "node:crypto";
import type { Knex } from "knex";
import {
  materialMutationSchema,
  type AuthorizationContext,
  type MaterialPatch,
  type MaterialMutation,
  type PermissionId,
} from "@salesmora/contracts";
import {
  AuthorizationAccessError,
  withWorkspaceAuthorization,
  type WorkspaceIdentity,
} from "../authorization/store";
import {
  MaterialConflictError,
  MaterialValidationError,
  materialAccess,
  type MaterialAccess,
  type MaterialRow,
} from "./store";

type Source = "ui" | "assistant-confirmed";
export type MaterialWriteOptions = { source?: Source };
type Patch = MaterialPatch;
const hashInput = (input: unknown) =>
  createHash("sha256").update(JSON.stringify(input)).digest("hex");
const editable = [
  "name",
  "sku",
  "unit",
  "category",
  "supplier",
  "costCents",
  "priceCents",
  "notes",
  "imageUrl",
  "sourceUrl",
] as const;

/** Users can only set the money fields they are allowed to see. */
function assertMoneyAccess(access: MaterialAccess, item: Patch) {
  if (item.costCents !== undefined && !access.viewCosts)
    throw new MaterialValidationError("You cannot set item costs.");
  if (item.priceCents !== undefined && !access.viewPrices)
    throw new MaterialValidationError("You cannot set item prices.");
}
async function assertUniqueSku(
  trx: Knex.Transaction,
  workspaceId: string,
  sku: string,
  exceptId?: string,
) {
  if (!sku) return;
  const clash = await trx("materialCatalog")
    .where({ workspaceId, status: "active" })
    .whereNull("archivedAt")
    .whereRaw("lower(sku) = lower(?)", [sku])
    .modify((q) => {
      if (exceptId) q.whereNot({ id: exceptId });
    })
    .first("name");
  if (clash)
    throw new MaterialValidationError(
      `SKU ${sku} is already used by ${clash.name}.`,
    );
}
async function receipt(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  submissionId: string,
  hash: string,
) {
  const previous = await trx("materialOperations")
    .where({ workspaceId: context.workspaceId, submissionId })
    .first();
  if (
    previous &&
    (previous.actorId !== context.userId || previous.inputHash !== hash)
  )
    throw new MaterialConflictError();
  return previous
    ? {
        materialId: previous.materialId as string,
        version: previous.version as number,
      }
    : undefined;
}
async function finish(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  submissionId: string,
  hash: string,
  materialId: string,
  version: number,
  name: string,
  action: string,
  changes: unknown,
  source: Source,
) {
  await trx("materialAudit").insert({
    id: randomUUID(),
    workspaceId: context.workspaceId,
    materialId,
    materialName: name,
    action,
    actorId: context.userId,
    source,
    changes: JSON.stringify(changes),
  });
  await trx("materialOperations").insert({
    workspaceId: context.workspaceId,
    submissionId,
    actorId: context.userId,
    inputHash: hash,
    materialId,
    version,
  });
  return { materialId, version };
}
async function load(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  id: string,
  version: number,
): Promise<MaterialRow> {
  const row: MaterialRow | undefined = await trx("materialCatalog")
    .where({ workspaceId: context.workspaceId, id })
    .forUpdate()
    .first();
  if (!row) throw new AuthorizationAccessError();
  if (row.version !== version) throw new MaterialConflictError();
  return row;
}
const diff = (row: MaterialRow, patch: Patch) => {
  const from: Record<string, unknown> = {},
    to: Record<string, unknown> = {};
  for (const key of editable)
    if (patch[key] !== undefined && patch[key] !== row[key]) {
      from[key] = row[key];
      to[key] = patch[key];
    }
  return { from, to, changed: Object.keys(to).length > 0 };
};
const values = (item: Patch) =>
  Object.fromEntries(
    editable
      .filter((key) => item[key] !== undefined)
      .map((key) => [key, item[key]]),
  );

type MaterialEvent = "proposed" | "approved" | "edited" | "rejected";

async function notifyUsers(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  materialId: string,
  users: string[],
  event: MaterialEvent,
  name: string,
  reason = "",
) {
  if (!users.length) return;
  const actor = await trx("users").where({ id: context.userId }).first("name");
  await trx("materialNotifications").insert(
    users.map((userId) => ({
      id: randomUUID(),
      workspaceId: context.workspaceId,
      materialId,
      userId,
      event,
      materialName: name,
      reason,
      actorName: actor?.name ?? "",
    })),
  );
}

/** Tells the proposer how their item was decided. Approvers who decide their own proposal are not notified. */
async function notifyProposer(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  row: MaterialRow,
  name: string,
  events: MaterialEvent[],
  reason = "",
) {
  if (!row.proposedBy || row.proposedBy === context.userId) return;
  for (const event of events)
    await notifyUsers(
      trx,
      context,
      row.id,
      [row.proposedBy],
      event,
      name,
      event === "rejected" ? reason : "",
    );
}

/** Owners and admins hear about new proposals; delivery is re-authorized against materials.manage when read. */
async function notifyApprovers(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  materialId: string,
  name: string,
) {
  const members = await trx("workspaceMemberships as m")
    .join("users as u", "u.id", "m.userId")
    .where("m.workspaceId", context.workspaceId)
    .whereIn("m.role", ["owner", "admin"])
    .whereNull("u.deletionRequestedAt")
    .whereNot("m.userId", context.userId)
    .select("m.userId");
  await notifyUsers(
    trx,
    context,
    materialId,
    members.map((member) => member.userId as string),
    "proposed",
    name,
  );
}

export async function mutateMaterial(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  raw: unknown,
  options: MaterialWriteOptions = {},
) {
  const input: MaterialMutation = materialMutationSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId)
    throw new AuthorizationAccessError();
  const source = options.source ?? "ui";
  return withWorkspaceAuthorization(
    db,
    identity,
    enabled,
    true,
    async (trx, context) => {
      const access = materialAccess(context);
      if (!access.read) throw new AuthorizationAccessError();
      const hash = hashInput(input),
        previous = await receipt(trx, context, input.submissionId, hash);
      if (previous) return previous;
      const now = new Date();

      if (input.action === "create" || input.action === "propose") {
        if (!(input.action === "create" ? access.manage : access.propose))
          throw new AuthorizationAccessError();
        assertMoneyAccess(access, input.item);
        const live = input.action === "create";
        if (live)
          await assertUniqueSku(trx, context.workspaceId, input.item.sku);
        const id = randomUUID();
        await trx("materialCatalog").insert({
          id,
          workspaceId: context.workspaceId,
          ...values(input.item),
          status: live ? "active" : "proposed",
          createdBy: context.userId,
          proposedBy: live ? null : context.userId,
          createdAt: now,
          updatedAt: now,
        });
        if (!live) await notifyApprovers(trx, context, id, input.item.name);
        return finish(
          trx,
          context,
          input.submissionId,
          hash,
          id,
          1,
          input.item.name,
          input.action,
          { to: values(input.item) },
          source,
        );
      }

      const row = await load(
        trx,
        context,
        input.materialId,
        input.expectedVersion,
      );
      const bump = async (patch: Record<string, unknown>) => {
        await trx("materialCatalog")
          .where({ id: row.id })
          .update({ ...patch, version: row.version + 1, updatedAt: now });
        return row.version + 1;
      };

      switch (input.action) {
        case "update": {
          if (!access.manage) throw new AuthorizationAccessError();
          if (row.status !== "active" || row.archivedAt)
            throw new MaterialValidationError(
              "Restore this item before editing it.",
            );
          assertMoneyAccess(access, input.item);
          const change = diff(row, input.item);
          if (!change.changed)
            throw new MaterialValidationError("Nothing to change.");
          if (typeof change.to.sku === "string")
            await assertUniqueSku(
              trx,
              context.workspaceId,
              change.to.sku,
              row.id,
            );
          return finish(
            trx,
            context,
            input.submissionId,
            hash,
            row.id,
            await bump(change.to),
            String(change.to.name ?? row.name),
            "update",
            { from: change.from, to: change.to },
            source,
          );
        }
        case "archive": {
          if (!access.manage) throw new AuthorizationAccessError();
          if (row.status !== "active")
            throw new MaterialValidationError(
              "Only approved items can be archived.",
            );
          if (!!row.archivedAt === input.archived)
            throw new MaterialValidationError(
              input.archived
                ? "This item is already archived."
                : "This item is not archived.",
            );
          if (!input.archived)
            await assertUniqueSku(trx, context.workspaceId, row.sku, row.id);
          return finish(
            trx,
            context,
            input.submissionId,
            hash,
            row.id,
            await bump({ archivedAt: input.archived ? now : null }),
            row.name,
            input.archived ? "archive" : "restore",
            {},
            source,
          );
        }
        case "approve": {
          if (!access.manage) throw new AuthorizationAccessError();
          if (row.status !== "proposed")
            throw new MaterialValidationError(
              "Only pending proposals can be approved.",
            );
          assertMoneyAccess(access, input.item);
          const change = diff(row, input.item),
            sku = String(change.to.sku ?? row.sku);
          await assertUniqueSku(trx, context.workspaceId, sku, row.id);
          const version = await bump({
            ...change.to,
            status: "active",
            decidedBy: context.userId,
            decidedAt: now,
          });
          await notifyProposer(
            trx,
            context,
            row,
            String(change.to.name ?? row.name),
            [change.changed ? "edited" : "approved"],
          );
          return finish(
            trx,
            context,
            input.submissionId,
            hash,
            row.id,
            version,
            String(change.to.name ?? row.name),
            "approve",
            { from: change.from, to: change.to },
            source,
          );
        }
        case "reject": {
          if (!access.manage) throw new AuthorizationAccessError();
          if (row.status !== "proposed")
            throw new MaterialValidationError(
              "Only pending proposals can be rejected.",
            );
          const version = await bump({
            status: "rejected",
            decidedBy: context.userId,
            decidedAt: now,
            rejectionReason: input.reason,
          });
          await notifyProposer(
            trx,
            context,
            row,
            row.name,
            ["rejected"],
            input.reason,
          );
          return finish(
            trx,
            context,
            input.submissionId,
            hash,
            row.id,
            version,
            row.name,
            "reject",
            { reason: input.reason },
            source,
          );
        }
        case "withdraw": {
          if (!access.propose || row.proposedBy !== context.userId)
            throw new AuthorizationAccessError();
          if (row.status !== "proposed")
            throw new MaterialValidationError(
              "Only pending proposals can be withdrawn.",
            );
          await trx("materialCatalog").where({ id: row.id }).delete();
          return finish(
            trx,
            context,
            input.submissionId,
            hash,
            row.id,
            row.version,
            row.name,
            "withdraw",
            {},
            source,
          );
        }
      }
    },
  );
}
