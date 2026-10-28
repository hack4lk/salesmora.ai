import { expect, it } from "vitest";
import { calendarSchedulingGrants } from "../migrations/202610210002_calendar_commands";
const reads = [
  { role: "field", permission: "jobs.read", scope: "assigned" },
  { role: "field", permission: "workorders.read", scope: "assigned_job" },
];
it("only adopts Field defaults for uncustomized policies with the required read scopes", () => {
  expect(calendarSchedulingGrants(reads, false)).toEqual([
    { role: "field", permission: "jobs.schedule.update", scope: "assigned" },
    { role: "field", permission: "workorders.schedule.update", scope: "assigned_job" },
  ]);
  expect(calendarSchedulingGrants(reads, true)).toEqual([]);
  expect(calendarSchedulingGrants([], false)).toEqual([]);
});
it("carries existing non-Field scheduling authority forward without restoring revoked edit access", () => {
  const before = [{ role: "owner", permission: "workorders.update", scope: "workspace" }];
  expect(calendarSchedulingGrants(before, true)).toEqual([{ role: "owner", permission: "workorders.schedule.update", scope: "workspace" }]);
  expect(calendarSchedulingGrants([], true)).toEqual([]);
});
