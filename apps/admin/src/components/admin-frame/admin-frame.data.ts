export const adminFrameData = {
  brand: 'SalesMora.ai',
  signOut: 'Sign out',
  signingOut: 'Signing out...',
  signOutError: 'Could not sign out. Your session may still be active. Please try again.',
  title: 'Admin authentication is being set up',
  description: 'Staff sign-in is not available until Access identity verification and staff onboarding are configured.',
  navigation: [
    {
      label: 'Overview',
      items: [{ label: 'Dashboard', href: '/' }],
    },
    {
      label: 'Customers',
      items: [
        { label: 'Users', href: '/users' },
        { label: 'Workspaces', href: '/workspaces' },
        { label: 'Data requests', href: '/data-requests' },
      ],
    },
    {
      label: 'Platform',
      items: [
        { label: 'AI usage', href: '/ai-usage' },
        { label: 'Queues and delivery', href: '/operations' },
        { label: 'Platform settings', href: '/settings' },
        { label: 'Feature flags', href: '/flags' },
        { label: 'System rollout flags', href: '/rollout-flags' },
      ],
    },
    {
      label: 'Governance',
      items: [
        { label: 'Audit log', href: '/audit' },
        { label: 'Staff', href: '/staff' },
      ],
    },
  ],
  environmentLabels: {
    local: 'Local development',
    staging: 'Staging environment',
    production: 'Production environment',
  },
} as const;
