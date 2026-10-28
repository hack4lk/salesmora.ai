import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { GanttWorkOrderLabel } from './gantt-work-order-label';
import { ganttWorkOrderLabelData as copy } from './gantt-work-order-label.data';

const meta = {
  title: 'Gantt Chart/GanttWorkOrderLabel',
  component: GanttWorkOrderLabel,
  parameters: { layout: 'fullscreen' },
  args: { workOrder: { title: copy.stories.title } },
  decorators: [(Story) => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-6">
    <h1 className="m-0 text-xl font-semibold">{copy.stories.heading}</h1>
    <p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p>
    <div className="w-45 border border-line bg-canvas"><Story /></div>
  </main>],
} satisfies Meta<typeof GanttWorkOrderLabel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(copy.stories.title)).toBeVisible();
  },
};
export const LongTitle: Story = {
  args: { workOrder: { title: copy.stories.longTitle } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(copy.stories.longTitle)).toBeVisible();
  },
};
