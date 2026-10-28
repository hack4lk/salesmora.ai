import { createHash, randomUUID } from "node:crypto";
import type { Knex } from "knex";
import {
  createEstimateDraftSchema,
  deleteEstimateDraftSchema,
  duplicateEstimateSchema,
  estimateIdSchema,
  reviseEstimateSchema,
  estimateRevisionsQuerySchema,
  estimateDraftValuesSchema,
  updateEstimateDraftSchema,
  type AuthorizationContext,
  type EstimateDraftValues,
  type EstimateHistoryField,
  type EstimateRevisionFamily,
  type EstimateRevisionSharing,
  type EstimateStatus,
  type PermissionId,
} from "@salesmora/contracts";
import {
  authorize,
  calculateEstimateTotals,
  estimateStatusAtDate,
  resolveAuthorizedCollectionScope,
} from "@salesmora/domain";
import {
  AuthorizationAccessError,
  withWorkspaceAuthorization,
  type WorkspaceIdentity,
} from "../authorization/store";
import { verifiedEstimateFrozenSnapshot } from "./sharing-paper";
import { readCustomerRecordInTransaction } from "../customers/store";

type JobResource = {
  kind: "job";
  id: string;
  workspaceId: string;
  ownerId: string | null;
  teamUserIds: string[];
};

type EstimateResource = {
  kind: "estimate";
  id: string;
  workspaceId: string;
  job: JobResource | null;
};

type ParentRecord = {
  type: "lead" | "job";
  id: string;
  number: string;
  name: string;
  status: string;
  service: string;
  customer: { id: string; name: string } | null;
  contactName: string;
  recipientEmail: string;
  serviceAddress: string;
  href?: string;
};

type EstimateItemRow = {
  id: string;
  catalogId: string | null;
  catalogName: string | null;
  unit: string | null;
  sku: string | null;
  description: string;
  quantity: string;
  unitPriceCents: number | null;
  taxable: boolean;
  included: boolean;
};

type EstimateRow = {
  id: string;
  workspaceId: string;
  estimateNumber: number;
  revision: number;
  sourceEstimateId: string | null;
  name: string;
  status: EstimateStatus;
  parentType: "lead" | "job";
  leadId: string | null;
  jobId: string | null;
  customerId: string | null;
  ownerId: string | null;
  recipientName: string;
  recipientEmail: string;
  serviceAddress: string;
  scope: string;
  message: string;
  termsNote: string;
  paymentTerms: string;
  paymentLink: string;
  internalNotes: string;
  depositType: "none" | "percent" | "amount";
  depositValue: string;
  taxRateMilliPercent: number;
  discountType: "none" | "percent" | "amount";
  discountValue: string;
  subtotalCents: string | null;
  discountCents: string | null;
  taxCents: string | null;
  totalCents: string | null;
  depositCents: string | null;
  balanceCents: string | null;
  acceptedTotalCents: string | null;
  validUntil: string | Date | null;
  sentAt: Date | null;
  publishedAt: Date | null;
  archivedAt: Date | null;
  archivedBy: string | null;
  voidReason: string | null;
  version: number;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type EstimateEditorRecord = {
  id: string;
  number: string;
  revision: number;
  status: EstimateStatus;
  archived: boolean;
  version: number;
  updatedAt: string;
  sharing: "never-shared" | "shared";
  parent: ParentRecord;
  values: EstimateDraftValues;
};

export type EstimateEditorSeed = {
  creationCustomerId?: string;
  workspaceId: string;
  timezone: string;
  today: string;
  paperBusiness: {
    name: string;
    address: string;
    phone: string;
    email: string;
    licenseLine: string;
    logoPath: string | null;
    requireServiceAddress: boolean;
  };
  parent: ParentRecord | null;
  existingEstimates: { id: string; number: string; status: "draft" | "sent" | "published"; href: string }[];
  estimate: EstimateEditorRecord | null;
  members: { id: string; name: string }[];
  paymentPresets: { id: string; label: string; text: string }[];
  defaults: {
    taxRate: string;
    validUntil: string;
    message: string;
    termsNote: string;
    deposit: { type: "none" } | { type: "percent" | "amount"; value: string };
  };
  capabilities: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    void: boolean;
    archive: boolean;
    assignOwner: boolean;
    browseMaterials: boolean;
    viewMaterialPrices: boolean;
  };
};

export type EstimateDraftSaveResult = {
  id: string;
  number: string;
  revision: number;
  version: number;
  updatedAt: string;
};

export class EstimateDraftConflictError extends Error {
  constructor(message = "This estimate changed. Reload its current details before saving.") {
    super(message);
  }
}

export class EstimateDraftValidationError extends Error {}

export function changedEstimateDraftFields(before: EstimateDraftValues, after: EstimateDraftValues): EstimateHistoryField[] {
  const fields: EstimateHistoryField[] = [];
  const compare = (field: EstimateHistoryField, left: unknown, right: unknown) => {
    if (JSON.stringify(left) !== JSON.stringify(right)) fields.push(field);
  };
  for (const field of ["name", "recipientName", "recipientEmail", "serviceAddress"] as const) {
    compare(field, before.details[field], after.details[field]);
  }
  compare("owner", before.details.ownerId, after.details.ownerId);
  for (const field of ["message", "termsNote", "paymentTerms", "validUntil", "deposit"] as const) {
    compare(field, before.terms[field], after.terms[field]);
  }
  for (const field of ["scope", "internalNotes", "items"] as const) compare(field, before[field], after[field]);
  compare("paymentLink", before.paymentLink ?? "", after.paymentLink ?? before.paymentLink ?? "");
  compare("discount", before.totals.discount, after.totals.discount);
  compare("taxRate", before.totals.taxRate, after.totals.taxRate);
  return fields;
}

const numberLabel = (value: number) => `EST-${String(value).padStart(4, "0")}`;
const hashInput = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

function dateOnly(value: string | Date | null): string | null {
  if (value === null) return null;
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) throw new Error("Estimate date is invalid.");
    return value.toISOString().slice(0, 10);
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new Error("Estimate date is invalid.");
  }
  return value;
}

function estimateResource(row: EstimateRow, job: JobResource | null): EstimateResource {
  return { kind: "estimate", id: row.id, workspaceId: row.workspaceId, job };
}

function permit(
  context: AuthorizationContext,
  permission: PermissionId,
  resource?: EstimateResource | JobResource | { kind: "lead"; id: string; workspaceId: string; ownerId: string | null },
) {
  if (!authorize(context, { permission, ...(resource ? { resource } : {}) }).allowed) {
    throw new AuthorizationAccessError();
  }
}

function jobResource(
  id: string,
  workspaceId: string,
  ownerId: string | null,
  teamUserIds: string[],
): JobResource {
  return { kind: "job", id, workspaceId, ownerId, teamUserIds };
}

async function assignmentForJob(
  trx: Knex.Transaction,
  workspaceId: string,
  jobId: string,
): Promise<JobResource | null> {
  const job = await trx("jobs as j")
    .where({ "j.workspaceId": workspaceId, "j.id": jobId })
    .select("j.id", "j.workspaceId", "j.primaryOwnerId")
    .first();
  if (!job) return null;
  const team = await trx("jobTeamMembers")
    .where({ workspaceId, jobId })
    .orderBy("userId")
    .pluck("userId");
  return jobResource(job.id, job.workspaceId, job.primaryOwnerId, team);
}

function estimateReadScope(context: AuthorizationContext) {
  const scope = resolveAuthorizedCollectionScope(context, "estimates.read");
  if (!scope.allowed || !["workspace", "assigned_job"].includes(scope.scope)) {
    throw new AuthorizationAccessError();
  }
  return scope.scope as "workspace" | "assigned_job";
}

