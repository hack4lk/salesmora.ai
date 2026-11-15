import { expect, it } from "vitest";
import { createDefaultWorkspacePolicy, validateWorkspacePolicy } from "@salesmora/domain";

it("sets scoped Calendar scheduling defaults without widening Field access", () => {
  const policy = createDefaultWorkspacePolicy("workspace");
  expect(policy.grants.filter(grant => grant.role === "field" &&
    ["jobs.schedule.update", "workorders.schedule.update"].includes(grant.permission))).toEqual([
    { role: "field", permission: "jobs.schedule.update", scope: "assigned" },
    { role: "field", permission: "workorders.schedule.update", scope: "assigned_job" },
  ]);
  expect(validateWorkspacePolicy(policy).ok).toBe(true);
});
