import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
/** Restore failed/cancelled approved work as a fresh editable revision, never over an existing head.
 * Caller holds the workspace/source write locks and advances the source version atomically. */
export async function restorePublicationDraft(trx: Knex.Transaction, workspaceId: string, sourceId: string, configurationVersion: number) {
  const source = await trx('captureSources').where({ workspaceId, id: sourceId }).first('draftId','approvedVersion','type');
  if (!source || source.draftId) return;
  const target = await trx('captureSourceVersions').where({ workspaceId, sourceId, configurationVersion }).first('configuration');
  if (!target) throw Error('Publication target is missing.');
  const retained = await trx('captureSourceDrafts').where({ workspaceId, sourceId }).forUpdate().first('id','version');
  const values = { configuration: JSON.stringify(target.configuration), baseApprovedVersion: source.approvedVersion, sourceType: source.type, version: Math.max(retained?.version ?? 0, source.approvedVersion ?? 0, configurationVersion) + 1, updatedAt: trx.fn.now() };
  const id = retained?.id ?? randomUUID();
  if (retained) await trx('captureSourceDrafts').where({ workspaceId, id }).update(values);
  else await trx('captureSourceDrafts').insert({ id, workspaceId, sourceId, ...values });
  await trx('captureSources').where({ workspaceId, id: sourceId }).update({ draftId: id });
}
