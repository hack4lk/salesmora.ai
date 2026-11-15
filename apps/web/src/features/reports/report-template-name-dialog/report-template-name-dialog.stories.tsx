import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ReportTemplateNameDialog, type ReportTemplateNameDialogProps } from './report-template-name-dialog';
import { reportTemplateNameDialogData as copy } from './report-template-name-dialog.data';

function Preview(args: ReportTemplateNameDialogProps) {
  const [open, setOpen] = useState(false);
  return <main className="min-h-screen bg-canvas p-4 text-ink">
    <button type="button" className="min-h-11 rounded-xl border border-line bg-paper px-4 py-2 font-semibold focus-visible:focus-ring" onClick={() => setOpen(true)}>Open template dialog</button>
    <ReportTemplateNameDialog {...args} open={open} onClose={() => { args.onClose(); setOpen(false); }} onSave={async name => { await args.onSave(name); setOpen(false); }} />
  </main>;
}
const meta = {
  title: 'Reports/ReportTemplateNameDialog',
  component: ReportTemplateNameDialog,
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Save/rename one personal template, reusing ConfirmDialog and TextField. Validates trimmed names and case-insensitive duplicates within the supplied report area; the host must revalidate access and uniqueness on save and own persistence/configuration. Mocked callbacks in these stories do not persist data. Deletion and configuration editing are separate review steps.' } } },
  render: args => <Preview {...args} />,
  args: { open: false, mode: 'save', reportLabel: 'Leads', initialName: 'Leads / my view', existingTemplates: [{ id: 'existing', name: 'Monthly review' }], canSave: true, onClose: fn(), onSave: fn(async () => {}) },
} satisfies Meta<typeof ReportTemplateNameDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

async function openDialog(canvasElement: HTMLElement) {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open template dialog' }));
  const dialog = await within(canvasElement.ownerDocument.body).findByRole('alertdialog');
  await waitFor(() => expect(dialog).toBeVisible());
  return within(dialog);
}
export const Default: Story = { play: async ({ canvasElement }) => { await openDialog(canvasElement); } };
export const Save: Story = { play: async ({ canvasElement, args }) => {
  const d = await openDialog(canvasElement);
  await expect(d.getByRole('textbox', { name: /Template name/ })).toHaveFocus();
  await userEvent.clear(d.getByRole('textbox'));
  await userEvent.type(d.getByRole('textbox'), '  Weekly intake  ');
  await userEvent.click(d.getByRole('button', { name: copy.confirm.save }));
  await expect(args.onSave).toHaveBeenCalledWith('Weekly intake');
  await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('alertdialog')).not.toBeInTheDocument());
} };
export const Rename: Story = { args: { mode: 'rename', templateId: 'existing', initialName: 'Monthly review' }, play: async ({ canvasElement, args }) => {
  const d = await openDialog(canvasElement);
  await expect(d.getByRole('heading', { name: copy.titles.rename })).toBeVisible();
  await userEvent.click(d.getByRole('button', { name: copy.confirm.rename }));
  await expect(args.onSave).toHaveBeenCalledWith('Monthly review');
} };
export const BlankName: Story = { play: async ({ canvasElement, args }) => {
  const d = await openDialog(canvasElement);
  await userEvent.clear(d.getByRole('textbox'));
  await userEvent.type(d.getByRole('textbox'), '   ');
  await userEvent.click(d.getByRole('button', { name: copy.confirm.save }));
  await expect(d.getByText(copy.errors.length)).toBeVisible();
  await expect(d.getByRole('textbox')).toHaveFocus();
  await expect(args.onSave).not.toHaveBeenCalled();
} };
export const DuplicateName: Story = { play: async ({ canvasElement, args }) => {
  const d = await openDialog(canvasElement);
  await userEvent.clear(d.getByRole('textbox'));
  await userEvent.type(d.getByRole('textbox'), '  MONTHLY review ');
  await userEvent.click(d.getByRole('button', { name: copy.confirm.save }));
  await expect(d.getByText(copy.errors.duplicate)).toBeVisible();
  await expect(args.onSave).not.toHaveBeenCalled();
  await userEvent.clear(d.getByRole('textbox'));
  await userEvent.type(d.getByRole('textbox'), 'A different review');
  await userEvent.click(d.getByRole('button', { name: copy.confirm.save }));
  await expect(args.onSave).toHaveBeenCalledWith('A different review');
} };
export const MaximumName: Story = { args: { initialName: 'a'.repeat(80) }, play: async ({ canvasElement, args }) => {
  const d = await openDialog(canvasElement);
  await userEvent.click(d.getByRole('button', { name: copy.confirm.save }));
  await expect(args.onSave).toHaveBeenCalledWith(args.initialName);
} };
export const SaveFailure: Story = { args: { onSave: fn(async () => { throw new Error('Simulated save failure'); }) }, play: async ({ canvasElement, args }) => {
  const d = await openDialog(canvasElement);
  await userEvent.clear(d.getByRole('textbox'));
  await userEvent.type(d.getByRole('textbox'), 'Keep this draft');
  await userEvent.click(d.getByRole('button', { name: copy.confirm.save }));
  await expect(await d.findByRole('alert')).toBeVisible();
  await expect(d.getByRole('textbox')).toHaveValue('Keep this draft');
  await userEvent.click(d.getByRole('button', { name: copy.confirm.save }));
  await expect(args.onSave).toHaveBeenCalledTimes(2);
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const d = await openDialog(canvasElement);
  await expect(d.getByRole('textbox')).toBeDisabled();
  for (const button of d.getAllByRole('button')) await expect(button).toBeDisabled();
  await userEvent.keyboard('{Escape}');
  await expect(d.getByRole('status')).toHaveTextContent(copy.saving);
  await expect(args.onSave).not.toHaveBeenCalled();
  await expect(args.onClose).not.toHaveBeenCalled();
} };
export const PermissionRevoked: Story = { args: { canSave: false }, play: async ({ canvasElement, args }) => {
  const d = await openDialog(canvasElement);
  await expect(d.getByRole('alert')).toHaveTextContent(copy.denied);
  await expect(d.getByRole('textbox')).toBeDisabled();
  await expect(d.getByRole('button', { name: copy.confirm.save })).toBeDisabled();
  await expect(args.onSave).not.toHaveBeenCalled();
} };
export const CancelAndReopen: Story = { play: async ({ canvasElement, args }) => {
  const d = await openDialog(canvasElement);
  await userEvent.clear(d.getByRole('textbox'));
  await userEvent.type(d.getByRole('textbox'), 'Discard me');
  await userEvent.click(d.getByRole('button', { name: 'Cancel' }));
  const c = within(canvasElement);
  await waitFor(() => expect(c.getByRole('button', { name: 'Open template dialog' })).toHaveFocus());
  const reopened = await openDialog(canvasElement);
  await expect(reopened.getByRole('textbox')).toHaveValue(args.initialName);
  await userEvent.keyboard('{Escape}');
  await expect(args.onClose).toHaveBeenCalledTimes(2);
  await expect(args.onSave).not.toHaveBeenCalled();
} };
export const KeyboardSave: Story = { play: async ({ canvasElement, args }) => {
  const d = await openDialog(canvasElement);
  await expect(d.getByRole('textbox')).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await expect(args.onSave).toHaveBeenCalledWith(args.initialName);
} };
export const LongContext: Story = { args: { reportLabel: 'LongReportAreaNameWithoutSpaces'.repeat(8), initialName: 'a'.repeat(80) } };
