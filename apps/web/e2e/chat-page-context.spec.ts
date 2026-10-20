import { test, expect, request as requests, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase } from '@salesmora/data';
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL) throw Error('Use the isolated test database.');
const db = createDatabase(connection), origin = 'http://127.0.0.1:3002', headers = { Origin: origin };
const clients: Record<string, APIRequestContext> = {}, users: Record<string, string> = {};
let workspaceId: string, otherWorkspace: string;
const leadId = randomUUID(), foreignId = randomUUID(), prefix = randomUUID();
const filters = { query: 'Context Customer', stages: [], sources: [], ownerIds: [], created: 'any', from: '', to: '', attention: false, archived: false };
test.beforeAll(async () => {
  await db('rateLimits').delete();
  for (const role of ['owner', 'field', 'other']) {
    clients[role] = await requests.newContext({ baseURL: origin });
    const email = `${prefix}-${role}@example.test`;
    expect((await clients[role].post('/api/auth/sign-up/email', { headers, data: { name: `Context ${role}`, email, password: 'Fictional-context-password-42!', termsAccepted: true } })).status()).toBe(200);
    users[role] = (await db('users').where({ email }).first()).id;
  }
  const input = { business: { businessName: 'Context fixture workspace', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } };
  workspaceId = (await (await clients.owner.post('/api/workspaces', { headers, data: input })).json()).workspaceId;
  otherWorkspace = (await (await clients.other.post('/api/workspaces', { headers, data: input })).json()).workspaceId;
  await db('workspaceMemberships').insert({ workspaceId, userId: users.field, role: 'field' });
  await db('leads').insert([{ id: leadId, workspaceId, createdBy: users.owner, ownerId: users.field, name: 'Context Customer' }, { id: foreignId, workspaceId: otherWorkspace, createdBy: users.other, ownerId: null, name: 'Foreign private customer' }].map(row => ({ ...row, submissionId: randomUUID(), submissionHash: 'context-fixture', email: 'private@example.test', phone: '', service: 'Fixture repair', address: '', details: 'Private request details', notes: 'Private internal note', stage: 'new', source: 'website' })));
});
test.afterAll(async () => { if (Object.values(users).length) await db('users').whereIn('id', Object.values(users)).delete(); await Promise.all(Object.values(clients).map(client => client.dispose())); await db.destroy(); });
async function send(role: string, patch = {}) {
  const response = await clients[role].post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId: randomUUID(), surfaceKey: 'lead.detail', recordRefs: [{ type: 'lead', id: leadId }], message: 'fixture:context', ...patch } });
  expect(response.status()).toBe(200);
  const events = (await response.text()).split('\n\n').filter(line => line.startsWith('data: ')).map(line => JSON.parse(line.slice(6)));
  return { events, accepted: events[0], text: events.filter(event => event.type === 'message.delta').map(event => event.text).join('') };
}
test('context is server-resolved, bounded, scoped and never trusts browser labels', async () => {
  const own = await send('field'); expect(own.text).toContain('Context Customer'); expect(own.text).not.toContain('private@example.test'); expect(own.text).not.toContain('Private internal note');
  for (const id of [foreignId, randomUUID()]) { const denied = await send('field', { recordRefs: [{ type: 'lead', id }] }); expect(denied.text).toContain('unavailable'); expect(denied.text).not.toContain(id); expect(denied.text).not.toContain('Foreign private customer'); }
  expect((await clients.owner.post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId: randomUUID(), surfaceKey: 'lead.detail', message: 'fixture:context', recordRefs: [{ type: 'lead', id: leadId, name: 'Forged owner' }] } })).status()).toBe(422);
  const list = await send('owner', { surfaceKey: 'leads.list', recordRefs: undefined, uiState: { view: 'pipeline', filters } }); expect(list.text).toContain('lead-list-filters'); expect(list.text).toContain('No matching records or totals');
  const cleared = await send('owner', { recordRefs: undefined }); expect(cleared.text).toContain('No page reference supplied');
});
test('live record/list chip captures current intent, clears it and follows navigation', async ({ page }) => {
  test.setTimeout(90000);
  await page.context().addCookies((await clients.owner.storageState()).cookies);
  await page.goto(`/leads/${leadId}?workspace=${workspaceId}`);
  await page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click();
  const chip = page.getByRole('button', { name: /Clear assistant context: Using LD-.*Context Customer/ }); await expect(chip).toBeVisible();
  await chip.click(); const composer = page.getByRole('textbox', { name: 'Ask the SalesMora assistant' });
  await expect(composer).toBeFocused();
  await composer.fill('fixture:context'); const request = page.waitForRequest(request => request.url().endsWith('/api/chat/turns') && request.method() === 'POST');
  await page.getByRole('button', { name: 'Ask assistant', exact: true }).click(); const payload = (await request).postDataJSON(); expect(payload.surfaceKey).toBe('lead.detail'); expect(payload.recordRefs).toBeUndefined();
  await expect(page.getByText('No page reference supplied. Context fixture complete.', { exact: true })).toBeVisible();
  await page.goto(`/leads?workspace=${workspaceId}&q=Context+Customer`); await page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Clear assistant context: Using current filters', exact: true })).toBeVisible();
  await composer.fill('fixture:context'); const listRequest = page.waitForRequest(request => request.url().endsWith('/api/chat/turns') && request.method() === 'POST'); await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  const listPayload = (await listRequest).postDataJSON(); expect(listPayload.surfaceKey).toBe('leads.list'); expect(listPayload.uiState.filters.query).toBe('Context Customer');
  await expect(page.getByText('Response complete.', { exact: true })).toBeVisible();
});
test('source provenance carries through follow-up history and hides derived answers after source changes', async () => {
  const first = await send('owner'); const second = await send('owner', { threadId: first.accepted.threadId, recordRefs: undefined });
  const evidence = (await db('chatTurns').where({ id: second.accepted.turnId }).first()).leadEvidence; expect(evidence.some((row: { id: string }) => row.id === leadId)).toBe(true);
  await db('leads').where({ id: leadId }).increment('version', 1);
  const history = await (await clients.owner.get(`/api/chat/threads?workspace=${workspaceId}&thread=${first.accepted.threadId}`)).json();
  expect(history.messages.filter((row: { role: string }) => row.role === 'assistant').every((row: { text: string }) => !row.text.includes('Context Customer'))).toBe(true);
});

