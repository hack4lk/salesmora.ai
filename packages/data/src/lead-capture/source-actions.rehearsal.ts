import { proposeCaptureSource, decideCaptureSourceProposal, readCaptureSourceProposal, captureSourceEvidenceAllowed, visibleCaptureSourceTicket } from './source-proposals';
import { proposeCaptureSetup, captureSetupEvidenceAllowed, visibleCaptureSetupTicket } from './setup-proposals';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createDatabase } from '../database';
import { migrateFreshBaseline } from '../baseline-runner';
import { initializeWorkspacePolicy, withWorkspaceAuthorization, AuthorizationAccessError } from '../authorization/store';
import { permissionIds, initialCaptureSetupConfiguration, type CaptureSourceInput, type CaptureSourceProposalView } from '@salesmora/contracts';
import { createCaptureDraft, readCaptureSource, captureDraftFingerprint, CaptureDraftConflictError } from './store';
import { publishCaptureDraft, readCapturePublicationReview, changeCapturePublication, CapturePublicationError } from './publication';
import { changeCaptureLifecycle } from './lifecycle';
import { duplicateCaptureSource } from './duplicate';
import { withCanonicalProposalStorage } from '../chat-proposals';
const canonical = true;
const proposalTable = canonical ? 'chatProposals' : 'chatCaptureSourceProposals';
const setupTable = canonical ? 'chatProposals' : 'chatCaptureSetupProposals';
const auditTable = canonical ? 'chatProposalAudit' : 'chatCaptureSourceAudit';
process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') || !['localhost','127.0.0.1'].includes(new URL(connection).hostname)) throw Error('A separate disposable local test connection is required.');
const owner = createDatabase(connection), name = `capture_actions_${randomUUID().replaceAll('-','')}_test`, url = new URL(connection); url.pathname = `/${name}`;
const db = createDatabase(url.toString()), runtimeUrl = new URL(url); runtimeUrl.searchParams.set('options','-c role=salesmora_web'); const runtime = createDatabase(runtimeUrl.toString());
const legacyQueries: string[] = [];
const canonicalSQL: string[] = [];
runtime.on('query', ({ sql }: { sql: string }) => {
  if (canonical) canonicalSQL.push(sql);
  if (canonical && /"chatCapture(?:Setup|Source)(?:Proposals|Audit)"/.test(sql)) legacyQueries.push(sql);
});
const identity = { workspaceId: randomUUID(), userId: `actions-${randomUUID()}` }, stranger = { ...identity, userId: `field-${randomUUID()}` };
const enabled = permissionIds, delivery = { websiteReady: async () => true, gmailReady: async () => false }, off = { websiteReady: async () => false, gmailReady: async () => false };
const config = initialCaptureSetupConfiguration('website', { businessName: 'Fictional source actions', businessEmail: '', businessPhone: '' });
let created = false, checks = 0;
async function check(label: string, work: () => Promise<void>) { await work(); checks++; console.log(`PASS ${label}`); }
async function publish(sourceId: string, scheduled = false) {
  const review = await readCapturePublicationReview(runtime, identity, enabled, { workspaceId: identity.workspaceId, sourceId }, delivery);
  return publishCaptureDraft(runtime, identity, enabled, { workspaceId: identity.workspaceId, sourceId, requestId: randomUUID(), confirmed: true, expectedVersion: review.sourceVersion, draftVersion: review.draftVersion, baseApprovedVersion: review.baseApprovedVersion, configurationVersion: review.configurationVersion, timing: scheduled ? { kind: 'scheduled', at: new Date(Date.now()+86400000).toISOString(), timezone: 'America/New_York' } : { kind: 'now' } }, delivery);
}
const reference = (view: CaptureSourceProposalView) => ({ workspaceId: identity.workspaceId, proposalId: view.ticket.proposalId, inputHash: view.ticket.inputHash });
const confirm = (view: CaptureSourceProposalView) => decideCaptureSourceProposal(runtime, identity, enabled, { ...reference(view), decision: 'confirm' }, delivery, 'fixture-delivery');
async function prepare(input: CaptureSourceInput, threadId = randomUUID()) {
  await db('chatThreads').insert({ ...identity, id: threadId }).onConflict('id').ignore();
  const id = randomUUID();
  await db('chatTurns').insert({ ...identity, id, threadId, clientTurnId: randomUUID(), requestHash: 'fictional', surfaceKey: 'home', state: 'running', leaseUntil: new Date(Date.now() + 60000) });
  const view = await proposeCaptureSource(runtime, identity, enabled, id, input, new AbortController().signal, delivery, 'fixture-delivery');
  assert.equal(captureDraftFingerprint(await proposeCaptureSource(runtime, identity, enabled, id, input, new AbortController().signal, delivery, 'fixture-delivery')), captureDraftFingerprint(view));
  await assert.rejects(proposeCaptureSource(runtime, identity, enabled, id, { ...input, operation: input.operation === 'pause' ? 'archive' : 'pause', timing: null, name: null, configurationKind: null }, new AbortController().signal, delivery, 'fixture-delivery'), CaptureDraftConflictError);
  await db('chatTurns').where({ id }).update({ state: 'completed' });
  return view;
}
const action = (sourceId: string, operation: CaptureSourceInput['operation'], timing: CaptureSourceInput['timing'] = null): CaptureSourceInput =>
  ({ operation, sourceId, timing, name: null, configurationKind: null });
