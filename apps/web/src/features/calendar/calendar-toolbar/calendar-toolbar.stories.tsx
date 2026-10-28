import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CalendarToolbar } from './calendar-toolbar';
import { calendarToolbarData as copy } from './calendar-toolbar.data';
function Stateful(args: ComponentProps<typeof CalendarToolbar>) {
  const [date, setDate] = useState(args.date);
  return <CalendarToolbar {...args} date={date} onNavigate={next => { setDate(next); args.onNavigate(next); }}/>;
}
const meta = {
  title: 'Calendar/CalendarToolbar', component: CalendarToolbar,
  args: { date: copy.stories.date, today: copy.stories.today, timezone: copy.stories.timezone,
    canSchedule: true, onNavigate: fn(), onSchedule: fn() },
  render: args => <Stateful {...args}/>, parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-6">
    <h1 className="m-0 text-heading font-semibold">{copy.stories.heading}</h1>
    <p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p><Story/>
  </main>],
} satisfies Meta<typeof CalendarToolbar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { name: 'Oct 19 – Oct 25, 2026' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: copy.schedule }));
    await expect(args.onSchedule).toHaveBeenCalledTimes(1);
  },
};
export const WeekNavigation: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: copy.next }));
    await expect(args.onNavigate).toHaveBeenLastCalledWith('2026-10-26');
    await expect(c.getByRole('heading', { name: 'Oct 26 – Nov 1, 2026' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: copy.previous }));
    await userEvent.click(c.getByRole('button', { name: copy.previous }));
    await expect(c.getByRole('heading', { name: 'Oct 12 – Oct 18, 2026' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: copy.today }));
    await expect(args.onNavigate).toHaveBeenLastCalledWith('2026-10-19');
    await expect(c.getByRole('heading', { name: 'Oct 19 – Oct 25, 2026' })).toBeVisible();
  },
};
export const YearBoundary: Story = { args: { date: '2027-01-01' } };
export const LeapYear: Story = { args: { date: '2028-02-29' } };
export const WorkspaceToday: Story = {
  args: { date: '2026-11-16', today: '2026-11-01', timezone: 'America/Los_Angeles' },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: copy.today }));
    await expect(args.onNavigate).toHaveBeenLastCalledWith('2026-10-26');
    await expect(c.getByRole('heading', { name: 'Oct 26 – Nov 1, 2026' })).toBeVisible();
  },
};
export const Field: Story = { args: { scopeLabel: copy.stories.field } };
export const ReadOnly: Story = {
  args: { canSchedule: false },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('button', { name: copy.schedule })).toBeDisabled();
    await expect(c.getByText(copy.readOnly)).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: copy.next }));
    await expect(args.onNavigate).toHaveBeenCalledWith('2026-10-26');
    await expect(args.onSchedule).not.toHaveBeenCalled();
  },
};
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    for (const name of [copy.previous, copy.today, copy.next, copy.schedule]) await expect(c.getByRole('button', { name })).toBeDisabled();
    await expect(c.getByRole('status')).toHaveTextContent(copy.loading);
  },
};
export const Keyboard: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement), previous = c.getByRole('button', { name: copy.previous });
    previous.focus(); await expect(previous).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onNavigate).toHaveBeenLastCalledWith('2026-10-12');
    await userEvent.tab(); await expect(c.getByRole('button', { name: copy.today })).toHaveFocus();
    await userEvent.keyboard(' '); await expect(args.onNavigate).toHaveBeenLastCalledWith('2026-10-19');
    // Leave the current focus in place for the browser's computed-outline check.
  },
};
