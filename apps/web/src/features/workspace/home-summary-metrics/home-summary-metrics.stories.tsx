import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { HomeSummaryMetrics, type HomeSummaryMetric } from './home-summary-metrics';
import { homeSummaryMetricsData as copy } from './home-summary-metrics.data';

const workspace = copy.stories.workspaceId;
const business: HomeSummaryMetric[] = [
  { id: 'newLeads', state: 'ready', value: 6, description: 'Oct 17–Nov 15 · All stages', href: `/leads?workspace=${workspace}` },
  { id: 'activeJobs', state: 'ready', value: 8, description: 'Excludes completed and canceled', href: `/jobs?workspace=${workspace}` },
  { id: 'attentionJobs', state: 'ready', value: 4, description: 'Overdue, waiting, or needs scheduling · Counted once', href: `/jobs?workspace=${workspace}` },
  { id: 'awaitingIntake', state: 'ready', value: 3, description: 'Not yet approved or dismissed', href: `/intake?workspace=${workspace}` },
];
const assigned: HomeSummaryMetric[] = [
  { id: 'visitsToday', state: 'ready', value: 3, description: 'Assigned to you · Nov 15 · America/New_York · Linked visits counted once', href: `/calendar?workspace=${workspace}&person=me&date=2026-11-15` },
  { id: 'activeJobs', state: 'ready', value: 3, description: 'Assigned to you · Excludes completed and canceled', href: `/jobs?workspace=${workspace}&mine=true` },
  { id: 'attentionJobs', state: 'ready', value: 1, description: 'Assigned to you · Overdue, waiting, or needs scheduling · Counted once', href: `/jobs?workspace=${workspace}&mine=true` },
];
const meta = {
  title: 'Home/HomeSummaryMetrics',
  component: HomeSummaryMetrics,
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <main className="mx-auto min-h-screen w-full max-w-6xl p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p><Story /></main>],
  args: { metrics: business },
} satisfies Meta<typeof HomeSummaryMetrics>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getAllByRole('group')).toHaveLength(4);
  for (const metric of business) {
    if (metric.state !== 'ready') throw new Error('Expected ready fixture.');
    const group = within(canvas.getByRole('group', { name: copy.labels[metric.id] }));
    await expect(group.getByText(String(metric.value), { exact: true })).toBeVisible();
    await expect(group.queryByText(metric.description)).not.toBeInTheDocument();
    await expect(group.getByRole('button', { name: copy.about(copy.labels[metric.id]) })).toBeVisible();
    await expect(group.getByRole('link', { name: copy.view(copy.labels[metric.id]) })).toHaveAttribute('href', metric.href);
  }
} };
export const Office: Story = { args: { metrics: business.map(metric => ({ ...metric, description: `Accessible work · ${metric.description}` })) } };
export const AssignedWork: Story = { args: { metrics: assigned }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getAllByRole('group')).toHaveLength(3);
  await expect(canvas.queryByRole('group', { name: copy.labels.newLeads })).not.toBeInTheDocument();
  await expect(canvas.queryByRole('group', { name: copy.labels.awaitingIntake })).not.toBeInTheDocument();
  await expect(within(canvas.getByRole('group', { name: copy.labels.attentionJobs })).getByText('1', { exact: true })).toBeVisible();
} };
export const Zero: Story = { args: { metrics: business.map(metric => ({ id: metric.id, description: metric.description, state: 'ready', value: 0 })) }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getAllByText('0', { exact: true })).toHaveLength(4);
  await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
} };
export const Loading: Story = { args: { metrics: business.map(metric => ({ id: metric.id, description: metric.description, state: 'loading' })) }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getAllByRole('status')).toHaveLength(4);
  for (const group of canvas.getAllByRole('group')) await expect(group).toHaveAttribute('aria-busy', 'true');
  await expect(canvas.queryByText('0', { exact: true })).not.toBeInTheDocument();
  await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
} };
const retry = fn();
export const PartialError: Story = { args: { metrics: [business[0], { id: 'activeJobs', description: business[1].description, state: 'error', onRetry: retry }, business[2], business[3]] }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getAllByRole('status')).toHaveLength(1);
  await expect(within(canvas.getByRole('group', { name: copy.labels.activeJobs })).queryByText('8', { exact: true })).not.toBeInTheDocument();
  await userEvent.click(canvas.getByRole('button', { name: copy.retry(copy.labels.activeJobs) }));
  await expect(retry).toHaveBeenCalledTimes(1);
  await expect(canvas.getAllByRole('link')).toHaveLength(3);
} };
export const Retrying: Story = { args: { metrics: [{ id: 'activeJobs', description: business[1].description, state: 'error', onRetry: fn(), retrying: true }] }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole('button', { name: copy.retry(copy.labels.activeJobs) })).toBeDisabled();
  await expect(canvas.getByRole('group')).toHaveAttribute('aria-busy', 'true');
} };
export const Keyboard: Story = { args: { metrics: [{ id: 'activeJobs', description: business[1].description, state: 'error', onRetry: fn() }] }, play: async ({ canvasElement, args }) => {
  const button = within(canvasElement).getByRole('button', { name: copy.retry(copy.labels.activeJobs) });
  button.focus();
  await userEvent.keyboard('{Enter}');
  const metric = args.metrics[0];
  if (metric.state === 'error') await expect(metric.onRetry).toHaveBeenCalledTimes(1);
} };
export const PermissionLimited: Story = { args: { metrics: [assigned[1]] }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getAllByRole('group')).toHaveLength(1);
  await expect(within(canvasElement).queryByRole('group', { name: copy.labels.awaitingIntake })).not.toBeInTheDocument();
} };
export const NoAccess: Story = { args: { metrics: [] }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('region', { name: copy.title })).not.toBeInTheDocument();
} };
export const LargeCounts: Story = { args: { metrics: business.map(metric => ({ id: metric.id, description: copy.stories.longDescription, state: 'ready', value: Number.MAX_SAFE_INTEGER })) }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getAllByText('9,007,199,254,740,991')).toHaveLength(4);
} };
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
export const AssignedWorkMobile: Story = { args: AssignedWork.args, globals: Mobile.globals };
export const DescriptionTooltip: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const trigger = canvas.getByRole('button', { name: copy.about(copy.labels.newLeads) });
  trigger.focus();
  await userEvent.keyboard('{Enter}');
  const dialog = body.getByRole('dialog', { name: copy.about(copy.labels.newLeads) });
  await expect(dialog).toBeVisible();
  await expect(within(dialog).getByText(business[0].description)).toBeVisible();
  await expect(dialog).not.toHaveTextContent('Workspace');
  await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
  await waitFor(() => expect(trigger).toHaveFocus());
} };
