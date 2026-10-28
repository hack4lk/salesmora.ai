import { z } from "zod";
import { estimateAdjustmentSchema, estimateListQuerySchema, estimateStatuses } from "./estimate";

export const estimateChatEstimateRefSchema = z.union([
  z.uuid(),
  z.string().max(64).regex(/^EST-\d{4,}$/i),
]);
const estimateRefInput = z.object({ estimateRef: estimateChatEstimateRefSchema }).strict();
const nullableText = (max: number) =>
  z.string().trim().min(1).max(max).nullable();
const dateOnly = z.iso.date().nullable();

export const estimateChatAgingInputSchema = z.object({
  waitingDays: z.number().int().min(1).max(365),
  expiringWithinDays: z.number().int().min(0).max(365),
  limit: z.number().int().min(1).max(20),
}).strict();

export const estimateChatListLinkFiltersSchema = z.object({
  query: z.string().trim().max(200),
  status: z.enum(["all", ...estimateStatuses]),
  owner: z.union([z.enum(["all", "me", "unassigned"]), z.uuid()]),
  parent: z.enum(["all", "lead", "job"]),
  includeHidden: z.boolean(),
}).strict();
export const estimateChatExportFiltersSchema =
  estimateChatListLinkFiltersSchema.extend({
    quickFilter: z.enum(["awaiting", "expiring"]).nullable(),
  }).strict();
export type EstimateChatExportFilters = z.infer<
  typeof estimateChatExportFiltersSchema
>;

export const estimateChatFilterObjectSchema = z
  .object({
    query: z.string().trim().max(200),
    status: z.enum(["all", ...estimateStatuses]),
    owner: z.union([z.enum(["all", "me", "unassigned"]), z.uuid()]),
    parent: z.enum(["all", "lead", "job"]),
    customer: nullableText(200),
    minTotalCents: z
      .number()
      .int()
      .nonnegative()
      .max(Number.MAX_SAFE_INTEGER)
      .nullable(),
    maxTotalCents: z
      .number()
      .int()
      .nonnegative()
      .max(Number.MAX_SAFE_INTEGER)
      .nullable(),
    validUntilFrom: dateOnly,
    validUntilTo: dateOnly,
    includeHidden: z.boolean(),
    quickFilter: z.enum(["awaiting", "expiring"]).nullable(),
    limit: z.number().int().min(1).max(20),
  }).strict();

export const estimateChatFilterSchema = estimateChatFilterObjectSchema
  .extend({
    quickFilter: estimateChatFilterObjectSchema.shape.quickFilter.default(null),
  })
  .refine(
    (filters) =>
      filters.minTotalCents === null ||
      filters.maxTotalCents === null ||
      filters.minTotalCents <= filters.maxTotalCents,
    { message: "Minimum total must not exceed maximum total." },
  )
  .refine(
    (filters) =>
      filters.validUntilFrom === null ||
      filters.validUntilTo === null ||
      filters.validUntilFrom <= filters.validUntilTo,
    { message: "The valid-until date range is invalid." },
  );

export const estimateChatQueryOperations = {
  search: z.object({
    operation: z.literal("search"),
    input: estimateChatFilterSchema,
  }).strict(),
  list: z.object({
    operation: z.literal("list"),
    input: z.object({ useCurrentFilters: z.boolean() }).strict(),
  }).strict(),
  get: z.object({
    operation: z.literal("get"),
    input: estimateRefInput,
  }).strict(),
  aging: z.object({
    operation: z.literal("aging"),
    input: estimateChatAgingInputSchema,
  }).strict(),
  explain_totals: z.object({
    operation: z.literal("explain_totals"),
    input: estimateRefInput,
  }).strict(),
  compare_revisions: z.object({
    operation: z.literal("compare_revisions"),
    input: estimateRefInput,
  }).strict(),
  summarize_scope: z.object({
    operation: z.literal("summarize_scope"),
    input: estimateRefInput,
  }).strict(),
  open_in_list: z.object({
    operation: z.literal("open_in_list"),
    input: z.object({
      filters: estimateChatListLinkFiltersSchema,
    }).strict(),
  }).strict(),
} as const;

export type EstimateChatQueryOperation =
  keyof typeof estimateChatQueryOperations;
export type EstimateChatFilters = z.infer<typeof estimateChatFilterSchema>;
export const estimateChatQuerySchema = z.object({
  request: z.discriminatedUnion(
    "operation",
    [
      estimateChatQueryOperations.search,
      estimateChatQueryOperations.list,
      estimateChatQueryOperations.get,
      estimateChatQueryOperations.aging,
      estimateChatQueryOperations.explain_totals,
      estimateChatQueryOperations.compare_revisions,
      estimateChatQueryOperations.summarize_scope,
      estimateChatQueryOperations.open_in_list,
    ],
  ),
}).strict();

