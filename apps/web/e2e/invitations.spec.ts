import { expect, test, type APIRequestContext } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createDatabase } from '@salesmora/data';
import { invitationAcceptanceData as copy } from '../src/features/auth/invitation-acceptance/invitation-acceptance.data';
const testURL=process.env.TEST_DATABASE_URL;
if(!testURL || !new URL(testURL).pathname.endsWith('_test') || testURL===process.env.DATABASE_URL)throw Error('Tests require isolated _test database.');
const db=createDatabase(testURL);
const origin='http://127.0.0.1:3002';
const headers={Origin:origin};
const password='Fictional-invitation-password-42!';
const addresses=new Set<string>();
let ownerEmail:string;
let invitedEmail:string;
let secondEmail:string;
const input=()=>({business:{businessName:'Invitation Plumbing',businessType:'plumbing'},services:{services:['repairs'],postalCode:'',serviceRange:''},team:{invitations:[{email:invitedEmail,role:'office'},{email:secondEmail,role:'admin'}]}});
test.beforeEach(async()=>{
 ownerEmail=`invite-owner-${crypto.randomUUID()}@example.com`;
 invitedEmail=`invite-member-${crypto.randomUUID()}@example.com`;
 secondEmail=`invite-admin-${crypto.randomUUID()}@example.com`;
 for(const email of [ownerEmail,invitedEmail,secondEmail])addresses.add(email);
 await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE');
});
test.afterAll(async()=>{
 for(const email of addresses){const messages=await inbox(email);if(messages.length)await fetch('http://127.0.0.1:18025/api/v1/messages',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({IDs:messages.map(message=>message.ID)})});}
 await db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE');await db.destroy();
});
async function inbox(email:string):Promise<Array<{ID:string;Subject:string}>>{
 return (await (await fetch('http://127.0.0.1:18025/api/v1/search?query='+encodeURIComponent('to:'+email))).json()).messages;
}
async function mailLink(email:string,subject:string){
 await expect.poll(async()=>(await inbox(email)).filter(message=>message.Subject===subject).length).toBe(1);
 const message=(await inbox(email)).find(message=>message.Subject===subject)!;
 const body=await (await fetch('http://127.0.0.1:18025/api/v1/message/'+message.ID)).json();
 const link=body.Text.match(/http:\/\/127\.0\.0\.1:3002\/[^\s]+/)?.[0];
 expect(link).toBeTruthy();return link as string;
}
async function signUp(request:APIRequestContext,email:string){
 const response=await request.post('/api/auth/sign-up/email',{headers,data:{name:'Invitation Tester',email,password,termsAccepted:true}});
 expect(response.status()).toBe(200);
}
async function setup(request:APIRequestContext,verifyBefore=false){
 await signUp(request,ownerEmail);
 if(verifyBefore)await request.get(await mailLink(ownerEmail,'Verify your SalesMora.ai email'));
 const response=await request.post('/api/workspaces',{headers,data:input()});expect(response.status()).toBe(201);
 if(!verifyBefore)await request.get(await mailLink(ownerEmail,'Verify your SalesMora.ai email'));
 const link=await mailLink(invitedEmail,'Join Invitation Plumbing on SalesMora.ai');
 return {link,token:new URL(link).searchParams.get('token')!,workspaceId:(await response.json()).workspaceId as string};
}
async function accept(request:APIRequestContext,token:string,data:object={token}){
 return request.post('/api/invitations/accept',{headers,data});
}
test('verification releases both invitations once; tokens are hashed and expire in seven days',async({request})=>{
 await signUp(request,ownerEmail);
 expect((await request.post('/api/workspaces',{headers,data:input()})).status()).toBe(201);
 expect(await inbox(invitedEmail)).toHaveLength(0);expect(await inbox(secondEmail)).toHaveLength(0);
 expect((await db('workspaceInvitations')).map(row=>row.status)).toEqual(['pending_verification','pending_verification']);
 const verifyLink=await mailLink(ownerEmail,'Verify your SalesMora.ai email');
 await request.get(verifyLink);
 for(const email of [invitedEmail,secondEmail]){
  const link=await mailLink(email,'Join Invitation Plumbing on SalesMora.ai');
  const token=new URL(link).searchParams.get('token')!;
  const row=await db('workspaceInvitations').where({email}).first();
  expect(row.tokenHash).toBe(createHash('sha256').update(token).digest('hex'));expect(row.tokenHash).not.toBe(token);
  expect(row.status).toBe('sent');expect(new Date(row.expiresAt).getTime()-Date.now()).toBeGreaterThan(6.9*86400000);
 }
 await request.get(verifyLink);
 expect((await request.post('/api/workspaces',{headers,data:input()})).status()).toBe(200);
 expect(await inbox(invitedEmail)).toHaveLength(1);expect(await inbox(secondEmail)).toHaveLength(1);
});
test('new invitee registers, returns to acceptance, and joins without creating an owner workspace',async({page,request})=>{
 const {link,workspaceId}=await setup(request);
 await page.goto(link);
 const userBefore=await db('users').where({email:invitedEmail}).first();expect(userBefore).toBeUndefined();
 await expect(page.locator('input[name=email]')).toHaveValue(invitedEmail);
 await expect(page.locator('input[name=email]')).toBeDisabled();
 for(const [name,value] of Object.entries({name:'Invited Member',password,confirmPassword:password}))await page.locator(`input[name=${name}]`).fill(value);
 await page.getByRole('checkbox').check();await page.getByRole('button',{name:copy.createAccount,exact:true}).click();
 await expect(page.getByRole('button',{name:copy.accept,exact:true})).toBeVisible();
 expect(await db('workspaces')).toHaveLength(1);expect(await db('workspaceMemberships')).toHaveLength(1);
 await page.getByRole('button',{name:copy.accept,exact:true}).click();
 await expect(page.getByRole('status')).toHaveAccessibleDescription(copy.success);
 await page.getByRole('button',{name:copy.continue}).click();await expect(page).toHaveURL(`${origin}/home?workspace=${workspaceId}`);
 await expect(page.getByRole('heading',{name:'Start working with your team'})).toBeVisible();
 await expect(page.getByRole('complementary')).toContainText('Office');
 await expect(page.getByRole('button',{name:'Reports Coming soon',exact:true})).toBeDisabled();
 await expect(page.getByRole('button',{name:'Campaigns Coming soon',exact:true})).toBeDisabled();
 await expect(page.getByRole('link',{name:'Settings',exact:true})).toHaveAttribute('href',`/settings?workspace=${workspaceId}`);
 await expect(page.getByRole('link',{name:'Billing',exact:true})).toHaveCount(0);
 await expect(page.getByRole('link',{name:'Home',exact:true})).toHaveAttribute('href',`/home?workspace=${workspaceId}`);
 const user=await db('users').where({email:invitedEmail}).first();
 expect(user).toMatchObject({emailVerified:true,onboardingStatus:'complete'});
 expect(await db('workspaceMemberships').where({userId:user.id})).toEqual([expect.objectContaining({workspaceId,role:'office'})]);
 expect(await db('authorizationAudit').where({workspaceId,action:'invitation.accepted'})).toHaveLength(1);
 expect(await db('workspaces').where({ownerId:user.id})).toHaveLength(0);
 await page.goto('/setup');await expect(page).toHaveURL(/\/home$/);
});
test('existing account signs in, returns to invitation, and receives Admin membership',async({page,request})=>{
 await setup(request,true);
 const link=await mailLink(secondEmail,'Join Invitation Plumbing on SalesMora.ai');
 await signUp(request,secondEmail);
 await page.goto(link);await page.getByRole('button',{name:copy.signIn}).click();await expect(page).toHaveURL(/\/login$/);
 await page.locator('input[name=email]').fill(secondEmail);await page.locator('input[name=password]').fill(password);await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await expect(page).toHaveURL(/\/accept-invitation\?token=/);
 await page.getByRole('button',{name:copy.accept,exact:true}).click();await expect(page.getByRole('status')).toBeVisible();
 const user=await db('users').where({email:secondEmail}).first();expect(await db('workspaceMemberships').where({userId:user.id}).first()).toMatchObject({role:'admin'});
 await page.getByRole('button',{name:copy.continue}).click();
 await expect(page.getByRole('complementary')).toContainText('Admin');
 await expect(page.getByRole('link',{name:'Settings',exact:true})).toHaveAttribute('href',`/settings?workspace=${(await db('workspaceMemberships').where({userId:user.id}).first()).workspaceId}`);
 await expect(page.getByRole('main')).not.toContainText('Team invitations');
});
test('wrong account cannot accept; switch account preserves the invitation return context',async({page,request})=>{
 const {link,token}=await setup(request);
 await signUp(page.context().request,secondEmail);
 await page.goto(link);await expect(page.getByRole('alert',{name:copy.wrongAccountTitle})).toBeVisible();
 expect((await accept(page.context().request,token)).status()).toBe(403);
 await page.getByRole('button',{name:copy.switchAccount}).click();await expect(page).toHaveURL(/\/login$/);
 expect(await page.context().request.get('/api/auth/get-session').then(response=>response.json())).toBeNull();
 expect((await page.context().cookies()).some(cookie=>cookie.name==='salesmora.invitation')).toBe(true);
 expect(await db('workspaceMemberships')).toHaveLength(1);
});
test('rejects unauthenticated, untrusted-origin, forged-role and malformed acceptance',async({page,request})=>{
 const {token}=await setup(request);
 expect((await accept(page.context().request,token)).status()).toBe(401);
 expect((await request.post('/api/invitations/accept',{headers:{Origin:'https://untrusted.example'},data:{token}})).status()).toBe(403);
 expect((await request.post('/api/invitations/context',{headers:{Origin:'https://untrusted.example'},data:{token}})).status()).toBe(403);
 await signUp(page.context().request,invitedEmail);
 expect((await accept(page.context().request,token,{token,role:'owner'})).status()).toBe(400);
 expect((await accept(page.context().request,'bad')).status()).toBe(400);
 expect(await db('workspaceMemberships')).toHaveLength(1);
});
test('expired/revoked/unknown links hide details; expired auth context can be left',async({page,request})=>{
 const {link,token}=await setup(request);
 await signUp(page.context().request,invitedEmail);
 expect((await page.context().request.post('/api/invitations/context',{headers,data:{token}})).ok()).toBe(true);
 await db('workspaceInvitations').where({email:invitedEmail}).update({expiresAt:new Date(Date.now()-1000)});
 await page.goto(link);await expect(page.getByRole('alert',{name:copy.unavailable.expired.title})).toBeVisible();
 await expect(page.getByText(invitedEmail,{exact:true})).toHaveCount(0);
 expect((await accept(page.context().request,token)).status()).toBe(410);
 await page.getByRole('button',{name:copy.page.leave}).click();await expect(page).toHaveURL(/\/setup$/);
 await db('workspaceInvitations').where({email:invitedEmail}).update({status:'revoked'});
 await page.goto(link);await expect(page.getByRole('alert',{name:copy.unavailable.revoked.title})).toBeVisible();
 await page.goto('/accept-invitation?token='+'0'.repeat(64));await expect(page.getByRole('alert',{name:copy.unavailable.invalid.title})).toBeVisible();
 expect(await db('workspaceMemberships')).toHaveLength(1);
});
test('concurrent acceptance and retries create one membership; existing membership permissions are preserved',async({page,request})=>{
 const {token,workspaceId}=await setup(request);
 await signUp(page.context().request,invitedEmail);
 const user=await db('users').where({email:invitedEmail}).first();
 await db('workspaceMemberships').insert({userId:user.id,workspaceId,role:'field'});
 const responses=await Promise.all([accept(page.context().request,token),accept(page.context().request,token)]);
 expect(responses.map(response=>response.status())).toEqual([200,200]);
 expect(await db('workspaceMemberships').where({userId:user.id,workspaceId})).toEqual([expect.objectContaining({role:'field'})]);
 expect(await db('workspaceInvitations').where({email:invitedEmail}).first()).toMatchObject({status:'accepted',acceptedBy:user.id});
});
test('membership failure rolls back invitation consumption and account completion',async({page,request})=>{
 const {token}=await setup(request);await signUp(page.context().request,invitedEmail);
 await db.raw(`CREATE FUNCTION test_reject_invited_member() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test membership failure'; END $$`);
 await db.raw('CREATE TRIGGER test_reject_invited_member BEFORE INSERT ON "workspaceMemberships" FOR EACH ROW EXECUTE FUNCTION test_reject_invited_member()');
 try{
  const response=await accept(page.context().request,token);expect(response.status()).toBe(503);expect(await response.text()).not.toContain('test membership failure');
  expect(await db('workspaceInvitations').where({email:invitedEmail}).first()).toMatchObject({status:'sent',acceptedBy:null});
  expect(await db('users').where({email:invitedEmail}).first()).toMatchObject({onboardingStatus:'pending',emailVerified:false});
 }finally{await db.raw('DROP TRIGGER test_reject_invited_member ON "workspaceMemberships"');await db.raw('DROP FUNCTION test_reject_invited_member()');}
 expect((await accept(page.context().request,token)).status()).toBe(200);
});
test('rate limits acceptance attempts and cannot open an unrelated workspace',async({page,request})=>{
 const {workspaceId}=await setup(request);await signUp(page.context().request,invitedEmail);
 for(let attempt=0;attempt<10;attempt++)expect((await accept(page.context().request,'0'.repeat(64))).status()).toBe(410);
 expect((await accept(page.context().request,'0'.repeat(64))).status()).toBe(429);
 await page.goto(`/home?workspace=${workspaceId}`);await expect(page).toHaveURL(/\/setup$/);
});
for(const width of [1440,320])test(`real invitation fits ${width}px; viewing does not accept`,async({page,request})=>{
 const {link}=await setup(request);await signUp(page.context().request,invitedEmail);await page.setViewportSize({width,height:1000});
 await page.goto(link);await expect(page.getByRole('button',{name:copy.accept,exact:true})).toBeEnabled();
 await expect(page.getByRole('button',{name:copy.accept,exact:true})).toHaveCSS('background-color','rgb(59, 111, 165)');
 expect(await db('workspaceMemberships')).toHaveLength(1);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(await page.locator('meta[name=referrer]').getAttribute('content')).toBe('no-referrer');
 await page.screenshot({path:`/private/tmp/salesmora-live-invitation-${width}.png`,fullPage:true});
});

test('delivery failure stays queued and concurrent retries send each invitation once',async({request})=>{
 await signUp(request,ownerEmail);
 expect((await request.post('/api/workspaces',{headers,data:input()})).status()).toBe(201);
 const owner=await db('users').where({email:ownerEmail}).first();
 const output=execFileSync(process.execPath,[fileURLToPath(new URL('../../../packages/data/node_modules/tsx/dist/cli.mjs',import.meta.url)),fileURLToPath(new URL('./helpers/invitation-delivery-check.mts',import.meta.url)),owner.id],{env:{...process.env,NODE_OPTIONS:'--conditions=react-server'},encoding:'utf8',timeout:30000});
 expect(output).toContain('PASS verified-owner gate');
});
