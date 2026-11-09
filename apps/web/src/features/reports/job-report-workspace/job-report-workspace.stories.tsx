import { useState } from 'react';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { jobStatuses } from '@salesmora/contracts';
import { jobStatusBadgeData } from '../../jobs/job-status-badge/job-status-badge.data';
import { workloadRows, workloadResult } from '../job-workload-report/job-workload-report.fixtures';
import type { JobReportFiltersValue } from '../job-report-filters/job-report-filters';
import { JobReportWorkspace, jobReportViews, type JobReportView } from './job-report-workspace';
import { jobWorkspaceResponse as response } from './job-report-workspace.fixtures';

const empty: JobReportFiltersValue = { statuses: [], owners: [], services: [] };
const options = {
  statuses: jobStatuses.map(value => ({ value, label: jobStatusBadgeData[value].label })),
  owners: workloadResult.groups.owner.map(group => ({ value: group.id, label: group.label })),
  services: workloadResult.groups.service.map(group => ({ value: group.id, label: group.label })),
};
const currentOptions = { ...options, statuses: options.statuses.slice(0, 4) };
const meta = {
  title: 'Reports/JobReportWorkspace', component: JobReportWorkspace, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical composition of approved period lifecycle, completion calendar/elapsed days and current workload/deadlines. Same approved UI and responsive layouts, one selected evidence table, authorized view selector and Jobs dropdown filters. Mock host replaces filtered projections, resets evidence pagination on view/filter changes, and restores separate period/current drafts. Current facets never infer dated lifecycle events. Hosts own grants, dates, queries, cancellation, record/CSV dialogs and persistence; no production reporting route/API.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-7xl"><Story /></div></main>],
  args: { projection: response('lifecycle', empty), availableViews: jobReportViews,
    filters: { period: empty, current: empty }, filterOptions: options, canRead: true, canReadCurrent: true, canExport: true, canEdit: true,
    onViewChange: fn(), onFiltersChange: fn(), onRetryFilters: fn(), onEvidence: fn(), onRecord: fn(), onExport: fn(),
    onPageChange: fn(), onPageSizeChange: fn(), onRetry: fn(), onEdit: fn() },
} satisfies Meta<typeof JobReportWorkspace>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: function Render(args) {
    const [view, setView] = useState<JobReportView>('lifecycle');
    const [filters, setFilters] = useState(args.filters);
    const [evidence, setEvidence] = useState<string>();
    const [pagination, setPagination] = useState({ page: 1, pageSize: 25 });
    const context = view === 'workload' ? 'current' : 'period';
    return <JobReportWorkspace {...args} projection={response(view, filters[context], evidence, pagination.page, pagination.pageSize)}
      filters={filters} filterOptions={context === 'current' ? currentOptions : options}
      onViewChange={view => { args.onViewChange(view); setView(view); setEvidence(undefined); setPagination(current => ({ ...current, page: 1 })); }}
      onFiltersChange={(context, value) => {
        args.onFiltersChange(context, value); setFilters(current => ({ ...current, [context]: value }));
        setEvidence(undefined); setPagination(current => ({ ...current, page: 1 }));
      }}
      onEvidence={id => { args.onEvidence(id); setEvidence(id); setPagination(current => ({ ...current, page: 1 })); }}
      onPageChange={page => { args.onPageChange(page); setPagination(current => ({ ...current, page })); }}
      onPageSizeChange={pageSize => { args.onPageSizeChange(pageSize); setPagination({ page: 1, pageSize }); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    const selectView = async (view: JobReportView) => {
      await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), view);
      await expect(args.onViewChange).toHaveBeenLastCalledWith(view);
      await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
    };
    await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
    await selectMetricEvidence(canvasElement, 'Reopened');
    await expect(c.getByRole('button', { name: 'View record: D0 / overdue repair' })).toBeVisible();
    await selectView('completion');
    const summary = () => within(c.getByRole('region', { name: 'Report summary' }));
    await expect(summary().getByRole('group', { name: 'Average elapsed calendar days' })).toHaveTextContent('7.5 days');
    await userEvent.click(c.getByRole('button', { name: /View supporting evidence: 12 Oct 2026/ }));
    await expect(c.getByRole('button', { name: 'View record: D0 / overdue repair' })).toBeVisible();
    await expect(c.queryByRole('button', { name: 'View record: Completed installation' })).not.toBeInTheDocument();
    await expect(summary().getByRole('group', { name: 'Average elapsed calendar days' })).toHaveTextContent('7.5 days');
    await userEvent.click(c.getByRole('button', { name: 'View record: D0 / overdue repair' }));
    await expect(args.onRecord).toHaveBeenLastCalledWith('d0');
    await userEvent.click(c.getByRole('button', { name: 'Preview CSV' }));
    await expect(args.onExport).toHaveBeenCalledTimes(1);
    await userEvent.click(c.getByRole('combobox', { name: 'Current status' }));
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.click(await body.findByRole('option', { name: 'Completed' }));
    await userEvent.keyboard('{Escape}');
    await expect(args.onFiltersChange).toHaveBeenLastCalledWith('period', { ...empty, statuses: ['completed'] });
    await expect(c.queryByRole('button', { name: 'View record: D0 / overdue repair' })).not.toBeInTheDocument();
    await expect(summary().getByRole('group', { name: 'Completed Jobs' })).toHaveTextContent('1');
    await selectView('workload');
    await expect(summary().getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('5');
    await expect(c.queryByRole('button', { name: 'Remove filter: Current status: Completed' })).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('combobox', { name: 'Current primary owner' }));
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.click(await body.findByRole('option', { name: 'No current primary owner' }));
    await userEvent.keyboard('{Escape}');
    await expect(args.onFiltersChange).toHaveBeenLastCalledWith('current', { ...empty, owners: ['unassigned'] });
    await expect(summary().getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('1');
    await expect(c.getByRole('button', { name: 'View record: D3 / no deadline or primary owner' })).toBeVisible();
    await selectView('lifecycle');
    await expect(c.getByRole('button', { name: 'Remove filter: Current status: Completed' })).toBeVisible();
    await expect(c.queryByRole('button', { name: 'Remove filter: Current primary owner: No current primary owner' })).not.toBeInTheDocument();
    await selectView('workload');
    await expect(summary().getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('1');
    await userEvent.click(c.getByRole('button', { name: 'Clear all' }));
    await expect(summary().getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('5');
    await userEvent.click(c.getByRole('button', { name: 'View supporting evidence: Waiting on materials' }));
    await expect(args.onEvidence).toHaveBeenLastCalledWith('waitingReason:materials');
    await expect(c.getByRole('button', { name: 'View record: D2 / Waiting at due-soon boundary' })).toBeVisible();
    await selectView('completion');
    await userEvent.click(c.getByRole('button', { name: 'Clear all' }));
  },
};
export const Completion: Story = { args: { projection: response('completion', empty) } };
export const Workload: Story = { args: { projection: response('workload', empty), filterOptions: currentOptions } };
export const Loading: Story = { args: { projection: { view: 'lifecycle', state: { kind: 'loading' } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
} };
export const Error: Story = { args: { projection: { view: 'completion', state: { kind: 'error' } } }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Retry report' }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.queryByRole('combobox')).not.toBeInTheDocument();
  await expect(c.queryByRole('region', { name: 'Report summary' })).not.toBeInTheDocument();
} };
export const CurrentRevoked: Story = { args: { projection: response('workload', empty), filterOptions: currentOptions, canReadCurrent: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('option', { name: 'Current workload and deadlines' })).toBeDisabled();
  await expect(c.queryByRole('region', { name: 'Report summary' })).not.toBeInTheDocument();
  await expect(c.queryByText('Teammate A')).not.toBeInTheDocument();
} };
export const PeriodWithCurrentRevoked: Story = { args: { canReadCurrent: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('region', { name: 'Supporting evidence' })).toBeVisible();
  await expect(c.getByRole('option', { name: 'Current workload and deadlines' })).toBeDisabled();
} };
export const UnavailableView: Story = { args: { availableViews: ['lifecycle'], projection: response('completion', empty) }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('option', { name: 'Unavailable saved view' })).toBeDisabled();
  await expect(within(canvasElement).queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
} };
export const DuplicateViews: Story = { args: { availableViews: ['lifecycle', 'lifecycle'] }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
  await expect(within(canvasElement).getByRole('combobox', { name: 'Report view' })).toBeDisabled();
} };
export const InvalidSavedFilters: Story = { args: { filters: { period: { ...empty, owners: ['hidden-member'] }, current: empty } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toBeVisible();
  await expect(c.queryByText(/hidden-member/)).not.toBeInTheDocument();
  await expect(c.queryByRole('region', { name: 'Report summary' })).not.toBeInTheDocument();
} };
export const CorrectSavedFilters: Story = { render: Default.render,
  args: { filters: { period: { ...empty, owners: ['hidden-member'] }, current: empty } },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Remove filter: Current primary owner: Unavailable saved selection' }));
    await expect(args.onFiltersChange).toHaveBeenLastCalledWith('period', empty);
    await expect(c.getByRole('region', { name: 'Supporting evidence' })).toBeVisible();
  },
};
export const FilterIntersection: Story = { render: Default.render, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'workload');
  const choose = async (facet: string, labels: readonly string[]) => {
    await userEvent.click(c.getByRole('combobox', { name: facet }));
    await userEvent.keyboard('{ArrowDown}');
    for (const label of labels) await userEvent.click(await body.findByRole('option', { name: label }));
    await userEvent.keyboard('{Escape}');
  };
  await choose('Current status', ['Scheduled', 'In Progress']);
  await choose('Current service', ['Repair']);
  const summary = () => within(c.getByRole('region', { name: 'Report summary' }));
  await expect(summary().getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('2');
  await choose('Current primary owner', ['Teammate B']);
  await expect(args.onFiltersChange).toHaveBeenLastCalledWith('current', {
    statuses: ['scheduled', 'in-progress'], owners: ['member:member-b'], services: ['repair'],
  });
  await expect(summary().getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('0');
  await expect(c.queryByRole('button', { name: /View record:/ })).not.toBeInTheDocument();
  await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
export const InvalidCurrentStatus: Story = { args: { projection: response('workload', empty), filterOptions: currentOptions,
  filters: { period: empty, current: { ...empty, statuses: ['completed'] } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
  await expect(within(canvasElement).queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
} };
export const InactiveDraftDoesNotBlock: Story = { args: { filters: { period: empty, current: { ...empty, statuses: ['completed'] } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('region', { name: 'Supporting evidence' })).toBeVisible();
} };
export const FiltersLoading: Story = { args: { filterState: 'loading' }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('region', { name: 'Report summary' })).not.toBeInTheDocument();
} };
export const FiltersError: Story = { args: { filterState: 'error' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: 'Retry filters' }));
  await expect(args.onRetryFilters).toHaveBeenCalledTimes(1);
} };
export const InvalidFilterOptions: Story = { args: { filterOptions: { statuses: [{ value: 'in_progress', label: 'Invalid token' }] } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('alert')).toBeVisible();
    await expect(within(canvasElement).queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
  },
};
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const select of c.getAllByRole('combobox')) await expect(select).toBeDisabled();
  await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
  for (const button of c.getAllByRole('button', { name: /Actions:|View supporting evidence:|View record:/ })) await expect(button).toBeDisabled();
  await expect(args.onViewChange).not.toHaveBeenCalled();
} };
export const ExportDenied: Story = { args: { canExport: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
export const PendingCompletion: Story = { args: { projection: response('completion', empty), pending: true }, play: Pending.play };
export const PendingWorkload: Story = { args: { projection: response('workload', empty), filterOptions: currentOptions, pending: true }, play: Pending.play };
export const PaginationAndReset: Story = {
  render: function Render(args) {
    const [view, setView] = useState<JobReportView>('workload');
    const [filters, setFilters] = useState(args.filters);
    const [evidence, setEvidence] = useState<string>();
    const [pagination, setPagination] = useState({ page: 1, pageSize: 2 });
    const context = view === 'workload' ? 'current' : 'period';
    return <JobReportWorkspace {...args} projection={response(view, filters[context], evidence, pagination.page, pagination.pageSize)}
      filters={filters} filterOptions={context === 'current' ? currentOptions : options}
      onViewChange={view => { args.onViewChange(view); setView(view); setEvidence(undefined); setPagination(current => ({ ...current, page: 1 })); }}
      onFiltersChange={(context, value) => {
        args.onFiltersChange(context, value); setFilters(current => ({ ...current, [context]: value }));
        setEvidence(undefined); setPagination(current => ({ ...current, page: 1 }));
      }}
      onEvidence={id => { args.onEvidence(id); setEvidence(id); setPagination(current => ({ ...current, page: 1 })); }}
      onPageChange={page => { args.onPageChange(page); setPagination(current => ({ ...current, page })); }}
      onPageSizeChange={pageSize => { args.onPageSizeChange(pageSize); setPagination({ page: 1, pageSize }); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(2);
    await expect(c.getByRole('button', { name: 'View record: D2 / Waiting at due-soon boundary' })).toBeVisible();
    await selectMetricEvidence(canvasElement, 'Active Jobs');
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
    await userEvent.click(c.getByRole('combobox', { name: 'Current service' }));
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.click(await body.findByRole('option', { name: 'Repair' }));
    await userEvent.keyboard('{Escape}');
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Clear all' }));
    await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'lifecycle');
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Rows per page' }), '25');
    await expect(args.onPageSizeChange).toHaveBeenLastCalledWith(25);
  },
};
export const Help: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const trigger = c.getByRole('button', { name: 'About Jobs report workspace' });
  trigger.focus(); await userEvent.keyboard('{Enter}');
  const dialog = await body.findByRole('dialog', { name: 'About Jobs report workspace' });
  await waitFor(() => expect(dialog).toBeVisible());
  await expect(within(dialog).getByText(/Period and current filter drafts remain separate/)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
export const EmptyCompletion: Story = { args: { projection: response('completion', { ...empty, statuses: ['waiting'] }),
  filters: { period: { ...empty, statuses: ['waiting'] }, current: empty } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
export const InvalidWorkloadEvidence: Story = { args: { projection: { view: 'workload', state: { kind: 'ready', result: {
  ...workloadResult, rows: [{ ...workloadRows[0]!, status: 'completed' }, ...workloadRows.slice(1)],
} } }, filterOptions: currentOptions }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
  await expect(within(canvasElement).queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
} };
