import type { Knex } from 'knex';
import { randomUUID } from 'node:crypto';
import { captureGmailSampleSearchSchema, captureGmailSamplePreviewSchema, captureGmailSampleCandidatesSchema, captureGmailSelectedExampleSchema, type PermissionId } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';
import { workspaceEntitlements } from '../billing/entitlements';
import { CaptureDraftConflictError, CaptureDraftEntitlementError, CaptureDraftValidationError, captureDraftFingerprint } from './store';
import { gmailClock, gmailHash, gmailScope, blockCaptureGmailSources } from './gmail-connections';
import { refreshCaptureGmailGrant } from './gmail-refresh';
import { CaptureGmailProviderError, type CaptureGmailConfiguration, type CaptureGmailProvider } from './gmail-provider';
import { CaptureGmailMessageError, gmailMessageMetadata, gmailMessageExample } from './gmail-message';
import type { CaptureGmailMessagesProvider } from './gmail-messages-provider';

type Input = { workspaceId: string; sourceId: string; expectedVersion: number; expectedDraftVersion: number };
export async function readCaptureGmailExamples(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], sessionId: string, raw: unknown, config: CaptureGmailConfiguration, provider: CaptureGmailProvider, messages: CaptureGmailMessagesProvider, mode: 'search' | 'preview') {
  const parsed = (mode === 'search' ? captureGmailSampleSearchSchema : captureGmailSamplePreviewSchema).safeParse(raw);
  if (!parsed.success) throw new CaptureDraftValidationError();
  const input = parsed.data;
  if (input.workspaceId !== identity.workspaceId || !sessionId) throw new AuthorizationAccessError();
  gmailScope(config, identity.workspaceId);
  async function authority(command: Input, retain?: ReturnType<typeof gmailMessageExample>): Promise<{ accountId: string; generation: number; bindingHash: string; now: Date; retrievalId?: string }> {
    return withWorkspaceAuthorization(db, identity, enabled, !!retain, async (trx, context) => {
      if (!await trx('sessions').where({ id: sessionId, userId: identity.userId }).where('expiresAt', '>', trx.fn.now()).forShare().first('id')) throw new AuthorizationAccessError();
      const source = await trx('captureSources').where({ id: command.sourceId, workspaceId: identity.workspaceId, type: 'gmail' }).first();
      if (!source || !resolveAuthorizedCollectionScope(context, 'leadCapture.read').allowed || !authorize(context, { permission: 'leadCapture.update', resource: { kind: 'capture_source', workspaceId: identity.workspaceId, id: source.id } }).allowed) throw new AuthorizationAccessError();
      if ((await workspaceEntitlements(trx, identity.workspaceId)).plan.id === 'free') throw new CaptureDraftEntitlementError();
      const draft = source.draftId ? await trx('captureSourceDrafts').where({ id: source.draftId, sourceId: source.id, workspaceId: identity.workspaceId }).first() : null;
      if (source.status === 'archived' || source.version !== command.expectedVersion || !draft || draft.version !== command.expectedDraftVersion || draft.configuration.type !== 'gmail') throw new CaptureDraftConflictError();
      const account = draft.configuration.connectionId ? await trx('captureGmailAccounts').where({ id: draft.configuration.connectionId, workspaceId: identity.workspaceId, status: 'connected' }).first() : null;
      if (!account) throw new CaptureGmailProviderError('authorization');
      const bindingHash = captureDraftFingerprint({ sourceId: source.id, sourceVersion: source.version, draftId: draft.id, draftVersion: draft.version, configuration: draft.configuration, accountId: account.id, generation: account.credentialGeneration });
      const now = await gmailClock(trx);
      let retrievalId: string | undefined;
      if (retain) {
        if (bindingHash !== before.bindingHash || ref && new Date(ref.expiresAt) <= now) throw new CaptureDraftConflictError();
        await trx('captureGmailSamplePreviews').where({ workspaceId: identity.workspaceId }).where('expiresAt', '<=', now).delete();
        if (Number((await trx('captureGmailSamplePreviews').where({ workspaceId: identity.workspaceId, actorId: identity.userId }).count('* as n').first())?.n) >= 100) throw new CaptureGmailProviderError('temporary');
        retrievalId = randomUUID();
        await trx('captureGmailSamplePreviews').insert({ id: retrievalId, workspaceId: identity.workspaceId, sourceId: source.id, sourceVersion: source.version, draftId: draft.id, draftVersion: draft.version, accountId: account.id, credentialGeneration: account.credentialGeneration, actorId: identity.userId, configurationHash: captureDraftFingerprint(draft.configuration), contentHash: captureDraftFingerprint({ subject: retain.subject, body: retain.body }), messageId: retain.id, sender: retain.sender, receivedAt: retain.receivedAt, expiresAt: new Date(now.getTime() + 15 * 60000) });
      }
      return { accountId: account.id as string, generation: account.credentialGeneration as number, bindingHash, now, retrievalId };
    });
  }
  const before = await authority(input), binding = { environment: config.environment, workspaceId: identity.workspaceId, recordId: before.accountId };
  let ref: ReturnType<typeof config.cipher.openSample> | undefined;
  if ('reference' in input) {
    try { ref = config.cipher.openSample(binding, JSON.parse(Buffer.from(input.reference, 'base64url').toString('utf8'))); }
    catch { throw new CaptureDraftConflictError(); }
    if (ref.actorId !== identity.userId || ref.sessionHash !== gmailHash(sessionId) || ref.bindingHash !== before.bindingHash || new Date(ref.expiresAt) <= before.now) throw new CaptureDraftConflictError();
  }
  const phrase = 'subjectPhrase' in input ? input.subjectPhrase : ref!.subjectPhrase;
  if (/["\\\x00-\x1f]/.test(phrase)) throw new CaptureDraftValidationError();
  const tokens = await refreshCaptureGmailGrant(db, identity.workspaceId, before.accountId, config, provider);
  if (!tokens.accessToken) throw new CaptureGmailProviderError('authorization');
  const recent = (row: ReturnType<typeof gmailMessageMetadata>) => row.subject.toLowerCase().includes(phrase.toLowerCase()) && new Date(row.receivedAt).getTime() >= before.now.getTime() - 30 * 86400000 && new Date(row.receivedAt).getTime() <= before.now.getTime();
  let result: unknown, retainedExample: ReturnType<typeof gmailMessageExample> | undefined;
  try {
    if (ref) {
      const example = gmailMessageExample(await messages.message(tokens.accessToken, ref.messageId));
      if (example.id !== ref.messageId || !recent(example)) throw new CaptureGmailMessageError();
      retainedExample = example;
      result = captureGmailSelectedExampleSchema.parse({ ...example, id: 'reference' in input ? input.reference : '' });
    } else {
      const ids = await messages.list(tokens.accessToken, phrase), candidates = [];
      if (ids.length > 10) throw new CaptureGmailMessageError();
      for (const id of ids) {
        let row;
        try { row = gmailMessageMetadata(await messages.metadata(tokens.accessToken, id)); }
        catch (error) { if (error instanceof CaptureGmailMessageError) continue; throw error; }
        if (row.id !== id || !recent(row)) continue;
        const envelope = config.cipher.sealSample(binding, { actorId: identity.userId, sessionHash: gmailHash(sessionId), bindingHash: before.bindingHash, messageId: id, subjectPhrase: phrase, expiresAt: new Date(before.now.getTime() + 15 * 60000).toISOString() });
        candidates.push({ ...row, id: Buffer.from(JSON.stringify(envelope)).toString('base64url') });
      }
      result = captureGmailSampleCandidatesSchema.parse({ candidates });
    }
  } catch (error) {
    if (error instanceof CaptureGmailProviderError && error.kind === 'authorization') {
      await withWorkspaceAuthorization(db, identity, enabled, true, async trx => {
        const account = await trx('captureGmailAccounts').where({ workspaceId: identity.workspaceId, id: before.accountId, credentialGeneration: before.generation, status: 'connected' }).first('version');
        if (!account) return;
        await trx('captureGmailAccounts').where({ workspaceId: identity.workspaceId, id: before.accountId }).update({ status: 'reconnect-required', version: account.version + 1, updatedAt: trx.fn.now() });
        await blockCaptureGmailSources(trx, identity.workspaceId, before.accountId, null);
        await trx('captureGmailConnectionEvents').insert({ id: randomUUID(), workspaceId: identity.workspaceId, accountId: before.accountId, kind: 'authorization-lost', accountVersion: account.version + 1 });
      });
    }
    throw error;
  }
  const after = await authority(input, retainedExample);
  if (after.bindingHash !== before.bindingHash || ref && new Date(ref.expiresAt) <= after.now) throw new CaptureDraftConflictError();
  return after.retrievalId ? captureGmailSelectedExampleSchema.parse({ ...result as object, retrievalId: after.retrievalId }) : result;
}
