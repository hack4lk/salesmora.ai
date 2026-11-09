import { useState } from 'react';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { LeadAttentionReport, type LeadAttentionResult } from './lead-attention-report';
import type { LeadAttentionView } from './lead-attention-report.validation';
import { leadAttentionReportData as copy } from './lead-attention-report.data';

const both = { id: 'l4', label: 'Unassigned estimate inquiry', recordId: 'lead-4',
  cells: { stage: 'Estimate sent', owner: 'No current primary owner', activity: 'Oct 29, 2026 at 09:59:59 / Europe/Warsaw', reason: 'Inactive and no current primary owner' } };
const result: LeadAttentionResult = {
  snapshotLabel: 'Nov 5, 2026 at 10:00 / Europe/Warsaw',
  scopeLabel: 'All authorized assignments. Period-result assignment and group filters do not apply.',
  inactivityCutoffLabel: 'Oct 29, 2026 at 10:00 / Europe/Warsaw',
  counts: { inactive: 1, unowned: 1, combined: 1 },
  evidenceIds: { inactive: 'inactive', unowned: 'unowned', combined: 'combined' },
  selectedView: 'combined', rows: [both], page: 1, pageSize: 25,
};
const meta = {
  title: 'Reports/LeadAttentionReport', component: LeadAttentionReport, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical current-attention UI with fictional authorized server responses. Hosts supply strict seven-day database predicates, missing current membership, distinct OR union, same-snapshot cutoff and independent current scope. Archived and closed leads are excluded. Exactly-cutoff activity is not stale. No period-row derivation, API, date arithmetic or approximate Leads URL; existing evidence and record/CSV dialogs are host-orchestrated.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="max-w-6xl"><Story /></div></main>],
  args: { state: { kind: 'ready', result }, canRead: true, canExport: true, canEdit: true,
    onEvidence: fn(), onRecord: fn(), onExport: fn(), onPageChange: fn(), onPageSizeChange: fn(), onRetry: fn(), onEdit: fn() },
} satisfies Meta<typeof LeadAttentionReport>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: function Render(args) {
    const [selectedView, select] = useState<LeadAttentionView>('combined');
    return <LeadAttentionReport {...args} state={{ kind: 'ready', result: { ...result, selectedView } }}
      onEvidence={id => { args.onEvidence(id); if (id === 'inactive' || id === 'unowned' || id === 'combined') select(id); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement), summary = within(c.getByRole('region', { name: 'Report summary' }));
    for (const view of ['inactive', 'unowned', 'combined'] as const) {
      await expect(summary.getByRole('group', { name: copy.labels[view] })).toHaveTextContent('1');
      await selectMetricEvidence(canvasElement, copy.labels[view]);
      await expect(args.onEvidence).toHaveBeenLastCalledWith(view);
      await expect(c.getAllByText(copy.labels[view], { exact: true }).some(element => element.tagName === 'P')).toBe(true);
    }
    await expect(c.queryByRole('meter')).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'View record: Unassigned estimate inquiry' }));
    await expect(args.onRecord).toHaveBeenLastCalledWith('lead-4');
    await userEvent.click(c.getByRole('button', { name: 'Preview CSV' }));
    await expect(args.onExport).toHaveBeenCalledTimes(1);
  },
};
export const HelpAndCutoff: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await expect(c.getByText(`${result.snapshotLabel} / ${copy.mode}`)).toBeVisible();
  await expect(c.queryByText(copy.overlap)).not.toBeInTheDocument();
  const trigger = c.getByRole('button', { name: copy.help });
  trigger.focus();
  await userEvent.keyboard('{Enter}');
  const dialog = await body.findByRole('dialog', { name: copy.help });
  await waitFor(() => expect(dialog).toBeVisible());
  for (const text of [copy.scope, result.scopeLabel, copy.openOnly, copy.overlap, copy.definitions.inactive, copy.definitions.unowned]) {
    await expect(within(dialog).getByText(text)).toBeVisible();
  }
  await expect(within(dialog).getByText(/Inactivity cutoff:/)).toHaveTextContent('equality is excluded');
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
export const ExactlyAtCutoffNotInactive: Story = {
  args: { state: { kind: 'ready', result: { ...result, selectedView: 'inactive', counts: { inactive: 0, unowned: 1, combined: 1 }, rows: [] } } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('group', { name: copy.labels.inactive })).toHaveTextContent('0');
    await expect(c.getByRole('group', { name: copy.labels.combined })).toHaveTextContent('1');
    await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
  },
};
export const FormerMember: Story = {
  args: { state: { kind: 'ready', result: { ...result, selectedView: 'unowned', counts: { inactive: 0, unowned: 1, combined: 1 },
    rows: [{ ...both, cells: { ...both.cells, owner: 'No current primary owner / Former owner: Teammate A',
      activity: 'Nov 5, 2026 at 09:00 / Europe/Warsaw', reason: 'No current primary owner' } }] } } },
};
export const Empty: Story = { args: { state: { kind: 'ready', result: { ...result, counts: { inactive: 0, unowned: 0, combined: 0 }, rows: [] } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('group', { name: copy.labels.combined })).toHaveTextContent('0');
  await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
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
  await expect(c.queryByText(result.snapshotLabel)).not.toBeInTheDocument();
  await expect(c.queryByText(both.label)).not.toBeInTheDocument();
} };
export const ExportDenied: Story = { args: { canExport: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const label of Object.values(copy.labels)) await expect(c.getByRole('button', { name: `Actions: ${label}` })).toBeDisabled();
  await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
  await expect(c.getByRole('button', { name: `View record: ${both.label}` })).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.help })).toBeEnabled();
  await expect(args.onEvidence).not.toHaveBeenCalled();
} };
export const EvidenceActionsUnavailable: Story = { args: { state: { kind: 'ready', result: { ...result, evidenceIds: {}, rows: [{ ...both, recordId: undefined }] } } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.queryByRole('button', { name: /Actions:/ })).not.toBeInTheDocument();
  await expect(c.queryByRole('button', { name: /View record:/ })).not.toBeInTheDocument();
} };
export const InvalidUnion: Story = { args: { state: { kind: 'ready', result: { ...result, counts: { inactive: 1, unowned: 1, combined: 3 } } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
  await expect(within(canvasElement).queryByRole('group')).not.toBeInTheDocument();
} };
export const DuplicateLeads: Story = { args: { state: { kind: 'ready', result: { ...result, counts: { inactive: 2, unowned: 2, combined: 2 }, rows: [both, both] } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
} };
export const MissingCutoff: Story = { args: { state: { kind: 'ready', result: { ...result, inactivityCutoffLabel: ' ' } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
} };
export const AssignedCurrentScope: Story = { args: { state: { kind: 'ready', result: { ...result, scopeLabel: 'Currently authorized assigned leads only; independent of period filters.' } } } };
export const LongContent: Story = { args: { state: { kind: 'ready', result: { ...result,
  scopeLabel: 'Current-authorized-scope-'.repeat(25), rows: [{ ...both, label: 'Long-lead-label-'.repeat(20) }] } } } };
