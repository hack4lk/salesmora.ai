'use client';
import { useState, useRef } from 'react';
import type { NotificationPreferences } from '@salesmora/contracts';
import { NotificationPreferencesPage } from './notification-preferences-page';
export function NotificationPreferencesRoute({workspaceId,initial}:{workspaceId:string;initial:NotificationPreferences}) {
  const [values,setValues] = useState(initial), [saved,setSaved] = useState(initial);
  const [saveState,setSaveState] = useState<'idle'|'pending'|'saved'|'error'>('idle');
  const saving=useRef(false);
  async function save(next:NotificationPreferences) {
    if(saving.current)return;saving.current=true;setSaveState('pending');
    try {
      const response=await fetch('/api/settings/notifications',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({workspaceId,...next})});
      if(!response.ok)throw Error();
      const result:NotificationPreferences=await response.json();setSaved(result);setValues(result);setSaveState('saved');
    } catch {setSaveState('error');} finally {saving.current=false;}
  }
  return <NotificationPreferencesPage settingsHref={`/settings?workspace=${encodeURIComponent(workspaceId)}`} state="ready" values={values} savedValues={saved} saveState={saveState}
    onChange={next=>{setValues(next);setSaveState('idle');}} onSave={next=>{void save(next);}} onDiscard={()=>{setValues(saved);setSaveState('idle');}} onRetry={()=>{}}/>;
}
