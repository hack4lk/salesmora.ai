import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { BrandProvider } from '@salesmora/ui';
import { AdminFrame } from '../admin-frame/admin-frame';
import { StaffActionReview, type StaffActionReviewProps, type StaffVerificationResult } from './staff-action-review';
import { staffActionReviewData as copy } from './staff-action-review.data';

function Preview(args: StaffActionReviewProps) {
  const [open, setOpen] = useState(true);
  const [complete, setComplete] = useState(false);
  return <BrandProvider><AdminFrame environment="local">
    <h1 id="admin-title">{copy.stories.title}</h1>
    <p>{copy.stories.description}</p>
    <button type="button" onClick={() => { setComplete(false); setOpen(true); }}
      className="mt-5 min-h-11 cursor-pointer rounded-xl bg-primary px-5 py-3 font-semibold text-paper focus-visible:focus-ring">{copy.stories.open}</button>
    {complete && <p role="status" className="mt-5 text-sm text-success">{copy.stories.completed}</p>}
    {open && <StaffActionReview {...args} onClose={() => { args.onClose(); setOpen(false); }}
      onConfirm={async input => {
        const result = await args.onConfirm(input);
        if (result.ok) setComplete(true);
        return result;
      }} />}
  </AdminFrame></BrandProvider>;
}

const success = async (): Promise<StaffVerificationResult> => ({ ok: true });
const approval = {
  kind: 'approval',
  role: 'super_admin',
  email: copy.stories.email,
  requestId: 'approval-preview',
  requestedBy: { id: 'requester-preview', name: copy.stories.requester },
  expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
} as const;

const meta = {
  title: 'Admin/Staff/StaffActionReview',
  component: Preview,
  parameters: { layout: 'fullscreen' },
  args: {
    action: { kind: 'invite', email: 'new.support@karpukcreative.com', role: 'support' },
    reviewer: { id: 'reviewer-preview', role: 'super_admin' },
    methods: ['passkey', 'totp'],
    onVerifyPassword: fn(success),
    onVerifyFactor: fn(success),
    onConfirm: fn(success),
    onClose: fn(),
  },
} satisfies Meta<typeof Preview>;

export default meta;
type Story = StoryObj<typeof meta>;
type Canvas = ReturnType<typeof within>;

async function enterReason(canvas: Canvas) {
  await waitFor(() => expect(canvas.getByRole('alertdialog')).toBeVisible());
  await userEvent.type(canvas.getByRole('textbox', { name: copy.labels.reason }), copy.stories.reason);
  await userEvent.click(canvas.getByRole('button', { name: copy.buttons.review }));
  await waitFor(() => expect(canvas.getByRole('heading', { name: copy.stages.password })).toBeVisible());
}

async function verifyPassword(canvas: Canvas) {
  await enterReason(canvas);
  await userEvent.type(canvas.getByLabelText(copy.labels.password, { exact: false, selector: 'input' }), copy.stories.password);
  await userEvent.click(canvas.getByRole('button', { name: copy.buttons.password }));
  await waitFor(() => expect(canvas.getByRole('heading', { name: copy.stages.factor })).toBeVisible());
}

async function verifyPasskey(canvas: Canvas) {
  await verifyPassword(canvas);
  await userEvent.click(canvas.getByRole('button', { name: copy.buttons.passkey }));
  await waitFor(() => expect(canvas.getByRole('heading', { name: copy.stages.confirm })).toBeVisible());
}

export const InvitationReview: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(canvas.getByRole('alertdialog')).toBeVisible());
    await expect(canvas.getByRole('button', { name: copy.buttons.review })).toBeDisabled();
    await expect(args.onVerifyPassword).not.toHaveBeenCalled();
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};

export const PasswordReauthentication: Story = {
  play: async ({ canvasElement }) => enterReason(within(canvasElement.ownerDocument.body)),
};

export const SecondFactorSelection: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await verifyPassword(canvas);
    await expect(args.onVerifyPassword).toHaveBeenCalledWith(copy.stories.password, {
      action: args.action, reason: copy.stories.reason, decision: 'approve',
    });
    await expect(canvas.queryByLabelText(copy.labels.password, { exact: false, selector: 'input' })).not.toBeInTheDocument();
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};

