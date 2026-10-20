export const filterChipData = {
  remove: (label: string) => `Remove filter: ${label}`,
  stories: {
    title: 'Filter chips',
    description: 'Remove an active filter with a click, Enter, or Space.',
    stage: 'Stage: New',
    source: 'Source: Referral',
    owner: 'Owner: Taylor Morgan',
    date: 'Created: Last 30 days',
    archived: 'Archived: Included',
    longLabel: 'Owner: Taylor Morgan from the residential installation and maintenance team',
    filtersLabel: 'Active filters',
    removed: (label: string) => `Removed ${label}.`,
    empty: 'No active filters.',
  },
};
