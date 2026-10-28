import { leadSchema, estimatePaymentLinkSchema } from "@salesmora/contracts";
import { calculateEstimateItems, calculateEstimateTotals, type EstimateAdjustment, type EstimateItemInput, type EstimateTotalsCalculation } from "@salesmora/domain";
import { isEstimateLocalDate } from "../estimate-timestamp";
import { estimatePreviewPaperData as c } from "./estimate-preview-paper.data";

export type EstimatePaperItem = Readonly<EstimateItemInput & { unit: string }>;
/** Customer-facing allowlist only. Never pass staff notes, decisions, history, provider errors or tokens. */
export type EstimatePaperContent = Readonly<{
  number: string; revision: number; name: string;
  business: Readonly<{
    name: string; address: string; phone: string; email: string; licenseLine: string;
    /** Host-authorized immutable/versioned same-origin asset; null uses the business initial. */
    logoPath: string | null; requireServiceAddress: boolean;
  }>;
  recipientName: string; recipientEmail: string; serviceAddress: string;
  estimateDate: string; validUntil: string; preparedBy: string; relatedRecord: string;
  scope: string; message: string; paymentTerms: string; termsNote: string;
  items: readonly EstimatePaperItem[];
  discount: Readonly<EstimateAdjustment>; taxRate: string; deposit: Readonly<EstimateAdjustment>;
  paymentLink?: string;
}>;
export type EstimatePaperAmounts = Readonly<{
  lineAmountsCents: readonly number[];
  subtotalCents: number; discountCents: number; taxCents: number;
  totalCents: number; depositCents: number; balanceCents: number;
}>;
export type EstimatePaperSource =
  | { state: "draft"; content: EstimatePaperContent }
  | { state: "snapshot"; estimateId: string; version: number; snapshotHash: string; content: EstimatePaperContent; amounts: EstimatePaperAmounts }
  | { state: "loading" | "error" | "unavailable" };

export function isEstimatePaperLogoPath(value: string): boolean {
  return /^\/(?!\/)[^\\\s?#]+$/.test(value);
}

export function estimatePaperAmounts(result: EstimateTotalsCalculation): EstimatePaperAmounts | null {
  const { items, discountCents, taxCents, totalCents, depositCents, balanceCents } = result;
  if (items.subtotalCents === null || discountCents === null || taxCents === null || totalCents === null || depositCents === null || balanceCents === null) return null;
  const lineAmountsCents: number[] = [];
  for (const line of items.items) {
    if (line.amountCents === null || Object.keys(line.errors).length) return null;
    lineAmountsCents.push(line.amountCents);
  }
  return {
    lineAmountsCents,
    subtotalCents: items.subtotalCents, discountCents, taxCents, totalCents, depositCents, balanceCents,
  };
}

/** Reuse the decimal parser through the shared line calculator, independently of an invalid quantity. */
export function estimatePaperUnitPrice(line: EstimatePaperItem): number | null {
  const result = calculateEstimateItems([{ ...line, quantity: "1" }]).items[0];
  return result?.errors.unitPrice ? null : result?.amountCents ?? null;
}

/** Validation does not repair a snapshot or consult current profile/catalog/draft values. */
export function reviewEstimatePaper(source: EstimatePaperSource): {
  content: EstimatePaperContent | null; calculation: EstimateTotalsCalculation | null;
  amounts: EstimatePaperAmounts | null; issues: string[]; canPrint: boolean;
} {
  const blocked = { content: null, calculation: null, amounts: null, issues: [], canPrint: false };
  if (source.state !== "draft" && source.state !== "snapshot") return blocked;
  const d = source.content, issues: string[] = [];
  if (!d.number.trim() || !d.name.trim() || d.name.length > 120 || !Number.isSafeInteger(d.revision) || d.revision < 1) issues.push(c.issues.record);
  if (!d.business.name.trim() || !d.business.address.trim() || !d.business.phone.trim() || !d.business.email.trim()
    || !leadSchema.shape.email.safeParse(d.business.email).success) issues.push(c.issues.business);
  if (d.business.logoPath !== null && !isEstimatePaperLogoPath(d.business.logoPath)) issues.push(c.issues.logo);
  if (!d.recipientName.trim() || !leadSchema.shape.email.safeParse(d.recipientEmail).success) issues.push(c.issues.recipient);
  if (d.business.requireServiceAddress && !d.serviceAddress.trim()) issues.push(c.issues.address);
  if (!isEstimateLocalDate(d.estimateDate) || !isEstimateLocalDate(d.validUntil)) issues.push(c.issues.date);
  if (d.scope.length > 5000 || d.message.length > 2000 || d.paymentTerms.length > 500 || d.termsNote.length > 5000) issues.push(c.issues.content);
  if (d.paymentLink !== undefined && !estimatePaymentLinkSchema.safeParse(d.paymentLink).success) issues.push(c.issues.paymentLink);
  const calculation = calculateEstimateTotals(d);
  const computed = estimatePaperAmounts(calculation);
  if (!computed) issues.push(c.issues.items);
  if (source.state === "snapshot") {
    const { amounts } = source;
    const same = computed && (["subtotalCents", "discountCents", "taxCents", "totalCents", "depositCents", "balanceCents"] as const)
      .every((key) => Number.isSafeInteger(amounts[key]) && amounts[key] === computed[key])
      && amounts.lineAmountsCents.length === computed.lineAmountsCents.length
      && computed.lineAmountsCents.every((expected, index) => Number.isSafeInteger(amounts.lineAmountsCents[index]) && amounts.lineAmountsCents[index] === expected);
    if (issues.length || !same || !source.estimateId.trim() || !source.snapshotHash.trim() || !Number.isSafeInteger(source.version) || source.version < 1) return blocked;
    return { content: d, calculation, amounts, issues: [], canPrint: true };
  }
  return { content: d, calculation, amounts: computed, issues, canPrint: true };
}

export function estimatePaperDate(value: string): string | null {
  return isEstimateLocalDate(value)
    ? new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00Z`)) : null;
}
