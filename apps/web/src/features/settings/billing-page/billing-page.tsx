'use client';

import { useEffect, useId, useRef, useState, type Ref } from 'react';
import type { WorkspaceRole, WorkspaceBillingSnapshot } from '@salesmora/contracts';
import { getWorkspacePlan } from '@salesmora/domain';
import { billingPageData as copy } from './billing-page.data';

export interface BillingPageProps {
  viewerRole: WorkspaceRole;
  snapshot?: WorkspaceBillingSnapshot;
  onLoadOlderInvoices?: () => void;
  invoiceHistoryState?: 'ready' | 'loading' | 'error';
  onChangePlan?: () => void;
  onCancelSubscription?: () => void;
  onKeepSubscription?: () => void;
  onManagePayment?: () => void;
  onRecoverPayment?: () => void;
  planTriggerRef?: Ref<HTMLButtonElement>;
  workspaceName?: string;
  settingsHref?: string;
  state?: 'ready' | 'loading' | 'error' | 'payment-failed' | 'cancelling' | 'free';
  onAction?: (action: 'plan' | 'cancel' | 'undo' | 'payment' | 'retry' | 'invoice', invoiceId?: string) => void;
}
const button = 'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring';
const panel = 'min-w-0 rounded-2xl border border-line bg-paper p-6 sm:p-8';

