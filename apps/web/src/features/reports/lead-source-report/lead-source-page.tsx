'use client';

import { useCallback, useMemo, useState } from 'react';
import { leadSourceReadResultSchema, type LeadSourceReadResult, type ReportTemplate } from '@salesmora/contracts';
import { FormFeedback, SeafoamButton } from '@salesmora/ui';
import { LeadSourceReport, type LeadSourceReportState } from './lead-source-report';
import { leadSourceReportRequest } from './lead-source-report.adapter';
import { adaptLeadSourceReadResponse, leadSourceScopeKey } from './lead-source-read.adapter';
import { ReportDateControls } from '../report-date-controls/report-date-controls';
import { resolveReportPeriod, type ReportPeriodSelection } from '../report-date-controls/report-date-controls.validation';
import { useReportRead } from '../use-report-read';
import { LeadSourceExport } from './lead-source-export';
import { ReportPageLayout } from '../report-page-layout/report-page-layout';
import { TemplateSession, type TemplateRun } from '../report-templates/template-session';

export type LeadSourcePageProps = { initial: LeadSourceReadResult; onRecord: (id: string) => void; onReload: () => void };
export function LeadSourcePage({ initial, onRecord, onReload }: LeadSourcePageProps) {
  return <TemplateSession key={`${leadSourceScopeKey(initial)}:${initial.report.asOf}`} initial={initial} parse={leadSourceReadResultSchema.parse}>
    {(result, template, run, revision) => <LeadSourcePageHost key={revision} initial={result} template={template} onTemplateRun={run} onRecord={onRecord} onReload={onReload} />}
  </TemplateSession>;
}
function LeadSourcePageHost({ initial, onRecord, onReload, template, onTemplateRun }: LeadSourcePageProps & {
  template?: ReportTemplate; onTemplateRun: TemplateRun;
}) {
  const today = initial.report.today, timezone = initial.report.timezone, scopeKey = leadSourceScopeKey(initial);
  const [period, setPeriod] = useState<ReportPeriodSelection>(template?.configuration.period ?? { preset: 'custom', ...initial.query.period });
  const [evidenceId, setEvidenceId] = useState(initial.query.selected === 'converted' ? 'source-converted'
    : initial.query.selected === 'accepted-estimates' ? 'source-accepted-value' : 'source-cohort');
  const [page, setPage] = useState(initial.query.page), [pageSize, setPageSize] = useState<number>(initial.query.pageSize);
  const [retry, setRetry] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);
  const request = useMemo(() => {
    const range = resolveReportPeriod(period, today, 'history').range;
    if (!range) throw new Error('Choose a valid historical Sources report period.');
    return leadSourceReportRequest({ workspaceId: initial.workspaceId, range, evidenceId, page, pageSize,
      filters: { stages: [], owners: [], sources: [] } });
  }, [initial.workspaceId, period, today, evidenceId, page, pageSize]);
  const key = `${scopeKey}:${JSON.stringify(request)}:${retry}`;
  const validate = useCallback((raw: unknown) => { adaptLeadSourceReadResponse(raw, { request, scopeKey, today, timezone }); },
    [request, scopeKey, today, timezone]);
  const loaded = useReportRead({ key, initial, validate,
    url: `/api/reports/sources?${new URLSearchParams({ query: JSON.stringify(request) })}`,
    failureMessage: 'Sources report could not be loaded. Try again.' });
  const pending = loaded.pending;
  let state: LeadSourceReportState = { kind: pending ? 'loading' : 'error' };
  let error = loaded.key === key ? loaded.error : undefined;
  if (!pending && loaded.raw) {
    try { state = adaptLeadSourceReadResponse(loaded.raw, { request, scopeKey, today, timezone }).state; }
    catch (failure) { error = failure instanceof Error ? failure.message : 'Sources report data is invalid. Reload the report.'; }
  }
  const denied = loaded.key === key && loaded.denied;
  return <ReportPageLayout area="sources" workspaceId={initial.workspaceId} query={request} period={period}
    ready={!pending && !error && state.kind === 'ready'} active={template} onRun={onTemplateRun}
    canRead={!denied} canExport={!pending && !error && state.kind === 'ready' && initial.canExport}
    onExport={() => setExportOpen(true)}>
    <main className="grid min-w-0 gap-6 p-4 sm:p-8">
    {error && <div className="grid justify-items-start gap-3">
      <FormFeedback kind="error" message={error} />
      <SeafoamButton label="Reload report access" onClick={onReload} />
    </div>}
    {!denied && <ReportDateControls value={period} context="history" today={today} timezone={timezone} pending={pending}
      onApply={value => { setPeriod(value); setEvidenceId('source-cohort'); setPage(1); }} />}
    <LeadSourceReport state={state} canRead={!denied} canReadConversion={initial.canReadConversion}
      canReadAcceptedValue={initial.canReadAcceptedValue} canExport={initial.canExport} canEdit={false} pending={pending}
      onEvidence={id => {
        if (state.kind !== 'ready' || pending) return;
        if (id === 'source-cohort' || id === 'source-converted' && state.result.conversion.kind === 'available' ||
          id === 'source-accepted-value' && state.result.acceptedValue.kind === 'available') {
          setEvidenceId(id); setPage(1);
        } else throw new Error('This Sources evidence selection is unavailable.');
      }}
      onRecord={id => {
        if (state.kind !== 'ready' || pending) return;
        const evidence = state.result.evidence;
        const visible = evidence.kind === 'accepted-estimates'
          ? evidence.rows.some(row => row.linkedLead?.recordId === id) : evidence.rows.some(row => row.recordId === id);
        if (visible) onRecord(id);
      }}
      onPageChange={setPage} onPageSizeChange={size => { setPageSize(size); setPage(1); }}
      onRetry={() => setRetry(value => value + 1)} onExport={() => setExportOpen(true)}
      onEdit={() => { throw new Error('Sources report configuration is not available.'); }} />
    <LeadSourceExport open={exportOpen} onClose={() => setExportOpen(false)} request={request}
      authority={initial} onReload={onReload} />
    </main>
  </ReportPageLayout>;
}
