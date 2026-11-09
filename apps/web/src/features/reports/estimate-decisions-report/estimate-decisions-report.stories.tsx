import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { EstimateDecisionsReport, type EstimateDecisionsReportState } from './estimate-decisions-report';
import { estimateDecisionFamilies, estimateDecisionsResponse, invalidSnapshotFamilies, revisedWithoutDecisionFamilies } from './estimate-decisions-report.fixtures';
import { estimateDecisionsReportData as copy } from './estimate-decisions-report.data';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';

const result = estimateDecisionsResponse();
const meta = {
  title: 'Reports/EstimateDecisionsReport', component: EstimateDecisionsReport, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical period-decision component exercising approved E02/E03/E05/E06/E08 discovery fixtures. Latest issued revision and effective decision version per authorized family, filtered by business decision date; resends, drafts, void and superseded decisions do not inflate counts. Earlier periods may restate. Frozen accepted subtotal minus discount is separate from customer tax-inclusive total, not revenue/payments. Money requires explicit financial and estimate-price grants; stale money is omitted after revocation. Invalid snapshots withhold money without erasing valid counts. Existing USD money formatting is reused. Mock host snapshot validation only, not real hashing/query/API implementation.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-6xl"><Story /></div></main>],
  args: { state: { kind: 'ready', result }, canRead: true, canReadMoney: true, canExport: true, canEdit: true,
    onEvidence: fn(), onRecord: fn(), onExport: fn(), onPageChange: fn(), onPageSizeChange: fn(), onRetry: fn(), onEdit: fn() },
} satisfies Meta<typeof EstimateDecisionsReport>;
export default meta;
type Story = StoryObj<typeof meta>;
const summary = (canvasElement: HTMLElement) => within(within(canvasElement).getByRole('region', { name: 'Report summary' }));
async function expectVisibleEvidenceText(canvasElement: HTMLElement, text: string) {
  const matches = within(canvasElement).getAllByText(text);
  await expect(matches.find(element => element.getBoundingClientRect().width > 0)).toBeVisible();
}

export const Default: Story = {
  render: function Render(args) {
    const [state, setState] = useState<EstimateDecisionsReportState>(args.state);
    return <EstimateDecisionsReport {...args} state={state} onEvidence={evidenceId => {
      args.onEvidence(evidenceId);
      if (evidenceId !== 'accepted' && evidenceId !== 'declined' && evidenceId !== 'decided') throw new RangeError('Unknown mock estimate evidence');
      setState({ kind: 'ready', result: estimateDecisionsResponse(estimateDecisionFamilies, evidenceId) });
    }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement), s = summary(canvasElement);
    await expect(s.getByRole('group', { name: copy.accepted })).toHaveTextContent('1');
    await expect(s.getByRole('group', { name: copy.declined })).toHaveTextContent('1');
    await expect(s.getByRole('group', { name: copy.rate })).toHaveTextContent('50%');
    await expect(s.getByRole('group', { name: copy.value })).toHaveTextContent('$90.00');
    await expect(c.getByText(/Accepted customer tax-inclusive total:/)).toHaveTextContent('$99.00');
    const cards = [copy.accepted, copy.declined, copy.rate, copy.value].map(label => s.getByRole('group', { name: label }).getBoundingClientRect());
    if (canvasElement.ownerDocument.defaultView!.matchMedia('(min-width: 1200px)').matches) {
      for (const card of cards) await expect(card.top).toBe(cards[0]!.top);
    } else if (canvasElement.ownerDocument.defaultView!.matchMedia('(min-width: 900px)').matches) {
      await expect(cards[0]!.top).toBe(cards[1]!.top);
      await expect(cards[2]!.top).toBe(cards[3]!.top);
    } else for (let i = 1; i < cards.length; i++) await expect(cards[i]!.top).toBeGreaterThanOrEqual(cards[i - 1]!.bottom);
    await expect(c.getByRole('region', { name: 'Supporting evidence' }).getBoundingClientRect().top)
      .toBeGreaterThanOrEqual(Math.max(...cards.map(card => card.bottom)));
    await selectMetricEvidence(canvasElement, copy.accepted);
    await expect(args.onEvidence).toHaveBeenLastCalledWith('accepted');
    await expect(c.getByRole('button', { name: 'View record: E2 / effective revision 2' })).toBeVisible();
    await expect(c.queryByRole('button', { name: 'View record: E3 / effective revision 1' })).not.toBeInTheDocument();
    await selectMetricEvidence(canvasElement, copy.declined);
    await expect(args.onEvidence).toHaveBeenLastCalledWith('declined');
    await expectVisibleEvidenceText(canvasElement, '2026-10-13');
    await expectVisibleEvidenceText(canvasElement, '2026-11-02');
    await expectVisibleEvidenceText(canvasElement, 'E3 / revision 1 / archived');
    await selectMetricEvidence(canvasElement, copy.rate);
    await expect(args.onEvidence).toHaveBeenLastCalledWith('decided');
    await selectMetricEvidence(canvasElement, copy.value);
    await expect(args.onEvidence).toHaveBeenLastCalledWith('accepted');
    await userEvent.click(c.getByRole('button', { name: 'View record: E2 / effective revision 2' }));
    await expect(args.onRecord).toHaveBeenLastCalledWith('workspace-fixture:E2:r2');
    await userEvent.click(c.getByRole('button', { name: 'Preview CSV' }));
    await expect(args.onExport).toHaveBeenCalledTimes(1);
    await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
  },
};
export const BackdatedArchivedCorrection: Story = { args: { state: { kind: 'ready', result: estimateDecisionsResponse(estimateDecisionFamilies, 'declined') } },
  play: async ({ canvasElement }) => {
    await expectVisibleEvidenceText(canvasElement, '2026-10-13');
    await expectVisibleEvidenceText(canvasElement, '2026-11-02');
    await expectVisibleEvidenceText(canvasElement, 'Declined / version 2');
    await expect(summary(canvasElement).getByRole('group', { name: copy.rate })).toHaveTextContent('50%');
  } };
