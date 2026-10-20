import { useState } from 'react';
import type { PlanChangeQuote, PlanChangeResult } from '@salesmora/contracts';
import { PaymentMethodDialog, type PaymentMethodState } from '../../billing/payment-method-dialog/payment-method-dialog';
import { paymentMethodDialogData as paymentCopy } from '../../billing/payment-method-dialog/payment-method-dialog.data';
import { PlanChange } from '../../billing/plan-change/plan-change';
import { PlanChangeDialog } from '../../billing/plan-change-dialog/plan-change-dialog';
import type { BillingPageProps } from './billing-page';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within, waitFor } from 'storybook/test';
import { BillingPage } from './billing-page';
import { billingHistoryPreviewInvoices, billingPageData as copy } from './billing-page.data';
function BillingPreview(args:BillingPageProps) {
  const [mode,setMode]=useState<'plan'|'cancel'|'payment'|null>(null);
  const [paymentState,setPaymentState]=useState<PaymentMethodState>('editing');
  const [quote,setQuote]=useState<PlanChangeQuote>();
  const [result,setResult]=useState<PlanChangeResult>();
  const currentPlan=args.snapshot?.plan??(args.state==='free'?'free':'standard');
  function preview(plan:PlanChangeQuote['plan']) {
    setQuote({id:copy.previewQuoteId,plan,kind:plan==='free'?'free':plan==='premium'?'upgrade':'downgrade',amountDue:plan==='premium'?1500:0,currency:'usd',effectiveAt:copy.previewEffectiveAt,expiresAt:copy.previewExpiresAt});setResult(undefined);
  }
  function open(next:'plan'|'cancel') {setQuote(undefined);setResult(undefined);setMode(next);if(next==='cancel')preview('free');args.onAction?.(next==='cancel'?'cancel':'plan');}
  return <><BillingPage {...args} onManagePayment={args.viewerRole==='owner'?()=>{setPaymentState('editing');setMode('payment');args.onAction?.('payment');}:undefined} onChangePlan={args.viewerRole==='owner'?()=>open('plan'):undefined} onCancelSubscription={args.viewerRole==='owner'?()=>open('cancel'):undefined}/><PaymentMethodDialog open={mode==='payment'} viewerRole={args.viewerRole} state={paymentState} card={paymentState==='editing'?paymentCopy.fixture:paymentCopy.replacement} recovery={args.state==='payment-failed'?paymentCopy.recovery:undefined} canSave cardForm={<div className="rounded-xl border border-line p-5 text-sm text-muted">{paymentCopy.previewFields}</div>} onClose={()=>setMode(null)} onSave={()=>setPaymentState('saved')} onPay={()=>setPaymentState('recovered')} onChangeCard={()=>setPaymentState('editing')}/><PlanChangeDialog open={!!mode&&mode!=='payment'} mode={mode==='cancel'?'cancel':'plan'} onClose={()=>setMode(null)}>{mode&&mode!=='payment'&&<PlanChange mode={mode} currentPlan={currentPlan} quote={quote} result={result} onPreview={preview} onClose={()=>setMode(null)} onConfirm={()=>setResult({status:quote?.kind==='upgrade'?'complete':'scheduled'})} onBack={()=>setQuote(undefined)} onRefresh={()=>{}} onUndo={()=>setResult({status:'complete'})}/>}</PlanChangeDialog></>;
}
const meta = {
  title: 'Settings/BillingPage', component: BillingPage, render:args=><BillingPreview {...args}/>, parameters: { layout: 'fullscreen' },
  args: { viewerRole: 'owner', state: 'ready', onAction: fn() },
  decorators: [Story => <main className="mx-auto min-h-screen w-full max-w-6xl p-4 sm:p-8"><p className="mb-6 mt-0 text-sm leading-6 text-muted">{copy.preview}</p><Story/></main>],
} satisfies Meta<typeof BillingPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('heading', { name: copy.title, level: 1 })).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: copy.change }));
  await expect(args.onAction).toHaveBeenCalledWith('plan');
  const dialog=within(canvasElement.ownerDocument.body).getByRole('dialog',{name:'Change workspace plan'});
  await expect(dialog).toBeVisible();await userEvent.click(within(dialog).getByRole('button',{name:'Close plan selection'}));
  await expect(c.getByRole('button',{name:copy.change})).toHaveFocus();
  await userEvent.click(c.getByRole('button', { name: `${copy.view} · ${copy.invoiceRows[0].date}` }));
  await expect(args.onAction).toHaveBeenCalledWith('invoice', 'oct');
} };
export const AdminReadOnly: Story = { args: { viewerRole: 'admin' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByText(copy.adminNote)).toBeVisible();
  for (const label of [copy.change, copy.cancel, copy.manage]) await expect(c.queryByRole('button', { name: label })).not.toBeInTheDocument();
  await expect(c.getByRole('heading', { name: copy.history })).toBeVisible();
} };
export const Free: Story = { args: { state: 'free' } };
export const PaymentFailed: Story = { args: { state: 'payment-failed' } };
export const CancellationScheduled: Story = { args: { state: 'cancelling' } };
export const Loading: Story = { args: { state: 'loading' } };
export const LoadError: Story = { args: { state: 'error' } };
export const FieldDenied: Story = { args: { viewerRole: 'field' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.denied);
  await expect(c.queryByRole('heading', { name: copy.history })).not.toBeInTheDocument();
} };

