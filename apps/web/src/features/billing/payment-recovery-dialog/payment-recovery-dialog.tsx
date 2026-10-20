'use client';
import { useId, type ReactNode } from 'react';
import Dialog from '@mui/material/Dialog';
import type { WorkspaceRole } from '@salesmora/contracts';
import { FormFeedback } from '@salesmora/ui';
import { paymentRecoveryDialogData as copy } from './payment-recovery-dialog.data';

export type PaymentRecoveryState = 'loading' | 'review' | 'processing' | 'authenticating' | 'confirming' | 'pending' | 'paid' | 'already-paid' | 'declined' | 'changed' | 'unavailable';
export interface PaymentRecoveryDialogProps {
  open: boolean;
  viewerRole: WorkspaceRole;
  state?: PaymentRecoveryState;
  invoice?: { number: string; description: string; periodStart: string; periodEnd: string; total: number; amountPaid: number; amountDue: number };
  card?: { brand: string; last4: string; expMonth: number; expYear: number } | null;
  canPay?: boolean;
  verificationForm?: ReactNode;
  onPay: () => void;
  onClose: () => void;
  onUpdateCard?: () => void;
  onRefresh?: () => void;
}
const button = 'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-paper px-4 py-3 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-muted';
const primary = 'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-dark focus-visible:focus-ring disabled:cursor-not-allowed disabled:bg-line disabled:text-muted';

