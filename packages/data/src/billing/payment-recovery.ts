import {randomUUID} from 'node:crypto';
import type {Knex} from 'knex';
import {
  adminWorkspaceRecoveryPreviewResponseSchema,
  adminWorkspaceRecoveryResultSchema,
  paymentRecoveryResultSchema,
  type PaymentRecoveryResult,
} from '@salesmora/contracts';
import {lockWorkspaceBilling,ownerBilling} from './checkout';
import {stripeSandbox,stripePlanPrice,type Stripe} from './stripe';
import {reconcileWorkspaceSubscription} from './events';
import {initialRecoveryGraceUntil,maximumRecoveryGraceUntil,nextRecoveryGraceUntil} from './recovery-grace';
const id=(value:string|{id:string}|null|undefined)=>typeof value==='string'?value:value?.id??null;
const active=['applying','action','pending'];
interface RecoveryQuote { id:string;expiresAt:Date|string;attemptedAt?:Date|string|null;amountDue:number;paymentMethodId:string|null; }
interface RecoveryMappingOptions { authorizeOwner?:boolean; requireCurrentOwner?:boolean; }
const empty:PaymentRecoveryResult={status:'unavailable',quoteId:null,expiresAt:null,invoice:null,card:null};
const DAY_MS=24*60*60*1000;

function dateISO(value:Date|string|null|undefined){return value==null?null:new Date(value).toISOString();}
function paymentState(payment:Stripe.PaymentIntent|null){
  if(!payment)return'none' as const;
  if(['processing','requires_action','succeeded','requires_payment_method'].includes(payment.status))return payment.status;
  return'other' as const;
}

