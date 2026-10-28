import { calendarScheduleTargets } from '../../calendar/calendar-schedule-dialog/calendar-schedule-dialog.data';
export const workOrderVisitDialogData = {
  join: 'Join Job’s visit', separate: 'Move to a separate visit',
  joinDescription: 'Move this Work Order onto its Job’s existing visit. Review both visits before confirming.',
  separateDescription: 'Give this Work Order its own visit. The original visit and its other records stay unchanged.',
  review: 'Review visit change', confirmJoin: 'Confirm join visit', confirmSeparate: 'Confirm separate visit', back: 'Back to editing',
  current: 'Current Work Order visit', proposed: 'Proposed Work Order visit', timezone: 'Workspace timezone',
  date: 'Scheduled date', window: 'Arrival window (optional)', noWindow: 'No arrival window', unscheduled: 'Leave unscheduled', noDate: 'Not scheduled',
  affected: 'Work Order moving', remains: 'Records staying on the original visit', target: 'Records already on the Job’s visit',
  joinHelp: 'Only this Work Order moves. Its date and arrival window will match the Job’s visit. Existing records keep their schedules.',
  separateHelp: 'Only this Work Order receives the proposed schedule. The original visit’s date and arrival window stay unchanged.',
  unchanged: 'Assignments, completion deadlines and statuses stay unchanged.',
  denied: 'This change is unavailable with your current access or these visits’ state. No records will be changed.',
  loading: 'Loading current visit details…', error: 'Visit details could not be loaded. Reload before reviewing this change.', reload: 'Reload visits',
  history: 'Completed and canceled records keep their historical schedules.', summary: 'Visit change summary',
  stories: { today: '2026-10-22', nextDate: '2026-10-23', failure: 'The change could not be saved. Your draft is preserved.',
    launch: 'Manage Work Order visit', changedRevision: 'updated-review', longTitle: 'Inspect and replace the kitchen supply lines, valves and dishwasher connection in the rear extension' },
} as const;
export const workOrderVisitDialogFixtures = {
  workOrder: { id: 'preview-wo-1', jobId: 'preview-job-1', number: 'WO-1007', title: 'Replace kitchen shutoff valves' },
  independent: calendarScheduleTargets[2], job: calendarScheduleTargets[1].scheduledDate ? calendarScheduleTargets[1] : { ...calendarScheduleTargets[1], scheduledDate: '2026-10-22', records: [{ ...calendarScheduleTargets[1].records[0], type: 'job' as const, status: 'scheduled' as const }] },
  shared: calendarScheduleTargets[0],
};
