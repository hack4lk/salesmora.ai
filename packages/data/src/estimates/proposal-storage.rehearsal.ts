import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import knex from 'knex';
import { permissionIds, estimateProposalFamilies, type EstimateDraftChatView } from '@salesmora/contracts';
import { migrateFreshBaseline } from '../baseline-runner';
import { initializeWorkspacePolicy, withWorkspaceAuthorization, AuthorizationAccessError } from '../authorization/store';
import { estimateProposalStorage } from './proposal-storage';
import { createEstimateDraft, EstimateDraftConflictError } from './drafts';
import { readEstimateBusinessProfile, saveEstimateBusinessProfile } from './business-profile';
import { readEstimateSharingReview, shareEstimate } from './sharing';
import { readEstimateDecisionReview, recordEstimateDecision } from './decisions';
import { proposeEstimateChatDraft, operateEstimateChatDraft, refreshEstimateChatDraft, readEstimateChatDraftEditor } from './chat-drafts';
import { proposeEstimateChatShare, operateEstimateChatShare, readEstimateChatShare, estimateShareChatBinding } from './chat-sharing';
import { proposeEstimateChatDecision, operateEstimateChatDecision, estimateDecisionChatBinding } from './chat-decisions';
import { proposeEstimateChatDraftAction, operateEstimateChatDraftAction, estimateDraftActionChatBinding } from './chat-draft-actions';
import { proposeEstimateChatVoid, operateEstimateChatVoid, estimateVoidChatBinding } from './chat-voids';
import { proposeEstimateChatArchive, operateEstimateChatArchive, estimateArchiveChatBinding } from './chat-archives';
import { proposeEstimateChatDraftDelete, operateEstimateChatDraftDelete, readEstimateChatDraftDelete, estimateDraftDeleteChatBinding,
  estimateDraftDeleteChatEvidenceAllowed } from './chat-draft-deletes';
import { proposeEstimateChatConversion, operateEstimateChatConversion, estimateConversionChatBinding } from './chat-conversions';
import { supersedeEstimateProposals } from './chat-proposals';
import { readProposalHistory, withCanonicalProposalStorage } from '../chat-proposals';

const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test'))
  throw new Error('Estimate proposal rehearsal requires TEST_DATABASE_URL ending in _test.');
