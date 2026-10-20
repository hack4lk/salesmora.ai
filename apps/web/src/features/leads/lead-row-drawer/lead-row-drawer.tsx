'use client';

import { useId } from 'react';
import { SideDrawer, StatusBadge, FormFeedback, type StatusBadgeTone } from '@salesmora/ui';
import { leadRowDrawerData as copy } from './lead-row-drawer.data';

export type LeadQuickView = {
  id: string; version: number; leadNumber: string; name: string; service: string;
  email: string | null; phone: string | null; owner: { id: string; name: string } | null;
  stage: typeof copy.stages[number]['value']; source: typeof copy.sources[number]['value']; createdAt: string;
  archived: boolean; nextStep: string | null; permissions: { canMove: boolean; canAssign: boolean };
  activityTotal: number;
  activity: readonly { id: string; summary: string; actorName: string; viaAssistant: boolean; createdAt: string }[];
};
export type LeadRowDrawerProps = {
  open: boolean; lead: LeadQuickView; viewerId: string; timezone: string; recordHref: string;
  pending?: boolean; error?: { kind: 'conflict' | 'error'; message: string };
  onClose: () => void;
  onRequestMove?: (lead: LeadQuickView) => void;
  onRequestAssignment?: (lead: LeadQuickView) => void;
  onAssignToMe?: (lead: LeadQuickView) => void;
  onReload?: (lead: LeadQuickView) => void;
};
const tones: Record<LeadQuickView['stage'], StatusBadgeTone> = { new: 'neutral', contacted: 'info', 'estimate-sent': 'warning', won: 'success', lost: 'error' };
const button = 'min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-muted';
const link = 'rounded-lg font-semibold text-primary hover:underline focus-visible:focus-ring';

/** Read-only quick details plus workflow requests. The caller confirms and authorizes writes. */
export function LeadRowDrawer({ open, lead, viewerId, timezone, recordHref, pending = false, error, onClose, onRequestMove, onRequestAssignment, onAssignToMe, onReload }: LeadRowDrawerProps) {
  const id = useId();
  let zone = timezone;
  try { new Intl.DateTimeFormat('en-US', { timeZone: zone }).format(); } catch { zone = 'UTC'; }
  const formatter = new Intl.DateTimeFormat('en-US', { timeZone: zone, dateStyle: 'medium', timeStyle: 'short' });
  function time(value: string) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? <time dateTime={value}>{formatter.format(date)} · {zone}</time> : copy.dateUnavailable;
  }
  const blocked = pending || error?.kind === 'conflict';
  const digits = lead.phone?.replace(/\D/g, '') ?? '';
  const phoneHref = digits ? `tel:${lead.phone?.trim().startsWith('+') ? '+' : ''}${digits}` : undefined;
  const sectionHeading = 'mb-4 mt-0 text-base font-semibold text-ink';
  return <SideDrawer open={open} title={lead.name} description={copy.subtitle(lead.leadNumber, lead.service)} busy={pending} onClose={onClose}
    footer={pending ? <span role="link" aria-disabled="true" className="inline-flex min-h-11 items-center text-base font-semibold text-muted">{copy.record}</span> : <a href={recordHref} className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-3 font-semibold text-paper hover:bg-primary-dark focus-visible:focus-ring">{copy.record}</a>}>
    <div className="grid min-w-0 gap-6">
      <div className="flex flex-wrap gap-2"><StatusBadge label={copy.stages.find(stage => stage.value === lead.stage)!.label} tone={tones[lead.stage]} dot/><StatusBadge label={copy.sources.find(source => source.value === lead.source)!.label}/>{lead.archived && <StatusBadge label={copy.archived}/>}</div>
      {error && <div className="grid gap-3"><FormFeedback kind="error" title={error.kind === 'conflict' ? copy.conflictTitle : copy.errorTitle} message={error.message}/>{onReload && <div><button type="button" className={button} disabled={pending} onClick={() => { if (!pending) onReload(lead); }}>{copy.reload}</button></div>}</div>}
      <section aria-labelledby={`${id}-contact`}><h3 id={`${id}-contact`} className={sectionHeading}>{copy.contact}</h3>
        <dl className="m-0 grid min-w-0 gap-4 sm:grid-cols-2">
          <div className="min-w-0"><dt className="text-sm text-muted">{copy.email}</dt><dd className="m-0 mt-1 wrap-anywhere">{lead.email ? pending ? lead.email : <a href={`mailto:${encodeURIComponent(lead.email)}`} className={link}>{lead.email}</a> : copy.notProvided}</dd></div>
          <div className="min-w-0"><dt className="text-sm text-muted">{copy.phone}</dt><dd className="m-0 mt-1 wrap-anywhere">{lead.phone ? !pending && phoneHref ? <a href={phoneHref} className={link}>{lead.phone}</a> : lead.phone : copy.notProvided}</dd></div>
          <div><dt className="text-sm text-muted">{copy.owner}</dt><dd className="m-0 mt-1">{lead.owner?.name ?? <StatusBadge label={copy.unassigned}/>}</dd></div>
          <div><dt className="text-sm text-muted">{copy.created}</dt><dd className="m-0 mt-1 text-sm leading-6">{time(lead.createdAt)}</dd></div>
        </dl>
      </section>
      <section aria-labelledby={`${id}-next`} className="border-t border-line pt-6"><h3 id={`${id}-next`} className={sectionHeading}>{copy.next}</h3><p className="m-0 leading-6 text-muted">{lead.nextStep || copy.noNext}</p>
        {lead.permissions.canMove && onRequestMove && <button type="button" disabled={blocked} className={`${button} mt-4`} onClick={() => { if (!blocked && lead.permissions.canMove) onRequestMove(lead); }}>{copy.move}</button>}
      </section>
      {lead.permissions.canAssign && (onRequestAssignment || onAssignToMe) && <section aria-labelledby={`${id}-assignment`} className="border-t border-line pt-6"><h3 id={`${id}-assignment`} className={sectionHeading}>{copy.assignment}</h3>
        <div className="flex flex-wrap gap-3">{onRequestAssignment && <button type="button" className={button} disabled={blocked} onClick={() => { if (!blocked && lead.permissions.canAssign) onRequestAssignment(lead); }}>{copy.changeOwner}</button>}
          {lead.owner?.id === viewerId ? <p className="m-0 flex min-h-11 items-center text-sm text-muted">{copy.assignedMe}</p> : onAssignToMe && <button type="button" className={button} disabled={blocked} onClick={() => { if (!blocked && lead.permissions.canAssign) onAssignToMe(lead); }}>{copy.assignMe}</button>}
        </div>
      </section>}
      <section aria-labelledby={`${id}-activity`} className="border-t border-line pt-6"><h3 id={`${id}-activity`} className={sectionHeading}>{copy.activity}</h3>
        {lead.activity.length ? <ol className="m-0 grid gap-5 pl-5">{lead.activity.slice(0, 5).map(event => <li key={event.id} className="pl-1"><p className="m-0 text-sm leading-6">{event.summary}</p><p className="mb-0 mt-1 text-sm text-muted">{copy.actor(event.actorName, event.viaAssistant)}</p><p className="mb-0 mt-1 text-xs leading-5 text-muted">{time(event.createdAt)}</p></li>)}</ol> : <p className="m-0 text-sm text-muted">{copy.noActivity}</p>}
        {lead.activityTotal > 5 && <p className="mb-0 mt-5 text-sm leading-6 text-muted">{copy.older}</p>}
      </section>
    </div>
  </SideDrawer>;
}
