export const adminWorkspaceTeamActionsCopy = {
  actionTitle: 'Workspace member actions',
  actionDescription: 'Remove a member or resend an open invitation on the Owner’s behalf.',
  auditNote: 'Every change requires a reason and is recorded in staff audit history.',
  remove: 'Remove',
  resend: 'Resend invite',
  removeTitle: 'Remove workspace member?',
  resendTitle: 'Resend workspace invitation?',
  removeConfirm: 'Remove member',
  resendConfirm: 'Resend invitation',
  reason: 'Reason',
  reasonHint: 'Required for the audit record. Enter 10 to 500 characters.',
  pending: 'Working…',
  removeDescription: (name: string, workspace: string) =>
    `${name} immediately loses access to ${workspace}. Their existing records stay in the workspace; assigned leads become unassigned. The Owner is notified.`,
  resendDescription: (email: string, workspace: string) =>
    `A new invitation will be sent to ${email} for ${workspace}. Any earlier invitation link will stop working.`,
  removed: (name: string, unassignedLeads: number) => unassignedLeads > 0
    ? `${name} was removed. ${unassignedLeads} assigned lead${unassignedLeads === 1 ? '' : 's'} became unassigned; existing records remain.`
    : `${name} was removed from the workspace. Existing records remain.`,
  sent: (email: string) => `Invitation email sent to ${email}. Previous invitation links no longer work.`,
  failed: 'The invitation link was updated, but email delivery failed. Select Resend invite to retry the same link.',
  denied: 'Your current role cannot remove workspace members or resend invitations.',
  deletionPending: 'Member access and invitations cannot be changed while workspace deletion is pending.',
} as const;
