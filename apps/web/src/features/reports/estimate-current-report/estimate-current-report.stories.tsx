import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { EstimateCurrentReport, type EstimateCurrentReportState } from './estimate-current-report';
import { estimateCurrentFamilies, estimateCurrentResponse, invalidCurrentSnapshotFamilies, unavailableHandoffFamilies } from './estimate-current-report.fixtures';
import { estimateCurrentReportData as copy } from './estimate-current-report.data';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';

const result = estimateCurrentResponse();
const meta = {
  title: 'Reports/EstimateCurrentReport', component: EstimateCurrentReport, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical current issued quote/expiry/handoff report using matching fictional host responses. Latest issued revision ignores newer drafts; archives/voids are excluded. Expiry before business-local today is expired; today and no expiry remain awaiting. Issued age does not reset on resend. Frozen pre-tax/customer total are separate, behind explicit money grants. Handoff requires active accepted lead-parent quotes and complete visibility proving no accepted-estimate or source-lead Job; Job-parent/archived-lead/already-converted quotes are excluded. Missing linkage visibility is unavailable, never zero/not converted. No conversion action, production API, real snapshot hashing or query.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-6xl"><Story /></div></main>],
  args: { state: { kind: 'ready', result }, canRead: true, canReadMoney: true, canReadHandoff: true, canExport: true, canEdit: true,
    onEvidence: fn(), onRecord: fn(), onExport: fn(), onPageChange: fn(), onPageSizeChange: fn(), onRetry: fn(), onEdit: fn() },
} satisfies Meta<typeof EstimateCurrentReport>;
export default meta;
type Story = StoryObj<typeof meta>;
const summary = (canvasElement: HTMLElement) => within(within(canvasElement).getByRole('region', { name: 'Report summary' }));
async function visibleText(canvasElement: HTMLElement, text: string) {
  await expect(within(canvasElement).getAllByText(text).find(element => element.getBoundingClientRect().width > 0)).toBeVisible();
}

