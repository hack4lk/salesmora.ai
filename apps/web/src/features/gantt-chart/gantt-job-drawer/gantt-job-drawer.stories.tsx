import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { GanttJobDrawer, type GanttJobDrawerProps } from './gantt-job-drawer';
import { ganttJobDrawerData as copy } from './gantt-job-drawer.data';

function Preview(args: GanttJobDrawerProps) {
  const [open, setOpen] = useState(args.open);
  return (
    <main className="min-h-screen bg-canvas p-4 text-ink sm:p-6">
      <h1 className="m-0 text-heading font-semibold">{copy.stories.heading}</h1>
      <button type="button" onClick={() => setOpen(true)} className="mt-6 min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 font-semibold text-primary focus-visible:focus-ring">
        {copy.stories.launch}
      </button>
      <GanttJobDrawer {...args} open={open} onClose={() => { args.onClose(); setOpen(false); }} />
    </main>
  );
}

const meta = {
  title: 'Gantt Chart/GanttJobDrawer',
  component: GanttJobDrawer,
  render: (args) => <Preview {...args} />,
  parameters: { layout: 'fullscreen' },
  args: { open: true, job: copy.jobs.default, teamMembers: copy.stories.teamMembers, onClose: fn(), onSelectWorkOrder: fn(), onOpenJob: fn() },
} satisfies Meta<typeof GanttJobDrawer>;
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
    await expect(d.getByRole('heading', { name: args.job!.title })).toBeVisible();
    await expect(d.getByText(copy.description(args.job!.number))).toBeVisible();
    await expect(d.getByText(args.job!.customerName)).toBeVisible();
    await expect(d.getByText('Oct 25, 2026')).toBeVisible();
    await expect(d.getByText('Nov 8, 2026')).toBeVisible();
    await expect(d.getByText('Alex Chen, Jordan Lee')).toBeVisible();
    await expect(d.getByRole('heading', { name: copy.workOrdersCount(3) })).toBeVisible();
    await expect(d.queryByText(copy.overdue)).toBeNull();
  },
};
export const OpenFullRecord: Story = {
  play: async ({ canvasElement, args }) => {
    const d = await dialogFor(canvasElement);
    await userEvent.click(d.getByRole('button', { name: copy.openJob(args.job!.number) }));
    await expect(args.onOpenJob).toHaveBeenCalledWith(args.job!.id);
  },
};
export const SwitchToWorkOrder: Story = {
  play: async ({ canvasElement, args }) => {
    const d = await dialogFor(canvasElement);
    const order = args.job!.workOrders[1];
    await userEvent.click(d.getByRole('button', { name: copy.viewWorkOrder(order.number, order.title) }));
    await expect(args.onSelectWorkOrder).toHaveBeenCalledWith(order.id);
  },
};
export const Overdue: Story = {
  args: { job: copy.jobs.overdue },
  play: async ({ canvasElement }) => {
    await expect((await dialogFor(canvasElement)).getByText(copy.overdue)).toBeVisible();
  },
};
export const NoWorkOrders: Story = {
  args: { job: copy.jobs.noWorkOrders },
  play: async ({ canvasElement }) => {
    await expect((await dialogFor(canvasElement)).getByText(copy.noWorkOrders)).toBeVisible();
  },
};
export const Unscheduled: Story = {
  args: { job: copy.jobs.unscheduled },
  play: async ({ canvasElement }) => {
    await expect((await dialogFor(canvasElement)).getAllByText(copy.notSet)).toHaveLength(2);
  },
};
export const NoPeople: Story = {
  args: { job: copy.jobs.noPeople },
  play: async ({ canvasElement }) => {
    const d = await dialogFor(canvasElement);
    await expect(d.getByText(copy.unassigned)).toBeVisible();
    await expect(d.getByText(copy.noTeam)).toBeVisible();
  },
};
export const LongContent: Story = {
  args: { job: copy.jobs.long },
  play: async ({ canvasElement, args }) => {
    await expect((await dialogFor(canvasElement)).getByText(args.job!.customerName)).toBeVisible();
  },
};
export const CloseButton: Story = {
  play: async ({ canvasElement, args }) => {
    const d = await dialogFor(canvasElement);
    await userEvent.click(d.getByRole('button', { name: /close/i }));
    await expect(args.onClose).toHaveBeenCalled();
  },
};
