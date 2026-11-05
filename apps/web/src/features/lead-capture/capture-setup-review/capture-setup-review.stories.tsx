import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';
import { CaptureSetupReview, type CaptureSetupReviewProps } from './capture-setup-review';
import { captureSetupReviewData as copy } from './capture-setup-review.data';
import type { CaptureSetupReviewDraft } from './capture-setup-review.validation';
const fixture = copy.stories;
const draft: CaptureSetupReviewDraft = {
  id: 'source-one', version: 3, name: fixture.name, source: 'website', timezone: fixture.timezone,
  sections: [
    { id: 'source', rows: [{ label: fixture.nameLabel, value: fixture.name }, { label: fixture.typeLabel, value: fixture.website }, { label: fixture.destinationLabel, value: fixture.destination }] },
    { id: 'fields', rows: [{ label: fixture.fieldsLabel, value: fixture.fields }] },
    { id: 'workflow', rows: [{ label: fixture.assignmentLabel, value: fixture.assignment }, { label: fixture.stageLabel, value: fixture.stage }, { label: fixture.tagsLabel, value: fixture.tags }, { label: fixture.notificationsLabel, value: fixture.notifications }] },
  ],
  checks: (['source', 'fields', 'workflow', 'access', 'capacity'] as const).map(id => ({ id, status: 'ready' })),
};
const clock = () => Date.parse(fixture.now);
function Preview(args: CaptureSetupReviewProps) {
  const [value, setValue] = useState(args.value);
  return <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><p className="mb-6 mt-0 text-sm text-muted">{fixture.description}</p><CaptureSetupReview {...args} value={value} onChange={next => { args.onChange(next); setValue(next); }} /></main>;
}
const meta = {
  title: 'Lead Capture/CaptureSetupReview', component: CaptureSetupReview, parameters: { layout: 'fullscreen' }, render: args => <Preview {...args} />,
  args: { draft, value: { mode: 'now', localDateTime: '' }, canRead: true, canEdit: true, canLaunch: true, now: clock, onChange: fn<CaptureSetupReviewProps['onChange']>(), onEdit: fn<CaptureSetupReviewProps['onEdit']>(), onLaunch: fn<CaptureSetupReviewProps['onLaunch']>(async () => {}) },
} satisfies Meta<typeof CaptureSetupReview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('button', { name: copy.launch })).toBeDisabled();
} };
export const Gmail: Story = { args: { draft: { ...draft, source: 'gmail', sections: draft.sections.map(section => section.id === 'source' ? { ...section, rows: [{ label: fixture.typeLabel, value: fixture.gmail }, { label: fixture.destinationLabel, value: fixture.destination }, { label: fixture.rulesLabel, value: fixture.rules }] } : section.id === 'fields' ? { ...section, rows: [...section.rows, { label: fixture.sampleLabel, value: fixture.sample }] } : section), checks: [...draft.checks, { id: 'account', status: 'ready' }, { id: 'sample', status: 'ready' }] } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(copy.gmail)).toBeVisible();
} };
export const LaunchNow: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('checkbox', { name: copy.confirm })); await userEvent.click(c.getByRole('button', { name: copy.launch }));
  await expect(args.onLaunch).toHaveBeenCalledWith({ draft, timing: { kind: 'now' } }); await expect(await c.findByText(copy.submitted)).toBeVisible();
  await expect(c.getByRole('button', { name: copy.launch })).toBeDisabled();
} };
export const Scheduled: Story = { args: { value: { mode: 'scheduled', localDateTime: fixture.schedule } } };
export const ScheduleLaunch: Story = { args: { value: { mode: 'scheduled', localDateTime: fixture.schedule } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('checkbox', { name: copy.confirm })); await userEvent.click(c.getByRole('button', { name: copy.schedule }));
  await expect(args.onLaunch).toHaveBeenCalledWith({ draft, timing: { kind: 'scheduled', at: '2026-10-30T13:00:00.000Z', timezone: fixture.timezone, localDateTime: fixture.schedule } }); await expect(await c.findByText(copy.submittedSchedule)).toBeVisible();
} };
export const EditSection: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const key of ['source', 'fields', 'workflow'] as const) { await userEvent.click(c.getByRole('button', { name: copy.edit(copy.sections[key]) })); await expect(args.onEdit).toHaveBeenLastCalledWith(key); }
} };
export const CapacityBlocked: Story = { args: { draft: { ...draft, checks: draft.checks.map(check => check.id === 'capacity' ? { ...check, status: 'blocked', detail: fixture.capacity } : check) } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('checkbox', { name: copy.confirm })).toBeDisabled(); await expect(c.getByRole('button', { name: copy.launch })).toBeDisabled(); await expect(args.onLaunch).not.toHaveBeenCalled();
} };
export const CheckingReadiness: Story = { args: { draft: { ...draft, checks: draft.checks.map(check => check.id === 'access' ? { ...check, status: 'checking' } : check) } } };
export const GmailMissingChecks: Story = { args: { draft: { ...draft, source: 'gmail' } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: copy.launch })).toBeDisabled();
} };
export const PastSchedule: Story = { args: { value: { mode: 'scheduled', localDateTime: '2026-10-20T09:00' } } };
export const ClockGap: Story = { args: { value: { mode: 'scheduled', localDateTime: '2027-03-14T02:30' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.errors.gap)).toBeVisible(); await expect(c.getByRole('button', { name: copy.schedule })).toBeDisabled();
} };
export const ClockFold: Story = { args: { value: { mode: 'scheduled', localDateTime: '2026-11-01T01:30' } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(copy.errors.ambiguous)).toBeVisible();
} };
export const ChangeTimingResetsApproval: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('checkbox', { name: copy.confirm })); await userEvent.click(c.getByRole('radio', { name: copy.scheduled })); await expect(c.getByRole('checkbox', { name: copy.confirm })).not.toBeChecked(); await expect(c.getByRole('button', { name: copy.schedule })).toBeDisabled();
} };
function UpdatedDraftPreview(args: CaptureSetupReviewProps) {
  const [current, setCurrent] = useState(args.draft);
  return <main className="grid min-h-screen gap-6 bg-canvas p-4 text-ink sm:p-8"><button type="button" className="min-h-11 cursor-pointer justify-self-start rounded-xl border border-line bg-paper px-4 text-sm font-semibold text-primary focus-visible:focus-ring" onClick={() => setCurrent({ ...args.draft, version: args.draft.version + 1, name: fixture.nameChanged })}>{fixture.change}</button><CaptureSetupReview {...args} draft={current} /></main>;
}
export const ChangedDraft: Story = { render: args => <UpdatedDraftPreview {...args} />, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('checkbox', { name: copy.confirm })); await userEvent.click(c.getByRole('button', { name: fixture.change })); await expect(c.getByRole('checkbox', { name: copy.confirm })).not.toBeChecked(); await expect(c.getByRole('button', { name: copy.launch })).toBeDisabled();
} };
export const LaunchFailure: Story = { args: { onLaunch: fn<CaptureSetupReviewProps['onLaunch']>(async () => { throw new Error('Mock failure'); }) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('checkbox', { name: copy.confirm })); await userEvent.click(c.getByRole('button', { name: copy.launch })); await expect(await c.findByRole('alert')).toHaveTextContent(copy.failed); await expect(c.getByRole('checkbox', { name: copy.confirm })).toBeChecked();
} };
export const PreventDuplicateLaunch: Story = { args: { onLaunch: fn<CaptureSetupReviewProps['onLaunch']>(() => new Promise<void>(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('checkbox', { name: copy.confirm })); await userEvent.click(c.getByRole('button', { name: copy.launch }));
  fireEvent.submit(c.getByRole('checkbox', { name: copy.confirm }).closest('form')!); await expect(args.onLaunch).toHaveBeenCalledTimes(1); await expect(c.getByRole('button', { name: copy.pending })).toBeDisabled(); await expect(c.getByRole('button', { name: copy.edit(copy.sections.source) })).toBeDisabled();
} };
export const ReadOnly: Story = { args: { canEdit: false, canLaunch: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('button', { name: copy.launch })).toBeDisabled(); await expect(c.queryByRole('button', { name: copy.edit(copy.sections.source) })).not.toBeInTheDocument();
} };
export const Pending: Story = { args: { pending: true } };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.denied); await expect(c.queryByText(fixture.name)).not.toBeInTheDocument();
} };
export const LongContent: Story = { args: { draft: { ...draft, name: fixture.long.repeat(3), sections: draft.sections.map(section => ({ ...section, rows: section.rows.map(row => ({ ...row, value: fixture.long.repeat(4) })) })) } } };
export const FrozenAssistantTiming: Story = { args: { timingReadOnly: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('radio', { name: copy.scheduled })).toBeDisabled();
  await userEvent.click(c.getByRole('checkbox', { name: copy.confirm }));
  await userEvent.click(c.getByRole('button', { name: copy.launch }));
  await expect(args.onChange).not.toHaveBeenCalled();
  await expect(args.onLaunch).toHaveBeenCalledWith({ draft, timing: { kind: 'now' } });
} };
