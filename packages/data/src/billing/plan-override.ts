import { enqueueCaptureAccessCheck } from '../lead-capture/capacity';
import { workspaceEntitlements } from './entitlements';
import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { normalizePlanOverride, normalizePlanOverrideReason } from '@salesmora/domain';
import type { SuspensionActor } from '../accounts/suspension';

/** Staff IDs come from the admin console session, never from customer input. */
export type PlanOverrideActor = SuspensionActor;
export class PlanOverrideError extends Error {}
export interface PlanOverrideResult { changed: boolean; overrideId: string | null }

function checkActor(actor: PlanOverrideActor) {
  if (!actor || !['staff', 'system'].includes(actor.type) || typeof actor.id !== 'string' || !actor.id.trim()) {
    throw new PlanOverrideError('A valid actor is required.');
  }
}

async function lockWorkspace(trx: Knex.Transaction, workspaceId: string) {
  const row = await trx('workspaces').where({ id: workspaceId }).forUpdate()
    .first<{ deletionRequestedAt: Date | null; planOverride: string | null; planOverrideEndsAt: Date | null; planOverrideId: string | null } | undefined>(
      'deletionRequestedAt', 'planOverride', 'planOverrideEndsAt', 'planOverrideId');
  if (!row) throw new PlanOverrideError('Workspace not found.');
  return row;
}

async function databaseNow(trx: Knex.Transaction) {
  const { rows } = await trx.raw<{ rows: { now: Date }[] }>('SELECT statement_timestamp() AS now');
  return new Date(rows[0].now);
}

const previous = (row: { planOverride: string | null; planOverrideEndsAt: Date | null; planOverrideId: string | null }) =>
  row.planOverrideId ? { overrideId: row.planOverrideId, plan: row.planOverride, endsAt: row.planOverrideEndsAt?.toISOString() ?? null } : null;

/**
 * Grants Standard or Premium limits until `endsAt` (at most 12 months away). Replaces any existing
 * override. Stripe keeps billing the original plan, and a higher paid plan always wins.
 * Pass a transaction as `db` to commit the admin audit event atomically.
 */
export async function applyPlanOverride(db: Knex, input: { workspaceId: string; plan: string; endsAt: Date | string; reason: string; actor: PlanOverrideActor }): Promise<PlanOverrideResult> {
  checkActor(input.actor);
  normalizePlanOverrideReason(input.reason);
  return db.transaction(async trx => {
    const workspace = await lockWorkspace(trx, input.workspaceId);
    if (workspace.deletionRequestedAt) throw new PlanOverrideError('This workspace is being deleted.');
    const override = normalizePlanOverride(input, await databaseNow(trx));
    if (workspace.planOverrideEndsAt && workspace.planOverrideEndsAt <= await databaseNow(trx)) {
      const lost = await workspaceEntitlements(trx, input.workspaceId);
      await enqueueCaptureAccessCheck(trx, input.workspaceId, lost.plan.id, workspace.planOverrideEndsAt);
    }
    const overrideId = randomUUID();
    await trx('workspaces').where({ id: input.workspaceId })
      .update({ planOverride: override.plan, planOverrideEndsAt: override.endsAt, planOverrideReason: override.reason, planOverrideId: overrideId });
    await trx('billingAudit').insert({ workspaceId: input.workspaceId, actorId: input.actor.id, action: 'plan.override_applied',
      details: JSON.stringify({ actorType: input.actor.type, overrideId, plan: override.plan, endsAt: override.endsAt.toISOString(), reason: override.reason, previous: previous(workspace) }) });
    const entitlement = await workspaceEntitlements(trx, input.workspaceId);
    await enqueueCaptureAccessCheck(trx, input.workspaceId, entitlement.plan.id, entitlement.now);
    return { changed: true, overrideId };
  });
}

/** Ends the override now. Clearing a workspace without one is a no-op that writes no audit row. */
export async function clearPlanOverride(db: Knex, input: { workspaceId: string; reason: string; actor: PlanOverrideActor }): Promise<PlanOverrideResult> {
  checkActor(input.actor);
  const reason = normalizePlanOverrideReason(input.reason);
  return db.transaction(async trx => {
    const workspace = await lockWorkspace(trx, input.workspaceId);
    if (workspace.deletionRequestedAt) throw new PlanOverrideError('This workspace is being deleted.');
    if (!workspace.planOverrideId) return { changed: false, overrideId: null };
    if (workspace.planOverrideEndsAt && workspace.planOverrideEndsAt <= await databaseNow(trx)) {
      const lost = await workspaceEntitlements(trx, input.workspaceId);
      await enqueueCaptureAccessCheck(trx, input.workspaceId, lost.plan.id, workspace.planOverrideEndsAt);
    }
    await trx('workspaces').where({ id: input.workspaceId })
      .update({ planOverride: null, planOverrideEndsAt: null, planOverrideReason: null, planOverrideId: null });
    await trx('billingAudit').insert({ workspaceId: input.workspaceId, actorId: input.actor.id, action: 'plan.override_cleared',
      details: JSON.stringify({ actorType: input.actor.type, reason, previous: previous(workspace) }) });
    const entitlement = await workspaceEntitlements(trx, input.workspaceId);
    await enqueueCaptureAccessCheck(trx, input.workspaceId, entitlement.plan.id, entitlement.now);
    return { changed: true, overrideId: workspace.planOverrideId };
  });
}

/**
 * Audit only: limits already stop applying at `planOverrideEndsAt` because every check is time-based.
 * Records each ended grant once (a unique index makes concurrent workers safe) and leaves the columns
 * for staff to see what expired. Runs as the worker, which can't change the override columns.
 */
export async function recordExpiredPlanOverrides(db: Knex, limit = 100): Promise<number> {
  const candidates = await db('workspaces').where('planOverrideEndsAt', '<=', db.fn.now()).whereNotNull('planOverrideId').whereNotExists(db('billingAudit as a').where('a.action','plan.override_expired').whereRaw("a.details->>'overrideId' = workspaces.\"planOverrideId\"::text")).orderBy('planOverrideEndsAt').limit(limit).select('id');
  let recorded = 0;
  for (const candidate of candidates) await db.transaction(async trx => {
    const workspace = await lockWorkspace(trx, candidate.id), now = await databaseNow(trx);
    if (!workspace.planOverrideId || !workspace.planOverrideEndsAt || workspace.planOverrideEndsAt > now) return;
    const rows = await trx('billingAudit').insert({ workspaceId: candidate.id, action: 'plan.override_expired', details: JSON.stringify({ actorType: 'system', overrideId: workspace.planOverrideId, plan: workspace.planOverride, endsAt: workspace.planOverrideEndsAt }) })
      .onConflict(trx.raw("((details->>'overrideId')) WHERE action = 'plan.override_expired'")).ignore().returning('id');
    if (!rows.length) return;
    const entitlement = await workspaceEntitlements(trx, candidate.id);
    await enqueueCaptureAccessCheck(trx, candidate.id, entitlement.plan.id, workspace.planOverrideEndsAt);
    recorded++;
  });
  return recorded;
}
