'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { financialReportQuerySchema, financialReportReadResultSchema, type FinancialReportReadResult, type ReportTemplate } from '@salesmora/contracts';
import { FormFeedback, SeafoamButton } from '@salesmora/ui';
import { FinancialReport, type FinancialReportState } from './financial-report';
import { adaptFinancialReadResponse, financialReportScopeKey, financialReportAccess,
  visibleFinancialRecord, type FinancialRecordReference } from './financial-report.adapter';
import { resolveReportPeriod, type ReportPeriodSelection } from '../report-date-controls/report-date-controls.validation';
import { useReportRead } from '../use-report-read';
import { FinancialExport } from './financial-export';
import { ReportPageLayout } from '../report-page-layout/report-page-layout';
import { TemplateSession, type TemplateRun } from '../report-templates/template-session';

export type FinancialReportPageProps = {
  initial: FinancialReportReadResult; onRecord: (record: FinancialRecordReference) => void; onReload: () => void;
};
export function FinancialReportPage({ initial, ...actions }: FinancialReportPageProps) {
  const stamps = [initial.reports.accepted.estimates, initial.reports.awaiting.estimates]
    .map(section => section.kind === 'unavailable' ? '' : section.report.asOf);
  return <TemplateSession key={`${financialReportScopeKey(initial)}:${initial.reports.materials.asOf}:${stamps.join(':')}`}
    initial={initial} parse={financialReportReadResultSchema.parse}>
    {(result, template, run, revision) => <FinancialReportPageHost key={revision} initial={result} template={template} onTemplateRun={run} {...actions} />}
  </TemplateSession>;
}
function FinancialReportPageHost({ initial, onRecord, onReload, template, onTemplateRun }: FinancialReportPageProps & {
  template?: ReportTemplate; onTemplateRun: TemplateRun;
}) {
  const today = initial.today, timezone = initial.timezone, scopeKey = financialReportScopeKey(initial);
  const [period, setPeriod] = useState<ReportPeriodSelection>(template?.configuration.period ?? { preset: 'custom', ...initial.query.period });
  const [selected, setSelected] = useState(initial.query.selected);
  const [page, setPage] = useState(initial.query.page), [pageSize, setPageSize] = useState<number>(initial.query.pageSize);
  const [retry, setRetry] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);
  const range = useMemo(() => {
    const resolved = resolveReportPeriod(period, today, 'history').range;
    if (!resolved) throw new Error('Choose a valid Financial report period.');
    return { from: resolved.from, to: resolved.to };
  }, [period, today]);
  const request = useMemo(() => financialReportQuerySchema.parse({
    workspaceId: initial.workspaceId, view: 'financial', period: range, selected, page, pageSize,
  }), [initial.workspaceId, range, selected, page, pageSize]);
  const key = `${scopeKey}:${JSON.stringify(request)}:${retry}`;
  const adaptationInput = useMemo(() => ({ request, period, scopeKey, today, timezone }), [request, period, scopeKey, today, timezone]);
  const validate = useCallback((raw: unknown) => { adaptFinancialReadResponse(raw, adaptationInput); }, [adaptationInput]);
  const loaded = useReportRead({ key, initial, validate,
    url: `/api/reports/financial?${new URLSearchParams({ query: JSON.stringify(request) })}`,
    failureMessage: 'Financial report could not be loaded. Try again.' });
  let adapted: ReturnType<typeof adaptFinancialReadResponse> | undefined, raw: FinancialReportReadResult | undefined;
  let error = loaded.key === key ? loaded.error : undefined;
  if (!loaded.pending && loaded.raw) {
    try {
      adapted = adaptFinancialReadResponse(loaded.raw, adaptationInput);
      raw = financialReportReadResultSchema.parse(loaded.raw);
    } catch (failure) { error = failure instanceof Error ? failure.message : 'Financial report data is invalid. Reload the report.'; }
  }
  const state: FinancialReportState = adapted?.state ?? (loaded.pending ? { kind: 'loading' } : { kind: 'error', message: error });
  const exportAllowed = raw && (selected === 'materials' ? raw.exportAccess.materials : raw.exportAccess.estimates);
  return <ReportPageLayout area="financial" workspaceId={initial.workspaceId}
    query={request} period={period} ready={!loaded.pending && !error && !!raw} active={template} onRun={onTemplateRun}
    canRead={!(loaded.key === key && loaded.denied)} canExport={!!exportAllowed && !loaded.pending && !error}
    onExport={() => setExportOpen(true)}>
    <main className="grid min-w-0 gap-6 p-4 sm:p-8">
    {error && <div className="grid justify-items-start gap-3">
      <FormFeedback kind="error" message={error} /><SeafoamButton label="Reload report access" onClick={onReload} />
    </div>}
    <FinancialReport state={state} period={period} today={today} timezone={timezone}
      access={raw ? financialReportAccess(raw) : { canReadEstimates: false, canReadEstimateValues: false,
        canReadWorkOrders: false, canReadWorkOrderCosts: false }}
      canRead={!(loaded.key === key && loaded.denied)} pending={loaded.pending}
      onPeriodApply={value => { setPeriod(value); setSelected('accepted'); setPage(1); }}
      onEvidence={value => { if (!loaded.pending && raw) { setSelected(value); setPage(1); } }}
      onRecord={id => { if (!loaded.pending && raw) { const record = visibleFinancialRecord(raw, id); if (record) onRecord(record); } }}
      onPageChange={setPage} onPageSizeChange={size => { setPageSize(size); setPage(1); }}
      onRetry={() => setRetry(value => value + 1)} />
    {exportOpen && raw && exportAllowed && !loaded.pending && !error && <FinancialExport
      key={`${scopeKey}:${JSON.stringify(request)}`} request={request} authority={raw}
      onClose={() => setExportOpen(false)} onReload={onReload} />}
    </main>
  </ReportPageLayout>;
}
export function FinancialReportRoute({ initial }: { initial: FinancialReportReadResult }) {
  const router = useRouter();
  return <FinancialReportPage initial={initial} onReload={() => router.refresh()}
    onRecord={record => router.push(`/${record.kind === 'estimate' ? 'estimates' : 'work-orders'}/${encodeURIComponent(record.recordId)}?workspace=${encodeURIComponent(initial.workspaceId)}`)} />;
}
