import { useState } from 'react';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { JobLifecycleReport } from './job-lifecycle-report';
import { jobLifecycleViews, type JobLifecycleResult, type JobLifecycleView } from './job-lifecycle-report.validation';
import { jobLifecycleReportData as copy } from './job-lifecycle-report.data';

const jobA = { id: 'job-a', recordId: 'job-a', label: 'Job A / reopened after period',
  cells: { date: 'Oct 10, 2026', status: 'Active', owner: 'Teammate A', service: 'Installation' } };
const jobB = { id: 'job-b', recordId: 'job-b', label: 'Job B / completed',
  cells: { date: 'Oct 7, 2026', status: 'Completed', owner: 'Teammate B', service: 'Repair' } };
const jobC = { id: 'job-c', recordId: 'job-c', label: 'Job C / canceled',
  cells: { date: 'Oct 9, 2026', status: 'Canceled', owner: 'No current primary owner', service: 'Repair' } };
const rows: Record<JobLifecycleView, JobLifecycleResult['rows']> = {
  created: [{ ...jobB, cells: { ...jobB.cells, date: 'Oct 2, 2026' } }, { ...jobC, cells: { ...jobC.cells, date: 'Oct 4, 2026' } }],
  completed: [jobA, jobB], canceled: [jobC],
  reopened: [{ ...jobA, cells: { ...jobA.cells, date: 'Oct 5, 2026' } }],
};
const result: JobLifecycleResult = {
  periodLabel: 'Oct 1 to Oct 31, 2026, both dates included',
  snapshotLabel: 'Nov 5, 2026 at 10:00 / Europe/Warsaw',
  scopeLabel: 'All currently authorized Jobs and lifecycle evidence.',
  counts: { created: 2, completed: 2, canceled: 1, reopened: 1 },
  coverage: { created: { kind: 'complete' }, completed: { kind: 'complete' }, canceled: { kind: 'complete' }, reopened: { kind: 'complete' } },
  evidenceIds: { created: 'created', completed: 'completed', canceled: 'canceled', reopened: 'reopened' },
  selectedView: 'completed', rows: rows.completed, page: 1, pageSize: 25,
};
const meta = {
  title: 'Reports/JobLifecycleReport', component: JobLifecycleReport, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical Jobs period-lifecycle slice composing shared summary, 70/30 dashboard and evidence UI. Fictional authorized responses match discovery J01/J02: created 2, completed 2, canceled 1, reopened 1. Job A completed twice; only Oct 10 appears in the selected October completion projection, despite reopening Nov 2. Hosts own valid-event selection, timestamp/event-ID tie-breaker, authorization/coverage, pagination, shared record/CSV dialogs and queries. No current-stage inference, exclusive breakdown, production API or route. Completion trend/duration and current deadlines are later slices.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-7xl"><Story /></div></main>],
  args: { state: { kind: 'ready', result }, canRead: true, canExport: true, canEdit: true,
    onEvidence: fn(), onRecord: fn(), onExport: fn(), onPageChange: fn(), onPageSizeChange: fn(), onRetry: fn(), onEdit: fn() },
} satisfies Meta<typeof JobLifecycleReport>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: function Render(args) {
    const [selectedView, select] = useState<JobLifecycleView>('completed');
    return <JobLifecycleReport {...args} state={{ kind: 'ready', result: { ...result, selectedView, rows: rows[selectedView] } }}
      onEvidence={id => { args.onEvidence(id); const view = jobLifecycleViews.find(view => view === id); if (view) select(view); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement), summary = within(c.getByRole('region', { name: 'Report summary' }));
    for (const view of jobLifecycleViews) await expect(summary.getByRole('group', { name: copy.labels[view] })).toHaveTextContent(String(result.counts[view]));
    await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
    await expect(c.queryByRole('meter')).not.toBeInTheDocument();
    await expect(c.queryByText('Oct 3, 2026')).not.toBeInTheDocument();
    await expect(c.getAllByText('Oct 10, 2026').some(element => element.textContent === 'Oct 10, 2026')).toBe(true);
    for (const view of jobLifecycleViews) {
      await selectMetricEvidence(canvasElement, copy.labels[view]);
      await expect(args.onEvidence).toHaveBeenLastCalledWith(view);
      await expect(c.getAllByText(`${copy.labels[view]} Jobs`, { exact: true }).some(element => element.tagName === 'P')).toBe(true);
      await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
    }
    await userEvent.click(c.getByRole('button', { name: `View record: ${jobA.label}` }));
    await expect(args.onRecord).toHaveBeenLastCalledWith('job-a');
    await userEvent.click(c.getByRole('button', { name: 'Preview CSV' }));
    await expect(args.onExport).toHaveBeenCalledTimes(1);
    await selectMetricEvidence(canvasElement, 'Completed');
  },
};
export const Created: Story = { args: { state: { kind: 'ready', result: { ...result, selectedView: 'created', rows: rows.created } } } };
export const Canceled: Story = { args: { state: { kind: 'ready', result: { ...result, selectedView: 'canceled', rows: rows.canceled } } } };
export const Reopened: Story = { args: { state: { kind: 'ready', result: { ...result, selectedView: 'reopened', rows: rows.reopened } } } };
export const Help: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await expect(c.queryByText(copy.overlap)).not.toBeInTheDocument();
  const trigger = c.getByRole('button', { name: copy.help });
  trigger.focus(); await userEvent.keyboard('{Enter}');
  const dialog = await body.findByRole('dialog', { name: copy.help });
  await waitFor(() => expect(dialog).toBeVisible());
  for (const text of [copy.overlap, copy.definitions.completed, copy.definitions.reopened, copy.snapshot]) await expect(within(dialog).getByText(text)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
export const IncompleteHistory: Story = { args: { state: { kind: 'ready', result: { ...result,
  coverage: { ...result.coverage, completed: { kind: 'partial', explanation: 'Some authorized Jobs lack valid recorded completion events. Current Completed status cannot reconstruct dates.' } },
} } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getAllByText(/Current Completed status cannot reconstruct dates/)).toHaveLength(2);
  await expect(within(c.getByRole('region', { name: 'Report summary' })).getByRole('group', { name: 'Completed' })).toHaveTextContent('2');
} };
export const Empty: Story = { args: { state: { kind: 'ready', result: { ...result, counts: { created: 0, completed: 0, canceled: 0, reopened: 0 }, rows: [] } } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  for (const view of jobLifecycleViews) await expect(c.getByRole('group', { name: copy.labels[view] })).toHaveTextContent('0');
  await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
export const Loading: Story = { args: { state: { kind: 'loading' } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('group')).not.toBeInTheDocument();
} };
export const Error: Story = { args: { state: { kind: 'error' } }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Retry report' }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('group')).not.toBeInTheDocument();
  await expect(within(canvasElement).queryByText(jobA.label)).not.toBeInTheDocument();
} };
export const ExportDenied: Story = { args: { canExport: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const button of c.getAllByRole('button', { name: /Actions:/ })) {
    await expect(button).toBeDisabled(); await userEvent.click(button);
  }
  await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
  await expect(c.getByRole('button', { name: `View record: ${jobA.label}` })).toBeDisabled();
  await expect(args.onEvidence).not.toHaveBeenCalled();
} };
export const NoNavigationActions: Story = { args: { state: { kind: 'ready', result: { ...result, evidenceIds: {}, rows: rows.completed.map(row => ({ ...row, recordId: undefined })) } } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.queryByRole('button', { name: /Actions:/ })).not.toBeInTheDocument();
  await expect(c.queryByRole('button', { name: /View record:/ })).not.toBeInTheDocument();
} };
export const DuplicateJobEvidence: Story = { args: { state: { kind: 'ready', result: { ...result, rows: [jobA, jobA] } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
  await expect(within(canvasElement).queryByRole('group')).not.toBeInTheDocument();
} };
export const InvalidCounts: Story = { args: { state: { kind: 'ready', result: { ...result, counts: { ...result.counts, created: Number.MAX_SAFE_INTEGER + 1 } } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
} };
export const MissingDatedEvidence: Story = { args: { state: { kind: 'ready', result: { ...result, rows: rows.completed.map(row => ({ ...row, cells: { ...row.cells, date: null } })) } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
} };
export const PaginatedEvidence: Story = { args: { state: { kind: 'ready', result: { ...result, counts: { ...result.counts, completed: 26 }, page: 2, rows: [jobA] } } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: 'Go to page 1' }));
  await expect(args.onPageChange).toHaveBeenLastCalledWith(1);
} };
export const SummaryFirst: Story = { args: { dashboard: false } };
export const LongContent: Story = { args: { state: { kind: 'ready', result: { ...result,
  scopeLabel: 'Authorized-Job-scope-'.repeat(25), rows: rows.completed.map(row => ({ ...row, label: `${row.label} ${'Job-description-'.repeat(15)}` })),
} } } };
