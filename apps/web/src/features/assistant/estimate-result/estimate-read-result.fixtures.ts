import { estimateChatReadCardSchema, type EstimateChatReadCard } from "@salesmora/contracts";

export const estimateReadFixtureId = "00000000-0000-4000-8000-000000000001";
const common = {
  id: "00000000-0000-4000-8000-000000000002",
  scope: "workspace", timezone: "America/New_York", retrievedAt: "2026-10-26T16:30:00.000Z",
  estimate: { id: estimateReadFixtureId, number: "EST-2048", revision: 1, name: "Repair estimate", status: "published", archived: false },
};
const pricing = {
  source: "frozen_snapshot",
  lineItemCount: 2,
  lineItems: [
    { position: 1, description: "Materials", quantity: "1", unitPriceCents: 60000, unit: "each", taxable: true, included: false, amountCents: 60000, invalidFields: [] },
    { position: 2, description: "Installation", quantity: "1", unitPriceCents: 40000, unit: "job", taxable: false, included: false, amountCents: 40000, invalidFields: [] },
  ],
  adjustments: { discount: { type: "percent", value: "10" }, taxRate: "8.875", deposit: { type: "percent", value: "25" } },
  issues: [],
  totals: {
    subtotalCents: 100000, discountCents: 10000, taxableDiscountCents: 6000, nonTaxableDiscountCents: 4000,
    taxableAfterDiscountCents: 54000, taxRateMilliPercent: 8875, taxCents: 4793, totalCents: 94793, depositCents: 23698, balanceCents: 71095,
  },
};
export const estimateDetailFixture = estimateChatReadCardSchema.parse({
  ...common, kind: "get", parentNumber: "J-1024", validUntil: "2026-10-30", pricing,
  delivery: {
    email: { state: "not-sent", attemptCount: 0, updatedAt: null },
    link: { state: "active", expiresAt: "2026-10-31T03:59:59.000Z", firstViewedAt: "2026-10-26T16:00:00.000Z" },
  },
  history: { events: [{ kind: "published", at: "2026-10-26T15:30:00.000000Z" }], hasMore: false },
});
export const estimateTotalsFixture = estimateChatReadCardSchema.parse({ ...common, kind: "explain_totals", pricing });
export const estimateScopeFixture = estimateChatReadCardSchema.parse({
  ...common, kind: "summarize_scope", source: "frozen_snapshot",
  estimateScope: { text: "Replace the existing fixtures.\nAllow access to the service area.", truncated: false },
  parent: {
    type: "job", number: "J-1024", name: "Fixture replacement", status: "scheduled",
    service: { text: "Plumbing", truncated: false }, customer: "Jordan Lee",
  },
});
export const estimateComparisonFixture = estimateChatReadCardSchema.parse({
  ...common, kind: "compare_revisions", estimate: { ...common.estimate, id: "00000000-0000-4000-8000-000000000003", revision: 2, status: "draft" },
  comparison: {
    from: { estimate: common.estimate, source: "frozen_snapshot", totalCents: 94793 },
    to: { estimate: { ...common.estimate, id: "00000000-0000-4000-8000-000000000003", revision: 2, status: "draft" }, source: "current_draft", totalCents: 130793 },
    totalDifferenceCents: 36000,
    fields: [{ field: "scope", before: { text: "Replace fixtures.", truncated: false }, after: { text: "Replace fixtures and test.", truncated: false } }],
    lineItemChangeCount: 1,
    lineItemChanges: [{
      position: 2, before: pricing.lineItems[1],
      after: { ...pricing.lineItems[1], quantity: "2", amountCents: 80000 },
    }],
  },
});
export const estimateUnavailableFixture: EstimateChatReadCard = estimateChatReadCardSchema.parse({
  id: common.id, scope: common.scope, timezone: common.timezone, retrievedAt: common.retrievedAt,
  kind: "unavailable", operation: "get", estimate: null,
});
