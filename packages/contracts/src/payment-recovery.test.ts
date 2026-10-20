import {describe,it,expect} from 'vitest';
import {paymentRecoveryRequestSchema,paymentRecoveryResultSchema} from './payment-recovery';
const workspaceId='00000000-0000-4000-8000-000000000001',quoteId='00000000-0000-4000-8000-000000000002';
describe('renewal recovery authority boundary',()=>{
  it('requires a server quote for payment and status requests',()=>{
    for(const action of ['confirm','status']){
      expect(paymentRecoveryRequestSchema.safeParse({workspaceId,action}).success).toBe(false);
      expect(paymentRecoveryRequestSchema.safeParse({workspaceId,action,quoteId}).success).toBe(true);
    }
  });
  it('rejects browser-selected amounts, provider identities and roles',()=>{
    for(const field of ['amountDue','invoiceId','paymentMethodId','customerId','subscriptionId','actorId','role']){
      expect(paymentRecoveryRequestSchema.safeParse({workspaceId,action:'confirm',quoteId,[field]:'injected'}).success).toBe(false);
    }
  });
  it('does not expose provider objects in its response contract',()=>{
    const value={status:'unavailable',quoteId:null,expiresAt:null,invoice:null,card:null};
    expect(paymentRecoveryResultSchema.safeParse(value).success).toBe(true);
    expect(paymentRecoveryResultSchema.safeParse({...value,paymentIntent:{id:'pi_private'}}).success).toBe(false);
  });
});
