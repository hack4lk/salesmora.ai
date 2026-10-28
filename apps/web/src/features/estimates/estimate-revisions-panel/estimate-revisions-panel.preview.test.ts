import { describe, expect, it } from "vitest";
import { orderEstimateRevisions, type EstimateRevisionSummary } from "./estimate-revisions-panel.preview";

const row = (id: string, revision: number): EstimateRevisionSummary => ({
  id, revision, status: "published", archived: false, totalCents: 94793,
});

describe("revision history ordering", () => {
  it("orders by revision rather than ID or input order without mutating the page", () => {
    const input = Object.freeze([row("z", 1), row("a", 4), row("m", 2)]);
    expect(orderEstimateRevisions(input).map(value => value.revision)).toEqual([4, 2, 1]);
    expect(input.map(value => value.revision)).toEqual([1, 4, 2]);
  });
  it("preserves status, amounts, navigation and archive metadata", () => {
    const draft = { ...row("draft", 3), status: "draft" as const, totalCents: null, href: "/estimates/draft" };
    const zero = { ...row("zero", 2), totalCents: 0, archived: true };
    expect(orderEstimateRevisions([zero, draft])).toEqual([draft, zero]);
  });
  it("does not invent missing revision numbers or records", () => {
    expect(orderEstimateRevisions([row("one", 1), row("five", 5)]).map(value => value.revision)).toEqual([5, 1]);
  });
  it("supports a single revision and an empty family", () => {
    expect(orderEstimateRevisions([row("one", 1)])).toEqual([row("one", 1)]);
    expect(orderEstimateRevisions([])).toEqual([]);
  });
});
