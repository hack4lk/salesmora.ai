import { randomUUID } from 'node:crypto';
import { expect, request as requests, test, type APIRequestContext } from '@playwright/test';
import { createDatabase, createDatabaseMeasurement, createJob, initializeProposalStorage, withWorkspaceAuthorization } from '@salesmora/data';
import { readHistoryProposalPresence } from '../src/server/chat/history-proposals';
import { chatStreamEventSchema, reportAssistantReadSnapshotSchema, reportAssistantResultResponseSchema,
  reportSelectionSchema, reportTemplateAreas, permissionIds, type ReportAssistantToolInput, type ReportSelection, type ReportTemplateArea, type WorkspacePolicy } from '@salesmora/contracts';
import { reportSelectionExamples } from '../../../packages/contracts/src/reports/assistant-query.fixtures';
import { reportHref } from '../src/features/reports/report-navigation';
import { reportResultData as copy } from '../src/features/assistant/report-result/report-result.data';
import { connectedAssistantData } from '../src/features/assistant/connected-assistant/connected-assistant.data';
import { chatStoreData } from '../src/server/chat/store.data';
import { reportAreaDefinitions } from '../src/features/reports/report-area-catalog/report-area-catalog.definitions';

const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw new Error('Use an isolated local test database.');
const live = process.env.SALESMORA_LIVE_EVAL === '1';
if (live && (!process.env.OPENAI_API_KEY?.trim() || ['LANGSMITH_TRACING', 'LANGCHAIN_TRACING_V2']
  .some(key => process.env[key] && process.env[key] !== 'false'))) {
  throw new Error('Live Reports evaluation requires credentials and disabled tracing.');
}
const origin = process.env.SALESMORA_E2E_ORIGIN ?? 'http://127.0.0.1:3002';
const db = createDatabase(connection), headers = { Origin: origin };
const users: string[] = [], clients: APIRequestContext[] = [];
let owner: APIRequestContext, field: APIRequestContext, outsider: APIRequestContext;
let workspaceId: string, ownerId: string, fieldId: string;
const leadIds = [randomUUID(), randomUUID(), randomUUID()];
const fixture = (request: ReportAssistantToolInput['request'] = { mode: 'current_report' }, slow = false) =>
  `fixture:reports${slow ? '-slow' : ''}:${JSON.stringify({ request })}`;
const primary: Record<ReportTemplateArea, { question: string; section: string; metric: string }> = {
  overview: { question: 'How many Leads were created in the applied overview period?', section: 'lead-intake', metric: 'created' },
  leads: { question: 'How many Leads were created in the applied intake period?', section: 'intake', metric: 'created' },
  sources: { question: 'How many Leads are in the applied creation cohort?', section: 'lead-source', metric: 'cohort' },
  calendar: { question: 'How many canonical visits are in the applied scheduled report?', section: 'calendar-scheduled', metric: 'visits' },
  jobs: { question: 'How many Jobs were created in the applied lifecycle period?', section: 'lifecycle', metric: 'created' },
  team: { question: 'How many open Leads are in the current applied Team report?', section: 'team-leads', metric: 'open' },
  estimates: { question: 'How many accepted estimate families are in the applied decisions period?', section: 'estimate-decisions', metric: 'accepted' },
  activity: { question: 'How many authorized native events are in the applied activity period?', section: 'activity', metric: 'events' },
  financial: { question: 'In this applied Financial report, how many material lines have missing costs? Explain why missing costs are not zero.', section: 'materials', metric: 'missing' },
};
function selection(area: ReportTemplateArea): ReportSelection {
  const example = reportSelectionExamples.find(item => item.area === area);
  if (!example) throw new Error(`Missing ${area} report fixture.`);
  return reportSelectionSchema.parse({ ...example, query: { ...example.query, workspaceId } });
}
const context = (selection: ReportSelection) => ({ selection, period: 'period' in selection.query
  ? { preset: 'custom', ...selection.query.period } : null });
function withoutClocks(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutClocks);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value)
    .filter(([key]) => key !== 'asOf' && key !== 'inactivityCutoff').map(([key, item]) => [key, withoutClocks(item)]));
  return value;
}
async function ask(client: APIRequestContext, input: object) {
  await retireCompletedFixtures();
  const start = performance.now();
  const response = await client.post('/api/chat/turns', { headers, data: {
    workspaceId, surfaceKey: 'reports', clientTurnId: randomUUID(), ...input,
  } });
  expect(response.status(), await response.text()).toBe(200);
  const events = (await response.text()).split('\n\n').filter(frame => frame.startsWith('data:'))
    .map(frame => chatStreamEventSchema.parse(JSON.parse(frame.slice(5))));
  return { response, events, durationMs: Math.round(performance.now() - start) };
}
async function retireCompletedFixtures() {
  // Independent fixture journeys must not consume each other's ten-turn/minute allowance.
  if (!live) await db('chatTurns').where({ workspaceId }).whereNotIn('state', ['accepted', 'running'])
    .update({ createdAt: new Date(Date.now() - 120_000) });
}
async function expectNoGraphCheckpoints() {
  for (const table of ['checkpoints', 'checkpoint_blobs', 'checkpoint_writes', 'checkpoint_migrations']) {
    expect(await db.schema.hasTable(table)).toBe(false);
  }
}
async function changeFinancialAccess(allowed: boolean) {
  const response = await owner.get(`/api/permissions?workspace=${workspaceId}`);
  expect(response.status()).toBe(200);
  const { policy } = await response.json() as { policy: WorkspacePolicy };
  const grants = policy.grants.filter(grant => !(grant.role === 'owner' && grant.permission === 'reports.financial.read'));
  const result = await owner.post('/api/permissions', { headers, data: {
    expectedRevision: policy.revision, policy: { ...policy, revision: policy.revision + 1,
      grants: allowed ? [...grants, { role: 'owner', permission: 'reports.financial.read', scope: 'enabled' }] : grants },
  } });
  expect(result.status()).toBe(200);
}
test.beforeAll(async () => {
  test.setTimeout(240_000);
  for (const role of ['owner', 'field', 'outsider']) {
    const client = await requests.newContext({ baseURL: origin });
    clients.push(client);
    const email = `reports-e2e-${randomUUID()}@example.test`;
    const signup = () => client.post('/api/auth/sign-up/email', { headers, data: {
      name: `Fictional report ${role}`, email, password: 'Fictional-reports-e2e-42!', termsAccepted: true,
    } });
    let response = await signup();
    if (response.status() === 429) {
      await new Promise(resolve => setTimeout(resolve, 61_000));
      response = await signup();
    }
    expect(response.status()).toBe(200);
    const user = await db('users').where({ email }).first('id');
    if (typeof user?.id !== 'string') throw new Error('Fictional account was not created.');
    users.push(user.id);
  }
  [owner, field, outsider] = clients;
  [ownerId, fieldId] = users;
  const workspace = await owner.post('/api/workspaces', { headers, data: {
    business: { businessName: 'Fictional Reports acceptance', businessType: 'plumbing' },
    services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] },
  } });
  expect(workspace.status()).toBe(201);
  workspaceId = (await workspace.json()).workspaceId;
  await db('workspaces').where({ id: workspaceId }).update({ timezone: 'Pacific/Kiritimati' });
  await db('workspaceMemberships').insert({ workspaceId, userId: fieldId, role: 'field' });
  await changeFinancialAccess(true);
  await db('leads').insert(leadIds.map((id, index) => ({ id, workspaceId, createdBy: ownerId,
    submissionId: randomUUID(), submissionHash: 'report-e2e', name: `Fictional Report Lead ${index}`,
    email: '', phone: '', service: 'Repair', address: '', details: '', notes: '', stage: 'new', source: 'website',
    ownerId: index === 0 ? fieldId : ownerId, createdAt: new Date('2026-10-25T12:00:00Z'),
  })));
  const jobId = randomUUID(), workOrderId = randomUUID();
  await db('jobs').insert({ id: jobId, workspaceId, createdBy: ownerId, primaryOwnerId: ownerId,
    title: 'Fictional Report Job', customerName: 'Fictional Customer', service: 'Repair', location: '',
    description: '', status: 'needs-scheduling', createdAt: new Date('2026-10-25T12:00:00Z') });
  await db('jobTeamMembers').insert({ workspaceId, jobId, userId: fieldId });
  await db('workOrders').insert({ id: workOrderId, workspaceId, jobId, title: 'Fictional Report Order',
    status: 'issued', issuedAt: new Date('2026-10-25T12:00:00Z'), instructions: '', accessNotes: '', safetyNotes: '' });
  await db('workOrderMaterials').insert({ id: randomUUID(), workspaceId, workOrderId, position: 0,
    name: 'Fictional material without recorded cost', quantity: '2', costCents: null, status: 'needed', unit: 'each', note: '' });
  await db('leadActivity').insert({ id: randomUUID(), workspaceId, leadId: leadIds[0], actorId: ownerId,
    actorName: 'Fictional report owner', actorType: 'user', type: 'note', changes: JSON.stringify({ body: 'Fictional report event' }),
    createdAt: new Date('2026-10-25T12:00:00Z') });
});
test.afterAll(async () => {
  try {
    if (workspaceId) {
      await db('workspaceSubscriptions').where({ workspaceId }).delete();
      await db('workspaces').where({ id: workspaceId }).delete();
    }
    if (users.length) await db('users').whereIn('id', users).delete();
  } finally { await Promise.all(clients.map(client => client.dispose())); await db.destroy(); }
});
test.beforeEach(retireCompletedFixtures);

