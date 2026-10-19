'use client';

import { useId } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { ArrowForwardOutlined, StatusBadge, type StatusBadgeTone } from '@salesmora/ui';
import type { LeadCardRecord } from '../lead-card/lead-card';
import { createLeadDateFormatter } from '../lead-date';
import { leadDetailHeaderData as copy } from './lead-detail-header.data';

export type LeadHeaderRecord = Pick<LeadCardRecord, 'id' | 'version' | 'name' | 'service' | 'stage' | 'source' | 'createdAt' | 'archived' | 'needsAttention'> & { leadNumber: string; businessName?: string };
export type LeadHeaderPermissions = { canEdit: boolean; canArchive: boolean; canRestore: boolean; canDelete: boolean; canCreateEstimate: boolean; canStartJob: boolean };
export type LeadDetailHeaderProps = {
  lead: LeadHeaderRecord; permissions: LeadHeaderPermissions; backHref: string; now: string; timezone: string; pending?: boolean;
  onEdit?: (lead: LeadHeaderRecord) => void;
  onRequestArchive?: (lead: LeadHeaderRecord) => void;
  onRequestRestore?: (lead: LeadHeaderRecord) => void;
  /** Requests typed confirmation; never deletes directly. */
  onRequestDelete?: (lead: LeadHeaderRecord) => void;
};
const tones: Record<LeadHeaderRecord['stage'], StatusBadgeTone> = { new: 'neutral', contacted: 'info', 'estimate-sent': 'warning', won: 'success', lost: 'error' };
const button = 'min-h-11 cursor-pointer rounded-xl border px-4 py-3 text-sm font-semibold focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';

export function LeadDetailHeader({ lead, permissions, backHref, now, timezone, pending = false, onEdit, onRequestArchive, onRequestRestore, onRequestDelete }: LeadDetailHeaderProps) {
  const id = useId();
  const created = createLeadDateFormatter(now, timezone)(lead.createdAt);
  const relative = !created ? copy.dateUnavailable : created.age === 0 ? copy.today : created.age === 1 ? copy.yesterday : created.age > 1 ? copy.daysAgo(created.age) : created.displayDate;
  function unavailable(label: string, reason: string, showReason = false) {
    return <Tooltip title={reason} describeChild><span role="group" tabIndex={0} aria-label={copy.unavailable(label, reason)} className="inline-flex max-w-full rounded-xl focus-visible:focus-ring">
      <button type="button" disabled className={`${button} pointer-events-none border-line bg-canvas text-muted disabled:opacity-100`}>{showReason ? `${label} · ${reason}` : label}</button>
    </span></Tooltip>;
  }
  return <header aria-labelledby={`${id}-name`} aria-busy={pending} className="grid min-w-0 gap-5 border-b border-line pb-6">
    <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {pending ? <span role="link" aria-disabled="true" aria-label={copy.back} className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line text-muted"><ArrowForwardOutlined aria-hidden="true" className="rotate-180"/></span> :
          <a href={backHref} aria-label={copy.back} className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-paper text-muted hover:bg-canvas focus-visible:focus-ring"><ArrowForwardOutlined aria-hidden="true" className="rotate-180"/></a>}
        <div className="min-w-0"><p className="mb-2 mt-0 text-xs font-semibold uppercase text-muted">{copy.record} · {lead.leadNumber}</p>
          <h1 id={`${id}-name`} className="m-0 text-heading font-semibold text-ink wrap-anywhere">{lead.name}</h1>
          <p className="mb-0 mt-2 text-base leading-6 text-muted wrap-anywhere">{lead.service}{lead.businessName && <> · {lead.businessName}</>}</p>
        </div>
      </div>
      <div role="group" aria-label={copy.record} className="flex min-w-0 flex-wrap items-center gap-3 lg:max-w-lg lg:justify-end">
        {permissions.canEdit && onEdit && <button type="button" disabled={pending} onClick={() => { if (!pending && permissions.canEdit) onEdit(lead); }} className={`${button} border-primary bg-primary text-white hover:bg-primary-dark`}>{copy.edit}</button>}
        {permissions.canCreateEstimate && unavailable(copy.estimate, copy.comingSoon, true)}
        {!lead.archived && permissions.canArchive && onRequestArchive && <button type="button" disabled={pending} onClick={() => { if (!pending && permissions.canArchive) onRequestArchive(lead); }} className={`${button} border-line bg-paper text-muted hover:bg-canvas`}>{copy.archive}</button>}
        {lead.archived && permissions.canRestore && onRequestRestore && <button type="button" disabled={pending} onClick={() => { if (!pending && permissions.canRestore) onRequestRestore(lead); }} className={`${button} border-line bg-paper text-primary hover:bg-canvas`}>{copy.restore}</button>}
        {permissions.canDelete && onRequestDelete && (lead.stage === 'won' ? unavailable(copy.remove, copy.wonDelete) : <button type="button" disabled={pending} onClick={() => { if (!pending && permissions.canDelete && lead.stage !== 'won') onRequestDelete(lead); }} className={`${button} border-error/30 bg-paper text-red-800 hover:bg-error/10`}>{copy.remove}</button>)}
        {permissions.canStartJob && unavailable(copy.job, copy.comingSoon, true)}
      </div>
    </div>
    <div className="flex min-w-0 flex-wrap items-center gap-3">
      <StatusBadge label={copy.stages.find(stage => stage.value === lead.stage)!.label} tone={tones[lead.stage]} dot/>
      <StatusBadge label={copy.sources.find(source => source.value === lead.source)!.label}/>
      {lead.archived && <StatusBadge label={copy.archived}/>}{lead.needsAttention && <StatusBadge label={copy.attention} tone="warning"/>}
      {created ? <Tooltip title={created.exact} describeChild><time tabIndex={0} dateTime={lead.createdAt} aria-label={copy.exactDate(created.exact)} className="rounded-lg text-sm text-muted focus-visible:focus-ring">{copy.created(relative)}</time></Tooltip> : <span className="text-sm text-muted">{copy.dateUnavailable}</span>}
    </div>
    {lead.stage === 'won' && permissions.canDelete && <p className="m-0 text-sm leading-6 text-muted">{copy.wonDelete}</p>}
    {pending && <p role="status" className="m-0 text-sm text-muted">{copy.updating}</p>}
  </header>;
}
