module.exports = [
"[project]/packages/data/src/billing/stripe.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sandboxBillingEnabled",
    ()=>sandboxBillingEnabled,
    "stripePlanPrice",
    ()=>stripePlanPrice,
    "stripeSandbox",
    ()=>stripeSandbox,
    "verifyBillingWebhook",
    ()=>verifyBillingWebhook,
    "verifyPlanPrice",
    ()=>verifyPlanPrice
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$stripe$40$23$2e$0$2e$0_$40$types$2b$node$40$22$2e$20$2e$5$2f$node_modules$2f$stripe$2f$esm$2f$stripe$2e$esm$2e$node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/stripe@23.0.0_@types+node@22.20.5/node_modules/stripe/esm/stripe.esm.node.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/billing/plans.ts [app-route] (ecmascript)");
;
;
function sandboxBillingEnabled(env = process.env) {
    return env.BILLING_SANDBOX_ENABLED === 'true';
}
function stripeSandbox(env = process.env) {
    if (!sandboxBillingEnabled(env) || !/^(sk|rk)_test_/.test(env.STRIPE_SECRET_KEY ?? '')) throw Error('Sandbox billing is unavailable.');
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$stripe$40$23$2e$0$2e$0_$40$types$2b$node$40$22$2e$20$2e$5$2f$node_modules$2f$stripe$2f$esm$2f$stripe$2e$esm$2e$node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"](env.STRIPE_SECRET_KEY, {
        timeout: 10_000,
        maxNetworkRetries: 1
    });
}
function stripePlanPrice(plan, env = process.env) {
    const id = env[`STRIPE_${plan.toUpperCase()}_MONTHLY_PRICE_ID`];
    if (!id || !/^price_[a-zA-Z0-9]+$/.test(id)) throw Error('Sandbox price is not configured.');
    return id;
}
async function verifyPlanPrice(stripe, plan) {
    const price = await stripe.prices.retrieve(stripePlanPrice(plan));
    const definition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getWorkspacePlan"])(plan);
    if (price.livemode || !price.active || price.currency !== 'usd' || price.unit_amount !== definition.monthlyPriceCents || price.recurring?.interval !== 'month' || price.recurring.interval_count !== 1 || price.recurring.usage_type !== 'licensed') throw Error('Sandbox price does not match the plan.');
    return price;
}
function verifyBillingWebhook(body, signature, env = process.env) {
    const secret = env.STRIPE_WEBHOOK_SECRET;
    if (!secret?.startsWith('whsec_')) throw Error('Webhook signing secret is not configured.');
    const event = stripeSandbox(env).webhooks.constructEvent(body, signature, secret);
    if (event.livemode || event.account) throw Error('Unexpected Stripe event scope.');
    return event;
}
}),
"[project]/packages/data/src/billing/checkout.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BillingAccessError",
    ()=>BillingAccessError,
    "billingOnboarding",
    ()=>billingOnboarding,
    "continueWorkspaceFree",
    ()=>continueWorkspaceFree,
    "createWorkspaceCheckout",
    ()=>createWorkspaceCheckout,
    "lockWorkspaceBilling",
    ()=>lockWorkspaceBilling,
    "ownerBilling",
    ()=>ownerBilling
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/billing/plans.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/stripe.ts [app-route] (ecmascript)");
;
;
;
;
;
class BillingAccessError extends Error {
}
async function lockWorkspaceBilling(trx, workspaceId) {
    await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [
        `billing:${workspaceId}`
    ]);
}
async function ownerBilling(trx, userId, workspaceId) {
    const query = trx('workspaces as w').join('workspaceMemberships as m', 'w.id', 'm.workspaceId').join('users as u', 'u.id', 'm.userId').where({
        'w.id': workspaceId,
        'w.ownerId': userId,
        'm.userId': userId,
        'm.role': 'owner'
    }).select('u.emailVerified', 'u.email');
    if (trx.isTransaction) query.forShare('w', 'm');
    const owner = await query.first();
    if (!owner) throw new BillingAccessError('Owner access required.');
    const context = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadWorkspaceAuthorization"])(trx, {
        userId,
        workspaceId
    }, [
        'billing.manage'
    ]);
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'billing.manage'
    }).allowed) throw new BillingAccessError('Billing management access required.');
    return owner;
}
async function billingOnboarding(db, userId, workspaceId) {
    await ownerBilling(db, userId, workspaceId);
    const row = await db('workspaceSubscriptions').where({
        workspaceId
    }).first();
    if (!row) return null;
    const checkout = await db('billingCheckoutAttempts').where({
        workspaceId
    }).whereNotNull('sessionId').first('id');
    return {
        hasCheckout: !!checkout,
        intendedPlan: row.intendedPlan,
        plan: row.plan,
        status: row.status
    };
}
async function createWorkspaceCheckout(db, userId, workspaceId, baseURL, retryExpired = true) {
    const stripe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripeSandbox"])();
    // Commit intent before any external creation; a crash reuses the same provider keys.
    const attemptId = await db.transaction(async (trx)=>{
        await lockWorkspaceBilling(trx, workspaceId);
        await ownerBilling(trx, userId, workspaceId);
        const billing = await trx('workspaceSubscriptions').where({
            workspaceId
        }).forUpdate().first();
        if (!billing || ![
            'standard',
            'premium'
        ].includes(billing.intendedPlan) || billing.subscriptionId) throw Error('No initial purchase is available.');
        const existing = await trx('billingCheckoutAttempts').where({
            workspaceId
        }).whereIn('status', [
            'creating',
            'open',
            'complete'
        ]).orderBy('createdAt', 'desc').first();
        if (existing) return existing.id;
        const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
        await trx('billingCheckoutAttempts').insert({
            id,
            workspaceId,
            plan: billing.intendedPlan,
            priceId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripePlanPrice"])(billing.intendedPlan)
        });
        if (!billing.customerId && !billing.customerCreationStartedAt) await trx('workspaceSubscriptions').where({
            workspaceId
        }).update({
            customerCreationStartedAt: trx.fn.now()
        });
        return id;
    });
    const result = await db.transaction(async (trx)=>{
        await lockWorkspaceBilling(trx, workspaceId);
        const owner = await ownerBilling(trx, userId, workspaceId);
        const billing = await trx('workspaceSubscriptions').where({
            workspaceId
        }).forUpdate().first();
        const attempt = await trx('billingCheckoutAttempts').where({
            id: attemptId,
            workspaceId
        }).first();
        if (!billing || !attempt || billing.subscriptionId || billing.intendedPlan !== attempt.plan || ![
            'creating',
            'open',
            'complete'
        ].includes(attempt.status)) throw Error('Purchase state changed.');
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyPlanPrice"])(stripe, attempt.plan);
        let customerId = billing.customerId;
        if (!customerId) {
            // Stripe keeps idempotency keys for at least 24h. Never blindly recreate after that window.
            if (!billing.customerCreationStartedAt || Date.now() - new Date(billing.customerCreationStartedAt).getTime() > 23 * 3600000) throw Error('Customer creation requires reconciliation.');
            const customer = await stripe.customers.create({
                metadata: {
                    workspaceId
                },
                email: owner.email
            }, {
                idempotencyKey: `salesmora-customer-${workspaceId}`
            });
            if (customer.livemode) throw Error('Unexpected customer mode.');
            customerId = customer.id;
            await trx('workspaceSubscriptions').where({
                workspaceId
            }).update({
                customerId
            });
        }
        if (attempt.sessionId) {
            const session = await stripe.checkout.sessions.retrieve(attempt.sessionId);
            if (session.status === 'open' && session.ui_mode === 'embedded_page' && session.client_secret) return {
                clientSecret: session.client_secret
            };
            if (session.status === 'open') await stripe.checkout.sessions.expire(session.id);
            if (session.status === 'complete') throw Error('Payment is being confirmed.');
            await trx('billingCheckoutAttempts').where({
                id: attempt.id
            }).update({
                status: 'expired'
            });
            return null;
        }
        if (Date.now() - new Date(attempt.createdAt).getTime() > 23 * 3600000) throw Error('Checkout creation requires reconciliation.');
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            ui_mode: 'embedded_page',
            redirect_on_completion: 'never',
            allowed_payment_method_types: [
                'card'
            ],
            customer: customerId,
            line_items: [
                {
                    price: attempt.priceId,
                    quantity: 1
                }
            ],
            client_reference_id: workspaceId,
            metadata: {
                workspaceId
            },
            subscription_data: {
                metadata: {
                    workspaceId
                }
            }
        }, {
            idempotencyKey: `salesmora-checkout-${attempt.id}`
        });
        if (session.livemode || session.ui_mode !== 'embedded_page' || !session.client_secret) throw Error('Unexpected Checkout mode.');
        await trx('billingCheckoutAttempts').where({
            id: attempt.id
        }).update({
            sessionId: session.id,
            status: 'open',
            expiresAt: new Date(session.expires_at * 1000)
        });
        await trx('billingAudit').insert({
            workspaceId,
            actorId: userId,
            action: 'checkout.created',
            details: JSON.stringify({
                plan: attempt.plan,
                catalogVersion: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workspacePlanCatalogVersion"]
            })
        });
        return {
            clientSecret: session.client_secret
        };
    });
    if (!result && retryExpired) return createWorkspaceCheckout(db, userId, workspaceId, baseURL, false);
    if (!result) throw Error('Checkout expired. Try again.');
    return result;
}
async function continueWorkspaceFree(db, userId, workspaceId) {
    const stripe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripeSandbox"])();
    await db.transaction(async (trx)=>{
        await lockWorkspaceBilling(trx, workspaceId);
        await ownerBilling(trx, userId, workspaceId);
        const row = await trx('workspaceSubscriptions').where({
            workspaceId
        }).forUpdate().first();
        if (!row || row.subscriptionId || row.plan !== 'free') throw Error('Manage your subscription in Billing.');
        const attempts = await trx('billingCheckoutAttempts').where({
            workspaceId
        }).whereIn('status', [
            'open',
            'creating'
        ]);
        for (const attempt of attempts){
            if (!attempt.sessionId) throw Error('Checkout creation must be recovered before continuing.');
            const session = await stripe.checkout.sessions.retrieve(attempt.sessionId);
            if (session.status === 'complete') throw Error('Payment is being confirmed.');
            if (session.status === 'open') await stripe.checkout.sessions.expire(session.id);
            await trx('billingCheckoutAttempts').where({
                id: attempt.id
            }).update({
                status: 'expired'
            });
        }
        await trx('workspaceSubscriptions').where({
            workspaceId
        }).update({
            intendedPlan: 'free',
            pendingInvitations: JSON.stringify([]),
            updatedAt: trx.fn.now()
        });
        await trx('billingAudit').insert({
            workspaceId,
            actorId: userId,
            action: 'onboarding.free',
            details: JSON.stringify({
                discardedInvitationDrafts: true,
                teammateLimit: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getWorkspacePlan"])('free').limits.teammates
            })
        });
    });
}
}),
"[project]/packages/data/src/billing/entitlements.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PlanCapacityError",
    ()=>PlanCapacityError,
    "assertLeadCapacity",
    ()=>assertLeadCapacity,
    "assertSeatCapacity",
    ()=>assertSeatCapacity,
    "workspaceEntitlements",
    ()=>workspaceEntitlements,
    "workspaceSeatUsage",
    ()=>workspaceSeatUsage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plan$2d$override$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/billing/plan-override.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/billing/plans.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/stripe.ts [app-route] (ecmascript)");
