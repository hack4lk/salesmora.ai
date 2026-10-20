import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { LeadOwnerSelect, type LeadOwnerSelectProps } from './lead-owner-select';
import { leadOwnerSelectData as copy } from './lead-owner-select.data';

function Preview(args: LeadOwnerSelectProps) {
  const [value, setValue] = useState(args.value);
  return <LeadOwnerSelect {...args} value={value} onChange={next => { args.onChange(next); setValue(next); }}/>;
}
const meta = { title: 'Leads/LeadOwnerSelect', component: Preview, parameters: { layout: 'fullscreen' },
  args: { value: 'taylor', members: copy.stories.members, currentOwner: copy.stories.members[1], viewerId: 'sam', canAssign: true, onChange: fn(), onRetry: fn() },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-3 max-w-form leading-6 text-muted">{copy.stories.description}</p><div className="w-full max-w-form rounded-2xl border border-line bg-paper p-6"><Story/></div></main>],
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Unassigned: Story = { args: { value: null, currentOwner: null } };
export const FormerMember: Story = { args: { value: 'former', currentOwner: copy.stories.formerOwner } };
export const Workload: Story = { args: { members: copy.stories.members.map((member, index) => ({ ...member, openLeadCount: index === 0 ? 1250 : index === 1 ? 91 : 0 })) } };
export const ReadOnly: Story = { args: { canAssign: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.queryByRole('combobox')).not.toBeInTheDocument();
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
  await expect(c.queryByText(/open$/)).not.toBeInTheDocument();
  await expect(c.queryByText(copy.stories.members[0].name)).not.toBeInTheDocument();
} };
export const ReadOnlyFormer: Story = { ...FormerMember, args: { ...FormerMember.args, canAssign: false } };
export const Loading: Story = { args: { loading: true, members: [] } };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), select = c.getByRole('combobox', { name: copy.label });
  await expect(select).toBeDisabled();
  fireEvent.change(select, { target: { value: 'sam' } });
  await expect(args.onChange).not.toHaveBeenCalled();
} };
export const Error: Story = { args: { error: copy.stories.error }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('combobox', { name: copy.label })).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: copy.retry }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const EmptyTeam: Story = { args: { value: null, currentOwner: null, members: [] } };
export const UnknownOwner: Story = { args: { value: 'unknown', currentOwner: null } };
export const Narrow: Story = { args: { members: [{ ...copy.stories.members[1], name: copy.stories.longOwner }], currentOwner: { ...copy.stories.members[1], name: copy.stories.longOwner } }, parameters: { viewport: { value: 'phone' } } };
export const AssignToMe: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.assignMe }));
  await expect(args.onChange).toHaveBeenCalledWith('sam');
  await expect(c.getByRole('combobox', { name: copy.label })).toHaveValue('sam');
  await expect(c.getByRole('button', { name: copy.assignedMe })).toBeDisabled();
} };
export const SelectMember: Story = { play: async ({ canvasElement, args }) => {
  await userEvent.selectOptions(within(canvasElement).getByRole('combobox', { name: copy.label }), 'avery');
  await expect(args.onChange).toHaveBeenCalledWith('avery');
} };
export const Unassign: Story = { play: async ({ canvasElement, args }) => {
  await userEvent.selectOptions(within(canvasElement).getByRole('combobox', { name: copy.label }), '');
  await expect(args.onChange).toHaveBeenCalledWith(null);
} };
export const ReassignFormer: Story = { ...FormerMember, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('option', { name: copy.former })).toBeDisabled();
  await userEvent.selectOptions(c.getByRole('combobox', { name: copy.label }), 'sam');
  await waitFor(() => expect(args.onChange).toHaveBeenCalledWith('sam'));
} };
