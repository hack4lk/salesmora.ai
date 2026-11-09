import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { permissionIds, type CalendarReviewQuery } from '@salesmora/contracts';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy, withWorkspaceAuthorization, AuthorizationAccessError } from '../authorization/store';
import { createJob } from '../jobs/store';
import { createWorkOrder, mutateWorkOrder } from '../work-orders/mutations';
import { readWorkOrderCreationVisit } from '../calendar/commands';
import { readCalendarReviewReportInTransaction } from './calendar-review';

process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw new Error('Use a separate local _test database.');
const db = createDatabase(connection);
const workspaceId = randomUUID(), owner = randomUUID(), field = randomUUID(), teammate = randomUUID(), outsider = randomUUID();
const customerId = randomUUID(), rollback = new Error('Rollback Calendar schedule-review fixtures.');
const identity = { workspaceId, userId: owner }, enabled = [...permissionIds];
let checks = 0;
async function check(name: string, run: () => Promise<void>) { await run(); checks++; console.log(`PASS ${name}`); }
try {
  await assert.rejects(db.transaction(async trx => {
    await trx('users').insert([owner, field, teammate, outsider].map(id => ({
      id, name: `Calendar review ${id}`, email: `${id}@example.test`, createdAt: new Date(),
      updatedAt: new Date(), termsVersion: 'fixture', termsAcceptedAt: new Date(),
    })));
    await trx('workspaces').insert({
      id: workspaceId, ownerId: owner, businessName: 'Calendar review fixture', businessType: 'test',
      postalCode: '', serviceRange: '', timezone: 'America/New_York',
    });
    await trx('workspaceMemberships').insert([
      { workspaceId, userId: owner, role: 'owner' }, { workspaceId, userId: field, role: 'field' },
      { workspaceId, userId: teammate, role: 'field' },
    ]);
    await initializeWorkspacePolicy(trx, identity);
    await trx('customers').insert({
      id: customerId, workspaceId, name: 'Review customer', type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '',
    });
    const clock = (await trx.raw<{ rows: { today: string; yesterday: string; tomorrow: string; weekBefore: string }[] }>(`SELECT
      to_char(CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York', 'YYYY-MM-DD') AS today,
      to_char((CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::date - 1, 'YYYY-MM-DD') AS yesterday,
      to_char((CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::date + 1, 'YYYY-MM-DD') AS tomorrow,
      to_char((CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York')::date - 7, 'YYYY-MM-DD') AS "weekBefore"`)).rows[0];
    const read = (userId = owner, patch: Partial<CalendarReviewQuery> = {}, permissions = enabled) =>
      withWorkspaceAuthorization(trx, { workspaceId, userId }, permissions, false, (transaction, context) =>
        readCalendarReviewReportInTransaction(transaction, context, {
          workspaceId, view: 'calendar-review', period: { from: clock.yesterday, to: clock.yesterday },
          selected: 'overlaps', page: 1, pageSize: 25, filters: { participants: [], recordTypes: [] }, ...patch,
        }));
    const jobs: string[] = [], visitIds: string[] = [];
    for (const arrivalWindow of ['08:00-10:00', '09:00-11:00', '12:00-14:00', null] as const) {
      const job = await createJob(trx, identity, enabled, {
        workspaceId, submissionId: randomUUID(), customerId, title: 'Identical review visit',
        primaryOwnerId: field, teamUserIds: [teammate], scheduledDate: clock.yesterday, arrivalWindow,
      });
      jobs.push(job.jobId);
      const link = await trx('calendarVisitRecords').where({ workspaceId, jobId: job.jobId }).whereNull('endedAt').first('visitId');
      visitIds.push(link.visitId);
    }
    const joinOrder = async (jobId: string, assigneeId: string, issued: boolean) => {
      const preview = await readWorkOrderCreationVisit(trx, identity, enabled, jobId);
      assert(preview?.canJoin);
      const order = await createWorkOrder(trx, identity, enabled, {
        workspaceId, submissionId: randomUUID(), jobId, title: 'Shared review order', assigneeId,
        visit: { kind: 'job', visitId: preview.id, revision: preview.revision },
      });
      if (issued) await mutateWorkOrder(trx, identity, enabled, {
        workspaceId, workOrderId: order.workOrderId, submissionId: randomUUID(), expectedVersion: order.version,
        action: 'status', to: 'issued', confirmed: true,
      });
      return order.workOrderId;
    };
    const orderOne = await joinOrder(jobs[0], field, true), orderTwo = await joinOrder(jobs[1], field, true);
    const draft = await joinOrder(jobs[0], teammate, false);
    await createJob(trx, identity, enabled, {
      workspaceId, submissionId: randomUUID(), customerId, title: 'Unscheduled not review', primaryOwnerId: field,
    });
    await check('unordered canonical pairs count once per person despite duplicate linked records; past visits remain distinct', async () => {
      const report = await read();
      assert.deepEqual(report.counts, { scheduledVisits: 4, missingWindows: 1, overlapPairs: 2, pastVisits: 4 });
      assert.equal(report.visits.length, 2);
      assert.equal(report.visits.find(visit => visit.id === visitIds[0])?.records.length, 3);
      assert.deepEqual(report.visits.find(visit => visit.id === visitIds[0])?.records.find(record => record.id === draft)?.participantIds, [teammate]);
      assert.equal(report.evidence.kind, 'overlaps');
      if (report.evidence.kind === 'overlaps') {
        assert.deepEqual(new Set(report.evidence.rows.map(row => row.personId)), new Set([field, teammate]));
        for (const row of report.evidence.rows) {
          assert(row.leftVisitId < row.rightVisitId);
          assert.deepEqual(new Set([row.leftVisitId, row.rightVisitId]), new Set(visitIds.slice(0, 2)));
        }
      }
      const past = await read(owner, { selected: 'past' });
      assert.equal(past.visits.length, 4);
      assert.equal(past.evidenceTotal, 4);
      assert(!JSON.stringify(past).includes('Unscheduled not review'));
    });
    await check('review facets filter record membership before pairs and selected people limit counts/evidence', async () => {
      const filters = { participants: [field], recordTypes: [] };
      const report = await read(owner, { filters });
      assert.deepEqual(report.counts, { scheduledVisits: 4, missingWindows: 1, overlapPairs: 1, pastVisits: 4 });
      assert.deepEqual(report.filters, filters);
      assert.deepEqual(report.members.map(member => member.id), [field]);
      assert(!JSON.stringify(report).includes(teammate));
      const teammateOrders = await read(owner, { filters: { participants: [teammate], recordTypes: ['work_order'] } });
      assert.deepEqual(teammateOrders.counts, { scheduledVisits: 1, missingWindows: 0, overlapPairs: 0, pastVisits: 1 });
      const past = await read(owner, { selected: 'past', filters: { participants: [teammate], recordTypes: ['work_order'] } });
      assert.deepEqual(past.visits[0]?.records.map(record => record.id), [draft]);
      assert(!JSON.stringify(past).includes(field));
      assert(!JSON.stringify(past).includes(jobs[0]));
      const orders = await read(owner, { filters: { participants: [field, teammate], recordTypes: ['work_order'] } });
      assert.equal(orders.counts.overlapPairs, 1);
      assert.equal(orders.counts.scheduledVisits, 2);
      const union = await read(owner, { filters: { participants: [field, teammate], recordTypes: ['job', 'work_order'] } });
      assert.deepEqual(union.counts, { scheduledVisits: 4, missingWindows: 1, overlapPairs: 2, pastVisits: 4 });
      const zero = await read(owner, { filters: { participants: [owner], recordTypes: [] } });
      assert.equal(zero.counts.scheduledVisits, 0);
      await assert.rejects(read(field, { filters: { participants: [teammate], recordTypes: [] } }), AuthorizationAccessError);
    });
    await check('adjacent windows never overlap and missing windows remain unknown rather than conflicts or free time', async () => {
      await trx('calendarVisits').where({ id: visitIds[1] }).update({ arrivalWindow: '10:00-12:00' });
      assert.equal((await read()).counts.overlapPairs, 0);
      await trx('calendarVisits').whereIn('id', visitIds).update({ arrivalWindow: null });
      assert.deepEqual((await read()).counts, { scheduledVisits: 4, missingWindows: 4, overlapPairs: 0, pastVisits: 4 });
      for (const [index, arrivalWindow] of ['08:00-10:00', '09:00-11:00', '12:00-14:00', null].entries()) {
        await trx('calendarVisits').where({ id: visitIds[index] }).update({ arrivalWindow });
      }
    });
    await check('own and assigned-report scope redact other people, Drafts and records; empty own roster retains self', async () => {
      const parentOnly = await joinOrder(jobs[0], teammate, true);
      const unassigned = await createJob(trx, identity, enabled, {
        workspaceId, submissionId: randomUUID(), customerId, title: 'Unassigned past visit',
        primaryOwnerId: null, scheduledDate: clock.yesterday, arrivalWindow: '09:00-11:00',
      });
      const workspace = await read();
      assert.equal(workspace.counts.scheduledVisits, 5);
      assert.equal(workspace.counts.overlapPairs, 2);
      const report = await read(field);
      assert.equal(report.scope.kind, 'own');
      assert.deepEqual(report.counts, { scheduledVisits: 4, missingWindows: 1, overlapPairs: 1, pastVisits: 4 });
      assert.deepEqual(report.members.map(member => member.id), [field]);
      assert(!JSON.stringify(report).includes(teammate));
      assert(!JSON.stringify(report).includes(draft));
      assert(!JSON.stringify(report).includes(parentOnly));
      assert(!JSON.stringify(report).includes(unassigned.jobId));
      await trx('workOrders').where({ id: parentOnly }).update({ archivedAt: trx.fn.now() });
      await trx('jobs').where({ id: unassigned.jobId }).update({ status: 'completed' });
      const ownDraft = await createWorkOrder(trx, identity, enabled, {
        workspaceId, submissionId: randomUUID(), jobId: jobs[0], title: 'Owner Draft excluded', assigneeId: owner,
      });
      const link = await trx('calendarVisitRecords').where({ workspaceId, workOrderId: ownDraft.workOrderId }).whereNull('endedAt').first('visitId');
      await trx('calendarVisits').where({ id: link.visitId }).update({ scheduledDate: clock.yesterday, arrivalWindow: '09:00-11:00' });
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'assigned' });
      const empty = await read();
      assert.deepEqual(empty.counts, { scheduledVisits: 0, missingWindows: 0, overlapPairs: 0, pastVisits: 0 });
      assert.deepEqual(empty.members.map(member => member.id), [owner]);
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'workspace' });
      await trx('workOrders').where({ id: ownDraft.workOrderId }).update({ archivedAt: trx.fn.now() });
    });
    await check('Work Order-only review has no parent Job or hidden participant context and permissions fail closed', async () => {
      const ordersOnly = enabled.filter(id => id !== 'jobs.read');
      for (const selected of ['overlaps', 'past'] as const) {
        const report = await read(owner, { selected }, ordersOnly);
        assert.deepEqual(report.counts, { scheduledVisits: 2, missingWindows: 0, overlapPairs: 1, pastVisits: 2 });
        assert(report.visits.every(visit => visit.records.every(record => record.type === 'work_order')));
        assert(!JSON.stringify(report).includes(jobs[0]));
        assert(!JSON.stringify(report).includes('Review customer'));
      }
      const policies = await trx('workspaceRolePolicies').where({ workspaceId, role: 'field' })
        .whereIn('permission', ['reports.read', 'calendar.read']).select('permission', 'scope');
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'field' })
        .whereIn('permission', ['reports.read', 'calendar.read']).update({ scope: 'workspace' });
      const assigned = await read(field, {}, ordersOnly);
      assert.equal(assigned.scope.kind, 'workspace');
      assert.equal(assigned.counts.overlapPairs, 1);
      assert.deepEqual(assigned.members.map(member => member.id), [field]);
      assert(!JSON.stringify(assigned).includes(draft));
      for (const policy of policies) await trx('workspaceRolePolicies')
        .where({ workspaceId, role: 'field', permission: policy.permission }).update({ scope: policy.scope });
      for (const permission of ['reports.read', 'calendar.read']) {
        await assert.rejects(read(owner, {}, enabled.filter(id => id !== permission)), AuthorizationAccessError);
      }
      await assert.rejects(read(owner, {}, enabled.filter(id => id !== 'jobs.read' && id !== 'workorders.read')), AuthorizationAccessError);
      await assert.rejects(read(outsider), AuthorizationAccessError);
      await assert.rejects(read(owner, { workspaceId: randomUUID() }), AuthorizationAccessError);
    });
    await check('strict business-local past dates exclude today/future; inclusive multi-week ranges do not pair across dates', async () => {
      for (const scheduledDate of [clock.today, clock.tomorrow, clock.weekBefore]) await createJob(trx, identity, enabled, {
        workspaceId, submissionId: randomUUID(), customerId, title: 'Range boundary', primaryOwnerId: field,
        scheduledDate, arrivalWindow: '09:00-11:00',
      });
      const all = await read(owner, { selected: 'past', period: { from: clock.weekBefore, to: clock.tomorrow } });
      assert.deepEqual(all.counts, { scheduledVisits: 7, missingWindows: 1, overlapPairs: 2, pastVisits: 5 });
      assert(all.visits.every(visit => visit.date < clock.today));
      const today = await read(owner, { selected: 'past', period: { from: clock.today, to: clock.today } });
      assert.equal(today.counts.scheduledVisits, 1);
      assert.equal(today.counts.pastVisits, 0);
      const future = await read(owner, { selected: 'past', period: { from: clock.tomorrow, to: clock.tomorrow } });
      assert.equal(future.counts.pastVisits, 0);
      for (const timezone of ['America/New_York', 'Asia/Kathmandu', 'Pacific/Kiritimati']) {
        await trx('workspaces').where({ id: workspaceId }).update({ timezone });
        const report = await read(owner, { selected: 'past', period: { from: clock.weekBefore, to: clock.tomorrow } });
        const local = (await trx.raw(`SELECT to_char(CURRENT_TIMESTAMP AT TIME ZONE ?, 'YYYY-MM-DD') AS today`, [timezone])).rows[0].today;
        const expected = [clock.yesterday, clock.yesterday, clock.yesterday, clock.yesterday, clock.weekBefore, clock.today, clock.tomorrow]
          .filter(date => date < local).length;
        assert.equal(report.today, local);
        assert.equal(report.counts.pastVisits, expected);
      }
      await trx('workspaces').where({ id: workspaceId }).update({ timezone: 'America/New_York' });
    });
    await check('known person-pair and past evidence pages are stable, clamped and complete beyond the first 25 rows', async () => {
      for (let i = 0; i < 8; i++) await createJob(trx, identity, enabled, {
        workspaceId, submissionId: randomUUID(), customerId, title: 'Paged pair visit',
        primaryOwnerId: field, teamUserIds: [teammate], scheduledDate: clock.yesterday, arrivalWindow: '09:00-11:00',
      });
      const report = await read();
      assert.deepEqual(report.counts, { scheduledVisits: 12, missingWindows: 1, overlapPairs: 90, pastVisits: 12 });
      const ids = new Set<string>();
      for (const page of [1, 2, 3, 999]) {
        const paged = await read(owner, { page });
        assert.equal(paged.page, page === 999 ? 4 : page);
        assert.equal(paged.evidence.kind, 'overlaps');
        if (paged.evidence.kind === 'overlaps') {
          assert.equal(paged.evidence.rows.length, page === 999 ? 15 : 25);
          for (const row of paged.evidence.rows) {
            const key = JSON.stringify([row.personId, row.leftVisitId, row.rightVisitId]);
            assert(!ids.has(key));
            ids.add(key);
          }
        }
      }
      assert.equal(ids.size, 90);
      const filtered = await read(owner, { page: 999, filters: { participants: [field], recordTypes: ['job'] } });
      assert.equal(filtered.counts.overlapPairs, 45);
      assert.equal(filtered.page, 2);
      if (filtered.evidence.kind === 'overlaps') assert.equal(filtered.evidence.rows.length, 20);
      assert(!JSON.stringify(filtered).includes(teammate));
      for (let i = 0; i < 17; i++) await createJob(trx, identity, enabled, {
        workspaceId, submissionId: randomUUID(), customerId, title: 'Paged unknown past',
        primaryOwnerId: field, scheduledDate: clock.yesterday,
      });
      const first = await read(owner, { selected: 'past' }), last = await read(owner, { selected: 'past', page: 999 });
      assert.equal(first.evidenceTotal, 29);
      assert.equal(last.page, 2);
      assert.equal(last.visits.length, 4);
      assert.equal(new Set([...first.visits, ...last.visits].map(visit => visit.id)).size, 29);
    });
    await check('closed/archived linked records remove only their contribution while an active shared visit survives', async () => {
      await trx('jobs').where({ id: jobs[0] }).update({ status: 'completed' });
      await trx('workOrders').where({ id: draft }).update({ archivedAt: trx.fn.now() });
      const report = await read(owner, { selected: 'past', pageSize: 50 });
      assert.equal(report.counts.scheduledVisits, 29);
      assert.equal(report.counts.overlapPairs, 81);
      assert.deepEqual(report.visits.find(visit => visit.id === visitIds[0])?.records.map(record => record.id), [orderOne]);
      await trx('workOrders').where({ id: orderOne }).update({ archivedAt: trx.fn.now() });
      const removed = await read(owner, { selected: 'past', pageSize: 50 });
      assert.equal(removed.counts.scheduledVisits, 28);
      assert.equal(removed.counts.overlapPairs, 72);
      assert(!removed.visits.some(visit => visit.id === visitIds[0]));
      assert(removed.visits.some(visit => visit.records.some(record => record.id === orderTwo)));
    });
    await check('former/deletion-requested members cannot contribute pairs or identities; empty future pages stay explicit', async () => {
      await trx('workspaceMemberships').where({ workspaceId, userId: teammate }).delete();
      const report = await read();
      assert.equal(report.counts.overlapPairs, 36);
      assert(!JSON.stringify(report).includes(teammate));
      await assert.rejects(read(teammate), AuthorizationAccessError);
      await trx('users').where({ id: field }).update({ deletionRequestedAt: trx.fn.now() });
      const withoutPeople = await read();
      assert.equal(withoutPeople.counts.scheduledVisits, 28);
      assert.equal(withoutPeople.counts.overlapPairs, 0);
      assert.deepEqual(withoutPeople.members.map(member => member.id), [owner]);
      const future = await read(owner, { period: { from: '2099-01-01', to: '2099-01-02' }, page: 999 });
      assert.deepEqual(future.counts, { scheduledVisits: 0, missingWindows: 0, overlapPairs: 0, pastVisits: 0 });
      assert.equal(future.page, 1);
      assert.equal(future.visits.length, 0);
      await trx('workspaceMemberships').where({ workspaceId, userId: field }).delete();
      await assert.rejects(read(field), AuthorizationAccessError);
    });
    throw rollback;
  }), error => error === rollback);
  console.log(`${checks} Calendar schedule-review database journeys passed.`);
} finally { await db.destroy(); }
