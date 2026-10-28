import { test, expect, request as requests, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase, createJob, mutateJob, readWorkOrderCreationVisit, createWorkOrder, mutateWorkOrder } from '@salesmora/data';
import { permissionIds, chatStreamEventSchema } from '@salesmora/contracts';
test.setTimeout(120000);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL || !['localhost','127.0.0.1'].includes(new URL(connection).hostname)) throw Error('Isolated local test database required.');
const db = createDatabase(connection), origin = 'http://127.0.0.1:3002', headers = { Origin: origin }, prefix = randomUUID();
const clients: Record<string, APIRequestContext> = {}, users: Record<string,string> = {};
let workspaceId: string, customerId: string, ownJob: string, hiddenJob: string;
const filters = { date: '2026-10-19', person: 'all', recordType: 'all', status: 'all', customerQuery: '' };
const args = { operation: 'schedule', date: '2026-10-19', usePageFilters: true };
const identity = () => ({ userId: users.owner, workspaceId });
async function turn(role = 'owner', query: Record<string,unknown> = args, extra: Record<string,unknown> = {}) {
  const response = await clients[role].post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId: randomUUID(), surfaceKey: 'calendar', calendarFilters: filters, message: `fixture:calendar:${JSON.stringify(query)}`, ...extra } });
  expect(response.status()).toBe(200);
  return (await response.text()).split('\n\n').filter(frame => frame.startsWith('data:')).map(frame => chatStreamEventSchema.parse(JSON.parse(frame.slice(5))));
}
test.beforeAll(async () => {
  test.setTimeout(120000);
  await db('rateLimits').where('key','like','%/sign-up/email%').delete();
  for (const role of ['owner','field','other']) {
    clients[role] = await requests.newContext({ baseURL: origin }); const email = `${prefix}-${role}@example.test`;
    expect((await clients[role].post('/api/auth/sign-up/email', { headers, data: { name: `Calendar ${role}`, email, password: 'Fictional-calendar-chat-42!', termsAccepted: true } })).status()).toBe(200);
    users[role] = (await db('users').where({ email }).first()).id;
  }
  const response = await clients.owner.post('/api/workspaces', { headers, data: { business: { businessName: 'Calendar chat fixture', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } } });
  expect(response.status()).toBe(201); workspaceId = (await response.json()).workspaceId;
  await db('workspaceMemberships').insert({ workspaceId, userId: users.field, role: 'field' });
  await db('workspaces').where({ id: workspaceId }).update({ timezone: 'America/New_York' });
  customerId = randomUUID();
  await db('customers').insert({ id: customerId, workspaceId, name: 'Calendar Customer', type: 'person', companyName: '', email: 'PRIVATE_CONTACT@example.test', phone: '', location: '', internalNotes: 'PRIVATE_CUSTOMER' });
  ownJob = (await createJob(db, identity(), permissionIds, { workspaceId, submissionId: randomUUID(), customerId, title: 'Visible shared Calendar visit', primaryOwnerId: users.field, description: 'PRIVATE_JOB' })).jobId;
  hiddenJob = (await createJob(db, identity(), permissionIds, { workspaceId, submissionId: randomUUID(), customerId, title: 'PRIVATE_OTHER_VISIT', primaryOwnerId: users.owner })).jobId;
  for (const jobId of [ownJob, hiddenJob]) await mutateJob(db, identity(), permissionIds, { workspaceId, jobId, expectedVersion: 1, submissionId: randomUUID(), action: 'schedule', scheduledDate: '2026-10-20', arrivalWindow: '09:00-11:00' });
  const preview = await readWorkOrderCreationVisit(db, identity(), permissionIds, ownJob); if (!preview) throw Error('Missing visit');
  const order = await createWorkOrder(db, identity(), permissionIds, { workspaceId, jobId: ownJob, submissionId: randomUUID(), title: 'Visible shared Work Order', assigneeId: users.field, visit: { kind: 'job', visitId: preview.id, revision: preview.revision } });
  await mutateWorkOrder(db, identity(), permissionIds, { workspaceId, workOrderId: order.workOrderId, expectedVersion: order.version, submissionId: randomUUID(), action: 'status', to: 'issued', confirmed: true });
  await createJob(db, identity(), permissionIds, { workspaceId, submissionId: randomUUID(), customerId, title: 'Visible unscheduled Calendar visit', primaryOwnerId: users.field });
});
// Independent journeys should not consume each other's ten-turn/minute allowance.
// This only ages completed fixtures in this suite's isolated local workspace.
test.beforeEach(async () => {
  await db('chatTurns').where({ workspaceId }).whereNotIn('state',['accepted','running']).update({ createdAt:new Date(Date.now() - 120000) });
});
test.afterAll(async () => {
  if (workspaceId) { await db('workOrders').where({ workspaceId }).delete(); await db('jobs').where({ workspaceId }).delete(); await db('workspaceSubscriptions').where({ workspaceId }).delete(); await db('workspaces').where({ id: workspaceId }).delete(); }
  await db('users').whereIn('id',Object.values(users)).delete(); await Promise.all(Object.values(clients).map(c => c.dispose())); await db.destroy();
});
test('streams thinking then bounded authorized Calendar rows; saved replay and metadata-only open stay owner-bound', async () => {
  const events = await turn();
  expect(events[1]).toMatchObject({ type: 'status', status: 'thinking' });
  expect(events.at(-1)?.type).toBe('turn.completed');
  const card = events.find(e => e.type === 'calendar.result'); if (card?.type !== 'calendar.result' || card.result.mode === 'availability') throw Error(JSON.stringify(events));
  expect(card.result.total).toBe(2); expect(card.result.visits).toHaveLength(2); expect(card.result.visits.find(v => v.records.length === 2)?.records.map(r => r.type).sort()).toEqual(['job','work_order']);
  expect(card.result.timezone).toBe('America/New_York');
  for (const secret of ['PRIVATE_CONTACT','PRIVATE_CUSTOMER','PRIVATE_JOB','review','expectedVersion']) expect(JSON.stringify(card)).not.toContain(secret);
  const accepted = events[0]; if (accepted.type !== 'turn.accepted') throw Error();
  const params = new URLSearchParams({ workspaceId, turnId: card.turnId, resultId: card.result.id });
  expect((await clients.owner.get(`/api/chat/calendar?${params}`)).status()).toBe(200);
  expect((await clients.field.get(`/api/chat/calendar?${params}`)).status()).toBe(403);
  expect((await clients.other.get(`/api/chat/calendar?${params}`)).status()).toBe(403);
  const open = { workspaceId, turnId: card.turnId, resultId: card.result.id, visitId: card.result.visits[0].id };
  expect((await clients.owner.post('/api/chat/calendar',{ headers: { Origin: 'https://example.test' }, data: open })).status()).toBe(403);
  expect((await clients.owner.post('/api/chat/calendar',{ headers, data: { ...open, visitId: randomUUID() } })).status()).toBe(403);
  const opened = await clients.owner.post('/api/chat/calendar',{ headers, data: open }); expect(opened.status()).toBe(200);
  const href = (await opened.json()).href; expect(href).toContain('/calendar?'); expect(href).toContain(`workspace=${workspaceId}`); expect(href).toContain(`visit=${open.visitId}`);
  const history = await (await clients.owner.get(`/api/chat/threads?workspace=${workspaceId}&thread=${accepted.threadId}`)).json();
  expect(history.turns.find((t: {id:string}) => t.id === card.turnId).calendarResult.id).toBe(card.result.id);
});
test('Field cannot broaden Calendar scope through visible filters; queue and Home use the same read service', async () => {
  const events = await turn('field'); const card = events.find(e => e.type === 'calendar.result'); if (card?.type !== 'calendar.result' || card.result.mode === 'availability') throw Error(JSON.stringify(events));
  expect(card.result.scope).toBe('own'); expect(card.result.total).toBe(1);
  expect(JSON.stringify(events)).not.toContain('PRIVATE_OTHER_VISIT'); expect(card.result.visits[0].crew.map(p => p.id)).toEqual([users.field]);
  const queue = await turn('field',{ ...args, operation: 'unscheduled' }); const list = queue.find(e => e.type === 'calendar.result'); if (list?.type !== 'calendar.result' || list.result.mode === 'availability') throw Error(JSON.stringify(queue));
  expect(list.result.total).toBe(1); expect(list.result.mode).toBe('unscheduled'); expect(list.result.visits[0].scheduledDate).toBeNull();
  const home = await turn('field',args,{ surfaceKey: 'home', calendarFilters: undefined }); expect(home.some(e => e.type === 'calendar.result')).toBe(true);
  expect((await clients.field.post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId: randomUUID(), surfaceKey: 'home', calendarFilters: filters, message: 'forged' } })).status()).toBe(422);
});
test('assignment change invalidates original and inherited Calendar history, card reads and Open', async () => {
  const events = await turn('field'); const card = events.find(e => e.type === 'calendar.result'); if (card?.type !== 'calendar.result' || card.result.mode === 'availability' || events[0].type !== 'turn.accepted') throw Error(JSON.stringify(events));
  const threadId = events[0].threadId;
  const inherited = await turn('field',args,{ threadId, message: 'fixture:calendar-history' }); expect(inherited.at(-1)?.type).toBe('turn.completed');
  const before = (await db('jobs').where({ id: ownJob }).first()).version;
  await mutateJob(db, identity(), permissionIds, { workspaceId, jobId: ownJob, expectedVersion: before, submissionId: randomUUID(), action: 'assign', primaryOwnerId: users.owner, teamUserIds: [] });
  const params = new URLSearchParams({ workspaceId, turnId: card.turnId, resultId: card.result.id });
  expect((await clients.field.get(`/api/chat/calendar?${params}`)).status()).toBe(403);
  expect((await clients.field.post('/api/chat/calendar',{ headers, data: { workspaceId, turnId: card.turnId, resultId: card.result.id } })).status()).toBe(403);
  const history = await (await clients.field.get(`/api/chat/threads?workspace=${workspaceId}&thread=${threadId}`)).json();
  expect(JSON.stringify(history.turns)).not.toContain('Visible shared Calendar visit');
  expect(history.messages.filter((m: { role:string }) => m.role === 'assistant').every((m: {text:string}) => !m.text.includes('Visible shared Calendar visit'))).toBe(true);
  const row = await db('chatTurns').where({ id: inherited[0].turnId }).first(); expect(row.calendarStamp).toMatch(/^[a-f0-9]{64}$/);
  await mutateJob(db, identity(), permissionIds, { workspaceId, jobId: ownJob, expectedVersion: before + 1, submissionId: randomUUID(), action: 'assign', primaryOwnerId: users.field, teamUserIds: [] });
});
test('Calendar page supplies a removable week context and the live assistant shows the approved read card', async ({ browser }) => {
  const context = await browser.newContext({ storageState: await clients.owner.storageState() }), page = await context.newPage();
  try {
    await page.goto(`/calendar?workspace=${workspaceId}&date=2026-10-19`);
    const launcher = page.getByRole('button',{ name: /assistant/i }).last();
    await launcher.click();
    const dialog = page.getByRole('dialog'); await expect(dialog.getByText(/Using Week of Oct 19, 2026/)).toBeVisible();
    await dialog.getByRole('button', { name: /Clear assistant context: Using Week of/ }).click();
    await expect(dialog.getByText(/Using Week of Oct 19, 2026/)).not.toBeVisible();
    await page.reload(); await page.getByRole('button', { name: /SalesMora assistant/i }).click();
    await expect(dialog.getByText(/Using Week of Oct 19, 2026/)).toBeVisible();
    const input = dialog.getByRole('textbox'); await input.fill(`fixture:calendar:${JSON.stringify(args)}`);
    await dialog.getByRole('button',{ name: 'Ask assistant', exact: true }).click();
    await expect(dialog.getByRole('region',{ name: 'Calendar visits', exact: true })).toBeVisible({ timeout: 30000 });
    await expect(dialog.getByRole('button',{ name: 'Open in Calendar', exact: true })).toBeEnabled();
    await dialog.getByRole('button',{ name: 'Open in Calendar', exact: true }).click();
    await expect(page).toHaveURL(/\/calendar\?/); await expect(dialog).not.toBeVisible();
  } finally { await context.close(); }
});

