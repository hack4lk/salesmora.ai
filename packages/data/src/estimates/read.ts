import type { Knex } from "knex";
import {
  estimateListQuerySchema,
  estimateStatusSchema,
  type AuthorizationContext,
  type EstimateListQuery,
  type EstimateListResult,
  type AuthorizationResource,
  type PermissionId,
  relatedEstimatesQuerySchema,
  estimateCustomerParentsQuerySchema,
  estimateChatFilterSchema,
  estimateChatAgingInputSchema,
  type RelatedEstimatesQuery,
  type RelatedEstimatesResult,
  type EstimateCustomerParentsQuery,
  type EstimateParentOption,
} from "@salesmora/contracts";
import {
  authorize,
  estimateStatusAtDate,
  resolveAuthorizedCollectionScope,
} from "@salesmora/domain";
import {
  AuthorizationAccessError,
  withWorkspaceAuthorization,
  type WorkspaceIdentity,
} from "../authorization/store";
import { readCustomerRecordInTransaction } from "../customers/store";
import { readEstimateParentInTransaction } from "./drafts";

export type EstimateReadScope = "workspace" | "assigned_job";

export const estimateEffectiveStatus = `CASE
  WHEN e.status IN ('sent','published')
    AND e."validUntil" < (now() AT TIME ZONE w.timezone)::date
  THEN 'expired'
  ELSE e.status
END`;

function hasLatestRevision(query: Knex.QueryBuilder, trx: Knex.Transaction) {
  query.whereNotExists(
    trx("estimates as newer")
      .select(trx.raw("1"))
      .whereRaw(
        `newer."workspaceId" = e."workspaceId"
          AND newer."estimateNumber" = e."estimateNumber"
          AND newer.revision > e.revision`,
      ),
  );
  return query;
}

function baseQuery(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  scope: EstimateReadScope,
) {
  const query = trx("estimates as e")
    .leftJoin("leads as l", function joinLead() {
      this.on("l.workspaceId", "e.workspaceId").andOn("l.id", "e.leadId");
    })
    .leftJoin("jobs as j", function joinJob() {
      this.on("j.workspaceId", "e.workspaceId").andOn("j.id", "e.jobId");
    })
    .leftJoin("customers as c", function joinCustomer() {
      this.on("c.workspaceId", "e.workspaceId").andOn(
        "c.id",
        trx.raw('COALESCE(l."customerId", j."customerId")'),
      );
    })
    .leftJoin("users as u", "u.id", "e.ownerId")
    .join("workspaces as w", "w.id", "e.workspaceId")
    .where("e.workspaceId", context.workspaceId);

  if (scope === "assigned_job") {
    query
      .where("e.parentType", "job")
      .whereExists(
        trx("jobs as scoped_job")
          .select(trx.raw("1"))
          .whereRaw(
            `scoped_job."workspaceId" = e."workspaceId"
              AND scoped_job.id = e."jobId"`,
          )
          .andWhere((assigned) =>
            assigned
              .where("scoped_job.primaryOwnerId", context.userId)
              .orWhereExists(
                trx("jobTeamMembers as scoped_team")
                  .select(trx.raw("1"))
                  .whereRaw(
                    `scoped_team."workspaceId" = scoped_job."workspaceId"
                      AND scoped_team."jobId" = scoped_job.id`,
                  )
                  .where("scoped_team.userId", context.userId),
              ),
          ),
      );
  }
  return query;
}

function visibleQuery(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  scope: EstimateReadScope,
  includeHidden: boolean,
) {
  const query = baseQuery(trx, context, scope);
  if (!includeHidden) {
    query.whereNull("e.archivedAt").whereNot("e.status", "superseded");
    hasLatestRevision(query, trx);
  }
  return query;
}

