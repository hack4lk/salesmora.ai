import { createHash, randomUUID } from "node:crypto";
import type { Knex } from "knex";
import {
  estimateConversionCommandSchema,
  estimateIdSchema,
  type AuthorizationContext,
  type EstimateConversionCommand,
  type EstimateConversionReceipt,
  type EstimateConversionReview,
  type JobMember,
  type PermissionId,
} from "@salesmora/contracts";
import { authorize, resolveAuthorizedCollectionScope } from "@salesmora/domain";
import {
  AuthorizationAccessError,
  withWorkspaceAuthorization,
  type WorkspaceIdentity,
} from "../authorization/store";
import { createJobInTransaction, JobConflictError, JobValidationError } from "../jobs/store";
import {
  EstimateDraftConflictError,
  EstimateDraftValidationError,
  loadEstimateLifecycleContext,
} from "./drafts";
import { verifiedEstimateFrozenSnapshot } from "./sharing-paper";

const changed = "The estimate, lead or customer changed. Reload and review the current records before confirming.";

type ConversionContext = {
  response: EstimateConversionReview;
  leadId: string | null;
  leadVersion: number | null;
  customerVersion: number | null;
};

function creationAllowed(context: AuthorizationContext) {
  const customerScope = resolveAuthorizedCollectionScope(context, "customers.read");
  const resource = {
    kind: "job" as const,
    id: context.workspaceId,
    workspaceId: context.workspaceId,
    ownerId: context.userId,
    teamUserIds: [],
  };
  return authorize(context, { permission: "jobs.create" }).allowed
    && authorize(context, { permission: "jobs.assign", resource }).allowed
    && resolveAuthorizedCollectionScope(context, "jobs.read").allowed
    && customerScope.allowed
    && customerScope.scope === "workspace";
}

async function jobMemberIds(trx: Knex.Transaction, context: AuthorizationContext, jobId: string) {
  return trx("jobTeamMembers")
    .where({ workspaceId: context.workspaceId, jobId })
    .pluck("userId") as Promise<string[]>;
}

async function jobReference(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  job: { id: string; jobNumber: number; primaryOwnerId: string | null },
) {
  const teamUserIds = await jobMemberIds(trx, context, job.id);
  const canOpen = authorize(context, {
    permission: "jobs.read",
    resource: {
      kind: "job",
      id: job.id,
      workspaceId: context.workspaceId,
      ownerId: job.primaryOwnerId,
      teamUserIds,
    },
  }).allowed;
  return {
    id: job.id,
    number: `J-${String(job.jobNumber).padStart(4, "0")}`,
    canOpen,
  };
}

async function activeMembers(trx: Knex.Transaction, context: AuthorizationContext): Promise<JobMember[]> {
  const rows = await trx("workspaceMemberships as m")
    .join("users as u", "u.id", "m.userId")
    .where("m.workspaceId", context.workspaceId)
    .whereNull("u.deletionRequestedAt")
    .select("u.id", "u.name", "m.role")
    .orderBy("u.name")
    .orderBy("u.id");
  return rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    role: row.role as JobMember["role"],
  }));
}

