import { isIP } from 'node:net';
import {
  notificationPreferencesSchema,
  adminCustomerUserSessionsResponseSchema,
  type AdminCustomerUser,
  type AdminCustomerUserDetail,
  type AdminCustomerUserPiiRevealResult,
  type AdminUserDirectoryQuery,
  type AdminUserDirectoryResponse,
  type AdminCustomerUserSessionsResponse,
} from '@salesmora/contracts';
import type { Knex } from 'knex';

const PAGE_SIZE = 20;
const PROFILE_SESSION_LIMIT = 20;

interface CustomerUserRow {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  suspendedAt: Date | string | null;
  deletionRequestedAt: Date | string | null;
  createdAt: Date | string;
}

interface MembershipRow {
  userId: string;
  workspaceId: string;
  workspaceName: string;
  role: string;
}

interface AccountProviderRow { providerId: string }
interface CustomerSessionMetadataRow {
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}
interface CustomerSessionAccessRow extends CustomerSessionMetadataRow { id: string }

function isoDate(value: Date | string | null) {
  return value === null ? null : new Date(value).toISOString();
}

function maskEmail(email: string) {
  const separator = email.lastIndexOf('@');
  if (separator <= 0 || separator === email.length - 1) throw new Error('Customer email is malformed.');
  const local = email.slice(0, separator);
  const visibleLength = Math.min(2, Math.max(1, local.length - 1));
  return `${local.slice(0, visibleLength)}••••@${email.slice(separator + 1)}`;
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, character => `\\${character}`);
}

function maskIpAddress(value: string | null) {
  if (!value || !isIP(value)) return null;
  if (isIP(value) === 4) {
    const [first, second] = value.split('.');
    return `${first}.${second}.x.x`;
  }
  const [left = '', right = ''] = value.split('::');
  const leftGroups = left ? left.split(':') : [];
  let rightGroups = right ? right.split(':') : [];
  const embeddedIpv4 = rightGroups.at(-1);
  if (embeddedIpv4?.includes('.')) {
    const octets = embeddedIpv4.split('.').map(Number);
    if (octets.length !== 4 || octets.some(octet => !Number.isInteger(octet) || octet < 0 || octet > 255)) return null;
    rightGroups = [
      ...rightGroups.slice(0, -1),
      ((octets[0] << 8) | octets[1]).toString(16),
      ((octets[2] << 8) | octets[3]).toString(16),
    ];
  }
  const missingGroups = 8 - leftGroups.length - rightGroups.length;
  const groups = [...leftGroups, ...Array(Math.max(0, missingGroups)).fill('0'), ...rightGroups];
  if (groups.length !== 8) return null;
  return `${groups[0]}:${groups[1]}:${Array(6).fill('xxxx').join(':')}`;
}

function describeDevice(userAgent: string | null) {
  if (!userAgent) return 'Unknown device';
  const browser = /Edg\//i.test(userAgent) ? 'Edge'
    : /Firefox\//i.test(userAgent) ? 'Firefox'
      : /Chrome\//i.test(userAgent) ? 'Chrome'
        : /Safari\//i.test(userAgent) ? 'Safari'
          : null;
  const platform = /Android/i.test(userAgent) ? 'Android'
    : /iPhone|iPad|iPod/i.test(userAgent) ? 'iOS'
      : /Macintosh|Mac OS X/i.test(userAgent) ? 'macOS'
        : /Windows/i.test(userAgent) ? 'Windows'
          : /Linux/i.test(userAgent) ? 'Linux'
            : null;
  return browser && platform ? `${browser} on ${platform}` : browser ?? platform ?? 'Unknown device';
}

function describeAuthProvider(providerId: string) {
  switch (providerId.toLowerCase()) {
    case 'credential': return 'Password';
    case 'google': return 'Google';
    case 'apple': return 'Apple';
    case 'microsoft': return 'Microsoft';
    case 'github': return 'GitHub';
    default: return 'Other provider';
  }
}