async function mapping(
  trx:Knex.Transaction,
  stripe:Stripe,
  userId:string,
  workspaceId:string,
  invoiceId?:string,
  options:RecoveryMappingOptions={},
){
  if(options.authorizeOwner??true)await ownerBilling(trx,userId,workspaceId);
  else{
    const workspaceQuery=trx('workspaces').where({id:workspaceId}).whereNull('deletionRequestedAt');
    if(trx.isTransaction)workspaceQuery.forShare();
    const workspace=await workspaceQuery.first('ownerId');
    if(!workspace||(options.requireCurrentOwner&&workspace.ownerId!==userId))throw Error('Workspace owner mapping changed.');
  }
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
async function reconcilePaid(db:Knex,workspaceId:string,value:PaymentRecoveryResult,stripe?:Stripe){
  if(!['paid','already-paid'].includes(value.status))return value;
  try{
    await reconcileWorkspaceSubscription(db,workspaceId,stripe);
    if(value.quoteId)await db('billingRenewalRecoveries').where({id:value.quoteId,state:'paid'}).update({reconciledAt:db.fn.now()});
    return value;
  }catch{
    console.error(JSON.stringify({event:'billing.renewal_recovery_reconciliation_failed',workspaceId}));
    return{...value,status:'pending' as const};
  }
}
/** Read/quote only: opening, refreshing and changing cards cannot call invoices.pay. */
export async function previewRenewalRecovery(db:Knex,userId:string,workspaceId:string,provider?:Stripe):Promise<PaymentRecoveryResult>{
  const stripe=provider??stripeSandbox();
  const value=await db.transaction(async trx=>{
    await lockWorkspaceBilling(trx,workspaceId);
    await ownerBilling(trx,userId,workspaceId);
    const pending=await trx('billingRenewalRecoveries').where({workspaceId}).whereNull('retryCancelledAt').whereIn('state',active).orderBy('createdAt','desc').first();
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
  return reconcilePaid(db,workspaceId,value,stripe);
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
  return executeRenewalRecovery(db,userId,workspaceId,quoteId,stripe);
}
async function executeRenewalRecovery(
  db:Knex,
  userId:string,
  workspaceId:string,
  quoteId:string,
  provider?:Stripe,
  automatic=false,
  adminAction=false,
){
  const stripe=provider??stripeSandbox();
  const value=await db.transaction(async trx=>{
    await lockWorkspaceBilling(trx,workspaceId);
    const row=await trx('billingRenewalRecoveries').where({id:quoteId,workspaceId,actorId:userId}).forUpdate().first();
    if(!row)throw Error('Unknown recovery');
    let current=await mapping(trx,stripe,userId,workspaceId,row.invoiceId,adminAction
      ?{authorizeOwner:false,requireCurrentOwner:true}
      :undefined);
    if(row.customerId!==current.customer.id||row.subscriptionId!==current.sub.id)throw Error('Recovery mapping changed');
    if(automatic&&row.retryCancelledAt)return result(row,current,'pending');
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
    current=await mapping(trx,stripe,userId,workspaceId,row.invoiceId,adminAction
      ?{authorizeOwner:false,requireCurrentOwner:true}
      :undefined);
    const next=await observe(trx,stripe,row,current,declined);
    if(next.status==='paid')await trx('billingAudit').insert({workspaceId,actorId:userId,action:'renewal.payment_verified',details:JSON.stringify({quoteId:row.id,amount:row.amountDue})});
    return next;
  });
  return reconcilePaid(db,workspaceId,value,stripe);
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
export async function reconcileRenewalRecoveries(db:Knex,provider?:Stripe){
  const stripe=provider??stripeSandbox();
  const rows=await db('billingRenewalRecoveries').whereNull('retryCancelledAt')
    .where(q=>q.whereIn('state',active).orWhere(s=>s.where({state:'paid'}).whereNull('reconciledAt')))
    .where('retryAt','<=',db.fn.now()).orderBy('retryAt').limit(10);
  for(const row of rows){
    try{await executeRenewalRecovery(db,row.actorId,row.workspaceId,row.id,stripe,true);}
    catch{console.error(JSON.stringify({event:'worker.renewal_recovery_retry_pending'}));}
    await db('billingRenewalRecoveries').where({id:row.id}).whereNull('retryCancelledAt')
      .update({attempts:db.raw('attempts + 1'),retryAt:new Date(Date.now()+Math.min(3600000,5000*2**Math.min(Number(row.attempts),9)))});
  }
}

/** Snapshot for authorized staff; provider identifiers and payment secrets never leave this adapter. */
export async function previewAdminRenewalRecovery(trx:Knex.Transaction,workspaceId:string,provider?:Stripe){
  await lockWorkspaceBilling(trx,workspaceId);
  const workspace=await trx('workspaces').where({id:workspaceId}).whereNull('deletionRequestedAt').first('ownerId');
  if(!workspace)throw Error('Workspace unavailable.');
  const subscription=await trx('workspaceSubscriptions').where({workspaceId}).first();
  if(subscription?.subscriptionId&&!subscription.customerId)throw Error('Workspace billing mapping is incomplete.');
  if(!subscription?.customerId||!subscription.subscriptionId){
    return adminWorkspaceRecoveryPreviewResponseSchema.parse({
      workspaceId,providerStatus:'not_linked',invoice:null,paymentState:'none',recovery:null,
      grace:{currentUntil:null,maximumUntil:null,additionalDaysAvailable:0},
    });
  }
  const stripe=provider??stripeSandbox();
  const current=await mapping(trx,stripe,workspace.ownerId,workspaceId,undefined,{authorizeOwner:false});
  const payment=await intent(stripe,current);
  const createdAt=new Date(current.invoice.created*1000);
  let graceCurrent:Date|null=null;
  let graceMaximum:Date|null=null;
  let additionalDaysAvailable=0;
  if(current.sub.status==='past_due'){
    const extension=await trx('billingRecoveryGraceExtensions').where({
      workspaceId,invoiceId:current.invoice.id,invoiceCreatedAt:createdAt,
    }).max('extendedUntil as extendedUntil').first<{extendedUntil:Date|string|null}>();
    const base=initialRecoveryGraceUntil(createdAt);
    graceCurrent=extension?.extendedUntil
      ? new Date(Math.max(base.getTime(),new Date(extension.extendedUntil).getTime()))
      : base;
    graceMaximum=maximumRecoveryGraceUntil(createdAt);
    if(graceMaximum.getTime()>Date.now()){
      additionalDaysAvailable=Math.max(0,Math.min(7,Math.floor((graceMaximum.getTime()-graceCurrent.getTime())/DAY_MS)));
    }
  }
  const recovery=await trx('billingRenewalRecoveries').where({
    workspaceId,invoiceId:current.invoice.id,
  }).orderBy('createdAt','desc').first();
  return adminWorkspaceRecoveryPreviewResponseSchema.parse({
    workspaceId,
    providerStatus:'available',
    invoice:{
      number:current.invoice.number,
      createdAt:createdAt.toISOString(),
      status:current.invoice.status,
      amountDue:current.invoice.amount_remaining,
    },
    paymentState:paymentState(payment),
    recovery:recovery?{
      id:recovery.id,
      state:recovery.state,
      amountDue:recovery.amountDue,
      attempts:recovery.attempts,
      createdAt:dateISO(recovery.createdAt),
      attemptedAt:dateISO(recovery.attemptedAt),
      retryAt:dateISO(recovery.retryAt),
      retriesCancelledAt:dateISO(recovery.retryCancelledAt),
    }:null,
    grace:{
      currentUntil:graceCurrent?.toISOString()??null,
      maximumUntil:graceMaximum?.toISOString()??null,
      additionalDaysAvailable,
    },
  });
}

/** Staff may repeat only an Owner-confirmed row; it retains the same provider idempotency key. */
export async function retryAdminRenewalRecovery(
  db:Knex,
  workspaceId:string,
  recoveryId:string,
  provider?:Stripe,
){
  const recovery=await db('billingRenewalRecoveries').where({id:recoveryId,workspaceId}).first();
  if(!recovery||!active.includes(recovery.state)||!recovery.attemptedAt)throw Error('No Owner-confirmed recovery is available to retry.');
  const value=await executeRenewalRecovery(db,recovery.actorId,workspaceId,recoveryId,provider,false,true);
  if(!value.quoteId)throw Error('Recovery result is missing its recovery identifier.');
  if(value.status==='authenticating'){
    return adminWorkspaceRecoveryResultSchema.parse({
      status:'owner_action_required',recoveryId:value.quoteId,handoff:'workspace_owner_billing',
    });
  }
  if(['paid','already-paid','declined','changed','pending'].includes(value.status)){
    return adminWorkspaceRecoveryResultSchema.parse({
      status:value.status==='already-paid'?'already-paid':value.status,
      recoveryId:value.quoteId,
    });
  }
  throw Error('Recovery retry did not produce a safe staff result.');
}

/** Extends only this currently past-due subscription's latest failed renewal invoice. */
export async function extendAdminRecoveryGrace(
  db:Knex,
  workspaceId:string,
  additionalDays:number,
  provider?:Stripe,
){
  if(!Number.isSafeInteger(additionalDays)||additionalDays<1||additionalDays>7)throw Error('Grace extension must be between one and seven days.');
  const stripe=provider??stripeSandbox();
  const extend=async(trx:Knex.Transaction)=>{
    await lockWorkspaceBilling(trx,workspaceId);
    const workspace=await trx('workspaces').where({id:workspaceId}).whereNull('deletionRequestedAt').first('ownerId');
    if(!workspace)throw Error('Workspace unavailable.');
    const current=await mapping(trx,stripe,workspace.ownerId,workspaceId,undefined,{authorizeOwner:false});
    if(current.sub.status!=='past_due'||current.invoice.status!=='open'||current.invoice.amount_remaining<=0)throw Error('No open past-due renewal invoice can receive a grace extension.');
    const invoiceCreatedAt=new Date(current.invoice.created*1000);
    if(maximumRecoveryGraceUntil(invoiceCreatedAt).getTime()<=Date.now())throw Error('The invoice recovery grace window has expired.');
    const existing=await trx('billingRecoveryGraceExtensions').where({
      workspaceId,invoiceId:current.invoice.id,invoiceCreatedAt,
    }).max('extendedUntil as extendedUntil').first<{extendedUntil:Date|string|null}>();
    const extendedUntil=nextRecoveryGraceUntil(invoiceCreatedAt,existing?.extendedUntil??null,additionalDays);
    await trx('billingRecoveryGraceExtensions').insert({
      id:randomUUID(),workspaceId,invoiceId:current.invoice.id,invoiceCreatedAt,extendedUntil,
    });
    await reconcileWorkspaceSubscription(trx,workspaceId,stripe);
    return adminWorkspaceRecoveryResultSchema.parse({
      status:'grace_extended',graceUntil:extendedUntil.toISOString(),
    });
  };
  return db.isTransaction?extend(db as Knex.Transaction):db.transaction(extend);
}

/** Stops worker retries only; never cancels or mutates a Stripe invoice, intent or subscription. */
export async function cancelAdminRenewalRecovery(
  db:Knex,
  workspaceId:string,
  recoveryId:string,
  provider?:Stripe,
){
  const stripe=provider??stripeSandbox();
  return db.transaction(async trx=>{
    await lockWorkspaceBilling(trx,workspaceId);
    const row=await trx('billingRenewalRecoveries').where({id:recoveryId,workspaceId}).forUpdate().first();
    if(!row||!active.includes(row.state)||!row.attemptedAt)throw Error('No Owner-confirmed recovery is available to cancel.');
    const current=await mapping(trx,stripe,row.actorId,workspaceId,row.invoiceId,{authorizeOwner:false});
    if(current.invoice.status==='paid')throw Error('Invoice is already paid; no recovery retries remain.');
    const payment=await intent(stripe,current);
    const providerState=paymentState(payment);
    if(!row.retryCancelledAt){
      await trx('billingRenewalRecoveries').where({id:recoveryId,workspaceId}).whereNull('retryCancelledAt')
        .update({retryCancelledAt:trx.fn.now()});
    }
    return adminWorkspaceRecoveryResultSchema.parse({
      status:'retries_cancelled',paymentState:providerState,
    });
  });
}