export const Default: Story = {
  render: function Render(args) {
    const [state, setState] = useState<EstimateCurrentReportState>(args.state);
    return <EstimateCurrentReport {...args} state={state} onEvidence={id => {
      args.onEvidence(id);
      if (id !== 'awaiting' && id !== 'expired' && id !== 'handoff') throw new RangeError('Unknown mock current Estimate evidence.');
      setState({ kind: 'ready', result: estimateCurrentResponse(estimateCurrentFamilies, id) });
    }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement), s = summary(canvasElement);
    await expect(s.getByRole('group', { name: copy.awaiting })).toHaveTextContent('4');
    await expect(s.getByRole('group', { name: copy.value })).toHaveTextContent('$650.00');
    await expect(s.getByRole('group', { name: copy.expired })).toHaveTextContent('1');
    await expect(s.getByRole('group', { name: copy.handoff })).toHaveTextContent('1');
    await expect(c.getByText(/Awaiting customer tax-inclusive total:/)).toHaveTextContent('$715.00');
    const cards = [copy.awaiting, copy.value, copy.expired, copy.handoff].map(label => s.getByRole('group', { name: label }).getBoundingClientRect());
    const window = canvasElement.ownerDocument.defaultView!;
    if (window.matchMedia('(min-width: 1200px)').matches) {
      for (const card of cards) await expect(card.top).toBe(cards[0]!.top);
    } else if (window.matchMedia('(min-width: 900px)').matches) {
      await expect(cards[0]!.top).toBe(cards[1]!.top);
      await expect(cards[2]!.top).toBe(cards[3]!.top);
    } else for (let i = 1; i < cards.length; i++) await expect(cards[i]!.top).toBeGreaterThanOrEqual(cards[i - 1]!.bottom);
    await expect(c.getByRole('region', { name: 'Supporting evidence' }).getBoundingClientRect().top)
      .toBeGreaterThanOrEqual(Math.max(...cards.map(card => card.bottom)));
    await visibleText(canvasElement, 'E1 / revision 1');
    await visibleText(canvasElement, '41 days');
    await visibleText(canvasElement, 'No expiry date');
    await selectMetricEvidence(canvasElement, copy.value);
    await expect(args.onEvidence).toHaveBeenLastCalledWith('awaiting');
    await selectMetricEvidence(canvasElement, copy.expired);
    await expect(c.getByRole('button', { name: 'View record: YESTERDAY / issued revision 1' })).toBeVisible();
    await expect(c.queryByRole('button', { name: 'View record: TODAY / issued revision 1' })).not.toBeInTheDocument();
    await selectMetricEvidence(canvasElement, copy.handoff);
    await expect(args.onEvidence).toHaveBeenLastCalledWith('handoff');
    await expect(c.getByRole('button', { name: 'View record: HANDOFF / issued revision 1' })).toBeVisible();
    await expect(c.queryByRole('button', { name: /View record: CONVERTED|View record: OTHER-JOB|View record: JOB-PARENT/ })).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'View record: HANDOFF / issued revision 1' }));
    await expect(args.onRecord).toHaveBeenLastCalledWith('fixture:HANDOFF:r1');
    await userEvent.click(c.getByRole('button', { name: 'Preview CSV' }));
    await expect(args.onExport).toHaveBeenCalledTimes(1);
    await selectMetricEvidence(canvasElement, copy.awaiting);
    await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
  },
};
export const IssuedQuoteDespiteDraft: Story = { args: { state: { kind: 'ready', result: estimateCurrentResponse(estimateCurrentFamilies.filter(family => ['E1', 'E4'].includes(family.number))) } },
  play: async ({ canvasElement }) => {
    await expect(summary(canvasElement).getByRole('group', { name: copy.awaiting })).toHaveTextContent('2');
    await expect(summary(canvasElement).getByRole('group', { name: copy.value })).toHaveTextContent('$250.00');
    await visibleText(canvasElement, 'E1 / revision 1');
    await visibleText(canvasElement, '41 days');
  } };
export const ExpiryBoundary: Story = { args: { state: { kind: 'ready', result: estimateCurrentResponse(estimateCurrentFamilies, 'expired') } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('button', { name: 'View record: YESTERDAY / issued revision 1' })).toBeVisible();
    await expect(c.queryByRole('button', { name: 'View record: TODAY / issued revision 1' })).not.toBeInTheDocument();
    await visibleText(canvasElement, '2026-11-04');
  } };
export const AcceptedHandoff: Story = { args: { state: { kind: 'ready', result: estimateCurrentResponse(estimateCurrentFamilies, 'handoff') } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('button', { name: 'View record: HANDOFF / issued revision 1' })).toBeVisible();
    await expect(c.queryByRole('button', { name: /Convert/ })).not.toBeInTheDocument();
    await visibleText(canvasElement, '2026-10-25');
  } };
export const UnavailableHandoff: Story = { args: { state: { kind: 'ready', result: estimateCurrentResponse(unavailableHandoffFamilies, 'handoff') } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText(/Lead\/Job linkage visibility is incomplete/)).toBeVisible();
    await expect(c.queryByRole('button', { name: `Actions: ${copy.handoff}` })).not.toBeInTheDocument();
    await expect(c.queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
    await expect(summary(canvasElement).getByRole('group', { name: copy.awaiting })).toHaveTextContent('4');
  } };
export const HandoffAccessRevoked: Story = { args: { canReadHandoff: false, state: { kind: 'ready', result: estimateCurrentResponse(estimateCurrentFamilies, 'handoff') } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText(copy.handoffDenied)).toBeVisible();
    await expect(c.queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
    await expect(c.queryByText('HANDOFF / issued revision 1')).not.toBeInTheDocument();
    await expect(c.queryByRole('button', { name: `Actions: ${copy.handoff}` })).not.toBeInTheDocument();
  } };
