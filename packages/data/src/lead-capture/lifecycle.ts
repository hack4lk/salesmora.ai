import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { authorize } from '@salesmora/domain';
import { captureLifecycleCommandSchema, captureLifecycleSavedSchema, captureLifecycleReviewSchema, captureOperationResultSchema, type PermissionId, type AuthorizationContext } from '@salesmora/contracts';
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';
import { captureCapacity, reconcileCaptureAccessInTransaction } from './capacity';
import { captureConfigurationChecks, prepareGmailActivation, openPreparedGmail, CapturePublicationError, unavailableCaptureDelivery, type CaptureDeliveryAuthority } from './publication';
import { restorePublicationDraft } from './restore-publication-draft';
import { captureDraftFingerprint } from './store';

type LifecycleSource = { id: string; workspaceId: string; type: 'website' | 'gmail'; version: number; status: string; approvedVersion: number | null; draftId: string | null; block: string };
async function resumeChecks(trx: Knex.Transaction, source: LifecycleSource, authority: CaptureDeliveryAuthority) {
  const approved = await trx('captureSourceVersions').where({ workspaceId: source.workspaceId, sourceId: source.id, configurationVersion: source.approvedVersion }).first();
  if (!approved) return [{ code: 'configuration' as const, ready: false }];
  // Approved Gmail samples bind the original reviewed draft version, not a later draft head.
  const sample = source.type === 'gmail' && approved.configuration.sampleId ? await trx('captureSourceSamples').where({ workspaceId: source.workspaceId, sourceId: source.id, id: approved.configuration.sampleId }).first('draftVersion') : undefined;
  const checks = await captureConfigurationChecks(trx, source, approved.configuration, sample?.draftVersion ?? approved.configurationVersion, authority);
  const capacity = await captureCapacity(trx, source.workspaceId, source.id, source.type);
  const owner = await trx('workspaces as w').join('users as u', 'u.id', 'w.ownerId').where('w.id', source.workspaceId).forShare('u').first('u.suspendedAt', 'u.deletionRequestedAt');
  const pending = await trx('capturePublicationTransitions').where({ workspaceId: source.workspaceId, sourceId: source.id, state: 'pending' }).first('id');
  checks.push({ code: 'access', ready: capacity.access }, { code: 'capacity', ready: capacity.ready }, { code: 'workspace', ready: !!owner && !owner.suspendedAt && !owner.deletionRequestedAt }, { code: 'pending', ready: !pending });
  return checks;
}
/** Read-only review; the mutation repeats these checks under its write locks. */
export async function captureLifecycleReviewInTransaction(trx: Knex.Transaction, context: AuthorizationContext, source: LifecycleSource, authority: CaptureDeliveryAuthority = unavailableCaptureDelivery) {
  const resource = { kind: 'capture_source' as const, workspaceId: source.workspaceId, id: source.id };
  if (!authorize(context, { permission: 'leadCapture.read', resource }).allowed) throw new AuthorizationAccessError();
  const pause = authorize(context, { permission: 'leadCapture.pause', resource }).allowed;
  const canResume = pause && source.status === 'paused' && source.approvedVersion !== null;
  const canRestore = source.status === 'archived' && authorize(context, { permission: 'leadCapture.archive', resource }).allowed;
  const restoration = canRestore ? await captureCapacity(trx, source.workspaceId, source.id, source.type) : undefined;
  const restoreFailures = restoration ? [...(!restoration.access ? ['access' as const] : []), ...(!restoration.ready ? ['capacity' as const] : [])] : [];
  const checks = canResume ? await resumeChecks(trx, source, authority) : [];
  return captureLifecycleReviewSchema.parse({ sourceId: source.id, sourceVersion: source.version, approvedVersion: source.approvedVersion,
    canRestore, restoreReady: canRestore && !restoreFailures.length, restoreFailures,
    canPause: pause && source.status === 'active', canResume,
    canArchive: source.status !== 'archived' && authorize(context, { permission: 'leadCapture.archive', resource }).allowed,
    resumeReady: canResume && checks.every(check => check.ready), resumeFailures: checks.filter(check => !check.ready).map(check => check.code) });
}