function filteredUsers(db: Knex | Knex.Transaction, filters: AdminUserDirectoryQuery) {
  const query = db('users as u');
  if (filters.status === 'active') {
    query.where({ 'u.emailVerified': true }).whereNull('u.suspendedAt').whereNull('u.deletionRequestedAt');
  } else if (filters.status === 'unverified') {
    query.where({ 'u.emailVerified': false }).whereNull('u.suspendedAt').whereNull('u.deletionRequestedAt');
  } else if (filters.status === 'suspended') {
    query.whereNotNull('u.suspendedAt').whereNull('u.deletionRequestedAt');
  } else if (filters.status === 'deletion_pending') {
    query.whereNotNull('u.deletionRequestedAt');
  }
  if (filters.query) {
    const pattern = `%${escapeLike(filters.query)}%`;
    query.where(function () {
      this.whereRaw('?? ILIKE ?', ['u.name', pattern])
        .orWhereRaw('?? ILIKE ?', ['u.email', pattern])
        .orWhereRaw('?? ILIKE ?', ['u.id', pattern])
        .orWhereExists(function () {
          this.select(db.raw('1')).from('workspaceMemberships as m')
            .join('workspaces as w', 'w.id', 'm.workspaceId')
            .whereRaw('?? = ??', ['m.userId', 'u.id'])
            .whereRaw('?? ILIKE ?', ['w.businessName', pattern]);
        });
    });
  }
  return query;
}

async function membershipsFor(db: Knex | Knex.Transaction, userIds: readonly string[]) {
  if (!userIds.length) return new Map<string, AdminCustomerUser['memberships'][number][]>();
  const rows = await db('workspaceMemberships as m')
    .join('workspaces as w', 'w.id', 'm.workspaceId')
    .whereIn('m.userId', userIds)
    .orderBy('w.businessName')
    .orderBy('m.workspaceId')
    .select<MembershipRow[]>([
      'm.userId', 'm.workspaceId', 'w.businessName as workspaceName', 'm.role',
    ]);
  const byUser = new Map<string, AdminCustomerUser['memberships'][number][]>();
  for (const row of rows) {
    const role = row.role === 'owner' ? 'Owner' : row.role === 'admin' ? 'Admin' :
      row.role === 'office' || row.role === 'field' ? 'Member' : null;
    if (!role) throw new Error('Customer workspace membership has an invalid role.');
    const memberships = byUser.get(row.userId) ?? [];
    memberships.push({ workspaceId: row.workspaceId, workspaceName: row.workspaceName, role });
    byUser.set(row.userId, memberships);
  }
  return byUser;
}

function customerUser(row: CustomerUserRow, memberships: AdminCustomerUser['memberships']): AdminCustomerUser {
  return {
    id: row.id,
    name: row.name,
    maskedEmail: maskEmail(row.email),
    emailVerified: row.emailVerified,
    suspendedAt: isoDate(row.suspendedAt),
    deletionRequestedAt: isoDate(row.deletionRequestedAt),
    createdAt: isoDate(row.createdAt)!,
    memberships,
  };
}

export async function readAdminUserDirectory(
  db: Knex | Knex.Transaction,
  filters: AdminUserDirectoryQuery,
): Promise<AdminUserDirectoryResponse> {
  const query = filteredUsers(db, filters);
  const count = await query.clone().countDistinct<{ count: string }[]>({ count: 'u.id' });
  const total = Number(count[0]?.count ?? 0);
  const page = Math.min(filters.page, Math.max(0, Math.ceil(total / PAGE_SIZE) - 1));
  const rows = await query.clone()
    .select<CustomerUserRow[]>([
      'u.id', 'u.name', 'u.email', 'u.emailVerified', 'u.suspendedAt', 'u.deletionRequestedAt', 'u.createdAt',
    ])
    .orderBy('u.createdAt', 'desc')
    .orderBy('u.id', 'asc')
    .limit(PAGE_SIZE)
    .offset(page * PAGE_SIZE);
  const memberships = await membershipsFor(db, rows.map(row => row.id));
  return {
    users: rows.map(row => customerUser(row, memberships.get(row.id) ?? [])),
    total,
    page,
    pageSize: PAGE_SIZE,
  };
}

export async function readAdminCustomerUser(db: Knex | Knex.Transaction, userId: string): Promise<AdminCustomerUser | null> {
  const row = await db('users').where({ id: userId }).first<CustomerUserRow | undefined>(
    'id', 'name', 'email', 'emailVerified', 'suspendedAt', 'deletionRequestedAt', 'createdAt',
  );
  if (!row) return null;
  const memberships = await membershipsFor(db, [row.id]);
  return customerUser(row, memberships.get(row.id) ?? []);
}

