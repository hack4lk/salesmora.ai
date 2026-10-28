import { estimateStatuses } from "../estimate-preview.types";
import { createEstimateTimestampFormatter, formatEstimateTimestamp, isEstimateLocalDate } from "../estimate-timestamp";
import { estimateSummaryCardData as c } from "./estimate-summary-card.data";
import type { EstimateSummaryCardProps, EstimateSummaryDateRange, EstimateSummaryRow } from "./estimate-summary-card.types";

const date = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", year: "numeric", month: "short", day: "numeric" });

function isSafeMoney(value: number | null) {
  return value === null || (Number.isSafeInteger(value) && value >= 0);
}
function rangeValid(range: EstimateSummaryDateRange | null) {
  return range === null || (typeof range === "object" && typeof range.from === "string" && typeof range.to === "string"
    && isEstimateLocalDate(range.from) && isEstimateLocalDate(range.to) && range.from <= range.to);
}
function rowValid(row: unknown): row is EstimateSummaryRow {
  if (typeof row !== "object" || row === null) return false;
  const candidate = row as Record<string, unknown>;
  return typeof candidate.id === "string" && !!candidate.id.trim()
    && typeof candidate.number === "string" && !!candidate.number.trim()
    && typeof candidate.name === "string" && !!candidate.name.trim() && candidate.name.length <= 120
    && typeof candidate.customerName === "string"
    && typeof candidate.archived === "boolean"
    && (candidate.totalCents === null || (typeof candidate.totalCents === "number" && Number.isSafeInteger(candidate.totalCents) && candidate.totalCents >= 0))
    && estimateStatuses.some((status) => status === candidate.status)
    && Number.isSafeInteger(candidate.revision) && typeof candidate.revision === "number" && candidate.revision > 0
    && (candidate.parentType === "lead" || candidate.parentType === "job")
    && typeof candidate.parentId === "string" && !!candidate.parentId.trim()
    && typeof candidate.parentNumber === "string" && !!candidate.parentNumber.trim()
    && (candidate.validUntil === null || (typeof candidate.validUntil === "string" && isEstimateLocalDate(candidate.validUntil)));
}
function relatedLabel(row: EstimateSummaryRow) {
  return `${row.parentType === "lead" ? "Lead" : "Job"} · ${row.parentNumber}`;
}
export function formatEstimateSummaryDate(value: string | null): string | null {
  return typeof value === "string" && isEstimateLocalDate(value) ? date.format(new Date(`${value}T00:00:00Z`)) : null;
}

/** Read-only, bounded view; hosts own authorization, query execution and navigation. */
export function reviewEstimateSummaryCard({ result, canRead = true }: Pick<EstimateSummaryCardProps, "result" | "canRead">) {
  if (!canRead) return { visible: false, valid: false, issues: [c.unavailable], rows: [], retrieved: null, canOpenList: false, canReviewExport: false, summary: null };
  if (!result) return { visible: true, valid: false, issues: [c.missingResult], rows: [], retrieved: null, canOpenList: false, canReviewExport: false, summary: null };
  const issues: string[] = [];
  if (typeof result.id !== "string" || !result.id.trim()) issues.push(c.errors.resultId);
  if (typeof result.queryLabel !== "string" || !result.queryLabel.trim()) issues.push(c.errors.query);
  if (!["workspace", "assigned"].includes(result.scope)) issues.push(c.errors.scope);
  if (!Array.isArray(result.filterLabels) || !result.filterLabels.every((label) => typeof label === "string" && !!label.trim())) issues.push(c.errors.filters);
  if (!rangeValid(result.dateRange)) issues.push(c.errors.range);
  const formatter = typeof result.timezone === "string" ? createEstimateTimestampFormatter(result.timezone) : null;
  if (!formatter) issues.push(c.errors.timezone);
  const retrieved = typeof result.retrievedAt === "string" ? formatEstimateTimestamp(result.retrievedAt, formatter) : null;
  if (!retrieved) issues.push(c.errors.retrievedAt);
  if (!Number.isSafeInteger(result.totalMatches) || result.totalMatches < 0) issues.push(c.errors.totalMatches);
  if (!isSafeMoney(result.totalCents)) issues.push(c.errors.totalCents);
  if (typeof result.canReviewExport !== "boolean") issues.push(c.errors.exportAvailability);
  const rows = Array.isArray(result.rows) ? result.rows : [];
  const validRows = rows.filter(rowValid);
  if (!Array.isArray(result.rows) || validRows.length !== rows.length
    || new Set(validRows.map((row) => row.id)).size !== validRows.length
    || (Number.isSafeInteger(result.totalMatches) && rows.length > result.totalMatches)) issues.push(c.errors.rows);
  const valid = issues.length === 0;
  const visibleRows = valid ? validRows.slice(0, 10) : [];
  return {
    visible: true, valid, issues: [...new Set(issues)], rows: visibleRows, retrieved,
    canOpenList: valid && result.totalMatches > 0 && typeof result.id === "string" && !!result.id.trim(),
    canReviewExport: valid && result.canReviewExport && typeof result.id === "string" && !!result.id.trim(),
    summary: valid ? {
      id: result.id, queryLabel: result.queryLabel.trim(), scope: result.scope,
      filterLabels: result.filterLabels.map((label) => label.trim()),
      dateRange: result.dateRange, totalMatches: result.totalMatches, totalCents: result.totalCents,
      canReviewExport: result.canReviewExport,
      hasMore: result.totalMatches > visibleRows.length, more: Math.max(0, result.totalMatches - visibleRows.length),
      related: visibleRows.map((row) => ({ id: row.id, label: relatedLabel(row) })),
    } : null,
  };
}
