import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { permissionIds, leadReportExportInputSchema, leadReportQuerySchema } from '@salesmora/contracts';
import { addCalendarDays } from '@salesmora/domain';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy, withWorkspaceAuthorization, AuthorizationAccessError } from '../authorization/store';
import { readLeadReportInTransaction } from './leads';
import { prepareLeadReportCSVProjectionInTransaction } from './lead-export-projection';

process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw new Error('Use a separate local _test database.');
const db = createDatabase(connection), workspaceId = randomUUID(), owner = randomUUID(), other = randomUUID();
const rollback = new Error('Rollback Leads report CSV fixtures.');
let checks = 0;
async function check(name: string, run: () => Promise<void>) { await run(); checks++; console.log(`PASS ${name}`); }
try {
  await assert.rejects(db.transaction(async trx => {
    await trx('users').insert([owner, other].map(id => ({ id, name: 'CSV fixture member', email: `${id}@example.test`,
      termsVersion: 'fixture', termsAcceptedAt: new Date(), createdAt: new Date(), updatedAt: new Date() })));
    await trx('workspaces').insert({ id: workspaceId, ownerId: owner, businessName: 'CSV fixture', businessType: 'test',
      postalCode: '', serviceRange: '', timezone: 'America/New_York' });
    await trx('workspaceMemberships').insert([{ workspaceId, userId: owner, role: 'owner' }, { workspaceId, userId: other, role: 'office' }]);
    await initializeWorkspacePolicy(trx, { workspaceId, userId: owner });
    const clock = (await trx.raw(`SELECT CURRENT_TIMESTAMP AS stamp,
      to_char(CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York', 'YYYY-MM-DD') AS today`)).rows[0] as { stamp: Date; today: string };
    const before = (days: number) => new Date(clock.stamp.getTime() - days * 86400000);
    const ids: string[] = Array.from({ length: 131 }, () => randomUUID());
    await trx('leads').insert(ids.map((id, index) => ({
      id, workspaceId, createdBy: owner, submissionId: randomUUID(), submissionHash: 'fixture', name: `Lead ${index}`,
      email: 'private@example.test', phone: 'PRIVATE_PHONE', service: '', address: '', details: 'PRIVATE_DETAILS', notes: 'PRIVATE_NOTES',
      source: index % 2 ? 'gmail' : 'website', stage: index < 125 ? ['new', 'contacted', 'estimate-sent'][index % 3] : index % 2 ? 'won' : 'lost',
      ownerId: index === 1 ? null : index % 2 ? other : owner,
      archivedAt: index === 130 ? before(1) : null, createdAt: before(index < 100 ? 2 : 40), lastActivityAt: before(index % 2 ? 8 : 1),
    })));
    for (const [index, id] of ids.entries()) {
      if (index < 125) continue;
      for (const [from, to, days] of [['new', 'won', 4], ['won', 'lost', 3], ['lost', 'won', 2]] as const) {
        await trx('leadActivity').insert({ id: randomUUID(), workspaceId, leadId: id, actorId: owner,
          actorName: 'PRIVATE_ACTOR', actorType: 'user', type: 'stage', createdAt: before(days), changes: JSON.stringify({ from, to }) });
      }
    }
    const period = { from: addCalendarDays(clock.today, -29), to: clock.today }, filters = { stages: [], owners: [], sources: [] };
    const queries = [
      { workspaceId, view: 'intake', period, filters, currentFilters: filters },
      { workspaceId, view: 'won', period, filters }, { workspaceId, view: 'lost', period, filters },
      { workspaceId, view: 'pipeline', selection: { kind: 'pipeline' }, filters },
      { workspaceId, view: 'age', selection: { kind: 'age', band: '31+' }, filters },
      { workspaceId, view: 'attention', selection: 'combined', filters },
    ];
    const enabled = [...permissionIds];
    const authorized = <T,>(run: Parameters<typeof withWorkspaceAuthorization<T>>[4], permissions = enabled) =>
      withWorkspaceAuthorization(trx, { workspaceId, userId: owner }, permissions, false, run);
    const consume = async (projection: Awaited<ReturnType<typeof prepareLeadReportCSVProjectionInTransaction>>) => {
      const rows: (readonly (string | number)[])[] = [];
      for await (const row of projection.rows()) rows.push([...row]);
      assert.equal(rows.length, projection.count);
      assert.ok(rows.every(row => row.length === projection.columns.length));
      assert.ok(!JSON.stringify(rows).includes('PRIVATE_'));
      return rows;
    };
    await check('export permission defaults off and rejects without altering native report reads', async () => {
      await assert.rejects(authorized((transaction, context) => prepareLeadReportCSVProjectionInTransaction(transaction, context,
        leadReportExportInputSchema.parse({ query: queries[0], dataset: 'evidence' }))), AuthorizationAccessError);
      await trx('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission: 'reports.export', scope: 'enabled' });
    });
    await check('all six views export complete selected native evidence with exactly matching page-one shapes and stable identities', async () => {
      await authorized(async (transaction, context) => {
        for (const query of queries) {
          const input = leadReportExportInputSchema.parse({ query, dataset: 'evidence' });
          const projection = await prepareLeadReportCSVProjectionInTransaction(transaction, context, input);
          const native = await readLeadReportInTransaction(transaction, context, leadReportQuerySchema.parse({ ...query, page: 1, pageSize: 100 }));
          assert.equal(projection.count, native.evidenceTotal);
          const rows = await consume(projection), idColumn = projection.columns.indexOf('lead_id');
          assert.deepEqual(rows.slice(0, 100).map(row => row[idColumn]), native.rows.map(row => row.recordId));
          assert.equal(new Set(rows.map(row => row[idColumn])).size, rows.length);
          for (const [index, row] of native.rows.entries()) {
            for (const [field, value] of Object.entries(row.cells)) {
              assert.equal(rows[index][projection.columns.indexOf(field)], value);
            }
          }
        }
      });
    });
    await check('fixed tabular breakdowns reconcile independently, preserve zero buckets and expose Attention overlaps', async () => {
      await authorized(async (transaction, context) => {
        const datasets = ['intake-days', 'outcomes', 'outcomes', 'pipeline-stages', 'age-bands', 'attention-categories'];
        for (const [index, query] of queries.entries()) {
          const projection = await prepareLeadReportCSVProjectionInTransaction(transaction, context,
            leadReportExportInputSchema.parse({ query, dataset: datasets[index] }));
          const rows = await consume(projection);
          assert.equal(rows.length, index === 0 ? 30 : index < 3 ? 2 : index === 4 ? 4 : 3);
          if (index === 0) assert.ok(rows.some(row => row.at(-1) === 0));
          if (index === 5) assert.ok(rows.every(row => row.at(-1) === 'true'));
        }
        const sources = await prepareLeadReportCSVProjectionInTransaction(transaction, context,
          leadReportExportInputSchema.parse({ query: queries[0], dataset: 'intake-sources' }));
        assert.equal((await consume(sources)).length, 5);
      });
    });
    await check('narrow export scope, archive revocation and native filters never expose hidden Lead evidence', async () => {
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'leads.export' }).update({ scope: 'assigned' });
      await authorized(async (transaction, context) => {
        const projection = await prepareLeadReportCSVProjectionInTransaction(transaction, context,
          leadReportExportInputSchema.parse({ query: queries[3], dataset: 'evidence' }));
        assert.equal(projection.scope, 'assigned');
        const rows = await consume(projection), idColumn = projection.columns.indexOf('lead_id');
        assert.ok(rows.every(row => ids.indexOf(String(row[idColumn])) % 2 === 0));
        await assert.rejects(prepareLeadReportCSVProjectionInTransaction(transaction, context,
          leadReportExportInputSchema.parse({ query: { ...queries[3], filters: { ...filters, owners: [other] } }, dataset: 'evidence' })),
        AuthorizationAccessError);
      });
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'leads.export' }).update({ scope: 'workspace' });
      await authorized(async (transaction, context) => {
        const projection = await prepareLeadReportCSVProjectionInTransaction(transaction, context,
          leadReportExportInputSchema.parse({ query: queries[1], dataset: 'evidence' }));
        assert.equal(projection.archiveVisibility, 'excluded'); assert.equal(projection.count, 5);
        await consume(projection);
      }, enabled.filter(id => id !== 'leads.archive'));
      await assert.rejects(authorized((transaction, context) => prepareLeadReportCSVProjectionInTransaction(transaction, context,
        leadReportExportInputSchema.parse({ query: { ...queries[0], workspaceId: randomUUID() }, dataset: 'evidence' }))), AuthorizationAccessError);
    });
    await check('selected buckets, source filters and cancellation close bounded evidence cursors', async () => {
      await authorized(async (transaction, context) => {
        const projection = await prepareLeadReportCSVProjectionInTransaction(transaction, context,
          leadReportExportInputSchema.parse({ query: { ...queries[0], trendBucket: addCalendarDays(clock.today, -2),
            filters: { ...filters, sources: ['website'] } }, dataset: 'evidence' }));
        const rows = await consume(projection); assert.equal(rows.length, 50);
        const signal = new AbortController(), iterator = projection.rows(signal.signal);
        assert.equal((await iterator.next()).done, false); signal.abort();
        await assert.rejects(iterator.next());
        assert.equal((await trx.raw(`SELECT count(*)::int AS count FROM pg_cursors WHERE name LIKE 'lead_report_csv_%'`)).rows[0].count, 0);
      });
    });
    await check('outcome validation scans beyond pages and action filters; malformed authorized events still fail explicitly', async () => {
      const id = randomUUID();
      await trx('leadActivity').insert({ id, workspaceId, leadId: ids[125], actorId: owner, actorType: 'user', type: 'stage',
        createdAt: before(1), changes: JSON.stringify({ from: 'new', to: 'private-unknown' }) });
      await authorized(async (transaction, context) => {
        await assert.rejects(readLeadReportInTransaction(transaction, context,
          leadReportQuerySchema.parse({ ...queries[1], page: 1, pageSize: 25 })), /invalid recorded stage transition/);
        await assert.rejects(prepareLeadReportCSVProjectionInTransaction(transaction, context,
          leadReportExportInputSchema.parse({ query: queries[2], dataset: 'evidence' })), /invalid recorded stage transition/);
      });
      await trx('leadActivity').where({ id }).delete();
    });
    throw rollback;
  }), error => error === rollback);
  console.log(`${checks} Leads CSV projection database journeys passed.`);
} finally { await db.destroy(); }
