import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { PaymentMethodDialog } from '../payment-method-dialog/payment-method-dialog';
import { paymentMethodDialogData as cardCopy } from '../payment-method-dialog/payment-method-dialog.data';
import { PaymentRecoveryDialog, type PaymentRecoveryDialogProps, type PaymentRecoveryState } from './payment-recovery-dialog';
import { paymentRecoveryDialogData as copy } from './payment-recovery-dialog.data';

function Preview(args: PaymentRecoveryDialogProps) {
  const [open,setOpen]=useState(args.open),[state,setState]=useState<PaymentRecoveryState>(args.state??'review');
  const [card,setCard]=useState(args.card);
  const [cardOpen,setCardOpen]=useState(false),[cardSaved,setCardSaved]=useState(false);
  const paid=state==='paid'||state==='already-paid';
  return <><button type="button" onClick={()=>{setState('review');setOpen(true);}} className="min-h-11 cursor-pointer rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white focus-visible:focus-ring">{copy.open}</button><PaymentRecoveryDialog {...args} open={open&&!cardOpen} state={state} card={card} invoice={paid&&args.invoice?{...args.invoice,amountPaid:args.invoice.total,amountDue:0}:args.invoice}
    verificationForm={<div className="rounded-xl border border-line bg-canvas p-5 text-sm leading-6 text-muted">{copy.verificationPreview}</div>}
    onPay={()=>{args.onPay();setState('paid');}} onClose={()=>{args.onClose();setOpen(false);}}
    onRefresh={()=>{args.onRefresh?.();setState('review');}}
    onUpdateCard={()=>{args.onUpdateCard?.();setCardSaved(false);setCardOpen(true);}}/>
    <PaymentMethodDialog open={cardOpen} viewerRole={args.viewerRole} state={cardSaved?'saved':'editing'} card={card} outstandingPayment canSave cardForm={<div className="rounded-xl border border-line bg-paper p-5 text-sm leading-6 text-muted">{cardCopy.previewFields}</div>} onSave={()=>{setCard(copy.fixture.replacement);setCardSaved(true);}} onClose={()=>setCardOpen(false)}/></>;
}
const meta={
  title:'Billing/PaymentRecoveryDialog',component:PaymentRecoveryDialog,render:args=><Preview {...args}/>,parameters:{layout:'fullscreen'},
  args:{open:true,viewerRole:'owner',invoice:copy.fixture.invoice,card:copy.fixture.card,canPay:true,onPay:fn(),onClose:fn(),onRefresh:fn(),onUpdateCard:fn()},
  decorators:[Story=><main className="min-h-screen bg-canvas p-6"><p className="mb-6 mt-0 text-sm text-muted">{copy.preview}</p><Story/></main>],
} satisfies Meta<typeof PaymentRecoveryDialog>;
export default meta;
export const Loading:Story={args:{state:'loading',invoice:undefined,card:null,canPay:false}};
type Story=StoryObj<typeof meta>;
export const Default:Story={play:async({canvasElement,args})=>{
 const c=within(canvasElement.ownerDocument.body);
 await expect(c.getByRole('button',{name:copy.pay('$29.00')})).toBeEnabled();
 await expect(args.onPay).not.toHaveBeenCalled();
}};
export const ConfirmPayment:Story={play:async({canvasElement,args})=>{
 const c=within(canvasElement.ownerDocument.body);
 await expect(args.onPay).not.toHaveBeenCalled();
 await userEvent.click(c.getByRole('button',{name:copy.pay('$29.00')}));
 await expect(args.onPay).toHaveBeenCalledTimes(1);
 await waitFor(()=>expect(c.getByRole('status')).toHaveAccessibleDescription(copy.success));
 await expect(c.queryByRole('button',{name:copy.pay('$29.00')})).not.toBeInTheDocument();
}};
export const Processing:Story={args:{state:'processing'},play:async({canvasElement})=>{
 const c=within(canvasElement.ownerDocument.body);
 await expect(c.getByRole('button',{name:copy.close})).toBeDisabled();
 await userEvent.keyboard('{Escape}');await expect(c.getByRole('dialog')).toBeInTheDocument();
}};
export const BankVerification:Story={args:{state:'authenticating'}};
export const Confirming:Story={args:{state:'confirming'}};
export const StatusUnknown:Story={args:{state:'pending'},play:async({canvasElement,args})=>{
 const c=within(canvasElement.ownerDocument.body);
 await expect(c.queryByRole('button',{name:copy.pay('$29.00')})).not.toBeInTheDocument();
 await expect(c.getByRole('button',{name:copy.refreshStatus})).toBeEnabled();
 await expect(args.onPay).not.toHaveBeenCalled();
}};
export const PaymentReceived:Story={args:{state:'paid'}};
export const AlreadyPaid:Story={args:{state:'already-paid'}};
export const PaymentDeclined:Story={args:{state:'declined'}};
export const BalanceChanged:Story={args:{state:'changed'}};
export const ProviderUnavailable:Story={args:{state:'unavailable'}};
export const NoSavedCard:Story={args:{card:null},play:async({canvasElement,args})=>{
 const c=within(canvasElement.ownerDocument.body);
 await expect(c.getByRole('button',{name:copy.pay('$29.00')})).toBeDisabled();
 await expect(c.getByRole('button',{name:copy.addCard})).toBeEnabled();
 await expect(args.onPay).not.toHaveBeenCalled();
}};
export const AdminReadOnly:Story={args:{viewerRole:'admin'},play:async({canvasElement})=>{
 const c=within(canvasElement.ownerDocument.body);
 await expect(c.getByText(copy.readonly)).toBeVisible();
 await expect(c.queryByRole('button',{name:copy.pay('$29.00')})).not.toBeInTheDocument();
 await expect(c.queryByRole('button',{name:copy.updateCard})).not.toBeInTheDocument();
}};
export const UnverifiedBalance:Story={args:{canPay:false}};
export const OpenAndDismiss:Story={args:{open:false},play:async({canvasElement,args})=>{
 const c=within(canvasElement),body=within(canvasElement.ownerDocument.body),trigger=c.getByRole('button',{name:copy.open});
 await userEvent.click(trigger);await waitFor(()=>expect(body.getByRole('dialog')).toBeVisible());
 await userEvent.click(body.getByRole('button',{name:copy.later}));
 await waitFor(()=>expect(trigger).toHaveFocus());await expect(args.onPay).not.toHaveBeenCalled();
}};

export const UpdateCardThenReview:Story={play:async({canvasElement,args})=>{
 const c=within(canvasElement.ownerDocument.body);
 await userEvent.click(c.getByRole('button',{name:copy.updateCard}));
 await waitFor(()=>expect(c.getByRole('dialog',{name:cardCopy.title})).toBeVisible());
 await userEvent.click(c.getByRole('checkbox'));
 await userEvent.click(c.getByRole('button',{name:cardCopy.save}));
 await waitFor(()=>expect(c.getByRole('status')).toHaveAccessibleDescription(cardCopy.saved));
 await expect(args.onPay).not.toHaveBeenCalled();
 await userEvent.click(c.getByRole('button',{name:cardCopy.done}));
 await waitFor(()=>expect(c.getByRole('dialog',{name:copy.title})).toBeVisible());
 await waitFor(()=>expect(within(c.getByRole('dialog',{name:copy.title})).getByText('Mastercard · 4444')).toBeVisible());
 await expect(c.getByRole('button',{name:copy.pay('$29.00')})).toBeEnabled();
 await expect(args.onPay).not.toHaveBeenCalled();
}};
