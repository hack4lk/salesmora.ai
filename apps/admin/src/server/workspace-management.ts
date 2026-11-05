import 'server-only';
import { randomBytes, randomUUID } from 'node:crypto';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { symmetricDecrypt, symmetricEncrypt } from 'better-auth/crypto';
import {
  adminWorkspaceTeamActionSchema,
  adminWorkspaceTeamActionResultSchema,
  adminWorkspaceDetailRequestSchema,
  adminWorkspaceDetailResponseSchema,
  adminWorkspaceBillingRequestSchema,
  adminWorkspaceBillingResponseSchema,
  adminWorkspaceBillingLinksRequestSchema,
  adminWorkspaceBillingLinksResponseSchema,
  adminWorkspacePlanChangeOperationSchema,
  adminWorkspaceRecoveryOperationSchema,
  adminWorkspaceRecoveryMethodsSchema,
  adminWorkspaceRecoveryPreviewResponseSchema,
  adminWorkspaceRecoveryResultSchema,
  adminWorkspaceRecoveryStartResponseSchema,
  adminWorkspaceRecoveryVerifiedSchema,
  adminWorkspaceWebhookReplayOperationSchema,
  adminWorkspaceWebhookReplayOverviewSchema,
  adminWorkspaceWebhookReplayResultSchema,
  adminWorkspaceWebhookReplayStartResponseSchema,
  adminWorkspaceWebhookReplayVerifiedSchema,
  adminWorkspacePlanChangeMethodsSchema,
  adminWorkspacePlanChangePreviewResponseSchema,
  adminWorkspacePlanChangeResultSchema,
  adminWorkspacePlanChangeStartResponseSchema,
  adminWorkspacePlanChangeVerifiedSchema,
  adminWorkspaceDirectoryQuerySchema,
  adminWorkspaceDirectoryResponseSchema,
  adminWorkspaceAIBudgetMethodsSchema,
  adminWorkspaceAIBudgetOperationSchema,
  adminWorkspaceAIBudgetResultSchema,
  adminWorkspaceAIBudgetStartSchema,
  adminWorkspaceAIBudgetVerifiedSchema,
  adminWorkspaceOwnershipTransferMethodsSchema,
  adminWorkspaceOwnershipTransferOperationSchema,
  adminWorkspaceOwnershipTransferResultSchema,
  adminWorkspaceOwnershipTransferStartSchema,
  adminWorkspaceOwnershipTransferVerifiedSchema,
  adminWorkspacePlanOverrideMethodsSchema,
  adminWorkspacePlanOverrideOperationSchema,
  adminWorkspacePlanOverrideResultSchema,
  adminWorkspacePlanOverrideStartSchema,
  adminWorkspacePlanOverrideVerifiedSchema,
  adminWorkspaceSuspensionMethodsSchema,
  adminWorkspaceSuspensionOperationSchema,
  adminWorkspaceSuspensionResultSchema,
  adminWorkspaceSuspensionStartSchema,
  adminWorkspaceSuspensionVerifiedSchema,
  staffRoleIdSchema,
  staffRolePermissions,
  planChangeQuoteSchema,
  type AdminWorkspaceDetailResponse,
  type AdminWorkspacePlanChangeResult,
  type AdminWorkspaceRecoveryPreviewResponse,
  type AdminWorkspaceRecoveryResult,
  type AdminWorkspaceTeamAction,
  type AdminWorkspaceDirectoryResponse,
  type StaffRoleId,
} from '@salesmora/contracts';
import type { Knex } from '@salesmora/data';
import { createDatabase } from '@salesmora/data/database';
import { appendAdminAuditEvent } from '@salesmora/data/admin-audit';
import { sendEmail } from '@salesmora/data/email/transport';
import { renderTeamInvitationEmail } from '@salesmora/data/email/team-invitation';
import type { TeamInvitationEmailInput } from '@salesmora/data/email/team-invitation';
import { invitationTokenHash, openInvitationStatuses } from '@salesmora/data/invitation-tokens';
import {
  applyPlanOverride,
  clearPlanOverride,
  confirmAdminPlanChange as confirmAdminWorkspacePlanChange,
  configureWorkspaceAIBudgetInTransaction,
  defaultMonthlyAITokens,
  previewAdminPlanChange as previewAdminWorkspacePlanChange,
  cancelAdminRenewalRecovery,
  extendAdminRecoveryGrace,
  previewAdminRenewalRecovery,
  retryAdminRenewalRecovery,
  inspectAdminBillingWebhookReplay,
  queueAdminBillingWebhookReplay,
  readAdminBillingWebhookReplayEvents,
  PlanOverrideError,
} from '@salesmora/data';
import { CaptureCapacityError, type Stripe } from '@salesmora/data';
import { suspendWorkspace, unsuspendWorkspace } from '@salesmora/data/accounts/suspension';
import {
  removeWorkspaceMember,
  resendWorkspaceInvitation,
  TeamActionError,
  transferWorkspaceOwnership,
} from '@salesmora/data';
import { readAdminWorkspaceDetail, readAdminWorkspaceDirectory } from '@salesmora/data/admin-workspace-management';
import {
  readAdminWorkspaceBilling,
  readAdminWorkspaceBillingLinks,
} from '@salesmora/data/admin-billing-management';
import { normalizePlanOverride } from '@salesmora/domain';
import { verifyAdminActionFactor, type AdminActionFactor } from './admin-action-factor';
import { getAdminAuthConfiguration, getAdminCustomerAppURL } from './auth-config';
import { isAdminSessionWithinLimits } from './session-policy';

const configuration = getAdminAuthConfiguration();
export const workspaceManagementDatabase = createDatabase(configuration.databaseUrl);
const actionLifetime = 5 * 60 * 1000;
const planChangeConflicts = new Set([
  'An active paid subscription is required for admin plan changes.',
  'Choose a different plan.',
  'Resolve renewal payment first',
  'Missing billing.',
  'Finish the current plan change first.',
  'Resolve the pending subscription change or payment first.',
  'Wait until your renewal finishes before changing plans.',
  'Review a fresh quote.',
  'A change is already running.',
  'Subscription changed. Review again.',
  'Price changed. Review again.',
  'This change needs reconciliation before retrying.',
  'Subscription changed.',
  'Payment has not been verified.',
  'Admin plan changes cannot start checkout.',
  'Unsupported admin plan change.',
  'Plan change effective date is unavailable.',
  'Plan change is no longer active.',
  'Subscription mapping changed.',
]);
const recoveryConflicts = new Set([
  'No Owner-confirmed recovery is available to retry.',
  'No Owner-confirmed recovery is available to cancel.',
  'Invoice is already paid; no recovery retries remain.',
  'No open past-due renewal invoice can receive a grace extension.',
  'The invoice recovery grace window has expired.',
  'Recovery result is missing its recovery identifier.',
  'Recovery retry did not produce a safe staff result.',
  'Workspace owner mapping changed.',
  'Billing scope changed',
  'Recovery mapping changed',
  'Payment already pending',
]);

function rethrowPlanChangeError(error: unknown): never {
  if (error instanceof CaptureCapacityError) {
    throw new WorkspaceManagementError(error.message, 409);
  }
  if (error instanceof Error && planChangeConflicts.has(error.message)) {
    throw new WorkspaceManagementError(error.message, error.message === 'Missing billing.' ? 404 : 409);
  }
  throw error;
}

function rethrowRecoveryError(error: unknown): never {
  if (error instanceof Error && recoveryConflicts.has(error.message)) {
    throw new WorkspaceManagementError(error.message, 409);
  }
  throw error;
}

export class WorkspaceManagementError extends Error {
  constructor(message: string, readonly status = 400) { super(message); }
}

export interface WorkspaceManagementIdentity {
  userId: string;
  sessionId: string;
  accessEmail: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function decodeTeamInvitationDelivery(payload: string): { to: string; input: TeamInvitationEmailInput } {
  const value: unknown = JSON.parse(payload);
  if (!isRecord(value) || typeof value.to !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.to) ||
      !isRecord(value.input) || typeof value.input.url !== 'string' ||
      typeof value.input.inviterName !== 'string' || typeof value.input.workspaceName !== 'string' ||
      (value.input.role !== 'admin' && value.input.role !== 'office' && value.input.role !== 'field')) {
    throw new Error('Stored workspace invitation delivery is invalid.');
  }
  const url = new URL(value.input.url);
  if (!['https:', 'http:'].includes(url.protocol)) {
    throw new Error('Stored workspace invitation link is invalid.');
  }
  return {
    to: value.to,
    input: {
      url: url.href,
      inviterName: value.input.inviterName,
      workspaceName: value.input.workspaceName,
      role: value.input.role,
    },
  };
}

interface WorkspaceManagementContext {
  userAgent?: string | null;
}

interface WorkspaceAccessAuditTarget {
  action: string;
  targetType: string;
  targetId: string;
}

type Denial = { denied: 401 | 403 };
type Success<T> = { denied: false; value: T };
type WorkspaceActionChallenge = {
  id: string;
  input:
    | { kind: 'workspace_suspension'; workspaceId: string; action: 'suspend' | 'unsuspend'; reason: string }
    | {
      kind: 'workspace_ownership_transfer';
      workspaceId: string;
      expectedOwnerUserId: string;
      newOwnerUserId: string;
      reason: string;
    }
    | {
      kind: 'workspace_plan_override';
      workspaceId: string;
      action: 'apply';
      plan: 'standard' | 'premium';
      endsAt: string;
      reason: string;
      expectedOverrideId: string | null;
      expectedPlan: string | null;
      expectedEndsAt: string | null;
    }
    | {
      kind: 'workspace_plan_override';
      workspaceId: string;
      action: 'clear';
      reason: string;
      expectedOverrideId: string;
      expectedPlan: string;
      expectedEndsAt: string;
    }
    | {
      kind: 'workspace_plan_change';
      workspaceId: string;
      quoteId: string;
      quoteKind: 'upgrade' | 'downgrade' | 'free';
      plan: 'free' | 'standard' | 'premium';
      amountDue: number;
      effectiveAt: string;
      quoteExpiresAt: string;
      reason: string;
    }
    | {
      kind: 'workspace_billing_recovery';
      action: 'retry' | 'cancel';
      workspaceId: string;
      recoveryId: string;
      snapshot: AdminWorkspaceRecoveryPreviewResponse;
      reason: string;
    }
    | {
      kind: 'workspace_billing_recovery';
      action: 'extend_grace';
      workspaceId: string;
      additionalDays: number;
      snapshot: AdminWorkspaceRecoveryPreviewResponse;
      reason: string;
    }
    | {
      kind: 'workspace_billing_webhook_replay';
      workspaceId: string;
      eventId: string;
      snapshot: {
        attempts: number;
        receivedAt: string;
        retryAt: string;
      };
      reason: string;
    }
    | {
      kind: 'workspace_ai_budget';
      workspaceId: string;
      monthlyTokens: number;
      expectedMonthlyTokens: number | null;
      reason: string;
    };
  challenge: string;
  expiresAt: Date;
  verifiedAt: Date | null;
  consumedAt: Date | null;
  attempts: number;
};
const directoryAccessAuditTarget = {
  action: 'workspace.directory.access_denied',
  targetType: 'workspace_directory',
  targetId: 'read',
};

