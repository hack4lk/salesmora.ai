import { test, expect, request as requests, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase } from '@salesmora/data';
import { leadAssignmentDraftReviewSchema } from '@salesmora/contracts';
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
    expect((await clients[role].post('/api/auth/sign-up/email', { headers, data: { name: `Assignment ${role}`, email, password: 'Fictional-stage-password-42!', termsAccepted: true } })).status()).toBe(200);
    users[role] = (await db('users').where({ email }).first()).id;
  }
});
const workspaces: string[] = [];
test.beforeEach(async () => {
  await db('rateLimits').delete();
  const input = { business: { businessName: 'Assignment fixture workspace', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } };
  workspaceId = (await (await clients.owner.post('/api/workspaces', { headers, data: input })).json()).workspaceId;
  foreignWorkspace = (await (await clients.foreign.post('/api/workspaces', { headers, data: input })).json()).workspaceId;
  for (const role of ['admin', 'office', 'field']) await db('workspaceMemberships').insert({ workspaceId, userId: users[role], role });
  workspaces.push(workspaceId, foreignWorkspace);
});
test.afterEach(async () => { await db('leads').whereIn('workspaceId', workspaces).delete(); await db('users').whereIn('id', Object.values(users)).delete(); await Promise.all(Object.values(clients).map(client => client.dispose())); });
test.afterAll(async () => { await db.destroy(); });
async function seed(ownerId: string | null = users.field, workspace = workspaceId) {
  const id = randomUUID(); await db('leads').insert({ id, workspaceId: workspace, ownerId, createdBy: users.owner, submissionId: randomUUID(), submissionHash: 'stage-fixture', name: 'Assignment fixture customer', service: 'Furnace repair', email: '', phone: '(212) 555-0142', address: '18 Willow Street', details: 'Existing request details', notes: 'Existing internal notes', stage: 'new', source: 'other' }); return id;
}
async function ask(role: string, id?: string, patch = {}) {
  const response = await clients[role].post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId: randomUUID(), surfaceKey: 'lead.detail', recordRefs: id ? [{ type: 'lead', id }] : undefined, message: assignmentMessage('self'), ...patch } });
  expect(response.status()).toBe(200); const events = (await response.text()).split('\n\n').filter(line => line.startsWith('data: ')).map(line => JSON.parse(line.slice(6)));
  const raw = events.find(event => event.type === 'action.proposed')?.action;
  return { events, action: raw ? leadAssignmentDraftReviewSchema.parse(raw) : undefined };
}
function decide(role: string, action: { id: string; inputHash: string }, decision = 'confirm', patch = {}) {
  return clients[role].post('/api/chat/actions', { headers, data: { workspaceId, draftId: action.id, inputHash: action.inputHash, decision, ...patch } });
}

