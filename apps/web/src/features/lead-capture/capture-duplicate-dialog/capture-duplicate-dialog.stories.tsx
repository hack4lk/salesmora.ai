import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { CaptureDuplicateDialog, type CaptureDuplicateDialogProps } from './capture-duplicate-dialog';
import { captureDuplicateDialogData as copy } from './capture-duplicate-dialog.data';
import { captureDuplicateName, type CaptureDuplicateSource } from './capture-duplicate-dialog.validation';
const fixture = copy.stories;
const source: CaptureDuplicateSource = { id: 'original-source', version: 4, name: fixture.name, type: 'website', status: 'active', canDuplicate: true, readiness: 'ready', configuration: { kind: 'approved', version: 2, summary: [{ label: fixture.fieldsLabel, value: fixture.fields }, { label: fixture.workflowLabel, value: fixture.workflow }] } };
function Preview(args: CaptureDuplicateDialogProps) {
  const [open, setOpen] = useState(args.open), [current, setCurrent] = useState(args.source), [name, setName] = useState(args.name), [error, setError] = useState(args.error), [accepted, setAccepted] = useState(false);
  return <><button type="button" className="min-h-11 cursor-pointer rounded-xl border border-primary bg-primary px-4 py-2 font-semibold text-paper focus-visible:focus-ring" onClick={() => { setAccepted(false); setOpen(true); }}>{fixture.open}</button>
    <CaptureDuplicateDialog {...args} open={open} source={current} name={name} error={error} onNameChange={next => { args.onNameChange(next); setName(next); }} onClose={() => { args.onClose(); setOpen(false); }} onConfirm={async request => { await args.onConfirm(request); setOpen(false); setAccepted(true); }} onReload={args.onReload ? async () => { await args.onReload!(); setCurrent(previous => ({ ...previous, version: previous.version + 1, configuration: { ...previous.configuration, version: previous.configuration.version + 1 } })); setError(undefined); } : undefined} />
    {accepted && <p role="status" className="mt-4 text-sm text-muted">{fixture.complete}</p>}
  </>;
}
const meta = {
  title: 'Lead Capture/CaptureDuplicateDialog', component: CaptureDuplicateDialog, parameters: { layout: 'fullscreen' }, render: args => <Preview {...args} />,
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><h1 className="m-0 text-heading font-semibold">{fixture.title}</h1><p className="mb-6 mt-3 text-sm leading-6 text-muted">{fixture.description}</p><Story /></main>],
  args: { open: true, source, name: captureDuplicateName(source.name), canRead: true, onClose: fn(), onNameChange: fn<CaptureDuplicateDialogProps['onNameChange']>(), onConfirm: fn<CaptureDuplicateDialogProps['onConfirm']>(async () => {}), onReload: fn<NonNullable<CaptureDuplicateDialogProps['onReload']>>(async () => {}) },
} satisfies Meta<typeof CaptureDuplicateDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
const body = (element: HTMLElement) => within(element.ownerDocument.body);
export const Default: Story = {};
export const Gmail: Story = { args: { source: { ...source, type: 'gmail', configuration: { ...source.configuration, summary: [...source.configuration.summary, { label: fixture.rulesLabel, value: fixture.rules }] } } }, play: async ({ canvasElement }) => {
  await waitFor(() => expect(body(canvasElement).getByText(copy.gmail)).toBeVisible());
} };
export const DraftSource: Story = { args: { source: { ...source, status: 'draft', configuration: { ...source.configuration, kind: 'draft' } } } };
export const ArchivedSource: Story = { args: { source: { ...source, status: 'archived' } } };
export const ScheduledSource: Story = { args: { source: { ...source, status: 'scheduled' } } };
export const EditName: Story = { play: async ({ canvasElement, args }) => {
  const c = body(canvasElement), input = c.getByRole('textbox', { name: copy.name }); await userEvent.clear(input); await userEvent.type(input, fixture.editedName); await expect(args.onNameChange).toHaveBeenLastCalledWith(fixture.editedName);
} };
export const ConfirmCopy: Story = { play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm })); await expect(args.onConfirm).toHaveBeenCalledWith({ sourceId: source.id, expectedVersion: source.version, configuration: { kind: 'approved', version: 2 }, name: captureDuplicateName(source.name), to: 'draft', requestId: expect.any(String) }); await waitFor(() => expect(c.getByText(fixture.complete)).toBeVisible());
} };
export const Cancel: Story = { play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.cancel })); await waitFor(() => expect(c.queryByRole('alertdialog')).not.toBeInTheDocument()); await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const EmptyName: Story = { args: { name: '' }, play: async ({ canvasElement }) => {
  await expect(body(canvasElement).getByRole('button', { name: copy.confirm })).toBeDisabled();
} };
export const NameLimit: Story = { play: async ({ canvasElement }) => {
  const input = body(canvasElement).getByRole('textbox', { name: copy.name }); await userEvent.clear(input); await userEvent.type(input, 'x'.repeat(85)); await expect(input).toHaveValue('x'.repeat(80));
} };
export const AccessBlocked: Story = { args: { source: { ...source, type: 'gmail', readiness: 'blocked', reason: fixture.blocked } } };
export const Checking: Story = { args: { source: { ...source, readiness: 'checking' } } };
export const Forbidden: Story = { args: { source: { ...source, canDuplicate: false } } };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = body(canvasElement); await expect(c.queryByText(source.name)).not.toBeInTheDocument(); await expect(c.queryByRole('textbox')).not.toBeInTheDocument(); await expect(c.getByRole('button', { name: copy.confirm })).toBeDisabled();
} };
export const Failure: Story = { args: { onConfirm: fn<CaptureDuplicateDialogProps['onConfirm']>(async () => { throw new Error('Mock creation failure'); }) }, play: async ({ canvasElement }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm })); await waitFor(() => expect(c.getByText(copy.failed)).toBeVisible()); await expect(c.getByRole('textbox', { name: copy.name })).toHaveValue(captureDuplicateName(source.name));
} };
export const RetryUsesSameRequest: Story = { play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); args.onConfirm.mockRejectedValueOnce(new Error('Mock transport failure'));
  await userEvent.click(c.getByRole('button', { name: copy.confirm })); await waitFor(() => expect(c.getByText(copy.failed)).toBeVisible()); await userEvent.click(c.getByRole('button', { name: copy.confirm }));
  await expect(args.onConfirm).toHaveBeenCalledTimes(2); await expect(args.onConfirm.mock.calls[0][0]).toEqual(args.onConfirm.mock.calls[1][0]); await waitFor(() => expect(c.getByText(fixture.complete)).toBeVisible());
} };
export const Conflict: Story = { args: { error: { kind: 'conflict', message: fixture.conflict } } };
export const ReloadConflict: Story = { args: { error: { kind: 'conflict', message: fixture.conflict } }, play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.reload })); await userEvent.click(c.getByRole('button', { name: copy.confirm })); await expect(args.onConfirm).toHaveBeenCalledWith(expect.objectContaining({ expectedVersion: 5, configuration: { kind: 'approved', version: 3 } }));
} };
export const ReloadFailure: Story = { args: { error: { kind: 'conflict', message: fixture.conflict }, onReload: fn<NonNullable<CaptureDuplicateDialogProps['onReload']>>(async () => { throw new Error('Mock reload failure'); }) }, play: async ({ canvasElement }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.reload })); await waitFor(() => expect(c.getByText(copy.reloadFailed)).toBeVisible()); await expect(c.getByRole('button', { name: copy.confirm })).toBeDisabled();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); await expect(c.getByRole('textbox', { name: copy.name })).toBeDisabled(); await expect(c.getByRole('button', { name: copy.cancel })).toBeDisabled(); await userEvent.keyboard('{Escape}'); await expect(args.onClose).not.toHaveBeenCalled();
} };
export const PreventDuplicate: Story = { args: { onConfirm: fn<CaptureDuplicateDialogProps['onConfirm']>(() => new Promise<void>(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = body(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm })); fireEvent.submit(c.getByRole('alertdialog').querySelector('form')!); await expect(args.onConfirm).toHaveBeenCalledTimes(1); await expect(c.getByRole('button', { name: copy.cancel })).toBeDisabled();
} };
export const LongContent: Story = { args: { source: { ...source, name: fixture.long.repeat(4), configuration: { ...source.configuration, summary: source.configuration.summary.map(row => ({ ...row, value: fixture.long.repeat(4) })) } } } };