for (const operation of ['schedule','availability'] as const) test(`permission revocation during ${operation} streaming withholds subsequent Calendar data`, async () => {
  const clientTurnId = randomUUID();
  const pending = clients.field.post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId, surfaceKey: 'calendar', calendarFilters: filters, message: `fixture:calendar-slow:${JSON.stringify(operation === 'availability' ? { ...args,operation,person:'me' } : args)}` } });
  await expect.poll(async () => !!await db('chatTurns').where({ workspaceId, clientTurnId }).whereNotNull('calendarStamp').first('id')).toBe(true);
  const grants = await db('workspaceRolePolicies').where({ workspaceId, role: 'field', permission: 'calendar.read' });
  try {
    await db('workspaceRolePolicies').where({ workspaceId, role: 'field', permission: 'calendar.read' }).delete();
    const response = await pending; const body = await response.text();
    expect(body).not.toContain('Visible shared Calendar visit'); expect(body).not.toContain('calendar.result');
    const row = await db('chatTurns').where({ workspaceId, clientTurnId }).first(); expect(row.state).not.toBe('completed');
  } finally { if (grants.length) await db('workspaceRolePolicies').insert(grants); }
});

test('Calendar reads cap rows while retaining authorized visit totals', async () => {
  const ids: string[] = [];
  try {
    for (let i = 0; i < 27; i++) ids.push((await createJob(db, identity(), permissionIds, { workspaceId, customerId, submissionId: randomUUID(), title: `Bounded visit ${i}`, primaryOwnerId: users.owner, scheduledDate: '2026-10-21' })).jobId);
    const events = await turn(); const card = events.find(e => e.type === 'calendar.result'); if (card?.type !== 'calendar.result' || card.result.mode === 'availability') throw Error(JSON.stringify(events));
    expect(card.result.total).toBe(29); expect(card.result.visits).toHaveLength(25);
    expect(JSON.stringify(card).length).toBeLessThan(64000);
    const advice = await turn('owner',{ operation:'availability',date:'2026-10-21',person:'me',arrivalWindow:'09:00-11:00',usePageFilters:true },{ calendarFilters:{ ...filters,recordType:'work_order',customerQuery:'Hidden by UI filter' } });
    const suggested = advice.find(e => e.type === 'calendar.result'); if (suggested?.type !== 'calendar.result' || suggested.result.mode !== 'availability') throw Error(JSON.stringify(advice));
    expect(suggested.result.suggestions[0]).toMatchObject({ visitCount:27,unknownWindowCount:27,timing:'not-checked' });
  } finally { if (ids.length) await db('jobs').whereIn('id',ids).delete(); }
});

