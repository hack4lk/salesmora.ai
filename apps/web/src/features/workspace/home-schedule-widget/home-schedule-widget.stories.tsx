import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { HomeScheduleWidget, type HomeScheduleVisit } from './home-schedule-widget';
import { homeScheduleWidgetData as copy } from './home-schedule-widget.data';
import { calendarEventCardData as visitCopy } from '../../calendar/calendar-event-card/calendar-event-card.data';

const calendar = `/calendar?workspace=${copy.stories.workspaceId}&date=${copy.stories.date}`;
const visits: HomeScheduleVisit[] = [
  { id: '00000000-0000-4000-8000-000000000101', title: 'Bathroom plumbing', customerName: 'Miller', arrivalWindow: '09:00-11:00', location: '240 Oak Avenue', crew: [{ id: 'sam', name: 'Sam Rivera' }], records: [{ id: 'job-101', type: 'job', number: 'J-101', title: 'Bathroom plumbing', status: 'waiting' }], href: `${calendar}&visit=00000000-0000-4000-8000-000000000101` },
  { id: '00000000-0000-4000-8000-000000000102', title: 'Water heater repair', customerName: 'Carter', arrivalWindow: '09:00-11:00', location: '18 Willow Street', crew: [{ id: 'sam', name: 'Sam Rivera' }], records: [{ id: 'job-102', type: 'job', number: 'J-102', title: 'Water heater repair', status: 'scheduled' }], href: `${calendar}&visit=00000000-0000-4000-8000-000000000102` },
  { id: '00000000-0000-4000-8000-000000000103', title: 'Furnace inspection', customerName: 'Brooks', arrivalWindow: '13:00-15:00', location: '6 Pine Court', crew: [{ id: 'sam', name: 'Sam Rivera' }], records: [{ id: 'job-103', type: 'job', number: 'J-103', title: 'Furnace inspection', status: 'in-progress' }, { id: 'wo-103', type: 'work_order', number: 'WO-103', title: 'Inspect furnace', status: 'in-progress' }], href: `${calendar}&visit=00000000-0000-4000-8000-000000000103` },
  { id: '00000000-0000-4000-8000-000000000106', title: 'Boiler service', customerName: 'Reed', arrivalWindow: '14:00-16:00', location: '90 Lake Drive', crew: [{ id: 'alex', name: 'Alex Chen' }], records: [{ id: 'job-106', type: 'job', number: 'J-106', title: 'Boiler service', status: 'scheduled' }], href: `${calendar}&visit=00000000-0000-4000-8000-000000000106` },
  { id: '00000000-0000-4000-8000-000000000107', title: 'Tap replacement', customerName: 'Lopez', arrivalWindow: null, location: '15 Maple Street', crew: [{ id: 'morgan', name: 'Morgan Lee' }], records: [{ id: 'job-107', type: 'job', number: 'J-107', title: 'Tap replacement', status: 'scheduled' }], href: `${calendar}&visit=00000000-0000-4000-8000-000000000107` },
];
const meta = {
  title: 'Home/HomeScheduleWidget', component: HomeScheduleWidget, parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <main className="mx-auto w-full max-w-2xl p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p><Story /></main>],
  args: { today: copy.stories.date, timezone: copy.stories.timezone, calendarHref: calendar, state: { status: 'ready', visits, total: 5 } },
} satisfies Meta<typeof HomeScheduleWidget>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getAllByRole('listitem')).toHaveLength(5);
  await expect(c.getByText(copy.stories.timezone, { exact: false })).toBeVisible();
  await expect(c.getByRole('link', { name: copy.calendar })).toHaveAttribute('href', calendar);
  await expect(c.getByRole('link', { name: copy.calendar }).querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  for (const visit of visits) await expect(c.getByRole('link', { name: copy.openLabel(visit.title) })).toHaveAttribute('href', visit.href);
} };
export const AssignedWork: Story = { args: { calendarHref: `${calendar}&person=me`, state: { status: 'ready', visits: visits.slice(0, 3), total: 3 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getAllByRole('listitem')).toHaveLength(3);
  await expect(c.queryByText('Alex Chen', { exact: false })).not.toBeInTheDocument();
} };
export const SharedVisit: Story = { args: { state: { status: 'ready', visits: [visits[2]], total: 1 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getAllByRole('listitem')).toHaveLength(1);
  await expect(c.getByText('Job J-103 · Work Order WO-103')).toBeVisible();
  await expect(c.getAllByRole('link', { name: /^Open visit:/ })).toHaveLength(1);
} };
export const NoArrivalWindow: Story = { args: { state: { status: 'ready', visits: [visits[4]], total: 1 } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(visitCopy.noWindow)).toBeVisible();
} };
export const MissingDetails: Story = { args: { state: { status: 'ready', visits: [{ ...visits[0], location: null, crew: [] }], total: 1 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(`Miller · ${copy.noLocation}`)).toBeVisible();
  await expect(c.getByText(`${copy.crew}: ${visitCopy.unassigned}`)).toBeVisible();
} };
export const Empty: Story = { args: { state: { status: 'ready', visits: [], total: 0 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.empty)).toBeVisible(); await expect(c.queryByRole('list')).not.toBeInTheDocument();
} };
export const Loading: Story = { args: { state: { status: 'loading' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(copy.loading);
  await expect(c.getByRole('region', { name: copy.title })).toHaveAttribute('aria-busy', 'true');
  await expect(c.queryByText(copy.empty)).not.toBeInTheDocument();
} };
const retry = fn();
export const Error: Story = { args: { state: { status: 'error', onRetry: retry } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.error);
  await userEvent.click(c.getByRole('button', { name: copy.retry })); await expect(retry).toHaveBeenCalledTimes(1);
} };
export const Retrying: Story = { args: { state: { status: 'error', onRetry: fn(), retrying: true } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: copy.retry })).toBeDisabled();
} };
export const FiveVisitLimit: Story = { args: { state: { status: 'ready', visits: [...visits, { ...visits[0], id: 'visit-six', title: 'Sixth visit' }], total: 6 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getAllByRole('listitem')).toHaveLength(5);
  await expect(c.queryByText('Sixth visit')).not.toBeInTheDocument(); await expect(c.getByText(copy.remainder(5, 6))).toBeVisible();
} };
export const DescriptionTooltip: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body), trigger = c.getByRole('button', { name: copy.about });
  trigger.focus(); await userEvent.keyboard('{Enter}');
  const dialog = body.getByRole('dialog', { name: copy.about }); await expect(within(dialog).getByText(copy.description)).toBeVisible();
  await userEvent.click(within(dialog).getByRole('button', { name: 'Close' })); await waitFor(() => expect(trigger).toHaveFocus());
} };
export const LongContent: Story = { args: { state: { status: 'ready', visits: [{ ...visits[0], title: 'Inspect and replace heating, ventilation and plumbing throughout the property', location: 'Northside Community Workshop and Neighborhood Resource Center, 240 Alexandra Montgomery Avenue', crew: [{ id: 'alex', name: 'Alexandra Rivera Montgomery' }] }], total: 1 } } };
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
export const LongContentMobile: Story = { args: LongContent.args, globals: Mobile.globals };
