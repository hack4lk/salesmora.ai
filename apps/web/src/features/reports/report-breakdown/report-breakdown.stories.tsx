import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ReportBreakdown, type ReportBreakdownGroup } from './report-breakdown';
import { reportBreakdownData as copy } from './report-breakdown.data';

const groups: readonly ReportBreakdownGroup[] = [
  { id: 'referral', label: 'Referral', count: 6, evidenceId: 'referral-leads' },
  { id: 'website', label: 'Website', count: 4, evidenceId: 'website-leads' },
  { id: 'phone', label: 'Phone', count: 2, evidenceId: 'phone-leads' },
];
const meta = {
  title: 'Reports/ReportBreakdown',
  component: ReportBreakdown,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Ready-result, non-overlapping count breakdown from the connected prototype. Native meters provide exact proportional bars without inline styling; text labels/counts remain available independently of color. Host-supplied groups must reconcile exactly with the same-snapshot authorized supporting projection. No aggregation, ranking or API; not for overlapping assignment counts or financial subtotals. Hosts replace stale results with ReportResultState on loading/error. Evidence actions request currently authorized group projections.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="max-w-4xl"><Story /></div></main>],
  args: { groupLabel: 'Source', groups, total: 12, contextLabel: 'Lead creation date / Oct 7 to Nov 5, 2026 / Europe/Warsaw / All authorized assignments', canRead: true, onEvidence: fn() },
} satisfies Meta<typeof ReportBreakdown>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getAllByRole('listitem')).toHaveLength(3);
  const meters = canvasElement.querySelectorAll('meter');
  for (const [index, group] of groups.entries()) {
    await expect(meters[index].value).toBe(group.count);
    await expect(meters[index].max).toBe(12);
    await expect(meters[index]).not.toHaveAttribute('style');
    await expect(c.getByText(group.label)).toBeVisible();
    await expect(c.getByText(String(group.count), { exact: true })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: copy.evidenceLabel(group.label) }));
    await expect(args.onEvidence).toHaveBeenLastCalledWith(group.evidenceId);
  }
} };
export const Empty: Story = { args: { total: 0, groups: [] }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('status')).toHaveTextContent(copy.empty);
  await expect(canvasElement.querySelector('meter')).toBeNull();
} };
export const ZeroCounts: Story = { args: { total: 0, groups: [{ id: 'phone', label: 'Phone', count: 0 }] }, play: async ({ canvasElement }) => {
  const meter = canvasElement.querySelector('meter')!;
  await expect(meter.value).toBe(0);
  await expect(meter.max).toBe(1);
  await expect(within(canvasElement).queryByText(copy.empty)).not.toBeInTheDocument();
} };
export const CurrentSnapshot: Story = { args: { groupLabel: 'Job status', contextLabel: 'Current active Jobs / not filtered by reporting period / Nov 5, 2026 at 10:00 / Europe/Warsaw' } };
export const InvalidCounts: Story = { args: { total: 13 }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.invalid);
  await expect(c.queryByRole('list')).not.toBeInTheDocument();
  await expect(c.queryByText('Referral')).not.toBeInTheDocument();
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.denied);
  await expect(c.queryByRole('list')).not.toBeInTheDocument();
  await expect(c.queryByText('Referral')).not.toBeInTheDocument();
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const NoEvidenceAccess: Story = { args: { groups: groups.map(group => ({ ...group, evidenceId: undefined })) }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('button', { name: /^View supporting evidence:/ })).not.toBeInTheDocument();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent(copy.pending);
  for (const button of c.getAllByRole('button', { name: /^View supporting evidence:/ })) {
    await expect(button).toBeDisabled();
    await userEvent.click(button);
  }
  await expect(args.onEvidence).not.toHaveBeenCalled();
  await expect(c.getByRole('button', { name: copy.help })).toBeEnabled();
} };
export const KeyboardEvidence: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  c.getByRole('button', { name: copy.evidenceLabel('Referral') }).focus();
  await userEvent.keyboard('{Enter}');
  await expect(args.onEvidence).toHaveBeenCalledWith('referral-leads');
} };
export const Explanation: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const trigger = c.getByRole('button', { name: copy.help });
  await userEvent.click(trigger);
  const dialog = await body.findByRole('dialog', { name: copy.help });
  await waitFor(() => expect(dialog).toBeVisible());
  await expect(within(dialog).getByText(copy.description)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
export const LongContent: Story = { args: { groupLabel: 'Authorized-group-'.repeat(12), contextLabel: 'Report-context-'.repeat(30), total: Number.MAX_SAFE_INTEGER, groups: [{ id: 'long', label: 'Long-source-label-'.repeat(20), count: Number.MAX_SAFE_INTEGER, evidenceId: 'long' }] } };
