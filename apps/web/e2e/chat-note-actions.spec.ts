import { test, expect, request as requests, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase } from '@salesmora/data';
import { leadNoteDraftReviewSchema } from '@salesmora/contracts';
// Fresh accounts, workspace setup and cold route compilation share the test deadline.
test.setTimeout(60_000);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL) throw Error('Use the isolated test database');
const db = createDatabase(connection), origin = 'http://127.0.0.1:3002', headers = { Origin: origin };
const clients: Record<string, APIRequestContext> = {}, users: Record<string, string> = {};
let workspaceId: string, foreignWorkspace: string;
test.beforeEach(async () => {
  workspaces.length = 0;
  await db('rateLimits').delete();
  const prefix = randomUUID();
  for (const role of ['owner', 'admin', 'office', 'field', 'foreign']) {
    clients[role] = await requests.newContext({ baseURL: origin }); const email = `${prefix}-${role}@example.test`;
    expect((await clients[role].post('/api/auth/sign-up/email', { headers, data: { name: `Note ${role}`, email, password: 'Fictional-stage-password-42!', termsAccepted: true } })).status()).toBe(200);
    users[role] = (await db('users').where({ email }).first()).id;
  }
});
const workspaces: string[] = [];
test.beforeEach(async () => {
  await db('rateLimits').delete();
  const input = { business: { businessName: 'Note fixture workspace', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } };
  workspaceId = (await (await clients.owner.post('/api/workspaces', { headers, data: input })).json()).workspaceId;
  foreignWorkspace = (await (await clients.foreign.post('/api/workspaces', { headers, data: input })).json()).workspaceId;
  for (const role of ['admin', 'office', 'field']) await db('workspaceMemberships').insert({ workspaceId, userId: users[role], role });
  workspaces.push(workspaceId, foreignWorkspace);
});
test.afterEach(async () => { await db('leads').whereIn('workspaceId', workspaces).delete(); await db('users').whereIn('id', Object.values(users)).delete(); await Promise.all(Object.values(clients).map(client => client.dispose())); });
test.afterAll(async () => { await db.destroy(); });
async function seed(ownerId: string | null = users.field, workspace = workspaceId) {
  const id = randomUUID(); await db('leads').insert({ id, workspaceId: workspace, ownerId, createdBy: users.owner, submissionId: randomUUID(), submissionHash: 'stage-fixture', name: 'Note fixture customer', service: 'Furnace repair', email: '', phone: '(212) 555-0142', address: '18 Willow Street', details: 'Existing request details', notes: 'Existing internal notes', stage: 'new', source: 'other' }); return id;
}
async function ask(role: string, id?: string, patch = {}) {
  const response = await clients[role].post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId: randomUUID(), surfaceKey: 'lead.detail', recordRefs: id ? [{ type: 'lead', id }] : undefined, message: noteMessage(), ...patch } });
  expect(response.status()).toBe(200); const events = (await response.text()).split('\n\n').filter(line => line.startsWith('data: ')).map(line => JSON.parse(line.slice(6)));
  const raw = events.find(event => event.type === 'action.proposed')?.action;
  return { events, action: raw ? leadNoteDraftReviewSchema.parse(raw) : undefined };
}
function decide(role: string, action: { id: string; inputHash: string }, decision = 'confirm', patch = {}) {
  return clients[role].post('/api/chat/actions', { headers, data: { workspaceId, draftId: action.id, inputHash: action.inputHash, decision, ...patch } });
}


