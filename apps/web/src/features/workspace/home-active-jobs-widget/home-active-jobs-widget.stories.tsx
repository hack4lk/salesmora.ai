import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { HomeActiveJobsWidget, type HomeActiveJob } from './home-active-jobs-widget';
import { homeActiveJobsWidgetData as copy } from './home-active-jobs-widget.data';

const workspace = copy.stories.workspaceId;
const jobs: HomeActiveJob[] = [
  { id: '101', number: 'J-101', title: 'Bathroom plumbing', customerName: 'Miller', ownerName: 'Sam Rivera', status: 'waiting', completionDeadline: '2026-11-13', scheduledDate: '2026-11-15', overdue: true, href: `/jobs/00000000-0000-4000-8000-000000000101?workspace=${workspace}` },
  { id: '105', number: 'J-105', title: 'Drain repair', customerName: 'Patel', ownerName: 'Alex Chen', status: 'waiting', completionDeadline: '2026-11-14', scheduledDate: null, overdue: true, href: `/jobs/00000000-0000-4000-8000-000000000105?workspace=${workspace}` },
  { id: '102', number: 'J-102', title: 'Water heater repair', customerName: 'Carter', ownerName: 'Sam Rivera', status: 'scheduled', completionDeadline: '2026-11-17', scheduledDate: '2026-11-15', overdue: false, href: `/jobs/00000000-0000-4000-8000-000000000102?workspace=${workspace}` },
  { id: '103', number: 'J-103', title: 'Furnace inspection', customerName: 'Brooks', ownerName: 'Sam Rivera', status: 'in-progress', completionDeadline: '2026-11-18', scheduledDate: '2026-11-15', overdue: false, href: `/jobs/00000000-0000-4000-8000-000000000103?workspace=${workspace}` },
  { id: '106', number: 'J-106', title: 'Boiler service', customerName: 'Reed', ownerName: 'Alex Chen', status: 'scheduled', completionDeadline: '2026-11-20', scheduledDate: '2026-11-15', overdue: false, href: `/jobs/00000000-0000-4000-8000-000000000106?workspace=${workspace}` },
];
const meta = {
  title: 'Home/HomeActiveJobsWidget', component: HomeActiveJobsWidget, parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <main className="mx-auto w-full max-w-2xl p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p><Story /></main>],
  args: { jobsHref: `/jobs?workspace=${workspace}`, state: { status: 'ready', jobs, total: 8 } },
} satisfies Meta<typeof HomeActiveJobsWidget>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getAllByRole('listitem')).toHaveLength(5);
  await expect(c.getByText(copy.remainder(5, 8))).toBeVisible();
  const link = c.getByRole('link', { name: copy.view });
  await expect(link).toHaveAttribute('href', args.jobsHref); await expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  for (const job of jobs) await expect(c.getByRole('link', { name: copy.openLabel(job.title) })).toHaveAttribute('href', job.href);
} };
export const AssignedWork: Story = { args: { jobsHref: `/jobs?workspace=${workspace}&mine=true`, state: { status: 'ready', jobs: [jobs[0], jobs[2], jobs[3]], total: 3 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getAllByRole('listitem')).toHaveLength(3);
  await expect(c.queryByText('Alex Chen', { exact: false })).not.toBeInTheDocument();
} };
export const NeedsScheduling: Story = { args: { state: { status: 'ready', jobs: [{ ...jobs[0], status: 'needs-scheduling', overdue: false, completionDeadline: null, scheduledDate: null, ownerName: '' }], total: 1 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText('Needs Scheduling')).toBeVisible();
  await expect(c.getByText(copy.noDeadline)).toBeVisible(); await expect(c.getByText(copy.noSchedule, { exact: false })).toBeVisible();
  await expect(c.getByText(copy.unassigned, { exact: false })).toBeVisible();
  await expect(c.queryByText(/^Overdue/)).not.toBeInTheDocument();
} };
export const Empty: Story = { args: { state: { status: 'ready', jobs: [], total: 0 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.empty)).toBeVisible(); await expect(c.queryByRole('list')).not.toBeInTheDocument();
} };
export const Loading: Story = { args: { state: { status: 'loading' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(copy.loading);
  await expect(c.getByRole('region', { name: copy.title })).toHaveAttribute('aria-busy', 'true'); await expect(c.queryByText(copy.empty)).not.toBeInTheDocument();
} };
const retry = fn();
export const Error: Story = { args: { state: { status: 'error', onRetry: retry } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.error);
  await userEvent.click(c.getByRole('button', { name: copy.retry })); await expect(retry).toHaveBeenCalledTimes(1);
} };
export const Retrying: Story = { args: { state: { status: 'error', onRetry: fn(), retrying: true } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('button', { name: copy.retry })).toBeDisabled();
  await expect(c.getByRole('region', { name: copy.title })).toHaveAttribute('aria-busy', 'true');
} };
export const Keyboard: Story = { args: { state: { status: 'error', onRetry: fn() } }, play: async ({ canvasElement, args }) => {
  const button = within(canvasElement).getByRole('button', { name: copy.retry }); button.focus(); await userEvent.keyboard('{Enter}');
  if (args.state.status === 'error') await expect(args.state.onRetry).toHaveBeenCalledTimes(1);
} };
export const FiveJobLimit: Story = { args: { state: { status: 'ready', jobs: [...jobs, { ...jobs[0], id: 'sixth', title: 'Sixth job' }], total: 6 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getAllByRole('listitem')).toHaveLength(5); await expect(c.queryByText('Sixth job')).not.toBeInTheDocument();
} };
export const DescriptionTooltip: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body), trigger = c.getByRole('button', { name: copy.about });
  await expect(c.queryByText(copy.description)).not.toBeInTheDocument();
  trigger.focus(); await userEvent.keyboard('{Enter}');
  const dialog = body.getByRole('dialog', { name: copy.about }); await expect(within(dialog).getByText(copy.description)).toBeVisible();
  await userEvent.click(within(dialog).getByRole('button', { name: 'Close' })); await waitFor(() => expect(trigger).toHaveFocus());
} };
export const LongContent: Story = { args: { state: { status: 'ready', jobs: [{ ...jobs[0], title: 'Inspect and replace heating, ventilation and plumbing throughout the entire property', customerName: 'Northside Community Workshop and Neighborhood Resource Center', ownerName: 'Alexandra Rivera Montgomery' }], total: 1 } } };
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
export const LongContentMobile: Story = { args: LongContent.args, globals: Mobile.globals };
