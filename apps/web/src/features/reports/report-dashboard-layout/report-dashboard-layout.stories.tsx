import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, within } from 'storybook/test';
import { ReportDashboardLayout } from './report-dashboard-layout';
import { ReportSummary } from '../report-summary/report-summary';
import { ReportBreakdown } from '../report-breakdown/report-breakdown';

const meta = {
  title: 'Reports/ReportDashboardLayout', component: ReportDashboardLayout, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Shared opt-in layout for canonical report slices: primary content left and stacked KPIs right at 70/30 on desktop, primary then KPIs on smaller screens. Disabled by default to preserve standalone summary-first behavior. No new metric or evidence renderer.' } } },
  decorators: [Story => <main className="bg-canvas p-4 sm:p-8"><Story /></main>],
  args: {
    summary: <ReportSummary canRead snapshotLabel="Current authorized snapshot" scopeLabel="Fictional workspace scope" onEvidence={fn()}
      metrics={[{ id: 'total', label: 'Open leads', value: { kind: 'count', value: 3 }, description: 'Authorized open leads.', dateBasisLabel: 'Current snapshot' }]} />,
    children: <ReportBreakdown canRead total={3} groupLabel="Stage" contextLabel="Current snapshot"
      groups={[{ id: 'new', label: 'New', count: 3 }]} onEvidence={fn()} />,
  },
} satisfies Meta<typeof ReportDashboardLayout>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SummaryFirst: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  const summary = c.getByRole('region', { name: 'Report summary' });
  const breakdown = c.getByRole('region', { name: 'Breakdown / Stage' });
  await expect(summary.getBoundingClientRect().y).toBeLessThan(breakdown.getBoundingClientRect().y);
} };
export const Dashboard: Story = { args: { dashboard: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  const summary = c.getByRole('region', { name: 'Report summary' }).parentElement!;
  const primary = c.getByRole('region', { name: 'Breakdown / Stage' }).parentElement!;
  const left = primary.getBoundingClientRect(), right = summary.getBoundingClientRect();
  const desktop = (canvasElement.ownerDocument.defaultView?.innerWidth ?? 0) >= 1200;
  if (desktop) {
    await expect(left.width / right.width).toBeCloseTo(7 / 3, 1);
    await expect(Math.abs(left.y - right.y)).toBeLessThan(1);
  } else {
    await expect(right.y).toBeGreaterThan(left.y);
  }
} };
