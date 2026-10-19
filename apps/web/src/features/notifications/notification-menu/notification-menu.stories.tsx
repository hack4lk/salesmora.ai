import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { NotificationMenu, type NotificationMenuProps } from './notification-menu';
import { notificationMenuData as copy } from './notification-menu.data';

const fixture = { id: 'preview-notification', title: copy.stories.title, description: copy.stories.description, createdAt: copy.stories.date, read: false, href: copy.stories.leadHref };
function Preview(args: NotificationMenuProps) {
  const [items, setItems] = useState(args.items);
  const [count, setCount] = useState(args.unreadCount);
  const [state, setState] = useState(args.state);
  const [hasMore, setHasMore] = useState(args.hasMore);
  return <NotificationMenu {...args} items={items} unreadCount={count} state={state} hasMore={hasMore}
    onRetry={() => { args.onRetry(); setState('ready'); }}
    onMarkRead={id => { args.onMarkRead(id); setItems(current => current.map(item => item.id === id ? { ...item, read: true } : item)); setCount(current => current === null ? null : Math.max(0, current - 1)); }}
    onLoadMore={() => { args.onLoadMore(); setItems(current => [...current, { ...fixture, id: 'preview-older', read: true, createdAt: copy.stories.olderDate }]); setHasMore(false); }}/>;
}
async function open(canvasElement: HTMLElement) {
  await userEvent.click(within(canvasElement).getByRole('button', { name: /^Open notifications/ }));
  const panel = await within(canvasElement.ownerDocument.body).findByRole('dialog', { name: copy.title });
  await waitFor(() => expect(panel).toBeVisible());
  return panel;
}
const meta = {
  title: 'Notifications/NotificationMenu', component: NotificationMenu, parameters: { layout: 'fullscreen' },
  args: { workspaceName: copy.stories.workspace, unreadCount: 1, items: [fixture], state: 'ready', preferencesHref: copy.stories.preferencesHref, onOpen: fn(), onRetry: fn(), onMarkRead: fn(), onLoadMore: fn() },
  render: args => <Preview {...args}/>,
  decorators: [Story => <main className="min-h-screen p-4 sm:p-8"><h1 className="mb-4 mt-0 text-heading font-semibold text-ink">{copy.stories.heading}</h1><p className="mb-6 mt-0 text-sm leading-6 text-muted">{copy.stories.notice}</p><div className="flex justify-end rounded-2xl border border-line bg-paper p-4"><Story/></div></main>],
} satisfies Meta<typeof NotificationMenu>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const dialog = within(await open(canvasElement));
  await expect(dialog.getByText(copy.stories.description)).toBeVisible();
  await expect(dialog.getByRole('link', { name: copy.view })).toHaveAttribute('href', copy.stories.leadHref);
  await expect(dialog.getByRole('link', { name: copy.preferences })).toHaveAttribute('href', copy.stories.preferencesHref);
  await expect(args.onOpen).toHaveBeenCalledOnce();
} };
export const WorkOrderEvent: Story = {
  args: { items: [{ id: 'preview-wo', title: copy.workOrderTitles.issued, description: copy.workOrderDescription('Alex Rivera', 'WO-0042', 'Replace kitchen faucet'), createdAt: copy.stories.date, read: false, href: '/work-orders/preview-wo?workspace=preview-workspace', actionLabel: copy.viewWorkOrder }] },
  play: async ({ canvasElement }) => {
    const dialog = within(await open(canvasElement));
    await expect(dialog.getByRole('link', { name: copy.viewWorkOrder })).toHaveAttribute('href', '/work-orders/preview-wo?workspace=preview-workspace');
  },
};
export const Closed: Story = {};
export const Empty: Story = { args: { items: [], unreadCount: 0 }, play: async ({ canvasElement }) => {
  const dialog = within(await open(canvasElement));
  await expect(dialog.getByRole('heading', { name: copy.emptyTitle })).toBeVisible();
  await expect(dialog.queryByRole('link', { name: copy.view })).not.toBeInTheDocument();
} };
export const Loading: Story = { args: { state: 'loading', unreadCount: null }, play: async ({ canvasElement }) => {
  const dialog = within(await open(canvasElement));
  await expect(dialog.getByRole('status')).toHaveTextContent(copy.loading);
  await expect(dialog.queryByText(copy.stories.description)).not.toBeInTheDocument();
} };
export const LoadError: Story = { args: { state: 'error', unreadCount: null }, play: async ({ canvasElement }) => {
  const dialog = within(await open(canvasElement));
  await expect(dialog.getByRole('alert')).toHaveTextContent(copy.loadErrorTitle);
  await expect(dialog.queryByText(copy.stories.description)).not.toBeInTheDocument();
} };
export const Retry: Story = { args: { state: 'error', unreadCount: null }, play: async ({ canvasElement, args }) => {
  const dialog = within(await open(canvasElement));
  await userEvent.click(dialog.getByRole('button', { name: copy.retry }));
  await expect(args.onRetry).toHaveBeenCalledOnce();
  await expect(dialog.getByText(copy.stories.description)).toBeVisible();
} };
export const MarkRead: Story = { play: async ({ canvasElement, args }) => {
  const dialog = within(await open(canvasElement));
  await userEvent.click(dialog.getByRole('button', { name: copy.markRead }));
  await expect(args.onMarkRead).toHaveBeenCalledWith(fixture.id);
  await expect(args.onMarkRead).toHaveBeenCalledOnce();
  await expect(dialog.queryByRole('button', { name: copy.markRead })).not.toBeInTheDocument();
  await expect(dialog.getByText(copy.read, { exact: true })).toBeVisible();
  await userEvent.click(dialog.getByRole('button', { name: copy.close }));
  await expect(within(canvasElement).getByRole('button', { name: copy.open(0) })).toHaveFocus();
} };
export const MarkingRead: Story = { args: { pendingId: fixture.id }, play: async ({ canvasElement, args }) => {
  const dialog = within(await open(canvasElement));
  await expect(dialog.getByRole('button', { name: copy.marking })).toBeDisabled();
  await expect(args.onMarkRead).not.toHaveBeenCalled();
} };
export const ReadError: Story = { args: { actionError: true }, play: async ({ canvasElement }) => {
  const dialog = within(await open(canvasElement));
  await expect(dialog.getByRole('alert')).toHaveTextContent(copy.actionErrorTitle);
  await expect(dialog.getByRole('button', { name: copy.markRead })).toBeEnabled();
} };
export const OlderNotifications: Story = { args: { hasMore: true }, play: async ({ canvasElement, args }) => {
  const dialog = within(await open(canvasElement));
  await userEvent.click(dialog.getByRole('button', { name: copy.older }));
  await expect(args.onLoadMore).toHaveBeenCalledOnce();
  await expect(dialog.getAllByRole('link', { name: copy.view })).toHaveLength(2);
} };
export const LoadingOlder: Story = { args: { hasMore: true, loadingMore: true }, play: async ({ canvasElement }) => {
  const dialog = within(await open(canvasElement));
  await expect(dialog.getByRole('button', { name: copy.loadingOlder })).toBeDisabled();
} };
export const LongContent: Story = { args: { workspaceName: copy.stories.longWorkspace, unreadCount: 123, items: Array.from({ length: 5 }, (_, i) => ({ ...fixture, id: `preview-${i}`, description: copy.stories.longDescription })) }, play: async ({ canvasElement }) => { await open(canvasElement); } };
export const Keyboard: Story = { play: async ({ canvasElement }) => {
  const button = within(canvasElement).getByRole('button', { name: copy.open(1) });
  button.focus(); await userEvent.keyboard('{Enter}');
  const dialog = within(await within(canvasElement.ownerDocument.body).findByRole('dialog', { name: copy.title }));
  await expect(dialog.getByRole('button', { name: copy.close })).toHaveFocus();
  await userEvent.tab({ shift: true });
  await expect(dialog.getByRole('link', { name: copy.preferences })).toHaveFocus();
  await userEvent.tab();
  await expect(dialog.getByRole('button', { name: copy.close })).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await expect(button).toHaveFocus();
} };
export const Narrow: Story = { globals: { viewport: { value: 'phone', isRotated: false } }, play: async ({ canvasElement }) => { await open(canvasElement); } };
