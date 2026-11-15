import {
  calendarReportRequest, type CalendarReportRequest, adaptCalendarReportResponse,
} from './calendar-report-workspace.adapter';
import {
  calendarWorkspaceResponse, calendarWorkspaceOptions, calendarWorkspaceScopeKey,
} from './calendar-report-workspace.fixtures';
import type { CalendarReportFilterScope } from '../calendar-report-filters/calendar-report-filters';
import type { CalendarReportView } from './calendar-report-workspace';

export const calendarBackendWorkspaceId = '00000000-0000-4000-8000-000000000001';
function uuid(value: string) {
  const suffix = value.split(':')[1];
  const types = ['V', 'U', 'J', 'W'];
  const index = types.indexOf(suffix[0]!);
  if (index < 0 || !/^[VUJW]\d+$/.test(suffix)) throw new Error('Unknown Calendar mock identity.');
  return `00000000-0000-4000-8000-${String((index + 1) * 100 + Number(suffix.slice(1))).padStart(12, '0')}`;
}

/** Convert the established fictional aggregate to API-shaped fixtures without a second aggregation implementation. */
export function calendarBackendResponse(request: CalendarReportRequest, scope: CalendarReportFilterScope = { kind: 'workspace' }) {
  const view: CalendarReportView = request.view === 'calendar-scheduled' ? 'scheduled' : request.view === 'calendar-review' ? 'review' : 'unscheduled';
  const projection = calendarWorkspaceResponse(view, request.filters, {
    scope, range: 'period' in request ? request.period : undefined, page: request.page, pageSize: request.pageSize,
    evidence: {
      scheduled: request.view === 'calendar-scheduled' ? request.selected : 'visits',
      review: request.view === 'calendar-review' ? request.selected : 'overlaps',
      unscheduled: request.view === 'calendar-unscheduled' ? request.selected : 'visits',
    },
  });
  if (projection.state.kind !== 'ready') throw new Error('Calendar fixture did not return a ready projection.');
  const attribution = new Map(projection.attribution.map(row => [row.visitId, row.records]));
  function visits<T extends { id: string; records: readonly { id: string; type: 'job' | 'work_order' }[] }>(rows: readonly T[]) {
    return rows.map(visit => ({ ...visit, id: uuid(visit.id), records: visit.records.map(record => {
      const membership = attribution.get(visit.id)?.find(row => row.id === record.id && row.type === record.type);
      if (!membership) throw new Error('Calendar fixture record attribution is missing.');
      return { ...record, id: uuid(record.id), recordId: uuid(record.id), participantIds: [...membership.participantIds] };
    }) }));
  }
  const base = projection.state.result;
  const common = { workspaceId: request.workspaceId, today: base.today, timezone: base.timezone,
    asOf: '2026-11-06T14:00:00Z', scope: base.scope, scopeLabel: base.scopeLabel,
    counts: base.counts, members: base.members, filters: projection.filters, page: base.page, pageSize: base.pageSize };
  if (projection.view === 'scheduled' && projection.state.kind === 'ready') {
    const result = projection.state.result;
    return { ...common, view: 'calendar-scheduled', from: result.from, to: result.to, days: result.days,
      evidenceTotal: result.evidence.kind === 'visits' ? result.counts.visits : result.counts.busyPersonDays,
      evidence: result.evidence.kind === 'visits' ? { kind: 'visits', rows: visits(result.evidence.rows).map(visit => ({
        id: visit.id, label: visit.label, date: visit.date, participantIds: visit.participantIds, records: visit.records,
      })) } : result.evidence };
  }
  if (projection.view === 'review' && projection.state.kind === 'ready') {
    const result = projection.state.result;
    return { ...common, view: 'calendar-review', from: result.from, to: result.to, visits: visits(result.visits),
      evidenceTotal: result.evidence.kind === 'past' ? result.counts.pastVisits : result.counts.overlapPairs,
      evidence: result.evidence.kind === 'past' ? { kind: 'past', visitIds: result.evidence.visitIds.map(uuid) }
        : { kind: 'overlaps', rows: result.evidence.rows.map(row => ({ ...row, leftVisitId: uuid(row.leftVisitId), rightVisitId: uuid(row.rightVisitId) })) } };
  }
  if (projection.view !== 'unscheduled' || projection.state.kind !== 'ready') throw new Error('Unknown Calendar mock view.');
  const result = projection.state.result;
  return { ...common, view: 'calendar-unscheduled', visits: visits(result.visits), evidenceTotal: result.counts[result.evidence.kind],
    evidence: result.evidence.kind === 'visits' ? { kind: 'visits', visitIds: result.evidence.visitIds.map(uuid) }
      : { kind: result.evidence.kind, records: result.evidence.records.map(row => ({ visitId: uuid(row.visitId), recordId: uuid(row.recordId) })) } };
}

export function calendarBackendOptions(request: CalendarReportRequest, scope: CalendarReportFilterScope = { kind: 'workspace' }) {
  return { workspaceId: request.workspaceId, context: request.view === 'calendar-unscheduled' ? 'unscheduled' : 'dated',
    scope, recordTypes: calendarWorkspaceOptions.recordTypes,
    participants: scope.kind === 'own' ? [{ value: scope.viewerId, label: 'Me' }] : calendarWorkspaceOptions.participants };
}
export function calendarBackendProjection(input: Parameters<typeof calendarReportRequest>[0],
  scope: CalendarReportFilterScope = { kind: 'workspace' }, scopeKey = calendarWorkspaceScopeKey) {
  const request = calendarReportRequest(input);
  return adaptCalendarReportResponse(calendarBackendResponse(request, scope), calendarBackendOptions(request, scope), { request, scopeKey });
}
