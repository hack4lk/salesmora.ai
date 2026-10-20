import {expect,it} from 'vitest';
import {billingInvoiceHistoryRequestSchema,billingInvoiceHistorySchema} from './billing';
const workspace='00000000-0000-4000-8000-000000000001';
it('invoice paging cannot select customer identity, page size or provider authority',()=>{
 expect(billingInvoiceHistoryRequestSchema.safeParse({workspace,after:'in_example'}).success).toBe(true);
 for(const field of ['customer','subscription','limit','role'])expect(billingInvoiceHistoryRequestSchema.safeParse({workspace,[field]:'injected'}).success).toBe(false);
 expect(billingInvoiceHistoryRequestSchema.safeParse({workspace,after:'cus_example'}).success).toBe(false);
});
it('an empty or final invoice page cannot claim another cursor',()=>{
 expect(billingInvoiceHistorySchema.safeParse({invoices:[],hasMore:false,nextCursor:null}).success).toBe(true);
 expect(billingInvoiceHistorySchema.safeParse({invoices:[],hasMore:true,nextCursor:'in_example'}).success).toBe(false);
});
