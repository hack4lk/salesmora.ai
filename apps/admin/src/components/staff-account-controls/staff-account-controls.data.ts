import type { StaffRoleId } from '@salesmora/contracts';

export interface StaffAccountPreview {
  id: string;
  name: string;
  email: string;
  role: StaffRoleId;
  active: boolean;
  version?: number;
  factors?: readonly string[];
  lastActive?: string;
}

export const staffAccountControlsData = {
  title: 'Staff account access',
  description: 'Review disable, re-enable and existing-account role changes before live integration.',
  notice: 'Storybook preview only. Use fictional credentials. Account changes and session revocation are simulated; no requests are sent.',
  liveNotice: 'Account changes require a reason and fresh password-plus-factor verification. Super Admin promotions and restorations require independent approval.',
  auditHistory: 'View audit history',
  role: 'New role',
  change: 'Review role change',
  disable: 'Review disable',
  enable: 'Review re-enable',
  active: 'Active',
  disabled: 'Disabled',
  pending: 'Awaiting a different authorized approver. Expires in 5 minutes. No role or access change has been applied.',
  requestLabel: 'Pending account approval',
  requestExpired: 'This approval request has expired. No role or access change was applied.',
  completed: 'Preview change applied. All previous sessions remain revoked; the staff member must sign in again.',
  reviewFailed: 'The account changed during review. Close this review and check the current staff record.',
  empty: 'No staff accounts to manage.',
  accounts: [
    { id: 'jordan', name: 'Jordan Lee', email: 'jordan.lee@karpukcreative.com', role: 'super_admin', active: true },
    { id: 'morgan', name: 'Morgan Patel', email: 'morgan.patel@karpukcreative.com', role: 'super_admin', active: true },
    { id: 'taylor', name: 'Taylor Kim', email: 'taylor.kim@karpukcreative.com', role: 'support', active: true },
    { id: 'alex', name: 'Alex Rivera', email: 'alex.rivera@karpukcreative.com', role: 'billing', active: false },
  ] satisfies StaffAccountPreview[],
} as const;