for (const area of reportTemplateAreas) test(`${area}: signed-in native totals, context, history and exact report navigation`, async ({ page }) => {
  test.setTimeout(150_000);
  await page.context().addCookies((await owner.storageState()).cookies);
  if (area === 'team') await page.setViewportSize({ width: 390, height: 844 });
  const selected = selection(area);
  await page.goto(reportHref(selected));
  await page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click();
  await expect(page.getByRole('button', { name: /Clear assistant context: Using/ })).toBeVisible();
  const request = page.waitForRequest(request => request.url().endsWith('/api/chat/turns') && request.method() === 'POST');
  const streamed = page.waitForResponse(response => response.url().endsWith('/api/chat/turns') && response.request().method() === 'POST');
  const started = performance.now();
  await page.getByRole('textbox', { name: 'Ask the SalesMora assistant', exact: true })
    .fill(live ? `${primary[area].question} Start with "Report check: N" using the numeric native total, then explain period/current basis, scope and coverage. Use the exact applied report without changing any filters.` : fixture());
  await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  const payload = (await request).postDataJSON();
  expect(payload.surfaceKey).toBe('reports');
  expect(payload.reportContext.selection).toEqual(selected);
  const response = await streamed;
  expect(response.status()).toBe(200);
  await expect(page.getByText('Response complete.', { exact: true })).toBeVisible({ timeout: 95_000 });
  const saved = await db('chatTurns').where({ clientTurnId: payload.clientTurnId, workspaceId, userId: ownerId }).first();
  expect(saved.state).toBe('completed');
  const snapshot = reportAssistantReadSnapshotSchema.parse(saved.reportSnapshot);
  expect(snapshot.binding.selection).toEqual(selected);
  const params = new URLSearchParams({ workspaceId, turnId: saved.id, resultId: snapshot.binding.id });
  const presentationResponse = await owner.get(`/api/chat/reports?${params}`);
  expect(presentationResponse.status()).toBe(200);
  expect(presentationResponse.headers()['cache-control']).toContain('no-store');
  const presentation = reportAssistantResultResponseSchema.parse(await presentationResponse.json());
  expect(presentation.snapshot.selection).toEqual(selected);
  expect(presentation.retrievedAt).toBe(snapshot.binding.retrievedAt);
  expect(presentation.snapshot.result.timezone).toBe('Pacific/Kiritimati');
  if (live) {
    const metric = presentation.snapshot.result.sections.find(section => section.id === primary[area].section)
      ?.metrics.find(metric => metric.id === primary[area].metric);
    if (metric?.value.kind !== 'count') throw new Error('Missing native primary metric.');
    const answer = await db('chatMessages').where({ turnId: saved.id, role: 'assistant' }).first('text');
    expect(answer.text).toMatch(new RegExp(`Report check:\\s*${metric.value.value}(?![\\d.,]\\d)`, 'i'));
    if (area === 'financial') expect(answer.text).toMatch(/missing.{0,80}(not|never|cannot|unknown)|not.{0,40}zero/i);
  }
  const nativeResponse = await owner.get(`/api/reports/${area}?${new URLSearchParams({ query: JSON.stringify(selected.query) })}`);
  expect(nativeResponse.status()).toBe(200);
  const native = await nativeResponse.json();
  expect(withoutClocks(native)).toEqual(withoutClocks(snapshot.native.read));
  if (snapshot.native.area === 'team' && snapshot.native.read.report.view === 'team-leads') {
    expect(Date.parse(native.report.asOf) - Date.parse(native.report.inactivityCutoff))
      .toBe(Date.parse(snapshot.native.read.report.asOf) - Date.parse(snapshot.native.read.report.inactivityCutoff));
  }
  const title = reportAreaDefinitions.find(item => item.id === area)!.label;
  const card = page.getByRole('region', { name: title, exact: true });
  await expect(card.getByRole('button', { name: copy.open, exact: true })).toBeVisible({ timeout: 30_000 });
  for (const section of presentation.snapshot.result.sections) {
    const group = card.getByRole('group', { name: section.label, exact: true });
    await expect(group.getByText(section.scopeLabel, { exact: true })).toBeVisible();
    await expect(group.getByText(section.basisLabel, { exact: true })).toBeVisible();
    for (const metric of section.metrics) {
      const row = group.locator('dl > div').filter({ has: page.getByText(metric.label, { exact: true }) });
      await expect(row.locator('dd').first()).toHaveText(metric.value.kind === 'count'
        ? metric.value.value.toLocaleString('en-GB') : metric.value.kind === 'unavailable' ? 'Unavailable' : metric.value.displayValue);
    }
  }
  const clocks = presentation.snapshot.result.sections.map(section => section.asOf);
  expect(await card.locator('time').evaluateAll(nodes => nodes.map(node => node.getAttribute('datetime')))).toEqual(clocks);
  console.log(`Reports ${live ? 'provider' : 'fixture'} ${area}: ${Math.round(performance.now() - started)} ms; ${Buffer.byteLength(JSON.stringify(snapshot.native))} native bytes`);
  if (live) {
    const usage = await db('aiUsageCalls').where({ turnId: saved.id, workspaceId, userId: ownerId });
    expect(usage.filter(call => ['planning', 'answer'].includes(call.phase)).map(call => call.phase).sort())
      .toEqual(process.env.CHAT_INTENT_ROUTING === 'true' ? ['answer', 'planning', 'planning'] : ['answer', 'planning']);
    expect(usage.every(call => call.outcome === 'completed' && Number(call.totalTokens) > 0)).toBe(true);
  }
  const replay = await owner.post('/api/chat/turns', { headers, data: payload });
  expect(replay.status()).toBe(200);
  expect(await replay.json()).toEqual({ replay: true, turnId: saved.id, threadId: saved.threadId, state: 'completed' });
  await page.reload();
  await page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click();
  await expect(card.getByRole('button', { name: copy.open, exact: true })).toBeVisible({ timeout: 30_000 });
  expect(await card.locator('time').evaluateAll(nodes => nodes.map(node => node.getAttribute('datetime')))).toEqual(clocks);
  const navigation = page.waitForResponse(response => response.url().endsWith('/api/chat/reports') && response.request().method() === 'POST');
  const open = card.getByRole('button', { name: copy.open, exact: true });
  await open.focus(); await page.keyboard.press('Enter');
  expect((await navigation).status()).toBe(200);
  await expect(page).toHaveURL(reportHref(selected));
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('all 25 configurations retain exact evidence controls and native populations', async () => {
  test.skip(live, 'Deterministic dispatch permutations; live planning is exercised by the nine browser journeys.');
  test.setTimeout(180_000);
  for (const example of reportSelectionExamples) {
    const query = { ...example.query, workspaceId };
    if (example.area === 'team' && query.view === 'team-jobs') {
      query.selected = { kind: 'member', id: fieldId, responsibility: 'supporting', filter: 'all' };
      query.filters = { members: [fieldId] };
    }
    const applied = context(reportSelectionSchema.parse({ area: example.area, query }));
    const result = await ask(owner, { message: fixture(), reportContext: applied });
    expect(result.events.at(-1)?.type).toBe('turn.completed');
    const accepted = result.events.find(event => event.type === 'turn.accepted');
    const ticket = result.events.find(event => event.type === 'report.result');
    if (!accepted || accepted.type !== 'turn.accepted' || !ticket || ticket.type !== 'report.result') throw new Error('Missing configured report.');
    const params = new URLSearchParams({ workspaceId, turnId: accepted.turnId, resultId: ticket.result.id });
    const response = await owner.get(`/api/chat/reports?${params}`);
    expect(response.status()).toBe(200);
    const presentation = reportAssistantResultResponseSchema.parse(await response.json());
    expect(presentation.snapshot.selection).toEqual(applied.selection);
    const navigation = await owner.post('/api/chat/reports', { headers, data: Object.fromEntries(params) });
    expect(navigation.status()).toBe(200);
    expect(await navigation.json()).toEqual({ href: reportHref(presentation.snapshot.selection) });
  }
});

test('unapplied date drafts and cleared context never become applied report evidence', async ({ page }) => {
  test.setTimeout(90_000);
  test.skip(live, 'Transport/context assertions do not need additional provider usage.');
  await page.context().addCookies((await owner.storageState()).cookies);
  const selected = selection('leads');
  await page.goto(reportHref(selected));
  await page.getByRole('combobox', { name: 'Date range', exact: true }).selectOption('custom');
  await page.getByLabel(/^Start date/).fill('2026-10-01');
  await page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click();
  for (const cleared of [false, true]) {
    if (cleared) await page.getByRole('button', { name: /Clear assistant context: Using/ }).click();
    const request = page.waitForRequest(request => request.url().endsWith('/api/chat/turns') && request.method() === 'POST');
    await page.getByRole('textbox', { name: 'Ask the SalesMora assistant', exact: true }).fill(fixture());
    await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
    const body = (await request).postDataJSON();
    if (cleared) expect(body.reportContext).toBeUndefined();
    else expect(body.reportContext.selection).toEqual(selected);
    await expect(page.getByText('Response complete.', { exact: true })).toBeVisible({ timeout: 30_000 });
  }
  await expect(page.getByText('Choose an applied report before asking about this report. No report facts were retrieved.', { exact: false })).toBeVisible();
});

test('benchmark deterministic chat database workloads', async () => {
  test.skip(live || process.env.CHAT_DB_METRICS !== 'true', 'Requires deterministic provider and opt-in database metrics.');
  test.setTimeout(120_000);
  let threadId: string | undefined;
  for (const workload of [
    { name: 'lead-summary', message: 'fixture:database:fixture:context-counts', surfaceKey: 'home' },
    { name: 'lead-follow-up', message: 'fixture:database:fixture:context-counts', surfaceKey: 'home', followUp: true },
    { name: 'report', message: `fixture:database:${fixture()}`, reportContext: context(selection('leads')) },
    ...reportTemplateAreas.filter(area => area !== 'leads').map(area => ({
      name: `report-${area}`, message: `fixture:database:${fixture()}`, reportContext: context(selection(area)),
    })),
    { name: 'proposal', message: 'fixture:database:fixture:draft', surfaceKey: 'home' },
    { name: 'long-stream', message: 'fixture:database-slow:fixture:context-counts', surfaceKey: 'home' },
    { name: 'lead-search', message: `fixture:database:fixture:search:${JSON.stringify({ mode: 'filters',
      filters: { query: '', stages: ['new'], sources: [], ownerIds: [], created: 'any', from: '', to: '', attention: false, archived: false } })}`, surfaceKey: 'home' },
  ]) {
    const { name, followUp, ...input } = workload;
    const result = await ask(owner, { ...input, ...(followUp ? { threadId } : {}) });
    expect(result.events.at(-1)?.type).toBe('turn.completed');
    const accepted = result.events.find(event => event.type === 'turn.accepted');
    if (accepted?.type !== 'turn.accepted') throw new Error('Missing accepted benchmark turn.');
    const savedTurn = await db('chatTurns').where({ id: accepted.turnId, workspaceId, userId: ownerId })
      .first('proposalFamilies');
    expect(savedTurn.proposalFamilies).toEqual(name === 'proposal' ? ['action'] : []);
    threadId = accepted.threadId;
    const measurementId = result.response.headers()['x-chat-database-metrics-id'];
    expect(measurementId).toMatch(/^[a-f0-9-]{36}$/);
    const usage = await db('aiUsageCalls').where({ turnId: accepted.turnId }).select('phase', 'outcome');
    expect(usage).toHaveLength(2);
    expect(usage.every(call => call.outcome === 'completed')).toBe(true);
    await expectNoGraphCheckpoints();
    console.log('CHAT_DATABASE_BENCHMARK ' + JSON.stringify({
      workload: name, measurementId, durationMs: result.durationMs,
    }));
  }
});

test('all migrated domains read and prepare reviews through the common tool runner without business writes', async () => {
  test.skip(live, 'Shared runner domain-contract regression with deterministic provider.');
  test.setTimeout(120_000);
  const nullable = (keys: string) => Object.fromEntries(keys.split(' ').map(key => [key, null]));
  const order = await db('workOrders').where({ workspaceId }).first('workOrderNumber');
  if (!order) throw new Error('Missing isolated Work Order fixture.');
  const tables = ['customers', 'materialCatalog', 'workOrders', 'workOrderActivity', 'estimates', 'captureSources'];
  const counts = () => Promise.all(tables.map(async table =>
    [table, (await db(table).where({ workspaceId }).count('* as count').first())?.count]));
  const before = await counts();
  for (const workload of [
    { name: 'customers_query', args: { request: { operation: 'search', input: { filters: {} } } }, event: 'customers.result' },
    { name: 'customers_propose_action', args: { request: { operation: 'create', input: {
      values: { name: 'Fictional unsaved customer', type: 'person', companyName: '', email: '', phone: '',
        location: '', internalNotes: '', ownerId: '' }, allowDuplicate: false,
    } } }, event: 'customers.result' },
    { name: 'work_orders_query', args: { ...nullable('query status mine when workOrderNumber limit'), operation: 'search' }, evidenceType: 'work-orders-result' },
    { name: 'work_orders_propose_action', args: {
      ...nullable('jobNumber title instructions safetyNotes scheduledDate arrivalWindow assignee crew tasks taskLabel done materials status reason summary overrideReason query filterStatus mine when columns'),
      operation: 'add_note', workOrderNumber: `WO-${order.workOrderNumber}`, body: 'Fictional unsaved review note',
    }, event: 'work_orders.result' },
    { name: 'materials_query', args: { ...nullable('query category supplier limit'), operation: 'search' }, evidenceType: 'materials-result' },
    { name: 'materials_propose_action', args: {
      ...nullable('target sku unit category supplier costDollars priceDollars notes sourceUrl'),
      operation: 'create', name: 'Fictional unsaved material',
    }, event: 'work_orders.result' },
    { name: 'estimates_query', args: { request: { operation: 'list', input: { useCurrentFilters: false } } }, event: 'estimates.result' },
    { name: 'estimates_propose_action', args: { request: {
      operation: 'create', parentType: 'lead', parentRef: leadIds[1], estimateRef: null,
      changes: { ...nullable('scope message paymentTerms termsNote validUntil discount taxRate deposit items'), name: 'Fictional unsaved estimate' },
    } }, event: 'estimates.draft' },
    { name: 'lead_capture_query', args: { ...nullable('sourceId search type status'), operation: 'sources',
      archived: false, usePageFilters: false, page: 1, limit: 1 }, event: 'capture.result' },
    { name: 'lead_capture_propose_action', args: {
      ...nullable('sourceId fields contactRequired workflow brief content rules mappings findings timing configurationKind'),
      operation: 'create_source', name: 'Fictional unsaved source', sourceType: 'website',
    }, event: 'capture.setup' },
    { name: 'calendar_query', args: {
      ...nullable('date to person arrivalWindow'), operation: 'unscheduled',
      usePageFilters: false, includeWeekends: false,
    }, event: 'calendar.result' },
  ]) {
    const result = await ask(owner, { surfaceKey: 'home', message: `fixture:database:fixture:tool:${JSON.stringify({
      name: workload.name, args: workload.args,
    })}` });
    expect(result.events.at(-1)?.type, workload.name).toBe('turn.completed');
    if (workload.event) expect(result.events.some(event => event.type === workload.event), workload.name).toBe(true);
    if (workload.evidenceType) expect(result.events.filter(event => event.type === 'message.delta')
      .map(event => event.text).join(''), workload.name).toContain(workload.evidenceType);
    if (workload.name === 'customers_propose_action') expect(result.events.find(event => event.type === 'customers.result'))
      .toMatchObject({ result: { kind: 'proposal', draft: { action: 'create', state: 'pending' } } });
    if (workload.name === 'work_orders_propose_action' || workload.name === 'materials_propose_action')
      expect(result.events.find(event => event.type === 'work_orders.result')).toMatchObject({
        result: { kind: 'proposal', draft: { action: workload.name === 'materials_propose_action' ? 'material-create' : 'note', state: 'pending' } },
      });
    const accepted = result.events.find(event => event.type === 'turn.accepted');
    if (accepted?.type !== 'turn.accepted') throw new Error('Missing accepted domain fixture.');
    expect((await db('chatTurns').where({ id: accepted.turnId }).first('state'))?.state, workload.name).toBe('completed');
    const usage = await db('aiUsageCalls').where({ turnId: accepted.turnId }).select('phase', 'outcome');
    expect(usage, workload.name).toHaveLength(2);
    expect(usage.every(call => call.outcome === 'completed'), workload.name).toBe(true);
    console.log('CHAT_DOMAIN_DATABASE_BENCHMARK ' + JSON.stringify({
      workload: workload.name, measurementId: result.response.headers()['x-chat-database-metrics-id'],
    }));
    const followUp = await ask(owner, { surfaceKey: 'home', threadId: accepted.threadId,
      message: 'fixture:database:fixture:context-counts' });
    expect(followUp.events.at(-1)?.type, `${workload.name} follow-up`).toBe('turn.completed');
    console.log('CHAT_DOMAIN_DATABASE_BENCHMARK ' + JSON.stringify({
      workload: `${workload.name}:follow-up`, measurementId: followUp.response.headers()['x-chat-database-metrics-id'],
    }));
    const followed = followUp.events.find(event => event.type === 'turn.accepted');
    if (followed?.type !== 'turn.accepted') throw new Error('Missing followed-up domain fixture.');
    expect((await db('chatTurns').where({ id: followed.turnId }).first('historyEvidence')).historyEvidence).toContain(accepted.turnId);
    const restored = await owner.get(`/api/chat/threads?workspace=${workspaceId}&thread=${accepted.threadId}`);
    expect(restored.status()).toBe(200);
    const savedMessages = (await restored.json()).messages.filter((message: { turnId: string; role: string }) =>
      [accepted.turnId, followed.turnId].includes(message.turnId) && message.role === 'assistant');
    expect(savedMessages, `${workload.name} restored sources`).toHaveLength(2);
    expect(savedMessages.every((message: { text: string }) => message.text && message.text !== chatStoreData.restricted),
      `${workload.name} historical provenance`).toBe(true);
    await expectNoGraphCheckpoints();
  }
  expect(await counts()).toEqual(before);
});

test('ordinary edits preserve timestamped report snapshots and generic follow-up provenance', async () => {
  test.skip(live, 'Deterministic historical snapshot regression.');
  const result = await ask(owner, { message: fixture(), reportContext: context(selection('leads')) });
  const accepted = result.events.find(event => event.type === 'turn.accepted');
  const ticket = result.events.find(event => event.type === 'report.result');
  if (accepted?.type !== 'turn.accepted' || ticket?.type !== 'report.result') throw Error('Missing report snapshot.');
  const params = new URLSearchParams({ workspaceId, turnId: accepted.turnId, resultId: ticket.result.id });
  const before = await owner.get(`/api/chat/reports?${params}`);
  expect(before.status()).toBe(200);
  const snapshot = await before.json();
  const original = await db('leads').where({ workspaceId, id: leadIds[2] }).first('name', 'version');
  try {
    await db('leads').where({ workspaceId, id: leadIds[2] }).update({ name: 'Fictional ordinary edit', version: original.version + 1 });
    const after = await owner.get(`/api/chat/reports?${params}`);
    expect(after.status()).toBe(200);
    expect(await after.json()).toEqual(snapshot);
    const follow = await ask(owner, { surfaceKey: 'home', threadId: accepted.threadId, message: 'fixture:context-counts' });
    expect(follow.events.at(-1)?.type).toBe('turn.completed');
    const history = await owner.get(`/api/chat/threads?workspace=${workspaceId}&thread=${accepted.threadId}`);
    expect(history.status()).toBe(200);
    expect((await history.json()).messages.filter((message: { role: string }) => message.role === 'assistant')
      .every((message: { text: string }) => message.text && message.text !== chatStoreData.restricted)).toBe(true);
  } finally { await db('leads').where({ workspaceId, id: leadIds[2] }).update(original); }
});

test('saver-free graph preserves canonical transcript replay and expired-lease recovery without regeneration', async () => {
  test.skip(live, 'Deterministic graph persistence regression.');
  const input = { clientTurnId: randomUUID(), message: 'fixture:database:fixture:context-counts', surfaceKey: 'home' };
  const result = await ask(owner, input);
  expect(result.events.at(-1)?.type).toBe('turn.completed');
  const accepted = result.events.find(event => event.type === 'turn.accepted');
  if (accepted?.type !== 'turn.accepted') throw new Error('Missing accepted turn.');
  const text = result.events.filter(event => event.type === 'message.delta').map(event => event.text).join('');
  expect(text.length).toBeGreaterThan(0);
  const historyUrl = `/api/chat/threads?workspace=${workspaceId}&thread=${accepted.threadId}`;
  const history = await owner.get(historyUrl);
  expect(history.status()).toBe(200);
  expect((await history.json()).messages.find((message: { turnId: string; role: string }) =>
    message.turnId === accepted.turnId && message.role === 'assistant').text).toBe(text);
  const retry = () => owner.post('/api/chat/turns', { headers, data: { workspaceId, ...input } });
  expect(await (await retry()).json()).toMatchObject({ replay: true, turnId: accepted.turnId, state: 'completed' });
  // Simulate persisted state left by a dead process; no provider execution is resumed.
  await db('chatTurns').where({ id: accepted.turnId, workspaceId, userId: ownerId })
    .update({ state: 'running', finishedAt: null, leaseUntil: new Date(Date.now() - 1000) });
  const recovered = await owner.get(historyUrl);
  expect(recovered.status()).toBe(200);
  const saved = await recovered.json();
  expect(saved.turns.find((turn: { id: string }) => turn.id === accepted.turnId).state).toBe('interrupted');
  expect(saved.messages.find((message: { turnId: string; role: string }) =>
    message.turnId === accepted.turnId && message.role === 'assistant').text).toBe(text);
  expect(await (await retry()).json()).toMatchObject({ replay: true, turnId: accepted.turnId, state: 'interrupted' });
  expect(await db('chatTurns').where({ workspaceId, userId: ownerId, clientTurnId: input.clientTurnId })).toHaveLength(1);
  expect(await db('aiUsageCalls').where({ turnId: accepted.turnId })).toHaveLength(2);
  await expectNoGraphCheckpoints();
});

test('admission preserves the tenth-turn boundary, exact replay and active-turn conflict precedence', async () => {
  test.skip(live, 'Deterministic admission limits against isolated records.');
  const first = await ask(owner, { message: 'fixture:database:fixture:context-counts', surfaceKey: 'home' });
  const accepted = first.events.find(event => event.type === 'turn.accepted');
  if (accepted?.type !== 'turn.accepted') throw Error('Missing admission fixture.');
  await retireCompletedFixtures();
  const saved = await db('chatTurns').where({ id: accepted.turnId }).first('accessHash');
  const ids = Array.from({ length: 10 }, () => randomUUID());
  const seed = (id: string) => ({
    id, threadId: accepted.threadId, workspaceId, userId: ownerId, clientTurnId: randomUUID(),
    requestHash: 'fictional-admission', accessHash: saved.accessHash, surfaceKey: 'home',
    state: 'completed', leaseUntil: new Date(Date.now() + 120_000),
  });
  const submit = (clientTurnId = randomUUID()) => owner.post('/api/chat/turns', { headers, data: {
    workspaceId, clientTurnId, surfaceKey: 'home', message: 'fixture:database:fixture:context-counts',
  } });
  let tenthId: string | undefined;
  try {
    await db('chatTurns').insert(ids.slice(0, 9).map(seed));
    const clientTurnId = randomUUID();
    const tenth = await submit(clientTurnId);
    expect(tenth.status()).toBe(200);
    expect(await tenth.text()).toContain('turn.completed');
    tenthId = (await db('chatTurns').where({ workspaceId, userId: ownerId, clientTurnId }).first('id')).id;
    expect(await (await submit(clientTurnId)).json()).toMatchObject({ replay: true, turnId: tenthId });
    const limited = await submit();
    expect(limited.status()).toBe(429);
    expect(await limited.json()).toMatchObject({ error: 'limit_exceeded' });
    // An older but still active turn must not disappear behind the recent-turn cutoff.
    await db('chatTurns').insert({ ...seed(ids[9]), state: 'running', createdAt: new Date(Date.now() - 120_000) });
    const conflicted = await submit();
    expect(conflicted.status()).toBe(409);
    expect(await conflicted.json()).toMatchObject({ error: 'conflict' });
    await db('chatTurns').where({ id: ids[9] }).update({ leaseUntil: new Date(Date.now() - 1000) });
    expect((await submit()).status()).toBe(429);
    // Rejected acceptance rolls recovery back along with the rest of the transaction.
    expect((await db('chatTurns').where({ id: ids[9] }).first('state')).state).toBe('running');
  } finally {
    await db('chatTurns').where({ workspaceId, userId: ownerId }).whereIn('id', ids).delete();
    if (tenthId) await db('chatTurns').where({ id: tenthId, workspaceId, userId: ownerId })
      .update({ createdAt: new Date(Date.now() - 120_000) });
  }
});

test('concurrent different submissions admit only one active turn for the same user', async () => {
  test.skip(live, 'Deterministic concurrent admission with a finite provider.');
  await retireCompletedFixtures();
  const clientIds = [randomUUID(), randomUUID()];
  const results = await Promise.all(clientIds.map(clientTurnId =>
    owner.post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId,
      surfaceKey: 'home', message: 'fixture:database-slow:fixture:context-counts' } })));
  expect(results.map(response => response.status()).sort()).toEqual([200, 409]);
  const success = results.find(response => response.status() === 200)!;
  expect(await success.text()).toContain('turn.completed');
  expect(await results.find(response => response.status() === 409)!.json()).toMatchObject({ error: 'conflict' });
  const persisted = await db('chatTurns').where({ workspaceId, userId: ownerId }).whereIn('clientTurnId', clientIds).select('id');
  expect(persisted).toHaveLength(1);
  expect(await db('aiUsageCalls').where({ turnId: persisted[0].id })).toHaveLength(2);
});

