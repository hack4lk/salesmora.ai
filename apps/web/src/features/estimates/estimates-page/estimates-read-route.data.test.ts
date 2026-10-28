import { describe, expect, it } from "vitest";
import type { EstimateListQuery, EstimateListResult } from "@salesmora/contracts";
import {
  estimateFiltersFromQuery,
  estimateMembersFromResult,
  estimateMetricsFromResult,
  estimateRowsFromResult,
  estimateSortColumnFromTable,
  estimateSortFromQuery,
} from "./estimates-read-route.data";

const query: EstimateListQuery = {
  workspaceId: "a0d6b18b-6aec-4f7d-a0be-e0de8bf648b1",
  q: "roof",
  status: "sent",
  owner: "me",
  parent: "job",
  includeHidden: true,
  quickFilter: "expiring",
  sort: "estimateNumber",
  direction: "asc",
  page: 2,
  pageSize: 50,
};

const result: EstimateListResult = {
  rows: [
    {
      id: "estimate-id",
      number: "EST-0042",
      estimateNumber: 42,
      revision: 2,
      name: "Roof repair",
      customerName: "Northstar Plumbing",
      service: "Roofing",
      status: "sent",
      totalCents: null,
      parentType: "job",
      parentId: "job-id",
      parentNumber: "JOB-0004",
      ownerId: "former-owner-id",
      ownerName: "Former member",
      validUntil: null,
      updatedAt: "2026-10-23T12:00:00.000Z",
      decidedAt: null,
      archived: false,
      version: 3,
      canDuplicate: true,
      canRevise: false,
      canDelete: false,
    },
  ],
  total: 1,
  scopeTotal: 4,
  page: 2,
  pageSize: 50,
  timezone: "UTC",
  scope: "workspace",
  policyRevision: 1,
  canCreate: false,
  canExport: false,
  canVoid: false,
  canArchive: false,
  owners: [{ id: "owner-id", name: "Alex Morgan", openEstimateCount: 1 }],
  metrics: {
    awaitingCount: 4,
    openValueCents: "123456789012345",
    acceptedThisMonthCount: 1,
    acceptedThisMonthCents: "98765",
    expiringInSevenDaysCount: 2,
  },
};

describe("estimates read-route mapping", () => {
  it("maps URL-backed filters and sorting to the presentation controls", () => {
    expect(estimateFiltersFromQuery(query)).toEqual({
      search: "roof",
      status: "sent",
      owner: "me",
      related: "job",
      includeHidden: true,
    });
    expect(estimateSortFromQuery(query)).toEqual({
      column: "number",
      direction: "asc",
    });
    expect(estimateSortColumnFromTable("number")).toBe("estimateNumber");
    expect(estimateSortColumnFromTable("totalCents")).toBe("totalCents");
    expect(estimateSortColumnFromTable("actions")).toBeUndefined();
  });

  it("preserves nullable row money and retired owner names", () => {
    expect(estimateRowsFromResult(result)[0]).toMatchObject({
      number: "EST-0042",
      totalCents: null,
      ownerId: "former-owner-id",
      ownerName: "Former member",
      capabilities: { create: true, update: false, delete: false },
    });
    expect(estimateMembersFromResult(result)).toContainEqual({
      id: "former-owner-id",
      name: "Former member",
    });
  });

  it("maps exact string metrics without converting aggregate money to numbers", () => {
    expect(estimateMetricsFromResult(result)).toEqual({
      awaitingResponse: 4,
      openValueCents: "123456789012345",
      acceptedThisMonthCount: 1,
      acceptedThisMonthValueCents: "98765",
      expiringIn7Days: 2,
    });

  });

  it("preserves independent row grants instead of granting collection Create to every record", () => {
    const rows = estimateRowsFromResult({
      ...result,
      canCreate: true,
      rows: [
        { ...result.rows[0], canDuplicate: false, canRevise: false, canDelete: true },
        { ...result.rows[0], id: "other-estimate", canDuplicate: true, canRevise: true, canDelete: false },
      ],
    });
    expect(rows.map(row => row.capabilities)).toEqual([
      { create: false, update: false, delete: true },
      { create: true, update: true, delete: false },
    ]);
  });
});
