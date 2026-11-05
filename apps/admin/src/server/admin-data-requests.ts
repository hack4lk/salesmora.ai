import 'server-only';
import {
  adminDataRequestsResponseSchema,
  adminDeletionRequestsQuerySchema,
  staffRoleIdSchema,
  staffRolePermissions,
  type AdminDataRequestsResponse,
} from '@salesmora/contracts';
import { createDatabase } from '@salesmora/data/database';
import { appendAdminAuditEvent } from '@salesmora/data/admin-audit';
import { readAdminDeletionRequests } from '@salesmora/data/admin-data-requests';
import type { Knex } from '@salesmora/data/database';
import { getAdminAuthConfiguration } from './auth-config';
import { isAdminSessionWithinLimits } from './session-policy';

export const adminDataRequestsDatabase = createDatabase(getAdminAuthConfiguration().databaseUrl);

export class AdminDataRequestsError extends Error {
  constructor(message: string, readonly status = 400) { super(message); }
}

export interface AdminDataRequestsIdentity {
  userId: string;
  sessionId: string;
  accessEmail: string;
}

interface AdminDataRequestsContext {
  userAgent?: string | null;
}

type AuthorizationResult<T> = { denied: 401 | 403 } | { denied: false; value: T };

export function createAdminDataRequestsService(db: Knex) {
  async function authorized<T>(
    identity: AdminDataRequestsIdentity,
    context: AdminDataRequestsContext,
    callback: (trx: Knex.Transaction, role: 'super_admin' | 'support' | 'billing') => Promise<T>,
    filter: string,
  ): Promise<T> {
    const result = await db.transaction(async trx => {
      await trx.raw("SET LOCAL lock_timeout = '5s'");
      await trx.raw("SET LOCAL statement_timeout = '10s'");
      await trx.raw("SELECT pg_advisory_xact_lock_shared(hashtextextended('admin:staff-access', 0))");
      const staff = await trx.withSchema('admin').table('staffUsers')
        .where({ id: identity.userId }).forShare()
        .first<{ email: string; disabledAt: Date | null }>('email', 'disabledAt');
      const session = await trx.withSchema('admin').table('staffSessions')
        .where({ id: identity.sessionId, userId: identity.userId }).forShare()
        .first<{ createdAt: Date; updatedAt: Date; expiresAt: Date }>('createdAt', 'updatedAt', 'expiresAt');
      if (!staff || staff.disabledAt || staff.email.toLowerCase() !== identity.accessEmail.toLowerCase() || !session ||
        session.expiresAt.getTime() <= Date.now() || !isAdminSessionWithinLimits(session.createdAt, session.updatedAt)) {
        return { denied: 401 as const };
      }

      const assignment = await trx.withSchema('admin').table('staffRoleAssignments')
        .where({ userId: identity.userId }).whereNull('revokedAt').forShare().first<{ role: string }>('role');
      const role = staffRoleIdSchema.safeParse(assignment?.role);
      if (!role.success || !staffRolePermissions[role.data].includes('admin.data.requests.read')) {
        await appendAdminAuditEvent(trx, {
          staffUserId: identity.userId,
          staffRole: role.success ? role.data : 'bootstrap',
          action: 'data.requests.access_denied',
          targetType: 'data_request_deletion_queue',
          targetId: filter,
          after: { permission: 'admin.data.requests.read', assignedRole: role.success ? role.data : null },
          userAgent: context.userAgent,
        });
        return { denied: 403 as const };
      }

      const value = await callback(trx, role.data);
      if (session.expiresAt.getTime() <= Date.now() || !isAdminSessionWithinLimits(session.createdAt, session.updatedAt)) {
        throw new AdminDataRequestsError('Your admin session expired during the request. Sign in again.', 401);
      }
      return { denied: false as const, value };
    }) as AuthorizationResult<T>;

    if (result.denied) {
      throw new AdminDataRequestsError(
        result.denied === 401
          ? 'Sign in with your verified staff identity.'
          : 'Your current role cannot read data requests.',
        result.denied,
      );
    }
    return result.value;
  }

  async function readDeletionQueue(
    identity: AdminDataRequestsIdentity,
    input: unknown,
    context: AdminDataRequestsContext = {},
  ): Promise<AdminDataRequestsResponse> {
    const query = adminDeletionRequestsQuerySchema.safeParse(input);
    if (!query.success) throw new AdminDataRequestsError('Invalid data-request filters.');
    return authorized(identity, context, async (trx, role) => {
      const page = await readAdminDeletionRequests(trx, query.data);
      const response = adminDataRequestsResponseSchema.parse({ ...page, role });
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role,
        action: 'data.requests.deletion_queue.read',
        targetType: 'data_request_deletion_queue',
        targetId: 'list',
        after: {
          filter: response.filter,
          page: response.page,
          pageSize: response.pageSize,
          resultCount: response.requests.length,
          total: response.total,
          retryScheduledTotal: response.retryScheduledTotal,
        },
        userAgent: context.userAgent,
      });
      return response;
    }, query.data.filter);
  }

  return { readDeletionQueue };
}

export const adminDataRequests = createAdminDataRequestsService(adminDataRequestsDatabase);
