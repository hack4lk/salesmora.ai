'use client';
import { useId, useState, type ReactNode } from 'react';
import Dialog from '@mui/material/Dialog';
import type { WorkspaceRole } from '@salesmora/contracts';
import { FormFeedback } from '@salesmora/ui';
import { paymentMethodDialogData as copy } from './payment-method-dialog.data';

export type PaymentMethodState = 'editing' | 'saving' | 'saved' | 'error' | 'authenticating' | 'recovering' | 'recovered' | 'payment-failed';
export interface PaymentMethodDialogProps {
  open: boolean;
  viewerRole: WorkspaceRole;
  state?: PaymentMethodState;
  card?: { brand: string; last4: string; expMonth: number; expYear: number } | null;
  recovery?: { number: string; amountDue: number };
  cardForm?: ReactNode;
  verificationForm?: ReactNode;
  canSave?: boolean;
  stripeActive?: boolean;
  outstandingPayment?: boolean;
  onClose: () => void;
  onSave: () => void;
  onPay?: () => void;
  onChangeCard?: () => void;
}
const secondary = 'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-paper px-4 py-3 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-muted';
const primary = 'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-dark focus-visible:focus-ring disabled:cursor-not-allowed disabled:bg-line disabled:text-muted';

/** Inject Stripe fields and verified states through an adapter; Storybook supplies fictional callbacks. */
export function PaymentMethodDialog({ open, viewerRole, state = 'editing', card, recovery, cardForm, verificationForm, canSave = false, stripeActive = false, outstandingPayment = false, onClose, onSave, onPay, onChangeCard }: PaymentMethodDialogProps) {
  const id = useId();
  const [consent, setConsent] = useState(false);
  const owner = viewerRole === 'owner';
  const busy = ['saving', 'authenticating', 'recovering'].includes(state);
  const editing = ['editing', 'saving', 'error', 'authenticating'].includes(state);
  const amount = recovery ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(recovery.amountDue / 100) : '';
  const title = state === 'authenticating' ? copy.verifying : state === 'recovering' ? copy.payingTitle : state === 'recovered' ? copy.recoveredTitle : state === 'saved' ? copy.savedTitle : state === 'payment-failed' ? copy.failedTitle : copy.title;
  function close() { if (!busy) onClose(); }
  if (viewerRole !== 'owner' && viewerRole !== 'admin') return null;
  return <Dialog open={open} className="z-50" maxWidth="sm" fullWidth scroll="paper" disableEnforceFocus={stripeActive || state === 'authenticating'}
    onClose={(_event, reason) => { if (reason !== 'backdropClick') close(); }}
    slotProps={{ transition: { onExited: () => setConsent(false) }, backdrop: { className: 'bg-ink/50' }, paper: { 'aria-labelledby': `${id}-title`, 'aria-describedby': `${id}-description`, className: 'm-4 min-w-0 rounded-2xl bg-paper text-ink sm:m-8' } }}>
    <div className="grid min-w-0 gap-6 p-6 sm:p-8" aria-busy={busy}>
      <header><div className="flex flex-wrap items-start justify-between gap-3"><h2 id={`${id}-title`} className="m-0 text-2xl font-semibold text-ink">{title}</h2><button type="button" aria-label={copy.close} disabled={busy} onClick={close} className={secondary}>{copy.closeLabel}</button></div><p id={`${id}-description`} className="mb-0 mt-3 text-sm leading-6 text-muted">{copy.description}</p></header>
      <section aria-labelledby={`${id}-current`} className="rounded-xl border border-line bg-canvas p-4"><h3 id={`${id}-current`} className="m-0 text-sm font-semibold text-muted">{copy.current}</h3><p className="mb-0 mt-2 font-semibold text-ink">{card ? `${card.brand} · ${card.last4}` : copy.noCard}</p>{card && <p className="mb-0 mt-1 text-sm text-muted">{copy.expires} {String(card.expMonth).padStart(2, '0')}/{card.expYear}</p>}</section>
      {!owner ? <p className="m-0 text-sm leading-6 text-muted">{copy.readOnly}</p> : <>
        {editing && <form onSubmit={event => { event.preventDefault(); if (!busy && canSave && consent) onSave(); }} className="grid gap-5">
          {state === 'error' && <FormFeedback kind="error" title={copy.errorTitle} message={copy.error} />}
          <fieldset disabled={busy} className="m-0 min-w-0 border-0 p-0"><legend className="mb-3 text-base font-semibold text-ink">{copy.cardFormTitle}</legend>{cardForm}<p className="mb-0 mt-3 text-sm leading-6 text-muted">{copy.secure}</p></fieldset>
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-6"><input type="checkbox" disabled={busy} checked={consent} onChange={event => setConsent(event.target.checked)} className="mt-1 size-5 shrink-0 accent-primary focus-visible:focus-ring"/>{copy.consent}</label>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" disabled={busy} onClick={close} className={secondary}>{copy.cancel}</button><button type="submit" disabled={busy || !canSave || !consent} className={primary}>{busy ? copy.saving : state === 'error' ? copy.retrySave : copy.save}</button></div>
        </form>}
        {state === 'authenticating' && <section aria-label={copy.verifying}><p className="mt-0 text-sm leading-6 text-muted">{copy.verification}</p>{verificationForm}</section>}
        {state === 'saved' && <><FormFeedback kind="success" title={copy.savedTitle} message={copy.saved} />{outstandingPayment && <p className="m-0 text-sm leading-6 text-muted">{copy.savedRecovery}</p>}</>}
        {state === 'recovering' && <p role="status" className="m-0 text-sm leading-6 text-muted">{copy.paying}</p>}
        {state === 'recovered' && <FormFeedback kind="success" title={copy.recoveredTitle} message={copy.recovered} />}
        {state === 'payment-failed' && <FormFeedback kind="error" title={copy.failedTitle} message={copy.failed} />}
        {recovery && state !== 'recovered' && <section aria-labelledby={`${id}-recovery`} className="rounded-xl border border-l-8 border-error bg-error/5 p-4"><h3 id={`${id}-recovery`} className="m-0 text-lg font-semibold text-ink">{copy.recoveryTitle}</h3><dl className="my-4 grid gap-3"><div className="flex flex-wrap justify-between gap-2"><dt className="text-sm text-muted">{copy.invoice}</dt><dd className="m-0 font-semibold text-ink wrap-anywhere">{recovery.number}</dd></div><div className="flex flex-wrap justify-between gap-2"><dt className="text-sm text-muted">{copy.due}</dt><dd className="m-0 text-xl font-semibold text-ink">{amount}</dd></div></dl><p className="mb-0 text-sm leading-6 text-muted">{copy.recoveryNote}</p>{['saved', 'payment-failed'].includes(state) && <button type="button" disabled={!onPay} onClick={onPay} className={`${primary} mt-5 w-full`}>{copy.pay(amount)}</button>}</section>}
        {['saved', 'recovered', 'payment-failed'].includes(state) && <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">{state === 'payment-failed' && onChangeCard && <button type="button" onClick={onChangeCard} className={secondary}>{copy.changeCard}</button>}<button type="button" onClick={close} className={secondary}>{copy.done}</button></div>}
      </>}
    </div>
  </Dialog>;
}
