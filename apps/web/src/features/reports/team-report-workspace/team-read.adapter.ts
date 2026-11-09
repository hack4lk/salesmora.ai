import { teamReportQuerySchema, teamReportReadResultSchema,
  type TeamReportQuery, type TeamReportReadResult, type TeamLeadsQuery, type TeamJobsQuery } from '@salesmora/contracts';
import { teamOpenLeadStages } from '../team-leads-report/team-leads-report.validation';
import { activeJobStatuses } from '../job-workload-report/job-workload-report.validation';
import type { TeamReportFiltersValue } from '../team-report-filters/team-report-filters';
import type { TeamReportProjection, TeamReportView } from './team-report-workspace';
import { validTeamReportProjection } from './team-report-workspace.validation';

export type TeamReportEvidence = { leads: TeamLeadsQuery['selected']; jobs: TeamJobsQuery['selected'] };
export const initialTeamEvidence: TeamReportEvidence = {
  leads: { kind: 'queue', queue: 'open' }, jobs: { kind: 'queue', queue: 'active' },
};
export function teamReportRequest(input: {
  workspaceId: string; view: TeamReportView; filters: TeamReportFiltersValue;
  evidence: TeamReportEvidence; page: number; pageSize: number;
}): TeamReportQuery {
  return teamReportQuerySchema.parse({ workspaceId: input.workspaceId,
    view: input.view === 'leads' ? 'team-leads' : 'team-jobs', selected: input.evidence[input.view],
    filters: input.filters, page: input.page, pageSize: input.pageSize });
}
export function teamReportScopeKey(result: TeamReportReadResult): string {
  return JSON.stringify([result.workspaceId, result.viewerId, result.policyRevision, result.authority, result.exportScopes]);
}
function leadEvidenceId(selected: TeamLeadsQuery['selected']): string {
  return JSON.stringify(['team-leads', selected]);
}
function jobEvidenceId(selected: TeamJobsQuery['selected']): string {
  return JSON.stringify(['team-jobs', selected]);
}
function jobWorkloadEvidence(selected: Extract<TeamJobsQuery['selected'], { kind: 'member' | 'unassigned' }>) {
  return {
    evidenceId: jobEvidenceId({ ...selected, filter: 'all' }),
    overdueEvidenceId: jobEvidenceId({ ...selected, filter: 'overdue' }),
    waitingEvidenceId: jobEvidenceId({ ...selected, filter: 'waiting' }),
    statusEvidenceIds: Object.fromEntries(activeJobStatuses.map(filter => [filter, jobEvidenceId({ ...selected, filter })])),
  };
}
export function adaptTeamReadResponse(raw: unknown, input: {
  request: TeamReportQuery; scopeKey: string; today: string; timezone: string;
}): { projection: TeamReportProjection; filterOptions: TeamReportReadResult['options']; availableViews: TeamReportView[] } {
  const request = teamReportQuerySchema.parse(input.request), parsed = teamReportReadResultSchema.safeParse(raw);
  if (!parsed.success) throw new Error('Team report data does not match the current request, authority or evidence. Reload the report.');
  const response = parsed.data, report = response.report;
  if (JSON.stringify(response.query) !== JSON.stringify(request) || teamReportScopeKey(response) !== input.scopeKey ||
    report.today !== input.today || report.timezone !== input.timezone) {
    throw new Error('Team report results no longer match this request or current authority. Reload the report.');
  }
  const clock = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: report.timezone });
  const snapshotLabel = `Current authorized Team / ${clock.format(new Date(report.asOf))} (${report.timezone})`;
  let projection: TeamReportProjection;
  if (report.view === 'team-leads') {
    const result = { ...report, snapshotLabel,
      inactivityCutoffLabel: `${report.inactivityCutoff} / exact database cutoff; display timezone ${report.timezone}`,
      evidenceIds: {
        open: leadEvidenceId({ kind: 'queue', queue: 'open' }), inactive: leadEvidenceId({ kind: 'queue', queue: 'inactive' }),
        ...(report.scope.kind === 'workspace' ? { unassigned: leadEvidenceId({ kind: 'queue', queue: 'unassigned' }) } : {}),
      },
      owners: report.owners.map(owner => ({ ...owner,
        evidenceId: leadEvidenceId({ kind: 'owner', id: owner.id }),
        inactiveEvidenceId: leadEvidenceId({ kind: 'owner', id: owner.id, inactiveOnly: true }),
        stageEvidenceIds: Object.fromEntries(teamOpenLeadStages.map(stage => [stage, leadEvidenceId({ kind: 'owner', id: owner.id, stage })])),
      })),
      rows: report.rows.map(row => ({ ...row, cells: { ...row.cells,
        created: clock.format(new Date(row.cells.created)), activity: clock.format(new Date(row.cells.activity)),
      } })),
    };
    projection = { view: 'leads', filters: request.filters, state: { kind: 'ready', result } };
  } else {
    const result = { ...report, snapshotLabel,
      evidenceIds: {
        active: jobEvidenceId({ kind: 'queue', queue: 'active' }), overdue: jobEvidenceId({ kind: 'queue', queue: 'overdue' }),
        waiting: jobEvidenceId({ kind: 'queue', queue: 'waiting' }),
        ...(report.scope.kind === 'workspace' ? { unassigned: jobEvidenceId({ kind: 'queue', queue: 'unassigned' }) } : {}),
      },
      members: report.members.map(member => ({ ...member,
        primary: { ...member.primary, ...jobWorkloadEvidence({ kind: 'member', id: member.id, responsibility: 'primary', filter: 'all' }) },
        supporting: { ...member.supporting, ...jobWorkloadEvidence({ kind: 'member', id: member.id, responsibility: 'supporting', filter: 'all' }) },
      })),
      unassigned: report.unassigned === null ? null : { ...report.unassigned, ...jobWorkloadEvidence({ kind: 'unassigned', filter: 'all' }) },
      rows: report.rows.map(row => ({ ...row, serviceId: `service:${row.cells.service}` })),
    };
    projection = { view: 'jobs', filters: request.filters, state: { kind: 'ready', result } };
  }
  if (!validTeamReportProjection(projection, request.filters, response.options, report.scope)) {
    throw new Error('Team report filters, scope or evidence cannot be displayed consistently. Retry the report.');
  }
  return { projection, filterOptions: response.options,
    availableViews: (['leads', 'jobs'] as const).filter(view => response.authority[view] !== null) };
}
export type TeamReportEvidenceSelection =
  | { view: 'leads'; evidence: TeamReportEvidence['leads'] }
  | { view: 'jobs'; evidence: TeamReportEvidence['jobs'] };
