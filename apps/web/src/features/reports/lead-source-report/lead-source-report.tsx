'use client';

import { useId } from 'react';
import { DataTable, FormFeedback, HelpTooltip, formatMoney } from '@salesmora/ui';
import { ReportSummary } from '../report-summary/report-summary';
import { ReportEvidenceTable, type ReportEvidenceRow } from '../report-evidence-table/report-evidence-table';
import { ReportResultState } from '../report-result-state/report-result-state';
import { formatReportDate } from '../report-date-controls/report-date-controls.validation';
import { leadSourceReportData as copy } from './lead-source-report.data';
import { formatLeadSourceRate, leadSourceLabels, validLeadSourceResult, type LeadSourceResult } from './lead-source-report.validation';

export type LeadSourceReportState = { kind: 'loading' | 'error' } | { kind: 'ready'; result: LeadSourceResult };
export type LeadSourceReportProps = {
  state: LeadSourceReportState;
  canRead: boolean;
  canReadConversion: boolean;
  canReadAcceptedValue: boolean;
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
const formatter = new Intl.NumberFormat('en-US');

/** Hosts group the creation cohort by current source and provide authorized conversion and frozen estimate-value projections. */
export function LeadSourceReport({ state, canRead, canReadConversion, canReadAcceptedValue, canExport, canEdit, pending = false,
  onEvidence, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit }: LeadSourceReportProps) {
  const id = useId();
  if (!canRead || state.kind !== 'ready') return <ReportResultState state={{ kind: state.kind === 'error' ? 'error' : 'loading' }}
    canRead={canRead} canEdit={canEdit} pending={pending} onRetry={onRetry} onEdit={onEdit} />;
  const result = state.result;
  if (!validLeadSourceResult(result, canReadConversion, canReadAcceptedValue))
    return <FormFeedback kind="error" message={copy.invalid} />;
  const conversion = canReadConversion && result.conversion.kind === 'available' ? result.conversion : undefined;
  const acceptedValue = canReadAcceptedValue && result.acceptedValue.kind === 'available' ? result.acceptedValue : undefined;
  const unavailableMoney = canReadAcceptedValue && result.acceptedValue.kind === 'unavailable'
    ? result.acceptedValue.explanation : copy.moneyPermission;
  const dateBasis = `Lead creation date / ${result.periodLabel} / linked Jobs and accepted estimates as of ${result.snapshotLabel}`;
  const evidence = result.evidence;
  const evidenceRows: readonly ReportEvidenceRow[] = evidence.kind === 'cohort'
    ? evidence.rows.map(row => ({ id: row.id, label: row.label, recordId: row.recordId,
      cells: { created: formatReportDate(row.createdDate), source: leadSourceLabels[row.source] } }))
    : evidence.kind === 'converted'
      ? evidence.rows.map(row => ({ id: row.id, label: row.label, recordId: row.recordId,
        cells: { created: formatReportDate(row.createdDate), source: leadSourceLabels[row.source], jobs: row.linkedJobs } }))
      : evidence.rows.map(row => ({ id: row.familyId, label: row.linkedLead?.label ?? row.label, recordId: row.linkedLead?.recordId,
        cells: {
          estimate: `${row.label} / ${row.estimateNumber} / revision ${row.revision}`,
          decision: `Accepted / version ${row.decisionVersion}`,
          accepted: formatReportDate(row.acceptedDate),
          source: row.source === null ? 'Unattributed' : leadSourceLabels[row.source],
          lead: row.linkedLead?.label ?? 'Ambiguous lead/source link',
          value: formatMoney(row.preTaxCents),
        } }));
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6 text-ink">
    <header className="grid min-w-0 gap-2">
      <div className="flex min-w-0 items-center gap-1">
        <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold">{copy.title}</h2>
        <HelpTooltip label={copy.help} paragraphs={[copy.definition, copy.conversion, copy.money, copy.unattributed,
          copy.provenance, copy.archives, result.scopeLabel]} />
      </div>
      <p className="m-0 text-sm font-semibold wrap-anywhere">{result.periodLabel}</p>
      <p className="m-0 text-xs text-muted wrap-anywhere">{result.snapshotLabel} / {result.scopeLabel}</p>
    </header>
    <ReportSummary canRead hideHeader fourColumns snapshotLabel={result.snapshotLabel} scopeLabel={result.scopeLabel} pending={pending} onEvidence={onEvidence}
      metrics={[
        { id: 'cohort', label: copy.cohort, value: { kind: 'count', value: result.cohort },
          dateBasisLabel: dateBasis, description: `${copy.definition} ${copy.archives}`, evidenceId: result.cohortEvidenceId },
        { id: 'converted', label: copy.converted, value: conversion ? { kind: 'count', value: conversion.converted }
          : { kind: 'unavailable', reason: copy.permission },
          dateBasisLabel: dateBasis, description: copy.conversion, evidenceId: conversion?.evidenceId },
        { id: 'rate', label: copy.rate, value: !conversion ? { kind: 'unavailable', reason: copy.permission }
          : result.cohort === 0 ? { kind: 'unavailable', reason: copy.empty }
            : { kind: 'formatted', displayValue: formatLeadSourceRate(result.cohort, conversion.converted) },
          dateBasisLabel: dateBasis, description: `${copy.conversion} Percentages are rounded to one decimal place.` },
        { id: 'accepted-value', label: copy.acceptedValue, value: acceptedValue
          ? { kind: 'formatted', displayValue: formatMoney(acceptedValue.preTaxCents) }
          : { kind: 'unavailable', reason: unavailableMoney },
          dateBasisLabel: dateBasis, description: `${copy.money} ${copy.unattributed}`,
          evidenceId: acceptedValue?.evidenceId },
      ]} />
    <section aria-labelledby={`${id}-breakdown`} className="grid min-w-0 gap-3">
      <div className="flex min-w-0 items-center gap-1">
        <h3 id={`${id}-breakdown`} className="m-0 text-xl font-semibold">{copy.breakdown}</h3>
        <HelpTooltip label="About current source breakdown" paragraphs={[copy.definition, copy.money, copy.unattributed, copy.provenance, copy.archives]} />
      </div>
      <DataTable caption={copy.breakdown} rows={result.groups} getRowId={row => row.source} getRowLabel={row => leadSourceLabels[row.source]}
        columns={[
          { id: 'source', label: 'Current recorded source', render: row => leadSourceLabels[row.source] },
          { id: 'cohort', label: 'Cohort leads', render: row => formatter.format(row.cohort) },
          { id: 'converted', label: 'Converted leads', render: row => row.converted === null || !conversion ? 'Unavailable' : formatter.format(row.converted) },
          { id: 'rate', label: 'Conversion', render: row => !conversion ? 'Unavailable'
            : row.cohort === 0 ? '—' : formatLeadSourceRate(row.cohort, row.converted!) },
          { id: 'acceptedCount', label: 'Accepted estimate families', render: row => !acceptedValue || row.acceptedEstimateCount === null
            ? copy.unavailable : formatter.format(row.acceptedEstimateCount) },
          { id: 'acceptedValue', label: copy.acceptedValue, render: row => !acceptedValue || row.acceptedValueCents === null
            ? copy.unavailable : formatMoney(row.acceptedValueCents) },
        ]}
        renderCard={row => <dl className="m-0 grid min-w-0 grid-cols-2 gap-3">
          <div className="col-span-2"><dt className="text-xs font-semibold text-muted">Current recorded source</dt><dd className="m-0 mt-1 text-sm font-semibold">{leadSourceLabels[row.source]}</dd></div>
          <div><dt className="text-xs font-semibold text-muted">Cohort leads</dt><dd className="m-0 mt-1 text-sm">{formatter.format(row.cohort)}</dd></div>
          <div><dt className="text-xs font-semibold text-muted">Converted leads</dt><dd className="m-0 mt-1 text-sm">{row.converted === null || !conversion ? 'Unavailable' : formatter.format(row.converted)}</dd></div>
          <div className="col-span-2"><dt className="text-xs font-semibold text-muted">Conversion</dt><dd className="m-0 mt-1 text-sm">
            {!conversion ? 'Unavailable' : row.cohort === 0 ? '—' : formatLeadSourceRate(row.cohort, row.converted!)}</dd></div>
          <div className="col-span-2"><dt className="text-xs font-semibold text-muted">{copy.acceptedValue}</dt><dd className="m-0 mt-1 text-sm">
            {!acceptedValue || row.acceptedValueCents === null ? copy.unavailable : formatMoney(row.acceptedValueCents)}</dd></div>
          <div className="col-span-2"><dt className="text-xs font-semibold text-muted">Accepted estimate families</dt><dd className="m-0 mt-1 text-sm">
            {!acceptedValue || row.acceptedEstimateCount === null ? copy.unavailable : formatter.format(row.acceptedEstimateCount)}</dd></div>
        </dl>}
      />
      <p className="m-0 text-sm text-muted">{copy.provenance} Source labels are editable; zero-count sources are included.</p>
      {acceptedValue && <p className="m-0 text-sm text-muted wrap-anywhere">
        <strong className="text-ink">{copy.unattributedValue}:</strong>{' '}
        <strong className="text-ink tabular-nums">{formatMoney(acceptedValue.unattributedPreTaxCents)}
        {' '}({formatter.format(acceptedValue.unattributedCount)} {acceptedValue.unattributedCount === 1 ? 'family' : 'families'})</strong>
        {' / '}{copy.unattributed}
      </p>}
    </section>
    <ReportEvidenceTable viewLabel={evidence.kind === 'cohort' ? copy.evidence.cohort
      : evidence.kind === 'converted' ? copy.evidence.converted : copy.evidence.estimates} contextInTooltip
      contextLabel={`${dateBasis} / ${result.scopeLabel} / ${copy.conversion} / ${copy.money} / ${copy.provenance}`}
      columns={evidence.kind === 'cohort' ? [{ id: 'created', label: 'Lead creation date' }, { id: 'source', label: 'Current recorded source' }]
        : evidence.kind === 'converted' ? [{ id: 'created', label: 'Lead creation date' }, { id: 'source', label: 'Current recorded source' }, { id: 'jobs', label: 'Surviving authorized linked Jobs' }]
          : [{ id: 'estimate', label: 'Accepted estimate family' }, { id: 'decision', label: 'Effective accepted decision' }, { id: 'accepted', label: 'Effective accepted date' },
            { id: 'source', label: 'Current recorded source' }, { id: 'lead', label: 'Linked lead' }, { id: 'value', label: 'Frozen pre-tax value' }]}
      rows={evidenceRows}
      total={evidence.kind === 'cohort' ? result.cohort
        : evidence.kind === 'converted' ? conversion!.converted : acceptedValue!.estimateCount}
      page={result.page} pageSize={result.pageSize} canRead canExport={canExport} canEdit={canEdit} pending={pending}
      onRecord={onRecord} onExport={onExport} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange}
      onRetry={onRetry} onEdit={onEdit} />
  </section>;
}
