import { describe, expect, it } from 'vitest';
import { calendarReportQuerySchema } from '@salesmora/contracts';
import { initialCalendarQuery, calendarReadResponse } from './calendar-read.fixtures';
import { adaptCalendarReadResponse, calendarReportScopeKey, visibleCalendarRecord } from './calendar-read.adapter';
import { calendarReportRequest } from './calendar-report-workspace.adapter';

const initial = calendarReadResponse(initialCalendarQuery);
const input = { request: initialCalendarQuery, scopeKey: calendarReportScopeKey(initial), today: initial.report.today, timezone: initial.report.timezone };
describe('Calendar read authority adaptation', () => {
  it('projects all native views and strict dated/undated filter drafts', () => {
    const filters = { dated: { participants: ['blair'], recordTypes: ['work_order'] },
      unscheduled: { participants: ['alex'], recordTypes: ['job'] } };
    for (const view of ['scheduled', 'review', 'unscheduled'] as const) {
      const range = { from: '2026-11-01', to: '2026-11-11', count: 11 };
      const request = calendarReportRequest({ workspaceId: initial.workspaceId, view, filters, range,
        evidence: { scheduled: 'visits', review: 'past', unscheduled: 'jobs' }, page: 1, pageSize: 25 });
      expect(request.filters).toEqual(view === 'unscheduled' ? filters.unscheduled : filters.dated);
      if ('period' in request) expect(request.period).not.toHaveProperty('count');
      else expect(request).not.toHaveProperty('period');
      expect(adaptCalendarReadResponse(calendarReadResponse(request), { ...input, request }).projection.view).toBe(view);
    }
  });
  it('rejects replaced viewer, workspace, policy, scope, request, date, clock and facet authority', () => {
    for (const change of [{ viewerId: 'another-user' }, { policyRevision: 2 },
      { workspaceId: '00000000-0000-4000-8000-000000000002' }, { scope: { kind: 'own', viewerId: 'alex' } },
      { query: { ...initial.query, page: 2 } }, { options: { ...initial.options, context: 'unscheduled' } }]) {
      expect(() => adaptCalendarReadResponse({ ...initial, ...change }, input)).toThrow();
    }
    expect(() => adaptCalendarReadResponse(initial, { ...input, today: '2026-11-07' })).toThrow();
    expect(() => adaptCalendarReadResponse(initial, { ...input, timezone: 'Europe/Warsaw' })).toThrow();
  });
  it('requires exact per-record attribution and returns navigation only for visible typed records', () => {
    if (initial.report.view !== 'calendar-scheduled' || initial.report.evidence.kind !== 'visits') throw new Error('Expected visit evidence.');
    const visit = initial.report.evidence.rows[0]!;
    for (const record of visit.records) expect(visibleCalendarRecord(initial, record.recordId)).toMatchObject({ id: record.id, type: record.type });
    expect(visibleCalendarRecord(initial, '00000000-0000-4000-8000-000000009999')).toBeUndefined();
    const report = { ...initial.report, evidence: { kind: 'visits', rows: initial.report.evidence.rows.map(visit => ({
      ...visit, records: visit.records.map(record => ({ id: record.id, recordId: record.recordId, type: record.type, label: record.label })),
    })) } };
    expect(() => adaptCalendarReadResponse({ ...initial, report }, input)).toThrow();
    const request = calendarReportQuerySchema.parse({ ...initial.query, selected: 'busy-person-days' });
    expect(visibleCalendarRecord(calendarReadResponse(request), visit.records[0]!.id)).toBeUndefined();
  });
  it('keeps own scope tied to the session viewer and withholds unrelated records', () => {
    const own = calendarReadResponse(initialCalendarQuery, { kind: 'own', viewerId: 'blair' });
    expect(adaptCalendarReadResponse(own, { ...input, scopeKey: calendarReportScopeKey(own) }).projection.state.kind).toBe('ready');
    expect(JSON.stringify(own.report)).not.toContain('"type":"job"');
    expect(() => adaptCalendarReadResponse({ ...own, viewerId: 'alex' }, { ...input, scopeKey: calendarReportScopeKey(own) })).toThrow();
  });
});