;
;
class PlanCapacityError extends Error {
    resource;
    limit;
    resetAt;
    constructor(resource, limit, resetAt = null){
        super('Workspace plan capacity reached'), this.resource = resource, this.limit = limit, this.resetAt = resetAt;
    }
}
async function lockAdmissionWorkspace(trx, workspaceId) {
    if (!await trx('workspaces').where({
        id: workspaceId
    }).whereNull('deletionRequestedAt').forUpdate().first('id')) throw Error('Workspace unavailable');
}
async function workspaceEntitlements(db, workspaceId) {
    const row = await db('workspaceSubscriptions').where({
        workspaceId
    }).first();
    const { rows } = await db.raw('SELECT statement_timestamp() AS now');
    const now = new Date(rows[0].now);
    const workspace = await db('workspaces').where({
        id: workspaceId
    }).first('planOverride', 'planOverrideEndsAt');
    const effective = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plan$2d$override$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["effectiveWorkspacePlan"])(row, workspace, now);
    const plan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getWorkspacePlan"])(effective.plan);
    const transition = !!row?.transitionUntil && new Date(row.transitionUntil) > now;
    return {
        plan,
        billedPlan: effective.billedPlan,
        override: effective.override,
        now,
        transition,
        enforced: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sandboxBillingEnabled"])() && !transition,
        period: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workspaceUsagePeriod"])(now)
    };
}
async function assertLeadCapacity(trx, workspaceId, options = {}) {
    await lockAdmissionWorkspace(trx, workspaceId);
    const entitlement = await workspaceEntitlements(trx, workspaceId);
    // Public service admission cannot inherit the private billing UI's feature flag.
    // The explicitly approved existing-workspace transition still defers enforcement.
    if (!entitlement.enforced && (!options.enforce || entitlement.transition)) return entitlement.now;
    const count = await trx('workspaceLeadAdmissions').where({
        workspaceId
    }).where('createdAt', '>=', entitlement.period.start).where('createdAt', '<', entitlement.period.end).count('* as count').first();
    if (Number(count?.count ?? 0) >= entitlement.plan.limits.newLeadsPerMonth) throw new PlanCapacityError('leads', entitlement.plan.limits.newLeadsPerMonth, entitlement.period.end.toISOString());
    return entitlement.now;
}
async function workspaceSeatUsage(db, workspaceId, now, excludeInvitationId) {
    const members = await db('workspaceMemberships').where({
        workspaceId
    }).count('* as count').first();
    const invitations = db('workspaceInvitations').where({
        workspaceId
    }).where((q)=>q.whereIn('status', [
            'queued',
            'pending_verification'
        ]).orWhere((s)=>s.where({
                status: 'sent'
            }).where('expiresAt', '>', now)));
    if (excludeInvitationId) invitations.whereNot({
        id: excludeInvitationId
    });
    const reserved = await invitations.count('* as count').first();
    const billing = await db('workspaceSubscriptions').where({
        workspaceId
    }).first('pendingInvitations');
    return Number(members?.count ?? 0) + Number(reserved?.count ?? 0) + (Array.isArray(billing?.pendingInvitations) ? billing.pendingInvitations.length : 0);
}
async function assertSeatCapacity(trx, workspaceId, additional, excludeInvitationId) {
    await lockAdmissionWorkspace(trx, workspaceId);
    if (!Number.isSafeInteger(additional) || additional < 0) throw Error('Invalid seat reservation');
    const entitlement = await workspaceEntitlements(trx, workspaceId);
    if (!entitlement.enforced) return;
    const used = await workspaceSeatUsage(trx, workspaceId, entitlement.now, excludeInvitationId);
    if (used + additional > entitlement.plan.limits.teammates) throw new PlanCapacityError('teammates', entitlement.plan.limits.teammates);
}
}),
"[project]/packages/data/src/billing/recovery-grace.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "initialRecoveryGraceUntil",
    ()=>initialRecoveryGraceUntil,
    "maximumRecoveryGraceUntil",
    ()=>maximumRecoveryGraceUntil,
    "nextRecoveryGraceUntil",
    ()=>nextRecoveryGraceUntil
]);
const DAY_MS = 24 * 60 * 60 * 1000;
function validDate(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (!Number.isFinite(date.getTime())) throw Error('Invalid recovery invoice date.');
    return date;
}
function initialRecoveryGraceUntil(invoiceCreatedAt) {
    return new Date(validDate(invoiceCreatedAt).getTime() + 7 * DAY_MS);
}
function maximumRecoveryGraceUntil(invoiceCreatedAt) {
    return new Date(validDate(invoiceCreatedAt).getTime() + 14 * DAY_MS);
}
function nextRecoveryGraceUntil(invoiceCreatedAt, currentExtensionUntil, additionalDays) {
    if (!Number.isSafeInteger(additionalDays) || additionalDays < 1 || additionalDays > 7) {
        throw Error('Grace extension must be between one and seven days.');
    }
    const base = initialRecoveryGraceUntil(invoiceCreatedAt);
    const current = currentExtensionUntil === null ? base : new Date(Math.max(base.getTime(), validDate(currentExtensionUntil).getTime()));
    const next = new Date(current.getTime() + additionalDays * DAY_MS);
    if (next > maximumRecoveryGraceUntil(invoiceCreatedAt)) {
        throw Error('Grace extension exceeds the 14-day recovery limit.');
    }
    return next;
}
}),
"[project]/packages/data/src/billing/events.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "associateBillingEvent",
    ()=>associateBillingEvent,
    "processBillingEvents",
    ()=>processBillingEvents,
    "reconcileWorkspaceSubscription",
    ()=>reconcileWorkspaceSubscription,
    "recordBillingEvent",
    ()=>recordBillingEvent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/capacity.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/entitlements.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$billing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/billing.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/billing/plans.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/stripe.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/checkout.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$recovery$2d$grace$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/recovery-grace.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
