import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  permissionIds, type EstimateDecisionsQuery, type EstimateCurrentQuery, type EstimateFirstQuotedQuery, type EstimateFrozenSnapshot,
  type FinancialEstimatesQuery,
} from '@salesmora/contracts';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy, withWorkspaceAuthorization, AuthorizationAccessError } from '../authorization/store';
import { estimateSnapshotHash, verifiedEstimateFrozenSnapshot } from '../estimates/sharing-paper';
import { estimateDecisionsEvidence, estimateDecisionsSource, readEstimateDecisionsReportInTransaction } from './estimate-decisions';
import { estimateCurrentEvidence, estimateCurrentSource, readEstimateCurrentReportInTransaction } from './estimate-current';
import { estimateFirstQuotedEvidence, estimateFirstQuotedSource, readEstimateFirstQuotedReportInTransaction } from './estimate-first-quoted';
import { readFinancialEstimatesReportInTransaction } from './financial-estimates';
import { readFinancialReportWithAuthorityInTransaction } from './financial-read';
import { prepareEstimateReportCSVProjectionInTransaction } from './estimate-export-projection';
import { prepareFinancialReportCSVProjectionInTransaction } from './financial-export-projection';
import { readEstimateReportWithAuthorityInTransaction, initialEstimateReportWithAuthorityInTransaction } from './estimate-read';
import { addCalendarDays } from '@salesmora/domain';