const database = `estimate_proposal_rehearsal_${randomUUID().replaceAll('-', '')}_test`;
const isolated = new URL(connection); isolated.pathname = `/${database}`;
const admin = knex({ client: 'pg', connection });
const db = knex({ client: 'pg', connection: isolated.toString(), pool: { min: 0, max: 5 } });
const workspaceId = randomUUID(), userId = randomUUID(), outsider = randomUUID(), customerId = randomUUID();
const identity = { workspaceId, userId }, enabled = [...permissionIds];
const signal = () => new AbortController().signal;
let created = false, checks = 0;
async function check(mode: string, label: string, work: () => Promise<void>) {
  await work(); checks++; console.log(`PASS ${mode}: ${label}`);
}
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
async function conversation(threadId: string = randomUUID(), text = 'Prepare installation at $100.00. Reason: Customer requested withdrawal') {
  await db('chatThreads').insert({ id: threadId, ...identity }).onConflict('id').ignore();
  const id = randomUUID();
  await db('chatTurns').insert({
    id, threadId, ...identity, clientTurnId: randomUUID(), requestHash: 'fictional',
    surfaceKey: 'home', state: 'running', leaseUntil: new Date(Date.now() + 900000),
  });
  await db('chatMessages').insert({ id: randomUUID(), turnId: id, role: 'user', text });
  return { id, threadId };
}
async function complete(turn: { id: string }) { await db('chatTurns').where({ id: turn.id }).update({ state: 'completed' }); }
async function parent(type: 'job' | 'lead' = 'job') {
  const id = randomUUID();
  if (type === 'job') await db('jobs').insert({
    id, workspaceId, customerId, title: 'Fictional proposal Job', customerName: 'Fictional Customer',
    service: 'Repair', location: '2 Fixture Avenue', description: '', primaryOwnerId: userId, createdBy: userId,
  });
  else await db('leads').insert({
    id, workspaceId, customerId, createdBy: userId, submissionId: randomUUID(), submissionHash: randomUUID(),
    name: 'Fictional Lead', email: '', phone: '', service: 'Repair', address: '2 Fixture Avenue',
    details: '', notes: '', source: 'other', stage: 'contacted', ownerId: userId,
  });
  return { type, id };
}
async function draft(type: 'job' | 'lead' = 'job') {
  const source = await parent(type);
  return createEstimateDraft(db, identity, enabled, {
    workspaceId, submissionId: randomUUID(), parentType: type, parentId: source.id,
    values: {
      details: { name: 'Fictional Estimate', recipientName: 'Fictional Customer', recipientEmail: 'fixture@example.test',
        serviceAddress: '2 Fixture Avenue', ownerId: userId },
      items: [{ description: 'Installation', quantity: '1', unitPrice: '100.00', taxable: false, included: false }],
      totals: { discount: { type: 'none' }, taxRate: '0' },
      terms: { message: 'Customer message', validUntil: '2026-12-31', paymentTerms: 'Due in 30 days',
        termsNote: '', deposit: { type: 'none' } },
      scope: 'Repair', internalNotes: '', paymentLink: '',
    },
  });
}
async function sent(type: 'job' | 'lead' = 'job') {
  const estimate = await draft(type);
  const review = await readEstimateSharingReview(db, identity, enabled, estimate.id);
  await shareEstimate(db, identity, enabled, {
    workspaceId, estimateId: estimate.id, expectedVersion: estimate.version, mode: 'publish',
    snapshotHash: review.snapshotHash, submissionId: randomUUID(),
  });
  return estimate.id;
}
function draftBinding(view: EstimateDraftChatView) {
  const ticket = view.draft;
  return {
    proposalId: ticket.id, actionType: ticket.actionType, inputHash: ticket.inputHash, authorizationVersion: ticket.authorizationVersion,
    parentType: ticket.parent.type, parentId: ticket.parent.id, parentVersion: ticket.parent.version,
    estimateId: ticket.actionType === 'estimate.update' ? ticket.estimate.id : null,
    expectedVersion: ticket.actionType === 'estimate.update' ? ticket.estimate.expectedVersion : null,
  };
}
async function proposedDraft(threadId?: string) {
  const source = await parent(), turn = await conversation(threadId);
  const view = await proposeEstimateChatDraft(db, identity, enabled, turn.id, { request: {
    operation: 'create', parentType: 'job', parentRef: source.id, estimateRef: null,
    changes: { name: 'Fictional assistant Draft', scope: null, message: null, paymentTerms: null, termsNote: null,
      validUntil: null, discount: null, taxRate: null, deposit: null,
      items: [{ savedLineId: null, description: 'Installation', quantity: '1', unit: 'job', unitPrice: '100.00',
        taxable: false, included: false, priceSource: 'user', priceQuote: '$100.00', catalogRef: null }] },
  } }, signal());
  await complete(turn);
  return { turn, view, source };
}
async function run(mode: 'legacy' | 'canonical') {
  const auditTable = (family: string) => mode === 'canonical' ? 'chatProposalAudit' : family;
  await check(mode, 'Draft create/editor/refresh and concurrent confirmed replay preserve native receipts', async () => {
    const fixture = await proposedDraft(), binding = draftBinding(fixture.view);
    const handoff = await operateEstimateChatDraft(db, identity, enabled, binding, 'editor');
    assert.ok(handoff.href?.includes(`proposal=${fixture.view.draft.id}`));
    assert.equal((await readEstimateChatDraftEditor(db, identity, enabled, binding.proposalId)).view.draft.state, 'pending');
    const refreshed = await refreshEstimateChatDraft(db, identity, enabled, binding, fixture.view.draft.proposed);
    await assert.rejects(operateEstimateChatDraft(db, identity, enabled, binding, 'confirm'), EstimateDraftConflictError);
    const nextBinding = draftBinding(refreshed.view);
    const [one, two] = await Promise.all([1, 2].map(() => operateEstimateChatDraft(db, identity, enabled, nextBinding, 'confirm')));
    assert.deepEqual(one, two); assert.ok(one.view.receipt);
    assert.equal((await db('estimates').where({ workspaceId, jobId: fixture.source.id })).length, 1);
    assert.equal((await operateEstimateChatDraft(db, identity, enabled, nextBinding, 'open')).view.draft.state, 'confirmed');
  });
  await check(mode, 'Share send/publish keep queued mail separate and replay one frozen receipt', async () => {
    for (const operation of ['send', 'publish'] as const) {
      const estimate = await draft(), turn = await conversation();
      const ticket = await proposeEstimateChatShare(db, identity, enabled, turn.id,
        { request: { operation, estimateRef: estimate.id } }, signal());
      await complete(turn);
      const binding = estimateShareChatBinding(ticket);
      const [one, two] = await Promise.all([1, 2].map(() => operateEstimateChatShare(db, identity, enabled, binding, 'confirm', false)));
      assert.deepEqual(one, two);
      assert.equal((await db('estimate_snapshots').where({ estimateId: estimate.id })).length, 1);
      const mail = await db('estimate_deliveries').where({ estimateId: estimate.id });
      assert.equal(mail.length, operation === 'send' ? 1 : 0);
      if (mail[0]) assert.equal(mail[0].status, 'queued');
      assert.equal((await readEstimateChatShare(db, identity, enabled, binding)).ticket.state, 'confirmed');
    }
  });
  await check(mode, 'Decision persists native outcome once and duplicate/revise retain draft-action receipts', async () => {
    const estimateId = await sent(), turn = await conversation();
    const ticket = await proposeEstimateChatDecision(db, identity, enabled, turn.id, { request: {
      operation: 'decision', estimateRef: estimateId, outcome: 'accepted', decisionDate: today(),
      channel: 'phone', note: null, reason: null,
    } }, signal());
    await complete(turn);
    const binding = estimateDecisionChatBinding(ticket);
    const one = await operateEstimateChatDecision(db, identity, enabled, binding, 'confirm');
    assert.equal(one.view.receipt?.status, 'accepted');
    assert.deepEqual(await operateEstimateChatDecision(db, identity, enabled, binding, 'confirm'), one);
    for (const operation of ['duplicate', 'revise'] as const) {
      const sourceId = operation === 'revise' ? await sent() : (await draft()).id;
      const nextTurn = await conversation();
      const action = await proposeEstimateChatDraftAction(db, identity, enabled, nextTurn.id,
        { request: { operation, estimateRef: sourceId } }, signal());
      await complete(nextTurn);
      const actionBinding = estimateDraftActionChatBinding(action);
      const result = await operateEstimateChatDraftAction(db, identity, enabled, actionBinding, 'confirm');
      assert.ok(result.view.receipt);
      assert.deepEqual(await operateEstimateChatDraftAction(db, identity, enabled, actionBinding, 'confirm'), result);
    }
  });
  await check(mode, 'Void and Archive/Restore preserve version checks and confirmed/open replay', async () => {
    const estimateId = await sent(), turn = await conversation();
    const ticket = await proposeEstimateChatVoid(db, identity, enabled, turn.id,
      { request: { operation: 'void', estimateRef: estimateId, reason: 'Customer requested withdrawal' } }, signal());
    await complete(turn);
    const binding = estimateVoidChatBinding(ticket);
    const result = await operateEstimateChatVoid(db, identity, enabled, binding, 'confirm');
    assert.equal(result.view.receipt?.status, 'void');
    assert.deepEqual(await operateEstimateChatVoid(db, identity, enabled, binding, 'confirm'), result);
    for (const operation of ['archive', 'restore'] as const) {
      const next = await conversation();
      const archive = await proposeEstimateChatArchive(db, identity, enabled, next.id,
        { request: { operation, estimateRef: estimateId } }, signal());
      await complete(next);
      const archived = await operateEstimateChatArchive(db, identity, enabled, estimateArchiveChatBinding(archive), 'confirm');
      assert.equal(archived.view.receipt?.archived, operation === 'archive');
      assert.ok((await operateEstimateChatArchive(db, identity, enabled, estimateArchiveChatBinding(archive), 'open')).href);
    }
  });
  await check(mode, 'Draft delete requires typed confirmation and retained lifecycle proof after native erasure', async () => {
    const estimate = await draft(), turn = await conversation();
    const ticket = await proposeEstimateChatDraftDelete(db, identity, enabled, turn.id,
      { request: { operation: 'delete-draft', estimateRef: estimate.id } }, signal());
    await complete(turn);
    const input = { workspaceId, request: estimateDraftDeleteChatBinding(ticket), decision: 'confirm', typedConfirmation: estimate.number };
    const result = await operateEstimateChatDraftDelete(db, identity, enabled, input);
    assert.equal(await db('estimates').where({ id: estimate.id }).first(), undefined);
    assert.deepEqual(await operateEstimateChatDraftDelete(db, identity, enabled, input), result);
    assert.equal((await readEstimateChatDraftDelete(db, identity, enabled, input.request)).ticket.state, 'confirmed');
    await withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
      assert.equal(await estimateDraftDeleteChatEvidenceAllowed(trx, context, turn.id), true);
    });
  });
  await check(mode, 'Conversion review stays pending, creates no Job and preserves cancelled replay', async () => {
    const estimateId = await sent('lead'), review = await readEstimateDecisionReview(db, identity, enabled, estimateId);
    await recordEstimateDecision(db, identity, enabled, {
      workspaceId, estimateId, expectedVersion: review.estimate.version, snapshotHash: review.snapshotHash,
      submissionId: randomUUID(), mode: 'record', expectedDecisionId: null,
      outcome: 'accepted', decisionDate: today(), channel: 'phone', note: '',
    });
    const turn = await conversation(), before = Number((await db('jobs').count('* AS count').first())!.count);
    const ticket = await proposeEstimateChatConversion(db, identity, enabled, turn.id,
      { request: { operation: 'convert', estimateRef: estimateId } }, signal());
    await complete(turn);
    const request = estimateConversionChatBinding(ticket);
    const statements: string[] = [], listener = (query: { sql: string }) => { statements.push(query.sql); };
    db.on('query', listener);
    try {
      assert.equal((await operateEstimateChatConversion(db, identity, enabled, { workspaceId, request, decision: 'review' })).view.ticket.state, 'pending');
    } finally { db.removeListener('query', listener); }
    if (mode === 'canonical')
      assert.equal(statements.filter(sql => /^select .*"chatProposals"/.test(sql)).length, 1, 'Review must reuse the originally locked proposal.');
    assert.equal(Number((await db('jobs').count('* AS count').first())!.count), before);
    const result = await operateEstimateChatConversion(db, identity, enabled, { workspaceId, request, decision: 'cancel' });
    assert.equal(result.view.ticket.state, 'cancelled');
    assert.deepEqual(await operateEstimateChatConversion(db, identity, enabled, { workspaceId, request, decision: 'cancel' }), result);
    await assert.rejects(operateEstimateChatConversion(db, identity, enabled, { workspaceId, request, decision: 'review' }), EstimateDraftConflictError);
  });
  await check(mode, 'forged bindings, foreign actor, missing permission and unfinished source deny native confirmation', async () => {
    const fixture = await proposedDraft(), binding = draftBinding(fixture.view);
    await assert.rejects(operateEstimateChatDraft(db, { workspaceId, userId: outsider }, enabled, binding, 'confirm'), AuthorizationAccessError);
    await assert.rejects(operateEstimateChatDraft(db, identity, enabled.filter(id => id !== 'estimates.create'), binding, 'confirm'), AuthorizationAccessError);
    await assert.rejects(operateEstimateChatDraft(db, identity, enabled, { ...binding, inputHash: 'f'.repeat(64) }, 'confirm'), EstimateDraftConflictError);
    await db('chatTurns').where({ id: fixture.turn.id }).update({ state: 'interrupted' });
    await assert.rejects(operateEstimateChatDraft(db, identity, enabled, binding, 'confirm'), EstimateDraftConflictError);
  });
  await check(mode, 'exact expiry denies confirmation/editor and cross-family replacement prunes inherited pending evidence', async () => {
    const fixture = await proposedDraft(), binding = draftBinding(fixture.view), now = Date.now;
    try {
      Date.now = () => Date.parse(fixture.view.draft.expiresAt);
      await assert.rejects(operateEstimateChatDraft(db, identity, enabled, binding, 'confirm'), EstimateDraftConflictError);
      await assert.rejects(operateEstimateChatDraft(db, identity, enabled, binding, 'editor'), EstimateDraftConflictError);
    } finally { Date.now = now; }
    const estimateId = await sent(), first = await conversation();
    const ticket = await proposeEstimateChatDecision(db, identity, enabled, first.id, { request: {
      operation: 'decision', estimateRef: estimateId, outcome: 'accepted', decisionDate: today(), channel: 'phone', note: null, reason: null,
    } }, signal());
    await complete(first);
    const next = await conversation(first.threadId);
    const unrelated = randomUUID();
    await db('chatTurns').where({ id: next.id }).update({ estimateDecisionEvidence: JSON.stringify([first.id, unrelated]) });
    const draftId = (await draft()).id;
    const action = await proposeEstimateChatDraftAction(db, identity, enabled, next.id,
      { request: { operation: 'duplicate', estimateRef: draftId } }, signal());
    await complete(next);
    assert.deepEqual((await db('chatTurns').where({ id: next.id }).first('estimateDecisionEvidence')).estimateDecisionEvidence, [unrelated]);
    await assert.rejects(operateEstimateChatDecision(db, identity, enabled, estimateDecisionChatBinding(ticket), 'confirm'), EstimateDraftConflictError);
    assert.equal((await operateEstimateChatDraftAction(db, identity, enabled, estimateDraftActionChatBinding(action), 'cancel')).view.ticket.state, 'cancelled');
  });
  await check(mode, 'replacement/confirmation race has one winner and never duplicates native business work', async () => {
    const fixture = await proposedDraft(), binding = draftBinding(fixture.view);
    const results = await Promise.allSettled([
      operateEstimateChatDraft(db, identity, enabled, binding, 'confirm'),
      refreshEstimateChatDraft(db, identity, enabled, binding, fixture.view.draft.proposed),
    ]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    for (const result of results) if (result.status === 'rejected')
      assert.ok(result.reason instanceof EstimateDraftConflictError || result.reason instanceof AuthorizationAccessError);
    assert.equal((await db('estimates').where({ workspaceId, jobId: fixture.source.id })).length,
      results[0].status === 'fulfilled' ? 1 : 0);
  });
  await check(mode, 'same-Estimate Archive evidence is pruned even for a cancelled source, without pruning unrelated history', async () => {
    const estimateId = await sent(), withdrawal = await conversation();
    const voidTicket = await proposeEstimateChatVoid(db, identity, enabled, withdrawal.id,
      { request: { operation: 'void', estimateRef: estimateId, reason: 'Customer requested withdrawal' } }, signal());
    await complete(withdrawal);
    await operateEstimateChatVoid(db, identity, enabled, estimateVoidChatBinding(voidTicket), 'confirm');
    const first = await conversation();
    const ticket = await proposeEstimateChatArchive(db, identity, enabled, first.id,
      { request: { operation: 'archive', estimateRef: estimateId } }, signal());
    await complete(first);
    await operateEstimateChatArchive(db, identity, enabled, estimateArchiveChatBinding(ticket), 'cancel');
    const next = await conversation(first.threadId), unrelated = randomUUID();
    await db('chatTurns').where({ id: next.id }).update({ estimateArchiveEvidence: JSON.stringify([first.id, unrelated]) });
    await proposeEstimateChatArchive(db, identity, enabled, next.id,
      { request: { operation: 'archive', estimateRef: estimateId } }, signal());
    const evidence = (await db('chatTurns').where({ id: next.id }).first('estimateArchiveEvidence')).estimateArchiveEvidence;
    assert.deepEqual(evidence, [unrelated, next.id]);
    await complete(next);
  });
  await check(mode, 'audit failure rolls native Estimate, receipt, proposal state and lifecycle back', async () => {
    const fixture = await proposedDraft(), binding = draftBinding(fixture.view);
    const table = auditTable('chatEstimateDraftAudit');
    await db.raw(`ALTER TABLE ?? ADD CONSTRAINT rehearsal_confirmation_failure CHECK (action <> 'confirmed') NOT VALID`, [table]);
    try {
      await assert.rejects(operateEstimateChatDraft(db, identity, enabled, binding, 'confirm'), /rehearsal_confirmation_failure/);
      assert.equal((await db('estimates').where({ workspaceId, jobId: fixture.source.id })).length, 0);
      assert.equal((await readEstimateChatDraftEditor(db, identity, enabled, binding.proposalId)).view.draft.state, 'pending');
    } finally { await db.raw('ALTER TABLE ?? DROP CONSTRAINT rehearsal_confirmation_failure', [table]); }
    assert.equal((await operateEstimateChatDraft(db, identity, enabled, binding, 'confirm')).view.draft.state, 'confirmed');
  });
  await check(mode, 'failed Share audit rolls frozen paper, queued mail and native version back', async () => {
    const estimate = await draft(), turn = await conversation();
    const ticket = await proposeEstimateChatShare(db, identity, enabled, turn.id,
      { request: { operation: 'send', estimateRef: estimate.id } }, signal());
    await complete(turn);
    const table = auditTable('chatEstimateShareAudit'), binding = estimateShareChatBinding(ticket);
    await db.raw(`ALTER TABLE ?? ADD CONSTRAINT rehearsal_share_failure CHECK (action <> 'confirmed') NOT VALID`, [table]);
    try {
      await assert.rejects(operateEstimateChatShare(db, identity, enabled, binding, 'confirm', false), /rehearsal_share_failure/);
      assert.equal((await db('estimate_snapshots').where({ estimateId: estimate.id })).length, 0);
      assert.equal((await db('estimate_deliveries').where({ estimateId: estimate.id })).length, 0);
      assert.equal((await db('estimates').where({ id: estimate.id }).first('version')).version, estimate.version);
    } finally { await db.raw('ALTER TABLE ?? DROP CONSTRAINT rehearsal_share_failure', [table]); }
    assert.equal((await operateEstimateChatShare(db, identity, enabled, binding, 'confirm', false)).view.ticket.state, 'confirmed');
  });
  if (mode === 'canonical') await check(mode, 'all eight namespaces are canonical; no legacy fallback and one supersession lookup', async () => {
    const rows = await db('chatProposals').distinct('family');
    assert.deepEqual(rows.map(row => row.family).sort(), [...estimateProposalFamilies].sort());
    const fixture = await proposedDraft(), key = draftBinding(fixture.view);
    await assert.rejects(operateEstimateChatDraft(db, identity, enabled, { ...key, proposalId: randomUUID() }, 'confirm'), AuthorizationAccessError);
    await withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
      const sql: string[] = [], listener = (query: { sql: string }) => { sql.push(query.sql); };
      trx.on('query', listener);
      try { await supersedeEstimateProposals(trx, context, fixture.turn); }
      finally { trx.removeListener('query', listener); }
      assert.equal(sql.filter(query => /select .*"chatProposals".*for update/.test(query)).length, 1);
      assert.equal(sql.some(query => /chatEstimate/.test(query)), false);
      assert.equal((await readProposalHistory(trx, context, [fixture.turn.id]))[0].state, 'superseded');
    });
  });
  if (mode === 'canonical') await check(mode, 'resolution adapter rejects unlocked or foreign-transaction proposal handles', async () => {
    const fixture = await proposedDraft();
    await withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
      const unlocked = await estimateProposalStorage.estimateDraft.read(trx, context, { id: fixture.view.draft.id });
      assert.ok(unlocked);
      await assert.rejects(estimateProposalStorage.estimateDraft.save(trx, context, unlocked, unlocked.payload, 'cancelled'), /proposal lock/);
      const locked = await estimateProposalStorage.estimateDraft.read(trx, context, { id: fixture.view.draft.id }, true);
      assert.ok(locked);
      await trx.transaction(async other => {
        await assert.rejects(estimateProposalStorage.estimateDraft.save(other, context, locked, locked.payload, 'cancelled'), /proposal lock/);
      });
    });
  });
}

