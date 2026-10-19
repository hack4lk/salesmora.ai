import { serviceCatalog } from './service-catalog.data';

export const servicesAreaStepData = {
  services: 'Services',
  servicesHelp: 'Search by service or category and select at least one service.',
  searchPlaceholder: 'Search services, e.g. drain cleaning',
  noOptions: 'No matching services. Try another term or search for Other.',
  open: 'Show available services',
  close: 'Hide available services',
  clear: 'Clear all selected services',
  selected: 'Selected services',
  removeIcon: '×',
  removeLabel: (service: string) => `Remove ${service}`,
  selectionCount: (count: number) => `${count} ${count === 1 ? 'service selected' : 'services selected'}`,
  postalCode: 'Primary ZIP / postal code',
  postalPlaceholder: 'e.g. 10013',
  range: 'Typical service range (optional)',
  chooseRange: 'Choose a range',
  areaHelp: 'You can add more service areas and specific coverage rules later.',
  errors: {
    services: 'Choose at least one service. Search for “Other” if yours is not listed.',
    range: 'Choose a listed service range, or leave it blank.',
    postal: 'Use a postal code of 100 characters or fewer.',
  },
  serviceOptions: serviceCatalog,
  ranges: [
    { value: '10-miles', label: 'Within 10 miles' },
    { value: '25-miles', label: 'Within 25 miles' },
    { value: '50-miles', label: 'Within 50 miles' },
    { value: 'multiple-regions', label: 'Multiple regions' },
  ],
  stories: {
    title: 'Set up your workspace',
    notice: 'Component preview. Selections stay in this preview; no workspace is created.',
    postal: '10013',
    spacedPostal: '  SW1A 1AA  ',
    normalizedPostal: 'SW1A 1AA',
  },
} as const;
