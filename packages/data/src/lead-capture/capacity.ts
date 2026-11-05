import { restorePublicationDraft } from './restore-publication-draft';
import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { authorize, effectiveWorkspacePlan, getWorkspacePlan } from '@salesmora/domain';
import type { WorkspacePlanId } from '@salesmora/contracts';
import { loadWorkspaceAuthorization, AuthorizationAccessError } from '../authorization/store';
import { workspaceEntitlements } from '../billing/entitlements';
export const capturePublishedStates = ['active', 'paused', 'scheduled'];
export class CaptureCapacityError extends Error {
  constructor(readonly sources: { id: string; name: string }[], readonly limit: number | null, readonly gmail: boolean) {
    super(`Archive capture sources before changing or publishing on this plan${gmail ? ', including published Gmail sources' : ''}: ${sources.slice(0,5).map(source => source.name).join(', ')}${sources.length > 5 ? ` and ${sources.length - 5} more` : ''}.`);
  }
}
export async function capturePublishedSources(db: Knex, workspaceId: string) {
  return db('captureSources').where({ workspaceId }).whereIn('status', capturePublishedStates).orderBy('id').select<{ id: string; name: string; type: 'website' | 'gmail'; version: number; status: string; block: string }[]>('id','name','type','version','status','block');
}
/** Evaluate the actual target at its effective instant, including a staff override that still exists then. */
export async function captureTargetPlan(db: Knex, workspaceId: string, plan: WorkspacePlanId, at: Date) {
  const workspace = await db('workspaces').where({ id: workspaceId }).first('planOverride','planOverrideEndsAt');
  return effectiveWorkspacePlan({ plan, status: plan === 'free' ? 'free' : 'active', paidThrough: new Date(at.getTime() + 1) }, workspace, at).plan;
}
export async function assertCaptureDowngrade(trx: Knex.Transaction, workspaceId: string, target: WorkspacePlanId, at: Date) {
  await trx('workspaces').where({ id: workspaceId }).forUpdate().first('id');
  const plan = getWorkspacePlan(await captureTargetPlan(trx, workspaceId, target, at)), sources = await capturePublishedSources(trx, workspaceId);
  const over = plan.limits.publishedCaptureSources !== null && sources.length > plan.limits.publishedCaptureSources;
  const gmail = plan.id === 'free' && sources.some(source => source.type === 'gmail');
  if (over || gmail) throw new CaptureCapacityError(over ? sources : sources.filter(source => source.type === 'gmail'), plan.limits.publishedCaptureSources, gmail);
}
export async function captureCapacity(trx: Knex.Transaction, workspaceId: string, sourceId: string, type: 'website' | 'gmail') {
  const entitlement = await workspaceEntitlements(trx, workspaceId), sources = await capturePublishedSources(trx, workspaceId);
  const additional = sources.some(source => source.id === sourceId) ? 0 : 1;
  const limit = entitlement.plan.limits.publishedCaptureSources;
  let ready = limit === null || sources.length + additional <= limit;
  let access = type !== 'gmail' || entitlement.plan.id !== 'free';
  const changes = await trx('billingPlanChanges').where({ workspaceId }).whereIn('state',['applying','scheduled']).whereIn('kind',['free','downgrade']);
  const billing = await trx('workspaceSubscriptions').where({ workspaceId }).first('cancelAtPeriodEnd','paidThrough');
  if (billing?.cancelAtPeriodEnd && billing.paidThrough) changes.push({ targetPlan: 'free', basis: { end: billing.paidThrough.getTime() / 1000 } });
  for (const change of changes) {
    const target = getWorkspacePlan(await captureTargetPlan(trx, workspaceId, change.targetPlan, new Date(change.basis.end * 1000)));
    ready &&= target.limits.publishedCaptureSources === null || sources.length + additional <= target.limits.publishedCaptureSources;
    access &&= type !== 'gmail' || target.id !== 'free';
  }
  return { plan: entitlement.plan.id, used: sources.length, limit, ready, access, now: entitlement.now };
}
/** Called inside the locked effective-plan mutation. The admin role may enqueue, never alter sources. */
export async function enqueueCaptureAccessCheck(trx: Knex.Transaction, workspaceId: string, targetPlan: WorkspacePlanId, effectiveAt: Date, id = randomUUID()) {
  const sources = await capturePublishedSources(trx, workspaceId);
  const plan = getWorkspacePlan(targetPlan), overflow = plan.limits.publishedCaptureSources !== null && sources.length > plan.limits.publishedCaptureSources;
  const affected = sources.filter(source => overflow || targetPlan === 'free' && source.type === 'gmail');
  if (!affected.length) return;
  await trx('captureAccessChecks').insert({ id, workspaceId, targetPlan, effectiveAt, sources: JSON.stringify(affected.map(source => ({ id: source.id, reason: overflow ? 'source_capacity' : 'entitlement' }))) }).onConflict('id').ignore();
}
export async function notifyCaptureBlocked(trx: Knex.Transaction, workspaceId: string, sourceId: string, sourceVersion: number, reason: string) {
  const members = await trx('workspaceMemberships').where({ workspaceId }).whereIn('role',['owner','admin']).select('userId');
  for (const { userId } of members) {
    try {
      const context = await loadWorkspaceAuthorization(trx, { userId, workspaceId }, ['leadCapture.read']);
      if (!authorize(context, { permission: 'leadCapture.read', resource: { kind: 'capture_source', id: sourceId, workspaceId } }).allowed) continue;
      await trx('captureAdminNotices').insert({ id: randomUUID(), workspaceId, sourceId, sourceVersion, userId, reason }).onConflict(['workspaceId','sourceId','sourceVersion','userId']).ignore();
    } catch (error) { if (!(error instanceof AuthorizationAccessError)) throw error; }
  }
}
/** Workspace lock must be held. This records an incident once and never releases a slot. */
export async function blockCaptureSource(trx: Knex.Transaction, workspaceId: string, source: { id: string; version: number; status: string; block: string }, reason: string) {
  if (source.status === 'archived' || source.status === 'draft' || source.block === reason && source.status === 'paused') return;
  const version = source.version + 1;
  const pending = await trx('capturePublicationTransitions').where({ workspaceId, sourceId: source.id, state: 'pending' }).first('configurationVersion');
  if (pending) await restorePublicationDraft(trx, workspaceId, source.id, pending.configurationVersion);
  await trx('captureSources').where({ workspaceId, id: source.id }).update({ status: 'paused', block: reason, scheduledAt: null, timezone: null, version, updatedAt: trx.fn.now() });
  await trx('capturePublicationTransitions').where({ workspaceId, sourceId: source.id, state: 'pending' }).update({ state: 'blocked', failures: JSON.stringify([reason]), completedAt: trx.fn.now() });
  await trx('captureSourceEvents').insert({ id: randomUUID(), workspaceId, sourceId: source.id, kind: 'source.blocked', actor: JSON.stringify({ kind: 'service', service: 'billing' }), data: JSON.stringify({ sourceVersion: version, block: reason, status: 'paused' }) });
  await notifyCaptureBlocked(trx, workspaceId, source.id, version, reason);
}
/** Reconcile under an exclusive workspace lock before writes/admission and from the periodic worker. */
export async function reconcileCaptureAccessInTransaction(trx: Knex.Transaction, workspaceId: string) {
  const workspace = await trx('workspaces').where({ id: workspaceId }).forUpdate().first('id','suspendedAt','deletionRequestedAt');
  if (!workspace || workspace.deletionRequestedAt) return;
  const entitlement = await workspaceEntitlements(trx, workspaceId);
  const sources = await capturePublishedSources(trx, workspaceId);
  const queued = await trx('captureAccessChecks').where({ workspaceId }).whereNull('processedAt').where('effectiveAt','<=',entitlement.now).orderBy('effectiveAt').orderBy('id').forUpdate();
  const historical = new Map<string,string>();
  for (const check of queued) {
    for (const item of check.sources as { id: string; reason: string }[]) {
      // A reviewed relaunch after this loss supersedes delayed incident processing.
      const relaunched = await trx('captureSourceEvents').where({ workspaceId, sourceId: item.id, kind: 'source.launched' }).whereRaw("actor->>'kind' = 'user'").where('createdAt','>',check.effectiveAt).first('id');
      if (!relaunched) historical.set(item.id, item.reason);
    }
    await trx('captureAccessChecks').where({ workspaceId, id: check.id }).update({ processedAt: trx.fn.now() });
  }
  const over = entitlement.plan.limits.publishedCaptureSources !== null && sources.length > entitlement.plan.limits.publishedCaptureSources;
  for (const source of sources) {
    const reason = workspace.suspendedAt ? 'workspace' : over ? 'source_capacity' : entitlement.plan.id === 'free' && source.type === 'gmail' ? 'entitlement' : historical.get(source.id);
    if (reason) await blockCaptureSource(trx, workspaceId, source, reason);
  }
}
/** Read-only availability gate also works before the reconciliation worker has observed a loss. */
export async function captureCurrentBlocks(db: Knex, workspaceId: string) {
  const entitlement = await workspaceEntitlements(db, workspaceId), sources = await capturePublishedSources(db, workspaceId);
  const over = entitlement.plan.limits.publishedCaptureSources !== null && sources.length > entitlement.plan.limits.publishedCaptureSources;
  return new Map(sources.map(source => [source.id, over ? 'source_capacity' as const : entitlement.plan.id === 'free' && source.type === 'gmail' ? 'entitlement' as const : source.block]));
}

