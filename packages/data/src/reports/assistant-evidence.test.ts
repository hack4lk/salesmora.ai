import { createHash } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import type { Knex } from 'knex';
import { permissionIds, leadStages, leadSources, reportAssistantBindingContentSchema, reportAssistantReadSnapshotSchema,
  reportSelectionSchema, type AuthorizationContext } from '@salesmora/contracts';
import { createDefaultWorkspacePolicy } from '@salesmora/domain';
import { assistantAuthorityStamp } from '../authorization/evidence-stamp';
import { estimateChatStamp } from '../estimates/chat-evidence';
import { customerChatStamp } from '../customers/chat-evidence';
import { calendarChatStamp } from '../calendar/chat';
import { captureChatStamp } from '../lead-capture/assistant-read';
import { reportAssistantDataStamp, reportAssistantEvidenceAllowed, reportAssistantHistoricalSelectionAllowed,
  reportAssistantSnapshotMatches } from './assistant-evidence';
import { withAdmittedChatTurn, type AdmittedChatTurn } from '../chat-request';
import { estimateProposalTurn, rememberEstimateProposalEvidence } from '../estimates/chat-proposals';

const workspaceId = '00000000-0000-4000-8000-000000000001';
function context(): AuthorizationContext {
  const policy = createDefaultWorkspacePolicy(workspaceId, 1);
  policy.grants.push({ role: 'owner', permission: 'reports.financial.read', scope: 'enabled' });
  return { workspaceId, userId: 'owner', ownerUserId: 'owner',
    membership: { workspaceId, userId: 'owner', role: 'owner' }, policy, enabledPermissions: [...permissionIds] };
}
const noDatabase = vi.fn(() => { throw new Error('Historical stamps must not scan the workspace.'); }) as unknown as Knex.Transaction;
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value)
    .sort(([a], [b]) => a.localeCompare(b, 'en')).map(([key, item]) => [key, canonical(item)]));
  return value;
}
const digest = (value: unknown) => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
function snapshot(value = context()) {
  const query = reportSelectionSchema.parse({ area: 'leads', query: { workspaceId, view: 'pipeline', page: 1, pageSize: 25,
    filters: { stages: [], owners: [], sources: [] }, selection: { kind: 'pipeline' } } }).query;
  const native = {
    area: 'leads', read: { workspaceId, viewerId: value.userId, policyRevision: value.policy.revision,
      scope: 'workspace', archiveVisibility: 'excluded', query,
      options: { stages: leadStages.map(value => ({ value, label: value })),
        sources: leadSources.map(value => ({ value, label: value })), owners: [] },
      report: { view: 'pipeline', asOf: '2026-11-05T10:00:00Z', today: '2026-11-05',
        timezone: 'Europe/Warsaw', scopeLabel: 'Authorized workspace sources.',
        archiveVisibility: 'excluded', total: 0, stages: { new: 0, contacted: 0, 'estimate-sent': 0 },
        ages: { '0-7': 0, '8-14': 0, '15-30': 0, '31+': 0 }, selection: { kind: 'pipeline' },
        page: 1, pageSize: 25, evidenceTotal: 0, rows: [] },
    },
  };
  const binding = reportAssistantBindingContentSchema.parse({
    id: '00000000-0000-4000-8000-000000000002', workspaceId, viewerId: value.userId,
    policyRevision: value.policy.revision, selection: { area: 'leads', query },
    retrievedAt: '2026-11-05T10:00:00.000Z', contentHash: digest(native),
  });
  const stamp = createHash('sha256').update(JSON.stringify([
    assistantAuthorityStamp(value, 'reports'), canonical(binding),
  ])).digest('hex');
  return reportAssistantReadSnapshotSchema.parse({ native, binding: { ...binding, stamp } });
}

