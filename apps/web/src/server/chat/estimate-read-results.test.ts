import { describe, expect, it } from "vitest";
import { estimateChatResultSchema, estimateChatSnapshotSchema } from "@salesmora/contracts";
import {
  estimateComparisonCard, estimateReadSnapshot, estimateScopeCard, estimateTotalsCard,
  estimateUnavailableCard,
} from "./estimate-read-results";

type Detail = Parameters<typeof estimateTotalsCard>[1];
const id = "00000000-0000-4000-8000-000000000001";
const metadata = { retrievedAt: "2026-10-26T16:30:00.000Z", timezone: "America/New_York", scope: "workspace" as const };
function detail(patch: Partial<Detail> = {}): Detail {
  return {
    id, number: "EST-2048", revision: 1, name: "Repair estimate", status: "draft", archived: false,
    scope: "<script>literal scope</script>", validUntil: "", source: "current_draft", today: "2026-10-26",
    lineItems: [
      { description: "Materials", quantity: "1", unitPriceCents: 60000, unit: "each", taxable: true, included: false, amountCents: 60000, errors: {} },
      { description: "Installation", quantity: "1", unitPriceCents: 40000, unit: "job", taxable: false, included: false, amountCents: 40000, errors: {} },
    ],
    adjustments: { discount: { type: "percent", value: "10" }, taxRate: "8.875", deposit: { type: "percent", value: "25" } },
    totals: {
      subtotalCents: 100000, discountCents: 10000, taxableDiscountCents: 6000, nonTaxableDiscountCents: 4000,
      taxableAfterDiscountCents: 54000, taxRateMilliPercent: 8875, taxCents: 4793, totalCents: 94793, depositCents: 23698, balanceCents: 71095,
    },
    calculationErrors: {}, itemError: null,
    ...patch,
  };
}
describe("Estimate detailed read projections", () => {
  it("projects authoritative inputs, all allocation amounts, units, errors and exact frozen totals", () => {
    const input = detail({ source: "frozen_snapshot" });
    const snapshot = estimateReadSnapshot(id, estimateTotalsCard(metadata, input));
    expect(snapshot.result.operation).toBe("explain_totals");
    expect(snapshot.lists).toEqual([]);
    const card = snapshot.result.detail;
    if (card?.kind !== "explain_totals") throw new Error("Totals card missing.");
    expect(card.pricing.totals).toEqual(input.totals);
    expect(card.pricing.lineItems[0]).toMatchObject({ unit: "each", amountCents: 60000, position: 1 });
    expect(card.pricing.source).toBe("frozen_snapshot");
    expect(card).not.toHaveProperty("scopeText");
  });
  it("keeps incomplete Draft values unavailable instead of substituting zero", () => {
    const input = detail({ lineItems: [], itemError: "empty-items", calculationErrors: { deposit: "deposit-amount" } });
    for (const key of ["subtotalCents", "totalCents", "depositCents", "balanceCents"] as const) input.totals[key] = null;
    const card = estimateTotalsCard(metadata, input);
    if (card.kind !== "explain_totals") throw new Error("Totals card missing.");
    expect(card.pricing.issues).toEqual(["items", "deposit"]);
    expect(card.pricing.totals.totalCents).toBeNull();
    expect(card.pricing.lineItemCount).toBe(0);
  });
  it("trims only the escaped line window at 60,000 characters without recalculating any amounts", () => {
    const input = detail();
    input.lineItems = Array.from({ length: 100 }, () => ({
      ...input.lineItems[0], description: "\u0001".repeat(200), unit: "\u0001".repeat(100),
    }));
    const saved = estimateReadSnapshot(id, estimateTotalsCard(metadata, input));
    const card = saved.result.detail;
    if (card?.kind !== "explain_totals") throw new Error("Totals card missing.");
    expect(card.pricing.lineItemCount).toBe(100);
    expect(card.pricing.lineItems.length).toBeLessThan(100);
    expect(card.pricing.totals).toEqual(input.totals);
    expect(JSON.stringify(saved.result).length).toBeLessThanOrEqual(60000);
  });
  it("compares all typed field values and includes unit-only changes, additions and removals", () => {
    const older = detail({ source: "frozen_snapshot", status: "published" });
    const newer = detail({ id: "00000000-0000-4000-8000-000000000003", revision: 2, name: "Revised repair", scope: "New scope", validUntil: "2026-11-01" });
    newer.lineItems = [{ ...newer.lineItems[0], unit: "box" }];
    newer.totals.totalCents = 50000;
    const card = estimateComparisonCard(metadata, newer, older);
    if (card.kind !== "compare_revisions" || !card.comparison) throw new Error("Comparison missing.");
    expect(card.comparison.totalDifferenceCents).toBe(-44793);
    expect(card.comparison.fields.map(field => field.field)).toEqual(["name", "scope", "validUntil"]);
    expect(card.comparison.lineItemChangeCount).toBe(2);
    expect(card.comparison.lineItemChanges[0]).toMatchObject({ before: { unit: "each" }, after: { unit: "box" } });
    expect(card.comparison.lineItemChanges[1]).toMatchObject({ before: { position: 2 }, after: null });
    const reverse = estimateComparisonCard(metadata, { ...older, revision: 3 }, newer);
    if (reverse.kind !== "compare_revisions" || !reverse.comparison) throw new Error("Comparison missing.");
    expect(reverse.comparison.lineItemChanges[1]).toMatchObject({ before: null, after: { position: 2 } });
  });
  it("reports a single revision without inventing a comparison and preserves unknown differences", () => {
    const newer = detail({ id: "00000000-0000-4000-8000-000000000003", revision: 2 });
    const older = detail();
    older.totals.totalCents = null;
    const one = estimateComparisonCard(metadata, newer, null);
    expect(one).toHaveProperty("comparison", null);
    const unknown = estimateComparisonCard(metadata, newer, older);
    expect(unknown).toHaveProperty("comparison.totalDifferenceCents", null);
  });
  it("bounds large revision changes while retaining both identities, totals and full change count", () => {
    const older = detail({ scope: "\u0001".repeat(5000) });
    older.lineItems = Array.from({ length: 100 }, () => ({ ...older.lineItems[0], description: "\u0001".repeat(200) }));
    const newer = detail({ id: "00000000-0000-4000-8000-000000000003", revision: 2, scope: "New scope", lineItems: [] });
    const saved = estimateReadSnapshot(id, estimateComparisonCard(metadata, newer, older));
    const card = saved.result.detail;
    if (card?.kind !== "compare_revisions" || !card.comparison) throw new Error("Comparison missing.");
    expect(card.comparison.fields[0].before).toMatchObject({ truncated: true });
    expect(card.comparison.lineItemChangeCount).toBe(100);
    expect(card.comparison.lineItemChanges.length).toBeLessThan(100);
    expect(card.comparison.from.totalCents).toBe(94793);
    expect(JSON.stringify(saved.result).length).toBeLessThanOrEqual(60000);
  });
  it("keeps saved scope literal, authorizes parent content independently and excludes contacts/notes/links", () => {
    const parent: Parameters<typeof estimateScopeCard>[2] = {
      id, type: "job", number: "J-1024", name: "Repair", status: "scheduled", service: "Plumbing".repeat(100),
      customer: { id, name: "Customer" }, href: `/jobs/${id}?workspace=${id}`,
      contactName: "PRIVATE_CONTACT", recipientEmail: "PRIVATE_EMAIL", serviceAddress: "PRIVATE_ADDRESS",
    };
    const card = estimateScopeCard(metadata, detail(), parent);
    if (card.kind !== "summarize_scope") throw new Error("Scope card missing.");
    expect(card.estimateScope.text).toBe("<script>literal scope</script>");
    expect(card.parent?.service.truncated).toBe(true);
    expect(JSON.stringify(card)).not.toContain("PRIVATE_");
    expect(card.parent).not.toHaveProperty("href");
    expect(estimateScopeCard(metadata, detail(), { ...parent, href: undefined })).toHaveProperty("parent", null);
  });
  it("strictly validates read operations, rejects arbitrary/private data and preserves empty-result provenance", () => {
    const saved = estimateReadSnapshot(id, estimateUnavailableCard(metadata, "get"));
    expect(saved.result.detail?.estimate).toBeNull();
    expect(estimateChatResultSchema.safeParse({ ...saved.result, operation: "explain_totals" }).success).toBe(false);
    expect(estimateChatResultSchema.safeParse({ ...saved.result, detail: { ...saved.result.detail, recipientEmail: "PRIVATE" } }).success).toBe(false);
    expect(estimateChatSnapshotSchema.safeParse({ ...saved, lists: [{ resultId: saved.result.detail?.id, query: { workspaceId: id } }] }).success).toBe(false);
  });
});
