import {expect,test,type APIRequestContext} from '@playwright/test';
import {randomUUID} from 'node:crypto';
import {createDatabase,stripeSandbox} from '@salesmora/data';
const url=process.env.TEST_DATABASE_URL;
if(!url||!new URL(url).pathname.endsWith('_test')||url===process.env.DATABASE_URL)throw Error('Isolated test database required');
const db=createDatabase(url),headers={Origin:'http://127.0.0.1:3002'};
test.skip(process.env.SALESMORA_BILLING_TEST!=='1','Requires explicit sandbox opt-in');
async function account(api:APIRequestContext){
 const email=`history-${randomUUID()}@example.test`;
 expect((await api.post('/api/auth/sign-up/email',{headers,data:{name:'Fictional invoice tester',email,password:'Fictional-history-password-42!',termsAccepted:true}})).status()).toBe(200);
 return(await db('users').where({email}).first()).id as string;
}
test.afterAll(async()=>{await db.destroy();});
test('Owner and Admin browse all invoice pages, preserve rows on errors, and reject unauthorized or foreign cursors',async({page,browser})=>{
 test.setTimeout(180000);process.env.BILLING_SANDBOX_ENABLED='true';
 const stripe=stripeSandbox(),api=page.context().request;await db('rateLimits').delete();
 const owner=await account(api);
 const setup=await api.post('/api/workspaces',{headers,data:{business:{businessName:'Fictional invoice history',businessType:'plumbing'},services:{services:['repairs'],postalCode:'',serviceRange:''},team:{invitations:[]}}});expect(setup.status()).toBe(201);
 const workspaceId=(await setup.json()).workspaceId;
 const customer=await stripe.customers.create({metadata:{workspaceId}}),other=await stripe.customers.create();
 const admin=await browser.newContext(),field=await browser.newContext(),signedOut=await browser.newContext();
 const invoiceIds:string[]=[];let foreignId:string|undefined;
 try{
  await db('workspaceSubscriptions').where({workspaceId}).update({customerId:customer.id});
  // Draft $0 invoices exercise real Stripe pagination without creating charges or sending email.
  for(let index=0;index<26;index++)invoiceIds.push((await stripe.invoices.create({customer:customer.id,auto_advance:false,description:'Fictional history fixture'})).id);
  foreignId=(await stripe.invoices.create({customer:other.id,auto_advance:false})).id;
  const adminId=await account(admin.request),fieldId=await account(field.request);
  await db('workspaceMemberships').insert([{workspaceId,userId:adminId,role:'admin'},{workspaceId,userId:fieldId,role:'field'}]);
  const endpoint=`/api/billing/invoices?workspace=${workspaceId}`;
  expect((await signedOut.request.get(endpoint)).status()).toBe(401);
  expect((await field.request.get(endpoint)).status()).toBe(403);
  expect((await api.get(`/api/billing/invoices?workspace=${randomUUID()}`)).status()).toBe(403);
  expect((await api.get(endpoint+'&customer='+other.id)).status()).toBe(400);
  expect((await api.get(endpoint+'&workspace='+workspaceId)).status()).toBe(400);
  expect((await api.get(endpoint+'&after='+foreignId)).status()).toBe(403);
  const first=await api.get(endpoint);expect(first.status()).toBe(200);expect(first.headers()['cache-control']).toBe('no-store');
  const p1=await first.json();expect(p1.invoices).toHaveLength(12);expect(p1.hasMore).toBe(true);expect(p1).not.toHaveProperty('customerId');
  const p2=await(await admin.request.get(endpoint+'&after='+p1.nextCursor)).json();expect(p2.invoices).toHaveLength(12);
  const p3=await(await api.get(endpoint+'&after='+p2.nextCursor)).json();expect(p3.invoices).toHaveLength(2);expect(p3).toMatchObject({hasMore:false,nextCursor:null});
  expect(new Set([...p1.invoices,...p2.invoices,...p3.invoices].map(row=>row.id)).size).toBe(26);
  await page.setViewportSize({width:390,height:1000});await page.goto(`/settings/billing?workspace=${workspaceId}`);
  const views=page.getByRole('button',{name:/^View invoice ·/});await expect(views).toHaveCount(12);
  await page.route('**/api/billing/invoices?*',route=>route.fulfill({status:503,json:{error:'Fictional provider outage'}}),{times:1});
  await page.getByRole('button',{name:'Load older invoices',exact:true}).click();
  await expect(page.getByRole('alert').filter({hasText:'Older invoices could not be loaded'})).toBeVisible();await expect(views).toHaveCount(12);
  await page.getByRole('button',{name:'Try loading older invoices again',exact:true}).click();await expect(views).toHaveCount(24);
  await page.getByRole('button',{name:'Load older invoices',exact:true}).click();await expect(views).toHaveCount(26);
  await expect(page.getByRole('status')).toContainText('beginning of your invoice history');
  await expect(page.getByRole('button',{name:'Load older invoices',exact:true})).toHaveCount(0);
  await views.last().click();await expect(page.getByRole('button',{name:'Close invoice',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  // Refresh resets to the latest page; a late older-page response cannot append stale data.
  await page.getByRole('button',{name:'Refresh billing',exact:true}).click();await expect(views).toHaveCount(12);
  let release!:()=>void,started=false;const held=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/api/billing/invoices?*',async route=>{started=true;await held;try{await route.fulfill({json:p2});}catch{/* Refresh aborted this request. */}},{times:1});
  await page.getByRole('button',{name:'Load older invoices',exact:true}).click();await expect.poll(()=>started).toBe(true);
  await page.getByRole('button',{name:'Refresh billing',exact:true}).click();release();await expect(views).toHaveCount(12);
  await db('workspaceRolePolicies').where({workspaceId,role:'admin',permission:'billing.read'}).delete();
  expect((await admin.request.get(endpoint+'&after='+p1.nextCursor)).status()).toBe(403);
  expect((await db('users').where({id:owner}).first()).deletionRequestedAt).toBeNull();
 }finally{
  for(const invoice of invoiceIds)await stripe.invoices.del(invoice);
  if(foreignId)await stripe.invoices.del(foreignId);
  await stripe.customers.del(customer.id);await stripe.customers.del(other.id);
  await api.post('/api/auth/sign-out',{headers,data:{}});await admin.close();await field.close();await signedOut.close();
 }
});
