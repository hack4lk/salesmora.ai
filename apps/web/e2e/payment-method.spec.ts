import { expect, test, type APIRequestContext, type Frame } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase, stripeSandbox, reconcileWorkspaceCards, processAccountDeletions } from '@salesmora/data';
const url = process.env.TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith('_test') || url === process.env.DATABASE_URL) throw Error('Isolated test database required');
test.skip(process.env.SALESMORA_BILLING_TEST !== '1', 'Requires explicit sandbox billing opt-in');
if (process.env.SALESMORA_BILLING_TEST === '1') process.env.BILLING_SANDBOX_ENABLED = 'true';
const db = createDatabase(url), stripe = process.env.SALESMORA_BILLING_TEST === '1' ? stripeSandbox() : null;
const headers = { Origin: 'http://127.0.0.1:3002' };
async function account(api: APIRequestContext, role: string) {
  const email = `card-${role}-${randomUUID()}@example.test`;
  expect((await api.post('/api/auth/sign-up/email', { headers, data: { name: 'Fictional card check', email, password: 'Fictional-card-test-42!', termsAccepted: true } })).status()).toBe(200);
  return (await db('users').where({ email }).first()).id as string;
}
test.afterAll(async () => { await db.destroy(); });
test('Owner updates both renewal defaults using embedded card fields without a charge; scope, replay and partial recovery are enforced', async ({page,browser}) => {
  if (!stripe) throw Error('Sandbox provider required');
  test.setTimeout(120000); page.setDefaultTimeout(15000);
  await db('rateLimits').delete();
  const api=page.context().request, ownerId=await account(api,'owner');
  const created=await api.post('/api/workspaces',{headers,data:{business:{businessName:'Fictional Card Workspace',businessType:'plumbing'},services:{services:['repairs'],postalCode:'10013',serviceRange:'25-miles'},team:{invitations:[]}}});
  expect(created.status()).toBe(201); const workspaceId=(await created.json()).workspaceId;
  const admin=await browser.newContext();let customerId:string|undefined;let subscriptionId:string|undefined;
  try {
    const adminId=await account(admin.request,'admin');await db('workspaceMemberships').insert({workspaceId,userId:adminId,role:'admin'});
    const customer=await stripe.customers.create({metadata:{workspaceId}});customerId=customer.id;
    const old=await stripe.paymentMethods.attach('pm_card_visa',{customer:customer.id});
    await stripe.customers.update(customer.id,{invoice_settings:{default_payment_method:old.id}});
    const sub=await stripe.subscriptions.create({customer:customer.id,items:[{price:process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID!}],metadata:{workspaceId}});subscriptionId=sub.id;
    await db('workspaceSubscriptions').where({workspaceId}).update({customerId:customer.id,subscriptionId:sub.id,plan:'standard',intendedPlan:'standard',status:'active',paidThrough:new Date(sub.items.data[0].current_period_end*1000)});
    const invoicesBefore=(await stripe.invoices.list({customer:customer.id})).data.length;
    const prepare={workspaceId,action:'prepare'};
    expect((await admin.request.post('/api/billing/payment-method',{headers,data:prepare})).status()).toBe(403);
    expect((await api.post('/api/billing/payment-method',{headers:{Origin:'https://other.test'},data:prepare})).status()).toBe(403);
    expect((await api.post('/api/billing/payment-method',{headers,data:{...prepare,workspaceId:randomUUID()}})).status()).toBe(403);
    expect((await api.post('/api/billing/payment-method',{headers,data:{...prepare,customerId:'cus_other'}})).status()).toBe(400);
    const first=await api.post('/api/billing/payment-method',{headers,data:prepare});expect(first.status()).toBe(200);expect(first.headers()['cache-control']).toBe('no-store');
    const attempt=await first.json();
    const repeated=await (await api.post('/api/billing/payment-method',{headers,data:prepare})).json();expect(repeated.attemptId).toBe(attempt.attemptId);
    const save={workspaceId,action:'save',attemptId:attempt.attemptId,consent:true};
    expect((await api.post('/api/billing/payment-method',{headers,data:{...save,consent:false}})).status()).toBe(400);
    expect((await api.post('/api/billing/payment-method',{headers,data:save})).status()).toBe(409);
    const setup=await db('billingPaymentMethods').where({id:attempt.attemptId}).first();
    await stripe.setupIntents.confirm(setup.setupIntentId,{payment_method:'pm_card_mastercard'});
    // Simulate a process dying after customer default changed but before subscription default and DB completion.
    const verified=await stripe.setupIntents.retrieve(setup.setupIntentId);const newMethod=typeof verified.payment_method==='string'?verified.payment_method:verified.payment_method!.id;
    await db('billingPaymentMethods').where({id:attempt.attemptId}).update({state:'applying',paymentMethodId:newMethod,consentedAt:new Date()});
    await stripe.customers.update(customer.id,{invoice_settings:{default_payment_method:newMethod}});
    await Promise.all([reconcileWorkspaceCards(db),reconcileWorkspaceCards(db)]);
    expect((await db('billingPaymentMethods').where({id:attempt.attemptId}).first()).state).toBe('complete');
    expect((await stripe.subscriptions.retrieve(sub.id)).default_payment_method).toBe(newMethod);
    expect((await db('billingAudit').where({workspaceId,action:'payment_method.updated'}).count<{count:string}[]>('* as count'))[0].count).toBe('1');
    expect((await api.post('/api/billing/payment-method',{headers,data:save})).status()).toBe(200);
    // A second update exercises the actual embedded Stripe form and authorized finalization.
    await page.goto(`/settings/billing?workspace=${workspaceId}`);
    await page.setViewportSize({width:390,height:1000});
    await page.getByRole('button',{name:'Manage payment details'}).click();
    const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
    let cardFrame: Frame | undefined;
    await expect.poll(async()=>{
      for (const frame of page.frames()) if (await frame.locator('input[name="number"]').count()) { cardFrame=frame; return true; }
      return false;
    }).toBe(true);
    if(!cardFrame)throw Error('Secure card input missing');
    await cardFrame.locator('input[name="number"]').fill('4242424242424242');
    await cardFrame.locator('input[name="expiry"]').fill('1230');
    await cardFrame.locator('input[name="cvc"]').fill('123');
    const country=cardFrame.locator('select[name="country"]');if(await country.count())await country.selectOption('US');
    const zip=cardFrame.locator('input[name="postalCode"]');if(await zip.count())await zip.fill('10013');
    await dialog.getByRole('checkbox',{name:'Use this card for future subscription renewals.'}).check();
    await dialog.getByRole('button',{name:'Save renewal card'}).click();
    await expect(dialog.getByRole('status')).toContainText('Your new card will be used',{timeout:45000});
    await expect(dialog.getByText('visa · 4242',{exact:true})).toBeVisible();
    const after=await stripe.subscriptions.retrieve(sub.id);const afterCustomer=await stripe.customers.retrieve(customer.id);
    expect(afterCustomer.deleted).not.toBe(true);if(afterCustomer.deleted)throw Error('Unexpected customer deletion');
    expect(after.default_payment_method).toBe(afterCustomer.invoice_settings.default_payment_method);
    expect(after.items.data[0].current_period_end).toBe(sub.items.data[0].current_period_end);
    expect((await stripe.invoices.list({customer:customer.id})).data.length).toBe(invoicesBefore);
    // Replaying the older completed update must not restore its old card.
    expect((await api.post('/api/billing/payment-method',{headers,data:save})).status()).toBe(200);
    expect((await stripe.subscriptions.retrieve(sub.id)).default_payment_method).toBe(after.default_payment_method);
    expect(new URL(page.url()).origin).toBe(headers.Origin);
    expect((await db('users').where({id:ownerId}).first()).deletionRequestedAt).toBeNull();
    await dialog.getByRole('button',{name:'Done',exact:true}).click();
    const pending=await (await api.post('/api/billing/payment-method',{headers,data:prepare})).json();
    const pendingRow=await db('billingPaymentMethods').where({id:pending.attemptId}).first();
    expect((await api.post('/api/account/delete',{headers,data:{workspaceId,password:'Fictional-card-test-42!',confirmation:'Fictional Card Workspace',acknowledged:true}})).status()).toBe(202);
    expect((await api.post('/api/billing/payment-method',{headers,data:{...save,attemptId:pending.attemptId}})).status()).toBe(401);
    await processAccountDeletions(db);
    expect((await stripe.setupIntents.retrieve(pendingRow.setupIntentId)).status).toBe('canceled');
    expect((await stripe.subscriptions.retrieve(sub.id)).status).toBe('canceled');
    expect(await db('billingPaymentMethods').where({workspaceId}).first()).toBeUndefined();
    expect((await db('accountDeletionRequests').where({userId:ownerId}).first()).state).toBe('completed');
  } finally {
    if(subscriptionId && (await stripe.subscriptions.retrieve(subscriptionId)).status!=='canceled')await stripe.subscriptions.cancel(subscriptionId,{invoice_now:false,prorate:false});
    if(customerId)await stripe.customers.del(customerId);
    await api.post('/api/auth/sign-out',{headers,data:{}});await admin.request.post('/api/auth/sign-out',{headers,data:{}});await admin.close();
  }
});
