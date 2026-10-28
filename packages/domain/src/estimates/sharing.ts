import {
  estimateFrozenSnapshotSchema,
  leadSchema,
  type EstimateFrozenSnapshot,
  type EstimateSnapshotAmounts,
  type EstimateSnapshotPaperContent,
} from "@salesmora/contracts";
import { calculateEstimateTotals } from "./totals";

/** Customer-paper readiness is shared by authoritative sharing and snapshot reads. */
export function estimateSharingIssues(content: EstimateSnapshotPaperContent): string[] {
  const issues: string[] = [];
  if (!content.number.trim() || !content.name.trim()) issues.push("Complete the estimate name and number.");
  const business = content.business;
  if (!business.name.trim() || !business.address.trim() || !business.phone.trim() ||
      !business.email.trim() || !leadSchema.shape.email.safeParse(business.email).success) {
    issues.push("Complete the estimate business name, address, phone and reply-to email in Settings.");
  }
  if (!content.recipientName.trim()) issues.push("Provide the prepared-for customer name.");
  if (!leadSchema.shape.email.safeParse(content.recipientEmail).success) {
    issues.push("Correct the customer email before sharing.");
  }
  if (business.requireServiceAddress && !content.serviceAddress.trim()) {
    issues.push("Provide the service address before sharing.");
  }
  if (!content.validUntil) issues.push("Choose a valid-until date before sharing.");
  if (!estimateSharingAmounts(content)) issues.push("Complete the line items, discount, tax and deposit before sharing.");
  return issues;
}

export function estimateSharingAmounts(content: EstimateSnapshotPaperContent): EstimateSnapshotAmounts | null {
  const result = calculateEstimateTotals(content);
  const { items, discountCents, taxCents, totalCents, depositCents, balanceCents } = result;
  if (items.error || items.subtotalCents === null || discountCents === null || taxCents === null ||
      totalCents === null || depositCents === null || balanceCents === null ||
      Object.keys(result.errors).length) return null;
  const lineAmountsCents: number[] = [];
  for (const line of items.items) {
    if (line.amountCents === null || Object.keys(line.errors).length) return null;
    lineAmountsCents.push(line.amountCents);
  }
  return {
    lineAmountsCents, subtotalCents: items.subtotalCents, discountCents, taxCents,
    totalCents, depositCents, balanceCents,
  };
}

/** Invalid stored paper is unavailable, never repaired from mutable draft/profile/catalog data. */
export function validEstimateFrozenSnapshot(raw: unknown): EstimateFrozenSnapshot | null {
  const parsed = estimateFrozenSnapshotSchema.safeParse(raw);
  if (!parsed.success || estimateSharingIssues(parsed.data.content).length) return null;
  const expected = estimateSharingAmounts(parsed.data.content);
  if (!expected) return null;
  for (const key of ["subtotalCents", "discountCents", "taxCents", "totalCents", "depositCents", "balanceCents"] as const) {
    if (expected[key] !== parsed.data.amounts[key]) return null;
  }
  const lines = parsed.data.amounts.lineAmountsCents;
  if (lines.length !== expected.lineAmountsCents.length ||
      lines.some((amount, index) => amount !== expected.lineAmountsCents[index])) return null;
  return parsed.data;
}
