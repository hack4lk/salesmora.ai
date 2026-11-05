import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { initialCaptureSetupConfiguration, type CaptureSourceProposalView, type captureSourceOperations } from '@salesmora/contracts';
import { ConnectedCaptureSource } from './connected-capture-source';
import { captureAssistantResultData as copy } from './capture-result.data';
type Operation = typeof captureSourceOperations[number];
const workspaceId = '00000000-0000-4000-8000-000000000001', sourceId = '00000000-0000-4000-8000-000000000002', proposalId = '00000000-0000-4000-8000-000000000003', transitionId = '00000000-0000-4000-8000-000000000004', copyId = '00000000-0000-4000-8000-000000000005';
function fixture(operation: Operation = 'publish', blocked = false): CaptureSourceProposalView {
  const config = initialCaptureSetupConfiguration('website', { businessName: 'Fictional repairs', businessEmail: '', businessPhone: '' });
  const status = operation === 'publish' ? 'draft' : operation === 'restore' ? 'archived' : operation === 'resume' || operation === 'duplicate' ? 'paused' : operation === 'change_schedule' || operation === 'cancel_schedule' ? 'scheduled' : 'active';
  const at = new Date(Date.now() + 3600000).toISOString(), scheduled = ['change_schedule', 'cancel_schedule'].includes(operation), draft = operation === 'publish';
  const source: CaptureSourceProposalView['source']['detail']['source'] = { id: sourceId, workspaceId, version: 1, name: 'Fictional source', type: 'website' as const, status, block: 'none' as const, approvedVersion: draft ? null : 1, draftVersion: draft ? 1 : null, lastActivityAt: null, scheduledAt: status === 'scheduled' ? at : null, timezone: status === 'scheduled' ? 'America/New_York' : null, metrics: { captured: 0, awaitingReview: 0, approved: 0 } };
  const checks = (['configuration', 'fields', 'workflow', 'access', 'capacity', 'delivery', 'permission', 'pending', 'workspace'] as const).map(code => ({ code, ready: !(blocked && code === 'delivery') }));
  return { ticket: { workspaceId, proposalId, inputHash: 'a'.repeat(64), operation, target: { kind: 'source', sourceId, sourceVersion: 1, draftVersion: source.draftVersion, approvedVersion: source.approvedVersion }, ...(scheduled ? { transition: { transitionId, configurationVersion: 1 } } : {}), state: 'pending', createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 600000).toISOString() }, source: { canEdit: true, policyRevision: 0, business: { businessName: 'Fictional repairs', businessEmail: '', businessPhone: '', services: ['Plumbing'], serviceArea: '', timezone: 'America/New_York', gmailAccess: 'available', teammates: [] }, detail: { source, draft: draft ? { id: proposalId, version: 1, baseApprovedVersion: null, configuration: config } : null, approved: draft ? null : { version: 1, definitionVersion: 1, workflowVersion: 1, configuration: config as NonNullable<CaptureSourceProposalView['source']['detail']['approved']>['configuration'] } }, publicationReview: { sourceId, sourceVersion: 1, draftVersion: source.draftVersion, baseApprovedVersion: source.approvedVersion, configurationVersion: draft ? 1 : 2, canActivate: true, ready: !blocked, plan: 'standard', used: 0, limit: 3, checks, pending: scheduled ? { id: transitionId, configurationVersion: 1, at, timezone: 'America/New_York' } : null }, lifecycleReview: { sourceId, sourceVersion: 1, approvedVersion: source.approvedVersion, canPause: status === 'active', canResume: status === 'paused', canArchive: status !== 'archived', canRestore: status === 'archived', restoreReady: !blocked, restoreFailures: [], resumeReady: !blocked, resumeFailures: blocked ? ['delivery'] : [] } }, timing: operation === 'publish' ? { kind: 'now' } : operation === 'change_schedule' ? { kind: 'scheduled', at: new Date(Date.now() + 7200000).toISOString(), timezone: 'America/New_York' } : null, configurationKind: operation === 'duplicate' ? 'approved' : null, copyName: operation === 'duplicate' ? 'Fictional duplicate' : null, ready: !blocked, checks, receipt: null };
}
let posts: unknown[] = [];
function mock(initial = fixture(), mode: 'ready' | 'denied' | 'conflict' = 'ready') {
  const original = globalThis.fetch;
  let view = structuredClone(initial);
  posts = [];
  globalThis.fetch = fn(async (_input, options) => {
    if (mode === 'denied')
      return Response.json({}, { status: 403 });
    if (options?.method === 'POST') {
      if (mode === 'conflict')
        return Response.json({}, { status: 409 });
      const body = JSON.parse(String(options.body));
      posts.push(body);
      const confirmed = body.decision === 'confirm', op = view.ticket.operation;
      view = { ...view, ticket: { ...view.ticket, state: confirmed ? 'confirmed' : 'cancelled' }, receipt: !confirmed ? null : op === 'duplicate' ? { kind: 'draft', sourceId: copyId, sourceVersion: 1, draftVersion: 1 } : ['publish', 'change_schedule', 'cancel_schedule'].includes(op) ? { kind: 'publication', sourceId, sourceVersion: 2, configurationVersion: 1, status: op === 'cancel_schedule' ? 'cancelled' : op === 'change_schedule' ? 'scheduled' : 'active', transitionId: op === 'publish' ? null : transitionId } : { kind: 'source', sourceId, sourceVersion: 2 } };
    }
    return Response.json({ view });
  });
  return () => { globalThis.fetch = original; };
}
const meta = { title: 'Assistant/ConnectedCaptureSource', component: ConnectedCaptureSource, parameters: { layout: 'fullscreen' }, args: { ticket: fixture().ticket, disabled: false, onSaved: fn() }, beforeEach: () => mock(), decorators: [Story => <main className="min-h-screen bg-canvas p-4"><h1 className="text-xl text-ink">Fictional source action review</h1><div className="mx-auto max-w-3xl"><Story /></div></main>] } satisfies Meta<typeof ConnectedCaptureSource>;
export default meta;
type Story = StoryObj<typeof meta>;
function action(operation: Operation, label: string, outcome: string): Story { return { args: { ticket: fixture(operation).ticket }, beforeEach: () => mock(fixture(operation)), play: async ({ canvasElement }) => { const c = within(canvasElement), body = within(document.body); await userEvent.click(await c.findByRole('button', { name: copy.review })); if (operation === 'publish')
    await userEvent.click(body.getByRole('checkbox', { name: /I reviewed this setup/ })); await userEvent.click(body.getByRole('button', { name: label })); await expect(await c.findByText(outcome)).toBeVisible(); await expect(posts).toEqual([{ workspaceId, proposalId, inputHash: 'a'.repeat(64), decision: 'confirm' }]); } }; }
