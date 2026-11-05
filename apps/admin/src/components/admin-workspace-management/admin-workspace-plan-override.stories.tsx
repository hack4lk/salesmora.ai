import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { AdminFrame } from '../admin-frame/admin-frame';
import { adminWorkspaceDetailPreviews } from './admin-workspace-detail-preview.data';
import { AdminWorkspacePlanOverride } from './admin-workspace-plan-override';
import { adminWorkspacePlanOverrideCopy as copy } from './admin-workspace-plan-override-copy.data';

const overrideId = 'c8a9b5b4-5293-4dcc-a61d-3298cc07ee3f';
const token = 'p'.repeat(43);
let startBody: Record<string, unknown> | null = null;

function mock() {
  const original = window.fetch;
  const pending = new Set<string>();
  startBody = null;
  window.fetch = async (_input, init) => {
    if (init?.method !== 'POST') return Response.json({ methods: ['totp'] });
    const operation = JSON.parse(String(init.body)) as { operation: string; token?: string; action?: 'apply' | 'clear' };
    if (operation.operation === 'start') {
      startBody = operation;
      pending.add(token);
      return Response.json({
        token,
        options: {
          challenge: 'storybook-workspace-plan-override',
          userVerification: 'required',
          allowCredentials: [],
        },
      });
    }
    if (operation.operation === 'factor') return Response.json({ verified: true });
    if (operation.operation === 'commit' && operation.token && pending.has(operation.token)) {
      pending.delete(operation.token);
      const action = (startBody?.action as 'apply' | 'clear' | undefined) ?? 'apply';
      return Response.json({ action, changed: true, overrideId });
    }
    return Response.json({ error: 'Plan-override verification expired.' }, { status: 409 });
  };
  return () => { window.fetch = original; };
}

const meta = {
  title: 'Admin/Customers/AdminWorkspacePlanOverride',
  component: AdminWorkspacePlanOverride,
  decorators: [Story => <AdminFrame environment="local" contentWidth="wide"><Story /></AdminFrame>],
  args: {
    detail: {
      ...adminWorkspaceDetailPreviews.active,
      permissions: { canSuspend: true, canTransferOwnership: true, canOverridePlan: true, canAdjustAIBudget: true, canRemoveMembers: true, canResendInvitations: true, canReadBillingLinks: true, canChangePlan: true, canManageRecovery: true },
    },
    onComplete: fn(),
  },
} satisfies Meta<typeof AdminWorkspacePlanOverride>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ApplyPlanOverride: Story = {
  beforeEach: mock,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: copy.apply }));
    await waitFor(() => expect(page.getByRole('alertdialog')).toBeVisible());
    const dialog = within(page.getByRole('alertdialog'));
    await expect(dialog.getByText(/Stripe continues billing the Standard plan/)).toBeVisible();
    await expect(dialog.getByRole('combobox', { name: copy.plan })).toHaveValue('premium');
    fireEvent.change(dialog.getByRole('textbox', { name: copy.reason }), {
      target: { value: 'Pilot agreement approved, ticket 4821' },
    });
    await userEvent.click(dialog.getByRole('button', { name: copy.continue }));
    await waitFor(() => expect(dialog.getByRole('heading', { name: copy.verification })).toBeVisible());
    fireEvent.change(dialog.getByRole('textbox', { name: copy.code }), { target: { value: '123456' } });
    await userEvent.click(dialog.getByRole('button', { name: copy.confirmApply }));
    await waitFor(() => expect(canvas.getByText(copy.applied)).toBeVisible());
    await expect(args.onComplete).toHaveBeenCalledOnce();
    expect(startBody).toMatchObject({
      operation: 'start',
      action: 'apply',
      workspaceId: adminWorkspaceDetailPreviews.active.workspace.id,
      plan: 'premium',
      reason: 'Pilot agreement approved, ticket 4821',
    });
  },
};

export const EndPlanOverride: Story = {
  args: {
    detail: {
      ...adminWorkspaceDetailPreviews.override,
      permissions: { canSuspend: true, canTransferOwnership: true, canOverridePlan: true, canAdjustAIBudget: true, canRemoveMembers: true, canResendInvitations: true, canReadBillingLinks: true, canChangePlan: true, canManageRecovery: true },
    },
  },
  beforeEach: mock,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: copy.end }));
    const dialog = within(page.getByRole('alertdialog'));
    fireEvent.change(dialog.getByRole('textbox', { name: copy.reason }), {
      target: { value: 'Pilot ended early, ticket 4821' },
    });
    await waitFor(() => expect(dialog.getByRole('button', { name: copy.continue })).toBeEnabled());
    await userEvent.click(dialog.getByRole('button', { name: copy.continue }));
    await waitFor(() => expect(dialog.getByRole('textbox', { name: copy.code })).toBeInTheDocument());
    fireEvent.change(dialog.getByRole('textbox', { name: copy.code }), { target: { value: '123456' } });
    await userEvent.click(dialog.getByRole('button', { name: copy.confirmClear }));
    await waitFor(() => expect(canvas.getByText(copy.cleared)).toBeInTheDocument());
    await expect(args.onComplete).toHaveBeenCalledOnce();
    expect(startBody).toMatchObject({
      operation: 'start',
      action: 'clear',
      workspaceId: adminWorkspaceDetailPreviews.override.workspace.id,
      reason: 'Pilot ended early, ticket 4821',
    });
  },
};

export const BillingRoleCanManage: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: copy.apply })).toBeVisible();
  },
};

export const SupportRoleCannotManage: Story = {
  args: {
    detail: {
      ...adminWorkspaceDetailPreviews.active,
      permissions: { canSuspend: true, canTransferOwnership: false, canOverridePlan: false, canAdjustAIBudget: false, canRemoveMembers: true, canResendInvitations: true, canReadBillingLinks: false, canChangePlan: false, canManageRecovery: false },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(copy.denied)).toBeVisible();
    await expect(canvas.queryByRole('button', { name: copy.apply })).not.toBeInTheDocument();
  },
};

export const DeletionPendingCannotManage: Story = {
  args: {
    detail: {
      ...adminWorkspaceDetailPreviews.deleting,
      permissions: { canSuspend: true, canTransferOwnership: true, canOverridePlan: true, canAdjustAIBudget: true, canRemoveMembers: true, canResendInvitations: true, canReadBillingLinks: true, canChangePlan: true, canManageRecovery: true },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(copy.deletionPending)).toBeVisible();
    await expect(canvas.queryByRole('button', { name: copy.apply })).not.toBeInTheDocument();
  },
};
