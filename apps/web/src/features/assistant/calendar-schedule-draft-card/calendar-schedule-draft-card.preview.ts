import { calendarChatVisitSchema, calendarScheduleSchema } from '@salesmora/contracts';
import { reviewAssistantProposalWindow } from '@salesmora/ui';
import type { CalendarScheduleProposal, CalendarScheduleReviewContext } from './calendar-schedule-draft-card.types';
/** Display checks only. The command host must reauthorize every active record and compare locked versions. */
export function reviewCalendarScheduleDraft(draft: CalendarScheduleProposal, context: CalendarScheduleReviewContext | null, now: number) {
  if (!context?.read || !context.canSchedule || draft.state === 'forbidden') return { kind:'unavailable' } as const;
  if (draft.state === 'conflict' || draft.state === 'superseded') return { kind:draft.state } as const;
  const records = draft.records.map(r => ({ type:r.type,id:r.id,number:r.number,title:r.title,status:r.status }));
  const window = reviewAssistantProposalWindow(draft.createdAt,draft.expiresAt,now);
  const valid = calendarChatVisitSchema.shape.id.safeParse(draft.id).success && calendarChatVisitSchema.shape.id.safeParse(draft.visitId).success &&
    /^[a-f0-9]{64}$/.test(draft.inputHash) && /^[a-f0-9]{64}$/.test(draft.revision) && window.valid &&
    calendarScheduleSchema.safeParse(draft.from).success && calendarScheduleSchema.safeParse(draft.to).success && (draft.intent === 'clear' ? !!draft.from.scheduledDate && draft.to.scheduledDate === null && draft.to.arrivalWindow === null && draft.warnings.length === 0 : (draft.intent === undefined || draft.intent === 'schedule') && !!draft.to.scheduledDate) &&
    calendarChatVisitSchema.shape.records.safeParse(records).success &&
    draft.records.every(r => Number.isSafeInteger(r.expectedVersion) && r.expectedVersion > 0 && !['completed','canceled'].includes(r.status)) &&
    new Set(draft.records.map(r => `${r.type}:${r.id}`)).size === draft.records.length &&
    draft.crew.every(p => !!p.id && !!p.name.trim() && p.name.length <= 200) &&
    draft.warnings.every(w => !!w.trim() && w.length <= 1000);
  let timezone = true;
  try { new Intl.DateTimeFormat('en-US',{ timeZone:draft.timezone }); } catch { timezone = false; }
  if (!valid || !timezone) return { kind:'error' } as const;
  const keys = (items: CalendarScheduleReviewContext['records']) => items.map(r => `${r.type}:${r.id}:${r.expectedVersion}`).sort();
  const expected = keys(draft.records), actual = keys(context.records);
  if (context.proposalId !== draft.id || context.inputHash !== draft.inputHash || context.visitId !== draft.visitId || context.revision !== draft.revision || expected.length !== actual.length || expected.some((key,i) => key !== actual[i])) return { kind:'conflict' } as const;
  return { kind:'ready', expires:window.expires!, expired:window.expired, unchanged:draft.from.scheduledDate === draft.to.scheduledDate && draft.from.arrivalWindow === draft.to.arrivalWindow } as const;
}