function applyEstimateReadScope(
  query: Knex.QueryBuilder,
  trx: Knex.Transaction,
  context: AuthorizationContext,
  scope: "workspace" | "assigned_job",
) {
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

async function readJobParent(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  jobId: string,
  forCreation: boolean,
): Promise<ParentRecord> {
  const job = await trx("jobs as j")
    .leftJoin("customers as c", function joinCustomer() {
      this.on("c.workspaceId", "j.workspaceId").andOn("c.id", "j.customerId");
    })
    .where({ "j.workspaceId": context.workspaceId, "j.id": jobId })
    .select(
      "j.id",
      "j.workspaceId",
      "j.jobNumber",
      "j.title",
      "j.service",
      "j.location",
      "j.status",
      "j.customerId",
      "j.customerName",
      "j.primaryOwnerId",
      "c.name as linkedCustomerName",
      "c.email as linkedCustomerEmail",
      "c.location as linkedCustomerLocation",
    )
    .first();
  if (!job) throw new AuthorizationAccessError();
  const resource = await assignmentForJob(trx, context.workspaceId, job.id);
  if (!resource) throw new AuthorizationAccessError();
  permit(context, "jobs.read", resource);
  if (forCreation) {
    permit(context, "estimates.create", {
      kind: "estimate",
      id: job.id,
      workspaceId: context.workspaceId,
      job: resource,
    });
  }
  const customerName = job.linkedCustomerName ?? job.customerName;
  return {
    type: "job",
    id: job.id,
    number: `J-${String(job.jobNumber).padStart(4, "0")}`,
    name: job.title,
    status: job.status,
    service: job.service,
    customer: job.customerId && customerName ? { id: job.customerId, name: customerName } : null,
    contactName: customerName,
    recipientEmail: job.linkedCustomerEmail ?? "",
    serviceAddress: job.location || job.linkedCustomerLocation || "",
    href: `/jobs/${encodeURIComponent(job.id)}?workspace=${encodeURIComponent(context.workspaceId)}`,
  };
}

async function readLeadParent(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  leadId: string,
  forCreation: boolean,
): Promise<ParentRecord> {
  const lead = await trx("leads as l")
    .leftJoin("customers as c", function joinCustomer() {
      this.on("c.workspaceId", "l.workspaceId").andOn("c.id", "l.customerId");
    })
    .where({ "l.workspaceId": context.workspaceId, "l.id": leadId })
    .modify((query) => {
      if (forCreation) query.whereNull("l.archivedAt");
    })
    .select(
      "l.id",
      "l.leadNumber",
      "l.name",
      "l.service",
      "l.email",
      "l.address",
      "l.stage",
      "l.customerId",
      "l.ownerId",
      "c.name as linkedCustomerName",
      "c.email as linkedCustomerEmail",
    )
    .first();
  if (!lead) throw new AuthorizationAccessError();
  const resource = {
    kind: "lead" as const,
    id: lead.id as string,
    workspaceId: context.workspaceId,
    ownerId: (lead.ownerId as string | null) ?? null,
  };
  permit(context, "leads.read", resource);
  if (forCreation) {
    permit(context, "estimates.create", {
      kind: "estimate",
      id: lead.id,
      workspaceId: context.workspaceId,
      job: null,
    });
  }
  return {
    type: "lead",
    id: lead.id as string,
    number: `LD-${String(lead.leadNumber).padStart(4, "0")}`,
    name: lead.name as string,
    status: lead.stage as string,
    service: lead.service as string,
    customer: lead.customerId && lead.linkedCustomerName
      ? { id: lead.customerId as string, name: lead.linkedCustomerName as string }
      : null,
    contactName: lead.name as string,
    recipientEmail: (lead.email as string) || (lead.linkedCustomerEmail as string) || "",
    serviceAddress: lead.address as string,
    href: `/leads/${encodeURIComponent(lead.id)}?workspace=${encodeURIComponent(context.workspaceId)}`,
  };
}

async function parentRecord(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  type: "lead" | "job",
  id: string,
  forCreation: boolean,
) {
  return type === "lead"
    ? readLeadParent(trx, context, id, forCreation)
    : readJobParent(trx, context, id, forCreation);
}

export async function readEstimateParentInTransaction(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  type: "lead" | "job",
  id: string,
) {
  const parent = await parentRecord(trx, context, type, id, false);
  const active = type === "job" || !!(await trx("leads")
    .where({ workspaceId: context.workspaceId, id }).whereNull("archivedAt").first("id"));
  return { parent, canCreate: active && await creationAllowed(trx, context, parent) };
}

async function editorDefaults(
  trx: Knex.Transaction,
  workspaceId: string,
): Promise<Pick<EstimateEditorSeed, "timezone" | "today" | "paperBusiness" | "defaults" | "paymentPresets">> {
  const workspace = await trx("workspaces as w")
    .leftJoin("workspaceEstimateSettings as s", "s.workspaceId", "w.id")
    .where("w.id", workspaceId)
    .select(
      "w.timezone",
      "s.businessName",
      "s.address",
      "s.phone",
      "s.replyToEmail",
      "s.licenseLine",
      "s.logoFileId",
      "s.requireServiceAddress",
      "s.defaultTaxRateMilliPercent",
      "s.validForDays",
      "s.defaultMessage",
      "s.defaultTerms",
      "s.defaultDepositType",
      "s.defaultDepositValue",
      "s.paymentTermPresets",
      trx.raw(`to_char((now() AT TIME ZONE w.timezone)::date, 'YYYY-MM-DD') AS today`),
      trx.raw(`to_char(
        (now() AT TIME ZONE w.timezone)::date + COALESCE(s."validForDays", 30),
        'YYYY-MM-DD'
      ) AS "defaultValidUntil"`),
    )
    .first();
  if (!workspace) throw new AuthorizationAccessError();
  const presets = workspace.paymentTermPresets ?? [];
  if (!Array.isArray(presets) || presets.some((preset) =>
    !preset || typeof preset.id !== "string" || typeof preset.label !== "string" || typeof preset.text !== "string",
  )) {
    throw new Error("Estimate payment presets are invalid.");
  }
  const depositType = workspace.defaultDepositType ?? "none";
  const depositValue = String(workspace.defaultDepositValue ?? "0");
  return {
    timezone: workspace.timezone as string,
    today: workspace.today as string,
    paperBusiness: {
      name: (workspace.businessName as string | null) ?? "",
      address: (workspace.address as string | null) ?? "",
      phone: (workspace.phone as string | null) ?? "",
      email: (workspace.replyToEmail as string | null) ?? "",
      licenseLine: (workspace.licenseLine as string | null) ?? "",
      logoPath: workspace.logoFileId
        ? `/api/settings/estimates/logo/${encodeURIComponent(workspace.logoFileId as string)}`
        : null,
      requireServiceAddress: (workspace.requireServiceAddress as boolean | null) ?? true,
    },
    defaults: {
      taxRate: String(Number(workspace.defaultTaxRateMilliPercent ?? 0) / 1000),
      validUntil: workspace.defaultValidUntil as string,
      message: (workspace.defaultMessage as string | null) ?? "",
      termsNote: (workspace.defaultTerms as string | null) ?? "",
      deposit: depositType === "none"
        ? { type: "none" }
        : { type: depositType as "percent" | "amount", value: depositValue },
    },
    paymentPresets: presets as { id: string; label: string; text: string }[],
  };
}

async function memberOptions(trx: Knex.Transaction, workspaceId: string) {
  const rows = await trx("workspaceMemberships as m")
    .join("users as u", "u.id", "m.userId")
    .where("m.workspaceId", workspaceId)
    .whereNull("u.deletionRequestedAt")
    .select("m.userId as id", "u.name")
    .orderBy("u.name")
    .orderBy("m.userId")
    .limit(200);
  return rows.map((row) => ({ id: row.id as string, name: row.name as string }));
}

function adjustmentValue(type: "none" | "percent" | "amount", value: string) {
  return type === "none" ? { type: "none" as const } : { type, value };
}

function safeCents(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) throw new Error("Estimate total is invalid.");
  return parsed;
}

