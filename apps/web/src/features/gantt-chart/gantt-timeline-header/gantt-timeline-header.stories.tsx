import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { GanttTimelineHeader } from './gantt-timeline-header';
import { ganttTimelineHeaderData as copy } from './gantt-timeline-header.data';

const meta = {
  title: 'Gantt Chart/GanttTimelineHeader',
  component: GanttTimelineHeader,
  parameters: { layout: 'fullscreen' },
  args: { startDate: copy.stories.startDate, totalDays: copy.stories.totalDays, today: copy.stories.today },
  decorators: [(Story) => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-6">
    <h1 className="m-0 text-xl font-semibold">{copy.stories.heading}</h1>
    <p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p>
    <div className="overflow-x-auto rounded-lg border border-line"><div className="flex"><Story /></div></div>
  </main>],
} satisfies Meta<typeof GanttTimelineHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Oct 21')).toBeVisible();
    await expect(c.getAllByText('Wed')).toHaveLength(5);
    await expect(c.getByText('Nov 19')).toBeVisible();
  },
};
export const ShortRange: Story = {
  args: { totalDays: 7 },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Oct 27')).toBeVisible();
    await expect(c.queryByText('Oct 28')).toBeNull();
  },
};
export const HighlightsToday: Story = {
  args: { today: '2026-10-23', totalDays: 7 },
  play: async ({ canvasElement }) => {
    const today = canvasElement.querySelectorAll('[data-today]');
    await expect(today).toHaveLength(1);
    await expect(today[0]).toHaveTextContent('Oct 23');
  },
};
