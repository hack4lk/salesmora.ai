import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { GanttJobRow } from './gantt-job-row';
import { ganttJobRowData as copy } from './gantt-job-row.data';

const meta = {
  title: 'Gantt Chart/GanttJobRow',
  component: GanttJobRow,
  parameters: { layout: 'fullscreen' },
  args: { job: copy.jobs.onTrack, ...copy.range },
  decorators: [(Story) => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-6">
    <h1 className="m-0 text-xl font-semibold">{copy.stories.heading}</h1>
    <p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p>
    <div className="overflow-x-auto rounded-lg border border-line"><div className="w-[2400px]"><Story /></div></div>
  </main>],
} satisfies Meta<typeof GanttJobRow>;
export default meta;
type Story = StoryObj<typeof meta>;

export const OnTrack: Story = {
  play: async ({ canvasElement, args }) => {
    const bar = within(canvasElement).getByTitle(args.job.title);
    await expect(bar).toBeVisible();
    await expect(bar).toHaveTextContent(args.job.number);
    await expect(bar).toHaveClass('bg-success');
  },
};
export const AtRisk: Story = {
  args: { job: copy.jobs.atRisk },
  play: async ({ canvasElement, args }) => {
    await expect(within(canvasElement).getByTitle(args.job.title)).toHaveClass('bg-warning');
  },
};
export const Delayed: Story = {
  args: { job: copy.jobs.delayed },
  play: async ({ canvasElement, args }) => {
    await expect(within(canvasElement).getByTitle(args.job.title)).toHaveClass('bg-error');
  },
};
export const Completed: Story = {
  args: { job: copy.jobs.completed },
  play: async ({ canvasElement, args }) => {
    await expect(within(canvasElement).getByTitle(args.job.title)).toHaveClass('opacity-40');
  },
};
export const StartsBeforeRange: Story = {
  args: { job: copy.jobs.startsBeforeRange },
  play: async ({ canvasElement, args }) => {
    const bar = within(canvasElement).getByTitle(args.job.title);
    await expect(bar).toBeVisible();
    await expect(bar.style.left).toBe('0%');
  },
};
export const Unscheduled: Story = {
  args: { job: copy.jobs.unscheduled },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(copy.noDates)).toBeVisible();
  },
};
export const Overdue: Story = {
  args: { job: copy.jobs.overdue },
  play: async ({ canvasElement, args }) => {
    await expect(within(canvasElement).getByTitle(args.job.title)).toHaveClass('bg-error');
  },
};
export const SingleDay: Story = {
  args: { job: copy.jobs.singleDay },
  play: async ({ canvasElement, args }) => {
    await expect(within(canvasElement).getByTitle(args.job.title)).toBeVisible();
  },
};
export const Linked: Story = {
  args: { href: '/jobs/story-job' },
  play: async ({ canvasElement, args }) => {
    await expect(within(canvasElement).getByRole('link', { name: copy.openJob(args.job.number, args.job.title) })).toHaveAttribute('href', '/jobs/story-job');
  },
};
