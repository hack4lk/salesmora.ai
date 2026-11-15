import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import type { Knex } from 'knex';
import { permissionIds, financialReportQuerySchema, financialReportNativeQueries, type FinancialMaterialsQuery } from '@salesmora/contracts';
import { addCalendarDays } from '@salesmora/domain';
import { initializeWorkspacePolicy, withWorkspaceAuthorization, AuthorizationAccessError } from '../authorization/store';
import { createDatabase } from '../database';
import { readFinancialMaterialsReportInTransaction } from './financial-materials';
import { readFinancialEstimatesReportInTransaction } from './financial-estimates';
import { readFinancialReportWithAuthorityInTransaction, initialFinancialReportWithAuthorityInTransaction } from './financial-read';
import { prepareFinancialReportCSVProjectionInTransaction } from './financial-export-projection';

process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw new Error('Use a separate local _test database.');
const db = createDatabase(connection), workspaceId = randomUUID(), foreignWorkspace = randomUUID();
const owner = randomUUID(), admin = randomUUID(), office = randomUUID(), field = randomUUID(), outsider = randomUUID();
const enabled = [...permissionIds], rollback = new Error('Rollback Financial material fixtures.');
let checks = 0;
async function check(name: string, run: () => Promise<void>) { await run(); checks++; console.log(`PASS ${name}`); }
try {
  await assert.rejects(db.transaction(async trx => {
    await trx('users').insert([owner, admin, office, field, outsider].map(id => ({ id, name: 'Fictional Financial actor',
      email: `${id}@example.test`, termsVersion: 'fixture', termsAcceptedAt: new Date(), createdAt: new Date(), updatedAt: new Date() })));
    for (const [id, userId] of [[workspaceId, owner], [foreignWorkspace, outsider]]) {
      await trx('workspaces').insert({ id, ownerId: userId, businessName: 'Financial fixture', businessType: 'test',
        postalCode: '', serviceRange: '', timezone: 'America/New_York' });
      await trx('workspaceMemberships').insert({ workspaceId: id, userId, role: 'owner' });
      await initializeWorkspacePolicy(trx, { workspaceId: id!, userId: userId! });
    }
    await trx('workspaceMemberships').insert([
      { workspaceId, userId: admin, role: 'admin' }, { workspaceId, userId: office, role: 'office' },
      { workspaceId, userId: field, role: 'field' },
    ]);
    const readIn = (transaction: Knex.Transaction, patch: Partial<FinancialMaterialsQuery> = {}, permissions = enabled, userId = owner) =>
      withWorkspaceAuthorization(transaction, { workspaceId, userId }, permissions, false, (transaction, context) =>
        readFinancialMaterialsReportInTransaction(transaction, context, { workspaceId, view: 'financial-materials',
          filters: { statuses: [] }, selected: 'all', page: 1, pageSize: 25, ...patch }));
    const read = (patch: Partial<FinancialMaterialsQuery> = {}, permissions = enabled, userId = owner) => readIn(trx, patch, permissions, userId);
    await check('Financial permission is default-off for new workspaces and requires explicit eligible-role grants', async () => {
      assert.equal((await trx('workspaceRolePolicies').where({ workspaceId, permission: 'reports.financial.read' })).length, 0);
      await assert.rejects(read(), AuthorizationAccessError);
      await assert.rejects(read({}, enabled, admin), AuthorizationAccessError);
      await trx('workspaceRolePolicies').insert(['owner', 'admin'].map(role => ({
        workspaceId, role, permission: 'reports.financial.read', scope: 'enabled',
      })));
      await assert.rejects(read({}, enabled, office), AuthorizationAccessError);
      await assert.rejects(read({}, enabled, field), AuthorizationAccessError);
    });
    async function seedJob(userId: string, status = 'needs-scheduling', ws = workspaceId): Promise<string> {
      const id = randomUUID();
      await trx('jobs').insert({ id, workspaceId: ws, primaryOwnerId: userId, createdBy: ws === workspaceId ? owner : outsider,
        title: 'Authorized parent', customerName: 'PRIVATE_CUSTOMER', description: 'PRIVATE_JOB', service: '', location: '', status });
      return id;
    }
    const job = await seedJob(owner, 'completed'), hiddenJob = await seedJob(office, 'canceled');
    const foreignJob = await seedJob(outsider, 'needs-scheduling', foreignWorkspace);
    async function seedOrder(jobId: string, status = 'issued', archived = false, ws = workspaceId): Promise<string> {
      const id = randomUUID();
      await trx('workOrders').insert({ id, workspaceId: ws, jobId, title: 'Current cost fixture', status,
        instructions: 'PRIVATE_INSTRUCTIONS', accessNotes: 'PRIVATE_ACCESS', safetyNotes: 'PRIVATE_SAFETY',
        issuedAt: status === 'draft' ? null : '2026-10-01T12:00:00Z',
        completedAt: status === 'completed' ? '2026-10-02T12:00:00Z' : null,
        canceledAt: status === 'canceled' ? '2026-10-02T12:00:00Z' : null,
        cancellationReason: status === 'canceled' ? 'PRIVATE_CANCEL' : null,
        archivedAt: archived ? '2026-10-03T12:00:00Z' : null });
      return id;
    }
    const issued = await seedOrder(job), progress = await seedOrder(hiddenJob, 'in-progress');
    const excluded = [await seedOrder(job, 'draft'), await seedOrder(job, 'completed'),
      await seedOrder(job, 'canceled'), await seedOrder(job, 'issued', true)];
    const foreignOrder = await seedOrder(foreignJob, 'issued', false, foreignWorkspace);
    async function line(orderId: string, quantity: string, cost: number | null, status = 'needed', ws = workspaceId): Promise<string> {
      const id = randomUUID();
      await trx('workOrderMaterials').insert({ id, workspaceId: ws, workOrderId: orderId, position: 0,
        name: 'Recorded pipe', quantity, costCents: cost, customerPriceCents: 999999, status, unit: 'each', note: 'PRIVATE_MATERIAL_NOTE' });
      return id;
    }
    const half = await line(issued, '0.005', 100), roundedDown = await line(issued, '0.004', 100);
    const missing = await line(issued, '2', null, 'ordered'), zero = await line(progress, '1', 0, 'on-hand');
    const used = await line(progress, '1.125', 100, 'used');
    for (const orderId of excluded) await line(orderId, '999', 999999);
    await line(foreignOrder, '999', 999999, 'needed', foreignWorkspace);
    await trx('workOrderCrew').insert([{ workspaceId, workOrderId: issued, userId: owner },
      { workspaceId, workOrderId: issued, userId: admin }, { workspaceId, workOrderId: progress, userId: admin }]);
    await check('unified Financial authority preserves native costs, Estimate coverage, session identity and initial local dates', async () => {
      await withWorkspaceAuthorization(trx, { workspaceId, userId: owner }, enabled, false, async (transaction, context) => {
        const initial = await initialFinancialReportWithAuthorityInTransaction(transaction, context);
        assert.equal(initial.viewerId, owner);
        assert.equal(initial.policyRevision, context.policy.revision);
        assert.deepEqual(initial.query.period, { from: addCalendarDays(initial.today, -29), to: initial.today });
        assert.equal(initial.query.selected, 'accepted');
        for (const selected of ['accepted', 'awaiting', 'materials'] as const) {
          const query = financialReportQuerySchema.parse({ ...initial.query, selected, page: 100 });
          const result = await readFinancialReportWithAuthorityInTransaction(transaction, context, query);
          const requests = financialReportNativeQueries(query);
          assert.deepEqual(result.reports.accepted, await readFinancialEstimatesReportInTransaction(transaction, context, requests.accepted));
          assert.deepEqual(result.reports.awaiting, await readFinancialEstimatesReportInTransaction(transaction, context, requests.awaiting));
          assert.deepEqual(result.reports.materials, await readFinancialMaterialsReportInTransaction(transaction, context, requests.materials));
          assert.equal(result.authority.materials.costs, true);
        }
        await assert.rejects(readFinancialReportWithAuthorityInTransaction(transaction, context,
          { ...initial.query, workspaceId: foreignWorkspace }), AuthorizationAccessError);
      });
      for (const permission of ['reports.read', 'reports.financial.read']) {
        await assert.rejects(withWorkspaceAuthorization(trx, { workspaceId, userId: owner },
          enabled.filter(id => id !== permission), false, initialFinancialReportWithAuthorityInTransaction), AuthorizationAccessError);
      }
      await withWorkspaceAuthorization(trx, { workspaceId, userId: owner },
        enabled.filter(id => !['estimates.read', 'workorders.view_costs', 'jobs.read'].includes(id)), false, async (transaction, context) => {
          const result = await initialFinancialReportWithAuthorityInTransaction(transaction, context);
          assert.equal(result.authority.estimates, null);
          assert.equal(result.reports.accepted.estimates.kind, 'unavailable');
          assert.equal(result.authority.materials.read, true);
          assert.equal(result.authority.materials.costs, false);
          assert.equal(result.authority.materials.jobLabels, false);
          assert.equal(result.reports.materials.costs.kind, 'unavailable');
        });
    });
    await check('current active lifecycle scope uses per-line half-up rounding, explicit missing coverage, zero costs and four workflow groups', async () => {
      const result = await read();
      assert.equal(result.costs.kind, 'available');
      if (result.costs.kind !== 'available') throw new Error('Expected cost authority.');
      assert.deepEqual(result.costs.coverage, { lineCount: 5, knownCostLines: 4, missingCostLines: 1, knownCostCents: 114 });
      assert.equal(result.evidenceTotal, 5);
      assert.equal(result.rows.find(row => row.id === half)?.lineCostCents, 1);
      assert.equal(result.rows.find(row => row.id === roundedDown)?.lineCostCents, 0);
      assert.equal(result.rows.find(row => row.id === missing)?.lineCostCents, null);
      assert.equal(result.rows.find(row => row.id === zero)?.lineCostCents, 0);
      assert.equal(result.rows.find(row => row.id === used)?.lineCostCents, 113);
      assert.equal(result.archiveVisibility, 'excluded');
      assert.equal(result.costs.groups.length, 4);
      assert(!JSON.stringify(result).includes('PRIVATE_'));
      assert(!JSON.stringify(result).includes('customerPriceCents'));
      assert(!JSON.stringify(result).includes(foreignOrder));
    });
    await check('known/missing evidence and OR status facets do not change rounding or infer actual spending from Used', async () => {
      const known = await read({ selected: 'known' }), absent = await read({ selected: 'missing' });
      assert.equal(known.evidenceTotal, 4);
      assert.equal(absent.evidenceTotal, 1);
      assert.equal(absent.rows[0]?.id, missing);
      assert.deepEqual(known.costs, absent.costs);
      const filtered = await read({ filters: { statuses: ['needed', 'used'] } });
      assert.equal(filtered.evidenceTotal, 3);
      assert(filtered.rows.every(row => ['needed', 'used'].includes(row.status)));
      assert(filtered.scopeLabel.includes('Not actual spend'));
    });
    await check('Financial entrance revocation, feature disablement, foreign workspaces and no authorized Reports sources fail closed', async () => {
      for (const permission of ['reports.financial.read', 'reports.read'] as const) {
        await assert.rejects(read({}, enabled.filter(id => id !== permission)), AuthorizationAccessError);
      }
      await assert.rejects(read({}, enabled.filter(id => id !== 'leads.read' && id !== 'jobs.read')), AuthorizationAccessError);
      await assert.rejects(read({ workspaceId: foreignWorkspace }), AuthorizationAccessError);
      await assert.rejects(read({}, enabled, outsider), AuthorizationAccessError);
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.financial.read' }).delete();
      await assert.rejects(read(), AuthorizationAccessError);
      await trx('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission: 'reports.financial.read', scope: 'enabled' });
    });
    await check('missing Work Order read/price/cost authority withholds the entire material section, never success-shaped zero costs', async () => {
      for (const permission of ['workorders.read', 'workorders.view_prices', 'workorders.view_costs'] as const) {
        const result = await read({}, enabled.filter(id => id !== permission));
        assert.equal(result.costs.kind, 'unavailable');
        assert.equal(result.rows.length, 0);
        assert.equal(result.evidenceTotal, 0);
        assert(!JSON.stringify(result).includes('Recorded pipe'));
      }
      assert.equal((await read({}, enabled, admin)).evidenceTotal, 5);
      assert.equal((await read({}, enabled.filter(id => id !== 'workorders.archive'))).evidenceTotal, 5);
    });
    await check('assigned Reports intersects primary/crew/parent Job authority; Job read loss redacts parent labels without losing Work Order costs', async () => {
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'assigned' });
      assert.equal((await read()).evidenceTotal, 3);
      const hiddenLabels = await read({}, enabled.filter(id => id !== 'jobs.read'));
      assert.equal(hiddenLabels.evidenceTotal, 3);
      assert(hiddenLabels.rows.every(row => row.jobLabel === null));
      await trx('workOrders').where({ id: progress }).update({ primaryAssigneeId: owner });
      const assigned = await read();
      assert.equal(assigned.scope, 'assigned');
      assert.equal(assigned.evidenceTotal, 5);
      assert(assigned.rows.filter(row => row.workOrderId === progress).every(row => row.jobLabel === null));
      await trx('workOrders').where({ id: progress }).update({ primaryAssigneeId: null });
      await trx('workOrderCrew').where({ workspaceId, workOrderId: issued, userId: owner }).delete();
      await trx('jobs').where({ id: job }).update({ primaryOwnerId: office });
      assert.equal((await read()).evidenceTotal, 0);
      await trx('jobs').where({ id: job }).update({ primaryOwnerId: owner });
      await trx('workOrderCrew').insert({ workspaceId, workOrderId: issued, userId: owner });
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'workspace' });
    });
    await check('current edits restate costs and changed-after-issue without substituting catalog prices or excluding completed parent Jobs', async () => {
      await trx('workOrderMaterials').where({ id: used }).update({ quantity: '2.125', costCents: 100 });
      await trx('workOrders').where({ id: progress }).update({ changedAfterIssueAt: '2026-11-07T12:00:00Z' });
      const result = await read();
      assert.equal(result.rows.find(row => row.id === used)?.lineCostCents, 213);
      assert(result.rows.find(row => row.id === used)?.changedAfterIssue);
      if (result.costs.kind !== 'available') throw new Error('Expected cost authority.');
      assert.equal(result.costs.coverage.knownCostCents, 214);
      await trx('workOrderMaterials').where({ id: used }).update({ quantity: '1.125' });
    });
    const malformedRollback = new Error('Rollback malformed material metadata.');
    await assert.rejects(trx.transaction(async inner => {
      await check('malformed authorized material metadata fails across the population but inaccessible/excluded rows never fail', async () => {
        await inner('workOrderMaterials').where({ id: missing }).update({ name: 'PRIVATE\nINVALID' });
        await assert.rejects(readIn(inner, { selected: 'known' }), /control|Invalid|Financial|custom/);
        assert.equal((await readIn(inner, {}, enabled.filter(id => id !== 'workorders.view_costs'))).costs.kind, 'unavailable');
        await inner('workOrderMaterials').where({ id: missing }).update({ name: 'Recorded pipe' });
        await inner('workOrderMaterials').where({ workOrderId: excluded[0] }).update({ name: 'PRIVATE\nINVALID' });
        assert.equal((await readIn(inner)).evidenceTotal, 5);
      });
      throw malformedRollback;
    }), error => error === malformedRollback);
    const overflowRollback = new Error('Rollback overflow cost fixtures.');
    await assert.rejects(trx.transaction(async inner => {
      await check('whole-population cost sum overflow fails explicitly instead of rounded unsafe totals', async () => {
        await inner('workOrderMaterials').insert(Array.from({ length: 5 }, () => ({
          id: randomUUID(), workspaceId, workOrderId: issued, position: 0, name: 'Large valid line',
          quantity: '999999.999', costCents: 2_147_483_647, unit: 'each', status: 'needed',
        })));
        await assert.rejects(readIn(inner), /safe integer/);
      });
      throw overflowRollback;
    }), error => error === overflowRollback);
    await check('stable bounded 25/50/100 evidence pages share whole-population coverage and reject unseen corrupt metadata', async () => {
      for (let i = 0; i < 121; i++) await line(issued, '0.005', 100);
      for (const pageSize of [25, 50, 100] as const) {
        const first = await read({ pageSize }), last = await read({ pageSize, page: 999 });
        assert.equal(first.evidenceTotal, 126);
        assert.equal(first.rows.length, pageSize);
        assert.equal(last.page, Math.ceil(126 / pageSize));
        assert.equal(last.rows.length, 126 % pageSize);
        assert.deepEqual(first.costs, last.costs);
        assert(last.rows.every(row => !first.rows.some(initial => initial.id === row.id)));
      }
      await trx('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission: 'reports.export', scope: 'enabled' });
      try {
        const query = { workspaceId, view: 'financial' as const, period: { from: '2026-10-01', to: '2026-10-31' },
          selected: 'materials' as const };
        await withWorkspaceAuthorization(trx, { workspaceId, userId: owner }, enabled, false, async (transaction, context) => {
          const projection = await prepareFinancialReportCSVProjectionInTransaction(transaction, context, { query, dataset: 'evidence' });
          const rows = [];
          for await (const row of projection.rows()) rows.push(row);
          const first = await readFinancialMaterialsReportInTransaction(transaction, context,
            { workspaceId, view: 'financial-materials', filters: { statuses: [] }, selected: 'all', page: 1, pageSize: 100 });
          const last = await readFinancialMaterialsReportInTransaction(transaction, context,
            { workspaceId, view: 'financial-materials', filters: { statuses: [] }, selected: 'all', page: 2, pageSize: 100 });
          assert.equal(projection.count, 126);
          assert.deepEqual(rows.map(row => row[5]), [...first.rows, ...last.rows].map(row => row.id));
          assert(rows.every(row => row.length === projection.columns.length));
          assert.equal(rows.find(row => row[5] === missing)?.[15], null);
          assert(!JSON.stringify(rows).includes('PRIVATE_MATERIAL_NOTE'));
          const summary = await prepareFinancialReportCSVProjectionInTransaction(transaction, context, { query, dataset: 'summary' });
          const summaries = [];
          for await (const row of summary.rows()) summaries.push(row);
          assert.equal(summaries[0]?.[5], 126);
          const cancelled = new AbortController(), cursor = projection.rows(cancelled.signal);
          assert.equal((await cursor.next()).done, false);
          cancelled.abort();
          await assert.rejects(cursor.next(), /abort/i);
        });
        await withWorkspaceAuthorization(trx, { workspaceId, userId: owner },
          enabled.filter(id => id !== 'jobs.export'), false, async (transaction, context) => {
            const projection = await prepareFinancialReportCSVProjectionInTransaction(transaction, context, { query, dataset: 'evidence' });
            const rows = [];
            for await (const row of projection.rows()) rows.push(row);
            assert(rows.every(row => row[8] === null));
          });
        await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'jobs.export' }).update({ scope: 'assigned' });
        try {
          await withWorkspaceAuthorization(trx, { workspaceId, userId: owner }, enabled, false, async (transaction, context) => {
            const projection = await prepareFinancialReportCSVProjectionInTransaction(transaction, context, { query, dataset: 'evidence' });
            const rows = [];
            for await (const row of projection.rows()) rows.push(row);
            assert.equal(projection.jobScope, 'assigned');
            assert(rows.filter(row => row[6] === progress).every(row => row[8] === null));
            assert(rows.filter(row => row[6] === issued).every(row => typeof row[8] === 'string'));
          });
          await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'workorders.export' }).update({ scope: 'assigned_job' });
          try {
            await withWorkspaceAuthorization(trx, { workspaceId, userId: owner }, enabled, false, async (transaction, context) => {
              const projection = await prepareFinancialReportCSVProjectionInTransaction(transaction, context, { query, dataset: 'evidence' });
              const rows = [];
              for await (const row of projection.rows()) rows.push(row);
              assert.equal(projection.scope, 'assigned');
              assert.equal(rows.length, 124);
              assert(rows.every(row => row[6] === issued));
            });
          } finally {
            await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'workorders.export' }).update({ scope: 'workspace' });
          }
        } finally {
          await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'jobs.export' }).update({ scope: 'workspace' });
        }
      } finally {
        await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.export' }).delete();
      }
      await trx('workOrderMaterials').insert({ id: 'ffffffff-ffff-4fff-8fff-ffffffffffff', workspaceId, workOrderId: issued,
        position: 0, name: 'PRIVATE\nUNSEEN', quantity: '1', costCents: 1, status: 'needed', unit: 'each' });
      await assert.rejects(read({ pageSize: 25, selected: 'missing' }), /control|Invalid|Financial|custom/);
    });
    throw rollback;
  }), error => error === rollback);
  console.log(`${checks} Financial material database journeys passed.`);
} finally { await db.destroy(); }
