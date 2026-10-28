import { randomUUID } from "node:crypto";
import {
  estimateChatSnapshotSchema,
  estimateListQuerySchema,
  type EstimateChatFilters,
  type EstimateChatResult,
  type EstimateChatSnapshot,
  type EstimateListQuery,
} from "@salesmora/contracts";
import type { readEstimateAgingForChat, readEstimatesForChat } from "@salesmora/data";

type SearchRead = Awaited<ReturnType<typeof readEstimatesForChat>>;
type AgingRead = Awaited<ReturnType<typeof readEstimateAgingForChat>>;
type Summary = EstimateChatResult["summaries"][number];
type Group = Pick<SearchRead, "total" | "totalCents"> & {
  estimates: Array<Omit<SearchRead["estimates"][number], "updatedAt">>;
};
type Clock = Pick<SearchRead, "timezone" | "retrievedAt">;

function savedSnapshot(snapshot: EstimateChatSnapshot): EstimateChatSnapshot {
  // Escaped record text can expand sixfold in JSON. Shrink only the displayed window, never the totals.
  while (JSON.stringify(snapshot.result).length > 60000) {
    const largest = snapshot.result.summaries
      .filter(item => item.rows.length)
      .sort((left, right) => JSON.stringify(right.rows).length - JSON.stringify(left.rows).length)[0];
    if (!largest) throw new Error("Estimate summary metadata exceeds the streaming payload limit.");
    largest.rows.pop();
  }
  return estimateChatSnapshotSchema.parse(snapshot);
}

function summary(
  group: Group,
  clock: Clock,
  scope: SearchRead["scope"],
  queryLabel: string,
  filterLabels: string[],
  canOpenList: boolean,
  dateRange: Summary["dateRange"] = null,
  canReviewExport = false,
): Summary {
  return {
    id: randomUUID(),
    queryLabel,
    scope: scope === "assigned_job" ? "assigned" : "workspace",
    filterLabels,
    dateRange,
    retrievedAt: clock.retrievedAt,
    timezone: clock.timezone,
    totalMatches: group.total,
    totalCents: group.totalCents,
    canOpenList,
    canReviewExport,
    rows: group.estimates.slice(0, 10).map(row => ({
      id: row.id,
      number: row.number,
      revision: row.revision,
      name: row.name,
      customerName: row.customer,
      status: row.status,
      archived: row.archived,
      totalCents: row.totalCents,
      parentType: row.parentType,
      parentId: row.parentId,
      parentNumber: row.parent,
      validUntil: row.validUntil,
    })),
  };
}

function listQuery(workspaceId: string, filters: EstimateChatFilters): EstimateListQuery | null {
  if (filters.customer !== null || filters.minTotalCents !== null ||
      filters.maxTotalCents !== null || filters.validUntilFrom !== null ||
      filters.validUntilTo !== null) return null;
  return estimateListQuerySchema.parse({
    workspaceId,
    q: filters.query,
    status: filters.status,
    owner: filters.owner,
    parent: filters.parent,
    includeHidden: filters.includeHidden,
    quickFilter: filters.quickFilter,
  });
}

export function estimateSearchSnapshot(
  turnId: string,
  workspaceId: string,
  operation: "search" | "list" | "open_in_list" | "export",
  filters: EstimateChatFilters,
  read: SearchRead,
): EstimateChatSnapshot {
  const query = listQuery(workspaceId, filters);
  const labels = [
    filters.includeHidden ? "Hidden records: Included" : "Hidden records: Excluded",
    ...(filters.query ? [`Search: ${filters.query}`] : []),
    ...(filters.status !== "all" ? [`Status: ${filters.status}`] : []),
    ...(filters.owner !== "all" ? [`Owner: ${filters.owner}`] : []),
    ...(filters.parent !== "all" ? [`Parent: ${filters.parent}`] : []),
    ...(filters.customer ? [`Customer contains: ${filters.customer}`] : []),
    ...(filters.minTotalCents !== null ? [`Minimum stored amount: ${filters.minTotalCents} cents`] : []),
    ...(filters.maxTotalCents !== null ? [`Maximum stored amount: ${filters.maxTotalCents} cents`] : []),
    ...(filters.validUntilFrom ? [`Valid until on or after: ${filters.validUntilFrom}`] : []),
    ...(filters.validUntilTo ? [`Valid until on or before: ${filters.validUntilTo}`] : []),
    ...(filters.quickFilter === "awaiting" ? ["Awaiting a decision: Sent or Published"] : []),
    ...(filters.quickFilter === "expiring" ? ["Expiring within 7 days, including today"] : []),
  ];
  const result = summary(
    read,
    read,
    read.scope,
    operation === "open_in_list"
      ? "Open matching estimates"
      : operation === "export" ? "CSV export review" : "Matching estimates",
    labels,
    query !== null && operation !== "export",
    filters.validUntilFrom && filters.validUntilTo
      ? { from: filters.validUntilFrom, to: filters.validUntilTo }
      : null,
    query !== null && operation === "export",
  );
  return savedSnapshot({
    result: { turnId, operation, summaries: [result] },
    lists: query ? [{
      resultId: result.id,
      query,
      destination: operation === "export" ? "export" : "list",
    }] : [],
  });
}

export function estimateAgingSnapshot(
  turnId: string,
  workspaceId: string,
  read: AgingRead,
): EstimateChatSnapshot {
  const waiting = summary(
    read.waiting, read, read.scope,
    `Awaiting a decision for more than ${read.waitingDays} days`,
    ["Statuses: Sent, Published", "Age measured from first Send/Publish in workspace-local days", "Hidden records: Excluded"],
    false,
  );
  const expiring = summary(
    read.expiring, read, read.scope,
    `Expiring within ${read.expiringWithinDays} days`,
    ["Statuses: Sent, Published", `Window begins ${read.today}, including today`, "Hidden records: Excluded"],
    read.expiringWithinDays === 7,
  );
  const accepted = summary(
    read.acceptedWithoutJob, read, read.scope,
    "Accepted Lead estimates without a linked Job",
    ["Status: Accepted", "Parent: Lead", "No Job linked to the source Lead", "Hidden records: Excluded"],
    false,
  );
  return savedSnapshot({
    result: { turnId, operation: "aging", summaries: [waiting, expiring, accepted] },
    lists: expiring.canOpenList
      ? [{
          resultId: expiring.id,
          query: estimateListQuerySchema.parse({ workspaceId, quickFilter: "expiring" }),
          destination: "list",
        }]
      : [],
  });
}
