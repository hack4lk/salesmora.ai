import { test, expect, request as requests, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase } from '@salesmora/data';
import { leadDeleteDraftReviewSchema } from '@salesmora/contracts';
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
    expect((await clients[role].post('/api/auth/sign-up/email', { headers, data: { name: `Delete ${role}`, email, password: 'Fictional-stage-password-42!', termsAccepted: true } })).status()).toBe(200);
    users[role] = (await db('users').where({ email }).first()).id;
  }
});
const workspaces: string[] = [];
test.beforeEach(async () => {
  await db('rateLimits').delete();
  const input = { business: { businessName: 'Delete fixture workspace', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } };
  workspaceId = (await (await clients.owner.post('/api/workspaces', { headers, data: input })).json()).workspaceId;
  foreignWorkspace = (await (await clients.foreign.post('/api/workspaces', { headers, data: input })).json()).workspaceId;
  for (const role of ['admin', 'office', 'field']) await db('workspaceMemberships').insert({ workspaceId, userId: users[role], role });
  workspaces.push(workspaceId, foreignWorkspace);
});
test.afterEach(async () => { await db('leads').whereIn('workspaceId', workspaces).delete(); await db('users').whereIn('id', Object.values(users)).delete(); await Promise.all(Object.values(clients).map(client => client.dispose())); });
test.afterAll(async () => { await db.destroy(); });
async function seed(ownerId: string | null = users.field, workspace = workspaceId) {
  const id = randomUUID(); await db('leads').insert({ id, workspaceId: workspace, ownerId, createdBy: users.owner, submissionId: randomUUID(), submissionHash: 'stage-fixture', name: 'Delete fixture customer', service: 'Furnace repair', email: '', phone: '(212) 555-0142', address: '18 Willow Street', details: 'Existing request details', notes: 'Existing internal notes', stage: 'new', source: 'other' }); return id;
}
function deleteMessage(leadRef = '') { return 'fixture:delete:' + JSON.stringify({ leadRef }); }
async function ask(role: string, id?: string, patch = {}) {
  const response = await clients[role].post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId: randomUUID(), surfaceKey: 'lead.detail', recordRefs: id ? [{ type: 'lead', id }] : undefined, message: deleteMessage(), ...patch } });
  expect(response.status()).toBe(200);
  const events = (await response.text()).split('\n\n').filter(line => line.startsWith('data: ')).map(line => JSON.parse(line.slice(6)));
  const raw = events.find(event => event.type === 'action.proposed')?.action;
  return { events, action: raw?.actionType === 'lead.delete' ? leadDeleteDraftReviewSchema.parse(raw) : undefined };
}
function decide(role: string, action: { id: string; inputHash: string; lead: { number: string } }, decision = 'confirm', patch = {}) {
  return clients[role].post('/api/chat/deletions', { headers, data: { workspaceId, draftId: action.id, inputHash: action.inputHash, decision, typedConfirmation: decision === 'confirm' ? action.lead.number : '', ...patch } });
}
async function created(role = 'owner', workspace = workspaceId) {
  const submissionId = randomUUID();
  const response = await clients[role].post('/api/leads', { headers, data: { workspaceId: workspace, submissionId, lead: { name: 'Deletion private customer', email: 'private@example.test', phone: '(212) 555-0142', service: 'Furnace repair', address: '18 Willow Street', details: 'Private request details', notes: 'Private internal notes', source: 'phone', stage: 'new', ownerId: '' } } });
  expect(response.status()).toBe(201); return db('leads').where({ workspaceId: workspace, submissionId }).first();
}
async function history(role: string, thread: string) {
  const response = await clients[role].get('/api/chat/threads?' + new URLSearchParams({ workspace: workspaceId, thread }));
  expect(response.status()).toBe(200); return response.json();
}
test('Owner/Admin deletion removes content, source-derived drafts and assignment delivery once, preserving creation usage and safe receipt', async () => {
  for (const role of ['owner', 'admin']) {
    let lead = await created(); const id = lead.id, assignmentId = randomUUID();
    expect((await clients.owner.post(`/api/leads/${id}/owner`, { headers, data: { workspaceId, leadId: id, submissionId: assignmentId, expectedVersion: lead.version, ownerId: users.office } })).status()).toBe(200);
    expect((await clients.owner.post(`/api/leads/${id}/notes`, { headers, data: { workspaceId, leadId: id, submissionId: randomUUID(), body: 'Private team note' } })).status()).toBe(200);
    lead = await db('leads').where({ id }).first();
    expect(await db('assignmentNotifications').where({ leadId: id })).toHaveLength(1);
    expect(await db('assignmentEmailOutbox').where({ id: assignmentId })).toHaveLength(1);
    const old = await ask(role, id, { message: 'fixture:note:' + JSON.stringify({ leadRef: '', body: 'Private unsaved note proposal' }) });
    const oldAction = old.events.find(event => event.type === 'action.proposed')!.action;
    const oldRow = await db('chatActionDrafts').where({ id: oldAction.id }).first();
    await db('chatMessages').where({ turnId: oldRow.turnId, role: 'assistant' }).update({ text: 'PRIVATE_ASSISTANT_SENTINEL' });
    const usage = Number((await db('workspaceLeadAdmissions').where({ workspaceId }).count('* as n').first())?.n); expect(usage).toBeGreaterThan(0);
    const { action } = await ask(role, id); expect(action?.lead.name).toBe(lead.name);
    expect(await db('leads').where({ id }).first()).toBeTruthy();
    const responses = await Promise.all([decide(role, action!), decide(role, action!)]);
    for (const response of responses) {
      expect(response.status()).toBe(200); const receipt = (await response.json()).action;
      expect(receipt.state).toBe('confirmed'); expect(receipt.lead.name).toBe(''); expect(receipt.stage).toBeUndefined(); expect(receipt.archived).toBeUndefined();
    }
    for (const table of ['leads', 'leadActivity', 'assignmentNotifications']) expect(await db(table).where(table === 'leads' ? { id } : { leadId: id })).toHaveLength(0);
    expect(await db('assignmentEmailOutbox').where({ id: assignmentId })).toHaveLength(0);
    expect(await db('chatActionDrafts').where({ id: oldAction.id })).toHaveLength(0);
    expect(await db('leadDeletionAudit').where({ leadId: id })).toHaveLength(1);
    expect(await db('chatActionAudit').where({ draftId: action!.id, action: 'draft.confirmed' })).toHaveLength(1);
    const saved = await db('chatActionDrafts').where({ id: action!.id }).first();
    expect(saved.deletePayload.kind).toBe('receipt'); expect(saved.deletePayload.lead.name).toBeUndefined(); expect(saved.lead).toEqual({});
    const oldHistory = await history(role, oldRow.threadId);
    expect(oldHistory.messages.filter((m: { role: string }) => m.role === 'assistant').some((m: { text: string }) => m.text.includes('PRIVATE_ASSISTANT_SENTINEL'))).toBe(false);
    expect(oldHistory.turns.find((t: { id: string }) => t.id === oldRow.turnId).action).toBeUndefined();
    const restored = await history(role, saved.threadId); const restoredAction = restored.turns.find((t: { id: string }) => t.id === saved.turnId).action;
    expect(restoredAction.lead.name).toBe(''); expect(restoredAction.state).toBe('confirmed');
    expect(Number((await db('workspaceLeadAdmissions').where({ workspaceId }).count('* as n').first())?.n)).toBe(usage);
    await db('chatActionDrafts').where({ id: action!.id }).update({ expiresAt: new Date(Date.now() - 1000) });
    expect((await decide(role, action!)).status()).toBe(200);
  }
});
test('wrong, missing, whitespace and case-shifted confirmations cannot delete; generic approval and forged bodies are rejected', async () => {
  const id = await seed(), { action } = await ask('owner', id);
  for (const value of ['', 'LD-9999', action!.lead.number.toLowerCase(), ' ' + action!.lead.number, action!.lead.number + ' ']) expect((await decide('owner', action!, 'confirm', { typedConfirmation: value })).status()).toBe(422);
  expect((await decide('owner', { ...action!, inputHash: 'f'.repeat(64) })).status()).toBe(409);
  expect((await decide('owner', action!, 'confirm', { leadId: id })).status()).toBe(422);
  expect((await clients.owner.post('/api/chat/deletions', { headers, data: { workspaceId, draftId: action!.id, inputHash: action!.inputHash, decision: 'confirm' } })).status()).toBe(422);
  expect((await clients.owner.post('/api/chat/actions', { headers, data: { workspaceId, draftId: action!.id, inputHash: action!.inputHash, decision: 'confirm' } })).status()).toBe(409);
  expect((await clients.owner.post('/api/chat/deletions', { headers: { Origin: 'https://foreign.test' }, data: { workspaceId, draftId: action!.id, inputHash: action!.inputHash, decision: 'confirm', typedConfirmation: action!.lead.number } })).status()).toBe(403);
  const saved = await db('chatActionDrafts').where({ id: action!.id }).first();
  await ask('owner', id, { threadId: saved.threadId, message: 'yes' });
  expect(await db('leads').where({ id }).first()).toBeTruthy(); expect(await db('leadDeletionAudit').where({ leadId: id })).toHaveLength(0);
});
test('roles, actual workspace read scope, foreign actors and revoked delete grants cannot delete', async () => {
  const id = await seed();
  for (const role of ['office', 'field']) expect((await ask(role, id)).action).toBeUndefined();
  const { action } = await ask('owner', id);
  for (const role of ['admin', 'foreign']) expect((await decide(role, action!)).status()).toBe(403);
  await db('workspaceRolePolicies').where({ workspaceId, role: 'admin', permission: 'leads.read' }).update({ scope: 'assigned' });
  // Workspace delete plus assigned-only read is an invalid dependency policy; admission fails closed.
  expect((await clients.admin.post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId: randomUUID(), surfaceKey: 'home', message: deleteMessage(id) } })).status()).toBe(403);
  await db('workspaceRolePolicies').where({ workspaceId, role: 'admin', permission: 'leads.read' }).update({ scope: 'workspace' });
  const revoked = await ask('admin', id); await db('workspaceRolePolicies').where({ workspaceId, role: 'admin', permission: 'leads.delete' }).delete();
  expect((await decide('admin', revoked.action!)).status()).toBe(403); expect(await db('leads').where({ id }).first()).toBeTruthy();
});
test('cancel, expiry, stale version/stage, missing targets and Won leads leave data intact', async () => {
  const id = await seed(); const cancelled = await ask('owner', id);
  for (let i = 0; i < 2; i++) expect((await decide('owner', cancelled.action!, 'cancel')).status()).toBe(200);
  expect((await decide('owner', cancelled.action!)).status()).toBe(409);
  const expired = await ask('owner', id); await db('chatActionDrafts').where({ id: expired.action!.id }).update({ expiresAt: new Date(Date.now() - 1000) });
  expect((await decide('owner', expired.action!)).status()).toBe(409);
  const stale = await ask('owner', id); await db('leads').where({ id }).increment('version', 1);
  expect([403, 409]).toContain((await decide('owner', stale.action!)).status());
  const changed = await ask('owner', id); await db('leads').where({ id }).update({ stage: 'won' });
  expect((await decide('owner', changed.action!)).status()).toBe(409); expect((await ask('owner', id)).action).toBeUndefined();
  expect((await ask('owner')).action).toBeUndefined(); expect(await db('leads').where({ id }).first()).toBeTruthy();
});
test('Home/list require explicit authorized targets, including archived non-Won leads', async () => {
  const id = await seed(), foreignId = await seed(users.foreign, foreignWorkspace), row = await db('leads').where({ id }).first();
  await db('leads').where({ id }).update({ archivedAt: new Date() });
  const number = `LD-${String(row.leadNumber).padStart(4, '0')}`;
  const first = await ask('owner', undefined, { surfaceKey: 'home', message: deleteMessage(number) }); expect(first.action?.archived).toBe(true);
  expect((await decide('owner', first.action!, 'cancel')).status()).toBe(200);
  expect((await ask('owner', undefined, { surfaceKey: 'home', message: deleteMessage(foreignId) })).action).toBeUndefined();
  const next = await ask('owner', undefined, { surfaceKey: 'leads.list', message: deleteMessage(number) });
  expect((await decide('owner', next.action!)).status()).toBe(200); expect(await db('leads').where({ id }).first()).toBeUndefined();
});
test('chat approval audit failure rolls back deletion, content cleanup and receipt; retry commits once', async () => {
  const id = await seed(), { action } = await ask('owner', id), row = await db('leads').where({ id }).first();
  await db.raw(`CREATE FUNCTION test_reject_delete_approval() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action = 'draft.confirmed' AND NEW."actionType" = 'lead.delete' THEN RAISE EXCEPTION 'fixture audit failure'; END IF; RETURN NEW; END $$`);
  await db.raw('CREATE TRIGGER test_reject_delete_approval BEFORE INSERT ON "chatActionAudit" FOR EACH ROW EXECUTE FUNCTION test_reject_delete_approval()');
  try {
    expect((await decide('owner', action!)).status()).toBe(500); expect(await db('leads').where({ id }).first()).toEqual(row);
    expect((await db('chatActionDrafts').where({ id: action!.id }).first()).deletePayload.kind).toBe('proposal');
    expect(await db('leadDeletionAudit').where({ leadId: id })).toHaveLength(0);
  } finally { await db.raw('DROP TRIGGER test_reject_delete_approval ON "chatActionAudit"'); await db.raw('DROP FUNCTION test_reject_delete_approval()'); }
  expect((await decide('owner', action!)).status()).toBe(200); expect(await db('leadDeletionAudit').where({ leadId: id })).toHaveLength(1);
});
test('confirmed retries and safe receipts still require current delete permission', async () => {
  const id = await seed(), { action } = await ask('admin', id); expect((await decide('admin', action!)).status()).toBe(200);
  const saved = await db('chatActionDrafts').where({ id: action!.id }).first();
  await db('workspaceRolePolicies').where({ workspaceId, role: 'admin', permission: 'leads.delete' }).delete();
  expect((await decide('admin', action!)).status()).toBe(403);
  const result = await history('admin', saved.threadId); expect(result.turns.find((t: { id: string }) => t.id === saved.turnId).action).toBeUndefined();
});
test('live typed deletion survives a lost response, navigates away and restores only the safe receipt', async ({ page }) => {
  const row = await created('foreign', foreignWorkspace), id = row.id, number = `LD-${String(row.leadNumber).padStart(4, '0')}`;
  await page.context().addCookies((await clients.foreign.storageState()).cookies); await page.goto('/leads/' + id + '?workspace=' + foreignWorkspace);
  const open = () => page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click(); await open();
  await page.getByRole('textbox', { name: 'Ask the SalesMora assistant', exact: true }).fill(deleteMessage());
  await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  const card = page.getByRole('region', { name: 'Review permanent lead deletion' });
  await expect(card.getByRole('button', { name: 'Confirm permanent deletion' })).toBeDisabled();
  await page.reload(); await open(); await expect(card.getByRole('textbox', { name: 'Lead number' })).toHaveValue('');
  await card.getByRole('textbox', { name: 'Lead number' }).fill(number);
  await page.route('**/api/chat/deletions', async route => { await route.fetch(); await route.abort('failed'); }, { times: 1 });
  await card.getByRole('button', { name: 'Confirm permanent deletion' }).click(); await expect(card.getByRole('alert')).toBeVisible();
  await expect(card.getByRole('textbox', { name: 'Lead number' })).toHaveValue(number);
  await card.getByRole('button', { name: 'Confirm permanent deletion' }).click(); await expect(page).toHaveURL('/leads?workspace=' + foreignWorkspace);
  await page.reload(); await open(); await expect(card.getByRole('status')).toHaveText('Lead permanently deleted.');
  await expect(card.getByText(row.name, { exact: false })).toHaveCount(0);
  expect(await db('leads').where({ id }).first()).toBeUndefined(); expect(await db('leadDeletionAudit').where({ leadId: id })).toHaveLength(1);
});

test('confirmed deletion on the Leads list refreshes the visible record without a manual reload', async ({ page }) => {
  const row = await created('foreign', foreignWorkspace), id = row.id, number = `LD-${String(row.leadNumber).padStart(4, '0')}`;
  await page.context().addCookies((await clients.foreign.storageState()).cookies);
  await page.goto('/leads?workspace=' + foreignWorkspace);
  await expect(page.getByText(row.name, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click();
  await page.getByRole('textbox', { name: 'Ask the SalesMora assistant', exact: true }).fill(deleteMessage(number));
  await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  const card = page.getByRole('region', { name: 'Review permanent lead deletion' });
  await card.getByRole('textbox', { name: 'Lead number' }).fill(number);
  await card.getByRole('button', { name: 'Confirm permanent deletion' }).click();
  await expect(card.getByRole('status')).toHaveText('Lead permanently deleted.');
  await page.getByRole('button', { name: 'Close chat', exact: true }).click();
  await expect(page.getByText(row.name, { exact: true })).toHaveCount(0);
  expect(await db('leads').where({ id }).first()).toBeUndefined();
});
