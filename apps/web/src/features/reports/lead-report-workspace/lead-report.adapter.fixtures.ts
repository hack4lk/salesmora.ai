import { leadReportQuerySchema, leadReportReadResultSchema, leadSources, leadStages, type LeadReportQuery } from '@salesmora/contracts';
import { addCalendarDays } from '@salesmora/domain';
import { workspaceLeadFixtures } from './lead-report-workspace.fixtures';
import { leadAgeBand } from '../lead-pipeline-report/lead-pipeline-report.validation';

export const leadReportWorkspaceId = '00000000-0000-4000-8000-000000000001';
export const leadReportViewerId = '00000000-0000-4000-8000-000000000101';
export const leadReportToday = '2026-11-05';
const uuid = (id: string) => `00000000-0000-4000-8000-${String(200 + Number(id.slice(1))).padStart(12, '0')}`;
export const initialLeadReportQuery = leadReportQuerySchema.parse({
  workspaceId: leadReportWorkspaceId, view: 'intake', period: { from: '2026-10-01', to: '2026-10-31' },
  filters: { stages: [], owners: [], sources: [] }, currentFilters: { stages: [], owners: [], sources: [] }, page: 1, pageSize: 25,
});
/** Backend-shaped fictional responses share the established workspace Lead population, never another UI. */
export function leadReportBackendResponse(query: LeadReportQuery, scope: 'workspace' | 'assigned' = 'workspace',
  fixtures = workspaceLeadFixtures) {
  const ownerId = (owner: string) => owner === 'member-a' ? leadReportViewerId
    : owner === 'member-b' ? '00000000-0000-4000-8000-000000000102' : 'unassigned';
  const matches = (row: typeof fixtures[number], filters: LeadReportQuery['filters']) =>
    (!filters.stages.length || filters.stages.some(stage => stage === row.stage)) &&
    (!filters.sources.length || filters.sources.includes(row.source)) &&
    (!filters.owners.length || filters.owners.some(owner => (owner === 'me' ? leadReportViewerId : owner) === ownerId(row.owner)));
  const visible = fixtures.filter(row => scope !== 'assigned' || row.owner === 'member-a');
  const all = visible.filter(row => matches(row, query.filters));
  const open = all.filter(row => ['new', 'contacted', 'estimate-sent'].includes(row.stage));
  const row = (lead: typeof fixtures[number]) => ({ id: uuid(lead.id), recordId: uuid(lead.id), label: lead.label,
    cells: { created: lead.created, assignment: lead.owner, source: lead.source, stage: lead.stage,
      activity: `${lead.inactive ? '2026-10-28' : leadReportToday}T10:00:00.000Z`, age: String(lead.age) } });
  const base = { asOf: '2026-11-05T10:00:00.000Z', today: leadReportToday, timezone: 'Europe/Warsaw',
    scopeLabel: scope === 'workspace' ? 'All authorized Leads; readable archives included where applicable.' : 'Assigned Leads; archives excluded.',
    archiveVisibility: scope === 'workspace' ? 'included' : 'excluded', pageSize: query.pageSize };
  const page = (rows: ReturnType<typeof row>[]) => {
    const selected = Math.min(query.page, Math.max(1, Math.ceil(rows.length / query.pageSize)));
    return { page: selected, evidenceTotal: rows.length, rows: rows.slice((selected - 1) * query.pageSize, selected * query.pageSize) };
  };
  let report: unknown;
  if (query.view === 'intake') {
    const cohort = all.filter(lead => lead.created >= query.period.from && lead.created <= query.period.to);
    const days = [];
    for (let date = query.period.from; date <= query.period.to; date = addCalendarDays(date, 1)) {
      days.push({ date, count: cohort.filter(lead => lead.created === date).length });
    }
    report = { ...base, view: query.view, ...query.period, total: cohort.length,
      sources: leadSources.map(source => ({ source, count: cohort.filter(lead => lead.source === source).length })),
      trend: days, currentOpenLeads: visible.filter(lead => matches(lead, query.currentFilters) && ['new', 'contacted', 'estimate-sent'].includes(lead.stage)).length,
      ...page(cohort.filter(lead => !query.trendBucket || lead.created === query.trendBucket).map(row)) };
  } else if (query.view === 'pipeline' || query.view === 'age') {
    const selection = query.selection;
    report = { ...base, view: query.view, total: open.length, selection,
      stages: Object.fromEntries(['new', 'contacted', 'estimate-sent'].map(stage => [stage, open.filter(lead => lead.stage === stage).length])),
      ages: Object.fromEntries(['0-7', '8-14', '15-30', '31+'].map(band => [band, open.filter(lead => leadAgeBand(lead.age) === band).length])),
      ...page(open.filter(lead => selection.kind === 'pipeline' || selection.kind === 'stage'
        ? selection.kind === 'pipeline' || lead.stage === selection.stage : leadAgeBand(lead.age) === selection.band).map(row)) };
  } else if (query.view === 'attention') {
    const selected = open.filter(lead => query.selection === 'inactive' ? lead.inactive : query.selection === 'unowned'
      ? lead.owner === 'unassigned' : lead.inactive || lead.owner === 'unassigned');
    const paged = page(selected.map(row));
    report = { ...base, view: query.view, inactivityCutoff: '2026-10-29T10:00:00.000Z', selection: query.selection,
      counts: { inactive: open.filter(lead => lead.inactive).length, unowned: open.filter(lead => lead.owner === 'unassigned').length,
        combined: open.filter(lead => lead.inactive || lead.owner === 'unassigned').length },
      ...paged, rows: paged.rows.map(item => ({ ...item, cells: { stage: item.cells.stage, owner: item.cells.assignment,
        activity: item.cells.activity, reason: 'inactive / unowned' } })) };
  } else if (query.view === 'won' || query.view === 'lost') {
    const won = all.filter(lead => lead.id === 'l2'), lost = all.filter(lead => lead.id === 'l2' || lead.id === 'l3');
    const inRange = (date: string) => date >= query.period.from && date <= query.period.to;
    const selected = query.view === 'won' ? inRange('2026-10-22') ? won : [] : inRange('2026-10-30') ? lost : [];
    const paged = page(selected.map(row));
    report = { ...base, view: query.view, ...query.period, counts: { won: inRange('2026-10-22') ? won.length : 0, lost: inRange('2026-10-30') ? lost.length : 0 },
      coverage: { kind: 'partial', explanation: 'Surviving recorded transitions only; no historical backfill.' },
      ...paged, rows: paged.rows.map(item => ({ ...item, cells: {
        transition: `${query.view} / 2026-10-${query.view === 'won' ? '22' : '30'}T10:00:00Z`, assignment: item.cells.assignment, source: item.cells.source,
      } })) };
  } else throw new Error('Unsupported fictional Leads query.');
  return leadReportReadResultSchema.parse({ workspaceId: query.workspaceId, viewerId: leadReportViewerId, policyRevision: 1, scope,
    archiveVisibility: base.archiveVisibility, query, report, options: {
      stages: leadStages.map(value => ({ value, label: value === 'estimate-sent' ? 'Estimate sent' : value[0]!.toUpperCase() + value.slice(1) })),
      sources: leadSources.map(value => ({ value, label: value[0]!.toUpperCase() + value.slice(1) })),
      owners: [{ value: 'me', label: 'Me' }, { value: 'unassigned', label: 'No current primary owner' },
        ...(scope === 'workspace' ? [{ value: leadReportViewerId, label: 'Teammate A' }, { value: ownerId('member-b'), label: 'Teammate B' }] : [])],
    } });
}