process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw new Error('Use a separate local _test database.');
const db = createDatabase(connection);
const workspaceId = randomUUID(), owner = randomUUID(), field = randomUUID(), outsider = randomUUID();
const jobId = randomUUID(), leadId = randomUUID();
const rollback = new Error('Rollback report rehearsal fixtures.');
let checks = 0;
async function check(name: string, run: () => Promise<void>) {
  await run(); checks++; console.log(`PASS ${name}`);
}
function snapshot(number: number, revision: number): EstimateFrozenSnapshot {
  return {
    formatVersion: 1,
    content: {
      number: `EST-${String(number).padStart(4, '0')}`, revision, name: 'Report quote',
      business: { name: 'Fixture business', address: '1 Fixture Street', phone: '2125550100',
        email: 'fixture@example.test', licenseLine: '', logoPath: null, requireServiceAddress: false },
      recipientName: 'Fixture customer', recipientEmail: '', serviceAddress: '', estimateDate: '2026-10-01',
      validUntil: '2026-10-31', preparedBy: '', relatedRecord: '', scope: '', message: '', paymentTerms: '', termsNote: '',
      items: [{ description: 'Fixture repair', quantity: '1', unitPrice: '100.00', taxable: true, included: false, unit: '' }],
      discount: { type: 'percent', value: '10' }, taxRate: '8', deposit: { type: 'percent', value: '25' },
    },
    amounts: { lineAmountsCents: [10000], subtotalCents: 10000, discountCents: 1000, taxCents: 720,
      totalCents: 9720, depositCents: 2430, balanceCents: 7290 },
  };
}
try {
  await assert.rejects(db.transaction(async trx => {
    await trx('users').insert([owner, field, outsider].map(id => ({
      id, name: 'Report fixture member', email: `${id}@example.test`,
      termsVersion: 'fixture', termsAcceptedAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
    })));
    await trx('workspaces').insert({
      id: workspaceId, ownerId: owner, businessName: 'Report fixture', businessType: 'test',
      postalCode: '', serviceRange: '', timezone: 'America/New_York',
    });
    await trx('workspaceMemberships').insert([
      { workspaceId, userId: owner, role: 'owner' }, { workspaceId, userId: field, role: 'field' },
    ]);
    await initializeWorkspacePolicy(trx, { workspaceId, userId: owner });
    await trx('jobs').insert({
      id: jobId, workspaceId, customerName: 'Fixture', title: 'Fixture', service: '', location: '',
      description: '', primaryOwnerId: field, createdBy: owner,
    });
    await trx('leads').insert({
      id: leadId, workspaceId, createdBy: owner, submissionId: randomUUID(), submissionHash: 'fixture',
      name: 'Fixture', email: '', phone: '', service: '', address: '', details: '', notes: '', source: 'website', stage: 'new',
    });
    const read = (userId = owner, patch: Partial<EstimateDecisionsQuery> = {}, enabled = [...permissionIds]) =>
      withWorkspaceAuthorization(trx, { workspaceId, userId }, enabled, false, (transaction, context) =>
        readEstimateDecisionsReportInTransaction(transaction, context, {
          workspaceId, view: 'estimate-decisions', period: { from: '2026-10-01', to: '2026-10-31' },
          selected: 'decided', page: 1, pageSize: 25, ...patch,
        }));
    const readCurrent = (userId = owner, patch: Partial<EstimateCurrentQuery> = {}, enabled = [...permissionIds]) =>
      withWorkspaceAuthorization(trx, { workspaceId, userId }, enabled, false, (transaction, context) =>
        readEstimateCurrentReportInTransaction(transaction, context, {
          workspaceId, view: 'estimate-current', selected: 'awaiting', page: 1, pageSize: 25, ...patch,
        }));
    const readFirst = (userId = owner, patch: Partial<EstimateFirstQuotedQuery> = {}, enabled = [...permissionIds]) =>
      withWorkspaceAuthorization(trx, { workspaceId, userId }, enabled, false, (transaction, context) =>
        readEstimateFirstQuotedReportInTransaction(transaction, context, {
          workspaceId, view: 'estimate-first-quoted', period: { from: '2026-10-01', to: '2026-10-31' },
          page: 1, pageSize: 25, ...patch,
        }));
    const readFinancial = (patch: Partial<FinancialEstimatesQuery> = {}, enabled = [...permissionIds], userId = owner) =>
      withWorkspaceAuthorization(trx, { workspaceId, userId }, enabled, false, (transaction, context) =>
        readFinancialEstimatesReportInTransaction(transaction, context, {
          workspaceId, view: 'financial-estimates', period: { from: '2026-10-01', to: '2026-10-31' },
          selected: 'accepted', filters: { owners: [], parents: [] }, page: 1, pageSize: 25, ...patch,
        }));
    async function seed(number: number, revision = 1, outcome: 'accepted' | 'declined' = 'accepted',
      options: { archived?: boolean; corrupt?: boolean; invalidAmounts?: boolean; parent?: 'lead'; status?: string } = {}) {
      const id = randomUUID(), snapshotId = randomUUID(), decisionId = randomUUID();
      await trx('estimates').insert({
        id, workspaceId, estimateNumber: number, revision, name: 'Report quote', version: 3,
        parentType: options.parent ?? 'job', jobId: options.parent ? null : jobId, leadId: options.parent ? leadId : null,
        status: options.status ?? outcome, publishedAt: '2026-10-01T16:00:00Z', createdBy: owner,
        createdAt: '2026-09-30T16:00:00Z',
        archivedAt: options.archived ? '2026-11-01T16:00:00Z' : null,
        acceptedTotalCents: outcome === 'accepted' ? 9720 : null,
      });
      const content = snapshot(number, revision);
      if (options.invalidAmounts) content.amounts.taxCents = 0;
      if (!options.corrupt && !options.invalidAmounts) {
        assert(verifiedEstimateFrozenSnapshot(content, estimateSnapshotHash(content)));
      }
      await trx('estimate_snapshots').insert({
        id: snapshotId, workspaceId, estimateId: id, estimateVersion: 2, content: JSON.stringify(content),
        contentHash: options.corrupt ? '0'.repeat(64) : estimateSnapshotHash(content),
        createdAt: '2026-10-01T16:00:00Z',
      });
      await trx('estimate_decisions').insert({
        id: decisionId, workspaceId, estimateId: id, snapshotId, estimateVersion: 3, outcome,
        decisionDate: '2026-10-15', channel: 'phone', note: 'PRIVATE_NOT_FOR_REPORT', snapshotTotalCents: 9720,
        actorId: owner, createdAt: '2026-11-01T04:30:00Z',
      });
      return { id, snapshotId, decisionId };
    }
    const accepted = await seed(1), declined = await seed(2, 1, 'declined');
    await check('Estimate CSV projections reconcile decisions and reject removed export authority', async () => {
      await trx('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission: 'reports.export', scope: 'enabled' });
      await trx('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission: 'reports.financial.read', scope: 'enabled' });
      await withWorkspaceAuthorization(trx, { workspaceId, userId: owner }, [...permissionIds], false, async (transaction, context) => {
        const query = { workspaceId, view: 'estimate-decisions' as const, period: { from: '2026-10-01', to: '2026-10-31' },
          selected: 'decided' as const, filters: { owners: [], parents: [] } };
        const envelope = await readEstimateReportWithAuthorityInTransaction(transaction, context, { ...query, page: 1, pageSize: 25 });
        assert.deepEqual(envelope.exportAccess, { scope: 'workspace', handoff: true });
        const projection = await prepareEstimateReportCSVProjectionInTransaction(transaction, context, { query, dataset: 'evidence' });
        const rows = [];
        for await (const row of projection.rows()) rows.push(row);
        assert.equal(projection.count, 2);
        assert.equal(rows.length, 2);
        assert(rows.every(row => row.length === projection.columns.length));
        assert.deepEqual(new Set(rows.map(row => row[10])), new Set([accepted.id, declined.id]));
        assert(!JSON.stringify(rows).includes('PRIVATE_NOT_FOR_REPORT'));
        const summary = await prepareEstimateReportCSVProjectionInTransaction(transaction, context, { query, dataset: 'summary' });
        const summaryRows = [];
        for await (const row of summary.rows()) summaryRows.push(row);
        assert.equal(summaryRows[0]?.[10], 1);
        assert.equal(summaryRows[0]?.[11], 1);
        for (const dataset of ['summary', 'evidence'] as const) {
          const financial = await prepareFinancialReportCSVProjectionInTransaction(transaction, context, {
            dataset, query: { workspaceId, view: 'financial', period: query.period, selected: 'accepted' },
          });
          const financialRows = [];
          for await (const row of financial.rows()) financialRows.push(row);
          assert.equal(financialRows.length, 1);
          assert(financialRows.every(row => row.length === financial.columns.length));
          assert(!financial.columns.includes('declined'));
        }
      });
      await withWorkspaceAuthorization(trx, { workspaceId, userId: owner }, permissionIds.filter(id => id !== 'estimates.export'), false,
        async (transaction, context) => {
          const envelope = await initialEstimateReportWithAuthorityInTransaction(transaction, context);
          assert.equal(envelope.exportAccess, null);
          await assert.rejects(prepareEstimateReportCSVProjectionInTransaction(transaction, context, { dataset: 'evidence',
            query: { workspaceId, view: 'estimate-current', selected: 'awaiting', filters: { owners: [], parents: [] } } }), AuthorizationAccessError);
        });
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.export' }).delete();
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.financial.read' }).delete();
    });
    await check('shared decision cursor matches native evidence, enforces narrowing and closes on cancellation', async () => {
      await withWorkspaceAuthorization(trx, { workspaceId, userId: owner }, [...permissionIds], false, async (transaction, context) => {
        const query: EstimateDecisionsQuery = { workspaceId, view: 'estimate-decisions',
          period: { from: '2026-10-01', to: '2026-10-31' }, selected: 'decided',
          filters: { owners: [], parents: [] }, page: 1, pageSize: 25 };
        const report = await readEstimateDecisionsReportInTransaction(transaction, context, query);
        const { source } = await estimateDecisionsSource(transaction, context, query);
        const rows = [];
        for await (const row of estimateDecisionsEvidence(transaction, context, source)) rows.push(row);
        assert.deepEqual(rows, report.rows);
        assert(!JSON.stringify(rows).includes('PRIVATE_NOT_FOR_REPORT'));
        const assigned = await readEstimateDecisionsReportInTransaction(transaction, context, query, true);
        assert.equal(assigned.scope, 'assigned_job');
        assert.equal(assigned.evidenceTotal, 0);
        const second = await estimateDecisionsSource(transaction, context, query);
        const aborted = new AbortController();
        const cursor = estimateDecisionsEvidence(transaction, context, second.source, aborted.signal);
        assert.equal((await cursor.next()).done, false);
        aborted.abort();
        await assert.rejects(cursor.next(), /abort/i);
        assert.equal((await transaction.raw('SELECT 1 AS value')).rows[0].value, 1);
      });
    });
    await check('Estimates authority envelopes retain native views, clock, pre-period facets and independent handoff access', async () => {
      await withWorkspaceAuthorization(trx, { workspaceId, userId: owner }, [...permissionIds], false, async (transaction, context) => {
        const initial = await initialEstimateReportWithAuthorityInTransaction(transaction, context);
        assert(initial.query.view === 'estimate-decisions');
        assert.deepEqual(initial.query.period, { from: addCalendarDays(initial.today, -29), to: initial.today });
        assert.equal(initial.query.selected, 'accepted');
        assert.deepEqual(initial.authority, { scope: 'workspace', archives: 'included', money: true, handoff: true });
        for (const selected of ['accepted', 'declined', 'decided'] as const) {
          const query: EstimateDecisionsQuery = { ...initial.query, period: { from: '2026-10-01', to: '2026-10-31' }, selected };
          const envelope = await readEstimateReportWithAuthorityInTransaction(transaction, context, query);
          assert.deepEqual(envelope.report, await readEstimateDecisionsReportInTransaction(transaction, context, query));
          assert.deepEqual(envelope.options.owners.map(option => option.value), ['unassigned']);
          assert.deepEqual(envelope.options.parents.map(option => option.value), ['job']);
        }
        const firstQuery = { workspaceId, view: 'estimate-first-quoted' as const,
          period: { from: '2026-10-01', to: '2026-10-31' }, filters: { owners: [], parents: [] }, page: 1, pageSize: 25 as const };
        const first = await readEstimateReportWithAuthorityInTransaction(transaction, context, firstQuery);
        assert.deepEqual(first.report, await readEstimateFirstQuotedReportInTransaction(transaction, context, firstQuery));
        for (const selected of ['awaiting', 'expired', 'handoff'] as const) {
          const query = { workspaceId, view: 'estimate-current' as const, selected, filters: { owners: [], parents: [] }, page: 1, pageSize: 25 as const };
          const envelope = await readEstimateReportWithAuthorityInTransaction(transaction, context, query);
          assert.deepEqual(envelope.report, await readEstimateCurrentReportInTransaction(transaction, context, query));
          assert.equal(envelope.options.context, 'current');
        }
        await assert.rejects(readEstimateReportWithAuthorityInTransaction(transaction, context,
          { ...initial.query, filters: { owners: [`member:${outsider}`], parents: [] } }), AuthorizationAccessError);
      });
      for (const excluded of ['reports.read', 'estimates.read', 'reports.financial.read', 'estimates.archive', 'leads.read']) {
        await withWorkspaceAuthorization(trx, { workspaceId, userId: owner }, permissionIds.filter(id => id !== excluded), false,
          async (transaction, context) => {
            if (excluded === 'reports.read' || excluded === 'estimates.read') {
              await assert.rejects(initialEstimateReportWithAuthorityInTransaction(transaction, context), AuthorizationAccessError);
            } else {
              const envelope = await initialEstimateReportWithAuthorityInTransaction(transaction, context);
              assert.equal(envelope.authority.money, true);
              assert.equal(envelope.authority.archives, excluded === 'estimates.archive' ? 'excluded' : 'included');
              assert.equal(envelope.authority.handoff, excluded !== 'leads.read');
            }
          });
      }
      await withWorkspaceAuthorization(trx, { workspaceId, userId: field }, [...permissionIds], false, async (transaction, context) => {
        const initial = await initialEstimateReportWithAuthorityInTransaction(transaction, context);
        assert.equal(initial.authority.scope, 'assigned_job');
        assert.equal(initial.authority.handoff, false);
        assert.deepEqual(initial.options.parents.map(option => option.value), ['job']);
        await assert.rejects(readEstimateReportWithAuthorityInTransaction(transaction, context,
          { ...initial.query, filters: { owners: [], parents: ['lead'] } }), AuthorizationAccessError);
      });
    });
    await check('Financial commitments require explicit opt-in and preserve ordinary Estimate access without a Financial grant', async () => {
      await assert.rejects(readFinancial(), AuthorizationAccessError);
      assert.equal((await read()).counts.accepted, 1);
      await trx('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission: 'reports.financial.read', scope: 'enabled' });
      const result = await readFinancial();
      assert.equal(result.estimates.kind, 'accepted');
      if (result.estimates.kind !== 'accepted') throw new Error('Expected accepted Financial commitments.');
      assert.deepEqual(result.estimates.report, await read(owner, { selected: 'accepted' }));
      assert(!JSON.stringify(result).includes('PRIVATE_NOT_FOR_REPORT'));
      await withWorkspaceAuthorization(trx, { workspaceId, userId: owner }, [...permissionIds], false, async (transaction, context) => {
        const unified = await readFinancialReportWithAuthorityInTransaction(transaction, context, {
          workspaceId, view: 'financial', period: { from: '2026-10-01', to: '2026-10-31' },
          selected: 'accepted', page: 1, pageSize: 25,
        });
        assert.deepEqual(unified.reports.accepted, result);
        assert.equal(unified.authority.estimates?.archives, 'included');
        assert.equal(unified.authority.estimates?.money, true);
        assert.equal(unified.reports.awaiting.estimates.kind, 'awaiting');
        assert.equal(unified.reports.materials.costs.kind, 'available');
      });
      await assert.rejects(readFinancial({}, permissionIds.filter(id => id !== 'reports.financial.read')), AuthorizationAccessError);
      await assert.rejects(readFinancial({}, permissionIds.filter(id => id !== 'reports.read')), AuthorizationAccessError);
      await assert.rejects(readFinancial({}, [...permissionIds], field), AuthorizationAccessError);
      await assert.rejects(readFinancial({ workspaceId: randomUUID() }), AuthorizationAccessError);
      await assert.rejects(readFinancial({ period: { from: '2099-01-01', to: '2099-01-02' } }), RangeError);
      assert.equal((await readFinancial({}, permissionIds.filter(id => id !== 'estimates.read'))).estimates.kind, 'unavailable');
    });
    await check('effective decisions use frozen discounted values, business dates and distinct families', async () => {
      const report = await read();
      assert.deepEqual(report.counts, { accepted: 1, declined: 1 });
      assert.deepEqual(report.money, { kind: 'available', preTaxCents: 9000, customerTotalCents: 9720 });
      assert.equal(report.rows[0]?.recordedDate, '2026-11-01');
      assert(!JSON.stringify(report).includes('PRIVATE_NOT_FOR_REPORT'));
    });
    await check('unissued drafts preserve decisions; new issuance restates superseded outcomes', async () => {
      const draft = randomUUID();
      await trx('estimates').insert({
        id: draft, workspaceId, estimateNumber: 2, revision: 2, name: 'Pending revision',
        parentType: 'job', jobId, status: 'draft', createdBy: owner,
      });
      assert.deepEqual((await read()).counts, { accepted: 1, declined: 1 });
      await trx('estimates').where({ id: draft }).update({ status: 'published', publishedAt: '2026-11-01T16:00:00Z' });
      await trx('estimates').where({ id: declined.id }).update({ status: 'superseded', supersededById: draft });
      assert.deepEqual((await read()).counts, { accepted: 1, declined: 0 });
    });
    await check('backdated corrections replace the latest version and archives honor current grants', async () => {
      await trx('estimate_decisions').insert({
        id: randomUUID(), workspaceId, estimateId: accepted.id, snapshotId: accepted.snapshotId,
        previousDecisionId: accepted.decisionId, estimateVersion: 4, outcome: 'declined',
        decisionDate: '2026-09-30', channel: 'phone', note: '', reason: 'Fixture correction', snapshotTotalCents: 9720, actorId: owner,
      });
      await trx('estimates').where({ id: accepted.id }).update({ status: 'declined', version: 4, acceptedTotalCents: null });
      assert.deepEqual((await read()).counts, { accepted: 0, declined: 0 });
      const september = await read(owner, { period: { from: '2026-09-01', to: '2026-09-30' } });
      assert.deepEqual(september.counts, { accepted: 0, declined: 1 });
      await seed(3, 1, 'accepted', { archived: true });
      assert.equal((await read()).counts.accepted, 1);
      const hidden = await read(owner, {}, permissionIds.filter(id => id !== 'estimates.archive'));
      assert.equal(hidden.archiveVisibility, 'excluded');
      assert.equal(hidden.counts.accepted, 0);
    });
    await check('invalid hashes preserve counts and explicitly withhold aggregate frozen values', async () => {
      await seed(4, 1, 'accepted', { corrupt: true });
      const report = await read();
      assert.equal(report.counts.accepted, 2);
      assert.equal(report.money.kind, 'unavailable');
      assert.equal(report.rows.find(row => row.estimateNumber === 'EST-0004')?.money.kind, 'unavailable');
      const financial = await readFinancial();
      if (financial.estimates.kind !== 'accepted') throw new Error('Expected Financial accepted section.');
      assert.equal(financial.estimates.report.money.kind, 'unavailable');
      assert.equal(financial.estimates.report.counts.accepted, 2);
    });
    await check('invalid frozen arithmetic and voided issued families cannot substitute current values or older decisions', async () => {
      const invalid = await seed(134, 1, 'accepted', { invalidAmounts: true });
      assert.equal((await read()).rows.find(row => row.recordId === invalid.id)?.money.kind, 'unavailable');
      await trx('estimates').where({ id: invalid.id }).update({ status: 'void' });
      assert(!(await read()).rows.some(row => row.recordId === invalid.id));
      const older = await seed(135);
      await seed(135, 2, 'declined', { status: 'void' });
      assert(!(await read()).rows.some(row => row.recordId === older.id));
      const missing = await seed(136);
      await trx('estimate_decisions').where({ estimateId: missing.id }).delete();
      await assert.rejects(read(), /decisionId/);
      await trx('estimates').where({ id: missing.id }).update({ status: 'void' });
    });
    await check('assigned scope, parent isolation, membership/grant revocation and future periods deny correctly', async () => {
      await seed(5, 1, 'accepted', { parent: 'lead' });
      const mine = await read(field);
      assert.equal(mine.scope, 'assigned_job');
      assert(!mine.rows.some(row => row.estimateNumber === 'EST-0005'));
      assert.equal(mine.archiveVisibility, 'excluded');
      for (const permission of ['reports.read', 'estimates.read', 'jobs.read']) {
        await assert.rejects(read(field, {}, permissionIds.filter(id => id !== permission)), AuthorizationAccessError);
      }
      await assert.rejects(read(outsider), AuthorizationAccessError);
      await assert.rejects(read(owner, {}, permissionIds.filter(id => id !== 'jobs.read' && id !== 'leads.read')), AuthorizationAccessError);
      await assert.rejects(read(owner, { workspaceId: randomUUID() }), AuthorizationAccessError);
      await assert.rejects(read(owner, { period: { from: '2099-01-01', to: '2099-01-02' } }), RangeError);
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'assigned' });
      const narrowed = await read();
      assert.equal(narrowed.scope, 'assigned_job');
      assert(!narrowed.rows.some(row => row.estimateNumber === 'EST-0005'));
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'workspace' });
      await trx('jobs').where({ id: jobId }).update({ primaryOwnerId: owner });
      assert.equal((await read(field)).evidenceTotal, 0);
      await trx('jobTeamMembers').insert({ workspaceId, jobId, userId: field });
      assert((await read(field)).evidenceTotal > 0);
      await trx('workspaceMemberships').where({ workspaceId, userId: field }).delete();
      await assert.rejects(read(field), AuthorizationAccessError);
    });
    await check('stable bounded pagination clamps past-end pages and verifies unseen accepted amounts', async () => {
      for (let number = 6; number <= 133; number++) await seed(number);
      const first = await read(owner, { selected: 'accepted' });
      const last = await read(owner, { selected: 'accepted', page: 999 });
      assert.equal(first.evidenceTotal, 131);
      assert.equal(first.rows.length, 25);
      assert.equal(last.page, 6);
      assert.equal(last.rows.length, 6);
      const middle = [];
      for (let page = 2; page <= 5; page++) middle.push(...(await read(owner, { selected: 'accepted', page })).rows);
      assert.equal(new Set([...first.rows, ...middle, ...last.rows].map(row => row.familyId)).size, 131);
      assert.equal(first.money.kind, 'unavailable');
      assert.equal(last.money.kind, 'unavailable');
      await trx('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission: 'reports.export', scope: 'enabled' });
      try {
        await withWorkspaceAuthorization(trx, { workspaceId, userId: owner }, [...permissionIds], false, async (transaction, context) => {
          const input = { dataset: 'evidence' as const, query: { workspaceId, view: 'estimate-decisions' as const,
            period: { from: '2026-10-01', to: '2026-10-31' }, selected: 'accepted' as const,
            filters: { owners: [], parents: [] } } };
          const projection = await prepareEstimateReportCSVProjectionInTransaction(transaction, context, input);
          const rows = [];
          for await (const row of projection.rows()) rows.push(row);
          assert.equal(rows.length, first.evidenceTotal);
          assert(rows.every(row => row.length === projection.columns.length));
          assert.equal(rows.find(row => row[11] === 'EST-0004')?.at(-1), 'unavailable');
          const summary = await prepareEstimateReportCSVProjectionInTransaction(transaction, context, { ...input, dataset: 'summary' });
          const summaries = [];
          for await (const row of summary.rows()) summaries.push(row);
          assert.deepEqual(summaries[0]?.slice(-3), [null, null, 'unavailable']);
          const controller = new AbortController();
          const cursor = projection.rows(controller.signal);
          assert.equal((await cursor.next()).done, false);
          controller.abort();
          await assert.rejects(cursor.next(), /abort/i);
        });
      } finally {
        await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.export' }).delete();
      }
    });
    await check('current queues use strict local expiry, frozen amounts, original issued age and latest issued families', async () => {
      const today = (await readCurrent()).today;
      const awaiting = await seed(200, 1, 'declined', { status: 'published' });
      const noExpiry = await seed(201, 1, 'declined', { status: 'sent' });
      const expired = await seed(202, 1, 'declined', { status: 'expired' });
      for (const id of [awaiting.id, noExpiry.id, expired.id]) await trx('estimate_decisions').where({ estimateId: id }).delete();
      await trx('estimates').where({ id: awaiting.id }).update({ validUntil: today });
      await trx('estimates').where({ id: noExpiry.id }).update({ validUntil: null, publishedAt: null, sentAt: trx.fn.now() });
      await trx('estimates').where({ id: expired.id }).update({ validUntil: '2026-10-15' });
      const before = await readCurrent();
      await withWorkspaceAuthorization(trx, { workspaceId, userId: owner }, [...permissionIds], false, async (transaction, context) => {
        const query: EstimateCurrentQuery = { workspaceId, view: 'estimate-current', selected: 'awaiting',
          filters: { owners: [], parents: [] }, page: 1, pageSize: 25 };
        const { auth, source, canHandoff } = await estimateCurrentSource(transaction, context, query);
        const rows = [];
        for await (const row of estimateCurrentEvidence(transaction, context, source, auth.clock.today, canHandoff)) {
          if (row.queue === 'awaiting') rows.push(row.evidence);
        }
        assert.deepEqual(rows, before.rows);
        const deniedHandoff = await readEstimateCurrentReportInTransaction(transaction, context, query, false, false);
        assert.equal(deniedHandoff.handoff.kind, 'unavailable');
        assert.deepEqual(deniedHandoff.rows, before.rows);
        const assigned = await readEstimateCurrentReportInTransaction(transaction, context, query, true);
        assert.equal(assigned.scope, 'assigned_job');
        assert.deepEqual(assigned.rows, before.rows.filter(row => row.parentType === 'job'));
      });
      // EST-0002's newer published revision from the decision fixture is also awaiting without expiry.
      assert.deepEqual(before.counts, { awaiting: 3, expired: 1 });
      assert.equal(before.awaitingMoney.kind, 'unavailable');
      const current = before.rows.find(row => row.recordId === noExpiry.id);
      assert.equal(current?.issuedDate, '2026-10-01');
      assert.equal(current?.money.kind, 'available');
      if (current?.money.kind === 'available') assert.equal(current.money.preTaxCents, 9000);
      await trx('estimates').insert({
        id: randomUUID(), workspaceId, estimateNumber: 200, revision: 2, name: 'Unissued Draft',
        status: 'draft', parentType: 'job', jobId, createdBy: owner,
      });
      assert((await readCurrent()).rows.some(row => row.recordId === awaiting.id));
      await seed(200, 3, 'declined', { status: 'void' });
      assert(!(await readCurrent()).rows.some(row => row.recordId === awaiting.id));
      const expiredResult = await readCurrent(owner, { selected: 'expired' });
      assert.deepEqual(expiredResult.rows.map(row => row.recordId), [expired.id]);
      assert.equal(expiredResult.rows[0]?.status, 'published');
      await trx('estimates').where({ id: noExpiry.id }).update({ archivedAt: trx.fn.now() });
      assert(!(await readCurrent()).rows.some(row => row.recordId === noExpiry.id));
    });
    await check('handoff proves both linkage absences and excludes archived Leads and all linked Job statuses', async () => {
      const handoff = await readCurrent(owner, { selected: 'handoff' });
      assert.equal(handoff.handoff.kind, 'available');
      assert.equal(handoff.evidenceTotal, 1);
      assert.equal(handoff.rows[0]?.estimateNumber, 'EST-0005');
      const quoteId = handoff.rows[0]!.recordId;
      await trx('leads').where({ id: leadId }).update({ archivedAt: trx.fn.now() });
      assert.equal((await readCurrent(owner, { selected: 'handoff' })).evidenceTotal, 0);
      await trx('leads').where({ id: leadId }).update({ archivedAt: null });
      const linked = randomUUID();
      await trx('jobs').insert({
        id: linked, workspaceId, customerName: 'Linked fixture', title: 'Linked fixture', service: '', location: '',
        description: '', status: 'completed', acceptedEstimateId: quoteId, createdBy: owner,
      });
      assert.equal((await readCurrent(owner, { selected: 'handoff' })).evidenceTotal, 0);
      await trx('jobs').where({ id: linked }).update({ acceptedEstimateId: null, sourceLeadId: leadId, status: 'canceled' });
      assert.equal((await readCurrent(owner, { selected: 'handoff' })).evidenceTotal, 0);
      await trx('jobs').where({ id: linked }).delete();
      assert.equal((await readCurrent(owner, { selected: 'handoff' })).evidenceTotal, 1);
    });
    await check('handoff access loss withholds stale evidence while authorized current quotes remain available', async () => {
      for (const permission of ['jobs.read', 'leads.read']) {
        const report = await readCurrent(owner, { selected: 'handoff' }, permissionIds.filter(id => id !== permission));
        assert.equal(report.handoff.kind, 'unavailable');
        assert.equal(report.rows.length, 0);
        assert.equal(report.evidenceTotal, 0);
        assert.equal(report.page, 1);
      }
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'assigned' });
      const narrowed = await readCurrent();
      assert.equal(narrowed.handoff.kind, 'unavailable');
      assert.equal(narrowed.scope, 'assigned_job');
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'workspace' });
      for (const permission of ['reports.read', 'estimates.read']) {
        await assert.rejects(readCurrent(owner, {}, permissionIds.filter(id => id !== permission)), AuthorizationAccessError);
      }
      await assert.rejects(readCurrent(owner, { workspaceId: randomUUID() }), AuthorizationAccessError);
      await trx('workspaceMemberships').insert({ workspaceId, userId: field, role: 'field' });
      await trx('jobTeamMembers').insert({ workspaceId, jobId, userId: field });
      const mine = await readCurrent(field);
      assert.equal(mine.scope, 'assigned_job');
      assert(mine.counts.awaiting > 0);
      const denied = await readCurrent(field, { selected: 'handoff', page: 999 });
      assert.equal(denied.handoff.kind, 'unavailable');
      assert.equal(denied.rows.length, 0);
      await trx('jobTeamMembers').where({ workspaceId, jobId, userId: field }).delete();
      assert.equal((await readCurrent(field)).counts.awaiting, 0);
      await trx('workspaceMemberships').where({ workspaceId, userId: field }).delete();
      await assert.rejects(readCurrent(field), AuthorizationAccessError);
    });
    await check('current cursor pages reconcile whole-population money and clamp stable evidence across batches', async () => {
      for (let number = 300; number <= 425; number++) {
        const pending = await seed(number, 1, 'declined', { status: 'published' });
        await trx('estimate_decisions').where({ estimateId: pending.id }).delete();
      }
      const first = await readCurrent();
      assert.equal(first.counts.awaiting, 127);
      assert.equal(first.rows.length, 25);
      const last = await readCurrent(owner, { page: 999 });
      assert.equal(last.page, 6);
      assert.equal(last.rows.length, 2);
      const rows = [...first.rows];
      for (let page = 2; page <= 6; page++) rows.push(...(await readCurrent(owner, { page })).rows);
      assert.equal(new Set(rows.map(row => row.familyId)).size, 127);
      const lackingSnapshot = await trx('estimates').where({ workspaceId, estimateNumber: 2, revision: 2 }).first('id');
      await trx('estimates').where({ id: lackingSnapshot.id }).update({ status: 'void' });
      const valid = await readCurrent();
      assert.deepEqual(valid.awaitingMoney, { kind: 'available', preTaxCents: 126 * 9000, customerTotalCents: 126 * 9720 });
      await trx('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission: 'reports.export', scope: 'enabled' });
      try {
        await withWorkspaceAuthorization(trx, { workspaceId, userId: owner }, [...permissionIds], false, async (transaction, context) => {
          const input = { dataset: 'evidence' as const, query: { workspaceId, view: 'estimate-current' as const,
            selected: 'awaiting' as const, filters: { owners: [], parents: [] } } };
          const projection = await prepareEstimateReportCSVProjectionInTransaction(transaction, context, input);
          const rows = [];
          for await (const row of projection.rows()) rows.push(row);
          assert.equal(rows.length, valid.evidenceTotal);
          assert(rows.every(row => row.length === projection.columns.length));
          const summary = await prepareEstimateReportCSVProjectionInTransaction(transaction, context, { ...input, dataset: 'summary' });
          const summaries = [];
          for await (const row of summary.rows()) summaries.push(row);
          assert.equal(summaries[0]?.[10], valid.counts.awaiting);
          const financialQuery = { workspaceId, view: 'financial' as const,
            period: { from: '2026-10-01', to: '2026-10-31' }, selected: 'awaiting' as const };
          for (const dataset of ['summary', 'evidence'] as const) {
            const financial = await prepareFinancialReportCSVProjectionInTransaction(transaction, context,
              { dataset, query: financialQuery });
            const financialRows = [];
            for await (const row of financial.rows()) financialRows.push(row);
            assert.equal(financialRows.length, dataset === 'summary' ? 1 : valid.evidenceTotal);
            assert(financialRows.every(row => row.length === financial.columns.length));
            if (dataset === 'evidence') {
              assert(financialRows.every(row => row[10] === 'Current issued Estimates. Handoff withheld.'));
              assert.deepEqual(financialRows.map(row => row.slice(11)), rows.map(row => row.slice(10)));
            } else assert.equal(financialRows[0]?.[11], valid.counts.awaiting);
            assert(!financial.columns.includes('handoff'));
          }
        });
        await withWorkspaceAuthorization(trx, { workspaceId, userId: owner },
          permissionIds.filter(id => id !== 'leads.export'), false, async (transaction, context) => {
            await assert.rejects(prepareEstimateReportCSVProjectionInTransaction(transaction, context, {
              dataset: 'evidence', query: { workspaceId, view: 'estimate-current', selected: 'handoff',
                filters: { owners: [], parents: [] } },
            }), AuthorizationAccessError);
          });
      } finally {
        await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.export' }).delete();
      }
    });
    await check('issued age and expiry use workspace calendar dates at DST and fractional timezone boundaries', async () => {
      const quote = await seed(426, 1, 'declined', { status: 'published' });
      await trx('estimate_decisions').where({ estimateId: quote.id }).delete();
      await trx('estimates').where({ id: quote.id }).update({ publishedAt: '2026-03-08T04:30:00Z' });
      for (const [timezone, issuedDate] of [
        ['America/New_York', '2026-03-07'], ['Asia/Kathmandu', '2026-03-08'], ['Pacific/Kiritimati', '2026-03-08'],
      ]) {
        await trx('workspaces').where({ id: workspaceId }).update({ timezone });
        const today = (await readCurrent()).today;
        await trx('estimates').where({ id: quote.id }).update({ validUntil: today });
        const report = await readCurrent(owner, { pageSize: 100, page: 999 });
        assert.equal(report.counts.awaiting, 127);
        const first = await readCurrent(owner, { pageSize: 100 });
        assert.equal(first.rows.find(row => row.recordId === quote.id)?.issuedDate, issuedDate);
        await trx('estimates').where({ id: quote.id }).update({
          validUntil: trx.raw(`?::date - 1`, [today]),
        });
        assert((await readCurrent(owner, { selected: 'expired' })).rows.some(row => row.recordId === quote.id));
      }
      await trx('workspaces').where({ id: workspaceId }).update({ timezone: 'America/New_York' });
    });
    await check('first-quoted coverage does not infer missing events from snapshots, dates or decisions', async () => {
      const report = await readFirst();
      assert.equal(report.total, 0);
      assert.equal(report.coverage.kind, 'partial');
    });
    async function issue(id: string, at: string, type: 'sent' | 'published' | 'resent' = 'published') {
      await trx('estimate_activity').insert({
        id: randomUUID(), workspaceId, estimateId: id, type, source: 'ui', actorId: owner, actorName: 'Fixture',
        changes: JSON.stringify(type === 'resent' ? {} : { status: { before: 'draft', after: type } }),
        createdAt: at,
      });
    }
    await check('first-quoted families count initial events once across resends, supersession, drafts and later voiding', async () => {
      const original = await seed(500, 1, 'declined', { status: 'superseded' });
      await issue(original.id, '2026-09-30T16:00:00Z', 'sent');
      await issue(original.id, '2026-10-15T16:00:00Z', 'resent');
      const revised = await seed(500, 2, 'declined', { status: 'void' });
      await issue(revised.id, '2026-10-10T16:00:00Z');
      const draft = randomUUID();
      await trx('estimates').insert({
        id: draft, workspaceId, estimateNumber: 500, revision: 3, name: 'Unissued next draft',
        status: 'draft', parentType: 'job', jobId, createdBy: owner,
      });
      assert.equal((await readFirst()).total, 0);
      const september = await readFirst(owner, { period: { from: '2026-09-01', to: '2026-09-30' } });
      assert.equal(september.total, 1);
      assert.equal(september.rows[0]?.firstIssuedRevision, 1);
      assert.equal(september.rows[0]?.firstIssuedVia, 'send');
      assert.equal(september.rows[0]?.currentIssuedRevision, 2);
      assert.equal(september.rows[0]?.currentStatus, 'void');
      assert.equal(september.rows[0]?.recordId, revised.id);
    });
    await check('archived historical first issuance honors grants and assigned scope revokes current Job access', async () => {
      const archived = await seed(501, 1, 'accepted', { archived: true });
      const leadQuote = await seed(502, 1, 'accepted', { parent: 'lead' });
      await issue(archived.id, '2026-10-01T16:00:00Z');
      await issue(leadQuote.id, '2026-10-02T16:00:00Z');
      assert.equal((await readFirst()).total, 2);
      assert.equal((await readFirst(owner, {}, permissionIds.filter(id => id !== 'estimates.archive'))).total, 1);
      await trx('workspaceMemberships').insert({ workspaceId, userId: field, role: 'field' });
      await trx('jobTeamMembers').insert({ workspaceId, jobId, userId: field });
      const mine = await readFirst(field);
      assert.equal(mine.total, 0);
      assert.equal(mine.scope, 'assigned_job');
      const pending = await seed(503, 1, 'declined', { status: 'published' });
      await issue(pending.id, '2026-10-03T16:00:00Z');
      assert.equal((await readFirst(field)).total, 1);
      await trx('jobTeamMembers').where({ workspaceId, jobId, userId: field }).delete();
      assert.equal((await readFirst(field)).total, 0);
      await trx('workspaceMemberships').where({ workspaceId, userId: field }).delete();
      await assert.rejects(readFirst(field), AuthorizationAccessError);
      for (const permission of ['reports.read', 'estimates.read']) {
        await assert.rejects(readFirst(owner, {}, permissionIds.filter(id => id !== permission)), AuthorizationAccessError);
      }
      await assert.rejects(readFirst(owner, { workspaceId: randomUUID() }), AuthorizationAccessError);
      await assert.rejects(readFirst(owner, { period: { from: '2099-01-01', to: '2099-01-02' } }), RangeError);
    });
    await check('first-quoted evidence pages remain stable and malformed initial events fail explicitly', async () => {
      for (let number = 504; number <= 530; number++) {
        const quote = await seed(number);
        await issue(quote.id, '2026-10-04T16:00:00Z');
      }
      const first = await readFirst();
      const last = await readFirst(owner, { page: 999 });
      assert.equal(first.total, 30);
      assert.equal(first.rows.length, 25);
      assert.equal(last.page, 2);
      assert.equal(last.rows.length, 5);
      assert.equal(new Set([...first.rows, ...last.rows].map(row => row.familyId)).size, 30);
      assert(!JSON.stringify(first).includes('money'));
      await trx('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission: 'reports.export', scope: 'enabled' });
      try {
        await withWorkspaceAuthorization(trx, { workspaceId, userId: owner }, [...permissionIds], false, async (transaction, context) => {
          const input = { dataset: 'evidence' as const, query: { workspaceId, view: 'estimate-first-quoted' as const,
            period: { from: '2026-10-01', to: '2026-10-31' }, filters: { owners: [], parents: [] } } };
          const projection = await prepareEstimateReportCSVProjectionInTransaction(transaction, context, input);
          const rows = [];
          for await (const row of projection.rows()) rows.push(row);
          assert.equal(rows.length, first.total);
          assert(rows.every(row => row.length === projection.columns.length));
          assert.deepEqual(rows.map(row => row[10]), [...first.rows, ...last.rows].map(row => row.recordId));
          const summary = await prepareEstimateReportCSVProjectionInTransaction(transaction, context, { ...input, dataset: 'summary' });
          const summaries = [];
          for await (const row of summary.rows()) summaries.push(row);
          assert.equal(summaries[0]?.[10], first.total);
          assert.equal(summaries[0]?.[11], first.coverage.kind);
        });
      } finally {
        await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.export' }).delete();
      }
      await withWorkspaceAuthorization(trx, { workspaceId, userId: owner }, [...permissionIds], false, async (transaction, context) => {
        const query: EstimateFirstQuotedQuery = { workspaceId, view: 'estimate-first-quoted',
          period: { from: '2026-10-01', to: '2026-10-31' }, filters: { owners: [], parents: [] }, page: 1, pageSize: 25 };
        const source = await estimateFirstQuotedSource(transaction, context, query), rows = [];
        for await (const row of estimateFirstQuotedEvidence(transaction, source, workspaceId)) rows.push(row);
        assert.deepEqual(rows, [...first.rows, ...last.rows]);
        const cancelled = new AbortController();
        const cursor = estimateFirstQuotedEvidence(transaction, source, workspaceId, cancelled.signal);
        assert.equal((await cursor.next()).done, false);
        cancelled.abort();
        await assert.rejects(cursor.next(), /abort/i);
        assert.equal((await transaction.raw('SELECT 1 AS value')).rows[0].value, 1);
      });
      const broken = await seed(531);
      await trx('estimate_activity').insert({
        id: randomUUID(), workspaceId, estimateId: broken.id, type: 'sent', source: 'ui', actorName: 'Fixture',
        changes: '{}', createdAt: '2026-10-04T16:00:00Z',
      });
      await assert.rejects(readFirst(), /inconsistent initial issuance/);
      await trx('estimate_activity').where({ estimateId: broken.id }).delete();
      assert.equal((await readFirst()).total, 30);
    });
    await check('first-quoted dates follow DST/fractional timezone boundaries without shifting to revision timestamps', async () => {
      const quote = await seed(532);
      await trx('estimates').where({ id: quote.id }).update({ createdAt: '2026-03-01T16:00:00Z' });
      await issue(quote.id, '2026-03-08T04:30:00Z', 'sent');
      for (const [timezone, date] of [['America/New_York', '2026-03-07'], ['Asia/Kathmandu', '2026-03-08']]) {
        await trx('workspaces').where({ id: workspaceId }).update({ timezone });
        const report = await readFirst(owner, { period: { from: '2026-03-01', to: '2026-03-31' } });
        assert.equal(report.rows[0]?.firstIssuedDate, date);
      }
      await trx('workspaces').where({ id: workspaceId }).update({ timezone: 'America/New_York' });
    });
    await check('complete coverage ignores inaccessible archived missing histories without widening scope', async () => {
      await trx('estimates as e').where({ 'e.workspaceId': workspaceId })
        .whereNotExists(trx('estimate_activity as a').select(trx.raw('1')).whereRaw(
          `a."workspaceId" = e."workspaceId" AND a."estimateId" = e.id AND a.type IN ('sent','published')`))
        .update({ archivedAt: trx.fn.now() });
      const report = await readFirst(owner, {}, permissionIds.filter(id => id !== 'estimates.archive'));
      assert.equal(report.coverage.kind, 'complete');
      assert.equal(report.total, 29);
      assert(report.rows.every(row => !row.archived));
    });
    await check('Estimate facets match current issued attribution across all views and reject stale or foreign selections', async () => {
      await trx('workspaceMemberships').insert({ workspaceId, userId: field, role: 'field' });
      await trx('jobTeamMembers').insert({ workspaceId, jobId, userId: field });
      const accepted = await seed(600);
      const pending = await seed(601, 1, 'declined', { status: 'published' });
      const lead = await seed(602, 1, 'accepted', { parent: 'lead' });
      await trx('estimates').whereIn('id', [accepted.id, pending.id, lead.id]).update({ ownerId: field });
      await trx('estimate_decisions').where({ estimateId: pending.id }).delete();
      for (const id of [accepted.id, pending.id, lead.id]) await issue(id, '2026-10-05T16:00:00Z');
      const filters = { owners: [`member:${field}`], parents: ['job'] as const };
      const jobFilters = { ...filters, parents: [...filters.parents] };
      const decisions = await read(owner, { filters: jobFilters });
      assert.deepEqual(decisions.counts, { accepted: 1, declined: 0 });
      assert.deepEqual(decisions.money, { kind: 'available', preTaxCents: 9000, customerTotalCents: 9720 });
      assert.equal(decisions.rows[0]?.ownerKey, `member:${field}`);
      const current = await readCurrent(owner, { filters: jobFilters });
      assert.equal(current.counts.awaiting, 1);
      assert.deepEqual(current.awaitingMoney, { kind: 'available', preTaxCents: 9000, customerTotalCents: 9720 });
      const first = await readFirst(owner, { filters: jobFilters });
      assert.equal(first.total, 2);
      assert.equal(first.coverage.kind, 'complete');
      assert.deepEqual(first.filters, jobFilters);
      const allParents = { owners: [`member:${field}`], parents: ['lead', 'job'] as ('lead' | 'job')[] };
      assert.equal((await read(owner, { filters: allParents })).counts.accepted, 2);
      assert.equal((await readFirst(owner, { filters: allParents })).total, 3);
      const handoff = await readCurrent(owner, { selected: 'handoff', filters: { owners: [`member:${field}`], parents: ['lead'] } });
      assert.equal(handoff.evidenceTotal, 1);
      assert.equal((await readCurrent(owner, { selected: 'handoff', filters: jobFilters })).evidenceTotal, 0);
      const older = await seed(603, 1, 'declined', { status: 'superseded' });
      await trx('estimates').where({ id: older.id }).update({ ownerId: owner });
      await issue(older.id, '2026-09-30T16:00:00Z', 'sent');
      const newer = await seed(603, 2);
      await trx('estimates').where({ id: newer.id }).update({ ownerId: field });
      await issue(newer.id, '2026-10-06T16:00:00Z');
      const otherOwner = await seed(604);
      await trx('estimates').where({ id: otherOwner.id }).update({ ownerId: owner });
      await issue(otherOwner.id, '2026-10-07T16:00:00Z');
      const ownerOnly = { owners: [`member:${owner}`], parents: [] };
      assert.deepEqual((await read(owner, { filters: ownerOnly })).rows.map(row => row.recordId), [otherOwner.id]);
      assert.deepEqual((await readFirst(owner, { filters: ownerOnly })).rows.map(row => row.recordId), [otherOwner.id]);
      assert.equal((await readFirst(owner, { filters: ownerOnly, period: { from: '2026-09-01', to: '2026-09-30' } })).total, 0);
      const bothOwners = { owners: [`member:${field}`, `member:${owner}`], parents: ['job'] as ('job' | 'lead')[] };
      assert.equal((await read(owner, { filters: bothOwners })).counts.accepted, 3);
      assert.equal((await readFirst(owner, { filters: bothOwners })).total, 3);
      const empty = await read(owner, { filters: { owners: [`member:${owner}`], parents: ['lead'] } });
      assert.equal(empty.evidenceTotal, 0);
      assert.equal((await read(field, { filters: { owners: [`member:${owner}`], parents: ['job'] } })).counts.accepted, 1);
      await assert.rejects(read(field, { filters: { owners: [], parents: ['lead'] } }), AuthorizationAccessError);
      for (const readView of [read, readCurrent, readFirst]) {
        await assert.rejects(readView(owner, { filters: { owners: [`member:${outsider}`], parents: [] } }), AuthorizationAccessError);
      }
      await trx('workspaceMemberships').where({ workspaceId, userId: field }).delete();
      for (const readView of [read, readCurrent, readFirst]) {
        await assert.rejects(readView(owner, { filters: jobFilters }), AuthorizationAccessError);
      }
      const former = await read(owner, { filters: { owners: ['unassigned'], parents: ['job'] } });
      const formerRows = [...former.rows];
      for (let page = 2; page <= Math.ceil(former.evidenceTotal / former.pageSize); page++) {
        formerRows.push(...(await read(owner, { filters: former.filters, page })).rows);
      }
      assert(formerRows.some(row => row.recordId === accepted.id && row.ownerKey === 'unassigned'));
      assert(!JSON.stringify(former).includes(`member:${field}`));
    });
    await check('Financial accepted and awaiting selections preserve native frozen-value, facets, archive and bounded pagination projections', async () => {
      for (const pageSize of [25, 50, 100] as const) {
        for (const selected of ['accepted', 'awaiting'] as const) {
          const result = await readFinancial({ selected, pageSize, page: 999 });
          const section = result.estimates;
          if (section.kind === 'unavailable') throw new Error('Expected Financial Estimate authority.');
          const native = selected === 'accepted' ? await read(owner, { selected, pageSize, page: 999 })
            : await readCurrent(owner, { selected, pageSize, page: 999 });
          assert.deepEqual(section.report, native);
        }
      }
      const before = await readFinancial({ selected: 'awaiting' });
      const after = await readFinancial({ selected: 'awaiting', period: { from: '2026-09-01', to: '2026-09-30' } });
      assert.deepEqual(before.estimates, after.estimates);
      const excluded = await readFinancial({}, permissionIds.filter(id => id !== 'estimates.archive'));
      if (excluded.estimates.kind !== 'accepted') throw new Error('Expected accepted section.');
      assert.equal(excluded.estimates.report.archiveVisibility, 'excluded');
      assert(excluded.estimates.report.rows.every(row => !row.archived));
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'assigned' });
      const assigned = await readFinancial();
      if (assigned.estimates.kind !== 'accepted') throw new Error('Expected assigned section.');
      assert.equal(assigned.estimates.report.scope, 'assigned_job');
      assert(assigned.estimates.report.rows.every(row => row.parentType === 'job'));
      assert.equal((await readFinancial({}, permissionIds.filter(id => id !== 'jobs.read'))).estimates.kind, 'unavailable');
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'workspace' });
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.financial.read' }).delete();
      await assert.rejects(readFinancial(), AuthorizationAccessError);
    });
    throw rollback;
  }), error => error === rollback);
  console.log(`${checks} Estimate report database journeys passed.`);
} finally {
  await db.destroy();
}
