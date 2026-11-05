import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { intakeQuerySchema, type IntakeDetailView } from '@salesmora/contracts';
import { IntakeDetailRoute, IntakeListRoute } from './intake-routes';
const workspaceId = '00000000-0000-4000-8000-000000000001', intakeId = '00000000-0000-4000-8000-000000000002', sourceId = '00000000-0000-4000-8000-000000000003';
const initial: IntakeDetailView = { workspaceId, decisionKind: null, timezone: 'America/New_York', source: { id: sourceId, name: 'Fictional Gmail enquiries', type: 'gmail' }, item: { id: intakeId, workspaceId, sourceId, receiptId: '00000000-0000-4000-8000-000000000004', version: 1, definitionVersion: 1, workflowVersion: 1, status: 'awaiting', answers: { name: 'Alex Morgan', email: 'alex@example.com', service: 'Water heater quote' }, flags: ['uncertain'] },
  configuration: { schemaVersion: 1, type: 'gmail', contactRequired: true, fields: [{ id: 'name', key: 'name', label: 'Name', type: 'short_text', required: true, options: [] }, { id: 'email', key: 'email', label: 'Email', type: 'email', required: false, options: [] }, { id: 'service', key: 'service', label: 'Service', type: 'short_text', required: true, options: [] }], workflow: { assignment: { kind: 'default' }, stage: 'new', tags: ['Gmail'], notifyAssigned: false } },
  receipt: { id: '00000000-0000-4000-8000-000000000004', receivedAt: '2026-11-04T17:00:00.000Z', evidence: { schemaVersion: 1, type: 'gmail', from: 'sender@example.com', subject: 'Fictional service request', body: 'Alex Morgan needs a water heater quote. Contact alex@example.com.', fields: [{ fieldId: 'name', uncertain: true, origin: { kind: 'email', location: 'body', quote: 'Alex Morgan' } }] }, originalAnswers: { name: 'Alex Morgan', email: 'alex@example.com', service: 'Water heater quote' } },
  capabilities: { canEdit: true, canCreate: true, canLink: true, canDismiss: true, canReadMatches: true } };
