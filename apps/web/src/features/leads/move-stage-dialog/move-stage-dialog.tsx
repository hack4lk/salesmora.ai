'use client';

import { useId, useState } from 'react';
import { ConfirmDialog, FormFeedback } from '@salesmora/ui';
import { moveStageDialogData as copy } from './move-stage-dialog.data';

export type LeadStage = (typeof copy.stages)[number]['value'];
export type MoveStageLead = { id: string; version: number; name: string; stage: LeadStage; canMove: boolean; archived: boolean };
export type MoveStageValue = { to: LeadStage; reason: string };
export type MoveStageRequest = { lead: MoveStageLead; to: LeadStage; reason?: string };
export type MoveStageDialogProps = {
  open: boolean; lead: MoveStageLead; value: MoveStageValue; pending?: boolean;
  error?: { kind: 'error' | 'conflict'; message: string };
  onChange: (value: MoveStageValue) => void;
  onClose: () => void;
  /** Caller reauthorizes, checks the expected version, and owns success closure or optimistic dispatch. */
  onConfirm: (request: MoveStageRequest) => void | Promise<void>;
  onReload?: () => void | Promise<void>;
};

/** Controlled stage review; no persistence or role-name policy is implemented here. */
export function MoveStageDialog({ open, lead, value, pending = false, error, onChange, onClose, onConfirm, onReload }: MoveStageDialogProps) {
  const id = useId();
  const [reloadError, setReloadError] = useState(false);
  const [working, setWorking] = useState(false);
  const busy = pending || working;
  const forbidden = !lead.canMove || lead.archived;
  const conflict = error?.kind === 'conflict';
  const stageValid = copy.stages.some(stage => stage.value === value.to) && value.to !== lead.stage;
  const valid = stageValid && (value.to !== 'lost' || value.reason.length <= 500);
  const blocked = forbidden || conflict || !valid;
  const current = copy.stages.find(stage => stage.value === lead.stage)!.label;
  async function confirm() {
    if (busy || blocked) return;
    setWorking(true);
    try { await onConfirm({ lead, to: value.to, reason: value.to === 'lost' ? value.reason.trim() || undefined : undefined }); }
    finally { setWorking(false); }
  }
  async function reload() {
    if (!onReload || busy) return;
    setWorking(true);
    setReloadError(false);
    try { await onReload(); }
    catch { setReloadError(true); }
    finally { setWorking(false); }
  }
  return <ConfirmDialog open={open} title={copy.title} description={copy.description(lead.name, current)} confirmLabel={copy.confirm}
    cancelLabel={copy.cancel} pendingLabel={copy.pending} pending={busy} confirmDisabled={blocked}
    error={error?.kind === 'error' ? error.message : undefined} onClose={onClose} onConfirm={confirm}>
    <div className="grid gap-4">
      {forbidden && !conflict ? <FormFeedback kind="error" message={lead.archived ? copy.archived : copy.forbidden}/> : <>
        <label htmlFor={`${id}-stage`} className="grid gap-2 text-sm font-semibold text-ink">{copy.stage}
          <select id={`${id}-stage`} value={value.to} disabled={busy || conflict} onChange={event => onChange({ ...value, to: event.target.value as LeadStage })}
            className="min-h-11 rounded-xl border border-line bg-paper px-3 text-base focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">
            {!stageValid && <option value={value.to} disabled>{copy.choose}</option>}
            {copy.stages.filter(stage => stage.value !== lead.stage).map(stage => <option key={stage.value} value={stage.value}>{stage.label}</option>)}
          </select>
        </label>
        {value.to === 'lost' && <div className="grid gap-2">
          <label htmlFor={`${id}-reason`} className="text-sm font-semibold text-ink">{copy.reason}</label>
          <textarea id={`${id}-reason`} value={value.reason} disabled={busy || conflict} maxLength={500} rows={3}
            onChange={event => onChange({ ...value, reason: event.target.value })} aria-describedby={`${id}-reason-help`}
            className="rounded-xl border border-line bg-paper p-3 text-base focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50"/>
          <p id={`${id}-reason-help`} className="m-0 text-sm text-muted">{copy.reasonHelp}</p>
        </div>}
        {!valid && <FormFeedback kind="error" message={copy.invalid}/>}
      </>}
      {conflict && <><FormFeedback kind="error" title={copy.conflictTitle} message={error.message}/>
        {reloadError && <FormFeedback kind="error" message={copy.reloadFailed}/>}
        {onReload && <button type="button" disabled={busy} onClick={() => { void reload(); }} className="min-h-11 cursor-pointer rounded-xl border border-line px-4 font-semibold text-primary focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">{copy.reload}</button>}
      </>}
    </div>
  </ConfirmDialog>;
}
