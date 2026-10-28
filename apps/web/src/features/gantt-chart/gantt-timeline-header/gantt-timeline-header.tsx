'use client';

export type GanttTimelineHeaderProps = {
  startDate: string;
  totalDays: number;
  /** YYYY-MM-DD in the workspace timezone. */
  today: string;
};

/**
 * Renders one fixed-width date column per day, highlighting today.
 */
export function GanttTimelineHeader({ startDate, totalDays, today }: GanttTimelineHeaderProps) {
  return (
    <>
      {Array.from({ length: totalDays }).map((_, i) => {
        // Dates are YYYY-MM-DD (parsed as UTC), so step and format in UTC to avoid off-by-one days.
        const date = new Date(startDate);
        date.setUTCDate(date.getUTCDate() + i);
        const isToday = date.toISOString().split('T')[0] === today;

        return (
          <div
            key={i}
            data-today={isToday || undefined}
            className={`w-20 shrink-0 border-r border-line px-2 py-3 text-center text-xs font-semibold ${
              isToday ? 'bg-primary/5 text-primary-dark' : 'bg-paper text-muted'
            }`}
          >
            <div>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}</div>
            <div>{date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })}</div>
          </div>
        );
      })}
    </>
  );
}
