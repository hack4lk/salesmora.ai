import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { JobNotificationSettingsPage, type JobNotificationSettingsPageProps } from './job-notification-settings-page';
import { jobNotificationSettingsPageData as copy } from './job-notification-settings-page.data';
import { defaultCompletionDeadlineData as deadlineCopy } from '../default-completion-deadline/default-completion-deadline.data';
import { deadlineReminderSettingsData as reminderCopy } from '../deadline-reminder-settings/deadline-reminder-settings.data';
import { defaultJobEventEmails, jobNotificationEventRows, jobNotificationEventsData as eventCopy } from '../job-notification-events/job-notification-events.data';
const fixed = { sendTime: copy.stories.time, offsets: [{ id: 'due', relative: 'on' as const, days: 0 }], extraRecipientIds: [] };
const premium = { ...fixed, offsets: [{ id: 'before', relative: 'before' as const, days: 3 }, ...fixed.offsets, { id: 'after', relative: 'after' as const, days: 1 }] };
const deadline: JobNotificationSettingsPageProps['deadline'] = { values: { mode: 'unset' }, savedValues: { mode: 'unset' }, revision: 'deadline-v1', exampleCreatedDate: copy.stories.date, onChange: fn(), onDiscard: fn(), onReload: fn(), onSave: fn() };
const reminders: JobNotificationSettingsPageProps['reminders'] = { values: premium, savedValues: premium, revision: 'reminders-v1', members: [{ id: 'alex', name: copy.stories.member }], onChange: fn(), onDiscard: fn(), onReload: fn(), onSave: fn() };
const events: JobNotificationSettingsPageProps['events'] = { values: defaultJobEventEmails, savedValues: defaultJobEventEmails, revision: 'events-v1', onChange: fn(), onDiscard: fn(), onReload: fn(), onSave: fn() };
function Preview(args: JobNotificationSettingsPageProps) {
  const [d, setD] = useState(args.deadline.values), [ds, setDs] = useState(args.deadline.savedValues);
  const [r, setR] = useState(args.reminders.values), [rs, setRs] = useState(args.reminders.savedValues);
  const [e, setE] = useState(args.events.values), [es, setEs] = useState(args.events.savedValues);
  return <JobNotificationSettingsPage {...args}
    deadline={{ ...args.deadline, values: d, savedValues: ds, onChange: v => { args.deadline.onChange(v); setD(v); }, onDiscard: () => { args.deadline.onDiscard(); setD(ds); }, onSave: async v => { await args.deadline.onSave(v); const { revision: _revision, ...value } = v; void _revision; setDs(value); } }}
    reminders={{ ...args.reminders, values: r, savedValues: rs, onChange: v => { args.reminders.onChange(v); setR(v); }, onDiscard: () => { args.reminders.onDiscard(); setR(rs); }, onSave: async v => { await args.reminders.onSave(v); const { revision: _revision, ...value } = v; void _revision; setRs(value); } }}
    events={{ ...args.events, values: e, savedValues: es, onChange: v => { args.events.onChange(v); setE(v); }, onDiscard: () => { args.events.onDiscard(); setE(es); }, onSave: async v => { await args.events.onSave(v); setEs(v.emails); } }}/>
}
const meta = { title: 'Settings/JobNotificationSettingsPage', component: JobNotificationSettingsPage, render: args => <Preview {...args}/>, args: {
  settingsHref: copy.stories.settingsHref, preferencesHref: copy.stories.preferencesHref, timezone: copy.stories.timezone, plan: 'premium', canManage: true, onRetry: fn(), deadline, reminders, events,
}, decorators: [Story => <main className="mx-auto grid min-h-screen w-full max-w-5xl content-start gap-6 p-4 sm:p-8"><p className="m-0 text-sm leading-6 text-muted">{copy.stories.notice}</p><Story/></main>], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof JobNotificationSettingsPage>;
export default meta; type Story = StoryObj<typeof meta>;
const region = (element: HTMLElement, name: string) => within(within(element).getByRole('region', { name }));
const body = (element: HTMLElement) => within(element.ownerDocument.body);
export const Default: Story = { play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('heading', { level: 1, name: copy.title })).toBeVisible(); for (const name of [deadlineCopy.title, reminderCopy.title, eventCopy.title]) await expect(c.getByRole('region', { name })).toBeInTheDocument(); await expect(c.getByRole('link', { name: copy.personalLink })).toHaveAttribute('href', copy.stories.preferencesHref); } };
export const Free: Story = { args: { plan: 'free', reminders: { ...reminders, values: fixed, savedValues: fixed } }, play: async ({ canvasElement }) => { await expect(within(canvasElement).queryByRole('button', { name: reminderCopy.add })).not.toBeInTheDocument(); for (const input of region(canvasElement, eventCopy.title).getAllByRole('checkbox')) await expect(input).toBeDisabled(); } };
export const Standard: Story = { args: { plan: 'standard', reminders: { ...reminders, values: fixed, savedValues: fixed } } };
export const RelativeDeadline: Story = { args: { deadline: { ...deadline, values: { mode: 'relative', count: 'business', days: copy.stories.defaultDays }, savedValues: { mode: 'relative', count: 'business', days: copy.stories.defaultDays } } } };
export const ReadOnly: Story = { args: { canManage: false }, play: async ({ canvasElement }) => { for (const button of within(canvasElement).getAllByRole('button', { name: deadlineCopy.review })) await expect(button).toBeDisabled(); for (const input of within(canvasElement).getAllByRole('checkbox')) await expect(input).toBeDisabled(); } };
export const Loading: Story = { args: { state: 'loading' }, play: async ({ canvasElement }) => { await expect(within(canvasElement).queryByRole('region')).not.toBeInTheDocument(); await expect(within(canvasElement).queryByRole('checkbox')).not.toBeInTheDocument(); } };
export const LoadError: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => { await userEvent.click(within(canvasElement).getByRole('button', { name: copy.retry })); await expect(args.onRetry).toHaveBeenCalledOnce(); } };
export const SectionConflict: Story = { args: { events: { ...events, conflict: true } }, play: async ({ canvasElement, args }) => { await userEvent.click(region(canvasElement, eventCopy.title).getByRole('button', { name: eventCopy.reload })); await expect(args.events.onReload).toHaveBeenCalledOnce(); await expect(region(canvasElement, deadlineCopy.title).getByRole('radio', { name: deadlineCopy.relative })).toBeEnabled(); } };
export const IndependentSave: Story = { play: async ({ canvasElement, args }) => {
  const d = region(canvasElement, deadlineCopy.title), e = region(canvasElement, eventCopy.title), r = region(canvasElement, reminderCopy.title);
  await userEvent.click(d.getByRole('radio', { name: deadlineCopy.relative }));
  await userEvent.click(e.getByRole('checkbox', { name: eventCopy.emailLabel(jobNotificationEventRows[1].label) }));
  await userEvent.click(d.getByRole('button', { name: deadlineCopy.review })); await expect(args.deadline.onSave).not.toHaveBeenCalled();
  await userEvent.click(body(canvasElement).getByRole('button', { name: deadlineCopy.confirm }));
  await waitFor(() => expect(region(canvasElement, deadlineCopy.title).getByRole('button', { name: deadlineCopy.review })).toBeDisabled());
  await expect(args.deadline.onSave).toHaveBeenCalledWith({ mode: 'relative', days: copy.stories.defaultDays, count: 'business', revision: 'deadline-v1' });
  await expect(args.events.onSave).not.toHaveBeenCalled(); await expect(args.reminders.onSave).not.toHaveBeenCalled();
  await expect(e.getByRole('checkbox', { name: eventCopy.emailLabel(jobNotificationEventRows[1].label) })).not.toBeChecked();
  await expect(e.getByRole('button', { name: eventCopy.review })).toBeEnabled(); await expect(r.getByLabelText(reminderCopy.sendTime)).toHaveValue(copy.stories.time);
} };
export const Review: Story = { play: async ({ canvasElement }) => { const r = region(canvasElement, reminderCopy.title); await userEvent.click(r.getByRole('checkbox', { name: copy.stories.member })); await userEvent.click(r.getByRole('button', { name: reminderCopy.review })); await waitFor(() => expect(body(canvasElement).getByLabelText(reminderCopy.summary)).toHaveFocus()); } };
export const SaveError: Story = { args: { events: { ...events, error: eventCopy.saveError, onSave: fn(async () => { throw new Error(eventCopy.saveError); }) } }, play: async ({ canvasElement }) => { const e = region(canvasElement, eventCopy.title); await userEvent.click(e.getByRole('checkbox', { name: eventCopy.emailLabel(jobNotificationEventRows[1].label) })); await userEvent.click(e.getByRole('button', { name: eventCopy.review })); await userEvent.click(body(canvasElement).getByRole('button', { name: eventCopy.confirm })); await expect(body(canvasElement).getByRole('dialog')).toBeInTheDocument(); } };
export const RemindersActive: Story = { args: { deliveryPending: true }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('heading', { name: copy.configurationTitle })).toBeVisible(); await expect(within(canvasElement).getByText(copy.configurationHelp)).toBeVisible(); } };
