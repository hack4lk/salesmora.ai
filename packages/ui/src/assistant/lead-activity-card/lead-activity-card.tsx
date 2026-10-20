'use client';
import { useId } from 'react';
import { StatusBadge } from '../../data-display/status-badge/status-badge';
import { leadActivityCardData as copy } from './lead-activity-card.data';

type Stage = keyof typeof copy.stages;
type Owner = { name: string; former?: boolean } | null;
type Base = { id: string; createdAt: string; actorName: string; viaAssistant?: boolean };
export type LeadActivityEntry = Base & (
  { kind: 'created'; source: keyof typeof copy.sources }
  | { kind: 'edited'; changes: readonly { field: keyof typeof copy.fields; before: string | null; after: string | null }[] }
  | { kind: 'stage'; from: Stage; to: Stage; reason?: string | null }
  | { kind: 'assigned'; from: Owner; to: Owner }
  | { kind: 'note'; body: string }
  | { kind: 'archived' | 'restored' }
);
export interface LeadActivityResult {
  id: string; mode: 'activity' | 'notes'; scope: 'workspace' | 'assigned'; retrievedAt: string;
  lead: { id: string; number: string; name: string; archived: boolean };
  /** Authorized newest-first slice of at most ten entries. Total corresponds to this mode. */
  entries: readonly LeadActivityEntry[]; total: number;
}
export interface LeadActivityCardProps {
  result?: LeadActivityResult; state?: 'ready' | keyof typeof copy.states; disabled?: boolean;
  /** Host binds the result, reauthorizes and owns navigation. No model-provided URL. */
  onOpenLead?: (leadId: string) => void;
}
const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });
const validDate = (value: string) => typeof value === 'string' && Number.isFinite(Date.parse(value));
const ownerValid = (value: Owner) => value === null || !!value && typeof value.name === 'string' && (value.former === undefined || typeof value.former === 'boolean');
function validEntry(entry: LeadActivityEntry) {
  if (!entry || !entry.id?.trim() || !validDate(entry.createdAt) || typeof entry.actorName !== 'string' || (entry.viaAssistant !== undefined && typeof entry.viaAssistant !== 'boolean')) return false;
  switch (entry.kind) {
    case 'created': return Object.hasOwn(copy.sources, entry.source);
    case 'edited': return Array.isArray(entry.changes) && entry.changes.length > 0 && entry.changes.length <= 8 && new Set(entry.changes.map(change => change.field)).size === entry.changes.length && entry.changes.every(change => Object.hasOwn(copy.fields, change.field) && [change.before, change.after].every(value => value === null || typeof value === 'string'));
    case 'stage': return Object.hasOwn(copy.stages, entry.from) && Object.hasOwn(copy.stages, entry.to) && (entry.reason === undefined || entry.reason === null || typeof entry.reason === 'string');
    case 'assigned': return ownerValid(entry.from) && ownerValid(entry.to);
    case 'note': return typeof entry.body === 'string' && !!entry.body.trim();
    case 'archived': case 'restored': return true;
    default: return false;
  }
}
/** Presentation of authorized history only. No write controls, HTML interpretation or inferred changes. */
export function LeadActivityCard({ result, state = 'ready', disabled = false, onOpenLead }: LeadActivityCardProps) {
  const id = useId();
  const valid = !!result && !!result.id?.trim() && !!result.lead?.id?.trim() && !!result.lead.number?.trim() && !!result.lead.name?.trim() && typeof result.lead.archived === 'boolean' &&
    Object.hasOwn(copy.titles, result.mode) && ['workspace', 'assigned'].includes(result.scope) && validDate(result.retrievedAt) &&
    Array.isArray(result.entries) && result.entries.length <= 10 && Number.isSafeInteger(result.total) && result.total >= result.entries.length &&
    result.entries.length === Math.min(10, result.total) && new Set(result.entries.map(entry => entry?.id)).size === result.entries.length &&
    result.entries.every(entry => validEntry(entry) && Date.parse(entry.createdAt) <= Date.parse(result.retrievedAt) && (result.mode !== 'notes' || entry.kind === 'note'));
  const unavailable = state === 'ready' ? !valid ? 'error' : undefined : state;
  const title = result?.mode === 'notes' && !unavailable ? copy.titles.notes : copy.titles.activity;
  const entries = valid ? [...result.entries].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id.localeCompare(a.id)) : [];
  return <section aria-labelledby={`${id}-title`} aria-busy={state === 'loading'} className="mt-4 min-w-0 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground">
    <h3 id={`${id}-title`} className="m-0 text-base font-semibold">{title}</h3>
    {unavailable ? <p role="status" className="mb-0 mt-3 text-sm leading-6 text-assistant-muted">{copy.states[unavailable]}</p> : <>
      <p className="mb-0 mt-4 text-base font-semibold text-assistant-accent wrap-anywhere">{result!.lead.number} · {result!.lead.name}</p>
      <p className="mb-0 mt-2 text-sm text-assistant-muted">{result!.scope === 'assigned' ? copy.assigned : copy.workspace}</p>
      {result!.lead.archived && <div className="mt-3"><StatusBadge label={copy.archived}/></div>}
      <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs leading-5 text-assistant-muted"><span>{copy.count(entries.length, result!.total)}</span><span>{copy.newest}</span></div>
      {result!.mode === 'notes' && <p className="mb-0 mt-3 text-sm leading-6 text-assistant-muted">{copy.notesNotice}</p>}
      {entries.length ? <ol role="list" className="mb-0 mt-4 grid min-w-0 list-none gap-5 p-0">{entries.map(entry => <li key={entry.id} className="min-w-0 border-l-2 border-assistant-border pl-4">
        <h4 className="m-0 text-sm font-semibold">{copy.events[entry.kind]}</h4>
        <p className="mb-0 mt-1 text-sm leading-6 text-assistant-muted wrap-anywhere">{entry.viaAssistant ? copy.assistant(entry.actorName.trim() || copy.unknownActor) : entry.actorName.trim() || copy.unknownActor}</p>
        <time dateTime={entry.createdAt} className="mt-1 block text-xs leading-5 text-assistant-muted">{copy.time(date.format(new Date(entry.createdAt)))}</time>
        <EntryBody entry={entry}/>
      </li>)}</ol> : <p className="mb-0 mt-4 text-sm leading-6 text-assistant-muted">{copy.empty[result!.mode]}</p>}
      {entries.length < result!.total && <p className="mb-0 mt-4 text-sm leading-6 text-assistant-muted">{copy.more}</p>}
      {onOpenLead && <button type="button" aria-label={copy.openLabel(result!.lead.number)} disabled={disabled} onClick={() => onOpenLead(result!.lead.id)} className="mt-5 min-h-11 cursor-pointer rounded-xl border border-assistant-border px-4 py-2 text-sm font-semibold text-assistant-accent focus-visible:focus-ring focus-visible:outline-assistant-accent disabled:cursor-default disabled:opacity-50">{copy.open}</button>}
      <p className="mb-0 mt-4 text-xs leading-5 text-assistant-muted">{copy.retrieved}{' '}<time dateTime={result!.retrievedAt}>{copy.time(date.format(new Date(result!.retrievedAt)))}</time>{'. '}{copy.snapshot}</p>
    </>}
  </section>;
}
function EntryBody({ entry }: { entry: LeadActivityEntry }) {
  const owner = (value: Owner) => value === null ? copy.unassigned : value.former ? copy.former : value.name.trim() || copy.unknownActor;
  const text = (value: string | null, field: keyof typeof copy.fields) => !value?.trim() ? copy.missing : field === 'source' && Object.hasOwn(copy.sources, value) ? copy.sources[value as keyof typeof copy.sources] : value;
  switch (entry.kind) {
    case 'created': return <div className="mt-3"><StatusBadge label={copy.sources[entry.source]}/></div>;
    case 'note': return <p className="mb-0 mt-3 whitespace-pre-wrap text-sm leading-6 wrap-anywhere">{entry.body}</p>;
    case 'stage': return <><div className="mt-3 flex flex-wrap items-center gap-2"><StatusBadge label={copy.stages[entry.from]}/><span className="text-xs text-assistant-muted">{copy.to}</span><StatusBadge label={copy.stages[entry.to]}/></div>{entry.to === 'lost' && entry.reason?.trim() && <p className="mb-0 mt-3 whitespace-pre-wrap text-sm leading-6 wrap-anywhere"><strong>{copy.reason}{': '}</strong>{entry.reason}</p>}</>;
    case 'assigned': return <div className="mt-3 flex flex-wrap items-center gap-2"><StatusBadge label={owner(entry.from)}/><span className="text-xs text-assistant-muted">{copy.to}</span><StatusBadge label={owner(entry.to)}/></div>;
    case 'edited': return <div className="mt-3 grid min-w-0 gap-3">{entry.changes.map(change => <div key={change.field} className="min-w-0 rounded-xl bg-assistant-message p-3"><h5 className="m-0 text-sm font-semibold">{copy.fields[change.field]}</h5><dl className="mb-0 mt-2 grid min-w-0 gap-3 sm:grid-cols-2">{([['before', change.before], ['after', change.after]] as const).map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-xs text-assistant-muted">{copy[label]}</dt><dd className="mb-0 ml-0 mt-1 whitespace-pre-wrap text-sm leading-6 wrap-anywhere">{text(value, change.field)}</dd></div>)}</dl></div>)}</div>;
    default: return null;
  }
}
