import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within, waitFor } from 'storybook/test';
import { CalendarWeekGrid } from './calendar-week-grid';
import { calendarWeekGridData as copy, calendarWeekEntries as entries } from './calendar-week-grid.data';
import { calendarDayColumnData as dayCopy, calendarDayVisits } from '../calendar-day-column/calendar-day-column.data';
import { calendarEventCardData } from '../calendar-event-card/calendar-event-card.data';

const meta = {
  title: 'Calendar/CalendarWeekGrid', component: CalendarWeekGrid, parameters: { layout: 'fullscreen' },
  args: { weekDate: copy.stories.weekDate, today: copy.stories.today, entries, canSchedule: true, onOpenVisit: fn(), onSchedule: fn(), onRetry: fn() },
  decorators: [(Story) => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-6">
    <h1 className="m-0 text-heading font-semibold">{copy.stories.title}</h1><p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p><Story/>
  </main>],
} satisfies Meta<typeof CalendarWeekGrid>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getAllByRole('group')).toHaveLength(7);
  await expect(c.getByRole('status')).toHaveTextContent(copy.count(6));
  await expect(c.getByText(dayCopy.today)).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: calendarEventCardData.toggleVisit(entries[0].title) }));
  await userEvent.click(c.getByRole('button', { name: calendarEventCardData.openVisit(entries[0].title) }));
  await expect(args.onOpenVisit).toHaveBeenCalledWith(entries[0].id);
  await expect(c.getByRole('button', { name: calendarEventCardData.toggleVisit(entries[1].title) })).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(c.getByRole('button', { name: calendarEventCardData.toggleVisit(entries[0].title) }));
} };
export const EmptyWeek: Story = { args: { entries: [] }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getAllByText(dayCopy.empty)).toHaveLength(7);
  await expect(c.getByRole('status')).toHaveTextContent(copy.count(0));
  const monday = '2026-10-19';
  await userEvent.click(c.getByRole('button', { name: dayCopy.scheduleOn(dayCopy.fullDate(monday)) }));
  await expect(args.onSchedule).toHaveBeenCalledWith(monday);
} };
export const TodayOutsideWeek: Story = { args: { today: copy.stories.outsideToday }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByText(dayCopy.today)).toBeNull();
} };
export const BusyDay: Story = { args: { entries: calendarDayVisits.map(visit => ({ ...visit, scheduledDate: copy.stories.today })) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: dayCopy.more(3) }));
  const dialog = body.getByRole('dialog');
  await waitFor(() => expect(dialog).toBeVisible());
  await expect(within(dialog).getAllByRole('article')).toHaveLength(6);
  await userEvent.click(within(dialog).getByRole('button', { name: dayCopy.close }));
  await waitFor(() => expect(dialog).not.toBeInTheDocument());
  await expect(args.onSchedule).not.toHaveBeenCalled();
} };
export const ReadOnly: Story = { args: { canSchedule: false, entries: entries.map(entry => ({ ...entry, canReschedule: false })) }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('button', { name: /^Schedule visit on/ })).toBeNull();
} };
export const Field: Story = { args: { scopeLabel: copy.stories.field, canSchedule: false, entries: entries.slice(1, 2).map(entry => ({ ...entry,
  crew: [entry.crew[0]], records: entry.records.filter(record => record.type === 'job'), canReschedule: false })) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent(copy.count(1));
  await expect(c.queryByText(calendarEventCardData.stories.alex)).toBeNull();
  await expect(c.queryByText(calendarEventCardData.stories.customer)).toBeNull();
} };
export const Loading: Story = { args: { state: 'loading' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent(copy.loading);
  await expect(c.queryByRole('article')).toBeNull();
} };
export const Error: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByText(copy.errorTitle)).toBeVisible();
  await expect(c.queryByRole('article')).toBeNull();
  await userEvent.click(c.getByRole('button', { name: copy.retry }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const YearBoundary: Story = { args: { weekDate: copy.stories.yearDate, entries: [] } };
export const DstWeek: Story = { args: { weekDate: copy.stories.dstDate, entries: [] } };
export const OutsideRange: Story = { args: { entries: [...entries, { ...entries[0], id: 'outside', scheduledDate: copy.stories.outsideToday }] }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('status')).toHaveTextContent(copy.count(6));
} };
export const Keyboard: Story = { play: async ({ canvasElement }) => {
  const user = userEvent.setup({ document: canvasElement.ownerDocument }), c = within(canvasElement), days = c.getAllByRole('group');
  days[0].focus(); await user.keyboard('{ArrowRight}'); await expect(days[1]).toHaveFocus();
  await user.keyboard('{End}'); await expect(days[6]).toHaveFocus();
  await user.keyboard('{Home}'); await expect(days[0]).toHaveFocus();
  await user.keyboard('{ArrowDown}'); await expect(within(days[0]).getByRole('button', { name: calendarEventCardData.toggleVisit(entries[0].title) })).toHaveFocus();
} };
