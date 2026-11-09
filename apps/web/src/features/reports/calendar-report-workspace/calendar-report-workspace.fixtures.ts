import { calendarScheduledResponse } from '../calendar-scheduled-report/calendar-scheduled-report.fixtures';
import { calendarReviewResponse, calendarReviewVisits } from '../calendar-review-report/calendar-review-report.fixtures';
import { calendarUnscheduledResponse, calendarUnscheduledVisits } from '../calendar-unscheduled-report/calendar-unscheduled-report.fixtures';
import type { CalendarScheduledResult } from '../calendar-scheduled-report/calendar-scheduled-report.validation';
import type { CalendarReviewResult } from '../calendar-review-report/calendar-review-report.validation';
import type { CalendarUnscheduledResult } from '../calendar-unscheduled-report/calendar-unscheduled-report.validation';
import type { CalendarReportFiltersOptions, CalendarReportFiltersValue, CalendarReportFilterScope } from '../calendar-report-filters/calendar-report-filters';
import type { CalendarReportAttribution, CalendarReportProjection, CalendarReportView } from './calendar-report-workspace';

export const calendarWorkspaceScopeKey = 'fictional-workspace:calendar:all:v1';
export const calendarWorkspaceRange = { from: '2026-11-01', to: '2026-11-11' };
export const calendarWorkspaceEmptyFilters: CalendarReportFiltersValue = { participants: [], recordTypes: [] };
export const calendarWorkspaceOptions: CalendarReportFiltersOptions = {
  participants: [{ value: 'alex', label: 'Alex' }, { value: 'blair', label: 'Blair' }],
  recordTypes: [{ value: 'job', label: 'Job' }, { value: 'work_order', label: 'Work Order' }],
};
export type CalendarWorkspaceEvidence = {
  scheduled: CalendarScheduledResult['evidence']['kind'];
  review: CalendarReviewResult['evidence']['kind'];
  unscheduled: CalendarUnscheduledResult['evidence']['kind'];
};
export const calendarWorkspaceDefaultEvidence: CalendarWorkspaceEvidence = { scheduled: 'visits', review: 'overlaps', unscheduled: 'visits' };

// Fictional current record membership: Blair is on W1 only, not the shared Job or W2.
const participants = (recordId: string) => recordId === 'workspace-fixture:W1' ? ['alex', 'blair', 'alex'] : ['alex'];
function matchingRecords<T extends { id: string; type: 'job' | 'work_order' }>(records: readonly T[], filters: CalendarReportFiltersValue,
  scope: CalendarReportFilterScope, options: CalendarReportFiltersOptions) {
  return records.filter(record =>
    (options.recordTypes === undefined || options.recordTypes.some(option => option.value === record.type)) &&
    (filters.recordTypes.length === 0 || filters.recordTypes.includes(record.type)))
    .map(record => ({ ...record, participantIds: [...new Set(participants(record.id))].filter(id =>
      (scope.kind !== 'own' || id === scope.viewerId) &&
      (options.participants === undefined || options.participants.some(option => option.value === id))) }))
    .filter(record => (scope.kind !== 'own' || record.participantIds.includes(scope.viewerId)) &&
      (filters.participants.length === 0 || record.participantIds.some(id => filters.participants.includes(id))))
    .map(record => ({ ...record, participantIds: record.participantIds.filter(id => filters.participants.length === 0 || filters.participants.includes(id)) }));
}

/** Mock query orchestration only. Apply record membership filters to the full source before all aggregates and pages. */
export function calendarWorkspaceResponse(view: CalendarReportView, filters = calendarWorkspaceEmptyFilters, settings: {
  scope?: CalendarReportFilterScope; scopeKey?: string; options?: CalendarReportFiltersOptions; range?: { from: string; to: string };
  evidence?: CalendarWorkspaceEvidence; page?: number; pageSize?: number;
} = {}): CalendarReportProjection {
  const { scope = { kind: 'workspace' }, scopeKey = calendarWorkspaceScopeKey, options = calendarWorkspaceOptions,
    range = calendarWorkspaceRange, evidence = calendarWorkspaceDefaultEvidence, page = 1, pageSize = 25 } = settings;
  const dated = calendarReviewVisits.map(visit => {
    const records = matchingRecords(visit.records, filters, scope, options);
    return { ...visit, records, participantIds: [...new Set(records.flatMap(record => record.participantIds))] };
  }).filter(visit => visit.records.length > 0);
  const queue = calendarUnscheduledVisits.map(visit => {
    const records = matchingRecords(visit.records, filters, scope, options);
    return { ...visit, records, participantIds: [...new Set(records.flatMap(record => record.participantIds))] };
  }).filter(visit => visit.records.length > 0);
  function attribution(ids: readonly string[], source: readonly { id: string; records: CalendarReportAttribution['records'] }[]) {
    return source.filter(visit => ids.includes(visit.id)).map(visit => ({ visitId: visit.id,
      records: visit.records.map(({ id, type, participantIds }) => ({ id, type, participantIds })) }));
  }
  const snapshot = { today: '2026-11-06', snapshotLabel: 'Current authorized schedule / November 6, 2026 at 09:00' };
  if (view === 'scheduled') {
    const result = { ...calendarScheduledResponse(dated, { ...range, kind: evidence.scheduled, scope, page, pageSize }), ...snapshot };
    const ids = result.evidence.kind === 'visits' ? result.evidence.rows.map(visit => visit.id) : [];
    return { view, filters, scopeKey, attribution: attribution(ids, dated), state: { kind: 'ready', result } };
  }
  if (view === 'review') {
    const result = { ...calendarReviewResponse(dated, { ...range, kind: evidence.review, today: snapshot.today, scope, page, pageSize }), ...snapshot };
    return { view, filters, scopeKey, attribution: attribution(result.visits.map(visit => visit.id), dated), state: { kind: 'ready', result } };
  }
  const result = { ...calendarUnscheduledResponse(queue, { kind: evidence.unscheduled, scope, page, pageSize }), ...snapshot };
  return { view, filters, scopeKey, attribution: attribution(result.visits.map(visit => visit.id), queue), state: { kind: 'ready', result } };
}
