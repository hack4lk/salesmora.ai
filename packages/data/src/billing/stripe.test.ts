import { describe, expect, it } from 'vitest';
import Stripe from 'stripe';
import { stripeSandbox, verifyBillingWebhook } from './stripe';
import { billingCheckoutRequestSchema, registrationSchema } from '@salesmora/contracts';
const env={BILLING_SANDBOX_ENABLED:'true',STRIPE_SECRET_KEY:'sk_test_fixture_not_real',STRIPE_WEBHOOK_SECRET:'whsec_fixture_not_real'};
const stripe=new Stripe(env.STRIPE_SECRET_KEY);
const body=JSON.stringify({id:'evt_fixture',object:'event',created:1,livemode:false,type:'checkout.session.completed',data:{object:{id:'cs_test_fixture'}}});
const sign=(payload:string,timestamp?:number)=>stripe.webhooks.generateTestHeaderString({payload,secret:env.STRIPE_WEBHOOK_SECRET,timestamp});
describe('sandbox payment boundaries',()=>{
  it('requires explicit opt-in and refuses live credentials',()=>{
    expect(()=>stripeSandbox({...env,BILLING_SANDBOX_ENABLED:'false'})).toThrow();
    expect(()=>stripeSandbox({...env,STRIPE_SECRET_KEY:'sk_live_fixture_not_real'})).toThrow();
  });
  it('verifies original bytes and rejects forged, changed or stale signatures',()=>{
    expect(verifyBillingWebhook(body,sign(body),env).id).toBe('evt_fixture');
    expect(()=>verifyBillingWebhook(body,'t=1,v1=forged',env)).toThrow();
    expect(()=>verifyBillingWebhook(body+' ',sign(body),env)).toThrow();
    expect(()=>verifyBillingWebhook(body,sign(body,1),env)).toThrow();
    expect(()=>verifyBillingWebhook(body,sign(body),{...env,STRIPE_WEBHOOK_SECRET:'whsec_wrong'})).toThrow();
  });
  it('rejects correctly signed live-mode and connected-account events',()=>{
    for(const extras of [{livemode:true},{account:'acct_other'}]){
      const payload=JSON.stringify({...JSON.parse(body),...extras});
      expect(()=>verifyBillingWebhook(payload,sign(payload),env)).toThrow('Unexpected Stripe event scope');
    }
  });
  it('accepts only a known plan intent, never caller-selected price or paid claims',()=>{
    const registration={name:'Example Owner',email:'owner@example.com',password:'Fictional-pass-42!',termsAccepted:true};
    expect(registrationSchema.parse({...registration,plan:'premium',registrationPlan:'free',paid:true})).toMatchObject({plan:'premium'});
    expect(registrationSchema.parse({...registration,paid:true})).not.toHaveProperty('paid');
    expect(registrationSchema.safeParse({...registration,plan:'enterprise'}).success).toBe(false);
    expect(billingCheckoutRequestSchema.safeParse({workspaceId:'00000000-0000-4000-8000-000000000000',action:'checkout',priceId:'price_forged'}).success).toBe(false);
  });
});
