import { fn, expect, userEvent, within, fireEvent } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { WorkOrderReopenDialog } from './work-order-reopen-dialog';

const meta = { title: 'Work Orders/WorkOrderReopenDialog', component: WorkOrderReopenDialog, args: { open: true, number: 'WO-0007', onClose: fn(), onConfirm: fn() },
  decorators: [Story => <main className="min-h-screen bg-canvas p-6"><Story /></main>] } satisfies Meta<typeof WorkOrderReopenDialog>;
export default meta; type Story = StoryObj<typeof meta>;
export const ReasonRequired: Story = { play: async ({ canvasElement, args }) => {
  const b = within(canvasElement.ownerDocument.body), confirm = await b.findByRole('button', { name: 'Reopen work order' });
  await expect(confirm).toBeDisabled();
  fireEvent.change(b.getByLabelText(/Reason for reopening/), { target: { value: 'Leak returned' } });
  await expect(confirm).toBeEnabled();
  await userEvent.click(confirm);
  await expect(args.onConfirm).toHaveBeenCalledWith('Leak returned');
} };
export const Saving: Story = { args: { pending: true } };
export const Error: Story = { args: { error: 'The work order could not be reopened. Try again.' } };
export const Conflict: Story = { args: { error: 'This work order changed elsewhere.', conflict: true, onReload: fn() } };
