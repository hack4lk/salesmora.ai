import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { intakeQuerySchema, intakeListViewSchema, intakeDetailQuerySchema, intakeDetailViewSchema, prepareIntakeReviewSchema, intakePreparedReviewSchema, captureIntakeDecisionSchema, captureAnswerIssues, leadSchema, type AuthorizationContext, type CaptureDraftConfiguration, type PermissionId, type IntakeDetailView } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { withWorkspaceAuthorization, AuthorizationAccessError, type WorkspaceIdentity } from '../authorization/store';
import { assertLeadCapacity, PlanCapacityError } from '../billing/entitlements';
import { insertAdmittedLead } from '../leads/admission';
import { updateLeadInTransaction } from '../leads/update';
import { resolveCaptureAssignment } from '../lead-assignment-settings/store';
import { captureDraftFingerprint, CaptureDraftConflictError, CaptureDraftValidationError } from './store';

function read(context: AuthorizationContext) { if (!resolveAuthorizedCollectionScope(context, 'intake.read').allowed) throw new AuthorizationAccessError(); }
function allowed(context: AuthorizationContext, permission: PermissionId, id: string) { return authorize(context, { permission, resource: { kind: 'intake', id, workspaceId: context.workspaceId } }).allowed; }
function workspace(input: { workspaceId: string }, identity: WorkspaceIdentity) { if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError(); }
export function normalizeIntakeAnswers(configuration: CaptureDraftConfiguration, answers: Record<string, string | string[]>) {
  if (Object.keys(answers).some(id => !configuration.fields?.some(field => field.id === id))) throw new CaptureDraftValidationError();
  return Object.fromEntries((configuration.fields ?? []).map(field => {
    const raw = answers[field.id];
    if (field.type === 'checkboxes') {
      if (raw !== undefined && !Array.isArray(raw) || Array.isArray(raw) && raw.some(id => !field.options.some(option => option.id === id))) throw new CaptureDraftValidationError();
      return [field.id, field.options.filter(option => Array.isArray(raw) && raw.includes(option.id)).map(option => option.id)];
    }
    if (raw !== undefined && typeof raw !== 'string') throw new CaptureDraftValidationError();
    const value = typeof raw === 'string' ? raw.trim() : '';
    return [field.id, field.type === 'email' ? value.toLowerCase() : value];
  }));
}
export function intakeLeadValues(configuration: CaptureDraftConfiguration, answers: Record<string, string | string[]>) {
  const text = (key: string) => { const field = configuration.fields?.find(row => row.key === key), value = field ? answers[field.id] : ''; return typeof value !== 'string' ? '' : field?.type === 'dropdown' ? field.options.find(option => option.id === value.trim())?.label ?? '' : value.trim(); };
  return { name: text('name'), email: text('email').toLowerCase(), phone: text('phone'), service: text('service'), address: text('address'), details: text('details') };
}
async function detail(trx: Knex.Transaction, context: AuthorizationContext, intakeId: string): Promise<IntakeDetailView> {
  read(context);
  const item = await trx('intakeItems').where({ workspaceId: context.workspaceId, id: intakeId }).first();
  if (!item) throw new AuthorizationAccessError();
  const receipt = await trx('captureReceipts').where({ workspaceId: context.workspaceId, sourceId: item.sourceId, id: item.receiptId }).first();
  const source = await trx('captureSources').where({ workspaceId: context.workspaceId, id: item.sourceId }).first('id', 'name', 'type');
  const version = receipt ? await trx('captureSourceVersions').where({ workspaceId: context.workspaceId, sourceId: item.sourceId, configurationVersion: receipt.configurationVersion }).first() : null;
  if (!source || !receipt || !version || version.definitionVersion !== item.definitionVersion || version.workflowVersion !== item.workflowVersion || !version.configuration.fields || !version.configuration.workflow) throw new CaptureDraftValidationError();
  const leadScope = resolveAuthorizedCollectionScope(context, 'leads.read');
  return intakeDetailViewSchema.parse({ workspaceId: context.workspaceId, item: { id: item.id, workspaceId: item.workspaceId, sourceId: item.sourceId, receiptId: item.receiptId, version: item.version, definitionVersion: item.definitionVersion, workflowVersion: item.workflowVersion, status: item.status, answers: item.answers, flags: item.flags }, source, decisionKind: (await trx('intakeDecisions').where({ workspaceId: context.workspaceId, intakeId }).first('kind'))?.kind ?? null, configuration: version.configuration,
    timezone: (await trx('workspaces').where({ id: context.workspaceId }).first('timezone')).timezone,
    receipt: { id: receipt.id, receivedAt: receipt.receivedAt.toISOString(), evidence: receipt.evidence, originalAnswers: receipt.originalAnswers },
    capabilities: { canEdit: allowed(context, 'intake.update', item.id), canCreate: allowed(context, 'intake.approve', item.id) && authorize(context, { permission: 'leads.create' }).allowed,
      canLink: allowed(context, 'intake.approve', item.id) && leadScope.allowed, canDismiss: allowed(context, 'intake.dismiss', item.id), canReadMatches: leadScope.allowed } });
}
export async function readIntakeItem(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const input = intakeDetailQuerySchema.parse(raw); workspace(input, identity);
  return withWorkspaceAuthorization(db, identity, enabled, false, (trx, context) => detail(trx, context, input.intakeId));
}
export async function listIntakeItems(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const input = intakeQuerySchema.parse(raw); workspace(input, identity);
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    read(context);
    const query = trx('intakeItems as i').join('captureSources as s', function () { this.on('s.id', 'i.sourceId').andOn('s.workspaceId', 'i.workspaceId'); }).join('captureReceipts as r', function () { this.on('r.id', 'i.receiptId').andOn('r.workspaceId', 'i.workspaceId'); }).join('captureSourceVersions as v', function () { this.on('v.sourceId', 'i.sourceId').andOn('v.workspaceId', 'i.workspaceId').andOn('v.configurationVersion', 'r.configurationVersion'); }).where('i.workspaceId', identity.workspaceId);
    if (input.sourceId) query.where('i.sourceId', input.sourceId);
    if (input.status !== 'all') query.where('i.status', input.status);
    if (input.flag === 'attention') query.whereRaw('jsonb_array_length(i.flags)>0');
    else if (input.flag === 'clear') query.whereRaw('jsonb_array_length(i.flags)=0');
    else if (input.flag !== 'all') query.whereRaw('i.flags @> ?::jsonb', [JSON.stringify([input.flag])]);
    if (input.search) query.whereRaw("(i.answers::text ILIKE ? OR s.name ILIKE ? OR r.evidence->>'subject' ILIKE ?)", Array(3).fill(`%${input.search.replace(/[\\%_]/g, '\\$&')}%`));
    const total = Number((await query.clone().count('* as n').first())?.n ?? 0);
    const rows = await query.select('i.id', 'i.answers', 'i.status', 'i.flags', 's.id as sourceId', 's.name as sourceName', 's.type as sourceType', 'r.receivedAt', 'v.configuration').orderBy('r.receivedAt', 'desc').orderBy('i.id', 'desc').limit(input.pageSize).offset((input.page - 1) * input.pageSize);
    const sources = await trx('captureSources as s').where('s.workspaceId', identity.workspaceId).whereExists(trx('intakeItems as i').select(trx.raw('1')).whereRaw('i."workspaceId"=s."workspaceId" AND i."sourceId"=s.id')).select('s.id', 's.name').orderBy('s.name').orderBy('s.id').limit(1000);
    return intakeListViewSchema.parse({ workspaceId: identity.workspaceId, timezone: (await trx('workspaces').where({ id: identity.workspaceId }).first('timezone')).timezone, total, page: input.page, pageSize: input.pageSize, sources,
      rows: rows.map(row => { const values = intakeLeadValues(row.configuration, row.answers); return { id: row.id, name: values.name, contact: [values.email, values.phone].filter(Boolean).join(' · '), summary: values.service, source: { id: row.sourceId, name: row.sourceName, type: row.sourceType }, status: row.status, flags: row.flags, receivedAt: row.receivedAt.toISOString(), canOpen: true, canReview: allowed(context, 'intake.approve', row.id) || allowed(context, 'intake.dismiss', row.id) }; }) });
  });
}

