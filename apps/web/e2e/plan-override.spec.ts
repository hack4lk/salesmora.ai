import {expect,test} from '@playwright/test';
import {applyPlanOverride,clearPlanOverride,createDatabase} from '@salesmora/data';

test.skip(process.env.SALESMORA_BILLING_TEST!=='1','Explicit isolated sandbox billing suite only');
const target=process.env.TEST_DATABASE_URL;
if(!target||!new URL(target).pathname.endsWith('_test')||target===process.env.DATABASE_URL)throw Error('Isolated test database required');
const db=createDatabase(target);
const headers={Origin:'http://127.0.0.1:3002'};
const details={name:'Override Owner',email:'override-owner@example.com',password:'Fictional-override-password-42!',termsAccepted:true,plan:'free'};
const input={business:{businessName:'Override Workspace',businessType:'plumbing'},services:{services:['drain-cleaning'],postalCode:'10013',serviceRange:'25-miles'},team:{invitations:[] as {email:string;role:string}[]}};
const staff={type:'staff' as const,id:'e2e-staff'};
const reset=()=>db.raw('TRUNCATE users, accounts, sessions, verifications, "rateLimits" CASCADE');
test.beforeEach(reset);
test.afterAll(async()=>{await reset();await db.destroy();});

test('staff plan override shows as complimentary access without exposing the reason, and disappears when it ends',async({context,page})=>{
 expect((await context.request.post('/api/auth/sign-up/email',{headers,data:details})).ok()).toBe(true);
 const created=await context.request.post('/api/workspaces',{headers,data:input});expect(created.status()).toBe(201);
 const {workspaceId}=await created.json();
 const read=async()=>{const response=await context.request.get(`/api/billing/summary?workspace=${workspaceId}`);expect(response.status()).toBe(200);return response.json();};
 const endsAt=new Date(Date.now()+30*86_400_000);
 await applyPlanOverride(db,{workspaceId,plan:'premium',endsAt,reason:'Private sales-trial note',actor:staff});

 const snapshot=await read();
 expect(snapshot).toMatchObject({plan:'free',override:{plan:'premium'},usage:{monthlyAITokens:20000000}});
 expect(new Date(snapshot.override.endsAt).getTime()).toBe(endsAt.getTime());
 expect(JSON.stringify(snapshot)).not.toContain('Private sales-trial note');

 await page.goto(`/settings/billing?workspace=${workspaceId}`);
 await expect(page.getByText('Premium',{exact:true})).toBeVisible();
 await expect(page.getByText('Complimentary',{exact:true})).toBeVisible();
 await expect(page.getByText(/^Complimentary access until .+ Free limits apply after that\.$/)).toBeVisible();
 await expect(page.getByText('1 of 20')).toBeVisible();
 await expect(page.getByText('Private sales-trial note')).toHaveCount(0);

 await db('workspaces').where({id:workspaceId}).update({planOverrideEndsAt:db.raw("now() - interval '1 minute'")});
 const expired=await read();
 expect(expired.override??null).toBeNull();
 expect(expired.usage.monthlyAITokens).toBe(1000000);
 await page.reload();
 await expect(page.getByText('Free',{exact:true})).toBeVisible();
 await expect(page.getByText('Complimentary',{exact:true})).toHaveCount(0);

 await applyPlanOverride(db,{workspaceId,plan:'standard',endsAt,reason:'Second trial',actor:staff});
 expect((await read()).override).toMatchObject({plan:'standard'});
 await clearPlanOverride(db,{workspaceId,reason:'Trial ended early',actor:staff});
 expect((await read()).override??null).toBeNull();
});