function dollarsToCents(value: string): number {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) throw new EstimateDraftValidationError("Enter a unit price with at most two decimal places.");
  const amount = BigInt(match[1]) * 100n + BigInt((match[2] ?? "").padEnd(2, "0"));
  const result = Number(amount);
  if (!Number.isSafeInteger(result)) throw new EstimateDraftValidationError("The unit price is too large.");
  return result;
}

function centsToDollars(value: number | null): string {
  if (value === null) return "";
  return `${Math.floor(value / 100)}.${String(value % 100).padStart(2, "0")}`;
}

function decimalText(value: unknown) {
  return String(value ?? "0").replace(/(?:\.0+|(\.\d*?)0+)$/, "$1");
}

function valuesForRow(row: EstimateRow, items: EstimateItemRow[]): EstimateDraftValues {
  return estimateDraftValuesSchema.parse({
    details: {
      name: row.name,
      recipientName: row.recipientName,
      recipientEmail: row.recipientEmail,
      serviceAddress: row.serviceAddress,
      ownerId: row.ownerId ?? "",
    },
    items: items.map((item) => ({
      description: item.description,
      quantity: decimalText(item.quantity),
      unitPrice: centsToDollars(safeCents(item.unitPriceCents)),
      taxable: item.taxable,
      included: item.included,
      ...(!item.catalogId && item.unit ? { unit: item.unit } : {}),
      ...(item.catalogId && item.catalogName
        ? {
            catalog: {
              id: item.catalogId,
              name: item.catalogName,
              unit: item.unit ?? "each",
              sku: item.sku ?? "",
            },
          }
        : {}),
    })),
    totals: {
      discount: adjustmentValue(row.discountType, decimalText(row.discountValue)),
      taxRate: decimalText(String(row.taxRateMilliPercent / 1000)),
    },
    terms: {
      message: row.message,
      validUntil: dateOnly(row.validUntil) ?? "",
      paymentTerms: row.paymentTerms,
      termsNote: row.termsNote,
      deposit: adjustmentValue(row.depositType, decimalText(row.depositValue)),
    },
    scope: row.scope,
    internalNotes: row.internalNotes,
    paymentLink: row.paymentLink,
  });
}

function calculation(values: EstimateDraftValues) {
  const result = calculateEstimateTotals({
    items: values.items,
    ...values.totals,
    deposit: values.terms.deposit,
  });
  if (
    (values.items.length > 0 && result.items.subtotalCents === null) ||
    Object.keys(result.errors).length > 0
  ) {
    throw new EstimateDraftValidationError("Correct the estimate amounts and line items before saving.");
  }
  return result;
}

async function validateOwner(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  ownerId: string,
  currentOwnerId: string | null,
): Promise<string | null> {
  const normalizedOwnerId = ownerId || null;
  if (context.membership.role === "field" && normalizedOwnerId !== currentOwnerId) {
    throw new AuthorizationAccessError();
  }
  if (!normalizedOwnerId) return null;
  const member = await trx("workspaceMemberships as m")
    .join("users as u", "u.id", "m.userId")
    .where({ "m.workspaceId": context.workspaceId, "m.userId": normalizedOwnerId })
    .whereNull("u.deletionRequestedAt")
    .first("m.userId");
  if (!member) throw new EstimateDraftValidationError("Choose a current workspace teammate.");
  return normalizedOwnerId;
}

async function validateCatalogItems(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  values: EstimateDraftValues,
) {
  const ids = [...new Set(values.items.flatMap((item) => item.catalog ? [item.catalog.id] : []))];
  if (!ids.length) return new Map<string, { name: string; unit: string; sku: string }>();
  const canRead = authorize(context, { permission: "materials.read" }).allowed;
  if (!canRead) throw new AuthorizationAccessError();
  const rows = await trx("materialCatalog")
    .where({ workspaceId: context.workspaceId, status: "active" })
    .whereNull("archivedAt")
    .whereIn("id", ids)
    .select("id", "name", "unit", "sku");
  if (rows.length !== ids.length) {
    throw new EstimateDraftValidationError("A selected material is no longer available. Search the catalog again.");
  }
  return new Map(
    rows.map((row) => [
      row.id as string,
      { name: row.name as string, unit: row.unit as string, sku: row.sku as string },
    ]),
  );
}

function totalFields(values: EstimateDraftValues) {
  const result = calculation(values);
  const hasItems = values.items.length > 0;
  return {
    subtotalCents: hasItems ? result.items.subtotalCents : null,
    discountCents: hasItems ? result.discountCents : null,
    taxCents: hasItems ? result.taxCents : null,
    totalCents: hasItems ? result.totalCents : null,
    depositCents: hasItems ? result.depositCents : null,
    balanceCents: hasItems ? result.balanceCents : null,
    taxRateMilliPercent: result.taxRateMilliPercent ?? 0,
    discountType: values.totals.discount.type,
    discountValue: values.totals.discount.type === "none" ? "0" : values.totals.discount.value,
    depositType: values.terms.deposit.type,
    depositValue: values.terms.deposit.type === "none" ? "0" : values.terms.deposit.value,
  };
}

async function insertItems(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  estimateId: string,
  values: EstimateDraftValues,
  totals: ReturnType<typeof calculation>,
) {
  if (!values.items.length) return;
  const catalog = await validateCatalogItems(trx, context, values);
  await trx("estimate_items").insert(values.items.map((item, position) => {
    const snapshot = item.catalog ? catalog.get(item.catalog.id) : undefined;
    const amountCents = totals.items.items[position]?.amountCents;
    return {
      id: randomUUID(),
      workspaceId: context.workspaceId,
      estimateId,
      position,
      catalogId: item.catalog?.id ?? null,
      catalogName: snapshot?.name ?? null,
      unit: snapshot?.unit ?? item.unit ?? null,
      sku: snapshot?.sku ?? null,
      description: item.description,
      quantity: item.quantity,
      unitPriceCents: dollarsToCents(item.unitPrice),
      taxable: item.taxable,
      included: item.included,
      amountCents,
    };
  }));
}

async function estimateJob(
  trx: Knex.Transaction,
  row: EstimateRow,
): Promise<JobResource | null> {
  return row.jobId
    ? assignmentForJob(trx, row.workspaceId, row.jobId)
    : null;
}

async function accessibleEstimate(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  estimateId: string,
  lock = false,
): Promise<{ row: EstimateRow; job: JobResource | null }> {
  const scope = estimateReadScope(context);
  let query = trx("estimates as e")
    .where("e.workspaceId", context.workspaceId)
    .where("e.id", estimateId);
  query = applyEstimateReadScope(query, trx, context, scope);
  if (lock) query = query.forUpdate("e");
  const row = (await query.first("e.*")) as EstimateRow | undefined;
  if (!row) throw new AuthorizationAccessError();
  const job = await estimateJob(trx, row);
  permit(context, "estimates.read", estimateResource(row, job));
  return { row, job };
}

