import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { EstimateFirstQuotedReport } from './estimate-first-quoted-report';
import { estimateFirstQuotedResponse, estimateIssuanceFamilies } from './estimate-first-quoted-report.fixtures';
import { estimateFirstQuotedReportData as copy } from './estimate-first-quoted-report.data';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';

const result = estimateFirstQuotedResponse();
const meta = {
  title: 'Reports/EstimateFirstQuotedReport', component: EstimateFirstQuotedReport, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical first-quoted family count/evidence with approved E04 fixtures. Earliest persisted initial Send/Publish across family revisions is selected before period filtering. Resends and newer drafts do not add families. Archived/voided families retain issuance history subject to current authorization. Evidence separates original issuance from current issued revision/state; no money, current-attention or acceptance-funnel inference. Host discloses incomplete history; no guessed backfill. Fictional events only, not production queries. Workspace integration follows component review.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-6xl"><Story /></div></main>],
  args: { state: { kind: 'ready', result }, canRead: true, canExport: true, canEdit: true,
    onEvidence: fn(), onRecord: fn(), onExport: fn(), onPageChange: fn(), onPageSizeChange: fn(), onRetry: fn(), onEdit: fn() },
} satisfies Meta<typeof EstimateFirstQuotedReport>;
export default meta;
type Story = StoryObj<typeof meta>;
const summary = (element: HTMLElement) => within(within(element).getByRole('region', { name: 'Report summary' }));
async function visibleText(element: HTMLElement, text: string) {
  await expect(within(element).getAllByText(text).find(match => match.getBoundingClientRect().width > 0)).toBeVisible();
}
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(summary(canvasElement).getByRole('group', { name: copy.metric })).toHaveTextContent('4');
  await expect(c.getAllByRole('button', { name: /^View record:/ })).toHaveLength(4);
  await expect(c.queryByRole('button', { name: 'View record: E1 / first quoted family' })).not.toBeInTheDocument();
  await visibleText(canvasElement, '2026-10-02');
  await visibleText(canvasElement, '2026-10-05');
  await visibleText(canvasElement, 'E2 / revision 2');
  await visibleText(canvasElement, '2026-10-20');
  await visibleText(canvasElement, 'Declined / archived');
  await visibleText(canvasElement, 'Void');
  await selectMetricEvidence(canvasElement, copy.metric);
  await expect(args.onEvidence).toHaveBeenLastCalledWith('first-quoted');
  await userEvent.click(c.getByRole('button', { name: 'View record: E2 / first quoted family' }));
  await expect(args.onRecord).toHaveBeenLastCalledWith('workspace-fixture:E2:r2');
  await userEvent.click(c.getByRole('button', { name: 'Preview CSV' }));
  await expect(args.onExport).toHaveBeenCalledTimes(1);
  await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
  await expect(c.getByRole('region', { name: 'Supporting evidence' }).getBoundingClientRect().top)
    .toBeGreaterThanOrEqual(c.getByRole('region', { name: 'Report summary' }).getBoundingClientRect().bottom);
} };
export const EarlierFirstIssue: Story = { args: { state: { kind: 'ready',
  result: estimateFirstQuotedResponse(estimateIssuanceFamilies, 1, 25, '2026-09-01', '2026-09-30') } },
  play: async ({ canvasElement }) => {
    await expect(summary(canvasElement).getByRole('group', { name: copy.metric })).toHaveTextContent('1');
    await visibleText(canvasElement, '2026-09-25');
    await visibleText(canvasElement, 'E1 / revision 1');
  } };
export const ReissueIsNotFirstQuote: Story = { args: { state: { kind: 'ready',
  result: estimateFirstQuotedResponse(estimateIssuanceFamilies, 1, 25, '2026-10-20', '2026-10-20') } },
  play: async ({ canvasElement }) => {
    await expect(summary(canvasElement).getByRole('group', { name: copy.metric })).toHaveTextContent('0');
    await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
  } };
export const PartialHistory: Story = { args: { state: { kind: 'ready', result: { ...result,
  coverage: { kind: 'partial', explanation: 'Some authorized families lack their original persisted issuance; no dates were reconstructed.' } } } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByRole('status').find(status => status.textContent?.includes(copy.coverage))).toBeVisible();
    await expect(c.getByText('Known recorded families only; not a complete first-quoted total.')).toBeVisible();
    await expect(summary(canvasElement).getByRole('group', { name: copy.metric })).toHaveTextContent('4');
  } };
export const Empty: Story = { args: { state: { kind: 'ready', result: estimateFirstQuotedResponse([]) } }, play: ReissueIsNotFirstQuote.play };
export const NoEvidenceReference: Story = { args: { state: { kind: 'ready', result: { ...result, evidenceId: undefined } } },
  play: async ({ canvasElement }) => { await expect(within(canvasElement).queryByRole('button', { name: /^Actions:/ })).not.toBeInTheDocument(); } };
export const NoRecordAccess: Story = { args: { state: { kind: 'ready', result: { ...result, rows: result.rows.map(row => ({ ...row, recordId: undefined })) } } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button', { name: /^View record:/ })).not.toBeInTheDocument();
    await visibleText(canvasElement, 'E2 / first quoted family');
  } };
export const DuplicateFamilies: Story = { args: { state: { kind: 'ready',
  result: { ...result, rows: [result.rows[0]!, result.rows[0]!, ...result.rows.slice(2)] } } }, play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('alert')).toHaveTextContent(copy.invalid);
    await expect(within(canvasElement).queryByRole('region', { name: 'Report summary' })).not.toBeInTheDocument();
  } };
export const InvalidIssuanceDate: Story = { ...DuplicateFamilies, args: { state: { kind: 'ready',
  result: { ...result, rows: result.rows.map(row => ({ ...row, firstIssuedDate: '2026-11-01' })) } } } };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toBeVisible();
  await expect(c.queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
  await expect(c.queryByText('E2 / first quoted family')).not.toBeInTheDocument();
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
  await expect(c.getByRole('button', { name: `Actions: ${copy.metric}` })).toBeDisabled();
  await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
  for (const button of c.getAllByRole('button', { name: /^View record:/ })) await expect(button).toBeDisabled();
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
    return <EstimateFirstQuotedReport {...args} state={{ kind: 'ready', result: estimateFirstQuotedResponse(estimateIssuanceFamilies, page, size) }}
      onPageChange={next => { args.onPageChange(next); setPage(next); }}
      onPageSizeChange={next => { args.onPageSizeChange(next); setSize(next); setPage(1); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(2);
    await expect(c.getByRole('button', { name: 'View record: E3 / first quoted family' })).toBeVisible();
    await expect(summary(canvasElement).getByRole('group', { name: copy.metric })).toHaveTextContent('4');
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
  for (const text of [copy.definition, copy.history, copy.context]) await expect(within(dialog).getByText(text)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
