import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { copy as dialogCopy } from '../../jobs/job-dialog/job-dialog.data';
import { JobNotificationEvents, type JobNotificationEventsProps } from './job-notification-events';
import { defaultJobEventEmails as defaults, jobNotificationEventRows as rows, jobNotificationEventsData as copy } from './job-notification-events.data';
const edited = { ...defaults, status: false, schedule: false };
function Preview(args: JobNotificationEventsProps) {
  const [values, setValues] = useState(args.values), [saved, setSaved] = useState(args.savedValues);
  return <JobNotificationEvents {...args} values={values} savedValues={saved} onChange={next => { args.onChange(next); setValues(next); }} onDiscard={() => { args.onDiscard(); setValues(saved); }} onSave={async next => { await args.onSave(next); setSaved(next.emails); }}/>;
}
const meta = { title: 'Settings/JobNotificationEvents', component: JobNotificationEvents, render: args => <Preview {...args}/>,
  args: { values: defaults, savedValues: defaults, revision: copy.stories.revision, plan: 'premium', canManage: true, onChange: fn(), onDiscard: fn(), onReload: fn(), onSave: fn() },
  decorators: [Story => <main className="mx-auto grid min-h-screen w-full max-w-4xl content-start gap-6 p-4 sm:p-8"><p className="m-0 text-sm leading-6 text-muted">{copy.stories.notice}</p><Story/></main>], parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof JobNotificationEvents>;
export default meta; type Story = StoryObj<typeof meta>;
const body = (element: HTMLElement) => within(element.ownerDocument.body);
async function review(element: HTMLElement) { await userEvent.click(body(element).getByRole('button', { name: copy.review })); }
export const Default: Story = { play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getAllByText(copy.on)).toHaveLength(rows.length); await expect(c.getAllByRole('checkbox')).toHaveLength(rows.length); await expect(c.getByRole('button', { name: copy.review })).toBeDisabled(); } };
export const Free: Story = { args: { plan: 'free' }, play: async ({ canvasElement, args }) => { for (const input of within(canvasElement).getAllByRole('checkbox')) { await expect(input).toBeChecked(); await expect(input).toBeDisabled(); } await expect(args.onSave).not.toHaveBeenCalled(); } };
export const Standard: Story = { args: { plan: 'standard' } };
export const ToggleEmail: Story = { play: async ({ canvasElement, args }) => { const c = within(canvasElement); await userEvent.click(c.getByRole('checkbox', { name: copy.emailLabel(rows[1].label) })); await expect(args.onChange).toHaveBeenCalledWith({ ...defaults, status: false }); await expect(c.getAllByText(copy.on)).toHaveLength(rows.length); await expect(args.onSave).not.toHaveBeenCalled(); } };
export const Review: Story = { args: { values: edited }, play: async ({ canvasElement, args }) => { await review(canvasElement); await waitFor(() => expect(body(canvasElement).getByLabelText(copy.summary)).toHaveFocus()); await expect(args.onSave).not.toHaveBeenCalled(); await expect(within(body(canvasElement).getByRole('dialog')).getAllByText(copy.disabled)).toHaveLength(2); } };
export const Confirm: Story = { args: { values: edited }, play: async ({ canvasElement, args }) => { await review(canvasElement); await userEvent.click(body(canvasElement).getByRole('button', { name: copy.confirm })); await expect(args.onSave).toHaveBeenCalledOnce(); await expect(args.onSave).toHaveBeenCalledWith({ emails: edited, revision: copy.stories.revision }); await waitFor(() => expect(body(canvasElement).getByRole('button', { name: copy.review })).toBeDisabled()); } };
export const AllEmailOff: Story = { args: { values: { created: false, status: false, assignment: false, schedule: false, deadline: false, approaching: false, overdue: false } }, play: async ({ canvasElement }) => { for (const input of within(canvasElement).getAllByRole('checkbox')) await expect(input).not.toBeChecked(); await expect(within(canvasElement).getAllByText(copy.on)).toHaveLength(rows.length); } };
export const Discard: Story = { args: { values: edited }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.discard })); for (const input of c.getAllByRole('checkbox')) await expect(input).toBeChecked(); await expect(args.onDiscard).toHaveBeenCalledOnce(); await expect(args.onSave).not.toHaveBeenCalled(); } };
export const ReadOnly: Story = { args: { canManage: false, values: edited, savedValues: edited }, play: async ({ canvasElement }) => { for (const input of within(canvasElement).getAllByRole('checkbox')) await expect(input).toBeDisabled(); } };
export const Saving: Story = { args: { values: edited, pending: true } };
export const SaveError: Story = { args: { values: edited, error: copy.saveError, onSave: fn(async () => { throw new Error(copy.saveError); }) }, play: async ({ canvasElement }) => { await review(canvasElement); await userEvent.click(body(canvasElement).getByRole('button', { name: copy.confirm })); await expect(body(canvasElement).getByRole('dialog')).toBeInTheDocument(); } };
export const Conflict: Story = { args: { values: edited, conflict: true }, play: async ({ canvasElement, args }) => { await userEvent.click(within(canvasElement).getByRole('button', { name: copy.reload })); await expect(args.onReload).toHaveBeenCalledOnce(); } };
export const Loading: Story = { args: { state: 'loading' }, play: async ({ canvasElement }) => { await expect(within(canvasElement).queryByRole('table')).not.toBeInTheDocument(); } };
export const LoadError: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => { await userEvent.click(within(canvasElement).getByRole('button', { name: copy.reload })); await expect(args.onReload).toHaveBeenCalledOnce(); } };
export const Downgraded: Story = { args: { values: edited, savedValues: edited, plan: 'standard' }, play: async ({ canvasElement, args }) => { for (const input of within(canvasElement).getAllByRole('checkbox')) { await expect(input).toBeChecked(); await expect(input).toBeDisabled(); } await expect(args.onChange).not.toHaveBeenCalled(); await expect(args.onSave).not.toHaveBeenCalled(); } };
function RevisionPreview(args: JobNotificationEventsProps) {
  const [revision, setRevision] = useState(args.revision);
  useEffect(() => { const change = () => setRevision('job-events-preview-v2'); window.addEventListener('job-events-revision', change); return () => window.removeEventListener('job-events-revision', change); }, []);
  return <Preview {...args} revision={revision}/>;
}
export const RevisionChanged: Story = { args: { values: edited }, render: args => <RevisionPreview {...args}/>, play: async ({ canvasElement, args }) => { await review(canvasElement); canvasElement.ownerDocument.defaultView?.dispatchEvent(new Event('job-events-revision')); await waitFor(() => expect(body(canvasElement).queryByRole('dialog')).not.toBeInTheDocument()); await expect(args.onSave).not.toHaveBeenCalled(); } };
export const Keyboard: Story = { play: async ({ canvasElement, args }) => { const c = within(canvasElement); c.getByRole('checkbox', { name: copy.emailLabel(rows[0].label) }).focus(); await userEvent.keyboard(' '); await expect(args.onChange).toHaveBeenCalledWith({ ...defaults, created: false }); c.getByRole('button', { name: copy.review }).focus(); await userEvent.keyboard('{Enter}'); await waitFor(() => expect(body(canvasElement).getByLabelText(copy.summary)).toHaveFocus()); } };
function PendingPreview(args: JobNotificationEventsProps) {
  const [pending, setPending] = useState(false);
  useEffect(() => { const change = () => setPending(true); window.addEventListener('job-events-pending', change); return () => window.removeEventListener('job-events-pending', change); }, []);
  return <Preview {...args} pending={pending}/>;
}
export const PendingReview: Story = { args: { values: edited }, render: args => <PendingPreview {...args}/>, play: async ({ canvasElement, args }) => {
  await review(canvasElement); canvasElement.ownerDocument.defaultView?.dispatchEvent(new Event('job-events-pending'));
  const dialog = within(body(canvasElement).getByRole('dialog')); await waitFor(() => expect(dialog.getByRole('button', { name: dialogCopy.saving })).toBeDisabled());
  await userEvent.keyboard('{Escape}'); await expect(body(canvasElement).getByRole('dialog')).toBeInTheDocument(); await expect(dialog.getByRole('button', { name: dialogCopy.close })).toBeDisabled(); await expect(args.onSave).not.toHaveBeenCalled();
} };
