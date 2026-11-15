import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { permissionIds, type CalendarProposalTicket } from '@salesmora/contracts';
import { createDatabase } from '../database';
import { migrateFreshBaseline } from '../baseline-runner';
import { initializeWorkspacePolicy, withWorkspaceAuthorization, AuthorizationAccessError } from '../authorization/store';
import { withCanonicalProposalStorage } from '../chat-proposals';
import { createJob } from '../jobs/store';
import { createWorkOrder, mutateWorkOrder } from '../work-orders/mutations';
import { readWorkOrderCreationVisit, scheduleCalendarVisit } from './commands';
import {
  proposeCalendarSchedule, readCalendarScheduleProposal, operateCalendarScheduleProposal,
  calendarProposalBinding, calendarProposalEvidenceAllowed, visibleCalendarScheduleProposal, CalendarProposalConflictError,
} from './proposals';

const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname))
  throw new Error('A separate local test connection is required.');
const name = `calendar_proposals_${randomUUID().replaceAll('-', '')}_test`;
const url = new URL(connection); url.pathname = `/${name}`;
const owner = createDatabase(connection), db = createDatabase(url.toString());
const runtimeURL = new URL(url); runtimeURL.searchParams.set('options', '-c role=salesmora_web');
const runtime = createDatabase(runtimeURL.toString());
const identity = { workspaceId: randomUUID(), userId: randomUUID() }, stranger = { ...identity, userId: randomUUID() };
const customerId = randomUUID(), enabled = permissionIds;
let created = false, checks = 0, canonical = true;
const canonicalSQL: string[] = [];
runtime.on('query', ({ sql }: { sql: string }) => { if (canonical) canonicalSQL.push(sql); });
async function check(label: string, work: () => Promise<void>) {
  await work(); checks++; console.log(`PASS ${canonical ? 'canonical' : 'legacy'}: ${label}`);
}
const table = () => canonical ? 'chatProposals' : 'chatCalendarProposals';
const auditTable = () => canonical ? 'chatProposalAudit' : 'chatCalendarProposalAudit';
async function turn(threadId = randomUUID(), evidence: string[] = []) {
  await db('chatThreads').insert({ ...identity, id: threadId }).onConflict('id').ignore();
  const id = randomUUID();
  await db('chatTurns').insert({
    ...identity, id, threadId, clientTurnId: randomUUID(), requestHash: 'fictional', surfaceKey: 'home',
    state: 'running', leaseUntil: new Date(Date.now() + 900000), calendarProposalEvidence: JSON.stringify(evidence),
  });
  return { id, threadId };
}
async function fixture() {
  const jobId = (await createJob(runtime, identity, enabled, {
    workspaceId: identity.workspaceId, customerId, submissionId: randomUUID(), title: 'Calendar proposal fixture',
    primaryOwnerId: identity.userId, scheduledDate: '2026-11-01', arrivalWindow: '09:00-11:00',
  })).jobId;
  const visit = await readWorkOrderCreationVisit(runtime, identity, enabled, jobId);
  assert.ok(visit);
  const order = await createWorkOrder(runtime, identity, enabled, {
    workspaceId: identity.workspaceId, jobId, submissionId: randomUUID(), title: 'Shared visit fixture',
    assigneeId: identity.userId, visit: { kind: 'job', visitId: visit.id, revision: visit.revision },
  });
  await mutateWorkOrder(runtime, identity, enabled, {
    workspaceId: identity.workspaceId, workOrderId: order.workOrderId, expectedVersion: order.version,
    submissionId: randomUUID(), action: 'status', to: 'issued', confirmed: true,
  });
  return { jobId, workOrderId: order.workOrderId, visitId: visit.id };
}
async function propose(visitId: string, source?: Awaited<ReturnType<typeof turn>>, clear = false) {
  source ??= await turn();
  const result = await proposeCalendarSchedule(runtime, identity, enabled, source.id, clear
    ? { operation: 'clear', recordRef: visitId, scheduledDate: null, arrivalWindow: null, windowMode: 'unset' }
    : { operation: 'schedule', recordRef: visitId, scheduledDate: '2026-11-02', arrivalWindow: '12:00-14:00' },
  new AbortController().signal);
  if ('clarification' in result) throw new Error(result.clarification);
  return { ticket: result, turn: source };
}
async function complete(source: { id: string }) { await db('chatTurns').where({ id: source.id }).update({ state: 'completed' }); }
const read = (ticket: CalendarProposalTicket) => readCalendarScheduleProposal(runtime, identity, enabled, calendarProposalBindingFrom(ticket));
const calendarProposalBindingFrom = (ticket: CalendarProposalTicket) => ({
  proposalId: ticket.proposalId, inputHash: ticket.inputHash, visitId: ticket.visitId, revision: ticket.revision,
});
const decide = (ticket: CalendarProposalTicket, decision: 'confirm' | 'cancel' = 'confirm') =>
  operateCalendarScheduleProposal(runtime, identity, enabled, calendarProposalBindingFrom(ticket), decision);
