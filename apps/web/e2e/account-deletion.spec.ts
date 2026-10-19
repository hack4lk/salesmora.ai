import { expect, test, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase, processAccountDeletions, loadWorkspaceAuthorization, stripeSandbox } from '@salesmora/data';

const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL) throw Error('Deletion checks require the isolated test database.');
const db = createDatabase(connection);
if (process.env.SALESMORA_BILLING_TEST === '1') process.env.BILLING_SANDBOX_ENABLED = 'true';
const origin = 'http://127.0.0.1:3002';
const headers = { Origin: origin };
const password = 'Fictional-deletion-password-42!';
async function account(api: APIRequestContext, label: string) {
  const email = `delete-${label}-${randomUUID()}@example.test`;
  expect((await api.post('/api/auth/sign-up/email', { headers, data: { name: label, email, password, termsAccepted: true } })).status()).toBe(200);
  return { email, id: (await db('users').where({ email }).first()).id as string };
}
async function createWorkspace(api: APIRequestContext) {
  const response = await api.post('/api/workspaces', { headers, data: { business: { businessName: 'Fictional Deletion Workspace', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '10013', serviceRange: '25-miles' }, team: { invitations: [] } } });
  expect(response.status()).toBe(201); return (await response.json()).workspaceId as string;
}
async function conversation(workspaceId: string, userId: string) {
  const threadId = randomUUID(), turnId = randomUUID();
  await db('chatThreads').insert({ id: threadId, workspaceId, userId });
  await db('chatTurns').insert({ id: turnId, threadId, workspaceId, userId, clientTurnId: randomUUID(), requestHash: 'fictional', surfaceKey: 'home', state: 'running', leaseUntil: new Date(Date.now() + 60000) });
  await db('chatMessages').insert({ id: randomUUID(), turnId, role: 'user', text: 'Fictional deletion transcript' });
  await db('checkpoints').insert({ thread_id: turnId, checkpoint_ns: '', checkpoint_id: randomUUID(), checkpoint: JSON.stringify({ fictional: true }), metadata: '{}' });
  return { threadId, turnId };
}
test.afterAll(async () => { await db.destroy(); });

