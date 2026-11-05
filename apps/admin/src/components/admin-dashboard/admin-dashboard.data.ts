export const adminDashboardData = {
  eyebrow: 'Platform overview',
  title: 'Admin dashboard',
  description: 'Choose an area to review or administer. Access is enforced by each area’s staff permissions.',
  sections: [
    {
      title: 'Customer administration',
      description: 'Find customer accounts, manage workspaces, and handle privacy requests.',
      links: [
        { label: 'Customer users', description: 'Search users and review profiles and support actions.', href: '/users' },
        { label: 'Workspaces', description: 'Review workspace details, ownership, billing, and team controls.', href: '/workspaces' },
        { label: 'Data requests', description: 'Review deletion requests and workspace data exports.', href: '/data-requests' },
      ],
    },
    {
      title: 'Governance',
      description: 'Manage application staff and review sensitive administrative activity.',
      links: [
        { label: 'Audit log', description: 'Search the append-only staff activity ledger and archive status.', href: '/audit' },
        { label: 'Staff and invitations', description: 'Manage staff access, roles, and invitations.', href: '/staff' },
      ],
    },
    {
      title: 'Platform',
      description: 'Review usage and delivery health, manage settings, and control feature rollouts.',
      links: [
        { label: 'AI usage', description: 'View token usage by day, model, feature, and workspace.', href: '/ai-usage' },
        { label: 'Queues and delivery', description: 'Review background job queues and notification delivery states.', href: '/operations' },
        { label: 'Platform settings', description: 'Manage the default monthly AI token allowance.', href: '/settings' },
        { label: 'Feature flags', description: 'Manage chat and estimate-sharing plan and workspace overrides.', href: '/flags' },
        { label: 'System rollout flags', description: 'Create and toggle simple system-wide feature rollouts.', href: '/rollout-flags' },
      ],
    },
  ],
} as const;