try {
  await admin.raw('CREATE DATABASE ??', [database]); created = true;
  await migrateFreshBaseline(db);
  const now = new Date();
  await db('users').insert([userId, outsider].map(id => ({
    id, name: 'Fictional Owner', email: `${id}@example.test`, createdAt: now, updatedAt: now, termsVersion: 'test', termsAcceptedAt: now,
  })));
  await db.transaction(async trx => {
    await trx('workspaces').insert({ id: workspaceId, ownerId: userId, businessName: 'Fictional Proposal Business',
      businessType: 'test', postalCode: '', serviceRange: '' });
    await trx('workspaceMemberships').insert({ workspaceId, userId, role: 'owner' });
    await initializeWorkspacePolicy(trx, identity);
  });
  await db('customers').insert({ id: customerId, workspaceId, name: 'Fictional Customer', type: 'person',
    companyName: '', email: '', phone: '', location: '', internalNotes: '' });
  const business = await readEstimateBusinessProfile(db, identity, enabled);
  await saveEstimateBusinessProfile(db, identity, enabled, {
    workspaceId, expectedVersion: business.record.version,
    profile: { ...business.record.profile, name: 'Fictional Proposal Business', address: '1 Fixture Avenue',
      phone: '555-0100', email: 'estimates@example.test' },
  });
  const canonicalSql: string[] = [], listener = (query: { sql: string }) => { canonicalSql.push(query.sql); };
  db.on('query', listener);
  try { await withCanonicalProposalStorage(() => run('canonical')); }
  finally { db.removeListener('query', listener); }
  assert.equal(canonicalSql.some(sql => /chatEstimate/.test(sql)), false, 'Canonical mode must not touch legacy tables.');
  console.log(`Estimate proposal adapter rehearsal: ${checks} groups passed; shared databases untouched.`);
} finally {
  await db.destroy();
  try { if (created) await admin.raw('DROP DATABASE ??', [database]); } finally { await admin.destroy(); }
}
