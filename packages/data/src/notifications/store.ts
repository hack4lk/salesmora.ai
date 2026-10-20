import type { Knex } from 'knex';
import { notificationPreferencesSchema, notificationQuerySchema, markNotificationReadSchema, type NotificationPreferences, type NotificationRecord, type NotificationResult, type AuthorizationContext, type PermissionId } from '@salesmora/contracts';
import { resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { scoped, formatWorkOrderNumber } from '../work-orders/store';
import { materialAccess } from '../materials/store';
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';
export async function readNotificationPreferences(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[]) {
  return withWorkspaceAuthorization(db, identity, enabled, false, async trx => {
    const row = await trx('notificationPreferences').where({ userId: identity.userId }).first('leadAssignedEmail');
    return notificationPreferencesSchema.parse(row ?? { leadAssignedEmail: true });
  });
}
export async function saveNotificationPreferences(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: NotificationPreferences) {
  const values = notificationPreferencesSchema.parse(raw);
  return withWorkspaceAuthorization(db, identity, enabled, true, async trx => {
    await trx('notificationPreferences').insert({ userId: identity.userId, ...values }).onConflict('userId').merge({ ...values, updatedAt: trx.fn.now() });
    return values;
  });
}
/** Current assignment only; never return stale details after reassignment, even to workspace readers. */
export function currentAssignmentQuery(trx: Knex.Transaction, identity: WorkspaceIdentity) {
  return trx('assignmentNotifications as n').join('leads as l', function () { this.on('l.id','n.leadId').andOn('l.workspaceId','n.workspaceId'); })
    .join('leadActivity as a','a.id','n.id')
    .where({ 'n.workspaceId': identity.workspaceId, 'n.userId': identity.userId, 'l.ownerId': identity.userId })
    .whereNull('l.archivedAt')
    .whereNotExists(trx('leadActivity as newer').select(trx.raw('1')).whereRaw('newer."leadId" = l.id AND newer."workspaceId" = l."workspaceId"').where('newer.type','assigned').whereRaw(`(newer.changes->>'toVersion')::int > (a.changes->>'toVersion')::int`));
}
const leadNumber = (n: number) => `LD-${String(n).padStart(4,'0')}`;
/** Work-order notifications only for current readers of that work order. */
function workOrderNotificationQuery(trx: Knex.Transaction, context: AuthorizationContext) {
  return scoped(trx, context).join('workOrderNotifications as n', function () { this.on('n.workOrderId','w.id').andOn('n.workspaceId','w.workspaceId'); }).where('n.userId', context.userId).whereNull('w.archivedAt');
}
function canReadWorkOrderNotifications(context: AuthorizationContext) {
  const scope = resolveAuthorizedCollectionScope(context,'workorders.read');
  return scope.allowed && ['workspace','assigned_job'].includes(scope.scope);
}
/** A proposer sees decisions on their own items while they can still read the catalog. */
function materialNotificationQuery(trx: Knex.Transaction, context: AuthorizationContext) {
  return trx('materialNotifications as n').where({ 'n.workspaceId': context.workspaceId, 'n.userId': context.userId });
}
const canReadMaterialNotifications = (context: AuthorizationContext) => materialAccess(context).read;
export async function readNotifications(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], page = 1): Promise<NotificationResult> {
  notificationQuerySchema.parse({ workspaceId: identity.workspaceId, page });
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const take = page * 20 + 1, items: NotificationRecord[] = [];
    let unread = 0;
    const leadScope = resolveAuthorizedCollectionScope(context,'leads.read');
    if (leadScope.allowed && leadScope.resourceKind === 'lead' && ['workspace','assigned'].includes(leadScope.scope)) {
      const query = currentAssignmentQuery(trx, identity);
      const count = await query.clone().whereNull('n.readAt').count<{ count: string }[]>({count:'n.id'}).first();
      unread += Number(count?.count ?? 0);
      const rows = await query.select('n.id','n.leadId','l.leadNumber','l.name','l.service','a.actorName','n.createdAt','n.readAt').orderBy('n.createdAt','desc').orderBy('n.id','desc').limit(take);
      items.push(...rows.map(row => ({ kind: 'lead' as const, id: row.id, leadId: row.leadId, leadNumber: leadNumber(row.leadNumber), leadName: row.name, service: row.service, assignerName: row.actorName ?? '', createdAt: row.createdAt.toISOString(), read: !!row.readAt })));
    }
    if (canReadWorkOrderNotifications(context)) {
      const query = workOrderNotificationQuery(trx, context);
      const count = await query.clone().whereNull('n.readAt').count<{ count: string }[]>({count:'n.id'}).first();
      unread += Number(count?.count ?? 0);
      const rows = await query.select('n.id','n.event','n.actorName','n.createdAt','n.readAt','w.id as workOrderId','w.workOrderNumber','w.title').orderBy('n.createdAt','desc').orderBy('n.id','desc').limit(take);
      items.push(...rows.map(row => ({ kind: 'work_order' as const, id: row.id, event: row.event, workOrderId: row.workOrderId, workOrderNumber: formatWorkOrderNumber(row.workOrderNumber), workOrderTitle: row.title, actorName: row.actorName, createdAt: row.createdAt.toISOString(), read: !!row.readAt })));
    }
    if (canReadMaterialNotifications(context)) {
      const query = materialNotificationQuery(trx, context);
      const count = await query.clone().whereNull('n.readAt').count<{ count: string }[]>({count:'n.id'}).first();
      unread += Number(count?.count ?? 0);
      const rows = await query.select('n.id','n.event','n.materialId','n.materialName','n.reason','n.actorName','n.createdAt','n.readAt').orderBy('n.createdAt','desc').orderBy('n.id','desc').limit(take);
      items.push(...rows.map(row => ({ kind: 'material' as const, id: row.id, event: row.event, materialId: row.materialId, materialName: row.materialName, reason: row.reason, actorName: row.actorName, createdAt: new Date(row.createdAt).toISOString(), read: !!row.readAt })));
    }
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
    const slice = items.slice((page-1)*20, page*20 + 1);
    return { items: slice.slice(0,20), unreadCount: unread, page, hasMore: slice.length > 20 };
  });
}
export async function markNotificationRead(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], id: string) {
  markNotificationReadSchema.parse({ workspaceId: identity.workspaceId, id });
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const scope = resolveAuthorizedCollectionScope(context,'leads.read');
    if (canReadMaterialNotifications(context) && await materialNotificationQuery(trx, context).where('n.id',id).first('n.id')) {
      await trx('materialNotifications').where({id,workspaceId:identity.workspaceId,userId:identity.userId}).whereNull('readAt').update({readAt:trx.fn.now()});
      return;
    }
    if (canReadWorkOrderNotifications(context) && await workOrderNotificationQuery(trx, context).where('n.id',id).first('n.id')) {
      await trx('workOrderNotifications').where({id,workspaceId:identity.workspaceId,userId:identity.userId}).whereNull('readAt').update({readAt:trx.fn.now()});
      return;
    }
    if (!scope.allowed || scope.resourceKind !== 'lead' || !['workspace','assigned'].includes(scope.scope) || !await currentAssignmentQuery(trx, identity).where('n.id',id).first('n.id')) throw new AuthorizationAccessError();
    await trx('assignmentNotifications').where({id,workspaceId:identity.workspaceId,userId:identity.userId}).whereNull('readAt').update({readAt:trx.fn.now()});
  });
}