const liveSnapshot = {
  plan:'premium',status:'active',cancelAtPeriodEnd:false,paidThrough:'2026-11-13T00:00:00.000Z',recoveryUntil:null,transitionUntil:null,resetAt:'2026-11-01T00:00:00.000Z',
  usage:{teammates:7,newLeads:1320,aiTokens:'2500000',monthlyAITokens:20000000},
  payment:{brand:'visa',last4:'4242',expMonth:8,expYear:2028},billingEmail:'billing@example.com',providerAvailable:true,
  invoices:[{id:'in_fixture',number:'SM-001',createdAt:'2026-10-13T00:00:00.000Z',currency:'usd',total:4900,amountPaid:4900,amountDue:0,status:'paid',lines:[{description:'Premium monthly subscription',amount:4900}]}],hasMoreInvoices:false,
} as const;
export const ConnectedPreview: Story = {args:{snapshot:{...liveSnapshot,invoices:liveSnapshot.invoices.map(row=>({...row,lines:[...row.lines]}))},workspaceName:copy.workspace},play:async({canvasElement})=>{
  const c=within(canvasElement);
  await expect(c.getByText('Premium',{exact:true})).toBeVisible();
  await expect(c.getByRole('button',{name:copy.change})).toBeVisible();
  await expect(c.getByRole('button',{name:copy.cancel})).toBeEnabled();
  await userEvent.click(c.getByRole('button',{name:`${copy.view} · ${copy.invoiceRows[0].date}`}));
  await expect(c.getByRole('heading',{name:'Invoice · SM-001'})).toBeVisible();
  await expect(c.getByText('Premium monthly subscription')).toBeVisible();
  await userEvent.click(c.getByRole('button',{name:copy.closeInvoice}));
  await expect(c.queryByRole('heading',{name:'Invoice · SM-001'})).not.toBeInTheDocument();
}};
export const ProviderUnavailable: Story = {args:{snapshot:{...liveSnapshot,payment:null,billingEmail:null,providerAvailable:false,invoices:[]}}};

export const CancelSubscription: Story = {play:async({canvasElement,args})=>{
 const c=within(canvasElement);const trigger=c.getByRole('button',{name:copy.cancel});await userEvent.click(trigger);
 const dialog=within(canvasElement.ownerDocument.body).getByRole('dialog',{name:copy.cancel});
 await expect(dialog).toBeVisible();await expect(within(dialog).getByText('November 13, 2026')).toBeVisible();
 await expect(args.onAction).toHaveBeenCalledWith('cancel');await userEvent.click(within(dialog).getByRole('button',{name:'Keep subscription'}));await expect(trigger).toHaveFocus();
}};

