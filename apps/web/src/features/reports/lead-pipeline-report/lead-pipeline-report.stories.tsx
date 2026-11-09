import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { LeadPipelineReport, type LeadPipelineResult, type LeadPipelineRow, type LeadPipelineView } from './lead-pipeline-report';
import { leadAgeBand } from './lead-pipeline-report.validation';
import { leadPipelineReportData as copy } from './lead-pipeline-report.data';

const rows: readonly LeadPipelineRow[] = [
  { id: 'l0', label: 'Older inquiry', recordId: 'lead-0', stage: 'new', ageDays: 46, cells: { created: 'Sep 20, 2026', owner: 'Teammate A', activity: 'Nov 5, 2026 at 10:00 / Europe/Warsaw' } },
  { id: 'l1', label: 'Website inquiry', recordId: 'lead-1', stage: 'contacted', ageDays: 35, cells: { created: 'Oct 1, 2026', owner: 'Teammate A', activity: 'Oct 29, 2026 at 10:00 / Europe/Warsaw' } },
  { id: 'l4', label: 'Estimate inquiry', recordId: 'lead-4', stage: 'estimate_sent', ageDays: 5, cells: { created: 'Oct 31, 2026', owner: 'No current primary owner', activity: 'Oct 28, 2026 at 09:59 / Europe/Warsaw' } },
];
const result: LeadPipelineResult = {
  snapshotLabel: 'Nov 5, 2026 at 10:00 / Europe/Warsaw',
  scopeLabel: 'All authorized assignments. Period-result assignment and group filters do not apply.',
  total: 3, stages: { new: 1, contacted: 1, estimate_sent: 1 },
  ages: { '0-7': 1, '8-14': 0, '15-30': 0, '31+': 2 },
  evidenceIds: { pipeline: 'pipeline', new: 'new', contacted: 'contacted', estimate_sent: 'estimate_sent',
    '0-7': '0-7', '8-14': '8-14', '15-30': '15-30', '31+': '31+' },
  selectedView: { kind: 'pipeline' }, rows, page: 1, pageSize: 25,
};
const meta = {
  title: 'Reports/LeadPipelineReport', component: LeadPipelineReport, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical current pipeline and creation-age composition. Fictional independently authorized host snapshots; excludes archived and closed leads. Stage and age groups independently reconcile to the same open total and must not be added together. Hosts compute business-local date differences; UI validates band boundaries, selected projection and evidence. One evidence table serves all groups, with host-orchestrated record and CSV dialogs. No production API/page or browser date arithmetic.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="max-w-6xl"><Story /></div></main>],
  args: { state: { kind: 'ready', result }, canRead: true, canExport: true, canEdit: true,
    onEvidence: fn(), onRecord: fn(), onExport: fn(), onPageChange: fn(), onPageSizeChange: fn(), onRetry: fn(), onEdit: fn() },
} satisfies Meta<typeof LeadPipelineReport>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: function Render(args) {
    const [selectedView, select] = useState<LeadPipelineView>({ kind: 'pipeline' });
    const selectedRows = rows.filter(row => selectedView.kind === 'pipeline' || (selectedView.kind === 'stage'
      ? row.stage === selectedView.stage : leadAgeBand(row.ageDays) === selectedView.band));
    return <LeadPipelineReport {...args} state={{ kind: 'ready', result: { ...result, selectedView, rows: selectedRows } }}
      onEvidence={id => {
        args.onEvidence(id);
        if (id === 'pipeline') select({ kind: 'pipeline' });
        else if (id === 'new' || id === 'contacted' || id === 'estimate_sent') select({ kind: 'stage', stage: id });
        else if (id === '0-7' || id === '8-14' || id === '15-30' || id === '31+') select({ kind: 'age', band: id });
      }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(within(c.getByRole('region', { name: 'Report summary' })).getByRole('group', { name: 'Current open pipeline' })).toHaveTextContent('3');
    await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
    await userEvent.click(c.getByRole('button', { name: 'View supporting evidence: 31+ days' }));
    await expect(args.onEvidence).toHaveBeenLastCalledWith('31+');
    await expect(c.queryByRole('button', { name: 'View record: Estimate inquiry' })).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'View supporting evidence: Estimate sent' }));
    await expect(args.onEvidence).toHaveBeenLastCalledWith('estimate_sent');
    await userEvent.click(c.getByRole('button', { name: 'View record: Estimate inquiry' }));
    await expect(args.onRecord).toHaveBeenLastCalledWith('lead-4');
    await userEvent.click(c.getByRole('button', { name: 'Preview CSV' }));
    await expect(args.onExport).toHaveBeenCalledTimes(1);
  },
};
export const Explanation: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const trigger = c.getByRole('button', { name: copy.help });
  trigger.focus(); await userEvent.keyboard('{Enter}');
  const dialog = await body.findByRole('dialog', { name: copy.help });
  await waitFor(() => expect(dialog).toBeVisible());
  for (const text of [copy.scope, result.scopeLabel, copy.age, copy.activity]) await expect(within(dialog).getByText(text)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
export const EmptyAgeBand: Story = { args: { state: { kind: 'ready', result: { ...result, selectedView: { kind: 'age', band: '8-14' }, rows: [] } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
export const EmptyPipeline: Story = { args: { state: { kind: 'ready', result: { ...result, total: 0,
  stages: { new: 0, contacted: 0, estimate_sent: 0 }, ages: { '0-7': 0, '8-14': 0, '15-30': 0, '31+': 0 }, rows: [] } } } };
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
  await expect(c.queryByText('Older inquiry')).not.toBeInTheDocument();
} };
export const ExportDenied: Story = { args: { canExport: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  for (const button of c.getAllByRole('button', { name: /Actions:|View supporting evidence:/ })) await expect(button).toBeDisabled();
  await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
export const InvalidAgeTotals: Story = { args: { state: { kind: 'ready', result: { ...result, ages: { ...result.ages, '31+': 1 } } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
} };
export const InvalidStageTotals: Story = { args: { state: { kind: 'ready', result: { ...result, stages: { ...result.stages, new: 2 } } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
} };
export const FutureCreatedLead: Story = { args: { state: { kind: 'ready', result: { ...result, rows: rows.map(row => ({ ...row, ageDays: -1 })) } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
  await expect(within(canvasElement).queryByRole('group')).not.toBeInTheDocument();
} };
export const WrongAgeProjection: Story = { args: { state: { kind: 'ready', result: { ...result, selectedView: { kind: 'age', band: '0-7' }, rows: [rows[0]!] } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
} };
export const DuplicateLeads: Story = { args: { state: { kind: 'ready', result: { ...result, rows: [rows[0]!, rows[0]!, rows[0]!] } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
} };