/** Snapshot and access come from the server; omitted snapshots are fictional Storybook previews. */
export function BillingPage({ viewerRole, invoiceHistoryState='ready', onLoadOlderInvoices, state = 'ready', onAction, snapshot, onChangePlan, onCancelSubscription, onKeepSubscription, onManagePayment, onRecoverPayment, planTriggerRef, workspaceName, settingsHref = '/settings' }: BillingPageProps) {
  const id = useId();
  const historyStatus=useRef<HTMLParagraphElement>(null),previousHistoryState=useRef(invoiceHistoryState);
  useEffect(()=>{
    if(previousHistoryState.current==='loading'&&invoiceHistoryState==='ready'&&!snapshot?.hasMoreInvoices&&document.activeElement===document.body)historyStatus.current?.focus();
    previousHistoryState.current=invoiceHistoryState;
  },[invoiceHistoryState,snapshot?.hasMoreInvoices]);
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const date = (value:string) => new Intl.DateTimeFormat('en-US',{dateStyle:'long',timeZone:'UTC'}).format(new Date(value));
  const money = (value:number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value/100);
  if (snapshot) state = ['past_due','unpaid'].includes(snapshot.status) ? 'payment-failed' : snapshot.cancelAtPeriodEnd ? 'cancelling' : snapshot.plan === 'free' ? 'free' : 'ready';
  const owner = viewerRole === 'owner';
  if (!owner && viewerRole !== 'admin') return <p role="alert" className="text-ink">{copy.denied}</p>;
  const free = snapshot ? snapshot.plan === 'free' : state === 'free';
  const management = owner && !snapshot;
  const limits = snapshot ? getWorkspacePlan(snapshot.plan).limits : null;
  const meters = snapshot && limits ? [
    {label:copy.meters[0].label,used:snapshot.usage.teammates,limit:limits.teammates},
    {label:copy.meters[1].label,used:snapshot.usage.newLeads,limit:limits.newLeadsPerMonth},
    {label:copy.meters[2].label,used:Number(snapshot.usage.aiTokens),limit:snapshot.usage.monthlyAITokens},
  ].map(m=>({label:m.label,value:`${m.used.toLocaleString('en-US')} of ${m.limit.toLocaleString('en-US')}`,percent:m.limit ? Math.min(100,m.used/m.limit*100) : 100})) : free ? copy.freeMeters : copy.meters;
  const invoiceRows = snapshot ? snapshot.invoices.map(row=>({id:row.id,date:date(row.createdAt),amount:money(row.total),status:copy.invoiceStatuses[row.status ?? 'unknown']})) : (free ? [] : copy.invoiceRows).map(row=>({...row,status:copy.paid}));
  const invoice = snapshot?.invoices.find(row=>row.id===selectedInvoice);
  const notice = snapshot ? state === 'cancelling'
    ? `${copy.cancellationDate} ${snapshot.paidThrough ? date(snapshot.paidThrough) : copy.invoiceStatuses.unknown}. ${copy.preserveData}`
    : `${snapshot.recoveryUntil && new Date(snapshot.recoveryUntil)>new Date() ? `${copy.graceDate} ${date(snapshot.recoveryUntil)}.` : copy.graceEnd} ${copy.preserveData}`
    : state === 'payment-failed' ? copy.failedNote : copy.cancelNote;
  const action = (label: string, name: Parameters<NonNullable<BillingPageProps['onAction']>>[0]) => <button type="button" className={button} onClick={() => onAction?.(name)}>{label}</button>;
  return <div className="grid min-w-0 gap-6">
    <header>
      <a href={settingsHref} className="inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-primary focus-visible:focus-ring">{copy.back}</a>
      <p className="mb-0 mt-4 text-xs font-bold tracking-widest text-muted uppercase">{copy.eyebrow}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4"><h1 className="m-0 text-heading font-semibold text-ink sm:text-heading-lg">{copy.title}</h1><span className="rounded-full border border-line bg-paper px-3 py-2 text-xs font-semibold text-primary">{owner ? copy.owner : copy.admin}</span></div>
      <p className="mb-0 mt-2 font-semibold text-muted">{workspaceName ?? copy.workspace}</p><p className="mb-0 mt-4 text-muted">{copy.description}</p>
    </header>
    {!owner && <p className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm leading-6 text-muted">{copy.adminNote}</p>}
    {snapshot && !snapshot.providerAvailable && <p role="alert" className="rounded-xl border border-error bg-error/5 p-4 text-ink">{copy.providerUnavailable}</p>}
    {snapshot && owner && !onChangePlan && <p className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm leading-6 text-muted">{copy.managementPending}</p>}
    {state === 'loading' ? <p role="status">{copy.loading}</p> : state === 'error' ? <section className={panel}><p role="alert">{copy.error}</p>{action(copy.retry, 'retry')}</section> : <>
      {(state === 'payment-failed' || state === 'cancelling') && <aside aria-labelledby={`${id}-notice`} className="rounded-2xl border border-l-8 border-error bg-error/5 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-error text-white"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6"><path d="M12 8v5m0 3h.01M10.3 3.9 2 18.2A1.2 1.2 0 0 0 3 20h18a1.2 1.2 0 0 0 1-1.8L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg></span>
          <div className="min-w-0"><h2 id={`${id}-notice`} className="m-0 text-2xl font-semibold text-ink">{state === 'payment-failed' ? copy.failed : copy.cancelling}</h2><p className="mb-0 mt-3 text-base leading-relaxed text-ink">{notice}</p>{(management || (owner && state==='payment-failed' && (onRecoverPayment||onManagePayment)) || (state==='cancelling'&&onKeepSubscription)) && <button type="button" onClick={() => state==='cancelling'&&onKeepSubscription ? onKeepSubscription() : state==='payment-failed'&&onRecoverPayment ? onRecoverPayment() : state==='payment-failed'&&onManagePayment ? onManagePayment() : onAction?.(state === 'payment-failed' ? 'payment' : 'undo')} className="mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-error bg-error px-5 py-3 text-sm font-semibold text-white hover:brightness-95 focus-visible:focus-ring">{state === 'payment-failed' ? onRecoverPayment ? copy.recover : copy.fix : copy.undo}</button>}</div>
        </div>
      </aside>}
      <section aria-labelledby={`${id}-plan`} className="rounded-2xl border border-primary bg-canvas p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6"><div><h2 id={`${id}-plan`} className="m-0 text-sm font-semibold text-muted">{copy.plan}</h2><p className="mb-0 mt-3 text-heading font-semibold text-ink">{snapshot ? copy.planNames[snapshot.plan] : free ? copy.free : copy.standard}</p><p className="mb-0 mt-2 text-muted"><strong className="text-2xl text-primary">{snapshot ? money(getWorkspacePlan(snapshot.plan).monthlyPriceCents) : free ? copy.freePrice : copy.standardPrice}</strong> {copy.monthly}</p></div>{owner && (onChangePlan ? <button ref={planTriggerRef} type="button" className={button} disabled={snapshot && !snapshot.providerAvailable} onClick={onChangePlan}>{snapshot?.change && snapshot.change.status!=='scheduled' ? copy.resumeChange : copy.change}</button> : management && action(copy.change, 'plan'))}</div>
        <dl className="mb-0 mt-6 grid gap-5 border-t border-line pt-6 sm:grid-cols-2">{!free && <div><dt className="text-sm text-muted">{snapshot?.cancelAtPeriodEnd ? copy.currentPeriod : copy.renewal}</dt><dd className="ml-0 mt-2 font-semibold text-ink">{snapshot ? snapshot.paidThrough ? date(snapshot.paidThrough) : copy.invoiceStatuses.unknown : copy.nextCharge}</dd></div>}<div><dt className="text-sm text-muted">{copy.reset}</dt><dd className="ml-0 mt-2 font-semibold text-ink">{snapshot ? `${date(snapshot.resetAt)} · 00:00 UTC` : copy.resets}</dd></div></dl>
      </section>
      <section aria-labelledby={`${id}-usage`} className={panel}><h2 id={`${id}-usage`} className="m-0 text-xl font-semibold text-ink">{copy.usage}</h2><p className="text-sm text-muted">{copy.shared}</p><div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{meters.map(meter => <div key={meter.label}><div className="flex flex-wrap justify-between gap-2 text-sm"><span className="font-semibold text-ink">{meter.label}</span><span className="text-muted">{meter.value}</span></div><progress aria-label={meter.label} value={meter.percent} max={100} className="mt-3 block h-2 w-full overflow-hidden rounded-full border-0 bg-line accent-primary [&::-webkit-progress-bar]:bg-line [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary"/></div>)}</div><p className="mb-0 mt-6 text-sm leading-6 text-muted">{copy.resetNote}</p><p className="mb-0 mt-2 text-sm leading-6 text-muted">{snapshot ? copy.livePlanned : copy.planned}</p></section>
      <section aria-labelledby={`${id}-payment`} className={panel}><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 id={`${id}-payment`} className="m-0 text-xl font-semibold text-ink">{copy.payment}</h2><p className="mb-0 mt-4 font-semibold text-ink">{snapshot ? !snapshot.providerAvailable ? copy.providerUnavailable : snapshot.payment ? `${snapshot.payment.brand.toUpperCase()} · ${snapshot.payment.last4}` : copy.noSavedCard : free ? copy.noCard : copy.card}</p>{!free && <><p className="mt-1 text-sm text-muted">{snapshot ? snapshot.payment ? `${snapshot.payment.expMonth}/${snapshot.payment.expYear}` : '' : copy.expires}</p><p className="mb-0 text-sm text-muted">{copy.contact}: {snapshot ? snapshot.billingEmail : copy.email}</p></>}</div>{owner && !free && (onManagePayment ? <button type="button" className={button} onClick={onManagePayment}>{copy.manage}</button> : management && action(copy.manage, 'payment'))}</div>{!free && <p className="mb-0 mt-4 text-sm text-muted">{copy.portal}</p>}</section>
      <section aria-labelledby={`${id}-history`} className={panel}><h2 id={`${id}-history`} className="m-0 text-xl font-semibold text-ink">{copy.history}</h2>{invoiceRows.length === 0 ? <p className="text-muted">{snapshot && !snapshot.providerAvailable ? copy.providerUnavailable : copy.empty}</p> : <ul className="mb-0 mt-4 list-none p-0">{invoiceRows.map(row => <li key={row.id} className="flex flex-wrap items-center justify-between gap-4 border-t border-line py-4"><div><p className="m-0 font-semibold text-ink">{row.date}</p><p className="mb-0 mt-1 text-sm text-muted">{row.amount} · {row.status}</p></div><button type="button" aria-label={`${copy.view} · ${row.date}`} className={button} onClick={() => {setSelectedInvoice(row.id);onAction?.('invoice', row.id);}}>{copy.view}</button></li>)}</ul>}</section>
      {snapshot && snapshot.providerAvailable && invoiceRows.length>0 && <div className="grid gap-3" aria-busy={invoiceHistoryState==='loading'}>
        <p ref={historyStatus} tabIndex={-1} role="status" className="m-0 rounded-lg text-sm text-muted focus-visible:focus-ring">{copy.invoiceCount(invoiceRows.length)}{!snapshot.hasMoreInvoices?` · ${copy.allInvoices}`:''}</p>
        {invoiceHistoryState==='error'&&<p role="alert" className="m-0 text-sm text-error">{copy.historyError}</p>}
        {snapshot.hasMoreInvoices&&onLoadOlderInvoices&&<div><button type="button" disabled={invoiceHistoryState==='loading'} className={`${button} disabled:cursor-wait disabled:opacity-60`} onClick={onLoadOlderInvoices}>{invoiceHistoryState==='loading'?copy.loadingInvoices:invoiceHistoryState==='error'?copy.retryInvoices:copy.loadOlder}</button></div>}
      </div>}
      {invoice && <section aria-labelledby={`${id}-invoice`} className={panel}><div className="flex flex-wrap items-center justify-between gap-4"><h2 id={`${id}-invoice`} className="m-0 text-xl font-semibold text-ink">{copy.invoice} · {invoice.number ?? date(invoice.createdAt)}</h2><button type="button" className={button} onClick={()=>setSelectedInvoice(null)}>{copy.closeInvoice}</button></div><ul className="list-none p-0">{invoice.lines.map((line,index)=><li key={index} className="flex justify-between gap-4 border-b border-line py-3"><span className="min-w-0 wrap-anywhere">{line.description}</span><span>{money(line.amount)}</span></li>)}</ul><dl className="grid gap-3">{[[copy.invoiceTotal,invoice.total],[copy.invoicePaid,invoice.amountPaid],[copy.invoiceDue,invoice.amountDue]].map(([label,value])=><div key={label} className="flex justify-between gap-4"><dt>{label}</dt><dd className="m-0 font-semibold">{money(Number(value))}</dd></div>)}</dl></section>}
      {snapshot?.transitionUntil && new Date(snapshot.transitionUntil)>new Date() && <p className="m-0 text-sm text-muted">{copy.transition} {date(snapshot.transitionUntil)}.</p>}
      {owner && !free && state !== 'cancelling' && (management || onCancelSubscription) && <div>{onCancelSubscription ? <button type="button" className={button} disabled={snapshot ? !snapshot.providerAvailable||snapshot.status!=='active'||!!snapshot.change : false} onClick={onCancelSubscription}>{copy.cancel}</button> : action(copy.cancel, 'cancel')}{snapshot && (snapshot.status!=='active'||snapshot.change) && <p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.cancelBlocked}</p>}</div>}
      <p className="m-0 text-sm leading-6 text-muted">{copy.retention}</p>
    </>}
  </div>;
}
