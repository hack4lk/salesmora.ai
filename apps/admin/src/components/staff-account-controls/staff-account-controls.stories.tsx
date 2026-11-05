import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { AdminFrame } from '../admin-frame/admin-frame';
import { StaffAccountControls, type StaffAccountControlsProps } from './staff-account-controls';
import { staffAccountControlsData as copy } from './staff-account-controls.data';
import { staffActionReviewData as review } from '../staff-action-review/staff-action-review.data';

const meta = {
  title: 'Admin/Staff/StaffAccountControls',
  component: StaffAccountControls,
  decorators: [Story => <AdminFrame environment="local" contentWidth="wide"><Story /></AdminFrame>],
  args: { onVerifyPassword: fn<NonNullable<StaffAccountControlsProps['onVerifyPassword']>>(async () => ({ ok: true })), onVerifyFactor: fn<NonNullable<StaffAccountControlsProps['onVerifyFactor']>>(async () => ({ ok: true })) },
} satisfies Meta<typeof StaffAccountControls>;
export default meta;
type Story = StoryObj<typeof meta>;
type Canvas = ReturnType<typeof within>;

async function open(canvas: Canvas, email: string, button: string) {
  await userEvent.click(within(canvas.getByRole('region', { name: email })).getByRole('button', { name: button }));
  await waitFor(() => expect(canvas.getByRole('alertdialog')).toBeVisible());
}
async function confirm(canvas: Canvas) {
  await userEvent.type(canvas.getByRole('textbox', { name: review.labels.reason }), review.stories.reason);
  await userEvent.click(canvas.getByRole('button', { name: review.buttons.review }));
  await userEvent.type(canvas.getByLabelText(review.labels.password, { selector: 'input', exact: false }), review.stories.password);
  await userEvent.click(canvas.getByRole('button', { name: review.buttons.password }));
  await userEvent.click(canvas.getByRole('button', { name: review.buttons.passkey }));
  await waitFor(() => expect(canvas.getByRole('heading', { name: review.stages.confirm })).toBeVisible());
}

