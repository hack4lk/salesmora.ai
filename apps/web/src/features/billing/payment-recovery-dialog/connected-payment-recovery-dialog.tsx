'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {loadStripe} from '@stripe/stripe-js';
import {paymentRecoveryResultSchema,type PaymentRecoveryResult,type WorkspaceBillingSnapshot} from '@salesmora/contracts';
import {ConnectedPaymentMethodDialog} from '../payment-method-dialog/connected-payment-method-dialog';
import {PaymentRecoveryDialog,type PaymentRecoveryState} from './payment-recovery-dialog';
import {paymentRecoveryDialogData as copy} from './payment-recovery-dialog.data';

export function ConnectedPaymentRecoveryDialog({workspaceId,snapshot,publishableKey,onClose,onUpdated}:{workspaceId:string;snapshot:WorkspaceBillingSnapshot;publishableKey?:string;onClose:()=>void;onUpdated:()=>Promise<void>}){
  const[value,setValue]=useState<PaymentRecoveryResult>();
  const[state,setState]=useState<PaymentRecoveryState>('loading');
  const[cardOpen,setCardOpen]=useState(false);
  const mounted=useRef(true),running=useRef(false),updated=useRef(onUpdated);
  useEffect(()=>{updated.current=onUpdated;},[onUpdated]);
  const stripe=useMemo(()=>publishableKey?.startsWith('pk_test_')?loadStripe(publishableKey).catch(()=>null):null,[publishableKey]);
  async function request(action:'preview'|'confirm'|'status',quoteId?:string){
    const response=await fetch('/api/billing/recovery',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(action==='preview'?{workspaceId,action}:{workspaceId,action,quoteId})});
    if(!response.ok)throw Error('Recovery unavailable');
    return paymentRecoveryResultSchema.parse(await response.json());
  }
  async function accept(next:PaymentRecoveryResult){
    if(!mounted.current)return;
    setValue(next);
    if(next.status==='authenticating'&&next.clientSecret){
      setState('authenticating');
      const sdk=stripe?await stripe:null;
      if(!mounted.current)return;
      if(!sdk){setState('pending');return;}
      try{await sdk.handleNextAction({clientSecret:next.clientSecret});}catch{/* Status is authoritative even when a bank challenge is dismissed. */}
      if(!mounted.current)return;
      next=await request('status',next.quoteId??undefined);
      if(!mounted.current)return;
      setValue(next);
      if(next.status==='authenticating'){setState('pending');return;}
    }
    if(['paid','already-paid'].includes(next.status)){
      setState('confirming');await updated.current();
      if(!mounted.current)return;
    }
    setState(next.status);
  }
  async function run(action:'preview'|'confirm'|'status'){
    if(running.current)return;
    running.current=true;
    setState(action==='confirm'?'processing':action==='status'?'confirming':'loading');
    try{await accept(await request(action,value?.quoteId??undefined));}
    catch{if(mounted.current)setState(action==='confirm'||action==='status'?'pending':'unavailable');}
    finally{running.current=false;}
  }
  useEffect(()=>{
    let active=true;mounted.current=true;
    void request('preview').then(next=>{if(active)return accept(next);}).catch(()=>{if(active)setState('unavailable');});
    return()=>{active=false;mounted.current=false;};
    // Request callbacks use only this workspace and mutable refs for the latest refresh callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[workspaceId]);
  return <>
    <PaymentRecoveryDialog open={!cardOpen} viewerRole="owner" state={state} invoice={value?.invoice??undefined} card={value?value.card:snapshot.payment} canPay={!!stripe&&!!value?.quoteId&&['review','declined'].includes(state)}
      onPay={()=>void run('confirm')} onClose={onClose} onRefresh={()=>void run(state==='pending'&&value?.quoteId?'status':'preview')}
      onUpdateCard={()=>setCardOpen(true)} verificationForm={<p role="status" className="m-0 text-sm leading-6 text-muted">{copy.verification}</p>}/>
    {cardOpen&&<ConnectedPaymentMethodDialog workspaceId={workspaceId} snapshot={snapshot} publishableKey={publishableKey} onUpdated={()=>updated.current()} onClose={()=>{setCardOpen(false);void run('preview');}}/>}
  </>;
}
