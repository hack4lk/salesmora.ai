import { describe, expect, it } from "vitest";
import { estimateSummaryResultFixture } from "./estimate-summary-card.data";
import { formatEstimateSummaryDate, reviewEstimateSummaryCard } from "./estimate-summary-card.preview";

function fixture() {
  return structuredClone(estimateSummaryResultFixture);
}

describe("assistant Estimate summary review", () => {
  it("hides private details when read access is lost", () => {
    expect(reviewEstimateSummaryCard({ result: fixture(), canRead: false })).toMatchObject({
      visible: false, valid: false, canOpenList: false, summary: null,
    });
  });
  it("requires a host-provided summary result", () => {
    expect(reviewEstimateSummaryCard({ result: undefined, canRead: true })).toMatchObject({
      visible: true, valid: false, canOpenList: false, summary: null,
    });
  });
  it("shows a bounded, valid summary and keeps totals explicit", () => {
    const review = reviewEstimateSummaryCard({ result: fixture(), canRead: true });
    expect(review.valid).toBe(true);
    expect(review.rows).toHaveLength(3);
    expect(review.summary).toMatchObject({ id: "estimate-summary-expiring", totalMatches: 3, hasMore: false, more: 0 });
    expect(review.summary?.totalCents).toBeGreaterThan(0);
    expect(review.summary?.related[0]).toEqual({ id: "estimate-2048", label: "Lead · L-1024" });
  });
  it("limits displayed rows to ten while retaining full result totals", () => {
    const result = fixture();
    Object.assign(result, { rows: Array.from({ length: 12 }, (_, index) => ({
      ...result.rows[index % result.rows.length], id: `estimate-${index + 3000}`, number: `EST-${3000 + index}`,
    })), totalMatches: 12 });
    const review = reviewEstimateSummaryCard({ result, canRead: true });
    expect(review.rows).toHaveLength(10);
    expect(review.summary).toMatchObject({ totalMatches: 12, hasMore: true, more: 2 });
  });
  it("allows missing aggregate totals without inventing zero", () => {
    const result = fixture(); result.totalCents = null;
    const review = reviewEstimateSummaryCard({ result, canRead: true });
    expect(review.valid).toBe(true);
    expect(review.summary?.totalCents).toBeNull();
  });
  it("supports empty matches", () => {
    const result = fixture(); result.totalMatches = 0; result.totalCents = 0; result.rows = [];
    expect(reviewEstimateSummaryCard({ result, canRead: true })).toMatchObject({
      valid: true, rows: [], canOpenList: false, summary: { totalMatches: 0, hasMore: false },
    });
  });
  it("keeps the export-review handoff available for a zero-match preview", () => {
    const result = fixture();
    result.totalMatches = 0;
    result.totalCents = 0;
    result.rows = [];
    result.canReviewExport = true;
    expect(reviewEstimateSummaryCard({ result, canRead: true })).toMatchObject({
      valid: true,
      canOpenList: false,
      canReviewExport: true,
    });
  });
  it.each(["id", "queryLabel"] as const)("requires %s", (key) => {
    const result = fixture(); result[key] = "";
    expect(reviewEstimateSummaryCard({ result, canRead: true }).valid).toBe(false);
  });
  it("requires a valid scope", () => {
    const result = fixture();
    Object.assign(result, { scope: "all" });
    expect(reviewEstimateSummaryCard({ result, canRead: true }).issues).toContain("The summary scope is invalid.");
  });
  it("requires nonblank filter labels", () => {
    const result = fixture(); result.filterLabels = ["ok", " "];
    expect(reviewEstimateSummaryCard({ result, canRead: true }).valid).toBe(false);
  });
  it.each([
    { from: "2026-10-31", to: "2026-10-01" },
    { from: "2026-02-30", to: "2026-10-01" },
    { from: "2026-10-01", to: "invalid" },
  ])("requires a valid absolute date range %j", (range) => {
    const result = fixture();
    Object.assign(result, { dateRange: range });
    expect(reviewEstimateSummaryCard({ result, canRead: true }).valid).toBe(false);
  });
  it("requires timezone and retrieval timestamp", () => {
    const badTimezone = fixture(); badTimezone.timezone = "not-a-timezone";
    expect(reviewEstimateSummaryCard({ result: badTimezone, canRead: true }).valid).toBe(false);
    const badTime = fixture(); badTime.retrievedAt = "invalid";
    expect(reviewEstimateSummaryCard({ result: badTime, canRead: true }).valid).toBe(false);
  });
  it.each([-1, 1.5, Number.MAX_SAFE_INTEGER + 1])("requires a safe match count: %s", (totalMatches) => {
    const result = fixture();
    Object.assign(result, { totalMatches });
    expect(reviewEstimateSummaryCard({ result, canRead: true }).valid).toBe(false);
  });
  it.each([-1, 1.5, Number.MAX_SAFE_INTEGER + 1])("requires a safe aggregate total: %s", (totalCents) => {
    const result = fixture();
    Object.assign(result, { totalCents });
    expect(reviewEstimateSummaryCard({ result, canRead: true }).valid).toBe(false);
  });
  it("requires unique, bounded rows aligned to totalMatches", () => {
    const duplicate = fixture();
    duplicate.rows = [...duplicate.rows, structuredClone(duplicate.rows[0])];
    duplicate.totalMatches = duplicate.rows.length;
    expect(reviewEstimateSummaryCard({ result: duplicate, canRead: true }).valid).toBe(false);
    const overflow = fixture();
    overflow.totalMatches = overflow.rows.length - 1;
    expect(reviewEstimateSummaryCard({ result: overflow, canRead: true }).valid).toBe(false);
  });
  it.each([
    { key: "id", value: "" },
    { key: "number", value: "" },
    { key: "name", value: "" },
    { key: "name", value: "x".repeat(121) },
    { key: "revision", value: 0 },
    { key: "totalCents", value: -1 },
    { key: "parentId", value: "" },
    { key: "parentNumber", value: "" },
    { key: "validUntil", value: "2026-02-30" },
  ])("requires valid row fields: %j", ({ key, value }) => {
    const result = fixture();
    const row = Object.assign({ ...result.rows[0] }, { [key]: value });
    result.rows = [row, ...result.rows.slice(1)];
    result.totalMatches = result.rows.length;
    expect(reviewEstimateSummaryCard({ result, canRead: true }).valid).toBe(false);
  });
  it.each([
    { key: "id", value: null },
    { key: "customerName", value: null },
    { key: "status", value: "unknown" },
    { key: "parentType", value: "account" },
    { key: "revision", value: "1" },
  ])("handles malformed runtime row fields: %j", ({ key, value }) => {
    const result = fixture();
    result.rows = [Object.assign({ ...result.rows[0] }, { [key]: value })];
    result.totalMatches = 1;
    expect(reviewEstimateSummaryCard({ result, canRead: true }).valid).toBe(false);
  });
  it("handles malformed runtime collections without throwing", () => {
    const noRows = fixture();
    Object.assign(noRows, { rows: null });
    expect(reviewEstimateSummaryCard({ result: noRows, canRead: true }).valid).toBe(false);
    const noFilters = fixture();
    Object.assign(noFilters, { filterLabels: null });
    expect(reviewEstimateSummaryCard({ result: noFilters, canRead: true }).valid).toBe(false);
    const partialRange = fixture();
    Object.assign(partialRange, { dateRange: { from: null, to: "2026-10-29" } });
    expect(reviewEstimateSummaryCard({ result: partialRange, canRead: true }).valid).toBe(false);
  });
  it("allows row totals to be missing, but not invalid", () => {
    const allowed = fixture();
    allowed.rows = [{ ...allowed.rows[0], totalCents: null }];
    allowed.totalMatches = 1;
    expect(reviewEstimateSummaryCard({ result: allowed, canRead: true }).valid).toBe(true);
    const invalid = fixture();
    invalid.rows = [{ ...invalid.rows[0], totalCents: 1.5 }];
    invalid.totalMatches = 1;
    expect(reviewEstimateSummaryCard({ result: invalid, canRead: true }).valid).toBe(false);
  });
  it("formats local dates explicitly", () => {
    expect(formatEstimateSummaryDate("2026-10-23")).toBe("Oct 23, 2026");
    expect(formatEstimateSummaryDate("invalid")).toBeNull();
    expect(formatEstimateSummaryDate(null)).toBeNull();
  });
});
