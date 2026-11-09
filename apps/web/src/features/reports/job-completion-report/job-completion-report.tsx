'use client';

import { useId } from 'react';
import { addCalendarDays } from '@salesmora/domain';
import { FormFeedback, HelpTooltip } from '@salesmora/ui';
import { ReportSummary, type ReportSummaryValue } from '../report-summary/report-summary';
import { ReportEvidenceTable } from '../report-evidence-table/report-evidence-table';
import { ReportResultState } from '../report-result-state/report-result-state';
import { formatReportDate } from '../report-date-controls/report-date-controls.validation';
import { completionElapsedDays, validJobCompletionResult, type JobCompletionResult } from './job-completion-report.validation';
import { jobCompletionReportData as copy } from './job-completion-report.data';

export type JobCompletionReportState = { kind: 'loading' | 'error' } | { kind: 'ready'; result: JobCompletionResult };
export type JobCompletionReportProps = {
  state: JobCompletionReportState;
  canRead: boolean;
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
export function JobCompletionReport({ state, canRead, canExport, canEdit, pending = false,
  onEvidence, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit }: JobCompletionReportProps) {
  const id = useId();
  if (!canRead || state.kind !== 'ready') return <ReportResultState state={{ kind: state.kind === 'error' ? 'error' : 'loading' }}
    canRead={canRead} canEdit={canEdit} pending={pending} onRetry={onRetry} onEdit={onEdit} />;
  const result = state.result;
  if (!validJobCompletionResult(result)) return <FormFeedback kind="error" message={copy.invalid} />;
  const { sampleSize, totalElapsedDays, explanation } = result.duration;
  const average = sampleSize === 0 ? undefined : `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(totalElapsedDays / sampleSize)} days`;
  const averageValue: ReportSummaryValue = average === undefined ? { kind: 'unavailable', reason: copy.empty }
    : sampleSize < result.total ? { kind: 'incomplete', displayValue: average, coverageLabel: `${copy.incomplete}: ${explanation}` }
      : { kind: 'formatted', displayValue: average };
  const basis = `Recorded completion date / ${result.periodLabel}`;
  const selected = result.days.find(day => day.date === result.selectedDate);
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6 text-ink">
    <header className="grid gap-2">
      <div className="flex min-w-0 items-center gap-1">
        <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold">{copy.title}</h2>
        <HelpTooltip label={copy.help} paragraphs={[copy.selection, copy.trend, copy.duration]} />
      </div>
      <p className="m-0 text-sm font-semibold wrap-anywhere">{result.periodLabel}</p>
      <p className="m-0 text-xs text-muted wrap-anywhere">{result.snapshotLabel} / {result.scopeLabel}</p>
    </header>
    <ReportSummary canRead hideHeader threeColumns snapshotLabel={result.snapshotLabel} scopeLabel={result.scopeLabel}
      pending={pending} onEvidence={onEvidence} metrics={[
        { id: 'completed', label: 'Completed Jobs', value: result.coverage.kind === 'partial'
          ? { kind: 'incomplete', displayValue: String(result.total), coverageLabel: result.coverage.explanation } : { kind: 'count', value: result.total },
          description: copy.selection, dateBasisLabel: basis, evidenceId: result.evidenceId },
        { id: 'average', label: 'Average elapsed calendar days', value: averageValue, description: `${copy.duration} Average uses valid samples only and is rounded to one decimal place.`, dateBasisLabel: basis },
        { id: 'sample', label: 'Elapsed-day sample size', value: { kind: 'count', value: sampleSize }, description: 'Number of selected completions with valid creation and completion date evidence.', dateBasisLabel: basis },
      ]} />
      {result.coverage.kind === 'partial' && <p role="status" className="m-0 text-sm font-semibold text-muted wrap-anywhere">{result.coverage.explanation}</p>}
      {sampleSize < result.total && <p role="status" className="m-0 text-sm font-semibold text-muted wrap-anywhere">{copy.incomplete}: {sampleSize} of {result.total} / {explanation}</p>}
      <CompletionCalendar result={result} pending={pending} onEvidence={onEvidence} />
      <ReportEvidenceTable viewLabel={selected ? `Completed Jobs / ${formatReportDate(selected.date)}` : 'Completed Jobs'} contextInTooltip
        contextLabel={`${result.snapshotLabel} / ${basis} / ${result.scopeLabel} / ${copy.selection} / ${copy.trend} / ${copy.duration}`}
        columns={[{ id: 'created', label: 'Creation date (local)' }, { id: 'completed', label: 'Selected completion (local)' },
          { id: 'elapsed', label: 'Elapsed calendar days' }, { id: 'status', label: 'Current status' }, { id: 'owner', label: 'Current primary owner' }]}
        rows={result.rows.map(row => ({ ...row, cells: { ...row.cells, created: row.createdDate === null ? null : formatReportDate(row.createdDate), completed: formatReportDate(row.completionDate),
          elapsed: row.createdDate === null ? null : String(completionElapsedDays(row.createdDate, row.completionDate)) } }))}
        total={selected?.count ?? result.total} page={result.page} pageSize={result.pageSize} canRead canExport={canExport} canEdit={canEdit} pending={pending}
        onRecord={onRecord} onExport={onExport} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} onRetry={onRetry} onEdit={onEdit} />
  </section>;
}

