import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { HomeActivityWidget, type HomeActivityItem } from './home-activity-widget';
import { homeActivityWidgetData as copy } from './home-activity-widget.data';
import { activityReportData as activityCopy } from '../../reports/activity-report/activity-report.data';

const workspace = copy.stories.workspaceId;
const items: HomeActivityItem[] = [
  { eventId: '00000000-0000-4000-8000-000000000801', domain: 'job', action: 'status-changed', occurredAt: '2026-11-15T18:00:00Z', actor: { kind: 'member', key: 'alex', label: 'Alex Morgan' }, recordId: '00000000-0000-4000-8000-000000000201', recordLabel: 'JOB-201 · Kitchen repair', href: `/jobs/00000000-0000-4000-8000-000000000201?workspace=${workspace}` },
  { eventId: '00000000-0000-4000-8000-000000000802', domain: 'lead', action: 'stage-changed', occurredAt: '2026-11-15T16:00:00Z', actor: { kind: 'member', key: 'casey', label: 'Casey Reed' }, recordId: '00000000-0000-4000-8000-000000000101', recordLabel: 'LEAD-101 · Heating inquiry', href: `/leads/00000000-0000-4000-8000-000000000101?workspace=${workspace}` },
  { eventId: '00000000-0000-4000-8000-000000000803', domain: 'lead', action: 'created', occurredAt: '2026-11-15T14:00:00Z', actor: { kind: 'system', key: 'system', label: 'System' }, recordId: '00000000-0000-4000-8000-000000000102', recordLabel: 'LEAD-102 · Water pressure inquiry', href: `/leads/00000000-0000-4000-8000-000000000102?workspace=${workspace}` },
];
const meta = {
  title: 'Home/HomeActivityWidget', component: HomeActivityWidget, parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <main className="mx-auto w-full max-w-2xl p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p><Story /></main>],
  args: { timezone: 'America/New_York', state: { status: 'ready', items } },
} satisfies Meta<typeof HomeActivityWidget>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), rows = c.getAllByRole('listitem');
  await expect(rows).toHaveLength(3);
  for (const [index, item] of items.entries()) {
    const row = within(rows[index]);
    await expect(row.getByRole('heading', { name: `${activityCopy.domains[item.domain]} · ${activityCopy.actions[item.action]}` })).toBeVisible();
    await expect(row.getByText(item.actor.label)).toBeVisible();
    await expect(row.getByRole('link', { name: copy.recordAction(activityCopy.domains[item.domain], item.recordLabel) })).toHaveAttribute('href', item.href);
    await expect(rows[index].querySelector('time')).toHaveAttribute('datetime', item.occurredAt);
  }
} };
export const AssignedWork: Story = { args: { state: { status: 'ready', items: [items[0]] } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getAllByRole('listitem')).toHaveLength(1); await expect(c.queryByText(items[1].recordLabel)).not.toBeInTheDocument();
} };
export const Empty: Story = { args: { state: { status: 'ready', items: [] } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.empty)).toBeVisible(); await expect(c.queryByRole('list')).not.toBeInTheDocument();
} };
export const Restricted: Story = { args: { state: { status: 'restricted' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.queryByRole('region', { name: copy.title })).not.toBeInTheDocument(); await expect(c.queryByText(items[0].recordLabel)).not.toBeInTheDocument();
} };
export const Loading: Story = { args: { state: { status: 'loading' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(copy.loading); await expect(c.getByRole('region', { name: copy.title })).toHaveAttribute('aria-busy', 'true');
} };
export const Error: Story = { args: { state: { status: 'error', onRetry: fn() } }, play: async ({ canvasElement, args }) => {
  if (args.state.status !== 'error') throw new globalThis.Error('Expected error fixture');
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.error);
  await userEvent.click(c.getByRole('button', { name: copy.retry })); await expect(args.state.onRetry).toHaveBeenCalledTimes(1);
} };
export const Retrying: Story = { args: { state: { status: 'error', onRetry: fn(), retrying: true } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: copy.retry })).toBeDisabled();
} };
export const Keyboard: Story = { args: Error.args, play: async ({ canvasElement, args }) => {
  if (args.state.status !== 'error') throw new globalThis.Error('Expected error fixture');
  within(canvasElement).getByRole('button', { name: copy.retry }).focus(); await userEvent.keyboard('{Enter}');
  await expect(args.state.onRetry).toHaveBeenCalledTimes(1);
} };
export const FiveEventLimit: Story = { args: { state: { status: 'ready', items: Array.from({ length: 6 }, (_, index) => ({ ...items[0], eventId: `event-${index}`, recordLabel: `Event record ${index + 1}` })) } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getAllByRole('listitem')).toHaveLength(5); await expect(c.queryByText('Event record 6')).not.toBeInTheDocument();
} };
export const DescriptionTooltip: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body), trigger = c.getByRole('button', { name: copy.about });
  trigger.focus(); await userEvent.keyboard('{Enter}'); const dialog = body.getByRole('dialog', { name: copy.about });
  await expect(within(dialog).getByText(copy.description)).toBeVisible(); await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
  await waitFor(() => expect(trigger).toHaveFocus());
} };
export const DifferentTimezone: Story = { args: { timezone: 'America/Los_Angeles', state: { status: 'ready', items: [items[0]] } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByText('Nov 15, 2026')).toBeVisible();
  await expect(c.getByText('10:00 AM')).toBeVisible();
} };
export const LongContent: Story = { args: { state: { status: 'ready', items: [{ ...items[0], actor: { kind: 'member', key: 'alex', label: 'Alexandra Morgan-Reed Community Services Coordinator' }, recordLabel: 'JOB-201 · Inspect heating, ventilation and plumbing throughout the community workshop and rear extension' }] } } };
export const PlainText: Story = { args: { state: { status: 'ready', items: [{ ...items[0], recordLabel: '<strong>Kitchen repair</strong>' }] } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText('<strong>Kitchen repair</strong>')).toBeVisible();
  await expect(canvasElement.querySelector('strong')).toBeNull();
} };
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
export const LongContentMobile: Story = { args: LongContent.args, globals: Mobile.globals };
