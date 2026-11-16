import { useState } from 'react';
import { useIsMutating } from '@tanstack/react-query';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { ConnectedCustomerResult } from './customer-result';
import { customerResultData as copy } from './customer-result.data';
import { customerRecordDraft, customerRecordResult, recordId, recordTurnId, recordWorkspace as workspaceId } from '../record-result.fixtures';
import { ApiRequestError } from '../../api/api-request';

let posts: { path: string; body: Record<string, unknown> }[], download: ReturnType<typeof fn>, blobs: Blob[];
let release: (() => void) | undefined;
function mock(mode: 'ready' | 'denied' | 'mismatch' | 'retry' | 'unsafe' | 'late' = 'ready', action = customerRecordDraft().action) {
  const original = globalThis.fetch, originalCreate = URL.createObjectURL, originalClick = HTMLAnchorElement.prototype.click;
  posts = []; blobs = []; release = undefined; download = fn();
  URL.createObjectURL = blob => { if (blob instanceof Blob) blobs.push(blob); return 'blob:fictional-customer'; };
  HTMLAnchorElement.prototype.click = function () { download(this.download); };
  globalThis.fetch = fn(async (input, options) => {
    const path = String(input), body = JSON.parse(String(options?.body));
    if (!path.startsWith('/api/chat/customers/')) throw Error('Unexpected customer preview request.');
    posts.push({ path, body });
    if (mode === 'late') await new Promise<void>(resolve => { release = resolve; });
    if (mode === 'denied' || mode === 'retry' && posts.length === 1) return Response.json({}, { status: mode === 'denied' ? 403 : 503 });
    if (path.endsWith('/navigate')) return Response.json({ href: mode === 'unsafe'
      ? `/customers/${recordId}?workspace=${recordId}`
      : `/${body.kind === 'lead' ? 'leads' : 'customers'}/${body.recordId}?workspace=${workspaceId}` });
    const draft = customerRecordDraft(action);
    return Response.json({ draft: { ...draft, id: mode === 'mismatch' ? recordId : body.draftId, inputHash: body.inputHash, state: body.decision === 'confirm' ? 'confirmed' : 'canceled' } });
  });
  return () => { globalThis.fetch = original; URL.createObjectURL = originalCreate; HTMLAnchorElement.prototype.click = originalClick; };
}
const meta = {
  title: 'Assistant/ConnectedCustomerResult', component: ConnectedCustomerResult,
  args: { result: customerRecordResult(), workspaceId, disabled: false, onRefresh: fn(async () => {}), onNavigate: fn() },
  beforeEach: () => mock(), parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="mx-auto max-w-3xl bg-canvas p-4"><h1 className="text-xl">Fictional connected customer review</h1><Story /></main>],
} satisfies Meta<typeof ConnectedCustomerResult>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Confirm: Story = { play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Confirm change' }));
  await waitFor(() => expect(args.onRefresh).toHaveBeenCalledWith(false));
  await expect(posts[0].body).toEqual({ workspaceId, draftId: args.result.draft!.id, inputHash: args.result.draft!.inputHash, decision: 'confirm' });
} };
export const Cancel: Story = { play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(args.onRefresh).toHaveBeenCalled());
  await expect(posts[0].body.decision).toBe('cancel');
} };
export const TypedDeletion: Story = {
  args: { result: customerRecordResult(customerRecordDraft('delete')) },
  beforeEach: () => mock('ready', 'delete'),
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement), confirm = c.getByRole('button', { name: 'Confirm change' });
    await expect(confirm).toBeDisabled();
    fireEvent.change(c.getByRole('textbox'), { target: { value: 'C-1042' } });
    await userEvent.click(c.getByRole('checkbox')); await userEvent.click(confirm);
    await waitFor(() => expect(args.onRefresh).toHaveBeenCalledWith(true));
    await expect(posts[0].body).toMatchObject({ typedConfirmation: 'C-1042', unlinkOpenLeads: true });
  },
};
export const MismatchedReceipt: Story = { beforeEach: () => mock('mismatch'), play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Confirm change' }));
  await expect(await c.findByText(copy.failed)).toBeVisible(); await expect(args.onRefresh).not.toHaveBeenCalled();
} };
export const Denied: Story = { beforeEach: () => mock('denied'), play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Confirm change' }));
  await expect(await c.findByText(copy.failed)).toBeVisible(); await expect(c.queryByText('Fictional Customer')).not.toBeInTheDocument();
  await expect(c.queryByRole('button', { name: 'Confirm change' })).not.toBeInTheDocument();
} };
export const ExactRetry: Story = { beforeEach: () => mock('retry'), play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Confirm change' }));
  await expect(await c.findByText(copy.failed)).toBeVisible(); await expect(posts).toHaveLength(1);
  await userEvent.click(c.getByRole('button', { name: 'Confirm change' }));
  await waitFor(() => expect(args.onRefresh).toHaveBeenCalledTimes(2));
  await expect(posts[0]).toEqual(posts[1]);
} };
const records = { ...customerRecordResult(), draft: undefined, kind: 'search' as const, records: [{ id: recordId, number: 'C-1042', name: 'Fictional Customer', detail: 'Fictional record' }], total: 1 };
export const Navigation: Story = { args: { result: records }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button'));
  await waitFor(() => expect(args.onNavigate).toHaveBeenCalledWith(`/customers/${recordId}?workspace=${workspaceId}`));
  await expect(posts[0].body).toEqual({ workspaceId, turnId: recordTurnId, recordId, kind: 'customer' });
} };
export const LeadNavigation: Story = { args: { result: { ...records, kind: 'linked_leads' } }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button'));
  await waitFor(() => expect(args.onNavigate).toHaveBeenCalledWith(`/leads/${recordId}?workspace=${workspaceId}`));
} };
export const ChangedWorkspaceNavigation: Story = { args: { result: records }, beforeEach: () => mock('unsafe'), play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button'));
  await expect(await c.findByText(copy.failed)).toBeVisible(); await expect(args.onNavigate).not.toHaveBeenCalled();
} };
export const DisabledDuringNavigation: Story = {
  args: { result: records }, beforeEach: () => mock('late'),
  render: function Host(args) { const [disabled, setDisabled] = useState(false), pending = useIsMutating(); return <><button onClick={() => setDisabled(true)}>Disable result</button><p role="status" aria-label="Navigation request">{pending ? 'Navigation pending' : 'Navigation settled'}</p><ConnectedCustomerResult {...args} disabled={disabled} /></>; },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement); await userEvent.click(c.getAllByRole('button')[1]);
    await waitFor(() => expect(typeof release).toBe('function'));
    await expect(c.getByRole('status', { name: 'Navigation request' })).toHaveTextContent('Navigation pending');
    await userEvent.click(c.getByRole('button', { name: 'Disable result' })); release!();
    await waitFor(() => expect(c.getByRole('status', { name: 'Navigation request' })).toHaveTextContent('Navigation settled'));
    await expect(args.onNavigate).not.toHaveBeenCalled();
  },
};
export const CsvExport: Story = {
  args: { result: customerRecordResult(customerRecordDraft('export')) },
  beforeEach: () => {
    const cleanup = mock();
    globalThis.fetch = fn(async (_input, options) => { posts.push({ path: '/api/chat/customers/actions', body: JSON.parse(String(options?.body)) }); return new Response('Name,Phone\nFictional,555-0101', { headers: { 'Content-Type': 'text/csv' } }); });
    return cleanup;
  },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Download CSV' }));
    await waitFor(() => expect(download).toHaveBeenCalledWith('customers.csv'));
    await expect(await blobs[0].text()).toBe('Name,Phone\nFictional,555-0101');
    await expect(args.onRefresh).toHaveBeenCalledWith(false);
  },
};
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: 'Confirm change' })).toBeDisabled(); await expect(posts).toHaveLength(0);
} };
export const ReconciliationFailure: Story = { args: { onRefresh: fn(async () => { throw new ApiRequestError('Refresh unavailable.', 503, undefined); }) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Confirm change' }));
  await expect(await c.findByText(copy.failed)).toBeVisible(); await expect(args.onRefresh).toHaveBeenCalledTimes(1); await expect(posts).toHaveLength(1);
} };
