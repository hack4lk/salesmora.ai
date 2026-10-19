import { describe, expect, it } from "vitest";
import {
  customerCreateSchema,
  customerMutationSchema,
  customerQuerySchema,
  customerExportSchema,
  customerValuesSchema,
} from "./customer";
const id = "00000000-0000-4000-8000-000000000001";
const values = {
  name: "  Jordan Lee  ",
  type: "business",
  companyName: "",
  email: "",
  phone: "",
  location: "",
  internalNotes: "",
  ownerId: "",
};
describe("customer boundaries", () => {
  it("requires a name, keeps company optional and validates contact lengths", () => {
    expect(customerValuesSchema.parse(values).name).toBe("Jordan Lee");
    expect(
      customerValuesSchema.safeParse({ ...values, name: " " }).success,
    ).toBe(false);
    for (const patch of [
      { email: "wrong" },
      { phone: "abc1234" },
      { phone: "123456" },
      { internalNotes: "x".repeat(4001) },
    ])
      expect(
        customerValuesSchema.safeParse({ ...values, ...patch }).success,
      ).toBe(false);
  });
  it("rejects generic writes, injected authority and incomplete link consent", () => {
    expect(
      customerCreateSchema.safeParse({
        workspaceId: id,
        submissionId: id,
        values,
        role: "owner",
      }).success,
    ).toBe(false);
    expect(
      customerMutationSchema.safeParse({
        workspaceId: id,
        submissionId: id,
        customerId: id,
        expectedVersion: 1,
        action: "sql",
        query: "delete from customers",
      }).success,
    ).toBe(false);
    expect(
      customerMutationSchema.safeParse({
        workspaceId: id,
        submissionId: id,
        customerId: id,
        expectedVersion: 1,
        action: "link",
        leadId: id,
      }).success,
    ).toBe(false);
  });
  it("bounds queries and CSV columns without coercing arbitrary input", () => {
    expect(customerQuerySchema.parse({ workspaceId: id })).toMatchObject({
      page: 1,
      pageSize: 25,
      sort: "name",
      archived: false,
    });
    for (const patch of [
      { pageSize: 50000 },
      { q: "x".repeat(201) },
      { archived: "false" },
      { relationship: "job" },
    ])
      expect(
        customerQuerySchema.safeParse({ workspaceId: id, ...patch }).success,
      ).toBe(false);
    expect(
      customerExportSchema.safeParse({
        query: { workspaceId: id },
        columns: ["internalNotes"],
        expectedCount: 1,
      }).success,
    ).toBe(false);
    expect(
      customerExportSchema.safeParse({
        query: { workspaceId: id },
        columns: ["name"],
        expectedCount: 50001,
      }).success,
    ).toBe(false);
  });
});
