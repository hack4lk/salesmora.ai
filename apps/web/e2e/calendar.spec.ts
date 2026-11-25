import { test, expect, request as requests, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { permissionIds, initialCaptureSetupConfiguration, workflowDraftSchema } from '@salesmora/contracts';
import { createDatabase, createJob, createWorkOrder, mutateWorkOrder, linkCalendarWorkOrder, withWorkspaceAuthorization, prepareWorkflowInTransaction, processWorkflowStep, mutateJob, processServiceDueStep, createCaptureDraft, readCapturePublicationReview, publishCaptureDraft, prepareCaptureSubmission, commitCaptureSubmission } from '@salesmora/data';
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
  jobId = (await createJob(db, identity, permissionIds, {postalCode:'10001', workspaceId, submissionId: randomUUID(), customerId, title: 'Calendar shared repair', primaryOwnerId: users.field,
    scheduledDate: '2026-11-02', arrivalWindow: '09:00-11:00' })).jobId;
  orderId = (await createWorkOrder(db, identity, permissionIds, { workspaceId, submissionId: randomUUID(), jobId, title: 'Calendar work order', assigneeId: users.field, source: { kind: 'blank' } })).workOrderId;
  await mutateWorkOrder(db, identity, permissionIds, { workspaceId, workOrderId: orderId, submissionId: randomUUID(), expectedVersion: 1, action: 'status', to: 'issued', confirmed: true });
  const target = await db('calendarVisitRecords').where({ workspaceId, jobId }).whereNull('endedAt').first(); visitId = target.visitId;
  const source = await db('calendarVisitRecords').where({ workspaceId, workOrderId: orderId }).whereNull('endedAt').first();
  await linkCalendarWorkOrder(db, identity, permissionIds, { workspaceId, submissionId: randomUUID(), visitId, expectedVisitVersion: 1, records: [{ type: 'job', id: jobId, expectedVersion: 1 }],
    workOrderId: orderId, expectedWorkOrderVersion: 2, sourceVisitId: source.visitId, expectedSourceVisitVersion: 1 });
  for (let index = 0; index < 13; index++) await createJob(db, identity, permissionIds, {postalCode:'10001', workspaceId, submissionId: randomUUID(), customerId, title: `Queue test visit ${index + 1}`, primaryOwnerId: users.owner });
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
  expect(warnings.status()).toBe(200); expect((await warnings.json()).messages).toEqual([expect.stringContaining('availability is unknown')]);
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
test('fresh Calendar person filters reuse cached visits without refetching', async ({ browser }) => {
  const context = await browser.newContext({ storageState: await clients.owner.storageState() });
  const page = await context.newPage();
  await page.goto(`${origin}/calendar?workspace=${workspaceId}&date=2026-11-02`);
  await page.getByRole('button', { name: 'Visit: Calendar shared repair' }).click();
  await expect(page.getByRole('button', { name: 'View visit details: Calendar shared repair' })).toBeVisible();
  const reads: string[] = [];
  page.on('request', request => { if (request.method() === 'GET' && request.url().includes('/api/calendar?')) reads.push(request.url()); });
  await page.getByRole('combobox', { name: 'Assigned person' }).selectOption('unassigned');
  await expect.poll(() => reads.length).toBe(1);
  await expect(page).toHaveURL(/person=unassigned/);
  await expect(page.getByRole('button', { name: 'Visit: Calendar shared repair' })).toHaveCount(0);
  await page.getByRole('combobox', { name: 'Assigned person' }).selectOption('all');
  await expect(page.getByRole('button', { name: 'Visit: Calendar shared repair' })).toBeVisible();
  await page.waitForTimeout(500);
  expect(reads).toHaveLength(1);
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
  const job = await createJob(db, identity, permissionIds, {postalCode:'10001', workspaceId, submissionId: randomUUID(), customerId, title: 'Own-scope fixture', primaryOwnerId: users.owner, scheduledDate: '2026-11-16' });
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
  const ownJob = (await createJob(db, { workspaceId, userId: users.owner }, permissionIds, {postalCode:'10001', workspaceId, submissionId: randomUUID(), customerId,
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

test('Materials, Work Order and Intake lists reuse exact fresh filters and refresh saved materials', async ({ browser }) => {
  const context = await browser.newContext({ storageState: await clients.owner.storageState() });
  const page = await context.newPage(); page.setDefaultTimeout(20000);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  for (const resource of ['materials', 'work-orders', 'intake']) {
    const reads: string[] = [];
    const track = (request: import('@playwright/test').Request) => {
      if (request.method() === 'GET' && request.url().includes(`/api/${resource}?`)) reads.push(request.url());
    };
    page.on('request', track);
    await page.goto(`${origin}/${resource}?workspace=${workspaceId}`);
    const search = page.getByRole('searchbox');
    await search.fill('cache-check');
    await expect.poll(() => reads.length).toBe(1);
    await expect(search).toBeEnabled();
    await search.clear();
    await page.waitForTimeout(500);
    expect(reads).toHaveLength(1);
    await search.fill('cache-check');
    await page.waitForTimeout(500);
    expect(reads).toHaveLength(1);
    await search.clear();
    await page.waitForTimeout(500);
    if (resource === 'materials') {
      await page.getByRole('button', { name: 'Add material', exact: true }).click();
      const dialog = page.getByRole('dialog');
      await dialog.getByRole('textbox', { name: /^Name/ }).fill('Query catalog fixture');
      await dialog.getByRole('button', { name: 'Add to catalog', exact: true }).click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(page.getByText('Material added to the catalog.', { exact: true })).toBeVisible();
      await expect(page.getByRole('group', { name: 'Materials catalog' }).getByText('Query catalog fixture', { exact: true })).toBeVisible();
      await expect.poll(() => reads.length).toBe(2);
    }
    for (const width of [1440, 768, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    page.off('request', track);
  }
  const draft = await createWorkOrder(db, { workspaceId, userId: users.owner }, permissionIds, {
    workspaceId, submissionId: randomUUID(), jobId, title: 'Query deletion fixture',
  });
  const record = await db('workOrders').where({ id: draft.workOrderId }).first();
  await page.goto(`${origin}/work-orders/${draft.workOrderId}?workspace=${workspaceId}`);
  await page.getByRole('button', { name: 'Delete draft', exact: true }).click();
  const confirmation = page.getByRole('alertdialog');
  await confirmation.getByRole('textbox', { name: 'Type the work order number' }).fill(`WO-${String(record.workOrderNumber).padStart(4, '0')}`);
  const deletedReads: number[] = [];
  page.on('response', response => {
    if (response.request().method() === 'GET' && response.url().includes(`/api/work-orders/${draft.workOrderId}?`)) deletedReads.push(response.status());
  });
  await confirmation.getByRole('button', { name: 'Delete work order', exact: true }).click();
  await expect(page).toHaveURL(`${origin}/work-orders?workspace=${workspaceId}`);
  expect(deletedReads).not.toContain(404);
  expect(await db('workOrders').where({ id: draft.workOrderId }).first()).toBeUndefined();
  expect(errors).toEqual([]);
  await context.close();
});

test('existing Work Order visit controls join and separate through reviewed atomic commands', async ({ browser }) => {
  const identity = { workspaceId, userId: users.owner };
  const j = (await createJob(db, identity, permissionIds, {postalCode:'10001', workspaceId, submissionId: randomUUID(), customerId, title: 'Visit management fixture', primaryOwnerId: users.field,
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
  const j = (await createJob(db, identity, permissionIds, {postalCode:'10001', workspaceId, submissionId: randomUUID(), customerId, title: 'Notification integration job', primaryOwnerId: users.field,
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
  await expect(card).toHaveCount(0);
  await context.close();
});

test('Calendar planned work saves, reopens, warns and clears shared visits', async ({ browser }) => {
  await db('workspaces').where({ id: workspaceId }).update({ timezone: 'America/New_York' });
  const otherJob = (await createJob(db, { workspaceId, userId: users.owner }, permissionIds, {postalCode:'10001', workspaceId, submissionId: randomUUID(), customerId,
    title: 'Work-time conflict fixture', primaryOwnerId: users.field, scheduledDate: '2026-11-02', arrivalWindow: '14:00-16:00' })).jobId;
  const otherVisit = (await db('calendarVisitRecords').where({ workspaceId, jobId: otherJob }).whereNull('endedAt').first()).visitId;
  const other = await (await clients.owner.get(`/api/calendar/${otherVisit}?workspace=${workspaceId}`)).json();
  expect((await clients.owner.patch(`/api/calendar/${otherVisit}`, { headers, data: { workspaceId, visitId: otherVisit, submissionId: randomUUID(), ...other.review,
    schedule: { scheduledDate: '2026-11-02', arrivalWindow: '14:00-16:00', workTime: { startTime: '10:00', durationMinutes: 60 } } } })).status()).toBe(200);
  const context = await browser.newContext({ storageState: await clients.owner.storageState() });
  try {
    const page = await context.newPage(); page.setDefaultTimeout(10000);
    const path = `${origin}/calendar?workspace=${workspaceId}&date=2026-11-02&visit=${visitId}`;
    await page.goto(path);
    await page.getByRole('button', { name: 'Reschedule visit', exact: true }).click();
    let dialog = page.getByRole('dialog', { name: 'Reschedule visit', exact: true });
    await dialog.getByLabel('Scheduled date', { exact: true }).fill('2026-11-02');
    await dialog.getByRole('checkbox', { name: 'Add planned work time', exact: true }).check();
    await expect(dialog.getByRole('button', { name: 'Review changes', exact: true })).toBeDisabled();
    await dialog.getByLabel('Planned start', { exact: true }).fill('09:00');
    await dialog.getByLabel('Time needed (minutes)', { exact: true }).fill('90');
    await expect(dialog.getByText(/overlapping planned work/)).toBeVisible();
    await dialog.getByRole('button', { name: 'Review changes', exact: true }).click();
    await expect(dialog.getByText('Planned work: 9:00 AM–10:30 AM · 1 hour 30 min')).toBeVisible();
    await dialog.getByRole('button', { name: 'Confirm schedule', exact: true }).click(); await expect(dialog).toHaveCount(0);
    const saved = await db('calendarVisits').where({ workspaceId, id: visitId }).first();
    expect(saved.workTime).toEqual({ startTime: '09:00', durationMinutes: 90 }); expect(saved.workStartsAt.toISOString()).toBe('2026-11-02T14:00:00.000Z');
    await page.goto(path); await expect(page.getByText('9:00 AM–10:30 AM · 1 hour 30 min')).toBeVisible();
    await page.reload(); await expect(page.getByText('9:00 AM–10:30 AM · 1 hour 30 min')).toBeVisible();
    await page.getByRole('button', { name: 'Reschedule visit', exact: true }).click();
    dialog = page.getByRole('dialog', { name: 'Reschedule visit', exact: true });
    await expect(dialog.getByLabel('Planned start', { exact: true })).toHaveValue('09:00'); await expect(dialog.getByLabel('Time needed (minutes)', { exact: true })).toHaveValue('90');
    await dialog.getByRole('button', { name: 'Clear schedule', exact: true }).click();
    await page.getByRole('button', { name: 'Confirm clear schedule', exact: true }).click(); await expect(page.getByRole('dialog', { name: 'Clear this visit’s schedule?', exact: true })).toHaveCount(0);
    const cleared = await db('calendarVisits').where({ workspaceId, id: visitId }).first(); expect(cleared.workTime).toBeNull(); expect(cleared.workStartsAt).toBeNull();
    expect((await db('jobs').where({ id: jobId }).first()).scheduledDate).toBeNull(); expect((await db('workOrders').where({ id: orderId }).first()).scheduledDate).toBeNull();
  } finally { await context.close(); }
});

test('Calendar person availability saves, reloads, warns and enforces current access', async ({ browser }) => {
  const context = await browser.newContext({ storageState: await clients.owner.storageState() });
  const path = `/api/calendar/availability/${users.field}`;
  try {
    const initial = await clients.owner.get(`${path}?workspace=${workspaceId}`); expect(initial.status()).toBe(200);
    expect((await initial.json()).availability.weeklyHours).toBeNull();
    expect((await clients.field.get(`/api/calendar/availability/${users.owner}?workspace=${workspaceId}`)).status()).toBe(404);
    expect((await clients.other.get(`${path}?workspace=${workspaceId}`)).status()).toBe(404);
    const page = await context.newPage(); page.setDefaultTimeout(15000);
    await page.goto(`${origin}/calendar?workspace=${workspaceId}&date=2026-11-02`);
    const personName = (await db('users').where({ id: users.field }).first()).name;
    await page.getByRole('button', { name: `Availability for ${personName}`, exact: true }).click();
    let dialog = page.getByRole('dialog', { name: 'Working hours & unavailable dates', exact: true });
    await expect(dialog.getByText('Hours not recorded. Availability is unknown.')).toBeVisible();
    await dialog.getByRole('checkbox', { name: 'Set weekly hours', exact: true }).check();
    await dialog.getByLabel('Monday', { exact: true }).check();
    await dialog.getByLabel('Monday start', { exact: true }).fill('08:00'); await dialog.getByLabel('Monday finish', { exact: true }).fill('17:00');
    await dialog.getByRole('button', { name: 'Add dates', exact: true }).click();
    await dialog.getByLabel('From', { exact: true }).fill('2026-11-02'); await dialog.getByLabel('Through', { exact: true }).fill('2026-11-02');
    await dialog.getByRole('button', { name: 'Save availability', exact: true }).click(); await expect(dialog).toHaveCount(0);
    await expect(page.getByText('Availability saved.', { exact: true })).toBeVisible();
    await page.reload(); await page.getByRole('button', { name: `Availability for ${personName}`, exact: true }).click();
    dialog = page.getByRole('dialog', { name: 'Working hours & unavailable dates', exact: true });
    await expect(dialog.getByLabel('Monday start', { exact: true })).toHaveValue('08:00');
    await expect(dialog.getByLabel('From', { exact: true })).toHaveValue('2026-11-02');
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    const visit = await (await clients.owner.get(peek())).json();
    const warnings = await clients.owner.post('/api/calendar/advisories', { headers, data: { workspaceId, visitId, revision: visit.revision,
      schedule: { scheduledDate: '2026-11-02', arrivalWindow: null, workTime: { startTime: '16:30', durationMinutes: 60 } } } });
    expect(warnings.status()).toBe(200); expect((await warnings.json()).messages).toEqual(expect.arrayContaining([
      expect.stringContaining('recorded unavailable dates'), expect.stringContaining('outside recorded working hours'),
    ]));
    const current = await (await clients.owner.get(`${path}?workspace=${workspaceId}`)).json();
    const command = { workspaceId, personId: users.field, revision: current.revision, timezone: current.timezone, submissionId: randomUUID(), availability: current.availability };
    expect((await clients.owner.patch(path, { headers: { Origin: 'https://example.test' }, data: command })).status()).toBe(403);
    expect((await clients.owner.patch(path, { headers, data: { ...command, availability: { ...current.availability, unsupported: true } } })).status()).toBe(422);
    expect((await clients.field.patch(path, { headers, data: command })).status()).toBe(404);
    expect((await clients.owner.patch(path, { headers, data: command })).status()).toBe(200);
    expect((await clients.owner.patch(path, { headers, data: command })).status()).toBe(200);
    expect((await clients.owner.patch(path, { headers, data: { ...command, submissionId: randomUUID() } })).status()).toBe(409);
  } finally { await context.close(); }
});

test('Routine booking publishes, edits through the canonical card and books only future matching jobs', async ({browser}) => {
  const identity={workspaceId,userId:users.owner};
  const days=['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  await db('calendarPersonAvailability').insert({workspaceId,personId:users.field,version:1,timezone:'America/New_York',availability:JSON.stringify({weeklyHours:Object.fromEntries(days.map(day=>[day,{startTime:'08:00',endTime:'17:00'}])),unavailableDates:[]})}).onConflict(['workspaceId','personId']).merge();
  const threadId=randomUUID(),turnId=randomUUID();
  await db('chatThreads').insert({id:threadId,...identity});await db('chatTurns').insert({id:turnId,threadId,...identity,clientTurnId:randomUUID(),requestHash:'routine-ui-fixture',surfaceKey:'workflows.list',state:'completed',leaseUntil:new Date(),proposalFamilies:JSON.stringify(['workflow'])});
  const bookingRules={durationMinutes:60,gapMinutes:30,horizonDays:3,weekdays:days,hours:{startTime:'08:00',endTime:'17:00'}};
  const draft=await withWorkspaceAuthorization(db,identity,permissionIds,true,(trx,context)=>prepareWorkflowInTransaction(trx,context,{threadId,turnId},{kind:'routine_booking',name:'Routine repairs UI',service:'repairs',bookingRules,recipient:'me',businessDays:null,localTime:null}));
  const oldJob=(await createJob(db,identity,permissionIds,{postalCode:'10001',workspaceId,submissionId:randomUUID(),customerId,title:'Old routine job',service:'repairs',primaryOwnerId:users.field})).jobId;
  const published=await clients.owner.post('/api/chat/workflows/proposals',{headers,data:{workspaceId,id:draft.id,inputHash:draft.inputHash,decision:'confirm'}});expect(published.status()).toBe(200);
  expect(await db('workflowSteps').where({workflowId:draft.id,jobId:oldJob}).first()).toBeUndefined();
  const context=await browser.newContext({storageState:await clients.owner.storageState()});
  try { const page=await context.newPage();page.setDefaultTimeout(15000);await page.goto(`${origin}/workflows?workspace=${workspaceId}`);
    await page.getByRole('button',{name:'Actions for Routine repairs UI',exact:true}).click();await expect(page.getByRole('menuitem',{name:'Run now',exact:true})).toHaveCount(0);
    await page.getByRole('menuitem',{name:'Edit',exact:true}).click();const dialog=page.getByRole('dialog');
    await dialog.getByRole('button',{name:'Change settings',exact:true}).click();const duration=dialog.getByLabel('Time needed (minutes)',{exact:true});await duration.fill('90');
    await dialog.getByRole('button',{name:'Save changes',exact:true}).click();await expect(dialog).toHaveCount(0);
    const saved=await db('workflows').where({id:draft.id}).first();expect(saved.definition.rules.durationMinutes).toBe(90);
    const next=(await createJob(db,identity,permissionIds,{postalCode:'10001',workspaceId,submissionId:randomUUID(),customerId,title:'New routine job',service:'repairs',primaryOwnerId:users.field})).jobId;
    const occurrence=await db('workflowSteps').where({workflowId:draft.id,jobId:next}).first();expect(occurrence).toBeTruthy();await processWorkflowStep(db,workspaceId,occurrence.id);
    const booked=(await db('calendarVisitRecords').where({workspaceId,jobId:next}).whereNull('endedAt').first()).visitId;
    expect((await db('calendarVisits').where({id:booked}).first()).workTime.durationMinutes).toBe(90);
    await page.goto(`${origin}/jobs/${next}?workspace=${workspaceId}`);await expect(page.getByRole('heading',{name:'New routine job',exact:true})).toBeVisible();
  } finally {await context.close();}
});

test('Qualified workers save from Services and a reviewed workflow assigns and books a new job',async({browser})=>{
 const identity={workspaceId,userId:users.owner},days=['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
 await db('calendarPersonAvailability').insert({workspaceId,personId:users.field,version:1,timezone:'America/New_York',availability:JSON.stringify({weeklyHours:Object.fromEntries(days.map(day=>[day,{startTime:'08:00',endTime:'17:00'}])),unavailableDates:[]})}).onConflict(['workspaceId','personId']).merge();
 const context=await browser.newContext({storageState:await clients.owner.storageState()}),page=await context.newPage();page.setDefaultTimeout(15000);
 try{
  await page.goto(`/settings/services?workspace=${workspaceId}`);await page.getByRole('button',{name:'0 qualified workers for Repairs',exact:true}).click();const drawer=page.getByRole('dialog',{name:'Qualified workers',exact:true});await drawer.getByRole('combobox',{name:'Add a worker',exact:true}).fill('Calendar field');await drawer.getByRole('option',{name:'Calendar field',exact:true}).click();await drawer.getByRole('button',{name:'Save changes',exact:true}).click();await expect(drawer).not.toBeVisible();await expect(page.getByRole('button',{name:'1 qualified worker for Repairs',exact:true})).toBeVisible();
  const threadId=randomUUID(),turnId=randomUUID();await db('chatThreads').insert({id:threadId,...identity});await db('chatTurns').insert({id:turnId,threadId,...identity,clientTurnId:randomUUID(),requestHash:'qualified-ui-fixture',surfaceKey:'workflows.list',state:'completed',leaseUntil:new Date(),proposalFamilies:JSON.stringify(['workflow'])});
  const draft=await withWorkspaceAuthorization(db,identity,permissionIds,true,(trx,authority)=>prepareWorkflowInTransaction(trx,authority,{threadId,turnId},{kind:'routine_booking',name:'Qualified repairs UI',service:'Repairs',assignmentMode:'qualified_if_unassigned',bookingRules:{durationMinutes:60,gapMinutes:0,horizonDays:14,weekdays:days,hours:{startTime:'08:00',endTime:'17:00'}},recipient:'me',businessDays:null,localTime:null}));
  const published=await clients.owner.post('/api/chat/workflows/proposals',{headers,data:{workspaceId,id:draft.id,inputHash:draft.inputHash,decision:'confirm'}});expect(published.status()).toBe(200);
  await page.goto(`/workflows?workspace=${workspaceId}`);await page.getByRole('button',{name:'Actions for Qualified repairs UI',exact:true}).click();await page.getByRole('menuitem',{name:'Edit',exact:true}).click();const edit=page.getByRole('dialog');await edit.getByRole('button',{name:'Change settings',exact:true}).click();await expect(edit.getByRole('combobox',{name:'Assign work',exact:true})).toHaveValue('qualified_if_unassigned');await edit.getByLabel('Time needed (minutes)',{exact:true}).fill('90');await edit.getByRole('button',{name:'Save changes',exact:true}).click();await expect(edit).not.toBeVisible();
  const next=(await createJob(db,identity,permissionIds,{postalCode:'10001',workspaceId,submissionId:randomUUID(),customerId,title:'Qualified service job',service:'Repairs',primaryOwnerId:null})).jobId,step=await db('workflowSteps').where({jobId:next,workflowId:draft.id}).first();expect(step).toBeTruthy();await processWorkflowStep(db,workspaceId,step.id);const job=await db('jobs').where({id:next}).first();expect(job.primaryOwnerId).toBe(users.field);expect(job.status).toBe('scheduled');const visit=(await db('calendarVisitRecords').where({jobId:next}).whereNull('endedAt').first()).visitId;expect((await db('calendarVisits').where({id:visit}).first()).workTime.durationMinutes).toBe(90);const notice=await db('workflowBookingNotifications').where({jobId:next,event:'booked'}).first();expect(notice.snapshot.result.assignedWorker.name).toBe('Calendar field');
  await page.goto(`/jobs/${next}?workspace=${workspaceId}`);await expect(page.getByRole('heading',{name:'Qualified service job',exact:true})).toBeVisible();
 }finally{await context.close();}
});

test('Cancellation opening reviews a replacement and books only after confirmation',async({browser})=>{
 await db('workspaces').where({id:workspaceId}).update({timezone:'America/New_York'});
 const identity={workspaceId,userId:users.owner},days=['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
 await db('users').where({id:users.owner}).update({emailVerified:true});
 await db('calendarPersonAvailability').insert({workspaceId,personId:users.field,version:1,timezone:'America/New_York',availability:JSON.stringify({weeklyHours:Object.fromEntries(days.map(day=>[day,{startTime:'08:00',endTime:'17:00'}])),unavailableDates:[]})}).onConflict(['workspaceId','personId']).merge();
 const service=await db('workspaceServices').where({workspaceId,service:'repairs'}).first();await db('serviceQualifiedWorkers').insert({workspaceId,serviceId:service.id,personId:users.field,priority:0}).onConflict(['workspaceId','serviceId','personId']).ignore();
 const threadId=randomUUID(),turnId=randomUUID();await db('chatThreads').insert({id:threadId,...identity});await db('chatTurns').insert({id:turnId,threadId,...identity,clientTurnId:randomUUID(),requestHash:'cancellation-ui-fixture',surfaceKey:'workflows.list',state:'completed',leaseUntil:new Date(),proposalFamilies:JSON.stringify(['workflow'])});
 const draft=await withWorkspaceAuthorization(db,identity,permissionIds,true,(trx,authority)=>prepareWorkflowInTransaction(trx,authority,{threadId,turnId},{kind:'cancellation_fill',name:'Fill repairs openings',service:'Repairs',cancellationRules:{durationMinutes:60,gapMinutes:30},recipient:'me',businessDays:null,localTime:null}));
 expect((await clients.owner.post('/api/chat/workflows/proposals',{headers,data:{workspaceId,id:draft.id,inputHash:draft.inputHash,decision:'confirm'}})).status()).toBe(200);
 const source=(await createJob(db,identity,permissionIds,{postalCode:'10001',workspaceId,submissionId:randomUUID(),customerId,title:'Canceled opening source',service:'repairs',primaryOwnerId:users.field})).jobId;
 const link=await db('calendarVisitRecords').where({workspaceId,jobId:source}).whereNull('endedAt').first(),target=await (await clients.owner.get(`/api/calendar/${link.visitId}?workspace=${workspaceId}`)).json();
 const today=(await db.raw(`SELECT to_char(now() AT TIME ZONE 'America/New_York' + interval '2 days','YYYY-MM-DD') AS date`)).rows[0].date;
 const scheduled=await clients.owner.patch(`/api/calendar/${target.id}`,{headers,data:{workspaceId,submissionId:randomUUID(),visitId:target.id,...target.review,schedule:{scheduledDate:today,arrivalWindow:null,workTime:{startTime:'10:00',durationMinutes:120}}}});expect(scheduled.status()).toBe(200);
 const candidate=(await createJob(db,identity,permissionIds,{postalCode:'10001',workspaceId,submissionId:randomUUID(),customerId,title:'Replacement repair',service:'repairs',primaryOwnerId:null})).jobId;
 const sourceJob=await db('jobs').where({id:source}).first();expect((await clients.owner.patch(`/api/jobs/${source}`,{headers,data:{workspaceId,jobId:source,submissionId:randomUUID(),expectedVersion:sourceJob.version,action:'status',to:'canceled',cancellationReason:'customer-canceled',confirmed:true}})).status()).toBe(200);
 const opening=await db('workflowCancellationOpenings').where({workspaceId,workflowId:draft.id}).first();expect(opening).toBeTruthy();const step=await db('workflowSteps').where({openingId:opening.id}).first();const processed=await processWorkflowStep(db,workspaceId,step.id);const projected=await clients.owner.get(`/api/workflows/openings/${opening.id}?workspace=${workspaceId}`);expect(processed.delivered,JSON.stringify({processed,status:projected.status(),view:await projected.json(),steps:await db('workflowSteps').where({id:step.id})})).toBe(1);
 const notices=await clients.owner.get(`/api/notifications?workspace=${workspaceId}`);expect(notices.status()).toBe(200);expect((await notices.json()).items.some((item:{kind:string})=>item.kind==='workflow_cancellation')).toBe(true);
 const context=await browser.newContext({storageState:await clients.owner.storageState()}),page=await context.newPage();page.setDefaultTimeout(15000);
 try{
  await page.goto(`/workflows/openings/${opening.id}?workspace=${workspaceId}`);await expect(page.getByRole('heading',{name:'Fill an opening',exact:true})).toBeVisible();const number=`J-${String((await db('jobs').where({id:candidate}).first()).jobNumber).padStart(4,'0')}`;
  await page.getByRole('button',{name:`Review booking: ${number}`,exact:true}).click();const dialog=page.getByRole('dialog',{name:'Review replacement',exact:true});await expect(dialog.getByText('Replacement repair',{exact:false})).toBeVisible();expect((await db('jobs').where({id:candidate}).first()).scheduledDate).toBeNull();
  await dialog.getByRole('button',{name:'Confirm booking',exact:true}).click();await expect(dialog).not.toBeVisible();await expect(page.getByText('This opening has been filled.',{exact:true})).toBeVisible();const saved=await db('jobs').where({id:candidate}).first();expect(saved.status).toBe('scheduled');expect(saved.primaryOwnerId).toBe(users.field);expect((await db('workflowCancellationBookings').where({openingId:opening.id})).length).toBe(1);
  await page.reload();await expect(page.getByText('This opening has been filled.',{exact:true})).toBeVisible();
 }finally{await context.close();}
});


test('Service reminder customer page reviews email before queuing and preserves the receipt',async({browser})=>{
 await db('workspaces').where({id:workspaceId}).update({timezone:'America/New_York'});
 const identity={workspaceId,userId:users.owner},repeatCustomer=randomUUID();
 await db('customers').insert({id:repeatCustomer,workspaceId,name:'Skyler Repeat',type:'person',companyName:'',email:'repeat@example.test',phone:'',location:'',internalNotes:''});
 const source=(await createJob(db,identity,permissionIds,{postalCode:'10001',workspaceId,submissionId:randomUUID(),customerId:repeatCustomer,title:'Completed repeat repair',service:'repairs',primaryOwnerId:users.field})).jobId;
 let row=await db('jobs').where({id:source}).first();await mutateJob(db,identity,permissionIds,{workspaceId,jobId:source,submissionId:randomUUID(),expectedVersion:row.version,action:'status',to:'in-progress'});row=await db('jobs').where({id:source}).first();await mutateJob(db,identity,permissionIds,{workspaceId,jobId:source,submissionId:randomUUID(),expectedVersion:row.version,action:'status',to:'completed',confirmed:true});
 await db('jobActivity').where({jobId:source,type:'status'}).whereRaw("changes->>'to'='completed'").update({createdAt:new Date('2026-02-28T15:00:00Z')});
 const threadId=randomUUID(),turnId=randomUUID();await db('chatThreads').insert({id:threadId,...identity});await db('chatTurns').insert({id:turnId,threadId,...identity,clientTurnId:randomUUID(),requestHash:'service-due-ui-fixture',surfaceKey:'workflows.list',state:'completed',leaseUntil:new Date(),proposalFamilies:JSON.stringify(['workflow'])});
 const draft=await withWorkspaceAuthorization(db,identity,permissionIds,true,(trx,authority)=>prepareWorkflowInTransaction(trx,authority,{threadId,turnId},{kind:'service_due',name:'Repeat repairs reminders',service:'repairs',serviceDueRules:{intervalMonths:6,includeExisting:true},recipient:'me',businessDays:null,localTime:'09:00'}));
 expect((await clients.owner.post('/api/chat/workflows/proposals',{headers,data:{workspaceId,id:draft.id,inputHash:draft.inputHash,decision:'confirm'}})).status()).toBe(200);
 const init=await db('workflowSteps').where({workflowId:draft.id,recordKind:'service_due_init'}).first();await processServiceDueStep(db,workspaceId,init.id,users.owner,permissionIds);
 const endpoint=`/api/workflows/services/${draft.id}`;
 expect((await clients.owner.post(endpoint,{headers,data:{workspaceId,requestId:randomUUID(),command:{action:'company',expectedVersion:0,phone:'555-010-0142',email:'office@example.test'}}})).status()).toBe(200);
 const context=await browser.newContext({storageState:await clients.owner.storageState()}),page=await context.newPage();page.setDefaultTimeout(20000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 try{await page.goto(`/workflows/services/${draft.id}?workspace=${workspaceId}`);await expect(page.getByRole('button',{name:'Skyler Repeat',exact:true})).toBeVisible();const refreshed=page.waitForResponse(response=>response.url().includes(endpoint)&&response.request().method()==='GET');await page.getByRole('button',{name:'Refresh list',exact:true}).click();expect((await refreshed).status()).toBe(200);await expect(page.getByRole('button',{name:'Skyler Repeat',exact:true})).toBeVisible();await page.getByRole('button',{name:'Prepare service email'}).click();const editor=page.getByRole('dialog',{name:'Prepare service email'});await expect(editor.getByLabel('Subject',{exact:true})).toHaveValue('Time for your next {Service}?');await editor.getByRole('button',{name:'Cancel',exact:true}).click();
 await page.getByRole('checkbox',{name:'Select Skyler Repeat'}).check();await page.getByRole('button',{name:'Review emails (1)'}).click();const review=page.getByRole('dialog',{name:'Review customer emails'});await expect(review.getByRole('combobox',{name:'Recipient'})).toHaveText('Skyler Repeat · repeat@example.test');expect((await db('serviceOutreachDeliveries').where({workflowId:draft.id})).length).toBe(0);await review.getByRole('button',{name:'Send 1 email'}).click();await expect(page.getByRole('dialog',{name:'Email results'})).toBeVisible();expect((await db('serviceOutreachDeliveries').where({workflowId:draft.id})).length).toBe(1);await page.getByRole('button',{name:'Done',exact:true}).click();await page.reload();await expect(page.getByRole('table').getByText('Email queued',{exact:true})).toBeVisible();expect(errors).toEqual([]);
 }finally{await context.close();}
});


test('Completion handoff notifies once for a completed job and opens its current work orders',async({browser})=>{
 const identity={workspaceId,userId:users.owner};const threadId=randomUUID(),turnId=randomUUID();await db('chatThreads').insert({id:threadId,...identity});await db('chatTurns').insert({id:turnId,threadId,...identity,clientTurnId:randomUUID(),requestHash:'handoff-ui-fixture',surfaceKey:'workflows.list',state:'completed',leaseUntil:new Date(),proposalFamilies:JSON.stringify(['workflow'])});const draft=await withWorkspaceAuthorization(db,identity,permissionIds,true,(trx,c)=>prepareWorkflowInTransaction(trx,c,{threadId,turnId},{kind:'completion_handoff',name:'Completed job still has open work orders',recipient:'me',businessDays:null,localTime:null}));
 const options=await clients.owner.get(`/api/workflows/completion-handoff-options?workspace=${workspaceId}`);expect(options.status()).toBe(200);expect((await options.json()).recipients.some((p:{id:string})=>p.id===users.owner)).toBe(true);
 expect((await clients.owner.post('/api/chat/workflows/proposals',{headers,data:{workspaceId,id:draft.id,inputHash:draft.inputHash,decision:'confirm',handoffValues:{name:draft.name,recipientId:users.owner,notifications:{inApp:true,email:true}}}})).status()).toBe(200);
 const j=(await createJob(db,identity,permissionIds,{postalCode:'10001',workspaceId,submissionId:randomUUID(),customerId,title:'Handoff browser fixture',primaryOwnerId:users.owner})).jobId;
 const order=(await createWorkOrder(db,identity,permissionIds,{workspaceId,submissionId:randomUUID(),jobId:j,title:'Finish roofing inspection',assigneeId:users.owner,source:{kind:'blank'}})).workOrderId;
 const row=await db('jobs').where({id:j}).first();expect((await clients.owner.patch(`/api/jobs/${j}`,{headers,data:{workspaceId,jobId:j,submissionId:randomUUID(),expectedVersion:row.version,action:'status',to:'completed',confirmed:true}})).status()).toBe(200);
 const step=await db('workflowSteps').where({workflowId:draft.id,jobId:j,recordKind:'handoff'}).first();expect(step).toBeTruthy();expect((await processWorkflowStep(db,workspaceId,step.id)).delivered).toBe(1);expect((await processWorkflowStep(db,workspaceId,step.id)).delivered).toBe(0);
 const notices=await clients.owner.get(`/api/notifications?workspace=${workspaceId}`);expect(notices.status()).toBe(200);expect((await notices.json()).items.some((n:{kind:string})=>n.kind==='completion_handoff')).toBe(true);
 const context=await browser.newContext({storageState:await clients.owner.storageState()}),page=await context.newPage();page.setDefaultTimeout(20000);
 try{await page.goto(`/workflows?workspace=${workspaceId}`);await expect(page.getByRole('table').getByRole('button',{name:draft.name,exact:true})).toBeVisible();await page.getByRole('button',{name:/Open notifications/}).click();const notice=page.getByRole('dialog',{name:'Notifications'}).getByRole('listitem').filter({has:page.getByRole('heading',{name:'Completed job still has open work orders'})});await expect(notice.getByText(/Finish roofing inspection/)).toBeVisible();await expect(notice.getByRole('link',{name:'Open job'})).toHaveAttribute('href',`/jobs/${j}?workspace=${workspaceId}`);await notice.getByRole('link',{name:'Open job'}).click();await expect(page).toHaveURL(new RegExp(`/jobs/${j}`));await expect(page.getByText('Finish roofing inspection',{exact:false}).first()).toBeVisible();expect((await db('workOrders').where({id:order}).first()).status).toBe('draft');
 }finally{await context.close();}
});
test('Team settings saves member ZIP coverage and shared Calendar availability in one reviewed mutation', async ({ browser }) => {
  const endpoint = `/api/settings/team?workspace=${workspaceId}`;
  const first = await clients.owner.get(endpoint); expect(first.status()).toBe(200); expect(first.headers()['cache-control']).toContain('no-store');
  const snapshot = await first.json(), member = snapshot.members.find((person: { id: string }) => person.id === users.field);
  expect((await clients.field.get(endpoint)).status()).toBe(404);
  expect((await clients.other.get(endpoint)).status()).toBe(404);
  const seed = { workspaceId, requestId: randomUUID(), command: { personId: users.field,
    availability: { revision: member.revision, timezone: member.timezone, value: { weeklyHours: { monday: { startTime: '08:00', endTime: '17:00' }, tuesday: null, wednesday: null, thursday: null, friday: null, saturday: null, sunday: null }, unavailableDates: [] } },
    coverage: { revision: member.coverageRevision, countryCode: 'US', postalCodes: ['10001'] } } };
  expect((await clients.owner.put(endpoint, { headers: { Origin: 'https://example.test' }, data: seed })).status()).toBe(403);
  expect((await clients.owner.put(endpoint, { headers, data: seed })).status()).toBe(200);
  const context = await browser.newContext({ storageState: await clients.owner.storageState() }), page = await context.newPage(); page.setDefaultTimeout(20000);
  try {
    await page.goto(`/settings/team?workspace=${workspaceId}`); await expect(page.getByRole('heading', { name: 'Team', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Team', exact: true })).toHaveAttribute('aria-current', 'page');
    await page.getByRole('button', { name: 'Options for Calendar field' }).click(); await page.getByRole('menuitem', { name: 'Work ZIP codes' }).click();
    const dialog = page.getByRole('dialog', { name: 'Calendar field' }); await dialog.getByRole('textbox', { name: 'Work ZIP codes', exact: true }).fill('00501-1234, 10002');
    await expect(dialog.getByText('Changes apply to future automatic selections. Existing assignments and visits stay unchanged.')).toHaveCount(0);
    await dialog.getByRole('tab', { name: 'Availability', exact: true }).click(); await dialog.getByLabel('Monday', { exact: true }).uncheck();
    const before = (await db('teamSettingsOperations').where({ workspaceId })).length;
    const write = page.waitForResponse(response => response.url().includes('/api/settings/team') && response.request().method() === 'PUT');
    await dialog.getByRole('button', { name: 'Save changes', exact: true }).click(); expect((await write).status()).toBe(200);
    await expect(dialog).not.toBeVisible(); expect((await db('teamSettingsOperations').where({ workspaceId })).length).toBe(before + 1);
    await page.reload(); await expect(page.getByText('00501, 10002', { exact: true })).toBeVisible();
    const calendar = await clients.owner.get(`/api/calendar/availability/${users.field}?workspace=${workspaceId}`); expect(calendar.status()).toBe(200);
    expect((await calendar.json()).availability.weeklyHours.monday).toBeNull();
    const latest = (await (await clients.owner.get(endpoint)).json()).members.find((person: { id: string }) => person.id === users.field);
    expect((await clients.owner.put(endpoint, { headers, data: { workspaceId, requestId: randomUUID(), command: { personId: users.field, coverage: { revision: latest.coverageRevision, countryCode: 'US', postalCodes: ['Manhattan'] } } } })).status()).toBe(422);
  } finally { await context.close(); }
});
test('Job ZIP is required in the API and Work details, normalizes ZIP+4 and preserves legacy records', async ({ browser }) => {
  const creation = await (await clients.owner.get(`/api/jobs/creation-deadline?workspace=${workspaceId}`)).json();
  const base = { workspaceId, submissionId: randomUUID(), customerId, title: 'Structured postal test', primaryOwnerId: null,
    deadlineIntent: { mode: 'workspace', revision: creation.context.revision },
    deadlinePreview: { revision: creation.context.revision, createdDate: creation.context.createdDate, resolvedDate: creation.context.projectedDate, timezone: creation.context.timezone },
    completionDeadline: creation.context.projectedDate };
  expect((await clients.owner.post('/api/jobs', { headers, data: base })).status()).toBe(422);
  const response = await clients.owner.post('/api/jobs', { headers, data: { ...base, postalCode: '00501-1234' } });
  expect(response.status()).toBe(201); const id = (await response.json()).jobId;
  let saved = await db('jobs').where({ id, workspaceId }).first(); expect(saved.postalCode).toBe('00501'); expect(saved.countryCode).toBe('US');
  await db('jobs').where({ id, workspaceId }).update({ postalCode: null, countryCode: null });
  const context = await browser.newContext({ storageState: await clients.owner.storageState() }), page = await context.newPage(); page.setDefaultTimeout(20000);
  try {
    await page.goto(`/jobs/${id}?workspace=${workspaceId}`); await expect(page.getByText('ZIP code needed', { exact: true })).toBeVisible();
    const card = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Work details', exact: true }) });
    await card.getByRole('button', { name: 'Edit details', exact: true }).click(); const dialog = page.getByRole('dialog', { name: 'Edit work details' });
    await expect(dialog.getByRole('button', { name: 'Save details' })).toBeDisabled(); await dialog.getByRole('textbox', { name: 'Job ZIP code' }).fill('10002');
    const edited = page.waitForResponse(response => response.url().includes(`/api/jobs/${id}`) && response.request().method() === 'PATCH');
    await dialog.getByRole('button', { name: 'Save details' }).click(); expect((await edited).status()).toBe(200); await expect(dialog).not.toBeVisible({ timeout: 20000 });
    await page.reload(); await expect(page.getByText('ZIP 10002', { exact: true })).toBeVisible();
    saved = await db('jobs').where({ id, workspaceId }).first(); expect(saved.postalCode).toBe('10002'); expect(saved.status).toBe('needs-scheduling');
    const lead = await clients.owner.post('/api/leads', { headers, data: { workspaceId, submissionId: randomUUID(), lead: {
      name: 'Postal lead fixture', email: '', phone: '', service: 'Repairs', address: 'Address with 99999', postalCode: '00501-1234', details: '', notes: '', source: 'website', stage: 'new', ownerId: '',
    } } });
    expect(lead.status()).toBe(201); const leadId = (await lead.json()).leadId;
    const source = await db('leads').where({ id: leadId, workspaceId }).first(); expect(source.postalCode).toBe('00501'); expect(source.countryCode).toBe('US');
  } finally { await context.close(); }
});
test('Smart lead routing publishes an explicit ZIP team, assigns once and edits through the canonical review', async ({ browser }) => {
  const identity={workspaceId,userId:users.owner},teamPath=`/api/settings/team?workspace=${workspaceId}`;
  const config=initialCaptureSetupConfiguration('website',{businessName:'Routing test',businessEmail:'',businessPhone:''});
  config.fields!.find(field=>field.key==='postalCode')!.required=true;
  const source=await createCaptureDraft(db,identity,permissionIds,{workspaceId,requestId:randomUUID(),name:'ZIP website form',configuration:config});
  const authority={websiteReady:async()=>true,gmailReady:async()=>false};
  const review=await readCapturePublicationReview(db,identity,permissionIds,{workspaceId,sourceId:source.sourceId},authority);
  await publishCaptureDraft(db,identity,permissionIds,{workspaceId,sourceId:source.sourceId,requestId:randomUUID(),confirmed:true,expectedVersion:review.sourceVersion,draftVersion:review.draftVersion,configurationVersion:review.configurationVersion,baseApprovedVersion:review.baseApprovedVersion,timing:{kind:'now'}},authority);
  const args = { operation: 'create', workflowRef: null, kind: 'lead_routing', name: 'Share ZIP website leads', source: 'ZIP website form', recipient: null, businessDays: null, localTime: null, notifications: null, routing: { strategy: 'round_robin', members: [users.owner, users.field], matchWorkZipCodes: true } };
  const prepareThroughChat = async (patch = {}) => {
    const chat = await clients.owner.post('/api/chat/turns', { headers, data: { workspaceId, clientTurnId: randomUUID(), surfaceKey: 'workflows.list',
      message: 'fixture:tool:' + JSON.stringify({ name: 'workflows_prepare', args: { ...args, ...patch } }) } });
    expect(chat.status()).toBe(200);
    const events = (await chat.text()).split('\n\n').filter(frame => frame.startsWith('data:')).map(frame => JSON.parse(frame.slice(5)));
    expect(events.at(-1)?.type, JSON.stringify(events)).toBe('turn.completed');
    return events;
  };
  const incomplete = await prepareThroughChat({ name: null, recipient: 'Fictional extra recipient' });
  expect(incomplete.some(event => event.type === 'workflow.draft')).toBe(false);
  const missingCoverage = await prepareThroughChat();
  expect(missingCoverage.some(event => event.type === 'workflow.draft')).toBe(false);
  expect(Number((await db('workflows').where({ workspaceId }).count('* as n').first())!.n)).toBe(0);
  const settings=await(await clients.owner.get(teamPath)).json();
  for(const personId of [users.owner,users.field]){
    const member=settings.members.find((person:{id:string})=>person.id===personId);
    expect((await clients.owner.put(teamPath,{headers,data:{workspaceId,requestId:randomUUID(),command:{personId,coverage:{revision:member.coverageRevision,countryCode:'US',postalCodes:['10001']}}}})).status()).toBe(200);
  }
  const events = await prepareThroughChat();
  const draft = workflowDraftSchema.parse(events.find(event => event.type === 'workflow.draft')?.result);
  expect(draft.definition.recipientId).toBeUndefined();
  expect((await clients.owner.post('/api/chat/workflows/proposals',{headers,data:{workspaceId,id:draft.id,inputHash:draft.inputHash,decision:'confirm',routingValues:{name:draft.name,sourceId:source.sourceId,strategy:'round_robin',memberIds:[users.owner,users.field],matchWorkZipCodes:true,notifications:{inApp:true,email:true}}}})).status()).toBe(200);
  const options=await clients.owner.get(`/api/workflows/routing-options?workspace=${workspaceId}`);expect(options.status()).toBe(200);expect((await options.json()).sources.find((item:{id:string})=>item.id===source.sourceId).collectsPostalCode).toBe(true);
  const pub=await db('capturePublications').where({sourceId:source.sourceId}).first();
  for(let index=0;index<2;index++){
    const issuedAt=Math.floor(Date.now()/1000)-2;
    const value={proof:{purpose:'capture_submission' as const,audience:origin,publicKey:pub.publicKey,publicationVersion:pub.version,configurationVersion:pub.configurationVersion,submissionId:randomUUID(),issuedAt,expiresAt:issuedAt+1800},submission:{context:'fixture-signed-outside-data-boundary',requestId:randomUUID(),answers:{name:'ZIP customer',email:`zip-${index}@example.test`,service:'Repairs',postalCode:'10001'},consent:null,website:''},clientHash:'a'.repeat(64),limits:{challengeAfter:100,hardLimit:200,sourceRequestsPerMinute:1000,maxPendingItems:10000,maxRetainedBytes:67108864}};
    expect((await prepareCaptureSubmission(db,value)).state).toBe('ready');expect((await commitCaptureSubmission(db,value)).state).toBe('accepted');expect((await commitCaptureSubmission(db,value)).state).toBe('accepted');
  }
  expect((await db('workflowRoutingReceipts').where({workflowId:draft.id}).orderBy('createdAt')).map(row=>row.assigneeId)).toEqual([users.owner,users.field]);
  const context=await browser.newContext({storageState:await clients.owner.storageState()}),page=await context.newPage();page.setDefaultTimeout(20000);
  try{
    await page.goto(`/workflows?workspace=${workspaceId}`);
    await expect(page.getByText('1 of 2 workflows used')).toBeVisible();
    await expect(page.getByLabel('Rows per page')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Go to next page' })).toHaveCount(0);
    const row=page.getByRole('row').filter({hasText:'Share ZIP website leads'});await row.getByRole('button',{name:'Actions for Share ZIP website leads',exact:true}).click();await page.getByRole('menuitem',{name:'Edit',exact:true}).click();
    const dialog=page.getByRole('dialog');await dialog.getByRole('button',{name:'Change settings',exact:true}).click();await dialog.getByRole('combobox',{name:'Assign using'}).selectOption('fewest_open_leads');
    const saved=page.waitForResponse(response=>response.url().includes('/api/workflows/edit')&&response.request().method()==='POST');await dialog.getByRole('button',{name:'Save changes',exact:true}).click();expect((await saved).status()).toBe(200);await expect(dialog).not.toBeVisible({timeout:20000});
    const current=await db('workflows').where({id:draft.id}).first();expect(current.definition.routing.strategy).toBe('fewest_open_leads');expect(current.definition.recipientId).toBeUndefined();
    const extraThread = randomUUID(), extraTurn = randomUUID();
    await db('chatThreads').insert({ id: extraThread, ...identity });
    await db('chatTurns').insert({ id: extraTurn, threadId: extraThread, ...identity, clientTurnId: randomUUID(), requestHash: 'capacity-fixture', surfaceKey: 'workflows.list', state: 'completed', leaseUntil: new Date(), proposalFamilies: JSON.stringify(['workflow']) });
    const extra = await withWorkspaceAuthorization(db, identity, permissionIds, true, (trx, authority) => prepareWorkflowInTransaction(trx, authority, { threadId: extraThread, turnId: extraTurn }, { kind: 'unassigned_lead', name: 'Capacity test reminder', recipient: 'me', businessDays: 1 }));
    const occupied = randomUUID(); await db('workflows').insert({ id: occupied, workspaceId, name: 'Saved paused workflow', rule: 'Fixture', status: 'paused' });
    const confirm = { workspaceId, id: extra.id, inputHash: extra.inputHash, decision: 'confirm' };
    const blocked = await clients.owner.post('/api/chat/workflows/proposals', { headers, data: confirm });
    expect(blocked.status()).toBe(409); expect((await blocked.json()).error).toContain('Free includes 2 workflows');
    expect(await db('workflows').where({ id: extra.id }).first()).toBeUndefined();
    expect((await clients.owner.post(`/api/workflows?workspace=${workspaceId}`, { headers, data: { workspaceId, id: occupied, version: 1, action: 'delete', confirmation: 'confirm' } })).status()).toBe(200);
    expect((await clients.owner.post('/api/chat/workflows/proposals', { headers, data: confirm })).status()).toBe(200);
    const unpaged = await (await clients.owner.get(`/api/workflows?workspace=${workspaceId}`)).json();
    expect(unpaged.rows).toHaveLength(2); expect(unpaged.capacity).toMatchObject({ plan: 'free', used: 2, limit: 2 });
    expect(unpaged.page).toBeUndefined(); expect(unpaged.pageSize).toBeUndefined();
  }finally{await context.close();}
});

test('Annual service review prepares through chat, publishes once, opens customers and edits while paused', async ({ browser }) => {
  const identity={workspaceId,userId:users.owner};
  await db('workspaceServices').insert({workspaceId,service:'Gutter cleaning'}).onConflict(['workspaceId','service']).ignore();
  const completed=(await createJob(db,identity,permissionIds,{workspaceId,submissionId:randomUUID(),customerId,title:'Annual gutter-cleaning fixture',service:'Gutter cleaning',postalCode:'10001',primaryOwnerId:users.owner})).jobId;
  let current=await db('jobs').where({id:completed}).first();await mutateJob(db,identity,permissionIds,{workspaceId,jobId:completed,submissionId:randomUUID(),expectedVersion:current.version,action:'status',to:'in-progress'});
  current=await db('jobs').where({id:completed}).first();await mutateJob(db,identity,permissionIds,{workspaceId,jobId:completed,submissionId:randomUUID(),expectedVersion:current.version,action:'status',to:'completed',confirmed:true});
  const args={operation:'create',kind:'annual_service_review',name:'Annual gutter-cleaning review',service:'Gutter cleaning',annualReviewRules:{firstReviewDate:'2030-03-15'},recipient:'me',businessDays:null,localTime:'09:00'};
  const chat=await clients.owner.post('/api/chat/turns',{headers,data:{workspaceId,clientTurnId:randomUUID(),surfaceKey:'workflows.list',message:'fixture:tool:'+JSON.stringify({name:'workflows_prepare',args})}});
  expect(chat.status()).toBe(200);const events=(await chat.text()).split('\n\n').filter(frame=>frame.startsWith('data:')).map(frame=>JSON.parse(frame.slice(5)));
  expect(events.at(-1)?.type,JSON.stringify(events)).toBe('turn.completed');const draft=workflowDraftSchema.parse(events.find(event=>event.type==='workflow.draft')?.result);
  expect(await db('workflows').where({id:draft.id}).first()).toBeUndefined();
  const decision={workspaceId,id:draft.id,inputHash:draft.inputHash,decision:'confirm',annualReviewValues:{name:draft.name,service:'Gutter cleaning',rules:{firstReviewDate:'2030-03-15'},recipientId:users.owner,localTime:'09:00',notifications:{inApp:true,email:true}}};
  expect((await clients.owner.post('/api/chat/workflows/proposals',{headers,data:decision})).status()).toBe(200);
  expect((await clients.owner.post('/api/chat/workflows/proposals',{headers,data:decision})).status()).toBe(200);
  const step=await db('workflowSteps').where({workflowId:draft.id,recordKind:'annual_review',status:'queued'}).first();expect(step).toBeTruthy();
  const date=(await db.raw(`SELECT to_char(now() AT TIME ZONE 'America/New_York','YYYY-MM-DD') date`)).rows[0].date;
  await db('workflowSteps').where({id:step.id}).update({visitDate:date,triggeredAt:new Date(),dueAt:new Date(0)});await processWorkflowStep(db,workspaceId,step.id,permissionIds);
  const context=await browser.newContext({storageState:await clients.owner.storageState()}),page=await context.newPage();page.setDefaultTimeout(20000);
  try{
    await page.goto(`/workflows?workspace=${workspaceId}`);const row=page.getByRole('row').filter({hasText:draft.name});
    await row.getByRole('button',{name:`Actions for ${draft.name}`,exact:true}).click();await page.getByRole('menuitem',{name:'Review customers',exact:true}).click();
    await expect(page).toHaveURL(new RegExp(`/workflows/services/${draft.id}`),{timeout:20000});await expect(page.getByRole('heading',{name:/^Gutter cleaning review$/i})).toBeVisible();
    await expect(page.getByRole('table').getByText('To review',{exact:true})).toBeVisible();await expect(page.getByRole('columnheader',{name:'Due date',exact:true})).toHaveCount(0);
    const notices=await(await clients.owner.get(`/api/notifications?workspace=${workspaceId}&page=1`)).json();expect(JSON.stringify(notices)).toContain('"annual":true');
    await page.getByRole('button',{name:'Back to workflows',exact:true}).click();
    await row.getByRole('button',{name:`Actions for ${draft.name}`,exact:true}).click();await page.getByRole('menuitem',{name:'Pause',exact:true}).click();
    await page.getByRole('alertdialog').getByRole('button',{name:'Pause workflow',exact:true}).click();
    await row.getByRole('button',{name:`Actions for ${draft.name}`,exact:true}).click();await page.getByRole('menuitem',{name:'Edit',exact:true}).click();
    const dialog=page.getByRole('dialog');await expect(dialog.getByText('This workflow stays paused after saving.')).toBeVisible();await dialog.getByLabel('Send at',{exact:true}).fill('10:30');
    const saved=page.waitForResponse(response=>response.url().includes('/api/workflows/edit')&&response.request().method()==='POST');await dialog.getByRole('button',{name:'Save changes',exact:true}).click();expect((await saved).status()).toBe(200);await expect(dialog).not.toBeVisible();
    const edited=await db('workflows').where({id:draft.id}).first();expect(edited.status).toBe('paused');expect(edited.definition.localTime).toBe('10:30');
  }finally{await context.close();}
});

test('Customer visit reminder prepares through chat, sends safely and edits while paused', async ({ browser }) => {
  const identity={workspaceId,userId:users.owner};
  await db('customers').where({workspaceId,id:customerId}).update({email:'customer@example.test'});
  await db('workspaces').where({id:workspaceId}).update({businessPhone:'555-010-0142'});
  await db('serviceOutreachCompany').insert({workspaceId,version:1,phone:'555-010-0142',email:'office@example.test'}).onConflict('workspaceId').merge({phone:'555-010-0142',email:'office@example.test'});
  const date=(await db.raw(`SELECT to_char((now() AT TIME ZONE 'America/New_York')::date+2,'YYYY-MM-DD') date`)).rows[0].date;
  const result=await createJob(db,identity,permissionIds,{workspaceId,submissionId:randomUUID(),customerId,title:'Private customer visit browser job',postalCode:'10001',primaryOwnerId:users.owner,scheduledDate:date,arrivalWindow:'09:00-11:00'});
  const link=await db('calendarVisitRecords').where({workspaceId,jobId:result.jobId}).whereNull('endedAt').first();
  const args={operation:'create',kind:'customer_visit_reminder',name:'Customer visit reminder browser',recipient:'me',businessDays:null,localTime:'09:00'};
  const chat=await clients.owner.post('/api/chat/turns',{headers,data:{workspaceId,clientTurnId:randomUUID(),surfaceKey:'workflows.list',message:'fixture:tool:'+JSON.stringify({name:'workflows_prepare',args})}});
  expect(chat.status()).toBe(200);const events=(await chat.text()).split('\n\n').filter(frame=>frame.startsWith('data:')).map(frame=>JSON.parse(frame.slice(5)));
  expect(events.at(-1)?.type,JSON.stringify(events)).toBe('turn.completed');const draft=workflowDraftSchema.parse(events.find(event=>event.type==='workflow.draft')?.result);
  const setup=await clients.owner.get(`/api/workflows/customer-visit-options?workspace=${workspaceId}`);expect(setup.status()).toBe(200);expect((await setup.json()).senderReady).toBe(true);
  const decision={workspaceId,id:draft.id,inputHash:draft.inputHash,decision:'confirm',customerVisitValues:{name:draft.name,localTime:'09:00'}};
  expect((await clients.owner.post('/api/chat/workflows/proposals',{headers,data:decision})).status()).toBe(200);
  expect((await clients.owner.post('/api/chat/workflows/proposals',{headers,data:decision})).status()).toBe(200);
  const init=await db('workflowSteps').where({workflowId:draft.id,recordKind:'customer_visit_init',status:'queued'}).first();await processWorkflowStep(db,workspaceId,init.id,permissionIds);
  const step=await db('workflowSteps').where({workflowId:draft.id,visitId:link.visitId,recordKind:'customer_visit',status:'queued'}).first();expect(step).toBeTruthy();
  await db('workflowSteps').where({id:step.id}).update({triggeredAt:new Date(),dueAt:new Date(0)});
  const sent:{text:string;html:string}[]=[];await processWorkflowStep(db,workspaceId,step.id,permissionIds,{baseURL:origin,send:async mail=>{sent.push(mail);}});
  expect(sent).toHaveLength(1);expect(sent[0].text).toContain('9 AM – 11 AM');expect(sent[0].html).toContain('cid:salesmora-logo');expect(sent[0].text).not.toContain('Private customer visit browser job');
  const receipt=await db('customerVisitReminderDeliveries').where({workflowId:draft.id,visitId:link.visitId}).first();
  const publicClient=await requests.newContext({baseURL:origin});
  try{const preference=await publicClient.get(`/visit-reminders/unsubscribe?token=${receipt.token}`);expect(preference.status()).toBe(200);expect(preference.headers()['referrer-policy']).toBe('no-referrer');// Next development rendering overrides page Cache-Control with no-cache; production config sets private/no-store.
    expect(preference.headers()['cache-control']).toMatch(/no-store|no-cache/);
    const stopped=await publicClient.post('/api/visit-reminders/unsubscribe',{form:{token:receipt.token},maxRedirects:0});expect(stopped.status()).toBe(303);expect((await db('customerVisitReminderPreferences').where({workspaceId,customerId}).first()).disabled).toBe(true);
  }finally{await publicClient.dispose();}

  const context=await browser.newContext({storageState:await clients.owner.storageState()}),page=await context.newPage();page.setDefaultTimeout(20000);
  try{
    await page.goto(`/workflows?workspace=${workspaceId}`);const row=page.getByRole('row').filter({hasText:draft.name});
    await row.getByRole('button',{name:`Actions for ${draft.name}`,exact:true}).click();await expect(page.getByRole('menuitem',{name:'Run now',exact:true})).toHaveCount(0);
    await page.getByRole('menuitem',{name:'Pause',exact:true}).click();await page.getByRole('alertdialog').getByRole('button',{name:'Pause workflow',exact:true}).click();
    await row.getByRole('button',{name:`Actions for ${draft.name}`,exact:true}).click();await page.getByRole('menuitem',{name:'Edit',exact:true}).click();
    const dialog=page.getByRole('dialog');await expect(dialog.getByText('This workflow stays paused after saving.')).toBeVisible();await dialog.getByText('Preview customer email').click();await expect(dialog.getByRole('article',{name:'Customer reminder email'})).toBeVisible();
    await dialog.getByLabel('Send at',{exact:true}).fill('08:30');const response=page.waitForResponse(r=>r.url().includes('/api/workflows/edit')&&r.request().method()==='POST');await dialog.getByRole('button',{name:'Save changes',exact:true}).click();expect((await response).status()).toBe(200);await expect(dialog).not.toBeVisible();
    const changed=await db('workflows').where({id:draft.id}).first();expect(changed.status).toBe('paused');expect(changed.definition.localTime).toBe('08:30');
  }finally{await context.close();}
});

test('Assigned lead cold reminder prepares, notifies its owner and edits while paused', async ({ browser }) => {
  const leadId=randomUUID();await db('leads').insert({id:leadId,workspaceId,name:'Cold lead browser fixture',email:'private@example.test',phone:'',service:'Roofing',submissionId:randomUUID(),submissionHash:'cold-browser-fixture',address:'',details:'',notes:'Private notes',source:'website',stage:'new',ownerId:users.field,lastActivityAt:db.fn.now()});
  const args={operation:'create',kind:'assigned_lead_cold',name:'Assigned cold browser reminder',recipient:'lead owner',businessDays:3,localTime:'09:00'};
  const chat=await clients.owner.post('/api/chat/turns',{headers,data:{workspaceId,clientTurnId:randomUUID(),surfaceKey:'workflows.list',message:'fixture:tool:'+JSON.stringify({name:'workflows_prepare',args})}});expect(chat.status()).toBe(200);
  const events=(await chat.text()).split('\n\n').filter(frame=>frame.startsWith('data:')).map(frame=>JSON.parse(frame.slice(5)));expect(events.at(-1)?.type,JSON.stringify(events)).toBe('turn.completed');const draft=workflowDraftSchema.parse(events.find(e=>e.type==='workflow.draft')?.result);
  expect(draft.definition.kind).toBe('assigned_lead_cold');const review={workspaceId,id:draft.id,inputHash:draft.inputHash,decision:'confirm',assignedLeadColdValues:{name:draft.name,businessDays:3,localTime:'09:00',recipient:{kind:'owner'},notifications:{inApp:true,email:true}}};
  expect((await clients.owner.post('/api/chat/workflows/proposals',{headers,data:review})).status()).toBe(200);expect((await clients.owner.post('/api/chat/workflows/proposals',{headers,data:review})).status()).toBe(200);
  const init=await db('workflowSteps').where({workflowId:draft.id,recordKind:'cold_lead_init',status:'queued'}).first();await processWorkflowStep(db,workspaceId,init.id,permissionIds);
  const step=await db('workflowSteps').where({workflowId:draft.id,leadId,recordKind:'cold_lead',status:'queued'}).first();expect(step).toBeTruthy();expect(step.dueAt>new Date()).toBe(true);await db('workflowSteps').where({id:step.id}).update({dueAt:new Date(0)});await processWorkflowStep(db,workspaceId,step.id,permissionIds);
  const notices=await clients.field.get(`/api/notifications?workspace=${workspaceId}&page=1`);expect(notices.status()).toBe(200);expect((await notices.json()).items).toContainEqual(expect.objectContaining({kind:'lead_workflow',leadId,businessDays:3}));
  const context=await browser.newContext({storageState:await clients.owner.storageState()}),page=await context.newPage();page.setDefaultTimeout(20000);
  try{await page.goto(`/workflows?workspace=${workspaceId}`);const row=page.getByRole('row').filter({hasText:draft.name});await row.getByRole('button',{name:`Actions for ${draft.name}`,exact:true}).click();await expect(page.getByRole('menuitem',{name:'Run now',exact:true})).toHaveCount(0);
    await page.getByRole('menuitem',{name:'Pause',exact:true}).click();await page.getByRole('alertdialog').getByRole('button',{name:'Pause workflow',exact:true}).click();await row.getByRole('button',{name:`Actions for ${draft.name}`,exact:true}).click();await page.getByRole('menuitem',{name:'Edit',exact:true}).click();
    const dialog=page.getByRole('dialog');await expect(dialog.getByText('This workflow stays paused after saving.')).toBeVisible();await expect(dialog.getByRole('combobox',{name:'Notify',exact:true})).toHaveValue('owner');await dialog.getByRole('combobox',{name:'Notify',exact:true}).selectOption(`member:${users.owner}`);await dialog.getByLabel('Send at',{exact:true}).fill('10:00');
    const saved=page.waitForResponse(r=>r.url().includes('/api/workflows/edit')&&r.request().method()==='POST');await dialog.getByRole('button',{name:'Save changes',exact:true}).click();expect((await saved).status()).toBe(200);await expect(dialog).not.toBeVisible();const stored=await db('workflows').where({id:draft.id}).first();expect(stored.status).toBe('paused');expect(stored.definition.recipientMode).toBe('teammate');expect(stored.definition.recipientId).toBe(users.owner);
  }finally{await context.close();}
});

test('Post-job thank-you publishes, sends, confirms public opt-out and edits while paused', async ({ browser }) => {
  const identity={workspaceId,userId:users.owner};
  await db('customers').where({workspaceId,id:customerId}).update({email:'customer@example.test'});
  await db('workspaces').where({id:workspaceId}).update({businessPhone:'555-010-0142'});
  await db('serviceOutreachCompany').insert({workspaceId,version:1,phone:'555-010-0142',email:'office@example.test'}).onConflict('workspaceId').merge({phone:'555-010-0142',email:'office@example.test'});
  const args={operation:'create',kind:'post_job_thank_you',name:'Post-job browser thank-you',recipient:'me',businessDays:null,localTime:'09:00'};
  const chat=await clients.owner.post('/api/chat/turns',{headers,data:{workspaceId,clientTurnId:randomUUID(),surfaceKey:'workflows.list',message:'fixture:tool:'+JSON.stringify({name:'workflows_prepare',args})}});expect(chat.status()).toBe(200);
  const events=(await chat.text()).split('\n\n').filter(frame=>frame.startsWith('data:')).map(frame=>JSON.parse(frame.slice(5)));expect(events.at(-1)?.type,JSON.stringify(events)).toBe('turn.completed');
  const draft=workflowDraftSchema.parse(events.find(e=>e.type==='workflow.draft')?.result);expect(draft.definition.kind).toBe('post_job_thank_you');
  expect((await clients.owner.get(`/api/workflows/post-job-options?workspace=${workspaceId}`)).status()).toBe(200);
  const decision={workspaceId,id:draft.id,inputHash:draft.inputHash,decision:'confirm',postJobValues:{name:draft.name,calendarDays:2,localTime:'09:00',reviewUrl:'',messageChoice:'custom',thankYouMessage:'Thank you from our team. We appreciate your business.'}};
  expect((await clients.owner.post('/api/chat/workflows/proposals',{headers,data:decision})).status()).toBe(200);
  expect((await clients.owner.post('/api/chat/workflows/proposals',{headers,data:decision})).status()).toBe(200);
  const job=await createJob(db,identity,permissionIds,{workspaceId,submissionId:randomUUID(),customerId,postalCode:'10001',title:'Private post-job browser fixture',primaryOwnerId:null});
  await db('jobs').where({id:job.jobId,workspaceId}).update({status:'completed'});
  const step=await db('workflowSteps').where({workflowId:draft.id,jobId:job.jobId,recordKind:'post_job',status:'queued'}).first();expect(step).toBeTruthy();await db('workflowSteps').where({id:step.id}).update({dueAt:new Date(0)});
  const sent:{text:string;html:string}[]=[];await processWorkflowStep(db,workspaceId,step.id,permissionIds,{baseURL:origin,send:async mail=>{sent.push(mail);}});expect(sent).toHaveLength(1);expect(sent[0].text).toContain(decision.postJobValues.thankYouMessage);expect(sent[0].html).toContain('cid:salesmora-logo');expect(sent[0].text).not.toContain('Leave a review');expect(sent[0].text).not.toContain('Private post-job browser fixture');
  const receipt=await db('postJobDeliveries').where({workflowId:draft.id,jobId:job.jobId}).first();
  const publicContext=await browser.newContext(),publicPage=await publicContext.newPage();
  try{const response=await publicPage.goto(`${origin}/thank-you-emails/unsubscribe?token=${receipt.token}`);expect(response?.headers()['referrer-policy']).toBe('no-referrer');expect(response?.headers()['cache-control']).toMatch(/no-store|no-cache/);
    expect((await db('postJobPreferences').where({workspaceId,customerId}).first()).disabled).toBe(false);
    await expect(publicPage.getByRole('heading',{name:'Thank-you and review emails'})).toBeVisible();await publicPage.getByRole('button',{name:'Unsubscribe',exact:true}).click();await expect(publicPage.getByText('You’ve unsubscribed from thank-you and review emails from this company.')).toBeVisible();
    expect((await db('postJobPreferences').where({workspaceId,customerId}).first()).disabled).toBe(true);expect(await db('customerVisitReminderPreferences').where({workspaceId,customerId}).first()).toBeUndefined();
  }finally{await publicContext.close();}
  const context=await browser.newContext({storageState:await clients.owner.storageState()}),page=await context.newPage();page.setDefaultTimeout(20000);
  try{await page.goto(`/workflows?workspace=${workspaceId}`);const row=page.getByRole('row').filter({hasText:draft.name});await row.getByRole('button',{name:`Actions for ${draft.name}`,exact:true}).click();await expect(page.getByRole('menuitem',{name:'Run now',exact:true})).toHaveCount(0);await page.getByRole('menuitem',{name:'Pause',exact:true}).click();await page.getByRole('alertdialog').getByRole('button',{name:'Pause workflow',exact:true}).click();
    await row.getByRole('button',{name:`Actions for ${draft.name}`,exact:true}).click();await page.getByRole('menuitem',{name:'Edit',exact:true}).click();const dialog=page.getByRole('dialog');await expect(dialog.getByText('This workflow stays paused after saving.')).toBeVisible();await expect(dialog.getByRole('textbox',{name:'Thank-you message',exact:true})).toHaveValue(decision.postJobValues.thankYouMessage);await dialog.getByRole('textbox',{name:'Thank-you message',exact:true}).fill('A revised thank-you for future completed work.');
    const saved=page.waitForResponse(r=>r.url().includes('/api/workflows/edit')&&r.request().method()==='POST');await dialog.getByRole('button',{name:'Save changes',exact:true}).click();expect((await saved).status()).toBe(200);await expect(dialog).not.toBeVisible();const stored=await db('workflows').where({id:draft.id}).first();expect(stored.status).toBe('paused');expect(stored.definition.rules.thankYouMessage).toBe('A revised thank-you for future completed work.');
  }finally{await context.close();}
});

test('Customer schedule changes publish, coalesce, confirm public opt-out and edit while paused', async ({ browser }) => {
  const identity={workspaceId,userId:users.owner};
  await db('customers').where({workspaceId,id:customerId}).update({email:'customer@example.test'});
  await db('workspaces').where({id:workspaceId}).update({businessPhone:'555-010-0142'});
  await db('serviceOutreachCompany').insert({workspaceId,version:1,phone:'555-010-0142',email:'office@example.test'}).onConflict('workspaceId').merge({phone:'555-010-0142',email:'office@example.test'});
  const args={operation:'create',kind:'customer_schedule_change',name:'Customer schedule browser notices',recipient:'me',businessDays:null,localTime:null};
  const chat=await clients.owner.post('/api/chat/turns',{headers,data:{workspaceId,clientTurnId:randomUUID(),surfaceKey:'workflows.list',message:'fixture:tool:'+JSON.stringify({name:'workflows_prepare',args})}});expect(chat.status()).toBe(200);
  const events=(await chat.text()).split('\n\n').filter(frame=>frame.startsWith('data:')).map(frame=>JSON.parse(frame.slice(5)));expect(events.at(-1)?.type,JSON.stringify(events)).toBe('turn.completed');const draft=workflowDraftSchema.parse(events.find(e=>e.type==='workflow.draft')?.result);expect(draft.definition.kind).toBe('customer_schedule_change');
  const options=await clients.owner.get(`/api/workflows/schedule-change-options?workspace=${workspaceId}`);expect(options.status()).toBe(200);expect((await options.json()).senderReady).toBe(true);
  const decision={workspaceId,id:draft.id,inputHash:draft.inputHash,decision:'confirm',scheduleChangeValues:{name:draft.name}};
  expect((await clients.owner.post('/api/chat/workflows/proposals',{headers,data:decision})).status()).toBe(200);expect((await clients.owner.post('/api/chat/workflows/proposals',{headers,data:decision})).status()).toBe(200);
  const date=(await db.raw(`SELECT to_char((now() AT TIME ZONE 'UTC')::date+3,'YYYY-MM-DD') date`)).rows[0].date;
  const job=await createJob(db,identity,permissionIds,{workspaceId,submissionId:randomUUID(),customerId,postalCode:'10001',title:'Private schedule-change browser fixture',primaryOwnerId:null,scheduledDate:date,arrivalWindow:'09:00-11:00'});
  expect(await db('customerScheduleNotices').where({workflowId:draft.id}).first()).toBeUndefined();
  await mutateJob(db,identity,permissionIds,{workspaceId,jobId:job.jobId,expectedVersion:1,submissionId:randomUUID(),action:'schedule',scheduledDate:date,arrivalWindow:'13:00-15:00'});
  await mutateJob(db,identity,permissionIds,{workspaceId,jobId:job.jobId,expectedVersion:2,submissionId:randomUUID(),action:'schedule',scheduledDate:date,arrivalWindow:'14:00-16:00'});
  const n=await db('customerScheduleNotices').where({workflowId:draft.id,status:'queued'}).first();expect(n.version).toBe(2);expect(n.before.arrivalWindow).toBe('09:00-11:00');expect(n.after.arrivalWindow).toBe('14:00-16:00');await db('customerScheduleNotices').where({id:n.id}).update({dueAt:new Date(0)});
  const sent:{text:string;html:string}[]=[];await processWorkflowStep(db,workspaceId,n.id,permissionIds,{baseURL:origin,send:async mail=>{sent.push(mail);}});expect(sent).toHaveLength(1);expect(sent[0].text).toContain('2 PM – 4 PM');expect(sent[0].html).toContain('cid:salesmora-logo');expect(sent[0].text).not.toContain('Private schedule-change browser fixture');
  const publicContext=await browser.newContext(),publicPage=await publicContext.newPage();
  try{const response=await publicPage.goto(`${origin}/schedule-change-emails/unsubscribe?token=${n.token}`);expect(response?.headers()['referrer-policy']).toBe('no-referrer');expect(response?.headers()['cache-control']).toMatch(/no-store|no-cache/);expect(await db('customerSchedulePreferences').where({workspaceId,customerId}).first()).toBeUndefined();
    await publicPage.getByRole('button',{name:'Unsubscribe',exact:true}).click();await expect(publicPage.getByText('You’ve unsubscribed from schedule-change emails from this company.')).toBeVisible();expect((await db('customerSchedulePreferences').where({workspaceId,customerId}).first()).disabled).toBe(true);expect(await db('customerVisitReminderPreferences').where({workspaceId,customerId}).first()).toBeUndefined();
  }finally{await publicContext.close();}
  const context=await browser.newContext({storageState:await clients.owner.storageState()}),page=await context.newPage();page.setDefaultTimeout(20000);
  try{await page.goto(`/workflows?workspace=${workspaceId}`);const row=page.getByRole('row').filter({hasText:draft.name});await row.getByRole('button',{name:`Actions for ${draft.name}`,exact:true}).click();await expect(page.getByRole('menuitem',{name:'Run now',exact:true})).toHaveCount(0);await page.getByRole('menuitem',{name:'Pause',exact:true}).click();await page.getByRole('alertdialog').getByRole('button',{name:'Pause workflow',exact:true}).click();
    await row.getByRole('button',{name:`Actions for ${draft.name}`,exact:true}).click();await page.getByRole('menuitem',{name:'Edit',exact:true}).click();const dialog=page.getByRole('dialog');await expect(dialog.getByText('This workflow stays paused after saving.')).toBeVisible();await expect(dialog.getByText('5 minutes after the latest change')).toBeVisible();await expect(dialog.getByLabel('Send at',{exact:true})).toHaveCount(0);await dialog.getByRole('button',{name:'Change settings',exact:true}).click();await dialog.getByLabel('Workflow name',{exact:true}).fill('Customer visit update emails');
    const saved=page.waitForResponse(r=>r.url().includes('/api/workflows/edit')&&r.request().method()==='POST');await dialog.getByRole('button',{name:'Save changes',exact:true}).click();expect((await saved).status()).toBe(200);await expect(dialog).not.toBeVisible();const stored=await db('workflows').where({id:draft.id}).first();expect(stored.status).toBe('paused');expect(stored.name).toBe('Customer visit update emails');expect(stored.definition.quietMinutes).toBe(5);
  }finally{await context.close();}
});
