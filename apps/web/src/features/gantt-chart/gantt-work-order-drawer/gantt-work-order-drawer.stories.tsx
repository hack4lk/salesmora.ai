import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { GanttWorkOrderDrawer, type GanttWorkOrderDrawerProps } from './gantt-work-order-drawer';
import { ganttWorkOrderDrawerData as copy } from './gantt-work-order-drawer.data';

function Preview(args: GanttWorkOrderDrawerProps) {
  const [open, setOpen] = useState(args.open);
  return (
    <main className="min-h-screen bg-canvas p-4 text-ink sm:p-6">
      <h1 className="m-0 text-heading font-semibold">{copy.stories.heading}</h1>
      <button type="button" onClick={() => setOpen(true)} className="mt-6 min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 font-semibold text-primary focus-visible:focus-ring">
        {copy.stories.launch}
      </button>
      <GanttWorkOrderDrawer {...args} open={open} onClose={() => { args.onClose(); setOpen(false); }} />
    </main>
  );
}

const meta = {
  title: 'Gantt Chart/GanttWorkOrderDrawer',
  component: GanttWorkOrderDrawer,
  render: (args) => <Preview {...args} />,
  parameters: { layout: 'fullscreen' },
  args: { open: true, workOrder: copy.workOrders.default, job: copy.job, onClose: fn(), onSelectJob: fn(), onOpenWorkOrder: fn() },
} satisfies Meta<typeof GanttWorkOrderDrawer>;
export default meta;
type Story = StoryObj<typeof meta>;

const dialogFor = async (canvasElement: HTMLElement) => {
  const dialog = within(canvasElement.ownerDocument.body).getByRole('dialog');
  await waitFor(() => expect(dialog).toBeVisible());
  return within(dialog);
};

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const d = await dialogFor(canvasElement);
    await expect(d.getByRole('heading', { name: args.workOrder!.title })).toBeVisible();
    await expect(d.getByText(copy.description(args.workOrder!.number))).toBeVisible();
    await expect(d.getByText(args.job!.customerName)).toBeVisible();
    await expect(d.getByText('Oct 26, 2026')).toBeVisible();
    await expect(d.getByText(args.workOrder!.assigneeName!)).toBeVisible();
    await expect(d.queryByText(copy.completed + ':')).toBeNull();
  },
};
export const OpenFullRecord: Story = {
  play: async ({ canvasElement, args }) => {
    const d = await dialogFor(canvasElement);
    await userEvent.click(d.getByRole('button', { name: copy.openWorkOrder(args.workOrder!.number) }));
    await expect(args.onOpenWorkOrder).toHaveBeenCalledWith(args.workOrder!.id);
  },
};
export const SwitchToParentJob: Story = {
  play: async ({ canvasElement, args }) => {
    const d = await dialogFor(canvasElement);
    await userEvent.click(d.getByRole('button', { name: copy.viewJob(args.job!.number, args.job!.title) }));
    await expect(args.onSelectJob).toHaveBeenCalledWith(args.job!.id);
  },
};
export const Completed: Story = {
  args: { workOrder: copy.workOrders.completed },
  play: async ({ canvasElement }) => {
    const d = await dialogFor(canvasElement);
    await expect(d.getByText('Oct 28, 2026')).toBeVisible();
    await expect(d.getByText(`${copy.completed}:`)).toBeVisible();
  },
};
export const Unscheduled: Story = {
  args: { workOrder: copy.workOrders.unscheduled },
  play: async ({ canvasElement }) => {
    await expect((await dialogFor(canvasElement)).getByText(copy.notSet)).toBeVisible();
  },
};
export const Unassigned: Story = {
  args: { workOrder: copy.workOrders.unassigned },
  play: async ({ canvasElement }) => {
    await expect((await dialogFor(canvasElement)).getByText(copy.unassigned)).toBeVisible();
  },
};
export const LongContent: Story = {
  args: { workOrder: copy.workOrders.long, job: copy.longCustomerJob },
  play: async ({ canvasElement, args }) => {
    const d = await dialogFor(canvasElement);
    await expect(d.getByText(args.job!.customerName)).toBeVisible();
    await expect(d.getByRole('heading', { name: args.workOrder!.title })).toBeVisible();
  },
};
export const CloseButton: Story = {
  play: async ({ canvasElement, args }) => {
    const d = await dialogFor(canvasElement);
    await userEvent.click(d.getByRole('button', { name: /close/i }));
    await expect(args.onClose).toHaveBeenCalled();
  },
};
