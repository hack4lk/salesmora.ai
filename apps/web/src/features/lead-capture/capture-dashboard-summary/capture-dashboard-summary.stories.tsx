import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CaptureDashboardSummary } from './capture-dashboard-summary';
import { captureDashboardSummaryData as copy } from './capture-dashboard-summary.data';
import { captureSourceListData } from '../capture-source-list/capture-source-list.data';
const source = { id: 'example-source', name: copy.stories.name, type: 'website' as const, status: 'active' as const };
const totals = { captured: 42, awaitingReview: 7, approved: 31 };
const meta = {
  title: 'Lead Capture/CaptureDashboardSummary', component: CaptureDashboardSummary, parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><p className="mb-6 mt-0 text-sm text-muted">{copy.stories.description}</p><Story /></main>],
  args: { source, totals, canRead: true, canReadIntake: true, intakeHref: copy.stories.href, onRetry: fn() },
} satisfies Meta<typeof CaptureDashboardSummary>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); for (const key of ['captured', 'awaitingReview', 'approved'] as const) await expect(within(c.getByRole('group', { name: copy.metrics[key].label })).getByText(String(totals[key]), { exact: true })).toBeVisible();
  await expect(c.getByRole('link', { name: copy.review })).toHaveAttribute('href', copy.stories.href);
} };
export const Gmail: Story = { args: { source: { ...source, type: 'gmail' } } };
export const Zero: Story = { args: { totals: { captured: 0, awaitingReview: 0, approved: 0 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getAllByText('0', { exact: true })).toHaveLength(3);
} };
export const Paused: Story = { args: { source: { ...source, status: 'paused' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(captureSourceListData.statuses.paused)).toBeVisible(); await expect(c.getByRole('link', { name: copy.review })).toHaveAttribute('href', copy.stories.href);
} };
export const Archived: Story = { args: { source: { ...source, status: 'archived' } } };
export const Scheduled: Story = { args: { source: { ...source, status: 'scheduled' }, totals: { captured: 0, awaitingReview: 0, approved: 0 } } };
export const Draft: Story = { args: { source: { ...source, status: 'draft' }, totals: { captured: 0, awaitingReview: 0, approved: 0 } } };
export const IntakeBlocked: Story = { args: { source: { ...source, intakeBlocked: true, attention: copy.stories.blocked } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.blocked, { exact: true })).toBeVisible(); await expect(c.getByRole('link', { name: copy.review })).toBeVisible();
} };
export const Loading: Story = { args: { totals: undefined, state: 'loading' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); for (const key of ['captured', 'awaitingReview', 'approved'] as const) await expect(c.getByRole('group', { name: copy.metrics[key].label })).toHaveAttribute('aria-busy', 'true'); await expect(c.queryByText('0', { exact: true })).not.toBeInTheDocument();
} };
export const Error: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.error); await userEvent.click(c.getByRole('button', { name: copy.retry })); await expect(args.onRetry).toHaveBeenCalledTimes(1); await expect(c.getByRole('link', { name: copy.review })).toBeVisible();
} };
export const MissingTotals: Story = { args: { totals: undefined }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.error); await expect(c.queryByText('0', { exact: true })).not.toBeInTheDocument();
} };
export const InconsistentTotals: Story = { args: { totals: { captured: 10, awaitingReview: 5, approved: 9 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.error); await expect(c.queryByText('10', { exact: true })).not.toBeInTheDocument();
} };
export const NoIntakeAccess: Story = { args: { canReadIntake: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('link', { name: copy.review })).not.toBeInTheDocument();
} };
export const UnsafeLink: Story = { args: { intakeHref: 'javascript:alert(1)' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.queryByRole('link')).not.toBeInTheDocument(); await expect(c.getByText(copy.reviewUnavailable)).toBeVisible();
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.denied); await expect(c.queryByText(source.name)).not.toBeInTheDocument(); await expect(c.queryByRole('link')).not.toBeInTheDocument();
} };
export const LargeTotals: Story = { args: { totals: { captured: 9007199254740991, awaitingReview: 1234567890, approved: 1234567890123 } } };
export const LongContent: Story = { args: { source: { ...source, name: copy.stories.long.repeat(4), attention: copy.stories.blocked.repeat(5) } } };
