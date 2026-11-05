/** Publication, worker and billing invariants against a fresh local database, never a configured app/test database. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy, AuthorizationAccessError } from '../authorization/store';
import { RUNTIME_LOGIN_ROLES, ADMIN_APP_ROLE } from '../runtime-roles';
import { capturePublicationReviewSchema, type PermissionId } from '@salesmora/contracts';
import { createCaptureDraft, readCaptureSource, beginCaptureRevision, saveCaptureDraft } from './store';
import { publishCaptureDraft, readCapturePublicationReview, cancelCapturePublication, processCapturePublications, CapturePublicationError } from './publication';
import { assertCaptureDowngrade, CaptureCapacityError, captureCurrentBlocks } from './capacity';
import { applyPlanOverride, clearPlanOverride, recordExpiredPlanOverrides } from '../billing/plan-override';
import { previewPlanChange, confirmPlanChange, previewAdminPlanChange, confirmAdminPlanChange } from '../billing/plan-changes';
import { type Stripe } from '../billing/stripe';
import { getWorkspacePlan } from '@salesmora/domain';
import { readNotifications, markNotificationRead } from '../notifications/store';
const env = fileURLToPath(new URL('../../../../.env.local',import.meta.url)); if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL || !['127.0.0.1','localhost'].includes(new URL(connection).hostname)) throw Error('Separate local test connection required.');
const name = `capture_publish_${randomUUID().replaceAll('-','')}_test`, owner = createDatabase(connection), url = new URL(connection); url.pathname = `/${name}`;
const db = createDatabase(url.toString());
const roleDB = (role: string) => { const target = new URL(url); target.searchParams.set('options',`-c role=${role}`); return createDatabase(target.toString()); };
const web = roleDB(RUNTIME_LOGIN_ROLES.web), worker = roleDB(RUNTIME_LOGIN_ROLES.worker), admin = roleDB(ADMIN_APP_ROLE);
const enabled: PermissionId[] = ['leadCapture.read','leadCapture.create','leadCapture.update','leadCapture.activate'];
let created = false, checks = 0, ready = true;
const delivery = { websiteReady: async () => ready, gmailReady: async () => false };
async function check(label: string, run: () => Promise<void>) { await run(); checks++; console.log(`PASS ${label}`); }
async function workspace(plan: 'free' | 'standard' | 'premium' = 'free') {
  const identity = { workspaceId: randomUUID(), userId: `capture-${randomUUID()}` }, timestamp = new Date();
  await db('users').insert({ id: identity.userId, name: 'Fictional publication owner', email: `${identity.userId}@example.test`, createdAt: timestamp, updatedAt: timestamp, termsVersion: 'test', termsAcceptedAt: timestamp });
  await db.transaction(async trx => {
    await trx('workspaces').insert({ id: identity.workspaceId, ownerId: identity.userId, businessName: 'Fictional publication workspace', businessType: 'plumbing', postalCode: '', serviceRange: '', timezone: 'America/New_York', ...(plan === 'free' ? {} : { planOverride: plan, planOverrideEndsAt: new Date(Date.now()+86_400_000), planOverrideReason: 'Fixture', planOverrideId: randomUUID() }) });
    await trx('workspaceMemberships').insert({ ...identity, role: 'owner' }); await initializeWorkspacePolicy(trx,identity);
    await trx('workspaceSubscriptions').insert({ workspaceId: identity.workspaceId, catalogVersion: 'fixture' });
  }); return identity;
}
type Identity = Awaited<ReturnType<typeof workspace>>;
const configuration = (identity: Identity) => ({ schemaVersion: 1, type: 'website', fields: [{ id: 'name', key: 'name', label: 'Name', type: 'short_text', required: true, options: [] },{ id: 'service', key: 'service', label: 'Service', type: 'short_text', required: true, options: [] },{ id: 'email', key: 'email', label: 'Email', type: 'email', required: false, options: [] }], contactRequired: true, workflow: { assignment: { kind: 'teammate', teammateId: identity.userId }, stage: 'new', tags: [], notifyAssigned: true }, content: { businessName: 'Fixture', title: 'Request service', intro: '', submitLabel: 'Send', thankYou: 'Thanks', unavailableMessage: 'Unavailable', businessEmail: '', businessPhone: '', showBusinessEmail: false, showBusinessPhone: false, privacy: null, consent: null } });
const create = (identity: Identity, title = 'Website') => createCaptureDraft(web, identity, enabled, { workspaceId: identity.workspaceId, requestId: randomUUID(), name: title, configuration: configuration(identity) });
const review = (identity: Identity, sourceId: string) => readCapturePublicationReview(web, identity, enabled, { workspaceId: identity.workspaceId, sourceId }, delivery);
async function command(identity: Identity, sourceId: string, scheduled = false) {
  const current = await review(identity,sourceId); return { workspaceId: identity.workspaceId, sourceId, expectedVersion: current.sourceVersion, draftVersion: current.draftVersion, baseApprovedVersion: current.baseApprovedVersion, configurationVersion: current.configurationVersion, confirmed: true, requestId: randomUUID(), timing: scheduled ? { kind: 'scheduled', at: new Date(Date.now()+30_000).toISOString(), timezone: 'America/New_York' } : { kind: 'now' } };
}
const publish = async (identity: Identity, sourceId: string, scheduled = false) => publishCaptureDraft(web,identity,enabled,await command(identity,sourceId,scheduled),delivery);
// Advancing due time in the fixture avoids sleeps; production transition rows remain immutable.
async function due(id: string) { await db.transaction(async trx => { await trx.raw('ALTER TABLE "capturePublicationTransitions" DISABLE TRIGGER capture_transition_immutable'); await trx('capturePublicationTransitions').where({ id }).update({ scheduledAt: new Date(Date.now()-1000) }); await trx.raw('ALTER TABLE "capturePublicationTransitions" ENABLE TRIGGER capture_transition_immutable'); }); }
try {
 await owner.raw('CREATE DATABASE ??',[name]); created = true;
 await db.migrate.latest({ directory: fileURLToPath(new URL('../migrations',import.meta.url)), loadExtensions: ['.ts'] });
 const a = await workspace(), one = await create(a), second = await create(a,'Second website');
 await check('pilot scope filters before reconciliation and due transition processing; read projections use supplied authority', async () => {
   const included=await workspace(), excluded=await workspace(), first=await create(included), other=await create(excluded);
   const projected=await readCaptureSource(web,included,enabled,{workspaceId:included.workspaceId,sourceId:first.sourceId},undefined,delivery);assert.equal(projected.publicationReview?.ready,true);
   const firstLaunch=await publish(included,first.sourceId,true), otherLaunch=await publish(excluded,other.sourceId,true);await due(firstLaunch.transitionId!);await due(otherLaunch.transitionId!);
   const beforeSource=await db('captureSources').where({id:other.sourceId}).first(), beforeTransition=await db('capturePublicationTransitions').where({id:otherLaunch.transitionId}).first();
   await processCapturePublications(worker,enabled,delivery,100,[]);assert.equal((await db('captureSources').where({id:first.sourceId}).first()).status,'scheduled');
   const scoped={websiteReady:async (_trx: unknown,workspaceId:string)=>{assert.equal(workspaceId,included.workspaceId);return true;},gmailReady:async()=>false};
   assert.equal(await processCapturePublications(worker,enabled,scoped,100,[included.workspaceId]),1);
   assert.equal((await db('captureSources').where({id:first.sourceId}).first()).status,'active');assert.deepEqual(await db('captureSources').where({id:other.sourceId}).first(),beforeSource);assert.deepEqual(await db('capturePublicationTransitions').where({id:otherLaunch.transitionId}).first(),beforeTransition);
   ready=false;await processCapturePublications(worker,enabled,delivery,100,[excluded.workspaceId]);ready=true;
   assert.equal((await db('capturePublicationTransitions').where({id:otherLaunch.transitionId}).first()).state,'blocked');
 });
 await check('real delivery remains blocked; explicit persisted business default satisfies assignment readiness', async () => {
   const result = await readCapturePublicationReview(web,a,enabled,{ workspaceId:a.workspaceId,sourceId:one.sourceId }); assert.equal(result.ready,false); assert.ok(result.checks.some(check=>check.code==='delivery'&&!check.ready));
   await assert.rejects(publishCaptureDraft(web,a,enabled,await command(a,one.sourceId)),(error: CapturePublicationError)=>error.failures.includes('delivery'));
   const draft = await readCaptureSource(web,a,enabled,{workspaceId:a.workspaceId,sourceId:one.sourceId});
   await saveCaptureDraft(web,a,enabled,{workspaceId:a.workspaceId,sourceId:one.sourceId,requestId:randomUUID(),expectedVersion:1,expectedDraftVersion:1,name:'Website',configuration:{...configuration(a),workflow:{assignment:{kind:'default'},stage:'new',tags:[],notifyAssigned:true}}});
   assert.ok((await review(a,one.sourceId)).checks.some(check=>check.code==='workflow'&&check.ready));
   await saveCaptureDraft(web,a,enabled,{workspaceId:a.workspaceId,sourceId:one.sourceId,requestId:randomUUID(),expectedVersion:2,expectedDraftVersion:2,name:'Website',configuration:configuration(a)}); assert.ok(draft.detail.draft);
 });
 await check('concurrent first launches reserve exactly one Free slot', async () => {
   const commands = await Promise.all([command(a,one.sourceId),command(a,second.sourceId)]);
   const results = await Promise.allSettled(commands.map(input=>publishCaptureDraft(web,a,enabled,input,delivery))); assert.equal(results.filter(result=>result.status==='fulfilled').length,1,JSON.stringify(results.map(result=>result.status==='rejected'?{message:result.reason.message,failures:result.reason.failures,code:result.reason.code}:result.value)));
   assert.equal((await db('captureSources').where({workspaceId:a.workspaceId,status:'active'})).length,1); assert.equal((await db('capturePublications').where({workspaceId:a.workspaceId})).length,1);
 });
 const active = await db('captureSources').where({workspaceId:a.workspaceId,status:'active'}).first();
 await check('receipt replay is exact, actor-bound and reauthorized; confirmations and scopes are strict', async () => {
   const operation = await db('captureOperations').where({workspaceId:a.workspaceId,operation:'source.launch'}).first();
   const input = { ...await command(a,active.id), expectedVersion:active.version-1, draftVersion:(await db('captureSourceDrafts').where({sourceId:active.id}).first()).version, baseApprovedVersion:null, configurationVersion:1, requestId:operation.requestId };
   assert.equal((await publishCaptureDraft(web,a,enabled,input,delivery)).sourceId,active.id);
   await assert.rejects(publishCaptureDraft(web,a,enabled,{...input,confirmed:false},delivery),CapturePublicationError);
   await assert.rejects(publishCaptureDraft(web,a,enabled,{...input,timing:{kind:'scheduled',at:new Date(Date.now()+60_000).toISOString(),timezone:'UTC'}},delivery),CapturePublicationError);
   await assert.rejects(publishCaptureDraft(web,a,[],input,delivery),AuthorizationAccessError);
   const foreign=await workspace(); await assert.rejects(readCapturePublicationReview(web,foreign,enabled,{workspaceId:foreign.workspaceId,sourceId:active.id}),AuthorizationAccessError);
 });
 await check('active revisions preserve public identity and use no additional slot', async () => {
   const before=await db('capturePublications').where({sourceId:active.id}).first();
   await beginCaptureRevision(web,a,enabled,{workspaceId:a.workspaceId,sourceId:active.id,expectedVersion:active.version,requestId:randomUUID()});
   const result=await publish(a,active.id); assert.equal(result.configurationVersion,2);
   const after=await db('capturePublications').where({sourceId:active.id}).first(); assert.equal(after.id,before.id); assert.equal(after.publicKey,before.publicKey); assert.equal(after.configurationVersion,2);
   assert.equal((await db('captureSourceVersions').where({sourceId:active.id})).length,2);
 });
 await check('scheduled active revisions retain the old running version until one worker switches it', async () => {
   const source=await db('captureSources').where({id:active.id}).first(); await beginCaptureRevision(web,a,enabled,{workspaceId:a.workspaceId,sourceId:active.id,expectedVersion:source.version,requestId:randomUUID()});
   const scheduled=await publish(a,active.id,true); assert.equal(scheduled.status,'revision_scheduled');
   assert.equal((await db('captureSources').where({id:active.id}).first()).approvedVersion,2); assert.equal((await db('captureSources').where({id:active.id}).first()).status,'active');
   await assert.rejects(beginCaptureRevision(web,a,enabled,{workspaceId:a.workspaceId,sourceId:active.id,expectedVersion:scheduled.sourceVersion,requestId:randomUUID()}));
   await due(scheduled.transitionId!); const applied=await Promise.all([processCapturePublications(worker,enabled,delivery),processCapturePublications(worker,enabled,delivery)]); assert.equal(applied.reduce((sum,value)=>sum+value,0),1);
   assert.equal((await db('captureSources').where({id:active.id}).first()).approvedVersion,3); assert.equal((await db('capturePublicationTransitions').where({id:scheduled.transitionId}).first()).state,'applied');
 });
 await check('first scheduled launch reserves its slot, and revoked readiness never auto-relaunches', async () => {
   const identity=await workspace(), source=await create(identity), extra=await create(identity,'Other'); const scheduled=await publish(identity,source.sourceId,true);
   assert.equal((await review(identity,extra.sourceId)).checks.find(check=>check.code==='capacity')?.ready,false);
   await due(scheduled.transitionId!); ready=false; await processCapturePublications(worker,enabled,delivery); ready=true;
   assert.equal((await db('captureSources').where({id:source.sourceId}).first()).status,'paused');
   await processCapturePublications(worker,enabled,delivery); assert.equal((await db('captureSources').where({id:source.sourceId}).first()).status,'paused');
 });
 await check('cancelled schedules preserve history, retain the slot and cannot be applied', async () => {
   const identity=await workspace(), source=await create(identity), scheduled=await publish(identity,source.sourceId,true);
   const input={workspaceId:identity.workspaceId,sourceId:source.sourceId,expectedVersion:scheduled.sourceVersion,transitionId:scheduled.transitionId,requestId:randomUUID(),confirmed:true};
   const result=await cancelCapturePublication(web,identity,enabled,input); assert.deepEqual(await cancelCapturePublication(web,identity,enabled,input),result);
   assert.equal((await db('captureSources').where({id:source.sourceId}).first()).status,'paused'); assert.equal((await db('capturePublicationTransitions').where({id:scheduled.transitionId}).first()).state,'cancelled');
   await assert.rejects(db('capturePublicationTransitions').where({id:scheduled.transitionId}).update({state:'pending',completedAt:null}),/immutable/);
 });
 await check('publication audit failure rolls back snapshot, public identity, source and receipt', async () => {
   const identity=await workspace(), source=await create(identity); await db.raw(`CREATE FUNCTION capture_fail_publish() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'publish event failure'; END $$`); await db.raw('CREATE TRIGGER capture_fail_publish BEFORE INSERT ON "captureSourceEvents" FOR EACH ROW EXECUTE FUNCTION capture_fail_publish()');
   await assert.rejects(publish(identity,source.sourceId),/publish event failure/); await db.raw('DROP TRIGGER capture_fail_publish ON "captureSourceEvents"');
   assert.equal((await db('captureSourceVersions').where({sourceId:source.sourceId})).length,0); assert.equal((await db('capturePublications').where({sourceId:source.sourceId})).length,0); assert.equal((await db('captureSources').where({id:source.sourceId}).first()).version,1);
 });
 await check('voluntary downgrade identifies actual sources, including paused reservations', async () => {
   const identity=await workspace('standard'), first=await create(identity,'One'), second=await create(identity,'Two'); await publish(identity,first.sourceId); await publish(identity,second.sourceId); await db('captureSources').where({id:second.sourceId}).update({status:'paused'});
   await assert.rejects(db.transaction(trx=>assertCaptureDowngrade(trx,identity.workspaceId,'free',new Date(Date.now()+2*86_400_000))),(error:CaptureCapacityError)=>error.sources.length===2);
   await db('captureSources').where({id:second.sourceId}).update({status:'archived'}); await db.transaction(trx=>assertCaptureDowngrade(trx,identity.workspaceId,'free',new Date(Date.now()+2*86_400_000)));
 });
 await check('a quoted downgrade is rechecked before intent and before provider mutation on retry', async () => {
   const identity=await workspace(), periodEnd=Math.floor(Date.now()/1000)+3600, first=await create(identity);
   process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID='price_capturestandard';process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID='price_capturepremium';
   await db('workspaceSubscriptions').where({workspaceId:identity.workspaceId}).update({plan:'standard',status:'active',paidThrough:new Date(periodEnd*1000),customerId:'cus_capture',subscriptionId:`sub_${identity.workspaceId}`});
   await publish(identity,first.sourceId);let mutations=0;
   const subscription={id:`sub_${identity.workspaceId}`,customer:'cus_capture',metadata:{workspaceId:identity.workspaceId},livemode:false,status:'active',items:{data:[{id:'si_capture',quantity:1,price:{id:'price_capturestandard'},current_period_start:periodEnd-3600,current_period_end:periodEnd}]},latest_invoice:null,schedule:null,cancel_at_period_end:false,pending_update:null};
   const provider={subscriptions:{retrieve:async()=>subscription,update:async()=>{mutations++;return subscription;}}} as unknown as Stripe;
   const quote=await previewPlanChange(web,identity.userId,identity.workspaceId,'free',provider);const second=await create(identity);await publish(identity,second.sourceId);
   await assert.rejects(confirmPlanChange(web,identity.userId,identity.workspaceId,quote.id,false,provider),CaptureCapacityError);assert.equal((await db('billingPlanChanges').where({id:quote.id}).first()).state,'quoted');assert.equal(mutations,0);
   await db('billingPlanChanges').where({id:quote.id}).update({state:'applying'});
   await assert.rejects(confirmPlanChange(web,identity.userId,identity.workspaceId,quote.id,false,provider),CaptureCapacityError);assert.equal(mutations,0);
 });
 await check('admin plan changes require an active paid subscription, block checkout, and hand payment action to the owner', async () => {
   const freeIdentity=await workspace(), identity=await workspace(), periodEnd=Math.floor(Date.now()/1000)+86_400;
   process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID='price_adminstandard';process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID='price_adminpremium';
   await db('workspaceSubscriptions').where({workspaceId:identity.workspaceId}).update({plan:'standard',intendedPlan:'standard',status:'active',paidThrough:new Date(periodEnd*1000),customerId:'cus_adminplan',subscriptionId:`sub_${identity.workspaceId}`});
   const standardPrice={id:process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID, currency:'usd', unit_amount:getWorkspacePlan('standard').monthlyPriceCents, recurring:{interval:'month',interval_count:1,usage_type:'licensed'}};
   const subscription={id:`sub_${identity.workspaceId}`,customer:'cus_adminplan',metadata:{workspaceId:identity.workspaceId},livemode:false,status:'active',items:{data:[{id:'si_adminplan',quantity:1,price:standardPrice,current_period_start:periodEnd-86_400,current_period_end:periodEnd}]},latest_invoice:null,schedule:null,cancel_at_period_end:false,pending_update:null};
   let mutations=0;
   const provider={
     prices:{retrieve:async (id:string)=>({id,livemode:false,active:true,currency:'usd',unit_amount:id===process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID?getWorkspacePlan('standard').monthlyPriceCents:getWorkspacePlan('premium').monthlyPriceCents,recurring:{interval:'month',interval_count:1,usage_type:'licensed'}})},
     invoices:{createPreview:async()=>({currency:'usd',amount_due:1200})},
     subscriptions:{
       retrieve:async()=>subscription,
       update:async (_id:string, input:{items?:unknown[]})=>{
         mutations++;
         return input.items ? {...subscription,pending_update:{expires_at:periodEnd},latest_invoice:{status:'open',created:periodEnd-86_400,confirmation_secret:{client_secret:'pi_adminsecret'}}} : subscription;
       },
     },
   } as unknown as Stripe;
   await assert.rejects(previewAdminPlanChange(db,freeIdentity.workspaceId,'standard',provider),/active paid subscription/);
   const checkout=await previewPlanChange(db,freeIdentity.userId,freeIdentity.workspaceId,'standard',provider);
   await assert.rejects(confirmAdminPlanChange(db,'fixture-staff',freeIdentity.workspaceId,checkout.id,provider),/cannot start checkout/);
   assert.equal(mutations,0);
   const quote=await previewAdminPlanChange(db,identity.workspaceId,'premium',provider);
   assert.equal(quote.kind,'upgrade');
   assert.equal((await db('billingPlanChanges').where({id:quote.id}).first()).actorId,identity.userId);
   const result=await confirmAdminPlanChange(db,'fixture-staff',identity.workspaceId,quote.id,provider);
   assert.deepEqual(result,{status:'customer_action_required',plan:'premium',effectiveAt:quote.effectiveAt,handoff:'workspace_owner_billing'});
   assert.equal(JSON.stringify(result).includes('pi_adminsecret'),false);
   assert.equal((await db('billingPlanChanges').where({id:quote.id}).first()).state,'payment');
 });
 await check('forced reductions block every published source and deliver deduplicated in-app admin notices', async () => {
   const identity=await workspace('standard'), first=await create(identity,'One'), second=await create(identity,'Two'); await publish(identity,first.sourceId); await publish(identity,second.sourceId);
   await clearPlanOverride(admin,{workspaceId:identity.workspaceId,reason:'Fixture loss',actor:{type:'staff',id:'fixture-staff'}});
   assert.equal((await captureCurrentBlocks(web,identity.workspaceId)).get(first.sourceId),'source_capacity');
   await processCapturePublications(worker,enabled,delivery); await processCapturePublications(worker,enabled,delivery);
   for(const id of [first.sourceId,second.sourceId])assert.equal((await db('captureSources').where({id}).first()).status,'paused');
   const notices=await readNotifications(web,identity,enabled); assert.equal(notices.items.filter(item=>item.kind==='capture').length,2); await markNotificationRead(web,identity,enabled,notices.items[0].id); assert.equal((await readNotifications(web,identity,enabled)).unreadCount,1);
   await applyPlanOverride(admin,{workspaceId:identity.workspaceId,plan:'standard',endsAt:new Date(Date.now()+86_400_000),reason:'Restored',actor:{type:'staff',id:'fixture-staff'}}); await processCapturePublications(worker,enabled,delivery);
   assert.equal((await db('captureSources').where({id:first.sourceId}).first()).status,'paused');
 });
 await check('a loss queued before access recovery is still enforced', async () => {
   const identity=await workspace('standard'), first=await create(identity), second=await create(identity); await publish(identity,first.sourceId); await publish(identity,second.sourceId);
   await clearPlanOverride(admin,{workspaceId:identity.workspaceId,reason:'Loss',actor:{type:'staff',id:'fixture-staff'}}); await applyPlanOverride(admin,{workspaceId:identity.workspaceId,plan:'premium',endsAt:new Date(Date.now()+86_400_000),reason:'Recovery',actor:{type:'staff',id:'fixture-staff'}});
   await processCapturePublications(worker,enabled,delivery); assert.equal((await db('captureSources').where({id:first.sourceId}).first()).block,'source_capacity');
 });
 await check('override expiry queues and enforces loss once; staff cannot alter capture source rows', async () => {
   const identity=await workspace('standard'), first=await create(identity), second=await create(identity); await publish(identity,first.sourceId); await publish(identity,second.sourceId);
   await db('workspaces').where({id:identity.workspaceId}).update({planOverrideEndsAt:new Date(Date.now()-1000)}); await recordExpiredPlanOverrides(worker); assert.equal(await recordExpiredPlanOverrides(worker),0); await processCapturePublications(worker,enabled,delivery);
   assert.equal((await db('captureSources').where({id:first.sourceId}).first()).block,'source_capacity');
   await assert.rejects(admin('captureSources').where({id:first.sourceId}).update({block:'none'}),(error:{code?:string})=>error.code==='42501');
   await assert.rejects(admin('captureAccessChecks').where({workspaceId:identity.workspaceId}).update({processedAt:new Date()}),(error:{code?:string})=>error.code==='42501');
 });
 await check('Gmail entitlement loss blocks Gmail even when one source fits Free capacity', async () => {
   const identity=await workspace('standard'), sourceId=randomUUID(); const fields=configuration(identity).fields;
   const config={schemaVersion:1,type:'gmail',fields,workflow:configuration(identity).workflow,contactRequired:true,connectionId:randomUUID(),accountEmail:'capture@example.test',rules:{phrases:['quote'],location:'both',mode:'all'},mappings:fields.map(field=>({fieldId:field.id,instruction:'Find the value'})),sampleId:randomUUID()};
   await db.transaction(async trx=>{await trx('captureSources').insert({id:sourceId,workspaceId:identity.workspaceId,name:'Gmail fixture',type:'gmail',version:1,status:'paused',approvedVersion:1});await trx('captureSourceVersions').insert({id:randomUUID(),workspaceId:identity.workspaceId,sourceId,sourceType:'gmail',configurationVersion:1,definitionVersion:1,workflowVersion:1,configuration:JSON.stringify(config),approvedBy:identity.userId,approvedAt:new Date()});});
   await clearPlanOverride(admin,{workspaceId:identity.workspaceId,reason:'Free',actor:{type:'staff',id:'fixture-staff'}});await processCapturePublications(worker,enabled,delivery);
   assert.equal((await db('captureSources').where({id:sourceId}).first()).block,'entitlement');
 });
 await check('the worker reauthorizes the approving Office user and restores blocked work as a draft', async () => {
   const identity=await workspace(), source=await create(identity), userId=`office-${randomUUID()}`, timestamp=new Date();
   await db('users').insert({id:userId,name:'Office fixture',email:`${userId}@example.test`,createdAt:timestamp,updatedAt:timestamp,termsVersion:'test',termsAcceptedAt:timestamp});await db('workspaceMemberships').insert({workspaceId:identity.workspaceId,userId,role:'office'});
   const office={workspaceId:identity.workspaceId,userId}, input=await command(office,source.sourceId,true), scheduled=await publishCaptureDraft(web,office,enabled,input,delivery);
   await db('workspaceRolePolicies').where({workspaceId:identity.workspaceId,role:'office',permission:'leadCapture.activate'}).delete();await due(scheduled.transitionId!);await processCapturePublications(worker,enabled,delivery);
   const row=await db('captureSources').where({id:source.sourceId}).first();assert.equal(row.status,'paused');assert.ok(row.draftId);assert.equal((await db('capturePublicationTransitions').where({id:scheduled.transitionId}).first()).state,'blocked');
   await assert.rejects(publishCaptureDraft(web,office,enabled,input,delivery),AuthorizationAccessError);
 });
 await check('workspace suspension holds due publication work until access is restored', async () => {
   const identity=await workspace(), source=await create(identity), scheduled=await publish(identity,source.sourceId,true);await due(scheduled.transitionId!);
   await db('workspaces').where({id:identity.workspaceId}).update({suspendedAt:new Date(),suspendedReason:'Fixture'});await processCapturePublications(worker,enabled,delivery);
   assert.equal((await db('captureSources').where({id:source.sourceId}).first()).status,'scheduled');
   assert.equal((await db('capturePublicationTransitions').where({id:scheduled.transitionId}).first()).state,'pending');
   await db('workspaces').where({id:identity.workspaceId}).update({suspendedAt:null,suspendedReason:null});await processCapturePublications(worker,enabled,delivery);
   assert.equal((await db('captureSources').where({id:source.sourceId}).first()).status,'active');
   assert.equal((await db('capturePublicationTransitions').where({id:scheduled.transitionId}).first()).state,'applied');
 });
 await check('pending effective downgrades constrain new publication even before billing changes', async () => {
   const identity=await workspace('standard'), first=await create(identity), second=await create(identity); await publish(identity,first.sourceId);
   await db('billingPlanChanges').insert({id:randomUUID(),workspaceId:identity.workspaceId,actorId:identity.userId,targetPlan:'free',kind:'free',state:'scheduled',basis:JSON.stringify({end:Math.floor((Date.now()+2*86_400_000)/1000)}),amountDue:0,prorationAt:Math.floor(Date.now()/1000)});
   assert.equal((await review(identity,second.sourceId)).checks.find(check=>check.code==='capacity')?.ready,false);
 });
 await check('strict reviews and Premium capacity do not fabricate publication URLs', async () => {
   const identity=await workspace('premium'); for(let i=0;i<6;i++){const source=await create(identity);await publish(identity,source.sourceId);}
   const source=await create(identity); const result=capturePublicationReviewSchema.parse(await review(identity,source.sourceId)); assert.equal(result.limit,null); assert.equal(result.ready,true); assert.equal(JSON.stringify(result).includes('http'),false);
   assert.equal((await db('captureReceipts')).length,0); assert.equal((await db('leads')).length,0);
 });
 console.log(`Capture publication rehearsal passed (${checks} groups).`);
} finally { await Promise.all([web.destroy(),worker.destroy(),admin.destroy()]); await db.destroy(); if(created)await owner.raw('DROP DATABASE ??',[name]); await owner.destroy(); }