test('saver-free graph aborts on persisted Stop and retains a cancelled canonical turn', async () => {
  test.skip(live, 'Deterministic graph cancellation regression.');
  // Compile the development endpoint before timing cancellation of the finite provider fixture.
  expect((await owner.post('/api/chat/cancel', { headers, data: {} })).status()).toBe(422);
  await retireCompletedFixtures();
  const cookies = (await owner.storageState()).cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
  const response = await fetch(`${origin}/api/chat/turns`, {
    method: 'POST', headers: { ...headers, Cookie: cookies, 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspaceId, surfaceKey: 'home', clientTurnId: randomUUID(),
      message: 'fixture:database-slow:fixture:context-counts' }),
    signal: AbortSignal.timeout(30_000),
  });
  expect(response.status).toBe(200);
  if (!response.body) throw new Error('Missing graph stream.');
  const reader = response.body.getReader(), decoder = new TextDecoder();
  let buffer = '', turnId: string | undefined, threadId: string | undefined, stopped = false, terminal: string | undefined;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let end;
      while ((end = buffer.indexOf('\n\n')) >= 0) {
        const frame = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        if (!frame.startsWith('data:')) continue;
        const event = chatStreamEventSchema.parse(JSON.parse(frame.slice(5)));
        if (event.type === 'turn.accepted') { turnId = event.turnId; threadId = event.threadId; }
        if (event.type === 'message.delta' && !stopped) {
          expect(turnId).toBeDefined();
          expect((await owner.post('/api/chat/cancel', { headers, data: { workspaceId, turnId } })).status()).toBe(200);
          stopped = true;
        }
        if (['turn.completed', 'turn.cancelled', 'turn.failed'].includes(event.type)) terminal = event.type;
      }
    }
  } finally { await reader.cancel(); }
  expect(stopped).toBe(true);
  expect(terminal).toBe('turn.cancelled');
  if (!turnId || !threadId) throw new Error('Missing cancelled turn identity.');
  expect((await db('chatTurns').where({ id: turnId, workspaceId }).first()).state).toBe('cancelled');
  expect((await db('chatMessages').where({ turnId, role: 'assistant' }).first('text')).text).toBe('');
  const history = await owner.get(`/api/chat/threads?workspace=${workspaceId}&thread=${threadId}`);
  expect(history.status()).toBe(200);
  expect((await history.json()).turns.find((turn: { id: string }) => turn.id === turnId).state).toBe('cancelled');
  const usage = await db('aiUsageCalls').where({ turnId }).select('phase', 'outcome');
  expect(usage).toHaveLength(2);
  expect(usage.find(call => call.phase === 'answer')?.outcome).toBe('cancelled');
  await expectNoGraphCheckpoints();
});

