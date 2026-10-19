import { test, expect, request as requests, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import type { LeadExportInput, LeadSearchInput } from '@salesmora/contracts';
import { createDatabase } from '@salesmora/data';
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL) throw Error('Use the isolated test database.');
const db = createDatabase(connection), origin = 'http://127.0.0.1:3002', headers = { Origin: origin };
const clients: Record<string, APIRequestContext> = {}, users: Record<string, string> = {};
let workspaceId: string, otherWorkspace: string;
const prefix = randomUUID(), ids: string[] = [];
const filters: LeadExportInput['filters'] = { query: 'Search Customer', stages: [], sources: [], ownerIds: [], created: 'any', from: '', to: '', attention: false, archived: false };
test.beforeAll(async () => {
  await db('rateLimits').delete();
  for (const role of ['owner', 'admin', 'office', 'field', 'other']) {
    clients[role] = await requests.newContext({ baseURL: origin });
    const email = `${prefix}-${role}@example.test`;
    expect((await clients[role].post('/api/auth/sign-up/email', { headers, data: { name: `Search ${role}`, email, password: 'Fictional-search-password-42!', termsAccepted: true } })).status()).toBe(200);
    users[role] = (await db('users').where({ email }).first()).id;
  }
  const input = { business: { businessName: 'Search fixture workspace', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } };
  workspaceId = (await (await clients.owner.post('/api/workspaces', { headers, data: input })).json()).workspaceId;
  otherWorkspace = (await (await clients.other.post('/api/workspaces', { headers, data: input })).json()).workspaceId;
  await db('workspaceMemberships').insert(['admin', 'office', 'field'].map(role => ({ workspaceId, userId: users[role], role })));
  for (let index = 0; index < 26; index++) {
    const id = randomUUID(); ids.push(id);
    await db('leads').insert({ id, workspaceId, createdBy: users.owner, ownerId: index % 2 ? users.owner : users.field, name: `Search Customer ${String(index).padStart(2, '0')}`, submissionId: randomUUID(), submissionHash: 'search-fixture', email: `secret-${index}@example.test`, phone: '212-555-0123', service: index % 2 ? 'Drain cleaning' : 'Fixture repair', address: 'Private location', details: 'PRIVATE_REQUEST_SENTINEL', notes: 'PRIVATE_NOTE_SENTINEL', stage: index % 2 ? 'new' : 'contacted', source: 'website', createdAt: new Date(Date.now() - index * 60000), archivedAt: index >= 24 ? new Date() : null });
  }
  await db('leads').insert({ id: randomUUID(), workspaceId: otherWorkspace, createdBy: users.other, ownerId: null, name: 'Search Customer FOREIGN_SENTINEL', submissionId: randomUUID(), submissionHash: 'search-foreign', email: '', phone: '', service: 'Foreign repair', address: '', details: '', notes: '', stage: 'new', source: 'website' });
});
test.beforeEach(async () => { await db('rateLimits').delete(); await db('chatTurns').where({ workspaceId }).whereNotIn('state', ['accepted', 'running']).update({ createdAt: new Date(Date.now() - 120000) }); });
test.afterAll(async () => { if (Object.values(users).length) await db('users').whereIn('id', Object.values(users)).delete(); await Promise.all(Object.values(clients).map(client => client.dispose())); await db.destroy(); });
async function send(role = 'owner', search: LeadSearchInput = { mode: 'filters', filters }, patch = {}) {
  const response = await clients[role].post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId: randomUUID(), surfaceKey: 'home', message: `fixture:search:${JSON.stringify(search)}`, ...patch } });
  expect(response.status()).toBe(200);
  const events = (await response.text()).split('\n\n').filter(line => line.startsWith('data: ')).map(line => JSON.parse(line.slice(6)));
  return { events, accepted: events[0], result: events.find(event => event.type === 'leads.results')?.result, text: events.filter(event => event.type === 'message.delta').map(event => event.text).join('') };
}
async function history(role: string, id: string) { return (await clients[role].get(`/api/chat/threads?workspace=${workspaceId}&thread=${id}`)).json(); }
async function navigate(role: string, id: string, leadId?: string, patch = {}) { return clients[role].post('/api/chat/leads/navigation', { headers, data: { workspaceId, resultId: id, ...(leadId ? { leadId } : {}), ...patch } }); }

