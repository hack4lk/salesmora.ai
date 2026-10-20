import { isDeepStrictEqual } from 'node:util';
import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { getWorkspacePlan } from '@salesmora/domain';
import { type WorkspacePlanId, planChangeQuoteSchema, type PlanChangeResult } from '@salesmora/contracts';
import { lockWorkspaceBilling, ownerBilling, createWorkspaceCheckout } from './checkout';
import { stripeSandbox, stripePlanPrice, verifyPlanPrice, type Stripe } from './stripe';
import { reconcileWorkspaceSubscription } from './events';
const id = (v: string | {
    id: string;
} | null | undefined) => typeof v === 'string' ? v : v?.id;
async function subscription(stripe: Stripe, row: {
    subscriptionId: string | null;
    customerId: string | null;
}, workspaceId: string) {
    if (!row.subscriptionId)
        return null;
    const sub = await stripe.subscriptions.retrieve(row.subscriptionId, { expand: ['latest_invoice.confirmation_secret'] });
    if (sub.livemode || id(sub.customer) !== row.customerId || sub.metadata.workspaceId !== workspaceId || sub.items.data.length !== 1 || sub.items.data[0].quantity !== 1)
        throw Error('Subscription mapping changed.');
    return sub;
}
function basis(sub: Stripe.Subscription | null) { return sub ? { id: sub.id, price: sub.items.data[0].price.id, start: sub.items.data[0].current_period_start, end: sub.items.data[0].current_period_end, invoice: id(sub.latest_invoice) ?? null, schedule: id(sub.schedule) ?? null, cancel: sub.cancel_at_period_end } : null; }
async function previewAmount(stripe: Stripe, sub: Stripe.Subscription, plan: 'standard' | 'premium', at: number) {
    const invoice = await stripe.invoices.createPreview({ subscription: sub.id, subscription_details: { items: [{ id: sub.items.data[0].id, price: stripePlanPrice(plan) }], proration_date: at, proration_behavior: 'always_invoice' } });
    if (invoice.currency !== 'usd' || invoice.amount_due < 0)
        throw Error('Unsupported invoice.');
    return invoice.amount_due;
}
/** Durable quoted intent; request bodies never choose a customer, price, amount or effective date. */
export async function previewPlanChange(db: Knex, userId: string, workspaceId: string, plan: WorkspacePlanId) {
    const stripe = stripeSandbox();
    return db.transaction(async (trx) => {
        await lockWorkspaceBilling(trx, workspaceId);
        await ownerBilling(trx, userId, workspaceId);
        if (await trx('billingRenewalRecoveries').where({workspaceId}).whereIn('state',['applying','action','pending']).first()) throw Error('Resolve renewal payment first');
        const row = await trx('workspaceSubscriptions').where({ workspaceId }).forUpdate().first();
        if (!row)
            throw Error('Missing billing.');
        if (await trx('billingPlanChanges').where({ workspaceId }).whereIn('state', ['applying', 'payment']).first())
            throw Error('Finish the current plan change first.');
        const sub = await subscription(stripe, row, workspaceId);
        const active = sub && !['canceled', 'incomplete_expired'].includes(sub.status) ? sub : null;
        if (active && (active.status !== 'active' || active.pending_update || active.schedule || active.cancel_at_period_end))
            throw Error('Resolve the pending subscription change or payment first.');
        const current = active ? (['standard', 'premium'] as const).find(p => stripePlanPrice(p) === active.items.data[0].price.id) : 'free';
        if (!current || current === plan)
            throw Error('Choose a different plan.');
        if (plan !== 'free')
            await verifyPlanPrice(stripe, plan);
        const now = Math.floor(Date.now() / 1000);
        if (active && active.items.data[0].current_period_end <= now + 600)
            throw Error('Wait until your renewal finishes before changing plans.');
        const kind = !active ? 'checkout' : plan === 'free' ? 'free' : getWorkspacePlan(plan).monthlyPriceCents > getWorkspacePlan(current).monthlyPriceCents ? 'upgrade' : 'downgrade';
        const amountDue = kind === 'upgrade' ? await previewAmount(stripe, active!, plan as 'standard' | 'premium', now) : kind === 'checkout' ? getWorkspacePlan(plan).monthlyPriceCents : 0;
        const quote = { id: randomUUID(), plan, kind, amountDue, currency: 'usd', effectiveAt: new Date((kind === 'downgrade' || kind === 'free' ? active!.items.data[0].current_period_end : now) * 1000).toISOString(), expiresAt: new Date((now + 600) * 1000).toISOString() };
        await trx('billingPlanChanges').insert({ id: quote.id, workspaceId, actorId: userId, targetPlan: plan, kind, basis: JSON.stringify(basis(sub)), amountDue, prorationAt: now });
        return planChangeQuoteSchema.parse(quote);
    });
}
/** Persist applying before network mutation. Retry uses the same Stripe idempotency keys. */
export async function confirmPlanChange(db: Knex, userId: string, workspaceId: string, quoteId: string, refresh = false): Promise<PlanChangeResult> {
    const stripe = stripeSandbox();
    const kind = await db.transaction(async (trx) => {
        await lockWorkspaceBilling(trx, workspaceId);
        await ownerBilling(trx, userId, workspaceId);
        if (await trx('billingRenewalRecoveries').where({workspaceId}).whereIn('state',['applying','action','pending']).first()) throw Error('Resolve renewal payment first');
        const quote = await trx('billingPlanChanges').where({ id: quoteId, workspaceId, actorId: userId }).forUpdate().first();
        if (!quote)
            throw Error('Unknown quote.');
        if (!['quoted','applying','payment','complete','scheduled','expired'].includes(quote.state)) throw Error('Plan change is no longer active.');
        if (quote.state === 'quoted') {
            if (quote.targetPlan !== 'free') await verifyPlanPrice(stripe, quote.targetPlan);
            if (refresh || Date.now() - new Date(quote.createdAt).getTime() > 600000)
                throw Error('Review a fresh quote.');
            if (await trx('billingPlanChanges').where({ workspaceId }).whereNot({ id: quoteId }).whereIn('state', ['applying', 'payment']).first())
                throw Error('A change is already running.');
            const row = await trx('workspaceSubscriptions').where({ workspaceId }).first();
            const sub = await subscription(stripe, row, workspaceId);
            if (!isDeepStrictEqual(basis(sub), quote.basis))
                throw Error('Subscription changed. Review again.');
            if (quote.kind === 'upgrade' && await previewAmount(stripe, sub!, quote.targetPlan, quote.prorationAt) !== quote.amountDue)
                throw Error('Price changed. Review again.');
            await trx('billingPlanChanges').where({ id: quoteId }).update({ state: 'applying' });
        }
        return { kind: quote.kind as string, state: quote.state as string };
    });
    if (['complete', 'scheduled', 'expired'].includes(kind.state))
        return { status: kind.state as 'complete' | 'scheduled' | 'expired' };
    if (kind.kind === 'checkout') {
        await db.transaction(async (trx) => {
            await lockWorkspaceBilling(trx, workspaceId);
            await ownerBilling(trx, userId, workspaceId);
            const quote = await trx('billingPlanChanges').where({ id: quoteId }).first();
            if (quote.state === 'complete')
                return;
            const row = await trx('workspaceSubscriptions').where({ workspaceId }).forUpdate().first();
            if (row.subscriptionId) {
                const sub = await subscription(stripe, row, workspaceId);
                if (sub && !['canceled', 'incomplete_expired'].includes(sub.status)) {
                    if (row.plan === quote.targetPlan) {
                        await trx('billingPlanChanges').where({ id: quoteId }).update({ state: 'complete' });
                        return;
                    }
                    throw Error('Subscription is already active.');
                }
                await trx('billingCheckoutAttempts').where({ workspaceId }).whereIn('status', ['complete', 'open', 'creating']).update({ status: 'archived' });
            }
            const oldAttempts = await trx('billingCheckoutAttempts').where({ workspaceId }).whereIn('status', ['creating', 'open', 'complete']).whereNot({ plan: quote.targetPlan });
            for (const attempt of oldAttempts) {
                if (!attempt.sessionId)
                    throw Error('An earlier checkout needs reconciliation.');
                const session = await stripe.checkout.sessions.retrieve(attempt.sessionId);
                if (session.status === 'complete')
                    throw Error('An earlier payment is being confirmed.');
                if (session.status === 'open')
                    await stripe.checkout.sessions.expire(session.id);
                await trx('billingCheckoutAttempts').where({ id: attempt.id }).update({ status: 'expired' });
            }
            await trx('workspaceSubscriptions').where({ workspaceId }).update({ subscriptionId: null, plan: 'free', status: 'free', intendedPlan: quote.targetPlan, cancelAtPeriodEnd: false, paidThrough: null, recoveryUntil: null });
        });
        if (refresh)
            await reconcileWorkspaceSubscription(db, workspaceId);
        const row = await db('workspaceSubscriptions').where({ workspaceId }).first();
        if (row.plan !== 'free') {
            await db('billingPlanChanges').where({ id: quoteId, workspaceId }).update({ state: 'complete' });
            return { status: 'complete' };
        }
        const checkout = await createWorkspaceCheckout(db, userId, workspaceId, process.env.BETTER_AUTH_URL!);
        return { status: 'payment', paymentUI: 'checkout', clientSecret: checkout.clientSecret };
    }
    const result = await db.transaction(async (trx) => {
        await lockWorkspaceBilling(trx, workspaceId);
        await ownerBilling(trx, userId, workspaceId);
        const quote = await trx('billingPlanChanges').where({ id: quoteId, workspaceId, actorId: userId }).forUpdate().first();
        if (['complete', 'scheduled'].includes(quote.state))
            return { status: quote.state } as PlanChangeResult;
        if (Date.now() - new Date(quote.createdAt).getTime() > 23 * 3600000)
            throw Error('This change needs reconciliation before retrying.');
        const row = await trx('workspaceSubscriptions').where({ workspaceId }).first();
        let sub = await subscription(stripe, row, workspaceId);
        if (!sub || sub.id !== quote.basis.id)
            throw Error('Subscription changed.');
        if (quote.kind === 'upgrade') {
            if (quote.state === 'applying')
                await stripe.subscriptions.update(sub.id, { payment_settings: { save_default_payment_method: 'on_subscription', payment_method_types: ['card'] } }, { idempotencyKey: `salesmora-save-payment-${quote.id}` });
            if (quote.state === 'applying')
                sub = await stripe.subscriptions.update(sub.id, { items: [{ id: sub.items.data[0].id, price: stripePlanPrice(quote.targetPlan) }], payment_behavior: 'pending_if_incomplete', proration_behavior: 'always_invoice', proration_date: quote.prorationAt, expand: ['latest_invoice.confirmation_secret'] }, { idempotencyKey: `salesmora-plan-${quote.id}` });
            const invoice = typeof sub.latest_invoice === 'object' ? sub.latest_invoice : null;
            if (sub.pending_update) {
                await trx('billingPlanChanges').where({ id: quote.id }).update({ state: 'payment' });
                return { status: 'payment', paymentUI: 'card', clientSecret: invoice?.confirmation_secret?.client_secret ?? undefined } as PlanChangeResult;
            }
            if (!sub.pending_update && invoice?.status === 'void' && sub.items.data[0].price.id !== stripePlanPrice(quote.targetPlan)) {
                await trx('billingPlanChanges').where({ id: quote.id }).update({ state: 'expired' });
                return { status: 'expired' } as PlanChangeResult;
            }
            if (sub.items.data[0].price.id !== stripePlanPrice(quote.targetPlan) || invoice?.status !== 'paid')
                throw Error('Payment has not been verified.');
        }
        else if (quote.kind === 'free') {
            await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true }, { idempotencyKey: `salesmora-plan-${quote.id}` });
        }
        else {
            let scheduleId = quote.scheduleId as string | null;
            if (!scheduleId) {
                const schedule = await stripe.subscriptionSchedules.create({ from_subscription: sub.id }, { idempotencyKey: `salesmora-schedule-${quote.id}` });
                scheduleId = schedule.id;
                await trx('billingPlanChanges').where({ id: quote.id }).update({ scheduleId });
            }
            await stripe.subscriptionSchedules.update(scheduleId, { end_behavior: 'release', proration_behavior: 'none', phases: [{ start_date: quote.basis.start, end_date: quote.basis.end, items: [{ price: quote.basis.price, quantity: 1 }], proration_behavior: 'none' }, { start_date: quote.basis.end, duration: { interval: 'month', interval_count: 1 }, items: [{ price: stripePlanPrice(quote.targetPlan), quantity: 1 }], proration_behavior: 'none' }] }, { idempotencyKey: `salesmora-phases-${quote.id}` });
        }
        const status = quote.kind === 'upgrade' ? 'complete' : 'scheduled';
        await trx('billingPlanChanges').where({ id: quote.id }).update({ state: status });
        await trx('billingAudit').insert({ workspaceId, actorId: userId, action: 'plan.changed', details: JSON.stringify({ quoteId: quote.id, plan: quote.targetPlan, status, amountDue: quote.amountDue }) });
        return { status } as PlanChangeResult;
    });
    await reconcileWorkspaceSubscription(db, workspaceId);
    return result;
}
/** Undo only our scheduled change, before its effective date. Never release unrelated schedules. */
export async function undoPlanChange(db: Knex, userId: string, workspaceId: string, quoteId: string): Promise<PlanChangeResult> {
    const stripe = stripeSandbox();
    await db.transaction(async (trx) => {
        await lockWorkspaceBilling(trx, workspaceId);
        await ownerBilling(trx, userId, workspaceId);
        const quote = await trx('billingPlanChanges').where({ id: quoteId, workspaceId }).forUpdate().first();
        if (quote?.state === 'cancelled')
            return;
        if (!quote || quote.state !== 'scheduled' || quote.basis.end * 1000 <= Date.now())
            throw Error('Scheduled change is no longer reversible.');
        const row = await trx('workspaceSubscriptions').where({ workspaceId }).first();
        const sub = await subscription(stripe, row, workspaceId);
        if (!sub || sub.id !== quote.basis.id || sub.status !== 'active' || sub.items.data[0].price.id !== quote.basis.price)
            throw Error('Subscription changed.');
        if (quote.kind === 'free')
            await stripe.subscriptions.update(sub.id, { cancel_at_period_end: false }, { idempotencyKey: `salesmora-undo-${quote.id}` });
        else {
            if (id(sub.schedule) && id(sub.schedule) !== quote.scheduleId)
                throw Error('Schedule mapping changed.');
            const schedule = await stripe.subscriptionSchedules.retrieve(quote.scheduleId);
            if (id(schedule.customer) !== row.customerId || schedule.livemode)
                throw Error('Schedule mapping changed.');
            if (schedule.status !== 'released')
                await stripe.subscriptionSchedules.release(quote.scheduleId, { preserve_cancel_date: false }, { idempotencyKey: `salesmora-undo-${quote.id}` });
        }
        await trx('billingPlanChanges').where({ id: quote.id }).update({ state: 'cancelled' });
        await trx('billingAudit').insert({ workspaceId, actorId: userId, action: 'plan.schedule-undone', details: JSON.stringify({ quoteId: quote.id }) });
    });
    await reconcileWorkspaceSubscription(db, workspaceId);
    return { status: 'complete' };
}