const localTime = (days: number) => new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
}).format(new Date(Date.now() + days * 86400000)).replace(' ', 'T');
const run = async () => {
try {
  await owner.raw('CREATE DATABASE ??',[name]); created = true;
  await migrateFreshBaseline(db);
  for (const person of [identity,stranger]) await db('users').insert({ id:person.userId,name:'Fictional source tester',email:`${person.userId}@example.test`,createdAt:new Date(),updatedAt:new Date(),termsVersion:'test',termsAcceptedAt:new Date() });
  await db.transaction(async trx => { await trx('workspaces').insert({ id:identity.workspaceId,ownerId:identity.userId,businessName:'Fictional actions',businessType:'plumbing',postalCode:'',serviceRange:'',timezone:'America/New_York',planOverride:'standard',planOverrideId:randomUUID(),planOverrideEndsAt:new Date(Date.now()+86400000),planOverrideReason:'Disposable fixture' }); for (const person of [identity,stranger]) await trx('workspaceMemberships').insert({...person,role:person===identity?'owner':'field'}); await initializeWorkspacePolicy(trx,identity); });
  const saved = await createCaptureDraft(runtime,identity,enabled,{workspaceId:identity.workspaceId,requestId:randomUUID(),name:'Fictional scheduled form',configuration:config});
  const scheduled = await publish(saved.sourceId,true);
  let changed: Awaited<ReturnType<typeof changeCapturePublication>>;
  const change = {workspaceId:identity.workspaceId,sourceId:saved.sourceId,expectedVersion:scheduled.sourceVersion,transitionId:scheduled.transitionId,requestId:randomUUID(),confirmed:true,timing:{kind:'scheduled',at:new Date(Date.now()+172800000).toISOString(),timezone:'America/New_York'}};
  await check('schedule replacement retains approved paper and exact retries, with one pending transition',async()=>{
    changed = await changeCapturePublication(runtime,identity,enabled,change,delivery);
    assert.equal(changed.configurationVersion,scheduled.configurationVersion); assert.notEqual(changed.transitionId,scheduled.transitionId);
    assert.deepEqual(await changeCapturePublication(runtime,identity,enabled,change,delivery),changed);
    assert.equal((await db('capturePublicationTransitions').where({sourceId:saved.sourceId,state:'pending'})).length,1);
    assert.equal((await db('captureSourceVersions').where({sourceId:saved.sourceId})).length,1);
    await assert.rejects(changeCapturePublication(runtime,stranger,enabled,change,delivery),AuthorizationAccessError);
  });
  await check('launch-now rechecks delivery and stale schedule bindings atomically',async()=>{
    const command={...change,expectedVersion:changed.sourceVersion,transitionId:changed.transitionId,requestId:randomUUID(),timing:{kind:'now'}};
    await assert.rejects(changeCapturePublication(runtime,identity,enabled,command,off),CapturePublicationError);
    assert.equal((await db('captureSources').where({id:saved.sourceId}).first()).status,'scheduled');
    const active=await changeCapturePublication(runtime,identity,enabled,command,delivery); assert.equal(active.status,'active');
    await assert.rejects(changeCapturePublication(runtime,identity,enabled,{...change,requestId:randomUUID()},delivery),CapturePublicationError);
  });
  await check('archive and restore preserve public identity, restore paused, and deny revoked grants',async()=>{
    const source=await db('captureSources').where({id:saved.sourceId}).first(), publication=await db('capturePublications').where({sourceId:source.id}).first();
    const archived=await changeCaptureLifecycle(runtime,identity,enabled,{workspaceId:identity.workspaceId,sourceId:source.id,expectedVersion:source.version,requestId:randomUUID(),action:'archive',confirmed:true},delivery);
    const command={workspaceId:identity.workspaceId,sourceId:source.id,expectedVersion:archived.sourceVersion,requestId:randomUUID(),action:'restore',confirmed:true};
    await assert.rejects(changeCaptureLifecycle(runtime,identity,enabled.filter(p=>p!=='leadCapture.archive'),command,delivery),AuthorizationAccessError);
    const restored=await changeCaptureLifecycle(runtime,identity,enabled,command,off); assert.deepEqual(await changeCaptureLifecycle(runtime,identity,enabled,command,off),restored);
    assert.equal((await db('captureSources').where({id:source.id}).first()).status,'paused'); assert.deepEqual(await db('capturePublications').where({sourceId:source.id}).first(),publication);
  });
  await check('duplicate copies only the selected version into one new draft without public artifacts',async()=>{
    const source=await db('captureSources').where({id:saved.sourceId}).first(), command={workspaceId:identity.workspaceId,sourceId:source.id,expectedVersion:source.version,requestId:randomUUID(),confirmed:true,name:'Fictional form copy',configuration:{kind:'approved',version:source.approvedVersion}};
    const [one,two]=await Promise.all([duplicateCaptureSource(runtime,identity,enabled,command),duplicateCaptureSource(runtime,identity,enabled,command)]); assert.deepEqual(one,two);
    const view=await readCaptureSource(runtime,identity,enabled,{workspaceId:identity.workspaceId,sourceId:one.sourceId}); assert.equal(view.detail.source.status,'draft'); assert.equal(view.detail.approved,null); assert.equal(view.installation,null); assert.deepEqual(view.detail.draft!.configuration,config);
    await assert.rejects(duplicateCaptureSource(runtime,stranger,enabled,command),AuthorizationAccessError);
    await assert.rejects(duplicateCaptureSource(runtime,identity,enabled,{...command,name:'Changed replay name'}));
  });
  await check('restoration acquires capacity rather than overbooking a free-plan slot',async()=>{
    const source=await db('captureSources').where({id:saved.sourceId}).first();
    const archived=await changeCaptureLifecycle(runtime,identity,enabled,{workspaceId:identity.workspaceId,sourceId:source.id,expectedVersion:source.version,requestId:randomUUID(),action:'archive',confirmed:true},delivery);
    await db('workspaces').where({id:identity.workspaceId}).update({planOverride:null,planOverrideId:null,planOverrideEndsAt:null,planOverrideReason:null});
    const other=await createCaptureDraft(runtime,identity,enabled,{workspaceId:identity.workspaceId,requestId:randomUUID(),name:'Occupies free slot',configuration:config}); await publish(other.sourceId);
    await assert.rejects(changeCaptureLifecycle(runtime,identity,enabled,{workspaceId:identity.workspaceId,sourceId:source.id,expectedVersion:archived.sourceVersion,requestId:randomUUID(),action:'restore',confirmed:true},delivery),error=>error instanceof CapturePublicationError&&error.failures.includes('capacity'));
    assert.equal((await db('captureSources').where({id:source.id}).first()).status,'archived');
  });
  await check('durable source proposals confirm once, remain author-private and supersede setup intent',async()=>{
    const source=await db('captureSources').where({workspaceId:identity.workspaceId,status:'active'}).first();
    const threadId=randomUUID();await db('chatThreads').insert({...identity,id:threadId});
    const makeTurn=async()=>{const id=randomUUID();await db('chatTurns').insert({...identity,id,threadId,clientTurnId:randomUUID(),requestHash:'fictional',surfaceKey:'lead_capture.detail',state:'running',leaseUntil:new Date(Date.now()+60000),pageContext:JSON.stringify({captureContext:{surface:'lead_capture.detail',sourceId:source.id}})});return id;};
    const setupTurn=await makeTurn();
    const setup=await proposeCaptureSetup(runtime,identity,enabled,setupTurn,{operation:'create_source',sourceId:null,name:'Unconfirmed setup',sourceType:'website',fields:null,contactRequired:null,workflow:null,brief:null,content:null,rules:null,mappings:null,findings:null},new AbortController().signal);
    await db('chatTurns').where({id:setupTurn}).update({state:'completed'});
    const id=await makeTurn(),proposal=await proposeCaptureSource(runtime,identity,enabled,id,{operation:'pause',sourceId:null,name:null,configurationKind:null,timing:null},new AbortController().signal,delivery);
    assert.equal((await db('captureSources').where({id:source.id}).first()).status,'active');
    assert.equal((await db(setupTable).where({id:setup.ticket.proposalId}).first()).state,'superseded');
    const reference={workspaceId:identity.workspaceId,proposalId:proposal.ticket.proposalId,inputHash:proposal.ticket.inputHash};
    await assert.rejects(decideCaptureSourceProposal(runtime,identity,enabled,{...reference,decision:'confirm'},delivery),AuthorizationAccessError);
    await db('chatTurns').where({id}).update({state:'completed'});
    await assert.rejects(readCaptureSourceProposal(runtime,stranger,enabled,reference),AuthorizationAccessError);
    const [one,two]=await Promise.all([1,2].map(()=>decideCaptureSourceProposal(runtime,identity,enabled,{...reference,decision:'confirm'},delivery)));assert.deepEqual(one,two);assert.equal(one.receipt?.kind,'source');assert.equal((await db('captureSources').where({id:source.id}).first()).status,'paused');
    const copy=await db('captureSources').where({workspaceId:identity.workspaceId,status:'draft'}).first();
    const next=await makeTurn(),blocked=await proposeCaptureSource(runtime,identity,enabled,next,{operation:'publish',sourceId:copy.id,name:null,configurationKind:null,timing:{kind:'now',localDateTime:null}},new AbortController().signal,off);
    assert.equal(blocked.ready,false);await db('chatTurns').where({id:next}).update({state:'completed'});
    await assert.rejects(decideCaptureSourceProposal(runtime,identity,enabled,{workspaceId:identity.workspaceId,proposalId:blocked.ticket.proposalId,inputHash:blocked.ticket.inputHash,decision:'confirm'},off),CapturePublicationError);
    const duplicateTurn=await makeTurn(),duplicate=await proposeCaptureSource(runtime,identity,enabled,duplicateTurn,{operation:'duplicate',sourceId:source.id,name:'Source proposal copy',configurationKind:'approved',timing:null},new AbortController().signal,delivery);await db('chatTurns').where({id:duplicateTurn}).update({state:'completed'});
    const receipt=await decideCaptureSourceProposal(runtime,identity,enabled,{workspaceId:identity.workspaceId,proposalId:duplicate.ticket.proposalId,inputHash:duplicate.ticket.inputHash,decision:'confirm'},delivery);assert.equal(receipt.receipt?.kind,'draft');
    const audit=await db(auditTable).first();await assert.rejects(runtime(auditTable).where({id:audit.id}).update({action:'forged'}));
    await db('chatThreads').where({...identity,id:threadId}).delete();assert.equal((await db(proposalTable).where({threadId})).length,0);assert.ok((await db(auditTable)).length>0);
  });
  await db('workspaces').where({ id: identity.workspaceId }).update({ planOverride: 'standard', planOverrideId: randomUUID(), planOverrideEndsAt: new Date(Date.now() + 86400000), planOverrideReason: 'Disposable adapter coverage' });
  await check('publication/schedule and lifecycle proposals preserve native receipts, request replay and delivery bindings', async () => {
    const saved = await createCaptureDraft(runtime, identity, enabled, { workspaceId: identity.workspaceId, requestId: randomUUID(), name: 'Scheduled proposal fixture', configuration: config });
    const launch = await prepare(action(saved.sourceId, 'publish', { kind: 'scheduled', localDateTime: localTime(2) }));
    await assert.rejects(decideCaptureSourceProposal(runtime, identity, enabled, { ...reference(launch), decision: 'confirm' }, delivery, 'changed-delivery'), CaptureDraftConflictError);
    const launched = await confirm(launch); assert.equal(launched.receipt?.kind, 'publication'); assert.deepEqual(await confirm(launch), launched);
    const reschedule = await prepare(action(saved.sourceId, 'change_schedule', { kind: 'scheduled', localDateTime: localTime(3) }));
    assert.equal((await confirm(reschedule)).receipt?.kind, 'publication');
    const cancelSchedule = await prepare(action(saved.sourceId, 'cancel_schedule'));
    assert.equal((await confirm(cancelSchedule)).receipt?.kind, 'publication');
    const resume = await prepare(action(saved.sourceId, 'resume'));
    assert.equal((await confirm(resume)).receipt?.kind, 'source'); assert.equal((await db('captureSources').where({ id: saved.sourceId }).first()).status, 'active');
    for (const operation of ['pause', 'resume', 'archive', 'restore'] as const) {
      const prepared = await prepare(action(saved.sourceId, operation)), confirmed = await confirm(prepared);
      assert.equal(confirmed.receipt?.kind, 'source'); assert.deepEqual(await confirm(prepared), confirmed);
    }
    const cancelled = await prepare(action(saved.sourceId, 'archive'));
    const no = await decideCaptureSourceProposal(runtime, identity, enabled, { ...reference(cancelled), decision: 'cancel' }, delivery);
    assert.equal(no.ticket.state, 'cancelled');
    assert.deepEqual(await decideCaptureSourceProposal(runtime, identity, enabled, { ...reference(cancelled), decision: 'cancel' }, delivery), no);
  });
  await check('setup replaces source intent once and both evidence/visible paths use the selected store', async () => {
    const saved = await createCaptureDraft(runtime, identity, enabled, { workspaceId: identity.workspaceId, requestId: randomUUID(), name: 'Cross-family source', configuration: config });
    await publish(saved.sourceId);
    const pending = await prepare(action(saved.sourceId, 'pause')), origin = await db(proposalTable).where({ id: pending.ticket.proposalId }).first();
    const id = randomUUID();
    await db('chatTurns').insert({ ...identity, id, threadId: origin.threadId, clientTurnId: randomUUID(), requestHash: 'fictional', surfaceKey: 'home', state: 'running', leaseUntil: new Date(Date.now() + 60000) });
    const before = canonicalSQL.length;
    const setup = await proposeCaptureSetup(runtime, identity, enabled, id, { operation: 'create_source', sourceId: null, name: 'Replacement setup', sourceType: 'website', fields: null, contactRequired: null, workflow: null, brief: null, content: null, rules: null, mappings: null, findings: null }, new AbortController().signal);
    if (canonical) assert.equal(canonicalSQL.slice(before).filter(sql => /select.*"chatProposals".*for update/i.test(sql)).length, 1);
    await db('chatTurns').where({ id }).update({ state: 'completed' });
    assert.equal((await db(proposalTable).where({ id: pending.ticket.proposalId }).first()).state, 'superseded');
    await assert.rejects(confirm(pending), CaptureDraftConflictError);
    await withWorkspaceAuthorization(runtime, identity, enabled, false, async (trx, context) => {
      assert.equal(await captureSourceEvidenceAllowed(trx, context, [pending.ticket.proposalId]), true);
      assert.equal((await visibleCaptureSourceTicket(trx, context, origin.turnId))?.state, 'superseded');
      assert.equal(await captureSetupEvidenceAllowed(trx, context, [setup.ticket.proposalId]), true);
      assert.equal((await visibleCaptureSetupTicket(trx, context, id))?.proposalId, setup.ticket.proposalId);
    });
  });
  await check('publication audit failure rolls back native publication/version before safe retry', async () => {
    const saved = await createCaptureDraft(runtime, identity, enabled, { workspaceId: identity.workspaceId, requestId: randomUUID(), name: 'Publication rollback fixture', configuration: config });
    const prepared = await prepare(action(saved.sourceId, 'publish', { kind: 'now', localDateTime: null }));
    const source = await db('captureSources').where({ id: saved.sourceId }).first();
    await db.raw(`CREATE FUNCTION rehearsal_fail_source_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'rehearsal audit failure'; END $$`);
    await db.raw(`CREATE TRIGGER rehearsal_fail_source_audit BEFORE INSERT ON ?? FOR EACH ROW WHEN (NEW.action = 'confirmed') EXECUTE FUNCTION rehearsal_fail_source_audit()`, [auditTable]);
    try { await assert.rejects(confirm(prepared), /rehearsal audit failure/); }
    finally { await db.raw('DROP TRIGGER rehearsal_fail_source_audit ON ??', [auditTable]); await db.raw('DROP FUNCTION rehearsal_fail_source_audit()'); }
    assert.deepEqual(await db('captureSources').where({ id: saved.sourceId }).first(), source);
    assert.equal((await db('capturePublications').where({ sourceId: saved.sourceId })).length, 0);
    assert.equal((await db('captureSourceVersions').where({ sourceId: saved.sourceId })).length, 0);
    assert.equal((await db(proposalTable).where({ id: prepared.ticket.proposalId }).first()).state, 'pending');
    const [one, two] = await Promise.all([confirm(prepared), confirm(prepared)]);
    assert.deepEqual(one, two); assert.equal((await db('capturePublications').where({ sourceId: saved.sourceId })).length, 1);
    if (canonical) {
      const row = await db('chatProposals').where({ id: prepared.ticket.proposalId }).first();
      await db('chatProposals').where({ family: 'captureSource', id: row.id }).delete();
      await assert.rejects(readCaptureSourceProposal(runtime, identity, enabled, reference(prepared), 'fixture-delivery'), AuthorizationAccessError);
    }
  });
  assert.deepEqual(legacyQueries, [], 'Canonical runtime must never query legacy proposal/audit tables.');
  console.log(`PASS ${checks} capture source action groups (${canonical ? 'canonical' : 'legacy'})`);
} finally {await Promise.all([runtime.destroy(),db.destroy()]);if(created)await owner.raw('DROP DATABASE ?? WITH (FORCE)',[name]);await owner.destroy();}
};
await withCanonicalProposalStorage(run);
