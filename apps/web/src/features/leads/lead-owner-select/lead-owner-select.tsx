'use client';

import { useId } from 'react';
import { FormFeedback } from '@salesmora/ui';
import { leadOwnerSelectData as copy } from './lead-owner-select.data';

export type LeadOwnerMember = { id: string; name: string; openLeadCount: number };
export type LeadOwnerSelectProps = {
  value: string | null;
  /** Only current, authorized workspace members; workload counts must come from the server. */
  members: readonly LeadOwnerMember[];
  /** Readable owner snapshot, including removed-member status, supplied by the lead read model. */
  currentOwner?: { id: string; name: string; former?: boolean } | null;
  viewerId: string; canAssign: boolean; loading?: boolean; pending?: boolean; disabled?: boolean;
  error?: string; onRetry?: () => void;
  /** Changes the draft only. The caller owns versioned, authorized assignment and notifications. */
  onChange: (ownerId: string | null) => void;
};

/** A reusable controlled assignment field, independent of forms, drawers and persistence. */
export function LeadOwnerSelect({ value, members, currentOwner, viewerId, canAssign, loading = false, pending = false, disabled = false, error, onRetry, onChange }: LeadOwnerSelectProps) {
  const id = useId();
  const former = !!value && currentOwner?.id === value && currentOwner.former === true;
  const choices = members.filter(member => member.id.length > 0 && !(currentOwner?.former && member.id === currentOwner.id));
  const selected = choices.find(member => member.id === value);
  const ownerName = value === null ? copy.unassigned : former ? copy.former : selected?.name ?? (currentOwner?.id === value ? currentOwner.name : copy.unavailable);
  const missing = value !== null && !former && !selected;
  const unavailable = missing && !loading && !error;
  const blocked = !canAssign || loading || pending || disabled || !!error;
  const viewer = choices.find(member => member.id === viewerId);
  function change(next: string | null) {
    if (blocked || next === value || (next !== null && !choices.some(member => member.id === next))) return;
    onChange(next);
  }
  if (!canAssign) return <div className="grid min-w-0 gap-2">
    <p id={`${id}-label`} className="m-0 text-sm font-semibold text-ink">{copy.label}</p>
    <div role="group" aria-labelledby={`${id}-label`} aria-describedby={`${id}-help`} className="min-h-11 rounded-xl border border-line bg-canvas px-3 py-3 text-base text-ink wrap-anywhere">{ownerName}</div>
    <p id={`${id}-help`} className="m-0 text-sm leading-6 text-muted">{copy.readOnly}</p>
  </div>;
  return <div className="grid min-w-0 gap-3" aria-busy={loading || pending}>
    <div className="grid min-w-0 gap-2">
      <label htmlFor={`${id}-owner`} className="text-sm font-semibold text-ink">{copy.label}</label>
      <select id={`${id}-owner`} value={value ?? ''} disabled={blocked} aria-invalid={!!error || unavailable} aria-describedby={`${id}-help`}
        onChange={event => change(event.target.value || null)}
        className="min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 py-2 text-base text-ink focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">
        <option value="">{copy.unassigned}</option>
        {(former || missing) && <option value={value!} disabled>{former ? copy.former : ownerName}</option>}
        {choices.map(member => <option key={member.id} value={member.id}>{member.name} · {Number.isSafeInteger(member.openLeadCount) && member.openLeadCount >= 0 ? copy.workload(member.openLeadCount) : copy.unknownWorkload}</option>)}
      </select>
      <p id={`${id}-help`} className="m-0 text-sm leading-6 text-muted">{former ? copy.formerHelp : unavailable ? copy.unavailableHelp : !choices.length && !loading && !error ? copy.empty : copy.helper}</p>
    </div>
    {viewer && <button type="button" disabled={blocked || value === viewerId} onClick={() => change(viewerId)} className="min-h-11 w-fit max-w-full cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary wrap-anywhere focus-visible:focus-ring hover:bg-canvas disabled:cursor-not-allowed disabled:text-muted">
      {value === viewerId ? copy.assignedMe : copy.assignMe}
    </button>}
    {(loading || pending) && <p role="status" className="m-0 text-sm text-muted">{pending ? copy.pending : copy.loading}</p>}
    {error && <><FormFeedback kind="error" message={error}/>{onRetry && <button type="button" disabled={loading || pending || disabled} onClick={() => { if (!loading && !pending && !disabled) onRetry(); }} className="min-h-11 w-fit max-w-full cursor-pointer rounded-xl border border-line px-4 py-2 text-sm font-semibold text-primary focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">{copy.retry}</button>}</>}
  </div>;
}
