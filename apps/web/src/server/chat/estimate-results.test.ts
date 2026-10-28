import { describe, expect, it } from "vitest";
import { estimateChatFilterSchema, estimateChatSnapshotSchema, estimateListQueryToURL } from "@salesmora/contracts";
import { estimateAgingSnapshot, estimateSearchSnapshot } from "./estimate-results";

const id = "00000000-0000-4000-8000-000000000001";
const filters = estimateChatFilterSchema.parse({
  query: "", status: "all", owner: "all", parent: "all",
  customer: null, minTotalCents: null, maxTotalCents: null,
  validUntilFrom: null, validUntilTo: null, includeHidden: false, limit: 20,
});
const read = {
  type: "estimates-result" as const, untrusted: true as const,
  scope: "assigned_job" as const, total: 30, totalCents: 450000, truncated: true,
  timezone: "America/New_York", today: "2026-10-26", retrievedAt: "2026-10-26T18:00:00.000Z",
  estimates: Array.from({ length: 20 }, (_, index) => ({
    id: `00000000-0000-4000-8000-${String(index + 10).padStart(12, "0")}`,
    number: `EST-${1000 + index}`, revision: 1, name: "Literal <script>scope</script>",
    status: "sent" as const, customer: "Customer", parent: "J-1000",
    parentType: "job" as const, parentId: id, archived: false, owner: null,
    totalCents: 10000, validUntil: "2026-10-29", updatedAt: "2026-10-26T18:00:00.000Z",
  })),
};
const aging = {
  ...read, type: "estimates-aging-result" as const, waitingDays: 7, expiringWithinDays: 7,
  waiting: read, expiring: read, acceptedWithoutJob: { total: 0, totalCents: 0, truncated: false, estimates: [] },
};

describe("Estimate summary projection", () => {
  it("uses full-match totals rather than the ten-row window and explicitly projects safe fields", () => {
    const saved = estimateSearchSnapshot(id, id, "search", filters, read);
    const summary = saved.result.summaries[0];
    expect(summary.rows).toHaveLength(10);
    expect(summary.scope).toBe("assigned");
    expect(summary.totalMatches).toBe(30);
    expect(summary.totalCents).toBe(450000);
    expect(summary.rows[0].name).toBe("Literal <script>scope</script>");
    expect(summary.rows[0]).not.toHaveProperty("owner");
    expect(summary.rows[0]).not.toHaveProperty("updatedAt");
    expect(summary.retrievedAt).toBe(read.retrievedAt);
  });
  it.each(["customer", "minTotalCents", "maxTotalCents", "validUntilFrom", "validUntilTo"] as const)(
    "never broadens an unsupported %s predicate into a list link", key => {
      const value = key === "customer" ? "Specific customer" : key.includes("Cents") ? 100 : "2026-10-26";
      const saved = estimateSearchSnapshot(id, id, "search", estimateChatFilterSchema.parse({ ...filters, [key]: value }), read);
      expect(saved.result.summaries[0].canOpenList).toBe(false);
      expect(saved.lists).toEqual([]);
    },
  );
  it("preserves every list-compatible constraint, including Awaiting/Expiring quick filters", () => {
    const saved = estimateSearchSnapshot(id, id, "list", { ...filters, query: "x & y", status: "sent", owner: "me", parent: "job", includeHidden: true, quickFilter: "expiring" }, read);
    const params = new URLSearchParams(estimateListQueryToURL(saved.lists[0].query));
    expect(Object.fromEntries(params)).toEqual({
      workspace: id, q: "x & y", status: "sent", owner: "me", parent: "job",
      includeHidden: "true", quickFilter: "expiring",
    });
  });
  it("binds CSV review to a validated export destination rather than a list link", () => {
    const saved = estimateSearchSnapshot(id, id, "export", {
      ...filters,
      status: "sent",
      quickFilter: "awaiting",
    }, read);
    expect(saved.result.operation).toBe("export");
    expect(saved.result.summaries[0]).toMatchObject({
      canOpenList: false,
      canReviewExport: true,
    });
    expect(saved.lists).toHaveLength(1);
    expect(saved.lists[0]).toMatchObject({
      destination: "export",
      query: {
        workspaceId: id,
        status: "sent",
        quickFilter: "awaiting",
      },
    });
    expect(estimateChatSnapshotSchema.safeParse(saved).success).toBe(true);
  });
  it("keeps overlapping aging groups separate and only links the exact seven-day list window", () => {
    const saved = estimateAgingSnapshot(id, id, aging);
    expect(saved.result.summaries.map(summary => summary.totalMatches)).toEqual([30, 30, 0]);
    expect(saved.lists).toHaveLength(1);
    expect(saved.lists[0].resultId).toBe(saved.result.summaries[1].id);
    expect(estimateAgingSnapshot(id, id, { ...aging, expiringWithinDays: 14 }).lists).toEqual([]);
  });
  it("retains unknown totals and zero matches without inventing money or rows", () => {
    const unknown = estimateSearchSnapshot(id, id, "search", filters, { ...read, totalCents: null });
    expect(unknown.result.summaries[0].totalCents).toBeNull();
    const empty = estimateSearchSnapshot(id, id, "search", filters, { ...read, total: 0, totalCents: 0, estimates: [] });
    expect(empty.result.summaries[0]).toMatchObject({ totalMatches: 0, totalCents: 0, rows: [] });
  });
  it("bounds the actual escaped aging frame while preserving full-match totals", () => {
    const group = {
      ...read,
      estimates: read.estimates.map(row => ({
        ...row, name: "\u0001".repeat(120), customer: "\u0001".repeat(200),
      })),
    };
    const saved = estimateAgingSnapshot(id, id, { ...aging, waiting: group, expiring: group, acceptedWithoutJob: group });
    expect(JSON.stringify(saved.result).length).toBeLessThanOrEqual(60000);
    expect(saved.result.summaries.every(summary => summary.totalMatches === 30 && summary.totalCents === 450000)).toBe(true);
    expect(saved.result.summaries.reduce((count, summary) => count + summary.rows.length, 0)).toBeLessThan(30);
  });
  it("rejects forged snapshot navigation membership", () => {
    const saved = estimateSearchSnapshot(id, id, "search", filters, read);
    expect(estimateChatSnapshotSchema.safeParse({ ...saved, lists: [{ ...saved.lists[0], resultId: id }] }).success).toBe(false);
  });
});
