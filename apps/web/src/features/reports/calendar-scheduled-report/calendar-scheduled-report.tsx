'use client';

import { useId } from 'react';
import { FormFeedback, HelpTooltip } from '@salesmora/ui';
import { calendarWeekStart } from '../../calendar/calendar-date';
import { ReportSummary } from '../report-summary/report-summary';
import { ReportBreakdown } from '../report-breakdown/report-breakdown';
import { ReportEvidenceTable } from '../report-evidence-table/report-evidence-table';
import { ReportResultState } from '../report-result-state/report-result-state';
import { formatReportDate } from '../report-date-controls/report-date-controls.validation';
import { calendarScheduledReportData as copy } from './calendar-scheduled-report.data';
import { CalendarVisitEvidenceActions } from './calendar-visit-evidence-actions';
import { calendarBusyDayKey, calendarBusyThreshold, validCalendarScheduledResult, type CalendarScheduledResult } from './calendar-scheduled-report.validation';

export type CalendarReportTarget = { date: string; weekDate: string; visitId?: string; personId?: string };
export type CalendarScheduledReportProps = {
  state: { kind: 'loading' | 'error' } | { kind: 'ready'; result: CalendarScheduledResult };
  canRead: boolean;
  canExport: boolean;
  canEdit: boolean;
  canOpenCalendar: boolean;
  pending?: boolean;
  onEvidence: (evidenceId: string) => void;
  onCalendar: (target: CalendarReportTarget) => void;
  onRecord: (recordId: string) => void;
  onExport: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRetry: () => void;
  onEdit: () => void;
};
const action = 'min-h-11 max-w-full cursor-pointer rounded-lg text-left text-sm font-semibold text-primary underline wrap-anywhere focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';

