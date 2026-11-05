/** Real database transactions with a fictional provider; never connects to Google or uses the main DB. */
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { permissionIds, captureGmailSampleCandidatesSchema, captureGmailSelectedExampleSchema } from '@salesmora/contracts';
import { createDatabase } from '../database';
import { AuthorizationAccessError, initializeWorkspacePolicy } from '../authorization/store';
import { createCaptureDraft, CaptureDraftConflictError, saveCaptureDraft } from './store';
import { beginCaptureGmailConnection, completeCaptureGmailConnection, selectCaptureGmailAccount, reviewCaptureGmailDisconnect, disconnectCaptureGmail, gmailHash } from './gmail-connections';
import { createCaptureGmailCipher } from './gmail-credentials';
import { refreshCaptureGmailGrant } from './gmail-refresh';
import { readCaptureGmailExamples } from './gmail-samples';
import type { CaptureGmailMessagesProvider } from './gmail-messages-provider';
import { CaptureGmailProviderError, type CaptureGmailConfiguration, type CaptureGmailProvider, type VerifiedCaptureGmailGrant } from './gmail-provider';
process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') || !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw Error('A separate local test connection is required.');
const name = `gmail_connections_${randomUUID().replaceAll('-', '')}_test`, owner = createDatabase(connection), url = new URL(connection); url.pathname = `/${name}`;
const db = createDatabase(url.toString()), runtimeUrl = new URL(url); runtimeUrl.searchParams.set('options', '-c role=salesmora_web'); const web = createDatabase(runtimeUrl.toString());
const workerUrl = new URL(url); workerUrl.searchParams.set('options', '-c role=salesmora_worker'); const worker = createDatabase(workerUrl.toString());
const identity = { workspaceId: randomUUID(), userId: `gmail-${randomUUID()}` }, other = { workspaceId: randomUUID(), userId: `other-${randomUUID()}` };
const sessionId = randomUUID(), now = new Date();
const config: CaptureGmailConfiguration = { environment: 'local', origin: 'http://localhost:3000', redirectUri: 'http://localhost:3000/api/lead-capture/gmail/oauth/callback', clientId: 'fictional.apps.googleusercontent.com', clientSecret: 'fictional', workspaces: [identity.workspaceId, other.workspaceId], cipher: createCaptureGmailCipher({ CAPTURE_GMAIL_ACTIVE_KEY_ID: 'test', CAPTURE_GMAIL_CREDENTIAL_KEYS: JSON.stringify({ test: randomBytes(32).toString('base64') }) }) };
const grants = (subject = 'account-a'): VerifiedCaptureGmailGrant => ({ subject, email: `${subject}@example.test`, tokens: { refreshToken: `fictional-${subject}`, accessToken: 'fictional-access', expiresAt: new Date(Date.now() + 3600000).toISOString(), tokenType: 'Bearer', scopes: ['openid', 'email', 'https://www.googleapis.com/auth/gmail.readonly'] } });
let grant = grants(), exchangeCalls = 0, exchangeHook: (() => Promise<void>) | undefined, refreshHook: (() => Promise<VerifiedCaptureGmailGrant>) | undefined;
const provider: CaptureGmailProvider = { authorizationUrl: (state, verifier) => `https://accounts.google.com/o/oauth2/v2/auth?state=${state}&challenge=${verifier.length}`, exchange: async () => { exchangeCalls++; await exchangeHook?.(); return grant; }, refresh: async () => refreshHook ? refreshHook() : grant };
let created = false, checks = 0;
async function check(label: string, run: () => Promise<void>) { await run(); checks++; console.log(`PASS ${label}`); }
async function source() { return (await createCaptureDraft(web, identity, permissionIds, { workspaceId: identity.workspaceId, requestId: randomUUID(), name: 'Fictional Gmail setup', configuration: { schemaVersion: 1, type: 'gmail' } })).sourceId; }
async function input(sourceId: string) {
  const row = await web('captureSources').where({ id: sourceId }).first(), draft = await web('captureSourceDrafts').where({ id: row.draftId }).first();
  return { workspaceId: identity.workspaceId, sourceId, expectedVersion: row.version, expectedDraftVersion: draft.version, requestId: randomUUID(), reconnect: null };
}
async function start(sourceId: string, reconnect: { accountId: string; expectedAccountVersion: number } | null = null) {
  const command = { ...await input(sourceId), reconnect }, result = await beginCaptureGmailConnection(web, identity, permissionIds, sessionId, command, config, provider);
  return { command, result, state: new URL(result.authorizationUrl).searchParams.get('state')! };
}
async function finish(state: string, enabled = permissionIds) { return completeCaptureGmailConnection(web, identity.userId, enabled, sessionId, { state, code: 'fictional-code' }, config, provider); }
async function expire(accountId: string) {
  const row = await web('captureGmailCredentials').where({ accountId }).first();
  const binding = { environment: 'local' as const, workspaceId: identity.workspaceId, recordId: accountId };
  const tokens = config.cipher.openTokens(binding, row.envelope);
  await web('captureGmailCredentials').where({ accountId }).update({ envelope: JSON.stringify(config.cipher.sealTokens(binding, { ...tokens, expiresAt: '2020-01-01T00:00:00Z' })) });
}
try {
  await owner.raw('CREATE DATABASE ??', [name]); created = true;
  await db.migrate.latest({ directory: fileURLToPath(new URL('../migrations', import.meta.url)), loadExtensions: ['.ts'] });
  for (const person of [identity, other]) {
    await db('users').insert({ id: person.userId, name: 'Fictional Gmail owner', email: `${person.userId}@example.test`, createdAt: now, updatedAt: now, termsVersion: 'test', termsAcceptedAt: now });
    await db.transaction(async trx => {
      await trx('workspaces').insert({ id: person.workspaceId, ownerId: person.userId, businessName: 'Fictional Gmail workspace', businessType: 'test', postalCode: '', serviceRange: '', planOverride: 'standard', planOverrideEndsAt: new Date(Date.now() + 86400000), planOverrideReason: 'Fixture', planOverrideId: randomUUID() });
      await trx('workspaceMemberships').insert({ ...person, role: 'owner' }); await initializeWorkspacePolicy(trx, person);
    });
  }
  const session = { id: sessionId, userId: identity.userId, token: randomUUID(), expiresAt: new Date(Date.now() + 3600000), createdAt: now, updatedAt: now };
  await web('sessions').insert(session);
  const sourceA = await source(); let accountA: { id: string; version: number };
  await check('start binds session, versions and exact retry; wrong session and grants cannot exchange', async () => {
    const pending = await start(sourceA);
    assert.deepEqual(await beginCaptureGmailConnection(web, identity, permissionIds, sessionId, pending.command, config, provider), pending.result);
    await assert.rejects(completeCaptureGmailConnection(web, identity.userId, permissionIds, 'wrong-session', { state: pending.state, code: 'x' }, config, provider), AuthorizationAccessError);
    await assert.rejects(finish(pending.state, [] as unknown as typeof permissionIds), AuthorizationAccessError); assert.equal(exchangeCalls, 0);
    const results = await Promise.allSettled([finish(pending.state), finish(pending.state)]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1); assert.equal(exchangeCalls, 1);
    accountA = await web('captureGmailAccounts').where({ providerSubject: 'account-a' }).first();
    const saved = await web('captureSourceDrafts').where({ sourceId: sourceA }).first(); assert.equal(saved.configuration.connectionId, accountA.id); assert.equal(saved.version, 2);
    assert.equal((await web('captureReceipts')).length, 0); assert.equal((await web('leads')).length, 0);
  });
  await check('denial consumes intent without account/source changes; foreign workspace is denied', async () => {
    const id = await source(), pending = await start(id);
    const result = await completeCaptureGmailConnection(web, identity.userId, permissionIds, sessionId, { state: pending.state, denied: true }, config, provider); assert.equal(result.connected, false);
    assert.equal((await web('captureSources').where({ id }).first()).version, 1);
    await assert.rejects(beginCaptureGmailConnection(web, other, permissionIds, sessionId, { ...pending.command, workspaceId: other.workspaceId }, config, provider), AuthorizationAccessError);
  });
  await check('wrong-account reconnect fails and omitted refresh token preserves a valid same-account grant', async () => {
    const wrong = await start(sourceA, { accountId: accountA.id, expectedAccountVersion: accountA.version });
    grant = grants('account-b'); await assert.rejects(finish(wrong.state), CaptureDraftConflictError);
    assert.equal((await web('captureGmailAccounts')).length, 1);
    const reconnect = await start(sourceA, { accountId: accountA.id, expectedAccountVersion: accountA.version });
    const priorDraft = await web('captureSourceDrafts').where({ sourceId: sourceA }).first('version');
    grant = { ...grants(), tokens: { ...grants().tokens, refreshToken: null } }; await finish(reconnect.state);
    assert.equal((await web('captureSourceDrafts').where({ sourceId: sourceA }).first('version')).version, priorDraft.version);
    accountA = await web('captureGmailAccounts').where({ id: accountA.id }).first();
    const stored = await web('captureGmailCredentials').where({ accountId: accountA.id }).first();
    assert.equal(config.cipher.openTokens({ environment: 'local', workspaceId: identity.workspaceId, recordId: accountA.id }, stored.envelope).refreshToken, 'fictional-account-a');
  });
  await check('session revocation during provider exchange prevents the final connection commit', async () => {
    const id = await source(), pending = await start(id); grant = grants('never-saved');
    exchangeHook = async () => { await web('sessions').where({ id: sessionId }).delete(); };
    await assert.rejects(finish(pending.state), AuthorizationAccessError); exchangeHook = undefined;
    assert.equal(await web('captureGmailAccounts').where({ providerSubject: 'never-saved' }).first(), undefined);
    await web('sessions').insert(session);
    const stale = await start(id);
    const { reconnect: unused, ...savedInput } = await input(id); void unused;
    await saveCaptureDraft(web, identity, permissionIds, { ...savedInput, name: 'Changed during OAuth', configuration: { schemaVersion: 1, type: 'gmail' } });
    await assert.rejects(finish(stale.state), CaptureDraftConflictError);
  });
  const sourceB = await source(); grant = grants('account-b'); await finish((await start(sourceB)).state);
  let accountB = await web('captureGmailAccounts').where({ providerSubject: 'account-b' }).first();
  await check('callback expiring during exchange cannot store a late grant', async () => {
    const id = await source(), pending = await start(id); grant = grants('expired-never-saved');
    await web('captureGmailOAuthAttempts').where({ stateHash: gmailHash(pending.state) }).update({ createdAt: new Date(Date.now() - 540000), expiresAt: new Date(Date.now() + 300) });
    exchangeHook = () => new Promise(resolve => setTimeout(resolve, 600));
    await assert.rejects(finish(pending.state), CaptureDraftConflictError); exchangeHook = undefined;
    assert.equal(await web('captureGmailAccounts').where({ providerSubject: 'expired-never-saved' }).first(), undefined);
  });
  await check('versioned account selection is retry safe and rejects browser authority substitution', async () => {
    const { reconnect: _reconnect, ...command } = await input(sourceA); void _reconnect;
    const selection = { ...command, accountId: accountB.id, expectedAccountVersion: accountB.version };
    const saved = await selectCaptureGmailAccount(web, identity, permissionIds, selection, config);
    assert.deepEqual(await selectCaptureGmailAccount(web, identity, permissionIds, selection, config), saved);
    await assert.rejects(selectCaptureGmailAccount(web, identity, permissionIds, { ...selection, expectedVersion: 100 }, config), CaptureDraftConflictError);
    await assert.rejects(selectCaptureGmailAccount(web, other, permissionIds, { ...selection, workspaceId: other.workspaceId }, config), AuthorizationAccessError);
  });
  await check('worker refresh commits encrypted tokens once and reuses a fresh cached grant', async () => {
    await expire(accountA.id); grant = grants('account-a');
    const refreshed = await refreshCaptureGmailGrant(worker, identity.workspaceId, accountA.id, config, provider);
    const stored = await web('captureGmailCredentials').where({ accountId: accountA.id }).first();
    assert.equal(stored.refreshLeaseId, null);
    assert.equal(config.cipher.openTokens({ environment: 'local', workspaceId: identity.workspaceId, recordId: accountA.id }, stored.envelope).expiresAt, refreshed.expiresAt);
    refreshHook = async () => { throw Error('A fresh cached grant must not call Google.'); };
    assert.deepEqual(await refreshCaptureGmailGrant(worker, identity.workspaceId, accountA.id, config, provider), refreshed); refreshHook = undefined;
  });
  await check('temporary refresh failure preserves the connection; permanent loss commits reconnect-required', async () => {
    await expire(accountB.id);
    refreshHook = async () => { throw new CaptureGmailProviderError('temporary'); };
    await assert.rejects(refreshCaptureGmailGrant(worker, identity.workspaceId, accountB.id, config, provider), CaptureGmailProviderError);
    assert.equal((await web('captureGmailAccounts').where({ id: accountB.id }).first()).status, 'connected');
    refreshHook = async () => { throw new CaptureGmailProviderError('authorization'); };
    await assert.rejects(refreshCaptureGmailGrant(worker, identity.workspaceId, accountB.id, config, provider), CaptureGmailProviderError);
    accountB = await web('captureGmailAccounts').where({ id: accountB.id }).first(); assert.equal(accountB.status, 'reconnect-required');
    assert.equal((await web('captureSources').where({ id: sourceB }).first()).block, 'connection');
    refreshHook = undefined; grant = grants('account-b'); await finish((await start(sourceB, { accountId: accountB.id, expectedAccountVersion: accountB.version })).state);
    accountB = await web('captureGmailAccounts').where({ id: accountB.id }).first();
  });
  await check('reviewed disconnect rechecks affected versions, survives downgrade and rejects edited retries', async () => {
    // A runs account A while its editable revision selects B. B itself runs account B.
    for (const [id, account] of [[sourceA, accountA], [sourceB, accountB]] as const) {
      await web('captureSourceVersions').insert({ id: randomUUID(), workspaceId: identity.workspaceId, sourceId: id, sourceType: 'gmail', configurationVersion: 1, definitionVersion: 1, workflowVersion: 1, configuration: JSON.stringify({ schemaVersion: 1, type: 'gmail', connectionId: account.id }), approvedBy: identity.userId, approvedAt: now });
      await web('captureSources').where({ id }).update({ status: 'active', block: 'none', approvedVersion: 1 });
      await web('captureSourceDrafts').where({ sourceId: id }).update({ baseApprovedVersion: 1 });
      await web('captureGmailEligibilityWindows').insert({ id: randomUUID(), workspaceId: identity.workspaceId, sourceId: id, accountId: account.id, configurationVersion: 1, startHistoryId: '1', startedAt: new Date() });
    }
    const transitionId = randomUUID();
    await web('captureSourceVersions').insert({ id: randomUUID(), workspaceId: identity.workspaceId, sourceId: sourceB, sourceType: 'gmail', configurationVersion: 2, definitionVersion: 1, workflowVersion: 1, configuration: JSON.stringify({ schemaVersion: 1, type: 'gmail', connectionId: accountB.id }), approvedBy: identity.userId, approvedAt: now });
    await web('capturePublicationTransitions').insert({ id: transitionId, workspaceId: identity.workspaceId, sourceId: sourceB, configurationVersion: 2, baseApprovedVersion: 1, approvedSourceVersion: 1, approvedDraftVersion: 1, actorId: identity.userId, scheduledAt: new Date(Date.now() + 3600000), timezone: 'UTC' });
    const oldReview = await reviewCaptureGmailDisconnect(web, identity, permissionIds, { workspaceId: identity.workspaceId, accountId: accountB.id }, config);
    await web('captureSources').where({ id: sourceB }).increment('version', 1);
    const command = { workspaceId: identity.workspaceId, accountId: accountB.id, expectedAccountVersion: accountB.version, requestId: randomUUID(), reviewId: oldReview.reviewId, confirmed: true };
    await assert.rejects(disconnectCaptureGmail(web, identity, permissionIds, command, config), CaptureDraftConflictError);
    const review = await reviewCaptureGmailDisconnect(web, identity, permissionIds, { workspaceId: identity.workspaceId, accountId: accountB.id }, config); command.reviewId = review.reviewId;
    await db('workspaces').where({ id: identity.workspaceId }).update({ planOverride: null, planOverrideEndsAt: null, planOverrideReason: null, planOverrideId: null });
    const saved = await disconnectCaptureGmail(web, identity, permissionIds, command, config);
    assert.equal(saved.account.status, 'disconnected'); assert.equal(await web('captureGmailCredentials').where({ accountId: accountB.id }).first(), undefined);
    assert.equal((await web('captureSources').where({ id: sourceA }).first()).status, 'active');
    assert.equal((await web('captureSources').where({ id: sourceA }).first()).block, 'none');
    assert.equal((await web('captureGmailEligibilityWindows').where({ sourceId: sourceA }).first()).endedAt, null);
    assert.equal((await web('captureSources').where({ id: sourceB }).first()).status, 'paused');
    assert.ok((await web('captureGmailEligibilityWindows').where({ sourceId: sourceB }).first()).endedAt);
    assert.equal((await web('capturePublicationTransitions').where({ id: transitionId }).first()).state, 'cancelled');
    assert.deepEqual(await disconnectCaptureGmail(web, identity, permissionIds, command, config), saved);
    await assert.rejects(disconnectCaptureGmail(web, identity, permissionIds, { ...command, expectedAccountVersion: 999 }, config), CaptureDraftConflictError);
    await db('workspaces').where({ id: identity.workspaceId }).update({ planOverride: 'standard', planOverrideEndsAt: new Date(Date.now() + 86400000), planOverrideReason: 'Fixture', planOverrideId: randomUUID() });
  });
  await check('refresh lease excludes concurrent refresh and disconnect wins over late provider results', async () => {
    const id = await source(); grant = grants('account-c'); await finish((await start(id)).state);
    const account = await web('captureGmailAccounts').where({ providerSubject: 'account-c' }).first(); await expire(account.id);
    let release: ((grant: VerifiedCaptureGmailGrant) => void) | undefined, entered: (() => void) | undefined;
    const started = new Promise<void>(resolve => { entered = resolve; });
    refreshHook = () => new Promise(resolve => { release = resolve; entered?.(); });
    const refresh = refreshCaptureGmailGrant(worker, identity.workspaceId, account.id, config, provider); void refresh.catch(() => {}); await started;
    await assert.rejects(refreshCaptureGmailGrant(worker, identity.workspaceId, account.id, config, provider), CaptureGmailProviderError);
    const review = await reviewCaptureGmailDisconnect(web, identity, permissionIds, { workspaceId: identity.workspaceId, accountId: account.id }, config);
    await disconnectCaptureGmail(web, identity, permissionIds, { workspaceId: identity.workspaceId, accountId: account.id, expectedAccountVersion: account.version, requestId: randomUUID(), reviewId: review.reviewId, confirmed: true }, config);
    release?.(grants('account-c')); await assert.rejects(refresh, CaptureDraftConflictError); refreshHook = undefined;
    assert.equal(await web('captureGmailCredentials').where({ accountId: account.id }).first(), undefined);
  });
  {
    const sampleSource = await source(); grant = grants('sample-account'); await finish((await start(sampleSource)).state); grant = grants();
    let bodyReads = 0, listCalls = 0, duringRead: (() => Promise<void>) | undefined;
    const metadata = (id: string) => ({ id, internalDate: String(Date.now() - 10000), payload: { mimeType: 'text/plain', headers: [{ name: 'Subject', value: 'SALESMORA-FICTIONAL test request' }, { name: 'From', value: 'Alex <alex@example.test>' }] } });
    const messages: CaptureGmailMessagesProvider = { list: async () => { listCalls++; return ['message1']; }, metadata: async (_token, id) => metadata(id), message: async (_token, id) => { bodyReads++; await duringRead?.(); return { ...metadata(id), payload: { ...metadata(id).payload, body: { data: Buffer.from('Name: Alex\nEmail: alex@example.test').toString('base64url') } } }; } };
    const command = async () => { const value = await input(sampleSource); return { workspaceId: value.workspaceId, sourceId: value.sourceId, expectedVersion: value.expectedVersion, expectedDraftVersion: value.expectedDraftVersion }; };
    const searchExamples = async () => captureGmailSampleCandidatesSchema.parse(await readCaptureGmailExamples(web, identity, permissionIds, sessionId, { ...await command(), subjectPhrase: 'SALESMORA-FICTIONAL' }, config, provider, messages, 'search'));
    const previewExample = async (reference: string, session: string = sessionId, enabled = permissionIds) => readCaptureGmailExamples(web, identity, enabled, session, { ...await command(), reference }, config, provider, messages, 'preview');
    await check('Gmail sample search reads metadata only; explicit preview creates no intake, sample or lead', async () => {
      const candidates = await searchExamples(); assert.equal(candidates.candidates.length, 1); assert.equal(bodyReads, 0);
      assert.notEqual(candidates.candidates[0].id, 'message1');
      const preview = captureGmailSelectedExampleSchema.parse(await previewExample(candidates.candidates[0].id)); assert.equal(preview.body, 'Name: Alex\nEmail: alex@example.test'); assert.equal(bodyReads, 1);
      for (const table of ['captureSourceSamples', 'captureReceipts', 'intakeItems', 'leads']) assert.equal(Number((await web(table).count('* as n').first())!.n), 0);
    });
    await check('sample references reject wrong sessions, permissions, tampering and expiry before message access', async () => {
      const reference = (await searchExamples()).candidates[0].id, prior = bodyReads;
      await assert.rejects(previewExample(reference, 'wrong-session'), AuthorizationAccessError);
      await assert.rejects(previewExample(reference, sessionId, [] as unknown as typeof permissionIds), AuthorizationAccessError);
      await assert.rejects(previewExample(reference.slice(0, -5) + 'abcde'), CaptureDraftConflictError);
      const account = await web('captureGmailAccounts').where({ providerSubject: 'sample-account' }).first();
      const binding = { environment: 'local' as const, workspaceId: identity.workspaceId, recordId: account.id };
      const secret = config.cipher.openSample(binding, JSON.parse(Buffer.from(reference, 'base64url').toString('utf8')));
      const expired = Buffer.from(JSON.stringify(config.cipher.sealSample(binding, { ...secret, expiresAt: '2020-01-01T00:00:00Z' }))).toString('base64url');
      await assert.rejects(previewExample(expired), CaptureDraftConflictError); assert.equal(bodyReads, prior);
      const calls = listCalls;
      await assert.rejects(readCaptureGmailExamples(web, other, permissionIds, sessionId, { ...await command(), subjectPhrase: 'SALESMORA-FICTIONAL' }, config, provider, messages, 'search'), AuthorizationAccessError); assert.equal(listCalls, calls);
    });
    await check('changing a saved draft invalidates an existing Gmail candidate reference', async () => {
      const reference = (await searchExamples()).candidates[0].id, prior = bodyReads;
      await web('captureSourceDrafts').where({ sourceId: sampleSource }).increment('version', 1);
      await assert.rejects(previewExample(reference), CaptureDraftConflictError); assert.equal(bodyReads, prior);
    });
    await check('disconnect and session expiry during provider reads discard the body', async () => {
      let reference = (await searchExamples()).candidates[0].id;
      duringRead = async () => { await web('captureGmailAccounts').where({ providerSubject: 'sample-account' }).update({ status: 'disconnected' }); };
      await assert.rejects(previewExample(reference), CaptureGmailProviderError);
      await web('captureGmailAccounts').where({ providerSubject: 'sample-account' }).update({ status: 'connected' });
      duringRead = undefined; reference = (await searchExamples()).candidates[0].id;
      duringRead = async () => { await web('sessions').where({ id: sessionId }).update({ expiresAt: new Date('2020-01-01') }); };
      await assert.rejects(previewExample(reference), AuthorizationAccessError);
      await web('sessions').where({ id: sessionId }).update({ expiresAt: session.expiresAt }); duringRead = undefined;
    });
    await check('temporary message outages preserve account health; authorization loss requires reconnect and is audited', async () => {
      const reference = (await searchExamples()).candidates[0].id;
      duringRead = async () => { throw new CaptureGmailProviderError('temporary'); };
      await assert.rejects(previewExample(reference), CaptureGmailProviderError);
      assert.equal((await web('captureGmailAccounts').where({ providerSubject: 'sample-account' }).first()).status, 'connected');
      duringRead = async () => { throw new CaptureGmailProviderError('authorization'); };
      await assert.rejects(previewExample(reference), CaptureGmailProviderError); duringRead = undefined;
      const account = await web('captureGmailAccounts').where({ providerSubject: 'sample-account' }).first();
      assert.equal(account.status, 'reconnect-required');
      assert.ok(await web('captureGmailConnectionEvents').where({ accountId: account.id, kind: 'authorization-lost' }).first());
    });
  }
  console.log(`Gmail connection services passed (${checks} groups).`);
} finally {
  await Promise.all([web.destroy(), worker.destroy()]); await db.destroy(); if (created) await owner.raw('DROP DATABASE ??', [name]); await owner.destroy();
}
