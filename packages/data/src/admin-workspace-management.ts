import type {
  AdminWorkspaceDetailResponse,
  AdminWorkspaceDirectoryItem,
  AdminWorkspaceDirectoryQuery,
  AdminWorkspaceDirectoryResponse,
} from '@salesmora/contracts';
import {
  adminWorkspaceDetailResponseSchema,
  adminWorkspacePlanSchema,
} from '@salesmora/contracts';
import type { Knex } from 'knex';
import { getWorkspacePlan, effectiveWorkspacePlan, workspaceUsagePeriod } from '@salesmora/domain';
import { workspaceAIAllowance } from './ai-usage';
import { workspaceSeatUsage } from './billing/entitlements';
import { openInvitationStatuses } from './workspaces/invitation-tokens';

const PAGE_SIZE = 20;

interface WorkspaceDirectoryRow {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  plan: string;
  overridePlan: string | null;
  status: string;
  memberCount: string | number;
  createdAt: Date | string;
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, character => `\\${character}`);
}

function maskEmail(email: string) {
  const separator = email.lastIndexOf('@');
  if (separator <= 0 || separator === email.length - 1) throw new Error('Workspace owner email is malformed.');
  return `${email.slice(0, Math.min(2, separator))}••••@${email.slice(separator + 1)}`;
}

function queryWorkspaces(db: Knex | Knex.Transaction, filters: AdminWorkspaceDirectoryQuery) {
  const membershipCounts = db('workspaceMemberships')
    .select('workspaceId')
    .count<{ workspaceId: string; count: string }[]>({ count: 'userId' })
    .groupBy('workspaceId')
    .as('mc');
  const query = db('workspaces as w')
    .leftJoin('users as o', 'o.id', 'w.ownerId')
    .leftJoin('workspaceSubscriptions as s', 's.workspaceId', 'w.id')
    .leftJoin(membershipCounts, 'mc.workspaceId', 'w.id');

  if (filters.status === 'deleting') {
    query.whereNotNull('w.deletionRequestedAt');
  } else if (filters.status === 'suspended') {
    query.whereNull('w.deletionRequestedAt').whereNotNull('w.suspendedAt');
  } else if (filters.status === 'past_due') {
    query.whereNull('w.deletionRequestedAt').whereNull('w.suspendedAt').where('s.status', 'past_due');
  } else if (filters.status === 'active') {
    query.whereNull('w.deletionRequestedAt').whereNull('w.suspendedAt').where(function () {
      this.whereNull('s.status').orWhereNot('s.status', 'past_due');
    });
  }

  if (filters.plan === 'override') {
    query.whereNotNull('w.planOverride').where('w.planOverrideEndsAt', '>', db.fn.now());
  } else if (filters.plan !== 'all') {
    query.whereRaw(
      `CASE WHEN w."planOverride" IS NOT NULL AND w."planOverrideEndsAt" > now()
        THEN w."planOverride" ELSE COALESCE(s.plan, 'free') END = ?`,
      [filters.plan],
    );
  }

  if (filters.query) {
    const pattern = `%${escapeLike(filters.query)}%`;
    query.where(function () {
      this.whereRaw('?? ILIKE ?', ['w.businessName', pattern])
        .orWhereRaw('CAST(?? AS text) ILIKE ?', ['w.id', pattern])
        .orWhereRaw('?? ILIKE ?', ['o.name', pattern])
        .orWhereRaw('?? ILIKE ?', ['o.email', pattern]);
    });
  }
  return query;
}

function isoDate(value: Date | string) {
  return new Date(value).toISOString();
}

function workspace(row: WorkspaceDirectoryRow): AdminWorkspaceDirectoryItem {
  const plan = row.plan === 'free' || row.plan === 'standard' || row.plan === 'premium' ? row.plan : null;
  const overridePlan = row.overridePlan === null ? null
    : row.overridePlan === 'standard' || row.overridePlan === 'premium' ? row.overridePlan : null;
  const status = row.status === 'active' || row.status === 'past_due' || row.status === 'suspended' || row.status === 'deleting'
    ? row.status : null;
  const memberCount = Number(row.memberCount);
  if (!plan || !status || !Number.isSafeInteger(memberCount) || memberCount < 0) {
    throw new Error('Workspace directory contains invalid persisted data.');
  }
  return {
    id: row.id,
    name: row.name,
    ownerName: row.ownerName,
    maskedOwnerEmail: maskEmail(row.ownerEmail),
    plan,
    overridePlan,
    status,
    memberCount,
    createdAt: isoDate(row.createdAt),
  };
}