export function filteredEstimateQuery(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  scope: EstimateReadScope,
  input: EstimateListQuery,
) {
  const query = visibleQuery(trx, context, scope, input.includeHidden);
  if (input.status !== "all") query.whereRaw(`${estimateEffectiveStatus} = ?`, [input.status]);
  if (input.parent !== "all") query.where("e.parentType", input.parent);
  if (input.owner === "me") query.where("e.ownerId", context.userId);
  else if (input.owner === "unassigned") query.whereNull("e.ownerId");
  else if (input.owner !== "all") query.where("e.ownerId", input.owner);
  if (input.quickFilter === "awaiting") {
    query.whereRaw(`${estimateEffectiveStatus} IN ('sent','published')`);
  } else if (input.quickFilter === "expiring") {
    query
      .whereRaw(`${estimateEffectiveStatus} IN ('sent','published')`)
      .whereRaw(
        `e."validUntil" BETWEEN (now() AT TIME ZONE w.timezone)::date
          AND (now() AT TIME ZONE w.timezone)::date + 7`,
      );
  }
  if (input.q) {
    const term = input.q.toLocaleLowerCase("en-US");
    query.andWhere((search) =>
      search
        .whereRaw("position(? in lower(e.name)) > 0", [term])
        .orWhereRaw(
          `position(? in lower('EST-' || lpad(e."estimateNumber"::text, 4, '0'))) > 0`,
          [term],
        )
        .orWhereRaw(
          "position(? in lower(COALESCE(c.name, l.name, j.\"customerName\", ''))) > 0",
          [term],
        )
        .orWhereRaw(
          "position(? in lower(COALESCE(l.service, j.service, ''))) > 0",
          [term],
        )
        .orWhereRaw(
          "position(? in lower(COALESCE(e.\"leadId\", e.\"jobId\")::text)) > 0",
          [term],
        ),
    );
  }
  return query;
}

async function assistantTotals(query: Knex.QueryBuilder, trx: Knex.Transaction) {
  const row = await query.clone().select(trx.raw(`
    COUNT(*)::text AS count,
    CASE WHEN COUNT(e."totalCents") = COUNT(*)
      AND COALESCE(SUM(e."totalCents"), 0) <= 9007199254740991
      THEN COALESCE(SUM(e."totalCents"), 0)::text ELSE NULL END AS "totalCents"
  `)).first();
  if (!row) throw new Error("Estimate assistant totals are unavailable.");
  return {
    total: safeInteger(row.count, "assistant result count"),
    totalCents: row.totalCents === null ? null : safeInteger(row.totalCents, "assistant matching total"),
  };
}

async function assistantClock(trx: Knex.Transaction, workspaceId: string) {
  const row = await trx("workspaces").where({ id: workspaceId }).select(
    "timezone",
    trx.raw(`to_char((now() AT TIME ZONE timezone)::date, 'YYYY-MM-DD') AS today`),
    trx.raw(`now() AS "retrievedAt"`),
  ).first();
  if (!row) throw new AuthorizationAccessError();
  return {
    timezone: row.timezone as string,
    today: row.today as string,
    retrievedAt: timestamp(row.retrievedAt as Date | string),
  };
}

export async function readEstimatesForChat(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  raw: unknown,
  exact?: { estimateId?: string; estimateNumber?: number },
) {
  const filters = estimateChatFilterSchema.parse(raw);
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const scope = resolveAuthorizedCollectionScope(context, "estimates.read");
    if (!scope.allowed || !["workspace", "assigned_job"].includes(scope.scope)) {
      throw new AuthorizationAccessError();
    }
    if (
      filters.includeHidden &&
      !resolveAuthorizedCollectionScope(context, "estimates.archive").allowed
    ) {
      throw new AuthorizationAccessError();
    }
    const readScope = scope.scope as EstimateReadScope;
    const listInput = estimateListQuerySchema.parse({
      workspaceId: context.workspaceId,
      q: exact ? "" : filters.query,
      status: filters.status,
      owner: filters.owner,
      parent: filters.parent,
      includeHidden: filters.includeHidden,
      quickFilter: filters.quickFilter,
      sort: "updatedAt",
      direction: "desc",
      page: 1,
      pageSize: 25,
    });
    const query = filteredEstimateQuery(trx, context, readScope, listInput);
    if (exact?.estimateId) query.where("e.id", exact.estimateId);
    if (exact?.estimateNumber !== undefined) {
      query.where("e.estimateNumber", exact.estimateNumber);
    }
    if (filters.customer) {
      query.whereRaw(
        "position(? in lower(COALESCE(c.name, l.name, j.\"customerName\", ''))) > 0",
        [filters.customer.toLocaleLowerCase("en-US")],
      );
    }
    if (filters.minTotalCents !== null) {
      query.where("e.totalCents", ">=", filters.minTotalCents);
    }
    if (filters.maxTotalCents !== null) {
      query.where("e.totalCents", "<=", filters.maxTotalCents);
    }
    if (filters.validUntilFrom) {
      query.where("e.validUntil", ">=", filters.validUntilFrom);
    }
    if (filters.validUntilTo) {
      query.where("e.validUntil", "<=", filters.validUntilTo);
    }

    const totals = await assistantTotals(query, trx);
    const rows = await query
      .clone()
      .select(
        "e.id",
        "e.estimateNumber",
        "e.revision",
        "e.name",
        "e.parentType",
        "e.leadId",
        "e.jobId",
        "e.archivedAt",
        "e.totalCents",
        "e.updatedAt",
        "u.name as ownerName",
        trx.raw(`${estimateEffectiveStatus} as status`),
        trx.raw(`to_char(e."validUntil", 'YYYY-MM-DD') as "validUntil"`),
        trx.raw(`COALESCE(c.name, l.name, j."customerName", '') as customer`),
        trx.raw(
          `CASE WHEN e."parentType" = 'lead'
            THEN 'LD-' || lpad(l."leadNumber"::text, 4, '0')
            ELSE 'J-' || lpad(j."jobNumber"::text, 4, '0')
          END as "parentNumber"`,
        ),
      )
      .orderBy("e.updatedAt", "desc")
      .orderBy("e.id", "asc")
      .limit(filters.limit);

    return {
      type: "estimates-result" as const,
      untrusted: true as const,
      scope: readScope,
      ...await assistantClock(trx, context.workspaceId),
      ...totals,
      truncated: totals.total > rows.length,
      estimates: rows.map((row) => ({
        id: row.id as string,
        number: `EST-${String(row.estimateNumber).padStart(4, "0")}`,
        revision: safeInteger(row.revision, "revision"),
        name: row.name as string,
        status: estimateStatusSchema.parse(row.status),
        customer: row.customer as string,
        parent: row.parentNumber as string,
        parentType: row.parentType as "lead" | "job",
        parentId: (row.parentType === "lead" ? row.leadId : row.jobId) as string,
        archived: row.archivedAt !== null,
        owner: (row.ownerName as string | null) ?? null,
        totalCents:
          row.totalCents === null
            ? null
            : safeInteger(row.totalCents, "total"),
        validUntil: (row.validUntil as string | null) ?? null,
        updatedAt: timestamp(row.updatedAt as Date | string),
      })),
    };
  });
}

