import type { ScheduleChangeCardProps } from './workflow-customer-schedule-change-card';
const customer = { name: 'Taylor', email: 'customer@example.test' };
const before = { date: 'Friday, November 27, 2026', arrivalWindow: '9 AM – 11 AM' };
export const scheduleChangeExamples: ScheduleChangeCardProps['examples'] = [
  { customer, before, after: { date: 'Monday, November 30, 2026', arrivalWindow: '1 PM – 3 PM' } },
  { customer, before, after: { ...before, arrivalWindow: '1 PM – 3 PM' } },
  { customer, before, after: null },
];
