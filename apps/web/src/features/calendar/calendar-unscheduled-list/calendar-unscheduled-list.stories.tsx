import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CalendarUnscheduledList } from './calendar-unscheduled-list';
import { calendarUnscheduledListData as copy, calendarUnscheduledEntries as entries, calendarManyUnscheduledEntries as many } from './calendar-unscheduled-list.data';
import { calendarEventCardData } from '../calendar-event-card/calendar-event-card.data';

const meta = {
  title: 'Calendar/CalendarUnscheduledList', component: CalendarUnscheduledList, parameters: { layout: 'fullscreen' },
  args: { entries, onOpenVisit: fn(), onSchedule: fn(), onViewAll: fn(), onRetry: fn() },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-6"><h1 className="m-0 text-heading font-semibold">{copy.stories.heading}</h1>
    <p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p><div className="w-full max-w-2xl"><Story/></div></main>],
} satisfies Meta<typeof CalendarUnscheduledList>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), cards = c.getAllByRole('article');
  await expect(c.getByRole('status')).toHaveTextContent(copy.count(3));
  await expect(within(cards[0]).getByText(entries[0].title)).toBeVisible();
  await expect(within(cards[1]).getByText(entries[2].title)).toBeVisible();
  await expect(within(cards[2]).getByText(entries[1].title)).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: copy.scheduleVisit(entries[0].title) }));
  await expect(args.onSchedule).toHaveBeenCalledWith(entries[0].id);
} };
export const SharedVisit: Story = { args: { entries: [entries[0], { ...entries[0], crew: [...entries[0].crew, entries[0].crew[0]] }] }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getAllByRole('article')).toHaveLength(1);
  await expect(c.getByRole('status')).toHaveTextContent(copy.count(1));
  await expect(c.getByText('Job · J-1042')).toBeVisible(); await expect(c.getByText('Work Order · WO-1007')).toBeVisible();
  await expect(c.getByText(`${calendarEventCardData.stories.sam}, ${calendarEventCardData.stories.alex}`, { exact: false })).toBeVisible();
} };
export const WorkOrderOnly: Story = { args: { entries: [entries[1]] }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.noDeadline)).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: calendarEventCardData.openVisit(entries[1].title) }));
  await expect(args.onOpenVisit).toHaveBeenCalledWith(entries[1].id);
} };
export const ReadOnly: Story = { args: { entries: entries.map(entry => ({ ...entry, canReschedule: false })) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const button of c.getAllByRole('button', { name: /^Schedule:/ })) await expect(button).toBeDisabled();
  await expect(c.getByText(copy.permission)).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: calendarEventCardData.openVisit(entries[0].title) }));
  await expect(args.onOpenVisit).toHaveBeenCalledWith(entries[0].id); await expect(args.onSchedule).not.toHaveBeenCalled();
} };
export const FieldScoped: Story = { args: { entries: [{ ...entries[1], crew: [entries[0].crew[0]], canReschedule: false }], scopeLabel: copy.stories.scope }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(copy.count(1));
  await expect(c.queryByText(/J-1042/)).toBeNull(); await expect(c.queryByText(/Alex Chen/)).toBeNull();
} };
export const ManyVisits: Story = { args: { entries: many }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getAllByRole('article')).toHaveLength(10); await expect(c.getByRole('status')).toHaveTextContent(copy.count(12));
  await expect(c.getByText(copy.showing(10, 12))).toBeVisible();
  await expect(c.queryByRole('article', { name: many[10].title })).toBeNull();
  await userEvent.click(c.getByRole('button', { name: copy.viewAll })); await expect(args.onViewAll).toHaveBeenCalledTimes(1);
} };
export const Paginated: Story = { args: { entries: many.slice(0, 10), total: 27 }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(copy.count(27)); await expect(c.getByText(copy.showing(10, 27))).toBeVisible();
} };
export const Empty: Story = { args: { entries: [] }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.empty)).toBeVisible(); await expect(c.queryByRole('article')).toBeNull();
} };
export const FilteredEmpty: Story = { args: { entries: [], filtered: true }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(copy.filteredEmpty)).toBeVisible();
} };
export const Loading: Story = { args: { state: 'loading', total: 27 }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(copy.loading); await expect(c.queryByRole('article')).toBeNull(); await expect(c.queryByText(copy.count(27))).toBeNull();
} };
export const Error: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.queryByRole('article')).toBeNull();
  await userEvent.click(c.getByRole('button', { name: copy.retry })); await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const LongContent: Story = { args: { entries: [{ ...entries[0], title: copy.stories.longTitle, customerName: copy.stories.longCustomer }] } };
export const InvalidEntries: Story = { args: { entries: [entries[0], entries[0], { ...entries[1], id: 'already-scheduled', scheduledDate: '2026-10-21' },
  { ...entries[2], id: 'completed-job', records: [{ ...entries[2].records[0], type: 'job', status: 'completed' }] }] }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getAllByRole('article')).toHaveLength(1); await expect(c.getByRole('status')).toHaveTextContent(copy.count(1));
} };
export const ClosedRecordHistory: Story = { args: { entries: [{ ...entries[0], records: [{ ...entries[0].records[0], type: 'job', status: 'completed' }, entries[0].records[1]] }] }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.queryByText('Job · J-1042')).toBeNull(); await expect(c.getByText('Work Order · WO-1007')).toBeVisible();
} };
export const Keyboard: Story = { args: { entries: [entries[0]] }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), user = userEvent.setup({ document: canvasElement.ownerDocument });
  const schedule = c.getByRole('button', { name: copy.scheduleVisit(entries[0].title) }); schedule.focus(); await user.keyboard(' ');
  await expect(args.onSchedule).toHaveBeenCalledTimes(1);
  const open = c.getByRole('button', { name: calendarEventCardData.openVisit(entries[0].title) }); open.focus(); await user.keyboard('{Enter}');
  await expect(args.onOpenVisit).toHaveBeenCalledWith(entries[0].id); await expect(open).toHaveFocus();
} };