export const estimateChatQueryDescription: Record<
  EstimateChatQueryOperation,
  string
> = {
  search:
    "Search authorized estimates by explicit filters. Counts and amounts are server-computed.",
  list:
    "List estimates. Use stored current-page filters only when explicitly requested and on the Estimates list.",
  get:
    "Read one estimate by an exact estimate UUID or EST-number; never guess a target.",
  aging:
    "Find authorized Sent estimates waiting beyond a requested age, estimates expiring within a requested window, and Accepted Lead estimates without a linked Job.",
  explain_totals:
    "Explain one estimate's line amounts, subtotal, discount, tax, deposit and balance using its saved or frozen amounts.",
  compare_revisions:
    "Compare the two most recent accessible revisions of one estimate, including changed fields and totals.",
  summarize_scope:
    "Summarize the authorized parent Lead or Job context for one estimate without exposing contact or private editor details.",
  open_in_list:
    "Return a canonical Estimates-list link using validated filters supported by the list page.",
};

export function estimateChatToolParameters(
  operations: readonly EstimateChatQueryOperation[],
) {
  const branches = [...new Set(operations)]
    .filter((operation) => Object.hasOwn(estimateChatQueryOperations, operation))
    .map((operation) =>
      operation === "search"
        ? z
            .object({
              operation: z.literal("search"),
              input: estimateChatFilterObjectSchema,
            })
            .strict()
        : estimateChatQueryOperations[operation],
    );
  if (!branches.length) throw new Error("No authorized Estimate query operation.");
  const request =
    branches.length === 1
      ? branches[0]
      : z.union([branches[0], branches[1], ...branches.slice(2)]);
  const schema = z.toJSONSchema(z.object({ request }).strict(), {
    io: "input",
    target: "draft-7",
  });
  delete schema.$schema;
  return schema;
}

const money = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
export const estimateChatSummarySchema = z.object({
  id: z.uuid(),
  queryLabel: z.string().min(1).max(300),
  scope: z.enum(["workspace", "assigned"]),
  filterLabels: z.array(z.string().min(1).max(500)).max(20),
  dateRange: z.object({ from: z.iso.date(), to: z.iso.date() }).strict().nullable(),
  retrievedAt: z.iso.datetime(),
  timezone: z.string().min(1).max(100),
  totalMatches: money,
  totalCents: money.nullable(),
  rows: z.array(z.object({
    id: z.uuid(),
    number: z.string().regex(/^EST-\d{4,}$/),
    revision: z.number().int().positive(),
    name: z.string().min(1).max(120),
    customerName: z.string().max(200),
    status: z.enum(estimateStatuses),
    archived: z.boolean(),
    totalCents: money.nullable(),
    parentType: z.enum(["lead", "job"]),
    parentId: z.uuid(),
    parentNumber: z.string().min(1).max(80),
    validUntil: z.iso.date().nullable(),
  }).strict()).max(10),
  canOpenList: z.boolean(),
  canReviewExport: z.boolean().default(false),
}).strict().superRefine((value, context) => {
  if (value.rows.length > value.totalMatches ||
      new Set(value.rows.map(row => row.id)).size !== value.rows.length) {
    context.addIssue({ code: "custom", message: "Estimate rows do not match the result count." });
  }
  if (value.dateRange && value.dateRange.from > value.dateRange.to) {
    context.addIssue({ code: "custom", message: "Estimate result date range is invalid." });
  }
});
export const estimateChatSummaryResultSchema = z.object({
  turnId: z.uuid(),
  operation: z.enum(["search", "list", "aging", "open_in_list", "export"]),
  summaries: z.array(estimateChatSummarySchema).min(1).max(3),
}).strict().superRefine((value, context) => {
  if (value.summaries.length !== (value.operation === "aging" ? 3 : 1) ||
      new Set(value.summaries.map(summary => summary.id)).size !== value.summaries.length) {
    context.addIssue({ code: "custom", message: "Estimate summary groups do not match the operation." });
  }
  if (JSON.stringify(value).length > 60000) {
    context.addIssue({ code: "custom", message: "Estimate summary exceeds the streaming payload limit." });
  }
});

