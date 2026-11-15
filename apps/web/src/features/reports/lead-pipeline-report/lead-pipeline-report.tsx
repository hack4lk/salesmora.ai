'use client';

import { useId } from 'react';
import { FormFeedback, HelpTooltip } from '@salesmora/ui';
import { ReportBreakdown } from '../report-breakdown/report-breakdown';
import { validReportBreakdown } from '../report-breakdown/report-breakdown.validation';
import { ReportSummary } from '../report-summary/report-summary';
import { ReportEvidenceTable, type ReportEvidenceRow } from '../report-evidence-table/report-evidence-table';
import { ReportResultState } from '../report-result-state/report-result-state';
import { leadAgeBand, type LeadAgeBand } from './lead-pipeline-report.validation';
import { leadPipelineReportData as copy } from './lead-pipeline-report.data';
import { ReportDashboardLayout } from '../report-dashboard-layout/report-dashboard-layout';

export type OpenLeadStage = keyof typeof copy.stages;
export type LeadPipelineRow = ReportEvidenceRow & { stage: OpenLeadStage; ageDays: number };
export type LeadPipelineView = { kind: 'pipeline' } | { kind: 'stage'; stage: OpenLeadStage } | { kind: 'age'; band: LeadAgeBand };
export type LeadPipelineResult = {
  snapshotLabel: string;
  scopeLabel: string;
  total: number;
  stages: Readonly<Record<OpenLeadStage, number>>;
  ages: Readonly<Record<LeadAgeBand, number>>;
  evidenceIds: Readonly<Partial<Record<OpenLeadStage | LeadAgeBand | 'pipeline', string>>>;
  selectedView: LeadPipelineView;
  rows: readonly LeadPipelineRow[];
  page: number;
  pageSize: number;
};
export type LeadPipelineReportState = { kind: 'loading' | 'error' } | { kind: 'ready'; result: LeadPipelineResult };
export type LeadPipelineReportProps = {
  state: LeadPipelineReportState;
  canRead: boolean;
  canExport: boolean;
  canEdit: boolean;
  pending?: boolean;
  dashboard?: boolean;
  breakdown?: 'both' | 'stage' | 'age';
  onEvidence: (evidenceId: string) => void;
  onRecord: (recordId: string) => void;
  onExport: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRetry: () => void;
  onEdit: () => void;
};
const stages: readonly OpenLeadStage[] = ['new', 'contacted', 'estimate_sent'];
const bands: readonly LeadAgeBand[] = ['0-7', '8-14', '15-30', '31+'];

export function LeadPipelineReport({ state, canRead, canExport, canEdit, pending = false, dashboard = false, breakdown = 'both',
  onEvidence, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit }: LeadPipelineReportProps) {
  const id = useId();
  if (!canRead || state.kind !== 'ready') return <ReportResultState state={{ kind: state.kind === 'error' ? 'error' : 'loading' }}
    canRead={canRead} canEdit={canEdit} pending={pending} onRetry={onRetry} onEdit={onEdit} />;
  const result = state.result, view = result.selectedView;
  const stageGroups = stages.map(stage => ({ id: stage, label: copy.stages[stage], count: result.stages[stage], evidenceId: result.evidenceIds[stage] }));
  const ageGroups = bands.map(band => ({ id: band, label: copy.bands[band], count: result.ages[band], evidenceId: result.evidenceIds[band] }));
  const total = view.kind === 'pipeline' ? result.total : view.kind === 'stage' ? result.stages[view.stage] : result.ages[view.band];
  const valid = validReportBreakdown(result.total, stageGroups) && validReportBreakdown(result.total, ageGroups) &&
    Number.isSafeInteger(result.page) && result.page > 0 && Number.isSafeInteger(result.pageSize) && result.pageSize > 0 &&
    result.page <= Math.max(1, Math.ceil(total / result.pageSize)) &&
    result.rows.length === Math.min(result.pageSize, Math.max(0, total - (result.page - 1) * result.pageSize)) &&
    new Set(result.rows.map(row => row.id)).size === result.rows.length &&
    result.rows.every(row => row.id.trim() && stages.includes(row.stage) && leadAgeBand(row.ageDays) !== undefined &&
      (view.kind !== 'stage' || row.stage === view.stage) && (view.kind !== 'age' || leadAgeBand(row.ageDays) === view.band) &&
      ['created', 'owner', 'activity'].every(column => Object.hasOwn(row.cells, column)));
  if (!valid) return <FormFeedback kind="error" message={copy.invalid} />;
  const label = view.kind === 'pipeline' ? 'Current open pipeline' : view.kind === 'stage' ? copy.stages[view.stage] : copy.bands[view.band];
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6 text-ink">
    <header className="grid gap-2">
      <div className="flex min-w-0 items-center gap-1">
        <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold">{copy.title}</h2>
        <HelpTooltip label={copy.help} paragraphs={[copy.scope, result.scopeLabel, copy.age, copy.activity]} />
      </div>
      <p className="m-0 text-sm text-muted wrap-anywhere">{result.snapshotLabel} / {copy.mode}</p>
    </header>
    <ReportDashboardLayout dashboard={dashboard} summary={<ReportSummary canRead hideHeader compact={dashboard} snapshotLabel={result.snapshotLabel} scopeLabel={result.scopeLabel} pending={pending} onEvidence={onEvidence}
      metrics={[{ id: 'pipeline', label: 'Current open pipeline', value: { kind: 'count', value: result.total },
        description: copy.scope, dateBasisLabel: `${copy.mode} / ${result.snapshotLabel}`, evidenceId: result.evidenceIds.pipeline }]} />}>
    <div className={breakdown === 'both' ? 'grid min-w-0 gap-6 lg:grid-cols-2' : 'grid min-w-0 gap-6'}>
      {breakdown !== 'age' && <ReportBreakdown groupLabel="Current stage" total={result.total} groups={stageGroups} contextLabel={copy.mode} canRead pending={pending} onEvidence={onEvidence} />}
      {breakdown !== 'stage' && <ReportBreakdown groupLabel="Lead age" total={result.total} groups={ageGroups} contextLabel="Business-local days since creation" canRead pending={pending} onEvidence={onEvidence} />}
    </div>
    <ReportEvidenceTable viewLabel={label} contextInTooltip
      contextLabel={`${result.snapshotLabel} / ${copy.mode} / ${result.scopeLabel} / ${copy.scope} / ${copy.age} / ${copy.activity}`}
      columns={[{ id: 'stage', label: 'Current stage' }, { id: 'created', label: 'Creation date' }, { id: 'age', label: 'Lead age (local days)' },
        { id: 'owner', label: 'Current primary owner' }, { id: 'activity', label: 'Last recorded activity' }]}
      rows={result.rows.map(row => ({ ...row, cells: { ...row.cells, stage: copy.stages[row.stage], age: String(row.ageDays) } }))}
      total={total} page={result.page} pageSize={result.pageSize} canRead canExport={canExport} canEdit={canEdit} pending={pending}
      onRecord={onRecord} onExport={onExport} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} onRetry={onRetry} onEdit={onEdit} />
    </ReportDashboardLayout>
  </section>;
}