async function itemsForEstimate(
  trx: Knex.Transaction,
  workspaceId: string,
  estimateId: string,
): Promise<EstimateItemRow[]> {
  return trx("estimate_items")
    .where({ workspaceId, estimateId })
    .orderBy("position")
    .select(
      "id",
      "catalogId",
      "catalogName",
      "unit",
      "sku",
      "description",
      "quantity",
      "unitPriceCents",
      "taxable",
      "included",
    ) as Promise<EstimateItemRow[]>;
}

async function editorRecord(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  row: EstimateRow,
  today: string,
): Promise<EstimateEditorRecord> {
  let parent: ParentRecord;
  try {
    parent = await parentRecord(
      trx,
      context,
      row.parentType,
      (row.parentType === "lead" ? row.leadId : row.jobId) as string,
      false,
    );
  } catch (error) {
    if (!(error instanceof AuthorizationAccessError)) throw error;
    parent = {
      type: row.parentType,
      id: (row.parentType === "lead" ? row.leadId : row.jobId) as string,
      number: "Unavailable",
      name: "Restricted related record",
      status: "Unavailable",
      service: "",
      customer: null,
      contactName: "",
      recipientEmail: "",
      serviceAddress: "",
    };
  }
  const items = await itemsForEstimate(trx, context.workspaceId, row.id);
  const snapshot = await trx("estimate_snapshots")
    .where({ workspaceId: context.workspaceId, estimateId: row.id })
    .first("id");
  return {
    id: row.id,
    number: numberLabel(row.estimateNumber),
    revision: row.revision,
    status: estimateStatusAtDate(row.status, dateOnly(row.validUntil), today),
    archived: row.archivedAt !== null,
    version: row.version,
    updatedAt: row.updatedAt.toISOString(),
    sharing: snapshot || row.sentAt || row.publishedAt ? "shared" : "never-shared",
    parent,
    values: valuesForRow(row, items),
  };
}

function capabilities(
  context: AuthorizationContext,
  row: EstimateRow | null,
  job: JobResource | null,
  createAllowed: boolean,
) {
  const resource = row ? estimateResource(row, job) : undefined;
  return {
    read: true,
    create: createAllowed,
    update: !!row && row.status === "draft" && row.archivedAt === null &&
      authorize(context, { permission: "estimates.update", resource }).allowed,
    delete: !!row && row.status === "draft" && row.archivedAt === null &&
      authorize(context, { permission: "estimates.delete", resource }).allowed,
    void: !!row && authorize(context, { permission: "estimates.void", resource }).allowed,
    archive: !!row && authorize(context, { permission: "estimates.archive", resource }).allowed,
    assignOwner: context.membership.role !== "field",
    browseMaterials: authorize(context, { permission: "materials.read" }).allowed,
    viewMaterialPrices: authorize(context, {
      permission: "workorders.view_prices",
      resource: { kind: "work_order", id: "estimate-catalog", workspaceId: context.workspaceId, job: null },
    }).allowed,
  };
}

async function creationAllowed(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  parent: ParentRecord,
): Promise<boolean> {
  if (parent.type === "lead") {
    return authorize(context, {
      permission: "estimates.create",
      resource: { kind: "estimate", id: parent.id, workspaceId: context.workspaceId, job: null },
    }).allowed;
  }
  const job = await assignmentForJob(trx, context.workspaceId, parent.id);
  return !!job && authorize(context, {
    permission: "estimates.create",
    resource: { kind: "estimate", id: parent.id, workspaceId: context.workspaceId, job },
  }).allowed;
}

async function seed(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  parent: ParentRecord | null,
  row: EstimateRow | null,
  job: JobResource | null,
): Promise<EstimateEditorSeed> {
  const base = await editorDefaults(trx, context.workspaceId);
  const members = await memberOptions(trx, context.workspaceId);
  const estimate = row ? await editorRecord(trx, context, row, base.today) : null;
  const effectiveParent = parent ?? estimate?.parent ?? null;
  const existingEstimates = !row && effectiveParent?.type === "lead" && effectiveParent.href
    ? await applyEstimateReadScope(trx("estimates as e"), trx, context, estimateReadScope(context))
        .where({ "e.workspaceId": context.workspaceId, "e.leadId": effectiveParent.id })
        .whereIn("e.status", ["draft", "sent", "published"])
        .whereNull("e.archivedAt")
        .whereNotExists(trx("estimates as newer").select(trx.raw("1"))
          .whereRaw(`newer."workspaceId" = e."workspaceId" AND newer."estimateNumber" = e."estimateNumber" AND newer.revision > e.revision`))
        .andWhere((query) => query.where("e.status", "draft").orWhereRaw(
          `e."validUntil" >= ?::date`, [base.today],
        ))
        .orderBy("e.updatedAt", "desc").orderBy("e.id")
        .limit(5)
        .select("e.id", "e.estimateNumber", "e.status")
        .then((rows: { id: string; estimateNumber: number; status: "draft" | "sent" | "published" }[]) => rows.map((item) => ({
          id: item.id as string,
          number: numberLabel(Number(item.estimateNumber)),
          status: item.status as "draft" | "sent" | "published",
          href: `/estimates/${encodeURIComponent(item.id as string)}?workspace=${encodeURIComponent(context.workspaceId)}`,
        })))
    : [];
  const createAllowed = effectiveParent?.href
    ? await creationAllowed(trx, context, effectiveParent)
    : false;
  return {
    workspaceId: context.workspaceId,
    ...base,
    parent: effectiveParent,
    existingEstimates,
    estimate,
    members,
    capabilities: capabilities(context, row, job, createAllowed),
  };
}

export async function readEstimateCreationSeed(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  parentType: "lead" | "job",
  parentId: string,
  customerId?: string,
): Promise<EstimateEditorSeed> {
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    return readEstimateCreationSeedInTransaction(trx, context, parentType, parentId, customerId);
  });
}

export async function readEstimateCreationSeedInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, parentType: "lead" | "job", parentId: string, customerId?: string,
): Promise<EstimateEditorSeed> {
    const parent = await parentRecord(trx, context, parentType, parentId, true);
    if (customerId) {
      const customer = await readCustomerRecordInTransaction(trx, context, customerId);
      if (customer.archived || parent.customer?.id !== customerId) throw new AuthorizationAccessError();
    }
    if (!(await creationAllowed(trx, context, parent))) throw new AuthorizationAccessError();
    return { ...await seed(trx, context, parent, null, null), ...(customerId ? { creationCustomerId: customerId } : {}) };
}

export async function readEstimateEditor(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  estimateId: string,
): Promise<EstimateEditorSeed> {
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    return readEstimateEditorInTransaction(trx, context, estimateId);
  });
}

export async function readEstimateEditorInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, estimateId: string,
): Promise<EstimateEditorSeed> {
  const { row, job } = await accessibleEstimate(trx, context, estimateId);
  return seed(trx, context, null, row, job);
}

