import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import type { TeamReportFiltersValue } from '../team-report-filters/team-report-filters';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';
import { TeamReportWorkspace, teamReportViews, type TeamReportProjection } from './team-report-workspace';
import { teamMemberOptions, teamWorkspaceResponse } from './team-report-workspace.fixtures';
import { teamLeadsResult } from '../team-leads-report/team-leads-report.fixtures';

const empty: TeamReportFiltersValue = { members: [] };
const workspace = { kind: 'workspace' } as const;
const assigned = { kind: 'assigned', currentMemberId: 'member-a' } as const;
const meta = {
  title: 'Reports/TeamReportWorkspace', component: TeamReportWorkspace, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical composition of approved Team Leads, Team Jobs and member filters. Both views use current authorized records. Member filters persist across views; mock hosts replace distinct matching aggregates/evidence and reset pagination on view/filter/evidence changes. Shared Jobs retain authorized counterpart cards, not duplicate overall counts. Self-only assigned projections withhold unrelated identities. Filter snapshots, scope, roster and observed evidence must match; invalid/unavailable/loading filter states suppress stale results. One evidence table, host-owned record/CSV actions; no production routes or APIs.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-6xl"><Story /></div></main>],
  args: { projection: teamWorkspaceResponse('leads', empty), availableViews: teamReportViews, filters: empty, filterOptions: teamMemberOptions,
    scope: workspace, canRead: true, canReadCurrent: true, canExport: true, canEdit: true,
    onViewChange: fn(), onFiltersChange: fn(), onRetryFilters: fn(), onEvidence: fn(), onRecord: fn(), onExport: fn(),
    onPageChange: fn(), onPageSizeChange: fn(), onRetry: fn(), onEdit: fn() },
} satisfies Meta<typeof TeamReportWorkspace>;
export default meta;
type Story = StoryObj<typeof meta>;

