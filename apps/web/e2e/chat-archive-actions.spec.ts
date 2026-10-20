import { test, expect, request as requests, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase } from '@salesmora/data';
import { leadArchiveDraftReviewSchema } from '@salesmora/contracts';
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
    expect((await clients[role].post('/api/auth/sign-up/email', { headers, data: { name: `Archive ${role}`, email, password: 'Fictional-stage-password-42!', termsAccepted: true } })).status()).toBe(200);
    users[role] = (await db('users').where({ email }).first()).id;
  }
});
const workspaces: string[] = [];
test.beforeEach(async () => {
  await db('rateLimits').delete();
  const input = { business: { businessName: 'Archive fixture workspace', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } };
  workspaceId = (await (await clients.owner.post('/api/workspaces', { headers, data: input })).json()).workspaceId;
  foreignWorkspace = (await (await clients.foreign.post('/api/workspaces', { headers, data: input })).json()).workspaceId;
  for (const role of ['admin', 'office', 'field']) await db('workspaceMemberships').insert({ workspaceId, userId: users[role], role });
  workspaces.push(workspaceId, foreignWorkspace);
});
test.afterEach(async () => { await db('leads').whereIn('workspaceId', workspaces).delete(); await db('users').whereIn('id', Object.values(users)).delete(); await Promise.all(Object.values(clients).map(client => client.dispose())); });
test.afterAll(async () => { await db.destroy(); });
async function seed(ownerId: string | null = users.field, workspace = workspaceId) {
  const id = randomUUID(); await db('leads').insert({ id, workspaceId: workspace, ownerId, createdBy: users.owner, submissionId: randomUUID(), submissionHash: 'stage-fixture', name: 'Archive fixture customer', service: 'Furnace repair', email: '', phone: '(212) 555-0142', address: '18 Willow Street', details: 'Existing request details', notes: 'Existing internal notes', stage: 'new', source: 'other' }); return id;
}
async function ask(role: string, id?: string, patch = {}) {
  const response = await clients[role].post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId: randomUUID(), surfaceKey: 'lead.detail', recordRefs: id ? [{ type: 'lead', id }] : undefined, message: archiveMessage(true), ...patch } });
  expect(response.status()).toBe(200); const events = (await response.text()).split('\n\n').filter(line => line.startsWith('data: ')).map(line => JSON.parse(line.slice(6)));
  const raw = events.find(event => event.type === 'action.proposed')?.action;
  return { events, action: raw ? leadArchiveDraftReviewSchema.parse(raw) : undefined };
}
function decide(role: string, action: { id: string; inputHash: string }, decision = 'confirm', patch = {}) {
  return clients[role].post('/api/chat/actions', { headers, data: { workspaceId, draftId: action.id, inputHash: action.inputHash, decision, ...patch } });
}



