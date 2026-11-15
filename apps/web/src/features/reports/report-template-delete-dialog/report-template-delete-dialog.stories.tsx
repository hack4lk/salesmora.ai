import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ReportTemplateDeleteDialog, type ReportTemplateDeleteDialogProps } from './report-template-delete-dialog';
import { reportTemplateDeleteDialogData as copy } from './report-template-delete-dialog.data';

function Preview(args: ReportTemplateDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  return <main className="min-h-screen bg-canvas p-4 text-ink">
    <button type="button" className="min-h-11 rounded-xl border border-line bg-paper px-4 py-2 font-semibold focus-visible:focus-ring" onClick={() => setOpen(true)}>Review template deletion</button>
    <ReportTemplateDeleteDialog {...args} open={open} onClose={() => { args.onClose(); setOpen(false); }}
      onConfirm={async id => { await args.onConfirm(id); setOpen(false); }} />
  </main>;
}
const meta = {
  title: 'Reports/ReportTemplateDeleteDialog',
  component: ReportTemplateDeleteDialog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Personal configuration deletion review using the shared ConfirmDialog. Cancel receives initial focus. The host must provide an authorized template, revalidate ownership/workspace/version on confirmation, persist the deletion and close after success. Stories use mocked callbacks, never delete stored templates or business records.' } } },
  render: args => <Preview {...args} />,
  args: { open: false, template: { id: 'my-leads', name: 'My lead intake' }, canDelete: true, onClose: fn(), onConfirm: fn(async () => {}) },
} satisfies Meta<typeof ReportTemplateDeleteDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

async function openDialog(canvasElement: HTMLElement) {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Review template deletion' }));
  const dialog = await within(canvasElement.ownerDocument.body).findByRole('alertdialog', { name: copy.title });
  await waitFor(() => expect(dialog).toBeVisible());
  return within(dialog);
}
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const d = await openDialog(canvasElement);
  await expect(d.getByText(copy.description(args.template.name))).toBeVisible();
  await expect(d.getByText(copy.impact)).toBeVisible();
  await expect(d.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const ConfirmDeletion: Story = { play: async ({ canvasElement, args }) => {
  const d = await openDialog(canvasElement);
  await userEvent.click(d.getByRole('button', { name: copy.confirm }));
  await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  await expect(args.onConfirm).toHaveBeenCalledWith(args.template.id);
  await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('alertdialog')).not.toBeInTheDocument());
} };
export const Cancel: Story = { play: async ({ canvasElement, args }) => {
  const d = await openDialog(canvasElement);
  await userEvent.click(d.getByRole('button', { name: 'Cancel' }));
  await expect(args.onClose).toHaveBeenCalledTimes(1);
  await expect(args.onConfirm).not.toHaveBeenCalled();
  await waitFor(() => expect(within(canvasElement).getByRole('button', { name: 'Review template deletion' })).toHaveFocus());
} };
export const Escape: Story = { play: async ({ canvasElement, args }) => {
  await openDialog(canvasElement);
  await userEvent.keyboard('{Escape}');
  await expect(args.onClose).toHaveBeenCalledTimes(1);
  await expect(args.onConfirm).not.toHaveBeenCalled();
  await waitFor(() => expect(within(canvasElement).getByRole('button', { name: 'Review template deletion' })).toHaveFocus());
} };
export const KeyboardConfirm: Story = { play: async ({ canvasElement, args }) => {
  const d = await openDialog(canvasElement);
  await expect(d.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  await userEvent.tab();
  await expect(d.getByRole('button', { name: copy.confirm })).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await expect(args.onConfirm).toHaveBeenCalledWith(args.template.id);
} };
export const DeleteFailure: Story = { args: { onConfirm: fn(async () => { throw new Error('Simulated delete failure'); }) }, play: async ({ canvasElement, args }) => {
  const d = await openDialog(canvasElement);
  await userEvent.click(d.getByRole('button', { name: copy.confirm }));
  await expect(await d.findByRole('alert')).toBeVisible();
  await expect(d.getByText(copy.description(args.template.name))).toBeVisible();
  await userEvent.click(d.getByRole('button', { name: copy.confirm }));
  await expect(args.onConfirm).toHaveBeenCalledTimes(2);
} };
export const ServerError: Story = { args: { error: 'This template changed since you opened it. Reload your templates before deleting.' }, play: async ({ canvasElement, args }) => {
  const d = await openDialog(canvasElement);
  await expect(d.getByRole('alert')).toHaveTextContent(args.error!);
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const d = await openDialog(canvasElement);
  for (const button of d.getAllByRole('button')) await expect(button).toBeDisabled();
  await userEvent.keyboard('{Escape}');
  await expect(d.getByRole('status')).toHaveTextContent(copy.pending);
  await expect(args.onClose).not.toHaveBeenCalled();
  await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const PermissionRevoked: Story = { args: { canDelete: false }, play: async ({ canvasElement, args }) => {
  const d = await openDialog(canvasElement);
  await expect(d.getByRole('alert')).toHaveTextContent(copy.denied);
  await expect(d.getByRole('button', { name: copy.confirm })).toBeDisabled();
  await userEvent.keyboard('{Enter}');
  await expect(args.onConfirm).not.toHaveBeenCalled();
  await expect(args.onClose).toHaveBeenCalledTimes(1);
} };
export const LongName: Story = { args: { template: { id: 'long-name', name: 'LongTemplateNameWithoutSpaces'.repeat(3) } }, play: async ({ canvasElement }) => { await openDialog(canvasElement); } };
