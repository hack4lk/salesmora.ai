import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { initialCaptureSetupConfiguration, type CaptureSetupView } from '@salesmora/contracts';
import { ConnectedCaptureSetup } from './connected-capture-setup';
import { captureAssistantResultData as copy } from './capture-result.data';
const workspaceId = '00000000-0000-4000-8000-000000000001', sourceId = '00000000-0000-4000-8000-000000000002', proposalId = '00000000-0000-4000-8000-000000000003';
const configuration = initialCaptureSetupConfiguration('website', { businessName: 'Fictional Repairs', businessEmail: '', businessPhone: '' });
function fixture(operation: 'suggest_website_fields' | 'create_source' | 'save_draft' | 'extract_sample' = 'suggest_website_fields'): CaptureSetupView {
  const config = operation === 'extract_sample' ? { schemaVersion: 1 as const, type: 'gmail' as const, fields: configuration.fields!.filter(field => ['name', 'email', 'service'].includes(field.key)), contactRequired: true, rules: { phrases: ['Repair request'], location: 'subject' as const, mode: 'all' as const }, mappings: [], workflow: configuration.workflow } : structuredClone(configuration);
  const sample = operation === 'extract_sample' ? { id: '00000000-0000-4000-8000-000000000004', version: 1, subject: 'Repair request', body: 'Name: Jordan Example\nEmail: jordan@example.test\nService: Tap repair' } : null;
  const findings = sample ? config.fields!.map(field => { const text = field.key === 'name' ? 'Jordan Example' : field.key === 'email' ? 'jordan@example.test' : 'Tap repair'; return { id: field.id, fieldId: field.id, included: true, sampleValue: text, suggestedValue: text, confidence: 'found' as const, required: field.required, instruction: `Read ${field.label}`, evidence: { source: 'body' as const, text: sample.body.split('\n').find(line => line.includes(text))! } }; }) : [];
  if (config.type === 'gmail') config.mappings = findings.map(row => ({ fieldId: row.fieldId, instruction: row.instruction }));
  const base = { sourceId, sourceVersion: 1, draftVersion: 1, name: 'Fictional repairs', configuration: config, sample, findings: [] };
  return { ticket: { workspaceId, proposalId, inputHash: 'a'.repeat(64), operation, target: operation === 'create_source' ? { kind: 'new_source' } : { kind: 'source', sourceId, sourceVersion: 1, draftVersion: 1, approvedVersion: null }, state: 'pending', createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 600000).toISOString() }, review: { name: base.name, configuration: config, before: operation === 'create_source' ? null : config, base: operation === 'create_source' ? null : base, sample, findings }, receipt: null };
}
let posts: unknown[] = [];
function mock(initial = fixture(), mode: 'ready' | 'denied' | 'mismatch' = 'ready') {
  const original = globalThis.fetch; let view = structuredClone(initial); posts = [];
  globalThis.fetch = fn(async (_input, options) => {
    if (mode === 'denied') return Response.json({}, { status: 403 });
    if (options?.method === 'POST') {
      const body = JSON.parse(String(options.body)); posts.push(body); const confirmed = body.decision === 'confirm';
      view = { ...view, ticket: { ...view.ticket, state: confirmed ? 'confirmed' : 'cancelled' }, receipt: confirmed ? ['create_source', 'save_draft'].includes(view.ticket.operation) ? { kind: 'saved', ok: true, sourceId, sourceVersion: 2, draftVersion: 2 } : { kind: 'suggestions', sourceId, configuration: view.review.configuration, base: view.review.base!, sample: view.review.sample, findings: view.review.findings, sampleApproved: false } : null };
    }
    return Response.json({ view: mode === 'mismatch' ? { ...view, ticket: { ...view.ticket, inputHash: 'b'.repeat(64) } } : view });
  }); return () => { globalThis.fetch = original; };
}
const meta = { title: 'Assistant/ConnectedCaptureSetup', component: ConnectedCaptureSetup, parameters: { layout: 'fullscreen' }, args: { ticket: fixture().ticket, disabled: false, apply: fn(() => true), onSaved: fn() }, beforeEach: () => mock(), decorators: [Story => <main className="min-h-screen bg-canvas p-3"><h1 className="text-xl text-ink">Fictional setup review</h1><div className="mx-auto max-w-3xl"><Story /></div></main>] } satisfies Meta<typeof ConnectedCaptureSetup>;
export default meta; type Story = StoryObj<typeof meta>;
export const Fields: Story = { play: async ({ canvasElement, args }) => { const c = within(canvasElement); await userEvent.click(await c.findByRole('button', { name: copy.review })); await userEvent.click(c.getByRole('button', { name: 'Apply suggested fields' })); await expect(await c.findByText('Suggestions applied to the unsaved setup. Save separately to keep them.')).toBeVisible(); await expect(posts).toEqual([{ workspaceId, proposalId, inputHash: 'a'.repeat(64), decision: 'confirm' }]); await expect(args.apply).toHaveBeenCalled(); } };
export const ChangedUnsavedDraft: Story = { args: { apply: fn(() => false) }, play: async ({ canvasElement }) => { const c = within(canvasElement); await userEvent.click(await c.findByRole('button', { name: copy.review })); await userEvent.click(c.getByRole('button', { name: 'Apply suggested fields' })); await expect(await c.findByText(copy.failed)).toBeVisible(); await expect(posts).toEqual([]); } };
export const Cancelled: Story = { play: async ({ canvasElement }) => { const c = within(canvasElement); await userEvent.click(await c.findByRole('button', { name: copy.cancel })); await expect(await c.findByText(copy.cancelled)).toBeVisible(); } };
export const Denied: Story = { beforeEach: () => mock(fixture(), 'denied'), play: async ({ canvasElement }) => { await expect(await within(canvasElement).findByText(copy.unavailable)).toBeVisible(); } };
export const MismatchedBinding: Story = { beforeEach: () => mock(fixture(), 'mismatch'), play: async ({ canvasElement }) => { await expect(await within(canvasElement).findByText(copy.unavailable)).toBeVisible(); } };
export const CreateDraft: Story = { args: { ticket: fixture('create_source').ticket }, beforeEach: () => mock(fixture('create_source')), play: async ({ canvasElement }) => { const c = within(canvasElement); await userEvent.click(await c.findByRole('button', { name: copy.review })); await userEvent.click(c.getByRole('button', { name: 'Create source draft' })); await expect(await c.findByText('Draft saved. Publication requires a separate review.')).toBeVisible(); } };
export const SaveDraft: Story = { args: { ticket: fixture('save_draft').ticket }, beforeEach: () => mock(fixture('save_draft')), play: async ({ canvasElement }) => { const c = within(canvasElement); await userEvent.click(await c.findByRole('button', { name: copy.review })); await userEvent.click(c.getByRole('button', { name: 'Save source draft' })); await expect(await c.findByText('Draft saved. Publication requires a separate review.')).toBeVisible(); } };
export const PastedSample: Story = { args: { ticket: fixture('extract_sample').ticket }, beforeEach: () => mock(fixture('extract_sample')), play: async ({ canvasElement }) => { const c = within(canvasElement); await userEvent.click(await c.findByRole('button', { name: copy.review })); await expect(await c.findByText('jordan@example.test', { exact: true })).toBeVisible(); } };
