'use client';

import { useId, type ReactNode } from 'react';
import { FormFeedback, HelpTooltip, SeafoamOutlineButton } from '@salesmora/ui';
import { reportBreakdownData as copy } from './report-breakdown.data';
import { validReportBreakdown } from './report-breakdown.validation';

export type ReportBreakdownGroup = {
  id: string;
  label: string;
  count: number;
  evidenceId?: string;
};
export type ReportBreakdownProps = {
  groupLabel: string;
  /** Ready, non-overlapping count groups from the same supporting projection and snapshot. */
  groups: readonly ReportBreakdownGroup[];
  total: number;
  contextLabel: string;
  canRead: boolean;
  pending?: boolean;
  /** Related controls inside the card, separate from its exclusive count groups. */
  footer?: ReactNode;
  onEvidence: (evidenceId: string) => void;
};
const format = new Intl.NumberFormat('en-US');

/** The host owns grouping, authorization, snapshot reconciliation and evidence navigation. */
export function ReportBreakdown({ groupLabel, groups, total, contextLabel, canRead, pending = false, footer, onEvidence }: ReportBreakdownProps) {
  const id = useId();
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  if (!validReportBreakdown(total, groups)) return <FormFeedback kind="error" message={copy.invalid} />;
  return <section aria-labelledby={`${id}-title`} aria-busy={pending} className="grid w-full min-w-0 gap-4 rounded-2xl border border-line bg-paper p-4 text-ink sm:p-6">
    <header className="grid gap-2">
      <div className="flex min-w-0 items-center gap-1">
        <h2 id={`${id}-title`} className="m-0 min-w-0 text-xl font-semibold wrap-anywhere">{copy.title(groupLabel)}</h2>
        <HelpTooltip label={copy.help} paragraphs={[copy.description]} />
      </div>
      <p className="m-0 text-sm text-muted wrap-anywhere">{contextLabel}</p>
      <p className="m-0 text-sm text-muted">{copy.total}: <strong className="text-ink tabular-nums">{format.format(total)}</strong></p>
    </header>
    {pending && <p role="status" className="m-0 text-sm text-muted">{copy.pending}</p>}
    {groups.length === 0 ? <p role="status" className="m-0 text-sm text-muted">{copy.empty}</p> :
      <ul className="m-0 grid min-w-0 list-none gap-4 p-0">
        {groups.map(group => <li key={group.id} className="grid min-w-0 gap-2">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
              <span className="min-w-0 text-sm font-semibold wrap-anywhere">{group.label}</span>
              <strong className="shrink-0 text-sm tabular-nums">{format.format(group.count)}</strong>
            </div>
            {group.evidenceId !== undefined && <SeafoamOutlineButton label={copy.evidence} aria-label={copy.evidenceLabel(group.label)} disabled={pending}
              onClick={() => { if (!pending && group.evidenceId !== undefined) onEvidence(group.evidenceId); }} />}
          </div>
          <meter aria-hidden="true" min={0} max={total === 0 ? 1 : total} value={group.count}
            className="block h-3 w-full [&::-webkit-meter-bar]:rounded-full [&::-webkit-meter-bar]:border-0 [&::-webkit-meter-bar]:bg-line [&::-webkit-meter-optimum-value]:rounded-full [&::-webkit-meter-optimum-value]:bg-seafoam [&::-moz-meter-bar]:rounded-full [&::-moz-meter-bar]:bg-seafoam" />
        </li>)}
      </ul>}
    {footer !== undefined && <div className="min-w-0 border-t border-line pt-4">{footer}</div>}
  </section>;
}
