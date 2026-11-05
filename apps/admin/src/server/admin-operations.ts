import 'server-only';
import { Queue } from 'bullmq';
import {
  adminOperationsResponseSchema,
  staffRoleIdSchema,
  staffRolePermissions,
  type AdminOperationsResponse,
} from '@salesmora/contracts';
import { createDatabase } from '@salesmora/data/database';
import { appendAdminAuditEvent } from '@salesmora/data/admin-audit';
import type { Knex } from '@salesmora/data/database';
import { getAdminAuthConfiguration } from './auth-config';
import { isAdminSessionWithinLimits } from './session-policy';

export const adminOperationsDatabase = createDatabase(getAdminAuthConfiguration().databaseUrl);

export class AdminOperationsError extends Error {
  constructor(message: string, readonly status = 400) { super(message); }
}

export interface AdminOperationsIdentity { userId: string; sessionId: string; accessEmail: string }

function redisConnection() {
  const raw = process.env.REDIS_URL ?? (process.env.NODE_ENV === 'production' ? undefined : 'redis://127.0.0.1:56379');
  if (!raw) throw new Error('Missing Redis configuration for Admin operations.');
  const url = new URL(raw);
  if (!['redis:', 'rediss:'].includes(url.protocol) || !url.hostname || url.search || url.hash ||
    !/^\/(?:\d+)?$/.test(url.pathname || '/')) {
    throw new Error('Invalid Redis configuration for Admin operations.');
  }
  const db = Number(url.pathname.slice(1) || 0);
  if (!Number.isSafeInteger(db) || db < 0 || (url.port && (Number(url.port) < 1 || Number(url.port) > 65535))) {
    throw new Error('Invalid Redis configuration for Admin operations.');
  }
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    ...(url.username ? { username: decodeURIComponent(url.username) } : {}),
    ...(url.password ? { password: decodeURIComponent(url.password) } : {}),
    db,
    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
    ...(url.protocol === 'rediss:' ? { tls: { servername: url.hostname } } : {}),
  };
}

function queueNames() {
  const configured = process.env.WORKER_QUEUE_NAME;
  if (configured) {
    if (!/^[a-z][a-z0-9-]{2,63}$/.test(configured) ||
      (process.env.NODE_ENV === 'production' &&
        ['help-ingestion-test', 'help-ingestion-development'].includes(configured))) {
      throw new Error('Invalid worker queue configuration.');
    }
    return [configured, `${configured}-chat-retention`];
  }
  if (process.env.NODE_ENV === 'production') throw new Error('WORKER_QUEUE_NAME is required in production.');
  const database = process.env.DATABASE_URL;
  if (!database) throw new Error('Missing worker queue database configuration.');
  const pathname = new URL(database).pathname;
  if (pathname === '/salesmora') return ['help-ingestion-development', 'help-ingestion-development-chat-retention'];
  if (pathname === '/salesmora_test') return ['help-ingestion-test', 'help-ingestion-test-chat-retention'];
  throw new Error('Local worker queue cannot be resolved from its database name.');
}

async function readQueue(name: string, connection: ReturnType<typeof redisConnection>) {
  const queue = new Queue(name, { connection });
  queue.on('error', () => {
    console.error(JSON.stringify({ event: 'admin.operations.redis_queue_error', queue: name }));
  });
  try {
    const [counts, workers] = await Promise.all([
      queue.getJobCounts('waiting', 'active', 'delayed', 'failed', 'completed'),
      queue.getWorkersCount(),
    ]);
    return {
      name,
      workers,
      counts: {
        waiting: counts.waiting ?? 0,
        active: counts.active ?? 0,
        delayed: counts.delayed ?? 0,
        failed: counts.failed ?? 0,
        completed: counts.completed ?? 0,
      },
    };
  } finally {
    await queue.close();
  }
}

const OUTBOXES = [
  { table: 'assignmentEmailOutbox', column: 'status', name: 'Lead assignment email' },
  { table: 'estimate_deliveries', column: 'status', name: 'Estimate delivery' },
  { table: 'estimateNotifications', column: 'emailStatus', name: 'Estimate notification' },
  { table: 'jobNotifications', column: 'emailStatus', name: 'Job notification' },
  { table: 'visitNotifications', column: 'emailStatus', name: 'Visit notification' },
  { table: 'deadlineNotifications', column: 'emailStatus', name: 'Deadline notification' },
] as const;

