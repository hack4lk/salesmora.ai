import { expect as baseExpect, test } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase, createCaptureDraft, beginCaptureRevision, saveCaptureDraft, readCapturePublicationReview, publishCaptureDraft } from '@salesmora/data';
import type { CaptureDraftConfiguration, PermissionId } from '@salesmora/contracts';
import { verifyCaptureSubmissionContext } from '../src/server/lead-capture/submission-context';
const expect = baseExpect.configure({ timeout: 40000 });
const target = process.env.TEST_DATABASE_URL, origin = process.env.SALESMORA_E2E_ORIGIN ?? '', publicOrigin = process.env.CAPTURE_PUBLIC_ORIGIN ?? '';
if (!target || target === process.env.DATABASE_URL || !new URL(target).pathname.endsWith('_test') || !publicOrigin.startsWith('http://localhost:')) throw Error('Disposable local public-capture environment required.');
const db = createDatabase(target), runtime = new URL(target); runtime.searchParams.set('options', '-c role=salesmora_web'); const web = createDatabase(runtime.toString());
const enabled: PermissionId[] = ['leadCapture.read', 'leadCapture.create', 'leadCapture.update', 'leadCapture.activate'];
const delivery = { websiteReady: async () => true, gmailReady: async () => false };
test.afterAll(async () => { await web.destroy(); await db.destroy(); });
test('public hosts render only approved visitor data, isolate auth and keep submission disabled', async ({ context, page }) => {
  test.setTimeout(360000); context.setDefaultTimeout(40000);
  const headers = { Origin: origin };
  expect((await context.request.post(`${origin}/api/auth/sign-up/email`, { headers, data: { name: 'Private owner', email: `public-${randomUUID()}@example.test`, password: 'Fictional-public-password-42!', termsAccepted: true, plan: 'free' } })).ok()).toBe(true);
  const created = await context.request.post(`${origin}/api/workspaces`, { headers, data: { business: { businessName: 'Private workspace', businessType: 'plumbing' }, services: { services: ['drain-cleaning'], postalCode: '10013', serviceRange: '25-miles' }, team: { invitations: [] } } });
  expect(created.status()).toBe(201); const { workspaceId } = await created.json(); const workspace = await db('workspaces').where({ id: workspaceId }).first();
  const identity = { workspaceId, userId: workspace.ownerId };
  const configuration: CaptureDraftConfiguration = { schemaVersion: 1, type: 'website', brief: 'PRIVATE BRIEF', contactRequired: true, fields: [{ id: 'name', key: 'name', label: 'Visitor name', type: 'short_text', required: true, options: [] }, { id: 'service', key: 'service', label: 'Service requested', type: 'short_text', required: true, options: [] }, { id: 'email', key: 'email', label: 'Visitor email', type: 'email', required: false, options: [] }], workflow: { assignment: { kind: 'default' }, stage: 'new', tags: ['PRIVATE TAG'], notifyAssigned: true }, content: { businessName: 'Public business', title: 'Approved visitor form', intro: 'Please describe the service you need.', submitLabel: 'Send request', thankYou: 'Thanks', unavailableMessage: 'Please call our team.', businessEmail: 'private-business@example.test', businessPhone: '+1 212 555 0100', showBusinessEmail: false, showBusinessPhone: true, privacy: null, consent: null } };
  // Isolated test authority exercises rendering. Production publication remains blocked.
  const draft = await createCaptureDraft(web, identity, enabled, { workspaceId, requestId: randomUUID(), name: 'PRIVATE SOURCE NAME', configuration });
  const review = await readCapturePublicationReview(web, identity, enabled, { workspaceId, sourceId: draft.sourceId }, delivery);
  const approved = await publishCaptureDraft(web, identity, enabled, { workspaceId, sourceId: draft.sourceId, requestId: randomUUID(), confirmed: true, expectedVersion: review.sourceVersion, draftVersion: review.draftVersion, configurationVersion: review.configurationVersion, baseApprovedVersion: review.baseApprovedVersion, timing: { kind: 'now' } }, delivery);
  const publication = await db('capturePublications').where({ sourceId: draft.sourceId }).first();
  const revision = await beginCaptureRevision(web, identity, enabled, { workspaceId, sourceId: draft.sourceId, requestId: randomUUID(), expectedVersion: approved.sourceVersion });
  await saveCaptureDraft(web, identity, enabled, { workspaceId, sourceId: draft.sourceId, requestId: randomUUID(), expectedVersion: revision.sourceVersion, expectedDraftVersion: revision.draftVersion, name: 'PRIVATE DRAFT NAME', configuration: { ...configuration, content: { ...configuration.content!, title: 'PRIVATE DRAFT TITLE' } } });
  const path = `/f/${publication.publicKey}`, url = `${publicOrigin}${path}`;
  const signedIn = await context.request.get(`${origin}/api/auth/get-session`, { headers: { 'X-Forwarded-Host': new URL(publicOrigin).host } }); expect(signedIn.status()).toBe(200); expect((await signedIn.json()).user.id).toBe(identity.userId);
  const cookies = await context.cookies(origin); expect(cookies.some(cookie => cookie.domain === '127.0.0.1' && cookie.httpOnly)).toBe(true);
  for (const forbidden of ['/api/auth/get-session', '/api/settings/leads', '/settings/leads', '/login', '/register', '/e/anything', '/api/public/capture/anything']) {
    const denied = await context.request.get(`${publicOrigin}${forbidden}`, { headers: { 'X-Forwarded-Host': new URL(origin).host }, maxRedirects: 0 }); expect(denied.status()).toBe(404); expect(denied.headers()['set-cookie']).toBeUndefined();
  }
  expect((await context.request.get(`${origin}${path}`)).status()).toBe(404);
  expect((await context.request.post(url, { data: { answers: { name: 'Must not create a lead' } } })).status()).toBe(404);
  const response = await context.request.get(url); expect(response.status()).toBe(200);
  // Next's dev renderer replaces page Cache-Control with no-cache/must-revalidate.
  // The production proxy policy is independently asserted as private/no-store.
  expect(response.headers()['cache-control']).toMatch(/no-store|no-cache/); expect(response.headers()['referrer-policy']).toBe('no-referrer'); expect(response.headers()['content-security-policy']).toContain("frame-ancestors 'none'"); expect(response.headers()['x-frame-options']).toBe('DENY'); expect(response.headers()['set-cookie']).toBeUndefined();
  const html = await response.text(); for (const secret of [workspaceId, identity.userId, draft.sourceId, 'PRIVATE SOURCE NAME', 'PRIVATE DRAFT', 'PRIVATE BRIEF', 'PRIVATE TAG', 'private-business@example.test']) expect(html).not.toContain(secret);
  const nonce = response.headers()['content-security-policy'].match(/'nonce-([^']+)'/)?.[1]; expect(nonce).toBeTruthy(); expect(html).toContain(`nonce="${nonce}"`);
  const token = html.match(/[A-Za-z0-9_-]{100,}\.[A-Za-z0-9_-]{43}/)?.[0]; expect(token).toBeTruthy();
  expect(verifyCaptureSubmissionContext(token!, { publicKey: publication.publicKey, publicationVersion: publication.version, configurationVersion: publication.configurationVersion }, publicOrigin, process.env.CAPTURE_CONTEXT_SECRET!)).not.toBeNull();
  await context.clearCookies(); const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && /Content Security Policy|violates.*directive|Refused to (load|execute|apply|connect|frame)/i.test(message.text())) errors.push(message.text()); });
  await page.goto(url); await expect(page.getByRole('heading', { name: 'Approved visitor form', exact: true })).toBeVisible(); await expect(page.getByRole('textbox', { name: /Visitor name/ })).toBeDisabled(); await expect(page.getByRole('button', { name: 'Send request', exact: true })).toBeDisabled();
  await expect(page.getByText('Online requests are not available yet. Please contact the business directly.', { exact: true })).toBeVisible(); await page.screenshot({ path: '/private/tmp/capture-4c-hosted.png', fullPage: true });
  await page.setViewportSize({ width: 320, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await page.screenshot({ path: '/private/tmp/capture-4c-hosted-mobile.png', fullPage: true });
  const embeddedURL = `${publicOrigin}/embed/${publication.publicKey}`; const embed = await context.request.get(embeddedURL); expect(embed.headers()['content-security-policy']).toContain('frame-ancestors https: http:'); expect(embed.headers()['x-frame-options']).toBeUndefined();
  await page.goto(`${origin}/register`); await page.setContent(`<iframe title="Service form" src="${embeddedURL}" style="width:100%;height:850px;border:0"></iframe>`);
  await expect(page.frameLocator('iframe').getByRole('heading', { name: 'Approved visitor form', exact: true })).toBeVisible(); await expect(page.frameLocator('iframe').getByRole('button', { name: 'Send request', exact: true })).toBeDisabled();
  await db('captureSources').where({ id: draft.sourceId }).update({ status: 'paused' }); await page.goto(url); await expect(page.getByText('Please call our team.', { exact: true })).toBeVisible(); await expect(page.getByRole('textbox')).toHaveCount(0);
  expect((await context.request.get(`${publicOrigin}/f/${'b'.repeat(64)}`)).status()).toBe(404);
  expect((await db('captureReceipts').where({ workspaceId })).length).toBe(0); expect((await db('leads').where({ workspaceId })).length).toBe(0); expect(errors).toEqual([]);
});
