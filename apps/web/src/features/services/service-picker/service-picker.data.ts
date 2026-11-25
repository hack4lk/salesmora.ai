export const servicePickerData = {
  label: 'Service type', placeholder: 'Choose a service', empty: 'No services available',
  emptyHelp: 'Ask a workspace administrator to add service types in Settings.',
  legacyHelp: 'Choose a workspace service to replace this previous value.',
  unavailableHelp: 'Choose an active service for new work.',
  archived: (name: string) => `${name} (archived)`,
  unavailable: (name: string) => `${name} (unavailable)`,
};
