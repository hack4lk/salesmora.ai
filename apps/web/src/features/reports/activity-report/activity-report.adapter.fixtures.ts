import { activityReportResultSchema, type ActivityReportQuery, type ActivityReportResult } from '@salesmora/contracts';
import { activityReportResponse, activityReportToday, activityReportTimezone, authorizedActivityEvents } from './activity-report.fixtures';
import { activityEventDateInTimezone } from './activity-report.validation';

export const activityBackendWorkspaceId = '00000000-0000-4000-8000-000000000001';
export const activityBackendScopeKey = 'activity-backend-workspace-authority';
export const activityBackendDomains: ActivityReportResult['includedDomains'] = [
  { domain: 'lead', scope: 'workspace', archiveVisibility: 'included' },
  { domain: 'customer', scope: 'workspace', archiveVisibility: 'included' },
  { domain: 'job', scope: 'workspace', archiveVisibility: 'not-applicable' },
  { domain: 'estimate', scope: 'workspace', archiveVisibility: 'included' },
  { domain: 'work-order', scope: 'workspace', archiveVisibility: 'included' },
];
const uuid = (value: number) => `00000000-0000-4000-8000-${String(value).padStart(12, '0')}`;
const identities = [...new Set(authorizedActivityEvents.flatMap(row => [row.eventId, row.recordId, row.actor.key]))];
function identity(value: string) {
  const index = identities.indexOf(value);
  if (index < 0) throw new Error('Unknown Activity mock identity.');
  return uuid(index + 100);
}
export const activityBackendEvents = authorizedActivityEvents.map(row => ({
  ...row, eventId: identity(row.eventId), recordId: identity(row.recordId),
  recordLabel: row.domain === 'estimate' ? 'Estimate EST-0022 / revision 1 / Kitchen remodel'
    : row.domain === 'work-order' ? 'Work Order WO-0304 / Drain repair'
      : row.domain === 'customer' ? 'Customer CU-0204 / Morgan Ellis' : row.recordLabel,
  actor: row.domain === 'customer' ? { kind: 'member' as const, key: 'unavailable-actor', label: 'Former or unavailable actor' }
    : row.actor.kind === 'system' ? row.actor : { ...row.actor, key: `member:${identity(row.actor.key)}` },
}));

/** Reuse the canonical fictional aggregation, deriving options before selected facets. */
export function activityBackendResponse(request: ActivityReportQuery, input: {
  includedDomains?: ActivityReportResult['includedDomains']; rows?: typeof activityBackendEvents;
} = {}): ActivityReportResult {
  const includedDomains = input.includedDomains ?? activityBackendDomains;
  const rows = (input.rows ?? activityBackendEvents).filter(row => includedDomains.some(item => item.domain === row.domain));
  const period = { preset: 'custom' as const, from: request.period.from, to: request.period.to };
  const base = activityReportResponse({ rows, period, filters: request.filters, pageSize: request.pageSize });
  const page = Math.min(request.page, Math.max(1, Math.ceil(base.total / request.pageSize)));
  const result = activityReportResponse({ rows, period, filters: request.filters, page, pageSize: request.pageSize });
  const periodRows = rows.filter(row => {
    const date = activityEventDateInTimezone(row.occurredAt, activityReportTimezone);
    return date >= request.period.from && date <= request.period.to;
  });
  return activityReportResultSchema.parse({
    workspaceId: request.workspaceId, view: 'activity', from: result.from, to: result.to,
    today: activityReportToday, timezone: activityReportTimezone, asOf: '2026-11-06T10:00:00Z',
    scopeLabel: 'Native events on currently authorized surviving parents. Events are not unique business actions or productivity.',
    includedDomains, omittedDomains: activityBackendDomains.filter(item => !includedDomains.some(domain => domain.domain === item.domain))
      .map(item => ({ domain: item.domain, reason: 'permissions' })),
    filters: request.filters,
    options: { domains: includedDomains.map(item => item.domain),
      actions: [...new Set(periodRows.map(row => row.action))].sort(),
      actors: [...new Map(periodRows.map(row => [row.actor.key, { value: row.actor.key, label: row.actor.label }])).values()]
        .sort((a, b) => a.value < b.value ? -1 : a.value > b.value ? 1 : 0) },
    total: result.total, rows: result.rows, page, pageSize: request.pageSize,
  });
}
