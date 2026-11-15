import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { captureAssistantContextSchema, captureChatQuerySchema, captureChatResultSchema, type AuthorizationContext, type PermissionId } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';
import { assistantAuthorityStamp } from '../authorization/evidence-stamp';
import { captureSourceWindowInTransaction, readCaptureSource, captureDraftFingerprint } from './store';
import { unavailableCaptureDelivery, type CaptureDeliveryAuthority } from './publication';
function permit(context: AuthorizationContext) {
  const scope = resolveAuthorizedCollectionScope(context, 'leadCapture.read');
  if (!authorize(context, { permission: 'assistant.use' }).allowed || !scope.allowed || scope.scope !== 'workspace') throw new AuthorizationAccessError();
  return scope;
}
/** Saved facts bind authorization, not the current workspace population or delivery configuration. */
export async function captureChatStamp(_trx: Knex.Transaction, context: AuthorizationContext, _deliveryStamp?: string) {
  void _deliveryStamp;
  permit(context);
  return assistantAuthorityStamp(context, 'lead-capture');
}
export async function captureChatEvidenceAllowed(trx: Knex.Transaction, context: AuthorizationContext, stamp?: string | null, deliveryStamp = '') {
  if (!stamp) return true;
  try { return stamp === await captureChatStamp(trx, context, deliveryStamp); } catch (error) { if (error instanceof AuthorizationAccessError) return false; throw error; }
}
export async function readCaptureForChat(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown, options: { pageContext?: unknown; authority?: CaptureDeliveryAuthority; installationOrigin?: string; deliveryStamp?: string } = {}) {
  const input = captureChatQuerySchema.parse(raw);
  const page = options.pageContext ? captureAssistantContextSchema.parse(options.pageContext) : undefined;
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const scope = permit(context), stamp = await captureChatStamp(trx, context, options.deliveryStamp);
    const timezone = (await trx('workspaces').where({ id: scope.workspaceId }).first('timezone')).timezone;
    const base = { id: randomUUID(), workspaceId: scope.workspaceId, retrievedAt: new Date().toISOString(), timezone };
    let result;
    if (input.usePageFilters && page?.surface !== 'lead_capture.list') return { clarification: 'The current source-list filters are unavailable. Open the source list or specify explicit search filters.' };
    if (input.operation === 'sources') {
      const filters = input.usePageFilters && page?.surface === 'lead_capture.list' ? page.filters : { search: input.search ?? '', ...(input.type ? { type: input.type } : {}), ...(input.status ? { status: input.status } : {}), archived: input.archived };
      const current = await captureSourceWindowInTransaction(trx, context, { ...filters, page: input.page, pageSize: input.limit });
      result = captureChatResultSchema.parse({ ...base, operation: 'sources', rows: current.rows, total: current.total, page: current.page, limit: input.limit, filters });
    } else {
      const sourceId = input.sourceId ?? (page?.surface === 'lead_capture.setup' || page?.surface === 'lead_capture.detail' ? page.sourceId : undefined);
      if (!sourceId) return { clarification: 'Select a current capture source or provide an exact source ID from a fresh authorized result.' };
      const view = await readCaptureSource(trx, identity, enabled, { workspaceId: scope.workspaceId, sourceId }, options.installationOrigin, options.authority ?? unavailableCaptureDelivery);
      const source = view.detail.source;
      if (input.operation === 'source_summary') result = captureChatResultSchema.parse({ ...base, operation: input.operation, source });
      else if (input.operation === 'source_details') result = captureChatResultSchema.parse({ ...base, operation: input.operation, detail: view.detail, installation: view.installation ?? null });
      else if (input.operation === 'installation') result = captureChatResultSchema.parse({ ...base, operation: input.operation, source, installation: view.installation ?? null });
      else result = captureChatResultSchema.parse({ ...base, operation: input.operation, source, review: view.publicationReview });
    }
    if (JSON.stringify(result).length > 48000) return { clarification: 'This source result exceeds the assistant display limit. Open the source to review its complete configuration.' };
    return { stamp, snapshot: { result, query: input, snapshotHash: captureDraftFingerprint(result) } };
  });
}