test('provider failure discards streamed partial text from durable history', async () => {
  test.skip(live, 'Deterministic failure regression.');
  const result = await ask(owner, { message: 'fixture:fail', surfaceKey: 'home' });
  expect(result.events.at(-1)).toMatchObject({ type: 'turn.failed', code: 'provider_unavailable' });
  expect(result.events.some(event => event.type === 'message.delta')).toBe(true);
  const accepted = result.events.find(event => event.type === 'turn.accepted');
  if (accepted?.type !== 'turn.accepted') throw new Error('Missing failed turn.');
  const saved = await db('chatMessages').where({ turnId: accepted.turnId, role: 'assistant' }).first('text');
  expect(saved.text).toBe('');
  const history = await owner.get(`/api/chat/threads?workspace=${workspaceId}&thread=${accepted.threadId}`);
  expect(history.status()).toBe(200);
  expect((await history.json()).messages.find((message: { turnId: string; role: string }) =>
    message.turnId === accepted.turnId && message.role === 'assistant').text).toBe('');
});

test('admitted answers reuse authority while Stop, lease expiry and next-request revocation remain effective', async () => {
  test.skip(live, 'Deterministic access-boundary regression.');
  test.setTimeout(90_000);
  const cookies = (await owner.storageState()).cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
  const sessions = await db('sessions').where({ userId: ownerId });
  const grants = await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'assistant.use' });
  for (const scenario of ['expired-session', 'revoked-session', 'suspended-user', 'revoked-permission', 'cancelled-turn', 'expired-lease']) {
    await retireCompletedFixtures();
    const response = await fetch(`${origin}/api/chat/turns`, {
      method: 'POST', headers: { ...headers, Cookie: cookies, 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, surfaceKey: 'home', clientTurnId: randomUUID(), message: 'fixture:slow' }),
      signal: AbortSignal.timeout(20_000),
    });
    expect(response.status, scenario).toBe(200);
    if (!response.body) throw new Error('Missing access-regression stream.');
    const reader = response.body.getReader(), decoder = new TextDecoder();
    let buffer = '', turnId: string | undefined, terminal: string | undefined, changed = false, batches = 0;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let end;
        while ((end = buffer.indexOf('\n\n')) >= 0) {
          const frame = buffer.slice(0, end);
          buffer = buffer.slice(end + 2);
          if (!frame.startsWith('data:')) continue;
          const event = chatStreamEventSchema.parse(JSON.parse(frame.slice(5)));
          if (event.type === 'turn.accepted') {
            turnId = event.turnId;
            changed = true;
            if (scenario === 'expired-session')
              await db('sessions').where({ userId: ownerId }).update({ expiresAt: new Date(Date.now() - 1000) });
            else if (scenario === 'revoked-session')
              await db('sessions').where({ userId: ownerId }).delete();
            else if (scenario === 'suspended-user')
              await db('users').where({ id: ownerId }).update({ suspendedAt: new Date(), suspendedReason: 'Fictional access regression.' });
            else if (scenario === 'revoked-permission')
              await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'assistant.use' }).delete();
            else if (scenario === 'cancelled-turn')
              expect((await owner.post('/api/chat/cancel', { headers, data: { workspaceId, turnId } })).status()).toBe(200);
            else
              await db('chatTurns').where({ id: turnId, workspaceId }).update({ leaseUntil: new Date(Date.now() - 1000) });
          }
          if (event.type === 'message.delta') batches++;
          if (['turn.failed', 'turn.cancelled', 'turn.completed'].includes(event.type)) terminal = event.type;
        }
      }
      expect(changed, scenario).toBe(true);
      const interrupted = ['cancelled-turn', 'expired-lease'].includes(scenario);
      expect(terminal, scenario).toBe(interrupted ? 'turn.cancelled' : 'turn.completed');
      const transcript = (await db('chatMessages').where({ turnId, role: 'assistant' }).first('text')).text;
      if (interrupted) expect(transcript).toBe('');
      else {
        expect(batches).toBeGreaterThan(0);
        expect(transcript).not.toBe('');
        const next = await fetch(`${origin}/api/chat/threads?workspace=${workspaceId}`, { headers: { Cookie: cookies } });
        expect([401, 403], scenario).toContain(next.status);
      }
    } finally {
      await reader.cancel();
      if (scenario === 'expired-session')
        await db('sessions').insert(sessions).onConflict('id').merge();
      if (scenario === 'revoked-session') await db('sessions').insert(sessions);
      if (scenario === 'suspended-user') await db('users').where({ id: ownerId }).update({ suspendedAt: null, suspendedReason: null });
      if (scenario === 'revoked-permission')
        await db('workspaceRolePolicies').insert(grants).onConflict(['workspaceId', 'role', 'permission']).ignore();
    }
  }
});

