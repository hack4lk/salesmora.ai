import type { Knex } from 'knex';
import { normalizeStaffReason } from '@salesmora/domain';
import type { SuspensionActor } from './suspension';

/** Staff IDs come from the admin console session, never from customer input. */
export type AccountActor = SuspensionActor;
export class AccountActionError extends Error {}

const maxSessionIds = 100;

function checkActor(actor: AccountActor) {
  if (!actor || !['staff', 'system'].includes(actor.type) || typeof actor.id !== 'string' || !actor.id.trim()) {
    throw new AccountActionError('A valid actor is required.');
  }
}

function checkSessionIds(sessionIds: unknown): string[] | undefined {
  if (sessionIds === undefined) return undefined;
  if (!Array.isArray(sessionIds) || !sessionIds.length || sessionIds.length > maxSessionIds ||
    !sessionIds.every(id => typeof id === 'string' && id.trim())) {
    throw new AccountActionError(`Choose between 1 and ${maxSessionIds} sessions.`);
  }
  return [...new Set(sessionIds as string[])];
}

async function lockUser(trx: Knex.Transaction, userId: string) {
  const user = await trx('users').where({ id: userId }).forUpdate()
    .first<{ emailVerified: boolean; deletionRequestedAt: Date | null } | undefined>('emailVerified', 'deletionRequestedAt');
  if (!user) throw new AccountActionError('User not found.');
  return user;
}

/**
 * Signs a user out of every device, or only the chosen sessions (U4).
 * Session IDs that belong to another user are ignored. Revoking nothing writes no audit row.
 * Pass a transaction as `db` to commit extra rows (such as the admin audit event) atomically.
 */
export async function revokeUserSessions(db: Knex, input: { userId: string; sessionIds?: string[]; reason: string; actor: AccountActor }): Promise<{ revoked: number }> {
  checkActor(input.actor);
  const reason = normalizeStaffReason(input.reason);
  const sessionIds = checkSessionIds(input.sessionIds);
  return db.transaction(async trx => {
    await lockUser(trx, input.userId);
    const query = trx('sessions').where({ userId: input.userId });
    if (sessionIds) query.whereIn('id', sessionIds);
    const revoked = (await query.delete().returning<{ id: string }[]>('id')).map(row => row.id).sort();
    if (!revoked.length) return { revoked: 0 };
    await trx('accountAudit').insert({ userId: input.userId, action: 'sessions.revoked', actorType: input.actor.type, actorId: input.actor.id,
      reason, details: JSON.stringify({ scope: sessionIds ? 'selected' : 'all', sessionIds: revoked }) });
    return { revoked: revoked.length };
  });
}

/**
 * Marks a user's email verified without a verification link (U6). Queued teammate invitations
 * from this user are delivered the next time they open Home, as after a normal verification.
 */
export async function markEmailVerified(db: Knex, input: { userId: string; reason: string; actor: AccountActor }): Promise<{ changed: boolean }> {
  checkActor(input.actor);
  const reason = normalizeStaffReason(input.reason);
  return db.transaction(async trx => {
    const user = await lockUser(trx, input.userId);
    if (user.deletionRequestedAt) throw new AccountActionError('This user is being deleted.');
    if (user.emailVerified) return { changed: false };
    await trx('users').where({ id: input.userId }).update({ emailVerified: true, updatedAt: trx.fn.now() });
    await trx('accountAudit').insert({ userId: input.userId, action: 'email.marked_verified', actorType: input.actor.type, actorId: input.actor.id, reason });
    return { changed: true };
  });
}