export function createWorkspaceManagementService(
  db: Knex,
  dependencies: { deliverTeamInvitation?: typeof sendEmail; billingProvider?: Stripe } = {},
) {
  const deliverTeamInvitation = dependencies.deliverTeamInvitation ?? sendEmail;

  async function authorized<T>(
    identity: WorkspaceManagementIdentity,
    context: WorkspaceManagementContext,
    callback: (trx: Knex.Transaction, role: StaffRoleId) => Promise<T>,
    denialTarget: WorkspaceAccessAuditTarget = directoryAccessAuditTarget,
    permission: 'admin.workspaces.read' | 'admin.workspaces.suspend' | 'admin.workspaces.ownership.transfer' |
      'admin.workspaces.plan.override' | 'admin.workspaces.ai-budget.write' |
      'admin.workspaces.members.remove' | 'admin.workspaces.invitations.resend' |
      'admin.billing.read' | 'admin.billing.links.read' | 'admin.billing.plan.change' |
      'admin.billing.recovery.manage' | 'admin.billing.webhooks.replay' = 'admin.workspaces.read',
  ): Promise<T> {
    const result = await db.transaction(async trx => {
      await trx.raw("SET LOCAL lock_timeout = '5s'");
      await trx.raw("SET LOCAL statement_timeout = '10s'");
      await trx.raw("SELECT pg_advisory_xact_lock_shared(hashtextextended('admin:staff-access', 0))");
      const staff = await trx.withSchema('admin').table('staffUsers').where({ id: identity.userId }).forShare()
        .first<{ email: string; disabledAt: Date | null }>('email', 'disabledAt');
      const session = await trx.withSchema('admin').table('staffSessions')
        .where({ id: identity.sessionId, userId: identity.userId }).forShare()
        .first<{ createdAt: Date; updatedAt: Date; expiresAt: Date }>('createdAt', 'updatedAt', 'expiresAt');
      if (!staff || staff.disabledAt || staff.email.toLowerCase() !== identity.accessEmail.toLowerCase() ||
        !session || session.expiresAt.getTime() <= Date.now() ||
        !isAdminSessionWithinLimits(session.createdAt, session.updatedAt)) {
        return { denied: 401 as const };
      }

      const assignment = await trx.withSchema('admin').table('staffRoleAssignments')
        .where({ userId: identity.userId }).whereNull('revokedAt').forShare().first<{ role: string }>('role');
      const role = staffRoleIdSchema.safeParse(assignment?.role);
      if (!role.success || !staffRolePermissions[role.data].includes(permission)) {
        await appendAdminAuditEvent(trx, {
          staffUserId: identity.userId,
          staffRole: role.success ? role.data : 'bootstrap',
          action: denialTarget.action,
          targetType: denialTarget.targetType,
          targetId: denialTarget.targetId,
          after: { permission, assignedRole: role.success ? role.data : null },
          userAgent: context.userAgent,
        });
        return { denied: 403 as const };
      }

      const value = await callback(trx, role.data);
      if (session.expiresAt.getTime() <= Date.now() ||
        !isAdminSessionWithinLimits(session.createdAt, session.updatedAt)) {
        throw new WorkspaceManagementError('Your admin session expired during the request. Sign in again.', 401);
      }
      return { denied: false as const, value };
    }) as Denial | Success<T>;

    if (result.denied) {
      throw new WorkspaceManagementError(
        result.denied === 401
          ? 'Sign in with your verified staff identity.'
          : permission === 'admin.workspaces.suspend'
            ? 'Your current role cannot change workspace access.'
            : permission === 'admin.workspaces.ownership.transfer'
              ? 'Your current role cannot transfer workspace ownership.'
              : permission === 'admin.workspaces.plan.override'
                ? 'Your current role cannot manage workspace plan overrides.'
            : permission === 'admin.workspaces.ai-budget.write'
              ? 'Your current role cannot adjust workspace AI budgets.'
            : permission === 'admin.workspaces.members.remove'
                ? 'Your current role cannot remove workspace members.'
            : permission === 'admin.workspaces.invitations.resend'
                ? 'Your current role cannot resend workspace invitations.'
            : permission === 'admin.billing.read'
                ? 'Your current role cannot read workspace billing.'
            : permission === 'admin.billing.links.read'
                ? 'Your current role cannot read workspace billing links.'
            : permission === 'admin.billing.plan.change'
                ? 'Your current role cannot change workspace plans.'
            : permission === 'admin.billing.recovery.manage'
                ? 'Your current role cannot manage renewal recovery.'
            : permission === 'admin.billing.webhooks.replay'
                ? 'Your current role cannot replay workspace billing webhooks.'
            : 'Your current role cannot read workspaces.',
        result.denied,
      );
    }
    return result.value;
  }

  async function readDirectory(
    identity: WorkspaceManagementIdentity,
    input: unknown,
    context: WorkspaceManagementContext = {},
  ): Promise<AdminWorkspaceDirectoryResponse> {
    const parsed = adminWorkspaceDirectoryQuerySchema.safeParse(input);
    if (!parsed.success) throw new WorkspaceManagementError('Invalid workspace filters.');
    return authorized(identity, context, async (trx, role) => {
      const result = adminWorkspaceDirectoryResponseSchema.parse(await readAdminWorkspaceDirectory(trx, parsed.data));
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'workspace.directory.read',
        targetType: 'workspace_directory',
        targetId: 'list',
        after: {
          queryProvided: parsed.data.query.length > 0,
          status: parsed.data.status,
          plan: parsed.data.plan,
          page: result.page,
          pageSize: result.pageSize,
          resultCount: result.workspaces.length,
          total: result.total,
        },
        userAgent: context.userAgent,
      });
      return result;
    });
  }

  async function readDetail(
    identity: WorkspaceManagementIdentity,
    input: unknown,
    context: WorkspaceManagementContext = {},
  ): Promise<AdminWorkspaceDetailResponse> {
    const parsed = adminWorkspaceDetailRequestSchema.safeParse(input);
    if (!parsed.success) throw new WorkspaceManagementError('Invalid workspace identifier.');
    return authorized(identity, context, async (trx, role) => {
      const detail = await readAdminWorkspaceDetail(trx, parsed.data.workspaceId);
      if (!detail) throw new WorkspaceManagementError('Workspace not found.', 404);
      const result = adminWorkspaceDetailResponseSchema.parse({
        ...detail,
        permissions: {
          canSuspend: staffRolePermissions[role].includes('admin.workspaces.suspend'),
          canTransferOwnership: staffRolePermissions[role].includes('admin.workspaces.ownership.transfer'),
          canOverridePlan: staffRolePermissions[role].includes('admin.workspaces.plan.override'),
          canAdjustAIBudget: staffRolePermissions[role].includes('admin.workspaces.ai-budget.write'),
          canRemoveMembers: staffRolePermissions[role].includes('admin.workspaces.members.remove'),
          canResendInvitations: staffRolePermissions[role].includes('admin.workspaces.invitations.resend'),
          canReadBillingLinks: staffRolePermissions[role].includes('admin.billing.links.read'),
          canChangePlan: staffRolePermissions[role].includes('admin.billing.plan.change'),
          canManageRecovery: staffRolePermissions[role].includes('admin.billing.recovery.manage'),
          canReplayWebhooks: staffRolePermissions[role].includes('admin.billing.webhooks.replay'),
        },
      });
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'workspace.detail.read',
        targetType: 'workspace',
        targetId: parsed.data.workspaceId,
        workspaceId: parsed.data.workspaceId,
        after: {
          status: result.workspace.status,
          plan: result.workspace.plan,
          seatUsage: result.totalMembers,
          auditActionCount: result.auditActions.length,
        },
        userAgent: context.userAgent,
      });
      return result;
    }, {
      action: 'workspace.detail.access_denied',
      targetType: 'workspace',
      targetId: parsed.data.workspaceId,
    });
  }

  async function readBilling(
    identity: WorkspaceManagementIdentity,
    input: unknown,
    context: WorkspaceManagementContext = {},
  ) {
    const parsed = adminWorkspaceBillingRequestSchema.safeParse(input);
    if (!parsed.success) throw new WorkspaceManagementError('Invalid workspace identifier.');
    return authorized(identity, context, async (trx, role) => {
      const workspace = await trx('workspaces').where({ id: parsed.data.workspaceId }).first('id');
      if (!workspace) throw new WorkspaceManagementError('Workspace not found.', 404);
      const result = adminWorkspaceBillingResponseSchema.parse(
        await readAdminWorkspaceBilling(trx, parsed.data.workspaceId),
      );
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'workspace.billing.read',
        targetType: 'workspace_billing',
        targetId: parsed.data.workspaceId,
        workspaceId: parsed.data.workspaceId,
        after: {
          plan: result.subscription?.plan ?? null,
          subscriptionStatus: result.subscription?.status ?? null,
          providerStatus: result.providerStatus,
          planChangeCount: result.planChanges.length,
          invoiceCount: result.invoices.length,
          recoveryCount: result.recoveries.length,
          webhookEventCount: result.webhookEvents.length,
        },
        userAgent: context.userAgent,
      });
      return result;
    }, {
      action: 'workspace.billing.access_denied',
      targetType: 'workspace_billing',
      targetId: parsed.data.workspaceId,
    }, 'admin.billing.read');
  }

  async function readBillingLinks(
    identity: WorkspaceManagementIdentity,
    input: unknown,
    context: WorkspaceManagementContext = {},
  ) {
    const parsed = adminWorkspaceBillingLinksRequestSchema.safeParse(input);
    if (!parsed.success) throw new WorkspaceManagementError('Invalid workspace identifier.');
    return authorized(identity, context, async (trx, role) => {
      const workspace = await trx('workspaces').where({ id: parsed.data.workspaceId }).first('id');
      if (!workspace) throw new WorkspaceManagementError('Workspace not found.', 404);
      const result = adminWorkspaceBillingLinksResponseSchema.parse(
        await readAdminWorkspaceBillingLinks(trx, parsed.data.workspaceId),
      );
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'workspace.billing.links.read',
        targetType: 'workspace_billing_links',
        targetId: parsed.data.workspaceId,
        workspaceId: parsed.data.workspaceId,
        after: {
          providerStatus: result.providerStatus,
          hasCustomerLink: result.customerUrl !== null,
          hasSubscriptionLink: result.subscriptionUrl !== null,
          invoiceLinkCount: result.invoices.length,
        },
        userAgent: context.userAgent,
      });
      return result;
    }, {
      action: 'workspace.billing.links.access_denied',
      targetType: 'workspace_billing_links',
      targetId: parsed.data.workspaceId,
    }, 'admin.billing.links.read');
  }

  async function planChangeTarget(trx: Knex.Transaction, workspaceId: string) {
    const workspace = await trx('workspaces').where({ id: workspaceId }).forUpdate()
      .first<{ ownerId: string; deletionRequestedAt: Date | null }>('ownerId', 'deletionRequestedAt');
    if (!workspace) throw new WorkspaceManagementError('Workspace not found.', 404);
    if (workspace.deletionRequestedAt) {
      throw new WorkspaceManagementError('Plan changes cannot be started while workspace deletion is pending.', 409);
    }
    return workspace;
  }

  async function planChangeMethods(
    identity: WorkspaceManagementIdentity,
    input: unknown,
    context: WorkspaceManagementContext = {},
  ) {
    const parsed = adminWorkspaceBillingRequestSchema.safeParse(input);
    if (!parsed.success) throw new WorkspaceManagementError('Invalid workspace identifier.');
    return authorized(identity, context, async trx => {
      await planChangeTarget(trx, parsed.data.workspaceId);
      return adminWorkspacePlanChangeMethodsSchema.parse({ methods: await actionMethods(trx, identity.userId) });
    }, {
      action: 'workspace.billing.plan_change.access_denied',
      targetType: 'workspace_plan_change',
      targetId: parsed.data.workspaceId,
    }, 'admin.billing.plan.change');
  }

  async function previewPlanChange(
    identity: WorkspaceManagementIdentity,
    value: unknown,
    context: WorkspaceManagementContext = {},
  ) {
    const parsed = adminWorkspacePlanChangeOperationSchema.safeParse(value);
    if (!parsed.success || parsed.data.operation !== 'preview') {
      throw new WorkspaceManagementError('Invalid plan-change preview.');
    }
    const input = parsed.data;
    return authorized(identity, context, async (trx, role) => {
      await rateLimit(trx, identity);
      await planChangeTarget(trx, input.workspaceId);
      let quote;
      try {
        quote = await previewAdminWorkspacePlanChange(trx, input.workspaceId, input.plan, dependencies.billingProvider);
      } catch (error) {
        rethrowPlanChangeError(error);
      }
      const result = adminWorkspacePlanChangePreviewResponseSchema.parse({
        workspaceId: input.workspaceId,
        quote,
      });
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'workspace.billing.plan_change.previewed',
        targetType: 'workspace',
        targetId: input.workspaceId,
        workspaceId: input.workspaceId,
        after: {
          quoteId: result.quote.id,
          plan: result.quote.plan,
          kind: result.quote.kind,
          amountDue: result.quote.amountDue,
          effectiveAt: result.quote.effectiveAt,
          expiresAt: result.quote.expiresAt,
        },
        userAgent: context.userAgent,
      });
      return result;
    }, {
      action: 'workspace.billing.plan_change.access_denied',
      targetType: 'workspace_plan_change',
      targetId: input.workspaceId,
    }, 'admin.billing.plan.change');
  }

  async function startPlanChange(
    identity: WorkspaceManagementIdentity,
    value: unknown,
    context: WorkspaceManagementContext = {},
  ) {
    const parsed = adminWorkspacePlanChangeOperationSchema.safeParse(value);
    if (!parsed.success || parsed.data.operation !== 'start') {
      throw new WorkspaceManagementError('Invalid plan-change request.');
    }
    const input = parsed.data;
    return authorized(identity, context, async (trx, role) => {
      await rateLimit(trx, identity);
      const workspace = await planChangeTarget(trx, input.workspaceId);
      const record = await trx('billingPlanChanges')
        .where({ id: input.quoteId, workspaceId: input.workspaceId, actorId: workspace.ownerId })
        .forUpdate()
        .first<{
          id: string;
          targetPlan: 'free' | 'standard' | 'premium';
          kind: 'checkout' | 'upgrade' | 'downgrade' | 'free';
          state: string;
          basis: { end?: number } | null;
          amountDue: number | string;
          prorationAt: number;
          createdAt: Date;
        }>();
      if (!record) throw new WorkspaceManagementError('Plan-change quote not found for this workspace.', 404);
      if (record.kind === 'checkout') {
        throw new WorkspaceManagementError('Free-to-paid checkout must be completed by the workspace Owner.', 409);
      }
      if (!['upgrade', 'downgrade', 'free'].includes(record.kind)) {
        throw new WorkspaceManagementError('Unsupported plan-change quote.', 409);
      }
      if (record.state !== 'quoted') {
        throw new WorkspaceManagementError('Plan-change quote is no longer available. Review billing again.', 409);
      }
      const createdAt = new Date(record.createdAt).getTime();
      const expiresAt = createdAt + 10 * 60 * 1000;
      const effectiveAt = record.kind === 'upgrade' ? Number(record.prorationAt) : Number(record.basis?.end);
      if (!Number.isSafeInteger(createdAt) || !Number.isSafeInteger(effectiveAt) || effectiveAt <= 0 ||
        !Number.isSafeInteger(expiresAt) || expiresAt <= Date.now()) {
        throw new WorkspaceManagementError('Plan-change quote expired or is invalid. Review billing again.', 409);
      }
      const quote = planChangeQuoteSchema.parse({
        id: record.id,
        plan: record.targetPlan,
        kind: record.kind,
        amountDue: Number(record.amountDue),
        currency: 'usd',
        effectiveAt: new Date(effectiveAt * 1000).toISOString(),
        expiresAt: new Date(expiresAt).toISOString(),
      });
      const methods = await actionMethods(trx, identity.userId);
      if (!methods.length) {
        throw new WorkspaceManagementError('Enroll a passkey or authenticator app before changing a plan.', 409);
      }
      const passkeys = await trx.withSchema('admin').table('staffPasskeys').where({ userId: identity.userId })
        .select<{ credentialID: string }[]>('credentialID');
      const options = await generateAuthenticationOptions({
        rpID: getAdminAuthConfiguration().rpID,
        userVerification: 'required',
        allowCredentials: passkeys.map(key => ({ id: key.credentialID })),
      });
      const token = randomBytes(32).toString('base64url');
      const now = new Date();
      await trx.withSchema('admin').table('staffActionChallenges')
        .where({ sessionId: identity.sessionId }).whereNull('consumedAt').update({ consumedAt: now });
      await trx.withSchema('admin').table('staffActionChallenges').insert({
        id: invitationTokenHash(token),
        userId: identity.userId,
        sessionId: identity.sessionId,
        input: {
          kind: 'workspace_plan_change',
          workspaceId: input.workspaceId,
          quoteId: quote.id,
          quoteKind: quote.kind as 'upgrade' | 'downgrade' | 'free',
          plan: quote.plan,
          amountDue: quote.amountDue,
          effectiveAt: quote.effectiveAt,
          quoteExpiresAt: quote.expiresAt,
          reason: input.reason,
        },
        challenge: options.challenge,
        createdAt: now,
        expiresAt: new Date(now.getTime() + actionLifetime),
      });
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'workspace.billing.plan_change.review_started',
        targetType: 'workspace',
        targetId: input.workspaceId,
        workspaceId: input.workspaceId,
        reason: input.reason,
        after: {
          quoteId: quote.id,
          plan: quote.plan,
          kind: quote.kind,
          amountDue: quote.amountDue,
          effectiveAt: quote.effectiveAt,
          expiresAt: quote.expiresAt,
        },
        userAgent: context.userAgent,
      });
      return adminWorkspacePlanChangeStartResponseSchema.parse({ token, options });
    }, {
      action: 'workspace.billing.plan_change.access_denied',
      targetType: 'workspace_plan_change',
      targetId: input.workspaceId,
    }, 'admin.billing.plan.change');
  }

  async function verifyPlanChangeFactor(
    identity: WorkspaceManagementIdentity,
    token: string,
    factor: AdminActionFactor,
    context: WorkspaceManagementContext = {},
  ) {
    const result = await authorized(identity, context, async (trx, role) => {
      await rateLimit(trx, identity);
      const row = await challenge(trx, identity, token, 'workspace_plan_change');
      if (row.verifiedAt) throw new WorkspaceManagementError('This plan-change verification is already complete.', 409);
      if (row.input.kind !== 'workspace_plan_change') {
        throw new WorkspaceManagementError('Invalid plan-change verification.', 409);
      }
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).increment('attempts', 1);
      if (!await verifyAdminActionFactor(trx, identity.userId, row.challenge, factor)) {
        await appendAdminAuditEvent(trx, {
          staffUserId: identity.userId,
          staffRole: role,
          action: 'workspace.billing.plan_change.factor_failed',
          targetType: 'workspace',
          targetId: row.input.workspaceId,
          workspaceId: row.input.workspaceId,
          reason: row.input.reason,
          after: { quoteId: row.input.quoteId, verified: false, method: factor.method },
          userAgent: context.userAgent,
        });
        return { error: 'Second-factor verification failed or the code was already used.' };
      }
      if (row.expiresAt.getTime() <= Date.now() ||
        new Date(row.input.quoteExpiresAt).getTime() <= Date.now()) {
        return { error: 'Plan-change verification expired. Start a new review.' };
      }
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ verifiedAt: new Date() });
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'workspace.billing.plan_change.factor_verified',
        targetType: 'workspace',
        targetId: row.input.workspaceId,
        workspaceId: row.input.workspaceId,
        reason: row.input.reason,
        after: { quoteId: row.input.quoteId, verified: true, method: factor.method },
        userAgent: context.userAgent,
      });
      return { verified: true };
    }, {
      action: 'workspace.billing.plan_change.access_denied',
      targetType: 'workspace_plan_change',
      targetId: 'factor',
    }, 'admin.billing.plan.change');
    if ('error' in result && typeof result.error === 'string') throw new WorkspaceManagementError(result.error, 422);
    return adminWorkspacePlanChangeVerifiedSchema.parse(result);
  }

  async function commitPlanChange(
    identity: WorkspaceManagementIdentity,
    token: string,
    context: WorkspaceManagementContext = {},
  ): Promise<AdminWorkspacePlanChangeResult> {
    return authorized(identity, context, async (trx, role) => {
      await rateLimit(trx, identity);
      const row = await challenge(trx, identity, token, 'workspace_plan_change');
      if (row.input.kind !== 'workspace_plan_change') {
        throw new WorkspaceManagementError('Invalid plan-change verification.', 409);
      }
      if (!row.verifiedAt) {
        throw new WorkspaceManagementError('Verify your second factor before confirming this plan change.', 409);
      }
      const input = row.input;
      const workspace = await planChangeTarget(trx, input.workspaceId);
      if (new Date(input.quoteExpiresAt).getTime() <= Date.now()) {
        throw new WorkspaceManagementError('Plan-change quote expired. Review billing again.', 409);
      }
      const quote = await trx('billingPlanChanges')
        .where({ id: input.quoteId, workspaceId: input.workspaceId, actorId: workspace.ownerId })
        .forUpdate()
        .first<{
          targetPlan: 'free' | 'standard' | 'premium';
          kind: 'checkout' | 'upgrade' | 'downgrade' | 'free';
          state: string;
          basis: { end?: number } | null;
          amountDue: number | string;
          prorationAt: number;
          createdAt: Date;
        }>();
      const effectiveAt = quote?.kind === 'upgrade' ? Number(quote.prorationAt) : Number(quote?.basis?.end);
      const expiresAt = (quote?.createdAt.getTime() ?? Number.NaN) + 10 * 60 * 1000;
      if (!quote || quote.kind !== input.quoteKind || quote.targetPlan !== input.plan ||
        Number(quote.amountDue) !== input.amountDue ||
        new Date(input.effectiveAt).getTime() !== effectiveAt * 1000 ||
        new Date(input.quoteExpiresAt).getTime() !== expiresAt ||
        !['quoted', 'applying', 'payment', 'complete', 'scheduled', 'expired'].includes(quote.state)) {
        throw new WorkspaceManagementError('Plan-change quote changed. Review billing again.', 409);
      }
      let result: AdminWorkspacePlanChangeResult;
      try {
        result = await confirmAdminWorkspacePlanChange(
          trx,
          identity.userId,
          input.workspaceId,
          input.quoteId,
          dependencies.billingProvider,
        );
      } catch (error) {
        rethrowPlanChangeError(error);
      }
      const parsed = adminWorkspacePlanChangeResultSchema.parse(result);
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'workspace.billing.plan_change.confirmed',
        targetType: 'workspace',
        targetId: input.workspaceId,
        workspaceId: input.workspaceId,
        reason: input.reason,
        before: {
          quoteId: input.quoteId,
          plan: input.plan,
          amountDue: input.amountDue,
          effectiveAt: input.effectiveAt,
        },
        after: {
          quoteId: input.quoteId,
          status: parsed.status,
          plan: parsed.plan,
          effectiveAt: parsed.effectiveAt,
          handoff: parsed.status === 'customer_action_required' ? parsed.handoff : null,
        },
        userAgent: context.userAgent,
      });
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ consumedAt: new Date() });
      return parsed;
    }, {
      action: 'workspace.billing.plan_change.access_denied',
      targetType: 'workspace_plan_change',
      targetId: 'commit',
    }, 'admin.billing.plan.change');
  }

  async function recoveryMethods(identity: WorkspaceManagementIdentity, context: WorkspaceManagementContext = {}) {
    return authorized(identity, context, async trx => (
      adminWorkspaceRecoveryMethodsSchema.parse({ methods: await actionMethods(trx, identity.userId) })
    ), {
      action: 'workspace.billing.recovery.access_denied',
      targetType: 'workspace_billing_recovery',
      targetId: 'methods',
    }, 'admin.billing.recovery.manage');
  }

  async function previewRecovery(
    identity: WorkspaceManagementIdentity,
    input: unknown,
    context: WorkspaceManagementContext = {},
  ) {
    const operation = adminWorkspaceRecoveryOperationSchema.safeParse(input);
    const billingRequest = adminWorkspaceBillingRequestSchema.safeParse(input);
    const workspaceId = operation.success && operation.data.operation === 'preview'
      ? operation.data.workspaceId
      : billingRequest.success ? billingRequest.data.workspaceId : null;
    if (!workspaceId) throw new WorkspaceManagementError('Invalid workspace identifier.');
    return authorized(identity, context, async (trx, role) => {
      const result = adminWorkspaceRecoveryPreviewResponseSchema.parse(
        await previewAdminRenewalRecovery(trx, workspaceId, dependencies.billingProvider),
      );
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'workspace.billing.recovery.previewed',
        targetType: 'workspace_billing_recovery',
        targetId: workspaceId,
        workspaceId,
        after: {
          providerStatus: result.providerStatus,
          invoiceStatus: result.invoice?.status ?? null,
          paymentState: result.paymentState,
          recoveryState: result.recovery?.state ?? null,
          graceUntil: result.grace.currentUntil,
        },
        userAgent: context.userAgent,
      });
      return result;
    }, {
      action: 'workspace.billing.recovery.access_denied',
      targetType: 'workspace_billing_recovery',
      targetId: workspaceId,
    }, 'admin.billing.recovery.manage');
  }

  async function recoveryTarget(trx: Knex.Transaction, workspaceId: string) {
    const workspace = await trx('workspaces').where({ id: workspaceId }).forUpdate()
      .first<{ deletionRequestedAt: Date | null }>('deletionRequestedAt');
    if (!workspace) throw new WorkspaceManagementError('Workspace not found.', 404);
    if (workspace.deletionRequestedAt) {
      throw new WorkspaceManagementError('Renewal recovery cannot be changed while workspace deletion is pending.', 409);
    }
  }

  function recoverySnapshotsMatch(
    expected: AdminWorkspaceRecoveryPreviewResponse,
    actual: AdminWorkspaceRecoveryPreviewResponse,
  ) {
    return expected.workspaceId === actual.workspaceId &&
      expected.providerStatus === actual.providerStatus &&
      expected.paymentState === actual.paymentState &&
      expected.invoice?.number === actual.invoice?.number &&
      expected.invoice?.createdAt === actual.invoice?.createdAt &&
      expected.invoice?.status === actual.invoice?.status &&
      expected.invoice?.amountDue === actual.invoice?.amountDue &&
      expected.recovery?.id === actual.recovery?.id &&
      expected.recovery?.state === actual.recovery?.state &&
      expected.recovery?.amountDue === actual.recovery?.amountDue &&
      expected.recovery?.attempts === actual.recovery?.attempts &&
      expected.recovery?.createdAt === actual.recovery?.createdAt &&
      expected.recovery?.attemptedAt === actual.recovery?.attemptedAt &&
      expected.recovery?.retryAt === actual.recovery?.retryAt &&
      expected.recovery?.retriesCancelledAt === actual.recovery?.retriesCancelledAt &&
      expected.grace.currentUntil === actual.grace.currentUntil &&
      expected.grace.maximumUntil === actual.grace.maximumUntil &&
      expected.grace.additionalDaysAvailable === actual.grace.additionalDaysAvailable;
  }

  async function startRecovery(
    identity: WorkspaceManagementIdentity,
    value: unknown,
    context: WorkspaceManagementContext = {},
  ) {
    const parsed = adminWorkspaceRecoveryOperationSchema.safeParse(value);
    if (!parsed.success || parsed.data.operation !== 'start') {
      throw new WorkspaceManagementError('Invalid renewal-recovery request.');
    }
    const input = parsed.data;
    return authorized(identity, context, async (trx, role) => {
      await rateLimit(trx, identity);
      await recoveryTarget(trx, input.workspaceId);
      const snapshot = adminWorkspaceRecoveryPreviewResponseSchema.parse(
        await previewAdminRenewalRecovery(trx, input.workspaceId, dependencies.billingProvider),
      );
      if (snapshot.providerStatus !== 'available' || !snapshot.invoice) {
        throw new WorkspaceManagementError('Current invoice recovery state is unavailable. Refresh billing.', 409);
      }

      let challengeInput: WorkspaceActionChallenge['input'];
      if (input.action === 'extend_grace') {
        if (snapshot.invoice.status !== 'open' || snapshot.invoice.amountDue <= 0 ||
          input.additionalDays > snapshot.grace.additionalDaysAvailable) {
          throw new WorkspaceManagementError('The invoice cannot receive the requested grace extension. Refresh billing.', 409);
        }
        challengeInput = {
          kind: 'workspace_billing_recovery',
          action: input.action,
          workspaceId: input.workspaceId,
          additionalDays: input.additionalDays,
          snapshot,
          reason: input.reason,
        };
      } else {
        const recovery = snapshot.recovery;
        if (!recovery || recovery.id !== input.recoveryId ||
          !['applying', 'action', 'pending'].includes(recovery.state) || !recovery.attemptedAt ||
          snapshot.invoice.status !== 'open' || snapshot.invoice.amountDue <= 0) {
          throw new WorkspaceManagementError('No Owner-confirmed recovery is available for this action. Refresh billing.', 409);
        }
        challengeInput = {
          kind: 'workspace_billing_recovery',
          action: input.action,
          workspaceId: input.workspaceId,
          recoveryId: input.recoveryId,
          snapshot,
          reason: input.reason,
        };
      }
      const methods = await actionMethods(trx, identity.userId);
      if (!methods.length) {
        throw new WorkspaceManagementError('Enroll a passkey or authenticator app before changing renewal recovery.', 409);
      }
      const passkeys = await trx.withSchema('admin').table('staffPasskeys').where({ userId: identity.userId })
        .select<{ credentialID: string }[]>('credentialID');
      const options = await generateAuthenticationOptions({
        rpID: getAdminAuthConfiguration().rpID,
        userVerification: 'required',
        allowCredentials: passkeys.map(key => ({ id: key.credentialID })),
      });
      const token = randomBytes(32).toString('base64url');
      const now = new Date();
      await trx.withSchema('admin').table('staffActionChallenges')
        .where({ sessionId: identity.sessionId }).whereNull('consumedAt').update({ consumedAt: now });
      await trx.withSchema('admin').table('staffActionChallenges').insert({
        id: invitationTokenHash(token),
        userId: identity.userId,
        sessionId: identity.sessionId,
        input: challengeInput,
        challenge: options.challenge,
        createdAt: now,
        expiresAt: new Date(now.getTime() + actionLifetime),
      });
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'workspace.billing.recovery.review_started',
        targetType: 'workspace',
        targetId: input.workspaceId,
        workspaceId: input.workspaceId,
        reason: input.reason,
        after: {
          action: input.action,
          recoveryId: input.action === 'extend_grace' ? null : input.recoveryId,
          additionalDays: input.action === 'extend_grace' ? input.additionalDays : null,
          invoiceCreatedAt: snapshot.invoice.createdAt,
          amountDue: snapshot.invoice.amountDue,
        },
        userAgent: context.userAgent,
      });
      return adminWorkspaceRecoveryStartResponseSchema.parse({ token, options });
    }, {
      action: 'workspace.billing.recovery.access_denied',
      targetType: 'workspace',
      targetId: input.workspaceId,
    }, 'admin.billing.recovery.manage');
  }

  async function verifyRecoveryFactor(
    identity: WorkspaceManagementIdentity,
    token: string,
    factor: AdminActionFactor,
    context: WorkspaceManagementContext = {},
  ) {
    const result = await authorized(identity, context, async (trx, role) => {
      await rateLimit(trx, identity);
      const row = await challenge(trx, identity, token, 'workspace_billing_recovery');
      if (row.verifiedAt) throw new WorkspaceManagementError('This recovery verification is already complete.', 409);
      if (row.input.kind !== 'workspace_billing_recovery') {
        throw new WorkspaceManagementError('Invalid recovery verification.', 409);
      }
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).increment('attempts', 1);
      if (!await verifyAdminActionFactor(trx, identity.userId, row.challenge, factor)) {
        await appendAdminAuditEvent(trx, {
          staffUserId: identity.userId,
          staffRole: role,
          action: 'workspace.billing.recovery.factor_failed',
          targetType: 'workspace',
          targetId: row.input.workspaceId,
          workspaceId: row.input.workspaceId,
          reason: row.input.reason,
          after: { action: row.input.action, verified: false, method: factor.method },
          userAgent: context.userAgent,
        });
        return { error: 'Second-factor verification failed or the code was already used.' };
      }
      if (row.expiresAt.getTime() <= Date.now()) {
        return { error: 'Recovery verification expired. Start a new review.' };
      }
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ verifiedAt: new Date() });
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'workspace.billing.recovery.factor_verified',
        targetType: 'workspace',
        targetId: row.input.workspaceId,
        workspaceId: row.input.workspaceId,
        reason: row.input.reason,
        after: { action: row.input.action, verified: true, method: factor.method },
        userAgent: context.userAgent,
      });
      return { verified: true };
    }, {
      action: 'workspace.billing.recovery.access_denied',
      targetType: 'workspace_billing_recovery',
      targetId: 'factor',
    }, 'admin.billing.recovery.manage');
    if ('error' in result && typeof result.error === 'string') throw new WorkspaceManagementError(result.error, 422);
    return adminWorkspaceRecoveryVerifiedSchema.parse(result);
  }

  async function commitRecovery(
    identity: WorkspaceManagementIdentity,
    token: string,
    context: WorkspaceManagementContext = {},
  ) {
    return authorized(identity, context, async (trx, role) => {
      await rateLimit(trx, identity);
      const row = await challenge(trx, identity, token, 'workspace_billing_recovery');
      if (row.input.kind !== 'workspace_billing_recovery') {
        throw new WorkspaceManagementError('Invalid recovery verification.', 409);
      }
      if (!row.verifiedAt) {
        throw new WorkspaceManagementError('Verify your second factor before confirming this recovery action.', 409);
      }
      await recoveryTarget(trx, row.input.workspaceId);
      const current = adminWorkspaceRecoveryPreviewResponseSchema.parse(
        await previewAdminRenewalRecovery(trx, row.input.workspaceId, dependencies.billingProvider),
      );
      if (!recoverySnapshotsMatch(row.input.snapshot, current)) {
        throw new WorkspaceManagementError('Invoice recovery changed. Refresh billing and start a new review.', 409);
      }

      let result: AdminWorkspaceRecoveryResult;
      try {
        if (row.input.action === 'retry') {
          result = await retryAdminRenewalRecovery(
            trx, row.input.workspaceId, row.input.recoveryId, dependencies.billingProvider,
          );
        } else if (row.input.action === 'cancel') {
          const cancelled = adminWorkspaceRecoveryResultSchema.parse(await cancelAdminRenewalRecovery(
            trx, row.input.workspaceId, row.input.recoveryId, dependencies.billingProvider,
          ));
          if (cancelled.status !== 'retries_cancelled') {
            throw new WorkspaceManagementError('Recovery cancellation returned an unexpected result.', 409);
          }
          if (cancelled.paymentState !== row.input.snapshot.paymentState) {
            throw new WorkspaceManagementError('Payment state changed. Refresh billing and start a new review.', 409);
          }
          result = cancelled;
        } else if (row.input.action === 'extend_grace') {
          result = await extendAdminRecoveryGrace(
            trx, row.input.workspaceId, row.input.additionalDays, dependencies.billingProvider,
          );
        } else {
          throw new WorkspaceManagementError('Invalid recovery action.', 409);
        }
      } catch (error) {
        if (error instanceof WorkspaceManagementError) throw error;
        rethrowRecoveryError(error);
      }
      const parsed = adminWorkspaceRecoveryResultSchema.parse(result);
      const action = row.input.action === 'extend_grace'
        ? 'grace_extended'
        : row.input.action === 'cancel' ? 'retries_cancelled' : 'retry_completed';
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: `workspace.billing.recovery.${action}`,
        targetType: 'workspace',
        targetId: row.input.workspaceId,
        workspaceId: row.input.workspaceId,
        reason: row.input.reason,
        before: {
          action: row.input.action,
          invoiceCreatedAt: row.input.snapshot.invoice?.createdAt ?? null,
          recoveryId: row.input.action === 'extend_grace' ? null : row.input.recoveryId,
          graceUntil: row.input.snapshot.grace.currentUntil,
          paymentState: row.input.snapshot.paymentState,
        },
        after: parsed,
        userAgent: context.userAgent,
      });
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ consumedAt: new Date() });
      return parsed;
    }, {
      action: 'workspace.billing.recovery.access_denied',
      targetType: 'workspace_billing_recovery',
      targetId: 'commit',
    }, 'admin.billing.recovery.manage');
  }

  async function webhookReplayMethods(
    identity: WorkspaceManagementIdentity,
    workspaceId: string,
    context: WorkspaceManagementContext = {},
  ) {
    const parsed = adminWorkspaceBillingRequestSchema.safeParse({ workspaceId });
    if (!parsed.success) throw new WorkspaceManagementError('Invalid workspace identifier.');
    return authorized(identity, context, async (trx, role) => {
      const overview = await readAdminBillingWebhookReplayEvents(trx, parsed.data.workspaceId);
      if (overview.status === 'not_found') {
        throw new WorkspaceManagementError('Workspace not found.', 404);
      }
      const result = adminWorkspaceWebhookReplayOverviewSchema.parse({
        workspaceId: parsed.data.workspaceId,
        deletionPending: overview.deletionPending,
        methods: await actionMethods(trx, identity.userId),
        events: overview.events,
      });
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'workspace.billing.webhook_replay.read',
        targetType: 'workspace_billing_webhooks',
        targetId: parsed.data.workspaceId,
        workspaceId: parsed.data.workspaceId,
        after: {
          eventCount: result.events.length,
          replayableCount: result.events.filter(event => event.attempts > 0 && !event.processedAt).length,
          deletionPending: result.deletionPending,
        },
        userAgent: context.userAgent,
      });
      return result;
    }, {
      action: 'workspace.billing.webhook_replay.access_denied',
      targetType: 'billing_webhook_event',
      targetId: parsed.data.workspaceId,
    }, 'admin.billing.webhooks.replay');
  }

  async function webhookReplayTarget(
    trx: Knex.Transaction,
    workspaceId: string,
    eventId: string,
  ) {
    const target = await inspectAdminBillingWebhookReplay(trx, workspaceId, eventId);
    if (target.status === 'not_found') {
      throw new WorkspaceManagementError('Webhook event not found for this workspace.', 404);
    }
    if (target.status === 'workspace_deletion_pending') {
      throw new WorkspaceManagementError('Webhook replay is unavailable while workspace deletion is pending.', 409);
    }
    if (target.status === 'not_eligible') {
      throw new WorkspaceManagementError('Only failed, unprocessed webhook events can be replayed.', 409);
    }
    return target;
  }

  function webhookReplaySnapshotsMatch(
    expected: { attempts: number; receivedAt: string; retryAt: string },
    actual: { attempts: number; receivedAt: string; retryAt: string },
  ) {
    return expected.attempts === actual.attempts &&
      expected.receivedAt === actual.receivedAt &&
      expected.retryAt === actual.retryAt;
  }

  async function startWebhookReplay(
    identity: WorkspaceManagementIdentity,
    value: unknown,
    context: WorkspaceManagementContext = {},
  ) {
    const parsed = adminWorkspaceWebhookReplayOperationSchema.safeParse(value);
    if (!parsed.success || parsed.data.operation !== 'start') {
      throw new WorkspaceManagementError('Invalid webhook replay request.');
    }
    const input = parsed.data;
    return authorized(identity, context, async (trx, role) => {
      await rateLimit(trx, identity);
      const snapshot = await webhookReplayTarget(trx, input.workspaceId, input.eventId);
      const methods = await actionMethods(trx, identity.userId);
      if (!methods.length) {
        throw new WorkspaceManagementError('Enroll a passkey or authenticator app before replaying webhook events.', 409);
      }
      const passkeys = await trx.withSchema('admin').table('staffPasskeys').where({ userId: identity.userId })
        .select<{ credentialID: string }[]>('credentialID');
      const options = await generateAuthenticationOptions({
        rpID: getAdminAuthConfiguration().rpID,
        userVerification: 'required',
        allowCredentials: passkeys.map(key => ({ id: key.credentialID })),
      });
      const token = randomBytes(32).toString('base64url');
      const now = new Date();
      await trx.withSchema('admin').table('staffActionChallenges')
        .where({ sessionId: identity.sessionId }).whereNull('consumedAt').update({ consumedAt: now });
      await trx.withSchema('admin').table('staffActionChallenges').insert({
        id: invitationTokenHash(token),
        userId: identity.userId,
        sessionId: identity.sessionId,
        input: {
          kind: 'workspace_billing_webhook_replay',
          workspaceId: input.workspaceId,
          eventId: input.eventId,
          snapshot: {
            attempts: snapshot.attempts,
            receivedAt: snapshot.receivedAt,
            retryAt: snapshot.retryAt,
          },
          reason: input.reason,
        },
        challenge: options.challenge,
        createdAt: now,
        expiresAt: new Date(now.getTime() + actionLifetime),
      });
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'workspace.billing.webhook_replay.review_started',
        targetType: 'billing_webhook_event',
        targetId: input.eventId,
        workspaceId: input.workspaceId,
        reason: input.reason,
        after: { attempts: snapshot.attempts, retryAt: snapshot.retryAt },
        userAgent: context.userAgent,
      });
      return adminWorkspaceWebhookReplayStartResponseSchema.parse({ token, options });
    }, {
      action: 'workspace.billing.webhook_replay.access_denied',
      targetType: 'billing_webhook_event',
      targetId: input.eventId,
    }, 'admin.billing.webhooks.replay');
  }

  async function verifyWebhookReplayFactor(
    identity: WorkspaceManagementIdentity,
    workspaceId: string,
    token: string,
    factor: AdminActionFactor,
    context: WorkspaceManagementContext = {},
  ) {
    const result = await authorized(identity, context, async (trx, role) => {
      await rateLimit(trx, identity);
      const row = await challenge(trx, identity, token, 'workspace_billing_webhook_replay');
      if (row.input.kind !== 'workspace_billing_webhook_replay' ||
        row.input.workspaceId !== workspaceId) {
        throw new WorkspaceManagementError('Invalid webhook replay verification target.', 409);
      }
      if (row.verifiedAt) throw new WorkspaceManagementError('This webhook replay verification is already complete.', 409);
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).increment('attempts', 1);
      if (!await verifyAdminActionFactor(trx, identity.userId, row.challenge, factor)) {
        await appendAdminAuditEvent(trx, {
          staffUserId: identity.userId,
          staffRole: role,
          action: 'workspace.billing.webhook_replay.factor_failed',
          targetType: 'billing_webhook_event',
          targetId: row.input.eventId,
          workspaceId: row.input.workspaceId,
          reason: row.input.reason,
          after: { verified: false, method: factor.method },
          userAgent: context.userAgent,
        });
        return { error: 'Second-factor verification failed or the code was already used.' };
      }
      if (row.expiresAt.getTime() <= Date.now()) {
        return { error: 'Webhook replay verification expired. Start a new review.' };
      }
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ verifiedAt: new Date() });
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'workspace.billing.webhook_replay.factor_verified',
        targetType: 'billing_webhook_event',
        targetId: row.input.eventId,
        workspaceId: row.input.workspaceId,
        reason: row.input.reason,
        after: { verified: true, method: factor.method },
        userAgent: context.userAgent,
      });
      return { verified: true };
    }, {
      action: 'workspace.billing.webhook_replay.access_denied',
      targetType: 'billing_webhook_event',
      targetId: 'factor',
    }, 'admin.billing.webhooks.replay');
    if ('error' in result && typeof result.error === 'string') throw new WorkspaceManagementError(result.error, 422);
    return adminWorkspaceWebhookReplayVerifiedSchema.parse(result);
  }

  async function commitWebhookReplay(
    identity: WorkspaceManagementIdentity,
    workspaceId: string,
    token: string,
    context: WorkspaceManagementContext = {},
  ) {
    return authorized(identity, context, async (trx, role) => {
      await rateLimit(trx, identity);
      const row = await challenge(trx, identity, token, 'workspace_billing_webhook_replay');
      if (row.input.kind !== 'workspace_billing_webhook_replay' ||
        row.input.workspaceId !== workspaceId) {
        throw new WorkspaceManagementError('Invalid webhook replay verification target.', 409);
      }
      if (!row.verifiedAt) {
        throw new WorkspaceManagementError('Verify your second factor before queuing this webhook replay.', 409);
      }
      const current = await webhookReplayTarget(trx, row.input.workspaceId, row.input.eventId);
      if (!webhookReplaySnapshotsMatch(row.input.snapshot, current)) {
        throw new WorkspaceManagementError('Webhook event changed. Refresh billing and start a new review.', 409);
      }
      const queued = await queueAdminBillingWebhookReplay(trx, row.input.workspaceId, row.input.eventId);
      if (queued.status !== 'queued') {
        throw new WorkspaceManagementError('Webhook event is no longer eligible for replay.', 409);
      }
      const result = adminWorkspaceWebhookReplayResultSchema.parse({ status: 'queued' });
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'workspace.billing.webhook_replay.queued',
        targetType: 'billing_webhook_event',
        targetId: row.input.eventId,
        workspaceId: row.input.workspaceId,
        reason: row.input.reason,
        before: row.input.snapshot,
        after: result,
        userAgent: context.userAgent,
      });
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ consumedAt: new Date() });
      return result;
    }, {
      action: 'workspace.billing.webhook_replay.access_denied',
      targetType: 'billing_webhook_event',
      targetId: 'commit',
    }, 'admin.billing.webhooks.replay');
  }

  async function rateLimit(trx: Knex.Transaction, identity: WorkspaceManagementIdentity) {
    const key = `staff-actions:${identity.userId}`;
    await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [key]);
    const row = await trx.withSchema('admin').table('staffRateLimits').where({ key })
      .first<{ count: number; lastRequest: string }>('count', 'lastRequest');
    const now = Date.now();
    if (row && now - Number(row.lastRequest) < 15 * 60 * 1000 && row.count >= 30) {
      throw new WorkspaceManagementError('Too many admin verification attempts. Try again in 15 minutes.', 429);
    }
    const count = row && now - Number(row.lastRequest) < 15 * 60 * 1000 ? row.count + 1 : 1;
    await trx.withSchema('admin').table('staffRateLimits').insert({
      id: key, key, count, lastRequest: count === 1 ? now : row!.lastRequest,
    }).onConflict('key').merge(['count', 'lastRequest']);
  }

  async function targetForAction(trx: Knex.Transaction, workspaceId: string, action: 'suspend' | 'unsuspend') {
    const workspace = await trx('workspaces').where({ id: workspaceId }).forUpdate()
      .first<{ suspendedAt: Date | null; deletionRequestedAt: Date | null }>('suspendedAt', 'deletionRequestedAt');
    if (!workspace) throw new WorkspaceManagementError('Workspace not found.', 404);
    if (workspace.deletionRequestedAt) {
      throw new WorkspaceManagementError('A workspace with a pending deletion cannot be suspended or unsuspended.', 409);
    }
    if (action === 'suspend' ? workspace.suspendedAt !== null : workspace.suspendedAt === null) {
      throw new WorkspaceManagementError('The workspace status changed. Refresh the workspace before trying again.', 409);
    }
    return workspace;
  }

  async function ownershipTransferTarget(
    trx: Knex.Transaction,
    input: { workspaceId: string; expectedOwnerUserId: string; newOwnerUserId: string },
  ) {
    const workspace = await trx('workspaces').where({ id: input.workspaceId }).forUpdate()
      .first<{ ownerId: string; deletionRequestedAt: Date | null }>('ownerId', 'deletionRequestedAt');
    if (!workspace) throw new WorkspaceManagementError('Workspace not found.', 404);
    if (workspace.deletionRequestedAt) {
      throw new WorkspaceManagementError('A workspace with a pending deletion cannot change ownership.', 409);
    }
    if (workspace.ownerId !== input.expectedOwnerUserId) {
      throw new WorkspaceManagementError('Workspace ownership changed. Refresh the workspace before trying again.', 409);
    }
    if (workspace.ownerId === input.newOwnerUserId) {
      throw new WorkspaceManagementError('The selected member is already the Owner.', 409);
    }

    const member = await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId')
      .where({ 'm.workspaceId': input.workspaceId, 'm.userId': input.newOwnerUserId })
      .first<{ emailVerified: boolean; deletionRequestedAt: Date | null; suspendedAt: Date | null }>(
        'u.emailVerified', 'u.deletionRequestedAt', 'u.suspendedAt',
      );
    if (!member) throw new WorkspaceManagementError('The selected person is not a workspace member.', 409);
    if (!member.emailVerified) throw new WorkspaceManagementError('The new Owner must verify their email first.', 409);
    if (member.deletionRequestedAt) throw new WorkspaceManagementError('The selected member account is being deleted.', 409);
    if (member.suspendedAt) throw new WorkspaceManagementError('The selected member account is suspended.', 409);
    const otherWorkspace = await trx('workspaces').where({ ownerId: input.newOwnerUserId })
      .where('id', '<>', input.workspaceId).first('id');
    if (otherWorkspace) {
      throw new WorkspaceManagementError('The selected member already owns another workspace.', 409);
    }
    return workspace;
  }

  async function planOverrideTarget(trx: Knex.Transaction, workspaceId: string) {
    const workspace = await trx('workspaces').where({ id: workspaceId }).forUpdate()
      .first<{
        deletionRequestedAt: Date | null;
        planOverrideId: string | null;
        planOverride: string | null;
        planOverrideEndsAt: Date | null;
      }>('deletionRequestedAt', 'planOverrideId', 'planOverride', 'planOverrideEndsAt');
    if (!workspace) throw new WorkspaceManagementError('Workspace not found.', 404);
    if (workspace.deletionRequestedAt) {
      throw new WorkspaceManagementError('Plan overrides cannot be changed while workspace deletion is pending.', 409);
    }
    return workspace;
  }

  function planOverrideSnapshotMatches(
    workspace: Awaited<ReturnType<typeof planOverrideTarget>>,
    expected: { expectedOverrideId: string | null; expectedPlan: string | null; expectedEndsAt: string | null },
  ) {
    return workspace.planOverrideId === expected.expectedOverrideId &&
      workspace.planOverride === expected.expectedPlan &&
      (workspace.planOverrideEndsAt?.toISOString() ?? null) === expected.expectedEndsAt;
  }

  async function aiBudgetTarget(trx: Knex.Transaction, workspaceId: string) {
    const workspace = await trx('workspaces').where({ id: workspaceId }).forUpdate()
      .first<{ deletionRequestedAt: Date | null }>('deletionRequestedAt');
    if (!workspace) throw new WorkspaceManagementError('Workspace not found.', 404);
    if (workspace.deletionRequestedAt) {
      throw new WorkspaceManagementError('AI budgets cannot be changed while workspace deletion is pending.', 409);
    }
    return workspace;
  }

  async function challenge(
    trx: Knex.Transaction,
    identity: WorkspaceManagementIdentity,
    token: string,
    kind: WorkspaceActionChallenge['input']['kind'],
  ): Promise<WorkspaceActionChallenge> {
    if (!/^[\w-]{43}$/.test(token)) {
      throw new WorkspaceManagementError('Invalid workspace-action verification.', 401);
    }
    const row = await trx.withSchema('admin').table('staffActionChallenges').where({
      id: invitationTokenHash(token),
      userId: identity.userId,
      sessionId: identity.sessionId,
    }).forUpdate().first<WorkspaceActionChallenge>();
    if (!row || row.input.kind !== kind || row.consumedAt ||
      row.expiresAt.getTime() <= Date.now() || row.attempts >= 5) {
      throw new WorkspaceManagementError('Workspace-action verification expired or was already used. Start again.', 409);
    }
    return row;
  }

  async function actionMethods(trx: Knex.Transaction, userId: string) {
    const passkey = await trx.withSchema('admin').table('staffPasskeys').where({ userId }).first('id');
    const totp = await trx.withSchema('admin').table('staffTwoFactors')
      .where({ userId, verified: true }).first('id');
    const methods: ('passkey' | 'totp')[] = [];
    if (passkey) methods.push('passkey');
    if (totp) methods.push('totp');
    return methods;
  }

  async function suspensionMethods(identity: WorkspaceManagementIdentity, context: WorkspaceManagementContext = {}) {
    return authorized(identity, context, async trx => (
      adminWorkspaceSuspensionMethodsSchema.parse({ methods: await actionMethods(trx, identity.userId) })
    ), {
      action: 'workspace.suspension.access_denied',
      targetType: 'workspace_suspension',
      targetId: 'methods',
    }, 'admin.workspaces.suspend');
  }

  async function startSuspension(identity: WorkspaceManagementIdentity, value: unknown, context: WorkspaceManagementContext = {}) {
    const parsed = adminWorkspaceSuspensionOperationSchema.safeParse(value);
    if (!parsed.success || parsed.data.operation !== 'start') {
      throw new WorkspaceManagementError('Invalid workspace-access request.');
    }
    const input = parsed.data;
    return authorized(identity, context, async trx => {
      await rateLimit(trx, identity);
      await targetForAction(trx, input.workspaceId, input.action);
      const methods = await actionMethods(trx, identity.userId);
      if (!methods.length) {
        throw new WorkspaceManagementError('Enroll a passkey or authenticator app before changing workspace access.', 409);
      }
      const passkeys = await trx.withSchema('admin').table('staffPasskeys').where({ userId: identity.userId })
        .select<{ credentialID: string }[]>('credentialID');
      const options = await generateAuthenticationOptions({
        rpID: getAdminAuthConfiguration().rpID,
        userVerification: 'required',
        allowCredentials: passkeys.map(key => ({ id: key.credentialID })),
      });
      const token = randomBytes(32).toString('base64url');
      const now = new Date();
      await trx.withSchema('admin').table('staffActionChallenges')
        .where({ sessionId: identity.sessionId }).whereNull('consumedAt').update({ consumedAt: now });
      await trx.withSchema('admin').table('staffActionChallenges').insert({
        id: invitationTokenHash(token),
        userId: identity.userId,
        sessionId: identity.sessionId,
        input: {
          kind: 'workspace_suspension',
          workspaceId: input.workspaceId,
          action: input.action,
          reason: input.reason,
        },
        challenge: options.challenge,
        createdAt: now,
        expiresAt: new Date(now.getTime() + actionLifetime),
      });
      return adminWorkspaceSuspensionStartSchema.parse({ token, options });
    }, {
      action: 'workspace.suspension.access_denied',
      targetType: 'workspace',
      targetId: input.workspaceId,
    }, 'admin.workspaces.suspend');
  }

  async function verifySuspensionFactor(
    identity: WorkspaceManagementIdentity,
    token: string,
    factor: AdminActionFactor,
    context: WorkspaceManagementContext = {},
  ) {
    const result = await authorized(identity, context, async trx => {
      await rateLimit(trx, identity);
      const row = await challenge(trx, identity, token, 'workspace_suspension');
      if (row.verifiedAt) throw new WorkspaceManagementError('This workspace-access verification is already complete.', 409);
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).increment('attempts', 1);
      if (!await verifyAdminActionFactor(trx, identity.userId, row.challenge, factor)) {
        return { error: 'Second-factor verification failed or the code was already used.' };
      }
      if (row.expiresAt.getTime() <= Date.now()) {
        return { error: 'Workspace-access verification expired. Start a new review.' };
      }
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ verifiedAt: new Date() });
      return { verified: true };
    }, {
      action: 'workspace.suspension.access_denied',
      targetType: 'workspace_suspension',
      targetId: 'factor',
    }, 'admin.workspaces.suspend');
    if ('error' in result && typeof result.error === 'string') throw new WorkspaceManagementError(result.error, 422);
    return adminWorkspaceSuspensionVerifiedSchema.parse(result);
  }

  async function commitSuspension(identity: WorkspaceManagementIdentity, token: string, context: WorkspaceManagementContext = {}) {
    return authorized(identity, context, async (trx, role) => {
      const row = await challenge(trx, identity, token, 'workspace_suspension');
      if (row.input.kind !== 'workspace_suspension') {
        throw new WorkspaceManagementError('Invalid workspace-access verification.', 409);
      }
      if (!row.verifiedAt) throw new WorkspaceManagementError('Verify your second factor before confirming this workspace action.', 409);
      const workspace = await targetForAction(trx, row.input.workspaceId, row.input.action);
      const actor = { type: 'staff' as const, id: identity.userId };
      const result = row.input.action === 'suspend'
        ? await suspendWorkspace(trx, { workspaceId: row.input.workspaceId, reason: row.input.reason, actor })
        : await unsuspendWorkspace(trx, { workspaceId: row.input.workspaceId, reason: row.input.reason, actor });
      if (!result.changed) {
        throw new WorkspaceManagementError('The workspace status changed. Refresh the workspace before trying again.', 409);
      }
      const after = await trx('workspaces').where({ id: row.input.workspaceId })
        .first<{ suspendedAt: Date | null }>('suspendedAt');
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: row.input.action === 'suspend' ? 'workspace.suspended' : 'workspace.unsuspended',
        targetType: 'workspace',
        targetId: row.input.workspaceId,
        workspaceId: row.input.workspaceId,
        reason: row.input.reason,
        before: { suspendedAt: workspace.suspendedAt?.toISOString() ?? null },
        after: { suspendedAt: after?.suspendedAt?.toISOString() ?? null },
        userAgent: context.userAgent,
      });
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ consumedAt: new Date() });
      return adminWorkspaceSuspensionResultSchema.parse({
        action: row.input.action,
        changed: true,
        suspendedAt: after?.suspendedAt?.toISOString() ?? null,
      });
    }, {
      action: 'workspace.suspension.access_denied',
      targetType: 'workspace_suspension',
      targetId: 'commit',
    }, 'admin.workspaces.suspend');
  }

  async function ownershipTransferMethods(identity: WorkspaceManagementIdentity, context: WorkspaceManagementContext = {}) {
    return authorized(identity, context, async trx => (
      adminWorkspaceOwnershipTransferMethodsSchema.parse({ methods: await actionMethods(trx, identity.userId) })
    ), {
      action: 'workspace.ownership_transfer.access_denied',
      targetType: 'workspace_ownership_transfer',
      targetId: 'methods',
    }, 'admin.workspaces.ownership.transfer');
  }

  async function startOwnershipTransfer(identity: WorkspaceManagementIdentity, value: unknown, context: WorkspaceManagementContext = {}) {
    const parsed = adminWorkspaceOwnershipTransferOperationSchema.safeParse(value);
    if (!parsed.success || parsed.data.operation !== 'start') {
      throw new WorkspaceManagementError('Invalid ownership-transfer request.');
    }
    const input = parsed.data;
    return authorized(identity, context, async trx => {
      await rateLimit(trx, identity);
      await ownershipTransferTarget(trx, input);
      const methods = await actionMethods(trx, identity.userId);
      if (!methods.length) {
        throw new WorkspaceManagementError('Enroll a passkey or authenticator app before transferring ownership.', 409);
      }
      const passkeys = await trx.withSchema('admin').table('staffPasskeys').where({ userId: identity.userId })
        .select<{ credentialID: string }[]>('credentialID');
      const options = await generateAuthenticationOptions({
        rpID: getAdminAuthConfiguration().rpID,
        userVerification: 'required',
        allowCredentials: passkeys.map(key => ({ id: key.credentialID })),
      });
      const token = randomBytes(32).toString('base64url');
      const now = new Date();
      await trx.withSchema('admin').table('staffActionChallenges')
        .where({ sessionId: identity.sessionId }).whereNull('consumedAt').update({ consumedAt: now });
      await trx.withSchema('admin').table('staffActionChallenges').insert({
        id: invitationTokenHash(token),
        userId: identity.userId,
        sessionId: identity.sessionId,
        input: {
          kind: 'workspace_ownership_transfer',
          workspaceId: input.workspaceId,
          expectedOwnerUserId: input.expectedOwnerUserId,
          newOwnerUserId: input.newOwnerUserId,
          reason: input.reason,
        },
        challenge: options.challenge,
        createdAt: now,
        expiresAt: new Date(now.getTime() + actionLifetime),
      });
      return adminWorkspaceOwnershipTransferStartSchema.parse({ token, options });
    }, {
      action: 'workspace.ownership_transfer.access_denied',
      targetType: 'workspace',
      targetId: input.workspaceId,
    }, 'admin.workspaces.ownership.transfer');
  }

  async function verifyOwnershipTransferFactor(
    identity: WorkspaceManagementIdentity,
    token: string,
    factor: AdminActionFactor,
    context: WorkspaceManagementContext = {},
  ) {
    const result = await authorized(identity, context, async trx => {
      await rateLimit(trx, identity);
      const row = await challenge(trx, identity, token, 'workspace_ownership_transfer');
      if (row.verifiedAt) throw new WorkspaceManagementError('This ownership-transfer verification is already complete.', 409);
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).increment('attempts', 1);
      if (!await verifyAdminActionFactor(trx, identity.userId, row.challenge, factor)) {
        return { error: 'Second-factor verification failed or the code was already used.' };
      }
      if (row.expiresAt.getTime() <= Date.now()) {
        return { error: 'Ownership-transfer verification expired. Start a new review.' };
      }
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ verifiedAt: new Date() });
      return { verified: true };
    }, {
      action: 'workspace.ownership_transfer.access_denied',
      targetType: 'workspace_ownership_transfer',
      targetId: 'factor',
    }, 'admin.workspaces.ownership.transfer');
    if ('error' in result && typeof result.error === 'string') throw new WorkspaceManagementError(result.error, 422);
    return adminWorkspaceOwnershipTransferVerifiedSchema.parse(result);
  }

  async function commitOwnershipTransfer(identity: WorkspaceManagementIdentity, token: string, context: WorkspaceManagementContext = {}) {
    return authorized(identity, context, async (trx, role) => {
      const row = await challenge(trx, identity, token, 'workspace_ownership_transfer');
      if (row.input.kind !== 'workspace_ownership_transfer') {
        throw new WorkspaceManagementError('Invalid ownership-transfer verification.', 409);
      }
      if (!row.verifiedAt) {
        throw new WorkspaceManagementError('Verify your second factor before confirming this ownership transfer.', 409);
      }
      const current = await ownershipTransferTarget(trx, row.input);
      let result: Awaited<ReturnType<typeof transferWorkspaceOwnership>>;
      try {
        result = await transferWorkspaceOwnership(trx, {
          workspaceId: row.input.workspaceId,
          newOwnerUserId: row.input.newOwnerUserId,
          reason: row.input.reason,
          actor: { type: 'staff', id: identity.userId },
        });
      } catch (error) {
        if (error instanceof TeamActionError) throw new WorkspaceManagementError(error.message, 409);
        throw error;
      }
      if (result.previousOwnerUserId !== current.ownerId) {
        throw new WorkspaceManagementError('Workspace ownership changed. Refresh the workspace before trying again.', 409);
      }
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'workspace.ownership.transferred',
        targetType: 'workspace',
        targetId: row.input.workspaceId,
        workspaceId: row.input.workspaceId,
        reason: row.input.reason,
        before: { ownerUserId: current.ownerId },
        after: { ownerUserId: row.input.newOwnerUserId },
        userAgent: context.userAgent,
      });
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ consumedAt: new Date() });
      return adminWorkspaceOwnershipTransferResultSchema.parse({
        changed: true,
        previousOwnerUserId: result.previousOwnerUserId,
        newOwnerUserId: row.input.newOwnerUserId,
      });
    }, {
      action: 'workspace.ownership_transfer.access_denied',
      targetType: 'workspace_ownership_transfer',
      targetId: 'commit',
    }, 'admin.workspaces.ownership.transfer');
  }

  async function planOverrideMethods(identity: WorkspaceManagementIdentity, context: WorkspaceManagementContext = {}) {
    return authorized(identity, context, async trx => (
      adminWorkspacePlanOverrideMethodsSchema.parse({ methods: await actionMethods(trx, identity.userId) })
    ), {
      action: 'workspace.plan_override.access_denied',
      targetType: 'workspace_plan_override',
      targetId: 'methods',
    }, 'admin.workspaces.plan.override');
  }

  async function startPlanOverride(identity: WorkspaceManagementIdentity, value: unknown, context: WorkspaceManagementContext = {}) {
    const parsed = adminWorkspacePlanOverrideOperationSchema.safeParse(value);
    if (!parsed.success || parsed.data.operation !== 'start') {
      throw new WorkspaceManagementError('Invalid plan-override request.');
    }
    const input = parsed.data;
    let normalized: { plan: 'standard' | 'premium'; endsAt: Date; reason: string } | null = null;
    if (input.action === 'apply') {
      try {
        normalized = normalizePlanOverride(input, new Date());
      } catch (error) {
        if (error instanceof RangeError) throw new WorkspaceManagementError(error.message);
        throw error;
      }
    }

    return authorized(identity, context, async trx => {
      await rateLimit(trx, identity);
      const workspace = await planOverrideTarget(trx, input.workspaceId);
      let challengeInput: WorkspaceActionChallenge['input'];
      if (input.action === 'apply') {
        if (!normalized) throw new WorkspaceManagementError('Invalid plan-override request.');
        challengeInput = {
          kind: 'workspace_plan_override',
          workspaceId: input.workspaceId,
          action: 'apply',
          plan: normalized.plan,
          endsAt: normalized.endsAt.toISOString(),
          reason: normalized.reason,
          expectedOverrideId: workspace.planOverrideId,
          expectedPlan: workspace.planOverride,
          expectedEndsAt: workspace.planOverrideEndsAt?.toISOString() ?? null,
        };
      } else {
        if (!workspace.planOverrideId || !workspace.planOverride ||
          !workspace.planOverrideEndsAt || workspace.planOverrideEndsAt.getTime() <= Date.now()) {
          throw new WorkspaceManagementError('There is no active plan override to end. Refresh the workspace.', 409);
        }
        challengeInput = {
          kind: 'workspace_plan_override',
          workspaceId: input.workspaceId,
          action: 'clear',
          reason: input.reason,
          expectedOverrideId: workspace.planOverrideId,
          expectedPlan: workspace.planOverride,
          expectedEndsAt: workspace.planOverrideEndsAt.toISOString(),
        };
      }

      const methods = await actionMethods(trx, identity.userId);
      if (!methods.length) {
        throw new WorkspaceManagementError('Enroll a passkey or authenticator app before changing a plan override.', 409);
      }
      const passkeys = await trx.withSchema('admin').table('staffPasskeys').where({ userId: identity.userId })
        .select<{ credentialID: string }[]>('credentialID');
      const options = await generateAuthenticationOptions({
        rpID: getAdminAuthConfiguration().rpID,
        userVerification: 'required',
        allowCredentials: passkeys.map(key => ({ id: key.credentialID })),
      });
      const token = randomBytes(32).toString('base64url');
      const now = new Date();
      await trx.withSchema('admin').table('staffActionChallenges')
        .where({ sessionId: identity.sessionId }).whereNull('consumedAt').update({ consumedAt: now });
      await trx.withSchema('admin').table('staffActionChallenges').insert({
        id: invitationTokenHash(token),
        userId: identity.userId,
        sessionId: identity.sessionId,
        input: challengeInput,
        challenge: options.challenge,
        createdAt: now,
        expiresAt: new Date(now.getTime() + actionLifetime),
      });
      return adminWorkspacePlanOverrideStartSchema.parse({ token, options });
    }, {
      action: 'workspace.plan_override.access_denied',
      targetType: 'workspace',
      targetId: input.workspaceId,
    }, 'admin.workspaces.plan.override');
  }

  async function verifyPlanOverrideFactor(
    identity: WorkspaceManagementIdentity,
    token: string,
    factor: AdminActionFactor,
    context: WorkspaceManagementContext = {},
  ) {
    const result = await authorized(identity, context, async trx => {
      await rateLimit(trx, identity);
      const row = await challenge(trx, identity, token, 'workspace_plan_override');
      if (row.verifiedAt) throw new WorkspaceManagementError('This plan-override verification is already complete.', 409);
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).increment('attempts', 1);
      if (!await verifyAdminActionFactor(trx, identity.userId, row.challenge, factor)) {
        return { error: 'Second-factor verification failed or the code was already used.' };
      }
      if (row.expiresAt.getTime() <= Date.now()) {
        return { error: 'Plan-override verification expired. Start a new review.' };
      }
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ verifiedAt: new Date() });
      return { verified: true };
    }, {
      action: 'workspace.plan_override.access_denied',
      targetType: 'workspace_plan_override',
      targetId: 'factor',
    }, 'admin.workspaces.plan.override');
    if ('error' in result && typeof result.error === 'string') throw new WorkspaceManagementError(result.error, 422);
    return adminWorkspacePlanOverrideVerifiedSchema.parse(result);
  }

  async function commitPlanOverride(identity: WorkspaceManagementIdentity, token: string, context: WorkspaceManagementContext = {}) {
    return authorized(identity, context, async (trx, role) => {
      const row = await challenge(trx, identity, token, 'workspace_plan_override');
      if (row.input.kind !== 'workspace_plan_override') {
        throw new WorkspaceManagementError('Invalid plan-override verification.', 409);
      }
      if (!row.verifiedAt) {
        throw new WorkspaceManagementError('Verify your second factor before confirming this plan override.', 409);
      }
      const workspace = await planOverrideTarget(trx, row.input.workspaceId);
      if (!planOverrideSnapshotMatches(workspace, row.input)) {
        throw new WorkspaceManagementError('The plan override changed. Refresh the workspace before trying again.', 409);
      }
      if (row.input.action === 'clear' &&
        (!workspace.planOverrideEndsAt || workspace.planOverrideEndsAt.getTime() <= Date.now())) {
        throw new WorkspaceManagementError('The plan override is no longer active. Refresh the workspace.', 409);
      }

      let result: Awaited<ReturnType<typeof applyPlanOverride>>;
      try {
        result = row.input.action === 'apply'
          ? await applyPlanOverride(trx, {
            workspaceId: row.input.workspaceId,
            plan: row.input.plan,
            endsAt: row.input.endsAt,
            reason: row.input.reason,
            actor: { type: 'staff', id: identity.userId },
          })
          : await clearPlanOverride(trx, {
            workspaceId: row.input.workspaceId,
            reason: row.input.reason,
            actor: { type: 'staff', id: identity.userId },
          });
      } catch (error) {
        if (error instanceof RangeError) throw new WorkspaceManagementError(error.message);
        if (error instanceof PlanOverrideError) {
          throw new WorkspaceManagementError(error.message, error.message.includes('not found') ? 404 : 409);
        }
        throw error;
      }
      if (!result.changed || !result.overrideId) {
        throw new WorkspaceManagementError('The plan override changed. Refresh the workspace before trying again.', 409);
      }
      const after = await trx('workspaces').where({ id: row.input.workspaceId })
        .first<{ planOverrideId: string | null; planOverride: string | null; planOverrideEndsAt: Date | null }>(
          'planOverrideId', 'planOverride', 'planOverrideEndsAt',
        );
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: row.input.action === 'apply' ? 'workspace.plan_override.applied' : 'workspace.plan_override.cleared',
        targetType: 'workspace',
        targetId: row.input.workspaceId,
        workspaceId: row.input.workspaceId,
        reason: row.input.reason,
        before: {
          overrideId: workspace.planOverrideId,
          plan: workspace.planOverride,
          endsAt: workspace.planOverrideEndsAt?.toISOString() ?? null,
        },
        after: {
          overrideId: after?.planOverrideId ?? null,
          plan: after?.planOverride ?? null,
          endsAt: after?.planOverrideEndsAt?.toISOString() ?? null,
        },
        userAgent: context.userAgent,
      });
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ consumedAt: new Date() });
      return adminWorkspacePlanOverrideResultSchema.parse({
        action: row.input.action,
        changed: true,
        overrideId: result.overrideId,
      });
    }, {
      action: 'workspace.plan_override.access_denied',
      targetType: 'workspace_plan_override',
      targetId: 'commit',
    }, 'admin.workspaces.plan.override');
  }

  async function aiBudgetMethods(identity: WorkspaceManagementIdentity, context: WorkspaceManagementContext = {}) {
    return authorized(identity, context, async trx => (
      adminWorkspaceAIBudgetMethodsSchema.parse({ methods: await actionMethods(trx, identity.userId) })
    ), {
      action: 'workspace.ai_budget.access_denied',
      targetType: 'workspace_ai_budget',
      targetId: 'methods',
    }, 'admin.workspaces.ai-budget.write');
  }

  async function startAIBudgetChange(identity: WorkspaceManagementIdentity, value: unknown, context: WorkspaceManagementContext = {}) {
    const parsed = adminWorkspaceAIBudgetOperationSchema.safeParse(value);
    if (!parsed.success || parsed.data.operation !== 'start') {
      throw new WorkspaceManagementError('Invalid AI budget request.');
    }
    const input = parsed.data;
    try {
      defaultMonthlyAITokens(String(input.monthlyTokens));
    } catch (error) {
      if (error instanceof Error) throw new WorkspaceManagementError('Enter a valid monthly AI token budget.');
      throw error;
    }

    return authorized(identity, context, async trx => {
      await rateLimit(trx, identity);
      await aiBudgetTarget(trx, input.workspaceId);
      const current = await trx('workspaceAITokenBudgets').where({ workspaceId: input.workspaceId })
        .first<{ monthlyTokens: string | number }>('monthlyTokens');
      const expectedMonthlyTokens = current ? Number(current.monthlyTokens) : null;
      if (expectedMonthlyTokens !== null &&
        (!Number.isSafeInteger(expectedMonthlyTokens) || expectedMonthlyTokens < 0 ||
          expectedMonthlyTokens > 1_000_000_000_000)) {
        throw new Error('Persisted workspace AI budget is invalid.');
      }

      const methods = await actionMethods(trx, identity.userId);
      if (!methods.length) {
        throw new WorkspaceManagementError('Enroll a passkey or authenticator app before changing an AI budget.', 409);
      }
      const passkeys = await trx.withSchema('admin').table('staffPasskeys').where({ userId: identity.userId })
        .select<{ credentialID: string }[]>('credentialID');
      const options = await generateAuthenticationOptions({
        rpID: getAdminAuthConfiguration().rpID,
        userVerification: 'required',
        allowCredentials: passkeys.map(key => ({ id: key.credentialID })),
      });
      const token = randomBytes(32).toString('base64url');
      const now = new Date();
      await trx.withSchema('admin').table('staffActionChallenges')
        .where({ sessionId: identity.sessionId }).whereNull('consumedAt').update({ consumedAt: now });
      await trx.withSchema('admin').table('staffActionChallenges').insert({
        id: invitationTokenHash(token),
        userId: identity.userId,
        sessionId: identity.sessionId,
        input: {
          kind: 'workspace_ai_budget',
          workspaceId: input.workspaceId,
          monthlyTokens: input.monthlyTokens,
          expectedMonthlyTokens,
          reason: input.reason,
        },
        challenge: options.challenge,
        createdAt: now,
        expiresAt: new Date(now.getTime() + actionLifetime),
      });
      return adminWorkspaceAIBudgetStartSchema.parse({ token, options });
    }, {
      action: 'workspace.ai_budget.access_denied',
      targetType: 'workspace',
      targetId: input.workspaceId,
    }, 'admin.workspaces.ai-budget.write');
  }

  async function verifyAIBudgetFactor(
    identity: WorkspaceManagementIdentity,
    token: string,
    factor: AdminActionFactor,
    context: WorkspaceManagementContext = {},
  ) {
    const result = await authorized(identity, context, async trx => {
      await rateLimit(trx, identity);
      const row = await challenge(trx, identity, token, 'workspace_ai_budget');
      if (row.verifiedAt) throw new WorkspaceManagementError('This AI budget verification is already complete.', 409);
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).increment('attempts', 1);
      if (!await verifyAdminActionFactor(trx, identity.userId, row.challenge, factor)) {
        return { error: 'Second-factor verification failed or the code was already used.' };
      }
      if (row.expiresAt.getTime() <= Date.now()) {
        return { error: 'AI budget verification expired. Start a new review.' };
      }
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ verifiedAt: new Date() });
      return { verified: true };
    }, {
      action: 'workspace.ai_budget.access_denied',
      targetType: 'workspace_ai_budget',
      targetId: 'factor',
    }, 'admin.workspaces.ai-budget.write');
    if ('error' in result && typeof result.error === 'string') throw new WorkspaceManagementError(result.error, 422);
    return adminWorkspaceAIBudgetVerifiedSchema.parse(result);
  }

  async function commitAIBudgetChange(identity: WorkspaceManagementIdentity, token: string, context: WorkspaceManagementContext = {}) {
    return authorized(identity, context, async (trx, role) => {
      const row = await challenge(trx, identity, token, 'workspace_ai_budget');
      if (row.input.kind !== 'workspace_ai_budget') {
        throw new WorkspaceManagementError('Invalid AI budget verification.', 409);
      }
      if (!row.verifiedAt) {
        throw new WorkspaceManagementError('Verify your second factor before confirming this AI budget.', 409);
      }
      await aiBudgetTarget(trx, row.input.workspaceId);
      await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [`ai-budget:${row.input.workspaceId}`]);
      const current = await trx('workspaceAITokenBudgets').where({ workspaceId: row.input.workspaceId })
        .first<{ monthlyTokens: string | number }>('monthlyTokens');
      const currentMonthlyTokens = current ? Number(current.monthlyTokens) : null;
      if (currentMonthlyTokens !== row.input.expectedMonthlyTokens) {
        throw new WorkspaceManagementError('The AI budget changed. Refresh workspace details before trying again.', 409);
      }
      await configureWorkspaceAIBudgetInTransaction(trx, row.input.workspaceId, row.input.monthlyTokens);
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'workspace.ai_budget.updated',
        targetType: 'workspace',
        targetId: row.input.workspaceId,
        workspaceId: row.input.workspaceId,
        reason: row.input.reason,
        before: { monthlyTokens: currentMonthlyTokens },
        after: { monthlyTokens: row.input.monthlyTokens },
        userAgent: context.userAgent,
      });
      await trx.withSchema('admin').table('staffActionChallenges').where({ id: row.id }).update({ consumedAt: new Date() });
      return adminWorkspaceAIBudgetResultSchema.parse({
        changed: true,
        monthlyTokens: row.input.monthlyTokens,
        previousMonthlyTokens: currentMonthlyTokens,
      });
    }, {
      action: 'workspace.ai_budget.access_denied',
      targetType: 'workspace_ai_budget',
      targetId: 'commit',
    }, 'admin.workspaces.ai-budget.write');
  }

  async function queueTeamInvitationDelivery(
    trx: Knex.Transaction,
    delivery: { invitationId: string; tokenHash: string; to: string; input: TeamInvitationEmailInput },
  ) {
    const id = randomUUID();
    const encryptedPayload = await symmetricEncrypt({
      key: configuration.secret,
      data: JSON.stringify({ to: delivery.to, input: delivery.input }),
    });
    await trx.withSchema('admin').table('workspaceInvitationDeliveries')
      .where({ invitationId: delivery.invitationId }).whereIn('status', ['pending', 'failed'])
      .update({ status: 'superseded', encryptedPayload: null });
    await trx.withSchema('admin').table('workspaceInvitationDeliveries').insert({
      id,
      invitationId: delivery.invitationId,
      tokenHash: delivery.tokenHash,
      encryptedPayload,
      status: 'pending',
      attempts: 0,
      createdAt: new Date(),
    });
    return id;
  }

  async function dispatchTeamInvitationDelivery(
    identity: WorkspaceManagementIdentity,
    deliveryId: string,
    context: WorkspaceManagementContext = {},
  ) {
    return authorized(identity, context, async (trx, role) => {
      const reference = await trx.withSchema('admin').table('workspaceInvitationDeliveries')
        .where({ id: deliveryId }).first<{ invitationId: string }>('invitationId');
      if (!reference) throw new WorkspaceManagementError('Invitation delivery not found.', 404);
      const candidate = await trx('workspaceInvitations').where({ id: reference.invitationId })
        .first<{ workspaceId: string }>('workspaceId');
      if (!candidate) throw new WorkspaceManagementError('Invitation not found.', 404);
      const workspace = await trx('workspaces').where({ id: candidate.workspaceId }).forUpdate()
        .first<{ suspendedAt: Date | null; deletionRequestedAt: Date | null }>('suspendedAt', 'deletionRequestedAt');
      if (!workspace) throw new WorkspaceManagementError('Workspace not found.', 404);
      const invitation = await trx('workspaceInvitations').where({
        id: reference.invitationId,
        workspaceId: candidate.workspaceId,
      }).forUpdate().first<{ status: string; tokenHash: string; expiresAt: Date }>(
        'status', 'tokenHash', 'expiresAt',
      );
      if (!invitation) throw new WorkspaceManagementError('Invitation not found.', 404);
      const delivery = await trx.withSchema('admin').table('workspaceInvitationDeliveries')
        .where({ id: deliveryId, invitationId: reference.invitationId }).forUpdate()
        .first<{ id: string; tokenHash: string; encryptedPayload: string | null; status: string; attempts: number }>(
          'id', 'tokenHash', 'encryptedPayload', 'status', 'attempts',
        );
      if (!delivery) throw new WorkspaceManagementError('Invitation delivery not found.', 404);
      if (delivery.status === 'sent') return true;
      if (delivery.status === 'superseded') return false;
      if (!delivery.encryptedPayload) throw new Error('Pending workspace invitation has no encrypted delivery payload.');

      const invitationOpen = (openInvitationStatuses as readonly string[]).includes(invitation.status);
      if (workspace.deletionRequestedAt || !invitationOpen || invitation.expiresAt.getTime() <= Date.now() ||
          invitation.tokenHash !== delivery.tokenHash) {
        await trx.withSchema('admin').table('workspaceInvitationDeliveries').where({ id: deliveryId })
          .update({ status: 'superseded', encryptedPayload: null });
        await appendAdminAuditEvent(trx, {
          staffUserId: identity.userId,
          staffRole: role,
          action: 'workspace.invitation.delivery_superseded',
          targetType: 'workspace_invitation',
          targetId: reference.invitationId,
          workspaceId: candidate.workspaceId,
          before: { deliveryStatus: delivery.status },
          after: { deliveryStatus: 'superseded' },
          userAgent: context.userAgent,
        });
        return false;
      }

      if (workspace.suspendedAt || delivery.attempts >= 5) {
        await trx.withSchema('admin').table('workspaceInvitationDeliveries').where({ id: deliveryId })
          .update({ status: 'failed' });
        await appendAdminAuditEvent(trx, {
          staffUserId: identity.userId,
          staffRole: role,
          action: 'workspace.invitation.delivery_failed',
          targetType: 'workspace_invitation',
          targetId: reference.invitationId,
          workspaceId: candidate.workspaceId,
          before: { deliveryStatus: delivery.status, attempts: delivery.attempts },
          after: { deliveryStatus: 'failed', reason: workspace.suspendedAt ? 'workspace_suspended' : 'retry_limit' },
          userAgent: context.userAgent,
        });
        return false;
      }

      const payload = decodeTeamInvitationDelivery(await symmetricDecrypt({
        key: configuration.secret,
        data: delivery.encryptedPayload,
      }));
      const customerAppURL = getAdminCustomerAppURL();
      if (new URL(payload.input.url).origin !== customerAppURL) {
        throw new Error('Stored workspace invitation link does not match CUSTOMER_APP_URL.');
      }
      let sent = false;
      try {
        await deliverTeamInvitation({
          to: payload.to,
          ...renderTeamInvitationEmail(payload.input),
          idempotencyKey: `workspace-invitation-${delivery.id}`,
        }, customerAppURL);
        sent = true;
      } catch {
        console.error('Admin workspace invitation delivery failed.', { deliveryId });
      }
      const attempts = delivery.attempts + 1;
      await trx.withSchema('admin').table('workspaceInvitationDeliveries').where({ id: deliveryId }).update({
        status: sent ? 'sent' : 'failed',
        attempts,
        ...(sent ? { sentAt: new Date(), encryptedPayload: null } : {}),
      });
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: `workspace.invitation.delivery_${sent ? 'sent' : 'failed'}`,
        targetType: 'workspace_invitation',
        targetId: reference.invitationId,
        workspaceId: candidate.workspaceId,
        before: { deliveryStatus: delivery.status, attempts: delivery.attempts },
        after: { deliveryStatus: sent ? 'sent' : 'failed', attempts },
        userAgent: context.userAgent,
      });
      return sent;
    }, {
      action: 'workspace.invitation.delivery.access_denied',
      targetType: 'workspace_invitation',
      targetId: deliveryId,
    }, 'admin.workspaces.invitations.resend');
  }

  async function performTeamAction(
    identity: WorkspaceManagementIdentity,
    value: unknown,
    context: WorkspaceManagementContext = {},
  ) {
    const parsed = adminWorkspaceTeamActionSchema.safeParse(value);
    if (!parsed.success) throw new WorkspaceManagementError('Invalid workspace member action.');
    const input: AdminWorkspaceTeamAction = parsed.data;
    const permission = input.action === 'remove'
      ? 'admin.workspaces.members.remove'
      : 'admin.workspaces.invitations.resend';
    let deliveryId: string | undefined;
    let result: ReturnType<typeof adminWorkspaceTeamActionResultSchema.parse>;
    try {
      result = await authorized(identity, context, async (trx, role) => {
        await rateLimit(trx, identity);
        if (input.action === 'remove') {
          const removed = await removeWorkspaceMember(trx, {
            workspaceId: input.workspaceId,
            userId: input.userId,
            reason: input.reason,
            actor: { type: 'staff', id: identity.userId },
          });
          await appendAdminAuditEvent(trx, {
            staffUserId: identity.userId,
            staffRole: role,
            action: 'workspace.member.removed',
            targetType: 'workspace_member',
            targetId: input.userId,
            workspaceId: input.workspaceId,
            reason: input.reason,
            before: { present: true },
            after: { present: false, unassignedLeads: removed.unassignedLeads },
            userAgent: context.userAgent,
          });
          return adminWorkspaceTeamActionResultSchema.parse({
            action: 'remove',
            changed: true,
            unassignedLeads: removed.unassignedLeads,
          });
        }

        const workspace = await trx('workspaces').where({ id: input.workspaceId }).forUpdate()
          .first<{ suspendedAt: Date | null; deletionRequestedAt: Date | null }>('suspendedAt', 'deletionRequestedAt');
        if (!workspace) throw new WorkspaceManagementError('Workspace not found.', 404);
        if (workspace.deletionRequestedAt) {
          throw new WorkspaceManagementError('A workspace with a pending deletion cannot resend invitations.', 409);
        }
        if (workspace.suspendedAt) {
          throw new WorkspaceManagementError('Invitations cannot be resent while the workspace is suspended.', 409);
        }
        const invitation = await trx('workspaceInvitations').where({
          id: input.invitationId,
          workspaceId: input.workspaceId,
        }).forUpdate().first<{ status: string; tokenHash: string; expiresAt: Date }>(
          'status', 'tokenHash', 'expiresAt',
        );
        if (!invitation) throw new WorkspaceManagementError('Invitation not found for this workspace.', 404);

        const pendingDelivery = await trx.withSchema('admin').table('workspaceInvitationDeliveries')
          .where({ invitationId: input.invitationId }).orderBy('createdAt', 'desc').orderBy('id', 'desc')
          .first<{ id: string; tokenHash: string; status: string; attempts: number }>(
            'id', 'tokenHash', 'status', 'attempts',
          );
        const canRetry = pendingDelivery &&
          ['pending', 'failed'].includes(pendingDelivery.status) &&
          pendingDelivery.tokenHash === invitation.tokenHash &&
          (openInvitationStatuses as readonly string[]).includes(invitation.status) &&
          invitation.expiresAt.getTime() > Date.now() &&
          pendingDelivery.attempts < 5;
        if (canRetry) {
          deliveryId = pendingDelivery.id;
          await appendAdminAuditEvent(trx, {
            staffUserId: identity.userId,
            staffRole: role,
            action: 'workspace.invitation.delivery.retry_requested',
            targetType: 'workspace_invitation',
            targetId: input.invitationId,
            workspaceId: input.workspaceId,
            reason: input.reason,
            before: { deliveryStatus: pendingDelivery.status, attempts: pendingDelivery.attempts },
            after: { retryRequested: true },
            userAgent: context.userAgent,
          });
          return adminWorkspaceTeamActionResultSchema.parse({
            action: 'resend_invitation',
            changed: true,
            delivery: 'failed',
            expiresAt: invitation.expiresAt.toISOString(),
          });
        }

        const { expiresAt, deliveryId: queuedDeliveryId } = await resendWorkspaceInvitation(trx, {
          invitationId: input.invitationId,
          reason: input.reason,
          actor: { type: 'staff', id: identity.userId },
          appURL: getAdminCustomerAppURL(),
          queueEmail: queueTeamInvitationDelivery,
        });
        if (!queuedDeliveryId) throw new Error('Workspace invitation delivery was not queued.');
        deliveryId = queuedDeliveryId;
        await appendAdminAuditEvent(trx, {
          staffUserId: identity.userId,
          staffRole: role,
          action: 'workspace.invitation.resent',
          targetType: 'workspace_invitation',
          targetId: input.invitationId,
          workspaceId: input.workspaceId,
          reason: input.reason,
          before: { status: invitation.status },
          after: { status: 'sent', expiresAt: expiresAt.toISOString() },
          userAgent: context.userAgent,
        });
        return adminWorkspaceTeamActionResultSchema.parse({
          action: 'resend_invitation',
          changed: true,
          delivery: 'failed',
          expiresAt: expiresAt.toISOString(),
        });
      }, {
        action: input.action === 'remove'
          ? 'workspace.member.remove.access_denied'
          : 'workspace.invitation.resend.access_denied',
        targetType: input.action === 'remove' ? 'workspace_member' : 'workspace_invitation',
        targetId: input.action === 'remove' ? input.userId : input.invitationId,
      }, permission);
    } catch (error) {
      if (error instanceof TeamActionError) throw new WorkspaceManagementError(error.message, 409);
      throw error;
    }

    if (input.action === 'remove') return result;
    if (!deliveryId) throw new Error('Workspace invitation delivery identifier is missing.');
    let sent = false;
    try {
      sent = await dispatchTeamInvitationDelivery(identity, deliveryId, context);
    } catch (error) {
      if (!(error instanceof WorkspaceManagementError) || ![401, 403].includes(error.status)) throw error;
    }
    return adminWorkspaceTeamActionResultSchema.parse({
      ...result,
      delivery: sent ? 'sent' : 'failed',
    });
  }

  return {
    readDirectory,
    readDetail,
    readBilling,
    readBillingLinks,
    planChangeMethods,
    previewPlanChange,
    startPlanChange,
    verifyPlanChangeFactor,
    commitPlanChange,
    recoveryMethods,
    previewRecovery,
    startRecovery,
    verifyRecoveryFactor,
    commitRecovery,
    webhookReplayMethods,
    startWebhookReplay,
    verifyWebhookReplayFactor,
    commitWebhookReplay,
    suspensionMethods,
    startSuspension,
    verifySuspensionFactor,
    commitSuspension,
    ownershipTransferMethods,
    startOwnershipTransfer,
    verifyOwnershipTransferFactor,
    commitOwnershipTransfer,
    planOverrideMethods,
    startPlanOverride,
    verifyPlanOverrideFactor,
    commitPlanOverride,
    aiBudgetMethods,
    startAIBudgetChange,
    verifyAIBudgetFactor,
    commitAIBudgetChange,
    performTeamAction,
  };
}

export const workspaceManagement = createWorkspaceManagementService(workspaceManagementDatabase);
