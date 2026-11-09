import { validCalendarReportFilters, type CalendarReportFiltersValue, type CalendarReportFiltersOptions,
  type CalendarReportFilterScope } from '../calendar-report-filters/calendar-report-filters';
import { validCalendarScheduledResult } from '../calendar-scheduled-report/calendar-scheduled-report.validation';
import { validCalendarReviewResult } from '../calendar-review-report/calendar-review-report.validation';
import { validCalendarUnscheduledResult } from '../calendar-unscheduled-report/calendar-unscheduled-report.validation';
import type { CalendarReportProjection } from './calendar-report-workspace';

/** Checks observed membership and snapshots, not unseen totals or actual authorization. */
export function validCalendarReportProjection(projection: CalendarReportProjection, filters: CalendarReportFiltersValue,
  options: CalendarReportFiltersOptions, scope: CalendarReportFilterScope, scopeKey: string, range: { from: string; to: string }): boolean {
  if (!scopeKey.trim() || projection.scopeKey !== scopeKey ||
    !validCalendarReportFilters(filters, options, scope) || !validCalendarReportFilters(projection.filters, options, scope) ||
    !(['participants', 'recordTypes'] as const).every(facet => filters[facet].length === projection.filters[facet].length &&
      projection.filters[facet].every(value => filters[facet].includes(value)))) return false;
  if (projection.state.kind !== 'ready') return true;
  let visits: readonly { id: string; participantIds: readonly string[]; records: readonly { id: string; type: 'job' | 'work_order' }[] }[];
  if (projection.view === 'scheduled' && projection.state.kind === 'ready') {
    if (!validCalendarScheduledResult(projection.state.result)) return false;
    visits = projection.state.result.evidence.kind === 'visits' ? projection.state.result.evidence.rows : [];
  } else if (projection.view === 'review' && projection.state.kind === 'ready') {
    if (!validCalendarReviewResult(projection.state.result)) return false;
    visits = projection.state.result.visits;
  } else if (projection.view === 'unscheduled' && projection.state.kind === 'ready') {
    if (!validCalendarUnscheduledResult(projection.state.result)) return false;
    visits = projection.state.result.visits;
  } else return false;
  const result = projection.state.result;
  if (result.scope.kind !== scope.kind || scope.kind === 'own' && (result.scope.kind !== 'own' || result.scope.viewerId !== scope.viewerId) ||
    result.members.some(member => options.participants !== undefined && !options.participants.some(option => option.value === member.id) ||
      filters.participants.length > 0 && !filters.participants.includes(member.id))) return false;
  if (projection.view !== 'unscheduled' && projection.state.kind === 'ready' &&
    (projection.state.result.from !== range.from || projection.state.result.to !== range.to)) return false;
  return projection.attribution.length === visits.length && new Set(projection.attribution.map(row => row.visitId)).size === visits.length &&
    projection.attribution.every(row => {
      const visit = visits.find(visit => visit.id === row.visitId);
      if (!visit || row.records.length !== visit.records.length ||
        new Set(row.records.map(record => JSON.stringify([record.type, record.id]))).size !== row.records.length) return false;
      const union = new Set(row.records.flatMap(record => record.participantIds));
      return union.size === visit.participantIds.length && visit.participantIds.every(id => union.has(id)) &&
        row.records.every(record => visit.records.some(observed => observed.type === record.type && observed.id === record.id) &&
          (options.recordTypes === undefined || options.recordTypes.some(option => option.value === record.type)) &&
          (filters.recordTypes.length === 0 || filters.recordTypes.includes(record.type)) &&
          new Set(record.participantIds).size === record.participantIds.length &&
          (filters.participants.length === 0 || record.participantIds.length > 0) &&
          record.participantIds.every(id => result.members.some(member => member.id === id) &&
            (filters.participants.length === 0 || filters.participants.includes(id)) &&
            (scope.kind !== 'own' || id === scope.viewerId)) &&
          (scope.kind !== 'own' || record.participantIds.length === 1));
    });
}
