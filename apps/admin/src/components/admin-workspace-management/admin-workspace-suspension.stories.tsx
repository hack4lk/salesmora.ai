import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { AdminFrame } from '../admin-frame/admin-frame';
import { AdminWorkspaceSuspension } from './admin-workspace-suspension';
import { adminWorkspaceSuspensionCopy as copy } from './admin-workspace-suspension-copy.data';

const workspaceId = 'c0d2f3a5-184b-4d9a-bd76-5c0e67b0a171';
const token = 'w'.repeat(43);
const suspendedAt = '2026-01-15T12:00:00.000Z';

function mock() {
  const original = window.fetch;
  const pendingActions = new Map<string, 'suspend' | 'unsuspend'>();
  window.fetch = async (_input, init) => {
    if (init?.method !== 'POST') return Response.json({ methods: ['totp'] });
    const operation = JSON.parse(String(init.body)) as {
      operation: string;
      action?: 'suspend' | 'unsuspend';
      token?: string;
    };
    if (operation.operation === 'start' && operation.action) {
      pendingActions.set(token, operation.action);
      return Response.json({
        token,
        options: {
          challenge: 'storybook-workspace-suspension',
          userVerification: 'required',
          allowCredentials: [],
        },
      });
    }
    if (operation.operation === 'factor') return Response.json({ verified: true });
    if (operation.operation === 'commit' && operation.token) {
      const action = pendingActions.get(operation.token);
      if (!action) return Response.json({ error: 'Verification expired.' }, { status: 409 });
      pendingActions.delete(operation.token);
      return Response.json({
        action,
        changed: true,
        suspendedAt: action === 'suspend' ? suspendedAt : null,
      });
    }
    return Response.json({ error: 'Unexpected workspace-suspension operation.' }, { status: 400 });
  };
  return () => { window.fetch = original; };
}

const meta = {
  title: 'Admin/Customers/AdminWorkspaceSuspension',
  component: AdminWorkspaceSuspension,
  decorators: [Story => <AdminFrame environment="local" contentWidth="wide"><Story /></AdminFrame>],
  args: {
    workspaceId,
    name: 'Northside Plumbing',
    status: 'active',
    deletionPending: false,
    canManage: true,
    onComplete: fn(),
  },
} satisfies Meta<typeof AdminWorkspaceSuspension>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SuspendWorkspace: Story = {
  beforeEach: mock,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: copy.suspend }));
    await waitFor(() => expect(page.getByRole('alertdialog')).toBeVisible());
    const dialog = within(page.getByRole('alertdialog'));
    fireEvent.change(dialog.getByRole('textbox', { name: copy.reason }), {
      target: { value: 'Chargeback review, ticket 4790' },
    });
    await waitFor(() => expect(dialog.getByRole('button', { name: copy.continue })).toBeEnabled());
    await userEvent.click(dialog.getByRole('button', { name: copy.continue }));
    await waitFor(() => expect(dialog.getByRole('heading', { name: copy.verification })).toBeVisible());
    fireEvent.change(dialog.getByRole('textbox', { name: copy.code }), { target: { value: '123456' } });
    await userEvent.click(dialog.getByRole('button', { name: copy.verifySuspend }));
    await waitFor(() => expect(canvas.getByText(copy.completed.suspended)).toBeVisible());
    await expect(args.onComplete).toHaveBeenCalledOnce();
  },
};

export const UnsuspendWorkspace: Story = {
  args: { status: 'suspended' },
  beforeEach: mock,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: copy.unsuspend }));
    await waitFor(() => expect(page.getByRole('alertdialog')).toBeVisible());
    const dialog = within(page.getByRole('alertdialog'));
    fireEvent.change(dialog.getByRole('textbox', { name: copy.reason }), {
      target: { value: 'Investigation completed; reinstating service' },
    });
    await userEvent.click(dialog.getByRole('button', { name: copy.continue }));
    await waitFor(() => expect(dialog.getByRole('heading', { name: copy.verification })).toBeVisible());
    fireEvent.change(dialog.getByRole('textbox', { name: copy.code }), { target: { value: '123456' } });
    await userEvent.click(dialog.getByRole('button', { name: copy.verifyUnsuspend }));
    await waitFor(() => expect(canvas.getByText(copy.completed.active)).toBeVisible());
    await expect(args.onComplete).toHaveBeenCalledOnce();
  },
};

export const BillingRoleCannotManage: Story = {
  args: { canManage: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(copy.denied)).toBeVisible();
    await expect(canvas.queryByRole('button', { name: copy.suspend })).not.toBeInTheDocument();
  },
};

export const DeletionPendingCannotManage: Story = {
  args: { status: 'deleting', deletionPending: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Workspace access cannot be changed while deletion is pending.')).toBeVisible();
    await expect(canvas.queryByRole('button', { name: copy.suspend })).not.toBeInTheDocument();
  },
};