test('admitted streaming and completion use the same authority; expired sessions fail on the next request', async () => {
  test.skip(live, 'Deterministic request-snapshot authorization contract.');
  await retireCompletedFixtures();
  const cookies = (await owner.storageState()).cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
  const sessions = await db('sessions').where({ userId: ownerId });
  const response = await fetch(`${origin}/api/chat/turns`, {
    method: 'POST', headers: { ...headers, Cookie: cookies, 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspaceId, surfaceKey: 'home', clientTurnId: randomUUID(),
      message: `fixture:database-slow:fixture:search:${JSON.stringify({ mode: 'filters',
        filters: { query: '', stages: ['new'], sources: [], ownerIds: [], created: 'any', from: '', to: '', attention: false, archived: false } })}` }),
    signal: AbortSignal.timeout(20_000),
  });
  expect(response.status).toBe(200);
  if (!response.body) throw Error('Missing stream.');
  const reader = response.body.getReader(), decoder = new TextDecoder();
  let buffer = '', turnId: string | undefined, batches = 0, terminal: string | undefined, cards = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let end;
      while ((end = buffer.indexOf('\n\n')) >= 0) {
        const frame = buffer.slice(0, end); buffer = buffer.slice(end + 2);
        if (!frame.startsWith('data:')) continue;
        const event = chatStreamEventSchema.parse(JSON.parse(frame.slice(5)));
        if (event.type === 'turn.accepted') turnId = event.turnId;
        if (event.type === 'message.delta' && ++batches === 1)
          await db('sessions').where({ userId: ownerId }).update({ expiresAt: new Date(Date.now() - 1000) });
        if (event.type === 'leads.results') cards++;
        if (['turn.failed', 'turn.cancelled', 'turn.completed'].includes(event.type)) terminal = event.type;
      }
    }
    expect(batches).toBeGreaterThan(1);
    expect(terminal).toBe('turn.completed');
    expect(cards).toBe(1);
    expect((await db('chatTurns').where({ id: turnId, workspaceId }).first('leadSearchSnapshot')).leadSearchSnapshot).toBeTruthy();
    expect((await db('chatMessages').where({ turnId, role: 'assistant' }).first('text')).text).not.toBe('');
    const next = await fetch(`${origin}/api/chat/threads?workspace=${workspaceId}`, { headers: { Cookie: cookies } });
    expect(next.status).toBe(401);
  } finally {
    await reader.cancel();
    await db('sessions').insert(sessions).onConflict('id').merge();
  }
});

test('tool execution shares admission authority after planning while notified Stop aborts before execution', async () => {
  test.skip(live, 'Deterministic admitted tool execution regression.');
  test.setTimeout(90_000);
  const cookies = (await owner.storageState()).cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
  const sessions = await db('sessions').where({ userId: ownerId });
  const grants = await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'leads.read' });
  const filters = { query: '', stages: ['new'], sources: [], ownerIds: [], created: 'any', from: '', to: '', attention: false, archived: false };
  for (const tool of ['search', 'summary']) {
    for (const scenario of ['session', 'permission', 'turn']) {
      await retireCompletedFixtures();
      const requestModel = tool === 'search' ? `fixture:search:${JSON.stringify({ mode: 'filters', filters })}` : 'fixture:context-counts';
      const response = await fetch(`${origin}/api/chat/turns`, {
        method: 'POST', headers: { ...headers, Cookie: cookies, 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, surfaceKey: 'home', clientTurnId: randomUUID(),
          message: `fixture:database-plan-slow:${requestModel}` }),
        signal: AbortSignal.timeout(20_000),
      });
      expect(response.status).toBe(200);
      if (!response.body) throw Error('Missing planning regression stream.');
      const reader = response.body.getReader(), decoder = new TextDecoder();
      let buffer = '', turnId: string | undefined, terminal: string | undefined, changed = false;
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let end;
          while ((end = buffer.indexOf('\n\n')) >= 0) {
            const frame = buffer.slice(0, end); buffer = buffer.slice(end + 2);
            if (!frame.startsWith('data:')) continue;
            const event = chatStreamEventSchema.parse(JSON.parse(frame.slice(5)));
            if (event.type === 'turn.accepted') {
              turnId = event.turnId;
              // Observe this fixture's planning reservation: setup/presentation capabilities are already loaded.
              await expect.poll(async () => !!await db('aiUsageCalls').where({ turnId, phase: 'planning' }).first('id'),
                { timeout: 10_000, intervals: [25, 50, 100] }).toBe(true);
              if (scenario === 'session')
                await db('sessions').where({ userId: ownerId }).update({ expiresAt: new Date(Date.now() - 1000) });
              else if (scenario === 'permission')
                await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'leads.read' }).delete();
              else
                expect((await owner.post('/api/chat/cancel', { headers, data: { workspaceId, turnId } })).status()).toBe(200);
              changed = true;
            }
            if (scenario === 'turn') {
              expect(event.type).not.toBe('message.delta');
              expect(event.type).not.toBe('leads.results');
            }
            if (['turn.completed', 'turn.failed', 'turn.cancelled'].includes(event.type)) terminal = event.type;
          }
        }
        expect(changed).toBe(true);
        expect(terminal).toBe(scenario === 'turn' ? 'turn.cancelled' : 'turn.completed');
        const saved = await db('chatTurns').where({ workspaceId, id: turnId }).first('leadSearchSnapshot');
        if (scenario === 'turn' || tool === 'summary') expect(saved.leadSearchSnapshot).toBeNull();
        else expect(saved.leadSearchSnapshot).toBeTruthy();
        expect(await db('aiUsageCalls').where({ turnId, phase: 'answer' })).toHaveLength(scenario === 'turn' ? 0 : 1);
        if (scenario === 'session') {
          const next = await fetch(`${origin}/api/chat/threads?workspace=${workspaceId}`, { headers: { Cookie: cookies } });
          expect(next.status).toBe(401);
        } else if (scenario === 'permission') {
          const storedTurn = await db('chatTurns').where({ workspaceId, id: turnId }).first('threadId');
          const history = await owner.get(`/api/chat/threads?workspace=${workspaceId}&thread=${storedTurn.threadId}`);
          // Removing the base read grant leaves dependent grants invalid, so the entire new request denies.
          expect(history.status()).toBe(403);
          expect(await history.json()).toEqual({ error: 'access_denied' });
        }
      } finally {
        await reader.cancel();
        await db('sessions').insert(sessions).onConflict('id').merge();
        await db('workspaceRolePolicies').insert(grants).onConflict(['workspaceId', 'role', 'permission']).ignore();
      }
    }
  }
});

test('consolidated Lead Details and History reads preserve scoped results and missing-target clarification', async () => {
  test.skip(live, 'Deterministic Lead read boundary parity.');
  for (const operation of ['details', 'history']) {
    for (const client of [owner, field]) {
      const input = { leadRef: leadIds[0], ...(operation === 'history' ? { mode: 'notes' } : {}) };
      const result = await ask(client, { surfaceKey: 'home', message: `fixture:${operation}:${JSON.stringify(input)}` });
      expect(result.events.at(-1)?.type).toBe('turn.completed');
      const card = result.events.find(event => event.type === (operation === 'history' ? 'lead.history' : 'lead.details'));
      if (card?.type !== 'lead.history' && card?.type !== 'lead.details') throw Error('Missing scoped Lead result.');
      expect(card.result.lead.id).toBe(leadIds[0]);
      expect(card.result.scope).toBe(client === owner ? 'workspace' : 'assigned');
    }
    const missing = await ask(owner, { surfaceKey: 'home', message: `fixture:${operation}:${JSON.stringify({
      leadRef: '', ...(operation === 'history' ? { mode: 'notes' } : {}),
    })}` });
    expect(missing.events.at(-1)?.type).toBe('turn.completed');
    expect(missing.events.some(event => event.type === 'lead.history' || event.type === 'lead.details')).toBe(false);
  }
});

