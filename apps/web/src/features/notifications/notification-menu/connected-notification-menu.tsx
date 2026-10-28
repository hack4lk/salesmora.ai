'use client';
import { jobNotificationItem } from './job-notification-item';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { NotificationResult } from '@salesmora/contracts';
import { NotificationMenu } from './notification-menu';
import { calendarEventCardData as visitFormat } from '../../calendar/calendar-event-card/calendar-event-card.data';
import { notificationMenuData as copy } from './notification-menu.data';
export function ConnectedNotificationMenu({workspaceId,workspaceName}:{workspaceId:string;workspaceName:string}) {
  const [result,setResult]=useState<NotificationResult>({items:[],unreadCount:0,page:1,hasMore:false});
  const [state,setState]=useState<'loading'|'ready'|'error'>('loading');
  const [pendingId,setPendingId]=useState<string>(), [actionError,setActionError]=useState(false),[loadingMore,setLoadingMore]=useState(false);
  const request=useRef<AbortController|undefined>(undefined), generation=useRef(0), marking=useRef(false);
  const refresh=useCallback(async()=>{
    const token=++generation.current; request.current?.abort(); const abort=new AbortController();request.current=abort;
    try {
      const response=await fetch(`/api/notifications?workspace=${encodeURIComponent(workspaceId)}`,{cache:'no-store',signal:abort.signal});
      if(!response.ok)throw Error();const next:NotificationResult=await response.json();
      if(token===generation.current){setResult(next);setState('ready');setLoadingMore(false);}
    } catch {if(!abort.signal.aborted && token===generation.current){setResult({items:[],unreadCount:0,page:1,hasMore:false});setState('error');setLoadingMore(false);}}
  },[workspaceId]);
  useEffect(()=>{
    const onRefresh=()=>{void refresh();};const startup=setTimeout(onRefresh,0);
    const timer=setInterval(()=>{if(document.visibilityState==='visible')void refresh();},15000);
    window.addEventListener('focus',onRefresh);window.addEventListener('salesmora:notifications-refresh',onRefresh);
    return()=>{clearTimeout(startup);clearInterval(timer);window.removeEventListener('focus',onRefresh);window.removeEventListener('salesmora:notifications-refresh',onRefresh);request.current?.abort();};
  },[refresh]);
  async function mark(id:string) {
    if(marking.current)return;marking.current=true;setPendingId(id);setActionError(false);
    try {const response=await fetch('/api/notifications/read',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({workspaceId,id})});if(!response.ok)throw Error();await refresh();}
    catch {setActionError(true);await refresh();}finally{marking.current=false;setPendingId(undefined);}
  }
  async function older() {
    if(loadingMore || !result.hasMore)return;const token=generation.current;setLoadingMore(true);setActionError(false);
    try {
      const response=await fetch(`/api/notifications?workspace=${encodeURIComponent(workspaceId)}&page=${result.page+1}`,{cache:'no-store'});if(!response.ok)throw Error();const next:NotificationResult=await response.json();
      if(token===generation.current)setResult(old=>({...next,items:[...new Map([...old.items,...next.items].map(item=>[item.id,item])).values()]}));
    } catch {if(token===generation.current){setState('error');setResult({items:[],unreadCount:0,page:1,hasMore:false});}}finally{if(token===generation.current)setLoadingMore(false);}
  }
  return <NotificationMenu workspaceName={workspaceName} state={state} unreadCount={state==='ready'?result.unreadCount:null}
    items={result.items.map(item=>item.kind==='job'
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
    preferencesHref={`/settings/notifications?workspace=${encodeURIComponent(workspaceId)}`} pendingId={pendingId} actionError={actionError} hasMore={result.hasMore} loadingMore={loadingMore}
    onOpen={()=>{void refresh();}} onRetry={()=>{setState('loading');void refresh();}} onMarkRead={id=>{void mark(id);}} onLoadMore={()=>{void older();}}/>;
}
