import { z } from "zod";
import { estimateAdjustmentSchema, estimateDraftValuesSchema } from "./estimate";

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const adjustment = estimateAdjustmentSchema;
const contentFields = {
  name: z.string().max(120),
  scope: z.string().max(5000),
  message: z.string().max(2000),
  paymentTerms: z.string().max(500),
  termsNote: z.string().max(5000),
  validUntil: z.union([z.literal(""), z.iso.date().refine(value => !value.startsWith("0000"))]),
  discount: adjustment,
  taxRate: z.string().max(30),
  deposit: adjustment,
};
const source = z.discriminatedUnion("type", [
  z.object({ type: z.enum(["missing", "user", "saved"]) }).strict(),
  z.object({ type: z.literal("catalog"), name: z.string().min(1).max(200) }).strict(),
]);
export const estimateDraftChatLineSchema = z.object({
  id: z.string().min(1).max(100).refine(value => !!value.trim()),
  description: z.string().max(200),
  quantity: z.string().max(30),
  unitPrice: z.string().max(30),
  unit: z.string().max(100),
  taxable: z.boolean(),
  included: z.boolean(),
  priceSource: source,
  catalog: z.object({ id: z.uuid(), name: z.string().max(200), unit: z.string().max(100), sku: z.string().max(100) }).strict().optional(),
}).strict();
export const estimateDraftChatContentSchema = z.object({
  ...contentFields,
  items: z.array(estimateDraftChatLineSchema).max(100),
}).strict().superRefine((value, context) => {
  if (new Set(value.items.map(item => item.id)).size !== value.items.length) {
    context.addIssue({ code: "custom", message: "Draft line identities must be unique." });
  }
});
export type EstimateDraftChatContent = z.infer<typeof estimateDraftChatContentSchema>;

const modelLine = z.object({
  savedLineId: z.string().max(100).nullable(),
  description: z.string().max(200),
  quantity: z.string().max(30),
  unit: z.string().max(100),
  taxable: z.boolean(),
  included: z.boolean(),
  unitPrice: z.string().max(30).nullable(),
  priceSource: z.enum(["missing", "user", "catalog", "saved"]),
  priceQuote: z.string().max(50).nullable(),
  catalogRef: z.string().max(200).nullable(),
}).strict();
export const estimateDraftChatPatchSchema = z.object({
  name: contentFields.name.nullable(),
  scope: contentFields.scope.nullable(),
  message: contentFields.message.nullable(),
  paymentTerms: contentFields.paymentTerms.nullable(),
  termsNote: contentFields.termsNote.nullable(),
  validUntil: contentFields.validUntil.nullable(),
  discount: contentFields.discount.nullable(),
  taxRate: contentFields.taxRate.nullable(),
  deposit: contentFields.deposit.nullable(),
  items: z.array(modelLine).max(100).nullable(),
}).strict();
export const estimateDraftChatProposeSchema = z.object({
  request: z.object({
    operation: z.enum(["create", "update"]),
    parentType: z.enum(["lead", "job"]).nullable(),
    parentRef: z.string().max(80).nullable(),
    estimateRef: z.string().max(80).nullable(),
    changes: estimateDraftChatPatchSchema,
  }).strict(),
}).strict();
export type EstimateDraftChatInput = z.infer<typeof estimateDraftChatProposeSchema>["request"];
export const estimateDraftChatToolParameters = z.toJSONSchema(estimateDraftChatProposeSchema);

