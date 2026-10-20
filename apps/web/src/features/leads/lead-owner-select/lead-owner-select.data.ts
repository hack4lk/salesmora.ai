export const leadOwnerSelectData = {
  label: 'Lead owner', unassigned: 'Unassigned', former: 'Former member', unavailable: 'Owner unavailable',
  assignMe: 'Assign to me', assignedMe: 'Assigned to you', retry: 'Retry loading teammates',
  helper: 'Open leads include New, Contacted and Estimate sent; archived leads are excluded.',
  readOnly: 'You can view this owner. Assignment requires permission.', empty: 'No current teammates are available. You can leave this lead unassigned.',
  loading: 'Loading teammates…', pending: 'Updating owner…',
  workload: (count: number) => `${new Intl.NumberFormat('en-US').format(count)} open`, unknownWorkload: 'Workload unavailable',
  formerHelp: 'This teammate has left the workspace. Choose a current teammate or Unassigned.',
  unavailableHelp: 'The selected owner is not in the available teammate list. Reload the list or choose another owner.',
  stories: {
    title: 'Lead owner picker', description: 'Reusable assignment field with mocked workspace teammates and server-supplied workload counts. Selecting an option changes a draft only.',
    error: 'Could not load workspace teammates. Try again.',
    members: [
      { id: 'sam', name: 'Sam Rivera', openLeadCount: 12 },
      { id: 'taylor', name: 'Taylor Morgan', openLeadCount: 4 },
      { id: 'avery', name: 'Avery Chen', openLeadCount: 0 },
    ],
    formerOwner: { id: 'former', name: 'Former teammate', former: true },
    longOwner: 'Alexandra Morgan-Williams from the residential installation team',
  },
} as const;
