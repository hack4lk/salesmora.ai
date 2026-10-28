import { z } from "zod";

export const estimateStatuses = [
  "draft",
  "sent",
  "published",
  "accepted",
  "declined",
  "expired",
  "superseded",
  "void",
] as const;
export const estimateStatusSchema = z.enum(estimateStatuses);
export type EstimateStatus = z.infer<typeof estimateStatusSchema>;
export const estimateParentTypes = ["lead", "job"] as const;
export const estimateSortColumns = [
  "updatedAt",
  "totalCents",
  "validUntil",
  "estimateNumber",
] as const;
export const estimatePageSizes = [25, 50, 100] as const;
export const estimateQuickFilters = ["awaiting", "expiring"] as const;

const ownerFilterSchema = z.union([
  z.literal("all"),
  z.literal("me"),
  z.literal("unassigned"),
  z.uuid(),
]);
export const estimateListQuerySchema = z
  .object({
    workspaceId: z.uuid(),
    q: z.string().trim().max(200).default(""),
    status: z.union([z.literal("all"), estimateStatusSchema]).default("all"),
    owner: ownerFilterSchema.default("all"),
    parent: z.enum(["all", ...estimateParentTypes]).default("all"),
    includeHidden: z.boolean().default(false),
    quickFilter: z.enum(estimateQuickFilters).nullable().default(null),
    sort: z.enum(estimateSortColumns).default("updatedAt"),
    direction: z.enum(["asc", "desc"]).default("desc"),
    page: z.number().int().min(1).max(100_000).default(1),
    pageSize: z.union(estimatePageSizes.map((size) => z.literal(size))).default(25),
  })
  .strict();
export type EstimateListQuery = z.infer<typeof estimateListQuerySchema>;

function valueOr<T extends string>(
  choices: readonly T[],
  value: string | null,
  fallback: T,
): T {
  return value && choices.includes(value as T) ? (value as T) : fallback;
}

function positiveIntegerOr(value: string | null, fallback: number, max: number) {
  if (!value || !/^\d+$/.test(value)) return fallback;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 1 && parsed <= max
    ? parsed
    : fallback;
}

/** Invalid URL filters fall back independently so bookmarked pages remain usable. */
export function estimateListQueryFromURL(
  workspaceId: string,
  params: URLSearchParams,
): EstimateListQuery {
  const rawSearch = params.get("q") ?? "";
  const search = z.string().trim().max(200).safeParse(rawSearch);
  const rawOwner = params.get("owner");
  const owner =
    rawOwner === "me" || rawOwner === "unassigned" || z.uuid().safeParse(rawOwner).success
      ? rawOwner
      : "all";
  const rawQuickFilter = params.get("quickFilter");
  const quickFilter = estimateQuickFilters.includes(rawQuickFilter as (typeof estimateQuickFilters)[number])
    ? (rawQuickFilter as (typeof estimateQuickFilters)[number])
    : null;
  const pageSize = positiveIntegerOr(params.get("size"), 25, 100);
  return estimateListQuerySchema.parse({
    workspaceId,
    q: search.success ? search.data : "",
    status: valueOr(["all", ...estimateStatuses], params.get("status"), "all"),
    owner,
    parent: valueOr(["all", ...estimateParentTypes], params.get("parent"), "all"),
    includeHidden: params.get("includeHidden") === "true",
    quickFilter,
    sort: valueOr(estimateSortColumns, params.get("sort"), "updatedAt"),
    direction: valueOr(["asc", "desc"], params.get("direction"), "desc"),
    page: positiveIntegerOr(params.get("page"), 1, 100_000),
    pageSize: estimatePageSizes.includes(pageSize as (typeof estimatePageSizes)[number])
      ? pageSize
      : 25,
  });
}

export function estimateListQueryToURL(query: EstimateListQuery): string {
  const params = new URLSearchParams({ workspace: query.workspaceId });
  if (query.q) params.set("q", query.q);
  if (query.status !== "all") params.set("status", query.status);
  if (query.owner !== "all") params.set("owner", query.owner);
  if (query.parent !== "all") params.set("parent", query.parent);
  if (query.includeHidden) params.set("includeHidden", "true");
  if (query.quickFilter) params.set("quickFilter", query.quickFilter);
  if (query.sort !== "updatedAt") params.set("sort", query.sort);
  if (query.direction !== "desc") params.set("direction", query.direction);
  if (query.page !== 1) params.set("page", String(query.page));
  if (query.pageSize !== 25) params.set("size", String(query.pageSize));
  return params.toString();
}

