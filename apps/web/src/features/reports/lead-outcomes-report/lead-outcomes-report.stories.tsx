import { useState } from 'react';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { LeadOutcomesReport, type LeadOutcome, type LeadOutcomesResult } from './lead-outcomes-report';
import { leadOutcomesReportData as copy } from './lead-outcomes-report.data';

const rows: Record<LeadOutcome, LeadOutcomesResult['rows']> = {
  won: [{ id: 'l2', label: 'Referral inquiry', recordId: 'lead-2', cells: { transition: 'Oct 22, 2026', assignment: 'Teammate B', source: 'Referral' } }],
  lost: [
    { id: 'l2', label: 'Referral inquiry', recordId: 'lead-2', cells: { transition: 'Oct 18, 2026', assignment: 'Teammate B', source: 'Referral' } },
    { id: 'l3', label: 'Archived phone inquiry', recordId: 'lead-3', cells: { transition: 'Oct 30, 2026', assignment: 'Teammate B', source: 'Phone' } },
  ],
};
const result: LeadOutcomesResult = {
  periodLabel: 'Oct 1 to Oct 31, 2026, both dates included',
  snapshotLabel: 'Nov 5, 2026 at 10:00 / Europe/Warsaw',
  scopeLabel: 'All authorized assignments. Authorized archives included.',
  counts: { won: 1, lost: 2 }, coverage: { kind: 'complete' },
  evidenceIds: { won: 'won-evidence', lost: 'lost-evidence' },
  selectedOutcome: 'won', rows: rows.won, page: 1, pageSize: 25,
};
const meta = {
  title: 'Reports/LeadOutcomesReport', component: LeadOutcomesReport, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical recorded-outcome composition with fictional authorized responses. Counts are distinct leads per outcome, not event counts or current-stage counts. Won/Lost can overlap; there is no exclusive breakdown. The host owns coverage, period predicates, authorized archives, projection selection, pagination, record dialogs and CSV review. No production API or page is enabled.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="max-w-6xl"><Story /></div></main>],
  args: { state: { kind: 'ready', result }, canRead: true, canExport: true, canEdit: true,
    onEvidence: fn(), onRecord: fn(), onExport: fn(), onPageChange: fn(), onPageSizeChange: fn(), onRetry: fn(), onEdit: fn() },
} satisfies Meta<typeof LeadOutcomesReport>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function Render(args) {
    const [selectedOutcome, setOutcome] = useState<LeadOutcome>('won');
    return <LeadOutcomesReport {...args} state={{ kind: 'ready', result: { ...result, selectedOutcome, rows: rows[selectedOutcome] } }}
      onEvidence={evidenceId => { args.onEvidence(evidenceId); setOutcome(evidenceId === 'lost-evidence' ? 'lost' : 'won'); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const summary = within(c.getByRole('region', { name: 'Report summary' }));
    await expect(summary.getByRole('group', { name: 'Won' })).toHaveTextContent('1');
    await expect(summary.getByRole('group', { name: 'Lost' })).toHaveTextContent('2');
    await expect(c.queryByText(copy.overlap)).not.toBeInTheDocument();
    await expect(c.queryByRole('meter')).not.toBeInTheDocument();
    await selectMetricEvidence(canvasElement, 'Lost');
    await expect(args.onEvidence).toHaveBeenLastCalledWith('lost-evidence');
    await expect(c.getAllByText('Recorded Lost transitions', { exact: true }).some(element => element.tagName === 'P')).toBe(true);
    await userEvent.click(c.getByRole('button', { name: 'View record: Archived phone inquiry' }));
    await expect(args.onRecord).toHaveBeenLastCalledWith('lead-3');
    await userEvent.click(c.getByRole('button', { name: 'Preview CSV' }));
    await expect(args.onExport).toHaveBeenCalledTimes(1);
    await selectMetricEvidence(canvasElement, 'Won');
    await expect(args.onEvidence).toHaveBeenLastCalledWith('won-evidence');
    await expect(c.getAllByText('Recorded Won transitions', { exact: true }).some(element => element.tagName === 'P')).toBe(true);
  },
};
export const LostEvidence: Story = { args: { state: { kind: 'ready', result: { ...result, selectedOutcome: 'lost', rows: rows.lost } } } };
export const IncompleteHistory: Story = {
  args: { state: { kind: 'ready', result: { ...result, coverage: { kind: 'partial', explanation: 'Older leads have creation events only. Current Won/Lost stages cannot reconstruct missing transition dates.' } } } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/Older leads have creation events only/)).toBeVisible();
    await expect(within(canvasElement).getAllByText('Stage-history coverage is incomplete', { exact: true })).toHaveLength(2);
  },
};
export const EmptyRecordedOutcomes: Story = {
  args: { state: { kind: 'ready', result: { ...result, counts: { won: 0, lost: 0 }, rows: [] } } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('group', { name: 'Won' })).toHaveTextContent('0');
    await expect(c.getByRole('group', { name: 'Lost' })).toHaveTextContent('0');
    await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
  },
};
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
  await expect(c.queryByText('Referral inquiry')).not.toBeInTheDocument();
} };
export const ExportDenied: Story = { args: { canExport: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const name of ['Actions: Won', 'Actions: Lost', 'Preview CSV', 'View record: Referral inquiry']) {
    const button = c.getByRole('button', { name });
    await expect(button).toBeDisabled();
    await userEvent.click(button);
  }
  await expect(args.onEvidence).not.toHaveBeenCalled();
  await expect(args.onRecord).not.toHaveBeenCalled();
  await expect(args.onExport).not.toHaveBeenCalled();
} };
export const RecordNavigationUnavailable: Story = {
  args: { state: { kind: 'ready', result: { ...result, rows: rows.won.map(row => ({ ...row, recordId: undefined })) } } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button', { name: 'View record: Referral inquiry' })).not.toBeInTheDocument();
  },
};
export const NoMetricEvidenceActions: Story = {
  args: { state: { kind: 'ready', result: { ...result, evidenceIds: {} } } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button', { name: /Actions:/ })).not.toBeInTheDocument();
  },
};
export const InvalidCounts: Story = { args: { state: { kind: 'ready', result: { ...result, counts: { won: Number.MAX_SAFE_INTEGER + 1, lost: 2 } } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
  await expect(within(canvasElement).queryByRole('group')).not.toBeInTheDocument();
} };
export const InvalidEvidence: Story = { args: { state: { kind: 'ready', result: { ...result, rows: [] } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
  await expect(within(canvasElement).queryByRole('group')).not.toBeInTheDocument();
} };
export const DuplicateLeads: Story = { args: { state: { kind: 'ready', result: { ...result, selectedOutcome: 'lost', rows: [rows.won[0]!, rows.won[0]!] } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
} };
export const MissingCoverageExplanation: Story = { args: { state: { kind: 'ready', result: { ...result, coverage: { kind: 'partial', explanation: ' ' } } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
} };
export const HeaderTooltips: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const context = `${result.snapshotLabel} / ${copy.basis} / ${result.periodLabel} / ${result.scopeLabel} / ${copy.evidenceBasis}`;
  await expect(c.queryByText(copy.overlap)).not.toBeInTheDocument();
  await expect(c.queryByText(context)).not.toBeInTheDocument();
  for (const [label, text] of [['About lead outcomes', copy.overlap], ['About CSV export scope', context]]) {
    const trigger = c.getByRole('button', { name: label });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    const dialog = await body.findByRole('dialog', { name: label });
    await waitFor(() => expect(dialog).toBeVisible());
    await expect(within(dialog).getByText(text)).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  }
} };
