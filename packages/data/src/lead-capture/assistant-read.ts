import { createHash, randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { captureAssistantContextSchema, captureChatQuerySchema, captureChatResultSchema, type AuthorizationContext, type PermissionId } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';
import { workspaceEntitlements } from '../billing/entitlements';
import { captureSourceWindowInTransaction, readCaptureSource, captureDraftFingerprint } from './store';
import { unavailableCaptureDelivery, type CaptureDeliveryAuthority } from './publication';
function permit(context: AuthorizationContext) {
  const scope = resolveAuthorizedCollectionScope(context, 'leadCapture.read');
  if (!authorize(context, { permission: 'assistant.use' }).allowed || !scope.allowed || scope.scope !== 'workspace') throw new AuthorizationAccessError();
  return scope;
}
/** Conservative scoped fingerprint. Contents remain server-private; changed history must be reread. */
export async function captureChatStamp(trx: Knex.Transaction, context: AuthorizationContext, deliveryStamp = '') {
  permit(context);
  const { rows } = await trx.raw(`SELECT md5(coalesce(string_agg(v, '|' ORDER BY v), '')) AS stamp FROM (
    SELECT 's:' || id::text || ':' || xmin::text AS v FROM "captureSources" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'd:' || id::text || ':' || xmin::text FROM "captureSourceDrafts" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'v:' || id::text || ':' || xmin::text FROM "captureSourceVersions" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'p:' || id::text || ':' || xmin::text FROM "capturePublications" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'r:' || id::text || ':' || xmin::text FROM "captureReceipts" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'i:' || id::text || ':' || xmin::text FROM "intakeItems" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 't:' || id::text || ':' || xmin::text FROM "capturePublicationTransitions" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'b:' || id::text || ':' || xmin::text FROM "billingPlanChanges" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'sub:' || xmin::text FROM "workspaceSubscriptions" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'member:' || m."userId" || ':' || m.xmin::text || ':' || u.xmin::text FROM "workspaceMemberships" m JOIN users u ON u.id=m."userId" WHERE m."workspaceId"=:workspace
    UNION ALL SELECT 'service:' || service || ':' || xmin::text FROM "workspaceServices" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'w:' || xmin::text FROM workspaces WHERE id=:workspace
  ) evidence`, { workspace: context.workspaceId });
  const entitlement = await workspaceEntitlements(trx, context.workspaceId);
  const policy = { ...context.policy, grants: [...context.policy.grants].sort((a, b) => `${a.role}:${a.permission}:${a.scope}`.localeCompare(`${b.role}:${b.permission}:${b.scope}`)) };
  return createHash('sha256').update(JSON.stringify([context.workspaceId, context.userId, policy, [...context.enabledPermissions].sort(), rows[0].stamp, entitlement.plan.id, entitlement.transition, deliveryStamp])).digest('hex');
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
    if (stamp !== await captureChatStamp(trx, context, options.deliveryStamp)) throw new AuthorizationAccessError();
    return { stamp, snapshot: { result, query: input, snapshotHash: captureDraftFingerprint(result) } };
  });
}