const parent = z.object({
  type: z.enum(["lead", "job"]), id: z.uuid(), number: z.string().max(80), name: z.string().max(200),
  version: z.number().int().positive(),
}).strict();
const base = {
  id: z.uuid(), inputHash: hash, authorizationVersion: hash,
  createdAt: z.iso.datetime(), expiresAt: z.iso.datetime(),
  state: z.enum(["pending", "confirmed", "cancelled", "expired", "superseded", "conflict", "forbidden"]),
  parent, proposed: estimateDraftChatContentSchema,
};
export const estimateDraftChatProposalSchema = z.discriminatedUnion("actionType", [
  z.object({ ...base, actionType: z.literal("estimate.create") }).strict(),
  z.object({
    ...base, actionType: z.literal("estimate.update"),
    estimate: z.object({
      id: z.uuid(), number: z.string().regex(/^EST-\d{4,}$/), revision: z.number().int().positive(),
      expectedVersion: z.number().int().positive(),
    }).strict(),
    current: estimateDraftChatContentSchema,
  }).strict(),
]).superRefine((value, context) => {
  const duration = Date.parse(value.expiresAt) - Date.parse(value.createdAt);
  if (duration <= 0 || duration > 900000) context.addIssue({ code: "custom", message: "Proposal lifetime must not exceed 15 minutes." });
});
export const estimateDraftChatRequestSchema = z.object({
  proposalId: z.uuid(), inputHash: hash, authorizationVersion: hash,
  actionType: z.enum(["estimate.create", "estimate.update"]),
  parentType: z.enum(["lead", "job"]), parentId: z.uuid(), parentVersion: z.number().int().positive(),
  estimateId: z.uuid().nullable(), expectedVersion: z.number().int().positive().nullable(),
}).strict().superRefine((value, context) => {
  if (value.actionType === "estimate.create"
    ? value.estimateId !== null || value.expectedVersion !== null
    : value.estimateId === null || value.expectedVersion === null) {
    context.addIssue({ code: "custom", message: "Draft request target must match its create or update action." });
  }
});
export const estimateDraftChatDecisionSchema = estimateDraftChatRequestSchema.safeExtend({
  workspaceId: z.uuid(), decision: z.enum(["confirm", "cancel", "editor", "open"]),
});
export const estimateDraftChatRefreshSchema = z.object({
  workspaceId: z.uuid(), request: estimateDraftChatRequestSchema,
  content: estimateDraftChatContentSchema,
}).strict();
export const estimateDraftChatViewSchema = z.object({
  draft: estimateDraftChatProposalSchema,
  context: z.object({
    proposalId: z.uuid(), inputHash: hash, authorizationVersion: hash,
    parent: parent.pick({ id: true, type: true, version: true }),
    estimate: z.object({
      id: z.uuid(), version: z.number().int().positive(), status: z.literal("draft"), archived: z.literal(false),
    }).strict().nullable(),
  }).strict(),
  grants: z.object({ read: z.boolean(), parentAccess: z.boolean(), create: z.boolean(), update: z.boolean() }).strict(),
  canConfirm: z.boolean(),
  receipt: z.object({
    id: z.uuid(), number: z.string().regex(/^EST-\d{4,}$/), revision: z.number().int().positive(),
    version: z.number().int().positive(), updatedAt: z.iso.datetime(),
  }).strict().nullable(),
}).strict().superRefine((value, context) => {
  const draft = value.draft, binding = value.context;
  if (draft.id !== binding.proposalId || draft.inputHash !== binding.inputHash ||
      draft.authorizationVersion !== binding.authorizationVersion ||
      draft.parent.type !== binding.parent.type || draft.parent.id !== binding.parent.id ||
      draft.parent.version !== binding.parent.version ||
      (draft.actionType === "estimate.create" ? binding.estimate !== null
        : draft.estimate.id !== binding.estimate?.id || draft.estimate.expectedVersion !== binding.estimate?.version) ||
      (value.receipt !== null && draft.state !== "confirmed") ||
      (draft.state === "confirmed" && value.receipt === null)) {
    context.addIssue({ code: "custom", message: "Draft view identity, context and receipt must agree." });
  }
  if (JSON.stringify(value).length > 55000) context.addIssue({
    code: "custom", message: "This proposal is too large for a complete review. Use the manual editor.",
  });
});
export type EstimateDraftChatView = z.infer<typeof estimateDraftChatViewSchema>;
export const estimateDraftChatStoredSchema = z.object({
  view: estimateDraftChatViewSchema,
  values: estimateDraftValuesSchema,
  stamp: z.string().regex(/^[a-f0-9]{32}$/),
  catalogStamp: hash,
  resultStamp: z.string().regex(/^[a-f0-9]{32}$/).optional(),
}).strict();
export type EstimateDraftChatStored = z.infer<typeof estimateDraftChatStoredSchema>;
export const estimateDraftChatResponseSchema = z.object({
  view: estimateDraftChatViewSchema,
  href: z.string().regex(/^\/estimates(?:\/new|\/[0-9a-f-]{36})?\?workspace=[0-9a-f-]{36}(?:&proposal=[0-9a-f-]{36})?$/).optional(),
}).strict();
