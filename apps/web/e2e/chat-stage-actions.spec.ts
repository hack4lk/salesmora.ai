import { test, expect, request as requests, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase } from '@salesmora/data';
import { leadStageDraftReviewSchema } from '@salesmora/contracts';
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL) throw Error('Use the isolated test database');
const db = createDatabase(connection), origin = 'http://127.0.0.1:3002', headers = { Origin: origin };
const clients: Record<string, APIRequestContext> = {}, users: Record<string, string> = {};
let workspaceId: string, foreignWorkspace: string;
test.beforeAll(async () => {
  await db('rateLimits').delete();
  const prefix = randomUUID();
  for (const role of ['owner', 'admin', 'office', 'field', 'foreign']) {
    clients[role] = await requests.newContext({ baseURL: origin }); const email = `${prefix}-${role}@example.test`;
    expect((await clients[role].post('/api/auth/sign-up/email', { headers, data: { name: `Stage ${role}`, email, password: 'Fictional-stage-password-42!', termsAccepted: true } })).status()).toBe(200);
    users[role] = (await db('users').where({ email }).first()).id;
  }
  const input = { business: { businessName: 'Stage fixture workspace', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } };
  workspaceId = (await (await clients.owner.post('/api/workspaces', { headers, data: input })).json()).workspaceId;
  foreignWorkspace = (await (await clients.foreign.post('/api/workspaces', { headers, data: input })).json()).workspaceId;
  for (const role of ['admin', 'office', 'field']) await db('workspaceMemberships').insert({ workspaceId, userId: users[role], role });
});
test.beforeEach(async () => { await db('rateLimits').delete(); });
test.afterAll(async () => { await db('leads').whereIn('workspaceId', [workspaceId, foreignWorkspace].filter(Boolean)).delete(); await db('users').whereIn('id', Object.values(users)).delete(); await Promise.all(Object.values(clients).map(client => client.dispose())); await db.destroy(); });
async function seed(ownerId = users.field, workspace = workspaceId) {
  const id = randomUUID(); await db('leads').insert({ id, workspaceId: workspace, ownerId, createdBy: users.owner, submissionId: randomUUID(), submissionHash: 'stage-fixture', name: 'Stage fixture customer', service: 'Furnace repair', email: '', phone: '', address: '', details: '', notes: '', stage: 'new', source: 'other' }); return id;
}
async function ask(role: string, id?: string, patch = {}) {
  const response = await clients[role].post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId: randomUUID(), surfaceKey: 'lead.detail', recordRefs: id ? [{ type: 'lead', id }] : undefined, message: 'fixture:stage', ...patch } });
  expect(response.status()).toBe(200); const events = (await response.text()).split('\n\n').filter(line => line.startsWith('data: ')).map(line => JSON.parse(line.slice(6)));
  const raw = events.find(event => event.type === 'action.proposed')?.action;
  return { events, action: raw ? leadStageDraftReviewSchema.parse(raw) : undefined };
}
function decide(role: string, action: { id: string; inputHash: string }, decision = 'confirm', patch = {}) {
  return clients[role].post('/api/chat/actions', { headers, data: { workspaceId, draftId: action.id, inputHash: action.inputHash, decision, ...patch } });
}
test('all four roles can propose and confirm stages in their actual scope; duplicate confirmation is safe', async () => {
  for (const role of ['owner', 'admin', 'office', 'field']) {
    const id = await seed(); const { action } = await ask(role, id); expect(action && 'actionType' in action && action.to).toBe('estimate-sent');
    expect((await db('leads').where({ id }).first()).stage).toBe('new');
    expect((await decide(role, action!)).status()).toBe(200); expect((await decide(role, action!)).status()).toBe(200);
    expect((await db('leads').where({ id }).first()).stage).toBe('estimate-sent');
    expect(await db('leadActivity').where({ leadId: id, type: 'stage' })).toHaveLength(1);
    expect((await db('leadActivity').where({ leadId: id, type: 'stage' }).first()).actorType).toBe('assistant-confirmed');
    expect(await db('chatActionAudit').where({ draftId: action!.id, action: 'draft.confirmed', actionType: 'lead.stage' })).toHaveLength(1);
  }
});
test('cancel and expired proposals do not move a lead; plain chat replies never confirm', async () => {
  const id = await seed(); const first = await ask('owner', id);
  expect((await decide('owner', first.action!, 'cancel')).status()).toBe(200);
  const expired = await ask('owner', id); await db('chatActionDrafts').where({ id: expired.action!.id }).update({ expiresAt: new Date(Date.now() - 1000) });
  expect((await decide('owner', expired.action!)).status()).toBe(409);
  await ask('owner', id, { message: 'yes' });
  expect((await db('leads').where({ id }).first()).stage).toBe('new');
});
test('Field cannot target another assignee or a foreign workspace; forged hashes and identities fail', async () => {
  for (const id of [await seed(users.owner), await seed(users.owner, foreignWorkspace)]) {
    expect((await ask('field', id)).action).toBeUndefined();
    expect((await db('leads').where({ id }).first()).stage).toBe('new');
  }
  const id = await seed(), { action } = await ask('owner', id);
  expect((await decide('field', action!)).status()).toBe(403);
  expect((await decide('owner', { ...action!, inputHash: 'f'.repeat(64) })).status()).toBe(409);
});
test('reassignment and version changes invalidate pending proposals', async () => {
  const id = await seed(), { action } = await ask('field', id);
  await db('leads').where({ id }).update({ ownerId: users.owner }).increment('version', 1);
  expect((await decide('field', action!)).status()).toBe(403);
  const other = await seed(), second = await ask('owner', other); await db('leads').where({ id: other }).increment('version', 1);
  expect((await decide('owner', second.action!)).status()).toBe(409);
  expect((await db('leads').where({ id: other }).first()).stage).toBe('new');
});
test('explicit LD-number resolves within workspace; absent targets, archived and unchanged leads create no draft', async () => {
  expect((await ask('owner')).action).toBeUndefined();
  const id = await seed(), lead = await db('leads').where({ id }).first();
  const result = await ask('owner', undefined, { surfaceKey: 'home', message: `fixture:stage-ref:LD-${String(lead.leadNumber).padStart(4, '0')}` });
  expect(result.action?.lead.id).toBe(id);
  await db('leads').where({ id }).update({ archivedAt: new Date() }); expect((await ask('owner', id)).action).toBeUndefined();
  await db('leads').where({ id }).update({ archivedAt: null, stage: 'estimate-sent' }); expect((await ask('owner', id)).action).toBeUndefined();
});
test('live review survives reload, recovers a lost response and refreshes the stage once', async ({ page }) => {
  const id = await seed(users.foreign, foreignWorkspace); await page.context().addCookies((await clients.foreign.storageState()).cookies);
  const open = () => page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click();
  await page.goto(`/leads/${id}?workspace=${foreignWorkspace}`); await open();
  await page.getByRole('textbox', { name: 'Ask the SalesMora assistant', exact: true }).fill('fixture:stage');
  await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Confirm stage change' })).toBeEnabled();
  await page.reload(); await open();
  const card = page.getByRole('region', { name: 'Review stage change' }); await expect(card).toContainText('Estimate sent');
  await page.route('**/api/chat/actions', async route => { await route.fetch(); await route.abort('failed'); }, { times: 1 });
  await card.getByRole('button', { name: 'Confirm stage change' }).click(); await expect(card.getByRole('alert')).toBeVisible();
  await card.getByRole('button', { name: 'Confirm stage change' }).click(); await expect(card.getByRole('status')).toHaveText('Stage changed');
  expect(await db('leadActivity').where({ leadId: id, type: 'stage' })).toHaveLength(1);
  await page.reload(); await open(); await expect(card.getByRole('status')).toHaveText('Stage changed');
});

