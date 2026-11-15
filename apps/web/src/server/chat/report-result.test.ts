import { describe, expect, it } from 'vitest';
import { reportAssistantReadSnapshotSchema, reportSelectionSchema, type ReportNativeRead } from '@salesmora/contracts';
import { reportResultResponse } from './report-result';
import { reportSelectionExamples } from '../../../../../packages/contracts/src/reports/assistant-query.fixtures';
import { leadReportBackendResponse } from '../../features/reports/lead-report-workspace/lead-report.adapter.fixtures';
import { sourceReadResponse } from '../../features/reports/lead-source-report/lead-source-read.fixtures';
import { overviewReadResponse, initialOverviewQuery } from '../../features/reports/business-overview/business-overview-read.fixtures';
import { calendarReadResponse } from '../../features/reports/calendar-report-workspace/calendar-read.fixtures';
import { jobReadResponse } from '../../features/reports/job-report-workspace/job-read.fixtures';
import { teamReadResponse } from '../../features/reports/team-report-workspace/team-read.fixtures';
import { estimateReadResponse } from '../../features/reports/estimate-report-workspace/estimate-read.fixtures';
import { activityReadResponse } from '../../features/reports/activity-report/activity-read.fixtures';
import { financialReadResponse } from '../../features/reports/financial-report/financial-read.fixtures';
import { formatMoney } from '@salesmora/ui/money';

const id = '00000000-0000-4000-8000-000000000022';
function present(native: ReportNativeRead) {
  return reportResultResponse(reportAssistantReadSnapshotSchema.parse({
    native, binding: { id, workspaceId: native.read.workspaceId, viewerId: native.read.viewerId,
      policyRevision: native.read.policyRevision, selection: { area: native.area, query: native.read.query },
      retrievedAt: '2026-11-09T15:00:00.000Z', contentHash: 'a'.repeat(64), stamp: 'b'.repeat(64) },
  })).snapshot;
}
describe('canonical report card projection', () => {
  it.each(reportSelectionExamples)('projects $area / $query.view without deriving totals from evidence rows', example => {
    const selection = reportSelectionSchema.parse({ ...example, query: { ...example.query,
      ...('period' in example.query ? { period: { from: '2026-10-01', to: '2026-10-31' } } : {}),
      ...(example.area === 'team' && example.query.view === 'team-jobs'
        ? { selected: { kind: 'member', id: 'member-c', responsibility: 'supporting', filter: 'all' },
          filters: { members: ['member-c'] } } : {}),
    } });
    let native: ReportNativeRead;
    switch (selection.area) {
      case 'overview': native = { area: 'overview', read: overviewReadResponse(selection.query) }; break;
      case 'leads': native = { area: 'leads', read: leadReportBackendResponse(selection.query) }; break;
      case 'sources': native = { area: 'sources', read: sourceReadResponse(selection.query) }; break;
      case 'calendar': native = { area: 'calendar', read: calendarReadResponse(selection.query) }; break;
      case 'jobs': native = { area: 'jobs', read: jobReadResponse(selection.query) }; break;
      case 'team': native = { area: 'team', read: teamReadResponse(selection.query) }; break;
      case 'estimates': native = { area: 'estimates', read: estimateReadResponse(selection.query) }; break;
      case 'activity': native = { area: 'activity', read: activityReadResponse(selection.query) }; break;
      case 'financial': native = { area: 'financial', read: financialReadResponse(selection.query) }; break;
    }
    const snapshot = present(native);
    expect(snapshot.selection).toEqual({ area: native.area, query: native.read.query });
    expect(snapshot.result.id).toBe(id);
    expect(snapshot.result.period).toEqual('period' in native.read.query ? native.read.query.period : null);
    expect(JSON.stringify(snapshot)).not.toContain('contentHash');
    expect(snapshot.result.coverage.join(' ')).toContain('native population aggregates');
    if ('report' in native.read && 'evidenceTotal' in native.read.report) {
      expect(snapshot.result.sections.find(section => section.id === 'selected-evidence')?.metrics[0]?.value)
        .toEqual({ kind: 'count', value: native.read.report.evidenceTotal });
    }
  });
  it('retains independently timestamped Overview sections rather than merging their authority or clocks', () => {
    const read = overviewReadResponse(initialOverviewQuery);
    const result = present({ area: 'overview', read }).result;
    if (read.report.jobs.kind !== 'available') throw new Error('Jobs fixture unavailable.');
    expect(result.sections.find(section => section.id === 'job-completed')).toMatchObject({
      asOf: read.report.jobs.reads.completion.asOf, scopeLabel: read.report.jobs.reads.completion.scopeLabel,
      metrics: [{ id: 'completed', value: { kind: 'count', value: read.report.jobs.completed } }],
    });
    expect(result.sections.length).toBeGreaterThan(3);
  });
  it('retains unavailable values and material-cost incompleteness independently of estimate commitments', () => {
    const read = financialReadResponse();
    const result = present({ area: 'financial', read }).result;
    const costs = read.reports.materials.costs;
    if (costs.kind !== 'available' || costs.coverage.knownCostCents === null) throw new Error('Known costs fixture missing.');
    expect(result.sections.find(section => section.id === 'materials')?.metrics.find(metric => metric.id === 'cost')?.value)
      .toEqual({ kind: 'incomplete', displayValue: formatMoney(costs.coverage.knownCostCents),
        coverageLabel: `${costs.coverage.knownCostLines} known / ${costs.coverage.lineCount} lines. Missing costs are not zero.` });
    read.reports.materials.costs = { kind: 'unavailable', reason: 'permissions', explanation: 'Costs denied.' };
    read.authority.materials.costs = false;
    read.exportAccess.materials = null;
    read.reports.materials.rows = [];
    read.reports.materials.evidenceTotal = 0;
    const denied = present({ area: 'financial', read }).result;
    expect(denied.sections.find(section => section.id === 'materials')?.metrics[0]?.value)
      .toEqual({ kind: 'unavailable', reason: 'Costs denied.' });
  });
});
