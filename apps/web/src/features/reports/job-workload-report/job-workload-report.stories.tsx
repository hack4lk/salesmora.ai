import { useState } from 'react';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { JobWorkloadReport } from './job-workload-report';
import { jobWorkloadMetrics, jobMatchesWorkload, jobWorkloadGroupId, type JobWorkloadProjection } from './job-workload-report.validation';
import { workloadResult as result, workloadRows as rows } from './job-workload-report.fixtures';
import { jobWorkloadReportData as copy } from './job-workload-report.data';

const meta = {
  title: 'Reports/JobWorkloadReport', component: JobWorkloadReport, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical current workload composition with six shared summary callouts above the breakdowns, three per row from tablet widths. Breakdowns display two per row on larger screens and stack on smaller screens; one full-width evidence table follows. Fictional discovery D0-D5 snapshot: active 5, overdue 1, due soon 2, no deadline 1, Waiting 1 and unassigned 1. Completed/Canceled excluded; due today is not overdue and today+7 is included. Current owner/service/status groups each reconcile to Active; Waiting reasons reconcile to Waiting. Current grants and filters are independent of period results. Hosts query same-snapshot authorized facets/rows and orchestrate record and CSV dialogs. No production APIs/routes.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-7xl"><Story /></div></main>],
  args: { state: { kind: 'ready', result }, canRead: true, canExport: true, canEdit: true,
    onEvidence: fn(), onRecord: fn(), onExport: fn(), onPageChange: fn(), onPageSizeChange: fn(), onRetry: fn(), onEdit: fn() },
} satisfies Meta<typeof JobWorkloadReport>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: function Render(args) {
    const [selected, select] = useState<JobWorkloadProjection>({ kind: 'metric', metric: 'active' });
    const selectedRows = rows.filter(row => {
      if (selected.kind === 'metric') return jobMatchesWorkload(row, selected.metric, result.today);
      return jobWorkloadGroupId(row, selected.group) === selected.id;
    });
    return <JobWorkloadReport {...args} state={{ kind: 'ready', result: { ...result, selected, rows: selectedRows } }}
      onEvidence={id => {
        args.onEvidence(id);
        const metric = jobWorkloadMetrics.find(metric => metric === id);
        if (metric) select({ kind: 'metric', metric });
        else {
          for (const group of ['status', 'owner', 'service', 'waitingReason'] as const) {
            const option = result.groups[group].find(option => option.evidenceId === id);
            if (option) select({ kind: 'group', group, id: option.id });
          }
        }
      }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement), summary = within(c.getByRole('region', { name: 'Report summary' }));
    const summaryRect = c.getByRole('region', { name: 'Report summary' }).getBoundingClientRect();
    const breakdowns = ['Current status', 'Current primary owner', 'Current service', 'Waiting reason'].map(label =>
      c.getByRole('region', { name: `Breakdown / ${label}` }).getBoundingClientRect());
    const metrics = jobWorkloadMetrics.map(metric => summary.getByRole('group', { name: copy.labels[metric] }).getBoundingClientRect());
    await expect(summaryRect.bottom).toBeLessThanOrEqual(breakdowns[0]!.top);
    await expect(c.getByRole('region', { name: 'Supporting evidence' }).getBoundingClientRect().top)
      .toBeGreaterThanOrEqual(Math.max(...breakdowns.map(rect => rect.bottom)));
    const view = canvasElement.ownerDocument.defaultView!;
    if (view.matchMedia('(min-width: 1200px)').matches) {
      await expect(breakdowns[0]!.top).toBe(breakdowns[1]!.top);
      await expect(breakdowns[2]!.top).toBe(breakdowns[3]!.top);
      await expect(breakdowns[1]!.left).toBeGreaterThan(breakdowns[0]!.left);
      await expect(breakdowns[2]!.top).toBeGreaterThanOrEqual(Math.max(breakdowns[0]!.bottom, breakdowns[1]!.bottom));
    } else {
      for (let index = 1; index < breakdowns.length; index++) {
        await expect(breakdowns[index]!.top).toBeGreaterThanOrEqual(breakdowns[index - 1]!.bottom);
      }
    }
    if (view.matchMedia('(min-width: 900px)').matches) {
      await expect(metrics[1]!.left).toBeGreaterThan(metrics[0]!.left);
      await expect(metrics[2]!.left).toBeGreaterThan(metrics[1]!.left);
      await expect(metrics[0]!.top).toBe(metrics[1]!.top);
      await expect(metrics[1]!.top).toBe(metrics[2]!.top);
      await expect(metrics[3]!.top).toBeGreaterThanOrEqual(Math.max(...metrics.slice(0, 3).map(rect => rect.bottom)));
      await expect(metrics[3]!.top).toBe(metrics[4]!.top);
      await expect(metrics[4]!.top).toBe(metrics[5]!.top);
    } else {
      for (let index = 1; index < metrics.length; index++) {
        await expect(metrics[index]!.left).toBe(metrics[0]!.left);
        await expect(metrics[index]!.top).toBeGreaterThanOrEqual(metrics[index - 1]!.bottom);
      }
    }
    for (const metric of jobWorkloadMetrics) await expect(summary.getByRole('group', { name: copy.labels[metric] })).toHaveTextContent(String(result.counts[metric]));
    await selectMetricEvidence(canvasElement, 'Overdue');
    await expect(args.onEvidence).toHaveBeenLastCalledWith('overdue');
    await expect(c.getByRole('button', { name: 'View record: D0 / overdue repair' })).toBeVisible();
    await expect(c.queryByRole('button', { name: 'View record: D1 / due today' })).not.toBeInTheDocument();
    await selectMetricEvidence(canvasElement, 'Due soon');
    await expect(c.getByRole('button', { name: 'View record: D1 / due today' })).toBeVisible();
    await expect(c.getByRole('button', { name: 'View record: D2 / Waiting at due-soon boundary' })).toBeVisible();
    await expect(c.queryByRole('button', { name: 'View record: D5 / beyond due-soon window' })).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'View supporting evidence: Waiting on materials' }));
    await expect(args.onEvidence).toHaveBeenLastCalledWith('waitingReason:materials');
    await userEvent.click(c.getByRole('button', { name: 'View record: D2 / Waiting at due-soon boundary' }));
    await expect(args.onRecord).toHaveBeenLastCalledWith('d2');
    await userEvent.click(c.getByRole('button', { name: 'Preview CSV' }));
    await expect(args.onExport).toHaveBeenCalledTimes(1);
    await userEvent.click(c.getByRole('button', { name: 'View supporting evidence: Repair' }));
    await expect(args.onEvidence).toHaveBeenLastCalledWith('service:repair');
    await expect(c.getByRole('button', { name: 'View record: D0 / overdue repair' })).toBeVisible();
    await expect(c.getByRole('button', { name: 'View record: D1 / due today' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'View supporting evidence: Teammate B' }));
    await expect(args.onEvidence).toHaveBeenLastCalledWith('owner:member-b');
    await expect(c.getByRole('button', { name: 'View record: D5 / beyond due-soon window' })).toBeVisible();
    await userEvent.click(within(c.getByRole('region', { name: 'Breakdown / Current status' })).getByRole('button', { name: 'View supporting evidence: Waiting' }));
    await expect(args.onEvidence).toHaveBeenLastCalledWith('status:waiting');
    await expect(c.getByRole('button', { name: 'View record: D2 / Waiting at due-soon boundary' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'View supporting evidence: Waiting on customer' }));
    await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
    await selectMetricEvidence(canvasElement, 'Active Jobs');
    await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
  },
};
export const Overdue: Story = { args: { state: { kind: 'ready', result: { ...result, selected: { kind: 'metric', metric: 'overdue' }, rows: [rows[0]!] } } } };
export const DueSoon: Story = { args: { state: { kind: 'ready', result: { ...result, selected: { kind: 'metric', metric: 'dueSoon' }, rows: [rows[1]!, rows[2]!] } } } };
export const NoDeadline: Story = { args: { state: { kind: 'ready', result: { ...result, selected: { kind: 'metric', metric: 'noDeadline' }, rows: [rows[3]!] } } } };
export const Waiting: Story = { args: { state: { kind: 'ready', result: { ...result, selected: { kind: 'metric', metric: 'waiting' }, rows: [rows[2]!] } } } };
export const Unassigned: Story = { args: { state: { kind: 'ready', result: { ...result, selected: { kind: 'metric', metric: 'unassigned' }, rows: [rows[3]!] } } } };
export const ScopeAndDatesHelp: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await expect(c.getByText(`${result.snapshotLabel} / ${copy.mode}`)).toBeVisible();
  const trigger = c.getByRole('button', { name: copy.help });
  trigger.focus(); await userEvent.keyboard('{Enter}');
  const dialog = await body.findByRole('dialog', { name: copy.help });
  await waitFor(() => expect(dialog).toBeVisible());
  for (const text of [copy.scope, result.scopeLabel, copy.overlap, copy.schedule, copy.definitions.overdue, copy.definitions.dueSoon]) {
    await expect(within(dialog).getByText(text)).toBeVisible();
  }
  await expect(within(dialog).getByText(/Business-local today:/)).toHaveTextContent('12 Nov 2026');
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
export const Empty: Story = { args: { state: { kind: 'ready', result: { ...result,
  counts: { active: 0, overdue: 0, dueSoon: 0, noDeadline: 0, waiting: 0, unassigned: 0 },
  groups: { status: [], owner: [], service: [], waitingReason: [] }, rows: [],
} } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
  await expect(within(c.getByRole('region', { name: 'Report summary' })).getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('0');
} };
export const Loading: Story = { args: { state: { kind: 'loading' } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('group')).not.toBeInTheDocument();
} };
export const Error: Story = { args: { state: { kind: 'error' } }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Retry report' }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.queryByRole('group')).not.toBeInTheDocument();
  await expect(c.queryByText('Teammate A')).not.toBeInTheDocument();
} };
export const ExportDenied: Story = { args: { canExport: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const button of c.getAllByRole('button', { name: /Actions:|View supporting evidence:/ })) await expect(button).toBeDisabled();
  await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
  await expect(args.onEvidence).not.toHaveBeenCalled();
} };
export const InvalidGroups: Story = { args: { state: { kind: 'ready', result: { ...result, groups: { ...result.groups, service: [] } } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
} };
export const ClosedEvidence: Story = { args: { state: { kind: 'ready', result: { ...result, rows: [{ ...rows[0]!, status: 'completed' }, ...rows.slice(1)] } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
} };
export const WrongDeadlineProjection: Story = { args: { state: { kind: 'ready', result: { ...result, selected: { kind: 'metric', metric: 'overdue' }, rows: [rows[1]!] } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
} };
export const AssignedScope: Story = { args: { state: { kind: 'ready', result: { ...result, scopeLabel: 'Currently authorized assigned Jobs only; no hidden teammate totals.',
  counts: { active: 2, overdue: 1, dueSoon: 1, noDeadline: 0, waiting: 0, unassigned: 0 },
  groups: { status: [{ id: 'in-progress', label: 'In Progress', count: 1 }, { id: 'scheduled', label: 'Scheduled', count: 1 }],
    owner: [{ id: 'member:member-a', label: 'Me', count: 2 }], service: [{ id: 'repair', label: 'Repair', count: 2 }], waitingReason: [] },
  rows: rows.slice(0, 2).map(row => ({ ...row, cells: { ...row.cells, owner: 'Me' } })),
} } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.queryByText('Teammate A')).not.toBeInTheDocument();
  await expect(c.queryByText('Teammate B')).not.toBeInTheDocument();
} };
export const RemovedPrimaryOwner: Story = { args: { state: { kind: 'ready', result: { ...result,
  selected: { kind: 'metric', metric: 'unassigned' },
  rows: [{ ...rows[3]!, cells: { ...rows[3]!.cells, owner: 'Unreliable former identity' } }],
} } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.queryByText('Unreliable former identity')).not.toBeInTheDocument();
  await expect(c.getByRole('button', { name: 'View record: D3 / no deadline or primary owner' })).toBeVisible();
} };
export const ReadOnlyEvidence: Story = { args: { state: { kind: 'ready', result: { ...result,
  evidenceIds: {}, groups: {
    status: result.groups.status.map(group => ({ ...group, evidenceId: undefined })),
    owner: result.groups.owner.map(group => ({ ...group, evidenceId: undefined })),
    service: result.groups.service.map(group => ({ ...group, evidenceId: undefined })),
    waitingReason: result.groups.waitingReason.map(group => ({ ...group, evidenceId: undefined })),
  }, rows: rows.map(row => ({ ...row, recordId: undefined })),
} } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.queryByRole('button', { name: /View supporting evidence:/ })).not.toBeInTheDocument();
  await expect(c.queryByRole('button', { name: /View record:/ })).not.toBeInTheDocument();
  await expect(args.onRecord).not.toHaveBeenCalled();
} };
export const Pagination: Story = {
  render: function Render(args) {
    const [pagination, setPagination] = useState({ page: 1, pageSize: 2 });
    return <JobWorkloadReport {...args} state={{ kind: 'ready', result: { ...result, ...pagination,
      rows: rows.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize) } }}
      onPageChange={page => { args.onPageChange(page); setPagination(current => ({ ...current, page })); }}
      onPageSizeChange={pageSize => { args.onPageSizeChange(pageSize); setPagination({ page: 1, pageSize }); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(2);
    await expect(c.getByRole('button', { name: 'View record: D2 / Waiting at due-soon boundary' })).toBeVisible();
    await expect(c.queryByRole('button', { name: 'View record: D0 / overdue repair' })).not.toBeInTheDocument();
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Rows per page' }), '25');
    await expect(args.onPageSizeChange).toHaveBeenLastCalledWith(25);
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
    await expect(c.getByRole('button', { name: 'View record: D0 / overdue repair' })).toBeVisible();
  },
};
export const LongContent: Story = { args: { state: { kind: 'ready', result: { ...result, scopeLabel: 'Authorized-current-Job-scope-'.repeat(20),
  rows: rows.map(row => ({ ...row, label: `${row.label} ${'Job-label-'.repeat(15)}` })),
} } } };
