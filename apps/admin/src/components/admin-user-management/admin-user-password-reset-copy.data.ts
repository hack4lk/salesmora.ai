export const adminUserPasswordResetData = {
  title: 'Password reset',
  action: 'Send password reset link',
  readOnly: 'Your current role can review this profile but cannot request a password reset.',
  noPassword: 'This account has no password sign-in method. Password reset is unavailable.',
  description: (email: string) =>
    `Request a one-time reset link for ${email}. The user chooses their own password; staff never see or set it. The link expires after 30 minutes, and completing a reset signs out existing sessions.`,
  dialogTitle: 'Send a password reset link?',
  dialogDescription: (email: string) =>
    `A one-time reset link will be requested for ${email}. The user sets their own password. Completing the reset revokes their existing sessions.`,
  reason: 'Reason',
  reasonHint: 'Required for the audit record. Enter 10 to 500 characters.',
  confirm: 'Send reset link',
  pending: 'Sending reset link…',
  failed: 'The reset request could not be completed. Check with the customer before trying again.',
  success: (email: string) =>
    `The reset request was accepted for ${email}. Delivery is not confirmed; ask the customer to check their inbox and spam folder before retrying.`,
  auditReason: (reason: string) => `Audit reason: ${reason}`,
} as const;
