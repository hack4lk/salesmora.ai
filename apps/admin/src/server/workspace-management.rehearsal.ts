import assert from 'node:assert/strict';
import { createHmac, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { makeSignature, symmetricEncrypt } from 'better-auth/crypto';
import type { StaffRoleId } from '@salesmora/contracts';
import { NextRequest } from 'next/server';
import { appendAdminAuditEvent } from '@salesmora/data/admin-audit';
import { confirmPlanChange, initializeWorkspacePolicy } from '@salesmora/data';
import type { Stripe } from '@salesmora/data';
import { getWorkspacePlan } from '@salesmora/domain';
import { createDatabase } from '@salesmora/data/database';
import type { EmailMessage } from '@salesmora/data/email/transport';
import { invitationTokenHash } from '@salesmora/data/invitation-tokens';

const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const ownerURL = process.env.TEST_DATABASE_URL;
if (!ownerURL || ownerURL === process.env.DATABASE_URL || !new URL(ownerURL).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(ownerURL).hostname) || !process.env.DB_ADMIN_APP_PASSWORD) {
  throw new Error('Use an isolated local test database and provision DB_ADMIN_APP_PASSWORD.');
}
const adminURL = new URL(ownerURL);
adminURL.username = 'salesmora_admin_app';
adminURL.password = process.env.DB_ADMIN_APP_PASSWORD;
process.env.ADMIN_DATABASE_URL = adminURL.href;
process.env.ADMIN_AUTH_URL = 'http://localhost:3003';
process.env.ADMIN_AUTH_SECRET = randomUUID() + randomUUID();
process.env.CUSTOMER_APP_URL = 'http://127.0.0.1:3000';

const owner = createDatabase(ownerURL);
const adminDb = createDatabase(adminURL.href);
const prefix = `workspace-dir-${randomUUID()}`;
const now = new Date();
const userIds = Array.from({ length: 4 }, () => randomUUID());
const ownershipCandidateId = randomUUID();
const workspaceIds = Array.from({ length: 4 }, () => randomUUID());
const teamInvitationId = randomUUID();
const deletingTeamInvitationId = randomUUID();
const webhookReplayEventId = `evt_${randomUUID().replaceAll('-', '')}`;
const webhookReplayNeverFailedEventId = `evt_${randomUUID().replaceAll('-', '')}`;
const webhookReplayProcessedEventId = `evt_${randomUUID().replaceAll('-', '')}`;
const webhookReplayDeletionEventId = `evt_${randomUUID().replaceAll('-', '')}`;
const webhookReplayEventIds = [
  webhookReplayEventId,
  webhookReplayNeverFailedEventId,
  webhookReplayProcessedEventId,
  webhookReplayDeletionEventId,
];
const overrideId = randomUUID();
const leadId = randomUUID();
const customerId = randomUUID();
const jobId = randomUUID();
const estimateId = randomUUID();
const workOrderId = randomUUID();
const staffIds: string[] = [];
const totpSecret = randomUUID().replaceAll('-', '').repeat(2);
const usedTotpSteps = new Map<string, Set<number>>();

async function removeStaleFixtures() {
  const staleUsers = await owner('users').whereLike('name', 'workspace-dir-% Owner %').select<{ id: string }[]>('id');
  const staleUserIds = staleUsers.map(user => user.id);
  if (staleUserIds.length > 0) {
    const staleWorkspaces = await owner('workspaces').whereIn('ownerId', staleUserIds).select<{ id: string }[]>('id');
    const staleWorkspaceIds = staleWorkspaces.map(workspace => workspace.id);
    if (staleWorkspaceIds.length > 0) {
      await owner('aiUsageCalls').whereIn('workspaceId', staleWorkspaceIds).delete();
      await owner('workspaceAITokenBudgets').whereIn('workspaceId', staleWorkspaceIds).delete();
      await owner('billingWebhookEvents').whereIn('workspaceId', staleWorkspaceIds).delete();
      await owner('billingPlanChanges').whereIn('workspaceId', staleWorkspaceIds).delete();
      await owner('billingAudit').whereIn('workspaceId', staleWorkspaceIds).delete();
      await owner('billingRecoveryGraceExtensions').whereIn('workspaceId', staleWorkspaceIds).delete();
      await owner('billingRenewalRecoveries').whereIn('workspaceId', staleWorkspaceIds).delete();
      await owner('workspaceSubscriptions').whereIn('workspaceId', staleWorkspaceIds).delete();
      await owner('workspaces').whereIn('id', staleWorkspaceIds).delete();
    }
    await owner('users').whereIn('id', staleUserIds).delete();
  }
  const staleStaff = await owner.withSchema('admin').table('staffUsers')
    .whereLike('name', 'workspace-dir-%').select<{ id: string }[]>('id');
  if (staleStaff.length > 0) {
    await owner.withSchema('admin').table('staffUsers').whereIn('id', staleStaff.map(staff => staff.id)).delete();
  }
}

async function seedStaff(role?: StaffRoleId) {
  const userId = randomUUID();
  const sessionId = randomUUID();
  const token = randomUUID();
  const email = `${prefix}-${role ?? 'unassigned'}-${userId}@karpukcreative.com`;
  staffIds.push(userId);
  await owner.withSchema('admin').table('staffUsers').insert({
    id: userId, name: `${prefix} ${role ?? 'unassigned'}`, email, createdAt: now, updatedAt: now,
  });
  if (role) await owner.withSchema('admin').table('staffRoleAssignments').insert({
    id: randomUUID(), userId, role,
  });
  await owner.withSchema('admin').table('staffSessions').insert({
    id: sessionId, userId, token, createdAt: now, updatedAt: now,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });
  return { userId, sessionId, accessEmail: email, token };
}

async function seedWorkspaces() {
  await owner('users').insert(userIds.map((id, index) => ({
    id,
    name: `${prefix} Owner ${index}`,
    email: `${prefix}-${index}@example.test`,
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
    termsVersion: 'workspace-directory-rehearsal',
    termsAcceptedAt: now,
  })));
  await owner.transaction(async trx => {
    await trx('workspaces').insert(workspaceIds.map((id, index) => ({
      id,
      ownerId: userIds[index],
      businessName: `${prefix} Workspace ${index}`,
      businessType: 'test',
      postalCode: '',
      serviceRange: '',
      createdAt: new Date(now.getTime() - index * 1000),
      suspendedAt: index === 2 ? now : null,
      suspendedReason: index === 2 ? 'Rehearsal suspension' : null,
      deletionRequestedAt: index === 3 ? now : null,
      ...(index === 0 ? {
        planOverride: 'premium',
        planOverrideEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        planOverrideReason: 'Rehearsal override',
        planOverrideId: overrideId,
      } : {}),
      ...(index === 3 ? {
        planOverride: 'standard',
        planOverrideEndsAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        planOverrideReason: 'Expired rehearsal override',
        planOverrideId: randomUUID(),
      } : {}),
    })));
    await trx('workspaceMemberships').insert([
      ...workspaceIds.map((workspaceId, index) => ({
        workspaceId, userId: userIds[index], role: 'owner',
      })),
      { workspaceId: workspaceIds[0], userId: userIds[1], role: 'admin' },
    ]);
    await trx('workspacePolicies').insert(workspaceIds.slice(1).map(workspaceId => ({ workspaceId })));
    await initializeWorkspacePolicy(trx, { userId: userIds[0], workspaceId: workspaceIds[0] });
  });
  await owner('workspaceSubscriptions').insert(workspaceIds.map((workspaceId, index) => ({
    workspaceId,
    plan: index === 1 ? 'premium' : index === 3 ? 'free' : 'standard',
    intendedPlan: index === 1 ? 'premium' : index === 3 ? 'free' : 'standard',
    catalogVersion: 'workspace-directory-rehearsal',
    status: index === 1 ? 'past_due' : 'active',
    updatedAt: now,
  })));
  await owner('workspaceInvitations').insert({
    id: teamInvitationId,
    workspaceId: workspaceIds[0],
    email: `${prefix}-invite@example.test`,
    role: 'office',
    status: 'queued',
    inviterId: userIds[0],
    tokenHash: invitationTokenHash(`old-${teamInvitationId}`),
    createdAt: now,
    deliveryAttempts: 1,
    lastAttemptAt: new Date(now.getTime() - 3_600_000),
  });
  await owner('workspaceInvitations').insert({
    id: deletingTeamInvitationId,
    workspaceId: workspaceIds[3],
    email: `${prefix}-deleting-invite@example.test`,
    role: 'office',
    status: 'queued',
    inviterId: userIds[3],
    tokenHash: invitationTokenHash(`deleting-${deletingTeamInvitationId}`),
    createdAt: now,
    deliveryAttempts: 1,
    lastAttemptAt: new Date(now.getTime() - 3_600_000),
  });
  await owner('workspaceAITokenBudgets').insert({ workspaceId: workspaceIds[0], monthlyTokens: 75_000 });
  await owner('aiUsageCalls').insert({
    id: randomUUID(),
    workspaceId: workspaceIds[0],
    model: 'rehearsal',
    phase: 'answer',
    outcome: 'completed',
    inputTokens: 100,
    outputTokens: 50,
    totalTokens: 150,
    cachedInputTokens: 0,
    reasoningTokens: 0,
    reservationTokens: 0,
    startedAt: now,
    finishedAt: now,
  });
  await owner('leads').insert({
    id: leadId,
    workspaceId: workspaceIds[0],
    ownerId: userIds[1],
    createdBy: userIds[0],
    submissionId: randomUUID(),
    submissionHash: 'workspace-detail-rehearsal',
    name: 'Detail rehearsal lead',
    email: `${prefix}-lead@example.test`,
    phone: '',
    service: 'test',
    address: '',
    details: '',
    notes: '',
    source: 'other',
    stage: 'new',
  });
  await owner('customers').insert({
    id: customerId,
    workspaceId: workspaceIds[0],
    name: 'Detail rehearsal customer',
    type: 'person',
    companyName: '',
    email: `${prefix}-customer@example.test`,
    phone: '',
    location: '',
    internalNotes: '',
  });
  await owner('jobs').insert({
    id: jobId,
    workspaceId: workspaceIds[0],
    jobNumber: 1,
    customerName: 'Detail rehearsal customer',
    title: 'Detail rehearsal job',
    service: 'test',
    location: '',
    description: '',
    createdBy: userIds[0],
  });
  await owner('estimates').insert({
    id: estimateId,
    workspaceId: workspaceIds[0],
    estimateNumber: 1,
    name: 'Detail rehearsal estimate',
    parentType: 'lead',
    leadId,
  });
  await owner('workOrders').insert({
    id: workOrderId,
    workspaceId: workspaceIds[0],
    workOrderNumber: 1,
    jobId,
    title: 'Detail rehearsal work order',
  });
}

async function enrollTotp(userId: string) {
  await owner.withSchema('admin').table('staffTwoFactors').insert({
    id: randomUUID(),
    userId,
    secret: await symmetricEncrypt({ key: process.env.ADMIN_AUTH_SECRET!, data: totpSecret }),
    backupCodes: await symmetricEncrypt({ key: process.env.ADMIN_AUTH_SECRET!, data: '[]' }),
    verified: true,
  });
}

function totpCode(step = Math.floor(Date.now() / 30_000)) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const digest = createHmac('sha1', Buffer.from(totpSecret)).update(counter).digest();
  return ((digest.readUInt32BE(digest[digest.length - 1] & 15) & 0x7fffffff) % 1_000_000)
    .toString().padStart(6, '0');
}

function nextTotpCode(userId: string) {
  const usedSteps = usedTotpSteps.get(userId) ?? new Set<number>();
  const currentStep = Math.floor(Date.now() / 30_000);
  const step = [currentStep, currentStep - 1, currentStep + 1].find(candidate => !usedSteps.has(candidate));
  if (step === undefined) throw new Error('Wait for a new TOTP step before continuing the rehearsal.');
  usedSteps.add(step);
  usedTotpSteps.set(userId, usedSteps);
  return totpCode(step);
}

