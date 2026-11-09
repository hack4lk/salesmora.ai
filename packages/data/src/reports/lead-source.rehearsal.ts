import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import type { Knex } from 'knex';
import {
  leadSources, permissionIds, type LeadSourceExportInput, type LeadSourceQuery, type EstimateFrozenSnapshot,
} from '@salesmora/contracts';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy, withWorkspaceAuthorization, AuthorizationAccessError } from '../authorization/store';
import { readLeadSourceReportInTransaction } from './lead-source';
import { prepareLeadSourceCSVProjectionInTransaction } from './lead-source-export-projection';
import { readLeadSourceReportWithAuthorityInTransaction, initialLeadSourceReportWithAuthorityInTransaction } from './lead-source-read';
import { addCalendarDays } from '@salesmora/domain';
import { estimateSnapshotHash, verifiedEstimateFrozenSnapshot } from '../estimates/sharing-paper';

process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw new Error('Use a separate local _test database.');
const db = createDatabase(connection);
const workspaceId = randomUUID(), otherWorkspace = randomUUID();
const owner = randomUUID(), field = randomUUID(), teammate = randomUUID(), outsider = randomUUID(), otherOwner = randomUUID();
const enabled = [...permissionIds], identity = { workspaceId, userId: owner };
const rollback = new Error('Rollback source-cohort fixtures.');
let checks = 0;
async function check(name: string, run: () => Promise<void>) { await run(); checks++; console.log(`PASS ${name}`); }
try {
  await assert.rejects(db.transaction(async trx => {
    await trx('users').insert([owner, field, teammate, outsider, otherOwner].map(id => ({
      id, name: `Source report ${id}`, email: `${id}@example.test`, createdAt: new Date(),
      updatedAt: new Date(), termsVersion: 'fixture', termsAcceptedAt: new Date(),
    })));
    await trx('workspaces').insert([
      { id: workspaceId, ownerId: owner }, { id: otherWorkspace, ownerId: otherOwner },
    ].map(row => ({ ...row, businessName: 'Source report fixture', businessType: 'test', postalCode: '', serviceRange: '', timezone: 'America/New_York' })));
    await trx('workspaceMemberships').insert([
      { workspaceId, userId: owner, role: 'owner' }, { workspaceId, userId: field, role: 'field' },
      { workspaceId, userId: teammate, role: 'office' }, { workspaceId: otherWorkspace, userId: otherOwner, role: 'owner' },
    ]);
    await initializeWorkspacePolicy(trx, identity);
    await initializeWorkspacePolicy(trx, { workspaceId: otherWorkspace, userId: otherOwner });
    await trx('workspaceRolePolicies').insert({
      workspaceId, role: 'owner', permission: 'reports.export', scope: 'enabled',
    });
    const seedLead = async (source: typeof leadSources[number], createdAt: string, patch: {
      workspaceId?: string; ownerId?: string | null; archivedAt?: Date | null; stage?: string;
    } = {}) => {
      const id = randomUUID();
      await trx('leads').insert({
        id, workspaceId, createdBy: owner, submissionId: randomUUID(), submissionHash: 'source-fixture',
        name: 'Source cohort lead', email: '', phone: '', service: 'Repair', address: '', details: 'private source details',
        notes: 'private source notes', source, stage: 'new', ownerId: teammate, createdAt, ...patch,
      });
      return id;
    };
    const ids: string[] = [];
    for (const source of leadSources) ids.push(await seedLead(source,
      source === 'website' ? '2026-11-01T04:00:00Z' : source === 'other' ? '2026-11-03T04:59:59.999Z' : '2026-11-02T12:00:00Z',
      { ownerId: source === 'website' ? field : teammate,
        archivedAt: source === 'phone' ? new Date('2026-11-04T12:00:00Z') : null,
        stage: source === 'gmail' ? 'won' : 'new' }));
    const extraWebsite = await seedLead('website', '2026-11-02T12:00:00Z');
    await seedLead('website', '2026-11-01T03:59:59.999Z');
    await seedLead('website', '2026-11-03T05:00:00Z');
    await seedLead('website', '2026-11-02T12:00:00Z', { workspaceId: otherWorkspace, ownerId: otherOwner });
    const seedJob = async (leadId: string, status = 'needs-scheduling') => {
      const id = randomUUID();
      await trx('jobs').insert({
        id, workspaceId, customerName: 'Cohort customer', title: 'Surviving linked Job', service: '', location: '', description: '',
        sourceLeadId: leadId, primaryOwnerId: field, createdBy: owner, status, createdAt: '2026-11-04T12:00:00Z',
      });
      return id;
    };
    const jobIds = [await seedJob(ids[0], 'canceled'), await seedJob(ids[1]), await seedJob(ids[2])];
    await trx('jobTeamMembers').insert([
      { workspaceId, jobId: jobIds[0], userId: field }, { workspaceId, jobId: jobIds[0], userId: teammate },
    ]);
    const readIn = (transaction: Knex.Transaction, userId = owner, patch: Partial<LeadSourceQuery> = {}, permissions = enabled) =>
      withWorkspaceAuthorization(transaction, { workspaceId, userId }, permissions, false, (transaction, context) =>
        readLeadSourceReportInTransaction(transaction, context, {
          workspaceId, view: 'lead-source', period: { from: '2026-11-01', to: '2026-11-02' },
          selected: 'cohort', page: 1, pageSize: 25, ...patch,
        }));
    const read = (userId = owner, patch: Partial<LeadSourceQuery> = {}, permissions = enabled) => readIn(trx, userId, patch, permissions);
    const readEnvelope = (transaction: Knex.Transaction, userId = owner, patch: Partial<LeadSourceQuery> = {}, permissions = enabled) =>
      withWorkspaceAuthorization(transaction, { workspaceId, userId }, permissions, false, (transaction, context) =>
        readLeadSourceReportWithAuthorityInTransaction(transaction, context, {
          workspaceId, view: 'lead-source', period: { from: '2026-11-01', to: '2026-11-02' },
          selected: 'cohort', page: 1, pageSize: 25, ...patch,
        }));
    await check('session-bound Sources envelopes reconcile native evidence and independent readable capabilities', async () => {
      for (const selected of ['cohort', 'converted', 'accepted-estimates'] as const) {
        const envelope = await readEnvelope(trx, owner, { selected });
        assert.deepEqual(envelope.report, await read(owner, { selected }));
        assert.equal(envelope.viewerId, owner);
        assert.equal(envelope.workspaceId, workspaceId);
        assert.equal(envelope.query.selected, selected);
        assert.equal(envelope.canReadConversion, true);
        assert.equal(envelope.canReadAcceptedValue, true);
        assert.equal(envelope.canExport, true);
        assert(Number.isSafeInteger(envelope.policyRevision));
      }
      const initial = await withWorkspaceAuthorization(trx, identity, enabled, false,
        (transaction, context) => initialLeadSourceReportWithAuthorityInTransaction(transaction, context));
      assert.deepEqual(initial.query.period, { from: addCalendarDays(initial.report.today, -29), to: initial.report.today });
      assert.equal(initial.query.selected, 'cohort');
      assert(!JSON.stringify(initial).includes('private source'));
    });
    await check('Sources envelopes retain assigned scope and revoke supporting capability without returning hidden linkage', async () => {
      const assigned = await readEnvelope(trx, field);
      assert.equal(assigned.scope, 'assigned');
      assert.equal(assigned.canReadConversion, false);
      assert.equal(assigned.canReadAcceptedValue, false);
      assert.equal(assigned.canExport, false);
      assert(!JSON.stringify(assigned).includes('J-'));
      for (const permission of ['jobs.read', 'leads.archive', 'estimates.read', 'estimates.archive'] as const) {
        const envelope = await readEnvelope(trx, owner, {}, enabled.filter(id => id !== permission));
        assert.equal(envelope.canReadConversion, !['jobs.read', 'leads.archive'].includes(permission));
        assert.equal(envelope.canReadAcceptedValue, false);
      }
      await assert.rejects(readEnvelope(trx, owner, {}, enabled.filter(id => id !== 'reports.read')), AuthorizationAccessError);
      await assert.rejects(readEnvelope(trx, owner, { workspaceId: otherWorkspace }), AuthorizationAccessError);
    });
    await check('five current-source groups reconcile the local creation cohort, including archives and exact 49-hour DST boundaries', async () => {
      const report = await read();
      assert.equal(report.evidence.kind, 'cohort');
      if (report.evidence.kind !== 'cohort') throw new Error('Expected cohort evidence.');
      assert.equal(report.cohort, 6);
      assert.deepEqual(report.groups.map(group => group.cohort), [2, 1, 1, 1, 1]);
      assert.equal(report.archiveVisibility, 'included');
      assert.equal(report.evidence.rows.length, 6);
      assert(report.evidence.rows.some(row => row.archived));
      assert.equal(report.evidence.rows.find(row => row.id === ids[0])?.createdDate, '2026-11-01');
      assert.equal(report.evidence.rows.find(row => row.id === ids[4])?.createdDate, '2026-11-02');
      assert(!JSON.stringify(report).includes('private source'));
      assert(!JSON.stringify(report).includes(otherWorkspace));
      assert.deepEqual(report.acceptedValue, { kind: 'available', preTaxCents: 0, estimateCount: 0, unattributedPreTaxCents: 0, unattributedCount: 0 });
      assert(report.groups.every(group => group.acceptedValueCents === 0 && group.acceptedEstimateCount === 0));
    });
    await check('distinct surviving Jobs prove conversion after period, even canceled, without multiplying supporting members or treating Won as conversion', async () => {
      const report = await read(owner, { selected: 'converted' });
      assert.deepEqual(report.conversion, { kind: 'available', converted: 3 });
      assert.deepEqual(report.groups.map(group => group.converted), [1, 1, 1, 0, 0]);
      assert.equal(report.evidenceTotal, 3);
      assert(!report.evidence.rows.some(row => row.recordId === ids[3]));
      if (report.evidence.kind === 'converted') assert(report.evidence.rows.every(row => /^J-\d+$/.test(row.linkedJobs)));
      assert(!JSON.stringify(report).includes(teammate));
      assert(!JSON.stringify(report).includes('Cohort customer'));
    });
    await check('source edits regroup past cohorts and conversion but creation/capture histories never replace current source', async () => {
      await trx('leads').where({ id: ids[0] }).update({ source: 'other' });
      const report = await read();
      if (report.evidence.kind !== 'cohort') throw new Error('Expected cohort evidence.');
      assert.deepEqual(report.groups.map(group => group.cohort), [1, 1, 1, 1, 2]);
      assert.deepEqual(report.groups.map(group => group.converted), [0, 1, 1, 0, 1]);
      await trx('leads').where({ id: ids[0] }).update({ source: 'website' });
    });
    await check('assigned Lead/Report scopes retain only current-owner cohort with no conversion or hidden linkage', async () => {
      const mine = await read(field);
      assert.equal(mine.scope, 'assigned');
      assert.equal(mine.cohort, 1);
      assert.equal(mine.conversion.kind, 'unavailable');
      assert(mine.groups.every(group => group.converted === null));
      assert(!JSON.stringify(mine).includes(jobIds[0]));
      assert(!JSON.stringify(mine).includes('J-'));
      await assert.rejects(read(field, { selected: 'converted' }), AuthorizationAccessError);
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'assigned' });
      const assigned = await read();
      assert.equal(assigned.cohort, 0);
      assert.equal(assigned.conversion.kind, 'unavailable');
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.read' }).update({ scope: 'workspace' });
    });
    await check('revoked Job/archive support withholds all conversion; missing entrance or Lead authority and cross-workspace reads deny', async () => {
      for (const permission of ['jobs.read', 'leads.archive'] as const) {
        const reduced = enabled.filter(id => id !== permission);
        const report = await read(owner, {}, reduced);
        assert.equal(report.cohort, permission === 'leads.archive' ? 5 : 6);
        assert.equal(report.conversion.kind, 'unavailable');
        assert(report.groups.every(group => group.converted === null));
        assert(!JSON.stringify(report).includes('J-'));
        await assert.rejects(read(owner, { selected: 'converted' }, reduced), AuthorizationAccessError);
      }
      for (const permission of ['reports.read', 'leads.read']) await assert.rejects(
        read(owner, {}, enabled.filter(id => id !== permission)), AuthorizationAccessError);
      await assert.rejects(read(outsider), AuthorizationAccessError);
      await assert.rejects(read(owner, { workspaceId: otherWorkspace }), AuthorizationAccessError);
      await assert.rejects(read(owner, { period: { from: '2099-01-01', to: '2099-01-02' } }), RangeError);
    });
    await check('business timezone boundaries use actual local dates and empty cohorts remain five-source zeros', async () => {
      for (const timezone of ['Asia/Kathmandu', 'Pacific/Kiritimati']) {
        await trx('workspaces').where({ id: workspaceId }).update({ timezone });
        const report = await read();
        if (report.evidence.kind !== 'cohort') throw new Error('Expected cohort evidence.');
        const expected = await trx('leads').where({ workspaceId }).whereRaw(
          `("createdAt" AT TIME ZONE ?)::date BETWEEN ?::date AND ?::date`, [timezone, '2026-11-01', '2026-11-02']).count('* as count').first();
        assert.equal(report.cohort, Number(expected?.count));
        assert.equal(report.timezone, timezone);
        assert(report.evidence.rows.every(row => row.createdDate >= '2026-11-01' && row.createdDate <= '2026-11-02'));
      }
      await trx('workspaces').where({ id: workspaceId }).update({ timezone: 'America/New_York' });
      const empty = await read(owner, { period: { from: '2026-01-01', to: '2026-01-02' }, page: 999 });
      assert.equal(empty.cohort, 0);
      assert.deepEqual(empty.conversion, { kind: 'available', converted: 0 });
      assert(empty.groups.every(group => group.cohort === 0 && group.converted === 0));
      assert.equal(empty.page, 1);
      assert.equal(empty.evidence.rows.length, 0);
    });
    const moneyRollback = new Error('Rollback accepted-source value cases.');
    await assert.rejects(trx.transaction(async moneyTrx => {
      const read = (userId = owner, patch: Partial<LeadSourceQuery> = {}, permissions = enabled) => readIn(moneyTrx, userId, patch, permissions);
      const collectExport = async (
        dataset: LeadSourceExportInput['dataset'],
        selected: LeadSourceExportInput['query']['selected'],
        userId = owner,
        permissions = enabled,
      ) => withWorkspaceAuthorization(moneyTrx, { workspaceId, userId }, permissions, false,
        async (transaction, context) => {
          const projection = await prepareLeadSourceCSVProjectionInTransaction(transaction, context, {
            dataset,
            query: { workspaceId, view: 'lead-source', period: { from: '2026-11-01', to: '2026-11-02' }, selected },
          });
          const rows: (string | number | null)[][] = [];
          for await (const row of projection.rows()) rows.push([...row]);
          return { projection, rows };
        });
      const seedEstimate = async (number: number, options: {
        leadId?: string; jobId?: string; revision?: number; status?: 'accepted' | 'declined' | 'published';
        archived?: boolean; corrupt?: boolean; invalidAmounts?: boolean; savedTotal?: number; decisionVersion?: number;
      } = {}) => {
        const id = randomUUID(), snapshotId = randomUUID(), revision = options.revision ?? 1;
        const status = options.status ?? 'accepted';
        await trx('estimates').insert({
          id, workspaceId, estimateNumber: number, revision, version: 3, name: 'Source frozen quote',
          parentType: options.jobId ? 'job' : 'lead', jobId: options.jobId ?? null, leadId: options.leadId ?? null,
          status, publishedAt: '2026-11-01T16:00:00Z', createdBy: owner,
          archivedAt: options.archived ? '2026-11-05T16:00:00Z' : null,
          acceptedTotalCents: status === 'accepted' ? options.savedTotal ?? 9720 : null,
        });
        const content: EstimateFrozenSnapshot = {
          formatVersion: 1,
          content: {
            number: `EST-${String(number).padStart(4, '0')}`, revision, name: 'Source frozen quote',
            business: { name: 'Fixture', address: '1 Fixture Street', phone: '2125550100', email: 'fixture@example.test', licenseLine: '',
              logoPath: null, requireServiceAddress: false },
            recipientName: 'Fixture', recipientEmail: '', serviceAddress: '', estimateDate: '2026-11-01',
            validUntil: '2026-11-30', preparedBy: '', relatedRecord: '', scope: '', message: '', paymentTerms: '', termsNote: '',
            items: [{ description: 'Repair', quantity: '1', unitPrice: '100.00', taxable: true, included: false, unit: '' }],
            discount: { type: 'percent', value: '10' }, taxRate: '8', deposit: { type: 'percent', value: '25' },
          },
          amounts: { lineAmountsCents: [10000], subtotalCents: 10000, discountCents: 1000, taxCents: options.invalidAmounts ? 0 : 720,
            totalCents: 9720, depositCents: 2430, balanceCents: 7290 },
        };
        if (!options.corrupt && !options.invalidAmounts) assert(verifiedEstimateFrozenSnapshot(content, estimateSnapshotHash(content)));
        await trx('estimate_snapshots').insert({
          id: snapshotId, workspaceId, estimateId: id, estimateVersion: 2, content: JSON.stringify(content),
          contentHash: options.corrupt ? '0'.repeat(64) : estimateSnapshotHash(content), createdAt: '2026-11-01T16:00:00Z',
        });
        if (status !== 'published') await trx('estimate_decisions').insert({
          id: randomUUID(), workspaceId, estimateId: id, snapshotId, estimateVersion: options.decisionVersion ?? 3, outcome: status,
          decisionDate: '2026-11-04', channel: 'phone', note: 'PRIVATE_SOURCE_DECISION', snapshotTotalCents: options.savedTotal ?? 9720,
          actorId: owner,
        });
        return id;
      };
      const outside = await seedLead('website', '2026-10-01T12:00:00Z');
      const unlinkedJob = randomUUID();
      await trx('jobs').insert({ id: unlinkedJob, workspaceId, title: 'Unlinked parent', customerName: 'Fixture',
        service: '', location: '', description: '', primaryOwnerId: owner, createdBy: owner });
      const direct = await seedEstimate(101, { leadId: ids[0] });
      await seedEstimate(102, { jobId: jobIds[1], archived: true });
      const converted = await seedEstimate(103, { jobId: unlinkedJob });
      await trx('jobs').where({ id: jobIds[0] }).update({ acceptedEstimateId: direct });
      await trx('jobs').where({ id: jobIds[2] }).update({ acceptedEstimateId: converted });
      const ambiguous = await seedEstimate(104, { leadId: ids[3] });
      const outsideJob = await seedJob(outside);
      await trx('jobs').where({ id: outsideJob }).update({ acceptedEstimateId: ambiguous });
      const sameSource = await seedEstimate(105, { leadId: ids[0] });
      const sameSourceJob = await seedJob(extraWebsite);
      await trx('jobs').where({ id: sameSourceJob }).update({ acceptedEstimateId: sameSource });
      await seedEstimate(106, { leadId: outside });
      await seedEstimate(107, { jobId: unlinkedJob });
      await check('direct, Job-parent and accepted-Estimate conversion paths deduplicate families; ambiguous links outside cohort and same-source links remain unattributed', async () => {
        const report = await read(owner, { selected: 'accepted-estimates' });
        assert.deepEqual(report.acceptedValue, { kind: 'available', preTaxCents: 45000, estimateCount: 5,
          unattributedPreTaxCents: 18000, unattributedCount: 2 });
        assert.deepEqual(report.groups.map(group => group.acceptedValueCents), [9000, 9000, 9000, 0, 0]);
        assert.deepEqual(report.groups.map(group => group.acceptedEstimateCount), [1, 1, 1, 0, 0]);
        assert.equal(report.evidenceTotal, 5);
        if (report.evidence.kind !== 'accepted-estimates') throw new Error('Expected Estimate evidence.');
        assert(report.evidence.rows.every(row => row.acceptedDate === '2026-11-04'));
        assert(report.evidence.rows.filter(row => row.source === null).every(row => row.linkedLead === undefined));
        assert(!JSON.stringify(report).includes(outside));
        assert(!JSON.stringify(report).includes('PRIVATE_SOURCE_DECISION'));
        assert(!JSON.stringify(report).includes('lineAmountsCents'));
        const empty = await read(owner, { selected: 'accepted-estimates', period: { from: '2026-01-01', to: '2026-01-02' }, page: 999 });
        assert.equal(empty.page, 1);
        assert.equal(empty.evidenceTotal, 0);
        assert.deepEqual(empty.evidence, { kind: 'accepted-estimates', rows: [] });
        assert.deepEqual(empty.acceptedValue, { kind: 'available', preTaxCents: 0, estimateCount: 0,
          unattributedPreTaxCents: 0, unattributedCount: 0 });
        await trx('leads').where({ id: ids[0] }).update({ source: 'other' });
        assert.deepEqual((await read()).groups.map(group => group.acceptedValueCents), [0, 9000, 9000, 0, 9000]);
        await trx('leads').where({ id: ids[0] }).update({ source: 'website' });
      });
      await check('unpaged Sources CSV projections preserve native groups, full evidence and ambiguity-safe values', async () => {
        const groups = await collectExport('source-groups', 'cohort');
        assert.equal(groups.projection.count, 6);
        assert.equal(groups.rows.length, 6);
        assert.deepEqual(groups.rows.map(row => row[10]), ['source', 'source', 'source', 'source', 'source', 'unattributed']);
        assert.deepEqual(groups.rows.slice(0, 5).map(row => row[11]), [...leadSources]);
        assert.equal(groups.rows[5][11], null);
        assert.equal(groups.rows[5][15], 2);
        assert.equal(groups.rows[5][16], 18000);
        assert(groups.rows.every(row => row.length === groups.projection.columns.length));

        const noEstimateExport = await collectExport(
          'source-groups', 'cohort', owner, enabled.filter(permission => permission !== 'estimates.read'),
        );
        assert.equal(noEstimateExport.rows.length, 5);
        assert(noEstimateExport.rows.every(row =>
          row[15] === null && row[16] === null && row[17] === null && row[18] === 'unavailable_permissions'));
        const noJobExport = await collectExport(
          'source-groups', 'cohort', owner, enabled.filter(permission => permission !== 'jobs.export'),
        );
        assert.equal(noJobExport.rows.length, 5);
        assert(noJobExport.rows.every(row =>
          row[13] === null && row[14] === 'unavailable_permissions' &&
          row[15] === null && row[16] === null && row[17] === null));

        const cohort = await collectExport('cohort', 'cohort');
        assert.equal(cohort.projection.count, 6);
        assert.equal(cohort.rows.length, 6);
        assert(cohort.rows.every(row => row.length === cohort.projection.columns.length));
        const cohortSources = cohort.rows.map(row => row[13]);
        assert.equal(cohortSources.filter(source => source === 'website').length, 2);
        assert.deepEqual([...new Set(cohortSources)].sort(), [...leadSources].sort());

        const convertedRows = await collectExport('converted', 'converted');
        assert.equal(convertedRows.projection.count, 4);
        assert.equal(convertedRows.rows.length, 4);
        assert(convertedRows.rows.every(row => typeof row[15] === 'string' && /^J-\d+/.test(row[15])));

        const accepted = await collectExport('accepted-estimates', 'accepted-estimates');
        assert.equal(accepted.projection.count, 5);
        assert.equal(accepted.rows.length, 5);
        assert(accepted.rows.every(row => row[16] === 'USD' && row[15] === 9000));
        assert(accepted.rows.filter(row => row[17] === null).every(row =>
          row[18] === null && row[19] === null && row[20] === 'unattributed'));
        assert(!JSON.stringify(accepted.rows).includes('PRIVATE_SOURCE_DECISION'));
        assert(!JSON.stringify(accepted.rows).includes('lineAmountsCents'));
      });
      await check('ordinary Estimate read does not require Financial permission; incomplete Estimate or archive authority withholds money and evidence', async () => {
        assert.equal((await read(owner, {}, enabled.filter(id => id !== 'reports.financial.read'))).acceptedValue.kind, 'available');
        for (const permission of ['estimates.read', 'estimates.archive', 'leads.archive', 'jobs.read'] as const) {
          const reduced = enabled.filter(id => id !== permission);
          const report = await read(owner, {}, reduced);
          assert.equal(report.acceptedValue.kind, 'unavailable');
          assert(report.groups.every(group => group.acceptedEstimateCount === null && group.acceptedValueCents === null));
          assert(!JSON.stringify(report).includes('EST-'));
          await assert.rejects(read(owner, { selected: 'accepted-estimates' }, reduced), AuthorizationAccessError);
        }
        await assert.rejects(read(field, { selected: 'accepted-estimates' }), AuthorizationAccessError);
      });
      await check('unissued drafts retain acceptance; newer issued declines replace it and conversion links through older revisions do not multiply value', async () => {
        const draft = randomUUID();
        await trx('estimates').insert({ id: draft, workspaceId, estimateNumber: 101, revision: 2, name: 'Unissued draft',
          parentType: 'lead', leadId: ids[0], status: 'draft', createdBy: owner });
        assert.equal((await read(owner, { selected: 'accepted-estimates' })).evidenceTotal, 5);
        await trx('estimates').where({ id: draft }).delete();
        const revision = await seedEstimate(101, { leadId: ids[0], revision: 2, status: 'declined' });
        assert.equal((await read(owner, { selected: 'accepted-estimates' })).evidenceTotal, 4);
        await trx('estimates').where({ id: revision }).delete();
        const acceptedRevision = await seedEstimate(103, { jobId: unlinkedJob, revision: 2 });
        const report = await read(owner, { selected: 'accepted-estimates' });
        assert.equal(report.evidenceTotal, 5);
        assert(report.evidence.rows.some(row => row.recordId === acceptedRevision && row.source === 'phone'));
      });
      await check('issued family revisions with conflicting durable Lead parents are unattributed once, not guessed from the latest parent', async () => {
        const revision = await seedEstimate(102, { leadId: ids[4], revision: 2 });
        const report = await read(owner, { selected: 'accepted-estimates' });
        if (report.acceptedValue.kind !== 'available') throw new Error('Expected valid money.');
        assert.equal(report.acceptedValue.unattributedCount, 3);
        assert(report.evidence.rows.some(row => row.recordId === revision && row.source === null));
        await trx('estimates').where({ id: revision }).delete();
      });
      await check('latest same-revision decision corrections restate acceptance; disagreeing effective outcome or future acceptance never produces money', async () => {
        const id = await seedEstimate(112, { leadId: ids[0] });
        const saved = await trx('estimate_decisions').where({ estimateId: id }).first('snapshotId');
        const decision = async (version: number, outcome: 'accepted' | 'declined', date = '2026-11-04') =>
          trx('estimate_decisions').insert({ id: randomUUID(), workspaceId, estimateId: id, snapshotId: saved.snapshotId,
            estimateVersion: version, outcome, decisionDate: date, channel: 'phone', note: 'Correction fixture',
            snapshotTotalCents: 9720, actorId: owner });
        await decision(4, 'declined');
        await assert.rejects(read(), /accepted/);
        await trx('estimates').where({ id }).update({ version: 4, status: 'declined', acceptedTotalCents: null });
        assert.equal((await read(owner, { selected: 'accepted-estimates' })).evidenceTotal, 5);
        await decision(5, 'accepted');
        await trx('estimates').where({ id }).update({ version: 5, status: 'accepted', acceptedTotalCents: 9720 });
        assert.equal((await read(owner, { selected: 'accepted-estimates' })).evidenceTotal, 6);
        await decision(6, 'accepted', '2099-01-01');
        await trx('estimates').where({ id }).update({ version: 6 });
        await assert.rejects(read(), /decision or linkage is inconsistent/);
        await trx('estimates').where({ id }).delete();
      });
      await check('corrupt hashes, arithmetic and saved totals redact the entire value but preserve cohort/conversion; invalid effective decisions fail explicitly', async () => {
        for (const options of [{ corrupt: true }, { invalidAmounts: true }, { savedTotal: 9721 }]) {
          const id = await seedEstimate(110, { leadId: ids[0], ...options });
          const report = await read();
          assert.equal(report.cohort, 6);
          assert.equal(report.conversion.kind, 'available');
          assert.equal(report.acceptedValue.kind, 'unavailable');
          if (report.acceptedValue.kind === 'unavailable') assert.equal(report.acceptedValue.reason, 'invalid-money');
          const envelope = await readEnvelope(moneyTrx);
          assert.equal(envelope.canReadAcceptedValue, true);
          assert.equal(envelope.canReadConversion, true);
          assert.equal(envelope.report.acceptedValue.kind, 'unavailable');
          assert(report.groups.every(group => group.acceptedValueCents === null));
          await assert.rejects(read(owner, { selected: 'accepted-estimates' }), /evidence is unavailable/);
          const grouped = await collectExport('source-groups', 'cohort');
          assert.equal(grouped.rows.length, 5);
          assert(grouped.rows.every(row => row[15] === null && row[16] === null && row[18] === 'invalid_money'));
          await assert.rejects(collectExport('accepted-estimates', 'accepted-estimates'), /evidence is unavailable/);
          await trx('estimates').where({ id }).delete();
        }
        const invalid = await seedEstimate(110, { leadId: ids[0], decisionVersion: 4 });
        await assert.rejects(read(), /decision or linkage is inconsistent/);
        await trx('estimates').where({ id: invalid }).delete();
      });
      await check('deleted conversion Jobs and Job-source Leads remove surviving attribution, without retained identity/name inference', async () => {
        await trx('jobs').where({ id: jobIds[2] }).delete();
        assert.equal((await read(owner, { selected: 'accepted-estimates' })).evidenceTotal, 4);
        await trx('jobs').where({ id: outsideJob }).delete();
        const report = await read(owner, { selected: 'accepted-estimates' });
        assert(report.evidence.rows.some(row => row.recordId === ambiguous && row.source === 'gmail'));
        const removable = await seedLead('gmail', '2026-11-02T12:00:00Z');
        const parent = await seedJob(removable);
        await seedEstimate(111, { jobId: parent });
        assert.equal((await read(owner, { selected: 'accepted-estimates' })).evidenceTotal, 5);
        await trx('leads').where({ id: removable }).delete();
        assert.equal((await trx('jobs').where({ id: parent }).first('sourceLeadId')).sourceLeadId, null);
        assert.equal((await read(owner, { selected: 'accepted-estimates' })).evidenceTotal, 4);
      });
      await check('accepted-family evidence scans beyond cursor batches and clamps 25/50/100 pages without duplicates', async () => {
        for (let i = 0; i < 101; i++) await seedEstimate(200 + i, { leadId: ids[0] });
        for (const pageSize of [25, 50, 100] as const) {
          const first = await read(owner, { selected: 'accepted-estimates', pageSize });
          const last = await read(owner, { selected: 'accepted-estimates', page: 999, pageSize });
          assert.equal(first.evidenceTotal, 105);
          assert.equal(first.evidence.rows.length, pageSize);
          assert.equal(last.page, Math.ceil(105 / pageSize));
          assert.equal(last.evidence.rows.length, 105 % pageSize);
          const ids = new Set(first.evidence.rows.map(row => row.recordId));
          assert(last.evidence.rows.every(row => !ids.has(row.recordId)));
          assert.deepEqual(first.acceptedValue, last.acceptedValue);
        }
      });
      throw moneyRollback;
    }), error => error === moneyRollback);
    await check('deleted Jobs and Leads remove surviving proof without preserving source-number or stage inference', async () => {
      await trx('jobs').where({ id: jobIds[0] }).delete();
      const report = await read();
      assert.deepEqual(report.conversion, { kind: 'available', converted: 2 });
      assert.equal(report.cohort, 6);
      await trx('leads').where({ id: ids[1] }).delete();
      const removed = await read();
      assert.equal(removed.cohort, 5);
      assert.deepEqual(removed.conversion, { kind: 'available', converted: 1 });
      assert.equal((await trx('jobs').where({ id: jobIds[1] }).first('sourceLeadId')).sourceLeadId, null);
    });
    await check('stable bounded cohort/converted evidence clamps final pages after counting the complete source cohort', async () => {
      for (let i = 0; i < 27; i++) await seedJob(await seedLead('website', '2026-11-02T12:00:00Z'));
      for (const selected of ['cohort', 'converted'] as const) {
        const first = await read(owner, { selected }), last = await read(owner, { selected, page: 999 });
        assert.equal(first.evidenceTotal, selected === 'cohort' ? 32 : 28);
        assert.equal(first.evidence.rows.length, 25);
        assert.equal(last.page, 2);
        assert.equal(last.evidence.rows.length, selected === 'cohort' ? 7 : 3);
        assert.equal(new Set([...first.evidence.rows, ...last.evidence.rows].map(row => row.recordId)).size, first.evidenceTotal);
      }
      assert((await read()).evidence.rows.some(row => row.recordId === extraWebsite) ||
        (await read(owner, { page: 2 })).evidence.rows.some(row => row.recordId === extraWebsite));
      await trx('workspaceMemberships').where({ workspaceId, userId: field }).delete();
      await assert.rejects(read(field), AuthorizationAccessError);
    });
    throw rollback;
  }), error => error === rollback);
  console.log(`${checks} Lead-source cohort database journeys passed.`);
} finally { await db.destroy(); }
