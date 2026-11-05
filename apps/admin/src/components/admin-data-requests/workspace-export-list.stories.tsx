import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { AdminFrame } from '../admin-frame/admin-frame';
import { workspaceExportExamples } from './admin-data-requests.fixtures';
import { WorkspaceExportList } from './workspace-export-list';

const meta = {
  title: 'Admin/DataRequests/WorkspaceExportList',
  component: WorkspaceExportList,
  decorators: [Story => <AdminFrame environment="local" contentWidth="wide">
    <Story />
  </AdminFrame>],
  args: { exports: workspaceExportExamples },
} satisfies Meta<typeof WorkspaceExportList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const LifecycleAndDetails: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(within(canvas.getByRole('row', { name: /Northstar Heating/ })).getByText('Ready for Owner')).toBeVisible();
    await expect(within(canvas.getByRole('row', { name: /Harbor Home Services/ })).getByText('Generating')).toBeVisible();
    await expect(within(canvas.getByRole('row', { name: /Cedar Home Repair/ })).getByText('Expired')).toBeVisible();
    await userEvent.click(within(canvas.getByRole('row', { name: /Northstar Heating/ })).getByRole('button', { name: 'Details' }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('alertdialog');
    await expect(dialog).toHaveTextContent(/6 CSV datasets · 23 file metadata rows/);
    await expect(dialog).toHaveTextContent(/Uploaded file contents are never included/);
  },
};

export const EmptyExportList: Story = {
  args: { exports: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('No workspace exports yet. Request one for a verified workspace Owner.')).toBeVisible();
  },
};
