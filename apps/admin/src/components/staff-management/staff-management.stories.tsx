import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import type { StaffManagementSnapshot } from '@salesmora/contracts';
import { AdminFrame } from '../admin-frame/admin-frame';
import { StaffManagement } from './staff-management';
import { staffManagementActionsData as copy } from './staff-management-actions.data';

const initial: StaffManagementSnapshot = {
  reviewer: { id: 'preview-reviewer', role: 'super_admin' }, methods: ['totp'],
  staff: [{ id: 'preview-reviewer', name: 'Jordan Lee', email: 'jordan.lee@karpukcreative.com', role: 'super_admin', factors: ['Authenticator'], lastActive: null, disabled: false, version: 0 }],
  invitations: [], approvals: [],
};
const meta = {
  title: 'Admin/Staff/StaffManagement',
  component: StaffManagement,
  args: { initialSnapshot: initial },
  decorators: [Story => <AdminFrame environment="local" contentWidth="wide"><Story /></AdminFrame>],
} satisfies Meta<typeof StaffManagement>;
export default meta;
type Story = StoryObj<typeof meta>;

async function flow(canvasElement: HTMLElement, outcome: 'sent' | 'failed' | 'lost' | 'approval') {
  const canvas = within(canvasElement.ownerDocument.body);
  const original = window.fetch;
  const calls: Record<string, unknown>[] = [];
  let state = initial;
  let input: Record<string, unknown> | undefined;
  window.fetch = async (url, options) => {
    if (url !== '/api/admin/staff') throw new Error('Unexpected Storybook request');
    let response: unknown;
    if (options?.body) {
      const body = JSON.parse(String(options.body)) as Record<string, unknown>;
      calls.push(body);
      if (body.operation === 'start') {
        input = body.input as Record<string, unknown>;
        response = { token: 'mock-verification-token', options: { challenge: 'mock-challenge', allowCredentials: [] } };
      } else if (body.operation === 'factor') response = { verified: true };
      else if (body.operation === 'commit') {
        if (outcome === 'approval') {
          state = { ...initial, approvals: [{ id: 'approval-1', email: 'new.admin@karpukcreative.com', requestedBy: { id: initial.reviewer.id, name: 'Jordan Lee' }, expiresAt: new Date(Date.now() + 300000).toISOString(), status: 'pending', accountChange: null }] };
          response = { invitationId: null, delivery: null, event: 'staff.super_admin.approval_requested' };
        } else {
          state = { ...initial, invitations: [{ id: 'invite-1', email: 'new.support@karpukcreative.com', role: 'support', status: 'pending', expiresAt: '2099-01-01T00:00:00.000Z', delivery: outcome === 'failed' ? 'failed' : 'sent' }] };
          if (outcome === 'lost') throw new Error('Simulated lost commit response');
          response = { invitationId: 'invite-1', delivery: outcome, event: 'staff.invitation.created' };
        }
      } else if (body.operation === 'retry-delivery') {
        state = { ...state, invitations: state.invitations.map(invite => ({ ...invite, delivery: 'sent' })) };
        response = { delivery: 'sent' };
      } else throw new Error('Unexpected mock operation');
    } else response = state;
    return new Response(JSON.stringify(response), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  try {
    await userEvent.click(canvas.getByRole('button', { name: 'Invite staff' }));
    fireEvent.change(canvas.getByLabelText('Staff email'), {
      target: { value: outcome === 'approval' ? 'new.admin@karpukcreative.com' : 'new.support@karpukcreative.com' },
    });
    if (outcome === 'approval') await userEvent.selectOptions(canvas.getByLabelText('Admin role'), 'super_admin');
    await userEvent.click(canvas.getByRole('button', { name: outcome === 'approval' ? 'Request Super Admin approval' : 'Review invitation' }));
    await waitFor(() => expect(canvas.getByRole('alertdialog')).toBeVisible());
    await expect(canvas.queryByText(/Storybook preview only/)).not.toBeInTheDocument();
    fireEvent.change(canvas.getByRole('textbox', { name: 'Audit reason' }), {
      target: { value: 'New platform operations staff member' },
    });
    await userEvent.click(canvas.getByRole('button', { name: 'Continue to verification' }));
    fireEvent.change(canvas.getByLabelText('Your admin password', { exact: false, selector: 'input' }), {
      target: { value: 'storybook-only-password' },
    });
    await userEvent.click(canvas.getByRole('button', { name: 'Verify password' }));
    fireEvent.change(canvas.getByRole('textbox', { name: 'Authenticator code' }), { target: { value: '123456' } });
    await userEvent.click(canvas.getByRole('button', { name: 'Verify authenticator code' }));
    await userEvent.click(canvas.getByRole('button', { name: outcome === 'approval' ? 'Request Super Admin approval' : 'Send invitation' }));
    await waitFor(() => expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument());
    await expect(calls.map(call => call.operation)).toEqual(['start', 'factor', 'commit']);
    await expect(input).toMatchObject({ reason: 'New platform operations staff member', decision: 'approve' });
    await expect(calls[2]).toEqual({ operation: 'commit', token: 'mock-verification-token' });
    if (outcome === 'failed') {
      await expect(canvas.getByRole('alert')).toHaveTextContent(copy.deliveryFailed);
      await userEvent.click(canvas.getByRole('button', { name: 'Retry email' }));
      await expect(canvas.getByText(copy.retrySent)).toBeVisible();
      await waitFor(() => expect(canvas.queryByRole('button', { name: 'Retry email' })).not.toBeInTheDocument());
    } else if (outcome === 'lost') {
      await expect(canvas.getByRole('alert')).toHaveTextContent(copy.deliveryPending);
      await expect(canvas.getByText('new.support@karpukcreative.com')).toBeVisible();
    } else {
      await expect(canvas.getByText(outcome === 'approval' ? copy.approvalRequested : copy.invitationSent)).toBeVisible();
    }
  } finally { window.fetch = original; }
}

export const StaffList: Story = {};
export const InvitationSent: Story = { play: ({ canvasElement }) => flow(canvasElement, 'sent') };
export const DeliveryFailureAndRetry: Story = { play: ({ canvasElement }) => flow(canvasElement, 'failed') };
export const LostCommitResponse: Story = { play: ({ canvasElement }) => flow(canvasElement, 'lost') };
export const SuperAdminApprovalRequested: Story = { play: ({ canvasElement }) => flow(canvasElement, 'approval') };
export const RefreshFailed: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const original = window.fetch;
    window.fetch = async () => new Response('{"error":"Your admin session has expired."}', { status: 401 });
    try {
      await userEvent.click(canvas.getByRole('button', { name: copy.refresh }));
      await expect(canvas.getByRole('alert')).toHaveTextContent('Your admin session has expired.');
    } finally { window.fetch = original; }
  },
};