async function loadConversionContext(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  estimateId: string,
  lock = false,
): Promise<ConversionContext> {
  const { row, status } = await loadEstimateLifecycleContext(trx, context, estimateId, lock);
  const frozen = await trx("estimate_snapshots")
    .where({ workspaceId: context.workspaceId, estimateId: row.id })
    .first("id", "content", "contentHash");
  const snapshot = frozen && verifiedEstimateFrozenSnapshot(frozen.content, frozen.contentHash);
  if (!frozen || !snapshot ||
    snapshot.content.number !== `EST-${String(row.estimateNumber).padStart(4, "0")}` ||
    snapshot.content.revision !== row.revision) {
    throw new EstimateDraftValidationError("The accepted estimate snapshot is unavailable. Reload before converting.");
  }
  const decision = await trx("estimate_decisions")
    .where({ workspaceId: context.workspaceId, estimateId: row.id })
    .orderBy("estimateVersion", "desc")
    .first();
  if (!decision || decision.outcome !== "accepted" || decision.estimateVersion !== row.version ||
    decision.snapshotId !== frozen.id || Number(decision.snapshotTotalCents) !== snapshot.amounts.totalCents ||
    Number(row.acceptedTotalCents) !== snapshot.amounts.totalCents) {
    throw new EstimateDraftConflictError(changed);
  }

  let lead: Record<string, unknown> | undefined;
  let parentJob: Record<string, unknown> | undefined;
  let leadId: string | null = null;
  let customerId: string | null = null;
  let customerVersion: number | null = null;
  let customer: EstimateConversionReview["customer"] = { state: "missing" };
  let service = "";
  let parentNumber = "";
  if (row.parentType === "lead" && row.leadId) {
    const query = trx("leads").where({ workspaceId: context.workspaceId, id: row.leadId });
    if (lock) query.forUpdate();
    lead = await query.first();
    if (!lead || !authorize(context, {
      permission: "leads.read",
      resource: { kind: "lead", id: row.leadId, workspaceId: context.workspaceId, ownerId: lead.ownerId as string | null },
    }).allowed) throw new AuthorizationAccessError();
    leadId = row.leadId;
    customerId = (lead.customerId as string | null) ?? null;
    service = lead.service as string;
    parentNumber = `LD-${String(lead.leadNumber).padStart(4, "0")}`;
    if (customerId) {
      const customerQuery = trx("customers")
        .where({ workspaceId: context.workspaceId, id: customerId })
        .whereNull("archivedAt");
      if (lock) customerQuery.forUpdate();
      const currentCustomer = await customerQuery.first("id", "name", "version");
      const canRead = currentCustomer && authorize(context, {
        permission: "customers.read",
        resource: {
          kind: "customer",
          id: customerId,
          workspaceId: context.workspaceId,
          related: [{ kind: "lead", id: row.leadId, workspaceId: context.workspaceId, ownerId: lead.ownerId as string | null }],
        },
      }).allowed;
      if (canRead && currentCustomer) {
        customerVersion = Number(currentCustomer.version);
        customer = { state: "ready", id: customerId, name: currentCustomer.name as string };
      } else {
        customer = { state: "unavailable" };
      }
    }
  } else if (row.parentType === "job" && row.jobId) {
    const job = await trx("jobs").where({ workspaceId: context.workspaceId, id: row.jobId }).first();
    if (!job) throw new AuthorizationAccessError();
    parentJob = job;
    service = job.service as string;
    parentNumber = `J-${String(job.jobNumber).padStart(4, "0")}`;
    customerId = (job.customerId as string | null) ?? null;
    const teamUserIds = await jobMemberIds(trx, context, job.id);
    if (!authorize(context, {
      permission: "jobs.read",
      resource: { kind: "job", id: job.id, workspaceId: context.workspaceId, ownerId: job.primaryOwnerId, teamUserIds },
    }).allowed) parentJob = undefined;
    if (customerId) {
      const currentCustomer = await trx("customers")
        .where({ workspaceId: context.workspaceId, id: customerId })
        .whereNull("archivedAt")
        .first("id", "name", "version");
      if (currentCustomer && authorize(context, {
        permission: "customers.read",
        resource: { kind: "customer", id: customerId, workspaceId: context.workspaceId, related: [] },
      }).allowed) {
        customerVersion = Number(currentCustomer.version);
        customer = { state: "ready", id: customerId, name: currentCustomer.name as string };
      } else customer = { state: "unavailable" };
    }
  } else {
    throw new AuthorizationAccessError();
  }

  const converted = await trx("jobs")
    .where({ workspaceId: context.workspaceId, acceptedEstimateId: row.id })
    .first("id", "jobNumber", "primaryOwnerId", "sourceLeadId");
  const sourceLeadHasJob = !!leadId && !!(await trx("jobs")
    .where({ workspaceId: context.workspaceId, sourceLeadId: leadId })
    .first("id"));
  if (converted && (row.parentType !== "lead" || converted.sourceLeadId !== row.leadId)) {
    throw new EstimateDraftValidationError("The linked Job does not match this estimate's source lead.");
  }
  const convertedJob = converted ? await jobReference(trx, context, converted) : null;
  const parentJobReference = parentJob
    ? await jobReference(trx, context, parentJob as { id: string; jobNumber: number; primaryOwnerId: string | null })
    : null;
  const customerScope = resolveAuthorizedCollectionScope(context, "customers.read");
  const canResolveCustomer = !!lead && !lead.archivedAt &&
    customerScope.allowed && customerScope.scope === "workspace" &&
    resolveAuthorizedCollectionScope(context, "leads.read").allowed &&
    authorize(context, {
      permission: "customers.update",
      resource: { kind: "customer", id: context.workspaceId, workspaceId: context.workspaceId, related: [] },
    }).allowed &&
    authorize(context, {
      permission: "leads.update",
      fields: ["customerId"],
      resource: { kind: "lead", id: lead.id as string, workspaceId: context.workspaceId, ownerId: lead.ownerId as string | null },
    }).allowed;
  const canCreateJob = creationAllowed(context);
  const members = canCreateJob ? await activeMembers(trx, context) : [];
  const sourceLeadVersion = lead ? Number(lead.version) : null;
  const customerReady = customer.state === "ready" ? customer : null;
  const sourceLeadId = row.parentType === "lead" ? leadId : row.jobId;
  if (!sourceLeadId) throw new AuthorizationAccessError();
  const response = {
    estimate: {
      id: row.id,
      number: `EST-${String(row.estimateNumber).padStart(4, "0")}`,
      revision: row.revision,
      version: row.version,
      name: snapshot.content.name,
      status,
      archived: !!row.archivedAt,
      parentType: row.parentType,
      parentId: sourceLeadId,
      parentNumber,
      snapshotHash: frozen.contentHash,
      totalCents: snapshot.amounts.totalCents,
      customerId,
      sourceLeadVersion,
      sourceLeadArchived: !!lead?.archivedAt,
      customerVersion,
      convertedJobExists: !!converted,
      sourceLeadHasJob,
      service,
      scope: snapshot.content.scope,
      serviceAddress: snapshot.content.serviceAddress,
      convertedJob: convertedJob?.canOpen ? convertedJob : null,
    },
    capabilities: { read: true },
    canCreateJob,
    canScheduleCreation: authorize(context, {
      permission: "jobs.schedule.update",
      resource: {
        kind: "job",
        id: context.workspaceId,
        workspaceId: context.workspaceId,
        ownerId: context.userId,
        teamUserIds: [],
      },
    }).allowed,
    canResolveCustomer,
    customer,
    review: {
      estimateId: row.id,
      expectedVersion: row.version,
      expectedLeadVersion: sourceLeadVersion,
      expectedCustomerVersion: customerVersion,
      snapshotHash: frozen.contentHash,
      sourceLeadId,
      job: {
        customerId: customerReady?.id ?? "",
        customerName: customerReady?.name ?? "",
        title: snapshot.content.name,
        service,
        location: snapshot.content.serviceAddress,
        description: snapshot.content.scope,
        primaryOwnerId: null,
        teamUserIds: [],
        scheduledDate: null,
        arrivalWindow: null,
        completionDeadline: null,
      },
    },
    members,
    parentJob: parentJobReference,
  } satisfies EstimateConversionReview;
  return { response, leadId, leadVersion: sourceLeadVersion, customerVersion };
}

