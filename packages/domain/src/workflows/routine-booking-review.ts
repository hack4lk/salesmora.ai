import { calendarWeekdays, type WorkflowRoutineBookingValues } from '@salesmora/contracts';
import { calendarWorkTimeSummary } from '../calendar/work-time';
const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const clock = (value: string) => {
  const hour = Number(value.slice(0, 2)), minute = value.slice(3);
  return `${hour % 12 || 12}${minute === '00' ? '' : ':' + minute} ${hour < 12 ? 'AM' : 'PM'}`;
};
/** Compact deterministic wording shared by the future assistant and workflow editor. */
export function routineBookingReview(values: WorkflowRoutineBookingValues) {
  const days = calendarWeekdays.filter(day => values.rules.weekdays.includes(day));
  return {
    summary: `Book new unscheduled ${values.service} jobs for their assigned people.`,
    duration: calendarWorkTimeSummary({ startTime: '00:00', durationMinutes: values.rules.durationMinutes })!.duration,
    days: days.length === 7 ? 'Every day' : days.length === 5 && days.every((day, index) => day === calendarWeekdays[index]) ? 'Monday–Friday' : days.map(day => shortDays[calendarWeekdays.indexOf(day)]).join(', '),
    hours: `${clock(values.rules.hours.startTime)}–${clock(values.rules.hours.endTime)}`,
    gap: values.rules.gapMinutes ? `${values.rules.gapMinutes} minutes` : 'No gap',
    horizon: `${values.rules.horizonDays} calendar ${values.rules.horizonDays === 1 ? 'day' : 'days'}`,
  };
}
