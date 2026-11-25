import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { WorkflowAnnualServiceCard, type AnnualServiceCardProps } from './workflow-annual-service-card';
import { WorkflowAutomationGuide } from '../workflow-automation-guide';
import { annualRecipients, annualRule, annualServices } from './annual-service-review.fixtures';
const meta = { title: 'Workflows/Annual service review', component: WorkflowAnnualServiceCard, parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="min-h-screen bg-assistant-panel p-4 text-assistant-foreground sm:p-8"><div className="mx-auto max-w-2xl"><Story/></div></main>],
  args: { value: annualRule, services: annualServices, recipients: annualRecipients, timezone: 'America/New_York', clock: { date: '2026-11-24', time: '10:00' }, canPublish: true,
    onPublish: fn<AnnualServiceCardProps['onPublish']>(async () => {}), onCancel: fn() },
} satisfies Meta<typeof WorkflowAnnualServiceCard>;
export default meta; type Story = StoryObj<typeof meta>;
export const Review: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText('Repeats every March 15. America/New_York')).toBeVisible();
  await expect(c.queryByRole('button', { name: /test/i })).not.toBeInTheDocument();
} };
export const Publish: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByLabelText('In-app')).toBeChecked(); await expect(c.getByLabelText('Email')).toBeChecked();
  await userEvent.click(c.getByRole('button', { name: 'Publish workflow' })); await expect(args.onPublish).toHaveBeenCalledWith(args.value);
} };
export const ChooseCustomDate: Story = { args: { value: { ...annualRule, firstReviewDate: '' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
  await expect(c.getByLabelText('First review date')).toHaveValue('');
  await userEvent.type(c.getByLabelText('First review date'), '2027-07-20');
  await expect(c.getByText('Repeats every July 20. America/New_York')).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: 'Publish workflow' })); await expect(args.onPublish).toHaveBeenCalledWith(expect.objectContaining({ firstReviewDate: '2027-07-20' }));
} };
export const ChangeServiceAndRecipient: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Change settings' }));
  await userEvent.selectOptions(c.getByLabelText('Service'), 'roofing'); await userEvent.selectOptions(c.getByLabelText('Notify'), 'alex');
  await userEvent.click(c.getByRole('button', { name: 'Back to review' }));
  await userEvent.click(c.getByRole('button', { name: 'Publish workflow' })); await expect(args.onPublish).toHaveBeenCalledWith(expect.objectContaining({ serviceId: 'roofing', recipientId: 'alex', firstReviewDate: annualRule.firstReviewDate }));
} };
export const PastDate: Story = { args: { value: { ...annualRule, firstReviewDate: '2026-11-23' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent('Choose a future review date and time.'); await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
} };
export const TodayAfterTime: Story = { ...PastDate, args: { value: { ...annualRule, firstReviewDate: '2026-11-24', localTime: '09:00' } } };
export const TodayBeforeTime: Story = { args: { value: { ...annualRule, firstReviewDate: '2026-11-24', localTime: '11:00' } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: 'Publish workflow' })).toBeEnabled();
} };
export const LeapDay: Story = { args: { value: { ...annualRule, firstReviewDate: '2028-02-29' } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText('Repeats every February 29, in leap years only. America/New_York')).toBeVisible();
} };
export const InvalidDate: Story = { args: { value: { ...annualRule, firstReviewDate: '2027-02-29' } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
} };
export const NoChannels: Story = { args: { value: { ...annualRule, notifications: { inApp: false, email: false } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
} };
export const EmailOnly: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByLabelText('In-app')); await userEvent.click(c.getByRole('button', { name: 'Publish workflow' }));
  await expect(args.onPublish).toHaveBeenCalledWith(expect.objectContaining({ notifications: { inApp: false, email: true } }));
} };
export const EditPaused: Story = { args: { editing: true, paused: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText('This workflow stays paused after saving.')).toBeVisible(); await expect(c.getByRole('button', { name: 'Save changes' })).toBeEnabled();
} };
export const ReadOnly: Story = { args: { canPublish: false } };
export const Published: Story = { args: { state: 'published' } };
export const Expired: Story = { args: { state: 'expired' } };
export const Cancel: Story = { play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Cancel' })); await expect(args.onCancel).toHaveBeenCalledOnce(); await expect(args.onPublish).not.toHaveBeenCalled();
} };
export const SaveError: Story = { args: { onPublish: fn<AnnualServiceCardProps['onPublish']>(async () => { throw Error('Fictional failure'); }) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Publish workflow' })); await expect(await c.findByRole('alert')).toHaveTextContent('Your choices are still here.'); await expect(c.getByLabelText('First review date')).toHaveValue(annualRule.firstReviewDate);
} };
export const Pending: Story = { args: { onPublish: fn<AnnualServiceCardProps['onPublish']>(async () => new Promise<void>(() => {})) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Publish workflow' })); await expect(c.getByRole('button', { name: 'Saving…' })).toBeDisabled(); await expect(c.getByRole('button', { name: 'Cancel' })).toBeDisabled();
} };
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };

export const AutomationGuide: Story = {
  render: args => <WorkflowAutomationGuide examples={[{ id: 'annual-service', name: 'Review customers on a chosen date', prompt: 'Every March 15 at 9 AM, remind me to review gutter-cleaning customers.' }]} limitation="Choose a service and date. This reminds your team; customer emails require a separate review."><div className="p-4"><WorkflowAnnualServiceCard {...args}/></div></WorkflowAutomationGuide>,
  play: async ({ canvasElement }) => { const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'What can I automate?' })); await expect(c.getByText('Review customers on a chosen date')).toBeVisible(); },
};
