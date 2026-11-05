export const adminPlatformSettingsPageData = {
  title: 'Platform settings',
  description: 'Manage the default monthly AI token allowance used when a workspace has no explicit budget or plan allowance.',
  inheritanceNote: 'Explicit workspace budgets and applicable plan allowances continue to take precedence over this default.',
  environmentSource: 'Using the environment-configured default. Saving a platform value versions an Admin override.',
  resetLabel: 'Restore the environment-configured default',
  resetDescription: 'This creates a versioned reset. Existing workspace budgets and plan allowances are unchanged.',
  noHistory: 'No Admin override has been recorded. The environment value is currently in effect.',
  reasonLabel: 'Reason for this change',
  maxTokens: 1_000_000_000_000,
} as const;
