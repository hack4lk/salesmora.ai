import {expect,test,type APIRequestContext,type BrowserContext} from '@playwright/test';
import {createHash,randomBytes,randomUUID} from 'node:crypto';
import {createDatabase,assertSeatCapacity,workspaceSeatUsage} from '@salesmora/data';
import {createLeadFormData} from '../src/features/leads/create-lead-form/create-lead-form.data';
const url=process.env.TEST_DATABASE_URL;
if(!url||!new URL(url).pathname.endsWith('_test')||url===process.env.DATABASE_URL)throw Error('Isolated database required');
const db=createDatabase(url),headers={Origin:'http://127.0.0.1:3002'};
test.skip(process.env.SALESMORA_BILLING_TEST!=='1','Requires explicit local billing opt-in; no provider calls');
if(process.env.SALESMORA_BILLING_TEST==='1')process.env.BILLING_SANDBOX_ENABLED='true';
async function account(api:APIRequestContext){
 const email=`quota-${randomUUID()}@example.test`;
 expect((await api.post('/api/auth/sign-up/email',{headers,data:{name:'Fictional quota tester',email,password:'Fictional-quota-password-42!',termsAccepted:true}})).status()).toBe(200);
 return await db('users').where({email}).first();
}
async function workspace(api:APIRequestContext){
 const user=await account(api);
 const response=await api.post('/api/workspaces',{headers,data:{business:{businessName:'Fictional quota workspace',businessType:'plumbing'},services:{services:['repairs'],postalCode:'',serviceRange:''},team:{invitations:[]}}});
 expect(response.status()).toBe(201);return{user,workspaceId:(await response.json()).workspaceId as string};
}
const body=(workspaceId:string)=>({workspaceId,submissionId:randomUUID(),lead:{...createLeadFormData.stories.filled,ownerId:''}});
async function usage(workspaceId:string,count:number){
 await db('workspaceLeadAdmissions').where({workspaceId}).delete();
 for(let offset=0;offset<count;offset+=500)await db('workspaceLeadAdmissions').insert(Array.from({length:Math.min(500,count-offset)},()=>({workspaceId,leadId:randomUUID()})));
}
test.beforeEach(async()=>{await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits", "chatActionAudit" CASCADE');});
test.afterAll(async()=>{await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits", "chatActionAudit" CASCADE');await db.destroy();});
test('each tier serializes its last lead slot; replay/deletion/month reset preserve correct accounting',async({request})=>{
 test.setTimeout(90000);const{workspaceId}=await workspace(request);
 for(const[plan,limit]of [['free',100],['standard',1000],['premium',5000]] as const){
  await db('workspaceSubscriptions').where({workspaceId}).update({plan,intendedPlan:plan,status:plan==='free'?'free':'active',paidThrough:new Date(Date.now()+86400000),transitionUntil:null});
  await usage(workspaceId,limit-1);
  const requests=[body(workspaceId),body(workspaceId)];
  const responses=await Promise.all(requests.map(data=>request.post('/api/leads',{headers,data})));
  expect(responses.map(r=>r.status()).sort()).toEqual([201,409]);
  const winner=responses.findIndex(r=>r.status()===201),saved=await responses[winner].json();
  const denial=await responses[1-winner].json();expect(denial).toMatchObject({code:'plan_limit',resource:'leads',limit});
  expect(new Date(denial.resetAt).getUTCDate()).toBe(1);
  expect((await request.post('/api/leads',{headers,data:requests[winner]})).status()).toBe(200);
  expect(Number((await db('workspaceLeadAdmissions').where({workspaceId}).count('* as count').first())!.count)).toBe(limit);
  await db('leads').where({id:saved.leadId}).delete();
  expect((await request.post('/api/leads',{headers,data:body(workspaceId)})).status()).toBe(409);
 }
 // Expired paid access falls back to Free, regardless of a selected Premium checkout.
 await db('workspaceSubscriptions').where({workspaceId}).update({plan:'premium',intendedPlan:'premium',status:'active',paidThrough:new Date(Date.now()-1000)});
 expect((await request.post('/api/leads',{headers,data:body(workspaceId)})).status()).toBe(409);
 await db('workspaceLeadAdmissions').where({workspaceId}).update({createdAt:new Date('2020-01-01T00:00:00Z')});
 expect((await request.post('/api/leads',{headers,data:body(workspaceId)})).status()).toBe(201);
 // Existing-workspace transition permits creation but records it; expiry never restarts the grace.
 await usage(workspaceId,100);
 await db('workspaceSubscriptions').where({workspaceId}).update({transitionUntil:new Date(Date.now()+60000)});
 expect((await request.post('/api/leads',{headers,data:body(workspaceId)})).status()).toBe(201);
 await db('workspaceSubscriptions').where({workspaceId}).update({transitionUntil:new Date(Date.now()-1000)});
 expect((await request.post('/api/leads',{headers,data:body(workspaceId)})).status()).toBe(409);
});
test('chat proposal does not consume a slot; confirmation enforces the shared limit and can resume after an upgrade',async({page})=>{
 const api=page.context().request,{workspaceId}=await workspace(api);await usage(workspaceId,100);
 await page.goto(`/home?workspace=${workspaceId}`);
 await page.getByRole('button',{name:'SalesMora assistant How can I help?',exact:true}).click();
 await page.getByRole('textbox',{name:'Ask the SalesMora assistant',exact:true}).fill('fixture:draft');
 await page.getByRole('button',{name:'Ask assistant',exact:true}).click();
 const confirm=page.getByRole('button',{name:'Confirm and create lead'});await expect(confirm).toBeEnabled();await confirm.click();
 await expect(page.getByRole('region',{name:'Review lead draft'}).getByRole('alert')).toContainText('monthly new-lead limit');
 expect(await db('leads').where({workspaceId})).toHaveLength(0);
 const draft=await db('chatActionDrafts').where({workspaceId}).first();expect(draft.state).toBe('pending');
 await db('workspaceSubscriptions').where({workspaceId}).update({plan:'standard',status:'active',paidThrough:new Date(Date.now()+86400000)});
 await confirm.click();await expect(page.getByRole('region',{name:'Review lead draft'}).getByRole('status')).toHaveText('Lead created');
 expect(await db('leads').where({workspaceId})).toHaveLength(1);
 expect(Number((await db('workspaceLeadAdmissions').where({workspaceId}).count('* as count').first())!.count)).toBe(101);
});
test('seat reservations convert once; downgrade blocks acceptance, expiry releases capacity and simultaneous reservations cannot oversubscribe',async({request,browser})=>{
 const{workspaceId,user}=await workspace(request);const contexts:BrowserContext[]=[];
 try{
  await db('workspaceSubscriptions').where({workspaceId}).update({plan:'standard',status:'active',paidThrough:new Date(Date.now()+86400000)});
  const invites:{token:string;id:string;context:BrowserContext;member:{email:string;id:string}}[]=[];
  for(let index=0;index<4;index++){
   const context=await browser.newContext();contexts.push(context);const member=await account(context.request);
   const token=randomBytes(32).toString('hex'),id=randomUUID();
   await db('workspaceInvitations').insert({id,workspaceId,email:member.email,role:'field',inviterId:user.id,status:'sent',tokenHash:createHash('sha256').update(token).digest('hex'),expiresAt:new Date(Date.now()+60000)});
   invites.push({token,id,context,member});
  }
  expect(await workspaceSeatUsage(db,workspaceId,new Date())).toBe(5);
  const accept=(index:number)=>invites[index].context.request.post('/api/invitations/accept',{headers,data:{token:invites[index].token}});
  expect((await accept(0)).status()).toBe(200);expect((await accept(0)).status()).toBe(200);
  expect(await workspaceSeatUsage(db,workspaceId,new Date())).toBe(5);
  await db('workspaceSubscriptions').where({workspaceId}).update({plan:'free',status:'free'});
  const blocked=await accept(1);expect(blocked.status()).toBe(409);expect(await blocked.json()).toMatchObject({reason:'capacity'});
  expect(await db('workspaceMemberships').where({workspaceId,userId:invites[1].member.id}).first()).toBeUndefined();
  await db('workspaceSubscriptions').where({workspaceId}).update({plan:'standard',status:'active',paidThrough:new Date(Date.now()+86400000)});
  expect((await accept(1)).status()).toBe(200);
  await db('workspaceInvitations').where({id:invites[2].id}).update({expiresAt:new Date(Date.now()-1000)});
  expect(await workspaceSeatUsage(db,workspaceId,new Date())).toBe(4);
  const reserve=()=>db.transaction(async trx=>{
   await trx('workspaces').where({id:workspaceId}).forUpdate().first();
   await assertSeatCapacity(trx,workspaceId,1);
   await trx('workspaceInvitations').insert({id:randomUUID(),workspaceId,email:`reserved-${randomUUID()}@example.test`,role:'field',inviterId:user.id,status:'queued'});
  });
  const outcomes=await Promise.allSettled([reserve(),reserve()]);expect(outcomes.filter(r=>r.status==='fulfilled')).toHaveLength(1);
  expect(await workspaceSeatUsage(db,workspaceId,new Date())).toBe(5);
 }finally{for(const context of contexts)await context.close();}
});

test('Free, Standard and Premium reserve exactly 1, 5 and 20 total seats',async({request})=>{
 const{workspaceId,user}=await workspace(request);
 for(const[plan,limit]of [['free',1],['standard',5],['premium',20]] as const){
  await db('workspaceInvitations').where({workspaceId}).delete();
  await db('workspaceSubscriptions').where({workspaceId}).update({plan,status:plan==='free'?'free':'active',paidThrough:new Date(Date.now()+86400000)});
  if(limit>1)await db('workspaceInvitations').insert(Array.from({length:limit-1},()=>({id:randomUUID(),workspaceId,email:`seat-${randomUUID()}@example.test`,role:'field',inviterId:user.id,status:'queued'})));
  await db.transaction(async trx=>{await assertSeatCapacity(trx,workspaceId,0);});
  await expect(db.transaction(async trx=>{await assertSeatCapacity(trx,workspaceId,1);})).rejects.toMatchObject({resource:'teammates',limit});
 }
});
