import { calendarWeekdays, type CalendarAvailability } from '@salesmora/contracts';

function localParts(at: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(at);
  const value = (type: string) => parts.find(part => part.type === type)!.value;
  return { date: `${value('year')}-${value('month')}-${value('day')}`, time: `${value('hour')}:${value('minute')}` };
}
/** Deterministic manual warnings only; callers still need a complete, atomic check for automatic booking. */
export function calendarAvailabilityWarnings(input: {
  personName: string; availability: CalendarAvailability | null; timezone: string; scheduleTimezone: string;
  scheduledDate: string; planned?: { start: Date; finish: Date };
}) {
  const { personName: name, availability, timezone, planned } = input;
  const messages: string[] = [];
  if (!availability?.weeklyHours) messages.push(`${name} has no recorded working hours; availability is unknown.`);
  if (!planned && timezone !== input.scheduleTimezone) {
    messages.push(`Record planned work time to check ${name}’s availability in ${timezone}.`);
    return messages;
  }
  const start = planned ? localParts(planned.start, timezone) : { date: input.scheduledDate, time: '' };
  const end = planned ? localParts(planned.finish, timezone) : undefined;
  const lastDate = planned ? localParts(new Date(planned.finish.getTime() - 1), timezone).date : start.date;
  if (availability?.unavailableDates.some(range => range.startDate <= lastDate && range.endDate >= start.date))
    messages.push(`${name} has recorded unavailable dates during this visit (${timezone}).`);
  if (availability?.weeklyHours) {
    const weekday = calendarWeekdays[(new Date(start.date + 'T12:00:00Z').getUTCDay() + 6) % 7];
    const hours = availability.weeklyHours[weekday];
    if (!hours) messages.push(`${name} does not work on this day (${timezone}).`);
    else if (end && (end.date !== start.date || start.time < hours.startTime || end.time > hours.endTime))
      messages.push(`${name}’s planned work falls outside recorded working hours (${timezone}).`);
    else if (!planned) messages.push(`Record planned work time to check the full visit against ${name}’s working hours.`);
  }
  return messages;
}
