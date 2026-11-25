export const serviceWorkersEditorData = {
  title: 'Qualified workers', description: (name:string) => `Choose who can perform ${name}.`,
  add: 'Add a worker', none: 'No other workers available', preferred: 'Preferred order',
  orderHelp: 'Booking uses the earliest available slot. This order breaks ties.',
  empty: 'No workers selected. Automatic assignment cannot choose a worker for this service.',
  unavailable: 'Unavailable worker', unavailableHelp: 'Remove unavailable workers before saving.',
  noMembers: 'Add active workspace members before choosing workers.',
  readOnly: 'You can view qualified workers. A workspace administrator can make changes.',
  loading: 'Loading workers…', loadError: 'Workers could not be loaded.', reload: 'Reload workers',
  conflict: 'These settings changed. Reload before saving.',
  failed: 'Workers could not be saved. Your changes are still here.',
  save: 'Save changes', saving: 'Saving…', cancel: 'Cancel', close: 'Close', removeAction:'Remove',
  up: (name:string)=>`Move ${name} up`, down:(name:string)=>`Move ${name} down`, remove:(name:string)=>`Remove ${name}`,
};
