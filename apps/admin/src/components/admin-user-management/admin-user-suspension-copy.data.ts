import { adminUserSuspensionBaseData } from './admin-user-suspension.data';

export const adminUserSuspensionData = {
  ...adminUserSuspensionBaseData,
  verificationHint: 'Confirm with your enrolled passkey or authenticator app. This verification is bound to this action and expires in 5 minutes.',
  codeHint: 'Enter the current 6-digit code from your authenticator app.',
  continue: 'Continue to verification',
  verifySuspend: 'Verify and suspend',
  verifyUnsuspend: 'Verify and unsuspend',
  pending: 'Working…',
  completedSuspend: (name: string, sessions: number) =>
    `${name} will be suspended and ${sessions} ${sessions === 1 ? 'session will' : 'sessions will'} be revoked.`,
  completedUnsuspend: (name: string) => `${name} will be able to sign in again.`,
} as const;