export async function readEstimateAgingForChat(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  raw: unknown,
) {
  const input = estimateChatAgingInputSchema.parse(raw);
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const scope = resolveAuthorizedCollectionScope(context, "estimates.read");
    if (!scope.allowed || !["workspace", "assigned_job"].includes(scope.scope)) {
      throw new AuthorizationAccessError();
    }
    const readScope: EstimateReadScope = scope.scope === "workspace" ? "workspace" : "assigned_job";
    const visible = visibleQuery(
      trx,
      context,
      readScope,
      false,
    );
    const queryRows = async (
      query: Knex.QueryBuilder,
      orderExpression: string,
      extraColumn: Knex.Raw | null,
    ) => {
      const totals = await assistantTotals(query, trx);
      const rows = await query
        .clone()
        .select(
          "e.id",
          "e.estimateNumber",
          "e.revision",
          "e.name",
          "e.parentType",
          "e.leadId",
          "e.jobId",
          "e.archivedAt",
          "e.totalCents",
          "u.name as ownerName",
          trx.raw(`${estimateEffectiveStatus} as status`),
          trx.raw(`to_char(e."validUntil", 'YYYY-MM-DD') as "validUntil"`),
          trx.raw(`COALESCE(c.name, l.name, j."customerName", '') as customer`),
          trx.raw(
            `CASE WHEN e."parentType" = 'lead'
              THEN 'LD-' || lpad(l."leadNumber"::text, 4, '0')
              ELSE 'J-' || lpad(j."jobNumber"::text, 4, '0')
            END as "parentNumber"`,
          ),
          ...(extraColumn ? [extraColumn] : []),
        )
        .orderByRaw(`${orderExpression} ASC`)
        .orderBy("e.id", "asc")
        .limit(input.limit);
      return {
        ...totals,
        truncated: totals.total > rows.length,
        estimates: rows.map((row: Record<string, unknown>) => ({
          id: row.id as string,
          number: `EST-${String(row.estimateNumber).padStart(4, "0")}`,
          revision: safeInteger(row.revision, "revision"),
          name: row.name as string,
          status: estimateStatusSchema.parse(row.status),
          customer: row.customer as string,
          parent: row.parentNumber as string,
          parentType: row.parentType as "lead" | "job",
          parentId: (row.parentType === "lead" ? row.leadId : row.jobId) as string,
          archived: row.archivedAt !== null,
          owner: (row.ownerName as string | null) ?? null,
          totalCents:
            row.totalCents === null
              ? null
              : safeInteger(row.totalCents, "total"),
          validUntil: (row.validUntil as string | null) ?? null,
          ...(row.waitingDays === undefined
            ? {}
            : { waitingDays: safeInteger(row.waitingDays, "waiting days") }),
          ...(row.daysUntilExpiry === undefined
            ? {}
            : { daysUntilExpiry: safeInteger(row.daysUntilExpiry, "days until expiry") }),
        })),
      };
    };

    const waitingQuery = visible
      .clone()
      .whereRaw(`${estimateEffectiveStatus} IN ('sent','published')`)
      .whereRaw(
        `COALESCE(e."sentAt", e."publishedAt") IS NOT NULL
          AND (COALESCE(e."sentAt", e."publishedAt") AT TIME ZONE w.timezone)::date
            < ((now() AT TIME ZONE w.timezone)::date - ?::int)`,
        [input.waitingDays],
      );
    const waiting = await queryRows(
      waitingQuery,
      `COALESCE(e."sentAt", e."publishedAt")`,
      trx.raw(
        `((now() AT TIME ZONE w.timezone)::date -
          (COALESCE(e."sentAt", e."publishedAt") AT TIME ZONE w.timezone)::date)
          AS "waitingDays"`,
      ),
    );

    const expiringQuery = visible
      .clone()
      .whereRaw(`${estimateEffectiveStatus} IN ('sent','published')`)
      .whereRaw(
        `e."validUntil" BETWEEN (now() AT TIME ZONE w.timezone)::date
          AND (now() AT TIME ZONE w.timezone)::date + ?::int`,
        [input.expiringWithinDays],
      );
    const expiring = await queryRows(
      expiringQuery,
      `e."validUntil"`,
      trx.raw(
        `e."validUntil" - (now() AT TIME ZONE w.timezone)::date AS "daysUntilExpiry"`,
      ),
    );

    const acceptedWithoutJobQuery = visible
      .clone()
      .where("e.status", "accepted")
      .where("e.parentType", "lead")
      .whereNotExists(
        trx("jobs as linked_job")
          .select(trx.raw("1"))
          .whereRaw(
            `linked_job."workspaceId" = e."workspaceId"
              AND linked_job."sourceLeadId" = e."leadId"`,
          ),
      );
    const acceptedWithoutJob = await queryRows(
      acceptedWithoutJobQuery,
      `COALESCE(e."decidedAt", e."updatedAt")`,
      null,
    );

    return {
      type: "estimates-aging-result" as const,
      untrusted: true as const,
      scope: readScope,
      ...await assistantClock(trx, context.workspaceId),
      waitingDays: input.waitingDays,
      expiringWithinDays: input.expiringWithinDays,
      waiting,
      expiring,
      acceptedWithoutJob,
    };
  });
}

