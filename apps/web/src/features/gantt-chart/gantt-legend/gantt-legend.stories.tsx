import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { GanttLegend } from './gantt-legend';
import { ganttLegendData as copy } from './gantt-legend.data';

const meta = {
  title: 'Gantt Chart/GanttLegend',
  component: GanttLegend,
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-6">
    <h1 className="m-0 text-xl font-semibold">{copy.stories.heading}</h1>
    <p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p>
    <Story />
  </main>],
} satisfies Meta<typeof GanttLegend>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('list', { name: copy.label })).toBeVisible();
    await expect(c.getAllByRole('listitem')).toHaveLength(copy.items.length);
    for (const item of copy.items) await expect(c.getByText(item.label)).toBeVisible();
  },
};
