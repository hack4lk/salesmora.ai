import type { GanttJob } from './gantt-chart.types';

export const DAY_MS = 1000 * 60 * 60 * 24;

/** Pixel width of one day column. Must match the `w-20` class used by the header and rows. */
export const DAY_WIDTH_PX = 80;
export const MIN_TIMELINE_WIDTH_PX = 800;

const RANGE_PADDING_DAYS = 7;
const MIN_FUTURE_DAYS = 45;

const toMs = (date: string) => new Date(date).getTime();

export const addDays = (date: string, days: number) =>
  new Date(toMs(date) + days * DAY_MS).toISOString().split('T')[0];

export const getTotalDays = (startDate: string, endDate: string) =>
  Math.ceil((toMs(endDate) - toMs(startDate)) / DAY_MS);

export const getTimelineWidth = (startDate: string, endDate: string) =>
  Math.max(MIN_TIMELINE_WIDTH_PX, getTotalDays(startDate, endDate) * DAY_WIDTH_PX);

/**
 * Resolves the days an item occupies. An item with only one date occupies that single day,
 * and an end before the start collapses to the start.
 */
export const getItemDates = (start: string | null, end: string | null) => {
  const first = start ?? end;
  if (!first) return null;
  const last = end ?? first;
  return { start: first, end: last < first ? first : last };
};

/**
 * Returns the left offset and width (as percentages of the visible range) for a bar.
 * The end day is inclusive, and the bar is clamped so items that start before or end
 * after the range still render.
 */
export const getBarPosition = (
  itemStart: string,
  itemEnd: string,
  rangeStart: string,
  rangeEnd: string,
) => {
  const rangeStartMs = toMs(rangeStart);
  const rangeMs = toMs(rangeEnd) - rangeStartMs;
  const leftPercent = Math.max(0, ((toMs(itemStart) - rangeStartMs) / rangeMs) * 100);
  const rightPercent = Math.min(100, ((toMs(itemEnd) + DAY_MS - rangeStartMs) / rangeMs) * 100);

  return { leftPercent, widthPercent: Math.max(0, rightPercent - leftPercent) };
};

/** Picks a visible range that covers every scheduled date, today, and some padding. */
export const getGanttRange = (jobs: readonly GanttJob[], today: string) => {
  const dates = jobs.flatMap((job) => [
    job.scheduledDate,
    job.completionDeadline,
    ...job.workOrders.flatMap((order) => [order.scheduledDate, order.completionDate]),
  ]).filter((date): date is string => !!date);

  const earliest = [today, ...dates].reduce((a, b) => (a < b ? a : b));
  const latest = [addDays(today, MIN_FUTURE_DAYS), ...dates].reduce((a, b) => (a > b ? a : b));

  return { startDate: addDays(earliest, -RANGE_PADDING_DAYS), endDate: addDays(latest, RANGE_PADDING_DAYS) };
};

export const GANTT_PRESET_DAYS = [30, 60, 90] as const;
export const MAX_RANGE_DAYS = 366;

export type GanttRange = { startDate: string; endDate: string };
export type GanttRangeError = 'missing' | 'order' | 'tooLong';

/** A preset starts today and covers the given number of days, so its inclusive end is days - 1 after today. */
export const getPresetRange = (today: string, days: number): GanttRange => ({
  startDate: today,
  endDate: addDays(today, days - 1),
});

/** Validates a user-chosen range whose start and end are both inclusive. */
export const getRangeError = (startDate: string, endDate: string): GanttRangeError | null => {
  if (!startDate || !endDate) return 'missing';
  if (endDate < startDate) return 'order';
  if (getTotalDays(startDate, endDate) + 1 > MAX_RANGE_DAYS) return 'tooLong';
  return null;
};
