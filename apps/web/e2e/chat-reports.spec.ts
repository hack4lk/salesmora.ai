import { randomUUID } from 'node:crypto';
import { expect, request as requests, test, type APIRequestContext } from '@playwright/test';
import { createDatabase } from '@salesmora/data';
import { chatStreamEventSchema, reportAssistantReadSnapshotSchema, reportAssistantResultResponseSchema,
  reportSelectionSchema, reportTemplateAreas, type ReportAssistantToolInput, type ReportSelection, type ReportTemplateArea, type WorkspacePolicy } from '@salesmora/contracts';
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
  test.setTimeout(120_000);
  for (const role of ['owner', 'field', 'outsider']) {
    const client = await requests.newContext({ baseURL: origin });
    clients.push(client);
    const email = `reports-e2e-${randomUUID()}@example.test`;
    const response = await client.post('/api/auth/sign-up/email', { headers, data: {
      name: `Fictional report ${role}`, email, password: 'Fictional-reports-e2e-42!', termsAccepted: true,
    } });
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
      const turns = db('chatTurns').select(db.raw('id::text')).where({ workspaceId });
      for (const table of ['checkpoint_writes', 'checkpoint_blobs', 'checkpoints']) {
        await db(table).whereIn('thread_id', turns.clone()).delete();
      }
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
    expect(usage.filter(call => ['planning', 'answer'].includes(call.phase)).map(call => call.phase).sort()).toEqual(['answer', 'planning']);
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
  await page.getByRole('textbox', { name: 'Ask the SalesMora assistant', exact: true }).fill(fixture(undefined, true));
  await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  await expect(page.getByRole('log')).toContainText('Checking the authorized native report.', { timeout: 30_000 });
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