test('date advice uses complete authorized counts, frozen date/person navigation and inherited evidence', async () => {
  const query = { operation:'availability', date:'2026-10-20', to:null, person:'Calendar field', arrivalWindow:null, includeWeekends:false, usePageFilters:true };
  const events = await turn('owner',query,{ calendarFilters:{ ...filters, recordType:'job', customerQuery:'No matching customer' } });
  const card = events.find(e => e.type === 'calendar.result');
  if (card?.type !== 'calendar.result' || card.result.mode !== 'availability' || events[0].type !== 'turn.accepted') throw Error(JSON.stringify(events));
  expect(events[1]).toMatchObject({ type:'status', status:'thinking' }); expect(events.at(-1)?.type).toBe('turn.completed');
  expect(card.result.people).toEqual([{ id:users.field,name:'Calendar field' }]);
  expect(card.result.suggestions[0]).toMatchObject({ date:'2026-10-20', visitCount:1, unknownWindowCount:0, timing:'not-checked' });
  expect(JSON.stringify(card)).not.toContain('PRIVATE_');
  const body = { workspaceId, turnId:card.turnId, resultId:card.result.id, suggestionId:card.result.suggestions[0].id };
  const opened = await clients.owner.post('/api/chat/calendar',{ headers,data:body }); expect(opened.status()).toBe(200);
  const url = new URL((await opened.json()).href,origin); expect(url.searchParams.get('date')).toBe('2026-10-20'); expect(url.searchParams.get('person')).toBe(`member:${users.field}`); expect(url.searchParams.get('recordType')).toBe('all'); expect(url.searchParams.get('customerQuery')).toBe('');
  expect((await clients.field.post('/api/chat/calendar',{ headers,data:body })).status()).toBe(403);
  expect((await clients.owner.post('/api/chat/calendar',{ headers,data:{ ...body,suggestionId:randomUUID() } })).status()).toBe(403);
  expect((await clients.owner.post('/api/chat/calendar',{ headers,data:{ ...body,date:'2026-10-22' } })).status()).toBe(422);
  expect((await clients.owner.post('/api/chat/calendar',{ headers,data:{ ...body,visitId:randomUUID() } })).status()).toBe(422);
  const inherited = await turn('owner',args,{ threadId:events[0].threadId,message:'fixture:calendar-history' });
  expect(inherited.at(-1)?.type).toBe('turn.completed');
  const version = (await db('jobs').where({ id:hiddenJob }).first()).version;
  await mutateJob(db,identity(),permissionIds,{ workspaceId,jobId:hiddenJob,expectedVersion:version,submissionId:randomUUID(),action:'schedule',scheduledDate:'2026-10-20',arrivalWindow:'10:00-12:00' });
  const params = new URLSearchParams({ workspaceId,turnId:card.turnId,resultId:card.result.id });
  expect((await clients.owner.get(`/api/chat/calendar?${params}`)).status()).toBe(403);
  expect((await clients.owner.post('/api/chat/calendar',{ headers,data:body })).status()).toBe(403);
  const history = await (await clients.owner.get(`/api/chat/threads?workspace=${workspaceId}&thread=${events[0].threadId}`)).json();
  expect(history.turns.every((t:{calendarResult?:unknown}) => !t.calendarResult)).toBe(true);
  expect((await db('chatTurns').where({ id:inherited[0].turnId }).first()).calendarStamp).toMatch(/^[a-f0-9]{64}$/);
});

