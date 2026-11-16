'use client';
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
    items={notificationItems(pages).map(item=>item.kind==='capture'
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
          {label:copy.visitAfter,value:item.after.scheduledDate ? `${visitFormat.date(item.after.scheduledDate)} · ${item.after.arrivalWindow ? visitFormat.window(item.after.arrivalWindow) : visitFormat.noWindow}` : copy.visitNoDate}, {label:copy.visitTimezone,value:item.timezone}],
        recordLabels:item.records.map(r=>`${r.number} · ${r.title}`),actionLabel:item.records[0].type==='job' ? copy.viewJob : copy.viewWorkOrder,
        href:`/${item.records[0].type==='job'?'jobs':'work-orders'}/${encodeURIComponent(item.records[0].id)}?workspace=${encodeURIComponent(workspaceId)}`}
      :item.kind==='material'
      ?{id:item.id,title:copy.materialTitles[item.event],description:copy.materialDescription(item.event,item.actorName,item.materialName,item.reason),createdAt:item.createdAt,read:item.read,actionLabel:copy.viewMaterials,href:`/materials?workspace=${encodeURIComponent(workspaceId)}`}
      :item.kind==='work_order'
      ?{id:item.id,title:copy.workOrderTitles[item.event],description:copy.workOrderDescription(item.actorName,item.workOrderNumber,item.workOrderTitle),createdAt:item.createdAt,read:item.read,actionLabel:copy.viewWorkOrder,href:`/work-orders/${encodeURIComponent(item.workOrderId)}?workspace=${encodeURIComponent(workspaceId)}`}
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
