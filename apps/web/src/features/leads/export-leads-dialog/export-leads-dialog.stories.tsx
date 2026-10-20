import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { Toast } from '@salesmora/ui';
import { ExportLeadsDialog, type ExportLeadsDialogProps } from './export-leads-dialog';
import { exportLeadsDialogData as copy } from './export-leads-dialog.data';

type PreviewProps = Omit<ExportLeadsDialogProps, 'open' | 'onClose'> & { failOnce?: boolean };
function Preview({ error: initialError, onConfirm, failOnce, ...args }: PreviewProps) {
  const [open, setOpen] = useState(true), [saved, setSaved] = useState(false);
  const [error, setError] = useState(initialError), [failed, setFailed] = useState(false);
  return <>
    <button type="button" onClick={() => { setError(initialError); setOpen(true); }} className="min-h-11 cursor-pointer rounded-xl bg-primary px-5 font-semibold text-white focus-visible:focus-ring">{copy.stories.open}</button>
    <ExportLeadsDialog {...args} open={open} error={error} onClose={() => setOpen(false)} onConfirm={async request => {
      await onConfirm(request);
      if (failOnce && !failed) { setFailed(true); setError(copy.stories.failure); throw new globalThis.Error('Mock export failure'); }
      setOpen(false); setSaved(true);
    }}/>
    <Toast open={saved} kind="success" message={copy.stories.success} autoHideMs={2000} onClose={() => setSaved(false)}/>
  </>;
}
const meta = {
  title: 'Leads/ExportLeadsDialog', component: Preview, parameters: { layout: 'fullscreen' },
  args: { filters: copy.stories.filterValues, filterLabels: copy.stories.filters, scope: 'workspace', count: 142, rowLimit: 50000, canExport: true, onConfirm: fn() },
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
export const Error: Story = { args: { error: copy.stories.failure } };
export const NoPermission: Story = { args: { canExport: false }, play: async ({ canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body);
  await expect(body.getByRole('button', { name: copy.confirm })).toBeDisabled();
  fireEvent.submit(body.getByRole('alertdialog').querySelector('form')!);
  await expect(args.onConfirm).not.toHaveBeenCalled();
} };
export const Large: Story = { args: { count: 50000 } };
export const OverLimit: Story = { args: { count: 50001 }, play: NoPermission.play };
export const Empty: Story = { args: { count: 0 }, play: NoPermission.play };
export const Loading: Story = { args: { loading: true, count: null }, play: NoPermission.play };
export const CountUnavailable: Story = { args: { count: null }, play: NoPermission.play };
export const AssignedScope: Story = { args: { scope: 'assigned', count: 17 } };
export const ArchivedIncluded: Story = { args: { filters: copy.stories.archivedFilterValues, filterLabels: [] } };
export const LongFilters: Story = { args: { filterLabels: [...copy.stories.filters, copy.stories.longFilter] } };
export const Narrow: Story = { ...LongFilters, parameters: { viewport: { value: 'phone' } } };
export const Confirm: Story = { play: async ({ canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body);
  await waitFor(() => expect(body.getByText(copy.count(args.count!))).toBeVisible());
  await userEvent.click(body.getByRole('button', { name: copy.confirm }));
  await waitFor(() => expect(args.onConfirm).toHaveBeenCalledWith({ filters: args.filters }));
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