test('own advice cannot check others; known overlaps exclude dates, adjacent windows do not', async () => {
  const query = { operation:'availability',date:'2026-10-20',usePageFilters:false,person:'me',arrivalWindow:'10:00-12:00',includeWeekends:false };
  const events = await turn('field',query,{ surfaceKey:'home',calendarFilters:undefined });
  const card = events.find(e => e.type === 'calendar.result'); if (card?.type !== 'calendar.result' || card.result.mode !== 'availability') throw Error(JSON.stringify(events));
  expect(card.result.scope).toBe('own'); expect(card.result.people.map(p => p.id)).toEqual([users.field]); expect(card.result.total).toBe(0); expect(card.result.suggestions).toEqual([]);
  const adjacent = await turn('field',{ ...query,arrivalWindow:'12:00-14:00' });
  const match = adjacent.find(e => e.type === 'calendar.result'); if (match?.type !== 'calendar.result' || match.result.mode !== 'availability') throw Error(JSON.stringify(adjacent));
  expect(match.result.suggestions[0]).toMatchObject({ visitCount:1,timing:'no-known-overlap' });
  for (const person of ['Calendar owner',users.owner,'all','No such person']) {
    const denied = await turn('field',{ ...query,person }); expect(denied.at(-1)?.type).toBe('turn.completed'); expect(denied.some(e => e.type === 'calendar.result')).toBe(false);
    expect(JSON.stringify(denied)).not.toContain('PRIVATE_OTHER_VISIT');
  }
});

