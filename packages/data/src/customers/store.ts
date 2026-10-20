import { createHash, randomUUID } from "node:crypto";
import type { Knex } from "knex";
import {
  customerCreateSchema,
  customerMutationSchema,
  customerQuerySchema,
  customerExportSchema,
  type CustomerQuery,
  type CustomerValues,
  type CustomerRecord,
  type CustomerCapabilities,
  type CustomerListResult,
  type CustomerDetailResult,
  type CustomerLead,
  type PermissionId,
  type AuthorizationContext,
} from "@salesmora/contracts";
import { authorize, resolveAuthorizedCollectionScope } from "@salesmora/domain";
import {
  AuthorizationAccessError,
  withWorkspaceAuthorization,
  type WorkspaceIdentity,
} from "../authorization/store";
import { csvLine } from "../leads/csv";
export class CustomerConflictError extends Error {
  constructor(
    message = "This record changed. Reload its latest details before trying again.",
  ) {
    super(message);
  }
}
export class CustomerValidationError extends Error {}
export class CustomerDuplicateError extends Error {
  constructor(
    public readonly matches: {
      id: string;
      number: string;
      name: string;
      reason: "email" | "phone" | "name";
    }[],
  ) {
    super("This customer may already exist.");
  }
}
type Row = Omit<CustomerValues, "ownerId"> & {
  id: string;
  workspaceId: string;
  customerNumber: number;
  ownerId: string | null;
  version: number;
  createdAt: Date;
  lastActivityAt: Date;
  archivedAt: Date | null;
  openLeadCount: number;
};
const number = (n: number) => `CU-${String(n).padStart(4, "0")}`;
const resource = (context: AuthorizationContext, id = context.workspaceId) => ({
  kind: "customer" as const,
  id,
  workspaceId: context.workspaceId,
  related: [],
});
function permission(context: AuthorizationContext, id: PermissionId) {
  return authorize(context, { permission: id, resource: resource(context) })
    .allowed;
}
export function customerCapabilities(
  context: AuthorizationContext,
): CustomerCapabilities {
  const scope = resolveAuthorizedCollectionScope(context, "customers.read");
  const read = scope.allowed && scope.scope === "workspace";
  return {
    read,
    create:
      read && authorize(context, { permission: "customers.create" }).allowed,
    update: read && permission(context, "customers.update"),
    archive: read && permission(context, "customers.archive"),
    delete: read && permission(context, "customers.delete"),
    export: read && permission(context, "customers.export"),
    link:
      read &&
      permission(context, "customers.update") &&
      resolveAuthorizedCollectionScope(context, "leads.read").allowed &&
      authorize(context, {
        permission: "leads.update",
        fields: ["customerId"],
        resource: {
          kind: "lead",
          id: context.workspaceId,
          workspaceId: context.workspaceId,
          ownerId: context.userId,
        },
      }).allowed,
    note: read,
  };
}
function requireRead(context: AuthorizationContext) {
  if (!customerCapabilities(context).read) throw new AuthorizationAccessError();
}
function leads(trx: Knex.Transaction, context: AuthorizationContext) {
  const scope = resolveAuthorizedCollectionScope(context, "leads.read");
  const query = trx("leads as l").where("l.workspaceId", context.workspaceId);
  if (!scope.allowed || !["workspace", "assigned"].includes(scope.scope))
    return query.whereRaw("false");
  if (scope.scope === "assigned") query.andWhere("l.ownerId", context.userId);
  return query;
}
function openLeads(trx: Knex.Transaction, context: AuthorizationContext) {
  return leads(trx, context)
    .whereNull("l.archivedAt")
    .whereIn("l.stage", ["new", "contacted", "estimate-sent"]);
}
function baseQuery(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  input: CustomerQuery,
) {
  const query = trx("customers as c").where(
    "c.workspaceId",
    context.workspaceId,
  );
  if (input.archived && !permission(context, "customers.archive"))
    throw new AuthorizationAccessError();
  if (!input.archived) query.whereNull("c.archivedAt");
  if (input.type !== "all") query.andWhere("c.type", input.type);
  if (input.owner !== "all") {
    if (input.owner === "unassigned") query.whereNull("c.ownerId");
    else query.andWhere("c.ownerId", input.owner);
  }
  if (input.relationship === "lead")
    query.whereExists(
      openLeads(trx, context)
        .whereRaw("?? = ??", ["l.customerId", "c.id"])
        .select(trx.raw("1")),
    );
  if (input.q) {
    const pattern = "%" + input.q.replace(/[\\%_]/g, "\\$&") + "%";
    const digits = input.q.replace(/\D/g, "");
    query.andWhere(function () {
      this.whereILike("c.name", pattern)
        .orWhereILike("c.email", pattern)
        .orWhereILike("c.phone", pattern);
      if (digits && /^[+()\d\s.-]+$/.test(input.q))
        this.orWhereRaw(`regexp_replace(c.phone,'[^0-9]','','g') LIKE ?`, [
          "%" + digits + "%",
        ]);
    });
  }
  return query;
}
function selected(
  query: Knex.QueryBuilder,
  trx: Knex.Transaction,
  context: AuthorizationContext,
) {
  const fields = [
    "id",
    "workspaceId",
    "customerNumber",
    "name",
    "type",
    "companyName",
    "email",
    "phone",
    "location",
    "internalNotes",
    "ownerId",
    "version",
    "createdAt",
    "archivedAt",
  ].map((key) => `c.${key}`);
  return query
    .select(fields)
    .select(
      openLeads(trx, context)
        .whereRaw("?? = ??", ["l.customerId", "c.id"])
        .count("*")
        .as("openLeadCount"),
    )
    .select(
      trx.raw("greatest(c.??,coalesce((?),c.??)) as ??", [
        "lastActivityAt",
        leads(trx, context)
          .whereRaw("?? = ??", ["l.customerId", "c.id"])
          .max("l.lastActivityAt"),
        "lastActivityAt",
        "lastActivityAt",
      ]),
    );
}
function dto(row: Row): CustomerRecord {
  return {
    id: row.id,
    number: number(row.customerNumber),
    name: row.name,
    type: row.type,
    companyName: row.companyName,
    email: row.email,
    phone: row.phone,
    location: row.location,
    internalNotes: row.internalNotes,
    ownerId: row.ownerId ?? "",
    version: row.version,
    archived: !!row.archivedAt,
    createdAt: row.createdAt.toISOString(),
    lastActivityAt: row.lastActivityAt.toISOString(),
    openLeadCount: Number(row.openLeadCount),
  };
}
async function members(trx: Knex.Transaction, context: AuthorizationContext) {
  return trx("workspaceMemberships as m")
    .join("users as u", "u.id", "m.userId")
    .where("m.workspaceId", context.workspaceId)
    .whereNull("u.deletionRequestedAt")
    .orderBy("u.name")
    .orderBy("u.id")
    .select<{ id: string; name: string }[]>("u.id", "u.name");
}
export async function readCustomers(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  raw: CustomerQuery,
): Promise<CustomerListResult> {
  const input = customerQuerySchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId)
    throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(
    db,
    identity,
    enabled,
    false,
    async (trx, context) => {
      requireRead(context);
      const base = baseQuery(trx, context, input);
      const total = Number(
        (await base.clone().count({ n: "c.id" }).first())?.n ?? 0,
      );
      const page = Math.min(
        input.page,
        Math.max(1, Math.ceil(total / input.pageSize)),
      );
      const order =
        input.sort === "activity"
          ? "lastActivityAt"
          : input.sort === "newest"
            ? "c.createdAt"
            : "c.name";
      const direction = input.sort === "name" ? "asc" : "desc";
      const rows = (await selected(base.clone(), trx, context)
        .orderBy(order, direction)
        .orderBy("c.id")
        .offset((page - 1) * input.pageSize)
        .limit(input.pageSize)) as Row[];
      const all = baseQuery(
        trx,
        context,
        customerQuerySchema.parse({ workspaceId: identity.workspaceId }),
      );
      const customers = Number(
        (await all.clone().count({ n: "c.id" }).first())?.n ?? 0,
      );
      const withOpenLeads = Number(
        (
          await all
            .clone()
            .whereExists(
              openLeads(trx, context)
                .whereRaw("?? = ??", ["l.customerId", "c.id"])
                .select(trx.raw("1")),
            )
            .count({ n: "c.id" })
            .first()
        )?.n ?? 0,
      );
      return {
        rows: rows.map(dto),
        total,
        page,
        members: await members(trx, context),
        capabilities: customerCapabilities(context),
        totals: { customers, withOpenLeads },
        policyRevision: context.policy.revision,
        now: new Date().toISOString(),
      };
    },
  );
}
async function record(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  id: string,
  lock = false,
) {
  requireRead(context);
  const q = trx("customers as c").where({
    "c.id": id,
    "c.workspaceId": context.workspaceId,
  });
  const row = await (
    lock ? q.forUpdate() : selected(q, trx, context)
  ).first<Row>();
  if (!row) throw new AuthorizationAccessError();
  return row;
}
function leadDTO(row: {
  id: string;
  leadNumber: number;
  name: string;
  service: string;
  stage: string;
  version: number;
  customerId: string | null;
  customerName?: string;
}): CustomerLead {
  return {
    id: row.id,
    number: `LD-${String(row.leadNumber).padStart(4, "0")}`,
    name: row.service,
    status:
      (
        {
          new: "New",
          contacted: "Contacted",
          "estimate-sent": "Estimate sent",
          won: "Won",
          lost: "Lost",
        } as Record<string, string>
      )[row.stage] ?? row.stage,
    version: row.version,
    customerId: row.customerId,
    ...(row.customerName ? { customerName: row.customerName } : {}),
  };
}
const eventLabels: Record<string, string> = {
  created: "Customer created",
  updated: "Contact details updated",
  archived: "Customer archived",
  restored: "Customer restored",
  linked: "Lead linked",
  unlinked: "Lead unlinked",
  note: "Team note added",
};
export async function readCustomer(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  id: string,
  activityPage = 1,
  notesPage = 1,
  leadsPage = 1,
): Promise<CustomerDetailResult> {
  if (
    !/^[0-9a-f-]{36}$/i.test(id) ||
    ![activityPage, notesPage, leadsPage].every(
      (p) => Number.isInteger(p) && p > 0 && p <= 100000,
    )
  )
    throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(
    db,
    identity,
    enabled,
    false,
    async (trx, context) => {
      const customer = dto(await record(trx, context, id));
      const linkedCount = Number(
        (
          await leads(trx, context)
            .where("l.customerId", id)
            .count({ n: "l.id" })
            .first()
        )?.n ?? 0,
      );
      const linked = await leads(trx, context)
        .where("l.customerId", id)
        .orderBy("l.leadNumber")
        .limit(20)
        .offset(
          (Math.min(leadsPage, Math.max(1, Math.ceil(linkedCount / 20))) - 1) *
            20,
        )
        .select(
          "l.id",
          "l.leadNumber",
          "l.name",
          "l.service",
          "l.stage",
          "l.version",
          "l.customerId",
          "l.ownerId",
        );
      const activity = trx("customerActivity").where({
        workspaceId: identity.workspaceId,
        customerId: id,
      });
      const customerEvents = activity
        .clone()
        .select(
          trx.raw("concat('customer:',id) as id"),
          "type",
          "actorName",
          "createdAt",
          trx.raw("'customer' as source"),
        );
      const linkedEvents = leads(trx, context)
        .where("l.customerId", id)
        .join("leadActivity as a", function () {
          this.on("a.leadId", "l.id").andOn("a.workspaceId", "l.workspaceId");
        })
        .select(
          trx.raw("concat('lead:',a.id) as id"),
          "a.type",
          "a.actorName",
          "a.createdAt",
          trx.raw("'lead' as source"),
        );
      const history = trx
        .queryBuilder()
        .unionAll([customerEvents, linkedEvents], true)
        .as("history");
      const activityTotal = Number(
        (await trx.from(history).count({ n: "id" }).first())?.n ?? 0,
      );
      const events = await trx
        .from(history)
        .select("*")
        .orderBy("createdAt", "desc")
        .orderBy("id", "desc")
        .offset(
          (Math.min(activityPage, Math.max(1, Math.ceil(activityTotal / 20))) -
            1) *
            20,
        )
        .limit(20);
      const noteQuery = activity.clone().andWhere("type", "note");
      const notesTotal = Number(
        (await noteQuery.clone().count({ n: "id" }).first())?.n ?? 0,
      );
      const notes = await noteQuery
        .orderBy("createdAt", "desc")
        .orderBy("id", "desc")
        .offset(
          (Math.min(notesPage, Math.max(1, Math.ceil(notesTotal / 20))) - 1) *
            20,
        )
        .limit(20);
      return {
        customer,
        leads: linked.map((row) => ({
          ...leadDTO(row),
          canUnlink:
            customerCapabilities(context).link &&
            authorize(context, {
              permission: "leads.update",
              fields: ["customerId"],
              resource: {
                kind: "lead",
                id: row.id,
                workspaceId: context.workspaceId,
                ownerId: row.ownerId,
              },
            }).allowed,
        })),
        leadsTotal: linkedCount,
        events: events.map((e) => ({
          id: e.id,
          text:
            e.source === "lead"
              ? "Linked lead activity"
              : (eventLabels[e.type] ?? "Customer updated"),
          actor: e.actorName ?? "Former teammate",
          createdAt: e.createdAt.toISOString(),
          source: e.source as "customer" | "lead",
        })),
        notes: notes.map((n) => ({
          id: n.id,
          body: n.body,
          author: n.actorName,
          createdAt: n.createdAt.toISOString(),
        })),
        activityTotal,
        notesTotal,
        members: await members(trx, context),
        capabilities: customerCapabilities(context),
        policyRevision: context.policy.revision,
      };
    },
  );
}
export async function searchCustomerLeads(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  id: string,
  q: string,
) {
  if (q.length > 200) throw new CustomerValidationError("Search is too long.");
  return withWorkspaceAuthorization(
    db,
    identity,
    enabled,
    false,
    async (trx, context) => {
      const c = await record(trx, context, id);
      if (!customerCapabilities(context).link || c.archivedAt)
        throw new AuthorizationAccessError();
      const pattern = "%" + q.replace(/[\\%_]/g, "\\$&") + "%";
      const writable = authorize(context, {
        permission: "leads.update",
        fields: ["customerId"],
        resource: {
          kind: "lead",
          id: context.workspaceId,
          workspaceId: context.workspaceId,
          ownerId: context.userId,
        },
      });
      const result = await leads(trx, context)
        .modify((query) => {
          if (writable.allowed && writable.scope === "assigned")
            query.andWhere("l.ownerId", context.userId);
        })
        .whereNull("l.archivedAt")
        .andWhere(function () {
          this.whereILike("l.name", pattern).orWhereILike("l.service", pattern);
          if (
            /^LD-\d+$/i.test(q) &&
            Number.isSafeInteger(Number(q.slice(3))) &&
            Number(q.slice(3)) <= 2147483647
          )
            this.orWhere("l.leadNumber", Number(q.slice(3)));
        })
        .leftJoin("customers as other", function () {
          this.on("other.id", "l.customerId").andOn(
            "other.workspaceId",
            "l.workspaceId",
          );
        })
        .orderBy("l.leadNumber")
        .limit(25)
        .select(
          "l.id",
          "l.leadNumber",
          "l.name",
          "l.service",
          "l.stage",
          "l.version",
          "l.customerId",
          "l.ownerId",
          "other.name as customerName",
        );
      return result.map(leadDTO);
    },
  );
}
async function ownerValid(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  ownerId: string,
) {
  if (
    ownerId &&
    !(await trx("workspaceMemberships as m")
      .join("users as u", "u.id", "m.userId")
      .where({ "m.workspaceId": context.workspaceId, "m.userId": ownerId })
      .whereNull("u.deletionRequestedAt")
      .first("u.id"))
  )
    throw new CustomerValidationError("Choose a current workspace member.");
}
async function event(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  id: string,
  type: string,
  body = "",
) {
  const actor = await trx("users").where("id", context.userId).first("name");
  await trx("customerActivity").insert({
    id: randomUUID(),
    workspaceId: context.workspaceId,
    customerId: id,
    actorId: context.userId,
    actorName: actor.name,
    type,
    body,
  });
}
async function replay(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  id: string,
  action: string,
  hash: string,
) {
  const found = await trx("customerOperations").where("id", id).first();
  if (
    found &&
    (found.workspaceId !== context.workspaceId ||
      found.actorId !== context.userId ||
      found.action !== action ||
      found.requestHash !== hash)
  )
    throw new CustomerConflictError(
      "This submission was already used with different details.",
    );
  return found;
}
export async function createCustomer(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  raw: unknown,
) {
  const input = customerCreateSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId)
    throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(
    db,
    identity,
    enabled,
    true,
    async (trx, context) => {
      requireRead(context);
      if (!customerCapabilities(context).create)
        throw new AuthorizationAccessError();
      const hash = createHash("sha256")
        .update(JSON.stringify(input))
        .digest("hex");
      const previous = await replay(
        trx,
        context,
        input.submissionId,
        "create",
        hash,
      );
      if (previous) {
        await record(trx, context, previous.customerId);
        return { customerId: previous.customerId };
      }
      await ownerValid(trx, context, input.values.ownerId);
      const v = input.values;
      const possible = await trx("customers")
        .where("workspaceId", identity.workspaceId)
        .andWhere(function () {
          this.whereRaw("lower(name)=lower(?)", [v.name]);
          if (v.email) this.orWhereRaw("lower(email)=lower(?)", [v.email]);
          if (v.phone)
            this.orWhereRaw(`regexp_replace(phone,'[^0-9]','','g')=?`, [
              v.phone.replace(/\D/g, ""),
            ]);
        })
        .orderBy("customerNumber")
        .limit(10);
      if (possible.length && !input.allowDuplicate)
        throw new CustomerDuplicateError(
          possible.map((row) => ({
            id: row.id,
            number: number(row.customerNumber),
            name: row.name,
            reason:
              v.email && row.email.toLowerCase() === v.email.toLowerCase()
                ? "email"
                : v.phone &&
                    row.phone.replace(/\D/g, "") === v.phone.replace(/\D/g, "")
                  ? "phone"
                  : "name",
          })),
        );
      const id = randomUUID();
      await trx("customers").insert({
        ...v,
        ownerId: v.ownerId || null,
        id,
        workspaceId: identity.workspaceId,
      });
      await event(trx, context, id, "created");
      await trx("customerOperations").insert({
        id: input.submissionId,
        workspaceId: identity.workspaceId,
        actorId: identity.userId,
        action: "create",
        requestHash: hash,
        customerId: id,
        version: 1,
      });
      return { customerId: id };
    },
  );
}
export async function mutateCustomer(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  raw: unknown,
) {
  const input = customerMutationSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId)
    throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(
    db,
    identity,
    enabled,
    true,
    async (trx, context) => {
      requireRead(context);
      const permissionId =
        input.action === "note"
          ? "customers.read"
          : input.action === "archive"
            ? "customers.archive"
            : input.action === "delete"
              ? "customers.delete"
              : "customers.update";
      if (!permission(context, permissionId))
        throw new AuthorizationAccessError();
      const hash = createHash("sha256")
        .update(JSON.stringify(input))
        .digest("hex");
      const previous = await replay(
        trx,
        context,
        input.submissionId,
        input.action,
        hash,
      );
      if (previous) {
        if (input.action !== "delete")
          await record(trx, context, input.customerId);
        return {
          customerId: input.customerId,
          version: previous.version,
          deleted: input.action === "delete",
        };
      }
      const customer = await record(trx, context, input.customerId, true);
      if (input.action !== "note" && customer.version !== input.expectedVersion)
        throw new CustomerConflictError();
      if (customer.archivedAt && !["archive", "delete"].includes(input.action))
        throw new CustomerConflictError(
          "Restore this customer before making changes.",
        );
      const version = customer.version + 1;
      let type = "updated";
      const patch: Record<string, unknown> = {
        version,
        updatedAt: trx.fn.now(),
        lastActivityAt: trx.fn.now(),
      };
      if (input.action === "update") {
        await ownerValid(trx, context, input.values.ownerId);
        Object.assign(patch, input.values, {
          ownerId: input.values.ownerId || null,
        });
      }
      if (input.action === "archive") {
        patch.archivedAt = input.archived ? trx.fn.now() : null;
        type = input.archived ? "archived" : "restored";
      }
      if (input.action === "note") type = "note";
      if (input.action === "link") {
        const lead = await leads(trx, context)
          .where("l.id", input.leadId)
          .forUpdate()
          .first();
        if (
          !lead ||
          !authorize(context, {
            permission: "leads.update",
            fields: ["customerId"],
            resource: {
              kind: "lead",
              id: lead.id,
              workspaceId: identity.workspaceId,
              ownerId: lead.ownerId,
            },
          }).allowed
        )
          throw new AuthorizationAccessError();
        if (
          lead.archivedAt ||
          lead.version !== input.expectedLeadVersion ||
          lead.customerId !== input.expectedPreviousCustomerId
        )
          throw new CustomerConflictError(
            "This lead changed. Search again and review its current customer link.",
          );
        if (
          (input.unlink && lead.customerId !== customer.id) ||
          (!input.unlink &&
            lead.customerId &&
            lead.customerId !== customer.id &&
            !input.replace)
        )
          throw new CustomerConflictError(
            "Confirm replacement of the existing customer link.",
          );
        if (lead.customerId && lead.customerId !== customer.id) {
          const old = await record(trx, context, lead.customerId, true);
          await trx("customers")
            .where({ id: old.id, workspaceId: identity.workspaceId })
            .update({
              version: old.version + 1,
              lastActivityAt: trx.fn.now(),
              updatedAt: trx.fn.now(),
            });
          await event(trx, context, old.id, "unlinked");
        }
        await trx("leads")
          .where({ id: lead.id, workspaceId: identity.workspaceId })
          .update({
            customerId: input.unlink ? null : customer.id,
            version: lead.version + 1,
            updatedAt: trx.fn.now(),
            lastActivityAt: trx.fn.now(),
          });
        type = input.unlink ? "unlinked" : "linked";
      }
      if (input.action === "delete") {
        if (input.typedConfirmation !== number(customer.customerNumber))
          throw new CustomerValidationError(
            "Type the exact customer number to confirm deletion.",
          );
        const linked = await trx("leads")
          .where({ workspaceId: identity.workspaceId, customerId: customer.id })
          .forUpdate()
          .select("id", "ownerId", "stage", "archivedAt");
        // Compatible with the pre-foundation local schema while Jobs remains disabled.
        if (await trx.schema.hasTable("jobs")) {
          const activeJob = await trx("jobs").where({ workspaceId: identity.workspaceId, customerId: customer.id })
            .whereNotIn("status", ["completed", "canceled"]).first("id");
          if (activeJob) throw new CustomerValidationError("Complete or cancel this customer's active jobs before deleting the customer.");
        }
        if (
          linked.some(
            (l) =>
              !l.archivedAt &&
              ["new", "contacted", "estimate-sent"].includes(l.stage),
          ) &&
          !input.unlinkOpenLeads
        )
          throw new CustomerValidationError(
            "Confirm that open leads will be unlinked and retained.",
          );
        for (const l of linked)
          if (
            !authorize(context, {
              permission: "leads.read",
              resource: {
                kind: "lead",
                id: l.id,
                workspaceId: identity.workspaceId,
                ownerId: l.ownerId,
              },
            }).allowed ||
            !authorize(context, {
              permission: "leads.update",
              fields: ["customerId"],
              resource: {
                kind: "lead",
                id: l.id,
                workspaceId: identity.workspaceId,
                ownerId: l.ownerId,
              },
            }).allowed
          )
            throw new AuthorizationAccessError();
        await trx("leads")
          .where({ workspaceId: identity.workspaceId, customerId: customer.id })
          .update({
            customerId: null,
            version: trx.raw("version+1"),
            updatedAt: trx.fn.now(),
            lastActivityAt: trx.fn.now(),
          });
        await trx("customers")
          .where({ id: customer.id, workspaceId: identity.workspaceId })
          .delete();
      } else {
        await trx("customers")
          .where({ id: customer.id, workspaceId: identity.workspaceId })
          .update(patch);
        await event(
          trx,
          context,
          customer.id,
          type,
          input.action === "note" ? input.body : "",
        );
      }
      await trx("customerOperations").insert({
        id: input.submissionId,
        workspaceId: identity.workspaceId,
        customerId: customer.id,
        actorId: identity.userId,
        action: input.action,
        requestHash: hash,
        version,
      });
      return {
        customerId: customer.id,
        version,
        deleted: input.action === "delete",
      };
    },
  );
}
export async function exportCustomers(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  raw: unknown,
) {
  const input = customerExportSchema.parse(raw);
  if (input.query.workspaceId !== identity.workspaceId)
    throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(
    db,
    identity,
    enabled,
    true,
    async (trx, context) => {
      requireRead(context);
      if (!permission(context, "customers.export"))
        throw new AuthorizationAccessError();
      const q = baseQuery(trx, context, input.query);
      if (input.customerId) q.andWhere("c.id", input.customerId);
      const total = Number(
        (await q.clone().count({ n: "c.id" }).first())?.n ?? 0,
      );
      if (total !== input.expectedCount || !total || total > 50000)
        throw new CustomerConflictError(
          "Export scope changed or exceeds 50,000 rows. Reload and review the count again.",
        );
      const rows = await q
        .clone()
        .select(
          "c.customerNumber",
          "c.name",
          "c.type",
          "c.companyName",
          "c.email",
          "c.phone",
          "c.location",
          "c.ownerId",
          "c.createdAt",
        )
        .orderBy("c.name")
        .orderBy("c.id")
        .limit(50000);
      const roster = await members(trx, context);
      const labels = {
        number: "Customer number",
        name: "Name",
        type: "Type",
        companyName: "Company",
        email: "Email",
        phone: "Phone",
        location: "Location",
        owner: "Owner",
        createdAt: "Customer since",
      };
      const chunks = [
        "\uFEFF" + csvLine(input.columns.map((key) => labels[key])),
      ];
      let bytes = Buffer.byteLength(chunks[0]);
      for (const row of rows) {
        const cells = {
          ...row,
          number: number(row.customerNumber),
          owner: roster.find((m) => m.id === row.ownerId)?.name ?? "",
          createdAt: row.createdAt.toISOString(),
        };
        const line = csvLine(input.columns.map((key) => cells[key]));
        bytes += Buffer.byteLength(line);
        if (bytes > 32000000)
          throw new CustomerValidationError(
            "Narrow the export filters to reduce the file size.",
          );
        chunks.push(line);
      }
      await trx("customerExportAudit").insert({
        id: randomUUID(),
        workspaceId: identity.workspaceId,
        actorId: identity.userId,
        rowCount: total,
      });
      return chunks.join("");
    },
  );
}