function CompletionCalendar({ result, pending, onEvidence }: {
  result: JobCompletionResult;
  pending: boolean;
  onEvidence: (evidenceId: string) => void;
}) {
  const id = useId();
  const days = new Map(result.days.map(day => [day.date, day]));
  const months = [...new Set(result.days.map(day => day.date.slice(0, 7)))];
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return <section aria-labelledby={`${id}-title`} aria-busy={pending} className="grid min-w-0 gap-6 rounded-2xl border border-line bg-paper p-2 sm:p-6">
    <header className="flex min-w-0 items-center gap-1 px-2 sm:px-0">
      <h2 id={`${id}-title`} className="m-0 text-xl font-semibold">Completion calendar</h2>
      <HelpTooltip label="About completion calendar" paragraphs={[copy.trend, 'Each date shows the number of period-selected completed Jobs. Dates outside the reporting period are muted. All months are displayed without navigation.']} />
    </header>
    {months.map(month => {
      const first = `${month}-01`;
      const date = new Date(`${first}T12:00:00Z`);
      const offset = (date.getUTCDay() + 6) % 7;
      const next = new Date(date);
      next.setUTCMonth(next.getUTCMonth() + 1);
      const last = addCalendarDays(next.toISOString().slice(0, 10), -1);
      const length = Number(last.slice(8, 10));
      const weekCount = Math.ceil((offset + length) / 7);
      const label = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
      return <table key={month} className="w-full table-fixed border-separate border-spacing-1 text-center text-sm">
        <caption className="pb-3 text-left text-lg font-semibold">{label}</caption>
        <thead><tr>{weekdays.map(day => <th key={day} scope="col" className="pb-2 text-xs font-semibold text-muted">
          <abbr title={day} className="no-underline">{day.slice(0, 3)}</abbr>
        </th>)}</tr></thead>
        <tbody>{Array.from({ length: weekCount }, (_, week) => <tr key={week}>
          {weekdays.map((weekday, column) => {
            const dayNumber = week * 7 + column - offset + 1;
            if (dayNumber < 1 || dayNumber > length) return <td key={weekday} />;
            const dateLabel = `${month}-${String(dayNumber).padStart(2, '0')}`;
            const day = days.get(dateLabel);
            const selected = result.selectedDate === dateLabel;
            const content = <><span className="text-xs text-muted">{dayNumber}</span>
              {day && <strong className="text-sm tabular-nums sm:text-lg">{day.count}</strong>}</>;
            return <td key={weekday} className="p-0 align-top">
              {day?.evidenceId !== undefined ? <button type="button" disabled={pending} aria-pressed={selected}
                aria-label={`View supporting evidence: ${formatReportDate(dateLabel)}`}
                title={`${formatReportDate(dateLabel)}: ${day.count} completed Jobs`}
                onClick={() => { if (!pending && day.evidenceId !== undefined) onEvidence(day.evidenceId); }}
                className={`grid min-h-16 w-full cursor-pointer content-between gap-1 rounded-lg border px-1 py-2 text-ink focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-24 ${selected ? 'border-primary ring-2 ring-primary' : 'border-line'} ${day.count > 0 ? 'bg-blue-100 hover:bg-blue-200' : 'bg-gray-100 hover:bg-gray-200'}`}>
                {content}
              </button> : <div aria-label={`${formatReportDate(dateLabel)}: ${day ? `${day.count} completed Jobs` : 'outside reporting period'}`}
                className={`grid min-h-16 content-between gap-1 rounded-lg border border-line px-1 py-2 sm:min-h-24 ${day ? `${day.count > 0 ? 'bg-blue-100' : 'bg-gray-100'} text-ink` : 'bg-paper text-muted opacity-50'}`}>
                {content}
              </div>}
            </td>;
          })}
        </tr>)}</tbody>
      </table>;
    })}
  </section>;
}
