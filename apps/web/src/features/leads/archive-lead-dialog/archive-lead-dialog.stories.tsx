import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { Toast } from '@salesmora/ui';
import { ArchiveLeadDialog, type ArchiveLeadDialogProps } from './archive-lead-dialog';
import { archiveLeadDialogData as copy } from './archive-lead-dialog.data';

type PreviewProps = Omit<ArchiveLeadDialogProps, 'open' | 'onClose'> & { failOnce?: boolean };
function Preview({ error: initialError, onConfirm, failOnce, ...args }: PreviewProps) {
  const [open, setOpen] = useState(true), [saved, setSaved] = useState(false);
  const [error, setError] = useState(initialError), [failed, setFailed] = useState(false);
  return <>
    <button type="button" onClick={() => { setError(initialError); setOpen(true); }} className="min-h-11 cursor-pointer rounded-xl bg-primary px-5 font-semibold text-white focus-visible:focus-ring">{copy.stories.open}</button>
    <ArchiveLeadDialog {...args} open={open} error={error} onClose={() => setOpen(false)} onConfirm={async request => {
      await onConfirm(request);
      if (failOnce && !failed) { setFailed(true); setError({ kind: 'error', message: copy.stories.failure }); throw new globalThis.Error('Mock archive failure'); }
      setOpen(false); setSaved(true);
    }}/>
    <Toast open={saved} kind="success" message={copy.stories.success} autoHideMs={2000} onClose={() => setSaved(false)}/>
  </>;
}
const meta = {
  title: 'Leads/ArchiveLeadDialog', component: Preview, parameters: { layout: 'fullscreen' },
  args: { lead: copy.stories.lead, onConfirm: fn() },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-3 text-muted">{copy.stories.description}</p><Story/></main>],
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body);
  await expect(body.getByRole('button', { name: copy.pending })).toBeDisabled();
  await expect(body.getByRole('button', { name: copy.cancel })).toBeDisabled();
  await userEvent.keyboard('{Escape}'); await expect(body.getByRole('alertdialog')).toBeInTheDocument();
  await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const Error: Story = { args: { error: { kind: 'error', message: copy.stories.failure } } };
export const Conflict: Story = { args: { error: { kind: 'conflict', message: copy.conflict } }, play: async ({ canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body);
  await expect(body.getByRole('button', { name: copy.confirm })).toBeDisabled();
  fireEvent.submit(body.getByRole('alertdialog').querySelector('form')!);
  await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const NotAllowed: Story = { args: { lead: { ...copy.stories.lead, canArchive: false } }, play: Conflict.play };
export const AlreadyArchived: Story = { args: { lead: { ...copy.stories.lead, archived: true } }, play: Conflict.play };
export const LongName: Story = { args: { lead: { ...copy.stories.lead, name: copy.stories.longName } } };
export const Narrow: Story = { ...LongName, parameters: { viewport: { value: 'phone' } } };
export const Confirm: Story = { play: async ({ canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body);
  await waitFor(() => expect(body.getByText(copy.allowance)).toBeVisible());
  await userEvent.click(body.getByRole('button', { name: copy.confirm }));
  await waitFor(() => expect(args.onConfirm).toHaveBeenCalledWith({ leadId: args.lead.id, expectedVersion: args.lead.version }));
  await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument());
} };
export const Cancel: Story = { play: async ({ canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(body.getByRole('button', { name: copy.cancel }));
  await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument());
  await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const Retry: Story = { args: { failOnce: true }, play: async ({ canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(body.getByRole('button', { name: copy.confirm }));
  await waitFor(() => expect(body.getByText(copy.stories.failure)).toBeVisible());
  await expect(body.getByRole('alertdialog')).toBeInTheDocument();
  await userEvent.click(body.getByRole('button', { name: copy.confirm }));
  await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument());
  await expect(args.onConfirm).toHaveBeenCalledTimes(2);
} };
export const AsyncAction: Story = { play: async ({ canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body);
  let finish!: () => void;
  args.onConfirm.mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }));
  await userEvent.click(body.getByRole('button', { name: copy.confirm }));
  await expect(body.getByRole('button', { name: copy.pending })).toBeDisabled();
  fireEvent.submit(body.getByRole('alertdialog').querySelector('form')!);
  await userEvent.keyboard('{Escape}');
  await expect(body.getByRole('alertdialog')).toBeInTheDocument();
  await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  finish();
  await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument());
} };
