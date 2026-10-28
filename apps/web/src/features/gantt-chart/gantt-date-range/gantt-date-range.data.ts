import { MAX_RANGE_DAYS } from '../gantt-timeline';

export const ganttDateRangeData = {
  legend: 'Date range',
  presets: 'Quick ranges',
  preset: (days: number) => `Next ${days} days`,
  from: 'From',
  to: 'To',
  errors: {
    missing: 'Choose both a start and an end date.',
    order: 'The end date must be on or after the start date.',
    tooLong: `Choose a range of ${MAX_RANGE_DAYS} days or fewer.`,
  },
  stories: {
    heading: 'Gantt date range',
    description: 'Component preview · Quick ranges and custom start and end dates',
    today: '2026-10-21',
    custom: { startDate: '2026-10-01', endDate: '2026-12-15' },
  },
} as const;