test('Lost keeps its reviewed reason; a changed policy prevents confirmation', async () => {
  const id = await seed(), lost = await ask('admin', id, { message: 'fixture:stage-lost' });
  expect(lost.action?.reason).toBe('Customer chose another provider.');
  expect((await decide('admin', lost.action!)).status()).toBe(200);
  const event = await db('leadActivity').where({ leadId: id, type: 'stage' }).first();
  expect(event.changes.reason).toBe('Customer chose another provider.');
  const other = await seed(), proposal = await ask('office', other);
  const grant = await db('workspaceRolePolicies').where({ workspaceId, role: 'office', permission: 'leads.stage.update' }).first();
  try {
    await db.transaction(async trx => {
      await trx('workspaces').where({ id: workspaceId }).forUpdate().first();
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'office', permission: 'leads.stage.update' }).delete();
      await trx('workspacePolicies').where({ workspaceId }).increment('revision', 1);
    });
    expect((await decide('office', proposal.action!)).status()).toBe(403);
    expect((await ask('office', other)).action).toBeUndefined();
    expect((await db('leads').where({ id: other }).first()).stage).toBe('new');
  } finally {
    await db('workspaceRolePolicies').insert(grant);
    await db('workspacePolicies').where({ workspaceId }).increment('revision', 1);
  }
});
