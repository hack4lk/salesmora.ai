import { leadSourceQuerySchema, leadSourceResultSchema, type LeadSourceQuery } from '@salesmora/contracts';
import type { LeadReportFiltersValue } from '../lead-report-filters/lead-report-filters';
import { formatReportDate } from '../report-date-controls/report-date-controls.validation';
import type { LeadSourceReportState } from './lead-source-report';
import { validLeadSourceResult, type LeadSourceResult } from './lead-source-report.validation';

const selections = {
  'source-cohort': 'cohort',
  'source-converted': 'converted',
  'source-accepted-value': 'accepted-estimates',
} as const;

/** Sources currently support creation periods, not the workspace's Lead facet draft. */
export function leadSourceReportRequest(input: {
  workspaceId: string; range: { from: string; to: string }; evidenceId: string;
  page: number; pageSize: number; filters: LeadReportFiltersValue;
}): LeadSourceQuery {
  if (input.filters.stages.length || input.filters.owners.length || input.filters.sources.length) {
    throw new Error('Source report facets are not supported by the current backend. Clear the filters before requesting Sources.');
  }
  const selected = Object.entries(selections).find(([id]) => id === input.evidenceId)?.[1];
  if (!selected) throw new Error('The selected source report evidence is not supported.');
  return leadSourceQuerySchema.parse({
    workspaceId: input.workspaceId, view: 'lead-source', period: { from: input.range.from, to: input.range.to },
    selected, page: input.page, pageSize: input.pageSize,
  });
}

/** Current host authority is checked before exposing a ready canonical projection. */
export function adaptLeadSourceReportResponse(raw: unknown, input: {
  request: LeadSourceQuery; scopeKey: string; scope: 'workspace' | 'assigned';
  archiveVisibility: 'included' | 'excluded'; canReadConversion: boolean; canReadAcceptedValue: boolean;
}): { view: 'source'; scopeKey: string; state: LeadSourceReportState } {
  const request = leadSourceQuerySchema.parse(input.request);
  const response = leadSourceResultSchema.parse(raw);
  if (!input.scopeKey.trim() || response.workspaceId !== request.workspaceId ||
    response.from !== request.period.from || response.to !== request.period.to ||
    response.evidence.kind !== request.selected || response.pageSize !== request.pageSize ||
    response.page !== Math.min(request.page, Math.max(1, Math.ceil(response.evidenceTotal / response.pageSize))) ||
    response.scope !== input.scope || response.archiveVisibility !== input.archiveVisibility ||
    !input.canReadConversion && response.conversion.kind === 'available' ||
    !input.canReadAcceptedValue && response.acceptedValue.kind === 'available') {
    throw new Error('Source report results do not match the current request or authority. Retry the report.');
  }
  const result: LeadSourceResult = {
    from: response.from, to: response.to, today: response.today,
    periodLabel: `${formatReportDate(response.from)} - ${formatReportDate(response.to)}`,
    snapshotLabel: `Current authorized source cohort / ${new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium', timeStyle: 'short', timeZone: response.timezone,
    }).format(new Date(response.asOf))} (${response.timezone})`,
    scopeLabel: `${response.scopeLabel} ${response.archiveVisibility === 'included'
      ? 'Authorized archived Leads included.' : 'Archived Leads excluded by current access.'}`,
    cohort: response.cohort, cohortEvidenceId: 'source-cohort',
    conversion: response.conversion.kind === 'available'
      ? { kind: 'available', converted: response.conversion.converted, evidenceId: 'source-converted' }
      : { kind: 'unavailable' },
    acceptedValue: response.acceptedValue.kind === 'available'
      ? { ...response.acceptedValue, evidenceId: 'source-accepted-value' }
      : { kind: 'unavailable', explanation: response.acceptedValue.explanation },
    groups: response.groups, evidence: response.evidence, page: response.page, pageSize: response.pageSize,
  };
  if (!validLeadSourceResult(result, input.canReadConversion, input.canReadAcceptedValue)) {
    throw new Error('Source report groups, values and evidence cannot be displayed consistently. Retry the report.');
  }
  return { view: 'source', scopeKey: input.scopeKey, state: { kind: 'ready', result } };
}
