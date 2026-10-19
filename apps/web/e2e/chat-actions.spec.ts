import { expect, test, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase, configureWorkspaceAIBudget } from '@salesmora/data';
import type { ChatStreamEvent, LeadDraftReview } from '@salesmora/contracts';
const url = process.env.TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith('_test') || url === process.env.DATABASE_URL) throw Error('Chat action tests require the isolated database');
const db = createDatabase(url); const headers = { Origin: process.env.SALESMORA_E2E_ORIGIN ?? 'http://127.0.0.1:3002' };
async function account(api: APIRequestContext, email = 'draft-owner@example.test') {
  expect((await api.post('/api/auth/sign-up/email', { headers, data: { name: 'Fictional draft tester', email, password: 'Fictional-draft-password-42!', termsAccepted: true } })).status()).toBe(200);
  return (await db('users').where({ email }).first()).id as string;
}
async function setup(api: APIRequestContext) {
  const userId = await account(api); const response = await api.post('/api/workspaces', { headers, data: { business: { businessName: 'Fictional draft workspace', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } } });
  expect(response.status()).toBe(201); return { workspaceId: (await response.json()).workspaceId as string, userId };
}
async function ask(api: APIRequestContext, workspaceId: string, message = 'fixture:draft', threadId?: string, surfaceKey = 'home') {
  const response = await api.post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId: randomUUID(), surfaceKey, message, threadId } });
  expect(response.status()).toBe(200);
  const events: ChatStreamEvent[] = (await response.text()).split('\n\n').filter(frame => frame.startsWith('data:')).map(frame => JSON.parse(frame.slice(5)));
  const proposal = events.find(event => event.type === 'action.proposed');
  return { events, action: proposal?.type === 'action.proposed' && !('actionType' in proposal.action) ? proposal.action : undefined };
}
function decide(api: APIRequestContext, workspaceId: string, action: LeadDraftReview, decision = 'confirm') {
  return api.post('/api/chat/actions', { headers, data: { workspaceId, draftId: action.id, inputHash: action.inputHash, decision } });
}
test.beforeEach(async () => { await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits", "chatActionAudit" CASCADE'); });
test.afterAll(async () => { await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits", "chatActionAudit" CASCADE'); await db.destroy(); });
test('review survives refresh; lost confirmation response and retry create exactly one lead', async ({ page }) => {
  const api = page.context().request; const { workspaceId } = await setup(api);
  await page.goto(`/home?workspace=${workspaceId}`); const open = () => page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click(); await open();
  await page.getByRole('textbox', { name: 'Ask the SalesMora assistant', exact: true }).fill('fixture:draft');
  await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Confirm and create lead' })).toBeEnabled(); expect(await db('leads').where({ workspaceId })).toHaveLength(0);
  await page.reload(); await open(); await expect(page.getByRole('region', { name: 'Review lead draft' })).toContainText('Fictional draft customer');
  await page.route('**/api/chat/actions', async route => { await route.fetch(); await route.abort('failed'); }, { times: 1 });
  await page.getByRole('button', { name: 'Confirm and create lead' }).click();
  await expect(page.getByRole('region', { name: 'Review lead draft' }).getByRole('alert')).toContainText('Retry to check');
  await page.getByRole('button', { name: 'Confirm and create lead' }).click();
  await expect(page.getByRole('region', { name: 'Review lead draft' }).getByRole('status')).toHaveText('Lead created');
  expect(await db('leads').where({ workspaceId })).toHaveLength(1);
  expect(await db('chatActionAudit').where({ workspaceId, action: 'draft.confirmed' })).toHaveLength(1);
  await page.reload(); await open(); await expect(page.getByRole('region', { name: 'Review lead draft' })).toContainText('Lead created');
});
test('a completed draft remains confirmable when the workspace AI allowance is zero', async ({ request }) => {
  const { workspaceId } = await setup(request);
  const { action } = await ask(request, workspaceId);
  expect(action).toBeDefined();
  try {
    await configureWorkspaceAIBudget(db, workspaceId, 0);
    expect((await decide(request, workspaceId, action!)).status()).toBe(200);
    expect(await db('leads').where({ workspaceId })).toHaveLength(1);
    expect(await db('aiUsageCalls').where({ workspaceId })).toHaveLength(0);
  } finally { await db('workspaceAITokenBudgets').where({ workspaceId }).delete(); }
});
test('Owner/Admin/Office can prepare and confirm; Field and cross-user/workspace attempts are denied', async ({ request, playwright }) => {
  const { workspaceId } = await setup(request); const owner = (await ask(request, workspaceId)).action!;
  expect((await decide(request, workspaceId, owner)).status()).toBe(200);
  for (const role of ['admin', 'office', 'field']) {
    const api = await playwright.request.newContext({ baseURL: 'http://127.0.0.1:3002' });
    const userId = await account(api, `draft-${role}@example.test`); await db('workspaceMemberships').insert({ workspaceId, userId, role });
    expect((await decide(api, workspaceId, owner)).status()).toBe(403);
    const result = await ask(api, workspaceId);
    if (role === 'field') { expect(result.action).toBeUndefined(); expect(result.events.at(-1)).toMatchObject({ type: 'turn.failed', code: 'access_denied' }); }
    else { expect(result.action).toBeDefined(); expect((await decide(api, workspaceId, result.action!)).status()).toBe(200); }
    await api.dispose();
  }
  expect((await decide(request, randomUUID(), owner)).status()).toBe(403);
  expect(await db('leads').where({ workspaceId })).toHaveLength(3);
  expect((await ask(request, workspaceId, 'fixture:draft', undefined, 'settings.overview')).action).toBeUndefined();
});
test('missing required details and invalid owner never produce a confirmable proposal', async ({ request }) => {
  const { workspaceId } = await setup(request);
  const missing = await ask(request, workspaceId, 'fixture:draft-missing'); expect(missing.action).toBeUndefined(); expect(missing.events.at(-1)?.type).toBe('turn.completed');
  expect((await ask(request, workspaceId, 'fixture:draft-owner:missing-member')).action).toBeUndefined();
  expect(await db('chatActionDrafts').where({ workspaceId })).toHaveLength(0); expect(await db('leads').where({ workspaceId })).toHaveLength(0);
});
test('forged inputs, expired/cancelled/superseded/unfinished drafts and policy changes cannot commit', async ({ request }) => {
  const { workspaceId } = await setup(request);
  const first = (await ask(request, workspaceId)).action!;
  expect((await decide(request, workspaceId, { ...first, inputHash: '0'.repeat(64) })).status()).toBe(409);
  expect((await request.post('/api/chat/actions', { headers, data: { workspaceId, draftId: first.id, inputHash: first.inputHash, decision: 'confirm', lead: first.lead } })).status()).toBe(422);
  await db('chatActionDrafts').where({ id: first.id }).update({ expiresAt: new Date(Date.now() - 1000) }); expect((await decide(request, workspaceId, first)).status()).toBe(409);
  const cancelled = (await ask(request, workspaceId)).action!; expect((await decide(request, workspaceId, cancelled, 'cancel')).status()).toBe(200); expect((await decide(request, workspaceId, cancelled)).status()).toBe(409);
  const old = (await ask(request, workspaceId)).action!; const thread = (await db('chatActionDrafts').where({ id: old.id }).first()).threadId;
  const current = (await ask(request, workspaceId, 'fixture:draft', thread)).action!; expect((await decide(request, workspaceId, old)).status()).toBe(409);
  const turn = (await db('chatActionDrafts').where({ id: current.id }).first()).turnId;
  await db('chatTurns').where({ id: turn }).update({ state: 'failed' }); expect((await decide(request, workspaceId, current)).status()).toBe(409);
  const revoked = (await ask(request, workspaceId)).action!;
  await db('workspacePolicies').where({ workspaceId }).increment('revision', 1); expect((await decide(request, workspaceId, revoked)).status()).toBe(403);
  expect(await db('leads').where({ workspaceId })).toHaveLength(0);
});
test('changed owner state is stale and concurrent confirms return the same lead', async ({ request, playwright }) => {
  const { workspaceId } = await setup(request); const api = await playwright.request.newContext({ baseURL: 'http://127.0.0.1:3002' });
  const member = await account(api, 'draft-member@example.test'); await db('workspaceMemberships').insert({ workspaceId, userId: member, role: 'office' });
  const assigned = (await ask(request, workspaceId, `fixture:draft-owner:${member}`)).action!; expect(assigned.ownerName).toBe('Fictional draft tester');
  await db('workspaceMemberships').where({ workspaceId, userId: member }).update({ role: 'field' }); expect((await decide(request, workspaceId, assigned)).status()).toBe(409);
  const current = (await ask(request, workspaceId)).action!;
  const results = await Promise.all(Array.from({ length: 4 }, () => decide(request, workspaceId, current)));
  for (const response of results) expect(response.status()).toBe(200);
  const ids = await Promise.all(results.map(async response => (await response.json()).action.leadId)); expect(new Set(ids).size).toBe(1);
  expect(await db('leads').where({ workspaceId })).toHaveLength(1); expect(await db('chatActionAudit').where({ workspaceId, action: 'draft.confirmed' })).toHaveLength(1); await api.dispose();
});
test('audit failure rolls back lead creation and leaves the proposal safely retryable', async ({ request }) => {
  const { workspaceId } = await setup(request); const action = (await ask(request, workspaceId)).action!;
  await db.raw(`CREATE FUNCTION test_reject_chat_approval() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action = 'draft.confirmed' THEN RAISE EXCEPTION 'Fictional audit failure'; END IF; RETURN NEW; END $$`);
  await db.raw('CREATE TRIGGER test_reject_chat_approval BEFORE INSERT ON "chatActionAudit" FOR EACH ROW EXECUTE FUNCTION test_reject_chat_approval()');
  try { expect((await decide(request, workspaceId, action)).status()).toBe(500); expect(await db('leads').where({ workspaceId })).toHaveLength(0); expect((await db('chatActionDrafts').where({ id: action.id }).first()).state).toBe('pending'); }
  finally { await db.raw('DROP TRIGGER test_reject_chat_approval ON "chatActionAudit"'); await db.raw('DROP FUNCTION test_reject_chat_approval()'); }
  expect((await decide(request, workspaceId, action)).status()).toBe(200);
});

test('thread deletion removes private proposals while preserving the lead and immutable non-content audit', async ({ request }) => {
  const { workspaceId } = await setup(request); const action = (await ask(request, workspaceId)).action!;
  expect((await decide(request, workspaceId, action)).status()).toBe(200);
  const draft = await db('chatActionDrafts').where({ id: action.id }).first();
  const audit = await db('chatActionAudit').where({ draftId: action.id, action: 'draft.confirmed' }).first();
  await expect(db('chatActionAudit').where({ id: audit.id }).update({ action: 'draft.cancelled' })).rejects.toThrow('immutable');
  await expect(db('chatActionAudit').where({ id: audit.id }).delete()).rejects.toThrow('immutable');
  expect((await request.delete('/api/chat/threads', { headers, data: { workspaceId, threadId: draft.threadId } })).status()).toBe(200);
  expect(await db('chatActionDrafts').where({ id: action.id })).toHaveLength(0);
  expect(await db('chatActionAudit').where({ draftId: action.id, action: 'draft.confirmed' })).toHaveLength(1);
  expect(await db('leads').where({ workspaceId })).toHaveLength(1);
});
