import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within, waitFor } from 'storybook/test';
import { CalendarDayColumn } from './calendar-day-column';
import { calendarDayColumnData as copy, calendarDayVisits as visits } from './calendar-day-column.data';
import { calendarEventCardData } from '../calendar-event-card/calendar-event-card.data';

const meta = {
  title: 'Calendar/CalendarDayColumn', component: CalendarDayColumn,
  parameters: { layout: 'fullscreen' },
  args: { date: copy.stories.date, today: copy.stories.otherDate, visits: visits.slice(0, 2), canSchedule: true, onOpenVisit: fn(), onSchedule: fn() },
  decorators: [(Story) => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-6">
    <h1 className="m-0 text-heading font-semibold">{copy.stories.heading}</h1><p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p>
    <div className="w-full max-w-sm"><Story/></div>
  </main>],
} satisfies Meta<typeof CalendarDayColumn>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Today: Story = { args: { today: copy.stories.date } };
export const Empty: Story = {
  args: { visits: [] },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByText(copy.empty)).toBeVisible();
    await expect(c.getByText(copy.count(0))).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: copy.scheduleOn(copy.fullDate(args.date)) }));
    await expect(args.onSchedule).toHaveBeenCalledWith(args.date);
  },
};
export const OneSharedVisit: Story = { args: { visits: [visits[0]] }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(visits[0].title)).toBeVisible();
  // Compact cards omit the count; the day header counts the shared visit once.
  await expect(c.getAllByText(copy.count(1))).toHaveLength(1);
} };
export const BusyDay: Story = {
  args: { visits },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await expect(c.getByText(copy.count(6))).toBeVisible();
    await expect(c.getAllByRole('article')).toHaveLength(3);
    await userEvent.click(c.getByRole('button', { name: copy.more(3) }));
    const dialog = body.getByRole('dialog', { name: copy.allVisits(copy.fullDate(args.date)) });
    await expect(within(dialog).getAllByRole('article')).toHaveLength(6);
    await userEvent.click(within(dialog).getByRole('button', { name: calendarEventCardData.toggleVisit(visits[0].title) }));
    await userEvent.click(within(dialog).getByRole('button', { name: calendarEventCardData.openVisit(visits[0].title) }));
    await expect(args.onOpenVisit).toHaveBeenCalledWith(visits[0].id);
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
export const ArrivalOrder: Story = { args: { visits: [visits[0], visits[2], visits[1]] }, play: async ({ canvasElement }) => {
  const cards = within(canvasElement).getAllByRole('article');
  await expect(within(cards[0]).getByText(visits[1].title)).toBeVisible();
  await expect(within(cards[1]).getByText(visits[2].title)).toBeVisible();
  await expect(within(cards[2]).getByText(visits[0].title)).toBeVisible();
} };
export const ReadOnly: Story = { args: { canSchedule: false, visits: visits.slice(0, 2).map(v => ({ ...v, canReschedule: false })) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.queryByRole('button', { name: copy.scheduleOn(copy.fullDate(args.date)) })).toBeNull();
  await userEvent.click(c.getByRole('button', { name: calendarEventCardData.toggleVisit(visits[0].title) }));
  await userEvent.click(c.getByRole('button', { name: calendarEventCardData.openVisit(visits[0].title) }));
  await expect(args.onOpenVisit).toHaveBeenCalledWith(visits[0].id);
} };
export const EmptyReadOnly: Story = { args: { visits: [], canSchedule: false } };
export const Weekend: Story = { args: { date: copy.stories.weekend, visits: [] } };
export const DuplicateVisitId: Story = { args: { visits: [visits[0], visits[0]] }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getAllByRole('article')).toHaveLength(1);
} };
export const Keyboard: Story = {
  args: { visits },
  play: async ({ canvasElement, args }) => {
    const user = userEvent.setup({ document: canvasElement.ownerDocument });
    const c = within(canvasElement), body = within(canvasElement.ownerDocument.body), more = c.getByRole('button', { name: copy.more(3) });
    more.focus(); await user.keyboard('{Enter}');
    const dialog = body.getByRole('dialog', { name: copy.allVisits(copy.fullDate(args.date)) });
    await waitFor(() => expect(dialog).toBeVisible());
    const close = within(dialog).getByRole('button', { name: copy.close });
    close.focus(); await user.keyboard('{Escape}');
    await waitFor(() => expect(dialog).not.toBeInTheDocument()); await expect(more).toHaveFocus();
    canvasElement.dataset.calendarKeyboardComplete = 'true';
  },
};
