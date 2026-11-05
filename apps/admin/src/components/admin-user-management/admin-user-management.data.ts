import type {
  AdminCustomerUser,
  AdminCustomerUserSupplemental,
  AdminCustomerUserStatus,
} from '@salesmora/contracts';

export type { AdminCustomerMembership, AdminCustomerUser, AdminCustomerUserStatus } from '@salesmora/contracts';

export type AdminUserDetailSupplemental = AdminCustomerUserSupplemental;

export const adminUserManagementData = {
  title: 'Users',
  eyebrow: 'Customers',
  description: 'Find customer accounts and review their basic profile and workspace memberships.',
  previewNotice: 'Storybook preview only. All customer records are fictional; no live customer data, credentials, or sessions are connected.',
  liveNotice: 'Live customer profile data. This read-only view returns masked email addresses and basic workspace memberships only.',
  liveDetailNotice: 'Live customer profile. Email and session IP details can be revealed with a reason; the access is audited and remains visible only while this profile is open. Staff-action history, sign-in methods, and notification preferences are also available.',
  privacyNotice: 'Email and session IP addresses are masked by default. Passwords, tokens, and other sign-in secrets are never shown. Customer accounts do not currently store a phone number.',
  search: 'Search users',
  searchPlaceholder: 'Name, email, user ID, or workspace',
  statusFilter: 'Filter by status',
  statuses: {
    all: 'All',
    active: 'Active',
    unverified: 'Unverified',
    suspended: 'Suspended',
    deletion_pending: 'Deletion pending',
  } satisfies Record<'all' | AdminCustomerUserStatus, string>,
  columns: {
    user: 'User',
    status: 'Status',
    workspaces: 'Workspaces and roles',
    created: 'Created',
  },
  membershipCount: (count: number) => `${count} ${count === 1 ? 'workspace' : 'workspaces'}`,
  noMemberships: 'No workspace memberships',
  results: (start: number, end: number, total: number) => `${start}–${end} of ${total} users`,
  previous: 'Previous page',
  next: 'Next page',
  pagination: 'User result pages',
  emptyTitle: 'No users found',
  emptyDescription: 'No customer accounts match these filters.',
  loading: 'Loading customer users…',
  loadFailed: 'Could not load customer users. Retry before relying on this list.',
  deniedTitle: 'User access denied',
  denied: 'Your current role does not permit reading customer users. This access attempt has been recorded.',
  retry: 'Retry user list',
  detailTitle: 'Customer profile',
  profile: 'Profile',
  memberships: 'Workspace memberships',
  authMethods: 'Sign-in methods',
  noAuthMethods: 'No sign-in methods recorded',
  sessions: 'Sessions',
  noSessions: 'No sessions recorded',
  device: 'Device',
  sessionIp: 'IP address (masked)',
  sessionCreated: 'Session started',
  lastActivity: 'Last activity',
  sessionsShown: (shown: number, total: number) => `Showing ${shown} of ${total} recent sessions.`,
  notificationPreferences: 'Email notification preferences',
  notificationPreferenceLabels: {
    leadAssignedEmail: 'Lead assigned',
    visitChangedEmail: 'Visit changed',
    estimateEmail: 'Estimate updates',
    deadlineReminderEmail: 'Deadline reminders',
    jobActivityEmail: 'Job activity',
  } satisfies Record<keyof NonNullable<AdminUserDetailSupplemental['notificationPreferences']>, string>,
  enabled: 'On',
  disabled: 'Off',
  noNotificationPreferences: 'No notification preferences recorded',
  defaultNotificationPreferences: 'No saved preferences; showing the current default settings.',
  userId: 'User ID',
  email: 'Email',
  status: 'Account status',
  emailVerified: 'Email verification',
  verified: 'Verified',
  notVerified: 'Not verified',
  createdAt: 'Account created',
  back: 'Back to users',
  noWorkspaces: 'This user has no workspace memberships.',
  detailUnavailable: 'Could not load this customer profile. Retry before relying on this view.',
  loadingDetail: 'Loading customer profile…',
  unknownDate: 'Not recorded',
  statusLabel: (status: AdminCustomerUserStatus) => ({
    active: 'Active',
    unverified: 'Unverified',
    suspended: 'Suspended',
    deletion_pending: 'Deletion pending',
  })[status],
} as const;