/** Presentation only: a connected adapter must supply a current, server-authorized invoice and verified payment state. */
export function PaymentRecoveryDialog({open,viewerRole,state='review',invoice,card,canPay=false,verificationForm,onPay,onClose,onUpdateCard,onRefresh}:PaymentRecoveryDialogProps) {
  const id = useId();
  const owner = viewerRole === 'owner';
  const busy = ['processing','authenticating','confirming'].includes(state);
  const paid = state === 'paid' || state === 'already-paid';
  const payable = state === 'review' || state === 'declined';
  const validAmount = !!invoice && Number.isSafeInteger(invoice.amountDue) && invoice.amountDue > 0;
  const money = (value:number) => Number.isSafeInteger(value) && value >= 0 ? new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value/100) : copy.unknownAmount;
  const date = (value:string) => Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat('en-US',{dateStyle:'medium',timeZone:'UTC'}).format(new Date(value)) : copy.unknownAmount;
  const notices = {
    loading: [copy.loadingTitle,copy.loading], review: [copy.reviewTitle,copy.review], processing: [copy.processingTitle,copy.processing], authenticating: [copy.verificationTitle,copy.verification],
    confirming: [copy.confirmingTitle,copy.confirming], pending: [copy.pendingTitle,copy.pending], paid: [copy.successTitle,copy.success],
    'already-paid': [copy.alreadyPaidTitle,copy.alreadyPaid], declined: [copy.declinedTitle,copy.declined], changed: [copy.changedTitle,copy.changed], unavailable: [copy.unavailableTitle,copy.unavailable],
  } as const;
  const [title,message] = notices[state];
  function close() { if (!busy) onClose(); }
  if (viewerRole !== 'owner' && viewerRole !== 'admin') return null;
  return <Dialog open={open} className="z-50" maxWidth="sm" fullWidth scroll="paper" disableEnforceFocus={state==='authenticating'}
    onClose={(_event,reason)=>{if(reason!=='backdropClick')close();}}
    slotProps={{backdrop:{className:'bg-ink/50'},paper:{tabIndex:0,'aria-labelledby':`${id}-title`,'aria-describedby':`${id}-description`,className:'m-4 min-w-0 rounded-2xl bg-paper text-ink focus-visible:focus-ring sm:m-8'}}}>
    <div className="grid min-w-0 gap-6 p-6 sm:p-8" aria-busy={busy}>
      <header><div className="flex flex-wrap items-start justify-between gap-3"><h2 id={`${id}-title`} className="m-0 text-2xl font-semibold text-ink">{paid?title:copy.title}</h2><button type="button" aria-label={copy.close} disabled={busy} onClick={close} className={button}>{copy.closeLabel}</button></div><p id={`${id}-description`} className="mb-0 mt-3 text-sm leading-6 text-muted">{copy.description}</p></header>
      {!owner && <p className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm leading-6 text-muted">{copy.readonly}</p>}
      {owner && (paid ? <FormFeedback kind="success" title={title} message={message}/> : ['declined','changed','unavailable','pending'].includes(state) ? <FormFeedback kind="error" title={title} message={message}/> : busy || state==='loading' ? <section role="status" className="rounded-xl border border-primary bg-canvas p-4"><h3 className="m-0 text-base font-semibold text-ink">{title}</h3><p className="mb-0 mt-2 text-sm leading-6 text-muted">{message}</p></section> : <section className="rounded-xl border border-l-8 border-error bg-error/5 p-4"><h3 className="m-0 text-lg font-semibold text-ink">{title}</h3><p className="mb-0 mt-3 text-sm leading-6 text-ink">{message}</p></section>)}
      {invoice && <section aria-labelledby={`${id}-invoice`} className="min-w-0 rounded-xl border border-line bg-canvas p-4"><h3 id={`${id}-invoice`} className="m-0 text-base font-semibold text-ink">{copy.invoice} · {invoice.number}</h3><p className="mb-0 mt-2 text-sm text-muted wrap-anywhere">{invoice.description}</p><p className="mb-0 mt-3 text-sm leading-6 text-muted">{copy.period}: {date(invoice.periodStart)} – {date(invoice.periodEnd)}</p><dl className="mb-0 mt-5 grid gap-3">{[[copy.total,invoice.total],[copy.paidAmount,invoice.amountPaid],[['changed','unavailable','pending'].includes(state)?copy.lastReviewedDue:copy.due,invoice.amountDue]].map(([label,value],index)=><div key={label} className={`flex flex-wrap justify-between gap-3 ${index===2?'border-t border-line pt-4':''}`}><dt className="text-sm text-muted">{label}</dt><dd className={`m-0 font-semibold text-ink ${index===2?'text-2xl':''}`}>{money(Number(value))}</dd></div>)}</dl></section>}
      {!paid && <section aria-labelledby={`${id}-card`} className="rounded-xl border border-line bg-paper p-4"><div className="flex flex-wrap items-center justify-between gap-4"><div><h3 id={`${id}-card`} className="m-0 text-sm font-semibold text-muted">{copy.card}</h3><p className="mb-0 mt-2 font-semibold text-ink">{card?`${card.brand} · ${card.last4}`:copy.noCard}</p>{card&&<p className="mb-0 mt-1 text-sm text-muted">{copy.expires} {String(card.expMonth).padStart(2,'0')}/{card.expYear}</p>}</div>{owner&&payable&&onUpdateCard&&<button type="button" onClick={onUpdateCard} className={button}>{card?copy.updateCard:copy.addCard}</button>}</div>{owner&&!card&&<p className="mb-0 mt-3 text-sm leading-6 text-muted">{copy.cardRequired}</p>}</section>}
      {owner&&state==='authenticating'&&verificationForm}
      {owner&&payable&&<p className="m-0 text-sm leading-6 text-muted">{validAmount?copy.authorization:copy.unavailable}</p>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" disabled={busy} onClick={close} className={button}>{paid?copy.done:copy.later}</button>{owner&&payable&&validAmount&&<button type="button" disabled={!canPay||!card||!validAmount} onClick={()=>{if(canPay&&card&&validAmount)onPay();}} className={primary}>{copy.pay(money(invoice?.amountDue??NaN))}</button>}{owner&&(['pending','changed','unavailable'].includes(state)||(payable&&!validAmount))&&onRefresh&&<button type="button" onClick={onRefresh} className={primary}>{state==='pending'?copy.refreshStatus:copy.refreshInvoice}</button>}</div>
      <p className="m-0 text-sm leading-6 text-muted">{copy.preserved}</p>
    </div>
  </Dialog>;
}