function assignmentMessage(kind: 'self' | 'unassign' | 'teammate', teammateRef = '', leadRef = '') {
  return 'fixture:assign:' + JSON.stringify({ leadRef, assignment: { kind, teammateRef } });
}
test('Owner, Admin and Office can assign to themselves and unassign; neither path queues self notifications', async () => {
  for (const role of ['owner', 'admin', 'office']) {
    const id = await seed(), { action } = await ask(role, id);
    expect(action?.from?.id).toBe(users.field); expect(action?.to?.id).toBe(users[role]);
    expect((await db('leads').where({ id }).first()).ownerId).toBe(users.field);
    expect((await decide(role, action!)).status()).toBe(200);
    expect((await decide(role, action!)).status()).toBe(200);
    expect((await db('leads').where({ id }).first()).ownerId).toBe(users[role]);
    expect(await db('assignmentNotifications').where({ leadId: id })).toHaveLength(0);
    const next = await ask(role, id, { message: assignmentMessage('unassign') });
    expect(next.action?.to).toBeNull(); expect((await decide(role, next.action!)).status()).toBe(200);
    expect((await db('leads').where({ id }).first()).ownerId).toBeNull();
    const events = await db('leadActivity').where({ leadId: id, type: 'assigned' });
    expect(events).toHaveLength(2); expect(events.every(event => event.actorType === 'assistant-confirmed')).toBe(true);
    expect(await db('assignmentNotifications').where({ leadId: id })).toHaveLength(0);
  }
});
test('exact name lookup and duplicate confirmation queue one notification through the manual use case', async () => {
  const id = await seed();
  const { action } = await ask('owner', id, { message: assignmentMessage('teammate', 'assignment OFFICE') });
  expect(action?.to?.id).toBe(users.office); expect(JSON.stringify(action)).not.toContain('membershipVersion');
  expect((await decide('owner', action!)).status()).toBe(200);
  expect((await decide('owner', action!)).status()).toBe(200);
  expect(await db('assignmentNotifications').where({ leadId: id, userId: users.office })).toHaveLength(1);
  expect(await db('assignmentEmailOutbox').where({ id: action!.id })).toHaveLength(1);
  expect(await db('leadActivity').where({ leadId: id, type: 'assigned' })).toHaveLength(1);
  expect(await db('chatActionAudit').where({ draftId: action!.id, action: 'draft.confirmed', actionType: 'lead.assign' })).toHaveLength(1);
});
test('ambiguous, absent and foreign teammates produce no roster disclosure or confirmable proposal; exact email resolves ambiguity', async () => {
  const id = await seed();
  await db('users').whereIn('id', [users.office, users.field]).update({ name: 'Alex Chen' });
  const ambiguous = await ask('owner', id, { message: assignmentMessage('teammate', 'Alex Chen') });
  expect(ambiguous.action).toBeUndefined(); expect(JSON.stringify(ambiguous.events)).toContain('lead-assignment-teammate-ambiguous');
  expect(JSON.stringify(ambiguous.events)).not.toContain(users.office);
  for (const ref of ['Missing Person', users.foreign, '%', "x' OR true --"]) {
    const result = await ask('owner', id, { message: assignmentMessage('teammate', ref) });
    expect(result.action).toBeUndefined(); expect(JSON.stringify(result.events)).toContain('lead-assignment-teammate-not-found');
  }
  const email = (await db('users').where({ id: users.office }).first()).email;
  const exact = await ask('owner', id, { message: assignmentMessage('teammate', email) });
  expect(exact.action?.to?.id).toBe(users.office);
  expect(JSON.stringify(exact.action)).not.toContain(email);
});
test('Field cannot prepare assignment and other actors cannot confirm someone else’s draft or forge its hash', async () => {
  const id = await seed();
  const denied = await ask('field', id); expect(denied.action).toBeUndefined();
  expect(JSON.stringify(denied.events)).not.toContain('Assignment fixture customer');
  const { action } = await ask('owner', id);
  expect((await decide('field', action!)).status()).toBe(403);
  expect((await decide('admin', action!)).status()).toBe(403);
  expect((await decide('owner', { ...action!, inputHash: 'f'.repeat(64) })).status()).toBe(409);
  expect((await db('leads').where({ id }).first()).ownerId).toBe(users.field);
});
test('cancel, unchanged, archived and absent targets never alter assignment or queue notifications', async () => {
  const id = await seed(), { action } = await ask('owner', id);
  expect((await decide('owner', action!, 'cancel')).status()).toBe(200);
  expect((await decide('owner', action!, 'cancel')).status()).toBe(200);
  expect((await ask('owner', id, { message: assignmentMessage('teammate', users.field) })).action).toBeUndefined();
  expect((await ask('owner')).action).toBeUndefined();
  await db('leads').where({ id }).update({ archivedAt: new Date() });
  expect((await ask('owner', id)).action).toBeUndefined();
  expect(await db('assignmentNotifications').where({ leadId: id })).toHaveLength(0);
  expect((await db('leads').where({ id }).first()).ownerId).toBe(users.field);
});
test('target removal, name changes and membership replacement invalidate the frozen assignment', async () => {
  const id = await seed(), patch = { message: assignmentMessage('teammate', users.office) };
  const first = await ask('owner', id, patch);
  await db('users').where({ id: users.office }).update({ name: 'Renamed teammate' });
  expect((await decide('owner', first.action!)).status()).toBe(409);
  const second = await ask('owner', id, patch);
  await db('workspaceMemberships').where({ workspaceId, userId: users.office }).update({ role: 'office' });
  expect((await decide('owner', second.action!)).status()).toBe(409);
  const third = await ask('owner', id, patch);
  await db('workspaceMemberships').where({ workspaceId, userId: users.office }).delete();
  expect((await decide('owner', third.action!)).status()).toBe(409);
  expect((await db('leads').where({ id }).first()).ownerId).toBe(users.field);
  expect(await db('assignmentNotifications').where({ leadId: id })).toHaveLength(0);
});
test('stale source, expiry and revoked assignment permission prevent confirmation', async () => {
  const id = await seed(), first = await ask('owner', id);
  await db('leads').where({ id }).increment('version', 1);
  expect((await decide('owner', first.action!)).status()).toBe(409);
  const expired = await ask('admin', id);
  await db('chatActionDrafts').where({ id: expired.action!.id }).update({ expiresAt: new Date(Date.now() - 1000) });
  expect((await decide('admin', expired.action!)).status()).toBe(409);
  const revoked = await ask('office', id);
  await db('workspaceRolePolicies').where({ workspaceId, role: 'office', permission: 'leads.assign' }).delete();
  await db('workspacePolicies').where({ workspaceId }).increment('revision', 1);
  expect((await decide('office', revoked.action!)).status()).toBe(403);
  expect((await ask('office', id)).action).toBeUndefined();
  expect((await db('leads').where({ id }).first()).ownerId).toBe(users.field);
});
test('Home accepts explicit authorized LD-number targets and rejects other workspaces', async () => {
  const id = await seed(), lead = await db('leads').where({ id }).first();
  const result = await ask('owner', undefined, { surfaceKey: 'home', message: assignmentMessage('self', '', 'LD-' + String(lead.leadNumber).padStart(4, '0')) });
  expect(result.action?.lead.id).toBe(id);
  expect((await decide('owner', result.action!)).status()).toBe(200);
  const foreign = await seed(users.foreign, foreignWorkspace);
  expect((await ask('owner', undefined, { surfaceKey: 'home', message: assignmentMessage('self', '', foreign) })).action).toBeUndefined();
});
test('audit failure rolls back assignment, activity, notification and email queue; retry commits once', async () => {
  const id = await seed(), { action } = await ask('owner', id, { message: assignmentMessage('teammate', users.office) });
  await db.raw(`CREATE FUNCTION test_reject_assignment_approval() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action = 'draft.confirmed' AND NEW."actionType" = 'lead.assign' THEN RAISE EXCEPTION 'Fictional audit failure'; END IF; RETURN NEW; END $$`);
  await db.raw('CREATE TRIGGER test_reject_assignment_approval BEFORE INSERT ON "chatActionAudit" FOR EACH ROW EXECUTE FUNCTION test_reject_assignment_approval()');
  try {
    expect((await decide('owner', action!)).status()).toBe(500);
    expect((await db('leads').where({ id }).first()).ownerId).toBe(users.field);
    expect(await db('assignmentNotifications').where({ leadId: id })).toHaveLength(0);
    expect(await db('assignmentEmailOutbox').where({ id: action!.id })).toHaveLength(0);
    expect(await db('leadActivity').where({ leadId: id, type: 'assigned' })).toHaveLength(0);
  } finally { await db.raw('DROP TRIGGER test_reject_assignment_approval ON "chatActionAudit"'); await db.raw('DROP FUNCTION test_reject_assignment_approval()'); }
  expect((await decide('owner', action!)).status()).toBe(200);
  expect((await decide('owner', action!)).status()).toBe(200);
  expect(await db('assignmentNotifications').where({ leadId: id })).toHaveLength(1);
});
test('live assignment review restores, retries a lost response and retains its confirmed receipt', async ({ page }) => {
  const id = await seed(null, foreignWorkspace);
  await page.context().addCookies((await clients.foreign.storageState()).cookies);
  await page.goto('/leads/' + id + '?workspace=' + foreignWorkspace);
  const open = () => page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click();
  await open();
  await page.getByRole('textbox', { name: 'Ask the SalesMora assistant', exact: true }).fill(assignmentMessage('self'));
  await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  const card = page.getByRole('region', { name: 'Review lead assignment' });
  await expect(card).toContainText('Unassigned'); await expect(card).toContainText('Assignment foreign');
  await page.reload(); await open(); await expect(card.getByRole('button', { name: 'Confirm assignment change' })).toBeEnabled();
  await page.route('**/api/chat/actions', async route => { await route.fetch(); await route.abort('failed'); }, { times: 1 });
  await card.getByRole('button', { name: 'Confirm assignment change' }).click(); await expect(card.getByRole('alert')).toBeVisible();
  await card.getByRole('button', { name: 'Confirm assignment change' }).click(); await expect(card.getByRole('status')).toHaveText('Lead assignment changed');
  await page.reload(); await open(); await expect(card.getByRole('status')).toHaveText('Lead assignment changed');
  expect((await db('leads').where({ id }).first()).ownerId).toBe(users.foreign);
  expect(await db('leadActivity').where({ leadId: id, type: 'assigned' })).toHaveLength(1);
});