export async function readAdminCustomerUserDetail(
  db: Knex | Knex.Transaction,
  userId: string,
): Promise<AdminCustomerUserDetail | null> {
  const user = await readAdminCustomerUser(db, userId);
  if (!user) return null;

  const accountRows = await db('accounts').where({ userId }).select<AccountProviderRow[]>('providerId');
  const sessionRows = await db('sessions').where({ userId })
    .orderBy('updatedAt', 'desc')
    .orderBy('id', 'asc')
    .limit(PROFILE_SESSION_LIMIT)
    .select<CustomerSessionMetadataRow[]>('userAgent', 'ipAddress', 'createdAt', 'updatedAt');
  const sessionCount = await db('sessions').where({ userId }).count<{ count: string }[]>({ count: '*' });
  const preferenceRow = await db('notificationPreferences').where({ userId }).first(
    'leadAssignedEmail', 'visitChangedEmail', 'estimateEmail', 'deadlineReminderEmail', 'jobActivityEmail',
  );
  const providerIds = [...new Set(accountRows.map(account => account.providerId.toLowerCase()))];
  const authMethods = providerIds.includes('credential')
    ? ['Password', ...providerIds.filter(provider => provider !== 'credential').map(describeAuthProvider)]
    : providerIds.map(describeAuthProvider);
  const notificationPreferences = notificationPreferencesSchema.parse(
    preferenceRow ?? { leadAssignedEmail: true },
  );

  return {
    user,
    supplemental: {
      authMethods,
      sessions: sessionRows.map(session => ({
        device: describeDevice(session.userAgent),
        maskedIp: maskIpAddress(session.ipAddress),
        createdAt: new Date(session.createdAt).toISOString(),
        lastActivityAt: new Date(session.updatedAt).toISOString(),
      })),
      totalSessions: Number(sessionCount[0]?.count ?? 0),
      notificationPreferencesRecorded: Boolean(preferenceRow),
      notificationPreferences,
    },
  };
}

export async function readAdminCustomerUserSessions(
  db: Knex | Knex.Transaction,
  userId: string,
): Promise<AdminCustomerUserSessionsResponse> {
  const rows = await db('sessions').where({ userId })
    .orderBy('updatedAt', 'desc')
    .orderBy('id', 'asc')
    .limit(PROFILE_SESSION_LIMIT)
    .select<CustomerSessionAccessRow[]>(['id', 'userAgent', 'ipAddress', 'createdAt', 'updatedAt']);
  const count = await db('sessions').where({ userId }).count<{ count: string }[]>({ count: '*' });
  return adminCustomerUserSessionsResponseSchema.parse({
    sessions: rows.map(session => ({
      id: session.id,
      device: describeDevice(session.userAgent),
      maskedIp: maskIpAddress(session.ipAddress),
      createdAt: new Date(session.createdAt).toISOString(),
      lastActivityAt: new Date(session.updatedAt).toISOString(),
    })),
    totalSessions: Number(count[0]?.count ?? 0),
  });
}

export async function readAdminCustomerUserActionTarget(
  db: Knex | Knex.Transaction,
  userId: string,
): Promise<{ email: string; emailVerified: boolean; hasPassword: boolean; deletionPending: boolean } | null> {
  const user = await db('users').where({ id: userId })
    .first<{ email: string; emailVerified: boolean; deletionRequestedAt: Date | string | null } | undefined>(
      'email', 'emailVerified', 'deletionRequestedAt',
    );
  if (!user) return null;
  const passwordAccount = await db('accounts').where({ userId })
    .whereRaw('LOWER("providerId") = ?', ['credential'])
    .first('providerId');
  return {
    email: user.email,
    emailVerified: user.emailVerified,
    hasPassword: Boolean(passwordAccount),
    deletionPending: user.deletionRequestedAt !== null,
  };
}

export async function readAdminCustomerUserPii(
  db: Knex | Knex.Transaction,
  userId: string,
  field: 'email' | 'session_ips',
): Promise<AdminCustomerUserPiiRevealResult | null> {
  if (field === 'email') {
    const user = await db('users').where({ id: userId }).first<{ email: string } | undefined>('email');
    return user ? { field, value: user.email } : null;
  }

  const rows = await db('sessions').where({ userId })
    .orderBy('updatedAt', 'desc')
    .orderBy('id', 'asc')
    .limit(PROFILE_SESSION_LIMIT)
    .select<CustomerSessionMetadataRow[]>(['userAgent', 'ipAddress', 'createdAt', 'updatedAt']);
  return {
    field,
    sessions: rows.map(session => ({
      device: describeDevice(session.userAgent),
      ipAddress: session.ipAddress && isIP(session.ipAddress) ? session.ipAddress : null,
      createdAt: new Date(session.createdAt).toISOString(),
      lastActivityAt: new Date(session.updatedAt).toISOString(),
    })),
  };
}
