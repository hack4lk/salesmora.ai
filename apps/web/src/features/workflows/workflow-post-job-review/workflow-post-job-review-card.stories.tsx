import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AssistantPanel } from '@salesmora/ui';
import { PostJobReviewCard, type PostJobReviewCardProps } from './workflow-post-job-review-card';

const defaultMessage = 'Thank you for choosing us. We appreciate the opportunity to help.';
const meta = {
  title: 'Workflows/Post-job thank-you', component: PostJobReviewCard, parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="min-h-screen bg-assistant-panel p-4 text-assistant-foreground sm:p-8"><div className="mx-auto max-w-2xl"><Story/></div></main>],
  args: {
    value: { name: 'Post-job thank-you', calendarDays: 2, localTime: '09:00', reviewUrl: '', messageChoice: null, thankYouMessage: '' },
    defaultMessage, company: { name: 'Evergreen Home Services', phone: '(555) 010-1234', email: 'hello@example.test' },
    customer: { name: 'Taylor', email: 'taylor@example.test' }, timezone: 'America/New_York', senderReady: true,
    emailSettingsHref: '/settings/business', canPublish: true,
    onPublish: fn<PostJobReviewCardProps['onPublish']>(async () => {}), onCancel: fn<PostJobReviewCardProps['onCancel']>(async () => {}),
  },
} satisfies Meta<typeof PostJobReviewCard>;
export default meta;
type Story = StoryObj<typeof meta>;
const selected = { ...meta.args.value, messageChoice: 'default' as const, thankYouMessage: defaultMessage };
export const ChooseMessage: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('group', { name: 'What should your thank-you email say?' })).toBeVisible();
  await expect(c.getByLabelText('Use default message')).not.toBeChecked();
  await expect(c.getByLabelText('Write my own')).not.toBeChecked();
  await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
  await expect(args.onPublish).not.toHaveBeenCalled();
} };
export const PublishDefault: Story = {
  render: function Render(args) { const [done, setDone] = useState(false); return <PostJobReviewCard {...args} state={done ? 'published' : 'draft'} onPublish={async value => { await args.onPublish(value); setDone(true); }}/>; },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement); await userEvent.click(c.getByLabelText('Use default message'));
    await userEvent.click(c.getByRole('button', { name: 'Publish workflow' }));
    await expect(args.onPublish).toHaveBeenCalledWith(selected); await expect(c.getByText('Workflow published.')).toBeVisible();
  },
};
export const CustomMessage: Story = { args: { value: { ...meta.args.value, reviewUrl: 'https://example.test/review' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByLabelText('Write my own'));
  const text = c.getByLabelText('Thank-you message'); await expect(text).toHaveFocus();
  await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
  await userEvent.type(text, 'Thanks for trusting our team.\nWe appreciate your business!');
  await userEvent.click(c.getByText('Preview customer email'));
  const preview = within(c.getByRole('article', { name: 'Customer thank-you email' }));
  await expect(preview.getByText(/Thanks for trusting our team/)).toBeVisible();
  await expect(preview.getByRole('link', { name: 'Leave a review' })).toHaveAttribute('href', args.value.reviewUrl);
  await expect(preview.getByText(/call \(555\) 010-1234 or email/)).toBeVisible();
  await userEvent.click(c.getByLabelText('Use default message')); await expect(preview.getByText(defaultMessage)).toBeVisible();
  await userEvent.click(c.getByLabelText('Write my own')); await expect(c.getByLabelText('Thank-you message')).toHaveValue('Thanks for trusting our team.\nWe appreciate your business!');
  await userEvent.click(c.getByRole('button', { name: 'Publish workflow' }));
  await expect(args.onPublish).toHaveBeenCalledWith({ ...args.value, messageChoice: 'custom', thankYouMessage: 'Thanks for trusting our team.\nWe appreciate your business!' });
} };
export const BrandedPreview: Story = { args: { value: { ...selected, reviewUrl: 'https://example.test/review' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByText('Preview customer email'));
  await expect(c.getByRole('img', { name: 'SalesMora' })).toBeVisible();
  await expect(c.getByRole('article')).toHaveTextContent(defaultMessage);
} };
export const ThankYouOnly: Story = { ...BrandedPreview, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByText('Preview customer email')); await userEvent.click(c.getByLabelText('Thank-you only'));
  await expect(c.queryByRole('link', { name: 'Leave a review' })).not.toBeInTheDocument();
  await expect(c.queryByText('We’d love to hear about your experience.')).not.toBeInTheDocument();
  await expect(c.getByRole('article')).toHaveTextContent(defaultMessage);
  await expect(args.onPublish).not.toHaveBeenCalled();
} };
export const EditPaused: Story = { args: { value: selected, editing: true, paused: true, defaultMessage: 'New default must not replace approved wording.' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByText('This workflow stays paused after saving.')).toBeVisible();
  await expect(c.getByRole('button', { name: 'Save changes' })).toBeDisabled(); await expect(c.getByText(defaultMessage)).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: 'Change settings' })); await expect(c.getByLabelText('Workflow name')).toHaveFocus();
  await userEvent.clear(c.getByLabelText('Calendar days after completion')); await userEvent.type(c.getByLabelText('Calendar days after completion'), '5');
  await userEvent.click(c.getByRole('button', { name: 'Save changes' })); await expect(args.onPublish).toHaveBeenCalledWith({ ...selected, calendarDays: 5 });
} };
export const EditCustom: Story = { args: { value: { ...selected, messageChoice: 'custom', thankYouMessage: 'Our team appreciates your business.' }, editing: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByLabelText('Thank-you message')).toHaveValue(args.value.thankYouMessage);
  await userEvent.type(c.getByLabelText('Thank-you message'), ' Thank you!'); await userEvent.click(c.getByRole('button', { name: 'Save changes' }));
  await expect(args.onPublish).toHaveBeenCalledWith({ ...args.value, thankYouMessage: args.value.thankYouMessage + ' Thank you!' });
} };
export const InvalidLink: Story = { args: { value: { ...selected, reviewUrl: 'http://example.test/review' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent('Add a valid HTTPS review link without a username or password.');
  await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeDisabled(); await userEvent.click(c.getByText('Preview customer email'));
  await expect(c.queryByRole('link', { name: 'Leave a review' })).not.toBeInTheDocument();
} };
export const NoReviewLink: Story = { args: { value: selected }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByText('Preview customer email'));
  await expect(c.queryByRole('alert')).not.toBeInTheDocument();
  await expect(c.queryByRole('group', { name: 'Email preview version' })).not.toBeInTheDocument();
  await expect(c.queryByRole('link', { name: 'Leave a review' })).not.toBeInTheDocument();
  await expect(c.queryByText('We’d love to hear about your experience.')).not.toBeInTheDocument();
  await expect(c.getByRole('article')).toHaveTextContent(defaultMessage);
  await userEvent.click(c.getByRole('button', { name: 'Publish workflow' })); await expect(args.onPublish).toHaveBeenCalledWith(selected);
} };
export const AddAndRemoveLink: Story = { args: { value: selected }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByText('Preview customer email'));
  const link = c.getByLabelText('External review link (optional)');
  await userEvent.type(link, 'https://example.test/review');
  await expect(c.getByRole('link', { name: 'Leave a review' })).toHaveAttribute('href', 'https://example.test/review');
  await userEvent.clear(link);
  await expect(c.queryByRole('link', { name: 'Leave a review' })).not.toBeInTheDocument();
  await expect(c.queryByText('We’d love to hear about your experience.')).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: 'Publish workflow' })); await expect(args.onPublish).toHaveBeenCalledWith(selected);
} };
export const CredentialsInLink: Story = { ...InvalidLink, args: { value: { ...selected, reviewUrl: 'https://user:secret@example.test/review' } } };
export const InvalidDelay: Story = { args: { value: { ...selected, calendarDays: 31 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent('Choose a delay of 1–30 calendar days.'); await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
} };
export const InvalidTime: Story = { args: { value: { ...selected, localTime: '' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent('Choose a valid send time.'); await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
} };
export const BlankCustom: Story = { args: { value: { ...selected, messageChoice: 'custom', thankYouMessage: '   ' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent('Enter a thank-you message of 1–2,000 characters.'); await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
} };
export const MissingSender: Story = { args: { value: selected, senderReady: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('link', { name: 'Open email settings' })).toHaveAttribute('href', '/settings/business'); await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
} };
export const MissingCompanyContact: Story = { ...MissingSender, args: { value: selected, company: { ...meta.args.company, phone: '' } } };
export const SetupWithoutPermission: Story = { args: { value: selected, company: { ...meta.args.company, phone: '' }, companySetupAccess: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.queryByRole('link', { name: 'Open email settings' })).not.toBeInTheDocument(); await expect(c.getByText(/Ask a workspace administrator to update/)).toBeVisible();
} };
export const MissingCustomer: Story = { args: { value: selected, customer: { name: 'Taylor', email: '' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByText('Preview customer email'));
  await expect(c.getByText(/Customer contact is missing/)).toBeVisible(); await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeEnabled();
} };
export const ReadOnly: Story = { args: { value: selected, canPublish: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByLabelText('Write my own')).toBeDisabled(); await expect(c.getByLabelText('External review link (optional)')).toBeDisabled(); await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
} };
export const SaveError: Story = { args: { value: { ...selected, messageChoice: 'custom', thankYouMessage: 'Thank you from our team.' }, onPublish: fn<PostJobReviewCardProps['onPublish']>(async () => { throw Error('Synthetic failure'); }) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Publish workflow' })); await expect(await c.findByRole('alert')).toHaveTextContent('Your choices are still here.'); await expect(c.getByLabelText('Thank-you message')).toHaveValue(args.value.thankYouMessage);
} };
export const Pending: Story = { args: { value: selected, onPublish: fn<PostJobReviewCardProps['onPublish']>(async () => new Promise<void>(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Publish workflow' })); await expect(c.getByRole('button', { name: 'Saving…' })).toBeDisabled(); await expect(c.getByLabelText('Write my own')).toBeDisabled(); await expect(c.getByRole('button', { name: 'Cancel' })).toBeDisabled(); await expect(args.onPublish).toHaveBeenCalledOnce();
} };
export const Cancel: Story = { play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Cancel' })); await expect(args.onCancel).toHaveBeenCalledOnce(); await expect(args.onPublish).not.toHaveBeenCalled();
} };
export const Expired: Story = { args: { state: 'expired', value: selected }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText('This draft expired. Ask for a fresh review.')).toBeVisible(); await expect(c.getByLabelText('Write my own')).toBeDisabled(); await expect(c.queryByRole('button', { name: 'Publish workflow' })).not.toBeInTheDocument();
} };
export const Published: Story = { args: { state: 'published', value: selected } };
export const Cancelled: Story = { args: { state: 'cancelled' } };
export const Mobile: Story = { args: { value: { ...selected, messageChoice: 'custom', thankYouMessage: 'Thanks for trusting our team.\nWe appreciate your business!' } }, globals: { viewport: { value: 'phone', isRotated: false } }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); await userEvent.click(c.getByText('Preview customer email')); await expect(c.getByRole('article')).toHaveTextContent(args.value.thankYouMessage.replace('\n', ' ')); } };
export const AssistantConversation: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(true);
    return <AssistantPanel title="Create a workflow" description="Post-job thank-you" onNewConversation={fn()} open={open} onOpenChange={setOpen} onSend={async () => ({ ok: true })} composerPlaceholder="Describe your thank-you message…"
      messages={[{ id: 'request', role: 'user', text: 'Send customers a thank-you two days after we finish their job.' }, { id: 'review', role: 'assistant', text: 'What would you like the email to say? Use the suggested thank-you below, write your own, or tell me how to revise it.' }]}
      renderMessageSupplement={message => message.id === 'review' ? <PostJobReviewCard {...args}/> : null}/>;
  },
};
