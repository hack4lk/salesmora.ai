import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { permissionIds, type CalendarUnscheduledQuery } from '@salesmora/contracts';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy, withWorkspaceAuthorization, AuthorizationAccessError } from '../authorization/store';
import { createJob } from '../jobs/store';
import { createWorkOrder, mutateWorkOrder } from '../work-orders/mutations';
import { readWorkOrderCreationVisit, scheduleCalendarVisit } from '../calendar/commands';
import { readCalendarVisit } from '../calendar/read';
import { readCalendarUnscheduledReportInTransaction } from './calendar-unscheduled';

process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw new Error('Use a separate local _test database.');
const db = createDatabase(connection);
const workspaceId = randomUUID(), owner = randomUUID(), field = randomUUID(), teammate = randomUUID(), outsider = randomUUID();
const customerId = randomUUID(), rollback = new Error('Rollback unscheduled Calendar report fixtures.');
const identity = { workspaceId, userId: owner }, enabled = [...permissionIds];
let checks = 0;
async function check(name: string, run: () => Promise<void>) { await run(); checks++; console.log(`PASS ${name}`); }
try {
  await assert.rejects(db.transaction(async trx => {
    await trx('users').insert([owner, field, teammate, outsider].map(id => ({
      id, name: `Calendar queue ${id}`, email: `${id}@example.test`, createdAt: new Date(),
      updatedAt: new Date(), termsVersion: 'fixture', termsAcceptedAt: new Date(),
    })));
    await trx('workspaces').insert({
      id: workspaceId, ownerId: owner, businessName: 'Calendar queue fixture', businessType: 'test',
      postalCode: '', serviceRange: '', timezone: 'America/New_York',
    });
    await trx('workspaceMemberships').insert([
      { workspaceId, userId: owner, role: 'owner' }, { workspaceId, userId: field, role: 'field' },
      { workspaceId, userId: teammate, role: 'field' },
    ]);
    await initializeWorkspacePolicy(trx, identity);
    await trx('customers').insert({
      id: customerId, workspaceId, name: 'Queue customer', type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '',
    });
    const read = (userId = owner, patch: Partial<CalendarUnscheduledQuery> = {}, permissions = enabled) =>
      withWorkspaceAuthorization(trx, { workspaceId, userId }, permissions, false, (transaction, context) =>
        readCalendarUnscheduledReportInTransaction(transaction, context, {
          workspaceId, view: 'calendar-unscheduled', selected: 'visits', page: 1, pageSize: 25,
          filters: { participants: [], recordTypes: [] }, ...patch,
        }));
    const shared = await createJob(trx, identity, enabled, {postalCode:'10001',
      workspaceId, submissionId: randomUUID(), customerId, title: 'Identical queue', primaryOwnerId: field, teamUserIds: [teammate],
      scheduledDate: '2026-11-01',
    });
    const separate = await createJob(trx, identity, enabled, {postalCode:'10001',
      workspaceId, submissionId: randomUUID(), customerId, title: 'Identical queue', primaryOwnerId: field,
    });
    const unassigned = await createJob(trx, identity, enabled, {postalCode:'10001',
      workspaceId, submissionId: randomUUID(), customerId, title: 'Unassigned queue', primaryOwnerId: null,
    });
    await createJob(trx, identity, enabled, {postalCode:'10001',
      workspaceId, submissionId: randomUUID(), customerId, title: 'Future not a queue', primaryOwnerId: field, scheduledDate: '2099-01-01',
    });
    const joinOrder = async (assigneeId: string | null, issued: boolean) => {
      const preview = await readWorkOrderCreationVisit(trx, identity, enabled, shared.jobId);
      assert(preview?.canJoin);
      const order = await createWorkOrder(trx, identity, enabled, {
        workspaceId, submissionId: randomUUID(), jobId: shared.jobId, title: 'Shared queue order', assigneeId,
        visit: { kind: 'job', visitId: preview.id, revision: preview.revision },
      });
      if (issued) await mutateWorkOrder(trx, identity, enabled, {
        workspaceId, workOrderId: order.workOrderId, submissionId: randomUUID(), expectedVersion: order.version,
        action: 'status', to: 'issued', confirmed: true,
      });
      return { ...order, visitId: preview.id };
    };
    const issued = await joinOrder(field, true), draft = await joinOrder(teammate, false);
    const setSharedSchedule = async (scheduledDate: string | null) => {
      const visit = await readCalendarVisit(trx, identity, enabled, issued.visitId);
      assert(visit.review);
      await scheduleCalendarVisit(trx, identity, enabled, {
        workspaceId, submissionId: randomUUID(), visitId: issued.visitId, ...visit.review,
        schedule: { scheduledDate, arrivalWindow: null },
      });
    };
    await setSharedSchedule(null);
    // Preserve a legacy source schedule to prove the canonical visit, not the Job label, defines the queue.
    await trx('jobs').where({ id: shared.jobId }).update({ status: 'scheduled', scheduledDate: '2026-11-01' });
    await check('canonical null-date queues deduplicate explicit sharing, not identical titles or lifecycle labels', async () => {
      const report = await read();
      assert.deepEqual(report.counts, { visits: 3, jobs: 3, workOrders: 2 });
      const visit = report.visits.find(row => row.id === issued.visitId);
      assert.equal(visit?.records.length, 3);
      assert.deepEqual(visit?.records.find(record => record.id === draft.workOrderId)?.participantIds, [teammate]);
      assert.deepEqual(new Set(visit?.participantIds), new Set([field, teammate]));
      assert.equal(visit?.records.find(row => row.id === shared.jobId)?.status, 'scheduled');
      assert(report.visits.some(row => row.records.some(record => record.id === separate.jobId)));
      assert(!JSON.stringify(report).includes('Future not a queue'));
      const orders = await read(owner, { selected: 'workOrders' });
      assert.equal(orders.evidenceTotal, 2);
      assert.equal(orders.visits.length, 1);
      assert.equal(orders.visits[0]?.records.length, 3);
      const jobs = await read(owner, { selected: 'jobs' });
      assert.equal(jobs.evidenceTotal, 3);
    });
    await check('independent undated facets count matched active records and visits, never borrowing parent participants', async () => {
      const filters = { participants: [teammate], recordTypes: ['work_order'] } as const;
      const report = await read(owner, { selected: 'workOrders', filters: { participants: [...filters.participants], recordTypes: [...filters.recordTypes] } });
      assert.deepEqual(report.counts, { visits: 1, jobs: 0, workOrders: 1 });
      assert.deepEqual(report.members.map(member => member.id), [teammate]);
      assert.deepEqual(report.visits[0]?.records.map(record => record.id), [draft.workOrderId]);
      assert(!JSON.stringify(report).includes(field));
      assert(!JSON.stringify(report).includes(shared.jobId));
      const jobs = await read(owner, { filters: { participants: [teammate], recordTypes: ['job'] } });
      assert.deepEqual(jobs.counts, { visits: 1, jobs: 1, workOrders: 0 });
      const union = await read(owner, { filters: { participants: [field, teammate], recordTypes: ['job', 'work_order'] } });
      assert.deepEqual(union.counts, { visits: 2, jobs: 2, workOrders: 2 });
      const empty = await read(owner, { filters: { participants: [owner], recordTypes: [] } });
      assert.deepEqual(empty.counts, { visits: 0, jobs: 0, workOrders: 0 });
      await assert.rejects(read(field, { filters: { participants: [teammate], recordTypes: [] } }), AuthorizationAccessError);
      await assert.rejects(read(owner, { filters: { participants: [outsider], recordTypes: [] } }), AuthorizationAccessError);
    });
    await check('own/report-assigned scope hides Drafts, others and unassigned residuals; parent assignment alone cannot expose records', async () => {
      const mine = await read(field);
      assert.equal(mine.scope.kind, 'own');
      assert.deepEqual(mine.counts, { visits: 2, jobs: 2, workOrders: 1 });
      assert.deepEqual(mine.members.map(member => member.id), [field]);
      assert(!JSON.stringify(mine).includes(teammate));
      assert(!JSON.stringify(mine).includes(draft.workOrderId));
      assert(!JSON.stringify(mine).includes(unassigned.jobId));
      const parentOnly = await createWorkOrder(trx, identity, enabled, {
        workspaceId, submissionId: randomUUID(), jobId: shared.jobId, title: 'Parent-only responsibility', assigneeId: teammate,
      });
      await mutateWorkOrder(trx, identity, enabled, {
        workspaceId, workOrderId: parentOnly.workOrderId, submissionId: randomUUID(), expectedVersion: parentOnly.version,
        action: 'status', to: 'issued', confirmed: true,
      });
      assert.equal((await read(field)).counts.workOrders, 1);
      await trx('workOrders').where({ id: parentOnly.workOrderId }).update({ archivedAt: trx.fn.now() });
      const ownDraft = await createWorkOrder(trx, identity, enabled, {
        workspaceId, submissionId: randomUUID(), jobId: shared.jobId, title: 'Own Draft', assigneeId: owner,
      });
      assert.equal((await read()).counts.workOrders, 3);
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'assigned' });
      const empty = await read();
      assert.deepEqual(empty.counts, { visits: 0, jobs: 0, workOrders: 0 });
      assert.deepEqual(empty.members.map(member => member.id), [owner]);
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'workspace' });
      await trx('workOrders').where({ id: ownDraft.workOrderId }).update({ archivedAt: trx.fn.now() });
    });
    await check('Work Order-only evidence contains no parent Job identity or unauthorized linkage context; grants fail closed', async () => {
      const limited = await read(owner, { selected: 'workOrders' }, enabled.filter(id => id !== 'jobs.read'));
      assert.deepEqual(limited.counts, { visits: 1, jobs: 0, workOrders: 2 });
      assert(limited.visits[0]?.records.every(record => record.type === 'work_order'));
      assert(!JSON.stringify(limited).includes(shared.jobId));
      assert(!JSON.stringify(limited).includes('Queue customer'));
      for (const permission of ['reports.read', 'calendar.read']) {
        await assert.rejects(read(owner, {}, enabled.filter(id => id !== permission)), AuthorizationAccessError);
      }
      await assert.rejects(read(owner, {}, enabled.filter(id => id !== 'jobs.read' && id !== 'workorders.read')), AuthorizationAccessError);
      await assert.rejects(read(outsider), AuthorizationAccessError);
      await assert.rejects(read(owner, { workspaceId: randomUUID() }), AuthorizationAccessError);
    });
    await check('workspace Calendar with assigned domain reads retains only authorized records and participant roster', async () => {
      const policies = await trx('workspaceRolePolicies').where({ workspaceId, role: 'field' })
        .whereIn('permission', ['reports.read', 'calendar.read']).select('permission', 'scope');
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'field' })
        .whereIn('permission', ['reports.read', 'calendar.read']).update({ scope: 'workspace' });
      const report = await read(field);
      assert.equal(report.scope.kind, 'workspace');
      assert.deepEqual(report.counts, { visits: 2, jobs: 2, workOrders: 1 });
      assert.deepEqual(new Set(report.members.map(member => member.id)), new Set([field, teammate]));
      assert(!JSON.stringify(report).includes(owner));
      assert(!JSON.stringify(report).includes(unassigned.jobId));
      assert(!JSON.stringify(report).includes(draft.workOrderId));
      const orderOnly = await read(field, { selected: 'workOrders' }, enabled.filter(id => id !== 'jobs.read'));
      assert.deepEqual(orderOnly.counts, { visits: 1, jobs: 0, workOrders: 1 });
      assert.deepEqual(new Set(orderOnly.members.map(member => member.id)), new Set([field]));
      for (const policy of policies) await trx('workspaceRolePolicies')
        .where({ workspaceId, role: 'field', permission: policy.permission }).update({ scope: policy.scope });
    });
    await check('business-local clock and timezone never introduce a schedule-date or creation-period queue filter', async () => {
      for (const timezone of ['America/New_York', 'Asia/Kathmandu', 'Pacific/Kiritimati']) {
        await trx('workspaces').where({ id: workspaceId }).update({ timezone });
        const report = await read();
        assert.deepEqual(report.counts, { visits: 3, jobs: 3, workOrders: 2 });
        assert.equal(report.timezone, timezone);
        const clock = (await trx.raw(`SELECT to_char(CURRENT_TIMESTAMP AT TIME ZONE ?, 'YYYY-MM-DD') AS today`, [timezone])).rows[0];
        assert.equal(report.today, clock.today);
      }
    });
    await check('record pages remain bounded and stable even when one canonical visit has more than 25 Work Orders', async () => {
      await setSharedSchedule('2026-11-01');
      for (let i = 0; i < 26; i++) await joinOrder(field, false);
      await setSharedSchedule(null);
      const first = await read(owner, { selected: 'workOrders' });
      const last = await read(owner, { selected: 'workOrders', page: 999 });
      assert.equal(first.evidenceTotal, 28);
      assert.equal(first.visits.length, 1);
      assert.equal(first.visits[0]?.records.length, 29);
      assert.equal(last.page, 2);
      assert.equal(last.visits.length, 1);
      assert.equal(first.evidence.kind, 'workOrders');
      assert.equal(last.evidence.kind, 'workOrders');
      assert.equal(first.evidence.records.length, 25);
      assert.equal(last.evidence.records.length, 3);
      assert.equal(new Set([...first.evidence.records, ...last.evidence.records].map(row => row.recordId)).size, 28);
      const filtered = await read(owner, {
        selected: 'workOrders', page: 999, filters: { participants: [field], recordTypes: ['work_order'] },
      });
      assert.deepEqual(filtered.counts, { visits: 1, jobs: 0, workOrders: 27 });
      assert.equal(filtered.page, 2);
      assert.equal(filtered.visits[0]?.records.length, 27);
      assert(!JSON.stringify(filtered).includes(teammate));
      for (let i = 0; i < 27; i++) await createJob(trx, identity, enabled, {postalCode:'10001',
        workspaceId, submissionId: randomUUID(), customerId, title: 'Paged queue', primaryOwnerId: field,
      });
      for (const selected of ['visits', 'jobs'] as const) {
        const pageOne = await read(owner, { selected }), pageTwo = await read(owner, { selected, page: 999 });
        assert.equal(pageOne.evidenceTotal, 30);
        assert.equal(pageTwo.page, 2);
        assert.equal(new Set([...pageOne.visits, ...pageTwo.visits].map(row => row.id)).size, 30);
      }
    });
    await check('closure/archive and canonical schedule changes remove only affected units, preserving active shared records', async () => {
      await trx('jobs').where({ id: shared.jobId }).update({ status: 'completed' });
      const before = await trx('workOrders').where({ id: issued.workOrderId }).first('version');
      await mutateWorkOrder(trx, identity, enabled, {
        workspaceId, workOrderId: issued.workOrderId, submissionId: randomUUID(), expectedVersion: before.version,
        action: 'status', to: 'in-progress', confirmed: true,
      });
      const current = await trx('workOrders').where({ id: issued.workOrderId }).first('version');
      await mutateWorkOrder(trx, identity, enabled, {
        workspaceId, workOrderId: issued.workOrderId, submissionId: randomUUID(), expectedVersion: current.version,
        action: 'complete', summary: 'Fixture complete', followUp: 'none', followUpNote: '',
        signerName: '', signatureImage: null, overrideReason: '',
      });
      await trx('workOrders').where({ id: draft.workOrderId }).update({ archivedAt: trx.fn.now() });
      const report = await read();
      assert.deepEqual(report.counts, { visits: 30, jobs: 29, workOrders: 26 });
      const orderReport = await read(owner, { selected: 'workOrders' });
      assert(orderReport.visits[0]?.records.every(record => record.type === 'work_order' && record.status === 'draft'));
      await trx('calendarVisits').where({ id: issued.visitId }).update({ scheduledDate: '2099-01-01' });
      assert.deepEqual((await read()).counts, { visits: 29, jobs: 29, workOrders: 0 });
      const empty = await read(owner, { selected: 'workOrders', page: 999 });
      assert.equal(empty.page, 1);
      assert.equal(empty.visits.length, 0);
      await assert.rejects(read(owner, { filters: { participants: [], recordTypes: ['work_order'] } }), AuthorizationAccessError);
      await trx('calendarVisits').where({ id: issued.visitId }).update({ scheduledDate: null });
    });
    await check('former and deletion-requested members are redacted without losing authorized units; membership revocation denies entry', async () => {
      await trx('workspaceMemberships').where({ workspaceId, userId: teammate }).delete();
      assert(!JSON.stringify(await read()).includes(teammate));
      await assert.rejects(read(owner, { filters: { participants: [teammate], recordTypes: [] } }), AuthorizationAccessError);
      await assert.rejects(read(teammate), AuthorizationAccessError);
      await trx('users').where({ id: field }).update({ deletionRequestedAt: trx.fn.now() });
      const report = await read();
      assert.equal(report.counts.visits, 30);
      assert.deepEqual(report.members.map(member => member.id), [owner]);
      assert(report.visits.every(visit => visit.participantIds.length === 0));
      await assert.rejects(read(owner, { filters: { participants: [field], recordTypes: [] } }), AuthorizationAccessError);
      await trx('workspaceMemberships').where({ workspaceId, userId: field }).delete();
      await assert.rejects(read(field), AuthorizationAccessError);
    });
    throw rollback;
  }), error => error === rollback);
  console.log(`${checks} Calendar unscheduled report database journeys passed.`);
} finally { await db.destroy(); }