function safeInteger(value: unknown, name: string): number {
  const result = Number(value);
  if (!Number.isSafeInteger(result)) {
    throw new Error(`Estimate ${name} is outside the safe integer range.`);
  }
  return result;
}

function timestamp(value: Date | string): string {
  const result = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(result.getTime())) {
    throw new Error("Estimate record contains an invalid timestamp.");
  }
  return result.toISOString();
}

async function estimateCreationScope(
  trx: Knex.Transaction,
  context: AuthorizationContext,
): Promise<{ workspace: boolean; assignedJob: boolean }> {
  const direct = {
    kind: "estimate" as const,
    id: context.workspaceId,
    workspaceId: context.workspaceId,
    job: null,
  };
  if (authorize(context, { permission: "estimates.create", resource: direct }).allowed) {
    return { workspace: true, assignedJob: true };
  }
  if (!context.enabledPermissions.includes("estimates.create")) {
    return { workspace: false, assignedJob: false };
  }
  const job = await trx("jobs as j")
    .select(
      "j.id",
      "j.workspaceId",
      "j.primaryOwnerId as ownerId",
      trx.raw(`(
        SELECT coalesce(array_agg(t."userId" ORDER BY t."userId"), ARRAY[]::text[])
        FROM "jobTeamMembers" t
        WHERE t."workspaceId" = j."workspaceId" AND t."jobId" = j.id
      ) AS "teamUserIds"`),
    )
    .where("j.workspaceId", context.workspaceId)
    .andWhere((assigned) =>
      assigned
        .where("j.primaryOwnerId", context.userId)
        .orWhereExists(
          trx("jobTeamMembers as jt")
            .select(trx.raw("1"))
            .whereRaw(`jt."workspaceId" = j."workspaceId" AND jt."jobId" = j.id`)
            .where("jt.userId", context.userId),
        ),
    )
    .first();
  if (!job) return { workspace: false, assignedJob: false };
  const assignedJob = authorize(context, {
    permission: "estimates.create",
    resource: {
      kind: "estimate",
      id: job.id,
      workspaceId: context.workspaceId,
      job: {
        kind: "job",
        id: job.id,
        workspaceId: context.workspaceId,
        ownerId: job.ownerId,
        teamUserIds: job.teamUserIds,
      },
    },
  }).allowed;
  return { workspace: false, assignedJob };
}