export async function readEstimateAssistantDetail(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  rawEstimateId: string,
) {
  const estimateId = estimateIdSchema.parse(rawEstimateId);
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const { row, status, today } = await loadEstimateLifecycleContext(
      trx,
      context,
      estimateId,
    );
    const itemRows = await itemsForEstimate(trx, context.workspaceId, row.id);
    const isDraft = row.status === "draft";
    const snapshot = isDraft ? null : (await revisionSnapshot(trx, row)).snapshot;
    const values = isDraft ? valuesForRow(row, itemRows) : null;
    const content = snapshot?.content;
    const items = content?.items ?? values?.items ?? [];
    const totals = content
      ? {
          items,
          discount: content.discount,
          taxRate: content.taxRate,
          deposit: content.deposit,
        }
      : {
          items,
          discount: values!.totals.discount,
          taxRate: values!.totals.taxRate,
          deposit: values!.terms.deposit,
        };
    const calculation = calculateEstimateTotals(totals);
    const lineAmounts = snapshot?.amounts.lineAmountsCents;
    const lineItems = items.map((item, index) => ({
      description: item.description,
      quantity: item.quantity,
      unitPriceCents: dollarsToCents(item.unitPrice),
      unit: "unit" in item ? item.unit : item.catalog?.unit ?? null,
      taxable: item.taxable,
      included: item.included,
      amountCents: lineAmounts?.[index] ?? calculation.items.items[index]?.amountCents ?? null,
      errors: calculation.items.items[index]?.errors ?? {},
    }));
    const amounts = snapshot?.amounts;

    return {
      id: row.id,
      number: content?.number ?? numberLabel(row.estimateNumber),
      revision: row.revision,
      name: content?.name ?? row.name,
      status,
      archived: row.archivedAt !== null,
      scope: content?.scope ?? values!.scope,
      validUntil: content?.validUntil ?? dateOnly(row.validUntil) ?? "",
      lineItems,
      adjustments: {
        discount: totals.discount,
        taxRate: totals.taxRate,
        deposit: totals.deposit,
      },
      calculationErrors: calculation.errors,
      itemError: calculation.items.error,
      totals: {
        subtotalCents: amounts?.subtotalCents ?? calculation.items.subtotalCents,
        discountCents: amounts?.discountCents ?? calculation.discountCents,
        taxableDiscountCents: calculation.taxableDiscountCents,
        nonTaxableDiscountCents: calculation.nonTaxableDiscountCents,
        taxableAfterDiscountCents: calculation.taxableAfterDiscountCents,
        taxRateMilliPercent: calculation.taxRateMilliPercent,
        taxCents: amounts?.taxCents ?? calculation.taxCents,
        totalCents: amounts?.totalCents ?? calculation.totalCents,
        depositCents: amounts?.depositCents ?? calculation.depositCents,
        balanceCents: amounts?.balanceCents ?? calculation.balanceCents,
      },
      source: snapshot ? "frozen_snapshot" as const : "current_draft" as const,
      today,
    };
  });
}

/** Internal loader; callers must hold the workspace authorization transaction. */
export async function authorizeEstimateDelivery(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  estimateId: string,
) {
  const { row, job } = await accessibleEstimate(trx, context, estimateId);
  permit(context, "estimates.send", estimateResource(row, job));
  return row;
}

/** Internal loader; callers must hold the workspace authorization transaction. */
export async function loadEstimateLifecycleContext(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  estimateId: string,
  lock = false,
) {
  const { row, job } = await accessibleEstimate(trx, context, estimateId, lock);
  const workspace = await trx("workspaces").where({ id: context.workspaceId })
    .select("timezone", trx.raw(`to_char((clock_timestamp() AT TIME ZONE timezone)::date, 'YYYY-MM-DD') AS today`)).first();
  return {
    row,
    status: estimateStatusAtDate(row.status, dateOnly(row.validUntil), workspace.today),
    timezone: workspace.timezone as string,
    today: workspace.today as string,
    canVoid: authorize(context, { permission: "estimates.void", resource: estimateResource(row, job) }).allowed,
    canArchive: authorize(context, { permission: "estimates.archive", resource: estimateResource(row, job) }).allowed,
    canDecide: authorize(context, { permission: "estimates.decide", resource: estimateResource(row, job) }).allowed,
    canCorrectDecision: context.membership.role !== "field" &&
      authorize(context, { permission: "estimates.decide", resource: estimateResource(row, job) }).allowed,
    canRevise: authorize(context, { permission: "estimates.update", resource: estimateResource(row, job) }).allowed &&
      authorize(context, { permission: "estimates.create", resource: estimateResource(row, job) }).allowed,
  };
}

/** Internal loader; callers must hold the workspace authorization transaction. */
export async function loadEstimateSharingContext(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  estimateId: string,
) {
  const { row, job } = await accessibleEstimate(trx, context, estimateId);
  const loaded = await seed(trx, context, null, row, job);
  const date = await trx("workspaces").where({ id: context.workspaceId })
    .select(trx.raw(`to_char((clock_timestamp() AT TIME ZONE timezone)::date, 'YYYY-MM-DD') AS today`)).first();
  loaded.today = date.today;
  if (loaded.estimate) {
    loaded.estimate.status = estimateStatusAtDate(row.status, dateOnly(row.validUntil), loaded.today);
  }
  return {
    seed: loaded,
    canSend: authorize(context, {
      permission: "estimates.send",
      resource: estimateResource(row, job),
    }).allowed,
  };
}

function validateValues(raw: unknown) {
  const values = estimateDraftValuesSchema.parse(raw);
  const totals = calculation(values);
  return { values, totals };
}

async function writeActivity(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  estimateId: string,
  type: string,
  changes: Record<string, unknown>,
  source: "ui" | "assistant-confirmed" = "ui",
) {
  const user = await trx("users").where({ id: context.userId }).first("name");
  if (!user) throw new AuthorizationAccessError();
  await trx("estimate_activity").insert({
    id: randomUUID(),
    workspaceId: context.workspaceId,
    estimateId,
    actorId: context.userId,
    actorName: user.name,
    source,
    type,
    changes: JSON.stringify(changes),
  });
}

async function priorOperationResult(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  submissionId: string,
  operation: "create" | "revise",
  hash: string,
): Promise<EstimateDraftSaveResult | null> {
  const previous = await trx("estimate_operation_receipts")
    .where({ workspaceId: context.workspaceId, submissionId })
    .first();
  if (!previous) return null;
  if (
    previous.actorId !== context.userId ||
    previous.operation !== operation ||
    previous.inputHash !== hash ||
    !previous.estimateId
  ) {
    throw new EstimateDraftConflictError("This save was already used for different estimate details.");
  }
  const prior = (await trx("estimates as e")
    .where({ "e.workspaceId": context.workspaceId, "e.id": previous.estimateId })
    .first("e.*")) as EstimateRow | undefined;
  if (!prior) throw new EstimateDraftConflictError();
  const job = await estimateJob(trx, prior);
  permit(context, "estimates.read", estimateResource(prior, job));
  return {
    id: prior.id,
    number: numberLabel(prior.estimateNumber),
    revision: prior.revision,
    version: prior.version,
    updatedAt: prior.updatedAt.toISOString(),
  };
}

