'use client';

import { useId, useRef, useState, type DragEvent, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import { StatusBadge, MoreHorizOutlined, type StatusBadgeTone } from '@salesmora/ui';
import type { LeadTableRow } from '../leads-table/leads-table';
import { createLeadDateFormatter } from '../lead-date';
import { leadCardData as copy } from './lead-card.data';

export type LeadCardRecord = Omit<LeadTableRow, 'canRestore'> & { version: number; needsAttention: boolean; canMove: boolean; canArchive?: boolean; canRestore?: boolean; canDelete?: boolean };
export type LeadCardProps = {
  lead: LeadCardRecord; recordHref: string; now: string; timezone: string; disabled?: boolean; movementControl?: ReactNode;
  onDragStart?: (event: DragEvent<HTMLElement>) => void;
  onDragEnd?: () => void;
  onOpen?: (lead: LeadCardRecord) => void;
  /** Requests the shared move review; never commits a stage change here. */
  onRequestMove?: (lead: LeadCardRecord) => void;
};
const tones: Record<LeadCardRecord['stage'], StatusBadgeTone> = { new: 'neutral', contacted: 'info', 'estimate-sent': 'warning', won: 'success', lost: 'error' };
const interactive = 'a,button,input,[role="menu"],[role="menuitem"],time';

/** Display card with independent record navigation, quick view and permission-gated move request. */
export function LeadCard({ lead, recordHref, now, timezone, disabled = false, movementControl, onDragStart, onDragEnd, onOpen, onRequestMove }: LeadCardProps) {
  const id = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const suppressClick = useRef(false);
  const requested = useRef<LeadCardRecord | null>(null);
  const canMove = lead.canMove && !!onRequestMove;
  const created = createLeadDateFormatter(now, timezone)(lead.createdAt);
  const relative = !created ? copy.dateUnavailable : created.age === 0 ? copy.today : created.age === 1 ? copy.yesterday : created.age > 1 ? copy.daysAgo(created.age) : created.displayDate;
  const words = lead.owner?.name.trim().split(/\s+/) ?? [];
  const initials = [words[0], ...(words.length > 1 ? [words[words.length - 1]] : [])].map(word => Array.from(word ?? '')[0] ?? '').join('').toUpperCase();
  function open(event: MouseEvent | KeyboardEvent) {
    if (!('key' in event) && suppressClick.current) return;
    if (disabled || !onOpen || (event.target as HTMLElement).closest(interactive)) return;
    if ('key' in event) { if (event.key !== 'Enter' && event.key !== ' ') return; event.preventDefault(); }
    onOpen(lead);
  }
  return <article aria-labelledby={`${id}-name`} tabIndex={!disabled && onOpen ? 0 : undefined} aria-busy={disabled}
    draggable={!disabled && lead.canMove && !lead.archived && !!onDragStart}
    onPointerDown={() => { suppressClick.current = false; }}
    onDragStart={event => {
      const target = event.target as HTMLElement;
      if (disabled || !lead.canMove || lead.archived || !onDragStart || (target.closest(interactive) && !target.closest('[data-move-lead]'))) { event.preventDefault(); return; }
      onDragStart(event);
      if (!event.defaultPrevented) { suppressClick.current = true; setDragging(true); }
    }}
    onDragEnd={() => { setDragging(false); onDragEnd?.(); }}
    onClick={open} onKeyDown={open} className={`grid min-w-0 gap-3 rounded-2xl border border-line bg-paper p-4 shadow-sm focus-visible:focus-ring ${dragging ? 'ring-2 ring-primary shadow-lg' : ''} ${!disabled && lead.canMove && !lead.archived && onDragStart ? 'cursor-grab active:cursor-grabbing hover:border-primary/40' : !disabled && onOpen ? 'cursor-pointer hover:border-primary/40' : ''}`}>
    <div className="flex min-w-0 items-start justify-between gap-2">
      <div className="min-w-0 flex-1"><h3 id={`${id}-name`} className="m-0 text-base leading-6 font-semibold wrap-anywhere">{disabled ? <span className="text-ink">{lead.name}</span> : <a href={recordHref} className="rounded-lg text-primary hover:underline focus-visible:focus-ring">{lead.name}</a>}</h3>
        <p className="mb-0 mt-1 text-sm leading-6 text-muted wrap-anywhere">{lead.service}</p>
      </div>
      <div className="flex shrink-0 items-center">{movementControl}{canMove && <button type="button" disabled={disabled} id={`${id}-actions`} aria-label={copy.more(lead.name)} aria-haspopup="menu" aria-expanded={!!anchor} aria-controls={anchor ? `${id}-menu` : undefined}
        onClick={event => { if (!disabled && canMove) setAnchor(event.currentTarget); }} className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-muted hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50"><MoreHorizOutlined aria-hidden="true"/></button>}</div>
    </div>
    <div className="flex flex-wrap gap-2"><StatusBadge label={copy.stages.find(stage => stage.value === lead.stage)!.label} tone={tones[lead.stage]} dot/><StatusBadge label={copy.sources.find(source => source.value === lead.source)!.label}/>
      {!lead.owner && <StatusBadge label={copy.unassigned}/>}{lead.needsAttention && <StatusBadge label={copy.attention} tone="warning"/>}{lead.archived && <StatusBadge label={copy.archived}/>}{disabled && <StatusBadge label={copy.updating}/>}</div>
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
      <div role="group" aria-label={copy.owner} className="flex min-w-0 items-center gap-2">
        {lead.owner ? <><span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary-dark">{initials}</span><span className="min-w-0 text-sm text-muted wrap-anywhere">{lead.owner.name}</span></> : <span className="text-sm text-muted">{copy.unassigned}</span>}
      </div>
      {created ? <Tooltip title={created.exact} describeChild><time dateTime={lead.createdAt} tabIndex={0} aria-label={copy.dateLabel(relative, created.exact)} className="rounded-lg text-xs leading-5 text-muted focus-visible:focus-ring">{relative}</time></Tooltip> : <span className="text-xs text-muted">{relative}</span>}
    </div>
    {canMove && <Menu id={`${id}-menu`} anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}
      slotProps={{ paper: { role: 'region', 'aria-label': copy.more(lead.name), className: 'min-w-48 rounded-xl border border-line bg-paper text-ink' }, list: { 'aria-labelledby': `${id}-actions` }, transition: { onExited: () => { const snapshot = requested.current; requested.current = null; if (snapshot && !disabled && canMove) onRequestMove?.(snapshot); } } }}>
      <MenuItem disabled={disabled} onClick={() => { if (!disabled && canMove) { requested.current = lead; setAnchor(null); } }} className="min-h-11 text-sm text-ink focus-visible:focus-ring">{copy.move}</MenuItem>
    </Menu>}
  </article>;
}
