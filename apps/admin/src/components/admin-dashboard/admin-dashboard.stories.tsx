import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { AdminDashboard } from './admin-dashboard';

const meta = {
  title: 'Admin/Dashboard',
  component: AdminDashboard,
} satisfies Meta<typeof AdminDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Admin dashboard' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: /Customer users/ })).toHaveAttribute('href', '/users');
    await expect(canvas.getByRole('link', { name: /Workspaces/ })).toHaveAttribute('href', '/workspaces');
    await expect(canvas.getByRole('link', { name: /Data requests/ })).toHaveAttribute('href', '/data-requests');
    await expect(canvas.getByRole('link', { name: /Audit log/ })).toHaveAttribute('href', '/audit');
    await expect(canvas.getByRole('link', { name: /Staff and invitations/ })).toHaveAttribute('href', '/staff');
    await expect(canvas.getByRole('link', { name: /AI usage/ })).toHaveAttribute('href', '/ai-usage');
    await expect(canvas.getByRole('link', { name: /Queues and delivery/ })).toHaveAttribute('href', '/operations');
    await expect(canvas.getByRole('link', { name: /Platform settings/ })).toHaveAttribute('href', '/settings');
    await expect(canvas.getByRole('link', { name: /System rollout flags/ })).toHaveAttribute('href', '/rollout-flags');
  },
};
