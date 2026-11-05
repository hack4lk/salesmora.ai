import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { AdminFrame } from '../admin-frame/admin-frame';
import { adminWorkspaceDetailPreviews } from './admin-workspace-detail-preview.data';
import { AdminWorkspaceAIBudget } from './admin-workspace-ai-budget';
import { adminWorkspaceAIBudgetCopy as copy } from './admin-workspace-ai-budget-copy.data';

const token = 'w'.repeat(43);
const workspaceId = 'f963b1f8-d0f4-4d12-9bc5-f2754b072d9c';
let startBody: Record<string, unknown> | null = null;

function mock() {
  const original = window.fetch;
  startBody = null;
  window.fetch = async (_input, init) => {
    if (init?.method !== 'POST') return Response.json({ methods: ['totp'] });
    const body = JSON.parse(String(init.body)) as Record<string, unknown> & { operation: string };
    if (body.operation === 'start') {
      startBody = body;
      return Response.json({
        token,
        options: {
          challenge: 'storybook-workspace-ai-budget',
          userVerification: 'required',
          allowCredentials: [],
        },
      });
    }
    if (body.operation === 'factor') return Response.json({ verified: true });
    if (body.operation === 'commit') {
      return Response.json({
        changed: true,
        monthlyTokens: startBody?.monthlyTokens,
        previousMonthlyTokens: adminWorkspaceDetailPreviews.active.limits.aiTokens,
      });
    }
    return Response.json({ error: 'AI-budget verification expired.' }, { status: 409 });
  };
  return () => { window.fetch = original; };
}

const detail = {
  ...adminWorkspaceDetailPreviews.active,
  workspace: { ...adminWorkspaceDetailPreviews.active.workspace, id: workspaceId },
  permissions: {
    canSuspend: true,
    canTransferOwnership: true,
    canOverridePlan: true,
    canAdjustAIBudget: true,
    canRemoveMembers: true,
    canResendInvitations: true,
    canReadBillingLinks: true,
    canChangePlan: true,
    canManageRecovery: true,
  },
};

const meta = {
  title: 'Admin/Customers/AdminWorkspaceAIBudget',
  component: AdminWorkspaceAIBudget,
  decorators: [Story => <AdminFrame environment="local" contentWidth="wide"><Story /></AdminFrame>],
  args: { detail, onComplete: fn() },
} satisfies Meta<typeof AdminWorkspaceAIBudget>;
export default meta;
type Story = StoryObj<typeof meta>;

export const AdjustBudgetWithMFA: Story = {
  beforeEach: mock,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: copy.adjust }));
    const dialog = within(page.getByRole('alertdialog'));
    fireEvent.change(dialog.getByRole('textbox', { name: copy.budget }), { target: { value: '1000000' } });
    await waitFor(() => expect(dialog.getByRole('alert')).toHaveTextContent(
      copy.belowUsageWarning('1,800,000'),
    ));
    fireEvent.change(dialog.getByRole('textbox', { name: copy.reason }), {
      target: { value: 'Pilot usage limit approved, ticket 4830' },
    });
    await userEvent.click(dialog.getByRole('button', { name: copy.continue }));
    await waitFor(() => expect(dialog.getByRole('heading', { name: copy.verification })).toBeVisible());
    fireEvent.change(dialog.getByRole('textbox', { name: copy.code }), { target: { value: '123456' } });
    await userEvent.click(dialog.getByRole('button', { name: copy.confirm }));
    await waitFor(() => expect(canvas.getByText(copy.adjusted('1,000,000'))).toBeVisible());
    await expect(args.onComplete).toHaveBeenCalledOnce();
    expect(startBody).toMatchObject({
      operation: 'start',
      workspaceId,
      monthlyTokens: 1_000_000,
      reason: 'Pilot usage limit approved, ticket 4830',
    });
  },
};

export const ZeroBudgetWarns: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: copy.adjust }));
    const dialog = within(page.getByRole('alertdialog'));
    fireEvent.change(dialog.getByRole('textbox', { name: copy.budget }), { target: { value: '0' } });
    fireEvent.change(dialog.getByRole('textbox', { name: copy.reason }), {
      target: { value: 'Temporarily stop AI usage, ticket 4831' },
    });
    await waitFor(() => expect(dialog.getByText(copy.zeroWarning)).toBeVisible());
    await expect(dialog.getByRole('button', { name: copy.continue })).toBeEnabled();
    await userEvent.click(dialog.getByRole('button', { name: 'Cancel' }));
  },
};

export const SupportRoleCannotManage: Story = {
  args: {
    detail: {
      ...adminWorkspaceDetailPreviews.active,
      permissions: {
        canSuspend: true,
        canTransferOwnership: false,
        canOverridePlan: false,
        canAdjustAIBudget: false,
        canRemoveMembers: true,
        canResendInvitations: true,
        canReadBillingLinks: false,
        canChangePlan: false,
        canManageRecovery: false,
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(copy.denied)).toBeVisible();
    await expect(canvas.queryByRole('button', { name: copy.adjust })).not.toBeInTheDocument();
  },
};

export const DeletionPendingCannotManage: Story = {
  args: { detail: { ...detail, workspace: { ...detail.workspace, status: 'deleting' } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(copy.deletionPending)).toBeVisible();
    await expect(canvas.queryByRole('button', { name: copy.adjust })).not.toBeInTheDocument();
  },
};
