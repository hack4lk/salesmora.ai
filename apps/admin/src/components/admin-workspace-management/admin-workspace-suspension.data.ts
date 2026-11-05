export const adminWorkspaceSuspensionBaseCopy = {
  actionTitle: 'Workspace access',
  actionDescription: 'Available to Super Admin and Support. Billing staff can review this workspace but cannot change its access.',
  suspend: 'Suspend workspace',
  unsuspend: 'Unsuspend workspace',
  denied: 'Your current role can review this workspace but cannot change its access.',
  impact: 'Suspending blocks workspace members, shows them a generic suspension page, sends the Owner a generic email without the staff reason, and pauses workspace background jobs. Unsuspending restores access and resumes jobs.',
  reasonVisibility: 'The 10–500 character staff reason is internal and appears only in the admin audit history.',
  suspendTitle: 'Suspend this workspace?',
  unsuspendTitle: 'Unsuspend this workspace?',
  suspendDescription: (name: string) =>
    `Members of ${name} will lose access and its background jobs will pause. The Owner receives a generic email; the staff reason is not included.`,
  unsuspendDescription: (name: string) =>
    `Members of ${name} will regain access and its paused background jobs will resume.`,
  reason: 'Reason',
  reasonHint: 'Required for the audit record. Enter 10 to 500 characters.',
  review: 'Review action',
  verification: 'Verify this action',
  passkey: 'Passkey',
  totp: 'Authenticator code',
  code: '6-digit code',
} as const;