test('history skips modern plain proposal lookups and preserves canonical proposals and ownership', async () => {
  test.skip(live, 'Deterministic history query regression.');
  await initializeProposalStorage(db);
  const measurePresence = async (
    identity: { workspaceId: string; userId: string },
    ids: string[],
    families?: ReadonlyMap<string, unknown>,
    authorizationIdentity = identity,
  ) => {
    const metrics = createDatabaseMeasurement();
    const read = () => withWorkspaceAuthorization(db, authorizationIdentity, permissionIds, false, (trx, authority) =>
      metrics.run(() => readHistoryProposalPresence(trx, identity, ids, families, authority)));
    const result = await read();
    return { result, totals: metrics.snapshot().totals };
  };
  const result = await ask(owner, { message: 'fixture:draft', surfaceKey: 'home' });
  expect(result.events.at(-1)?.type).toBe('turn.completed');
  const accepted = result.events.find(event => event.type === 'turn.accepted');
  const proposed = result.events.find(event => event.type === 'action.proposed');
  if (accepted?.type !== 'turn.accepted' || proposed?.type !== 'action.proposed')
    throw new Error('Missing fixture proposal.');
  const template = await db('chatTurns').where({ id: accepted.turnId, workspaceId, userId: ownerId }).first();
  expect(template.proposalFamilies).toEqual(['action']);
  await expect(db('chatTurns').where({ id: accepted.turnId, workspaceId, userId: ownerId })
    .update({ proposalFamilies: JSON.stringify(['invalid-family']) })).rejects.toThrow('chat_turn_proposal_families');
  const modernIds = [randomUUID(), randomUUID()];
  const plain = await measurePresence({ workspaceId, userId: ownerId },
    modernIds, new Map(modernIds.map(id => [id, []])));
  expect(plain.totals).toMatchObject({ calls: 0, failed: 0, pending: 0 });
  expect(plain.result.states(modernIds[0])).toEqual([]);
  const family = await measurePresence({ workspaceId, userId: ownerId },
    [accepted.turnId, ...modernIds], new Map([
      [accepted.turnId, template.proposalFamilies], ...modernIds.map<[string, string[]]>(id => [id, []]),
    ]));
  expect(family.totals).toMatchObject({ calls: 1, read: 1, failed: 0, pending: 0 });
  expect(family.result.states(accepted.turnId)).toEqual([{ family: 'action', state: 'pending' }]);
  const ordinaryIds = Array.from({ length: 48 }, () => randomUUID());
  await db('chatTurns').insert(ordinaryIds.map((id, index) => ({
    id, clientTurnId: randomUUID(), threadId: accepted.threadId, workspaceId, userId: ownerId,
    requestHash: 'fictional-history-fixture', surfaceKey: 'home', state: 'completed',
    accessHash: template.accessHash, leaseUntil: template.leaseUntil, finishedAt: template.finishedAt,
    createdAt: new Date(Date.now() - 180_000 + index * 1000),
  })));
  await db('chatMessages').insert(ordinaryIds.flatMap(turnId => [
    { id: randomUUID(), turnId, role: 'user', text: 'Fictional ordinary history question.' },
    { id: randomUUID(), turnId, role: 'assistant', text: 'Fictional ordinary history answer.' },
  ]));
  expect(await db('chatTurns').whereIn('id', ordinaryIds).whereNotNull('proposalFamilies')).toHaveLength(0);
  const ids = [accepted.turnId, ...ordinaryIds, randomUUID()];
  for (const identity of [
    { workspaceId, userId: ownerId },
    { workspaceId, userId: fieldId },
  ]) {
    const measured = await measurePresence(identity, ids);
    expect(measured.totals).toMatchObject({ calls: 1, read: 1, failed: 0, pending: 0 });
    expect(measured.result(accepted.turnId, 'action')).toBe(identity.userId === ownerId && identity.workspaceId === workspaceId);
    expect(measured.result(accepted.turnId, 'estimateDraft')).toBe(false);
    for (const id of ids.slice(1)) expect(measured.result(id, 'action')).toBe(false);
  }
  await expect(measurePresence({ workspaceId: randomUUID(), userId: ownerId }, ids, undefined,
    { workspaceId, userId: ownerId })).rejects.toThrow();
  const history = await owner.get(`/api/chat/threads?workspace=${workspaceId}&thread=${accepted.threadId}`);
  expect(history.status()).toBe(200);
  const saved = await history.json();
  expect(saved.turns).toHaveLength(49);
  expect(saved.turns.find((turn: { id: string }) => turn.id === accepted.turnId).action).toEqual(proposed.action);
  expect(saved.turns.filter((turn: { action?: unknown }) => turn.action)).toHaveLength(1);
  const denied = await field.get(`/api/chat/threads?workspace=${workspaceId}&thread=${accepted.threadId}`);
  expect(denied.status()).toBe(403);
  const followUp = await ask(owner, {
    threadId: accepted.threadId, message: 'fixture:database:fixture:context-counts', surfaceKey: 'home',
  });
  expect(followUp.events.at(-1)?.type).toBe('turn.completed');
  const followed = followUp.events.find(event => event.type === 'turn.accepted');
  if (followed?.type !== 'turn.accepted') throw new Error('Missing accepted history follow-up.');
  await expectNoGraphCheckpoints();
  console.log('CHAT_DATABASE_BENCHMARK ' + JSON.stringify({
    workload: 'history-50', measurementId: followUp.response.headers()['x-chat-database-metrics-id'],
    durationMs: followUp.durationMs,
  }));
});

test('timestamped lead search survives ordinary edits but not assignment revocation', async () => {
  test.skip(live, 'Deterministic snapshot and current-access regression.');
  const filters = { query: '', stages: ['new'], sources: [], ownerIds: [], created: 'any',
    from: '', to: '', attention: false, archived: false };
  const input = { surfaceKey: 'home', message: `fixture:search:${JSON.stringify({ mode: 'filters', filters })}` };
  const result = await ask(owner, input);
  expect(result.events.at(-1)?.type).toBe('turn.completed');
  const accepted = result.events.find(event => event.type === 'turn.accepted');
  const search = result.events.find(event => event.type === 'leads.results');
  if (accepted?.type !== 'turn.accepted' || search?.type !== 'leads.results') throw new Error('Missing lead snapshot.');
  expect(search.result.asOf).toBeTruthy();
  expect(search.result.total).toBe(3);
  try {
    await db('leads').where({ id: leadIds[2], workspaceId }).update({ stage: 'contacted' });
    const restored = await owner.get(`/api/chat/threads?workspace=${workspaceId}&thread=${accepted.threadId}`);
    expect(restored.status()).toBe(200);
    const history = await restored.json();
    expect(history.turns[0].searchResult).toEqual(search.result);
    const navigationInput = { workspaceId, resultId: accepted.turnId, leadId: search.result.rows[0].id };
    expect((await owner.post('/api/chat/leads/navigation', { headers, data: navigationInput })).status()).toBe(200);
    expect((await owner.post('/api/chat/leads/navigation', { headers, data: {
      ...navigationInput, leadId: randomUUID(),
    } })).status()).toBe(403);
    const followUp = await ask(owner, { ...input, threadId: accepted.threadId, message: 'fixture:search-history' });
    expect(followUp.events.at(-1)?.type).toBe('turn.completed');
    expect(followUp.events.filter(event => event.type === 'message.delta').map(event => event.text).join(''))
      .toContain(search.result.asOf!);
    const assigned = await ask(field, input);
    expect(assigned.events.at(-1)?.type).toBe('turn.completed');
    const assignedTurn = assigned.events.find(event => event.type === 'turn.accepted');
    const assignedSearch = assigned.events.find(event => event.type === 'leads.results');
    if (assignedTurn?.type !== 'turn.accepted' || assignedSearch?.type !== 'leads.results') throw new Error('Missing assigned search.');
    const assignedNavigation = { workspaceId, resultId: assignedTurn.turnId, leadId: assignedSearch.result.rows[0].id };
    expect((await field.post('/api/chat/leads/navigation', { headers, data: assignedNavigation })).status()).toBe(200);
    expect((await owner.post('/api/chat/leads/navigation', { headers, data: assignedNavigation })).status()).toBe(403);
    await db('leads').where({ id: leadIds[0], workspaceId }).update({ ownerId });
    expect((await field.post('/api/chat/leads/navigation', { headers, data: assignedNavigation })).status()).toBe(403);
    const denied = await field.get(`/api/chat/threads?workspace=${workspaceId}&thread=${assignedTurn.threadId}`);
    expect(denied.status()).toBe(200);
    const restricted = await denied.json();
    expect(restricted.turns[0].searchResult).toBeUndefined();
    expect(restricted.messages.find((message: { role: string }) => message.role === 'assistant').text)
      .toBe(chatStoreData.restricted);
  } finally {
    await db('leads').where({ id: leadIds[2], workspaceId }).update({ stage: 'new' });
    await db('leads').where({ id: leadIds[0], workspaceId }).update({ ownerId: fieldId });
  }
});

test('Customer navigation reuses request authority and rechecks later revocation', async () => {
  test.skip(live, 'Deterministic Customer navigation boundary.');
  const customerId = randomUUID();
  await db('customers').insert({ id: customerId, workspaceId, name: 'Fictional navigation Customer',
    type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '' });
  try {
    const result = await ask(owner, { surfaceKey: 'home', message: `fixture:customer:${JSON.stringify({
      tool: 'customers_query', request: { operation: 'details', input: { customerRef: customerId } },
    })}` });
    expect(result.events.at(-1)?.type).toBe('turn.completed');
    const accepted = result.events.find(event => event.type === 'turn.accepted');
    const card = result.events.find(event => event.type === 'customers.result');
    if (accepted?.type !== 'turn.accepted' || card?.type !== 'customers.result') throw Error('Missing Customer result.');
    const data = { workspaceId, turnId: accepted.turnId, recordId: customerId, kind: 'customer' };
    const opened = await owner.post('/api/chat/customers/navigate', { headers, data });
    expect(opened.status()).toBe(200);
    expect((await opened.json()).href).toBe(`/customers/${customerId}?workspace=${workspaceId}`);
    expect((await field.post('/api/chat/customers/navigate', { headers, data })).status()).toBe(404);
    const grants = await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'customers.read' });
    try {
      await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'customers.read' }).delete();
      expect((await owner.post('/api/chat/customers/navigate', { headers, data })).status()).toBe(404);
    } finally { await db('workspaceRolePolicies').insert(grants); }
  } finally { await db('customers').where({ workspaceId, id: customerId }).delete(); }
});

test('Calendar navigation and proposal history reuse one authority transaction and recheck revocation', async () => {
  test.skip(live, 'Deterministic Calendar navigation and history boundary.');
  const customerId = randomUUID();
  await db('customers').insert({ id: customerId, workspaceId, name: 'Fictional Calendar navigation Customer',
    type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '' });
  let jobId: string | undefined;
  try {
    const job = await createJob(db, { userId: ownerId, workspaceId }, permissionIds, {
      workspaceId, submissionId: randomUUID(), customerId, title: 'Fictional navigation Job',
      primaryOwnerId: ownerId, scheduledDate: '2026-11-09',
    });
    jobId = job.jobId;
    const result = await ask(owner, { surfaceKey: 'home', message: `fixture:calendar:${JSON.stringify({
      operation: 'schedule', date: '2026-11-09', usePageFilters: false,
    })}` });
    expect(result.events.at(-1)?.type).toBe('turn.completed');
    const accepted = result.events.find(event => event.type === 'turn.accepted');
    const card = result.events.find(event => event.type === 'calendar.result');
    if (accepted?.type !== 'turn.accepted' || card?.type !== 'calendar.result' || card.result.mode === 'availability')
      throw Error('Missing Calendar result.');
    const visit = card.result.visits.find(visit => visit.records.some(record => record.id === jobId));
    if (!visit) throw Error('Missing authorized navigation visit.');
    const data = { workspaceId, turnId: accepted.turnId, resultId: card.result.id, visitId: visit.id };
    expect((await owner.post('/api/chat/calendar', { headers, data })).status()).toBe(200);
    expect((await field.post('/api/chat/calendar', { headers, data })).status()).toBe(403);
    const row = await db('jobs').where({ workspaceId, id: jobId }).first('jobNumber');
    const proposal = await ask(owner, { surfaceKey: 'home', message: `fixture:database:fixture:calendar-propose:${JSON.stringify({
      operation: 'schedule', recordRef: `J-${row.jobNumber}`, scheduledDate: '2026-11-10', arrivalWindow: '12:00-14:00',
    })}` });
    expect(proposal.events.at(-1)?.type).toBe('turn.completed');
    const source = proposal.events.find(event => event.type === 'turn.accepted');
    const ticket = proposal.events.find(event => event.type === 'calendar.proposal');
    if (source?.type !== 'turn.accepted' || ticket?.type !== 'calendar.proposal') throw Error('Missing Calendar proposal.');
    console.log('CHAT_DOMAIN_DATABASE_BENCHMARK ' + JSON.stringify({
      workload: 'calendar_propose_action', measurementId: proposal.response.headers()['x-chat-database-metrics-id'],
    }));
    const proposalUrl = `/api/chat/calendar/proposals?${new URLSearchParams({
      workspaceId, proposalId: ticket.result.proposalId, inputHash: ticket.result.inputHash,
      visitId: ticket.result.visitId, revision: ticket.result.revision,
    })}`;
    const visible = await owner.get(proposalUrl);
    expect(visible.status()).toBe(200);
    expect((await visible.json()).view.draft.id).toBe(ticket.result.proposalId);
    const historyUrl = `/api/chat/threads?workspace=${workspaceId}&thread=${source.threadId}`;
    expect((await (await owner.get(historyUrl)).json()).turns[0].calendarProposal).toBeTruthy();
    const grants = await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'calendar.read' });
    try {
      await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'calendar.read' }).delete();
      expect((await owner.post('/api/chat/calendar', { headers, data })).status()).toBe(403);
      expect((await (await owner.get(historyUrl)).json()).turns[0].calendarProposal).toBeUndefined();
    } finally { await db('workspaceRolePolicies').insert(grants); }
  } finally {
    if (jobId) await db('jobs').where({ workspaceId, id: jobId }).delete();
    await db('customers').where({ workspaceId, id: customerId }).delete();
  }
});

