import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AssignedLeadColdCard, type AssignedLeadColdCardProps } from './workflow-assigned-lead-cold-card';

const meta = {
  title: 'Workflows/Assigned lead going cold', component: AssignedLeadColdCard, parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="min-h-screen bg-assistant-panel p-4 text-assistant-foreground sm:p-8"><div className="mx-auto max-w-2xl"><Story/></div></main>],
  args: {
    value: { name: 'Assigned lead needs attention', businessDays: 3, localTime: '09:00', recipient: { kind: 'owner' }, notifications: { inApp: true, email: true } },
    recipients: [{ id: 'alex', name: 'Alex Parker' }, { id: 'morgan', name: 'Morgan Ellis' }], timezone: 'America/New_York', canPublish: true,
    onPublish: fn<AssignedLeadColdCardProps['onPublish']>(async () => {}), onCancel: fn<AssignedLeadColdCardProps['onCancel']>(async () => {}),
  },
} satisfies Meta<typeof AssignedLeadColdCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Review: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByText('Notify the lead owner at 9:00 AM if an assigned lead has no recorded activity for 3 business days.')).toBeVisible();
  await expect(c.getByLabelText('Notify')).toHaveValue('owner');
  await expect(c.getByLabelText('In-app')).toBeChecked(); await expect(c.getByLabelText('Email')).toBeChecked();
  await expect(c.getByText('Existing assigned leads start their first reminder period when you publish.')).toBeVisible();
  await expect(args.onPublish).not.toHaveBeenCalled();
} };
export const Publish: Story = {
  render: function Review(args) { const [done, setDone] = useState(false); return <AssignedLeadColdCard {...args} state={done ? 'published' : 'draft'} onPublish={async value => { await args.onPublish(value); setDone(true); }}/>; },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Publish workflow' }));
    await expect(args.onPublish).toHaveBeenCalledWith(args.value); await expect(c.getByText('Workflow published.')).toBeVisible();
  },
};
export const ChooseTeammate: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.selectOptions(c.getByLabelText('Notify'), 'member:morgan');
  await expect(c.getByText(/Notify Morgan Ellis at/)).toBeVisible(); await userEvent.click(c.getByLabelText('Email'));
  await userEvent.click(c.getByRole('button', { name: 'Publish workflow' }));
  await expect(args.onPublish).toHaveBeenCalledWith({ ...args.value, recipient: { kind: 'teammate', id: 'morgan' }, notifications: { inApp: true, email: false } });
} };
export const ReturnToOwner: Story = { args: { value: { ...meta.args.value, recipient: { kind: 'teammate', id: 'morgan' } } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.selectOptions(c.getByLabelText('Notify'), 'owner'); await userEvent.click(c.getByRole('button', { name: 'Publish workflow' }));
  await expect(args.onPublish).toHaveBeenCalledWith({ ...args.value, recipient: { kind: 'owner' } });
} };
export const ChangeDelayAndTime: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), days = c.getByLabelText('Business days without activity'), time = c.getByLabelText('Send at');
  await userEvent.clear(days); await userEvent.type(days, '5'); await userEvent.clear(time); await userEvent.type(time, '08:30');
  await userEvent.click(c.getByRole('button', { name: 'Publish workflow' })); await expect(args.onPublish).toHaveBeenCalledWith({ ...args.value, businessDays: 5, localTime: '08:30' });
} };
export const EditPaused: Story = { args: { editing: true, paused: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByText('This workflow stays paused after saving.')).toBeVisible();
  await expect(c.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  await expect(c.queryByText('Existing assigned leads start their first reminder period when you publish.')).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: 'Change settings' })); const name = c.getByLabelText('Workflow name'); await expect(name).toHaveFocus();
  await userEvent.clear(name); await userEvent.type(name, 'Follow up on quiet leads'); await userEvent.click(c.getByRole('button', { name: 'Back to review' }));
  await expect(c.getByRole('heading')).toHaveFocus(); await userEvent.selectOptions(c.getByLabelText('Notify'), 'member:alex');
  await userEvent.click(c.getByRole('button', { name: 'Save changes' }));
  await expect(args.onPublish).toHaveBeenCalledWith({ ...args.value, name: 'Follow up on quiet leads', recipient: { kind: 'teammate', id: 'alex' } });
} };
export const InvalidDelay: Story = { args: { value: { ...meta.args.value, businessDays: 31 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent('Choose a delay of 1–30 business days.'); await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
} };
export const EmptyDelay: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.clear(c.getByLabelText('Business days without activity')); await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
} };
export const InvalidTime: Story = { args: { value: { ...meta.args.value, localTime: '' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent('Choose a valid send time.'); await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
} };
export const NoChannels: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByLabelText('In-app')); await userEvent.click(c.getByLabelText('Email'));
  await expect(c.getByRole('alert')).toHaveTextContent('Choose at least one notification option.'); await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
} };
export const MissingTeammate: Story = { args: { value: { ...meta.args.value, recipient: { kind: 'teammate', id: 'removed' } } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent('Choose a current teammate or Lead owner.'); await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
  await userEvent.selectOptions(c.getByLabelText('Notify'), 'owner'); await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeEnabled();
} };
export const OwnerWithNoFixedRecipients: Story = { args: { recipients: [] }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('button', { name: 'Publish workflow' })).toBeEnabled(); } };
export const ReadOnly: Story = { args: { canPublish: false }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByLabelText('Notify')).toBeDisabled(); await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeDisabled(); } };
export const SaveError: Story = { args: { onPublish: fn<AssignedLeadColdCardProps['onPublish']>(async () => { throw Error('Synthetic failure'); }) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.selectOptions(c.getByLabelText('Notify'), 'member:morgan'); await userEvent.click(c.getByRole('button', { name: 'Publish workflow' }));
  await expect(await c.findByRole('alert')).toHaveTextContent('The workflow could not be saved. Your choices are still here.'); await expect(c.getByLabelText('Notify')).toHaveValue('member:morgan');
} };
export const Pending: Story = { args: { onPublish: fn<AssignedLeadColdCardProps['onPublish']>(async () => new Promise<void>(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Publish workflow' })); await expect(c.getByRole('button', { name: 'Saving…' })).toBeDisabled(); await expect(c.getByRole('button', { name: 'Cancel' })).toBeDisabled(); await expect(c.getByLabelText('Notify')).toBeDisabled(); await expect(args.onPublish).toHaveBeenCalledTimes(1);
} };
export const Cancel: Story = { play: async ({ canvasElement, args }) => { await userEvent.click(within(canvasElement).getByRole('button', { name: 'Cancel' })); await expect(args.onCancel).toHaveBeenCalledOnce(); await expect(args.onPublish).not.toHaveBeenCalled(); } };
export const Expired: Story = { args: { expiresAt: '2020-01-01T00:00:00Z' }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByText('This draft expired. Ask for a fresh review.')).toBeVisible(); await expect(c.queryByRole('button', { name: 'Publish workflow' })).not.toBeInTheDocument(); } };
export const Published: Story = { args: { state: 'published' } };
export const Cancelled: Story = { args: { state: 'cancelled' } };
export const Mobile: Story = { ...ChooseTeammate, globals: { viewport: { value: 'phone', isRotated: false } } };