async function chooseMember(canvasElement: HTMLElement, label: string) {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('combobox', { name: 'Current member' }));
  await userEvent.keyboard('{ArrowDown}');
  const option = await body.findByRole('option', { name: label });
  await waitFor(() => expect(option).toBeVisible());
  await userEvent.click(option);
  await userEvent.keyboard('{Escape}');
}
const summary = (canvasElement: HTMLElement) => within(within(canvasElement).getByRole('region', { name: 'Report summary' }));
async function noResults(canvasElement: HTMLElement) {
  const c = within(canvasElement);
  await expect(c.queryByRole('region', { name: 'Report summary' })).not.toBeInTheDocument();
  await expect(c.queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
}

export const Default: Story = {
  render: function Render(args) {
    const [projection, setProjection] = useState<TeamReportProjection>(args.projection);
    const [filters, setFilters] = useState<TeamReportFiltersValue>(args.filters);
    const [evidence, setEvidence] = useState<string>();
    const [pageSize, setPageSize] = useState(args.projection.state.kind === 'ready' ? args.projection.state.result.pageSize : 25);
    return <TeamReportWorkspace {...args} projection={projection} filters={filters}
      onViewChange={view => {
        args.onViewChange(view); setEvidence(undefined);
        setProjection(teamWorkspaceResponse(view, filters, args.scope, undefined, 1, pageSize));
      }}
      onFiltersChange={value => {
        args.onFiltersChange(value); setFilters(value); setEvidence(undefined);
        setProjection(teamWorkspaceResponse(projection.view, value, args.scope, undefined, 1, pageSize));
      }}
      onEvidence={id => {
        args.onEvidence(id); setEvidence(id);
        setProjection(teamWorkspaceResponse(projection.view, filters, args.scope, id, 1, pageSize));
      }}
      onPageChange={page => {
        args.onPageChange(page);
        setProjection(teamWorkspaceResponse(projection.view, filters, args.scope, evidence, page, pageSize));
      }}
      onPageSizeChange={size => {
        args.onPageSizeChange(size); setPageSize(size);
        setProjection(teamWorkspaceResponse(projection.view, filters, args.scope, evidence, 1, size));
      }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
    await expect(summary(canvasElement).getByRole('group', { name: 'Open Leads' })).toHaveTextContent('4');
    await chooseMember(canvasElement, 'Blair');
    await expect(args.onFiltersChange).toHaveBeenLastCalledWith({ members: ['member-b'] });
    await expect(summary(canvasElement).getByRole('group', { name: 'Open Leads' })).toHaveTextContent('1');
    await expect(c.getByRole('button', { name: 'View record: Estimate at cutoff' })).toBeVisible();
    await expect(c.queryByRole('button', { name: 'View record: Website inquiry' })).not.toBeInTheDocument();
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'jobs');
    await expect(args.onViewChange).toHaveBeenLastCalledWith('jobs');
    await expect(c.getByRole('button', { name: 'Remove filter: Current member: Blair' })).toBeVisible();
    await expect(summary(canvasElement).getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('3');
    await expect(c.getByRole('heading', { name: 'Breakdown / Alex / Primary responsibility' })).toBeVisible();
    await expect(c.getByRole('button', { name: 'View record: D0 / overdue repair' })).toBeVisible();
    await selectMetricEvidence(canvasElement, 'Overdue');
    await expect(c.getByRole('button', { name: 'View record: D0 / overdue repair' })).toBeVisible();
    await expect(c.queryByRole('button', { name: 'View record: D2 / Waiting at due-soon boundary' })).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'View record: D0 / overdue repair' }));
    await expect(args.onRecord).toHaveBeenLastCalledWith('d0');
    await userEvent.click(c.getByRole('button', { name: 'Preview CSV' }));
    await expect(args.onExport).toHaveBeenCalledTimes(1);
    await chooseMember(canvasElement, 'Casey');
    await expect(summary(canvasElement).getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('4');
    await expect(summary(canvasElement).getByRole('group', { name: 'No current primary owner' })).toHaveTextContent('1');
    await selectMetricEvidence(canvasElement, 'No current primary owner');
    await expect(c.getByRole('button', { name: 'View record: D3 / no deadline or primary owner' })).toBeVisible();
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'leads');
    await expect(c.getByRole('button', { name: 'Remove filter: Current member: Casey' })).toBeVisible();
    await expect(summary(canvasElement).getByRole('group', { name: 'Open Leads' })).toHaveTextContent('1');
    await userEvent.click(c.getByRole('button', { name: 'Clear all' }));
    await expect(summary(canvasElement).getByRole('group', { name: 'Open Leads' })).toHaveTextContent('4');
    await selectMetricEvidence(canvasElement, 'Seven-day inactivity');
    await expect(args.onEvidence).toHaveBeenLastCalledWith('inactive');
    await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
  },
};
export const Jobs: Story = { render: Default.render, args: { projection: teamWorkspaceResponse('jobs', empty) } };
export const SharedJobDistinctCount: Story = { render: Default.render,
  args: { filters: { members: ['member-b', 'member-c'] }, projection: teamWorkspaceResponse('jobs', { members: ['member-b', 'member-c'] }) },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(summary(canvasElement).getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('4');
    await expect(c.getAllByRole('button', { name: 'View record: D0 / overdue repair' })).toHaveLength(1);
    await expect(c.getByRole('heading', { name: 'Breakdown / Alex / Primary responsibility' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'View workload evidence: Blair / Supporting participation' }));
    await expect(c.getByRole('button', { name: 'View record: D0 / overdue repair' })).toBeVisible();
    await expect(c.queryByRole('button', { name: 'View record: D3 / no deadline or primary owner' })).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'View workload evidence: Casey / Supporting participation' }));
    await expect(c.getByRole('button', { name: 'View record: D3 / no deadline or primary owner' })).toBeVisible();
    await expect(summary(canvasElement).getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('4');
  } };
