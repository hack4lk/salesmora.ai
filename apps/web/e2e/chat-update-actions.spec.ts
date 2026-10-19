import { test, expect, request as requests, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase } from '@salesmora/data';
import { leadUpdateDraftReviewSchema } from '@salesmora/contracts';
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
    expect((await clients[role].post('/api/auth/sign-up/email', { headers, data: { name: `Update ${role}`, email, password: 'Fictional-stage-password-42!', termsAccepted: true } })).status()).toBe(200);
    users[role] = (await db('users').where({ email }).first()).id;
  }
});
const workspaces: string[] = [];
test.beforeEach(async () => {
  await db('rateLimits').delete();
  const input = { business: { businessName: 'Update fixture workspace', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } };
  workspaceId = (await (await clients.owner.post('/api/workspaces', { headers, data: input })).json()).workspaceId;
  foreignWorkspace = (await (await clients.foreign.post('/api/workspaces', { headers, data: input })).json()).workspaceId;
  for (const role of ['admin', 'office', 'field']) await db('workspaceMemberships').insert({ workspaceId, userId: users[role], role });
  workspaces.push(workspaceId, foreignWorkspace);
});
test.afterEach(async () => { await db('leads').whereIn('workspaceId', workspaces).delete(); await db('users').whereIn('id', Object.values(users)).delete(); await Promise.all(Object.values(clients).map(client => client.dispose())); });
test.afterAll(async () => { await db.destroy(); });
async function seed(ownerId = users.field, workspace = workspaceId) {
  const id = randomUUID(); await db('leads').insert({ id, workspaceId: workspace, ownerId, createdBy: users.owner, submissionId: randomUUID(), submissionHash: 'stage-fixture', name: 'Update fixture customer', service: 'Furnace repair', email: '', phone: '(212) 555-0142', address: '18 Willow Street', details: 'Existing request details', notes: 'Existing internal notes', stage: 'new', source: 'other' }); return id;
}
async function ask(role: string, id?: string, patch = {}) {
  const response = await clients[role].post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId: randomUUID(), surfaceKey: 'lead.detail', recordRefs: id ? [{ type: 'lead', id }] : undefined, message: 'fixture:update', ...patch } });
  expect(response.status()).toBe(200); const events = (await response.text()).split('\n\n').filter(line => line.startsWith('data: ')).map(line => JSON.parse(line.slice(6)));
  const raw = events.find(event => event.type === 'action.proposed')?.action;
  return { events, action: raw ? leadUpdateDraftReviewSchema.parse(raw) : undefined };
}
function decide(role: string, action: { id: string; inputHash: string }, decision = 'confirm', patch = {}) {
  return clients[role].post('/api/chat/actions', { headers, data: { workspaceId, draftId: action.id, inputHash: action.inputHash, decision, ...patch } });
}
const message = (changes: { field: string; value: string }[], leadRef = '') => `fixture:update:${JSON.stringify({ leadRef, changes })}`;
test('all four roles can review and confirm a phone patch within scope; other values and audit remain intact', async () => {
  for (const role of ['owner', 'admin', 'office', 'field']) {
    const id = await seed(); await db('leads').where({ id }).update({ address: '  Legacy address spacing  ' }); const before = await db('leads').where({ id }).first();
    const { action } = await ask(role, id); expect(action?.changes).toEqual([{ field: 'phone', before: before.phone, after: '(212) 555-0188' }]);
    expect(JSON.stringify(action)).not.toContain(before.details); expect(JSON.stringify(action)).not.toContain(before.notes);
    expect((await db('leads').where({ id }).first()).phone).toBe(before.phone);
    expect((await decide(role, action!)).status()).toBe(200); expect((await decide(role, action!)).status()).toBe(200);
    const after = await db('leads').where({ id }).first(); expect(after.phone).toBe('(212) 555-0188');
    for (const field of ['name', 'email', 'service', 'address', 'details', 'notes', 'source', 'stage', 'ownerId']) expect(after[field]).toBe(before[field]);
    const events = await db('leadActivity').where({ leadId: id, type: 'edited' }); expect(events).toHaveLength(1); expect(events[0].actorType).toBe('assistant-confirmed');
    expect(await db('chatActionAudit').where({ draftId: action!.id, action: 'draft.confirmed', actionType: 'lead.update' })).toHaveLength(1);
  }
});
test('multiple edits normalize email, clear optional values and cancel without changing records', async () => {
  const id = await seed();
  const draft = await ask('owner', id, { message: message([{ field: 'email', value: 'JORDAN@example.test' }, { field: 'phone', value: '' }, { field: 'service', value: 'Thermostat repair' }]) });
  expect(draft.action?.changes.find(change => change.field === 'email')?.after).toBe('jordan@example.test');
  expect((await decide('owner', draft.action!, 'cancel')).status()).toBe(200);
  expect((await db('leads').where({ id }).first()).phone).toBe('(212) 555-0142');
  const next = await ask('owner', id, { message: message([{ field: 'email', value: 'JORDAN@example.test' }, { field: 'phone', value: '' }]) });
  expect((await decide('owner', next.action!)).status()).toBe(200);
  const row = await db('leads').where({ id }).first(); expect(row.email).toBe('jordan@example.test'); expect(row.phone).toBe('');
});
test('other assignees, foreign workspaces, forged decisions and forbidden fields cannot change a lead', async () => {
  for (const id of [await seed(users.owner), await seed(users.owner, foreignWorkspace)]) expect((await ask('field', id)).action).toBeUndefined();
  const id = await seed(), { action } = await ask('owner', id);
  expect((await decide('field', action!)).status()).toBe(403);
  expect((await decide('owner', { ...action!, inputHash: 'f'.repeat(64) })).status()).toBe(409);
  for (const field of ['stage', 'ownerId']) expect((await ask('owner', id, { message: message([{ field, value: 'forged' }]) })).action).toBeUndefined();
  expect((await db('leads').where({ id }).first()).phone).toBe('(212) 555-0142');
});
test('version, assignment, expiry and policy changes invalidate the frozen update', async () => {
  const id = await seed(), first = await ask('owner', id); await db('leads').where({ id }).increment('version', 1);
  expect((await decide('owner', first.action!)).status()).toBe(409);
  const next = await ask('field', id); await db('leads').where({ id }).update({ ownerId: users.owner }).increment('version', 1);
  expect((await decide('field', next.action!)).status()).toBe(403);
  const expired = await ask('owner', id); await db('chatActionDrafts').where({ id: expired.action!.id }).update({ expiresAt: new Date(Date.now() - 1000) });
  expect((await decide('owner', expired.action!)).status()).toBe(409);
  const revoked = await ask('office', id); await db('workspaceRolePolicies').where({ workspaceId, role: 'office', permission: 'leads.update' }).delete(); await db('workspacePolicies').where({ workspaceId }).increment('revision', 1);
  expect((await decide('office', revoked.action!)).status()).toBe(403); expect((await ask('office', id)).action).toBeUndefined();
});
test('invalid, unchanged, archived and locked-source requests produce no confirmable draft', async () => {
  const id = await seed();
  for (const changes of [[{ field: 'phone', value: '(212) 555-0142' }], [{ field: 'name', value: '' }], [{ field: 'email', value: 'invalid' }]]) expect((await ask('owner', id, { message: message(changes) })).action).toBeUndefined();
  await db('leads').where({ id }).update({ archivedAt: new Date() }); expect((await ask('owner', id)).action).toBeUndefined();
  await db('leads').where({ id }).update({ archivedAt: null });
  await db('leadActivity').where({ id, type: 'created' }).update({ changes: JSON.stringify({ source: 'gmail', origin: 'gmail' }) });
  expect((await ask('owner', id, { message: message([{ field: 'source', value: 'referral' }]) })).action).toBeUndefined();
  expect((await db('leads').where({ id }).first()).source).toBe('other');
});
test('explicit Home targets work and oversized reviews fail without truncating data', async () => {
  const id = await seed(), lead = await db('leads').where({ id }).first();
  const result = await ask('owner', undefined, { surfaceKey: 'home', message: message([{ field: 'phone', value: '(212) 555-0188' }], `LD-${String(lead.leadNumber).padStart(4, '0')}`) });
  expect(result.action?.lead.id).toBe(id);
  expect((await ask('owner')).action).toBeUndefined();
  await db('leads').where({ id }).update({ details: '\u0001'.repeat(10000) });
  const large = await ask('owner', id, { message: message([{ field: 'details', value: '' }]) }); expect(large.action).toBeUndefined();
  expect(JSON.stringify(large.events)).toContain('lead-update-too-large');
});
test('audit failure rolls back the edit and a retry safely completes it', async () => {
  const id = await seed(), { action } = await ask('owner', id);
  await db.raw(`CREATE FUNCTION test_reject_update_approval() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action = 'draft.confirmed' AND NEW."actionType" = 'lead.update' THEN RAISE EXCEPTION 'Fictional audit failure'; END IF; RETURN NEW; END $$`);
  await db.raw('CREATE TRIGGER test_reject_update_approval BEFORE INSERT ON "chatActionAudit" FOR EACH ROW EXECUTE FUNCTION test_reject_update_approval()');
  try {
    expect((await decide('owner', action!)).status()).toBe(500);
    expect((await db('leads').where({ id }).first()).phone).toBe('(212) 555-0142');
    expect(await db('leadActivity').where({ leadId: id, type: 'edited' })).toHaveLength(0);
  } finally { await db.raw('DROP TRIGGER test_reject_update_approval ON "chatActionAudit"'); await db.raw('DROP FUNCTION test_reject_update_approval()'); }
  expect((await decide('owner', action!)).status()).toBe(200);
});
test('live phone review restores, retries a lost response, refreshes and retains a confirmed receipt', async ({ page }) => {
  const id = await seed(users.foreign, foreignWorkspace); await page.context().addCookies((await clients.foreign.storageState()).cookies);
  const open = () => page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click();
  await page.goto(`/leads/${id}?workspace=${foreignWorkspace}`); await open();
  await page.getByRole('textbox', { name: 'Ask the SalesMora assistant', exact: true }).fill('fixture:update');
  await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Confirm lead changes' })).toBeEnabled();
  await page.reload(); await open(); const card = page.getByRole('region', { name: 'Review lead changes' });
  await expect(card).toContainText('(212) 555-0142'); await expect(card).toContainText('(212) 555-0188');
  await page.route('**/api/chat/actions', async route => { await route.fetch(); await route.abort('failed'); }, { times: 1 });
  await card.getByRole('button', { name: 'Confirm lead changes' }).click(); await expect(card.getByRole('alert')).toBeVisible();
  await card.getByRole('button', { name: 'Confirm lead changes' }).click(); await expect(card.getByRole('status')).toHaveText('Lead changes saved');
  expect(await db('leadActivity').where({ leadId: id, type: 'edited' })).toHaveLength(1);
  await page.reload(); await open(); await expect(card.getByRole('status')).toHaveText('Lead changes saved');
});

