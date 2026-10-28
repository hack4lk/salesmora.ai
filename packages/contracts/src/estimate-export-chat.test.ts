import { describe, expect, it } from "vitest";
import {
  estimateProposeChatSchema,
  estimateProposeChatToolParameters,
} from "./estimate-share-chat";

const filters = {
  query: "roof",
  status: "sent",
  owner: "all",
  parent: "lead",
  includeHidden: false,
  quickFilter: null,
};

describe("Estimate CSV export handoff contract", () => {
  it("accepts a current-list handoff or explicit validated list filters", () => {
    expect(estimateProposeChatSchema.parse({
      request: { operation: "export", filters: null },
    })).toEqual({ request: { operation: "export", filters: null } });
    expect(estimateProposeChatSchema.parse({
      request: { operation: "export", filters },
    })).toEqual({ request: { operation: "export", filters } });
  });

  it("rejects unsupported filters and extra fields", () => {
    expect(estimateProposeChatSchema.safeParse({
      request: { operation: "export", filters: { ...filters, minTotalCents: 5000 } },
    }).success).toBe(false);
    expect(estimateProposeChatSchema.safeParse({
      request: { operation: "export", filters: { ...filters, includeHidden: "yes" } },
    }).success).toBe(false);
    expect(estimateProposeChatSchema.safeParse({
      request: { operation: "export", filters, downloadNow: true },
    }).success).toBe(false);
  });

  it("exposes export as a strict proposal operation", () => {
    const schema = JSON.stringify(estimateProposeChatToolParameters);
    expect(schema).toContain("export");
    expect(schema).toContain("quickFilter");
    expect(schema).toContain('"additionalProperties":false');
  });
});