export async function createEstimateDraftInTransaction(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  input: {
    submissionId: string;
    customerId?: string;
    operation?: "create" | "revise";
    receiptHash?: string;
    source?: "ui" | "assistant-confirmed";
    revision?: { estimateNumber: number; sourceEstimateId: string; sourceRevision: number; ownerId: string | null };
    parent: Pick<ParentRecord, "type" | "id">;
    values: EstimateDraftValues;
  },
): Promise<EstimateDraftSaveResult> {
  const { values, totals } = validateValues(input.values);
  const operation = input.operation ?? "create";
  const hash = input.receiptHash ?? hashInput({
    parentType: input.parent.type,
    parentId: input.parent.id,
    ...(input.customerId ? { customerId: input.customerId } : {}),
    values,
  });
  if (input.customerId) {
    const customer = await readCustomerRecordInTransaction(trx, context, input.customerId);
    const linked = await trx(input.parent.type === "lead" ? "leads" : "jobs")
      .where({ workspaceId: context.workspaceId, id: input.parent.id, customerId: input.customerId }).forShare().first("id");
    if (!linked || customer.archived) throw new AuthorizationAccessError();
    const parent = await parentRecord(trx, context, input.parent.type, input.parent.id, true);
    if (!(await creationAllowed(trx, context, parent))) throw new AuthorizationAccessError();
  }
  const prior = await priorOperationResult(
    trx,
    context,
    input.submissionId,
    operation,
    hash,
  );
  if (prior) return prior;

  const parent = await parentRecord(trx, context, input.parent.type, input.parent.id, true);
  if (!(await creationAllowed(trx, context, parent))) throw new AuthorizationAccessError();
  const job = parent.type === "job"
    ? await assignmentForJob(trx, context.workspaceId, parent.id)
    : null;
  const resource = {
    kind: "estimate" as const,
    id: parent.id,
    workspaceId: context.workspaceId,
    job,
  };
  permit(context, "estimates.create", resource);
  const ownerId = await validateOwner(
    trx,
    context,
    values.details.ownerId,
    input.revision ? input.revision.ownerId : context.membership.role === "field" ? context.userId : null,
  );
  const estimateId = randomUUID();
  const parents = {
    parentType: parent.type,
    leadId: parent.type === "lead" ? parent.id : null,
    jobId: parent.type === "job" ? parent.id : null,
    customerId: parent.customer?.id ?? null,
  };
  const amountFields = totalFields(values);
  const [row] = await trx("estimates")
    .insert({
      id: estimateId,
      workspaceId: context.workspaceId,
      revision: 1,
      ...(input.revision ? {
        estimateNumber: input.revision.estimateNumber, sourceEstimateId: input.revision.sourceEstimateId,
      } : {}),
      name: values.details.name,
      status: "draft",
      ...parents,
      ownerId,
      recipientName: values.details.recipientName,
      recipientEmail: values.details.recipientEmail,
      serviceAddress: values.details.serviceAddress,
      scope: values.scope,
      message: values.terms.message,
      termsNote: values.terms.termsNote,
      paymentTerms: values.terms.paymentTerms,
      paymentLink: values.paymentLink ?? "",
      internalNotes: values.internalNotes,
      validUntil: values.terms.validUntil || null,
      ...amountFields,
      createdBy: context.userId,
    })
    .returning(["id", "estimateNumber", "revision", "version", "updatedAt"]);
  await insertItems(trx, context, estimateId, values, totals);
  await writeActivity(trx, context, estimateId, input.revision ? "revision-created" : "created", {
    status: { before: null, after: "draft" },
    itemCount: values.items.length,
    ...(input.revision ? { revision: { before: input.revision.sourceRevision, after: row.revision } } : {}),
  }, input.source);
  await trx("estimate_operation_receipts").insert({
    workspaceId: context.workspaceId,
    submissionId: input.submissionId,
    actorId: context.userId,
    operation,
    inputHash: hash,
    estimateId,
    version: Number(row.version),
  });
  return {
    id: row.id as string,
    number: numberLabel(Number(row.estimateNumber)),
    revision: Number(row.revision),
    version: Number(row.version),
    updatedAt: (row.updatedAt as Date).toISOString(),
  };
}

export async function createEstimateDraft(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  raw: unknown,
) {
  const input = createEstimateDraftSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    return createEstimateDraftInTransaction(trx, context, {
      submissionId: input.submissionId,
      customerId: input.customerId,
      parent: { type: input.parentType, id: input.parentId },
      values: input.values,
    });
  });
}

export async function updateEstimateDraft(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  raw: unknown,
) {
  const input = updateEstimateDraftSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    return updateEstimateDraftInTransaction(trx, context, input);
  });
}

export async function updateEstimateDraftInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, raw: unknown, source: "ui" | "assistant-confirmed" = "ui",
) {
    const input = updateEstimateDraftSchema.parse(raw);
    if (input.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
    const { values, totals } = validateValues(input.values);
    const { row, job } = await accessibleEstimate(trx, context, input.estimateId, true);
    permit(context, "estimates.update", estimateResource(row, job));
    if (row.status !== "draft" || row.archivedAt !== null) throw new AuthorizationAccessError();
    if (row.version !== input.expectedVersion) throw new EstimateDraftConflictError();
    const ownerId = await validateOwner(trx, context, values.details.ownerId, row.ownerId);
    const fields = changedEstimateDraftFields(
      valuesForRow(row, await itemsForEstimate(trx, context.workspaceId, row.id)), values,
    );
    const amountFields = totalFields(values);
    const [updated] = await trx("estimates")
      .where({ workspaceId: context.workspaceId, id: row.id, version: input.expectedVersion })
      .update({
        name: values.details.name,
        ownerId,
        recipientName: values.details.recipientName,
        recipientEmail: values.details.recipientEmail,
        serviceAddress: values.details.serviceAddress,
        scope: values.scope,
        message: values.terms.message,
        termsNote: values.terms.termsNote,
        paymentTerms: values.terms.paymentTerms,
        paymentLink: values.paymentLink ?? row.paymentLink,
        internalNotes: values.internalNotes,
        validUntil: values.terms.validUntil || null,
        ...amountFields,
        version: row.version + 1,
        updatedAt: trx.fn.now(),
      })
      .returning(["id", "estimateNumber", "revision", "version", "updatedAt"]);
    if (!updated) throw new EstimateDraftConflictError();
    await trx("estimate_items").where({ workspaceId: context.workspaceId, estimateId: row.id }).delete();
    await insertItems(trx, context, row.id, values, totals);
    await writeActivity(trx, context, row.id, "draft.saved", {
      fromVersion: row.version,
      toVersion: Number(updated.version),
      itemCount: values.items.length,
      fields,
    }, source);
    return {
      id: updated.id as string,
      number: numberLabel(Number(updated.estimateNumber)),
      revision: Number(updated.revision),
      version: Number(updated.version),
      updatedAt: (updated.updatedAt as Date).toISOString(),
    };
}

export async function duplicateEstimate(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  raw: unknown,
) {
  const input = duplicateEstimateSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    return duplicateEstimateInTransaction(trx, context, input);
  });
}

export async function duplicateEstimateInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, raw: unknown, source: "ui" | "assistant-confirmed" = "ui",
) {
  const input = duplicateEstimateSchema.parse(raw);
  if (input.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const receiptHash = hashInput({
    operation: "duplicate",
    estimateId: input.estimateId,
    expectedVersion: input.expectedVersion,
  });
  const prior = await priorOperationResult(
    trx,
    context,
    input.submissionId,
    "create",
    receiptHash,
  );
  if (prior) return prior;
  const { parent, values } = await duplicateDraftReview(trx, context, input.estimateId, input.expectedVersion);
  return createEstimateDraftInTransaction(trx, context, {
    submissionId: input.submissionId,
    operation: "create",
    receiptHash,
    parent,
    values, source,
  });
}

async function duplicateDraftReview(
  trx: Knex.Transaction, context: AuthorizationContext, estimateId: string, expectedVersion?: number,
) {
  const { row, job } = await accessibleEstimate(trx, context, estimateId, expectedVersion !== undefined);
  permit(context, "estimates.create", estimateResource(row, job));
  if (expectedVersion !== undefined && row.version !== expectedVersion) throw new EstimateDraftConflictError();
  const parent = await parentRecord(trx, context, row.parentType, (row.parentType === "lead" ? row.leadId : row.jobId)!, true);
  const saved = valuesForRow(row, await itemsForEstimate(trx, context.workspaceId, row.id));
  const values = estimateDraftValuesSchema.parse({
    ...saved, paymentLink: "",
    details: { ...saved.details, name: `${saved.details.name.slice(0, 113)} (copy)`, recipientName: "", recipientEmail: "" },
    terms: { ...saved.terms, validUntil: "" },
  });
  return { row, parent, values };
}

type RevisionSnapshotRow = { workspaceId: string; estimateId: string; content: unknown; contentHash: string };

function checkedRevisionSnapshot(
  row: Pick<EstimateRow, "estimateNumber" | "revision">,
  frozen: RevisionSnapshotRow | undefined,
) {
  const snapshot = frozen && verifiedEstimateFrozenSnapshot(frozen.content, frozen.contentHash);
  if (!frozen || !snapshot || snapshot.content.number !== numberLabel(row.estimateNumber) ||
      snapshot.content.revision !== row.revision) {
    throw new EstimateDraftValidationError("The frozen revision is unavailable. Reload before continuing.");
  }
  return { snapshot, snapshotHash: frozen.contentHash };
}

async function revisionSnapshot(trx: Knex.Transaction, row: Pick<EstimateRow, "workspaceId" | "id" | "estimateNumber" | "revision">) {
  const frozen = await trx<RevisionSnapshotRow>("estimate_snapshots").where({ workspaceId: row.workspaceId, estimateId: row.id }).first();
  return checkedRevisionSnapshot(row, frozen);
}

export async function reviseEstimate(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown,
): Promise<EstimateDraftSaveResult> {
  const input = reviseEstimateSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    return reviseEstimateInTransaction(trx, context, input);
  });
}

