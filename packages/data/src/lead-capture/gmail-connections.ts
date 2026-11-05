import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { captureGmailAccountSchema, captureGmailConnectSchema, captureGmailSelectAccountSchema, captureGmailSelectionSavedSchema, captureGmailDisconnectSchema, captureGmailDisconnectReviewQuerySchema, captureGmailDisconnectReviewSchema, captureGmailDisconnectSavedSchema, type AuthorizationContext, type PermissionId } from '@salesmora/contracts';
import { authorize } from '@salesmora/domain';
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';
import { workspaceEntitlements } from '../billing/entitlements';
import { CaptureDraftConflictError, CaptureDraftEntitlementError, CaptureDraftValidationError, captureDraftFingerprint } from './store';
import { captureGmailCapabilities } from './gmail-accounts';
import { restorePublicationDraft } from './restore-publication-draft';
import { CaptureGmailProviderError, type CaptureGmailConfiguration, type CaptureGmailProvider } from './gmail-provider';

export const gmailHash = (value: string) => createHash('sha256').update(value).digest('hex');
type Config = CaptureGmailConfiguration;
type Source = { id: string; workspaceId: string; version: number; draftId: string | null; approvedVersion: number | null; status: string; type: string; name: string };
type Draft = { id: string; workspaceId: string; sourceId: string; version: number; configuration: import('@salesmora/contracts').CaptureDraftConfiguration };
export async function gmailClock(trx: Knex) { return new Date((await trx.raw('SELECT clock_timestamp() AS now')).rows[0].now); }
export function gmailScope(config: Config, workspaceId: string) { if (!config.workspaces.includes(workspaceId)) throw new AuthorizationAccessError(); }
async function access(trx: Knex.Transaction, context: AuthorizationContext, operation: 'canConnect' | 'canSelect' | 'canDisconnect') {
  const eligible = (await workspaceEntitlements(trx, context.workspaceId)).plan.id !== 'free';
  const capabilities = captureGmailCapabilities(context, eligible);
  if (!capabilities.canRead || !captureGmailCapabilities(context, true)[operation]) throw new AuthorizationAccessError();
  if (!capabilities[operation]) throw new CaptureDraftEntitlementError();
}
function sourceAccess(context: AuthorizationContext, source: Source, pause = false) {
  const resource = { kind: 'capture_source' as const, workspaceId: context.workspaceId, id: source.id };
  for (const permission of ['leadCapture.update', ...(pause ? ['leadCapture.pause'] : [])] as PermissionId[]) {
    if (!authorize(context, { permission, resource }).allowed) throw new AuthorizationAccessError();
  }
}
async function draftFor(trx: Knex.Transaction, context: AuthorizationContext, input: { sourceId: string; expectedVersion: number; expectedDraftVersion: number }) {
  const source = await trx<Source>('captureSources').where({ workspaceId: context.workspaceId, id: input.sourceId, type: 'gmail' }).first();
  if (!source) throw new AuthorizationAccessError(); sourceAccess(context, source);
  const draft = source.draftId ? await trx<Draft>('captureSourceDrafts').where({ workspaceId: context.workspaceId, sourceId: source.id, id: source.draftId }).first() : undefined;
  if (source.status === 'archived' || !draft || source.version !== input.expectedVersion || draft.version !== input.expectedDraftVersion || draft.configuration.type !== 'gmail') throw new CaptureDraftConflictError();
  return { source, draft };
}
async function audit(trx: Knex.Transaction, workspaceId: string, accountId: string, accountVersion: number, kind: string, actorId: string | null, sourceId: string | null = null) {
  await trx('captureGmailConnectionEvents').insert({ id: randomUUID(), workspaceId, accountId, accountVersion, kind, actorId, sourceId });
}
async function bindAccount(trx: Knex.Transaction, context: AuthorizationContext, source: Source, draft: Draft, account: { id: string; email: string; version: number }) {
  if (draft.configuration.type !== 'gmail') throw new CaptureDraftConflictError();
  const configuration = { ...draft.configuration, connectionId: account.id, accountEmail: account.email };
  const changed = draft.configuration.connectionId !== account.id || draft.configuration.accountEmail !== account.email;
  if (changed) { delete configuration.sampleId; delete configuration.mappings; }
  const sourceVersion = source.version + 1, draftVersion = draft.version + (changed ? 1 : 0);
  if (changed) await trx('captureSourceDrafts').where({ workspaceId: context.workspaceId, id: draft.id }).update({ version: draftVersion, configuration: JSON.stringify(configuration), updatedAt: trx.fn.now() });
  await trx('captureSources').where({ workspaceId: context.workspaceId, id: source.id }).update({ version: sourceVersion, updatedAt: trx.fn.now() });
  await trx('captureSourceEvents').insert({ id: randomUUID(), workspaceId: context.workspaceId, sourceId: source.id, kind: 'draft.saved', actor: JSON.stringify({ kind: 'user', userId: context.userId }), data: JSON.stringify({ sourceVersion }) });
  await audit(trx, context.workspaceId, account.id, account.version, 'selected', context.userId, source.id);
  return captureGmailSelectionSavedSchema.parse({ ok: true, sourceId: source.id, sourceVersion, draftVersion });
}
function sessionBinding(sessionId: string, config: Config) { return gmailHash(JSON.stringify([sessionId, config.clientId, config.redirectUri, config.environment])); }
async function liveSession(trx: Knex.Transaction, userId: string, sessionId: string) {
  if (!await trx('sessions').where({ id: sessionId, userId }).where('expiresAt', '>', trx.fn.now()).forShare().first('id')) throw new AuthorizationAccessError();
}
export async function beginCaptureGmailConnection(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], sessionId: string, raw: unknown, config: Config, provider: CaptureGmailProvider) {
  const input = captureGmailConnectSchema.safeParse(raw); if (!input.success) throw new CaptureDraftValidationError();
  if (input.data.workspaceId !== identity.workspaceId || !sessionId) throw new AuthorizationAccessError(); gmailScope(config, identity.workspaceId);
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    await liveSession(trx, identity.userId, sessionId); await access(trx, context, 'canConnect'); await draftFor(trx, context, input.data);
    const now = await gmailClock(trx);
    await trx('captureGmailOAuthAttempts').where({ workspaceId: identity.workspaceId }).where('expiresAt', '<=', now).delete();
    const hash = captureDraftFingerprint(input.data), sessionHash = sessionBinding(sessionId, config);
    const existing = await trx('captureGmailOAuthAttempts').where({ workspaceId: identity.workspaceId, userId: identity.userId, requestId: input.data.requestId }).first();
    if (existing) {
      if (existing.inputHash !== hash || existing.sessionHash !== sessionHash || existing.state !== 'pending') throw new CaptureDraftConflictError();
      const secret = config.cipher.openOAuth({ environment: config.environment, workspaceId: identity.workspaceId, recordId: existing.id }, existing.envelope);
      if (!secret.stateToken) throw new CaptureDraftConflictError();
      return { authorizationUrl: provider.authorizationUrl(secret.stateToken, secret.pkceVerifier), expiresAt: existing.expiresAt.toISOString() };
    }
    if (input.data.reconnect) {
      const account = await trx('captureGmailAccounts').where({ workspaceId: identity.workspaceId, id: input.data.reconnect.accountId }).first('version');
      if (!account || account.version !== input.data.reconnect.expectedAccountVersion) throw new CaptureDraftConflictError();
    }
    const pending = await trx('captureGmailOAuthAttempts').where({ workspaceId: identity.workspaceId, userId: identity.userId, state: 'pending' }).count('* as n').first();
    if (Number(pending?.n) >= 10) throw new CaptureGmailProviderError('temporary');
    const id = randomUUID(), state = randomBytes(32).toString('base64url'), verifier = randomBytes(48).toString('base64url');
    const expiresAt = new Date(now.getTime() + 600000);
    await trx('captureGmailOAuthAttempts').insert({ id, workspaceId: identity.workspaceId, sourceId: input.data.sourceId, userId: identity.userId, requestId: input.data.requestId, inputHash: hash, stateHash: gmailHash(state), sessionHash, envelope: JSON.stringify(config.cipher.sealOAuth({ environment: config.environment, workspaceId: identity.workspaceId, recordId: id }, { pkceVerifier: verifier, stateToken: state })), expectedSourceVersion: input.data.expectedVersion, expectedDraftVersion: input.data.expectedDraftVersion, reconnectAccountId: input.data.reconnect?.accountId ?? null, expectedAccountVersion: input.data.reconnect?.expectedAccountVersion ?? null, createdAt: now, expiresAt });
    return { authorizationUrl: provider.authorizationUrl(state, verifier), expiresAt: expiresAt.toISOString() };
  });
}
/** Consume before any exchange; final commit independently rechecks all current authority/versions. */
export async function captureGmailCallbackSource(db: Knex, userId: string, enabled: readonly PermissionId[], sessionId: string, state: string, config: Config) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(state)) throw new AuthorizationAccessError();
  const row = await db('captureGmailOAuthAttempts').where({ userId, stateHash: gmailHash(state), sessionHash: sessionBinding(sessionId, config) }).first();
  if (!row) throw new AuthorizationAccessError(); gmailScope(config, row.workspaceId);
  return withWorkspaceAuthorization(db, { userId, workspaceId: row.workspaceId }, enabled, false, async (trx, context) => {
    await liveSession(trx, userId, sessionId);
    const source = await trx<Source>('captureSources').where({ workspaceId: row.workspaceId, id: row.sourceId }).first();
    if (!source || !captureGmailCapabilities(context, true).canRead) throw new AuthorizationAccessError(); sourceAccess(context, source);
    return { workspaceId: row.workspaceId, sourceId: row.sourceId };
  });
}
export async function completeCaptureGmailConnection(db: Knex, userId: string, enabled: readonly PermissionId[], sessionId: string, callback: { state: string; code?: string; denied?: boolean }, config: Config, provider: CaptureGmailProvider) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(callback.state) || !sessionId) throw new AuthorizationAccessError();
  const row = await db('captureGmailOAuthAttempts').where({ userId, sessionHash: sessionBinding(sessionId, config), stateHash: gmailHash(callback.state) }).first();
  if (!row) throw new AuthorizationAccessError(); gmailScope(config, row.workspaceId);
  const identity = { userId, workspaceId: row.workspaceId };
  const intent = { sourceId: row.sourceId, expectedVersion: row.expectedSourceVersion, expectedDraftVersion: row.expectedDraftVersion };
  await withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    await liveSession(trx, userId, sessionId); await access(trx, context, 'canConnect'); await draftFor(trx, context, intent);
    const now = await gmailClock(trx);
    const changed = await trx('captureGmailOAuthAttempts').where({ id: row.id, state: 'pending' }).where('expiresAt', '>', now).update({ state: callback.denied ? 'cancelled' : 'consumed', resolvedAt: now });
    if (changed !== 1) throw new CaptureDraftConflictError();
  });
  if (callback.denied) return { ...identity, sourceId: row.sourceId, connected: false };
  if (!callback.code || callback.code.length > 8192) throw new CaptureDraftValidationError();
  const secret = config.cipher.openOAuth({ environment: config.environment, workspaceId: row.workspaceId, recordId: row.id }, row.envelope);
  const grant = await provider.exchange(callback.code, secret.pkceVerifier, callback.state);
  if (!grant.subject || grant.subject.length > 255) throw new CaptureGmailProviderError('authorization');
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    await liveSession(trx, userId, sessionId); await access(trx, context, 'canConnect'); const { source, draft } = await draftFor(trx, context, intent);
    if (row.expiresAt <= await gmailClock(trx) || !await trx('captureGmailOAuthAttempts').where({ id: row.id, state: 'consumed' }).first('id')) throw new CaptureDraftConflictError();
    let account = await trx('captureGmailAccounts').where({ workspaceId: row.workspaceId, providerSubject: grant.subject }).first();
    if (row.reconnectAccountId && (account?.id !== row.reconnectAccountId || account?.version !== row.expectedAccountVersion)) throw new CaptureDraftConflictError();
    // Even a generic Connect intent created before a disconnect cannot resurrect that grant.
    if (account && await trx('captureGmailAccounts').where({ id: account.id, workspaceId: row.workspaceId }).where('updatedAt', '>', trx('captureGmailOAuthAttempts').select('createdAt').where({ id: row.id })).first('id')) throw new CaptureDraftConflictError();
    if (!account && Number((await trx('captureGmailAccounts').where({ workspaceId: row.workspaceId }).count('* as n').first())?.n) >= 100) throw new CaptureGmailProviderError('temporary');
    const id = account?.id ?? randomUUID(), old = account ? await trx('captureGmailCredentials').where({ workspaceId: row.workspaceId, accountId: id }).first() : undefined;
    const oldTokens = old && account.status === 'connected' ? config.cipher.openTokens({ environment: config.environment, workspaceId: row.workspaceId, recordId: id }, old.envelope) : undefined;
    const refreshToken = grant.tokens.refreshToken ?? oldTokens?.refreshToken;
    if (!refreshToken) throw new CaptureGmailProviderError('authorization');
    const version = (account?.version ?? 0) + 1, generation = (account?.credentialGeneration ?? 0) + 1;
    const safe = captureGmailAccountSchema.parse({ id, email: grant.email, status: 'connected', version });
    const values = { email: safe.email, status: safe.status, version, credentialGeneration: generation, connectedBy: userId, updatedAt: trx.fn.now() };
    if (account) await trx('captureGmailAccounts').where({ workspaceId: row.workspaceId, id }).update(values);
    else await trx('captureGmailAccounts').insert({ id, workspaceId: row.workspaceId, providerSubject: grant.subject, ...values });
    const envelope = config.cipher.sealTokens({ environment: config.environment, workspaceId: row.workspaceId, recordId: id }, { ...grant.tokens, refreshToken });
    await trx('captureGmailCredentials').insert({ id: old?.id ?? randomUUID(), workspaceId: row.workspaceId, accountId: id, generation, envelope: JSON.stringify(envelope) }).onConflict(['workspaceId', 'accountId']).merge({ generation, envelope: JSON.stringify(envelope), refreshLeaseId: null, refreshLeaseUntil: null, updatedAt: trx.fn.now() });
    await audit(trx, row.workspaceId, id, version, account ? 'reconnected' : 'connected', userId, source.id);
    account = { ...safe, credentialGeneration: generation };
    await bindAccount(trx, context, source, draft, account);
    return { ...identity, sourceId: source.id, connected: true };
  });
}
export async function selectCaptureGmailAccount(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown, config: Config) {
  const parsed = captureGmailSelectAccountSchema.safeParse(raw); if (!parsed.success) throw new CaptureDraftValidationError(); const input = parsed.data;
  if (identity.workspaceId !== input.workspaceId) throw new AuthorizationAccessError(); gmailScope(config, input.workspaceId);
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    await access(trx, context, 'canSelect');
    const source = await trx<Source>('captureSources').where({ id: input.sourceId, workspaceId: input.workspaceId }).first();
    if (!source) throw new AuthorizationAccessError(); sourceAccess(context, source);
    const account = await trx('captureGmailAccounts').where({ id: input.accountId, workspaceId: input.workspaceId, status: 'connected' }).first();
    if (!account || account.version !== input.expectedAccountVersion || !await trx('captureGmailCredentials').where({ accountId: account.id, workspaceId: input.workspaceId, generation: account.credentialGeneration }).first('id')) throw new CaptureDraftConflictError();
    const hash = captureDraftFingerprint(input), prior = await trx('captureOperations').where({ workspaceId: input.workspaceId, operation: 'gmail.select', requestId: input.requestId }).first();
    if (prior) {
      if (prior.actor.userId !== identity.userId || prior.inputHash !== hash || source.version !== prior.result.sourceVersion) throw new CaptureDraftConflictError();
      return captureGmailSelectionSavedSchema.parse({ ok: true, sourceId: source.id, sourceVersion: prior.result.sourceVersion, draftVersion: prior.result.draftVersion });
    }
    const snapshot = await draftFor(trx, context, input), saved = await bindAccount(trx, context, snapshot.source, snapshot.draft, account);
    await trx('captureOperations').insert({ id: randomUUID(), workspaceId: input.workspaceId, operation: 'gmail.select', requestId: input.requestId, inputHash: hash, actor: JSON.stringify({ kind: 'user', userId: identity.userId }), target: JSON.stringify({ sourceId: source.id }), result: JSON.stringify({ kind: 'draft', sourceId: saved.sourceId, sourceVersion: saved.sourceVersion, draftVersion: saved.draftVersion }) });
    return saved;
  });
}
export async function gmailDependents(trx: Knex.Transaction, workspaceId: string, accountId: string) {
  const rows = await trx<Source>('captureSources').where({ workspaceId, type: 'gmail' }).orderBy('id').limit(1001);
  if (rows.length > 1000) throw new CaptureGmailProviderError('temporary');
  const result = [];
  for (const source of rows) {
    const draft = source.draftId ? await trx('captureSourceDrafts').where({ workspaceId, id: source.draftId }).first('version', 'configuration') : null;
    const approved = source.approvedVersion ? await trx('captureSourceVersions').where({ workspaceId, sourceId: source.id, configurationVersion: source.approvedVersion }).first('configuration') : null;
    const pending = await trx('capturePublicationTransitions').where({ workspaceId, sourceId: source.id, state: 'pending' }).first('id', 'configurationVersion');
    const future = pending ? await trx('captureSourceVersions').where({ workspaceId, sourceId: source.id, configurationVersion: pending.configurationVersion }).first('configuration') : null;
    if ([draft, approved, future].some(item => item?.configuration.connectionId === accountId)) result.push({ source, draftVersion: draft?.version ?? null, pendingId: pending?.id ?? null, runsAccount: approved?.configuration.connectionId === accountId, pendingAccount: future?.configuration.connectionId === accountId });
  }
  return result;
}
export async function blockCaptureGmailSources(trx: Knex.Transaction, workspaceId: string, accountId: string, actorId: string | null) {
  const now = await gmailClock(trx), dependents = await gmailDependents(trx, workspaceId, accountId);
  for (const { source, runsAccount, pendingAccount } of dependents) {
    const pending = await trx('capturePublicationTransitions').where({ workspaceId, sourceId: source.id, state: 'pending' }).first();
    if (pending && (runsAccount || pendingAccount)) {
      await trx('capturePublicationTransitions').where({ id: pending.id }).update({ state: 'cancelled', completedAt: now });
      await restorePublicationDraft(trx, workspaceId, source.id, pending.configurationVersion);
      await trx('captureSourceEvents').insert({ id: randomUUID(), workspaceId, sourceId: source.id, kind: 'source.schedule_cancelled', actor: JSON.stringify(actorId ? { kind: 'user', userId: actorId } : { kind: 'service', service: 'gmail' }), data: JSON.stringify({ sourceVersion: source.version + 1, configurationVersion: pending.configurationVersion }) });
    }
    const blocksRuntime = runsAccount || pendingAccount || source.approvedVersion === null;
    const status = blocksRuntime && ['active', 'scheduled'].includes(source.status) ? 'paused' : source.status;
    await trx('captureSources').where({ workspaceId, id: source.id }).update({ version: source.version + 1, ...(blocksRuntime ? { status, block: 'connection', scheduledAt: null, timezone: null } : {}), updatedAt: now });
    await trx('captureSourceEvents').insert({ id: randomUUID(), workspaceId, sourceId: source.id, kind: blocksRuntime ? 'source.blocked' : 'draft.saved', actor: JSON.stringify(actorId ? { kind: 'user', userId: actorId } : { kind: 'service', service: 'gmail' }), data: JSON.stringify({ sourceVersion: source.version + 1, ...(blocksRuntime ? { block: 'connection', status } : {}) }) });
    await trx('captureGmailEligibilityWindows').where({ workspaceId, sourceId: source.id, accountId }).whereNull('endedAt').update({ endedAt: now });
    await trx('captureGmailMessageJobs').where({ workspaceId, sourceId: source.id, accountId }).whereIn('state', ['pending', 'processing', 'retry']).update({ state: 'ignored', leaseId: null, leaseUntil: null, failure: 'authorization' });
  }
  await trx('captureGmailMailboxState').where({ workspaceId, accountId }).update({ leaseId: null, leaseUntil: null, failure: 'authorization' });
}
export async function reviewCaptureGmailDisconnect(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown, config: Config) {
  const parsed = captureGmailDisconnectReviewQuerySchema.safeParse(raw); if (!parsed.success) throw new CaptureDraftValidationError(); const input = parsed.data;
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError(); gmailScope(config, input.workspaceId);
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    await access(trx, context, 'canDisconnect');
    const account = await trx('captureGmailAccounts').where({ workspaceId: input.workspaceId, id: input.accountId }).first(); if (!account) throw new AuthorizationAccessError();
    const dependents = await gmailDependents(trx, input.workspaceId, input.accountId); for (const { source } of dependents) sourceAccess(context, source, true);
    const now = await gmailClock(trx), id = randomUUID(), expiresAt = new Date(now.getTime() + 600000);
    const view = captureGmailDisconnectReviewSchema.parse({ account: captureGmailAccountSchema.parse({ id: account.id, email: account.email, status: account.status, version: account.version }), sources: dependents.map(({ source }) => ({ sourceId: source.id, sourceVersion: source.version, name: source.name })), reviewId: id, expiresAt: expiresAt.toISOString() });
    const stamp = dependents.map(({ source, draftVersion, pendingId }) => [source.id, source.version, draftVersion, pendingId]);
    const existing = await trx('captureGmailDisconnectReviews').where({ workspaceId: input.workspaceId, accountId: account.id, actorId: identity.userId, state: 'pending' }).where('expiresAt', '>', now).orderBy('createdAt', 'desc').first();
    if (existing && existing.payload.view.account.version === account.version && captureDraftFingerprint(existing.payload.stamp) === captureDraftFingerprint(stamp)) return captureGmailDisconnectReviewSchema.parse(existing.payload.view);
    await trx('captureGmailDisconnectReviews').insert({ id, workspaceId: input.workspaceId, accountId: account.id, actorId: identity.userId, payload: JSON.stringify({ view, stamp }), createdAt: now, expiresAt });
    return view;
  });
}
/** Local credential removal is authoritative. Provider-wide revoke is a separate, explicit Google action. */
export async function disconnectCaptureGmail(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown, config: Config) {
  const parsed = captureGmailDisconnectSchema.safeParse(raw); if (!parsed.success) throw new CaptureDraftValidationError(); const input = parsed.data;
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError(); gmailScope(config, input.workspaceId);
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    await access(trx, context, 'canDisconnect');
    const review = await trx('captureGmailDisconnectReviews').where({ id: input.reviewId, workspaceId: input.workspaceId, accountId: input.accountId, actorId: identity.userId }).first();
    const account = await trx('captureGmailAccounts').where({ workspaceId: input.workspaceId, id: input.accountId }).first();
    if (!review || !account) throw new AuthorizationAccessError();
    const dependents = await gmailDependents(trx, input.workspaceId, input.accountId); for (const { source } of dependents) sourceAccess(context, source, true);
    if (review.state === 'confirmed') {
      const stamp = dependents.map(({ source, draftVersion, pendingId }) => [source.id, source.version, draftVersion, pendingId]);
      if (review.requestId !== input.requestId || review.inputHash !== captureDraftFingerprint(input) || account.version !== review.receipt.account.version || account.status !== 'disconnected' || captureDraftFingerprint(stamp) !== captureDraftFingerprint(review.payload.confirmedStamp)) throw new CaptureDraftConflictError();
      return captureGmailDisconnectSavedSchema.parse(review.receipt);
    }
    if (account.status === 'disconnected') throw new CaptureDraftConflictError();
    const stamp = dependents.map(({ source, draftVersion, pendingId }) => [source.id, source.version, draftVersion, pendingId]);
    if (review.expiresAt <= await gmailClock(trx) || account.version !== input.expectedAccountVersion || account.version !== review.payload.view.account.version || captureDraftFingerprint(stamp) !== captureDraftFingerprint(review.payload.stamp)) throw new CaptureDraftConflictError();
    await trx('captureGmailCredentials').where({ workspaceId: input.workspaceId, accountId: account.id }).delete();
    await trx('captureGmailAccounts').where({ workspaceId: input.workspaceId, id: account.id }).update({ status: 'disconnected', version: account.version + 1, credentialGeneration: account.credentialGeneration + 1, updatedAt: trx.fn.now() });
    await trx('captureGmailOAuthAttempts').where({ workspaceId: input.workspaceId, reconnectAccountId: account.id, state: 'pending' }).update({ state: 'cancelled', resolvedAt: trx.fn.now() });
    await blockCaptureGmailSources(trx, input.workspaceId, account.id, identity.userId);
    const receipt = captureGmailDisconnectSavedSchema.parse({ ok: true, account: { id: account.id, email: account.email, status: 'disconnected', version: account.version + 1 } });
    const confirmedStamp = (await gmailDependents(trx, input.workspaceId, account.id)).map(({ source, draftVersion, pendingId }) => [source.id, source.version, draftVersion, pendingId]);
    await trx('captureGmailDisconnectReviews').where({ id: review.id }).update({ state: 'confirmed', receipt: JSON.stringify(receipt), requestId: input.requestId, inputHash: captureDraftFingerprint(input), payload: JSON.stringify({ ...review.payload, confirmedStamp }) });
    await audit(trx, input.workspaceId, account.id, account.version + 1, 'disconnected', identity.userId);
    return receipt;
  });
}
