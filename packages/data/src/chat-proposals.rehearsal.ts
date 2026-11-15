/** Opt-in migration/repository checks in an exclusively owned disposable database. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import knex, { type Knex } from 'knex';
import { chatProposalFamilies, pendingUniqueProposalFamilies, type AuthorizationContext, type ChatProposalFamily } from '@salesmora/contracts';
import { migrateFreshBaseline } from './baseline-runner';
import { down as rollbackBaseline } from './baseline-migrations/202611150001_fresh_baseline';
import { initializeWorkspacePolicy, withWorkspaceAuthorization, AuthorizationAccessError } from './authorization/store';
import { createProposal, replaceProposal, readOwnedProposal, readProposalRequest, recordProposalReview, resolveProposal, supersedeProposals,
  readProposalHistory, readProposalEvidence, ChatProposalConflictError, parseChatProposal } from './chat-proposals';
import { RUNTIME_GROUP, RUNTIME_LOGIN_ROLES, applyRuntimeGrants } from './runtime-roles';

const envFile = fileURLToPath(new URL('../../../.env.local', import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname))
  throw new Error('Proposal rehearsal requires a separate local TEST_DATABASE_URL ending in _test.');
const database = `proposal_rehearsal_${randomUUID().replaceAll('-', '')}_test`;
const isolated = new URL(connection); isolated.pathname = `/${database}`;
const admin = knex({ client: 'pg', connection });
const db = knex({ client: 'pg', connection: isolated.toString(), pool: { min: 0, max: 5 } });
const workspaceId = randomUUID(), otherWorkspace = randomUUID(), userId = 'proposal-owner';
const hash = 'a'.repeat(64), at = '2026-11-13T12:00:00.000Z', expiresAt = '2026-11-13T12:15:00.000Z';
let created = false, checks = 0;
async function check(name: string, run: () => Promise<void>) { await run(); checks++; console.log(`PASS ${name}`); }
async function transaction(run: (trx: Knex.Transaction, context: AuthorizationContext) => Promise<void>) {
  await withWorkspaceAuthorization(db, { workspaceId, userId }, ['assistant.use'], true, run);
}
async function turn(trx: Knex, threadId = randomUUID(), owner = userId, workspace = workspaceId) {
  await trx('chatThreads').insert({ id: threadId, workspaceId: workspace, userId: owner }).onConflict('id').ignore();
  const id = randomUUID();
  await trx('chatTurns').insert({
    id, threadId, workspaceId: workspace, userId: owner, clientTurnId: randomUUID(),
    requestHash: hash, surfaceKey: 'home', state: 'completed', leaseUntil: expiresAt,
  });
  return { threadId, turnId: id };
}
function proposal(routing: { threadId: string; turnId: string }, family: ChatProposalFamily = 'action', id = randomUUID()) {
  const common = {
    ...routing, family, id, workspaceId, userId, state: 'pending', inputHash: hash,
    payloadVersion: 1, requestId: null, createdAt: at, expiresAt, resolvedAt: null,
  };
  const review = { id, inputHash: hash, expiresAt, state: 'pending', changes: [] };
  const lead = {
    name: ' Fictional lead ', email: 'FICTIONAL@example.test', phone: '', service: ' Repair ',
    address: '', details: '', notes: '', source: 'other', stage: 'new', ownerId: userId,
  };
  if (family === 'action') return { ...common, payload: { actionType: 'lead.create', capability: 'leads.create', lead, accessHash: hash } };
  if (family === 'customer') return { ...common, payload: {
    accessHash: hash, customerStamp: hash, review: { ...review, action: 'create', customer: { name: 'Customer', number: '' } },
    payload: { kind: 'create', input: { workspaceId, submissionId: id, values: {
      name: ' Customer ', type: 'person', companyName: ' Raw signed company ', email: '', phone: '',
      location: '', internalNotes: '', ownerId: userId,
    } } },
  } };
  if (family === 'workOrder') return { ...common, payload: {
    accessHash: hash, review: { ...review, action: 'create', workOrder: { number: '', title: ' Work ' } },
    payload: { kind: 'create', input: { workspaceId, submissionId: id, jobId: randomUUID(), title: ' Work ' } },
  } };
  if (family === 'material') return { ...common, payload: {
    accessHash: hash, review: { ...review, action: 'material-create', workOrder: { number: '', title: ' Item ' } },
    payload: { kind: 'material', input: { workspaceId, submissionId: id, action: 'create', item: { name: ' Item ' } } },
  } };
  if (family === 'captureSetup') return { ...common, requestId: randomUUID(), payload: {
    ...routing, authority: hash, manual: false,
    input: { operation: 'create_source', sourceId: null, name: 'Fictional source', sourceType: 'website',
      fields: null, contactRequired: null, workflow: null, brief: null, content: null, rules: null, mappings: null, findings: null },
    view: {
      ticket: { workspaceId, proposalId: id, inputHash: hash, operation: 'create_source', target: { kind: 'new_source' },
        state: 'pending', createdAt: at, expiresAt },
      review: { name: 'Fictional source', configuration: { schemaVersion: 1, type: 'website' },
        before: null, base: null, sample: null, findings: [] },
      receipt: null,
    },
  } };
  if (family === 'calendar') {
    const visitId = randomUUID(), recordId = randomUUID();
    const records = [{ type: 'job', id: recordId, expectedVersion: 2 }];
    const schedule = { scheduledDate: '2026-11-14', arrivalWindow: null };
    return { ...common, payload: {
      draft: { id, inputHash: hash, visitId, revision: hash, createdAt: at, expiresAt, state: 'pending',
        timezone: 'America/New_York', from: { scheduledDate: '2026-11-13', arrivalWindow: null }, to: schedule,
        records: [{ ...records[0], number: 'J-0001', title: 'Fictional Job', status: 'scheduled' }], crew: [], warnings: [] },
      command: { workspaceId, visitId, submissionId: id, expectedVisitVersion: 1, records, schedule },
      authority: hash, stamp: hash, receipt: null, resultStamp: null,
    } };
  }
  if (family === 'estimateConversion') {
    const estimateId = randomUUID(), leadId = randomUUID(), customerId = randomUUID();
    const estimate = {
      id: estimateId, number: 'EST-2048', revision: 1, version: 3, name: 'Repair', status: 'accepted',
      archived: false, parentType: 'lead', parentId: leadId, parentNumber: 'LD-1024', snapshotHash: hash, totalCents: 10000,
      customerId, sourceLeadVersion: 4, sourceLeadArchived: false, customerVersion: 2,
      convertedJobExists: false, sourceLeadHasJob: false, service: 'Plumbing', scope: 'Repair', serviceAddress: '1 Fixture Avenue',
      convertedJob: null,
    };
    const customer = { state: 'ready', id: customerId, name: 'Fictional Customer' };
    return { ...common, payload: {
      stamp: 'a'.repeat(32),
      ticket: { id, actionType: 'estimate.convert', inputHash: hash, authorizationVersion: hash,
        createdAt: at, expiresAt, state: 'pending', estimate, customer },
      review: { estimate, customer, capabilities: { read: true }, canCreateJob: true, canScheduleCreation: false,
        canResolveCustomer: false, members: [], parentJob: null,
        review: { estimateId, expectedVersion: 3, expectedLeadVersion: 4, expectedCustomerVersion: 2,
          snapshotHash: hash, sourceLeadId: leadId, job: {
            customerId, customerName: 'Fictional Customer', title: 'Repair', service: 'Plumbing', location: '1 Fixture Avenue',
            description: 'Repair', primaryOwnerId: null, teamUserIds: [], scheduledDate: null, arrivalWindow: null, completionDeadline: null,
          } },
      },
    } };
  }
  // SQL constraints intentionally tested independently of the stricter domain-envelope validators.
  return { ...common, requestId: family.startsWith('capture') ? randomUUID() : null, payload: {} };
}
const storage = <R extends { payload: object }>(row: R) => ({ ...row, payload: JSON.stringify(row.payload) });
async function rejectedInsert<R extends { payload: object }>(row: R) {
  await assert.rejects(db.transaction(trx => trx('chatProposals').insert(storage(row))), /constraint/);
}

try {
  await admin.raw('CREATE DATABASE ??', [database]); created = true;
  await migrateFreshBaseline(db);
  const now = new Date();
  await db('users').insert([userId, 'proposal-outsider'].map(id => ({
    id, name: id, email: `${id}@example.test`, createdAt: now, updatedAt: now, termsVersion: 'test', termsAcceptedAt: now,
  })));
  await db.transaction(async trx => {
    await trx('workspaces').insert([workspaceId, otherWorkspace].map(id => ({
      id, ownerId: id === workspaceId ? userId : 'proposal-outsider',
      businessName: 'Fictional proposal workspace', businessType: 'test', postalCode: '', serviceRange: '',
    })));
    await trx('workspaceMemberships').insert([workspaceId, otherWorkspace].map(id => ({
      workspaceId: id, userId: id === workspaceId ? userId : 'proposal-outsider', role: 'owner',
    })));
    await initializeWorkspacePolicy(trx, { workspaceId, userId });
    await initializeWorkspacePolicy(trx, { workspaceId: otherWorkspace, userId: 'proposal-outsider' });
  });
  await check('fresh baseline is repeatable and forward-only', async () => {
    assert.equal((await migrateFreshBaseline(db))[1].length, 0);
    await assert.rejects(rollbackBaseline(), /forward-only/);
    assert.equal(await db.schema.hasTable('chatProposals'), true);
  });
  await check('composite ownership rejects a wrong actor, workspace or turn/thread combination', async () => {
    const routing = await turn(db);
    await rejectedInsert({ ...proposal(routing), userId: 'proposal-outsider' });
    await rejectedInsert({ ...proposal(routing), workspaceId: otherWorkspace });
    await rejectedInsert({ ...proposal(routing), threadId: (await turn(db)).threadId });
  });
  await check('all fifteen families and cross-family UUID collisions preserve source identity', async () => {
    const id = randomUUID();
    const turns: string[] = [];
    for (const family of chatProposalFamilies) {
      const row = proposal(await turn(db), family, family === 'material' ? randomUUID() : id);
      turns.push(row.turnId);
      await db('chatProposals').insert(storage(row));
    }
    const rows = await db('chatProposals').where({ id });
    assert.equal(rows.length, 14);
    await transaction(async (trx, context) => {
      const history = await readProposalHistory(trx, context, turns);
      assert.deepEqual(history.map(row => row.family).sort(), [...chatProposalFamilies].sort());
    });
  });
  await check('turn uniqueness matches Lead, Customer and shared Work Order/Materials source rules', async () => {
    const routing = await turn(db);
    for (const family of ['action', 'customer', 'workOrder'] as const) await db('chatProposals').insert(storage(proposal(routing, family)));
    for (const family of ['action', 'customer', 'workOrder', 'material'] as const) await rejectedInsert(proposal(routing, family));
    const row = proposal(await turn(db), 'workOrder');
    await db('chatProposals').insert(storage(row));
    await rejectedInsert(proposal(await turn(db), 'material', row.id));
  });
  await check('eleven pending-family constraints and two all-state Capture request constraints', async () => {
    const routing = await turn(db);
    for (const family of pendingUniqueProposalFamilies) {
      const row = proposal(routing, family);
      await db('chatProposals').insert(storage(row));
      await rejectedInsert(proposal(await turn(db, routing.threadId), family));
      if (family.startsWith('capture')) {
        await db('chatProposals').where({ family, id: row.id }).update({ state: 'cancelled' });
        await rejectedInsert({ ...proposal(await turn(db), family), requestId: row.requestId });
        await rejectedInsert({ ...proposal(await turn(db), family), requestId: null });
      }
    }
  });
  await check('Lead body/capability, state, version, hash and JSON-object constraints reject malformed SQL', async () => {
    const row = proposal(await turn(db));
    await rejectedInsert({ ...row, state: 'expired' });
    await rejectedInsert({ ...row, payloadVersion: 0 });
    await rejectedInsert({ ...row, inputHash: 'not-a-hash' });
    await rejectedInsert({ ...row, requestId: randomUUID() });
    await assert.rejects(db.transaction(trx => trx('chatProposals').insert({ ...storage(row), payload: '[]' })));
    for (const payload of [{}, { actionType: 'lead.stage', capability: 'leads.create', lead: {}, accessHash: hash },
      { actionType: 'lead.stage', capability: 'leads.stage.update', lead: {}, accessHash: hash, stagePayload: {} , notePayload: {} }])
      await assert.rejects(db.transaction(trx => trx('chatProposals').insert({ ...storage(row), payload: JSON.stringify(payload) })));
  });
  await check('native envelopes remain lossless; projection and Materials-family mismatches are explicit', async () => {
    for (const family of ['action', 'customer', 'workOrder', 'material'] as const) {
      const row = proposal(await turn(db), family);
      const parsed = parseChatProposal(row);
      assert.deepEqual(parsed.payload, row.payload);
      if (family !== 'action') assert.throws(() => parseChatProposal({ ...row, inputHash: 'b'.repeat(64) }));
      if (family === 'material') assert.throws(() => parseChatProposal({ ...row, family: 'workOrder' }));
    }
  });
  await check('replacement direction and original inner review state are preserved atomically', async () => {
    await transaction(async (trx, context) => {
      const routing = await turn(trx);
      const unrelated = await createProposal(trx, context, proposal(await turn(trx, routing.threadId), 'calendar'));
      const lead = await createProposal(trx, context, proposal(routing));
      const customer = await replaceProposal(trx, context, proposal(await turn(trx, routing.threadId), 'customer'));
      assert.equal((await readOwnedProposal(trx, context, lead)).state, 'superseded');
      const nextLead = await replaceProposal(trx, context, proposal(await turn(trx, routing.threadId)));
      assert.equal((await readOwnedProposal(trx, context, customer)).state, 'pending');
      const work = await replaceProposal(trx, context, proposal(await turn(trx, routing.threadId), 'workOrder'));
      assert.equal((await readOwnedProposal(trx, context, nextLead)).state, 'superseded');
      assert.equal((await readOwnedProposal(trx, context, customer)).state, 'superseded');
      await replaceProposal(trx, context, proposal(await turn(trx, routing.threadId), 'material'));
      const stored = await readOwnedProposal(trx, context, work);
      assert.equal(stored.state, 'superseded');
      if (stored.family === 'workOrder') assert.equal(stored.payload.review.state, 'pending');
      assert.equal((await readOwnedProposal(trx, context, unrelated)).state, 'pending');
    });
  });
  await check('failed replacement/pruning restores siblings and does not invent lifecycle events', async () => {
    await transaction(async (trx, context) => {
      const routing = await turn(trx);
      const original = await createProposal(trx, context, proposal(routing));
      const before = (await trx('chatProposalAudit').where({ proposalId: original.id })).length;
      await assert.rejects(replaceProposal(trx, context, proposal(routing)));
      assert.equal((await readOwnedProposal(trx, context, original)).state, 'pending');
      await assert.rejects(replaceProposal(trx, context, proposal(await turn(trx, routing.threadId)), async () => {
        throw new Error('pruning rejected');
      }), /pruning rejected/);
      assert.equal((await readOwnedProposal(trx, context, original)).state, 'pending');
      assert.equal((await trx('chatProposalAudit').where({ proposalId: original.id })).length, before);
    });
  });
  await check('audit failure rolls back creation and confirmation even when the caller catches the error', async () => {
      await transaction(async (trx, context) => {
        const original = await createProposal(trx, context, proposal(await turn(trx)));
        const input = proposal(await turn(trx));
        await trx.raw(`CREATE FUNCTION rehearsal_reject_proposal_audit() RETURNS trigger LANGUAGE plpgsql AS $$
          BEGIN RAISE EXCEPTION 'rehearsal audit failure'; END $$`);
        await trx.raw(`CREATE TRIGGER rehearsal_reject_proposal_audit BEFORE INSERT ON "chatProposalAudit"
          FOR EACH ROW EXECUTE FUNCTION rehearsal_reject_proposal_audit()`);
        await assert.rejects(createProposal(trx, context, input), /rehearsal audit failure/);
        assert.equal(await trx('chatProposals').where({ id: input.id }).first(), undefined);
        await assert.rejects(resolveProposal(trx, context, original, expiresAt, async (old, command) => {
          await command('chatThreads').where({ id: old.threadId }).update({ updatedAt: expiresAt });
          return { ...old, state: 'confirmed' };
        }), /rehearsal audit failure/);
        assert.equal((await readOwnedProposal(trx, context, original)).state, 'pending');
        assert.notEqual(new Date((await trx('chatThreads').where({ id: original.threadId }).first('updatedAt')).updatedAt).toISOString(), expiresAt);
        await trx.raw('DROP TRIGGER rehearsal_reject_proposal_audit ON "chatProposalAudit"');
        await trx.raw('DROP FUNCTION rehearsal_reject_proposal_audit()');
      });
  });
  await check('guarded resolve runs business state and lifecycle exactly once; rejected callback rolls both back', async () => {
    await transaction(async (trx, context) => {
      const row = await createProposal(trx, context, proposal(await turn(trx)));
      let executed = 0;
      const execute = async (old: typeof row, command: Knex.Transaction) => {
        executed++;
        await command('chatThreads').where({ id: old.threadId }).update({ updatedAt: expiresAt });
        return { ...old, state: 'confirmed' as const };
      };
      await assert.rejects(resolveProposal(trx, context, row, expiresAt, async (old, command) => {
        await command('chatThreads').where({ id: old.threadId }).update({ updatedAt: expiresAt });
        return { ...old, inputHash: 'b'.repeat(64), state: 'confirmed' };
      }), ChatProposalConflictError);
      assert.notEqual(new Date((await trx('chatThreads').where({ id: row.threadId }).first('updatedAt')).updatedAt).toISOString(), expiresAt);
      await resolveProposal(trx, context, row, expiresAt, execute);
      await assert.rejects(resolveProposal(trx, context, row, expiresAt, execute), ChatProposalConflictError);
      assert.equal(executed, 1);
      assert.equal((await trx('chatProposalAudit').where({ proposalId: row.id, action: 'draft.confirmed' })).length, 1);
    });
  });
  await check('concurrent confirm/confirm and confirm/cancel execute at most one domain command', async () => {
      for (const states of [['confirmed', 'confirmed'], ['confirmed', 'cancelled']] as const) {
        const routing = await turn(db), input = proposal(routing), key = { family: 'action' as const, id: input.id };
        await transaction(async (trx, context) => { await createProposal(trx, context, input); });
        let executed = 0;
        const results = await Promise.allSettled(states.map(state => transaction(async (trx, context) => {
          await resolveProposal(trx, context, key, expiresAt, async old => { executed++; return { ...old, state }; });
        })));
        assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
        assert.equal(executed, 1);
        for (const result of results) if (result.status === 'rejected') assert.ok(result.reason instanceof ChatProposalConflictError);
        assert.equal((await db('chatProposalAudit').where({ proposalId: key.id }).whereIn('action', ['draft.confirmed', 'draft.cancelled'])).length, 1);
      }
    });
  await check('Capture request replay, manual source binding and row-only supersession retain native payload', async () => {
      await transaction(async (trx, context) => {
        const routing = await turn(trx), input = proposal(routing, 'captureSetup');
        const row = await createProposal(trx, context, input);
        assert.ok(row.requestId);
        assert.deepEqual(await readProposalRequest(trx, context, 'captureSetup', row.requestId), row);
        assert.equal(await readProposalRequest(trx, context, 'captureSource', row.requestId), undefined);
        await replaceProposal(trx, context, proposal(await turn(trx, routing.threadId), 'captureSetup'));
        const stored = await readOwnedProposal(trx, context, row);
        assert.equal(stored.state, 'superseded');
        assert.deepEqual(stored.payload, input.payload);
        assert.throws(() => parseChatProposal({ ...input, turnId: randomUUID() }), /source binding/);
      });
    });
  await check('Calendar synchronizes draft supersession; Conversion review remains pending and cannot confirm', async () => {
      await transaction(async (trx, context) => {
        const routing = await turn(trx);
        const calendar = await createProposal(trx, context, proposal(routing, 'calendar'));
        await replaceProposal(trx, context, proposal(await turn(trx, routing.threadId), 'calendar'));
        const stored = await readOwnedProposal(trx, context, calendar);
        if (stored.family !== 'calendar') throw new Error('Expected Calendar family.');
        assert.equal(stored.payload.draft.state, 'superseded');
        const conversion = await createProposal(trx, context, proposal(await turn(trx), 'estimateConversion'));
        const key = { family: 'estimateConversion' as const, id: conversion.id };
        let reviews = 0;
        await recordProposalReview(trx, context, key, at, async () => { reviews++; });
        assert.equal(reviews, 1);
        assert.equal((await readOwnedProposal(trx, context, key)).state, 'pending');
        assert.equal((await trx('chatProposalAudit').where({ proposalId: key.id, action: 'review-opened' })).length, 1);
        await assert.rejects(resolveProposal(trx, context, key, expiresAt, async old => ({ ...old, state: 'confirmed' })), ChatProposalConflictError);
        assert.equal((await readOwnedProposal(trx, context, key)).state, 'pending');
      });
  });
  await check('owned discovery uses one proposal table; plain metadata skips SQL and wrong identity is denied', async () => {
    await transaction(async (trx, context) => {
      const row = await createProposal(trx, context, proposal(await turn(trx)));
      let queries = 0; const count = () => { queries++; };
      trx.on('query', count);
      try {
        assert.deepEqual(await readProposalHistory(trx, context, [row.turnId], new Map([[row.turnId, []]])), []);
        assert.equal(queries, 0);
        assert.deepEqual(await readProposalHistory(trx, context, [row.turnId]), [{ turnId: row.turnId, family: 'action', state: 'pending' }]);
        assert.equal(queries, 1);
      } finally { trx.removeListener('query', count); }
      await assert.rejects(readOwnedProposal(trx, { ...context, userId: 'proposal-outsider' }, row), AuthorizationAccessError);
      await assert.rejects(readOwnedProposal(trx, { ...context, workspaceId: otherWorkspace }, row), AuthorizationAccessError);
      await assert.rejects(readOwnedProposal(trx, { ...context, enabledPermissions: [] }, row), AuthorizationAccessError);
    });
  });
  await check('history selects newest per family, honors declared families and rejects unsupported versions', async () => {
      const routing = await turn(db);
      const first = proposal(routing, 'estimateSharing'), newest = proposal(routing, 'estimateSharing');
      await db('chatProposals').insert([
        storage({ ...first, state: 'cancelled' }),
        storage({ ...newest, createdAt: expiresAt }),
        storage(proposal(routing, 'calendar')),
      ]);
      await transaction(async (trx, context) => {
        assert.deepEqual(await readProposalHistory(trx, context, [routing.turnId], new Map([[routing.turnId, ['estimateSharing']]])),
          [{ turnId: routing.turnId, family: 'estimateSharing', state: 'pending' }]);
        await trx('chatProposals').where({ family: 'estimateSharing', id: newest.id }).update({ payloadVersion: 2 });
        await assert.rejects(readProposalHistory(trx, context, [routing.turnId]), /Invalid input/);
        await assert.rejects(readOwnedProposal(trx, context, { family: 'estimateSharing', id: newest.id }), /Invalid input/);
      });
      await check('mixed inherited proposal evidence uses one owned completed-thread query and validates original envelopes', async () => {
        await transaction(async (trx, context) => {
          const routing = await turn(trx);
          const rows = [];
          for (const family of ['action', 'customer', 'workOrder', 'material', 'calendar', 'captureSetup', 'estimateConversion'] as const)
            rows.push(await createProposal(trx, context, proposal(await turn(trx, routing.threadId), family)));
          const requests = rows.map(row => ({ family: row.family, ids: [row.id] }));
          let queries = 0; const count = () => { queries++; }; trx.on('query', count);
          try {
            const evidence = await readProposalEvidence(trx, context, routing.threadId, requests);
            assert.equal(evidence.length, rows.length); assert.equal(queries, 1);
            assert.deepEqual(await readProposalEvidence(trx, context, routing.threadId, []), []); assert.equal(queries, 1);
          } finally { trx.removeListener('query', count); }
          await assert.rejects(readProposalEvidence(trx, { ...context, userId: 'proposal-outsider' }, routing.threadId, requests), AuthorizationAccessError);
          assert.deepEqual(await readProposalEvidence(trx, context, randomUUID(), requests), []);
          await trx('chatTurns').where({ id: rows[0].turnId }).update({ state: 'interrupted' });
          assert.equal((await readProposalEvidence(trx, context, routing.threadId, requests)).length, rows.length - 1);
          await trx('chatProposals').where({ id: rows[1].id }).update({ payloadVersion: 2 });
          await assert.rejects(readProposalEvidence(trx, context, routing.threadId, requests), /Invalid input/);
          await assert.rejects(readProposalEvidence(trx, context, routing.threadId, [{ family: 'customer', ids: Array(51).fill(rows[1].id) }]), /Too big/);
        });
      });
  });
  await check('outer rollback undoes proposal, replacement, audit and native command together', async () => {
    const rollback = new Error('intentional outer rollback');
    const routing = await turn(db), id = randomUUID();
    await assert.rejects(transaction(async (trx, context) => {
      const row = await createProposal(trx, context, proposal(routing, 'action', id));
      await supersedeProposals(trx, context, row.threadId, 'action', expiresAt);
      throw rollback;
    }), error => error === rollback);
    assert.equal(await db('chatProposals').where({ id }).first(), undefined);
    assert.equal(await db('chatProposalAudit').where({ proposalId: id }).first(), undefined);
  });
  await check('source-turn erasure retains immutable audit; forward-only baseline refuses rollback', async () => {
    let id = '';
    await transaction(async (trx, context) => {
      const row = await createProposal(trx, context, proposal(await turn(trx))); id = row.id;
      await trx('chatTurns').where({ id: row.turnId }).delete();
      assert.equal(await trx('chatProposals').where({ id }).first(), undefined);
      assert.equal((await trx('chatProposalAudit').where({ proposalId: id })).length, 1);
    });
    await assert.rejects(db.transaction(trx => trx('chatProposalAudit').where({ proposalId: id }).delete()), /immutable/);
    await assert.rejects(db.transaction(trx => trx('chatProposalAudit').where({ proposalId: id }).update({ action: 'changed' })), /immutable/);
    await assert.rejects(db.transaction(trx => trx.raw('TRUNCATE TABLE "chatProposalAudit"')), /immutable/);
    await assert.rejects(rollbackBaseline(), /forward-only/);
    assert.equal((await db('chatProposalAudit').where({ proposalId: id })).length, 1);
  });
  await check('reapplied runtime grants allow proposal writes but only append/read lifecycle audit', async () => {
    await applyRuntimeGrants(db);
    for (const role of [RUNTIME_GROUP, ...Object.values(RUNTIME_LOGIN_ROLES)]) {
      if (!await db('pg_roles').where({ rolname: role }).first()) continue;
      const { rows } = await db.raw<{ rows: { read: boolean; append: boolean; update: boolean; remove: boolean; truncate: boolean; proposal: boolean }[] }>(
        `SELECT has_table_privilege(?, '"chatProposalAudit"', 'SELECT') AS read,
        has_table_privilege(?, '"chatProposalAudit"', 'INSERT') AS append,
        has_table_privilege(?, '"chatProposalAudit"', 'UPDATE') AS update,
        has_table_privilege(?, '"chatProposalAudit"', 'DELETE') AS remove,
        has_table_privilege(?, '"chatProposalAudit"', 'TRUNCATE') AS truncate,
        has_table_privilege(?, '"chatProposals"', 'INSERT,UPDATE,DELETE') AS proposal`, Array(6).fill(role));
      assert.deepEqual(rows[0], { read: true, append: true, update: false, remove: false, truncate: false, proposal: true });
    }
  });
  await check('audit provenance deduplicates by source namespace, not globally unique legacy UUID', async () => {
    const sourceId = randomUUID();
    const existing = await db('chatProposalAudit').first();
    const copy = { ...existing, id: randomUUID(), sourceTable: 'chatActionAudit', sourceId };
    await db('chatProposalAudit').insert(copy);
    await assert.rejects(db.transaction(trx => trx('chatProposalAudit').insert({ ...copy, id: randomUUID() })), /unique constraint/);
    await db('chatProposalAudit').insert({ ...copy, id: randomUUID(), sourceTable: 'chatCalendarAudit' });
    await assert.rejects(db.transaction(trx => trx('chatProposalAudit').insert({ ...copy, id: randomUUID(), sourceId: null })), /check constraint/);
  });
  console.log(`Canonical proposal rehearsal: ${checks} checks passed. Existing databases untouched.`);
} finally {
  await db.destroy();
  try { if (created) await admin.raw('DROP DATABASE ??', [database]); } finally { await admin.destroy(); }
}
