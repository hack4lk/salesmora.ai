import { test, expect, request as requests, type APIRequestContext } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { createDatabase, createCaptureDraft, saveCaptureDraft, publishCaptureDraft, readCapturePublicationReview } from '@salesmora/data';
import { permissionIds, chatStreamEventSchema, captureChatTicketSchema, type CaptureChatTicket } from '@salesmora/contracts';
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') || !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw Error('An isolated local test database is required.');
const db = createDatabase(connection), origin = 'http://127.0.0.1:3026', headers = { Origin: origin };
const clients: Record<string, APIRequestContext> = {}, users: Record<string, string> = {};
let workspaceId: string, foreignWorkspace: string, sourceId: string, foreignSource: string;
const list = { operation: 'sources', sourceId: null, search: null, type: null, status: null, archived: false, usePageFilters: false, page: 1, limit: 20 };
const query = (operation: string, id: string | null = sourceId) => ({ ...list, operation, sourceId: id, limit: 1 });
async function turn(args: unknown, extra: Record<string, unknown> = {}, client = clients.owner) {
  const response = await client.post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId: randomUUID(), surfaceKey: 'home', message: `fixture:capture:${JSON.stringify(args)}`, ...extra } });
  expect(response.status()).toBe(200);
  return (await response.text()).split('\n\n').filter(frame => frame.startsWith('data:')).map(frame => chatStreamEventSchema.parse(JSON.parse(frame.slice(5))));
}
function ticket(events: Awaited<ReturnType<typeof turn>>) { const result = events.find(event => event.type === 'capture.result'); if (result?.type !== 'capture.result') throw Error(JSON.stringify(events)); return result.result; }
function params(value: CaptureChatTicket) { return new URLSearchParams({ workspaceId: value.workspaceId, turnId: value.turnId, resultId: value.resultId, snapshotHash: value.snapshotHash }); }
test.setTimeout(180000);
test.use({ actionTimeout: 30000 });
test.beforeAll(async () => {
  test.setTimeout(180000);
  await db('rateLimits').where('key', 'like', '%/sign-up/email%').delete();
  for (const role of ['owner', 'field', 'foreign']) {
    clients[role] = await requests.newContext({ baseURL: origin }); const email = `capture-chat-${randomUUID()}@example.test`;
    expect((await clients[role].post('/api/auth/sign-up/email', { headers, data: { name: `Capture ${role}`, email, password: 'Fictional-capture-chat-42!', termsAccepted: true } })).status()).toBe(200);
    users[role] = (await db('users').where({ email }).first()).id;
  }
  for (const role of ['owner', 'foreign']) {
    const response = await clients[role].post('/api/workspaces', { headers, data: { business: { businessName: `Capture ${role} workspace`, businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } } }); expect(response.status()).toBe(201);
    const id = (await response.json()).workspaceId; if (role === 'owner') workspaceId = id; else foreignWorkspace = id;
  }
  await db('workspaceMemberships').insert({ workspaceId, userId: users.field, role: 'field' });
  sourceId = (await createCaptureDraft(db, { workspaceId, userId: users.owner }, permissionIds, { workspaceId, requestId: randomUUID(), name: 'Fictional website requests', configuration: { schemaVersion: 1, type: 'website' } })).sourceId;
  await db('workspaceMemberships').insert({ workspaceId, userId: users.foreign, role: 'admin' });
  foreignSource = (await createCaptureDraft(db, { workspaceId: foreignWorkspace, userId: users.foreign }, permissionIds, { workspaceId: foreignWorkspace, requestId: randomUUID(), name: 'PRIVATE FOREIGN SOURCE', configuration: { schemaVersion: 1, type: 'website' } })).sourceId;
});
test.beforeEach(async () => { await db('chatTurns').where({ workspaceId }).whereNotIn('state', ['accepted', 'running']).update({ createdAt: new Date(Date.now() - 120000) }); });
test.afterAll(async () => { await Promise.all(Object.values(clients).map(client => client.dispose())); await db.destroy(); });
test('streams typed reads, reloads private saved history and authorizes metadata-only navigation', async () => {
  const events = await turn(list); expect(events[1]).toMatchObject({ type: 'status', status: 'thinking' }); expect(events.at(-1)?.type).toBe('turn.completed');
  const value = ticket(events), response = await clients.owner.get(`/api/chat/lead-capture?${params(value)}`); expect(response.status()).toBe(200);
  const result = (await response.json()).result; expect(result.rows).toHaveLength(1); expect(result.total).toBe(1); expect(JSON.stringify(events)).not.toContain('PRIVATE FOREIGN SOURCE');
  const accepted = events[0]; if (accepted.type !== 'turn.accepted') throw Error('Missing turn');
  const stored = await db('chatTurns').where({ id: value.turnId }).first(); const history = await clients.owner.get(`/api/chat/threads?workspace=${workspaceId}&thread=${stored.threadId}`); expect(history.status()).toBe(200); expect((await history.json()).turns.find((item: { id: string }) => item.id === value.turnId).captureResult).toEqual(value);
  const binding = Object.fromEntries(params(value));
  expect((await clients.owner.post('/api/chat/lead-capture', { headers, data: { ...binding, sourceId } })).status()).toBe(200);
  expect((await clients.owner.post('/api/chat/lead-capture', { headers, data: { ...binding, sourceId: foreignSource } })).status()).toBe(403);
  expect((await clients.owner.post('/api/chat/lead-capture', { headers: { Origin: 'https://invalid.example' }, data: { ...binding, sourceId } })).status()).toBe(403);
  expect((await clients.foreign.get(`/api/chat/lead-capture?${params(value)}`)).status()).toBe(403);
  expect((await clients.field.get(`/api/chat/lead-capture?${params(value)}`)).status()).toBe(403);
  expect((await clients.owner.get(`/api/chat/lead-capture?${params({ ...value, snapshotHash: 'b'.repeat(64) })}`)).status()).toBe(403);
  const replay = await clients.owner.post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId: stored.clientTurnId, surfaceKey: 'home', message: `fixture:capture:${JSON.stringify(list)}` } }); expect(replay.status()).toBe(200); expect((await replay.json()).replay).toBe(true);
});
test('selected source and explicit clearing never borrow a source from prior conversation', async () => {
  const selected = await turn(query('source_details', null), { surfaceKey: 'lead_capture.detail', captureContext: { surface: 'lead_capture.detail', sourceId } }); expect(selected.at(-1)?.type).toBe('turn.completed');
  const value = ticket(selected); expect((await (await clients.owner.get(`/api/chat/lead-capture?${params(value)}`)).json()).result.detail.source.id).toBe(sourceId);
  const cleared = await turn(query('source_details', null), { surfaceKey: 'lead_capture.detail' }); expect(cleared.at(-1)?.type).toBe('turn.completed'); expect(cleared.some(event => event.type === 'capture.result')).toBe(false);
  const denied = await turn(query('source_details', foreignSource)); expect(denied.at(-1)?.type).toBe('turn.failed'); expect(JSON.stringify(denied)).not.toContain('PRIVATE FOREIGN SOURCE');
});
test('normal assistant modal works on source list/setup/detail with current page context and no source writes', async ({ browser }) => {
  const context = await browser.newContext({ storageState: await clients.owner.storageState(), viewport: { width: 320, height: 1000 } }), page = await context.newPage();
  try {
    await page.goto(`/lead-capture?workspace=${workspaceId}`);
    await page.getByRole('button', { name: 'SalesMora assistant How can I help?' }).click();
    await page.getByRole('textbox', { name: 'Ask the SalesMora assistant' }).fill(`fixture:capture:${JSON.stringify(list)}`); await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
    await expect(page.getByText('Showing 1 of 1 matching sources.')).toBeVisible({ timeout: 60000 });
    await page.getByRole('log', { name: 'Conversation with the SalesMora assistant' }).getByRole('button', { name: 'Open capture source · Fictional website requests' }).click(); await expect(page).toHaveURL(`${origin}/lead-capture/${sourceId}?workspace=${workspaceId}`, { timeout: 60000 });
    await page.goto(`/lead-capture/${sourceId}/setup?workspace=${workspaceId}`);
    await page.getByRole('button', { name: 'SalesMora assistant How can I help?' }).click();
    await page.getByRole('textbox', { name: 'Ask the SalesMora assistant' }).fill(`fixture:capture:${JSON.stringify(query('source_summary', null))}`); await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Open record', exact: true })).toBeVisible({ timeout: 60000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await page.screenshot({ path: fileURLToPath(new URL('../../../.local/releases/capture-assistant-read-20261102/authenticated-read-320.png', import.meta.url)), fullPage: false });
    expect((await db('captureSources').where({ id: sourceId }).first()).version).toBe(1);
  } finally { await context.close(); }
});
test('installation and readiness remain grounded with delivery disabled; Field cannot invoke capture reads', async () => {
  const install = ticket(await turn(query('installation'))), review = ticket(await turn(query('publication_review')));
  expect((await (await clients.owner.get(`/api/chat/lead-capture?${params(install)}`)).json()).result.installation).toBeNull();
  expect((await (await clients.owner.get(`/api/chat/lead-capture?${params(review)}`)).json()).result.review.ready).toBe(false);
  const field = await turn(list, {}, clients.field); expect(field.at(-1)?.type).toBe('turn.failed'); expect(field.some(event => event.type === 'capture.result')).toBe(false);
  expect(Number((await db('capturePublications').count('* as n').first())?.n)).toBe(0); expect(Number((await db('leads').count('* as n').first())?.n)).toBe(0);
});
test('changed source evidence hides old cards/history and blocks contaminated follow-up generation', async () => {
  const value = captureChatTicketSchema.parse(ticket(await turn(query('source_summary')))); const stored = await db('chatTurns').where({ id: value.turnId }).first();
  await saveCaptureDraft(db, { workspaceId, userId: users.owner }, permissionIds, { workspaceId, sourceId, requestId: randomUUID(), expectedVersion: 1, expectedDraftVersion: 1, name: 'Updated fictional source', configuration: { schemaVersion: 1, type: 'website' } });
  expect((await clients.owner.get(`/api/chat/lead-capture?${params(value)}`)).status()).toBe(403);
  const history = await (await clients.owner.get(`/api/chat/threads?workspace=${workspaceId}&thread=${stored.threadId}`)).json(); expect(history.turns.find((item: { id: string }) => item.id === value.turnId).captureResult).toBeUndefined(); expect(history.messages.filter((item: { role: string }) => item.role === 'assistant').every((item: { text: string }) => !item.text.includes('Fictional website requests'))).toBe(true);
  const fresh = await turn(list, { threadId: stored.threadId }); expect(fresh.at(-1)?.type).toBe('turn.completed');
  const freshTicket = ticket(fresh); expect((await clients.owner.get(`/api/chat/lead-capture?${params(freshTicket)}`)).status()).toBe(200);
});