export function estimateCreationAvailability(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
) {
  return withWorkspaceAuthorization(db, identity, enabled, false, (trx, context) =>
    estimateCreationScope(trx, context),
  );
}

function readableParents(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  type: "lead" | "job",
  assignedOnly = false,
) {
  const scope = resolveAuthorizedCollectionScope(context, type === "lead" ? "leads.read" : "jobs.read");
  const query = trx(type === "lead" ? "leads as p" : "jobs as p")
    .where("p.workspaceId", context.workspaceId);
  if (!scope.allowed || !["workspace", "assigned"].includes(scope.scope)) {
    return query.whereRaw("false");
  }
  if (scope.scope === "assigned" || assignedOnly) {
    if (type === "lead") query.where("p.ownerId", context.userId);
    else query.andWhere((assigned) => assigned.where("p.primaryOwnerId", context.userId)
      .orWhereExists(trx("jobTeamMembers as pt").select(trx.raw("1"))
        .whereRaw(`pt."workspaceId" = p."workspaceId" AND pt."jobId" = p.id`)
        .where("pt.userId", context.userId)));
  }
  return query;
}

async function customerCreationQueries(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  customerId: string,
) {
  const customer = await readCustomerRecordInTransaction(trx, context, customerId);
  const creation = await estimateCreationScope(trx, context);
  const read = resolveAuthorizedCollectionScope(context, "estimates.read");
  const lead = readableParents(trx, context, "lead")
    .where("p.customerId", customerId).whereNull("p.archivedAt");
  const job = readableParents(trx, context, "job", !creation.workspace || (read.allowed && read.scope === "assigned_job"))
    .where("p.customerId", customerId);
  if (customer.archived || !creation.workspace || !read.allowed || read.scope !== "workspace") lead.whereRaw("false");
  if (customer.archived || (!creation.workspace && !creation.assignedJob)) job.whereRaw("false");
  return { lead, job };
}

export function readEstimateCustomerSources(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  customerId: string,
) {
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const scope = resolveAuthorizedCollectionScope(context, "estimates.read");
    if (!scope.allowed) throw new AuthorizationAccessError();
    const queries = await customerCreationQueries(trx, context, customerId);
    return {
      canReadLeads: !!await queries.lead.select("p.id").first(),
      canReadJobs: !!await queries.job.select("p.id").first(),
    };
  });
}

export async function readEstimateCustomerParents(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  raw: EstimateCustomerParentsQuery,
): Promise<EstimateParentOption[]> {
  const input = estimateCustomerParentsQuerySchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const scope = resolveAuthorizedCollectionScope(context, "estimates.read");
    if (!scope.allowed) throw new AuthorizationAccessError();
    const queries = await customerCreationQueries(trx, context, input.customerId);
    const lead = input.type === "lead";
    const query = lead ? queries.lead : queries.job;
    if (input.q) {
      const term = input.q.toLocaleLowerCase("en-US");
      query.andWhere((search) => search
        .whereRaw(`position(? in lower(p.${lead ? "name" : "title"})) > 0`, [term])
        .orWhereRaw(`position(? in lower(p.service)) > 0`, [term])
        .orWhereRaw(`position(? in lower(? || lpad(p."${lead ? "leadNumber" : "jobNumber"}"::text, 4, '0'))) > 0`, [term, lead ? "LD-" : "J-"]));
    }
    const rows = await query.select(
      "p.id", `p.${lead ? "leadNumber" : "jobNumber"} as number`,
      `p.${lead ? "name" : "title"} as name`, "p.service as detail",
      `p.${lead ? "stage" : "status"} as status`,
    ).orderBy(lead ? "p.leadNumber" : "p.jobNumber", "desc").orderBy("p.id").limit(50);
    return rows.map((row) => ({
      id: row.id, number: `${lead ? "LD-" : "J-"}${String(row.number).padStart(4, "0")}`,
      name: row.name, detail: row.detail, status: row.status,
    }));
  });
}

