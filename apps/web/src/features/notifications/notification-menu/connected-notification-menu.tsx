'use client';
import { assignedLeadColdNotification } from '../../workflows/workflow-assigned-lead-cold/assigned-lead-cold-notification';
import {completionHandoffNotification} from '../../workflows/workflow-completion-handoff/completion-handoff-notification';
import { calendarWorkTimeSummary } from '@salesmora/domain';
import { workflowVisitNotificationItem } from "./workflow-visit-notification-item";
import { captureNotificationItem } from './capture-notification-item';
import { jobNotificationItem } from './job-notification-item';
import { useEffect, useRef } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiQueryScopeBoundary, useApiQueryScope, useApiViewerId } from '../../api/api-query-provider';
import { apiQueryKeys, isApiAccessError, removeDeniedApiQueries } from '../../api/api-query';
import { markNotificationReadOptions, notificationItems, notificationQueryOptions } from './notification-queries';
import { NotificationMenu } from './notification-menu';
import { calendarEventCardData as visitFormat } from '../../calendar/calendar-event-card/calendar-event-card.data';
import { notificationMenuData as copy } from './notification-menu.data';
export function ConnectedNotificationMenu({workspaceId,workspaceName}:{workspaceId:string;workspaceName:string}) {
  const viewerId = useApiViewerId();
  return <ApiQueryScopeBoundary scope={{ viewerId, workspaceId }}>
    <NotificationMenuQuery key={`${viewerId}:${workspaceId}`} workspaceName={workspaceName}/>
  </ApiQueryScopeBoundary>;
}

