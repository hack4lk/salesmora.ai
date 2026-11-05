import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { CapturePauseResumeDialog, type CapturePauseResumeDialogProps } from './capture-pause-resume-dialog';
import { capturePauseResumeDialogData as copy } from './capture-pause-resume-dialog.data';
import type { CaptureIntakeSource } from './capture-pause-resume-dialog.validation';
const fixture = copy.stories;
const source: CaptureIntakeSource = { id: 'source-one', version: 4, name: fixture.name, type: 'website', status: 'active', canPause: true, canResume: true, resumeReadiness: 'ready', approved: [{ label: fixture.assignmentLabel, value: fixture.assignment }, { label: fixture.stageLabel, value: fixture.stage }] };
function Preview(args: CapturePauseResumeDialogProps) {
  const [open, setOpen] = useState(args.open), [current, setCurrent] = useState(args.source), [error, setError] = useState(args.error), [accepted, setAccepted] = useState(false);
  return <><button type="button" className="min-h-11 cursor-pointer rounded-xl border border-primary bg-primary px-4 py-2 font-semibold text-paper focus-visible:focus-ring" onClick={() => { setAccepted(false); setOpen(true); }}>{fixture.open}</button>
    <CapturePauseResumeDialog {...args} open={open} source={current} error={error} onClose={() => { args.onClose(); setOpen(false); }} onConfirm={async request => { await args.onConfirm(request); setOpen(false); setAccepted(true); }} onReload={args.onReload ? async () => { await args.onReload!(); setCurrent(previous => ({ ...previous, version: previous.version + 1 })); setError(undefined); } : undefined} />
    {accepted && <p role="status" className="mt-4 text-sm text-muted">{fixture.complete}</p>}
  </>;
}
const meta = {
  title: 'Lead Capture/CapturePauseResumeDialog', component: CapturePauseResumeDialog, parameters: { layout: 'fullscreen' }, render: args => <Preview {...args} />,
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><h1 className="m-0 text-heading font-semibold">{fixture.title}</h1><p className="mb-6 mt-3 text-sm leading-6 text-muted">{fixture.description}</p><Story /></main>],
  args: { open: true, source, action: 'pause', canRead: true, onClose: fn(), onConfirm: fn<CapturePauseResumeDialogProps['onConfirm']>(async () => {}), onReload: fn<NonNullable<CapturePauseResumeDialogProps['onReload']>>(async () => {}) },
} satisfies Meta<typeof CapturePauseResumeDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
const body = (element: HTMLElement) => within(element.ownerDocument.body);
export const Default: Story = {};
export const GmailPause: Story = { args: { source: { ...source, type: 'gmail' } } };
export const WebsiteResume: Story = { args: { action: 'resume', source: { ...source, status: 'paused' } } };
export const GmailResume: Story = { args: { action: 'resume', source: { ...source, type: 'gmail', status: 'paused', approved: [...source.approved, { label: fixture.accountLabel, value: fixture.account }, { label: fixture.rulesLabel, value: fixture.rules }] } }, play: async ({ canvasElement }) => {
  await waitFor(() => expect(body(canvasElement).getByText(copy.consequences.gmail.resume)).toBeVisible());
} };
export const ConfirmPause: Story = { play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm.pause })); await expect(args.onConfirm).toHaveBeenCalledWith({ action: 'pause', source }); await waitFor(() => expect(c.getByText(fixture.complete)).toBeVisible());
} };
export const ConfirmResume: Story = { args: { action: 'resume', source: { ...source, status: 'paused' } }, play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm.resume })); await expect(args.onConfirm).toHaveBeenCalledWith({ action: 'resume', source: args.source }); await waitFor(() => expect(c.getByText(fixture.complete)).toBeVisible());
} };
export const Cancel: Story = { play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.cancel })); await waitFor(() => expect(c.queryByRole('alertdialog')).not.toBeInTheDocument()); await expect(args.onConfirm).not.toHaveBeenCalled(); await expect(args.onClose).toHaveBeenCalledTimes(1);
} };
export const KeyboardReturn: Story = { args: { open: false }, play: async ({ canvasElement }) => {
  const c = body(canvasElement), trigger = c.getByRole('button', { name: fixture.open }); await userEvent.click(trigger);
  await waitFor(() => expect(c.getByRole('button', { name: copy.cancel })).toHaveFocus()); await userEvent.keyboard('{Escape}'); await waitFor(() => expect(c.queryByRole('alertdialog')).not.toBeInTheDocument()); await expect(trigger).toHaveFocus();
} };
export const ResumeBlocked: Story = { args: { action: 'resume', source: { ...source, type: 'gmail', status: 'paused', resumeReadiness: 'blocked', resumeReason: fixture.blocked } }, play: async ({ canvasElement }) => {
  const c = body(canvasElement); await expect(c.getByRole('button', { name: copy.confirm.resume })).toBeDisabled(); await waitFor(() => expect(c.getByText(fixture.blocked)).toBeVisible());
} };
export const CheckingReadiness: Story = { args: { action: 'resume', source: { ...source, status: 'paused', resumeReadiness: 'checking' } } };
export const IneligibleStatus: Story = { args: { source: { ...source, status: 'archived' } }, play: async ({ canvasElement }) => {
  await expect(body(canvasElement).getByRole('button', { name: copy.confirm.pause })).toBeDisabled();
} };
export const Forbidden: Story = { args: { source: { ...source, canPause: false } } };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); await expect(c.queryByText(source.name)).not.toBeInTheDocument(); await expect(c.getByRole('button', { name: copy.confirm.pause })).toBeDisabled(); await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const Failure: Story = { args: { onConfirm: fn<CapturePauseResumeDialogProps['onConfirm']>(async () => { throw new Error('Mock mutation failure'); }) }, play: async ({ canvasElement }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm.pause })); await waitFor(() => expect(c.getByText(copy.failed)).toBeVisible()); await expect(c.getByRole('button', { name: copy.confirm.pause })).toBeEnabled();
} };
export const Conflict: Story = { args: { error: { kind: 'conflict', message: fixture.conflict } }, play: async ({ canvasElement }) => {
  await expect(body(canvasElement).getByRole('button', { name: copy.confirm.pause })).toBeDisabled();
} };
export const ReloadConflict: Story = { args: { error: { kind: 'conflict', message: fixture.conflict } }, play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.reload })); await expect(args.onReload).toHaveBeenCalledTimes(1); await userEvent.click(c.getByRole('button', { name: copy.confirm.pause })); await expect(args.onConfirm).toHaveBeenCalledWith({ action: 'pause', source: { ...source, version: 5 } });
} };
export const ReloadFailure: Story = { args: { error: { kind: 'conflict', message: fixture.conflict }, onReload: fn<NonNullable<CapturePauseResumeDialogProps['onReload']>>(async () => { throw new Error('Mock reload failure'); }) }, play: async ({ canvasElement }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.reload })); await waitFor(() => expect(c.getByText(copy.reloadFailed)).toBeVisible()); await expect(c.getByRole('button', { name: copy.confirm.pause })).toBeDisabled();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); await expect(c.getByRole('button', { name: copy.cancel })).toBeDisabled(); await userEvent.keyboard('{Escape}'); await waitFor(() => expect(c.getByRole('alertdialog')).toBeVisible()); await expect(args.onClose).not.toHaveBeenCalled();
} };
export const PreventDuplicate: Story = { args: { onConfirm: fn<CapturePauseResumeDialogProps['onConfirm']>(() => new Promise<void>(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm.pause })); fireEvent.submit(c.getByRole('alertdialog').querySelector('form')!); await expect(args.onConfirm).toHaveBeenCalledTimes(1); await expect(c.getByRole('button', { name: copy.cancel })).toBeDisabled();
} };
export const LongContent: Story = { args: { action: 'resume', source: { ...source, status: 'paused', name: fixture.long.repeat(3), approved: source.approved.map(row => ({ ...row, value: fixture.long.repeat(5) })) } } };
