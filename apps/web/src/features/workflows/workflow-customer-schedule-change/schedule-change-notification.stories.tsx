import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { NotificationMenu, type NotificationMenuItem } from '../../notifications/notification-menu/notification-menu';

// Future orchestration must supply a currently authorized visit or Job destination.
const item: NotificationMenuItem = {
  id: 'schedule-change-skip-example', title: 'Customer schedule update wasn’t sent', description: 'Update the customer’s contact details.',
  details: [{ label: 'Reason', value: 'Customer email is missing.' }], createdAt: '2026-11-25T14:00:00Z', read: false,
  href: '/calendar?workspace=00000000-0000-4000-8000-000000000001&date=2026-11-30&visit=00000000-0000-4000-8000-000000000002', actionLabel: 'Open visit',
};
const meta = {
  title: 'Workflows/Schedule change notification', component: NotificationMenu, parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="flex min-h-screen items-start justify-end bg-canvas p-4"><Story/></main>],
  args: { workspaceName: 'Example workspace', unreadCount: 1, items: [item], state: 'ready', preferencesHref: '#preferences', onOpen: fn(), onRetry: fn(), onMarkRead: fn(), onLoadMore: fn() },
} satisfies Meta<typeof NotificationMenu>;
export default meta; type Story = StoryObj<typeof meta>;
async function open(element: HTMLElement) { await userEvent.click(within(element).getByRole('button', { name: 'Open notifications, 1 unread' })); return within(within(element.ownerDocument.body).getByRole('dialog')); }
export const OpenVisit: Story = { play: async ({ canvasElement }) => {
  const d = await open(canvasElement); await expect(d.getByText(item.title)).toBeVisible(); await expect(d.getByRole('link', { name: 'Open visit' })).toHaveAttribute('href', item.href);
} };
export const RemovedVisitFallback: Story = { args: { items: [{ ...item, href: '/jobs/00000000-0000-4000-8000-000000000003?workspace=00000000-0000-4000-8000-000000000001', actionLabel: 'Open job' }] }, play: async ({ canvasElement, args }) => {
  const d = await open(canvasElement); await expect(d.getByRole('link', { name: 'Open job' })).toHaveAttribute('href', args.items[0].href); await expect(d.queryByRole('link', { name: 'Open visit' })).not.toBeInTheDocument();
} };
export const MarkRead: Story = {
  render: function Render(args) { const [read, setRead] = useState(false); return <NotificationMenu {...args} unreadCount={read ? 0 : 1} items={args.items.map(item => ({ ...item, read }))} onMarkRead={id => { args.onMarkRead(id); setRead(true); }}/>; },
  play: async ({ canvasElement }) => { const d = await open(canvasElement); await userEvent.click(d.getByRole('button', { name: 'Mark as read' })); await expect(d.queryByText(item.title)).not.toBeInTheDocument(); await expect(within(canvasElement).getByRole('button', { name: 'Open notifications, 0 unread' })).toBeVisible(); },
};
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } }, play: async ({ canvasElement }) => { await open(canvasElement); } };
