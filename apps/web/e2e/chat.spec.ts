import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase } from '@salesmora/data';
import type { ChatStreamEvent, ChatTurnRequest } from '@salesmora/contracts';
const url = process.env.TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith('_test') || url === process.env.DATABASE_URL) throw Error('Chat tests require the isolated _test database.');
const db = createDatabase(url);
const headers = { Origin: process.env.SALESMORA_E2E_ORIGIN ?? 'http://127.0.0.1:3002' };
async function account(api: APIRequestContext, email = 'chat-owner@example.test') {
  expect((await api.post('/api/auth/sign-up/email', { headers, data: { name: 'Fictional chat tester', email, password: 'Fictional-chat-password-42!', termsAccepted: true } })).status()).toBe(200);
  return (await db('users').where({ email }).first()).id as string;
}
async function workspace(api: APIRequestContext) {
  const response = await api.post('/api/workspaces', { headers, data: { business: { businessName: 'Fictional chat workspace', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } } });
  expect(response.status()).toBe(201);
  return (await response.json()).workspaceId as string;
}
const input = (workspaceId: string, message = 'fixture:slow'): ChatTurnRequest => ({ workspaceId, clientTurnId: randomUUID(), surfaceKey: 'home', message });
const events = (text: string): ChatStreamEvent[] => text.split('\n\n').filter(frame => frame.startsWith('data:')).map(frame => JSON.parse(frame.slice(5)));
type StreamWindow = Window & { chatEvents: ChatStreamEvent[]; chatDone: boolean; chatError?: string; chatAbort: AbortController };
async function start(page: Page, data: ChatTurnRequest) {
  await page.evaluate(data => {
    const state = window as unknown as StreamWindow;
    state.chatEvents = []; state.chatDone = false; state.chatError = undefined; state.chatAbort = new AbortController();
    void (async () => {
      try {
        const response = await fetch('/api/chat/turns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: state.chatAbort.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const reader = response.body!.getReader(); const decoder = new TextDecoder(); let buffer = '';
        while (true) {
          const chunk = await reader.read(); if (chunk.done) break;
          buffer += decoder.decode(chunk.value, { stream: true });
          let end: number;
          while ((end = buffer.indexOf('\n\n')) >= 0) { state.chatEvents.push(JSON.parse(buffer.slice(5, end))); buffer = buffer.slice(end + 2); }
        }
      } catch (error) { state.chatError = String(error); }
      finally { state.chatDone = true; }
    })();
  }, data);
  await page.waitForFunction(() => (window as unknown as StreamWindow).chatEvents.length >= 2);
  return page.evaluate(() => (window as unknown as StreamWindow).chatEvents[0] as Extract<ChatStreamEvent, { type: 'turn.accepted' }>);
}
async function finished(page: Page) {
  await page.waitForFunction(() => (window as unknown as StreamWindow).chatDone);
  expect(await page.evaluate(() => (window as unknown as StreamWindow).chatError)).toBeUndefined();
  return page.evaluate(() => (window as unknown as StreamWindow).chatEvents);
}
test.beforeEach(async () => { await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE'); });
test.afterAll(async () => { await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE'); await db.destroy(); });

test('accepts durably, streams before completion, persists history and reconciles retries without regeneration', async ({ page }) => {
  const api = page.context().request; await account(api); const workspaceId = await workspace(api);
  await page.goto(`/home?workspace=${workspaceId}`);
  const request = input(workspaceId);
  const accepted = await start(page, request);
  expect((await db('chatMessages').where({ turnId: accepted.turnId, role: 'user' }).first()).text).toBe(request.message);
  expect(await page.evaluate(() => (window as unknown as StreamWindow).chatEvents[1])).toMatchObject({ type: 'status', status: 'thinking' });
  await page.waitForFunction(() => (window as unknown as StreamWindow).chatEvents.some(event => event.type === 'message.delta'));
  expect(await page.evaluate(() => (window as unknown as StreamWindow).chatDone)).toBe(false);
  const result = await finished(page);
  expect(result.at(-1)?.type).toBe('turn.completed');
  expect(result.map(event => event.sequence)).toEqual(result.map((_, index) => index + 1));
  expect((await db('chatTurns').where({ id: accepted.turnId }).first()).state).toBe('completed');
  const history = await api.get(`/api/chat/threads?workspace=${workspaceId}&thread=${accepted.threadId}`);
  expect(history.headers()['cache-control']).toBe('no-store');
  expect((await history.json()).messages.find((message: {role:string}) => message.role === 'assistant').text).toContain('🌍');
  const replay = await api.post('/api/chat/turns', { headers, data: request });
  expect(await replay.json()).toMatchObject({ replay: true, turnId: accepted.turnId, state: 'completed' });
  expect((await db('chatTurns').where({ workspaceId })).length).toBe(1);
  expect((await api.post('/api/chat/turns', { headers, data: { ...request, message: 'Changed replay' } })).status()).toBe(409);
});

test('denies unsigned, forged, cross-user and cross-workspace access including history, cancel and delete', async ({ page, request }) => {
  const api = page.context().request; await account(api); const workspaceId = await workspace(api);
  expect((await request.post('/api/chat/turns', { headers, data: input(workspaceId) })).status()).toBe(401);
  expect((await api.post('/api/chat/turns', { data: input(workspaceId) })).status()).toBe(403);
  expect((await api.post('/api/chat/turns', { headers, data: { ...input(workspaceId), role: 'owner', tools: ['create_campaign'] } })).status()).toBe(422);
  expect((await api.post('/api/chat/turns', { headers, data: 'x'.repeat(16001) })).status()).toBe(413);
  expect((await api.post('/api/chat/turns', { headers: { ...headers, 'Content-Type': 'application/json' }, data: Buffer.from('{bad') })).status()).toBe(400);
  const response = await api.post('/api/chat/turns', { headers, data: input(workspaceId, 'Hello') });
  expect(response.headers()['content-type']).toContain('text/event-stream');
  expect(response.headers()['cache-control']).toContain('no-transform');
  const accepted = events(await response.text())[0] as Extract<ChatStreamEvent, {type:'turn.accepted'}>;
  const teammateId = await account(request, 'chat-teammate@example.test');
  await db('workspaceMemberships').insert({ workspaceId, userId: teammateId, role: 'office' });
  expect((await request.get(`/api/chat/threads?workspace=${workspaceId}&thread=${accepted.threadId}`)).status()).toBe(403);
  expect((await request.post('/api/chat/cancel', { headers, data: { workspaceId, turnId: accepted.turnId } })).status()).toBe(403);
  expect((await request.delete('/api/chat/threads', { headers, data: { workspaceId, threadId: accepted.threadId } })).status()).toBe(403);
  const otherWorkspace = await workspace(request);
  expect((await request.get(`/api/chat/threads?workspace=${otherWorkspace}&thread=${accepted.threadId}`)).status()).toBe(403);
  expect((await request.post('/api/chat/turns', { headers, data: { ...input(otherWorkspace), threadId: accepted.threadId } })).status()).toBe(403);
  expect((await api.get(`/api/chat/threads?workspace=${otherWorkspace}`)).status()).toBe(403);
});

test('cancels persistently, bounds concurrent turns, preserves partial text and deletes owned transcripts', async ({ page }) => {
  const api = page.context().request; await account(api); const workspaceId = await workspace(api);
  await page.goto(`/home?workspace=${workspaceId}`);
  const request = input(workspaceId); const accepted = await start(page, request);
  expect(await (await api.post('/api/chat/turns', { headers, data: request })).json()).toMatchObject({ replay: true, state: 'accepted' });
  expect((await api.post('/api/chat/turns', { headers, data: input(workspaceId) })).status()).toBe(409);
  expect((await api.delete('/api/chat/threads', { headers, data: { workspaceId, threadId: accepted.threadId } })).status()).toBe(409);
  await page.waitForFunction(() => (window as unknown as StreamWindow).chatEvents.some(event => event.type === 'message.delta'));
  expect((await api.post('/api/chat/cancel', { headers, data: { workspaceId, turnId: accepted.turnId } })).status()).toBe(200);
  const result = await finished(page); expect(result.at(-1)?.type).toBe('turn.cancelled');
  const history = await (await api.get(`/api/chat/threads?workspace=${workspaceId}&thread=${accepted.threadId}`)).json();
  expect(history.turns[0].state).toBe('cancelled');
  expect(history.messages.find((message: {role:string}) => message.role === 'assistant').text).toBe('Fictional test response. ');
  expect((await api.post('/api/chat/cancel', { headers, data: { workspaceId, turnId: accepted.turnId } })).status()).toBe(200);
  expect((await api.delete('/api/chat/threads', { headers, data: { workspaceId, threadId: accepted.threadId } })).status()).toBe(200);
  expect(await db('chatMessages').where({ turnId: accepted.turnId })).toHaveLength(0);
});

test('provider failure preserves partial output and redacts raw errors; expired leases recover as interrupted', async ({ page }) => {
  const api = page.context().request; const userId = await account(api); const workspaceId = await workspace(api);
  const response = await api.post('/api/chat/turns', { headers, data: input(workspaceId, 'fixture:fail') });
  const raw = await response.text(); expect(raw).not.toContain('Private provider');
  const result = events(raw); expect(result.at(-1)).toMatchObject({ type: 'turn.failed', code: 'provider_unavailable' });
  const accepted = result[0] as Extract<ChatStreamEvent, { type:'turn.accepted' }>;
  expect((await db('chatTurns').where({ id: accepted.turnId }).first()).state).toBe('failed');
  await db('chatTurns').where({ id: accepted.turnId }).update({ state: 'running', leaseUntil: new Date(Date.now() - 1000), finishedAt: null });
  const history = await (await api.get(`/api/chat/threads?workspace=${workspaceId}&thread=${accepted.threadId}`)).json();
  expect(history.turns[0].state).toBe('interrupted');
  expect(history.messages.find((message: {role:string}) => message.role === 'assistant').text).toBe('Fictional test response. ');
  // Simulate a rate window without making ten provider requests.
  await db('chatTurns').insert(Array.from({ length: 9 }, () => ({ id: randomUUID(), threadId: accepted.threadId, workspaceId, userId,
    clientTurnId: randomUUID(), requestHash: 'fixture', surfaceKey: 'home', state: 'completed', leaseUntil: new Date() })));
  expect((await api.post('/api/chat/turns', { headers, data: input(workspaceId) })).status()).toBe(429);
});

test('current role grants and session revocation stop data release and block retained history', async ({ page, browser }) => {
  const ownerAPI = page.context().request; const ownerId = await account(ownerAPI); const workspaceId = await workspace(ownerAPI);
  const officeContext = await browser.newContext();
  try {
    const api = officeContext.request;
    const officeId = await account(api, 'office-chat@example.test');
    await db('workspaceMemberships').insert({ workspaceId, userId: officeId, role: 'office' });
    await db('workspaceRolePolicies').where({ workspaceId, role: 'office', permission: 'assistant.use' }).delete();
    expect((await api.post('/api/chat/turns', { headers, data: input(workspaceId) })).status()).toBe(403);
    await db('workspaceRolePolicies').insert({ workspaceId, role: 'office', permission: 'assistant.use', scope: 'enabled' });
    const officePage = await officeContext.newPage();
    await officePage.goto(`/home?workspace=${workspaceId}`);
    const accepted = await start(officePage, input(workspaceId));
    await db('workspaceRolePolicies').where({ workspaceId, role: 'office', permission: 'assistant.use' }).delete();
    expect((await finished(officePage)).at(-1)).toMatchObject({ type: 'turn.failed', code: 'access_denied' });
    expect((await db('chatMessages').where({ turnId: accepted.turnId, role: 'assistant' }).first()).text).toBe('');
    expect((await api.get(`/api/chat/threads?workspace=${workspaceId}&thread=${accepted.threadId}`)).status()).toBe(403);
    await page.goto(`/home?workspace=${workspaceId}`);
    const second = await start(page, input(workspaceId));
    await db('sessions').where({ userId: ownerId }).delete();
    expect((await finished(page)).at(-1)).toMatchObject({ type: 'turn.failed', code: 'access_denied' });
    expect((await db('chatMessages').where({ turnId: second.turnId, role: 'assistant' }).first()).text).toBe('');
  } finally { await officeContext.close(); }
});

test('browser disconnect cancels the persisted run and does not release later output', async ({ page }) => {
  const api = page.context().request; await account(api); const workspaceId = await workspace(api);
  await page.goto(`/home?workspace=${workspaceId}`);
  const accepted = await start(page, input(workspaceId));
  await page.evaluate(() => (window as unknown as StreamWindow).chatAbort.abort());
  await expect.poll(async () => (await db('chatTurns').where({ id: accepted.turnId }).first()).state).toBe('cancelled');
  expect((await db('chatMessages').where({ turnId: accepted.turnId, role: 'assistant' }).first()).text).toBe('');
});

test('quiet generation emits heartbeat comments and still ends with an explicit persisted terminal event', async ({ page }) => {
  const api = page.context().request; await account(api); const workspaceId = await workspace(api);
  const response = await api.post('/api/chat/turns', { headers, data: input(workspaceId, 'fixture:heartbeat') });
  const text = await response.text();
  expect(text).toContain(': heartbeat\n\n');
  const result = events(text);
  expect(result[1]).toMatchObject({ type: 'status', status: 'thinking' });
  expect(result.at(-1)?.type).toBe('turn.completed');
  expect((await db('chatTurns').where({ id: result[0].turnId }).first()).state).toBe('completed');
});
