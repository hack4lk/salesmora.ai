import { test, expect, request as requests, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase, createJob, scheduleDeadlineReminders } from '@salesmora/data';
import { permissionIds, jobCreationDeadlineContextSchema } from '@salesmora/contracts';
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL) throw Error('Use the isolated test database.');
const db = createDatabase(connection), origin = 'http://127.0.0.1:3002', headers = { Origin: origin }, prefix = `job-settings-${randomUUID()}`;
const clients: Record<string, APIRequestContext> = {}, users: Record<string, string> = {};
let workspaceId: string;
const url = () => `/api/settings/job-notifications?workspace=${workspaceId}`;
test.setTimeout(120000);
async function preparePremium() {
  await db('workspaceSubscriptions').insert({ workspaceId, catalogVersion: 'fixture', plan: 'premium', status: 'active', paidThrough: new Date(Date.now() + 86400000) }).onConflict('workspaceId').merge({ plan: 'premium', status: 'active', paidThrough: new Date(Date.now() + 86400000) });
  const current = await (await clients.owner.get(url())).json();
  expect((await clients.owner.put(url(), { headers, data: { workspaceId, section: 'deadline', submissionId: randomUUID(), revision: current.deadline.revision, values: { mode: 'relative', days: 14, count: 'business' } } })).status()).toBe(200);
}

