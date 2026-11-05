import { adminWorkspaceSuspensionBaseCopy } from './admin-workspace-suspension.data';

export const adminWorkspaceSuspensionCopy = {
  ...adminWorkspaceSuspensionBaseCopy,
  actionDescription: 'Suspension is available to Super Admin and Support. Billing staff can review this workspace but cannot change its access.',
  impact: 'Suspending blocks workspace members, shows them a generic suspension page, sends the Owner a generic email without the staff reason, and pauses workspace background jobs. Unsuspending restores access and resumes jobs.',
  verificationHint: 'Confirm with your enrolled passkey or authenticator app. Verification is bound to this action and expires in 5 minutes.',
  codeHint: 'Enter the current 6-digit code from your authenticator app.',
  continue: 'Continue to verification',
  verifySuspend: 'Verify and suspend',
  verifyUnsuspend: 'Verify and unsuspend',
  pending: 'Working…',
  completed: {
    suspended: 'Workspace suspended. Members see a generic suspension page, the Owner gets a generic email, and background jobs pause. The reason remains internal.',
    active: 'Workspace unsuspended. Members regain access and paused background jobs resume.',
  },
} as const;
