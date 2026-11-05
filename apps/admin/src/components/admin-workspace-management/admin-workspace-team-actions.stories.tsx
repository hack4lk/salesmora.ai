import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import type { AdminWorkspaceDetailResponse } from '@salesmora/contracts';
import { AdminFrame } from '../admin-frame/admin-frame';
import { adminWorkspaceDetailPreviews } from './admin-workspace-detail-preview.data';
import { AdminWorkspaceTeamActions } from './admin-workspace-team-actions';
import { adminWorkspaceTeamActionsCopy as copy } from './admin-workspace-team-actions-copy.data';

const workspaceId = 'c65817f9-d60b-4cad-8096-1cfc2b40ece2';
const invitationId = '99ac8a28-c47f-4129-aaae-cac05a33c904';
const livePermissions = {
  canSuspend: true,
  canTransferOwnership: true,
  canOverridePlan: true,
  canAdjustAIBudget: true,
  canRemoveMembers: true,
  canResendInvitations: true,
  canReadBillingLinks: true,
  canChangePlan: true,
  canManageRecovery: true,
};
const detail: AdminWorkspaceDetailResponse = {
  ...adminWorkspaceDetailPreviews.active,
  workspace: { ...adminWorkspaceDetailPreviews.active.workspace, id: workspaceId },
  members: adminWorkspaceDetailPreviews.active.members.map(member => member.status === 'Invited'
    ? { ...member, id: `invitation:${invitationId}`, invitationId }
    : { ...member, userId: member.id }),
  permissions: livePermissions,
};

const originalFetch = window.fetch;
const requestBodies: unknown[] = [];
let deliverySequence: ('sent' | 'failed')[] = [];

function mockFetch() {
  requestBodies.length = 0;
  deliverySequence = ['sent'];
  window.fetch = async (_input, init) => {
    const body: unknown = JSON.parse(String(init?.body));
    requestBodies.push(body);
    if (body && typeof body === 'object' && 'action' in body && body.action === 'remove') {
      return Response.json({ action: 'remove', changed: true, unassignedLeads: 2 });
    }
    return Response.json({
      action: 'resend_invitation',
      changed: true,
      delivery: deliverySequence.shift() ?? 'sent',
      expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    });
  };
  return () => { window.fetch = originalFetch; };
}

const meta = {
  title: 'Admin/Customers/AdminWorkspaceTeamActions',
  component: AdminWorkspaceTeamActions,
  decorators: [Story => <AdminFrame environment="local" contentWidth="wide"><Story /></AdminFrame>],
  args: {
    detail,
    onBack: fn(),
    onComplete: fn(),
  },
} satisfies Meta<typeof AdminWorkspaceTeamActions>;
export default meta;
type Story = StoryObj<typeof meta>;

export const RemoveMember: Story = {
  beforeEach: mockFetch,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const members = within(canvas.getByRole('region', { name: 'Members' }));
    const member = within(members.getByText('Lena Brooks').closest('li') as HTMLElement);
    await userEvent.click(member.getByRole('button', { name: copy.remove }));
    await waitFor(() => expect(page.getByRole('alertdialog')).toBeInTheDocument());
    const dialog = within(page.getByRole('alertdialog'));
    await expect(dialog.getByText(/immediately loses access/)).toBeInTheDocument();
    fireEvent.change(dialog.getByRole('textbox', { name: copy.reason }), {
      target: { value: 'Left the company, ticket 4845' },
    });
    await userEvent.click(dialog.getByRole('button', { name: copy.removeConfirm }));
    await waitFor(() => expect(canvas.getByText(copy.removed('Lena Brooks', 2))).toBeVisible());
    await expect(args.onComplete).toHaveBeenCalledOnce();
    expect(requestBodies[0]).toMatchObject({
      action: 'remove',
      workspaceId,
      userId: 'usr_6f2a9',
      reason: 'Left the company, ticket 4845',
    });
  },
};

export const ResendInvitation: Story = {
  beforeEach: mockFetch,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: copy.resend }));
    await waitFor(() => expect(page.getByRole('alertdialog')).toBeInTheDocument());
    const dialog = within(page.getByRole('alertdialog'));
    await expect(dialog.getByText(/earlier invitation link will stop working/i)).toBeInTheDocument();
    fireEvent.change(dialog.getByRole('textbox', { name: copy.reason }), {
      target: { value: 'Customer asked for a fresh invitation' },
    });
    await userEvent.click(dialog.getByRole('button', { name: copy.resendConfirm }));
    await waitFor(() => expect(canvas.getByText(copy.sent('ch••••@northsideplumbing.example'))).toBeVisible());
    await expect(args.onComplete).toHaveBeenCalledOnce();
    expect(requestBodies[0]).toMatchObject({
      action: 'resend_invitation',
      workspaceId,
      invitationId,
      reason: 'Customer asked for a fresh invitation',
    });
  },
};

export const FailedDeliveryCanBeRetried: Story = {
  beforeEach: () => {
    const restore = mockFetch();
    deliverySequence = ['failed', 'sent'];
    return restore;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    async function resend(reason: string) {
      await userEvent.click(canvas.getByRole('button', { name: copy.resend }));
      await waitFor(() => expect(page.getByRole('alertdialog')).toBeInTheDocument());
      const dialog = within(page.getByRole('alertdialog'));
      fireEvent.change(dialog.getByRole('textbox', { name: copy.reason }), { target: { value: reason } });
      await userEvent.click(dialog.getByRole('button', { name: copy.resendConfirm }));
    }
    await resend('First delivery attempt, ticket 4846');
    await waitFor(() => expect(canvas.getByText(copy.failed)).toBeVisible());
    await resend('Retry delivery, ticket 4846');
    await waitFor(() => expect(canvas.getByText(copy.sent('ch••••@northsideplumbing.example'))).toBeVisible());
    expect(requestBodies).toHaveLength(2);
    expect(requestBodies[0]).toMatchObject({ action: 'resend_invitation', invitationId });
    expect(requestBodies[1]).toMatchObject({ action: 'resend_invitation', invitationId });
  },
};

export const OwnerCannotBeRemoved: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const members = within(canvas.getByRole('region', { name: 'Members' }));
    const owner = within(members.getByText('Maria Owens').closest('li') as HTMLElement);
    await expect(owner.queryByRole('button', { name: copy.remove })).not.toBeInTheDocument();
  },
};

export const BillingRoleCannotManage: Story = {
  args: {
    detail: {
      ...detail,
      permissions: { ...livePermissions, canRemoveMembers: false, canResendInvitations: false },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(copy.denied)).toBeVisible();
    await expect(canvas.queryByRole('button', { name: copy.remove })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: copy.resend })).not.toBeInTheDocument();
  },
};

export const DeletionPendingCannotManage: Story = {
  args: {
    detail: { ...detail, workspace: { ...detail.workspace, status: 'deleting' } },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(copy.deletionPending)).toBeVisible();
    await expect(canvas.queryByRole('button', { name: copy.remove })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: copy.resend })).not.toBeInTheDocument();
  },
};