function normalized(value: unknown): unknown {
  return Array.isArray(value) ? value.map(normalized) : value && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, normalized(item)])) : value;
}
async function run() {
  await check('completed shared review schedules once, replays receipt and rejects forged/private/unfinished decisions', async () => {
    const records = await fixture(), prepared = await propose(records.visitId);
    await assert.rejects(decide(prepared.ticket), AuthorizationAccessError);
    await complete(prepared.turn);
    const view = await read(prepared.ticket);
    assert.deepEqual(view.draft.records.map(record => record.type).sort(), ['job', 'work_order']);
    await assert.rejects(readCalendarScheduleProposal(runtime, stranger, enabled, calendarProposalBindingFrom(prepared.ticket)), AuthorizationAccessError);
    await assert.rejects(readCalendarScheduleProposal(runtime, identity, enabled, { ...calendarProposalBindingFrom(prepared.ticket), inputHash: 'b'.repeat(64) }), CalendarProposalConflictError);
    await assert.rejects(operateCalendarScheduleProposal(runtime, identity, enabled.filter(p => p !== 'jobs.schedule.update'), calendarProposalBindingFrom(prepared.ticket), 'confirm'), AuthorizationAccessError);
    const [one, two] = await Promise.all([decide(prepared.ticket), decide(prepared.ticket)]);
    assert.deepEqual(one, two); assert.equal(one.draft.state, 'confirmed');
    await assert.rejects(decide(prepared.ticket, 'cancel'), CalendarProposalConflictError);
    for (const [source, id] of [['jobs', records.jobId], ['workOrders', records.workOrderId]]) {
      const row = await db(source).where({ id }).first();
      assert.equal(row.scheduledDate.toISOString().slice(0, 10), '2026-11-02'); assert.equal(row.arrivalWindow, '12:00-14:00');
    }
    assert.equal((await db('calendarOperations').where({ submissionId: prepared.ticket.proposalId })).length, 1);
  });
  await check('clear and cancel keep their native replay outcomes', async () => {
    const records = await fixture(), prepared = await propose(records.visitId, await turn(), true);
    await complete(prepared.turn);
    const saved = await decide(prepared.ticket);
    assert.equal(saved.draft.intent, 'clear'); assert.equal(saved.draft.to.scheduledDate, null);
    assert.deepEqual(await decide(prepared.ticket), saved);
    assert.equal((await db('jobs').where({ id: records.jobId }).first()).scheduledDate, null);
    const cancelled = await propose(records.visitId); await complete(cancelled.turn);
    const view = await decide(cancelled.ticket, 'cancel');
    assert.deepEqual(await decide(cancelled.ticket, 'cancel'), view);
    assert.equal((await db('calendarOperations').where({ submissionId: cancelled.ticket.proposalId })).length, 0);
  });
  await check('replacement synchronizes nested state and prunes inherited evidence with one canonical pending lookup', async () => {
    const records = await fixture(), first = await propose(records.visitId); await complete(first.turn);
    const nextTurn = await turn(first.turn.threadId, [first.ticket.proposalId]), before = canonicalSQL.length;
    const second = await propose(records.visitId, nextTurn); await complete(second.turn);
    const replaced = await db(table()).where({ id: first.ticket.proposalId }).first();
    assert.equal(replaced.state, 'superseded'); assert.equal(replaced.payload.draft.state, 'superseded');
    assert.deepEqual((await db('chatTurns').where({ id: nextTurn.id }).first()).calendarProposalEvidence, [second.ticket.proposalId]);
    if (canonical) assert.equal(canonicalSQL.slice(before).filter(sql => /select.*"chatProposals".*for update/i.test(sql)).length, 1);
    await assert.rejects(decide(first.ticket), CalendarProposalConflictError);
    await withWorkspaceAuthorization(runtime, identity, enabled, false, async (trx, context) => {
      assert.equal((await visibleCalendarScheduleProposal(trx, context, enabled, nextTurn.id))?.proposalId, second.ticket.proposalId);
      assert.equal(await calendarProposalEvidenceAllowed(trx, context, enabled, { ...nextTurn, calendarProposalEvidence: [second.ticket.proposalId] }), true);
      assert.equal(await calendarProposalEvidenceAllowed(trx, context, enabled, { ...nextTurn, threadId: randomUUID(), calendarProposalEvidence: [second.ticket.proposalId] }), false);
      assert.equal(await calendarProposalEvidenceAllowed(trx, context, enabled, { ...first.turn, calendarProposalEvidence: [first.ticket.proposalId] }), false);
    });
  });
  await check('expired and stale reviews cannot execute', async () => {
    const records = await fixture(), prepared = await propose(records.visitId); await complete(prepared.turn);
    const row = await db(table()).where({ id: prepared.ticket.proposalId }).first(), payload = row.payload;
    payload.draft.createdAt = new Date(Date.now() - 900000).toISOString();
    payload.draft.expiresAt = new Date(Date.now() - 1000).toISOString();
    const draft = Object.fromEntries(Object.entries(payload.draft).filter(([key]) => !['inputHash', 'state'].includes(key)));
    payload.draft.inputHash = createHash('sha256').update(JSON.stringify(normalized({ draft, command: payload.command, authority: payload.authority, stamp: payload.stamp }))).digest('hex');
    await db(table()).where({ id: row.id }).update({
      payload: JSON.stringify(payload), ...(canonical ? { inputHash: payload.draft.inputHash, expiresAt: payload.draft.expiresAt, createdAt: payload.draft.createdAt } : {}),
    });
    const expired = { ...calendarProposalBinding(payload.draft), state: 'pending' as const };
    assert.equal((await read(expired)).draft.state, 'expired'); await assert.rejects(decide(expired), CalendarProposalConflictError);
    const stale = await propose(records.visitId); await complete(stale.turn);
    const stored = await db(table()).where({ id: stale.ticket.proposalId }).first();
    await scheduleCalendarVisit(runtime, identity, enabled, { ...stored.payload.command, submissionId: randomUUID(), schedule: { scheduledDate: '2026-11-03', arrivalWindow: null } });
    await assert.rejects(decide(stale.ticket), CalendarProposalConflictError);
  });
  await check('audit failure rolls back both records and operation; retry remains safe', async () => {
    const records = await fixture(), prepared = await propose(records.visitId); await complete(prepared.turn);
    const job = await db('jobs').where({ id: records.jobId }).first(), order = await db('workOrders').where({ id: records.workOrderId }).first();
    await db.raw(`CREATE FUNCTION rehearsal_fail_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'rehearsal audit failure'; END $$`);
    await db.raw(`CREATE TRIGGER rehearsal_fail_audit BEFORE INSERT ON ?? FOR EACH ROW WHEN (NEW.action = 'confirmed') EXECUTE FUNCTION rehearsal_fail_audit()`, [auditTable()]);
    try { await assert.rejects(decide(prepared.ticket), /rehearsal audit failure/); }
    finally { await db.raw('DROP TRIGGER rehearsal_fail_audit ON ??', [auditTable()]); await db.raw('DROP FUNCTION rehearsal_fail_audit()'); }
    assert.deepEqual(await db('jobs').where({ id: records.jobId }).first(), job);
    assert.deepEqual(await db('workOrders').where({ id: records.workOrderId }).first(), order);
    assert.equal((await db('calendarOperations').where({ submissionId: prepared.ticket.proposalId })).length, 0);
    assert.equal((await db(table()).where({ id: prepared.ticket.proposalId }).first()).state, 'pending');
    assert.equal((await decide(prepared.ticket)).draft.state, 'confirmed');
  });
  await check('confirm/cancel race has one terminal winner', async () => {
    const records = await fixture(), prepared = await propose(records.visitId); await complete(prepared.turn);
    const results = await Promise.allSettled([decide(prepared.ticket), decide(prepared.ticket, 'cancel')]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    const rejected = results.find(result => result.status === 'rejected');
    assert.ok(rejected?.status === 'rejected' && rejected.reason instanceof CalendarProposalConflictError);
    assert.ok((await db('calendarOperations').where({ submissionId: prepared.ticket.proposalId })).length <= 1);
  });
}
try {
  await owner.raw('CREATE DATABASE ??', [name]); created = true;
  await migrateFreshBaseline(db);
  for (const person of [identity, stranger]) await db('users').insert({ id: person.userId, name: 'Fictional Calendar tester', email: `${person.userId}@example.test`, createdAt: new Date(), updatedAt: new Date(), termsVersion: 'test', termsAcceptedAt: new Date() });
  await db.transaction(async trx => {
    await trx('workspaces').insert({ id: identity.workspaceId, ownerId: identity.userId, businessName: 'Fictional Calendar', businessType: 'plumbing', postalCode: '', serviceRange: '', timezone: 'America/New_York' });
    for (const person of [identity, stranger]) await trx('workspaceMemberships').insert({ ...person, role: person === identity ? 'owner' : 'admin' });
    await initializeWorkspacePolicy(trx, identity);
    await trx('customers').insert({ id: customerId, workspaceId: identity.workspaceId, name: 'Fictional Customer', type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '' });
  });
  await withCanonicalProposalStorage(run);
  assert.equal(canonicalSQL.some(sql => /"chatCalendar(?:Proposals|ProposalAudit)"/.test(sql)), false, 'Canonical mode must not touch legacy tables.');
  console.log(`PASS ${checks} Calendar proposal storage groups; shared databases untouched.`);
} finally {
  await Promise.all([runtime.destroy(), db.destroy()]);
  if (created) await owner.raw('DROP DATABASE ?? WITH (FORCE)', [name]);
  await owner.destroy();
}
