import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { calendarChatStamp, createDatabase, type Knex } from '@salesmora/data';
import { createDefaultWorkspacePolicy } from '@salesmora/domain';
import { permissionIds, type AuthorizationContext } from '@salesmora/contracts';
import { chatAccessHash } from './access-hash';
import { historicalEvidenceAllowed, type HistoricalEvidenceTurn } from './historical-evidence';
import { readHistoryProposalPresence } from './history-proposals';
import * as data from '@salesmora/data';

vi.mock('server-only', () => ({}));
const workspaceId = '00000000-0000-4000-8000-000000000001';
const id = '00000000-0000-4000-8000-000000000002';
const leadId = '00000000-0000-4000-8000-000000000003';
const sourceId = '00000000-0000-4000-8000-000000000004';
const db = createDatabase('postgres://localhost/unused');
Object.defineProperty(db, 'isTransaction', { value: true });
const trx = db as unknown as Knex.Transaction;
function context(): AuthorizationContext {
  return { workspaceId, userId: 'owner', ownerUserId: 'owner',
    membership: { workspaceId, userId: 'owner', role: 'owner' },
    policy: createDefaultWorkspacePolicy(workspaceId), enabledPermissions: [...permissionIds] };
}
function turn(authority = context()): HistoricalEvidenceTurn {
  return { id, threadId: id, state: 'completed', accessHash: chatAccessHash(authority),
    sources: [], leadEvidence: [{ id: leadId, version: 1 }], leadSearchEvidence: [],
    reportEvidence: [] };
}
const queries: { sql: string; bindings: unknown[] }[] = [];
let leadExists = true;
let sources: HistoricalEvidenceTurn[] = [];
beforeEach(() => {
  leadExists = true; sources = []; queries.length = 0;
  vi.spyOn(db.client, 'acquireConnection').mockResolvedValue({});
  vi.spyOn(db.client, 'releaseConnection').mockResolvedValue(undefined);
  vi.spyOn(db.client, 'query').mockImplementation(async (_connection, query) => {
    if (!query || typeof query !== 'object' || !('sql' in query) || typeof query.sql !== 'string' ||
      !('bindings' in query) || !Array.isArray(query.bindings)) throw new Error('Expected compiled query.');
    queries.push({ sql: query.sql, bindings: query.bindings });
    const rows = query.sql.includes('from "leads"') ? leadExists ? [{ id: leadId, version: 99 }] : []
      : query.sql.includes('from "chatTurns"') ? sources : [];
    return { ...query, response: { rows, rowCount: rows.length, command: 'SELECT' } };
  });
});
afterEach(() => vi.restoreAllMocks());
afterAll(() => db.destroy());

