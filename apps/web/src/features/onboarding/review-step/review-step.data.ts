export const reviewStepData = {
  sections: { business: 'Business profile', services: 'Services and service area', team: 'Team and invitations' },
  edit: { business: 'Edit business', services: 'Edit services and area', team: 'Edit team' },
  businessName: 'Business name', businessType: 'Business type', services: 'Selected services',
  postalCode: 'Primary ZIP / postal code', range: 'Typical service range',
  notProvided: 'Not provided', owner: 'Workspace Owner', noInvitations: 'No teammate invitations. You can invite people later.',
  invitations: 'Teammate invitations', delivery: 'Invitations will be sent only after your workspace is created and your email is verified.',
  confirmation: 'Create your workspace with these details. You can update them later in workspace settings.',
  incomplete: 'Some details need attention. Edit the highlighted section before creating your workspace.',
  needsAttention: 'Needs attention', createErrorTitle: 'Workspace could not be created',
  stories: {
    title: 'Set up your workspace', notice: 'Component preview. Create workspace confirms this preview only; no workspace is saved or invitations sent.',
    complete: 'Preview confirmed. Use the local app setup to save a real workspace; no workspace was saved or invitations sent here.',
    appLink: 'Open local app setup to create a workspace', appHref: 'http://127.0.0.1:3000/setup',
    failure: 'We could not save your workspace. Your details are still here. Please try again.',
    longName: 'Northstar Residential and Commercial Property Maintenance Services',
    longPostal: 'SW1A 1AA',
  },
} as const;
