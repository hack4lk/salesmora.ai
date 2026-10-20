export const teamStepData = {
  planSeats: (limit: number) => `Your selected plan includes ${limit} ${limit === 1 ? 'user' : 'users'}, including you. Invitations reserve a seat and are sent only after verification and any required payment.`,
  owner: 'Workspace owner', ownerHelp: 'You are the Owner of this workspace.',
  empty: 'Working solo? Continue without teammates, or add someone below.',
  delivery: 'Invitations will be sent after your workspace is created and your email is verified.',
  permissions: 'Field teammates work on assigned leads and jobs. Office teammates coordinate workspace work. Admins also manage settings and teammates. Only the Owner changes permissions.',
  add: 'Add teammate', email: 'Teammate email', role: 'Permission role',
  teammate: (index: number) => `Teammate ${index}`, remove: (index: number) => `Remove teammate ${index}`,
  roles: [{ value: 'field', label: 'Field' }, { value: 'office', label: 'Office' }, { value: 'admin', label: 'Admin' }],
  errors: { email: 'Enter a valid email address.', duplicate: 'This teammate is already on your list.', owner: 'You are already the workspace Owner.', role: 'Choose Field, Office or Admin.' },
  stories: { loadingOwner: 'Loading your signed-in account…', signInHelp: 'Sign in to the local app, then refresh this preview to use your account as the workspace Owner.', signIn: 'Sign in to SalesMora', loginUrl: 'http://127.0.0.1:3000/login', title: 'Set up your workspace', notice: 'Component preview. No invitations are sent and no workspace is created.', owner: 'owner@example.com', email: 'alex@example.com', second: 'jordan@example.com', invalid: 'invalid-email', spaced: '  ALEX@example.com  ' },
} as const;