async function main() {
  const { createWorkspaceManagementService } = await import('./workspace-management');
  const { auth } = await import('./auth');
  const authContext = await auth.$context;
  const { GET: suspensionGET, POST: suspensionPOST } =
    await import('../app/api/admin/workspaces/[workspaceId]/suspension/route');
  const { GET: ownershipGET, POST: ownershipPOST } =
    await import('../app/api/admin/workspaces/[workspaceId]/ownership/route');
  const { GET: planOverrideGET, POST: planOverridePOST } =
    await import('../app/api/admin/workspaces/[workspaceId]/plan-override/route');
  const { GET: aiBudgetGET, POST: aiBudgetPOST } =
    await import('../app/api/admin/workspaces/[workspaceId]/ai-budget/route');
  const { POST: teamActionPOST } =
    await import('../app/api/admin/workspaces/[workspaceId]/team-actions/route');
  const { GET: billingGET } =
    await import('../app/api/admin/workspaces/[workspaceId]/billing/route');
  const { GET: billingLinksGET } =
    await import('../app/api/admin/workspaces/[workspaceId]/billing/links/route');
  const { GET: planChangeGET, POST: planChangePOST } =
    await import('../app/api/admin/workspaces/[workspaceId]/billing/plan-change/route');
  const { GET: recoveryGET, POST: recoveryPOST } =
    await import('../app/api/admin/workspaces/[workspaceId]/billing/recovery/route');
  const { GET: webhookReplayGET, POST: webhookReplayPOST } =
    await import('../app/api/admin/workspaces/[workspaceId]/billing/webhooks/replay/route');
  process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID = 'price_adminstandard';
  process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID = 'price_adminpremium';
  const planPeriodEnd = Math.floor(Date.now() / 1000) + 86_400;
  const standardPrice = {
    id: process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID,
    currency: 'usd',
    unit_amount: getWorkspacePlan('standard').monthlyPriceCents,
    recurring: { interval: 'month', interval_count: 1, usage_type: 'licensed' },
  };
  const activePlanSubscription = {
    id: `sub_${workspaceIds[0]}`,
    customer: 'cus_adminplan',
    metadata: { workspaceId: workspaceIds[0] },
    livemode: false,
    status: 'active',
    items: { data: [{
      id: 'si_adminplan',
      quantity: 1,
      price: standardPrice,
      current_period_start: planPeriodEnd - 86_400,
      current_period_end: planPeriodEnd,
    }] },
    latest_invoice: null,
    schedule: null,
    cancel_at_period_end: false,
    pending_update: null,
  };
  const recoveryCustomerId = 'cus_adminrecovery';
  const recoverySubscriptionId = `sub_adminrecovery_${workspaceIds[0]}`;
  const recoveryPaymentMethodId = 'pm_adminrecovery';
  const recoveryInvoiceId = `in_adminrecovery_${workspaceIds[0]}`;
  const recoveryId = randomUUID();
  const recoveryInvoiceCreatedAt = new Date(Math.floor((Date.now() - 60_000) / 1000) * 1000);
  const recoveryInvoice = {
    id: recoveryInvoiceId,
    livemode: false,
    customer: recoveryCustomerId,
    parent: { subscription_details: { subscription: recoverySubscriptionId } },
    billing_reason: 'subscription_cycle',
    currency: 'usd',
    collection_method: 'charge_automatically',
    status: 'open',
    created: Math.floor(recoveryInvoiceCreatedAt.getTime() / 1000),
    number: 'SM-ADMIN-RECOVERY',
    amount_remaining: 1200,
    total: 1200,
    amount_paid: 0,
    period_start: Math.floor(recoveryInvoiceCreatedAt.getTime() / 1000),
    period_end: Math.floor(recoveryInvoiceCreatedAt.getTime() / 1000) + 30 * 86_400,
    lines: { data: [] },
  };
  const recoverySubscription = {
    ...activePlanSubscription,
    id: recoverySubscriptionId,
    customer: recoveryCustomerId,
    status: 'past_due',
    default_payment_method: recoveryPaymentMethodId,
    latest_invoice: recoveryInvoice,
  };
  let recoveryPaymentIntent: Record<string, unknown> | null = null;
  let recoveryPaymentAttempts = 0;
  const recoveryIdempotencyKeys: (string | null)[] = [];
  let planSubscription = activePlanSubscription as unknown as Stripe.Subscription;
  let planProviderMutations = 0;
  const planProviderIdempotencyKeys: (string | null)[] = [];
  const billingProvider = {
    prices: {
      retrieve: async (id: string) => ({
        id,
        livemode: false,
        active: true,
        currency: 'usd',
        unit_amount: id === process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID
          ? getWorkspacePlan('premium').monthlyPriceCents
          : getWorkspacePlan('standard').monthlyPriceCents,
        recurring: { interval: 'month', interval_count: 1, usage_type: 'licensed' },
      }),
    },
    customers: {
      retrieve: async (id: string) => ({
        id,
        deleted: false,
        livemode: false,
        metadata: { workspaceId: workspaceIds[0] },
        invoice_settings: { default_payment_method: recoveryPaymentMethodId },
      }),
    },
    invoices: {
      createPreview: async () => ({ currency: 'usd', amount_due: 1200 }),
      retrieve: async () => recoveryInvoice,
      pay: async (_id: string, _input: unknown, options?: { idempotencyKey?: string }) => {
        recoveryPaymentAttempts++;
        recoveryIdempotencyKeys.push(options?.idempotencyKey ?? null);
        recoveryPaymentIntent = {
          id: 'pi_adminrecovery',
          livemode: false,
          customer: recoveryCustomerId,
          currency: 'usd',
          amount: recoveryInvoice.amount_remaining,
          status: 'requires_action',
          payment_method: recoveryPaymentMethodId,
          client_secret: 'pi_adminrecovery_secret',
        };
        return recoveryInvoice;
      },
    },
    subscriptions: {
      retrieve: async (id: string) => id === recoverySubscriptionId ? recoverySubscription : planSubscription,
      update: async (_id: string, input: { items?: unknown[] }, options?: { idempotencyKey?: string }) => {
        if (input.items) {
          planProviderMutations++;
          planProviderIdempotencyKeys.push(options?.idempotencyKey ?? null);
          planSubscription = {
            ...activePlanSubscription,
            pending_update: { expires_at: planPeriodEnd },
            latest_invoice: {
              status: 'open',
              created: planPeriodEnd - 86_400,
              confirmation_secret: { client_secret: 'pi_adminplan_secret' },
            },
          } as unknown as Stripe.Subscription;
        }
        return planSubscription;
      },
    },
    paymentMethods: {
      retrieve: async () => ({
        id: recoveryPaymentMethodId,
        livemode: false,
        customer: recoveryCustomerId,
        type: 'card',
        card: { brand: 'visa', last4: '4242', exp_month: 8, exp_year: 2028 },
      }),
    },
    invoicePayments: {
      list: async () => ({
        has_more: false,
        data: recoveryPaymentIntent ? [{
          livemode: false,
          invoice: recoveryInvoiceId,
          currency: 'usd',
          is_default: true,
          payment: { type: 'payment_intent', payment_intent: recoveryPaymentIntent },
        }] : [],
      }),
    },
    paymentIntents: { retrieve: async () => recoveryPaymentIntent },
  } as unknown as Stripe;
  const sentTeamInvitations: EmailMessage[] = [];
  let failTeamInvitationDelivery = false;
  const service = createWorkspaceManagementService(adminDb, {
    deliverTeamInvitation: async message => {
      sentTeamInvitations.push(message);
      if (failTeamInvitationDelivery) throw new Error('Rehearsal delivery failure.');
      return { providerMessageId: 'workspace-team-rehearsal' };
    },
    billingProvider,
  });
  try {
    await removeStaleFixtures();
    await seedWorkspaces();
    const [superAdmin, support, billing, unassigned] = await Promise.all([
      seedStaff('super_admin'), seedStaff('support'), seedStaff('billing'), seedStaff(),
    ]);
    const webhookReplayActor = await seedStaff('super_admin');
    const planOverrideActors = await Promise.all(Array.from({ length: 4 }, () => seedStaff('billing')));
    const aiBudgetActors = await Promise.all(Array.from({ length: 3 }, () => seedStaff('billing')));
    const planChangeActors = await Promise.all(Array.from({ length: 4 }, () => seedStaff('billing')));
    await enrollTotp(support.userId);
    await enrollTotp(superAdmin.userId);
    await enrollTotp(webhookReplayActor.userId);
    await enrollTotp(billing.userId);
    await Promise.all(planOverrideActors.map(actor => enrollTotp(actor.userId)));
    await Promise.all(aiBudgetActors.map(actor => enrollTotp(actor.userId)));
    await Promise.all(planChangeActors.map(actor => enrollTotp(actor.userId)));
    const recoveryActors = await Promise.all(Array.from({ length: 4 }, () => seedStaff('billing')));
    await Promise.all(recoveryActors.map(actor => enrollTotp(actor.userId)));
    async function suspensionRequest(
      staff: Awaited<ReturnType<typeof seedStaff>> | null,
      method: 'GET' | 'POST',
      workspaceId = workspaceIds[0],
      body?: string,
      origin = process.env.ADMIN_AUTH_URL!,
    ) {
      const headers = new Headers({
        origin,
        'content-type': 'application/json',
        'user-agent': 'Workspace suspension rehearsal',
      });
      if (staff) {
        headers.set(
          'cookie',
          `${authContext.authCookies.sessionToken.name}=${staff.token}.${await makeSignature(staff.token, authContext.secret)}`,
        );
        headers.set('x-admin-access-email', staff.accessEmail);
      }
      const request = new NextRequest(
        `${process.env.ADMIN_AUTH_URL}/api/admin/workspaces/${encodeURIComponent(workspaceId)}/suspension`,
        { method, headers, ...(body === undefined ? {} : { body }) },
      );
      const context = { params: Promise.resolve({ workspaceId }) };
      return method === 'GET' ? suspensionGET(request, context) : suspensionPOST(request, context);
    }
    async function ownershipRequest(
      staff: Awaited<ReturnType<typeof seedStaff>> | null,
      method: 'GET' | 'POST',
      workspaceId = workspaceIds[0],
      body?: string,
      origin = process.env.ADMIN_AUTH_URL!,
    ) {
      const headers = new Headers({
        origin,
        'content-type': 'application/json',
        'user-agent': 'Workspace ownership rehearsal',
      });
      if (staff) {
        headers.set(
          'cookie',
          `${authContext.authCookies.sessionToken.name}=${staff.token}.${await makeSignature(staff.token, authContext.secret)}`,
        );
        headers.set('x-admin-access-email', staff.accessEmail);
      }
      const request = new NextRequest(
        `${process.env.ADMIN_AUTH_URL}/api/admin/workspaces/${encodeURIComponent(workspaceId)}/ownership`,
        { method, headers, ...(body === undefined ? {} : { body }) },
      );
      const context = { params: Promise.resolve({ workspaceId }) };
      return method === 'GET' ? ownershipGET(request, context) : ownershipPOST(request, context);
    }
    async function planOverrideRequest(
      staff: Awaited<ReturnType<typeof seedStaff>> | null,
      method: 'GET' | 'POST',
      workspaceId = workspaceIds[0],
      body?: string,
      origin = process.env.ADMIN_AUTH_URL!,
    ) {
      const headers = new Headers({
        origin,
        'content-type': 'application/json',
        'user-agent': 'Workspace plan-override rehearsal',
      });
      if (staff) {
        headers.set(
          'cookie',
          `${authContext.authCookies.sessionToken.name}=${staff.token}.${await makeSignature(staff.token, authContext.secret)}`,
        );
        headers.set('x-admin-access-email', staff.accessEmail);
      }
      const request = new NextRequest(
        `${process.env.ADMIN_AUTH_URL}/api/admin/workspaces/${encodeURIComponent(workspaceId)}/plan-override`,
        { method, headers, ...(body === undefined ? {} : { body }) },
      );
      const context = { params: Promise.resolve({ workspaceId }) };
      return method === 'GET' ? planOverrideGET(request, context) : planOverridePOST(request, context);
    }
    async function aiBudgetRequest(
      staff: Awaited<ReturnType<typeof seedStaff>> | null,
      method: 'GET' | 'POST',
      workspaceId = workspaceIds[0],
      body?: string,
      origin = process.env.ADMIN_AUTH_URL!,
    ) {
      const headers = new Headers({
        origin,
        'content-type': 'application/json',
        'user-agent': 'Workspace AI-budget rehearsal',
      });
      if (staff) {
        headers.set(
          'cookie',
          `${authContext.authCookies.sessionToken.name}=${staff.token}.${await makeSignature(staff.token, authContext.secret)}`,
        );
        headers.set('x-admin-access-email', staff.accessEmail);
      }
      const request = new NextRequest(
        `${process.env.ADMIN_AUTH_URL}/api/admin/workspaces/${encodeURIComponent(workspaceId)}/ai-budget`,
        { method, headers, ...(body === undefined ? {} : { body }) },
      );
      const context = { params: Promise.resolve({ workspaceId }) };
      return method === 'GET' ? aiBudgetGET(request, context) : aiBudgetPOST(request, context);
    }
    async function teamActionRequest(
      staff: Awaited<ReturnType<typeof seedStaff>> | null,
      workspaceId = workspaceIds[0],
      body?: string,
      options: { origin?: string; contentType?: string } = {},
    ) {
      const headers = new Headers({
        origin: options.origin ?? process.env.ADMIN_AUTH_URL!,
        'content-type': options.contentType ?? 'application/json',
        'user-agent': 'Workspace team-action rehearsal',
      });
      if (staff) {
        headers.set(
          'cookie',
          `${authContext.authCookies.sessionToken.name}=${staff.token}.${await makeSignature(staff.token, authContext.secret)}`,
        );
        headers.set('x-admin-access-email', staff.accessEmail);
      }
      const request = new NextRequest(
        `${process.env.ADMIN_AUTH_URL}/api/admin/workspaces/${encodeURIComponent(workspaceId)}/team-actions`,
        { method: 'POST', headers, ...(body === undefined ? {} : { body }) },
      );
      return teamActionPOST(request, { params: Promise.resolve({ workspaceId }) });
    }
    async function billingRequest(
      staff: Awaited<ReturnType<typeof seedStaff>> | null,
      workspaceId: string = workspaceIds[0],
      query = '',
    ) {
      const headers = new Headers({
        origin: process.env.ADMIN_AUTH_URL!,
        'user-agent': 'Workspace billing rehearsal',
      });
      if (staff) {
        headers.set(
          'cookie',
          `${authContext.authCookies.sessionToken.name}=${staff.token}.${await makeSignature(staff.token, authContext.secret)}`,
        );
        headers.set('x-admin-access-email', staff.accessEmail);
      }
      const request = new NextRequest(
        `${process.env.ADMIN_AUTH_URL}/api/admin/workspaces/${encodeURIComponent(workspaceId)}/billing${query}`,
        { method: 'GET', headers },
      );
      return billingGET(request, { params: Promise.resolve({ workspaceId }) });
    }
    async function billingLinksRequest(
      staff: Awaited<ReturnType<typeof seedStaff>> | null,
      workspaceId: string = workspaceIds[0],
      query = '',
    ) {
      const headers = new Headers({
        origin: process.env.ADMIN_AUTH_URL!,
        'user-agent': 'Workspace billing-links rehearsal',
      });
      if (staff) {
        headers.set(
          'cookie',
          `${authContext.authCookies.sessionToken.name}=${staff.token}.${await makeSignature(staff.token, authContext.secret)}`,
        );
        headers.set('x-admin-access-email', staff.accessEmail);
      }
      const request = new NextRequest(
        `${process.env.ADMIN_AUTH_URL}/api/admin/workspaces/${encodeURIComponent(workspaceId)}/billing/links${query}`,
        { method: 'GET', headers },
      );
      return billingLinksGET(request, { params: Promise.resolve({ workspaceId }) });
    }
    async function planChangeRequest(
      staff: Awaited<ReturnType<typeof seedStaff>> | null,
      method: 'GET' | 'POST',
      workspaceId = workspaceIds[0],
      body?: string,
      origin = process.env.ADMIN_AUTH_URL!,
    ) {
      const headers = new Headers({
        origin,
        'content-type': 'application/json',
        'user-agent': 'Workspace plan-change rehearsal',
      });
      if (staff) {
        headers.set(
          'cookie',
          `${authContext.authCookies.sessionToken.name}=${staff.token}.${await makeSignature(staff.token, authContext.secret)}`,
        );
        headers.set('x-admin-access-email', staff.accessEmail);
      }
      const request = new NextRequest(
        `${process.env.ADMIN_AUTH_URL}/api/admin/workspaces/${encodeURIComponent(workspaceId)}/billing/plan-change`,
        { method, headers, ...(body === undefined ? {} : { body }) },
      );
      const context = { params: Promise.resolve({ workspaceId }) };
      return method === 'GET' ? planChangeGET(request, context) : planChangePOST(request, context);
    }
    async function recoveryRequest(
      staff: Awaited<ReturnType<typeof seedStaff>> | null,
      method: 'GET' | 'POST',
      workspaceId = workspaceIds[0],
      body?: string,
      origin = process.env.ADMIN_AUTH_URL!,
    ) {
      const headers = new Headers({
        origin,
        'content-type': 'application/json',
        'user-agent': 'Workspace recovery rehearsal',
      });
      if (staff) {
        headers.set(
          'cookie',
          `${authContext.authCookies.sessionToken.name}=${staff.token}.${await makeSignature(staff.token, authContext.secret)}`,
        );
        headers.set('x-admin-access-email', staff.accessEmail);
      }
      const request = new NextRequest(
        `${process.env.ADMIN_AUTH_URL}/api/admin/workspaces/${encodeURIComponent(workspaceId)}/billing/recovery`,
        { method, headers, ...(body === undefined ? {} : { body }) },
      );
      const context = { params: Promise.resolve({ workspaceId }) };
      return method === 'GET' ? recoveryGET(request, context) : recoveryPOST(request, context);
    }
    async function webhookReplayRequest(
      staff: Awaited<ReturnType<typeof seedStaff>> | null,
      method: 'GET' | 'POST',
      workspaceId = workspaceIds[0],
      body?: string,
      origin = process.env.ADMIN_AUTH_URL!,
    ) {
      const headers = new Headers({
        origin,
        'content-type': 'application/json',
        'user-agent': 'Workspace webhook replay rehearsal',
      });
      if (staff) {
        headers.set(
          'cookie',
          `${authContext.authCookies.sessionToken.name}=${staff.token}.${await makeSignature(staff.token, authContext.secret)}`,
        );
        headers.set('x-admin-access-email', staff.accessEmail);
      }
      const request = new NextRequest(
        `${process.env.ADMIN_AUTH_URL}/api/admin/workspaces/${encodeURIComponent(workspaceId)}/billing/webhooks/replay`,
        { method, headers, ...(body === undefined ? {} : { body }) },
      );
      const context = { params: Promise.resolve({ workspaceId }) };
      return method === 'GET' ? webhookReplayGET(request, context) : webhookReplayPOST(request, context);
    }

    const methodsResponse = await suspensionRequest(support, 'GET');
    assert.equal(methodsResponse.status, 200);
    assert.equal(methodsResponse.headers.get('cache-control'), 'no-store');
    assert.ok((await methodsResponse.json()).methods.includes('totp'));
    assert.equal((await suspensionRequest(null, 'GET')).status, 401);
    assert.equal((await suspensionRequest(billing, 'GET')).status, 403);
    assert.equal((await suspensionRequest(
      support,
      'POST',
      workspaceIds[1],
      JSON.stringify({
        operation: 'start',
        workspaceId: workspaceIds[1],
        action: 'suspend',
        reason: 'Route origin enforcement rehearsal',
      }),
      'https://untrusted.example',
    )).status, 403);
    assert.equal((await suspensionRequest(
      support,
      'POST',
      workspaceIds[1],
      JSON.stringify({
        operation: 'start',
        workspaceId: workspaceIds[1],
        action: 'suspend',
        reason: 'x'.repeat(16_385),
      }),
    )).status, 413);
    const staleSession = await seedStaff('support');
    await owner.withSchema('admin').table('staffSessions')
      .where({ id: staleSession.sessionId }).update({ expiresAt: new Date(Date.now() - 1) });
    assert.equal((await suspensionRequest(staleSession, 'GET')).status, 401);

    await owner('billingAudit').insert({
      workspaceId: workspaceIds[0],
      actorId: superAdmin.userId,
      action: 'plan.override_applied',
      details: JSON.stringify({
        actorType: 'staff',
        overrideId,
        plan: 'premium',
        endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        reason: 'Rehearsal override',
      }),
      createdAt: now,
    });
    await owner.transaction(trx => appendAdminAuditEvent(trx, {
      staffUserId: superAdmin.userId,
      staffRole: 'super_admin',
      action: 'workspace.suspension.changed',
      targetType: 'workspace',
      targetId: workspaceIds[0],
      workspaceId: workspaceIds[0],
      reason: 'Workspace detail rehearsal',
      occurredAt: now,
    }));

    for (const identity of [superAdmin, support, billing]) {
      const result = await service.readDirectory(identity, { query: prefix });
      assert.equal(result.total, 4);
      assert.equal(result.pageSize, 20);
      assert.equal(result.workspaces.length, 4);
      const overridden = result.workspaces.find(item => item.id === workspaceIds[0]);
      assert.equal(overridden?.plan, 'premium');
      assert.equal(overridden?.overridePlan, 'premium');
      assert.equal(overridden?.memberCount, 2);
      assert.match(overridden?.maskedOwnerEmail ?? '', /^[^@]{1,2}••••@[^@]+$/);
      assert.equal(JSON.stringify(result).includes(`${prefix}-0@example.test`), false);
    }

    const emailSearch = await service.readDirectory(support, { query: `${prefix}-1@example.test` });
    assert.deepEqual(emailSearch.workspaces.map(item => item.id), [workspaceIds[1]]);
    assert.equal(emailSearch.workspaces[0].maskedOwnerEmail.includes(`${prefix}-1@example.test`), false);
    const idSearch = await service.readDirectory(support, { query: workspaceIds[0] });
    assert.deepEqual(idSearch.workspaces.map(item => item.id), [workspaceIds[0]]);
    assert.equal((await service.readDirectory(support, { query: '%' })).total, 0);
    assert.equal((await service.readDirectory(support, { query: '_' })).total, 0);

    const detail = await service.readDetail(support, { workspaceId: workspaceIds[0] });
    assert.equal(detail.workspace.id, workspaceIds[0]);
    assert.equal(detail.workspace.plan, 'premium');
    assert.equal(detail.stripePlan, 'standard');
    assert.equal(detail.workspace.status, 'active');
    assert.equal(detail.totalMembers, 3);
    assert.equal(detail.members.length, 3);
    assert.equal(detail.members.filter(member => member.status === 'Invited').length, 1);
    assert.match(detail.workspace.maskedOwnerEmail, /^[^@]{1,2}••••@[^@]+$/);
    assert.equal(JSON.stringify(detail).includes(`${prefix}-0@example.test`), false);
    assert.equal(JSON.stringify(detail).includes(`${prefix}-invite@example.test`), false);
    assert.deepEqual(detail.limits, { teammates: 20, leads: 5_000, aiTokens: 75_000 });
    assert.equal(detail.usage.leads, 1);
    assert.equal(detail.usage.aiTokens, 150);
    assert.deepEqual(detail.records, { leads: 1, customers: 1, jobs: 1, estimates: 1, workOrders: 1 });
    assert.equal(detail.featureFlags, null);
    assert.equal(detail.override?.appliedBy, `${prefix} super_admin`);
    assert.equal(detail.override?.reason, 'Rehearsal override');
    assert.equal(detail.auditActions[0]?.actor, `${prefix} super_admin`);
    assert.equal(detail.auditActions[0]?.reason, 'Workspace detail rehearsal');
    assert.deepEqual(detail.permissions, {
      canSuspend: true,
      canTransferOwnership: false,
      canOverridePlan: false,
      canAdjustAIBudget: false,
      canRemoveMembers: true,
      canResendInvitations: true,
      canReadBillingLinks: false,
      canChangePlan: false,
      canManageRecovery: false,
      canReplayWebhooks: false,
    });
    assert.deepEqual((await service.readDetail(superAdmin, { workspaceId: workspaceIds[0] })).permissions,
      { canSuspend: true, canTransferOwnership: true, canOverridePlan: true, canAdjustAIBudget: true, canRemoveMembers: true, canResendInvitations: true, canReadBillingLinks: true, canChangePlan: true, canManageRecovery: true, canReplayWebhooks: true });
    assert.equal((await service.readDetail(billing, { workspaceId: workspaceIds[0] })).workspace.id, workspaceIds[0]);
    assert.deepEqual((await service.readDetail(billing, { workspaceId: workspaceIds[0] })).permissions,
      { canSuspend: false, canTransferOwnership: false, canOverridePlan: true, canAdjustAIBudget: true, canRemoveMembers: false, canResendInvitations: false, canReadBillingLinks: true, canChangePlan: true, canManageRecovery: true, canReplayWebhooks: false });
    await assert.rejects(
      service.readDetail(unassigned, { workspaceId: workspaceIds[0] }),
      error => error instanceof Error && 'status' in error && error.status === 403,
    );
    await assert.rejects(
      service.readDetail(support, { workspaceId: 'not-a-uuid' }),
      error => error instanceof Error && 'status' in error && error.status === 400,
    );
    await assert.rejects(
      service.readDetail(support, { workspaceId: randomUUID() }),
      error => error instanceof Error && 'status' in error && error.status === 404,
    );

    const billingSummary = await service.readBilling(support, { workspaceId: workspaceIds[0] });
    assert.equal(billingSummary.workspaceId, workspaceIds[0]);
    assert.equal(billingSummary.subscription?.plan, 'standard');
    assert.equal(billingSummary.providerStatus, 'not_linked');
    assert.deepEqual(billingSummary.invoices, []);
    assert.equal(billingSummary.payment, null);
    assert.equal(JSON.stringify(billingSummary).includes('customerId'), false);
    assert.equal(JSON.stringify(billingSummary).includes('rawPayload'), false);
    assert.equal((await service.readBilling(superAdmin, { workspaceId: workspaceIds[0] })).workspaceId, workspaceIds[0]);
    assert.equal((await service.readBilling(billing, { workspaceId: workspaceIds[0] })).workspaceId, workspaceIds[0]);
    const billingReadAudit = await owner.withSchema('admin').table('auditEvents')
      .where({ action: 'workspace.billing.read', targetId: workspaceIds[0] })
      .orderBy('sequence', 'desc')
      .first<{ after: Record<string, unknown> }>('after');
    assert.deepEqual(billingReadAudit?.after, {
      plan: 'standard',
      subscriptionStatus: 'active',
      providerStatus: 'not_linked',
      planChangeCount: 0,
      invoiceCount: 0,
      recoveryCount: 0,
      webhookEventCount: 0,
    });
    assert.equal(JSON.stringify(billingReadAudit?.after).includes('amountDue'), false);
    await assert.rejects(
      service.readBilling(unassigned, { workspaceId: workspaceIds[0] }),
      error => error instanceof Error && 'status' in error && error.status === 403,
    );
    await assert.rejects(
      service.readBilling(support, { workspaceId: 'not-a-uuid' }),
      error => error instanceof Error && 'status' in error && error.status === 400,
    );
    await assert.rejects(
      service.readBilling(support, { workspaceId: randomUUID() }),
      error => error instanceof Error && 'status' in error && error.status === 404,
    );
    const billingResponse = await billingRequest(support);
    assert.equal(billingResponse.status, 200);
    assert.equal(billingResponse.headers.get('cache-control'), 'no-store');
    assert.equal(billingResponse.headers.get('referrer-policy'), 'no-referrer');
    assert.equal((await billingResponse.json()).workspaceId, workspaceIds[0]);
    assert.equal((await billingRequest(null)).status, 401);
    assert.equal((await billingRequest(unassigned)).status, 403);
    assert.equal((await billingRequest(support, workspaceIds[0], '?unexpected=value')).status, 400);
    assert.equal((await billingRequest(support, 'not-a-uuid')).status, 400);
    assert.equal((await billingRequest(support, randomUUID())).status, 404);

    const linksSummary = await service.readBillingLinks(billing, { workspaceId: workspaceIds[0] });
    assert.equal(linksSummary.workspaceId, workspaceIds[0]);
    assert.equal(linksSummary.providerStatus, 'not_linked');
    assert.equal(linksSummary.customerUrl, null);
    assert.deepEqual(linksSummary.invoices, []);
    assert.equal((await service.readBillingLinks(superAdmin, { workspaceId: workspaceIds[0] })).workspaceId,
      workspaceIds[0]);
    const linksReadAudit = await owner.withSchema('admin').table('auditEvents')
      .where({ action: 'workspace.billing.links.read', targetId: workspaceIds[0] })
      .orderBy('sequence', 'desc')
      .first<{ after: Record<string, unknown> }>('after');
    assert.deepEqual(linksReadAudit?.after, {
      providerStatus: 'not_linked',
      hasCustomerLink: false,
      hasSubscriptionLink: false,
      invoiceLinkCount: 0,
    });
    await assert.rejects(
      service.readBillingLinks(support, { workspaceId: workspaceIds[0] }),
      error => error instanceof Error && 'status' in error && error.status === 403,
    );
    await assert.rejects(
      service.readBillingLinks(unassigned, { workspaceId: workspaceIds[0] }),
      error => error instanceof Error && 'status' in error && error.status === 403,
    );
    await assert.rejects(
      service.readBillingLinks(billing, { workspaceId: 'not-a-uuid' }),
      error => error instanceof Error && 'status' in error && error.status === 400,
    );
    await assert.rejects(
      service.readBillingLinks(billing, { workspaceId: randomUUID() }),
      error => error instanceof Error && 'status' in error && error.status === 404,
    );
    const linksResponse = await billingLinksRequest(billing);
    assert.equal(linksResponse.status, 200);
    assert.equal(linksResponse.headers.get('cache-control'), 'no-store');
    assert.equal(linksResponse.headers.get('referrer-policy'), 'no-referrer');
    assert.equal((await linksResponse.json()).providerStatus, 'not_linked');
    assert.equal((await billingLinksRequest(null)).status, 401);
    assert.equal((await billingLinksRequest(support)).status, 403);
    assert.equal((await billingLinksRequest(billing, workspaceIds[0], '?unexpected=value')).status, 400);
    assert.equal((await billingLinksRequest(billing, 'not-a-uuid')).status, 400);
    assert.equal((await billingLinksRequest(billing, randomUUID())).status, 404);

    await owner('workspaceSubscriptions').where({ workspaceId: workspaceIds[0] }).update({
      customerId: 'cus_adminplan',
      subscriptionId: activePlanSubscription.id,
      plan: 'standard',
      intendedPlan: 'standard',
      status: 'active',
      priceId: standardPrice.id,
      paidThrough: new Date(planPeriodEnd * 1000),
      cancelAtPeriodEnd: false,
    });
    const planMethodsResponse = await planChangeRequest(billing, 'GET');
    assert.equal(planMethodsResponse.status, 200);
    assert.equal(planMethodsResponse.headers.get('cache-control'), 'no-store');
    assert.ok((await planMethodsResponse.json()).methods.includes('totp'));
    assert.equal((await planChangeRequest(support, 'GET')).status, 403);
    assert.equal((await planChangeRequest(null, 'GET')).status, 401);
    await assert.rejects(
      service.previewPlanChange(support, {
        operation: 'preview', workspaceId: workspaceIds[0], plan: 'premium',
      }),
      /cannot change workspace plans/,
    );
    const stalePlanActor = planChangeActors[0];
    const planChangeActor = planChangeActors[1];
    const changedQuoteActor = planChangeActors[2];
    const concurrentPlanActor = planChangeActors[3];
    const stalePlanPreview = await service.previewPlanChange(billing, {
      operation: 'preview',
      workspaceId: workspaceIds[0],
      plan: 'premium',
    });
    const stalePlanStart = await service.startPlanChange(stalePlanActor, {
      operation: 'start',
      workspaceId: workspaceIds[0],
      quoteId: stalePlanPreview.quote.id,
      reason: 'Confirm only while subscription remains active, case 8123',
    });
    await service.verifyPlanChangeFactor(stalePlanActor, stalePlanStart.token, {
      method: 'totp',
      code: nextTotpCode(stalePlanActor.userId),
    });
    planSubscription = {
      ...activePlanSubscription,
      status: 'past_due',
    } as unknown as Stripe.Subscription;
    await assert.rejects(
      service.commitPlanChange(billing, stalePlanStart.token),
      error => error instanceof Error && 'status' in error && error.status === 409,
    );
    assert.equal(planProviderMutations, 0);
    assert.equal((await owner('billingPlanChanges').where({ id: stalePlanPreview.quote.id }).first())?.state, 'quoted');
    planSubscription = activePlanSubscription as unknown as Stripe.Subscription;
    const planPreview = await service.previewPlanChange(billing, {
      operation: 'preview',
      workspaceId: workspaceIds[0],
      plan: 'premium',
    });
    assert.equal(planPreview.quote.kind, 'upgrade');
    assert.equal(planPreview.quote.amountDue, 1200);
    const changedQuotePreview = await service.previewPlanChange(billing, {
      operation: 'preview',
      workspaceId: workspaceIds[0],
      plan: 'premium',
    });
    const changedQuoteStart = await service.startPlanChange(changedQuoteActor, {
      operation: 'start',
      workspaceId: workspaceIds[0],
      quoteId: changedQuotePreview.quote.id,
      reason: 'Confirm only while quoted plan remains unchanged, case 8125',
    });
    await service.verifyPlanChangeFactor(changedQuoteActor, changedQuoteStart.token, {
      method: 'totp',
      code: nextTotpCode(changedQuoteActor.userId),
    });
    await owner('billingPlanChanges').where({ id: changedQuotePreview.quote.id }).update({ targetPlan: 'standard' });
    await assert.rejects(
      service.commitPlanChange(changedQuoteActor, changedQuoteStart.token),
      error => error instanceof Error && 'status' in error && error.status === 409,
    );
    assert.equal(planProviderMutations, 0);
    await owner('billingPlanChanges').where({ id: changedQuotePreview.quote.id }).update({ targetPlan: 'premium' });
    const planReason = 'Finance approved the premium change, case 8124';
    const concurrentPlanReason = 'Independent billing approval for case 8124';
    const planStartInput = {
      operation: 'start',
      workspaceId: workspaceIds[0],
      quoteId: planPreview.quote.id,
      reason: planReason,
    };
    assert.equal((await planChangeRequest(planChangeActor, 'POST', workspaceIds[1], JSON.stringify(planStartInput))).status, 400);
    assert.equal((await planChangeRequest(planChangeActor, 'POST', workspaceIds[0], JSON.stringify(planStartInput),
      'https://untrusted.example')).status, 403);
    const planStartResponse = await planChangeRequest(planChangeActor, 'POST', workspaceIds[0], JSON.stringify(planStartInput));
    assert.equal(planStartResponse.status, 200);
    const planChallenge = await planStartResponse.json() as { token: string };
    const badPlanFactor = await planChangeRequest(planChangeActor, 'POST', workspaceIds[0], JSON.stringify({
      operation: 'factor',
      token: planChallenge.token,
      method: 'totp',
      code: totpCode(Math.floor(Date.now() / 30_000) + 10),
    }));
    assert.equal(badPlanFactor.status, 422);
    const validPlanFactor = await planChangeRequest(planChangeActor, 'POST', workspaceIds[0], JSON.stringify({
      operation: 'factor',
      token: planChallenge.token,
      method: 'totp',
      code: nextTotpCode(planChangeActor.userId),
    }));
    assert.equal(validPlanFactor.status, 200);
    assert.deepEqual(await validPlanFactor.json(), { verified: true });
    const concurrentPlanStart = await service.startPlanChange(concurrentPlanActor, {
      operation: 'start',
      workspaceId: workspaceIds[0],
      quoteId: planPreview.quote.id,
      reason: concurrentPlanReason,
    });
    await service.verifyPlanChangeFactor(concurrentPlanActor, concurrentPlanStart.token, {
      method: 'totp',
      code: nextTotpCode(concurrentPlanActor.userId),
    });
    const concurrentCommits = await Promise.allSettled([
      service.commitPlanChange(planChangeActor, planChallenge.token),
      service.commitPlanChange(concurrentPlanActor, concurrentPlanStart.token),
    ]);
    assert.equal(concurrentCommits.filter(commit => commit.status === 'fulfilled').length, 2);
    const concurrentResults = concurrentCommits.map(commit => {
      assert.equal(commit.status, 'fulfilled');
      return commit.value;
    });
    const planChangeResult = concurrentResults[0]!;
    assert.deepEqual(planChangeResult, {
      status: 'customer_action_required',
      plan: 'premium',
      effectiveAt: planPreview.quote.effectiveAt,
      handoff: 'workspace_owner_billing',
    });
    assert.deepEqual(concurrentResults[1], planChangeResult);
    await assert.rejects(
      service.commitPlanChange(planChangeActor, planChallenge.token),
      error => error instanceof Error && 'status' in error && error.status === 409,
    );
    assert.equal(JSON.stringify(planChangeResult).includes('pi_adminplan_secret'), false);
    assert.equal((await owner('billingPlanChanges').where({ id: planPreview.quote.id }).first())?.state, 'payment');
    const planAudit = await owner.withSchema('admin').table('auditEvents')
      .where({ workspaceId: workspaceIds[0] })
      .whereIn('action', [
        'workspace.billing.plan_change.review_started',
        'workspace.billing.plan_change.factor_failed',
        'workspace.billing.plan_change.factor_verified',
        'workspace.billing.plan_change.confirmed',
      ])
      .select<{ action: string; reason: string | null; after: Record<string, unknown> }[]>(
        'action', 'reason', 'after',
      );
    const currentPlanAudit = planAudit.filter(event => event.after.quoteId === planPreview.quote.id);
    assert.equal(currentPlanAudit.length, 7);
    assert.deepEqual(
      currentPlanAudit.filter(event => event.action === 'workspace.billing.plan_change.review_started').length,
      2,
    );
    assert.deepEqual(
      currentPlanAudit.filter(event => event.action === 'workspace.billing.plan_change.factor_failed').length,
      1,
    );
    assert.deepEqual(
      currentPlanAudit.filter(event => event.action === 'workspace.billing.plan_change.factor_verified').length,
      2,
    );
    assert.deepEqual(
      currentPlanAudit.filter(event => event.action === 'workspace.billing.plan_change.confirmed').length,
      2,
    );
    assert.ok(currentPlanAudit.every(event =>
      event.reason === planReason || event.reason === concurrentPlanReason));
    assert.equal(JSON.stringify(currentPlanAudit).includes('pi_adminplan_secret'), false);
    assert.equal(planProviderMutations, 1);
    assert.deepEqual(planProviderIdempotencyKeys, [`salesmora-plan-${planPreview.quote.id}`]);
    assert.deepEqual(await confirmPlanChange(owner, userIds[0], workspaceIds[0], planPreview.quote.id, false, billingProvider), {
      status: 'payment',
      paymentUI: 'card',
      clientSecret: 'pi_adminplan_secret',
    });

    const recoveryMethodsResponse = await recoveryRequest(recoveryActors[0]!, 'GET');
    assert.equal(recoveryMethodsResponse.status, 200);
    assert.equal(recoveryMethodsResponse.headers.get('cache-control'), 'no-store');
    assert.equal(recoveryMethodsResponse.headers.get('referrer-policy'), 'no-referrer');
    assert.ok((await recoveryMethodsResponse.json()).methods.includes('totp'));
    assert.deepEqual(await service.recoveryMethods(superAdmin), { methods: ['totp'] });
    assert.equal((await recoveryRequest(support, 'GET')).status, 403);
    assert.equal((await recoveryRequest(null, 'GET')).status, 401);
    assert.equal((await recoveryRequest(
      recoveryActors[0]!, 'POST', workspaceIds[0], JSON.stringify({
        operation: 'preview', workspaceId: workspaceIds[1],
      }),
    )).status, 400);
    assert.equal((await recoveryRequest(
      recoveryActors[0]!, 'POST', workspaceIds[0], JSON.stringify({
        operation: 'preview', workspaceId: workspaceIds[0],
      }), 'https://untrusted.example',
    )).status, 403);
    assert.equal((await recoveryRequest(
      support, 'POST', workspaceIds[0], JSON.stringify({
        operation: 'preview', workspaceId: workspaceIds[0],
      }),
    )).status, 403);

    await owner('billingPlanChanges').where({ workspaceId: workspaceIds[0], state: 'payment' })
      .update({ state: 'complete' });
    await owner('workspaceSubscriptions').where({ workspaceId: workspaceIds[0] }).update({
      customerId: recoveryCustomerId,
      subscriptionId: recoverySubscriptionId,
      plan: 'standard',
      intendedPlan: 'standard',
      status: 'past_due',
      priceId: standardPrice.id,
      paidThrough: new Date(planPeriodEnd * 1000),
      recoveryUntil: new Date(recoveryInvoiceCreatedAt.getTime() + 7 * 86_400_000),
      cancelAtPeriodEnd: false,
    });
    await owner('billingRenewalRecoveries').insert({
      id: recoveryId,
      workspaceId: workspaceIds[0],
      actorId: userIds[0],
      customerId: recoveryCustomerId,
      subscriptionId: recoverySubscriptionId,
      invoiceId: recoveryInvoiceId,
      paymentMethodId: recoveryPaymentMethodId,
      amountDue: recoveryInvoice.amount_remaining,
      invoice: recoveryInvoice,
      state: 'pending',
      createdAt: new Date(Date.now() - 60_000),
      expiresAt: new Date(Date.now() + 60 * 60_000),
      attemptedAt: new Date(Date.now() - 30_000),
      retryAt: new Date(Date.now() - 1_000),
      attempts: 0,
    });
    const recoveryPreview = await service.previewRecovery(recoveryActors[0]!, { workspaceId: workspaceIds[0] });
    assert.equal(recoveryPreview.providerStatus, 'available');
    assert.equal(recoveryPreview.invoice?.createdAt, recoveryInvoiceCreatedAt.toISOString());
    assert.equal(recoveryPreview.recovery?.id, recoveryId);
    assert.equal(JSON.stringify(recoveryPreview).includes(recoveryInvoiceId), false);
    assert.equal(JSON.stringify(recoveryPreview).includes(recoveryCustomerId), false);
    assert.equal(JSON.stringify(recoveryPreview).includes('pi_adminrecovery_secret'), false);

    const graceStart = await service.startRecovery(recoveryActors[0]!, {
      operation: 'start',
      action: 'extend_grace',
      workspaceId: workspaceIds[0],
      additionalDays: 1,
      reason: 'Provide one approved renewal grace day, case 8126',
    });
    await service.verifyRecoveryFactor(recoveryActors[0]!, graceStart.token, {
      method: 'totp',
      code: nextTotpCode(recoveryActors[0]!.userId),
    });
    const graceResult = await service.commitRecovery(recoveryActors[0]!, graceStart.token);
    assert.equal(graceResult.status, 'grace_extended');
    if (graceResult.status === 'grace_extended') {
      assert.equal(graceResult.graceUntil, new Date(
        recoveryInvoiceCreatedAt.getTime() + 8 * 86_400_000,
      ).toISOString());
    }

    const staleRecoveryStart = await service.startRecovery(recoveryActors[1]!, {
      operation: 'start',
      action: 'retry',
      workspaceId: workspaceIds[0],
      recoveryId,
      reason: 'Retry only the existing Owner-confirmed invoice, case 8127',
    });
    await service.verifyRecoveryFactor(recoveryActors[1]!, staleRecoveryStart.token, {
      method: 'totp',
      code: nextTotpCode(recoveryActors[1]!.userId),
    });
    await owner('billingRenewalRecoveries').where({ id: recoveryId }).update({ attempts: 1 });
    await assert.rejects(
      service.commitRecovery(recoveryActors[1]!, staleRecoveryStart.token),
      error => error instanceof Error && 'status' in error && error.status === 409,
    );
    await owner('billingRenewalRecoveries').where({ id: recoveryId }).update({ attempts: 0 });

    const retryStart = await service.startRecovery(recoveryActors[2]!, {
      operation: 'start',
      action: 'retry',
      workspaceId: workspaceIds[0],
      recoveryId,
      reason: 'Retry only the existing Owner-confirmed invoice, case 8128',
    });
    await assert.rejects(
      service.verifyRecoveryFactor(recoveryActors[2]!, retryStart.token, {
        method: 'totp',
        code: totpCode(Math.floor(Date.now() / 30_000) + 10),
      }),
      error => error instanceof Error && 'status' in error && error.status === 422,
    );
    await service.verifyRecoveryFactor(recoveryActors[2]!, retryStart.token, {
      method: 'totp',
      code: nextTotpCode(recoveryActors[2]!.userId),
    });
    const retryResult = await service.commitRecovery(recoveryActors[2]!, retryStart.token);
    assert.deepEqual(retryResult, {
      status: 'owner_action_required',
      recoveryId,
      handoff: 'workspace_owner_billing',
    });
    assert.equal(JSON.stringify(retryResult).includes('pi_adminrecovery_secret'), false);
    assert.deepEqual(recoveryIdempotencyKeys, [`salesmora-renewal-${recoveryId}`]);
    assert.equal(recoveryPaymentAttempts, 1);
    assert.equal((await owner('billingRenewalRecoveries').where({ id: recoveryId })
      .first<{ state: string }>('state'))?.state, 'action');

    const cancelStart = await service.startRecovery(recoveryActors[3]!, {
      operation: 'start',
      action: 'cancel',
      workspaceId: workspaceIds[0],
      recoveryId,
      reason: 'Stop worker retries while the Owner completes authentication, case 8129',
    });
    await service.verifyRecoveryFactor(recoveryActors[3]!, cancelStart.token, {
      method: 'totp',
      code: nextTotpCode(recoveryActors[3]!.userId),
    });
    const cancelResult = await service.commitRecovery(recoveryActors[3]!, cancelStart.token);
    assert.deepEqual(cancelResult, {
      status: 'retries_cancelled',
      paymentState: 'requires_action',
    });
    await assert.rejects(
      service.commitRecovery(recoveryActors[3]!, cancelStart.token),
      error => error instanceof Error && 'status' in error && error.status === 409,
    );
    const cancelledRecovery = await owner('billingRenewalRecoveries').where({ id: recoveryId })
      .first<{ state: string; retryCancelledAt: Date | null }>('state', 'retryCancelledAt');
    assert.equal(cancelledRecovery?.state, 'action');
    assert.ok(cancelledRecovery?.retryCancelledAt);
    assert.equal(recoveryPaymentAttempts, 1);
    assert.equal((recoveryPaymentIntent as { status: string } | null)?.status, 'requires_action');
    const recoveryAudit = await owner.withSchema('admin').table('auditEvents')
      .where({ workspaceId: workspaceIds[0] })
      .whereIn('action', [
        'workspace.billing.recovery.review_started',
        'workspace.billing.recovery.factor_failed',
        'workspace.billing.recovery.factor_verified',
        'workspace.billing.recovery.grace_extended',
        'workspace.billing.recovery.retry_completed',
        'workspace.billing.recovery.retries_cancelled',
      ])
      .select<{ action: string; reason: string | null; after: Record<string, unknown> }[]>(
        'action', 'reason', 'after',
      );
    assert.ok(recoveryAudit.some(event => event.action === 'workspace.billing.recovery.factor_failed'));
    assert.ok(recoveryAudit.some(event => event.action === 'workspace.billing.recovery.retry_completed'));
    assert.ok(recoveryAudit.some(event => event.action === 'workspace.billing.recovery.retries_cancelled'));
    assert.ok(recoveryAudit.every(event => event.reason !== null));
    assert.equal(JSON.stringify(recoveryAudit).includes('pi_adminrecovery_secret'), false);
    assert.equal(JSON.stringify(recoveryAudit).includes(recoveryInvoiceId), false);
    assert.equal(JSON.stringify(recoveryAudit).includes(recoveryCustomerId), false);
    await owner('billingRecoveryGraceExtensions').where({ workspaceId: workspaceIds[0] }).delete();
    await owner('billingRenewalRecoveries').where({ id: recoveryId }).delete();
    await owner('workspaceSubscriptions').where({ workspaceId: workspaceIds[0] }).update({
      customerId: 'cus_adminplan',
      subscriptionId: activePlanSubscription.id,
      status: 'active',
      recoveryUntil: null,
    });

    await owner('billingWebhookEvents').insert([
      {
        id: webhookReplayEventId,
        type: 'invoice.payment_failed',
        objectId: 'in_webhook_replay_fixture',
        workspaceId: workspaceIds[0],
        receivedAt: now,
        attempts: 1,
        retryAt: new Date(now.getTime() + 60_000),
      },
      {
        id: webhookReplayNeverFailedEventId,
        type: 'invoice.payment_failed',
        objectId: 'in_webhook_never_failed_fixture',
        workspaceId: workspaceIds[0],
        receivedAt: now,
        attempts: 0,
        retryAt: now,
      },
      {
        id: webhookReplayProcessedEventId,
        type: 'invoice.payment_failed',
        objectId: 'in_webhook_processed_fixture',
        workspaceId: workspaceIds[0],
        receivedAt: now,
        processedAt: now,
        attempts: 1,
        retryAt: now,
      },
      {
        id: webhookReplayDeletionEventId,
        type: 'invoice.payment_failed',
        objectId: 'in_webhook_deletion_fixture',
        workspaceId: workspaceIds[3],
        receivedAt: now,
        attempts: 1,
        retryAt: new Date(now.getTime() + 60_000),
      },
    ]);

    const webhookReplayMethods = await webhookReplayRequest(webhookReplayActor, 'GET');
    assert.equal(webhookReplayMethods.status, 200);
    assert.equal(webhookReplayMethods.headers.get('cache-control'), 'no-store');
    assert.equal(webhookReplayMethods.headers.get('referrer-policy'), 'no-referrer');
    const webhookReplayOverview = await webhookReplayMethods.json() as {
      workspaceId: string;
      deletionPending: boolean;
      methods: string[];
      events: { replayKey: string; attempts: number; processedAt: string | null }[];
    };
    assert.equal(webhookReplayOverview.workspaceId, workspaceIds[0]);
    assert.equal(webhookReplayOverview.deletionPending, false);
    assert.ok(webhookReplayOverview.methods.includes('totp'));
    assert.ok(webhookReplayOverview.events.some(event =>
      event.replayKey === webhookReplayEventId && event.attempts === 1 && event.processedAt === null));
    const deletingWorkspaceOverviewResponse = await webhookReplayRequest(
      webhookReplayActor,
      'GET',
      workspaceIds[3],
    );
    assert.equal(deletingWorkspaceOverviewResponse.status, 200);
    const deletingWorkspaceOverview = await deletingWorkspaceOverviewResponse.json() as {
      deletionPending: boolean;
      events: { replayKey: string }[];
    };
    assert.equal(deletingWorkspaceOverview.deletionPending, true);
    assert.deepEqual(deletingWorkspaceOverview.events, []);
    assert.equal(JSON.stringify(await service.readBilling(billing, {
      workspaceId: workspaceIds[0],
    })).includes(webhookReplayEventId), false);
    assert.equal((await webhookReplayRequest(null, 'GET')).status, 401);
    assert.equal((await webhookReplayRequest(support, 'GET')).status, 403);
    assert.equal((await webhookReplayRequest(billing, 'GET')).status, 403);
    await assert.rejects(
      service.webhookReplayMethods(billing, workspaceIds[0]),
      error => error instanceof Error && 'status' in error && error.status === 403,
    );
    assert.equal((await webhookReplayRequest(
      webhookReplayActor,
      'POST',
      workspaceIds[0],
      JSON.stringify({
        operation: 'start',
        workspaceId: workspaceIds[0],
        eventId: webhookReplayEventId,
        reason: 'Retry the failed renewal webhook, case 8401',
      }),
      'https://untrusted.example',
    )).status, 403);
    assert.equal((await webhookReplayRequest(
      webhookReplayActor,
      'POST',
      workspaceIds[0],
      JSON.stringify({
        operation: 'start',
        workspaceId: workspaceIds[1],
        eventId: webhookReplayEventId,
        reason: 'Retry the failed renewal webhook, case 8401',
      }),
    )).status, 400);
    for (const [eventId, workspaceId] of [
      [webhookReplayNeverFailedEventId, workspaceIds[0]],
      [webhookReplayProcessedEventId, workspaceIds[0]],
      [webhookReplayDeletionEventId, workspaceIds[3]],
    ] as const) {
      assert.equal((await webhookReplayRequest(
        webhookReplayActor,
        'POST',
        workspaceId,
        JSON.stringify({
          operation: 'start',
          workspaceId,
          eventId,
          reason: 'Retry a webhook only when its inbox state permits, case 8402',
        }),
      )).status, 409);
    }
    assert.equal((await webhookReplayRequest(
      billing,
      'POST',
      workspaceIds[0],
      JSON.stringify({
        operation: 'start',
        workspaceId: workspaceIds[0],
        eventId: webhookReplayEventId,
        reason: 'Retry the failed renewal webhook, case 8403',
      }),
    )).status, 403);

    const webhookReplayReason = 'Retry only the existing failed webhook event, case 8404';
    const webhookReplayStartResponse = await webhookReplayRequest(
      webhookReplayActor,
      'POST',
      workspaceIds[0],
      JSON.stringify({
        operation: 'start',
        workspaceId: workspaceIds[0],
        eventId: webhookReplayEventId,
        reason: webhookReplayReason,
      }),
    );
    assert.equal(webhookReplayStartResponse.status, 200);
    assert.equal(webhookReplayStartResponse.headers.get('cache-control'), 'no-store');
    const webhookReplayStart = await webhookReplayStartResponse.json() as { token: string; options: { challenge: string } };
    assert.equal(JSON.stringify(webhookReplayStart).includes(webhookReplayEventId), false);

    const mismatchedWebhookFactor = await webhookReplayRequest(
      webhookReplayActor,
      'POST',
      workspaceIds[0],
      JSON.stringify({
        operation: 'factor',
        workspaceId: workspaceIds[1],
        token: webhookReplayStart.token,
        method: 'totp',
        code: '123456',
      }),
    );
    assert.equal(mismatchedWebhookFactor.status, 400);
    const failedWebhookFactor = await webhookReplayRequest(
      webhookReplayActor,
      'POST',
      workspaceIds[0],
      JSON.stringify({
        operation: 'factor',
        workspaceId: workspaceIds[0],
        token: webhookReplayStart.token,
        method: 'totp',
        code: totpCode(Math.floor(Date.now() / 30_000) + 10),
      }),
    );
    assert.equal(failedWebhookFactor.status, 422);
    const validWebhookFactor = await webhookReplayRequest(
      webhookReplayActor,
      'POST',
      workspaceIds[0],
      JSON.stringify({
        operation: 'factor',
        workspaceId: workspaceIds[0],
        token: webhookReplayStart.token,
        method: 'totp',
        code: nextTotpCode(webhookReplayActor.userId),
      }),
    );
    assert.equal(validWebhookFactor.status, 200);
    assert.deepEqual(await validWebhookFactor.json(), { verified: true });

    await owner('billingWebhookEvents').where({ id: webhookReplayEventId }).update({ attempts: 2 });
    const staleWebhookCommit = await webhookReplayRequest(
      webhookReplayActor,
      'POST',
      workspaceIds[0],
      JSON.stringify({
        operation: 'commit',
        workspaceId: workspaceIds[0],
        token: webhookReplayStart.token,
      }),
    );
    assert.equal(staleWebhookCommit.status, 409);
    const originalRetryAt = new Date(now.getTime() + 60_000);
    await owner('billingWebhookEvents').where({ id: webhookReplayEventId })
      .update({ attempts: 1, retryAt: originalRetryAt });

    const currentWebhookReplayStartResponse = await webhookReplayRequest(
      webhookReplayActor,
      'POST',
      workspaceIds[0],
      JSON.stringify({
        operation: 'start',
        workspaceId: workspaceIds[0],
        eventId: webhookReplayEventId,
        reason: webhookReplayReason,
      }),
    );
    assert.equal(currentWebhookReplayStartResponse.status, 200);
    const currentWebhookReplayStart = await currentWebhookReplayStartResponse.json() as { token: string };
    const currentWebhookFactor = await webhookReplayRequest(
      webhookReplayActor,
      'POST',
      workspaceIds[0],
      JSON.stringify({
        operation: 'factor',
        workspaceId: workspaceIds[0],
        token: currentWebhookReplayStart.token,
        method: 'totp',
        code: nextTotpCode(webhookReplayActor.userId),
      }),
    );
    assert.equal(currentWebhookFactor.status, 200);
    const webhookReplayResultResponse = await webhookReplayRequest(
      webhookReplayActor,
      'POST',
      workspaceIds[0],
      JSON.stringify({
        operation: 'commit',
        workspaceId: workspaceIds[0],
        token: currentWebhookReplayStart.token,
      }),
    );
    assert.equal(webhookReplayResultResponse.status, 200);
    assert.equal(webhookReplayResultResponse.headers.get('cache-control'), 'no-store');
    const webhookReplayResult = await webhookReplayResultResponse.json();
    assert.deepEqual(webhookReplayResult, { status: 'queued' });
    assert.equal(JSON.stringify(webhookReplayResult).includes(webhookReplayEventId), false);
    const queuedWebhook = await owner('billingWebhookEvents').where({ id: webhookReplayEventId })
      .first<{ id: string; attempts: number; processedAt: Date | null; retryAt: Date }>(
        'id', 'attempts', 'processedAt', 'retryAt',
      );
    assert.equal(queuedWebhook?.id, webhookReplayEventId);
    assert.equal(queuedWebhook?.attempts, 1);
    assert.equal(queuedWebhook?.processedAt, null);
    assert.equal(new Date(queuedWebhook!.retryAt).getTime() <= Date.now(), true);
    assert.equal(await owner('billingWebhookEvents').where({ id: webhookReplayEventId })
      .count('* as count').first().then(row => Number(row?.count)), 1);
    assert.equal((await webhookReplayRequest(
      webhookReplayActor,
      'POST',
      workspaceIds[0],
      JSON.stringify({
        operation: 'commit',
        workspaceId: workspaceIds[0],
        token: currentWebhookReplayStart.token,
      }),
    )).status, 409);
    const webhookReplayAudit = await owner.withSchema('admin').table('auditEvents')
      .where({ workspaceId: workspaceIds[0], targetId: webhookReplayEventId })
      .whereIn('action', [
        'workspace.billing.webhook_replay.review_started',
        'workspace.billing.webhook_replay.factor_failed',
        'workspace.billing.webhook_replay.factor_verified',
        'workspace.billing.webhook_replay.queued',
      ])
      .select<{ action: string; reason: string | null }[]>('action', 'reason');
    assert.ok(webhookReplayAudit.some(event => event.action === 'workspace.billing.webhook_replay.factor_failed'));
    assert.ok(webhookReplayAudit.some(event => event.action === 'workspace.billing.webhook_replay.factor_verified'));
    assert.equal(webhookReplayAudit.filter(event => event.action === 'workspace.billing.webhook_replay.queued').length, 1);
    assert.ok(webhookReplayAudit.every(event => event.reason === webhookReplayReason));

    const pastDue = await service.readDirectory(billing, { query: prefix, status: 'past_due' });
    assert.deepEqual(pastDue.workspaces.map(item => item.id), [workspaceIds[1]]);
    const suspended = await service.readDirectory(support, { query: prefix, status: 'suspended' });
    assert.deepEqual(suspended.workspaces.map(item => item.id), [workspaceIds[2]]);
    const deleting = await service.readDirectory(support, { query: prefix, status: 'deleting' });
    assert.deepEqual(deleting.workspaces.map(item => item.id), [workspaceIds[3]]);

    const activeOverrides = await service.readDirectory(billing, { query: prefix, plan: 'override' });
    assert.deepEqual(activeOverrides.workspaces.map(item => item.id), [workspaceIds[0]]);
    const freePlan = await service.readDirectory(billing, { query: prefix, plan: 'free' });
    assert.deepEqual(freePlan.workspaces.map(item => item.id), [workspaceIds[3]]);
    await assert.rejects(
      service.readDirectory(unassigned, { query: prefix }),
      error => error instanceof Error && 'status' in error && error.status === 403,
    );
    await assert.rejects(
      service.readDirectory(support, { query: prefix, status: 'not-a-status' }),
      error => error instanceof Error && 'status' in error && error.status === 400,
    );

    assert.deepEqual(await service.suspensionMethods(support), { methods: ['totp'] });
    await assert.rejects(
      service.suspensionMethods(billing),
      error => error instanceof Error && 'status' in error && error.status === 403,
    );
    await assert.rejects(
      service.startSuspension(support, {
        operation: 'start',
        workspaceId: workspaceIds[3],
        action: 'suspend',
        reason: 'Deletion pending blocks access changes',
      }),
      error => error instanceof Error && 'status' in error && error.status === 409,
    );
    await assert.rejects(
      service.startSuspension(billing, {
        operation: 'start',
        workspaceId: workspaceIds[0],
        action: 'suspend',
        reason: 'Billing must not change workspace access',
      }),
      error => error instanceof Error && 'status' in error && error.status === 403,
    );
    await assert.rejects(
      service.startSuspension(support, {
        operation: 'start',
        workspaceId: workspaceIds[0],
        action: 'suspend',
        reason: 'short',
      }),
      error => error instanceof Error && 'status' in error && error.status === 400,
    );

    const roleRecheck = await service.startSuspension(support, {
      operation: 'start',
      workspaceId: workspaceIds[1],
      action: 'suspend',
      reason: 'Role change recheck rehearsal',
    });
    await service.verifySuspensionFactor(support, roleRecheck.token, {
      method: 'totp',
      code: nextTotpCode(support.userId),
    });
    await owner.withSchema('admin').table('staffRoleAssignments')
      .where({ userId: support.userId }).update({ role: 'billing' });
    try {
      await assert.rejects(
        service.commitSuspension(support, roleRecheck.token),
        error => error instanceof Error && 'status' in error && error.status === 403,
      );
      assert.equal((await owner('workspaces').where({ id: workspaceIds[1] }).first('suspendedAt'))?.suspendedAt, null);
    } finally {
      await owner.withSchema('admin').table('staffRoleAssignments')
        .where({ userId: support.userId }).update({ role: 'support' });
    }

    const suspensionReason = 'Chargeback review, ticket 4790';
    const suspension = await service.startSuspension(support, {
      operation: 'start',
      workspaceId: workspaceIds[0],
      action: 'suspend',
      reason: suspensionReason,
    });
    await service.verifySuspensionFactor(support, suspension.token, { method: 'totp', code: nextTotpCode(support.userId) });
    const suspendedResult = await service.commitSuspension(support, suspension.token);
    assert.deepEqual(suspendedResult, {
      action: 'suspend',
      changed: true,
      suspendedAt: suspendedResult.suspendedAt,
    });
    assert.ok(suspendedResult.suspendedAt);
    assert.equal((await owner('workspaces').where({ id: workspaceIds[0] }).first('suspendedReason'))?.suspendedReason, suspensionReason);
    assert.equal(await owner('suspensionAudit').where({
      subjectType: 'workspace',
      subjectId: workspaceIds[0],
      action: 'suspended',
      reason: suspensionReason,
    }).count('* as count').first().then(row => Number(row?.count)), 1);
    const actionAudit = await owner.withSchema('admin').table('auditEvents')
      .where({ action: 'workspace.suspended', targetId: workspaceIds[0] })
      .first<{ reason: string; workspaceId: string }>('reason', 'workspaceId');
    assert.equal(actionAudit?.reason, suspensionReason);
    assert.equal(actionAudit?.workspaceId, workspaceIds[0]);
    const notice = await owner('workspaceSuspensionNotices').where({ workspaceId: workspaceIds[0] })
      .first<{ status: string }>('status');
    assert.equal(notice?.status, 'queued');
    await assert.rejects(
      service.commitSuspension(support, suspension.token),
      error => error instanceof Error && 'status' in error && error.status === 409,
    );

    const unsuspension = await service.startSuspension(support, {
      operation: 'start',
      workspaceId: workspaceIds[0],
      action: 'unsuspend',
      reason: 'Chargeback review completed',
    });
    await service.verifySuspensionFactor(support, unsuspension.token, {
      method: 'totp',
      code: nextTotpCode(support.userId),
    });
    const unsuspendedResult = await service.commitSuspension(support, unsuspension.token);
    assert.equal(unsuspendedResult.action, 'unsuspend');
    assert.equal(unsuspendedResult.changed, true);
    assert.equal(unsuspendedResult.suspendedAt, null);
    assert.equal((await owner('workspaceSuspensionNotices').where({ workspaceId: workspaceIds[0] })
      .first<{ status: string }>('status'))?.status, 'skipped');
    assert.equal(await owner('suspensionAudit').where({
      subjectType: 'workspace',
      subjectId: workspaceIds[0],
      action: 'unsuspended',
      reason: 'Chargeback review completed',
    }).count('* as count').first().then(row => Number(row?.count)), 1);

    const expiredChallenge = await service.startSuspension(support, {
      operation: 'start',
      workspaceId: workspaceIds[1],
      action: 'suspend',
      reason: 'Expired challenge rehearsal',
    });
    await owner.withSchema('admin').table('staffActionChallenges')
      .where({ id: invitationTokenHash(expiredChallenge.token) })
      .update({ expiresAt: new Date(Date.now() - 1) });
    await assert.rejects(
      service.commitSuspension(support, expiredChallenge.token),
      error => error instanceof Error && 'status' in error && error.status === 409,
    );

    await owner('users').insert({
      id: ownershipCandidateId,
      name: `${prefix} Owner Transfer Candidate`,
      email: `${prefix}-candidate@example.test`,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
      termsVersion: 'workspace-ownership-transfer-rehearsal',
      termsAcceptedAt: now,
    });
    await owner('workspaceMemberships').insert({
      workspaceId: workspaceIds[0],
      userId: ownershipCandidateId,
      role: 'office',
    });

    const ownershipMethods = await ownershipRequest(superAdmin, 'GET');
    assert.equal(ownershipMethods.status, 200);
    assert.equal(ownershipMethods.headers.get('cache-control'), 'no-store');
    assert.ok((await ownershipMethods.json()).methods.includes('totp'));
    assert.equal((await ownershipRequest(support, 'GET')).status, 403);
    assert.equal((await ownershipRequest(billing, 'GET')).status, 403);
    assert.equal((await ownershipRequest(null, 'GET')).status, 401);
    assert.equal((await ownershipRequest(staleSession, 'GET')).status, 401);

    const transferStart = {
      operation: 'start',
      workspaceId: workspaceIds[0],
      expectedOwnerUserId: userIds[0],
      newOwnerUserId: ownershipCandidateId,
      reason: 'Workspace owner requested transfer',
    };
    assert.equal((await ownershipRequest(
      superAdmin, 'POST', workspaceIds[0], JSON.stringify(transferStart), 'https://untrusted.example',
    )).status, 403);
    assert.equal((await ownershipRequest(
      superAdmin,
      'POST',
      workspaceIds[0],
      JSON.stringify({ ...transferStart, reason: 'x'.repeat(16_385) }),
    )).status, 413);
    await assert.rejects(
      service.startOwnershipTransfer(superAdmin, { ...transferStart, expectedOwnerUserId: userIds[1] }),
      error => error instanceof Error && 'status' in error && error.status === 409,
    );
    await assert.rejects(
      service.startOwnershipTransfer(superAdmin, { ...transferStart, newOwnerUserId: userIds[1] }),
      error => error instanceof Error && 'status' in error && error.status === 409,
    );
    await assert.rejects(
      service.startOwnershipTransfer(superAdmin, { ...transferStart, workspaceId: workspaceIds[3] }),
      error => error instanceof Error && 'status' in error && error.status === 409,
    );
    await assert.rejects(
      service.startOwnershipTransfer(support, transferStart),
      error => error instanceof Error && 'status' in error && error.status === 403,
    );

    const roleRecheckResponse = await ownershipRequest(superAdmin, 'POST', workspaceIds[0], JSON.stringify(transferStart));
    assert.equal(roleRecheckResponse.status, 200);
    const ownershipRoleChallenge = await roleRecheckResponse.json() as { token: string };
    const currentStep = Math.floor(Date.now() / 30_000);
    const validTotpCodes = new Set([currentStep - 1, currentStep, currentStep + 1].map(totpCode));
    let invalidTotpCode = '000000';
    while (validTotpCodes.has(invalidTotpCode)) {
      invalidTotpCode = String((Number(invalidTotpCode) + 1) % 1_000_000).padStart(6, '0');
    }
    assert.equal((await ownershipRequest(superAdmin, 'POST', workspaceIds[0], JSON.stringify({
      operation: 'factor',
      token: ownershipRoleChallenge.token,
      method: 'totp',
      code: invalidTotpCode,
    }))).status, 422);
    const roleFactor = await ownershipRequest(superAdmin, 'POST', workspaceIds[0], JSON.stringify({
      operation: 'factor',
      token: ownershipRoleChallenge.token,
      method: 'totp',
      code: nextTotpCode(superAdmin.userId),
    }));
    assert.equal(roleFactor.status, 200);
    await owner.withSchema('admin').table('staffRoleAssignments')
      .where({ userId: superAdmin.userId }).update({ role: 'support' });
    try {
      assert.equal((await ownershipRequest(superAdmin, 'POST', workspaceIds[0], JSON.stringify({
        operation: 'commit',
        token: ownershipRoleChallenge.token,
      }))).status, 403);
      assert.equal((await owner('workspaces').where({ id: workspaceIds[0] }).first('ownerId'))?.ownerId, userIds[0]);
    } finally {
      await owner.withSchema('admin').table('staffRoleAssignments')
        .where({ userId: superAdmin.userId }).update({ role: 'super_admin' });
    }

    const expiredTransfer = await service.startOwnershipTransfer(superAdmin, transferStart);
    await owner.withSchema('admin').table('staffActionChallenges')
      .where({ id: invitationTokenHash(expiredTransfer.token) })
      .update({ expiresAt: new Date(Date.now() - 1) });
    await assert.rejects(
      service.commitOwnershipTransfer(superAdmin, expiredTransfer.token),
      error => error instanceof Error && 'status' in error && error.status === 409,
    );

    const transferReason = 'Workspace owner requested transfer';
    const liveTransferStart = await ownershipRequest(superAdmin, 'POST', workspaceIds[0], JSON.stringify({
      ...transferStart,
      reason: transferReason,
    }));
    assert.equal(liveTransferStart.status, 200);
    const startedTransfer = await liveTransferStart.json() as { token: string };
    const verifiedTransfer = await ownershipRequest(superAdmin, 'POST', workspaceIds[0], JSON.stringify({
      operation: 'factor',
      token: startedTransfer.token,
      method: 'totp',
      code: nextTotpCode(superAdmin.userId),
    }));
    assert.equal(verifiedTransfer.status, 200);
    assert.deepEqual(await verifiedTransfer.json(), { verified: true });
    const committedTransfer = await ownershipRequest(superAdmin, 'POST', workspaceIds[0], JSON.stringify({
      operation: 'commit',
      token: startedTransfer.token,
    }));
    assert.equal(committedTransfer.status, 200);
    assert.deepEqual(await committedTransfer.json(), {
      changed: true,
      previousOwnerUserId: userIds[0],
      newOwnerUserId: ownershipCandidateId,
    });
    assert.equal((await owner('workspaces').where({ id: workspaceIds[0] }).first('ownerId'))?.ownerId, ownershipCandidateId);
    const transferredRoles = await owner('workspaceMemberships').where({ workspaceId: workspaceIds[0] })
      .select<{ userId: string; role: string }[]>('userId', 'role');
    const rolesByUser = Object.fromEntries(transferredRoles.map(member => [member.userId, member.role]));
    assert.equal(rolesByUser[ownershipCandidateId], 'owner');
    assert.equal(rolesByUser[userIds[0]], 'admin');
    assert.equal(Object.values(rolesByUser).filter(role => role === 'owner').length, 1);
    assert.equal(await owner('authorizationAudit').where({
      workspaceId: workspaceIds[0],
      actorId: superAdmin.userId,
      action: 'ownership.transferred',
    }).count('* as count').first().then(row => Number(row?.count)), 1);
    const ownershipAudit = await owner.withSchema('admin').table('auditEvents')
      .where({ action: 'workspace.ownership.transferred', targetId: workspaceIds[0] })
      .first<{ reason: string; workspaceId: string }>('reason', 'workspaceId');
    assert.equal(ownershipAudit?.reason, transferReason);
    assert.equal(ownershipAudit?.workspaceId, workspaceIds[0]);
    const ownershipNotices = await owner('workspaceOwnershipNotices').where({ workspaceId: workspaceIds[0] })
      .orderBy('recipient').select<{ recipient: string; fromUserId: string; toUserId: string; status: string }[]>(
        'recipient', 'fromUserId', 'toUserId', 'status',
      );
    assert.deepEqual(ownershipNotices, [
      { recipient: 'new_owner', fromUserId: userIds[0], toUserId: ownershipCandidateId, status: 'queued' },
      { recipient: 'previous_owner', fromUserId: userIds[0], toUserId: ownershipCandidateId, status: 'queued' },
    ]);
    assert.equal((await ownershipRequest(superAdmin, 'POST', workspaceIds[0], JSON.stringify({
      operation: 'commit',
      token: startedTransfer.token,
    }))).status, 409);

    const planMethods = await planOverrideRequest(billing, 'GET', workspaceIds[1]);
    assert.equal(planMethods.status, 200);
    assert.equal(planMethods.headers.get('cache-control'), 'no-store');
    assert.ok((await planMethods.json()).methods.includes('totp'));
    assert.equal((await planOverrideRequest(support, 'GET', workspaceIds[1])).status, 403);
    assert.equal((await planOverrideRequest(superAdmin, 'GET', workspaceIds[1])).status, 200);
    assert.equal((await planOverrideRequest(null, 'GET', workspaceIds[1])).status, 401);
    assert.equal((await planOverrideRequest(staleSession, 'GET', workspaceIds[1])).status, 401);

    const planEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const planStart = {
      operation: 'start',
      action: 'apply',
      workspaceId: workspaceIds[1],
      plan: 'standard',
      endsAt: planEndsAt,
      reason: 'Approved pilot limits, ticket 4821',
    };
    assert.equal((await planOverrideRequest(
      billing, 'POST', workspaceIds[1], JSON.stringify(planStart), 'https://untrusted.example',
    )).status, 403);
    assert.equal((await planOverrideRequest(
      billing,
      'POST',
      workspaceIds[1],
      JSON.stringify({ ...planStart, reason: 'x'.repeat(16_385) }),
    )).status, 413);
    await assert.rejects(
      service.startPlanOverride(support, planStart),
      error => error instanceof Error && 'status' in error && error.status === 403,
    );
    await assert.rejects(
      service.startPlanOverride(billing, { ...planStart, plan: 'free' }),
      error => error instanceof Error && 'status' in error && error.status === 400,
    );
    await assert.rejects(
      service.startPlanOverride(billing, {
        ...planStart,
        endsAt: new Date(Date.now() + 400 * 24 * 60 * 60 * 1000).toISOString(),
      }),
      error => error instanceof Error && 'status' in error && error.status === 400,
    );
    await assert.rejects(
      service.startPlanOverride(billing, { ...planStart, workspaceId: workspaceIds[3] }),
      error => error instanceof Error && 'status' in error && error.status === 409,
    );
    await assert.rejects(
      service.startPlanOverride(billing, {
        operation: 'start',
        action: 'clear',
        workspaceId: workspaceIds[1],
        reason: 'No active override exists',
      }),
      error => error instanceof Error && 'status' in error && error.status === 409,
    );

    const roleOverride = await service.startPlanOverride(billing, planStart);
    const planCurrentStep = Math.floor(Date.now() / 30_000);
    const validCodes = new Set([planCurrentStep - 1, planCurrentStep, planCurrentStep + 1].map(totpCode));
    let invalidCode = '000000';
    while (validCodes.has(invalidCode)) invalidCode = String((Number(invalidCode) + 1) % 1_000_000).padStart(6, '0');
    await assert.rejects(
      service.verifyPlanOverrideFactor(billing, roleOverride.token, { method: 'totp', code: invalidCode }),
      error => error instanceof Error && 'status' in error && error.status === 422,
    );
    await service.verifyPlanOverrideFactor(billing, roleOverride.token, {
      method: 'totp',
      code: nextTotpCode(billing.userId),
    });
    await owner.withSchema('admin').table('staffRoleAssignments')
      .where({ userId: billing.userId }).update({ role: 'support' });
    try {
      await assert.rejects(
        service.commitPlanOverride(billing, roleOverride.token),
        error => error instanceof Error && 'status' in error && error.status === 403,
      );
      assert.equal((await owner('workspaces').where({ id: workspaceIds[1] }).first('planOverride'))?.planOverride, null);
    } finally {
      await owner.withSchema('admin').table('staffRoleAssignments')
        .where({ userId: billing.userId }).update({ role: 'billing' });
    }

    const expiredOverride = await service.startPlanOverride(billing, planStart);
    await owner.withSchema('admin').table('staffActionChallenges')
      .where({ id: invitationTokenHash(expiredOverride.token) })
      .update({ expiresAt: new Date(Date.now() - 1) });
    await assert.rejects(
      service.commitPlanOverride(billing, expiredOverride.token),
      error => error instanceof Error && 'status' in error && error.status === 409,
    );

    const staleActor = planOverrideActors[0];
    const staleOverride = await service.startPlanOverride(staleActor, planStart);
    await service.verifyPlanOverrideFactor(staleActor, staleOverride.token, {
      method: 'totp',
      code: nextTotpCode(staleActor.userId),
    });
    const competingOverrideId = randomUUID();
    await owner('workspaces').where({ id: workspaceIds[1] }).update({
      planOverride: 'premium',
      planOverrideEndsAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      planOverrideReason: 'Concurrent approved override',
      planOverrideId: competingOverrideId,
    });
    await assert.rejects(
      service.commitPlanOverride(staleActor, staleOverride.token),
      error => error instanceof Error && 'status' in error && error.status === 409,
    );
    await owner('workspaces').where({ id: workspaceIds[1] }).update({
      planOverride: null,
      planOverrideEndsAt: null,
      planOverrideReason: null,
      planOverrideId: null,
    });

    async function applyPlanOverrideThroughRoute(
      staff: Awaited<ReturnType<typeof seedStaff>>,
      plan: 'standard' | 'premium',
      reason: string,
    ) {
      const start = await planOverrideRequest(staff, 'POST', workspaceIds[1], JSON.stringify({
        ...planStart,
        plan,
        reason,
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }));
      assert.equal(start.status, 200);
      const started = await start.json() as { token: string };
      const factor = await planOverrideRequest(staff, 'POST', workspaceIds[1], JSON.stringify({
        operation: 'factor',
        token: started.token,
        method: 'totp',
        code: nextTotpCode(staff.userId),
      }));
      assert.equal(factor.status, 200);
      assert.deepEqual(await factor.json(), { verified: true });
      const committed = await planOverrideRequest(staff, 'POST', workspaceIds[1], JSON.stringify({
        operation: 'commit',
        token: started.token,
      }));
      assert.equal(committed.status, 200);
      return { result: await committed.json() as { action: string; changed: boolean; overrideId: string }, token: started.token };
    }

    const firstPlanOverride = await applyPlanOverrideThroughRoute(
      planOverrideActors[1], 'standard', 'Approved pilot limits, ticket 4821',
    );
    assert.deepEqual(firstPlanOverride.result, {
      action: 'apply',
      changed: true,
      overrideId: firstPlanOverride.result.overrideId,
    });
    const replacement = await applyPlanOverrideThroughRoute(
      planOverrideActors[2], 'premium', 'Pilot expanded, ticket 4822',
    );
    assert.notEqual(replacement.result.overrideId, firstPlanOverride.result.overrideId);
    const clearActor = planOverrideActors[3];
    const clearStart = await planOverrideRequest(clearActor, 'POST', workspaceIds[1], JSON.stringify({
      operation: 'start',
      action: 'clear',
      workspaceId: workspaceIds[1],
      reason: 'Pilot ended early, ticket 4823',
    }));
    assert.equal(clearStart.status, 200);
    const clearChallenge = await clearStart.json() as { token: string };
    assert.equal((await planOverrideRequest(clearActor, 'POST', workspaceIds[1], JSON.stringify({
      operation: 'factor',
      token: clearChallenge.token,
      method: 'totp',
      code: nextTotpCode(clearActor.userId),
    }))).status, 200);
    const cleared = await planOverrideRequest(clearActor, 'POST', workspaceIds[1], JSON.stringify({
      operation: 'commit',
      token: clearChallenge.token,
    }));
    assert.equal(cleared.status, 200);
    assert.deepEqual(await cleared.json(), {
      action: 'clear',
      changed: true,
      overrideId: replacement.result.overrideId,
    });
    assert.equal((await planOverrideRequest(clearActor, 'POST', workspaceIds[1], JSON.stringify({
      operation: 'commit',
      token: clearChallenge.token,
    }))).status, 409);
    assert.equal((await owner('workspaces').where({ id: workspaceIds[1] }).first('planOverride'))?.planOverride, null);
    assert.equal(await owner('billingAudit').where({ workspaceId: workspaceIds[1] })
      .whereIn('action', ['plan.override_applied', 'plan.override_cleared'])
      .count('* as count').first().then(row => Number(row?.count)), 3);
    assert.equal(await owner.withSchema('admin').table('auditEvents')
      .where({ workspaceId: workspaceIds[1] })
      .whereIn('action', ['workspace.plan_override.applied', 'workspace.plan_override.cleared'])
      .count('* as count').first<{ count: string | number }>().then(row => Number(row?.count)), 3);

    const aiBudgetMethods = await aiBudgetRequest(superAdmin, 'GET');
    assert.equal(aiBudgetMethods.status, 200);
    assert.equal(aiBudgetMethods.headers.get('cache-control'), 'no-store');
    assert.ok((await aiBudgetMethods.json()).methods.includes('totp'));
    assert.equal((await aiBudgetRequest(billing, 'GET')).status, 200);
    assert.equal((await aiBudgetRequest(support, 'GET')).status, 403);
    assert.equal((await aiBudgetRequest(unassigned, 'GET')).status, 403);
    assert.equal((await aiBudgetRequest(null, 'GET')).status, 401);
    const staleAIBudgetSession = await seedStaff('billing');
    await owner.withSchema('admin').table('staffSessions')
      .where({ id: staleAIBudgetSession.sessionId }).update({ expiresAt: new Date(Date.now() - 1) });
    assert.equal((await aiBudgetRequest(staleAIBudgetSession, 'GET')).status, 401);

    const aiBudgetInput = {
      operation: 'start',
      workspaceId: workspaceIds[0],
      monthlyTokens: 100_000,
      reason: 'Temporary usage allowance, ticket 4840',
    };
    assert.equal((await aiBudgetRequest(
      billing, 'POST', workspaceIds[0], JSON.stringify(aiBudgetInput), 'https://untrusted.example',
    )).status, 403);
    assert.equal((await aiBudgetRequest(
      billing, 'POST', workspaceIds[0], JSON.stringify({ ...aiBudgetInput, reason: 'x'.repeat(16_385) }),
    )).status, 413);
    assert.equal((await aiBudgetRequest(
      billing, 'POST', workspaceIds[0], JSON.stringify({ ...aiBudgetInput, monthlyTokens: 1_000_000_000_001 }),
    )).status, 400);
    assert.equal((await aiBudgetRequest(
      billing, 'POST', workspaceIds[0], JSON.stringify({ ...aiBudgetInput, monthlyTokens: 1.5 }),
    )).status, 400);
    assert.equal((await aiBudgetRequest(billing, 'POST', workspaceIds[3], JSON.stringify({
      ...aiBudgetInput, workspaceId: workspaceIds[3],
    }))).status, 409);

    const invalidFactorStart = await aiBudgetRequest(billing, 'POST', workspaceIds[0], JSON.stringify(aiBudgetInput));
    assert.equal(invalidFactorStart.status, 200);
    const invalidFactorChallenge = await invalidFactorStart.json() as { token: string };
    const aiBudgetCurrentStep = Math.floor(Date.now() / 30_000);
    const aiBudgetValidTotpCodes = new Set([
      aiBudgetCurrentStep - 1,
      aiBudgetCurrentStep,
      aiBudgetCurrentStep + 1,
    ].map(totpCode));
    let aiBudgetInvalidTotpCode = '000000';
    while (aiBudgetValidTotpCodes.has(aiBudgetInvalidTotpCode)) {
      aiBudgetInvalidTotpCode = String((Number(aiBudgetInvalidTotpCode) + 1) % 1_000_000).padStart(6, '0');
    }
    assert.equal((await aiBudgetRequest(billing, 'POST', workspaceIds[0], JSON.stringify({
      operation: 'factor',
      token: invalidFactorChallenge.token,
      method: 'totp',
      code: aiBudgetInvalidTotpCode,
    }))).status, 422);

    const liveAIBudgetStart = await aiBudgetRequest(billing, 'POST', workspaceIds[0], JSON.stringify(aiBudgetInput));
    assert.equal(liveAIBudgetStart.status, 200);
    const liveAIBudgetChallenge = await liveAIBudgetStart.json() as { token: string };
    const verifiedAIBudget = await aiBudgetRequest(billing, 'POST', workspaceIds[0], JSON.stringify({
      operation: 'factor',
      token: liveAIBudgetChallenge.token,
      method: 'totp',
      code: nextTotpCode(billing.userId),
    }));
    assert.equal(verifiedAIBudget.status, 200);
    assert.deepEqual(await verifiedAIBudget.json(), { verified: true });
    const committedAIBudget = await aiBudgetRequest(billing, 'POST', workspaceIds[0], JSON.stringify({
      operation: 'commit',
      token: liveAIBudgetChallenge.token,
    }));
    assert.equal(committedAIBudget.status, 200);
    assert.deepEqual(await committedAIBudget.json(), {
      changed: true,
      monthlyTokens: 100_000,
      previousMonthlyTokens: 75_000,
    });
    assert.equal(Number((await owner('workspaceAITokenBudgets').where({ workspaceId: workspaceIds[0] })
      .first('monthlyTokens'))?.monthlyTokens), 100_000);
    assert.equal((await aiBudgetRequest(billing, 'POST', workspaceIds[0], JSON.stringify({
      operation: 'commit',
      token: liveAIBudgetChallenge.token,
    }))).status, 409);
    assert.equal(await owner.withSchema('admin').table('auditEvents').where({
      workspaceId: workspaceIds[0],
      action: 'workspace.ai_budget.updated',
      reason: aiBudgetInput.reason,
    }).count('* as count').first<{ count: string | number }>().then(row => Number(row?.count)), 1);
    assert.ok((await owner.withSchema('admin').table('staffActionChallenges')
      .where({ id: invitationTokenHash(liveAIBudgetChallenge.token) }).first<{ consumedAt: Date | null }>('consumedAt'))
      ?.consumedAt, 'successful budget update consumes its verification challenge');

    const zeroBudgetStart = await aiBudgetRequest(superAdmin, 'POST', workspaceIds[1], JSON.stringify({
      ...aiBudgetInput,
      workspaceId: workspaceIds[1],
      monthlyTokens: 0,
      reason: 'Pause AI requests, ticket 4841',
    }));
    assert.equal(zeroBudgetStart.status, 200);
    const zeroChallenge = await zeroBudgetStart.json() as { token: string };
    assert.equal((await aiBudgetRequest(superAdmin, 'POST', workspaceIds[1], JSON.stringify({
      operation: 'factor',
      token: zeroChallenge.token,
      method: 'totp',
      code: nextTotpCode(superAdmin.userId),
    }))).status, 200);
    const zeroResult = await aiBudgetRequest(superAdmin, 'POST', workspaceIds[1], JSON.stringify({
      operation: 'commit',
      token: zeroChallenge.token,
    }));
    assert.equal(zeroResult.status, 200);
    assert.deepEqual(await zeroResult.json(), {
      changed: true,
      monthlyTokens: 0,
      previousMonthlyTokens: null,
    });

    const staleBudgetStart = await aiBudgetRequest(aiBudgetActors[0], 'POST', workspaceIds[0], JSON.stringify({
      ...aiBudgetInput,
      monthlyTokens: 80_000,
      reason: 'Concurrent budget update, ticket 4842',
    }));
    assert.equal(staleBudgetStart.status, 200);
    const staleBudgetChallenge = await staleBudgetStart.json() as { token: string };
    assert.equal((await aiBudgetRequest(aiBudgetActors[0], 'POST', workspaceIds[0], JSON.stringify({
      operation: 'factor',
      token: staleBudgetChallenge.token,
      method: 'totp',
      code: nextTotpCode(aiBudgetActors[0].userId),
    }))).status, 200);
    await owner('workspaceAITokenBudgets').where({ workspaceId: workspaceIds[0] }).update({ monthlyTokens: 90_000 });
    assert.equal((await aiBudgetRequest(aiBudgetActors[0], 'POST', workspaceIds[0], JSON.stringify({
      operation: 'commit',
      token: staleBudgetChallenge.token,
    }))).status, 409);
    assert.equal(Number((await owner('workspaceAITokenBudgets').where({ workspaceId: workspaceIds[0] })
      .first('monthlyTokens'))?.monthlyTokens), 90_000);

    const roleRecheckStart = await aiBudgetRequest(aiBudgetActors[1], 'POST', workspaceIds[0], JSON.stringify({
      ...aiBudgetInput,
      monthlyTokens: 95_000,
      reason: 'Role change recheck, ticket 4843',
    }));
    assert.equal(roleRecheckStart.status, 200);
    const roleRecheckChallenge = await roleRecheckStart.json() as { token: string };
    assert.equal((await aiBudgetRequest(aiBudgetActors[1], 'POST', workspaceIds[0], JSON.stringify({
      operation: 'factor',
      token: roleRecheckChallenge.token,
      method: 'totp',
      code: nextTotpCode(aiBudgetActors[1].userId),
    }))).status, 200);
    await owner.withSchema('admin').table('staffRoleAssignments')
      .where({ userId: aiBudgetActors[1].userId }).update({ role: 'support' });
    try {
      assert.equal((await aiBudgetRequest(aiBudgetActors[1], 'POST', workspaceIds[0], JSON.stringify({
        operation: 'commit',
        token: roleRecheckChallenge.token,
      }))).status, 403);
      assert.equal(Number((await owner('workspaceAITokenBudgets').where({ workspaceId: workspaceIds[0] })
        .first('monthlyTokens'))?.monthlyTokens), 90_000);
    } finally {
      await owner.withSchema('admin').table('staffRoleAssignments')
        .where({ userId: aiBudgetActors[1].userId }).update({ role: 'billing' });
    }

    const expiredBudgetStart = await aiBudgetRequest(aiBudgetActors[2], 'POST', workspaceIds[0], JSON.stringify({
      ...aiBudgetInput,
      monthlyTokens: 85_000,
      reason: 'Expired budget challenge, ticket 4844',
    }));
    assert.equal(expiredBudgetStart.status, 200);
    const expiredBudgetChallenge = await expiredBudgetStart.json() as { token: string };
    await owner.withSchema('admin').table('staffActionChallenges')
      .where({ id: invitationTokenHash(expiredBudgetChallenge.token) })
      .update({ expiresAt: new Date(Date.now() - 1) });
    assert.equal((await aiBudgetRequest(aiBudgetActors[2], 'POST', workspaceIds[0], JSON.stringify({
      operation: 'commit',
      token: expiredBudgetChallenge.token,
    }))).status, 409);

    const removeAction = {
      action: 'remove',
      workspaceId: workspaceIds[0],
      userId: userIds[1],
      reason: 'Remove rehearsal member, ticket 7001',
    };
    const removeBody = JSON.stringify(removeAction);
    assert.equal((await teamActionRequest(null, workspaceIds[0], removeBody)).status, 401);
    assert.equal((await teamActionRequest(support, workspaceIds[0], removeBody, {
      origin: 'https://untrusted.example',
    })).status, 403);
    assert.equal((await teamActionRequest(support, workspaceIds[0], removeBody, {
      contentType: 'text/plain',
    })).status, 415);
    assert.equal((await teamActionRequest(support, workspaceIds[0], '{')).status, 400);
    assert.equal((await teamActionRequest(support, workspaceIds[0], ' '.repeat(16_385))).status, 413);
    assert.equal((await teamActionRequest(support, workspaceIds[0], JSON.stringify({
      ...removeAction, workspaceId: workspaceIds[1],
    }))).status, 400);
    assert.equal((await teamActionRequest(billing, workspaceIds[0], removeBody)).status, 403);
    const removalResponse = await teamActionRequest(support, workspaceIds[0], removeBody);
    assert.equal(removalResponse.status, 200);
    assert.deepEqual(await removalResponse.json(), {
      action: 'remove',
      changed: true,
      unassignedLeads: 1,
    });
    assert.equal(await owner('workspaceMemberships').where({
      workspaceId: workspaceIds[0], userId: userIds[1],
    }).first(), undefined);
    assert.equal((await owner('leads').where({ id: leadId }).first('ownerId'))?.ownerId, null);
    assert.equal((await teamActionRequest(support, workspaceIds[0], JSON.stringify({
      ...removeAction, userId: ownershipCandidateId,
    }))).status, 409);

    const resendAction = {
      action: 'resend_invitation',
      workspaceId: workspaceIds[0],
      invitationId: teamInvitationId,
      reason: 'Resend rehearsal invitation, ticket 7002',
    };
    const supportIdentity = {
      userId: support.userId,
      sessionId: support.sessionId,
      accessEmail: support.accessEmail,
    };
    const deletingInvitationBefore = await owner('workspaceInvitations').where({ id: deletingTeamInvitationId })
      .first('status', 'tokenHash', 'expiresAt', 'lastAttemptAt');
    await assert.rejects(service.performTeamAction(supportIdentity, {
      ...resendAction,
      workspaceId: workspaceIds[3],
      invitationId: deletingTeamInvitationId,
    }), /pending deletion/);
    assert.deepEqual(await owner('workspaceInvitations').where({ id: deletingTeamInvitationId })
      .first('status', 'tokenHash', 'expiresAt', 'lastAttemptAt'), deletingInvitationBefore);

    failTeamInvitationDelivery = true;
    const failedDelivery = await service.performTeamAction(supportIdentity, resendAction);
    assert.equal(failedDelivery.action, 'resend_invitation');
    assert.equal('delivery' in failedDelivery && failedDelivery.delivery, 'failed');
    const firstSentMessage = sentTeamInvitations[0];
    assert.ok(firstSentMessage);
    assert.ok(firstSentMessage.idempotencyKey);
    const invitationAfterFailure = await owner('workspaceInvitations').where({ id: teamInvitationId })
      .first<{ tokenHash: string; expiresAt: Date }>('tokenHash', 'expiresAt');
    assert.ok(invitationAfterFailure?.tokenHash);
    assert.ok(invitationAfterFailure?.expiresAt.getTime() > Date.now());
    const failedOutbox = await owner.withSchema('admin').table('workspaceInvitationDeliveries')
      .where({ invitationId: teamInvitationId }).first<{ id: string; tokenHash: string; status: string; attempts: number; encryptedPayload: string | null }>(
        'id', 'tokenHash', 'status', 'attempts', 'encryptedPayload',
      );
    assert.ok(failedOutbox);
    assert.equal(failedOutbox?.status, 'failed');
    assert.equal(failedOutbox?.attempts, 1);
    assert.equal(failedOutbox?.tokenHash, invitationAfterFailure?.tokenHash);
    assert.ok(failedOutbox?.encryptedPayload);

    await owner.withSchema('admin').table('staffRoleAssignments')
      .where({ userId: support.userId }).update({ role: 'billing' });
    try {
      await assert.rejects(service.performTeamAction(supportIdentity, resendAction), /cannot resend workspace invitations/);
      assert.equal(sentTeamInvitations.length, 1);
      assert.equal((await owner('workspaceInvitations').where({ id: teamInvitationId })
        .first<{ tokenHash: string }>('tokenHash'))?.tokenHash, invitationAfterFailure?.tokenHash);
    } finally {
      await owner.withSchema('admin').table('staffRoleAssignments')
        .where({ userId: support.userId }).update({ role: 'support' });
    }

    failTeamInvitationDelivery = false;
    const retriedDelivery = await service.performTeamAction(supportIdentity, resendAction);
    assert.equal(retriedDelivery.action, 'resend_invitation');
    assert.equal('delivery' in retriedDelivery && retriedDelivery.delivery, 'sent');
    assert.equal(sentTeamInvitations.length, 2);
    assert.equal(sentTeamInvitations[1]?.idempotencyKey, firstSentMessage.idempotencyKey);
    assert.equal(sentTeamInvitations[1]?.text, firstSentMessage.text);
    assert.equal((await owner('workspaceInvitations').where({ id: teamInvitationId })
      .first<{ tokenHash: string }>('tokenHash'))?.tokenHash, invitationAfterFailure?.tokenHash);
    const sentOutbox = await owner.withSchema('admin').table('workspaceInvitationDeliveries')
      .where({ id: failedOutbox.id }).first<{ status: string; attempts: number; encryptedPayload: string | null }>(
        'status', 'attempts', 'encryptedPayload',
      );
    assert.equal(sentOutbox?.status, 'sent');
    assert.equal(sentOutbox?.attempts, 2);
    assert.equal(sentOutbox?.encryptedPayload, null);

    const teamAuditActions = await owner.withSchema('admin').table('auditEvents')
      .whereIn('action', [
        'workspace.member.removed',
        'workspace.invitation.resent',
        'workspace.invitation.delivery_failed',
        'workspace.invitation.delivery.retry_requested',
        'workspace.invitation.delivery_sent',
      ]).select<{ action: string }[]>('action');
    assert.ok(teamAuditActions.some(event => event.action === 'workspace.member.removed'));
    assert.ok(teamAuditActions.some(event => event.action === 'workspace.invitation.resent'));
    assert.ok(teamAuditActions.some(event => event.action === 'workspace.invitation.delivery_failed'));
    assert.ok(teamAuditActions.some(event => event.action === 'workspace.invitation.delivery.retry_requested'));
    assert.ok(teamAuditActions.some(event => event.action === 'workspace.invitation.delivery_sent'));

    console.log('Workspace database rehearsal passed: directory, billing reads/links, plan changes, recovery, webhook replay, role access, MFA, workspace controls, team actions, audits and notices.');
  } finally {
    await owner('aiUsageCalls').whereIn('workspaceId', workspaceIds).delete();
    await owner('workspaceAITokenBudgets').whereIn('workspaceId', workspaceIds).delete();
    await owner('billingWebhookEvents').whereIn('id', webhookReplayEventIds).delete();
    await owner('billingRecoveryGraceExtensions').whereIn('workspaceId', workspaceIds).delete();
    await owner('billingRenewalRecoveries').whereIn('workspaceId', workspaceIds).delete();
    await owner('billingPlanChanges').whereIn('workspaceId', workspaceIds).delete();
    await owner('billingAudit').whereIn('workspaceId', workspaceIds).delete();
    await owner('workspaceSubscriptions').whereIn('workspaceId', workspaceIds).delete();
    await owner('workspaces').whereIn('id', workspaceIds).delete();
    await owner('users').whereIn('id', [...userIds, ownershipCandidateId]).delete();
    await owner.withSchema('admin').table('staffUsers').whereIn('id', staffIds).delete();
    await Promise.all([owner.destroy(), adminDb.destroy()]);
  }
}

await main();
