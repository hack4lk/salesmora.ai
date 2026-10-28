import { describe, expect, it } from "vitest";
import { estimatePaperFixture, estimatePaperSnapshotFixture as snapshot } from "../estimate-preview-paper/estimate-preview-paper.data";
import { reviewPublicEstimate, type PublicEstimateSource } from "./public-estimate-view.preview";

describe("public estimate source boundary", () => {
  it("reuses only the supplied authorized frozen snapshot", () => {
    const result = reviewPublicEstimate({ state: "ready", snapshot });
    expect(result.state).toBe("ready");
    expect(result.snapshot).toBe(snapshot);
  });
  it.each(["loading", "expired", "revoked", "withdrawn", "replaced", "not-found", "rate-limited", "error", "unavailable"] as const)(
    "withholds even an accidentally retained snapshot while %s", (state) => {
      const source = Object.assign({ state }, { snapshot });
      expect(reviewPublicEstimate(source)).toEqual({ state, snapshot: null });
    },
  );
  it("does not calculate expiry using the browser's date", () => {
    expect(reviewPublicEstimate({ state: "ready", snapshot: { ...snapshot, content: { ...snapshot.content, validUntil: "2000-01-01" } } }).state).toBe("ready");
    expect(reviewPublicEstimate({ state: "expired" }).snapshot).toBeNull();
  });
  it.each(["subtotalCents", "discountCents", "taxCents", "totalCents", "depositCents", "balanceCents"] as const)(
    "hides the entire snapshot if captured %s disagrees", (key) => {
      expect(reviewPublicEstimate({ state: "ready", snapshot: { ...snapshot, amounts: { ...snapshot.amounts, [key]: 1 } } })).toEqual({ state: "unavailable", snapshot: null });
    },
  );
  it.each([{ estimateId: "" }, { version: 0 }, { snapshotHash: "" }])("hides incomplete snapshot identity %j", (patch) => {
    expect(reviewPublicEstimate({ state: "ready", snapshot: { ...snapshot, ...patch } }).state).toBe("unavailable");
  });
  it.each([
    { recipientName: "" }, { business: { ...estimatePaperFixture.business, name: "" } },
    { validUntil: "" }, { items: [] }, { scope: "x".repeat(5001) },
  ])("does not print an incomplete public snapshot %j", (patch) => {
    expect(reviewPublicEstimate({ state: "ready", snapshot: { ...snapshot, content: { ...snapshot.content, ...patch } } })).toEqual({ state: "unavailable", snapshot: null });
  });
  it("allows a Publish snapshot without a delivery email", () => {
    expect(reviewPublicEstimate({ state: "ready", snapshot: { ...snapshot, content: { ...snapshot.content, recipientEmail: "" } } }).state).toBe("ready");
  });
  it("does not mutate the frozen snapshot", () => {
    const frozen = structuredClone(snapshot);
    Object.freeze(frozen.content.business);
    Object.freeze(frozen.content.items);
    Object.freeze(frozen.content);
    Object.freeze(frozen.amounts.lineAmountsCents);
    Object.freeze(frozen.amounts);
    Object.freeze(frozen);
    expect(reviewPublicEstimate({ state: "ready", snapshot: frozen }).snapshot).toEqual(snapshot);
  });
  it("has no fallback business/profile/draft source", () => {
    const source = Object.assign({ state: "unavailable" as const }, { currentDraft: estimatePaperFixture, currentProfile: estimatePaperFixture.business, snapshot });
    expect(reviewPublicEstimate(source)).toEqual({ state: "unavailable", snapshot: null });
  });
  it("keeps public source states independent of staff status, notes and delivery destination", () => {
    const source: PublicEstimateSource = Object.assign({ state: "ready" as const, snapshot }, {
      status: "accepted", decisionNote: "staff-only", deliveryEmail: "new@example.com",
    });
    expect(reviewPublicEstimate(source)).toEqual({ state: "ready", snapshot });
  });
});
