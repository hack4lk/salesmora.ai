import { supersedeCaptureProposals } from './proposal-supersession';
import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { resolveCaptureLocalTime, captureSourceInputSchema, captureSourceProposalViewSchema, captureSetupReferenceSchema, captureAssistantProposalDecisionSchema, type CaptureSourceInput, type CaptureSourceProposalView, type AuthorizationContext, type PermissionId } from '@salesmora/contracts';
import { authorize } from '@salesmora/domain';
import { withWorkspaceAuthorization, AuthorizationAccessError, type WorkspaceIdentity } from '../authorization/store';
import { captureDraftFingerprint, readCaptureSource, CaptureDraftConflictError, CaptureDraftValidationError } from './store';
import { captureChatStamp } from './assistant-read';
import { prepareGmailActivation, publishCaptureDraft, cancelCapturePublication, changeCapturePublication, CapturePublicationError, unavailableCaptureDelivery, type CaptureDeliveryAuthority } from './publication';
import { changeCaptureLifecycle } from './lifecycle';
import { duplicateCaptureSource } from './duplicate';
type Stored = {
  view: CaptureSourceProposalView;
  input: CaptureSourceInput;
  authority: string;
  deliveryStamp: string;
  turnId: string;
  threadId: string;
};
type Row = WorkspaceIdentity & {
  id: string;
  turnId: string;
  threadId: string;
  state: 'pending' | 'confirmed' | 'cancelled' | 'superseded';
  payload: Stored;
};
const conflict = () => new CaptureDraftConflictError();
const enabling = ['publish', 'resume', 'change_schedule'];
function stamp(context: AuthorizationContext) { return captureDraftFingerprint({ ...context, enabledPermissions: [...context.enabledPermissions].sort(), policy: { ...context.policy, grants: [...context.policy.grants].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))) } }); }
function permission(context: AuthorizationContext, operation: CaptureSourceInput['operation'], sourceId: string) {
  const resource = { kind: 'capture_source' as const, id: sourceId, workspaceId: context.workspaceId };
  const exact: PermissionId = operation === 'duplicate' ? 'leadCapture.create' : ['pause', 'resume'].includes(operation) ? 'leadCapture.pause' : ['archive', 'restore'].includes(operation) ? 'leadCapture.archive' : 'leadCapture.activate';
  if (!authorize(context, { permission: 'assistant.use' }).allowed || !authorize(context, { permission: 'leadCapture.read', resource }).allowed || !authorize(context, { permission: exact, ...(operation === 'duplicate' ? {} : { resource }) }).allowed)
    throw new AuthorizationAccessError();
}
function digest(payload: Stored) { return captureDraftFingerprint({ ...payload, view: { ...payload.view, ticket: { ...payload.view.ticket, state: undefined, inputHash: undefined }, receipt: undefined } }); }
function checked(row: Row) { const payload = row.payload; captureSourceProposalViewSchema.parse(payload.view); captureSourceInputSchema.parse(payload.input); if (payload.turnId !== row.turnId || payload.threadId !== row.threadId || payload.view.ticket.proposalId !== row.id || payload.view.ticket.workspaceId !== row.workspaceId || payload.view.ticket.inputHash !== digest(payload))
  throw conflict(); return payload; }
