import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { captureDuplicateCommandSchema, captureDraftSavedSchema, captureOperationResultSchema, type PermissionId, type CaptureDraftConfiguration } from '@salesmora/contracts';
import { authorize } from '@salesmora/domain';
import { withWorkspaceAuthorization, AuthorizationAccessError, type WorkspaceIdentity } from '../authorization/store';
import { captureDraftFingerprint, createCaptureDraft, CaptureDraftConflictError, CaptureDraftValidationError } from './store';
/** Copy only the exact reviewed configuration into a new draft; no public identity, provider authority or receipt is copied. */
export async function duplicateCaptureSource(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const parsed = captureDuplicateCommandSchema.safeParse(raw);
  if (!parsed.success)
    throw new CaptureDraftValidationError();
  const input = parsed.data;
  if (input.workspaceId !== identity.workspaceId)
    throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const source = await trx('captureSources').where({ workspaceId: identity.workspaceId, id: input.sourceId }).forUpdate().first();
    const resource = { kind: 'capture_source' as const, workspaceId: identity.workspaceId, id: input.sourceId };
    if (!source || !authorize(context, { permission: 'leadCapture.read', resource }).allowed || !authorize(context, { permission: 'leadCapture.create' }).allowed)
      throw new AuthorizationAccessError();
    const inputHash = captureDraftFingerprint(input), operation = 'source.duplicate';
    const prior = await trx('captureOperations').where({ workspaceId: identity.workspaceId, operation, requestId: input.requestId }).first();
    if (prior) {
      const result = captureOperationResultSchema.parse(prior.result);
      if (prior.inputHash !== inputHash || prior.actor.kind !== 'user' || prior.actor.userId !== identity.userId || prior.target.sourceId !== source.id || result.kind !== 'draft')
        throw new CaptureDraftConflictError();
      return captureDraftSavedSchema.parse({ ok: true, sourceId: result.sourceId, sourceVersion: result.sourceVersion, draftVersion: result.draftVersion });
    }
    if (source.version !== input.expectedVersion)
      throw new CaptureDraftConflictError();
    const selected = input.configuration.kind === 'draft'
      ? source.draftId && await trx('captureSourceDrafts').where({ workspaceId: identity.workspaceId, sourceId: source.id, id: source.draftId, version: input.configuration.version }).first('configuration')
      : source.approvedVersion === input.configuration.version && await trx('captureSourceVersions').where({ workspaceId: identity.workspaceId, sourceId: source.id, configurationVersion: input.configuration.version }).first('configuration');
    if (!selected)
      throw new CaptureDraftConflictError();
    const configuration: CaptureDraftConfiguration = structuredClone(selected.configuration);
    if (configuration.type === 'gmail') {
      delete configuration.connectionId;
      delete configuration.accountEmail;
      delete configuration.sampleId;
      delete configuration.mappings;
    }
    const saved = await createCaptureDraft(trx, identity, enabled, { workspaceId: identity.workspaceId, requestId: randomUUID(), name: input.name, configuration });
    await trx('captureOperations').insert({ id: randomUUID(), workspaceId: identity.workspaceId, operation, requestId: input.requestId, inputHash, actor: JSON.stringify({ kind: 'user', userId: identity.userId }), target: JSON.stringify({ sourceId: source.id }), result: JSON.stringify({ kind: 'draft', sourceId: saved.sourceId, sourceVersion: saved.sourceVersion, draftVersion: saved.draftVersion }) });
    await trx('captureSourceEvents').insert({ id: randomUUID(), workspaceId: identity.workspaceId, sourceId: source.id, kind: 'source.duplicated', actor: JSON.stringify({ kind: 'user', userId: identity.userId }), data: JSON.stringify({ sourceVersion: source.version, copySourceId: saved.sourceId, configuration: input.configuration }) });
    return saved;
  });
}
