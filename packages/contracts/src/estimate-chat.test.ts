import { describe, expect, it } from "vitest";
import {
  estimateChatEstimateRefSchema,
  estimateChatFilterSchema,
  estimateChatQuerySchema,
  estimateChatToolParameters,
  estimateChatQueryOperations,
  estimateChatResultSchema,
  estimateChatNavigateSchema,
  estimateChatDestinationSchema,
  estimateChatReadCardSchema,
  estimateChatPricingSchema,
} from "./estimate-chat";

const filters = {
  query: "Panel upgrade",
  status: "sent",
  owner: "all",
  parent: "job",
  customer: null,
  minTotalCents: 10000,
  maxTotalCents: 50000,
  validUntilFrom: "2026-10-01",
  validUntilTo: "2026-10-31",
  includeHidden: false,
  limit: 10,
};

describe("Estimate assistant contracts", () => {
  it("accepts bounded, explicit search filters and rejects inverted ranges", () => {
    expect(estimateChatFilterSchema.safeParse(filters).success).toBe(true);
    expect(
      estimateChatFilterSchema.safeParse({
        ...filters,
        minTotalCents: 50001,
      }).success,
    ).toBe(false);
    expect(
      estimateChatFilterSchema.safeParse({
        ...filters,
        validUntilFrom: "2026-11-01",
      }).success,
    ).toBe(false);
    expect(
      estimateChatFilterSchema.safeParse({
        ...filters,
        validUntilFrom: "2026-02-30",
      }).success,
    ).toBe(false);
  });

  describe("Estimate detailed result contracts", () => {
    const id = "00000000-0000-4000-8000-000000000001";
    const estimate = { id, number: "EST-2048", revision: 2, name: "Repair", status: "draft", archived: false };
    const metadata = { id, scope: "workspace", timezone: "UTC", retrievedAt: "2026-10-26T18:00:00.000Z" };
    const line = {
      position: 1, description: "Materials", quantity: "1", unitPriceCents: 10000, unit: "each",
      taxable: false, included: false, amountCents: 10000, invalidFields: [],
    };
    const pricing = {
      source: "current_draft", lineItems: [line], lineItemCount: 1,
      adjustments: { discount: { type: "none" }, taxRate: "0", deposit: { type: "none" } },
      issues: [],
      totals: {
        subtotalCents: 10000, discountCents: 0, taxableDiscountCents: 0, nonTaxableDiscountCents: 0,
        taxableAfterDiscountCents: 0, taxRateMilliPercent: 0, taxCents: 0, totalCents: 10000, depositCents: 0, balanceCents: 10000,
      },
    };
    const comparison = {
      from: { estimate: { ...estimate, id: "00000000-0000-4000-8000-000000000002", revision: 1 }, source: "frozen_snapshot", totalCents: 8000 },
      to: { estimate, source: "current_draft", totalCents: 10000 },
      totalDifferenceCents: 2000, fields: [],
      lineItemChanges: [{ position: 1, before: { ...line, amountCents: 8000 }, after: line }],
      lineItemChangeCount: 1,
    };
    const compare = { ...metadata, kind: "compare_revisions", estimate, comparison };
    it("accepts all strict read-only shapes without Summary groups or private extensions", () => {
      const cards = [
        { ...metadata, kind: "get", estimate, parentNumber: "J-1024", validUntil: null, pricing,
          delivery: { email: { state: "not-sent", updatedAt: null, attemptCount: 0 }, link: { state: "not-created", expiresAt: null, firstViewedAt: null } },
          history: { events: [{ at: "2026-10-26T18:00:00.123456Z", kind: "published" }], hasMore: false } },
        { ...metadata, kind: "explain_totals", estimate, pricing },
        compare,
        { ...metadata, kind: "summarize_scope", estimate, source: "current_draft", estimateScope: { text: "<script>literal</script>", truncated: false }, parent: null },
      ];
      for (const card of cards) {
        const result = { turnId: id, operation: card.kind, summaries: [], detail: card };
        expect(estimateChatResultSchema.safeParse(result).success).toBe(true);
        expect(estimateChatResultSchema.safeParse({ ...result, operation: "list" }).success).toBe(false);
        expect(estimateChatResultSchema.safeParse({ ...result, detail: { ...card, paymentLink: "https://private.test" } }).success).toBe(false);
      }
      expect(estimateChatReadCardSchema.safeParse({
        ...metadata, kind: "unavailable", operation: "get", estimate: null,
      }).success).toBe(true);
    });
    it("rejects inconsistent positions, counts, differences and revision identities", () => {
      for (const patch of [
        { lineItemCount: 0 }, { lineItems: [{ ...line, position: 2 }] }, { totals: { ...pricing.totals, totalCents: -1 } },
      ]) expect(estimateChatPricingSchema.safeParse({ ...pricing, ...patch }).success).toBe(false);
      for (const patch of [
        { totalDifferenceCents: -2000 }, { lineItemChangeCount: 0 },
        { from: { ...comparison.from, estimate } },
        { lineItemChanges: [{ position: 1, before: null, after: null }] },
        { lineItemChanges: [{ ...comparison.lineItemChanges[0], position: 2 }] },
        { lineItemChanges: [comparison.lineItemChanges[0], comparison.lineItemChanges[0]], lineItemChangeCount: 2 },
        { to: { ...comparison.to, estimate: { ...estimate, number: "EST-9999" } } },
      ]) expect(estimateChatReadCardSchema.safeParse({ ...compare, comparison: { ...comparison, ...patch } }).success).toBe(false);
      expect(estimateChatResultSchema.safeParse({
        turnId: id, operation: "compare_revisions", summaries: [],
        detail: { ...compare, estimate: { ...estimate, id: comparison.from.estimate.id } },
      }).success).toBe(false);
    });
    it("enforces the actual escaped JSON frame bound while allowing explicit shortened windows", () => {
      const result = {
        turnId: id, operation: "explain_totals", summaries: [],
        detail: { ...metadata, kind: "explain_totals", estimate, pricing: {
          ...pricing, lineItemCount: 100,
          lineItems: Array.from({ length: 100 }, (_, index) => ({ ...line, position: index + 1, description: "\u0001".repeat(200) })),
        } },
      };
      expect(JSON.stringify(result).length).toBeGreaterThan(60000);
      expect(estimateChatResultSchema.safeParse(result).success).toBe(false);
      expect(estimateChatResultSchema.safeParse({
        ...result, detail: { ...result.detail, pricing: { ...result.detail.pricing, lineItems: [line] } },
      }).success).toBe(true);
    });
  });

  it("accepts only exact estimate references and registered query operations", () => {
    expect(estimateChatEstimateRefSchema.safeParse("EST-2047").success).toBe(
      true,
    );
    expect(
      estimateChatEstimateRefSchema.safeParse(
        "00000000-0000-4000-8000-000000000001",
      ).success,
    ).toBe(true);
    expect(estimateChatEstimateRefSchema.safeParse("EST-20").success).toBe(
      false,
    );
    expect(
      estimateChatQuerySchema.safeParse({
        request: { operation: "search", input: filters },
      }).success,
    ).toBe(true);
    expect(
      estimateChatQuerySchema.safeParse({
        request: { operation: "delete_all", input: {} },
      }).success,
    ).toBe(false);
    expect(
      estimateChatQuerySchema.safeParse({
        request: {
          operation: "aging",
          input: { waitingDays: 7, expiringWithinDays: 14, limit: 10 },
        },
      }).success,
    ).toBe(true);
    expect(
      estimateChatQuerySchema.safeParse({
        request: {
          operation: "aging",
          input: { waitingDays: 0, expiringWithinDays: 366, limit: 21 },
        },
      }).success,
    ).toBe(false);
    expect(
      estimateChatQuerySchema.safeParse({
        request: {
          operation: "open_in_list",
          input: {
            filters: {
              query: "Panel upgrade",
              status: "sent",
              owner: "all",
              parent: "job",
              includeHidden: false,
            },
          },
        },
      }).success,
    ).toBe(true);
    expect(
      estimateChatQuerySchema.safeParse({
        request: {
          operation: "open_in_list",
          input: { filters: { query: "x", includeHidden: false } },
        },
      }).success,
    ).toBe(false);
  });

  it("serializes strict model parameters without non-JSON refinements", () => {
    const operations = Object.keys(
      estimateChatQueryOperations,
    ) as Array<keyof typeof estimateChatQueryOperations>;
    const schema = estimateChatToolParameters(operations);
    expect(schema.type).toBe("object");
    expect(schema.additionalProperties).toBe(false);
    expect(schema.required).toContain("request");
    const serialized = JSON.stringify(schema);
    for (const operation of operations) {
      expect(serialized).toContain(operation);
    }
    expect(serialized).toContain("quickFilter");
  });

  it("bounds structured summary payloads and rejects arbitrary navigation URLs", () => {
    const id = "00000000-0000-4000-8000-000000000001";
    const summary = {
      id, queryLabel: "Matching estimates", scope: "workspace", filterLabels: [],
      dateRange: null, retrievedAt: "2026-10-26T18:00:00.000Z", timezone: "UTC",
      totalMatches: 0, totalCents: 0, rows: [], canOpenList: true,
      canReviewExport: false,
    };
    const result = { turnId: id, operation: "search", summaries: [summary] };
    expect(estimateChatResultSchema.safeParse(result).success).toBe(true);
    for (const patch of [
      { summaries: Array(4).fill(summary) }, { summaries: [{ ...summary, totalCents: Number.MAX_SAFE_INTEGER + 1 }] },
      { summaries: [{ ...summary, rows: Array(11).fill({}) }] }, { href: "https://external.test" },
    ]) expect(estimateChatResultSchema.safeParse({ ...result, ...patch }).success).toBe(false);
    expect(estimateChatNavigateSchema.safeParse({ workspaceId: id, turnId: id, resultId: id }).success).toBe(true);
    expect(estimateChatNavigateSchema.safeParse({ workspaceId: id, turnId: id, resultId: id, href: "/jobs" }).success).toBe(false);
    expect(estimateChatNavigateSchema.safeParse({
      workspaceId: id, turnId: id, resultId: id, estimateId: id, destination: "export",
    }).success).toBe(false);
    expect(estimateChatDestinationSchema.safeParse({ href: `/estimates/${id}?workspace=${id}` }).success).toBe(true);
    expect(estimateChatDestinationSchema.safeParse({ href: "//external.test/estimates" }).success).toBe(false);
  });
});
