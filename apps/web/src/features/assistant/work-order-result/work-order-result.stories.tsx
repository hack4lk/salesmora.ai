import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ConnectedWorkOrderResult } from './work-order-result';
import { workOrderResultData as copy } from './work-order-result.data';
import { workOrderRecordDraft, workOrderRecordResult, recordId, recordWorkspace as workspaceId } from '../record-result.fixtures';
import { ApiRequestError } from '../../api/api-request';
let posts: Record<string, unknown>[], download: ReturnType<typeof fn>, blobs: Blob[];
let release: (() => void) | undefined, signal: AbortSignal | undefined;
function mock(action = workOrderRecordDraft().action, mode: 'ready' | 'denied' | 'mismatch' | 'retry' | 'csv' | 'late' = 'ready') {
  const original = globalThis.fetch, originalCreate = URL.createObjectURL, originalClick = HTMLAnchorElement.prototype.click;
  posts = []; blobs = []; download = fn(); release = undefined; signal = undefined;
  URL.createObjectURL = blob => { if (blob instanceof Blob) blobs.push(blob); return 'blob:fictional-work-order'; };
  HTMLAnchorElement.prototype.click = function () { download(this.download); };
  globalThis.fetch = fn(async (input, options) => {
    if (String(input) !== '/api/chat/work-orders/actions') throw Error('Unexpected Work Order preview request.');
    const body = JSON.parse(String(options?.body)); posts.push(body);
    signal = options?.signal ?? undefined;
    if (mode === 'late') await new Promise<void>(resolve => { release = resolve; });
    if (mode === 'denied' || mode === 'retry' && posts.length === 1) return Response.json({}, { status: mode === 'denied' ? 403 : 503 });
    if (mode === 'csv') return new Response('Name\nFictional item', { headers: { 'Content-Type': 'text/csv' } });
    return Response.json({ draft: { ...workOrderRecordDraft(action), id: mode === 'mismatch' ? recordId : body.draftId, inputHash: body.inputHash, state: body.decision === 'confirm' ? 'confirmed' : 'canceled' } });
  });
  return () => { globalThis.fetch = original; URL.createObjectURL = originalCreate; HTMLAnchorElement.prototype.click = originalClick; };
}
const meta = {
  title: 'Assistant/ConnectedWorkOrderResult', component: ConnectedWorkOrderResult,
  args: { result: workOrderRecordResult(), workspaceId, disabled: false, onRefresh: fn(async () => {}), onNavigate: fn() },
  beforeEach: () => mock(), parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="mx-auto max-w-3xl bg-canvas p-4"><h1 className="text-xl">Fictional connected Work Order review</h1><Story /></main>],
} satisfies Meta<typeof ConnectedWorkOrderResult>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Confirm: Story = { play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Confirm change' }));
  await waitFor(() => expect(args.onRefresh).toHaveBeenCalledTimes(1));
  await expect(posts).toEqual([{ workspaceId, draftId: args.result.draft!.id, inputHash: args.result.draft!.inputHash, decision: 'confirm' }]);
} };
export const Cancel: Story = { play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(args.onRefresh).toHaveBeenCalledTimes(1)); await expect(posts[0].decision).toBe('cancel');
} };
export const MaterialDecision: Story = { args: { result: workOrderRecordResult(workOrderRecordDraft('material-archive')) }, beforeEach: () => mock('material-archive'), play: Confirm.play };
export const MismatchedReceipt: Story = { beforeEach: () => mock('edit', 'mismatch'), play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Confirm change' }));
  await expect(await c.findByText(copy.failed)).toBeVisible(); await expect(args.onRefresh).not.toHaveBeenCalled();
} };
export const Denied: Story = { beforeEach: () => mock('edit', 'denied'), play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Confirm change' }));
  await expect(await c.findByText(copy.failed)).toBeVisible(); await expect(c.queryByRole('button', { name: 'Confirm change' })).not.toBeInTheDocument();
} };
export const ExactRetry: Story = { beforeEach: () => mock('edit', 'retry'), play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Confirm change' }));
  await expect(await c.findByText(copy.failed)).toBeVisible(); await expect(posts).toHaveLength(1);
  await userEvent.click(c.getByRole('button', { name: 'Confirm change' }));
  await waitFor(() => expect(args.onRefresh).toHaveBeenCalledTimes(2)); await expect(posts[0]).toEqual(posts[1]);
} };
export const OpenConfirmed: Story = { args: { result: workOrderRecordResult({ ...workOrderRecordDraft(), state: 'confirmed' }) }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open work order' }));
  await expect(args.onNavigate).toHaveBeenCalledWith(`/work-orders/${recordId}?workspace=${workspaceId}`);
} };
export const CsvExport: Story = { args: { result: workOrderRecordResult(workOrderRecordDraft('export')) }, beforeEach: () => mock('export', 'csv'), play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Download CSV' }));
  await waitFor(() => expect(download).toHaveBeenCalledWith('work-orders.csv'));
  await expect(await blobs[0].text()).toBe('Name\nFictional item'); await expect(args.onRefresh).toHaveBeenCalledTimes(1);
} };
export const MaterialCsvExport: Story = { args: { result: workOrderRecordResult(workOrderRecordDraft('material-export')) }, beforeEach: () => mock('material-export', 'csv'), play: async ({ canvasElement }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Download CSV' }));
  await waitFor(() => expect(download).toHaveBeenCalledWith('materials.csv'));
  await expect(await blobs[0].text()).toBe('Name\nFictional item');
} };
export const CancelExport: Story = { args: { result: workOrderRecordResult(workOrderRecordDraft('export')) }, beforeEach: () => mock('export'), play: Cancel.play };
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: 'Confirm change' })).toBeDisabled(); await expect(posts).toHaveLength(0);
} };
export const SingleFlight: Story = { beforeEach: () => mock('edit', 'late'), play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), confirm = c.getByRole('button', { name: 'Confirm change' });
  await userEvent.dblClick(confirm);
  await expect(posts).toHaveLength(1); await expect(confirm).toBeDisabled();
  release!();
  await waitFor(() => expect(args.onRefresh).toHaveBeenCalledTimes(1));
} };
export const UnmountedDecision: Story = {
  beforeEach: () => mock('edit', 'late'),
  render: function Host(args) { const [visible, setVisible] = useState(true), pending = useIsMutating(); return <><button onClick={() => setVisible(false)}>Remove result</button><p role="status" aria-label="Decision request">{pending ? 'Decision pending' : 'Decision settled'}</p>{visible && <ConnectedWorkOrderResult {...args} />}</>; },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Confirm change' }));
    await expect(c.getByRole('status', { name: 'Decision request' })).toHaveTextContent('Decision pending');
    await userEvent.click(c.getByRole('button', { name: 'Remove result' }));
    await expect(signal?.aborted).toBe(true);
    release!();
    await waitFor(() => expect(c.getByRole('status', { name: 'Decision request' })).toHaveTextContent('Decision settled'));
    await expect(args.onRefresh).not.toHaveBeenCalled();
  },
};
export const ReconciliationFailure: Story = { args: { onRefresh: fn(async () => { throw new ApiRequestError('Refresh unavailable.', 503, undefined); }) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Confirm change' }));
  await expect(await c.findByText(copy.failed)).toBeVisible(); await expect(args.onRefresh).toHaveBeenCalledTimes(1); await expect(posts).toHaveLength(1);
} };
import { useState } from 'react';
import { useIsMutating } from '@tanstack/react-query';
