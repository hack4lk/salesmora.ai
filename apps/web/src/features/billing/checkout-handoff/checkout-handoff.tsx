'use client';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import type { WorkspacePlanId } from '@salesmora/contracts';
import { getWorkspacePlan } from '@salesmora/domain';
import { checkoutHandoffData as copy } from './checkout-handoff.data';
const clients = new Map<string, Promise<Stripe | null>>();
function stripeClient(key:string) {
  let client=clients.get(key);
  if(!client){client=loadStripe(key);clients.set(key,client);}
  return client;
}
export function CheckoutHandoff({workspaceId,plan,hasCheckout=false,publishableKey,paymentPreview}:{workspaceId:string;plan:WorkspacePlanId;hasCheckout?:boolean;publishableKey?:string;paymentPreview?:ReactNode}) {
  const [pending,setPending]=useState(false);
  const [error,setError]=useState<string>();
  const [notice,setNotice]=useState<string>();
  const [clientSecret,setClientSecret]=useState<string>();
  const [completed,setCompleted]=useState(false);
  const [started,setStarted]=useState(hasCheckout);
  const stripe=useMemo(()=>publishableKey?.startsWith('pk_test_') ? stripeClient(publishableKey).catch(()=>{setError(copy.error);return null;}) : null,[publishableKey]);
  const refresh=useCallback(async()=>{
    setPending(true);setError(undefined);
    try {
      const response=await fetch('/api/billing/checkout',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({workspaceId,action:'refresh'})});
      const body=await response.json();
      if(!response.ok)throw Error();
      if(body.billing?.plan && body.billing.plan!=='free'){window.location.assign(`/home?workspace=${workspaceId}`);return;}
      setNotice(copy.verifying);
    }catch{setError(copy.error);}finally{setPending(false);}
  },[workspaceId]);
  const onComplete=useCallback(()=>{setCompleted(true);setClientSecret(undefined);void refresh();},[refresh]);
  async function start() {
    if(pending)return;setPending(true);setError(undefined);setNotice(undefined);
    try {
      const response=await fetch('/api/billing/checkout',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({workspaceId,action:'checkout'})});
      const body=await response.json();
      if(!response.ok||typeof body.clientSecret!=='string')throw Error();
      setStarted(true);setClientSecret(body.clientSecret);
    }catch{setError(copy.error);}finally{setPending(false);}
  }
  const buttonBase='min-h-11 cursor-pointer rounded-xl border px-5 py-3 font-semibold focus-visible:focus-ring disabled:cursor-not-allowed';
  const button=`${buttonBase} border-line bg-paper text-primary disabled:text-muted`;
  return <div className="grid gap-5"><p className="m-0 text-sm font-semibold text-primary">{copy.sandbox}</p><div className="rounded-xl border border-line bg-canvas p-5"><p className="m-0 text-sm text-muted">{copy.selected}</p><p className="mb-0 mt-2 text-xl font-semibold text-ink">{copy.names[plan]}</p><p className="mb-0 mt-2 text-muted">{copy.price(getWorkspacePlan(plan).monthlyPriceCents)}</p></div><p className="m-0 text-sm leading-6 text-muted">{copy.unpaid}</p>{error&&<p role="alert" className="m-0 text-sm text-error">{error}</p>}{notice&&<p role="status" className="m-0 text-sm text-muted">{notice}</p>}
    {paymentPreview ?? (clientSecret && stripe && !completed ? <section aria-label={copy.secure} className="min-w-0"><EmbeddedCheckoutProvider stripe={stripe} options={{clientSecret,onComplete}}><EmbeddedCheckout className="min-w-0"/></EmbeddedCheckoutProvider></section> : !completed ? <>{!stripe&&<p role="status" className="m-0 text-sm text-muted">{copy.missingKey}</p>}<button type="button" disabled={pending||!stripe} onClick={()=>void start()} className={`${buttonBase} border-primary bg-primary text-white enabled:hover:bg-primary-dark disabled:border-line disabled:bg-line disabled:text-ink`}>{pending?copy.loading:error?copy.retry:copy.next}</button></> : null)}
    <p className="m-0 text-xs leading-5 text-muted">{copy.secure}</p>
    {started && <button type="button" disabled={pending} onClick={()=>void refresh()} className={button}>{copy.check}</button>}
  </div>;
}
