import { redirect } from 'next/navigation';
import { billingCheckoutRequestSchema } from '@salesmora/contracts';
import { AccountLayout } from '@salesmora/ui';
import { sandboxBillingEnabled, billingOnboarding } from '@salesmora/data';
import { getSession } from '../../../../server/auth/session';
import { database } from '../../../../server/workspaces/store';
import { CheckoutHandoff } from '../../../../features/billing/checkout-handoff/checkout-handoff';
import { checkoutHandoffData as copy } from '../../../../features/billing/checkout-handoff/checkout-handoff.data';
export default async function PaymentPage({searchParams}:{searchParams:Promise<{workspace?:string}>}) {
  const session=await getSession();if(!session)redirect('/login');
  if(!sandboxBillingEnabled())redirect('/setup');
  const parsed=billingCheckoutRequestSchema.safeParse({workspaceId:(await searchParams).workspace,action:'refresh'});if(!parsed.success)redirect('/setup');
  let billing;
  try {billing=await billingOnboarding(database(),session.user.id,parsed.data.workspaceId);}catch{redirect('/home');}
  if(!billing||billing.status!=='free'||billing.plan!=='free'||billing.intendedPlan==='free')redirect('/home');
  return <AccountLayout title={copy.title} description={copy.description}><CheckoutHandoff workspaceId={parsed.data.workspaceId} plan={billing.intendedPlan} hasCheckout={billing.hasCheckout} publishableKey={/^pk_test_/.test(process.env.STRIPE_PUBLISHABLE_KEY ?? '') ? process.env.STRIPE_PUBLISHABLE_KEY : undefined}/></AccountLayout>;
}
