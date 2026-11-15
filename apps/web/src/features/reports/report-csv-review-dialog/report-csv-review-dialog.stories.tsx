import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ReportCsvReviewDialog, type ReportCsvReviewDialogProps } from './report-csv-review-dialog';
import { reportCsvReviewDialogData as copy } from './report-csv-review-dialog.data';

const preview = {
  id: 'review-1', reportLabel: 'Leads and pipeline', viewLabel: 'New leads',
  periodLabel: 'Oct 7 to Nov 5, 2026, both dates included', dateBasisLabel: 'Lead creation date',
  timezone: 'Europe/Warsaw', filtersLabel: 'All authorized assignments / All sources',
  scopeLabel: 'Workspace scope within underlying grants. Archives excluded.',
  filename: 'salesmora-new-leads.csv', expectedRows: 137,
};
function Preview(args: ReportCsvReviewDialogProps) {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" className="min-h-11 bg-paper p-4" onClick={() => setOpen(true)}>Review export</button>
    <ReportCsvReviewDialog {...args} open={open} onClose={() => { args.onClose(); setOpen(false); }} />
  </>;
}
const meta = {
  title: 'Reports/ReportCsvReviewDialog', component: ReportCsvReviewDialog, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'CSV scope review using the shared async ConfirmDialog boundary. Fictional server-preview metadata and mocked download callbacks only: no file, stream or audit event. Hosts must bind configuration/review ID, reauthorize, recount, enforce 50,000 rows/32 MiB/time limits and close only after their real download handoff succeeds. Preview row count is not a frozen result. Denied/non-ready previews cannot download. Refresh requests new review; errors propagate through ConfirmDialog and never claim success.' } } },
  render: args => <Preview {...args} />,
  args: { open: false, canExport: true, state: { kind: 'ready', preview }, onClose: fn(), onRefresh: fn(), onDownload: fn(async () => {}) },
} satisfies Meta<typeof ReportCsvReviewDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
async function openDialog(canvasElement: HTMLElement) {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Review export' }));
  const dialog = await within(canvasElement.ownerDocument.body).findByRole('alertdialog', { name: copy.title });
  await waitFor(() => expect(dialog).toBeVisible());
  return within(dialog);
}
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = await openDialog(canvasElement);
  await expect(c.getByText('137')).toBeVisible();
  await expect(c.getByText(preview.filename)).toBeVisible();
  await expect(c.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  await userEvent.click(c.getByRole('button', { name: copy.confirm }));
  await expect(args.onDownload).toHaveBeenCalledWith('review-1');
} };
export const Cancel: Story = { play: async ({ canvasElement, args }) => {
  await openDialog(canvasElement);
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('alertdialog')).not.toBeInTheDocument());
  await expect(args.onClose).toHaveBeenCalledTimes(1);
  await expect(args.onDownload).not.toHaveBeenCalled();
  await expect(within(canvasElement).getByRole('button')).toHaveFocus();
} };
export const Loading: Story = { args: { state: { kind: 'loading' } }, play: async ({ canvasElement }) => {
  const c = await openDialog(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent(copy.loading);
  await expect(c.getByRole('button', { name: copy.confirm })).toBeDisabled();
} };
export const PermissionDenied: Story = { args: { canExport: false }, play: async ({ canvasElement }) => {
  const c = await openDialog(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.denied);
  await expect(c.queryByText(preview.filename)).not.toBeInTheDocument();
  await expect(c.getByRole('button', { name: copy.confirm })).toBeDisabled();
} };
export const ChangedCount: Story = { args: { state: { kind: 'changed' } }, play: async ({ canvasElement, args }) => {
  const c = await openDialog(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.changed);
  await expect(c.getByRole('button', { name: copy.confirm })).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: copy.refresh }));
  await expect(args.onRefresh).toHaveBeenCalledTimes(1);
} };
export const ByteLimit: Story = { args: { state: { kind: 'limit' } }, play: async ({ canvasElement }) => {
  await expect((await openDialog(canvasElement)).getByRole('alert')).toHaveTextContent(copy.limit);
} };
export const RowLimit: Story = { args: { state: { kind: 'ready', preview: { ...preview, expectedRows: 50_001 } } }, play: async ({ canvasElement }) => {
  const c = await openDialog(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.limit);
  await expect(c.getByRole('button', { name: copy.confirm })).toBeDisabled();
} };
export const MaximumRows: Story = { args: { state: { kind: 'ready', preview: { ...preview, expectedRows: 50_000 } } }, play: async ({ canvasElement }) => {
  await expect((await openDialog(canvasElement)).getByRole('button', { name: copy.confirm })).toBeEnabled();
} };
export const InvalidPreview: Story = { args: { state: { kind: 'ready', preview: { ...preview, expectedRows: 0 } } }, play: async ({ canvasElement }) => {
  const c = await openDialog(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.invalid);
  await expect(c.getByRole('button', { name: copy.confirm })).toBeDisabled();
} };
export const PreviewError: Story = { args: { state: { kind: 'error' } }, play: async ({ canvasElement }) => {
  await expect((await openDialog(canvasElement)).getByRole('alert')).toHaveTextContent(copy.failed);
} };
export const DownloadFailure: Story = { args: { onDownload: fn(async () => { throw new Error('Mock download failure'); }) }, play: async ({ canvasElement, args }) => {
  const c = await openDialog(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.confirm }));
  await expect(await c.findByRole('alert')).toBeVisible();
  await expect(c.getByText(preview.filename)).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: copy.confirm }));
  await expect(args.onDownload).toHaveBeenCalledTimes(2);
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement }) => {
  const c = await openDialog(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent(copy.pending);
  for (const button of c.getAllByRole('button').filter(button => !button.hasAttribute('aria-haspopup'))) await expect(button).toBeDisabled();
} };
export const DownloadTooltip: Story = { play: async ({ canvasElement, args }) => {
  const c = await openDialog(canvasElement), body = within(canvasElement.ownerDocument.body);
  for (const text of [copy.freshness, copy.limits, copy.money]) await expect(c.queryByText(text)).not.toBeInTheDocument();
  const trigger = c.getByRole('button', { name: 'About CSV downloads' });
  await userEvent.click(trigger);
  const dialog = await body.findByRole('dialog', { name: 'About CSV downloads' });
  await waitFor(() => expect(dialog).toBeVisible());
  for (const text of [copy.freshness, copy.limits, copy.money]) await expect(within(dialog).getByText(text)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog', { name: 'About CSV downloads' })).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
  await expect(c.getByRole('button', { name: copy.confirm })).toBeVisible();
  await expect(args.onClose).not.toHaveBeenCalled();
} };
export const LongContent: Story = { args: { state: { kind: 'ready', preview: { ...preview, scopeLabel: 'Authorized-export-scope-'.repeat(30), filename: 'salesmora-report-'.repeat(12) + '.csv' } } }, play: async ({ canvasElement }) => { await openDialog(canvasElement); } };
