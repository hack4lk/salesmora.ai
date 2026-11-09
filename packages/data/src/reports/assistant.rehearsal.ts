import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { mock } from 'node:test';
import { permissionIds, reportTemplateAreas, reportSelectionSchema, reportAssistantReadLimits,
  type ReportSelection } from '@salesmora/contracts';
import { addCalendarDays } from '@salesmora/domain';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy, withWorkspaceAuthorization, AuthorizationAccessError } from '../authorization/store';
import { readReportForAssistant, ReportAssistantClarificationError, ReportAssistantLimitError } from './assistant';
import { readReportSelectionInTransaction } from './read-selection';
import { runReportTemplateConfigurationInTransaction } from './template';

process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw new Error('Use a separate local _test database.');
const db = createDatabase(connection), workspaceId = randomUUID(), owner = randomUUID(), field = randomUUID(), outsider = randomUUID();
const identity = { workspaceId, userId: owner }, enabled = [...permissionIds];
const rollback = new Error('Rollback Reports assistant fixtures.');
let checks = 0;
const check = async (label: string, run: () => Promise<void>) => { await run(); checks++; console.log(`PASS ${label}`); };
const explicit = (selection: ReportSelection) => ({ request: { mode: 'query',
  selection: { area: selection.area, query: Object.fromEntries(Object.entries(selection.query)
    .filter(([key]) => !['workspaceId', 'page', 'pageSize'].includes(key))) } } });
