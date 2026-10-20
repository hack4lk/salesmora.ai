'use client';
import { useId } from 'react';
import { StatusBadge } from '../../data-display/status-badge/status-badge';
import { leadDetailsCardData as copy } from './lead-details-card.data';

export interface LeadDetailsResult {
  id: string; scope: 'workspace' | 'assigned'; retrievedAt: string;
  lead: {
    id: string; number: string; name: string; service: string;
    stage: keyof typeof copy.stages; source: keyof typeof copy.sources; ownerName: string | null; archived: boolean;
    email: string; phone: string; address: string; details: string; notes: string;
  };
}
export interface LeadDetailsCardProps {
  result?: LeadDetailsResult;
  state?: 'ready' | keyof typeof copy.states;
  disabled?: boolean;
  /** Host binds the result identity, reauthorizes the record and owns safe navigation. */
  onOpenLead?: (leadId: string) => void;
}
const timestamp = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });

/** Read-only authorized snapshot. Plain text only; no model URLs, permissions or mutations. */
export function LeadDetailsCard({ result, state = 'ready', disabled = false, onOpenLead }: LeadDetailsCardProps) {
  const id = useId();
  const lead = result?.lead;
  const valid = !!result && !!lead && !!result.id?.trim() && !!lead.id?.trim() && !!lead.number?.trim() && !!lead.name?.trim() &&
    ['workspace', 'assigned'].includes(result.scope) && Number.isFinite(Date.parse(result.retrievedAt)) &&
    Object.hasOwn(copy.stages, lead.stage) && Object.hasOwn(copy.sources, lead.source) && typeof lead.archived === 'boolean' &&
    (lead.ownerName === null || typeof lead.ownerName === 'string') &&
    [lead.service, lead.email, lead.phone, lead.address, lead.details, lead.notes].every(value => typeof value === 'string');
  const unavailable = state === 'ready' ? (!valid ? 'error' : undefined) : state;
  return <section aria-labelledby={`${id}-title`} aria-busy={state === 'loading'} className="mt-4 min-w-0 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground">
    <h3 id={`${id}-title`} className="m-0 text-base font-semibold">{copy.title}</h3>
    {unavailable ? <p role="status" className="mb-0 mt-3 text-sm leading-6 text-assistant-muted">{copy.states[unavailable]}</p> : <>
      <p className="mb-0 mt-4 text-base font-semibold text-assistant-accent wrap-anywhere">{lead!.number} · {lead!.name}</p>
      <p className="mb-0 mt-2 text-sm leading-6 wrap-anywhere">{lead!.service.trim() || copy.noService}</p>
      {lead!.archived && <div className="mt-4 rounded-xl border border-assistant-border bg-assistant-message p-3">
        <StatusBadge label={copy.archived}/><p className="mb-0 mt-2 text-sm leading-6 text-assistant-muted">{copy.archiveNotice}</p>
      </div>}
      <dl className="mb-0 mt-4 grid min-w-0 gap-4 sm:grid-cols-2">
        <div><dt className="mb-2 text-xs font-semibold text-assistant-muted">{copy.stage}</dt><dd className="m-0"><StatusBadge label={copy.stages[lead!.stage]}/></dd></div>
        <div><dt className="mb-2 text-xs font-semibold text-assistant-muted">{copy.source}</dt><dd className="m-0"><StatusBadge label={copy.sources[lead!.source]}/></dd></div>
        <Field label={copy.owner} value={lead!.ownerName?.trim() || copy.unassigned}/>
        <Field label={copy.scope} value={result!.scope === 'assigned' ? copy.assigned : copy.workspace}/>
      </dl>
      <div className="mt-5 border-t border-assistant-border pt-4">
        <h4 className="m-0 text-sm font-semibold">{copy.contact}</h4>
        <dl className="mb-0 mt-3 grid min-w-0 gap-4 sm:grid-cols-2">
          <Field label={copy.email} value={lead!.email.trim() || copy.missing}/>
          <Field label={copy.phone} value={lead!.phone.trim() || copy.missing}/>
          <div className="min-w-0 sm:col-span-2"><FieldContent label={copy.address} value={lead!.address.trim() || copy.missing}/></div>
        </dl>
      </div>
      <div className="mt-5 border-t border-assistant-border pt-4">
        <h4 className="m-0 text-sm font-semibold">{copy.request}</h4>
        <p className="mb-0 mt-3 whitespace-pre-wrap text-sm leading-6 wrap-anywhere">{lead!.details.trim() || copy.noDetails}</p>
      </div>
      <div className="mt-5 border-t border-assistant-border pt-4">
        <h4 className="m-0 text-sm font-semibold">{copy.notes}</h4>
        <p className="mb-0 mt-3 whitespace-pre-wrap text-sm leading-6 wrap-anywhere">{lead!.notes.trim() || copy.noNotes}</p>
      </div>
      {onOpenLead && <button type="button" aria-label={copy.openLabel(lead!.number)} disabled={disabled} onClick={() => onOpenLead(lead!.id)} className="mt-5 min-h-11 cursor-pointer rounded-xl border border-assistant-border px-4 py-2 text-sm font-semibold text-assistant-accent focus-visible:focus-ring focus-visible:outline-assistant-accent disabled:cursor-default disabled:opacity-50">{copy.open}</button>}
      <p className="mb-0 mt-4 text-xs leading-5 text-assistant-muted">{copy.retrieved}{' '}<time dateTime={result!.retrievedAt}>{copy.time(timestamp.format(new Date(result!.retrievedAt)))}</time>{'. '}{copy.snapshot}</p>
    </>}
  </section>;
}
function Field({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><FieldContent label={label} value={value}/></div>;
}
function FieldContent({ label, value }: { label: string; value: string }) {
  return <><dt className="text-xs font-semibold text-assistant-muted">{label}</dt><dd className="mb-0 ml-0 mt-2 whitespace-pre-wrap text-sm leading-6 wrap-anywhere">{value}</dd></>;
}
