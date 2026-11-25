'use client';
import { useEffect, useId, useRef, useState } from 'react';
import type { SmartRoutingValues } from '@salesmora/contracts';
import { WorkflowNotificationChoices } from '../workflow-notification-choices';
import { ApiRequestError } from '../../api/api-request';

export type { SmartRoutingValues } from '@salesmora/contracts';
export type SmartRoutingCardProps = {
  value: SmartRoutingValues; sources: readonly { id: string; name: string; collectsPostalCode: boolean }[];
  members: readonly { id: string; name: string; workZipCodes: readonly string[] }[];
  teamSettingsHref: string; canPublish: boolean; editing?: boolean; pending?: boolean; conflict?: boolean;
  expiresAt?: string | null;
  paused?: boolean; onAskAssistant?: (value:SmartRoutingValues)=>void;
  state?: 'draft' | 'published' | 'cancelled' | 'expired'; onReload: () => void;
  onPublish: (value: SmartRoutingValues) => Promise<void>; onCancel: () => void | Promise<void>;
};
const input = 'min-h-11 w-full min-w-0 rounded-xl border border-assistant-border bg-assistant-panel p-3 text-base font-normal text-assistant-foreground focus-visible:focus-ring';
const button = 'min-h-11 cursor-pointer rounded-xl border border-assistant-border px-4 py-2 text-sm font-semibold focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-60';