export const AccountList: Story = {};
export const DisableReview: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement.ownerDocument.body);
  await open(canvas, 'taylor.kim@karpukcreative.com', copy.disable);
  await expect(canvas.getByText(review.accountHints.disable)).toBeVisible();
} };
export const DisabledAccount: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement.ownerDocument.body);
  await open(canvas, 'taylor.kim@karpukcreative.com', copy.disable);
  await confirm(canvas);
  await userEvent.click(canvas.getByRole('button', { name: review.buttons.disable }));
  await expect(within(canvas.getByRole('region', { name: 'taylor.kim@karpukcreative.com' })).getByRole('button', { name: copy.enable })).toBeVisible();
  await expect(args.onVerifyPassword).toHaveBeenCalledWith(review.stories.password, {
    action: { kind: 'disable', userId: 'taylor', expectedVersion: 0 }, reason: review.stories.reason, decision: 'approve',
  });
} };
export const ReenableReview: Story = { play: async ({ canvasElement }) => {
  await open(within(canvasElement.ownerDocument.body), 'alex.rivera@karpukcreative.com', copy.enable);
} };
export const ReenabledAccount: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement.ownerDocument.body);
  await open(canvas, 'alex.rivera@karpukcreative.com', copy.enable);
  await confirm(canvas);
  await userEvent.click(canvas.getByRole('button', { name: review.buttons.enable }));
  await expect(within(canvas.getByRole('region', { name: 'alex.rivera@karpukcreative.com' })).getByRole('button', { name: copy.disable })).toBeVisible();
} };
export const RoleChanged: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement.ownerDocument.body);
  const region = within(canvas.getByRole('region', { name: 'taylor.kim@karpukcreative.com' }));
  await userEvent.selectOptions(region.getByRole('combobox', { name: copy.role }), 'billing');
  await open(canvas, 'taylor.kim@karpukcreative.com', copy.change);
  await confirm(canvas);
  await userEvent.click(canvas.getByRole('button', { name: review.buttons.role_change }));
  await expect(region.getByText('Billing · Active')).toBeVisible();
  await expect(region.getByRole('button', { name: copy.change })).toBeDisabled();
} };
export const PromotionAwaitingApproval: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement.ownerDocument.body);
  const region = within(canvas.getByRole('region', { name: 'taylor.kim@karpukcreative.com' }));
  await userEvent.selectOptions(region.getByRole('combobox', { name: copy.role }), 'super_admin');
  await open(canvas, 'taylor.kim@karpukcreative.com', copy.change);
  await confirm(canvas);
  await userEvent.click(canvas.getByRole('button', { name: review.buttons.requestApproval }));
  await expect(region.getByText('Support · Active')).toBeVisible();
  await expect(canvas.getAllByText(copy.pending)).toHaveLength(2);
} };
export const SuperAdminReenableAwaitingApproval: Story = {
  args: { accounts: [{ ...copy.accounts[1], active: false }, copy.accounts[0]] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await open(canvas, copy.accounts[1].email, copy.enable);
    await confirm(canvas);
    await userEvent.click(canvas.getByRole('button', { name: review.buttons.requestApproval }));
    await expect(within(canvas.getByRole('region', { name: copy.accounts[1].email })).getByText('Super Admin · Disabled')).toBeVisible();
  },
};
export const SelfDisableBlocked: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement.ownerDocument.body);
  await open(canvas, copy.accounts[0].email, copy.disable);
  await expect(canvas.getByRole('alert')).toHaveTextContent(review.selfChangeBlocked);
  await expect(canvas.getByRole('button', { name: review.buttons.review })).toBeDisabled();
  await expect(args.onVerifyPassword).not.toHaveBeenCalled();
} };
export const SelfRoleChangeBlocked: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement.ownerDocument.body);
  await userEvent.selectOptions(within(canvas.getByRole('region', { name: copy.accounts[0].email })).getByRole('combobox'), 'support');
  await open(canvas, copy.accounts[0].email, copy.change);
  await expect(canvas.getByRole('alert')).toHaveTextContent(review.selfChangeBlocked);
} };
export const LastSuperAdminDisableBlocked: Story = {
  args: { accounts: [copy.accounts[1]], reviewer: { id: 'external-reviewer', role: 'super_admin' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await open(canvas, copy.accounts[1].email, copy.disable);
    await expect(canvas.getByRole('alert')).toHaveTextContent(review.lastAdminBlocked);
  },
};
export const LastSuperAdminDemotionBlocked: Story = {
  args: LastSuperAdminDisableBlocked.args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.selectOptions(canvas.getByRole('combobox'), 'support');
    await open(canvas, copy.accounts[1].email, copy.change);
    await expect(canvas.getByRole('alert')).toHaveTextContent(review.lastAdminBlocked);
  },
};
export const PermissionDenied: Story = {
  args: { reviewer: { id: 'support-reviewer', role: 'support' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await open(canvas, 'taylor.kim@karpukcreative.com', copy.disable);
    await expect(canvas.getByRole('alert')).toHaveTextContent(review.permissionDenied);
  },
};
export const Empty: Story = { args: { accounts: [] } };
export const CancelDisable: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement.ownerDocument.body);
  await open(canvas, 'taylor.kim@karpukcreative.com', copy.disable);
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument());
  await expect(within(canvas.getByRole('region', { name: 'taylor.kim@karpukcreative.com' })).getByText('Support · Active')).toBeVisible();
  await expect(args.onVerifyPassword).not.toHaveBeenCalled();
} };
export const PasswordVerificationFailed: Story = {
  args: { onVerifyPassword: fn<NonNullable<StaffAccountControlsProps['onVerifyPassword']>>(async () => ({ ok: false, message: 'Password verification failed.' })) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await open(canvas, 'taylor.kim@karpukcreative.com', copy.disable);
    await userEvent.type(canvas.getByRole('textbox', { name: review.labels.reason }), review.stories.reason);
    await userEvent.click(canvas.getByRole('button', { name: review.buttons.review }));
    await userEvent.type(canvas.getByLabelText(review.labels.password, { selector: 'input', exact: false }), review.stories.password);
    await userEvent.click(canvas.getByRole('button', { name: review.buttons.password }));
    await expect(canvas.getByRole('alert')).toHaveTextContent('Password verification failed.');
    await waitFor(() => expect(canvas.queryByRole('button', { name: review.buttons.pending })).not.toBeInTheDocument());
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument());
    await expect(within(canvas.getByRole('region', { name: 'taylor.kim@karpukcreative.com' })).getByText('Support · Active')).toBeVisible();
  },
};
export const DisabledSuperAdminDoesNotCount: Story = {
  args: { accounts: [{ ...copy.accounts[0], active: false }, copy.accounts[1]], reviewer: { id: 'external-reviewer', role: 'super_admin' } },
  play: LastSuperAdminDisableBlocked.play,
};