export const RevisionRestatement: Story = { args: { state: { kind: 'ready', result: estimateDecisionsResponse(revisedWithoutDecisionFamilies) } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(summary(canvasElement).getByRole('group', { name: copy.rate })).toHaveTextContent('100%');
    await expect(c.queryByRole('button', { name: 'View record: E3 / effective revision 1' })).not.toBeInTheDocument();
    await expect(c.getByText(/earlier periods can restate/)).toBeVisible();
  } };
export const InvalidSnapshot: Story = { args: { state: { kind: 'ready', result: estimateDecisionsResponse(invalidSnapshotFamilies) } },
  play: async ({ canvasElement }) => {
    const s = summary(canvasElement), c = within(canvasElement);
    await expect(s.getByRole('group', { name: copy.accepted })).toHaveTextContent('1');
    await expect(s.getByRole('group', { name: copy.rate })).toHaveTextContent('50%');
    await expect(s.getByRole('group', { name: copy.value })).not.toHaveTextContent('$0.00');
    await expect(c.getByText(/At least one accepted frozen snapshot/)).toBeVisible();
    await expect(c.queryByText(/Accepted customer tax-inclusive total:/)).not.toBeInTheDocument();
  } };
export const MoneyAccessRevoked: Story = { args: { canReadMoney: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(summary(canvasElement).getByRole('group', { name: copy.rate })).toHaveTextContent('50%');
  await expect(c.getByText(copy.moneyDenied)).toBeVisible();
  await expect(c.queryByRole('button', { name: `Actions: ${copy.value}` })).not.toBeInTheDocument();
  await expect(c.queryByText('$90.00')).not.toBeInTheDocument();
  await expect(c.queryByText('$99.00')).not.toBeInTheDocument();
  await expect(c.queryByRole('columnheader', { name: 'Accepted frozen pre-tax value' })).not.toBeInTheDocument();
  await expect(c.getByRole('button', { name: `Actions: ${copy.accepted}` })).toBeEnabled();
} };
export const Empty: Story = { args: { state: { kind: 'ready', result: estimateDecisionsResponse([]) } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByText(copy.empty)).toBeVisible();
  await expect(summary(canvasElement).getByRole('group', { name: copy.value })).toHaveTextContent('$0.00');
  await expect(c.queryByText('0%', { exact: true })).not.toBeInTheDocument();
  await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
export const DeclinedOnly: Story = { args: { state: { kind: 'ready', result: estimateDecisionsResponse(estimateDecisionFamilies.filter(family => family.number === 'E3')) } },
  play: async ({ canvasElement }) => { await expect(summary(canvasElement).getByRole('group', { name: copy.rate })).toHaveTextContent('0%'); } };
export const UnissuedDraftDoesNotEraseDecision: Story = { args: { state: { kind: 'ready', result: estimateDecisionsResponse(estimateDecisionFamilies.map(family => family.number === 'E2'
  ? { ...family, revisions: [...family.revisions, { ...family.revisions[1]!, revision: 3, issuedDate: undefined, decisions: [] }] } : family)) } },
  play: async ({ canvasElement }) => {
    await expect(summary(canvasElement).getByRole('group', { name: copy.rate })).toHaveTextContent('50%');
    await expectVisibleEvidenceText(canvasElement, 'E2 / revision 2');
  } };
export const NoEvidenceReferences: Story = { args: { state: { kind: 'ready', result: { ...result, evidenceIds: {} } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('button', { name: /^Actions:/ })).not.toBeInTheDocument();
} };
export const InvalidCounts: Story = { args: { state: { kind: 'ready', result: { ...result, counts: { accepted: -1, declined: 1 } } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toHaveTextContent(copy.invalid);
  await expect(within(canvasElement).queryByRole('region', { name: 'Report summary' })).not.toBeInTheDocument();
} };
export const DuplicateFamilies: Story = { ...InvalidCounts, args: { state: { kind: 'ready', result: { ...result, rows: [result.rows[0]!, result.rows[0]!] } } } };
export const InvalidFrozenTotals: Story = { ...InvalidCounts, args: { state: { kind: 'ready',
  result: { ...result, money: { kind: 'available', preTaxCents: 10000, customerTotalCents: 9900 } } } } };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toBeVisible();
  await expect(c.queryByRole('region', { name: 'Report summary' })).not.toBeInTheDocument();
  await expect(c.queryByText('$90.00')).not.toBeInTheDocument();
} };
export const Loading: Story = { args: { state: { kind: 'loading' } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
} };
export const Error: Story = { args: { state: { kind: 'error' } }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Retry report' }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const button of c.getAllByRole('button', { name: /^Actions:/ })) await expect(button).toBeDisabled();
  await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
  await expect(c.getByRole('button', { name: 'View record: E2 / effective revision 2' })).toBeDisabled();
  await expect(args.onEvidence).not.toHaveBeenCalled();
} };
export const NoExportAccess: Story = { args: { canExport: false }, play: async ({ canvasElement, args }) => {
  const button = within(canvasElement).getByRole('button', { name: 'Preview CSV' });
  await expect(button).toBeDisabled(); await userEvent.click(button);
  await expect(args.onExport).not.toHaveBeenCalled();
} };
export const Pagination: Story = {
  render: function Render(args) {
    const [page, setPage] = useState(1), [size, setSize] = useState(1);
    return <EstimateDecisionsReport {...args} state={{ kind: 'ready', result: estimateDecisionsResponse(estimateDecisionFamilies, 'decided', page, size) }}
      onPageChange={next => { args.onPageChange(next); setPage(next); }}
      onPageSizeChange={next => { args.onPageSizeChange(next); setSize(next); setPage(1); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(2);
    await expect(c.getByRole('button', { name: 'View record: E3 / effective revision 1' })).toBeVisible();
    await expect(summary(canvasElement).getByRole('group', { name: copy.value })).toHaveTextContent('$90.00');
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Rows per page' }), '25');
    await expect(args.onPageSizeChange).toHaveBeenLastCalledWith(25);
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
  },
};
export const Help: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const trigger = c.getByRole('button', { name: copy.help });
  trigger.focus(); await userEvent.keyboard('{Enter}');
  const dialog = await body.findByRole('dialog', { name: copy.help });
  await waitFor(() => expect(dialog).toBeVisible());
  for (const text of [copy.definition, copy.restatement, copy.money, copy.archives]) await expect(within(dialog).getByText(text)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
