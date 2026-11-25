'use client';
import { useState, useRef } from 'react';
import { notificationPreferencesSchema, type NotificationPreferences } from '@salesmora/contracts';
import { NotificationPreferencesPage } from './notification-preferences-page';
import { SettingsQueryBoundary, useSettingsRequest } from '../use-settings-request';
import { isApiAccessError } from '../../api/api-query';
import { notificationPreferencesPageData as copy } from './notification-preferences-page.data';
export function NotificationPreferencesRoute({workspaceId,initial}:{workspaceId:string;initial:NotificationPreferences}) {
  return <SettingsQueryBoundary workspaceId={workspaceId}><NotificationPreferencesHost workspaceId={workspaceId} initial={initial}/></SettingsQueryBoundary>;
}
function NotificationPreferencesHost({workspaceId,initial}:{workspaceId:string;initial:NotificationPreferences}) {
  const path = `/api/settings/notifications?workspace=${encodeURIComponent(workspaceId)}`;
  const api = useSettingsRequest('notification-preferences', path, notificationPreferencesSchema.parse, copy.loadError);
  const [values,setValues] = useState(initial), [saved,setSaved] = useState(initial);
  const [saveState,setSaveState] = useState<'idle'|'pending'|'saved'|'error'>('idle');
  const [state,setState] = useState<'ready'|'loading'|'error'>('ready');
  const saving=useRef(false);
  async function save(next:NotificationPreferences) {
    if(saving.current)return;saving.current=true;setSaveState('pending');
    try {
      const result = await api.write({ path: '/api/settings/notifications', method: 'PUT', body: {workspaceId,...next}, parse: notificationPreferencesSchema.parse, failureMessage: copy.saveError });
      setSaved(result);setValues(result);setSaveState('saved');
    } catch (error) {if (api.isActive()) {if (isApiAccessError(error)) setState('error');setSaveState('error');}} finally {saving.current=false;}
  }
  async function reload() {
    if (saving.current) return;
    saving.current = true;setState('loading');
    try {const next = await api.read();setSaved(next);setValues(next);setSaveState('idle');setState('ready');}
    catch {if (api.isActive()) setState('error');}
    finally {saving.current=false;}
  }
  return <NotificationPreferencesPage showWorkflowMaterialsReminders showWorkflowVisitReminders showWorkflowBriefings showVisitChanges showEstimateNotifications showDeadlineReminders showJobActivity jobActivityScope="all" state={state} values={values} savedValues={saved} saveState={saveState}
    onChange={next=>{setValues({...next,visitChangedEmail:next.visitChangedEmail ?? true,estimateEmail:next.estimateEmail ?? true,deadlineReminderEmail:next.deadlineReminderEmail ?? true,jobActivityEmail:next.jobActivityEmail ?? true,workflowBriefingEmail:next.workflowBriefingEmail ?? true,workflowMaterialsEmail:next.workflowMaterialsEmail ?? true,workflowVisitEmail:next.workflowVisitEmail ?? true});setSaveState('idle');}} onSave={next=>{void save({...next,visitChangedEmail:next.visitChangedEmail ?? true,estimateEmail:next.estimateEmail ?? true,deadlineReminderEmail:next.deadlineReminderEmail ?? true,jobActivityEmail:next.jobActivityEmail ?? true,workflowBriefingEmail:next.workflowBriefingEmail ?? true,workflowMaterialsEmail:next.workflowMaterialsEmail ?? true,workflowVisitEmail:next.workflowVisitEmail ?? true});}} onDiscard={()=>{setValues(saved);setSaveState('idle');}} onRetry={()=>{void reload();}}/>;
}
