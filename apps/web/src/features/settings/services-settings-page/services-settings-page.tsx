'use client';
import { useId, useRef, useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { ConfirmDialog, DataTable, FormFeedback, MoreHorizOutlined, SeafoamButton, TextField, type DataTableColumn } from '@salesmora/ui';
import type { ServiceSettingsCommand, WorkspaceService } from '../../services/service-types';
import { servicesSettingsData as copy } from './services-settings-page.data';
import {useFormReady} from '../../auth/use-form-ready';
import {ServiceWorkersEditor,type ServiceWorker,type SaveServiceWorkers} from '../../services/service-workers-editor/service-workers-editor';

export type ServicesSettingsPageProps = {
  settingsHref: string; services: readonly WorkspaceService[]; version: number; canManage: boolean;
  state?: 'ready' | 'loading' | 'error'; pending?: boolean; conflict?: boolean;
  onReload: () => void; onSave: (command: ServiceSettingsCommand) => Promise<void>;
  /** Supplied only after the qualification read/write host is connected. */
  qualifiedWorkers?: {members:readonly ServiceWorker[];byService:Readonly<Record<string,readonly string[]>>;onSave:(command:SaveServiceWorkers)=>Promise<void>};
};
type Edit = ({ action: 'add' } | { action: 'rename' | 'archive' | 'restore' | 'delete'; service: WorkspaceService }) & { version: number };
type EditIntent = { action: 'add' } | { action: 'rename' | 'archive' | 'restore' | 'delete'; service: WorkspaceService };
const secondary = 'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';

/** The canonical settings page. Its host supplies scoped reads and a version-bound mutation. */
export function ServicesSettingsPage(props: ServicesSettingsPageProps) {
  return <ServicesSession key={String(props.canManage)} {...props} />;
}
function ServicesSession({ settingsHref, services, version, canManage, state = 'ready', pending = false, conflict = false, onReload, onSave,qualifiedWorkers }: ServicesSettingsPageProps) {
  const id = useId(), lock = useRef(false);
  const [tab, setTab] = useState<'active' | 'archived'>('active');
  const [menu, setMenu] = useState<{ anchor: HTMLElement; service: WorkspaceService } | null>(null);
  const [edit, setEdit] = useState<Edit | null>(null), [name, setName] = useState(''), [updated, setUpdated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [workerServiceId,setWorkerServiceId]=useState<string|null>(null);
  const workerService=services.find(service=>service.id===workerServiceId);
  const interactive=useFormReady();
  const stale = conflict || !!edit && edit.version !== version;
  const busy = pending || saving, allowed = interactive && canManage && !busy && !stale && state === 'ready';
  const isName = edit?.action === 'add' || edit?.action === 'rename';
  const trimmed = name.trim(), existingId = edit && 'service' in edit ? edit.service.id : null;
  const duplicate = services.some(service => service.id !== existingId && service.name.trim().toLocaleLowerCase() === trimmed.toLocaleLowerCase());
  const nameError = trimmed.length > 100 ? copy.tooLong : trimmed && duplicate ? copy.duplicate : '';
  const blockedArchive = edit?.action === 'archive' && edit.service.activeWorkflows > 0;
  const blockedDelete = edit?.action === 'delete' && (edit.service.references === undefined || edit.service.references > 0 || edit.service.activeWorkflows > 0);
  const invalid = isName && (!trimmed || !!nameError || edit?.action === 'rename' && trimmed === edit.service.name) || blockedArchive || blockedDelete || edit?.action === 'delete' && confirmation !== 'confirm';
  const open = (next: EditIntent) => { if (!allowed) return; setMenu(null); setEdit({ ...next, version }); setName(next.action === 'rename' ? next.service.name : ''); setConfirmation(''); setUpdated(false); };
  const submit = async () => {
    if (!edit || !allowed || invalid || lock.current) return;
    lock.current = true; setSaving(true);
    const command: ServiceSettingsCommand = edit.action === 'add' ? { action: 'add', name: trimmed, expectedVersion: version }
      : edit.action === 'rename' ? { action: 'rename', serviceId: edit.service.id, name: trimmed, expectedVersion: version }
      : edit.action==='delete' ? {action:'delete',serviceId:edit.service.id,expectedVersion:version,confirmation:'confirm'} : { action: edit.action, serviceId: edit.service.id, expectedVersion: version };
    try { await onSave(command); setEdit(null); setUpdated(true); }
    finally { lock.current = false; setSaving(false); }
  };
  const workflowHint = (service: WorkspaceService) => service.activeWorkflows > 0 ? <p className="mb-0 mt-1 text-xs text-muted">{copy.workflows(service.activeWorkflows)}</p> : null;
  const actions = (service: WorkspaceService) => canManage ? <button type="button" aria-label={copy.menu(service.name)} aria-haspopup="menu" aria-expanded={menu?.service.id === service.id} disabled={!allowed}
    onClick={event => setMenu({ anchor: event.currentTarget, service })} className={`${secondary} w-11 shrink-0 px-0`}><MoreHorizOutlined aria-hidden="true" /></button> : <span className="text-muted">—</span>;
  const workerButton=(service:WorkspaceService)=>{
    if(!qualifiedWorkers)return null;
    const count=(qualifiedWorkers.byService[service.id]??[]).filter(id=>qualifiedWorkers.members.some(member=>member.id===id&&member.available)).length;
    const label=`${count} qualified ${count===1?'worker':'workers'}`;
    return <button type="button" disabled={busy||state!=='ready'} className="min-h-11 cursor-pointer rounded-lg px-2 text-left text-sm font-semibold text-primary focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50" aria-label={`${label} for ${service.name}`} onClick={()=>setWorkerServiceId(service.id)}>{label}</button>;
  };
  const columns: DataTableColumn<WorkspaceService>[] = [
    { id: 'name', label: copy.nameColumn, render: service => <div><span className="font-semibold">{service.name}</span>{workflowHint(service)}</div> },
    ...(qualifiedWorkers?[{id:'workers',label:'Qualified workers',render:workerButton}]:[]),
    { id: 'status', label: copy.statusColumn, compact: true, render: service => <span className="inline-flex min-w-20 justify-center whitespace-nowrap rounded-full border border-line bg-canvas px-3 py-1 text-xs font-semibold text-ink">{copy[service.status]}</span> },
    { id: 'actions', label: copy.actions, compact: true, render: actions },
  ];
  const shown = services.filter(service => service.status === tab).sort((a, b) => a.name.localeCompare(b.name));
  const title = edit?.action === 'add' ? copy.add : edit?.action === 'rename' ? copy.rename : edit?.action === 'archive' ? copy.archiveTitle(edit.service.name) : edit?.action === 'delete' ? copy.deleteTitle(edit.service.name) : edit ? copy.restoreTitle(edit.service.name) : '';
  const description = edit?.action === 'add' ? copy.addDescription : edit?.action === 'rename' ? copy.renameDescription : edit?.action === 'archive' ? copy.archiveDescription : edit?.action === 'delete' ? copy.deleteDescription : copy.restoreDescription;
  return <div className="grid min-w-0 gap-6">
    <header>
      <a href={settingsHref} className="inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-primary focus-visible:focus-ring">{copy.back}</a>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4"><div><h1 className="m-0 text-heading font-semibold text-ink sm:text-heading-lg">{copy.title}</h1><p className="mb-0 mt-3 text-base text-muted">{copy.description}</p></div>
        {canManage && <SeafoamButton label={copy.add} disabled={!allowed} onClick={() => open({ action: 'add' })}/>}
      </div>
    </header>
    {!canManage && <p role="status" className="m-0 text-sm text-muted">{copy.readOnly}</p>}
    {stale && <div className="grid justify-items-start gap-3"><FormFeedback kind="error" message={copy.conflict}/><button type="button" className={secondary} disabled={busy} onClick={() => { setEdit(null); onReload(); }}>{copy.reload}</button></div>}
    {updated && <FormFeedback kind="success" message={copy.changed}/>}
    <div className="min-w-0">
      <Tabs value={tab} aria-label={copy.tabs} onChange={(_, next: 'active' | 'archived') => setTab(next)} className="border-b border-line">
        {(['active', 'archived'] as const).map(status => <Tab key={status} id={`${id}-${status}`} value={status} aria-controls={`${id}-panel`} label={`${copy[status]} (${services.filter(service => service.status === status).length})`} />)}
      </Tabs>
      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${tab}`} tabIndex={0} className="mt-5 min-w-0 focus-visible:focus-ring">
        <DataTable caption={copy.caption} columns={columns} rows={shown} getRowId={service => service.id} getRowLabel={service => service.name} constrainHeight={false}
          state={state} emptyMessage={tab === 'active' ? copy.empty : copy.emptyArchived} errorMessage={copy.failed} onRetry={onReload}
          renderCard={service => <div className="flex min-w-0 items-center justify-between gap-4"><div className="min-w-0"><h2 className="m-0 text-base font-semibold wrap-anywhere">{service.name}</h2>{workflowHint(service)}{workerButton(service)}</div>{actions(service)}</div>} />
      </div>
    </div>
    <Menu anchorEl={menu?.anchor} open={!!menu} onClose={() => setMenu(null)}>
      {qualifiedWorkers&&<MenuItem disabled={!allowed} onClick={()=>{if(menu){setWorkerServiceId(menu.service.id);setMenu(null);}}}>Qualified workers</MenuItem>}
      <MenuItem disabled={!allowed} onClick={() => menu && open({ action: 'rename', service: menu.service })}>{copy.rename}</MenuItem>
      <MenuItem disabled={!allowed} onClick={() => menu && open({ action: menu.service.status === 'active' ? 'archive' : 'restore', service: menu.service })}>{menu?.service.status === 'archived' ? copy.restore : copy.archive}</MenuItem>
      <MenuItem disabled={!allowed} onClick={() => menu && open({ action: 'delete', service: menu.service })}>{copy.delete}</MenuItem>
    </Menu>
    <ConfirmDialog key={edit ? `${edit.action}:${existingId}` : 'closed'} open={!!edit} title={title} description={description} confirmLabel={edit?.action === 'add' ? copy.add : edit?.action === 'rename' ? copy.save : edit?.action === 'archive' ? copy.archive : edit?.action === 'delete' ? copy.delete : copy.restore}
      destructive={edit?.action === 'delete'} confirmation={edit?.action === 'delete' && !blockedDelete ? {label:copy.deleteConfirm,expectedValue:'confirm',value:confirmation,onChange:setConfirmation} : undefined}
      pending={busy} confirmDisabled={!allowed || !!invalid} showWarningIcon={false} onClose={() => { if (!busy) setEdit(null); }} onConfirm={submit}>
      {isName && <TextField required label={copy.name} value={name} disabled={!allowed} error={!!nameError} helperText={nameError || undefined} slotProps={{ htmlInput: { maxLength: 100 } }} onChange={event => setName(event.target.value)}/>}
      {stale && <FormFeedback kind="error" message={copy.conflict}/>}
      {blockedArchive && <FormFeedback kind="error" message={`${copy.workflows(edit.service.activeWorkflows)} ${copy.archiveBlocked}`}/>}
      {blockedDelete && <FormFeedback kind="error" message={copy.deleteBlocked}/>}
    </ConfirmDialog>
    {qualifiedWorkers&&workerService&&<ServiceWorkersEditor open service={workerService} version={version} selectedIds={qualifiedWorkers.byService[workerService.id]??[]} members={qualifiedWorkers.members} canManage={canManage} pending={busy} conflict={conflict} onClose={()=>setWorkerServiceId(null)} onReload={onReload} onSave={qualifiedWorkers.onSave}/>}
  </div>;
}
