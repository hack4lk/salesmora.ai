import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { CaptureChatResult, CaptureChatTicket } from '@salesmora/contracts';
import { ConnectedCaptureRead } from './connected-capture-read';
import { captureAssistantWorkspace as workspaceId, captureAssistantSource as sourceId } from './capture-result.fixtures';
import { captureAssistantResultData as copy } from './capture-result.data';
const resultId = '00000000-0000-4000-8000-000000000003', turnId = '00000000-0000-4000-8000-000000000004';
const source = { id: sourceId, workspaceId, version: 1, name: 'Fictional connected source', type: 'website' as const, status: 'draft' as const, block: 'none' as const, approvedVersion: null, draftVersion: 1, lastActivityAt: null, scheduledAt: null, timezone: null, metrics: { captured: 0, awaitingReview: 0, approved: 0 } };
const base = { id: resultId, workspaceId, retrievedAt: '2026-11-02T12:00:00Z', timezone: 'America/New_York' };
const summary: CaptureChatResult = { ...base, operation: 'source_summary', source };
function ticket(operation: CaptureChatTicket['operation'] = 'source_summary'): CaptureChatTicket { return { workspaceId, turnId, resultId, operation, snapshotHash: 'a'.repeat(64) }; }
let posts: unknown[];
function mock(result: CaptureChatResult = summary, mode: 'ready' | 'denied' | 'mismatch' | 'unsafe' | 'revoke' = 'ready') {
  const original = globalThis.fetch; let reads = 0; posts = [];
  globalThis.fetch = fn(async (input, options) => {
    if (!String(input).startsWith('/api/chat/lead-capture')) throw Error('Unexpected preview API request');
    if (options?.method === 'POST') { posts.push(JSON.parse(String(options.body))); return Response.json({ href: mode === 'unsafe' ? 'https://invalid.example/lead-capture' : `/lead-capture/${sourceId}?workspace=${workspaceId}` }); }
    if (mode === 'denied' || mode === 'revoke' && reads++ > 0) return Response.json({ error: 'access_denied' }, { status: 403 });
    return Response.json({ result: mode === 'mismatch' ? { ...result, id: turnId } : result });
  });
  return () => { globalThis.fetch = original; };
}
const meta = { title: 'Assistant/ConnectedCaptureRead', component: ConnectedCaptureRead,
  args: { ticket: ticket(), disabled: false, onNavigate: fn() }, beforeEach: () => mock(), parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4"><h1 className="text-xl text-ink">Connected Lead Capture reads</h1><p className="text-sm text-muted">{copy.stories.notice}</p><div className="mx-auto max-w-4xl"><Story /></div></main>],
} satisfies Meta<typeof ConnectedCaptureRead>;
export default meta; type Story = StoryObj<typeof meta>;
export const Summary: Story = { play: async ({ canvasElement }) => { await expect(await within(canvasElement).findByText(source.name)).toBeVisible(); } };
export const AuthorizedNavigation: Story = { play: async ({ canvasElement, args }) => {
  await userEvent.click(await within(canvasElement).findByRole('button', { name: copy.open }));
  await expect(args.onNavigate).toHaveBeenCalledWith(`/lead-capture/${sourceId}?workspace=${workspaceId}`);
  await expect(posts).toEqual([{ workspaceId, turnId, resultId, snapshotHash: 'a'.repeat(64), sourceId }]);
} };
export const UnsafeNavigation: Story = { beforeEach: () => mock(summary, 'unsafe'), play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(await c.findByRole('button', { name: copy.open }));
  await expect(await c.findByText(copy.unavailable)).toBeVisible(); await expect(args.onNavigate).not.toHaveBeenCalled();
} };
export const Denied: Story = { beforeEach: () => mock(summary, 'denied'), play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(await c.findByText(copy.unavailable)).toBeVisible(); await expect(c.queryByText(source.name)).not.toBeInTheDocument(); } };
export const MismatchedResult: Story = { beforeEach: () => mock(summary, 'mismatch'), play: async ({ canvasElement }) => { await expect(await within(canvasElement).findByText(copy.unavailable)).toBeVisible(); } };
export const RefreshedRevocation: Story = { beforeEach: () => mock(summary, 'revoke'), play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(await c.findByText(source.name)).toBeVisible(); window.dispatchEvent(new Event('focus')); await expect(await c.findByText(copy.unavailable)).toBeVisible(); await expect(c.queryByText(source.name)).not.toBeInTheDocument();
} };
export const SavedConfiguration: Story = { args: { ticket: ticket('source_details') }, beforeEach: () => mock({ ...base, operation: 'source_details', installation: null, detail: { source, approved: null, draft: { id: resultId, version: 1, baseApprovedVersion: null, configuration: { schemaVersion: 1, type: 'website' } } } }), play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(await c.findByText('Draft configuration')).toBeVisible();
} };
export const PublicationReadiness: Story = { args: { ticket: ticket('publication_review') }, beforeEach: () => mock({ ...base, operation: 'publication_review', source, review: { sourceId, sourceVersion: 1, draftVersion: 1, baseApprovedVersion: null, configurationVersion: 1, canActivate: false, ready: false, plan: 'free', used: 0, limit: 1, checks: [{ code: 'delivery', ready: false }], pending: null } }), play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(await c.findByText('Delivery configuration')).toBeVisible(); await expect(c.queryByRole('button', { name: /launch/i })).not.toBeInTheDocument(); } };
export const NoInstallation: Story = { args: { ticket: ticket('installation') }, beforeEach: () => mock({ ...base, operation: 'installation', source, installation: null }), play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(await c.findByText(/Review and launch this capture source/)).toBeVisible(); await expect(c.queryByRole('button', { name: 'Copy link' })).not.toBeInTheDocument(); } };