export const ManagePayment: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  const trigger = c.getByRole('button', { name: copy.manage });
  await userEvent.click(trigger);
  const d = within(canvasElement.ownerDocument.body).getByRole('dialog', { name: paymentCopy.title });
  await waitFor(() => expect(d).toBeVisible());
  await expect(args.onAction).toHaveBeenCalledWith('payment');
  await userEvent.click(within(d).getByRole('button', { name: paymentCopy.cancel }));
  await waitFor(() => expect(trigger).toHaveFocus());
} };

const historySnapshot={...liveSnapshot,invoices:billingHistoryPreviewInvoices.slice(0,12),hasMoreInvoices:true};
function InvoiceHistoryPreview(args:BillingPageProps){
  const [visible,setVisible]=useState(12);
  return <BillingPreview {...args} snapshot={{...historySnapshot,invoices:billingHistoryPreviewInvoices.slice(0,visible),hasMoreInvoices:visible<billingHistoryPreviewInvoices.length}}
    onLoadOlderInvoices={()=>{args.onLoadOlderInvoices?.();setVisible(count=>Math.min(count+12,billingHistoryPreviewInvoices.length));}}/>;
}
export const OlderInvoices: Story={render:args=><InvoiceHistoryPreview {...args}/>,args:{snapshot:historySnapshot,onLoadOlderInvoices:fn()},play:async({canvasElement})=>{
 const c=within(canvasElement);
 await expect(c.getAllByRole('button',{name:/^View invoice ·/})).toHaveLength(12);
 await expect(c.getByRole('button',{name:copy.loadOlder})).toBeEnabled();
}};
export const LoadAllOlderInvoices:Story={render:args=><InvoiceHistoryPreview {...args}/>,args:{snapshot:historySnapshot,onLoadOlderInvoices:fn()},play:async({canvasElement,args})=>{
 const c=within(canvasElement);
 await userEvent.click(c.getByRole('button',{name:copy.loadOlder}));
 await expect(c.getAllByRole('button',{name:/^View invoice ·/})).toHaveLength(24);
 await userEvent.click(c.getByRole('button',{name:copy.loadOlder}));
 await expect(c.getAllByRole('button',{name:/^View invoice ·/})).toHaveLength(26);
 await expect(c.getByRole('status')).toHaveTextContent(copy.allInvoices);
 await expect(c.queryByRole('button',{name:copy.loadOlder})).not.toBeInTheDocument();
 await expect(args.onLoadOlderInvoices).toHaveBeenCalledTimes(2);
}};
export const OlderInvoicesLoading:Story={args:{snapshot:historySnapshot,invoiceHistoryState:'loading',onLoadOlderInvoices:fn()},play:async({canvasElement,args})=>{
 const c=within(canvasElement);await expect(c.getByRole('button',{name:copy.loadingInvoices})).toBeDisabled();
 await expect(args.onLoadOlderInvoices).not.toHaveBeenCalled();
}};
export const OlderInvoicesError:Story={args:{snapshot:historySnapshot,invoiceHistoryState:'error',onLoadOlderInvoices:fn()},play:async({canvasElement,args})=>{
 const c=within(canvasElement);await expect(c.getByRole('alert')).toHaveTextContent(copy.historyError);
 await userEvent.click(c.getByRole('button',{name:copy.retryInvoices}));await expect(args.onLoadOlderInvoices).toHaveBeenCalledTimes(1);
}};
export const CompleteInvoiceHistory:Story={args:{snapshot:{...historySnapshot,invoices:billingHistoryPreviewInvoices,hasMoreInvoices:false}},play:async({canvasElement})=>{
 const c=within(canvasElement);await expect(c.getByRole('status')).toHaveTextContent(copy.allInvoices);
 await expect(c.queryByRole('button',{name:copy.loadOlder})).not.toBeInTheDocument();
}};
export const AdminInvoiceHistory:Story={render:args=><InvoiceHistoryPreview {...args}/>,args:{viewerRole:'admin',snapshot:historySnapshot,onLoadOlderInvoices:fn()},play:async({canvasElement,args})=>{
 const c=within(canvasElement);await userEvent.click(c.getByRole('button',{name:copy.loadOlder}));await expect(args.onLoadOlderInvoices).toHaveBeenCalledTimes(1);
 await expect(c.queryByRole('button',{name:copy.manage})).not.toBeInTheDocument();
}};