export async function readEstimateConversionReviewInTransaction(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  estimateId: string,
): Promise<EstimateConversionReview> {
  estimateIdSchema.parse(estimateId);
  return (await loadConversionContext(trx, context, estimateId)).response;
}

export async function readEstimateConversionReview(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  estimateId: string,
): Promise<EstimateConversionReview> {
  estimateIdSchema.parse(estimateId);
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) =>
    (await loadConversionContext(trx, context, estimateId)).response,
  );
}

function isConversionUniqueViolation(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? error.code : undefined;
  const constraint = "constraint" in error ? error.constraint : undefined;
  return code === "23505" &&
    ["jobs_accepted_estimate_once", "jobs_source_lead_once"].includes(String(constraint));
}

function receiptFor(
  estimateId: string,
  version: number,
  job: { id: string; jobNumber: number },
  workspaceId: string,
): EstimateConversionReceipt {
  return {
    estimateId,
    version,
    job: {
      id: job.id,
      number: `J-${String(job.jobNumber).padStart(4, "0")}`,
      href: `/jobs/${encodeURIComponent(job.id)}?workspace=${encodeURIComponent(workspaceId)}`,
    },
  };
}

async function authorizedConvertedJob(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  estimateId: string,
  leadId: string,
) {
  const job = await trx("jobs")
    .where({ workspaceId: context.workspaceId, acceptedEstimateId: estimateId, sourceLeadId: leadId })
    .first("id", "jobNumber", "primaryOwnerId");
  if (!job) throw new EstimateDraftConflictError(changed);
  const teamUserIds = await jobMemberIds(trx, context, job.id);
  if (!authorize(context, {
    permission: "jobs.read",
    resource: {
      kind: "job",
      id: job.id,
      workspaceId: context.workspaceId,
      ownerId: job.primaryOwnerId,
      teamUserIds,
    },
  }).allowed) throw new AuthorizationAccessError();
  return job;
}

