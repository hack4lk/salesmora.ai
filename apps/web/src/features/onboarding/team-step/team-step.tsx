'use client';
import { useEffect, useId, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import MuiTextField from '@mui/material/TextField';
import { TextField, fieldClasses } from '@salesmora/ui';
import { OnboardingStepFrame } from '../onboarding-step-frame/onboarding-step-frame';
import { teamStepData as copy } from './team-step.data';
import { validateTeam, type TeamInvitation, type TeamValues } from './team-step.validation';
export type { TeamInvitation, TeamValues } from './team-step.validation';
export interface TeamStepProps {
  ownerEmail: string; values: TeamValues; onChange: (values: TeamValues) => void;
  onContinue: (values: TeamValues) => void; onBack: () => void; onSkip: () => void; pending?: boolean; teammateLimit?: number;
}
/** Collects invitation drafts only; the parent owns navigation and delivery. */
export function TeamStep({ ownerEmail, values, onChange, onContinue, onBack, onSkip, pending = false, teammateLimit }: TeamStepProps) {
  const id = useId();
  const [attempted, setAttempted] = useState(false);
  const focusId = useRef<string | null>(null);
  const fields = useRef(new Map<string, HTMLInputElement | HTMLSelectElement>());
  const addButton = useRef<HTMLButtonElement>(null);
  const errors = attempted ? validateTeam(values, ownerEmail) : {};
  useEffect(() => { if (focusId.current) { fields.current.get(focusId.current)?.focus(); focusId.current = null; } }, [values]);
  function update(invite: TeamInvitation, patch: Partial<TeamInvitation>) {
    onChange({ invitations: values.invitations.map(row => row.id === invite.id ? { ...row, ...patch } : row) });
  }
  function proceed() {
    if (pending || (teammateLimit !== undefined && values.invitations.length + 1 > teammateLimit)) return;
    setAttempted(true);
    const next = validateTeam(values, ownerEmail);
    for (const invite of values.invitations) for (const field of ['email', 'role'] as const) {
      if (next[invite.id]?.[field]) { fields.current.get(`${invite.id}-${field}`)?.focus(); return; }
    }
    onContinue({ invitations: values.invitations.map(invite => ({ ...invite, email: invite.email.trim().toLowerCase() })) });
  }
  return <OnboardingStepFrame activeStep="team" onContinue={proceed} onBack={onBack} onSkipTeam={onSkip} pending={pending}>
    <div className="grid min-w-0 gap-6">
      {teammateLimit !== undefined && <p className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm leading-6 text-muted">{copy.planSeats(teammateLimit)}</p>}
      <div className="rounded-xl border border-line bg-canvas p-4"><p className="m-0 text-sm font-semibold text-ink">{copy.owner}</p><p className="mb-0 mt-1 text-sm text-ink wrap-anywhere">{ownerEmail}</p><p className="mb-0 mt-2 text-sm text-muted">{copy.ownerHelp}</p></div>
      <div className="grid min-w-0 gap-4">
        {values.invitations.length === 0 && <p className="m-0 text-sm leading-6 text-muted">{copy.empty}</p>}
        {values.invitations.map((invite, index) => <fieldset key={invite.id} className="m-0 grid min-w-0 gap-4 rounded-xl border border-line p-4">
          <legend className="px-1 text-sm font-semibold text-ink">{copy.teammate(index + 1)}</legend>
          <TextField id={`${id}-${invite.id}-email`} inputRef={(node: HTMLInputElement | null) => { if (node) fields.current.set(`${invite.id}-email`, node); else fields.current.delete(`${invite.id}-email`); }} label={copy.email} type="email" required autoComplete="off" disabled={pending} value={invite.email} onChange={event => update(invite, { email: event.target.value })} error={!!errors[invite.id]?.email} helperText={errors[invite.id]?.email} />
          <MuiTextField id={`${id}-${invite.id}-role`} inputRef={(node: HTMLSelectElement | null) => { if (node) fields.current.set(`${invite.id}-role`, node); else fields.current.delete(`${invite.id}-role`); }} label={copy.role} select slotProps={{ select: { native: true }, inputLabel: { shrink: true } }} size="small" fullWidth disabled={pending} value={invite.role} onChange={event => update(invite, { role: event.target.value as TeamInvitation['role'] })} error={!!errors[invite.id]?.role} helperText={errors[invite.id]?.role} className={fieldClasses}>
            {copy.roles.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </MuiTextField>
          <Button type="button" disabled={pending} onClick={() => { onChange({ invitations: values.invitations.filter(row => row.id !== invite.id) }); addButton.current?.focus(); }} className="min-h-11 justify-self-start rounded-xl px-3 text-sm font-semibold normal-case text-primary hover:bg-canvas focus-visible:focus-ring">{copy.remove(index + 1)}</Button>
        </fieldset>)}
        <Button ref={addButton} type="button" variant="outlined" disabled={pending || values.invitations.length >= (teammateLimit === undefined ? 100 : teammateLimit - 1)} onClick={() => { const key = crypto.randomUUID(); onChange({ invitations: [...values.invitations, { id: key, email: '', role: 'field' }] }); focusId.current = `${key}-email`; }} className="min-h-11 justify-self-start rounded-xl border-line px-4 font-semibold normal-case text-primary hover:bg-canvas focus-visible:focus-ring">{copy.add}</Button>
      </div>
      <div className="grid gap-2 text-sm leading-6 text-muted"><p className="m-0">{copy.permissions}</p><p className="m-0">{copy.delivery}</p></div>
    </div>
  </OnboardingStepFrame>;
}
