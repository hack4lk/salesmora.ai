import type {
  EstimateListQuery,
  EstimateListResult,
} from "@salesmora/contracts";
import type {
  EstimateMember,
  EstimateRow,
} from "../estimate-preview.types";
import type { EstimateFilters } from "../estimates-toolbar/estimates-toolbar";
import type { EstimateListSort } from "./estimates-page.preview";

export function estimateFiltersFromQuery(
  query: EstimateListQuery,
): EstimateFilters {
  return {
    search: query.q,
    status: query.status,
    owner: query.owner,
    related: query.parent,
    includeHidden: query.includeHidden,
  };
}

export function estimateSortFromQuery(
  query: EstimateListQuery,
): EstimateListSort {
  return {
    column: query.sort === "estimateNumber" ? "number" : query.sort,
    direction: query.direction,
  };
}

export function estimateSortColumnFromTable(
  column: string,
): EstimateListQuery["sort"] | undefined {
  if (column === "number") return "estimateNumber";
  if (
    column === "totalCents" ||
    column === "validUntil" ||
    column === "updatedAt"
  ) {
    return column;
  }
  return undefined;
}

export function estimateRowsFromResult(
  result: EstimateListResult,
): EstimateRow[] {
  return result.rows.map((row) => ({
    id: row.id,
    number: row.number,
    revision: row.revision,
    name: row.name,
    customerName: row.customerName,
    service: row.service,
    status: row.status,
    totalCents: row.totalCents,
    parentType: row.parentType,
    parentId: row.parentId,
    parentNumber: row.parentNumber,
    ownerId: row.ownerId,
    ownerName: row.ownerName,
    validUntil: row.validUntil,
    updatedAt: row.updatedAt,
    decidedAt: row.decidedAt,
    archived: row.archived,
    version: row.version,
    capabilities: { create: row.canDuplicate, update: row.canRevise, delete: row.canDelete },
  }));
}

export function estimateMembersFromResult(
  result: EstimateListResult | undefined,
): EstimateMember[] {
  if (!result) return [];
  const members = new Map(
    result.owners.map((owner) => [owner.id, { id: owner.id, name: owner.name }]),
  );
  for (const row of result.rows) {
    if (row.ownerId && row.ownerName && !members.has(row.ownerId)) {
      members.set(row.ownerId, { id: row.ownerId, name: row.ownerName });
    }
  }
  return [...members.values()];
}

export function estimateMetricsFromResult(
  result: EstimateListResult | undefined,
):
  | {
      awaitingResponse: number;
      openValueCents: number | string;
      acceptedThisMonthCount: number;
      acceptedThisMonthValueCents: number | string;
      expiringIn7Days: number;
    }
  | undefined {
  if (!result) return undefined;
  return {
    awaitingResponse: result.metrics.awaitingCount,
    openValueCents: result.metrics.openValueCents,
    acceptedThisMonthCount: result.metrics.acceptedThisMonthCount,
    acceptedThisMonthValueCents: result.metrics.acceptedThisMonthCents,
    expiringIn7Days: result.metrics.expiringInSevenDaysCount,
  };
}
