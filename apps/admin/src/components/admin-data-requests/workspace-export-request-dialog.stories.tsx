import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { AdminFrame } from '../admin-frame/admin-frame';
import { exportWorkspaceExamples } from './admin-data-requests.fixtures';
import {
  WorkspaceExportRequestDialog,
  type WorkspaceExportRequestDialogProps,
} from './workspace-export-request-dialog';

const meta = {
  title: 'Admin/DataRequests/WorkspaceExportRequestDialog',
  component: WorkspaceExportRequestDialog,
  render: args => <ControlledDialogPreview {...args} />,
  decorators: [Story => <AdminFrame environment="local" contentWidth="wide">
    <p role="note" className="mx-auto mt-4 max-w-7xl rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
      Storybook-only: credentials, second-factor checks, and export submission are mocked. No request or email is sent.
    </p>
    <Story />
  </AdminFrame>],
  args: {
    open: true,
    workspaces: exportWorkspaceExamples,
    methods: ['totp'],
    onClose: fn(),
    onStartExport: fn(async () => ({ token: 'A'.repeat(43) })),
    onVerifyExport: fn(async () => undefined),
    onRequestExport: fn(async () => undefined),
    onSuccess: fn(),
  },
} satisfies Meta<typeof WorkspaceExportRequestDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

function ControlledDialogPreview(args: WorkspaceExportRequestDialogProps) {
  const [open, setOpen] = useState(args.open);
  return <WorkspaceExportRequestDialog {...args} open={open}
    onClose={() => { args.onClose(); setOpen(false); }} />;
}

const reason = 'Customer portability request for the approved workspace migration';
const password = 'storybook-only-password';
const code = '123456';

async function getDialog(canvasElement: HTMLElement) {
  return within(canvasElement.ownerDocument.body).findByRole('alertdialog');
}

async function reachConfirmation(dialog: ReturnType<typeof within>) {
  fireEvent.change(dialog.getByRole('textbox', { name: 'Audit reason' }), { target: { value: reason } });
  await userEvent.click(dialog.getByRole('button', { name: 'Continue to verification' }));
  fireEvent.change(dialog.getByLabelText('Staff password'), { target: { value: password } });
  fireEvent.change(dialog.getByRole('textbox', { name: '6-digit authenticator code' }), { target: { value: code } });
  await userEvent.click(dialog.getByRole('button', { name: 'Verify and review' }));
}

export const RequiresAuditReason: Story = {
  play: async ({ canvasElement }) => {
    const dialog = within(await getDialog(canvasElement));
    fireEvent.change(dialog.getByRole('textbox', { name: 'Audit reason' }), { target: { value: 'Too short' } });
    await userEvent.click(dialog.getByRole('button', { name: 'Continue to verification' }));
    await expect(dialog.getByRole('alert')).toHaveTextContent('Enter a reason between 10 and 500 characters.');
    await expect(dialog.queryByLabelText('Staff password')).not.toBeInTheDocument();
  },
};

export const TotpRequestAndConfirmation: Story = {
  play: async ({ canvasElement, args }) => {
    const dialogElement = await getDialog(canvasElement);
    const dialog = within(dialogElement);
    await reachConfirmation(dialog);
    await expect(dialogElement).toHaveTextContent('Maya Chen · m••••@northstar.example');
    await expect(dialogElement).toHaveTextContent(reason);
    await userEvent.click(dialog.getByRole('button', { name: 'Confirm export request' }));
    await waitFor(() => expect(args.onStartExport).toHaveBeenCalledWith({
      workspaceId: 'ws_8f270000-0000-4000-8000-000000000002',
      reason,
      password,
      method: 'totp',
    }));
    await waitFor(() => expect(args.onVerifyExport).toHaveBeenCalledWith({
      token: 'A'.repeat(43),
      method: 'totp',
      code,
    }));
    await waitFor(() => expect(args.onRequestExport).toHaveBeenCalledWith({ token: 'A'.repeat(43) }));
    expect(args.onSuccess).toHaveBeenCalledOnce();
    expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const PasskeyStepUp: Story = {
  args: {
    methods: ['passkey'],
    onStartExport: fn(async () => ({
      token: 'A'.repeat(43),
      options: { challenge: 'A'.repeat(43), userVerification: 'required' as const, allowCredentials: [] },
    })),
    getPasskeyResponse: fn(async () => ({
      id: 'mock-credential',
      rawId: 'mock-credential',
      type: 'public-key' as const,
      response: { clientDataJSON: 'YQ', authenticatorData: 'YQ', signature: 'YQ' },
      clientExtensionResults: {},
    })),
  },
  play: async ({ canvasElement, args }) => {
    const dialogElement = await getDialog(canvasElement);
    const dialog = within(dialogElement);
    fireEvent.change(dialog.getByRole('textbox', { name: 'Audit reason' }), { target: { value: reason } });
    await userEvent.click(dialog.getByRole('button', { name: 'Continue to verification' }));
    fireEvent.change(dialog.getByLabelText('Staff password'), { target: { value: password } });
    await userEvent.selectOptions(dialog.getByLabelText('Second factor'), 'passkey');
    await userEvent.click(dialog.getByRole('button', { name: 'Verify and review' }));
    await expect(dialog).toHaveTextContent('Download expiry');
    await userEvent.click(dialog.getByRole('button', { name: 'Confirm export request' }));
    await waitFor(() => expect(args.onVerifyExport).toHaveBeenCalledWith({
      token: 'A'.repeat(43),
      method: 'passkey',
      response: expect.objectContaining({ id: 'mock-credential' }),
    }));
    await waitFor(() => expect(args.onRequestExport).toHaveBeenCalledOnce());
  },
};

export const SubmissionFailureCanBeRetried: Story = {
  args: { onRequestExport: fn(async () => { throw new Error('The fictional export service is unavailable.'); }) },
  play: async ({ canvasElement, args }) => {
    const dialog = within(await getDialog(canvasElement));
    await reachConfirmation(dialog);
    await userEvent.click(dialog.getByRole('button', { name: 'Confirm export request' }));
    await waitFor(() => expect(dialog.getByRole('alert')).toHaveTextContent('The fictional export service is unavailable.'));
    await expect(dialog.getByRole('button', { name: 'Confirm export request' })).toBeEnabled();
    expect(args.onSuccess).not.toHaveBeenCalled();
  },
};
