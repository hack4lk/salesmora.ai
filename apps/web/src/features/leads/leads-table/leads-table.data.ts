import { leadsToolbarData } from '../leads-toolbar/leads-toolbar.data';

export const leadsTableData = {
  caption: 'Leads',
  columns: [{ id: 'name', label: 'Lead' }, { id: 'service', label: 'Service requested' }, { id: 'stage', label: 'Stage' }, { id: 'source', label: 'Source' }, { id: 'owner', label: 'Owner' }, { id: 'created', label: 'Created' }],
  stages: leadsToolbarData.stages, sources: leadsToolbarData.sources,
  unassigned: 'Unassigned', archived: 'Archived', restore: 'Restore',
  empty: 'No leads yet. New leads will appear here.', filteredEmpty: 'No leads match these filters.', clearFilters: 'Clear filters',
  error: 'Leads could not be loaded. Your current filters are preserved.',
  sortBy: 'Sort by', ascending: 'Ascending', descending: 'Descending', reverseSort: (direction: string) => `${direction === 'asc' ? 'Ascending' : 'Descending'} · Switch to ${direction === 'asc' ? 'descending' : 'ascending'}`,
  today: 'Today', yesterday: 'Yesterday', daysAgo: (days: number) => `${days} days ago`, dateUnavailable: 'Date unavailable', dateLabel: (relative: string, exact: string) => `${relative} · ${exact}`,
  selected: (count: number) => `${count} ${count === 1 ? 'lead' : 'leads'} selected.`, allSelected: (count: number) => `All ${count} matching leads selected.`,
  selectAll: (count: number) => `Select all ${count} matching leads`, clearSelection: 'Clear selection', selectionLabel: 'Lead selection',
  stories: {
    title: 'Leads table', description: 'Fictional lead results. Sorting, paging, selection, quick view and restore requests are mocked.',
    now: '2026-10-14T16:00:00.000Z', timezone: 'America/New_York',
    quickView: 'Quick-view preview. Full lead details will be built as the next component.',
    restored: 'Restore requested (preview only). No records were changed.',
    filtersCleared: 'Clear filters requested (preview only).', retryRequested: 'Reload requested (preview only).',
    name: (name: string, number: number) => `${name} ${number}`,
    href: (id: string) => `#preview-lead-${id}`,
    rows: [
      { id: 'jordan', name: 'Jordan Lee', service: 'Kitchen sink repair', stage: 'new', source: 'website', owner: { id: 'sam', name: 'Sam Rivera' }, createdAt: '2026-10-14T14:00:00.000Z', archived: false, canRestore: false },
      { id: 'taylor', name: 'Taylor Morgan', service: 'Water heater installation', stage: 'contacted', source: 'referral', owner: { id: 'ava', name: 'Ava Morgan' }, createdAt: '2026-10-13T14:00:00.000Z', archived: false, canRestore: false },
      { id: 'alex', name: 'Alex Chen', service: 'Emergency pipe repair', stage: 'estimate-sent', source: 'phone', owner: null, createdAt: '2026-10-11T14:00:00.000Z', archived: false, canRestore: false },
      { id: 'riley', name: 'Riley Brooks', service: 'Bathroom renovation', stage: 'won', source: 'gmail', owner: { id: 'sam', name: 'Sam Rivera' }, createdAt: '2026-10-09T14:00:00.000Z', archived: false, canRestore: false },
      { id: 'casey', name: 'Casey Patel', service: 'Drain cleaning', stage: 'lost', source: 'other', owner: { id: 'ava', name: 'Ava Morgan' }, createdAt: '2026-10-07T14:00:00.000Z', archived: false, canRestore: false },
    ],
  },
} as const;
