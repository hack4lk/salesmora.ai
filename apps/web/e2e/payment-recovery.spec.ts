import {expect,test} from '@playwright/test';
import {randomUUID} from 'node:crypto';
import {createDatabase,stripeSandbox,reconcileRenewalRecoveries,processAccountDeletions} from '@salesmora/data';

test.skip(process.env.SALESMORA_BILLING_TEST!=='1','Requires explicit sandbox billing opt-in');
const url=process.env.TEST_DATABASE_URL;
if(!url||!new URL(url).pathname.endsWith('_test')||url===process.env.DATABASE_URL)throw Error('Isolated test database required');
const db=createDatabase(url);
const headers={Origin:'http://127.0.0.1:3002'};
test.afterAll(async()=>{await db.destroy();});

test('Renewal recovery requires Owner consent, rechecks the quote, and pays only once without changing the renewal date',async({page,browser})=>{
  test.setTimeout(240000);
  process.env.BILLING_SANDBOX_ENABLED='true';
  const stripe=stripeSandbox(),api=page.context().request;
  await db('rateLimits').delete();
  const email=`renewal-${randomUUID()}@example.test`;
  expect((await api.post('/api/auth/sign-up/email',{headers,data:{name:'Fictional Renewal Owner',email,password:'Fictional-renewal-42!',termsAccepted:true}})).status()).toBe(200);
  const user=await db('users').where({email}).first();
  const created=await api.post('/api/workspaces',{headers,data:{business:{businessName:'Fictional Renewal Workspace',businessType:'plumbing'},services:{services:['repairs'],postalCode:'10013',serviceRange:'25-miles'},team:{invitations:[]}}});
  expect(created.status()).toBe(201);const workspaceId=(await created.json()).workspaceId;
  const clock=await stripe.testHelpers.testClocks.create({frozen_time:Math.floor(Date.now()/1000),name:'SalesMora isolated renewal test'});
  const customer=await stripe.customers.create({test_clock:clock.id,metadata:{workspaceId}});
  const admin=await browser.newContext();
  let subscriptionId:string|undefined;
  try{
    const adminEmail=`renewal-admin-${randomUUID()}@example.test`;
    expect((await admin.request.post('/api/auth/sign-up/email',{headers,data:{name:'Fictional Renewal Admin',email:adminEmail,password:'Fictional-renewal-42!',termsAccepted:true}})).status()).toBe(200);
    const adminUser=await db('users').where({email:adminEmail}).first();
    await db('workspaceMemberships').insert({workspaceId,userId:adminUser.id,role:'admin'});
    const card=await stripe.paymentMethods.attach('pm_card_visa',{customer:customer.id});
    await stripe.customers.update(customer.id,{invoice_settings:{default_payment_method:card.id}});
    const sub=await stripe.subscriptions.create({customer:customer.id,items:[{price:process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID!}],metadata:{workspaceId}});subscriptionId=sub.id;
    const declined=await stripe.paymentMethods.attach('pm_card_chargeCustomerFail',{customer:customer.id});
    await stripe.subscriptions.update(sub.id,{default_payment_method:declined.id});
    await stripe.testHelpers.testClocks.advance(clock.id,{frozen_time:sub.items.data[0].current_period_end+3600});
    await expect.poll(async()=>(await stripe.testHelpers.testClocks.retrieve(clock.id)).status,{timeout:60000,intervals:[1000,2000,4000]}).toBe('ready');
    // Finalize the renewal if the clock left it in its automatic-advance grace period.
    let renewed=await stripe.subscriptions.retrieve(sub.id);
    let invoice=await stripe.invoices.retrieve(typeof renewed.latest_invoice==='string'?renewed.latest_invoice:renewed.latest_invoice!.id);
    expect(invoice.billing_reason).toBe('subscription_cycle');
    if(invoice.status==='draft')invoice=await stripe.invoices.finalizeInvoice(invoice.id);
    if(invoice.status==='open'&&invoice.attempt_count===0){try{await stripe.invoices.pay(invoice.id);}catch{/* Expected fixture decline. */}}
    renewed=await stripe.subscriptions.retrieve(sub.id);
    invoice=await stripe.invoices.retrieve(invoice.id);
    expect(invoice.status).toBe('open');
    const renewalDate=renewed.items.data[0].current_period_end;
    await db('workspaceSubscriptions').where({workspaceId}).update({customerId:customer.id,subscriptionId:sub.id,plan:'standard',intendedPlan:'standard',status:'past_due',paidThrough:new Date(),recoveryUntil:new Date(Date.now()+86400000)});
    const before=invoice.attempt_count;
    const usageId=randomUUID();
    await db('aiUsageCalls').insert({id:usageId,workspaceId,userId:user.id,model:'fictional-test',phase:'answer',outcome:'completed',inputTokens:100,outputTokens:25,totalTokens:125,cachedInputTokens:0,reasoningTokens:0});
    const payload={workspaceId,action:'preview'};
    expect((await admin.request.post('/api/billing/recovery',{headers,data:payload})).status()).toBe(403);
    expect((await api.post('/api/billing/recovery',{headers:{Origin:'https://other.test'},data:payload})).status()).toBe(403);
    expect((await api.post('/api/billing/recovery',{headers,data:{...payload,workspaceId:randomUUID()}})).status()).toBe(403);
    expect((await api.post('/api/billing/recovery',{headers,data:{...payload,amountDue:1}})).status()).toBe(400);
    const preview=await api.post('/api/billing/recovery',{headers,data:payload});expect(preview.status()).toBe(200);expect(preview.headers()['cache-control']).toBe('no-store');
    const quote=await preview.json();expect(quote.status).toBe('review');expect(quote.invoice.amountDue).toBe(2900);
    expect((await stripe.invoices.retrieve(invoice.id)).attempt_count).toBe(before);
    const failure=await api.post('/api/billing/recovery',{headers,data:{workspaceId,action:'confirm',quoteId:quote.quoteId}});expect(failure.status()).toBe(200);
    const failed=await failure.json();expect(failed.status).toBe('declined');
    await stripe.subscriptions.update(sub.id,{default_payment_method:card.id});
    const stale=await api.post('/api/billing/recovery',{headers,data:{workspaceId,action:'confirm',quoteId:failed.quoteId}});expect((await stale.json()).status).toBe('changed');
    expect((await stripe.invoices.retrieve(invoice.id)).status).toBe('open');
    // Exercise the actual Billing callout and connected dialog on a narrow screen.
    await page.setViewportSize({width:390,height:1000});
    await page.goto(`/settings/billing?workspace=${workspaceId}`);
    await page.getByRole('button',{name:'Resolve overdue payment'}).click();
    const dialog=page.getByRole('dialog');
    await expect(dialog.getByRole('button',{name:'Pay $29.00 now',exact:true})).toBeEnabled();
    const count=(await stripe.invoices.list({customer:customer.id})).data.length;
    const [confirmation]=await Promise.all([
      page.waitForRequest(request=>request.url().endsWith('/api/billing/recovery')&&request.method()==='POST'&&request.postDataJSON()?.action==='confirm'),
      dialog.getByRole('button',{name:'Pay $29.00 now',exact:true}).click(),
    ]);
    const latest={id:confirmation.postDataJSON().quoteId as string};
    // Concurrent/replayed requests share the exact durable payment attempt.
    const duplicate=await api.post('/api/billing/recovery',{headers,data:{workspaceId,action:'confirm',quoteId:latest.id}});
    expect(duplicate.status()).toBe(200);
    // A lost/late provider response is intentionally non-payable until an explicit status refresh.
    await expect.poll(async()=>(await stripe.invoices.retrieve(invoice.id)).status,{timeout:45000}).toBe('paid');
    const refreshStatus=dialog.getByRole('button',{name:'Refresh payment status',exact:true});
    await expect.poll(async()=>await refreshStatus.isVisible()||await dialog.getByRole('heading',{name:'Payment received',exact:true}).isVisible(),{timeout:45000}).toBe(true);
    if(await refreshStatus.isVisible()){
      await expect(dialog.getByRole('button',{name:'Pay $29.00 now',exact:true})).toHaveCount(0);
      await refreshStatus.click();
    }
    await expect(dialog.getByRole('heading',{name:'Payment received',exact:true})).toBeVisible({timeout:45000});
    expect((await stripe.invoices.retrieve(invoice.id)).status).toBe('paid');
    expect((await stripe.invoices.list({customer:customer.id})).data.length).toBe(count);
    expect((await stripe.subscriptions.retrieve(sub.id)).items.data[0].current_period_end).toBe(renewalDate);
    const afterAttempts=(await stripe.invoices.retrieve(invoice.id)).attempt_count;
    await reconcileRenewalRecoveries(db);
    const replay=await api.post('/api/billing/recovery',{headers,data:{workspaceId,action:'confirm',quoteId:latest.id}});expect((await replay.json()).status).toBe('paid');
    expect((await stripe.invoices.retrieve(invoice.id)).attempt_count).toBe(afterAttempts);
    expect((await db('workspaceSubscriptions').where({workspaceId}).first()).status).toBe('active');
    expect(Number((await db('aiUsageCalls').where({id:usageId}).first()).totalTokens)).toBe(125);
    expect(new URL(page.url()).origin).toBe(headers.Origin);
    expect(user.id).toBeTruthy();
    await dialog.getByRole('button',{name:'Done',exact:true}).click();
    // A later renewal needs bank authentication. It must remain tied to this invoice,
    // and deletion must invalidate the outstanding challenge before removing access.
    const authCard=await stripe.paymentMethods.attach('pm_card_authenticationRequired',{customer:customer.id});
    await stripe.subscriptions.update(sub.id,{default_payment_method:authCard.id});
    await stripe.testHelpers.testClocks.advance(clock.id,{frozen_time:renewalDate+3600});
    await expect.poll(async()=>(await stripe.testHelpers.testClocks.retrieve(clock.id)).status,{timeout:60000,intervals:[1000,2000,4000]}).toBe('ready');
    const later=await stripe.subscriptions.retrieve(sub.id);
    let authInvoice=await stripe.invoices.retrieve(typeof later.latest_invoice==='string'?later.latest_invoice:later.latest_invoice!.id);
    if(authInvoice.status==='draft')authInvoice=await stripe.invoices.finalizeInvoice(authInvoice.id);
    expect(authInvoice.status).toBe('open');
    const authPreview=await (await api.post('/api/billing/recovery',{headers,data:payload})).json();
    const authResult=await (await api.post('/api/billing/recovery',{headers,data:{workspaceId,action:'confirm',quoteId:authPreview.quoteId}})).json();
    expect(authResult.status).toBe('authenticating');expect(authResult.clientSecret).toBeTruthy();
    expect((await api.post('/api/billing/payment-method',{headers,data:{workspaceId,action:'prepare'}})).status()).toBe(409);
    const authenticationAttempts=(await stripe.invoices.retrieve(authInvoice.id)).attempt_count;
    await Promise.all([reconcileRenewalRecoveries(db),reconcileRenewalRecoveries(db)]);
    expect((await stripe.invoices.retrieve(authInvoice.id)).attempt_count).toBe(authenticationAttempts);
    await db('workspaceSubscriptions').where({workspaceId}).update({status:'past_due',recoveryUntil:new Date(Date.now()+86400000)});
    await page.reload();
    await page.getByRole('button',{name:'Resolve overdue payment'}).click();
    await expect.poll(async()=>{
      for(const frame of page.frames())if(await frame.locator('#test-source-fail-3ds').count())return true;
      return false;
    },{timeout:30000}).toBe(true);
    // Locate by its documented sandbox action, since Stripe nests the challenge frame.
    for(const frame of page.frames())if(await frame.locator('#test-source-fail-3ds').count())await frame.locator('#test-source-fail-3ds').click();
    await expect(page.getByRole('dialog').getByText('Payment status is not confirmed',{exact:true})).toBeVisible({timeout:30000});
    expect((await api.post('/api/account/delete',{headers,data:{workspaceId,password:'Fictional-renewal-42!',confirmation:'Fictional Renewal Workspace',acknowledged:true}})).status()).toBe(202);
    expect((await api.post('/api/billing/recovery',{headers,data:{workspaceId,action:'status',quoteId:authPreview.quoteId}})).status()).toBe(401);
    await processAccountDeletions(db);
    expect((await stripe.invoices.retrieve(authInvoice.id)).status).toBe('void');
    expect((await stripe.subscriptions.retrieve(sub.id)).status).toBe('canceled');
    expect(await db('billingRenewalRecoveries').where({workspaceId}).first()).toBeUndefined();
    expect((await db('accountDeletionRequests').where({userId:user.id}).first()).state).toBe('completed');
  }finally{
    if(subscriptionId&&(await stripe.subscriptions.retrieve(subscriptionId)).status!=='canceled')await stripe.subscriptions.cancel(subscriptionId,{invoice_now:false,prorate:false});
    await stripe.testHelpers.testClocks.del(clock.id);
    await db('billingRenewalRecoveries').where({workspaceId}).delete();
    await admin.close();
  }
});
