import Stripe from 'stripe';
import { getWorkspacePlan } from '@salesmora/domain';

export function sandboxBillingEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.BILLING_SANDBOX_ENABLED === 'true';
}
export function stripeSandbox(env: NodeJS.ProcessEnv = process.env) {
  if (!sandboxBillingEnabled(env) || !/^(sk|rk)_test_/.test(env.STRIPE_SECRET_KEY ?? '')) throw Error('Sandbox billing is unavailable.');
  return new Stripe(env.STRIPE_SECRET_KEY!, { timeout: 10_000, maxNetworkRetries: 1 });
}
export function stripePlanPrice(plan: 'standard' | 'premium', env: NodeJS.ProcessEnv = process.env) {
  const id = env[`STRIPE_${plan.toUpperCase()}_MONTHLY_PRICE_ID`];
  if (!id || !/^price_[a-zA-Z0-9]+$/.test(id)) throw Error('Sandbox price is not configured.');
  return id;
}
export async function verifyPlanPrice(stripe: Stripe, plan: 'standard' | 'premium') {
  const price = await stripe.prices.retrieve(stripePlanPrice(plan));
  const definition = getWorkspacePlan(plan);
  if (price.livemode || !price.active || price.currency !== 'usd' || price.unit_amount !== definition.monthlyPriceCents || price.recurring?.interval !== 'month' || price.recurring.interval_count !== 1 || price.recurring.usage_type !== 'licensed') throw Error('Sandbox price does not match the plan.');
  return price;
}
export function verifyBillingWebhook(body: string, signature: string, env: NodeJS.ProcessEnv = process.env) {
  const secret = env.STRIPE_WEBHOOK_SECRET;
  if (!secret?.startsWith('whsec_')) throw Error('Webhook signing secret is not configured.');
  const event = stripeSandbox(env).webhooks.constructEvent(body, signature, secret);
  if (event.livemode || event.account) throw Error('Unexpected Stripe event scope.');
  return event;
}
export type { Stripe };
