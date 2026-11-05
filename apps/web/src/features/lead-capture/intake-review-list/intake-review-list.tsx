'use client';

import { DataTable, FormFeedback, StatusBadge, type DataTableColumn, type StatusBadgeTone } from '@salesmora/ui';
import { intakeReviewListData as copy } from './intake-review-list.data';

export type IntakeReviewListRow = {
  id: string; name?: string; contact?: string; summary?: string;
  source: { id: string; name: string; type: 'website' | 'gmail' };
  status: 'awaiting' | 'approved' | 'dismissed';
  flags: readonly (keyof typeof copy.flags)[];
  receivedAt: string | null;
  /** Host-resolved record access. Reviewing opens a flow; it does not authorize a decision here. */
  canOpen: boolean; canReview: boolean;
};
export type IntakeReviewListProps = {
  rows: readonly IntakeReviewListRow[]; canRead: boolean; filtered?: boolean;
  state?: 'ready' | 'loading' | 'error'; pendingIds?: readonly string[]; timezone?: string;
  onOpen: (row: IntakeReviewListRow) => void; onRetry?: () => void;
};
const tones: Record<IntakeReviewListRow['status'], StatusBadgeTone> = { awaiting: 'info', approved: 'success', dismissed: 'neutral' };
const buttonClass = 'min-h-11 max-w-full cursor-pointer rounded-xl border border-line bg-paper px-3 py-2 text-sm font-semibold text-primary wrap-anywhere hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';

/** Controlled list. The host owns authorized filtering, ordering, paging and item/lead mutations. */
export function IntakeReviewList({ rows, canRead, filtered = false, state = 'ready', pendingIds = [], timezone = 'UTC', onOpen, onRetry }: IntakeReviewListProps) {
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  const pending = new Set(pendingIds);
  let formatter: Intl.DateTimeFormat | undefined;
  try { formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: timezone }); } catch { /* Do not silently display a timestamp in the wrong timezone. */ }
  const name = (row: IntakeReviewListRow) => row.name?.trim() || copy.unnamed;
  const identity = (row: IntakeReviewListRow) => <div className="grid min-w-0 gap-2"><span className="font-semibold wrap-anywhere">{name(row)}</span><span className="text-sm text-muted wrap-anywhere">{row.contact?.trim() || copy.noContact}</span><span className="text-sm wrap-anywhere">{row.summary?.trim() || copy.noSummary}</span></div>;
  const source = (row: IntakeReviewListRow) => <StatusBadge label={copy.sources[row.source.type]} tone="neutral" />;
  const status = (row: IntakeReviewListRow) => <div className="grid justify-items-start gap-2"><StatusBadge label={copy.statuses[row.status]} tone={tones[row.status]} />{[...new Set(row.flags)].map(flag => <StatusBadge key={flag} label={copy.flags[flag]} tone="warning" />)}{row.status === 'awaiting' && row.flags.length === 0 && <span className="text-sm text-muted">{copy.clear}</span>}</div>;
  const received = (row: IntakeReviewListRow) => row.receivedAt && Number.isFinite(Date.parse(row.receivedAt)) && formatter ? <time dateTime={row.receivedAt}>{formatter.format(new Date(row.receivedAt))}</time> : <span className="text-muted">{copy.unknownDate}</span>;
  const actions = (row: IntakeReviewListRow) => <div className="grid justify-items-start gap-2">{row.canOpen ? <button type="button" className={buttonClass} disabled={pending.has(row.id)} aria-label={copy.actionLabel(row.status === 'awaiting' && row.canReview ? copy.review : copy.view, name(row))} onClick={() => { if (!pending.has(row.id)) onOpen(row); }}>{row.status === 'awaiting' && row.canReview ? copy.review : copy.view}</button> : <span className="text-sm text-muted">{copy.restricted}</span>}{pending.has(row.id) && <span role="status" className="text-sm text-muted">{copy.pending}</span>}</div>;
  const columns: DataTableColumn<IntakeReviewListRow>[] = [
    { id: 'lead', label: copy.lead, render: identity }, { id: 'source', label: copy.source, render: source },
    { id: 'status', label: copy.status, render: status }, { id: 'received', label: copy.received, render: received }, { id: 'actions', label: copy.actions, render: actions },
  ];
  return <DataTable caption={copy.caption} rows={rows} columns={columns} getRowId={row => row.id} getRowLabel={name} state={state} onRetry={onRetry} errorMessage={copy.error} emptyMessage={filtered ? copy.noMatches : copy.empty}
    renderCard={row => <div className="grid min-w-0 gap-4">{identity(row)}{status(row)}<dl className="m-0 grid min-w-0 gap-3 text-sm"><div><dt className="mb-1 text-muted">{copy.source}</dt><dd className="m-0">{source(row)}</dd></div><div><dt className="mb-1 text-muted">{copy.received}</dt><dd className="m-0">{received(row)}</dd></div></dl>{actions(row)}</div>} />;
}
