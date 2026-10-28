import type { CalendarRecordRef } from "@salesmora/contracts";

export class CalendarRevisionError extends Error {
  constructor() { super("The visit changed. Reload and review its current records before confirming."); }
}
/** Call only with the complete server-loaded active set, never a permission-filtered UI projection. */
export function assertCalendarRevision(
  currentVersion: number, expectedVersion: number,
  current: readonly CalendarRecordRef[], expected: readonly CalendarRecordRef[],
) {
  const keys = (records: readonly CalendarRecordRef[]) => records.map(record => `${record.type}:${record.id}:${record.expectedVersion}`).sort();
  const identities = (records: readonly CalendarRecordRef[]) => new Set(records.map(record => `${record.type}:${record.id}`)).size;
  const actual = keys(current), reviewed = keys(expected);
  if (currentVersion !== expectedVersion || !actual.length || identities(current) !== actual.length ||
      identities(expected) !== reviewed.length || actual.length !== reviewed.length || actual.some((key, i) => key !== reviewed[i])) {
    throw new CalendarRevisionError();
  }
}
