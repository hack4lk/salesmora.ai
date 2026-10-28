import { createHash } from "node:crypto";
import {
  estimateFrozenSnapshotSchema,
  estimatePaperContentSchema,
  type EstimateFrozenSnapshot,
} from "@salesmora/contracts";
import { estimateSharingAmounts, estimateSharingIssues, validEstimateFrozenSnapshot } from "@salesmora/domain";
import type { EstimateEditorSeed } from "./drafts";

export function estimateDraftPaperContent(seed: EstimateEditorSeed) {
  const estimate = seed.estimate;
  if (!estimate) throw new Error("A saved estimate is required for sharing.");
  const { values } = estimate;
  return estimatePaperContentSchema.parse({
    number: estimate.number,
    revision: estimate.revision,
    name: values.details.name,
    business: seed.paperBusiness,
    recipientName: values.details.recipientName,
    recipientEmail: values.details.recipientEmail,
    serviceAddress: values.details.serviceAddress,
    estimateDate: seed.today,
    validUntil: values.terms.validUntil,
    preparedBy: seed.members.find(member => member.id === values.details.ownerId)?.name ?? "",
    relatedRecord: `${estimate.parent.type === "lead" ? "Lead" : "Job"} ${estimate.parent.number} \u00b7 ${estimate.parent.name}`,
    scope: values.scope,
    message: values.terms.message,
    paymentTerms: values.terms.paymentTerms,
    termsNote: values.terms.termsNote,
    items: values.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxable: item.taxable,
      included: item.included,
      unit: item.catalog?.unit ?? item.unit ?? "",
    })),
    discount: values.totals.discount,
    taxRate: values.totals.taxRate,
    deposit: values.terms.deposit,
    paymentLink: values.paymentLink ?? "",
  });
}

export function estimateSharingPaper(seed: EstimateEditorSeed) {
  const content = estimateDraftPaperContent(seed);
  const issues = estimateSharingIssues(content);
  if (content.validUntil && content.validUntil < seed.today) {
    issues.push("Choose today or a later valid-until date in the workspace timezone.");
  }
  const amounts = estimateSharingAmounts(content);
  const snapshot: EstimateFrozenSnapshot | null = amounts
    ? { formatVersion: 1, content, amounts }
    : null;
  return { content, issues, snapshot };
}

/** Parsing fixes key order so JSONB object ordering cannot change the captured hash. */
export function estimateSnapshotHash(snapshot: EstimateFrozenSnapshot) {
  return createHash("sha256")
    .update(JSON.stringify(estimateFrozenSnapshotSchema.parse(snapshot)))
    .digest("hex");
}

export function verifiedEstimateFrozenSnapshot(content: unknown, contentHash: string): EstimateFrozenSnapshot | null {
  const snapshot = validEstimateFrozenSnapshot(content);
  return snapshot && estimateSnapshotHash(snapshot) === contentHash ? snapshot : null;
}

export function estimateEmailSubject(number: string, businessName: string) {
  return `Estimate ${number} from ${businessName}`.replace(/[\r\n]+/g, " ").trim();
}
