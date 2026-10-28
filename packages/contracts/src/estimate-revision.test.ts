import { describe, expect, it } from "vitest";
import { estimateRevisionsQuerySchema, reviseEstimateSchema } from "./estimate-revision";
import { shareEstimateSchema } from "./estimate-sharing";

const command = {
  workspaceId: "a0d6b18b-6aec-4f7d-a0be-e0de8bf648b1",
  estimateId: "b1e7c29c-6aec-4f7d-a0be-e0de8bf648b2",
  submissionId: "f4f5d450-faf8-4f02-b2b8-4d13a5900819",
  expectedVersion: 2, snapshotHash: "a".repeat(64),
};
const revisionReview = { sourceEstimateId: command.estimateId, sourceVersion: 2, paymentLinkReviewed: true };

describe("revision boundaries", () => {
  it("requires an exact record/version/snapshot-bound command", () => {
    expect(reviseEstimateSchema.parse(command)).toEqual(command);
  });
  it.each([
    { estimateId: "" }, { expectedVersion: 0 }, { expectedVersion: 1.2 }, { snapshotHash: "invalid" },
    { workspaceId: "" }, { submissionId: "" }, { revision: 9 }, { totalCents: 1 }, { canRevise: true },
  ])("rejects forged or invalid revision input %j", patch => {
    expect(reviseEstimateSchema.safeParse({ ...command, ...patch }).success).toBe(false);
  });
  it("bounds family paging and rejects arbitrary filter fields", () => {
    const query = { workspaceId: command.workspaceId, estimateId: command.estimateId, beforeRevision: 30 };
    expect(estimateRevisionsQuerySchema.parse(query)).toEqual(query);
    for (const beforeRevision of [0, -1, 1.2, "30", null]) {
      expect(estimateRevisionsQuerySchema.safeParse({ ...query, beforeRevision }).success).toBe(false);
    }
    expect(estimateRevisionsQuerySchema.safeParse({ ...query, includeOtherWorkspaces: true }).success).toBe(false);
  });
  it("binds Send/Publish replacement and payment review without changing ordinary sharing", () => {
    expect(shareEstimateSchema.parse({ ...command, mode: "publish" })).not.toHaveProperty("revisionReview");
    for (const mode of ["send", "publish"]) {
      const input = { ...command, mode, revisionReview,
        ...(mode === "send" ? { recipientEmail: "fixture@example.test", subject: "Estimate" } : {}) };
      expect(shareEstimateSchema.safeParse(input).success).toBe(true);
      for (const patch of [{ sourceEstimateId: "" }, { sourceVersion: 0 }, { paymentLinkReviewed: "true" }, { ignored: true }]) {
        expect(shareEstimateSchema.safeParse({ ...input, revisionReview: { ...revisionReview, ...patch } }).success).toBe(false);
      }
    }
    expect(shareEstimateSchema.safeParse({
      ...command, mode: "resend", revisionReview, recipientEmail: "fixture@example.test", subject: "Estimate",
    }).success).toBe(false);
  });
});
