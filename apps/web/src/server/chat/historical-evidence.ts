import 'server-only';
import type { AuthorizationContext } from '@salesmora/contracts';
import {
  calendarChatSnapshotSchema, calendarProposalStoredSchema, captureChatSnapshotSchema,
  captureSetupViewSchema, captureSourceProposalViewSchema, chatLeadEvidenceSchema,
  chatPageContextSchema,
  customerChatResultSchema, estimateChatSnapshotSchema, helpSourceSchema, leadSearchSnapshotSchema,
  leadSearchEvidenceSchema, estimateDecisionEvidenceSchema, estimateDraftChatStoredSchema, estimateShareChatStoredSchema,
  reportAssistantEvidenceSchema, reportAssistantReadSnapshotSchema,
  workOrderQuerySchema,
  estimateArchiveChatStoredSchema, estimateConversionChatStoredSchema, estimateDecisionChatStoredSchema,
  estimateDraftActionChatStoredSchema, estimateDraftDeleteChatStoredSchema, estimateVoidChatStoredSchema,
  workOrderChatResultSchema, customerProposalStoredSchema, workOrderProposalStoredSchema, materialProposalStoredSchema,
  type ChatProposalFamily,
} from '@salesmora/contracts';
import {
  assistantCapturedRecordsAllowed, calendarChatEvidenceAllowed, captureChatEvidenceAllowed,
  captureDraftFingerprint, chatSearchSnapshotAllowed, customerChatEvidenceAllowed,
  estimateChatEvidenceAllowed, readHelpArticle,
  AuthorizationAccessError, readWorkOrders,
  reportAssistantEvidenceAllowed, reportAssistantSnapshotMatches,
  visibleEstimateChatDraftDelete,
  readProposalEvidence, type AssistantCapturedRecords, type Knex,
} from '@salesmora/data';
import { authorize, resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { chatAccessHash } from './access-hash';
import { readHistoryProposalPresence } from './history-proposals';

export interface HistoricalEvidenceTurn {
  id: string;
  threadId: string;
  state?: unknown;
  accessHash?: unknown;
  sources?: unknown;
  leadEvidence?: unknown;
  leadSearchEvidence?: unknown;
  leadSearchSnapshot?: unknown;
  customerStamp?: unknown;
  customerResult?: unknown;
  workOrderResult?: unknown;
  estimateStamp?: unknown;
  estimateResult?: unknown;
  calendarStamp?: unknown;
  calendarResult?: unknown;
  captureStamp?: unknown;
  captureResult?: unknown;
  reportSnapshot?: unknown;
  reportEvidence?: unknown;
  captureSetupEvidence?: unknown;
  captureSourceEvidence?: unknown;
  calendarProposalEvidence?: unknown;
  estimateDecisionEvidence?: unknown;
  estimateDraftActionEvidence?: unknown;
  estimateVoidEvidence?: unknown;
  estimateArchiveEvidence?: unknown;
  estimateDraftDeleteEvidence?: unknown;
  estimateConversionEvidence?: unknown;
  pageContext?: unknown;
  surfaceKey?: unknown;
  historyEvidence?: unknown;
  workOrderReadEvidence?: unknown;
  proposalFamilies?: unknown;
}

const referencesSchema = estimateDecisionEvidenceSchema.refine(ids => new Set(ids).size === ids.length);
const estimateFamilies = [
  ['estimateDecisionEvidence', 'chatEstimateDecisions', estimateDecisionChatStoredSchema],
  ['estimateDraftActionEvidence', 'chatEstimateDraftActions', estimateDraftActionChatStoredSchema],
  ['estimateVoidEvidence', 'chatEstimateVoids', estimateVoidChatStoredSchema],
  ['estimateArchiveEvidence', 'chatEstimateArchives', estimateArchiveChatStoredSchema],
  ['estimateDraftDeleteEvidence', 'chatEstimateDraftDeletes', estimateDraftDeleteChatStoredSchema],
  ['estimateConversionEvidence', 'chatEstimateConversions', estimateConversionChatStoredSchema],
] as const;
type RecordKind = keyof AssistantCapturedRecords;
type RecordSets = Record<RecordKind, Set<string>>;
function recordSets(): RecordSets {
  return { lead: new Set(), job: new Set(), customer: new Set(), estimate: new Set(),
    work_order: new Set(), capture_source: new Set(), calendar_visit: new Set() };
}
function object(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : undefined;
}
function add(records: RecordSets, kind: RecordKind, id: unknown) {
  if (typeof id === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id)) records[kind].add(id);
}

