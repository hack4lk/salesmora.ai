'use client';
import { useRef, useState } from 'react';
import type { WorkOrderSettings } from '@salesmora/contracts';
import { WorkOrderSettingsPage } from './work-order-settings-page';

export function WorkOrderSettingsRoute({ workspaceId, initial, canEdit }: { workspaceId: string; initial: WorkOrderSettings; canEdit: boolean }) {
  const [values, setValues] = useState(initial), [saved, setSaved] = useState(initial), [saveState, setSaveState] = useState<'idle' | 'pending' | 'saved' | 'error'>('idle');
  const saving = useRef(false);
  async function save(next: WorkOrderSettings) {
    if (saving.current) return;
    saving.current = true; setSaveState('pending');
    try {
      const response = await fetch('/api/settings/work-orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId, ...next }) });
      if (!response.ok) throw Error();
      const result: WorkOrderSettings = await response.json();
      setSaved(result); setValues(result); setSaveState('saved');
    } catch { setSaveState('error'); } finally { saving.current = false; }
  }
  return <WorkOrderSettingsPage settingsHref={`/settings?workspace=${encodeURIComponent(workspaceId)}`} canEdit={canEdit} values={values} savedValues={saved} saveState={saveState}
    onChange={next => { setValues(next); setSaveState('idle'); }} onSave={next => { void save(next); }} onDiscard={() => { setValues(saved); setSaveState('idle'); }} />;
}
