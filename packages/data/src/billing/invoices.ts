import type {Knex} from 'knex';
import {billingInvoiceSchema,billingInvoiceHistorySchema} from '@salesmora/contracts';
import {AuthorizationAccessError,withWorkspaceAuthorization} from '../authorization/store';
import {billingReadAllowed} from './access';
import {sandboxBillingEnabled,stripeSandbox,type Stripe} from './stripe';
const id=(value:string|{id:string}|null)=>typeof value==='string'?value:value?.id;
export function invoiceSummary(invoice:Stripe.Invoice){
  return billingInvoiceSchema.parse({id:invoice.id,number:invoice.number,createdAt:new Date(invoice.created*1000).toISOString(),currency:invoice.currency,total:invoice.total,amountPaid:invoice.amount_paid,amountDue:invoice.amount_remaining,status:invoice.status,lines:invoice.lines.data.map(line=>({description:line.description??'',amount:line.amount}))});
}
/** Re-authorize every page; a browser cursor never selects a customer or grants invoice access. */
export async function readWorkspaceInvoices(db:Knex,userId:string,workspaceId:string,enabledPermissions:Parameters<typeof withWorkspaceAuthorization>[2],after?:string){
  return withWorkspaceAuthorization(db,{userId,workspaceId},enabledPermissions,false,async(trx,context)=>{
    if(!sandboxBillingEnabled()||!billingReadAllowed(context))throw new AuthorizationAccessError();
    const row=await trx('workspaceSubscriptions').where({workspaceId}).first('customerId');
    if(!row)throw new AuthorizationAccessError();
    if(!row.customerId){if(after)throw new AuthorizationAccessError();return{invoices:[],hasMore:false,nextCursor:null};}
    const stripe=stripeSandbox(),customer=await stripe.customers.retrieve(row.customerId);
    if(customer.deleted||customer.livemode||customer.metadata.workspaceId!==workspaceId)throw new AuthorizationAccessError();
    if(after){
      const cursor=await stripe.invoices.retrieve(after);
      if(cursor.livemode||id(cursor.customer)!==customer.id||cursor.currency!=='usd')throw new AuthorizationAccessError();
    }
    const page=await stripe.invoices.list({customer:customer.id,limit:12,...(after?{starting_after:after}:{})});
    if(page.data.some(invoice=>invoice.livemode||id(invoice.customer)!==customer.id||invoice.currency!=='usd'))throw new AuthorizationAccessError();
    return billingInvoiceHistorySchema.parse({invoices:page.data.map(invoiceSummary),hasMore:page.has_more,nextCursor:page.has_more?page.data.at(-1)?.id??null:null});
  });
}