/** Source fields are interpreted only after their canonical persisted schema has parsed. */
function collectExplicitRecords(records: RecordSets, value: unknown) {
  if (Array.isArray(value)) { value.forEach(item => collectExplicitRecords(records, item)); return; }
  const row = object(value);
  if (!row) return;
  for (const [field, kind] of [
    ['leadId', 'lead'], ['jobId', 'job'], ['customerId', 'customer'], ['estimateId', 'estimate'],
    ['workOrderId', 'work_order'], ['sourceId', 'capture_source'], ['visitId', 'calendar_visit'],
  ] as const) add(records, kind, row[field]);
  if (row.type === 'lead' || row.type === 'job' || row.type === 'work_order') add(records, row.type, row.id);
  if (row.parentType === 'lead' || row.parentType === 'job') add(records, row.parentType, row.parentId);
  if (row.domain === 'lead' || row.domain === 'job' || row.domain === 'customer' || row.domain === 'estimate') {
    add(records, row.domain, row.recordId);
  } else if (row.domain === 'work-order') add(records, 'work_order', row.recordId);
  if (typeof row.estimateNumber === 'string' || typeof row.number === 'string' && row.number.startsWith('EST-')) {
    add(records, 'estimate', row.recordId ?? row.id);
  }
  for (const [key, child] of Object.entries(row)) {
    if (['estimate', 'source'].includes(key) && object(child)) {
      const source = object(child)!;
      if (key === 'estimate') add(records, 'estimate', source.id);
      else if ('approvedVersion' in source && 'workspaceId' in source) add(records, 'capture_source', source.id);
    }
    collectExplicitRecords(records, child);
  }
}

function collectReportRecords(records: RecordSets, raw: unknown) {
  const parsed = reportAssistantReadSnapshotSchema.safeParse(raw);
  if (!parsed.success || !reportAssistantSnapshotMatches(parsed.data)) return false;
  const { native } = parsed.data;
  collectExplicitRecords(records, native);
  switch (native.area) {
    case 'leads': native.read.report.rows.forEach(row => add(records, 'lead', row.recordId)); break;
    case 'jobs': native.read.report.rows.forEach(row => add(records, 'job', row.recordId)); break;
    case 'team': native.read.report.rows.forEach(row =>
      add(records, native.read.report.view === 'team-leads' ? 'lead' : 'job', row.recordId)); break;
    case 'sources': {
      const evidence = native.read.report.evidence;
      evidence.rows.forEach(row => add(records, evidence.kind === 'accepted-estimates' ? 'estimate' : 'lead', row.recordId));
      if (evidence.kind === 'accepted-estimates') evidence.rows.forEach(row => add(records, 'lead', row.linkedLead?.recordId));
      break;
    }
    case 'calendar': {
      const report = native.read.report;
      const visits = 'visits' in report ? report.visits
        : report.evidence.kind === 'visits' ? report.evidence.rows : [];
      visits.forEach(visit => add(records, 'calendar_visit', visit.id));
      break;
    }
    case 'estimates': native.read.report.rows.forEach(row => add(records, 'estimate', row.recordId)); break;
    case 'overview':
    case 'activity':
    case 'financial': break;
  }
  return true;
}

