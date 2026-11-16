'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { businessOverviewReadResultSchema, type BusinessOverviewReadResult, type ReportTemplate } from '@salesmora/contracts';
import { FormFeedback, SeafoamButton } from '@salesmora/ui';
import type { BusinessOverviewState } from './business-overview';
import { BusinessOverviewPage } from './business-overview-page';
import { businessOverviewRequest } from './business-overview.adapter';
import { adaptBusinessOverviewReadResponse, businessOverviewScopeKey } from './business-overview-read.adapter';
import { resolveReportPeriod, type ReportPeriodSelection } from '../report-date-controls/report-date-controls.validation';
import { useReportRead } from '../use-report-read';
import { BusinessOverviewExport } from './business-overview-export';
import { ReportPageLayout } from '../report-page-layout/report-page-layout';
import { TemplateSession, type TemplateRun } from '../report-templates/template-session';
import { overviewAttentionHref } from './business-overview-navigation';

export type BusinessOverviewReadPageProps = { initial: BusinessOverviewReadResult; onReload: () => void; onNavigate: (href: string) => void };
export function BusinessOverviewReadPage({ initial, onReload, onNavigate }: BusinessOverviewReadPageProps) {
  return <TemplateSession key={`${businessOverviewScopeKey(initial)}:${JSON.stringify(initial.report)}`}
    initial={initial} parse={businessOverviewReadResultSchema.parse}>
    {(result, template, run, revision) => <BusinessOverviewPageHost key={revision} initial={result} template={template} onTemplateRun={run} onReload={onReload} onNavigate={onNavigate} />}
  </TemplateSession>;
}
function BusinessOverviewPageHost({ initial, onReload, onNavigate, template, onTemplateRun }: BusinessOverviewReadPageProps & {
  template?: ReportTemplate; onTemplateRun: TemplateRun;
}) {
  const today = initial.report.today, timezone = initial.report.timezone, scopeKey = businessOverviewScopeKey(initial);
  const [period, setPeriod] = useState<ReportPeriodSelection>(template?.configuration.period ?? { preset: 'custom', ...initial.query.period });
  const [exportOpen, setExportOpen] = useState(false);
  const request = useMemo(() => {
    const range = resolveReportPeriod(period, today, 'history').range;
    if (!range) throw new Error('Choose a valid historical Overview period.');
    return businessOverviewRequest({ workspaceId: initial.workspaceId, range });
  }, [initial.workspaceId, period, today]);
  const key = `${scopeKey}:${today}:${timezone}:${JSON.stringify(request)}`;
  const validate = useCallback((raw: unknown) => { adaptBusinessOverviewReadResponse(raw, { request, period, scopeKey, today, timezone }); },
    [request, period, scopeKey, today, timezone]);
  const snapshotTimes = [
    ...[initial.report.leads, initial.report.jobs, initial.report.estimates]
      .flatMap(section => section.kind === 'available' ? Object.values(section.reads).map(read => Date.parse(read.asOf)) : []),
    ...(initial.report.calendar.kind === 'available' ? [Date.parse(initial.report.calendar.read.asOf)] : []),
  ];
  const loaded = useReportRead({ key, initial, initialUpdatedAt: snapshotTimes.length ? Math.min(...snapshotTimes) : 0, validate,
    url: `/api/reports/overview?${new URLSearchParams({ query: JSON.stringify(request) })}`,
    failureMessage: 'Business Overview could not be loaded. Try again.' });
  let state: BusinessOverviewState = { kind: loaded.pending ? 'loading' : 'error' };
  let error = loaded.key === key ? loaded.error : undefined;
  if (!loaded.pending && loaded.raw) {
    try { state = adaptBusinessOverviewReadResponse(loaded.raw, { request, period, scopeKey, today, timezone }).state; }
    catch (failure) { error = failure instanceof Error ? failure.message : 'Overview data is invalid. Reload the report.'; }
  }
  const report = <div className="grid min-w-0 gap-3">
    {exportOpen && <BusinessOverviewExport query={request} authority={initial} onClose={() => setExportOpen(false)} onReload={onReload} />}
    {error && <div className="grid justify-items-start gap-3 px-4 pt-4 sm:px-8">
      <FormFeedback kind="error" message={error} />
      <SeafoamButton label="Reload report access" onClick={onReload} />
    </div>}
    <BusinessOverviewPage state={state} period={period} today={today} timezone={timezone} canRead={!(loaded.key === key && loaded.denied)}
      canNavigateDetails={false} pending={loaded.pending} onPeriodApply={setPeriod}
      onAttention={id => onNavigate(overviewAttentionHref(id, initial.workspaceId, today))}
      onRetry={loaded.refresh} onEvidence={() => { throw new Error('Overview detail navigation is not integrated yet.'); }} />
  </div>;
  return <ReportPageLayout area="overview" workspaceId={initial.workspaceId} query={request} period={period}
    ready={!loaded.pending && !error && state.kind === 'ready'} active={template} onRun={onTemplateRun}
    canRead={!(loaded.key === key && loaded.denied)} canExport={!loaded.pending && !error && state.kind === 'ready'}
    onExport={() => setExportOpen(true)}>
    {report}
  </ReportPageLayout>;
}
export function BusinessOverviewRoute({ initial }: { initial: BusinessOverviewReadResult }) {
  const router = useRouter();
  return <BusinessOverviewReadPage initial={initial} onReload={() => router.refresh()} onNavigate={href => router.push(href)} />;
}
