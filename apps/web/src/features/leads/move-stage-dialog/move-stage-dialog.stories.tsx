import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { Toast } from '@salesmora/ui';
import { MoveStageDialog, type MoveStageDialogProps, type MoveStageValue } from './move-stage-dialog';
import { moveStageDialogData as copy } from './move-stage-dialog.data';

type PreviewProps = Omit<MoveStageDialogProps, 'open' | 'onChange' | 'onClose'> & { fail?: boolean };
function Preview({ value: initialValue, error: initialError, onConfirm, onReload, fail = false, ...args }: PreviewProps) {
  const [open, setOpen] = useState(true), [saved, setSaved] = useState(false);
  const [value, setValue] = useState<MoveStageValue>(initialValue);
  const [error, setError] = useState(initialError);
  return <>
    <button type="button" onClick={() => { setValue(initialValue); setError(initialError); setOpen(true); }} className="min-h-11 cursor-pointer rounded-xl bg-primary px-5 font-semibold text-white focus-visible:focus-ring">{copy.stories.open}</button>
    <MoveStageDialog {...args} open={open} value={value} error={error} onChange={setValue} onClose={() => setOpen(false)}
      onConfirm={async request => {
        await onConfirm(request);
        if (fail) { setError({ kind: 'error', message: copy.stories.failure }); throw new globalThis.Error('Preview failure'); }
        setOpen(false); setSaved(true);
      }} onReload={onReload ? async () => { await onReload(); setError(undefined); } : undefined}/>
    <Toast open={saved} kind="success" message={copy.stories.success} autoHideMs={2000} onClose={() => setSaved(false)}/>
  </>;
}
const meta = {
  title: 'Leads/MoveStageDialog', component: Preview, parameters: { layout: 'fullscreen' },
  args: { lead: copy.stories.lead, value: { to: 'estimate-sent', reason: '' }, onConfirm: fn(), onReload: fn() },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-3 text-muted">{copy.stories.description}</p><Story/></main>],
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const LostReason: Story = { args: { value: { to: 'lost', reason: copy.stories.reason } } };
export const ReopenLost: Story = { args: { lead: { ...copy.stories.lead, stage: 'lost' }, value: { to: 'new', reason: '' } } };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body);
  await expect(body.getByRole('combobox', { name: copy.stage })).toBeDisabled();
  await expect(body.getByRole('button', { name: copy.cancel })).toBeDisabled();
  await userEvent.keyboard('{Escape}'); await expect(body.getByRole('alertdialog')).toBeInTheDocument();
  await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const Error: Story = { args: { error: { kind: 'error', message: copy.stories.failure } } };
export const Conflict: Story = { args: { error: { kind: 'conflict', message: copy.stories.conflict } }, play: async ({ canvasElement }) => {
  const body = within(canvasElement.ownerDocument.body);
  await expect(body.getByRole('button', { name: copy.confirm })).toBeDisabled();
  await expect(body.getByRole('combobox', { name: copy.stage })).toBeDisabled();
} };
export const NotAllowed: Story = { args: { lead: { ...copy.stories.lead, canMove: false } }, play: async ({ canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body);
  await expect(body.queryByRole('combobox')).not.toBeInTheDocument();
  await expect(body.getByRole('button', { name: copy.confirm })).toBeDisabled();
  await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const Archived: Story = { args: { lead: { ...copy.stories.lead, archived: true } } };
export const InvalidSelection: Story = { args: { value: { to: 'contacted', reason: '' } } };
export const Narrow: Story = { ...LostReason, args: { ...LostReason.args, lead: { ...copy.stories.lead, name: copy.stories.longName } }, parameters: { viewport: { value: 'phone' } } };
export const ConfirmLost: Story = { ...LostReason, play: async ({ canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(body.getByRole('button', { name: copy.confirm }));
  await waitFor(() => expect(args.onConfirm).toHaveBeenCalledWith({ lead: args.lead, to: 'lost', reason: copy.stories.reason }));
  await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument());
} };
export const RetryError: Story = { args: { fail: true }, play: async ({ canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(body.getByRole('button', { name: copy.confirm }));
  await waitFor(() => expect(body.getByText(copy.stories.failure)).toBeVisible());
  await expect(body.getByRole('alertdialog')).toBeInTheDocument();
  await expect(body.getByRole('button', { name: copy.confirm })).toBeEnabled();
  await expect(args.onConfirm).toHaveBeenCalledTimes(1);
} };
export const ReloadConflict: Story = { ...Conflict, play: async ({ canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(body.getByRole('button', { name: copy.reload }));
  await waitFor(() => expect(args.onReload).toHaveBeenCalledTimes(1));
  await expect(body.getByRole('button', { name: copy.confirm })).toBeEnabled();
} };

export const AsyncAction: Story = { play: async ({ canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body);
  let finish!: () => void;
  args.onConfirm.mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }));
  await userEvent.click(body.getByRole('button', { name: copy.confirm }));
  await expect(body.getByRole('combobox', { name: copy.stage })).toBeDisabled();
  fireEvent.submit(body.getByRole('alertdialog').querySelector('form')!);
  await userEvent.keyboard('{Escape}');
  await expect(body.getByRole('alertdialog')).toBeInTheDocument();
  await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  finish();
  await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument());
} };
export const ReloadFailure: Story = { args: { ...Conflict.args, onReload: fn(async () => { throw new globalThis.Error('Preview reload rejection'); }) }, play: async ({ canvasElement }) => {
  const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(body.getByRole('button', { name: copy.reload }));
  await waitFor(() => expect(body.getByText(copy.reloadFailed)).toBeVisible());
} };
