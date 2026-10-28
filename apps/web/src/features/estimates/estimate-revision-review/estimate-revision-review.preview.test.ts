import { describe, expect, it } from "vitest";
import {
  estimateRevisionAcknowledgement, isEstimateRevisionAcknowledgementCurrent, reviewEstimateRevisionSharing,
} from "./estimate-revision-review.preview";
import { estimateRevisionReviewData as c, estimateRevisionReviewFixture as fixture } from "./estimate-revision-review.data";

describe("revision replacement and carried payment review", () => {
  it("requires explicit acknowledgement of an unchanged carried payment link", () => {
    expect(reviewEstimateRevisionSharing(fixture)).toEqual({ issues: [c.required], confirmation: null });
    const input = { ...fixture, value: estimateRevisionAcknowledgement(fixture, true) };
    expect(reviewEstimateRevisionSharing(input).confirmation).toEqual({
      sourceEstimateId: fixture.revision.sourceEstimateId, sourceVersion: 2, paymentLinkReviewed: true,
    });
    expect(reviewEstimateRevisionSharing({ ...fixture, value: estimateRevisionAcknowledgement(fixture, false) }).confirmation).toBeNull();
  });
  it("does not require a carried-link acknowledgement for removed or changed URLs", () => {
    for (const paymentLink of ["", "https://payments.example.test/updated"]) {
      const input = { ...fixture, paymentLink, revision: { ...fixture.revision, requiresPaymentLinkReview: false } };
      expect(reviewEstimateRevisionSharing(input).confirmation?.paymentLinkReviewed).toBe(false);
    }
  });
  it("invalidates acknowledgements when record, version, paper or predecessor changes", () => {
    const value = estimateRevisionAcknowledgement(fixture, true)!;
    for (const patch of [
      { estimateId: "different" }, { expectedVersion: 2 }, { snapshotHash: "b".repeat(64) },
      { sourceEstimateId: "different" }, { sourceVersion: 3 }, { paymentLinkReviewed: false },
      { paymentLink: "https://payments.example.test/changed" },
    ]) {
      const input = { ...fixture, value: { ...value, ...patch } };
      expect(isEstimateRevisionAcknowledgementCurrent(input)).toBe(false);
      expect(reviewEstimateRevisionSharing(input).confirmation).toBeNull();
    }
  });
  it("hides private validation details without read access", () => {
    expect(reviewEstimateRevisionSharing({ ...fixture, canRead: false, paymentLink: "secret" }))
      .toEqual({ issues: [c.unavailable], confirmation: null });
  });
  it.each(["sent", "published", "declined", "expired"] as const)("allows review of a %s predecessor", sourceStatus => {
    const input = { ...fixture, revision: { ...fixture.revision, sourceStatus } };
    expect(reviewEstimateRevisionSharing({ ...input, value: estimateRevisionAcknowledgement(input, true) }).issues).toEqual([]);
  });
  it.each(["accepted", "void", "superseded", "draft"] as const)("rejects a non-replaceable %s predecessor", sourceStatus => {
    expect(reviewEstimateRevisionSharing({ ...fixture, revision: { ...fixture.revision, sourceStatus } }).issues).toEqual([c.invalid]);
  });
  it("blocks missing permissions, invalid IDs, invalid previews, invalid links and reversed revision numbers", () => {
    for (const patch of [
      { canSend: false }, { estimate: { ...fixture.estimate, status: "sent" as const } },
      { estimate: { ...fixture.estimate, archived: true } },
      { revision: { ...fixture.revision, sourceEstimateId: "" } },
      { revision: { ...fixture.revision, sourceEstimateId: fixture.estimate.id } },
      { revision: { ...fixture.revision, sourceVersion: 0 } },
      { revision: { ...fixture.revision, sourceRevision: 2 } },
      { preview: null }, { preview: { state: "stale" as const } },
      { paymentLink: "" }, { paymentLink: "javascript:alert(1)" },
    ]) expect(reviewEstimateRevisionSharing({ ...fixture, ...patch }).confirmation).toBeNull();
  });
});