const readOperation = z.enum(["get", "explain_totals", "compare_revisions", "summarize_scope"]);
const identity = z.object({
  id: z.uuid(),
  number: z.string().regex(/^EST-\d{4,}$/),
  revision: z.number().int().positive(),
  name: z.string().max(120),
  status: z.enum(estimateStatuses),
  archived: z.boolean(),
}).strict();
const textExcerpt = z.object({
  text: z.string().max(5000),
  truncated: z.boolean(),
}).strict();
const amountSource = z.enum(["current_draft", "frozen_snapshot"]);
const lineItem = z.object({
  position: z.number().int().min(1).max(100),
  description: z.string().max(200),
  quantity: z.string().max(30),
  unitPriceCents: money.nullable(),
  unit: z.string().max(100).nullable(),
  taxable: z.boolean(),
  included: z.boolean(),
  amountCents: money.nullable(),
  invalidFields: z.array(z.enum(["description", "quantity", "unitPrice", "amount"])).max(4),
}).strict();
export const estimateChatPricingSchema = z.object({
  source: amountSource,
  lineItems: z.array(lineItem).max(100),
  lineItemCount: z.number().int().min(0).max(100),
  adjustments: z.object({
    discount: estimateAdjustmentSchema,
    taxRate: z.string().max(30),
    deposit: estimateAdjustmentSchema,
  }).strict(),
  issues: z.array(z.enum(["items", "discount", "taxRate", "deposit"])).max(4),
  totals: z.object({
    subtotalCents: money.nullable(),
    discountCents: money.nullable(),
    taxableDiscountCents: money.nullable(),
    nonTaxableDiscountCents: money.nullable(),
    taxableAfterDiscountCents: money.nullable(),
    taxRateMilliPercent: money.nullable(),
    taxCents: money.nullable(),
    totalCents: money.nullable(),
    depositCents: money.nullable(),
    balanceCents: money.nullable(),
  }).strict(),
}).strict().superRefine((value, context) => {
  if (value.lineItems.length > value.lineItemCount ||
      value.lineItems.some((item, index) => item.position !== index + 1)) {
    context.addIssue({ code: "custom", message: "Estimate line window is inconsistent." });
  }
});
const delivery = z.object({
  email: z.object({
    state: z.enum(["not-sent", "queued", "sent", "failed", "bounced"]),
    updatedAt: z.iso.datetime().nullable(),
    attemptCount: money,
  }).strict(),
  link: z.object({
    state: z.enum(["not-created", "active", "expired", "revoked", "replaced", "unavailable"]),
    expiresAt: z.iso.datetime().nullable(),
    firstViewedAt: z.iso.datetime().nullable(),
  }).strict(),
}).strict();
const recentEvent = z.object({
  at: z.iso.datetime(),
  kind: z.enum([
    "sent", "published", "delivery-queued", "delivery-sent", "delivery-failed",
    "delivery-bounced", "viewed", "decision-recorded", "decision-corrected",
    "expired", "voided", "superseded", "converted",
  ]),
  decisionDate: z.iso.date().optional(),
  channel: z.enum(["email", "phone", "in-person", "other"]).optional(),
}).strict();
const cardBase = {
  id: z.uuid(),
  retrievedAt: z.iso.datetime(),
  timezone: z.string().min(1).max(100),
  scope: z.enum(["workspace", "assigned"]),
};
const revision = z.object({
  estimate: identity,
  source: amountSource,
  totalCents: money.nullable(),
}).strict();
const lineChange = z.object({
  position: z.number().int().min(1).max(100),
  before: lineItem.nullable(),
  after: lineItem.nullable(),
}).strict().refine(value =>
  (value.before !== null || value.after !== null) &&
  (value.before === null || value.before.position === value.position) &&
  (value.after === null || value.after.position === value.position),
"A changed line needs matching before or after positions.");
export const estimateChatReadCardSchema = z.discriminatedUnion("kind", [
  z.object({
    ...cardBase, kind: z.literal("get"), estimate: identity,
    parentNumber: z.string().max(80),
    validUntil: z.iso.date().nullable(),
    pricing: estimateChatPricingSchema, delivery,
    history: z.object({
      events: z.array(recentEvent).max(25),
      hasMore: z.boolean(),
    }).strict(),
  }).strict(),
  z.object({
    ...cardBase, kind: z.literal("explain_totals"), estimate: identity,
    pricing: estimateChatPricingSchema,
  }).strict(),
  z.object({
    ...cardBase, kind: z.literal("compare_revisions"), estimate: identity,
    comparison: z.object({
      from: revision, to: revision,
      totalDifferenceCents: z.number().int().min(-Number.MAX_SAFE_INTEGER).max(Number.MAX_SAFE_INTEGER).nullable(),
      fields: z.array(z.object({
        field: z.enum(["name", "scope", "discount", "taxRate", "deposit", "validUntil"]),
        before: textExcerpt, after: textExcerpt,
      }).strict()).max(6),
      lineItemChanges: z.array(lineChange).max(100),
      lineItemChangeCount: z.number().int().min(0).max(100),
    }).strict().superRefine((value, context) => {
      const expected = value.from.totalCents === null || value.to.totalCents === null
        ? null : value.to.totalCents - value.from.totalCents;
      if (value.totalDifferenceCents !== expected ||
          value.from.estimate.revision >= value.to.estimate.revision ||
          value.from.estimate.number !== value.to.estimate.number ||
          value.from.estimate.id === value.to.estimate.id ||
          value.lineItemChanges.length > value.lineItemChangeCount ||
          value.lineItemChanges.some((change, index) =>
            index > 0 && change.position <= value.lineItemChanges[index - 1].position) ||
          new Set(value.fields.map(field => field.field)).size !== value.fields.length) {
        context.addIssue({ code: "custom", message: "Estimate revision comparison is inconsistent." });
      }
    }).nullable(),
  }).strict(),
  z.object({
    ...cardBase, kind: z.literal("summarize_scope"), estimate: identity,
    source: amountSource,
    estimateScope: textExcerpt,
    parent: z.object({
      type: z.enum(["lead", "job"]), number: z.string().max(80),
      name: z.string().max(200), status: z.string().max(80),
      service: textExcerpt, customer: z.string().max(200).nullable(),
    }).strict().nullable(),
  }).strict(),
  z.object({
    ...cardBase, kind: z.literal("unavailable"),
    operation: readOperation,
    estimate: z.null(),
  }).strict(),
]);
export type EstimateChatReadCard = z.infer<typeof estimateChatReadCardSchema>;
const readResult = z.object({
  turnId: z.uuid(),
  operation: readOperation,
  summaries: z.array(estimateChatSummarySchema).length(0),
  detail: estimateChatReadCardSchema,
}).strict().superRefine((value, context) => {
  if (value.operation !== (value.detail.kind === "unavailable" ? value.detail.operation : value.detail.kind)) {
    context.addIssue({ code: "custom", message: "Estimate card does not match its read operation." });
  }
  if (value.detail.kind === "compare_revisions" && value.detail.comparison &&
      JSON.stringify(value.detail.estimate) !== JSON.stringify(value.detail.comparison.to.estimate)) {
    context.addIssue({ code: "custom", message: "Estimate comparison identity does not match its latest revision." });
  }
  if (JSON.stringify(value).length > 60000) {
    context.addIssue({ code: "custom", message: "Estimate read exceeds the streaming payload limit." });
  }
});
export const estimateChatResultSchema = z.union([
  estimateChatSummaryResultSchema.safeExtend({ detail: z.never().optional() }),
  readResult,
]);
export type EstimateChatResult = z.infer<typeof estimateChatResultSchema>;

