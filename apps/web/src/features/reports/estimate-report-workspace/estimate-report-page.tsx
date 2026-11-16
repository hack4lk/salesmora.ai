'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { estimateReportReadResultSchema, type EstimateReportReadResult, type ReportTemplate } from '@salesmora/contracts';
import { addCalendarDays } from '@salesmora/domain';
import { FormFeedback, SeafoamButton } from '@salesmora/ui';
import { EstimateReportWorkspace, estimateReportViews, type EstimateReportProjection, type EstimateReportView } from './estimate-report-workspace';
import type { EstimateReportFilterContext, EstimateReportFiltersValue } from '../estimate-report-filters/estimate-report-filters';
import { adaptEstimateReadResponse, estimateReportRequest, estimateReportScopeKey, estimateReportEvidenceSelection,
  visibleEstimateRecord, initialEstimateEvidence, type EstimateReportEvidence } from './estimate-read.adapter';
import { ReportDateControls } from '../report-date-controls/report-date-controls';
import { resolveReportPeriod, type ReportPeriodSelection } from '../report-date-controls/report-date-controls.validation';
import { useReportRead } from '../use-report-read';
import { EstimateExport } from './estimate-export';
import { ReportPageLayout } from '../report-page-layout/report-page-layout';
import { TemplateSession, type TemplateRun } from '../report-templates/template-session';

