import { describe, expect, it } from "vitest";
import {
  estimateAssignedJobIds,
  estimateFixtures as rows,
  estimatePreviewData as preview,
} from "../estimate-preview.data";
import type { EstimateRow } from "../estimate-preview.types";
import { estimatePreviewTotals, filterEstimatePreviewRows, scopeEstimatePreviewRows, sortEstimatePreviewRows } from "./estimates-page.preview";

const filters = { search: "", status: "all", owner: "all", related: "all", includeHidden: false } as const;
const member = preview.members[0].id;

describe("Estimates list preview", () => {
  it("scopes Field fixtures before metrics, filters, pagination or export counts", () => {
    const scoped = scopeEstimatePreviewRows(rows, "field", estimateAssignedJobIds);
    expect(scoped.map((row) => row.number)).toEqual(["EST-2042", "EST-2039"]);
    expect(scoped.some((row) => row.parentId === "job-1021")).toBe(false);
    expect(estimatePreviewTotals(scoped, preview.today)).toEqual({
      awaitingResponse: 1, openValueCents: 1247753,
      acceptedThisMonthCount: 1, acceptedThisMonthValueCents: 329674, expiringIn7Days: 1,
    });
    expect(filterEstimatePreviewRows(scoped, { ...filters, related: "lead" }, null, preview.today, member)).toEqual([]);
  });

  it("computes the four metrics from permitted, active estimates", () => {
    expect(estimatePreviewTotals(rows, preview.today)).toEqual({
      awaitingResponse: 3, openValueCents: 2464403,
      acceptedThisMonthCount: 1, acceptedThisMonthValueCents: 329674, expiringIn7Days: 2,
    });
    expect(estimatePreviewTotals([], preview.today)).toEqual({
      awaitingResponse: 0, openValueCents: 0,
      acceptedThisMonthCount: 0, acceptedThisMonthValueCents: 0, expiringIn7Days: 0,
    });
  });

  it("excludes archived and superseded estimates unless explicitly included", () => {
    expect(filterEstimatePreviewRows(rows, filters, null, preview.today, member)).toHaveLength(8);
    expect(filterEstimatePreviewRows(rows, { ...filters, includeHidden: true }, null, preview.today, member)).toHaveLength(10);
  });

  it.each(["Kitchen remodel estimate", "EST-2048", "Jordan Lee", "Kitchen remodel", "LD-1048", "lead-1048"])(
    "searches the approved fields with %s", (search) => {
      const result = filterEstimatePreviewRows(rows, { ...filters, search: ` ${search.toUpperCase()} ` }, null, preview.today, member);
      expect(result.some((row) => row.id === "est-2048")).toBe(true);
    },
  );

  it("intersects owner, related record, status and quick filters", () => {
    const result = filterEstimatePreviewRows(rows, { ...filters, owner: "me", related: "lead", status: "sent" }, "expiring", preview.today, member);
    expect(result.map((row) => row.number)).toEqual(["EST-2044"]);
    const unassigned: EstimateRow = { ...rows[0], ownerId: "" };
    expect(filterEstimatePreviewRows([unassigned], { ...filters, owner: "unassigned" }, null, preview.today, member)).toEqual([unassigned]);
  });

  it("uses inclusive today / +7 day boundaries and only Sent or Published for expiry", () => {
    const candidates = ["2026-10-21", "2026-10-22", "2026-10-29", "2026-10-30"].map(
      (validUntil, index) => ({ ...rows[1], id: `boundary-${index}`, validUntil }),
    );
    expect(filterEstimatePreviewRows(candidates, filters, "expiring", preview.today, member).map((row) => row.validUntil))
      .toEqual(["2026-10-22", "2026-10-29"]);
    expect(filterEstimatePreviewRows([{ ...rows[0], validUntil: "2026-10-22" }], filters, "expiring", preview.today, member)).toEqual([]);
  });

  it("only counts decisions from the current month, excluding archived accepts", () => {
    const accepted = rows[3];
    expect(estimatePreviewTotals([
      accepted,
      { ...accepted, id: "prior-month", decidedAt: "2026-09-30" },
      { ...accepted, id: "archived", archived: true },
    ], preview.today).acceptedThisMonthCount).toBe(1);
  });

  it("sorts money numerically without mutating source data", () => {
    const source = [900, 10000, 2000].map((totalCents, index) => ({ ...rows[0], id: `price-${index}`, totalCents }));
    expect(sortEstimatePreviewRows(source, { column: "totalCents", direction: "asc" }).map((row) => row.totalCents)).toEqual([900, 2000, 10000]);
    expect(sortEstimatePreviewRows(source, { column: "totalCents", direction: "desc" }).map((row) => row.totalCents)).toEqual([10000, 2000, 900]);
    expect(source.map((row) => row.totalCents)).toEqual([900, 10000, 2000]);
  });

  it.each(["asc", "desc"] as const)("keeps missing valid-until values last (%s)", (direction) => {
    const sorted = sortEstimatePreviewRows(rows, { column: "validUntil", direction });
    expect(sorted.slice(-2).every((row) => row.validUntil === null)).toBe(true);
  });
});
