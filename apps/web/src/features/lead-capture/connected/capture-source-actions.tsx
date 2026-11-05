'use client';
import { useEffect, useRef, useState } from 'react';
import type { CaptureDetailView } from '@salesmora/contracts';
import { CaptureDuplicateDialog } from '../capture-duplicate-dialog/capture-duplicate-dialog';
import { captureDuplicateName, type CaptureDuplicateRequest } from '../capture-duplicate-dialog/capture-duplicate-dialog.validation';
import { CaptureLaunchChangeDialog } from '../capture-launch-change-dialog/capture-launch-change-dialog';
import { CaptureCancelLaunchDialog } from '../capture-cancel-launch-dialog/capture-cancel-launch-dialog';
import type { CaptureLaunchChangeRequest } from '../capture-launch-change-dialog/capture-launch-change-dialog.validation';
import type { CaptureLaunchValue } from '../capture-setup-review/capture-setup-review.validation';
import { captureConfigurationRows } from './capture-adapters';
import { captureReadSource, captureWrite, captureScheduleWrite, CaptureRequestError } from './capture-api';
export type CaptureSourceAction='duplicate'|'change-launch'|'cancel-launch';
function wall(at:string,zone:string){const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(at)).map(part=>[part.type,part.value]));return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;}
/** Loads fresh canonical source data; editable dialog values never replace server-owned source/schedule identities. */
export function useCaptureSourceActions(workspaceId:string,onChanged:()=>void,onCreated:(sourceId:string)=>void){
  const [selection,setSelection]=useState<{action:CaptureSourceAction;view:CaptureDetailView}|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState<{kind:'error'|'conflict';message:string}>(),[message,setMessage]=useState(''),[name,setName]=useState(''),[timing,setTiming]=useState<CaptureLaunchValue>({mode:'scheduled',localDateTime:''});
  const lock=useRef(false),mounted=useRef(false),attempts=useRef(new Map<string,string>());
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
  async function open(sourceId:string,action:CaptureSourceAction){
    if(lock.current)return;lock.current=true;setBusy(true);setMessage('');
    try{const view=await captureReadSource(workspaceId,sourceId);if(!mounted.current)return;setSelection({action,view});setName(captureDuplicateName(view.detail.source.name));const schedule=view.publicationReview?.pending;setTiming({mode:'scheduled',localDateTime:schedule?wall(schedule.at,schedule.timezone):''});setError(undefined);}catch{if(mounted.current)setMessage('This source action is unavailable. Reload the latest source.');}finally{lock.current=false;if(mounted.current)setBusy(false);}
  }
  async function run(body:Record<string,unknown>,operation:CaptureSourceAction){
    if(lock.current||!selection)throw Error('Source action unavailable.');const key=JSON.stringify(body),requestId=attempts.current.get(key)??crypto.randomUUID();attempts.current.set(key,requestId);lock.current=true;setBusy(true);setError(undefined);
    try{const sourceId=selection.view.detail.source.id;if(operation==='duplicate'){const saved=await captureWrite(`/api/lead-capture/${sourceId}/duplicate`,'POST',{...body,requestId});if(mounted.current){setSelection(null);onCreated(saved.sourceId);}}else{await captureScheduleWrite(sourceId,{...body,requestId},operation==='cancel-launch'?'PUT':'PATCH');if(mounted.current){setSelection(null);onChanged();}}}catch(failure){if(mounted.current)setError({kind:failure instanceof CaptureRequestError&&failure.status===409?'conflict':'error',message:failure instanceof Error?failure.message:'The action failed. Reload before trying again.'});throw failure;}finally{lock.current=false;if(mounted.current)setBusy(false);}
  }
  function close(){if(!lock.current)setSelection(null);}
  async function reload(){if(!selection||lock.current)return;const view=await captureReadSource(workspaceId,selection.view.detail.source.id);if(mounted.current){setSelection({...selection,view});setError(undefined);}}
  let dialog=null;
  if(selection){const {source,approved,draft}=selection.view.detail,selected=approved??draft,kind=approved?'approved' as const:'draft' as const,review=selection.view.publicationReview,schedule=review?.pending,common={open:true,canRead:true,pending:busy,error,onClose:close,onReload:reload};
    if(selection.action==='duplicate'&&selected)dialog=<CaptureDuplicateDialog {...common} name={name} onNameChange={setName} source={{...source,canDuplicate:!!selection.view.canDuplicate,readiness:source.type==='gmail'&&selection.view.business.gmailAccess!=='available'?'blocked':'ready',configuration:{kind,version:selected.version,summary:captureConfigurationRows(selected.configuration,selection.view.business)}}} onConfirm={async(request:CaptureDuplicateRequest)=>{await run({workspaceId,sourceId:source.id,expectedVersion:source.version,confirmed:true,name:request.name,configuration:request.configuration},'duplicate');}}/>;
    else if(selection.action==='change-launch'&&schedule)dialog=<CaptureLaunchChangeDialog {...common} value={timing} onChange={setTiming} source={{...source,pendingRevision:source.status==='active',scheduledAt:schedule.at,timezone:schedule.timezone,canChange:!!review.canActivate,readiness:review.pendingReady?'ready':'blocked'}} onConfirm={async(request:CaptureLaunchChangeRequest)=>{const at=request.timing;await run({workspaceId,sourceId:source.id,expectedVersion:source.version,transitionId:schedule.id,confirmed:true,timing:at.kind==='now'?{kind:'now'}:{kind:'scheduled',at:at.at,timezone:at.timezone}},'change-launch');}}/>;
    else if(selection.action==='cancel-launch'&&schedule)dialog=<CaptureCancelLaunchDialog open source={source} pendingLaunch={schedule} canCancel={!!review.canActivate} pending={busy} error={error?.message} onClose={close} onConfirm={async()=>{await run({workspaceId,sourceId:source.id,expectedVersion:source.version,transitionId:schedule.id,confirmed:true},'cancel-launch');}}/>;
  }
  return {open,dialog,busy,message};
}
