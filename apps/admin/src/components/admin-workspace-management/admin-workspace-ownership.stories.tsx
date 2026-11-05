import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { AdminFrame } from '../admin-frame/admin-frame';
import { adminWorkspaceDetailPreviews } from './admin-workspace-detail-preview.data';
import { AdminWorkspaceOwnership } from './admin-workspace-ownership';
import { adminWorkspaceOwnershipCopy as copy } from './admin-workspace-ownership-copy.data';

const previousOwnerUserId = 'usr_2b7e1';
const newOwnerUserId = 'usr_6f2a9';
const token = 'w'.repeat(43);

function mock() {
  const original = window.fetch;
  const pending = new Set<string>();
  window.fetch = async (_input, init) => {
    if (init?.method !== 'POST') return Response.json({ methods: ['totp'] });
    const operation = JSON.parse(String(init.body)) as { operation: string; token?: string };
    if (operation.operation === 'start') {
      pending.add(token);
      return Response.json({
        token,
        options: {
          challenge: 'storybook-workspace-ownership',
          userVerification: 'required',
          allowCredentials: [],
        },
      });
    }
    if (operation.operation === 'factor') return Response.json({ verified: true });
    if (operation.operation === 'commit' && operation.token && pending.has(operation.token)) {
      pending.delete(operation.token);
      return Response.json({
        changed: true,
        previousOwnerUserId,
        newOwnerUserId,
      });
    }
    return Response.json({ error: 'Ownership-transfer verification expired.' }, { status: 409 });
  };
  return () => { window.fetch = original; };
}

const meta = {
  title: 'Admin/Customers/AdminWorkspaceOwnership',
  component: AdminWorkspaceOwnership,
  decorators: [Story => <AdminFrame environment="local" contentWidth="wide"><Story /></AdminFrame>],
  args: {
    detail: {
      ...adminWorkspaceDetailPreviews.active,
      permissions: { canSuspend: true, canTransferOwnership: true, canOverridePlan: true, canAdjustAIBudget: true, canRemoveMembers: true, canResendInvitations: true, canReadBillingLinks: true, canChangePlan: true, canManageRecovery: true },
    },
    onComplete: fn(),
  },
} satisfies Meta<typeof AdminWorkspaceOwnership>;
export default meta;
type Story = StoryObj<typeof meta>;

export const TransferOwnership: Story = {
  beforeEach: mock,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: copy.transfer }));
    await waitFor(() => expect(page.getByRole('alertdialog')).toBeVisible());
    const dialog = within(page.getByRole('alertdialog'));
    await userEvent.selectOptions(dialog.getByRole('combobox', { name: copy.memberLabel }), newOwnerUserId);
    fireEvent.change(dialog.getByRole('textbox', { name: copy.reason }), {
      target: { value: 'Workspace owner requested transfer' },
    });
    await waitFor(() => expect(dialog.getByRole('button', { name: copy.continue })).toBeEnabled());
    await userEvent.click(dialog.getByRole('button', { name: copy.continue }));
    await waitFor(() => expect(dialog.getByRole('heading', { name: copy.verification })).toBeVisible());
    fireEvent.change(dialog.getByRole('textbox', { name: copy.code }), { target: { value: '123456' } });
    await userEvent.click(dialog.getByRole('button', { name: copy.confirm }));
    await waitFor(() => expect(canvas.getByText(copy.completed)).toBeVisible());
    await expect(args.onComplete).toHaveBeenCalledOnce();
  },
};

export const NoEligibleMember: Story = {
  args: {
    detail: {
      ...adminWorkspaceDetailPreviews.active,
      permissions: { canSuspend: true, canTransferOwnership: true, canOverridePlan: true, canAdjustAIBudget: true, canRemoveMembers: true, canResendInvitations: true, canReadBillingLinks: true, canChangePlan: true, canManageRecovery: true },
      members: adminWorkspaceDetailPreviews.active.members.map(member =>
        member.id === newOwnerUserId ? { ...member, status: 'Unverified' } : member),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(copy.noEligibleMembers)).toBeVisible();
    await expect(canvas.getByRole('button', { name: copy.transfer })).toBeDisabled();
  },
};

export const SupportRoleCannotTransfer: Story = {
  args: {
    detail: {
      ...adminWorkspaceDetailPreviews.active,
      permissions: { canSuspend: true, canTransferOwnership: false, canOverridePlan: false, canAdjustAIBudget: false, canRemoveMembers: true, canResendInvitations: true, canReadBillingLinks: false, canChangePlan: false, canManageRecovery: false },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(copy.denied)).toBeVisible();
    await expect(canvas.queryByRole('button', { name: copy.transfer })).not.toBeInTheDocument();
  },
};

export const DeletionPendingCannotTransfer: Story = {
  args: {
    detail: {
      ...adminWorkspaceDetailPreviews.active,
      workspace: { ...adminWorkspaceDetailPreviews.active.workspace, status: 'deleting' },
      permissions: { canSuspend: true, canTransferOwnership: true, canOverridePlan: true, canAdjustAIBudget: true, canRemoveMembers: true, canResendInvitations: true, canReadBillingLinks: true, canChangePlan: true, canManageRecovery: true },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(copy.deletionPending)).toBeVisible();
    await expect(canvas.queryByRole('button', { name: copy.transfer })).not.toBeInTheDocument();
  },
};