export function getAdminCustomerUserStatus(user: AdminCustomerUser): AdminCustomerUserStatus {
  if (user.deletionRequestedAt) return 'deletion_pending';
  if (user.suspendedAt) return 'suspended';
  if (!user.emailVerified) return 'unverified';
  return 'active';
}

export const adminCustomerUserPreviews: readonly AdminCustomerUser[] = [
  {
    id: 'usr_demo_001',
    name: 'Jordan Lee',
    maskedEmail: 'jo••••@northstar.example',
    emailVerified: true,
    suspendedAt: null,
    deletionRequestedAt: null,
    createdAt: '2026-03-12T10:15:00.000Z',
    memberships: [
      { workspaceId: 'ws_demo_101', workspaceName: 'Northstar Home Services', role: 'Owner' },
      { workspaceId: 'ws_demo_102', workspaceName: 'Northstar Field Team', role: 'Member' },
    ],
  },
  {
    id: 'usr_demo_002',
    name: 'Morgan Patel',
    maskedEmail: 'mo••••@brightline.example',
    emailVerified: true,
    suspendedAt: null,
    deletionRequestedAt: null,
    createdAt: '2026-04-04T15:40:00.000Z',
    memberships: [{ workspaceId: 'ws_demo_103', workspaceName: 'Brightline Electric', role: 'Admin' }],
  },
  {
    id: 'usr_demo_003',
    name: 'Taylor Kim',
    maskedEmail: 'ta••••@sample.example',
    emailVerified: false,
    suspendedAt: null,
    deletionRequestedAt: null,
    createdAt: '2026-05-22T08:30:00.000Z',
    memberships: [],
  },
  {
    id: 'usr_demo_004',
    name: 'Casey Rivera',
    maskedEmail: 'ca••••@demo.example',
    emailVerified: true,
    suspendedAt: '2026-06-02T09:00:00.000Z',
    deletionRequestedAt: null,
    createdAt: '2026-02-18T12:00:00.000Z',
    memberships: [{ workspaceId: 'ws_demo_104', workspaceName: 'Rivera Repair', role: 'Owner' }],
  },
  {
    id: 'usr_demo_005',
    name: 'Avery Chen',
    maskedEmail: 'av••••@example.test',
    emailVerified: true,
    suspendedAt: null,
    deletionRequestedAt: '2026-06-10T11:00:00.000Z',
    createdAt: '2026-01-08T17:20:00.000Z',
    memberships: [{ workspaceId: 'ws_demo_105', workspaceName: 'Avery Chen Services', role: 'Owner' }],
  },
];

export const adminUserDetailSupplementalPreview: AdminUserDetailSupplemental = {
  authMethods: ['Password', 'Google'],
  sessions: [
    {
      device: 'Chrome on macOS',
      maskedIp: '73.162.x.x',
      createdAt: '2026-03-12T10:15:00.000Z',
      lastActivityAt: '2026-03-12T11:41:00.000Z',
    },
    {
      device: 'Safari on iPhone',
      maskedIp: '174.204.x.x',
      createdAt: '2026-03-11T08:30:00.000Z',
      lastActivityAt: '2026-03-12T09:05:00.000Z',
    },
  ],
  totalSessions: 2,
  notificationPreferencesRecorded: true,
  notificationPreferences: {
    leadAssignedEmail: true,
    visitChangedEmail: true,
    estimateEmail: true,
    deadlineReminderEmail: false,
    jobActivityEmail: true,
  },
};

export const adminUserDetailSupplementalEmptyPreview: AdminUserDetailSupplemental = {
  authMethods: [],
  sessions: [],
  totalSessions: 0,
  notificationPreferencesRecorded: false,
  notificationPreferences: {
    leadAssignedEmail: true,
    visitChangedEmail: true,
    estimateEmail: true,
    deadlineReminderEmail: true,
    jobActivityEmail: true,
  },
};
