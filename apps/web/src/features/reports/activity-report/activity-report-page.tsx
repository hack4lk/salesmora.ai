'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { activityReportReadResultSchema, type ActivityReportReadResult, type ReportTemplate } from '@salesmora/contracts';
import { FormFeedback, SeafoamButton } from '@salesmora/ui';
import { ActivityReport, type ActivityReportState, type ActivityRecordReference } from './activity-report';
import { activityReportRequest, activityReportScopeKey, adaptActivityReadResponse, visibleActivityRecord } from './activity-report.adapter';
import type { ActivityFiltersValue } from './activity-report.validation';
import { resolveReportPeriod, type ReportPeriodSelection } from '../report-date-controls/report-date-controls.validation';
import { useReportRead } from '../use-report-read';
import { ActivityExport } from './activity-export';
import { ReportPageLayout } from '../report-page-layout/report-page-layout';
import { TemplateSession, type TemplateRun } from '../report-templates/template-session';

export type ActivityReportPageProps = {
  initial: ActivityReportReadResult; onRecord: (record: ActivityRecordReference) => void; onReload: () => void;
};
export function ActivityReportPage({ initial, ...actions }: ActivityReportPageProps) {
  return <TemplateSession key={`${activityReportScopeKey(initial)}:${initial.report.asOf}`} initial={initial} parse={activityReportReadResultSchema.parse}>
    {(result, template, run, revision) => <ActivityReportPageHost key={revision} initial={result} template={template} onTemplateRun={run} {...actions} />}
  </TemplateSession>;
}
function ActivityReportPageHost({ initial, onRecord, onReload, template, onTemplateRun }: ActivityReportPageProps & {
  template?: ReportTemplate; onTemplateRun: TemplateRun;
}) {
  const today = initial.report.today, timezone = initial.report.timezone, scopeKey = activityReportScopeKey(initial);
  const [period, setPeriod] = useState<ReportPeriodSelection>(template?.configuration.period ?? { preset: 'custom', ...initial.query.period });
  const [filters, setFilters] = useState<ActivityFiltersValue>(initial.query.filters);
  const [page, setPage] = useState(initial.query.page), [pageSize, setPageSize] = useState<number>(initial.query.pageSize);
  const [exportOpen, setExportOpen] = useState(false);
  const range = useMemo(() => {
    const resolved = resolveReportPeriod(period, today, 'history').range;
    if (!resolved) throw new Error('Choose a valid Activity report period.');
    return resolved;
  }, [period, today]);
  const request = useMemo(() => activityReportRequest({ workspaceId: initial.workspaceId, range, filters, page, pageSize }),
    [initial.workspaceId, range, filters, page, pageSize]);
  const key = `${scopeKey}:${today}:${timezone}:${JSON.stringify(request)}`;
  const adaptationInput = useMemo(() => ({ request, period, scopeKey, today, timezone,
    includedDomains: initial.report.includedDomains }), [request, period, scopeKey, today, timezone, initial.report.includedDomains]);
  const validate = useCallback((raw: unknown) => { adaptActivityReadResponse(raw, adaptationInput); }, [adaptationInput]);
  const loaded = useReportRead({ key, initial, initialUpdatedAt: Date.parse(initial.report.asOf), validate,
    url: `/api/reports/activity?${new URLSearchParams({ query: JSON.stringify(request) })}`,
    failureMessage: 'Activity report could not be loaded. Try again.' });
  let adapted: ReturnType<typeof adaptActivityReadResponse> | undefined;
  let raw: ActivityReportReadResult | undefined;
  let error = loaded.key === key ? loaded.error : undefined;
  if (!loaded.pending && loaded.raw) {
    try {
      adapted = adaptActivityReadResponse(loaded.raw, adaptationInput);
      raw = activityReportReadResultSchema.parse(loaded.raw);
    } catch (failure) { error = failure instanceof Error ? failure.message : 'Activity report data is invalid. Reload the report.'; }
  }
  const denied = loaded.key === key && loaded.denied;
  const state: ActivityReportState = adapted?.state ?? (loaded.pending ? { kind: 'loading' } : { kind: 'error', message: error });
  return <ReportPageLayout area="activity" workspaceId={initial.workspaceId} query={request} period={period}
    ready={!loaded.pending && !error && !!raw} active={template} onRun={onTemplateRun}
    canRead={!denied} canExport={!loaded.pending && !error && !!raw?.exportScopes.length} onExport={() => setExportOpen(true)}>
    <main className="grid min-w-0 gap-6 p-4 sm:p-8">
    {error && <div className="grid justify-items-start gap-3">
      <FormFeedback kind="error" message={error} /><SeafoamButton label="Reload report access" onClick={onReload} />
    </div>}
    <ActivityReport state={state} period={period} filters={filters}
      filterOptions={adapted?.filterOptions ?? { domains: [], actions: [], actors: [] }}
      today={today} timezone={timezone} canRead={!denied} pending={loaded.pending}
      filterState={loaded.pending ? 'loading' : error ? 'error' : 'ready'}
      onPeriodApply={value => { setPeriod(value); setFilters({ domains: [], actions: [], actors: [] }); setPage(1); }}
      onFiltersChange={value => { setFilters(value); setPage(1); }}
      onRetryFilters={loaded.refresh} onRetry={loaded.refresh}
      onRecord={record => { if (!loaded.pending && raw && visibleActivityRecord(raw, record)) onRecord(record); }}
      onPageChange={setPage} onPageSizeChange={size => { setPageSize(size); setPage(1); }} />
    {exportOpen && raw && !loaded.pending && !error && raw.exportScopes.length > 0 && <ActivityExport
      key={`${scopeKey}:${JSON.stringify(request)}`} request={request} authority={raw}
      onClose={() => setExportOpen(false)} onReload={onReload} />}
    </main>
  </ReportPageLayout>;
}
export function ActivityReportRoute({ initial }: { initial: ActivityReportReadResult }) {
  const router = useRouter();
  const routes = { lead: 'leads', customer: 'customers', job: 'jobs', estimate: 'estimates', 'work-order': 'work-orders' } as const;
  return <ActivityReportPage initial={initial} onReload={() => router.refresh()}
    onRecord={record => router.push(`/${routes[record.domain]}/${encodeURIComponent(record.recordId)}?workspace=${encodeURIComponent(initial.workspaceId)}`)} />;
}
