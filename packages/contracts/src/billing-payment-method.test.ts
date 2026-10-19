import { describe, expect, it } from 'vitest';
import { billingPaymentMethodRequestSchema, billingPaymentMethodPreparationSchema } from './billing-payment-method';
const workspaceId='00000000-0000-4000-8000-000000000001',attemptId='00000000-0000-4000-8000-000000000002';
describe('card update contract',()=>{
  it('requires explicit consent for saving',()=>{
    expect(billingPaymentMethodRequestSchema.safeParse({workspaceId,attemptId,action:'save',consent:true}).success).toBe(true);
    expect(billingPaymentMethodRequestSchema.safeParse({workspaceId,attemptId,action:'save',consent:false}).success).toBe(false);
  });
  it('rejects caller-selected provider IDs and authority',()=>{
    for(const field of ['customerId','paymentMethodId','setupIntentId','role','userId'])expect(billingPaymentMethodRequestSchema.safeParse({workspaceId,action:'prepare',[field]:'injected'}).success).toBe(false);
  });
  it('validates workspace and attempt identity',()=>{
    expect(billingPaymentMethodRequestSchema.safeParse({workspaceId:'another',action:'prepare'}).success).toBe(false);
    expect(billingPaymentMethodRequestSchema.safeParse({workspaceId,attemptId:'another',action:'save',consent:true}).success).toBe(false);
  });
  it('keeps the preparation DTO limited to the Owner client secret and safe card summary',()=>{
    const payload={attemptId,clientSecret:'fictional-secret',confirmed:false,card:null};
    expect(billingPaymentMethodPreparationSchema.safeParse(payload).success).toBe(true);
    expect(billingPaymentMethodPreparationSchema.safeParse({...payload,customerId:'cus_private'}).success).toBe(false);
  });
});
