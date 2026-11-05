export const captureSourcePageData = {
  title: 'Lead Capture', description: 'Manage capture sources and review their current state.', create: 'Create capture source', denied: 'You do not have permission to view Lead Capture.',
  stories: {
    preview: 'Page preview with fictional data. Filters and lifecycle confirmations update this preview only; no services are connected.',
    workspace: 'Northstar Home Services', viewer: 'Sam Rivera', email: 'sam@example.com',
    names: ['Kitchen remodel requests', 'Gmail quote enquiries', 'Seasonal service requests', 'New plumbing enquiries', 'Referral intake', 'Previous season website form'],
    fieldsLabel: 'Fields', fields: 'Full name, email, phone and service requested', workflowLabel: 'Lead workflow', workflow: 'Unassigned · New',
    create: 'Create setup requested (preview only).', open: (name: string) => `Source details requested: ${name} (preview only).`, edit: (name: string) => `Setup requested: ${name} (preview only).`,
    changed: 'Source updated in this preview only.', copied: 'Draft copy created in this preview only.', failed: 'Simulated service failure.', conflict: 'The source changed. Reopen its current review.',
    copyName: 'New draft copy', missing: 'No source has this name', long: 'Residential kitchen remodeling and whole-home improvement requests across our extended service area',
  },
} as const;