function countValue(value: string) {
  const count = Number(value);
  if (!Number.isSafeInteger(count) || count < 0) throw new Error('Outbox status count is invalid.');
  return count;
}

export function createAdminOperationsService(db: Knex) {
  async function read(identity: AdminOperationsIdentity, userAgent?: string | null): Promise<AdminOperationsResponse> {
    const result = await db.transaction(async trx => {
      await trx.raw("SET LOCAL lock_timeout = '5s'");
      await trx.raw("SET LOCAL statement_timeout = '15s'");
      await trx.raw("SELECT pg_advisory_xact_lock_shared(hashtextextended('admin:staff-access', 0))");
      const staff = await trx.withSchema('admin').table('staffUsers').where({ id: identity.userId }).forShare()
        .first<{ email: string; disabledAt: Date | null }>('email', 'disabledAt');
      const session = await trx.withSchema('admin').table('staffSessions').where({ id: identity.sessionId, userId: identity.userId }).forShare()
        .first<{ createdAt: Date; updatedAt: Date; expiresAt: Date }>('createdAt', 'updatedAt', 'expiresAt');
      if (!staff || staff.disabledAt || staff.email.toLowerCase() !== identity.accessEmail.toLowerCase() || !session ||
        session.expiresAt.getTime() <= Date.now() || !isAdminSessionWithinLimits(session.createdAt, session.updatedAt)) {
        return { denied: 401 as const };
      }
      const assignment = await trx.withSchema('admin').table('staffRoleAssignments').where({ userId: identity.userId })
        .whereNull('revokedAt').forShare().first<{ role: string }>('role');
      const role = staffRoleIdSchema.safeParse(assignment?.role);
      if (!role.success || !staffRolePermissions[role.data].includes('admin.queues.read') ||
        !staffRolePermissions[role.data].includes('admin.outboxes.read')) {
        await appendAdminAuditEvent(trx, {
          staffUserId: identity.userId,
          staffRole: role.success ? role.data : 'bootstrap',
          action: 'operations.access_denied',
          targetType: 'admin_operations',
          targetId: 'queue_and_outbox_health',
          after: { permissions: ['admin.queues.read', 'admin.outboxes.read'], assignedRole: role.success ? role.data : null },
          userAgent,
        });
        return { denied: 403 as const };
      }
      const connection = redisConnection();
      const names = queueNames();
      const queues = await Promise.all(names.map(name => readQueue(name, connection)));
      const outboxes: AdminOperationsResponse['outboxes'] = [];
      for (const outbox of OUTBOXES) {
        const rows = await trx(outbox.table).select(`${outbox.column} as status`)
          .count<{ status: string; count: string }[]>('* as count').groupBy(outbox.column).orderBy(outbox.column);
        outboxes.push({
          name: outbox.name,
          statuses: rows.map(row => ({ status: row.status, count: countValue(row.count) })),
        });
      }
      if (session.expiresAt.getTime() <= Date.now() || !isAdminSessionWithinLimits(session.createdAt, session.updatedAt)) {
        throw new AdminOperationsError('Your admin session expired during the request. Sign in again.', 401);
      }
      await appendAdminAuditEvent(trx, {
        staffUserId: identity.userId,
        staffRole: role.data,
        action: 'operations.health.read',
        targetType: 'admin_operations',
        targetId: 'queue_and_outbox_health',
        after: { scope: 'queue_and_outbox_status_counts' },
        userAgent,
      });
      return { report: adminOperationsResponseSchema.parse({ queues, outboxes, asOf: new Date().toISOString() }) };
    });
    if ('denied' in result) {
      throw new AdminOperationsError(
        result.denied === 401 ? 'Sign in with your verified staff identity.' : 'Your current role cannot read operations.',
        result.denied,
      );
    }
    return result.report;
  }

  return { read };
}

export const adminOperations = createAdminOperationsService(adminOperationsDatabase);