function archiveMessage(archived: boolean, leadRef = '') {
  return 'fixture:archive:' + JSON.stringify({ leadRef, archived });
}
test('Owner and Admin archive and restore once while retaining content, stage, assignment and creation usage', async () => {
  for (const role of ['owner', 'admin']) {
    const submissionId = randomUUID();
    const created = await clients.owner.post('/api/leads', { headers, data: { workspaceId, submissionId, lead: { name: 'Archive round trip', email: '', phone: '(212) 555-0142', service: 'Furnace repair', address: '18 Willow Street', details: 'Keep these details.', notes: 'Keep internal notes.', source: 'phone', stage: 'new', ownerId: users.field } } });
    expect(created.ok()).toBe(true);
    const before = await db('leads').where({ workspaceId, submissionId }).first(), id = before.id;
    await db('leads').where({ id }).update({ stage: 'won' }); before.stage = 'won';
    const usage = Number((await db('workspaceLeadAdmissions').where({ workspaceId }).count('* as n').first())?.n);
    expect(usage).toBeGreaterThan(0);
    const { action } = await ask(role, id);
    expect(action?.from).toBe(false); expect(action?.to).toBe(true);
    expect((await db('leads').where({ id }).first()).archivedAt).toBeNull();
    expect((await decide(role, action!)).status()).toBe(200);
    expect((await decide(role, action!)).status()).toBe(200);
    const archived = await db('leads').where({ id }).first();
    expect(archived.archivedAt).not.toBeNull(); expect(archived.archivedBy).toBe(users[role]);
    const next = await ask(role, id, { message: archiveMessage(false) });
    expect(next.action?.from).toBe(true); expect(next.action?.to).toBe(false);
    expect((await decide(role, next.action!)).status()).toBe(200);
    expect((await decide(role, next.action!)).status()).toBe(200);
    const restored = await db('leads').where({ id }).first();
    expect(restored.archivedAt).toBeNull(); expect(restored.archivedBy).toBeNull(); expect(restored.version).toBe(before.version + 2);
    for (const field of ['name', 'email', 'phone', 'service', 'address', 'details', 'notes', 'source', 'stage', 'ownerId']) expect(restored[field]).toBe(before[field]);
    for (const type of ['archived', 'restored']) {
      const events = await db('leadActivity').where({ leadId: id, type }); expect(events).toHaveLength(1); expect(events[0].actorType).toBe('assistant-confirmed');
    }
    expect(Number((await db('workspaceLeadAdmissions').where({ workspaceId }).count('* as n').first())?.n)).toBe(usage);
  }
});
test('Office and Field cannot prepare archive or restore, and private drafts reject other actors or forged decisions', async () => {
  const id = await seed();
  for (const role of ['office', 'field']) expect((await ask(role, id)).action).toBeUndefined();
  const { action } = await ask('owner', id);
  expect((await decide('admin', action!)).status()).toBe(403);
  expect((await decide('owner', action!, 'confirm', { archived: false })).status()).toBe(422);
  expect((await decide('owner', { ...action!, inputHash: 'f'.repeat(64) })).status()).toBe(409);
  expect((await db('leads').where({ id }).first()).archivedAt).toBeNull();
});
test('cancel, expiry, missing targets and already matching states leave visibility unchanged', async () => {
  const id = await seed();
  expect((await ask('owner', id, { message: archiveMessage(false) })).action).toBeUndefined();
  expect((await ask('owner')).action).toBeUndefined();
  const first = await ask('owner', id);
  expect((await decide('owner', first.action!, 'cancel')).status()).toBe(200);
  expect((await decide('owner', first.action!, 'cancel')).status()).toBe(200);
  const expired = await ask('owner', id); await db('chatActionDrafts').where({ id: expired.action!.id }).update({ expiresAt: new Date(Date.now() - 1000) });
  expect((await decide('owner', expired.action!)).status()).toBe(409);
  await db('leads').where({ id }).update({ archivedAt: new Date() }).increment('version', 1);
  expect((await ask('owner', id)).action).toBeUndefined();
  expect(await db('leadActivity').where({ leadId: id }).whereIn('type', ['archived', 'restored'])).toHaveLength(0);
});
test('stale versions, visibility changes and revoked archive grants invalidate frozen proposals', async () => {
  const id = await seed(), first = await ask('owner', id);
  await db('leads').where({ id }).increment('version', 1);
  expect((await decide('owner', first.action!)).status()).toBe(409);
  const next = await ask('owner', id);
  await db('leads').where({ id }).update({ archivedAt: new Date() });
  expect((await decide('owner', next.action!)).status()).toBe(409);
  const revoked = await ask('admin', id, { message: archiveMessage(false) });
  await db('workspaceRolePolicies').where({ workspaceId, role: 'admin', permission: 'leads.archive' }).delete();
  await db('workspacePolicies').where({ workspaceId }).increment('revision', 1);
  expect((await decide('admin', revoked.action!)).status()).toBe(403);
  expect((await ask('admin', id, { message: archiveMessage(false) })).action).toBeUndefined();
});
test('explicit Home/list targets resolve in workspace scope including archived leads for restoration', async () => {
  const id = await seed(), lead = await db('leads').where({ id }).first();
  const ref = 'LD-' + String(lead.leadNumber).padStart(4, '0');
  const first = await ask('owner', undefined, { surfaceKey: 'home', message: archiveMessage(true, ref) });
  expect(first.action?.lead.id).toBe(id); expect((await decide('owner', first.action!)).status()).toBe(200);
  const next = await ask('owner', undefined, { surfaceKey: 'leads.list', message: archiveMessage(false, ref) });
  expect(next.action?.to).toBe(false); expect((await decide('owner', next.action!)).status()).toBe(200);
  const foreign = await seed(users.foreign, foreignWorkspace);
  expect((await ask('owner', undefined, { surfaceKey: 'home', message: archiveMessage(true, foreign) })).action).toBeUndefined();
});
test('audit failure rolls back archive or restore and a retry commits each only once', async () => {
  const id = await seed();
  for (const archived of [true, false]) {
    const before = await db('leads').where({ id }).first(), { action } = await ask('owner', id, { message: archiveMessage(archived) });
    await db.raw(`CREATE FUNCTION test_reject_archive_approval() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action = 'draft.confirmed' AND NEW."actionType" = 'lead.archive' THEN RAISE EXCEPTION 'Fictional audit failure'; END IF; RETURN NEW; END $$`);
    await db.raw('CREATE TRIGGER test_reject_archive_approval BEFORE INSERT ON "chatActionAudit" FOR EACH ROW EXECUTE FUNCTION test_reject_archive_approval()');
    try {
      expect((await decide('owner', action!)).status()).toBe(500);
      const after = await db('leads').where({ id }).first();
      expect(after.archivedAt).toEqual(before.archivedAt); expect(after.version).toBe(before.version);
      expect(await db('leadActivity').where({ leadId: id, type: archived ? 'archived' : 'restored' })).toHaveLength(0);
    } finally { await db.raw('DROP TRIGGER test_reject_archive_approval ON "chatActionAudit"'); await db.raw('DROP FUNCTION test_reject_archive_approval()'); }
    expect((await decide('owner', action!)).status()).toBe(200);
    expect((await decide('owner', action!)).status()).toBe(200);
    expect(await db('leadActivity').where({ leadId: id, type: archived ? 'archived' : 'restored' })).toHaveLength(1);
  }
});
test('live archive/restore reviews survive reload, recover a lost response and refresh visibility', async ({ page }) => {
  const id = await seed(users.foreign, foreignWorkspace);
  await page.context().addCookies((await clients.foreign.storageState()).cookies);
  await page.goto('/leads/' + id + '?workspace=' + foreignWorkspace);
  const open = () => page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click();
  await open();
  const send = async (archived: boolean) => {
    await page.getByRole('textbox', { name: 'Ask the SalesMora assistant', exact: true }).fill(archiveMessage(archived));
    await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  };
  await send(true);
  let card = page.getByRole('region', { name: 'Review archiving' });
  await expect(card.getByRole('button', { name: 'Confirm archive' })).toBeEnabled();
  await page.reload(); await open();
  await page.route('**/api/chat/actions', async route => { await route.fetch(); await route.abort('failed'); }, { times: 1 });
  await card.getByRole('button', { name: 'Confirm archive' }).click(); await expect(card.getByRole('alert')).toBeVisible();
  await card.getByRole('button', { name: 'Confirm archive' }).click(); await expect(card.getByRole('status')).toHaveText('Lead archived');
  await page.reload(); await open(); await expect(card.getByRole('status')).toHaveText('Lead archived');
  await send(false); card = page.getByRole('region', { name: 'Review restoration' });
  await card.getByRole('button', { name: 'Confirm restore' }).click(); await expect(card.getByRole('status')).toHaveText('Lead restored');
  await page.reload(); await open(); await expect(card.getByRole('status')).toHaveText('Lead restored');
  expect((await db('leads').where({ id }).first()).archivedAt).toBeNull();
  for (const type of ['archived', 'restored']) expect(await db('leadActivity').where({ leadId: id, type })).toHaveLength(1);
});
