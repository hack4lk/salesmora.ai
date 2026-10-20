import { expect, test, type APIRequestContext } from '@playwright/test';
import { createDatabase, configureWorkspaceAIBudget } from '@salesmora/data';
import { randomUUID } from 'node:crypto';
const target = process.env.TEST_DATABASE_URL;
if (!target || !new URL(target).pathname.endsWith('_test') || target === process.env.DATABASE_URL) throw Error('Chat UI tests require the isolated database');
const db = createDatabase(target);
const headers = { Origin: process.env.SALESMORA_E2E_ORIGIN ?? 'http://127.0.0.1:3002' };
async function setup(api: APIRequestContext) {
  expect((await api.post('/api/auth/sign-up/email', { headers, data: { name: 'Fictional chat UI owner', email: 'chat-ui@example.test', password: 'Fictional-chat-ui-password-42!', termsAccepted: true } })).status()).toBe(200);
  const response = await api.post('/api/workspaces', { headers, data: { business: { businessName: 'Fictional UI workspace', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } } });
  expect(response.status()).toBe(201); return (await response.json()).workspaceId as string;
}
test.beforeEach(async () => { await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE'); });
test.afterAll(async () => { await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE'); await db.destroy(); });
const composer = (page: import('@playwright/test').Page) => page.getByRole('textbox', { name: 'Ask the SalesMora assistant', exact: true });
const open = (page: import('@playwright/test').Page) => page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click();
test('shows Thinking, real incremental transport, close/reopen, refresh and new conversation without duplicate submissions', async ({ page }) => {
  const workspace = await setup(page.context().request);
  await page.goto(`/home?workspace=${workspace}`); await open(page);
  await composer(page).fill('fixture:slow'); await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Thinking…' })).toBeVisible();
  await expect(page.getByRole('log')).toContainText('Fictional test response.');
  await expect(page.getByRole('log')).not.toContainText('Streaming works');
  await page.getByRole('button', { name: 'Close chat' }).click(); await open(page);
  await expect(page.getByRole('log')).toContainText('Streaming works 🌍.');
  await expect(page.getByRole('status').filter({ hasText: 'Response complete.' })).toBeVisible();
  expect(await db('chatTurns').where({ workspaceId: workspace })).toHaveLength(1);
  await page.reload(); await open(page); await expect(page.getByRole('log')).toContainText('Streaming works 🌍.');
  await page.getByRole('button', { name: 'New conversation' }).click();
  await expect(page.getByRole('log')).toHaveCount(0);
  await composer(page).fill('Hello again'); await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Response complete.' })).toBeVisible();
  expect(await db('chatThreads').where({ workspaceId: workspace })).toHaveLength(2);
});
test('workspace allowance failure is explained, retry does not spend, and manual leads remain available', async ({ page }) => {
  const workspaceId = await setup(page.context().request);
  try {
    await configureWorkspaceAIBudget(db, workspaceId, 0);
    await page.goto(`/home?workspace=${workspaceId}`); await open(page);
    await composer(page).fill('fixture:budget'); await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
    await expect(page.getByRole('dialog').getByRole('alert')).toContainText('does not have enough monthly AI allowance');
    await page.getByRole('button', { name: 'Retry response' }).click();
    await expect.poll(async () => (await db('chatTurns').where({ workspaceId })).length).toBe(2);
    await expect(page.getByRole('dialog').getByRole('alert')).toContainText('does not have enough monthly AI allowance');
    expect(await db('aiUsageCalls').where({ workspaceId })).toHaveLength(0);
    const lead = { name: 'Fictional budget-independent lead', email: '', phone: '', service: 'Repair', address: '', details: '', notes: '', source: 'other', stage: 'new', ownerId: '' };
    expect((await page.context().request.post('/api/leads', { headers, data: { workspaceId, submissionId: randomUUID(), lead } })).status()).toBe(201);
    await configureWorkspaceAIBudget(db, workspaceId, 100);
    await page.getByRole('button', { name: 'Retry response' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Response complete.' })).toBeVisible();
    expect(await db('aiUsageCalls').where({ workspaceId })).toHaveLength(1);
  } finally {
    await db('workspaceAITokenBudgets').where({ workspaceId }).delete(); await db('aiUsageCalls').where({ workspaceId }).delete();
  }
});
test('Stop before acceptance cancels the accepted run and retains an incomplete response', async ({ page }) => {
  const workspace = await setup(page.context().request); await page.goto(`/home?workspace=${workspace}`); await open(page);
  await page.route('**/api/chat/turns', async route => { await new Promise(resolve => setTimeout(resolve, 350)); await route.continue(); });
  await composer(page).fill('fixture:slow'); await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  await page.getByRole('button', { name: 'Stop response' }).click();
  await expect.poll(async () => (await db('chatTurns').where({ workspaceId: workspace }).first())?.state).toBe('cancelled');
  await expect(page.getByRole('log')).toContainText('Incomplete response');
  await expect(composer(page)).toBeEnabled();
});
test('a failed stream stays incomplete and explicit retry creates exactly one new turn', async ({ page }) => {
  const workspace = await setup(page.context().request); await page.goto(`/home?workspace=${workspace}`); await open(page);
  await composer(page).fill('fixture:fail'); await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  await expect(page.getByRole('log')).toContainText('Incomplete response');
  await page.getByRole('button', { name: 'Retry response' }).click();
  await expect.poll(async () => (await db('chatTurns').where({ workspaceId: workspace })).length).toBe(2);
  await expect(page.getByRole('status').filter({ hasText: 'The response was interrupted.' })).toBeVisible();
  expect(await db('leads').where({ workspaceId: workspace })).toHaveLength(0);
});
test('retry reconciles a lost acceptance response without generating a duplicate turn', async ({ page }) => {
  const workspace = await setup(page.context().request); await page.goto(`/home?workspace=${workspace}`); await open(page);
  await page.route('**/api/chat/turns', async route => {
    await route.fetch(); // Server accepts and completes; the browser loses even the acceptance frame.
    await route.abort('failed');
  }, { times: 1 });
  await composer(page).fill('Hello'); await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  await page.getByRole('button', { name: 'Retry response' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Response complete.' })).toBeVisible();
  await expect(page.getByRole('log')).toContainText('Streaming works 🌍.');
  expect(await db('chatTurns').where({ workspaceId: workspace })).toHaveLength(1);
});
test('saved assistant output is withheld after role/grant changes and checkpoints delete with their transcript', async ({ page }) => {
  const workspace = await setup(page.context().request); await page.goto(`/home?workspace=${workspace}`); await open(page);
  await composer(page).fill('Hello'); await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Response complete.' })).toBeVisible();
  const turn = await db('chatTurns').where({ workspaceId: workspace }).first();
  await db('workspacePolicies').where({ workspaceId: workspace }).increment('revision', 1);
  const response = await page.context().request.get(`/api/chat/threads?workspace=${workspace}&thread=${turn.threadId}`);
  const history = await response.json();
  expect(history.messages.find((message: { role: string }) => message.role === 'assistant').text).toContain('no longer available');
  // Checkpoint metadata cannot restore hidden text and is deleted atomically with the thread.
  await db('checkpoints').insert({ thread_id: turn.id, checkpoint_ns: '', checkpoint_id: 'fictional', checkpoint: JSON.stringify({ turnId: turn.id, phase: 'answered' }) });
  expect((await page.context().request.delete('/api/chat/threads', { headers, data: { workspaceId: workspace, threadId: turn.threadId } })).status()).toBe(200);
  expect(await db('checkpoints').where({ thread_id: turn.id })).toHaveLength(0);
});
