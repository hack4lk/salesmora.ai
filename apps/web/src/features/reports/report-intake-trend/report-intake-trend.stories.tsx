import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ReportIntakeTrend } from './report-intake-trend';
import { intakeTrendSpans } from './report-intake-trend.validation';

const range = { from: '2026-11-01', to: '2026-11-05' };
const buckets = intakeTrendSpans(range)!.spans.map((span, i) => ({ ...span, count: i === 0 ? 2 : 0, evidenceId: `bucket-${span.from}` }));
const meta = {
  title: 'Reports/ReportIntakeTrend', component: ReportIntakeTrend, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Chronological creation-date bars composing the canonical breakdown. Daily for 1-31 inclusive dates, Monday-Sunday weekly for 32-93, calendar months for 94-366. Exact clipped date labels disclose partial buckets; all zero buckets required. Host queries same-snapshot authorized counts and evidence. No browser aggregation of records or parallel chart UI.' } } },
  decorators: [Story => <main className="bg-canvas p-4 sm:p-8"><div className="max-w-3xl"><Story /></div></main>],
  args: { range, buckets, total: 2, canRead: true, onEvidence: fn() },
} satisfies Meta<typeof ReportIntakeTrend>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('heading', { name: 'Breakdown / Intake trend / Daily' })).toBeVisible();
  await expect(c.getAllByRole('meter', { hidden: true })).toHaveLength(5);
  await userEvent.click(c.getByRole('button', { name: 'View supporting evidence: 1 Nov 2026' }));
  await expect(args.onEvidence).toHaveBeenCalledWith('bucket-2026-11-01');
} };
export const Weekly: Story = { args: { range: { from: '2026-03-05', to: '2026-04-05' },
  buckets: intakeTrendSpans({ from: '2026-03-05', to: '2026-04-05' })!.spans.map((span, i) => ({ ...span, count: i === 0 ? 2 : 0 })) } };
export const Monthly: Story = { args: { range: { from: '2024-01-15', to: '2024-05-02' },
  buckets: intakeTrendSpans({ from: '2024-01-15', to: '2024-05-02' })!.spans.map((span, i) => ({ ...span, count: i === 0 ? 2 : 0 })) } };
export const Zero: Story = { args: { total: 0, buckets: buckets.map(bucket => ({ ...bucket, count: 0 })) }, play: async ({ canvasElement }) => {
  const meters = within(canvasElement).getAllByRole('meter', { hidden: true });
  for (const meter of meters) await expect(meter).toHaveAttribute('value', '0');
} };
export const MissingZeroBucket: Story = { args: { buckets: buckets.slice(0, 1) }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
} };
export const InvalidTotal: Story = { args: { total: 3 }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('meter', { hidden: true })).not.toBeInTheDocument();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement }) => {
  for (const button of within(canvasElement).getAllByRole('button', { name: /View supporting evidence:/ })) await expect(button).toBeDisabled();
} };