describe('saved historical source authorization', () => {
  it('validates mixed canonical Calendar/Capture signed sources through one payload batch without legacy SQL', async () => {
    const authority = context(), createdAt = '2026-11-14T05:00:00.000Z', expiresAt = '2026-11-14T05:15:00.000Z';
    const calendarStamp = await data.calendarChatStamp(trx, authority), captureStamp = await data.captureChatStamp(trx, authority);
    const common = { workspaceId, userId: authority.userId, threadId: id, turnId: id, state: 'pending',
      payloadVersion: 1, createdAt, expiresAt, resolvedAt: null };
    const draft = { id: leadId, visitId: leadId, revision: 'a'.repeat(64), createdAt, expiresAt,
      timezone: 'America/New_York', from: { scheduledDate: '2026-11-13', arrivalWindow: null },
      to: { scheduledDate: '2026-11-14', arrivalWindow: null },
      records: [{ type: 'job', id: workspaceId, expectedVersion: 1, number: 'J-0001', title: 'Fixture Job', status: 'scheduled' }],
      crew: [], warnings: [] };
    const command = { workspaceId, visitId: leadId, submissionId: leadId, expectedVisitVersion: 1,
      records: [{ type: 'job', id: workspaceId, expectedVersion: 1 }], schedule: draft.to };
    const calendarHash = data.captureDraftFingerprint({ draft, command, authority: chatAccessHash(authority), stamp: calendarStamp });
    const calendar = data.parseChatProposal({ ...common, family: 'calendar', id: leadId, requestId: null, inputHash: calendarHash,
      payload: { draft: { ...draft, inputHash: calendarHash, state: 'pending' }, command,
        authority: chatAccessHash(authority), stamp: calendarStamp, receipt: null, resultStamp: null } });
    const input = { operation: 'create_source', sourceId: null, name: 'Fictional source', sourceType: 'website',
      fields: null, contactRequired: null, workflow: null, brief: null, content: null, rules: null, mappings: null, findings: null };
    const ticket = { workspaceId, proposalId: sourceId, operation: 'create_source', target: { kind: 'new_source' }, createdAt, expiresAt };
    const review = { name: 'Fictional source', configuration: { schemaVersion: 1, type: 'website' }, before: null, base: null, sample: null, findings: [] };
    const binding = { ticket: { ...ticket, state: undefined, inputHash: undefined }, review, authority: chatAccessHash(authority), input, turnId: id, threadId: id, manual: false };
    const captureHash = data.captureDraftFingerprint(binding);
    const capture = data.parseChatProposal({ ...common, family: 'captureSetup', id: sourceId, requestId: workspaceId, inputHash: captureHash,
      payload: { authority: chatAccessHash(authority), input, turnId: id, threadId: id, manual: false,
        view: { ticket: { ...ticket, state: 'pending', inputHash: captureHash }, review, receipt: null } } });
    const batch = vi.spyOn(data, 'readProposalEvidence').mockResolvedValue([calendar, capture]);
    const captured = vi.spyOn(data, 'assistantCapturedRecordsAllowed').mockResolvedValue(true);
    const source = { ...turn(authority), leadEvidence: [], calendarStamp, captureStamp, calendarResult: null, captureResult: null,
      calendarProposalEvidence: [leadId], captureSetupEvidence: [sourceId], proposalFamilies: ['calendar', 'captureSetup'] };
    const allowed = await data.withCanonicalProposalStorage(() => historicalEvidenceAllowed(trx, authority, source));
    expect(batch).toHaveBeenCalledOnce();
    expect(batch.mock.calls[0][3]).toEqual(expect.arrayContaining([
      { family: 'calendar', ids: [leadId], turnIds: [] }, { family: 'captureSetup', ids: [sourceId], turnIds: [] },
    ]));
    expect(queries.some(query => /chatCalendarProposals|chatCaptureSetupProposals/.test(query.sql))).toBe(false);
    expect(captured).toHaveBeenCalledOnce();
    expect(allowed).toBe(true);
    batch.mockResolvedValueOnce([calendar]);
    expect(await data.withCanonicalProposalStorage(() => historicalEvidenceAllowed(trx, authority, source))).toBe(false);
    const forged = structuredClone(capture);
    if (forged.family !== 'captureSetup') throw new Error('Expected Setup proposal.');
    forged.payload.input.name = 'Forged source';
    batch.mockResolvedValueOnce([calendar, forged]);
    expect(await data.withCanonicalProposalStorage(() => historicalEvidenceAllowed(trx, authority, source))).toBe(false);
  });
  it('retains edited Lead facts but rechecks captured IDs without workspace fingerprints or proposal discovery', async () => {
    expect(await historicalEvidenceAllowed(trx, context(), turn())).toBe(true);
    expect(queries).toHaveLength(1);
    expect(queries[0].bindings).toEqual(expect.arrayContaining([workspaceId, leadId]));
    expect(queries[0].sql).not.toMatch(/version|string_agg|xmin|ctid|chatEstimate|chatCalendar/);
  });
  it('withholds deleted or no-longer-assigned original sources', async () => {
    leadExists = false;
    expect(await historicalEvidenceAllowed(trx, context(), turn())).toBe(false);
    const assigned = context();
    assigned.userId = 'field';
    assigned.membership = { workspaceId, userId: 'field', role: 'field' };
    expect(await historicalEvidenceAllowed(trx, assigned, turn(assigned))).toBe(false);
    expect(queries.at(-1)?.sql).toContain('"l"."ownerId" =');
    expect(queries.at(-1)?.bindings).toContain('field');
  });
  it('rejects malformed or actor-mismatched source bindings before querying private records', async () => {
    expect(await historicalEvidenceAllowed(trx, context(), { ...turn(), leadEvidence: [{ id: 'foreign' }] })).toBe(false);
    expect(await historicalEvidenceAllowed(trx, context(), { ...turn(), accessHash: 'another-actor' })).toBe(false);
    expect(queries).toHaveLength(0);
  });
  it('loads inherited sources in one owned completed-thread batch and denies missing provenance', async () => {
    const current = { ...turn(), leadEvidence: [], leadSearchEvidence: [sourceId] };
    expect(await historicalEvidenceAllowed(trx, context(), current)).toBe(false);
    expect(queries).toHaveLength(1);
    expect(queries[0].sql).toContain('"state" =');
    expect(queries[0].bindings).toEqual(expect.arrayContaining([workspaceId, 'owner', id, 'completed', sourceId]));
  });
  it('does not follow a reference to a source without its bound search snapshot', async () => {
    sources = [{ ...turn(), id: sourceId, leadSearchEvidence: [sourceId] }];
    expect(await historicalEvidenceAllowed(trx, context(), { ...turn(), leadSearchEvidence: [sourceId] })).toBe(false);
    expect(queries).toHaveLength(1);
  });
  it('rechecks generic inherited source access and denies missing source turns', async () => {
    const current = { ...turn(), leadEvidence: [], historyEvidence: [sourceId] };
    expect(await historicalEvidenceAllowed(trx, context(), current)).toBe(false);
    sources = [{ ...turn(), id: sourceId }];
    expect(await historicalEvidenceAllowed(trx, context(), current)).toBe(true);
    leadExists = false;
    expect(await historicalEvidenceAllowed(trx, context(), current)).toBe(false);
  });
  it('does not accept malformed Work Order read provenance', async () => {
    expect(await historicalEvidenceAllowed(trx, context(), {
      ...turn(), workOrderReadEvidence: { ids: ['not-an-id'] },
    })).toBe(false);
    expect(queries).toHaveLength(0);
  });
  it('retains an owned inherited timestamped search after record edits', async () => {
    sources = [{ ...turn(), id: sourceId, leadSearchEvidence: [sourceId], leadSearchSnapshot: {
      filters: { query: '', stages: [], sources: [], ownerIds: [], created: 'any', from: '', to: '',
        attention: false, archived: false },
      ownerIds: [], versions: [{ id: leadId, version: 1 }],
      result: { id: sourceId, scope: 'workspace', filterLabels: [], includeArchived: false,
        asOf: '2026-11-05T10:00:00.000Z', total: 1, rows: [{
          id: leadId, number: 'LD-0001', name: 'Historical name', service: 'Repair',
          stage: 'new', archived: false, ownerName: null,
        }] },
    } }];
    expect(await historicalEvidenceAllowed(trx, context(), { ...turn(), leadSearchEvidence: [sourceId] })).toBe(true);
    expect(queries.filter(query => query.sql.includes('from "chatTurns"'))).toHaveLength(1);
    expect(queries.every(query => !/string_agg|xmin|ctid|chatEstimate/.test(query.sql))).toBe(true);
  });
  it('discovers proposals only for inherited ancestors outside the supplied history window', async () => {
    const authority = context();
    const presence = await readHistoryProposalPresence(trx, authority, [id], new Map([[id, []]]), authority);
    sources = [{ ...turn(authority), id: sourceId, calendarResult: null,
      calendarStamp: await calendarChatStamp(trx, authority), proposalFamilies: ['calendar'] }];
    expect(await historicalEvidenceAllowed(trx, authority, {
      ...turn(authority), historyEvidence: [sourceId],
    }, presence)).toBe(false);
    const discovery = queries.filter(query => query.sql.includes('"chatProposals"'));
    expect(discovery).toHaveLength(1);
    expect(discovery[0].bindings).toContain(sourceId);
    expect(discovery[0].bindings).not.toContain(id);
    expect(discovery[0].sql).not.toContain('chatEstimate');
  });
});
