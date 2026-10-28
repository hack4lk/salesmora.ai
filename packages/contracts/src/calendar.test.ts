import { describe, expect, it } from "vitest";
import { calendarScheduleCommandSchema, calendarScheduleSchema } from "./calendar";
const workspaceId = "00000000-0000-4000-8000-000000000001";
const id = "00000000-0000-4000-8000-000000000002";
const input = { workspaceId, visitId: id, submissionId: workspaceId, expectedVisitVersion: 1,
  records: [{ type: "job", id, expectedVersion: 2 }], schedule: { scheduledDate: "2026-11-01", arrivalWindow: "09:00-11:00" } };
describe("Calendar schedule contracts", () => {
  it("retains workspace-local dates across DST and accepts an explicit clear", () => {
    expect(calendarScheduleCommandSchema.parse(input).schedule.scheduledDate).toBe("2026-11-01");
    expect(calendarScheduleSchema.parse({ scheduledDate: null, arrivalWindow: null })).toEqual({ scheduledDate: null, arrivalWindow: null });
  });
  it("rejects impossible dates, arbitrary windows and a window without a date", () => {
    for (const schedule of [{ scheduledDate: "2026-02-30", arrivalWindow: null },
      { scheduledDate: null, arrivalWindow: "09:00-11:00" }, { scheduledDate: "2026-11-01", arrivalWindow: "09:15-11:15" }]) {
      expect(calendarScheduleSchema.safeParse(schedule).success).toBe(false);
    }
  });
  it("requires explicit nonempty, unique, versioned affected records", () => {
    for (const records of [[], [input.records[0], input.records[0]], [{ ...input.records[0], expectedVersion: 0 }]]) {
      expect(calendarScheduleCommandSchema.safeParse({ ...input, records }).success).toBe(false);
    }
    expect(calendarScheduleCommandSchema.safeParse({ ...input, expectedVisitVersion: 0 }).success).toBe(false);
    expect(calendarScheduleCommandSchema.safeParse({ ...input, sql: "arbitrary" }).success).toBe(false);
  });
});

import { calendarQueryFromURL, calendarQuerySchema } from './calendar';
it('accepts bounded Week queries and rejects impossible or mismatched filters', () => {
  expect(calendarQueryFromURL(workspaceId, new URLSearchParams('date=2026-11-01&queuePage=2')).queuePage).toBe(2);
  for (const patch of [{ view: 'month' }, { date: '2026-02-30' }, { queuePage: 0 }, { recordType: 'job', status: 'work_order:issued' }, { person: 'member:' }, { customerQuery: 'x'.repeat(201) }]) {
    expect(calendarQuerySchema.safeParse({ workspaceId, ...patch }).success).toBe(false);
  }
});
