import { captureChangePublicationSchema } from '@salesmora/contracts';
import { approvedGmailSampleReady } from './gmail-sample-approval';
import { randomBytes, randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { captureCancelPublicationSchema, captureConfigurationSchema, captureContentSchema, captureFieldsSchema, captureOperationResultSchema, capturePublicationResultSchema, capturePublicationReviewSchema, capturePublishCommandSchema, captureSourceDetailQuerySchema, type AuthorizationContext, type CaptureDraftConfiguration, type CaptureReadinessCode, type PermissionId } from '@salesmora/contracts';
import { AuthorizationAccessError, loadWorkspaceAuthorization, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';
import { captureDraftFingerprint } from './store';
import { resolveCaptureAssignment } from '../lead-assignment-settings/store';
import { restorePublicationDraft } from './restore-publication-draft';
import { notifyCaptureBlocked, captureCapacity, reconcileCaptureAccessInTransaction } from './capacity';
export class CapturePublicationError extends Error {
  constructor(readonly kind: 'conflict' | 'validation' | 'readiness', readonly failures: readonly CaptureReadinessCode[] = []) { super(kind === 'conflict' ? 'This setup changed. Reload and review the saved version.' : kind === 'readiness' ? 'Resolve the setup checks before publishing.' : 'Check the publication details and confirmation.'); }
}
type GmailBaseline = { accountId: string; generation: number; historyId: string };
type PreparedGmail = {
  workspaceId: string; sourceId: string; sourceVersion: number;
  configurationHash: string; expiresAt: number; baseline: GmailBaseline;
};
type GmailActivationTarget = {
  sourceId: string; expectedVersion: number;
  kind: 'draft' | 'approved' | 'transition';
  transitionId?: string;
  requestId?: string;
  operation: 'source.launch' | 'source.resume' | 'source.reschedule';
};
/** Internal server dependency; never deserialize this authority from a request or enable it via a client flag. */
export interface CaptureDeliveryAuthority {
  gmailBaseline?(db: Knex, workspaceId: string, accountId: string): Promise<string>;
  gmailOpen?(trx: Knex.Transaction, workspaceId: string, sourceId: string, baseline: GmailBaseline): Promise<void>;
  preparedGmail?: PreparedGmail;
  scheduledType?: 'gmail' | 'website';
  scheduledSourceIds?: readonly string[];
  websiteReady(trx: Knex.Transaction, workspaceId: string): Promise<boolean>;
  gmailReady(trx: Knex.Transaction, workspaceId: string, sourceId: string, configuration: CaptureDraftConfiguration): Promise<boolean>;
}
/** Real hosting and Gmail delivery are implemented in subsequent integration checkpoints. */
export const unavailableCaptureDelivery: CaptureDeliveryAuthority = Object.freeze({ websiteReady: async () => false, gmailReady: async () => false });
type Source = { id: string; workspaceId: string; type: 'website' | 'gmail'; status: string; version: number; approvedVersion: number | null; draftId: string | null; block: string };
type Draft = { workspaceId: string; sourceId: string; id: string; version: number; baseApprovedVersion: number | null; configuration: CaptureDraftConfiguration };
const resource = (source: Source) => ({ kind: 'capture_source' as const, workspaceId: source.workspaceId, id: source.id });
function read(context: AuthorizationContext) { if (!resolveAuthorizedCollectionScope(context, 'leadCapture.read').allowed) throw new AuthorizationAccessError(); }
function activate(context: AuthorizationContext, source: Source) { read(context); if (!authorize(context, { permission: 'leadCapture.activate', resource: resource(source) }).allowed) throw new AuthorizationAccessError(); }
async function sourceRow(trx: Knex.Transaction, workspaceId: string, sourceId: string, write = false): Promise<Source> {
  const query = trx<Source>('captureSources').where({ workspaceId, id: sourceId }); const source = await (write ? query.forUpdate() : query).first();
  if (!source) throw new AuthorizationAccessError(); return source;
}
/** Prepare only after a scoped read. The write repeats authorization and binds the exact saved revision. */
export async function prepareGmailActivation(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], target: GmailActivationTarget, authority: CaptureDeliveryAuthority): Promise<CaptureDeliveryAuthority> {
  if (!authority.gmailBaseline || db.isTransaction) return authority;
  const candidate = await withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const source = await sourceRow(trx, identity.workspaceId, target.sourceId);
    if (source.type !== 'gmail') return null;
    if (target.kind === 'approved') {
      read(context);
      if (!authorize(context, { permission: 'leadCapture.pause', resource: resource(source) }).allowed) throw new AuthorizationAccessError();
    } else activate(context, source);
    if (target.requestId && await trx('captureOperations').where({ workspaceId: identity.workspaceId, requestId: target.requestId, operation: target.operation }).first('id')) return null;
    if (source.version !== target.expectedVersion) throw new CapturePublicationError('conflict');
    const transition = target.kind === 'transition' ? await trx('capturePublicationTransitions')
      .where({ workspaceId: source.workspaceId, sourceId: source.id, id: target.transitionId, state: 'pending' }).first() : null;
    const configurationVersion = transition?.configurationVersion ?? source.approvedVersion;
    const saved = target.kind === 'draft'
      ? await trx('captureSourceDrafts').where({ workspaceId: source.workspaceId, sourceId: source.id, id: source.draftId }).first()
      : await trx('captureSourceVersions').where({ workspaceId: source.workspaceId, sourceId: source.id, configurationVersion }).first();
    const configuration = saved?.configuration as CaptureDraftConfiguration | undefined;
    if ((target.kind === 'transition' && !transition) || (target.kind === 'approved' && source.status !== 'paused') ||
      configuration?.type !== 'gmail' || !configuration.connectionId ||
      !await authority.gmailReady(trx, source.workspaceId, source.id, configuration))
      throw new CapturePublicationError('readiness', ['delivery']);
    const sample = target.kind === 'approved'
      ? await trx('captureSourceSamples').where({ workspaceId: source.workspaceId, sourceId: source.id, id: configuration.sampleId ?? null }).first('draftVersion')
      : undefined;
    const draftVersion = target.kind === 'draft' ? saved.version : transition?.approvedDraftVersion ?? sample?.draftVersion;
    if (!draftVersion || !await approvedGmailSampleReady(trx, source.workspaceId, source.id, configuration, draftVersion))
      throw new CapturePublicationError('readiness', ['sample']);
    const account = await trx('captureGmailAccounts').where({ workspaceId: source.workspaceId, id: configuration.connectionId, status: 'connected' }).first('credentialGeneration');
    if (!account) throw new CapturePublicationError('readiness', ['account']);
    return { workspaceId: source.workspaceId, sourceId: source.id, sourceVersion: source.version,
      configurationHash: captureDraftFingerprint(configuration), accountId: configuration.connectionId, generation: account.credentialGeneration as number };
  });
  if (!candidate) return authority;
  let historyId: string;
  const expiresAt = Date.now() + 60_000;
  try { historyId = await authority.gmailBaseline(db, candidate.workspaceId, candidate.accountId); }
  catch { throw new CapturePublicationError('readiness', ['delivery']); }
  if (!/^[0-9]{1,30}$/.test(historyId)) throw new CapturePublicationError('readiness', ['delivery']);
  const { accountId, generation, ...binding } = candidate;
  return { ...authority, preparedGmail: { ...binding, expiresAt, baseline: { accountId, generation, historyId } } };
}

