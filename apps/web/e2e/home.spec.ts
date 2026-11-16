import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase } from '@salesmora/data';

test.setTimeout(180000);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test')) throw new Error('Use the isolated test database.');
const db = createDatabase(connection), origin = process.env.SALESMORA_E2E_ORIGIN ?? 'http://127.0.0.1:3002';
const headers = { Origin: origin }, prefix = `home-${randomUUID()}`;
const clients: Record<string, APIRequestContext> = {}, users: Record<string, string> = {};
let workspaceId: string, today: string;
const jobs = Array.from({ length: 3 }, () => randomUUID());
test.beforeAll(async () => {
  for (const role of ['owner', 'admin', 'office', 'field', 'other']) {
    clients[role] = await request.newContext({ baseURL: origin });
    const email = `${prefix}-${role}@example.test`;
    expect((await clients[role].post('/api/auth/sign-up/email', { headers, data: { name: `Home ${role}`, email, password: 'Fictional-test-password-42!', termsAccepted: true } })).status()).toBe(200);
    users[role] = (await db('users').where({ email }).first()).id;
  }
  const response = await clients.owner.post('/api/workspaces', { headers, data: { business: { businessName: 'Home integration fixture', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } } });
  expect(response.status()).toBe(201); workspaceId = (await response.json()).workspaceId;
  await db('workspaceMemberships').insert(['admin', 'office', 'field'].map(role => ({ workspaceId, userId: users[role], role })));
  await db('workspaces').where({ id: workspaceId }).update({ timezone: 'America/New_York' });
  today = (await db('workspaces').where({ id: workspaceId }).select(db.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone,'YYYY-MM-DD') AS today`)).first()).today;
});
test.afterAll(async () => {
  if (workspaceId) await db('workspaces').where({ id: workspaceId }).delete();
  if (Object.values(users).length) await db('users').whereIn('id', Object.values(users)).delete();
  await Promise.all(Object.values(clients).map(client => client.dispose())); await db.destroy();
});
test('live Home preserves notices/onboarding, authorized totals, roles, failures, navigation, and responsive order', async ({ browser }) => {
  const context = await browser.newContext({ storageState: await clients.owner.storageState(), viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage(); page.setDefaultTimeout(20000);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(`${origin}/home?workspace=${workspaceId}`);
    await expect(page.getByRole('heading', { name: 'Welcome, Home owner.' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Create lead', exact: true })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Recent activity' })).toContainText('No recent activity available to you.');
    await expect(page.getByRole('region', { name: 'Intake review' })).toContainText('No intake items awaiting review.');
    await expect(page.getByText('America/New_York', { exact: false }).first()).toBeVisible();
    const leads = Array.from({ length: 3 }, () => randomUUID());
    await db('leads').insert(leads.map((id, index) => ({ id, workspaceId, createdBy: users.owner, submissionId: randomUUID(), submissionHash: 'fixture',
      name: `Customer ${index}`, email: '', phone: '', service: `Home lead ${index}`, address: '', details: '', notes: 'PRIVATE_NOTE',
      stage: 'new', source: 'other', ownerId: index === 0 ? users.field : index === 1 ? null : users.office })));
    await db('jobs').insert(jobs.map((id, index) => ({ id, workspaceId, createdBy: users.owner, title: `Home job ${index}`, customerName: 'Customer',
      service: '', location: '', description: '', primaryOwnerId: index === 0 ? users.field : users.office,
      status: index === 0 ? 'waiting' : index === 1 ? 'needs-scheduling' : 'scheduled',
      waitingReason: index === 0 ? 'materials' : null, scheduledDate: index === 1 ? null : today,
      arrivalWindow: index === 1 ? null : '09:00-11:00', completionDeadline: index === 0 ? '2020-01-01' : null })));
    await db('jobTeamMembers').insert({ workspaceId, jobId: jobs[1], userId: users.field });
    await db.transaction(async trx => {
      for (const index of [0, 2]) {
        const visitId = randomUUID();
        await trx('calendarVisits').insert({ id: visitId, workspaceId, scheduledDate: today, arrivalWindow: '09:00-11:00' });
        await trx('calendarVisitRecords').insert({ id: randomUUID(), workspaceId, visitId, jobId: jobs[index] });
      }
    });
    await page.reload();
    const main = page.getByRole('main');
    await expect(main.getByRole('group', { name: 'New leads', exact: true }).getByText('3', { exact: true })).toBeVisible();
    await expect(main.getByRole('group', { name: 'Active jobs', exact: true }).getByText('3', { exact: true })).toBeVisible();
    await expect(main.getByRole('region', { name: 'Active jobs', exact: true }).getByRole('listitem')).toHaveCount(3);
    await expect(main.getByRole('region', { name: "Today's schedule" }).getByRole('listitem')).toHaveCount(2);
    await expect(main.getByRole('region', { name: 'Needs your attention' }).getByRole('listitem')).toHaveCount(3);
    await expect(page.getByRole('link', { name: 'Create lead', exact: true })).toHaveCount(0);
    await main.getByRole('button', { name: 'Home actions' }).click();
    await expect(page.getByRole('menuitem', { name: 'Create lead' })).toHaveAttribute('href', `/leads/new?workspace=${workspaceId}`);
    await page.keyboard.press('Escape');
    for (const width of [1440, 768, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      const layout = await main.evaluate(element => {
        const sections = [...element.querySelectorAll<HTMLElement>('[data-home-section]')].map(section => ({ key: section.dataset.homeSection, top: section.getBoundingClientRect().top, bottom: section.getBoundingClientRect().bottom }));
        return { overflow: document.documentElement.scrollWidth - innerWidth, sections };
      });
      expect(layout.overflow).toBeLessThanOrEqual(0);
      if (width < 1024) expect([...layout.sections].sort((a, b) => a.top - b.top).map(section => section.key)).toEqual(['attention', 'schedule', 'intake', 'jobs', 'pipeline', 'workload', 'activity']);
      else {
        const attention = layout.sections.find(section => section.key === 'attention'), intake = layout.sections.find(section => section.key === 'intake');
        expect(attention).toBeDefined(); expect(intake).toBeDefined();
        if (attention && intake) expect(intake.top - attention.bottom).toBe(24);
      }
    }
    const badEvent = randomUUID();
    await db('jobActivity').insert({ id: badEvent, workspaceId, jobId: jobs[0], actorId: users.owner, actorName: 'Owner', source: 'ui', type: 'unsupported', changes: '{}', createdAt: new Date() });
    await page.reload();
    await expect(main.getByRole('region', { name: 'Recent activity' }).getByRole('alert')).toContainText('We could not load recent activity');
    await expect(main.getByRole('region', { name: 'Active jobs', exact: true }).getByRole('listitem')).toHaveCount(3);
    await db('jobActivity').where({ id: badEvent, workspaceId }).delete();
    await main.getByRole('button', { name: 'Retry activity' }).click();
    await expect(main.getByRole('region', { name: 'Recent activity' }).getByRole('alert')).toHaveCount(0);
    await expect(main.getByRole('region', { name: 'Recent activity' }).getByRole('listitem')).toHaveCount(3);
    for (const role of ['admin', 'office', 'field']) {
      const memberContext = await browser.newContext({ storageState: await clients[role].storageState(), viewport: { width: 320, height: 1000 } });
      try {
        const member = await memberContext.newPage();
        await member.goto(`${origin}/home?workspace=${workspaceId}`);
        const memberMain = member.getByRole('main');
        await expect(memberMain.getByRole('heading', { name: `Welcome, Home ${role}.` })).toBeVisible();
        if (role === 'field') {
          await expect(memberMain.getByRole('region', { name: 'Active jobs', exact: true }).getByRole('listitem')).toHaveCount(2);
          await expect(memberMain.getByRole('group', { name: 'Active jobs', exact: true }).getByText('2', { exact: true })).toBeVisible();
          await expect(memberMain.getByRole('region', { name: "Today's schedule" }).getByRole('listitem')).toHaveCount(1);
          await expect(memberMain.getByRole('region', { name: 'Team workload' })).toHaveCount(0);
          await expect(memberMain.getByText('Home job 2', { exact: true })).toHaveCount(0);
          await expect(memberMain.getByText('Home lead 2', { exact: true })).toHaveCount(0);
          await memberMain.getByRole('button', { name: 'Home actions' }).click();
          await expect(member.getByRole('menuitem', { name: 'Create lead' })).toHaveCount(0);
        } else await expect(memberMain.getByRole('region', { name: 'Active jobs', exact: true }).getByRole('listitem')).toHaveCount(3);
      } finally { await memberContext.close(); }
    }
    const denied = await clients.other.get(`/home?workspace=${workspaceId}`);
    expect(await denied.text()).not.toContain('Home job 0');
    await db('workspaceRolePolicies').where({ workspaceId, role: 'field' }).whereNotIn('permission', ['home.access', 'assistant.use']).delete();
    const limitedContext = await browser.newContext({ storageState: await clients.field.storageState() });
    try {
      const limited = await limitedContext.newPage(); await limited.goto(`${origin}/home?workspace=${workspaceId}`);
      await expect(limited.getByRole('heading', { name: 'Welcome, Home field.' })).toBeVisible();
      await expect(limited.getByRole('region', { name: 'Active jobs', exact: true })).toHaveCount(0);
      await expect(limited.getByRole('region', { name: 'Recent activity' })).toHaveCount(0);
    } finally { await limitedContext.close(); }
    expect(errors).toEqual([]);
  } finally { await context.close(); }
});