test('default advice covers fourteen calendar days, weekdays only, and Calendar UI opens a reviewed date', async ({ browser }) => {
  const query = { operation:'availability',date:null,usePageFilters:false,person:'me' };
  const events = await turn('field',query);
  const card = events.find(e => e.type === 'calendar.result'); if (card?.type !== 'calendar.result' || card.result.mode !== 'availability') throw Error(JSON.stringify(events));
  expect((Date.parse(card.result.to) - Date.parse(card.result.from)) / 86400000).toBe(13); expect(card.result.total).toBe(10);
  expect(card.result.suggestions.every(s => ![0,6].includes(new Date(`${s.date}T12:00:00Z`).getUTCDay()))).toBe(true);
  const context = await browser.newContext({ storageState:await clients.owner.storageState() }), page = await context.newPage();
  try {
    await page.goto(`/calendar?workspace=${workspaceId}&date=2026-10-19`); await page.getByRole('button',{ name:/SalesMora assistant/i }).click();
    const dialog = page.getByRole('dialog'); await dialog.getByRole('textbox').fill(`fixture:calendar:${JSON.stringify({ ...query,date:'2026-10-23' })}`);
    await dialog.getByRole('button',{ name:'Ask assistant',exact:true }).click();
    const region = dialog.getByRole('region',{ name:'Dates to review' }); await expect(region).toBeVisible({ timeout:30000 });
    await region.getByRole('button',{ name:/Review.*in Calendar/ }).first().click();
    await expect(page).toHaveURL(new RegExp(`date=2026-10-23.*person=member%3A${users.owner}`)); await expect(dialog).not.toBeVisible();
  } finally { await context.close(); }
});