function estimatePayloadMatches(table: string, value: unknown, id: string) {
  const payload = object(value)!;
  const view = object(payload.view), draft = object(view?.draft);
  if (draft) {
    const binding = {
      actionType: draft.actionType, parent: draft.parent, proposed: draft.proposed,
      ...(draft.actionType === 'estimate.update' ? { estimate: draft.estimate, current: draft.current } : {}),
      authorizationVersion: draft.authorizationVersion, createdAt: draft.createdAt, expiresAt: draft.expiresAt,
      values: payload.values, stamp: payload.stamp, catalogStamp: payload.catalogStamp,
    };
    return draft.id === id && draft.inputHash === captureDraftFingerprint(binding);
  }
  const ticket = object(payload.ticket);
  if (!ticket || ticket.id !== id) return false;
  const binding = {
    ticket: Object.fromEntries(Object.entries(ticket).filter(([key]) => !['state', 'inputHash'].includes(key))),
    review: payload.review,
    ...(table === 'chatEstimateDecisions' ? { value: payload.value } : {}),
    ...(table === 'chatEstimateVoids' ? { canConfirm: payload.canConfirm } : {}),
    stamp: payload.stamp,
  };
  return ticket.inputHash === captureDraftFingerprint(binding) &&
    (ticket.reviewHash === undefined || ticket.reviewHash === captureDraftFingerprint(payload.review));
}

/** Later requests authorize immutable, owned sources, not equality with today's CRM values. */
export async function historicalEvidenceAllowed(
  trx: Knex.Transaction,
  authority: AuthorizationContext,
  turn: HistoricalEvidenceTurn,
  proposalPresence?: Awaited<ReturnType<typeof readHistoryProposalPresence>>,
): Promise<boolean> {
  try {
    return await validateHistoricalEvidence(trx, authority, turn, proposalPresence);
  } catch (error) {
    if (error instanceof AuthorizationAccessError) return false;
    throw error;
  }
}

