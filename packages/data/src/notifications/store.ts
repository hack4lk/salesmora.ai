import { scheduleChangeNotificationQuery } from '../workflows/customer-schedule-changes';
import { postJobNotificationQuery } from '../workflows/post-job';
import {handoffNotificationQuery} from '../workflows/completion-handoff';
import {completionHandoffSnapshotSchema} from '@salesmora/contracts';
import {serviceDueNotificationQuery} from './service-due';
import {cancellationNotificationQuery} from "./workflow-cancellation";
import { bookingNotificationQuery, bookingNoticeDescription } from "./workflow-booking";
import { workflowVisitNotificationQuery } from "./workflow-visits";
import { briefingNotificationQuery } from "./workflow-briefings";
import { leadWorkflowNotificationQuery } from "./lead-workflows";
import { jobNotificationQuery, readJobNotifications } from './jobs';
import { deadlineNotificationQuery, readDeadlineNotifications } from './deadlines';
import { visitNotificationQuery, projectVisitNotification, canReadVisitNotifications } from './visits';
import type { Knex } from 'knex';
import { workflowVisitSnapshotSchema, workflowBriefingSnapshotSchema, captureNoticeReasonSchema, estimateNotificationEventSchema, estimateStatusSchema, notificationPreferencesSchema, notificationQuerySchema, markNotificationReadSchema, type NotificationPreferences, type NotificationRecord, type NotificationResult, type AuthorizationContext, type PermissionId } from '@salesmora/contracts';
import { resolveAuthorizedCollectionScope, canReadWorkflowRecords } from '@salesmora/domain';
import { scoped, formatWorkOrderNumber } from '../work-orders/store';
import { materialAccess } from '../materials/store';
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';
import { canReadEstimateNotifications, estimateNotificationQuery } from './estimates';
export async function readNotificationPreferences(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[]) {
  return withWorkspaceAuthorization(db, identity, enabled, false, async trx => {
    const row = await trx('notificationPreferences').where({ userId: identity.userId }).first('leadAssignedEmail', 'visitChangedEmail', 'estimateEmail', 'deadlineReminderEmail', 'jobActivityEmail', 'workflowBriefingEmail', 'workflowVisitEmail', 'workflowMaterialsEmail');
    return notificationPreferencesSchema.parse(row ?? { leadAssignedEmail: true, estimateEmail: true });
  });
}
export async function saveNotificationPreferences(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: Omit<NotificationPreferences, "visitChangedEmail" | "estimateEmail" | "deadlineReminderEmail" | "jobActivityEmail" | "workflowBriefingEmail" | "workflowVisitEmail" | "workflowMaterialsEmail"> & { workflowMaterialsEmail?: boolean; workflowVisitEmail?: boolean; workflowBriefingEmail?: boolean; visitChangedEmail?: boolean; estimateEmail?: boolean; deadlineReminderEmail?: boolean; jobActivityEmail?: boolean }) {
  return withWorkspaceAuthorization(db, identity, enabled, true, async trx => {
    await trx('users').where({ id: identity.userId }).forUpdate().first('id');
    const existing = await trx('notificationPreferences').where({ userId: identity.userId }).first('visitChangedEmail', 'estimateEmail', 'deadlineReminderEmail', 'jobActivityEmail', 'workflowBriefingEmail', 'workflowVisitEmail', 'workflowMaterialsEmail');
    const values = notificationPreferencesSchema.parse({
      leadAssignedEmail: raw.leadAssignedEmail,
      workflowMaterialsEmail: raw.workflowMaterialsEmail ?? existing?.workflowMaterialsEmail ?? true,
      workflowVisitEmail: raw.workflowVisitEmail ?? existing?.workflowVisitEmail ?? true,
      workflowBriefingEmail: raw.workflowBriefingEmail ?? existing?.workflowBriefingEmail ?? true,
      visitChangedEmail: raw.visitChangedEmail ?? existing?.visitChangedEmail ?? true,
      estimateEmail: raw.estimateEmail ?? existing?.estimateEmail ?? true,
      deadlineReminderEmail: raw.deadlineReminderEmail ?? existing?.deadlineReminderEmail ?? true,
      jobActivityEmail: raw.jobActivityEmail ?? existing?.jobActivityEmail ?? true,
    });
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
  return trx('materialNotifications as n').where({ 'n.workspaceId': context.workspaceId, 'n.userId': context.userId }).whereNotIn('n.event', hiddenMaterialEvents(context));
}
// Proposal alerts are for approvers only; a proposer's decision notices need just read access.
const hiddenMaterialEvents = (context: AuthorizationContext) => materialAccess(context).manage ? [] : ['proposed'];
const canReadMaterialNotifications = (context: AuthorizationContext) => materialAccess(context).read;
function captureNoticeQuery(trx: Knex.Transaction, context: AuthorizationContext) {
  return trx('captureAdminNotices as n').join('captureSources as s', function () { this.on('s.id','n.sourceId').andOn('s.workspaceId','n.workspaceId'); }).where({ 'n.workspaceId': context.workspaceId, 'n.userId': context.userId });
}
const canReadCaptureNotices = (context: AuthorizationContext) => ['owner','admin'].includes(context.membership.role) && resolveAuthorizedCollectionScope(context, 'leadCapture.read').allowed;
export async function readNotifications(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], page = 1): Promise<NotificationResult> {
  notificationQuerySchema.parse({ workspaceId: identity.workspaceId, page });
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const take = page * 20 + 1, items: NotificationRecord[] = [];
    let unread = 0;
    if (canReadWorkflowRecords(context, "unassigned_visit")) {
      const visits = await workflowVisitNotificationQuery(trx, context).whereNull('n.readAt')
        .select('n.id','n.visitId','n.createdAt','n.readAt','n.snapshot', trx.raw('count(*) OVER() AS total'))
        .orderBy('n.createdAt','desc').orderBy('n.id','desc').limit(take);
      unread += Number(visits[0]?.total ?? 0);
      items.push(...visits.map(row => ({ kind: 'workflow_visit' as const, id: row.id, visitId: row.visitId,
        snapshot: workflowVisitSnapshotSchema.parse(row.snapshot), createdAt: row.createdAt.toISOString(), read: !!row.readAt })));
    }
    if(canReadWorkflowRecords(context,'customer_schedule_change')){
      const rows=await scheduleChangeNotificationQuery(trx,context).whereNull('n.readAt').select('n.id','n.jobId','j.jobNumber','n.reason','n.createdAt',trx.raw(`(SELECT jsonb_build_object('id',v.id,'date',to_char(v."scheduledDate",'YYYY-MM-DD')) FROM "customerScheduleNotices" notice JOIN "calendarVisitRecords" r ON r."workspaceId"=notice."workspaceId" JOIN "calendarVisits" v ON v."workspaceId"=r."workspaceId" AND v.id=r."visitId" WHERE notice."workspaceId"=n."workspaceId" AND notice.id=n."noticeId" AND r."endedAt" IS NULL AND v."scheduledDate" IS NOT NULL AND EXISTS(SELECT 1 FROM jsonb_array_elements(notice."sourceRefs") x WHERE (x->>'type'='job' AND r."jobId"=(x->>'id')::uuid) OR (x->>'type'='work_order' AND r."workOrderId"=(x->>'id')::uuid)) ORDER BY (v.id=notice."visitId") DESC,v.id LIMIT 1) AS visit`),trx.raw('count(*) OVER() total')).orderBy('n.createdAt','desc').orderBy('n.id','desc').limit(take);
      unread+=Number(rows[0]?.total??0);items.push(...rows.map(row=>({kind:'customer_schedule_change' as const,id:row.id,jobId:row.jobId,jobNumber:`J-${String(row.jobNumber).padStart(4,'0')}`,visitId:row.visit?.id??null,date:row.visit?.date??null,reason:row.reason,createdAt:row.createdAt.toISOString(),read:false})));
    }
    if(canReadWorkflowRecords(context,'post_job_thank_you')){
      const rows=await postJobNotificationQuery(trx,context).whereNull('n.readAt').select('n.id','n.jobId','j.jobNumber','n.reason','n.createdAt',trx.raw('count(*) OVER() total')).orderBy('n.createdAt','desc').orderBy('n.id','desc').limit(take);
      unread+=Number(rows[0]?.total??0);items.push(...rows.map(row=>({kind:'post_job' as const,id:row.id,jobId:row.jobId,jobNumber:`J-${String(row.jobNumber).padStart(4,'0')}`,reason:row.reason,createdAt:row.createdAt.toISOString(),read:false})));
    }
    if(canReadWorkflowRecords(context,'completion_handoff')){
      const rows=await handoffNotificationQuery(trx,context).whereNull('n.readAt').select('n.id','n.snapshot','n.createdAt',trx.raw('count(*) OVER() total')).orderBy('n.createdAt','desc').orderBy('n.id','desc').limit(take);
      unread+=Number(rows[0]?.total??0);items.push(...rows.map(row=>({kind:'completion_handoff' as const,id:row.id,snapshot:completionHandoffSnapshotSchema.parse(row.snapshot),createdAt:row.createdAt.toISOString(),read:false})));
    }
    if(canReadWorkflowRecords(context,'service_due')){
      const rows=await serviceDueNotificationQuery(trx,context).whereNull('n.readAt').select('n.id','n.workflowId','service.name as serviceName',trx.raw("(w.definition->>'kind'='annual_service_review') AS annual"),'n.count','n.createdAt',trx.raw('count(*) OVER() total')).orderBy('n.createdAt','desc').orderBy('n.id','desc').limit(take);
      unread+=Number(rows[0]?.total??0);items.push(...rows.map(row=>({kind:'service_due' as const,id:row.id,workflowId:row.workflowId,serviceName:row.serviceName,annual:!!row.annual,count:row.count,createdAt:row.createdAt.toISOString(),read:false})));
    }
    if(canReadWorkflowRecords(context,'cancellation_fill')){
      const rows=await cancellationNotificationQuery(trx,context).whereNull('n.readAt').select('n.id','n.openingId','n.description','n.createdAt',trx.raw('count(*) OVER() total')).orderBy('n.createdAt','desc').orderBy('n.id','desc').limit(take);
      unread+=Number(rows[0]?.total??0);items.push(...rows.map(row=>({kind:'workflow_cancellation' as const,id:row.id,openingId:row.openingId,description:row.description,createdAt:row.createdAt.toISOString(),read:false})));
    }
    if(canReadWorkflowRecords(context,'routine_booking')) {
      const rows=await bookingNotificationQuery(trx,context).whereNull('n.readAt').select('n.id','n.jobId','j.jobNumber','n.event','n.snapshot','n.createdAt',trx.raw('count(*) OVER() AS total')).orderBy('n.createdAt','desc').orderBy('n.id','desc').limit(take);
      unread+=Number(rows[0]?.total??0);
      items.push(...rows.map(row=>({kind:'workflow_booking' as const,id:row.id,jobId:row.jobId,jobNumber:`J-${String(row.jobNumber).padStart(4,'0')}`,event:row.event,description:bookingNoticeDescription(row.snapshot),createdAt:row.createdAt.toISOString(),read:false})));
    }
    if (canReadWorkflowRecords(context, "weekly_briefing")) {
      const briefings = await briefingNotificationQuery(trx, context).whereNull('n.readAt')
        .select('n.id','n.briefingId','n.createdAt','n.readAt','b.snapshot', trx.raw('count(*) OVER() AS total'))
        .orderBy('n.createdAt','desc').orderBy('n.id','desc').limit(take);
      unread += Number(briefings[0]?.total ?? 0);
      items.push(...briefings.map(row => ({ kind: 'workflow_briefing' as const, id: row.id, briefingId: row.briefingId,
        snapshot: workflowBriefingSnapshotSchema.parse(row.snapshot), createdAt: row.createdAt.toISOString(), read: !!row.readAt })));
    }
    if (canReadCaptureNotices(context)) {
      const query = captureNoticeQuery(trx, context).whereNull('n.readAt');
      unread += Number((await query.clone().whereNull('n.readAt').count({ count: 'n.id' }).first())?.count ?? 0);
      const rows = await query.select('n.id','n.sourceId','s.name as sourceName','n.reason','n.createdAt','n.readAt').orderBy('n.createdAt','desc').orderBy('n.id','desc').limit(take);
      items.push(...rows.map(row => ({ kind: 'capture' as const, id: row.id, sourceId: row.sourceId, sourceName: row.sourceName, reason: captureNoticeReasonSchema.parse(row.reason), createdAt: row.createdAt.toISOString(), read: !!row.readAt })));
    }
    const leadScope = resolveAuthorizedCollectionScope(context,'leads.read');
    if (leadScope.allowed && leadScope.resourceKind === 'lead' && ['workspace','assigned'].includes(leadScope.scope)) {
      const query = currentAssignmentQuery(trx, identity).where('n.inApp', true).whereNull('n.readAt');
      const count = await query.clone().whereNull('n.readAt').count<{ count: string }[]>({count:'n.id'}).first();
      unread += Number(count?.count ?? 0);
      const rows = await query.select('n.id','n.leadId','l.leadNumber','l.name','l.service','a.actorName','n.createdAt','n.readAt').orderBy('n.createdAt','desc').orderBy('n.id','desc').limit(take);
      items.push(...rows.map(row => ({ kind: 'lead' as const, id: row.id, leadId: row.leadId, leadNumber: leadNumber(row.leadNumber), leadName: row.name, service: row.service, assignerName: row.actorName ?? '', createdAt: row.createdAt.toISOString(), read: !!row.readAt })));
    }
    if (leadScope.allowed && ['workspace','assigned'].includes(leadScope.scope)) {
      const query = leadWorkflowNotificationQuery(trx, context).whereNull('n.readAt');
      unread += Number((await query.clone().count({ count: 'n.id' }).first())?.count ?? 0);
      const rows = await query.select('n.id','n.leadId','l.leadNumber','l.name','n.businessDays','n.createdAt','n.readAt')
        .orderBy('n.createdAt','desc').orderBy('n.id','desc').limit(take);
      items.push(...rows.map(row => ({ kind: 'lead_workflow' as const,...(row.businessDays?{businessDays:row.businessDays}:{}), id: row.id, leadId: row.leadId,
        leadNumber: leadNumber(row.leadNumber), leadName: row.name, createdAt: new Date(row.createdAt).toISOString(), read: !!row.readAt })));
    }
    if (canReadEstimateNotifications(context)) {
      const query = estimateNotificationQuery(trx, context).whereNull('n.readAt');
      const count = await query.clone().whereNull('n.readAt').count<{ count: string }[]>({ count: 'n.id' }).first();
      unread += Number(count?.count ?? 0);
      const rows = await query.select(
        'n.id', 'n.event', 'n.createdAt', 'n.readAt',
        'e.id as estimateId', 'e.estimateNumber', 'e.name as estimateName',
        trx.raw(`CASE WHEN e.status IN ('sent','published')
          AND e."validUntil" < (now() AT TIME ZONE w.timezone)::date
          THEN 'expired' ELSE e.status END AS "currentStatus"`),
      ).orderBy('n.createdAt', 'desc').orderBy('n.id', 'desc').limit(take);
      items.push(...rows.map(row => ({
        kind: 'estimate' as const,
        id: row.id,
        event: estimateNotificationEventSchema.parse(row.event),
        estimateId: row.estimateId,
        estimateNumber: `EST-${String(row.estimateNumber).padStart(4, '0')}`,
        estimateName: row.estimateName,
        status: estimateStatusSchema.parse(row.currentStatus),
        createdAt: new Date(row.createdAt).toISOString(),
        read: !!row.readAt,
      })));
    }
    if (canReadWorkOrderNotifications(context)) {
      const query = workOrderNotificationQuery(trx, context).whereNull('n.readAt');
      const count = await query.clone().whereNull('n.readAt').count<{ count: string }[]>({count:'n.id'}).first();
      unread += Number(count?.count ?? 0);
      const rows = await query.select('n.id','n.event','n.actorName','n.createdAt','n.readAt','w.id as workOrderId','w.workOrderNumber','w.title').orderBy('n.createdAt','desc').orderBy('n.id','desc').limit(take);
      items.push(...rows.map(row => ({ kind: 'work_order' as const, id: row.id, event: row.event, workOrderId: row.workOrderId, workOrderNumber: formatWorkOrderNumber(row.workOrderNumber), workOrderTitle: row.title, actorName: row.actorName, createdAt: row.createdAt.toISOString(), read: !!row.readAt })));
    }
    if (canReadMaterialNotifications(context)) {
      const query = materialNotificationQuery(trx, context).whereNull('n.readAt');
      const count = await query.clone().whereNull('n.readAt').count<{ count: string }[]>({count:'n.id'}).first();
      unread += Number(count?.count ?? 0);
      const rows = await query.select('n.id','n.event','n.materialId','n.materialName','n.reason','n.actorName','n.createdAt','n.readAt').orderBy('n.createdAt','desc').orderBy('n.id','desc').limit(take);
      items.push(...rows.map(row => ({ kind: 'material' as const, id: row.id, event: row.event, materialId: row.materialId, materialName: row.materialName, reason: row.reason, actorName: row.actorName, createdAt: new Date(row.createdAt).toISOString(), read: !!row.readAt })));
    }
    if (canReadVisitNotifications(context)) {
      const visits = visitNotificationQuery(trx, context).whereNull('n.readAt');
      unread += Number((await visits.clone().whereNull('n.readAt').count({ count: 'n.id' }).first())?.count ?? 0);
      for (const row of await visits.select('n.*').orderBy('n.createdAt', 'desc').orderBy('n.id', 'desc').limit(take)) {
        const projected = await projectVisitNotification(trx, context, row); if (projected) items.push(projected);
      }
    }
    const jobs = await readJobNotifications(trx, context, take, true);
    unread += jobs.unread; items.push(...jobs.items);
    const deadlines = await readDeadlineNotifications(trx, context, take, true);
    unread += deadlines.unread; items.push(...deadlines.items);
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
    const slice = items.slice((page-1)*20, page*20 + 1);
    return { items: slice.slice(0,20), unreadCount: unread, page, hasMore: slice.length > 20 };
  });
}
export async function markNotificationRead(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], id: string) {
  markNotificationReadSchema.parse({ workspaceId: identity.workspaceId, id });
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    if (canReadWorkflowRecords(context, 'unassigned_visit') && await workflowVisitNotificationQuery(trx, context).where('n.id', id).first('n.id')) {
      await trx('workflowVisitNotifications').where({ workspaceId: identity.workspaceId, userId: identity.userId, id }).whereNull('readAt').update({ readAt: trx.fn.now() }); return;
    }
    if(await scheduleChangeNotificationQuery(trx,context).where('n.id',id).first('n.id')){await trx('customerScheduleNotifications').where({id,userId:context.userId,workspaceId:context.workspaceId}).whereNull('readAt').update({readAt:trx.fn.now()});return;}
    if(await postJobNotificationQuery(trx,context).where('n.id',id).first('n.id')){await trx('postJobNotifications').where({id,userId:context.userId,workspaceId:context.workspaceId}).whereNull('readAt').update({readAt:trx.fn.now()});return;}
    if(await handoffNotificationQuery(trx,context).where('n.id',id).first('n.id')){await trx('workflowHandoffNotifications').where({id,userId:context.userId,workspaceId:context.workspaceId}).whereNull('readAt').update({readAt:trx.fn.now()});return;}
    if(await serviceDueNotificationQuery(trx,context).where('n.id',id).first('n.id')){await trx('workflowServiceDueNotifications').where({id,userId:context.userId,workspaceId:context.workspaceId}).whereNull('readAt').update({readAt:trx.fn.now()});return;}
    if(await cancellationNotificationQuery(trx,context).where('n.id',id).first('n.id')){await trx('workflowCancellationNotifications').where({id,userId:context.userId,workspaceId:context.workspaceId}).update({readAt:trx.fn.now()});return {ok:true as const};}
    if(await bookingNotificationQuery(trx,context).where('n.id',id).first('n.id')) {await trx('workflowBookingNotifications').where({id,userId:context.userId,workspaceId:context.workspaceId}).whereNull('readAt').update({readAt:trx.fn.now()});return {ok:true as const};}
    if (canReadWorkflowRecords(context, 'weekly_briefing') && await briefingNotificationQuery(trx, context).where('n.id', id).first('n.id')) {
      await trx('workflowBriefingNotifications').where({ workspaceId: identity.workspaceId, userId: identity.userId, id })
        .whereNull('readAt').update({ readAt: trx.fn.now() }); return;
    }
    if (await leadWorkflowNotificationQuery(trx, context).where('n.id', id).first('n.id')) {
      await trx('leadWorkflowNotifications').where({ workspaceId: identity.workspaceId, userId: identity.userId, id })
        .whereNull('readAt').update({ readAt: trx.fn.now() }); return;
    }
    if (canReadCaptureNotices(context) && await captureNoticeQuery(trx, context).where('n.id',id).first('n.id')) {
      await trx('captureAdminNotices').where({ workspaceId: identity.workspaceId, userId: identity.userId, id }).whereNull('readAt').update({ readAt: trx.fn.now() }); return;
    }
    if (await jobNotificationQuery(trx, context).where('n.id', id).first('n.id')) {
      await trx('jobNotifications').where({ id, workspaceId: identity.workspaceId, userId: identity.userId }).whereNull('readAt').update({ readAt: trx.fn.now() });
      return;
    }
    if (await deadlineNotificationQuery(trx, context).where('n.id', id).first('n.id')) {
      await trx('deadlineNotifications').where({ id, workspaceId: identity.workspaceId, userId: identity.userId }).whereNull('readAt').update({ readAt: trx.fn.now() });
      return;
    }
    if (canReadEstimateNotifications(context) && await estimateNotificationQuery(trx, context).where('n.id', id).first('n.id')) {
      await trx('estimateNotifications').where({ id, workspaceId: identity.workspaceId, userId: identity.userId }).whereNull('readAt').update({ readAt: trx.fn.now() });
      return;
    }
    if (canReadVisitNotifications(context) && await visitNotificationQuery(trx, context).where('n.id', id).first('n.id')) {
      await trx('visitNotifications').where({ id, workspaceId: identity.workspaceId, userId: identity.userId }).whereNull('readAt').update({ readAt: trx.fn.now() }); return;
    }
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
