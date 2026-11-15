'use client';

import { useId } from 'react';
import { FormFeedback, HelpTooltip } from '@salesmora/ui';
import { ReportSummary } from '../report-summary/report-summary';
import { ReportEvidenceTable } from '../report-evidence-table/report-evidence-table';
import { ReportResultState } from '../report-result-state/report-result-state';
import { CalendarVisitEvidenceActions } from '../calendar-scheduled-report/calendar-visit-evidence-actions';
import type { CalendarScheduledReportProps } from '../calendar-scheduled-report/calendar-scheduled-report';
import { calendarOverlapKey, validCalendarReviewResult, type CalendarReviewResult } from './calendar-review-report.validation';
import { calendarReviewReportData as copy } from './calendar-review-report.data';

export type CalendarReviewReportProps = Omit<CalendarScheduledReportProps, 'state'> & {
  state: { kind: 'loading' | 'error' } | { kind: 'ready'; result: CalendarReviewResult };
};

/** Authorized current snapshot; hosts compute review totals before selecting an evidence page. */
export function CalendarReviewReport({ state, canRead, canExport, canEdit, canOpenCalendar, pending = false,
  onEvidence, onCalendar, onRecord, onExport, onPageChange, onPageSizeChange, onRetry, onEdit }: CalendarReviewReportProps) {
  const id = useId();
  if (!canRead || state.kind !== 'ready') return <ReportResultState state={{ kind: state.kind === 'error' ? 'error' : 'loading' }}
    canRead={canRead} canEdit={canEdit} pending={pending} onRetry={onRetry} onEdit={onEdit} />;
  const result = state.result;
  if (!validCalendarReviewResult(result)) return <FormFeedback kind="error" message={copy.invalid} />;
  const person = (personId: string) => result.scope.kind === 'own' ? 'Me' : result.members.find(member => member.id === personId)!.label;
  const visit = (visitId: string) => result.visits.find(visit => visit.id === visitId)!;
  const evidence = result.evidence;
  const basis = `${result.periodLabel} / Scheduled visit date / ${result.timezone} / Business-local today: ${result.today}`;
  const rows = evidence.kind === 'overlaps' ? evidence.rows.map(pair => {
    const left = visit(pair.leftVisitId), right = visit(pair.rightVisitId);
    return { id: calendarOverlapKey(pair), label: `${person(pair.personId)} / ${left.date}`, cells: {
      date: left.date, person: person(pair.personId), left: `${left.label} / ${left.arrivalWindow}`, right: `${right.label} / ${right.arrivalWindow}`,
    } };
  }) : evidence.visitIds.map(visitId => {
    const row = visit(visitId);
    return { id: row.id, label: row.label, cells: { date: row.date, window: row.arrivalWindow ?? 'Unknown arrival window',
      review: 'Past scheduled date / review current schedule; attendance unknown' } };
  });
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6 text-ink">
    <header className="grid min-w-0 gap-2">
      <div className="flex min-w-0 items-center gap-1">
        <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold">{copy.title}</h2>
        <HelpTooltip label={copy.help} paragraphs={[copy.overlapDefinition, copy.pastDefinition, copy.unknown, copy.review,
          ...(result.scope.kind === 'own' ? [copy.own] : []), result.scopeLabel]} />
      </div>
      <p className="m-0 text-sm font-semibold wrap-anywhere">{result.periodLabel}</p>
      <p className="m-0 text-xs text-muted wrap-anywhere">{result.snapshotLabel} / {result.scopeLabel} / {result.timezone}</p>
      <p className="m-0 text-xs text-muted wrap-anywhere">Business-local today: {result.today}</p>
    </header>
    <ReportSummary canRead hideHeader snapshotLabel={result.snapshotLabel} scopeLabel={result.scopeLabel} pending={pending} onEvidence={onEvidence}
      metrics={[
        { id: 'overlaps', label: copy.overlaps, value: { kind: 'count', value: result.counts.overlapPairs },
          dateBasisLabel: basis, description: `${copy.overlapDefinition} ${copy.unknown}`, evidenceId: result.evidenceIds.overlaps },
        { id: 'past', label: copy.past, value: { kind: 'count', value: result.counts.pastVisits },
          dateBasisLabel: basis, description: `${copy.pastDefinition} ${copy.review}`, evidenceId: result.evidenceIds.past },
      ]} />
    <ReportEvidenceTable viewLabel={evidence.kind === 'overlaps' ? copy.overlaps : copy.past} contextInTooltip
      contextLabel={`${basis} / ${result.scopeLabel} / ${copy.overlapDefinition} / ${copy.pastDefinition}`}
      columns={evidence.kind === 'overlaps' ? [{ id: 'date', label: 'Scheduled date' }, { id: 'person', label: 'Authorized person' },
        { id: 'left', label: 'First visit / arrival window' }, { id: 'right', label: 'Second visit / arrival window' }]
        : [{ id: 'date', label: 'Scheduled date' }, { id: 'window', label: 'Arrival window' }, { id: 'review', label: 'Review reason' }]}
      rows={rows} total={evidence.kind === 'overlaps' ? result.counts.overlapPairs : result.counts.pastVisits}
      page={result.page} pageSize={result.pageSize} canRead canExport={canExport} canEdit={canEdit} pending={pending}
      renderRecord={row => {
        const pair = evidence.kind === 'overlaps' ? evidence.rows.find(pair => calendarOverlapKey(pair) === row.id) : undefined;
        const targets = pair ? [visit(pair.leftVisitId), visit(pair.rightVisitId)] : [visit(row.id)];
        return <div className="grid min-w-0 gap-4">{targets.map(target => <CalendarVisitEvidenceActions key={target.id} visit={target}
          pending={pending} canOpenCalendar={canOpenCalendar} onCalendar={onCalendar} onRecord={onRecord} />)}</div>;
      }}
      onRecord={onRecord} onExport={onExport} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} onRetry={onRetry} onEdit={onEdit} />
  </section>;
}
