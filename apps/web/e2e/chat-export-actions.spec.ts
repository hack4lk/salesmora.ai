import { test, expect, request as requests, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase } from '@salesmora/data';
import { leadExportDraftReviewSchema } from '@salesmora/contracts';
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
    expect((await clients[role].post('/api/auth/sign-up/email', { headers, data: { name: `Export ${role}`, email, password: 'Fictional-stage-password-42!', termsAccepted: true } })).status()).toBe(200);
    users[role] = (await db('users').where({ email }).first()).id;
  }
});
const workspaces: string[] = [];
test.beforeEach(async () => {
  await db('rateLimits').delete();
  const input = { business: { businessName: 'Export fixture workspace', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } };
  workspaceId = (await (await clients.owner.post('/api/workspaces', { headers, data: input })).json()).workspaceId;
  foreignWorkspace = (await (await clients.foreign.post('/api/workspaces', { headers, data: input })).json()).workspaceId;
  for (const role of ['admin', 'office', 'field']) await db('workspaceMemberships').insert({ workspaceId, userId: users[role], role });
  workspaces.push(workspaceId, foreignWorkspace);
});
test.afterEach(async () => { await db('leads').whereIn('workspaceId', workspaces).delete(); await db('users').whereIn('id', Object.values(users)).delete(); await Promise.all(Object.values(clients).map(client => client.dispose())); });
test.afterAll(async () => { await db.destroy(); });
async function seed(ownerId: string | null = users.field, workspace = workspaceId) {
  const id = randomUUID(); await db('leads').insert({ id, workspaceId: workspace, ownerId, createdBy: users.owner, submissionId: randomUUID(), submissionHash: 'stage-fixture', name: 'Export fixture customer', service: 'Furnace repair', email: '', phone: '(212) 555-0142', address: '18 Willow Street', details: 'Existing request details', notes: 'Existing internal notes', stage: 'new', source: 'other' }); return id;
}
const filters = { query: '', stages: [], sources: [], ownerIds: [], created: 'any', from: '', to: '', attention: false, archived: false };
function exportMessage(patch = {}, mode = 'filters') { return 'fixture:export:' + JSON.stringify({ mode, filters: { ...filters, ...patch } }); }
async function ask(role: string, patch = {}, message = exportMessage()) {
  const response = await clients[role].post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId: randomUUID(), surfaceKey: 'home', message, ...patch } });
  expect(response.status()).toBe(200);
  const events = (await response.text()).split('\n\n').filter(line => line.startsWith('data: ')).map(line => JSON.parse(line.slice(6)));
  const raw = events.find(event => event.type === 'action.proposed')?.action;
  return { events, action: raw ? leadExportDraftReviewSchema.parse(raw) : undefined };
}
function decide(role: string, action: { id: string; inputHash: string }, decision = 'confirm', patch = {}, endpoint = '/api/chat/exports') {
  return clients[role].post(endpoint, { headers, data: { workspaceId, draftId: action.id, inputHash: action.inputHash, decision, ...patch } });
}
test('Owner/Admin explicit exports download authorized CSV and repeated confirmation is audit-idempotent', async () => {
  const id = await seed(), foreign = await seed(users.foreign, foreignWorkspace);
  await db('leads').where({ id: foreign }).update({ name: 'FOREIGN SECRET' });
  await db('leads').where({ id }).update({ name: '=HYPERLINK("bad")', notes: 'Keep internal notes', details: 'Comma, quote " and newline\nvalue' });
  const before = await db('leads').where({ id }).first();
  const activityBefore = await db('leadActivity').where({ leadId: id }).orderBy('id');
  for (const role of ['owner', 'admin']) {
    const { action } = await ask(role); expect(action?.count).toBe(1); expect(action?.scope).toBe('workspace');
    expect(await db('leadExportAudit').where({ workspaceId })).toHaveLength(role === 'owner' ? 0 : 2);
    for (let i = 0; i < 2; i++) {
      const response = await decide(role, action!); expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('text/csv'); expect(response.headers()['cache-control']).toContain('no-store');
      const text = await response.text(); expect(text).toContain('Keep internal notes'); expect(text).toContain("'=HYPERLINK"); expect(text).not.toContain('FOREIGN SECRET');
    }
    expect(await db('chatActionAudit').where({ draftId: action!.id, action: 'draft.confirmed' })).toHaveLength(1);
    expect((await db('chatActionDrafts').where({ id: action!.id }).first()).state).toBe('confirmed');
  }
  expect(await db('leads').where({ id }).first()).toEqual(before);
  expect(await db('leadActivity').where({ leadId: id }).orderBy('id')).toEqual(activityBefore);
});
test('Office/Field and foreign actors cannot export or forge draft filters, hashes, decisions or origins', async () => {
  await seed();
  for (const role of ['office', 'field']) expect((await ask(role)).action).toBeUndefined();
  const { action } = await ask('owner');
  expect((await decide('admin', action!)).status()).toBe(403);
  expect((await decide('foreign', action!)).status()).toBe(403);
  expect((await decide('owner', action!, 'confirm', { filters })).status()).toBe(422);
  expect((await decide('owner', { ...action!, inputHash: 'f'.repeat(64) })).status()).toBe(409);
  expect((await decide('owner', action!, 'confirm', {}, '/api/chat/actions')).status()).toBe(409);
  expect((await clients.owner.post('/api/chat/exports', { headers: { Origin: 'https://foreign.test' }, data: { workspaceId, draftId: action!.id, inputHash: action!.inputHash, decision: 'confirm' } })).status()).toBe(403);
  expect(await db('leadExportAudit').where({ workspaceId })).toHaveLength(0);
});
test('cancel, expiry, empty matches and missing current filters cannot download', async () => {
  await seed();
  const first = await ask('owner');
  for (let i = 0; i < 2; i++) expect((await decide('owner', first.action!, 'cancel', {}, '/api/chat/actions')).status()).toBe(200);
  expect((await decide('owner', first.action!)).status()).toBe(409);
  const expired = await ask('owner'); await db('chatActionDrafts').where({ id: expired.action!.id }).update({ expiresAt: new Date(Date.now() - 1000) });
  expect((await decide('owner', expired.action!)).status()).toBe(409);
  const empty = await ask('owner', {}, exportMessage({ query: 'NO MATCH EXISTS' })); expect(empty.action?.count).toBe(0);
  expect((await decide('owner', empty.action!)).status()).toBe(409);
  expect((await ask('owner', {}, exportMessage({}, 'current_filters'))).action).toBeUndefined();
  expect((await ask('owner', {}, exportMessage({ query: 'x' }))).action).toBeUndefined();
});
test('stored list filters apply across pages and archived inclusion is explicit', async () => {
  const active = await seed(), archived = await seed(); await seed(users.foreign, foreignWorkspace);
  await db('leads').where({ id: active }).update({ source: 'website' });
  await db('leads').where({ id: archived }).update({ source: 'website', archivedAt: new Date() });
  await seed();
  const uiState = { view: 'pipeline', filters: { ...filters, sources: ['website'] } };
  const { action } = await ask('owner', { surfaceKey: 'leads.list', uiState }, exportMessage({ query: 'IGNORE THIS IN CURRENT MODE' }, 'current_filters'));
  expect(action?.count).toBe(1); expect(action?.filterLabels).toContain('Source: Website');
  let response = await decide('owner', action!); expect(response.status()).toBe(200); expect(await response.text()).not.toContain(archived);
  const all = await ask('owner', { surfaceKey: 'leads.list', uiState: { ...uiState, filters: { ...uiState.filters, archived: true } } }, exportMessage({}, 'current_filters'));
  expect(all.action?.count).toBe(2); expect(all.action?.includeArchived).toBe(true);
  response = await decide('owner', all.action!); expect(response.status()).toBe(200); expect(await response.text()).toContain(archived);
});
test('export intersects assigned scope, refuses unresolved owners and current revoked permissions', async () => {
  await seed(users.admin); await seed(users.owner);
  await db('workspaceRolePolicies').where({ workspaceId, role: 'admin', permission: 'leads.export' }).update({ scope: 'assigned' });
  const { action } = await ask('admin'); expect(action?.count).toBe(1); expect(action?.scope).toBe('assigned');
  const response = await decide('admin', action!); expect(response.status()).toBe(200);
  expect((await ask('admin', {}, exportMessage({ ownerIds: [users.owner] }))).action).toBeUndefined();
  expect((await ask('owner', {}, exportMessage({ ownerIds: [users.foreign] }))).action).toBeUndefined();
  const revoked = await ask('admin'); await db('workspaceRolePolicies').where({ workspaceId, role: 'admin', permission: 'leads.export' }).delete();
  expect((await decide('admin', revoked.action!)).status()).toBe(403);
});
test('changed count and current row cap require a fresh review with no partial output', async () => {
  await seed(); const first = await ask('owner'); await seed();
  expect((await decide('owner', first.action!)).status()).toBe(409);
  expect((await db('chatActionDrafts').where({ id: first.action!.id }).first()).state).toBe('pending');
  const limit = Number(process.env.LEAD_EXPORT_ROW_LIMIT ?? 50000);
  test.skip(limit > 100, 'Run with LEAD_EXPORT_ROW_LIMIT=40 to exercise the row cap without huge fixtures.');
  for (let i = 0; i < limit; i++) await seed();
  const over = await ask('owner'); expect(over.action!.count).toBeGreaterThan(over.action!.rowLimit);
  expect((await decide('owner', over.action!)).status()).toBe(409);
});
test('chat audit failure rolls back confirmation and retry prepares one receipt', async () => {
  await seed(); const { action } = await ask('owner');
  await db.raw(`CREATE FUNCTION test_reject_export_approval() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action = 'draft.confirmed' AND NEW."actionType" = 'lead.export' THEN RAISE EXCEPTION 'fixture audit failure'; END IF; RETURN NEW; END $$`);
  await db.raw('CREATE TRIGGER test_reject_export_approval BEFORE INSERT ON "chatActionAudit" FOR EACH ROW EXECUTE FUNCTION test_reject_export_approval()');
  try { expect((await decide('owner', action!)).status()).toBe(500); expect((await db('chatActionDrafts').where({ id: action!.id }).first()).state).toBe('pending'); }
  finally { await db.raw('DROP TRIGGER test_reject_export_approval ON "chatActionAudit"'); await db.raw('DROP FUNCTION test_reject_export_approval()'); }
  expect((await decide('owner', action!)).status()).toBe(200);
  expect(await db('chatActionAudit').where({ draftId: action!.id, action: 'draft.confirmed' })).toHaveLength(1);
});
test('live review survives reload and lost-response retry downloads CSV once with a restored receipt', async ({ page }) => {
  const id = await seed(users.foreign, foreignWorkspace);
  await page.context().addCookies((await clients.foreign.storageState()).cookies);
  await page.goto('/leads/' + id + '?workspace=' + foreignWorkspace);
  const open = () => page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click(); await open();
  await page.getByRole('textbox', { name: 'Ask the SalesMora assistant', exact: true }).fill(exportMessage());
  await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  const card = page.getByRole('region', { name: 'Review lead export' });
  await expect(card.getByRole('button', { name: 'Confirm and download CSV' })).toBeEnabled();
  await page.reload(); await open();
  await page.route('**/api/chat/exports', async route => { await route.fetch(); await route.abort('failed'); }, { times: 1 });
  await card.getByRole('button', { name: 'Confirm and download CSV' }).click(); await expect(card.getByRole('alert')).toBeVisible();
  const download = page.waitForEvent('download'); await card.getByRole('button', { name: 'Confirm and download CSV' }).click();
  const file = await download; expect(await file.failure()).toBeNull();
  const { readFile } = await import('node:fs/promises'); expect(await readFile((await file.path())!, 'utf8')).toContain(id);
  await expect(card.getByRole('status')).toHaveText('Export prepared for browser download.');
  await page.reload(); await open(); await expect(card.getByRole('status')).toHaveText('Export prepared for browser download.');
  expect(await db('chatActionAudit').where({ workspaceId: foreignWorkspace, actionType: 'lead.export', action: 'draft.confirmed' })).toHaveLength(1);
});
