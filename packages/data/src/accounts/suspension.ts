import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { normalizeSuspensionReason } from '@salesmora/domain';

/** Who changed the state. Staff IDs come from the admin console session, never from customer input. */
export interface SuspensionActor { type: 'staff' | 'system'; id: string }
export class SuspensionError extends Error {}
export interface SuspensionResult { changed: boolean }

type Subject = 'user' | 'workspace';

function checkActor(actor: SuspensionActor) {
  if (!actor || !['staff', 'system'].includes(actor.type) || typeof actor.id !== 'string' || !actor.id.trim()) {
    throw new SuspensionError('A valid actor is required.');
  }
}

async function audit(trx: Knex.Transaction, subjectType: Subject, subjectId: string, action: 'suspended' | 'unsuspended',
  actor: SuspensionActor, reason: string) {
  await trx('suspensionAudit').insert({ subjectType, subjectId, action, actorType: actor.type, actorId: actor.id, reason });
}

async function lockSubject(trx: Knex.Transaction, subjectType: Subject, id: string) {
  const row = await trx(subjectType === 'user' ? 'users' : 'workspaces').where({ id }).forUpdate()
    .first<{ suspendedAt: Date | null; deletionRequestedAt: Date | null } | undefined>('suspendedAt', 'deletionRequestedAt');
  if (!row) throw new SuspensionError(subjectType === 'user' ? 'User not found.' : 'Workspace not found.');
  return row;
}

/**
 * Pass a transaction as `db` to commit extra rows (such as the admin audit event) atomically.
 * Repeating a call is a no-op that writes no second audit row.
 */
export async function suspendUser(db: Knex, input: { userId: string; reason: string; actor: SuspensionActor }): Promise<SuspensionResult> {
  checkActor(input.actor);
  const reason = normalizeSuspensionReason(input.reason);
  return db.transaction(async trx => {
    const user = await lockSubject(trx, 'user', input.userId);
    if (user.deletionRequestedAt) throw new SuspensionError('This user is being deleted.');
    if (user.suspendedAt) return { changed: false };
    await trx('users').where({ id: input.userId }).update({ suspendedAt: trx.fn.now(), suspendedReason: reason });
    // Every device loses access in this commit.
    await trx('sessions').where({ userId: input.userId }).delete();
    await trx('chatTurns').where({ userId: input.userId }).whereIn('state', ['accepted', 'running'])
      .update({ state: 'cancelled', finishedAt: trx.fn.now() });
    await audit(trx, 'user', input.userId, 'suspended', input.actor, reason);
    return { changed: true };
  });
}

export async function unsuspendUser(db: Knex, input: { userId: string; reason: string; actor: SuspensionActor }): Promise<SuspensionResult> {
  checkActor(input.actor);
  const reason = normalizeSuspensionReason(input.reason);
  return db.transaction(async trx => {
    const user = await lockSubject(trx, 'user', input.userId);
    if (!user.suspendedAt) return { changed: false };
    await trx('users').where({ id: input.userId }).update({ suspendedAt: null, suspendedReason: null });
    await audit(trx, 'user', input.userId, 'unsuspended', input.actor, reason);
    return { changed: true };
  });
}

/** Members keep their accounts; only this workspace's data becomes unavailable. The Owner gets a generic notice. */
export async function suspendWorkspace(db: Knex, input: { workspaceId: string; reason: string; actor: SuspensionActor }): Promise<SuspensionResult> {
  checkActor(input.actor);
  const reason = normalizeSuspensionReason(input.reason);
  return db.transaction(async trx => {
    const workspace = await lockSubject(trx, 'workspace', input.workspaceId);
    if (workspace.deletionRequestedAt) throw new SuspensionError('This workspace is being deleted.');
    if (workspace.suspendedAt) return { changed: false };
    await trx('workspaces').where({ id: input.workspaceId }).update({ suspendedAt: trx.fn.now(), suspendedReason: reason });
    await trx('chatTurns').where({ workspaceId: input.workspaceId }).whereIn('state', ['accepted', 'running'])
      .update({ state: 'cancelled', finishedAt: trx.fn.now() });
    await trx('workspaceSuspensionNotices').insert({ id: randomUUID(), workspaceId: input.workspaceId });
    await audit(trx, 'workspace', input.workspaceId, 'suspended', input.actor, reason);
    return { changed: true };
  });
}

export async function unsuspendWorkspace(
  db: Knex,
  input: { workspaceId: string; reason: string; actor: SuspensionActor },
): Promise<SuspensionResult> {
  checkActor(input.actor);
  const reason = normalizeSuspensionReason(input.reason);
  return db.transaction(async trx => {
    const workspace = await lockSubject(trx, 'workspace', input.workspaceId);
    if (workspace.deletionRequestedAt) throw new SuspensionError('This workspace is being deleted.');
    if (!workspace.suspendedAt) return { changed: false };
    await trx('workspaces').where({ id: input.workspaceId }).update({ suspendedAt: null, suspendedReason: null });
    // A notice that hasn't gone out yet is no longer true.
    await trx('workspaceSuspensionNotices').where({ workspaceId: input.workspaceId, status: 'queued' }).update({ status: 'skipped' });
    await audit(trx, 'workspace', input.workspaceId, 'unsuspended', input.actor, reason);
    return { changed: true };
  });
}
