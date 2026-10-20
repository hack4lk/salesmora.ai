import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MaterialsToolbar } from './materials-toolbar';

const meta = { title: 'Materials/MaterialsToolbar', component: MaterialsToolbar, args: { total: 12, canManage: true, canPropose: true, canExport: true, onAdd: fn(), onExport: fn() } } satisfies Meta<typeof MaterialsToolbar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Manager: Story = { play: async ({ canvasElement, args }) => { await userEvent.click(within(canvasElement).getByRole('button', { name: 'Add material' })); await expect(args.onAdd).toHaveBeenCalled(); } };
export const Proposer: Story = { args: { canManage: false, canExport: false } };
export const ReadOnly: Story = { args: { canManage: false, canPropose: false, canExport: false } };
export const Exporting: Story = { args: { exporting: true } };
export const Empty: Story = { args: { total: 0 } };
export const Single: Story = { args: { total: 1 } };