export const estimateExportColumns = [
  "number",
  "revision",
  "name",
  "status",
  "customer",
  "parentType",
  "parentId",
  "owner",
  "total",
  "sentAt",
  "validUntil",
  "decidedAt",
  "decisionChannel",
] as const;
export type EstimateExportColumn = (typeof estimateExportColumns)[number];

export const estimateExportRequestSchema = z.object({
  query: estimateListQuerySchema,
  columns: z.array(z.enum(estimateExportColumns))
    .min(1)
    .max(estimateExportColumns.length)
    .refine((columns) => new Set(columns).size === columns.length),
}).strict();
export type EstimateExportRequest = z.infer<typeof estimateExportRequestSchema>;

export const estimateExportPreviewSchema = z.object({
  count: z.number().int().min(0),
  scope: z.enum(["workspace", "assigned_job"]),
  rowLimit: z.number().int().min(1).max(1_000_000),
}).strict();
export type EstimateExportPreview = z.infer<typeof estimateExportPreviewSchema>;

export type EstimateListRow = {
  id: string;
  number: string;
  estimateNumber: number;
  revision: number;
  name: string;
  customerName: string;
  service: string;
  status: EstimateStatus;
  totalCents: number | null;
  parentType: (typeof estimateParentTypes)[number];
  parentId: string;
  parentNumber: string;
  ownerId: string | null;
  ownerName: string | null;
  validUntil: string | null;
  updatedAt: string;
  decidedAt: string | null;
  archived: boolean;
  version: number;
  canDuplicate: boolean;
  canRevise: boolean;
  canDelete: boolean;
};

export type EstimateListMetrics = {
  awaitingCount: number;
  openValueCents: string;
  acceptedThisMonthCount: number;
  acceptedThisMonthCents: string;
  expiringInSevenDaysCount: number;
};

export type EstimateListResult = {
  rows: EstimateListRow[];
  total: number;
  scopeTotal: number;
  page: number;
  pageSize: number;
  timezone: string;
  scope: "workspace" | "assigned_job";
  policyRevision: number;
  canCreate: boolean;
  canExport: boolean;
  canVoid: boolean;
  canArchive: boolean;
  owners: { id: string; name: string; openEstimateCount: number }[];
  metrics: EstimateListMetrics;
};

export const estimateIdSchema = z.uuid();

export const estimateBusinessProfileSchema = z.object({
  name: z.string().trim().max(200),
  address: z.string().trim().max(500),
  phone: z.string().trim().max(100),
  email: z.string().trim().max(254).refine(
    (value) => value === "" || z.email().safeParse(value).success,
  ),
  licenseLine: z.string().trim().max(200),
  logoPath: z.string().max(600).nullable(),
  requireServiceAddress: z.boolean(),
  validForDays: z.string().trim().regex(/^\d{1,3}$/),
  taxRate: z.string().trim().max(30),
  deposit: z.discriminatedUnion("type", [
    z.object({ type: z.literal("none") }).strict(),
    z.object({
      type: z.enum(["percent", "amount"]),
      value: z.string().trim().max(30),
    }).strict(),
  ]),
  paymentPresets: z.array(z.object({
    id: z.string().trim().min(1).max(128),
    label: z.string().trim().min(1).max(80),
    text: z.string().trim().min(1).max(500),
  }).strict()).max(10),
  message: z.string().max(2000),
  termsNote: z.string().max(5000),
}).strict().superRefine((profile, context) => {
  if (Number(profile.validForDays) < 1 || Number(profile.validForDays) > 365) {
    context.addIssue({ code: "custom", path: ["validForDays"], message: "Invalid validity period." });
  }
  if (new Set(profile.paymentPresets.map(({ id }) => id)).size !== profile.paymentPresets.length) {
    context.addIssue({ code: "custom", path: ["paymentPresets"], message: "Payment preset IDs must be unique." });
  }
});

