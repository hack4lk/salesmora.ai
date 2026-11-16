import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { HomeIntakeWidget, type HomeIntakeItem } from './home-intake-widget';
import { homeIntakeWidgetData as copy } from './home-intake-widget.data';
import { intakeReviewListData as intakeCopy } from '../../lead-capture/intake-review-list/intake-review-list.data';

const workspace = copy.stories.workspaceId;
const items: HomeIntakeItem[] = [
  { id: '301', name: 'Parker Gray', summary: 'Water pressure inquiry', source: { id: 'website', name: 'Website requests', type: 'website' }, status: 'awaiting', flags: ['missing'], receivedAt: '2026-11-14T14:00:00Z', canReview: true, href: `/intake/00000000-0000-4000-8000-000000000301?workspace=${workspace}` },
  { id: '302', name: 'Jordan Lee', summary: 'Kitchen inquiry', source: { id: 'gmail', name: 'Email enquiries', type: 'gmail' }, status: 'awaiting', flags: ['duplicate'], receivedAt: '2026-11-15T15:00:00Z', canReview: true, href: `/intake/00000000-0000-4000-8000-000000000302?workspace=${workspace}` },
  { id: '303', name: 'Sky Ellis', summary: 'Heating service', source: { id: 'website', name: 'Website requests', type: 'website' }, status: 'awaiting', flags: [], receivedAt: '2026-11-15T16:00:00Z', canReview: true, href: `/intake/00000000-0000-4000-8000-000000000303?workspace=${workspace}` },
];
const meta = {
  title: 'Home/HomeIntakeWidget', component: HomeIntakeWidget, parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <main className="mx-auto w-full max-w-2xl p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p><Story /></main>],
  args: { timezone: 'America/New_York', intakeHref: `/intake?workspace=${workspace}&status=awaiting`, state: { status: 'ready', items, total: 3 } },
} satisfies Meta<typeof HomeIntakeWidget>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getAllByRole('listitem')).toHaveLength(3);
  await expect(c.getByText(copy.awaiting(3))).toBeVisible();
  const link = c.getByRole('link', { name: copy.view });
  await expect(link).toHaveAttribute('href', args.intakeHref); await expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  for (const item of items) await expect(c.getByRole('link', { name: intakeCopy.actionLabel(intakeCopy.review, item.name) })).toHaveAttribute('href', item.href);
  await expect(c.getByText(intakeCopy.flags.missing)).toBeVisible();
  await expect(c.getByText(intakeCopy.flags.duplicate)).toBeVisible();
  await expect(c.getByText(intakeCopy.clear)).toBeVisible();
} };
export const ViewOnly: Story = { args: { state: { status: 'ready', items: [{ ...items[0], canReview: false }], total: 1 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('link', { name: intakeCopy.actionLabel(intakeCopy.view, items[0].name) })).toBeVisible();
  await expect(c.queryByRole('link', { name: intakeCopy.actionLabel(intakeCopy.review, items[0].name) })).not.toBeInTheDocument();
} };
export const AllFlags: Story = { args: { state: { status: 'ready', items: [{ ...items[0], flags: ['duplicate', 'missing', 'uncertain', 'capacity'] }], total: 1 } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(Object.values(intakeCopy.flags).join(' · '))).toBeVisible();
} };
export const MissingDetails: Story = { args: { state: { status: 'ready', items: [{ ...items[0], name: '', summary: '' }], total: 1 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(intakeCopy.unnamed)).toBeVisible(); await expect(c.getByText(intakeCopy.noSummary)).toBeVisible();
} };
export const Empty: Story = { args: { state: { status: 'ready', items: [], total: 0 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.empty)).toBeVisible(); await expect(c.queryByRole('list')).not.toBeInTheDocument();
} };
export const Loading: Story = { args: { state: { status: 'loading' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(copy.loading);
  await expect(c.getByRole('region', { name: copy.title })).toHaveAttribute('aria-busy', 'true'); await expect(c.queryByText(copy.awaiting(0))).not.toBeInTheDocument();
} };
const retry = fn();
export const Error: Story = { args: { state: { status: 'error', onRetry: retry } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.error);
  await userEvent.click(c.getByRole('button', { name: copy.retry })); await expect(retry).toHaveBeenCalledTimes(1);
} };
export const Retrying: Story = { args: { state: { status: 'error', onRetry: fn(), retrying: true } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: copy.retry })).toBeDisabled();
} };
export const Keyboard: Story = { args: { state: { status: 'error', onRetry: fn() } }, play: async ({ canvasElement, args }) => {
  within(canvasElement).getByRole('button', { name: copy.retry }).focus(); await userEvent.keyboard('{Enter}');
  if (args.state.status === 'error') await expect(args.state.onRetry).toHaveBeenCalledTimes(1);
} };
export const ThreeItemLimit: Story = { args: { state: { status: 'ready', items: [...items, { ...items[0], id: 'fourth', name: 'Fourth item' }], total: 4 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getAllByRole('listitem')).toHaveLength(3); await expect(c.queryByText('Fourth item')).not.toBeInTheDocument();
  await expect(c.getByText(copy.remainder(3, 4))).toBeVisible();
} };
export const DescriptionTooltip: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body), trigger = c.getByRole('button', { name: copy.about });
  trigger.focus(); await userEvent.keyboard('{Enter}'); const dialog = body.getByRole('dialog', { name: copy.about });
  await expect(within(dialog).getByText(copy.description)).toBeVisible(); await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
  await waitFor(() => expect(trigger).toHaveFocus());
} };
export const DifferentTimezone: Story = { args: { timezone: 'America/Los_Angeles', state: { status: 'ready', items: [items[0]], total: 1 } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(/Nov 14, 2026, 6:00 AM/)).toBeVisible();
} };
export const LongContent: Story = { args: { state: { status: 'ready', items: [{ ...items[0], name: 'Northside Community Workshop and Neighborhood Resource Center', summary: 'Inspect heating, ventilation and plumbing throughout the entire property and rear extension', flags: ['missing', 'uncertain'] }], total: 1 } } };
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
export const LongContentMobile: Story = { args: LongContent.args, globals: Mobile.globals };
