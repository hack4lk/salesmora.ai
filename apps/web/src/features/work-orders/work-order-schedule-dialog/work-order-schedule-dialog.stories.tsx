import { fn, expect, userEvent, within, fireEvent } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { WorkOrderScheduleDialog } from './work-order-schedule-dialog';

const meta = { title: 'Work Orders/WorkOrderScheduleDialog', component: WorkOrderScheduleDialog, args: { open: true, schedule: { date: null, window: null }, onClose: fn(), onConfirm: fn() },
  decorators: [Story => <main className="min-h-screen bg-canvas p-6"><Story /></main>] } satisfies Meta<typeof WorkOrderScheduleDialog>;
export default meta; type Story = StoryObj<typeof meta>;
export const New: Story = { play: async ({ canvasElement, args }) => {
  const b = within(canvasElement.ownerDocument.body), save = await b.findByRole('button', { name: 'Save schedule' });
  await expect(save).toBeDisabled();
  fireEvent.change(b.getByLabelText('Date'), { target: { value: '2026-11-03' } });
  await userEvent.selectOptions(b.getByLabelText('Arrival window'), '09:00-11:00');
  await userEvent.click(save);
  await expect(args.onConfirm).toHaveBeenCalledWith({ scheduledDate: '2026-11-03', arrivalWindow: '09:00-11:00' });
} };
export const Existing: Story = { args: { schedule: { date: '2026-11-03', window: '09:00-11:00' } }, play: async ({ canvasElement, args }) => {
  const b = within(canvasElement.ownerDocument.body);
  await userEvent.click(await b.findByRole('button', { name: 'Clear schedule' }));
  await userEvent.click(await b.findByRole('button', { name: 'Clear schedule' }));
  await expect(args.onConfirm).toHaveBeenCalledWith({ scheduledDate: null, arrivalWindow: null });
} };
export const Saving: Story = { args: { pending: true } };
export const Error: Story = { args: { error: 'The schedule could not be saved. Try again.' } };