async function validateHistoricalEvidence(
  trx: Knex.Transaction, authority: AuthorizationContext, turn: HistoricalEvidenceTurn,
  proposalPresence?: Awaited<ReturnType<typeof readHistoryProposalPresence>>,
): Promise<boolean> {
  if (!authorize(authority, { permission: 'assistant.use' }).allowed) return false;
  const owned = { workspaceId: authority.workspaceId, userId: authority.userId, threadId: turn.threadId };
  const complete = 'leadEvidence' in turn && 'sources' in turn && 'accessHash' in turn &&
    (!turn.customerStamp || 'customerResult' in turn) && (!turn.estimateStamp || 'estimateResult' in turn) &&
    (!turn.calendarStamp || 'calendarResult' in turn) && (!turn.captureStamp || 'captureResult' in turn);
  const saved = complete
    ? turn : await trx('chatTurns').where({ ...owned, id: turn.id }).first();
  if (!saved) return false;
  const root: HistoricalEvidenceTurn = { ...saved, ...turn };
  const pending = [root], visited = new Map<string, HistoricalEvidenceTurn>();
  const reports = new Map<string, unknown>();
  const records = recordSets();
  const searchTargets = new Set<string>();
  const proposalIds = new Map<string, Set<string>>();
  const familyRefs = new Map<string, Set<string>>();
  const proposalTurns = new Map<string, Set<string>>();
  const needProposal = (table: string, ids: string[]) => {
    const found = proposalIds.get(table) ?? new Set<string>();
    ids.forEach(id => found.add(id)); proposalIds.set(table, found);
  };
  while (pending.length) {
    if (visited.size + pending.length > 50) return false;
    const nextIds = new Set<string>(), reportIds = new Set<string>();
    for (const source of pending.splice(0)) {
      if (visited.has(source.id)) continue;
      visited.set(source.id, source);
      if (source.accessHash !== chatAccessHash(authority)) return false;
      const history = referencesSchema.safeParse(source.historyEvidence ?? []);
      if (!history.success) return false;
      history.data.forEach(id => { if (!visited.has(id)) nextIds.add(id); });
      if (source.workOrderReadEvidence) {
        const evidence = object(source.workOrderReadEvidence);
        if (!evidence || !Array.isArray(evidence.ids) || evidence.ids.length > 400 ||
          evidence.ids.some(id => typeof id !== 'string' ||
            !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id))) return false;
        const scope = resolveAuthorizedCollectionScope(authority, 'workorders.read');
        if (!scope.allowed) return false;
        evidence.ids.forEach(id => add(records, 'work_order', id));
        if (evidence.counts && scope.scope !== 'workspace') {
          const current = await readWorkOrders(trx, authority, authority.enabledPermissions,
            workOrderQuerySchema.parse({ workspaceId: authority.workspaceId, pageSize: 1 }));
          const counts = object(evidence.counts);
          if (!counts || ['inProgress', 'overdue', 'awaitingSignoff'].some(key =>
            counts[key] !== current.metrics[key as keyof typeof current.metrics])) return false;
        }
      }
      const leadEvidence = chatLeadEvidenceSchema.safeParse(source.leadEvidence ?? []);
      if (!leadEvidence.success) return false;
      leadEvidence.data.forEach(row => add(records, 'lead', row.id));
      const searchRefs = leadSearchEvidenceSchema.safeParse(source.leadSearchEvidence ?? []);
      if (!searchRefs.success) return false;
      searchRefs.data.forEach(id => { searchTargets.add(id); if (!visited.has(id)) nextIds.add(id); });
      if (source.leadSearchSnapshot) {
        const snapshot = leadSearchSnapshotSchema.safeParse(source.leadSearchSnapshot);
        if (!snapshot.success || !await chatSearchSnapshotAllowed(trx, authority, snapshot.data)) return false;
        snapshot.data.result.rows.forEach(row => add(records, 'lead', row.id));
      } else if (searchRefs.data.includes(source.id)) return false;
      const evidence = reportAssistantEvidenceSchema.safeParse(source.reportEvidence ?? []);
      if (!evidence.success || !await reportAssistantEvidenceAllowed(trx, authority, evidence.data)) return false;
      if (source.reportSnapshot) {
        const snapshot = reportAssistantReadSnapshotSchema.safeParse(source.reportSnapshot);
        if (!snapshot.success || !collectReportRecords(records, snapshot.data) ||
          !evidence.data.some(binding => captureDraftFingerprint(binding) === captureDraftFingerprint(snapshot.data.binding))) return false;
        reports.set(snapshot.data.binding.id, snapshot.data);
      }
      evidence.data.forEach(binding => { if (!reports.has(binding.id)) reportIds.add(binding.id); });
      const help = helpSourceSchema.array().max(3).safeParse(source.sources ?? []);
      if (!help.success) return false;
      for (const item of help.data) {
        const article = await readHelpArticle(trx, authority, item.slug, item.version);
        if (!article?.sections.some(section => section.anchor === item.anchor)) return false;
      }
      for (const [field, table] of estimateFamilies) {
        const refs = referencesSchema.safeParse(source[field] ?? []);
        if (!refs.success) return false;
        if (refs.data.length) {
          const found = familyRefs.get(table) ?? new Set<string>();
          refs.data.forEach(id => { found.add(id); if (!visited.has(id)) nextIds.add(id); });
          familyRefs.set(table, found);
        }
      }
      for (const [field, table] of [
        ['captureSetupEvidence', 'chatCaptureSetupProposals'],
        ['captureSourceEvidence', 'chatCaptureSourceProposals'],
        ['calendarProposalEvidence', 'chatCalendarProposals'],
      ] as const) {
        const refs = referencesSchema.safeParse(source[field] ?? []);
        if (!refs.success) return false;
        if (refs.data.length) needProposal(table, refs.data);
      }
      if (source.estimateStamp) {
        if (typeof source.estimateStamp !== 'string' ||
          !await estimateChatEvidenceAllowed(trx, authority, source.estimateStamp)) return false;
        if (source.estimateResult) {
          const snapshot = estimateChatSnapshotSchema.safeParse(source.estimateResult);
          if (!snapshot.success || snapshot.data.result.turnId !== source.id ||
            snapshot.data.lists.some(list => list.query.workspaceId !== authority.workspaceId)) return false;
          if (snapshot.data.result.summaries.some(summary => summary.scope === 'assigned' &&
            summary.totalMatches !== summary.rows.length)) return false;
          collectExplicitRecords(records, snapshot.data.result);
        }
      } else if (source.estimateResult) return false;
      if (source.calendarStamp) {
        if (typeof source.calendarStamp !== 'string' ||
          !await calendarChatEvidenceAllowed(trx, authority, source.calendarStamp)) return false;
        if (source.calendarResult) {
          const snapshot = calendarChatSnapshotSchema.safeParse(source.calendarResult);
          if (!snapshot.success || snapshot.data.query.workspaceId !== authority.workspaceId) return false;
          const result = snapshot.data.result;
          if (result.scope === 'own' && (result.mode === 'availability' || result.total !== result.visits.length)) return false;
          if (result.mode !== 'availability') {
            result.visits.forEach(visit => add(records, 'calendar_visit', visit.id));
            collectExplicitRecords(records, result.visits);
          }
        }
      } else if (source.calendarResult) return false;
      if (source.captureStamp) {
        if (typeof source.captureStamp !== 'string' ||
          !await captureChatEvidenceAllowed(trx, authority, source.captureStamp)) return false;
        if (source.captureResult) {
          const snapshot = captureChatSnapshotSchema.safeParse(source.captureResult);
          if (!snapshot.success || snapshot.data.result.workspaceId !== authority.workspaceId ||
            snapshot.data.snapshotHash !== captureDraftFingerprint(snapshot.data.result)) return false;
          const result = snapshot.data.result;
          const sources = result.operation === 'sources' ? result.rows
            : [result.operation === 'source_details' ? result.detail.source : result.source];
          sources.forEach(item => add(records, 'capture_source', item.id));
        }
      } else if (source.captureResult) return false;
      if (source.customerStamp) {
        if (typeof source.customerStamp !== 'string' ||
          !await customerChatEvidenceAllowed(trx, authority, source.customerStamp)) return false;
        if (!source.customerResult) {
          const page = chatPageContextSchema.safeParse(source.pageContext);
          const ref = page.success && source.surfaceKey === 'customer.detail'
            ? page.data.recordRefs?.find(item => item.type === 'customer') : undefined;
          if (!ref) return false;
          add(records, 'customer', ref.id);
          continue;
        }
        const result = customerChatResultSchema.safeParse(source.customerResult);
        if (!result.success || result.data.turnId && result.data.turnId !== source.id) return false;
        const scope = resolveAuthorizedCollectionScope(authority, 'customers.read');
        const full = scope.allowed && scope.scope === 'workspace';
        if (!full && result.data.title !== 'Related customer contact') return false;
        let capturedCustomer = false;
        result.data.records.forEach(row => {
          if (/^LD-/.test(row.number)) add(records, 'lead', row.id);
          else if (/^CU-/.test(row.number)) { add(records, 'customer', row.id); capturedCustomer = true; }
        });
        if (result.data.draft?.customer.id) {
          add(records, 'customer', result.data.draft.customer.id); capturedCustomer = true;
        }
        if (['details', 'history', 'linked_leads', 'lead_candidates'].includes(result.data.kind) && !capturedCustomer) {
          const number = result.data.title.match(/^CU-(\d+)\b/)?.[1];
          if (!full || !number || !Number.isSafeInteger(Number(number))) return false;
          const customer = await trx('customers').where({ workspaceId: authority.workspaceId, customerNumber: Number(number) }).first('id');
          if (!customer) return false;
          add(records, 'customer', customer.id);
        }
      } else if (source.customerResult) return false;
    }
    if (!nextIds.size && !reportIds.size) break;
    const sources: HistoricalEvidenceTurn[] = await trx('chatTurns').where(owned).where('state', 'completed')
      .andWhere(query => {
        if (nextIds.size) query.whereIn('id', [...nextIds]);
        if (reportIds.size) query.orWhereRaw(`"reportSnapshot"->'binding'->>'id' = ANY(?::text[])`, [[...reportIds]]);
      }).select('*');
    if ([...nextIds].some(id => !sources.some(source => source.id === id))) return false;
    for (const id of reportIds) {
      const source = sources.find(item => object(object(item.reportSnapshot)?.binding)?.id === id);
      if (!source) return false;
    }
    pending.push(...sources.filter(source => !visited.has(source.id)));
    if (!pending.length && reportIds.size) return false;
  }
  if ([...searchTargets].some(id => !visited.get(id)?.leadSearchSnapshot)) return false;
  for (const source of visited.values()) {
    const bindings = reportAssistantEvidenceSchema.parse(source.reportEvidence ?? []);
    if (bindings.some(binding => {
      const snapshot = reportAssistantReadSnapshotSchema.safeParse(reports.get(binding.id));
      return !snapshot.success || captureDraftFingerprint(snapshot.data.binding) !== captureDraftFingerprint(binding);
    })) return false;
  }
  const missingProvenance = [...visited.values()].filter(source =>
    source.estimateStamp && !source.estimateResult || source.calendarStamp && !source.calendarResult ||
    source.captureStamp && !source.captureResult);
  const discovery = missingProvenance.filter(source => {
    const page = chatPageContextSchema.safeParse(source.pageContext);
    if (source.estimateStamp && !source.estimateResult &&
      !estimateFamilies.some(([field]) => Array.isArray(source[field]) && source[field].length)) return true;
    if (source.calendarStamp && !source.calendarResult && !Array.isArray(source.calendarProposalEvidence) &&
      !(page.success && page.data.calendarVisit)) return true;
    return !!source.captureStamp && !source.captureResult &&
      !Array.isArray(source.captureSetupEvidence) && !Array.isArray(source.captureSourceEvidence) &&
      !(page.success && page.data.captureContext && 'sourceId' in page.data.captureContext);
  });
  const uncovered = discovery.filter(source => !proposalPresence?.covers(source.id));
  const inheritedProposals = uncovered.length
    ? await readHistoryProposalPresence(trx, authority, uncovered.map(source => source.id),
      new Map(uncovered.map(source => [source.id, source.proposalFamilies])), authority)
    : undefined;
  const hasProposal = (id: string, kind: Parameters<NonNullable<typeof proposalPresence>>[1]) =>
    proposalPresence?.(id, kind) || inheritedProposals?.(id, kind) || false;
  const directFamilies = [
    ['estimateDraft', 'chatEstimateDrafts', estimateDraftChatStoredSchema],
    ['estimateSharing', 'chatEstimateShares', estimateShareChatStoredSchema],
    ['estimateDecision', 'chatEstimateDecisions', estimateDecisionChatStoredSchema],
    ['estimateDraftAction', 'chatEstimateDraftActions', estimateDraftActionChatStoredSchema],
    ['estimateVoid', 'chatEstimateVoids', estimateVoidChatStoredSchema],
    ['estimateArchive', 'chatEstimateArchives', estimateArchiveChatStoredSchema],
    ['estimateDraftDelete', 'chatEstimateDraftDeletes', estimateDraftDeleteChatStoredSchema],
    ['estimateConversion', 'chatEstimateConversions', estimateConversionChatStoredSchema],
  ] as const;
  for (const source of missingProvenance) {
    const page = chatPageContextSchema.safeParse(source.pageContext);
    if (source.estimateStamp && !source.estimateResult) {
      const families = directFamilies.filter(([kind]) => hasProposal?.(source.id, kind));
      if (!families.length && !estimateFamilies.some(([field]) =>
        Array.isArray(source[field]) && source[field].length)) return false;
      for (const [, table] of families) {
        const ids = familyRefs.get(table) ?? new Set<string>();
        ids.add(source.id); familyRefs.set(table, ids);
      }
    }
    for (const [stamp, result, kinds] of [
      ['calendarStamp', 'calendarResult', [['calendar', 'chatCalendarProposals']]],
      ['captureStamp', 'captureResult', [
        ['captureSource', 'chatCaptureSourceProposals'], ['captureSetup', 'chatCaptureSetupProposals'],
      ]],
    ] as const) {
      if (!source[stamp] || source[result]) continue;
      const found = kinds.filter(([kind]) => hasProposal?.(source.id, kind));
      if (!found.length) {
        if (stamp === 'calendarStamp' && Array.isArray(source.calendarProposalEvidence) && source.calendarProposalEvidence.length ||
          stamp === 'captureStamp' && (
            Array.isArray(source.captureSetupEvidence) && source.captureSetupEvidence.length ||
            Array.isArray(source.captureSourceEvidence) && source.captureSourceEvidence.length)) continue;
        if (stamp === 'captureStamp' && page.success && page.data.captureContext &&
          'sourceId' in page.data.captureContext) {
          add(records, 'capture_source', page.data.captureContext.sourceId);
          continue;
        }
        if (stamp === 'calendarStamp' && page.success && page.data.calendarVisit) {
          const calendar = resolveAuthorizedCollectionScope(authority, 'calendar.read');
          const jobs = resolveAuthorizedCollectionScope(authority, 'jobs.read');
          const orders = resolveAuthorizedCollectionScope(authority, 'workorders.read');
          if (!calendar.allowed || calendar.scope !== 'workspace' ||
            jobs.allowed && jobs.scope !== 'workspace' || orders.allowed && orders.scope !== 'workspace') return false;
          add(records, 'calendar_visit', page.data.calendarVisit.id);
          continue;
        }
        return false;
      }
      for (const [, table] of found) {
        const ids = proposalTurns.get(table) ?? new Set<string>();
        ids.add(source.id); proposalTurns.set(table, ids);
      }
    }
  }
  const familyByTable: Record<string, ChatProposalFamily> = {
    ...Object.fromEntries(directFamilies.map(([family, table]) => [table, family])),
    chatCalendarProposals: 'calendar', chatCaptureSetupProposals: 'captureSetup', chatCaptureSourceProposals: 'captureSource',
  };
  const reviewed = new Map<ChatProposalFamily, Map<string, { id: string; inputHash: string }>>();
  for (const source of visited.values()) {
    if (source.state !== 'completed') continue;
    if (source.customerResult) {
      const result = customerChatResultSchema.safeParse(source.customerResult);
      if (!result.success) return false;
      if (result.data.draft) {
        const refs = reviewed.get('customer') ?? new Map();
        refs.set(source.id, result.data.draft); reviewed.set('customer', refs);
      }
    }
    if (source.workOrderResult) {
      const result = workOrderChatResultSchema.safeParse(source.workOrderResult);
      if (!result.success || result.data.turnId && result.data.turnId !== source.id) return false;
      if (result.data.draft) {
        const family = result.data.draft.action.startsWith('material-') ? 'material' : 'workOrder';
        const refs = reviewed.get(family) ?? new Map();
        refs.set(source.id, result.data.draft); reviewed.set(family, refs);
      }
    }
  }
  const requests = [...new Set([...familyRefs.keys(), ...proposalIds.keys(), ...proposalTurns.keys()])].map(table => ({
    family: familyByTable[table], ids: [...proposalIds.get(table) ?? []],
    turnIds: [...new Set([...familyRefs.get(table) ?? [], ...proposalTurns.get(table) ?? []])],
  }));
  for (const [family, refs] of reviewed) requests.push({ family, ids: [...refs.values()].map(ref => ref.id), turnIds: [] });
  const canonicalRows = await readProposalEvidence(trx, authority, turn.threadId, requests);
  const selectedRows = (table: string) => canonicalRows.filter(row => row.family === familyByTable[table]);
  for (const [family, refs] of reviewed) {
    const rows = canonicalRows.filter(row => row.family === family && refs.has(row.turnId));
    for (const [turnId, ref] of refs) {
      const row = rows.find(row => row.turnId === turnId && row.id === ref.id);
      if (!row) return false;
      const schema = family === 'customer' ? customerProposalStoredSchema : family === 'material' ? materialProposalStoredSchema : workOrderProposalStoredSchema;
      const parsed = schema.safeParse(row.payload);
      if (!parsed.success || parsed.data.accessHash !== chatAccessHash(authority) || parsed.data.review.inputHash !== ref.inputHash ||
        parsed.data.review.id !== ref.id || row.inputHash !== ref.inputHash ||
        (parsed.data.payload.kind !== 'deleted' && captureDraftFingerprint(parsed.data.payload) !== ref.inputHash)) return false;
      if (family === 'material' && !authorize(authority, { permission: 'materials.read' }).allowed) return false;
      collectExplicitRecords(records, parsed.data.payload);
      if ('customer' in parsed.data.review) add(records, 'customer', parsed.data.review.customer.id);
      if ('workOrder' in parsed.data.review && family === 'workOrder') add(records, 'work_order', parsed.data.review.workOrder.id);
    }
  }
  for (const [table, turns] of proposalTurns) {
    const rows = selectedRows(table);
    if ([...turns].some(id => !rows.some(row => row.turnId === id))) return false;
    needProposal(table, rows.filter(row => turns.has(row.turnId)).map(row => row.id));
  }
  // Canonical sources share one bounded query.
  for (const [, table, schema] of directFamilies) {
    const ids = familyRefs.get(table);
    if (!ids?.size) continue;
    const rows = selectedRows(table).filter(row => ids.has(row.turnId));
    if ([...ids].some(id => !rows.some(row => row.turnId === id))) return false;
    for (const row of rows) {
      const parsed = schema.safeParse(row.payload);
      if (!parsed.success || !estimatePayloadMatches(table, parsed.data, row.id)) return false;
      if (table === 'chatEstimateDraftDeletes') {
        const deletion = estimateDraftDeleteChatStoredSchema.parse(parsed.data);
        if (deletion.ticket.state === 'confirmed') {
          const checked = await visibleEstimateChatDraftDelete(trx, authority, row.turnId);
          if (!checked || checked.ticket.id !== row.id || checked.ticket.inputHash !== deletion.ticket.inputHash ||
            checked.ticket.state !== 'confirmed' || !checked.receipt) return false;
          const captured = recordSets();
          collectExplicitRecords(captured, deletion);
          captured.estimate.delete(deletion.ticket.estimate.id);
          for (const kind of Object.keys(captured) as RecordKind[])
            captured[kind].forEach(id => records[kind].add(id));
          continue;
        }
      }
      collectExplicitRecords(records, parsed.data);
    }
  }
  for (const [table, ids] of proposalIds) {
    if (table !== 'chatCalendarProposals') {
      const scope = resolveAuthorizedCollectionScope(authority, 'leadCapture.read');
      if (!scope.allowed || scope.scope !== 'workspace') return false;
    }
    const rows = selectedRows(table).filter(row => ids.has(row.id));
    if (rows.length !== ids.size) return false;
    for (const row of rows) {
      if (table === 'chatCalendarProposals') {
        const parsed = calendarProposalStoredSchema.safeParse(row.payload);
        if (!parsed.success || parsed.data.draft.id !== row.id ||
          parsed.data.command.workspaceId !== authority.workspaceId) return false;
        const draft = Object.fromEntries(Object.entries(parsed.data.draft)
          .filter(([key]) => !['state', 'inputHash'].includes(key)));
        if (parsed.data.draft.inputHash !== captureDraftFingerprint({ draft, command: parsed.data.command,
          authority: parsed.data.authority, stamp: parsed.data.stamp })) return false;
        collectExplicitRecords(records, parsed.data);
      } else {
        const payload = object(row.payload)!;
        const view = object(payload.view);
        const parsed = table === 'chatCaptureSetupProposals'
          ? captureSetupViewSchema.safeParse(view) : captureSourceProposalViewSchema.safeParse(view);
        if (!parsed.success || parsed.data.ticket.proposalId !== row.id ||
          parsed.data.ticket.workspaceId !== authority.workspaceId || payload.turnId !== row.turnId ||
          payload.threadId !== row.threadId) return false;
        const ticket = { ...parsed.data.ticket, state: undefined, inputHash: undefined };
        const binding = table === 'chatCaptureSetupProposals'
          ? { ticket, review: view?.review, authority: payload.authority, input: payload.input,
            turnId: payload.turnId, threadId: payload.threadId, manual: payload.manual }
          : { ...payload, view: { ...view, ticket, receipt: undefined } };
        if (parsed.data.ticket.inputHash !== captureDraftFingerprint(binding)) return false;
        collectExplicitRecords(records, parsed.data);
      }
    }
  }
  return assistantCapturedRecordsAllowed(trx, authority,
    Object.fromEntries(Object.entries(records).map(([kind, ids]) => [kind, [...ids]])));
}