/** Full authorized day/person aggregates and a single selected evidence page from the same host snapshot. */
export function CalendarScheduledReport({ state, canRead, canExport, canEdit, canOpenCalendar, pending = false,
  onEvidence, onCalendar, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit }: CalendarScheduledReportProps) {
  const id = useId();
  if (!canRead || state.kind !== 'ready') return <ReportResultState state={{ kind: state.kind === 'error' ? 'error' : 'loading' }}
    canRead={canRead} canEdit={canEdit} pending={pending} onRetry={onRetry} onEdit={onEdit} />;
  const result = state.result;
  if (!validCalendarScheduledResult(result)) return <FormFeedback kind="error" message={copy.invalid} />;
  const own = result.scope.kind === 'own';
  const person = (personId: string) => own ? 'Me' : result.members.find(member => member.id === personId)!.label;
  const context = `${result.periodLabel} / Visit date / ${result.timezone} / ${result.scopeLabel}`;
  const evidence = result.evidence;
  const viewLabel = evidence.kind === 'visits' ? copy.visits : copy.busy;
  const rows = evidence.kind === 'visits' ? evidence.rows.map(row => ({
    id: row.id, label: row.label, cells: { date: row.date,
      participants: row.participantIds.length ? row.participantIds.map(person).join(', ') : copy.unassigned,
      records: row.records.map(record => `${record.type === 'job' ? 'Job' : 'Work Order'} / ${record.label}`).join('; ') },
  })) : evidence.rows.map(row => ({
    id: calendarBusyDayKey(row), label: `${person(row.personId)} / ${row.date}`,
    cells: { date: row.date, person: person(row.personId),
      visits: String(result.members.find(member => member.id === row.personId)!.counts[result.days.findIndex(day => day.date === row.date)]) },
  }));
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6 text-ink">
    <header className="grid min-w-0 gap-2">
      <div className="flex min-w-0 items-center gap-1">
        <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold">{copy.title}</h2>
        <HelpTooltip label={copy.help} paragraphs={[copy.definition, copy.sharing, copy.busyDefinition, copy.current, ...(own ? [copy.own] : []), result.scopeLabel]} />
      </div>
      <p className="m-0 text-sm font-semibold wrap-anywhere">{result.periodLabel}</p>
      <p className="m-0 text-xs text-muted wrap-anywhere">{result.snapshotLabel} / {result.scopeLabel} / {result.timezone}</p>
    </header>
    <ReportSummary canRead hideHeader snapshotLabel={result.snapshotLabel} scopeLabel={result.scopeLabel} pending={pending} onEvidence={onEvidence}
      metrics={[
        { id: 'visits', label: copy.visits, value: { kind: 'count', value: result.counts.visits },
          description: `${copy.definition} ${copy.sharing}`, dateBasisLabel: context, evidenceId: result.evidenceIds.visits },
        { id: 'busy-person-days', label: copy.busy, value: { kind: 'count', value: result.counts.busyPersonDays },
          description: copy.busyDefinition, dateBasisLabel: context, evidenceId: result.evidenceIds.busyPersonDays },
      ]} />
    <div className="grid min-w-0 items-start gap-6 lg:grid-cols-2">
      <ReportBreakdown groupLabel={copy.days} total={result.counts.visits} canRead pending={pending} onEvidence={onEvidence}
        contextLabel={context} groups={result.days.map(day => ({ id: day.date, label: formatReportDate(day.date), count: day.count }))} />
      <section aria-labelledby={`${id}-people`} className="grid min-w-0 gap-4 rounded-2xl border border-line bg-paper p-4 sm:p-6">
        <h2 id={`${id}-people`} className="m-0 text-xl font-semibold">{copy.people}</h2>
        <p className="m-0 text-sm text-muted">{copy.sharing}</p>
        <ul className="m-0 grid min-w-0 list-none gap-3 p-0">
          {[...result.members].sort((a, b) => a.label.localeCompare(b.label) || a.id.localeCompare(b.id)).map(member => <li key={member.id}
            className="grid min-w-0 gap-2 rounded-xl border border-line p-3">
            <p className="m-0 flex min-w-0 flex-wrap justify-between gap-2 text-sm font-semibold">
              <span className="min-w-0 wrap-anywhere">{person(member.id)}</span>
              <span>{member.counts.reduce((sum, value) => sum + value, 0)} visits</span>
            </p>
            <ul className="m-0 grid min-w-0 list-none gap-1 p-0 text-xs text-muted">{result.days.map((day, index) => <li key={day.date} className="flex flex-wrap justify-between gap-2">
              <span>{formatReportDate(day.date)}</span><span>{member.counts[index]} visits{member.counts[index]! >= calendarBusyThreshold ? ' / busy person-day' : ''}</span>
            </li>)}</ul>
          </li>)}
        </ul>
        {result.members.length === 0 && <p className="m-0 text-sm text-muted">No authorized participants in this projection.</p>}
        {!own && <p className="m-0 text-sm text-muted">{copy.unassigned}: {result.days.reduce((sum, day) => sum + day.unassignedCount, 0)} visits. This is not a workspace-wide staffing total.</p>}
      </section>
    </div>
    <ReportEvidenceTable viewLabel={viewLabel} contextInTooltip contextLabel={`${context} / ${copy.sharing} / ${copy.busyDefinition}`}
      columns={evidence.kind === 'visits' ? [{ id: 'date', label: 'Scheduled visit date' }, { id: 'participants', label: own ? 'Participant' : 'Authorized participants' },
        { id: 'records', label: 'Authorized active records / non-additive' }] : [{ id: 'date', label: 'Scheduled visit date' }, { id: 'person', label: 'Person' }, { id: 'visits', label: 'Distinct visits that day' }]}
      rows={rows} total={evidence.kind === 'visits' ? result.counts.visits : result.counts.busyPersonDays}
      page={result.page} pageSize={result.pageSize} canRead canExport={canExport} canEdit={canEdit} pending={pending}
      renderRecord={row => {
        const visit = evidence.kind === 'visits' ? evidence.rows.find(visit => visit.id === row.id) : undefined;
        if (visit) return <CalendarVisitEvidenceActions visit={visit} pending={pending} canOpenCalendar={canOpenCalendar} onCalendar={onCalendar} onRecord={onRecord} />;
        const busy = evidence.kind === 'busy-person-days' ? evidence.rows.find(day => calendarBusyDayKey(day) === row.id) : undefined;
        const target = { date: busy!.date, weekDate: calendarWeekStart(busy!.date), personId: busy!.personId };
        return <div className="grid min-w-0 gap-1">
          <span className="font-semibold wrap-anywhere">{row.label}</span>
          {canOpenCalendar && <button type="button" className={action} disabled={pending} aria-label={`View Calendar: ${row.label}`}
            onClick={() => { if (!pending) onCalendar(target); }}>View Calendar</button>}
        </div>;
      }}
      onRecord={onRecord} onExport={onExport} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} onRetry={onRetry} onEdit={onEdit} />
  </section>;
}
