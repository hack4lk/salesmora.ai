'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jobReportReadResultSchema, type JobReportReadResult, type ReportTemplate } from '@salesmora/contracts';
import { addCalendarDays } from '@salesmora/domain';
import { FormFeedback, SeafoamButton } from '@salesmora/ui';
import { JobReportWorkspace, jobReportViews, type JobReportProjection, type JobReportView } from './job-report-workspace';
import type { JobReportFilterContext, JobReportFiltersValue } from '../job-report-filters/job-report-filters';
import { adaptJobReadResponse, jobReportRequest, jobReportScopeKey, jobReportEvidenceSelection, visibleJobRecord, type JobReportEvidence } from './job-read.adapter';
import { ReportDateControls } from '../report-date-controls/report-date-controls';
import { resolveReportPeriod, type ReportPeriodSelection } from '../report-date-controls/report-date-controls.validation';
import { useReportRead } from '../use-report-read';
import { JobExport } from './job-export';
import { ReportPageLayout } from '../report-page-layout/report-page-layout';
import { TemplateSession, type TemplateRun } from '../report-templates/template-session';

const defaults: JobReportEvidence = { lifecycle: 'created', completion: undefined, workload: { kind: 'metric', metric: 'active' } };
export type JobReportPageProps = { initial: JobReportReadResult; onRecord: (id: string) => void; onReload: () => void };
export function JobReportPage({ initial, onRecord, onReload }: JobReportPageProps) {
  return <TemplateSession key={`${jobReportScopeKey(initial)}:${initial.report.asOf}`} initial={initial} parse={jobReportReadResultSchema.parse}>
    {(result, template, run, revision) => <JobReportPageHost key={revision} initial={result} template={template} onTemplateRun={run} onRecord={onRecord} onReload={onReload} />}
  </TemplateSession>;
}
function JobReportPageHost({ initial, onRecord, onReload, template, onTemplateRun }: JobReportPageProps & {
  template?: ReportTemplate; onTemplateRun: TemplateRun;
}) {
  const today = initial.today, timezone = initial.report.timezone, scopeKey = jobReportScopeKey(initial);
  const [view, setView] = useState<JobReportView>(initial.query.view);
  const [period, setPeriod] = useState<ReportPeriodSelection>(template?.configuration.period ?? ('period' in initial.query
    ? { preset: 'custom', ...initial.query.period } : { preset: 'custom', from: addCalendarDays(today, -29), to: today }));
  const [filters, setFilters] = useState<Record<JobReportFilterContext, JobReportFiltersValue>>({
    period: initial.query.view === 'workload' ? { statuses: [], owners: [], services: [] } : initial.query.filters,
    current: initial.query.view === 'workload' ? initial.query.filters : { statuses: [], owners: [], services: [] },
  });
  const [evidence, setEvidence] = useState<JobReportEvidence>({
    lifecycle: initial.query.view === 'lifecycle' ? initial.query.selectedView : defaults.lifecycle,
    completion: initial.query.view === 'completion' ? initial.query.selectedDate : defaults.completion,
    workload: initial.query.view === 'workload' ? initial.query.selection : defaults.workload,
  });
  const [page, setPage] = useState(initial.query.page), [pageSize, setPageSize] = useState<number>(initial.query.pageSize);
  const [exportOpen, setExportOpen] = useState(false);
  const range = useMemo(() => {
    const resolved = resolveReportPeriod(period, today, 'history').range;
    if (!resolved) throw new Error('Choose a valid Jobs report period.');
    return { from: resolved.from, to: resolved.to };
  }, [period, today]);
  const request = useMemo(() => jobReportRequest({ workspaceId: initial.workspaceId, view, filters, range, evidence, page, pageSize }),
    [initial.workspaceId, view, filters, range, evidence, page, pageSize]);
  const key = `${scopeKey}:${today}:${timezone}:${JSON.stringify(request)}`;
  const validate = useCallback((raw: unknown) => { adaptJobReadResponse(raw, { request, scopeKey, today, timezone }); },
    [request, scopeKey, today, timezone]);
  const loaded = useReportRead({ key, initial, initialUpdatedAt: Date.parse(initial.report.asOf), validate, url: `/api/reports/jobs?${new URLSearchParams({ query: JSON.stringify(request) })}`,
    failureMessage: 'Jobs report could not be loaded. Try again.' });
  let projection: JobReportProjection = { view, state: { kind: loaded.pending ? 'loading' : 'error' } };
  let adapted: ReturnType<typeof adaptJobReadResponse> | undefined;
  let raw: JobReportReadResult | undefined;
  let error = loaded.key === key ? loaded.error : undefined;
  if (!loaded.pending && loaded.raw) {
    try {
      adapted = adaptJobReadResponse(loaded.raw, { request, scopeKey, today, timezone });
      raw = jobReportReadResultSchema.parse(loaded.raw);
      projection = adapted.projection;
    } catch (failure) { error = failure instanceof Error ? failure.message : 'Jobs report data is invalid. Reload the report.'; }
  }
  const denied = loaded.key === key && loaded.denied;
  const reset = () => { setPage(1); setEvidence(defaults); };
  const unavailable = () => { throw new Error('Jobs report export and configuration are not integrated yet.'); };
  return <ReportPageLayout area="jobs" workspaceId={initial.workspaceId} query={request}
    period={'period' in request ? period : null} ready={!loaded.pending && !error && !!raw} active={template} onRun={onTemplateRun}
    canRead={!denied} canExport={!loaded.pending && !error && !!raw?.exportScope} onExport={() => setExportOpen(true)}>
    <main className="grid min-w-0 gap-6 p-4 sm:p-8">
    {error && <div className="grid justify-items-start gap-3">
      <FormFeedback kind="error" message={error} /><SeafoamButton label="Reload report access" onClick={onReload} />
    </div>}
    {!denied && view !== 'workload' && <ReportDateControls value={period} context="history" today={today} timezone={timezone}
      pending={loaded.pending} onApply={value => { setPeriod(value); reset(); }} />}
    <JobReportWorkspace projection={projection} availableViews={jobReportViews} filters={filters}
      filterOptions={error ? {} : adapted?.filterOptions ?? {}} filterState={loaded.pending ? 'loading' : error ? 'error' : 'ready'}
      canRead={!denied} canReadCurrent={!denied} canExport={!loaded.pending && !error && !!raw?.exportScope} canEdit={false} pending={loaded.pending}
      onViewChange={next => { setView(next); reset(); }}
      onFiltersChange={(context, value) => { setFilters(previous => ({ ...previous, [context]: value })); reset(); }}
      onRetryFilters={loaded.refresh} onRetry={loaded.refresh}
      onEvidence={id => {
        if (loaded.pending || !raw) return;
        const selected = jobReportEvidenceSelection(raw, id);
        setEvidence(previous => {
          switch (selected.view) {
            case 'lifecycle': return { ...previous, lifecycle: selected.evidence };
            case 'completion': return { ...previous, completion: selected.evidence };
            case 'workload': return { ...previous, workload: selected.evidence };
          }
        });
        setPage(1);
      }}
      onRecord={id => { if (!loaded.pending && raw) { const visible = visibleJobRecord(raw, id); if (visible) onRecord(visible); } }}
      onExport={() => setExportOpen(true)} onEdit={unavailable}
      onPageChange={setPage} onPageSizeChange={size => { setPageSize(size); setPage(1); }} />
    {exportOpen && raw && !loaded.pending && !error && raw.exportScope && <JobExport
      key={`${scopeKey}:${JSON.stringify(request)}`} request={request} authority={raw}
      onClose={() => setExportOpen(false)} onReload={onReload} />}
    </main>
  </ReportPageLayout>;
}
export function JobReportRoute({ initial }: { initial: JobReportReadResult }) {
  const router = useRouter();
  return <JobReportPage initial={initial} onReload={() => router.refresh()}
    onRecord={id => router.push(`/jobs/${encodeURIComponent(id)}?workspace=${encodeURIComponent(initial.workspaceId)}`)} />;
}
