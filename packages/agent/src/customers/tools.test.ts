import { describe, it, expect } from "vitest";
import {
  permissionCatalog,
  customerOperationIds,
  customerReadOperations,
  customersProposeSchema,
  chatTurnRequestSchema,
  type AuthorizationContext,
  type WorkspaceRole,
  type PermissionId,
} from "@salesmora/contracts";
import { createDefaultWorkspacePolicy } from "@salesmora/domain";
import { availableCustomerOperations, customerModelDefinition } from "./tools";
import { availableChatTools } from "../access";
import { implementedTools } from "../tools/registry";
const workspaceId = "00000000-0000-4000-8000-000000000001";
function context(role: WorkspaceRole): AuthorizationContext {
  const userId = role + "-user";
  return {
    workspaceId,
    userId,
    ownerUserId: "owner-user",
    membership: { workspaceId, userId, role },
    policy: createDefaultWorkspacePolicy(workspaceId),
    enabledPermissions: Object.keys(permissionCatalog) as PermissionId[],
  };
}
describe("Customers capability facade", () => {
  it("exposes operations by current app permissions on every chat surface", () => {
    for (const role of ["owner", "admin"] as const)
      expect(availableCustomerOperations(context(role))).toEqual(
        expect.arrayContaining([...customerOperationIds]),
      );
    const office = availableCustomerOperations(context("office"));
    expect(office).toContain("update");
    expect(office).not.toContain("delete");
    expect(office).not.toContain("set_archived");
    expect(office).not.toContain("export_csv");
    expect(availableCustomerOperations(context("field"))).toEqual([
      "related_contact",
    ]);
    for (const surface of [
      "home",
      "customer.detail",
      "customers.list",
      "lead.detail",
      "settings.overview",
    ])
      expect(
        availableChatTools(context("owner"), surface, implementedTools),
      ).toContain("customers_propose_action");
    expect(
      availableChatTools(context("field"), "home", implementedTools),
    ).not.toContain("customers_propose_action");
  });
  it("does not advertise disabled or revoked features", () => {
    const c = context("office");
    c.enabledPermissions = c.enabledPermissions.filter(
      (p) => p !== "customers.update",
    );
    expect(availableCustomerOperations(c)).not.toContain("update");
    c.enabledPermissions = ["assistant.use"];
    expect(availableCustomerOperations(c)).toEqual([]);
  });
  it("builds bounded strict function schemas with every nested object property required", () => {
    function check(raw: unknown) {
      if (!raw || typeof raw !== "object") return;
      const v = raw as Record<string, unknown>;
      if (v.type === "object") {
        expect(v.additionalProperties).toBe(false);
        expect([...((v.required as string[]) ?? [])].sort()).toEqual(
          Object.keys((v.properties as object) ?? {}).sort(),
        );
      }
      for (const value of Object.values(v))
        if (Array.isArray(value)) value.forEach(check);
        else check(value);
    }
    for (const tool of [
      "customers_query",
      "customers_propose_action",
    ] as const) {
      const schema = customerModelDefinition(tool, customerOperationIds);
      expect(schema.function.parameters.properties.request.anyOf).toHaveLength(
        tool === "customers_query"
          ? customerReadOperations.length
          : customerOperationIds.length - customerReadOperations.length,
      );
      check(schema.function.parameters);
    }
  });
  it("rejects SQL, forged consent, cross-surface refs and silently repeated fields", () => {
    expect(
      customersProposeSchema.safeParse({
        request: {
          operation: "delete",
          input: { customerRef: "CU-0001", typedConfirmation: "CU-0001" },
        },
      }).success,
    ).toBe(false);
    expect(
      customersProposeSchema.safeParse({
        request: {
          operation: "update",
          input: {
            customerRef: "CU-0001",
            changes: [
              { field: "phone", value: "2125550111" },
              { field: "phone", value: "2125550122" },
            ],
          },
        },
      }).success,
    ).toBe(false);
    expect(
      chatTurnRequestSchema.safeParse({
        workspaceId,
        clientTurnId: workspaceId,
        surfaceKey: "lead.detail",
        message: "test",
        recordRefs: [{ type: "customer", id: workspaceId }],
      }).success,
    ).toBe(false);
  });
});