try {
  await assert.rejects(db.transaction(async trx => {
    await trx('users').insert([owner, field, outsider].map(id => ({
      id, name: 'Report assistant fixture', email: `${id}@example.test`, termsVersion: 'fixture',
      termsAcceptedAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
    })));
    await trx('workspaces').insert({ id: workspaceId, ownerId: owner, businessName: 'Assistant fixture',
      businessType: 'test', postalCode: '', serviceRange: '', timezone: 'Pacific/Kiritimati' });
    await trx('workspaceMemberships').insert([
      { workspaceId, userId: owner, role: 'owner' }, { workspaceId, userId: field, role: 'field' },
    ]);
    await initializeWorkspacePolicy(trx, identity);
    await trx('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission: 'reports.financial.read', scope: 'enabled' });
    const clock = await trx('workspaces').where({ id: workspaceId })
      .select(trx.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone, 'YYYY-MM-DD') AS today`)).first();
    assert.equal(typeof clock.today, 'string');
    const today: string = clock.today, period = { from: addCalendarDays(today, -29), to: today };
    const leads = Array.from({ length: 32 }, (_, index) => ({
      id: randomUUID(), workspaceId, createdBy: owner, submissionId: randomUUID(), submissionHash: 'assistant-fixture',
      name: `Lead ${index}`, email: '', phone: '', service: '', address: '', details: 'PRIVATE_DETAILS', notes: 'PRIVATE_NOTE',
      source: 'website', stage: 'new', ownerId: index < 3 ? field : owner,
      createdAt: trx.raw("CURRENT_TIMESTAMP - interval '1 day'"),
    }));
    await trx('leads').insert(leads);
    const jobId = randomUUID();
    await trx('jobs').insert({ id: jobId, workspaceId, primaryOwnerId: owner, createdBy: owner, title: 'Assistant Job',
      customerName: 'Fixture', service: '', location: '', description: 'PRIVATE_JOB', status: 'needs-scheduling',
      createdAt: trx.raw("CURRENT_TIMESTAMP - interval '1 day'") });
    await trx('jobTeamMembers').insert({ workspaceId, jobId, userId: field });
    const orderId = randomUUID();
    await trx('workOrders').insert({ id: orderId, workspaceId, jobId, title: 'Assistant Work Order', status: 'issued',
      issuedAt: trx.raw("CURRENT_TIMESTAMP - interval '1 day'"), instructions: 'PRIVATE_INSTRUCTIONS', accessNotes: '', safetyNotes: '' });
    await trx('workOrderMaterials').insert({ id: randomUUID(), workspaceId, workOrderId: orderId, position: 0,
      name: 'Recorded material', quantity: '2', costCents: null, status: 'needed', unit: 'each', note: 'PRIVATE_COST_NOTE' });
    await trx('leadActivity').insert({ id: randomUUID(), workspaceId, leadId: leads[0].id, actorId: owner,
      actorName: 'Fixture', actorType: 'user', type: 'note', changes: JSON.stringify({ body: 'PRIVATE_EVENT_NOTE' }), createdAt: new Date() });
    const read = (args: unknown, who = identity, permissions = enabled, pageContext?: unknown,
      signal = new AbortController().signal) => readReportForAssistant(trx, who, permissions, args, pageContext, signal);
    const base = { workspaceId, page: 1, pageSize: 25 }, filters = { stages: [], owners: [], sources: [] };
    const examples = [
      { area: 'overview', query: { workspaceId, view: 'business-overview', period } },
      { area: 'leads', query: { ...base, view: 'intake', period, filters, currentFilters: filters } },
      ...['won', 'lost'].map(view => ({ area: 'leads', query: { ...base, view, period, filters } })),
      { area: 'leads', query: { ...base, view: 'pipeline', filters, selection: { kind: 'pipeline' } } },
      { area: 'leads', query: { ...base, view: 'age', filters, selection: { kind: 'age', band: '31+' } } },
      { area: 'leads', query: { ...base, view: 'attention', filters, selection: 'inactive' } },
      ...['cohort', 'converted', 'accepted-estimates'].map(selected =>
        ({ area: 'sources', query: { ...base, view: 'lead-source', period, selected } })),
      { area: 'calendar', query: { ...base, view: 'calendar-scheduled', period, selected: 'visits' } },
      { area: 'calendar', query: { ...base, view: 'calendar-review', period, selected: 'overlaps' } },
      { area: 'calendar', query: { ...base, view: 'calendar-unscheduled', selected: 'jobs' } },
      { area: 'jobs', query: { ...base, view: 'lifecycle', period, selectedView: 'created' } },
      { area: 'jobs', query: { ...base, view: 'completion', period, selectedDate: period.from } },
      { area: 'jobs', query: { ...base, view: 'workload', filters: { statuses: [], owners: [], services: [] },
        selection: { kind: 'metric', metric: 'overdue' } } },
      { area: 'team', query: { ...base, view: 'team-leads', selected: { kind: 'queue', queue: 'inactive' } } },
      { area: 'team', query: { ...base, view: 'team-jobs', selected: { kind: 'member', id: field,
        responsibility: 'supporting', filter: 'all' }, filters: { members: [field] } } },
      { area: 'estimates', query: { ...base, view: 'estimate-decisions', period, selected: 'accepted' } },
      { area: 'estimates', query: { ...base, view: 'estimate-first-quoted', period } },
      { area: 'estimates', query: { ...base, view: 'estimate-current', selected: 'awaiting' } },
      { area: 'activity', query: { ...base, view: 'activity', period } },
      ...['accepted', 'awaiting', 'materials'].map(selected =>
        ({ area: 'financial', query: { ...base, view: 'financial', period, selected } })),
    ].map(example => reportSelectionSchema.parse(example));
    assert.equal(examples.length, 25);
    assert.equal(new Set(examples.map(example => example.query.view)).size, 21);
    await check('all 25 configurations / 21 views dispatch to native readers with exact query and template parity', async () => {
      for (const selection of examples) {
        const native = await read(explicit(selection));
        assert.equal(native.area, selection.area);
        assert.deepEqual(native.read.query, selection.query);
        const manual = await withWorkspaceAuthorization(trx, identity, enabled, false, (transaction, context) =>
          readReportSelectionInTransaction(transaction, context, selection));
        assert.deepEqual(native, manual);
        const configuration = { area: selection.area,
          query: Object.fromEntries(Object.entries(selection.query).filter(([key]) => !['workspaceId', 'page', 'pageSize', 'period'].includes(key))),
          period: 'period' in selection.query ? { preset: 'custom' as const, ...selection.query.period } : null };
        assert.deepEqual(native.read, await withWorkspaceAuthorization(trx, identity, enabled, false, (transaction, context) =>
          runReportTemplateConfigurationInTransaction(transaction, context, configuration)));
        assert(!JSON.stringify(native).includes('PRIVATE_'));
      }
    });
    await check('all nine defaults resolve in the workspace timezone; Calendar is today through today+6', async () => {
      for (const area of reportTemplateAreas) {
        const result = await read({ request: { mode: 'default', area, period: null } });
        const query = result.read.query;
        if ('period' in query) assert.deepEqual(query.period, area === 'calendar'
          ? { from: today, to: addCalendarDays(today, 6) } : period);
        else assert.equal(area, 'team');
      }
    });
    await check('evidence windows never replace totals or silently widen assigned ownership', async () => {
      const input = { request: { mode: 'default', area: 'leads', period: null } };
      const workspace = await read(input), assigned = await read(input, { workspaceId, userId: field });
      assert.equal(workspace.area, 'leads'); assert.equal(assigned.area, 'leads');
      if (workspace.area !== 'leads' || assigned.area !== 'leads') throw new Error('Expected Leads.');
      assert.equal(workspace.read.report.rows.length, 25);
      assert.equal(workspace.read.report.evidenceTotal, 32);
      assert.equal(assigned.read.scope, 'assigned');
      assert.equal(assigned.read.report.evidenceTotal, 3);
      assert(assigned.read.report.rows.every(row => leads.slice(0, 3).some(lead => lead.id === row.id)));
      const personal = await read({ request: { mode: 'query', selection: { area: 'leads', query: {
        view: 'pipeline', filters: { stages: [], owners: ['me'], sources: [] }, selection: { kind: 'pipeline' },
      } } } });
      assert.equal(personal.area, 'leads');
      if (personal.area !== 'leads') throw new Error('Expected personal Leads.');
      assert.equal(personal.read.report.evidenceTotal, 29);
      await assert.rejects(read({ request: { mode: 'query', selection: { area: 'leads', query: {
        view: 'pipeline', filters: { stages: [], owners: [owner], sources: [] }, selection: { kind: 'pipeline' },
      } } } }, { workspaceId, userId: field }), AuthorizationAccessError);
      const selection = examples[1];
      const result = await read({ request: { mode: 'current_report' } }, identity, enabled, {
        selection: { ...selection, query: { ...selection.query, page: 99, pageSize: 100 } }, period: { preset: 'last30days' },
      });
      assert.equal(result.read.query.view, 'intake');
      assert('page' in result.read.query && result.read.query.page === 1 && result.read.query.pageSize === 25);
    });
    await check('current material cost coverage preserves missing costs rather than treating them as zero', async () => {
      const result = await read(explicit(reportSelectionSchema.parse({ area: 'financial',
        query: { workspaceId, view: 'financial', period, selected: 'materials' } })));
      assert.equal(result.area, 'financial');
      if (result.area !== 'financial' || result.read.reports.materials.costs.kind !== 'available') throw new Error('Expected costs.');
      assert.equal(result.read.reports.materials.costs.coverage.missingCostLines, 1);
    });
    await check('fresh assistant/report/source/Financial/cost authorization and membership fail closed', async () => {
      const lead = { request: { mode: 'default', area: 'leads', period: null } };
      for (const permission of ['assistant.use', 'reports.read', 'leads.read']) {
        await assert.rejects(read(lead, identity, enabled.filter(value => value !== permission)), AuthorizationAccessError);
      }
      await assert.rejects(read(lead, { workspaceId, userId: outsider }), AuthorizationAccessError);
      const financial = { request: { mode: 'default', area: 'financial', period: null } };
      await assert.rejects(read(financial, identity, enabled.filter(value => value !== 'reports.financial.read')), AuthorizationAccessError);
      await assert.rejects(read(financial, identity, enabled.filter(value => value !== 'estimates.read')), AuthorizationAccessError);
      const costs = explicit(reportSelectionSchema.parse({ area: 'financial',
        query: { workspaceId, view: 'financial', period, selected: 'materials' } }));
      await assert.rejects(read(costs, identity, enabled.filter(value => value !== 'workorders.view_costs')), AuthorizationAccessError);
      const estimates = await read({ request: { mode: 'default', area: 'estimates', period: null } },
        identity, enabled.filter(value => value !== 'reports.financial.read'));
      assert.equal(estimates.area, 'estimates');
      await trx('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.financial.read' }).delete();
      await assert.rejects(read(financial), AuthorizationAccessError);
    });
    await check('missing/mismatched context, future periods and aborted turns cannot yield report evidence', async () => {
      await assert.rejects(read({ request: { mode: 'current_report' } }), ReportAssistantClarificationError);
      const foreign = { selection: { ...examples[0], query: { ...examples[0].query, workspaceId: randomUUID() } },
        period: { preset: 'last30days' } };
      await assert.rejects(read({ request: { mode: 'current_report' } }, identity, enabled, foreign), AuthorizationAccessError);
      await assert.rejects(read({ request: { mode: 'default', area: 'jobs',
        period: { preset: 'custom', from: today, to: addCalendarDays(today, 1) } } }), ReportAssistantClarificationError);
      const controller = new AbortController(); controller.abort(new Error('Fixture cancelled'));
      await assert.rejects(read(explicit(examples[1]), identity, enabled, undefined, controller.signal), /Fixture cancelled/);
    });
    await check('in-flight cancellation and the exact 15-second delivery deadline discard native results', async () => {
      for (const elapsed of [reportAssistantReadLimits.durationMs - 1, reportAssistantReadLimits.durationMs]) {
        const now = Date.now(), clock = mock.method(Date, 'now', () => now);
        let nativeStarted = false;
        const advance = (query: { sql: string }) => {
          if (query.sql.includes('"leads"')) {
            nativeStarted = true;
            clock.mock.mockImplementation(() => now + elapsed);
          }
        };
        trx.on('query', advance);
        try {
          const result = read(explicit(examples[1]));
          if (elapsed < reportAssistantReadLimits.durationMs) assert.equal((await result).area, 'leads');
          else await assert.rejects(result, ReportAssistantLimitError);
          assert(nativeStarted);
        } finally {
          trx.removeListener('query', advance); clock.mock.restore();
        }
      }
      const controller = new AbortController();
      const abort = (query: { sql: string }) => {
        if (query.sql.includes('"leads"')) controller.abort(new Error('Fixture cancelled in flight'));
      };
      trx.on('query', abort);
      try {
        await assert.rejects(read(explicit(examples[1]), identity, enabled, undefined, controller.signal), /Fixture cancelled in flight/);
      } finally {
        trx.removeListener('query', abort);
      }
    });
    await check('oversized UTF-8 evidence fails explicitly, without truncating aggregates or labels', async () => {
      const manual = () => withWorkspaceAuthorization(trx, identity, enabled, false, (transaction, context) =>
        readReportSelectionInTransaction(transaction, context, examples[1]));
      await trx('leads').where({ workspaceId }).update({ name: '\u0141'.repeat(1500) });
      const native = await manual();
      assert(JSON.stringify(native).length < reportAssistantReadLimits.bytes);
      assert(Buffer.byteLength(JSON.stringify(native), 'utf8') > reportAssistantReadLimits.bytes);
      await assert.rejects(read(explicit(examples[1])), ReportAssistantLimitError);
      await trx('leads').where({ workspaceId }).update({ name: 'x' });
      const initial = await manual();
      if (initial.area !== 'leads') throw new Error('Expected Leads.');
      const rowCount = initial.read.report.rows.length;
      const available = reportAssistantReadLimits.bytes - Buffer.byteLength(JSON.stringify(initial), 'utf8');
      const name = 'x'.repeat(1 + Math.floor(available / rowCount));
      await trx('leads').where({ workspaceId }).update({ name });
      const padded = await manual();
      const remainder = reportAssistantReadLimits.bytes - Buffer.byteLength(JSON.stringify(padded), 'utf8');
      const first = initial.read.report.rows[0];
      assert(first);
      await trx('leads').where({ id: first.id }).update({ name: name + 'x'.repeat(remainder) });
      const exact = await read(explicit(examples[1]));
      assert.equal(Buffer.byteLength(JSON.stringify(exact), 'utf8'), reportAssistantReadLimits.bytes);
      await trx('leads').where({ id: first.id }).update({ name: name + 'x'.repeat(remainder + 1) });
      await assert.rejects(read(explicit(examples[1])), ReportAssistantLimitError);
    });
    throw rollback;
  }), error => error === rollback);
  console.log(`Reports assistant: ${checks} database groups passed; fixtures rolled back.`);
} finally {
  await db.destroy();
}
