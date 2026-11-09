import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { TeamJobsReport } from './team-jobs-report';
import { teamJobRows as rows, teamJobsResult as result, myJobsResult, teamJobWorkload } from './team-jobs-report.fixtures';
import { teamJobMatchesSelection, type TeamJobSelection } from './team-jobs-report.validation';
import { activeJobStatuses } from '../job-workload-report/job-workload-report.validation';

const meta = {
  title: 'Reports/TeamJobsReport', component: TeamJobsReport, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical Team Jobs workload with distinct active/overdue/Waiting/unassigned queues and separate primary/supporting status cards for each authorized current member. Members sort alphabetically; supporting counts are explicitly non-additive. Fixture D0 has primary Alex and support Blair/Casey, but appears once overall. Assigned-only Casey sees own support counts, no unrelated primary identities, teammate roster or unassigned residual queue. All footer controls stay inside cards. Hosts own scoped queries, surviving membership, duplicate-join protection, same-snapshot aggregates and record/CSV dialogs; no production API/routes.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-7xl"><Story /></div></main>],
  args: { state: { kind: 'ready', result }, canRead: true, canExport: true, canEdit: true,
    onEvidence: fn(), onRecord: fn(), onExport: fn(), onPageChange: fn(), onPageSizeChange: fn(), onRetry: fn(), onEdit: fn() },
} satisfies Meta<typeof TeamJobsReport>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: function Render(args) {
    const [selected, setSelected] = useState<TeamJobSelection>({ kind: 'queue', queue: 'active' });
    return <TeamJobsReport {...args} state={{ kind: 'ready', result: { ...result, selected,
      rows: rows.filter(row => teamJobMatchesSelection(row, selected, result.today)) } }}
      onEvidence={id => {
        args.onEvidence(id);
        for (const queue of ['active', 'overdue', 'waiting', 'unassigned'] as const) {
          if (result.evidenceIds[queue] === id) { setSelected({ kind: 'queue', queue }); return; }
        }
        for (const member of result.members) {
          for (const responsibility of ['primary', 'supporting'] as const) {
            const workload = member[responsibility];
            const filter = workload.evidenceId === id ? 'all' : workload.overdueEvidenceId === id ? 'overdue'
              : workload.waitingEvidenceId === id ? 'waiting' : activeJobStatuses.find(status => workload.statusEvidenceIds?.[status] === id);
            if (filter !== undefined) { setSelected({ kind: 'member', id: member.id, responsibility, filter }); return; }
          }
        }
        if (result.unassigned !== null) {
          const workload = result.unassigned;
          const filter = workload.evidenceId === id ? 'all' : workload.overdueEvidenceId === id ? 'overdue'
            : workload.waitingEvidenceId === id ? 'waiting' : activeJobStatuses.find(status => workload.statusEvidenceIds?.[status] === id);
          if (filter !== undefined) setSelected({ kind: 'unassigned', filter });
        }
      }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement), summary = within(c.getByRole('region', { name: 'Report summary' }));
    await expect(summary.getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('5');
    const memberSections = ['Alex', 'Blair', 'Casey'].map(label => c.getByRole('region', { name: `Workload / ${label}` }));
    await expect(memberSections.map(section => section.querySelector('h3')!.textContent)).toEqual(['Alex', 'Blair', 'Casey']);
    await expect(memberSections[0]!.compareDocumentPosition(memberSections[1]!) & 4).toBe(4);
    const primary = c.getByRole('region', { name: 'Breakdown / Alex / Primary responsibility' });
    const supporting = c.getByRole('region', { name: 'Breakdown / Alex / Supporting participation' });
    if (canvasElement.ownerDocument.defaultView!.matchMedia('(min-width: 1200px)').matches) {
      await expect(primary.getBoundingClientRect().top).toBe(supporting.getBoundingClientRect().top);
      await expect(supporting.getBoundingClientRect().left).toBeGreaterThan(primary.getBoundingClientRect().left);
    } else await expect(supporting.getBoundingClientRect().top).toBeGreaterThanOrEqual(primary.getBoundingClientRect().bottom);
    await expect(within(primary).getByRole('button', { name: 'View overdue evidence: Alex / Primary responsibility' })).toBeVisible();
    for (const card of c.getAllByRole('region').filter(region => region.getAttribute('aria-labelledby') &&
      region.querySelector('h2')?.textContent?.startsWith('Breakdown /'))) {
      const action = within(card).getByRole('button', { name: /View overdue evidence:/ });
      await expect(action.getBoundingClientRect().bottom).toBeLessThanOrEqual(card.getBoundingClientRect().bottom);
      await expect(action.getBoundingClientRect().right).toBeLessThanOrEqual(card.getBoundingClientRect().right);
    }
    await userEvent.click(c.getByRole('button', { name: 'View overdue evidence: Blair / Supporting participation' }));
    await expect(args.onEvidence).toHaveBeenLastCalledWith('member-b:supporting:overdue');
    await expect(c.getByRole('button', { name: 'View record: D0 / overdue repair' })).toBeVisible();
    await expect(c.queryByRole('button', { name: 'View record: D1 / due today' })).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'View record: D0 / overdue repair' }));
    await expect(args.onRecord).toHaveBeenLastCalledWith('d0');
    await userEvent.click(c.getByRole('button', { name: 'Preview CSV' }));
    await expect(args.onExport).toHaveBeenCalledTimes(1);
    await userEvent.click(c.getByRole('button', { name: 'View Waiting evidence: Alex / Supporting participation' }));
    await expect(c.getByRole('button', { name: 'View record: D2 / Waiting at due-soon boundary' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'View workload evidence: Casey / Primary responsibility' }));
    await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
    await userEvent.click(within(primary).getByRole('button', { name: 'View supporting evidence: Scheduled' }));
    await expect(args.onEvidence).toHaveBeenLastCalledWith('member-a:primary:scheduled');
    await expect(c.getByRole('button', { name: 'View record: D1 / due today' })).toBeVisible();
    await userEvent.click(summary.getByRole('button', { name: 'Actions: No current primary owner' }));
    await userEvent.click(await within(canvasElement.ownerDocument.body).findByRole('menuitem', { name: 'View supporting evidence' }));
    await expect(c.getByRole('button', { name: 'View record: D3 / no deadline or primary owner' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'View overdue evidence: No current primary owner' }));
    await expect(args.onEvidence).toHaveBeenLastCalledWith('unassigned:overdue');
    await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
    await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
    await userEvent.click(summary.getByRole('button', { name: 'Actions: Active Jobs' }));
    await userEvent.click(await within(canvasElement.ownerDocument.body).findByRole('menuitem', { name: 'View supporting evidence' }));
  },
};
export const MySupportingWorkload: Story = { args: { state: { kind: 'ready', result: myJobsResult } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement), summary = within(c.getByRole('region', { name: 'Report summary' }));
  await expect(c.getByRole('heading', { name: 'My workload / Jobs' })).toBeVisible();
  await expect(summary.getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('2');
  await expect(c.getByRole('heading', { name: 'Breakdown / Me / Supporting participation' })).toBeVisible();
  await expect(c.queryByText(/Unreliable unrelated primary|Unreliable hidden roster/)).not.toBeInTheDocument();
  await expect(c.queryByText('Alex')).not.toBeInTheDocument();
  await expect(c.queryByText('Blair')).not.toBeInTheDocument();
  await expect(c.queryByText('Casey')).not.toBeInTheDocument();
  await expect(summary.queryByRole('group', { name: 'No current primary owner' })).not.toBeInTheDocument();
  await expect(c.queryByRole('region', { name: 'Breakdown / No current primary owner' })).not.toBeInTheDocument();
} };
export const SharedJobDistinctCount: Story = {
  args: { state: { kind: 'ready', result: { ...result, counts: { active: 1, overdue: 1, waiting: 0 }, rows: [rows[0]!],
    members: result.members.map(member => ({ ...member,
      primary: teamJobWorkload(rows[0]!.primary.kind === 'member' && rows[0]!.primary.id === member.id ? [rows[0]!] : [], `${member.id}:primary`),
      supporting: teamJobWorkload(rows[0]!.supportingMemberIds.includes(member.id) ? [rows[0]!] : [], `${member.id}:supporting`),
    })), unassigned: teamJobWorkload([], 'unassigned'),
  } } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(within(c.getByRole('region', { name: 'Report summary' })).getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('1');
    for (const name of ['Alex / Primary responsibility', 'Blair / Supporting participation', 'Casey / Supporting participation']) {
      await expect(within(c.getByRole('region', { name: `Breakdown / ${name}` })).getByText(/Total supporting rows:/)).toHaveTextContent('1');
    }
    await expect(c.getAllByRole('button', { name: 'View record: D0 / overdue repair' })).toHaveLength(1);
  },
};
export const Overdue: Story = { args: { state: { kind: 'ready', result: { ...result, selected: { kind: 'queue', queue: 'overdue' }, rows: [rows[0]!] } } } };
export const Waiting: Story = { args: { state: { kind: 'ready', result: { ...result, selected: { kind: 'queue', queue: 'waiting' }, rows: [rows[2]!] } } } };
export const RemovedPrimaryOwner: Story = { args: { state: { kind: 'ready', result: { ...result, selected: { kind: 'queue', queue: 'unassigned' },
  rows: [{ ...rows[3]!, cells: { ...rows[3]!.cells, owner: 'Unreliable former owner' } }],
} } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByText('Unreliable former owner')).not.toBeInTheDocument();
} };
export const Empty: Story = { args: { state: { kind: 'ready', result: { ...result, counts: { active: 0, overdue: 0, waiting: 0 }, members: [], rows: [],
  unassigned: teamJobWorkload([], 'unassigned'),
} } }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled(); } };
export const Loading: Story = { args: { state: { kind: 'loading' } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('region', { name: 'Report summary' })).not.toBeInTheDocument();
} };
export const Error: Story = { args: { state: { kind: 'error' } }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Retry report' }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByText('Blair')).not.toBeInTheDocument();
  await expect(within(canvasElement).queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
} };
export const ExportDenied: Story = { args: { canExport: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const button of c.getAllByRole('button', { name: /Actions:|View supporting evidence:|View workload evidence:|View overdue evidence:|View Waiting evidence:|View record:/ })) await expect(button).toBeDisabled();
  await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
  await expect(args.onEvidence).not.toHaveBeenCalled();
} };
export const DuplicateParticipation: Story = { args: { state: { kind: 'ready', result: { ...result,
  rows: [{ ...rows[0]!, supportingMemberIds: ['member-b', 'member-b'] }, ...rows.slice(1)],
} } }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('alert')).toBeVisible(); } };
export const ClosedEvidence: Story = { args: { state: { kind: 'ready', result: { ...result,
  rows: [{ ...rows[0]!, status: 'completed' }, ...rows.slice(1)],
} } }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('alert')).toBeVisible(); } };
export const AssignedScopeLeak: Story = { args: { state: { kind: 'ready', result: { ...result, scope: { kind: 'assigned', currentMemberId: 'member-c' } } } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('alert')).toBeVisible();
    await expect(within(canvasElement).queryByText('Alex')).not.toBeInTheDocument();
  },
};
export const Pagination: Story = {
  render: function Render(args) {
    const [pagination, setPagination] = useState({ page: 1, pageSize: 2 });
    return <TeamJobsReport {...args} state={{ kind: 'ready', result: { ...result, ...pagination,
      rows: rows.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize) } }}
      onPageChange={page => { args.onPageChange(page); setPagination(current => ({ ...current, page })); }}
      onPageSizeChange={pageSize => { args.onPageSizeChange(pageSize); setPagination({ page: 1, pageSize }); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(2);
    await expect(c.getByRole('button', { name: 'View record: D2 / Waiting at due-soon boundary' })).toBeVisible();
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Rows per page' }), '25');
    await expect(args.onPageSizeChange).toHaveBeenLastCalledWith(25);
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
  },
};
export const Help: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const trigger = c.getByRole('button', { name: 'About Team Jobs workload' });
  trigger.focus(); await userEvent.keyboard('{Enter}');
  const dialog = await body.findByRole('dialog', { name: 'About Team Jobs workload' });
  await waitFor(() => expect(dialog).toBeVisible());
  await expect(within(dialog).getByText(/Supporting participation is non-additive across members/)).toBeVisible();
  await expect(within(dialog).getByText(/Counts are distinct Jobs, not hours/)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
export const LongLabels: Story = { args: { state: { kind: 'ready', result: { ...result,
  members: result.members.map(member => ({ ...member, label: `${member.label} ${'Authorized-member-name-'.repeat(12)}` })),
  rows: rows.map(row => ({ ...row, label: `${row.label} ${'Job-label-'.repeat(12)}` })),
} } } };
export const CalloutMenus: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const summary = within(c.getByRole('region', { name: 'Report summary' }));
  await expect(summary.queryByRole('button', { name: /View supporting evidence:/ })).not.toBeInTheDocument();
  const cards = ['Active Jobs', 'Overdue', 'Waiting', 'No current primary owner'].map(label =>
    summary.getByRole('group', { name: label }).getBoundingClientRect());
  if (canvasElement.ownerDocument.defaultView!.matchMedia('(min-width: 1200px)').matches) {
    for (let index = 1; index < cards.length; index++) {
      await expect(cards[index]!.top).toBe(cards[0]!.top);
      await expect(cards[index]!.left).toBeGreaterThan(cards[index - 1]!.left);
    }
  } else if (canvasElement.ownerDocument.defaultView!.matchMedia('(min-width: 900px)').matches) {
    await expect(cards[0]!.top).toBe(cards[1]!.top);
    await expect(cards[2]!.top).toBe(cards[3]!.top);
    await expect(cards[2]!.top).toBeGreaterThanOrEqual(Math.max(cards[0]!.bottom, cards[1]!.bottom));
  } else {
    for (let index = 1; index < cards.length; index++) await expect(cards[index]!.top).toBeGreaterThanOrEqual(cards[index - 1]!.bottom);
  }
  for (const [label, evidenceId] of [['Active Jobs', 'active'], ['Overdue', 'overdue'], ['Waiting', 'waiting'], ['No current primary owner', 'unassigned']]) {
    const trigger = summary.getByRole('button', { name: `Actions: ${label}` });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    const item = await body.findByRole('menuitem', { name: 'View supporting evidence' });
    await waitFor(() => expect(item).toBeVisible());
    await userEvent.click(item);
    await expect(args.onEvidence).toHaveBeenLastCalledWith(evidenceId);
    await waitFor(() => expect(body.queryByRole('menuitem')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  }
  const trigger = summary.getByRole('button', { name: 'Actions: Active Jobs' });
  await userEvent.click(trigger);
  await body.findByRole('menuitem', { name: 'View supporting evidence' });
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('menuitem')).not.toBeInTheDocument());
  await expect(args.onEvidence).toHaveBeenCalledTimes(4);
} };
