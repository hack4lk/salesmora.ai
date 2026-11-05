import {
  adminDeletionRequestsPageSchema,
  type AdminDeletionRequestsQuery,
  type AdminDeletionRequestsPage,
} from '@salesmora/contracts';
import type { Knex } from 'knex';

const PAGE_SIZE = 20;

interface DeletionRequestRow {
  id: string;
  customerName: string | null;
  email: string | null;
  workspaceId: string | null;
  workspaceName: string | null;
  requestedAt: Date | string;
  state: 'pending' | 'completed';
  attempts: number;
  retryAt: Date | string | null;
  lastError: string | null;
  completedAt: Date | string | null;
}

function deletionRequestsQuery(db: Knex | Knex.Transaction, filter: AdminDeletionRequestsQuery['filter']) {
  const query = db('accountDeletionRequests as r');
  if (filter === 'pending') query.where('r.state', 'pending');
  else if (filter === 'retry') query.where({ 'r.state': 'pending', 'r.lastError': 'retry_required' });
  else if (filter === 'completed') query.where('r.state', 'completed');
  return query;
}

function isoDate(value: Date | string | null) {
  return value === null ? null : new Date(value).toISOString();
}

function maskedEmail(email: string | null) {
  if (!email) return 'Unavailable after purge';
  const separator = email.lastIndexOf('@');
  if (separator <= 0 || separator === email.length - 1) throw new Error('Customer email is malformed.');
  return `${email.slice(0, Math.min(2, separator))}••••@${email.slice(separator + 1)}`;
}

export async function readAdminDeletionRequests(
  db: Knex | Knex.Transaction,
  filters: AdminDeletionRequestsQuery,
): Promise<AdminDeletionRequestsPage> {
  const query = deletionRequestsQuery(db, filters.filter);
  const count = await query.clone().countDistinct<{ count: string }[]>({ count: 'r.id' });
  const total = Number(count[0]?.count ?? 0);
  const page = Math.min(filters.page, Math.max(0, Math.ceil(total / PAGE_SIZE) - 1));
  const retryCount = await db('accountDeletionRequests')
    .where({ state: 'pending', lastError: 'retry_required' })
    .count<{ count: string }[]>({ count: '*' });
  const allCount = await db('accountDeletionRequests').count<{ count: string }[]>({ count: '*' });
  const rows = await query.clone()
    .leftJoin('users as u', 'u.id', 'r.userId')
    .leftJoin('workspaces as w', 'w.id', 'r.workspaceId')
    .select<DeletionRequestRow[]>([
      'r.id',
      'u.name as customerName',
      'u.email',
      'r.workspaceId',
      'w.businessName as workspaceName',
      'r.requestedAt',
      'r.state',
      'r.attempts',
      'r.retryAt',
      'r.lastError',
      'r.completedAt',
    ])
    .orderBy('r.requestedAt', 'desc')
    .orderBy('r.id', 'asc')
    .limit(PAGE_SIZE)
    .offset(page * PAGE_SIZE);

  return adminDeletionRequestsPageSchema.parse({
    filter: filters.filter,
    requests: rows.map(row => ({
      id: row.id,
      customerName: row.customerName ?? 'Account record purged',
      maskedEmail: maskedEmail(row.email),
      workspaceName: row.workspaceId && !row.workspaceName ? 'Workspace record purged' : row.workspaceName,
      requestedAt: isoDate(row.requestedAt),
      state: row.state,
      attempts: row.attempts,
      retryAt: isoDate(row.retryAt),
      lastError: row.lastError === 'retry_required' ? 'retry_required' : null,
      completedAt: isoDate(row.completedAt),
    })),
    total,
    allRequestsTotal: Number(allCount[0]?.count ?? 0),
    page,
    pageSize: PAGE_SIZE,
    retryScheduledTotal: Number(retryCount[0]?.count ?? 0),
  });
}
