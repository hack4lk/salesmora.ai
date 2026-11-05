import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { CaptureLaunchChangeDialog, type CaptureLaunchChangeDialogProps } from './capture-launch-change-dialog';
import { captureLaunchChangeDialogData as copy } from './capture-launch-change-dialog.data';
import type { CaptureScheduledSource } from './capture-launch-change-dialog.validation';
import { captureSetupReviewData } from '../capture-setup-review/capture-setup-review.data';
const fixture = copy.stories;
const source: CaptureScheduledSource = { id: 'scheduled-source', version: 4, name: fixture.name, type: 'website', status: 'scheduled', scheduledAt: fixture.current, timezone: fixture.timezone, canChange: true, readiness: 'ready' };
const changed = { mode: 'scheduled' as const, localDateTime: fixture.changedLocal };
const clock = () => Date.parse(fixture.now);
function Preview(args: CaptureLaunchChangeDialogProps) {
  const [open, setOpen] = useState(args.open), [current, setCurrent] = useState(args.source), [value, setValue] = useState(args.value), [error, setError] = useState(args.error), [accepted, setAccepted] = useState(false);
  return <><button type="button" className="min-h-11 cursor-pointer rounded-xl border border-primary bg-primary px-4 py-2 font-semibold text-paper focus-visible:focus-ring" onClick={() => { setAccepted(false); setOpen(true); }}>{fixture.open}</button>
    <CaptureLaunchChangeDialog {...args} open={open} source={current} value={value} error={error} onChange={next => { args.onChange(next); setValue(next); }} onClose={() => { args.onClose(); setOpen(false); }} onConfirm={async request => { await args.onConfirm(request); setOpen(false); setAccepted(true); }} onReload={args.onReload ? async () => { await args.onReload!(); setCurrent(previous => ({ ...previous, version: previous.version + 1 })); setError(undefined); } : undefined} />
    {accepted && <p role="status" className="mt-4 text-sm text-muted">{fixture.complete}</p>}
  </>;
}
const meta = {
  title: 'Lead Capture/CaptureLaunchChangeDialog', component: CaptureLaunchChangeDialog, parameters: { layout: 'fullscreen' }, render: args => <Preview {...args} />,
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><h1 className="m-0 text-heading font-semibold">{fixture.title}</h1><p className="mb-6 mt-3 text-sm leading-6 text-muted">{fixture.description}</p><Story /></main>],
  args: { open: true, source, value: changed, canRead: true, now: clock, onClose: fn(), onChange: fn<CaptureLaunchChangeDialogProps['onChange']>(), onConfirm: fn<CaptureLaunchChangeDialogProps['onConfirm']>(async () => {}), onReload: fn<NonNullable<CaptureLaunchChangeDialogProps['onReload']>>(async () => {}) },
} satisfies Meta<typeof CaptureLaunchChangeDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
const body = (element: HTMLElement) => within(element.ownerDocument.body);
export const Default: Story = {};
export const Gmail: Story = { args: { source: { ...source, type: 'gmail' } } };
export const Unchanged: Story = { args: { value: { mode: 'scheduled', localDateTime: fixture.currentLocal } }, play: async ({ canvasElement }) => {
  await expect(body(canvasElement).getByRole('button', { name: copy.confirm })).toBeDisabled();
} };
export const EditTime: Story = { play: async ({ canvasElement, args }) => {
  const c = body(canvasElement), input = c.getByLabelText(copy.date, { exact: false });
  fireEvent.change(input, { target: { value: fixture.currentLocal } });
  await expect(args.onChange).toHaveBeenLastCalledWith({ mode: 'scheduled', localDateTime: fixture.currentLocal }); await expect(c.getByRole('button', { name: copy.confirm })).toBeDisabled();
} };
export const LaunchNow: Story = { play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('radio', { name: copy.now })); await userEvent.click(c.getByRole('button', { name: copy.launchNow }));
  await expect(args.onConfirm).toHaveBeenCalledWith({ source, timing: { kind: 'now' } }); await waitFor(() => expect(c.getByText(fixture.complete)).toBeVisible());
} };
export const ConfirmSchedule: Story = { play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm })); await expect(args.onConfirm).toHaveBeenCalledWith({ source, timing: { kind: 'scheduled', at: fixture.changedInstant, timezone: fixture.timezone, localDateTime: fixture.changedLocal } }); await waitFor(() => expect(c.getByText(fixture.complete)).toBeVisible());
} };
export const Cancel: Story = { play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.cancel })); await waitFor(() => expect(c.queryByRole('alertdialog')).not.toBeInTheDocument()); await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const Blocked: Story = { args: { source: { ...source, type: 'gmail', readiness: 'blocked', reason: fixture.blocked } } };
export const Checking: Story = { args: { source: { ...source, readiness: 'checking' } } };
export const AlreadyLaunched: Story = { args: { source: { ...source, status: 'active' } }, play: async ({ canvasElement }) => {
  await expect(body(canvasElement).getByRole('button', { name: copy.confirm })).toBeDisabled();
} };
export const ElapsedSchedule: Story = { args: { source: { ...source, scheduledAt: '2026-10-28T13:00:00Z' } } };
export const PastTime: Story = { args: { value: { mode: 'scheduled', localDateTime: '2026-10-28T09:00' } } };
export const ClockGap: Story = { args: { value: { mode: 'scheduled', localDateTime: '2027-03-14T02:30' } }, play: async ({ canvasElement }) => {
  await waitFor(() => expect(body(canvasElement).getByText(captureSetupReviewData.errors.gap)).toBeVisible());
} };
export const ClockFold: Story = { args: { value: { mode: 'scheduled', localDateTime: '2026-11-01T01:30' } }, play: async ({ canvasElement }) => {
  await waitFor(() => expect(body(canvasElement).getByText(captureSetupReviewData.errors.ambiguous)).toBeVisible());
} };
export const Forbidden: Story = { args: { source: { ...source, canChange: false } } };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = body(canvasElement); await expect(c.queryByText(source.name)).not.toBeInTheDocument(); await expect(c.queryByRole('textbox')).not.toBeInTheDocument(); await expect(c.getByRole('button', { name: copy.confirm })).toBeDisabled();
} };
export const Failure: Story = { args: { onConfirm: fn<CaptureLaunchChangeDialogProps['onConfirm']>(async () => { throw new Error('Mock update failure'); }) }, play: async ({ canvasElement }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm })); await waitFor(() => expect(c.getByText(copy.failed)).toBeVisible()); await expect(c.getByLabelText(copy.date, { exact: false })).toHaveValue(fixture.changedLocal);
} };
export const Conflict: Story = { args: { error: { kind: 'conflict', message: fixture.conflict } } };
export const ReloadConflict: Story = { args: { error: { kind: 'conflict', message: fixture.conflict } }, play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.reload })); await userEvent.click(c.getByRole('button', { name: copy.confirm })); await expect(args.onConfirm).toHaveBeenCalledWith({ source: { ...source, version: 5 }, timing: { kind: 'scheduled', at: fixture.changedInstant, timezone: fixture.timezone, localDateTime: fixture.changedLocal } });
} };
export const ReloadFailure: Story = { args: { error: { kind: 'conflict', message: fixture.conflict }, onReload: fn<NonNullable<CaptureLaunchChangeDialogProps['onReload']>>(async () => { throw new Error('Mock reload failure'); }) }, play: async ({ canvasElement }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.reload })); await waitFor(() => expect(c.getByText(copy.reloadFailed)).toBeVisible()); await expect(c.getByRole('button', { name: copy.confirm })).toBeDisabled();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); await expect(c.getByRole('button', { name: copy.cancel })).toBeDisabled(); await userEvent.keyboard('{Escape}'); await expect(args.onClose).not.toHaveBeenCalled();
} };
export const PreventDuplicate: Story = { args: { onConfirm: fn<CaptureLaunchChangeDialogProps['onConfirm']>(() => new Promise<void>(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm })); fireEvent.submit(c.getByRole('alertdialog').querySelector('form')!); await expect(args.onConfirm).toHaveBeenCalledTimes(1); await expect(c.getByRole('button', { name: copy.cancel })).toBeDisabled();
} };
export const LongContent: Story = { args: { source: { ...source, name: fixture.long.repeat(10) } } };
