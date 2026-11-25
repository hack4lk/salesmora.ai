import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { NotificationMenu, type NotificationMenuItem } from '../../notifications/notification-menu/notification-menu';

// The runtime host must supply a current, authorized Job projection.
const item: NotificationMenuItem = {
  id: 'post-job-skip-example', title: 'Customer thank-you wasn’t sent', description: 'J-0012 · Job follow-up',
  details: [{ label: 'Reason', value: 'Customer email is missing. Update the customer’s contact details.' }],
  createdAt: '2026-11-25T14:00:00Z', read: false,
  href: '/jobs/00000000-0000-4000-8000-000000000002?workspace=00000000-0000-4000-8000-000000000001', actionLabel: 'Open job',
};
const meta = {
  title: 'Workflows/Post-job notification', component: NotificationMenu, parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="flex min-h-screen items-start justify-end bg-canvas p-4"><Story/></main>],
  args: { workspaceName: 'Example workspace', unreadCount: 1, items: [item], state: 'ready', preferencesHref: '#preferences', onOpen: fn(), onRetry: fn(), onMarkRead: fn(), onLoadMore: fn() },
} satisfies Meta<typeof NotificationMenu>;
export default meta; type Story = StoryObj<typeof meta>;
async function open(element: HTMLElement) { await userEvent.click(within(element).getByRole('button', { name: 'Open notifications, 1 unread' })); return within(within(element.ownerDocument.body).getByRole('dialog')); }
export const SkippedEmail: Story = { play: async ({ canvasElement }) => {
  const d = await open(canvasElement); await expect(d.getByText('Customer thank-you wasn’t sent')).toBeVisible();
  await expect(d.getByText(item.details![0].value)).toBeVisible(); await expect(d.getByRole('link', { name: 'Open job' })).toHaveAttribute('href', item.href);
} };
export const MarkRead: Story = {
  render: function Render(args) { const [read, setRead] = useState(false); return <NotificationMenu {...args} unreadCount={read ? 0 : 1} items={args.items.map(item => ({ ...item, read }))} onMarkRead={id => { args.onMarkRead(id); setRead(true); }}/>; },
  play: async ({ canvasElement }) => { const d = await open(canvasElement); await userEvent.click(d.getByRole('button', { name: 'Mark as read' })); await expect(d.queryByText(item.title)).not.toBeInTheDocument(); await expect(within(canvasElement).getByRole('button', { name: 'Open notifications, 0 unread' })).toBeVisible(); },
};
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } }, play: async ({ canvasElement }) => { await open(canvasElement); } };