const supported = new Set([
    'checkout.session.completed',
    'checkout.session.async_payment_succeeded',
    'checkout.session.expired',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'customer.subscription.pending_update_applied',
    'customer.subscription.pending_update_expired',
    'invoice.paid',
    'invoice.payment_failed',
    'invoice.payment_action_required'
]);
async function recordBillingEvent(db, event) {
    if (event.livemode || event.account) throw Error('Unexpected event scope.');
    if (!supported.has(event.type)) return;
    const objectId = 'id' in event.data.object ? event.data.object.id : undefined;
    if (!objectId || !/^(cs_test_|sub_|in_)/.test(objectId)) throw Error('Invalid event object.');
    await db('billingWebhookEvents').insert({
        id: event.id,
        type: event.type,
        objectId
    }).onConflict('id').ignore();
}
const objectId = (value)=>typeof value === 'string' ? value : value?.id;
async function associateBillingEvent(db, eventId, workspaceId) {
    const existing = await db('billingWebhookEvents').where({
        id: eventId
    }).first('workspaceId', 'processedAt');
    if (!existing) throw Error('Billing webhook event not found.');
    if (existing.workspaceId === workspaceId) return;
    if (existing.workspaceId !== null || existing.processedAt) {
        throw Error('Billing webhook event cannot be associated with this workspace.');
    }
    await db('billingWebhookEvents').where({
        id: eventId
    }).whereNull('workspaceId').whereNull('processedAt').update({
        workspaceId
    });
    const linked = await db('billingWebhookEvents').where({
        id: eventId
    }).first('workspaceId');
    if (linked?.workspaceId !== workspaceId) {
        throw Error('Billing webhook workspace mapping changed.');
    }
}
async function reconcileWorkspaceSubscription(db, workspaceId, provider) {
    const stripe = provider ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripeSandbox"])();
    const reconcile = async (trx)=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lockWorkspaceBilling"])(trx, workspaceId);
        if (!await trx('workspaces').where({
            id: workspaceId
        }).whereNull('deletionRequestedAt').forUpdate().first('id')) return;
        const row = await trx('workspaceSubscriptions').where({
            workspaceId
        }).forUpdate().first();
        if (!row) return;
        let subscriptionId = row.subscriptionId;
        let confirmedAttempt;
        if (!subscriptionId) {
            const attempt = await trx('billingCheckoutAttempts').where({
                workspaceId
            }).whereNotNull('sessionId').whereIn('status', [
                'open',
                'complete'
            ]).orderBy('createdAt', 'desc').first();
            if (!attempt) {
                await trx('workspaceSubscriptions').where({
                    workspaceId
                }).update({
                    updatedAt: trx.fn.now()
                });
                return;
            }
            const session = await stripe.checkout.sessions.retrieve(attempt.sessionId);
            if (session.livemode || session.mode !== 'subscription' || objectId(session.customer) !== row.customerId || session.client_reference_id !== workspaceId || session.metadata?.workspaceId !== workspaceId) throw Error('Checkout mapping mismatch.');
            if (session.status === 'expired') {
                await trx('billingCheckoutAttempts').where({
                    id: attempt.id
                }).update({
                    status: 'expired'
                });
                return;
            }
            if (session.status !== 'complete' || session.payment_status !== 'paid') {
                await trx('workspaceSubscriptions').where({
                    workspaceId
                }).update({
                    updatedAt: trx.fn.now()
                });
                return;
            }
            subscriptionId = objectId(session.subscription) ?? null;
            if (!subscriptionId || row.intendedPlan !== attempt.plan) throw Error('Subscription mapping mismatch.');
            confirmedAttempt = attempt;
        }
        if (!subscriptionId) return;
        const sub = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: [
                'latest_invoice'
            ]
        });
        if (sub.livemode || objectId(sub.customer) !== row.customerId || sub.metadata.workspaceId !== workspaceId || sub.items.data.length !== 1 || sub.items.data[0].quantity !== 1) throw Error('Subscription scope mismatch.');
        const item = sub.items.data[0];
        const plan = [
            'standard',
            'premium'
        ].find((id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripePlanPrice"])(id) === item.price.id);
        if (!plan || item.price.currency !== 'usd' || item.price.unit_amount !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getWorkspacePlan"])(plan).monthlyPriceCents || item.price.recurring?.interval !== 'month' || item.price.recurring.interval_count !== 1) throw Error('Unrecognized subscription price.');
        if (confirmedAttempt && (confirmedAttempt.plan !== plan || confirmedAttempt.priceId !== item.price.id)) throw Error('Paid intent mismatch.');
        const invoice = typeof sub.latest_invoice === 'object' && sub.latest_invoice ? sub.latest_invoice : null;
        const paid = sub.status === 'active' && invoice?.status === 'paid';
        // Grace starts from the authoritative failed-renewal invoice, never from event delivery time.
        let recoveryUntil = sub.status === 'past_due' && invoice ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$recovery$2d$grace$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initialRecoveryGraceUntil"])(new Date(invoice.created * 1000)) : null;
        if (recoveryUntil && invoice) {
            const extension = await trx('billingRecoveryGraceExtensions').where({
                workspaceId,
                invoiceId: invoice.id
            }).where('invoiceCreatedAt', new Date(invoice.created * 1000)).max('extendedUntil as extendedUntil').first();
            if (extension?.extendedUntil) {
                const maximum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$recovery$2d$grace$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maximumRecoveryGraceUntil"])(new Date(invoice.created * 1000));
                const extendedUntil = new Date(extension.extendedUntil);
                if (extendedUntil > maximum) throw Error('Stored recovery grace extension exceeds its invoice limit.');
                if (extendedUntil > recoveryUntil) recoveryUntil = extendedUntil;
            }
        }
        const grace = recoveryUntil !== null && recoveryUntil.getTime() > Date.now() && row.subscriptionId !== null;
        const pendingPaid = sub.status === 'active' && row.paidThrough && new Date(row.paidThrough).getTime() > Date.now();
        const effectivePlan = paid || grace ? plan : pendingPaid ? row.plan : 'free';
        const previousEnd = row.status === 'past_due' ? row.recoveryUntil : row.paidThrough;
        if (paid && previousEnd && new Date(previousEnd) <= new Date()) {
            const previousAccess = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workspaceEntitlements"])(trx, workspaceId);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enqueueCaptureAccessCheck"])(trx, workspaceId, previousAccess.plan.id, new Date(previousEnd));
        }
        await trx('workspaceSubscriptions').where({
            workspaceId
        }).update({
            subscriptionId: sub.id,
            plan: effectivePlan,
            status: sub.status,
            priceId: item.price.id,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            paidThrough: paid ? new Date(item.current_period_end * 1000) : row.paidThrough,
            recoveryUntil,
            updatedAt: trx.fn.now()
        });
        if (row.plan !== effectivePlan || row.status !== sub.status || row.subscriptionId !== sub.id || new Date(row.recoveryUntil ?? 0).getTime() !== new Date(recoveryUntil ?? 0).getTime()) {
            const entitlement = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workspaceEntitlements"])(trx, workspaceId);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enqueueCaptureAccessCheck"])(trx, workspaceId, entitlement.plan.id, entitlement.now);
        }
        // Resolve durable intents after verified provider transitions, including expired upgrades.
        const changes = await trx('billingPlanChanges').where({
            workspaceId
        }).whereIn('state', [
            'applying',
            'payment',
            'scheduled'
        ]);
        for (const change of changes){
            if (change.kind === 'checkout' && paid && change.targetPlan === plan) await trx('billingPlanChanges').where({
                id: change.id
            }).update({
                state: 'complete'
            });
            if (change.kind === 'upgrade' && paid && change.targetPlan === plan) await trx('billingPlanChanges').where({
                id: change.id
            }).update({
                state: 'complete'
            });
            if (change.kind === 'upgrade' && change.state === 'payment' && !sub.pending_update && invoice?.status === 'void' && change.targetPlan !== plan) await trx('billingPlanChanges').where({
                id: change.id
            }).update({
                state: 'expired'
            });
            if (change.state === 'scheduled' && change.basis?.end * 1000 <= Date.now()) {
                if (change.kind === 'free' && sub.status === 'canceled') await trx('billingPlanChanges').where({
                    id: change.id
                }).update({
                    state: 'complete'
                });
                if (change.kind === 'downgrade' && change.targetPlan === plan && paid && objectId(sub.schedule) === change.scheduleId) {
                    // The target phase has started; release our schedule so subsequent changes remain possible.
                    await stripe.subscriptionSchedules.release(change.scheduleId, {
                        preserve_cancel_date: false
                    }, {
                        idempotencyKey: `salesmora-release-${change.id}`
                    });
                    await trx('billingPlanChanges').where({
                        id: change.id
                    }).update({
                        state: 'complete'
                    });
                }
            }
        }
        if (confirmedAttempt) await trx('billingCheckoutAttempts').where({
            id: confirmedAttempt.id
        }).update({
            status: 'complete'
        });
        if (paid && Array.isArray(row.pendingInvitations) && row.pendingInvitations.length) {
            const owner = await trx('workspaces').where({
                id: workspaceId
            }).first('ownerId');
            const invitations = row.pendingInvitations;
            const seats = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workspaceSeatUsage"])(trx, workspaceId, new Date());
            const context = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadWorkspaceAuthorization"])(trx, {
                userId: owner.ownerId,
                workspaceId
            }, [
                'team.invite'
            ]);
            const allowed = invitations.every((invite)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
                    permission: 'team.invite',
                    targetRole: invite.role
                }).allowed);
            const capacity = seats <= (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getWorkspacePlan"])(plan).limits.teammates;
            // A changed invitation policy/capacity must not roll back a verified paid entitlement.
            if (allowed && capacity) {
                const user = await trx('users').where({
                    id: owner.ownerId
                }).first('emailVerified');
                await trx('workspaceInvitations').insert(invitations.map((invite)=>({
                        ...invite,
                        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
                        workspaceId,
                        inviterId: owner.ownerId,
                        status: user.emailVerified ? 'queued' : 'pending_verification'
                    }))).onConflict([
                    'workspaceId',
                    'email'
                ]).ignore();
                await trx('workspaceSubscriptions').where({
                    workspaceId
                }).update({
                    pendingInvitations: JSON.stringify([])
                });
            }
        }
        if (row.plan !== effectivePlan || row.status !== sub.status || row.subscriptionId !== sub.id) await trx('billingAudit').insert({
            workspaceId,
            action: 'subscription.reconciled',
            details: JSON.stringify({
                plan: effectivePlan,
                status: sub.status,
                subscriptionId: sub.id
            })
        });
    };
    if (db.isTransaction) await reconcile(db);
    else await db.transaction(reconcile);
}
async function processBillingEvents(db, provider) {
    const stripe = provider ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripeSandbox"])();
    const events = await db('billingWebhookEvents').whereNull('processedAt').where('retryAt', '<=', new Date()).orderBy('receivedAt').limit(10);
    for (const event of events){
        try {
            let workspaceId;
            let providerSubscriptionId;
            if (event.type.startsWith('checkout.')) workspaceId = (await db('billingCheckoutAttempts').where({
                sessionId: event.objectId
            }).first('workspaceId'))?.workspaceId;
            else {
                let subId = event.objectId;
                if (event.type.startsWith('invoice.')) {
                    const invoice = await stripe.invoices.retrieve(event.objectId);
                    subId = objectId(invoice.parent?.subscription_details?.subscription);
                }
                providerSubscriptionId = subId;
                if (subId) workspaceId = (await db('workspaceSubscriptions').where({
                    subscriptionId: subId
                }).first('workspaceId'))?.workspaceId;
            }
            if (!workspaceId) {
                // Same sandbox can also contain other projects or the isolated test database.
                // Use provider metadata only to locate an existing local mapping, never to grant access.
                const source = event.type.startsWith('checkout.') ? await stripe.checkout.sessions.retrieve(event.objectId) : providerSubscriptionId ? await stripe.subscriptions.retrieve(providerSubscriptionId) : null;
                const candidate = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$billing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["billingCheckoutRequestSchema"].safeParse({
                    workspaceId: source?.metadata?.workspaceId,
                    action: 'refresh'
                });
                const local = candidate.success ? await db('workspaceSubscriptions').where({
                    workspaceId: candidate.data.workspaceId
                }).first() : null;
                if (!local || !source || objectId(source.customer) !== local.customerId) {
                    await db('billingWebhookEvents').where({
                        id: event.id
                    }).whereNull('processedAt').update({
                        processedAt: db.fn.now()
                    });
                    continue;
                }
                // Initial invoice/subscription events may precede checkout completion.
                workspaceId = local.workspaceId;
            }
            if (!workspaceId) throw Error('Workspace mapping is unavailable.');
            await associateBillingEvent(db, event.id, workspaceId);
            await reconcileWorkspaceSubscription(db, workspaceId, stripe);
            await db('billingWebhookEvents').where({
                id: event.id
            }).whereNull('processedAt').update({
                processedAt: db.fn.now()
            });
        } catch  {
            const attempts = Number(event.attempts) + 1;
            await db('billingWebhookEvents').where({
                id: event.id
            }).whereNull('processedAt').update({
                attempts,
                retryAt: new Date(Date.now() + Math.min(3600000, 5000 * 2 ** Math.min(attempts, 10)))
            });
        }
    }
}
}),
"[project]/packages/data/src/billing/access.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "billingReadAllowed",
    ()=>billingReadAllowed
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/authorization/authorize.ts [app-route] (ecmascript)");
;
function billingReadAllowed(context) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'billing.read'
    }).allowed || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$authorization$2f$authorize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authorize"])(context, {
        permission: 'billing.manage'
    }).allowed;
}
}),
"[project]/packages/data/src/billing/invoices.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "invoiceSummary",
    ()=>invoiceSummary,
    "readWorkspaceInvoices",
    ()=>readWorkspaceInvoices
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$billing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/billing.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/access.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/stripe.ts [app-route] (ecmascript)");
;
;
;
;
const id = (value)=>typeof value === 'string' ? value : value?.id;
function invoiceSummary(invoice) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$billing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["billingInvoiceSchema"].parse({
        id: invoice.id,
        number: invoice.number,
        createdAt: new Date(invoice.created * 1000).toISOString(),
        currency: invoice.currency,
        total: invoice.total,
        amountPaid: invoice.amount_paid,
        amountDue: invoice.amount_remaining,
        status: invoice.status,
        lines: invoice.lines.data.map((line)=>({
                description: line.description ?? '',
                amount: line.amount
            }))
    });
}
async function readWorkspaceInvoices(db, userId, workspaceId, enabledPermissions, after) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, {
        userId,
        workspaceId
    }, enabledPermissions, false, async (trx, context)=>{
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sandboxBillingEnabled"])() || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["billingReadAllowed"])(context)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const row = await trx('workspaceSubscriptions').where({
            workspaceId
        }).first('customerId');
        if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        if (!row.customerId) {
            if (after) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
            return {
                invoices: [],
                hasMore: false,
                nextCursor: null
            };
        }
        const stripe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripeSandbox"])(), customer = await stripe.customers.retrieve(row.customerId);
        if (customer.deleted || customer.livemode || customer.metadata.workspaceId !== workspaceId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        if (after) {
            const cursor = await stripe.invoices.retrieve(after);
            if (cursor.livemode || id(cursor.customer) !== customer.id || cursor.currency !== 'usd') throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        }
        const page = await stripe.invoices.list({
            customer: customer.id,
            limit: 12,
            ...after ? {
                starting_after: after
            } : {}
        });
        if (page.data.some((invoice)=>invoice.livemode || id(invoice.customer) !== customer.id || invoice.currency !== 'usd')) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$billing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["billingInvoiceHistorySchema"].parse({
            invoices: page.data.map(invoiceSummary),
            hasMore: page.has_more,
            nextCursor: page.has_more ? page.data.at(-1)?.id ?? null : null
        });
    });
}
}),
"[project]/packages/data/src/billing/summary.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readWorkspaceBilling",
    ()=>readWorkspaceBilling
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/access.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$invoices$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/invoices.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/entitlements.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$billing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/billing.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plan$2d$override$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/billing/plan-override.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/billing/plans.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/authorization/store.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$ai$2d$usage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/ai-usage.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/stripe.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
const id = (value)=>typeof value === 'string' ? value : value?.id;
async function readWorkspaceBilling(db, userId, workspaceId, enabledPermissions) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withWorkspaceAuthorization"])(db, {
        userId,
        workspaceId
    }, enabledPermissions, false, async (trx, context)=>{
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sandboxBillingEnabled"])() || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$access$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["billingReadAllowed"])(context)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$authorization$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthorizationAccessError"]();
        const row = await trx('workspaceSubscriptions').where({
            workspaceId
        }).first();
        if (!row) throw Error('Missing workspace billing record.');
        const { rows } = await trx.raw('SELECT clock_timestamp() AS now');
        const now = new Date(rows[0].now);
        const period = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workspaceUsagePeriod"])(now);
        const workspace = await trx('workspaces').where({
            id: workspaceId
        }).first('planOverride', 'planOverrideEndsAt');
        const effective = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plan$2d$override$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["effectiveWorkspacePlan"])(row, workspace, now);
        const plan = effective.billedPlan;
        // Customers see an override only while it raises their limits; the staff reason never leaves the server.
        const override = effective.override && effective.plan !== plan ? {
            plan: effective.override.plan,
            endsAt: effective.override.endsAt.toISOString()
        } : null;
        const seats = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workspaceSeatUsage"])(trx, workspaceId, now);
        const leads = await trx('workspaceLeadAdmissions').where({
            workspaceId
        }).where('createdAt', '>=', period.start).where('createdAt', '<', period.end).count('* as count').first();
        const ai = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$ai$2d$usage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workspaceAIAllowance"])(trx, workspaceId, now);
        const change = await trx('billingPlanChanges').where({
            workspaceId
        }).whereIn('state', [
            'applying',
            'payment',
            'scheduled'
        ]).orderBy('createdAt', 'desc').first();
        let activeChange = change && (change.state !== 'scheduled' || change.basis?.end && change.basis.end * 1000 > now.getTime()) ? change : null;
        let providerAvailable = true;
        let payment = null;
        let billingEmail = null;
        let invoices = [];
        let hasMoreInvoices = false;
        if (row.customerId) {
            try {
                const stripe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripeSandbox"])();
                const customer = await stripe.customers.retrieve(row.customerId);
                if (customer.deleted || customer.livemode || customer.metadata.workspaceId !== workspaceId) throw Error('Customer scope mismatch.');
                let methodId = id(customer.invoice_settings.default_payment_method);
                if (row.subscriptionId) {
                    const sub = await stripe.subscriptions.retrieve(row.subscriptionId);
                    if (sub.livemode || id(sub.customer) !== row.customerId || sub.metadata.workspaceId !== workspaceId) throw Error('Subscription scope mismatch.');
                    if (activeChange?.state === 'scheduled' && (activeChange.kind === 'free' ? !sub.cancel_at_period_end : id(sub.schedule) !== activeChange.scheduleId)) activeChange = null;
                    methodId = id(sub.default_payment_method) ?? methodId;
                }
                let card = null;
                if (methodId) {
                    const method = await stripe.paymentMethods.retrieve(methodId);
                    if (method.livemode || id(method.customer) !== row.customerId) throw Error('Payment method scope mismatch.');
                    card = method.card ?? null;
                }
                const history = await stripe.invoices.list({
                    customer: row.customerId,
                    limit: 12
                });
                if (history.data.some((invoice)=>invoice.livemode || id(invoice.customer) !== row.customerId || invoice.currency !== 'usd')) throw Error('Invoice scope mismatch.');
                invoices = history.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$invoices$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invoiceSummary"]);
                hasMoreInvoices = history.has_more;
                billingEmail = customer.email;
                payment = card ? {
                    brand: card.brand,
                    last4: card.last4,
                    expMonth: card.exp_month,
                    expYear: card.exp_year
                } : null;
            } catch  {
                // Never substitute fictional payment details when Stripe is unavailable.
                providerAvailable = false;
                payment = null;
                billingEmail = null;
                invoices = [];
                hasMoreInvoices = false;
            }
        }
        const snapshot = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$billing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workspaceBillingSnapshotSchema"].parse({
            change: activeChange ? {
                id: activeChange.id,
                plan: activeChange.targetPlan,
                kind: activeChange.kind,
                amountDue: activeChange.amountDue,
                currency: 'usd',
                effectiveAt: new Date(([
                    'downgrade',
                    'free'
                ].includes(activeChange.kind) ? activeChange.basis.end : activeChange.prorationAt) * 1000).toISOString(),
                expiresAt: new Date(new Date(activeChange.createdAt).getTime() + 600000).toISOString(),
                status: activeChange.state
            } : null,
            override,
            plan,
            status: row.status,
            cancelAtPeriodEnd: row.cancelAtPeriodEnd,
            paidThrough: row.paidThrough?.toISOString() ?? null,
            recoveryUntil: row.recoveryUntil?.toISOString() ?? null,
            transitionUntil: row.transitionUntil?.toISOString() ?? null,
            resetAt: period.end.toISOString(),
            usage: {
                teammates: seats,
                newLeads: Number(leads?.count ?? 0),
                aiTokens: ai.usedTokens.toString(),
                monthlyAITokens: ai.monthlyTokens
            },
            payment,
            billingEmail,
            providerAvailable,
            invoices,
            hasMoreInvoices
        });
        return {
            context,
            snapshot
        };
    });
}
}),
"[project]/packages/data/src/billing/plan-changes.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "confirmAdminPlanChange",
    ()=>confirmAdminPlanChange,
    "confirmPlanChange",
    ()=>confirmPlanChange,
    "previewAdminPlanChange",
    ()=>previewAdminPlanChange,
    "previewPlanChange",
    ()=>previewPlanChange,
    "undoPlanChange",
    ()=>undoPlanChange
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/capacity.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$util__$5b$external$5d$__$28$node$3a$util$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:util [external] (node:util, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/billing/plans.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$billing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/admin/billing.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$billing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/billing.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/checkout.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/stripe.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$events$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/events.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
const id = (v)=>typeof v === 'string' ? v : v?.id;
async function subscription(stripe, row, workspaceId) {
    if (!row.subscriptionId) return null;
    const sub = await stripe.subscriptions.retrieve(row.subscriptionId, {
        expand: [
            'latest_invoice.confirmation_secret'
        ]
    });
    if (sub.livemode || id(sub.customer) !== row.customerId || sub.metadata.workspaceId !== workspaceId || sub.items.data.length !== 1 || sub.items.data[0].quantity !== 1) throw Error('Subscription mapping changed.');
    return sub;
}
function basis(sub) {
    return sub ? {
        id: sub.id,
        price: sub.items.data[0].price.id,
        start: sub.items.data[0].current_period_start,
        end: sub.items.data[0].current_period_end,
        invoice: id(sub.latest_invoice) ?? null,
        schedule: id(sub.schedule) ?? null,
        cancel: sub.cancel_at_period_end
    } : null;
}
async function workspaceOwnerId(trx, workspaceId) {
    const workspace = await trx('workspaces').where({
        id: workspaceId
    }).whereNull('deletionRequestedAt').forShare().first('ownerId');
    if (!workspace?.ownerId) throw Error('Workspace owner is unavailable.');
    return workspace.ownerId;
}
async function previewAmount(stripe, sub, plan, at) {
    const invoice = await stripe.invoices.createPreview({
        subscription: sub.id,
        subscription_details: {
            items: [
                {
                    id: sub.items.data[0].id,
                    price: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripePlanPrice"])(plan)
                }
            ],
            proration_date: at,
            proration_behavior: 'always_invoice'
        }
    });
    if (invoice.currency !== 'usd' || invoice.amount_due < 0) throw Error('Unsupported invoice.');
    return invoice.amount_due;
}
/** Durable quoted intent; request bodies never choose a customer, price, amount or effective date. */ async function previewPlanChangeFor(db, actor, workspaceId, plan, provider) {
    const stripe = provider ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripeSandbox"])();
    return db.transaction(async (trx)=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lockWorkspaceBilling"])(trx, workspaceId);
        const userId = actor.type === 'admin' ? await workspaceOwnerId(trx, workspaceId) : actor.userId;
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ownerBilling"])(trx, userId, workspaceId);
        if (await trx('billingRenewalRecoveries').where({
            workspaceId
        }).whereIn('state', [
            'applying',
            'action',
            'pending'
        ]).first()) throw Error('Resolve renewal payment first');
        const row = await trx('workspaceSubscriptions').where({
            workspaceId
        }).forUpdate().first();
        if (!row) throw Error('Missing billing.');
        if (await trx('billingPlanChanges').where({
            workspaceId
        }).whereIn('state', [
            'applying',
            'payment'
        ]).first()) throw Error('Finish the current plan change first.');
        const sub = await subscription(stripe, row, workspaceId);
        const active = sub && ![
            'canceled',
            'incomplete_expired'
        ].includes(sub.status) ? sub : null;
        if (active && (active.status !== 'active' || active.pending_update || active.schedule || active.cancel_at_period_end)) throw Error('Resolve the pending subscription change or payment first.');
        if (actor.type === 'admin' && !active) throw Error('An active paid subscription is required for admin plan changes.');
        const current = active ? [
            'standard',
            'premium'
        ].find((p)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripePlanPrice"])(p) === active.items.data[0].price.id) : 'free';
        if (!current || current === plan) throw Error('Choose a different plan.');
        if (plan !== 'free') await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyPlanPrice"])(stripe, plan);
        const now = Math.floor(Date.now() / 1000);
        if (active && active.items.data[0].current_period_end <= now + 600) throw Error('Wait until your renewal finishes before changing plans.');
        const kind = !active ? 'checkout' : plan === 'free' ? 'free' : (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getWorkspacePlan"])(plan).monthlyPriceCents > (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getWorkspacePlan"])(current).monthlyPriceCents ? 'upgrade' : 'downgrade';
        const amountDue = kind === 'upgrade' ? await previewAmount(stripe, active, plan, now) : kind === 'checkout' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getWorkspacePlan"])(plan).monthlyPriceCents : 0;
        const quote = {
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            plan,
            kind,
            amountDue,
            currency: 'usd',
            effectiveAt: new Date((kind === 'downgrade' || kind === 'free' ? active.items.data[0].current_period_end : now) * 1000).toISOString(),
            expiresAt: new Date((now + 600) * 1000).toISOString()
        };
        if (kind === 'downgrade' || kind === 'free') await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertCaptureDowngrade"])(trx, workspaceId, plan, new Date(quote.effectiveAt));
        await trx('billingPlanChanges').insert({
            id: quote.id,
            workspaceId,
            actorId: userId,
            targetPlan: plan,
            kind,
            basis: JSON.stringify(basis(sub)),
            amountDue,
            prorationAt: now
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$billing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["planChangeQuoteSchema"].parse(quote);
    });
}
async function previewPlanChange(db, userId, workspaceId, plan, provider) {
    return previewPlanChangeFor(db, {
        type: 'owner',
        userId
    }, workspaceId, plan, provider);
}
async function previewAdminPlanChange(db, workspaceId, plan, provider) {
    return previewPlanChangeFor(db, {
        type: 'admin'
    }, workspaceId, plan, provider);
}
/** Persist applying before network mutation. Retry uses the same Stripe idempotency keys. */ async function confirmPlanChangeFor(db, userId, workspaceId, quoteId, refresh = false, provider, policy = {}) {
    const stripe = provider ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripeSandbox"])();
    const kind = await db.transaction(async (trx)=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lockWorkspaceBilling"])(trx, workspaceId);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ownerBilling"])(trx, userId, workspaceId);
        if (await trx('billingRenewalRecoveries').where({
            workspaceId
        }).whereIn('state', [
            'applying',
            'action',
            'pending'
        ]).first()) throw Error('Resolve renewal payment first');
        const quote = await trx('billingPlanChanges').where({
            id: quoteId,
            workspaceId,
            actorId: userId
        }).forUpdate().first();
        if (!quote) throw Error('Unknown quote.');
        if (policy.allowCheckout === false && quote.kind === 'checkout') throw Error('Admin plan changes cannot start checkout.');
        if (![
            'quoted',
            'applying',
            'payment',
            'complete',
            'scheduled',
            'expired'
        ].includes(quote.state)) throw Error('Plan change is no longer active.');
        if (quote.state === 'quoted') {
            if (quote.targetPlan !== 'free') await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyPlanPrice"])(stripe, quote.targetPlan);
            if (refresh || Date.now() - new Date(quote.createdAt).getTime() > 600000) throw Error('Review a fresh quote.');
            if (await trx('billingPlanChanges').where({
                workspaceId
            }).whereNot({
                id: quoteId
            }).whereIn('state', [
                'applying',
                'payment'
            ]).first()) throw Error('A change is already running.');
            const row = await trx('workspaceSubscriptions').where({
                workspaceId
            }).first();
            const sub = await subscription(stripe, row, workspaceId);
            if (policy.requireActivePaidSubscription && (!sub || sub.status !== 'active' || sub.pending_update || sub.schedule || sub.cancel_at_period_end || sub.items.data[0].current_period_end <= Math.floor(Date.now() / 1000) + 600)) {
                throw Error('Subscription changed. Review again.');
            }
            if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$util__$5b$external$5d$__$28$node$3a$util$2c$__cjs$29$__["isDeepStrictEqual"])(basis(sub), quote.basis)) throw Error('Subscription changed. Review again.');
            if (quote.kind === 'upgrade' && await previewAmount(stripe, sub, quote.targetPlan, quote.prorationAt) !== quote.amountDue) throw Error('Price changed. Review again.');
            if (quote.kind === 'downgrade' || quote.kind === 'free') await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertCaptureDowngrade"])(trx, workspaceId, quote.targetPlan, new Date(quote.basis.end * 1000));
            await trx('billingPlanChanges').where({
                id: quoteId
            }).update({
                state: 'applying'
            });
        }
        return {
            kind: quote.kind,
            state: quote.state
        };
    });
    if ([
        'complete',
        'scheduled',
        'expired'
    ].includes(kind.state)) return {
        status: kind.state
    };
    if (kind.kind === 'checkout') {
        if (policy.allowCheckout === false) throw Error('Admin plan changes cannot start checkout.');
        await db.transaction(async (trx)=>{
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lockWorkspaceBilling"])(trx, workspaceId);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ownerBilling"])(trx, userId, workspaceId);
            const quote = await trx('billingPlanChanges').where({
                id: quoteId
            }).first();
            if (quote.state === 'complete') return;
            const row = await trx('workspaceSubscriptions').where({
                workspaceId
            }).forUpdate().first();
            if (row.subscriptionId) {
                const sub = await subscription(stripe, row, workspaceId);
                if (sub && ![
                    'canceled',
                    'incomplete_expired'
                ].includes(sub.status)) {
                    if (row.plan === quote.targetPlan) {
                        await trx('billingPlanChanges').where({
                            id: quoteId
                        }).update({
                            state: 'complete'
                        });
                        return;
                    }
                    throw Error('Subscription is already active.');
                }
                await trx('billingCheckoutAttempts').where({
                    workspaceId
                }).whereIn('status', [
                    'complete',
                    'open',
                    'creating'
                ]).update({
                    status: 'archived'
                });
            }
            const oldAttempts = await trx('billingCheckoutAttempts').where({
                workspaceId
            }).whereIn('status', [
                'creating',
                'open',
                'complete'
            ]).whereNot({
                plan: quote.targetPlan
            });
            for (const attempt of oldAttempts){
                if (!attempt.sessionId) throw Error('An earlier checkout needs reconciliation.');
                const session = await stripe.checkout.sessions.retrieve(attempt.sessionId);
                if (session.status === 'complete') throw Error('An earlier payment is being confirmed.');
                if (session.status === 'open') await stripe.checkout.sessions.expire(session.id);
                await trx('billingCheckoutAttempts').where({
                    id: attempt.id
                }).update({
                    status: 'expired'
                });
            }
            await trx('workspaceSubscriptions').where({
                workspaceId
            }).update({
                subscriptionId: null,
                plan: 'free',
                status: 'free',
                intendedPlan: quote.targetPlan,
                cancelAtPeriodEnd: false,
                paidThrough: null,
                recoveryUntil: null
            });
        });
        if (refresh) await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$events$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["reconcileWorkspaceSubscription"])(db, workspaceId);
        const row = await db('workspaceSubscriptions').where({
            workspaceId
        }).first();
        if (row.plan !== 'free') {
            await db('billingPlanChanges').where({
                id: quoteId,
                workspaceId
            }).update({
                state: 'complete'
            });
            return {
                status: 'complete'
            };
        }
        const checkout = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createWorkspaceCheckout"])(db, userId, workspaceId, process.env.BETTER_AUTH_URL);
        return {
            status: 'payment',
            paymentUI: 'checkout',
            clientSecret: checkout.clientSecret
        };
    }
    const result = await db.transaction(async (trx)=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lockWorkspaceBilling"])(trx, workspaceId);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ownerBilling"])(trx, userId, workspaceId);
        const quote = await trx('billingPlanChanges').where({
            id: quoteId,
            workspaceId,
            actorId: userId
        }).forUpdate().first();
        if ([
            'complete',
            'scheduled'
        ].includes(quote.state)) return {
            status: quote.state
        };
        if (Date.now() - new Date(quote.createdAt).getTime() > 23 * 3600000) throw Error('This change needs reconciliation before retrying.');
        const row = await trx('workspaceSubscriptions').where({
            workspaceId
        }).first();
        let sub = await subscription(stripe, row, workspaceId);
        if (!sub || sub.id !== quote.basis.id) throw Error('Subscription changed.');
        if (policy.requireActivePaidSubscription && (sub.status !== 'active' || quote.state !== 'payment' && (sub.pending_update || sub.schedule || sub.cancel_at_period_end) || quote.state === 'payment' && (sub.schedule || sub.cancel_at_period_end))) {
            throw Error('Subscription changed. Review again.');
        }
        if (quote.kind === 'downgrade' || quote.kind === 'free') await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertCaptureDowngrade"])(trx, workspaceId, quote.targetPlan, new Date(quote.basis.end * 1000));
        if (quote.kind === 'upgrade') {
            if (quote.state === 'applying') await stripe.subscriptions.update(sub.id, {
                payment_settings: {
                    save_default_payment_method: 'on_subscription',
                    payment_method_types: [
                        'card'
                    ]
                }
            }, {
                idempotencyKey: `salesmora-save-payment-${quote.id}`
            });
            if (quote.state === 'applying') sub = await stripe.subscriptions.update(sub.id, {
                items: [
                    {
                        id: sub.items.data[0].id,
                        price: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripePlanPrice"])(quote.targetPlan)
                    }
                ],
                payment_behavior: 'pending_if_incomplete',
                proration_behavior: 'always_invoice',
                proration_date: quote.prorationAt,
                expand: [
                    'latest_invoice.confirmation_secret'
                ]
            }, {
                idempotencyKey: `salesmora-plan-${quote.id}`
            });
            const invoice = typeof sub.latest_invoice === 'object' ? sub.latest_invoice : null;
            if (sub.pending_update) {
                await trx('billingPlanChanges').where({
                    id: quote.id
                }).update({
                    state: 'payment'
                });
                return {
                    status: 'payment',
                    paymentUI: 'card',
                    clientSecret: invoice?.confirmation_secret?.client_secret ?? undefined
                };
            }
            if (!sub.pending_update && invoice?.status === 'void' && sub.items.data[0].price.id !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripePlanPrice"])(quote.targetPlan)) {
                await trx('billingPlanChanges').where({
                    id: quote.id
                }).update({
                    state: 'expired'
                });
                return {
                    status: 'expired'
                };
            }
            if (sub.items.data[0].price.id !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripePlanPrice"])(quote.targetPlan) || invoice?.status !== 'paid') throw Error('Payment has not been verified.');
        } else if (quote.kind === 'free') {
            await stripe.subscriptions.update(sub.id, {
                cancel_at_period_end: true
            }, {
                idempotencyKey: `salesmora-plan-${quote.id}`
            });
        } else {
            let scheduleId = quote.scheduleId;
            if (!scheduleId) {
                const schedule = await stripe.subscriptionSchedules.create({
                    from_subscription: sub.id
                }, {
                    idempotencyKey: `salesmora-schedule-${quote.id}`
                });
                scheduleId = schedule.id;
                await trx('billingPlanChanges').where({
                    id: quote.id
                }).update({
                    scheduleId
                });
            }
            await stripe.subscriptionSchedules.update(scheduleId, {
                end_behavior: 'release',
                proration_behavior: 'none',
                phases: [
                    {
                        start_date: quote.basis.start,
                        end_date: quote.basis.end,
                        items: [
                            {
                                price: quote.basis.price,
                                quantity: 1
                            }
                        ],
                        proration_behavior: 'none'
                    },
                    {
                        start_date: quote.basis.end,
                        duration: {
                            interval: 'month',
                            interval_count: 1
                        },
                        items: [
                            {
                                price: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripePlanPrice"])(quote.targetPlan),
                                quantity: 1
                            }
                        ],
                        proration_behavior: 'none'
                    }
                ]
            }, {
                idempotencyKey: `salesmora-phases-${quote.id}`
            });
        }
        const status = quote.kind === 'upgrade' ? 'complete' : 'scheduled';
        await trx('billingPlanChanges').where({
            id: quote.id
        }).update({
            state: status
        });
        await trx('billingAudit').insert({
            workspaceId,
            actorId: policy.auditActorId ?? userId,
            action: 'plan.changed',
            details: JSON.stringify({
                quoteId: quote.id,
                plan: quote.targetPlan,
                status,
                amountDue: quote.amountDue
            })
        });
        return {
            status
        };
    });
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$events$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["reconcileWorkspaceSubscription"])(db, workspaceId, stripe);
    return result;
}
async function confirmPlanChange(db, userId, workspaceId, quoteId, refresh = false, provider) {
    return confirmPlanChangeFor(db, userId, workspaceId, quoteId, refresh, provider);
}
async function confirmAdminPlanChange(db, staffUserId, workspaceId, quoteId, provider) {
    const quote = await db.transaction(async (trx)=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lockWorkspaceBilling"])(trx, workspaceId);
        const ownerId = await workspaceOwnerId(trx, workspaceId);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ownerBilling"])(trx, ownerId, workspaceId);
        const record = await trx('billingPlanChanges').where({
            id: quoteId,
            workspaceId,
            actorId: ownerId
        }).forUpdate().first();
        if (!record) throw Error('Unknown quote.');
        if (record.kind === 'checkout') throw Error('Admin plan changes cannot start checkout.');
        if (![
            'upgrade',
            'downgrade',
            'free'
        ].includes(record.kind)) throw Error('Unsupported admin plan change.');
        const effectiveAt = record.kind === 'upgrade' ? record.prorationAt : record.basis?.end;
        if (!Number.isSafeInteger(effectiveAt) || effectiveAt <= 0) throw Error('Plan change effective date is unavailable.');
        return {
            ownerId,
            plan: record.targetPlan,
            effectiveAt: new Date(effectiveAt * 1000).toISOString()
        };
    });
    const result = await confirmPlanChangeFor(db, quote.ownerId, workspaceId, quoteId, false, provider, {
        allowCheckout: false,
        requireActivePaidSubscription: true,
        auditActorId: `admin:${staffUserId}`
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$billing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminWorkspacePlanChangeResultSchema"].parse({
        status: result.status === 'payment' ? 'customer_action_required' : result.status,
        plan: quote.plan,
        effectiveAt: quote.effectiveAt,
        ...result.status === 'payment' ? {
            handoff: 'workspace_owner_billing'
        } : {}
    });
}
async function undoPlanChange(db, userId, workspaceId, quoteId) {
    const stripe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripeSandbox"])();
    await db.transaction(async (trx)=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lockWorkspaceBilling"])(trx, workspaceId);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ownerBilling"])(trx, userId, workspaceId);
        const quote = await trx('billingPlanChanges').where({
            id: quoteId,
            workspaceId
        }).forUpdate().first();
        if (quote?.state === 'cancelled') return;
        if (!quote || quote.state !== 'scheduled' || quote.basis.end * 1000 <= Date.now()) throw Error('Scheduled change is no longer reversible.');
        const row = await trx('workspaceSubscriptions').where({
            workspaceId
        }).first();
        const sub = await subscription(stripe, row, workspaceId);
        if (!sub || sub.id !== quote.basis.id || sub.status !== 'active' || sub.items.data[0].price.id !== quote.basis.price) throw Error('Subscription changed.');
        if (quote.kind === 'free') await stripe.subscriptions.update(sub.id, {
            cancel_at_period_end: false
        }, {
            idempotencyKey: `salesmora-undo-${quote.id}`
        });
        else {
            if (id(sub.schedule) && id(sub.schedule) !== quote.scheduleId) throw Error('Schedule mapping changed.');
            const schedule = await stripe.subscriptionSchedules.retrieve(quote.scheduleId);
            if (id(schedule.customer) !== row.customerId || schedule.livemode) throw Error('Schedule mapping changed.');
            if (schedule.status !== 'released') await stripe.subscriptionSchedules.release(quote.scheduleId, {
                preserve_cancel_date: false
            }, {
                idempotencyKey: `salesmora-undo-${quote.id}`
            });
        }
        await trx('billingPlanChanges').where({
            id: quote.id
        }).update({
            state: 'cancelled'
        });
        await trx('billingAudit').insert({
            workspaceId,
            actorId: userId,
            action: 'plan.schedule-undone',
            details: JSON.stringify({
                quoteId: quote.id
            })
        });
    });
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$events$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["reconcileWorkspaceSubscription"])(db, workspaceId);
    return {
        status: 'complete'
    };
}
}),
"[project]/packages/data/src/billing/payment-methods.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prepareWorkspaceCard",
    ()=>prepareWorkspaceCard,
    "reconcileWorkspaceCards",
    ()=>reconcileWorkspaceCards,
    "saveWorkspaceCard",
    ()=>saveWorkspaceCard
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$billing$2d$payment$2d$method$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/billing-payment-method.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/checkout.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/stripe.ts [app-route] (ecmascript)");
;
;
;
;
const id = (v)=>typeof v === 'string' ? v : v?.id ?? null;
async function mapping(trx, stripe, userId, workspaceId) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ownerBilling"])(trx, userId, workspaceId);
    const row = await trx('workspaceSubscriptions').where({
        workspaceId
    }).forUpdate().first();
    if (!row?.customerId || !row.subscriptionId) throw Error('Subscription required');
    if (await trx('billingRenewalRecoveries').where({
        workspaceId
    }).whereIn('state', [
        'applying',
        'action',
        'pending'
    ]).first()) throw Error('Resolve renewal payment first');
    if (await trx('billingPlanChanges').where({
        workspaceId
    }).whereIn('state', [
        'applying',
        'payment'
    ]).first()) throw Error('Resolve plan payment first');
    const customer = await stripe.customers.retrieve(row.customerId);
    const sub = await stripe.subscriptions.retrieve(row.subscriptionId);
    if (customer.deleted || customer.livemode || customer.metadata.workspaceId !== workspaceId || sub.livemode || id(sub.customer) !== customer.id || sub.metadata.workspaceId !== workspaceId || ![
        'active',
        'past_due',
        'unpaid'
    ].includes(sub.status)) throw Error('Billing mapping changed');
    return {
        customer,
        sub
    };
}
async function verifiedCard(stripe, setupId, row) {
    const setup = await stripe.setupIntents.retrieve(setupId);
    if (setup.livemode || id(setup.customer) !== row.customerId || setup.metadata?.workspaceId !== row.workspaceId || setup.metadata?.attemptId !== row.id || setup.usage !== 'off_session') throw Error('Setup scope mismatch');
    if (setup.status !== 'succeeded') return {
        setup,
        method: null
    };
    const methodId = id(setup.payment_method);
    if (!methodId) throw Error('Missing verified card');
    const method = await stripe.paymentMethods.retrieve(methodId);
    if (method.livemode || id(method.customer) !== row.customerId || method.type !== 'card' || !method.card) throw Error('Card scope mismatch');
    return {
        setup,
        method
    };
}
async function prepareWorkspaceCard(db, userId, workspaceId) {
    const stripe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripeSandbox"])();
    const attemptId = await db.transaction(async (trx)=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lockWorkspaceBilling"])(trx, workspaceId);
        const { customer, sub } = await mapping(trx, stripe, userId, workspaceId);
        const existing = await trx('billingPaymentMethods').where({
            workspaceId
        }).whereIn('state', [
            'creating',
            'ready',
            'applying'
        ]).orderBy('createdAt', 'desc').first();
        if (existing) {
            if (existing.state === 'applying') throw Error('Card update requires reconciliation');
            const stale = existing.actorId !== userId || existing.customerId !== customer.id || existing.subscriptionId !== sub.id || existing.customerDefault !== id(customer.invoice_settings.default_payment_method) || existing.subscriptionDefault !== id(sub.default_payment_method);
            if (!stale) return existing.id;
            if (!existing.setupIntentId) throw Error('Setup creation requires reconciliation');
            const { setup } = await verifiedCard(stripe, existing.setupIntentId, existing);
            if (![
                'succeeded',
                'canceled'
            ].includes(setup.status)) await stripe.setupIntents.cancel(setup.id);
            await trx('billingPaymentMethods').where({
                id: existing.id
            }).update({
                state: 'cancelled'
            });
        }
        const attempt = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
        await trx('billingPaymentMethods').insert({
            id: attempt,
            workspaceId,
            actorId: userId,
            customerId: customer.id,
            subscriptionId: sub.id,
            customerDefault: id(customer.invoice_settings.default_payment_method),
            subscriptionDefault: id(sub.default_payment_method)
        });
        return attempt;
    });
    return db.transaction(async (trx)=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lockWorkspaceBilling"])(trx, workspaceId);
        const current = await mapping(trx, stripe, userId, workspaceId);
        const row = await trx('billingPaymentMethods').where({
            id: attemptId,
            workspaceId,
            actorId: userId
        }).forUpdate().first();
        if (!row || ![
            'creating',
            'ready'
        ].includes(row.state) || row.customerId !== current.customer.id || row.subscriptionId !== current.sub.id) throw Error('Card update changed');
        if (!row.setupIntentId) {
            if (Date.now() - new Date(row.createdAt).getTime() > 23 * 3600000) throw Error('Setup creation requires reconciliation');
            const setup = await stripe.setupIntents.create({
                customer: row.customerId,
                allowed_payment_method_types: [
                    'card'
                ],
                usage: 'off_session',
                metadata: {
                    workspaceId,
                    attemptId
                }
            }, {
                idempotencyKey: `salesmora-card-setup-${attemptId}`
            });
            if (setup.livemode) throw Error('Unexpected provider mode');
            row.setupIntentId = setup.id;
            await trx('billingPaymentMethods').where({
                id: attemptId
            }).update({
                setupIntentId: setup.id,
                state: 'ready'
            });
        }
        const { setup, method } = await verifiedCard(stripe, row.setupIntentId, row);
        if (setup.status === 'canceled' || !setup.client_secret) {
            await trx('billingPaymentMethods').where({
                id: attemptId
            }).update({
                state: 'cancelled'
            });
            return null;
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$billing$2d$payment$2d$method$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["billingPaymentMethodPreparationSchema"].parse({
            attemptId,
            clientSecret: setup.client_secret,
            confirmed: !!method,
            card: method?.card ? {
                brand: method.card.brand,
                last4: method.card.last4,
                expMonth: method.card.exp_month,
                expYear: method.card.exp_year
            } : null
        });
    });
}
async function saveWorkspaceCard(db, userId, workspaceId, attemptId) {
    const stripe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripeSandbox"])();
    await db.transaction(async (trx)=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lockWorkspaceBilling"])(trx, workspaceId);
        const { customer, sub } = await mapping(trx, stripe, userId, workspaceId);
        const row = await trx('billingPaymentMethods').where({
            id: attemptId,
            workspaceId,
            actorId: userId
        }).forUpdate().first();
        if (!row || !row.setupIntentId || ![
            'ready',
            'applying',
            'complete'
        ].includes(row.state) || row.customerId !== customer.id || row.subscriptionId !== sub.id) throw Error('Card update changed');
        if (row.state !== 'ready') return;
        if (row.customerDefault !== id(customer.invoice_settings.default_payment_method) || row.subscriptionDefault !== id(sub.default_payment_method)) throw Error('Default card changed elsewhere');
        const { method } = await verifiedCard(stripe, row.setupIntentId, row);
        if (!method) throw Error('Card verification incomplete');
        await trx('billingPaymentMethods').where({
            id: attemptId
        }).update({
            state: 'applying',
            paymentMethodId: method.id,
            consentedAt: trx.fn.now()
        });
    });
    await applyWorkspaceCard(db, userId, workspaceId, attemptId);
    return {
        saved: true
    };
}
async function applyWorkspaceCard(db, userId, workspaceId, attemptId) {
    const stripe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripeSandbox"])();
    await db.transaction(async (trx)=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lockWorkspaceBilling"])(trx, workspaceId);
        const { customer, sub } = await mapping(trx, stripe, userId, workspaceId);
        const row = await trx('billingPaymentMethods').where({
            id: attemptId,
            workspaceId,
            actorId: userId
        }).forUpdate().first();
        if (row?.state === 'complete') return;
        if (!row || row.state !== 'applying' || !row.consentedAt || !row.setupIntentId || row.customerId !== customer.id || row.subscriptionId !== sub.id) throw Error('Card update changed');
        const { method } = await verifiedCard(stripe, row.setupIntentId, row);
        if (!method || method.id !== row.paymentMethodId) throw Error('Verified card changed');
        const customerDefault = id(customer.invoice_settings.default_payment_method), subscriptionDefault = id(sub.default_payment_method);
        if (![
            row.customerDefault,
            method.id
        ].includes(customerDefault) || ![
            row.subscriptionDefault,
            method.id
        ].includes(subscriptionDefault)) throw Error('Default card changed elsewhere');
        if ((customerDefault !== method.id || subscriptionDefault !== method.id) && Date.now() - new Date(row.consentedAt).getTime() > 23 * 3600000) throw Error('Card update requires reconciliation');
        if (customerDefault !== method.id) await stripe.customers.update(customer.id, {
            invoice_settings: {
                default_payment_method: method.id
            }
        }, {
            idempotencyKey: `salesmora-card-customer-${attemptId}`
        });
        if (subscriptionDefault !== method.id) await stripe.subscriptions.update(sub.id, {
            default_payment_method: method.id
        }, {
            idempotencyKey: `salesmora-card-subscription-${attemptId}`
        });
        // Confirm both defaults before the UI can claim success, including a partial-write recovery.
        const verified = await mapping(trx, stripe, userId, workspaceId);
        if (id(verified.customer.invoice_settings.default_payment_method) !== method.id || id(verified.sub.default_payment_method) !== method.id) throw Error('Default card update unverified');
        await trx('billingPaymentMethods').where({
            id: attemptId
        }).update({
            state: 'complete',
            completedAt: trx.fn.now()
        });
        await trx('billingAudit').insert({
            workspaceId,
            actorId: userId,
            action: 'payment_method.updated',
            details: JSON.stringify({
                attemptId
            })
        });
    });
}
async function reconcileWorkspaceCards(db) {
    const rows = await db('billingPaymentMethods').where({
        state: 'applying'
    }).where('retryAt', '<=', db.fn.now()).orderBy('retryAt').limit(10).select('id', 'workspaceId', 'actorId', 'attempts');
    for (const row of rows){
        try {
            await applyWorkspaceCard(db, row.actorId, row.workspaceId, row.id);
        } catch  {
            await db('billingPaymentMethods').where({
                id: row.id,
                state: 'applying'
            }).update({
                attempts: db.raw('attempts + 1'),
                retryAt: new Date(Date.now() + Math.min(3600000, 30000 * 2 ** Math.min(Number(row.attempts), 7)))
            });
            console.error(JSON.stringify({
                event: 'worker.card_update_retry_pending'
            }));
        }
    }
}
}),
"[project]/packages/data/src/billing/payment-recovery.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cancelAdminRenewalRecovery",
    ()=>cancelAdminRenewalRecovery,
    "confirmRenewalRecovery",
    ()=>confirmRenewalRecovery,
    "extendAdminRecoveryGrace",
    ()=>extendAdminRecoveryGrace,
    "previewAdminRenewalRecovery",
    ()=>previewAdminRenewalRecovery,
    "previewRenewalRecovery",
    ()=>previewRenewalRecovery,
    "reconcileRenewalRecoveries",
    ()=>reconcileRenewalRecoveries,
    "renewalRecoveryStatus",
    ()=>renewalRecoveryStatus,
    "retryAdminRenewalRecovery",
    ()=>retryAdminRenewalRecovery
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$recovery$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/admin/recovery.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$payment$2d$recovery$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/payment-recovery.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/checkout.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/stripe.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$events$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/events.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$recovery$2d$grace$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/recovery-grace.ts [app-route] (ecmascript)");
;
;
;
;
;
;
const id = (value)=>typeof value === 'string' ? value : value?.id ?? null;
const active = [
    'applying',
    'action',
    'pending'
];
const empty = {
    status: 'unavailable',
    quoteId: null,
    expiresAt: null,
    invoice: null,
    card: null
};
const DAY_MS = 24 * 60 * 60 * 1000;
function dateISO(value) {
    return value == null ? null : new Date(value).toISOString();
}
function paymentState(payment) {
    if (!payment) return 'none';
    if ([
        'processing',
        'requires_action',
        'succeeded',
        'requires_payment_method'
    ].includes(payment.status)) return payment.status;
    return 'other';
}
async function mapping(trx, stripe, userId, workspaceId, invoiceId, options = {}) {
    if (options.authorizeOwner ?? true) await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ownerBilling"])(trx, userId, workspaceId);
    else {
        const workspaceQuery = trx('workspaces').where({
            id: workspaceId
        }).whereNull('deletionRequestedAt');
        if (trx.isTransaction) workspaceQuery.forShare();
        const workspace = await workspaceQuery.first('ownerId');
        if (!workspace || options.requireCurrentOwner && workspace.ownerId !== userId) throw Error('Workspace owner mapping changed.');
    }
    const row = await trx('workspaceSubscriptions').where({
        workspaceId
    }).forUpdate().first();
    if (!row?.customerId || !row.subscriptionId) throw Error('Missing subscription');
    const customer = await stripe.customers.retrieve(row.customerId);
    const sub = await stripe.subscriptions.retrieve(row.subscriptionId);
    if (customer.deleted || customer.livemode || customer.metadata.workspaceId !== workspaceId || sub.livemode || id(sub.customer) !== customer.id || sub.metadata.workspaceId !== workspaceId || ![
        'active',
        'past_due',
        'unpaid'
    ].includes(sub.status) || sub.pending_update || sub.items.data.length !== 1 || ![
        'standard',
        'premium'
    ].some((plan)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripePlanPrice"])(plan) === sub.items.data[0].price.id)) throw Error('Billing scope changed');
    if (await trx('billingPlanChanges').where({
        workspaceId
    }).whereIn('state', [
        'applying',
        'payment'
    ]).first()) throw Error('Resolve plan payment first');
    const target = invoiceId ?? id(sub.latest_invoice);
    if (!target) throw Error('No renewal invoice');
    const invoice = await stripe.invoices.retrieve(target);
    if (invoice.livemode || id(invoice.customer) !== customer.id || id(invoice.parent?.subscription_details?.subscription) !== sub.id || invoice.billing_reason !== 'subscription_cycle' || invoice.currency !== 'usd' || invoice.collection_method !== 'charge_automatically') throw Error('Unsupported renewal invoice');
    const methodId = id(sub.default_payment_method) ?? id(customer.invoice_settings.default_payment_method);
    const method = methodId ? await stripe.paymentMethods.retrieve(methodId) : null;
    if (method && (method.livemode || id(method.customer) !== customer.id || method.type !== 'card' || !method.card)) throw Error('Card scope changed');
    return {
        customer,
        sub,
        invoice,
        method,
        card: method?.card ? {
            brand: method.card.brand,
            last4: method.card.last4,
            expMonth: method.card.exp_month,
            expYear: method.card.exp_year
        } : null
    };
}
function invoiceView(invoice) {
    return {
        number: invoice.number ?? invoice.id,
        description: invoice.lines.data[0]?.description ?? '',
        periodStart: new Date((invoice.lines.data[0]?.period.start ?? invoice.period_start) * 1000).toISOString(),
        periodEnd: new Date((invoice.lines.data[0]?.period.end ?? invoice.period_end) * 1000).toISOString(),
        total: invoice.total,
        amountPaid: invoice.amount_paid,
        amountDue: invoice.amount_remaining
    };
}
function result(row, current, status, clientSecret) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$payment$2d$recovery$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["paymentRecoveryResultSchema"].parse({
        status,
        quoteId: row.id,
        expiresAt: new Date(row.expiresAt).toISOString(),
        invoice: invoiceView(current.invoice),
        card: current.card,
        ...clientSecret ? {
            clientSecret
        } : {}
    });
}
/** Inspect the invoice's linked default PaymentIntent; never create a standalone charge. */ async function intent(stripe, current) {
    const payments = await stripe.invoicePayments.list({
        invoice: current.invoice.id,
        status: 'open',
        limit: 100,
        expand: [
            'data.payment.payment_intent'
        ]
    });
    if (payments.has_more) throw Error('Ambiguous invoice payments');
    const defaults = payments.data.filter((p)=>p.is_default && p.payment.type === 'payment_intent');
    if (defaults.length > 1 || payments.data.some((p)=>p.livemode || id(p.invoice) !== current.invoice.id || p.currency !== 'usd')) throw Error('Payment scope mismatch');
    const raw = defaults[0]?.payment.payment_intent;
    const payment = typeof raw === 'string' ? await stripe.paymentIntents.retrieve(raw) : raw;
    if (payment && (payment.livemode || id(payment.customer) !== current.customer.id || payment.currency !== 'usd')) throw Error('Intent scope mismatch');
    return payment ?? null;
}
async function observe(trx, stripe, row, current, declined = false) {
    if (current.invoice.status === 'paid') {
        await trx('billingRenewalRecoveries').where({
            id: row.id
        }).update({
            state: 'paid'
        });
        return result(row, current, row.attemptedAt ? 'paid' : 'already-paid');
    }
    if (current.invoice.status !== 'open' || current.invoice.amount_remaining !== row.amountDue) {
        await trx('billingRenewalRecoveries').where({
            id: row.id
        }).update({
            state: 'changed'
        });
        return result(row, current, 'changed');
    }
    const payment = await intent(stripe, current);
    if (payment?.status === 'requires_action' && row.attemptedAt && id(payment.payment_method) === row.paymentMethodId && payment.amount === row.amountDue && payment.client_secret) {
        await trx('billingRenewalRecoveries').where({
            id: row.id
        }).update({
            state: 'action'
        });
        return result(row, current, 'authenticating', payment.client_secret);
    }
    if (declined && (!payment || payment.status === 'requires_payment_method')) {
        await trx('billingRenewalRecoveries').where({
            id: row.id
        }).update({
            state: 'declined'
        });
        return result(row, current, 'declined');
    }
    await trx('billingRenewalRecoveries').where({
        id: row.id
    }).update({
        state: 'pending'
    });
    return result(row, current, 'pending');
}
async function reconcilePaid(db, workspaceId, value, stripe) {
    if (![
        'paid',
        'already-paid'
    ].includes(value.status)) return value;
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$events$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["reconcileWorkspaceSubscription"])(db, workspaceId, stripe);
        if (value.quoteId) await db('billingRenewalRecoveries').where({
            id: value.quoteId,
            state: 'paid'
        }).update({
            reconciledAt: db.fn.now()
        });
        return value;
    } catch  {
        console.error(JSON.stringify({
            event: 'billing.renewal_recovery_reconciliation_failed',
            workspaceId
        }));
        return {
            ...value,
            status: 'pending'
        };
    }
}
async function previewRenewalRecovery(db, userId, workspaceId, provider) {
    const stripe = provider ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripeSandbox"])();
    const value = await db.transaction(async (trx)=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lockWorkspaceBilling"])(trx, workspaceId);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ownerBilling"])(trx, userId, workspaceId);
        const pending = await trx('billingRenewalRecoveries').where({
            workspaceId
        }).whereNull('retryCancelledAt').whereIn('state', active).orderBy('createdAt', 'desc').first();
        if (pending) {
            if (pending.actorId !== userId) throw Error('Recovery actor changed');
            const current = await mapping(trx, stripe, userId, workspaceId, pending.invoiceId);
            return observe(trx, stripe, pending, current);
        }
        const current = await mapping(trx, stripe, userId, workspaceId);
        if (![
            'open',
            'paid'
        ].includes(current.invoice.status ?? '')) return empty;
        const quote = {
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workspaceId,
            actorId: userId,
            customerId: current.customer.id,
            subscriptionId: current.sub.id,
            invoiceId: current.invoice.id,
            paymentMethodId: current.method?.id ?? null,
            amountDue: current.invoice.amount_remaining,
            invoice: JSON.stringify(invoiceView(current.invoice)),
            expiresAt: new Date(Date.now() + 600000),
            state: current.invoice.status === 'paid' ? 'paid' : 'quoted'
        };
        await trx('billingRenewalRecoveries').insert(quote);
        return result(quote, current, current.invoice.status === 'paid' ? 'already-paid' : 'review');
    });
    return reconcilePaid(db, workspaceId, value, stripe);
}
async function confirmRenewalRecovery(db, userId, workspaceId, quoteId) {
    const stripe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripeSandbox"])();
    const initial = await db.transaction(async (trx)=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lockWorkspaceBilling"])(trx, workspaceId);
        const current = await mapping(trx, stripe, userId, workspaceId, (await trx('billingRenewalRecoveries').where({
            id: quoteId,
            workspaceId,
            actorId: userId
        }).first())?.invoiceId);
        const row = await trx('billingRenewalRecoveries').where({
            id: quoteId,
            workspaceId,
            actorId: userId
        }).forUpdate().first();
        if (!row || row.customerId !== current.customer.id || row.subscriptionId !== current.sub.id) throw Error('Unknown recovery');
        if (current.invoice.status === 'paid') return observe(trx, stripe, row, current);
        if (row.state !== 'quoted') {
            if (active.includes(row.state)) return observe(trx, stripe, row, current);
            return result(row, current, row.state === 'declined' ? 'declined' : 'changed');
        }
        if (new Date(row.expiresAt).getTime() <= Date.now() || current.invoice.status !== 'open' || row.amountDue !== current.invoice.amount_remaining || row.paymentMethodId !== current.method?.id || row.amountDue <= 0) {
            await trx('billingRenewalRecoveries').where({
                id: quoteId
            }).update({
                state: 'changed'
            });
            return result(row, current, 'changed');
        }
        if (await trx('billingRenewalRecoveries').where({
            workspaceId
        }).whereNot({
            id: quoteId
        }).whereIn('state', active).first()) throw Error('Payment already pending');
        const payment = await intent(stripe, current);
        if (payment && [
            'processing',
            'succeeded',
            'requires_capture'
        ].includes(payment.status)) return result(row, current, 'pending');
        await trx('billingRenewalRecoveries').where({
            id: quoteId
        }).update({
            state: 'applying',
            attemptedAt: trx.fn.now()
        });
        return null;
    });
    if (initial) return reconcilePaid(db, workspaceId, initial);
    return executeRenewalRecovery(db, userId, workspaceId, quoteId, stripe);
}
async function executeRenewalRecovery(db, userId, workspaceId, quoteId, provider, automatic = false, adminAction = false) {
    const stripe = provider ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripeSandbox"])();
    const value = await db.transaction(async (trx)=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lockWorkspaceBilling"])(trx, workspaceId);
        const row = await trx('billingRenewalRecoveries').where({
            id: quoteId,
            workspaceId,
            actorId: userId
        }).forUpdate().first();
        if (!row) throw Error('Unknown recovery');
        let current = await mapping(trx, stripe, userId, workspaceId, row.invoiceId, adminAction ? {
            authorizeOwner: false,
            requireCurrentOwner: true
        } : undefined);
        if (row.customerId !== current.customer.id || row.subscriptionId !== current.sub.id) throw Error('Recovery mapping changed');
        if (automatic && row.retryCancelledAt) return result(row, current, 'pending');
        if (row.state === 'paid') return result(row, current, 'paid');
        if (!active.includes(row.state)) return result(row, current, row.state === 'declined' ? 'declined' : 'changed');
        if (current.invoice.status === 'paid') return observe(trx, stripe, row, current);
        const payment = await intent(stripe, current);
        if (payment && [
            'requires_action',
            'processing',
            'succeeded',
            'requires_capture'
        ].includes(payment.status)) {
            if (payment.status !== 'requires_action' || id(payment.payment_method) === row.paymentMethodId) return observe(trx, stripe, row, current);
        }
        if (!row.attemptedAt || Date.now() - new Date(row.attemptedAt).getTime() > 23 * 3600000) return result(row, current, 'pending');
        if (current.invoice.status !== 'open' || current.invoice.amount_remaining !== row.amountDue || current.method?.id !== row.paymentMethodId) return observe(trx, stripe, row, current);
        let declined = false;
        try {
            await stripe.invoices.pay(row.invoiceId, {
                payment_method: row.paymentMethodId,
                off_session: false
            }, {
                idempotencyKey: `salesmora-renewal-${row.id}`
            });
        } catch (error) {
            declined = typeof error === 'object' && error !== null && 'type' in error && error.type === 'StripeCardError';
        }
        current = await mapping(trx, stripe, userId, workspaceId, row.invoiceId, adminAction ? {
            authorizeOwner: false,
            requireCurrentOwner: true
        } : undefined);
        const next = await observe(trx, stripe, row, current, declined);
        if (next.status === 'paid') await trx('billingAudit').insert({
            workspaceId,
            actorId: userId,
            action: 'renewal.payment_verified',
            details: JSON.stringify({
                quoteId: row.id,
                amount: row.amountDue
            })
        });
        return next;
    });
    return reconcilePaid(db, workspaceId, value, stripe);
}
async function renewalRecoveryStatus(db, userId, workspaceId, quoteId) {
    const stripe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripeSandbox"])();
    const value = await db.transaction(async (trx)=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lockWorkspaceBilling"])(trx, workspaceId);
        const row = await trx('billingRenewalRecoveries').where({
            id: quoteId,
            workspaceId,
            actorId: userId
        }).first();
        if (!row) throw Error('Unknown recovery');
        const current = await mapping(trx, stripe, userId, workspaceId, row.invoiceId);
        if (row.customerId !== current.customer.id || row.subscriptionId !== current.sub.id) throw Error('Recovery mapping changed');
        if (current.invoice.status === 'paid') return observe(trx, stripe, row, current);
        if (row.state === 'quoted') {
            const payment = await intent(stripe, current);
            if (payment && [
                'processing',
                'succeeded',
                'requires_capture'
            ].includes(payment.status)) return result(row, current, 'pending');
            return result(row, current, current.invoice.status === 'open' && new Date(row.expiresAt).getTime() > Date.now() && row.amountDue === current.invoice.amount_remaining && row.paymentMethodId === current.method?.id ? 'review' : 'changed');
        }
        if (!active.includes(row.state)) return result(row, current, row.state === 'declined' ? 'declined' : 'changed');
        return observe(trx, stripe, row, current);
    });
    return reconcilePaid(db, workspaceId, value);
}
async function reconcileRenewalRecoveries(db, provider) {
    const stripe = provider ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripeSandbox"])();
    const rows = await db('billingRenewalRecoveries').whereNull('retryCancelledAt').where((q)=>q.whereIn('state', active).orWhere((s)=>s.where({
                state: 'paid'
            }).whereNull('reconciledAt'))).where('retryAt', '<=', db.fn.now()).orderBy('retryAt').limit(10);
    for (const row of rows){
        try {
            await executeRenewalRecovery(db, row.actorId, row.workspaceId, row.id, stripe, true);
        } catch  {
            console.error(JSON.stringify({
                event: 'worker.renewal_recovery_retry_pending'
            }));
        }
        await db('billingRenewalRecoveries').where({
            id: row.id
        }).whereNull('retryCancelledAt').update({
            attempts: db.raw('attempts + 1'),
            retryAt: new Date(Date.now() + Math.min(3600000, 5000 * 2 ** Math.min(Number(row.attempts), 9)))
        });
    }
}
async function previewAdminRenewalRecovery(trx, workspaceId, provider) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lockWorkspaceBilling"])(trx, workspaceId);
    const workspace = await trx('workspaces').where({
        id: workspaceId
    }).whereNull('deletionRequestedAt').first('ownerId');
    if (!workspace) throw Error('Workspace unavailable.');
    const subscription = await trx('workspaceSubscriptions').where({
        workspaceId
    }).first();
    if (subscription?.subscriptionId && !subscription.customerId) throw Error('Workspace billing mapping is incomplete.');
    if (!subscription?.customerId || !subscription.subscriptionId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$recovery$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminWorkspaceRecoveryPreviewResponseSchema"].parse({
            workspaceId,
            providerStatus: 'not_linked',
            invoice: null,
            paymentState: 'none',
            recovery: null,
            grace: {
                currentUntil: null,
                maximumUntil: null,
                additionalDaysAvailable: 0
            }
        });
    }
    const stripe = provider ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripeSandbox"])();
    const current = await mapping(trx, stripe, workspace.ownerId, workspaceId, undefined, {
        authorizeOwner: false
    });
    const payment = await intent(stripe, current);
    const createdAt = new Date(current.invoice.created * 1000);
    let graceCurrent = null;
    let graceMaximum = null;
    let additionalDaysAvailable = 0;
    if (current.sub.status === 'past_due') {
        const extension = await trx('billingRecoveryGraceExtensions').where({
            workspaceId,
            invoiceId: current.invoice.id,
            invoiceCreatedAt: createdAt
        }).max('extendedUntil as extendedUntil').first();
        const base = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$recovery$2d$grace$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initialRecoveryGraceUntil"])(createdAt);
        graceCurrent = extension?.extendedUntil ? new Date(Math.max(base.getTime(), new Date(extension.extendedUntil).getTime())) : base;
        graceMaximum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$recovery$2d$grace$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maximumRecoveryGraceUntil"])(createdAt);
        if (graceMaximum.getTime() > Date.now()) {
            additionalDaysAvailable = Math.max(0, Math.min(7, Math.floor((graceMaximum.getTime() - graceCurrent.getTime()) / DAY_MS)));
        }
    }
    const recovery = await trx('billingRenewalRecoveries').where({
        workspaceId,
        invoiceId: current.invoice.id
    }).orderBy('createdAt', 'desc').first();
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$recovery$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminWorkspaceRecoveryPreviewResponseSchema"].parse({
        workspaceId,
        providerStatus: 'available',
        invoice: {
            number: current.invoice.number,
            createdAt: createdAt.toISOString(),
            status: current.invoice.status,
            amountDue: current.invoice.amount_remaining
        },
        paymentState: paymentState(payment),
        recovery: recovery ? {
            id: recovery.id,
            state: recovery.state,
            amountDue: recovery.amountDue,
            attempts: recovery.attempts,
            createdAt: dateISO(recovery.createdAt),
            attemptedAt: dateISO(recovery.attemptedAt),
            retryAt: dateISO(recovery.retryAt),
            retriesCancelledAt: dateISO(recovery.retryCancelledAt)
        } : null,
        grace: {
            currentUntil: graceCurrent?.toISOString() ?? null,
            maximumUntil: graceMaximum?.toISOString() ?? null,
            additionalDaysAvailable
        }
    });
}
async function retryAdminRenewalRecovery(db, workspaceId, recoveryId, provider) {
    const recovery = await db('billingRenewalRecoveries').where({
        id: recoveryId,
        workspaceId
    }).first();
    if (!recovery || !active.includes(recovery.state) || !recovery.attemptedAt) throw Error('No Owner-confirmed recovery is available to retry.');
    const value = await executeRenewalRecovery(db, recovery.actorId, workspaceId, recoveryId, provider, false, true);
    if (!value.quoteId) throw Error('Recovery result is missing its recovery identifier.');
    if (value.status === 'authenticating') {
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$recovery$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminWorkspaceRecoveryResultSchema"].parse({
            status: 'owner_action_required',
            recoveryId: value.quoteId,
            handoff: 'workspace_owner_billing'
        });
    }
    if ([
        'paid',
        'already-paid',
        'declined',
        'changed',
        'pending'
    ].includes(value.status)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$recovery$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminWorkspaceRecoveryResultSchema"].parse({
            status: value.status === 'already-paid' ? 'already-paid' : value.status,
            recoveryId: value.quoteId
        });
    }
    throw Error('Recovery retry did not produce a safe staff result.');
}
async function extendAdminRecoveryGrace(db, workspaceId, additionalDays, provider) {
    if (!Number.isSafeInteger(additionalDays) || additionalDays < 1 || additionalDays > 7) throw Error('Grace extension must be between one and seven days.');
    const stripe = provider ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripeSandbox"])();
    const extend = async (trx)=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lockWorkspaceBilling"])(trx, workspaceId);
        const workspace = await trx('workspaces').where({
            id: workspaceId
        }).whereNull('deletionRequestedAt').first('ownerId');
        if (!workspace) throw Error('Workspace unavailable.');
        const current = await mapping(trx, stripe, workspace.ownerId, workspaceId, undefined, {
            authorizeOwner: false
        });
        if (current.sub.status !== 'past_due' || current.invoice.status !== 'open' || current.invoice.amount_remaining <= 0) throw Error('No open past-due renewal invoice can receive a grace extension.');
        const invoiceCreatedAt = new Date(current.invoice.created * 1000);
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$recovery$2d$grace$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maximumRecoveryGraceUntil"])(invoiceCreatedAt).getTime() <= Date.now()) throw Error('The invoice recovery grace window has expired.');
        const existing = await trx('billingRecoveryGraceExtensions').where({
            workspaceId,
            invoiceId: current.invoice.id,
            invoiceCreatedAt
        }).max('extendedUntil as extendedUntil').first();
        const extendedUntil = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$recovery$2d$grace$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["nextRecoveryGraceUntil"])(invoiceCreatedAt, existing?.extendedUntil ?? null, additionalDays);
        await trx('billingRecoveryGraceExtensions').insert({
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            workspaceId,
            invoiceId: current.invoice.id,
            invoiceCreatedAt,
            extendedUntil
        });
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$events$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["reconcileWorkspaceSubscription"])(trx, workspaceId, stripe);
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$recovery$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminWorkspaceRecoveryResultSchema"].parse({
            status: 'grace_extended',
            graceUntil: extendedUntil.toISOString()
        });
    };
    return db.isTransaction ? extend(db) : db.transaction(extend);
}
async function cancelAdminRenewalRecovery(db, workspaceId, recoveryId, provider) {
    const stripe = provider ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$stripe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripeSandbox"])();
    return db.transaction(async (trx)=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$checkout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lockWorkspaceBilling"])(trx, workspaceId);
        const row = await trx('billingRenewalRecoveries').where({
            id: recoveryId,
            workspaceId
        }).forUpdate().first();
        if (!row || !active.includes(row.state) || !row.attemptedAt) throw Error('No Owner-confirmed recovery is available to cancel.');
        const current = await mapping(trx, stripe, row.actorId, workspaceId, row.invoiceId, {
            authorizeOwner: false
        });
        if (current.invoice.status === 'paid') throw Error('Invoice is already paid; no recovery retries remain.');
        const payment = await intent(stripe, current);
        const providerState = paymentState(payment);
        if (!row.retryCancelledAt) {
            await trx('billingRenewalRecoveries').where({
                id: recoveryId,
                workspaceId
            }).whereNull('retryCancelledAt').update({
                retryCancelledAt: trx.fn.now()
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$admin$2f$recovery$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminWorkspaceRecoveryResultSchema"].parse({
            status: 'retries_cancelled',
            paymentState: providerState
        });
    });
}
}),
"[project]/packages/data/src/billing/plan-override.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PlanOverrideError",
    ()=>PlanOverrideError,
    "applyPlanOverride",
    ()=>applyPlanOverride,
    "clearPlanOverride",
    ()=>clearPlanOverride,
    "recordExpiredPlanOverrides",
    ()=>recordExpiredPlanOverrides
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/lead-capture/capacity.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/data/src/billing/entitlements.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/domain/src/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plan$2d$override$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/domain/src/billing/plan-override.ts [app-route] (ecmascript)");
;
;
;
;
class PlanOverrideError extends Error {
}
function checkActor(actor) {
    if (!actor || ![
        'staff',
        'system'
    ].includes(actor.type) || typeof actor.id !== 'string' || !actor.id.trim()) {
        throw new PlanOverrideError('A valid actor is required.');
    }
}
async function lockWorkspace(trx, workspaceId) {
    const row = await trx('workspaces').where({
        id: workspaceId
    }).forUpdate().first('deletionRequestedAt', 'planOverride', 'planOverrideEndsAt', 'planOverrideId');
    if (!row) throw new PlanOverrideError('Workspace not found.');
    return row;
}
async function databaseNow(trx) {
    const { rows } = await trx.raw('SELECT statement_timestamp() AS now');
    return new Date(rows[0].now);
}
const previous = (row)=>row.planOverrideId ? {
        overrideId: row.planOverrideId,
        plan: row.planOverride,
        endsAt: row.planOverrideEndsAt?.toISOString() ?? null
    } : null;