test('benchmark current open leads with streamed event and phase timing', async () => {
  test.skip(!live, 'Opt-in real-provider benchmark against fictional records.');
  test.setTimeout(240_000);
  const cookies = (await owner.storageState()).cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
  for (let sample = 1; sample <= 3; sample++) {
    const started = performance.now();
    const response = await fetch(`${origin}/api/chat/turns`, {
      method: 'POST', headers: { ...headers, Cookie: cookies, 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, surfaceKey: 'home', clientTurnId: randomUUID(),
        message: 'what are the current open leads?' }),
      signal: AbortSignal.timeout(90_000),
    });
    expect(response.status).toBe(200);
    if (!response.body) throw new Error('Missing benchmark stream.');
    const reader = response.body.getReader(), decoder = new TextDecoder();
    let buffer = '', turnId: string | undefined, terminal: string | undefined;
    const timings: Record<string, number> = { headersMs: Math.round(performance.now() - started) };
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let end;
      while ((end = buffer.indexOf('\n\n')) >= 0) {
        const frame = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        if (!frame.startsWith('data:')) continue;
        const event = chatStreamEventSchema.parse(JSON.parse(frame.slice(5)));
        const elapsed = Math.round(performance.now() - started);
        if (event.type === 'turn.accepted') { turnId = event.turnId; timings.acceptedMs = elapsed; }
        if (event.type === 'status' && event.status === 'retrieving') timings.retrievingMs ??= elapsed;
        if (event.type === 'message.delta') timings.firstTextMs ??= elapsed;
        if (['turn.completed', 'turn.failed', 'turn.cancelled'].includes(event.type)) {
          terminal = event.type;
          timings.terminalMs = elapsed;
        }
      }
    }
    expect(terminal).toBe('turn.completed');
    if (!turnId) throw new Error('Missing accepted benchmark turn.');
    const turn = await db('chatTurns').where({ id: turnId, workspaceId }).first('createdAt', 'finishedAt');
    const usage = await db('aiUsageCalls').where({ turnId }).orderBy('startedAt')
      .select('phase', 'outcome', 'startedAt', 'finishedAt', 'inputTokens', 'outputTokens', 'cachedInputTokens');
    console.log('OPEN_LEADS_BENCHMARK ' + JSON.stringify({
      sample, intentRouting: process.env.CHAT_INTENT_ROUTING === 'true', ...timings,
      durableTurnMs: +new Date(turn.finishedAt) - +new Date(turn.createdAt),
      phases: usage.map(call => ({
        phase: call.phase, outcome: call.outcome,
        startOffsetMs: +new Date(call.startedAt) - +new Date(turn.createdAt),
        durationMs: +new Date(call.finishedAt) - +new Date(call.startedAt),
        inputTokens: call.inputTokens, outputTokens: call.outputTokens, cachedInputTokens: call.cachedInputTokens,
      })),
    }));
  }
});

test('live non-report lead answer completes through authenticated runtime provenance', async () => {
  test.skip(!live, 'Real adapter selection requires the opt-in provider.');
  test.setTimeout(90_000);
  const count = await db('leads').where({ workspaceId, stage: 'new' }).whereNull('archivedAt').count('* as total').first();
  const total = Number(count?.total);
  expect(total).toBe(3);
  const result = await ask(owner, {
    surfaceKey: 'home',
    message: 'Use the current lead pipeline summary (leads_query, not Reports) to tell me how many New leads I can access. Give the numeric count.',
  });
  expect(result.events.at(-1)?.type).toBe('turn.completed');
  expect(result.events.some(event => event.type === 'report.result')).toBe(false);
  const text = result.events.filter(event => event.type === 'message.delta').map(event => event.text).join('');
  expect(text).toMatch(new RegExp(`\\b${total}\\b`));
  const accepted = result.events.find(event => event.type === 'turn.accepted');
  if (!accepted || accepted.type !== 'turn.accepted') throw new Error('Missing accepted lead answer.');
  const saved = await db('chatTurns').where({ id: accepted.turnId, workspaceId, userId: ownerId }).first();
  expect(saved.state).toBe('completed');
  const usage = await db('aiUsageCalls').where({ turnId: accepted.turnId }).select('phase', 'outcome');
  expect(usage).toEqual(expect.arrayContaining([
    expect.objectContaining({ phase: 'planning', outcome: 'completed' }),
    expect.objectContaining({ phase: 'answer', outcome: 'completed' }),
  ]));
});

test('assigned scope, cross-user denial and revocation protect native results and restored narrative', async () => {
  test.skip(live, 'Deterministic authorization checks; real database enforcement remains enabled.');
  const applied = context(selection('leads'));
  const result = await ask(field, { message: fixture(), reportContext: applied });
  expect(result.events.at(-1)?.type).toBe('turn.completed');
  const accepted = result.events.find(event => event.type === 'turn.accepted');
  const ticket = result.events.find(event => event.type === 'report.result');
  if (!accepted || accepted.type !== 'turn.accepted' || !ticket || ticket.type !== 'report.result') throw new Error('Missing assigned report.');
  const saved = await db('chatTurns').where({ id: accepted.turnId, workspaceId, userId: fieldId }).first();
  const snapshot = reportAssistantReadSnapshotSchema.parse(saved.reportSnapshot);
  expect(snapshot.native.area).toBe('leads');
  if (snapshot.native.area !== 'leads' || snapshot.native.read.report.view !== 'intake') throw new Error('Expected Lead intake.');
  expect(snapshot.native.read.report.total).toBe(1);
  const params = new URLSearchParams({ workspaceId, turnId: accepted.turnId, resultId: ticket.result.id });
  for (const client of [owner, outsider]) expect((await client.get(`/api/chat/reports?${params}`)).status()).toBe(403);
  await db('leads').where({ id: leadIds[0], workspaceId }).update({ ownerId });
  expect((await field.get(`/api/chat/reports?${params}`)).status()).toBe(403);
  expect((await field.post('/api/chat/reports', { headers, data: Object.fromEntries(params) })).status()).toBe(403);
  const history = await field.get(`/api/chat/threads?workspace=${workspaceId}&thread=${accepted.threadId}`);
  expect(history.status()).toBe(200);
  const body = await history.json();
  expect(body.turns.find((turn: { id: string }) => turn.id === accepted.turnId).reportStatus).toBe('restricted');
  expect(body.messages.filter((message: { role: string }) => message.role === 'assistant')
    .every((message: { text: string }) => message.text === chatStoreData.restricted)).toBe(true);
});