export async function reviseEstimateInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, raw: unknown, source: "ui" | "assistant-confirmed" = "ui",
): Promise<EstimateDraftSaveResult> {
  const input = reviseEstimateSchema.parse(raw);
  if (input.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const loaded = await loadEstimateLifecycleContext(trx, context, input.estimateId);
  if (!loaded.canRevise) throw new AuthorizationAccessError();
  const receiptHash = hashInput(input);
  const prior = await priorOperationResult(trx, context, input.submissionId, "revise", receiptHash);
  if (prior) return prior;
  const { row } = loaded;
  if (row.version !== input.expectedVersion) throw new EstimateDraftConflictError();
  const { pending, values, activeOwner, snapshotHash } = await revisionDraftReview(trx, context, loaded);
  if (snapshotHash !== input.snapshotHash) throw new EstimateDraftConflictError("The reviewed revision changed. Reload and review it.");
  if (pending) {
    await trx("estimate_operation_receipts").insert({
      workspaceId: context.workspaceId, submissionId: input.submissionId, actorId: context.userId,
      operation: "revise", inputHash: receiptHash, estimateId: pending.id, version: pending.version,
    });
    return {
      id: pending.id, number: numberLabel(pending.estimateNumber), revision: pending.revision,
      version: pending.version, updatedAt: pending.updatedAt.toISOString(),
    };
  }
  return createEstimateDraftInTransaction(trx, context, {
    submissionId: input.submissionId, operation: "revise", receiptHash, values, source,
    parent: { type: row.parentType, id: (row.parentType === "lead" ? row.leadId : row.jobId)! },
    revision: {
      estimateNumber: row.estimateNumber, sourceEstimateId: row.id, sourceRevision: row.revision,
      ownerId: activeOwner,
    },
  });
}

async function revisionDraftReview(
  trx: Knex.Transaction, context: AuthorizationContext, loaded: Awaited<ReturnType<typeof loadEstimateLifecycleContext>>,
) {
  const { row, status } = loaded;
  if (row.archivedAt || !["sent", "published", "declined", "expired"].includes(status)) {
    throw new EstimateDraftValidationError("Only an active Sent, Published, Declined or Expired estimate can be revised.");
  }
  const { snapshot, snapshotHash } = await revisionSnapshot(trx, row);
  if (await trx("estimates").where({ workspaceId: context.workspaceId, estimateNumber: row.estimateNumber })
    .where("revision", ">", row.revision).whereNot("status", "draft").first("id")) {
    throw new EstimateDraftConflictError("A newer shared revision already exists. Open the current revision.");
  }
  const pending = await trx<EstimateRow>("estimates").where({
    workspaceId: context.workspaceId, estimateNumber: row.estimateNumber, status: "draft",
  }).first();
  if (pending) {
    if (pending.sourceEstimateId !== row.id || pending.archivedAt) throw new EstimateDraftConflictError();
    const { job } = await accessibleEstimate(trx, context, pending.id);
    permit(context, "estimates.update", estimateResource(pending, job));
    return {
      snapshotHash, pending, activeOwner: pending.ownerId,
      values: valuesForRow(pending, await itemsForEstimate(trx, context.workspaceId, pending.id)),
    };
  }
  const { content } = snapshot;
  const activeOwner = row.ownerId && await trx("workspaceMemberships as m").join("users as u", "u.id", "m.userId")
    .where({ "m.workspaceId": context.workspaceId, "m.userId": row.ownerId }).whereNull("u.deletionRequestedAt").first("m.userId");
  const values = estimateDraftValuesSchema.parse({
    details: {
      name: content.name, recipientName: content.recipientName, recipientEmail: content.recipientEmail,
      serviceAddress: content.serviceAddress, ownerId: activeOwner ? row.ownerId : "",
    },
    items: content.items.map(item => ({
      description: item.description, quantity: item.quantity, unitPrice: item.unitPrice,
      taxable: item.taxable, included: item.included, unit: item.unit,
    })),
    totals: { discount: content.discount, taxRate: content.taxRate },
    terms: {
      message: content.message, validUntil: content.validUntil, paymentTerms: content.paymentTerms,
      termsNote: content.termsNote, deposit: content.deposit,
    },
    scope: content.scope, internalNotes: "", paymentLink: content.paymentLink ?? "",
  });
  return { snapshotHash, pending: null, values, activeOwner: activeOwner ? row.ownerId : null };
}

export async function readEstimateDraftActionReviewInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, operation: "revise" | "duplicate", estimateId: string,
) {
  const loaded = await loadEstimateLifecycleContext(trx, context, estimateId);
  if (operation === "revise" && !loaded.canRevise) throw new AuthorizationAccessError();
  const row = loaded.row;
  const prepared = operation === "revise"
    ? await revisionDraftReview(trx, context, loaded)
    : { ...await duplicateDraftReview(trx, context, estimateId), pending: null, snapshotHash: null, activeOwner: null };
  const parent = await parentRecord(trx, context, row.parentType,
    (row.parentType === "lead" ? row.leadId : row.jobId)!, !prepared.pending);
  const parentRow = await trx(parent.type === "lead" ? "leads" : "jobs")
    .where({ workspaceId: context.workspaceId, id: parent.id }).first("version");
  if (!parentRow) throw new AuthorizationAccessError();
  const { values, totals } = validateValues(prepared.values);
  for (const item of values.items) {
    if (!item.unit) delete item.unit;
  }
  if (!prepared.pending) {
    await validateOwner(trx, context, values.details.ownerId,
      operation === "revise" ? prepared.activeOwner : context.membership.role === "field" ? context.userId : null);
    const catalog = await validateCatalogItems(trx, context, values);
    for (const item of values.items) {
      if (item.catalog) {
        const current = catalog.get(item.catalog.id);
        if (!current) throw new EstimateDraftValidationError("A selected material is no longer available.");
        item.catalog = { id: item.catalog.id, ...current };
      }
    }
  }
  const counter = operation === "revise" && !prepared.pending
    ? await trx("workspaceEstimateRevisionCounters").where({ workspaceId: context.workspaceId, estimateNumber: row.estimateNumber }).first("lastRevision")
    : null;
  if (operation === "revise" && !prepared.pending && !counter) throw new EstimateDraftConflictError("The revision counter is unavailable.");
  return {
    source: {
      id: row.id, version: row.version, number: numberLabel(row.estimateNumber), revision: row.revision,
      name: row.name, status: loaded.status, archived: row.archivedAt !== null,
    },
    parent: { type: parent.type, id: parent.id, version: Number(parentRow.version), number: parent.number, name: parent.name },
    plan: {
      kind: prepared.pending ? "reuse" as const : "create" as const,
      revision: prepared.pending?.revision ?? (counter ? Number(counter.lastRevision) + 1 : 1),
      existingDraft: prepared.pending ? { id: prepared.pending.id, version: prepared.pending.version } : null,
    },
    values, totalCents: values.items.length ? totals.totalCents : null, snapshotHash: prepared.snapshotHash,
  };
}

