'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { NotificationResult } from '@salesmora/contracts';
import { NotificationMenu } from './notification-menu';
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
    items={result.items.map(item=>item.kind==='work_order'
      ?{id:item.id,title:copy.workOrderTitles[item.event],description:copy.workOrderDescription(item.actorName,item.workOrderNumber,item.workOrderTitle),createdAt:item.createdAt,read:item.read,actionLabel:copy.viewWorkOrder,href:`/work-orders/${encodeURIComponent(item.workOrderId)}?workspace=${encodeURIComponent(workspaceId)}`}
      :{id:item.id,title:copy.assignmentTitle,description:copy.assignmentDescription(item.assignerName,item.leadNumber,item.leadName,item.service),createdAt:item.createdAt,read:item.read,href:`/leads/${encodeURIComponent(item.leadId)}?workspace=${encodeURIComponent(workspaceId)}`})}
    preferencesHref={`/settings/notifications?workspace=${encodeURIComponent(workspaceId)}`} pendingId={pendingId} actionError={actionError} hasMore={result.hasMore} loadingMore={loadingMore}
    onOpen={()=>{void refresh();}} onRetry={()=>{setState('loading');void refresh();}} onMarkRead={id=>{void mark(id);}} onLoadMore={()=>{void older();}}/>;
}
