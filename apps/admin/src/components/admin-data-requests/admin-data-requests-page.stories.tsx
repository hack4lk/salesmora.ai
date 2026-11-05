import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { AdminFrame } from '../admin-frame/admin-frame';
import {
  deletionRequestExamples,
  exportWorkspaceExamples,
  workspaceExportExamples,
} from './admin-data-requests.fixtures';
import { AdminDataRequestsPage } from './admin-data-requests-page';

const meta = {
  title: 'Admin/DataRequests/Page',
  component: AdminDataRequestsPage,
  decorators: [Story => <AdminFrame environment="local" contentWidth="wide">
    <p role="note" className="mx-auto mt-4 max-w-7xl rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
      Storybook-only: export submission is mocked. No request or email is sent.
    </p>
    <Story />
  </AdminFrame>],
  args: {
    role: 'super_admin',
    deletionRequests: deletionRequestExamples,
    workspaceExports: workspaceExportExamples,
    exportWorkspaces: exportWorkspaceExamples,
    exportMethods: ['totp'],
    onRefresh: fn(),
    onStartExport: fn(async () => ({ token: 'A'.repeat(43) })),
    onVerifyExport: fn(async () => undefined),
    onRequestExport: fn(async () => undefined),
  },
} satisfies Meta<typeof AdminDataRequestsPage>;
export default meta;
type Story = StoryObj<typeof meta>;

const reason = 'Customer portability request for the approved workspace migration';
const password = 'storybook-only-password';
const code = '123456';

async function openRequest(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: 'Request workspace export' }));
  return within(await within(canvasElement.ownerDocument.body).findByRole('alertdialog'));
}

async function fillRequest(dialog: ReturnType<typeof within>) {
  fireEvent.change(dialog.getByLabelText(/Audit reason/), { target: { value: reason } });
  await userEvent.click(dialog.getByRole('button', { name: 'Continue to verification' }));
  fireEvent.change(dialog.getByLabelText(/Staff password/), { target: { value: password } });
  fireEvent.change(dialog.getByLabelText(/6-digit authenticator code/), { target: { value: code } });
  await userEvent.click(dialog.getByRole('button', { name: 'Verify and review' }));
}

export const DeletionRequests: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Data requests' })).toBeVisible();
    await expect(canvas.getByRole('region', { name: 'Request summary' })).toBeVisible();
    await expect(canvas.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'deletion-tab');
    await expect(canvas.getByRole('heading', { name: 'Account deletion queue' })).toBeVisible();
    await expect(canvas.getByText('Deletion actions are not available here.').parentElement)
      .toHaveTextContent(/Customer deletion blocks access immediately/);
    await expect(canvas.getByRole('button', { name: 'Request workspace export' })).toBeVisible();
  },
};

export const SwitchToWorkspaceExports: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: /Workspace exports/ }));
    await expect(canvas.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'export-tab');
    await expect(canvas.getByRole('heading', { name: 'Workspace export requests' })).toBeVisible();
    await expect(within(canvas.getByRole('row', { name: /Northstar Heating/ })).getByText('Ready for Owner')).toBeVisible();
  },
};

export const RequestExportFromPage: Story = {
  play: async ({ canvasElement, args }) => {
    const dialog = await openRequest(canvasElement);
    await fillRequest(dialog);
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
    await waitFor(() => expect(within(canvasElement).getByText(/Export request queued\./)).toBeVisible());
    await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('alertdialog')).not.toBeInTheDocument());
  },
};

export const SupportCanAccess: Story = {
  args: { role: 'support' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Account deletion queue' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Request workspace export' })).toBeVisible();
  },
};

export const BillingIsDenied: Story = {
  args: { role: 'billing' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent('Your current role cannot access data requests.');
    await expect(canvas.queryByRole('table')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Request workspace export' })).not.toBeInTheDocument();
  },
};

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Loading data requests…')).toBeVisible();
  },
};

export const LoadErrorAndRefresh: Story = {
  args: { error: 'The fictional data-request service is unavailable.', onRefresh: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent('The fictional data-request service is unavailable.');
    await userEvent.click(canvas.getByRole('button', { name: 'Refresh' }));
    expect(args.onRefresh).toHaveBeenCalledOnce();
  },
};

export const ReadOnlyR1: Story = {
  args: {
    exportsAvailable: false,
    exportRequestsEnabled: false,
    onRequestExport: undefined,
    deletionTotal: 24,
    allDeletionTotal: 24,
    retryScheduledTotal: 1,
    onDeletionFilterChange: fn(),
    onDeletionPageChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Showing 1–20 of 24 requests')).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Request workspace export' })).not.toBeInTheDocument();
    await userEvent.selectOptions(canvas.getByLabelText('Filter deletion requests'), 'pending');
    expect(args.onDeletionFilterChange).toHaveBeenCalledWith('pending');
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    expect(args.onDeletionPageChange).toHaveBeenCalledWith(1);
    await userEvent.click(canvas.getByRole('tab', { name: /Workspace exports/ }));
    await expect(canvas.getByText(/No exports can be requested or viewed from this page/)).toBeVisible();
  },
};
