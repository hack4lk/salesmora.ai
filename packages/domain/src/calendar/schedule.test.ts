import { describe, expect, it } from "vitest";
import type { CalendarRecordRef } from "@salesmora/contracts";
import { assertCalendarRevision, CalendarRevisionError } from "./schedule";
const job: CalendarRecordRef = { type: "job", id: "job", expectedVersion: 2 };
const order: CalendarRecordRef = { type: "work_order", id: "order", expectedVersion: 3 };
describe("Calendar review freshness", () => {
  it("accepts the full set regardless of display order", () => {
    expect(() => assertCalendarRevision(4, 4, [job, order], [order, job])).not.toThrow();
  });
  it("rejects stale visit or record versions and changed, hidden or empty membership", () => {
    const check = (actual: CalendarRecordRef[], expected: CalendarRecordRef[]) =>
      expect(() => assertCalendarRevision(4, 4, actual, expected)).toThrow(CalendarRevisionError);
    expect(() => assertCalendarRevision(5, 4, [job], [job])).toThrow(CalendarRevisionError);
    check([job, order], [job]); check([job], [job, order]); check([], []);
    check([job], [{ ...job, expectedVersion: 1 }]); check([job], [order]);
    check([job, { ...job, expectedVersion: 3 }], [job, { ...job, expectedVersion: 3 }]);
    check([job, job], [job, job]); check([job], [job, job]);
  });
});