export const MoneyAccessRevoked: Story = { args: { canReadMoney: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByText(copy.moneyDenied)).toBeVisible();
  await expect(c.queryByText('$650.00')).not.toBeInTheDocument();
  await expect(c.queryByText('$715.00')).not.toBeInTheDocument();
  await expect(c.queryByText('$50.00')).not.toBeInTheDocument();
  await expect(c.queryByRole('columnheader', { name: 'Frozen pre-tax value' })).not.toBeInTheDocument();
  await expect(c.queryByRole('button', { name: `Actions: ${copy.value}` })).not.toBeInTheDocument();
  await expect(c.getByRole('button', { name: `Actions: ${copy.awaiting}` })).toBeEnabled();
} };
export const InvalidSnapshot: Story = { args: { state: { kind: 'ready', result: estimateCurrentResponse(invalidCurrentSnapshotFamilies) } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(summary(canvasElement).getByRole('group', { name: copy.awaiting })).toHaveTextContent('4');
    await expect(c.getByText(/An awaiting issued snapshot failed host validation/)).toBeVisible();
    await expect(c.queryByText('$650.00')).not.toBeInTheDocument();
    await expect(summary(canvasElement).getByRole('group', { name: copy.value })).not.toHaveTextContent('$0.00');
  } };
export const Empty: Story = { args: { state: { kind: 'ready', result: estimateCurrentResponse([]) } }, play: async ({ canvasElement }) => {
  await expect(summary(canvasElement).getByRole('group', { name: copy.awaiting })).toHaveTextContent('0');
  await expect(summary(canvasElement).getByRole('group', { name: copy.value })).toHaveTextContent('$0.00');
  await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
export const NoEvidenceReferences: Story = { args: { state: { kind: 'ready', result: { ...result, evidenceIds: {}, handoff: { kind: 'available', count: 1 } } } },
  play: async ({ canvasElement }) => { await expect(within(canvasElement).queryByRole('button', { name: /^Actions:/ })).not.toBeInTheDocument(); } };
export const InvalidCounts: Story = { args: { state: { kind: 'ready', result: { ...result, counts: { awaiting: -1, expired: 1 } } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toHaveTextContent(copy.invalid);
  await expect(within(canvasElement).queryByRole('region', { name: 'Report summary' })).not.toBeInTheDocument();
} };
export const DuplicateFamilies: Story = { ...InvalidCounts, args: { state: { kind: 'ready',
  result: { ...result, rows: [result.rows[0]!, result.rows[0]!, ...result.rows.slice(2)] } } } };
export const MismatchedExpiry: Story = { ...InvalidCounts, args: { state: { kind: 'ready',
  result: { ...result, rows: result.rows.map(row => ({ ...row, validUntil: '2026-11-04' })) } } } };
export const InvalidFrozenTotals: Story = { ...InvalidCounts, args: { state: { kind: 'ready',
  result: { ...result, awaitingMoney: { kind: 'available', preTaxCents: 1, customerTotalCents: 1 } } } } };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toBeVisible();
  await expect(c.queryByRole('region', { name: 'Report summary' })).not.toBeInTheDocument();
  await expect(c.queryByText('$650.00')).not.toBeInTheDocument();
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
    return <EstimateCurrentReport {...args} state={{ kind: 'ready', result: estimateCurrentResponse(estimateCurrentFamilies, 'awaiting', page, size) }}
      onPageChange={next => { args.onPageChange(next); setPage(next); }}
      onPageSizeChange={next => { args.onPageSizeChange(next); setSize(next); setPage(1); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(2);
    await expect(c.getByRole('button', { name: 'View record: E4 / issued revision 1' })).toBeVisible();
    await expect(summary(canvasElement).getByRole('group', { name: copy.value })).toHaveTextContent('$650.00');
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
  for (const text of [copy.issued, copy.expiry, copy.money, copy.handoffDefinition, copy.handoffDenied]) await expect(within(dialog).getByText(text)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
