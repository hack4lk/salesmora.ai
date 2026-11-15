'use client';

import { useId } from 'react';
import { FormFeedback, HelpTooltip } from '@salesmora/ui';
import { ReportSummary, type ReportSummaryMetric } from '../report-summary/report-summary';
import { ReportEvidenceTable, type ReportEvidenceRow } from '../report-evidence-table/report-evidence-table';
import { ReportResultState } from '../report-result-state/report-result-state';
import { formatLeadConversionRate, validLeadConversionCounts } from './lead-conversion-report.validation';
import { leadConversionReportData as copy } from './lead-conversion-report.data';

export type LeadConversionResult = {
  periodLabel: string;
  snapshotLabel: string;
  scopeLabel: string;
  cohort: number;
  cohortEvidenceId?: string;
  conversion:
    | { kind: 'unavailable' }
    | { kind: 'available'; converted: number; evidenceId?: string;
      rows: readonly ReportEvidenceRow[]; page: number; pageSize: number };
};
export type LeadConversionReportState = { kind: 'loading' | 'error' } | { kind: 'ready'; result: LeadConversionResult };
export type LeadConversionReportProps = {
  state: LeadConversionReportState;
  canRead: boolean;
  /** Explicit host decision proving complete cross-domain visibility; not inferred from role or export access. */
  canReadConversion: boolean;
  canExport: boolean;
  canEdit: boolean;
  pending?: boolean;
  onEvidence: (evidenceId: string) => void;
  onRecord: (recordId: string) => void;
  onExport: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRetry: () => void;
  onEdit: () => void;
};

export function LeadConversionReport({ state, canRead, canReadConversion, canExport, canEdit, pending = false,
  onEvidence, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit }: LeadConversionReportProps) {
  const id = useId();
  if (!canRead || state.kind !== 'ready') return <ReportResultState state={{ kind: state.kind === 'error' ? 'error' : 'loading' }}
    canRead={canRead} canEdit={canEdit} pending={pending} onRetry={onRetry} onEdit={onEdit} />;
  const result = state.result;
  const conversion = canReadConversion && result.conversion.kind === 'available' ? result.conversion : undefined;
  if (!validLeadConversionCounts(result.cohort, conversion?.converted ?? 0)) return <FormFeedback kind="error" message={copy.invalid} />;
  if (conversion) {
    const { rows, page, pageSize, converted } = conversion;
    const valid = Number.isSafeInteger(page) && page > 0 && Number.isSafeInteger(pageSize) && pageSize > 0 &&
      page <= Math.max(1, Math.ceil(converted / pageSize)) &&
      rows.length === Math.min(pageSize, Math.max(0, converted - (page - 1) * pageSize)) &&
      new Set(rows.map(row => row.id)).size === rows.length &&
      rows.every(row => row.id.trim() && ['created', 'jobs'].every(column => Object.hasOwn(row.cells, column)) && row.cells.jobs !== null && !!row.cells.jobs?.trim());
    if (!valid) return <FormFeedback kind="error" message={copy.invalid} />;
  }
  const dateBasisLabel = `Lead creation date / ${result.periodLabel} / linked Jobs as of ${result.snapshotLabel}`;
  const metrics: ReportSummaryMetric[] = [
    { id: 'cohort', label: copy.cohort, value: { kind: 'count', value: result.cohort },
      description: `Distinct authorized leads created in the selected period. ${copy.archives}`, dateBasisLabel, evidenceId: result.cohortEvidenceId },
    { id: 'converted', label: copy.converted, value: conversion ? { kind: 'count', value: conversion.converted } : { kind: 'unavailable', reason: copy.permission },
      description: `${copy.definition} ${copy.timing}`, dateBasisLabel, evidenceId: conversion?.evidenceId },
    { id: 'rate', label: copy.rate, value: !conversion ? { kind: 'unavailable', reason: copy.permission }
      : result.cohort === 0 ? { kind: 'unavailable', reason: copy.empty }
        : { kind: 'formatted', displayValue: formatLeadConversionRate(result.cohort, conversion.converted) },
      description: `${copy.definition} ${copy.caution} Percentages are rounded to one decimal place.`, dateBasisLabel },
  ];
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6 text-ink">
    <header className="grid min-w-0 gap-2">
      <div className="flex min-w-0 items-center gap-1">
        <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold">{copy.title}</h2>
        <HelpTooltip label={copy.help} paragraphs={[copy.definition, copy.timing, copy.caution, copy.archives, result.scopeLabel]} />
      </div>
      <p className="m-0 text-sm font-semibold wrap-anywhere">{result.periodLabel}</p>
      <p className="m-0 text-xs text-muted wrap-anywhere">{result.snapshotLabel} / {result.scopeLabel}</p>
    </header>
    <ReportSummary canRead hideHeader threeColumns metrics={metrics} snapshotLabel={result.snapshotLabel} scopeLabel={result.scopeLabel}
      pending={pending} onEvidence={onEvidence} />
    {conversion && <ReportEvidenceTable viewLabel={copy.evidence} contextInTooltip
      contextLabel={`${dateBasisLabel} / ${result.scopeLabel} / ${copy.timing} / ${copy.evidenceDefinition}`}
      columns={[{ id: 'created', label: 'Lead creation date' }, { id: 'jobs', label: 'Surviving linked Job evidence' }]}
      rows={conversion.rows} total={conversion.converted} page={conversion.page} pageSize={conversion.pageSize}
      canRead canExport={canExport} canEdit={canEdit} pending={pending} onRecord={onRecord} onExport={onExport}
      onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} onRetry={onRetry} onEdit={onEdit} />}
  </section>;
}