test('Stop cancels a pending native report and reload never restores its unfinished facts', async ({ page }) => {
  test.setTimeout(90_000);
  test.skip(live, 'Deterministic cancellation avoids racing a billable provider.');
  await page.context().addCookies((await owner.storageState()).cookies);
  await page.goto(reportHref(selection('leads')));
  await page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click();
  const request = page.waitForRequest(request => request.url().endsWith('/api/chat/turns') && request.method() === 'POST');
  await page.getByRole('textbox', { name: 'Ask the SalesMora assistant', exact: true }).fill(fixture(undefined, true));
  await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  const payload = (await request).postDataJSON();
  await expect(page.getByRole('log')).toContainText('Checking the authorized native report.', { timeout: 30_000 });
  const readTranscript = async () => {
    const turn = await db('chatTurns').where({ workspaceId, clientTurnId: payload.clientTurnId }).first('id');
    return (await db('chatMessages').where({ turnId: turn.id, role: 'assistant' }).first('text')).text;
  };
  expect(await readTranscript()).toBe('');
  await page.waitForTimeout(5_500);
  expect(await readTranscript()).toBe('');
  await page.getByRole('button', { name: 'Stop response', exact: true }).click();
  await expect(page.getByText('Response stopped. You can retry when ready.', { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click();
  await expect(page.getByRole('log')).not.toContainText('Checking the authorized native report.');
  await expect(page.getByRole('button', { name: copy.open, exact: true })).not.toBeVisible();
});

test('Financial revocation clears a restored card and its cached narrative before navigation', async ({ page }) => {
  test.setTimeout(90_000);
  test.skip(live, 'Deterministic revocation uses actual HTTP authorization without provider usage.');
  await page.context().addCookies((await owner.storageState()).cookies);
  await page.goto(reportHref(selection('financial')));
  await page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click();
  await page.getByRole('textbox', { name: 'Ask the SalesMora assistant', exact: true }).fill(fixture());
  await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  await expect(page.getByRole('button', { name: copy.open, exact: true })).toBeVisible({ timeout: 30_000 });
  await page.reload();
  await page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click();
  await expect(page.getByRole('button', { name: copy.open, exact: true })).toBeVisible();
  await changeFinancialAccess(false);
  try {
    await page.getByRole('button', { name: copy.open, exact: true }).click();
    await expect(page.getByRole('log')).toContainText(connectedAssistantData.reportChanged);
    await expect(page.getByRole('log')).not.toContainText('Review the report card for native totals');
    await expect(page.getByRole('button', { name: copy.open, exact: true })).not.toBeVisible();
    await expect(page).toHaveURL(reportHref(selection('financial')));
  } finally { await changeFinancialAccess(true); }
});

test('canonical Lead review survives browser reload, confirmation and inherited follow-up', async ({ page }) => {
  test.skip(live, 'Deterministic proposal review does not need a live provider.');
  test.skip((await db('chatProposalStorage').where({ id: 1 }).first('store'))?.store !== 'canonical',
    'Requires committed canonical proposal authority.');
  test.setTimeout(120_000);
  await page.context().addCookies((await owner.storageState()).cookies);
  await page.goto(`/home?workspace=${workspaceId}`);
  const open = () => page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click();
  await open();
  const request = page.waitForRequest(item => item.url().endsWith('/api/chat/turns') && item.method() === 'POST');
  await page.getByRole('textbox', { name: 'Ask the SalesMora assistant', exact: true }).fill('fixture:draft');
  await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  const { clientTurnId } = (await request).postDataJSON() as { clientTurnId: string };
  const card = page.getByRole('region', { name: 'Review lead draft' });
  await expect(card.getByRole('button', { name: 'Confirm and create lead' })).toBeEnabled({ timeout: 30_000 });
  const turn = await db('chatTurns').where({ workspaceId, userId: ownerId, clientTurnId }).first('id', 'threadId');
  expect(turn).toBeDefined();
  const proposal = await db('chatProposals').where({ workspaceId, userId: ownerId, turnId: turn.id, family: 'action' }).first('id', 'state');
  expect(proposal?.state).toBe('pending');
  await page.reload();
  await open();
  await expect(card).toContainText('Fictional draft customer', { timeout: 30_000 });
  await card.getByRole('button', { name: 'Confirm and create lead' }).click();
  await expect(card.getByRole('status')).toHaveText('Lead created', { timeout: 30_000 });
  expect((await db('chatProposals').where({ family: 'action', id: proposal.id }).first('state')).state).toBe('confirmed');
  await page.reload();
  await open();
  await expect(card.getByRole('status')).toHaveText('Lead created', { timeout: 30_000 });
  const followed = await ask(owner, { surfaceKey: 'home', threadId: turn.threadId, message: 'fixture:database:fixture:context-counts' });
  expect(followed.events.at(-1)?.type).toBe('turn.completed');
  const accepted = followed.events.find(event => event.type === 'turn.accepted');
  if (accepted?.type !== 'turn.accepted') throw new Error('Missing inherited Lead follow-up.');
  expect((await db('chatTurns').where({ id: accepted.turnId }).first('historyEvidence')).historyEvidence).toContain(turn.id);
});

for (const family of ['workOrder', 'material'] as const) {
  test(`canonical ${family} review, confirmation and inherited history survive browser reload`, async ({ page }) => {
    test.skip(live, 'Deterministic proposal review does not need a live provider.');
    test.skip((await db('chatProposalStorage').where({ id: 1 }).first('store'))?.store !== 'canonical',
      'Requires committed canonical proposal authority.');
    test.setTimeout(120_000);
    const nullable = (keys: string) => Object.fromEntries(keys.split(' ').map(key => [key, null]));
    const order = await db('workOrders').where({ workspaceId }).first('id', 'workOrderNumber');
    if (!order) throw new Error('Missing isolated Work Order fixture.');
    const value = family === 'workOrder' ? 'Fictional browser crew note' : 'Fictional browser catalog item';
    const args = family === 'workOrder' ? {
      ...nullable('jobNumber title instructions safetyNotes scheduledDate arrivalWindow assignee crew tasks taskLabel done materials status reason summary overrideReason query filterStatus mine when columns'),
      operation: 'add_note', workOrderNumber: `WO-${order.workOrderNumber}`, body: value,
    } : {
      ...nullable('target sku unit category supplier costDollars priceDollars notes sourceUrl'),
      operation: 'create', name: value,
    };
    const name = family === 'workOrder' ? 'work_orders_propose_action' : 'materials_propose_action';
    const title = family === 'workOrder' ? 'Add work order note' : 'Add catalog item';
    await page.context().addCookies((await owner.storageState()).cookies);
    await page.goto(`/home?workspace=${workspaceId}`);
    const open = () => page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click();
    await open();
    const request = page.waitForRequest(item => item.url().endsWith('/api/chat/turns') && item.method() === 'POST');
    await page.getByRole('textbox', { name: 'Ask the SalesMora assistant', exact: true })
      .fill(`fixture:tool:${JSON.stringify({ name, args })}`);
    await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
    const { clientTurnId } = (await request).postDataJSON() as { clientTurnId: string };
    const card = page.getByRole('region', { name: title, exact: true });
    await expect(card.getByRole('button', { name: 'Confirm change', exact: true })).toBeEnabled();
    const turn = await db('chatTurns').where({ workspaceId, userId: ownerId, clientTurnId }).first('id', 'threadId');
    if (!turn) throw new Error('Missing proposal turn.');
    const proposal = await db('chatProposals').where({ workspaceId, userId: ownerId, turnId: turn.id, family })
      .first('id', 'state');
    expect(proposal?.state).toBe('pending');
    await page.reload();
    await open();
    await expect(card).toContainText(value);
    await card.getByRole('button', { name: 'Confirm change', exact: true }).click();
    await expect(card.getByRole('status')).toHaveText('Change confirmed');
    expect((await db('chatProposals').where({ family, id: proposal.id }).first('state')).state).toBe('confirmed');
    if (family === 'workOrder') {
      expect(await db('workOrderActivity').where({ workspaceId, workOrderId: order.id, type: 'note' })
        .whereRaw('"changes"::text like ?', [`%${value}%`])).toHaveLength(1);
    } else {
      expect(await db('materialCatalog').where({ workspaceId, name: value })).toHaveLength(1);
    }
    await page.reload();
    await open();
    await expect(card.getByRole('status')).toHaveText('Change confirmed');
    const followed = await ask(owner, { surfaceKey: 'home', threadId: turn.threadId, message: 'fixture:database:fixture:context-counts' });
    expect(followed.events.at(-1)?.type).toBe('turn.completed');
    const accepted = followed.events.find(event => event.type === 'turn.accepted');
    if (accepted?.type !== 'turn.accepted') throw new Error('Missing inherited proposal follow-up.');
    expect((await db('chatTurns').where({ id: accepted.turnId }).first('historyEvidence')).historyEvidence).toContain(turn.id);
    const restored = await owner.get(`/api/chat/threads?workspace=${workspaceId}&thread=${turn.threadId}`);
    expect(restored.status()).toBe(200);
    const messages = (await restored.json()).messages.filter((message: { turnId: string; role: string }) =>
      [turn.id, accepted.turnId].includes(message.turnId) && message.role === 'assistant');
    expect(messages).toHaveLength(2);
    expect(messages.every((message: { text: string }) => message.text && message.text !== chatStoreData.restricted)).toBe(true);
  });
}

test('canonical Estimate Draft review and saved receipt survive browser reload', async ({ page }) => {
  test.skip(live, 'Deterministic proposal review does not need a live provider.');
  test.skip((await db('chatProposalStorage').where({ id: 1 }).first('store'))?.store !== 'canonical',
    'Requires committed canonical proposal authority.');
  test.setTimeout(120_000);
  const request = {
    operation: 'create', parentType: 'lead', parentRef: leadIds[1], estimateRef: null,
    changes: {
      name: 'Fictional browser Estimate', scope: null, message: null, paymentTerms: null, termsNote: null,
      validUntil: null, discount: null, taxRate: '0', deposit: null,
      items: [{ savedLineId: null, description: 'Repair', quantity: '1', unit: 'each', taxable: false,
        included: false, unitPrice: '100.00', priceSource: 'user', priceQuote: '100.00', catalogRef: null }],
    },
  };
  await page.context().addCookies((await owner.storageState()).cookies);
  await page.goto(`/home?workspace=${workspaceId}`);
  const open = () => page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click();
  await open();
  await page.getByRole('textbox', { name: 'Ask the SalesMora assistant', exact: true })
    .fill(`fixture:estimate-draft:${JSON.stringify({ request })}`);
  await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  const confirm = page.getByRole('button', { name: 'Confirm Draft creation', exact: true });
  await expect(confirm).toBeEnabled({ timeout: 30_000 });
  await page.reload();
  await open();
  await expect(confirm).toBeEnabled({ timeout: 30_000 });
  await confirm.click();
  await expect(page.getByText('The host reports this Draft proposal was saved.', { exact: true })).toBeVisible({ timeout: 30_000 });
  await page.reload();
  await open();
  await expect(page.getByRole('button', { name: 'Open saved Draft', exact: true })).toBeVisible({ timeout: 30_000 });
});

test('canonical Calendar review and saved receipt survive browser reload', async ({ page }) => {
  test.skip(live, 'Deterministic proposal review does not need a live provider.');
  test.skip((await db('chatProposalStorage').where({ id: 1 }).first('store'))?.store !== 'canonical',
    'Requires committed canonical proposal authority.');
  test.setTimeout(120_000);
  const customerId = randomUUID();
  await db('customers').insert({ id: customerId, workspaceId, name: 'Fictional Calendar browser Customer',
    type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '' });
  const created = await createJob(db, { userId: ownerId, workspaceId }, permissionIds, {
    workspaceId, submissionId: randomUUID(), customerId, title: 'Fictional Calendar browser Job',
    primaryOwnerId: ownerId, scheduledDate: '2026-11-09',
  });
  const job = await db('jobs').where({ workspaceId, id: created.jobId }).first('jobNumber');
  if (!job) throw new Error('Missing Calendar browser fixture Job.');
  await page.context().addCookies((await owner.storageState()).cookies);
  await page.goto(`/home?workspace=${workspaceId}`);
  const open = () => page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }).click();
  await open();
  await page.getByRole('textbox', { name: 'Ask the SalesMora assistant', exact: true }).fill(
    `fixture:calendar-propose:${JSON.stringify({
      operation: 'schedule', recordRef: `J-${job.jobNumber}`, scheduledDate: '2026-11-10', arrivalWindow: '12:00-14:00',
    })}`,
  );
  await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  const card = page.getByRole('region', { name: 'Review visit schedule' });
  await expect(card.getByRole('button', { name: 'Confirm schedule' })).toBeEnabled({ timeout: 30_000 });
  await page.reload();
  await open();
  await expect(card.getByRole('button', { name: 'Confirm schedule' })).toBeEnabled({ timeout: 30_000 });
  await card.getByRole('button', { name: 'Confirm schedule' }).click();
  await expect(card.getByRole('status')).toHaveText(/Schedule saved/, { timeout: 30_000 });
  await page.reload();
  await open();
  await expect(card.getByRole('status')).toHaveText(/Schedule saved/, { timeout: 30_000 });
});
