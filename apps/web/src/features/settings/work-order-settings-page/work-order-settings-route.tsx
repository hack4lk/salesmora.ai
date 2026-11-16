'use client';
import { useRef, useState } from 'react';
import { workOrderSettingsSchema, type WorkOrderSettings } from '@salesmora/contracts';
import { WorkOrderSettingsPage } from './work-order-settings-page';
import { SettingsQueryBoundary, useSettingsRequest } from '../use-settings-request';
import { isApiAccessError } from '../../api/api-query';
import { workOrderSettingsPageData as copy } from './work-order-settings-page.data';
import { FormFeedback } from '@salesmora/ui';

export function WorkOrderSettingsRoute({ workspaceId, initial, canEdit }: { workspaceId: string; initial: WorkOrderSettings; canEdit: boolean }) {
  return <SettingsQueryBoundary workspaceId={workspaceId}><WorkOrderSettingsHost workspaceId={workspaceId} initial={initial} canEdit={canEdit}/></SettingsQueryBoundary>;
}
function WorkOrderSettingsHost({ workspaceId, initial, canEdit }: { workspaceId: string; initial: WorkOrderSettings; canEdit: boolean }) {
  const parse = (raw: unknown) => workOrderSettingsSchema.omit({ workspaceId: true }).parse(raw);
  const api = useSettingsRequest('work-order-settings', `/api/settings/work-orders?workspace=${encodeURIComponent(workspaceId)}`, parse, copy.saveError);
  const [values, setValues] = useState(initial), [saved, setSaved] = useState(initial), [saveState, setSaveState] = useState<'idle' | 'pending' | 'saved' | 'error'>('idle');
  const [denied, setDenied] = useState(false);
  const saving = useRef(false);
  async function save(next: WorkOrderSettings) {
    if (saving.current) return;
    saving.current = true; setSaveState('pending');
    try {
      const result = await api.write({ path: '/api/settings/work-orders', method: 'PUT', body: { workspaceId, ...next }, parse, failureMessage: copy.saveError });
      setSaved(result); setValues(result); setSaveState('saved');
    } catch (error) { if (api.isActive()) { if (isApiAccessError(error)) setDenied(true); setSaveState('error'); } } finally { saving.current = false; }
  }
  if (denied) return <FormFeedback kind="error" message={copy.unavailable}/>;
  return <WorkOrderSettingsPage settingsHref={`/settings?workspace=${encodeURIComponent(workspaceId)}`} canEdit={canEdit} values={values} savedValues={saved} saveState={saveState}
    onChange={next => { setValues(next); setSaveState('idle'); }} onSave={next => { void save(next); }} onDiscard={() => { setValues(saved); setSaveState('idle'); }} />;
}
