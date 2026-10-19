import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { ConfirmDialog, type ConfirmDialogProps } from './confirm-dialog';
import { confirmDialogData as copy } from './confirm-dialog.data';

type PreviewProps = Omit<ConfirmDialogProps, 'confirmation'> & { typed?: boolean };
function Preview({ typed, ...args }: PreviewProps) {
  const [open, setOpen] = useState(args.open);
  const [value, setValue] = useState('');
  const [complete, setComplete] = useState(false);
  return <main className="min-h-screen bg-canvas p-6 sm:p-8">
    <h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.pageTitle}</h1>
    <button type="button" className="mt-6 min-h-11 cursor-pointer rounded-xl bg-primary px-5 py-3 font-semibold text-paper hover:bg-primary-dark focus-visible:focus-ring" onClick={() => { setValue(''); setOpen(true); }}>{copy.stories.open}</button>
    {complete && <p role="status" className="text-success">{copy.stories.completed}</p>}
    <ConfirmDialog {...args} open={open} onClose={() => { args.onClose(); setOpen(false); }}
      confirmation={typed ? { label: copy.stories.confirmationLabel, expectedValue: copy.stories.confirmationValue, value, onChange: setValue } : undefined}
      onConfirm={async () => { await args.onConfirm(); setComplete(true); setOpen(false); }}/>
  </main>;
}
const meta = { title: 'Feedback/ConfirmDialog', component: Preview, parameters: { layout: 'fullscreen' },
  args: { open: true, title: copy.stories.title, description: copy.stories.description, confirmLabel: copy.stories.confirm, onConfirm: fn(), onClose: fn() },
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Destructive: Story = { args: { destructive: true, title: copy.stories.destructiveTitle, description: copy.stories.destructiveDescription, confirmLabel: copy.stories.delete } };
export const TypedConfirm: Story = { ...Destructive, args: { ...Destructive.args, typed: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement.ownerDocument.body);
  await expect(c.getByRole('button', { name: copy.stories.delete })).toBeDisabled();
  await userEvent.type(c.getByRole('textbox', { name: copy.stories.confirmationLabel }), copy.stories.confirmationValue.toLowerCase());
  await expect(c.getByRole('button', { name: copy.stories.delete })).toBeDisabled();
  await userEvent.clear(c.getByRole('textbox', { name: copy.stories.confirmationLabel }));
} };
export const Pending: Story = { args: { ...Destructive.args, pending: true, pendingLabel: copy.stories.pending }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement.ownerDocument.body);
  await userEvent.keyboard('{Escape}');
  await expect(c.getByRole('button', { name: copy.cancel })).toBeDisabled();
  await expect(args.onClose).not.toHaveBeenCalled();
  await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const Error: Story = { args: { ...Destructive.args, error: copy.stories.error } };
export const Attachment: Story = { args: { destructive: true, title: copy.stories.alternativeTitle, description: copy.stories.alternativeDescription, confirmLabel: copy.stories.alternativeConfirm } };
export const Narrow: Story = { args: { ...TypedConfirm.args }, parameters: { viewport: { value: 'mobile1' } } };
export const RejectedAction: Story = { args: { onConfirm: fn(async () => { throw new globalThis.Error('Preview rejection'); }) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: copy.stories.confirm }));
  await expect(c.getByRole('alert')).toHaveTextContent(copy.failed);
} };
const asyncConfirm = fn(async () => {});
export const AsyncAction: Story = { args: { onConfirm: asyncConfirm }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement.ownerDocument.body);
  let finish!: () => void;
  asyncConfirm.mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }));
  const form = c.getByRole('alertdialog').querySelector('form')!;
  fireEvent.submit(form);
  fireEvent.submit(form);
  await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  await expect(c.getByRole('button', { name: copy.cancel })).toBeDisabled();
  await userEvent.keyboard('{Escape}');
  await expect(args.onClose).not.toHaveBeenCalled();
  finish();
  await waitFor(() => expect(c.getByRole('status')).toHaveTextContent(copy.stories.completed));
} };