/** Future ingress must call this inside its write transaction and commit denied state,
 * so access recovery cannot silently reopen an incident that admission observed. */
export async function captureOperationalState(trx: Knex.Transaction, workspaceId: string, sourceId: string) {
  await reconcileCaptureAccessInTransaction(trx, workspaceId);
  const workspace = await trx('workspaces as w').join('users as u', 'u.id', 'w.ownerId').where('w.id', workspaceId).first('w.deletionRequestedAt', 'u.suspendedAt as ownerSuspendedAt', 'u.deletionRequestedAt as ownerDeletingAt');
  if (!workspace || workspace.deletionRequestedAt) return { allowed: false, status: null, block: 'workspace', configurationVersion: null };
  if (workspace.ownerSuspendedAt || workspace.ownerDeletingAt) {
    const current = await trx('captureSources').where({ workspaceId, id: sourceId }).first('id', 'version', 'status', 'block');
    if (current) await blockCaptureSource(trx, workspaceId, current, 'workspace');
  }
  const source = await trx('captureSources').where({ workspaceId, id: sourceId }).first('status','block','approvedVersion');
  return { allowed: !!source && source.status === 'active' && source.block === 'none', status: source?.status ?? null, block: source?.block ?? 'workspace', configurationVersion: source?.approvedVersion ?? null };
}