let posts: Record<string, unknown>[] = [], preparations: Record<string, unknown>[] = [];
const candidate = { leadId: '00000000-0000-4000-8000-000000000005', leadVersion: 1, name: 'Existing Alex', contact: 'alex@example.com', reason: 'Matching email or phone', canLink: true, changes: [{ id: 'service', label: 'Service', existing: 'Repair', proposed: 'Water heater quote' }] };
const meta = { title: 'Lead Capture/ConnectedIntake', component: IntakeDetailRoute, args: { initial }, parameters: { layout: 'fullscreen', nextjs: { appDirectory: true } }, decorators: [Story => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><Story /></main>], beforeEach: ({ parameters, args }) => {
  const original = globalThis.fetch; posts = []; preparations = []; let failed = false;
  globalThis.fetch = async (input, options) => {
    const path = String(input), body = options?.body ? JSON.parse(String(options.body)) : null;
    if (path === '/api/intake/review') { preparations.push(body); if (parameters.denied) return Response.json({ code: 'unavailable' }, { status: 404 }); if (parameters.prepareError) return Response.json({ code: 'error' }, { status: 500 }); return Response.json({ detail: args.initial, reviewId: body.requestId, expiresAt: new Date(Date.now() + 600000).toISOString(), answers: body.answers, candidates: parameters.duplicate ? [candidate] : [], duplicateRequired: !!parameters.duplicate, capacity: parameters.capacity ? 'exhausted' : 'available', assignmentReady: !parameters.assignmentUnavailable }); }
    if (path === '/api/intake/decisions') { posts.push(body); if (parameters.conflict) return Response.json({ code: 'conflict' }, { status: 409 }); if (parameters.retry && !failed) { failed = true; return Response.json({ code: 'error' }, { status: 500 }); } return Response.json({ ok: true }); }
    if (path.startsWith(`/api/intake/${intakeId}`)) return Response.json(args.initial);
    return original(input, options);
  };
  return () => { globalThis.fetch = original; };
} } satisfies Meta<typeof IntakeDetailRoute>;
export default meta;
type Story = StoryObj<typeof meta>;
const ready = async (c: ReturnType<typeof within>) => { await waitFor(async () => { await expect(preparations.length).toBeGreaterThan(0); }); await userEvent.click(c.getByRole('button', { name: /^Review decision$/ })); await expect(await c.findByRole('button', { name: 'Approve and create lead' })).toBeEnabled(); };
export const GmailReview: Story = { play: async ({ canvasElement }) => { const c = within(canvasElement); await ready(c); await userEvent.click(c.getByRole('button', { name: 'Approve and create lead' })); await expect(await c.findByRole('heading', { name: 'Intake decision confirmed' })).toBeVisible(); expect(posts).toHaveLength(1); expect(posts[0].reviewId).toBe(preparations.at(-1)?.requestId); expect(posts[0]).not.toHaveProperty('reviewRevision'); } };
export const CorrectedValues: Story = { play: async ({ canvasElement }) => { const c = within(canvasElement); const field = c.getByRole('textbox', { name: /^Name/ }); await userEvent.clear(field); await userEvent.type(field, 'Corrected Alex'); await waitFor(() => expect((preparations.at(-1)?.answers as Record<string, string>)?.name).toBe('Corrected Alex')); await ready(c); await userEvent.click(c.getByRole('button', { name: 'Approve and create lead' })); expect((posts[0].answers as Record<string, string>).name).toBe('Corrected Alex'); } };
export const ExactRetry: Story = { parameters: { retry: true }, play: async ({ canvasElement }) => { const c = within(canvasElement); await ready(c); await userEvent.click(c.getByRole('button', { name: 'Approve and create lead' })); await expect(await c.findByText(/The decision could not be confirmed/)).toBeVisible(); await userEvent.click(c.getByRole('button', { name: 'Approve and create lead' })); await expect(await c.findByRole('heading', { name: 'Intake decision confirmed' })).toBeVisible(); expect(posts).toHaveLength(2); expect(posts[0]).toEqual(posts[1]); } };
export const Conflict: Story = { parameters: { conflict: true }, play: async ({ canvasElement }) => { const c = within(canvasElement); await ready(c); await userEvent.click(c.getByRole('button', { name: 'Approve and create lead' })); await expect(await c.findByText(/This item or the existing lead has changed/)).toBeVisible(); await expect(c.getByRole('button', { name: 'Approve and create lead' })).toBeDisabled(); } };
export const Duplicate: Story = { parameters: { duplicate: true }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(await c.findByText('Existing Alex')).toBeVisible(); } };
export const CapacityExhausted: Story = { parameters: { capacity: true }, play: async ({ canvasElement }) => { const c = within(canvasElement); await waitFor(() => expect(preparations.length).toBeGreaterThan(0)); await userEvent.click(c.getByRole('radio', { name: 'Dismiss intake item' })); await userEvent.click(c.getByRole('button', { name: /^Review decision$/ })); await userEvent.click(await c.findByRole('button', { name: 'Confirm dismissal' })); await expect(await c.findByRole('heading', { name: 'Intake decision confirmed' })).toBeVisible(); expect(posts[0].kind).toBe('dismiss'); } };
export const ReadOnly: Story = { args: { initial: { ...initial, capabilities: { canEdit: false, canCreate: false, canLink: false, canDismiss: false, canReadMatches: false } } } };
export const ResolvedDismissal: Story = { args: { initial: { ...initial, decisionKind: 'dismiss', item: { ...initial.item, status: 'dismissed', version: 2 } } }, play: async ({ canvasElement }) => { const c = within(canvasElement); expect(c.getByText(/Saved decision: Dismiss intake item/)).toBeVisible(); expect(preparations).toHaveLength(0); } };
export const AccessRevoked: Story = { parameters: { denied: true }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(await c.findByText('This intake item or workspace is unavailable.')).toBeVisible(); expect(c.queryByText('alex@example.com')).not.toBeInTheDocument(); } };
export const ReviewUnavailable: Story = { parameters: { prepareError: true }, play: async ({ canvasElement }) => { await expect(await within(canvasElement).findByRole('button', { name: 'Retry review checks' })).toBeVisible(); } };
export const List: Story = { render: () => <IntakeListRoute initial={{ workspaceId, timezone: initial.timezone, total: 1, page: 1, pageSize: 25, sources: [{ id: sourceId, name: initial.source.name }], rows: [{ id: intakeId, name: 'Alex Morgan', contact: 'alex@example.com', summary: 'Water heater quote', source: initial.source, status: 'awaiting', flags: ['uncertain'], receivedAt: initial.receipt.receivedAt, canOpen: true, canReview: true }] }} query={intakeQuerySchema.parse({ workspaceId })} /> };

export const DuplicateLink: Story = { parameters: { duplicate: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(await c.findByText('Existing Alex')).toBeVisible();
  await userEvent.click(c.getByRole('radio', { name: /^Update \/ link existing/ }));
  await userEvent.click(c.getByRole('checkbox', { name: 'Apply change: Service' }));
  await userEvent.click(c.getByRole('button', { name: /^Review decision$/ }));
  await userEvent.click(await c.findByRole('button', { name: 'Approve update / link' }));
  await expect(await c.findByRole('heading', { name: 'Intake decision confirmed' })).toBeVisible();
  expect(posts[0].kind).toBe('link'); expect(posts[0].changeIds).toEqual(['service']); expect(posts[0]).not.toHaveProperty('answers');
} };
export const DuplicateSeparate: Story = { parameters: { duplicate: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(await c.findByText('Existing Alex')).toBeVisible();
  await userEvent.click(c.getByRole('radio', { name: /^Create separate lead/ })); await userEvent.click(c.getByRole('button', { name: /^Review decision$/ }));
  await userEvent.click(await c.findByRole('button', { name: 'Approve separate lead' }));
  await expect(await c.findByRole('heading', { name: 'Intake decision confirmed' })).toBeVisible(); expect(posts[0].kind).toBe('separate');
} };

export const AssignmentUnavailable: Story = { parameters: { assignmentUnavailable: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(await c.findByText(/The configured assignee is unavailable/)).toBeVisible();
  await expect(c.getByRole('radio', { name: 'Create lead' })).toBeDisabled();
  await userEvent.click(c.getByRole('radio', { name: 'Dismiss intake item' })); await userEvent.click(c.getByRole('button', { name: /^Review decision$/ }));
  await userEvent.click(await c.findByRole('button', { name: 'Confirm dismissal' }));
  await expect(await c.findByRole('heading', { name: 'Intake decision confirmed' })).toBeVisible();
} };
