export const filterBarData = {
  title: 'Filters',
  controls: 'Filter controls',
  active: 'Active filters',
  clear: 'Clear all',
  count: (count: number) => count === 0 ? 'No active filters.' : `${count} active ${count === 1 ? 'filter' : 'filters'}.`,
  stories: {
    title: 'Filter bar',
    description: 'Shared filter layout with injected controls. These examples update preview state only.',
    stage: 'Stage',
    source: 'Source',
    chooseStage: 'Add a stage filter',
    chooseSource: 'Add a source filter',
    stageOptions: [{ id: 'stage-new', label: 'Stage: New', option: 'New' }, { id: 'stage-contacted', label: 'Stage: Contacted', option: 'Contacted' }],
    sourceOptions: [{ id: 'source-referral', label: 'Source: Referral', option: 'Referral' }, { id: 'source-phone', label: 'Source: Phone', option: 'Phone' }],
    otherFilters: [{ id: 'owner', label: 'Owner: Taylor Morgan' }, { id: 'created', label: 'Created: Last 30 days' }, { id: 'archived', label: 'Archived: Included' }],
    longLabel: 'Owner: Taylor Morgan from the residential installation and maintenance team',
  },
};
