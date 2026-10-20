import { parseArticle } from '@salesmora/data/knowledge-ingestion';
import { expect, test, type APIRequestContext } from '@playwright/test';
import { createDatabase, ingestArticle } from '@salesmora/data';
const url = process.env.TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith('_test') || url === process.env.DATABASE_URL) throw Error('Help tests require the isolated test database');
const db = createDatabase(url);
const headers = { Origin: 'http://127.0.0.1:3002' };
const fixture = parseArticle({ slug: 'e2e-protected-help', title: 'Fictional protected help', roles: ['owner', 'admin', 'office', 'field'], capabilities: ['leads.create'], plans: ['free'], productStatus: 'implemented' }, '# Fictional protected help\n\n## Safe section\n<script>alert("fictional")</script> is plain reference text.');
const href = (workspace: string, version = fixture.version) => `/help/${fixture.slug}?workspace=${workspace}&version=${version}#safe-section`;
async function account(api: APIRequestContext, email: string) {
  expect((await api.post('/api/auth/sign-up/email', { headers, data: { name: 'Fictional help tester', email, password: 'Fictional-help-password-42!', termsAccepted: true } })).status()).toBe(200);
  return (await db('users').where({ email }).first()).id as string;
}
async function workspace(api: APIRequestContext) {
  const response = await api.post('/api/workspaces', { headers, data: { business: { businessName: 'Fictional help workspace', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } } });
  expect(response.status()).toBe(201); return (await response.json()).workspaceId as string;
}
test.beforeEach(async () => {
  await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE');
  await ingestArticle(db, fixture, { model: 'test-only-viewer-fixture', dimensions: 3, embed: async () => [[1, 0, 0]] });
});
test.afterAll(async () => {
  await db('helpHeads').where({ slug: fixture.slug }).delete();
  await db('helpArticles').where({ slug: fixture.slug }).delete();
  await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE'); await db.destroy();
});
test('citation opens the current help section, escapes content and preserves the workspace link', async ({ page }) => {
  const api = page.context().request; await account(api, 'help-owner@example.test'); const id = await workspace(api);
  const errors: string[] = []; page.on('dialog', () => errors.push('Untrusted HTML executed'));
  await page.goto(href(id));
  await expect(page.getByRole('heading', { level: 1, name: fixture.title })).toBeVisible();
  await expect(page.getByText('<script>alert("fictional")</script> is plain reference text.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to workspace' })).toHaveAttribute('href', `/home?workspace=${id}`);
  expect(errors).toEqual([]);
  expect((await api.get(href(id, '0'.repeat(64)))).status()).toBe(404);
  expect((await api.get(`/help/${fixture.slug}?workspace=${'-'.repeat(36)}&version=${fixture.version}`)).status()).toBe(404);
});
test('denies another workspace, Field capability bypass and revoked membership', async ({ page, request }) => {
  const api = page.context().request; await account(api, 'help-owner@example.test'); const id = await workspace(api);
  const field = await account(request, 'help-field@example.test');
  const other = await workspace(request);
  expect((await api.get(href(other))).status()).toBe(404);
  await db('workspaceMemberships').insert({ workspaceId: id, userId: field, role: 'field' });
  expect((await request.get(href(id))).status()).toBe(404);
  await db('workspaceMemberships').where({ workspaceId: id, userId: field }).update({ role: 'office' });
  expect((await request.get(href(id))).status()).toBe(200);
  await db('workspaceMemberships').where({ workspaceId: id, userId: field }).delete();
  expect((await request.get(href(id))).status()).toBe(404);
});
test('does not expose draft, retired or planned help and redirects signed-out viewers', async ({ page, request }) => {
  const api = page.context().request; await account(api, 'help-owner@example.test'); const id = await workspace(api);
  expect((await request.get(href(id), { maxRedirects: 0 })).status()).toBe(307);
  for (const state of ['draft', 'retired']) {
    await db('helpArticles').where({ slug: fixture.slug }).update({ state });
    expect((await api.get(href(id))).status()).toBe(404);
  }
  await db('helpArticles').where({ slug: fixture.slug }).update({ state: 'published', productStatus: 'planned' });
  expect((await api.get(href(id))).status()).toBe(404);
});