describe('historical assistant evidence', () => {
  it('stages new Estimate proposal provenance without rereading or separately updating the admitted turn', async () => {
    const authority = context(), id = '00000000-0000-4000-8000-000000000022';
    const turn: AdmittedChatTurn = {
      workspaceId, userId: authority.userId, id, threadId: id, surfaceKey: 'home', pageContext: {},
      state: 'running', leaseUntil: new Date(Date.now() + 120000), accessHash: 'server-owned',
      leadEvidence: [], leadSearchEvidence: [], leadSearchSnapshot: null, leadHistoryResult: null,
      leadDetailsResult: null, sources: [],
    };
    await withAdmittedChatTurn(turn, update => Object.assign(turn, update), async () => {
      expect(await estimateProposalTurn(noDatabase, authority, id)).toBe(turn);
      await rememberEstimateProposalEvidence(noDatabase, authority, id, 'a'.repeat(32), 'estimateDecisionEvidence');
      expect(turn.estimateDecisionEvidence).toEqual([id]);
      expect(turn.estimateStamp).toBe('a'.repeat(32));
      turn.leaseUntil = new Date(Date.now() - 1);
      await expect(estimateProposalTurn(noDatabase, authority, id)).rejects.toThrow('conversation must finish');
    });
    expect(noDatabase).not.toHaveBeenCalled();
  });
  it('creates authorization-only domain stamps without any database access', async () => {
    const value = context();
    for (const [read, length] of [
      [estimateChatStamp, 32], [customerChatStamp, 32], [calendarChatStamp, 64],
      [captureChatStamp, 64], [reportAssistantDataStamp, 64],
    ] as const) {
      const before = await read(noDatabase, value);
      expect(before).toHaveLength(length);
      expect(await read(noDatabase, value)).toBe(before);
      expect(await read(noDatabase, { ...value, enabledPermissions: [...value.enabledPermissions].reverse(),
        policy: { ...value.policy, grants: [...value.policy.grants].reverse() } })).toBe(before);
    }
    expect(await captureChatStamp(noDatabase, value, 'delivery-on'))
      .toBe(await captureChatStamp(noDatabase, value, 'delivery-off'));
  });
  it('retains a timestamped report after ordinary record changes without loading the report again', async () => {
    const value = context(), saved = snapshot(value);
    expect(reportAssistantSnapshotMatches(saved)).toBe(true);
    expect(await reportAssistantEvidenceAllowed(noDatabase, value, [saved.binding])).toBe(true);
    expect(await reportAssistantEvidenceAllowed(noDatabase, value, [saved.binding])).toBe(true);
    expect(noDatabase).not.toHaveBeenCalled();
  });
  it('rejects forged content/query bindings, legacy fingerprints and another actor or tenant', async () => {
    const value = context(), saved = snapshot(value);
    expect(reportAssistantSnapshotMatches({ ...saved, native: { ...saved.native,
      read: { ...saved.native.read, scope: 'assigned' } } })).toBe(false);
    for (const patch of [
      { stamp: 'a'.repeat(64) }, { contentHash: 'b'.repeat(64) },
      { viewerId: 'another-viewer' }, { retrievedAt: '2026-11-06T10:00:00.000Z' },
    ]) expect(await reportAssistantEvidenceAllowed(noDatabase, value, [{ ...saved.binding, ...patch }])).toBe(false);
    expect(await reportAssistantEvidenceAllowed(noDatabase, { ...value, userId: 'outsider' }, [saved.binding])).toBe(false);
    expect(await reportAssistantEvidenceAllowed(noDatabase, { ...value, workspaceId: 'other' }, [saved.binding])).toBe(false);
    expect(await reportAssistantEvidenceAllowed(noDatabase, value, [{}])).toBe(false);
  });
  it('fails closed after permission loss or assigned aggregate narrowing', async () => {
    const value = context(), saved = snapshot(value);
    value.enabledPermissions = value.enabledPermissions.filter(id => id !== 'leads.read');
    expect(await reportAssistantEvidenceAllowed(noDatabase, value, [saved.binding])).toBe(false);
    const narrowed = context();
    narrowed.policy.grants = narrowed.policy.grants.map(grant => grant.role === 'owner' && grant.permission === 'leads.read'
      ? { ...grant, scope: 'assigned' } : grant);
    expect(reportAssistantHistoricalSelectionAllowed(narrowed, saved.binding.selection)).toBe(false);
    expect(await reportAssistantEvidenceAllowed(noDatabase, narrowed, [saved.binding])).toBe(false);
  });
  it('requires selected Financial material prices and costs independently', () => {
    const selection = reportSelectionSchema.parse({ area: 'financial', query: {
      workspaceId, view: 'financial', period: { from: '2026-11-01', to: '2026-11-05' }, selected: 'materials',
    } });
    expect(reportAssistantHistoricalSelectionAllowed(context(), selection)).toBe(true);
    for (const permission of ['reports.financial.read', 'workorders.view_prices', 'workorders.view_costs'] as const) {
      const value = context(); value.enabledPermissions = value.enabledPermissions.filter(id => id !== permission);
      expect(reportAssistantHistoricalSelectionAllowed(value, selection)).toBe(false);
    }
  });
});
