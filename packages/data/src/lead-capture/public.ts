import type { Knex } from 'knex';
import { captureConfigurationSchema, capturePublicKeySchema, capturePublicDefinitionSchema, capturePublicUnavailableSchema } from '@salesmora/contracts';
import { captureCurrentBlocks } from './capacity';
import { resolveCaptureAssignment } from '../lead-assignment-settings/store';
/** Public lookup has no session/actor authority. Return an explicit safe projection, never a source row. */
export async function readPublicCapture(db: Knex, rawKey: unknown) {
  const key = capturePublicKeySchema.safeParse(rawKey); if (!key.success) return { state: 'not-found' } as const;
  return db.transaction(async trx => {
    const publication = await trx('capturePublications').where({ publicKey: key.data, sourceType: 'website' }).first('workspaceId', 'sourceId', 'configurationVersion', 'version');
    if (!publication) return { state: 'not-found' } as const;
    const workspace = await trx('workspaces as w').join('users as u', 'u.id', 'w.ownerId').where('w.id', publication.workspaceId).whereNull('w.deletionRequestedAt').select('w.id', 'w.suspendedAt', 'u.suspendedAt as ownerSuspendedAt', 'u.deletionRequestedAt as ownerDeletingAt').forShare('w').first();
    if (!workspace) return { state: 'not-found' } as const;
    // Reload after acquiring the workspace lock so a concurrent revision cannot mix bindings.
    const current = await trx('capturePublications').where({ workspaceId: publication.workspaceId, sourceId: publication.sourceId, publicKey: key.data }).first();
    const source = await trx('captureSources').where({ workspaceId: publication.workspaceId, id: publication.sourceId, type: 'website' }).first('status', 'block', 'approvedVersion');
    if (!current || !source || current.configurationVersion !== source.approvedVersion) return { state: 'not-found' } as const;
    const approved = await trx('captureSourceVersions').where({ workspaceId: publication.workspaceId, sourceId: publication.sourceId, configurationVersion: current.configurationVersion, sourceType: 'website' }).first('configuration');
    const parsed = captureConfigurationSchema.safeParse(approved?.configuration);
    if (!parsed.success || parsed.data.type !== 'website') return { state: 'not-found' } as const;
    const configuration = parsed.data;
    const content = { ...configuration.content, businessEmail: configuration.content.showBusinessEmail ? configuration.content.businessEmail : '', businessPhone: configuration.content.showBusinessPhone ? configuration.content.businessPhone : '' };
    const blocks = await captureCurrentBlocks(trx, publication.workspaceId);
    const { rows: [{ now }] } = await trx.raw('SELECT current_timestamp AS now');
    const incident = await trx('captureAccessChecks').where({ workspaceId: publication.workspaceId }).whereNull('processedAt').where('effectiveAt', '<=', now).whereRaw('sources @> ?::jsonb', [JSON.stringify([{ id: publication.sourceId }])]).first('id');
    const assignment = await resolveCaptureAssignment(trx, publication.workspaceId, configuration.workflow.assignment);
    if (workspace.suspendedAt || workspace.ownerSuspendedAt || workspace.ownerDeletingAt || source.status !== 'active' || source.block !== 'none' || blocks.get(publication.sourceId) !== 'none' || incident || !assignment.ready) {
      return { state: 'unavailable', content: capturePublicUnavailableSchema.parse({ businessName: content.businessName, title: content.title, unavailableMessage: content.unavailableMessage, businessEmail: content.businessEmail, businessPhone: content.businessPhone, showBusinessEmail: content.showBusinessEmail, showBusinessPhone: content.showBusinessPhone }) } as const;
    }
    return { state: 'ready', definition: capturePublicDefinitionSchema.parse({ publicKey: key.data, version: current.configurationVersion, fields: configuration.fields, contactRequired: configuration.contactRequired, content }),
      binding: { publicKey: key.data, publicationVersion: current.version, configurationVersion: current.configurationVersion }, now: now as Date } as const;
  });
}
