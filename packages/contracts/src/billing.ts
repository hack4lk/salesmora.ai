import { z } from "zod";

export const workspacePlanIds = ["free", "standard", "premium"] as const;
export const workspacePlanIdSchema = z.enum(workspacePlanIds);
export type WorkspacePlanId = z.infer<typeof workspacePlanIdSchema>;

/** Selection is onboarding intent, never proof of payment or an entitlement. */
export const registrationPlanIntentSchema = z
  .object({ plan: workspacePlanIdSchema })
  .strict();
export type RegistrationPlanIntent = z.infer<
  typeof registrationPlanIntentSchema
>;

export interface WorkspacePlanDefinition {
  readonly id: WorkspacePlanId;
  readonly monthlyPriceCents: number;
  readonly currency: "usd";
  readonly limits: {
    readonly teammates: number;
    readonly newLeadsPerMonth: number;
    /** Null represents unlimited concurrent published campaigns. */
    readonly publishedCampaigns: number | null;
    readonly aiTokensPerMonth: number;
    readonly storageBytes: number;
  };
}
export const billingCheckoutRequestSchema = z
  .object({
    workspaceId: z.uuid(),
    action: z.enum(["checkout", "free", "refresh"]),
  })
  .strict();

const nonnegative = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
export const billingInvoiceSchema = z
  .object({
    id: z.string(),
    number: z.string().nullable(),
    createdAt: z.iso.datetime(),
    currency: z.literal("usd"),
    total: z.number().int(),
    amountPaid: nonnegative,
    amountDue: nonnegative,
    status: z
      .enum(["draft", "open", "paid", "uncollectible", "void"])
      .nullable(),
    lines: z.array(
      z.object({ description: z.string(), amount: z.number().int() }),
    ),
  })
  .strict();
export const planChangeQuoteSchema = z
  .object({
    id: z.uuid(),
    plan: workspacePlanIdSchema,
    kind: z.enum(["checkout", "upgrade", "downgrade", "free"]),
    amountDue: nonnegative,
    currency: z.literal("usd"),
    effectiveAt: z.iso.datetime(),
    expiresAt: z.iso.datetime(),
  })
  .strict();
export type PlanChangeQuote = z.infer<typeof planChangeQuoteSchema>;
/** Browser-safe DTO: no provider secrets, customer IDs or card details beyond the summary. */
export const workspaceBillingSnapshotSchema = z
  .object({
    plan: workspacePlanIdSchema,
    status: z.string(),
    cancelAtPeriodEnd: z.boolean(),
    paidThrough: z.iso.datetime().nullable(),
    recoveryUntil: z.iso.datetime().nullable(),
    transitionUntil: z.iso.datetime().nullable(),
    change: planChangeQuoteSchema
      .extend({ status: z.enum(["applying", "payment", "scheduled"]) })
      .nullable()
      .optional(),
    resetAt: z.iso.datetime(),
    usage: z
      .object({
        teammates: nonnegative,
        newLeads: nonnegative,
        aiTokens: z.string().regex(/^\d+$/),
        monthlyAITokens: nonnegative,
      })
      .strict(),
    payment: z
      .object({
        brand: z.string(),
        last4: z.string().regex(/^\d{4}$/),
        expMonth: z.number().int().min(1).max(12),
        expYear: z.number().int(),
      })
      .strict()
      .nullable(),
    billingEmail: z.string().nullable(),
    providerAvailable: z.boolean(),
    invoices: z.array(billingInvoiceSchema),
    hasMoreInvoices: z.boolean(),
  })
  .strict();
export type WorkspaceBillingSnapshot = z.infer<
  typeof workspaceBillingSnapshotSchema
>;
export const planChangeRequestSchema = z.discriminatedUnion("action", [
  z
    .object({
      workspaceId: z.uuid(),
      action: z.literal("preview"),
      plan: workspacePlanIdSchema,
    })
    .strict(),
  z
    .object({
      workspaceId: z.uuid(),
      action: z.enum(["confirm", "refresh", "undo"]),
      quoteId: z.uuid(),
    })
    .strict(),
]);
export const planChangeResultSchema = z
  .object({
    status: z.enum(["complete", "scheduled", "payment", "expired"]),
    clientSecret: z.string().optional(),
    paymentUI: z.enum(["checkout", "card"]).optional(),
  })
  .strict();
export type PlanChangeResult = z.infer<typeof planChangeResultSchema>;

export const billingInvoiceHistoryRequestSchema = z.object({
  workspace:z.uuid(),after:z.string().regex(/^in_[a-zA-Z0-9]+$/).max(100).optional(),
}).strict();
export const billingInvoiceHistorySchema = z.object({
  invoices:z.array(billingInvoiceSchema).max(12),hasMore:z.boolean(),nextCursor:z.string().nullable(),
}).strict().refine(value=>value.hasMore===!!value.nextCursor&&(!value.hasMore||value.invoices.at(-1)?.id===value.nextCursor));
export type BillingInvoiceHistory = z.infer<typeof billingInvoiceHistorySchema>;
