import { defaultDeadlineRuleSchema, jobDateSchema, type JobNotificationSettingsSnapshot } from '@salesmora/contracts';
import { addCalendarDays } from '../calendar/dates';
/** Date-only arithmetic. The caller supplies the authoritative workspace-local creation day. */
export function defaultJobDeadline(createdDate: string, raw: JobNotificationSettingsSnapshot['deadline']['values']): string | null {
  jobDateSchema.parse(createdDate);
  const rule = defaultDeadlineRuleSchema.parse(raw);
  if (rule.mode === 'unset') return null;
  if (rule.count === 'calendar') return jobDateSchema.parse(addCalendarDays(createdDate, rule.days));
  let date = createdDate, remaining = rule.days;
  while (remaining > 0) {
    date = jobDateSchema.parse(addCalendarDays(date, 1));
    const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
    if (weekday !== 0 && weekday !== 6) remaining--;
  }
  return date;
}