const target = { id: 'target-staff', name: 'Taylor Kim', email: 'taylor.kim@karpukcreative.com', role: 'support' as const,
  factors: ['Passkey'], lastActive: null, disabled: false, version: 7 };
const accounts = { ...initial, staff: [...initial.staff, target] };
type LifecycleOutcome = 'disable' | 'enable' | 'role_change' | 'promotion' | 'approve' | 'reject' | 'lost';

async function accountFlow(canvasElement: HTMLElement, outcome: LifecycleOutcome) {
  const canvas = within(canvasElement.ownerDocument.body);
  const original = window.fetch;
  const calls: Record<string, unknown>[] = [];
  let state: StaffManagementSnapshot = outcome === 'enable'
    ? { ...accounts, staff: [...initial.staff, { ...target, disabled: true }] }
    : outcome === 'approve' || outcome === 'reject' ? {
      ...accounts, approvals: [{ id: 'c3220a4b-f2e5-4db4-bf19-e30fc4a03e74', email: target.email,
        requestedBy: { id: 'other-reviewer', name: 'Morgan Patel' }, expiresAt: '2099-01-01T00:00:00.000Z', status: 'pending',
        accountChange: { kind: 'role_change', userId: target.id, currentRole: 'support' } }],
    } : accounts;
  window.fetch = async (url, options) => {
    if (url !== '/api/admin/staff') throw new Error('Unexpected Storybook request');
    let response: unknown = state;
    if (options?.body) {
      const body = JSON.parse(String(options.body)) as Record<string, unknown>;
      calls.push(body);
      if (body.operation === 'start') response = { token: 'mock-verification-token', options: { challenge: 'mock-challenge', allowCredentials: [] } };
      else if (body.operation === 'factor') response = { verified: true };
      else if (body.operation === 'commit') {
        const event = outcome === 'promotion' ? 'staff.super_admin.approval_requested'
          : outcome === 'approve' ? 'staff.super_admin.approved' : outcome === 'reject' ? 'staff.super_admin.rejected'
            : outcome === 'role_change' ? 'staff.account.role_changed' : outcome === 'enable' ? 'staff.account.enabled' : 'staff.account.disabled';
        state = { ...state, staff: state.staff.map(member => member.id !== target.id || outcome === 'promotion' || outcome === 'reject' ? member : {
          ...member, disabled: outcome === 'disable' || outcome === 'lost',
          role: outcome === 'role_change' ? 'billing' : outcome === 'approve' ? 'super_admin' : member.role, version: member.version + 1,
        }), approvals: state.approvals.map(request => ({ ...request, status: outcome === 'reject' ? 'rejected' : 'approved' })) };
        response = { event, invitationId: null, delivery: null };
        if (outcome === 'lost') throw new Error('Simulated lost account-change response');
      } else throw new Error('Unexpected lifecycle operation');
    }
    return new Response(JSON.stringify(response), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  try {
    const region = within(canvas.getByRole('region', { name: target.email }));
    if (outcome === 'approve' || outcome === 'reject') {
      await userEvent.click(canvas.getByRole('button', { name: 'Review request' }));
    } else {
      if (outcome === 'role_change' || outcome === 'promotion') {
        await userEvent.selectOptions(region.getByRole('combobox'), outcome === 'promotion' ? 'super_admin' : 'billing');
      }
      await userEvent.click(region.getByRole('button', { name: outcome === 'enable' ? 'Review re-enable'
        : outcome === 'role_change' || outcome === 'promotion' ? 'Review role change' : 'Review disable' }));
    }
    await waitFor(() => expect(canvas.getByRole('alertdialog')).toBeVisible());
    if (outcome === 'reject') await userEvent.click(canvas.getByRole('radio', { name: 'Reject request' }));
    fireEvent.change(canvas.getByRole('textbox', { name: 'Audit reason' }), {
      target: { value: 'Reviewed staff account change' },
    });
    await userEvent.click(canvas.getByRole('button', { name: 'Continue to verification' }));
    fireEvent.change(canvas.getByLabelText('Your admin password', { exact: false, selector: 'input' }), {
      target: { value: 'storybook-only-password' },
    });
    await userEvent.click(canvas.getByRole('button', { name: 'Verify password' }));
    fireEvent.change(canvas.getByRole('textbox', { name: 'Authenticator code' }), { target: { value: '123456' } });
    await userEvent.click(canvas.getByRole('button', { name: 'Verify authenticator code' }));
    await userEvent.click(canvas.getByRole('button', { name: outcome === 'approve' ? 'Approve account change'
      : outcome === 'reject' ? 'Reject approval request' : outcome === 'promotion' ? 'Request Super Admin approval'
        : outcome === 'enable' ? 'Re-enable staff account' : outcome === 'role_change' ? 'Change staff role' : 'Disable staff account' }));
    await waitFor(() => expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument());
    await expect(calls.map(call => call.operation)).toEqual(['start', 'factor', 'commit']);
    await expect(calls[2]).toEqual({ operation: 'commit', token: 'mock-verification-token' });
    const action = outcome === 'approve' || outcome === 'reject' ? { kind: 'approval', requestId: 'c3220a4b-f2e5-4db4-bf19-e30fc4a03e74' }
      : { kind: outcome === 'lost' ? 'disable' : outcome === 'promotion' ? 'role_change' : outcome, userId: target.id, expectedVersion: 7,
        ...(outcome === 'promotion' || outcome === 'role_change' ? { role: outcome === 'promotion' ? 'super_admin' : 'billing' } : {}) };
    await expect(calls[0].input).toEqual({ action, reason: 'Reviewed staff account change', decision: outcome === 'reject' ? 'reject' : 'approve' });
    await expect(canvas.getByText(outcome === 'lost' ? /The outcome could not be confirmed/
      : outcome === 'promotion' ? copy.approvalRequested : outcome === 'approve' ? copy.accountApproved : outcome === 'reject' ? copy.rejected
        : outcome === 'enable' ? copy.enabled : outcome === 'role_change' ? copy.roleChanged : copy.disabled)).toBeVisible();
    const updated = within(canvas.getByRole('region', { name: target.email }));
    await expect(updated.getByText(outcome === 'promotion' || outcome === 'reject' ? 'Support · Active'
      : outcome === 'approve' ? 'Super Admin · Active' : outcome === 'role_change' ? 'Billing · Active'
        : outcome === 'enable' ? 'Support · Active' : 'Support · Disabled')).toBeVisible();
  } finally { window.fetch = original; }
}

export const StaffDisabled: Story = { args: { initialSnapshot: accounts }, play: ({ canvasElement }) => accountFlow(canvasElement, 'disable') };
export const StaffReenabled: Story = {
  args: { initialSnapshot: { ...accounts, staff: [...initial.staff, { ...target, disabled: true }] } },
  play: ({ canvasElement }) => accountFlow(canvasElement, 'enable'),
};
export const StaffRoleChanged: Story = { args: { initialSnapshot: accounts }, play: ({ canvasElement }) => accountFlow(canvasElement, 'role_change') };
export const PromotionRequested: Story = { args: { initialSnapshot: accounts }, play: ({ canvasElement }) => accountFlow(canvasElement, 'promotion') };
export const AccountPromotionApproved: Story = {
  args: { initialSnapshot: { ...accounts, approvals: [{ id: 'c3220a4b-f2e5-4db4-bf19-e30fc4a03e74', email: target.email,
    requestedBy: { id: 'other-reviewer', name: 'Morgan Patel' }, expiresAt: '2099-01-01T00:00:00.000Z', status: 'pending',
    accountChange: { kind: 'role_change', userId: target.id, currentRole: 'support' } }] } },
  play: ({ canvasElement }) => accountFlow(canvasElement, 'approve'),
};
export const AccountPromotionRejected: Story = {
  args: AccountPromotionApproved.args, play: ({ canvasElement }) => accountFlow(canvasElement, 'reject'),
};
export const LostAccountChangeResponse: Story = { args: { initialSnapshot: accounts }, play: ({ canvasElement }) => accountFlow(canvasElement, 'lost') };
