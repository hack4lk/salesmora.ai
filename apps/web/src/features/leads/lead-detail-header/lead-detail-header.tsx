'use client';

import { useId, useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import { ArrowForwardOutlined, MoreHorizOutlined, StatusBadge, type StatusBadgeTone } from '@salesmora/ui';
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
  onCreateEstimate?: () => void;
  onRequestMove?: () => void;
  onRequestAssignment?: () => void;
};
const tones: Record<LeadHeaderRecord['stage'], StatusBadgeTone> = { new: 'neutral', contacted: 'info', 'estimate-sent': 'warning', won: 'success', lost: 'error' };

export function LeadDetailHeader({ lead, permissions, backHref, now, timezone, pending = false, onEdit, onRequestArchive, onRequestRestore, onRequestDelete, onCreateEstimate, onRequestMove, onRequestAssignment }: LeadDetailHeaderProps) {
  const id = useId();
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const created = createLeadDateFormatter(now, timezone)(lead.createdAt);
  const relative = !created ? copy.dateUnavailable : created.age === 0 ? copy.today : created.age === 1 ? copy.yesterday : created.age > 1 ? copy.daysAgo(created.age) : created.displayDate;
  const actions: { label: string; run?: () => void; destructive?: boolean }[] = [];
  if (permissions.canEdit && onEdit) actions.push({ label: copy.edit, run: () => onEdit(lead) });
  if (!lead.archived && permissions.canCreateEstimate) actions.push({ label: onCreateEstimate ? copy.estimate : `${copy.estimate} · ${copy.comingSoon}`, run: onCreateEstimate });
  if (!lead.archived && onRequestMove) actions.push({ label: copy.move, run: onRequestMove });
  if (onRequestAssignment) actions.push({ label: copy.assign, run: onRequestAssignment });
  if (permissions.canStartJob) actions.push({ label: `${copy.job} · ${copy.comingSoon}` });
  if (!lead.archived && permissions.canArchive && onRequestArchive) actions.push({ label: copy.archive, run: () => onRequestArchive(lead) });
  if (lead.archived && permissions.canRestore && onRequestRestore) actions.push({ label: copy.restore, run: () => onRequestRestore(lead) });
  if (permissions.canDelete && onRequestDelete) actions.push({ label: copy.remove, run: lead.stage === 'won' ? undefined : () => onRequestDelete(lead), destructive: true });

  return <header aria-labelledby={`${id}-name`} aria-busy={pending} className="grid min-w-0 gap-5 border-b border-line pb-6">
    <div className="flex min-w-0 items-start justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {pending ? <span role="link" aria-disabled="true" aria-label={copy.back} className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line text-muted"><ArrowForwardOutlined aria-hidden="true" className="rotate-180"/></span> :
          <a href={backHref} aria-label={copy.back} className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-paper text-muted hover:bg-canvas focus-visible:focus-ring"><ArrowForwardOutlined aria-hidden="true" className="rotate-180"/></a>}
        <div className="min-w-0"><p className="mb-2 mt-0 text-xs font-semibold uppercase text-muted">{copy.record} · {lead.leadNumber}</p>
          <h1 id={`${id}-name`} className="m-0 text-heading font-semibold text-ink wrap-anywhere">{lead.name}</h1>
          <p className="mb-0 mt-2 text-base leading-6 text-muted wrap-anywhere">{lead.service}{lead.businessName && <> · {lead.businessName}</>}</p>
        </div>
      </div>
      {actions.length > 0 && <>
        <button id={`${id}-actions`} type="button" aria-label={copy.actions} aria-haspopup="menu"
          aria-expanded={!!anchor && !pending} aria-controls={anchor && !pending ? `${id}-menu` : undefined}
          disabled={pending} onClick={event => setAnchor(event.currentTarget)}
          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl border border-line bg-paper p-0 text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">
          <MoreHorizOutlined aria-hidden="true" />
        </button>
        <Menu anchorEl={anchor} open={!!anchor && !pending} onClose={() => setAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ list: { id: `${id}-menu`, 'aria-labelledby': `${id}-actions` } }}>
          {actions.map(({ label, run, destructive }) => <MenuItem key={label} disabled={pending || !run}
            onClick={() => { setAnchor(null); if (!pending) run?.(); }}
            className={`min-h-11 whitespace-normal focus-visible:focus-ring ${destructive ? 'text-red-800' : 'text-ink'}`}>
            {label}
          </MenuItem>)}
        </Menu>
      </>}
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
