import { describe, expect, it } from 'vitest';
import { calendarClearProposalFixture, calendarScheduleProposalFixture, calendarScheduleContextFixture } from './calendar-schedule-draft-card.data';
import { reviewCalendarScheduleDraft } from './calendar-schedule-draft-card.preview';
import type { CalendarScheduleProposal } from './calendar-schedule-draft-card.types';
const now = Date.parse('2026-10-27T14:00:00.000Z'), draft = calendarScheduleProposalFixture(now), context = calendarScheduleContextFixture(draft);
const review = (value = draft,binding = context,time = now) => reviewCalendarScheduleDraft(value,binding,time);
describe('Calendar schedule review safeguards', () => {
  it('accepts the full current shared set in either order and does not derive authority from role or crew', () => {
    expect(review()).toMatchObject({ kind:'ready',expired:false,unchanged:false });
    expect(review(draft,{ ...context,records:[...context.records].reverse() })).toMatchObject({ kind:'ready' });
    expect(review(draft,{ ...context,canSchedule:false })).toEqual({ kind:'unavailable' });
    expect(review(draft,{ ...context,read:false })).toEqual({ kind:'unavailable' });
    expect(reviewCalendarScheduleDraft(draft,null,now)).toEqual({ kind:'unavailable' });
  });
  it.each([
    { proposalId:'different' },{ inputHash:'c'.repeat(64) },{ visitId:'different' },{ revision:'c'.repeat(64) },
    { records:context.records.slice(0,1) },{ records:[context.records[0],context.records[0]] },
    { records:context.records.map((r,i) => ({ ...r,expectedVersion:r.expectedVersion + i })) },
  ])('blocks stale or incomplete independent bindings: %j', patch => {
    expect(review(draft,{ ...context,...patch })).toEqual({ kind:'conflict' });
  });
  it('expires at the exact deadline, rejects future/invalid/overlong proposal windows', () => {
    expect(review(draft,context,Date.parse(draft.expiresAt) - 1)).toMatchObject({ kind:'ready',expired:false });
    expect(review(draft,context,Date.parse(draft.expiresAt))).toMatchObject({ kind:'ready',expired:true });
    expect(review(draft,context,Date.parse(draft.createdAt) - 1)).toEqual({ kind:'error' });
    expect(review({ ...draft,expiresAt:'invalid' })).toEqual({ kind:'error' });
    expect(review({ ...draft,expiresAt:new Date(now + 900000).toISOString() })).toEqual({ kind:'error' });
  });
  it('rejects clearing, invalid dates and dates with a window but no scheduled day', () => {
    for (const to of [{ scheduledDate:'2026-02-30',arrivalWindow:null },{ scheduledDate:null,arrivalWindow:null },{ scheduledDate:null,arrivalWindow:'09:00-11:00' }]) {
      expect(review({ ...draft,to:to as typeof draft.to })).toEqual({ kind:'error' });
    }
    expect(review({ ...draft,from:{ scheduledDate:null,arrivalWindow:'09:00-11:00' } })).toEqual({ kind:'error' });
  });
  it('blocks duplicate or closed records instead of silently omitting them from confirmation', () => {
    expect(review({ ...draft,records:[draft.records[0],draft.records[0]] })).toEqual({ kind:'error' });
    expect(review({ ...draft,records:[] })).toEqual({ kind:'error' });
    expect(review({ ...draft,records:[{ ...draft.records[0],type:'job',status:'completed' }] })).toEqual({ kind:'error' });
    expect(review({ ...draft,records:[{ ...draft.records[1],type:'work_order',status:'canceled' }] })).toEqual({ kind:'error' });
  });
  it('detects no-op proposals without preventing a window-only change', () => {
    expect(review({ ...draft,to:{ scheduledDate:draft.from.scheduledDate!,arrivalWindow:draft.from.arrivalWindow } })).toMatchObject({ kind:'ready',unchanged:true });
    expect(review({ ...draft,to:{ ...draft.to,scheduledDate:draft.from.scheduledDate! } })).toMatchObject({ kind:'ready',unchanged:false });
  });
});

describe('Explicit clear-schedule presentation', () => {
  const clear = calendarClearProposalFixture(now), binding = calendarScheduleContextFixture(clear);
  it('requires an explicit clear intent, an existing date and both target values removed', () => {
    expect(reviewCalendarScheduleDraft(clear,binding,now)).toMatchObject({ kind:'ready',unchanged:false });
    for (const patch of [
      { intent:undefined },{ intent:'schedule' },{ intent:'unknown' },
      { to:{ scheduledDate:null,arrivalWindow:'09:00-11:00' } },
      { to:draft.to },{ from:{ scheduledDate:null,arrivalWindow:null } },
      { warnings:['An irrelevant overlap warning'] },
    ]) expect(reviewCalendarScheduleDraft({ ...clear,...patch } as CalendarScheduleProposal,binding,now)).toEqual({ kind:'error' });
  });
  it('still requires every active record, current scheduling access and an unexpired proposal', () => {
    expect(reviewCalendarScheduleDraft(clear,{ ...binding,records:binding.records.slice(0,1) },now)).toEqual({ kind:'conflict' });
    expect(reviewCalendarScheduleDraft(clear,{ ...binding,canSchedule:false },now)).toEqual({ kind:'unavailable' });
    expect(reviewCalendarScheduleDraft({ ...clear,records:[{ ...clear.records[0],type:'job',status:'completed' }] },binding,now)).toEqual({ kind:'error' });
    expect(reviewCalendarScheduleDraft(clear,binding,Date.parse(clear.expiresAt))).toMatchObject({ kind:'ready',expired:true });
  });
});
