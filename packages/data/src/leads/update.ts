import { createHash } from "node:crypto";
import type { Knex } from "knex";
import {
  updateLeadSchema,
  leadEditableFields,
  leadEditedActivitySchema,
  type UpdateLeadInput,
  type AuthorizationContext,
  type PermissionId,
} from "@salesmora/contracts";
import { authorize, resolveAuthorizedCollectionScope } from "@salesmora/domain";
import {
  AuthorizationAccessError,
  withWorkspaceAuthorization,
  type WorkspaceIdentity,
} from "../authorization/store";
import { leadOrigin } from "./origin";
export class LeadEditConflictError extends Error {
  constructor(
    public readonly changedFields: (typeof leadEditableFields)[number][] = [],
  ) {
    super("This lead changed. Reload its latest details before saving.");
  }
}
export class LeadSourceLockedError extends Error {}
/** Frozen expected version, current record authority, update and one field-level event commit together. */
export async function updateLead(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  raw: UpdateLeadInput,
) {
  const input = updateLeadSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId)
    throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, (trx, context) => updateLeadInTransaction(trx, context, input));
}

/** Manual edits and confirmed chat share one authorized, atomic data use case. */
export async function updateLeadInTransaction(trx: Knex.Transaction, context: AuthorizationContext, raw: UpdateLeadInput, actorType: 'user' | 'assistant-confirmed' = 'user', selectedFields?: readonly (typeof leadEditableFields)[number][]) {
  const input = updateLeadSchema.parse(raw);
  const identity = { userId: context.userId, workspaceId: context.workspaceId };
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  if (selectedFields && (!selectedFields.length || selectedFields.some(field => !leadEditableFields.includes(field)))) throw new AuthorizationAccessError();
  const requestedValues = selectedFields ? Object.fromEntries(selectedFields.map(field => [field, input.values[field]])) : input.values;
  const requestHash = createHash('sha256').update(JSON.stringify([input.leadId, input.expectedVersion, requestedValues])).digest('hex');
  const scope = resolveAuthorizedCollectionScope(context, "leads.read");
  if (
    !scope.allowed ||
    scope.resourceKind !== "lead" ||
    !["workspace", "assigned"].includes(scope.scope)
  )
    throw new AuthorizationAccessError();
  const query = trx("leads").where({
    id: input.leadId,
    workspaceId: identity.workspaceId,
  });
  if (scope.scope === "assigned")
    query.andWhere("ownerId", identity.userId);
  const lead = await query.forUpdate().first();
  if (
    !lead ||
    !authorize(context, {
      permission: "leads.update",
      fields: selectedFields ? [...selectedFields] : Object.keys(input.values),
      resource: {
        kind: "lead",
        id: lead.id,
        workspaceId: identity.workspaceId,
        ownerId: lead.ownerId,
      },
    }).allowed
  )
    throw new AuthorizationAccessError();
  const previous = await trx("leadActivity")
    .where({ id: input.submissionId, workspaceId: identity.workspaceId })
    .first();
  if (previous) {
    if (
      previous.leadId !== lead.id ||
      previous.actorId !== identity.userId ||
      previous.type !== "edited" ||
      previous.changes.requestHash !== requestHash
    )
      throw new LeadEditConflictError();
    return { version: lead.version };
  }
  if (lead.archivedAt) throw new LeadEditConflictError();
  if (lead.version !== input.expectedVersion) {
    const events = await trx("leadActivity")
      .where({
        workspaceId: identity.workspaceId,
        leadId: lead.id,
        type: "edited",
      })
      .whereRaw("(changes->>'toVersion')::integer > ?", [
        input.expectedVersion,
      ])
      .select("changes");
    const changed = new Set<(typeof leadEditableFields)[number]>();
    for (const event of events) {
      const parsed = leadEditedActivitySchema.safeParse(event.changes);
      if (parsed.success)
        for (const change of parsed.data.fields) changed.add(change.field);
    }
    throw new LeadEditConflictError([...changed]);
  }
  const creation = await trx("leadActivity")
    .where({
      id: lead.id,
      workspaceId: identity.workspaceId,
      type: "created",
    })
    .first("changes");
  const origin = leadOrigin(creation?.changes);
  if (
    origin !== "manual" &&
    (!selectedFields || selectedFields.includes("source")) &&
    input.values.source !== undefined &&
    input.values.source !== lead.source
  )
    throw new LeadSourceLockedError();
  // Chat applies exactly the reviewed fields, even if legacy untouched values normalize differently.
  const values: Partial<UpdateLeadInput['values']> = selectedFields
    ? Object.fromEntries(selectedFields.map(field => [field, input.values[field] ?? lead[field]]))
    : { ...input.values, source: input.values.source ?? lead.source };
  const fields = leadEditableFields
    .filter((field) => Object.hasOwn(values, field) && values[field] !== lead[field])
    .map((field) => ({
      field,
      before: lead[field] as string,
      after: values[field],
    }));
  if (!fields.length) return { version: lead.version };
  const version = lead.version + 1,
    now = new Date(),
    actor = await trx("users").where({ id: identity.userId }).first("name");
  const updated = await trx("leads")
    .where({
      id: lead.id,
      workspaceId: identity.workspaceId,
      version: input.expectedVersion,
    })
    .update({ ...values, version, updatedAt: now, lastActivityAt: now });
  if (updated !== 1) throw new LeadEditConflictError();
  await trx("leadActivity").insert({
    id: input.submissionId,
    workspaceId: identity.workspaceId,
    leadId: lead.id,
    actorId: identity.userId,
    actorName: actor.name,
    actorType,
    type: "edited",
    changes: JSON.stringify({
      fromVersion: lead.version,
      toVersion: version,
      fields,
      requestHash,
    }),
    createdAt: now,
  });
  return { version };
}
