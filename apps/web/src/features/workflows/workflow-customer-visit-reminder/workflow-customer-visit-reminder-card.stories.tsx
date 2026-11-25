import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CustomerVisitReminderCard, type CustomerVisitReminderCardProps } from './workflow-customer-visit-reminder-card';

const meta = {
  title: 'Workflows/Customer visit reminder', component: CustomerVisitReminderCard, parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="min-h-screen bg-assistant-panel p-4 text-assistant-foreground sm:p-8"><div className="mx-auto max-w-2xl"><Story/></div></main>],
  args: {
    value: { name: 'Remind customers before their visit', localTime: '09:00' }, timezone: 'America/New_York',
    company: { name: 'Example Home Services', phone: '555-010-0142', email: 'office@example.test' },
    sample: { customerName: 'Skyler', email: 'skyler@example.test', date: 'March 15, 2027', arrivalWindow: '9 AM – 11 AM' },
    senderReady: true, emailSettingsHref: '#email-settings', canPublish: true,
    onPublish: fn<CustomerVisitReminderCardProps['onPublish']>(async () => {}), onCancel: fn<CustomerVisitReminderCardProps['onCancel']>(async () => {}),
  },
} satisfies Meta<typeof CustomerVisitReminderCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Review: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByText('Automatically email each customer at 9:00 AM the day before their visit.')).toBeVisible();
  await expect(c.getByLabelText('Send at')).toHaveValue('09:00');
  await expect(c.queryByLabelText('Notify')).not.toBeInTheDocument();
  await expect(c.queryByLabelText('In-app')).not.toBeInTheDocument();
  await expect(args.onPublish).not.toHaveBeenCalled();
} };
export const EmailPreview: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByText('Preview customer email'));
  const email = within(c.getByRole('article', { name: 'Customer reminder email' }));
  await expect(email.getByRole('img', { name: 'SalesMora' })).toBeVisible();
  await expect(email.getByText('March 15, 2027', { exact: true })).toBeVisible();
  await expect(email.getByText('9 AM – 11 AM', { exact: true })).toBeVisible();
  await expect(email.getByText(/call 555-010-0142 or email/)).toBeVisible();
  await expect(email.queryByText(/reply to/i)).not.toBeInTheDocument();
  await expect(email.queryByRole('link')).not.toBeInTheDocument();
  await expect(args.onPublish).not.toHaveBeenCalled();
} };
export const Publish: Story = {
  render: function Preview(args) { const [done, setDone] = useState(false); return <CustomerVisitReminderCard {...args} state={done ? 'published' : 'draft'} onPublish={async value => { await args.onPublish(value); setDone(true); }}/>; },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Publish workflow' }));
    await expect(args.onPublish).toHaveBeenCalledWith(args.value); await expect(c.getByText('Workflow published.')).toBeVisible();
  },
};
export const ChangeTime: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); const field = c.getByLabelText('Send at');
  await userEvent.clear(field); await userEvent.type(field, '08:30');
  await userEvent.click(c.getByRole('button', { name: 'Publish workflow' }));
  await expect(args.onPublish).toHaveBeenCalledWith({ ...args.value, localTime: '08:30' });
} };
export const EditPaused: Story = { args: { editing: true, paused: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByText('This workflow stays paused after saving.')).toBeVisible();
  await expect(c.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: 'Change settings' }));
  const name = c.getByLabelText('Workflow name'); await expect(name).toHaveFocus(); await userEvent.clear(name); await userEvent.type(name, 'Customer arrival reminder');
  await userEvent.click(c.getByRole('button', { name: 'Back to review' })); await expect(c.getByRole('heading')).toHaveFocus();
  await userEvent.click(c.getByRole('button', { name: 'Save changes' }));
  await expect(args.onPublish).toHaveBeenCalledWith({ ...args.value, name: 'Customer arrival reminder' });
} };
export const MissingSender: Story = { args: { senderReady: false }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
  await expect(c.getByRole('link', { name: 'Open email settings' })).toHaveAttribute('href', '#email-settings'); await expect(args.onPublish).not.toHaveBeenCalled();
} };
export const MissingCompanyContact: Story = { ...MissingSender, args: { company: { name: 'Example Home Services', phone: '', email: '' } } };
export const MissingArrivalWindow: Story = { args: { sample: { ...meta.args.sample, arrivalWindow: null } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByText('Preview customer email'));
  await expect(c.getByRole('status')).toHaveTextContent('Arrival window is missing. No email will be sent for this visit. You’ll be notified to update it.');
  await expect(c.queryByRole('article')).not.toBeInTheDocument();
  await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeEnabled();
} };
export const MissingCustomerContact: Story = { args: { sample: { ...meta.args.sample, email: null } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByText('Preview customer email'));
  await expect(c.getByRole('status')).toHaveTextContent('Customer contact is missing. No email will be sent for this visit. You’ll be notified to update it.');
} };
export const MissingTime: Story = { args: { value: { ...meta.args.value, localTime: '' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent('Choose a valid send time.'); await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
} };
export const ReadOnly: Story = { args: { canPublish: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByLabelText('Send at')).toBeDisabled(); await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
} };
export const SaveError: Story = { args: { onPublish: fn<CustomerVisitReminderCardProps['onPublish']>(async () => { throw Error('Fictional failure'); }) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Publish workflow' })); await expect(await c.findByRole('alert')).toHaveTextContent('The workflow could not be saved. Your choices are still here.'); await expect(c.getByLabelText('Send at')).toHaveValue('09:00');
} };
export const Pending: Story = { args: { onPublish: fn<CustomerVisitReminderCardProps['onPublish']>(async () => new Promise<void>(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Publish workflow' }));
  await expect(c.getByRole('button', { name: 'Saving…' })).toBeDisabled(); await expect(c.getByRole('button', { name: 'Cancel' })).toBeDisabled(); await expect(c.getByLabelText('Send at')).toBeDisabled(); await expect(args.onPublish).toHaveBeenCalledTimes(1);
} };
export const Cancel: Story = { play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Cancel' })); await expect(args.onCancel).toHaveBeenCalledOnce(); await expect(args.onPublish).not.toHaveBeenCalled();
} };
export const Expired: Story = { args: { state: 'expired' } };
export const Published: Story = { args: { state: 'published' } };
export const Cancelled: Story = { args: { state: 'cancelled' } };
export const Mobile: Story = { ...EmailPreview, globals: { viewport: { value: 'phone', isRotated: false } } };