export const AuthenticatorVerification: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await verifyPassword(canvas);
    await userEvent.click(canvas.getByRole('radio', { name: copy.labels.totp }));
    await expect(canvas.getByRole('button', { name: copy.buttons.totp })).toBeDisabled();
    await userEvent.type(canvas.getByRole('textbox', { name: copy.labels.code }), '12');
    await expect(canvas.getByRole('button', { name: copy.buttons.totp })).toBeDisabled();
    await userEvent.type(canvas.getByRole('textbox', { name: copy.labels.code }), '3456');
    await userEvent.click(canvas.getByRole('button', { name: copy.buttons.totp }));
    await expect(args.onVerifyFactor).toHaveBeenCalledWith({ method: 'totp', code: copy.stories.code });
    await expect(canvas.getByRole('heading', { name: copy.stages.confirm })).toBeVisible();
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};

export const InvitationConfirmation: Story = {
  play: async ({ canvasElement }) => verifyPasskey(within(canvasElement.ownerDocument.body)),
};

export const InvitationCompleted: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await verifyPasskey(canvas);
    await userEvent.click(canvas.getByRole('button', { name: copy.buttons.invite }));
    await expect(args.onConfirm).toHaveBeenCalledWith({ action: args.action, reason: copy.stories.reason, decision: 'approve' });
    await expect(canvas.getByText(copy.stories.completed)).toBeVisible();
    await expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument();
  },
};

export const SuperAdminInvitationRequest: Story = {
  args: { action: { kind: 'invite', email: copy.stories.email, role: 'super_admin' } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await verifyPasskey(canvas);
    await expect(canvas.getByRole('button', { name: copy.buttons.requestApproval })).toBeEnabled();
    await expect(canvas.queryByRole('button', { name: copy.buttons.invite })).not.toBeInTheDocument();
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};

export const SecondApproverReview: Story = { args: { action: approval } };

const accountApproval = {
  ...approval,
  accountChange: { kind: 'role_change', userId: 'target-staff', currentRole: 'support' },
} as const;
export const AccountPromotionApproval: Story = {
  args: { action: accountApproval },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await verifyPasskey(canvas);
    await expect(canvas.queryByRole('button', { name: copy.buttons.approve })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: copy.buttons.approveAccount }));
    await expect(args.onConfirm).toHaveBeenCalledWith({ action: args.action, reason: copy.stories.reason, decision: 'approve' });
  },
};
export const AccountReenableApproval: Story = {
  args: { action: { ...accountApproval, accountChange: { kind: 'enable', userId: 'disabled-admin', currentRole: 'super_admin' } } },
};
export const AccountChangeRejected: Story = {
  args: { action: accountApproval },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('radio', { name: copy.labels.reject }));
    await verifyPasskey(canvas);
    await expect(canvas.getByText(copy.accountRejectHint)).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: copy.buttons.reject }));
    await expect(args.onConfirm).toHaveBeenCalledWith({ action: args.action, reason: copy.stories.reason, decision: 'reject' });
  },
};
export const AccountTargetCannotApprove: Story = {
  args: { action: accountApproval, reviewer: { id: 'target-staff', role: 'super_admin' } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement.ownerDocument.body).getByRole('alert')).toHaveTextContent(copy.selfChangeBlocked);
  },
};
export const AccountApprovalExpired: Story = {
  args: { action: { ...accountApproval, expiresAt: '2020-01-01T00:00:00.000Z' } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement.ownerDocument.body).getByRole('alert')).toHaveTextContent(copy.expired);
  },
};

export const ApprovalConfirmation: Story = {
  args: { action: approval },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await verifyPasskey(canvas);
    await expect(canvas.getByRole('button', { name: copy.buttons.approve })).toBeEnabled();
  },
};

export const RejectionConfirmation: Story = {
  args: { action: approval },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('radio', { name: copy.labels.reject }));
    await verifyPasskey(canvas);
    await expect(canvas.getByText(copy.rejectHint)).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: copy.buttons.reject }));
    await expect(args.onConfirm).toHaveBeenCalledWith({ action: args.action, reason: copy.stories.reason, decision: 'reject' });
    await expect(canvas.getByText(copy.stories.completed)).toBeVisible();
  },
};

export const OwnRequestBlocked: Story = {
  args: { action: approval, reviewer: { id: approval.requestedBy.id, role: 'super_admin' } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('alert')).toHaveTextContent(copy.ownRequest);
    await expect(canvas.getByRole('button', { name: copy.buttons.review })).toBeDisabled();
    await expect(args.onVerifyPassword).not.toHaveBeenCalled();
  },
};

