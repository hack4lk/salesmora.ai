import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { DeadlineReminderSettings, type DeadlineReminderSettingsProps, type DeadlineReminderValues } from './deadline-reminder-settings';
import { deadlineReminderSettingsData as copy } from './deadline-reminder-settings.data';
const fixed: DeadlineReminderValues = { sendTime: copy.stories.time, offsets: [{ id: 'due', relative: 'on', days: 0 }], extraRecipientIds: [] };
const premium: DeadlineReminderValues = { ...fixed, offsets: [{ id: 'before', relative: 'before', days: 3 }, ...fixed.offsets, { id: 'after', relative: 'after', days: 1 }], extraRecipientIds: ['alex'] };
const members = [{ id: 'alex', name: copy.stories.alex }, { id: 'sam', name: copy.stories.sam }, { id: 'jamie', name: copy.stories.jamie }];
function Preview(args: DeadlineReminderSettingsProps) {
  const [values, setValues] = useState(args.values), [saved, setSaved] = useState(args.savedValues);
  return <DeadlineReminderSettings {...args} values={values} savedValues={saved} onChange={next => { args.onChange(next); setValues(next); }}
    onDiscard={() => { args.onDiscard(); setValues(saved); }} onSave={async next => { await args.onSave(next); const { revision: _revision, ...result } = next; void _revision; setSaved(result); }}/>
}
const meta = { title: 'Settings/DeadlineReminderSettings', component: DeadlineReminderSettings, render: args => <Preview {...args}/>,
  args: { plan: 'standard', timezone: copy.stories.timezone, revision: 'preview-v1', canManage: true, values: fixed, savedValues: fixed, members, onChange: fn(), onDiscard: fn(), onReload: fn(), onSave: fn() },
  decorators: [Story => <main className="mx-auto grid min-h-screen w-full max-w-4xl content-start gap-6 p-4 sm:p-8"><p className="m-0 text-sm leading-6 text-muted">{copy.stories.notice}</p><Story/></main>], parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DeadlineReminderSettings>;
export default meta; type Story = StoryObj<typeof meta>;
const body = (element: HTMLElement) => within(element.ownerDocument.body);
async function openReview(element: HTMLElement) { await userEvent.click(body(element).getByRole('button', { name: copy.review })); }
export const Default: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByLabelText(copy.sendTime)).toHaveValue(copy.stories.time); await expect(c.queryByRole('button', { name: copy.add })).not.toBeInTheDocument(); await expect(c.getByRole('button', { name: copy.review })).toBeDisabled();
} };
export const Free: Story = { args: { plan: 'free' } };
export const Premium: Story = { args: { plan: 'premium', values: premium, savedValues: premium } };
export const Review: Story = { args: { plan: 'premium', values: { ...premium, sendTime: copy.stories.nextTime }, savedValues: premium }, play: async ({ canvasElement, args }) => {
  await openReview(canvasElement); await waitFor(() => expect(body(canvasElement).getByLabelText(copy.summary)).toHaveFocus()); await expect(args.onSave).not.toHaveBeenCalled();
} };
export const ConfirmSave: Story = { args: { plan: 'premium', values: { ...premium, sendTime: copy.stories.nextTime }, savedValues: premium }, play: async ({ canvasElement, args }) => {
  await openReview(canvasElement); await userEvent.click(body(canvasElement).getByRole('button', { name: copy.confirm }));
  await expect(args.onSave).toHaveBeenCalledOnce(); await expect(args.onSave).toHaveBeenCalledWith({ ...premium, sendTime: copy.stories.nextTime, revision: 'preview-v1' });
  await waitFor(() => expect(body(canvasElement).getByRole('button', { name: copy.review })).toBeDisabled());
} };
export const ChangeFreeTime: Story = { args: { plan: 'free' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.clear(c.getByLabelText(copy.sendTime)); await userEvent.type(c.getByLabelText(copy.sendTime), copy.stories.nextTime);
  await openReview(canvasElement); await userEvent.click(body(canvasElement).getByRole('button', { name: copy.confirm }));
  await expect(args.onSave).toHaveBeenCalledWith({ ...fixed, sendTime: copy.stories.nextTime, revision: 'preview-v1' });
} };
export const AddAndRemove: Story = { args: { plan: 'premium' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.add })); await expect(c.getAllByRole('combobox')).toHaveLength(2);
  await userEvent.click(c.getByRole('button', { name: `${copy.remove} 2` })); await expect(c.getAllByRole('combobox')).toHaveLength(1); await expect(args.onSave).not.toHaveBeenCalled();
} };
export const MaximumRules: Story = { args: { plan: 'premium', values: { ...fixed, offsets: [...premium.offsets, { id: 'before-one', relative: 'before', days: 1 }, { id: 'after-three', relative: 'after', days: 3 }] } }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('button', { name: copy.add })).toBeDisabled(); } };
export const DuplicateTiming: Story = { args: { plan: 'premium', values: { ...fixed, offsets: [...fixed.offsets, { id: 'duplicate', relative: 'on', days: 0 }] } }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('button', { name: copy.review })).toBeDisabled(); await expect(within(canvasElement).getByRole('alert')).toHaveTextContent(copy.invalid); } };
export const InvalidOffset: Story = { args: { plan: 'premium', values: { ...fixed, offsets: [{ id: 'invalid', relative: 'before', days: 366 }] } } };
export const NoRules: Story = { args: { plan: 'premium', values: { ...fixed, offsets: [] } } };
export const InvalidTime: Story = { args: { values: { ...fixed, sendTime: '' } } };
export const ExtraRecipients: Story = { args: { plan: 'premium', values: premium, savedValues: premium }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('checkbox', { name: copy.stories.sam })); await openReview(canvasElement);
  await expect(body(canvasElement).getByLabelText(copy.summary)).toHaveTextContent(copy.stories.sam); await expect(body(canvasElement).getByLabelText(copy.summary)).toHaveTextContent(copy.defaultRecipients);
} };
export const UnavailableTeammate: Story = { args: { plan: 'premium', values: { ...premium, extraRecipientIds: ['removed'] } } };
export const NoAdditionalTeammates: Story = { args: { plan: 'premium', members: [] } };
export const ReadOnly: Story = { args: { plan: 'premium', values: premium, savedValues: premium, canManage: false }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByLabelText(copy.sendTime)).toBeDisabled(); await expect(c.getByRole('button', { name: copy.review })).toBeDisabled(); await expect(args.onSave).not.toHaveBeenCalled();
} };
export const DowngradedPlan: Story = { args: { plan: 'standard', values: premium, savedValues: fixed } };
export const Saving: Story = { args: { plan: 'premium', values: premium, pending: true } };
export const SaveError: Story = { args: { values: { ...fixed, sendTime: copy.stories.nextTime }, onSave: fn(async () => { throw new Error(copy.saveError); }), error: copy.saveError }, play: async ({ canvasElement }) => {
  await openReview(canvasElement); await userEvent.click(body(canvasElement).getByRole('button', { name: copy.confirm })); await expect(body(canvasElement).getByRole('dialog')).toBeInTheDocument();
} };
export const Conflict: Story = { args: { values: { ...fixed, sendTime: copy.stories.nextTime }, conflict: true }, play: async ({ canvasElement, args }) => { await userEvent.click(within(canvasElement).getByRole('button', { name: copy.reload })); await expect(args.onReload).toHaveBeenCalledOnce(); } };
export const Loading: Story = { args: { state: 'loading' } };
export const LoadError: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => { await userEvent.click(within(canvasElement).getByRole('button', { name: copy.reload })); await expect(args.onReload).toHaveBeenCalledOnce(); } };
export const Discard: Story = { args: { plan: 'premium', values: { ...premium, sendTime: copy.stories.nextTime }, savedValues: premium }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: copy.discard })); await expect(within(canvasElement).getByLabelText(copy.sendTime)).toHaveValue(premium.sendTime); await expect(args.onSave).not.toHaveBeenCalled();
} };
export const LongNames: Story = { args: { plan: 'premium', values: premium, savedValues: premium, members: [{ id: 'alex', name: copy.stories.longName }, ...members.slice(1)] } };
function RevisionPreview(args: DeadlineReminderSettingsProps) {
  const [revision, setRevision] = useState(args.revision);
  useEffect(() => { const change = () => setRevision('preview-v2'); window.addEventListener('reminder-preview-revision', change); return () => window.removeEventListener('reminder-preview-revision', change); }, []);
  return <Preview {...args} revision={revision}/>;
}
export const RevisionChanged: Story = { args: { values: { ...fixed, sendTime: copy.stories.nextTime } }, render: args => <RevisionPreview {...args}/>, play: async ({ canvasElement, args }) => {
  await openReview(canvasElement); canvasElement.ownerDocument.defaultView?.dispatchEvent(new Event('reminder-preview-revision'));
  await waitFor(() => expect(body(canvasElement).queryByRole('dialog')).not.toBeInTheDocument()); await expect(args.onSave).not.toHaveBeenCalled();
} };
export const Keyboard: Story = { args: { values: { ...fixed, sendTime: copy.stories.nextTime } }, play: async ({ canvasElement }) => {
  const button = within(canvasElement).getByRole('button', { name: copy.review }); button.focus(); await userEvent.keyboard('{Enter}');
  await waitFor(() => expect(body(canvasElement).getByLabelText(copy.summary)).toHaveFocus());
} };
function SavingReviewPreview(args: DeadlineReminderSettingsProps) {
  const [pending, setPending] = useState(false);
  return <DeadlineReminderSettings {...args} pending={pending} onSave={async next => { args.onSave(next); setPending(true); await new Promise<void>(() => {}); }}/>
}
export const SavingReview: Story = { args: { values: { ...fixed, sendTime: copy.stories.nextTime } }, render: args => <SavingReviewPreview {...args}/>, play: async ({ canvasElement, args }) => {
  await openReview(canvasElement); await userEvent.click(body(canvasElement).getByRole('button', { name: copy.confirm }));
  await waitFor(() => expect(body(canvasElement).getByRole('dialog')).toBeVisible());
  await expect(body(canvasElement).getByRole('button', { name: 'Close' })).toBeDisabled();
  await userEvent.keyboard('{Escape}'); await expect(body(canvasElement).getByRole('dialog')).toBeInTheDocument(); await expect(args.onSave).toHaveBeenCalledOnce();
} };
