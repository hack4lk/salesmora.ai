import { estimateDecisionChatViewSchema } from "@salesmora/contracts";

export const estimateDecisionWorkspaceId = "10000000-0000-4000-8000-000000000001";
const createdAt = new Date();
export function estimateDecisionFixture(correct = false) {
  const now = createdAt;
  const estimate = {
    id: "10000000-0000-4000-8000-000000000003", version: 3, number: "EST-2048", revision: 1,
    name: "Kitchen sink repair", status: correct ? "declined" : "sent", archived: false, totalCents: 96917,
  };
  return estimateDecisionChatViewSchema.parse({
    ticket: {
      id: "10000000-0000-4000-8000-000000000002", actionType: "estimate.decision", mode: correct ? "correct" : "record",
      inputHash: "a".repeat(64), authorizationVersion: "b".repeat(64), snapshotHash: "c".repeat(64),
      createdAt: now.toISOString(), expiresAt: new Date(now.getTime() + 900000).toISOString(), state: "pending", estimate,
    },
    review: {
      estimate: { ...estimate, recipientName: "Jordan Lee", decision: correct ? {
        id: "10000000-0000-4000-8000-000000000005", outcome: "declined",
        decisionDate: "2026-10-25", channel: "email", note: "Original staff-only note.",
      } : null },
      today: "2026-10-26", timezone: "America/New_York", canDecide: true, canCorrectDecision: true,
      parent: { type: "job", id: "10000000-0000-4000-8000-000000000004", version: 1 },
    },
    value: {
      estimateId: estimate.id, expectedVersion: estimate.version, outcome: "accepted", decisionDate: "2026-10-26",
      channel: "phone", note: "Customer confirmed by phone. Literal <b>text</b>.",
      reason: correct ? "Correct the previously recorded customer response." : "",
    },
    canConfirm: true, receipt: null,
  });
}
