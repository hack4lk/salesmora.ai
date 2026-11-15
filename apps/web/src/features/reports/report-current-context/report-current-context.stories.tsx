import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ReportCurrentContext } from './report-current-context';
import { reportCurrentContextData as copy } from './report-current-context.data';

const snapshot = {
  label: 'Current active Jobs', count: 8,
  description: 'Active Jobs in the current authorized scope, regardless of creation date. Archived Jobs are excluded.',
  snapshotLabel: 'Nov 5, 2026 at 10:00 / Europe/Warsaw',
  scopeLabel: 'All authorized assignments. Period-result assignment and group filters do not apply.',
  evidenceId: 'active-jobs',
};
const meta = {
  title: 'Reports/ReportCurrentContext', component: ReportCurrentContext, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Separate current-snapshot context from the connected prototype, composing shared MetricCard. Fictional host-supplied counts only. The host must query current authorization independently of period rows, identify the precise scope and snapshot timezone/time, and omit unauthorized evidence references. No historical workload reconstruction, aggregation or API. Loading/error/denied states do not render snapshot data.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="max-w-3xl"><Story /></div></main>],
  args: { state: { kind: 'ready', snapshot }, canRead: true, onRetry: fn(), onEvidence: fn() },
} satisfies Meta<typeof ReportCurrentContext>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByText(copy.mode)).toBeVisible();
  await expect(c.queryByText(snapshot.scopeLabel)).not.toBeInTheDocument();
  await expect(c.getByText('8', { exact: true })).toBeVisible();
  await selectMetricEvidence(canvasElement, snapshot.label);
  await expect(args.onEvidence).toHaveBeenCalledWith('active-jobs');
} };
export const CalendarQueue: Story = { args: { state: { kind: 'ready', snapshot: { ...snapshot, label: 'Unscheduled visits', count: 3, description: 'Unscheduled visits have no visit date to filter. Canonical visits are counted once.', evidenceId: 'unscheduled-visits' } } } };
export const AssignedScope: Story = { args: { state: { kind: 'ready', snapshot: { ...snapshot, scopeLabel: 'Assigned to me only. Archived Jobs excluded.', count: 2 } } } };
export const Zero: Story = { args: { state: { kind: 'ready', snapshot: { ...snapshot, count: 0 } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText('0', { exact: true })).toBeVisible();
} };
export const Loading: Story = { args: { state: { kind: 'loading' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent(copy.loading);
  await expect(c.queryByRole('group')).not.toBeInTheDocument();
} };
export const Error: Story = { args: { state: { kind: 'error' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.failed);
  await expect(c.queryByRole('group')).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: copy.retry }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.denied);
  await expect(c.queryByText(snapshot.scopeLabel)).not.toBeInTheDocument();
  await expect(c.queryByRole('group')).not.toBeInTheDocument();
} };
export const NoEvidenceAccess: Story = { args: { state: { kind: 'ready', snapshot: { ...snapshot, evidenceId: undefined } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('button', { name: `Actions: ${snapshot.label}` })).not.toBeInTheDocument();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('button', { name: `Actions: ${snapshot.label}` })).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: `Actions: ${snapshot.label}` }));
  await expect(args.onEvidence).not.toHaveBeenCalled();
  await expect(c.getByRole('button', { name: copy.help })).toBeEnabled();
} };
export const Explanation: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const trigger = c.getByRole('button', { name: copy.help });
  trigger.focus();
  await userEvent.keyboard('{Enter}');
  const dialog = await body.findByRole('dialog', { name: copy.help });
  await waitFor(() => expect(dialog).toBeVisible());
  await expect(within(dialog).getByText(copy.description)).toBeVisible();
  await expect(within(dialog).getByText(snapshot.scopeLabel)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
export const LongContent: Story = { args: { state: { kind: 'ready', snapshot: { ...snapshot, label: 'Current-workload-label-'.repeat(20), scopeLabel: 'Authorized-current-scope-'.repeat(30) } } } };
