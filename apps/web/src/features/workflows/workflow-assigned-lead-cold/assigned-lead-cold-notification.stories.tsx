import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { NotificationMenu } from '../../notifications/notification-menu/notification-menu';
import { assignedLeadColdNotification } from './assigned-lead-cold-notification';
const item = assignedLeadColdNotification({ id: 'cold-lead-example', workspaceId: '00000000-0000-4000-8000-000000000001', createdAt: '2026-11-24T14:00:00Z', read: false, businessDays: 3, lead: { id: '00000000-0000-4000-8000-000000000002', number: 'LD-0012', name: 'Skyler Grant' } });
const meta = {
  title: 'Workflows/Assigned lead cold notification', component: NotificationMenu, parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="flex min-h-screen items-start justify-end bg-canvas p-4"><Story/></main>],
  args: { workspaceName: 'Example workspace', unreadCount: 1, items: [item], state: 'ready', preferencesHref: '#preferences', onOpen: fn(), onRetry: fn(), onMarkRead: fn(), onLoadMore: fn() },
} satisfies Meta<typeof NotificationMenu>;
export default meta; type Story = StoryObj<typeof meta>;
async function open(element: HTMLElement) { await userEvent.click(within(element).getByRole('button', { name: 'Open notifications, 1 unread' })); return within(within(element.ownerDocument.body).getByRole('dialog')); }
export const Reminder: Story = { play: async ({ canvasElement }) => { const d = await open(canvasElement); await expect(d.getByText('Assigned lead needs attention')).toBeVisible(); await expect(d.getByText('LD-0012 · Skyler Grant')).toBeVisible(); await expect(d.getByText('3 business days')).toBeVisible(); await expect(d.getByRole('link', { name: 'Open lead' })).toHaveAttribute('href', item.href); } };
export const MarkRead: Story = {
  render: function Preview(args) { const [read, setRead] = useState(false); return <NotificationMenu {...args} unreadCount={read ? 0 : 1} items={args.items.map(item => ({ ...item, read }))} onMarkRead={id => { args.onMarkRead(id); setRead(true); }}/>; },
  play: async ({ canvasElement }) => { const d = await open(canvasElement); await userEvent.click(d.getByRole('button', { name: 'Mark as read' })); await expect(d.queryByText('Assigned lead needs attention')).not.toBeInTheDocument(); await expect(within(canvasElement).getByRole('button', { name: 'Open notifications, 0 unread' })).toBeVisible(); },
};
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } }, play: async ({ canvasElement }) => { await open(canvasElement); } };
