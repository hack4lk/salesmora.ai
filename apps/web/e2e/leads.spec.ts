import { expect, test, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase } from '@salesmora/data';
import { createLeadFormData as copy } from '../src/features/leads/create-lead-form/create-lead-form.data';
const url = process.env.TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith('_test') || url === process.env.DATABASE_URL) throw Error('Lead tests require the isolated test database.');
const db = createDatabase(url);
const origin = 'http://127.0.0.1:3002';
const headers = { Origin: origin };
const workspaceInput = { business: { businessName: 'Lead Test Plumbing', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } };
const lead = { ...copy.stories.filled, ownerId: '' };
async function account(request: APIRequestContext, email = 'lead-owner@example.com') {
  const response = await request.post('/api/auth/sign-up/email', { headers, data: { name: 'Lead Test Owner', email, password: 'Fictional-lead-test-password-42!', termsAccepted: true } });
  expect(response.status()).toBe(200);
  return (await db('users').where({ email }).first()).id as string;
}
async function workspace(request: APIRequestContext) {
  const response = await request.post('/api/workspaces', { headers, data: workspaceInput });
  expect(response.status()).toBe(201);
  return (await response.json()).workspaceId as string;
}
const body = (workspaceId: string, ownerId = '') => ({ workspaceId, submissionId: randomUUID(), lead: { ...lead, ownerId } });
test.beforeEach(async () => {
  for (let attempt = 0; ; attempt++) {
    try { await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE'); break; }
    catch (error) { if (attempt >= 2 || (error as { code?: string }).code !== '40P01') throw error; }
  }
});
test.afterAll(async () => { await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE'); await db.destroy(); });

test('floating chat opens above Home, contains focus, and preserves drafts through every close action', async ({ page }) => {
  await account(page.context().request); const workspaceId = await workspace(page.context().request);
  await page.goto(`/home?workspace=${workspaceId}`);
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const composer = page.getByRole('textbox', { name: 'Ask the SalesMora assistant', exact: true });
    const launcher = page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true });
    await expect(composer).toBeHidden();
    await launcher.click();
    await composer.fill('Help me prepare a new lead');
    const modal = page.locator('dialog:modal');
    await expect(modal).toBeVisible();
    await expect(composer).toBeFocused();
    await expect(page.getByRole('button', { name: 'Ask assistant', exact: true })).toBeEnabled();
    await page.getByRole('link', { name: 'Create lead', exact: true }).evaluate(el => (el as HTMLElement).focus());
    await expect(composer).toBeFocused();
    await page.keyboard.press('Tab');
    expect(await modal.evaluate(el => el.contains(document.activeElement))).toBe(true);
    await page.screenshot({ path: `/private/tmp/salesmora-expanded-chat-${width}.png`, fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.keyboard.press('Escape');
    await expect(modal).toHaveCount(0);
    await expect(composer).toBeHidden();
    await expect(launcher).toBeFocused();
    await page.screenshot({ path: `/private/tmp/salesmora-floating-chat-${width}.png`, fullPage: true });
    const bounds = await launcher.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    await expect(page.getByRole('button', { name: 'Expand chat' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Create lead', exact: true })).toBeVisible();
    await launcher.click();
    await expect(modal).toBeVisible();
    await expect(composer).toHaveValue('Help me prepare a new lead');
    if (width === 1440) {
      // The desktop dialog is narrower than the viewport, exposing its backdrop.
      await page.mouse.click(8, 8);
      await expect(modal).toHaveCount(0);
      await launcher.click();
    }
    await page.getByRole('button', { name: 'Close chat' }).click();
    await expect(modal).toHaveCount(0);
    await expect(composer).toBeHidden();
    await expect(launcher).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  }
  await page.getByRole('link', { name: 'Create lead', exact: true }).click();
  await expect(page.getByRole('button', { name: 'SalesMora assistant How can I help?' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Ask the SalesMora assistant', exact: true })).toBeHidden();
  expect(await db('leads')).toHaveLength(0);
});

test('creates from Home using real members, saves every field once, and updates Home after reload', async ({ page }) => {
  const api = page.context().request;
  const userId = await account(api);
  const workspaceId = await workspace(api);
  await page.goto(`/home?workspace=${workspaceId}`);
  await expect(page.getByRole('heading', { name: 'Leads by pipeline stage' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Create lead', exact: true }).click();
  await expect(page).toHaveURL(`${origin}/leads/new?workspace=${workspaceId}`);
  await expect(page.getByRole('button', { name: copy.submit, exact: true })).toBeEnabled();
  await expect(page.getByRole('combobox', { name: copy.labels.ownerId })).toContainText('Lead Test Owner');
  await expect(page.getByRole('combobox', { name: copy.labels.ownerId })).not.toContainText('Ava Morgan');
  for (const key of ['name', 'email', 'phone', 'service', 'address', 'details', 'notes'] as const) await page.locator(`[name=${key}]`).fill(` ${lead[key]} `);
  await page.locator('[name=source]').selectOption('phone');
  await page.locator('[name=stage]').selectOption('estimate-sent');
  await page.locator('[name=ownerId]').selectOption(userId);
  await page.route('**/api/leads', async route => { await new Promise(resolve => setTimeout(resolve, 300)); await route.continue(); });
  await page.getByRole('button', { name: copy.submit, exact: true }).dblclick();
  await expect(page.getByRole('status')).toContainText('Your lead has been saved to this workspace.');
  const records = await db('leads');
  expect(records).toHaveLength(1);
  expect(records[0]).toMatchObject({ ...lead, workspaceId, createdBy: userId, ownerId: userId, source: 'phone', stage: 'estimate-sent' });
  await page.reload();
  expect(await db('leads')).toHaveLength(1);
  await page.goto(`/home?workspace=${workspaceId}`);
  await expect(page.getByRole('heading', { name: 'Start your customer work' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Create lead', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Leads by pipeline stage' })).toBeVisible();
  await expect(page.getByText('1 lead across your pipeline', { exact: true })).toBeVisible();
  await expect(page.getByRole('meter', { name: 'Estimate sent', exact: true })).toHaveAttribute('aria-valuenow', '1');
  await expect(page.getByRole('meter', { name: 'New', exact: true })).toHaveAttribute('aria-valuenow', '0');
});
test('Home aggregates only assigned Field leads and excludes other workspaces at desktop and mobile widths', async ({ page, request }) => {
  await account(page.context().request); const workspaceId = await workspace(page.context().request);
  const memberId = await account(request, 'pipeline-member@example.com'); const otherWorkspace = await workspace(request);
  await db('workspaceMemberships').insert({ workspaceId, userId: memberId, role: 'field' });
  for (const stage of ['new', 'new', 'contacted', 'estimate-sent', 'won']) {
    const input = body(workspaceId, stage === 'new' ? memberId : '');
    expect((await page.context().request.post('/api/leads', { headers, data: { ...input, lead: { ...input.lead, stage } } })).status()).toBe(201);
  }
  expect((await request.post('/api/leads', { headers, data: body(otherWorkspace) })).status()).toBe(201);
  // Field sees assigned leads; unassigned and other-tenant leads stay excluded.
  await page.context().request.post('/api/auth/sign-out', { headers, data: {} });
  await page.context().request.post('/api/auth/sign-in/email', { headers, data: { email: 'pipeline-member@example.com', password: 'Fictional-lead-test-password-42!' } });
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/home?workspace=${workspaceId}`);
    await expect(page.getByText('2 leads across your pipeline', { exact: true })).toBeVisible();
    for (const [stage, count] of [['New', 2], ['Contacted', 0], ['Estimate sent', 0], ['Won', 0]] as const) {
      const meter = page.getByRole('meter', { name: stage, exact: true });
      await expect(meter).toHaveAttribute('aria-valuenow', String(count));
      await expect(meter).toHaveAttribute('aria-valuemax', '2');
    }
    await expect(page.getByRole('link', { name: 'View pipeline', exact: true })).toHaveAttribute('href', `/leads?workspace=${workspaceId}`);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `/private/tmp/salesmora-home-pipeline-${width}.png`, fullPage: true });
  }
  await page.goto(`/home?workspace=${otherWorkspace}`);
  await expect(page.getByText('1 lead across your pipeline', { exact: true })).toBeVisible();
  await expect(page.getByRole('meter', { name: 'Contacted', exact: true })).toHaveAttribute('aria-valuenow', '1');
  await expect(page.getByRole('meter', { name: 'New', exact: true })).toHaveAttribute('aria-valuenow', '0');
});
test('retains details on failure, retries, and starts another distinct lead', async ({ page }) => {
  await account(page.context().request); const workspaceId = await workspace(page.context().request);
  await page.goto(`/leads/new?workspace=${workspaceId}`);
  const submit = page.getByRole('button', { name: copy.submit, exact: true }); await expect(submit).toBeEnabled();
  await page.locator('[name=name]').fill(lead.name); await page.locator('[name=service]').fill(lead.service);
  await page.route('**/api/leads', route => route.fulfill({ status: 503, json: { error: copy.stories.serverError } }), { times: 1 });
  await submit.click(); await expect(page.getByRole('alert', { name: 'Unable to continue' })).toContainText(copy.stories.serverError);
  await expect(page.locator('[name=name]')).toHaveValue(lead.name); expect(await db('leads')).toHaveLength(0);
  await submit.click(); await expect(page.getByRole('status')).toBeVisible();
  expect(await db('leads').first()).toMatchObject({ email: '', phone: '', ownerId: null, source: 'website', stage: 'new' });
  await page.getByRole('button', { name: 'Create another lead' }).click();
  await expect(page.locator('[name=name]')).toHaveValue('');
  await page.locator('[name=name]').fill(lead.name); await page.locator('[name=service]').fill(lead.service);
  await submit.click(); await expect(page.getByRole('status')).toBeVisible(); expect(await db('leads')).toHaveLength(2);
});
test('requires authentication, same origin, valid bounded fields, and rejects forged creator or role', async ({ page, request }) => {
  await account(page.context().request); const workspaceId = await workspace(page.context().request);
  const input = body(workspaceId);
  expect((await request.post('/api/leads', { headers, data: input })).status()).toBe(401);
  expect((await request.get('/api/leads')).status()).toBe(401);
  for (const originHeaders of [{ Origin: 'https://untrusted.example' }, {}] as Record<string, string>[]) expect((await page.context().request.post('/api/leads', { headers: originHeaders, data: input })).status()).toBe(403);
  for (const invalid of [
    { ...input, createdBy: 'forged' }, { ...input, role: 'owner' }, { ...input, workspaceId: 'invalid' },
    ...[{ name: ' ' }, { service: '' }, { email: 'invalid' }, { source: 'forged' }, { stage: 'forged' }, { notes: 'x'.repeat(10001) }, { name: 'x'.repeat(201) }, { createdBy: 'forged' }].map(fields => ({ ...input, lead: { ...input.lead, ...fields } })),
  ]) expect((await page.context().request.post('/api/leads', { headers, data: invalid })).status()).toBe(422);
  expect((await page.context().request.post('/api/leads', { headers: { ...headers, 'Content-Type': 'application/json' }, data: Buffer.from('{') })).status()).toBe(400);
  expect((await page.context().request.post('/api/leads', { headers, data: { ...input, padding: 'x'.repeat(65000) } })).status()).toBe(413);
  expect(await db('leads')).toHaveLength(0);
});
test('isolates workspace access and owners; Field cannot create and Office can', async ({ page, request }) => {
  const ownerId = await account(page.context().request); const workspaceId = await workspace(page.context().request);
  const otherId = await account(request, 'lead-outsider@example.com'); const otherWorkspace = await workspace(request);
  expect((await request.post('/api/leads', { headers, data: body(workspaceId) })).status()).toBe(403);
  expect((await page.context().request.post('/api/leads', { headers, data: body(workspaceId, otherId) })).status()).toBe(422);
  expect((await page.context().request.post('/api/leads', { headers, data: body(randomUUID()) })).status()).toBe(403);
  await page.goto(`/leads/new?workspace=${otherWorkspace}`);
  await expect(page.getByRole('form', { name: copy.formLabel })).toHaveCount(0);
  await db('workspaceMemberships').insert({ workspaceId, userId: otherId, role: 'field' });
  expect((await request.post('/api/leads', { headers, data: body(workspaceId, ownerId) })).status()).toBe(403);
  await db('workspaceMemberships').where({ workspaceId, userId: otherId }).update({ role: 'office' });
  const response = await request.post('/api/leads', { headers, data: body(workspaceId, ownerId) }); expect(response.status()).toBe(201);
  expect(await db('leads').first()).toMatchObject({ workspaceId, createdBy: otherId, ownerId });
  await page.goto(`/home?workspace=${workspaceId}`); await expect(page.getByRole('heading', { name: 'Start your customer work' })).toHaveCount(0);
  await page.goto(`/home?workspace=${otherWorkspace}`); await expect(page.getByRole('main')).not.toContainText(lead.name);
  // A lead in one workspace must not hide another workspace's empty welcome.
  await page.context().request.post('/api/auth/sign-out', { headers, data: {} });
  await page.context().request.post('/api/auth/sign-in/email', { headers, data: { email: 'lead-outsider@example.com', password: 'Fictional-lead-test-password-42!' } });
  await page.goto(`/home?workspace=${otherWorkspace}`); await expect(page.getByRole('heading', { name: 'Start your customer work' })).toBeVisible();
});
test('concurrent and lost-response retries create one lead; changed submissions conflict', async ({ page }) => {
  await account(page.context().request); const workspaceId = await workspace(page.context().request);
  const input = body(workspaceId);
  const responses = await Promise.all(Array.from({ length: 4 }, () => page.context().request.post('/api/leads', { headers, data: input })));
  expect(responses.map(response => response.status()).sort()).toEqual([200, 200, 200, 201]);
  expect(new Set(await Promise.all(responses.map(async response => (await response.json()).leadId))).size).toBe(1);
  expect((await page.context().request.post('/api/leads', { headers, data: { ...input, lead: { ...input.lead, service: 'Different service' } } })).status()).toBe(409);
  expect(await db('leads')).toHaveLength(1); expect((await db('leads').first()).service).toBe(lead.service);
});
for (const width of [1440, 320]) test(`create page fits ${width}px and Cancel leaves no lead`, async ({ page }) => {
  await account(page.context().request); const workspaceId = await workspace(page.context().request);
  await page.setViewportSize({ width, height: 1000 }); await page.goto(`/leads/new?workspace=${workspaceId}`);
  await expect(page.getByRole('button', { name: copy.submit, exact: true })).toBeEnabled();
  await page.locator('[name=name]').fill(lead.name); await page.locator('[name=service]').fill(lead.service);
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `/private/tmp/salesmora-real-create-lead-${width}.png`, fullPage: true });
  await page.getByRole('button', { name: copy.cancel, exact: true }).click();
  await expect(page).toHaveURL(`${origin}/home?workspace=${workspaceId}`); expect(await db('leads')).toHaveLength(0);
});
