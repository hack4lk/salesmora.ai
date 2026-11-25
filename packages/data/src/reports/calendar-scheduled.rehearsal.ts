import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { permissionIds, calendarExportInputSchema, calendarExportPreviewSchema, type CalendarExportInput,
  type CalendarScheduledQuery } from '@salesmora/contracts';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy, withWorkspaceAuthorization, AuthorizationAccessError } from '../authorization/store';
import { createJob } from '../jobs/store';
import { createWorkOrder, mutateWorkOrder } from '../work-orders/mutations';
import { readWorkOrderCreationVisit } from '../calendar/commands';
import { readCalendarScheduledReportInTransaction } from './calendar-scheduled';
import { readCalendarReportFilterOptionsInTransaction } from './calendar-filters';
import { readCalendarReportWithAuthorityInTransaction, initialCalendarReportWithAuthorityInTransaction } from './calendar-read';
import { readCalendarReviewReportInTransaction } from './calendar-review';
import { readCalendarUnscheduledReportInTransaction } from './calendar-unscheduled';
import { addCalendarDays, calendarWeekStart } from '@salesmora/domain';
import { prepareCalendarCSVProjectionInTransaction } from './calendar-export-projection';

process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw new Error('Use a separate local _test database.');
const db = createDatabase(connection);
const workspaceId = randomUUID(), owner = randomUUID(), field = randomUUID(), teammate = randomUUID(), outsider = randomUUID();
const customerId = randomUUID(), rollback = new Error('Rollback Calendar report fixtures.');
const identity = { workspaceId, userId: owner };
const enabled = [...permissionIds];
let checks = 0;
async function check(name: string, run: () => Promise<void>) {
  if (process.argv.length > 2 && !process.argv.slice(2).some(fragment => name.includes(fragment))) return;
  await run(); checks++; console.log(`PASS ${name}`);
}
try {
  await assert.rejects(db.transaction(async trx => {
    await trx('users').insert([owner, field, teammate, outsider].map(id => ({
      id, name: `Calendar report ${id}`, email: `${id}@example.test`, createdAt: new Date(),
      updatedAt: new Date(), termsVersion: 'fixture', termsAcceptedAt: new Date(),
    })));
    await trx('workspaces').insert({
      id: workspaceId, ownerId: owner, businessName: 'Calendar report fixture', businessType: 'test',
      postalCode: '', serviceRange: '', timezone: 'America/New_York',
    });
    await trx('workspaceMemberships').insert([
      { workspaceId, userId: owner, role: 'owner' }, { workspaceId, userId: field, role: 'field' },
      { workspaceId, userId: teammate, role: 'field' },
    ]);
    await initializeWorkspacePolicy(trx, identity);
    await trx('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission: 'reports.export', scope: 'enabled' });
    await trx('customers').insert({
      id: customerId, workspaceId, name: 'Calendar fixture', type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '',
    });
    const read = (userId = owner, patch: Partial<CalendarScheduledQuery> = {}, permissions = enabled) =>
      withWorkspaceAuthorization(trx, { workspaceId, userId }, permissions, false, (transaction, context) =>
        readCalendarScheduledReportInTransaction(transaction, context, {
          workspaceId, view: 'calendar-scheduled', period: { from: '2026-11-01', to: '2026-11-02' },
          selected: 'visits', page: 1, pageSize: 25, filters: { participants: [], recordTypes: [] }, ...patch,
        }));
    const jobs: string[] = [];
    const collectExport = async (view: string, dataset: string, selected: string,
      patch: Partial<CalendarExportInput['query']> = {}, permissions = enabled) =>
      withWorkspaceAuthorization(trx, identity, permissions, false, async (transaction, context) => {
        const input = calendarExportInputSchema.parse({ dataset, query: {
          workspaceId, view, selected, ...(view === 'calendar-unscheduled' ? {} :
            { period: { from: '2026-11-01', to: '2026-11-02' } }), ...patch,
        } });
        const projection = await prepareCalendarCSVProjectionInTransaction(transaction, context, input);
        const { rows: generate, ...metadata } = projection;
        calendarExportPreviewSchema.parse({ ...metadata, limits: { rows: 50000, bytes: 33554432, durationMs: 30000 } });
        const rows: (readonly (string | number | null)[])[] = [];
        for await (const row of generate()) rows.push(row);
        assert.equal(rows.length, projection.count);
        assert(rows.every(row => row.length === projection.columns.length));
        return { projection, rows };
      });
    for (let i = 0; i < 4; i++) jobs.push((await createJob(trx, identity, enabled, {postalCode:'10001',
      workspaceId, submissionId: randomUUID(), customerId, title: 'Identical fixture Job',
      primaryOwnerId: field, teamUserIds: [teammate], scheduledDate: '2026-11-01', arrivalWindow: '09:00-11:00',
    })).jobId);
    const preview = await readWorkOrderCreationVisit(trx, identity, enabled, jobs[0]);
    assert(preview?.canJoin);
    const order = await createWorkOrder(trx, identity, enabled, {
      workspaceId, submissionId: randomUUID(), jobId: jobs[0], title: 'Shared Work Order',
      assigneeId: field, visit: { kind: 'job', visitId: preview.id, revision: preview.revision },
    });
    await mutateWorkOrder(trx, identity, enabled, {
      workspaceId, workOrderId: order.workOrderId, submissionId: randomUUID(), expectedVersion: order.version,
      action: 'status', to: 'issued', confirmed: true,
    });
    await createJob(trx, identity, enabled, {postalCode:'10001', workspaceId, submissionId: randomUUID(), customerId, title: 'Unscheduled', primaryOwnerId: field });
    const unassigned = await createJob(trx, identity, enabled, {postalCode:'10001',
      workspaceId, submissionId: randomUUID(), customerId, title: 'Unassigned scheduled', scheduledDate: '2026-11-02',
      primaryOwnerId: null,
    });
    await check('shared canonical visits count once, equal schedules remain distinct, people counts are non-additive', async () => {
      const report = await read();
      assert.deepEqual(report.counts, { visits: 5, busyPersonDays: 2 });
      assert.deepEqual(report.days, [
        { date: '2026-11-01', count: 4, unassignedCount: 0 }, { date: '2026-11-02', count: 1, unassignedCount: 1 },
      ]);
      assert.deepEqual(report.members.find(member => member.id === field)?.counts, [4, 0]);
      assert.deepEqual(report.members.find(member => member.id === teammate)?.counts, [4, 0]);
      if (report.evidence.kind === 'visits') {
        assert.equal(report.evidence.rows.find(visit => visit.id === preview.id)?.records.length, 2);
        const shared = report.evidence.rows.find(visit => visit.id === preview.id);
        assert.deepEqual(shared?.records.find(record => record.type === 'job')?.participantIds, [field, teammate].sort());
        assert.deepEqual(shared?.records.find(record => record.type === 'work_order')?.participantIds, [field]);
      }
      const busy = await read(owner, { selected: 'busy-person-days' });
      assert.equal(busy.evidenceTotal, 2);
      assert.equal(busy.evidence.rows.length, 2);
    });
    await check('dated facets match type then current record participants, redact unrelated records and bound busy workload', async () => {
      const filters = { participants: [field], recordTypes: [] };
      const report = await read(owner, { filters });
      assert.deepEqual(report.filters, filters);
      assert.deepEqual(report.counts, { visits: 4, busyPersonDays: 1 });
      assert.deepEqual(report.members.map(member => member.id), [field]);
      assert(!JSON.stringify(report).includes(teammate));
      assert.equal(report.days[1]?.unassignedCount, 0);
      const teammateOrders = await read(owner, { filters: { participants: [teammate], recordTypes: ['work_order'] } });
      assert.equal(teammateOrders.counts.visits, 0);
      assert.deepEqual(teammateOrders.members.map(member => member.id), [teammate]);
      const fieldOrders = await read(owner, { filters: { participants: [field], recordTypes: ['work_order'] } });
      assert.deepEqual(fieldOrders.counts, { visits: 1, busyPersonDays: 0 });
      if (fieldOrders.evidence.kind === 'visits') assert(fieldOrders.evidence.rows[0]?.records.every(record => record.type === 'work_order'));
      const union = await read(owner, { filters: { participants: [field, teammate], recordTypes: ['job', 'work_order'] } });
      assert.deepEqual(union.counts, { visits: 4, busyPersonDays: 2 });
      const busy = await read(owner, { selected: 'busy-person-days', filters });
      assert.equal(busy.evidenceTotal, 1);
      for (const id of [outsider, randomUUID()]) await assert.rejects(
        read(owner, { filters: { participants: [id], recordTypes: [] } }), AuthorizationAccessError);
      await assert.rejects(read(field, { filters: { participants: [teammate], recordTypes: [] } }), AuthorizationAccessError);
      await assert.rejects(read(owner, { filters: { participants: [], recordTypes: ['work_order'] } },
        enabled.filter(id => id !== 'workorders.read')), AuthorizationAccessError);
      const options = (kind: 'dated' | 'unscheduled', userId = owner) =>
        withWorkspaceAuthorization(trx, { workspaceId, userId }, enabled, false, (transaction, context) =>
          readCalendarReportFilterOptionsInTransaction(transaction, context, { workspaceId, context: kind }));
      assert.deepEqual((await options('dated')).recordTypes.map(option => option.value), ['job', 'work_order']);
      assert.deepEqual((await options('unscheduled')).recordTypes.map(option => option.value), ['job']);
      assert.deepEqual((await options('dated', field)).participants, [{ value: field, label: 'Me' }]);
      const outside = await read(owner, { period: { from: '2099-01-01', to: '2099-01-02' }, filters });
      assert.equal(outside.counts.visits, 0);
      assert.deepEqual(outside.members.map(member => member.id), [field]);
    });
    await check('Calendar CSV native tables and full evidence reconcile across all three views', async () => {
      const visits = await collectExport('calendar-scheduled', 'visits', 'visits');
      assert.equal(visits.projection.count, 5);
      const shared = visits.rows.find(row => row[11] === preview.id);
      assert(shared);
      const linked = JSON.parse(String(shared[15]));
      assert.equal(linked.length, 2);
      assert.deepEqual(linked.map((row: { type: string }) => row.type), ['job', 'work_order']);
      const summary = await collectExport('calendar-scheduled', 'summary', 'visits');
      assert.deepEqual(summary.rows[0]?.slice(11), [5, 2, 4]);
      const days = await collectExport('calendar-scheduled', 'days', 'visits');
      assert.deepEqual(days.rows.map(row => row.slice(11)), [['2026-11-01', 4, 0], ['2026-11-02', 1, 1]]);
      const people = await collectExport('calendar-scheduled', 'person-days', 'busy-person-days');
      assert.equal(people.projection.count, 6);
      const busy = await collectExport('calendar-scheduled', 'busy-person-days', 'busy-person-days');
      assert.equal(busy.projection.count, 2);
      assert(busy.rows.every(row => row[14] === 4));
      const review = await collectExport('calendar-review', 'summary', 'overlaps');
      assert.deepEqual(review.rows[0]?.slice(11), [5, 1, 12, 5]);
      const overlaps = await collectExport('calendar-review', 'overlaps', 'overlaps');
      assert.equal(overlaps.projection.count, 12);
      assert(overlaps.rows.every(row => row[13] === '2026-11-01' && row[16] === '09:00-11:00' && row[19] === '09:00-11:00'));
      assert.equal((await collectExport('calendar-review', 'past', 'past')).projection.count, 5);
      const queue = await collectExport('calendar-unscheduled', 'summary', 'visits');
      assert.deepEqual(queue.rows[0]?.slice(11), [1, 1, 0]);
      assert.equal((await collectExport('calendar-unscheduled', 'visits', 'visits')).projection.count, 1);
      assert.equal((await collectExport('calendar-unscheduled', 'jobs', 'jobs')).projection.count, 1);
      assert.equal((await collectExport('calendar-unscheduled', 'workOrders', 'workOrders')).projection.count, 0);
    });
    await check('Calendar CSV narrows export populations before aggregation without changing read policy or hidden parent access', async () => {
      const permissions = enabled.filter(id => id !== 'jobs.export');
      const ordersOnly = await collectExport('calendar-scheduled', 'visits', 'visits', {}, permissions);
      assert.equal(ordersOnly.projection.count, 1);
      assert(!JSON.stringify(ordersOnly.rows).includes(jobs[0]));
      assert(!JSON.stringify(ordersOnly.rows).includes(teammate));
      assert.equal(ordersOnly.projection.outputScopes.jobs.kind, 'unavailable');
      const unavailable = await collectExport('calendar-unscheduled', 'summary', 'visits', {}, permissions);
      assert.deepEqual(unavailable.rows[0]?.slice(11), [0, null, 0]);
      await assert.rejects(collectExport('calendar-unscheduled', 'jobs', 'jobs', {}, permissions), AuthorizationAccessError);
      await assert.rejects(collectExport('calendar-scheduled', 'visits', 'visits',
        { filters: { participants: [], recordTypes: ['job'] } }, permissions), AuthorizationAccessError);
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'jobs.export' }).update({ scope: 'assigned' });
      const narrowed = await collectExport('calendar-scheduled', 'visits', 'visits');
      assert.equal(narrowed.projection.count, 1);
      assert.equal((await read()).counts.visits, 5);
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'workorders.export' }).update({ scope: 'assigned_job' });
      assert.equal((await collectExport('calendar-scheduled', 'visits', 'visits')).projection.count, 0);
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'jobs.export' }).update({ scope: 'workspace' });
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'workorders.export' }).update({ scope: 'workspace' });
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'assigned' });
      const own = await collectExport('calendar-scheduled', 'visits', 'visits');
      assert.equal(own.projection.scope.kind, 'own');
      assert.equal(own.projection.count, 0);
      await assert.rejects(collectExport('calendar-scheduled', 'visits', 'visits',
        { filters: { participants: [field], recordTypes: [] } }), AuthorizationAccessError);
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'workspace' });
      await assert.rejects(collectExport('calendar-scheduled', 'visits', 'visits', {},
        enabled.filter(id => id !== 'reports.export')), AuthorizationAccessError);
    });
    await check('Calendar CSV assigned-job export preserves supporting parent read while excluding drafts and enforcing own participation', async () => {
      const parent = await createJob(trx, identity, enabled, {postalCode:'10001',
        workspaceId, submissionId: randomUUID(), customerId, title: 'Parent assignment support',
        scheduledDate: '2026-11-05', primaryOwnerId: owner,
      });
      const visit = await readWorkOrderCreationVisit(trx, identity, enabled, parent.jobId);
      assert(visit?.canJoin);
      const issued = await createWorkOrder(trx, identity, enabled, {
        workspaceId, submissionId: randomUUID(), jobId: parent.jobId, title: 'Export assigned through parent',
        assigneeId: teammate, visit: { kind: 'job', visitId: visit.id, revision: visit.revision },
      });
      await mutateWorkOrder(trx, identity, enabled, {
        workspaceId, workOrderId: issued.workOrderId, submissionId: randomUUID(), expectedVersion: issued.version,
        action: 'status', to: 'issued', confirmed: true,
      });
      const draft = await createWorkOrder(trx, identity, enabled, {
        workspaceId, submissionId: randomUUID(), jobId: parent.jobId, title: 'Export excludes draft',
        assigneeId: owner, visit: { kind: 'job', visitId: visit.id,
          revision: (await readWorkOrderCreationVisit(trx, identity, enabled, parent.jobId))!.revision },
      });
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'workorders.export' }).update({ scope: 'assigned_job' });
      const patch = { period: { from: '2026-11-05', to: '2026-11-05' } };
      const permissions = enabled.filter(id => id !== 'jobs.export');
      const supported = await collectExport('calendar-scheduled', 'visits', 'visits', patch, permissions);
      assert.equal(supported.projection.count, 1);
      assert(JSON.stringify(supported.rows).includes(issued.workOrderId));
      assert(!JSON.stringify(supported.rows).includes(parent.jobId));
      assert(!JSON.stringify(supported.rows).includes(draft.workOrderId));
      assert.equal((await collectExport('calendar-scheduled', 'visits', 'visits', patch,
        permissions.filter(id => id !== 'jobs.read'))).projection.count, 0);
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'assigned' });
      assert.equal((await collectExport('calendar-scheduled', 'visits', 'visits', patch, permissions)).projection.count, 0);
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'workspace' });
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'workorders.export' }).update({ scope: 'workspace' });
    });
    await check('own scope retains self alone and hides unrelated records, participants and residual queues', async () => {
      const mine = await read(field);
      assert.equal(mine.scope.kind, 'own');
      assert.deepEqual(mine.counts, { visits: 4, busyPersonDays: 1 });
      assert.deepEqual(mine.members.map(member => member.id), [field]);
      assert(!JSON.stringify(mine).includes(teammate));
      assert(!JSON.stringify(mine).includes(unassigned.jobId));
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'assigned' });
      const draft = await createWorkOrder(trx, identity, enabled, {
        workspaceId, submissionId: randomUUID(), jobId: jobs[0], title: 'Assigned draft excluded', assigneeId: owner,
      });
      const draftLink = await trx('calendarVisitRecords').where({ workspaceId, workOrderId: draft.workOrderId }).whereNull('endedAt').first('visitId');
      await trx('calendarVisits').where({ id: draftLink.visitId }).update({ scheduledDate: '2026-11-01' });
      const narrowed = await read();
      assert.equal(narrowed.scope.kind, 'own');
      assert.equal(narrowed.counts.visits, 0);
      await trx('workOrders').where({ id: draft.workOrderId }).update({ archivedAt: trx.fn.now() });
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'workspace' });
    });
    await check('Work Order-only projection does not expose its hidden parent Job or other Job visits', async () => {
      const limited = await read(owner, {}, enabled.filter(id => id !== 'jobs.read'));
      assert.equal(limited.counts.visits, 1);
      if (limited.evidence.kind === 'visits') {
        assert.deepEqual(limited.evidence.rows[0]?.records.map(record => record.type), ['work_order']);
        assert(!JSON.stringify(limited).includes(jobs[0]));
      }
      for (const permission of ['reports.read', 'calendar.read']) {
        await assert.rejects(read(owner, {}, enabled.filter(id => id !== permission)), AuthorizationAccessError);
      }
      await assert.rejects(read(owner, {}, enabled.filter(id => id !== 'jobs.read' && id !== 'workorders.read')), AuthorizationAccessError);
      await assert.rejects(read(outsider), AuthorizationAccessError);
      await assert.rejects(read(owner, { workspaceId: randomUUID() }), AuthorizationAccessError);
    });
    await check('closed/archived records leave projections while canonical shared visit survives its remaining active record', async () => {
      await trx('jobs').where({ id: jobs[0] }).update({ status: 'completed' });
      const report = await read();
      assert.equal(report.counts.visits, 5);
      if (report.evidence.kind === 'visits') assert.deepEqual(report.evidence.rows.find(row => row.id === preview.id)?.records.map(record => record.type), ['work_order']);
      await trx('workOrders').where({ id: order.workOrderId }).update({ archivedAt: trx.fn.now() });
      assert.deepEqual((await read()).counts, { visits: 4, busyPersonDays: 0 });
      await trx('jobs').where({ id: jobs[0] }).update({ status: 'scheduled' });
      await trx('workOrders').where({ id: order.workOrderId }).update({ archivedAt: null });
    });
    await check('inclusive visit-date range and zero days remain exact across weeks and timezone changes', async () => {
      const range = { from: '2026-10-31', to: '2026-11-03' };
      for (const timezone of ['America/New_York', 'Asia/Kathmandu', 'Pacific/Kiritimati']) {
        await trx('workspaces').where({ id: workspaceId }).update({ timezone });
        const report = await read(owner, { period: range });
        assert.equal(report.days.length, 4);
        assert.equal(report.days[0]?.count, 0);
        assert.equal(report.days[3]?.count, 0);
        assert.equal(report.counts.visits, 5);
      }
    });
    await check('Calendar authority envelopes reconcile each native view, evidence kind and business-week initial period', async () => {
      await withWorkspaceAuthorization(trx, identity, enabled, false, async (transaction, context) => {
        const common = { workspaceId, filters: { participants: [], recordTypes: [] }, page: 1, pageSize: 25 as const };
        const period = { from: '2026-11-01', to: '2026-11-02' };
        for (const selected of ['visits', 'busy-person-days'] as const) {
          const query = { ...common, view: 'calendar-scheduled' as const, period, selected };
          const envelope = await readCalendarReportWithAuthorityInTransaction(transaction, context, query);
          assert.deepEqual(envelope.report, await readCalendarScheduledReportInTransaction(transaction, context, query));
          assert.equal(envelope.viewerId, owner); assert.equal(envelope.policyRevision, context.policy.revision);
          assert.equal(envelope.options.context, 'dated');
        }
        for (const selected of ['overlaps', 'past'] as const) {
          const query = { ...common, view: 'calendar-review' as const, period, selected };
          assert.deepEqual((await readCalendarReportWithAuthorityInTransaction(transaction, context, query)).report,
            await readCalendarReviewReportInTransaction(transaction, context, query));
        }
        for (const selected of ['visits', 'jobs', 'workOrders'] as const) {
          const query = { ...common, view: 'calendar-unscheduled' as const, selected };
          const envelope = await readCalendarReportWithAuthorityInTransaction(transaction, context, query);
          assert.deepEqual(envelope.report, await readCalendarUnscheduledReportInTransaction(transaction, context, query));
          assert.equal(envelope.options.context, 'unscheduled');
          assert(!('period' in envelope.query));
        }
        const initial = await initialCalendarReportWithAuthorityInTransaction(transaction, context);
        assert.equal(initial.canExport, true);
        assert.equal(initial.exportScopes?.jobs.kind, 'available');
        if (initial.query.view !== 'calendar-scheduled') throw new Error('Expected initial scheduled report.');
        const from = calendarWeekStart(initial.report.today);
        assert.deepEqual(initial.query.period, { from, to: addCalendarDays(from, 6) });
      });
    });
    await check('Calendar authority envelopes retain own viewer, authorized facets and denied entrance/supporting records', async () => {
      const query = { workspaceId, view: 'calendar-scheduled' as const, period: { from: '2026-11-01', to: '2026-11-02' },
        filters: { participants: [], recordTypes: [] }, selected: 'visits' as const, page: 1, pageSize: 25 as const };
      await withWorkspaceAuthorization(trx, { workspaceId, userId: field }, enabled, false, async (transaction, context) => {
        const envelope = await readCalendarReportWithAuthorityInTransaction(transaction, context, query);
        assert.equal(envelope.canExport, false);
        assert.equal(envelope.exportScopes, null);
        assert.deepEqual(envelope.scope, { kind: 'own', viewerId: field });
        assert(envelope.options.participants.every(option => option.value === field));
      });
      for (const denied of [['reports.read'], ['calendar.read'], ['jobs.read', 'workorders.read']]) {
        await withWorkspaceAuthorization(trx, identity, enabled.filter(id => !denied.includes(id)), false, async (transaction, context) => {
          await assert.rejects(readCalendarReportWithAuthorityInTransaction(transaction, context, query), AuthorizationAccessError);
          await assert.rejects(initialCalendarReportWithAuthorityInTransaction(transaction, context), AuthorizationAccessError);
        });
      }
      await withWorkspaceAuthorization(trx, identity, enabled, false, async (transaction, context) => {
        await assert.rejects(readCalendarReportWithAuthorityInTransaction(transaction, context,
          { ...query, workspaceId: randomUUID() }), AuthorizationAccessError);
      });
    });
    await check('Calendar CSV cursors include more than 100 visits and pairs, keep stable order and close after cancellation', async () => {
      for (let i = 0; i < 105; i++) await createJob(trx, identity, enabled, {postalCode:'10001',
        workspaceId, submissionId: randomUUID(), customerId, title: `Unpaged export ${i}`,
        scheduledDate: '2026-11-04', arrivalWindow: '09:00-11:00', primaryOwnerId: field,
      });
      const patch = { period: { from: '2026-11-04', to: '2026-11-04' } };
      const visits = await collectExport('calendar-scheduled', 'visits', 'visits', patch);
      assert.equal(visits.projection.count, 105);
      const ids = visits.rows.map(row => String(row[11]));
      assert.deepEqual(ids, [...ids].sort());
      assert.equal(new Set(ids).size, 105);
      const pairs = await collectExport('calendar-review', 'overlaps', 'overlaps', patch);
      assert.equal(pairs.projection.count, 5460);
      assert.equal(new Set(pairs.rows.map(row => JSON.stringify([row[11], row[14], row[17]]))).size, 5460);
      await withWorkspaceAuthorization(trx, identity, enabled, false, async (transaction, context) => {
        const input = calendarExportInputSchema.parse({ dataset: 'visits', query: {
          workspaceId, view: 'calendar-scheduled', selected: 'visits', ...patch,
        } });
        const projection = await prepareCalendarCSVProjectionInTransaction(transaction, context, input);
        const abort = new AbortController(), iterator = projection.rows(abort.signal);
        assert.equal((await iterator.next()).done, false);
        abort.abort();
        await assert.rejects(iterator.next(), error => error instanceof Error && error.name === 'AbortError');
        const cursors = await transaction.raw<{ rows: { name: string }[] }>('SELECT name FROM pg_cursors');
        assert(!cursors.rows.some(row => row.name.startsWith('calendar_csv_')));
      });
    });
    await check('bounded stable evidence clamps final pages and future schedules do not infer attendance', async () => {
      for (let i = 0; i < 27; i++) await createJob(trx, identity, enabled, {postalCode:'10001',
        workspaceId, submissionId: randomUUID(), customerId, title: 'Paged future visit',
        scheduledDate: '2026-11-02', primaryOwnerId: field,
      });
      const first = await read();
      const last = await read(owner, { page: 999 });
      assert.equal(first.counts.visits, 32);
      assert.equal(first.evidence.rows.length, 25);
      assert.equal(last.page, 2);
      assert.equal(last.evidence.rows.length, 7);
      if (first.evidence.kind === 'visits' && last.evidence.kind === 'visits') {
        assert.equal(new Set([...first.evidence.rows, ...last.evidence.rows].map(row => row.id)).size, 32);
      }
      const empty = await read(owner, { period: { from: '2099-01-01', to: '2099-01-02' } });
      assert.equal(empty.counts.visits, 0);
      assert.deepEqual(empty.days.map(day => day.count), [0, 0]);
      await trx('workspaceMemberships').where({ workspaceId, userId: field }).delete();
      await assert.rejects(read(field), AuthorizationAccessError);
      await assert.rejects(read(owner, { filters: { participants: [field], recordTypes: [] } }), AuthorizationAccessError);
      const options = await withWorkspaceAuthorization(trx, identity, enabled, false, (transaction, context) =>
        readCalendarReportFilterOptionsInTransaction(transaction, context, { workspaceId, context: 'dated' }));
      assert(!JSON.stringify(options).includes(field));
      assert.deepEqual(options.recordTypes.map(option => option.value), ['job', 'work_order']);
    });
    throw rollback;
  }), error => error === rollback);
  console.log(`${checks} Calendar scheduled report database journeys passed.`);
} finally { await db.destroy(); }