export async function openPreparedGmail(trx: Knex.Transaction, source: Source, configuration: CaptureDraftConfiguration, authority: CaptureDeliveryAuthority) {
  if (source.type !== 'gmail' || !authority.gmailOpen) return;
  const prepared = authority.preparedGmail;
  if (!prepared || prepared.expiresAt <= Date.now() || prepared.workspaceId !== source.workspaceId ||
      prepared.sourceId !== source.id || prepared.sourceVersion !== source.version ||
      prepared.configurationHash !== captureDraftFingerprint(configuration))
    throw new CapturePublicationError('readiness', ['delivery']);
  try { await authority.gmailOpen(trx, source.workspaceId, source.id, prepared.baseline); }
  catch { throw new CapturePublicationError('readiness', ['delivery']); }
}

async function workflowReady(trx: Knex.Transaction, workspaceId: string, configuration: CaptureDraftConfiguration) {
  const assignment = configuration.workflow?.assignment;
  return !!assignment && (await resolveCaptureAssignment(trx, workspaceId, assignment)).ready;
}
export async function captureConfigurationChecks(trx: Knex.Transaction, source: Source, configuration: CaptureDraftConfiguration, draftVersion: number, authority: CaptureDeliveryAuthority) {
  const fields = configuration.fields ?? [], parsedFields = captureFieldsSchema.safeParse(fields);
  const fieldsReady = parsedFields.success && fields.length > 0 && ['name','service'].every(key => fields.some(field => field.key === key && field.required)) && fields.some(field => ['email','phone'].includes(field.key)) && fields.every(field => !!field.label && (!['dropdown','checkboxes'].includes(field.type) || field.options.length >= 2 && field.options.every(option => !!option.label)));
  let account = true, sample = true;
  const delivery = configuration.type === 'website' ? await authority.websiteReady(trx, source.workspaceId) : await authority.gmailReady(trx, source.workspaceId, source.id, configuration);
  if (configuration.type === 'gmail') {
    account = !!configuration.connectionId && !!configuration.accountEmail && !!await trx('captureGmailAccounts').where({ workspaceId: source.workspaceId, id: configuration.connectionId, email: configuration.accountEmail, status: 'connected' }).first('id');
    sample = await approvedGmailSampleReady(trx, source.workspaceId, source.id, configuration, draftVersion);
  }
  const content = configuration.type !== 'website' || captureContentSchema.safeParse(configuration.content).success;
  return [ { code: 'configuration', ready: captureConfigurationSchema.safeParse(configuration).success && content }, { code: 'fields', ready: fieldsReady }, { code: 'workflow', ready: await workflowReady(trx, source.workspaceId, configuration) }, { code: 'delivery', ready: delivery }, ...(configuration.type === 'gmail' ? [{ code: 'account', ready: account }, { code: 'sample', ready: sample }] : []) ] as { code: CaptureReadinessCode; ready: boolean }[];
}
export async function capturePublicationReviewInTransaction(trx: Knex.Transaction, context: AuthorizationContext, source: Source, authority = unavailableCaptureDelivery) {
  read(context);
  const draft = source.draftId ? await trx<Draft>('captureSourceDrafts').where({ workspaceId: source.workspaceId, sourceId: source.id, id: source.draftId }).first() : undefined;
  const pending = await trx('capturePublicationTransitions').where({ workspaceId: source.workspaceId, sourceId: source.id, state: 'pending' }).first();
  const latest = await trx('captureSourceVersions').where({ workspaceId: source.workspaceId, sourceId: source.id }).max('configurationVersion as version').first();
  const capacity = await captureCapacity(trx, source.workspaceId, source.id, source.type);
  const canActivate = authorize(context, { permission: 'leadCapture.activate', resource: resource(source) }).allowed;
  let pendingChecks: { code: CaptureReadinessCode; ready: boolean }[] | undefined;
  if (pending) {
    const target = await trx('captureSourceVersions').where({ workspaceId: source.workspaceId, sourceId: source.id, configurationVersion: pending.configurationVersion }).first('configuration');
    pendingChecks = target ? await captureConfigurationChecks(trx, source, target.configuration, pending.approvedDraftVersion, authority) : [{ code: 'configuration', ready: false }];
    pendingChecks.push({ code: 'access', ready: capacity.access }, { code: 'capacity', ready: capacity.ready }, { code: 'permission', ready: canActivate }, { code: 'workspace', ready: ['active', 'scheduled'].includes(source.status) && source.block === 'none' && source.approvedVersion === (source.status === 'scheduled' ? pending.configurationVersion : pending.baseApprovedVersion) && new Date(pending.scheduledAt) > capacity.now });
  }
  const checks: { code: CaptureReadinessCode; ready: boolean }[] = [ ...(draft ? await captureConfigurationChecks(trx, source, draft.configuration, draft.version, authority) : [{ code: 'configuration' as const, ready: false }]), { code: 'access', ready: capacity.access }, { code: 'capacity', ready: capacity.ready }, { code: 'permission', ready: canActivate }, { code: 'pending', ready: !pending }, { code: 'workspace', ready: source.status !== 'archived' && !!draft && draft.baseApprovedVersion === source.approvedVersion } ];
  return capturePublicationReviewSchema.parse({ sourceId: source.id, sourceVersion: source.version, draftVersion: draft?.version ?? null, baseApprovedVersion: draft?.baseApprovedVersion ?? source.approvedVersion, configurationVersion: Number(latest?.version ?? 0) + 1, canActivate, ready: checks.every(check => check.ready), plan: capacity.plan, used: capacity.used, limit: capacity.limit, checks, ...(pendingChecks ? { pendingChecks, pendingReady: pendingChecks.every(check => check.ready) } : {}), pending: pending ? { id: pending.id, configurationVersion: pending.configurationVersion, at: pending.scheduledAt.toISOString(), timezone: pending.timezone } : null });
}
export async function readCapturePublicationReview(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown, authority = unavailableCaptureDelivery) {
  const parsed = captureSourceDetailQuerySchema.safeParse(raw); if (!parsed.success) throw new CapturePublicationError('validation');
  if (parsed.data.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => capturePublicationReviewInTransaction(trx, context, await sourceRow(trx, identity.workspaceId, parsed.data.sourceId), authority));
}
async function publicationReplay(trx: Knex.Transaction, identity: WorkspaceIdentity, operation: string, requestId: string, hash: string) {
  const existing = await trx('captureOperations').where({ workspaceId: identity.workspaceId, operation, requestId }).first();
  if (!existing) return null;
  if (existing.inputHash !== hash || existing.actor.kind !== 'user' || existing.actor.userId !== identity.userId) throw new CapturePublicationError('conflict');
  const parsed = captureOperationResultSchema.parse(existing.result); if (parsed.kind !== 'publication') throw new CapturePublicationError('conflict');
  return capturePublicationResultSchema.parse({ ok: true, sourceId: parsed.sourceId, sourceVersion: parsed.sourceVersion, configurationVersion: parsed.configurationVersion, status: parsed.status, transitionId: parsed.transitionId });
}
async function receipt(trx: Knex.Transaction, identity: WorkspaceIdentity, operation: string, requestId: string, hash: string, result: ReturnType<typeof capturePublicationResultSchema.parse>) {
  const record = { sourceId: result.sourceId, sourceVersion: result.sourceVersion, configurationVersion: result.configurationVersion, status: result.status, transitionId: result.transitionId };
  await trx('captureOperations').insert({ id: randomUUID(), workspaceId: identity.workspaceId, operation, requestId, inputHash: hash, actor: JSON.stringify({ kind: 'user', userId: identity.userId }), target: JSON.stringify({ sourceId: result.sourceId }), result: JSON.stringify({ kind: 'publication', ...record }) });
  return result;
}
async function pointPublication(trx: Knex.Transaction, source: Source, configurationVersion: number) {
  if (source.type !== 'website') return;
  const existing = await trx('capturePublications').where({ workspaceId: source.workspaceId, sourceId: source.id }).first();
  if (existing) await trx('capturePublications').where({ workspaceId: source.workspaceId, id: existing.id }).update({ configurationVersion, version: existing.version + 1 });
  else await trx('capturePublications').insert({ id: randomUUID(), workspaceId: source.workspaceId, sourceId: source.id, sourceType: 'website', configurationVersion, version: 1, publicKey: randomBytes(32).toString('hex') });
}
async function event(trx: Knex.Transaction, source: Source, kind: string, actor: unknown, configurationVersion: number) {
  await trx('captureSourceEvents').insert({ id: randomUUID(), workspaceId: source.workspaceId, sourceId: source.id, kind, actor: JSON.stringify(actor), data: JSON.stringify({ sourceVersion: source.version, configurationVersion }) });
}
export async function publishCaptureDraft(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown, authority = unavailableCaptureDelivery) {
  const parsed = capturePublishCommandSchema.safeParse(raw); if (!parsed.success) throw new CapturePublicationError('validation');
  const input = parsed.data; if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError(); const hash = captureDraftFingerprint(input);
  if (input.timing.kind === 'now')
    authority = await prepareGmailActivation(db, identity, enabled, { ...input, kind: 'draft', operation: 'source.launch' }, authority);
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    let source = await sourceRow(trx, identity.workspaceId, input.sourceId, true); activate(context, source);
    const repeated = await publicationReplay(trx, identity, 'source.launch', input.requestId, hash); if (repeated) return repeated;
    await reconcileCaptureAccessInTransaction(trx, identity.workspaceId); source = await sourceRow(trx, identity.workspaceId, input.sourceId, true);
    if (source.version !== input.expectedVersion || source.approvedVersion !== input.baseApprovedVersion) throw new CapturePublicationError('conflict');
    const review = await capturePublicationReviewInTransaction(trx, context, source, authority);
    if (review.draftVersion !== input.draftVersion || review.configurationVersion !== input.configurationVersion) throw new CapturePublicationError('conflict');
    if (!review.ready) throw new CapturePublicationError('readiness', review.checks.filter(check => !check.ready).map(check => check.code));
    const { now } = await captureCapacity(trx, identity.workspaceId, source.id, source.type);
    const workspace = await trx('workspaces').where({ id: identity.workspaceId }).first('timezone');
    if (input.timing.kind === 'scheduled' && (Date.parse(input.timing.at) <= now.getTime() || input.timing.timezone !== workspace.timezone)) throw new CapturePublicationError('validation');
    if (!source.draftId) throw new CapturePublicationError('conflict');
    const draft = await trx<Draft>('captureSourceDrafts').where({ workspaceId: identity.workspaceId, sourceId: source.id, id: source.draftId }).forUpdate().first(); if (!draft) throw new CapturePublicationError('conflict');
    const configuration = captureConfigurationSchema.parse(draft.configuration), configurationVersion = review.configurationVersion;
    await trx('captureSourceVersions').insert({ id: randomUUID(), workspaceId: identity.workspaceId, sourceId: source.id, sourceType: source.type, configurationVersion, definitionVersion: configurationVersion, workflowVersion: configurationVersion, configuration: JSON.stringify(configuration), approvedBy: identity.userId, approvedAt: now });
    const revisionScheduled = input.timing.kind === 'scheduled' && source.status === 'active' && source.block === 'none';
    const scheduled = input.timing.kind === 'scheduled', transitionId = scheduled ? randomUUID() : null;
    const status = revisionScheduled ? 'active' : scheduled ? 'scheduled' : 'active';
    const version = source.version + 1;
    if (input.timing.kind === 'scheduled') await trx('capturePublicationTransitions').insert({ id: transitionId, workspaceId: identity.workspaceId, sourceId: source.id, configurationVersion, baseApprovedVersion: source.approvedVersion, approvedSourceVersion: version, approvedDraftVersion: draft.version, actorId: identity.userId, scheduledAt: input.timing.at, timezone: input.timing.timezone });
    if (!revisionScheduled) await pointPublication(trx, source, configurationVersion);
    await trx('captureSources').where({ workspaceId: identity.workspaceId, id: source.id }).update({ version, status, block: 'none', approvedVersion: revisionScheduled ? source.approvedVersion : configurationVersion, draftId: null, scheduledAt: input.timing.kind === 'scheduled' && !revisionScheduled ? input.timing.at : null, timezone: input.timing.kind === 'scheduled' && !revisionScheduled ? input.timing.timezone : null, updatedAt: trx.fn.now() });
    if (!scheduled) await openPreparedGmail(trx, source, configuration, authority);
    await event(trx, { ...source, version }, scheduled ? 'source.scheduled' : 'source.launched', { kind: 'user', userId: identity.userId }, configurationVersion);
    return receipt(trx, identity, 'source.launch', input.requestId, hash, capturePublicationResultSchema.parse({ ok: true, sourceId: source.id, sourceVersion: version, configurationVersion, status: revisionScheduled ? 'revision_scheduled' : status, transitionId }));
  });
}
export async function cancelCapturePublication(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const parsed = captureCancelPublicationSchema.safeParse(raw); if (!parsed.success) throw new CapturePublicationError('validation');
  const input = parsed.data; if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError(); const hash = captureDraftFingerprint(input);
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const source = await sourceRow(trx, identity.workspaceId, input.sourceId, true); activate(context, source);
    const repeated = await publicationReplay(trx, identity, 'source.reschedule', input.requestId, hash); if (repeated) return repeated;
    const pending = await trx('capturePublicationTransitions').where({ workspaceId: identity.workspaceId, sourceId: source.id, id: input.transitionId, state: 'pending' }).forUpdate().first();
    if (!pending || source.version !== input.expectedVersion || source.status === 'archived') throw new CapturePublicationError('conflict');
    await trx('capturePublicationTransitions').where({ workspaceId: identity.workspaceId, id: pending.id }).update({ state: 'cancelled', completedAt: trx.fn.now() });
    const version = source.version + 1;
    await restorePublicationDraft(trx, identity.workspaceId, source.id, pending.configurationVersion);
    await trx('captureSources').where({ workspaceId: identity.workspaceId, id: source.id }).update({ version, status: source.status === 'scheduled' ? 'paused' : source.status, scheduledAt: null, timezone: null, updatedAt: trx.fn.now() });
    await event(trx, { ...source, version }, 'source.schedule_cancelled', { kind: 'user', userId: identity.userId }, pending.configurationVersion);
    return receipt(trx, identity, 'source.reschedule', input.requestId, hash, capturePublicationResultSchema.parse({ ok: true, sourceId: source.id, sourceVersion: version, configurationVersion: pending.configurationVersion, status: 'cancelled', transitionId: pending.id }));
  });
}
/** One workspace lock order for reconciliation, scheduling and interactive publication. */
export async function processCapturePublications(db: Knex, enabled: readonly PermissionId[], authority = unavailableCaptureDelivery, limit = 100, workspaceIds?: readonly string[]) {
  const candidates = await db('captureSources').whereIn('status',['active','paused','scheduled']).modify(query => {
    if (workspaceIds !== undefined) query.whereIn('workspaceId', [...workspaceIds]);
    if (authority.scheduledType) query.where('type', authority.scheduledType);
    if (authority.scheduledSourceIds) query.whereIn('id', [...authority.scheduledSourceIds]);
  }).distinct('workspaceId').orderBy('workspaceId');
  const due = (query: Knex) => query('capturePublicationTransitions as t')
    .join('captureSources as s', 's.id', 't.sourceId')
    .where('t.state', 'pending').where('t.scheduledAt', '<=', query.fn.now())
    .modify(q => {
      if (authority.scheduledType) q.where('s.type', authority.scheduledType);
      if (authority.scheduledSourceIds) q.whereIn('s.id', [...authority.scheduledSourceIds]);
    })
    .orderBy('t.scheduledAt').orderBy('t.id').limit(limit)
    .select('t.*', 's.version as currentSourceVersion', 's.type as sourceType');
  let applied = 0;
  for (const { workspaceId } of candidates) {
    const prepared = new Map<string, CaptureDeliveryAuthority>();
    const retry = new Set<string>();
    if (authority.gmailBaseline) {
      for (const transition of await due(db).where('t.workspaceId', workspaceId).where('s.type', 'gmail')) {
        try {
          const active = await prepareGmailActivation(db, { workspaceId, userId: transition.actorId }, enabled,
            { sourceId: transition.sourceId, expectedVersion: transition.currentSourceVersion, kind: 'transition', transitionId: transition.id, operation: 'source.reschedule' }, authority);
          prepared.set(transition.id, active);
        } catch (error) {
          if (error instanceof CapturePublicationError) {
            if (error.kind === 'conflict' || error.failures.includes('delivery')) retry.add(transition.id);
          }
          else if (!(error instanceof AuthorizationAccessError)) throw error;
        }
      }
    }
    await db.transaction(async trx => {
    const workspace = await trx('workspaces').where({ id: workspaceId }).whereNull('deletionRequestedAt')
      .forUpdate().first<{ id: string; suspendedAt: Date | null }>('id', 'suspendedAt');
    if (!workspace || workspace.suspendedAt) return;
    await reconcileCaptureAccessInTransaction(trx, workspaceId);
    const pending = await due(trx).where('t.workspaceId', workspaceId);
    for (const transition of pending) {
      if (retry.has(transition.id)) continue;
      const source = await sourceRow(trx, workspaceId, transition.sourceId, true);
      const target = await trx('captureSourceVersions').where({ workspaceId, sourceId: source.id, configurationVersion: transition.configurationVersion }).first();
      const failures: CaptureReadinessCode[] = [];
      const first = transition.baseApprovedVersion === null || source.status === 'scheduled';
      if (!target || source.status === 'archived' || source.block !== 'none' || source.approvedVersion !== (first ? transition.configurationVersion : transition.baseApprovedVersion)) failures.push('workspace');
      try {
        const context = await loadWorkspaceAuthorization(trx, { userId: transition.actorId, workspaceId }, enabled); activate(context, source);
        if (target) failures.push(...(await captureConfigurationChecks(trx, source, target.configuration, transition.approvedDraftVersion, authority)).filter(check => !check.ready).map(check => check.code));
      } catch (error) { if (!(error instanceof AuthorizationAccessError)) throw error; failures.push('permission'); }
      const capacity = await captureCapacity(trx, workspaceId, source.id, source.type); if (!capacity.ready) failures.push('capacity'); if (!capacity.access) failures.push('access');
      if (!failures.length && source.type === 'gmail' && authority.gmailOpen && !prepared.has(transition.id)) continue;
      await trx('capturePublicationTransitions').where({ workspaceId, id: transition.id, state: 'pending' }).update({ state: failures.length ? 'blocked' : 'applied', failures: JSON.stringify([...new Set(failures)]), completedAt: trx.fn.now() });
      const version = source.version + 1;
      if (failures.length) {
        await restorePublicationDraft(trx, workspaceId, source.id, transition.configurationVersion);
        await notifyCaptureBlocked(trx, workspaceId, source.id, version, 'publication');
        await trx('captureSources').where({ workspaceId, id: source.id }).update({ version, ...(source.status === 'scheduled' ? { status: 'paused', block: failures.includes('access') ? 'entitlement' : failures.includes('capacity') ? 'source_capacity' : failures.includes('delivery') ? 'connection' : 'workspace', scheduledAt: null, timezone: null } : {}), updatedAt: trx.fn.now() });
        await event(trx, { ...source, version }, 'source.schedule_blocked', { kind: 'service', service: 'scheduler' }, transition.configurationVersion);
      } else {
        if (!first) await pointPublication(trx, source, transition.configurationVersion);
        await trx('captureSources').where({ workspaceId, id: source.id }).update({ version, status: 'active', block: 'none', approvedVersion: transition.configurationVersion, scheduledAt: null, timezone: null, updatedAt: trx.fn.now() });
        await openPreparedGmail(trx, source, target.configuration, prepared.get(transition.id) ?? authority);
        await event(trx, { ...source, version }, 'source.launched', { kind: 'service', service: 'scheduler' }, transition.configurationVersion); applied++;
      }
    }
    });
  }
  return applied;
}

