import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { HomeAttentionWidget, type HomeAttentionItem } from './home-attention-widget';
import { homeAttentionWidgetData as copy } from './home-attention-widget.data';

const workspace = copy.stories.workspaceId;
const items: HomeAttentionItem[] = [
  { id: 'job:101', title: 'Miller · Bathroom plumbing', reason: 'Overdue · Due Nov 13', metadata: 'J-101 · Sam Rivera · Waiting for replacement parts', overdue: true, action: 'Open job', href: `/jobs/00000000-0000-4000-8000-000000000101?workspace=${workspace}` },
  { id: 'job:105', title: 'Patel · Drain repair', reason: 'Overdue · Due Nov 14', metadata: 'J-105 · Alex Chen · Waiting for customer access', overdue: true, action: 'Open job', href: `/jobs/00000000-0000-4000-8000-000000000105?workspace=${workspace}` },
  { id: 'intake:301', title: 'Parker Gray · Water pressure', reason: 'Missing details', metadata: 'I-301 · Website form · Received Nov 14, 9:00 AM', overdue: false, action: 'Review', href: `/intake/00000000-0000-4000-8000-000000000301?workspace=${workspace}` },
  { id: 'intake:302', title: 'Jordan Lee · Kitchen inquiry', reason: 'Possible duplicate', metadata: 'I-302 · Gmail · Received Nov 15, 10:00 AM', overdue: false, action: 'Review', href: `/intake/00000000-0000-4000-8000-000000000302?workspace=${workspace}` },
  { id: 'lead:201', title: 'Jordan Lee · Kitchen remodel', reason: 'Unassigned lead', metadata: 'L-201 · New · Created Nov 13', overdue: false, action: 'Review lead', href: `/leads/00000000-0000-4000-8000-000000000201?workspace=${workspace}` },
];

const meta = {
  title: 'Home/HomeAttentionWidget',
  component: HomeAttentionWidget,
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <main className="mx-auto w-full max-w-2xl p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">Home attention review</h1><p className="mb-6 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p><Story /></main>],
  args: { state: { status: 'ready', items, total: 8 } },
} satisfies Meta<typeof HomeAttentionWidget>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const heading = canvas.getByRole('heading', { name: copy.title, level: 2 });
  await expect(heading).toBeVisible();
  await expect(heading).toHaveClass('text-2xl');
  await expect(heading.parentElement?.querySelector('p')).toBeNull();
  await expect(canvas.getByRole('region', { name: copy.title })).not.toHaveAttribute('aria-describedby');
  await expect(canvas.getAllByRole('listitem')).toHaveLength(5);
  await expect(canvas.getByText(copy.remainder(5, 8))).toBeVisible();
  for (const item of items) {
    await expect(canvas.getByRole('link', { name: copy.actionName(item.action, item.title) })).toHaveAttribute('href', item.href);
  }
} };
export const Office: Story = {};
export const AssignedOnly: Story = { args: { state: { status: 'ready', items: [items[0]], total: 1 } }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getAllByRole('listitem')).toHaveLength(1);
  await expect(canvas.getByRole('link', { name: copy.actionName(items[0].action, items[0].title) })).toBeVisible();
  await expect(canvas.queryByText(items[1].title)).not.toBeInTheDocument();
  await expect(canvas.queryByRole('link', { name: /^Review/ })).not.toBeInTheDocument();
  await expect(canvas.queryByText(copy.remainder(1, 8))).not.toBeInTheDocument();
} };
export const Empty: Story = { args: { state: { status: 'ready', items: [], total: 0 } }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText(copy.empty)).toBeVisible();
  await expect(canvas.queryByRole('list')).not.toBeInTheDocument();
  await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
} };
export const Loading: Story = { args: { state: { status: 'loading' } }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole('status')).toHaveTextContent(copy.loading);
  await expect(canvas.getByRole('region', { name: copy.title })).toHaveAttribute('aria-busy', 'true');
  await expect(canvas.queryByText(copy.empty)).not.toBeInTheDocument();
  await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
} };
const retry = fn();
export const Error: Story = { args: { state: { status: 'error', onRetry: retry } }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole('alert')).toHaveTextContent(copy.error);
  await userEvent.click(canvas.getByRole('button', { name: copy.retry }));
  await expect(retry).toHaveBeenCalledTimes(1);
  await expect(canvas.queryByText(copy.empty)).not.toBeInTheDocument();
} };
export const Retrying: Story = { args: { state: { status: 'error', onRetry: fn(), retrying: true } }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole('button', { name: copy.retry })).toBeDisabled();
  await expect(canvas.getByRole('region', { name: copy.title })).toHaveAttribute('aria-busy', 'true');
} };
export const Keyboard: Story = { args: { state: { status: 'error', onRetry: fn() } }, play: async ({ canvasElement, args }) => {
  const button = within(canvasElement).getByRole('button', { name: copy.retry });
  button.focus();
  await expect(button).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  if (args.state.status === 'error') await expect(args.state.onRetry).toHaveBeenCalledTimes(1);
} };
export const FiveItemLimit: Story = { args: { state: { status: 'ready', items: [...items, { ...items[0], id: 'job:106', title: 'Reed · Boiler service' }], total: 6 } }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getAllByRole('listitem')).toHaveLength(5);
  await expect(canvas.queryByText('Reed · Boiler service')).not.toBeInTheDocument();
  await expect(canvas.getByText(copy.remainder(5, 6))).toBeVisible();
} };
export const LongContent: Story = { args: { state: { status: 'ready', items: [{ ...items[0], title: copy.stories.longTitle, metadata: copy.stories.longMetadata }], total: 1 } } };
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
export const LongContentMobile: Story = { args: LongContent.args, globals: Mobile.globals };
