'use client';

import { DataTable, StatusBadge, type DataTableColumn, type StatusBadgeTone } from '@salesmora/ui';
import { captureSourceListData as copy } from './capture-source-list.data';

export type CaptureSourceAction = keyof typeof copy.action;
export type CaptureSourceListRow = {
  id: string;
  name: string;
  source: keyof typeof copy.sources;
  status: keyof typeof copy.statuses;
  captured: number;
  awaitingReview: number;
  lastActivityAt: string | null;
  attention?: string;
  /** Server-resolved record capabilities, not inferred from the user's role. */
  allowedActions: readonly CaptureSourceAction[];
};
export type CaptureSourceListProps = {
  rows: readonly CaptureSourceListRow[];
  canRead: boolean;
  view?: 'current' | 'archived';
  filtered?: boolean;
  state?: 'ready' | 'loading' | 'error';
  pendingIds?: readonly string[];
  timezone?: string;
  onOpen: (row: CaptureSourceListRow) => void;
  /** Requests a review/setup flow; this list never executes a lifecycle mutation. */
  onAction: (row: CaptureSourceListRow, action: CaptureSourceAction) => void;
  onRetry?: () => void;
};

const tones: Record<CaptureSourceListRow['status'], StatusBadgeTone> = { draft: 'neutral', scheduled: 'info', active: 'success', paused: 'warning', archived: 'neutral' };
const eligible: Record<CaptureSourceListRow['status'], readonly CaptureSourceAction[]> = {
  draft: ['setup', 'duplicate', 'archive'],
  scheduled: ['edit', 'duplicate', 'archive'],
  active: ['edit', 'pause', 'duplicate', 'archive'],
  paused: ['edit', 'resume', 'duplicate', 'archive'],
  archived: ['restore', 'duplicate'],
};
const buttonClass = 'min-h-11 max-w-full cursor-pointer rounded-xl border border-line bg-paper px-3 py-2 text-sm font-semibold text-primary wrap-anywhere hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';

/** Presentation only. The host enforces authorization, version checks and confirmed mutations. */
export function CaptureSourceList({ rows, canRead, view = 'current', filtered = false, state = 'ready', pendingIds = [], timezone = 'UTC', onOpen, onAction, onRetry }: CaptureSourceListProps) {
  if (!canRead) return <p role="alert" className="m-0 rounded-2xl border border-line bg-paper p-6 text-sm text-error">{copy.forbidden}</p>;
  const pending = new Set(pendingIds);
  const visibleRows = rows.filter(row => view === 'archived' ? row.status === 'archived' : row.status !== 'archived');
  const identity = (row: CaptureSourceListRow) => <div className="grid min-w-0 gap-2">
    <button type="button" aria-label={copy.open(row.name)} disabled={pending.has(row.id)} onClick={() => onOpen(row)}
      className="min-h-11 min-w-0 cursor-pointer rounded-lg py-2 text-left text-sm font-semibold text-primary wrap-anywhere hover:underline focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">{row.name}</button>
    {row.attention && <span className="text-sm text-muted wrap-anywhere">{row.attention}</span>}
  </div>;
  const badge = (row: CaptureSourceListRow) => <StatusBadge label={copy.statuses[row.status]} tone={tones[row.status]} dot />;
  const captured = (row: CaptureSourceListRow) => <div className="grid gap-1"><span>{row.captured.toLocaleString('en-US')}</span>{row.awaitingReview > 0 && <span className="text-sm text-muted">{copy.review(row.awaitingReview)}</span>}</div>;
  const activity = (row: CaptureSourceListRow) => row.lastActivityAt ? <time dateTime={row.lastActivityAt}>{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: timezone }).format(new Date(row.lastActivityAt))}</time> : copy.never;
  const actions = (row: CaptureSourceListRow) => <div className="grid min-w-0 gap-2">
    <div className="flex flex-wrap gap-2">{eligible[row.status].filter(action => row.allowedActions.includes(action)).map(action => <button key={action} type="button" className={buttonClass} disabled={pending.has(row.id)}
      aria-label={copy.actionLabel(copy.action[action], row.name)} onClick={() => onAction(row, action)}>{copy.action[action]}</button>)}</div>
    {pending.has(row.id) && <span role="status" className="text-sm text-muted">{copy.pending}</span>}
  </div>;
  const columns: DataTableColumn<CaptureSourceListRow>[] = [
    { id: 'name', label: copy.name, render: identity },
    { id: 'source', label: copy.source, render: row => copy.sources[row.source] },
    { id: 'status', label: copy.status, render: badge },
    { id: 'captured', label: copy.captured, render: captured },
    { id: 'activity', label: copy.activity, render: activity },
    { id: 'actions', label: copy.actions, render: actions },
  ];
  return <DataTable caption={copy.caption} columns={columns} rows={visibleRows} getRowId={row => row.id} getRowLabel={row => row.name}
    state={state} onRetry={onRetry} errorMessage={copy.error} emptyMessage={filtered ? copy.filteredEmpty : view === 'archived' ? copy.archivedEmpty : copy.empty}
    renderCard={row => <div className="grid min-w-0 gap-4">
      {identity(row)}{badge(row)}
      <dl className="m-0 grid min-w-0 gap-3 text-sm">
        <div><dt className="text-muted">{copy.source}</dt><dd className="m-0 wrap-anywhere">{copy.sources[row.source]}</dd></div>
        <div><dt className="text-muted">{copy.captured}</dt><dd className="m-0">{captured(row)}</dd></div>
        <div><dt className="text-muted">{copy.activity}</dt><dd className="m-0">{activity(row)}</dd></div>
      </dl>
      {actions(row)}
    </div>} />;
}
