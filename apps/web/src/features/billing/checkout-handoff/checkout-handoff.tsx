'use client';
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { billingCheckoutPreparationSchema, billingCheckoutStatusSchema, type WorkspacePlanId } from '@salesmora/contracts';
import { getWorkspacePlan } from '@salesmora/domain';
import { checkoutHandoffData as copy } from './checkout-handoff.data';
import { BillingQueryBoundary, useBillingMutation } from '../use-billing-request';
const clients = new Map<string, Promise<Stripe | null>>();
function stripeClient(key:string) {
  let client=clients.get(key);
  if(!client){client=loadStripe(key);clients.set(key,client);}
  return client;
}
type Props={workspaceId:string;plan:WorkspacePlanId;hasCheckout?:boolean;publishableKey?:string;paymentPreview?:ReactNode};
export function CheckoutHandoff(props:Props) {
  return <BillingQueryBoundary workspaceId={props.workspaceId} unavailable={copy.error}><CheckoutContent {...props}/></BillingQueryBoundary>;
}
function CheckoutContent({workspaceId,plan,hasCheckout=false,publishableKey,paymentPreview}:Props) {
  const checkout=useBillingMutation('/api/billing/checkout',billingCheckoutPreparationSchema.parse,copy.error);
  const {request:readStatus,isActive}=useBillingMutation('/api/billing/checkout',billingCheckoutStatusSchema.parse,copy.error);
  const running=useRef(false);
  const [pending,setPending]=useState(false);
  const [error,setError]=useState<string>();
  const [notice,setNotice]=useState<string>();
  const [clientSecret,setClientSecret]=useState<string>();
  const [completed,setCompleted]=useState(false);
  const [started,setStarted]=useState(hasCheckout);
  const stripe=useMemo(()=>publishableKey?.startsWith('pk_test_') ? stripeClient(publishableKey).catch(()=>{setError(copy.error);return null;}) : null,[publishableKey]);
  const refresh=useCallback(async()=>{
    if(running.current)return;running.current=true;
    setPending(true);setError(undefined);
    try {
      const body=await readStatus({workspaceId,action:'refresh'},true);
      if(body.billing?.plan && body.billing.plan!=='free'){window.location.assign(`/home?workspace=${workspaceId}`);return;}
      setNotice(copy.verifying);
    }catch{if(isActive())setError(copy.error);}finally{running.current=false;if(isActive())setPending(false);}
  },[workspaceId,readStatus,isActive]);
  const onComplete=useCallback(()=>{setCompleted(true);setClientSecret(undefined);void refresh();},[refresh]);
  async function start() {
    if(running.current)return;running.current=true;setPending(true);setError(undefined);setNotice(undefined);
    try {
      const body=await checkout.request({workspaceId,action:'checkout'});
      setStarted(true);setClientSecret(body.clientSecret);
    }catch{if(checkout.isActive())setError(copy.error);}finally{running.current=false;if(checkout.isActive())setPending(false);}
  }
  const buttonBase='min-h-11 cursor-pointer rounded-xl border px-5 py-3 font-semibold focus-visible:focus-ring disabled:cursor-not-allowed';
  const button=`${buttonBase} border-line bg-paper text-primary disabled:text-muted`;
  return <div className="grid gap-5"><p className="m-0 text-sm font-semibold text-primary">{copy.sandbox}</p><div className="rounded-xl border border-line bg-canvas p-5"><p className="m-0 text-sm text-muted">{copy.selected}</p><p className="mb-0 mt-2 text-xl font-semibold text-ink">{copy.names[plan]}</p><p className="mb-0 mt-2 text-muted">{copy.price(getWorkspacePlan(plan).monthlyPriceCents)}</p></div><p className="m-0 text-sm leading-6 text-muted">{copy.unpaid}</p>{error&&<p role="alert" className="m-0 text-sm text-error">{error}</p>}{notice&&<p role="status" className="m-0 text-sm text-muted">{notice}</p>}
    {paymentPreview ?? (clientSecret && stripe && !completed ? <section aria-label={copy.secure} className="min-w-0"><EmbeddedCheckoutProvider stripe={stripe} options={{clientSecret,onComplete}}><EmbeddedCheckout className="min-w-0"/></EmbeddedCheckoutProvider></section> : !completed ? <>{!stripe&&<p role="status" className="m-0 text-sm text-muted">{copy.missingKey}</p>}<button type="button" disabled={pending||!stripe} onClick={()=>void start()} className={`${buttonBase} seafoam-action enabled:hover:bg-none enabled:hover:bg-seafoam-dark disabled:bg-none disabled:border-line disabled:bg-line disabled:text-muted`}>{pending?copy.loading:error?copy.retry:copy.next}</button></> : null)}
    <p className="m-0 text-xs leading-5 text-muted">{copy.secure}</p>
    {started && <button type="button" disabled={pending} onClick={()=>void refresh()} className={button}>{copy.check}</button>}
  </div>;
}
