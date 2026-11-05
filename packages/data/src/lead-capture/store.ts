import { captureSetupSampleApproved } from './setup-samples';
import { bindSavedGmailSample } from './gmail-sample-approval';
import { createHash, randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { captureBeginRevisionSchema, captureCreateDraftSchema, captureDetailViewSchema, captureDraftSavedSchema, captureDraftStartContextSchema, captureListViewSchema, captureOperationResultSchema, captureSaveDraftSchema, captureSourceDetailQuerySchema, captureSourceDetailSchema, captureSourceListQuerySchema, captureSourceSummarySchema, serviceCatalog, type AuthorizationContext, type CaptureBusinessContext, type CaptureDraftConfiguration, type PermissionId } from '@salesmora/contracts';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';
import { unavailableCaptureDelivery, type CaptureDeliveryAuthority, capturePublicationReviewInTransaction } from './publication';
import { captureCurrentBlocks } from './capacity';
import { captureLifecycleReviewInTransaction } from './lifecycle';
import { captureInstallation } from './installation';
import { readPublicCapture } from './public';
import { workspaceEntitlements } from '../billing/entitlements';

export class CaptureDraftConflictError extends Error { constructor() { super('This draft changed or this request was already used. Reload before saving.'); } }
export class CaptureDraftValidationError extends Error { constructor(readonly issues: readonly string[] = []) { super('Check the draft details and selected teammate.'); } }
export class CaptureDraftEntitlementError extends Error { constructor() { super('Gmail capture requires an eligible workspace plan.'); } }
type Source = { id: string; workspaceId: string; name: string; type: 'website' | 'gmail'; status: 'draft' | 'active' | 'paused' | 'scheduled' | 'archived'; block: 'none' | 'entitlement' | 'source_capacity' | 'connection' | 'workspace'; version: number; approvedVersion: number | null; draftId: string | null; scheduledAt: Date | null; timezone: string | null; lastActivityAt: Date | null; updatedAt: Date; createdBy?: string | null };
type Draft = { id: string; workspaceId: string; sourceId: string; version: number; baseApprovedVersion: number | null; configuration: CaptureDraftConfiguration };
const record = (source: Source) => ({ kind: 'capture_source' as const, id: source.id, workspaceId: source.workspaceId });
const iso = (value: Date | null | undefined) => value ? value.toISOString() : null;
function read(context: AuthorizationContext) { if (!resolveAuthorizedCollectionScope(context, 'leadCapture.read').allowed) throw new AuthorizationAccessError(); }
function update(context: AuthorizationContext, source: Source) { if (!authorize(context, { permission: 'leadCapture.update', resource: record(source) }).allowed) throw new AuthorizationAccessError(); }
function create(context: AuthorizationContext) { if (!authorize(context, { permission: 'leadCapture.create' }).allowed) throw new AuthorizationAccessError(); }
function permissionView(context: AuthorizationContext) { return { canActivate: authorize(context, { permission: 'leadCapture.activate', resource: { kind: 'capture_source', id: context.workspaceId, workspaceId: context.workspaceId } }).allowed, canCreate: authorize(context, { permission: 'leadCapture.create' }).allowed, canPause: authorize(context, { permission: 'leadCapture.pause', resource: { kind: 'capture_source', id: context.workspaceId, workspaceId: context.workspaceId } }).allowed, canArchive: authorize(context, { permission: 'leadCapture.archive', resource: { kind: 'capture_source', id: context.workspaceId, workspaceId: context.workspaceId } }).allowed, canUpdate: authorize(context, { permission: 'leadCapture.update', resource: { kind: 'capture_source', id: context.workspaceId, workspaceId: context.workspaceId } }).allowed }; }
function parse<T>(parser: { safeParse: (input: unknown) => { success: boolean; data?: T } }, raw: unknown): T { const parsed = parser.safeParse(raw); if (!parsed.success) throw new CaptureDraftValidationError(); return parsed.data!; }
function inputWorkspace(input: { workspaceId: string }, identity: WorkspaceIdentity) { if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError(); }
/** Stable payload fingerprints preserve object-key equivalence while retaining meaningful array order. */
export function captureDraftFingerprint(value: unknown): string {
  const normalize = (input: unknown): unknown => Array.isArray(input) ? input.map(normalize) : input && typeof input === 'object' ? Object.fromEntries(Object.entries(input).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, normalize(item)])) : input;
  return createHash('sha256').update(JSON.stringify(normalize(value))).digest('hex');
}
async function loadSource(trx: Knex.Transaction, workspaceId: string, sourceId: string): Promise<Source> {
  const source = await trx<Source>('captureSources').where({ workspaceId, id: sourceId }).first();
  if (!source) throw new AuthorizationAccessError(); return source;
}
async function business(trx: Knex.Transaction, context: AuthorizationContext): Promise<CaptureBusinessContext> {
  const workspace = await trx('workspaces').where({ id: context.workspaceId }).first('businessName', 'businessPhone', 'serviceRange', 'postalCode', 'timezone');
  const services = await trx('workspaceServices').where({ workspaceId: context.workspaceId }).select('service').orderBy('service');
  const teammates = await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where('m.workspaceId', context.workspaceId).whereNull('u.deletionRequestedAt').whereNull('u.suspendedAt').select('u.id', 'u.name').orderBy('u.name').orderBy('u.id').limit(1000);
  const entitlement = await workspaceEntitlements(trx, context.workspaceId);
  return { businessName: workspace.businessName, businessEmail: '', businessPhone: workspace.businessPhone ?? '', services: services.map(row => serviceCatalog.find(service => service.value === row.service)?.label ?? row.service), serviceArea: [workspace.postalCode, workspace.serviceRange].filter(Boolean).join(' · '), timezone: workspace.timezone, gmailAccess: entitlement.plan.id === 'free' ? 'upgrade-required' : 'available', teammates };
}
async function metrics(trx: Knex.Transaction, workspaceId: string, ids: readonly string[]) {
  const result = new Map(ids.map(id => [id, { captured: 0, awaitingReview: 0, approved: 0, lastActivityAt: null as Date | null }]));
  if (!ids.length) return result;
  const receipts = await trx('captureReceipts').where({ workspaceId }).whereIn('sourceId', ids).groupBy('sourceId', 'admission').select('sourceId', 'admission').count<{ sourceId: string; admission: string; count: string; last: Date }[]>('* as count').max('receivedAt as last');
  const items = await trx('intakeItems').where({ workspaceId }).whereIn('sourceId', ids).groupBy('sourceId', 'status').select('sourceId', 'status').count<{ sourceId: string; status: string; count: string }[]>('* as count');
  for (const row of receipts) { const entry = result.get(row.sourceId)!; entry.captured += Number(row.count); if (row.admission === 'automatic') entry.approved += Number(row.count); if (!entry.lastActivityAt || row.last > entry.lastActivityAt) entry.lastActivityAt = row.last; }
  for (const row of items) { const entry = result.get(row.sourceId)!; if (row.status === 'approved') entry.approved += Number(row.count); if (row.status === 'awaiting') entry.awaitingReview += Number(row.count); }
  return result;
}
function summary(source: Source, draft: Draft | undefined, totals: { captured: number; awaitingReview: number; approved: number; lastActivityAt: Date | null }) {
  const last = source.lastActivityAt && (!totals.lastActivityAt || source.lastActivityAt > totals.lastActivityAt) ? source.lastActivityAt : totals.lastActivityAt;
  return captureSourceSummarySchema.parse({ id: source.id, workspaceId: source.workspaceId, name: source.name, type: source.type, status: source.status, block: source.block, version: source.version, approvedVersion: source.approvedVersion, draftVersion: draft?.version ?? null, scheduledAt: iso(source.scheduledAt), timezone: source.timezone, lastActivityAt: iso(last), metrics: { captured: totals.captured, awaitingReview: totals.awaitingReview, approved: totals.approved } });
}
async function sourceDetail(trx: Knex.Transaction, source: Source) {
  const draft = source.draftId ? await trx<Draft>('captureSourceDrafts').where({ workspaceId: source.workspaceId, sourceId: source.id, id: source.draftId }).first() : undefined;
  const approved = source.approvedVersion ? await trx('captureSourceVersions').where({ workspaceId: source.workspaceId, sourceId: source.id, configurationVersion: source.approvedVersion }).first() : undefined;
  const total = (await metrics(trx, source.workspaceId, [source.id])).get(source.id)!;
  return captureSourceDetailSchema.parse({ source: summary(source, draft, total), draft: draft ? { id: draft.id, version: draft.version, baseApprovedVersion: draft.baseApprovedVersion, configuration: draft.configuration } : null, approved: approved ? { version: approved.configurationVersion, definitionVersion: approved.definitionVersion, workflowVersion: approved.workflowVersion, configuration: approved.configuration } : null });
}
/** Business setup choices for an already authorized source reader; creating a source is a separate grant. */
export async function captureBusinessContextInTransaction(trx: Knex.Transaction, context: AuthorizationContext) { read(context); return business(trx, context); }
export async function captureDraftStartContext(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[]) {
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => { read(context); create(context); return captureDraftStartContextSchema.parse({ workspaceId: identity.workspaceId, permissions: permissionView(context), business: await business(trx, context), policyRevision: context.policy.revision }); });
}
/** Shared authorized projection with bounded windows for pages and the assistant. */
export async function captureSourceWindowInTransaction(trx: Knex.Transaction, context: AuthorizationContext, input: { search: string; archived: boolean; type?: 'website' | 'gmail'; status?: Source['status']; page: number; pageSize: number }) {
  if (!Number.isSafeInteger(input.pageSize) || input.pageSize < 1 || input.pageSize > 100 || !Number.isSafeInteger(input.page) || input.page < 1 || input.page > 100000) throw new CaptureDraftValidationError();
    read(context);
    const query = trx<Source>('captureSources').where({ workspaceId: context.workspaceId });
    if (input.archived) query.where({ status: 'archived' }); else query.whereNot({ status: 'archived' });
    if (input.type) query.where({ type: input.type }); if (input.status && !input.archived) query.where({ status: input.status });
    if (input.search) query.whereRaw('strpos(lower(name), lower(?)) > 0', [input.search]);
    const total = Number((await query.clone().clearSelect().count('* as count').first() as unknown as { count: string }).count);
    const page = Math.min(input.page, Math.max(1, Math.ceil(total / input.pageSize)));
    const sources = await query.clone().select('*').orderBy('updatedAt', 'desc').orderBy('id', 'desc').limit(input.pageSize).offset((page - 1) * input.pageSize);
    const drafts = await trx<Draft>('captureSourceDrafts').where({ workspaceId: context.workspaceId }).whereIn('id', sources.map(source => source.draftId).filter((id): id is string => !!id));
    const blocks = await captureCurrentBlocks(trx, context.workspaceId);
    const totals = await metrics(trx, context.workspaceId, sources.map(source => source.id));
    const timezone = (await trx('workspaces').where({ id: context.workspaceId }).first('timezone')).timezone;
    return { rows: sources.map(source => summary({ ...source, block: (blocks.get(source.id) ?? source.block) as Source['block'] }, drafts.find(draft => draft.id === source.draftId), totals.get(source.id)!)), total, page, pageSize: input.pageSize, permissions: permissionView(context), timezone, policyRevision: context.policy.revision };
}
export async function listCaptureSources(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const input = parse(captureSourceListQuerySchema, raw); inputWorkspace(input, identity);
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => captureListViewSchema.parse(await captureSourceWindowInTransaction(trx, context, input)));
}
async function captureGmailHealth(trx: Knex.Transaction, source: Source, configuration: CaptureDraftConfiguration | undefined, authority: CaptureDeliveryAuthority) {
  if (configuration?.type !== 'gmail' || !configuration.connectionId || !await trx.schema.hasTable('captureGmailWorkerReadiness')) return undefined;
  const account = await trx('captureGmailAccounts').where({ workspaceId: source.workspaceId, id: configuration.connectionId }).first('status', 'email');
  const connection = account?.status === 'connected' || account?.status === 'reconnect-required' ? account.status : 'not-connected';
  const mailbox = await trx('captureGmailMailboxState').where({ workspaceId: source.workspaceId, accountId: configuration.connectionId }).first('failure');
  const jobs = await trx('captureGmailMessageJobs').where({ workspaceId: source.workspaceId, sourceId: source.id, accountId: configuration.connectionId })
    .whereIn('state', ['pending', 'processing', 'retry', 'failed']).groupBy('state').select('state').count('* as count');
  const queued = jobs.filter(job => job.state !== 'failed').reduce((sum, job) => sum + Number(job.count), 0);
  const failed = Number(jobs.find(job => job.state === 'failed')?.count ?? 0);
  let sync = 'idle';
  if (source.status === 'active' && source.block === 'none') {
    if (mailbox?.failure === 'recovery-required') sync = 'recovery-required';
    else if (!await authority.gmailReady(trx, source.workspaceId, source.id, configuration)) sync = 'waiting-for-worker';
    else sync = mailbox?.failure ? 'retrying' : 'syncing';
  }
  return { connection, email: account?.email, sync, queued, failed };
}
export async function readCaptureSource(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown, installationOrigin?: string, authority: CaptureDeliveryAuthority = unavailableCaptureDelivery) {
  const input = parse(captureSourceDetailQuerySchema, raw); inputWorkspace(input, identity);
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    read(context); const source = await loadSource(trx, identity.workspaceId, input.sourceId);
    const detail = await sourceDetail(trx, source);
    const blocks = await captureCurrentBlocks(trx, identity.workspaceId); detail.source.block = (blocks.get(source.id) ?? source.block) as Source['block'];
    const publication = installationOrigin && source.type === 'website' && source.status !== 'draft' && await trx.schema.hasTable('captureReceiptProcessing') ? await trx('capturePublications').where({ workspaceId: identity.workspaceId, sourceId: source.id }).first('publicKey', 'configurationVersion') : null;
    const publicView = publication ? await readPublicCapture(trx, publication.publicKey) : null;
    const installation = publication && installationOrigin && publicView?.state !== 'not-found' ? captureInstallation(installationOrigin, publication, { ...source, block: detail.source.block !== 'none' ? detail.source.block : source.status === 'active' && publicView?.state !== 'ready' ? 'workspace' : 'none' }) : null;
    return captureDetailViewSchema.parse({ detail, installation, gmailHealth: await captureGmailHealth(trx, source, detail.approved?.configuration ?? detail.draft?.configuration, authority), lifecycleReview: await captureLifecycleReviewInTransaction(trx, context, source, authority), publicationReview: await capturePublicationReviewInTransaction(trx, context, source, authority), canDuplicate: permissionView(context).canCreate, canEdit: source.status !== 'archived' && authorize(context, { permission: 'leadCapture.update', resource: record(source) }).allowed, business: await business(trx, context), policyRevision: context.policy.revision });
  });
}
async function validateConfiguration(trx: Knex.Transaction, context: AuthorizationContext, configuration: CaptureDraftConfiguration, previous?: CaptureDraftConfiguration, source?: { id: string; draftId: string | null }) {
  if (configuration.type === 'gmail') {
    if (previous?.type !== 'gmail' && (await workspaceEntitlements(trx, context.workspaceId)).plan.id === 'free') throw new CaptureDraftEntitlementError();
    for (const key of ['connectionId', 'accountEmail'] as const) if (configuration[key] !== undefined && JSON.stringify(configuration[key]) !== JSON.stringify(previous?.type === 'gmail' ? previous[key] : undefined)) throw new CaptureDraftValidationError();
    const mappingChanged = (['sampleId', 'mappings'] as const).some(key => configuration[key] !== undefined && JSON.stringify(configuration[key]) !== JSON.stringify(previous?.type === 'gmail' ? previous[key] : undefined));
    if (mappingChanged && (!source?.draftId || !await captureSetupSampleApproved(trx, context.workspaceId, source.id, source.draftId, configuration))) throw new CaptureDraftValidationError();
  }
  if (configuration.workflow?.assignment.kind === 'teammate' && !await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where({ 'm.workspaceId': context.workspaceId, 'm.userId': configuration.workflow.assignment.teammateId }).whereNull('u.deletionRequestedAt').whereNull('u.suspendedAt').first('u.id')) throw new CaptureDraftValidationError();
}
async function replay(trx: Knex.Transaction, identity: WorkspaceIdentity, requestId: string, operation: string, fingerprint: string) {
  const existing = await trx('captureOperations').where({ workspaceId: identity.workspaceId, operation, requestId }).first();
  if (!existing) return null;
  if (existing.inputHash !== fingerprint || existing.actor.kind !== 'user' || existing.actor.userId !== identity.userId) throw new CaptureDraftConflictError();
  const saved = captureOperationResultSchema.parse(existing.result);
  if (saved.kind !== 'draft') throw new CaptureDraftConflictError();
  const result = captureDraftSavedSchema.parse({ ok: true, sourceId: saved.sourceId, sourceVersion: saved.sourceVersion, draftVersion: saved.draftVersion });
  const source = await loadSource(trx, identity.workspaceId, result.sourceId);
  return { result, source };
}
async function receipt(trx: Knex.Transaction, identity: WorkspaceIdentity, requestId: string, operation: string, inputHash: string, source: Source, draftVersion: number) {
  const result = captureDraftSavedSchema.parse({ ok: true, sourceId: source.id, sourceVersion: source.version, draftVersion });
  await trx('captureOperations').insert({ id: randomUUID(), workspaceId: identity.workspaceId, requestId, operation, inputHash, actor: JSON.stringify({ kind: 'user', userId: identity.userId }), target: JSON.stringify({ sourceId: source.id }), result: JSON.stringify({ kind: 'draft', sourceId: result.sourceId, sourceVersion: result.sourceVersion, draftVersion: result.draftVersion }) });
  await trx('captureSourceEvents').insert({ id: randomUUID(), workspaceId: identity.workspaceId, sourceId: source.id, kind: 'draft.saved', actor: JSON.stringify({ kind: 'user', userId: identity.userId }), data: JSON.stringify({ sourceVersion: source.version }) });
  return result;
}
export async function createCaptureDraft(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const input = parse(captureCreateDraftSchema, raw); inputWorkspace(input, identity); const fingerprint = captureDraftFingerprint(input);
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    read(context); create(context);
    const repeated = await replay(trx, identity, input.requestId, 'draft.create', fingerprint); if (repeated) return repeated.result;
    await validateConfiguration(trx, context, input.configuration);
    const id = randomUUID(), draftId = randomUUID();
    const [source] = await trx<Source>('captureSources').insert({ id, workspaceId: identity.workspaceId, name: input.name, type: input.configuration.type, version: 1, status: 'draft', draftId, createdBy: identity.userId }).returning('*');
    await trx('captureSourceDrafts').insert({ id: draftId, workspaceId: identity.workspaceId, sourceId: id, sourceType: input.configuration.type, version: 1, configuration: JSON.stringify(input.configuration) });
    return receipt(trx, identity, input.requestId, 'draft.create', fingerprint, source, 1);
  });
}
export async function saveCaptureDraft(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const input = parse(captureSaveDraftSchema, raw); inputWorkspace(input, identity); const fingerprint = captureDraftFingerprint(input);
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    read(context); const source = await loadSource(trx, identity.workspaceId, input.sourceId); update(context, source);
    const repeated = await replay(trx, identity, input.requestId, 'draft.save', fingerprint); if (repeated) return repeated.result;
    const draft = source.draftId ? await trx<Draft>('captureSourceDrafts').where({ workspaceId: identity.workspaceId, sourceId: source.id, id: source.draftId }).forUpdate().first() : undefined;
    if (source.status === 'archived' || !draft || source.version !== input.expectedVersion || draft.version !== input.expectedDraftVersion || draft.baseApprovedVersion !== source.approvedVersion || source.approvedVersion !== null && source.type !== input.configuration.type) throw new CaptureDraftConflictError();
    await validateConfiguration(trx, context, input.configuration, draft.configuration, source);
    await bindSavedGmailSample(trx, identity.workspaceId, source.id, draft.id, draft.version, input.configuration);
    await trx('captureSourceDrafts').where({ workspaceId: identity.workspaceId, id: draft.id }).update({ configuration: JSON.stringify(input.configuration), sourceType: input.configuration.type, version: draft.version + 1, updatedAt: trx.fn.now() });
    const [updated] = await trx<Source>('captureSources').where({ workspaceId: identity.workspaceId, id: source.id }).update({ name: input.name, type: input.configuration.type, version: source.version + 1, updatedAt: trx.fn.now() }).returning('*');
    return receipt(trx, identity, input.requestId, 'draft.save', fingerprint, updated, draft.version + 1);
  });
}
export async function beginCaptureRevision(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const input = parse(captureBeginRevisionSchema, raw); inputWorkspace(input, identity); const fingerprint = captureDraftFingerprint({ kind: 'revision', ...input });
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    read(context); const source = await loadSource(trx, identity.workspaceId, input.sourceId); update(context, source);
    const repeated = await replay(trx, identity, input.requestId, 'draft.create', fingerprint); if (repeated) return repeated.result;
    if (await trx('capturePublicationTransitions').where({ workspaceId: identity.workspaceId, sourceId: source.id, state: 'pending' }).first('id')) throw new CaptureDraftConflictError();
    if (source.status === 'archived' || source.version !== input.expectedVersion || !source.approvedVersion || source.draftId) throw new CaptureDraftConflictError();
    const approved = await trx('captureSourceVersions').where({ workspaceId: identity.workspaceId, sourceId: source.id, configurationVersion: source.approvedVersion }).first('configuration');
    if (!approved) throw new CaptureDraftConflictError();
    const retained = await trx<Draft>('captureSourceDrafts').where({ workspaceId: identity.workspaceId, sourceId: source.id }).forUpdate().first();
    const draftId = retained?.id ?? randomUUID(), version = Math.max(source.approvedVersion, retained?.version ?? 0) + 1;
    if (retained) await trx('captureSourceDrafts').where({ workspaceId: identity.workspaceId, id: draftId }).update({ version, baseApprovedVersion: source.approvedVersion, configuration: JSON.stringify(approved.configuration), updatedAt: trx.fn.now() });
    else await trx('captureSourceDrafts').insert({ id: draftId, workspaceId: identity.workspaceId, sourceId: source.id, sourceType: source.type, version, baseApprovedVersion: source.approvedVersion, configuration: JSON.stringify(approved.configuration) });
    const [updated] = await trx<Source>('captureSources').where({ workspaceId: identity.workspaceId, id: source.id }).update({ draftId, version: source.version + 1, updatedAt: trx.fn.now() }).returning('*');
    return receipt(trx, identity, input.requestId, 'draft.create', fingerprint, updated, version);
  });
}
