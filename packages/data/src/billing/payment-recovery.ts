import {randomUUID} from 'node:crypto';
import type {Knex} from 'knex';
import {paymentRecoveryResultSchema,type PaymentRecoveryResult} from '@salesmora/contracts';
import {lockWorkspaceBilling,ownerBilling} from './checkout';
import {stripeSandbox,stripePlanPrice,type Stripe} from './stripe';
import {reconcileWorkspaceSubscription} from './events';
const id=(value:string|{id:string}|null|undefined)=>typeof value==='string'?value:value?.id??null;
const active=['applying','action','pending'];
interface RecoveryQuote { id:string;expiresAt:Date|string;attemptedAt?:Date|string|null;amountDue:number;paymentMethodId:string|null; }
const empty:PaymentRecoveryResult={status:'unavailable',quoteId:null,expiresAt:null,invoice:null,card:null};

async function mapping(trx:Knex.Transaction,stripe:Stripe,userId:string,workspaceId:string,invoiceId?:string){
  await ownerBilling(trx,userId,workspaceId);
  const row=await trx('workspaceSubscriptions').where({workspaceId}).forUpdate().first();
  if(!row?.customerId||!row.subscriptionId)throw Error('Missing subscription');
  const customer=await stripe.customers.retrieve(row.customerId);
  const sub=await stripe.subscriptions.retrieve(row.subscriptionId);
  if(customer.deleted||customer.livemode||customer.metadata.workspaceId!==workspaceId||sub.livemode||id(sub.customer)!==customer.id||sub.metadata.workspaceId!==workspaceId||!['active','past_due','unpaid'].includes(sub.status)||sub.pending_update||sub.items.data.length!==1||!['standard','premium'].some(plan=>stripePlanPrice(plan as 'standard'|'premium')===sub.items.data[0].price.id))throw Error('Billing scope changed');
  if(await trx('billingPlanChanges').where({workspaceId}).whereIn('state',['applying','payment']).first())throw Error('Resolve plan payment first');
  const target=invoiceId??id(sub.latest_invoice);if(!target)throw Error('No renewal invoice');
  const invoice=await stripe.invoices.retrieve(target);
  if(invoice.livemode||id(invoice.customer)!==customer.id||id(invoice.parent?.subscription_details?.subscription)!==sub.id||invoice.billing_reason!=='subscription_cycle'||invoice.currency!=='usd'||invoice.collection_method!=='charge_automatically')throw Error('Unsupported renewal invoice');
  const methodId=id(sub.default_payment_method)??id(customer.invoice_settings.default_payment_method);
  const method=methodId?await stripe.paymentMethods.retrieve(methodId):null;
  if(method&&(method.livemode||id(method.customer)!==customer.id||method.type!=='card'||!method.card))throw Error('Card scope changed');
  return{customer,sub,invoice,method,card:method?.card?{brand:method.card.brand,last4:method.card.last4,expMonth:method.card.exp_month,expYear:method.card.exp_year}:null};
}
function invoiceView(invoice:Stripe.Invoice){return{number:invoice.number??invoice.id,description:invoice.lines.data[0]?.description??'',periodStart:new Date((invoice.lines.data[0]?.period.start??invoice.period_start)*1000).toISOString(),periodEnd:new Date((invoice.lines.data[0]?.period.end??invoice.period_end)*1000).toISOString(),total:invoice.total,amountPaid:invoice.amount_paid,amountDue:invoice.amount_remaining};}
function result(row:RecoveryQuote,current:Awaited<ReturnType<typeof mapping>>,status:PaymentRecoveryResult['status'],clientSecret?:string):PaymentRecoveryResult{
  return paymentRecoveryResultSchema.parse({status,quoteId:row.id,expiresAt:new Date(row.expiresAt).toISOString(),invoice:invoiceView(current.invoice),card:current.card,...(clientSecret?{clientSecret}:{})});
}
/** Inspect the invoice's linked default PaymentIntent; never create a standalone charge. */
async function intent(stripe:Stripe,current:Awaited<ReturnType<typeof mapping>>){
  const payments=await stripe.invoicePayments.list({invoice:current.invoice.id,status:'open',limit:100,expand:['data.payment.payment_intent']});
  if(payments.has_more)throw Error('Ambiguous invoice payments');
  const defaults=payments.data.filter(p=>p.is_default&&p.payment.type==='payment_intent');
  if(defaults.length>1||payments.data.some(p=>p.livemode||id(p.invoice)!==current.invoice.id||p.currency!=='usd'))throw Error('Payment scope mismatch');
  const raw=defaults[0]?.payment.payment_intent;
  const payment=typeof raw==='string'?await stripe.paymentIntents.retrieve(raw):raw;
  if(payment&&(payment.livemode||id(payment.customer)!==current.customer.id||payment.currency!=='usd'))throw Error('Intent scope mismatch');
  return payment??null;
}
async function observe(trx:Knex.Transaction,stripe:Stripe,row:RecoveryQuote,current:Awaited<ReturnType<typeof mapping>>,declined=false){
  if(current.invoice.status==='paid'){
    await trx('billingRenewalRecoveries').where({id:row.id}).update({state:'paid'});
    return result(row,current,row.attemptedAt?'paid':'already-paid');
  }
  if(current.invoice.status!=='open'||current.invoice.amount_remaining!==row.amountDue){
    await trx('billingRenewalRecoveries').where({id:row.id}).update({state:'changed'});
    return result(row,current,'changed');
  }
  const payment=await intent(stripe,current);
  if(payment?.status==='requires_action'&&row.attemptedAt&&id(payment.payment_method)===row.paymentMethodId&&payment.amount===row.amountDue&&payment.client_secret){
    await trx('billingRenewalRecoveries').where({id:row.id}).update({state:'action'});
    return result(row,current,'authenticating',payment.client_secret);
  }
  if(declined&&(!payment||payment.status==='requires_payment_method')){
    await trx('billingRenewalRecoveries').where({id:row.id}).update({state:'declined'});
    return result(row,current,'declined');
  }
  await trx('billingRenewalRecoveries').where({id:row.id}).update({state:'pending'});
  return result(row,current,'pending');
}
async function reconcilePaid(db:Knex,workspaceId:string,value:PaymentRecoveryResult){
  if(!['paid','already-paid'].includes(value.status))return value;
  try{
    await reconcileWorkspaceSubscription(db,workspaceId);
    if(value.quoteId)await db('billingRenewalRecoveries').where({id:value.quoteId,state:'paid'}).update({reconciledAt:db.fn.now()});
    return value;
  }catch{return{...value,status:'pending' as const};}
}
/** Read/quote only: opening, refreshing and changing cards cannot call invoices.pay. */
export async function previewRenewalRecovery(db:Knex,userId:string,workspaceId:string):Promise<PaymentRecoveryResult>{
  const stripe=stripeSandbox();
  const value=await db.transaction(async trx=>{
    await lockWorkspaceBilling(trx,workspaceId);
    await ownerBilling(trx,userId,workspaceId);
    const pending=await trx('billingRenewalRecoveries').where({workspaceId}).whereIn('state',active).orderBy('createdAt','desc').first();
    if(pending){
      if(pending.actorId!==userId)throw Error('Recovery actor changed');
      const current=await mapping(trx,stripe,userId,workspaceId,pending.invoiceId);
      return observe(trx,stripe,pending,current);
    }
    const current=await mapping(trx,stripe,userId,workspaceId);
    if(!['open','paid'].includes(current.invoice.status??''))return empty;
    const quote={id:randomUUID(),workspaceId,actorId:userId,customerId:current.customer.id,subscriptionId:current.sub.id,invoiceId:current.invoice.id,paymentMethodId:current.method?.id??null,amountDue:current.invoice.amount_remaining,invoice:JSON.stringify(invoiceView(current.invoice)),expiresAt:new Date(Date.now()+600000),state:current.invoice.status==='paid'?'paid':'quoted'};
    await trx('billingRenewalRecoveries').insert(quote);
    return result(quote,current,current.invoice.status==='paid'?'already-paid':'review');
  });
  return reconcilePaid(db,workspaceId,value);
}
/** Consent commits before payment, and the provider request reuses this quote's idempotency key. */
export async function confirmRenewalRecovery(db:Knex,userId:string,workspaceId:string,quoteId:string){
  const stripe=stripeSandbox();
  const initial=await db.transaction(async trx=>{
    await lockWorkspaceBilling(trx,workspaceId);
    const current=await mapping(trx,stripe,userId,workspaceId,(await trx('billingRenewalRecoveries').where({id:quoteId,workspaceId,actorId:userId}).first())?.invoiceId);
    const row=await trx('billingRenewalRecoveries').where({id:quoteId,workspaceId,actorId:userId}).forUpdate().first();
    if(!row||row.customerId!==current.customer.id||row.subscriptionId!==current.sub.id)throw Error('Unknown recovery');
    if(current.invoice.status==='paid')return observe(trx,stripe,row,current);
    if(row.state!=='quoted'){
      if(active.includes(row.state))return observe(trx,stripe,row,current);
      return result(row,current,row.state==='declined'?'declined':'changed');
    }
    if(new Date(row.expiresAt).getTime()<=Date.now()||current.invoice.status!=='open'||row.amountDue!==current.invoice.amount_remaining||row.paymentMethodId!==current.method?.id||row.amountDue<=0){await trx('billingRenewalRecoveries').where({id:quoteId}).update({state:'changed'});return result(row,current,'changed');}
    if(await trx('billingRenewalRecoveries').where({workspaceId}).whereNot({id:quoteId}).whereIn('state',active).first())throw Error('Payment already pending');
    const payment=await intent(stripe,current);
    if(payment&&['processing','succeeded','requires_capture'].includes(payment.status))return result(row,current,'pending');
    await trx('billingRenewalRecoveries').where({id:quoteId}).update({state:'applying',attemptedAt:trx.fn.now()});
    return null;
  });
  if(initial)return reconcilePaid(db,workspaceId,initial);
  return executeRenewalRecovery(db,userId,workspaceId,quoteId);
}
async function executeRenewalRecovery(db:Knex,userId:string,workspaceId:string,quoteId:string){
  const stripe=stripeSandbox();
  const value=await db.transaction(async trx=>{
    await lockWorkspaceBilling(trx,workspaceId);
    const row=await trx('billingRenewalRecoveries').where({id:quoteId,workspaceId,actorId:userId}).forUpdate().first();
    if(!row)throw Error('Unknown recovery');
    let current=await mapping(trx,stripe,userId,workspaceId,row.invoiceId);
    if(row.customerId!==current.customer.id||row.subscriptionId!==current.sub.id)throw Error('Recovery mapping changed');
    if(row.state==='paid')return result(row,current,'paid');
    if(!active.includes(row.state))return result(row,current,row.state==='declined'?'declined':'changed');
    if(current.invoice.status==='paid')return observe(trx,stripe,row,current);
    const payment=await intent(stripe,current);
    if(payment&&['requires_action','processing','succeeded','requires_capture'].includes(payment.status)){
      if(payment.status!=='requires_action'||id(payment.payment_method)===row.paymentMethodId)return observe(trx,stripe,row,current);
    }
    if(!row.attemptedAt||Date.now()-new Date(row.attemptedAt).getTime()>23*3600000)return result(row,current,'pending');
    if(current.invoice.status!=='open'||current.invoice.amount_remaining!==row.amountDue||current.method?.id!==row.paymentMethodId)return observe(trx,stripe,row,current);
    let declined=false;
    try{await stripe.invoices.pay(row.invoiceId,{payment_method:row.paymentMethodId,off_session:false},{idempotencyKey:`salesmora-renewal-${row.id}`});}
    catch(error){declined=typeof error==='object'&&error!==null&&'type'in error&&error.type==='StripeCardError';}
    current=await mapping(trx,stripe,userId,workspaceId,row.invoiceId);
    const next=await observe(trx,stripe,row,current,declined);
    if(next.status==='paid')await trx('billingAudit').insert({workspaceId,actorId:userId,action:'renewal.payment_verified',details:JSON.stringify({quoteId:row.id,amount:row.amountDue})});
    return next;
  });
  return reconcilePaid(db,workspaceId,value);
}
/** Status requests never submit a payment. Unknown results remain non-payable until verified. */
export async function renewalRecoveryStatus(db:Knex,userId:string,workspaceId:string,quoteId:string){
  const stripe=stripeSandbox();
  const value=await db.transaction(async trx=>{
    await lockWorkspaceBilling(trx,workspaceId);
    const row=await trx('billingRenewalRecoveries').where({id:quoteId,workspaceId,actorId:userId}).first();if(!row)throw Error('Unknown recovery');
    const current=await mapping(trx,stripe,userId,workspaceId,row.invoiceId);
    if(row.customerId!==current.customer.id||row.subscriptionId!==current.sub.id)throw Error('Recovery mapping changed');
    if(current.invoice.status==='paid')return observe(trx,stripe,row,current);
    if(row.state==='quoted'){
      const payment=await intent(stripe,current);
      if(payment&&['processing','succeeded','requires_capture'].includes(payment.status))return result(row,current,'pending');
      return result(row,current,current.invoice.status==='open'&&new Date(row.expiresAt).getTime()>Date.now()&&row.amountDue===current.invoice.amount_remaining&&row.paymentMethodId===current.method?.id?'review':'changed');
    }
    if(!active.includes(row.state))return result(row,current,row.state==='declined'?'declined':'changed');
    return observe(trx,stripe,row,current);
  });
  return reconcilePaid(db,workspaceId,value);
}
export async function reconcileRenewalRecoveries(db:Knex){
  const rows=await db('billingRenewalRecoveries').where(q=>q.whereIn('state',active).orWhere(s=>s.where({state:'paid'}).whereNull('reconciledAt'))).where('retryAt','<=',db.fn.now()).orderBy('retryAt').limit(10);
  for(const row of rows){
    try{await executeRenewalRecovery(db,row.actorId,row.workspaceId,row.id);}
    catch{console.error(JSON.stringify({event:'worker.renewal_recovery_retry_pending'}));}
    await db('billingRenewalRecoveries').where({id:row.id}).update({attempts:db.raw('attempts + 1'),retryAt:new Date(Date.now()+Math.min(3600000,5000*2**Math.min(Number(row.attempts),9)))});
  }
}
