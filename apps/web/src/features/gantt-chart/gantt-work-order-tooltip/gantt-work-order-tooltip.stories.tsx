import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { GanttWorkOrderTooltip } from './gantt-work-order-tooltip';
import { ganttWorkOrderTooltipData as copy } from './gantt-work-order-tooltip.data';

const meta = {
  title: 'Gantt Chart/GanttWorkOrderTooltip',
  component: GanttWorkOrderTooltip,
  parameters: { layout: 'fullscreen' },
  args: {
    workOrder: copy.workOrders.default,
    customerName: copy.stories.customerName,
    children: (props) => (
      <button type="button" className="rounded border border-black/10 bg-seafoam px-3 py-2 text-xs font-semibold text-ink focus-visible:focus-ring" {...props}>
        {copy.workOrders.default.number}
      </button>
    ),
  },
  decorators: [(Story) => (
    <main className="min-h-screen bg-canvas p-4 text-ink sm:p-6">
      <h1 className="m-0 text-xl font-semibold">{copy.stories.heading}</h1>
      <p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p>
      <Story />
    </main>
  )],
} satisfies Meta<typeof GanttWorkOrderTooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

const open = async (canvasElement: HTMLElement) => {
  await userEvent.hover(within(canvasElement).getByRole('button'));
  const tip = within(canvasElement.ownerDocument.body).getByRole('tooltip');
  await waitFor(() => expect(tip).toBeVisible());
  return within(tip);
};

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const tip = await open(canvasElement);
    await expect(tip.getByText(args.workOrder.number)).toBeVisible();
    await expect(tip.getByText(args.workOrder.title)).toBeVisible();
    await expect(tip.getByText(args.customerName)).toBeVisible();
    await expect(tip.getByText(args.workOrder.assigneeName!)).toBeVisible();
  },
};
export const Completed: Story = {
  args: { workOrder: copy.workOrders.completed },
  play: async ({ canvasElement }) => {
    await expect((await open(canvasElement)).getByText('Completed')).toBeVisible();
  },
};
export const Unassigned: Story = {
  args: { workOrder: copy.workOrders.unassigned },
  play: async ({ canvasElement }) => {
    await expect((await open(canvasElement)).getByText(copy.unassigned)).toBeVisible();
  },
};
export const LongContent: Story = {
  args: { workOrder: copy.workOrders.long },
  play: async ({ canvasElement, args }) => {
    await expect((await open(canvasElement)).getByText(args.workOrder.title)).toBeVisible();
  },
};
