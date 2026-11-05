'use client';

import { FormFeedback, Pagination } from '@salesmora/ui';
import { IntakeReviewToolbar, type IntakeReviewToolbarProps } from '../intake-review-toolbar/intake-review-toolbar';
import { IntakeReviewList, type IntakeReviewListProps } from '../intake-review-list/intake-review-list';
import { intakeReviewPageData as copy } from './intake-review-page.data';

export type IntakeReviewPageProps = {
  rows: IntakeReviewListProps['rows']; filters: IntakeReviewToolbarProps['value'];
  sources: IntakeReviewToolbarProps['sources']; sourcesState?: IntakeReviewToolbarProps['sourcesState'];
  canRead: boolean; state?: IntakeReviewListProps['state']; pending?: boolean;
  pendingIds?: IntakeReviewListProps['pendingIds']; timezone?: string;
  total: number; page: number; pageSize: number;
  onFilters: IntakeReviewToolbarProps['onChange']; onOpen: IntakeReviewListProps['onOpen'];
  onPage: (page: number) => void; onPageSize: (size: number) => void;
  onRetry?: () => void; onRetrySources?: () => void;
};
/** Composition only. The authorized host owns scoped queries, URL filters, totals and detail navigation. */
export function IntakeReviewPage({ rows, filters, sources, sourcesState, canRead, state = 'ready', pending = false, pendingIds, timezone, total, page, pageSize, onFilters, onOpen, onPage, onPageSize, onRetry, onRetrySources }: IntakeReviewPageProps) {
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  const busy = pending || state === 'loading';
  const filtered = !!filters.search.trim() || !!filters.sourceId || filters.status !== 'all' || filters.flag !== 'all';
  return <div className="grid min-w-0 gap-6">
    <header className="grid min-w-0 gap-2"><h1 className="m-0 text-heading font-semibold">{copy.title}</h1><p className="m-0 text-sm leading-6 text-muted">{copy.description}</p></header>
    <IntakeReviewToolbar value={filters} sources={sources} sourcesState={sourcesState} canRead disabled={busy} onChange={next => { if (!busy) onFilters(next); }} onRetrySources={onRetrySources} />
    <IntakeReviewList rows={rows} canRead state={state} filtered={filtered} pendingIds={busy ? rows.map(row => row.id) : pendingIds} timezone={timezone}
      onOpen={row => { if (!busy && !pendingIds?.includes(row.id) && row.canOpen) onOpen(row); }} onRetry={pending ? undefined : onRetry} />
    {state === 'ready' && <Pagination total={total} page={page} pageSize={pageSize} disabled={busy}
      onPageChange={next => { if (!busy) onPage(next); }} onPageSizeChange={next => { if (!busy) onPageSize(next); }} />}
  </div>;
}