export const saveEstimateBusinessProfileSchema = z.object({
  workspaceId: z.uuid(),
  expectedVersion: z.number().int().positive(),
  profile: estimateBusinessProfileSchema,
}).strict();
export const estimateBusinessProfileRecordSchema = z.object({
  workspaceId: z.uuid(),
  version: z.number().int().positive(),
  numberPrefix: z.string(),
  nextNumber: z.number().int().positive(),
  profile: estimateBusinessProfileSchema,
}).strict();
export const estimateBusinessProfileReadSchema = z.object({
  record: estimateBusinessProfileRecordSchema,
  canManage: z.boolean(),
  role: z.enum(["owner", "admin", "office", "field"]),
}).strict();

export const estimateAdjustmentSchema = z.union([
  z.object({ type: z.literal("none") }).strict(),
  z.object({
    type: z.enum(["percent", "amount"]),
    value: z.string().trim().max(30),
  }).strict(),
]);

export const estimatePaymentLinkSchema = z.string().max(2048).refine(value => {
  if (value === "") return true;
  if (!/^https:\/\//i.test(value) || /[\s\\\u0000-\u001f\u007f]/.test(value) || !URL.canParse(value)) return false;
  const url = new URL(value);
  return !!url.hostname && !url.username && !url.password;
}, "Enter a complete HTTPS payment link without credentials or whitespace.");

export const estimateDraftValuesSchema = z.object({
  details: z.object({
    name: z.string().trim().min(1).max(120),
    recipientName: z.string().trim().max(200),
    recipientEmail: z.string().trim().max(254).refine(
      (value) => value === "" || z.email().safeParse(value).success,
    ),
    serviceAddress: z.string().trim().max(500),
    ownerId: z.string().trim().max(200),
  }).strict(),
  items: z.array(z.object({
    description: z.string().trim().min(1).max(200),
    quantity: z.string().trim().min(1).max(30),
    unitPrice: z.string().trim().max(30),
    taxable: z.boolean(),
    included: z.boolean(),
    unit: z.string().trim().max(100).optional(),
    catalog: z.object({
      id: z.uuid(),
      name: z.string().trim().min(1).max(200),
      unit: z.string().trim().min(1).max(20),
      sku: z.string().trim().max(80),
    }).strict().optional(),
  }).strict()).max(100),
  totals: z.object({
    discount: estimateAdjustmentSchema,
    taxRate: z.string().trim().max(30),
  }).strict(),
  terms: z.object({
    message: z.string().trim().max(2000),
    validUntil: z.union([z.literal(""), z.iso.date()]),
    paymentTerms: z.string().trim().max(500),
    termsNote: z.string().trim().max(5000),
    deposit: estimateAdjustmentSchema,
  }).strict(),
  scope: z.string().trim().max(5000),
  internalNotes: z.string().trim().max(5000),
  paymentLink: estimatePaymentLinkSchema.optional(),
}).strict();
export type EstimateDraftValues = z.infer<typeof estimateDraftValuesSchema>;

export const createEstimateDraftSchema = z.object({
  workspaceId: z.uuid(),
  submissionId: z.uuid(),
  parentType: z.enum(estimateParentTypes),
  parentId: z.uuid(),
  customerId: z.uuid().optional(),
  values: estimateDraftValuesSchema,
}).strict();
export type CreateEstimateDraftInput = z.infer<typeof createEstimateDraftSchema>;

export const updateEstimateDraftSchema = z.object({
  workspaceId: z.uuid(),
  estimateId: z.uuid(),
  expectedVersion: z.number().int().positive(),
  values: estimateDraftValuesSchema,
}).strict();
export type UpdateEstimateDraftInput = z.infer<typeof updateEstimateDraftSchema>;

export const duplicateEstimateSchema = z.object({
  workspaceId: z.uuid(),
  estimateId: z.uuid(),
  submissionId: z.uuid(),
  expectedVersion: z.number().int().positive(),
}).strict();
export type DuplicateEstimateInput = z.infer<typeof duplicateEstimateSchema>;

export const deleteEstimateDraftSchema = z.object({
  workspaceId: z.uuid(),
  estimateId: z.uuid(),
  expectedVersion: z.number().int().positive(),
  typedConfirmation: z.string().min(1).max(40),
}).strict();
export type DeleteEstimateDraftInput = z.infer<typeof deleteEstimateDraftSchema>;

export { ZodError as EstimateContractError } from "zod";