test('reassignment during a context stream blocks later deltas and retained source content', async () => {
  const id = randomUUID(); await db('leads').insert({ id, workspaceId, createdBy: users.owner, ownerId: users.field, name: 'Stream Context Customer', submissionId: randomUUID(), submissionHash: 'context-stream-fixture', email: '', phone: '', service: 'Fixture repair', address: '', details: '', notes: '', stage: 'new', source: 'website' });
  const clientTurnId = randomUUID();
  const pending = clients.field.post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId, surfaceKey: 'lead.detail', recordRefs: [{ type: 'lead', id }], message: 'fixture:context-slow' } });
  let turn;
  for (let attempt = 0; attempt < 100; attempt++) {
    turn = await db('chatTurns as t').join('chatMessages as m', 'm.turnId', 't.id').where({ 't.clientTurnId': clientTurnId, 'm.role': 'assistant' }).where('m.text', '<>', '').select('t.id', 't.threadId').first();
    if (turn) break;
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  expect(turn).toBeTruthy();
  await db.transaction(async trx => { await trx('workspaces').where({ id: workspaceId }).forUpdate().first(); await trx('leads').where({ id }).update({ ownerId: users.owner }).increment('version', 1); });
  const response = await pending, text = await response.text(); expect(text).toContain('access_denied'); expect(text).not.toContain('Context fixture complete.');
  const history = await (await clients.field.get(`/api/chat/threads?workspace=${workspaceId}&thread=${turn.threadId}`)).json();
  expect(history.messages.filter((item: { role: string }) => item.role === 'assistant').every((item: { text: string }) => !item.text.includes('Stream Context Customer'))).toBe(true);
});

test('a proposal cannot confirm after its referenced source changes', async () => {
  const proposal = await send('owner', { message: 'fixture:draft' });
  const action = proposal.events.find(event => event.type === 'action.proposed')?.action; expect(action).toBeTruthy();
  await db('leads').where({ id: leadId }).increment('version', 1);
  const response = await clients.owner.post('/api/chat/actions', { headers, data: { workspaceId, draftId: action.id, inputHash: action.inputHash, decision: 'confirm' } });
  expect(response.status()).toBe(403); expect((await db('chatActionDrafts').where({ id: action.id }).first()).state).toBe('pending');
});

test('the existing pipeline tool applies list context filters within Field scope', async () => {
  const name = `Count fixture ${randomUUID()}`;
  await db('leads').insert({ id: randomUUID(), workspaceId, createdBy: users.owner, ownerId: users.field, name, submissionId: randomUUID(), submissionHash: 'context-count-fixture', email: '', phone: '', service: 'Fixture repair', address: '', details: '', notes: '', stage: 'contacted', source: 'website' });
  const result = await send('field', { surfaceKey: 'leads.list', recordRefs: undefined, uiState: { view: 'list', filters: { ...filters, query: name } }, message: 'fixture:context-counts' });
  expect(result.text).toContain('"contacted":1'); expect(result.text).toContain('"filtersApplied":true'); expect(result.text).toContain('"scope":"assigned"'); expect(result.text).not.toContain('"new":');
});