/** Replace a pending launch's timing while retaining its immutable approved configuration. */
export async function changeCapturePublication(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown, authority = unavailableCaptureDelivery) {
  const parsed = captureChangePublicationSchema.safeParse(raw);
  if (!parsed.success) throw new CapturePublicationError('validation');
  const input = parsed.data;
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  const hash = captureDraftFingerprint(input);
  if (input.timing.kind === 'now')
    authority = await prepareGmailActivation(db, identity, enabled, { ...input, kind: 'transition', operation: 'source.reschedule' }, authority);
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const source = await sourceRow(trx, identity.workspaceId, input.sourceId, true); activate(context, source);
    const repeated = await publicationReplay(trx, identity, 'source.reschedule', input.requestId, hash); if (repeated) return repeated;
    const pending = await trx('capturePublicationTransitions').where({ workspaceId: identity.workspaceId, sourceId: source.id, id: input.transitionId, state: 'pending' }).forUpdate().first();
    const capacity = await captureCapacity(trx, identity.workspaceId, source.id, source.type);
    if (!pending || source.version !== input.expectedVersion || !['active', 'scheduled'].includes(source.status) || source.block !== 'none' || new Date(pending.scheduledAt) <= capacity.now) throw new CapturePublicationError('conflict');
    const first = source.status === 'scheduled';
    if (source.approvedVersion !== (first ? pending.configurationVersion : pending.baseApprovedVersion)) throw new CapturePublicationError('conflict');
    const target = await trx('captureSourceVersions').where({ workspaceId: identity.workspaceId, sourceId: source.id, configurationVersion: pending.configurationVersion }).first('configuration');
    if (!target) throw new CapturePublicationError('conflict');
    const failures = (await captureConfigurationChecks(trx, source, target.configuration, pending.approvedDraftVersion, authority)).filter(check => !check.ready).map(check => check.code);
    if (!capacity.access) failures.push('access'); if (!capacity.ready) failures.push('capacity');
    if (failures.length) throw new CapturePublicationError('readiness', failures);
    const workspace = await trx('workspaces').where({ id: identity.workspaceId }).first('timezone');
    const scheduled = input.timing.kind === 'scheduled';
    if (scheduled && input.timing.kind === 'scheduled' && (Date.parse(input.timing.at) <= capacity.now.getTime() || input.timing.timezone !== workspace.timezone || Date.parse(input.timing.at) === new Date(pending.scheduledAt).getTime())) throw new CapturePublicationError('validation');
    const version = source.version + 1, transitionId = scheduled ? randomUUID() : pending.id;
    await trx('capturePublicationTransitions').where({ workspaceId: identity.workspaceId, id: pending.id }).update({ state: scheduled ? 'cancelled' : 'applied', completedAt: capacity.now });
    if (input.timing.kind === 'scheduled') {
      await trx('capturePublicationTransitions').insert({ id: transitionId, workspaceId: identity.workspaceId, sourceId: source.id, configurationVersion: pending.configurationVersion, baseApprovedVersion: pending.baseApprovedVersion, approvedSourceVersion: version, approvedDraftVersion: pending.approvedDraftVersion, actorId: identity.userId, scheduledAt: input.timing.at, timezone: input.timing.timezone });
      await trx('captureSources').where({ workspaceId: identity.workspaceId, id: source.id }).update({ version, ...(first ? { scheduledAt: input.timing.at, timezone: input.timing.timezone } : {}), updatedAt: trx.fn.now() });
    } else {
      await pointPublication(trx, source, pending.configurationVersion);
      await trx('captureSources').where({ workspaceId: identity.workspaceId, id: source.id }).update({ version, status: 'active', approvedVersion: pending.configurationVersion, scheduledAt: null, timezone: null, updatedAt: trx.fn.now() });
      await openPreparedGmail(trx, source, target.configuration, authority);
    }
    await event(trx, { ...source, version }, scheduled ? 'source.scheduled' : 'source.launched', { kind: 'user', userId: identity.userId }, pending.configurationVersion);
    return receipt(trx, identity, 'source.reschedule', input.requestId, hash, capturePublicationResultSchema.parse({ ok: true, sourceId: source.id, sourceVersion: version, configurationVersion: pending.configurationVersion, status: scheduled ? first ? 'scheduled' : 'revision_scheduled' : 'active', transitionId }));
  });
}
