import { test, expect, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase } from '@salesmora/data';
import type { ChatStreamEvent } from '@salesmora/contracts';
import { readChatStream } from '../src/features/assistant/chat-stream';
test.skip(process.env.SALESMORA_E2E_ORIGIN !== 'http://127.0.0.1:3003', 'Opt-in Docker proxy rehearsal');
const target = process.env.TEST_DATABASE_URL;
if (!target || !new URL(target).pathname.endsWith('_test') || target === process.env.DATABASE_URL) throw Error('Proxy checks require isolated test database');
const db = createDatabase(target);
const headers = { Origin: 'http://127.0.0.1:3003' };
async function setup(page: Page) {
  const api = page.context().request;
  expect((await api.post('/api/auth/sign-up/email', { headers, data: { name: 'Fictional proxy tester', email: 'proxy@example.test', password: 'Fictional-proxy-password-42!', termsAccepted: true } })).status()).toBe(200);
  const response = await api.post('/api/workspaces', { headers, data: { business: { businessName: 'Fictional proxy workspace', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } } });
  expect(response.status()).toBe(201); const workspaceId = (await response.json()).workspaceId as string;
  await page.goto(`/home?workspace=${workspaceId}`); return workspaceId;
}
const input = (workspaceId: string, message: string) => ({ workspaceId, clientTurnId: randomUUID(), surfaceKey: 'home', message });
type State = Window & { proxyEvents: ChatStreamEvent[]; proxyDone: boolean; proxyError?: string; proxyHeartbeat: boolean };
async function stream(page: Page, path: string, body: ReturnType<typeof input>) {
  await page.evaluate(({ path, body }) => {
    const state = window as unknown as State;
    state.proxyEvents = []; state.proxyDone = false; state.proxyHeartbeat = false; state.proxyError = undefined;
    void (async () => {
      try {
        const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!response.ok) throw Error(`HTTP ${response.status}`);
        const reader = response.body!.getReader(); const decoder = new TextDecoder(); let buffer = '';
        while (true) {
          const chunk = await reader.read(); if (chunk.done) break;
          buffer += decoder.decode(chunk.value, { stream: true }); let end;
          while ((end = buffer.indexOf('\n\n')) >= 0) {
            const frame = buffer.slice(0, end); buffer = buffer.slice(end + 2);
            if (frame.startsWith(': heartbeat')) state.proxyHeartbeat = true;
            if (frame.startsWith('data:')) state.proxyEvents.push(JSON.parse(frame.slice(5)));
          }
        }
      } catch (error) { state.proxyError = String(error); }
      finally { state.proxyDone = true; }
    })();
  }, { path, body });
}
test.beforeEach(async () => { await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE'); });
test.afterAll(async () => { await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE'); await db.destroy(); });
test('Docker proxy delivers Thinking before generation; negative control detects buffering', async ({ page }) => {
  const workspace = await setup(page);
  await stream(page, '/api/chat/turns', input(workspace, 'fixture:slow'));
  await page.waitForFunction(() => (window as unknown as State).proxyEvents.length >= 2);
  const good = await page.evaluate(() => ({ events: (window as unknown as State).proxyEvents, done: (window as unknown as State).proxyDone }));
  expect(good.events[1]).toMatchObject({ type: 'status', status: 'thinking' }); expect(good.done).toBe(false);
  expect((await db('chatTurns').where({ id: good.events[0].turnId }).first()).state).toBe('accepted');
  await page.waitForFunction(() => (window as unknown as State).proxyDone);
  await stream(page, '/__proxy-buffered/api/chat/turns', input(workspace, 'fixture:slow'));
  await page.waitForFunction(() => (window as unknown as State).proxyEvents.length > 0 || (window as unknown as State).proxyDone);
  expect(await page.evaluate(() => (window as unknown as State).proxyError)).toBeUndefined();
  const buffered = await page.evaluate(() => (window as unknown as State).proxyEvents);
  expect(buffered.at(-1)?.type).toBe('turn.completed');
  expect((await db('chatTurns').where({ id: buffered[0].turnId }).first()).state).toBe('completed');
});
test('quiet provider heartbeat reaches browser before first delta', async ({ page }) => {
  const workspace = await setup(page);
  await stream(page, '/api/chat/turns', input(workspace, 'fixture:heartbeat'));
  await page.waitForFunction(() => (window as unknown as State).proxyHeartbeat);
  expect(await page.evaluate(() => (window as unknown as State).proxyEvents.some(event => event.type === 'message.delta'))).toBe(false);
  await page.waitForFunction(() => (window as unknown as State).proxyDone);
  expect(await page.evaluate(() => (window as unknown as State).proxyEvents.at(-1)?.type)).toBe('turn.completed');
});
test('proxy idle timeout interrupts transport, cancels durable run, and permits explicit retry', async ({ page }) => {
  const workspace = await setup(page); const data = input(workspace, 'fixture:heartbeat');
  await stream(page, '/__proxy-timeout/api/chat/turns', data);
  await page.waitForFunction(() => (window as unknown as State).proxyDone);
  const state = await page.evaluate(() => ({ events: (window as unknown as State).proxyEvents, error: (window as unknown as State).proxyError }));
  expect(state.events[0].type).toBe('turn.accepted'); expect(state.events.some(event => event.type === 'turn.completed')).toBe(false); expect(state.error).toBeTruthy();
  await expect.poll(async () => (await db('chatTurns').where({ id: state.events[0].turnId }).first()).state).toBe('cancelled');
  const api = page.context().request;
  const replay = await api.post('/api/chat/turns', { headers, data }); expect(await replay.json()).toMatchObject({ replay: true, state: 'cancelled' });
  const response = await api.post('/api/chat/turns', { headers, data: input(workspace, 'Hello again') }); expect(await response.text()).toContain('turn.completed');
  expect(await db('chatTurns').where({ workspaceId: workspace })).toHaveLength(2);
  const truncated = new ReadableStream<Uint8Array>({ start(controller) { for (const event of state.events) controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`)); controller.close(); } });
  await expect((async () => { for await (const event of readChatStream(truncated)) void event; })()).rejects.toThrow('Interrupted chat stream');
});
test('application 90-second deadline crosses proxy as explicit timeout and allows recovery', async ({ page }) => {
  test.setTimeout(115_000);
  const workspace = await setup(page);
  await stream(page, '/api/chat/turns', input(workspace, 'fixture:timeout'));
  await page.waitForFunction(() => (window as unknown as State).proxyDone, undefined, { timeout: 100_000 }).catch(async error => {
    console.log('Proxy timeout diagnostics', await page.evaluate(() => ({ done: (window as unknown as State).proxyDone, error: (window as unknown as State).proxyError, types: (window as unknown as State).proxyEvents?.map(event => event.type) })));
    console.log('Durable state', (await db('chatTurns').where({ workspaceId: workspace }).select('state')));
    throw error;
  });
  const state = await page.evaluate(() => ({ events: (window as unknown as State).proxyEvents, error: (window as unknown as State).proxyError }));
  expect(state.error).toBeUndefined(); expect(state.events.at(-1)).toMatchObject({ type: 'turn.failed', code: 'timeout' });
  expect((await db('chatTurns').where({ id: state.events[0].turnId }).first()).state).toBe('failed');
  const response = await page.context().request.post('/api/chat/turns', { headers, data: input(workspace, 'Hello again') }); expect(await response.text()).toContain('turn.completed');
});

test('proxy timeout shows incomplete UI and explicit retry recovers without duplicate submission', async ({ page }) => {
  const workspace = await setup(page);
  await page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click();
  await page.route('**/api/chat/turns', route => route.continue({ url: 'http://127.0.0.1:3003/__proxy-timeout/api/chat/turns' }), { times: 1 });
  await page.getByRole('textbox', { name: 'Ask the SalesMora assistant', exact: true }).fill('fixture:heartbeat');
  await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Thinking…' })).toBeVisible();
  await expect(page.getByRole('log')).toContainText('Incomplete response');
  await expect(page.getByRole('status').filter({ hasText: 'The response was interrupted.' })).toBeVisible();
  await expect.poll(async () => (await db('chatTurns').where({ workspaceId: workspace }).first()).state).toBe('cancelled');
  await page.getByRole('button', { name: 'Retry response' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Response complete.' })).toBeVisible({ timeout: 15_000 });
  expect(await db('chatTurns').where({ workspaceId: workspace })).toHaveLength(2);
  expect(await db('leads').where({ workspaceId: workspace })).toHaveLength(0);
});
