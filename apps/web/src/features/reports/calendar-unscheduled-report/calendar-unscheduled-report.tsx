'use client';

import { useId } from 'react';
import { FormFeedback, HelpTooltip } from '@salesmora/ui';
import { ReportSummary } from '../report-summary/report-summary';
import { ReportEvidenceTable } from '../report-evidence-table/report-evidence-table';
import { ReportResultState } from '../report-result-state/report-result-state';
import type { CalendarScheduledReportProps } from '../calendar-scheduled-report/calendar-scheduled-report';
import { calendarUnscheduledRecordKey, validCalendarUnscheduledResult, type CalendarUnscheduledResult } from './calendar-unscheduled-report.validation';
import { calendarUnscheduledReportData as copy } from './calendar-unscheduled-report.data';

export type CalendarUnscheduledReportProps = Omit<CalendarScheduledReportProps, 'state' | 'onCalendar'> & {
  state: { kind: 'loading' | 'error' } | { kind: 'ready'; result: CalendarUnscheduledResult };
  onCalendar: (target: { kind: 'unscheduled'; visitId: string }) => void;
};
const action = 'min-h-11 max-w-full cursor-pointer rounded-lg text-left text-sm font-semibold text-primary underline wrap-anywhere focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
export function CalendarUnscheduledReport({ state, canRead, canExport, canEdit, canOpenCalendar, pending = false,
  onEvidence, onCalendar, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit }: CalendarUnscheduledReportProps) {
  const id = useId();
  if (!canRead || state.kind !== 'ready') return <ReportResultState state={{ kind: state.kind === 'error' ? 'error' : 'loading' }}
    canRead={canRead} canEdit={canEdit} pending={pending} onRetry={onRetry} onEdit={onEdit} />;
  const result = state.result;
  if (!validCalendarUnscheduledResult(result)) return <FormFeedback kind="error" message={copy.invalid} />;
  const evidence = result.evidence;
  const visit = (visitId: string) => result.visits.find(visit => visit.id === visitId)!;
  const person = (personId: string) => result.scope.kind === 'own' ? 'Me' : result.members.find(member => member.id === personId)!.label;
  const selected = evidence.kind === 'visits' ? evidence.visitIds.map(visitId => ({ visit: visit(visitId), record: undefined }))
    : evidence.records.map(row => ({ visit: visit(row.visitId), record: visit(row.visitId).records.find(record => record.id === row.recordId &&
      record.type === (evidence.kind === 'jobs' ? 'job' : 'work_order'))! }));
  const projected = selected.map(row => ({ ...row, id: row.record ? calendarUnscheduledRecordKey(row.record) : row.visit.id }));
  const context = `Current unscheduled queue / No visit-date filter / ${result.snapshotLabel} / ${result.scopeLabel}`;
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6 text-ink">
    <header className="grid min-w-0 gap-2">
      <div className="flex min-w-0 items-center gap-1">
        <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold">{copy.title}</h2>
        <HelpTooltip label={copy.help} paragraphs={[copy.definition, copy.units, copy.active, copy.access, result.scopeLabel]} />
      </div>
      <p className="m-0 text-sm font-semibold">Current queue / No visit-date filter</p>
      <p className="m-0 text-xs text-muted wrap-anywhere">{result.snapshotLabel} / {result.scopeLabel} / {result.timezone}</p>
    </header>
    <ReportSummary canRead hideHeader threeColumns snapshotLabel={result.snapshotLabel} scopeLabel={result.scopeLabel} pending={pending} onEvidence={onEvidence}
      metrics={(['visits', 'jobs', 'workOrders'] as const).map(kind => ({
        id: kind, label: copy.labels[kind], value: { kind: 'count', value: result.counts[kind] },
        dateBasisLabel: context, description: `${copy.definition} ${copy.units}`, evidenceId: result.evidenceIds[kind],
      }))} />
    <ReportEvidenceTable viewLabel={copy.labels[evidence.kind]} contextInTooltip contextLabel={`${context} / ${copy.units} / ${copy.access}`}
      columns={[{ id: 'visit', label: 'Canonical unscheduled visit' }, { id: 'records', label: evidence.kind === 'visits' ? 'Authorized active records / non-additive' : 'Record type / current status' },
        { id: 'participants', label: 'Authorized visit participants / non-additive' }]}
      rows={projected.map(row => ({ id: row.id, label: row.record?.label ?? row.visit.label, cells: {
        visit: row.visit.label,
        records: (row.record ? [row.record] : row.visit.records).map(record => `${record.type === 'job' ? 'Job' : 'Work Order'} / ${record.label} / ${record.status}`).join('; '),
        participants: row.visit.participantIds.length ? row.visit.participantIds.map(person).join(', ') : 'No authorized participant',
      } }))}
      total={result.counts[evidence.kind]} page={result.page} pageSize={result.pageSize} canRead canExport={canExport} canEdit={canEdit} pending={pending}
      renderRecord={row => {
        const target = projected.find(target => target.id === row.id)!;
        const records = target.record ? [target.record] : target.visit.records;
        return <div className="grid min-w-0 gap-1">
          <span className="font-semibold wrap-anywhere">{row.label}</span>
          {canOpenCalendar && <button type="button" className={action} disabled={pending} aria-label={`View Calendar: ${row.label}`}
            onClick={() => { if (!pending) onCalendar({ kind: 'unscheduled', visitId: target.visit.id }); }}>View Calendar</button>}
          {records.map(record => record.recordId === undefined ? null : <button key={calendarUnscheduledRecordKey(record)} type="button" className={action}
            disabled={pending} aria-label={`View record: ${record.label}`}
            onClick={() => { if (!pending && record.recordId !== undefined) onRecord(record.recordId); }}>{record.label}</button>)}
        </div>;
      }}
      onRecord={onRecord} onExport={onExport} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} onRetry={onRetry} onEdit={onEdit} />
  </section>;
}
