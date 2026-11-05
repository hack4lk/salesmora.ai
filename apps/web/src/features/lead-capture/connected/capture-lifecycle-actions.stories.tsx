import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import type { CaptureDetailView } from '@salesmora/contracts';
import { FormFeedback } from '@salesmora/ui';
import { useCaptureLifecycle, type CaptureLifecycleAction } from './capture-lifecycle-actions';
import { captureConnectedData as copy } from './capture-connected.data';
const workspaceId = '00000000-0000-4000-8000-000000000001', sourceId = '00000000-0000-4000-8000-000000000002';
type Mode = 'ready' | 'lost' | 'conflict' | 'denied' | 'blocked' | 'race' | 'reload-denied' | 'pending';
function fixture(action: CaptureLifecycleAction, version = 2, blocked = false): CaptureDetailView {
  const status = action === 'restore' ? 'archived' as const : action === 'resume' ? 'paused' as const : 'active' as const;
  return { canEdit: true, policyRevision: 0, lifecycleReview: { sourceId, sourceVersion: version, approvedVersion: 1, canPause: status === 'active', canResume: status === 'paused', canArchive: status !== 'archived', canRestore: status === 'archived', restoreReady: !blocked, restoreFailures: blocked ? ['capacity'] : [], resumeReady: !blocked, resumeFailures: blocked ? ['delivery'] : [] }, business: { businessName: 'Fictional business', businessEmail: '', businessPhone: '', services: ['Plumbing'], serviceArea: '', timezone: 'America/New_York', gmailAccess: 'available', teammates: [] }, detail: { source: { id: sourceId, workspaceId, version, name: 'Fictional form', type: 'website', status, block: 'none', approvedVersion: 1, draftVersion: null, lastActivityAt: null, scheduledAt: null, timezone: null, metrics: { captured: 3, awaitingReview: 1, approved: 2 } }, draft: null, approved: { version: 1, definitionVersion: 1, workflowVersion: 1, configuration: { schemaVersion: 1, type: 'website', fields: [{ id: 'name', key: 'name', label: 'Name', type: 'short_text', required: true, options: [] }, { id: 'service', key: 'service', label: 'Service', type: 'short_text', required: true, options: [] }, { id: 'email', key: 'email', label: 'Email', type: 'email', required: true, options: [] }], contactRequired: true, workflow: { assignment: { kind: 'default' }, stage: 'new', tags: [], notifyAssigned: false }, content: { businessName: 'Fictional business', title: 'Request service', intro: '', submitLabel: 'Send', thankYou: 'Thanks', unavailableMessage: 'Unavailable', businessEmail: '', businessPhone: '', showBusinessEmail: false, showBusinessPhone: false, privacy: null, consent: null } } } } };
}
function LifecyclePreview({ action }: { action: CaptureLifecycleAction; mode: Mode }) {
  const [changed, setChanged] = useState(false), lifecycle = useCaptureLifecycle(workspaceId, () => setChanged(true));
  if (lifecycle.denied) return <FormFeedback kind="error" message={copy.unavailable} />;
  return <div className="grid gap-4 p-6"><h1>Connected lifecycle preview</h1><p>Fictional requests only. No service is changed.</p><button type="button" disabled={lifecycle.busy} onClick={() => { void lifecycle.open(sourceId, action); }}>Review {action}</button>{changed && <p role="status">Source refreshed.</p>}{lifecycle.message && <p role="alert">{lifecycle.message}</p>}{lifecycle.dialog}</div>;
}
let posted: Record<string, unknown>[] = [], release: (() => void) | undefined;
const meta = { title: 'Lead Capture/ConnectedLifecycle', component: LifecyclePreview, args: { action: 'pause', mode: 'ready' }, parameters: { layout: 'fullscreen' }, beforeEach: ({ args }) => {
  const original = globalThis.fetch; let reads = 0; posted = []; release = undefined;
  globalThis.fetch = async (input, init) => {
    if (!String(input).startsWith('/api/lead-capture/')) return original(input, init);
    if (init?.method !== 'POST') {
      reads++;
      if (args.mode === 'denied' || args.mode === 'reload-denied' && reads > 1) return Response.json({ error: copy.unavailable }, { status: 404 });
      return Response.json(fixture(args.action, reads > 1 && args.mode === 'conflict' ? 3 : 2, args.mode === 'blocked' || args.mode === 'race' && reads > 1));
    }
    const body = JSON.parse(String(init.body)); posted.push(body);
    if ((args.mode === 'conflict' || args.mode === 'reload-denied') && posted.length === 1) return Response.json({ error: 'Changed.' }, { status: 409 });
    if (args.mode === 'race') return Response.json({ error: 'Resolve the setup checks.' }, { status: 422 });
    if (args.mode === 'lost' && posted.length === 1) throw new TypeError('Lost acknowledgement');
    if (args.mode === 'pending') await new Promise<void>(resolve => { release = resolve; });
    return Response.json({ ok: true, sourceId, sourceVersion: Number(body.expectedVersion) + 1 });
  };
  return () => { globalThis.fetch = original; release?.(); };
} } satisfies Meta<typeof LifecyclePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
async function open(canvasElement: HTMLElement, action: CaptureLifecycleAction) { await userEvent.click(within(canvasElement).getByRole('button', { name: `Review ${action}` })); const body = within(canvasElement.ownerDocument.body); await waitFor(() => expect(body.getByRole('alertdialog')).toBeVisible(), { timeout: 10000 }); return body; }
export const Pause: Story = { play: async ({ canvasElement }) => { const body = await open(canvasElement, 'pause'); expect(posted).toHaveLength(0); await userEvent.click(body.getByRole('button', { name: 'Pause intake' })); await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument()); expect(posted).toHaveLength(1); expect(posted[0]).toMatchObject({ workspaceId, sourceId, expectedVersion: 2, action: 'pause', confirmed: true }); } };
export const Archive: Story = { args: { action: 'archive' }, play: async ({ canvasElement }) => { const body = await open(canvasElement, 'archive'); await userEvent.click(body.getByRole('button', { name: 'Archive source' })); await waitFor(() => expect(posted).toHaveLength(1)); expect(posted[0].action).toBe('archive'); } };
export const Resume: Story = { args: { action: 'resume' }, play: async ({ canvasElement }) => { const body = await open(canvasElement, 'resume'); await expect(body.getByText('Approved version')).toBeVisible(); await userEvent.click(body.getByRole('button', { name: 'Resume intake' })); await waitFor(() => expect(posted).toHaveLength(1)); expect(posted[0].configuration).toEqual({ kind: 'approved', version: 1 }); } };
export const ResumeBlocked: Story = { args: { action: 'resume', mode: 'blocked' }, play: async ({ canvasElement }) => { const body = await open(canvasElement, 'resume'); await expect(body.getByRole('button', { name: 'Resume intake' })).toBeDisabled(); await expect(body.getByText(copy.readiness.delivery)).toBeVisible(); await waitFor(() => expect(body.getByRole('alertdialog')).toHaveFocus(), { timeout: 3000 }); await userEvent.tab(); await expect(body.getByRole('button', { name: 'Cancel' })).toHaveFocus(); expect(posted).toHaveLength(0); } };
export const LostAcknowledgement: Story = { args: { mode: 'lost' }, play: async ({ canvasElement }) => { const body = await open(canvasElement, 'pause'); await userEvent.click(body.getByRole('button', { name: 'Pause intake' })); await expect(body.getByText(copy.lifecycleFailed)).toBeVisible(); await userEvent.click(body.getByRole('button', { name: 'Pause intake' })); await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument()); expect(posted).toHaveLength(2); expect(posted[0]).toEqual(posted[1]); } };
export const ConflictReload: Story = { args: { mode: 'conflict' }, play: async ({ canvasElement }) => { const body = await open(canvasElement, 'pause'); await userEvent.click(body.getByRole('button', { name: 'Pause intake' })); await expect(body.getByRole('button', { name: 'Pause intake' })).toBeDisabled(); await userEvent.click(body.getByRole('button', { name: 'Reload source' })); await expect(body.getByRole('button', { name: 'Pause intake' })).toBeEnabled(); await userEvent.click(body.getByRole('button', { name: 'Pause intake' })); await waitFor(() => expect(posted).toHaveLength(2)); expect(posted[1].expectedVersion).toBe(3); expect(posted[1].requestId).not.toBe(posted[0].requestId); } };
export const ReadDenied: Story = { args: { mode: 'denied' }, play: async ({ canvasElement }) => { await userEvent.click(within(canvasElement).getByRole('button', { name: 'Review pause' })); await expect(within(canvasElement).getByText(copy.unavailable)).toBeVisible(); expect(within(canvasElement.ownerDocument.body).queryByText('Fictional form')).not.toBeInTheDocument(); expect(posted).toHaveLength(0); } };
export const ReloadDenied: Story = { args: { mode: 'reload-denied' }, play: async ({ canvasElement }) => { const body = await open(canvasElement, 'pause'); await userEvent.click(body.getByRole('button', { name: 'Pause intake' })); await userEvent.click(body.getByRole('button', { name: 'Reload source' })); await expect(within(canvasElement).getByText(copy.unavailable)).toBeVisible(); expect(body.queryByText('Fictional form')).not.toBeInTheDocument(); } };
export const ReadinessChanged: Story = { args: { action: 'resume', mode: 'race' }, play: async ({ canvasElement }) => { const body = await open(canvasElement, 'resume'); await userEvent.click(body.getByRole('button', { name: 'Resume intake' })); await expect(body.getByText(copy.readiness.delivery)).toBeVisible(); await expect(body.getByRole('button', { name: 'Resume intake' })).toBeDisabled(); } };
export const Pending: Story = { args: { mode: 'pending' }, play: async ({ canvasElement }) => { const body = await open(canvasElement, 'pause'); await userEvent.click(body.getByRole('button', { name: 'Pause intake' })); await waitFor(() => expect(posted).toHaveLength(1)); await expect(body.getByRole('button', { name: 'Cancel' })).toBeDisabled(); release?.(); await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument()); expect(posted).toHaveLength(1); } };

export const PauseReview: Story = { play: async ({ canvasElement }) => { const body = await open(canvasElement, 'pause'); await expect(body.getByRole('button', { name: 'Pause intake' })).toBeEnabled(); expect(posted).toHaveLength(0); } };
export const ArchiveReview: Story = { args: { action: 'archive' }, play: async ({ canvasElement }) => { const body = await open(canvasElement, 'archive'); await expect(body.getByRole('button', { name: 'Archive source' })).toBeEnabled(); expect(posted).toHaveLength(0); } };

export const Restore: Story = { args: { action: 'restore' }, play: async ({ canvasElement }) => { const body = await open(canvasElement, 'restore'); await userEvent.click(body.getByRole('button', { name: 'Restore to paused' })); await waitFor(() => expect(posted).toHaveLength(1)); expect(posted[0]).toMatchObject({ action: 'restore', confirmed: true }); } };