export async function readRelatedEstimates(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  raw: RelatedEstimatesQuery,
): Promise<RelatedEstimatesResult> {
  const input = relatedEstimatesQuerySchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const access = resolveAuthorizedCollectionScope(context, "estimates.read");
    if (!access.allowed || !["workspace", "assigned_job"].includes(access.scope)) throw new AuthorizationAccessError();
    const scope = access.scope as EstimateReadScope;
    const query = visibleQuery(trx, context, scope, input.includeHidden);
    let canCreate: boolean;
    if (input.recordType === "customer") {
      const creation = await customerCreationQueries(trx, context, input.recordId);
      canCreate = !!await creation.lead.select("p.id").first() || !!await creation.job.select("p.id").first();
      query.where("c.id", input.recordId).andWhere((parents) => parents
        .whereExists(readableParents(trx, context, "lead").select(trx.raw("1")).whereRaw(`p.id = e."leadId"`))
        .orWhereExists(readableParents(trx, context, "job").select(trx.raw("1")).whereRaw(`p.id = e."jobId"`)));
    } else {
      const parent = await readEstimateParentInTransaction(trx, context, input.recordType, input.recordId);
      canCreate = parent.canCreate;
      query.where(input.recordType === "lead" ? "e.leadId" : "e.jobId", input.recordId);
    }
    const count = await query.clone().count({ count: "*" }).select(trx.raw(
      `md5(coalesce(string_agg(e.id::text || ':' || e.version::text || ':' || (${estimateEffectiveStatus}), ',' ORDER BY e.id), '')) as "readVersion"`,
    )).first<{ count: string; readVersion: string }>();
    if (!count) throw new Error("Related estimate count is unavailable.");
    const total = safeInteger(count.count, "related count");
    const pageSize = 10;
    const page = Math.min(input.page, Math.max(1, Math.ceil(total / pageSize)));
    const rows = await query.select(
      "e.id", "e.estimateNumber", "e.revision", "e.name", "e.totalCents", "e.archivedAt", "e.parentType",
      "l.leadNumber", "j.jobNumber", trx.raw(`${estimateEffectiveStatus} as status`),
    ).orderBy("e.updatedAt", "desc").orderBy("e.id").limit(pageSize).offset((page - 1) * pageSize);
    return {
      total, page, pageSize, canCreate, readVersion: count.readVersion,
      rows: rows.map((row) => ({
        id: row.id, number: `EST-${String(row.estimateNumber).padStart(4, "0")}`,
        revision: row.revision, name: row.name, status: estimateStatusSchema.parse(row.status),
        totalCents: row.totalCents === null ? null : safeInteger(row.totalCents, "total"),
        archived: row.archivedAt !== null,
        href: `/estimates/${encodeURIComponent(row.id)}?workspace=${encodeURIComponent(context.workspaceId)}`,
        parent: {
          type: row.parentType,
          number: `${row.parentType === "lead" ? "LD-" : "J-"}${String(row.parentType === "lead" ? row.leadNumber : row.jobNumber).padStart(4, "0")}`,
        },
      })),
    };
  });
}

async function listOwners(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  scope: EstimateReadScope,
) {
  const query = trx("workspaceMemberships as m")
    .join("users as u", "u.id", "m.userId")
    .where("m.workspaceId", context.workspaceId)
    .whereNull("u.deletionRequestedAt");
  if (scope === "assigned_job") query.where("m.userId", context.userId);
  const members = await query
    .select("m.userId as id", "u.name")
    .orderBy("u.name")
    .orderBy("m.userId")
    .limit(200);
  const counts: { ownerId: string; count: string }[] = await visibleQuery(
    trx,
    context,
    scope,
    false,
  )
    .whereNotNull("e.ownerId")
    .whereRaw(`${estimateEffectiveStatus} IN ('draft','sent','published')`)
    .groupBy("e.ownerId")
    .select(
      trx.raw(
        `e."ownerId"::text AS "ownerId", COUNT(e.id)::text AS count`,
      ),
    );
  const countByOwner = new Map(
    counts.map((row) => [row.ownerId as string, safeInteger(row.count, "owner count")]),
  );
  return members.map((member) => ({
    id: member.id as string,
    name: member.name as string,
    openEstimateCount: countByOwner.get(member.id as string) ?? 0,
  }));
}

