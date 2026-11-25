'use client';
import {useRef,useState} from 'react';
import {serviceSettingsSnapshotSchema,type ServiceSettingsSnapshot,type ServiceSettingsCommand} from '@salesmora/contracts';
import {FormFeedback} from '@salesmora/ui';
import {ServicesSettingsPage} from './services-settings-page';
import {SettingsQueryBoundary,useSettingsRequest} from '../use-settings-request';
import {isApiAccessError} from '../../api/api-query';
import {ApiRequestError} from '../../api/api-request';
export function ServicesSettingsRoute({initial}:{initial:ServiceSettingsSnapshot}) {
  return <SettingsQueryBoundary workspaceId={initial.workspaceId}><Host initial={initial}/></SettingsQueryBoundary>;
}
function Host({initial}:{initial:ServiceSettingsSnapshot}) {
  const [saved,setSaved]=useState(initial),[busy,setBusy]=useState(false),[conflict,setConflict]=useState(false),[denied,setDenied]=useState(false),[error,setError]=useState('');
  const lock=useRef(false),receipt=useRef<{signature:string;id:string}|null>(null);
  const path=`/api/settings/services?workspace=${encodeURIComponent(initial.workspaceId)}`;
  const parse=(raw:unknown)=>{const next=serviceSettingsSnapshotSchema.parse(raw);if(next.workspaceId!==initial.workspaceId)throw Error('Invalid workspace.');return next;};
  const api=useSettingsRequest('service-settings',path,parse,'Services could not be loaded or saved.');
  function failure(error:unknown){if(isApiAccessError(error))setDenied(true);else if(error instanceof ApiRequestError&&error.status===409)setConflict(true);else setError(error instanceof Error?error.message:'Services could not be saved.');}
  async function save(command:ServiceSettingsCommand){
    if(lock.current||!saved.canManage||conflict)throw Error('Reload services before saving.');lock.current=true;setBusy(true);setError('');
    const signature=JSON.stringify(command);if(receipt.current?.signature!==signature)receipt.current={signature,id:crypto.randomUUID()};
    try{const next=await api.write({path,method:'PUT',body:{workspaceId:initial.workspaceId,requestId:receipt.current.id,command},parse,failureMessage:'Services could not be saved.'});if(api.isActive()){setSaved(next);receipt.current=null;}}
    catch(error){if(api.isActive()){if(command.action==='set_workers'&&error instanceof ApiRequestError&&error.status===422)setConflict(true);failure(error);}throw error;}finally{lock.current=false;if(api.isActive())setBusy(false);}
  }
  async function reload(){if(lock.current)return;lock.current=true;setBusy(true);setError('');try{const next=await api.read();if(api.isActive()){setSaved(next);setConflict(false);receipt.current=null;}}catch(error){if(api.isActive())failure(error);}finally{lock.current=false;if(api.isActive())setBusy(false);}}
  if(denied)return <FormFeedback kind="error" message="Service settings are unavailable with your current access."/>;
  return <div className="grid gap-5">{error&&<FormFeedback kind="error" message={error}/>}<ServicesSettingsPage settingsHref={`/settings?workspace=${encodeURIComponent(initial.workspaceId)}`} qualifiedWorkers={saved.qualifications?{...saved.qualifications,onSave:command=>save({action:'set_workers',...command})}:undefined} services={saved.services} version={saved.version} canManage={saved.canManage} pending={busy} conflict={conflict} onSave={save} onReload={()=>void reload()}/></div>;
}
