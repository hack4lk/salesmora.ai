import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MaterialRowActions } from './material-row-actions';
import { materialFixtures } from '../materials-preview.data';

const handlers = { onEdit: fn(), onArchive: fn(), onRestore: fn(), onApprove: fn(), onReject: fn(), onWithdraw: fn() };
const meta = { title: 'Materials/MaterialRowActions', component: MaterialRowActions, args: { row: materialFixtures[0], canManage: true, ...handlers } } satisfies Meta<typeof MaterialRowActions>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveItem: Story = {
  play: async ({ canvasElement, args }) => { await userEvent.click(within(canvasElement).getByRole('button', { name: 'Archive' })); await expect(args.onArchive).toHaveBeenCalledWith(materialFixtures[0]); },
};
export const ArchivedItem: Story = { args: { row: materialFixtures[11] } };
export const ProposalForManager: Story = { args: { row: materialFixtures[12] } };
export const ProposalForProposer: Story = { args: { row: materialFixtures[12], canManage: false } };
export const ReadOnly: Story = { args: { canManage: false } };
export const Pending: Story = { args: { pending: true } };
