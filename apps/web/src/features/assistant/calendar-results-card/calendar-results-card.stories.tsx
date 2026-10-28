import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CalendarResultsCard, type CalendarAssistantResult, type CalendarResultsCardProps } from './calendar-results-card';
import { calendarResultsCardData as copy } from './calendar-results-card.data';
import { calendarVisitFixtures, calendarEventCardData } from '../../calendar/calendar-event-card/calendar-event-card.data';
const visits = [
  { ...calendarVisitFixtures.shared, scheduledDate: '2026-10-20' },
  { ...calendarVisitFixtures.workOrder, scheduledDate: '2026-10-21', records: calendarVisitFixtures.workOrder.records.map(r => ({ ...r, id: 'preview-standalone-wo', number: copy.stories.workOrderNumber })) },
  { ...calendarVisitFixtures.job, scheduledDate: '2026-10-22', crew: [], records: calendarVisitFixtures.job.records.map(r => ({ ...r, id: 'preview-standalone-job', number: copy.stories.jobNumber })) },
];
const result: CalendarAssistantResult = {
  id: 'preview-calendar-result', mode: 'schedule', scope: 'workspace', timezone: copy.stories.timezone,
  checkedAt: copy.stories.checkedAt, from: copy.stories.from, to: copy.stories.to, filterLabels: copy.stories.filters,
  total: visits.length, visits,
};
function Preview(args: CalendarResultsCardProps) {
  const [notice, setNotice] = useState('');
  return <main className="mx-auto w-full max-w-2xl p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.heading}</h1><p className="mb-4 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p><CalendarResultsCard {...args}
    onOpenVisit={(id, visitId) => { args.onOpenVisit?.(id, visitId); setNotice(copy.stories.openedVisit); }}
    onOpenCalendar={id => { args.onOpenCalendar?.(id); setNotice(copy.stories.openedCalendar); }}/>{notice && <p role="status" className="mt-4 text-sm leading-6">{notice}</p>}</main>;
}
const meta = { title: 'Assistant/CalendarResultsCard', component: CalendarResultsCard, parameters: { layout: 'fullscreen' },
  args: { result, onOpenVisit: fn(), onOpenCalendar: fn() }, render: args => <Preview {...args}/> } satisfies Meta<typeof CalendarResultsCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText(copy.count(3, 3))).toBeVisible();
  await expect(canvas.getByText(copy.shared)).toBeVisible();
  await userEvent.click(canvas.getAllByRole('button', { name: /^View visit:/ })[0]);
  await expect(args.onOpenVisit).toHaveBeenCalledWith(result.id, visits[0].id);
  await expect(canvas.getByText(copy.stories.openedVisit)).toBeVisible();
  await userEvent.click(canvas.getByRole('button', { name: copy.openCalendar }));
  await expect(args.onOpenCalendar).toHaveBeenCalledWith(result.id);
} };
export const OnlyMySchedule: Story = { args: { result: { ...result, scope: 'own', filterLabels: [copy.stories.ownFilter], total: 1, visits: [visits[0]] } }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText(copy.scope.own)).toBeVisible(); } };
export const Unscheduled: Story = { args: { result: { id: result.id, mode: 'unscheduled', scope: result.scope, timezone: result.timezone, checkedAt: result.checkedAt, filterLabels: [], total: 2, visits: visits.slice(0, 2).map(v => ({ ...v, scheduledDate: null, arrivalWindow: null })) } }, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await expect(canvas.getAllByText(copy.noDate)).toHaveLength(2); } };
export const MoreResults: Story = { args: { result: { ...result, total: 42 } }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText(copy.count(3, 42))).toBeVisible(); } };
export const Empty: Story = { args: { result: { ...result, total: 0, visits: [] } }, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await expect(canvas.getByText(copy.empty.schedule)).toBeVisible(); await expect(canvas.queryByRole('button', { name: /^View visit:/ })).not.toBeInTheDocument(); } };
export const EmptyUnscheduled: Story = { args: { result: { id: result.id, mode: 'unscheduled', scope: 'own', timezone: result.timezone, checkedAt: result.checkedAt, filterLabels: [], total: 0, visits: [] } } };
export const Loading: Story = { args: { state: 'loading' }, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await expect(canvas.getByText(copy.states.loading)).toBeVisible(); await expect(canvas.queryByText(visits[0].title)).not.toBeInTheDocument(); await expect(canvas.queryByRole('button')).not.toBeInTheDocument(); } };
export const Error: Story = { args: { state: 'error' } };
export const AccessChanged: Story = { args: { state: 'unavailable' }, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await expect(canvas.getByText(copy.states.unavailable)).toBeVisible(); await expect(canvas.queryByText(visits[0].title)).not.toBeInTheDocument(); await expect(canvas.queryByRole('button')).not.toBeInTheDocument(); } };
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement, args }) => { const canvas = within(canvasElement); for (const button of canvas.getAllByRole('button')) { await expect(button).toBeDisabled(); await userEvent.click(button); } await expect(args.onOpenVisit).not.toHaveBeenCalled(); await expect(args.onOpenCalendar).not.toHaveBeenCalled(); } };
export const InvalidSnapshot: Story = { args: { result: { ...result, visits: [visits[0], visits[0]] } }, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await expect(canvas.getByText(copy.states.error)).toBeVisible(); await expect(canvas.queryByRole('button')).not.toBeInTheDocument(); } };
export const LongContent: Story = { args: { result: { ...result, filterLabels: [copy.stories.longFilter], total: 1, visits: [{ ...visits[0], title: calendarEventCardData.stories.longTitle, records: visits[0].records.map(r => ({ ...r, title: calendarEventCardData.stories.longTitle })), crew: [{ id: 'long', name: calendarEventCardData.stories.longName }] }] } } };
export const Keyboard: Story = { play: async ({ canvasElement, args }) => { const canvas = within(canvasElement); const button = canvas.getAllByRole('button', { name: /^View visit:/ })[0]; button.focus(); await expect(button).toHaveFocus(); await userEvent.keyboard('{Enter}'); await expect(args.onOpenVisit).toHaveBeenCalledWith(result.id, visits[0].id); } };
