import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy, AuthorizationAccessError } from '../authorization/store';
import { createCaptureDraft, saveCaptureDraft, readCaptureSource, CaptureDraftConflictError, CaptureDraftValidationError } from './store';
import { proposeCaptureSetup, decideCaptureSetupProposal, readCaptureSetupProposal, prepareCaptureSetupSampleApproval } from './setup-proposals';
import { publishCaptureDraft, readCapturePublicationReview } from './publication';
import { captureDraftFingerprint } from './store';
import { captureSetupFindingIssues } from './setup-samples';
import { initialCaptureSetupConfiguration, permissionIds, type CaptureSetupInput, type CaptureSetupView, type CaptureSetupContext, type CaptureDraftConfiguration } from '@salesmora/contracts';
const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url)); if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL || !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw Error('A separate local test connection is required.');
const owner = createDatabase(connection), name = `capture_setup_${randomUUID().replaceAll('-', '')}_test`, url = new URL(connection); url.pathname = `/${name}`;
const db = createDatabase(url.toString()), runtimeURL = new URL(url); runtimeURL.searchParams.set('options', '-c role=salesmora_web'); const runtime = createDatabase(runtimeURL.toString());
const identity = { workspaceId: randomUUID(), userId: `setup-${randomUUID()}` }, stranger = { ...identity, userId: `stranger-${randomUUID()}` };
const empty: CaptureSetupInput = { operation: 'create_source', sourceId: null, name: null, sourceType: null, fields: null, contactRequired: null, workflow: null, brief: null, content: null, rules: null, mappings: null, findings: null };
const signal = new AbortController().signal;
const reference = (view: CaptureSetupView) => ({ workspaceId: identity.workspaceId, proposalId: view.ticket.proposalId, inputHash: view.ticket.inputHash });
async function decide(view: CaptureSetupView, decision: 'confirm' | 'cancel' = 'confirm') { return decideCaptureSetupProposal(runtime, identity, permissionIds, { ...reference(view), decision }); }
async function turn(setup?: CaptureSetupContext, threadId: string = randomUUID()) {
  await db('chatThreads').insert({ ...identity, id: threadId }).onConflict('id').ignore();
  const id = randomUUID();
  await db('chatTurns').insert({ ...identity, id, threadId, clientTurnId: randomUUID(), requestHash: 'test', surfaceKey: setup ? 'lead_capture.setup' : 'home', state: 'running', leaseUntil: new Date(Date.now() + 60000), pageContext: JSON.stringify(setup ? { captureContext: { surface: 'lead_capture.setup', sourceId: setup.sourceId }, captureSetup: setup } : {}) });
  return id;
}
async function prepare(input: Partial<CaptureSetupInput>, setup?: CaptureSetupContext, threadId?: string) {
  const id = await turn(setup, threadId), view = await proposeCaptureSetup(runtime, identity, permissionIds, id, { ...empty, ...input }, signal);
  await db('chatTurns').where({ id }).update({ state: 'completed' }); return view;
}
async function snapshot(sourceId: string): Promise<CaptureSetupContext> {
  const { detail } = await readCaptureSource(runtime, identity, permissionIds, { workspaceId: identity.workspaceId, sourceId });
  return { sourceId, sourceVersion: detail.source.version, draftVersion: detail.draft!.version, name: detail.source.name, configuration: detail.draft!.configuration, sample: null, findings: [] };
}
let created = false, checks = 0;
async function check(label: string, work: () => Promise<void>) { await work(); console.log(`PASS ${label}`); checks++; }
try {
  await owner.raw('CREATE DATABASE ??', [name]); created = true;
  await db.migrate.latest({ directory: fileURLToPath(new URL('../migrations', import.meta.url)), loadExtensions: ['.ts'] });
  for (const person of [identity, stranger]) await db('users').insert({ id: person.userId, name: 'Fictional setup tester', email: `${person.userId}@example.test`, createdAt: new Date(), updatedAt: new Date(), termsVersion: 'test', termsAcceptedAt: new Date() });
  await db.transaction(async trx => { await trx('workspaces').insert({ id: identity.workspaceId, ownerId: identity.userId, businessName: 'Fictional setup workspace', businessType: 'plumbing', postalCode: '', serviceRange: '', timezone: 'America/New_York', planOverride: 'standard', planOverrideReason: 'Disposable setup fixture', planOverrideId: randomUUID(), planOverrideEndsAt: new Date(Date.now() + 86400000) }); for (const person of [identity, stranger]) await trx('workspaceMemberships').insert({ ...person, role: person === identity ? 'owner' : 'admin' }); await initializeWorkspacePolicy(trx, identity); });
  let creation: CaptureSetupView, sourceId: string;
  await check('generation cannot save; completed actor-owned confirmation creates one draft and exact retries reuse receipt', async () => {
    const id = await turn(); creation = await proposeCaptureSetup(runtime, identity, permissionIds, id, { ...empty, name: 'Fictional website', sourceType: 'website' }, signal);
    assert.equal(Number((await db('captureSources').count('* as n').first())!.n), 0);
    await assert.rejects(decide(creation), AuthorizationAccessError);
    await db('chatTurns').where({ id }).update({ state: 'completed' });
    await assert.rejects(readCaptureSetupProposal(runtime, stranger, permissionIds, reference(creation)), AuthorizationAccessError);
    await assert.rejects(decideCaptureSetupProposal(runtime, stranger, permissionIds, { ...reference(creation), decision: 'confirm' }), AuthorizationAccessError);
    const results = await Promise.all([decide(creation), decide(creation)]);
    assert.deepEqual(results[0], results[1]); assert.equal(results[0].receipt?.kind, 'saved');
    if (results[0].receipt?.kind !== 'saved') throw Error('Missing receipt'); sourceId = results[0].receipt.sourceId;
    assert.equal(Number((await db('captureSources').count('* as n').first())!.n), 1);
  });
  await check('suggestion confirmation preserves persisted draft; saving requires a distinct reviewed proposal', async () => {
    const base = await snapshot(sourceId), fields = base.configuration.fields!.map(field => field.key === 'details' ? { ...field, label: 'Describe the repair' } : field);
    const proposed = await prepare({ operation: 'suggest_website_fields', fields, contactRequired: true }, base);
    const applied = await decide(proposed); assert.equal(applied.receipt?.kind, 'suggestions');
    assert.deepEqual((await snapshot(sourceId)).configuration, base.configuration);
    const saved = await prepare({ operation: 'save_draft' }, { ...base, configuration: proposed.review.configuration });
    const receipt = await decide(saved); assert.equal(receipt.receipt?.kind, 'saved');
    assert.deepEqual((await snapshot(sourceId)).configuration, proposed.review.configuration);
    await assert.rejects(readCaptureSetupProposal(runtime, identity, permissionIds, reference(proposed)), CaptureDraftConflictError);
  });
  await check('source updates require read/update rather than an unrelated create grant', async () => {
    const base = await snapshot(sourceId), enabled = permissionIds.filter(id => id !== 'leadCapture.create'), id = await turn(base);
    const proposal = await proposeCaptureSetup(runtime, identity, enabled, id, { ...empty, operation: 'save_draft' }, signal);
    await db('chatTurns').where({ id }).update({ state: 'completed' });
    const saved = await decideCaptureSetupProposal(runtime, identity, enabled, { ...reference(proposal), decision: 'confirm' }); assert.equal(saved.receipt?.kind, 'saved');
  });
  await check('permission revocation, forged hashes, active generation, cancellation and supersession cannot commit', async () => {
    const base = await snapshot(sourceId), workflow = { assignment: { kind: 'default' as const }, stage: 'contacted' as const, tags: ['Reviewed'], notifyAssigned: false };
    const proposed = await prepare({ operation: 'suggest_workflow', workflow }, base);
    await assert.rejects(decideCaptureSetupProposal(runtime, identity, permissionIds.filter(id => id !== 'leadCapture.update'), { ...reference(proposed), decision: 'confirm' }), AuthorizationAccessError);
    await assert.rejects(readCaptureSetupProposal(runtime, identity, permissionIds, { ...reference(proposed), inputHash: 'b'.repeat(64) }), AuthorizationAccessError);
    const old = await db('chatCaptureSetupProposals').where({ id: proposed.ticket.proposalId }).first(); const next = await prepare({ operation: 'save_draft' }, base, old.threadId);
    assert.equal((await readCaptureSetupProposal(runtime, identity, permissionIds, reference(proposed))).ticket.state, 'superseded'); await assert.rejects(decide(proposed), CaptureDraftConflictError);
    const cancelled = await decide(next, 'cancel'); assert.equal(cancelled.ticket.state, 'cancelled'); assert.deepEqual(await decide(next, 'cancel'), cancelled); await assert.rejects(decide(next), CaptureDraftConflictError);
    const guarded = await prepare({ operation: 'save_draft' }, base), stored = await db('chatCaptureSetupProposals').where({ id: guarded.ticket.proposalId }).first(); const active = await turn(undefined, stored.threadId);
    await assert.rejects(decide(guarded), CaptureDraftConflictError); await db('chatTurns').where({ id: active }).update({ state: 'cancelled' });
    await saveCaptureDraft(runtime, identity, permissionIds, { workspaceId: identity.workspaceId, sourceId, expectedVersion: base.sourceVersion, expectedDraftVersion: base.draftVersion, requestId: randomUUID(), name: base.name, configuration: base.configuration });
    await assert.rejects(decide(guarded), CaptureDraftConflictError);
  });
  await check('expired proposals and changed unsaved bases cannot be reused', async () => {
    const base = await snapshot(sourceId), proposed = await prepare({ operation: 'save_draft' }, base);
    const row = await db('chatCaptureSetupProposals').where({ id: proposed.ticket.proposalId }).first();
    row.payload.view.ticket.createdAt = new Date(Date.now() - 900000).toISOString();
    row.payload.view.ticket.expiresAt = new Date(Date.now() - 1000).toISOString();
    row.payload.view.ticket.inputHash = captureDraftFingerprint({ ticket: { ...row.payload.view.ticket, state: undefined, inputHash: undefined }, review: row.payload.view.review, authority: row.payload.authority, input: row.payload.input, turnId: row.payload.turnId, threadId: row.payload.threadId, manual: row.payload.manual });
    await db('chatCaptureSetupProposals').where({ id: row.id }).update({ payload: JSON.stringify(row.payload) });
    const expired = { ...proposed, ticket: row.payload.view.ticket };
    assert.equal((await readCaptureSetupProposal(runtime, identity, permissionIds, reference(expired))).ticket.state, 'expired'); await assert.rejects(decide(expired), CaptureDraftConflictError);
    const id = await turn({ ...base, draftVersion: base.draftVersion + 1 });
    await assert.rejects(proposeCaptureSetup(runtime, identity, permissionIds, id, { ...empty, operation: 'save_draft' }, signal), CaptureDraftConflictError); await db('chatTurns').where({ id }).update({ state: 'failed' });
  });
  await check('confirmed revision copies approved configuration into a distinct draft without changing the publication', async () => {
    const configuration = initialCaptureSetupConfiguration('website', { businessName: 'Fictional revision', businessEmail: '', businessPhone: '' });
    const saved = await createCaptureDraft(runtime, identity, permissionIds, { workspaceId: identity.workspaceId, requestId: randomUUID(), name: 'Fictional approved source', configuration });
    const authority = { websiteReady: async () => true, gmailReady: async () => false };
    const review = await readCapturePublicationReview(runtime, identity, permissionIds, { workspaceId: identity.workspaceId, sourceId: saved.sourceId }, authority);
    // Baseline publication is a local fixture made by the canonical manual service, never an assistant tool.
    await publishCaptureDraft(runtime, identity, permissionIds, { workspaceId: identity.workspaceId, sourceId: saved.sourceId, expectedVersion: review.sourceVersion, draftVersion: review.draftVersion, baseApprovedVersion: review.baseApprovedVersion, configurationVersion: review.configurationVersion, confirmed: true, requestId: randomUUID(), timing: { kind: 'now' } }, authority);
    const baseline = await db('capturePublications').where({ sourceId: saved.sourceId }).first();
    const proposal = await prepare({ operation: 'begin_revision', sourceId: saved.sourceId }); const confirmed = await decide(proposal);
    assert.equal(confirmed.receipt?.kind, 'saved'); assert.deepEqual((await snapshot(saved.sourceId)).configuration, configuration);
    assert.deepEqual(await db('capturePublications').where({ sourceId: saved.sourceId }).first(), baseline); assert.deepEqual(await decide(proposal), confirmed);
  });
  await check('pasted sample extraction, explicit corrections and approval remain separate from Gmail provider authority', async () => {
    const gmail = await createCaptureDraft(runtime, identity, permissionIds, { workspaceId: identity.workspaceId, requestId: randomUUID(), name: 'Fictional pasted sample', configuration: { schemaVersion: 1, type: 'gmail' } });
    const base = await snapshot(gmail.sourceId); base.sample = { id: randomUUID(), version: 1, subject: 'Repair request', body: 'Name: Jordan Example\nEmail: jordan@example.test\nService: Tap repair' };
    const defaults = initialCaptureSetupConfiguration('website', { businessName: 'Fictional', businessEmail: '', businessPhone: '' });
    const fields = defaults.fields!.filter(field => ['name', 'email', 'service'].includes(field.key));
    const findings = fields.map(field => { const value = field.key === 'name' ? 'Jordan Example' : field.key === 'email' ? 'jordan@example.test' : 'Tap repair'; return { id: `finding-${field.id}`, fieldId: field.id, included: true, required: field.required, confidence: 'found' as const, sampleValue: value, suggestedValue: value, instruction: `Read the ${field.label} label`, evidence: { source: 'body' as const, text: base.sample!.body.split('\n').find(line => line.includes(value))! } }; });
    const input = { operation: 'extract_sample' as const, fields, contactRequired: true, rules: { phrases: ['Repair request'], location: 'subject' as const, mode: 'all' as const }, mappings: findings.map(row => ({ fieldId: row.fieldId, instruction: row.instruction })), findings };
    await assert.rejects(prepare({ ...input, findings: findings.map(row => ({ ...row, suggestedValue: 'Invented', sampleValue: 'Invented' })) }, base), CaptureDraftValidationError);
    // Failed model generation must be terminal before a fresh proposal can be confirmed.
    await db('chatTurns').where({ state: 'running' }).update({ state: 'failed' });
    const extraction = await prepare(input, base); await decide(extraction);
    const extracted = { ...base, configuration: extraction.review.configuration, findings };
    const manual = { workspaceId: identity.workspaceId, originProposalId: extraction.ticket.proposalId, requestId: randomUUID(), setup: { ...extracted, findings: findings.map(row => row.fieldId === 'name' ? { ...row, sampleValue: 'Jordan Corrected' } : row) } };
    const approval = await prepareCaptureSetupSampleApproval(runtime, identity, permissionIds, manual);
    const approved = await decide(approval); assert.equal(approved.receipt?.kind, 'suggestions'); if (approved.receipt?.kind !== 'suggestions') throw Error('Missing sample receipt');
    assert.equal(approved.receipt.sampleApproved, true); const configuration = approved.receipt.configuration;
    await saveCaptureDraft(runtime, identity, permissionIds, { workspaceId: identity.workspaceId, sourceId: gmail.sourceId, requestId: randomUUID(), expectedVersion: 1, expectedDraftVersion: 1, name: base.name, configuration });
    assert.equal((await snapshot(gmail.sourceId)).configuration.type, 'gmail');
    assert.equal(Number((await db('captureSourceSamples').count('* as n').first())!.n), 0); assert.equal((configuration as { connectionId?: string }).connectionId, undefined);
    assert.equal((await db('captureSetupSamples').first()).findings[0].sampleValue, 'Jordan Corrected');
    assert.ok(captureSetupFindingIssues(configuration, base.sample, findings.map(row => ({ ...row, instruction: '' })), true).length);
    if (configuration.type !== 'gmail') throw Error('Expected Gmail configuration');
    const forged: CaptureDraftConfiguration = { ...configuration, sampleId: randomUUID() };
    const current = await snapshot(gmail.sourceId); await assert.rejects(saveCaptureDraft(runtime, identity, permissionIds, { workspaceId: identity.workspaceId, sourceId: gmail.sourceId, requestId: randomUUID(), expectedVersion: current.sourceVersion, expectedDraftVersion: current.draftVersion, name: base.name, configuration: forged }), CaptureDraftValidationError);
  });
  await check('audit and retained setup samples survive private transcript deletion without publication, email or lead side effects', async () => {
    const audit = await db('chatCaptureSetupAudit').first(); await assert.rejects(runtime('chatCaptureSetupAudit').where({ id: audit.id }).update({ action: 'forged' })); await assert.rejects(runtime('chatCaptureSetupAudit').where({ id: audit.id }).delete());
    await db('chatThreads').where(identity).delete();
    assert.equal(Number((await db('chatCaptureSetupProposals').count('* as n').first())!.n), 0); assert.ok(Number((await db('chatCaptureSetupAudit').count('* as n').first())!.n) > 0); assert.equal(Number((await db('captureSetupSamples').count('* as n').first())!.n), 1);
    assert.equal(Number((await db('capturePublications').count('* as n').first())!.n), 1);
    for (const table of ['captureReceipts', 'leads']) assert.equal(Number((await db(table).count('* as n').first())!.n), 0);
  });
  await check('connected Gmail approval retains verified provenance and exact saved-draft bindings without enabling delivery', async () => {
    const accountId = randomUUID(), email = 'verified@example.test';
    await runtime('captureGmailAccounts').insert({ id: accountId, workspaceId: identity.workspaceId, providerSubject: 'fictional-provider', email, status: 'connected', version: 1, credentialGeneration: 1 });
    const created = await createCaptureDraft(runtime, identity, permissionIds, { workspaceId: identity.workspaceId, requestId: randomUUID(), name: 'Verified Gmail sample', configuration: initialCaptureSetupConfiguration('gmail', { businessName: 'Fixture', businessEmail: '', businessPhone: '' }) });
    const initial = await snapshot(created.sourceId);
    await runtime('captureSourceDrafts').where({ sourceId: created.sourceId }).update({ configuration: JSON.stringify({ ...initial.configuration, connectionId: accountId, accountEmail: email }) });
    const base = await snapshot(created.sourceId), retrievalId = randomUUID();
    base.sample = { id: randomUUID(), version: 1, subject: 'Repair request', body: 'Name: Jordan Example\nEmail: jordan@example.test\nService: Tap repair', retrievalId };
    const draft = await runtime('captureSourceDrafts').where({ sourceId: created.sourceId }).first();
    await runtime('captureGmailSamplePreviews').insert({ id: retrievalId, workspaceId: identity.workspaceId, sourceId: created.sourceId, sourceVersion: base.sourceVersion, draftId: draft.id, draftVersion: draft.version, accountId, credentialGeneration: 1, actorId: identity.userId, configurationHash: captureDraftFingerprint(draft.configuration), contentHash: captureDraftFingerprint({ subject: base.sample.subject, body: base.sample.body }), messageId: 'fictional-message', sender: 'Jordan <jordan@example.test>', receivedAt: new Date(), expiresAt: new Date(Date.now() + 900000) });
    const defaults = initialCaptureSetupConfiguration('website', { businessName: 'Fixture', businessEmail: '', businessPhone: '' });
    const fields = defaults.fields!.filter(field => ['name', 'email', 'service'].includes(field.key));
    const findings = fields.map(field => { const value = field.key === 'name' ? 'Jordan Example' : field.key === 'email' ? 'jordan@example.test' : 'Tap repair'; return { id: `finding-${field.id}`, fieldId: field.id, included: true, required: field.required, confidence: 'found' as const, sampleValue: value, suggestedValue: value, instruction: `Read ${field.label}`, evidence: { source: 'body' as const, text: base.sample!.body.split('\n').find(line => line.includes(value))! } }; });
    const extraction = await prepare({ operation: 'extract_sample', fields, contactRequired: true, rules: { phrases: ['Repair request'], location: 'subject', mode: 'all' }, mappings: findings.map(row => ({ fieldId: row.fieldId, instruction: row.instruction })), findings }, base);
    await decide(extraction);
    const setup = { ...base, configuration: extraction.review.configuration, findings };
    const manual = { workspaceId: identity.workspaceId, originProposalId: extraction.ticket.proposalId, requestId: randomUUID(), setup };
    await assert.rejects(prepareCaptureSetupSampleApproval(runtime, identity, permissionIds, { ...manual, requestId: randomUUID(), setup: { ...setup, sample: { ...base.sample, body: 'Edited evidence' } } }), CaptureDraftConflictError);
    const review = await prepareCaptureSetupSampleApproval(runtime, identity, permissionIds, manual);
    const confirmed = await decide(review); assert.deepEqual(await decide(review), confirmed);
    if (confirmed.receipt?.kind !== 'suggestions' || confirmed.receipt.configuration.type !== 'gmail') throw Error('Expected Gmail approval');
    const configuration = confirmed.receipt.configuration;
    const retained = await runtime('captureSourceSamples').where({ id: configuration.sampleId }).first();
    assert.equal(retained.evidence.from, 'Jordan <jordan@example.test>');
    assert.equal((await runtime('captureGmailSampleBindings').where({ sampleId: retained.id }).first()).provenance.kind, 'gmail');
    const save = async (config: CaptureDraftConfiguration) => { const current = await snapshot(created.sourceId); return saveCaptureDraft(runtime, identity, permissionIds, { workspaceId: identity.workspaceId, sourceId: created.sourceId, expectedVersion: current.sourceVersion, expectedDraftVersion: current.draftVersion, name: current.name, configuration: config, requestId: randomUUID() }); };
    const sampleReady = async () => (await readCapturePublicationReview(runtime, identity, permissionIds, { workspaceId: identity.workspaceId, sourceId: created.sourceId })).checks.find(row => row.code === 'sample')!.ready;
    await save(configuration); assert.equal(await sampleReady(), true);
    await save({ ...configuration, workflow: { ...configuration.workflow!, tags: ['reviewed'] } }); assert.equal(await sampleReady(), true);
    // Stable account reconnect retains reviewed evidence; a material edit must never recover it by undo alone.
    await runtime('captureGmailAccounts').where({ id: accountId }).update({ credentialGeneration: 2, version: 2 }); assert.equal(await sampleReady(), true);
    await save({ ...configuration, rules: { ...configuration.rules!, phrases: ['different'] } }); assert.equal(await sampleReady(), false);
    await save(configuration); assert.equal(await sampleReady(), false);
    assert.equal((await readCapturePublicationReview(runtime, identity, permissionIds, { workspaceId: identity.workspaceId, sourceId: created.sourceId })).ready, false);
    await assert.rejects(runtime('captureGmailSampleBindings').where({ sampleId: retained.id }).update({ bindingHash: '0'.repeat(64) }));
    await assert.rejects(runtime('captureGmailSamplePreviews').where({ id: retrievalId }).update({ contentHash: '0'.repeat(64) }));
    for (const bad of ['missing', 'expired', 'actor', 'generation', 'content'] as const) {
      const current = await snapshot(created.sourceId), proofId = randomUUID();
      current.sample = { ...base.sample!, id: randomUUID(), retrievalId: proofId };
      const liveDraft = await runtime('captureSourceDrafts').where({ sourceId: created.sourceId }).first();
      if (bad !== 'missing') await runtime('captureGmailSamplePreviews').insert({ id: proofId, workspaceId: identity.workspaceId, sourceId: created.sourceId, sourceVersion: current.sourceVersion, draftId: liveDraft.id, draftVersion: liveDraft.version, accountId, credentialGeneration: bad === 'generation' ? 1 : 2, actorId: bad === 'actor' ? stranger.userId : identity.userId, configurationHash: captureDraftFingerprint(current.configuration), contentHash: bad === 'content' ? '0'.repeat(64) : captureDraftFingerprint({ subject: current.sample.subject, body: current.sample.body }), messageId: 'fictional-message', sender: 'Jordan <jordan@example.test>', receivedAt: new Date(), expiresAt: new Date(Date.now() + (bad === 'expired' ? -10000 : 900000)) });
      const extracted = await prepare({ operation: 'extract_sample', fields, contactRequired: true, rules: { phrases: ['Repair request'], location: 'subject', mode: 'all' }, mappings: findings.map(row => ({ fieldId: row.fieldId, instruction: row.instruction })), findings }, current);
      await decide(extracted);
      const invalid = await prepareCaptureSetupSampleApproval(runtime, identity, permissionIds, { workspaceId: identity.workspaceId, originProposalId: extracted.ticket.proposalId, requestId: randomUUID(), setup: { ...current, configuration: extracted.review.configuration, findings } });
      await assert.rejects(decide(invalid), CaptureDraftConflictError);
    }
    // An explicit fresh pasted review may recover readiness, but must not claim Gmail retrieval.
    const pasted = await snapshot(created.sourceId); pasted.sample = { id: randomUUID(), version: 1, subject: base.sample!.subject, body: base.sample!.body };
    const freshExtraction = await prepare({ operation: 'extract_sample', fields, contactRequired: true, rules: { phrases: ['Repair request'], location: 'subject', mode: 'all' }, mappings: findings.map(row => ({ fieldId: row.fieldId, instruction: row.instruction })), findings }, pasted); await decide(freshExtraction);
    const pastedApproval = await prepareCaptureSetupSampleApproval(runtime, identity, permissionIds, { workspaceId: identity.workspaceId, originProposalId: freshExtraction.ticket.proposalId, requestId: randomUUID(), setup: { ...pasted, configuration: freshExtraction.review.configuration, findings } });
    const pastedConfirmed = await decide(pastedApproval); if (pastedConfirmed.receipt?.kind !== 'suggestions') throw Error('Expected pasted receipt');
    await save(pastedConfirmed.receipt.configuration); assert.equal(await sampleReady(), true);
    assert.equal((await runtime('captureGmailSampleBindings').where({ sampleId: pastedApproval.ticket.proposalId }).first()).provenance.kind, 'pasted');
    await assert.rejects(db.migrate.down({ directory: fileURLToPath(new URL('../migrations', import.meta.url)), loadExtensions: ['.ts'], name: '202611050004_capture_gmail_samples.ts' }), /Retained Gmail sample proof/);
    for (const table of ['captureReceipts', 'intakeItems', 'leads']) assert.equal(Number((await runtime(table).count('* as n').first())!.n), 0);
  });
  console.log(`PASS ${checks} capture setup runtime-role database groups`);
} finally { await Promise.all([runtime.destroy(), db.destroy()]); if (created) await owner.raw('DROP DATABASE ?? WITH (FORCE)', [name]); await owner.destroy(); }
