import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import type { CaptureDetailView, CaptureGmailAccountList } from '@salesmora/contracts';
import { CaptureWizardRoute } from './capture-wizard-route';
import { gmailSamplePickerData as sampleCopy } from '../gmail-sample-picker/gmail-sample-picker.data';
const workspaceId = '00000000-0000-4000-8000-000000000001', sourceId = '00000000-0000-4000-8000-000000000002', draftId = '00000000-0000-4000-8000-000000000003', accountA = '00000000-0000-4000-8000-000000000004', accountB = '00000000-0000-4000-8000-000000000005', reviewId = '00000000-0000-4000-8000-000000000006';
const initial: CaptureDetailView = { canEdit: true, policyRevision: 0, business: { businessName: 'Fictional Gmail review', businessEmail: '', businessPhone: '', services: [], serviceArea: '', timezone: 'UTC', gmailAccess: 'available', teammates: [] }, detail: { source: { id: sourceId, workspaceId, version: 1, name: 'Fictional Gmail requests', type: 'gmail', status: 'draft', block: 'none', approvedVersion: null, draftVersion: 1, lastActivityAt: null, scheduledAt: null, timezone: null, metrics: { captured: 0, awaitingReview: 0, approved: 0 } }, approved: null, draft: { id: draftId, version: 1, baseApprovedVersion: null, configuration: { schemaVersion: 1, type: 'gmail', connectionId: accountA, accountEmail: 'first@example.test', rules: { location: 'subject', mode: 'all', phrases: ['fictional-marker'] } } } } };
const accounts: CaptureGmailAccountList = { available: true, accounts: [{ id: accountA, email: 'first@example.test', status: 'connected', version: 1 }, { id: accountB, email: 'second@example.test', status: 'connected', version: 1 }], capabilities: { canRead: true, canConnect: true, canReconnect: true, canSelect: true, canDisconnect: true } };
let writes: { path: string; body: Record<string, unknown> }[] = [];
const sampleReference = 'a'.repeat(120);
const sampleMessage = { id: sampleReference, subject: 'fictional-marker request', sender: 'Alex <alex@example.test>', receivedAt: '2026-11-04T12:00:00Z', body: 'Name: Alex\nEmail: alex@example.test' };
function mock(mode: 'ready' | 'denied' | 'reconnect' | 'sample-failure' | 'sample-conflict' = 'ready') {
  const original = globalThis.fetch, view = structuredClone(initial), list = structuredClone(accounts); writes = [];
  if (mode === 'reconnect') list.accounts[0].status = 'reconnect-required';
  globalThis.fetch = async (input, options) => {
    const path = String(input), method = options?.method ?? 'GET';
    if (mode === 'denied' && path.includes('/gmail/accounts')) return Response.json({ error: 'Account choices could not be loaded.' }, { status: 503 });
    if (method === 'GET' && path.includes('/gmail/accounts')) return Response.json(list);
    if (method === 'GET' && path.includes('/gmail/disconnect')) return Response.json({ account: list.accounts[0], sources: [{ sourceId, sourceVersion: view.detail.source.version, name: view.detail.source.name }], reviewId, expiresAt: new Date(Date.now() + 600000).toISOString() });
    if (method === 'GET') return Response.json(view);
    const body = JSON.parse(String(options?.body)); writes.push({ path, body });
    if (path.includes('/gmail/samples/')) {
      if (mode === 'sample-failure') return Response.json({ code: 'sample' }, { status: 422 });
      if (mode === 'sample-conflict') return Response.json({ code: 'conflict' }, { status: 409 });
      if (path.endsWith('/search')) { const { body: _body, ...candidate } = sampleMessage; void _body; return Response.json({ candidates: [candidate] }); }
      return Response.json(sampleMessage);
    }
    if (path.endsWith('/gmail/connect')) return Response.json({ error: 'Fictional provider unavailable; your draft is saved.' }, { status: 503 });
    if (path.endsWith('/gmail/select')) { view.detail.source.version++; view.detail.source.draftVersion = ++view.detail.draft!.version; const account = list.accounts.find(row => row.id === body.accountId)!; Object.assign(view.detail.draft!.configuration, { connectionId: account.id, accountEmail: account.email }); return Response.json({ ok: true, sourceId, sourceVersion: view.detail.source.version, draftVersion: view.detail.draft!.version }); }
    if (path.endsWith('/gmail/disconnect')) { list.accounts[0].status = 'disconnected'; list.accounts[0].version++; view.detail.source.version++; view.detail.source.block = 'connection'; return Response.json({ ok: true, account: list.accounts[0] }); }
    if (path.endsWith('/draft')) { view.detail.source.version++; view.detail.source.draftVersion = ++view.detail.draft!.version; view.detail.draft!.configuration = body.configuration; return Response.json({ ok: true, sourceId, sourceVersion: view.detail.source.version, draftVersion: view.detail.draft!.version }); }
    throw Error(`Unexpected fictional Gmail request: ${path}`);
  };
  return () => { globalThis.fetch = original; };
}
const meta = { title: 'Lead Capture/ConnectedGmailAccount', component: CaptureWizardRoute, args: { initial }, beforeEach: () => mock(), parameters: { layout: 'fullscreen', nextjs: { appDirectory: true, navigation: { pathname: `/lead-capture/${sourceId}/setup`, query: { workspace: workspaceId, step: 'intake', panel: 'account' } } } }, decorators: [Story => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><h1 className="text-xl font-semibold">Fictional Gmail setup</h1><Story /></main>] } satisfies Meta<typeof CaptureWizardRoute>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Connected: Story = { play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(await c.findByRole('combobox', { name: 'Email address' })).toHaveValue(accountA); await expect(await c.findByText('Connected', { exact: true })).toBeVisible(); } };
export const SelectAccount: Story = { play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(await c.findByText('Connected', { exact: true })).toBeVisible(); await userEvent.selectOptions(c.getByRole('combobox', { name: 'Email address' }), accountB); await expect(await c.findByText('second@example.test', { selector: 'p' })).toBeVisible(); await expect(writes).toHaveLength(1); await expect(writes[0].body).toMatchObject({ accountId: accountB, expectedAccountVersion: 1, expectedVersion: 1, expectedDraftVersion: 1 }); await expect(writes[0].body).not.toHaveProperty('accountEmail'); } };
export const Disconnect: Story = { play: async ({ canvasElement }) => { const c = within(canvasElement), body = within(document.body); await userEvent.click(await c.findByRole('button', { name: 'Disconnect account' })); await expect(await body.findByText(/To revoke the grant across Google applications/)).toBeVisible(); await userEvent.click(within(body.getByRole('alertdialog')).getByRole('button', { name: /^Cancel$/ })); await expect(writes).toHaveLength(0); await userEvent.click(c.getByRole('button', { name: 'Disconnect account' })); await userEvent.click(within(await body.findByRole('alertdialog')).getByRole('button', { name: /^Disconnect account$/ })); await expect(await c.findByText('Disconnected', { exact: true })).toBeVisible(); await expect(writes[0].body).toMatchObject({ reviewId, confirmed: true }); } };
export const ReconnectFailure: Story = { beforeEach: () => mock('reconnect'), play: async ({ canvasElement }) => { const c = within(canvasElement); await userEvent.click(await c.findByRole('button', { name: 'Reconnect account' })); await expect(await c.findByText('Fictional provider unavailable; your draft is saved.')).toBeVisible(); await expect(writes[0].body.reconnect).toEqual({ accountId: accountA, expectedAccountVersion: 1 }); } };
export const SaveBeforeConsent: Story = { play: async ({ canvasElement }) => { const c = within(canvasElement), body = within(document.body); await expect(await c.findByText('Connected', { exact: true })).toBeVisible(); await userEvent.click(c.getByRole('tab', { name: /^Matching rules$/ })); await userEvent.type(c.getByRole('textbox', { name: 'Phrase 1' }), '-edited'); await userEvent.click(c.getByRole('tab', { name: /^Email account$/ })); await userEvent.click(c.getByRole('button', { name: 'Connect Gmail account' })); await expect(writes).toHaveLength(0); await userEvent.click(await body.findByRole('button', { name: 'Save draft and continue' })); await expect(await c.findByText('Fictional provider unavailable; your draft is saved.')).toBeVisible(); await expect(writes.map(write => write.path.split('/').at(-1))).toEqual(['draft', 'connect']); await expect(writes[1].body).toMatchObject({ expectedVersion: 2, expectedDraftVersion: 2 }); } };
export const AccountsFailure: Story = { beforeEach: () => mock('denied'), play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(await c.findByText('Account choices could not be loaded.')).toBeVisible(); await expect(c.getByRole('combobox', { name: 'Email address' })).toBeDisabled(); } };
export const ReadOnly: Story = { args: { initial: { ...initial, canEdit: false } }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(await c.findByText('Connected', { exact: true })).toBeVisible(); await expect(c.queryByRole('button', { name: 'Connect Gmail account' })).not.toBeInTheDocument(); await expect(c.getByRole('combobox', { name: 'Email address' })).toBeDisabled(); } };
const fields = { nextjs: { appDirectory: true, navigation: { pathname: `/lead-capture/${sourceId}/setup`, query: { workspace: workspaceId, step: 'intake', panel: 'fields' } } } };
export const SelectMailboxExample: Story = { parameters: fields, play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const help = await c.findByRole('button', { name: sampleCopy.helpLabel });
  await userEvent.click(help);
  const dialog = within(await body.findByRole('dialog', { name: sampleCopy.helpLabel }));
  for (const paragraph of [sampleCopy.description, sampleCopy.searchHint, sampleCopy.privacy]) {
    await expect(dialog.getByText(paragraph)).toBeVisible();
  }
  await expect(writes).toHaveLength(0);
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await userEvent.type(await c.findByRole('textbox', { name: 'Subject contains' }), 'fictional-marker');
  await userEvent.click(c.getByRole('button', { name: 'Find example emails' }));
  await expect(await c.findByText(sampleMessage.subject)).toBeVisible(); await expect(writes).toHaveLength(1);
  await expect(writes[0].body).toEqual({ workspaceId, sourceId, expectedVersion: 1, expectedDraftVersion: 1, subjectPhrase: 'fictional-marker' });
  await expect(c.queryByText(sampleMessage.body)).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: `Preview email: ${sampleMessage.subject}` }));
  await expect(await c.findByText(sampleMessage.body)).toBeVisible(); await expect(writes[1].body.reference).toBe(sampleReference);
  await userEvent.click(c.getByRole('button', { name: 'Use this example' }));
  await expect(c.getByRole('textbox', { name: 'Email body' })).toHaveValue(sampleMessage.body);
  await expect(c.getByRole('textbox', { name: 'Subject' })).toHaveValue(sampleMessage.subject);
  await expect(c.getByRole('textbox', { name: 'Subject contains' })).toBeEnabled();
  await expect(writes).toHaveLength(2); await expect(c.getByRole('button', { name: 'Extract fields' })).toBeDisabled();
} };
export const MailboxReadFailure: Story = { parameters: fields, beforeEach: () => mock('sample-failure'), play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.type(await c.findByRole('textbox', { name: 'Subject contains' }), 'fictional-marker'); await userEvent.click(c.getByRole('button', { name: 'Find example emails' }));
  await expect(await c.findByRole('alert')).toHaveTextContent('Gmail examples could not be loaded'); await expect(c.getByRole('textbox', { name: 'Email body' })).toHaveValue('');
} };
export const MailboxStaleDraft: Story = { parameters: fields, beforeEach: () => mock('sample-conflict'), play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.type(await c.findByRole('textbox', { name: 'Subject contains' }), 'fictional-marker'); await userEvent.click(c.getByRole('button', { name: 'Find example emails' }));
  await expect(await c.findByRole('button', { name: 'Reload saved draft' })).toBeVisible(); await expect(c.getByRole('textbox', { name: 'Email body' })).toHaveValue('');
} };