test('source changes during generation stop streaming before a stale result can be emitted', async () => {
  const pending = turn(query('source_summary'), { message: `fixture:capture-slow:${JSON.stringify(query('source_summary'))}` });
  await expect.poll(async () => !!await db('chatTurns').where({ workspaceId, state: 'running' }).whereNotNull('captureResult').first('id'), { timeout: 15000, intervals: [20, 50, 100] }).toBe(true);
  const source = await db('captureSources').where({ workspaceId, id: sourceId }).first(), draft = await db('captureSourceDrafts').where({ workspaceId, sourceId }).first();
  await saveCaptureDraft(db, { workspaceId, userId: users.owner }, permissionIds, { workspaceId, sourceId, requestId: randomUUID(), expectedVersion: source.version, expectedDraftVersion: draft.version, name: 'Changed during generation', configuration: draft.configuration });
  const events = await pending;
  expect(events.at(-1)?.type).toBe('turn.failed');
  expect(events.some(event => event.type === 'capture.result')).toBe(false);
  expect(JSON.stringify(events)).not.toContain('Updated fictional source');
});

const setupInput = { operation: 'create_source', sourceId: null, name: null, sourceType: null, fields: null, contactRequired: null, workflow: null, brief: null, content: null, rules: null, mappings: null, findings: null };
async function setupTurn(input: unknown, extra: Record<string, unknown> = {}) { return turn({}, { message: `fixture:capture-setup:${JSON.stringify(input)}`, ...extra }); }
function setupTicket(events: Awaited<ReturnType<typeof turn>>) { const event = events.find(event => event.type === 'capture.setup'); if (event?.type !== 'capture.setup') throw Error(JSON.stringify(events)); return event.result; }
function setupReference(ticket: ReturnType<typeof setupTicket>) { return { workspaceId, proposalId: ticket.proposalId, inputHash: ticket.inputHash }; }
test('durable setup confirmation authenticates the author and retries without creating duplicate sources', async () => {
  const before = Number((await db('captureSources').where({ workspaceId }).count('* as n').first())!.n);
  const events = await setupTurn({ ...setupInput, name: 'Fictional assistant-created form', sourceType: 'website' }); expect(events.at(-1)?.type).toBe('turn.completed');
  const value = setupTicket(events), binding = setupReference(value), query = new URLSearchParams(binding);
  expect(Number((await db('captureSources').where({ workspaceId }).count('* as n').first())!.n)).toBe(before);
  expect((await clients.foreign.get(`/api/chat/lead-capture/setup?${query}`)).status()).toBe(403);
  expect((await clients.owner.post('/api/chat/lead-capture/setup', { headers: { Origin: 'https://invalid.example' }, data: { ...binding, decision: 'confirm' } })).status()).toBe(403);
  const results = await Promise.all([1, 2].map(() => clients.owner.post('/api/chat/lead-capture/setup', { headers, data: { ...binding, decision: 'confirm' } })));
  expect(results.map(result => result.status())).toEqual([200, 200]); const first = await results[0].json(); expect(await results[1].json()).toEqual(first); expect(first.view.receipt.kind).toBe('saved');
  expect(Number((await db('captureSources').where({ workspaceId }).count('* as n').first())!.n)).toBe(before + 1);
  const proposal = await db('chatCaptureSetupProposals').where({ id: value.proposalId }).first();
  const history = await (await clients.owner.get(`/api/chat/threads?workspace=${workspaceId}&thread=${proposal.threadId}`)).json(); expect(history.turns.find((item: { id: string }) => item.id === proposal.turnId).captureSetup.state).toBe('confirmed');
  expect(Number((await db('capturePublications').count('* as n').first())!.n)).toBe(0);
});
test('mobile wizard applies an exact reviewed suggestion without saving; normal Save persists it', async ({ browser }) => {
  const context = await browser.newContext({ storageState: await clients.owner.storageState(), viewport: { width: 320, height: 1000 } }), page = await context.newPage();
  try {
    const current = await db('captureSources').where({ id: sourceId }).first(), before = await db('captureSourceDrafts').where({ id: current.draftId }).first();
    const { initialCaptureSetupConfiguration } = await import('@salesmora/contracts');
    const config = initialCaptureSetupConfiguration('website', { businessName: 'Fictional', businessEmail: '', businessPhone: '' });
    const input = { ...setupInput, operation: 'suggest_website_fields', fields: config.fields!.map(field => field.key === 'details' ? { ...field, label: 'Describe the repair' } : field), contactRequired: true };
    await page.goto(`/lead-capture/${sourceId}/setup?workspace=${workspaceId}&step=intake&panel=brief`);
    await page.getByRole('textbox', { name: 'What work do you want more of?' }).fill('Repair requests for taps.');
    await page.getByRole('button', { name: 'Suggest fields', exact: true }).click();
    const composer = page.getByRole('textbox', { name: 'Ask the SalesMora assistant' }); await expect(composer).toBeVisible();
    await composer.fill(`fixture:capture-setup:${JSON.stringify(input)}`); await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
    const log = page.getByRole('log', { name: 'Conversation with the SalesMora assistant' });
    await log.getByRole('button', { name: 'Review proposed change' }).last().click({ timeout: 60000 });
    await log.getByRole('button', { name: 'Apply suggested fields' }).click();
    await expect(log.getByText('Suggestions applied to the unsaved setup. Save separately to keep them.')).toBeVisible({ timeout: 60000 });
    expect((await db('captureSourceDrafts').where({ id: before.id }).first()).version).toBe(before.version);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Form fields', exact: true }).click();
    await expect(page.locator('input[value="Describe the repair"]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await page.screenshot({ path: fileURLToPath(new URL('../../../.local/releases/capture-assistant-read-20261102/confirmed-setup-320.png', import.meta.url)), fullPage: false });
    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    await expect.poll(async () => (await db('captureSourceDrafts').where({ id: before.id }).first()).version, { timeout: 60000 }).toBe(before.version + 1);
    expect((await db('captureSourceDrafts').where({ id: before.id }).first()).configuration.fields.some((field: { label: string }) => field.label === 'Describe the repair')).toBe(true);
  } finally { await context.close(); }
});

test('Gmail wizard reviews and retains a pasted sample without a mailbox connection or publication', async ({ browser }) => {
  await db('workspaces').where({ id: workspaceId }).update({ planOverride: 'standard', planOverrideEndsAt: new Date(Date.now() + 86400000), planOverrideReason: 'Disposable Gmail setup fixture', planOverrideId: randomUUID() });
  const saved = await createCaptureDraft(db, { workspaceId, userId: users.owner }, permissionIds, { workspaceId, requestId: randomUUID(), name: 'Fictional Gmail sample', configuration: { schemaVersion: 1, type: 'gmail' } });
  const { initialCaptureSetupConfiguration } = await import('@salesmora/contracts');
  const fields = initialCaptureSetupConfiguration('website', { businessName: 'Fictional', businessEmail: '', businessPhone: '' }).fields!.filter(field => ['name', 'email', 'service'].includes(field.key));
  const body = 'Name: Jordan Example\nEmail: jordan@example.test\nService: Tap repair';
  const findings = fields.map(field => { const value = field.key === 'name' ? 'Jordan Example' : field.key === 'email' ? 'jordan@example.test' : 'Tap repair'; return { id: field.id, fieldId: field.id, included: true, sampleValue: value, suggestedValue: value, confidence: 'found', required: field.required, instruction: `Read ${field.label}`, evidence: { source: 'body', text: body.split('\n').find(line => line.includes(value))! } }; });
  const input = { ...setupInput, operation: 'extract_sample', fields, contactRequired: true, rules: { phrases: ['Repair request'], location: 'subject', mode: 'all' }, mappings: findings.map(row => ({ fieldId: row.fieldId, instruction: row.instruction })), findings };
  const context = await browser.newContext({ storageState: await clients.owner.storageState(), viewport: { width: 390, height: 1000 } }), page = await context.newPage();
  try {
    await page.goto(`/lead-capture/${saved.sourceId}/setup?workspace=${workspaceId}&step=intake&panel=fields`);
    await page.getByRole('textbox', { name: /^Subject/ }).fill('Repair request'); await page.getByRole('textbox', { name: 'Email body' }).fill(body);
    await expect(page.getByRole('button', { name: 'Extract fields', exact: true })).toBeEnabled({ timeout: 60000 }); await page.getByRole('button', { name: 'Extract fields', exact: true }).click();
    await page.getByRole('textbox', { name: 'Ask the SalesMora assistant' }).fill(`fixture:capture-setup:${JSON.stringify(input)}`); await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
    const log = page.getByRole('log', { name: 'Conversation with the SalesMora assistant' }); await log.getByRole('button', { name: 'Review proposed change' }).last().click({ timeout: 60000 });
    await log.getByRole('button', { name: 'Review extracted sample', exact: true }).click(); await expect(log.getByText('Suggestions applied to the unsaved setup. Save separately to keep them.')).toBeVisible({ timeout: 60000 }); await page.keyboard.press('Escape');
    await expect(page.getByRole('textbox', { name: 'Example value', exact: true }).nth(1)).toHaveValue('jordan@example.test');
    const approval = page.getByRole('checkbox', { name: 'I reviewed the included fields, example corrections and future extraction settings.' }); await approval.check();
    // Canonical findings review owns the explicit approval checkbox and action.
    await page.getByRole('button', { name: /approve.*fields|approve.*mapping|approve.*sample|use these fields/i }).click();
    await expect.poll(async () => Number((await db('captureSetupSamples').where({ sourceId: saved.sourceId }).count('* as n').first())!.n), { timeout: 60000 }).toBe(1);
    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    await expect.poll(async () => (await db('captureSourceDrafts').where({ id: (await db('captureSources').where({ id: saved.sourceId }).first()).draftId }).first()).version, { timeout: 60000 }).toBe(2);
    await page.reload(); await expect(page.getByRole('textbox', { name: 'Example value', exact: true }).nth(1)).toHaveValue('jordan@example.test', { timeout: 60000 });
    await expect(page.getByText('No unsaved changes', { exact: true })).toBeVisible();
    expect(Number((await db('captureSourceSamples').count('* as n').first())!.n)).toBe(0); expect(Number((await db('capturePublications').count('* as n').first())!.n)).toBe(0);
  } finally { await context.close(); }
});


test('missing setup name returns clarification instead of interrupting or writing a source', async () => {
  const before = Number((await db('captureSources').where({ workspaceId }).count('* as n').first())!.n);
  const events = await setupTurn({ ...setupInput, operation: 'create_source', sourceType: 'gmail', name: null });
  expect(events.at(-1)?.type).toBe('turn.completed');
  expect(events.some(event => event.type === 'capture.setup')).toBe(false);
  expect(JSON.stringify(events)).toContain('No proposal was prepared');
  expect(Number((await db('captureSources').where({ workspaceId }).count('* as n').first())!.n)).toBe(before);
});

function sourceTicket(events: Awaited<ReturnType<typeof turn>>) { const event = events.find(event => event.type === 'capture.source'); if (event?.type !== 'capture.source') throw Error(JSON.stringify(events)); return event.result; }
async function sourceTurn(operation: string, id: string, more: Record<string, unknown> = {}) { return sourceTicket(await setupTurn({ ...setupInput, operation, sourceId: id, ...more })); }
async function sourceView(value: ReturnType<typeof sourceTicket>) { const response = await clients.owner.get(`/api/chat/lead-capture/sources?${new URLSearchParams(setupReference(value))}`); expect(response.status()).toBe(200); return (await response.json()).view; }
async function sourceDecide(value: ReturnType<typeof sourceTicket>, decision = 'confirm', client = clients.owner) { return client.post('/api/chat/lead-capture/sources', { headers, data: { ...setupReference(value), decision } }); }
test('source action tickets remain private and explicit archive/restore/duplicate confirmations use canonical services', async () => {
  await db('workspaces').where({ id: workspaceId }).update({ planOverride: 'standard', planOverrideEndsAt: new Date(Date.now() + 86400000), planOverrideReason: 'Disposable source action fixtures', planOverrideId: randomUUID() });
  const { initialCaptureSetupConfiguration } = await import('@salesmora/contracts');
  const configuration = initialCaptureSetupConfiguration('website', { businessName: 'Fictional source lifecycle', businessEmail: '', businessPhone: '' });
  const made = await createCaptureDraft(db, { workspaceId, userId: users.owner }, permissionIds, { workspaceId, requestId: randomUUID(), name: 'Fictional source lifecycle', configuration });
  const authority = { websiteReady: async () => true, gmailReady: async () => false };
  const review = await readCapturePublicationReview(db, { workspaceId, userId: users.owner }, permissionIds, { workspaceId, sourceId: made.sourceId }, authority);
  await publishCaptureDraft(db, { workspaceId, userId: users.owner }, permissionIds, { workspaceId, sourceId: made.sourceId, expectedVersion: review.sourceVersion, draftVersion: review.draftVersion, baseApprovedVersion: review.baseApprovedVersion, configurationVersion: review.configurationVersion, requestId: randomUUID(), confirmed: true, timing: { kind: 'now' } }, authority);
  const publication = await db('capturePublications').where({ sourceId: made.sourceId }).first();
  const archive = await sourceTurn('archive', made.sourceId);
  expect((await sourceView(archive)).ready).toBe(true);
  expect((await db('captureSources').where({ id: made.sourceId }).first()).status).toBe('active');
  expect((await sourceDecide(archive, 'confirm', clients.foreign)).status()).toBe(403);
  const responses = await Promise.all([sourceDecide(archive), sourceDecide(archive)]); expect(responses.map(r => r.status())).toEqual([200, 200]); expect(await responses[0].json()).toEqual(await responses[1].json());
  expect((await db('captureSources').where({ id: made.sourceId }).first()).status).toBe('archived');
  const restore = await sourceTurn('restore', made.sourceId); expect((await sourceDecide(restore)).status()).toBe(200); expect((await db('captureSources').where({ id: made.sourceId }).first()).status).toBe('paused'); expect(await db('capturePublications').where({ sourceId: made.sourceId }).first()).toEqual(publication);
  const resume = await sourceTurn('resume', made.sourceId); expect((await sourceView(resume)).ready).toBe(false); expect((await sourceDecide(resume)).status()).toBe(422); expect((await db('captureSources').where({ id: made.sourceId }).first()).status).toBe('paused');
  const duplicate = await sourceTurn('duplicate', made.sourceId, { name: 'Fictional confirmed draft copy', configurationKind: 'approved' }); const copied = await sourceDecide(duplicate); expect(copied.status()).toBe(200); const receipt = (await copied.json()).view.receipt;
  expect(receipt.kind).toBe('draft'); expect(receipt.sourceId).not.toBe(made.sourceId); expect((await db('captureSources').where({ id: receipt.sourceId }).first()).status).toBe('draft'); expect(await db('capturePublications').where({ sourceId: receipt.sourceId }).first()).toBeUndefined();
  const blocked = await sourceTurn('publish', receipt.sourceId, { timing: { kind: 'now', localDateTime: null } }); const blockedView = await sourceView(blocked); expect(blockedView.ready).toBe(false); expect(blockedView.checks.some((check: { code: string; ready: boolean }) => check.code === 'delivery' && !check.ready)).toBe(true); expect((await sourceDecide(blocked)).status()).toBe(422);
});
test('schedule source reviews bind the pending transition and cancel without activating delivery', async () => {
  const { initialCaptureSetupConfiguration } = await import('@salesmora/contracts');
  const made = await createCaptureDraft(db, { workspaceId, userId: users.owner }, permissionIds, { workspaceId, requestId: randomUUID(), name: 'Fictional scheduled review', configuration: initialCaptureSetupConfiguration('website', { businessName: 'Fictional scheduled review', businessEmail: '', businessPhone: '' }) });
  const authority = { websiteReady: async () => true, gmailReady: async () => false }, review = await readCapturePublicationReview(db, { workspaceId, userId: users.owner }, permissionIds, { workspaceId, sourceId: made.sourceId }, authority);
  const scheduled = await publishCaptureDraft(db, { workspaceId, userId: users.owner }, permissionIds, { workspaceId, sourceId: made.sourceId, expectedVersion: review.sourceVersion, draftVersion: review.draftVersion, baseApprovedVersion: review.baseApprovedVersion, configurationVersion: review.configurationVersion, requestId: randomUUID(), confirmed: true, timing: { kind: 'scheduled', at: new Date(Date.now() + 86400000).toISOString(), timezone: 'America/New_York' } }, authority);
  const change = await sourceTurn('change_schedule', made.sourceId, { timing: { kind: 'scheduled', localDateTime: '2030-01-01T09:00' } }); const proposed = await sourceView(change); expect(proposed.timing).toEqual({ kind: 'scheduled', at: '2030-01-01T14:00:00.000Z', timezone: 'America/New_York' }); expect(proposed.ready).toBe(false); expect((await sourceDecide(change)).status()).toBe(422);
  const cancel = await sourceTurn('cancel_schedule', made.sourceId); expect(cancel.transition?.transitionId).toBe(scheduled.transitionId); expect((await sourceDecide(cancel)).status()).toBe(200);
  expect((await db('capturePublicationTransitions').where({ id: scheduled.transitionId }).first()).state).toBe('cancelled'); expect((await db('captureSources').where({ id: made.sourceId }).first()).status).toBe('paused'); expect((await db('captureSources').where({ id: made.sourceId }).first()).draftId).not.toBeNull();
});