export async function readAdminWorkspaceDirectory(
  db: Knex | Knex.Transaction,
  filters: AdminWorkspaceDirectoryQuery,
): Promise<AdminWorkspaceDirectoryResponse> {
  const query = queryWorkspaces(db, filters);
  const count = await query.clone().countDistinct<{ count: string }[]>({ count: 'w.id' });
  const total = Number(count[0]?.count ?? 0);
  if (!Number.isSafeInteger(total) || total < 0) throw new Error('Workspace directory count is invalid.');
  const page = Math.min(filters.page, Math.max(0, Math.ceil(total / PAGE_SIZE) - 1));
  const rows = await query.clone()
    .select<WorkspaceDirectoryRow[]>([
      'w.id',
      'w.businessName as name',
      'o.name as ownerName',
      'o.email as ownerEmail',
      db.raw(`COALESCE(
        CASE WHEN w."planOverride" IS NOT NULL AND w."planOverrideEndsAt" > now()
          THEN w."planOverride" END,
        s.plan,
        'free'
      ) as plan`),
      db.raw(`CASE WHEN w."planOverride" IS NOT NULL AND w."planOverrideEndsAt" > now()
        THEN w."planOverride" END as "overridePlan"`),
      db.raw(`CASE
        WHEN w."deletionRequestedAt" IS NOT NULL THEN 'deleting'
        WHEN w."suspendedAt" IS NOT NULL THEN 'suspended'
        WHEN s.status = 'past_due' THEN 'past_due'
        ELSE 'active'
      END as status`),
      db.raw('COALESCE(mc.count, 0) as "memberCount"'),
      'w.createdAt',
    ])
    .orderBy('w.createdAt', 'desc')
    .orderBy('w.id', 'asc')
    .limit(PAGE_SIZE)
    .offset(page * PAGE_SIZE);
  return {
    workspaces: rows.map(workspace),
    total,
    page,
    pageSize: PAGE_SIZE,
  };
}

interface WorkspaceDetailRow {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerOnboardingStatus: string;
  plan: string | null;
  subscriptionStatus: string | null;
  paidThrough: Date | string | null;
  recoveryUntil: Date | string | null;
  transitionUntil: Date | string | null;
  customerId: string | null;
  planOverride: string | null;
  planOverrideEndsAt: Date | string | null;
  planOverrideReason: string | null;
  planOverrideId: string | null;
  suspendedAt: Date | string | null;
  suspendedReason: string | null;
  deletionRequestedAt: Date | string | null;
  createdAt: Date | string;
}

interface WorkspaceMemberRow {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  suspendedAt: Date | string | null;
  lastActivity: Date | string | null;
}

function displayDate(value: Date | string, includeTime = false) {
  const timestamp = new Date(value);
  if (!Number.isFinite(timestamp.getTime())) throw new Error('Workspace detail contains an invalid date.');
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    ...(includeTime ? { timeStyle: 'short' as const } : {}),
    timeZone: 'UTC',
  }).format(timestamp);
}

function safeCount(value: string | number | bigint | null | undefined, field: string) {
  const count = Number(value ?? 0);
  if (!Number.isSafeInteger(count) || count < 0) throw new Error(`Workspace ${field} count is invalid.`);
  return count;
}

function memberRole(role: string) {
  if (role === 'owner') return 'Owner' as const;
  if (role === 'admin') return 'Admin' as const;
  if (role === 'office') return 'Office' as const;
  if (role === 'field') return 'Field' as const;
  throw new Error('Workspace membership contains an invalid role.');
}

function invitationRole(role: string) {
  if (role === 'admin') return 'Admin' as const;
  if (role === 'office') return 'Office' as const;
  if (role === 'field') return 'Field' as const;
  throw new Error('Workspace invitation contains an invalid role.');
}

async function workspaceCount(db: Knex | Knex.Transaction, table: string, workspaceId: string) {
  const row = await db(table).where({ workspaceId }).count('* as count')
    .first<{ count: string | number | bigint }>();
  return safeCount(row?.count, table);
}

