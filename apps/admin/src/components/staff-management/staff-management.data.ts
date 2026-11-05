import type { StaffRoleId } from '@salesmora/contracts';

export interface StaffMemberPreview {
  id: string;
  name: string;
  email: string;
  role: StaffRoleId | null;
  status: 'active' | 'suspended' | 'no_access';
  factors: string[];
  lastActive: string;
}

export interface StaffInvitationPreview {
  id: string;
  email: string;
  role: StaffRoleId;
  status: 'pending' | 'expired' | 'revoked' | 'accepted';
  expires: string;
  delivery?: 'pending' | 'sent' | 'failed' | null;
}

export const staffManagementData = {
  title: 'Staff and invitations',
  description: 'Manage SalesMora staff access. Changes shown here are Storybook previews only.',
  liveDescription: 'Manage SalesMora staff accounts, invitations and second-person approval requests.',
  liveNotice: 'Staff access changes require an audit reason, your password and a second factor. Super Admin invitations, promotions and restorations require a different authorized approver.',
  reviewInvite: 'Review invitation',
  reviewApproval: 'Review request',
  retryEmail: 'Retry email',
  deliveryLabels: { pending: 'Email pending', sent: 'Email sent', failed: 'Email delivery failed. Retry or revoke this invitation.' },
  noRole: 'No active role',
  noAccess: 'No access',
  approvalStatuses: { pending: 'Awaiting second approver', approved: 'Approved', rejected: 'Rejected', expired: 'Expired' },
  currentStaff: [
    {
      id: 'staff-001',
      name: 'Jordan Lee',
      email: 'jordan.lee@karpukcreative.com',
      role: 'super_admin',
      status: 'active',
      factors: ['Passkey', 'Authenticator'],
      lastActive: 'Active 12 minutes ago',
    },
    {
      id: 'staff-002',
      name: 'Morgan Patel',
      email: 'morgan.patel@karpukcreative.com',
      role: 'support',
      status: 'active',
      factors: ['Passkey'],
      lastActive: 'Active yesterday',
    },
    {
      id: 'staff-003',
      name: 'Taylor Kim',
      email: 'taylor.kim@karpukcreative.com',
      role: 'billing',
      status: 'suspended',
      factors: ['Authenticator'],
      lastActive: 'Suspended October 28',
    },
  ] satisfies StaffMemberPreview[],
  invitations: [
    {
      id: 'invite-001',
      email: 'alex.rivera@karpukcreative.com',
      role: 'support',
      status: 'pending',
      expires: 'Expires in 18 hours',
    },
    {
      id: 'invite-002',
      email: 'sam.chen@karpukcreative.com',
      role: 'billing',
      status: 'expired',
      expires: 'Expired October 29',
    },
    {
      id: 'invite-003',
      email: 'casey.wong@karpukcreative.com',
      role: 'support',
      status: 'revoked',
      expires: 'Revoked October 27',
    },
  ] satisfies StaffInvitationPreview[],
  roleLabels: {
    super_admin: 'Super Admin',
    support: 'Support',
    billing: 'Billing',
  } satisfies Record<StaffRoleId, string>,
  invitationForm: {
    title: 'Invite a staff member',
    emailLabel: 'Staff email',
    emailHint: 'Only @karpukcreative.com addresses can be invited.',
    roleLabel: 'Admin role',
    superAdminNotice: 'Super Admin access requires approval from a second authorized staff member. No invitation is sent until approval.',
    previewNotice: 'Storybook preview only. No email will be sent and no staff access will change.',
    submitInvite: 'Create invitation preview',
    requestApproval: 'Request Super Admin approval',
  },
} as const;
