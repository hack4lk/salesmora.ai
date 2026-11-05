import { supersedeCaptureProposals } from './proposal-supersession';
import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { captureSetupSampleSchema, captureSetupFindingSchema, captureSetupProposeSchema, captureSetupContextSchema, captureSetupViewSchema, captureSetupReferenceSchema, captureSetupManualSchema, captureAssistantProposalDecisionSchema, initialCaptureSetupConfiguration, captureDraftConfigurationSchema, type CaptureSetupContext, type CaptureSetupInput, type CaptureSetupView, type AuthorizationContext, type PermissionId } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { withWorkspaceAuthorization, AuthorizationAccessError, type WorkspaceIdentity } from '../authorization/store';
import { createCaptureDraft, saveCaptureDraft, beginCaptureRevision, readCaptureSource, captureDraftStartContext, captureBusinessContextInTransaction, captureDraftFingerprint, CaptureDraftConflictError, CaptureDraftValidationError, CaptureDraftEntitlementError } from './store';
import { captureChatStamp } from './assistant-read';
import { captureSetupFindingIssues, captureSetupSampleHash } from './setup-samples';
import { retainApprovedGmailSample } from './gmail-sample-approval';
type Stored = { view: CaptureSetupView; authority: string; input: CaptureSetupInput; turnId: string; threadId: string; manual: boolean };
type Row = WorkspaceIdentity & { id: string; turnId: string; threadId: string; state: 'pending' | 'confirmed' | 'cancelled' | 'superseded'; payload: Stored };
const conflict = () => new CaptureDraftConflictError();
const applicationOperations = ['suggest_website_fields', 'suggest_workflow', 'extract_sample', 'refine_mapping', 'approve_sample'];
function authority(context: AuthorizationContext) { return captureDraftFingerprint({ ...context, policy: { ...context.policy, grants: [...context.policy.grants].sort((a, b) => `${a.role}:${a.permission}`.localeCompare(`${b.role}:${b.permission}`)) }, enabledPermissions: [...context.enabledPermissions].sort() }); }
function permission(context: AuthorizationContext, input: CaptureSetupInput, sourceId?: string) {
  if (!authorize(context, { permission: 'assistant.use' }).allowed) throw new AuthorizationAccessError();
  const resource = sourceId ? { kind: 'capture_source' as const, id: sourceId, workspaceId: context.workspaceId } : undefined;
  if (!(resource ? authorize(context, { permission: 'leadCapture.read', resource }) : resolveAuthorizedCollectionScope(context, 'leadCapture.read')).allowed) throw new AuthorizationAccessError();
  if (resource ? !authorize(context, { permission: 'leadCapture.read', resource }).allowed : !authorize(context, { permission: 'leadCapture.create' }).allowed) throw new AuthorizationAccessError();
  if (input.operation === 'create_source' ? !authorize(context, { permission: 'leadCapture.create' }).allowed : !resource || !authorize(context, { permission: 'leadCapture.update', resource }).allowed) throw new AuthorizationAccessError();
}
function digest(payload: Stored) {
  const ticket = { ...payload.view.ticket, state: undefined, inputHash: undefined };
  return captureDraftFingerprint({ ticket, review: payload.view.review, authority: payload.authority, input: payload.input, turnId: payload.turnId, threadId: payload.threadId, manual: payload.manual });
}
function checked(row: Row): Stored {
  const payload = row.payload; captureSetupViewSchema.parse(payload.view); captureSetupProposeSchema.parse(payload.input);
  if (payload.view.ticket.proposalId !== row.id || payload.turnId !== row.turnId || payload.threadId !== row.threadId || payload.view.ticket.workspaceId !== row.workspaceId || payload.view.ticket.inputHash !== digest(payload)) throw conflict();
  return payload;
}
async function audit(trx: Knex.Transaction, row: Row, action: string) { await trx('chatCaptureSetupAudit').insert({ id: randomUUID(), workspaceId: row.workspaceId, actorId: row.userId, proposalId: row.id, operation: row.payload.input.operation, action, inputHash: row.payload.view.ticket.inputHash }); }
async function versions(trx: Knex.Transaction, context: AuthorizationContext, row: Row) {
  const payload = checked(row), target = payload.view.ticket.target;
  permission(context, payload.input, target.kind === 'source' ? target.sourceId : undefined);
  if (row.state === 'confirmed' && payload.view.receipt?.kind === 'saved') {
    const saved = payload.view.receipt;
    const source = await trx('captureSources').where({ workspaceId: context.workspaceId, id: saved.sourceId }).first();
    const draft = source?.draftId ? await trx('captureSourceDrafts').where({ workspaceId: context.workspaceId, id: source.draftId }).first() : undefined;
    if (!source || source.version !== saved.sourceVersion || !draft || draft.version !== saved.draftVersion) throw conflict();
    return;
  }
  if (target.kind !== 'source') return;
  const source = await trx('captureSources').where({ workspaceId: context.workspaceId, id: target.sourceId }).first();
  if (!source || source.status === 'archived') throw conflict();
  const draft = source.draftId ? await trx('captureSourceDrafts').where({ workspaceId: context.workspaceId, id: source.draftId }).first() : undefined;
  if (source.version !== target.sourceVersion || (draft?.version ?? null) !== target.draftVersion || source.approvedVersion !== target.approvedVersion) throw conflict();
}
function publicView(row: Row, now: number): CaptureSetupView {
  const view = checked(row).view;
  const state = row.state === 'pending' && Date.parse(view.ticket.expiresAt) <= now ? 'expired' : row.state;
  return captureSetupViewSchema.parse({ ...view, ticket: { ...view.ticket, state } });
}
async function current(trx: Knex.Transaction, context: AuthorizationContext, row: Row) {
  const payload = checked(row);
  const business = await captureBusinessContextInTransaction(trx, context);
  const assignment = payload.view.review.configuration.workflow?.assignment;
  if (assignment?.kind === 'teammate' && !business.teammates.some(member => member.id === assignment.teammateId)) throw conflict();
  if (payload.view.review.configuration.type === 'gmail' && business.gmailAccess !== 'available') throw new AuthorizationAccessError();
  if (payload.authority !== authority(context)) throw new AuthorizationAccessError();
  await versions(trx, context, row);
  return payload;
}
function changes(base: CaptureSetupContext['configuration'], input: CaptureSetupInput) {
  const next = structuredClone(base);
  if (input.fields !== null) next.fields = input.fields;
  if (input.contactRequired !== null) next.contactRequired = input.contactRequired;
  if (input.workflow !== null) next.workflow = input.workflow;
  if (next.type === 'website') {
    if (input.rules || input.mappings || input.findings) throw new CaptureDraftValidationError();
    if (input.brief !== null) next.brief = input.brief;
    if (input.content !== null) next.content = input.content;
  } else {
    if (input.content || input.brief !== null) throw new CaptureDraftValidationError();
    if (input.rules !== null) next.rules = input.rules;
    if (input.mappings !== null) next.mappings = input.mappings;
  }
  return captureDraftConfigurationSchema.parse(next);
}
export async function proposeCaptureSetup(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], turnId: string, raw: unknown, signal: AbortSignal, deliveryStamp = '', manual?: { requestId: string; setup: CaptureSetupContext }) {
  const input = captureSetupProposeSchema.parse(raw);
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    signal.throwIfAborted();
    const turn = await trx('chatTurns').where({ ...identity, id: turnId }).first();
    const now = new Date((await trx.raw('SELECT statement_timestamp() AS now')).rows[0].now);
    if (!turn || !(manual ? turn.state === 'completed' : ['accepted', 'running'].includes(turn.state) && new Date(turn.leaseUntil) > now)) throw conflict();
    const requestId = manual?.requestId ?? turnId;
    const repeated: Row | undefined = await trx('chatCaptureSetupProposals').where({ ...identity, requestId }).first();
    if (repeated) {
      const payload = checked(repeated);
      if (captureDraftFingerprint(payload.input) !== captureDraftFingerprint(input) || !!manual !== payload.manual || manual && captureDraftFingerprint(payload.view.review.base) !== captureDraftFingerprint(manual.setup)) throw conflict();
      await current(trx, context, repeated); return publicView(repeated, now.getTime());
    }
    const page = turn.pageContext;
    const sourceId = input.sourceId ?? page.captureContext?.sourceId;
    permission(context, input, input.operation === 'create_source' ? undefined : sourceId);
    if (turn.captureStamp && turn.captureStamp !== await captureChatStamp(trx, context, deliveryStamp) && !manual) throw conflict();
    let base: CaptureSetupContext | null = null, before = null, configuration, name: string;
    let target: CaptureSetupView['ticket']['target'];
    if (input.operation === 'create_source') {
      const business = (await captureDraftStartContext(trx, identity, enabled)).business;
      if (input.sourceType === 'gmail' && business.gmailAccess !== 'available') throw new CaptureDraftEntitlementError();
      configuration = changes(initialCaptureSetupConfiguration(input.sourceType!, business), input); name = input.name!; target = { kind: 'new_source' };
    } else {
      if (!sourceId) throw new CaptureDraftValidationError();
      const view = await readCaptureSource(trx, identity, enabled, { workspaceId: identity.workspaceId, sourceId });
      const source = view.detail.source, draft = view.detail.draft;
      if (source.status === 'archived') throw conflict();
      target = { kind: 'source', sourceId, sourceVersion: source.version, draftVersion: draft?.version ?? null, approvedVersion: source.approvedVersion };
      if (input.operation === 'begin_revision') {
        if (draft || !view.detail.approved) throw conflict();
        configuration = view.detail.approved.configuration; before = configuration; name = source.name;
      } else {
        if (!draft) throw conflict();
        const provided = manual?.setup ?? (page.captureSetup?.sourceId === sourceId ? page.captureSetup : undefined);
        base = captureSetupContextSchema.parse(provided ?? { sourceId, sourceVersion: source.version, draftVersion: draft.version, name: source.name, configuration: draft.configuration, sample: null, findings: [] });
        if (base.sourceId !== sourceId || base.sourceVersion !== source.version || base.draftVersion !== draft.version || base.configuration.type !== source.type) throw conflict();
        if (base.configuration.type === 'gmail') for (const key of ['connectionId', 'accountEmail'] as const) if (base.configuration[key] !== (draft.configuration.type === 'gmail' ? draft.configuration[key] : undefined)) throw new CaptureDraftValidationError();
        configuration = changes(base.configuration, input); before = draft.configuration; name = input.name ?? base.name;
      }
    }
    if (input.operation === 'suggest_website_fields' && configuration.type !== 'website') throw new CaptureDraftValidationError();
    const business = await captureBusinessContextInTransaction(trx, context);
    if (configuration.type === 'gmail' && business.gmailAccess !== 'available') throw new AuthorizationAccessError();
    const assignment = configuration.workflow?.assignment;
    if (assignment?.kind === 'teammate' && !business.teammates.some(member => member.id === assignment.teammateId)) throw new CaptureDraftValidationError();
    if (input.operation === 'suggest_website_fields' && (!configuration.contactRequired || !['name', 'service'].every(key => configuration.fields?.some(field => field.key === key && field.required)) || !configuration.fields?.some(field => ['email', 'phone'].includes(field.key)) || configuration.fields.some(field => !field.label || ['dropdown', 'checkboxes'].includes(field.type) && (field.options.length < 2 || field.options.some(option => !option.label))))) throw new CaptureDraftValidationError();
    const sample = base?.sample ?? null, findings = input.findings ?? base?.findings ?? [];
    if (['extract_sample', 'refine_mapping', 'approve_sample'].includes(input.operation)) {
      const issues = captureSetupFindingIssues(configuration, sample, findings, input.operation === 'approve_sample', !!manual);
      if (issues.length) throw new CaptureDraftValidationError([...new Set(issues)]);
      if (input.operation === 'approve_sample') { const included = new Set(findings.filter(row => row.included).map(row => row.fieldId)); configuration.fields = configuration.fields?.filter(field => included.has(field.id)); }
    } else if (input.findings?.length) throw new CaptureDraftValidationError();
    const id = randomUUID();
    const stored: Stored = { authority: authority(context), input, turnId, threadId: turn.threadId, manual: !!manual, view: { ticket: { workspaceId: identity.workspaceId, proposalId: id, inputHash: '0'.repeat(64), operation: input.operation, target, state: 'pending', createdAt: now.toISOString(), expiresAt: new Date(now.getTime() + 900000).toISOString() }, review: { name, configuration, before, base, sample, findings }, receipt: null } };
    stored.view.ticket.inputHash = digest(stored); captureSetupViewSchema.parse(stored.view);
    if (JSON.stringify(stored).length > 100000) throw new CaptureDraftValidationError();
    await supersedeCaptureProposals(trx, identity, turn.threadId, now, 'source');
    const old: Row[] = await trx('chatCaptureSetupProposals').where({ ...identity, threadId: turn.threadId, state: 'pending' }).update({ state: 'superseded', resolvedAt: now }).returning('*');
    for (const row of old) await audit(trx, row, 'superseded');
    const [row] = await trx('chatCaptureSetupProposals').insert({ ...identity, id, requestId, turnId, threadId: turn.threadId, payload: JSON.stringify(stored) }).returning('*');
    const evidence = [...new Set([...(turn.captureSetupEvidence ?? []), id])]; if (evidence.length > 7) throw conflict();
    await trx('chatTurns').where({ ...identity, id: turnId }).update({ captureSetupEvidence: JSON.stringify(evidence) });
    await audit(trx, row, 'prepared'); signal.throwIfAborted(); return stored.view;
  });
}
export async function readCaptureSetupProposal(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const input = captureSetupReferenceSchema.parse(raw); if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const row: Row | undefined = await trx('chatCaptureSetupProposals').where({ ...identity, id: input.proposalId }).first();
    if (!row || checked(row).view.ticket.inputHash !== input.inputHash || !await trx('chatTurns').where({ ...identity, id: row.turnId, state: 'completed' }).first('id')) throw new AuthorizationAccessError();
    await current(trx, context, row); return publicView(row, Date.now());
  });
}
export async function decideCaptureSetupProposal(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const input = captureAssistantProposalDecisionSchema.parse(raw); if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const row: Row | undefined = await trx('chatCaptureSetupProposals').where({ ...identity, id: input.proposalId }).forUpdate().first();
    if (!row || checked(row).view.ticket.inputHash !== input.inputHash || !await trx('chatTurns').where({ ...identity, id: row.turnId, state: 'completed' }).first('id')) throw new AuthorizationAccessError();
    const payload = await current(trx, context, row);
    if (row.state === (input.decision === 'confirm' ? 'confirmed' : 'cancelled')) return publicView(row, Date.now());
    const now = new Date((await trx.raw('SELECT statement_timestamp() AS now')).rows[0].now);
    if (row.state !== 'pending' || Date.parse(payload.view.ticket.expiresAt) <= now.getTime() || await trx('chatTurns').where({ ...identity, threadId: row.threadId }).whereIn('state', ['accepted', 'running']).first('id')) throw conflict();
    if (input.decision === 'confirm') {
      const { review, ticket } = payload.view, target = ticket.target;
      if (ticket.operation === 'create_source') payload.view.receipt = { kind: 'saved', ...await createCaptureDraft(trx, identity, enabled, { workspaceId: identity.workspaceId, requestId: row.id, name: review.name, configuration: review.configuration }) };
      else if (target.kind === 'source' && ticket.operation === 'begin_revision') payload.view.receipt = { kind: 'saved', ...await beginCaptureRevision(trx, identity, enabled, { workspaceId: identity.workspaceId, sourceId: target.sourceId, expectedVersion: target.sourceVersion, requestId: row.id }) };
      else if (target.kind === 'source' && ticket.operation === 'save_draft') payload.view.receipt = { kind: 'saved', ...await saveCaptureDraft(trx, identity, enabled, { workspaceId: identity.workspaceId, sourceId: target.sourceId, expectedVersion: target.sourceVersion, expectedDraftVersion: target.draftVersion, requestId: row.id, name: review.name, configuration: review.configuration }) };
      else if (target.kind === 'source' && review.base && applicationOperations.includes(ticket.operation)) {
        const applied = structuredClone(review.configuration);
        if (ticket.operation === 'approve_sample' && applied.type === 'gmail') {
          if (captureSetupFindingIssues(review.configuration, review.sample, review.findings, true, payload.manual).length) throw new CaptureDraftValidationError();
          const draft = await trx('captureSourceDrafts').where({ workspaceId: identity.workspaceId, sourceId: target.sourceId }).first('id');
          applied.sampleId = row.id;
          await trx('captureSetupSamples').insert({ id: row.id, workspaceId: identity.workspaceId, sourceId: target.sourceId, draftId: draft.id, actorId: identity.userId, configurationHash: captureSetupSampleHash(applied), sample: JSON.stringify(review.sample), findings: JSON.stringify(review.findings) });
          await retainApprovedGmailSample(trx, identity, target.sourceId, target.sourceVersion, row.id, applied, review.sample, review.findings);
        }
        payload.view.receipt = { kind: 'suggestions', sourceId: target.sourceId, configuration: applied, base: review.base, sample: review.sample, findings: review.findings, sampleApproved: ticket.operation === 'approve_sample' };
      } else throw conflict();
    }
    // The prepared hash never changes; receipts are authoritative results, not revised input.
    const state = input.decision === 'confirm' ? 'confirmed' : 'cancelled';
    payload.view.ticket.state = state;
    await trx('chatCaptureSetupProposals').where({ id: row.id }).update({ state, payload: JSON.stringify(payload), resolvedAt: now });
    await audit(trx, row, state); return captureSetupViewSchema.parse(payload.view);
  });
}
export async function captureSetupEvidenceAllowed(trx: Knex.Transaction, context: AuthorizationContext, ids: readonly string[] = []) {
  if (!ids.length) return true;
  if (ids.length > 7 || new Set(ids).size !== ids.length) return false;
  for (const id of ids) {
    const row: Row | undefined = await trx('chatCaptureSetupProposals').where({ workspaceId: context.workspaceId, userId: context.userId, id }).first();
    if (!row) return false;
    try { await current(trx, context, row); } catch (error) { if (error instanceof AuthorizationAccessError || error instanceof CaptureDraftConflictError) return false; throw error; }
  }
  return true;
}
export async function visibleCaptureSetupTicket(trx: Knex.Transaction, context: AuthorizationContext, turnId: string) {
  const row: Row | undefined = await trx('chatCaptureSetupProposals').where({ workspaceId: context.workspaceId, userId: context.userId, turnId }).orderBy('createdAt', 'desc').orderBy('id', 'desc').first();
  if (!row) return undefined;
  try { await current(trx, context, row); return publicView(row, Date.now()).ticket; } catch (error) { if (error instanceof AuthorizationAccessError || error instanceof CaptureDraftConflictError) return undefined; throw error; }
}

