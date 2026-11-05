/** Disposable local DB + fictional provider/model only. Never reads credentials or real mail. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initializeWorkspacePolicy, createDatabase, captureDraftFingerprint, publishCaptureDraft, processCapturePublications, changeCaptureLifecycle, createAIUsageRecorder } from '@salesmora/data';
import { recordGmailWorkerReadiness } from '@salesmora/data/lead-capture/gmail-delivery';
import { openGmailEligibilityWindow, claimGmailMailbox, commitGmailHistoryPage, claimGmailMessage, beginGmailRecovery } from '@salesmora/data/lead-capture/gmail-sync-store';
import { commitGmailIntake } from '@salesmora/data/lead-capture/gmail-ingestion';
import { pollGmailCapture, processGmailCapture, type GmailCaptureDependencies } from './gmail-capture';
import { GmailSyncError } from '@salesmora/data/lead-capture/gmail-sync-provider';
import { AIBudgetExceededError, type CaptureConfiguration } from '@salesmora/contracts';
const env = fileURLToPath(new URL('../../../.env.local', import.meta.url)); if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') || !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw Error('Separate local test connection required.');
const name = `gmail_sync_${randomUUID().replaceAll('-', '')}_test`, owner = createDatabase(connection), url = new URL(connection); url.pathname = `/${name}`;
const db = createDatabase(url.toString()), roleURL = new URL(url); roleURL.searchParams.set('options', '-c role=salesmora_worker'); const worker = createDatabase(roleURL.toString());
let created = false, checks = 0;
async function check(label: string, run: () => Promise<void>) { await run(); checks++; console.log(`PASS ${label}`); }
async function fixture(draft = false) {
  const workspaceId = randomUUID(), sourceId = randomUUID(), accountId = randomUUID(), userId = `sync-${randomUUID()}`, now = new Date();
  const fields = [{ id: 'name', key: 'name' as const, label: 'Name', type: 'short_text' as const, required: true, options: [] }, { id: 'service', key: 'service' as const, label: 'Service', type: 'short_text' as const, required: true, options: [] }, { id: 'email', key: 'email' as const, label: 'Email', type: 'email' as const, required: false, options: [] }];
  const configuration: CaptureConfiguration = { schemaVersion: 1, type: 'gmail', fields, contactRequired: true, workflow: { assignment: { kind: 'default' }, stage: 'new', tags: [], notifyAssigned: false }, connectionId: accountId, accountEmail: 'fictional@example.test', rules: { phrases: ['GMAIL-SYNC-FIXTURE'], location: 'subject', mode: 'all' }, mappings: fields.map(field => ({ fieldId: field.id, instruction: `Extract ${field.label} only when supported.` })), sampleId: randomUUID() };
  const draftId = randomUUID();
  await db('users').insert({ id: userId, name: 'Fictional owner', email: `${userId}@example.test`, createdAt: now, updatedAt: now, termsVersion: 'test', termsAcceptedAt: now });
  await db.transaction(async trx => {
    await trx('workspaces').insert({ id: workspaceId, ownerId: userId, businessName: 'Fictional Gmail fixture', businessType: 'test', postalCode: '', serviceRange: '', timezone: 'America/New_York' });
    await trx('workspaceMemberships').insert({ workspaceId, userId, role: 'owner' });
    await initializeWorkspacePolicy(trx, { workspaceId, userId });
    await trx('workspaceSubscriptions').insert({ workspaceId, plan: 'standard', status: 'active', catalogVersion: 'fixture', paidThrough: new Date(now.getTime() + 86400000) });
    await trx('captureGmailAccounts').insert({ id: accountId, workspaceId, providerSubject: accountId, email: 'fictional@example.test', status: 'connected', version: 1, credentialGeneration: 1 });
    await trx('captureSources').insert({ id: sourceId, workspaceId, name: 'Fictional Gmail intake', type: 'gmail', status: draft ? 'draft' : 'active', version: 1, approvedVersion: draft ? null : 1, draftId: draft ? draftId : null });
    if (draft) {
      await trx('captureSourceDrafts').insert({ id: draftId, workspaceId, sourceId, sourceType: 'gmail', version: 1, configuration: JSON.stringify(configuration) });
      const { connectionId, accountEmail, rules, mappings, fields, contactRequired, sampleId } = configuration;
      const bindingHash = captureDraftFingerprint({ connectionId, accountEmail, rules, mappings, fields, contactRequired, draftVersion: 1 });
      await trx('captureSourceSamples').insert({ id: sampleId, workspaceId, sourceId, sourceType: 'gmail', draftId, draftVersion: 1, connectionId: accountId, accountEmail, bindingHash, evidence: JSON.stringify({ schemaVersion: 1, type: 'gmail', from: '', subject: 'Fictional', body: 'Example', fields: [] }), answers: '{}', reviewedBy: userId, reviewedAt: now });
      await trx('captureGmailSampleBindings').insert({ id: randomUUID(), workspaceId, sourceId, draftId, sampleId, draftVersion: 1, bindingHash, provenance: JSON.stringify({ kind: 'pasted' }) });
    } else await trx('captureSourceVersions').insert({ id: randomUUID(), workspaceId, sourceId, sourceType: 'gmail', configurationVersion: 1, definitionVersion: 1, workflowVersion: 1, configuration: JSON.stringify(configuration), approvedBy: userId, approvedAt: now });
  });
  const scope = { workspaceId, sourceIds: [sourceId] }, windowId = draft ? null : await worker.transaction(trx => openGmailEligibilityWindow(trx, scope, sourceId, { accountId, generation: 1, historyId: '100' }));
  const window = windowId ? await db('captureGmailEligibilityWindows').where({ id: windowId }).first() : null;
  return { workspaceId, sourceId, accountId, scope, configuration, windowId, startedAt: (window?.startedAt ?? now) as Date, userId };
}
type Fixture = Awaited<ReturnType<typeof fixture>>;
const extraction = { answers: { name: 'Alex Morgan', service: 'Water heater', email: 'alex@example.test' }, fields: [{ fieldId: 'name', uncertain: false, origin: { kind: 'email' as const, location: 'body' as const, quote: 'Alex Morgan' } }] };
function message(f: Fixture, id: string, patch: Record<string, unknown> = {}) { return { id, labelIds: ['INBOX'], internalDate: String(f.startedAt.getTime() + 100), payload: { mimeType: 'text/plain', headers: [{ name: 'From', value: 'sender@example.test' }, { name: 'Subject', value: 'GMAIL-SYNC-FIXTURE' }], body: { data: Buffer.from('Alex Morgan needs a water heater quote.').toString('base64url') } }, ...patch }; }
function dependencies(f: Fixture, ids = ['one']): GmailCaptureDependencies { return { grant: async () => 'fictional-access', sync: { profile: async () => ({ historyId: '200' }), history: async () => ({ historyId: '200', history: [{ id: '150', messagesAdded: ids.map(id => ({ message: { id, labelIds: ['INBOX'] } })) }] }), recovery: async () => ({ messages: ids.map(id => ({ id })) }) }, messages: () => ({ list: async () => [], metadata: async () => ({}), message: async (_token, id) => message(f, id) }), extract: async () => extraction }; }
async function due(f: Fixture) { await db('captureGmailMailboxState').where({ workspaceId: f.workspaceId }).update({ nextSyncAt: new Date(0) }); }
try {
  await owner.raw('CREATE DATABASE ??', [name]); created = true; await db.migrate.latest({ directory: fileURLToPath(new URL('../../../packages/data/src/migrations', import.meta.url)), loadExtensions: ['.ts'] });
  await check('empty synchronization migration rolls back and reapplies without granting unrelated access', async () => {
    const config = { directory: fileURLToPath(new URL('../../../packages/data/src/migrations', import.meta.url)), loadExtensions: ['.ts'], name: '202611050005_capture_gmail_sync.ts' };
    await db.migrate.down(config); await db.migrate.up(config);
    await assert.rejects(worker('captureGmailOAuthAttempts').select('id'));
  });
  await check('confirmed launch and scheduled activation open one version-bound window before worker intake', async () => {
    const enabled = ['leadCapture.read', 'leadCapture.activate', 'leadCapture.pause'] as const;
    for (const scheduled of [false, true]) {
      const f = await fixture(true);
      const identity = { workspaceId: f.workspaceId, userId: f.userId };
      const authority = {
        websiteReady: async () => false,
        gmailReady: async () => true,
        gmailBaseline: async (connection: typeof db) => {
          assert.ok(!connection.isTransaction);
          return '100';
        },
        gmailOpen: async (trx: Parameters<typeof openGmailEligibilityWindow>[0], _workspaceId: string, sourceId: string, baseline: Parameters<typeof openGmailEligibilityWindow>[3]) => {
          await openGmailEligibilityWindow(trx, f.scope, sourceId, baseline);
        },
        scheduledType: 'gmail' as const,
        scheduledSourceIds: f.scope.sourceIds,
      };
      await recordGmailWorkerReadiness(worker, [f.scope]);
      const timing = scheduled ? { kind: 'scheduled', at: new Date(Date.now() + 3000).toISOString(), timezone: 'America/New_York' } : { kind: 'now' };
      const command = { workspaceId: f.workspaceId, sourceId: f.sourceId, requestId: randomUUID(), expectedVersion: 1, draftVersion: 1, configurationVersion: 1, baseApprovedVersion: null, confirmed: true, timing };
      const saved = await publishCaptureDraft(db, identity, enabled, command, authority);
      if (scheduled) {
        assert.equal(await db('captureGmailEligibilityWindows').where({ sourceId: f.sourceId }).first(), undefined);
        await new Promise(resolve => setTimeout(resolve, 3100));
        assert.equal(await processCapturePublications(worker, enabled, authority, 1, [f.workspaceId]), 1);
      } else {
        assert.deepEqual(await publishCaptureDraft(db, identity, enabled, command, authority), saved);
      }
      const window = await db('captureGmailEligibilityWindows').where({ sourceId: f.sourceId }).first();
      assert.equal(window.startHistoryId, '100');
      f.startedAt = window.startedAt;
      const deps = dependencies(f);
      assert.equal(await pollGmailCapture(worker, f.scope, deps), true);
      assert.equal(await processGmailCapture(worker, f.scope, deps), true);
      const source = await db('captureSources').where({ id: f.sourceId }).first();
      const paused = await changeCaptureLifecycle(db, identity, enabled, { workspaceId: f.workspaceId, sourceId: f.sourceId, requestId: randomUUID(), expectedVersion: source.version, confirmed: true, action: 'pause' }, authority);
      await changeCaptureLifecycle(db, identity, enabled, { workspaceId: f.workspaceId, sourceId: f.sourceId, requestId: randomUUID(), expectedVersion: paused.sourceVersion, confirmed: true, action: 'resume', configuration: { kind: 'approved', version: 1 } }, authority);
      assert.equal((await db('captureGmailEligibilityWindows').where({ sourceId: f.sourceId }).whereNull('endedAt')).length, 1);
      assert.equal((await db('intakeItems').where({ sourceId: f.sourceId })).length, 1);
    }
  });
  await check('runtime worker queues history and creates supervised intake, never a lead/email', async () => {
    const f = await fixture();
    const deps = dependencies(f);
    const extract = deps.extract;
    await db('workspaceAITokenBudgets').insert({ workspaceId: f.workspaceId, monthlyTokens: 100 });
    const recorder = createAIUsageRecorder(worker, { workspaceId: f.workspaceId });
    await assert.rejects(recorder.start('fictional-extractor', 'planning', 101), AIBudgetExceededError);
    deps.extract = async (...args) => {
      const finish = await recorder.start('fictional-extractor', 'planning', 100);
      const result = await extract(...args);
      await finish({ outcome: 'completed' });
      return result;
    };
    assert.equal(await pollGmailCapture(worker, f.scope, deps), true);
    assert.equal(await processGmailCapture(worker, f.scope, deps), true);
    const row = await db('intakeItems').where({ workspaceId: f.workspaceId }).first(); assert.equal(row.status, 'awaiting'); assert.ok(row.flags.includes('uncertain'));
    assert.equal((await db('captureReceipts').where({ workspaceId: f.workspaceId })).length, 1); assert.equal((await db('leads').where({ workspaceId: f.workspaceId })).length, 0); assert.equal((await db('assignmentEmailOutbox')).length, 0);
    assert.equal((await db('captureGmailMailboxState').where({ workspaceId: f.workspaceId }).first()).historyId, '200');
  });
  await check('pagination never advances across unqueued work; replays and concurrent claims deduplicate', async () => {
    const f = await fixture(), lease = await claimGmailMailbox(worker, f.scope); assert.ok(lease); assert.equal(await claimGmailMailbox(worker, f.scope), null);
    await commitGmailHistoryPage(worker, f.scope, lease, { historyId: '200', nextPageToken: 'second', history: [{ id: '150', messagesAdded: [{ message: { id: 'one' } }] }] });
    const state = await db('captureGmailMailboxState').where({ workspaceId: f.workspaceId }).first(); assert.equal(state.historyId, '100'); assert.equal(state.pageToken, 'second');
    assert.equal(await commitGmailHistoryPage(worker, f.scope, lease, { historyId: '999' }), false);
    const next = await claimGmailMailbox(worker, f.scope); assert.ok(next); await commitGmailHistoryPage(worker, f.scope, next, { historyId: '200', history: [{ id: '150', messagesAdded: [{ message: { id: 'one' } }, { message: { id: 'two' } }] }] });
    assert.equal((await db('captureGmailMessageJobs').where({ workspaceId: f.workspaceId })).length, 2);
    const jobs = await Promise.all([claimGmailMessage(worker, f.scope), claimGmailMessage(worker, f.scope)]); assert.ok(jobs.every(Boolean)); assert.notEqual(jobs[0]?.id, jobs[1]?.id);
  });
  await check('expired lease recovery fences stale workers and preserves one intake outcome', async () => {
    const f = await fixture(); await pollGmailCapture(worker, f.scope, dependencies(f)); const old = await claimGmailMessage(worker, f.scope); assert.ok(old);
    await db('captureGmailMessageJobs').where({ id: old.id }).update({ leaseUntil: new Date(0) }); const fresh = await claimGmailMessage(worker, f.scope); assert.ok(fresh);
    assert.equal(await commitGmailIntake(worker, f.scope, old, message(f, 'one'), extraction), null);
    assert.ok(await commitGmailIntake(worker, f.scope, fresh, message(f, 'one'), extraction)); assert.equal(await commitGmailIntake(worker, f.scope, fresh, message(f, 'one'), extraction), null);
    assert.equal((await db('captureReceipts').where({ workspaceId: f.workspaceId })).length, 1);
  });
  await check('pause closes eligibility and invalidates in-flight processing atomically', async () => {
    const f = await fixture(); await pollGmailCapture(worker, f.scope, dependencies(f)); const lease = await claimGmailMessage(worker, f.scope); assert.ok(lease);
    await db('captureSources').where({ id: f.sourceId }).update({ status: 'paused', version: 2 }); assert.ok((await db('captureGmailEligibilityWindows').where({ id: f.windowId }).first()).endedAt);
    assert.equal(await commitGmailIntake(worker, f.scope, lease, message(f, 'one'), extraction), null); assert.equal((await db('captureGmailMessageJobs').where({ id: lease.id }).first()).state, 'ignored');
    assert.equal(await claimGmailMailbox(worker, f.scope), null);
  });
  await check('messages before launch, nonmatches and sent mail never call extraction or create intake', async () => {
    const f = await fixture(), deps = dependencies(f, ['before', 'sent', 'other']); let extracted = 0;
    deps.extract = async () => { extracted++; return extraction; }; const provider = deps.messages(); deps.messages = () => provider; provider.message = async (_token, id) => id === 'before' ? message(f, id, { internalDate: String(f.startedAt.getTime() - 1) }) : id === 'sent' ? message(f, id, { labelIds: ['SENT'] }) : message(f, id, { payload: { mimeType: 'text/plain', headers: [{ name: 'Subject', value: 'Other mail' }], body: { data: Buffer.from('Alex Morgan').toString('base64url') } } });
    await pollGmailCapture(worker, f.scope, deps); for (let i = 0; i < 3; i++) await processGmailCapture(worker, f.scope, deps);
    assert.equal(extracted, 0); assert.equal((await db('captureReceipts').where({ workspaceId: f.workspaceId })).length, 0);
  });
  await check('expired cursor uses a bounded rescan followed by its pre-rescan profile checkpoint', async () => {
    const f = await fixture(), deps = dependencies(f); deps.sync.history = async () => { throw new GmailSyncError('cursor-expired'); };
    assert.equal(await pollGmailCapture(worker, f.scope, deps), true); const recovery = await db('captureGmailMailboxState').where({ workspaceId: f.workspaceId }).first(); assert.equal(recovery.recoveryHistoryId, '200'); assert.equal(recovery.historyId, '100');
    assert.equal(await pollGmailCapture(worker, f.scope, deps), true); assert.equal((await db('captureGmailMailboxState').where({ workspaceId: f.workspaceId }).first()).historyId, '200');
    assert.equal(await processGmailCapture(worker, f.scope, deps), true); assert.equal((await db('captureReceipts').where({ workspaceId: f.workspaceId })).length, 1);
    await due(f); await pollGmailCapture(worker, f.scope, dependencies(f)); assert.equal((await db('captureGmailMessageJobs').where({ workspaceId: f.workspaceId })).length, 1);
  });
  await check('recovery beyond seven days stops explicitly instead of resetting the cursor', async () => {
    const f = await fixture(); await db('captureGmailEligibilityWindows').where({ id: f.windowId }).update({ startedAt: new Date(Date.now() - 8 * 86400000) });
    const lease = await claimGmailMailbox(worker, f.scope); assert.ok(lease); assert.equal(await beginGmailRecovery(worker, f.scope, lease, '200'), false);
    const state = await db('captureGmailMailboxState').where({ workspaceId: f.workspaceId }).first(); assert.equal(state.failure, 'recovery-required'); assert.equal(state.historyId, '100'); assert.equal(await claimGmailMailbox(worker, f.scope), null);
  });
  await check('provider/model failure keeps durable retry work; disconnect, downgrade and foreign scope fence commits', async () => {
    const f = await fixture(), deps = dependencies(f); await pollGmailCapture(worker, f.scope, deps); deps.extract = async () => { throw Error('Fictional model failure'); }; assert.equal(await processGmailCapture(worker, f.scope, deps), false);
    const job = await db('captureGmailMessageJobs').where({ workspaceId: f.workspaceId }).first(); assert.equal(job.state, 'retry'); assert.equal(job.failure, 'extraction');
    await db('captureGmailMessageJobs').where({ id: job.id }).update({ retryAt: new Date(0) }); const lease = await claimGmailMessage(worker, f.scope); assert.ok(lease);
    assert.equal(await commitGmailIntake(worker, { workspaceId: randomUUID(), sourceIds: [f.sourceId] }, lease, message(f, 'one'), extraction), null);
    await db('captureGmailAccounts').where({ id: f.accountId }).update({ status: 'disconnected', credentialGeneration: 2 }); assert.equal(await commitGmailIntake(worker, f.scope, lease, message(f, 'one'), extraction), null);
    await db('captureGmailAccounts').where({ id: f.accountId }).update({ status: 'connected' }); await db('workspaceSubscriptions').where({ workspaceId: f.workspaceId }).update({ plan: 'free', status: 'free' }); assert.equal(await claimGmailMailbox(worker, f.scope), null);
  });
  await check('credential-generation changes fence old work and preserve stable-account deduplication', async () => {
    const f = await fixture(); await pollGmailCapture(worker, f.scope, dependencies(f)); const old = await claimGmailMessage(worker, f.scope); assert.ok(old);
    await db('captureGmailAccounts').where({ id: f.accountId }).update({ credentialGeneration: 2 });
    assert.equal(await commitGmailIntake(worker, f.scope, old, message(f, 'one'), extraction), null);
    await db('captureGmailMessageJobs').where({ id: old.id }).update({ leaseUntil: new Date(0) }); const fresh = await claimGmailMessage(worker, f.scope); assert.ok(fresh); assert.equal(fresh.generation, 2);
    assert.ok(await commitGmailIntake(worker, f.scope, fresh, message(f, 'one'), extraction)); await due(f); await pollGmailCapture(worker, f.scope, dependencies(f));
    assert.equal((await db('captureGmailMessageJobs').where({ workspaceId: f.workspaceId })).length, 1);
  });
  await check('bounded pagination and provider rate limits retain the old checkpoint', async () => {
    const f = await fixture(), deps = dependencies(f); deps.sync.history = async () => { throw new GmailSyncError('rate-limit'); };
    assert.equal(await pollGmailCapture(worker, f.scope, deps), false); let state = await db('captureGmailMailboxState').where({ workspaceId: f.workspaceId }).first(); assert.equal(state.failure, 'rate-limit'); assert.equal(state.historyId, '100'); assert.equal(state.attempts, 1);
    await due(f); await db('captureGmailMailboxState').where({ id: state.id }).update({ scanPages: 99 }); const lease = await claimGmailMailbox(worker, f.scope); assert.ok(lease);
    assert.equal(await commitGmailHistoryPage(worker, f.scope, lease, { historyId: '200', nextPageToken: 'overflow' }), false);
    state = await db('captureGmailMailboxState').where({ id: state.id }).first(); assert.equal(state.failure, 'recovery-required'); assert.equal(state.historyId, '100');
  });
  await check('a narrow source scope cannot advance a mailbox shared with another open source', async () => {
    const f = await fixture(), second = randomUUID();
    await db.transaction(async trx => { await trx('captureSources').insert({ id: second, workspaceId: f.workspaceId, name: 'Second fictional source', type: 'gmail', status: 'active', version: 1, approvedVersion: 1 }); await trx('captureSourceVersions').insert({ id: randomUUID(), workspaceId: f.workspaceId, sourceId: second, sourceType: 'gmail', configurationVersion: 1, definitionVersion: 1, workflowVersion: 1, configuration: JSON.stringify(f.configuration), approvedBy: 'fixture', approvedAt: new Date() }); });
    await worker.transaction(trx => openGmailEligibilityWindow(trx, { workspaceId: f.workspaceId, sourceIds: [second] }, second, { accountId: f.accountId, generation: 1, historyId: '110' }));
    assert.equal(await claimGmailMailbox(worker, f.scope), null);
    const combined = { workspaceId: f.workspaceId, sourceIds: [f.sourceId, second] }; assert.ok(await claimGmailMailbox(worker, combined));
    assert.equal((await db('captureGmailMailboxState').where({ workspaceId: f.workspaceId }).first()).historyId, '100');
  });
  await check('repeated extraction failures stop at a durable failed outcome without creating intake', async () => {
    const f = await fixture(), deps = dependencies(f); await pollGmailCapture(worker, f.scope, deps);
    await db('captureGmailMessageJobs').where({ workspaceId: f.workspaceId }).update({ attempts: 7 }); deps.extract = async () => { throw Error('Fictional extraction failure'); };
    assert.equal(await processGmailCapture(worker, f.scope, deps), false);
    const row = await db('captureGmailMessageJobs').where({ workspaceId: f.workspaceId }).first(); assert.equal(row.attempts, 8); assert.equal(row.state, 'failed'); assert.equal(row.failure, 'extraction');
    assert.equal((await db('intakeItems').where({ workspaceId: f.workspaceId })).length, 0);
  });
  console.log(`Passed ${checks} Gmail synchronization database groups.`);
} finally { await worker.destroy(); await db.destroy(); if (created) await owner.raw('DROP DATABASE ?? WITH (FORCE)', [name]); await owner.destroy(); }
