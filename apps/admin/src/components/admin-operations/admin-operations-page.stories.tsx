import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { AdminFrame } from '../admin-frame/admin-frame';
import type { AdminOperationsResponse } from '@salesmora/contracts';
import { AdminOperationsPage } from './admin-operations-page';

const report: AdminOperationsResponse = {
  asOf: '2026-11-04T15:00:00.000Z',
  queues: [{
    name: 'help-ingestion-development',
    workers: 2,
    counts: { waiting: 3, active: 1, delayed: 0, failed: 2, completed: 48 },
  }, {
    name: 'help-ingestion-development-chat-retention',
    workers: 1,
    counts: { waiting: 0, active: 0, delayed: 1, failed: 0, completed: 12 },
  }],
  outboxes: [
    { name: 'Lead assignment email', statuses: [{ status: 'sent', count: 23 }, { status: 'queued', count: 1 }] },
    { name: 'Estimate delivery', statuses: [{ status: 'sent', count: 8 }, { status: 'failed', count: 1 }] },
    { name: 'Estimate notification', statuses: [] },
    { name: 'Job notification', statuses: [{ status: 'skipped', count: 5 }] },
    { name: 'Visit notification', statuses: [{ status: 'sent', count: 3 }] },
    { name: 'Deadline notification', statuses: [{ status: 'queued', count: 1 }] },
  ],
};

const meta = {
  title: 'Admin/Platform/QueuesAndDelivery',
  component: AdminOperationsPage,
  decorators: [Story => <AdminFrame environment="local" activeHref="/operations" contentWidth="wide"><Story /></AdminFrame>],
  args: { report },
} satisfies Meta<typeof AdminOperationsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const QueueAndOutboxHealth: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Queues and delivery' })).toBeVisible();
    await expect(canvas.getByRole('region', { name: 'Background queues' })).toHaveTextContent('help-ingestion-development');
    await expect(canvas.getByRole('region', { name: 'Notification delivery outboxes' })).toHaveTextContent('Lead assignment email');
    await expect(canvas.getAllByText(/No job IDs, payloads, or raw failure details are exposed/)).toHaveLength(2);
  },
};
