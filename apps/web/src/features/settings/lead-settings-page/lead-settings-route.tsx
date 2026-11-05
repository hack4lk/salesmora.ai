'use client';
import { useEffect, useRef, useState } from 'react';
import { leadAssignmentSettingsSnapshotSchema, type LeadAssignmentSettingsSnapshot, type DefaultLeadAssignmentRule } from '@salesmora/contracts';
import { ConfirmDialog, FormFeedback } from '@salesmora/ui';
import { LeadSettingsPage } from './lead-settings-page';
import { leadSettingsPageData as copy } from './lead-settings-page.data';
export function LeadSettingsRoute({ initial }: { initial: LeadAssignmentSettingsSnapshot }) {
  const [saved, setSaved] = useState(initial), [value, setValue] = useState(initial.value), [busy, setBusy] = useState(false), [conflict, setConflict] = useState(false), [denied, setDenied] = useState(false), [error, setError] = useState(''), [reload, setReload] = useState(false);
  const mounted = useRef(true), lock = useRef(false), receipt = useRef<{ signature: string; id: string } | null>(null);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const dirty = JSON.stringify(value) !== JSON.stringify(saved.value);
  const accept = (next: LeadAssignmentSettingsSnapshot) => { if (mounted.current) { setSaved(next); setValue(next.value); setConflict(false); setError(''); receipt.current = null; } };
  async function request(payload?: { value: DefaultLeadAssignmentRule; expectedVersion: number; requestId: string }) {
    const response = await fetch(`/api/settings/leads?workspace=${encodeURIComponent(saved.workspaceId)}`, payload ? { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, workspaceId: saved.workspaceId }), cache: 'no-store' } : { cache: 'no-store' });
    if (!response.ok) { if (mounted.current) { if ([401, 404, 423].includes(response.status)) setDenied(true); if ([409, 422].includes(response.status)) setConflict(true); } throw Error(copy.failed); }
    const next = leadAssignmentSettingsSnapshotSchema.parse(await response.json()); if (next.workspaceId !== saved.workspaceId) throw Error(copy.failed); return next;
  }
  async function reloadSaved() {
    if (lock.current || !mounted.current) return; lock.current = true; setBusy(true); setError('');
    try { accept(await request()); if (mounted.current) setReload(false); }
    catch { if (mounted.current) setError(copy.failed); }
    finally { lock.current = false; if (mounted.current) setBusy(false); }
  }
  async function save(input: { value: DefaultLeadAssignmentRule; expectedVersion: number }) {
    if (lock.current || !mounted.current || !saved.canManage || conflict) throw Error(copy.failed); lock.current = true; setBusy(true); setError('');
    const signature = JSON.stringify(input); if (receipt.current?.signature !== signature) receipt.current = { signature, id: crypto.randomUUID() };
    try { accept(await request({ ...input, requestId: receipt.current.id })); }
    catch (failure) { if (mounted.current) setError(copy.failed); throw failure; }
    finally { lock.current = false; if (mounted.current) setBusy(false); }
  }
  if (denied) return <FormFeedback kind="error" message={copy.unavailable} />;
  return <div className="grid gap-5">{error && <FormFeedback kind="error" message={error} />}
    <LeadSettingsPage settingsHref={`/settings?workspace=${encodeURIComponent(saved.workspaceId)}`} assignment={{ value, savedValue: saved.value, revision: saved.version, teammates: saved.teammates, canRead: true, canManage: saved.canManage, pending: busy, conflict,
      onChange: next => { if (!busy) { setValue(next); setError(''); } }, onDiscard: () => { if (!busy) { setValue(saved.value); setError(''); } }, onReload: () => { if (dirty) setReload(true); else void reloadSaved(); }, onRetryTeammates: () => { if (dirty) setReload(true); else void reloadSaved(); }, onSave: save }} />
    <ConfirmDialog open={reload} title={copy.reloadTitle} description={copy.reloadDescription} confirmLabel={copy.reload} cancelLabel={copy.keep} pending={busy} onClose={() => setReload(false)} onConfirm={reloadSaved} />
  </div>;
}
