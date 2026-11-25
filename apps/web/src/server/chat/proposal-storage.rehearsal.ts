import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  createDatabase, initializeWorkspacePolicy, loadWorkspaceAuthorization, withWorkspaceAuthorization,
  withCanonicalProposalStorage, leadProposalStorage, leadChatTurnEvidenceAllowed, deleteLead,
  AuthorizationAccessError, LeadDeleteConfirmationError, createJob,
  customerProposalStorage, workOrderProposalStorage, CustomerConflictError, CustomerValidationError, WorkOrderConflictError,
} from '@salesmora/data';
import { migrateFreshBaseline } from '@salesmora/data/baseline-runner';
import {
  leadSchema, chatActionReviewSchema, leadDraftReviewSchema, workOrdersProposeSchema, materialsProposeSchema,
  customerDraftSchema, workOrderChatDraftSchema,
  type ChatActionReview, type CustomerChatDraft, type WorkOrderChatDraft, type WorkOrdersPropose, type MaterialsPropose,
} from '@salesmora/contracts';

const env = fileURLToPath(new URL('../../../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname))
  throw new Error('A separate local test connection is required.');
const name = `lead_proposals_${randomUUID().replaceAll('-', '')}_test`, url = new URL(connection); url.pathname = `/${name}`;
const owner = createDatabase(connection), db = createDatabase(url.toString());
const runtimeURL = new URL(url); runtimeURL.searchParams.set('options', '-c role=salesmora_web');
const previousURL = process.env.DATABASE_URL;
const identity = { workspaceId: randomUUID(), userId: randomUUID() }, stranger = { ...identity, userId: randomUUID() }, teammate = randomUUID();
let canonical = true, created = false, checks = 0;
const reviewedOnly = process.argv.includes('--reviewed-only');
const historyOnly = process.argv.includes('--history-only');
const supportedOptions = new Set(['--reviewed-only', '--history-only']);
for (const option of process.argv.slice(2)) {
  if (!supportedOptions.has(option)) throw new Error(`Unknown proposal storage rehearsal option: ${option}`);
}
const canonicalSQL: string[] = [];
const input = leadSchema.parse({ name: 'Fictional private Lead', email: 'fixture@example.test', phone: '', service: 'Repair', address: '', details: 'Private fixture detail', notes: '', source: 'other', stage: 'new', ownerId: '' });
const signal = () => new AbortController().signal;
const proposalTable = () => canonical ? 'chatProposals' : 'chatActionDrafts';
const auditTable = () => canonical ? 'chatProposalAudit' : 'chatActionAudit';
const auditWhere = (id: string, action: string) => canonical
  ? { family: 'action', proposalId: id, action: `draft.${action}` }
  : { draftId: id, action: `draft.${action}` };
async function check(label: string, run: () => Promise<void>) { await run(); checks++; console.log(`PASS ${canonical ? 'canonical' : 'legacy'}: ${label}`); }

try {
  await owner.raw('CREATE DATABASE ??', [name]); created = true;
  await migrateFreshBaseline(db);
  process.env.DATABASE_URL = runtimeURL.toString();
  const { database } = await import('../workspaces/store');
  const runtime = database();
  runtime.on('query', ({ sql }: { sql: string }) => { if (canonical) canonicalSQL.push(sql); });
  const { enabledPermissions } = await import('../authorization/permissions');
  const { createLead } = await import('../leads/store');
  const { chatAccessHash } = await import('./access-hash');
  const { proposeLeadDraft, resolveLeadDraft, visibleTurnDraft } = await import('./actions');
  const { proposeStageDraft } = await import('./stage-actions');
  const { proposeUpdateDraft } = await import('./update-actions');
  const { proposeAssignmentDraft } = await import('./assignment-actions');
  const { proposeNoteDraft } = await import('./note-actions');
  const { proposeArchiveDraft } = await import('./archive-actions');
  const { proposeDeleteDraft, resolveDeleteDraft, visibleDeletionReceipt } = await import('./delete-actions');
  const { proposeExportDraft, downloadExportDraft } = await import('./export-actions');
  const { ChatActionConflict } = await import('./action-errors');
  const { validateTurnEvidenceInTransaction, readThreads, deleteThread } = await import('./store');
  const { readHistoryProposalPresence } = await import('./history-proposals');
  const { historicalEvidenceAllowed } = await import('./historical-evidence');
  const { customersPropose, resolveCustomerDraft, visibleCustomerResult } = await import('./customers');
  const { workOrdersPropose, resolveWorkOrderDraft, visibleWorkOrderResult } = await import('./work-orders-actions');
  const { materialsPropose } = await import('./materials-actions');
  const now = new Date();
  for (const id of [identity.userId, stranger.userId, teammate])
    await db('users').insert({ id, name: id === teammate ? 'Fixture teammate' : 'Fixture owner', email: `${id}@example.test`, createdAt: now, updatedAt: now, termsVersion: 'test', termsAcceptedAt: now });
  await db.transaction(async trx => {
    await trx('workspaces').insert({ id: identity.workspaceId, ownerId: identity.userId, businessName: 'Fictional Lead proposals', businessType: 'plumbing', postalCode: '', serviceRange: '', planOverride: 'standard', planOverrideId: randomUUID(), planOverrideEndsAt: new Date(Date.now() + 86400000), planOverrideReason: 'Disposable proposal fixture' });
    for (const person of [identity, stranger]) await trx('workspaceMemberships').insert({ ...person, role: person === identity ? 'owner' : 'admin' });
    await trx('workspaceMemberships').insert({ workspaceId: identity.workspaceId, userId: teammate, role: 'field' });
    await initializeWorkspacePolicy(trx, identity);
  });
  async function turn(threadId = randomUUID(), who = identity) {
    await db('chatThreads').insert({ ...who, id: threadId }).onConflict('id').ignore();
    const context = await loadWorkspaceAuthorization(runtime, who, enabledPermissions), id = randomUUID();
    await db('chatTurns').insert({
      ...who, id, threadId, clientTurnId: randomUUID(), requestHash: 'fictional', surfaceKey: 'home',
      state: 'running', leaseUntil: new Date(Date.now() + 900000), accessHash: chatAccessHash(context),
      proposalFamilies: JSON.stringify([]),
    });
    return { id, threadId };
  }
  async function complete(source: { id: string }) { await db('chatTurns').where({ id: source.id }).update({ state: 'completed', finishedAt: new Date() }); }
  async function lead() { return createLead(identity.userId, identity.workspaceId, randomUUID(), input); }
  const resolve = (view: ChatActionReview, decision: 'confirm' | 'cancel' = 'confirm') =>
    resolveLeadDraft(identity, view.id, view.inputHash, decision);
  async function visible(turnId: string) {
    return withWorkspaceAuthorization(runtime, identity, enabledPermissions, false, (trx, context) => visibleTurnDraft(trx, context, turnId));
  }
  type Operation = 'stage' | 'update' | 'compound' | 'assign' | 'note' | 'archive' | 'restore' | 'delete';
  async function prepare(operation: Operation, leadId: string, source = turn()) {
    const origin = await source;
    const result = await (operation === 'stage' ? proposeStageDraft(identity, origin.id, { leadRef: leadId, to: 'contacted', reason: '' }, signal())
      : operation === 'update' ? proposeUpdateDraft(identity, origin.id, { leadRef: leadId, changes: [{ field: 'service', value: 'Reviewed repair' }] }, signal())
      : operation === 'compound' ? proposeUpdateDraft(identity, origin.id, { leadRef: leadId, changes: [{ field: 'service', value: 'Reviewed repair' }], stage: { to: 'contacted', reason: '' } }, signal())
      : operation === 'assign' ? proposeAssignmentDraft(identity, origin.id, { leadRef: leadId, assignment: { kind: 'teammate', teammateRef: teammate } }, signal())
      : operation === 'note' ? proposeNoteDraft(identity, origin.id, { leadRef: leadId, body: 'Reviewed private team note' }, signal())
      : operation === 'delete' ? proposeDeleteDraft(identity, origin.id, { leadRef: leadId }, signal())
      : proposeArchiveDraft(identity, origin.id, { leadRef: leadId, archived: operation === 'archive' }, signal()));
    if (!('action' in result)) throw new Error(`Expected ${operation} proposal, got ${JSON.stringify(result)}`);
    await complete(origin);
    return { view: chatActionReviewSchema.parse(result.action), turn: origin };
  }
  async function failAudit(work: () => Promise<unknown>, unchanged: () => Promise<void>, action: 'draft.confirmed' | 'confirmed' | 'proposed' = 'draft.confirmed', mustReject = true) {
    await db.raw(`CREATE FUNCTION rehearsal_fail_lead_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'rehearsal audit failure'; END $$`);
    const condition = action === 'confirmed' ? "NEW.action = 'confirmed'" : action === 'proposed' ? "NEW.action = 'proposed'" : "NEW.action = 'draft.confirmed'";
    await db.raw(`CREATE TRIGGER rehearsal_fail_lead_audit BEFORE INSERT ON ?? FOR EACH ROW WHEN (${condition}) EXECUTE FUNCTION rehearsal_fail_lead_audit()`, [auditTable()]);
    try { if (mustReject) await assert.rejects(work(), /rehearsal audit failure/); else await work(); }
    finally { await db.raw('DROP TRIGGER rehearsal_fail_lead_audit ON ??', [auditTable()]); await db.raw('DROP FUNCTION rehearsal_fail_lead_audit()'); }
    await unchanged();
  }
  const filters = { query: '', stages: [], sources: [], ownerIds: [], created: 'any' as const, from: '', to: '', attention: false, archived: false };
  async function exportProposal() {
    const source = await turn(), result = await proposeExportDraft(identity, source.id, { mode: 'filters', filters }, signal());
    if (!('action' in result)) throw new Error('Expected export proposal.');
    await complete(source);
    return { view: chatActionReviewSchema.parse(result.action), turn: source };
  }
  async function download(view: ChatActionReview) {
    const result = await downloadExportDraft(identity, view.id, view.inputHash, signal());
    return new Response(result.stream).text();
  }
  async function run() {
    await check('create preparation/replay is private, unfinished confirmation denied, concurrent confirmation creates once', async () => {
      const source = await turn(), count = (await db('leads').where({ workspaceId: identity.workspaceId })).length;
      const view = await proposeLeadDraft(identity, source.id, input, signal());
      assert.deepEqual(await proposeLeadDraft(identity, source.id, input, signal()), view);
      await assert.rejects(proposeLeadDraft(identity, source.id, { ...input, service: 'Changed' }, signal()), ChatActionConflict);
      await assert.rejects(resolve(view), ChatActionConflict);
      assert.equal((await db('leads').where({ workspaceId: identity.workspaceId })).length, count);
      await complete(source);
      await assert.rejects(resolveLeadDraft(stranger, view.id, view.inputHash, 'confirm'), AuthorizationAccessError);
      await assert.rejects(resolveLeadDraft(identity, view.id, 'b'.repeat(64), 'confirm'), ChatActionConflict);
      const before = canonicalSQL.length;
      const [one, two] = await Promise.all([resolve(view), resolve(view)]);
      if (canonical) assert.equal(canonicalSQL.slice(before).filter(sql => /^select.*"chatProposals"/i.test(sql)).length, 2, 'One proposal read per decision; saving must reuse the held lock.');
      assert.deepEqual(one, two);
      const confirmed = leadDraftReviewSchema.parse(one);
      assert.ok(confirmed.leadId); assert.equal(confirmed.state, 'confirmed');
      assert.equal((await db('leadActivity').where({ leadId: confirmed.leadId, type: 'created' })).length, 1);
      assert.equal((await db(auditTable()).where(auditWhere(view.id, 'confirmed'))).length, 1);
      assert.deepEqual(await visible(source.id), one);
    });
    for (const operation of ['stage', 'update', 'compound', 'assign', 'note', 'archive'] as const) {
      await check(`${operation} confirms once, preserves native evidence and visible review`, async () => {
        const record = await lead(), prepared = await prepare(operation, record.id);
        const before = await db('leads').where({ id: record.id }).first();
        assert.deepEqual(await visible(prepared.turn.id), prepared.view);
        const [one, two] = await Promise.all([resolve(prepared.view), resolve(prepared.view)]);
        assert.deepEqual(one, two); assert.equal(one.state, 'confirmed');
        const after = await db('leads').where({ id: record.id }).first();
        assert.equal(after.version, before.version + (operation === 'compound' ? 2 : 1));
        if (operation === 'stage' || operation === 'compound') assert.equal(after.stage, 'contacted');
        if (operation === 'update' || operation === 'compound') assert.equal(after.service, 'Reviewed repair');
        if (operation === 'assign') assert.equal(after.ownerId, teammate);
        if (operation === 'archive') assert.ok(after.archivedAt);
        const evidence = (await db('chatTurns').where({ id: prepared.turn.id }).first()).leadEvidence;
        assert.equal(evidence.find((item: { id: string }) => item.id === record.id).version, after.version);
        assert.deepEqual(await visible(prepared.turn.id), one);
        assert.equal((await db(auditTable()).where(auditWhere(prepared.view.id, 'confirmed'))).length, 1);
        if (canonical) assert.equal((await db(auditTable()).where(auditWhere(prepared.view.id, 'confirmed')).first()).details.leadId, record.id);
        if (operation === 'archive') {
          const restored = await prepare('restore', record.id); assert.equal((await resolve(restored.view)).state, 'confirmed');
          assert.equal((await db('leads').where({ id: record.id }).first()).archivedAt, null);
        }
      });
    }
    await check('cancel replay, exact expiry and active-thread gates preserve native outcomes', async () => {
      const record = await lead(), prepared = await prepare('note', record.id);
      const cancelled = await resolve(prepared.view, 'cancel');
      assert.deepEqual(await resolve(prepared.view, 'cancel'), cancelled);
      await assert.rejects(resolve(prepared.view), ChatActionConflict);
      const expired = await prepare('stage', record.id);
      await db(proposalTable()).where({ id: expired.view.id }).update({ expiresAt: new Date() });
      assert.equal((await visible(expired.turn.id))?.state, 'expired');
      await assert.rejects(resolve(expired.view), ChatActionConflict);
      const pending = await prepare('note', record.id), active = await turn(pending.turn.threadId);
      await assert.rejects(resolve(pending.view), ChatActionConflict); await complete(active);
      assert.equal((await resolve(pending.view)).state, 'confirmed');
    });
    await check('cross-action replacement keeps unrelated threads/actors and uses one canonical pending lookup', async () => {
      const record = await lead(), first = await prepare('note', record.id), unrelated = await prepare('stage', record.id);
      const other = await turn(randomUUID(), stranger);
      await proposeLeadDraft(stranger, other.id, input, signal()); await complete(other);
      const before = canonicalSQL.length, next = await prepare('stage', record.id, turn(first.turn.threadId));
      assert.equal((await db(proposalTable()).where({ id: first.view.id }).first()).state, 'superseded');
      assert.equal((await db(proposalTable()).where({ id: unrelated.view.id }).first()).state, 'pending');
      if (canonical) assert.equal(canonicalSQL.slice(before).filter(sql => /select.*"chatProposals".*for update/i.test(sql)).length, 1);
      await assert.rejects(resolve(first.view), ChatActionConflict);
      assert.equal((await resolve(next.view, 'cancel')).state, 'cancelled');
    });
    await check('permission changes, source versions and teammate snapshots reject stale confirmations', async () => {
      const record = await lead(), stage = await prepare('stage', record.id);
      await db('workspaceRolePolicies').where({ workspaceId: identity.workspaceId, role: 'owner', permission: 'leads.stage.update' }).delete();
      await assert.rejects(resolve(stage.view), AuthorizationAccessError);
      await db('workspaceRolePolicies').insert({ workspaceId: identity.workspaceId, role: 'owner', permission: 'leads.stage.update', scope: 'workspace' });
      const stale = await prepare('note', record.id);
      await db('leads').where({ id: record.id }).increment('version', 1);
      await assert.rejects(resolve(stale.view), ChatActionConflict);
      const assigned = await prepare('assign', record.id);
      await db('users').where({ id: teammate }).update({ name: 'Renamed fixture teammate' });
      await assert.rejects(resolve(assigned.view), ChatActionConflict);
      await db('users').where({ id: teammate }).update({ name: 'Fixture teammate' });
    });
    await check('Customer and Work Order writers replace Lead intent, but a new Lead does not replace them', async () => {
      for (const kind of ['customer', 'workOrder'] as const) {
        const record = await lead(), pending = await prepare('note', record.id), source = await turn(pending.turn.threadId);
        let args: unknown;
        if (kind === 'customer') args = { request: { operation: 'create', input: { allowDuplicate: true, values: {
          name: 'Fictional Customer proposal', type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '', ownerId: '',
        } } } };
        else {
          const customerId = randomUUID();
          await db('customers').insert({ id: customerId, workspaceId: identity.workspaceId, name: 'Fixture customer', type: 'person', companyName: '', email: '', phone: '', location: '', internalNotes: '' });
          const job = await createJob(runtime, identity, enabledPermissions, {postalCode:'10001', workspaceId: identity.workspaceId, customerId, submissionId: randomUUID(), title: 'Fixture Work Order parent', primaryOwnerId: identity.userId });
          const row = await db('jobs').where({ id: job.jobId }).first();
          args = { ...Object.fromEntries(Object.keys(workOrdersProposeSchema.shape).map(key => [key, null])), operation: 'create', jobNumber: `J-${String(row.jobNumber).padStart(4, '0')}`, title: 'Fictional Work Order proposal' };
        }
        await withWorkspaceAuthorization(runtime, identity, enabledPermissions, true, async (trx, authority) => {
          const original = await validateTurnEvidenceInTransaction(trx, authority, source.id);
          const tool = kind === 'customer' ? customersPropose : workOrdersPropose;
          await tool({ identity, surface: 'home', turnId: source.id, pageContext: {}, signal: signal(), db: trx, authority, turn: original, enabledPermissions }, args);
        });
        await complete(source);
        const otherTable = canonical ? 'chatProposals' : kind === 'customer' ? 'chatCustomerDrafts' : 'chatWorkOrderDrafts';
        const createdProposal = await db(otherTable).where({ turnId: source.id }).first(); assert.ok(createdProposal);
        assert.equal((await db(proposalTable()).where({ id: pending.view.id }).first()).state, 'superseded');
        const newSource = await turn(source.threadId); await proposeLeadDraft(identity, newSource.id, input, signal()); await complete(newSource);
        assert.equal((await db(otherTable).where({ id: createdProposal.id }).first()).state, 'pending');
      }
    });
    await check('audit failure rolls native create and compound edits/evidence back', async () => {
      const source = await turn(), view = await proposeLeadDraft(identity, source.id, input, signal()); await complete(source);
      const count = (await db('leads').where({ workspaceId: identity.workspaceId })).length;
      await failAudit(() => resolve(view), async () => {
        assert.equal((await db('leads').where({ workspaceId: identity.workspaceId })).length, count);
        assert.equal((await db(proposalTable()).where({ id: view.id }).first()).state, 'pending');
      });
      assert.equal((await resolve(view)).state, 'confirmed');
      const record = await lead(), prepared = await prepare('compound', record.id);
      const before = await db('leads').where({ id: record.id }).first(), turnBefore = await db('chatTurns').where({ id: prepared.turn.id }).first();
      await failAudit(() => resolve(prepared.view), async () => {
        assert.deepEqual(await db('leads').where({ id: record.id }).first(), before);
        assert.deepEqual((await db('chatTurns').where({ id: prepared.turn.id }).first()).leadEvidence, turnBefore.leadEvidence);
      });
      assert.equal((await resolve(prepared.view)).state, 'confirmed');
    });
    await check('confirm/cancel race has one terminal winner and replacement race never duplicates commands', async () => {
      const record = await lead(), prepared = await prepare('note', record.id);
      const raced = await Promise.allSettled([resolve(prepared.view), resolve(prepared.view, 'cancel')]);
      assert.equal(raced.filter(item => item.status === 'fulfilled').length, 1);
      const rejected = raced.find(item => item.status === 'rejected');
      assert.ok(rejected?.status === 'rejected' && rejected.reason instanceof ChatActionConflict);
      const next = await prepare('note', record.id), source = await turn(next.turn.threadId);
      // Replacement generation is itself active, so old intent cannot confirm while it runs.
      const outcomes = await Promise.allSettled([resolve(next.view), proposeStageDraft(identity, source.id, { leadRef: record.id, to: 'contacted', reason: '' }, signal())]);
      await complete(source);
      assert.equal(outcomes[0].status, 'rejected'); assert.equal(outcomes[1].status, 'fulfilled');
      assert.equal((await db(proposalTable()).where({ id: next.view.id }).first()).state, 'superseded');
    });
    await check('typed deletion erases all Lead copies, retains minimal original-hash receipt and proves replay after erasure', async () => {
      const creationTurn = await turn(), creation = await proposeLeadDraft(identity, creationTurn.id, input, signal()); await complete(creationTurn);
      const saved = leadDraftReviewSchema.parse(await resolve(creation)); assert.ok(saved.leadId);
      const note = await prepare('note', saved.leadId), prepared = await prepare('delete', saved.leadId);
      const otherTurn = await turn(randomUUID(), stranger); await db('chatTurns').where({ id: otherTurn.id }).update({ leadEvidence: JSON.stringify([{ id: saved.leadId, version: 1 }]) }); await complete(otherTurn);
      const other = await withWorkspaceAuthorization(runtime, stranger, enabledPermissions, true, (trx, context) =>
        leadProposalStorage.insert(trx, context, { id: randomUUID(), turnId: otherTurn.id, threadId: otherTurn.threadId, actionType: 'lead.create', capability: 'leads.create', lead: input, inputHash: 'c'.repeat(64), accessHash: chatAccessHash(context), leadId: saved.leadId, expiresAt: new Date(Date.now() + 900000) }));
      if (!('actionType' in prepared.view) || prepared.view.actionType !== 'lead.delete') throw new Error('Expected delete review.');
      const typed = prepared.view.lead.number;
      const remove = () => resolveDeleteDraft(identity, prepared.view.id, prepared.view.inputHash, 'confirm', typed);
      await assert.rejects(resolveDeleteDraft(identity, prepared.view.id, prepared.view.inputHash, 'confirm', 'wrong'), LeadDeleteConfirmationError);
      await failAudit(remove, async () => {
        assert.ok(await db('leads').where({ id: saved.leadId }).first());
        for (const id of [creation.id, note.view.id, prepared.view.id, other.id]) assert.ok(await db(proposalTable()).where({ id }).first());
        assert.equal((await db('leadDeletionAudit').where({ id: prepared.view.id })).length, 0);
      });
      const [one, two] = await Promise.all([remove(), remove()]); assert.deepEqual(one, two);
      assert.equal((await db('leads').where({ id: saved.leadId })).length, 0);
      for (const id of [creation.id, note.view.id, other.id]) assert.equal((await db(proposalTable()).where({ id })).length, 0);
      const receipt = await db(proposalTable()).where({ id: prepared.view.id }).first();
      assert.equal(receipt.inputHash, prepared.view.inputHash);
      const body = canonical ? receipt.payload : receipt;
      assert.deepEqual(Object.keys(body.deletePayload.lead).sort(), ['id', 'number']);
      assert.equal(body.deletePayload.kind, 'receipt'); assert.deepEqual(body.lead, {});
      assert.equal(JSON.stringify(body).includes(input.email), false); assert.equal(JSON.stringify(body).includes(input.name), false);
      assert.equal((await db(auditTable()).where(auditWhere(prepared.view.id, 'confirmed'))).length, 1);
      await withWorkspaceAuthorization(runtime, identity, enabledPermissions, false, async (trx, context) => {
        assert.deepEqual(await visibleDeletionReceipt(trx, context, prepared.turn.id), one);
        assert.equal(await leadChatTurnEvidenceAllowed(trx, context, await trx('chatTurns').where({ id: prepared.turn.id }).first()), false);
      });
    });
    await check('manual native deletion uses selected storage and removes copied proposals too', async () => {
      const record = await lead(), prepared = await prepare('note', record.id);
      const stored = await db('leads').where({ id: record.id }).first();
      await deleteLead(runtime, identity, enabledPermissions, { workspaceId: identity.workspaceId, leadId: record.id, submissionId: randomUUID(), expectedVersion: stored.version, typedConfirmation: `LD-${String(stored.leadNumber).padStart(4, '0')}` });
      assert.equal((await db(proposalTable()).where({ id: prepared.view.id })).length, 0);
    });
    await check('export stays dedicated-download-only, streams CSV and preserves native confirmed redownload/cancel rules', async () => {
      await lead();
      const prepared = await exportProposal();
      await assert.rejects(resolve(prepared.view), ChatActionConflict);
      const csv = await download(prepared.view); assert.ok(csv.includes('Lead ID')); assert.ok(csv.includes(input.email));
      assert.equal((await db(proposalTable()).where({ id: prepared.view.id }).first()).state, 'confirmed');
      assert.equal(await download(prepared.view), csv);
      assert.equal((await db(auditTable()).where(auditWhere(prepared.view.id, 'confirmed'))).length, 1);
      await assert.rejects(resolve(prepared.view, 'cancel'), ChatActionConflict);
      const cancelled = await exportProposal(); await resolve(cancelled.view, 'cancel');
      await assert.rejects(download(cancelled.view), ChatActionConflict);
    });
    await check('export audit failure rolls proposal confirmation back; changed preview cannot stream', async () => {
      const prepared = await exportProposal();
      await failAudit(() => download(prepared.view), async () => {
        assert.equal((await db(proposalTable()).where({ id: prepared.view.id }).first()).state, 'pending');
        assert.equal((await db(auditTable()).where(auditWhere(prepared.view.id, 'confirmed'))).length, 0);
      });
      assert.ok((await download(prepared.view)).includes('Lead ID'));
      const changed = await exportProposal(); await lead();
      await assert.rejects(download(changed.view), ChatActionConflict);
      assert.equal((await db(proposalTable()).where({ id: changed.view.id }).first()).state, 'pending');
    });
    if (canonical) await check('lock handles reject unlocked/different-transaction use and deletion restoration requires native proof', async () => {
      const record = await lead(), prepared = await prepare('delete', record.id);
      let held: Awaited<ReturnType<typeof leadProposalStorage.read>>;
      await withWorkspaceAuthorization(runtime, identity, enabledPermissions, true, async (trx, context) => {
        const unlocked = await leadProposalStorage.read(trx, context, { id: prepared.view.id }); assert.ok(unlocked);
        await assert.rejects(leadProposalStorage.save(trx, context, unlocked, 'cancelled'), /proposal lock/);
        const row = await leadProposalStorage.read(trx, context, { id: prepared.view.id }, true); assert.ok(row);
        if (row.actionType !== 'lead.delete') throw new Error('Expected deletion.');
        held = row;
        const payload = row.deletePayload;
        await assert.rejects(leadProposalStorage.restoreDeletionReceipt(trx, context, row, { kind: 'receipt', lead: { id: payload.lead.id, number: payload.lead.number }, expectedVersion: payload.expectedVersion }));
      });
      await withWorkspaceAuthorization(runtime, identity, enabledPermissions, true, async (trx, context) => {
        assert.ok(held); await assert.rejects(leadProposalStorage.save(trx, context, held, 'cancelled'), /proposal lock/);
      });
    });
  }
  const customerValues = { name: 'Fictional Customer', type: 'person', companyName: '', email: 'customer@example.test', phone: '', location: '', internalNotes: 'Private fixture', ownerId: '' };
  const customerFilters = { q: '', relationship: 'all', owner: 'all', type: 'all', sort: 'name', archived: false };
  const reviewedTable = (family: 'customer' | 'workOrder' | 'material') => canonical ? 'chatProposals' : family === 'customer' ? 'chatCustomerDrafts' : 'chatWorkOrderDrafts';
  async function toolProposal(kind: 'customer' | 'workOrder' | 'material', args: unknown, source = turn(), who = identity) {
    const origin = await source;
    const output = await withWorkspaceAuthorization(runtime, who, enabledPermissions, true, async (trx, authority) => {
      const original = await validateTurnEvidenceInTransaction(trx, authority, origin.id);
      return (kind === 'customer' ? customersPropose : kind === 'workOrder' ? workOrdersPropose : materialsPropose)(
        { identity: who, surface: 'home', turnId: origin.id, pageContext: {}, signal: signal(), db: trx, authority, turn: original, enabledPermissions }, args);
    });
    const draft = kind === 'customer' ? output.customerResult?.draft : output.workOrderResult?.draft;
    if (!draft) throw new Error(`Expected ${kind} proposal: ${JSON.stringify(output)}`);
    await complete(origin);
    return { draft, turn: origin };
  }
  async function customerProposal(operation: string, body: unknown, source = turn(), who = identity) {
    const output = await toolProposal('customer', { request: { operation, input: body } }, source, who);
    return { ...output, draft: customerDraftSchema.parse(output.draft) };
  }
  const customerDecision = (draft: CustomerChatDraft, decision: 'confirm' | 'cancel' = 'confirm',
    extra: { typedConfirmation?: string; unlinkOpenLeads?: boolean } = {}) =>
    resolveCustomerDraft(identity, { draftId: draft.id, inputHash: draft.inputHash, decision, ...extra });
  async function savedCustomer() {
    const prepared = await customerProposal('create', { values: { ...customerValues, name: `${customerValues.name} ${randomUUID()}` }, allowDuplicate: true });
    const saved = await customerDecision(prepared.draft); assert.ok(saved.draft.customer.id);
    const row = await db('customers').where({ id: saved.draft.customer.id }).first();
    return { ...saved.draft.customer, id: saved.draft.customer.id, number: `CU-${String(row.customerNumber).padStart(4, '0')}` };
  }
  async function workOrderProposal(request: Partial<WorkOrdersPropose>, source = turn()) {
    const output = await toolProposal('workOrder', { ...Object.fromEntries(Object.keys(workOrdersProposeSchema.shape).map(key => [key, null])), ...request }, source);
    return { ...output, draft: workOrderChatDraftSchema.parse(output.draft) };
  }
  async function materialProposal(request: Partial<MaterialsPropose>, source = turn(), who = identity) {
    const output = await toolProposal('material', { ...Object.fromEntries(Object.keys(materialsProposeSchema.shape).map(key => [key, null])), ...request }, source, who);
    return { ...output, draft: workOrderChatDraftSchema.parse(output.draft) };
  }
  const workOrderDecision = (draft: WorkOrderChatDraft, decision: 'confirm' | 'cancel' = 'confirm', who = identity) =>
    resolveWorkOrderDraft(who, { draftId: draft.id, inputHash: draft.inputHash, decision });
  async function savedWorkOrder() {
    const customer = await savedCustomer(), job = await createJob(runtime, identity, enabledPermissions, {postalCode:'10001',
      workspaceId: identity.workspaceId, customerId: customer.id, submissionId: randomUUID(), title: 'Fictional Job', primaryOwnerId: identity.userId,
    });
    const row = await db('jobs').where({ id: job.jobId }).first();
    const prepared = await workOrderProposal({ operation: 'create', jobNumber: `J-${String(row.jobNumber).padStart(4, '0')}`, title: 'Fictional Work Order' });
    const saved = await workOrderDecision(prepared.draft); assert.ok(saved.draft.workOrder.id);
    return saved.draft.workOrder;
  }
  async function visibleReviewed(kind: 'customer' | 'workOrder', id: string, who = identity) {
    return withWorkspaceAuthorization(runtime, who, enabledPermissions, false, async (trx, context) => {
      const source = await trx('chatTurns').where({ id }).first();
      return kind === 'customer' ? visibleCustomerResult(trx, context, source) : visibleWorkOrderResult(trx, context, source);
    });
  }
  async function reviewedAuditFailure(work: () => Promise<unknown>, unchanged: () => Promise<void>) {
    assert.ok(canonical);
    await failAudit(work, unchanged, 'confirmed');
  }
  async function runReviewed() {
    await check('Customer create confirms once, source completion/ownership/hash gates and durable visibility', async () => {
      const prepared = await customerProposal('create', { values: customerValues, allowDuplicate: true });
      await db('chatTurns').where({ id: prepared.turn.id }).update({ state: 'running' });
      await assert.rejects(customerDecision(prepared.draft), CustomerConflictError); await complete(prepared.turn);
      await assert.rejects(resolveCustomerDraft(stranger, { draftId: prepared.draft.id, inputHash: prepared.draft.inputHash, decision: 'confirm' }), AuthorizationAccessError);
      assert.equal(await visibleReviewed('customer', prepared.turn.id, stranger), undefined);
      await assert.rejects(resolveCustomerDraft(identity, { draftId: prepared.draft.id, inputHash: 'b'.repeat(64), decision: 'confirm' }), CustomerConflictError);
      const before = canonicalSQL.length, [one, two] = await Promise.all([customerDecision(prepared.draft), customerDecision(prepared.draft)]);
      assert.deepEqual(one.draft, two.draft); assert.ok(one.draft.customer.id);
      if (canonical) assert.equal(canonicalSQL.slice(before).filter(sql => /^select.*"chatProposals"/i.test(sql)).length, 2);
      assert.deepEqual((await visibleReviewed('customer', prepared.turn.id))?.draft, one.draft);
    });
    for (const operation of ['update', 'assign', 'add_note', 'link_lead', 'unlink_lead', 'set_archived', 'restore'] as const) {
      await check(`Customer ${operation} retains native mutation and replay`, async () => {
        const customer = await savedCustomer(), record = await lead();
        if (operation === 'unlink_lead') await db('leads').where({ id: record.id }).update({ customerId: customer.id });
        if (operation === 'restore') await db('customers').where({ id: customer.id }).update({ archivedAt: new Date() });
        const extra = operation === 'update' ? { changes: [{ field: 'location', value: 'Reviewed fixture address' }] }
          : operation === 'assign' ? { teammateRef: teammate }
          : operation === 'add_note' ? { body: 'Reviewed private Customer note' }
          : operation === 'link_lead' ? { leadRef: record.id, replace: false }
          : operation === 'unlink_lead' ? { leadRef: record.id } : { archived: operation === 'set_archived' };
        const prepared = await customerProposal(operation === 'restore' ? 'set_archived' : operation, { customerRef: customer.id, ...extra });
        const version = (await db('customers').where({ id: customer.id }).first()).version;
        const one = await customerDecision(prepared.draft); assert.deepEqual((await customerDecision(prepared.draft)).draft, one.draft);
        const after = await db('customers').where({ id: customer.id }).first(); assert.equal(after.version, version + 1);
        if (operation === 'update') assert.equal(after.location, 'Reviewed fixture address');
        if (operation === 'assign') assert.equal(after.ownerId, teammate);
        if (operation === 'set_archived') assert.ok(after.archivedAt);
        if (operation === 'restore') assert.equal(after.archivedAt, null);
        if (operation === 'link_lead' || operation === 'unlink_lead') assert.equal((await db('leads').where({ id: record.id }).first()).customerId, operation === 'link_lead' ? customer.id : null);
        assert.deepEqual((await visibleReviewed('customer', prepared.turn.id))?.draft, one.draft);
      });
    }
    const wo = await savedWorkOrder();
    for (const request of [
      { operation: 'edit', title: 'Reviewed Work Order' },
      { operation: 'schedule', scheduledDate: '2026-12-20', arrivalWindow: '08:00-10:00' },
      { operation: 'assign', assignee: teammate, crew: [] },
      { operation: 'add_tasks', tasks: [{ label: 'Fixture task', required: false }] },
      { operation: 'add_materials', materials: [{ name: 'Fixture custom pipe', quantity: 2, unit: 'each' }] },
      { operation: 'set_status', status: 'issued' },
      { operation: 'add_note', body: 'Reviewed private Work Order note' },
      { operation: 'set_status', status: 'in-progress' },
      { operation: 'toggle_task', taskLabel: 'Fixture task', done: true },
      { operation: 'complete', summary: 'Fixture work complete' },
      { operation: 'reopen', reason: 'Fixture revisit' },
      { operation: 'set_status', status: 'canceled', reason: 'Fixture canceled' },
    ] satisfies Partial<WorkOrdersPropose>[]) {
      await check(`Work Order ${request.operation}${'status' in request ? ` ${request.status}` : ''} confirms native command once`, async () => {
        const prepared = await workOrderProposal({ ...request, workOrderNumber: wo.number });
        const before = (await db('workOrders').where({ id: wo.id }).first()).version;
        const one = await workOrderDecision(prepared.draft); assert.deepEqual((await workOrderDecision(prepared.draft)).draft, one.draft);
        assert.equal((await db('workOrders').where({ id: wo.id }).first()).version, before + 1);
        assert.deepEqual((await visibleReviewed('workOrder', prepared.turn.id))?.draft, one.draft);
      });
    }
    const itemName = `Fictional catalog pipe ${randomUUID()}`;
    for (const request of [
      { operation: 'create', name: itemName, sku: `SKU-${randomUUID()}`, unit: 'each', costDollars: 2, priceDollars: 3 },
      { operation: 'edit', target: itemName, notes: 'Reviewed catalog note' },
      { operation: 'archive', target: itemName },
      { operation: 'restore', target: itemName },
    ] satisfies Partial<MaterialsPropose>[]) {
      await check(`Material ${request.operation} uses native catalog command and shared review`, async () => {
        const prepared = await materialProposal(request);
        const one = await workOrderDecision(prepared.draft); assert.deepEqual((await workOrderDecision(prepared.draft)).draft, one.draft);
        assert.deepEqual((await visibleReviewed('workOrder', prepared.turn.id))?.draft, one.draft);
        const stored = await db(reviewedTable('material')).where({ id: prepared.draft.id }).first();
        if (canonical) assert.equal(stored.family, 'material');
        const item = await db('materialCatalog').where({ workspaceId: identity.workspaceId, name: itemName }).first();
        assert.equal(item.version, request.operation === 'create' ? 1 : request.operation === 'edit' ? 2 : request.operation === 'archive' ? 3 : 4);
        assert.equal(!!item.archivedAt, request.operation === 'archive');
      });
    }
    await check('Material propose-only authority submits a pending catalog item, not an active item', async () => {
      const office = { ...identity, userId: teammate };
      await db('workspaceMemberships').where(office).update({ role: 'office' });
      try {
        const name = `Proposed-only ${randomUUID()}`, prepared = await materialProposal({ operation: 'create', name }, turn(randomUUID(), office), office);
        assert.equal(prepared.draft.action, 'material-propose');
        await workOrderDecision(prepared.draft, 'confirm', office);
        assert.equal((await db('materialCatalog').where({ workspaceId: identity.workspaceId, name }).first()).status, 'proposed');
      } finally {
        await db('workspaceMemberships').where(office).update({ role: 'field' });
      }
    });
    await check('reviewed expiry, active-thread, completion, ownership and forged-hash guards stay native', async () => {
      for (const family of ['customer', 'workOrder', 'material'] as const) {
        const prepared = family === 'customer' ? await customerProposal('create', { values: customerValues, allowDuplicate: true })
          : family === 'workOrder' ? await workOrderProposal({ operation: 'export_csv' }) : await materialProposal({ operation: 'create', name: `Gated ${randomUUID()}` });
        const resolve = () => family === 'customer' ? customerDecision(customerDraftSchema.parse(prepared.draft), 'cancel') : workOrderDecision(workOrderChatDraftSchema.parse(prepared.draft), 'cancel');
        const conflict = family === 'customer' ? CustomerConflictError : WorkOrderConflictError;
        const active = await turn(prepared.turn.threadId);
        await assert.rejects(resolve(), conflict); await complete(active);
        await db('chatTurns').where({ id: prepared.turn.id }).update({ state: 'running' });
        await assert.rejects(resolve(), conflict); await complete(prepared.turn);
        const nativeInput = { draftId: prepared.draft.id, inputHash: prepared.draft.inputHash, decision: 'cancel' as const };
        await assert.rejects(family === 'customer' ? resolveCustomerDraft(stranger, nativeInput) : resolveWorkOrderDraft(stranger, nativeInput), AuthorizationAccessError);
        await assert.rejects(family === 'customer' ? resolveCustomerDraft(identity, { ...nativeInput, inputHash: 'b'.repeat(64) })
          : resolveWorkOrderDraft(identity, { ...nativeInput, inputHash: 'b'.repeat(64) }), conflict);
        const table = reviewedTable(family), stored = await db(table).where({ id: prepared.draft.id }).first();
        const expiresAt = new Date().toISOString();
        const envelope = canonical ? stored.payload : stored;
        await db(table).where({ id: prepared.draft.id }).update({ expiresAt,
          ...(canonical ? { payload: JSON.stringify({ ...envelope, review: { ...envelope.review, expiresAt } }) } : { review: JSON.stringify({ ...stored.review, expiresAt }) }) });
        assert.equal((await visibleReviewed(family === 'customer' ? 'customer' : 'workOrder', prepared.turn.id))?.draft?.state, 'expired');
        await assert.rejects(resolve(), conflict);
      }
    });
    await check('Customer/Work Order/Material version changes and fresh permission revocation deny confirmation', async () => {
      const customer = await savedCustomer(), workOrder = await savedWorkOrder();
      for (const family of ['customer', 'workOrder', 'material'] as const) {
        const prepared = family === 'customer' ? await customerProposal('update', { customerRef: customer.id, changes: [{ field: 'location', value: 'Stale fixture' }] })
          : family === 'workOrder' ? await workOrderProposal({ operation: 'edit', workOrderNumber: workOrder.number, title: 'Stale fixture' })
          : await materialProposal({ operation: 'edit', target: itemName, notes: 'Stale fixture' });
        const query = family === 'customer' ? db('customers').where({ id: customer.id }) : family === 'workOrder' ? db('workOrders').where({ id: workOrder.id })
          : db('materialCatalog').where({ workspaceId: identity.workspaceId, name: itemName });
        await query.increment('version', 1);
        await assert.rejects(family === 'customer' ? customerDecision(customerDraftSchema.parse(prepared.draft)) : workOrderDecision(workOrderChatDraftSchema.parse(prepared.draft)),
          family === 'customer' ? CustomerConflictError : WorkOrderConflictError);
        const permission = family === 'customer' ? 'customers.update' : family === 'workOrder' ? 'workorders.update' : 'materials.manage';
        const grant = await db('workspaceRolePolicies').where({ workspaceId: identity.workspaceId, role: 'owner', permission }).first(); assert.ok(grant);
        await db('workspaceRolePolicies').where({ workspaceId: identity.workspaceId, role: 'owner', permission }).delete();
        try { await assert.rejects(family === 'customer' ? customerDecision(customerDraftSchema.parse(prepared.draft)) : workOrderDecision(workOrderChatDraftSchema.parse(prepared.draft)), AuthorizationAccessError); }
        finally { await db('workspaceRolePolicies').insert(grant); }
      }
    });
    await check('all three exports stream once; confirmed exports and canceled exports cannot download again', async () => {
      const customer = await savedCustomer();
      for (const family of ['customer', 'workOrder', 'material'] as const) {
        const prepareExport = () => family === 'customer'
          ? customerProposal('export_csv', { mode: 'customer', customerRef: customer.id, filters: customerFilters, columns: ['number', 'name'] })
          : family === 'workOrder' ? workOrderProposal({ operation: 'export_csv' }) : materialProposal({ operation: 'export' });
        const prepared = await prepareExport();
        const decide = (decision: 'confirm' | 'cancel') => family === 'customer'
          ? customerDecision(customerDraftSchema.parse(prepared.draft), decision) : workOrderDecision(workOrderChatDraftSchema.parse(prepared.draft), decision);
        const confirmed = await decide('confirm'); assert.ok(confirmed.csv?.includes('Fictional'));
        await assert.rejects(decide('confirm'), /Prepare another export/);
        await assert.rejects(decide('cancel'), family === 'customer' ? CustomerConflictError : WorkOrderConflictError);
        const canceled = await prepareExport();
        if (family === 'customer') {
          const view = customerDraftSchema.parse(canceled.draft), one = await customerDecision(view, 'cancel');
          assert.deepEqual((await customerDecision(view, 'cancel')).draft, one.draft); await assert.rejects(customerDecision(view), CustomerConflictError);
        } else {
          const view = workOrderChatDraftSchema.parse(canceled.draft), one = await workOrderDecision(view, 'cancel');
          assert.deepEqual((await workOrderDecision(view, 'cancel')).draft, one.draft); await assert.rejects(workOrderDecision(view), WorkOrderConflictError);
        }
      }
    });
    await check('Customer deletion requires typed/unlink consent, erases other actors, retains minimal receipt and replay', async () => {
      const customer = await savedCustomer(), record = await lead();
      await db('leads').where({ id: record.id }).update({ customerId: customer.id });
      const other = await customerProposal('add_note', { customerRef: customer.id, body: 'Private other-actor copy' }, turn(randomUUID(), stranger), stranger);
      const prepared = await customerProposal('delete', { customerRef: customer.id });
      await db('chatMessages').insert({ id: randomUUID(), turnId: other.turn.id, role: 'assistant', text: 'Private other-actor answer' });
      await assert.rejects(customerDecision(prepared.draft, 'confirm', { typedConfirmation: 'wrong', unlinkOpenLeads: true }), CustomerValidationError);
      await assert.rejects(customerDecision(prepared.draft, 'confirm', { typedConfirmation: customer.number, unlinkOpenLeads: false }), CustomerValidationError);
      const remove = () => customerDecision(prepared.draft, 'confirm', { typedConfirmation: customer.number, unlinkOpenLeads: true });
      if (canonical) await reviewedAuditFailure(remove, async () => {
        assert.ok(await db('customers').where({ id: customer.id }).first()); assert.ok(await db(reviewedTable('customer')).where({ id: other.draft.id }).first());
      });
      const one = await remove(); assert.deepEqual((await remove()).draft, one.draft);
      assert.equal((await db('customers').where({ id: customer.id })).length, 0);
      assert.equal((await db('leads').where({ id: record.id }).first()).customerId, null);
      assert.equal((await db(reviewedTable('customer')).where({ id: other.draft.id })).length, 0);
      const receipt = await db(reviewedTable('customer')).where({ id: prepared.draft.id }).first(), body = canonical ? receipt.payload : receipt;
      assert.deepEqual(body.payload, { kind: 'deleted' }); assert.equal(receipt.inputHash, prepared.draft.inputHash);
      assert.equal(body.review.customer.name, ''); assert.deepEqual(body.review.changes, []);
      assert.equal((await db('chatTurns').where({ id: other.turn.id }).first()).customerResult, null);
      assert.equal((await db('chatMessages').where({ turnId: other.turn.id }).first()).text, 'Customer-derived answer removed after customer deletion.');
      assert.deepEqual((await visibleReviewed('customer', prepared.turn.id))?.draft, one.draft);
      await db(reviewedTable('customer')).where({ id: prepared.draft.id }).update({ state: 'pending' });
      await assert.rejects(remove(), CustomerConflictError);
      await db(reviewedTable('customer')).where({ id: prepared.draft.id }).update({ state: 'confirmed' });
    });
    await check('Material supersession retires Work Order/Customer/Lead once but Customer does not retire Material', async () => {
      const source = await turn(), customer = await customerProposal('create', { values: customerValues, allowDuplicate: true }, Promise.resolve(source));
      const material = await materialProposal({ operation: 'create', name: `Directional ${randomUUID()}` }, turn(source.threadId));
      assert.equal((await db(reviewedTable('customer')).where({ id: customer.draft.id }).first()).state, 'superseded');
      await customerProposal('create', { values: customerValues, allowDuplicate: true }, turn(source.threadId));
      assert.equal((await db(reviewedTable('material')).where({ id: material.draft.id }).first()).state, 'pending');
      const work = await workOrderProposal({ operation: 'export_csv' }, turn(source.threadId));
      assert.equal((await db(reviewedTable('material')).where({ id: material.draft.id }).first()).state, 'superseded');
      const before = canonicalSQL.length;
      await materialProposal({ operation: 'create', name: `Replacement ${randomUUID()}` }, turn(source.threadId));
      assert.equal((await db(reviewedTable('workOrder')).where({ id: work.draft.id }).first()).state, 'superseded');
      if (canonical) assert.equal(canonicalSQL.slice(before).filter(sql => /select.*"chatProposals".*for update/i.test(sql)).length, 1);
    });
    if (canonical) await check('reviewed lock handles and lifecycle audit failures roll native writes back', async () => {
      for (const family of ['customer', 'workOrder', 'material'] as const) {
        const prepared = family === 'customer' ? await customerProposal('create', { values: customerValues, allowDuplicate: true })
          : family === 'workOrder' ? await workOrderProposal({ operation: 'export_csv' }) : await materialProposal({ operation: 'create', name: `Rollback ${randomUUID()}` });
        const table = family === 'customer' ? 'customers' : family === 'material' ? 'materialCatalog' : 'workOrderExportAudit';
        const before = (await db(table).where({ workspaceId: identity.workspaceId })).length;
        await reviewedAuditFailure(() => family === 'customer' ? customerDecision(customerDraftSchema.parse(prepared.draft)) : workOrderDecision(workOrderChatDraftSchema.parse(prepared.draft)), async () => {
          assert.equal((await db(table).where({ workspaceId: identity.workspaceId })).length, before);
          assert.equal((await db('chatProposals').where({ id: prepared.draft.id }).first()).state, 'pending');
        });
        const storage = family === 'customer' ? customerProposalStorage : workOrderProposalStorage;
        let held: { id: string } | undefined;
        await withWorkspaceAuthorization(runtime, identity, enabledPermissions, true, async (trx, context) => {
          const row = await storage.read(trx, context, { id: prepared.draft.id }); assert.ok(row);
          await assert.rejects(storage.save(trx, context, row, prepared.draft, 'canceled'), /proposal lock/);
          held = await storage.read(trx, context, { id: prepared.draft.id }, true);
        });
        await withWorkspaceAuthorization(runtime, identity, enabledPermissions, true, async (trx, context) => {
          assert.ok(held); await assert.rejects(storage.save(trx, context, held, prepared.draft, 'canceled'), /proposal lock/);
        });
      }
    });
    if (canonical) await check('failed preparation restores replaced siblings even if the caller catches the audit error', async () => {
      const prepared = await materialProposal({ operation: 'create', name: `Atomic preparation ${randomUUID()}` });
      const source = await turn(prepared.turn.threadId);
      await failAudit(() => withWorkspaceAuthorization(runtime, identity, enabledPermissions, true, async (trx, context) => {
        const id = randomUUID(), expiresAt = new Date(Date.now() + 900000).toISOString();
        await assert.rejects(workOrderProposalStorage.insert(trx, context, source, {
          accessHash: chatAccessHash(context),
          payload: { kind: 'material', input: { workspaceId: identity.workspaceId, submissionId: id, action: 'create', item: { name: 'Failed fixture' } } },
          review: { id, inputHash: 'a'.repeat(64), expiresAt, state: 'pending', action: 'material-create', workOrder: { number: 'New item', title: 'Failed fixture' }, changes: [] },
        }), /rehearsal audit failure/);
        assert.equal((await trx('chatProposals').where({ id: prepared.draft.id }).first()).state, 'pending');
      }), async () => {
        assert.equal((await db('chatProposals').where({ id: prepared.draft.id }).first()).state, 'pending');
        assert.equal((await db('chatProposals').where({ turnId: source.id })).length, 0);
      }, 'proposed', false);
      await complete(source);
    });
  }
  async function runHistory() {
    await check('native preparation records family metadata; mixed history restores cards and all recorded terminal states', async () => {
      await savedWorkOrder();
      const source = await turn(), leadView = await proposeLeadDraft(identity, source.id, input, signal()); await complete(source);
      const customer = await customerProposal('create', { values: customerValues, allowDuplicate: true }, turn(source.threadId));
      const material = await materialProposal({ operation: 'create', name: `History catalog ${randomUUID()}` }, turn(source.threadId));
      const work = await workOrderProposal({ operation: 'export_csv' }, turn(source.threadId));
      await workOrderDecision(work.draft, 'cancel');
      for (const [origin, family] of [[source, 'action'], [customer.turn, 'customer'], [material.turn, 'material'], [work.turn, 'workOrder']] as const)
        assert.deepEqual((await db('chatTurns').where({ id: origin.id }).first()).proposalFamilies, [family]);
      const before = canonicalSQL.length, runtimeHistory = await readThreads(identity, source.threadId, 'runtime');
      assert.ok(runtimeHistory.turns);
      assert.equal(runtimeHistory.turns.length, 4);
      const runtimeTurns = runtimeHistory.turns;
      for (const [origin, family, state] of [[source, 'action', 'superseded'], [customer.turn, 'customer', 'superseded'],
        [material.turn, 'material', 'superseded'], [work.turn, 'workOrder', 'cancelled']] as const) {
        const restored: (typeof runtimeTurns)[number] | undefined = runtimeTurns.find(item => item.id === origin.id); assert.ok(restored);
        assert.equal(restored.contextAvailable, true);
        assert.deepEqual(restored.proposalHistory, [{ family, state }]);
      }
      if (canonical) {
        const discovery = canonicalSQL.slice(before).filter(sql => /distinct on.*from "chatProposals"/i.test(sql));
        assert.equal(discovery.length, 1); assert.equal(discovery.some(sql => /union all/i.test(sql)), false);
      }
      const display = await readThreads(identity, source.threadId);
      assert.ok(display.turns);
      assert.equal(display.turns.find(item => item.id === source.id)?.action?.id, leadView.id);
      assert.equal(display.turns.find(item => item.id === customer.turn.id)?.customerResult?.draft?.state, 'superseded');
      assert.equal(display.turns.find(item => item.id === material.turn.id)?.workOrderResult?.draft?.state, 'superseded');
      assert.equal(display.turns.find(item => item.id === work.turn.id)?.workOrderResult?.draft?.state, 'canceled');
      await assert.rejects(readThreads(stranger, source.threadId), AuthorizationAccessError);
      const auditCount = canonical ? (await db('chatProposalAudit').whereIn('proposalId', [leadView.id, customer.draft.id, material.draft.id, work.draft.id])).length : 0;
      await deleteThread(identity, source.threadId);
      assert.equal((await db(canonical ? 'chatProposals' : 'chatWorkOrderDrafts').where({ threadId: source.threadId })).length, 0);
      if (canonical) assert.equal((await db('chatProposalAudit').whereIn('proposalId', [leadView.id, customer.draft.id, material.draft.id, work.draft.id])).length, auditCount);
    });
    await check('plain runtime history skips proposal SQL; unknown metadata discovers existing proposals without fallback', async () => {
      const source = await turn(); await complete(source);
      const before = canonicalSQL.length, plain = await readThreads(identity, source.threadId, 'runtime');
      assert.ok(plain.turns);
      assert.equal(plain.turns[0].contextAvailable, true); assert.deepEqual(plain.turns[0].proposalHistory, []);
      if (canonical) assert.equal(canonicalSQL.slice(before).some(sql => /chatProposals/.test(sql)), false);
      const prepared = await materialProposal({ operation: 'create', name: `Unknown metadata ${randomUUID()}` });
      await db('chatTurns').where({ id: prepared.turn.id }).update({ proposalFamilies: null });
      const history = await readThreads(identity, prepared.turn.threadId, 'runtime');
      assert.ok(history.turns);
      assert.deepEqual(history.turns[0].proposalHistory, [{ family: 'material', state: 'pending' }]);
      assert.equal(history.turns[0].contextAvailable, true);
    });
    await check('inherited reviewed sources share one canonical payload batch and deleted/missing/unfinished sources are denied', async () => {
      const customer = await customerProposal('create', { values: customerValues, allowDuplicate: true });
      const work = await workOrderProposal({ operation: 'export_csv' }, turn(customer.turn.threadId));
      const material = await materialProposal({ operation: 'create', name: `Inherited catalog ${randomUUID()}` }, turn(customer.turn.threadId));
      const source = await turn(customer.turn.threadId); await complete(source);
      await db('chatTurns').where({ id: source.id }).update({ historyEvidence: JSON.stringify([customer.turn.id, work.turn.id, material.turn.id]) });
      const allowed = async () => withWorkspaceAuthorization(runtime, identity, enabledPermissions, false, async (trx, context) => {
        const origin = await trx('chatTurns').where({ id: source.id }).first();
        return historicalEvidenceAllowed(trx, context, origin);
      });
      const before = canonicalSQL.length; assert.equal(await allowed(), true);
      if (canonical) assert.equal(canonicalSQL.slice(before).filter(sql => /from "chatProposals" as "p"/i.test(sql)).length, 1);
      await db('chatTurns').where({ id: material.turn.id }).update({ state: 'interrupted' }); assert.equal(await allowed(), false); await complete(material.turn);
      await db(reviewedTable('material')).where({ id: material.draft.id }).delete(); assert.equal(await allowed(), false);
    });
    await check('shared Work Order/Materials discovery uses payload kind and normalizes canceled only in recorded history', async () => {
      const prepared = await materialProposal({ operation: 'create', name: `Recorded cancellation ${randomUUID()}` });
      await workOrderDecision(prepared.draft, 'cancel');
      await withWorkspaceAuthorization(runtime, identity, enabledPermissions, false, async (trx, context) => {
        const has = await readHistoryProposalPresence(trx, identity, [prepared.turn.id], new Map([[prepared.turn.id, ['material']]]), context);
        assert.equal(has(prepared.turn.id, 'material'), true); assert.equal(has(prepared.turn.id, 'workOrder'), false);
        assert.deepEqual(has.states(prepared.turn.id), [{ family: 'material', state: 'cancelled' }]);
      });
    });
    await check('forward-only baseline refuses rollback and preserves proposal metadata', async () => {
      const saved = await db('chatTurns').whereNotNull('proposalFamilies').orderBy('id').select('id', 'proposalFamilies');
      await assert.rejects(db.migrate.rollback({
        directory: fileURLToPath(new URL('../../../../../packages/data/src/baseline-migrations', import.meta.url)),
        loadExtensions: ['.ts'],
      }), /forward-only/);
      assert.deepEqual(await db('chatTurns').whereNotNull('proposalFamilies').orderBy('id').select('id', 'proposalFamilies'), saved);
    });
  }
  if (historyOnly) {
    await withCanonicalProposalStorage(runHistory);
    assert.equal(canonicalSQL.some(sql => /"chat(?:ActionDrafts|ActionAudit|CustomerDrafts|WorkOrderDrafts|Estimate\w+|CalendarProposals|Capture\w+Proposals)"/.test(sql)), false);
    console.log(`PASS ${checks} native history integration groups; canonical discovery/evidence use one table and shared databases are untouched.`);
  } else {
    await withCanonicalProposalStorage(reviewedOnly ? runReviewed : run);
    assert.equal(canonicalSQL.some(sql => /"chat(?:ActionDrafts|ActionAudit|CustomerDrafts|WorkOrderDrafts)"/.test(sql)), false, 'Canonical mode must not touch legacy proposal/audit tables.');
    console.log(`PASS ${checks} native ${reviewedOnly ? 'Customer/Work Order/Material' : 'Lead'} proposal groups, canonical zero legacy SQL; shared databases untouched.`);
  }
} finally {
  const globalStore = globalThis as typeof globalThis & { workspaceDatabase?: ReturnType<typeof createDatabase> };
  if (globalStore.workspaceDatabase) { await globalStore.workspaceDatabase.destroy(); delete globalStore.workspaceDatabase; }
  if (previousURL === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = previousURL;
  await db.destroy();
  if (created) await owner.raw('DROP DATABASE ?? WITH (FORCE)', [name]);
  await owner.destroy();
}
