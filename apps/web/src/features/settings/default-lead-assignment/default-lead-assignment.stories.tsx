import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { DefaultLeadAssignment, type DefaultLeadAssignmentProps } from './default-lead-assignment';
import { defaultLeadAssignmentData as copy } from './default-lead-assignment.data';
function Preview(args: DefaultLeadAssignmentProps) {
  const [value, setValue] = useState(args.value), [savedValue, setSaved] = useState(args.savedValue);
  return <DefaultLeadAssignment {...args} value={value} savedValue={savedValue} onChange={next => { args.onChange(next); setValue(next); }} onDiscard={() => { args.onDiscard(); setValue(savedValue); }} onSave={async request => { await args.onSave(request); setSaved(request.value); }} />;
}
const meta = { title: 'Settings/DefaultLeadAssignment', component: DefaultLeadAssignment, render: args => <Preview {...args} />, parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="mx-auto grid min-h-screen max-w-3xl content-start gap-6 bg-canvas p-4 sm:p-8"><p className="m-0 text-sm leading-6 text-muted">{copy.stories.notice}</p><Story /></main>],
  args: { value: { kind: 'unassigned' }, savedValue: { kind: 'unassigned' }, revision: 1, canRead: true, canManage: true,
    teammates: [{ id: 'alex', name: copy.stories.alex }, { id: 'sam', name: copy.stories.sam }], onChange: fn(), onDiscard: fn(), onReload: fn(), onRetryTeammates: fn(), onSave: fn(async () => {}) },
} satisfies Meta<typeof DefaultLeadAssignment>;
export default meta; type Story = StoryObj<typeof meta>;
const teammate = { kind: 'teammate' as const, teammateId: 'alex' };
export const Default: Story = { play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('radio', { name: copy.unassigned })).toBeChecked(); await expect(c.getByRole('button', { name: copy.save })).toBeDisabled(); } };
export const SelectedTeammate: Story = { args: { value: teammate, savedValue: teammate } };
export const ChooseAndSave: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('radio', { name: copy.teammate })); await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
  await userEvent.selectOptions(c.getByRole('combobox', { name: copy.teammateLabel }), 'alex'); await userEvent.click(c.getByRole('button', { name: copy.save }));
  await expect(args.onSave).toHaveBeenCalledWith({ value: teammate, expectedVersion: 1 }); await expect(await c.findByText(copy.saved)).toBeVisible();
} };
export const ClearAssignment: Story = { args: { value: teammate, savedValue: teammate }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('radio', { name: copy.unassigned })); await userEvent.click(c.getByRole('button', { name: copy.save })); await expect(args.onSave).toHaveBeenCalledWith({ value: { kind: 'unassigned' }, expectedVersion: 1 });
} };
export const StaleTeammate: Story = { args: { value: { kind: 'teammate', teammateId: 'removed' } }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); await expect(c.getByText(copy.invalid)).toBeVisible(); await expect(c.getByRole('button', { name: copy.save })).toBeDisabled(); await expect(args.onSave).not.toHaveBeenCalled(); } };
export const TeammatesLoading: Story = { args: { value: teammate, teammatesState: 'loading' } };
export const TeammatesFailed: Story = { args: { value: teammate, teammatesState: 'error' }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); await expect(c.getByRole('button', { name: copy.save })).toBeDisabled(); await userEvent.click(c.getByRole('button', { name: copy.retryTeammates })); await expect(args.onRetryTeammates).toHaveBeenCalledOnce(); } };
export const NoTeammates: Story = { args: { teammates: [] } };
export const ReadOnly: Story = { args: { canManage: false, value: teammate, savedValue: teammate }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); await expect(c.getByRole('combobox')).toBeDisabled(); await expect(c.getByRole('button', { name: copy.save })).toBeDisabled(); await expect(args.onSave).not.toHaveBeenCalled(); } };
export const Denied: Story = { args: { canRead: false, value: teammate }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.denied); await expect(c.queryByRole('radio')).not.toBeInTheDocument(); await expect(c.queryByText(copy.stories.alex)).not.toBeInTheDocument(); } };
export const Loading: Story = { args: { state: 'loading' } };
export const LoadError: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => { await userEvent.click(within(canvasElement).getByRole('button', { name: copy.reload })); await expect(args.onReload).toHaveBeenCalledOnce(); } };
export const Pending: Story = { args: { value: teammate, onSave: fn(() => new Promise<void>(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.save })); await expect(c.getByRole('button', { name: copy.saving })).toBeDisabled();
  fireEvent.submit(c.getByRole('button', { name: copy.saving }).closest('form')!); await expect(args.onSave).toHaveBeenCalledOnce(); await expect(c.getByRole('radio', { name: copy.unassigned })).toBeDisabled();
} };
export const FailureAndRetry: Story = { args: { value: teammate }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); args.onSave.mockRejectedValueOnce(new Error('Preview failure')); await userEvent.click(c.getByRole('button', { name: copy.save })); await expect(await c.findByRole('alert')).toHaveTextContent(copy.failed);
  await expect(c.getByRole('combobox')).toHaveValue('alex'); await userEvent.click(c.getByRole('button', { name: copy.save })); await expect(await c.findByText(copy.saved)).toBeVisible(); await expect(args.onSave).toHaveBeenCalledTimes(2);
} };
export const Conflict: Story = { args: { value: teammate, conflict: true }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); await expect(c.getByRole('button', { name: copy.save })).toBeDisabled(); await userEvent.click(c.getByRole('button', { name: copy.reload })); await expect(args.onReload).toHaveBeenCalledOnce(); } };
export const Discard: Story = { args: { value: teammate }, play: async ({ canvasElement }) => { const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.discard })); await expect(c.getByRole('radio', { name: copy.unassigned })).toBeChecked(); } };
export const Keyboard: Story = { args: { value: teammate }, play: async ({ canvasElement, args }) => { const button = within(canvasElement).getByRole('button', { name: copy.save }); button.focus(); await userEvent.keyboard('{Enter}'); await waitFor(() => expect(args.onSave).toHaveBeenCalledOnce()); } };
export const LongName: Story = { args: { value: teammate, savedValue: teammate, teammates: [{ id: 'alex', name: copy.stories.longName }] } };
