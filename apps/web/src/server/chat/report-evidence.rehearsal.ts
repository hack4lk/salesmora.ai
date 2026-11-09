import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { chatTurnRequestSchema, chatHistoryResponseSchema, chatStreamEventSchema,
  reportAssistantTicket, reportAssistantReadSnapshotSchema, reportTemplateAreas, type ReportAssistantReadSnapshot } from '@salesmora/contracts';
import { createDatabase, initializeWorkspacePolicy, withWorkspaceAuthorization, AuthorizationAccessError,
  readReportSnapshotForAssistant, reportAssistantEvidenceAllowed, reportAssistantSnapshotMatches,
  ReportAssistantStaleError, ReportAssistantLimitError } from '@salesmora/data';
import type { Knex } from '@salesmora/data';
import { availableChatTools, authorizeChatTool, liveChatTools } from '@salesmora/agent';

process.loadEnvFile(fileURLToPath(new URL('../../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw new Error('Use a separate local _test database.');
if (process.env.NODE_ENV !== 'development') throw new Error('Run the local report evidence rehearsal with NODE_ENV=development.');
process.env.DATABASE_URL = connection;
const db = createDatabase(connection), workspaceId = randomUUID(), owner = randomUUID(), field = randomUUID();
const otherWorkspace = randomUUID(), outsider = randomUUID();
const identity = { workspaceId, userId: owner };
const globals = globalThis as typeof globalThis & { workspaceDatabase?: ReturnType<typeof createDatabase> };
const { enabledPermissions: enabled } = await import('../authorization/permissions');
const store = await import('./store');
const { reportResultResponse } = await import('./report-result');
const { reportHref } = await import('../../features/reports/report-navigation');
const { reportSelectionExamples } = await import('../../../../../packages/contracts/src/reports/assistant-query.fixtures');
const { createChatToolExecutor } = await import('./tools');
const rollback = new Error('Rollback report evidence fixtures.');
let checks = 0;
const check = async (label: string, run: () => Promise<void>) => { await run(); checks++; console.log(`PASS ${label}`); };
try {
  await assert.rejects(db.transaction(async trx => {
    globals.workspaceDatabase = trx;
    await trx('users').insert([owner, field, outsider].map(id => ({
      id, name: 'Report evidence fixture', email: `${id}@example.test`, termsVersion: 'fixture',
      termsAcceptedAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
    })));
    await trx('workspaces').insert([
      { id: workspaceId, ownerId: owner }, { id: otherWorkspace, ownerId: outsider },
    ].map(row => ({ ...row, businessName: 'Evidence fixture', businessType: 'test',
      postalCode: '', serviceRange: '', timezone: 'Pacific/Kiritimati' })));
    await trx('workspaceMemberships').insert([
      { workspaceId, userId: owner, role: 'owner' }, { workspaceId, userId: field, role: 'field' },
      { workspaceId: otherWorkspace, userId: outsider, role: 'owner' },
    ]);
    await initializeWorkspacePolicy(trx, identity);
    await initializeWorkspacePolicy(trx, { workspaceId: otherWorkspace, userId: outsider });
    await trx('workspaceRolePolicies').insert({ workspaceId, role: 'owner', permission: 'reports.financial.read', scope: 'enabled' });
    const leadId = randomUUID();
    await trx('leads').insert({ id: leadId, workspaceId, createdBy: owner, submissionId: randomUUID(),
      submissionHash: 'fixture', name: 'PRIVATE_REPORT_LABEL', email: '', phone: '', service: '', address: '',
      details: 'PRIVATE_DETAILS', notes: 'PRIVATE_NOTE', stage: 'new', source: 'website', ownerId: owner,
      createdAt: trx.raw("CURRENT_TIMESTAMP - interval '1 day'") });
    const jobId = randomUUID(), orderId = randomUUID(), materialId = randomUUID();
    await trx('jobs').insert({ id: jobId, workspaceId, primaryOwnerId: owner, createdBy: owner,
      title: 'Evidence Job', customerName: 'Fixture', service: '', location: '', description: '',
      status: 'needs-scheduling', createdAt: trx.raw("CURRENT_TIMESTAMP - interval '1 day'") });
    await trx('workOrders').insert({ id: orderId, workspaceId, jobId, title: 'Evidence Order', status: 'issued',
      issuedAt: trx.raw("CURRENT_TIMESTAMP - interval '1 day'"), instructions: '', accessNotes: '', safetyNotes: '' });
    await trx('workOrderMaterials').insert({ id: materialId, workspaceId, workOrderId: orderId, position: 0,
      name: 'Evidence material', quantity: '2', costCents: 100, status: 'needed', unit: 'each', note: '' });
    const read = (signal = new AbortController().signal) => readReportSnapshotForAssistant(globals.workspaceDatabase!, identity, enabled,
      { request: { mode: 'default', area: 'leads', period: null } }, undefined, signal);
    const snapshot = await read();
    await check('all nine native areas produce valid private snapshots with fresh authorization', async () => {
      for (const area of reportTemplateAreas) {
        const result = await readReportSnapshotForAssistant(trx, identity, enabled,
          { request: { mode: 'default', area, period: null } }, undefined, new AbortController().signal);
        assert.equal(result.native.area, area);
        assert(reportAssistantSnapshotMatches(result));
        const presentation = reportResultResponse(result);
        assert.equal(presentation.snapshot.result.id, result.binding.id);
        assert.deepEqual(presentation.snapshot.selection, result.binding.selection);
        assert.equal(presentation.retrievedAt, result.binding.retrievedAt);
        assert(reportHref(presentation.snapshot.selection).startsWith(`/reports/${area}?`));
        assert(await withWorkspaceAuthorization(trx, identity, enabled, false,
          (transaction, context) => reportAssistantEvidenceAllowed(transaction, context, [result.binding])));
      }
    });
    await check('all 25 configurations / 21 native views project exact selections, totals and timestamps into cards', async () => {
      for (const example of reportSelectionExamples) {
        const query: Record<string, unknown> = { ...example.query };
        delete query.workspaceId; delete query.page; delete query.pageSize;
        const configured = example.area === 'team' && example.query.view === 'team-jobs'
          ? { ...query, selected: { kind: 'member', id: field, responsibility: 'supporting', filter: 'all' },
            filters: { members: [field] } } : query;
        const snapshot = await readReportSnapshotForAssistant(trx, identity, enabled,
          { request: { mode: 'query', selection: { area: example.area, query: configured } } },
          undefined, new AbortController().signal);
        const { snapshot: presentation, retrievedAt } = reportResultResponse(snapshot);
        assert.deepEqual(presentation.selection, snapshot.binding.selection);
        assert.equal(retrievedAt, snapshot.binding.retrievedAt);
        if ('report' in snapshot.native.read && 'evidenceTotal' in snapshot.native.read.report) {
          assert.equal(presentation.result.sections.find(section => section.id === 'selected-evidence')?.metrics[0]?.value.kind, 'count');
          assert.deepEqual(presentation.result.sections.find(section => section.id === 'selected-evidence')?.metrics[0]?.value,
            { kind: 'count', value: snapshot.native.read.report.evidenceTotal });
          assert.equal(presentation.result.sections[0]?.asOf, snapshot.native.read.report.asOf);
        }
      }
    });
    await check('a mutation between fingerprint and native read cannot acquire a valid snapshot', async () => {
      const undo = new Error('Rollback capture race.');
      await assert.rejects(trx.transaction(async nested => {
        globals.workspaceDatabase = nested;
        let mutation: Promise<number> | undefined;
        const changeAfterFingerprint = (_response: unknown, query: { sql: string }) => {
          if (!mutation && query.sql.includes(') report_evidence')) {
            mutation = nested('leads').where({ id: leadId }).update({ name: 'Raced report label' }).then(count => count);
          }
        };
        nested.on('query-response', changeAfterFingerprint);
        try {
          await assert.rejects(read(), ReportAssistantStaleError);
          assert(mutation);
          assert.equal(await mutation, 1);
        } finally {
          nested.removeListener('query-response', changeAfterFingerprint);
        }
        throw undo;
      }), error => error === undo);
      globals.workspaceDatabase = trx;
    });
    await check('fingerprinting participates in cancellation and the exact 14,999/15,000 ms delivery deadline', async () => {
      const cancellation = new AbortController();
      const abortAfterFingerprint = (_response: unknown, query: { sql: string }) => {
        if (query.sql.includes(') report_evidence')) cancellation.abort(new Error('Cancelled during fingerprint.'));
      };
      trx.on('query-response', abortAfterFingerprint);
      try {
        await assert.rejects(read(cancellation.signal), error => error === cancellation.signal.reason);
      } finally {
        trx.removeListener('query-response', abortAfterFingerprint);
      }
      const now = Date.now;
      for (const duration of [14_999, 15_000]) {
        const start = now();
        let elapsed = 0;
        const delayAfterFingerprint = (_response: unknown, query: { sql: string }) => {
          if (query.sql.includes(') report_evidence')) elapsed = duration;
        };
        Date.now = () => start + elapsed;
        trx.on('query-response', delayAfterFingerprint);
        try {
          if (duration === 15_000) await assert.rejects(read(), ReportAssistantLimitError);
          else assert(reportAssistantSnapshotMatches(await read()));
        } finally {
          Date.now = now;
          trx.removeListener('query-response', delayAfterFingerprint);
        }
      }
    });
    const request = chatTurnRequestSchema.parse({ workspaceId, clientTurnId: randomUUID(), surfaceKey: 'home',
      message: 'Summarize my authorized report', reportContext: { selection: snapshot.binding.selection, period: { preset: 'last30days' } } });
    const { turn } = await store.acceptTurn(identity, request);
    await check('private snapshot is bound before streaming, with exact query/identity/timestamps and opaque transport only', async () => {
      assert.equal(snapshot.binding.viewerId, owner);
      assert.equal(snapshot.binding.selection.area, 'leads');
      assert(reportAssistantSnapshotMatches(snapshot));
      await store.rememberReportRead(identity, turn.id, snapshot);
      await store.appendDelta(identity, turn.id, 'PRIVATE_REPORT_NARRATIVE');
      await store.validateTurnEvidence(identity, turn.id);
      const ticket = reportAssistantTicket(snapshot.binding);
      const event = chatStreamEventSchema.parse({ version: 1, runId: turn.id, turnId: turn.id, sequence: 1,
        type: 'report.result', messageId: turn.messageId, result: ticket });
      assert.equal(event.type, 'report.result');
      if (event.type !== 'report.result') throw new Error('Expected report event.');
      assert.deepEqual(event.result, ticket);
      assert(!JSON.stringify(event).includes('PRIVATE_'));
      assert(!JSON.stringify(event).includes(snapshot.binding.stamp));
      assert.deepEqual((await trx('chatTurns').where({ id: turn.id }).first()).pageContext, request.reportContext
        ? { reportContext: request.reportContext } : {});
      await store.finishTurn(identity, turn.id, 'completed');
      const resolved = await store.readReportChatSnapshot(identity, turn.id, ticket.id);
      assert.deepEqual(resolved, snapshot);
      const history = await store.readThreads(identity, turn.threadId);
      assert('turns' in history && history.turns);
      assert.deepEqual(history.turns[0].reportResult, ticket);
      assert.equal(history.turns[0].reportStatus, 'ready');
      assert(!JSON.stringify(history).includes('PRIVATE_REPORT_LABEL'));
      assert(!JSON.stringify(history).includes(snapshot.binding.stamp));
      chatHistoryResponseSchema.parse(JSON.parse(JSON.stringify(history)));
      const replay = await store.acceptTurn(identity, request);
      assert(replay.replay);
      assert.equal(replay.turn.id, turn.id);
    });
    const followRequest = { workspaceId, clientTurnId: randomUUID(), threadId: turn.threadId, surfaceKey: 'home' as const,
      message: 'Explain that finding without rereading' };
    const { turn: follow } = await store.acceptTurn(identity, followRequest);
    await store.rememberReportHistory(identity, follow.id, [snapshot.binding.id]);
    await store.appendDelta(identity, follow.id, 'PRIVATE_INHERITED_NARRATIVE');
    await store.finishTurn(identity, follow.id, 'completed');
    const { turn: active } = await store.acceptTurn(identity, { ...followRequest, clientTurnId: randomUUID() });
    const followedHistory = await store.readThreads(identity, turn.threadId);
    assert('turns' in followedHistory && followedHistory.turns);
    const inheritedBindings = followedHistory.turns.find(candidate => candidate.id === follow.id)?.reportSources;
    assert.deepEqual(inheritedBindings, [snapshot.binding.id]);
    await store.rememberReportHistory(identity, active.id, inheritedBindings ?? []);
    await store.appendDelta(identity, active.id, 'PRIVATE_PARTIAL_NARRATIVE');
    await check('unfinished report prose is not restored as unbound evidence for a later answer', async () => {
      const history = await store.readThreads(identity, turn.threadId);
      assert(!JSON.stringify(history).includes('PRIVATE_PARTIAL_NARRATIVE'));
      assert('turns' in history && history.turns);
      assert.equal(history.turns.find(candidate => candidate.id === active.id)?.reportStatus, 'restricted');
    });
    const pendingSnapshot = await read();
    const mutationCheck = async (label: string, mutate: (nested: Knex.Transaction) => Promise<unknown>) => {
      await check(label, async () => {
        const undo = new Error('Rollback one evidence mutation.');
        await assert.rejects(trx.transaction(async nested => {
          globals.workspaceDatabase = nested;
          await mutate(nested);
          await assert.rejects(store.validateTurnEvidence(identity, active.id), AuthorizationAccessError);
          await assert.rejects(store.rememberReportRead(identity, active.id, pendingSnapshot), AuthorizationAccessError);
          await assert.rejects(store.appendDelta(identity, active.id, 'MUST_NOT_BE_RELEASED'), AuthorizationAccessError);
          await assert.rejects(store.finishTurn(identity, active.id, 'completed'), AuthorizationAccessError);
          await assert.rejects(store.readReportChatSnapshot(identity, turn.id, snapshot.binding.id), AuthorizationAccessError);
          await assert.rejects(store.acceptTurn(identity, request), AuthorizationAccessError);
          const history = await store.readThreads(identity, turn.threadId);
          assert('messages' in history && history.messages && 'turns' in history && history.turns);
          assert(!JSON.stringify(history.messages).includes('PRIVATE_REPORT_NARRATIVE'));
          assert(!JSON.stringify(history.messages).includes('PRIVATE_INHERITED_NARRATIVE'));
          assert(!JSON.stringify(history.messages).includes('PRIVATE_PARTIAL_NARRATIVE'));
          for (const id of [turn.id, follow.id, active.id]) {
            const item: { reportStatus?: string; reportResult?: unknown; reportSources?: string[]; pageContext?: unknown } | undefined =
              history.turns.find(candidate => candidate.id === id);
            assert(item); assert.equal(item.reportStatus, 'restricted');
            assert.equal(item.reportResult, undefined);
            assert.deepEqual(item.reportSources, []);
            assert.equal(item.pageContext, undefined);
          }
          throw undo;
        }), error => error === undo);
        globals.workspaceDatabase = trx;
        await store.validateTurnEvidence(identity, active.id);
      });
    };
    await mutationCheck('assignment changes block subsequent deltas, cards, replay and inherited private-history prose',
      nested => nested('leads').where({ id: leadId }).update({ ownerId: field }));
    await mutationCheck('permanent deletion invalidates complete population evidence, not just displayed rows',
      nested => nested('leads').where({ id: leadId }).delete());
    await mutationCheck('monetary revocation invalidates direct and transitive report turns',
      nested => nested('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'workorders.view_costs' }).delete());
    await mutationCheck('Financial gate revocation invalidates report-derived answers',
      nested => nested('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'reports.financial.read' }).delete());
    await mutationCheck('member label changes invalidate saved snapshots',
      nested => nested('users').where({ id: field }).update({ name: 'Changed label' }));
    await mutationCheck('native material changes invalidate conservative all-area report evidence',
      nested => nested('workOrderMaterials').where({ id: materialId }).update({ costCents: 200 }));
    await mutationCheck('workspace timezone changes invalidate relative/current snapshot history',
      nested => nested('workspaces').where({ id: workspaceId }).update({ timezone: 'UTC' }));
    await check('a real Financial snapshot loses both its saved money and narrative when costs are revoked', async () => {
      const undo = new Error('Rollback Financial revocation.');
      await assert.rejects(trx.transaction(async nested => {
        globals.workspaceDatabase = nested;
        const financial = await readReportSnapshotForAssistant(nested, identity, enabled,
          { request: { mode: 'default', area: 'financial', period: null } }, undefined, new AbortController().signal);
        assert.equal(financial.native.area, 'financial');
        await store.rememberReportRead(identity, active.id, financial);
        await assert.rejects(store.rememberReportRead(identity, active.id, pendingSnapshot), store.ChatConflictError);
        await store.appendDelta(identity, active.id, 'PRIVATE_FINANCIAL_NARRATIVE');
        await store.finishTurn(identity, active.id, 'completed');
        await nested('workspaceRolePolicies').where({ workspaceId, role: 'owner', permission: 'workorders.view_costs' }).delete();
        await assert.rejects(store.readReportChatSnapshot(identity, active.id, financial.binding.id), AuthorizationAccessError);
        const history = await store.readThreads(identity, turn.threadId);
        assert(!JSON.stringify(history).includes('PRIVATE_FINANCIAL_NARRATIVE'));
        throw undo;
      }), error => error === undo);
      globals.workspaceDatabase = trx;
    });
    await check('membership removal and workspace suspension deny the entire saved conversation', async () => {
      for (const mutate of [
        (nested: Knex.Transaction) => nested('workspaceMemberships').where({ workspaceId, userId: owner }).delete(),
        (nested: Knex.Transaction) => nested('workspaces').where({ id: workspaceId }).update({
          suspendedAt: new Date(), suspendedReason: 'Evidence rehearsal',
        }),
      ]) {
        const undo = new Error('Rollback authority revocation.');
        await assert.rejects(trx.transaction(async nested => {
          globals.workspaceDatabase = nested;
          await mutate(nested);
          await assert.rejects(store.validateTurnEvidence(identity, active.id), AuthorizationAccessError);
          await assert.rejects(store.readThreads(identity, turn.threadId), AuthorizationAccessError);
          await assert.rejects(store.readReportChatSnapshot(identity, turn.id, snapshot.binding.id), AuthorizationAccessError);
          throw undo;
        }), error => error === undo);
        globals.workspaceDatabase = trx;
      }
    });
    await check('corrupted persisted native content redacts its narrative and cannot be resolved or newly inherited', async () => {
      const undo = new Error('Rollback stored snapshot corruption.');
      await assert.rejects(trx.transaction(async nested => {
        globals.workspaceDatabase = nested;
        const tampered = structuredClone(snapshot);
        if (tampered.native.area !== 'leads') throw new Error('Expected Leads.');
        tampered.native.read.report.rows[0].label = 'FORGED_PERSISTED_LABEL';
        await nested('chatTurns').where({ id: turn.id }).update({ reportSnapshot: JSON.stringify(tampered) });
        await assert.rejects(store.readReportChatSnapshot(identity, turn.id, snapshot.binding.id), AuthorizationAccessError);
        await assert.rejects(store.rememberReportHistory(identity, active.id, [snapshot.binding.id]), AuthorizationAccessError);
        const history = await store.readThreads(identity, turn.threadId);
        assert(!JSON.stringify(history).includes('PRIVATE_REPORT_NARRATIVE'));
        assert(!JSON.stringify(history).includes('FORGED_PERSISTED_LABEL'));
        throw undo;
      }), error => error === undo);
      globals.workspaceDatabase = trx;
    });
    await check('other users/workspaces/threads, forged result IDs and altered private snapshots fail closed', async () => {
      for (const who of [{ workspaceId, userId: field }, { workspaceId: otherWorkspace, userId: outsider }]) {
        await assert.rejects(store.readReportChatSnapshot(who, turn.id, snapshot.binding.id), AuthorizationAccessError);
        await assert.rejects(store.validateTurnEvidence(who, turn.id), AuthorizationAccessError);
      }
      await assert.rejects(store.readReportChatSnapshot(identity, turn.id, randomUUID()), AuthorizationAccessError);
      await assert.rejects(store.rememberReportHistory(identity, active.id,
        Array.from({ length: 8 }, () => randomUUID())), store.ChatLimitError);
      const other = await store.acceptTurn({ workspaceId: otherWorkspace, userId: outsider },
        { workspaceId: otherWorkspace, clientTurnId: randomUUID(), surfaceKey: 'home', message: 'Other report' });
      await assert.rejects(store.rememberReportHistory(identity, active.id, [other.turn.id]), AuthorizationAccessError);
      const foreignSnapshot = structuredClone(snapshot);
      foreignSnapshot.binding.viewerId = field; foreignSnapshot.native.read.viewerId = field;
      await assert.rejects(store.rememberReportRead(identity, active.id, foreignSnapshot), AuthorizationAccessError);
      const tampered = structuredClone(snapshot);
      if (tampered.native.area !== 'leads') throw new Error('Expected Leads.');
      tampered.native.read.report.rows[0].label = 'FORGED_LABEL';
      assert(reportAssistantReadSnapshotSchema.safeParse(tampered).success);
      assert(!reportAssistantSnapshotMatches(tampered));
      await assert.rejects(store.rememberReportRead(identity, active.id, tampered), AuthorizationAccessError);
      await assert.rejects(store.rememberReportRead(identity, turn.id, pendingSnapshot), store.ChatCancelledError);
    });
    await check('fresh results keep historical timestamps and binding changes cannot be laundered into current authority', async () => {
      const fresh = await read();
      assert.notEqual(fresh.binding.id, snapshot.binding.id);
      const allowed = (binding: ReportAssistantReadSnapshot['binding']) => withWorkspaceAuthorization(trx, identity, enabled, false,
        (transaction, context) => reportAssistantEvidenceAllowed(transaction, context, [binding]));
      assert(await allowed(snapshot.binding));
      assert(!await allowed({ ...snapshot.binding, retrievedAt: new Date(Date.parse(snapshot.binding.retrievedAt) + 1).toISOString() }));
      assert(!await allowed({ ...snapshot.binding, selection: fresh.binding.selection, id: randomUUID() }));
      assert.equal((await store.readReportChatSnapshot(identity, turn.id, snapshot.binding.id)).binding.retrievedAt,
        snapshot.binding.retrievedAt);
      assert(!await withWorkspaceAuthorization(trx, identity, enabled.filter(permission => permission !== 'reports.read'), false,
        (transaction, context) => reportAssistantEvidenceAllowed(transaction, context, [snapshot.binding])));
    });
    await check('a valid result owned by the same user cannot be inherited into another private thread', async () => {
      const undo = new Error('Rollback cross-thread fixtures.');
      await assert.rejects(trx.transaction(async nested => {
        globals.workspaceDatabase = nested;
        await store.cancelTurn(identity, active.id);
        const source = await store.acceptTurn(identity,
          { workspaceId, clientTurnId: randomUUID(), surfaceKey: 'home', message: 'A separate report conversation' });
        await store.rememberReportRead(identity, source.turn.id, pendingSnapshot);
        await store.finishTurn(identity, source.turn.id, 'completed');
        const target = await store.acceptTurn(identity, { ...followRequest, clientTurnId: randomUUID() });
        await assert.rejects(store.rememberReportHistory(identity, target.turn.id, [pendingSnapshot.binding.id]),
          AuthorizationAccessError);
        throw undo;
      }), error => error === undo);
      globals.workspaceDatabase = trx;
    });
    await store.cancelTurn(identity, active.id);
    await check('cancelled turns reject late snapshot persistence without leaking evidence', async () => {
      await assert.rejects(store.rememberReportRead(identity, active.id, snapshot), store.ChatCancelledError);
    });
    await check('the live executor binds facts before returning a report ticket and opens only the exact persisted selection', async () => {
      const { turn: live } = await store.acceptTurn(identity, { ...request, clientTurnId: randomUUID(), surfaceKey: 'reports' });
      const execute = createChatToolExecutor({
        identity, turnId: live.id, surface: 'reports', pageContext: live.pageContext, signal: new AbortController().signal,
        authorize: async tool => {
          const context = await store.validateTurnEvidence(identity, live.id);
          if (tool && !authorizeChatTool(context, 'reports', tool, liveChatTools).allowed) throw new AuthorizationAccessError();
          return availableChatTools(context, 'reports', liveChatTools);
        },
      });
      const result = await execute('reports_query', { request: { mode: 'current_report' } });
      assert(result.reportResult);
      assert(!JSON.stringify(result.evidence).includes('"stamp"'));
      assert(!JSON.stringify(result.evidence).includes('"contentHash"'));
      const persisted = await trx('chatTurns').where({ id: live.id }).first('reportSnapshot');
      assert.equal(persisted.reportSnapshot.binding.id, result.reportResult.id);
      await store.appendDelta(identity, live.id, 'Bound live report answer.');
      await store.finishTurn(identity, live.id, 'completed');
      const resolved = await store.readReportChatSnapshot(identity, live.id, result.reportResult.id);
      const presentation = reportResultResponse(resolved);
      assert.deepEqual(presentation.snapshot.selection, snapshot.binding.selection);
      assert.equal(presentation.snapshot.result.id, result.reportResult.id);
      const href = new URL(reportHref(presentation.snapshot.selection), 'http://localhost');
      assert.equal(href.pathname, '/reports/leads');
      assert.deepEqual(JSON.parse(href.searchParams.get('query')!), snapshot.binding.selection.query);
    });
    throw rollback;
  }), error => error === rollback);
  console.log(`Report evidence: ${checks} database/runtime groups passed; fixtures rolled back.`);
} finally {
  globals.workspaceDatabase = undefined;
  await db.destroy();
}