const combinedMessage = (phone = '1-1800-666-6666', to = 'contacted') => 'fixture:combined:' + JSON.stringify({ leadRef: '', changes: [{ field: 'phone', value: phone }], stage: { to, reason: '' } });
test('combined phone and stage changes are reviewed together, confirmed atomically and duplicate-safe', async () => {
  const id = await seed();
  const { action } = await ask('field', id, { message: combinedMessage() });
  expect(action?.stage).toEqual({ from: 'new', to: 'contacted' });
  expect(action?.changes).toEqual([{ field: 'phone', before: '(212) 555-0142', after: '1-1800-666-6666' }]);
  expect((await db('leads').where({ id }).first()).stage).toBe('new');
  expect((await decide('field', action!)).status()).toBe(200);
  expect((await decide('field', action!)).status()).toBe(200);
  const lead = await db('leads').where({ id }).first();
  expect(lead.stage).toBe('contacted'); expect(lead.phone).toBe('1-1800-666-6666');
  for (const type of ['stage', 'edited']) {
    const activity = await db('leadActivity').where({ leadId: id, type }); expect(activity).toHaveLength(1);
    expect(activity[0].actorType).toBe('assistant-confirmed');
  }
});
test('compound requests handle unchanged parts and cancellation without losing the effective changes', async () => {
  const id = await seed();
  const stageOnly = await ask('owner', id, { message: combinedMessage('(212) 555-0142') });
  expect(stageOnly.action?.changes).toEqual([]); expect(stageOnly.action?.stage?.to).toBe('contacted');
  expect((await decide('owner', stageOnly.action!, 'cancel')).status()).toBe(200);
  expect((await db('leads').where({ id }).first()).stage).toBe('new');
  const phoneOnly = await ask('owner', id, { message: combinedMessage('1-1800-666-6666', 'new') });
  expect(phoneOnly.action?.stage).toBeUndefined(); expect(phoneOnly.action?.changes).toHaveLength(1);
  expect((await decide('owner', phoneOnly.action!)).status()).toBe(200);
  const bothUnchanged = await ask('owner', id, { message: combinedMessage('1-1800-666-6666', 'new') });
  expect(bothUnchanged.action).toBeUndefined();
  const remainingStage = await ask('owner', id, { message: combinedMessage() });
  expect(remainingStage.action?.changes).toEqual([]);
  expect((await decide('owner', remainingStage.action!)).status()).toBe(200);
  expect((await db('leads').where({ id }).first()).stage).toBe('contacted');
});
test('either missing permission blocks compound proposals and revocation blocks the whole confirmation', async () => {
  const id = await seed();
  const { action } = await ask('office', id, { message: combinedMessage() });
  await db('workspaceRolePolicies').where({ workspaceId, role: 'office', permission: 'leads.stage.update' }).delete();
  await db('workspacePolicies').where({ workspaceId }).increment('revision', 1);
  expect((await decide('office', action!)).status()).toBe(403);
  expect((await ask('office', id, { message: combinedMessage() })).action).toBeUndefined();
  await db('workspaceRolePolicies').where({ workspaceId, role: 'field', permission: 'leads.update' }).delete();
  await db('workspacePolicies').where({ workspaceId }).increment('revision', 1);
  expect((await ask('field', id, { message: combinedMessage() })).action).toBeUndefined();
  const row = await db('leads').where({ id }).first(); expect(row.stage).toBe('new'); expect(row.phone).toBe('(212) 555-0142');
});
test('a failure in the stage mutation rolls back the already attempted phone mutation', async () => {
  const id = await seed(), { action } = await ask('owner', id, { message: combinedMessage() });
  await db.raw(`CREATE FUNCTION test_reject_combined_stage() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.type = 'stage' THEN RAISE EXCEPTION 'Fictional stage failure'; END IF; RETURN NEW; END $$`);
  await db.raw('CREATE TRIGGER test_reject_combined_stage BEFORE INSERT ON "leadActivity" FOR EACH ROW EXECUTE FUNCTION test_reject_combined_stage()');
  try {
    expect((await decide('owner', action!)).status()).toBe(500);
    const row = await db('leads').where({ id }).first(); expect(row.phone).toBe('(212) 555-0142'); expect(row.stage).toBe('new');
    expect(await db('leadActivity').where({ leadId: id, type: 'edited' })).toHaveLength(0);
    expect((await db('chatActionDrafts').where({ id: action!.id }).first()).state).toBe('pending');
  } finally {
    await db.raw('DROP TRIGGER test_reject_combined_stage ON "leadActivity"'); await db.raw('DROP FUNCTION test_reject_combined_stage()');
  }
  expect((await decide('owner', action!)).status()).toBe(200);
});
test('live combined review displays both changes and restores its confirmed receipt', async ({ page }) => {
  const id = await seed(users.foreign, foreignWorkspace);
  await page.context().addCookies((await clients.foreign.storageState()).cookies);
  await page.goto(`/leads/${id}?workspace=${foreignWorkspace}`);
  const open = () => page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click();
  await open();
  await page.getByRole('textbox', { name: 'Ask the SalesMora assistant', exact: true }).fill(combinedMessage());
  await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  const card = page.getByRole('region', { name: 'Review lead changes' });
  await expect(card.getByRole('region', { name: 'Stage', exact: true })).toContainText('Contacted');
  await expect(card.getByRole('region', { name: 'Phone', exact: true })).toContainText('1-1800-666-6666');
  await card.getByRole('button', { name: 'Confirm lead changes' }).click();
  await expect(card.getByRole('status')).toHaveText('Lead changes saved');
  await page.reload(); await open();
  await expect(card.getByRole('status')).toHaveText('Lead changes saved');
  await expect(card).toContainText('Contacted'); await expect(card).toContainText('1-1800-666-6666');
});
