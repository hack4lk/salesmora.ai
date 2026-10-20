import { test, expect, request as requests, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase } from '@salesmora/data';
test.setTimeout(60_000);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL) throw Error('Use the isolated test database.');
const db = createDatabase(connection), origin = 'http://127.0.0.1:3002', headers = { Origin: origin };
const clients: Record<string, APIRequestContext> = {}, users: Record<string, string> = {};
let workspaceId: string, foreignWorkspace: string;
const values = { name: 'Details fixture customer', service: 'Furnace repair', email: 'details-private@example.test', phone: '(212) 555-0142', address: '18 Willow Street', details: 'PRIVATE_REQUEST_SENTINEL\nCall before arriving.', notes: 'PRIVATE_INTERNAL_SENTINEL\nKeep the side entrance clear.' };
test.beforeAll(async () => {
  await db('rateLimits').delete(); const prefix = randomUUID();
  for (const role of ['owner', 'admin', 'office', 'field', 'foreign']) {
    clients[role] = await requests.newContext({ baseURL: origin }); const email = `${prefix}-${role}@example.test`;
    expect((await clients[role].post('/api/auth/sign-up/email', { headers, data: { name: `Details ${role}`, email, password: 'Fictional-details-password-42!', termsAccepted: true } })).status()).toBe(200);
    users[role] = (await db('users').where({ email }).first()).id;
  }
  const input = { business: { businessName: 'Details fixture workspace', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } };
  workspaceId = (await (await clients.owner.post('/api/workspaces', { headers, data: input })).json()).workspaceId;
  foreignWorkspace = (await (await clients.foreign.post('/api/workspaces', { headers, data: input })).json()).workspaceId;
  await db('workspaceMemberships').insert(['admin', 'office', 'field'].map(role => ({ workspaceId, userId: users[role], role })));
});
test.beforeEach(async () => { await db('rateLimits').delete(); await db('chatTurns').where({ workspaceId }).whereNotIn('state', ['accepted', 'running']).update({ createdAt: new Date(Date.now() - 120000) }); });
test.afterAll(async () => { if (Object.values(users).length) await db('users').whereIn('id', Object.values(users)).delete(); await Promise.all(Object.values(clients).map(client => client.dispose())); await db.destroy(); });
async function seed(patch = {}, workspace = workspaceId) {
  const id = randomUUID(); await db('leads').insert({ id, workspaceId: workspace, createdBy: workspace === workspaceId ? users.owner : users.foreign, ownerId: users.field, submissionId: randomUUID(), submissionHash: 'details-fixture', ...values, source: 'website', stage: 'new', ...patch }); return id;
}
async function ask(role = 'owner', ref = '', patch = {}) {
  const response = await clients[role].post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId: randomUUID(), surfaceKey: 'home', message: `fixture:details:${JSON.stringify({ leadRef: ref })}`, ...patch } });
  expect(response.status()).toBe(200);
  const events = (await response.text()).split('\n\n').filter(line => line.startsWith('data: ')).map(line => JSON.parse(line.slice(6)));
  return { events, accepted: events[0], result: events.find(event => event.type === 'lead.details')?.result, text: events.filter(event => event.type === 'message.delta').map(event => event.text).join('') };
}
async function history(role: string, id: string) { const response = await clients[role].get(`/api/chat/threads?workspace=${workspaceId}&thread=${id}`); expect(response.status()).toBe(200); return response.json(); }
async function navigate(role: string, resultId: string, leadId?: string, patch = {}) { return clients[role].post('/api/chat/leads/navigation', { headers, data: { workspaceId, resultId, ...(leadId ? { leadId } : {}), ...patch } }); }
async function number(id: string) { return `LD-${String((await db('leads').where({ id }).first()).leadNumber).padStart(4, '0')}`; }
function assistantText(saved: { messages: { role: string; text: string }[] }) { return saved.messages.filter(row => row.role === 'assistant').map(row => row.text).join(''); }

