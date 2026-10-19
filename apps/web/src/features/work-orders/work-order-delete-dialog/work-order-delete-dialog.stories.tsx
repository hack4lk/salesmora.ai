import { fn, expect, userEvent, within } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { WorkOrderDeleteDialog } from './work-order-delete-dialog';
import { copy } from './work-order-delete-dialog.data';

const meta = { title: 'Work Orders/WorkOrderDeleteDialog', component: WorkOrderDeleteDialog, args: { open: true, number: 'WO-0007', title: 'Replace water heater', onClose: fn(), onConfirm: fn() },
  decorators: [Story => <main className="min-h-screen bg-canvas p-6"><Story /></main>] } satisfies Meta<typeof WorkOrderDeleteDialog>;
export default meta; type Story = StoryObj<typeof meta>;
export const TypedConfirmation: Story = { play: async ({ canvasElement, args }) => {
  const b = within(canvasElement.ownerDocument.body), confirm = await b.findByRole('button', { name: copy.confirm });
  await expect(confirm).toBeDisabled();
  await userEvent.type(b.getByRole('textbox'), 'WO-0007');
  await expect(confirm).toBeEnabled();
  await userEvent.click(confirm);
  await expect(args.onConfirm).toHaveBeenCalled();
} };
export const Deleting: Story = { args: { pending: true } };
export const Error: Story = { args: { error: 'The work order could not be deleted. Try again.' } };
