import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ReportSummary, type ReportSummaryMetric } from './report-summary';
import { selectMetricEvidence } from './report-summary.story-helpers';
import { reportSummaryData as copy } from './report-summary.data';

const metrics: readonly ReportSummaryMetric[] = [
  { id: 'intake', label: 'New leads', value: { kind: 'count', value: 12 }, dateBasisLabel: 'Lead creation date / Oct 7 to Nov 5, 2026, both dates included.', description: 'Leads created in the selected period.', evidenceId: 'lead-intake' },
  { id: 'accepted', label: 'Accepted sales value', value: { kind: 'formatted', displayValue: 'PLN 24,000.00' }, dateBasisLabel: 'Effective decision date / Oct 7 to Nov 5, 2026, both dates included.', description: 'Frozen accepted pre-tax values, not paid revenue.', evidenceId: 'accepted-estimates' },
  { id: 'active', label: 'Current active Jobs', value: { kind: 'count', value: 8 }, dateBasisLabel: 'Current snapshot / not filtered by reporting period.', description: 'Current active Jobs in your authorized scope.', evidenceId: 'active-jobs' },
];
const meta = {
  title: 'Reports/ReportSummary',
  component: ReportSummary,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical ready-result summary composing shared MetricCard, not a second metric renderer. Fictional host-supplied results only; no aggregation or API. Each metric states its fixed date basis, scope and limitations. Host-formatted currency/percentages and explicit unavailable/incomplete states never infer zero. Hosts must supply same-snapshot authorized metrics, matching evidence projections and safe explanations, and replace the entire summary with ReportResultState on load/error/access loss. Evidence buttons are navigation requests, not filter toggles.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="max-w-6xl"><Story /></div></main>],
  args: { metrics, canRead: true, snapshotLabel: 'Snapshot: Nov 5, 2026 at 10:00 / Europe/Warsaw', scopeLabel: 'Workspace scope within underlying grants. Archived records excluded.', onEvidence: fn() },
} satisfies Meta<typeof ReportSummary>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getAllByRole('group')).toHaveLength(3);
  await expect(c.getByText('PLN 24,000.00')).toBeVisible();
  for (const metric of metrics) {
    await expect(c.queryByText(`${metric.description} ${metric.dateBasisLabel}`)).not.toBeInTheDocument();
    await selectMetricEvidence(canvasElement, metric.label);
    await expect(args.onEvidence).toHaveBeenLastCalledWith(metric.evidenceId);
  }
} };
export const Zero: Story = { args: { metrics: [{ ...metrics[0], value: { kind: 'count', value: 0 } }] }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByText('0', { exact: true })).toBeVisible();
  await expect(c.queryByRole('status')).not.toBeInTheDocument();
} };
export const Unavailable: Story = { args: { metrics: [{ ...metrics[0], value: { kind: 'unavailable', reason: 'No decided estimates; acceptance percentage has no denominator.' }, evidenceId: undefined }] }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toBeVisible();
  await expect(c.getByText('No decided estimates; acceptance percentage has no denominator.')).toBeVisible();
  await expect(c.queryByText('0', { exact: true })).not.toBeInTheDocument();
  await expect(c.queryByRole('button', { name: /^Actions:/ })).not.toBeInTheDocument();
} };
export const IncompleteCosts: Story = { args: { metrics: [{
  id: 'cost', label: 'Known material cost subtotal', value: { kind: 'incomplete', displayValue: 'PLN 0.00', coverageLabel: '2 known / 3 lines. One cost is unknown; this is not a complete cost total.' },
  description: 'Recorded material costs, not actual job profitability. A saved zero is genuine zero.', dateBasisLabel: 'Current snapshot / not filtered by reporting period.', evidenceId: 'materials',
}] }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByText('PLN 0.00')).toBeVisible();
  await expect(c.getByText('2 known / 3 lines. One cost is unknown; this is not a complete cost total.')).toBeVisible();
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.denied);
  await expect(c.queryByRole('group')).not.toBeInTheDocument();
  await expect(c.queryByText('PLN 24,000.00')).not.toBeInTheDocument();
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const NoEvidenceAccess: Story = { args: { metrics: metrics.map(metric => ({ ...metric, evidenceId: undefined })) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getAllByRole('group')).toHaveLength(3);
  await expect(c.queryByRole('button', { name: /^Actions:/ })).not.toBeInTheDocument();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent(copy.pending);
  for (const button of c.getAllByRole('button', { name: /^Actions:/ })) {
    await expect(button).toBeDisabled();
    await userEvent.click(button);
  }
  await expect(args.onEvidence).not.toHaveBeenCalled();
  await expect(c.getByRole('button', { name: 'About metric: New leads' })).toBeEnabled();
} };
export const KeyboardEvidence: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  const trigger = c.getByRole('button', { name: `Actions: ${metrics[0].label}` });
  trigger.focus();
  await userEvent.keyboard('{Enter}');
  const body = within(canvasElement.ownerDocument.body);
  await body.findByRole('menuitem', { name: copy.evidence });
  await userEvent.keyboard('{Enter}');
  await expect(args.onEvidence).toHaveBeenCalledWith('lead-intake');
  await waitFor(() => expect(body.queryByRole('menuitem')).not.toBeInTheDocument());
  await waitFor(() => expect(trigger).toHaveFocus());
  await userEvent.tab();
  await expect(c.getByRole('button', { name: 'About metric: Accepted sales value' })).toHaveFocus();
  await userEvent.tab();
  await expect(c.getByRole('button', { name: `Actions: ${metrics[1].label}` })).toHaveFocus();
} };
export const Empty: Story = { args: { metrics: [] }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(copy.empty)).toBeVisible();
} };
export const MetricTooltips: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  for (const metric of metrics) {
    const trigger = c.getByRole('button', { name: `About metric: ${metric.label}` });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    const dialog = await body.findByRole('dialog', { name: `About metric: ${metric.label}` });
    await waitFor(() => expect(dialog).toBeVisible());
    await expect(within(dialog).getByText(`${metric.description} ${metric.dateBasisLabel}`)).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  }
  await expect(args.onEvidence).not.toHaveBeenCalled();
} };
export const LongContent: Story = { args: { metrics: [{ ...metrics[0], label: 'Long-metric-label-'.repeat(12), description: 'Authorized-metric-definition-'.repeat(20), value: { kind: 'formatted', displayValue: 'PLN 123,456,789,012.00' } }], scopeLabel: 'Authorized-scope-'.repeat(30) } };
