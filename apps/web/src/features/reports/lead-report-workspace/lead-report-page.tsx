'use client';

import { useEffect, useMemo, useState } from 'react';
import { FormFeedback, SeafoamButton } from '@salesmora/ui';
import { leadReportReadResultSchema, type LeadReportReadResult, type ReportTemplate } from '@salesmora/contracts';
import { LeadReportExport } from './lead-report-export';
import { LeadReportWorkspace, type LeadReportProjection } from './lead-report-workspace';
import { adaptLeadReportResponse, leadReportRequest, leadReportScopeKey, nativeLeadReportViews, type NativeLeadReportView } from './lead-report.adapter';
import { ReportDateControls } from '../report-date-controls/report-date-controls';
import type { ReportPeriodSelection } from '../report-date-controls/report-date-controls.validation';
import type { LeadReportFiltersValue } from '../lead-report-filters/lead-report-filters';
import { ReportPageLayout } from '../report-page-layout/report-page-layout';
import { TemplateSession, type TemplateRun } from '../report-templates/template-session';

export type LeadReportPageProps = { initial: LeadReportReadResult; onRecord: (id: string) => void; onReload: () => void };
export function LeadReportPage({ initial, onRecord, onReload }: LeadReportPageProps) {
  return <TemplateSession key={`${leadReportScopeKey(initial)}:${initial.report.asOf}`} initial={initial} parse={leadReportReadResultSchema.parse}>
    {(result, template, run, revision) => <LeadReportPageHost key={revision} initial={result} template={template} onTemplateRun={run} onRecord={onRecord} onReload={onReload} />}
  </TemplateSession>;
}
function LeadReportPageHost({ initial, onRecord, onReload, template, onTemplateRun }: LeadReportPageProps & {
  template?: ReportTemplate; onTemplateRun: TemplateRun;
}) {
  const today = initial.report.today, timezone = initial.report.timezone, scopeKey = leadReportScopeKey(initial);
  const [period, setPeriod] = useState<ReportPeriodSelection>(template?.configuration.period ?? ('period' in initial.query
    ? { preset: 'custom', ...initial.query.period } : { preset: 'last30days' }));
  const [view, setView] = useState<NativeLeadReportView>(initial.query.view);
  const [filters, setFilters] = useState<{ period: LeadReportFiltersValue; current: LeadReportFiltersValue }>({
    period: 'period' in initial.query ? initial.query.filters : { stages: [], owners: [], sources: [] },
    current: initial.query.view === 'intake' ? initial.query.currentFilters : !('period' in initial.query)
      ? initial.query.filters : { stages: [], owners: [], sources: [] },
  });
  const [evidenceId, setEvidenceId] = useState<string | undefined>(() => {
    if (initial.query.view === 'intake') return initial.query.trendBucket ? `trend:${initial.query.trendBucket}` : undefined;
    if (initial.query.view === 'attention') return initial.query.selection;
    if (initial.query.view === 'pipeline' || initial.query.view === 'age') {
      const selection = initial.query.selection;
      return selection.kind === 'pipeline' ? undefined : selection.kind === 'stage' ? `stage:${selection.stage}` : `age:${selection.band}`;
    }
    return undefined;
  });
  const [page, setPage] = useState(initial.query.page), [pageSize, setPageSize] = useState<number>(initial.query.pageSize);
  const [retry, setRetry] = useState(0);
  const [exportKey, setExportKey] = useState<string>();
  const request = useMemo(() => leadReportRequest({ workspaceId: initial.workspaceId, view, period, today,
    filters, evidenceId, page, pageSize }), [initial.workspaceId, view, period, today, filters, evidenceId, page, pageSize]);
  const key = `${scopeKey}:${JSON.stringify(request)}:${retry}`;
  const [loaded, setLoaded] = useState<{ key: string; raw?: unknown; error?: string; denied?: boolean }>(() => ({ key, raw: initial }));
  useEffect(() => {
    if (loaded.key === key) return;
    const abort = new AbortController();
    let active = true;
    async function load() {
      try {
        const params = new URLSearchParams({ query: JSON.stringify(request) });
        const response = await fetch(`/api/reports/leads?${params}`, { cache: 'no-store', signal: abort.signal });
        const raw: unknown = await response.json();
        if (!response.ok) {
          const message = typeof raw === 'object' && raw !== null && 'error' in raw && typeof raw.error === 'string'
            ? raw.error : 'Leads report could not be loaded. Try again.';
          if (active) setLoaded({ key, error: message, denied: [401, 403, 404, 423].includes(response.status) });
          return;
        }
        adaptLeadReportResponse(raw, { request, scopeKey, today, timezone });
        if (active) setLoaded({ key, raw });
      } catch (error) {
        if (!active || abort.signal.aborted) return;
        setLoaded({ key, error: error instanceof Error ? error.message : 'Leads report could not be loaded. Try again.' });
      }
    }
    void load();
    return () => { active = false; abort.abort(); };
  }, [key, request, scopeKey, today, timezone, loaded.key]);
  const pending = loaded.key !== key;
  const authority = useMemo(() => {
    const parsed = leadReportReadResultSchema.safeParse(loaded.raw);
    return parsed.success ? parsed.data : undefined;
  }, [loaded.raw]);
  let projection: LeadReportProjection = { view, state: { kind: pending ? 'loading' : 'error' } };
  let adapted: ReturnType<typeof adaptLeadReportResponse> | undefined;
  let error = loaded.key === key ? loaded.error : undefined;
  if (!pending && loaded.raw) {
    try {
      adapted = adaptLeadReportResponse(loaded.raw, { request, scopeKey, today, timezone });
      projection = adapted.projection;
    } catch (failure) {
      error = failure instanceof Error ? failure.message : 'Leads report data is invalid. Reload the report.';
    }
  }
  const options = error ? {} : adapted?.options ?? initial.options;
  const denied = loaded.key === key && loaded.denied;
  const refresh = () => setRetry(value => value + 1);
  const unavailable = () => { throw new Error('Report configuration persistence is not integrated yet.'); };
  const canExport = !pending && !error && !!authority?.exportScope && !!adapted;
  const selectView = (value: NativeLeadReportView) => { setView(value); setEvidenceId(undefined); setPage(1); };
  return <ReportPageLayout area="leads" workspaceId={initial.workspaceId} query={request}
    period={'period' in request ? period : null} ready={!pending && !error && !!adapted} active={template} onRun={onTemplateRun}
    canRead={!denied} canExport={canExport} onExport={() => setExportKey(key)}>
    <main className="grid min-w-0 gap-6 p-4 sm:p-8">
    {error && <div className="grid justify-items-start gap-3">
      <FormFeedback kind="error" message={error} />
      <SeafoamButton label="Reload report access" onClick={onReload} />
    </div>}
    {!denied && ['intake', 'won', 'lost'].includes(view) && <ReportDateControls value={period} context="history"
      today={today} timezone={timezone} pending={pending} onApply={value => { setPeriod(value); setPage(1); setEvidenceId(undefined); }} />}
    <LeadReportWorkspace projection={projection} availableViews={nativeLeadReportViews} filters={filters}
      filterOptions={options} filterState={error ? 'error' : 'ready'} current={adapted?.current ?? { kind: pending ? 'loading' : 'error' }}
      canRead={!denied} canReadCurrent canReadConversion={false} canReadAcceptedValue={false} canExport={canExport} canEdit={false} pending={pending}
      onViewChange={value => { const native = nativeLeadReportViews.find(item => item === value); if (native) selectView(native); }}
      onFiltersChange={(context, value) => { setFilters(previous => ({ ...previous, [context]: value })); setPage(1); setEvidenceId(undefined); }}
      onRetryFilters={refresh} onRetry={refresh} onRetryCurrent={refresh}
      onEvidence={id => {
        if (id === 'won' || id === 'lost') { selectView(id); return; }
        if (id === 'pipeline' && view === 'intake') { selectView('pipeline'); return; }
        setEvidenceId(id); setPage(1);
      }}
      onRecord={id => {
        if (!pending && adapted?.projection.state.kind === 'ready' &&
          adapted.projection.state.result.rows.some(row => row.recordId === id)) onRecord(id);
      }}
      onPageChange={setPage} onPageSizeChange={size => { setPageSize(size); setPage(1); }}
      onExport={() => { if (canExport) setExportKey(key); }} onEdit={unavailable} />
    {exportKey === key && canExport && authority && <LeadReportExport key={key} open request={request} authority={authority}
      onClose={() => setExportKey(undefined)} onReload={onReload} />}
    </main>
  </ReportPageLayout>;
}
