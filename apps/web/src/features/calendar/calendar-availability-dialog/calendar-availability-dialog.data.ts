import type { CalendarAvailability, CalendarWeeklyHours } from '@salesmora/contracts';

export const emptyCalendarWeek: CalendarWeeklyHours = { monday: null, tuesday: null, wednesday: null, thursday: null, friday: null, saturday: null, sunday: null };
export const calendarAvailabilityDialogData = {
  title: 'Working hours & unavailable dates',
  description: (name: string) => `Set when ${name} can be scheduled.`,
  timezone: (zone: string) => `All times and dates use ${zone}.`,
  week: 'Weekly hours', setWeek: 'Set weekly hours',
  unknown: 'Hours not recorded. Availability is unknown.',
  allOff: 'No working days selected. This person cannot be booked automatically.',
  weekdays: { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday' },
  start: 'Start', finish: 'Finish', off: 'Not working',
  unavailable: 'Unavailable dates', unavailableHelp: 'Full days off, including both dates. For one day, use the same start and end date.',
  noDates: 'No unavailable dates recorded.', from: 'From', through: 'Through',
  add: 'Add dates', removeLabel: 'Remove', remove: (index: number) => `Remove unavailable dates ${index + 1}`,
  range: (index: number) => `Unavailable dates ${index + 1}`,
  invalidHours: 'Choose a start and a later finish for each selected day.',
  invalidDates: 'Choose valid dates, with the end on or after the start. Combine overlapping ranges.',
  unchanged: 'Existing visits stay as scheduled.', save: 'Save availability',
  conflict: 'Availability changed. Reload the latest values before saving.',
  readOnly: 'You can view availability. You don’t have permission to change it.',
  stories: { heading: 'Calendar', open: 'Edit availability', person: { id: 'person-alex', name: 'Alex Parker' }, revision: 'availability-1', timezone: 'America/New_York' },
} as const;
export const calendarAvailabilityExample: CalendarAvailability = {
  weeklyHours: { ...emptyCalendarWeek, ...Object.fromEntries(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(day => [day, { startTime: '08:00', endTime: '17:00' }])) },
  unavailableDates: [{ startDate: '2026-12-24', endDate: '2026-12-25' }],
};