export function teamReportEvidenceSelection(result: TeamReportReadResult, id: string): TeamReportEvidenceSelection {
  const report = result.report;
  if (report.view === 'team-leads') {
    const selections: TeamLeadsQuery['selected'][] = [
      ...(['open', 'inactive'] as const).map(queue => ({ kind: 'queue' as const, queue })),
      ...(report.scope.kind === 'workspace' ? [{ kind: 'queue' as const, queue: 'unassigned' as const }] : []),
      ...report.owners.flatMap(owner => [
        { kind: 'owner' as const, id: owner.id }, { kind: 'owner' as const, id: owner.id, inactiveOnly: true },
        ...teamOpenLeadStages.map(stage => ({ kind: 'owner' as const, id: owner.id, stage })),
      ]),
    ];
    const evidence = selections.find(selected => leadEvidenceId(selected) === id);
    if (evidence) return { view: 'leads', evidence };
  } else {
    const selections: TeamJobsQuery['selected'][] = [
      ...(['active', 'overdue', 'waiting'] as const).map(queue => ({ kind: 'queue' as const, queue })),
      ...(report.scope.kind === 'workspace' ? [{ kind: 'queue' as const, queue: 'unassigned' as const }] : []),
    ];
    for (const filter of ['all', 'overdue', ...activeJobStatuses] as const) {
      for (const member of report.members) for (const responsibility of ['primary', 'supporting'] as const) {
        selections.push({ kind: 'member', id: member.id, responsibility, filter });
      }
      if (report.unassigned !== null) selections.push({ kind: 'unassigned', filter });
    }
    const evidence = selections.find(selected => jobEvidenceId(selected) === id);
    if (evidence) return { view: 'jobs', evidence };
  }
  throw new Error('This Team evidence selection is unavailable.');
}
export function visibleTeamRecord(result: TeamReportReadResult, id: string): { type: 'lead' | 'job'; id: string } | undefined {
  const row = result.report.rows.find(row => row.recordId === id);
  return row ? { type: result.report.view === 'team-leads' ? 'lead' : 'job', id: row.id } : undefined;
}