export const MyWorkload: Story = { render: Default.render, args: { scope: assigned, filterOptions: teamMemberOptions.slice(0, 1),
  projection: teamWorkspaceResponse('leads', empty, assigned) }, play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { name: 'My workload report' })).toBeVisible();
    await chooseMember(canvasElement, 'Me');
    await expect(summary(canvasElement).getByRole('group', { name: 'Open Leads' })).toHaveTextContent('2');
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'jobs');
    await expect(summary(canvasElement).getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('3');
    await expect(c.getByRole('heading', { name: 'Breakdown / Me / Primary responsibility' })).toBeVisible();
    await expect(c.getByRole('heading', { name: 'Breakdown / Me / Supporting participation' })).toBeVisible();
    await expect(c.queryByText(/Alex|Blair|Casey/)).not.toBeInTheDocument();
    await expect(c.queryByRole('group', { name: 'No current primary owner' })).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'View workload evidence: Me / Supporting participation' }));
    await expect(c.getByRole('button', { name: 'View record: D2 / Waiting at due-soon boundary' })).toBeVisible();
  } };
export const PaginationResets: Story = { render: Default.render, args: { projection: teamWorkspaceResponse('leads', empty, workspace, undefined, 1, 1) },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const next = async () => { await userEvent.click(c.getByRole('button', { name: 'Go to next page' })); };
    await next();
    await expect(args.onPageChange).toHaveBeenLastCalledWith(2);
    await selectMetricEvidence(canvasElement, 'Seven-day inactivity');
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
    await next();
    await chooseMember(canvasElement, 'Alex');
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
    await next();
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'jobs');
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
    await next();
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Rows per page' }), '25');
    await expect(args.onPageSizeChange).toHaveBeenLastCalledWith(25);
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
  } };
export const EmptyMatches: Story = { render: Default.render, args: { filters: { members: ['member-c'] }, projection: teamWorkspaceResponse('leads', { members: ['member-c'] }) },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(summary(canvasElement).getByRole('group', { name: 'Open Leads' })).toHaveTextContent('0');
    await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'jobs');
    await expect(summary(canvasElement).getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('2');
  } };
export const RemovedMember: Story = { render: Default.render, args: { filters: { members: ['hidden-member'] } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await noResults(canvasElement);
    await expect(c.queryByText(/hidden-member/)).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Remove filter: Current member: Unavailable saved selection' }));
    await expect(summary(canvasElement).getByRole('group', { name: 'Open Leads' })).toHaveTextContent('4');
  } };
export const DuplicateSavedSelection: Story = { args: { filters: { members: ['member-a', 'member-a'] } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible(); await noResults(canvasElement);
} };
export const StaleFilterProjection: Story = { args: { filters: { members: ['member-a'] } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toHaveTextContent('do not match'); await noResults(canvasElement);
} };
export const StaleScopeProjection: Story = { args: { scope: assigned, filterOptions: teamMemberOptions.slice(0, 1) }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toHaveTextContent('do not match'); await noResults(canvasElement);
} };
export const InvalidProjection: Story = { args: { projection: { view: 'leads', filters: empty, state: { kind: 'ready',
  result: { ...teamLeadsResult, counts: { open: 99, inactive: 2, unassigned: 1 } } } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toHaveTextContent('do not match'); await noResults(canvasElement);
} };
export const InvalidOptions: Story = { args: { filterOptions: [teamMemberOptions[0]!, teamMemberOptions[0]!] }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible(); await noResults(canvasElement);
} };
export const AssignedRosterLeak: Story = { args: { scope: assigned, projection: teamWorkspaceResponse('jobs', empty, assigned) },
  play: async ({ canvasElement }) => {
    await noResults(canvasElement); await expect(within(canvasElement).queryByText(/Alex|Blair|Casey/)).not.toBeInTheDocument();
  } };