async function listMetrics(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  scope: EstimateReadScope,
) {
  const row = await hasLatestRevision(
    baseQuery(trx, context, scope)
      .whereNull("e.archivedAt")
      .whereNot("e.status", "superseded"),
    trx,
  )
    .select(
      trx.raw(
        `COUNT(*) FILTER (        WHERE ${estimateEffectiveStatus} IN ('sent','published'))::text AS "awaitingCount"`,
      ),
      trx.raw(
        `COALESCE(SUM(e."totalCents") FILTER (WHERE ${estimateEffectiveStatus} IN ('draft','sent','published')), 0)::text AS "openValueCents"`,
      ),
      trx.raw(
        `COUNT(*) FILTER (
          WHERE ${estimateEffectiveStatus} = 'accepted'
            AND e."decidedAt" >= date_trunc('month', now() AT TIME ZONE w.timezone) AT TIME ZONE w.timezone
            AND e."decidedAt" < date_trunc('month', (now() AT TIME ZONE w.timezone) + interval '1 month') AT TIME ZONE w.timezone
        )::text AS "acceptedThisMonthCount"`,
      ),
      trx.raw(
        `COALESCE(SUM(COALESCE(e."acceptedTotalCents", e."totalCents")) FILTER (
          WHERE ${estimateEffectiveStatus} = 'accepted'
            AND e."decidedAt" >= date_trunc('month', now() AT TIME ZONE w.timezone) AT TIME ZONE w.timezone
            AND e."decidedAt" < date_trunc('month', (now() AT TIME ZONE w.timezone) + interval '1 month') AT TIME ZONE w.timezone
        ), 0)::text AS "acceptedThisMonthCents"`,
      ),
      trx.raw(
        `COUNT(*) FILTER (
          WHERE ${estimateEffectiveStatus} IN ('sent','published')
            AND e."validUntil" BETWEEN (now() AT TIME ZONE w.timezone)::date
              AND (now() AT TIME ZONE w.timezone)::date + 7
        )::text AS "expiringInSevenDaysCount"`,
      ),
    )
    .first();
  return {
    awaitingCount: safeInteger(row?.awaitingCount ?? 0, "awaiting count"),
    openValueCents: String(row?.openValueCents ?? "0"),
    acceptedThisMonthCount: safeInteger(
      row?.acceptedThisMonthCount ?? 0,
      "accepted count",
    ),
    acceptedThisMonthCents: String(row?.acceptedThisMonthCents ?? "0"),
    expiringInSevenDaysCount: safeInteger(
      row?.expiringInSevenDaysCount ?? 0,
      "expiring count",
    ),
  };
}

function rowDto(row: Record<string, unknown>, today: string) {
  const validUntil = row.validUntil as string | null;
  const status = estimateStatusSchema.parse(
    estimateStatusAtDate(
      estimateStatusSchema.parse(row.status),
      validUntil,
      today,
    ),
  );
  const estimateNumber = safeInteger(row.estimateNumber, "number");
  return {
    id: row.id as string,
    number: `EST-${String(estimateNumber).padStart(4, "0")}`,
    estimateNumber,
    revision: safeInteger(row.revision, "revision"),
    name: row.name as string,
    customerName: row.customerName as string,
    service: row.service as string,
    status,
    totalCents:
      row.totalCents === null ? null : safeInteger(row.totalCents, "total"),
    parentType: row.parentType as "lead" | "job",
    parentId: row.parentId as string,
    parentNumber: row.parentNumber as string,
    ownerId: (row.ownerId as string | null) ?? null,
    ownerName: (row.ownerName as string | null) ?? null,
    validUntil,
    updatedAt: timestamp(row.updatedAt as Date | string),
    decidedAt: row.decidedAt
      ? timestamp(row.decidedAt as Date | string)
      : null,
    archived: row.archivedAt !== null,
    version: safeInteger(row.version, "version"),
  };
}