/** Confirmed, version-bound lifecycle changes retain approvals, public identity and receipts. */
export async function changeCaptureLifecycle(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown, authority: CaptureDeliveryAuthority = unavailableCaptureDelivery) {
  const parsed = captureLifecycleCommandSchema.safeParse(raw);
  if (!parsed.success) throw new CapturePublicationError('validation');
  const input = parsed.data;
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  if (input.action === 'resume')
    authority = await prepareGmailActivation(db, identity, enabled, { ...input, kind: 'approved', operation: 'source.resume' }, authority);
  const operation = `source.${input.action}`, hash = captureDraftFingerprint(input);
  const result = await withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    let source = await trx('captureSources').where({ workspaceId: identity.workspaceId, id: input.sourceId }).forUpdate().first();
    const resource = { kind: 'capture_source' as const, workspaceId: identity.workspaceId, id: input.sourceId };
    const permission = ['archive', 'restore'].includes(input.action) ? 'leadCapture.archive' : 'leadCapture.pause';
    if (!source || !authorize(context, { permission: 'leadCapture.read', resource }).allowed || !authorize(context, { permission, resource }).allowed) throw new AuthorizationAccessError();

    // A lost response may be retried after subsequent transitions, but never after revocation.
    const repeated = await trx('captureOperations').where({ workspaceId: identity.workspaceId, operation, requestId: input.requestId }).first();
    if (repeated) {
      const saved = captureOperationResultSchema.safeParse(repeated.result);
      if (repeated.inputHash !== hash || repeated.actor.kind !== 'user' || repeated.actor.userId !== identity.userId || repeated.target.sourceId !== input.sourceId || !saved.success || saved.data.kind !== 'source' || saved.data.sourceId !== input.sourceId) throw new CapturePublicationError('conflict');
      return captureLifecycleSavedSchema.parse({ ok: true, sourceId: saved.data.sourceId, sourceVersion: saved.data.sourceVersion });
    }

    if (source.version !== input.expectedVersion) throw new CapturePublicationError('conflict');
    if (input.action === 'resume') {
      await reconcileCaptureAccessInTransaction(trx, identity.workspaceId);
      source = await trx('captureSources').where({ workspaceId: identity.workspaceId, id: input.sourceId }).forUpdate().first();
      // Commit an observed access-loss incident before asking the caller to reload it.
      // Throwing here would roll it back and make every retry see the same old version.
      if (source.version !== input.expectedVersion) return { error: new CapturePublicationError('conflict') };
    }
    const eligible = input.action === 'pause' ? source.status === 'active' : input.action === 'resume' ? source.status === 'paused' : input.action === 'restore' ? source.status === 'archived' : ['draft', 'active', 'paused', 'scheduled'].includes(source.status);
    if (!eligible) throw new CapturePublicationError('conflict');

    if (input.action === 'restore') {
      const capacity = await captureCapacity(trx, identity.workspaceId, source.id, source.type);
      const failures = [...(!capacity.access ? ['access' as const] : []), ...(!capacity.ready ? ['capacity' as const] : [])];
      if (failures.length) throw new CapturePublicationError('readiness', failures);
    }
    if (input.action === 'resume') {
      if (!source.approvedVersion || input.configuration?.version !== source.approvedVersion) throw new CapturePublicationError('conflict');
      const failures = (await resumeChecks(trx, source, authority)).filter(check => !check.ready).map(check => check.code);
      if (failures.length) throw new CapturePublicationError('readiness', failures);
    }

    const version = source.version + 1;
    const status = ['pause', 'restore'].includes(input.action) ? 'paused' : input.action === 'archive' ? 'archived' : 'active';
    if (input.action !== 'resume') {
      const pending = await trx('capturePublicationTransitions').where({ workspaceId: identity.workspaceId, sourceId: source.id, state: 'pending' }).forUpdate().first();
      if (pending) {
        await restorePublicationDraft(trx, identity.workspaceId, source.id, pending.configurationVersion);
        await trx('capturePublicationTransitions').where({ workspaceId: identity.workspaceId, id: pending.id }).update({ state: 'cancelled', completedAt: trx.fn.now() });
        await trx('captureSourceEvents').insert({ id: randomUUID(), workspaceId: identity.workspaceId, sourceId: source.id, kind: 'source.schedule_cancelled', actor: JSON.stringify({ kind: 'user', userId: identity.userId }), data: JSON.stringify({ sourceVersion: version, configurationVersion: pending.configurationVersion }) });
      }
    }
    const updated = await trx('captureSources').where({ workspaceId: identity.workspaceId, id: source.id, version: input.expectedVersion }).update({ status, version, ...(input.action === 'resume' ? { block: 'none' } : {}), scheduledAt: null, timezone: null, updatedAt: trx.fn.now() });
    if (updated !== 1) throw new CapturePublicationError('conflict');
    if (input.action === 'resume' && source.type === 'gmail' && authority.gmailOpen) {
      const approved = await trx('captureSourceVersions').where({ workspaceId: identity.workspaceId, sourceId: source.id, configurationVersion: source.approvedVersion }).first('configuration');
      if (!approved) throw new CapturePublicationError('conflict');
      await openPreparedGmail(trx, source, approved.configuration, authority);
    }
    const result = captureLifecycleSavedSchema.parse({ ok: true, sourceId: source.id, sourceVersion: version });
    await trx('captureOperations').insert({ id: randomUUID(), workspaceId: identity.workspaceId, operation, requestId: input.requestId, inputHash: hash, actor: JSON.stringify({ kind: 'user', userId: identity.userId }), target: JSON.stringify({ sourceId: source.id }), result: JSON.stringify({ kind: 'source', sourceId: source.id, sourceVersion: version }) });
    await trx('captureSourceEvents').insert({ id: randomUUID(), workspaceId: identity.workspaceId, sourceId: source.id, kind: input.action === 'restore' ? 'source.restored' : input.action === 'pause' ? 'source.paused' : input.action === 'archive' ? 'source.archived' : 'source.launched', actor: JSON.stringify({ kind: 'user', userId: identity.userId }), data: JSON.stringify({ sourceVersion: version, ...(source.approvedVersion ? { configurationVersion: source.approvedVersion } : {}), status }) });
    return result;
  });
  if ('error' in result) throw result.error;
  return result;
}
