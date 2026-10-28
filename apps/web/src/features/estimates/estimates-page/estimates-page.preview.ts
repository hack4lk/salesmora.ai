import type { EstimateRole, EstimateRow } from "../estimate-preview.types";
import type { EstimateQuickFilter } from "../estimates-metrics/estimates-metrics";
import type { EstimateFilters } from "../estimates-toolbar/estimates-toolbar";

export type EstimateSortColumn = "number" | "totalCents" | "validUntil" | "updatedAt";
export type EstimateListSort = {
  column: EstimateSortColumn;
  direction: "asc" | "desc";
};

export function isEstimateSortColumn(column: string): column is EstimateSortColumn {
  return column === "number" || column === "totalCents" ||
    column === "validUntil" || column === "updatedAt";
}

/** Fixture-only scope simulation. Real authorization belongs to the server. */
export function scopeEstimatePreviewRows(
  rows: readonly EstimateRow[],
  role: EstimateRole,
  assignedJobIds: readonly string[],
) {
  return rows.filter(
    (row) => role !== "field" ||
      (row.parentType === "job" && assignedJobIds.includes(row.parentId)),
  );
}

function awaitsResponse(row: EstimateRow) {
  return row.status === "sent" || row.status === "published";
}

function expiresSoon(row: EstimateRow, today: string) {
  const end = new Date(`${today}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 7);
  return awaitsResponse(row) && row.validUntil !== null &&
    row.validUntil >= today && row.validUntil <= end.toISOString().slice(0, 10);
}

function sumFixtureCents(rows: readonly EstimateRow[]) {
  return rows.reduce((sum, row) => {
    if (row.totalCents === null) {
      throw new Error("Estimate preview totals require complete fixture amounts.");
    }
    const total = sum + row.totalCents;
    if (!Number.isSafeInteger(total)) {
      throw new Error("Estimate preview total exceeds the safe integer range.");
    }
    return total;
  }, 0);
}

export function estimatePreviewTotals(rows: readonly EstimateRow[], today: string) {
  const active = rows.filter((row) => !row.archived && row.status !== "superseded");
  const accepted = active.filter(
    (row) => row.status === "accepted" && row.decidedAt?.slice(0, 7) === today.slice(0, 7),
  );
  return {
    awaitingResponse: active.filter(awaitsResponse).length,
    openValueCents: sumFixtureCents(
      active.filter((row) => row.status === "draft" || awaitsResponse(row)),
    ),
    acceptedThisMonthCount: accepted.length,
    acceptedThisMonthValueCents: sumFixtureCents(accepted),
    expiringIn7Days: active.filter((row) => expiresSoon(row, today)).length,
  };
}

export function filterEstimatePreviewRows(
  rows: readonly EstimateRow[],
  filters: EstimateFilters,
  quickFilter: EstimateQuickFilter,
  today: string,
  currentMemberId: string,
) {
  const search = filters.search.trim().toLocaleLowerCase("en-US");
  return rows.filter((row) =>
    (filters.includeHidden || (!row.archived && row.status !== "superseded")) &&
    (filters.status === "all" || filters.status === row.status) &&
    (filters.related === "all" || filters.related === row.parentType) &&
    (filters.owner === "all" ||
      (filters.owner === "me" ? row.ownerId === currentMemberId :
        filters.owner === "unassigned" ? !row.ownerId : row.ownerId === filters.owner)) &&
    (!search || `${row.name} ${row.number} ${row.customerName} ${row.service} ${row.parentId} ${row.parentNumber}`
      .toLocaleLowerCase("en-US").includes(search)) &&
    (quickFilter !== "awaiting" || awaitsResponse(row)) &&
    (quickFilter !== "expiring" || expiresSoon(row, today)),
  );
}

export function sortEstimatePreviewRows(rows: readonly EstimateRow[], sort: EstimateListSort) {
  const direction = sort.direction === "asc" ? 1 : -1;
  return [...rows].sort((left, right) => {
    // Estimates without a valid-until date stay last in either direction.
    if (sort.column === "validUntil" && (left.validUntil === null || right.validUntil === null)) {
      if (left.validUntil !== right.validUntil) return left.validUntil === null ? 1 : -1;
    }
    const a = left[sort.column], b = right[sort.column];
    const compared = typeof a === "number" && typeof b === "number"
      ? a - b
      : String(a ?? "").localeCompare(String(b ?? ""), "en-US", { numeric: true });
    return compared * direction || left.revision - right.revision || left.id.localeCompare(right.id);
  });
}
