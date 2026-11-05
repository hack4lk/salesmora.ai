import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, userEvent, within } from 'storybook/test';
import { AdminFrame } from '../admin-frame/admin-frame';
import { deletionRequestExamples } from './admin-data-requests.fixtures';
import { DeletionRequestQueue } from './deletion-request-queue';

const meta = {
  title: 'Admin/DataRequests/DeletionRequestQueue',
  component: DeletionRequestQueue,
  decorators: [Story => <AdminFrame environment="local" contentWidth="wide">
    <Story />
  </AdminFrame>],
  args: { requests: deletionRequestExamples },
} satisfies Meta<typeof DeletionRequestQueue>;
export default meta;
type Story = StoryObj<typeof meta>;

export const QueueAndReadOnlyDetails: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Taylor Morgan')).toBeVisible();
    await expect(within(canvas.getByRole('row', { name: /Taylor Morgan/ })).getByText('Retry scheduled')).toBeVisible();
    await expect(within(canvas.getByRole('row', { name: /Riley Chen/ })).getByText('Pending')).toBeVisible();
    await expect(within(canvas.getByRole('row', { name: /Avery Patel/ })).getByText('Completed')).toBeVisible();
    await userEvent.click(within(canvas.getByRole('row', { name: /Taylor Morgan/ })).getByRole('button', { name: 'Details' }));
    const page = within(canvasElement.ownerDocument.body);
    const dialog = await page.findByRole('alertdialog');
    await expect(dialog).toHaveTextContent('Retry required');
    await expect(dialog).toHaveTextContent('t••••@northstar.example');
    await expect(dialog).not.toHaveTextContent('taylor.morgan@northstar.example');
  },
};

export const FilterRequests: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const filter = canvas.getByLabelText('Filter deletion requests');
    fireEvent.change(filter, { target: { value: 'retry' } });
    await expect(canvas.getByText('Taylor Morgan')).toBeVisible();
    await expect(canvas.queryByText('Riley Chen')).not.toBeInTheDocument();
    fireEvent.change(filter, { target: { value: 'pending' } });
    await expect(canvas.getByText('Riley Chen')).toBeVisible();
    await expect(canvas.queryByText('Avery Patel')).not.toBeInTheDocument();
  },
};

export const EmptyQueue: Story = {
  args: { requests: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('No deletion requests match this view.')).toBeVisible();
  },
};