export async function readEstimates(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  raw: unknown,
): Promise<EstimateListResult> {
  const input = estimateListQuerySchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) {
    throw new AuthorizationAccessError();
  }
  return withWorkspaceAuthorization(
    db,
    identity,
    enabled,
    false,
    async (trx, context) => {
      const scope = resolveAuthorizedCollectionScope(context, "estimates.read");
      if (
        !scope.allowed ||
        !["workspace", "assigned_job"].includes(scope.scope)
      ) {
        throw new AuthorizationAccessError();
      }
      const readScope = scope.scope as EstimateReadScope;
      const workspace = await trx("workspaces")
        .where({ id: context.workspaceId })
        .select(
          "timezone",
          trx.raw(
            `to_char((now() AT TIME ZONE "timezone")::date, 'YYYY-MM-DD') AS today`,
          ),
        )
        .first();
      if (!workspace) throw new AuthorizationAccessError();

      const filtered =       filteredEstimateQuery(trx, context, readScope, input);
      const totalRow = await filtered
        .clone()
        .countDistinct({ count: "e.id" })
        .first();
      const total = safeInteger(totalRow?.count ?? 0, "result count");
      const scopeTotalRow = await baseQuery(trx, context, readScope)
        .countDistinct({ count: "e.id" })
        .first();
      const scopeTotal = safeInteger(
        scopeTotalRow?.count ?? 0,
        "authorized scope count",
      );
      const sortColumn: Record<(typeof input)["sort"], string> = {
        updatedAt: 'e."updatedAt"',
        totalCents: 'e."totalCents"',
        validUntil: 'e."validUntil"',
        estimateNumber: 'e."estimateNumber"',
      };
      const direction = input.direction === "asc" ? "ASC" : "DESC";
      const nulls =
        input.sort === "validUntil" || input.sort === "totalCents"
          ? " NULLS LAST"
          : "";
      const rows = await filtered
        .clone()
        .select(
          "e.id",
          "e.estimateNumber",
          "e.revision",
          "e.name",
          "e.parentType",
          "e.ownerId",
          "u.name as ownerName",
          "e.version",
          "e.totalCents",
          "e.decidedAt",
          "e.archivedAt",
          "e.updatedAt",
          "j.id as jobResourceId",
          "j.primaryOwnerId as jobOwnerId",
          "l.ownerId as leadOwnerId",
          "l.archivedAt as leadArchivedAt",
          trx.raw(`EXISTS (
            SELECT 1 FROM "jobTeamMembers" AS team
            WHERE team."workspaceId" = e."workspaceId"
              AND team."jobId" = j.id AND team."userId" = ?
          ) AS "viewerOnJobTeam"`, [context.userId]),
          trx.raw(`${estimateEffectiveStatus} AS status`),
          trx.raw(
            `to_char(e."validUntil", 'YYYY-MM-DD') AS "validUntil"`,
          ),
          trx.raw(
            `COALESCE(c.name, l.name, j."customerName", '') AS "customerName"`,
          ),
          trx.raw(
            `COALESCE(l.service, j.service, '') AS service`,
          ),
          trx.raw(
            `COALESCE(e."leadId", e."jobId")::text AS "parentId"`,
          ),
          trx.raw(
            `CASE WHEN e."parentType" = 'lead'
              THEN 'LD-' || lpad(l."leadNumber"::text, 4, '0')
              ELSE 'J-' || lpad(j."jobNumber"::text, 4, '0')
            END AS "parentNumber"`,
          ),
        )
        .orderByRaw(
          `${sortColumn[input.sort]} ${direction}${nulls}, e.id ASC`,
        )
        .limit(input.pageSize)
        .offset((input.page - 1) * input.pageSize);

      const canExport = resolveAuthorizedCollectionScope(
        context,
        "estimates.export",
      ).allowed;
      const creationScope = await estimateCreationScope(trx, context);
      return {
        rows: rows.map((row) => {
          const job: Extract<AuthorizationResource, { kind: "job" }> | null = row.jobResourceId ? {
            kind: "job", id: row.jobResourceId, workspaceId: context.workspaceId,
            ownerId: row.jobOwnerId, teamUserIds: row.viewerOnJobTeam ? [context.userId] : [],
          } : null;
          const resource = { kind: "estimate" as const, id: row.id, workspaceId: context.workspaceId, job };
          const canCreate = authorize(context, { permission: "estimates.create", resource }).allowed;
          const dto = rowDto(row as Record<string, unknown>, workspace.today as string);
          const parentReadable = row.parentType === "job"
            ? !!job && authorize(context, { permission: "jobs.read", resource: job }).allowed
            : row.leadArchivedAt === null && authorize(context, {
              permission: "leads.read", resource: {
                kind: "lead", id: row.parentId, workspaceId: context.workspaceId, ownerId: row.leadOwnerId,
              },
            }).allowed;
          return {
            ...dto,
            canDuplicate: canCreate && parentReadable,
            canRevise: canCreate && !dto.archived && ["sent", "published", "declined", "expired"].includes(dto.status) &&
              authorize(context, { permission: "estimates.update", resource }).allowed,
            canDelete: !dto.archived && dto.status === "draft" &&
              authorize(context, { permission: "estimates.delete", resource }).allowed,
          };
        }),
        total,
        scopeTotal,
        page: input.page,
        pageSize: input.pageSize,
        timezone: workspace.timezone as string,
        scope: readScope,
        policyRevision: context.policy.revision,
        canCreate: creationScope.workspace || creationScope.assignedJob,
        canExport,
        canVoid: rows.some(row => authorize(context, {
          permission: "estimates.void",
          resource: { kind: "estimate", id: row.id, workspaceId: context.workspaceId, job: null },
        }).allowed),
        canArchive: rows.some(row => authorize(context, {
          permission: "estimates.archive",
          resource: { kind: "estimate", id: row.id, workspaceId: context.workspaceId, job: null },
        }).allowed),
        owners: await listOwners(trx, context, readScope),
        metrics: await listMetrics(trx, context, readScope),
      };
    },
  );
}
