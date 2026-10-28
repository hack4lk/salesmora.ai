import { describe, expect, it } from "vitest";
import { estimateLeadStageCommandSchema, estimateLeadStageQuerySchema, estimateLeadStageReviewSchema } from "./estimate-lead-stage";

const binding = {
  workspaceId: "11111111-1111-4111-8111-111111111111",
  estimateId: "22222222-2222-4222-8222-222222222222",
  sourceSubmissionId: "33333333-3333-4333-8333-333333333333",
  expectedEstimateVersion: 2,
};
const command = {
  ...binding, leadId: "44444444-4444-4444-8444-444444444444",
  submissionId: "55555555-5555-4555-8555-555555555555", expectedLeadVersion: 3, to: "lost",
};
describe("estimate-bound lead-stage contracts", () => {
  it("requires a durable source confirmation and both reviewed versions", () => {
    expect(estimateLeadStageQuerySchema.parse(binding)).toEqual(binding);
    expect(estimateLeadStageCommandSchema.parse({ ...command, reason: "  Customer declined.  " }).reason).toBe("Customer declined.");
  });
  it.each([
    { workspaceId: "forged" }, { estimateId: "" }, { sourceSubmissionId: "" },
    { expectedEstimateVersion: 0 }, { expectedEstimateVersion: "2" }, { expectedEstimateVersion: 1.5 },
    { extra: true },
  ])("rejects invalid query bindings %j", patch => {
    expect(estimateLeadStageQuerySchema.safeParse({ ...binding, ...patch }).success).toBe(false);
  });
  it.each([
    { leadId: "" }, { submissionId: "forged" }, { expectedLeadVersion: 0 }, { expectedLeadVersion: 1.5 },
    { to: "won" }, { to: "new" }, { reason: "x".repeat(501) },
    { to: "estimate-sent", reason: "Not a Lost move" }, { event: "send" },
  ])("rejects invalid or broadened stage requests %j", patch => {
    expect(estimateLeadStageCommandSchema.safeParse({ ...command, ...patch }).success).toBe(false);
  });
  it("allows an optional bounded Lost reason and no reason for Estimate sent", () => {
    expect(estimateLeadStageCommandSchema.safeParse({ ...command, reason: "x".repeat(500) }).success).toBe(true);
    expect(estimateLeadStageCommandSchema.safeParse({ ...command, to: "estimate-sent" }).success).toBe(true);
  });
  it("does not permit private notes or unknown authority fields in a review response", () => {
    const review = {
      estimate: { id: binding.estimateId, number: "EST-1000", revision: 1, version: 2, status: "sent", archived: false },
      event: { kind: "send" }, target: "estimate-sent",
      lead: { id: command.leadId, number: "LD-1000", name: "Fixture", version: 3, stage: "new", canMove: true, archived: false },
    };
    expect(estimateLeadStageReviewSchema.safeParse(review).success).toBe(true);
    expect(estimateLeadStageReviewSchema.safeParse({ ...review, internalNotes: "private" }).success).toBe(false);
    expect(estimateLeadStageReviewSchema.safeParse({ ...review, lead: { ...review.lead, stage: "unknown" } }).success).toBe(false);
  });
});
