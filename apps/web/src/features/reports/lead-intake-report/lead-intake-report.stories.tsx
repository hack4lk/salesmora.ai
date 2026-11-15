import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';
import { expect, fn, userEvent, within } from 'storybook/test';
import { LeadIntakeReport } from './lead-intake-report';
import { useState } from 'react';
import { intakeTrendSpans } from '../report-intake-trend/report-intake-trend.validation';
import { LeadReportFilters, type LeadReportFiltersValue } from '../lead-report-filters/lead-report-filters';

const result = {
  periodLabel: 'Oct 7 to Nov 5, 2026, both dates included',
  snapshotLabel: 'Nov 5, 2026 at 10:00 / Europe/Warsaw',
  scopeLabel: 'All authorized assignments. Authorized archives included in intake.',
  total: 2, sources: [{ id: 'referral', label: 'Referral', count: 1, evidenceId: 'referral' }, { id: 'phone', label: 'Phone', count: 1, evidenceId: 'phone' }],
  rows: [
    { id: 'l1', label: 'Kitchen inquiry', recordId: 'lead-1', cells: { created: 'Oct 12, 2026', assignment: 'Me', source: 'Referral' } },
    { id: 'l2', label: 'Hallway repair', recordId: 'lead-2', cells: { created: 'Oct 25, 2026', assignment: 'Teammate A', source: 'Phone' } },
  ],
  page: 1, pageSize: 25, evidenceId: 'intake',
};
const snapshot = {
  label: 'Current open pipeline', count: 3,
  description: 'Current New, Contacted and Estimate sent leads. Won/Lost and archives excluded. Not limited to recently created leads.',
  snapshotLabel: result.snapshotLabel, scopeLabel: 'All authorized assignments; independent of intake filters.', evidenceId: 'open-pipeline',
};
const meta = {
  title: 'Reports/LeadIntakeReport', component: LeadIntakeReport, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'First Leads report slice composing approved summary, breakdown, current-context and evidence components. Fictional host-supplied creation-cohort data; no page/API or parallel preview UI. Current open pipeline is independently scoped, excludes archives and includes New/Contacted/Estimate sent only. Intake archive inclusion follows current grants. Hosts must provide complete same-snapshot group totals and paginated evidence. Won/Lost transitions, inactivity and lead-to-job conversion remain separate upcoming slices.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="max-w-6xl"><Story /></div></main>],
  args: { state: { kind: 'ready', result }, current: { kind: 'ready', snapshot }, canRead: true, canReadCurrent: true, canExport: true, canEdit: true,
    onEvidence: fn(), onRecord: fn(), onExport: fn(), onPageChange: fn(), onPageSizeChange: fn(), onRetry: fn(), onRetryCurrent: fn(), onEdit: fn() },
} satisfies Meta<typeof LeadIntakeReport>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(within(c.getByRole('region', { name: 'Report summary' })).getByRole('group', { name: 'New leads' })).toHaveTextContent('2');
  await expect(c.getByRole('group', { name: 'Current open pipeline' })).toHaveTextContent('3');
  await selectMetricEvidence(canvasElement, 'New leads');
  await expect(args.onEvidence).toHaveBeenCalledWith('intake');
  await userEvent.click(c.getByRole('button', { name: 'View supporting evidence: Referral' }));
  await expect(args.onEvidence).toHaveBeenLastCalledWith('referral');
  await selectMetricEvidence(canvasElement, 'Current open pipeline');
  await expect(args.onEvidence).toHaveBeenLastCalledWith('open-pipeline');
  await userEvent.click(c.getByRole('button', { name: 'Preview CSV' }));
  await expect(args.onExport).toHaveBeenCalledTimes(1);
} };
export const EmptyIntakeCurrentPipeline: Story = { args: { state: { kind: 'ready', result: { ...result, total: 0, sources: [], rows: [] } } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(within(c.getByRole('region', { name: 'Report summary' })).getByRole('group', { name: 'New leads' })).toHaveTextContent('0');
  await expect(c.getByRole('group', { name: 'Current open pipeline' })).toHaveTextContent('3');
  await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
export const Loading: Story = { args: { state: { kind: 'loading' } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByText('Kitchen inquiry')).not.toBeInTheDocument();
  await expect(within(canvasElement).queryByRole('group')).not.toBeInTheDocument();
} };
export const Error: Story = { args: { state: { kind: 'error' } }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Retry report' }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('group')).not.toBeInTheDocument();
} };
export const CurrentDenied: Story = { args: { canReadCurrent: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(within(c.getByRole('region', { name: 'Report summary' })).getByRole('group', { name: 'New leads' })).toBeVisible();
  await expect(c.queryByRole('group', { name: 'Current open pipeline' })).not.toBeInTheDocument();
} };
export const CurrentError: Story = { args: { current: { kind: 'error' } }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Try again' }));
  await expect(args.onRetryCurrent).toHaveBeenCalledTimes(1);
} };
export const ExportDenied: Story = { args: { canExport: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
export const InvalidReconciliation: Story = { args: { state: { kind: 'ready', result: { ...result, total: 3 } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
  await expect(within(canvasElement).queryByRole('group')).not.toBeInTheDocument();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
const trendRange = { from: '2026-10-07', to: '2026-11-05' };
const fixtures = [
  { row: result.rows[0]!, created: '2026-10-12', stage: 'new', owner: 'me', source: 'referral' },
  { row: result.rows[1]!, created: '2026-10-25', stage: 'contacted', owner: 'member-a', source: 'phone' },
];
export const TrendAndFilters: Story = {
  render: function Render(args) {
    const [filters, setFilters] = useState<LeadReportFiltersValue>({ stages: [], owners: [], sources: [] });
    const [selectedBucket, selectBucket] = useState<string>();
    const authorized = fixtures.filter(item => (filters.stages.length === 0 || filters.stages.includes(item.stage)) &&
      (filters.owners.length === 0 || filters.owners.includes(item.owner)) &&
      (filters.sources.length === 0 || filters.sources.includes(item.source)));
    const buckets = intakeTrendSpans(trendRange)!.spans.map(span => ({ ...span,
      count: authorized.filter(item => item.created >= span.from && item.created <= span.to).length, evidenceId: `trend:${span.from}`,
    }));
    const matching = selectedBucket ? authorized.filter(item => item.created === selectedBucket) : authorized;
    return <div className="grid min-w-0 gap-6">
      <LeadReportFilters context="period" canRead={args.canRead} pending={args.pending} value={filters}
        options={{
          stages: [{ value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' }],
          owners: [{ value: 'me', label: 'Me' }, { value: 'member-a', label: 'Teammate A' }],
          sources: [{ value: 'referral', label: 'Referral' }, { value: 'phone', label: 'Phone' }],
        }}
        onRetry={args.onRetry} onChange={next => { setFilters(next); selectBucket(undefined); }} />
      <LeadIntakeReport {...args} state={{ kind: 'ready', result: { ...result,
        scopeLabel: 'Authorized period-result filters applied. Current pipeline remains independently scoped.',
        total: authorized.length, sources: result.sources.map(source => ({ ...source, count: authorized.filter(item => item.source === source.id).length })),
        rows: matching.map(item => item.row), trend: { range: trendRange, buckets }, selectedTrendBucket: selectedBucket,
      } }} onEvidence={id => { args.onEvidence(id); selectBucket(id.startsWith('trend:') ? id.slice(6) : undefined); }} />
    </div>;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'View supporting evidence: 12 Oct 2026' }));
    await expect(args.onEvidence).toHaveBeenLastCalledWith('trend:2026-10-12');
    await expect(c.queryByRole('button', { name: 'View record: Hallway repair' })).not.toBeInTheDocument();
    await expect(c.getByRole('button', { name: 'View record: Kitchen inquiry' })).toBeVisible();
    await userEvent.click(c.getByRole('combobox', { name: 'Current source' }));
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.click(await within(canvasElement.ownerDocument.body).findByRole('option', { name: 'Referral' }));
    await userEvent.keyboard('{Escape}');
    await expect(within(c.getByRole('region', { name: 'Report summary' })).getByRole('group', { name: 'New leads' })).toHaveTextContent('1');
    await expect(c.getByRole('group', { name: 'Current open pipeline' })).toHaveTextContent('3');
    await userEvent.click(c.getByRole('button', { name: 'View supporting evidence: 7 Oct 2026' }));
    await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
    await userEvent.click(c.getByRole('button', { name: 'Clear all' }));
    await expect(within(c.getByRole('region', { name: 'Report summary' })).getByRole('group', { name: 'New leads' })).toHaveTextContent('2');
  },
};
export const InvalidTrendSelection: Story = { args: { state: { kind: 'ready', result: { ...result, selectedTrendBucket: '2026-10-12' } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
} };
