import {billingReadAllowed} from './access';
export {billingReadAllowed} from './access';
import {invoiceSummary} from './invoices';
import {workspaceSeatUsage} from './entitlements';
import type { Knex } from 'knex';
import { workspaceBillingSnapshotSchema, workspacePlanIdSchema } from '@salesmora/contracts';
import { workspaceUsagePeriod } from '@salesmora/domain';
import { AuthorizationAccessError, withWorkspaceAuthorization } from '../authorization/store';
import { workspaceAIAllowance } from '../ai-usage';
import { sandboxBillingEnabled, stripeSandbox, type Stripe } from './stripe';

const id = (value: string | {id:string} | null | undefined) => typeof value === 'string' ? value : value?.id;
/** Keep the authorization lock until data/provider reads finish, including a revoked Admin grant. */
export async function readWorkspaceBilling(db:Knex,userId:string,workspaceId:string,enabledPermissions:Parameters<typeof withWorkspaceAuthorization>[2]) {
  return withWorkspaceAuthorization(db,{userId,workspaceId},enabledPermissions,false,async(trx,context)=>{
    if (!sandboxBillingEnabled() || !billingReadAllowed(context)) throw new AuthorizationAccessError();
    const row = await trx('workspaceSubscriptions').where({workspaceId}).first();
    if (!row) throw Error('Missing workspace billing record.');
    const {rows} = await trx.raw('SELECT clock_timestamp() AS now');
    const now = new Date(rows[0].now);
    const period = workspaceUsagePeriod(now);
    const paid = row.status === 'active' && row.paidThrough && new Date(row.paidThrough)>now;
    const grace = row.status === 'past_due' && row.recoveryUntil && new Date(row.recoveryUntil)>now;
    const plan = workspacePlanIdSchema.parse(paid || grace ? row.plan : 'free');
    const seats = await workspaceSeatUsage(trx,workspaceId,now);
    const leads = await trx('workspaceLeadAdmissions').where({workspaceId}).where('createdAt','>=',period.start).where('createdAt','<',period.end).count('* as count').first();
    const ai = await workspaceAIAllowance(trx,workspaceId,now);
    const change = await trx('billingPlanChanges').where({workspaceId}).whereIn('state',['applying','payment','scheduled']).orderBy('createdAt','desc').first();
    let activeChange = change && (change.state!=='scheduled' || (change.basis?.end && change.basis.end*1000>now.getTime())) ? change : null;
    let providerAvailable = true;
    let payment: {brand:string;last4:string;expMonth:number;expYear:number} | null = null;
    let billingEmail:string|null = null;
    let invoices: {id:string;number:string|null;createdAt:string;currency:'usd';total:number;amountPaid:number;amountDue:number;status:Stripe.Invoice['status'];lines:{description:string;amount:number}[]}[] = [];
    let hasMoreInvoices = false;
    if (row.customerId) {
      try {
        const stripe = stripeSandbox();
        const customer = await stripe.customers.retrieve(row.customerId);
        if (customer.deleted || customer.livemode || customer.metadata.workspaceId !== workspaceId) throw Error('Customer scope mismatch.');
        let methodId = id(customer.invoice_settings.default_payment_method);
        if (row.subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(row.subscriptionId);
          if (sub.livemode || id(sub.customer)!==row.customerId || sub.metadata.workspaceId!==workspaceId) throw Error('Subscription scope mismatch.');
          if(activeChange?.state==='scheduled' && (activeChange.kind==='free' ? !sub.cancel_at_period_end : id(sub.schedule)!==activeChange.scheduleId))activeChange=null;
          methodId = id(sub.default_payment_method) ?? methodId;
        }
        let card = null;
        if (methodId) {
          const method = await stripe.paymentMethods.retrieve(methodId);
          if (method.livemode || id(method.customer)!==row.customerId) throw Error('Payment method scope mismatch.');
          card = method.card ?? null;
        }
        const history = await stripe.invoices.list({customer:row.customerId,limit:12});
        if (history.data.some(invoice=>invoice.livemode || id(invoice.customer)!==row.customerId || invoice.currency!=='usd')) throw Error('Invoice scope mismatch.');
        invoices = history.data.map(invoiceSummary);
        hasMoreInvoices = history.has_more;
        billingEmail = customer.email;
        payment = card ? {brand:card.brand,last4:card.last4,expMonth:card.exp_month,expYear:card.exp_year} : null;
      } catch {
        // Never substitute fictional payment details when Stripe is unavailable.
        providerAvailable = false; payment = null; billingEmail = null; invoices = []; hasMoreInvoices = false;
      }
    }
    const snapshot = workspaceBillingSnapshotSchema.parse({change:activeChange?{id:activeChange.id,plan:activeChange.targetPlan,kind:activeChange.kind,amountDue:activeChange.amountDue,currency:'usd',effectiveAt:new Date((['downgrade','free'].includes(activeChange.kind)?activeChange.basis.end:activeChange.prorationAt)*1000).toISOString(),expiresAt:new Date(new Date(activeChange.createdAt).getTime()+600000).toISOString(),status:activeChange.state}:null,plan,status:row.status,cancelAtPeriodEnd:row.cancelAtPeriodEnd,paidThrough:row.paidThrough?.toISOString()??null,recoveryUntil:row.recoveryUntil?.toISOString()??null,transitionUntil:row.transitionUntil?.toISOString()??null,resetAt:period.end.toISOString(),usage:{teammates:seats,newLeads:Number(leads?.count??0),aiTokens:ai.usedTokens.toString(),monthlyAITokens:ai.monthlyTokens},payment,billingEmail,providerAvailable,invoices,hasMoreInvoices});
    return {context,snapshot};
  });
}
