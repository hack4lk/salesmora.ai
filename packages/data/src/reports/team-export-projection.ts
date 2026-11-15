import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { teamReportExportColumns, teamReportExportInputSchema, teamLeadsResultSchema, teamJobsResultSchema,
  type AuthorizationContext, type TeamReportExportInput } from '@salesmora/contracts';
import { requireTeamReportExportScope } from './team-export-access';
import { readTeamLeadsReportInTransaction, teamLeadEvidenceJSON, teamLeadsWorkloadSource } from './team-leads';
import { readTeamJobsReportInTransaction, teamJobEvidenceJSON, teamJobsWorkloadSource } from './team-jobs';

type Workload = { count: number; overdue: number; waiting: number;
  statuses: { 'needs-scheduling': number; scheduled: number; 'in-progress': number; waiting: number } };
function workloadCells(value: Workload) {
  return [value.count, value.overdue, value.waiting, value.statuses['needs-scheduling'],
    value.statuses.scheduled, value.statuses['in-progress'], value.statuses.waiting];
}
/** Caller owns one authorized snapshot through preparation and complete cursor consumption. */
export async function prepareTeamReportCSVProjectionInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, raw: TeamReportExportInput,
) {
  const input = teamReportExportInputSchema.parse(raw);
  const scope = requireTeamReportExportScope(context, input), { query, dataset } = input;
  const assigned = scope.kind === 'assigned', paging = { page: 1, pageSize: 100 as const };
  const report = query.view === 'team-leads'
    ? await readTeamLeadsReportInTransaction(trx, context, { ...query, ...paging }, assigned)
    : await readTeamJobsReportInTransaction(trx, context, { ...query, ...paging }, assigned);
  if (JSON.stringify(scope) !== JSON.stringify(report.scope)) throw new Error('Team export and native read scopes disagree.');
  const columns = teamReportExportColumns(input), dateBasis = 'current-snapshot' as const;
  const archiveVisibility = query.view === 'team-leads' ? 'excluded' as const : 'included' as const;
  const inactivityCutoff = report.view === 'team-leads' ? report.inactivityCutoff : null;
  const coverage = 'Current authorized workload; selected evidence: ' + JSON.stringify(query.selected) +
    '. Job participation is non-additive, not hours or capacity; withheld attribution remains hidden.';
  const common = [query.view, dataset, dateBasis, report.asOf, report.timezone, scope.kind, archiveVisibility,
    inactivityCutoff, coverage];
  const count = dataset === 'summary' || dataset === 'unassigned' ? 1
    : dataset === 'owners' && report.view === 'team-leads' ? report.owners.length
      : dataset === 'members' && report.view === 'team-jobs' ? report.members.length * 2 : report.evidenceTotal;
  if (!Number.isSafeInteger(count) || count < 0) throw new Error('Team export count is invalid.');

  async function* rows(signal?: AbortSignal): AsyncGenerator<readonly (string | number | null)[]> {
    signal?.throwIfAborted();
    if (dataset === 'summary') {
      yield [...common, ...(report.view === 'team-leads'
        ? [report.counts.open, report.counts.inactive, assigned ? null : report.counts.unassigned]
        : [report.counts.active, report.counts.overdue, report.counts.waiting])];
      return;
    }
    if (dataset === 'owners' && report.view === 'team-leads') {
      for (const owner of report.owners) {
        signal?.throwIfAborted();
        yield [...common, owner.id, owner.label, owner.count, owner.inactive,
          owner.stages.new, owner.stages.contacted, owner.stages['estimate-sent']];
      }
      return;
    }
    if (dataset === 'members' && report.view === 'team-jobs') {
      for (const member of report.members) for (const responsibility of ['primary', 'supporting'] as const) {
        signal?.throwIfAborted();
        yield [...common, member.id, member.label, responsibility, ...workloadCells(member[responsibility])];
      }
      return;
    }
    if (dataset === 'unassigned' && report.view === 'team-jobs' && report.unassigned) {
      yield [...common, ...workloadCells(report.unassigned)];
      return;
    }
    if (dataset !== 'evidence') throw new Error('Invalid Team CSV dataset.');
    const source = query.view === 'team-leads'
      ? await teamLeadsWorkloadSource(trx, context, { ...query, ...paging }, assigned)
      : await teamJobsWorkloadSource(trx, context, { ...query, ...paging }, assigned);
    const statement = query.view === 'team-leads'
      ? `${source.sql} SELECT ${teamLeadEvidenceJSON} AS row FROM reportLeads l
          WHERE ${source.predicate} ORDER BY l."lastActivityAt", l.id`
      : `${source.sql} SELECT ${teamJobEvidenceJSON} AS row FROM reportJobs j
          WHERE ${source.predicate} ORDER BY j."completionDeadline" ASC NULLS LAST, j."jobNumber", j.id`;
    const bindings = [...source.bindings, ...(query.view === 'team-jobs' ? [assigned, context.userId] : []),
      ...source.selectionBindings];
    const cursor = `team_csv_${randomUUID().replaceAll('-', '')}`;
    await trx.raw(`DECLARE ?? NO SCROLL CURSOR FOR ${statement}`, [cursor, ...bindings]);
    let emitted = 0;
    try {
      while (true) {
        signal?.throwIfAborted();
        const batch = await trx.raw<{ rows: { row: unknown }[] }>('FETCH FORWARD 100 FROM ??', [cursor]);
        if (!batch.rows.length) break;
        for (const saved of batch.rows) {
          signal?.throwIfAborted();
          let cells: (string | number | null)[];
          if (query.view === 'team-leads') {
            const row = teamLeadsResultSchema.shape.rows.element.parse(saved.row);
            if (row.id !== row.recordId || assigned && row.currentOwnerId !== context.userId) {
              throw new Error('Team Lead export evidence violates assigned scope.');
            }
            cells = [row.id, row.label, row.stage, row.ownerState, row.currentOwnerId, row.cells.owner,
              String(row.inactive), row.cells.created, row.cells.activity];
          } else {
            const row = teamJobsResultSchema.shape.rows.element.parse(saved.row);
            if (row.id !== row.recordId || assigned &&
              (row.primary.kind === 'unassigned' || row.primary.kind === 'member' && row.primary.id !== context.userId ||
                row.supportingMemberIds.some(id => id !== context.userId) ||
                row.primary.kind === 'withheld' && !row.supportingMemberIds.includes(context.userId))) {
              throw new Error('Team Jobs export evidence violates assigned scope.');
            }
            cells = [row.id, row.label, row.status, row.cells.service, row.completionDeadline, row.scheduledDate,
              row.waitingReason, row.primary.kind, row.primary.kind === 'member' ? row.primary.id : null,
              JSON.stringify(row.supportingMemberIds)];
          }
          emitted++;
          if (emitted > count || common.length + cells.length !== columns.length) {
            throw new Error('Team export evidence count or columns do not match the native projection.');
          }
          yield [...common, ...cells];
        }
      }
      if (emitted !== count) throw new Error('Team export evidence population does not match its count.');
    } finally { await trx.raw('CLOSE ??', [cursor]); }
  }
  return { input, workspaceId: context.workspaceId, viewerId: context.userId, policyRevision: context.policy.revision,
    scope, archiveVisibility, asOf: report.asOf, today: report.today, timezone: report.timezone,
    dateBasis, coverage, inactivityCutoff, count, columns, rows };
}