const mergeFields = ['name', 'email', 'phone', 'service', 'address', 'details'] as const;
async function state(trx: Knex.Transaction, context: AuthorizationContext, view: IntakeDetailView, answers: Record<string, string | string[]>) {
  if (Object.keys(answers).some(id => !view.configuration.fields!.some(field => field.id === id))) throw new CaptureDraftValidationError();
  if (captureDraftFingerprint(answers) !== captureDraftFingerprint(normalizeIntakeAnswers(view.configuration, view.item.answers)) && !view.capabilities.canEdit) throw new AuthorizationAccessError();
  const values = intakeLeadValues(view.configuration, answers), email = values.email, phone = values.phone.replace(/[^0-9]/g, '');
  const matches = email || phone ? await trx('leads').where({ workspaceId: context.workspaceId }).andWhere(q => { if (email) q.orWhereRaw('lower(btrim(email))=?', [email]); if (phone) q.orWhereRaw("regexp_replace(phone,'[^0-9]','','g')=?", [phone]); }).orderBy('id').limit(101) : [];
  const candidates = matches.filter(lead => authorize(context, { permission: 'leads.read', resource: { kind: 'lead', id: lead.id, workspaceId: context.workspaceId, ownerId: lead.ownerId } }).allowed).slice(0, 20).map(lead => {
    const resource = { kind: 'lead' as const, id: lead.id, workspaceId: context.workspaceId, ownerId: lead.ownerId };
    return { leadId: lead.id, leadVersion: lead.version, name: lead.name, contact: [lead.email, lead.phone].filter(Boolean).join(' · '), reason: 'Matching email or phone', canLink: view.capabilities.canLink && !lead.archivedAt && authorize(context, { permission: 'leads.update', resource, fields: [...mergeFields] }).allowed,
      changes: mergeFields.filter(key => values[key] && values[key] !== lead[key] && authorize(context, { permission: 'leads.update', resource, fields: [key] }).allowed).map(key => ({ id: key, label: key[0].toUpperCase() + key.slice(1), existing: lead[key] ?? '', proposed: values[key] })) };
  });
  const assignment = await resolveCaptureAssignment(trx, context.workspaceId, view.configuration.workflow!.assignment);
  const requestHash = captureDraftFingerprint({ item: view.item, receiptId: view.receipt.id, configuration: view.configuration, answers, matches: matches.map(lead => ({ id: lead.id, version: lead.version, ownerId: lead.ownerId, archivedAt: lead.archivedAt })), candidates, assignment, context });
  return { values, candidates, assignment, requestHash, duplicateRequired: matches.length > 0 || view.item.flags.includes('duplicate') };
}
export async function prepareIntakeReview(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const input = prepareIntakeReviewSchema.parse(raw); workspace(input, identity);
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const view = await detail(trx, context, input.intakeId);
    if (view.item.status !== 'awaiting' || view.item.version !== input.expectedVersion) throw new CaptureDraftConflictError();
    const answers = normalizeIntakeAnswers(view.configuration, input.answers);
    const current = await state(trx, context, view, answers), now = new Date((await trx.raw('SELECT clock_timestamp() AS now')).rows[0].now);
    let capacity: 'available' | 'exhausted' = 'available';
    try { await assertLeadCapacity(trx, identity.workspaceId, { enforce: true }); } catch (error) { if (!(error instanceof PlanCapacityError)) throw error; capacity = 'exhausted'; }
    const old = await trx('intakeReviewSnapshots').where({ id: input.requestId, workspaceId: identity.workspaceId, intakeId: input.intakeId, actorId: identity.userId }).first();
    if (old && (old.requestHash !== current.requestHash || old.expiresAt <= now)) throw new CaptureDraftConflictError();
    const expiresAt = old?.expiresAt ?? new Date(now.getTime() + 600000);
    if (!old) await trx('intakeReviewSnapshots').insert({ id: input.requestId, workspaceId: identity.workspaceId, intakeId: input.intakeId, intakeVersion: view.item.version, definitionVersion: view.item.definitionVersion, workflowVersion: view.item.workflowVersion, actorId: identity.userId, policyRevision: context.policy.revision, requestHash: current.requestHash, expiresAt, review: JSON.stringify({ answers, candidates: current.candidates }) });
    return intakePreparedReviewSchema.parse({ detail: view, reviewId: input.requestId, expiresAt: expiresAt.toISOString(), answers, candidates: current.candidates, duplicateRequired: current.duplicateRequired, assignmentReady: current.assignment.ready, capacity });
  });
}

