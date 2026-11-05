type Timestamp = Date | string | null | undefined;

export interface UserAccessState { deletionRequestedAt?: Timestamp; suspendedAt?: Timestamp }
export interface WorkspaceAccessState { deletionRequestedAt?: Timestamp; suspendedAt?: Timestamp }
export type WorkspaceAccess = 'active' | 'suspended' | 'deleting';

export const suspensionReasonMinLength = 10;
export const suspensionReasonMaxLength = 500;

/** A blocked user can't sign in or keep a session. Customers only ever see a generic message. */
export function isUserBlocked(user: UserAccessState): boolean {
  return Boolean(user.deletionRequestedAt || user.suspendedAt);
}

/** Deletion wins over suspension: a deleting workspace is never restored by unsuspending it. */
export function workspaceAccess(workspace: WorkspaceAccessState): WorkspaceAccess {
  if (workspace.deletionRequestedAt) return 'deleting';
  if (workspace.suspendedAt) return 'suspended';
  return 'active';
}

/** Internal staff note, long enough to explain the action and bounded for audit storage. */
export function normalizeSuspensionReason(reason: unknown): string {
  const value = typeof reason === 'string' ? reason.trim() : '';
  if (value.length < suspensionReasonMinLength) {
    throw new RangeError(`The suspension reason must be at least ${suspensionReasonMinLength} characters.`);
  }
  if (value.length > suspensionReasonMaxLength) throw new RangeError(`The suspension reason must be ${suspensionReasonMaxLength} characters or fewer.`);
  return value;
}