export function SmartRoutingCard(props: SmartRoutingCardProps) {
  return <RoutingReview key={JSON.stringify([props.value, props.editing,props.expiresAt])} {...props}/>;
}
/** Local review only. The future host must bind current permissions and an expiring server proposal. */
function RoutingReview({ value: initial, sources, members, teamSettingsHref, canPublish, editing, pending, conflict,
  state: suppliedState = 'draft', expiresAt, paused, onAskAssistant, onReload, onPublish, onCancel }: SmartRoutingCardProps) {
  const id = useId(), lock = useRef(false);
  const [value, setValue] = useState(initial), [settings, setSettings] = useState(false);
  const [saving, setSaving] = useState(false), [error, setError] = useState('');
  const [expired,setExpired]=useState(()=>!!expiresAt&&Date.parse(expiresAt)<=Date.now());
  useEffect(()=>{if(!expiresAt||expired)return;const timer=setTimeout(()=>setExpired(true),Math.max(0,Math.min(Date.parse(expiresAt)-Date.now(),2147483647)));return()=>clearTimeout(timer);},[expiresAt,expired]);
  const state=suppliedState==='draft'&&expired?'expired':suppliedState;
  const source = sources.find(source => source.id === value.sourceId), selected = members.filter(member => value.memberIds.includes(member.id));
  const busy = pending || saving, allowed = canPublish && state === 'draft' && !busy && !conflict;
  const unavailable = value.memberIds.some(id => !members.some(member => member.id === id));
  const noCoverage = value.matchWorkZipCodes && selected.some(member => !member.workZipCodes.length);
  const sourceMissingPostal = value.matchWorkZipCodes && !source?.collectsPostalCode;
  const valid = !!source && !!value.name.trim() && value.name.trim().length <= 120 && selected.length > 0 && !unavailable
    && (value.strategy !== 'one_teammate' || selected.length === 1) && !noCoverage && !sourceMissingPostal;
  const changed = JSON.stringify(value) !== JSON.stringify(initial);
  const names = selected.map(member => member.name).join(' and ') || 'the selected team';
  const method = value.strategy === 'round_robin' ? 'taking turns' : value.strategy === 'fewest_open_leads' ? 'choosing whoever has the fewest open leads' : '';
  return <section aria-labelledby={`${id}-title`} aria-busy={!!busy} className="grid min-w-0 gap-4 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground sm:p-5">
    <h3 id={`${id}-title`} className="m-0 text-lg font-semibold">{value.name}</h3>
    <p className="m-0 text-sm leading-6">Assign new unassigned leads from {source?.name ?? 'the selected source'} to {names}{method ? `, ${method}` : ''}{value.matchWorkZipCodes ? ', matching each lead’s ZIP code to member work ZIP codes' : ''}.</p>
    {settings && <fieldset disabled={!allowed} className="m-0 grid min-w-0 gap-4 border-0 p-0 disabled:opacity-60">
      <label className="grid gap-1 text-sm font-semibold">Workflow name<input className={input} maxLength={120} value={value.name} onChange={event => setValue({ ...value, name: event.target.value })}/></label>
      <label className="grid gap-1 text-sm font-semibold">Source<select className={input} value={value.sourceId} onChange={event => setValue({ ...value, sourceId: event.target.value })}><option value="">Choose an intake source</option>{sources.map(source => <option key={source.id} value={source.id}>{source.name}</option>)}</select></label>
      <label className="grid gap-1 text-sm font-semibold">Assign using<select className={input} value={value.strategy} onChange={event => {
        const strategy = event.target.value as SmartRoutingValues['strategy'];
        setValue({ ...value, strategy, memberIds: strategy === 'one_teammate' ? value.memberIds.slice(0, 1) : value.memberIds });
      }}><option value="one_teammate">One teammate</option><option value="round_robin">Take turns</option><option value="fewest_open_leads">Fewest open leads</option></select></label>
      {value.strategy === 'fewest_open_leads' && <p className="m-0 text-xs leading-5">Counts New, Contacted and Estimate sent leads across this workspace. Equal counts take turns.</p>}
      <fieldset className="m-0 grid min-w-0 gap-1 rounded-xl border border-assistant-border p-3"><legend className="px-1 text-sm font-semibold">Team</legend>
        {members.map(member => <label key={member.id} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm has-disabled:cursor-default"><input
          type={value.strategy === 'one_teammate' ? 'radio' : 'checkbox'} name={`${id}-team`} className="size-5 shrink-0 accent-seafoam-dark focus-visible:focus-ring"
          checked={value.memberIds.includes(member.id)} onChange={event => setValue({ ...value, memberIds: value.strategy === 'one_teammate' ? [member.id] : event.target.checked ? [...value.memberIds, member.id] : value.memberIds.filter(id => id !== member.id) })}/><span>{member.name}{value.matchWorkZipCodes && <span className="ml-2 text-xs">{member.workZipCodes.length ? `${member.workZipCodes.length} ZIP ${member.workZipCodes.length === 1 ? 'code' : 'codes'}` : 'No work ZIP codes'}</span>}</span></label>)}
      </fieldset>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm has-disabled:cursor-default"><input type="checkbox" className="size-5 shrink-0 accent-seafoam-dark focus-visible:focus-ring" checked={value.matchWorkZipCodes} onChange={event => setValue({ ...value, matchWorkZipCodes: event.target.checked })}/>Match member work ZIP codes</label>
    </fieldset>}
    {value.matchWorkZipCodes && <a className="inline-flex min-h-11 items-center justify-self-start rounded-lg text-sm font-semibold text-assistant-foreground underline underline-offset-4 focus-visible:focus-ring" href={teamSettingsHref}>Manage team work ZIP codes</a>}
    {state === 'draft' && <>
      {sourceMissingPostal && <p role="alert" className="m-0 text-sm">This source needs a ZIP code field and a country before ZIP matching can be used.</p>}
      {noCoverage && <p role="alert" className="m-0 text-sm">Set work ZIP codes for each selected teammate, or remove them from this team.</p>}
      {(!selected.length || unavailable) && <p role="alert" className="m-0 text-sm">Choose current teammates for this rule.</p>}
    </>}
    <WorkflowNotificationChoices value={value.notifications} optional dark disabled={!allowed} onChange={notifications => setValue({ ...value, notifications })}/>
    <p className="m-0 text-xs leading-5">Notifies the teammate assigned. Existing owners stay unchanged.{value.matchWorkZipCodes ? ' Leads without a matching teammate stay unassigned.' : ''}</p>
    {editing&&paused&&<p className="m-0 text-sm">This workflow will stay paused after saving.</p>}
    {state !== 'draft' ? <p role="status" className="m-0 text-sm">{state === 'published' ? editing ? 'Changes saved.' : 'Workflow published.' : state === 'expired' ? 'This draft expired. Ask the assistant for a new review.' : 'Draft canceled.'}</p> : <>
      {!canPublish && <p role="status" className="m-0 text-sm">You don’t have permission to publish this workflow.</p>}
      {conflict && <p role="alert" className="m-0 text-sm">This workflow changed. Reload before saving.</p>}
      {error && <p role="alert" className="m-0 text-sm">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {conflict && <button type="button" className={button} disabled={busy} onClick={onReload}>Reload latest values</button>}
        <button type="button" className={button} disabled={!allowed} aria-expanded={settings} onClick={() => setSettings(!settings)}>{settings ? 'Back to review' : 'Change settings'}</button>
        {editing&&onAskAssistant&&<button type="button" className={button} disabled={!allowed} onClick={()=>onAskAssistant(value)}>Ask assistant</button>}
        <button type="button" className={button} disabled={busy} onClick={async()=>{if(lock.current)return;lock.current=true;setSaving(true);setError('');try{await onCancel();}catch{setError('The draft could not be canceled. Try again.');}finally{lock.current=false;setSaving(false);}}}>Cancel</button>
        <button type="button" className={`${button} seafoam-action text-ink`} disabled={!allowed || !valid || editing && !changed} onClick={async () => {
          if (!allowed || !valid || lock.current) return;
          if(expiresAt&&Date.parse(expiresAt)<=Date.now()){setExpired(true);return;}
          lock.current = true; setSaving(true); setError('');
          try { await onPublish({ ...value, name: value.name.trim() }); }
          catch(error) { setError(error instanceof ApiRequestError?error.message:'The workflow could not be saved. Your choices are still here.'); }
          finally { lock.current = false; setSaving(false); }
        }}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Publish workflow'}</button>
      </div>
    </>}
  </section>;
}
