import { expect, fn, userEvent, within } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { WorkOrderAddMaterialDialog } from './work-order-add-material-dialog';
import { searchFixtures } from '../../materials/material-picker/material-picker.data';

const meta = {
  title: 'Work Orders/WorkOrderAddMaterialDialog', component: WorkOrderAddMaterialDialog,
  args: { open: true, search: searchFixtures, showPrices: true, newMaterial: { propose: false, onStart: fn() }, onClose: fn(), onSubmit: fn() },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof WorkOrderAddMaterialDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const PickFromCatalog: Story = {};
export const NeedsAnItem: Story = {
  play: async () => {
    const d = within(document.body);
    await userEvent.click(await d.findByRole('button', { name: 'Add to work order' }));
    await expect(await d.findByText('Choose a catalog item to continue.')).toBeInTheDocument();
  },
};
export const AddNewMaterial: Story = {
  play: async ({ args }) => {
    await userEvent.click(await within(document.body).findByRole('button', { name: 'Add a new material' }));
    await expect(args.newMaterial!.onStart).toHaveBeenCalled();
  },
};
export const ProposeOnly: Story = {
  args: { newMaterial: { propose: true, onStart: fn() } },
  play: async () => { await expect(await within(document.body).findByRole('button', { name: 'Propose a new material' })).toBeInTheDocument(); },
};
export const NoPrices: Story = {
  args: { showPrices: false },
  play: async () => { await within(document.body).findByRole('dialog'); await expect(within(document.body).queryByLabelText('Price per unit ($)')).toBeNull(); },
};
export const CannotAddNew: Story = {
  args: { newMaterial: undefined },
  play: async () => { await within(document.body).findByRole('dialog'); await expect(within(document.body).queryByText('Not in the catalog?')).toBeNull(); },
};
export const Saving: Story = { args: { pending: true } };
export const SaveError: Story = { args: { error: 'This work order changed. Reload and try again.' } };
