import { expect, test, type Page } from '@playwright/test';
import { createDatabase } from '@salesmora/data';
const testURL = process.env.TEST_DATABASE_URL;
if (!testURL || !new URL(testURL).pathname.endsWith('_test') || testURL === process.env.DATABASE_URL) throw new Error('Workspace tests require isolated _test database.');
const db = createDatabase(testURL);
const origin = 'http://127.0.0.1:3002';
const headers = { Origin: origin };
const owner = { name: 'Workspace Owner', email: 'workspace-owner@example.com', password: 'Fictional-owner-password-42!', termsAccepted: true };
const input = { business: { businessName: 'Northstar Plumbing', businessType: 'plumbing' }, services: { services: ['drain-cleaning', 'repairs'], postalCode: '10013', serviceRange: '25-miles' }, team: { invitations: [{ email: 'alex@example.com', role: 'office' }, { email: 'jordan@example.com', role: 'admin' }] } };
test.beforeEach(async () => { await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE'); });
test.afterAll(async () => { await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE'); await db.destroy(); });
async function signUp(page: Page) {
  const response = await page.context().request.post('/api/auth/sign-up/email', { headers, data: owner });
  expect(response.ok()).toBe(true);
  await page.goto('/setup');
}
async function fillBusinessAndServices(page: Page) {
  await page.getByRole('textbox', { name: 'Business name' }).fill(input.business.businessName);
  await page.getByRole('combobox', { name: 'Business type' }).selectOption('plumbing');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  const search = page.getByRole('combobox', { name: 'Services' });
  for (const name of ['Drain cleaning', 'Repairs']) {
    await search.fill(name);
    await page.getByRole('option', { name, exact: true }).click();
    await page.keyboard.press('Escape');
  }
  await page.getByRole('textbox').fill('10013');
  await page.getByRole('combobox', { name: 'Typical service range' }).selectOption('25-miles');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
}
test('creates the selected workspace atomically from the real four-step UI and resumes Home', async ({ page }) => {
  await signUp(page);
  await fillBusinessAndServices(page);
  await expect(page.getByText(owner.email, { exact: true })).toHaveCount(2);
  for (const invite of input.team.invitations) {
    await page.getByRole('button', { name: 'Add teammate', exact: true }).click();
    await page.getByRole('textbox').last().fill(invite.email);
    await page.getByRole('combobox', { name: 'Permission role' }).last().selectOption(invite.role);
  }
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Edit business', exact: true }).click();
  await page.getByRole('textbox').fill('  Updated Northstar  ');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('list', { name: 'Teammate invitations' })).toContainText('jordan@example.com');
  let submissions = 0;
  await page.route('**/api/workspaces', async route => { submissions++; await new Promise(resolve => setTimeout(resolve, 400)); await route.continue(); });
  await page.getByRole('button', { name: 'Create workspace', exact: true }).dblclick();
  await expect(page.getByRole('button', { name: 'Creating workspace…', exact: true })).toBeDisabled();
  await expect(page).toHaveURL(/\/home$/, { timeout: 15000 });
  expect(submissions).toBe(1);
  const user = await db('users').where({ email: owner.email }).first();
  const workspace = await db('workspaces').first();
  expect(workspace).toMatchObject({ ownerId: user.id, businessName: 'Updated Northstar', businessType: 'plumbing', postalCode: '10013', serviceRange: '25-miles' });
  expect((await db('workspaceServices')).map(row => row.service).sort()).toEqual(['drain-cleaning', 'repairs']);
  expect(await db('workspaceMemberships')).toEqual([expect.objectContaining({ workspaceId: workspace.id, userId: user.id, role: 'owner' })]);
  expect(await db('workspaceInvitations').orderBy('email')).toEqual(input.team.invitations.map(invite => expect.objectContaining({ ...invite, workspaceId: workspace.id, status: 'pending_verification' })));
  expect((await db('users').where({ id: user.id }).first()).onboardingStatus).toBe('complete');
  await page.reload();
  await expect(page.getByRole('main').getByText('Updated Northstar', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('heading',{name:`Welcome, ${owner.name}.`,level:1})).toBeVisible();
  await expect(page.getByRole('button',{name:'View workspace details'})).toHaveCount(0);
  await expect(page.getByRole('complementary')).toContainText(owner.name);
  await expect(page.getByRole('complementary')).toContainText('Owner');
  await expect(page.getByRole('button',{name:'Calendar Coming soon',exact:true})).toBeDisabled();
  await expect(page.getByRole('button',{name:'Estimates Coming soon',exact:true})).toBeDisabled();
  await page.goto('/setup'); await expect(page).toHaveURL(/\/home$/);
  await page.getByRole('button', { name: /Account options/ }).click();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  const signIn = await page.context().request.post('/api/auth/sign-in/email', { headers, data: { email: owner.email, password: owner.password } });
  expect(signIn.status()).toBe(200);
  await page.goto('/setup'); await expect(page).toHaveURL(/\/home$/);
});
test('skipped invitations stay in the draft but are excluded from creation', async ({ page }) => {
  await signUp(page); await fillBusinessAndServices(page);
  await page.getByRole('button', { name: 'Add teammate' }).click();
  await page.getByRole('textbox').fill('draft@example.com');
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await expect(page.getByText('No teammate invitations. You can invite people later.')).toBeVisible();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('textbox')).toHaveValue('draft@example.com');
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await page.getByRole('button', { name: 'Create workspace', exact: true }).click();
  await expect(page).toHaveURL(/\/home$/);
  expect(await db('workspaceInvitations')).toHaveLength(0);
});
test('failed submission retains review details and allows retry', async ({ page }) => {
  await signUp(page); await fillBusinessAndServices(page);
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await page.route('**/api/workspaces', route => route.fulfill({ status: 500, json: { error: 'Unavailable' } }), { times: 1 });
  await page.getByRole('button', { name: 'Create workspace', exact: true }).click();
  await expect(page.getByRole('alert', { name: 'Workspace could not be created' })).toContainText('Your details are still here');
  await expect(page.getByText(input.business.businessName, { exact: true })).toBeVisible();
  expect(await db('workspaces')).toHaveLength(0);
  await page.getByRole('button', { name: 'Create workspace', exact: true }).click();
  await expect(page).toHaveURL(/\/home$/);
  expect(await db('workspaces')).toHaveLength(1);
});
test('requires a session and same origin; rejects forged fields and invalid catalog, roles and invitations', async ({ page, request }) => {
  expect((await request.post('/api/workspaces', { headers, data: input })).status()).toBe(401);
  await signUp(page);
  expect((await page.context().request.post('/api/workspaces', { headers: { Origin: 'https://other.example' }, data: input })).status()).toBe(403);
  expect((await page.context().request.post('/api/workspaces', { data: input })).status()).toBe(403);
  const invalid = [
    { ...input, ownerId: 'forged' }, { ...input, business: { ...input.business, businessName: ' ' } },
    { ...input, services: { ...input.services, services: ['unknown'] } },
    { ...input, services: { ...input.services, serviceRange: 'forged' } },
    ...['owner', 'forged'].map(role => ({ ...input, team: { invitations: [{ ...input.team.invitations[0], role }] } })),
    { ...input, team: { invitations: [{ ...input.team.invitations[0], profile: 'forged' }] } },
    { ...input, team: { invitations: [{ ...input.team.invitations[0], email: owner.email }] } },
    { ...input, team: { invitations: [input.team.invitations[0], { ...input.team.invitations[0], email: ' ALEX@example.com ' }] } },
  ];
  for (const data of invalid) expect((await page.context().request.post('/api/workspaces', { headers, data })).status()).toBe(422);
  expect(await db('workspaces')).toHaveLength(0);
  expect((await db('users').first()).onboardingStatus).toBe('pending');
});
test('concurrent retries return one workspace without overwriting saved selections', async ({ page }) => {
  await signUp(page);
  const requests = await Promise.all(Array.from({ length: 4 }, () => page.context().request.post('/api/workspaces', { headers, data: input })));
  expect(requests.map(response => response.status()).sort()).toEqual([200, 200, 200, 201]);
  const ids = await Promise.all(requests.map(async response => (await response.json()).workspaceId));
  expect(new Set(ids).size).toBe(1);
  expect(await db('workspaces')).toHaveLength(1); expect(await db('workspaceMemberships')).toHaveLength(1);
  expect(await db('workspaceInvitations')).toHaveLength(2); expect(await db('workspaceServices')).toHaveLength(2);
  await page.context().request.post('/api/workspaces', { headers, data: { ...input, business: { ...input.business, businessName: 'Overwrite attempt' } } });
  expect((await db('workspaces').first()).businessName).toBe(input.business.businessName);
});
test('rolls back workspace, membership, services and completion if an invitation insert fails', async ({ page }) => {
  await signUp(page);
  await db.raw(`CREATE FUNCTION test_reject_invitation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test invitation failure'; END $$`);
  await db.raw('CREATE TRIGGER reject_invitation BEFORE INSERT ON "workspaceInvitations" FOR EACH ROW EXECUTE FUNCTION test_reject_invitation()');
  try {
    expect((await page.context().request.post('/api/workspaces', { headers, data: input })).status()).toBe(500);
    for (const table of ['workspaces', 'workspaceMemberships', 'workspaceServices', 'workspaceInvitations']) expect(await db(table)).toHaveLength(0);
    expect((await db('users').first()).onboardingStatus).toBe('pending');
  } finally { await db.raw('DROP TRIGGER IF EXISTS reject_invitation ON "workspaceInvitations"'); await db.raw('DROP FUNCTION IF EXISTS test_reject_invitation()'); }
});
test('saves optional blank area, canonical selections and verified invitation delivery; scopes Home to membership', async ({ page }) => {
  await signUp(page);
  await db('users').where({ email: owner.email }).update({ emailVerified: true });
  const data = { ...input, business: { ...input.business, businessName: '  Northstar Plumbing  ' }, services: { services: ['repairs', 'repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [{ email: ' ALEX@EXAMPLE.COM ', role: 'office' }] } };
  expect((await page.context().request.post('/api/workspaces', { headers, data })).status()).toBe(201);
  expect(await db('workspaceServices')).toHaveLength(1);
  expect(await db('workspaceInvitations').first()).toMatchObject({ email: 'alex@example.com', status: 'sent' });
  await page.goto('/home'); await expect(page.getByRole('main').getByText('Northstar Plumbing', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: /Account options/ }).click();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.context().request.post('/api/auth/sign-up/email', { headers, data: { ...owner, email: 'outsider@example.com' } });
  await page.goto('/home'); await expect(page).toHaveURL(/\/setup$/);
  await expect(page.getByRole('main').getByText('Northstar Plumbing', { exact: true })).toHaveCount(0);
});

for (const width of [1440, 320]) test(`setup and saved workspace fit ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 });
  await signUp(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await fillBusinessAndServices(page);
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `/private/tmp/salesmora-real-review-${width}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Create workspace', exact: true }).click();
  await expect(page).toHaveURL(/\/home$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `/private/tmp/salesmora-workspace-home-${width}.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