export async function convertAcceptedEstimateToJob(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  raw: unknown,
): Promise<EstimateConversionReceipt> {
  const input: EstimateConversionCommand = estimateConversionCommandSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const loaded = await loadConversionContext(trx, context, input.estimateId, true);
    const { response, leadId, leadVersion, customerVersion } = loaded;
    const { estimate } = response;
    const canAssign = creationAllowed(context);
    if (!canAssign) throw new AuthorizationAccessError();
    const resource = {
      kind: "job" as const,
      id: input.submissionId,
      workspaceId: context.workspaceId,
      ownerId: input.job.primaryOwnerId,
      teamUserIds: input.job.teamUserIds,
    };
    if (!authorize(context, { permission: "jobs.assign", resource }).allowed ||
      !resolveAuthorizedCollectionScope(context, "jobs.read").allowed) {
      throw new AuthorizationAccessError();
    }
    if (input.job.scheduledDate || input.job.completionDeadline) {
      if (!authorize(context, { permission: "jobs.schedule.update", resource }).allowed) {
        throw new AuthorizationAccessError();
      }
    }
    if (estimate.status !== "accepted" || estimate.archived || estimate.parentType !== "lead" ||
      estimate.sourceLeadArchived || !leadId || leadId !== input.sourceLeadId) {
      throw new EstimateDraftValidationError("Only an active Accepted estimate linked to an active lead can be converted.");
    }
    if (estimate.version !== input.expectedVersion || estimate.snapshotHash !== input.snapshotHash ||
      leadVersion !== input.expectedLeadVersion || customerVersion !== input.expectedCustomerVersion) {
      throw new EstimateDraftConflictError(changed);
    }
    if (response.customer.state !== "ready" ||
      response.customer.id !== input.job.customerId ||
      !customerVersion) {
      throw new EstimateDraftValidationError("Link an accessible customer to the source lead before converting.");
    }
    if (!response.canCreateJob) throw new AuthorizationAccessError();

    const requestHash = createHash("sha256").update(JSON.stringify(input)).digest("hex");
    const prior = await trx("estimate_operation_receipts")
      .where({ workspaceId: context.workspaceId, submissionId: input.submissionId })
      .first();
    if (prior) {
      if (prior.actorId !== context.userId || prior.estimateId !== input.estimateId ||
        prior.operation !== "convert" || prior.inputHash !== requestHash || prior.version !== estimate.version) {
        throw new EstimateDraftConflictError("This confirmation was already used for a different request.");
      }
      const job = await authorizedConvertedJob(trx, context, estimate.id, leadId);
      return receiptFor(estimate.id, estimate.version, job, context.workspaceId);
    }
    if (estimate.convertedJobExists) {
      throw new EstimateDraftConflictError("This estimate or its source lead already has a Job.");
    }

    const existing = await trx("jobs")
      .where({ workspaceId: context.workspaceId, sourceLeadId: leadId })
      .first("id");
    if (existing) throw new EstimateDraftConflictError("This lead already has a Job.");

    let created: { jobId: string; version: number };
    try {
      created = await createJobInTransaction(trx, context, {
        workspaceId: context.workspaceId,
        submissionId: randomUUID(),
        customerId: input.job.customerId,
        sourceLeadId: leadId,
        title: input.job.title,
        service: input.job.service,
        location: input.job.location,
        description: input.job.description,
        primaryOwnerId: input.job.primaryOwnerId,
        teamUserIds: input.job.teamUserIds,
        scheduledDate: input.job.scheduledDate,
        arrivalWindow: input.job.arrivalWindow,
        completionDeadline: input.job.completionDeadline,
      }, { acceptedEstimateId: estimate.id, requireRead: true });
    } catch (error) {
      if (error instanceof JobConflictError || isConversionUniqueViolation(error)) {
        throw new EstimateDraftConflictError("The source lead or estimate already has a Job.");
      }
      if (error instanceof JobValidationError) {
        throw new EstimateDraftValidationError(error.message);
      }
      throw error;
    }
    const job = await trx("jobs")
      .where({ workspaceId: context.workspaceId, id: created.jobId })
      .first("id", "jobNumber");
    if (!job) throw new EstimateDraftConflictError(changed);
    const actor = await trx("users").where({ id: context.userId }).first("name");
    await trx("estimate_activity").insert({
      id: randomUUID(),
      workspaceId: context.workspaceId,
      estimateId: estimate.id,
      actorId: context.userId,
      actorName: actor.name,
      source: "ui",
      type: "converted",
      changes: JSON.stringify({
        convertedJob: {
          id: job.id,
          number: `J-${String(job.jobNumber).padStart(4, "0")}`,
        },
      }),
    });
    await trx("estimate_operation_receipts").insert({
      workspaceId: context.workspaceId,
      submissionId: input.submissionId,
      actorId: context.userId,
      operation: "convert",
      inputHash: requestHash,
      estimateId: estimate.id,
      version: estimate.version,
    });
    return receiptFor(estimate.id, estimate.version, job, context.workspaceId);
  });
}