test.beforeAll(async () => {
  test.setTimeout(120000);
  await db('rateLimits').delete();
  for (const role of ['owner', 'admin', 'office', 'field']) {
    clients[role] = await requests.newContext({ baseURL: origin }); const email = `${prefix}-${role}@example.test`;
    expect((await clients[role].post('/api/auth/sign-up/email', { headers, data: { name: `Job settings ${role}`, email, password: 'Fictional-test-password-42!', termsAccepted: true } })).status()).toBe(200);
    users[role] = (await db('users').where({ email }).first()).id;
  }
  const response = await clients.owner.post('/api/workspaces', { headers, data: { business: { businessName: 'Job settings integration fixture', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } } });
  expect(response.status()).toBe(201); workspaceId = (await response.json()).workspaceId;
  await db('workspaceMemberships').insert(['admin', 'office', 'field'].map(role => ({ workspaceId, userId: users[role], role })));
});
test.afterAll(async () => {
  if (workspaceId) { await db('jobs').where({ workspaceId }).delete(); await db('workspaceSubscriptions').where({ workspaceId }).delete(); await db('workspaces').where({ id: workspaceId }).delete(); }
  await db('users').whereIn('id', Object.values(users)).delete(); await Promise.all(Object.values(clients).map(c => c.dispose())); await db.destroy();
});
test('settings API requires identity, role and scope and uses private responses', async () => {
  const response = await clients.owner.get(url()); expect(response.status()).toBe(200); expect(response.headers()['cache-control']).toContain('no-store');
  expect((await response.json()).activation).toBe('reminders-active');
  expect((await clients.admin.get(url())).status()).toBe(200); expect((await clients.field.get(url())).status()).toBe(404);
  expect((await clients.owner.get(`/api/settings/job-notifications?workspace=${randomUUID()}`)).status()).toBe(404);
  const anonymous = await requests.newContext({ baseURL: origin }); expect((await anonymous.get(url())).status()).toBe(401); await anonymous.dispose();
});
test('strict writes require same origin, current entitlement, reviewed revision and retry identity', async () => {
  const current = await (await clients.owner.get(url())).json();
  const input = { workspaceId, submissionId: randomUUID(), section: 'deadline', revision: current.deadline.revision, values: { mode: 'relative', days: 14, count: 'business' } };
  expect((await clients.owner.put(url(), { headers: { Origin: 'https://example.test' }, data: input })).status()).toBe(403);
  expect((await clients.owner.put(url(), { headers, data: { ...input, canManage: true } })).status()).toBe(422);
  expect((await clients.field.put(url(), { headers, data: input })).status()).toBe(404);
  expect((await clients.owner.put(url(), { headers, data: { ...input, section: 'events', values: current.events.values } })).status()).toBe(422);
  expect((await clients.owner.put(url(), { headers, data: input })).status()).toBe(200);
  expect((await clients.owner.put(url(), { headers, data: input })).status()).toBe(200);
  expect((await clients.owner.put(url(), { headers, data: { ...input, submissionId: randomUUID() } })).status()).toBe(409);
  expect((await db('jobNotificationSettingsAudit').where({ workspaceId })).length).toBe(1);
});
test('live page saves one section after review, preserves other edits and persists after reload', async ({ browser }) => {
  await preparePremium();
  const context = await browser.newContext({ storageState: await clients.owner.storageState() }), page = await context.newPage(); page.setDefaultTimeout(20000);
  try {
    await page.goto(`/settings/job-notifications?workspace=${workspaceId}`);
    await expect(page.getByRole('heading', { name: 'Deadline defaults and reminders active' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Deadlines & notifications', exact: true })).toHaveAttribute('aria-current', 'page');
    const deadline = page.getByRole('region', { name: 'Default completion deadline', exact: true }), events = page.getByRole('region', { name: 'Job notification events', exact: true });
    await deadline.getByLabel('Days after Job creation', { exact: true }).fill('15');
    await events.getByRole('checkbox', { name: 'Email for Job status changed', exact: true }).uncheck();
    const before = (await db('jobNotificationSettingsAudit').where({ workspaceId })).length;
    await deadline.getByRole('button', { name: 'Review & save', exact: true }).click();
    expect((await db('jobNotificationSettingsAudit').where({ workspaceId })).length).toBe(before);
    await page.getByRole('button', { name: 'Save deadline default', exact: true }).click();
    await expect(deadline.getByRole('button', { name: 'Review & save', exact: true })).toBeDisabled();
    await expect(events.getByRole('checkbox', { name: 'Email for Job status changed', exact: true })).not.toBeChecked();
    await expect(events.getByRole('button', { name: 'Review & save', exact: true })).toBeEnabled();
    expect((await (await clients.owner.get(url())).json()).events.values.status).toBe(true);
    await events.getByRole('button', { name: 'Review & save', exact: true }).click(); await page.getByRole('button', { name: 'Save email events', exact: true }).click();
    await expect(events.getByRole('button', { name: 'Review & save', exact: true })).toBeDisabled();
    await page.reload(); await expect(deadline.getByLabel('Days after Job creation', { exact: true })).toHaveValue('15'); await expect(events.getByRole('checkbox', { name: 'Email for Job status changed', exact: true })).not.toBeChecked();
    expect((await db('jobs').where({ workspaceId })).length).toBe(0); expect((await db('visitNotifications').where({ workspaceId })).length).toBe(0);
  } finally { await context.close(); }
});
test('live conflicts preserve drafts until reload, and revoked permission blocks the next save', async ({ browser }) => {
  await preparePremium();
  const context = await browser.newContext({ storageState: await clients.admin.storageState() }), page = await context.newPage(); page.setDefaultTimeout(20000);
  try {
    await page.goto(`/settings/job-notifications?workspace=${workspaceId}`);
    const deadline = page.getByRole('region', { name: 'Default completion deadline', exact: true });
    await deadline.getByLabel('Days after Job creation', { exact: true }).fill('16');
    const current = await (await clients.owner.get(url())).json();
    expect((await clients.owner.put(url(), { headers, data: { workspaceId, section: 'deadline', submissionId: randomUUID(), revision: current.deadline.revision, values: { mode: 'relative', days: 17, count: 'business' } } })).status()).toBe(200);
    await deadline.getByRole('button', { name: 'Review & save', exact: true }).click(); await page.getByRole('button', { name: 'Save deadline default', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible(); await expect(page.getByRole('dialog').getByRole('button', { name: 'Save deadline default', exact: true })).toBeDisabled();
    await page.getByRole('dialog').getByRole('button', { name: 'Reload latest values', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0); await expect(deadline.getByLabel('Days after Job creation', { exact: true })).toHaveValue('17');
    await db('workspaceRolePolicies').where({ workspaceId, role: 'admin', permission: 'settings.business.update' }).delete();
    await page.reload(); await expect(deadline.getByLabel('Days after Job creation', { exact: true })).toBeDisabled();
    const input = { workspaceId, section: 'deadline', submissionId: randomUUID(), revision: '0', values: { mode: 'unset' } };
    expect((await clients.admin.put(url(), { headers, data: input })).status()).toBe(404);
  } finally { await context.close(); }
});

test('creation deadline preview is creator-scoped and forged/stale previews cannot write Jobs', async () => {
  await preparePremium();
  const previewURL = `/api/jobs/creation-deadline?workspace=${workspaceId}`;
  expect((await clients.office.get(url())).status()).toBe(404);
  const response = await clients.office.get(previewURL); expect(response.status()).toBe(200); expect(response.headers()['cache-control']).toContain('no-store');
  const preview = await response.json(); expect(Object.keys(preview).sort()).toEqual(['canOverride', 'context']);
  expect((await clients.field.get(previewURL)).status()).toBe(404);
  const customer = await clients.owner.post('/api/customers', { headers, data: { workspaceId, submissionId: randomUUID(), values: { name: 'Deadline creation customer', type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '', ownerId: '' } } }); expect(customer.status()).toBe(201);
  const input = { workspaceId, submissionId: randomUUID(), customerId: (await customer.json()).customerId, title: 'Reviewed default Job', primaryOwnerId: users.owner,
    completionDeadline: preview.context.projectedDate, deadlineIntent: { mode: 'workspace', revision: preview.context.revision }, deadlinePreview: { revision: preview.context.revision, createdDate: preview.context.createdDate, resolvedDate: preview.context.projectedDate, timezone: preview.context.timezone } };
  const before = (await db('jobs').where({ workspaceId })).length;
  const { deadlineIntent: _intent, deadlinePreview: _preview, ...legacyRequest } = input; void _intent; void _preview; expect((await clients.owner.post('/api/jobs', { headers, data: legacyRequest })).status()).toBe(422);
  const stale = await clients.owner.post('/api/jobs', { headers, data: { ...input, deadlinePreview: { ...input.deadlinePreview, createdDate: '2026-01-01' } } }); expect(stale.status()).toBe(409); expect((await stale.json()).code).toBe('deadline-review-changed');
  expect((await clients.owner.post('/api/jobs', { headers, data: { ...input, deadlinePreview: undefined } })).status()).toBe(422);
  const result = await clients.owner.post('/api/jobs', { headers, data: input }); expect(result.status()).toBe(201); const id = (await result.json()).jobId;
  await preparePremium(); const retry = await clients.owner.post('/api/jobs', { headers, data: input }); expect(retry.status()).toBe(201); expect((await retry.json()).jobId).toBe(id);
  expect((await db('jobs').where({ workspaceId })).length).toBe(before + 1);
});
test('live creation uses reviewed default and refreshes stale rules without losing entered work', async ({ browser }) => {
  await preparePremium();
  const customer = await clients.owner.post('/api/customers', { headers, data: { workspaceId, submissionId: randomUUID(), values: { name: 'Live default customer', type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '', ownerId: '' } } }); expect(customer.status()).toBe(201); const customerId = (await customer.json()).customerId;
  const context = await browser.newContext({ storageState: await clients.owner.storageState() }), page = await context.newPage(); page.setDefaultTimeout(20000);
  try {
    await page.goto(`/jobs?workspace=${workspaceId}`); const previewResponse = page.waitForResponse(response => response.url().includes('/api/jobs/creation-deadline?')); await page.getByRole('button', { name: 'Create job', exact: true }).first().click();
    const loadedPreview = await previewResponse; expect(loadedPreview.status()).toBe(200); jobCreationDeadlineContextSchema.parse(await loadedPreview.json());
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('combobox', { name: /^Customer/ }).selectOption(customerId); await page.getByLabel('Job title', { exact: true }).fill('Keep these entered details'); await page.getByRole('combobox', { name: /^Primary owner/ }).selectOption(users.owner);
    await expect(page.getByRole('radio', { name: 'Use workspace default', exact: true })).toBeChecked(); await page.getByRole('button', { name: 'Review job', exact: true }).click();
    const current = await (await clients.owner.get(url())).json(); expect((await clients.owner.put(url(), { headers, data: { workspaceId, submissionId: randomUUID(), section: 'deadline', revision: current.deadline.revision, values: { mode: 'relative', days: 15, count: 'business' } } })).status()).toBe(200);
    await page.getByRole('button', { name: 'Confirm and create', exact: true }).click(); await expect(page.getByRole('button', { name: 'Reload latest values', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Reload latest values', exact: true }).click(); await expect(page.getByLabel('Job title', { exact: true })).toHaveValue('Keep these entered details');
    await page.getByRole('button', { name: 'Use current default', exact: true }).click();
    const expected = (await (await clients.owner.get(`/api/jobs/creation-deadline?workspace=${workspaceId}`)).json()).context.projectedDate;
    await page.getByRole('button', { name: 'Review job', exact: true }).click(); await page.getByRole('button', { name: 'Confirm and create', exact: true }).click(); await expect(page).toHaveURL(/\/jobs\/[0-9a-f-]+\?workspace=/);
    const job = await db('jobs').where({ workspaceId, title: 'Keep these entered details' }).select(db.raw(`to_char("completionDeadline",'YYYY-MM-DD') AS deadline`)).first(); expect(job.deadline).toBe(expected);
  } finally { await context.close(); }
});

test('personal deadline preference persists independently, enforces identity/origin and remains visible to Field', async ({ browser }) => {
  const preferences = `/api/settings/notifications?workspace=${workspaceId}`;
  const initial = await clients.field.get(preferences);
  expect(initial.status()).toBe(200);
  expect((await initial.json()).deadlineReminderEmail).toBe(true);
  expect((await clients.field.put('/api/settings/notifications', { headers: { Origin: 'https://example.test' }, data: { workspaceId, leadAssignedEmail: true, deadlineReminderEmail: false } })).status()).toBe(403);
  expect((await clients.field.put('/api/settings/notifications', { headers, data: { workspaceId, userId: users.owner, leadAssignedEmail: true, deadlineReminderEmail: false } })).status()).toBe(400);
  expect((await clients.field.put('/api/settings/notifications', { headers, data: { workspaceId, leadAssignedEmail: true, deadlineReminderEmail: 'false' } })).status()).toBe(400);
  const context = await browser.newContext({ storageState: await clients.field.storageState() }), page = await context.newPage();
  try {
    await page.goto(`/settings/notifications?workspace=${workspaceId}`);
    const reminder = page.getByRole('switch', { name: 'Job deadline reminders', exact: true });
    await expect(reminder).toBeChecked();
    await reminder.click();
    await expect(page.getByRole('switch', { name: 'Visit schedule changes', exact: true })).toBeChecked();
    await page.getByRole('button', { name: 'Save preferences', exact: true }).click();
    await expect(page.getByRole('status', { name: 'Preferences saved' })).toBeVisible();
    await page.reload(); await expect(reminder).not.toBeChecked();
    const stored = await (await clients.field.get(preferences)).json();
    expect(stored.deadlineReminderEmail).toBe(false); expect(stored.visitChangedEmail).toBe(true);
    expect((await (await clients.owner.get(preferences)).json()).deadlineReminderEmail).toBe(true);
    const legacy = await clients.field.put('/api/settings/notifications', { headers, data: { workspaceId, leadAssignedEmail: false } });
    expect(legacy.status()).toBe(200); expect((await legacy.json()).deadlineReminderEmail).toBe(false);
  } finally { await context.close(); }
});


test('scheduled deadline appears in the live notification menu and can be marked read', async ({ browser }) => {
  await db('workspaces').where({ id: workspaceId }).update({ timezone: 'UTC' });
  const today = (await db.raw("SELECT to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD') AS day")).rows[0].day;
  const customerId = randomUUID();
  await db('customers').insert({ id: customerId, workspaceId, name: 'Reminder UI customer', type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '' });
  const job = await createJob(db, { workspaceId, userId: users.owner }, permissionIds, {
    workspaceId, submissionId: randomUUID(), customerId, title: 'Live deadline reminder fixture', primaryOwnerId: users.field, completionDeadline: today,
  });
  await db('jobNotificationSettings').insert({ workspaceId, section: 'reminders', version: 1,
    values: JSON.stringify({ sendTime: '00:00', offsets: [{ id: 'due', relative: 'on', days: 0 }], extraRecipientIds: [] }) })
    .onConflict(['workspaceId', 'section']).merge({ values: JSON.stringify({ sendTime: '00:00', offsets: [{ id: 'due', relative: 'on', days: 0 }], extraRecipientIds: [] }) });
  await scheduleDeadlineReminders(db, permissionIds);
  const rows = await db('deadlineNotifications').where({ workspaceId, jobId: job.jobId, userId: users.field });
  expect(rows).toHaveLength(1);
  const context = await browser.newContext({ storageState: await clients.field.storageState() }), page = await context.newPage();
  try {
    await page.goto(`/settings/notifications?workspace=${workspaceId}`);
    await page.getByRole('button', { name: /^Open notifications/ }).click();
    const panel = page.getByRole('dialog', { name: 'Notifications', exact: true });
    const card = panel.locator('li').filter({ has: page.getByRole('heading', { name: 'A Job is due today', exact: true }) }).filter({ hasText: 'Live deadline reminder fixture' });
    await expect(card).toBeVisible();
    await expect(card.getByRole('link', { name: 'View Job', exact: true })).toHaveAttribute('href', `/jobs/${job.jobId}?workspace=${workspaceId}`);
    await card.getByRole('button', { name: 'Mark as read', exact: true }).click();
    await expect(card.getByText('Read', { exact: true })).toBeVisible();
    expect((await db('deadlineNotifications').where({ id: rows[0].id }).first()).readAt).not.toBeNull();
  } finally { await context.close(); }
});

test('Job activity preference persists independently and Job-created notices use the live menu without notifying the creator', async ({ browser }) => {
  const preferences = `/api/settings/notifications?workspace=${workspaceId}`;
  const fieldContext = await browser.newContext({ storageState: await clients.field.storageState() }), page = await fieldContext.newPage();
  try {
    await page.goto(`/settings/notifications?workspace=${workspaceId}`);
    const activity = page.getByRole('switch', { name: 'Job activity', exact: true });
    await expect(activity).toBeChecked();
    await expect(page.getByText(/changes its completion deadline/)).toBeVisible();
    await activity.click();
    await page.getByRole('button', { name: 'Save preferences', exact: true }).click();
    await expect(page.getByRole('status', { name: 'Preferences saved' })).toBeVisible();
    await page.reload(); await expect(activity).not.toBeChecked();
    expect((await (await clients.owner.get(preferences)).json()).jobActivityEmail).toBe(true);
    const legacy = await clients.field.put('/api/settings/notifications', { headers, data: { workspaceId, leadAssignedEmail: true } });
    expect(legacy.status()).toBe(200); expect((await legacy.json()).jobActivityEmail).toBe(false);
    expect((await clients.field.put('/api/settings/notifications', { headers: { Origin: 'https://example.test' }, data: { workspaceId, leadAssignedEmail: true, jobActivityEmail: true } })).status()).toBe(403);
    expect((await clients.field.put('/api/settings/notifications', { headers, data: { workspaceId, leadAssignedEmail: true, jobActivityEmail: 'false' } })).status()).toBe(400);
    expect((await clients.field.put('/api/settings/notifications', { headers, data: { workspaceId, userId: users.owner, leadAssignedEmail: true, jobActivityEmail: true } })).status()).toBe(400);
    const customerId = randomUUID();
    await db('customers').insert({ id: customerId, workspaceId, name: 'Job creation notice customer', type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '' });
    const command = { workspaceId, submissionId: randomUUID(), customerId, title: 'Live Job creation notice', primaryOwnerId: users.field, teamUserIds: [users.office, users.owner] };
    const job = await createJob(db, { workspaceId, userId: users.owner }, permissionIds, command);
    await createJob(db, { workspaceId, userId: users.owner }, permissionIds, command);
    const notices = await db('jobNotifications').where({ workspaceId, jobId: job.jobId });
    expect(notices).toHaveLength(2); expect(notices.some(n => n.userId === users.owner)).toBe(false);
    await page.reload();
    await page.getByRole('button', { name: /^Open notifications/ }).click();
    const panel = page.getByRole('dialog', { name: 'Notifications', exact: true });
    const card = panel.locator('li').filter({ has: page.getByRole('heading', { name: 'A Job was created', exact: true }) }).filter({ hasText: 'Live Job creation notice' });
    await expect(card).toBeVisible();
    await expect(card.getByRole('link', { name: 'View Job', exact: true })).toHaveAttribute('href', `/jobs/${job.jobId}?workspace=${workspaceId}`);
    await card.getByRole('button', { name: 'Mark as read', exact: true }).click();
    await expect(card.getByText('Read', { exact: true })).toBeVisible();
    const fieldNotice = notices.find(n => n.userId === users.field)!;
    expect((await db('jobNotifications').where({ id: fieldNotice.id }).first()).readAt).not.toBeNull();
    expect((await clients.office.post('/api/notifications/read', { headers, data: { workspaceId, id: fieldNotice.id } })).status()).toBe(404);
  } finally { await fieldContext.close(); }
});

test('status API retries produce one historical notification and the live menu shows before/after values', async ({ browser }) => {
  const customerId = randomUUID();
  await db('customers').insert({ id: customerId, workspaceId, name: 'Status notice customer', type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '' });
  const job = await createJob(db, { workspaceId, userId: users.owner }, permissionIds, { workspaceId, submissionId: randomUUID(), customerId,
    title: 'Live status notification fixture', primaryOwnerId: users.field, teamUserIds: [users.office, users.owner] });
  await db('jobNotifications').where({ workspaceId, jobId: job.jobId }).delete();
  const change = { workspaceId, jobId: job.jobId, expectedVersion: 1, submissionId: randomUUID(), action: 'status', to: 'in-progress', note: 'PRIVATE status note' };
  expect((await clients.owner.patch(`/api/jobs/${job.jobId}`, { headers: { Origin: 'https://example.test' }, data: change })).status()).toBe(403);
  expect((await clients.owner.patch(`/api/jobs/${job.jobId}`, { headers, data: change })).status()).toBe(200);
  expect((await clients.owner.patch(`/api/jobs/${job.jobId}`, { headers, data: change })).status()).toBe(200);
  let rows = await db('jobNotifications').where({ workspaceId, jobId: job.jobId, event: 'status' });
  expect(rows).toHaveLength(2); expect(rows.some(n => n.userId === users.owner)).toBe(false);
  expect((await clients.owner.patch(`/api/jobs/${job.jobId}`, { headers, data: { ...change, expectedVersion: 2, submissionId: randomUUID(), to: 'completed', confirmed: true } })).status()).toBe(200);
  rows = await db('jobNotifications').where({ workspaceId, jobId: job.jobId, event: 'status' });
  expect(rows).toHaveLength(4);
  const response = await clients.field.get(`/api/notifications?workspace=${workspaceId}`), result = await response.json();
  const original = result.items.find((item: { kind: string; jobId: string; event: string; after?: string }) => item.kind === 'job' && item.jobId === job.jobId && item.event === 'status' && item.after === 'in-progress');
  expect(original.before).toBe('needs-scheduling'); expect(JSON.stringify(result)).not.toContain('PRIVATE status note');
  const context = await browser.newContext({ storageState: await clients.field.storageState() }), page = await context.newPage();
  try {
    await page.goto(`/settings/notifications?workspace=${workspaceId}`);
    await page.getByRole('button', { name: /^Open notifications/ }).click();
    const panel = page.getByRole('dialog', { name: 'Notifications', exact: true });
    const card = panel.locator('li').filter({ has: page.getByRole('heading', { name: 'A Job’s status changed', exact: true }) }).filter({ hasText: 'Live status notification fixture' });
    await expect(card.getByText('Needs Scheduling', { exact: true })).toBeVisible();
    await expect(card.getByText('In Progress', { exact: true })).toBeVisible();
    await expect(card.getByRole('link', { name: 'View Job', exact: true })).toHaveAttribute('href', `/jobs/${job.jobId}?workspace=${workspaceId}`);
    await card.getByRole('button', { name: 'Mark as read', exact: true }).click();
    await expect(card.getByText('Read', { exact: true })).toBeVisible();
    await expect(panel.getByRole('heading', { name: 'A Job was completed', exact: true })).toBeVisible();
    expect((await clients.office.post('/api/notifications/read', { headers, data: { workspaceId, id: original.id } })).status()).toBe(404);
  } finally { await context.close(); }
});

test('assignment API removes Job access while the final minimal notice remains readable and markable', async ({ browser }) => {
  const customerId = randomUUID();
  await db('customers').insert({ id: customerId, workspaceId, name: 'Assignment notice customer', type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '' });
  const job = await createJob(db, { workspaceId, userId: users.owner }, permissionIds, { workspaceId, submissionId: randomUUID(), customerId,
    title: 'PRIVATE removed Job title', primaryOwnerId: users.field, teamUserIds: [users.office] });
  expect((await clients.field.get(`/api/jobs/${job.jobId}?workspace=${workspaceId}`)).status()).toBe(200);
  const change = { workspaceId, jobId: job.jobId, expectedVersion: 1, submissionId: randomUUID(), action: 'assign', primaryOwnerId: users.office, teamUserIds: [] };
  expect((await clients.owner.patch(`/api/jobs/${job.jobId}`, { headers: { Origin: 'https://example.test' }, data: change })).status()).toBe(403);
  expect((await clients.field.patch(`/api/jobs/${job.jobId}`, { headers, data: change })).status()).toBe(404);
  expect((await clients.owner.patch(`/api/jobs/${job.jobId}`, { headers, data: change })).status()).toBe(200);
  expect((await clients.owner.patch(`/api/jobs/${job.jobId}`, { headers, data: change })).status()).toBe(200);
  expect((await db('jobNotifications').where({ workspaceId, jobId: job.jobId, event: 'assignment' })).length).toBe(2);
  expect((await clients.field.get(`/api/jobs/${job.jobId}?workspace=${workspaceId}`)).status()).toBe(404);
  const result = await (await clients.field.get(`/api/notifications?workspace=${workspaceId}`)).json();
  const removed = result.items.find((item: { event: string; access: string }) => item.event === 'assignment' && item.access === 'ended');
  expect(removed).toBeTruthy();
  expect(Object.keys(removed).sort()).toEqual(['kind','id','event','access','change','jobNumber','createdAt','read'].sort());
  expect(JSON.stringify(result)).not.toContain('PRIVATE removed Job title'); expect(JSON.stringify(result)).not.toContain(job.jobId);
  expect((await clients.office.post('/api/notifications/read', { headers, data: { workspaceId, id: removed.id } })).status()).toBe(404);
  const context = await browser.newContext({ storageState: await clients.field.storageState() }), page = await context.newPage();
  try {
    await page.goto(`/settings/notifications?workspace=${workspaceId}`);
    await page.getByRole('button', { name: /^Open notifications/ }).click();
    const panel = page.getByRole('dialog', { name: 'Notifications', exact: true });
    const card = panel.locator('li').filter({ has: page.getByRole('heading', { name: 'Your Job assignment ended', exact: true }) }).filter({ hasText: removed.jobNumber });
    await expect(card).toBeVisible();
    await expect(card.getByRole('link', { name: 'Open SalesMora', exact: true })).toHaveAttribute('href', `/home?workspace=${workspaceId}`);
    await expect(card.getByRole('link', { name: 'View Job', exact: true })).toHaveCount(0);
    await expect(card).not.toContainText('PRIVATE removed Job title');
    await card.getByRole('button', { name: 'Mark as read', exact: true }).click();
    await expect(card.getByText('Read', { exact: true })).toBeVisible();
    expect((await db('jobNotifications').where({ id: removed.id }).first()).readAt).not.toBeNull();
  } finally { await context.close(); }
});

test('deadline API records added/changed/removed snapshots and the live menu marks each authorized notice read', async ({ browser }) => {
  const customerId = randomUUID();
  await db('customers').insert({ id: customerId, workspaceId, name: 'Deadline notice customer', type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '' });
  const job = await createJob(db, { workspaceId, userId: users.owner }, permissionIds, { workspaceId, submissionId: randomUUID(), customerId,
    title: 'Live deadline change fixture', primaryOwnerId: users.field, teamUserIds: [users.office, users.owner] });
  await db('jobNotifications').where({ workspaceId, jobId: job.jobId }).delete();
  const change = { workspaceId, jobId: job.jobId, expectedVersion: 1, submissionId: randomUUID(), action: 'deadline', completionDeadline: '2026-11-06' };
  expect((await clients.owner.patch(`/api/jobs/${job.jobId}`, { headers: { Origin: 'https://example.test' }, data: change })).status()).toBe(403);
  expect((await clients.owner.patch(`/api/jobs/${job.jobId}`, { headers, data: { ...change, completionDeadline: '2026-02-30' } })).status()).toBe(422);
  expect((await clients.owner.patch(`/api/jobs/${job.jobId}`, { headers, data: change })).status()).toBe(200);
  expect((await clients.owner.patch(`/api/jobs/${job.jobId}`, { headers, data: change })).status()).toBe(200);
  for (const [expectedVersion, completionDeadline] of [[2, '2026-11-13'], [3, null]] as const)
    expect((await clients.owner.patch(`/api/jobs/${job.jobId}`, { headers, data: { ...change, expectedVersion, submissionId: randomUUID(), completionDeadline } })).status()).toBe(200);
  const rows = await db('jobNotifications').where({ workspaceId, jobId: job.jobId, event: 'deadline' });
  expect(rows).toHaveLength(6); expect(rows.some(n => n.userId === users.owner)).toBe(false);
  const result = await (await clients.field.get(`/api/notifications?workspace=${workspaceId}`)).json();
  const items = result.items.filter((item: { kind: string; event: string; jobId: string }) => item.kind === 'job' && item.event === 'deadline' && item.jobId === job.jobId);
  expect(items).toHaveLength(3);
  expect(items).toEqual(expect.arrayContaining([
    expect.objectContaining({ before: null, after: '2026-11-06' }), expect.objectContaining({ before: '2026-11-06', after: '2026-11-13' }), expect.objectContaining({ before: '2026-11-13', after: null }),
  ]));
  const fieldNotice = rows.find(n => n.userId === users.field)!;
  expect((await clients.office.post('/api/notifications/read', { headers, data: { workspaceId, id: fieldNotice.id } })).status()).toBe(404);
  const context = await browser.newContext({ storageState: await clients.field.storageState() }), page = await context.newPage();
  try {
    await page.goto(`/settings/notifications?workspace=${workspaceId}`);
    await page.getByRole('button', { name: /^Open notifications/ }).click();
    const panel = page.getByRole('dialog', { name: 'Notifications', exact: true });
    for (const [title, before, after] of [
      ['A Job completion deadline was set', 'Not set', 'Nov 6, 2026'], ['A Job’s completion deadline changed', 'Nov 6, 2026', 'Nov 13, 2026'], ['A Job completion deadline was removed', 'Nov 13, 2026', 'Not set'],
    ]) {
      const card = panel.locator('li').filter({ has: page.getByRole('heading', { name: title, exact: true }) }).filter({ hasText: 'Live deadline change fixture' });
      await expect(card.getByText('Previous completion deadline', { exact: true })).toBeVisible();
      await expect(card.getByText('New completion deadline', { exact: true })).toBeVisible();
      await expect(card.getByText(before, { exact: true })).toBeVisible(); await expect(card.getByText(after, { exact: true })).toBeVisible();
      await expect(card.getByRole('link', { name: 'View Job', exact: true })).toHaveAttribute('href', `/jobs/${job.jobId}?workspace=${workspaceId}`);
      await card.getByRole('button', { name: 'Mark as read', exact: true }).click();
      await expect(card.getByText('Read', { exact: true })).toBeVisible();
    }
    expect((await db('jobNotifications').where({ workspaceId, jobId: job.jobId, userId: users.field }).whereNull('readAt')).length).toBe(0);
  } finally { await context.close(); }
});