export async function readEstimateRevisionFamily(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown,
): Promise<EstimateRevisionFamily> {
  const input = estimateRevisionsQuerySchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const { row, status, canRevise, today } = await loadEstimateLifecycleContext(trx, context, input.estimateId);
    const query = applyEstimateReadScope(trx("estimates as e").where({
      "e.workspaceId": context.workspaceId, "e.estimateNumber": row.estimateNumber,
    }), trx, context, estimateReadScope(context));
    const total = Number((await query.clone().count({ count: "*" }).first())!.count);
    if (input.beforeRevision) query.where("e.revision", "<", input.beforeRevision);
    const rows: EstimateRow[] = await query.select("e.*").orderBy("e.revision", "desc").limit(26);
    const page = rows.slice(0, 25);
    const snapshotIds = [...new Set([...page.filter(value => value.status !== "draft").map(value => value.id),
      ...(row.status !== "draft" ? [row.id] : [])])];
    const snapshots = snapshotIds.length
      ? await trx<RevisionSnapshotRow>("estimate_snapshots").where({ workspaceId: context.workspaceId }).whereIn("estimateId", snapshotIds)
      : [];
    const byEstimate = new Map(snapshots.map(value => [value.estimateId, value]));
    const revisions = page.map(value => ({
      id: value.id, revision: value.revision,
      status: estimateStatusAtDate(value.status, dateOnly(value.validUntil), today),
      archived: value.archivedAt !== null,
      totalCents: value.status === "draft" ? safeCents(value.totalCents) : checkedRevisionSnapshot(value, byEstimate.get(value.id)).snapshot.amounts.totalCents,
      href: `/estimates/${encodeURIComponent(value.id)}?workspace=${encodeURIComponent(context.workspaceId)}`,
    }));
    return {
      number: numberLabel(row.estimateNumber), currentEstimateId: row.id, version: row.version,
      snapshotHash: row.status === "draft" ? null : checkedRevisionSnapshot(row, byEstimate.get(row.id)).snapshotHash,
      canRevise: canRevise && !row.archivedAt && ["sent", "published", "declined", "expired"].includes(status),
      revisions, total, nextBeforeRevision: rows.length > 25 ? page.at(-1)!.revision : null,
    };
  });
}

/** The caller holds the workspace lock; this review is reloaded again inside Send/Publish. */
export async function loadEstimateRevisionSharingReview(
  trx: Knex.Transaction, context: AuthorizationContext, estimateId: string, requireSend = true,
) {
  const { row } = await accessibleEstimate(trx, context, estimateId);
  if (!row.sourceEstimateId || row.status !== "draft") return null;
  const source = await loadEstimateLifecycleContext(trx, context, row.sourceEstimateId);
  const { job } = await accessibleEstimate(trx, context, source.row.id);
  if (requireSend) permit(context, "estimates.send", estimateResource(source.row, job));
  if (source.row.archivedAt || !["sent", "published", "declined", "expired"].includes(source.status) ||
      source.row.estimateNumber !== row.estimateNumber || source.row.revision >= row.revision) {
    throw new EstimateDraftValidationError("The previous revision can no longer be replaced. Reload its current status.");
  }
  const { snapshot } = await revisionSnapshot(trx, source.row);
  return {
    sourceEstimateId: source.row.id, sourceVersion: source.row.version, sourceRevision: source.row.revision,
    sourceStatus: source.status,
    requiresPaymentLinkReview: !!row.paymentLink && row.paymentLink === snapshot.content.paymentLink,
  };
}

export function validateEstimateRevisionConfirmation(
  review: Awaited<ReturnType<typeof loadEstimateRevisionSharingReview>>,
  confirmation: EstimateRevisionSharing | undefined,
) {
  if (!review) {
    if (confirmation) throw new EstimateDraftValidationError("This Draft is not a revision.");
    return;
  }
  if (!confirmation || confirmation.sourceEstimateId !== review.sourceEstimateId ||
      confirmation.sourceVersion !== review.sourceVersion) {
    throw new EstimateDraftConflictError("The previous revision changed. Reload and review before replacing it.");
  }
  if (review.requiresPaymentLinkReview && !confirmation.paymentLinkReviewed) {
    throw new EstimateDraftValidationError("Review the carried payment link against this revision before sharing.");
  }
}

async function assertEstimateDraftDeletable(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  row: EstimateRow,
  job: JobResource | null,
) {
  permit(context, "estimates.delete", estimateResource(row, job));
  if (
    row.status !== "draft" ||
    row.archivedAt !== null ||
    row.sentAt ||
    row.publishedAt ||
    await trx("estimate_snapshots")
      .where({ workspaceId: context.workspaceId, estimateId: row.id })
      .first("id")
  ) {
    throw new AuthorizationAccessError();
  }
}

export async function readEstimateDraftDeletionReviewInTransaction(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  estimateId: string,
) {
  const { row, job } = await accessibleEstimate(trx, context, estimateId);
  await assertEstimateDraftDeletable(trx, context, row, job);
  const { parent } = await readEstimateParentInTransaction(
    trx,
    context,
    row.parentType,
    (row.parentType === "lead" ? row.leadId : row.jobId)!,
  );
  const parentRow = await trx(parent.type === "lead" ? "leads" : "jobs")
    .where({ workspaceId: context.workspaceId, id: parent.id })
    .first("version");
  if (!parentRow) throw new AuthorizationAccessError();
  return {
    estimate: {
      id: row.id,
      version: row.version,
      number: numberLabel(row.estimateNumber),
      revision: row.revision,
    },
    review: {
      name: row.name,
      recipientName: row.recipientName,
      parent: {
        type: parent.type,
        id: parent.id,
        version: Number(parentRow.version),
        number: parent.number,
        name: parent.name,
      },
    },
  };
}

export async function deleteEstimateDraftInTransaction(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  raw: unknown,
) {
  const input = deleteEstimateDraftSchema.parse(raw);
  if (input.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const { row, job } = await accessibleEstimate(trx, context, input.estimateId, true);
  await assertEstimateDraftDeletable(trx, context, row, job);
  if (row.version !== input.expectedVersion) throw new EstimateDraftConflictError();
  if (input.typedConfirmation !== numberLabel(row.estimateNumber)) {
    throw new EstimateDraftValidationError("Type the estimate number exactly to delete this Draft.");
  }
  await trx("estimate_operation_receipts")
    .where({ workspaceId: context.workspaceId, estimateId: row.id })
    .update({ estimateId: null });
  const [deleted] = await trx("estimates")
    .where({ workspaceId: context.workspaceId, id: row.id, version: input.expectedVersion })
    .delete()
    .returning(["id", "estimateNumber", "revision", "version"]);
  if (!deleted) throw new EstimateDraftConflictError();
  return {
    estimateId: deleted.id as string,
    number: numberLabel(Number(deleted.estimateNumber)),
    revision: Number(deleted.revision),
    version: Number(deleted.version),
  };
}

export async function deleteEstimateDraft(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  raw: unknown,
) {
  const input = deleteEstimateDraftSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const deleted = await deleteEstimateDraftInTransaction(trx, context, input);
    return { id: deleted.estimateId };
  });
}