function NotificationMenuQuery({ workspaceName }: { workspaceName: string }) {
  const scope = useApiQueryScope(), client = useQueryClient();
  const { workspaceId } = scope;
  const marking = useRef(false);
  const query = useInfiniteQuery(notificationQueryOptions(scope));
  const queryKey = apiQueryKeys.resource(scope, 'notifications');
  const mark = useMutation(markNotificationReadOptions(client, scope));
  const accessError = isApiAccessError(mark.error) ? mark.error : query.error;
  useEffect(() => {
    removeDeniedApiQueries(client, queryKey, accessError);
  }, [client, queryKey, accessError]);
  const { refetch } = query;
  useEffect(() => {
    const refresh = () => { void refetch({ cancelRefetch: false }); };
    window.addEventListener('salesmora:notifications-refresh', refresh);
    return () => window.removeEventListener('salesmora:notifications-refresh', refresh);
  }, [refetch]);
  const failed = query.isError || isApiAccessError(accessError);
  const loading = query.isPending || (failed && query.isFetching);
  const state = loading ? 'loading' : failed ? 'error' : 'ready';
  const pages = state === 'ready' ? query.data?.pages ?? [] : [];
  return <NotificationMenu workspaceName={workspaceName} state={state} unreadCount={state==='ready'?pages[0]?.unreadCount ?? 0:null}
    items={notificationItems(pages).map(item=>item.kind==='workflow_visit'
      ?workflowVisitNotificationItem(item,workspaceId)
      :item.kind==='customer_schedule_change'
      ?{id:item.id,title:'Customer schedule update wasn’t sent',description:item.jobNumber,details:[{label:'Reason',value:item.reason}],createdAt:item.createdAt,read:item.read,actionLabel:item.visitId&&item.date?'Open visit':'Open job',href:item.visitId&&item.date?`/calendar?${new URLSearchParams({workspace:workspaceId,date:item.date,visit:item.visitId})}`:`/jobs/${item.jobId}?workspace=${encodeURIComponent(workspaceId)}`}
      :item.kind==='post_job'
      ?{id:item.id,title:'Customer thank-you wasn’t sent',description:item.jobNumber,details:[{label:'Reason',value:item.reason}],createdAt:item.createdAt,read:item.read,actionLabel:'Open job',href:`/jobs/${item.jobId}?workspace=${encodeURIComponent(workspaceId)}`}
      :item.kind==='completion_handoff'
      ?completionHandoffNotification({...item,workspaceId})
      :item.kind==='service_due'
      ?{id:item.id,title:item.annual?`Review ${item.serviceName} customers`:`${item.count} ${item.count===1?'customer is':'customers are'} due for ${item.serviceName}`,description:item.annual?`${item.count} past customers to review.`:'Review customers and prepare a service reminder email.',createdAt:item.createdAt,read:item.read,actionLabel:item.annual?'Review customers':'View customers',href:`/workflows/services/${item.workflowId}?workspace=${encodeURIComponent(workspaceId)}`}
      :item.kind==='workflow_cancellation'
      ?{id:item.id,title:'An opening is available',description:item.description,createdAt:item.createdAt,read:item.read,actionLabel:'Review replacements',href:`/workflows/openings/${item.openingId}?workspace=${encodeURIComponent(workspaceId)}`}
      :item.kind==='workflow_booking'
      ?{id:item.id,title:item.event==='booked'?`${item.jobNumber} was booked`:`${item.jobNumber} needs scheduling`,description:item.description,createdAt:item.createdAt,read:item.read,actionLabel:'Open job',href:`/jobs/${item.jobId}?workspace=${encodeURIComponent(workspaceId)}`}
      :item.kind==='workflow_briefing'
      ?{id:item.id,title:"Your Monday briefing is ready",description:`${item.snapshot.counts.inactiveLeads} inactive leads · ${item.snapshot.counts.awaitingEstimates} estimates awaiting a decision · ${item.snapshot.counts.unscheduledJobs} unscheduled jobs · ${item.snapshot.counts.dueSoonJobs} jobs due soon.`,createdAt:item.createdAt,read:item.read,actionLabel:"View briefing",href:`/workflows/briefings/${item.briefingId}?workspace=${encodeURIComponent(workspaceId)}`}
      :item.kind==='capture'
      ?captureNotificationItem(item,workspaceId)
      :item.kind==='job'
      ?jobNotificationItem(item,workspaceId,workspaceName)
      :item.kind==='deadline'
      ?{id:item.id,title:copy.deadlineTitles[item.event],description:copy.deadlineDescription(item.jobNumber,item.jobTitle),createdAt:item.createdAt,read:item.read,
        details:[{label:copy.deadlineDate,value:visitFormat.date(item.completionDeadline)},{label:copy.deadlineReminderDate,value:visitFormat.date(item.reminderDate)},{label:copy.visitTimezone,value:item.timezone}],
        actionLabel:copy.viewJob,href:`/jobs/${encodeURIComponent(item.jobId)}?workspace=${encodeURIComponent(workspaceId)}`}
      :item.kind==='visit'
      ?{id:item.id,title:copy.visitTitles[item.event],description:item.event==='joined' ? copy.visitJoinedDescription(item.actorName) : item.event==='separated' ? copy.visitSeparatedDescription(item.actorName) : copy.visitDescription(item.actorName),createdAt:item.createdAt,read:item.read,
        details:[{label:copy.visitBefore,value:item.before.scheduledDate ? `${visitFormat.date(item.before.scheduledDate)} · ${item.before.arrivalWindow ? visitFormat.window(item.before.arrivalWindow) : visitFormat.noWindow}` : copy.visitNoDate},
          {label:copy.visitAfter,value:item.after.scheduledDate ? `${visitFormat.date(item.after.scheduledDate)} · ${item.after.arrivalWindow ? visitFormat.window(item.after.arrivalWindow) : visitFormat.noWindow}` : copy.visitNoDate}, {label:copy.visitTimezone,value:item.timezone}, ...(item.before.workTime || item.after.workTime ? [{label:'Previous planned work',value:item.before.workTime ? `${calendarWorkTimeSummary(item.before.workTime)?.range}${item.before.workTimezone && item.before.workTimezone !== item.timezone ? ` · ${item.before.workTimezone}` : ''}` : 'Not recorded'}, {label:'Planned work',value:item.after.workTime ? `${calendarWorkTimeSummary(item.after.workTime)?.range}${item.after.workTimezone && item.after.workTimezone !== item.timezone ? ` · ${item.after.workTimezone}` : ''}` : 'Not recorded'}] : [])],
        recordLabels:item.records.map(r=>`${r.number} · ${r.title}`),actionLabel:item.records[0].type==='job' ? copy.viewJob : copy.viewWorkOrder,
        href:`/${item.records[0].type==='job'?'jobs':'work-orders'}/${encodeURIComponent(item.records[0].id)}?workspace=${encodeURIComponent(workspaceId)}`}
      :item.kind==='material'
      ?{id:item.id,title:copy.materialTitles[item.event],description:copy.materialDescription(item.event,item.actorName,item.materialName,item.reason),createdAt:item.createdAt,read:item.read,actionLabel:copy.viewMaterials,href:`/materials?workspace=${encodeURIComponent(workspaceId)}`}
      :item.kind==='work_order'
      ?{id:item.id,title:copy.workOrderTitles[item.event],description:copy.workOrderDescription(item.actorName,item.workOrderNumber,item.workOrderTitle),createdAt:item.createdAt,read:item.read,actionLabel:copy.viewWorkOrder,href:`/work-orders/${encodeURIComponent(item.workOrderId)}?workspace=${encodeURIComponent(workspaceId)}`}
      :item.kind==='lead_workflow'
      ?item.businessDays?assignedLeadColdNotification({id:item.id,workspaceId,createdAt:item.createdAt,read:item.read,businessDays:item.businessDays,lead:{id:item.leadId,number:item.leadNumber,name:item.leadName}}):{id:item.id,title:copy.leadWorkflowTitle,description:copy.leadWorkflowDescription(item.leadNumber,item.leadName),createdAt:item.createdAt,read:item.read,actionLabel:copy.viewLead,href:`/leads/${encodeURIComponent(item.leadId)}?workspace=${encodeURIComponent(workspaceId)}`}
      :item.kind==='estimate'
      ?{id:item.id,title:copy.estimateTitles[item.event],description:copy.estimateDescription(item.estimateNumber,item.estimateName,item.status),createdAt:item.createdAt,read:item.read,actionLabel:copy.viewEstimate,href:`/estimates/${encodeURIComponent(item.estimateId)}?workspace=${encodeURIComponent(workspaceId)}`}
      :{id:item.id,title:copy.assignmentTitle,description:copy.assignmentDescription(item.assignerName,item.leadNumber,item.leadName,item.service),createdAt:item.createdAt,read:item.read,href:`/leads/${encodeURIComponent(item.leadId)}?workspace=${encodeURIComponent(workspaceId)}`})}
    preferencesHref={`/settings/notifications?workspace=${encodeURIComponent(workspaceId)}`}
    pendingId={mark.isPending ? mark.variables : undefined} actionError={mark.isError} hasMore={state === 'ready' && query.hasNextPage} loadingMore={query.isFetching}
    onOpen={()=>{void refetch({ cancelRefetch: false });}}
    onRetry={()=>{void refetch({ cancelRefetch: false }).then(result => { if (result.isSuccess) mark.reset(); });}}
    onMarkRead={id=>{
      if (marking.current || mark.isPending) return;
      marking.current = true;
      mark.mutate(id, { onSettled: () => { marking.current = false; } });
    }}
    onLoadMore={()=>{if (!query.isFetching && query.hasNextPage) { mark.reset();void query.fetchNextPage(); }}}/>;
}