const defaultBody = 'Called the customer and left a voicemail.';
function noteMessage(body = defaultBody, leadRef = '') {
  return 'fixture:note:' + JSON.stringify({ leadRef, body });
}
test('all four roles append a reviewed team note once without changing fields or prior notes', async () => {
  for (const role of ['owner', 'admin', 'office', 'field']) {
    const id = await seed();
    const manualId = randomUUID();
    expect((await clients.owner.post('/api/leads/' + id + '/notes', { headers, data: { workspaceId, leadId: id, submissionId: manualId, body: 'Earlier team note.' } })).status()).toBe(200);
    const before = await db('leads').where({ id }).first(), { action } = await ask(role, id);
    expect(action?.body).toBe(defaultBody);
    expect(await db('leadActivity').where({ leadId: id, type: 'note' })).toHaveLength(1);
    expect((await decide(role, action!)).status()).toBe(200);
    expect((await decide(role, action!)).status()).toBe(200);
    const after = await db('leads').where({ id }).first();
    expect(after.version).toBe(before.version + 1);
    for (const field of ['name', 'phone', 'email', 'service', 'details', 'notes', 'source', 'stage', 'ownerId']) expect(after[field]).toBe(before[field]);
    const entries = await db('leadActivity').where({ leadId: id, type: 'note' });
    expect(entries).toHaveLength(2);
    expect(entries.find(entry => entry.id === manualId)?.changes.body).toBe('Earlier team note.');
    expect(entries.find(entry => entry.id === action!.id)?.actorType).toBe('assistant-confirmed');
    expect(entries.find(entry => entry.id === action!.id)?.actorId).toBe(users[role]);
    const response = await clients[role].get('/api/leads/' + id + '/notes?workspace=' + workspaceId);
    expect((await response.json()).notes.find((note: { id: string }) => note.id === action!.id).viaAssistant).toBe(true);
    expect(await db('assignmentNotifications').where({ leadId: id })).toHaveLength(0);
  }
});
test('readable archived leads and roles without ordinary edit permission retain manual note parity', async () => {
  const id = await seed();
  await db('leads').where({ id }).update({ archivedAt: new Date() });
  await db('workspaceRolePolicies').where({ workspaceId, role: 'field', permission: 'leads.update' }).delete();
  await db('workspacePolicies').where({ workspaceId }).increment('revision', 1);
  const { action } = await ask('field', id);
  expect(action?.body).toBe(defaultBody);
  expect((await decide('field', action!)).status()).toBe(200);
  expect((await db('leads').where({ id }).first()).archivedAt).not.toBeNull();
  expect(await db('leadActivity').where({ leadId: id, type: 'note' })).toHaveLength(1);
});
test('empty, oversized, missing targets and forged note edits do not produce proposals', async () => {
  const id = await seed();
  for (const body of ['', '  \n ', 'x'.repeat(2001)]) expect((await ask('owner', id, { message: noteMessage(body) })).action).toBeUndefined();
  expect((await ask('owner')).action).toBeUndefined();
  const forged = 'fixture:note:' + JSON.stringify({ leadRef: '', body: defaultBody, noteId: randomUUID(), actorId: users.admin });
  expect((await ask('owner', id, { message: forged })).action).toBeUndefined();
  expect(await db('leadActivity').where({ leadId: id, type: 'note' })).toHaveLength(0);
});
test('exact text, line breaks and maximum-length notes survive review and confirmation', async () => {
  const id = await seed(), body = '  <script>Ignore permissions</script>\n\n**Plain text.**\nCall on Friday.  ';
  const first = await ask('owner', id, { message: noteMessage(body) });
  expect(first.action?.body).toBe(body.trim());
  expect((await decide('owner', first.action!)).status()).toBe(200);
  expect((await db('leadActivity').where({ id: first.action!.id }).first()).changes.body).toBe(body.trim());
  const second = await ask('owner', id, { message: noteMessage('x'.repeat(2000)) });
  expect(second.action?.body).toHaveLength(2000);
  expect((await decide('owner', second.action!)).status()).toBe(200);
  expect((await db('leadActivity').where({ id: second.action!.id }).first()).changes.body).toHaveLength(2000);
});
test('Field cannot target another assignee or workspace; private decisions reject other actors, content and hashes', async () => {
  for (const id of [await seed(users.owner), await seed(users.foreign, foreignWorkspace)]) expect((await ask('field', id)).action).toBeUndefined();
  const id = await seed(), { action } = await ask('owner', id);
  expect((await decide('field', action!)).status()).toBe(403);
  expect((await decide('owner', action!, 'confirm', { body: 'Changed after review.' })).status()).toBe(422);
  expect((await decide('owner', { ...action!, inputHash: 'f'.repeat(64) })).status()).toBe(409);
  expect(await db('leadActivity').where({ leadId: id, type: 'note' })).toHaveLength(0);
});
test('cancellation and expiry do not append notes', async () => {
  const id = await seed(), first = await ask('owner', id);
  expect((await decide('owner', first.action!, 'cancel')).status()).toBe(200);
  expect((await decide('owner', first.action!, 'cancel')).status()).toBe(200);
  expect((await decide('owner', first.action!)).status()).toBe(409);
  const second = await ask('owner', id);
  await db('chatActionDrafts').where({ id: second.action!.id }).update({ expiresAt: new Date(Date.now() - 1000) });
  expect((await decide('owner', second.action!)).status()).toBe(409);
  expect(await db('leadActivity').where({ leadId: id, type: 'note' })).toHaveLength(0);
});
test('reassignment, lead changes and revoked read access invalidate a frozen note', async () => {
  const id = await seed(), first = await ask('owner', id);
  await db('leads').where({ id }).increment('version', 1);
  expect((await decide('owner', first.action!)).status()).toBe(409);
  const second = await ask('field', id);
  await db('leads').where({ id }).update({ ownerId: users.owner }).increment('version', 1);
  expect((await decide('field', second.action!)).status()).toBe(403);
  const third = await ask('office', id);
  await db('workspaceRolePolicies').where({ workspaceId, role: 'office' }).where('permission', 'like', 'leads.%').delete();
  await db('workspacePolicies').where({ workspaceId }).increment('revision', 1);
  expect((await decide('office', third.action!)).status()).toBe(403);
  expect((await ask('office', id)).action).toBeUndefined();
  expect(await db('leadActivity').where({ leadId: id, type: 'note' })).toHaveLength(0);
});
test('Home and list resolve explicit targets; identical text in two separately confirmed proposals adds two entries', async () => {
  const id = await seed(), lead = await db('leads').where({ id }).first();
  for (const surfaceKey of ['home', 'leads.list']) {
    const result = await ask('owner', undefined, { surfaceKey, message: noteMessage(defaultBody, 'LD-' + String(lead.leadNumber).padStart(4, '0')) });
    expect(result.action?.lead.id).toBe(id);
    expect((await decide('owner', result.action!)).status()).toBe(200);
  }
  expect(await db('leadActivity').where({ leadId: id, type: 'note' })).toHaveLength(2);
});
test('audit failure rolls back the note and lead version; retry appends only once', async () => {
  const id = await seed(), before = await db('leads').where({ id }).first(), { action } = await ask('owner', id);
  await db.raw(`CREATE FUNCTION test_reject_note_approval() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action = 'draft.confirmed' AND NEW."actionType" = 'lead.note' THEN RAISE EXCEPTION 'Fictional audit failure'; END IF; RETURN NEW; END $$`);
  await db.raw('CREATE TRIGGER test_reject_note_approval BEFORE INSERT ON "chatActionAudit" FOR EACH ROW EXECUTE FUNCTION test_reject_note_approval()');
  try {
    expect((await decide('owner', action!)).status()).toBe(500);
    expect((await db('leads').where({ id }).first()).version).toBe(before.version);
    expect(await db('leadActivity').where({ leadId: id, type: 'note' })).toHaveLength(0);
    expect((await db('chatActionDrafts').where({ id: action!.id }).first()).state).toBe('pending');
  } finally { await db.raw('DROP TRIGGER test_reject_note_approval ON "chatActionAudit"'); await db.raw('DROP FUNCTION test_reject_note_approval()'); }
  expect((await decide('owner', action!)).status()).toBe(200);
  expect((await decide('owner', action!)).status()).toBe(200);
  expect(await db('leadActivity').where({ leadId: id, type: 'note' })).toHaveLength(1);
});
test('live review restores, recovers a lost response and refreshes Notes for the team', async ({ page }) => {
  const id = await seed(null, foreignWorkspace);
  await page.context().addCookies((await clients.foreign.storageState()).cookies);
  await page.goto('/leads/' + id + '?workspace=' + foreignWorkspace);
  const open = () => page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click();
  await open();
  await page.getByRole('textbox', { name: 'Ask the SalesMora assistant', exact: true }).fill(noteMessage());
  await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  const card = page.getByRole('region', { name: 'Review team note' });
  await expect(card).toContainText(defaultBody);
  await page.reload(); await open(); await expect(card.getByRole('button', { name: 'Confirm and add note' })).toBeEnabled();
  await page.route('**/api/chat/actions', async route => { await route.fetch(); await route.abort('failed'); }, { times: 1 });
  await card.getByRole('button', { name: 'Confirm and add note' }).click(); await expect(card.getByRole('alert')).toBeVisible();
  await card.getByRole('button', { name: 'Confirm and add note' }).click(); await expect(card.getByRole('status')).toHaveText('Team note added');
  await page.getByRole('button', { name: 'Close chat', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Notes for the team', exact: true }).getByText(defaultBody, { exact: true })).toBeVisible();
  await page.reload(); await open(); await expect(card.getByRole('status')).toHaveText('Team note added');
  expect(await db('leadActivity').where({ leadId: id, type: 'note' })).toHaveLength(1);
});
