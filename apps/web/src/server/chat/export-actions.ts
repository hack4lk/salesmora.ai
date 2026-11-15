import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import type { Knex } from '@salesmora/data';
import { AuthorizationAccessError, createLeadCSVExport, leadChatTurnEvidenceAllowed, previewLeadExportInTransaction, leadProposalStorage } from '@salesmora/data';
import { chatPageContextSchema, leadExportSchema, leadExportDraftPayloadSchema, leadExportDraftReviewSchema, type AuthorizationContext, type LeadExportDraftInput, type LeadExportDraftPayload } from '@salesmora/contracts';
import { authorizeLeadOperation } from '@salesmora/agent';
import { authorizedWorkspace, enabledPermissions } from '../authorization/permissions';
import { database } from '../workspaces/store';
import { chatAccessHash } from './access-hash';
import { ChatActionConflict } from './action-errors';
import { validateTurnEvidenceInTransaction, type ChatIdentity } from './store';
import { chatExportData as copy } from './export-actions.data';
const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
interface ExportRow extends ChatIdentity {
  id: string; turnId: string; threadId: string; inputHash: string; accessHash: string;
  state: 'pending' | 'confirmed' | 'cancelled' | 'superseded'; expiresAt: Date | string; exportPayload: LeadExportDraftPayload;
}
function review(row: ExportRow) {
  const payload = leadExportDraftPayloadSchema.parse(row.exportPayload);
  return leadExportDraftReviewSchema.parse({ actionType: 'lead.export', id: row.id, inputHash: row.inputHash,
    expiresAt: new Date(row.expiresAt).toISOString(), state: row.state === 'pending' && new Date(row.expiresAt).getTime() <= Date.now() ? 'expired' : row.state,
    ...payload.preview, filterLabels: payload.filterLabels, includeArchived: payload.filters.archived });
}
async function currentTurn(trx: Knex.Transaction, context: AuthorizationContext, row: ExportRow) {
  const turn = await trx('chatTurns').where({ workspaceId: context.workspaceId, userId: context.userId, id: row.turnId }).first();
  if (!turn || !authorizeLeadOperation(context, turn.surfaceKey, 'export_csv').allowed || row.accessHash !== chatAccessHash(context) ||
    !await leadChatTurnEvidenceAllowed(trx, context, turn)) throw new AuthorizationAccessError();
  return turn;
}
async function labels(trx: Knex.Transaction, context: AuthorizationContext, filters: LeadExportDraftPayload['filters']) {
  const result: string[] = [];
  if (filters.query) result.push(copy.query(filters.query));
  if (filters.stages.length) result.push(copy.stages(filters.stages.map(value => copy.stagesMap[value]).join(', ')));
  if (filters.sources.length) result.push(copy.sources(filters.sources.map(value => copy.sourcesMap[value]).join(', ')));
  for (const id of filters.ownerIds) {
    if (id === 'me' || id === context.userId) result.push(copy.owner(copy.me));
    else if (id === 'unassigned') result.push(copy.owner(copy.unassigned));
    else {
      const user = await trx('workspaceMemberships').join('users', 'users.id', 'workspaceMemberships.userId')
        .where({ 'workspaceMemberships.workspaceId': context.workspaceId, 'workspaceMemberships.userId': id }).first('users.name');
      // Never echo a foreign/former identity or broaden an unresolved owner filter.
      if (!user) throw new AuthorizationAccessError();
      result.push(copy.owner(String(user.name).slice(0, 200)));
    }
  }
  if (filters.created === 'custom') result.push(copy.created(`${filters.from} – ${filters.to}`));
  else if (filters.created !== 'any') result.push(copy.created(copy.dates[filters.created]));
  if (filters.attention) result.push(copy.attention);
  return result;
}
export async function proposeExportDraft(identity: ChatIdentity, turnId: string, input: LeadExportDraftInput, signal: AbortSignal, db?: Knex) {
  return authorizedWorkspace(identity.userId, identity.workspaceId, true, async (trx, context) => {
    signal.throwIfAborted();
    const turn = await validateTurnEvidenceInTransaction(trx, context, turnId);
    if (!authorizeLeadOperation(context, turn.surfaceKey, 'export_csv').allowed || turn.accessHash !== chatAccessHash(context)) throw new AuthorizationAccessError();
    if (!['accepted', 'running'].includes(turn.state) || new Date(turn.leaseUntil).getTime() <= Date.now()) throw new ChatActionConflict();
    const page = chatPageContextSchema.parse(turn.pageContext);
    if (input.mode === 'current_filters' && (turn.surfaceKey !== 'leads.list' || !page.uiState)) return { type: 'lead-export-filters-required', saved: false };
    const filters = leadExportSchema.parse({ workspaceId: identity.workspaceId, filters: input.mode === 'current_filters' ? page.uiState!.filters : input.filters }).filters;
    if (filters.query.length === 1) return { type: 'lead-export-filters-required', saved: false };
    const preview = await previewLeadExportInTransaction(trx, context, { workspaceId: identity.workspaceId, filters });
    const payload = leadExportDraftPayloadSchema.parse({ filters, preview, filterLabels: await labels(trx, context, filters) });
    const prior = await leadProposalStorage.read(trx, context, { turnId });
    if (prior) { if (prior.actionType !== 'lead.export' || prior.inputHash !== hash(payload)) throw new ChatActionConflict(); return { action: review(prior) }; }
    await leadProposalStorage.supersede(trx, context, turn.threadId);
    const row = await leadProposalStorage.insert(trx, context, { id: randomUUID(), turnId, threadId: turn.threadId, capability: 'leads.export', actionType: 'lead.export',
      lead: {}, exportPayload: payload, inputHash: hash(payload), accessHash: chatAccessHash(context), expiresAt: new Date(Date.now() + 900000) });
    signal.throwIfAborted(); return { action: review(row) };
  }, db);
}
export async function visibleExportDraft(trx: Knex.Transaction, context: AuthorizationContext, row: ExportRow) {
  try { await currentTurn(trx, context, row); return review(row); }
  catch (error) { if (error instanceof AuthorizationAccessError) return undefined; throw error; }
}
async function decisionReady(trx: Knex.Transaction, context: AuthorizationContext, row: ExportRow, inputHash: string, download: boolean) {
  const turn = await currentTurn(trx, context, row);
  if (row.inputHash !== inputHash || hash(leadExportDraftPayloadSchema.parse(row.exportPayload)) !== inputHash) throw new ChatActionConflict();
  if (row.state === 'cancelled' && !download) return;
  if (!['pending', ...(download ? ['confirmed'] : [])].includes(row.state) || new Date(row.expiresAt).getTime() <= Date.now() || turn.state !== 'completed') throw new ChatActionConflict();
  if (await trx('chatTurns').where({ workspaceId: row.workspaceId, userId: row.userId, threadId: row.threadId }).whereIn('state', ['accepted', 'running']).first()) throw new ChatActionConflict();
  // Owner labels must still describe the reviewed membership filter.
  if (JSON.stringify(await labels(trx, context, row.exportPayload.filters)) !== JSON.stringify(row.exportPayload.filterLabels)) throw new ChatActionConflict();
}
export async function resolveExportDraft(trx: Knex.Transaction, context: AuthorizationContext, row: ExportRow, inputHash: string, decision: 'confirm' | 'cancel') {
  // Confirming a sensitive download requires the dedicated fetch endpoint, never chat text or JSON-only approval.
  if (decision !== 'cancel') throw new ChatActionConflict();
  await decisionReady(trx, context, row, inputHash, false);
  if (row.state !== 'cancelled') {
    await leadProposalStorage.save(trx, context, row, 'cancelled');
  }
  return review({ ...row, state: 'cancelled' });
}
/** Filter payload never comes from the browser. Both export transactions reauthorize the sealed proposal. */
export async function downloadExportDraft(identity: ChatIdentity, draftId: string, inputHash: string, signal: AbortSignal) {
  const payload = await authorizedWorkspace(identity.userId, identity.workspaceId, false, async (trx, context) => {
    const row = await leadProposalStorage.read(trx, context, { id: draftId });
    if (row?.actionType !== 'lead.export') throw new AuthorizationAccessError();
    await decisionReady(trx, context, row, inputHash, true);
    return leadExportDraftPayloadSchema.parse(row.exportPayload);
  });
  const load = async (trx: Knex.Transaction, context: AuthorizationContext) => {
    const row = await leadProposalStorage.read(trx, context, { id: draftId }, true);
    if (row?.actionType !== 'lead.export') throw new AuthorizationAccessError();
    await decisionReady(trx, context, row, inputHash, true);
    if (hash(leadExportDraftPayloadSchema.parse(row.exportPayload)) !== hash(payload)) throw new ChatActionConflict();
    return row;
  };
  return createLeadCSVExport(database(), identity, enabledPermissions, { workspaceId: identity.workspaceId, filters: payload.filters }, signal, {
    beforeRead: async (trx, context) => { await load(trx, context); },
    onSnapshot: async (trx, context, preview) => {
      const row = await load(trx, context);
      if (preview.count !== payload.preview.count || preview.scope !== payload.preview.scope || preview.rowLimit !== payload.preview.rowLimit) throw new ChatActionConflict();
      if (row.state === 'pending') {
        await leadProposalStorage.save(trx, context, row, 'confirmed');
      }
    },
  });
}