export type EstimateReportPageProps = { initial: EstimateReportReadResult; onRecord: (id: string) => void; onReload: () => void };
export function EstimateReportPage({ initial, onRecord, onReload }: EstimateReportPageProps) {
  return <TemplateSession key={`${estimateReportScopeKey(initial)}:${initial.report.asOf}`} initial={initial} parse={estimateReportReadResultSchema.parse}>
    {(result, template, run, revision) => <EstimateReportPageHost key={revision} initial={result} template={template} onTemplateRun={run} onRecord={onRecord} onReload={onReload} />}
  </TemplateSession>;
}
function EstimateReportPageHost({ initial, onRecord, onReload, template, onTemplateRun }: EstimateReportPageProps & {
  template?: ReportTemplate; onTemplateRun: TemplateRun;
}) {
  const today = initial.today, timezone = initial.report.timezone, scopeKey = estimateReportScopeKey(initial);
  const [view, setView] = useState<EstimateReportView>(initial.query.view === 'estimate-decisions' ? 'decisions'
    : initial.query.view === 'estimate-first-quoted' ? 'first-quoted' : 'current');
  const [period, setPeriod] = useState<ReportPeriodSelection>(template?.configuration.period ?? ('period' in initial.query
    ? { preset: 'custom', ...initial.query.period } : { preset: 'custom', from: addCalendarDays(today, -29), to: today }));
  const [filters, setFilters] = useState<Record<EstimateReportFilterContext, EstimateReportFiltersValue>>({
    period: initial.query.view === 'estimate-current' ? { owners: [], parents: [] } : initial.query.filters,
    current: initial.query.view === 'estimate-current' ? initial.query.filters : { owners: [], parents: [] },
  });
  const [evidence, setEvidence] = useState<EstimateReportEvidence>({
    decisions: initial.query.view === 'estimate-decisions' ? initial.query.selected : initialEstimateEvidence.decisions,
    current: initial.query.view === 'estimate-current' ? initial.query.selected : initialEstimateEvidence.current,
  });
  const [page, setPage] = useState(initial.query.page), [pageSize, setPageSize] = useState<number>(initial.query.pageSize);
  const [exportOpen, setExportOpen] = useState(false);
  const range = useMemo(() => {
    const resolved = resolveReportPeriod(period, today, 'history').range;
    if (!resolved) throw new Error('Choose a valid Estimates report period.');
    return { from: resolved.from, to: resolved.to };
  }, [period, today]);
  const request = useMemo(() => estimateReportRequest({ workspaceId: initial.workspaceId, view, filters, range, evidence, page, pageSize }),
    [initial.workspaceId, view, filters, range, evidence, page, pageSize]);
  const key = `${scopeKey}:${today}:${timezone}:${JSON.stringify(request)}`;
  const validate = useCallback((raw: unknown) => { adaptEstimateReadResponse(raw, { request, scopeKey, today, timezone }); },
    [request, scopeKey, today, timezone]);
  const loaded = useReportRead({ key, initial, initialUpdatedAt: Date.parse(initial.report.asOf), validate,
    url: `/api/reports/estimates?${new URLSearchParams({ query: JSON.stringify(request) })}`,
    failureMessage: 'Estimates report could not be loaded. Try again.' });
  let projection: EstimateReportProjection = { view, filters: filters[view === 'current' ? 'current' : 'period'],
    scopeKey, attribution: [], state: { kind: loaded.pending ? 'loading' : 'error' } };
  let adapted: ReturnType<typeof adaptEstimateReadResponse> | undefined;
  let raw: EstimateReportReadResult | undefined;
  let error = loaded.key === key ? loaded.error : undefined;
  if (!loaded.pending && loaded.raw) {
    try {
      adapted = adaptEstimateReadResponse(loaded.raw, { request, scopeKey, today, timezone });
      raw = estimateReportReadResultSchema.parse(loaded.raw);
      projection = adapted.projection;
    } catch (failure) { error = failure instanceof Error ? failure.message : 'Estimates report data is invalid. Reload the report.'; }
  }
  const denied = loaded.key === key && loaded.denied;
  const reset = () => { setPage(1); setEvidence(initialEstimateEvidence); };
  const unavailable = () => { throw new Error('Estimates report export and configuration are not integrated yet.'); };
  return <ReportPageLayout area="estimates" workspaceId={initial.workspaceId} query={request}
    period={'period' in request ? period : null} ready={!loaded.pending && !error && !!raw} active={template} onRun={onTemplateRun}
    canRead={!denied} canExport={!loaded.pending && !error && !!raw?.exportAccess} onExport={() => setExportOpen(true)}>
    <main className="grid min-w-0 gap-6 p-4 sm:p-8">
    {error && <div className="grid justify-items-start gap-3">
      <FormFeedback kind="error" message={error} /><SeafoamButton label="Reload report access" onClick={onReload} />
    </div>}
    {!denied && view !== 'current' && <ReportDateControls value={period} context="history" today={today} timezone={timezone}
      pending={loaded.pending} onApply={value => { setPeriod(value); reset(); }} />}
    <EstimateReportWorkspace projection={projection} availableViews={estimateReportViews} filters={filters} scopeKey={scopeKey}
      filterOptions={error ? {} : adapted?.filterOptions ?? {}} filterState={loaded.pending ? 'loading' : error ? 'error' : 'ready'}
      canRead={!denied} canReadCurrent={!denied} canReadMoney={!!raw?.authority.money}
      canReadHandoff={!!raw?.authority.handoff} canExport={!loaded.pending && !error && !!raw?.exportAccess} canEdit={false} pending={loaded.pending}
      onViewChange={next => { setView(next); reset(); }}
      onFiltersChange={(context, value) => { setFilters(previous => ({ ...previous, [context]: value })); reset(); }}
      onRetryFilters={loaded.refresh} onRetry={loaded.refresh}
      onEvidence={id => {
        if (loaded.pending || !raw) return;
        const selected = estimateReportEvidenceSelection(raw, id);
        if (selected.view !== 'first-quoted') setEvidence(previous => selected.view === 'decisions'
          ? { ...previous, decisions: selected.evidence } : { ...previous, current: selected.evidence });
        setPage(1);
      }}
      onRecord={id => {
        if (!loaded.pending && raw) {
          const visible = visibleEstimateRecord(raw, id);
          if (visible) onRecord(visible);
        }
      }}
      onExport={() => setExportOpen(true)} onEdit={unavailable}
      onPageChange={setPage} onPageSizeChange={size => { setPageSize(size); setPage(1); }} />
    {exportOpen && raw && !loaded.pending && !error && raw.exportAccess && <EstimateExport
      key={`${scopeKey}:${JSON.stringify(request)}`} request={request} authority={raw}
      onClose={() => setExportOpen(false)} onReload={onReload} />}
    </main>
  </ReportPageLayout>;
}
export function EstimateReportRoute({ initial }: { initial: EstimateReportReadResult }) {
  const router = useRouter();
  return <EstimateReportPage initial={initial} onReload={() => router.refresh()}
    onRecord={id => router.push(`/estimates/${encodeURIComponent(id)}?workspace=${encodeURIComponent(initial.workspaceId)}`)} />;
}
