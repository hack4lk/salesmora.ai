import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ReportTemplateUpdateDialog, type ReportTemplateUpdateDialogProps } from './report-template-update-dialog';
import { reportTemplateUpdateDialogData as copy } from './report-template-update-dialog.data';

function Preview(args: ReportTemplateUpdateDialogProps) {
  const [open, setOpen] = useState(false);
  return <main className="min-h-screen bg-canvas p-4 text-ink">
    <button type="button" className="min-h-11 rounded-xl border border-line bg-paper px-4 py-2 font-semibold focus-visible:focus-ring" onClick={() => setOpen(true)}>Review template update</button>
    <ReportTemplateUpdateDialog {...args} open={open} onClose={() => { args.onClose(); setOpen(false); }}
      onConfirm={async id => { await args.onConfirm(id); setOpen(false); }} />
  </main>;
}
const meta = {
  title: 'Reports/ReportTemplateUpdateDialog',
  component: ReportTemplateUpdateDialog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Confirmation for replacing a personal template with the current report settings, matching the approved prototype. Reuses ConfirmDialog with Cancel initially focused. The host owns the reviewed configuration, user/workspace isolation, access/version revalidation, persistence and closing on success. Stories only mock confirmation; they do not save configurations, results or permissions.' } } },
  render: args => <Preview {...args} />,
  args: { open: false, template: { id: 'my-leads', name: 'My lead intake' }, canUpdate: true, onClose: fn(), onConfirm: fn(async () => {}) },
} satisfies Meta<typeof ReportTemplateUpdateDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

async function openDialog(canvasElement: HTMLElement) {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Review template update' }));
  const dialog = await within(canvasElement.ownerDocument.body).findByRole('alertdialog', { name: copy.title });
  await waitFor(() => expect(dialog).toBeVisible());
  return within(dialog);
}
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const d = await openDialog(canvasElement);
  await expect(d.getByText(copy.description(args.template.name))).toBeVisible();
  await expect(d.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const ConfirmUpdate: Story = { play: async ({ canvasElement, args }) => {
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
  await waitFor(() => expect(within(canvasElement).getByRole('button', { name: 'Review template update' })).toHaveFocus());
} };
export const Escape: Story = { play: async ({ canvasElement, args }) => {
  await openDialog(canvasElement);
  await userEvent.keyboard('{Escape}');
  await expect(args.onClose).toHaveBeenCalledTimes(1);
  await expect(args.onConfirm).not.toHaveBeenCalled();
  await waitFor(() => expect(within(canvasElement).getByRole('button', { name: 'Review template update' })).toHaveFocus());
} };
export const KeyboardConfirm: Story = { play: async ({ canvasElement, args }) => {
  const d = await openDialog(canvasElement);
  await expect(d.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  await userEvent.tab();
  await expect(d.getByRole('button', { name: copy.confirm })).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await expect(args.onConfirm).toHaveBeenCalledWith(args.template.id);
} };
export const UpdateFailure: Story = { args: { onConfirm: fn(async () => { throw new Error('Simulated update failure'); }) }, play: async ({ canvasElement, args }) => {
  const d = await openDialog(canvasElement);
  await userEvent.click(d.getByRole('button', { name: copy.confirm }));
  await expect(await d.findByRole('alert')).toBeVisible();
  await expect(d.getByText(copy.description(args.template.name))).toBeVisible();
  await userEvent.click(d.getByRole('button', { name: copy.confirm }));
  await expect(args.onConfirm).toHaveBeenCalledTimes(2);
} };
export const ServerError: Story = { args: { error: 'This template changed since review. Reload your templates before updating.' }, play: async ({ canvasElement, args }) => {
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
export const PermissionRevoked: Story = { args: { canUpdate: false }, play: async ({ canvasElement, args }) => {
  const d = await openDialog(canvasElement);
  await expect(d.getByRole('alert')).toHaveTextContent(copy.denied);
  await expect(d.getByRole('button', { name: copy.confirm })).toBeDisabled();
  await userEvent.keyboard('{Enter}');
  await expect(args.onConfirm).not.toHaveBeenCalled();
  await expect(args.onClose).toHaveBeenCalledTimes(1);
} };
export const LongName: Story = { args: { template: { id: 'long-name', name: 'LongTemplateNameWithoutSpaces'.repeat(3) } }, play: async ({ canvasElement }) => { await openDialog(canvasElement); } };
