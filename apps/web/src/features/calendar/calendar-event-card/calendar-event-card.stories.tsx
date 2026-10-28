import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CalendarEventCard } from './calendar-event-card';
import { calendarEventCardData as copy, calendarVisitFixtures as fixtures } from './calendar-event-card.data';

const meta = {
  title: 'Calendar/CalendarEventCard',
  component: CalendarEventCard,
  parameters: { layout: 'fullscreen' },
  args: { visit: fixtures.shared, onOpen: fn() },
  decorators: [(Story) => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-6">
    <h1 className="m-0 text-xl font-semibold">{copy.stories.heading}</h1>
    <p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p>
    <div className="w-full max-w-sm"><Story/></div>
  </main>],
} satisfies Meta<typeof CalendarEventCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement), toggle = c.getByRole('button', { name: copy.toggleVisit(args.visit.title) });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(c.getByText(`${copy.stories.sam}, ${copy.stories.alex}`)).toBeVisible();
    await expect(c.queryByText(args.visit.customerName)).toBeNull();
    await expect(c.queryByText(copy.types.shared)).toBeNull();
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(c.getByText('Job · J-1042')).toBeVisible();
    await expect(c.getByText('Work Order · WO-1007')).toBeVisible();
    await expect(c.getByText('9 AM – 11 AM')).toBeVisible();
    await expect(args.onOpen).not.toHaveBeenCalled();
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(c.queryByText('Job · J-1042')).toBeNull();
  },
};
export const Expanded: Story = { args: { initiallyExpanded: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.openVisit(args.visit.title) }));
  await expect(args.onOpen).toHaveBeenCalledWith(args.visit.id);
} };
export const JobOnly: Story = { args: { initiallyExpanded: true, visit: fixtures.job } };
export const WorkOrderOnly: Story = { args: { initiallyExpanded: true, visit: fixtures.workOrder } };
export const SeveralWorkOrders: Story = {
  args: { initiallyExpanded: true, visit: { ...fixtures.shared, records: [...fixtures.shared.records,
    { id: 'preview-wo-2', type: 'work_order', number: 'WO-1008', title: copy.stories.secondWorkOrderTitle, status: 'in-progress' }],
    crew: [...fixtures.shared.crew, fixtures.shared.crew[0]] } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByText(copy.oneVisit)).toHaveLength(1);
    await expect(c.getByText(`${copy.stories.sam}, ${copy.stories.alex}`)).toBeVisible();
  },
};
export const ReadOnly: Story = {
  args: { initiallyExpanded: true, visit: { ...fixtures.shared, canReschedule: false } },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByText(copy.readOnly)).toBeVisible();
    const button = c.getByRole('button', { name: copy.openVisit(args.visit.title) });
    await expect(button).toBeEnabled();
    await userEvent.click(button);
    await expect(args.onOpen).toHaveBeenCalledWith(args.visit.id);
  },
};
export const FieldScoped: Story = {
  args: { initiallyExpanded: true, visit: { ...fixtures.workOrder, crew: [fixtures.shared.crew[0]], canReschedule: false } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByText(/J-1042/)).toBeNull();
    await expect(c.queryByText(copy.stories.alex)).toBeNull();
    await expect(c.getByText(copy.readOnly)).toBeVisible();
  },
};
export const Waiting: Story = { args: { initiallyExpanded: true, visit: { ...fixtures.job, waiting: true,
  records: [{ ...fixtures.job.records[0], type: 'job', status: 'waiting' }] } } };
export const InProgress: Story = { args: { initiallyExpanded: true, visit: { ...fixtures.workOrder,
  records: [{ ...fixtures.workOrder.records[0], type: 'work_order', status: 'in-progress' }] } } };
export const NoArrivalWindow: Story = { args: { initiallyExpanded: true, visit: { ...fixtures.shared, arrivalWindow: null } } };
export const OverdueDeadline: Story = { args: { initiallyExpanded: true, visit: { ...fixtures.shared, completionDeadline: { date: '2026-10-19', overdue: true } } } };
export const Unassigned: Story = { args: { initiallyExpanded: true, visit: { ...fixtures.job, crew: [] } } };
export const LongContent: Story = { args: { visit: { ...fixtures.shared, title: copy.stories.longTitle,
  customerName: copy.stories.longCustomer, crew: [{ id: 'long-name', name: copy.stories.longName }] } } };
export const ExpandedLongContent: Story = { args: { ...LongContent.args, initiallyExpanded: true } };
export const Keyboard: Story = {
  play: async ({ canvasElement, args }) => {
    const user = userEvent.setup({ document: canvasElement.ownerDocument }), c = within(canvasElement);
    const toggle = c.getByRole('button', { name: copy.toggleVisit(args.visit.title) });
    toggle.focus();
    await user.keyboard('{Enter}');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(args.onOpen).not.toHaveBeenCalled();
    await user.keyboard(' ');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveFocus();
  },
};
