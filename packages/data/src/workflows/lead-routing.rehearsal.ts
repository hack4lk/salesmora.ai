import { permissionIds } from "@salesmora/contracts";
import { withWorkspaceAuthorization } from "../authorization/store";
import { prepareWorkflowInTransaction, decideWorkflow } from "./proposals";
import { readWorkflows, changeWorkflow } from "./store";
import { readWorkflowEditData, editWorkflow, workflowEditValues } from "./editing";
import { resolveLeadRouting, routingSource } from "./routing";
import { readNotifications } from "../notifications/store";
import { prepareIntakeReview, decideIntake } from "../lead-capture/intake-store";
import { previewWorkflowRun } from "./manual-runs";
/** Isolated local database only. Provider authority is explicitly simulated; no external calls. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { CaptureDraftConfiguration, CapturePublicSubmission, CaptureSubmissionContext, PermissionId } from '@salesmora/contracts';
import { createDatabase } from '../database';
import { migrateFreshBaseline } from '../baseline-runner';
import { initializeWorkspacePolicy } from '../authorization/store';
import { createCaptureDraft } from '../lead-capture/store';
import { readCapturePublicationReview, publishCaptureDraft, captureConfigurationChecks } from '../lead-capture/publication';
import { prepareCaptureSubmission, commitCaptureSubmission, type CaptureSubmissionLimits } from '../lead-capture/submissions';
import { processAssignmentEmails } from '../notifications/delivery';
const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url)); if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') || !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw Error('Separate local test connection required.');
const name = `routing_${randomUUID().replaceAll('-', '')}_test`, owner = createDatabase(connection), url = new URL(connection); url.pathname = `/${name}`;
const db = createDatabase(url.toString()), roleURL = new URL(url); roleURL.searchParams.set('options', '-c role=salesmora_web'); const web = createDatabase(roleURL.toString()); roleURL.searchParams.set('options', '-c role=salesmora_worker'); const worker = createDatabase(roleURL.toString());
const enabled: PermissionId[] = [...permissionIds];
const limits: CaptureSubmissionLimits = { challengeAfter: 5, hardLimit: 20, sourceRequestsPerMinute: 1000, maxPendingItems: 10000, maxRetainedBytes: 67108864 };
const delivery = { websiteReady: async () => true, gmailReady: async () => false };
let created = false, groups = 0; const priorBilling = process.env.BILLING_SANDBOX_ENABLED;
async function check(label: string, run: () => Promise<void>) { await run(); groups++; console.log(`PASS ${label}`); }
async function fixture(notify = true, postal = false) {
  const identity = { workspaceId: randomUUID(), userId: `submission-${randomUUID()}` }, now = new Date();
  await db('users').insert({ id: identity.userId, name: 'Fixture owner', email: `${identity.userId}@example.test`, emailVerified: true, createdAt: now, updatedAt: now, termsVersion: 'test', termsAcceptedAt: now });
  await db.transaction(async trx => { await trx('workspaces').insert({ id: identity.workspaceId, ownerId: identity.userId, businessName: 'Fixture business', businessType: 'plumbing', postalCode: '', serviceRange: '', timezone: 'America/New_York' }); await trx('workspaceMemberships').insert({ ...identity, role: 'owner' }); await initializeWorkspacePolicy(trx, identity); await trx('workspaceSubscriptions').insert({ workspaceId: identity.workspaceId, plan: 'free', catalogVersion: 'fixture' }); });
  const configuration: CaptureDraftConfiguration = { schemaVersion: 1, type: 'website', contactRequired: true,
    fields: [{ id: 'name', key: 'name', label: 'Name', type: 'short_text', required: true, options: [] }, { id: 'service', key: 'service', label: 'Service', type: 'dropdown', required: true, options: [{ id: 'repair', label: 'Repair' }, { id: 'install', label: 'Installation' }] }, { id: 'email', key: 'email', label: 'Email', type: 'email', required: false, options: [] }, { id: 'custom', key: 'custom', label: 'Project details', type: 'long_text', required: false, options: [] }],
    workflow: { assignment: { kind: 'default' }, stage: 'contacted', tags: ['Website', 'Plumbing'], notifyAssigned: notify },
    content: { businessName: 'Fixture business', title: 'Request service', intro: '', submitLabel: 'Send request', thankYou: 'Thanks', unavailableMessage: 'Call our team', businessEmail: '', businessPhone: '', showBusinessEmail: false, showBusinessPhone: false, consent: { id: 'contact', version: 1, label: 'Contact me about this request.', required: true }, privacy: { label: 'Privacy', href: 'https://example.test/privacy' } } };
  if(postal){configuration.postalCountryCode='US';configuration.fields!.push({id:'postal',key:'postalCode',label:'ZIP code (US)',type:'short_text',required:true,options:[]});}
  const draft = await createCaptureDraft(web, identity, enabled, { workspaceId: identity.workspaceId, requestId: randomUUID(), name: 'Website', configuration }); const query = { workspaceId: identity.workspaceId, sourceId: draft.sourceId };
  const review = await readCapturePublicationReview(web, identity, enabled, query, delivery);
  await publishCaptureDraft(web, identity, enabled, { ...query, requestId: randomUUID(), confirmed: true, expectedVersion: review.sourceVersion, draftVersion: review.draftVersion, configurationVersion: review.configurationVersion, baseApprovedVersion: review.baseApprovedVersion, timing: { kind: 'now' } }, delivery);
  const pub = await db('capturePublications').where({ sourceId: draft.sourceId }).first(); return { identity, pub, sourceId: draft.sourceId };
}
type Fixture = Awaited<ReturnType<typeof fixture>>;
function input(f: Fixture, overrides: Partial<CapturePublicSubmission> = {}, policy = limits) {
  const issuedAt = Math.floor(Date.now() / 1000) - 2;
  const proof: CaptureSubmissionContext = { purpose: 'capture_submission', audience: 'https://forms.example.test', publicKey: f.pub.publicKey, publicationVersion: f.pub.version, configurationVersion: f.pub.configurationVersion, submissionId: randomUUID(), issuedAt, expiresAt: issuedAt + 1800 };
  const submission: CapturePublicSubmission = { context: 'fixture-signed-outside-data-boundary', requestId: randomUUID(), answers: { name: 'Visitor', email: `${randomUUID()}@example.test`, service: 'repair', custom: 'Original custom answer' }, consent: { id: 'contact', version: 1, accepted: true }, website: '', ...overrides };
  return { proof, submission, clientHash: 'a'.repeat(64), limits: policy };
}
type Input = ReturnType<typeof input>;
async function accept(value: Input) {
  const ready = await prepareCaptureSubmission(web, value); if (ready.state !== 'ready') return ready;
  assert.equal(ready.challengeRequired, false); return commitCaptureSubmission(web, value);
}
async function route(f: Fixture, recipient = "me", notifications = { inApp: true, email: true }, publish = true, routing?:{strategy:'one_teammate'|'round_robin'|'fewest_open_leads';members:string[];matchWorkZipCodes:boolean}) {
  const threadId = randomUUID(), turnId = randomUUID();
  await db('chatThreads').insert({ id: threadId, workspaceId: f.identity.workspaceId, userId: f.identity.userId });
  await db('chatTurns').insert({ id: turnId, threadId, workspaceId: f.identity.workspaceId, userId: f.identity.userId,
    clientTurnId: randomUUID(), requestHash: 'routing-fixture', surfaceKey: 'workflows.list', state: 'completed', leaseUntil: new Date(), proposalFamilies: JSON.stringify(['workflow']) });
  const draft = await withWorkspaceAuthorization(web, f.identity, enabled, true, (trx, context) => prepareWorkflowInTransaction(trx, context, { threadId, turnId },
    { kind: 'lead_routing', name: 'Website routing', source: 'Website', recipient:routing?null:recipient, businessDays: null, localTime: null, notifications, ...(routing?{routing}:{}) }));
  const command = { workspaceId: f.identity.workspaceId, id: draft.id, inputHash: draft.inputHash, decision: 'confirm' as const };
  if (publish) { await decideWorkflow(web, f.identity, enabled, command); await decideWorkflow(web, f.identity, enabled, command); }
  return draft;
}
async function teammate(f: Fixture, role = 'field') {
  const id = randomUUID(); await db('users').insert({ id, name: 'Taylor Routing', email: `${id}@example.test`, emailVerified: true, termsVersion: 'fixture', termsAcceptedAt: new Date(), createdAt: new Date(), updatedAt: new Date() });
  await db('workspaceMemberships').insert({ workspaceId: f.identity.workspaceId, userId: id, role }); return id;
}
try {
  await owner.raw('CREATE DATABASE ??', [name]); created = true; await migrateFreshBaseline(db); process.env.BILLING_SANDBOX_ENABLED = 'true';
  await check('reviewed source routing publishes once and excludes Run now', async () => {
    const f = await fixture(), assignee = await teammate(f), draft = await route(f, 'Taylor Routing');
    const list = await readWorkflows(web, f.identity, enabled, { workspaceId: f.identity.workspaceId });
    assert.equal(list.rows.length, 1); assert.equal(list.rows[0].canRunNow, false); assert.equal(list.rows[0].canEdit, true);
    assert.equal(list.rows[0].rule, 'Assign new unassigned leads from Website to Taylor Routing.');
    assert.equal((await readWorkflowEditData(web, f.identity, enabled, { workspaceId: f.identity.workspaceId, id: draft.id, version: 1 })).recipients.some(row => row.id === assignee), true);
    await assert.rejects(previewWorkflowRun(web, f.identity, enabled, { workspaceId: f.identity.workspaceId, id: draft.id, version: 1 }));
    await assert.rejects(route(f));
    const value = input(f); assert.equal((await accept(value)).state, 'accepted'); assert.equal((await accept(value)).state, 'accepted');
    const lead = await db('leads').where({ workspaceId: f.identity.workspaceId }).first(); assert.equal(lead.ownerId, assignee); assert.equal(lead.ownerName, 'Taylor Routing');
    for (const table of ['workflowRoutingReceipts', 'assignmentNotifications']) assert.equal((await db(table).where({ workspaceId: f.identity.workspaceId })).length, 1);
    assert.equal((await db('leadActivity').where({ workspaceId: f.identity.workspaceId, type: 'assigned' })).length, 1);
    assert.equal((await db('assignmentEmailOutbox').join('assignmentNotifications','assignmentNotifications.id','assignmentEmailOutbox.id').where('assignmentNotifications.workspaceId',f.identity.workspaceId)).length, 1);
    assert.equal((await readNotifications(web, { workspaceId: f.identity.workspaceId, userId: assignee }, enabled)).unreadCount, 1);
    const delivered: string[] = []; const notice = await db('assignmentNotifications').where({ workspaceId: f.identity.workspaceId }).first();
    await processAssignmentEmails(worker, enabled, async message => { delivered.push(message.id); }); assert.equal(delivered.length, 0, 'legacy polling excludes routing mail');
    const queue = await db('workflowQueueOutbox').where({ assignmentNoticeId: notice.id }).first(); assert.equal(queue.kind, 'assignment_email');
    await processAssignmentEmails(worker, enabled, async message => { delivered.push(message.id); }, 1, { id: notice.id, workspaceId: f.identity.workspaceId }); assert.equal(delivered.length, 1);
    assert((await db('workflowQueueOutbox').where({ id: queue.id }).first()).completedAt);
  });
  await check('source/default assignments win; nonmatches use one lookup and no authority load', async () => {
    const f = await fixture(), assignee = await teammate(f); await route(f);
    await db('leadAssignmentSettings').where({ workspaceId: f.identity.workspaceId }).update({ value: JSON.stringify({ kind: 'teammate', teammateId: assignee }) });
    assert.equal((await accept(input(f))).state, 'accepted');
    assert.equal((await db('leads').where({ workspaceId: f.identity.workspaceId }).first()).ownerId, assignee);
    assert.equal((await db('workflowRoutingReceipts').where({ workspaceId: f.identity.workspaceId })).length, 0);
    await withWorkspaceAuthorization(web, f.identity, enabled, true, async (trx, context) => {
      const queries: string[] = []; trx.on('query', query => queries.push(query.sql));
      const chosen = { ready: true, assigneeId: assignee, settingVersion: 1, basis: 'source' as const };
      assert.deepEqual(await resolveLeadRouting(trx, f.identity.workspaceId, f.sourceId, chosen, context), chosen); assert.equal(queries.length, 0);
      queries.length = 0;
      const unmatched = { ...chosen, assigneeId: null };
      assert.deepEqual(await resolveLeadRouting(trx, f.identity.workspaceId, randomUUID(), unmatched, context), unmatched); assert.equal(queries.length, 1);
      await assert.rejects(routingSource(trx, context, 'Website'));
    });
  });
  await check('pause/resume/edit affect future admissions; both channels can be off', async () => {
    const f = await fixture(), assignee = await teammate(f), draft = await route(f);
    await changeWorkflow(web, f.identity, enabled, { workspaceId: f.identity.workspaceId, id: draft.id, version: 1, action: 'pause' });
    await accept(input(f)); const old = await db('leads').where({ workspaceId: f.identity.workspaceId }).first(); assert.equal(old.ownerId, null);
    const data = await readWorkflowEditData(web, f.identity, enabled, { workspaceId: f.identity.workspaceId, id: draft.id, version: 2 });
    const saved = await editWorkflow(web, f.identity, enabled, { workspaceId: f.identity.workspaceId, id: draft.id, version: 2, requestId: randomUUID(),
      values: { ...workflowEditValues(data.workflow.name, data.workflow.definition), recipientId: assignee, notifications: { inApp: false, email: false } } });
    assert.equal(saved.row.status, 'paused');
    await changeWorkflow(web, f.identity, enabled, { workspaceId: f.identity.workspaceId, id: draft.id, version: 3, action: 'resume' });
    await accept(input(f)); const leads = await db('leads').where({ workspaceId: f.identity.workspaceId }).orderBy('leadNumber');
    assert.equal(leads[0].ownerId, null); assert.equal(leads[1].ownerId, assignee);
    assert.equal((await db('assignmentNotifications').where({ workspaceId: f.identity.workspaceId })).length, 0);
    await changeWorkflow(web, f.identity, enabled, { workspaceId: f.identity.workspaceId, id: draft.id, version: 4, action: 'delete', confirmation: 'confirm' });
    await accept(input(f)); assert.equal((await db('leads').where({ workspaceId: f.identity.workspaceId }).orderBy('leadNumber','desc').first()).ownerId, null);
  });
  await check('reviewed intake uses the same rule; stale routing reviews conflict; duplicate links never reassign', async () => {
    const f = await fixture(), assignee = await teammate(f), draft = await route(f);
    const value = input(f, { answers: { name: '', email: `${randomUUID()}@example.test`, service: 'repair' } }); await accept(value);
    const pending = await db('intakeItems').where({ workspaceId: f.identity.workspaceId }).first(); assert(pending);
    const answers = { ...pending.answers, name: 'Reviewed visitor' }, selector = { workspaceId: f.identity.workspaceId, intakeId: pending.id, expectedVersion: 1, answers };
    const review = await prepareIntakeReview(web, f.identity, enabled, { ...selector, requestId: randomUUID() });
    const data = await readWorkflowEditData(web, f.identity, enabled, { workspaceId: f.identity.workspaceId, id: draft.id, version: 1 });
    await editWorkflow(web, f.identity, enabled, { workspaceId: f.identity.workspaceId, id: draft.id, version: 1, requestId: randomUUID(),
      values: { ...workflowEditValues(data.workflow.name, data.workflow.definition), recipientId: assignee, notifications: { inApp: false, email: true } } });
    const command = { ...selector, requestId: randomUUID(), reviewId: review.reviewId, kind: 'create', definitionVersion: 1, workflowVersion: 1 };
    await assert.rejects(decideIntake(web, f.identity, enabled, command));
    const fresh = await prepareIntakeReview(web, f.identity, enabled, { ...selector, requestId: randomUUID() });
    await decideIntake(web, f.identity, enabled, { ...command, requestId: randomUUID(), reviewId: fresh.reviewId });
    const lead = await db('leads').where({ workspaceId: f.identity.workspaceId }).first(); assert.equal(lead.ownerId, assignee);
    assert.equal((await readNotifications(web, { workspaceId: f.identity.workspaceId, userId: assignee }, enabled)).unreadCount, 0, 'email-only notices are hidden in app');
    const duplicateValue = input(f, { answers: { name: 'Same visitor', email: answers.email, service: 'repair' } }); await accept(duplicateValue);
    const duplicate = await db('intakeItems').where({ workspaceId: f.identity.workspaceId, status: 'awaiting' }).first(); assert(duplicate);
    const dupReview = await prepareIntakeReview(web, f.identity, enabled, { workspaceId: f.identity.workspaceId, intakeId: duplicate.id, expectedVersion: 1, answers: duplicate.answers, requestId: randomUUID() });
    await decideIntake(web, f.identity, enabled, { workspaceId: f.identity.workspaceId, intakeId: duplicate.id, expectedVersion: 1, requestId: randomUUID(), reviewId: dupReview.reviewId,
      kind: 'link', leadId: lead.id, expectedLeadVersion: lead.version, changeIds: [] });
    assert.equal((await db('workflowRoutingReceipts').where({ workspaceId: f.identity.workspaceId })).length, 1);
    assert.equal((await db('leads').where({ id: lead.id }).first()).ownerId, assignee);
  });
  await check('concurrent publication/resume cannot create overlapping active rules; source references stay scoped', async () => {
    const f = await fixture(), other = await fixture();
    await withWorkspaceAuthorization(web, f.identity, enabled, true, async (trx, context) => { await assert.rejects(routingSource(trx, context, '', other.sourceId)); });
    const first = await route(f, 'me', { inApp: true, email: true }, false), second = await route(f, 'me', { inApp: true, email: true }, false);
    const confirm = (draft: typeof first) => decideWorkflow(web, f.identity, enabled, { workspaceId: f.identity.workspaceId, id: draft.id, inputHash: draft.inputHash, decision: 'confirm' });
    const results = await Promise.allSettled([confirm(first), confirm(second)]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    const active = await db('workflows').where({ workspaceId: f.identity.workspaceId, status: 'active' }).first();
    const waiting = active.id === first.id ? second : first;
    await changeWorkflow(web, f.identity, enabled, { workspaceId: f.identity.workspaceId, id: active.id, version: 1, action: 'pause' });
    await confirm(waiting);
    await assert.rejects(changeWorkflow(web, f.identity, enabled, { workspaceId: f.identity.workspaceId, id: active.id, version: 2, action: 'resume' }));
    assert.equal((await db('workflows').where({ workspaceId: f.identity.workspaceId, status: 'active' })).length, 1);
  });
  await check('unavailable assignees and revoked publisher grants preserve admission and report an issue', async () => {
    const f = await fixture(), assignee = await teammate(f); await route(f, 'Taylor Routing');
    await db('users').where({ id: assignee }).update({ suspendedAt: new Date(), suspendedReason: "Routing fixture" }); await accept(input(f));
    assert.equal((await db('leads').where({ workspaceId: f.identity.workspaceId }).first()).ownerId, null);
    assert((await readWorkflows(web, f.identity, enabled, { workspaceId: f.identity.workspaceId })).rows[0].issue);
    await db('users').where({ id: assignee }).update({ suspendedAt: null, suspendedReason: null });
    await db('workspaceRolePolicies').where({ workspaceId: f.identity.workspaceId, role: 'owner', permission: 'leads.assign' }).delete();
    await accept(input(f)); assert.equal((await db('workflowRoutingReceipts').where({ workspaceId: f.identity.workspaceId })).length, 0);
  });
  await check('team round robin commits once, ignores previews/retries and records actual owner policy',async()=>{
    const f=await fixture(false,true),staff=await teammate(f),ids=[f.identity.userId,staff];
    await db('workspaceMemberCoverage').insert(ids.map(personId=>({workspaceId:f.identity.workspaceId,personId,version:1})));
    await db('workspaceMemberPostalCodes').insert(ids.map(personId=>({workspaceId:f.identity.workspaceId,personId,countryCode:'US',postalCode:'10001'})));
    const baseline=input(f,{}, {...limits,challengeAfter:100});baseline.submission.answers.postal='10001';await prepareCaptureSubmission(web,baseline);const baselineSql:string[]=[],baselineRecord=(query:{sql:string})=>baselineSql.push(query.sql);web.on('query',baselineRecord);await commitCaptureSubmission(web,baseline);web.off('query',baselineRecord);
    const d=await route(f,'team',{inApp:false,email:false},true,{strategy:'round_robin',members:['Fixture owner','Taylor Routing'],matchWorkZipCodes:true});
    assert.equal(d.definition.recipientId,undefined);
    const sourceRow=await db('captureSources').where({id:f.sourceId}).first(),version=await db('captureSourceVersions').where({sourceId:f.sourceId,configurationVersion:f.pub.configurationVersion}).first();
    const withoutZip={...version.configuration,fields:version.configuration.fields.filter((field:{key:string})=>field.key!=='postalCode')};
    const checks=await db.transaction(trx=>captureConfigurationChecks(trx,sourceRow,withoutZip,1,delivery));assert.equal(checks.find(check=>check.code==='routing_zip')?.ready,false);
    const preview=()=>withWorkspaceAuthorization(web,f.identity,enabled,false,(trx,c)=>resolveLeadRouting(trx,f.identity.workspaceId,f.sourceId,{ready:true,assigneeId:null,settingVersion:0,basis:'source'},c));
    const before=await preview();assert.equal((await db('workflows').where({id:d.id}).first()).routingCursor,null);
    const one=input(f,{}, {...limits,challengeAfter:100});one.submission.answers.postal='10001';await prepareCaptureSubmission(web,one);
    const sql:string[]=[],record=(query:{sql:string})=>sql.push(query.sql);web.on('query',record);await commitCaptureSubmission(web,one);web.off('query',record);
    assert.equal(sql.filter(text=>text.includes('workspaceRolePolicies')).length,1);assert.equal(sql.filter(text=>text.includes('workspaceMemberCoverage')).length,1);
    console.log(`Source admission baseline: ${baselineSql.length} SQL statements; with team routing: ${sql.length} (${sql.length-baselineSql.length} additional), including transaction control. One publisher authority load and one candidate/coverage batch.`);await accept(one);
    const two=input(f,{}, {...limits,challengeAfter:100});two.submission.answers.postal='10001';await accept(two);
    const three=input(f,{}, {...limits,challengeAfter:100});three.submission.answers.postal='10001';await accept(three);
    const receipts=await db('workflowRoutingReceipts').where({workflowId:d.id}).orderBy('createdAt');
    assert.deepEqual(receipts.map(r=>r.assigneeId),[ids[0],ids[1],ids[0]]);assert.equal(receipts[0].routingDetails.strategy,'round_robin');
    assert.equal((await db('workflows').where({id:d.id}).first()).routingCursor,ids[0]);assert.deepEqual(await preview(),before);
    assert.equal((await db('assignmentNotifications').where({workspaceId:f.identity.workspaceId})).length,0);
    await db('workspaceMemberPostalCodes').where({workspaceId:f.identity.workspaceId,personId:staff}).delete();
    const unmatched=input(f,{}, {...limits,challengeAfter:100});unmatched.submission.answers.postal='10002';await accept(unmatched);
    assert.equal((await db('leads').where({workspaceId:f.identity.workspaceId,email:unmatched.submission.answers.email}).first()).ownerId,null);
    assert.equal((await db('workflows').where({id:d.id}).first()).routingCursor,ids[0]);
  });
  await check('fewest open leads uses current open counts, rotates ties and serializes simultaneous admissions',async()=>{
    const f=await fixture(),staff=await teammate(f);
    const d=await route(f,'team',{inApp:true,email:false},true,{strategy:'fewest_open_leads',members:['Fixture owner','Taylor Routing'],matchWorkZipCodes:false});
    for(let index=0;index<4;index++)await accept(input(f,{}, {...limits,challengeAfter:100}));
    const counts=await db('leads').where({workspaceId:f.identity.workspaceId}).groupBy('ownerId').select('ownerId').count('* as count');
    assert.deepEqual(counts.map(row=>Number(row.count)).sort(),[2,2]);
    const requests=[input(f,{}, {...limits,challengeAfter:100}),input(f,{}, {...limits,challengeAfter:100})];await Promise.all(requests.map(accept));
    const after=await db('leads').where({workspaceId:f.identity.workspaceId}).groupBy('ownerId').select('ownerId').count('* as count');assert.deepEqual(after.map(row=>Number(row.count)).sort(),[3,3]);
    const receipts=await db('workflowRoutingReceipts').where({workflowId:d.id});assert.equal(receipts.length,6);assert(receipts.every(r=>r.routingDetails.strategy==='fewest_open_leads'));
    await db('leads').where({workspaceId:f.identity.workspaceId,ownerId:staff}).update({stage:'won'});
    const next=input(f,{}, {...limits,challengeAfter:100});await accept(next);assert.equal((await db('leads').where({workspaceId:f.identity.workspaceId,email:next.submission.answers.email}).first()).ownerId,staff);
  });
  await check('ZIP prerequisites fail closed and assignment rollback does not advance the team cursor',async()=>{
    const invalid=await fixture(),person=await teammate(invalid);await assert.rejects(route(invalid,'team',{inApp:false,email:false},true,{strategy:'round_robin',members:['Fixture owner','Taylor Routing'],matchWorkZipCodes:true}));
    assert.equal((await db('workflows').where({workspaceId:invalid.identity.workspaceId})).length,0);assert(person);
    const coveredSource=await fixture(false,true);await teammate(coveredSource);
    await assert.rejects(route(coveredSource,'team',{inApp:false,email:false},false,{strategy:'round_robin',members:['Fixture owner','Taylor Routing'],matchWorkZipCodes:true}),/Add work ZIP codes for Fixture owner, Taylor Routing in Settings → Team/);
    assert.equal((await db('workflows').where({workspaceId:coveredSource.identity.workspaceId})).length,0);
    const f=await fixture(),staff=await teammate(f),d=await route(f,'team',{inApp:false,email:false},true,{strategy:'round_robin',members:['Fixture owner','Taylor Routing'],matchWorkZipCodes:false});
    const value=input(f);await db.raw(`CREATE FUNCTION routing_rollback_fixture() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.type='assigned' THEN RAISE EXCEPTION 'Fixture rollback'; END IF; RETURN NEW; END $$`);
    await db.raw(`CREATE TRIGGER routing_rollback_fixture BEFORE INSERT ON "leadActivity" FOR EACH ROW EXECUTE FUNCTION routing_rollback_fixture()`);
    await assert.rejects(accept(value));assert.equal((await db('workflows').where({id:d.id}).first()).routingCursor,null);assert.equal((await db('workflowRoutingReceipts').where({workflowId:d.id})).length,0);
    await db.raw('DROP TRIGGER routing_rollback_fixture ON "leadActivity"');await db.raw('DROP FUNCTION routing_rollback_fixture()');await accept(value);
    assert.equal((await db('workflows').where({id:d.id}).first()).routingCursor,f.identity.userId);
    await db('users').where({id:staff}).update({suspendedAt:new Date(),suspendedReason:'Fixture'});const next=input(f);await accept(next);assert.equal((await db('leads').where({workspaceId:f.identity.workspaceId,email:next.submission.answers.email}).first()).ownerId,f.identity.userId);
  });
  await check('workload aggregation uses the scoped open-owner index without loading lead records',async()=>{
    const f=await fixture(),staff=await teammate(f);const rows=Array.from({length:2000},(_,index)=>({id:randomUUID(),workspaceId:f.identity.workspaceId,createdBy:f.identity.userId,submissionId:randomUUID(),submissionHash:'routing-plan-fixture',name:'Workload fixture',email:'',phone:'',service:'Repair',address:'',details:'',notes:'',source:'other',stage:index<100?'new':'won',ownerId:index%2?staff:f.identity.userId}));
    await db.batchInsert('leads',rows,200);await db.raw('ANALYZE leads');
    const result=await db.raw(`EXPLAIN (ANALYZE,BUFFERS,FORMAT JSON) SELECT "ownerId",count(*) FROM leads WHERE "workspaceId"=? AND "archivedAt" IS NULL AND stage IN ('new','contacted','estimate-sent') AND "ownerId"=ANY(?::text[]) GROUP BY "ownerId"`,[f.identity.workspaceId,[f.identity.userId,staff]]);
    const plan=JSON.stringify(result.rows[0]['QUERY PLAN']);assert(plan.includes('leads_owner_open_routing'));
    const counts=await db('leads').where({workspaceId:f.identity.workspaceId}).whereNull('archivedAt').whereIn('stage',['new','contacted','estimate-sent']).groupBy('ownerId').select('ownerId').count('* as count');assert.deepEqual(counts.map(row=>Number(row.count)),[50,50]);
    console.log('Workload query plan: scoped partial open-owner index used for 100 open leads among 2,000 workspace records; only grouped counts returned.');
  });
  console.log(`Lead routing: ${groups} groups passed with runtime roles and real source admission/review; no external mail sent.`);
} finally {
  if (priorBilling === undefined) delete process.env.BILLING_SANDBOX_ENABLED; else process.env.BILLING_SANDBOX_ENABLED = priorBilling;
  await Promise.all([db.destroy(), web.destroy(), worker.destroy()]); if (created) await owner.raw('DROP DATABASE ?? WITH (FORCE)', [name]); await owner.destroy();
}
