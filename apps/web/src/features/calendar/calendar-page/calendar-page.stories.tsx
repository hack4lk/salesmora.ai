import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { CalendarPagePreview } from './calendar-page.preview';
import { calendarPageData as copy, calendarPageVisits } from './calendar-page.data';
import { calendarToolbarData } from '../calendar-toolbar/calendar-toolbar.data';
import { calendarWeekGridData } from '../calendar-week-grid/calendar-week-grid.data';
import { calendarDayColumnData } from '../calendar-day-column/calendar-day-column.data';
import { calendarEventCardData } from '../calendar-event-card/calendar-event-card.data';
import { calendarFiltersData } from '../calendar-filters/calendar-filters.data';
import { calendarUnscheduledListData } from '../calendar-unscheduled-list/calendar-unscheduled-list.data';
import { calendarTeamWorkloadData } from '../calendar-team-workload/calendar-team-workload.data';
import { calendarVisitPeekDrawerData } from '../calendar-visit-peek-drawer/calendar-visit-peek-drawer.data';
import { calendarScheduleDialogData } from '../calendar-schedule-dialog/calendar-schedule-dialog.data';

const meta = { title: 'Calendar/CalendarPage', component: CalendarPagePreview, parameters: { layout: 'fullscreen' }, args: {} } satisfies Meta<typeof CalendarPagePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('heading', { name: copy.title })).toBeVisible();
  await expect(c.getByRole('region', { name: calendarWeekGridData.label })).toBeVisible();
  await expect(c.getByRole('heading', { name: calendarUnscheduledListData.title })).toBeVisible();
  await expect(c.getByRole('heading', { name: calendarTeamWorkloadData.title })).toBeVisible();
} };
export const Navigation: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), grid = within(c.getByRole('region', { name: calendarWeekGridData.label }));
  await userEvent.click(c.getByRole('button', { name: calendarToolbarData.next }));
  await expect(grid.getByRole('status')).toHaveTextContent(calendarWeekGridData.count(0));
  await userEvent.click(c.getByRole('button', { name: calendarToolbarData.today }));
  await expect(grid.getByRole('status')).toHaveTextContent(calendarWeekGridData.count(6));
} };
export const Filtered: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), grid = within(c.getByRole('region', { name: calendarWeekGridData.label }));
  const queue = within(c.getByRole('region', { name: calendarUnscheduledListData.title }));
  const workload = within(c.getByRole('region', { name: calendarTeamWorkloadData.title }));
  await userEvent.type(c.getByRole('searchbox', { name: calendarFiltersData.search }), 'Jordan');
  await expect(grid.getByRole('status')).toHaveTextContent(calendarWeekGridData.count(1));
  await expect(queue.getByRole('status')).toHaveTextContent(calendarUnscheduledListData.count(1));
  await expect(workload.getByRole('status')).toHaveTextContent(calendarTeamWorkloadData.weekCount(1));
} };
export const WorkloadSelection: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), workload = within(c.getByRole('region', { name: calendarTeamWorkloadData.title }));
  await userEvent.click(workload.getByRole('button', { name: calendarTeamWorkloadData.filter('Alex Chen') }));
  await expect(c.getByLabelText(calendarFiltersData.person)).toHaveValue('member:alex');
  await expect(within(c.getByRole('region', { name: calendarWeekGridData.label })).getByRole('status')).toHaveTextContent(calendarWeekGridData.count(3));
  await userEvent.click(workload.getByRole('button', { name: calendarTeamWorkloadData.everyone }));
  await expect(c.getByLabelText(calendarFiltersData.person)).toHaveValue('all');
} };
export const VisitPeek: Story = { args: { initialOverlay: 'peek' } };
export const ScheduleReview: Story = { args: { initialOverlay: 'schedule' }, play: async ({ canvasElement }) => {
  const d = within(within(canvasElement.ownerDocument.body).getByRole('dialog'));
  const user = userEvent.setup({ document: canvasElement.ownerDocument });
  await user.type(d.getByLabelText(calendarScheduleDialogData.date), copy.stories.today);
  await user.click(d.getByRole('button', { name: calendarScheduleDialogData.review }));
  await expect(d.getByRole('button', { name: calendarScheduleDialogData.confirm })).toBeEnabled();
} };
export const ScheduleFromQueue: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body), user = userEvent.setup({ document: canvasElement.ownerDocument });
  const queue = within(c.getByRole('region', { name: calendarUnscheduledListData.title }));
  await user.click(queue.getByRole('button', { name: calendarUnscheduledListData.scheduleVisit(copy.stories.queueTitles[0]) }));
  const d = within(body.getByRole('dialog'));
  await user.type(d.getByLabelText(calendarScheduleDialogData.date), copy.stories.today);
  await user.click(d.getByRole('button', { name: calendarScheduleDialogData.review }));
  await expect(queue.getByText(calendarUnscheduledListData.count(3))).toBeInTheDocument();
  await user.click(d.getByRole('button', { name: calendarScheduleDialogData.confirm }));
  await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
  await expect(c.getByText(copy.stories.saved)).toBeVisible();
  await expect(queue.getByRole('status')).toHaveTextContent(calendarUnscheduledListData.count(2));
  await expect(within(c.getByRole('region', { name: calendarWeekGridData.label })).getByRole('status')).toHaveTextContent(calendarWeekGridData.count(7));
} };
export const EmptyDaySchedule: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: calendarDayColumnData.scheduleOn(calendarDayColumnData.fullDate(copy.stories.today)) }));
  const d = within(body.getByRole('dialog')); await expect(d.getByLabelText(calendarScheduleDialogData.date)).toHaveValue(copy.stories.today);
} };
export const PeekToReschedule: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body), grid = within(c.getByRole('region', { name: calendarWeekGridData.label }));
  const title = calendarPageVisits[0].title;
  await userEvent.click(grid.getByRole('button', { name: calendarEventCardData.toggleVisit(title) }));
  await userEvent.click(grid.getByRole('button', { name: calendarEventCardData.openVisit(title) }));
  await userEvent.click(within(body.getByRole('dialog')).getByRole('button', { name: calendarVisitPeekDrawerData.reschedule }));
  await waitFor(() => expect(body.getAllByRole('dialog')).toHaveLength(1));
  await expect(within(body.getByRole('dialog')).getByLabelText(calendarScheduleDialogData.date)).toHaveValue(calendarPageVisits[0].scheduledDate!);
} };
export const FieldScoped: Story = { args: { scope: 'own' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('switch', { name: calendarFiltersData.mine })).toBeChecked();
  await expect(c.getByRole('switch', { name: calendarFiltersData.mine })).toBeDisabled();
  await expect(c.queryByText(/Alex Chen/)).toBeNull();
  await expect(within(c.getByRole('region', { name: calendarWeekGridData.label })).getByRole('status')).toHaveTextContent(calendarWeekGridData.count(3));
} };
export const ReadOnly: Story = { args: { readOnly: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('button', { name: calendarToolbarData.schedule })).toBeDisabled();
  await expect(c.queryByRole('button', { name: /^Schedule visit on/ })).toBeNull();
  for (const button of c.getAllByRole('button', { name: /^Schedule:/ })) await expect(button).toBeDisabled();
} };
export const Empty: Story = { args: { empty: true }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: calendarToolbarData.schedule })).toBeEnabled();
} };
export const FilteredEmpty: Story = { args: { filteredEmpty: true } };
export const Loading: Story = { args: { state: 'loading' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('searchbox')).toBeDisabled(); await expect(c.queryByRole('article')).toBeNull();
} };
export const Error: Story = { args: { state: 'error' } };
export const RetryRecovery: Story = { args: { state: 'error' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement), grid = within(c.getByRole('region', { name: calendarWeekGridData.label }));
  await userEvent.click(grid.getByRole('button', { name: calendarWeekGridData.retry }));
  await expect(grid.getByRole('status')).toHaveTextContent(calendarWeekGridData.count(6));
} };
export const Keyboard: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), user = userEvent.setup({ document: canvasElement.ownerDocument });
  const button = c.getByRole('button', { name: calendarToolbarData.next }); button.focus(); await user.keyboard('{Enter}');
  await expect(button).toHaveFocus();
} };
export const QueuePagination: Story = { args: { pagedQueue: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement), pages = within(c.getByRole('navigation', { name: copy.queuePagination }));
  await expect(c.getByText('Showing 1–10 of 23')).toBeVisible();
  await userEvent.click(pages.getByRole('button', { name: 'Go to page 2' }));
  await expect(c.getByText('Showing 11–20 of 23')).toBeVisible();
  await userEvent.click(pages.getByRole('button', { name: 'Go to page 3' }));
  await expect(c.getByText('Showing 21–23 of 23')).toBeVisible();
} };
