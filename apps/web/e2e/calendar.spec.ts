import { test, expect, request as requests, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { permissionIds } from '@salesmora/contracts';
import { createDatabase, createJob, createWorkOrder, mutateWorkOrder, linkCalendarWorkOrder } from '@salesmora/data';
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL) throw Error('Use the isolated test database.');
const db = createDatabase(connection), origin = 'http://127.0.0.1:3002', headers = { Origin: origin }, prefix = `calendar-${randomUUID()}`;
const clients: Record<string, APIRequestContext> = {}, users: Record<string, string> = {};
let workspaceId: string, customerId: string, jobId: string, orderId: string, visitId: string;
const url = () => `/api/calendar?workspace=${workspaceId}&date=2026-11-02`;
const peek = () => `/api/calendar/${visitId}?workspace=${workspaceId}`;
test.setTimeout(120000);
test.beforeAll(async () => {
  await db('rateLimits').delete();
  for (const role of ['owner', 'field', 'other']) {
    clients[role] = await requests.newContext({ baseURL: origin });
    const email = `${prefix}-${role}@example.test`;
    expect((await clients[role].post('/api/auth/sign-up/email', { headers, data: { name: `Calendar ${role}`, email, password: 'Fictional-test-password-42!', termsAccepted: true } })).status()).toBe(200);
    users[role] = (await db('users').where({ email }).first()).id;
  }
  const response = await clients.owner.post('/api/workspaces', { headers, data: { business: { businessName: 'Calendar integration fixture', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } } });
  expect(response.status()).toBe(201); workspaceId = (await response.json()).workspaceId;
  await db('workspaceMemberships').insert({ workspaceId, userId: users.field, role: 'field' });
  const customer = await clients.owner.post('/api/customers', { headers, data: { workspaceId, submissionId: randomUUID(), values: { name: 'Calendar fixture customer', type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '', ownerId: '' } } });
  expect(customer.status()).toBe(201); customerId = (await customer.json()).customerId;
  const identity = { workspaceId, userId: users.owner };
  jobId = (await createJob(db, identity, permissionIds, { workspaceId, submissionId: randomUUID(), customerId, title: 'Calendar shared repair', primaryOwnerId: users.field,
    scheduledDate: '2026-11-02', arrivalWindow: '09:00-11:00' })).jobId;
  orderId = (await createWorkOrder(db, identity, permissionIds, { workspaceId, submissionId: randomUUID(), jobId, title: 'Calendar work order', assigneeId: users.field, source: { kind: 'blank' } })).workOrderId;
  await mutateWorkOrder(db, identity, permissionIds, { workspaceId, workOrderId: orderId, submissionId: randomUUID(), expectedVersion: 1, action: 'status', to: 'issued', confirmed: true });
  const target = await db('calendarVisitRecords').where({ workspaceId, jobId }).whereNull('endedAt').first(); visitId = target.visitId;
  const source = await db('calendarVisitRecords').where({ workspaceId, workOrderId: orderId }).whereNull('endedAt').first();
  await linkCalendarWorkOrder(db, identity, permissionIds, { workspaceId, submissionId: randomUUID(), visitId, expectedVisitVersion: 1, records: [{ type: 'job', id: jobId, expectedVersion: 1 }],
    workOrderId: orderId, expectedWorkOrderVersion: 2, sourceVisitId: source.visitId, expectedSourceVisitVersion: 1 });
  for (let index = 0; index < 13; index++) await createJob(db, identity, permissionIds, { workspaceId, submissionId: randomUUID(), customerId, title: `Queue test visit ${index + 1}`, primaryOwnerId: users.owner });
});
test.afterAll(async () => {
  if (workspaceId) { await db('workOrders').where({ workspaceId }).delete(); await db('jobs').where({ workspaceId }).delete(); }
  await db('users').whereIn('id', Object.values(users)).delete();
  await Promise.all(Object.values(clients).map(client => client.dispose())); await db.destroy();
});
test('Calendar APIs enforce current Calendar and record access, strict requests and atomic confirmations', async () => {
  const result = await clients.owner.get(url()); expect(result.status()).toBe(200);
  expect(result.headers()['cache-control']).toContain('no-store');
  const body = await result.json(); expect(body.entries).toHaveLength(1); expect(body.entries[0].records).toHaveLength(2);
  expect(body.unscheduledTotal).toBe(13); expect(body.unscheduled).toHaveLength(10);
  const field = await (await clients.field.get(url())).json(); expect(field.scope).toBe('own'); expect(field.members).toHaveLength(1); expect(field.unscheduledTotal).toBe(0);
  expect((await clients.other.get(url())).status()).toBe(404);
  expect((await clients.owner.get(url() + '&view=month')).status()).toBe(422);
  expect((await clients.owner.get(`/api/calendar?workspace=${workspaceId}&date=invalid`)).status()).toBe(422);
  const anonymous = await requests.newContext({ baseURL: origin }); expect((await anonymous.get(url())).status()).toBe(401); await anonymous.dispose();
  const visit = await (await clients.owner.get(peek())).json();
  const warnings = await clients.owner.post('/api/calendar/advisories', { headers, data: { workspaceId, visitId, revision: visit.revision, schedule: { scheduledDate: '2026-11-03', arrivalWindow: '10:00-12:00' } } });
  expect(warnings.status()).toBe(200); expect((await warnings.json()).messages).toEqual([]);
  const input = { workspaceId, visitId, submissionId: randomUUID(), ...visit.review, schedule: { scheduledDate: '2026-11-03', arrivalWindow: '10:00-12:00' } };
  expect((await clients.owner.patch(`/api/calendar/${visitId}`, { headers: { Origin: 'https://example.test' }, data: input })).status()).toBe(403);
  expect((await clients.owner.patch(`/api/calendar/${visitId}`, { headers, data: { ...input, expectedVisitVersion: 999 } })).status()).toBe(409);
  expect((await clients.owner.patch(`/api/calendar/${visitId}`, { headers, data: input })).status()).toBe(200);
  expect((await clients.owner.patch(`/api/calendar/${visitId}`, { headers, data: input })).status()).toBe(200);
  expect((await db('jobs').where({ id: jobId }).first()).version).toBe(2);
  await db('workspaceRolePolicies').where({ workspaceId, role: 'field', permission: 'calendar.read' }).delete();
  const current = await (await clients.owner.get(peek())).json();
  expect((await clients.field.patch(`/api/calendar/${visitId}`, { headers, data: { ...input, submissionId: randomUUID(), ...current.review } })).status()).toBe(404);
  await db('workspaceRolePolicies').insert({ workspaceId, role: 'field', permission: 'calendar.read', scope: 'own_assigned' });
});
test('approved live page opens the peek, reviews and saves a shared visit, and keeps URL-backed queue navigation', async ({ browser }) => {
  const context = await browser.newContext({ storageState: await clients.owner.storageState() });
  const page = await context.newPage(); page.setDefaultTimeout(20000);
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', message => { if (message.text().includes('same key')) errors.push(message.text()); });
  await page.goto(`${origin}/calendar?workspace=${workspaceId}&date=2026-11-02`);
  await expect(page.getByRole('heading', { name: 'Calendar', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Calendar', exact: true })).toHaveAttribute('href', `/calendar?workspace=${workspaceId}`);
  await page.getByRole('button', { name: 'Visit: Calendar shared repair' }).click();
  await page.getByRole('button', { name: 'View visit details: Calendar shared repair' }).click();
  await expect(page).toHaveURL(/visit=/);
  const drawer = page.getByRole('dialog'); await expect(drawer.getByText('Calendar work order', { exact: true })).toBeVisible();
  await drawer.getByRole('button', { name: 'Reschedule visit', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Scheduled date', { exact: true }).fill('2026-11-04');
  await dialog.getByRole('button', { name: 'Review changes', exact: true }).click();
  await expect(dialog.getByText('These records share one visit. The change applies to every affected active record together.')).toBeVisible();
  await expect.poll(async () => (await db('jobs').where({ id: jobId }).first()).version).toBe(2);
  await dialog.getByRole('button', { name: 'Confirm schedule', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText('Visit schedule updated.', { exact: true })).toBeVisible();
  const job = await db('jobs').where({ id: jobId }).select(db.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS date`)).first();
  const order = await db('workOrders').where({ id: orderId }).select(db.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS date`)).first();
  expect(job.date).toBe('2026-11-04'); expect(order.date).toBe(job.date);
  await page.getByRole('navigation', { name: 'Unscheduled visits pages' }).getByRole('button', { name: 'Go to page 2' }).click();
  await expect(page).toHaveURL(/queuePage=2/); await expect(page.getByText('Showing 11–13 of 13')).toBeVisible();
  await page.goBack(); await expect(page.getByText('Showing 1–10 of 13')).toBeVisible();
  await page.getByLabel('Customer search', { exact: true }).fill('No matching customer');
  await expect.poll(async () => new URL(page.url()).searchParams.get('customerQuery')).toBe('No matching customer');
  await expect(page.getByRole('region', { name: 'Week schedule', exact: true }).getByRole('status')).toHaveText(/0/);
  expect(errors).toEqual([]);
  await context.close();
});
test('Field page hides unrelated work and stays usable on a narrow screen', async ({ browser }) => {
  const context = await browser.newContext({ storageState: await clients.field.storageState(), viewport: { width: 320, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${origin}/calendar?workspace=${workspaceId}&date=2026-11-02&person=all`);
  await expect(page.getByRole('heading', { name: 'Calendar', exact: true })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Assigned person', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Visit: Calendar shared repair' })).toBeVisible();
  await expect(page.getByText('Queue test visit 1', { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await context.close();
});
test('Calendar own-schedule restrictions cannot be bypassed using broader resource permissions', async () => {
  const identity = { workspaceId, userId: users.owner };
  const job = await createJob(db, identity, permissionIds, { workspaceId, submissionId: randomUUID(), customerId, title: 'Own-scope fixture', primaryOwnerId: users.owner, scheduledDate: '2026-11-16' });
  const order = await createWorkOrder(db, identity, permissionIds, { workspaceId, submissionId: randomUUID(), jobId: job.jobId, title: 'Different assignee fixture', assigneeId: users.field, source: { kind: 'blank' } });
  const to = await db('calendarVisitRecords').where({ workspaceId, jobId: job.jobId }).whereNull('endedAt').first();
  const from = await db('calendarVisitRecords').where({ workspaceId, workOrderId: order.workOrderId }).whereNull('endedAt').first();
  await linkCalendarWorkOrder(db, identity, permissionIds, { workspaceId, submissionId: randomUUID(), visitId: to.visitId, expectedVisitVersion: 1,
    records: [{ type: 'job', id: job.jobId, expectedVersion: 1 }], workOrderId: order.workOrderId, expectedWorkOrderVersion: 1, sourceVisitId: from.visitId, expectedSourceVisitVersion: 1 });
  const full = await (await clients.owner.get(`/api/calendar/${to.visitId}?workspace=${workspaceId}`)).json();
  await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'calendar.read' }).update({ scope: 'own_assigned' });
  try {
    const projected = await (await clients.owner.get(`/api/calendar/${to.visitId}?workspace=${workspaceId}`)).json();
    expect(projected.records).toHaveLength(1); expect(projected.canReschedule).toBe(false); expect(projected.review).toBeNull();
    const response = await clients.owner.patch(`/api/calendar/${to.visitId}`, { headers, data: { workspaceId, visitId: to.visitId, submissionId: randomUUID(), ...full.review, schedule: { scheduledDate: '2026-11-17', arrivalWindow: null } } });
    expect(response.status()).toBe(404);
    expect((await db('jobs').where({ id: job.jobId }).first()).version).toBe(1);
  } finally { await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'calendar.read' }).update({ scope: 'workspace' }); }
});

test('Work Order creation reviews an explicit visit choice and creates a shared draft atomically', async ({ browser }) => {
  const ownJob = (await createJob(db, { workspaceId, userId: users.owner }, permissionIds, { workspaceId, submissionId: randomUUID(), customerId,
    title: 'Creation review fixture', primaryOwnerId: users.owner, scheduledDate: '2026-11-06', arrivalWindow: '09:00-11:00' })).jobId;
  const previewURL = `/api/work-orders/creation-visit?workspace=${workspaceId}&jobId=${ownJob}`;
  expect((await clients.other.get(previewURL)).status()).toBe(404);
  const previewResponse = await clients.owner.get(previewURL);
  expect(previewResponse.status()).toBe(200); expect(previewResponse.headers()['cache-control']).toContain('no-store');
  const preview = await previewResponse.json(); expect(preview.canJoin).toBe(true); expect(preview.review).toBeUndefined();
  const input = { workspaceId, jobId: ownJob, submissionId: randomUUID(), title: 'Stale draft', visit: { kind: 'job', visitId: preview.id, revision: '0'.repeat(64) } };
  expect((await clients.owner.post('/api/work-orders', { headers: { Origin: 'https://example.test' }, data: input })).status()).toBe(403);
  expect((await clients.owner.post('/api/work-orders', { headers, data: input })).status()).toBe(409);
  expect(Number((await db('workOrders').where({ workspaceId, jobId: ownJob }).count('* as n').first())!.n)).toBe(0);
  const context = await browser.newContext({ storageState: await clients.owner.storageState() });
  const page = await context.newPage(); page.setDefaultTimeout(20000);
  const jobLoaded = page.waitForResponse(response => response.url().includes(`/api/jobs/${ownJob}?`) && response.request().method() === 'GET');
  await page.goto(`${origin}/work-orders?workspace=${workspaceId}&newForJob=${ownJob}`);
  expect((await jobLoaded).status()).toBe(200);
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('radio', { name: /Use Job’s visit/ })).toBeVisible({ timeout:20000 });
  await expect(dialog.getByRole('button', { name: 'Review draft', exact: true })).toBeDisabled();
  await dialog.getByRole('radio', { name: /Use Job’s visit/ }).check();
  await dialog.getByLabel('Title', { exact: true }).fill('Reviewed shared draft');
  await dialog.getByRole('button', { name: 'Review draft', exact: true }).click();
  await expect(dialog.getByRole('heading', { name: 'Review new work order' })).toBeVisible();
  expect(Number((await db('workOrders').where({ workspaceId, jobId: ownJob }).count('* as n').first())!.n)).toBe(0);
  const created = page.waitForResponse(response => response.url().endsWith('/api/work-orders') && response.request().method() === 'POST');
  await dialog.getByRole('button', { name: 'Confirm and create draft', exact: true }).click();
  expect((await created).status()).toBe(201);
  await expect(page).toHaveURL(/\/work-orders\/[a-f0-9-]+\?workspace=/, { timeout: 20000 });
  const made = await db('workOrders').where({ workspaceId, jobId: ownJob }).first();
  expect(made.title).toBe('Reviewed shared draft'); expect(made.version).toBe(2);
  const link = await db('calendarVisitRecords').where({ workspaceId, workOrderId: made.id }).whereNull('endedAt').first();
  expect(link.visitId).toBe(preview.id);
  await context.close();
});

test('existing Work Order visit controls join and separate through reviewed atomic commands', async ({ browser }) => {
  const identity = { workspaceId, userId: users.owner };
  const j = (await createJob(db, identity, permissionIds, { workspaceId, submissionId: randomUUID(), customerId, title: 'Visit management fixture', primaryOwnerId: users.field,
    scheduledDate: '2026-11-07', arrivalWindow: '09:00-11:00' })).jobId;
  const w = (await createWorkOrder(db, identity, permissionIds, { workspaceId, submissionId: randomUUID(), jobId: j, title: 'Visit management work order', assigneeId: users.field })).workOrderId;
  await mutateWorkOrder(db, identity, permissionIds, { workspaceId, submissionId: randomUUID(), workOrderId: w, expectedVersion: 1, action: 'status', to: 'issued', confirmed: true });
  const endpoint = `/api/work-orders/${w}/visit`, url = `${endpoint}?workspace=${workspaceId}`;
  expect((await clients.other.get(url)).status()).toBe(404);
  const previewResponse = await clients.owner.get(url); expect(previewResponse.status()).toBe(200); expect(previewResponse.headers()['cache-control']).toContain('no-store');
  const preview = await previewResponse.json(); expect(preview.canJoin).toBe(true); expect(preview.canSeparate).toBe(false);
  const input = { workspaceId, submissionId: randomUUID(), workOrderId: w, kind: 'join', sourceVisitId: preview.source.id, sourceRevision: preview.source.revision, visitId: preview.target.id, revision: preview.target.revision };
  expect((await clients.owner.patch(endpoint, { headers: { Origin: 'https://example.test' }, data: input })).status()).toBe(403);
  expect((await clients.other.patch(endpoint, { headers, data: input })).status()).toBe(404);
  expect((await clients.owner.patch(endpoint, { headers, data: { ...input, unexpected: true } })).status()).toBe(422);
  expect((await clients.owner.patch(endpoint, { headers, data: { ...input, revision: '0'.repeat(64) } })).status()).toBe(409);
  // This is a Work Order action: Calendar menu access is not required, while primary responsibility still is.
  await db('workspaceRolePolicies').where({ workspaceId, role: 'field', permission: 'calendar.read' }).delete();
  const fieldPreview = await (await clients.field.get(url)).json(); expect(fieldPreview.canJoin).toBe(true);
  const context = await browser.newContext({ storageState: await clients.owner.storageState() });
  const page = await context.newPage(); page.setDefaultTimeout(20000);
  await page.goto(`${origin}/work-orders/${w}?workspace=${workspaceId}`);
  await page.getByRole('button', { name: 'Join Job’s visit', exact: true }).click();
  let dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Review visit change', exact: true }).click();
  expect((await db('workOrders').where({ id: w }).first()).version).toBe(2);
  await dialog.getByRole('button', { name: 'Confirm join visit', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Move to a separate visit', exact: true }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByRole('checkbox', { name: 'Leave unscheduled', exact: true }).check();
  await dialog.getByRole('button', { name: 'Review visit change', exact: true }).click();
  await dialog.getByRole('button', { name: 'Confirm separate visit', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Join Job’s visit', exact: true })).toBeVisible();
  const order = await db('workOrders').where({ id: w }).first(); expect(order.scheduledDate).toBeNull(); expect(order.arrivalWindow).toBeNull(); expect(order.version).toBe(4);
  const job = await db('jobs').where({ id: j }).select('version', db.raw(`to_char("scheduledDate",'YYYY-MM-DD') AS date`)).first(); expect(job.version).toBe(1); expect(job.date).toBe('2026-11-07');
  await context.close();
  await db('workspaceRolePolicies').insert({ workspaceId, role: 'field', permission: 'calendar.read', scope: 'own_assigned' });
});

test('combined visit notices and personal email preferences work on the live pages', async ({ browser }) => {
  const identity = { workspaceId, userId: users.owner };
  const j = (await createJob(db, identity, permissionIds, { workspaceId, submissionId: randomUUID(), customerId, title: 'Notification integration job', primaryOwnerId: users.field,
    scheduledDate: '2026-11-08', arrivalWindow: '09:00-11:00' })).jobId;
  const preview = await (await clients.owner.get(`/api/work-orders/creation-visit?workspace=${workspaceId}&jobId=${j}`)).json();
  const w = (await createWorkOrder(db, identity, permissionIds, { workspaceId, submissionId: randomUUID(), jobId: j, title: 'Notification integration order', assigneeId: users.field,
    visit: { kind: 'job', visitId: preview.id, revision: preview.revision } })).workOrderId;
  await mutateWorkOrder(db, identity, permissionIds, { workspaceId, workOrderId: w, submissionId: randomUUID(), expectedVersion: 2, action: 'status', to: 'issued', confirmed: true });
  const baseline = await (await clients.field.get(`/api/notifications?workspace=${workspaceId}`)).json();
  const visit = await (await clients.owner.get(`/api/calendar/${preview.id}?workspace=${workspaceId}`)).json();
  const input = { workspaceId, visitId: visit.id, submissionId: randomUUID(), ...visit.review, schedule: { scheduledDate: '2026-11-09', arrivalWindow: '13:00-15:00' } };
  expect((await clients.owner.patch(`/api/calendar/${visit.id}`, { headers, data: input })).status()).toBe(200);
  expect((await clients.owner.patch(`/api/calendar/${visit.id}`, { headers, data: input })).status()).toBe(200);
  const result = await (await clients.field.get(`/api/notifications?workspace=${workspaceId}`)).json();
  expect(result.unreadCount).toBe(baseline.unreadCount + 1);
  const notices = result.items.filter((n: { kind: string; records?: { id: string }[] }) => n.kind === 'visit' && n.records?.some(r => r.id === w));
  expect(notices).toHaveLength(1); expect(notices[0].records).toHaveLength(2);
  expect((await clients.field.put('/api/settings/notifications', { headers, data: { workspaceId, leadAssignedEmail: true, visitChangedEmail: false } })).status()).toBe(200);
  expect((await (await clients.owner.get(`/api/settings/notifications?workspace=${workspaceId}`)).json()).visitChangedEmail).toBe(true);
  expect((await clients.field.put('/api/settings/notifications', { headers, data: { workspaceId, leadAssignedEmail: true, visitChangedEmail: false, userId: users.owner } })).status()).toBe(400);
  const context = await browser.newContext({ storageState: await clients.field.storageState() }), page = await context.newPage(); page.setDefaultTimeout(20000);
  await page.goto(`${origin}/settings/notifications?workspace=${workspaceId}`);
  const toggle = page.getByRole('switch', { name: 'Visit schedule changes', exact: true }); await expect(toggle).not.toBeChecked();
  await toggle.click(); await page.getByRole('button', { name: 'Save preferences', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Preferences saved' })).toBeVisible();
  expect((await (await clients.field.get(`/api/settings/notifications?workspace=${workspaceId}`)).json()).visitChangedEmail).toBe(true);
  await page.getByRole('button', { name: /^Open notifications/ }).click();
  const panel = page.getByRole('dialog', { name: 'Notifications', exact: true });
  const card = panel.locator('li').filter({ has: page.getByRole('heading', { name: 'A visit was rescheduled', exact: true }) }).filter({ hasText: 'Notification integration job' });
  await expect(card).toHaveCount(1); await expect(card).toContainText('Notification integration order');
  await card.getByRole('button', { name: 'Mark as read', exact: true }).click();
  await expect(card.getByText('Read', { exact: true })).toBeVisible();
  await context.close();
});
