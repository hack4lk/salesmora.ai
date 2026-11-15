'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { teamReportReadResultSchema, type TeamReportReadResult, type ReportTemplate } from '@salesmora/contracts';
import { FormFeedback, SeafoamButton } from '@salesmora/ui';
import { TeamReportWorkspace, type TeamReportProjection, type TeamReportView } from './team-report-workspace';
import type { TeamReportFiltersValue } from '../team-report-filters/team-report-filters';
import { adaptTeamReadResponse, initialTeamEvidence, teamReportRequest, teamReportScopeKey,
  teamReportEvidenceSelection, visibleTeamRecord, type TeamReportEvidence } from './team-read.adapter';
import { useReportRead } from '../use-report-read';
import { TeamExport } from './team-export';
import { ReportPageLayout } from '../report-page-layout/report-page-layout';
import { TemplateSession, type TemplateRun } from '../report-templates/template-session';

export type TeamReportPageProps = {
  initial: TeamReportReadResult; onRecord: (record: { type: 'lead' | 'job'; id: string }) => void; onReload: () => void;
};
export function TeamReportPage({ initial, onRecord, onReload }: TeamReportPageProps) {
  return <TemplateSession key={`${teamReportScopeKey(initial)}:${initial.report.asOf}`} initial={initial} parse={teamReportReadResultSchema.parse}>
    {(result, template, run, revision) => <TeamReportPageHost key={revision} initial={result} template={template} onTemplateRun={run} onRecord={onRecord} onReload={onReload} />}
  </TemplateSession>;
}
function TeamReportPageHost({ initial, onRecord, onReload, template, onTemplateRun }: TeamReportPageProps & {
  template?: ReportTemplate; onTemplateRun: TemplateRun;
}) {
  const today = initial.report.today, timezone = initial.report.timezone, scopeKey = teamReportScopeKey(initial);
  const availableViews = (['leads', 'jobs'] as const).filter(view => initial.authority[view] !== null);
  const [view, setView] = useState<TeamReportView>(initial.query.view === 'team-leads' ? 'leads' : 'jobs');
  const [filters, setFilters] = useState<TeamReportFiltersValue>(initial.query.filters);
  const [evidence, setEvidence] = useState<TeamReportEvidence>({
    leads: initial.query.view === 'team-leads' ? initial.query.selected : initialTeamEvidence.leads,
    jobs: initial.query.view === 'team-jobs' ? initial.query.selected : initialTeamEvidence.jobs,
  });
  const [page, setPage] = useState(initial.query.page), [pageSize, setPageSize] = useState<number>(initial.query.pageSize);
  const [retry, setRetry] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);
  const scope = initial.authority[view] ?? initial.report.scope;
  // Preserve the draft while blocking a destination whose known scope cannot authorize it.
  const unavailableSelection = scope.kind === 'assigned' && filters.members.some(id => id !== scope.currentMemberId);
  const request = useMemo(() => teamReportRequest({ workspaceId: initial.workspaceId, view, filters, evidence, page, pageSize }),
    [initial.workspaceId, view, filters, evidence, page, pageSize]);
  const key = `${scopeKey}:${JSON.stringify(request)}:${retry}`;
  const validate = useCallback((raw: unknown) => { adaptTeamReadResponse(raw, { request, scopeKey, today, timezone }); },
    [request, scopeKey, today, timezone]);
  const loaded = useReportRead({ key, initial, validate, enabled: !unavailableSelection,
    url: `/api/reports/team?${new URLSearchParams({ query: JSON.stringify(request) })}`,
    failureMessage: 'Team report could not be loaded. Try again.' });
  let projection: TeamReportProjection = { view, filters, state: { kind: loaded.pending ? 'loading' : 'error' } };
  let adapted: ReturnType<typeof adaptTeamReadResponse> | undefined;
  let raw: TeamReportReadResult | undefined;
  let error = loaded.key === key ? loaded.error : undefined;
  if (!loaded.pending && loaded.raw) {
    try {
      adapted = adaptTeamReadResponse(loaded.raw, { request, scopeKey, today, timezone });
      raw = teamReportReadResultSchema.parse(loaded.raw);
      projection = adapted.projection;
    } catch (failure) { error = failure instanceof Error ? failure.message : 'Team report data is invalid. Reload the report.'; }
  }
  const denied = loaded.key === key && loaded.denied;
  const reset = () => { setPage(1); setEvidence(initialTeamEvidence); };
  const unavailable = () => { throw new Error('Team report export and configuration are not integrated yet.'); };
  const blockedOptions = scope.kind === 'assigned'
    ? [{ value: scope.currentMemberId, label: 'Me' }] : [];
  return <ReportPageLayout area="team" workspaceId={initial.workspaceId} query={request} period={null}
    ready={!loaded.pending && !error && !unavailableSelection && !!raw} active={template} onRun={onTemplateRun}
    canRead={!denied} canExport={!loaded.pending && !error && !unavailableSelection && !!raw?.exportScopes[view]}
    onExport={() => setExportOpen(true)}>
    <main className="grid min-w-0 gap-6 p-4 sm:p-8">
    {error && <div className="grid justify-items-start gap-3">
      <FormFeedback kind="error" message={error} /><SeafoamButton label="Reload report access" onClick={onReload} />
    </div>}
    <TeamReportWorkspace projection={projection} availableViews={adapted?.availableViews ?? availableViews}
      scope={scope} filters={filters}
      filterOptions={unavailableSelection ? blockedOptions : error ? [] : adapted?.filterOptions ?? []}
      filterState={loaded.pending ? 'loading' : error ? 'error' : 'ready'}
      canRead={!denied} canReadCurrent={!denied} canExport={!loaded.pending && !error && !!raw?.exportScopes[view]} canEdit={false} pending={loaded.pending}
      onViewChange={next => { setView(next); reset(); }}
      onFiltersChange={value => { setFilters(value); reset(); }}
      onRetryFilters={() => setRetry(value => value + 1)} onRetry={() => setRetry(value => value + 1)}
      onEvidence={id => {
        if (loaded.pending || !raw) return;
        const selected = teamReportEvidenceSelection(raw, id);
        setEvidence(previous => selected.view === 'leads'
          ? { ...previous, leads: selected.evidence } : { ...previous, jobs: selected.evidence });
        setPage(1);
      }}
      onRecord={id => {
        if (!loaded.pending && raw) {
          const visible = visibleTeamRecord(raw, id);
          if (visible) onRecord(visible);
        }
      }}
      onExport={() => setExportOpen(true)} onEdit={unavailable}
      onPageChange={setPage} onPageSizeChange={size => { setPageSize(size); setPage(1); }} />
    {exportOpen && raw && !loaded.pending && !error && raw.exportScopes[view] && <TeamExport
      key={`${scopeKey}:${JSON.stringify(request)}`} request={request} authority={raw}
      onClose={() => setExportOpen(false)} onReload={onReload} />}
    </main>
  </ReportPageLayout>;
}
export function TeamReportRoute({ initial }: { initial: TeamReportReadResult }) {
  const router = useRouter();
  return <TeamReportPage initial={initial} onReload={() => router.refresh()}
    onRecord={record => router.push(`/${record.type === 'lead' ? 'leads' : 'jobs'}/${encodeURIComponent(record.id)}?workspace=${encodeURIComponent(initial.workspaceId)}`)} />;
}