test('all roles read an authorized complete record without writes, roster or team-timeline disclosure', async () => {
  const id = await seed();
  expect((await clients.owner.post(`/api/leads/${id}/notes`, { headers, data: { workspaceId, leadId: id, submissionId: randomUUID(), body: 'TEAM_TIMELINE_SENTINEL' } })).status()).toBe(200);
  const before = await db('leads').where({ id }).first(); const admissions = await db('workspaceLeadAdmissions').where({ workspaceId }).count('* as count').first();
  for (const role of ['owner', 'admin', 'office', 'field']) {
    const run = await ask(role, id); expect(run.events.at(-1).type).toBe('turn.completed');
    expect(run.result.scope).toBe(role === 'field' ? 'assigned' : 'workspace');
    for (const [key, value] of Object.entries(values)) expect(run.result.lead[key]).toBe(value);
    expect(run.result.lead.ownerName).toBe('Details field'); expect(JSON.stringify(run.events)).not.toContain('TEAM_TIMELINE_SENTINEL');
    for (const key of ['ownerId', 'canEdit', 'teamNotes', 'activity', 'version']) expect(run.result.lead[key]).toBeUndefined();
    const saved = await history(role, run.accepted.threadId); expect(saved.turns[0].detailsResult).toEqual(run.result);
    expect(saved.turns[0].leadEvidence.find((source: { id: string }) => source.id === id).ownerStamp).toMatch(/^[a-f0-9]{64}$/);
  }
  expect(await db('leads').where({ id }).first()).toEqual(before);
  expect(await db('workspaceLeadAdmissions').where({ workspaceId }).count('* as count').first()).toEqual(admissions);
});
test('exact UUID/LD references work on Home/list and the selected detail record supplies an empty reference', async () => {
  const id = await seed(), ref = await number(id);
  for (const surfaceKey of ['home', 'leads.list']) expect((await ask('field', ref.toLowerCase(), { surfaceKey })).result.lead.id).toBe(id);
  const selected = await ask('field', '', { surfaceKey: 'lead.detail', recordRefs: [{ type: 'lead', id }] }); expect(selected.result.lead.id).toBe(id);
  for (const leadRef of ['', 'Details fixture customer', 'first result', "' OR 1=1 --"]) { const missing = await ask('owner', leadRef); expect(missing.result).toBeUndefined(); expect(missing.text).toContain('target-required'); }
});
test('other assignees, foreign IDs, absent records and out-of-range numbers return the same unavailable outcome', async () => {
  const other = await seed({ ownerId: users.owner }), foreign = await seed({}, foreignWorkspace);
  const results = [];
  for (const ref of [other, foreign, randomUUID(), 'LD-0', 'LD-2147483648', 'LD-999999999999']) {
    const run = await ask('field', ref); expect(run.result).toBeUndefined(); expect(run.events.at(-1).type).toBe('turn.completed'); results.push(run.text);
    for (const value of Object.values(values)) expect(run.text).not.toContain(value);
  }
  expect(new Set(results).size).toBe(1);
});
test('readable archived and Won leads retain manual detail parity without archive or edit permission', async () => {
  const id = await seed({ archivedAt: new Date(), stage: 'won' });
  const result = await ask('field', id); expect(result.result.lead.archived).toBe(true); expect(result.result.lead.stage).toBe('won');
  const grant = await db('workspaceRolePolicies').where({ workspaceId, role: 'field', permission: 'leads.update' }).first();
  await db('workspaceRolePolicies').where({ workspaceId, role: 'field', permission: 'leads.update' }).delete();
  try { expect((await ask('field', id)).result.lead.phone).toBe(values.phone); }
  finally { await db('workspaceRolePolicies').insert(grant); }
});
test('empty fields and former/unassigned ownership are accurate and never expose a foreign teammate name', async () => {
  for (const ownerId of [null, users.foreign]) {
    const id = await seed({ ownerId, email: '', phone: '', address: '', details: '', notes: '' }); const run = await ask('owner', id);
    expect(run.result.lead.ownerName).toBe(ownerId ? 'Former teammate' : null); expect(run.result.lead.notes).toBe(''); expect(JSON.stringify(run.events)).not.toContain('Details foreign');
  }
});
test('maximum normal text is intact; excessive serialized output returns no partial card', async () => {
  const details = 'd'.repeat(10000), notes = 'n'.repeat(10000), id = await seed({ details, notes });
  const complete = await ask('owner', id); expect(complete.result.lead.details).toBe(details); expect(complete.result.lead.notes).toBe(notes);
  const huge = await seed({ details: '\u0001'.repeat(10000), notes: '\u0001'.repeat(10000) });
  const bounded = await ask('owner', huge); expect(bounded.result).toBeUndefined(); expect(bounded.text).toContain('too-large'); expect(bounded.text).not.toContain(values.email);
  expect((await db('chatTurns').where({ id: bounded.accepted.turnId }).first()).leadDetailsResult).toBeNull();
});
test('forged tool authority, browser evidence and cross-origin requests cannot return detail data', async () => {
  const id = await seed();
  const invalid = await ask('field', id, { message: `fixture:details:${JSON.stringify({ leadRef: id, scope: 'workspace' })}` }); expect(invalid.result).toBeUndefined(); expect(invalid.text).toBe('');
  const body = { workspaceId, clientTurnId: randomUUID(), surfaceKey: 'home', message: 'fixture:details:{}', leadEvidence: [{ id, version: 1 }] };
  expect((await clients.owner.post('/api/chat/turns', { headers, data: body })).status()).toBe(422);
  expect((await clients.owner.post('/api/chat/turns', { headers: { Origin: 'https://evil.test' }, data: body })).status()).toBe(403);
});
test('edits, reassignment and deletion hide saved cards and all source-dependent private answer text', async () => {
  for (const change of ['edit', 'assign', 'delete']) {
    const id = await seed(), run = await ask('field', id); expect(run.result).toBeTruthy();
    if (change === 'delete') await db('leads').where({ id }).delete();
    else await db('leads').where({ id }).update(change === 'assign' ? { ownerId: users.owner } : { phone: 'Changed elsewhere' }).increment('version', 1);
    const saved = await history('field', run.accepted.threadId); expect(saved.turns[0].detailsResult).toBeUndefined(); expect(assistantText(saved)).not.toContain(values.email);
    expect((await navigate('field', run.accepted.turnId, id)).status()).toBe(403);
  }
});
test('owner display-name changes invalidate retained cards, derived answers and pending confirmations without a lead-version change', async () => {
  const id = await seed(), run = await ask('owner', id), threadId = run.accepted.threadId;
  const follow = await ask('owner', '', { threadId, message: 'fixture:details-history' }); expect(follow.text).toContain(values.email);
  const bare = await ask('owner', '', { threadId, surfaceKey: 'lead.detail', recordRefs: [{ type: 'lead', id }], message: 'fixture:context' });
  const proposal = await ask('owner', '', { threadId, message: `fixture:stage-ref:${id}` }); const action = proposal.events.find(event => event.type === 'action.proposed')?.action; expect(action).toBeTruthy();
  expect((await db('chatTurns').where({ id: bare.accepted.turnId }).first()).leadEvidence.find((source: { id: string }) => source.id === id).ownerStamp).toBeTruthy();
  const version = (await db('leads').where({ id }).first()).version;
  await db('users').where({ id: users.field }).update({ name: 'Renamed details owner' });
  try {
    expect((await db('leads').where({ id }).first()).version).toBe(version);
    const saved = await history('owner', threadId); expect(saved.turns.every((turn: { detailsResult?: unknown }) => !turn.detailsResult)).toBe(true); expect(assistantText(saved)).not.toContain(values.email);
    expect((await clients.owner.post('/api/chat/actions', { headers, data: { workspaceId, draftId: action.id, inputHash: action.inputHash, decision: 'confirm' } })).status()).toBe(403);
  } finally { await db('users').where({ id: users.field }).update({ name: 'Details field' }); }
});
test('a former membership hides the old owner label while a fresh authorized read uses Former teammate', async () => {
  const id = await seed(), run = await ask('owner', id);
  await db('workspaceMemberships').where({ workspaceId, userId: users.field }).delete();
  try { expect((await history('owner', run.accepted.threadId)).turns[0].detailsResult).toBeUndefined(); expect((await ask('owner', id)).result.lead.ownerName).toBe('Former teammate'); }
  finally { await db('workspaceMemberships').insert({ workspaceId, userId: users.field, role: 'field' }); }
});
test('role/read revocation blocks saved and future reads under a valid dependency policy', async () => {
  const id = await seed(), run = await ask('field', id);
  const grants = await db('workspaceRolePolicies').where({ workspaceId, role: 'field' }).whereNot({ permission: 'assistant.use' });
  await db('workspaceRolePolicies').where({ workspaceId, role: 'field' }).whereNot({ permission: 'assistant.use' }).delete();
  try {
    expect((await history('field', run.accepted.threadId)).turns[0].detailsResult).toBeUndefined(); const denied = await ask('field', id); expect(denied.events.at(-1).code).toBe('access_denied');
    expect((await navigate('field', run.accepted.turnId, id)).status()).toBe(403);
  } finally { await db('workspaceRolePolicies').insert(grants); }
});
test('ownership provenance survives authorized stage and assignment confirmations, while older snapshots stay restricted', async () => {
  const id = await seed(), read = await ask('owner', id);
  const stage = await ask('owner', '', { threadId: read.accepted.threadId, message: `fixture:stage-ref:${id}` }); const stageAction = stage.events.find(event => event.type === 'action.proposed').action;
  expect((await clients.owner.post('/api/chat/actions', { headers, data: { workspaceId, draftId: stageAction.id, inputHash: stageAction.inputHash, decision: 'confirm' } })).status()).toBe(200);
  const fresh = await ask('owner', id);
  const assign = await ask('owner', '', { threadId: fresh.accepted.threadId, message: `fixture:assign:${JSON.stringify({ leadRef: id, assignment: { kind: 'self', teammateRef: '' } })}` }); const action = assign.events.find(event => event.type === 'action.proposed').action;
  expect((await clients.owner.post('/api/chat/actions', { headers, data: { workspaceId, draftId: action.id, inputHash: action.inputHash, decision: 'confirm' } })).status()).toBe(200);
  const saved = await history('owner', fresh.accepted.threadId); expect(saved.turns.at(-1).action.state).toBe('confirmed'); expect(saved.turns[0].detailsResult).toBeUndefined();
});
test('owner-label changes during streaming prevent later deltas and detail-card release', async () => {
  const id = await seed(), clientTurnId = randomUUID();
  const pending = clients.owner.post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId, surfaceKey: 'home', message: `fixture:details-slow:${JSON.stringify({ leadRef: id })}` } });
  let turn;
  for (let attempt = 0; attempt < 200; attempt++) {
    turn = await db('chatTurns as t').join('chatMessages as m', 'm.turnId', 't.id').where({ 't.clientTurnId': clientTurnId, 'm.role': 'assistant' }).where('m.text', '<>', '').first('t.id', 't.threadId'); if (turn) break;
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  expect(turn).toBeTruthy(); await db('users').where({ id: users.field }).update({ name: 'Changed mid-stream' });
  try { const text = await (await pending).text(); expect(text).toContain('access_denied'); expect(text).not.toContain('Details fixture complete.'); expect(text).not.toContain('"type":"lead.details"'); expect((await history('owner', turn.threadId)).turns[0].detailsResult).toBeUndefined(); }
  finally { await db('users').where({ id: users.field }).update({ name: 'Details field' }); }
});
test('navigation requires the owned completed result and matching lead, and rejects arbitrary destinations', async () => {
  const id = await seed(), run = await ask('owner', id);
  expect((await (await navigate('owner', run.accepted.turnId, id)).json()).href).toBe(`/leads/${id}?workspace=${workspaceId}`);
  for (const [role, leadId] of [['field', id], ['foreign', id], ['owner', randomUUID()], ['owner', undefined]] as const) expect((await navigate(role, run.accepted.turnId, leadId)).status()).toBe(403);
  expect((await navigate('owner', run.accepted.turnId, id, { href: 'https://evil.test' })).status()).toBe(422);
  expect((await clients.owner.post('/api/chat/leads/navigation', { headers: { Origin: 'https://evil.test' }, data: { workspaceId, resultId: run.accepted.turnId, leadId: id } })).status()).toBe(403);
  const anon = await requests.newContext({ baseURL: origin }); expect((await anon.post('/api/chat/leads/navigation', { headers, data: { workspaceId, resultId: run.accepted.turnId, leadId: id } })).status()).toBe(401); await anon.dispose();
});
test('live card restores after reload, opens its record, and removes stale cached details on rejected navigation', async ({ page }) => {
  const id = await seed(); await page.context().addCookies((await clients.owner.storageState()).cookies);
  await page.goto(`/home?workspace=${workspaceId}`); const open = () => page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click(); await open();
  await page.getByRole('textbox', { name: 'Ask the SalesMora assistant' }).fill(`fixture:details:${JSON.stringify({ leadRef: id })}`); await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  const card = page.getByRole('region', { name: 'Lead details', exact: true }); await expect(card).toBeVisible({ timeout: 15000 }); await expect(card.getByText(values.email, { exact: true })).toBeVisible();
  await page.reload(); await open(); await expect(card).toBeVisible(); await card.getByRole('button', { name: /^Open lead record LD-/ }).click(); await expect(page).toHaveURL(new RegExp(`/leads/${id}`), { timeout: 20000 }); await expect(page.getByRole('dialog')).not.toBeVisible();
  await open(); await expect(card).toBeVisible(); await db('leads').where({ id }).increment('version', 1); await card.getByRole('button', { name: /^Open lead record LD-/ }).click();
  await expect(card).not.toBeVisible(); await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Ask the assistant to retrieve them again.');
  await expect(page.getByRole('dialog').getByText(values.email, { exact: true })).not.toBeVisible();
});
