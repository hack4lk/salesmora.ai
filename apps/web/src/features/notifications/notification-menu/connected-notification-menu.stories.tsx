import { StrictMode } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ConnectedNotificationMenu } from './connected-notification-menu';
import { notificationFixture as first, olderNotificationFixture as older, notificationScope } from './notification-queries.fixtures';
import { notificationMenuData as copy } from './notification-menu.data';

const reads = fn(), commands = fn();
let readStatus = 200, writeStatus = 200, marked = false;
async function open(canvasElement: HTMLElement) {
  const c = within(canvasElement);
  await c.findByRole('button', { name: copy.open(1) });
  await userEvent.click(c.getByRole('button', { name: copy.open(1) }));
  const dialog = within(await within(canvasElement.ownerDocument.body).findByRole('dialog', { name: copy.title }));
  await dialog.findByText(copy.stories.description);
  return dialog;
}

const meta = {
  title: 'Notifications/ConnectedNotificationMenu', component: ConnectedNotificationMenu,
  parameters: { layout: 'fullscreen' },
  args: { workspaceId: notificationScope.workspaceId, workspaceName: copy.stories.workspace },
  decorators: [Story => <StrictMode><main className="min-h-screen p-4 sm:p-8"><h1 className="text-heading font-semibold text-ink">{copy.stories.heading}</h1><div className="flex justify-end"><Story/></div></main></StrictMode>],
  beforeEach: () => {
    reads.mockClear(); commands.mockClear(); readStatus = 200; writeStatus = 200; marked = false;
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      const path = String(input);
      if (path === '/api/notifications/read') {
        commands(JSON.parse(String(init?.body)));
        if (writeStatus !== 200) return Response.json({ error: copy.actionError }, { status: writeStatus });
        marked = true;
        return Response.json({ ok: true });
      }
      if (!path.startsWith('/api/notifications?')) return original(input, init);
      reads(path);
      if (readStatus !== 200) return Response.json({ error: copy.loadError }, { status: readStatus });
      const fixture = new URL(path, 'http://localhost').searchParams.get('page') === '2' ? older : first;
      return Response.json({
        ...fixture, unreadCount: marked ? 0 : 1,
        items: fixture.items.map(item => ({ ...item, read: marked || item.read })),
      });
    };
    return () => { globalThis.fetch = original; };
  },
} satisfies Meta<typeof ConnectedNotificationMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const PaginationAndMarkRead: Story = { play: async ({ canvasElement }) => {
  const dialog = await open(canvasElement);
  await userEvent.click(dialog.getByRole('button', { name: copy.older }));
  await waitFor(() => expect(dialog.getAllByRole('listitem')).toHaveLength(2));
  await expect(dialog.queryByRole('button', { name: copy.older })).not.toBeInTheDocument();
  await userEvent.click(dialog.getByRole('button', { name: copy.markRead }));
  await waitFor(() => expect(commands).toHaveBeenCalledTimes(1));
  await expect(commands).toHaveBeenCalledWith({ workspaceId: notificationScope.workspaceId, id: first.items[0].id });
  await waitFor(() => expect(dialog.queryByRole('button', { name: copy.markRead })).not.toBeInTheDocument());
  await expect(within(canvasElement).getByLabelText(copy.open(0))).toBeInTheDocument();
} };
export const RefreshEvent: Story = { play: async ({ canvasElement }) => {
  const dialog = await open(canvasElement);
  const before = reads.mock.calls.length;
  marked = true;
  window.dispatchEvent(new Event('salesmora:notifications-refresh'));
  await waitFor(() => expect(reads.mock.calls.length).toBeGreaterThan(before));
  await waitFor(() => expect(dialog.queryByRole('button', { name: copy.markRead })).not.toBeInTheDocument());
} };
export const FailedWriteAndExplicitRetry: Story = { play: async ({ canvasElement }) => {
  const dialog = await open(canvasElement);
  writeStatus = 500;
  await userEvent.click(dialog.getByRole('button', { name: copy.markRead }));
  await expect(await dialog.findByText(copy.actionErrorTitle)).toBeVisible();
  await expect(commands).toHaveBeenCalledTimes(1);
  writeStatus = 200;
  await userEvent.click(dialog.getByRole('button', { name: copy.markRead }));
  await waitFor(() => expect(dialog.queryByRole('button', { name: copy.markRead })).not.toBeInTheDocument());
  await expect(commands).toHaveBeenCalledTimes(2);
  await expect(commands.mock.calls[0]).toEqual(commands.mock.calls[1]);
} };
export const RevokedReadAccess: Story = { play: async ({ canvasElement }) => {
  const dialog = await open(canvasElement);
  readStatus = 403;
  window.dispatchEvent(new Event('salesmora:notifications-refresh'));
  await expect(await dialog.findByText(copy.loadErrorTitle)).toBeVisible();
  await expect(dialog.queryByText(copy.stories.description)).not.toBeInTheDocument();
  await expect(within(canvasElement).getByLabelText(copy.open(null))).toBeInTheDocument();
  readStatus = 200;
  await userEvent.click(dialog.getByRole('button', { name: copy.retry }));
  await expect(await dialog.findByText(copy.stories.description)).toBeVisible();
} };
export const RevokedWriteAccess: Story = { play: async ({ canvasElement }) => {
  const dialog = await open(canvasElement);
  writeStatus = 403;
  await userEvent.click(dialog.getByRole('button', { name: copy.markRead }));
  await expect(await dialog.findByText(copy.loadErrorTitle)).toBeVisible();
  await expect(dialog.queryByText(copy.stories.description)).not.toBeInTheDocument();
  await expect(within(canvasElement).getByLabelText(copy.open(null))).toBeInTheDocument();
  await expect(commands).toHaveBeenCalledTimes(1);
  await userEvent.click(dialog.getByRole('button', { name: copy.retry }));
  await expect(await dialog.findByText(copy.stories.description)).toBeVisible();
} };
