'use client';

import { useState } from 'react';
import { WorkspaceNavigation } from '@salesmora/ui';
import { IntakeReviewPage } from './intake-review-page';
import { intakeReviewPageData as copy } from './intake-review-page.data';
import { defaultIntakeReviewFilters, type IntakeReviewFilters } from '../intake-review-toolbar/intake-review-toolbar';
import { intakeReviewToolbarData } from '../intake-review-toolbar/intake-review-toolbar.data';
import { intakeReviewListData } from '../intake-review-list/intake-review-list.data';
import type { IntakeReviewListRow } from '../intake-review-list/intake-review-list';

const sources = [...intakeReviewToolbarData.stories.sources];
const fixtures: IntakeReviewListRow[] = Array.from({ length: 6 }, (_, i) => ({
  id: `intake-${i}`, name: intakeReviewListData.stories.names[i % 4], contact: intakeReviewListData.stories.contacts[i % 4],
  summary: intakeReviewListData.stories.summaries[i % 4], source: { ...sources[i % 3], type: i % 3 === 1 ? 'gmail' : 'website' },
  status: i < 4 ? 'awaiting' : i === 4 ? 'approved' : 'dismissed',
  flags: i === 0 ? ['duplicate'] : i === 1 ? ['missing', 'uncertain'] : i === 3 ? ['capacity'] : [],
  receivedAt: `2026-10-${30 - i}T14:30:00Z`, canOpen: true, canReview: true,
}));
export type IntakeReviewPagePreviewProps = {
  initialFilters?: IntakeReviewFilters; initialPageSize?: number; canRead?: boolean; readOnly?: boolean;
  empty?: boolean; many?: boolean; longContent?: boolean; restricted?: boolean; pending?: boolean;
  state?: 'ready' | 'loading' | 'error'; sourcesState?: 'ready' | 'loading' | 'error';
  onOpen: (row: IntakeReviewListRow) => void;
};
/** Explicit Storybook adapter: local fixture filtering/paging, no services or intake decisions. */
export function IntakeReviewPagePreview({ initialFilters = defaultIntakeReviewFilters, initialPageSize = 25, canRead = true, readOnly = false, empty = false, many = false, longContent = false, restricted = false, pending = false, state: initialState = 'ready', sourcesState: initialSourcesState = 'ready', onOpen }: IntakeReviewPagePreviewProps) {
  const [filters, setFilters] = useState(initialFilters), [page, setPage] = useState(1), [size, setSize] = useState(initialPageSize);
  const [state, setState] = useState(initialState), [sourcesState, setSourcesState] = useState(initialSourcesState), [message, setMessage] = useState('');
  const records = !canRead || empty ? [] : (many ? Array.from({ length: 62 }, (_, i) => ({ ...fixtures[i % 4], id: `intake-${i}`, name: `${fixtures[i % 4].name} ${i + 1}` })) : fixtures).map(row => ({ ...row,
    name: longContent ? copy.stories.long.repeat(2) : row.name, summary: longContent ? copy.stories.long.repeat(3) : row.summary,
    canOpen: !restricted, canReview: !readOnly,
  }));
  const query = filters.search.trim().toLocaleLowerCase('en-US');
  const filtered = records.filter(row => (!query || [row.name, row.contact, row.summary].some(value => value?.toLocaleLowerCase('en-US').includes(query)))
    && (!filters.sourceId || row.source.id === filters.sourceId) && (filters.status === 'all' || row.status === filters.status)
    && (filters.flag === 'all' || (filters.flag === 'attention' ? row.flags.length > 0 : filters.flag === 'clear' ? row.flags.length === 0 : row.flags.includes(filters.flag))));
  const activePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / size)));
  return <div className="min-h-screen bg-canvas text-ink md:flex">
    <WorkspaceNavigation workspaceName={copy.stories.workspace} user={{ name: copy.stories.viewer, email: copy.stories.email, role: 'owner' }} currentPage="intake" contentId="intake-review-preview-content" authorizedPages={canRead ? ['home', 'intake', 'campaigns', 'settings'] : ['home', 'settings']} availablePages={['intake', 'campaigns']} onNavigate={() => {}} onAccountSettings={() => {}} onSignOut={() => {}} accountSettingsAvailable={false} />
    <main id="intake-review-preview-content" tabIndex={-1} className="min-w-0 flex-1 px-4 py-6 focus-visible:focus-ring sm:px-8 sm:py-8">
      <p className="mb-6 mt-0 text-sm leading-6 text-muted">{copy.stories.preview}</p>
      {message && canRead && <p role="status" className="mb-5 mt-0 text-sm text-muted wrap-anywhere">{message}</p>}
      <IntakeReviewPage rows={filtered.slice((activePage - 1) * size, activePage * size)} total={filtered.length} page={activePage} pageSize={size} filters={filters}
        sources={canRead ? sources : []} sourcesState={sourcesState} canRead={canRead} state={state} pending={pending} timezone="America/New_York"
        onFilters={next => { setFilters(next); setPage(1); setMessage(''); }} onPage={setPage} onPageSize={next => { setSize(next); setPage(1); }}
        onRetry={() => setState('ready')} onRetrySources={() => setSourcesState('ready')}
        onOpen={row => { if (!canRead || !row.canOpen || pending) return; onOpen(row); setMessage(copy.stories.opened(row.name ?? intakeReviewListData.unnamed)); }} />
    </main>
  </div>;
}