test('all roles search real scoped data, ten newest records only, no contact/notes/foreign leaks or writes', async () => {
  const before = await db('leads').where({ workspaceId }).count('* as count').first();
  const admissions = await db('workspaceLeadAdmissions').where({ workspaceId }).count('* as count').first();
  for (const role of ['owner', 'admin', 'office', 'field']) {
    const run = await send(role); expect(run.events.at(-1).type).toBe('turn.completed');
    expect(run.result.total).toBe(role === 'field' ? 12 : 24); expect(run.result.rows).toHaveLength(10);
    expect(run.result.scope).toBe(role === 'field' ? 'assigned' : 'workspace');
    expect(run.result.rows[0].id).toBe(ids[0]);
    const body = JSON.stringify(run.events); for (const secret of ['PRIVATE_', 'secret-', '212-555', 'Private location', 'FOREIGN_SENTINEL']) expect(body).not.toContain(secret);
    if (role === 'field') expect(run.result.rows.every((row: { id: string }) => ids.indexOf(row.id) % 2 === 0)).toBe(true);
    const restored = await history(role, run.accepted.threadId); expect(restored.turns[0].searchResult).toEqual(run.result);
    expect(restored.turns[0].searchEvidence).toEqual([run.accepted.turnId]);
  }
  expect(await db('leads').where({ workspaceId }).count('* as count').first()).toEqual(before);
  expect(await db('workspaceLeadAdmissions').where({ workspaceId }).count('* as count').first()).toEqual(admissions);
});
test('stored current list filters, explicit filters, escaped text and zero results preserve constraints', async () => {
  const run = await send('owner', { mode: 'current_filters', filters: { ...filters, query: 'IGNORED' } }, { surfaceKey: 'leads.list', uiState: { view: 'pipeline', filters: { ...filters, stages: ['contacted'], ownerIds: ['me'] } } });
  expect(run.result.total).toBe(0);
  const name = await send('owner', { mode: 'filters', filters: { ...filters, query: 'Search Customer 00' } }); expect(name.result.rows.map((row: { id: string }) => row.id)).toEqual([ids[0]]);
  const narrow = await send('field', { mode: 'filters', filters: { ...filters, ownerIds: ['me'], stages: ['contacted'] } }); expect(narrow.result.total).toBe(12);
  for (const query of ['%_literal_escape', 'NO_MATCH_SENTINEL']) { const empty = await send('owner', { mode: 'filters', filters: { ...filters, query } }); expect(empty.result.total).toBe(0); expect(empty.result.rows).toEqual([]); }
});
test('archive visibility, owner filters and missing context cannot broaden read scope', async () => {
  const archived = await send('owner', { mode: 'filters', filters: { ...filters, archived: true } }); expect(archived.result.total).toBe(26);
  for (const [role, input] of [ ['field', { ...filters, archived: true }], ['office', { ...filters, archived: true }], ['field', { ...filters, ownerIds: ['unassigned'] }], ['field', { ...filters, ownerIds: [users.owner] }], ['owner', { ...filters, ownerIds: [users.other] }] ] as const) {
    const denied = await send(role, { mode: 'filters', filters: { ...input, ownerIds: [...input.ownerIds] } }); expect(denied.events.at(-1).code).toBe('access_denied'); expect(denied.result).toBeUndefined(); expect(denied.text).toBe('');
  }
  const missing = await send('owner', { mode: 'current_filters', filters }); expect(missing.result).toBeUndefined(); expect(missing.text).toContain('needs-filters');
  for (const bad of [{ ...filters, query: 'x' }, { ...filters, created: 'custom' as const, from: '2026-10-20', to: '2026-10-01' }]) { const invalid = await send('owner', { mode: 'filters', filters: bad }); expect(invalid.result).toBeUndefined(); expect(invalid.text).toContain('invalid-filters'); }
});
test('navigation only resolves owned completed search results and filters, never URLs or foreign row IDs', async () => {
  const run = await send(); const id = run.accepted.turnId;
  expect((await navigate('owner', id, ids[0])).status()).toBe(200);
  expect((await (await navigate('owner', id, ids[0])).json()).href).toBe(`/leads/${ids[0]}?workspace=${workspaceId}`);
  const href = (await (await navigate('owner', id)).json()).href;
  const url = new URL(href, origin); expect(url.searchParams.get('q')).toBe(filters.query); expect(url.searchParams.get('view')).toBe('list');
  for (const [role, lead] of [['field', ids[0]], ['other', ids[0]], ['owner', ids[20]]] as const) expect((await navigate(role, id, lead)).status()).toBe(403);
  expect((await navigate('owner', id, undefined, { href: 'https://evil.test' })).status()).toBe(422);
  expect((await clients.owner.post('/api/chat/leads/navigation', { headers: { Origin: 'https://evil.test' }, data: { workspaceId, resultId: id } })).status()).toBe(403);
  const anon = await requests.newContext({ baseURL: origin }); expect((await anon.post('/api/chat/leads/navigation', { headers, data: { workspaceId, resultId: id } })).status()).toBe(401); await anon.dispose();
});
test('edits, assignment loss, deletion, owner label changes and new matches invalidate stored search text/card/navigation', async () => {
  const run = await send('field');
  await db('leads').where({ id: ids[0] }).update({ ownerId: users.owner }).increment('version', 1);
  const old = await history('field', run.accepted.threadId); expect(old.turns[0].searchResult).toBeUndefined(); expect(old.messages.filter((row: { role: string }) => row.role === 'assistant').every((row: { text: string }) => !row.text.includes('Search Customer'))).toBe(true);
  expect((await navigate('field', run.accepted.turnId, ids[0])).status()).toBe(403);
  await db('leads').where({ id: ids[0] }).update({ ownerId: users.field }).increment('version', 1);
  const edited = await send(); await db('leads').where({ id: ids[0] }).increment('version', 1); expect((await history('owner', edited.accepted.threadId)).turns[0].searchResult).toBeUndefined();
  const label = await send(); await db('users').where({ id: users.field }).update({ name: 'Renamed Field' }); expect((await navigate('owner', label.accepted.turnId)).status()).toBe(403); await db('users').where({ id: users.field }).update({ name: 'Search field' });
  const count = await send(); const extra = randomUUID(); await db('leads').insert({ id: extra, workspaceId, createdBy: users.owner, ownerId: null, name: 'Search Customer extra', submissionId: randomUUID(), submissionHash: 'search-extra', email: '', phone: '', service: 'Fixture', address: '', details: '', notes: '', stage: 'new', source: 'website' });
  expect((await history('owner', count.accepted.threadId)).turns[0].searchResult).toBeUndefined(); await db('leads').where({ id: extra }).delete();
  const deleted = await send('owner', { mode: 'filters', filters: { ...filters, query: 'Search Customer 25', archived: true } }); await db('leads').where({ id: ids[25] }).delete(); expect((await navigate('owner', deleted.accepted.turnId)).status()).toBe(403);
});
test('empty searches and follow-up answers inherit collection freshness and invalidate when a match appears', async () => {
  const run = await send('owner', { mode: 'filters', filters: { ...filters, query: 'Future Unique Search' } }); expect(run.result.total).toBe(0);
  const follow = await send('owner', undefined, { threadId: run.accepted.threadId, message: 'fixture:search-history' });
  expect((await db('chatTurns').where({ id: follow.accepted.turnId }).first()).leadSearchEvidence).toEqual([run.accepted.turnId]);
  const extra = randomUUID(); await db('leads').insert({ id: extra, workspaceId, createdBy: users.owner, ownerId: null, name: 'Future Unique Search', submissionId: randomUUID(), submissionHash: 'search-future', email: '', phone: '', service: 'Fixture', address: '', details: '', notes: '', stage: 'new', source: 'website' });
  const saved = await history('owner', run.accepted.threadId); expect(saved.turns.every((row: { searchResult?: unknown; searchEvidence: string[] }) => !row.searchResult && !row.searchEvidence.length)).toBe(true);
  expect(saved.messages.filter((row: { role: string }) => row.role === 'assistant').every((row: { text: string }) => !row.text.includes('authorized-lead-search'))).toBe(true); await db('leads').where({ id: extra }).delete();
});
test('revoking read permission hides results and denies future search and navigation', async () => {
  const run = await send('field'); const grants = await db('workspaceRolePolicies').where({ workspaceId, role: 'field' }).whereNot({ permission: 'assistant.use' });
  await db('workspaceRolePolicies').where({ workspaceId, role: 'field' }).whereNot({ permission: 'assistant.use' }).delete();
  try { expect((await history('field', run.accepted.threadId)).turns[0].searchResult).toBeUndefined(); expect((await navigate('field', run.accepted.turnId)).status()).toBe(403); const denied = await send('field'); expect(denied.events.at(-1).code).toBe('access_denied'); }
  finally { await db('workspaceRolePolicies').insert(grants); }
});
test('pending mutation confirmation rechecks inherited search evidence', async () => {
  const found = await send();
  const proposal = await send('owner', undefined, { threadId: found.accepted.threadId, message: `fixture:stage-ref:${ids[0]}` });
  const action = proposal.events.find(event => event.type === 'action.proposed')?.action; expect(action).toBeTruthy();
  await db('leads').where({ id: ids[1] }).increment('version', 1);
  expect((await clients.owner.post('/api/chat/actions', { headers, data: { workspaceId, draftId: action.id, inputHash: action.inputHash, decision: 'confirm' } })).status()).toBe(403);
});
test('live assistant card restores, opens the matching filtered list and opens a record', async ({ page }) => {
  await page.context().addCookies((await clients.owner.storageState()).cookies);
  await page.goto(`/home?workspace=${workspaceId}`);
  await page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click();
  await page.getByRole('textbox', { name: 'Ask the SalesMora assistant' }).fill(`fixture:search:${JSON.stringify({ mode: 'filters', filters })}`);
  await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  const card = page.getByRole('region', { name: 'Lead search results', exact: true }); await expect(card).toBeVisible(); await expect(card.getByText('Showing 10 of 24 matching leads')).toBeVisible();
  await page.reload(); await page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click(); await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'Open matching Leads list', exact: true }).click(); await expect(page).toHaveURL(/\/leads\?/); expect(new URL(page.url()).searchParams.get('q')).toBe(filters.query); expect(new URL(page.url()).searchParams.get('view')).toBe('list');
  await page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click(); await expect(card).toBeVisible();
  await card.getByRole('button', { name: /Open LD-.*Search Customer 00/ }).click(); await expect(page).toHaveURL(new RegExp(`/leads/${ids[0]}`)); await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('a new match during an empty-result stream prevents later deltas and card release', async () => {
  const query = 'Stream future search', clientTurnId = randomUUID();
  const pending = clients.owner.post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId, surfaceKey: 'home', message: `fixture:search-slow:${JSON.stringify({ mode: 'filters', filters: { ...filters, query } })}` } });
  let turn;
  for (let attempt = 0; attempt < 200; attempt++) {
    turn = await db('chatTurns as t').join('chatMessages as m', 'm.turnId', 't.id').where({ 't.clientTurnId': clientTurnId, 'm.role': 'assistant' }).where('m.text', '<>', '').select('t.id', 't.threadId').first();
    if (turn) break;
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  expect(turn).toBeTruthy();
  const extra = randomUUID();
  await db.transaction(async trx => { await trx('workspaces').where({ id: workspaceId }).forUpdate().first(); await trx('leads').insert({ id: extra, workspaceId, createdBy: users.owner, ownerId: null, name: query, submissionId: randomUUID(), submissionHash: 'search-stream', email: '', phone: '', service: 'Fixture', address: '', details: '', notes: '', stage: 'new', source: 'website' }); });
  const response = await pending, text = await response.text(); expect(text).toContain('access_denied'); expect(text).not.toContain('Search fixture complete.'); expect(text).not.toContain('leads.results');
  expect((await history('owner', turn.threadId)).turns[0].searchResult).toBeUndefined();
  await db('leads').where({ id: extra }).delete();
});
test('stale card navigation clears cached results and displays a fresh-search message', async ({ page }) => {
  await page.context().addCookies((await clients.owner.storageState()).cookies);
  await page.goto(`/home?workspace=${workspaceId}`); await page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click();
  await page.getByRole('textbox', { name: 'Ask the SalesMora assistant' }).fill(`fixture:search:${JSON.stringify({ mode: 'filters', filters })}`);
  await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  const card = page.getByRole('region', { name: 'Lead search results', exact: true }); await expect(card).toBeVisible();
  await db('leads').where({ id: ids[0] }).increment('version', 1);
  await card.getByRole('button', { name: 'Open matching Leads list', exact: true }).click();
  await expect(card).not.toBeVisible(); await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Ask the assistant to search again.');
  await expect(page).toHaveURL(/\/home\?/);
});