export async function readAdminWorkspaceDetail(
  db: Knex | Knex.Transaction,
  workspaceId: string,
): Promise<AdminWorkspaceDetailResponse | null> {
  const row = await db('workspaces as w')
    .join('users as o', 'o.id', 'w.ownerId')
    .leftJoin('workspaceSubscriptions as s', 's.workspaceId', 'w.id')
    .where('w.id', workspaceId)
    .select<WorkspaceDetailRow[]>([
      'w.id',
      'w.businessName as name',
      'w.ownerId',
      'o.name as ownerName',
      'o.email as ownerEmail',
      'o.onboardingStatus as ownerOnboardingStatus',
      's.plan',
      's.status as subscriptionStatus',
      's.paidThrough',
      's.recoveryUntil',
      's.transitionUntil',
      's.customerId',
      'w.planOverride',
      'w.planOverrideEndsAt',
      'w.planOverrideReason',
      'w.planOverrideId',
      'w.suspendedAt',
      'w.suspendedReason',
      'w.deletionRequestedAt',
      'w.createdAt',
    ])
    .first();
  if (!row) return null;

  const { rows: clockRows } = await db.raw('SELECT clock_timestamp() AS now');
  const now = new Date(clockRows[0]?.now);
  if (!Number.isFinite(now.getTime())) throw new Error('Workspace detail clock is invalid.');
  const period = workspaceUsagePeriod(now);
  const subscriptionPlan = adminWorkspacePlanSchema.parse(row.plan ?? 'free');
  const effective = effectiveWorkspacePlan(
    row.plan ? {
      plan: subscriptionPlan,
      status: row.subscriptionStatus ?? 'free',
      paidThrough: row.paidThrough,
      recoveryUntil: row.recoveryUntil,
    } : undefined,
    { planOverride: row.planOverride, planOverrideEndsAt: row.planOverrideEndsAt },
    now,
  );
  const effectivePlan = getWorkspacePlan(effective.plan);

  const sessionActivity = db('sessions')
    .select('userId')
    .max<{ userId: string; lastActivity: Date | string }[]>({ lastActivity: 'updatedAt' })
    .groupBy('userId')
    .as('sa');
  const memberRows = await db('workspaceMemberships as m')
    .join('users as u', 'u.id', 'm.userId')
    .leftJoin(sessionActivity, 'sa.userId', 'm.userId')
    .where('m.workspaceId', workspaceId)
    .select<WorkspaceMemberRow[]>([
      'm.userId as id',
      'u.name',
      'u.email',
      'm.role',
      'u.emailVerified',
      'u.suspendedAt',
      'sa.lastActivity',
    ])
    .orderByRaw(`CASE WHEN m.role = 'owner' THEN 0 WHEN m.role = 'admin' THEN 1 ELSE 2 END`)
    .orderBy('u.name', 'asc')
    .limit(100);
  const invitations = await db('workspaceInvitations')
    .where({ workspaceId })
    .whereIn('status', [...openInvitationStatuses])
    .where(function () {
      this.whereNot('status', 'sent').orWhere('expiresAt', '>', now);
    })
    .select<{ id: string; email: string; role: string; createdAt: Date | string }[]>(
      'id', 'email', 'role', 'createdAt',
    )
    .orderBy('createdAt', 'desc')
    .limit(100);
  const seatUsage = await workspaceSeatUsage(db, workspaceId, now);
  const aiUsage = await workspaceAIAllowance(db, workspaceId, now);
  const leadUsage = await db('workspaceLeadAdmissions').where({ workspaceId })
    .where('createdAt', '>=', period.start).where('createdAt', '<', period.end)
    .count('* as count').first<{ count: string | number | bigint }>();
  const leadRecords = await workspaceCount(db, 'leads', workspaceId);
  const customerRecords = await workspaceCount(db, 'customers', workspaceId);
  const jobRecords = await workspaceCount(db, 'jobs', workspaceId);
  const estimateRecords = await workspaceCount(db, 'estimates', workspaceId);
  const workOrderRecords = await workspaceCount(db, 'workOrders', workspaceId);
  const members = [
    ...memberRows.map(member => ({
      id: member.id,
      userId: member.id,
      name: member.name,
      maskedEmail: maskEmail(member.email),
      role: memberRole(member.role),
      status: member.suspendedAt ? 'Suspended' as const
        : member.emailVerified ? 'Active' as const : 'Unverified' as const,
      lastActivity: member.lastActivity
        ? `Last session ${displayDate(member.lastActivity, true)}`
        : 'No recorded sign-in',
    })),
    ...invitations.map(invitation => ({
      id: `invitation:${invitation.id}`,
      invitationId: invitation.id,
      name: 'Pending invitation',
      maskedEmail: maskEmail(invitation.email),
      role: invitationRole(invitation.role),
      status: 'Invited' as const,
      lastActivity: `Invited ${displayDate(invitation.createdAt, true)}`,
    })),
  ].slice(0, 100);

  const status = row.deletionRequestedAt ? 'deleting'
    : row.suspendedAt ? 'suspended'
      : row.subscriptionStatus === 'past_due' ? 'past_due' : 'active';
  const overrideAudit = effective.override && row.planOverrideId
    ? await db('billingAudit').where({ workspaceId, action: 'plan.override_applied' })
      .whereRaw(`details->>'overrideId' = ?`, [row.planOverrideId])
      .orderBy('createdAt', 'desc')
      .first<{ actorId: string | null; createdAt: Date | string }>('actorId', 'createdAt')
    : undefined;
  const overrideActor = overrideAudit?.actorId
    ? await db.withSchema('admin').table('staffUsers').where({ id: overrideAudit.actorId }).first<{ name: string }>('name')
    : undefined;
  const actions = await db.withSchema('admin').table('auditEvents as e')
    .leftJoin('staffUsers as s', 's.id', 'e.staffUserId')
    .where(function () {
      this.where('e.workspaceId', workspaceId)
        .orWhere(function () {
          this.where('e.targetType', 'workspace').where('e.targetId', workspaceId);
        });
    })
    .whereNotIn('e.action', ['workspace.detail.read', 'workspace.detail.access_denied'])
    .orderBy('e.occurredAt', 'desc')
    .orderBy('e.sequence', 'desc')
    .limit(10)
    .select<{ occurredAt: Date | string; staffName: string | null; staffUserId: string | null; action: string; reason: string | null }[]>([
      'e.occurredAt',
      's.name as staffName',
      'e.staffUserId',
      'e.action',
      'e.reason',
    ]);

  const override = effective.override && row.planOverrideEndsAt ? {
    endsAt: new Date(row.planOverrideEndsAt).toISOString(),
    appliedBy: overrideActor?.name ?? (overrideAudit?.actorId ? 'Staff' : 'Unknown staff member'),
    appliedAt: overrideAudit ? displayDate(overrideAudit.createdAt, true) : 'Not recorded',
    reason: row.planOverrideReason ?? 'No reason recorded',
  } : undefined;
  const leadCount = safeCount(leadUsage?.count, 'monthly lead usage');
  const aiTokens = Number(aiUsage.usedTokens);
  if (!Number.isSafeInteger(aiTokens) || aiTokens < 0) throw new Error('Workspace AI usage is invalid.');
  const response = {
    workspace: {
      id: row.id,
      name: row.name,
      ownerName: row.ownerName,
      maskedOwnerEmail: maskEmail(row.ownerEmail),
      plan: effective.plan,
      overridePlan: effective.override?.plan ?? null,
      status,
      memberCount: safeCount(seatUsage, 'seat usage'),
      createdAt: isoDate(row.createdAt),
    },
    ownerUserId: row.ownerId,
    members,
    totalMembers: safeCount(seatUsage, 'seat usage'),
    limits: {
      teammates: effectivePlan.limits.teammates,
      leads: effectivePlan.limits.newLeadsPerMonth,
      aiTokens: aiUsage.monthlyTokens,
    },
    stripePlan: subscriptionPlan,
    subscriptionStatus: row.subscriptionStatus ?? 'No subscription (Free)',
    billingPeriod: row.recoveryUntil && status === 'past_due'
      ? `Recovery through ${displayDate(row.recoveryUntil)}`
      : row.paidThrough ? `Paid through ${displayDate(row.paidThrough)}`
        : row.transitionUntil && new Date(row.transitionUntil) > now
          ? `Transition through ${displayDate(row.transitionUntil)}` : 'Not recorded',
    paymentMethod: row.customerId
      ? 'Managed by Stripe; details are not retrieved in this view.'
      : 'None on file',
    usage: { leads: leadCount, aiTokens },
    records: {
      leads: leadRecords,
      customers: customerRecords,
      jobs: jobRecords,
      estimates: estimateRecords,
      workOrders: workOrderRecords,
    },
    onboarding: row.ownerOnboardingStatus === 'complete' ? 'Complete' : 'In progress',
    featureFlags: null,
    ...(override ? { override } : {}),
    ...(status === 'suspended'
      ? { statusDetail: `Workspace suspended${row.suspendedAt ? ` ${displayDate(row.suspendedAt)}` : ''}. Reason: ${row.suspendedReason ?? 'Not recorded'}.` }
      : status === 'deleting' && row.deletionRequestedAt
        ? { statusDetail: `Deletion requested ${displayDate(row.deletionRequestedAt)}. Workspace changes are on hold.` }
        : status === 'past_due' && row.recoveryUntil
          ? { statusDetail: `The subscription is in payment recovery through ${displayDate(row.recoveryUntil)}.` }
          : {}),
    auditActions: actions.map(action => ({
      occurredAt: displayDate(action.occurredAt, true),
      actor: action.staffName ?? (action.staffUserId ? 'Staff' : 'System'),
      description: action.action.replace(/[._]/g, ' '),
      reason: action.reason ?? 'No reason recorded',
    })),
  };
  return adminWorkspaceDetailResponseSchema.parse(response);
}
