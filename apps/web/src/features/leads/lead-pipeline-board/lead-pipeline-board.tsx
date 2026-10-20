'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { FormFeedback, DragIndicatorOutlined } from '@salesmora/ui';
import { MoveStageDialog } from '../move-stage-dialog/move-stage-dialog';
import { LeadCard, type LeadCardRecord } from '../lead-card/lead-card';
import { leadPipelineBoardData as copy } from './lead-pipeline-board.data';

type Stage = LeadCardRecord['stage'];
export type PipelineColumn = { stage: Stage; total: number; leads: readonly LeadCardRecord[]; loading?: boolean; error?: string; hasMore?: boolean };
export type PipelineMove = { lead: LeadCardRecord; to: Stage; reason?: string };
export type LeadPipelineBoardProps = {
  columns: readonly PipelineColumn[]; now: string; timezone: string; pendingId?: string;
  recordHref: (lead: LeadCardRecord) => string;
  onOpen?: (lead: LeadCardRecord) => void;
  onLoadMore?: (stage: Stage) => void;
  /** Caller submits the version, refreshes scoped columns/counts, and owns persistent failure feedback. */
  onConfirmMove?: (move: PipelineMove) => void;
};

/** Controlled presentation; callers supply authorized, paged records and authoritative capabilities. */
export function LeadPipelineBoard({ columns, now, timezone, pendingId, recordHref, onOpen, onLoadMore, onConfirmMove }: LeadPipelineBoardProps) {
  const id = useId();
  const [lostOpen, setLostOpen] = useState(false);
  const board = useRef<HTMLDivElement>(null);
  const restore = useRef<string | null>(null);
  const [picked, setPicked] = useState<{ lead: LeadCardRecord; to: Stage } | null>(null);
  const [review, setReview] = useState<PipelineMove | null>(null);
  const [reason, setReason] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const dragged = useRef<LeadCardRecord | null>(null);
  const currentReview = review ? columns.flatMap(column => column.leads).find(lead => lead.id === review.lead.id) : undefined;
  const canMove = (lead: LeadCardRecord) => lead.canMove && !lead.archived && !pendingId && !!onConfirmMove;
  function request(lead: LeadCardRecord, to: Stage) {
    if (!canMove(lead)) return;
    restore.current = lead.id;
    setPicked(null); setReason(''); setReview({ lead, to });
  }
  function selectTarget(lead: LeadCardRecord, to: Stage) {
    setPicked({ lead, to });
    setAnnouncement(copy.picked(lead.name, copy.stages.find(stage => stage.value === to)!.label));
  }
  useEffect(() => {
    if (review || !restore.current) return;
    const leadId = restore.current;
    const timer = setTimeout(() => {
      restore.current = null;
      const handle = Array.from(board.current?.querySelectorAll<HTMLButtonElement>('[data-move-lead]') ?? []).find(button => button.dataset.moveLead === leadId && !button.disabled && button.getClientRects().length);
      (handle ?? board.current)?.focus({ preventScroll: true });
    }, 350);
    return () => clearTimeout(timer);
  }, [review]);
  return <>
    <p id={`${id}-instructions`} className="mb-4 mt-0 text-sm leading-6 text-muted">{onConfirmMove && columns.some(column => column.leads.some(lead => lead.canMove)) ? copy.instructions : copy.readOnlyInstructions}</p>
    <p role="status" aria-live="polite" className="sr-only">{announcement}</p>
    <div ref={board} role="region" aria-label={copy.label} tabIndex={0} aria-describedby={`${id}-instructions`} className="w-full min-w-0 max-w-full overflow-x-auto rounded-2xl pb-4 focus-visible:focus-ring">
      <div className="flex items-start gap-4">
        {copy.stages.map(stage => {
          const column = columns.find(item => item.stage === stage.value);
          const leads = column?.leads ?? [], total = column?.total ?? 0;
          const collapsed = stage.value === 'lost' && !lostOpen;
          const target = picked?.to === stage.value;
          return <section key={stage.value} aria-labelledby={`${id}-${stage.value}`} onDragOver={event => { if (dragged.current && canMove(dragged.current)) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; if (picked?.to !== stage.value) selectTarget(dragged.current, stage.value); } }}
            onDrop={event => { event.preventDefault(); const lead = dragged.current; dragged.current = null; if (lead && lead.stage !== stage.value) request(lead, stage.value); }}
            className={`w-72 shrink-0 rounded-2xl border p-3 ${target ? 'border-primary bg-primary/10' : 'border-line bg-canvas'}`}>
            <div className="mb-3 flex items-start justify-between gap-2"><div><h2 id={`${id}-${stage.value}`} className="m-0 text-base font-semibold text-ink">{stage.label}</h2><p className="m-0 text-sm text-muted">{copy.count(total)}</p></div>
              {stage.value === 'lost' && <button type="button" aria-expanded={lostOpen} aria-controls={`${id}-lost-content`} onClick={() => setLostOpen(!lostOpen)} className="min-h-11 cursor-pointer rounded-xl px-3 text-sm font-semibold text-primary focus-visible:focus-ring">{lostOpen ? copy.hideLost : copy.showLost}</button>}
            </div>
            <div id={stage.value === 'lost' ? `${id}-lost-content` : undefined} hidden={collapsed} className="grid max-h-screen gap-3 overflow-y-auto p-1" aria-busy={column?.loading}>
              {leads.map(lead => {
                const movementControl = lead.canMove && !lead.archived && onConfirmMove && <button type="button" data-move-lead={lead.id} draggable={!pendingId} disabled={!!pendingId} aria-label={copy.move(lead.name)} aria-describedby={`${id}-instructions`}
                  onClick={() => request(lead, copy.stages.find(stage => stage.value !== lead.stage)!.value)}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (picked?.lead.id === lead.id) { if (picked.to !== lead.stage) request(lead, picked.to); else { setPicked(null); setAnnouncement(copy.canceled); } } else selectTarget(lead, lead.stage); }
                    else if (event.key.startsWith('Arrow') && picked?.lead.id === lead.id) { event.preventDefault(); const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1; const index = copy.stages.findIndex(stage => stage.value === picked.to); selectTarget(lead, copy.stages[(index + direction + copy.stages.length) % copy.stages.length].value); }
                    else if (event.key === 'Escape') { setPicked(null); setAnnouncement(copy.canceled); }
                  }} className="flex size-11 cursor-grab items-center justify-center rounded-xl text-muted hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50"><DragIndicatorOutlined aria-hidden="true"/></button>;
                return <LeadCard key={lead.id}
                  onDragStart={canMove(lead) ? event => { dragged.current = lead; event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', lead.id); selectTarget(lead, lead.stage); } : undefined}
                  onDragEnd={() => { dragged.current = null; setPicked(null); }} movementControl={movementControl} lead={{ ...lead, canMove: lead.canMove && !lead.archived }} recordHref={recordHref(lead)} now={now} timezone={timezone} disabled={pendingId === lead.id} onOpen={onOpen}
                  onRequestMove={onConfirmMove && !pendingId ? record => request(record, copy.stages.find(stage => stage.value !== record.stage)!.value) : undefined}/>
              })}
              {!leads.length && !column?.loading && !column?.error && <p className="m-0 py-6 text-sm text-muted">{copy.empty}</p>}
              {column?.loading && <p role="status" className="m-0 py-3 text-sm text-muted">{copy.loading}</p>}
              {column?.error && <FormFeedback kind="error" message={column.error}/>}
              <p className="m-0 text-xs text-muted">{copy.loaded(leads.length, total)}</p>
              {onLoadMore && (column?.hasMore ?? (leads.length < total || !!column?.error)) && <button type="button" disabled={column?.loading || !!pendingId} onClick={() => onLoadMore(stage.value)} className="min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 font-semibold text-primary focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">{column?.error ? copy.retry : copy.more}</button>}
            </div>
          </section>;
        })}
      </div>
    </div>
    {review && <MoveStageDialog open lead={{ ...review.lead, canMove: !!currentReview?.canMove && !!onConfirmMove, archived: currentReview?.archived ?? review.lead.archived }}
      error={!currentReview || currentReview.version !== review.lead.version ? { kind: 'conflict', message: copy.stale } : undefined} value={{ to: review.to, reason }} pending={!!pendingId}
      onChange={value => { setReview({ ...review, to: value.to }); setReason(value.reason); }} onClose={() => setReview(null)}
      onConfirm={request => {
        const current = columns.flatMap(column => column.leads).find(lead => lead.id === review.lead.id);
        if (!current || current.version !== review.lead.version || !canMove(current)) return Promise.reject();
        if (request.to === 'lost') setLostOpen(true);
        setReview(null);
        onConfirmMove?.({ lead: current, to: request.to, reason: request.reason });
      }}/>}
  </>;
}
