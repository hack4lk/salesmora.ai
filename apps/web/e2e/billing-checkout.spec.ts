import {randomUUID} from 'node:crypto';
import {expect,test} from '@playwright/test';
import {createDatabase,workspaceAIAllowance,stripeSandbox} from '@salesmora/data';

test.skip(process.env.SALESMORA_BILLING_TEST!=='1','Explicit isolated sandbox billing suite only');
const target=process.env.TEST_DATABASE_URL;
if(!target||!new URL(target).pathname.endsWith('_test')||target===process.env.DATABASE_URL)throw Error('Isolated test database required');
const db=createDatabase(target);
const origin='http://127.0.0.1:3002',headers={Origin:origin};
const details={name:'Sandbox Owner',email:'sandbox-owner@example.com',password:'Fictional-billing-password-42!',termsAccepted:true};
const input={business:{businessName:'Sandbox Workspace',businessType:'plumbing'},services:{services:['drain-cleaning'],postalCode:'10013',serviceRange:'25-miles'},team:{invitations:[] as {email:string;role:string}[]}};
test.beforeEach(async()=>{await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE');await db('billingWebhookEvents').delete();});
test.afterAll(async()=>{await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE');await db('billingWebhookEvents').delete();await db.destroy();});

test('Free registration uses approved comparison and enforces the Owner-only initial seat',async({page,context})=>{
 await page.goto('/register');await expect(page.getByRole('radio',{name:'Free',exact:true})).toBeChecked();
 await page.getByRole('button',{name:'Continue with Free'}).click();
 await page.locator('input[name=name]').fill(details.name);await page.locator('input[name=email]').fill(details.email);
 await page.locator('input[name=password]').fill(details.password);await page.locator('input[name=confirmPassword]').fill(details.password);
 await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Create free account'}).click();await expect(page).toHaveURL(/\/setup$/);
 await expect((await db('users').first()).registrationPlan).toBe('free');
 const over=await context.request.post('/api/workspaces',{headers,data:{...input,team:{invitations:[{email:'field@example.com',role:'field'}]}}});expect(over.status()).toBe(422);expect(await db('workspaces')).toHaveLength(0);
 const saved=await context.request.post('/api/workspaces',{headers,data:input});expect(saved.status()).toBe(201);const{workspaceId}=await saved.json();
 expect(await workspaceAIAllowance(db,workspaceId)).toMatchObject({monthlyTokens:1000000});
});

test('paid intent persists without email verification; role, workspace, price and signature boundaries deny access',async({context,browser})=>{
 expect((await context.request.post('/api/auth/sign-up/email',{headers,data:{...details,plan:'premium',registrationPlan:'free',paid:true}})).ok()).toBe(true);
 expect((await db('users').first()).registrationPlan).toBe('premium');
 const saved=await context.request.post('/api/workspaces',{headers,data:{...input,team:{invitations:[{email:'field@example.com',role:'field'}]}}});const{workspaceId}=await saved.json();expect(saved.status()).toBe(201);
 expect((await db('workspaceSubscriptions').where({workspaceId}).first())).toMatchObject({plan:'free',intendedPlan:'premium'});expect(await db('workspaceInvitations').where({workspaceId})).toHaveLength(0);
 const request=(data:unknown,custom=headers)=>context.request.post('/api/billing/checkout',{headers:custom,data});
 expect((await request({workspaceId,action:'refresh'})).status()).toBe(200);
 expect((await request({workspaceId,action:'checkout'},{Origin:'https://attacker.example'})).status()).toBe(403);
 expect((await request({workspaceId:randomUUID(),action:'checkout'})).status()).toBe(403);
 expect((await request({workspaceId,action:'checkout',priceId:'price_forged'})).status()).toBe(400);
 const teammate=await browser.newContext();
 try {
   const email='sandbox-field@example.com';
   expect((await teammate.request.post(origin+'/api/auth/sign-up/email',{headers,data:{...details,email}})).ok()).toBe(true);
   const user=await db('users').where({email}).first();
   await db('workspaceMemberships').insert({workspaceId,userId:user.id,role:'field'});
   for(const role of ['admin','office','field']) {
     await db('workspaceMemberships').where({workspaceId,userId:user.id}).update({role});
     expect((await teammate.request.post(origin+'/api/billing/checkout',{headers,data:{workspaceId,action:'refresh'}})).status()).toBe(403);
   }
 } finally {await teammate.close();}
 expect((await context.request.post('/api/stripe/webhook',{data:{id:'evt_forged'}})).status()).toBe(400);
 const stripe=stripeSandbox();const payload=JSON.stringify({id:'evt_local_fixture',object:'event',type:'checkout.session.completed',livemode:false,data:{object:{id:'cs_test_unmapped',plan:'premium',payment_status:'paid',workspaceId}}});
 const signature=stripe.webhooks.generateTestHeaderString({payload,secret:process.env.STRIPE_WEBHOOK_SECRET!});
 for(let i=0;i<2;i++)expect((await context.request.post('/api/stripe/webhook',{headers:{'stripe-signature':signature,'Content-Type':'application/json'},data:payload})).status()).toBe(200);
 expect(await db('billingWebhookEvents').where({id:'evt_local_fixture'})).toHaveLength(1);expect(Object.keys((await db('billingWebhookEvents').first()))).not.toContain('payload');
 expect((await db('workspaceSubscriptions').where({workspaceId}).first()).plan).toBe('free');
});

test('unverified Owner can purchase; checkout retries reuse a session and choosing Free expires it',async({context,page})=>{
 test.skip(process.env.SALESMORA_STRIPE_LIVE_TEST!=='1','Explicit real sandbox API opt-in required');
 expect((await context.request.post('/api/auth/sign-up/email',{headers,data:{...details,plan:'standard'}})).ok()).toBe(true);
 const user=await db('users').first();expect(user.emailVerified).toBe(false);
 const saved=await context.request.post('/api/workspaces',{headers,data:input});const{workspaceId}=await saved.json();
 await page.goto(`/setup/payment?workspace=${workspaceId}`);
 await expect(page.getByRole('button',{name:'Enter payment details'})).toBeEnabled();
 await expect(page.getByRole('button',{name:'Continue with Free instead'})).toHaveCount(0);
 await expect(page.getByRole('link',{name:'Open email verification'})).toHaveCount(0);
 const requests=await Promise.all([1,2].map(()=>context.request.post('/api/billing/checkout',{headers,data:{workspaceId,action:'checkout'}})));
 const replies=await Promise.all(requests.map(async r=>{expect(r.status()).toBe(200);return r.json();}));expect(typeof replies[0].clientSecret).toBe('string');expect(replies[0].clientSecret === replies[1].clientSecret).toBe(true);expect(replies[0]).not.toHaveProperty('url');
 const attempts=await db('billingCheckoutAttempts').where({workspaceId});expect(attempts).toHaveLength(1);
 const embedded=await stripeSandbox().checkout.sessions.retrieve(attempts[0].sessionId);expect(embedded.ui_mode).toBe('embedded_page');expect(embedded.redirect_on_completion).toBe('never');expect(embedded.url).toBeNull();
 expect((await context.request.post('/api/billing/checkout',{headers,data:{workspaceId,action:'free'}})).status()).toBe(200);
 expect((await stripeSandbox().checkout.sessions.retrieve(attempts[0].sessionId)).status).toBe('expired');
 expect((await db('workspaceSubscriptions').where({workspaceId}).first())).toMatchObject({plan:'free',intendedPlan:'free',subscriptionId:null});
});

test('live Billing screen scopes reads to Owner and granted Admin; revocation, other workspaces and mutation deny',async({context,browser,page})=>{
 expect((await context.request.post('/api/auth/sign-up/email',{headers,data:{...details,plan:'free'}})).ok()).toBe(true);
 const created=await context.request.post('/api/workspaces',{headers,data:input});expect(created.status()).toBe(201);
 const {workspaceId}=await created.json();
 const read=()=>context.request.get(`/api/billing/summary?workspace=${workspaceId}`);
 const response=await read();expect(response.status()).toBe(200);
 const snapshot=await response.json();expect(snapshot).toMatchObject({plan:'free',usage:{teammates:1,newLeads:0,aiTokens:'0',monthlyAITokens:1000000},payment:null,invoices:[]});
 expect(snapshot).not.toHaveProperty('customerId');expect(response.headers()['cache-control']).toBe('no-store');
 await page.goto(`/settings?workspace=${workspaceId}`);await expect(page.getByRole('link',{name:'View billing'})).toBeVisible();
 await page.getByRole('link',{name:'View billing'}).click();await expect(page.getByRole('heading',{name:'Billing',exact:true})).toBeVisible();
 await expect(page.getByText('Sandbox Workspace',{exact:true}).last()).toBeVisible();
 await expect(page.getByText('Northstar Plumbing')).toHaveCount(0);await expect(page.getByRole('button',{name:'Change plan'})).toBeEnabled();
 expect((await context.request.get(`/api/billing/summary?workspace=${randomUUID()}`)).status()).toBe(403);
 const teammate=await browser.newContext();
 try {
  const email='billing-viewer@example.com';await teammate.request.post(origin+'/api/auth/sign-up/email',{headers,data:{...details,email}});
  const user=await db('users').where({email}).first();await db('workspaceMemberships').insert({workspaceId,userId:user.id,role:'admin'});
  const adminRead=()=>teammate.request.get(`${origin}/api/billing/summary?workspace=${workspaceId}`);
  expect((await adminRead()).status()).toBe(200);
  await db('workspaceRolePolicies').where({workspaceId,role:'admin'}).whereIn('permission',['settings.business.read','settings.business.update']).delete();
  expect((await teammate.request.get(`${origin}/settings?workspace=${workspaceId}`)).status()).toBe(200);
  expect((await teammate.request.post(origin+'/api/billing/checkout',{headers,data:{workspaceId,action:'refresh'}})).status()).toBe(403);
  await db('workspaceRolePolicies').where({workspaceId,role:'admin',permission:'billing.read'}).delete();
  expect((await adminRead()).status()).toBe(403);
  for(const role of ['office','field']) {await db('workspaceMemberships').where({workspaceId,userId:user.id}).update({role});expect((await adminRead()).status()).toBe(403);}
 } finally {await teammate.close();}
});

test('sandbox plan changes quote exact charges, preserve consumption, schedule downgrades and deny forged confirmations',async({context,browser,page})=>{
 test.skip(process.env.SALESMORA_STRIPE_LIVE_TEST!=='1','Explicit sandbox API opt-in required');test.setTimeout(120000);
 await context.request.post('/api/auth/sign-up/email',{headers,data:{...details,plan:'free'}});
 const saved=await context.request.post('/api/workspaces',{headers,data:input});const{workspaceId}=await saved.json();
 const user=await db('users').where({email:details.email}).first();
 const stripe=stripeSandbox();let subscriptionId:string|undefined;
 const customer=await stripe.customers.create({email:details.email,metadata:{workspaceId}});
 try {
  const method=await stripe.paymentMethods.create({type:'card',card:{token:'tok_visa'}});await stripe.paymentMethods.attach(method.id,{customer:customer.id});
  const sub=await stripe.subscriptions.create({customer:customer.id,default_payment_method:method.id,items:[{price:process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID!}],metadata:{workspaceId},payment_behavior:'error_if_incomplete'});subscriptionId=sub.id;
  await db('workspaceSubscriptions').where({workspaceId}).update({customerId:customer.id,subscriptionId:sub.id});
  const {reconcileWorkspaceSubscription,createAIUsageRecorder}=await import('@salesmora/data');await reconcileWorkspaceSubscription(db,workspaceId);
  const finish=await createAIUsageRecorder(db,{workspaceId,userId:user.id}).start('fixture','answer',1000);await finish({outcome:'completed',tokens:{inputTokens:400,outputTokens:100,totalTokens:500,cachedInputTokens:0,reasoningTokens:0}});
  const call=(data:unknown,custom=headers)=>context.request.post('/api/billing/plan',{headers:custom,data});
  expect((await call({workspaceId,action:'preview',plan:'premium',amountDue:1})).status()).toBe(400);
  expect((await call({workspaceId,action:'preview',plan:'premium'},{Origin:'https://attacker.example'})).status()).toBe(403);
  expect((await call({workspaceId:randomUUID(),action:'preview',plan:'premium'})).status()).toBe(403);
  const viewer=await browser.newContext();try{
   await viewer.request.post(origin+'/api/auth/sign-up/email',{headers,data:{...details,email:'plan-admin@example.com'}});const admin=await db('users').where({email:'plan-admin@example.com'}).first();await db('workspaceMemberships').insert({workspaceId,userId:admin.id,role:'admin'});
   expect((await viewer.request.post(origin+'/api/billing/plan',{headers,data:{workspaceId,action:'preview',plan:'premium'}})).status()).toBe(403);
  }finally{await viewer.close();}
  const oldPreview=await call({workspaceId,action:'preview',plan:'premium'});expect(oldPreview.status()).toBe(200);const oldQuote=await oldPreview.json();await db('billingPlanChanges').where({id:oldQuote.id}).update({createdAt:new Date(Date.now()-660000)});expect((await call({workspaceId,action:'confirm',quoteId:oldQuote.id})).status()).toBe(409);
  const preview=await call({workspaceId,action:'preview',plan:'premium'});expect(preview.status()).toBe(200);const quote=await preview.json();expect(quote.kind).toBe('upgrade');expect(quote.amountDue).toBeGreaterThan(0);expect(quote.amountDue).toBeLessThanOrEqual(2000);
  const replies=await Promise.all([1,2].map(()=>call({workspaceId,action:'confirm',quoteId:quote.id})));for(const response of replies){expect(response.status()).toBe(200);expect(await response.json()).toMatchObject({status:'complete'});}
  const updated=await stripe.subscriptions.retrieve(sub.id);expect(updated.items.data[0].price.id).toBe(process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID);expect(updated.items.data[0].current_period_end).toBe(sub.items.data[0].current_period_end);
  const invoice=await stripe.invoices.retrieve(typeof updated.latest_invoice==='string'?updated.latest_invoice:updated.latest_invoice!.id);expect(invoice.amount_paid).toBe(quote.amountDue);
  expect(await workspaceAIAllowance(db,workspaceId)).toMatchObject({monthlyTokens:20000000,usedTokens:500n});
  const down=await call({workspaceId,action:'preview',plan:'standard'});expect(down.status()).toBe(200);const downQuote=await down.json();expect(downQuote).toMatchObject({kind:'downgrade',amountDue:0});
  const confirmed=await call({workspaceId,action:'confirm',quoteId:downQuote.id});expect(confirmed.status()).toBe(200);expect(await confirmed.json()).toMatchObject({status:'scheduled'});
  const scheduled=await stripe.subscriptions.retrieve(sub.id);expect(scheduled.items.data[0].price.id).toBe(process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID);expect(scheduled.schedule).toBeTruthy();
  const schedule=await stripe.subscriptionSchedules.retrieve(typeof scheduled.schedule==='string'?scheduled.schedule:scheduled.schedule!.id);expect(schedule.phases[1].start_date).toBe(sub.items.data[0].current_period_end);expect(schedule.phases[1].items[0].price).toBe(process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID);
  expect(await workspaceAIAllowance(db,workspaceId)).toMatchObject({monthlyTokens:20000000,usedTokens:500n});
  expect((await call({workspaceId,action:'undo',quoteId:downQuote.id})).status()).toBe(200);
  expect((await stripe.subscriptions.retrieve(sub.id)).schedule).toBeNull();
  expect((await call({workspaceId,action:'confirm',quoteId:downQuote.id})).status()).toBe(409);
  const toFree=await call({workspaceId,action:'preview',plan:'free'});expect(toFree.status()).toBe(200);const freeQuote=await toFree.json();
  expect((await call({workspaceId,action:'confirm',quoteId:freeQuote.id})).status()).toBe(200);expect((await stripe.subscriptions.retrieve(sub.id)).cancel_at_period_end).toBe(true);
  expect((await call({workspaceId,action:'undo',quoteId:freeQuote.id})).status()).toBe(200);expect((await stripe.subscriptions.retrieve(sub.id)).cancel_at_period_end).toBe(false);
  await page.goto(`/settings/billing?workspace=${workspaceId}`);
  const changeButton=page.getByRole('button',{name:'Change plan',exact:true});await changeButton.click();
  await expect(page.getByRole('dialog',{name:'Change workspace plan'})).toBeVisible();await page.keyboard.press('Escape');await expect(changeButton).toBeFocused();
  const cancelButton=page.getByRole('button',{name:'Cancel subscription',exact:true});await cancelButton.click();
  const cancelDialog=page.getByRole('dialog',{name:'Cancel subscription',exact:true});await expect(cancelDialog.getByRole('button',{name:'Confirm cancellation'})).toBeEnabled();
  expect((await stripe.subscriptions.retrieve(sub.id)).cancel_at_period_end).toBe(false);
  await cancelDialog.getByRole('button',{name:'Keep subscription',exact:true}).click();await expect(cancelButton).toBeFocused();
  expect((await stripe.subscriptions.retrieve(sub.id)).cancel_at_period_end).toBe(false);
  await cancelButton.click();await cancelDialog.getByRole('button',{name:'Confirm cancellation'}).click();
  await expect(cancelDialog.getByText('Cancellation scheduled',{exact:true})).toBeVisible();expect((await stripe.subscriptions.retrieve(sub.id)).cancel_at_period_end).toBe(true);
  await cancelDialog.getByRole('button',{name:'Close cancellation'}).click();await expect(cancelButton).toHaveCount(0);
  await page.getByRole('button',{name:'Keep subscription',exact:true}).click();await expect(page.getByRole('button',{name:'Cancel subscription',exact:true})).toBeEnabled();
  expect((await stripe.subscriptions.retrieve(sub.id)).cancel_at_period_end).toBe(false);
 } finally {if(subscriptionId)await stripe.subscriptions.cancel(subscriptionId);await stripe.customers.del(customer.id);}
});

test('declined and expired upgrade preserves the previously paid plan',async({context})=>{
 test.skip(process.env.SALESMORA_STRIPE_LIVE_TEST!=='1','Explicit sandbox API opt-in required');test.setTimeout(90000);
 await context.request.post('/api/auth/sign-up/email',{headers,data:{...details,plan:'free'}});const created=await context.request.post('/api/workspaces',{headers,data:input});const{workspaceId}=await created.json();
 const stripe=stripeSandbox();const customer=await stripe.customers.create({metadata:{workspaceId}});let subId:string|undefined;
 try{
  const good=await stripe.paymentMethods.create({type:'card',card:{token:'tok_visa'}});await stripe.paymentMethods.attach(good.id,{customer:customer.id});
  const sub=await stripe.subscriptions.create({customer:customer.id,default_payment_method:good.id,items:[{price:process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID!}],metadata:{workspaceId},payment_behavior:'error_if_incomplete'});subId=sub.id;
  await db('workspaceSubscriptions').where({workspaceId}).update({customerId:customer.id,subscriptionId:sub.id});const{reconcileWorkspaceSubscription}=await import('@salesmora/data');await reconcileWorkspaceSubscription(db,workspaceId);
  const bad=await stripe.paymentMethods.create({type:'card',card:{token:'tok_chargeCustomerFail'}});await stripe.paymentMethods.attach(bad.id,{customer:customer.id});await stripe.subscriptions.update(sub.id,{default_payment_method:bad.id});
  const call=(data:unknown)=>context.request.post('/api/billing/plan',{headers,data});const preview=await call({workspaceId,action:'preview',plan:'premium'});expect(preview.status()).toBe(200);const quote=await preview.json();
  const confirm=await call({workspaceId,action:'confirm',quoteId:quote.id});expect(confirm.status()).toBe(200);const result=await confirm.json();expect(result.status).toBe('payment');expect(typeof result.clientSecret).toBe('string');
  await reconcileWorkspaceSubscription(db,workspaceId);expect(await workspaceAIAllowance(db,workspaceId)).toMatchObject({monthlyTokens:5000000});expect((await db('workspaceSubscriptions').where({workspaceId}).first()).plan).toBe('standard');
  const pending=await stripe.subscriptions.retrieve(sub.id);expect(pending.pending_update).toBeTruthy();const invoiceId=typeof pending.latest_invoice==='string'?pending.latest_invoice:pending.latest_invoice!.id;await stripe.invoices.voidInvoice(invoiceId);
  await reconcileWorkspaceSubscription(db,workspaceId);expect((await db('workspaceSubscriptions').where({workspaceId}).first()).plan).toBe('standard');expect((await db('billingPlanChanges').where({id:quote.id}).first()).state).toBe('expired');
 }finally{if(subId)await stripe.subscriptions.cancel(subId);await stripe.customers.del(customer.id);}
});

test('Free Owner changes plan and completes embedded payment on Billing',async({context,page})=>{
 test.skip(process.env.SALESMORA_STRIPE_LIVE_TEST!=='1','Explicit sandbox API opt-in required');test.setTimeout(120000);
 await context.request.post('/api/auth/sign-up/email',{headers,data:{...details,plan:'free'}});const created=await context.request.post('/api/workspaces',{headers,data:input});const{workspaceId}=await created.json();
 const stripe=stripeSandbox();
 try{
  await page.goto(`/settings/billing?workspace=${workspaceId}`);await page.getByRole('button',{name:'Change plan',exact:true}).click();
  const selector=page.getByRole('region',{name:'Change workspace plan'});await expect(selector.getByRole('heading',{name:'Change workspace plan'})).toBeFocused();
  await selector.getByRole('article').filter({has:page.getByRole('heading',{name:'Standard',exact:true})}).getByRole('button',{name:'Review plan'}).click();
  await expect(selector.getByText('$29.00',{exact:true})).toBeVisible();await selector.getByRole('button',{name:'Continue to payment'}).click();
  await expect.poll(async()=>{for(const frame of page.frames())if(await frame.locator('#cardNumber').count())return true;return false;},{timeout:40000}).toBe(true);
  let frame;for(const candidate of page.frames())if(await candidate.locator('#cardNumber').count()){frame=candidate;break;}if(!frame)throw Error('Embedded card frame missing');
  await frame.locator('#cardNumber').fill('4242424242424242');await frame.locator('#cardExpiry').fill('1230');await frame.locator('#cardCvc').fill('123');await frame.locator('#billingName').fill('Billing Sandbox Owner');
  if(await frame.locator('#billingPostalCode').count())await frame.locator('#billingPostalCode').fill('10013');await page.getByRole('dialog',{name:'Change workspace plan',exact:true}).evaluate(node=>{node.scrollTop=node.scrollHeight;});const opt=frame.locator('#enableStripePass');if(await opt.count()&&await opt.isChecked()){await opt.uncheck();}
  await frame.getByRole('button',{name:'Subscribe',exact:true}).click();await expect(selector.getByText('Your plan has been updated.')).toBeVisible({timeout:60000});
  await expect(page).toHaveURL(new RegExp(`/settings/billing\\?workspace=${workspaceId}`));expect(await workspaceAIAllowance(db,workspaceId)).toMatchObject({monthlyTokens:5000000});
 }finally{const row=await db('workspaceSubscriptions').where({workspaceId}).first();if(row.subscriptionId)await stripe.subscriptions.cancel(row.subscriptionId);if(row.customerId){for(const attempt of await db('billingCheckoutAttempts').where({workspaceId})){if(attempt.sessionId){const checkout=await stripe.checkout.sessions.retrieve(attempt.sessionId);if(checkout.status==='open')await stripe.checkout.sessions.expire(checkout.id);}}await stripe.customers.del(row.customerId);}}
});
