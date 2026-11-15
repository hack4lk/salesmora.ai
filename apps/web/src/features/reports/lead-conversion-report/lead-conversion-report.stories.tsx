import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { LeadConversionReport, type LeadConversionResult } from './lead-conversion-report';
import { leadConversionReportData as copy } from './lead-conversion-report.data';

const conversion = { kind: 'available' as const, converted: 2, evidenceId: 'converted',
  rows: [
    { id: 'l1', label: 'Website inquiry', recordId: 'lead-1', cells: { created: 'Oct 1, 2026', jobs: 'Job A / created Nov 2, 2026 / canceled Nov 3, 2026' } },
    { id: 'l3', label: 'Archived phone inquiry', recordId: 'lead-3', cells: { created: 'Oct 20, 2026', jobs: 'Job B / created Oct 25, 2026' } },
  ], page: 1, pageSize: 25 };
const result: LeadConversionResult = {
  periodLabel: 'Oct 1 to Oct 31, 2026, both dates included',
  snapshotLabel: 'Nov 5, 2026 at 10:00 / Europe/Warsaw',
  scopeLabel: 'Workspace lead and Job access proven complete. Authorized archived leads included.',
  cohort: 4, cohortEvidenceId: 'cohort', conversion,
};
const meta = {
  title: 'Reports/LeadConversionReport', component: LeadConversionReport, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical creation-cohort conversion UI with fictional authorized responses matching discovery fixture L02: two converted leads / four cohort leads = 50%. A later-created canceled Job and an archived lead count; a Won lead without a Job does not. Hosts prove complete supporting lead/Job access, count distinct leads with surviving Jobs, and orchestrate cohort/converted evidence, record dialogs and CSV review. Withheld conversion has no numerator, rows or rate. No production API or page.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="max-w-6xl"><Story /></div></main>],
  args: { state: { kind: 'ready', result }, canRead: true, canReadConversion: true, canExport: true, canEdit: true,
    onEvidence: fn(), onRecord: fn(), onExport: fn(), onPageChange: fn(), onPageSizeChange: fn(), onRetry: fn(), onEdit: fn() },
} satisfies Meta<typeof LeadConversionReport>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), summary = within(c.getByRole('region', { name: 'Report summary' }));
  await expect(summary.getByRole('group', { name: copy.cohort })).toHaveTextContent('4');
  await expect(summary.getByRole('group', { name: copy.converted })).toHaveTextContent('2');
  await expect(summary.getByRole('group', { name: copy.rate })).toHaveTextContent('50%');
  const cards = [copy.cohort, copy.converted, copy.rate].map(label => summary.getByRole('group', { name: label }).getBoundingClientRect());
  if (canvasElement.ownerDocument.defaultView!.matchMedia('(min-width: 900px)').matches) {
    await expect(cards[0]!.top).toBe(cards[1]!.top);
    await expect(cards[1]!.top).toBe(cards[2]!.top);
    await expect(cards[2]!.left).toBeGreaterThan(cards[1]!.left);
  } else {
    await expect(cards[1]!.top).toBeGreaterThanOrEqual(cards[0]!.bottom);
    await expect(cards[2]!.top).toBeGreaterThanOrEqual(cards[1]!.bottom);
  }
  await expect(c.getByRole('region', { name: 'Supporting evidence' }).getBoundingClientRect().top)
    .toBeGreaterThanOrEqual(Math.max(...cards.map(card => card.bottom)));
  await selectMetricEvidence(canvasElement, copy.cohort);
  await expect(args.onEvidence).toHaveBeenLastCalledWith('cohort');
  await selectMetricEvidence(canvasElement, copy.converted);
  await expect(args.onEvidence).toHaveBeenLastCalledWith('converted');
  await userEvent.click(c.getByRole('button', { name: 'View record: Archived phone inquiry' }));
  await expect(args.onRecord).toHaveBeenLastCalledWith('lead-3');
  await userEvent.click(c.getByRole('button', { name: 'Preview CSV' }));
  await expect(args.onExport).toHaveBeenCalledTimes(1);
} };
export const Explanation: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const trigger = c.getByRole('button', { name: copy.help });
  trigger.focus(); await userEvent.keyboard('{Enter}');
  const dialog = await body.findByRole('dialog', { name: copy.help });
  await waitFor(() => expect(dialog).toBeVisible());
  for (const text of [copy.definition, copy.timing, copy.caution, copy.archives]) await expect(within(dialog).getByText(text)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
export const EmptyCohort: Story = { args: { state: { kind: 'ready', result: { ...result, cohort: 0, conversion: { ...conversion, converted: 0, rows: [] } } } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByText(copy.empty)).toBeVisible();
  await expect(c.queryByText('0%', { exact: true })).not.toBeInTheDocument();
  await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
export const NoConversions: Story = { args: { state: { kind: 'ready', result: { ...result, conversion: { ...conversion, converted: 0, rows: [] } } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('group', { name: copy.rate })).toHaveTextContent('0%');
} };
export const PermissionWithheld: Story = { args: { state: { kind: 'ready', result: { ...result, scopeLabel: 'Authorized assigned leads only.', conversion: { kind: 'unavailable' } } }, canReadConversion: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getAllByText(copy.permission)).toHaveLength(2);
  await expect(c.queryByRole('button', { name: 'Preview CSV' })).not.toBeInTheDocument();
  await expect(c.queryByRole('button', { name: `Actions: ${copy.converted}` })).not.toBeInTheDocument();
  await expect(c.getByRole('group', { name: copy.cohort })).toHaveTextContent('4');
} };
export const AccessRevokedWithStaleData: Story = { args: { canReadConversion: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.queryByText('Website inquiry')).not.toBeInTheDocument();
  await expect(c.queryByText('50%', { exact: true })).not.toBeInTheDocument();
  await expect(c.queryByRole('button', { name: 'Preview CSV' })).not.toBeInTheDocument();
} };
export const MultipleJobsOneLead: Story = { args: { state: { kind: 'ready', result: { ...result,
  conversion: { ...conversion, converted: 1, rows: [{ ...conversion.rows[0]!, cells: { created: 'Oct 1, 2026', jobs: 'Job A / canceled; Job C / active' } }] } } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('group', { name: copy.converted })).toHaveTextContent('1');
  await expect(within(canvasElement).getByRole('group', { name: copy.rate })).toHaveTextContent('25%');
} };
export const Loading: Story = { args: { state: { kind: 'loading' } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('group')).not.toBeInTheDocument();
} };
export const Error: Story = { args: { state: { kind: 'error' } }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Retry report' }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('group')).not.toBeInTheDocument();
  await expect(within(canvasElement).queryByText('Website inquiry')).not.toBeInTheDocument();
} };
export const ExportDenied: Story = { args: { canExport: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  for (const name of [`Actions: ${copy.cohort}`, `Actions: ${copy.converted}`, 'Preview CSV', 'View record: Website inquiry']) {
    await expect(c.getByRole('button', { name })).toBeDisabled();
  }
} };
export const InvalidNumerator: Story = { args: { state: { kind: 'ready', result: { ...result, conversion: { ...conversion, converted: 5 } } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
  await expect(within(canvasElement).queryByRole('group')).not.toBeInTheDocument();
} };
export const DuplicateLeads: Story = { args: { state: { kind: 'ready', result: { ...result, conversion: { ...conversion, rows: [conversion.rows[0]!, conversion.rows[0]!] } } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
} };
export const MissingJobEvidence: Story = { args: { state: { kind: 'ready', result: { ...result, conversion: { ...conversion, converted: 1, rows: [{ ...conversion.rows[0]!, cells: { created: 'Oct 1, 2026', jobs: null } }] } } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
} };
