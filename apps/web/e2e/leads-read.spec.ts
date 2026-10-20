import { test, expect, request as requests, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase } from '@salesmora/data';
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL) throw new Error('Use the isolated test database.');
const db = createDatabase(connection), origin = 'http://127.0.0.1:3002', headers = { Origin: origin };
const prefix = `lead-read-${randomUUID()}`, clients: Record<string, APIRequestContext> = {}, users: Record<string, string> = {};
let workspaceId: string, otherWorkspace: string;
const ids = Array.from({ length: 68 }, () => randomUUID());
const password = 'Fictional-read-test-password-42!';
test.beforeAll(async () => {
  // Disposable _test database only: clear ephemeral auth buckets between fixture runs.
  await db('rateLimits').delete();
  for (const role of ['owner', 'admin', 'office', 'field', 'other']) {
    const client = await requests.newContext({ baseURL: origin }); clients[role] = client;
    const email = `${prefix}-${role}@example.test`;
    const response = await client.post('/api/auth/sign-up/email', { headers, data: { name: `Read test ${role}`, email, password, termsAccepted: true } });
    expect(response.status()).toBe(200); users[role] = (await db('users').where({ email }).first()).id;
  }
  const business = { business: { businessName: 'Read Test Plumbing', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } };
  const a = await clients.owner.post('/api/workspaces', { headers, data: business }), b = await clients.other.post('/api/workspaces', { headers, data: business });
  expect(a.status()).toBe(201); expect(b.status()).toBe(201); workspaceId = (await a.json()).workspaceId; otherWorkspace = (await b.json()).workspaceId;
  await db('workspaceMemberships').insert(['admin', 'office', 'field'].map(role => ({ workspaceId, userId: users[role], role })));
  await db('leads').insert(ids.map((id, index) => ({ id, workspaceId: index === 67 ? otherWorkspace : workspaceId, createdBy: index === 67 ? users.other : users.owner, submissionId: randomUUID(), submissionHash: 'fixture', name: index === 0 ? 'Jordan Read Test' : `Read Customer ${String(index).padStart(3, '0')}`, email: '', phone: '(212) 555-0134', service: 'Kitchen repair', address: '18 Willow Street', details: '', notes: '', source: index === 63 ? 'gmail' : 'website', stage: index === 66 ? 'won' : 'new', ownerId: index === 67 ? null : index % 3 === 0 ? users.field : index % 3 === 1 ? users.office : null, archivedAt: index === 65 ? new Date() : null, createdAt: new Date('2026-10-10T12:00:00Z') })));
});
test.afterAll(async () => {
  // Only this test's generated accounts/workspaces; never truncate shared test data.
  // Immutable non-content authorization audit evidence intentionally remains.
  if (Object.values(users).length) await db('users').whereIn('id', Object.values(users)).delete();
  await Promise.all(Object.values(clients).map(client => client.dispose())); await db.destroy();
});
async function login(page: import('@playwright/test').Page, role: string) {
  // Reuse the authenticated fixture session; repeated logins can hit the real auth rate limiter.
  await page.context().addCookies((await clients[role].storageState()).cookies);
}
test('live queries enforce every role and tenant, including quick view, archives and current revocation', async () => {
  expect((await clients.owner.get('/api/leads?workspace=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')).status()).toBe(404);
  for (const role of ['owner', 'admin', 'office']) {
    const response = await clients[role].get(`/api/leads?workspace=${workspaceId}&view=list`); expect(response.status()).toBe(200);
    const result = await response.json(); expect(result.total).toBe(66); expect(result.rows.length).toBe(25); expect(result.rows.some((row: { id: string }) => row.id === ids[67])).toBe(false);
    expect(response.headers()['cache-control']).toContain('no-store');
  }
  const field = await clients.field.get(`/api/leads?workspace=${workspaceId}&view=list`); const result = await field.json(); expect(result.total).toBe(23); expect(result.rows.every((row: { owner: { id: string } }) => row.owner.id === users.field)).toBe(true); expect(result.owners).toEqual([]);
  expect((await clients.field.get(`/api/leads/${ids[1]}?workspace=${workspaceId}`)).status()).toBe(404);
  expect((await clients.owner.get(`/api/leads/${ids[67]}?workspace=${workspaceId}`)).status()).toBe(404);
  expect((await clients.field.get(`/api/leads?workspace=${workspaceId}&archived=true`)).status()).toBe(404);
  expect((await clients.owner.get(`/api/leads?workspace=${workspaceId}&archived=true&view=list`)).status()).toBe(200);
  expect((await clients.owner.get(`/api/leads?workspace=${otherWorkspace}`)).status()).toBe(404);
  await db('workspaceMemberships').where({ workspaceId, userId: users.admin }).delete();
  expect((await clients.admin.get(`/api/leads?workspace=${workspaceId}`)).status()).toBe(404);
});
test('list and pipeline share URL filters, paging, quick view and native record navigation', async ({ page }) => {
  await login(page, 'owner');
  await page.goto(`/leads?workspace=${workspaceId}`);
  await expect(page.getByRole('heading', { name: 'Leads', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pipeline', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Load more', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Load more', exact: true }).click();
  await expect(page.getByText('40 of 65 loaded', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'List', exact: true }).click();
  await expect(page).toHaveURL(/view=list/); await expect(page.getByText('Showing 1–25 of 66', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Go to page 2', exact: true }).click(); await expect(page.getByText('Showing 26–50 of 66', { exact: true })).toBeVisible();
  const search = page.getByRole('textbox', { name: /^Search leads/ }); await search.fill('Jordan Read');
  await expect(page).toHaveURL(/q=Jordan\+Read/); await expect(page.getByText('Showing 1–1 of 1', { exact: true })).toBeVisible();
  await expect(page.getByRole('checkbox')).toHaveCount(0); await expect(page.getByRole('button', { name: 'Export', exact: true })).toBeVisible();
  await page.getByRole('row', { name: /Jordan Read Test/ }).getByText('Kitchen repair').click();
  await expect(page.getByRole('dialog')).toBeVisible(); await expect(page.getByRole('button', { name: 'Move to another stage', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Open full lead record', exact: true }).click(); await expect(page).toHaveURL(new RegExp(`/leads/${ids[0]}`));
  await expect(page.getByRole('heading', { name: 'Jordan Read Test', level: 1 })).toBeVisible(); await expect(page.getByRole('heading', { name: 'Contact details' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Delete', exact: true })).toBeVisible(); await expect(page.getByRole('button', { name: 'Archive', exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Add a team note', exact: true })).toBeEnabled();
  await page.getByRole('link', { name: 'Back to leads', exact: true }).click(); await expect(page).toHaveURL(/q=Jordan\+Read/); await expect(search).toHaveValue('Jordan Read');
  await page.getByRole('button', { name: 'Clear all', exact: true }).click(); await expect(search).toHaveValue(''); await expect(page.getByRole('button', { name: 'List', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('link', { name: 'Leads', exact: true })).toHaveAttribute('href', `/leads?workspace=${workspaceId}`);
});
test('assigned-only mobile view hides unsupported actions and recovers failed reads without losing filters', async ({ page }) => {
  await login(page, 'field'); await page.setViewportSize({ width: 390, height: 1000 });
  await page.goto(`/leads?workspace=${workspaceId}&view=list`);
  await expect(page.getByText('Showing 1–23 of 23', { exact: true })).toBeVisible();
  for (const name of ['Add lead', 'Export', 'Show archived']) await expect(page.getByRole('button', { name, exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.route('**/api/leads?*', route => route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }));
  const search = page.getByRole('textbox', { name: /^Search leads/ }); await search.fill('Willow');
  await expect(page.getByRole('button', { name: 'Retry', exact: true })).toBeVisible(); await expect(search).toHaveValue('Willow');
  await page.unroute('**/api/leads?*'); await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByText('Showing 1–23 of 23', { exact: true })).toBeVisible(); await expect(search).toHaveValue('Willow');
  const launcher = page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true }); await expect(launcher).toHaveCount(1);
  await launcher.click(); await expect(page.locator('dialog:modal')).toBeVisible(); await page.getByRole('button', { name: 'Close chat', exact: true }).click();
});

test('stage API validates origin, payload, scope, permission, versions and idempotent replay', async () => {
  const data = { workspaceId, leadId: ids[6], expectedVersion: 1, to: 'lost', reason: 'Customer declined.', submissionId: randomUUID() };
  const endpoint = `/api/leads/${ids[6]}/stage`;
  expect((await clients.field.post(endpoint, { data })).status()).toBe(403);
  expect((await clients.field.post(endpoint, { headers, data: { ...data, actorId: users.owner } })).status()).toBe(422);
  expect((await clients.field.post(endpoint, { headers, data: { ...data, reason: 'x'.repeat(501) } })).status()).toBe(422);
  expect((await clients.field.post(`/api/leads/${ids[7]}/stage`, { headers, data: { ...data, leadId: ids[7] } })).status()).toBe(404);
  expect((await clients.owner.post(`/api/leads/${ids[67]}/stage`, { headers, data: { ...data, leadId: ids[67] } })).status()).toBe(404);
  expect((await clients.owner.post(`/api/leads/${ids[65]}/stage`, { headers, data: { ...data, leadId: ids[65] } })).status()).toBe(409);
  const response = await clients.field.post(endpoint, { headers, data }); expect(response.status()).toBe(200); expect(response.headers()['cache-control']).toContain('no-store');
  expect((await clients.field.post(endpoint, { headers, data })).status()).toBe(200);
  expect((await clients.field.post(endpoint, { headers, data: { ...data, submissionId: randomUUID(), to: 'won', reason: undefined } })).status()).toBe(409);
  const detail = await (await clients.field.get(`/api/leads/${ids[6]}?workspace=${workspaceId}`)).json(); expect(detail.lead.stage).toBe('lost'); expect(detail.lead.version).toBe(2);
  expect(detail.activity.filter((event: { type: string }) => event.type === 'stage')).toHaveLength(1);
  await db('workspaceRolePolicies').where({ workspaceId, role: 'office', permission: 'leads.stage.update' }).delete();
  expect((await clients.office.post(`/api/leads/${ids[7]}/stage`, { headers, data: { ...data, leadId: ids[7] } })).status()).toBe(404);
});
test('pipeline menu, drag, quick view and full record move through real confirmations', async ({ page }) => {
  test.setTimeout(60000);
  const pageErrors: string[] = []; page.on('pageerror', error => pageErrors.push(error.message));
  await login(page, 'owner'); await page.goto(`/leads?workspace=${workspaceId}&q=Jordan`);
  await page.getByRole('button', { name: 'Actions for Jordan Read Test', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Move to…', exact: true }).click();
  const dialog = page.getByRole('alertdialog', { name: 'Move this lead?' });
  await dialog.getByRole('combobox', { name: 'New stage', exact: true }).selectOption('contacted');
  await dialog.getByRole('button', { name: 'Confirm move' }).click();
  await expect(dialog).toHaveCount(0);
  await expect.poll(async () => (await db('leads').where({ id: ids[0] }).first()).stage).toBe('contacted');
  await expect(page.getByRole('button', { name: 'Actions for Jordan Read Test' })).toBeVisible();
  await page.reload();
  // Whole card drag opens the same review, and cancellation leaves the DB untouched.
  const card = page.locator('[draggable="true"]').filter({ has: page.getByRole('link', { name: 'Jordan Read Test', exact: true }) });
  const target = page.getByRole('region', { name: /Estimate sent/ });
  await card.dragTo(target);
  await expect(dialog).toBeVisible(); await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  expect((await db('leads').where({ id: ids[0] }).first()).stage).toBe('contacted');
  await card.dragTo(target); await dialog.getByRole('button', { name: 'Confirm move' }).click();
  await expect.poll(async () => (await db('leads').where({ id: ids[0] }).first()).stage).toBe('estimate-sent');
  await page.reload();
  await page.getByText('Kitchen repair', { exact: true }).click();
  await page.getByRole('button', { name: 'Move to another stage', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Confirm move' })).toBeEnabled();
  await dialog.getByRole('combobox', { name: 'New stage', exact: true }).selectOption('won'); await dialog.getByRole('button', { name: 'Confirm move' }).click();
  await expect.poll(async () => (await db('leads').where({ id: ids[0] }).first()).stage).toBe('won');
  await page.goto(`/leads/${ids[0]}?workspace=${workspaceId}`);
  await page.getByRole('button', { name: 'Move to another stage', exact: true }).click();
  await dialog.getByRole('combobox', { name: 'New stage', exact: true }).selectOption('lost'); await dialog.getByLabel('Lost reason (optional)', { exact: true }).fill('Timing changed.');
  await dialog.getByRole('button', { name: 'Confirm move' }).click(); await expect(dialog).toHaveCount(0);
  await expect(page.getByText('Timing changed.', { exact: true })).toBeVisible();
  expect((await db('leads').where({ id: ids[0] }).first()).version).toBe(5);
  expect(pageErrors).toEqual([]);
});
test('assigned mobile keyboard moves persist; rejected writes keep the card and error visible', async ({ page }) => {
  await login(page, 'field'); await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(`/leads?workspace=${workspaceId}&q=Read+Customer+012`);
  const handle = page.getByRole('button', { name: 'Move lead Read Customer 012', exact: true });
  const dialog = page.getByRole('alertdialog', { name: 'Move this lead?' });
  await handle.focus(); await handle.press('Enter'); await handle.press('ArrowRight'); await handle.press('Enter');
  await expect(dialog.getByRole('combobox', { name: 'New stage', exact: true })).toHaveValue('contacted');
  await dialog.getByRole('button', { name: 'Confirm move' }).click(); await expect(dialog).toHaveCount(0);
  await expect.poll(async () => (await db('leads').where({ id: ids[12] }).first()).stage).toBe('contacted');
  await expect(page.getByText('Lead stage updated.', { exact: true })).toBeVisible();
  await expect(page.getByText('Lead stage updated.', { exact: true })).toHaveCount(0, { timeout: 4000 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.route(`**/api/leads/${ids[12]}/stage`, route => route.fulfill({ status: 409, contentType: 'application/json', body: '{}' }));
  await page.getByRole('button', { name: 'Actions for Read Customer 012', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Move to…', exact: true }).click();
  await dialog.getByRole('combobox', { name: 'New stage', exact: true }).selectOption('won');
  await dialog.getByRole('button', { name: 'Confirm move' }).click();
  const error = page.getByText('This lead changed or is archived. Reload it before trying again.', { exact: true });
  await expect(error).toBeVisible(); expect((await db('leads').where({ id: ids[12] }).first()).stage).toBe('contacted');
  await expect(page.getByRole('region', { name: 'Contacted', exact: true }).getByRole('link', { name: 'Read Customer 012', exact: true })).toBeVisible();
  await page.waitForTimeout(2300); await expect(error).toBeVisible();
  await page.unroute(`**/api/leads/${ids[12]}/stage`);
  await page.getByRole('button', { name: 'Actions for Read Customer 012', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Move to…', exact: true }).click();
  await dialog.getByRole('combobox', { name: 'New stage', exact: true }).selectOption('lost');
  await dialog.getByRole('button', { name: 'Confirm move' }).click();
  await expect.poll(async () => (await db('leads').where({ id: ids[12] }).first()).stage).toBe('lost');
  await expect(page.getByRole('button', { name: 'Collapse Lost', exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Lost', exact: true }).getByRole('link', { name: 'Read Customer 012', exact: true })).toBeVisible();
});
test('team note API uses read authority and rejects forged content, scope and actors', async () => {
  const endpoint = `/api/leads/${ids[9]}/notes`, data = { workspaceId, leadId: ids[9], submissionId: randomUUID(), body: 'Field follow-up.\nCall on Friday.' };
  expect((await clients.field.post(endpoint, { data })).status()).toBe(403);
  for (const extra of [{ body: '   ' }, { body: 'x'.repeat(2001) }, { actorId: users.owner }]) expect((await clients.field.post(endpoint, { headers, data: { ...data, ...extra } })).status()).toBe(422);
  expect((await clients.field.post(`/api/leads/${ids[10]}/notes`, { headers, data: { ...data, leadId: ids[10] } })).status()).toBe(404);
  expect((await clients.owner.post(`/api/leads/${ids[67]}/notes`, { headers, data: { ...data, leadId: ids[67] } })).status()).toBe(404);
  const saved = await clients.field.post(endpoint, { headers, data }); expect(saved.status()).toBe(200); expect(saved.headers()['cache-control']).toContain('no-store'); expect((await saved.json()).note.authorName).toBe('Read test field');
  expect((await clients.field.post(endpoint, { headers, data })).status()).toBe(200);
  expect((await clients.field.post(endpoint, { headers, data: { ...data, body: 'Different content.' } })).status()).toBe(409);
  expect(Number((await db('leadActivity').where({ leadId: ids[9], type: 'note' }).count('* as n').first())?.n)).toBe(1);
  // Office still reads leads after losing stage permission; notes need only read access.
  expect((await clients.office.post(endpoint, { headers, data: { ...data, submissionId: randomUUID(), body: 'Office follow-up.' } })).status()).toBe(200);
  expect((await clients.field.get(`/api/leads/${ids[10]}/notes?workspace=${workspaceId}`)).status()).toBe(404);
  expect((await clients.owner.delete(endpoint, { headers })).status()).toBe(405);
});
test('team notes accept typing, persist safely, paginate and retry a lost save response without duplication', async ({ page }) => {
  test.setTimeout(60000);
  await db('leadActivity').insert(Array.from({ length: 25 }, (_, index) => ({ id: randomUUID(), workspaceId, leadId: ids[15], actorId: users.owner, actorName: 'Read test owner', actorType: 'user', type: 'note', changes: JSON.stringify({ body: `Earlier team note ${index + 1}` }), createdAt: new Date(Date.now() - (index + 1) * 60000) })));
  await login(page, 'field'); await page.goto(`/leads/${ids[15]}?workspace=${workspaceId}`);
  const input = page.getByRole('textbox', { name: 'Add a team note', exact: true }), submit = page.getByRole('button', { name: 'Add note', exact: true });
  const body = '<script>window.__noteXss = true</script>\nPlease call before visiting.';
  await expect(input).toBeEnabled(); await input.fill(body); await submit.click();
  await expect(input).toHaveValue(''); await expect(page.getByText(body, { exact: true })).toHaveCount(2);
  expect(await page.evaluate(() => '__noteXss' in window)).toBe(false);
  await page.reload(); await expect(page.getByText(body, { exact: true })).toHaveCount(2);
  await expect(page.getByText('Showing 20 of 26 notes', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Show older notes', exact: true }).click();
  await expect(page.getByText('Showing 26 of 26 notes', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Show older', exact: true }).click();
  await expect(page.getByText('Showing 26 of 26 notes', { exact: true })).toBeVisible();
  const retryBody = 'A saved note whose first response was lost.';
  await page.route(`**/api/leads/${ids[15]}/notes`, async route => {
    if (route.request().method() !== 'POST') { await route.continue(); return; }
    const saved = await route.fetch(); expect(saved.status()).toBe(200);
    await route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
  });
  await input.fill(retryBody); await submit.click();
  await expect(page.getByText('Could not add your note. Your text is preserved. Try again.', { exact: true })).toBeVisible(); await expect(input).toHaveValue(retryBody);
  expect(Number((await db('leadActivity').where({ leadId: ids[15], type: 'note' }).whereRaw("changes->>'body' = ?", [retryBody]).count('* as n').first())?.n)).toBe(1);
  await page.unroute(`**/api/leads/${ids[15]}/notes`); await submit.click(); await expect(input).toHaveValue('');
  expect(Number((await db('leadActivity').where({ leadId: ids[15], type: 'note' }).whereRaw("changes->>'body' = ?", [retryBody]).count('* as n').first())?.n)).toBe(1);
  await expect(page.getByText('Showing 20 of 27 notes', { exact: true })).toBeVisible();
});
test('Prepare follow-up opens the one shared assistant with an unsent draft and preserves existing text', async ({ page }) => {
  const before = Number((await db('leads').where({ workspaceId }).count('* as n').first())?.n);
  await login(page, 'field'); await page.goto(`/leads/${ids[18]}?workspace=${workspaceId}`);
  const prepare = page.getByRole('button', { name: 'Prepare follow-up', exact: true });
  const composer = page.getByRole('textbox', { name: 'Ask the SalesMora assistant', exact: true });
  const launcher = page.getByRole('button', { name: 'SalesMora assistant How can I help?', exact: true });
  const requests: string[] = []; page.on('request', request => { if (request.method() === 'POST' && request.url().endsWith('/api/chat/turns')) requests.push(request.postData() ?? ''); });
  await expect(prepare).toBeEnabled(); await expect(launcher).toHaveCount(1);
  await prepare.click(); await expect(page.locator('dialog:modal')).toHaveCount(1);
  await expect(composer).toBeFocused();
  const draft = await composer.inputValue();
  expect(draft).toContain('Prepare follow-up wording for LD-'); expect(draft).toContain('Read Customer 018'); expect(draft).toContain('Kitchen repair'); expect(draft).toContain('do not send any message or change records');
  expect(draft).not.toContain('18 Willow Street'); expect(draft).not.toContain('212'); expect(requests).toHaveLength(0);
  await composer.fill('My existing unsent draft.'); await page.getByRole('button', { name: 'Close chat', exact: true }).click();
  await expect(prepare).toBeFocused(); await prepare.click(); await expect(composer).toHaveValue('My existing unsent draft.'); expect(requests).toHaveLength(0);
  await page.getByRole('button', { name: 'Close chat', exact: true }).click(); await launcher.click(); await expect(composer).toHaveValue('My existing unsent draft.');
  await composer.fill(draft); await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Response complete.' })).toBeVisible(); expect(requests).toHaveLength(1);
  expect(JSON.parse(requests[0])).toMatchObject({ workspaceId, surfaceKey: 'lead.detail', recordRefs: [{ type: 'lead', id: ids[18] }], message: draft });
  expect(Number((await db('leads').where({ workspaceId }).count('* as n').first())?.n)).toBe(before);
  expect((await db('leads').where({ id: ids[18] }).first()).version).toBe(1);
  await page.getByRole('button', { name: 'Close chat', exact: true }).click(); await expect(launcher).toBeFocused();
  await prepare.click(); await composer.fill('fixture:slow'); await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Thinking…' })).toBeVisible();
  await page.getByRole('button', { name: 'Close chat', exact: true }).click(); await expect(prepare).toBeDisabled(); await expect(launcher).toBeFocused();
  await expect(page.getByText('The assistant is working. Wait for the current response before preparing another follow-up.', { exact: true })).toBeVisible();
  await expect(prepare).toBeEnabled();
  await db('workspaceRolePolicies').where({ workspaceId, role: 'field', permission: 'assistant.use' }).delete();
  await page.reload(); await expect(prepare).toBeDisabled(); await expect(launcher).toHaveCount(0);
  await expect(page.getByText('The assistant is unavailable right now. Try again later.', { exact: true })).toBeVisible();
});
async function editableValues(id: string) {
  const row = await db('leads').where({ id }).first();
  return { name: row.name as string, email: row.email as string, phone: row.phone as string, service: row.service as string, address: row.address as string, details: row.details as string, notes: row.notes as string, source: row.source as string };
}
test('lead edit API enforces ordinary fields, role/scope, source origin, versions and replay', async () => {
  const endpoint = `/api/leads/${ids[24]}`, values = await editableValues(ids[24]);
  const data = { workspaceId, leadId: ids[24], expectedVersion: 1, submissionId: randomUUID(), values: { ...values, name: ' Updated field customer ', email: 'HELLO@EXAMPLE.TEST', source: 'gmail' } };
  expect((await clients.field.patch(endpoint, { data })).status()).toBe(403);
  for (const extra of [{ stage: 'won' }, { ownerId: users.field }, { origin: 'manual' }, { workspaceId: otherWorkspace }]) expect((await clients.field.patch(endpoint, { headers, data: { ...data, values: { ...data.values, ...extra } } })).status()).toBe(400);
  expect((await clients.field.patch(endpoint, { headers, data: { ...data, actorId: users.owner } })).status()).toBe(400);
  expect((await clients.field.patch(`/api/leads/${ids[25]}`, { headers, data: { ...data, leadId: ids[25] } })).status()).toBe(404);
  expect((await clients.owner.patch(`/api/leads/${ids[67]}`, { headers, data: { ...data, leadId: ids[67] } })).status()).toBe(404);
  expect((await clients.owner.patch(`/api/leads/${ids[65]}`, { headers, data: { ...data, leadId: ids[65] } })).status()).toBe(409);
  expect((await clients.field.patch(endpoint, { headers, data: { ...data, values: { ...data.values, email: 'invalid' } } })).status()).toBe(422);
  const saved = await clients.field.patch(endpoint, { headers, data }); expect(saved.status()).toBe(200); expect(saved.headers()['cache-control']).toContain('no-store');
  const result = await saved.json(); expect(result.lead).toMatchObject({ name: 'Updated field customer', email: 'hello@example.test', source: 'gmail', origin: 'manual', version: 2, canEdit: true });
  expect((await clients.field.patch(endpoint, { headers, data })).status()).toBe(200);
  const stale = await clients.field.patch(endpoint, { headers, data: { ...data, submissionId: randomUUID() } }); expect(stale.status()).toBe(409); expect((await stale.json()).changedFields.sort()).toEqual(['email', 'name', 'source']);
  expect((await clients.field.patch(endpoint, { headers, data: { ...data, expectedVersion: 2, submissionId: randomUUID(), values: { ...data.values, source: 'phone' } } })).status()).toBe(200);
  expect(Number((await db('leadActivity').where({ leadId: ids[24], type: 'edited' }).count('* as n').first())?.n)).toBe(2);
  const gmailValues = await editableValues(ids[63]);
  expect((await clients.field.patch(`/api/leads/${ids[63]}`, { headers, data: { ...data, leadId: ids[63], submissionId: randomUUID(), values: { ...gmailValues, source: 'phone' } } })).status()).toBe(422);
  const withoutSource = Object.fromEntries(Object.entries(gmailValues).filter(([field]) => field !== 'source'));
  const gmail = await clients.field.patch(`/api/leads/${ids[63]}`, { headers, data: { ...data, leadId: ids[63], submissionId: randomUUID(), values: { ...withoutSource, service: 'Gmail-origin edit' } } }); expect(gmail.status()).toBe(200); expect((await gmail.json()).lead).toMatchObject({ source: 'gmail', origin: 'gmail' });
  await db('workspaceRolePolicies').where({ workspaceId, role: 'office', permission: 'leads.update' }).delete();
  expect((await clients.office.patch(endpoint, { headers, data })).status()).toBe(404);
  expect((await (await clients.office.get(`/api/leads/${ids[24]}?workspace=${workspaceId}`)).json()).lead.canEdit).toBe(false);
});
test('lead editor saves fields/history, guards discard and preserves a draft across conflict and explicit reload', async ({ page }) => {
  test.setTimeout(60000); await login(page, 'field'); await page.goto(`/leads/${ids[27]}?workspace=${workspaceId}`);
  const open = page.getByRole('button', { name: 'Edit lead', exact: true }), editor = page.getByRole('dialog', { name: 'Edit lead', exact: true });
  await open.click(); const name = editor.getByRole('textbox', { name: 'Lead name', exact: true }), service = editor.getByRole('textbox', { name: 'Service requested', exact: true });
  await name.fill('Field customer edited'); await editor.getByRole('textbox', { name: 'Email address (optional)', exact: true }).fill('EDITED@EXAMPLE.TEST');
  await service.fill('Updated repair request'); await editor.getByRole('textbox', { name: 'Notes (optional)', exact: true }).fill('Updated internal context.');
  await editor.getByRole('combobox', { name: 'Source', exact: true }).selectOption('referral');
  await editor.getByRole('button', { name: 'Save changes', exact: true }).click(); await expect(editor).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Field customer edited', exact: true, level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lead details updated', exact: true })).toBeVisible();
  expect((await db('leads').where({ id: ids[27] }).first()).email).toBe('edited@example.test');
  await page.reload(); await open.click(); await service.fill('My unsaved service');
  await editor.getByRole('button', { name: 'Cancel', exact: true }).click();
  const discard = page.getByRole('alertdialog', { name: 'Discard unsaved changes?', exact: true }); await expect(discard).toBeVisible();
  await discard.getByRole('button', { name: 'Cancel', exact: true }).click(); await expect(service).toHaveValue('My unsaved service');
  const row = await db('leads').where({ id: ids[27] }).first();
  const changed = await clients.field.patch(`/api/leads/${ids[27]}`, { headers, data: { workspaceId, leadId: ids[27], expectedVersion: row.version, submissionId: randomUUID(), values: { ...await editableValues(ids[27]), service: 'Another teammate service', notes: 'Another teammate note' } } }); expect(changed.status()).toBe(200);
  await editor.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(service).toHaveValue('My unsaved service'); await expect(service).toHaveAttribute('readonly');
  await expect(editor.getByText('Changed by another teammate. Your unsaved text is preserved.', { exact: true })).toHaveCount(2);
  await expect(editor.getByRole('button', { name: 'Save changes', exact: true })).toBeDisabled();
  await editor.getByRole('button', { name: 'Reload latest details', exact: true }).click(); await discard.getByRole('button', { name: 'Reload and discard edits', exact: true }).click();
  await expect(service).toHaveValue('Another teammate service'); await expect(service).not.toHaveAttribute('readonly');
  await service.fill('Reapplied service'); await editor.getByRole('button', { name: 'Save changes', exact: true }).click(); await expect(editor).toHaveCount(0);
  expect((await db('leads').where({ id: ids[27] }).first()).service).toBe('Reapplied service');
  await page.goto(`/leads/${ids[63]}?workspace=${workspaceId}`); await open.click(); await expect(editor.getByRole('combobox', { name: 'Source', exact: true })).toBeDisabled();
});
test('mobile editor safely retries a lost save response and preserves edits when permission is revoked', async ({ page }) => {
  test.setTimeout(60000); await login(page, 'field'); await page.setViewportSize({ width: 390, height: 950 });
  await page.goto(`/leads/${ids[30]}?workspace=${workspaceId}`); await page.getByRole('button', { name: 'Edit lead', exact: true }).click();
  const editor = page.getByRole('dialog', { name: 'Edit lead', exact: true }), name = editor.getByRole('textbox', { name: 'Lead name', exact: true });
  await name.fill('Saved once despite lost response');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.route(`**/api/leads/${ids[30]}`, async route => {
    if (route.request().method() !== 'PATCH') { await route.continue(); return; }
    const result = await route.fetch(); expect(result.status()).toBe(200);
    await route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
  });
  await editor.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(editor.getByText('The save could not be confirmed. Your edits are preserved. Retry to check the saved result.', { exact: true })).toBeVisible(); await expect(name).toHaveValue('Saved once despite lost response');
  await page.unroute(`**/api/leads/${ids[30]}`); await editor.getByRole('button', { name: 'Save changes', exact: true }).click(); await expect(editor).toHaveCount(0);
  expect(Number((await db('leadActivity').where({ leadId: ids[30], type: 'edited' }).count('* as n').first())?.n)).toBe(1);
  expect((await db('leads').where({ id: ids[30] }).first()).version).toBe(2);
  await page.getByRole('button', { name: 'Edit lead', exact: true }).click();
  const service = editor.getByRole('textbox', { name: 'Service requested', exact: true }); await service.fill('Keep my unsaved service');
  await db('workspaceRolePolicies').where({ workspaceId, role: 'field', permission: 'leads.update' }).delete();
  await editor.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(service).toHaveValue('Keep my unsaved service'); await expect(service).toHaveAttribute('readonly'); await expect(editor.getByRole('button', { name: 'Save changes', exact: true })).toBeDisabled();
  await expect(editor.getByText('This lead is unavailable or your edit permission changed. Your edits are preserved.', { exact: true })).toBeVisible();
  expect((await db('leads').where({ id: ids[30] }).first()).service).toBe('Kitchen repair');
});

test('owner assignment, notification bell and personal opt-out are connected with scoped APIs', async ({ page, browser }) => {
  test.setTimeout(60000);
  const leadId=randomUUID();
  const duplicates: string[] = [];
  const monitor = (message: import('@playwright/test').ConsoleMessage) => { if (message.text().includes('same key')) duplicates.push(message.text()); };
  page.on('console',monitor);
  await db('leads').insert({id:leadId,workspaceId,createdBy:users.owner,submissionId:randomUUID(),submissionHash:'assignment-fixture',name:'Assignment Customer',email:'',phone:'',service:'Assignment repair',address:'',details:'',notes:'',source:'website',stage:'new',ownerId:null});
  const endpoint=`/api/leads/${leadId}/owner`, data={workspaceId,leadId,submissionId:randomUUID(),expectedVersion:1,ownerId:users.field};
  const missingOrigin=await clients.owner.post(endpoint,{data});expect(missingOrigin.status(),await missingOrigin.text()).toBe(403);
  expect((await clients.field.post(endpoint,{headers,data})).status()).toBe(404);
  expect((await clients.owner.post(endpoint,{headers,data:{...data,ownerId:users.other}})).status()).toBe(409);
  expect((await clients.owner.post(endpoint,{headers,data:{...data,actorId:users.other}})).status()).toBe(422);
  await login(page,'owner');await page.goto(`/leads/${leadId}?workspace=${workspaceId}`);
  await page.getByRole('button',{name:'Change owner',exact:true}).click();
  const confirm=page.getByRole('alertdialog',{name:'Change owner',exact:true});
  await confirm.getByRole('combobox',{name:'Lead owner',exact:true}).selectOption(users.field);
  await page.route(`**/api/leads/${leadId}/owner`,async route=>{const response=await route.fetch();expect(response.status()).toBe(200);await route.abort('failed');});
  await confirm.getByRole('button',{name:'Assign owner',exact:true}).click();
  await expect(confirm.getByText('The action could not be completed. Your current view has been preserved.',{exact:true})).toBeVisible();
  await page.unroute(`**/api/leads/${leadId}/owner`);
  await confirm.getByRole('button',{name:'Assign owner',exact:true}).click();await expect(confirm).toHaveCount(0);
  expect(Number((await db('leadActivity').where({leadId,type:'assigned'}).count('* as n').first())?.n)).toBe(1);
  await expect(page.getByText('Lead owner updated.',{exact:true})).toBeVisible();
  const saved=await db('leads').where({id:leadId}).first();expect(saved.ownerId).toBe(users.field);expect(saved.version).toBe(2);
  await expect(page.getByRole('heading',{name:'Activity history',exact:true})).toBeVisible();

  const authorizedDetail=await (await clients.owner.get(`/api/leads/${leadId}?workspace=${workspaceId}`)).json();expect(new Set(authorizedDetail.activity.map((row:{id:string})=>row.id)).size).toBe(authorizedDetail.activity.length);
  const notifications=await clients.field.get(`/api/notifications?workspace=${workspaceId}`);expect(notifications.status()).toBe(200);expect(notifications.headers()['cache-control']).toContain('no-store');
  const notificationBody=await notifications.json();expect(new Set(notificationBody.items.map((row:{id:string})=>row.id)).size).toBe(notificationBody.items.length);const item=notificationBody.items.find((n:{leadId:string})=>n.leadId===leadId);expect(item).toBeTruthy();
  expect((await clients.owner.post('/api/notifications/read',{headers,data:{workspaceId,id:item.id}})).status()).toBe(404);
  expect((await clients.field.put('/api/settings/notifications',{headers,data:{workspaceId,leadAssignedEmail:false,userId:users.owner}})).status()).toBe(400);
  const fieldContext=await browser.newContext({storageState:await clients.field.storageState()}), fieldPage=await fieldContext.newPage();fieldPage.on('console',monitor);
  await fieldPage.goto(`/leads/${leadId}?workspace=${workspaceId}`);
  await fieldPage.getByRole('button',{name:/Open notifications/}).click();
  const menu=fieldPage.getByRole('dialog',{name:'Notifications',exact:true});
  await expect(menu.getByText(/Assignment Customer/)).toBeVisible();
  await menu.getByRole('button',{name:'Mark as read',exact:true}).click();
  await expect(menu.getByText('Read',{exact:true})).toBeVisible();
  await menu.getByRole('link',{name:'Notification preferences',exact:true}).click();
  await expect(fieldPage.getByRole('heading',{name:'Notification preferences',exact:true})).toBeVisible();
  await fieldPage.getByRole('switch',{name:'Lead assigned to you',exact:true}).click();
  await fieldPage.getByRole('button',{name:'Save preferences',exact:true}).click();
  await expect(fieldPage.getByText('Your email notification preferences have been updated.',{exact:true})).toBeVisible();
  await fieldPage.reload();await expect(fieldPage.getByRole('switch',{name:'Lead assigned to you',exact:true})).not.toBeChecked();
  expect((await (await clients.owner.get(`/api/settings/notifications?workspace=${workspaceId}`)).json()).leadAssignedEmail).toBe(true);
  const version=(await db('leads').where({id:leadId}).first()).version;
  const unassign={...data,submissionId:randomUUID(),expectedVersion:version,ownerId:null};
  expect((await clients.owner.post(endpoint,{headers,data:unassign})).status()).toBe(200);
  expect((await clients.owner.post(endpoint,{headers,data:unassign})).status()).toBe(200); // Safe lost-response replay.
  expect((await clients.field.get(`/api/leads/${leadId}?workspace=${workspaceId}`)).status()).toBe(404);
  expect((await (await clients.field.get(`/api/notifications?workspace=${workspaceId}`)).json()).items).toHaveLength(0);
  const createRequest={workspaceId,submissionId:randomUUID(),lead:{name:'Assigned on creation',email:'',phone:'',service:'Fixture repair',address:'',details:'',notes:'',source:'website',stage:'new',ownerId:users.field}};
  const created=await clients.owner.post('/api/leads',{headers,data:createRequest});expect(created.status()).toBe(201);const createdId=(await created.json()).leadId;
  expect((await clients.owner.post('/api/leads',{headers,data:createRequest})).status()).toBe(200);
  expect(Number((await db('assignmentNotifications').where({leadId:createdId}).count('* as n').first())?.n)).toBe(1);
  await fieldContext.close();
  expect(duplicates).toEqual([]);
});

test('archive and restore APIs enforce scope, strict payloads, versioning, replay and current permissions',async()=>{
  const id=randomUUID();await db('leads').insert({id,workspaceId,createdBy:users.owner,submissionId:randomUUID(),submissionHash:'archive-fixture',name:'Archive API Customer',email:'',phone:'',service:'Fixture repair',address:'',details:'Retain these details',notes:'Retain this note',source:'website',stage:'won',ownerId:users.field});
  const endpoint=`/api/leads/${id}/archive`,data={workspaceId,leadId:id,expectedVersion:1,submissionId:randomUUID()};
  expect((await clients.owner.post(endpoint,{data})).status()).toBe(403);
  expect((await clients.field.post(endpoint,{headers,data})).status()).toBe(404);
  expect((await clients.owner.post(endpoint,{headers,data:{...data,archivedBy:users.field}})).status()).toBe(400);
  expect((await clients.owner.post(`/api/leads/${ids[67]}/archive`,{headers,data:{...data,leadId:ids[67]}})).status()).toBe(404);
  const admission=await db('workspaceLeadAdmissions').where({workspaceId}).count('* as n').first();
  const response=await clients.owner.post(endpoint,{headers,data});expect(response.status()).toBe(200);expect(response.headers()['cache-control']).toContain('no-store');
  expect((await clients.owner.post(endpoint,{headers,data})).status()).toBe(200);
  expect((await clients.owner.post(endpoint,{headers,data:{...data,submissionId:randomUUID()}})).status()).toBe(409);
  const archived=(await (await clients.owner.get(`/api/leads/${id}?workspace=${workspaceId}`)).json()).lead;
  expect(archived).toMatchObject({archived:true,canArchive:false,canRestore:true,canEdit:false,canMove:false,canAssign:false,stage:'won',notes:'Retain this note'});
  const visible=await (await clients.owner.get(`/api/leads?workspace=${workspaceId}&q=Archive+API&view=list`)).json();expect(visible.total).toBe(0);
  const restore={...data,expectedVersion:2,submissionId:randomUUID()};
  expect((await clients.owner.delete(endpoint,{headers,data:restore})).status()).toBe(200);
  expect((await clients.owner.delete(endpoint,{headers,data:restore})).status()).toBe(200);
  expect((await db('leads').where({id}).first()).version).toBe(3);
  expect(Number((await db('workspaceLeadAdmissions').where({workspaceId}).count('* as n').first())?.n)).toBe(Number(admission?.n));
  expect((await clients.office.post(endpoint,{headers,data:{...data,expectedVersion:3,submissionId:randomUUID()}})).status()).toBe(404);
  expect(Number((await db('leadActivity').where({leadId:id}).whereIn('type',['archived','restored']).count('* as n').first())?.n)).toBe(2);
  const grant=await db('workspaceRolePolicies').where({workspaceId,role:'owner',permission:'leads.archive'}).first();
  await db('workspaceRolePolicies').where({workspaceId,role:'owner',permission:'leads.archive'}).delete();
  expect((await clients.owner.post(endpoint,{headers,data:{...data,expectedVersion:3,submissionId:randomUUID()}})).status()).toBe(404);
  await db('workspaceRolePolicies').insert(grant);
});

test('live record archive and list restore preserve filters, history and data with a lost-response retry',async({page})=>{
  await login(page,'owner');const id=randomUUID();
  await db('leads').insert({id,workspaceId,createdBy:users.owner,submissionId:randomUUID(),submissionHash:'archive-ui-fixture',name:'Archive UI Customer',email:'',phone:'',service:'Fixture repair',address:'',details:'Kept details',notes:'Kept notes',source:'website',stage:'new',ownerId:users.owner});
  await page.goto(`/leads/${id}?workspace=${workspaceId}&view=list&q=Archive+UI`);
  await page.getByRole('button',{name:'Archive',exact:true}).click();
  const dialog=page.getByRole('alertdialog',{name:'Archive lead?',exact:true});
  await expect(dialog).toBeVisible();
  await page.route(`**/api/leads/${id}/archive`,async route=>{const result=await route.fetch();expect(result.status()).toBe(200);await route.abort('failed');});
  await dialog.getByRole('button',{name:'Archive lead',exact:true}).click();
  await expect(dialog.getByText('The action could not be completed. Your current view has been preserved.',{exact:true})).toBeVisible();
  await page.unroute(`**/api/leads/${id}/archive`);
  await dialog.getByRole('button',{name:'Archive lead',exact:true}).click();await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Restore',exact:true})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Lead archived',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Edit lead',exact:true})).toHaveCount(0);
  await page.getByRole('link',{name:'Back to leads',exact:true}).click();await expect(page).toHaveURL(/q=Archive\+UI/);
  await expect(page.getByRole('link',{name:'Archive UI Customer',exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'Show archived',exact:true}).click();
  const row=page.getByRole('row',{name:/Archive UI Customer/});await expect(row).toBeVisible();
  await row.getByRole('button',{name:/Restore/}).click();
  const restore=page.getByRole('alertdialog',{name:'Restore lead?',exact:true});await restore.getByRole('button',{name:'Restore lead',exact:true}).click();await expect(restore).toHaveCount(0);
  await expect(row.getByRole('button',{name:/Restore/})).toHaveCount(0);
  await page.getByRole('button',{name:'Show archived',exact:true}).click();await expect(row).toBeVisible();
  await row.getByRole('link',{name:'Archive UI Customer',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Lead restored',exact:true})).toBeVisible();
  expect((await db('leads').where({id}).first())).toMatchObject({version:3,archivedAt:null,archivedBy:null,notes:'Kept notes',details:'Kept details'});
});

test('permanent deletion API enforces identity, exact confirmation, lifecycle, versions and replay', async () => {
  const id = randomUUID();
  await db('leads').insert({ id, workspaceId, createdBy: users.owner, submissionId: randomUUID(), submissionHash: 'delete-api-fixture', name: 'Delete API Customer', email: '', phone: '', service: 'Fixture repair', address: '', details: 'Removed details', notes: 'Removed notes', source: 'website', stage: 'new', ownerId: users.field });
  const row = await db('leads').where({ id }).first();
  const endpoint = `/api/leads/${id}`, data = { workspaceId, leadId: id, expectedVersion: 1, submissionId: randomUUID(), typedConfirmation: `LD-${String(row.leadNumber).padStart(4, '0')}` };
  expect((await clients.owner.delete(endpoint, { data })).status()).toBe(403);
  expect((await clients.field.delete(endpoint, { headers, data })).status()).toBe(404);
  expect((await clients.office.delete(endpoint, { headers, data })).status()).toBe(404);
  expect((await clients.other.delete(endpoint, { headers, data })).status()).toBe(404);
  expect((await clients.owner.delete(endpoint, { headers, data: { ...data, actorId: users.owner } })).status()).toBe(400);
  expect((await clients.owner.delete(endpoint, { headers, data: { ...data, typedConfirmation: ` ${data.typedConfirmation} ` } })).status()).toBe(422);
  expect((await clients.owner.delete(endpoint, { headers, data: { ...data, expectedVersion: 2 } })).status()).toBe(409);
  await db('leads').where({ id }).update({ stage: 'won' });
  expect((await clients.owner.delete(endpoint, { headers, data })).status()).toBe(422);
  await db('leads').where({ id }).update({ stage: 'lost', archivedAt: new Date() });
  const response = await clients.owner.delete(endpoint, { headers, data }); expect(response.status()).toBe(200); expect(response.headers()['cache-control']).toContain('no-store');
  expect(await response.json()).toEqual({ deleted: true });
  expect((await clients.owner.delete(endpoint, { headers, data })).status()).toBe(200);
  expect((await clients.owner.delete(endpoint, { headers, data: { ...data, typedConfirmation: 'LD-9999' } })).status()).toBe(409);
  expect((await clients.owner.get(`${endpoint}?workspace=${workspaceId}`)).status()).toBe(404);
  expect(await db('leadActivity').where({ leadId: id }).first()).toBeUndefined();
  expect(await db('workspaceLeadAdmissions').where({ leadId: id }).first()).toBeTruthy();
  expect(Number((await db('leadDeletionAudit').where({ leadId: id }).count('* as n').first())?.n)).toBe(1);
  const grant = await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'leads.delete' }).first();
  await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'leads.delete' }).delete();
  expect((await clients.owner.delete(endpoint, { headers, data })).status()).toBe(404);
  await db('workspaceRolePolicies').insert(grant);
});

test('live typed deletion handles a lost response and returns to the originating filtered list', async ({ page }) => {
  await login(page, 'owner'); const id = randomUUID();
  await db('leads').insert({ id, workspaceId, createdBy: users.owner, submissionId: randomUUID(), submissionHash: 'delete-ui-fixture', name: 'Delete UI Customer', email: '', phone: '', service: 'Fixture repair', address: '', details: '', notes: 'Private fixture note', source: 'website', stage: 'new', ownerId: users.owner });
  const row = await db('leads').where({ id }).first(), leadNumber = `LD-${String(row.leadNumber).padStart(4, '0')}`;
  await page.goto(`/leads/${id}?workspace=${workspaceId}&view=list&q=Delete+UI`);
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  const dialog = page.getByRole('alertdialog', { name: 'Delete this lead permanently?', exact: true });
  await expect(dialog).toBeVisible(); const confirm = dialog.getByRole('button', { name: 'Delete lead', exact: true });
  await expect(confirm).toBeDisabled();
  await dialog.getByRole('textbox', { name: 'Lead number', exact: true }).fill('LD-9999'); await expect(confirm).toBeDisabled();
  await dialog.getByRole('textbox', { name: 'Lead number', exact: true }).fill(leadNumber); await expect(confirm).toBeEnabled();
  await page.route(`**/api/leads/${id}`, async route => {
    if (route.request().method() !== 'DELETE') return route.continue();
    const result = await route.fetch(); expect(result.status()).toBe(200); await route.abort('failed');
  });
  await confirm.click();
  await expect(dialog.getByText('The action could not be completed. Your current view has been preserved.', { exact: true })).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'Lead number', exact: true })).toHaveValue(leadNumber);
  await page.unroute(`**/api/leads/${id}`);
  await confirm.click();
  await expect(page).toHaveURL(new RegExp(`/leads\\?[^#]*q=Delete\\+UI`));
  await expect(page.getByRole('heading', { name: 'Leads', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Delete UI Customer', exact: true })).toHaveCount(0);
  expect(await db('leads').where({ id }).first()).toBeUndefined();
  expect(Number((await db('leadDeletionAudit').where({ leadId: id }).count('* as n').first())?.n)).toBe(1);
});

test('export API downloads the full filtered set with safe CSV, fresh authority and content-free audit', async () => {
  await db('workspaceMemberships').insert({ workspaceId, userId: users.admin, role: 'admin' }).onConflict(['workspaceId', 'userId']).ignore();
  const fixtureIds = Array.from({ length: 36 }, () => randomUUID());
  await db('leads').insert(fixtureIds.map((id, index) => ({ id, workspaceId, createdBy: users.owner, submissionId: randomUUID(), submissionHash: 'export-fixture', name: `CSV Export Fixture ${String(index).padStart(2, '0')}`, email: '', phone: '+12125550134', service: 'Fixture repair', address: 'Renée, 李', details: '=1+1', notes: 'A "quote"\nSecond line', source: 'website', stage: 'new', ownerId: users.owner, archivedAt: index === 35 ? new Date() : null })));
  const data = { workspaceId, filters: { query: 'CSV Export Fixture', stages: [], sources: [], ownerIds: [], created: 'any', from: '', to: '', attention: false, archived: false } };
  const url = `/api/leads/export?${new URLSearchParams({ workspaceId, filters: JSON.stringify(data.filters) })}`, downloadHeaders = { ...headers, 'X-SalesMora-Export': '1' };
  expect((await clients.owner.post('/api/leads/export', { data })).status()).toBe(403);
  expect((await clients.owner.get(url)).status()).toBe(403);
  expect((await clients.owner.get(url, { headers: { ...downloadHeaders, Origin: 'https://other.example.test' } })).status()).toBe(403);
  for (const role of ['office', 'field', 'other']) expect((await clients[role].post('/api/leads/export', { headers, data })).status()).toBe(404);
  expect((await clients.owner.post('/api/leads/export', { headers, data: { ...data, rowLimit: 999999 } })).status()).toBe(400);
  expect((await clients.owner.post('/api/leads/export', { headers, data: { ...data, workspaceId: otherWorkspace } })).status()).toBe(404);
  const preview = await (await clients.owner.post('/api/leads/export', { headers, data })).json(); expect(preview).toMatchObject({ count: 35, scope: 'workspace' });
  for (const role of ['owner', 'admin']) {
    const response = await clients[role].get(url, { headers: downloadHeaders }); expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/csv'); expect(response.headers()['cache-control']).toContain('no-store'); expect(response.headers()['x-export-count']).toBe('35');
    const text = await response.text(); expect((text.match(/"CSV Export Fixture /g) ?? []).length).toBe(35); expect(text).not.toContain(fixtureIds[35]); expect(text).toContain('"\'=1+1"'); expect(text).toContain('"\'+12125550134"'); expect(text).toContain('Renée, 李'); expect(text).toContain('A ""quote""\nSecond line');
  }
  const archived = new URLSearchParams({ workspaceId, filters: JSON.stringify({ ...data.filters, archived: true }) });
  expect((await clients.owner.get(`/api/leads/export?${archived}`, { headers: downloadHeaders })).headers()['x-export-count']).toBe('36');
  const audit = await db('leadExportAudit').where({ workspaceId, actorId: users.owner, outcome: 'completed' }).orderBy('createdAt', 'desc').first(); expect(audit.count).toBe(36); expect(audit.rowsSent).toBe(36); expect(JSON.stringify(audit.filters)).not.toContain('CSV Export Fixture');
  const grant = await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'leads.export' }).first();
  await db('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'leads.export' }).delete();
  expect((await clients.owner.get(url, { headers: downloadHeaders })).status()).toBe(404); await db('workspaceRolePolicies').insert(grant);
  if (process.env.LEAD_EXPORT_ROW_LIMIT === '40') {
    const all = `/api/leads/export?${new URLSearchParams({ workspaceId, filters: JSON.stringify({ ...data.filters, query: '' }) })}`;
    expect((await clients.owner.get(all, { headers: downloadHeaders })).status()).toBe(422);
    expect((await db('leadExportAudit').where({ workspaceId, outcome: 'rejected' }).orderBy('createdAt', 'desc').first()).rowsSent).toBe(0);
  }
});

test('live export checks counts before confirmation and downloads only after a complete successful response', async ({ page }) => {
  await login(page, 'owner');
  // Independent fixture so the test also runs alone.
  const name = `Browser CSV ${randomUUID()}`;
  await db('leads').insert(Array.from({ length: 35 }, () => ({ id: randomUUID(), workspaceId, createdBy: users.owner, submissionId: randomUUID(), submissionHash: 'csv-browser-fixture', name, email: '', phone: '', service: 'Fixture repair', address: '', details: '', notes: '', source: 'website', stage: 'new', ownerId: users.owner })));
  await page.goto(`/leads?workspace=${workspaceId}&view=list&q=${encodeURIComponent(name)}`);
  let release!: () => void; const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/leads/export', async route => { await gate; await route.continue(); });
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  const dialog = page.getByRole('alertdialog', { name: 'Export leads as CSV?', exact: true });
  await expect(dialog.getByText('Checking the number of matching leads…', { exact: true })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Export CSV', exact: true })).toBeDisabled();
  release(); await expect(dialog.getByText('All 35 matching leads', { exact: true })).toBeVisible();
  await page.unroute('**/api/leads/export');
  let downloads = 0; page.on('download', () => { downloads++; });
  await page.route('**/api/leads/export?*', async route => { await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Fixture failure' }) }); });
  await dialog.getByRole('button', { name: 'Export CSV', exact: true }).click();
  await expect(dialog.getByText('The action could not be completed. Your current view has been preserved.', { exact: true })).toBeVisible(); expect(downloads).toBe(0);
  await page.unroute('**/api/leads/export?*');
  const downloaded = page.waitForEvent('download'); await dialog.getByRole('button', { name: 'Export CSV', exact: true }).click();
  const file = await downloaded; expect(file.suggestedFilename()).toBe('salesmora-leads.csv'); expect(await file.failure()).toBeNull();
  const { readFile } = await import('node:fs/promises'); const csv = await readFile((await file.path())!, 'utf8');
  expect((csv.match(new RegExp(name, 'g')) ?? []).length).toBe(35); await expect(dialog).toHaveCount(0); expect(downloads).toBe(1);
  expect(new URL(page.url()).searchParams.get('q')).toBe(name);
});