test('replaced membership cannot revive an old Calendar snapshot', async () => {
  const events = await turn('field'); const card = events.find(e => e.type === 'calendar.result'); if (card?.type !== 'calendar.result' || card.result.mode === 'availability') throw Error(JSON.stringify(events));
  const member = await db('workspaceMemberships').where({ workspaceId, userId: users.field }).first();
  await db('workspaceMemberships').where({ workspaceId, userId: users.field }).delete();
  await db('workspaceMemberships').insert(member);
  const params = new URLSearchParams({ workspaceId, turnId: card.turnId, resultId: card.result.id });
  expect((await clients.field.get(`/api/chat/calendar?${params}`)).status()).toBe(403);
});

test('ambiguous names require clarification and an explicit weekend can be checked', async () => {
  const owner = await db('users').where({ id:users.owner }).first('name');
  try {
    await db('users').where({ id:users.owner }).update({ name:'Calendar field' });
    const ambiguous = await turn('owner',{ operation:'availability',date:'2026-10-24',person:'Calendar field',usePageFilters:false,includeWeekends:true });
    expect(ambiguous.at(-1)?.type).toBe('turn.completed'); expect(ambiguous.some(e => e.type === 'calendar.result')).toBe(false);
  } finally { await db('users').where({ id:users.owner }).update({ name:owner.name }); }
  const events = await turn('owner',{ operation:'availability',date:'2026-10-24',person:'me',usePageFilters:false,includeWeekends:true });
  const card = events.find(e => e.type === 'calendar.result'); if (card?.type !== 'calendar.result' || card.result.mode !== 'availability') throw Error(JSON.stringify(events));
  expect(card.result.suggestions[0].date).toBe('2026-10-24');
});