/** Minimal related contact: only the exact currently readable assigned lead can expose it. */
export async function relatedCustomerForLead(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  leadId: string,
) {
  if (
    !context.enabledPermissions.includes("customers.related.read") &&
    !context.enabledPermissions.includes("customers.read")
  )
    return undefined;
  const lead = await leads(trx, context)
    .where("l.id", leadId)
    .first("l.id", "l.customerId", "l.ownerId", "l.name", "l.email", "l.phone");
  if (
    !lead?.customerId ||
    (context.membership.role === "field" && lead.ownerId !== context.userId)
  )
    return undefined;
  const ref = {
    kind: "lead" as const,
    id: lead.id,
    workspaceId: context.workspaceId,
    ownerId: lead.ownerId,
  };
  const target = {
    kind: "customer" as const,
    id: lead.customerId,
    workspaceId: context.workspaceId,
    related: [ref],
  };
  const full = authorize(context, {
    permission: "customers.read",
    resource: target,
  }).allowed;
  if (
    !full &&
    !authorize(context, {
      permission: "customers.related.read",
      resource: target,
    }).allowed
  )
    return undefined;
  const customer = await trx("customers")
    .where({ workspaceId: context.workspaceId, id: lead.customerId })
    .first("id", "customerNumber", "name", "email", "phone");
  if (!customer) return undefined;
  return {
    name: customer.name,
    number: number(customer.customerNumber),
    email: customer.email,
    phone: customer.phone,
    differs:
      customer.name !== lead.name ||
      customer.email !== lead.email ||
      customer.phone !== lead.phone,
    ...(full ? { customerId: customer.id } : {}),
  };
}
