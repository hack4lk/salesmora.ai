export const intakeReviewToolbarData = {
  title: 'Intake filters', search: 'Search intake items', placeholder: 'Search name, email or subject',
  source: 'Capture source', allSources: 'All capture sources', unavailableSource: 'Source unavailable',
  loadingSources: 'Loading capture sources…', sourcesError: 'Capture sources could not be loaded.', retry: 'Try again',
  status: 'Review status', statuses: { all: 'All statuses', awaiting: 'Awaiting review', approved: 'Approved', dismissed: 'Dismissed' },
  flag: 'Review flags', flags: { all: 'All review flags', attention: 'Needs attention', duplicate: 'Possible duplicate', missing: 'Missing details', clear: 'No review flags' },
  denied: 'You do not have access to Intake Review.',
  unavailableHelp: 'The selected source is unavailable. Choose another source or remove this filter.',
  chip: (label: string, value: string) => `${label}: ${value}`,
  stories: {
    title: 'Intake Review', description: 'Filters update preview state only. No intake records are queried or changed.',
    query: 'Kitchen enquiry', sources: [{ id: 'website', name: 'Website project requests' }, { id: 'gmail', name: 'Gmail enquiries' }, { id: 'archived', name: 'Previous season enquiries (archived)' }],
    longSource: 'Residential kitchen remodeling and whole-home improvement requests from our extended service area',
  },
} as const;
