import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { GanttJobLabel, type GanttJobLabelProps } from './gantt-job-label';
import { ganttJobLabelData as copy } from './gantt-job-label.data';

const meta = {
  title: 'Gantt Chart/GanttJobLabel',
  component: GanttJobLabel,
  parameters: { layout: 'fullscreen' },
  args: { job: copy.stories.job, expanded: false, onToggle: fn() },
  decorators: [(Story) => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-6">
    <h1 className="m-0 text-xl font-semibold">{copy.stories.heading}</h1>
    <p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p>
    <div className="w-45 border border-line bg-canvas"><Story /></div>
  </main>],
} satisfies Meta<typeof GanttJobLabel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {
  play: async ({ canvasElement, args }) => {
    const row = within(canvasElement).getByRole('button', { name: copy.toggleJob(args.job.number, args.job.title) });
    await expect(row).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(row);
    await expect(args.onToggle).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{Enter}');
    await expect(args.onToggle).toHaveBeenCalledTimes(2);
  },
};
export const Expanded: Story = {
  args: { expanded: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  },
};
export const LongTitle: Story = {
  args: { job: { ...copy.stories.job, title: copy.stories.longTitle } },
};

function StatefulLabel(args: GanttJobLabelProps) {
  const [expanded, setExpanded] = useState(false);
  return <GanttJobLabel {...args} expanded={expanded} onToggle={() => setExpanded((value) => !value)} />;
}
export const Interactive: Story = {
  render: (args) => <StatefulLabel {...args} />,
  play: async ({ canvasElement }) => {
    const row = within(canvasElement).getByRole('button');
    await userEvent.click(row);
    await expect(row).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(row);
    await expect(row).toHaveAttribute('aria-expanded', 'false');
  },
};
