import { test, expect, request as requests, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase } from '@salesmora/data';
test.setTimeout(60_000);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL) throw Error('Use the isolated test database.');
const db = createDatabase(connection), origin = 'http://127.0.0.1:3002', headers = { Origin: origin };
const clients: Record<string, APIRequestContext> = {}, users: Record<string, string> = {};
let workspaceId: string, foreignWorkspace: string;
const values = { name: 'History fixture customer', service: 'Furnace repair', email: 'details-private@example.test', phone: '(212) 555-0142', address: '18 Willow Street', details: 'PRIVATE_REQUEST_SENTINEL\nCall before arriving.', notes: 'PRIVATE_INTERNAL_SENTINEL\nKeep the side entrance clear.' };
test.beforeAll(async () => {
  await db('rateLimits').delete(); const prefix = randomUUID();
  for (const role of ['owner', 'admin', 'office', 'field', 'foreign']) {
    clients[role] = await requests.newContext({ baseURL: origin }); const email = `${prefix}-${role}@example.test`;
    expect((await clients[role].post('/api/auth/sign-up/email', { headers, data: { name: `History ${role}`, email, password: 'Fictional-details-password-42!', termsAccepted: true } })).status()).toBe(200);
    users[role] = (await db('users').where({ email }).first()).id;
  }
  const input = { business: { businessName: 'History fixture workspace', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } };
  workspaceId = (await (await clients.owner.post('/api/workspaces', { headers, data: input })).json()).workspaceId;
  foreignWorkspace = (await (await clients.foreign.post('/api/workspaces', { headers, data: input })).json()).workspaceId;
  await db('workspaceMemberships').insert(['admin', 'office', 'field'].map(role => ({ workspaceId, userId: users[role], role })));
});
test.beforeEach(async () => { await db('rateLimits').delete(); await db('chatTurns').where({ workspaceId }).whereNotIn('state', ['accepted', 'running']).update({ createdAt: new Date(Date.now() - 120000) }); });
test.afterAll(async () => { if (Object.values(users).length) await db('users').whereIn('id', Object.values(users)).delete(); await Promise.all(Object.values(clients).map(client => client.dispose())); await db.destroy(); });
async function seed(patch = {}, workspace = workspaceId) {
  const id = randomUUID(); await db('leads').insert({ id, workspaceId: workspace, createdBy: workspace === workspaceId ? users.owner : users.foreign, ownerId: users.field, submissionId: randomUUID(), submissionHash: 'history-fixture', ...values, source: 'website', stage: 'new', createdAt: new Date(Date.now() - 60000), ...patch }); return id;
}
async function ask(role = 'owner', ref = '', patch = {}) {
  const response = await clients[role].post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId: randomUUID(), surfaceKey: 'home', message: `fixture:history:${JSON.stringify({ leadRef: ref, mode: 'activity' })}`, ...patch } });
  expect(response.status()).toBe(200);
  const events = (await response.text()).split('\n\n').filter(line => line.startsWith('data: ')).map(line => JSON.parse(line.slice(6)));
  return { events, accepted: events[0], result: events.find(event => event.type === 'lead.history')?.result, text: events.filter(event => event.type === 'message.delta').map(event => event.text).join('') };
}
async function history(role: string, id: string) { const response = await clients[role].get(`/api/chat/threads?workspace=${workspaceId}&thread=${id}`); expect(response.status()).toBe(200); return response.json(); }
async function navigate(role: string, resultId: string, leadId?: string, patch = {}) { return clients[role].post('/api/chat/leads/navigation', { headers, data: { workspaceId, resultId, ...(leadId ? { leadId } : {}), ...patch } }); }
async function number(id: string) { return `LD-${String((await db('leads').where({ id }).first()).leadNumber).padStart(4, '0')}`; }
function assistantText(saved: { messages: { role: string; text: string }[] }) { return saved.messages.filter(row => row.role === 'assistant').map(row => row.text).join(''); }