async function now(trx: Knex.Transaction) { return new Date((await trx.raw('SELECT statement_timestamp() AS now')).rows[0].now); }
function visible(row: Row, at: Date) { const view = checked(row).view; return captureSourceProposalViewSchema.parse({ ...view, ticket: { ...view.ticket, state: row.state === 'pending' && Date.parse(view.ticket.expiresAt) <= at.getTime() ? 'expired' : row.state } }); }
async function audit(trx: Knex.Transaction, row: Row, action: string) { await trx('chatCaptureSourceAudit').insert({ id: randomUUID(), workspaceId: row.workspaceId, actorId: row.userId, proposalId: row.id, operation: row.payload.input.operation, action, inputHash: row.payload.view.ticket.inputHash }); }
async function current(trx: Knex.Transaction, context: AuthorizationContext, row: Row, deliveryStamp: string) {
  const payload = checked(row), target = payload.view.ticket.target;
  if (target.kind !== 'source')
    throw conflict();
  permission(context, payload.input.operation, target.sourceId);
  if (stamp(context) !== payload.authority)
    throw new AuthorizationAccessError();
  if (enabling.includes(payload.input.operation) && deliveryStamp !== payload.deliveryStamp)
    throw conflict();
  const receipt = payload.view.receipt;
  if (row.state === 'confirmed' && receipt && receipt.kind !== 'intake') {
    if (!authorize(context, { permission: 'leadCapture.read', resource: { kind: 'capture_source', id: receipt.sourceId, workspaceId: context.workspaceId } }).allowed)
      throw new AuthorizationAccessError();
    const saved = await trx('captureSources').where({ workspaceId: context.workspaceId, id: receipt.sourceId }).first('version');
    if (!saved || saved.version !== receipt.sourceVersion)
      throw conflict();
    return payload;
  }
  const source = await trx('captureSources').where({ workspaceId: context.workspaceId, id: target.sourceId }).first();
  const draft = source?.draftId ? await trx('captureSourceDrafts').where({ workspaceId: context.workspaceId, id: source.draftId }).first('version') : undefined;
  if (!source || source.version !== target.sourceVersion || (draft?.version ?? null) !== target.draftVersion || source.approvedVersion !== target.approvedVersion)
    throw conflict();
  if (payload.view.ticket.transition && !await trx('capturePublicationTransitions').where({ workspaceId: context.workspaceId, sourceId: source.id, id: payload.view.ticket.transition.transitionId, configurationVersion: payload.view.ticket.transition.configurationVersion, state: 'pending' }).first('id'))
    throw conflict();
  return payload;
}
/** Canonical service review before preparing a durable, actor-owned browser decision. */
export async function proposeCaptureSource(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], turnId: string, raw: unknown, signal: AbortSignal, authority: CaptureDeliveryAuthority = unavailableCaptureDelivery, deliveryStamp = '') {
  const parsed = captureSourceInputSchema.safeParse(raw);
  if (!parsed.success)
    throw new CaptureDraftValidationError();
  const input = parsed.data;
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    signal.throwIfAborted();
    const turn = await trx('chatTurns').where({ ...identity, id: turnId }).first(), at = await now(trx);
    if (!turn || !['accepted', 'running'].includes(turn.state) || new Date(turn.leaseUntil) <= at)
      throw conflict();
    const repeated: Row | undefined = await trx('chatCaptureSourceProposals').where({ ...identity, requestId: turnId }).first();
    if (repeated) {
      const prior = await current(trx, context, repeated, deliveryStamp);
      if (captureDraftFingerprint(prior.input) !== captureDraftFingerprint(input))
        throw conflict();
      return visible(repeated, at);
    }
    const sourceId = input.sourceId ?? turn.pageContext.captureContext?.sourceId;
    if (!sourceId)
      throw new CaptureDraftValidationError();
    permission(context, input.operation, sourceId);
    if (turn.captureStamp && turn.captureStamp !== await captureChatStamp(trx, context, deliveryStamp))
      throw conflict();
    const view = await readCaptureSource(trx, identity, enabled, { workspaceId: identity.workspaceId, sourceId }, undefined, authority), source = view.detail.source, draft = view.detail.draft;
    const pending = await trx('capturePublicationTransitions').where({ workspaceId: identity.workspaceId, sourceId, state: 'pending' }).first();
    let ready = false, checks: CaptureSourceProposalView['checks'] = [], configurationKind: CaptureSourceProposalView['configurationKind'] = null;
    if (input.operation === 'publish' && !draft || input.operation === 'resume' && !source.approvedVersion) throw new CaptureDraftValidationError();
    if (input.operation === 'publish') {
      checks = view.publicationReview?.checks ?? [];
      ready = !!view.publicationReview?.ready;
    }
    else if (input.operation === 'pause')
      ready = !!view.lifecycleReview?.canPause;
    else if (input.operation === 'resume') {
      ready = !!view.lifecycleReview?.resumeReady;
      checks = (view.lifecycleReview?.resumeFailures ?? []).map(code => ({ code, ready: false }));
    }
    else if (input.operation === 'archive')
      ready = !!view.lifecycleReview?.canArchive;
    else if (input.operation === 'restore') {
      ready = !!view.lifecycleReview?.restoreReady;
      checks = (view.lifecycleReview?.restoreFailures ?? []).map(code => ({ code, ready: false }));
    }
    else if (input.operation === 'duplicate') {
      configurationKind = input.configurationKind ?? (view.detail.approved ? 'approved' : 'draft');
      ready = !!(configurationKind === 'approved' ? view.detail.approved : draft);
      if (source.type === 'gmail' && view.business.gmailAccess !== 'available') { checks.push({ code: 'access', ready: false }); ready = false; }
    }
    else {
      if (!pending || source.status === 'archived')
        throw conflict();
      if (input.operation === 'cancel_schedule')
        ready = true;
      else {
        checks = view.publicationReview?.pendingChecks ?? [];
        ready = !!view.publicationReview?.pendingReady;
      }
    }
    let timing: CaptureSourceProposalView['timing'] = input.timing?.kind === 'now' ? { kind: 'now' } : null;
    if (input.timing?.kind === 'scheduled') {
      const resolved = resolveCaptureLocalTime(input.timing.localDateTime!, view.business.timezone);
      if (!resolved.at || Date.parse(resolved.at) <= at.getTime())
        throw new CaptureDraftValidationError();
      timing = { kind: 'scheduled', at: resolved.at, timezone: view.business.timezone };
    }
    const id = randomUUID(), payload: Stored = { input, authority: stamp(context), deliveryStamp, turnId, threadId: turn.threadId, view: { ticket: { workspaceId: identity.workspaceId, proposalId: id, inputHash: '0'.repeat(64), operation: input.operation, target: { kind: 'source', sourceId, sourceVersion: source.version, draftVersion: draft?.version ?? null, approvedVersion: source.approvedVersion }, ...(['change_schedule', 'cancel_schedule'].includes(input.operation) ? { transition: { transitionId: pending.id, configurationVersion: pending.configurationVersion } } : {}), state: 'pending', createdAt: at.toISOString(), expiresAt: new Date(at.getTime() + 900000).toISOString() }, source: view, timing, configurationKind, copyName: input.operation === 'duplicate' ? input.name : null, ready, checks, receipt: null } };
    payload.view.ticket.inputHash = digest(payload);
    captureSourceProposalViewSchema.parse(payload.view);
    if (JSON.stringify(payload).length > 100000)
      throw new CaptureDraftValidationError();
    await supersedeCaptureProposals(trx, identity, turn.threadId, at, 'setup');
    const old: Row[] = await trx('chatCaptureSourceProposals').where({ ...identity, threadId: turn.threadId, state: 'pending' }).update({ state: 'superseded', resolvedAt: at }).returning('*');
    for (const row of old)
      await audit(trx, row, 'superseded');
    const [row] = await trx('chatCaptureSourceProposals').insert({ ...identity, id, requestId: turnId, turnId, threadId: turn.threadId, payload: JSON.stringify(payload) }).returning('*');
    const evidence = [...new Set([...(turn.captureSourceEvidence ?? []), id])];
    if (evidence.length > 7)
      throw conflict();
    await trx('chatTurns').where({ ...identity, id: turnId }).update({ captureSourceEvidence: JSON.stringify(evidence) });
    await audit(trx, row, 'prepared');
    signal.throwIfAborted();
    return payload.view;
  });
}
export async function readCaptureSourceProposal(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown, deliveryStamp = '') {
  const input = captureSetupReferenceSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId)
    throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => { const row: Row | undefined = await trx('chatCaptureSourceProposals').where({ ...identity, id: input.proposalId }).first(); if (!row || checked(row).view.ticket.inputHash !== input.inputHash || !await trx('chatTurns').where({ ...identity, id: row.turnId, state: 'completed' }).first('id'))
    throw new AuthorizationAccessError(); await current(trx, context, row, deliveryStamp); return visible(row, await now(trx)); });
}
export async function decideCaptureSourceProposal(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown, authority: CaptureDeliveryAuthority = unavailableCaptureDelivery, deliveryStamp = '') {
  const input = captureAssistantProposalDecisionSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId)
    throw new AuthorizationAccessError();
  if (input.decision === 'confirm' && authority.gmailBaseline) {
    const view = await readCaptureSourceProposal(db, identity, enabled, { workspaceId: input.workspaceId, proposalId: input.proposalId, inputHash: input.inputHash }, deliveryStamp);
    const { target, operation, state, transition } = view.ticket;
    if (state === 'pending' && view.ready && target.kind === 'source' && view.source.detail.source.type === 'gmail') {
      const common = { sourceId: target.sourceId, expectedVersion: target.sourceVersion, requestId: input.proposalId };
      if (operation === 'resume') {
        authority = await prepareGmailActivation(db, identity, enabled, { ...common, kind: 'approved', operation: 'source.resume' }, authority);
      } else if (view.timing?.kind === 'now' && operation === 'publish') {
        authority = await prepareGmailActivation(db, identity, enabled, { ...common, kind: 'draft', operation: 'source.launch' }, authority);
      } else if (view.timing?.kind === 'now' && operation === 'change_schedule') {
        authority = await prepareGmailActivation(db, identity, enabled, { ...common, kind: 'transition', transitionId: transition?.transitionId, operation: 'source.reschedule' }, authority);
      }
    }
  }
  const outcome = await withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const row: Row | undefined = await trx('chatCaptureSourceProposals').where({ ...identity, id: input.proposalId }).forUpdate().first();
    if (!row || checked(row).view.ticket.inputHash !== input.inputHash || !await trx('chatTurns').where({ ...identity, id: row.turnId, state: 'completed' }).first('id'))
      throw new AuthorizationAccessError();
    const payload = await current(trx, context, row, deliveryStamp), at = await now(trx), desired = input.decision === 'confirm' ? 'confirmed' : 'cancelled';
    if (row.state === desired)
      return visible(row, at);
    if (row.state !== 'pending' || Date.parse(payload.view.ticket.expiresAt) <= at.getTime() || await trx('chatTurns').where({ ...identity, threadId: row.threadId }).whereIn('state', ['accepted', 'running']).first('id'))
      throw conflict();
    if (input.decision === 'confirm') {
      if (!payload.view.ready)
        throw new CapturePublicationError('readiness', payload.view.checks.filter(check => !check.ready).map(check => check.code));
      const view = payload.view, source = view.source.detail.source, target = view.ticket.target;
      if (target.kind !== 'source')
        throw conflict();
      const base = { workspaceId: identity.workspaceId, sourceId: source.id, expectedVersion: source.version, requestId: row.id, confirmed: true as const };
      const op = payload.input.operation;
      if (op === 'publish') {
        const review = view.source.publicationReview;
        if (!review)
          throw conflict();
        const saved = await publishCaptureDraft(trx, identity, enabled, { ...base, draftVersion: target.draftVersion, baseApprovedVersion: review.baseApprovedVersion, configurationVersion: review.configurationVersion, timing: view.timing }, authority);
        const { ok: _ok, ...result } = saved;
        void _ok;
        view.receipt = { kind: 'publication', ...result };
      }
      else if (op === 'change_schedule' || op === 'cancel_schedule') {
        const command = { ...base, transitionId: view.ticket.transition?.transitionId };
        const saved = op === 'change_schedule' ? await changeCapturePublication(trx, identity, enabled, { ...command, timing: view.timing }, authority) : await cancelCapturePublication(trx, identity, enabled, command);
        const { ok: _ok, ...result } = saved;
        void _ok;
        view.receipt = { kind: 'publication', ...result };
      }
      else if (op === 'duplicate') {
        const selected = view.configurationKind === 'approved' ? view.source.detail.approved : view.source.detail.draft;
        if (!selected)
          throw conflict();
        const saved = await duplicateCaptureSource(trx, identity, enabled, { ...base, name: view.copyName, configuration: { kind: view.configurationKind, version: selected.version } });
        view.receipt = { kind: 'draft', sourceId: saved.sourceId, sourceVersion: saved.sourceVersion, draftVersion: saved.draftVersion };
      }
      else {
        let saved;
        try { saved = await changeCaptureLifecycle(trx, identity, enabled, { ...base, action: op, ...(op === 'resume' ? { configuration: { kind: 'approved', version: target.approvedVersion } } : {}) }, authority); }
        catch (error) { if (error instanceof CapturePublicationError) return { error }; throw error; }
        view.receipt = { kind: 'source', sourceId: saved.sourceId, sourceVersion: saved.sourceVersion };
      }
    }
    payload.view.ticket.state = desired;
    await trx('chatCaptureSourceProposals').where({ id: row.id }).update({ state: desired, payload: JSON.stringify(payload), resolvedAt: at });
    await audit(trx, row, desired);
    return captureSourceProposalViewSchema.parse(payload.view);
  });
  if ('error' in outcome) throw outcome.error;
  return outcome;
}
export async function captureSourceEvidenceAllowed(trx: Knex.Transaction, context: AuthorizationContext, ids: readonly string[] = [], deliveryStamp = '') {
  if (ids.length > 7 || new Set(ids).size !== ids.length)
    return false;
  for (const id of ids) {
    const row: Row | undefined = await trx('chatCaptureSourceProposals').where({ workspaceId: context.workspaceId, userId: context.userId, id }).first();
    if (!row)
      return false;
    try {
      await current(trx, context, row, deliveryStamp);
    }
    catch (error) {
      if (error instanceof AuthorizationAccessError || error instanceof CaptureDraftConflictError)
        return false;
      throw error;
    }
  }
  return true;
}
export async function visibleCaptureSourceTicket(trx: Knex.Transaction, context: AuthorizationContext, turnId: string, deliveryStamp = '') {
  const row: Row | undefined = await trx('chatCaptureSourceProposals').where({ workspaceId: context.workspaceId, userId: context.userId, turnId }).orderBy('createdAt', 'desc').first();
  if (!row)
    return undefined;
  try {
    await current(trx, context, row, deliveryStamp);
    return visible(row, await now(trx)).ticket;
  }
  catch (error) {
    if (error instanceof AuthorizationAccessError || error instanceof CaptureDraftConflictError)
      return undefined;
    throw error;
  }
}
