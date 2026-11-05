import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CaptureSourceList, type CaptureSourceAction, type CaptureSourceListRow } from './capture-source-list';
import { captureSourceListData as copy } from './capture-source-list.data';
import { dataTableData } from '../../../../../../packages/ui/src/data-display/data-table/data-table.data';

const allActions: CaptureSourceAction[] = ['setup', 'edit', 'pause', 'resume', 'duplicate', 'archive', 'restore'];
const statuses = ['active', 'active', 'scheduled', 'draft', 'paused', 'archived'] as const;
const rows: CaptureSourceListRow[] = statuses.map((status, index) => ({
  id: `source-${index}`, name: copy.stories.names[index], source: index % 2 ? 'gmail' : 'website', status,
  captured: status === 'draft' || status === 'scheduled' ? 0 : 42 + index,
  awaitingReview: index === 1 ? 4 : 0, lastActivityAt: status === 'draft' ? null : '2026-10-28T14:30:00Z', allowedActions: allActions,
}));
const meta = {
  title: 'Lead Capture/CaptureSourceList', component: CaptureSourceList, parameters: { layout: 'fullscreen' },
  args: { rows, canRead: true, timezone: 'America/New_York', onOpen: fn(), onAction: fn(), onRetry: fn() },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><h1 className="m-0 text-heading font-semibold">{copy.stories.title}</h1><p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p><Story /></main>],
} satisfies Meta<typeof CaptureSourceList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('button', { name: copy.open(rows[0].name) })).toBeVisible();
  await expect(c.queryByRole('button', { name: copy.open(rows[5].name) })).not.toBeInTheDocument();
} };
export const Archived: Story = { args: { view: 'archived' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), row = rows[5];
  await expect(c.queryByRole('button', { name: copy.open(rows[0].name) })).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: copy.actionLabel(copy.action.restore, row.name) }));
  await expect(args.onAction).toHaveBeenLastCalledWith(row, 'restore');
  await expect(c.queryByRole('button', { name: copy.actionLabel(copy.action.archive, row.name) })).not.toBeInTheDocument();
} };
export const LifecycleActions: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const [index, action] of [[0, 'pause'], [3, 'setup'], [4, 'resume'], [2, 'edit'], [1, 'duplicate'], [0, 'archive']] as const) {
    await userEvent.click(c.getByRole('button', { name: copy.actionLabel(copy.action[action], rows[index].name) }));
    await expect(args.onAction).toHaveBeenLastCalledWith(rows[index], action);
  }
  await expect(args.onOpen).not.toHaveBeenCalled();
  await userEvent.click(c.getByRole('button', { name: copy.open(rows[1].name) }));
  await expect(args.onOpen).toHaveBeenLastCalledWith(rows[1]);
} };
export const ReadOnly: Story = { args: { rows: rows.map(row => ({ ...row, allowedActions: [] })) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const action of allActions) await expect(c.queryByRole('button', { name: copy.actionLabel(copy.action[action], rows[0].name) })).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: copy.open(rows[0].name) }));
  await expect(args.onOpen).toHaveBeenCalledWith({ ...rows[0], allowedActions: [] });
} };
export const RestrictedActions: Story = { args: { rows: [{ ...rows[0], allowedActions: ['duplicate'] }] }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('button', { name: copy.actionLabel(copy.action.duplicate, rows[0].name) })).toBeVisible();
  await expect(c.queryByRole('button', { name: copy.actionLabel(copy.action.archive, rows[0].name) })).not.toBeInTheDocument();
} };
export const Pending: Story = { args: { rows: [rows[0]], pendingIds: [rows[0].id] }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const button of c.getAllByRole('button')) await expect(button).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: copy.actionLabel(copy.action.pause, rows[0].name) }));
  await expect(args.onAction).not.toHaveBeenCalled();
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.forbidden);
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
  await expect(c.queryByText(rows[0].name)).not.toBeInTheDocument();
} };
export const Loading: Story = { args: { state: 'loading' } };
export const Error: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.error);
  await userEvent.click(c.getByRole('button', { name: dataTableData.retry }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
  await expect(c.queryByText(rows[0].name)).not.toBeInTheDocument();
} };
export const Empty: Story = { args: { rows: [] } };
export const NoMatches: Story = { args: { rows: [], filtered: true } };
export const ArchivedEmpty: Story = { args: { rows: [], view: 'archived' } };
export const LongContent: Story = { args: { rows: [{ ...rows[0], name: copy.stories.longName, attention: copy.stories.longAttention, captured: 1234567, awaitingReview: 9999 }] } };
export const Keyboard: Story = { args: { rows: [rows[0]] }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), user = userEvent.setup({ document: canvasElement.ownerDocument });
  c.getByRole('button', { name: copy.open(rows[0].name) }).focus();
  await user.keyboard('{Enter}'); await expect(args.onOpen).toHaveBeenCalledWith(rows[0]);
  await user.tab();
  await expect(c.getByRole('button', { name: copy.actionLabel(copy.action.edit, rows[0].name) })).toHaveFocus();
  await user.keyboard(' '); await expect(args.onAction).toHaveBeenCalledWith(rows[0], 'edit');
} };
export const Narrow: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
