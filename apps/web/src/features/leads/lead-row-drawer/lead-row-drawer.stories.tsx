import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { LeadRowDrawer, type LeadRowDrawerProps } from './lead-row-drawer';
import { leadRowDrawerData as copy } from './lead-row-drawer.data';

function Preview(args: LeadRowDrawerProps) {
  const [open, setOpen] = useState(args.open);
  return <main className="min-h-screen bg-canvas p-6 sm:p-8">
    <h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-3 text-muted">{copy.stories.description}</p>
    <button type="button" className="min-h-11 cursor-pointer rounded-xl bg-primary px-5 py-3 font-semibold text-paper hover:bg-primary-dark focus-visible:focus-ring" onClick={() => setOpen(true)}>{copy.stories.open}</button>
    <LeadRowDrawer {...args} open={open} onClose={() => { args.onClose(); setOpen(false); }}/>
  </main>;
}
const meta = { title: 'Leads/LeadRowDrawer', component: Preview, parameters: { layout: 'fullscreen' },
  args: { open: true, lead: copy.stories.lead, viewerId: 'taylor', timezone: copy.stories.timezone, recordHref: copy.stories.href,
    onClose: fn(), onRequestMove: fn(), onRequestAssignment: fn(), onAssignToMe: fn(), onReload: fn() },
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Moving: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement.ownerDocument.body);
  await expect(c.getByRole('button', { name: 'Close panel' })).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.move })).toBeDisabled();
  await expect(c.getByRole('link', { name: copy.record })).toHaveAttribute('aria-disabled', 'true');
  await userEvent.keyboard('{Escape}');
  await expect(args.onClose).not.toHaveBeenCalled();
} };
export const ReadOnly: Story = { args: { lead: { ...copy.stories.lead, permissions: { canMove: false, canAssign: false } } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement.ownerDocument.body);
  for (const label of [copy.move, copy.changeOwner, copy.assignMe]) await expect(c.queryByRole('button', { name: label })).not.toBeInTheDocument();
} };
export const Conflict: Story = { args: { error: { kind: 'conflict', message: copy.stories.conflict } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement.ownerDocument.body);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.stories.conflict);
  await expect(c.getByRole('button', { name: copy.move })).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.changeOwner })).toBeDisabled();
} };
export const MissingDetails: Story = { args: { lead: { ...copy.stories.lead, email: null, phone: null, owner: null, nextStep: null, activity: [], activityTotal: 0 } } };
export const AssignedToMe: Story = { args: { viewerId: 'sam' } };
export const Archived: Story = { args: { lead: { ...copy.stories.lead, archived: true, permissions: { canMove: false, canAssign: false } } } };
export const Narrow: Story = { parameters: { viewport: { value: 'mobile1' } } };
export const RequestMove: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: copy.move }));
  await expect(args.onRequestMove).toHaveBeenCalledWith(args.lead);
  await expect(c.getByRole('dialog')).toBeVisible();
} };
export const RequestAssignment: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: copy.changeOwner }));
  await expect(args.onRequestAssignment).toHaveBeenCalledWith(args.lead);
  await userEvent.click(c.getByRole('button', { name: copy.assignMe }));
  await expect(args.onAssignToMe).toHaveBeenCalledWith(args.lead);
} };
