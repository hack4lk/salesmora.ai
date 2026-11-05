import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { CaptureArchiveRestoreDialog, type CaptureArchiveRestoreDialogProps } from './capture-archive-restore-dialog';
import { captureArchiveRestoreDialogData as copy } from './capture-archive-restore-dialog.data';
import type { CaptureArchiveSource } from './capture-archive-restore-dialog.validation';
const fixture = copy.stories;
const source: CaptureArchiveSource = { id: 'source-one', version: 4, name: fixture.name, type: 'website', status: 'active', canArchive: true, canRestore: true, restoreReadiness: 'ready' };
function Preview(args: CaptureArchiveRestoreDialogProps) {
  const [open, setOpen] = useState(args.open), [current, setCurrent] = useState(args.source), [error, setError] = useState(args.error), [accepted, setAccepted] = useState(false);
  return <><button type="button" className="min-h-11 cursor-pointer rounded-xl border border-primary bg-primary px-4 py-2 font-semibold text-paper focus-visible:focus-ring" onClick={() => { setAccepted(false); setOpen(true); }}>{fixture.open}</button>
    <CaptureArchiveRestoreDialog {...args} open={open} source={current} error={error} onClose={() => { args.onClose(); setOpen(false); }} onConfirm={async request => { await args.onConfirm(request); setOpen(false); setAccepted(true); }} onReload={args.onReload ? async () => { await args.onReload!(); setCurrent(previous => ({ ...previous, version: previous.version + 1 })); setError(undefined); } : undefined} />
    {accepted && <p role="status" className="mt-4 text-sm text-muted">{fixture.complete}</p>}
  </>;
}
const meta = {
  title: 'Lead Capture/CaptureArchiveRestoreDialog', component: CaptureArchiveRestoreDialog, parameters: { layout: 'fullscreen' }, render: args => <Preview {...args} />,
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><h1 className="m-0 text-heading font-semibold">{fixture.title}</h1><p className="mb-6 mt-3 text-sm leading-6 text-muted">{fixture.description}</p><Story /></main>],
  args: { open: true, source, action: 'archive', canRead: true, onClose: fn(), onConfirm: fn<CaptureArchiveRestoreDialogProps['onConfirm']>(async () => {}), onReload: fn<NonNullable<CaptureArchiveRestoreDialogProps['onReload']>>(async () => {}) },
} satisfies Meta<typeof CaptureArchiveRestoreDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
const body = (element: HTMLElement) => within(element.ownerDocument.body);
export const Default: Story = {};
export const ScheduledArchive: Story = { args: { source: { ...source, status: 'scheduled' } }, play: async ({ canvasElement }) => {
  await waitFor(() => expect(body(canvasElement).getByText(copy.cancelSchedule)).toBeVisible());
} };
export const DraftArchive: Story = { args: { source: { ...source, status: 'draft' } }, play: async ({ canvasElement }) => {
  await waitFor(() => expect(body(canvasElement).getByText(copy.draftArchive)).toBeVisible());
} };
export const AccessBlocked: Story = { args: { action: 'restore', source: { ...source, type: 'gmail', status: 'archived', restoreReadiness: 'blocked', restoreReason: fixture.access } } };
export const GmailArchive: Story = { args: { source: { ...source, type: 'gmail' } } };
export const WebsiteRestore: Story = { args: { action: 'restore', source: { ...source, status: 'archived' } } };
export const GmailRestore: Story = { args: { action: 'restore', source: { ...source, type: 'gmail', status: 'archived' } }, play: async ({ canvasElement }) => {
  await waitFor(() => expect(body(canvasElement).getByText(copy.consequences.gmail.restore)).toBeVisible());
} };
export const ConfirmArchive: Story = { play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm.archive })); await expect(args.onConfirm).toHaveBeenCalledWith({ action: 'archive', source, to: 'archived' }); await waitFor(() => expect(c.getByText(fixture.complete)).toBeVisible());
} };
export const ConfirmRestore: Story = { args: { action: 'restore', source: { ...source, status: 'archived' } }, play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm.restore })); await expect(args.onConfirm).toHaveBeenCalledWith({ action: 'restore', source: args.source, to: 'paused' }); await waitFor(() => expect(c.getByText(fixture.complete)).toBeVisible());
} };
export const Cancel: Story = { play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.cancel })); await waitFor(() => expect(c.queryByRole('alertdialog')).not.toBeInTheDocument()); await expect(args.onConfirm).not.toHaveBeenCalled(); await expect(args.onClose).toHaveBeenCalledTimes(1);
} };
export const KeyboardReturn: Story = { args: { open: false }, play: async ({ canvasElement }) => {
  const c = body(canvasElement), trigger = c.getByRole('button', { name: fixture.open }); await userEvent.click(trigger);
  await waitFor(() => expect(c.getByRole('button', { name: copy.cancel })).toHaveFocus()); await userEvent.keyboard('{Escape}'); await waitFor(() => expect(c.queryByRole('alertdialog')).not.toBeInTheDocument()); await expect(trigger).toHaveFocus();
} };
export const CapacityBlocked: Story = { args: { action: 'restore', source: { ...source, type: 'gmail', status: 'archived', restoreReadiness: 'blocked', restoreReason: fixture.capacity } }, play: async ({ canvasElement }) => {
  const c = body(canvasElement); await expect(c.getByRole('button', { name: copy.confirm.restore })).toBeDisabled(); await waitFor(() => expect(c.getByText(fixture.capacity)).toBeVisible());
} };
export const CheckingReadiness: Story = { args: { action: 'restore', source: { ...source, status: 'archived', restoreReadiness: 'checking' } } };
export const IneligibleStatus: Story = { args: { source: { ...source, status: 'archived' } }, play: async ({ canvasElement }) => {
  await expect(body(canvasElement).getByRole('button', { name: copy.confirm.archive })).toBeDisabled();
} };
export const Forbidden: Story = { args: { source: { ...source, canArchive: false } } };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); await expect(c.queryByText(source.name)).not.toBeInTheDocument(); await expect(c.getByRole('button', { name: copy.confirm.archive })).toBeDisabled(); await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const Failure: Story = { args: { onConfirm: fn<CaptureArchiveRestoreDialogProps['onConfirm']>(async () => { throw new Error('Mock mutation failure'); }) }, play: async ({ canvasElement }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm.archive })); await waitFor(() => expect(c.getByText(copy.failed)).toBeVisible()); await expect(c.getByRole('button', { name: copy.confirm.archive })).toBeEnabled();
} };
export const Conflict: Story = { args: { error: { kind: 'conflict', message: fixture.conflict } }, play: async ({ canvasElement }) => {
  await expect(body(canvasElement).getByRole('button', { name: copy.confirm.archive })).toBeDisabled();
} };
export const ReloadConflict: Story = { args: { error: { kind: 'conflict', message: fixture.conflict } }, play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.reload })); await expect(args.onReload).toHaveBeenCalledTimes(1); await userEvent.click(c.getByRole('button', { name: copy.confirm.archive })); await expect(args.onConfirm).toHaveBeenCalledWith({ action: 'archive', source: { ...source, version: 5 }, to: 'archived' });
} };
export const ReloadFailure: Story = { args: { error: { kind: 'conflict', message: fixture.conflict }, onReload: fn<NonNullable<CaptureArchiveRestoreDialogProps['onReload']>>(async () => { throw new Error('Mock reload failure'); }) }, play: async ({ canvasElement }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.reload })); await waitFor(() => expect(c.getByText(copy.reloadFailed)).toBeVisible()); await expect(c.getByRole('button', { name: copy.confirm.archive })).toBeDisabled();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); await expect(c.getByRole('button', { name: copy.cancel })).toBeDisabled(); await userEvent.keyboard('{Escape}'); await waitFor(() => expect(c.getByRole('alertdialog')).toBeVisible()); await expect(args.onClose).not.toHaveBeenCalled();
} };
export const PreventDuplicate: Story = { args: { onConfirm: fn<CaptureArchiveRestoreDialogProps['onConfirm']>(() => new Promise<void>(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm.archive })); fireEvent.submit(c.getByRole('alertdialog').querySelector('form')!); await expect(args.onConfirm).toHaveBeenCalledTimes(1); await expect(c.getByRole('button', { name: copy.cancel })).toBeDisabled();
} };
export const LongContent: Story = { args: { action: 'restore', source: { ...source, status: 'archived', name: fixture.long.repeat(12) } } };
