'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EmbeddedCheckout, EmbeddedCheckoutProvider, Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { planChangeQuoteSchema, planChangeResultSchema, type PlanChangeQuote, type PlanChangeResult, type WorkspaceBillingSnapshot, type WorkspacePlanId } from '@salesmora/contracts';
import { PlanChange } from './plan-change';
import { planChangeData as copy } from './plan-change.data';
function CardPayment({onComplete,onBusyChange}:{onComplete:()=>void;onBusyChange:(busy:boolean)=>void}){
 const stripe=useStripe(),elements=useElements();const[pending,setPending]=useState(false),[error,setError]=useState(false);
 useEffect(()=>{onBusyChange(pending);},[pending,onBusyChange]);
 async function pay(){if(!stripe||!elements||pending)return;setPending(true);setError(false);try{const result=await stripe.confirmPayment({elements,confirmParams:{return_url:window.location.href},redirect:'if_required'});if(result.error)setError(true);else onComplete();}catch{setError(true);}finally{setPending(false);}}
 return <div className="grid gap-4"><PaymentElement/>{error&&<p role="alert" className="text-error">{copy.error}</p>}<button type="button" disabled={!stripe||!elements||pending} onClick={()=>void pay()} className="min-h-11 cursor-pointer rounded-xl bg-primary px-4 py-3 font-semibold text-white disabled:bg-line disabled:text-ink focus-visible:focus-ring">{pending?copy.busy:copy.pay}</button></div>;
}
export function ConnectedPlanChange({workspaceId,snapshot,publishableKey,onClose,onUpdated,mode='plan',onBusyChange,onPaymentChange}:{workspaceId:string;snapshot:WorkspaceBillingSnapshot;publishableKey?:string;onClose:()=>void;onUpdated:()=>Promise<void>;mode?:'plan'|'cancel';onBusyChange?:(busy:boolean)=>void;onPaymentChange?:(active:boolean)=>void}){
 const[quote,setQuote]=useState<PlanChangeQuote|undefined>(snapshot.change??undefined);
 const[result,setResult]=useState<PlanChangeResult|undefined>(snapshot.change?{status:snapshot.change.status==='scheduled'?'scheduled':'payment'}:undefined);
 const[pending,setPending]=useState(false),[error,setError]=useState<string>();
 const [paying,setPaying]=useState(false);
 useEffect(()=>{onBusyChange?.(pending||paying);},[pending,paying,onBusyChange]);
 useEffect(()=>{onPaymentChange?.(result?.status==='payment');},[result?.status,onPaymentChange]);
 const stripe=useMemo(()=>publishableKey?.startsWith('pk_test_')?loadStripe(publishableKey).catch(()=>null):null,[publishableKey]);
 async function request(action:'preview'|'confirm'|'refresh'|'undo',plan?:WorkspacePlanId){
  if(pending)return;setPending(true);setError(undefined);
  try{
   const response=await fetch('/api/billing/plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(action==='preview'?{workspaceId,action,plan}:{workspaceId,action,quoteId:quote?.id})});
   if(!response.ok)throw Error();const body=await response.json();
   if(action==='preview')setQuote(planChangeQuoteSchema.parse(body));else{const next=planChangeResultSchema.parse(body);setResult(next);await onUpdated();}
  }catch{setError(copy.error);}finally{setPending(false);}
 }
 const cancelRef=useRef(mode==='cancel'&&!snapshot.change);
 const requestRef=useRef(request);
 useEffect(()=>{requestRef.current=request;});
 useEffect(()=>{if(cancelRef.current){cancelRef.current=false;void requestRef.current('preview','free');}},[]);
 const resumeRef=useRef(Boolean(snapshot.change&&snapshot.change.status!=='scheduled'));
 const refreshRef=useRef<()=>void>(()=>{});
 useEffect(()=>{refreshRef.current=()=>void request('refresh');});
 const onComplete=useCallback(()=>refreshRef.current(),[]);
 useEffect(()=>{if(resumeRef.current){resumeRef.current=false;onComplete();}},[onComplete]);
 const paymentContent=result?.status==='payment'&&result.clientSecret?(stripe?(result.paymentUI==='checkout'?<EmbeddedCheckoutProvider key={result.clientSecret} stripe={stripe} options={{clientSecret:result.clientSecret,onComplete}}><EmbeddedCheckout/></EmbeddedCheckoutProvider>:<Elements stripe={stripe} options={{clientSecret:result.clientSecret}}><CardPayment onComplete={onComplete} onBusyChange={setPaying}/></Elements>):<p role="alert">{copy.missingKey}</p>):undefined;
 return <PlanChange mode={mode} onUndo={()=>void request('undo')} currentPlan={snapshot.plan} quote={quote} result={result} pending={pending||paying} error={error} paymentContent={paymentContent} onPreview={plan=>void request('preview',plan)} onConfirm={()=>void request('confirm')} onRefresh={()=>void request('refresh')} onBack={()=>{setQuote(undefined);setResult(undefined);setError(undefined);}} onClose={onClose}/>;
}
