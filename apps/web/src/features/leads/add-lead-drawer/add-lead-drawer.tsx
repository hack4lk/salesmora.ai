'use client';

import { useRef, useState } from 'react';
import { leadSchema } from '@salesmora/contracts';
import { SideDrawer, FormFeedback } from '@salesmora/ui';
import { CreateLeadForm, type CreateLeadValues } from '../create-lead-form/create-lead-form';
import { LeadOwnerSelect, type LeadOwnerMember } from '../lead-owner-select/lead-owner-select';
import { addLeadDrawerData as copy } from './add-lead-drawer.data';

export type AddLeadResult = { ok: true; lead: { id: string; name: string; href: string }; hiddenByFilters?: boolean }
  | { ok: false; kind?: 'error' | 'limit_reached'; message?: string };
export type AddLeadDrawerProps = {
  open: boolean; canCreate: boolean; canAssign: boolean; viewerId: string;
  members: readonly LeadOwnerMember[]; ownersLoading?: boolean; ownersError?: string; onRetryOwners?: () => void;
  limitReached?: boolean; canManageBilling?: boolean; billingHref?: string;
  initialValues?: Partial<Pick<CreateLeadValues, 'name' | 'service' | 'email' | 'phone' | 'source'>>;
  /** Only scoped, authorized matches supplied by the caller; this component performs no duplicate search. */
  duplicate?: { name: string; href: string };
  onClose: () => void;
  onSubmit: (request: { submissionId: string; lead: CreateLeadValues }) => Promise<AddLeadResult>;
  onCreated: (result: Extract<AddLeadResult, { ok: true }>) => void;
};

export function AddLeadDrawer({ open, canCreate, canAssign, viewerId, members, ownersLoading = false, ownersError, onRetryOwners,
  limitReached = false, canManageBilling = false, billingHref, initialValues, duplicate, onClose, onSubmit, onCreated }: AddLeadDrawerProps) {
  const [pending, setPending] = useState(false);
  const [serverLimit, setServerLimit] = useState(false);
  const submissionId = useRef<string | undefined>(undefined);
  const atLimit = limitReached || serverLimit;
  function close() {
    if (pending) return;
    submissionId.current = undefined; setServerLimit(false); onClose();
  }
  async function submit(values: CreateLeadValues) {
    if (!canCreate || atLimit || pending) return { ok: false as const, message: atLimit ? copy.limit : copy.denied };
    const lead = { ...values, stage: 'new' as const, ownerId: canAssign ? values.ownerId : '' };
    if (canAssign && (ownersLoading || ownersError || (lead.ownerId && !members.some(member => member.id === lead.ownerId)))) return { ok: false as const, message: copy.ownerInvalid };
    const parsed = leadSchema.safeParse(lead);
    if (!parsed.success) return { ok: false as const, message: copy.invalid };
    submissionId.current ??= crypto.randomUUID();
    setPending(true);
    try {
      const result = await onSubmit({ submissionId: submissionId.current, lead: parsed.data });
      if (result.ok) { submissionId.current = undefined; onCreated(result); onClose(); }
      else if (result.kind === 'limit_reached') { setServerLimit(true); return { ...result, message: result.message || copy.limit }; }
      return result;
    } finally { setPending(false); }
  }
  return <SideDrawer open={open} title={copy.title} description={copy.description} busy={pending} onClose={close}>
    {!canCreate ? <FormFeedback kind="error" message={copy.denied}/> : <CreateLeadForm owners={[]} variant="quick" initialValues={initialValues}
      blocked={atLimit} onSubmit={submit} onCancel={close}
      notice={<>
        {atLimit && <div className="grid gap-3">{!serverLimit && <FormFeedback kind="error" message={copy.limit}/>}{canManageBilling && billingHref && !pending ? <a href={billingHref} className="w-fit rounded-lg font-semibold text-primary underline focus-visible:focus-ring">{copy.billing}</a> : <p className="m-0 text-sm text-muted">{copy.contactOwner}</p>}</div>}
        {duplicate && <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><p className="m-0 font-semibold">{copy.duplicate}</p>{pending ? <span className="font-semibold">{copy.openDuplicate}: {duplicate.name}</span> : <a href={duplicate.href} className="rounded-lg font-semibold underline focus-visible:focus-ring">{copy.openDuplicate}: {duplicate.name}</a>}<p className="mb-0 mt-2">{copy.duplicateHelp}</p></div>}
      </>}
      ownerControl={({ value, disabled, onChange }) => <LeadOwnerSelect value={canAssign ? value || null : null} members={canAssign ? members : []} viewerId={viewerId} canAssign={canAssign}
        disabled={disabled} pending={pending} loading={ownersLoading} error={ownersError} onRetry={onRetryOwners} onChange={ownerId => onChange(ownerId ?? '')}/>}/>} 
  </SideDrawer>;
}