export const ExpiredApproval: Story = {
  args: { action: { ...approval, expiresAt: '2020-01-01T00:00:00.000Z' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('alert')).toHaveTextContent(copy.expired);
    await expect(canvas.getByRole('button', { name: copy.buttons.review })).toBeDisabled();
  },
};

export const PermissionDenied: Story = {
  args: { action: approval, reviewer: { id: 'support-preview', role: 'support' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('alert')).toHaveTextContent(copy.permissionDenied);
    await expect(canvas.getByRole('button', { name: copy.buttons.review })).toBeDisabled();
  },
};

export const NoSecondFactor: Story = {
  args: { methods: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('alert')).toHaveTextContent(copy.noFactors);
    await expect(canvas.getByRole('button', { name: copy.buttons.review })).toBeDisabled();
  },
};

export const PasswordRejected: Story = {
  args: { onVerifyPassword: fn(async () => ({ ok: false, message: copy.stories.passwordFailed })) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await enterReason(canvas);
    await userEvent.type(canvas.getByLabelText(copy.labels.password, { exact: false, selector: 'input' }), copy.stories.password);
    await userEvent.click(canvas.getByRole('button', { name: copy.buttons.password }));
    await expect(canvas.getByRole('alert')).toHaveTextContent(copy.stories.passwordFailed);
    await expect(canvas.getByLabelText(copy.labels.password, { exact: false, selector: 'input' })).toHaveValue('');
    await expect(args.onVerifyFactor).not.toHaveBeenCalled();
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};

export const FactorRejected: Story = {
  args: { onVerifyFactor: fn(async () => ({ ok: false, message: copy.stories.factorFailed })) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await verifyPassword(canvas);
    await userEvent.click(canvas.getByRole('button', { name: copy.buttons.passkey }));
    await expect(canvas.getByRole('alert')).toHaveTextContent(copy.stories.factorFailed);
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};

export const RequestChanged: Story = {
  args: { action: approval, onConfirm: fn(async () => ({ ok: false, message: copy.stories.actionFailed })) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await verifyPasskey(canvas);
    await userEvent.click(canvas.getByRole('button', { name: copy.buttons.approve }));
    await expect(canvas.getByRole('alert')).toHaveTextContent(copy.stories.actionFailed);
    await expect(canvas.getByRole('alertdialog')).toBeVisible();
  },
};

export const RevokeConfirmation: Story = {
  args: { action: { kind: 'revoke', invitationId: 'invite-preview', email: 'alex.rivera@karpukcreative.com', role: 'support' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await verifyPasskey(canvas);
    await expect(canvas.getByText(copy.revokeHint)).toBeVisible();
    await expect(canvas.getByRole('button', { name: copy.buttons.revoke })).toBeEnabled();
  },
};

export const PendingVerification: Story = {
  args: { onVerifyPassword: fn(success) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await enterReason(canvas);
    await userEvent.type(canvas.getByLabelText(copy.labels.password, { exact: false, selector: 'input' }), copy.stories.password);
    let finish!: (result: StaffVerificationResult) => void;
    args.onVerifyPassword.mockImplementationOnce(() => new Promise<StaffVerificationResult>(resolve => { finish = resolve; }));
    const form = canvas.getByRole('alertdialog').querySelector('form')!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    await waitFor(() => expect(args.onVerifyPassword).toHaveBeenCalledTimes(1));
    await expect(canvas.getByLabelText(copy.labels.password, { exact: false, selector: 'input' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await expect(canvas.getByRole('alertdialog')).toHaveAttribute('tabindex', '0');
    await userEvent.keyboard('{Escape}');
    await expect(args.onClose).not.toHaveBeenCalled();
    finish({ ok: true });
    await waitFor(() => expect(canvas.getByRole('heading', { name: copy.stages.factor })).toBeVisible());
  },
};

export const CancelAndReopen: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await enterReason(canvas);
    await userEvent.type(canvas.getByLabelText(copy.labels.password, { exact: false, selector: 'input' }), copy.stories.password);
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await userEvent.click(canvas.getByRole('button', { name: copy.stories.open }));
    await expect(canvas.getByRole('textbox', { name: copy.labels.reason })).toHaveValue('');
    await waitFor(() => expect(canvas.getByRole('heading', { name: copy.stages.review })).toBeVisible());
    await expect(args.onVerifyPassword).not.toHaveBeenCalled();
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};
