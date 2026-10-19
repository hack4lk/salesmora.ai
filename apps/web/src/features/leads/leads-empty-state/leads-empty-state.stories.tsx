import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Toast } from '@salesmora/ui';
import { LeadsEmptyState, type LeadsEmptyStateProps } from './leads-empty-state';
import { leadsEmptyStateData as copy } from './leads-empty-state.data';

function Preview(args: LeadsEmptyStateProps) {
  const [notice, setNotice] = useState('');
  return <>
    <LeadsEmptyState {...args} onAdd={args.onAdd ? () => { args.onAdd?.(); setNotice(copy.stories.addRequested); } : undefined}
      onClearFilters={args.onClearFilters ? () => { args.onClearFilters?.(); setNotice(copy.stories.clearRequested); } : undefined}/>
    <Toast open={!!notice} kind="success" message={notice} autoHideMs={2000} onClose={() => setNotice('')}/>
  </>;
}
const meta = {
  title: 'Leads/LeadsEmptyState', component: Preview, parameters: { layout: 'fullscreen' },
  args: { variant: 'first-run', scope: 'workspace', canCreate: true, onAdd: fn(), onClearFilters: fn() },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-3 text-muted">{copy.stories.description}</p><Story/></main>],
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Filtered: Story = { args: { variant: 'filtered' } };
export const ReadOnly: Story = { args: { canCreate: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('button', { name: copy.add })).not.toBeInTheDocument();
} };
export const AssignedScope: Story = { ...ReadOnly, args: { canCreate: false, scope: 'assigned' } };
export const AssignedFiltered: Story = { ...Filtered, args: { variant: 'filtered', canCreate: false, scope: 'assigned' } };
export const MissingAddHandler: Story = { ...ReadOnly, args: { onAdd: undefined } };
export const MissingClearHandler: Story = { args: { variant: 'filtered', onClearFilters: undefined } };
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement, args }) => {
  const button = within(canvasElement).getByRole('button', { name: copy.add });
  await expect(button).toBeDisabled(); await userEvent.click(button); await expect(args.onAdd).not.toHaveBeenCalled();
} };
export const Narrow: Story = { ...Filtered, parameters: { viewport: { value: 'phone' } } };
export const AddRequest: Story = { play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: copy.add }));
  await expect(args.onAdd).toHaveBeenCalledTimes(1); await expect(args.onClearFilters).not.toHaveBeenCalled();
} };
export const ClearRequest: Story = { ...Filtered, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: copy.clear }));
  await expect(args.onClearFilters).toHaveBeenCalledTimes(1); await expect(args.onAdd).not.toHaveBeenCalled();
} };