export const LoadingFilters: Story = { args: { filterState: 'loading' }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('status')).toBeVisible(); await noResults(canvasElement);
} };
export const FilterError: Story = { args: { filterState: 'error' }, play: async ({ canvasElement, args }) => {
  await noResults(canvasElement);
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Retry filters' }));
  await expect(args.onRetryFilters).toHaveBeenCalledTimes(1);
} };
export const Loading: Story = { args: { projection: { view: 'leads', filters: empty, state: { kind: 'loading' } } },
  play: async ({ canvasElement }) => { await noResults(canvasElement); } };
export const Error: Story = { args: { projection: { view: 'jobs', filters: empty, state: { kind: 'error' } } }, play: async ({ canvasElement, args }) => {
  await noResults(canvasElement);
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Retry report' }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  await noResults(canvasElement); await expect(within(canvasElement).queryByRole('combobox')).not.toBeInTheDocument();
} };
export const CurrentAccessRevoked: Story = { args: { canReadCurrent: false }, play: async ({ canvasElement }) => {
  await noResults(canvasElement);
  await expect(within(canvasElement).getByRole('combobox', { name: 'Report view' })).toBeDisabled();
  await expect(within(canvasElement).queryByText('Alex')).not.toBeInTheDocument();
} };
export const UnavailableView: Story = { args: { availableViews: ['jobs'] }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await noResults(canvasElement);
  await expect(c.getByRole('option', { name: 'Unavailable saved view' })).toBeDisabled();
  await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'jobs');
  await expect(args.onViewChange).toHaveBeenLastCalledWith('jobs');
} };
export const DuplicateViews: Story = { args: { availableViews: ['leads', 'leads'] }, play: async ({ canvasElement }) => {
  await noResults(canvasElement); await expect(within(canvasElement).getByRole('alert')).toHaveTextContent('views are inconsistent');
} };
export const Pending: Story = { args: { pending: true, filters: { members: ['member-a'] }, projection: teamWorkspaceResponse('jobs', { members: ['member-a'] }) },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    for (const name of ['Report view', 'Current member']) await expect(c.getByRole('combobox', { name })).toBeDisabled();
    await expect(c.getByRole('button', { name: 'Clear all' })).toBeDisabled();
    for (const button of c.getAllByRole('button', { name: /^Actions:/ })) await expect(button).toBeDisabled();
    await expect(args.onViewChange).not.toHaveBeenCalled(); await expect(args.onEvidence).not.toHaveBeenCalled();
  } };
export const NoExportAccess: Story = { args: { canExport: false }, play: async ({ canvasElement, args }) => {
  const button = within(canvasElement).getByRole('button', { name: 'Preview CSV' });
  await expect(button).toBeDisabled();
  await userEvent.click(button);
  await expect(args.onExport).not.toHaveBeenCalled();
} };
export const JobsOnly: Story = { render: Default.render, args: { availableViews: ['jobs'], projection: teamWorkspaceResponse('jobs', empty) },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole('option', { name: 'Current Leads workload' })).not.toBeInTheDocument();
    await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
  } };
export const MySupportingWorkload: Story = { render: Default.render, args: { scope: { kind: 'assigned', currentMemberId: 'member-c' },
  filterOptions: teamMemberOptions.slice(2), projection: teamWorkspaceResponse('jobs', empty, { kind: 'assigned', currentMemberId: 'member-c' }) },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(summary(canvasElement).getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('2');
    await expect(c.getByRole('heading', { name: 'Breakdown / Me / Supporting participation' })).toBeVisible();
    await expect(c.queryByText(/Alex|Blair|Casey/)).not.toBeInTheDocument();
    await expect(c.queryByRole('group', { name: 'No current primary owner' })).not.toBeInTheDocument();
  } };
export const Help: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const trigger = c.getByRole('button', { name: 'About Team report workspace' });
  trigger.focus(); await userEvent.keyboard('{Enter}');
  const dialog = await body.findByRole('dialog', { name: 'About Team report workspace' });
  await waitFor(() => expect(dialog).toBeVisible());
  await expect(within(dialog).getByText(/counterpart cards remain visible/)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
