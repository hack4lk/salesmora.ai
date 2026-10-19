'use client';
import { useEffect, useMemo, useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { billingPaymentMethodPreparationSchema, type WorkspaceBillingSnapshot } from '@salesmora/contracts';
import { PaymentMethodDialog, type PaymentMethodState } from './payment-method-dialog';
import { paymentMethodDialogData as copy } from './payment-method-dialog.data';

type Preparation = ReturnType<typeof billingPaymentMethodPreparationSchema.parse>;
async function request(body: unknown) {
  const response = await fetch('/api/billing/payment-method', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!response.ok) throw Error('Card update unavailable');
  return response.json();
}
function CardForm({ workspaceId, preparation, snapshot, onClose, onUpdated }: { workspaceId: string; preparation: Preparation; snapshot: WorkspaceBillingSnapshot; onClose: () => void; onUpdated: () => Promise<void> }) {
  const stripe = useStripe(), elements = useElements();
  const [state, setState] = useState<PaymentMethodState>('editing');
  const [complete, setComplete] = useState(preparation.confirmed);
  async function save() {
    if (!stripe || !elements || ['saving','authenticating'].includes(state)) return;
    setState('saving');
    try {
      // A succeeded SetupIntent can be resumed after a lost response without reconfirming the card.
      const existing = await stripe.retrieveSetupIntent(preparation.clientSecret);
      if (existing.error) throw Error('Verification unavailable');
      if (existing.setupIntent?.status !== 'succeeded') {
        setState('authenticating');
        const result = await stripe.confirmSetup({ elements, confirmParams: { return_url: window.location.href }, redirect: 'if_required' });
        if (result.error || result.setupIntent?.status !== 'succeeded') throw Error('Card verification incomplete');
      }
      const result = await request({ workspaceId, action: 'save', attemptId: preparation.attemptId, consent: true });
      if (result?.saved !== true) throw Error('Card update unverified');
      await onUpdated();
      setState('saved');
    } catch { setState('error'); }
  }
  return <PaymentMethodDialog open viewerRole="owner" state={state} stripeActive={state==='authenticating'} outstandingPayment={snapshot.status==='past_due'} card={snapshot.payment} canSave={!!stripe && !!elements && complete} onClose={onClose} onSave={()=>void save()}
    cardForm={preparation.confirmed ? <div className="rounded-xl border border-line bg-canvas p-4 text-sm leading-6 text-ink"><p className="mt-0 font-semibold">{copy.confirmedCard}{preparation.card ? ` · ${preparation.card.brand} · ${preparation.card.last4}` : ''}</p><p className="mb-0">{copy.confirmed}</p></div> : <PaymentElement options={{layout:'tabs',wallets:{applePay:'never',googlePay:'never',link:'never'}}} onChange={event=>setComplete(event.complete)} onLoadError={()=>setState('error')}/>}
    verificationForm={<p role="status" className="text-sm leading-6 text-muted">{copy.verification}</p>}/>;
}
/** Owner-scoped SetupIntent; the server verifies the card and updates both renewal defaults. */
export function ConnectedPaymentMethodDialog({ workspaceId, snapshot, publishableKey, onClose, onUpdated }: { workspaceId: string; snapshot: WorkspaceBillingSnapshot; publishableKey?: string; onClose: () => void; onUpdated: () => Promise<void> }) {
  const [preparation, setPreparation] = useState<Preparation>();
  const [error, setError] = useState(false);
  const stripe = useMemo(()=>publishableKey?.startsWith('pk_test_') ? loadStripe(publishableKey).catch(()=>null) : null,[publishableKey]);
  useEffect(()=>{
    let active=true;
    if (stripe) void stripe.then(value=>{if(active&&!value)setError(true);});
    if (stripe) void request({workspaceId,action:'prepare'}).then(body=>{if(active)setPreparation(billingPaymentMethodPreparationSchema.parse(body));}).catch(()=>{if(active)setError(true);});
    return ()=>{active=false;};
  },[workspaceId,stripe]);
  if (!stripe || !preparation || error) return <PaymentMethodDialog open viewerRole="owner" card={snapshot.payment} onClose={onClose} onSave={()=>{}} cardForm={<p role={error||!stripe?'alert':'status'} className="m-0 text-sm leading-6 text-muted">{error||!stripe?copy.unavailable:copy.loading}</p>}/>;
  return <Elements stripe={stripe} options={{clientSecret:preparation.clientSecret}}><CardForm workspaceId={workspaceId} preparation={preparation} snapshot={snapshot} onClose={onClose} onUpdated={onUpdated}/></Elements>;
}
