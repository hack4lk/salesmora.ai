import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ReportRecordEvidenceDialog, type ReportRecordEvidenceDialogProps } from './report-record-evidence-dialog';
import { reportRecordEvidenceDialogData as copy } from './report-record-evidence-dialog.data';

function Preview(args: ReportRecordEvidenceDialogProps) {
  const [open, setOpen] = useState(args.open);
  return <>
    <button type="button" className="min-h-11 rounded-lg bg-paper p-4" onClick={() => setOpen(true)}>Review record evidence</button>
    <ReportRecordEvidenceDialog {...args} open={open} onClose={() => { args.onClose(); setOpen(false); }} />
  </>;
}
const evidence = {
  label: 'Kitchen inquiry',
  contextLabel: 'New leads / Lead creation date / Oct 7 to Nov 5, 2026 / Europe/Warsaw',
  recordId: 'lead-101',
  fields: [{ label: 'Record identity', value: 'L-101' }, { label: 'Evidence summary', value: 'Created Oct 12, 2026; source Referral; assigned to Me.' }],
};
const meta = {
  title: 'Reports/ReportRecordEvidenceDialog',
  component: ReportRecordEvidenceDialog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Read-only evidence handoff from the approved connected prototype. Hosts fetch safe currently authorized fields for the selected record/event and own canonical record navigation. No editor, raw activity payload, API or authorization inference. Loading/error/missing/denied states never expose supplied stale fields. Closing remains available during loading or navigation; hosts handle request cancellation and stale responses.' } } },
  render: args => <Preview {...args} />,
  args: { open: false, canRead: true, state: { kind: 'ready', evidence }, onClose: fn(), onRetry: fn(), onOpenRecord: fn() },
} satisfies Meta<typeof ReportRecordEvidenceDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
async function openDialog(canvasElement: HTMLElement) {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Review record evidence' }));
  const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog', { name: copy.title });
  await waitFor(() => expect(dialog).toBeVisible());
  return within(dialog);
}
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = await openDialog(canvasElement);
  await expect(c.getByText(evidence.label)).toBeVisible();
  await expect(c.getByRole('button', { name: copy.close })).toHaveFocus();
  await userEvent.click(c.getByRole('button', { name: copy.open }));
  await expect(args.onOpenRecord).toHaveBeenCalledWith('lead-101');
} };
export const CloseAndReopen: Story = { play: async ({ canvasElement, args }) => {
  const c = await openDialog(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.close }));
  await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('dialog')).not.toBeInTheDocument());
  await expect(within(canvasElement).getByRole('button')).toHaveFocus();
  await expect(args.onClose).toHaveBeenCalledTimes(1);
  await openDialog(canvasElement);
} };
export const Escape: Story = { play: async ({ canvasElement, args }) => {
  await openDialog(canvasElement);
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('dialog')).not.toBeInTheDocument());
  await expect(args.onClose).toHaveBeenCalledTimes(1);
  await expect(within(canvasElement).getByRole('button')).toHaveFocus();
} };
export const Loading: Story = { args: { state: { kind: 'loading' } }, play: async ({ canvasElement }) => {
  const c = await openDialog(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent(copy.loading);
  await expect(c.queryByText(evidence.label)).not.toBeInTheDocument();
} };
export const Error: Story = { args: { state: { kind: 'error' } }, play: async ({ canvasElement, args }) => {
  const c = await openDialog(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.failed);
  await userEvent.click(c.getByRole('button', { name: copy.retry }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const Missing: Story = { args: { state: { kind: 'missing' } }, play: async ({ canvasElement }) => {
  await expect((await openDialog(canvasElement)).getByRole('alert')).toHaveTextContent(copy.missing);
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = await openDialog(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.denied);
  await expect(c.queryByText(evidence.label)).not.toBeInTheDocument();
  await expect(c.queryByRole('button', { name: copy.open })).not.toBeInTheDocument();
} };
export const NoCanonicalAccess: Story = { args: { state: { kind: 'ready', evidence: { ...evidence, recordId: undefined } } }, play: async ({ canvasElement }) => {
  await expect((await openDialog(canvasElement)).queryByRole('button', { name: copy.open })).not.toBeInTheDocument();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = await openDialog(canvasElement);
  await expect(c.getByRole('button', { name: copy.open })).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: copy.open }));
  await expect(args.onOpenRecord).not.toHaveBeenCalled();
  await expect(c.getByRole('button', { name: copy.close })).toBeEnabled();
} };
export const UnknownAndZero: Story = { args: { state: { kind: 'ready', evidence: { ...evidence, fields: [{ label: 'Cost', value: null }, { label: 'Recorded zero', value: 'PLN 0.00' }] } } }, play: async ({ canvasElement }) => {
  const c = await openDialog(canvasElement);
  await expect(c.getByText(copy.unknown)).toBeVisible();
  await expect(c.getByText('PLN 0.00')).toBeVisible();
} };
export const LongContent: Story = { args: { state: { kind: 'ready', evidence: { ...evidence, label: 'Long-record-label-'.repeat(20), fields: [{ label: 'Evidence summary', value: 'Authorized-evidence-'.repeat(100) }] } } }, play: async ({ canvasElement }) => { await openDialog(canvasElement); } };
