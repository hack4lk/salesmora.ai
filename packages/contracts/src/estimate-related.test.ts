import { describe, expect, it } from "vitest";
import { relatedEstimatesQuerySchema, estimateCustomerParentsQuerySchema } from "./estimate-related";

const workspaceId = "11111111-1111-4111-8111-111111111111";
const recordId = "22222222-2222-4222-8222-222222222222";

describe("related estimate queries", () => {
  it.each(["lead", "job", "customer"])("requires an exact %s record and defaults to current visible revisions", (recordType) => {
    expect(relatedEstimatesQuerySchema.parse({ workspaceId, recordId, recordType })).toEqual({
      workspaceId, recordId, recordType, page: 1, includeHidden: false,
    });
  });
  it.each([
    { recordId: "" }, { recordId: "forged" }, { workspaceId: "" },
    { recordType: "all" }, { page: 0 }, { page: 1.5 }, { page: 100_001 },
    { includeHidden: "true" }, { extra: true },
  ])("rejects malformed related filters: %j", (patch) => {
    expect(relatedEstimatesQuerySchema.safeParse({ workspaceId, recordId, recordType: "job", ...patch }).success).toBe(false);
  });
  it("requires customer-constrained parent selection and bounded literal search", () => {
    expect(estimateCustomerParentsQuerySchema.parse({ workspaceId, customerId: recordId, type: "job", q: "  <script>%_  " }).q).toBe("<script>%_");
    expect(estimateCustomerParentsQuerySchema.safeParse({ workspaceId, type: "lead" }).success).toBe(false);
    expect(estimateCustomerParentsQuerySchema.safeParse({ workspaceId, customerId: recordId, type: "job", q: "a".repeat(201) }).success).toBe(false);
  });
});