test('former or foreign owner references display no private teammate name and remain in unassigned filters', async () => {
  const id = randomUUID();
  await db('leads').insert({ id, workspaceId, createdBy: users.owner, ownerId: users.other, name: 'Former Local Lead', submissionId: randomUUID(), submissionHash: 'search-former', email: '', phone: '', service: 'Fixture', address: '', details: '', notes: '', stage: 'new', source: 'website' });
  try {
    const run = await send('owner', { mode: 'filters', filters: { ...filters, query: 'Former Local Lead', ownerIds: ['unassigned'] } });
    expect(run.result.total).toBe(1); expect(run.result.rows[0].ownerName).toBe('Former teammate'); expect(JSON.stringify(run.result)).not.toContain('Search other');
  } finally { await db('leads').where({ id }).delete(); }
});

test('teammate filter labels respect the manual roster permission while ordinary search stays available', async () => {
  const grant = await db('workspaceRolePolicies').where({ workspaceId, role: 'office', permission: 'leads.assign' }).first();
  await db('workspaceRolePolicies').where({ workspaceId, role: 'office', permission: 'leads.assign' }).delete();
  try {
    const general = await send('office'); expect(general.result.scope).toBe('workspace');
    const self = await send('office', { mode: 'filters', filters: { ...filters, query: 'No matching local lead', ownerIds: ['me'] } }); expect(self.result.total).toBe(0);
    const denied = await send('office', { mode: 'filters', filters: { ...filters, query: 'No matching local lead', ownerIds: [users.admin] } });
    expect(denied.events.at(-1).code).toBe('access_denied'); expect(denied.text).not.toContain('Search admin'); expect(denied.result).toBeUndefined();
  } finally { await db('workspaceRolePolicies').insert(grant); }
});
