import { estimateShareChatViewSchema, type EstimateShareChatTicket } from "@salesmora/contracts";
import { calculateEstimateTotals } from "@salesmora/domain";
import { estimatePaperFixture } from "../../estimates/estimate-preview-paper/estimate-preview-paper.data";
import { estimatePaperAmounts } from "../../estimates/estimate-preview-paper/estimate-preview-paper.preview";

export const estimateSharingWorkspaceId = "10000000-0000-4000-8000-000000000001";
export function estimateSharingFixture(actionType: EstimateShareChatTicket["actionType"] = "estimate.send", revision = false) {
  const content = { ...structuredClone(estimatePaperFixture), revision: revision ? 2 : 1,
    ...(revision ? { paymentLink: "https://payments.example.test/fictional-review" } : {}) };
  const amounts = estimatePaperAmounts(calculateEstimateTotals(content));
  if (!amounts) throw new Error("The shared paper fixture must have valid amounts.");
  const createdAt = new Date();
  return estimateShareChatViewSchema.parse({
    ticket: {
      id: "10000000-0000-4000-8000-000000000002", actionType, inputHash: "a".repeat(64), authorizationVersion: "b".repeat(64),
      createdAt: createdAt.toISOString(), expiresAt: new Date(createdAt.getTime() + 900000).toISOString(),
      state: "pending", snapshotHash: "c".repeat(64), requiresDialog: actionType !== "estimate.send" || revision,
      estimate: {
        id: "10000000-0000-4000-8000-000000000003", version: 3, number: content.number, revision: content.revision,
        name: content.name, status: actionType === "estimate.resend" ? "sent" : "draft", archived: false,
        totalCents: amounts.totalCents, validUntil: content.validUntil,
      },
    },
    review: {
      today: "2026-10-23", recipientName: content.recipientName, recipientEmail: content.recipientEmail,
      subject: "Estimate EST-2048 from Harbor Home Services", snapshot: { formatVersion: 1, content, amounts },
      parent: { type: "job", id: "10000000-0000-4000-8000-000000000004", version: 1 },
      revision: revision ? {
        sourceEstimateId: "10000000-0000-4000-8000-000000000005", sourceVersion: 2, sourceRevision: 1,
        sourceStatus: "published", requiresPaymentLinkReview: true,
      } : null,
      delivery: actionType === "estimate.resend" ? {
        email: { state: "sent", recipientEmail: content.recipientEmail, updatedAt: createdAt.toISOString(), attemptCount: 1, nextAttemptAt: null },
        link: { state: "active", expiresAt: "2026-11-22T00:00:00.000Z", firstViewedAt: null },
      } : { email: { state: "not-sent" }, link: { state: "not-created", expiresAt: null, firstViewedAt: null } },
    }, receipt: null,
  });
}
