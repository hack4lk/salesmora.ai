import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { GanttWorkOrderRow } from './gantt-work-order-row';
import { ganttWorkOrderRowData as copy } from './gantt-work-order-row.data';

const meta = {
  title: 'Gantt Chart/GanttWorkOrderRow',
  component: GanttWorkOrderRow,
  parameters: { layout: 'fullscreen' },
  args: { workOrder: copy.workOrders.issued, ...copy.range },
  decorators: [(Story) => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-6">
    <h1 className="m-0 text-xl font-semibold">{copy.stories.heading}</h1>
    <p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p>
    <div className="overflow-x-auto rounded-lg border border-line"><div className="w-[2400px]"><Story /></div></div>
  </main>],
} satisfies Meta<typeof GanttWorkOrderRow>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const bar = within(canvasElement).getByTitle(args.workOrder.title);
    await expect(bar).toBeVisible();
    await expect(bar).toHaveTextContent(args.workOrder.number);
    await expect(bar).toHaveClass('bg-seafoam');
  },
};
export const Completed: Story = {
  args: { workOrder: copy.workOrders.completed },
  play: async ({ canvasElement, args }) => {
    await expect(within(canvasElement).getByTitle(args.workOrder.title)).toHaveClass('opacity-40');
  },
};
export const StartsBeforeRange: Story = {
  args: { workOrder: copy.workOrders.startsBeforeRange },
  play: async ({ canvasElement, args }) => {
    const bar = within(canvasElement).getByTitle(args.workOrder.title);
    await expect(bar).toBeVisible();
    await expect(bar.style.left).toBe('0%');
  },
};
export const Unscheduled: Story = {
  args: { workOrder: copy.workOrders.unscheduled },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(copy.noDates)).toBeVisible();
  },
};
export const SingleDay: Story = {
  args: { workOrder: copy.workOrders.singleDay },
  play: async ({ canvasElement, args }) => {
    await expect(within(canvasElement).getByTitle(args.workOrder.title)).toBeVisible();
  },
};
export const Linked: Story = {
  args: { href: '/work-orders/story-wo' },
  play: async ({ canvasElement, args }) => {
    await expect(within(canvasElement).getByRole('link', { name: copy.openWorkOrder(args.workOrder.number, args.workOrder.title) })).toHaveAttribute('href', '/work-orders/story-wo');
  },
};
