'use client';

import type { ReactNode } from 'react';
import { FormFeedback, Pagination } from '@salesmora/ui';
import { CaptureSourceToolbar, type CaptureSourceFilters } from '../capture-source-toolbar/capture-source-toolbar';
import { CaptureSourceList, type CaptureSourceListRow, type CaptureSourceAction } from '../capture-source-list/capture-source-list';
import { captureSourcePageData as copy } from './capture-source-page.data';
export type CaptureSourcePageProps = {
  rows: readonly CaptureSourceListRow[]; total: number; page: number; pageSize: number; filters: CaptureSourceFilters;
  canRead: boolean; canCreate: boolean; state?: 'ready' | 'loading' | 'error'; pending?: boolean; pendingIds?: readonly string[]; timezone?: string;
  onFilters: (filters: CaptureSourceFilters) => void; onPage: (page: number) => void; onPageSize: (size: number) => void;
  onCreate: () => void; onOpen: (row: CaptureSourceListRow) => void; onAction: (row: CaptureSourceListRow, action: CaptureSourceAction) => void; onRetry?: () => void;
  /** The authorized host owns frozen dialog snapshots and confirmed mutation callbacks. */
  dialogs?: ReactNode;
};
/** Page composition only. The host owns scoped queries, totals, URL state and lifecycle services. */
export function CaptureSourcePage({ rows, total, page, pageSize, filters, canRead, canCreate, state = 'ready', pending = false, pendingIds, timezone, onFilters, onPage, onPageSize, onCreate, onOpen, onAction, onRetry, dialogs }: CaptureSourcePageProps) {
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  const busy = pending || state === 'loading';
  const filtered = !!filters.search.trim() || filters.source !== 'all' || filters.status !== 'all';
  return <div className="grid min-w-0 gap-6">
    <header className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"><div className="grid min-w-0 gap-2"><h1 className="m-0 text-heading font-semibold wrap-anywhere">{copy.title}</h1><p className="m-0 text-sm leading-6 text-muted">{copy.description}</p></div>{canCreate && <button type="button" disabled={busy} onClick={() => { if (!busy) onCreate(); }} className="min-h-11 max-w-full cursor-pointer rounded-xl border border-primary bg-primary px-4 py-2 text-sm font-semibold text-paper wrap-anywhere hover:bg-primary-dark focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">{copy.create}</button>}</header>
    <CaptureSourceToolbar value={filters} disabled={busy} onChange={next => { if (!busy) onFilters(next); }} />
    <CaptureSourceList rows={rows} canRead view={filters.view} filtered={filtered} state={state} pendingIds={pending ? rows.map(row => row.id) : pendingIds} timezone={timezone} onOpen={onOpen} onAction={onAction} onRetry={pending ? undefined : onRetry} />
    {state === 'ready' && <Pagination total={total} page={page} pageSize={pageSize} disabled={pending} onPageChange={onPage} onPageSizeChange={onPageSize} />}
    {dialogs}
  </div>;
}