/** Manual corrections may approve only the same pasted sample from an actor-owned, applied extraction. */
export async function prepareCaptureSetupSampleApproval(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const input = captureSetupManualSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const origin: Row | undefined = await trx('chatCaptureSetupProposals').where({ ...identity, id: input.originProposalId, state: 'confirmed' }).first();
    if (!origin) throw new AuthorizationAccessError();
    const payload = await current(trx, context, origin), receipt = payload.view.receipt;
    if (!['extract_sample', 'refine_mapping'].includes(payload.input.operation) || receipt?.kind !== 'suggestions' || receipt.sourceId !== input.setup.sourceId || captureDraftFingerprint(receipt.sample) !== captureDraftFingerprint(input.setup.sample) || input.setup.configuration.type !== 'gmail') throw conflict();
    const configuration = input.setup.configuration;
    return proposeCaptureSetup(trx, identity, enabled, origin.turnId, { operation: 'approve_sample', sourceId: input.setup.sourceId, name: null, sourceType: null, fields: configuration.fields ?? [], contactRequired: configuration.contactRequired ?? true, workflow: null, brief: null, content: null, rules: configuration.rules ?? null, mappings: configuration.mappings ?? [], findings: input.setup.findings }, new AbortController().signal, '', { requestId: input.requestId, setup: input.setup });
  });
}
/** Approved pasted samples remain setup evidence after private chat deletion. Provider readiness is checked elsewhere. */
export async function readCaptureSetupSample(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx) => {
    const view = await readCaptureSource(trx, identity, enabled, raw), draft = view.detail.draft;
    if (!draft || draft.configuration.type !== 'gmail' || !draft.configuration.sampleId) return { sample: null };
    const row = await trx('captureSetupSamples').where({ workspaceId: identity.workspaceId, sourceId: view.detail.source.id, draftId: draft.id, id: draft.configuration.sampleId, configurationHash: captureSetupSampleHash(draft.configuration) }).first();
    return { sample: row ? { id: row.id, sample: captureSetupSampleSchema.parse(row.sample), findings: row.findings.map((finding: unknown) => captureSetupFindingSchema.parse(finding)) } : null };
  });
}