export const Publication = action('publish', 'Approve and launch', 'Saved capture configuration published. Real request delivery remains subject to its current checks.');
export const Pause = action('pause', 'Pause intake', 'Capture intake paused.');
export const Resume = action('resume', 'Resume intake', 'Approved capture intake resumed.');
export const Archive = action('archive', 'Archive source', 'Capture source archived.');
export const Restore = action('restore', 'Restore to paused', 'Source restored with intake paused.');
export const Duplicate = action('duplicate', 'Create draft copy', 'New source draft created. Publication requires a separate review.');
export const ChangeSchedule = action('change_schedule', 'Confirm new launch time', 'Launch schedule changed. Delivery has not started.');
export const CancelSchedule = action('cancel_schedule', 'Confirm cancellation', 'Pending launch cancelled. Existing receipts are retained.');
export const BlockedPublication: Story = { beforeEach: () => mock(fixture('publish', true)), play: async ({ canvasElement }) => { const c = within(canvasElement); await userEvent.click(await c.findByRole('button', { name: copy.review })); await expect(c.getByRole('button', { name: 'Approve and launch' })).toBeDisabled(); await expect(posts).toEqual([]); } };
export const Denied: Story = { beforeEach: () => mock(fixture(), 'denied'), play: async ({ canvasElement }) => { await expect(await within(canvasElement).findByText(copy.unavailable)).toBeVisible(); } };
