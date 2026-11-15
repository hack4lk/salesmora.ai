import { useState } from 'react';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { TeamLeadsReport } from './team-leads-report';
import { teamLeadRows as rows, teamLeadsResult as result, myLeadsResult } from './team-leads-report.fixtures';
import { teamLeadOwnerKey, teamOpenLeadStages, type TeamLeadSelection } from './team-leads-report.validation';

const meta = {
  title: 'Reports/TeamLeadsReport', component: TeamLeadsReport, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical first Team workload slice: current non-archived open Leads by current primary owner/stage, with seven-day inactivity and separate unassigned evidence. Alphabetical members, no ranking/capacity scores. Shared summary, breakdowns and one evidence table. Inactive flags and the exact cutoff come from the same host-owned database snapshot; boundary story demonstrates a host fixture, not database execution. Assigned scope is My workload only, excluding unrelated members and residual/unassigned totals. Missing membership means no current primary owner; no unreliable former identity. Host owns authorization, query predicates, pagination and record/CSV dialogs. Production routes/APIs remain deferred.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-7xl"><Story /></div></main>],
  args: { state: { kind: 'ready', result }, canRead: true, canExport: true, canEdit: true,
    onEvidence: fn(), onRecord: fn(), onExport: fn(), onPageChange: fn(), onPageSizeChange: fn(), onRetry: fn(), onEdit: fn() },
} satisfies Meta<typeof TeamLeadsReport>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: function Render(args) {
    const [selected, setSelected] = useState<TeamLeadSelection>({ kind: 'queue', queue: 'open' });
    const selectedRows = rows.filter(row => selected.kind === 'queue'
      ? selected.queue === 'open' || (selected.queue === 'inactive' ? row.inactive : row.currentOwnerId === null)
      : teamLeadOwnerKey(row) === selected.id && (selected.stage === undefined || row.stage === selected.stage) && (!selected.inactiveOnly || row.inactive));
    return <TeamLeadsReport {...args} state={{ kind: 'ready', result: { ...result, selected, rows: selectedRows } }}
      onEvidence={id => {
        args.onEvidence(id);
        for (const queue of ['open', 'inactive', 'unassigned'] as const) {
          if (result.evidenceIds[queue] === id) { setSelected({ kind: 'queue', queue }); return; }
        }
        for (const owner of result.owners) {
          if (owner.evidenceId === id) { setSelected({ kind: 'owner', id: owner.id }); return; }
          if (owner.inactiveEvidenceId === id) { setSelected({ kind: 'owner', id: owner.id, inactiveOnly: true }); return; }
          for (const stage of teamOpenLeadStages) {
            if (owner.stageEvidenceIds?.[stage] === id) { setSelected({ kind: 'owner', id: owner.id, stage }); return; }
          }
        }
      }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement), summary = within(c.getByRole('region', { name: 'Report summary' }));
    await expect(summary.getByRole('group', { name: 'Open Leads' })).toHaveTextContent('4');
    await expect(summary.getByRole('group', { name: 'Seven-day inactivity' })).toHaveTextContent('2');
    await expect(c.queryByText('Unreliable former identity')).not.toBeInTheDocument();
    const headings = c.getAllByRole('heading', { level: 2 }).filter(heading => heading.textContent?.startsWith('Breakdown /'));
    await expect(headings.map(heading => heading.textContent)).toEqual([
      'Breakdown / Alex / current stage', 'Breakdown / Blair / current stage', 'Breakdown / No current primary owner / current stage',
    ]);
    const memberCards = headings.map(heading => heading.closest('section')!.getBoundingClientRect());
    for (const label of ['Alex', 'Blair', 'No current primary owner']) {
      const card = c.getByRole('region', { name: `Breakdown / ${label} / current stage` });
      await expect(within(card).getByRole('button', { name: `View owner evidence: ${label}` })).toBeVisible();
      const inactiveButton = within(card).getByRole('button', { name: `View inactive evidence: ${label}` });
      await expect(inactiveButton).toBeVisible();
      await expect(within(card).getByText('Seven-day inactivity:', { exact: false })).toBeVisible();
      const cardRect = card.getBoundingClientRect(), buttonRect = inactiveButton.getBoundingClientRect();
      await expect(buttonRect.bottom).toBeLessThanOrEqual(cardRect.bottom);
      await expect(buttonRect.right).toBeLessThanOrEqual(cardRect.right);
    }
    const summaryRect = c.getByRole('region', { name: 'Report summary' }).getBoundingClientRect();
    await expect(summaryRect.bottom).toBeLessThanOrEqual(memberCards[0]!.top);
    if (canvasElement.ownerDocument.defaultView!.matchMedia('(min-width: 1200px)').matches) {
      await expect(memberCards[0]!.top).toBe(memberCards[1]!.top);
      await expect(memberCards[1]!.left).toBeGreaterThan(memberCards[0]!.left);
    } else {
      for (let index = 1; index < memberCards.length; index++) {
        await expect(memberCards[index]!.top).toBeGreaterThanOrEqual(memberCards[index - 1]!.bottom);
      }
    }
    await expect(c.getByRole('region', { name: 'Supporting evidence' }).getBoundingClientRect().top)
      .toBeGreaterThanOrEqual(Math.max(...memberCards.map(rect => rect.bottom)));
    await userEvent.click(c.getByRole('button', { name: 'View owner evidence: Alex' }));
    await expect(args.onEvidence).toHaveBeenLastCalledWith('owner:a');
    await expect(c.getByRole('button', { name: 'View record: Website inquiry' })).toBeVisible();
    await expect(c.queryByRole('button', { name: 'View record: Estimate at cutoff' })).not.toBeInTheDocument();
    await userEvent.click(within(c.getByRole('region', { name: 'Breakdown / Alex / current stage' })).getByRole('button', { name: 'View supporting evidence: Contacted' }));
    await expect(args.onEvidence).toHaveBeenLastCalledWith('a:contacted');
    await expect(c.getByRole('button', { name: 'View record: Referral awaiting contact' })).toBeVisible();
    await expect(c.queryByRole('button', { name: 'View record: Website inquiry' })).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'View inactive evidence: Blair' }));
    await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
    await selectMetricEvidence(canvasElement, 'Seven-day inactivity');
    await expect(c.getByRole('button', { name: 'View record: Referral awaiting contact' })).toBeVisible();
    await expect(c.getByRole('button', { name: 'View record: Inquiry needing reassignment' })).toBeVisible();
    await expect(c.queryByRole('button', { name: 'View record: Estimate at cutoff' })).not.toBeInTheDocument();
    await selectMetricEvidence(canvasElement, 'No current primary owner');
    await userEvent.click(c.getByRole('button', { name: 'View record: Inquiry needing reassignment' }));
    await expect(args.onRecord).toHaveBeenLastCalledWith('u1');
    await userEvent.click(c.getByRole('button', { name: 'Preview CSV' }));
    await expect(args.onExport).toHaveBeenCalledTimes(1);
    await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
    await selectMetricEvidence(canvasElement, 'Open Leads');
  },
};
export const MyWorkload: Story = { args: { state: { kind: 'ready', result: myLeadsResult } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement), summary = within(c.getByRole('region', { name: 'Report summary' }));
  await expect(c.getByRole('heading', { name: 'My workload / Leads' })).toBeVisible();
  await expect(summary.getByRole('group', { name: 'Open Leads' })).toHaveTextContent('2');
  await expect(summary.queryByRole('group', { name: 'No current primary owner' })).not.toBeInTheDocument();
  await expect(c.queryByText('Alex')).not.toBeInTheDocument();
  await expect(c.queryByText('Blair')).not.toBeInTheDocument();
  await expect(c.getByRole('heading', { name: 'Breakdown / Me / current stage' })).toBeVisible();
} };
export const Inactive: Story = { args: { state: { kind: 'ready', result: { ...result, selected: { kind: 'queue', queue: 'inactive' }, rows: rows.filter(row => row.inactive) } } } };
export const Unassigned: Story = { args: { state: { kind: 'ready', result: { ...result, selected: { kind: 'queue', queue: 'unassigned' }, rows: [rows[3]!] } } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByText('Unreliable former identity')).not.toBeInTheDocument();
    await expect(within(canvasElement).getByRole('button', { name: 'View record: Inquiry needing reassignment' })).toBeVisible();
  },
};
export const Empty: Story = { args: { state: { kind: 'ready', result: { ...result, counts: { open: 0, inactive: 0, unassigned: 0 }, owners: [], rows: [] } } },
  play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled(); },
};
export const Loading: Story = { args: { state: { kind: 'loading' } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
} };
export const Error: Story = { args: { state: { kind: 'error' } }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Retry report' }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByText('Alex')).not.toBeInTheDocument();
  await expect(within(canvasElement).queryByRole('region', { name: 'Report summary' })).not.toBeInTheDocument();
} };
export const ExportDenied: Story = { args: { canExport: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const button of c.getAllByRole('button', { name: /Actions:|View supporting evidence:|View owner evidence:|View inactive evidence:|View record:/ })) await expect(button).toBeDisabled();
  await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
  await expect(args.onEvidence).not.toHaveBeenCalled();
} };
export const ClosedEvidence: Story = { args: { state: { kind: 'ready', result: { ...result, rows: [{ ...rows[0]!, stage: 'won' }, ...rows.slice(1)] } } },
  play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('alert')).toBeVisible(); },
};
export const InvalidCounts: Story = { args: { state: { kind: 'ready', result: { ...result, counts: { ...result.counts, inactive: 5 } } } },
  play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('alert')).toBeVisible(); },
};
export const AssignedScopeLeak: Story = { args: { state: { kind: 'ready', result: { ...result, scope: { kind: 'assigned', currentMemberId: 'a' } } } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('alert')).toBeVisible();
    await expect(within(canvasElement).queryByText('Blair')).not.toBeInTheDocument();
    await expect(within(canvasElement).queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
  },
};
export const Pagination: Story = {
  render: function Render(args) {
    const [pagination, setPagination] = useState({ page: 1, pageSize: 2 });
    return <TeamLeadsReport {...args} state={{ kind: 'ready', result: { ...result, ...pagination,
      rows: rows.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize) } }}
      onPageChange={page => { args.onPageChange(page); setPagination(current => ({ ...current, page })); }}
      onPageSizeChange={pageSize => { args.onPageSizeChange(pageSize); setPagination({ page: 1, pageSize }); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(2);
    await expect(c.getByRole('button', { name: 'View record: Inquiry needing reassignment' })).toBeVisible();
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Rows per page' }), '25');
    await expect(args.onPageSizeChange).toHaveBeenLastCalledWith(25);
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
  },
};
export const Help: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const trigger = c.getByRole('button', { name: 'About Team Leads workload' });
  trigger.focus(); await userEvent.keyboard('{Enter}');
  const dialog = await body.findByRole('dialog', { name: 'About Team Leads workload' });
  await waitFor(() => expect(dialog).toBeVisible());
  await expect(within(dialog).getByText(/Counts are distinct Leads, not hours/)).toBeVisible();
  await expect(within(dialog).getByText(/Activity must be strictly earlier; equality is excluded/)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
export const LongLabels: Story = { args: { state: { kind: 'ready', result: { ...result,
  owners: result.owners.map(owner => ({ ...owner, label: `${owner.label} ${'Authorized-member-name-'.repeat(12)}` })),
  rows: rows.map(row => ({ ...row, label: `${row.label} ${'Lead-label-'.repeat(12)}` })),
} } } };