async function applyPlanOverride(db, input) {
    checkActor(input.actor);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plan$2d$override$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePlanOverrideReason"])(input.reason);
    return db.transaction(async (trx)=>{
        const workspace = await lockWorkspace(trx, input.workspaceId);
        if (workspace.deletionRequestedAt) throw new PlanOverrideError('This workspace is being deleted.');
        const override = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plan$2d$override$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePlanOverride"])(input, await databaseNow(trx));
        if (workspace.planOverrideEndsAt && workspace.planOverrideEndsAt <= await databaseNow(trx)) {
            const lost = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workspaceEntitlements"])(trx, input.workspaceId);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enqueueCaptureAccessCheck"])(trx, input.workspaceId, lost.plan.id, workspace.planOverrideEndsAt);
        }
        const overrideId = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
        await trx('workspaces').where({
            id: input.workspaceId
        }).update({
            planOverride: override.plan,
            planOverrideEndsAt: override.endsAt,
            planOverrideReason: override.reason,
            planOverrideId: overrideId
        });
        await trx('billingAudit').insert({
            workspaceId: input.workspaceId,
            actorId: input.actor.id,
            action: 'plan.override_applied',
            details: JSON.stringify({
                actorType: input.actor.type,
                overrideId,
                plan: override.plan,
                endsAt: override.endsAt.toISOString(),
                reason: override.reason,
                previous: previous(workspace)
            })
        });
        const entitlement = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workspaceEntitlements"])(trx, input.workspaceId);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enqueueCaptureAccessCheck"])(trx, input.workspaceId, entitlement.plan.id, entitlement.now);
        return {
            changed: true,
            overrideId
        };
    });
}
async function clearPlanOverride(db, input) {
    checkActor(input.actor);
    const reason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$domain$2f$src$2f$billing$2f$plan$2d$override$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePlanOverrideReason"])(input.reason);
    return db.transaction(async (trx)=>{
        const workspace = await lockWorkspace(trx, input.workspaceId);
        if (workspace.deletionRequestedAt) throw new PlanOverrideError('This workspace is being deleted.');
        if (!workspace.planOverrideId) return {
            changed: false,
            overrideId: null
        };
        if (workspace.planOverrideEndsAt && workspace.planOverrideEndsAt <= await databaseNow(trx)) {
            const lost = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workspaceEntitlements"])(trx, input.workspaceId);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enqueueCaptureAccessCheck"])(trx, input.workspaceId, lost.plan.id, workspace.planOverrideEndsAt);
        }
        await trx('workspaces').where({
            id: input.workspaceId
        }).update({
            planOverride: null,
            planOverrideEndsAt: null,
            planOverrideReason: null,
            planOverrideId: null
        });
        await trx('billingAudit').insert({
            workspaceId: input.workspaceId,
            actorId: input.actor.id,
            action: 'plan.override_cleared',
            details: JSON.stringify({
                actorType: input.actor.type,
                reason,
                previous: previous(workspace)
            })
        });
        const entitlement = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workspaceEntitlements"])(trx, input.workspaceId);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enqueueCaptureAccessCheck"])(trx, input.workspaceId, entitlement.plan.id, entitlement.now);
        return {
            changed: true,
            overrideId: workspace.planOverrideId
        };
    });
}
async function recordExpiredPlanOverrides(db, limit = 100) {
    const candidates = await db('workspaces').where('planOverrideEndsAt', '<=', db.fn.now()).whereNotNull('planOverrideId').whereNotExists(db('billingAudit as a').where('a.action', 'plan.override_expired').whereRaw("a.details->>'overrideId' = workspaces.\"planOverrideId\"::text")).orderBy('planOverrideEndsAt').limit(limit).select('id');
    let recorded = 0;
    for (const candidate of candidates)await db.transaction(async (trx)=>{
        const workspace = await lockWorkspace(trx, candidate.id), now = await databaseNow(trx);
        if (!workspace.planOverrideId || !workspace.planOverrideEndsAt || workspace.planOverrideEndsAt > now) return;
        const rows = await trx('billingAudit').insert({
            workspaceId: candidate.id,
            action: 'plan.override_expired',
            details: JSON.stringify({
                actorType: 'system',
                overrideId: workspace.planOverrideId,
                plan: workspace.planOverride,
                endsAt: workspace.planOverrideEndsAt
            })
        }).onConflict(trx.raw("((details->>'overrideId')) WHERE action = 'plan.override_expired'")).ignore().returning('id');
        if (!rows.length) return;
        const entitlement = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$billing$2f$entitlements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workspaceEntitlements"])(trx, candidate.id);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$data$2f$src$2f$lead$2d$capture$2f$capacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enqueueCaptureAccessCheck"])(trx, candidate.id, entitlement.plan.id, workspace.planOverrideEndsAt);
        recorded++;
    });
    return recorded;
}
}),
];

//# sourceMappingURL=packages_data_src_billing_0l6-6hc._.js.map