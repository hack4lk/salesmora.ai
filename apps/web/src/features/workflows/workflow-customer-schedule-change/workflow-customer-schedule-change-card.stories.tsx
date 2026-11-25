import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AssistantPanel } from '@salesmora/ui';
import { CustomerScheduleChangeCard, type ScheduleChangeCardProps } from './workflow-customer-schedule-change-card';
import { scheduleChangeExamples } from './customer-schedule-change.fixtures';
const meta = {
  title: 'Workflows/Customer schedule changes', component: CustomerScheduleChangeCard, parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="min-h-screen bg-assistant-panel p-4 text-assistant-foreground sm:p-8"><div className="mx-auto max-w-2xl"><Story/></div></main>],
  args: {
    value: { name: 'Customer schedule-change notices' }, timezone: 'America/New_York', examples: scheduleChangeExamples,
    company: { name: 'Example Home Services', phone: '(555) 010-1234', email: 'office@example.test' }, senderReady: true,
    emailSettingsHref: '/settings/work-orders?workspace=example', canPublish: true,
    onPublish: fn<ScheduleChangeCardProps['onPublish']>(async () => {}), onCancel: fn<ScheduleChangeCardProps['onCancel']>(async () => {}),
  },
} satisfies Meta<typeof CustomerScheduleChangeCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Review: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByText('5 minutes after the latest change')).toBeVisible();
  await expect(c.getByText(/within 15 minutes of the first change/)).toBeVisible();
  await expect(c.queryByLabelText('Send at')).not.toBeInTheDocument();
  await expect(c.queryByRole('checkbox', { name: 'In-app' })).not.toBeInTheDocument();
  await expect(args.onPublish).not.toHaveBeenCalled();
} };
export const Publish: Story = {
  render: function Render(args) { const [done, setDone] = useState(false); return <CustomerScheduleChangeCard {...args} state={done ? 'published' : 'draft'} onPublish={async value => { await args.onPublish(value); setDone(true); }}/>; },
  play: async ({ canvasElement, args }) => { const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Publish workflow' })); await expect(args.onPublish).toHaveBeenCalledWith(args.value); await expect(c.getByText('Workflow published.')).toBeVisible(); },
};
export const DateChanged: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByText('Preview customer email'));
  const email = within(c.getByRole('article', { name: 'Customer schedule-change email' }));
  await expect(email.getByRole('img', { name: 'SalesMora' })).toBeVisible();
  await expect(email.getByText('Previously')).toBeVisible(); await expect(email.getByText('Now')).toBeVisible();
  await expect(email.getByText(/Friday, November 27, 2026/)).toBeVisible(); await expect(email.getByText(/Monday, November 30, 2026/)).toBeVisible();
  await expect(email.getByText(/call \(555\) 010-1234 or email/)).toBeVisible();
  await expect(email.getByText('Stop schedule-change emails')).toBeVisible();
  await expect(email.queryByRole('link')).not.toBeInTheDocument();
} };
export const WindowChanged: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByText('Preview customer email')); await userEvent.selectOptions(c.getByLabelText('Preview example'), '1');
  const email = within(c.getByRole('article')); await expect(email.getAllByText(/Friday, November 27, 2026/)).toHaveLength(2);
  await expect(email.getByText(/9 AM – 11 AM/)).toBeVisible(); await expect(email.getByText(/1 PM – 3 PM/)).toBeVisible();
} };
export const RemovedSchedule: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByText('Preview customer email')); await userEvent.selectOptions(c.getByLabelText('Preview example'), '2');
  const email = within(c.getByRole('article')); await expect(email.getByRole('heading', { name: 'Your visit is no longer scheduled' })).toBeVisible();
  await expect(email.getByText(/previously scheduled for/)).toHaveTextContent('Friday, November 27, 2026');
  await expect(email.getByText(/For help confirming a new date/)).toBeVisible();
  await expect(email.queryByText('Now')).not.toBeInTheDocument(); await expect(email.queryByText(/job.*cancel/i)).not.toBeInTheDocument();
} };
export const WindowToBeConfirmed: Story = { args: { examples: [{ ...scheduleChangeExamples[0], after: { ...scheduleChangeExamples[0].after!, arrivalWindow: null } }, scheduleChangeExamples[1], scheduleChangeExamples[2]] }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByText('Preview customer email')); await expect(c.getByRole('article')).toHaveTextContent('Arrival window to be confirmed'); await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeEnabled();
} };
export const OriginalScheduleRestored: Story = { args: { examples: [{ ...scheduleChangeExamples[0], after: scheduleChangeExamples[0].before }, scheduleChangeExamples[1], scheduleChangeExamples[2]] }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByText('Preview customer email')); await expect(c.getByText('The visit returned to its original schedule before delivery. No email will be sent.')).toBeVisible(); await expect(c.queryByRole('article')).not.toBeInTheDocument();
} };
export const MissingCustomer: Story = { args: { examples: [{ ...scheduleChangeExamples[0], customer: { name: 'Taylor', email: '' } }, scheduleChangeExamples[1], scheduleChangeExamples[2]] }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByText('Preview customer email')); await expect(c.getByText(/Customer contact is missing/)).toBeVisible(); await expect(c.queryByRole('article')).not.toBeInTheDocument(); await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeEnabled();
} };
export const MissingSender: Story = { args: { senderReady: false }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('link', { name: 'Open email settings' })).toHaveAttribute('href', args.emailSettingsHref); await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
} };
export const MissingCompanyContact: Story = { ...MissingSender, args: { company: { ...meta.args.company, phone: '' } } };
export const InvalidCompanyEmail: Story = { ...MissingSender, args: { company: { ...meta.args.company, email: 'not-an-email' } } };
export const SetupWithoutPermission: Story = { args: { company: { ...meta.args.company, email: '' }, companySetupAccess: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.queryByRole('link', { name: 'Open email settings' })).not.toBeInTheDocument(); await expect(c.getByText(/Ask a workspace administrator to update/)).toBeVisible();
} };
export const EditPaused: Story = { args: { editing: true, paused: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByText('This workflow stays paused after saving.')).toBeVisible(); await expect(c.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: 'Change settings' })); const name = c.getByLabelText('Workflow name'); await expect(name).toHaveFocus(); await userEvent.clear(name); await userEvent.type(name, 'Visit updates for customers');
  await userEvent.click(c.getByRole('button', { name: 'Back to review' })); await expect(c.getByRole('heading', { level: 3 })).toHaveFocus(); await userEvent.click(c.getByRole('button', { name: 'Save changes' })); await expect(args.onPublish).toHaveBeenCalledWith({ name: 'Visit updates for customers' });
} };
export const InvalidName: Story = { args: { value: { name: ' ' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent('Enter a workflow name of 1–120 characters.'); await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
} };
export const ReadOnly: Story = { args: { canPublish: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('button', { name: 'Change settings' })).toBeDisabled(); await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeDisabled(); await userEvent.click(c.getByText('Preview customer email')); await expect(c.getByRole('article')).toBeVisible();
} };
export const SaveError: Story = { args: { onPublish: fn<ScheduleChangeCardProps['onPublish']>(async () => { throw Error('Synthetic failure'); }) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Change settings' })); await userEvent.clear(c.getByLabelText('Workflow name')); await userEvent.type(c.getByLabelText('Workflow name'), 'Retained title'); await userEvent.click(c.getByRole('button', { name: 'Publish workflow' })); await expect(await c.findByRole('alert')).toHaveTextContent('Your choices are still here.'); await expect(c.getByLabelText('Workflow name')).toHaveValue('Retained title'); await expect(args.onPublish).toHaveBeenCalledOnce();
} };
export const Pending: Story = { args: { onPublish: fn<ScheduleChangeCardProps['onPublish']>(async () => new Promise<void>(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Publish workflow' })); await expect(c.getByRole('button', { name: 'Saving…' })).toBeDisabled(); await expect(c.getByRole('button', { name: 'Cancel' })).toBeDisabled(); await expect(args.onPublish).toHaveBeenCalledOnce();
} };
export const Cancel: Story = { play: async ({ canvasElement, args }) => { await userEvent.click(within(canvasElement).getByRole('button', { name: 'Cancel' })); await expect(args.onCancel).toHaveBeenCalledOnce(); await expect(args.onPublish).not.toHaveBeenCalled(); } };
export const Expired: Story = { args: { expiresAt: '2020-01-01T00:00:00Z' }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByText('This draft expired. Ask for a fresh review.')).toBeVisible(); await expect(c.queryByRole('button', { name: 'Publish workflow' })).not.toBeInTheDocument(); } };
export const Published: Story = { args: { state: 'published' } };
export const Cancelled: Story = { args: { state: 'cancelled' } };
export const Mobile: Story = { ...DateChanged, globals: { viewport: { value: 'phone', isRotated: false } } };
export const AssistantConversation: Story = {
  render: function Render(args) { const [open, setOpen] = useState(true); return <AssistantPanel title="Create a workflow" description="Customer schedule-change notices" onNewConversation={fn()} open={open} onOpenChange={setOpen} onSend={async () => ({ ok: true })} composerPlaceholder="Describe a workflow…"
    messages={[{ id: 'request', role: 'user', text: 'Automatically email customers when their visit date or arrival window changes, or their visit is no longer scheduled.' }, { id: 'review', role: 'assistant', text: 'Quick corrections will combine into one notice after five minutes. Review the customer emails, then publish when you’re ready.' }]}
    renderMessageSupplement={message => message.id === 'review' ? <CustomerScheduleChangeCard {...args}/> : null}/>; },
};
