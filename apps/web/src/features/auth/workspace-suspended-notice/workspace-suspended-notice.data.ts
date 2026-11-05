export const workspaceSuspendedNoticeData = {
  page: {
    documentTitle: 'Workspace unavailable — SalesMora.ai',
    title: 'Workspace unavailable',
    description: 'Access to this workspace is paused.',
    signedOut: 'Sign in to see your workspaces.',
    signIn: 'Sign in',
  },
  title: 'This workspace has been suspended',
  description: 'SalesMora support has paused access to this workspace. Your data is kept safe and nothing has been deleted.',
  contact: 'Contact your workspace Owner or SalesMora support to learn more.',
  otherWorkspaces: 'Your other workspaces',
  open: (name: string) => `Open ${name}`,
  signOut: 'Sign out', signingOut: 'Signing out…',
  signOutErrorTitle: 'Sign-out failed', signOutError: 'We could not sign you out. Please try again.',
  stories: {
    title: 'Workspace suspended notice', notice: 'Preview only. No session is changed; workspaces are fictional.',
    workspaces: [
      { id: '00000000-0000-4000-8000-000000000011', name: 'Northstar Plumbing' },
      { id: '00000000-0000-4000-8000-000000000012', name: 'Harbor Electric' },
    ],
    longName: 'Northstar Property Maintenance, Construction and Professional Services',
  },
} as const;