test('password-confirmed member and Owner deletion revoke access, preserve shared records, and retry provider cancellation before purge', async ({ page, browser }) => {
  test.setTimeout(120000);
  await db('rateLimits').delete();
  page.setDefaultNavigationTimeout(30000);
  page.setDefaultTimeout(10000);
  const api = page.context().request;
  const owner = await account(api, 'owner');
  const workspaceId = await createWorkspace(api);
  const memberContext = await browser.newContext(), adminContext = await browser.newContext();
  let providerSubscription: string | undefined;
  let providerCustomer: string | undefined;
  const stripe = process.env.SALESMORA_BILLING_TEST === '1' ? stripeSandbox({ ...process.env, BILLING_SANDBOX_ENABLED: 'true' }) : null;
  try {
    const member = await account(memberContext.request, 'field');
    const admin = await account(adminContext.request, 'admin');
    await db('workspaceMemberships').insert([{ workspaceId, userId: member.id, role: 'field' }, { workspaceId, userId: admin.id, role: 'admin' }]);
    const otherWorkspaceId = await createWorkspace(adminContext.request);
    await db('workspaceMemberships').insert({ workspaceId: otherWorkspaceId, userId: owner.id, role: 'office' });
    const otherLeadId = randomUUID();
    await db('leads').insert({ id: otherLeadId, workspaceId: otherWorkspaceId, createdBy: owner.id, ownerId: owner.id, submissionId: randomUUID(), submissionHash: 'fictional', name: 'Fictional other workspace lead', email: '', phone: '', service: 'Repair', address: '', details: '', notes: '', source: 'other', stage: 'new' });
    const personalBody = { workspaceId, password, confirmation: admin.email, acknowledged: true };
    expect((await adminContext.request.post('/api/account/delete', { headers, data: personalBody })).status()).toBe(409);
    expect((await api.post('/api/account/delete', { headers, data: { ...personalBody, workspaceId: otherWorkspaceId, confirmation: owner.email } })).status()).toBe(409);
    const secondOwner = await browser.newContext();
    expect((await secondOwner.request.post('/api/auth/sign-in/email', { headers, data: { email: owner.email, password } })).ok()).toBe(true);
    expect((await db('sessions').where({ userId: owner.id }).count<{count:string}[]>('* as count'))[0].count).toBe('2');
    await secondOwner.close();
    const signedOut = await browser.newContext();
    expect((await signedOut.request.post('/api/account/delete', { headers, data: personalBody })).status()).toBe(401);
    await signedOut.close();
    const leadId = randomUUID();
    await db('leads').insert({ id: leadId, workspaceId, createdBy: member.id, ownerId: member.id, submissionId: randomUUID(), submissionHash: 'fictional', name: 'Fictional retained lead', email: '', phone: '', service: 'Repair', address: '', details: '', notes: '', source: 'other', stage: 'new' });
    const memberChat = await conversation(workspaceId, member.id);
    const memberBody = { workspaceId, password, confirmation: member.email, acknowledged: true };
    expect((await memberContext.request.post('/api/account/delete', { headers, data: { ...memberBody, confirmation: 'Fictional Deletion Workspace' } })).status()).toBe(409);
    expect((await memberContext.request.post('/api/account/delete', { headers, data: { ...memberBody, workspaceId: randomUUID() } })).status()).toBe(403);
    expect((await memberContext.request.post('/api/account/delete', { headers, data: memberBody })).status()).toBe(202);
    expect((await memberContext.request.post('/api/account/delete', { headers, data: memberBody })).status()).toBe(401);
    await expect(loadWorkspaceAuthorization(db, { workspaceId, userId: member.id }, ['home.access'])).rejects.toThrow('Access denied');
    console.log('deletion-check: member_purge_start');
    await processAccountDeletions(db);
    expect(await db('users').where({ id: member.id }).first()).toBeUndefined();
    expect(await db('workspaces').where({ id: workspaceId }).first()).toBeTruthy();
    expect((await db('leads').where({ id: leadId }).first()).ownerId).toBeNull();
    expect(await db('chatThreads').where({ id: memberChat.threadId }).first()).toBeUndefined();
    expect(await db('checkpoints').where({ thread_id: memberChat.turnId }).first()).toBeUndefined();

    console.log('deletion-check: member_purge_verified');
    const ownerChat = await conversation(workspaceId, owner.id);
    console.log('deletion-check: owner_page_start');
    await page.goto(`/settings/account?workspace=${workspaceId}`);
    console.log('deletion-check: owner_dialog');
    await page.getByRole('button', { name: 'Delete workspace and account', exact: true }).click();
    await page.getByRole('button', { name: 'Keep my account', exact: true }).click();
    expect(await db('accountDeletionRequests').where({ userId: owner.id }).first()).toBeUndefined();
    const ownerBody = { workspaceId, password, confirmation: 'Fictional Deletion Workspace', acknowledged: true };
    expect((await api.post('/api/account/delete', { headers: { Origin: 'https://other.test' }, data: ownerBody })).status()).toBe(403);
    expect((await api.post('/api/account/delete', { headers, data: { ...ownerBody, role: 'owner' } })).status()).toBe(400);
    expect((await api.post('/api/account/delete', { headers, data: { ...ownerBody, password: 'wrong-password' } })).status()).toBe(409);
    expect(await db('accountDeletionRequests').where({ userId: owner.id }).first()).toBeUndefined();
    console.log('deletion-check: stripe_setup');
    if (stripe) {
      const customer = await stripe.customers.create({ metadata: { workspaceId } }); providerCustomer = customer.id;
      const method = await stripe.paymentMethods.attach('pm_card_visa', { customer: customer.id });
      await stripe.customers.update(customer.id, { invoice_settings: { default_payment_method: method.id } });
      const sub = await stripe.subscriptions.create({ customer: customer.id, items: [{ price: process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID! }], metadata: { workspaceId } }); providerSubscription = sub.id;
      expect(sub.status).toBe('active');
      await stripe.subscriptionSchedules.create({ from_subscription: sub.id });
      await stripe.checkout.sessions.create({ customer: customer.id, mode: 'subscription', ui_mode: 'embedded_page', redirect_on_completion: 'never', allowed_payment_method_types: ['card'], line_items: [{ price: process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID!, quantity: 1 }], metadata: { workspaceId }, client_reference_id: workspaceId, subscription_data: { metadata: { workspaceId } } });
      await db('workspaceSubscriptions').where({ workspaceId }).update({ customerId: customer.id, subscriptionId: sub.id, plan: 'standard' });
    } else {
      // A fake mapping forces a provider failure without any network or live billing.
      await db('workspaceSubscriptions').insert({ workspaceId, catalogVersion: '2026-10-13-v1', customerId: 'cus_fictional_retry', subscriptionId: 'sub_fictional_retry' }).onConflict('workspaceId').merge({ customerId: 'cus_fictional_retry', subscriptionId: 'sub_fictional_retry' });
    }
    console.log('deletion-check: owner_dialog');
    await page.getByRole('button', { name: 'Delete workspace and account', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.locator('input[type="password"]').fill(password);
    await dialog.getByLabel('Type the workspace name').fill('Fictional Deletion Workspace');
    await dialog.getByRole('checkbox').check();
    await dialog.getByRole('button', { name: 'Delete workspace and account permanently', exact: true }).click();
    await expect(page).toHaveURL(`${origin}/login?accountDeletion=requested`);
    await expect(page.getByRole('status')).toContainText('Your deletion request was accepted and you have been signed out.');
    await expect(page.getByRole('heading', { name: 'Account', exact: true })).toHaveCount(0);
    expect(await db('sessions').where({ userId: owner.id }).first()).toBeUndefined();
    expect((await db('chatTurns').where({ id: ownerChat.turnId }).first()).state).toBe('cancelled');
    await expect(loadWorkspaceAuthorization(db, { workspaceId, userId: admin.id }, ['home.access'])).rejects.toThrow('Access denied');
    await adminContext.request.get(`/home?workspace=${workspaceId}`);
    expect((await api.post('/api/auth/sign-in/email', { headers, data: { email: owner.email, password } })).ok()).toBe(false);
    console.log('deletion-check: outage_retry');
    await processAccountDeletions(db, () => { throw Error('fictional provider outage'); });
    const pending = await db('accountDeletionRequests').where({ userId: owner.id }).first();
    expect(pending.state).toBe('pending'); expect(pending.lastError).toBe('retry_required');
    expect(await db('workspaces').where({ id: workspaceId }).first()).toBeTruthy();
    await db('accountDeletionRequests').where({ id: pending.id }).update({ retryAt: new Date() });
    if (!stripe) await db('workspaceSubscriptions').where({ workspaceId }).update({ customerId: null, subscriptionId: null });
    await Promise.all([processAccountDeletions(db), processAccountDeletions(db)]);
    expect((await db('accountDeletionRequests').where({ id: pending.id }).first()).state).toBe('completed');
    expect(await db('workspaces').where({ id: workspaceId }).first()).toBeUndefined();
    expect(await db('users').where({ id: owner.id }).first()).toBeUndefined();
    expect(await db('users').where({ id: admin.id }).first()).toBeTruthy();
    expect(await db('workspaces').where({ id: otherWorkspaceId }).first()).toBeTruthy();
    expect((await db('leads').where({ id: otherLeadId }).first()).ownerId).toBeNull();
    expect(await db('leads').where({ id: leadId }).first()).toBeUndefined();
    expect(await db('checkpoints').where({ thread_id: ownerChat.turnId }).first()).toBeUndefined();
    expect(await db('authorizationAudit').where({ workspaceId }).first()).toBeTruthy();
    expect(await db('billingAudit').where({ workspaceId, action: 'workspace.deletion_completed' }).first()).toBeTruthy();
    if (stripe && providerSubscription && providerCustomer) {
      expect((await stripe.subscriptions.retrieve(providerSubscription)).status).toBe('canceled');
      expect((await stripe.checkout.sessions.list({ customer: providerCustomer, status: 'open' })).data).toHaveLength(0);
    }
    expect((await adminContext.request.post('/api/account/delete', { headers, data: { workspaceId: otherWorkspaceId, password, confirmation: 'Fictional Deletion Workspace', acknowledged: true } })).status()).toBe(202);
    await processAccountDeletions(db);
  } finally {
    if (stripe && providerCustomer) {
      for await (const sub of stripe.subscriptions.list({ customer: providerCustomer, status: 'all' })) {
        if (sub.schedule) await stripe.subscriptionSchedules.cancel(typeof sub.schedule === 'string' ? sub.schedule : sub.schedule.id, { invoice_now: false, prorate: false }).catch(() => {});
        if (!['canceled', 'incomplete_expired'].includes(sub.status)) await stripe.subscriptions.cancel(sub.id, { invoice_now: false, prorate: false }).catch(() => {});
      }
      await stripe.customers.del(providerCustomer);
    }
    await adminContext.request.post('/api/auth/sign-out', { headers, data: {} });
    await api.post('/api/auth/sign-out', { headers, data: {} });
    await memberContext.close(); await adminContext.close();
  }
});