export async function decideIntake(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const input = captureIntakeDecisionSchema.parse(raw); workspace(input, identity);
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    const view = await detail(trx, context, input.intakeId);
    if (input.kind === 'dismiss' ? !view.capabilities.canDismiss : input.kind === 'link' ? !view.capabilities.canLink : !view.capabilities.canCreate) throw new AuthorizationAccessError();
    const hash = captureDraftFingerprint(input), replay = await trx('intakeDecisions').where({ workspaceId: identity.workspaceId, requestId: input.requestId }).first();
    if (replay) { if (replay.actor.userId !== identity.userId || replay.decision.requestHash !== hash) throw new CaptureDraftConflictError(); return { ok: true as const }; }
    if (view.item.status !== 'awaiting' || view.item.version !== input.expectedVersion) throw new CaptureDraftConflictError();
    const snapshot = await trx('intakeReviewSnapshots').where({ workspaceId: identity.workspaceId, id: input.reviewId, intakeId: input.intakeId, actorId: identity.userId, intakeVersion: view.item.version }).first();
    const now = new Date((await trx.raw('SELECT clock_timestamp() AS now')).rows[0].now);
    if (!snapshot || snapshot.expiresAt <= now) throw new CaptureDraftConflictError();
    const current = await state(trx, context, view, snapshot.review.answers);
    if (current.requestHash !== snapshot.requestHash || 'answers' in input && captureDraftFingerprint(normalizeIntakeAnswers(view.configuration, input.answers)) !== captureDraftFingerprint(snapshot.review.answers)) throw new CaptureDraftConflictError();
    let resultingLeadId: string | null = null;
    if (input.kind === 'link') {
      const candidate = current.candidates.find(row => row.leadId === input.leadId && row.leadVersion === input.expectedLeadVersion && row.canLink);
      if (!candidate || input.changeIds.some(key => !candidate.changes.some(change => change.id === key))) throw new AuthorizationAccessError();
      const lead = await trx('leads').where({ workspaceId: identity.workspaceId, id: candidate.leadId }).first();
      if (input.changeIds.length) await updateLeadInTransaction(trx, context, { workspaceId: identity.workspaceId, leadId: lead.id, expectedVersion: lead.version, submissionId: input.requestId, values: { name: lead.name, email: lead.email, phone: lead.phone, service: lead.service, address: lead.address, details: lead.details, notes: lead.notes, source: lead.source, ...Object.fromEntries(candidate.changes.filter(change => input.changeIds.includes(change.id)).map(change => [change.id, change.proposed])) } }, 'user', input.changeIds as (typeof mergeFields[number])[]);
      resultingLeadId = lead.id;
    } else if (input.kind !== 'dismiss') {
      if (input.kind === 'create' && current.duplicateRequired || input.definitionVersion !== view.item.definitionVersion || input.workflowVersion !== view.item.workflowVersion || !current.assignment.ready || captureAnswerIssues(view.configuration.fields!, snapshot.review.answers, view.configuration.contactRequired).length) throw new CaptureDraftValidationError();
      await assertLeadCapacity(trx, identity.workspaceId, { enforce: true });
      const lead = leadSchema.parse({ ...current.values, notes: '', source: view.source.type, stage: view.configuration.workflow!.stage, ownerId: current.assignment.assigneeId ?? '' });
      resultingLeadId = await insertAdmittedLead(trx, lead, { workspaceId: identity.workspaceId, createdBy: identity.userId, submissionId: input.requestId, submissionHash: hash }, current.assignment.assigneeId) ?? null;
      if (!resultingLeadId) throw new CaptureDraftConflictError();
      await trx('leadActivity').where({ id: resultingLeadId, workspaceId: identity.workspaceId }).update({ changes: JSON.stringify({ source: view.source.type, origin: 'lead_capture', receiptId: view.receipt.id, reviewId: input.reviewId }) });
      if (view.configuration.workflow!.tags.length) await trx('leadTags').insert(view.configuration.workflow!.tags.map(tag => ({ workspaceId: identity.workspaceId, leadId: resultingLeadId, tag })));
      if (current.assignment.assigneeId && view.configuration.workflow!.notifyAssigned) {
        const id = randomUUID(), assignee = await trx('users').where({ id: current.assignment.assigneeId }).first('name');
        await trx('leadActivity').insert({ id, workspaceId: identity.workspaceId, leadId: resultingLeadId, actorId: identity.userId, actorType: 'user', actorName: (await trx('users').where({ id: identity.userId }).first('name')).name, type: 'assigned', changes: JSON.stringify({ from: null, to: assignee.name, ownerId: current.assignment.assigneeId, toVersion: 1 }), createdAt: now });
        await trx('assignmentNotifications').insert({ id, workspaceId: identity.workspaceId, leadId: resultingLeadId, userId: current.assignment.assigneeId, createdAt: now }); await trx('assignmentEmailOutbox').insert({ id });
      }
    }
    const receipt = await trx('captureReceipts').where({ workspaceId: identity.workspaceId, id: view.receipt.id }).first('configurationVersion');
    if (resultingLeadId) await trx('leadCaptureData').insert({ id: randomUUID(), workspaceId: identity.workspaceId, sourceId: view.source.id, configurationVersion: receipt.configurationVersion, receiptId: view.receipt.id, leadId: resultingLeadId, resultingLeadId, definitionVersion: view.item.definitionVersion, answers: JSON.stringify(snapshot.review.answers) });
    const actor = { kind: 'user', userId: identity.userId };
    await trx('intakeDecisions').insert({ id: randomUUID(), workspaceId: identity.workspaceId, intakeId: input.intakeId, expectedVersion: input.expectedVersion, reviewId: input.reviewId, requestId: input.requestId, kind: input.kind, actor: JSON.stringify(actor), decision: JSON.stringify({ input, requestHash: hash }), resultingLeadId });
    await trx('intakeItems').where({ workspaceId: identity.workspaceId, id: input.intakeId }).update({ answers: JSON.stringify(snapshot.review.answers), version: view.item.version + 1, status: input.kind === 'dismiss' ? 'dismissed' : 'approved', updatedAt: now });
    await trx('captureSourceEvents').insert({ id: randomUUID(), workspaceId: identity.workspaceId, sourceId: view.source.id, kind: 'intake.decided', actor: JSON.stringify(actor), data: JSON.stringify({ sourceVersion: (await trx('captureSources').where({ id: view.source.id, workspaceId: identity.workspaceId }).first('version')).version, intakeId: input.intakeId, kind: input.kind }) });
    return { ok: true as const };
  });
}
