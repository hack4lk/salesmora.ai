import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CalendarWorkTimeFields } from './calendar-work-time-fields';
import { calendarWorkTimeFieldsData as copy } from './calendar-work-time-fields.data';

const meta = { title: 'Calendar/CalendarWorkTimeFields', component: CalendarWorkTimeFields,
  args: { value: null, onChange: fn() },
  render: function Render(args) { const [value, setValue] = useState(args.value); return <main className="mx-auto max-w-xl bg-canvas p-5"><CalendarWorkTimeFields {...args} value={value} onChange={next => { setValue(next); args.onChange(next); }}/></main>; },
} satisfies Meta<typeof CalendarWorkTimeFields>;
export default meta;
type Story = StoryObj<typeof meta>;
export const NotRecorded: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('checkbox', { name: copy.toggle })).not.toBeChecked();
  await expect(c.getByText(copy.unknown)).toBeVisible(); await expect(args.onChange).not.toHaveBeenCalled();
  await expect(c.queryByLabelText(copy.start)).not.toBeInTheDocument();
} };
export const EnterWorkTime: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('checkbox', { name: copy.toggle }));
  await userEvent.type(c.getByLabelText(copy.start), '09:00');
  const duration = c.getByLabelText(copy.duration); await userEvent.clear(duration); await userEvent.type(duration, '90');
  await expect(c.getByRole('status')).toHaveTextContent('Planned finish: 10:30 AM · 1 hour 30 min');
  await expect(args.onChange).toHaveBeenLastCalledWith({ startTime: '09:00', durationMinutes: 90 });
} };
export const Recorded: Story = { args: { value: { startTime: '08:15', durationMinutes: 120 } } };
export const Overnight: Story = { args: { value: { startTime: '23:30', durationMinutes: 60 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(copy.invalid); await expect(c.queryByText(/Planned finish:/)).not.toBeInTheDocument();
} };
export const RemoveWorkTime: Story = { args: { value: { startTime: '08:15', durationMinutes: 120 } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('checkbox', { name: copy.toggle }));
  await expect(args.onChange).toHaveBeenLastCalledWith(null); await expect(c.getByText(copy.unknown)).toBeVisible();
} };
export const Disabled: Story = { args: { value: { startTime: '08:15', durationMinutes: 120 }, disabled: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByLabelText(copy.start)).toBeDisabled(); await expect(c.getByLabelText(copy.duration)).toBeDisabled();
  await expect(c.getByRole('checkbox')).toBeDisabled(); await expect(args.onChange).not.toHaveBeenCalled();
} };
export const Mobile: Story = { ...Recorded, globals: { viewport: { value: 'phone', isRotated: false } } };
