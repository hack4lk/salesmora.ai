export const adminUserSuspensionBaseData = {
  title: 'Account access',
  active: 'Active',
  suspended: 'Suspended',
  supportRole: 'Support can suspend or unsuspend customer accounts.',
  denied: 'Your current role can review this profile but cannot change account access.',
  suspend: 'Suspend user',
  unsuspend: 'Unsuspend user',
  suspendTitle: 'Suspend this user?',
  unsuspendTitle: 'Unsuspend this user?',
  suspendDescription: (name: string, sessions: number, ownsWorkspace: boolean) =>
    `${name} will be unable to sign in. ${sessions ? `${sessions} active ${sessions === 1 ? 'session ends' : 'sessions end'} immediately` : 'There are no active sessions to end'}. ${
      ownsWorkspace ? 'Workspaces they own remain available to other members. ' : ''
    }You can unsuspend the account later.`,
  unsuspendDescription: (name: string) =>
    `${name} will be able to sign in again. If the account may be compromised, send a password reset afterwards.`,
  reason: 'Reason',
  reasonHint: 'Required for the audit record. Enter 10 to 500 characters.',
  review: 'Review action',
  verification: 'Verify this action',
  passkey: 'Passkey',
  totp: 'Authenticator code',
  code: '6-digit code',
  activeSessions: (count: number) => `${count} active ${count === 1 ? 'session' : 'sessions'}`,
  workspaceOwner: 'Workspace Owner',
  statusLabel: (suspended: boolean) => suspended ? 'Account is suspended' : 'Account is active',
} as const;
