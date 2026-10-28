import { z } from "zod";
import { estimateAdjustmentSchema, estimatePaymentLinkSchema } from "./estimate";
import { estimateRevisionSharingSchema } from "./estimate-revision";

export const estimatePaperContentSchema = z.object({
  number: z.string().max(80),
  revision: z.number().int().positive(),
  name: z.string().max(120),
  business: z.object({
    name: z.string().max(200),
    address: z.string().max(500),
    phone: z.string().max(100),
    email: z.string().max(254),
    licenseLine: z.string().max(200),
    logoPath: z.string().refine(value => {
      const prefix = "/api/settings/estimates/logo/";
      return value.startsWith(prefix) && z.uuid().safeParse(value.slice(prefix.length)).success;
    }).nullable(),
    requireServiceAddress: z.boolean(),
  }).strict(),
  recipientName: z.string().max(200),
  recipientEmail: z.string().max(254),
  serviceAddress: z.string().max(500),
  estimateDate: z.iso.date(),
  validUntil: z.union([z.literal(""), z.iso.date()]),
  preparedBy: z.string().max(200),
  relatedRecord: z.string().max(500),
  scope: z.string().max(5000),
  message: z.string().max(2000),
  paymentTerms: z.string().max(500),
  termsNote: z.string().max(5000),
  items: z.array(z.object({
    description: z.string().max(200),
    quantity: z.string().max(30),
    unitPrice: z.string().max(30),
    taxable: z.boolean(),
    included: z.boolean(),
    unit: z.string().max(100),
  }).strict()).max(100),
  discount: estimateAdjustmentSchema,
  taxRate: z.string().max(30),
  deposit: estimateAdjustmentSchema,
  // Absence must remain absence: adding a default would invalidate existing captured hashes.
  paymentLink: estimatePaymentLinkSchema.optional(),
}).strict();
export type EstimateSnapshotPaperContent = z.infer<typeof estimatePaperContentSchema>;

const cents = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
export const estimatePaperAmountsSchema = z.object({
  lineAmountsCents: z.array(cents).min(1).max(100),
  subtotalCents: cents,
  discountCents: cents,
  taxCents: cents,
  totalCents: cents,
  depositCents: cents,
  balanceCents: cents,
}).strict();
export type EstimateSnapshotAmounts = z.infer<typeof estimatePaperAmountsSchema>;

export const estimateFrozenSnapshotSchema = z.object({
  formatVersion: z.literal(1),
  content: estimatePaperContentSchema,
  amounts: estimatePaperAmountsSchema,
}).strict();
export type EstimateFrozenSnapshot = z.infer<typeof estimateFrozenSnapshotSchema>;

const sharingFields = {
  workspaceId: z.uuid(),
  estimateId: z.uuid(),
  expectedVersion: z.number().int().positive(),
  submissionId: z.uuid(),
  snapshotHash: z.string().regex(/^[0-9a-f]{64}$/),
};
const sendFields = {
  recipientEmail: z.email().max(254),
  subject: z.string().trim().min(1).max(300).refine(value => !/[\r\n]/.test(value)),
};
export const estimateEmailDestinationSchema = z.object(sendFields).strict();
export const shareEstimateSchema = z.discriminatedUnion("mode", [
  z.object({ ...sharingFields, mode: z.literal("publish"), revisionReview: estimateRevisionSharingSchema.optional() }).strict(),
  z.object({ ...sharingFields, ...sendFields, mode: z.literal("send"), revisionReview: estimateRevisionSharingSchema.optional() }).strict(),
  z.object({ ...sharingFields, ...sendFields, mode: z.literal("resend") }).strict(),
]);
export type ShareEstimateInput = z.infer<typeof shareEstimateSchema>;
export const estimateShareTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/);

export const estimateEmailInputSchema = z.object({
  baseURL: z.url(), token: estimateShareTokenSchema,
  subject: z.string().min(1).max(300).refine(value => !/[\r\n]/.test(value)),
  businessName: z.string().min(1).max(200), replyTo: z.email().max(254),
  recipientName: z.string().min(1).max(200), number: z.string().min(1).max(80),
  name: z.string().min(1).max(120), totalCents: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  validUntil: z.iso.date(),
  paymentLink: estimatePaymentLinkSchema.optional(),
});
export type EstimateEmailInput = z.infer<typeof estimateEmailInputSchema>;