export const estimateChatSnapshotSchema = z.object({
  result: estimateChatResultSchema,
  lists: z.array(z.object({
    resultId: z.uuid(),
    query: estimateListQuerySchema,
    destination: z.enum(["list", "export"]).default("list"),
  }).strict()).max(3),
}).strict().superRefine((value, context) => {
  const ids = value.lists.map(list => list.resultId);
  if (new Set(ids).size !== ids.length ||
      value.result.summaries.some(summary => {
        const destination = value.lists.find(list => list.resultId === summary.id)
          ?.destination;
        return summary.canOpenList !== (destination === "list") ||
          summary.canReviewExport !== (destination === "export") ||
          (summary.canReviewExport && value.result.operation !== "export") ||
          (value.result.operation === "export" && !summary.canReviewExport);
      }) ||
      ids.some(id => !value.result.summaries.some(summary => summary.id === id))) {
    context.addIssue({ code: "custom", message: "Estimate list navigation does not match the saved summaries." });
  }
});
export type EstimateChatSnapshot = z.infer<typeof estimateChatSnapshotSchema>;
export const estimateChatNavigateSchema = z.object({
  workspaceId: z.uuid(),
  turnId: z.uuid(),
  resultId: z.uuid(),
  estimateId: z.uuid().optional(),
  destination: z.enum(["list", "export"]).default("list"),
}).strict().superRefine((value, context) => {
  if (value.destination === "export" && value.estimateId) {
    context.addIssue({
      code: "custom",
      path: ["estimateId"],
      message: "Export review navigation cannot include an Estimate record.",
    });
  }
});
export const estimateChatDestinationSchema = z.object({
  href: z.string().regex(/^\/estimates(?:\/[0-9a-f-]{36})?\?workspace=[0-9a-f-]{36}(?:&[^#\s]*)?$/),
}).strict();
