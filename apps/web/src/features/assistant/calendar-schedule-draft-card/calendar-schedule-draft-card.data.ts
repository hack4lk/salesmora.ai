import type { CalendarScheduleProposal, CalendarScheduleReviewContext } from './calendar-schedule-draft-card.types';
import { calendarEventCardData as visit } from '../../calendar/calendar-event-card/calendar-event-card.data';
export const calendarScheduleDraftCardData = {
  clear:{ title:'Review clearing this visit', heading:'Remove date and arrival window', confirm:'Confirm clear schedule',
    description:'Review every affected active record before clearing this visit. This proposal has not been saved.',
    sharedHelp:'Every active record listed below will lose its schedule together. To clear only a Work Order, cancel this proposal and separate its visit first.',
    impact:'Scheduled Jobs return to Needs Scheduling. Other active statuses are preserved. Assignments and completion deadlines stay unchanged.',
    confirmed:'Schedule cleared for all affected active records.',
  },
  title:'Review visit schedule', schedule:'Schedule visit', reschedule:'Reschedule visit',
  description:'Review the entire visit before confirming. This proposal has not been saved.',
  current:'Current schedule', proposed:'Proposed schedule', previous:'Previous schedule', saved:'Saved schedule', unscheduled:'Not scheduled', timezone:'Workspace timezone',
  affected:'Affected active records', people:'Assigned people', shared:'One shared visit · counted once',
  sharedHelp:'Every active record listed below will move together in one change. To move only a Work Order, cancel this proposal and separate its visit first.',
  history:'Completed and canceled records keep their historical schedule.',
  unchanged:'Assignments and completion deadlines stay unchanged. Jobs in Needs Scheduling become Scheduled when the date is saved; other active statuses are preserved.',
  warningTitle:'Review scheduling warnings', warningHelp:'These warnings do not block confirmation. Arrival windows do not represent the full work duration or confirmed availability.',
  expires:'Proposal expires', noChange:'The proposed date and arrival window are already set. Nothing needs to change.',
  confirm:'Confirm schedule', cancel:'Cancel proposal', saving:'Submitting your decision…', awaiting:'Checking the latest proposal status…',
  failure:'Your decision could not be submitted. Try again or ask for a fresh proposal.',
  states:{ pending:'Nothing changes until you confirm.', confirmed:'Schedule saved for all affected active records.', cancelled:'Proposal canceled. Nothing changed.', expired:'This proposal expired. Ask for a fresh schedule proposal.', superseded:'A newer proposal replaced this one. Review the latest proposal.', conflict:'The visit or its affected records changed. Ask for a fresh proposal before confirming.', unavailable:'This schedule proposal is unavailable with your current access. Ask the assistant to check again.', loading:'Checking the current visit and scheduling permissions…', error:'The schedule proposal could not be reviewed. Ask for a fresh proposal.' },
  stories:{ heading:'Visit scheduling in the assistant', notice:'Design preview. All records are fictional; confirmation changes this preview only.',
    today:'2026-10-27', from:'2026-10-28', to:'2026-10-29', timezone:'America/New_York',
    overlap:'Sam Rivera has another visit with an intersecting arrival window.', busy:'Alex Chen would have 4 visits on this date.', unknown:'One other visit has no arrival window. Timing cannot be fully checked.',
    past:'The proposed date is in the past. You can still save it.', after:'The proposed date is after the Job completion deadline. You can still save it.',
    error:'The schedule could not be saved. Your proposal is preserved.', revoke:'Simulate scheduling access removed', longWarning:'The assigned team has several visits at different sites on this date. Review the complete permitted schedule and travel arrangements before confirming this change.',
  },
} as const;
export function calendarScheduleProposalFixture(now = Date.now()): CalendarScheduleProposal & { intent?: 'schedule'; to: { scheduledDate: string; arrivalWindow: CalendarScheduleProposal['from']['arrivalWindow'] } } {
  return { id:'00000000-0000-4000-8000-000000000001', inputHash:'a'.repeat(64), visitId:'00000000-0000-4000-8000-000000000002', revision:'b'.repeat(64),
    createdAt:new Date(now - 60000).toISOString(), expiresAt:new Date(now + 840000).toISOString(), state:'pending',
    timezone:calendarScheduleDraftCardData.stories.timezone,
    from:{ scheduledDate:calendarScheduleDraftCardData.stories.from,arrivalWindow:'09:00-11:00' },
    to:{ scheduledDate:calendarScheduleDraftCardData.stories.to,arrivalWindow:'12:00-14:00' },
    records:[{ type:'job',id:'00000000-0000-4000-8000-000000000003',number:'J-1042',title:visit.stories.title,status:'scheduled',expectedVersion:2 },
      { type:'work_order',id:'00000000-0000-4000-8000-000000000004',number:'WO-1007',title:visit.stories.workOrderTitle,status:'issued',expectedVersion:3 }],
    crew:[{ id:'sam',name:visit.stories.sam },{ id:'alex',name:visit.stories.alex },{ id:'sam',name:visit.stories.sam }], warnings:[],
  };
}
export function calendarScheduleContextFixture(draft: CalendarScheduleProposal): CalendarScheduleReviewContext {
  return { proposalId:draft.id,inputHash:draft.inputHash,visitId:draft.visitId,revision:draft.revision,records:draft.records.map(r => ({ type:r.type,id:r.id,expectedVersion:r.expectedVersion })),read:true,canSchedule:true };
}

/** Presentation fixture only; the current live proposal API still accepts schedule/reschedule only. */
export function calendarClearProposalFixture(now = Date.now()): CalendarScheduleProposal {
  return { ...calendarScheduleProposalFixture(now),intent:'clear',to:{ scheduledDate:null,arrivalWindow:null } };
}