async function events(id: string, rows: { type: string; changes: object; actorType?: string }[]) {
  await db('leadActivity').insert(rows.map((row, index) => ({ id: randomUUID(), workspaceId, leadId: id, actorId: users.owner, actorName: 'Historical actor', actorType: row.actorType ?? 'user', type: row.type, changes: JSON.stringify({ ...row.changes, requestHash: 'PRIVATE_HASH_SENTINEL', actorId: 'PRIVATE_ACTOR_SENTINEL' }), createdAt: new Date(Date.now() - (rows.length - index) * 1000) })));
}
async function addNote(id: string, body: string) { expect((await clients.owner.post(`/api/leads/${id}/notes`, { headers, data: { workspaceId, leadId: id, submissionId: randomUUID(), body } })).status()).toBe(200); }
const allKinds = [
  { type: 'created', changes: { source: 'website' } },
  { type: 'assigned', changes: { from: null, to: 'Historical teammate' } },
  { type: 'edited', changes: { fromVersion: 1, toVersion: 2, fields: [{ field: 'phone', before: '123', after: '456' }] } },
  { type: 'stage', changes: { from: 'new', to: 'lost', reason: 'Customer postponed.' } },
  { type: 'archived', changes: {} }, { type: 'restored', changes: {} },
  { type: 'note', actorType: 'assistant-confirmed', changes: { body: 'PRIVATE_TEAM_HISTORY_SENTINEL\nCall before arriving.' } },
];
test('all roles read real authorized activity kinds, exact before/after and attribution without writes or private metadata', async () => {
  const id = await seed(); await events(id, allKinds.filter(row => row.type !== 'created')); const before = await db('leads').where({ id }).first();
  for (const role of ['owner', 'admin', 'office', 'field']) {
    const run = await ask(role, id); expect(run.events.at(-1).type).toBe('turn.completed'); expect(run.result.scope).toBe(role === 'field' ? 'assigned' : 'workspace');
    expect(run.result.total).toBe(7); expect(run.result.entries.map((entry: { kind: string }) => entry.kind)).toEqual(allKinds.map(row => row.type).reverse());
    expect(run.result.entries[0]).toMatchObject({ kind: 'note', viaAssistant: true, actorName: 'Historical actor' }); expect(run.result.entries[4].changes).toEqual([{ field: 'phone', before: '123', after: '456' }]);
    expect(JSON.stringify(run.events)).not.toMatch(/PRIVATE_HASH_SENTINEL|PRIVATE_ACTOR_SENTINEL|PRIVATE_INTERNAL_SENTINEL|PRIVATE_REQUEST_SENTINEL|details-private@example.test/);
    const saved = await history(role, run.accepted.threadId); expect(saved.turns.find((turn: { id: string }) => turn.id === run.accepted.turnId).historyResult).toEqual(run.result);
  }
  expect(await db('leads').where({ id }).first()).toEqual(before); expect((await db('leadActivity').where({ leadId: id })).length).toBe(7);
});
test('newest ten and matching total are separate for activity and notes; current page and explicit LD targets work', async () => {
  const id = await seed(); await events(id, Array.from({ length: 13 }, (_, index) => ({ type: 'note', changes: { body: `History note ${index}` } }))); await events(id, [{ type: 'stage', changes: { from: 'new', to: 'contacted' } }]);
  const activity = await ask('owner', await number(id), { surfaceKey: 'leads.list' }); expect(activity.result.total).toBe(15); expect(activity.result.entries).toHaveLength(10);
  const notes = await ask('owner', '', { surfaceKey: 'lead.detail', recordRefs: [{ type: 'lead', id }], message: `fixture:history:${JSON.stringify({ leadRef: '', mode: 'notes' })}` });
  expect(notes.result.total).toBe(13); expect(notes.result.entries).toHaveLength(10); expect(notes.result.entries.every((row: { kind: string }) => row.kind === 'note')).toBe(true); expect(JSON.stringify(notes.result)).not.toContain('History note 0"');
});
test('empty, archived, Won and note-only records follow manual assigned read scope without archive/update authority', async () => {
  const id = await seed({ archivedAt: new Date(), stage: 'won' }); const empty = await ask('field', id, { message: `fixture:history:${JSON.stringify({ leadRef: id, mode: 'notes' })}` }); expect(empty.result.entries).toEqual([]); expect(empty.result.total).toBe(0); expect(empty.result.lead.archived).toBe(true);
  await addNote(id, 'Archived readable team note'); const run = await ask('field', id, { message: `fixture:history:${JSON.stringify({ leadRef: id, mode: 'notes' })}` }); expect(run.result.entries[0].body).toBe('Archived readable team note');
});
test('foreign workspace, other assignee, deleted/missing and numeric overflow targets reveal no record or existence', async () => {
  const other = await seed({ ownerId: users.office }); const foreign = await seed({}, foreignWorkspace);
  for (const ref of [other, foreign, randomUUID(), 'LD-0', 'LD-999999999999']) {
    const run = await ask('field', ref); expect(run.result).toBeUndefined(); expect(run.text).toContain('lead-history-unavailable'); expect(run.text).not.toContain(values.name);
  }
  for (const ref of ['', values.name, 'first result', 'SELECT * FROM leads']) expect((await ask('owner', ref)).text).toContain('lead-history-target-required');
});
test('client scope, result snapshots, SQL and forged origin cannot supply history authority', async () => {
  for (const patch of [{ workspaceId }, { sql: 'SELECT * FROM leads' }, { limit: 1000 }, { mode: 'everything' }]) {
    const run = await ask('owner', '', { message: `fixture:history:${JSON.stringify({ leadRef: 'LD-1', mode: 'notes', ...patch })}` }); expect(run.result).toBeUndefined(); expect(run.events.at(-1).type).toBe('turn.failed');
  }
  expect((await clients.owner.post('/api/chat/turns', { headers: { Origin: 'https://evil.test' }, data: { workspaceId, clientTurnId: randomUUID(), surfaceKey: 'home', message: 'read history' } })).status()).toBe(403);
  expect((await clients.owner.post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId: randomUUID(), surfaceKey: 'home', message: 'read history', historyResult: {} } })).status()).toBe(422);
});
test('unknown/malformed events and overlarge escaped history return no partial or misleading card', async () => {
  const bad = await seed(); await events(bad, [{ type: 'edited', changes: { fields: [] } }]); expect((await ask('owner', bad)).result).toBeUndefined();
  const large = await seed(); await events(large, Array.from({ length: 10 }, () => ({ type: 'note', changes: { body: '\u0001'.repeat(2000) } })));
  const run = await ask('owner', large); expect(run.result).toBeUndefined(); expect(run.text).toContain('lead-history-too-large'); expect(run.text).not.toContain('\u0001');
});
test('new notes and record edits invalidate cards, navigation, inherited answers and pending proposals', async () => {
  const id = await seed(); await addNote(id, 'PRIVATE_TEAM_HISTORY_SENTINEL'); const run = await ask('owner', id);
  const follow = await ask('owner', '', { threadId: run.accepted.threadId, message: 'fixture:history-followup' }); expect(follow.text).toContain('PRIVATE_TEAM_HISTORY_SENTINEL');
  const proposal = await ask('owner', '', { threadId: run.accepted.threadId, surfaceKey: 'lead.detail', recordRefs: [{ type: 'lead', id }], message: `fixture:stage-ref:${id}` });
  const draft = proposal.events.find(event => event.type === 'action.proposed')?.action; expect(draft).toBeTruthy();
  await addNote(id, 'A newer team note');
  const saved = await history('owner', run.accepted.threadId); expect(saved.turns.every((turn: { historyResult?: unknown }) => !turn.historyResult)).toBe(true); expect(assistantText(saved)).not.toContain('PRIVATE_TEAM_HISTORY_SENTINEL'); expect((await navigate('owner', run.accepted.turnId, id)).status()).toBe(403);
  expect((await clients.owner.post('/api/chat/actions', { headers, data: { workspaceId, draftId: draft.id, inputHash: draft.inputHash, decision: 'confirm' } })).status()).toBe(409);
  expect((await db('leads').where({ id }).first()).stage).toBe('new');
  const again = await ask('owner', id); expect(again.result.total).toBe(3);
});
test('permission revocation and assignment loss immediately hide saved content and deny navigation', async () => {
  const id = await seed(); await addNote(id, 'PRIVATE_TEAM_HISTORY_SENTINEL'); const run = await ask('field', id);
  await db('leads').where({ id }).update({ ownerId: users.office }); expect((await navigate('field', run.accepted.turnId, id)).status()).toBe(403); expect(assistantText(await history('field', run.accepted.threadId))).not.toContain('PRIVATE_TEAM_HISTORY_SENTINEL');
  await db('leads').where({ id }).update({ ownerId: users.field }); const grants = await db('workspaceRolePolicies').where({ workspaceId, role: 'field' }).whereNot({ permission: 'assistant.use' });
  await db('workspaceRolePolicies').where({ workspaceId, role: 'field' }).whereNot({ permission: 'assistant.use' }).delete();
  try { const denied = await ask('field', id); expect(denied.result).toBeUndefined(); expect(denied.events.at(-1).type).toBe('turn.failed'); expect((await navigate('field', run.accepted.turnId, id)).status()).toBe(403); }
  finally { await db('workspaceRolePolicies').insert(grants); }
});
test('owner label changes invalidate the history snapshot even without a record version change', async () => {
  const id = await seed(); await addNote(id, 'PRIVATE_TEAM_HISTORY_SENTINEL'); const run = await ask('owner', id); const user = await db('users').where({ id: users.field }).first();
  await db('users').where({ id: users.field }).update({ name: 'Renamed field teammate' });
  try { expect((await navigate('owner', run.accepted.turnId, id)).status()).toBe(403); expect(assistantText(await history('owner', run.accepted.threadId))).not.toContain('PRIVATE_TEAM_HISTORY_SENTINEL'); }
  finally { await db('users').where({ id: users.field }).update({ name: user.name }); }
});
test('mid-stream record changes stop later output and card release', async () => {
  const id = await seed(); await addNote(id, 'PRIVATE_TEAM_HISTORY_SENTINEL');
  const response = clients.owner.post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId: randomUUID(), surfaceKey: 'home', message: `fixture:history-slow:${JSON.stringify({ leadRef: id, mode: 'notes' })}` } });
  let turn;
  for (let index = 0; index < 80; index++) { turn = await db('chatTurns').where({ workspaceId, userId: users.owner }).whereNotNull('leadHistoryResult').whereIn('state', ['accepted', 'running']).first(); if (turn) break; await new Promise(resolve => setTimeout(resolve, 30)); }
  expect(turn).toBeTruthy(); await addNote(id, 'Newer note during stream'); const text = await (await response).text(); expect(text).not.toContain('History fixture complete.'); expect(text).not.toContain('"type":"lead.history"'); expect(text).toContain('access_denied');
});
test('navigation binds owned completed results to the exact lead, with origin/session checks', async () => {
  const id = await seed(); await addNote(id, 'A team note'); const run = await ask('owner', id);
  expect((await navigate('owner', run.accepted.turnId, id)).status()).toBe(200);
  for (const [role, leadId] of [['field', id], ['foreign', id], ['owner', randomUUID()], ['owner', undefined]] as const) expect((await navigate(role, run.accepted.turnId, leadId)).status()).toBe(403);
  expect((await navigate('owner', run.accepted.turnId, id, { href: 'https://evil.test' })).status()).toBe(422);
  expect((await clients.owner.post('/api/chat/leads/navigation', { headers: { Origin: 'https://evil.test' }, data: { workspaceId, resultId: run.accepted.turnId, leadId: id } })).status()).toBe(403);
  const anon = await requests.newContext({ baseURL: origin }); expect((await anon.post('/api/chat/leads/navigation', { headers, data: { workspaceId, resultId: run.accepted.turnId, leadId: id } })).status()).toBe(401); await anon.dispose();
});
test('live history card restores, opens its lead and clears stale cached notes after rejected navigation', async ({ page }) => {
  const id = await seed(); await addNote(id, 'PRIVATE_TEAM_HISTORY_SENTINEL'); await page.context().addCookies((await clients.owner.storageState()).cookies);
  await page.goto(`/home?workspace=${workspaceId}`); const open = () => page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click(); await open();
  await page.getByRole('textbox', { name: 'Ask the SalesMora assistant' }).fill(`fixture:history:${JSON.stringify({ leadRef: id, mode: 'notes' })}`); await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  const card = page.getByRole('dialog').getByRole('region', { name: 'Team notes', exact: true }); await expect(card).toBeVisible({ timeout: 15000 }); await expect(card.getByText('PRIVATE_TEAM_HISTORY_SENTINEL', { exact: true })).toBeVisible();
  await page.reload(); await open(); await expect(card).toBeVisible(); await card.getByRole('button', { name: /^Open lead record LD-/ }).click(); await expect(page).toHaveURL(new RegExp(`/leads/${id}`), { timeout: 20000 }); await expect(page.getByRole('dialog')).not.toBeVisible();
  await open(); await expect(card).toBeVisible(); await addNote(id, 'New team note'); await card.getByRole('button', { name: /^Open lead record LD-/ }).click(); await expect(card).not.toBeVisible(); await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Ask the assistant to retrieve them again.');
  await expect(page.getByRole('dialog').getByText('PRIVATE_TEAM_HISTORY_SENTINEL', { exact: true })).not.toBeVisible();
});
