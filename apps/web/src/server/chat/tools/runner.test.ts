import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toolRegistry, type ImplementedToolId } from '@salesmora/agent';
import { permissionCatalog, type AuthorizationContext, type PermissionId, type HelpSource } from '@salesmora/contracts';
import { createDefaultWorkspacePolicy } from '@salesmora/domain';
import { AuthorizationAccessError, createDatabase } from '@salesmora/data';
import type { ChatToolHandler, ChatToolRequestContext } from './types';
import type { StoredTurn } from '../store';

const mocks = vi.hoisted(() => ({
  authorize: vi.fn(), validate: vi.fn(), sources: vi.fn(), embed: vi.fn(), retrieve: vi.fn(),
}));
vi.mock('server-only', () => ({}));
vi.mock('../../authorization/permissions', () => ({ authorizedWorkspace: mocks.authorize }));
vi.mock('../../workspaces/store', () => ({ database: () => db }));
vi.mock('../store', () => ({
  validateTurnEvidenceInTransaction: mocks.validate, rememberTurnSources: mocks.sources,
}));
vi.mock('../help', () => ({ embedHelpQuery: mocks.embed }));
vi.mock('@salesmora/data', async importOriginal => ({
  ...await importOriginal<typeof import('@salesmora/data')>(), retrieveHelp: mocks.retrieve,
}));
import { executeChatTool } from './runner';
import { prepareHelpSearch } from './search-help';
import { withChatRequest, admittedChatRequest } from '../request-context';
import { proposalKinds } from '../history-proposals';

const id = '00000000-0000-4000-8000-000000000001';
const identity = { userId: 'fictional-owner', workspaceId: id };
const fullAuthority: AuthorizationContext = {
  ...identity, ownerUserId: identity.userId, membership: { ...identity, role: 'owner' },
  policy: createDefaultWorkspacePolicy(id), enabledPermissions: Object.keys(permissionCatalog) as PermissionId[],
};
const turn = { ...identity, id };
function admittedTurn(): StoredTurn {
  return {
    ...turn, threadId: id, clientTurnId: id, messageId: id, surfaceKey: 'home', state: 'accepted',
    pageContext: {}, leadEvidence: [], leadSearchEvidence: [], sources: [], proposalFamilies: [],
    leadHistoryResult: null, leadDetailsResult: null, leadSearchSnapshot: null,
    requestHash: 'fictional', accessHash: 'fictional', leaseUntil: new Date(Date.now() + 120_000), createdAt: new Date(),
  };
}
const nullable = (keys: string) => Object.fromEntries(keys.split(' ').map(key => [key, null]));
const fixtures = {
  workflows_prepare: { name: "Reminder", businessDays: 1, recipient: "me" },
  reports_query: { request: { mode: 'current_report' } },
  leads_query: { request: { operation: 'pipeline_summary', input: {} } },
  leads_propose_action: { request: { operation: 'delete', input: { leadRef: '' } } },
  search_help: { query: 'Fictional help question' },
  customers_query: { request: { operation: 'details', input: { customerRef: '' } } },
  customers_propose_action: { request: { operation: 'delete', input: { customerRef: '' } } },
  estimates_query: { request: { operation: 'list', input: { useCurrentFilters: false } } },
  estimates_propose_action: { request: { operation: 'export', filters: null } },
  calendar_query: { operation: 'schedule', date: null, usePageFilters: false, to: null, person: null, arrivalWindow: null, includeWeekends: false },
  calendar_propose_action: { operation: 'schedule', recordRef: null, scheduledDate: '2026-10-12', windowMode: 'keep', arrivalWindow: null },
  materials_query: { operation: 'search', query: null, category: null, supplier: null, limit: null },
  materials_propose_action: { ...nullable('target name sku unit category supplier costDollars priceDollars notes sourceUrl'), operation: 'export' },
  work_orders_query: { ...nullable('query status mine when workOrderNumber limit'), operation: 'search' },
  work_orders_propose_action: {
    ...nullable('workOrderNumber jobNumber title instructions safetyNotes scheduledDate arrivalWindow assignee crew tasks taskLabel done materials status reason summary overrideReason body query filterStatus mine when columns'),
    operation: 'export_csv',
  },
  lead_capture_query: {
    operation: 'sources', sourceId: null, search: null, type: null, status: null, archived: false, usePageFilters: false, page: 1, limit: 1,
  },
  lead_capture_propose_action: {
    ...nullable('sourceId name sourceType fields contactRequired workflow brief content rules mappings findings timing configurationKind'), operation: 'create_source',
  },
} satisfies Record<ImplementedToolId, unknown>;
const db = createDatabase('postgres://localhost/unused');
let authority = fullAuthority;
let request: ChatToolRequestContext;
let abort: AbortController;
let open = 0;
const statements: string[] = [];
beforeEach(() => {
  vi.clearAllMocks();
  authority = fullAuthority;
  abort = new AbortController();
  request = { identity, turnId: id, sessionId: 'trusted-session', surface: 'home', pageContext: {}, signal: abort.signal };
  open = 0;
  statements.length = 0;
  vi.spyOn(db.client, 'acquireConnection').mockResolvedValue({
    query: (query: { text: string }, callback: (error: Error | null, result: { rows: unknown[]; rowCount: number; command: string }) => void) => {
      statements.push(query.text);
      callback(null, { rows: [], rowCount: 0, command: query.text.split(' ')[0] });
    },
  });
  vi.spyOn(db.client, 'releaseConnection').mockResolvedValue(undefined);
  mocks.authorize.mockImplementation(async (_user, _workspace, _write, run) => db.transaction(async trx => {
    open++;
    try { return await run(trx, authority); }
    finally { open--; }
  }));
  mocks.validate.mockResolvedValue(turn);
  mocks.sources.mockResolvedValue(undefined);
});
afterEach(() => vi.restoreAllMocks());
afterAll(() => db.destroy());

describe('common tool execution lifecycle', () => {
  it.each(proposalKinds)('stages the %s family without another persistence call', async family => {
    const savedTurn = admittedTurn();
    await withChatRequest({ authority, turn: savedTurn, sessionId: 'trusted-session' }, async () => {
      await executeChatTool(request, 'leads_query', fixtures.leads_query, {
        execute: async () => ({ evidence: {},
          ...(family === 'customer' ? { customerResult: { kind: 'proposal' as const, title: 'Fixture', total: 0, records: [], fields: [], entries: [],
            draft: { id, inputHash: 'a'.repeat(64), expiresAt: new Date().toISOString(), state: 'pending' as const, action: 'create' as const,
              customer: { name: 'Fixture', number: 'New customer' }, changes: [] } } }
            : family === 'workOrder' || family === 'material' ? { workOrderResult: { kind: 'proposal' as const, title: 'Fixture', records: [],
              draft: { id, inputHash: 'a'.repeat(64), expiresAt: new Date().toISOString(), state: 'pending' as const,
                action: family === 'material' ? 'material-create' as const : 'create' as const, workOrder: { number: 'New', title: 'Fixture' }, changes: [] } } }
              : { [family === 'workflow' ? 'workflowDraft' : family === 'calendar' ? 'calendarProposal' : family]: { fixture: true } }),
        }),
      });
      expect(savedTurn.proposalFamilies).toEqual([family]);
      expect(admittedChatRequest(identity, id)?.staged?.proposalFamilies).toEqual([family]);
    });
    expect(statements.every(sql => /^(BEGIN|COMMIT)/.test(sql))).toBe(true);
    expect(mocks.validate).not.toHaveBeenCalled();
  });
  it('unions families across tools and leaves ordinary reads empty', async () => {
    const savedTurn = admittedTurn();
    await withChatRequest({ authority, turn: savedTurn, sessionId: 'trusted-session' }, async () => {
      for (const family of [undefined, 'action', 'estimateDraft', 'action']) {
        await executeChatTool(request, 'leads_query', fixtures.leads_query, {
          execute: async () => ({ evidence: {}, ...(family ? { [family]: { fixture: true } } : {}) }),
        });
      }
      expect(savedTurn.proposalFamilies).toEqual(['action', 'estimateDraft']);
    });
    expect(statements.every(sql => /^(BEGIN|COMMIT)/.test(sql))).toBe(true);
  });
  it('does not mistake a structured Customer/Work Order read without a draft for proposal metadata', async () => {
    const savedTurn = admittedTurn();
    await withChatRequest({ authority, turn: savedTurn, sessionId: 'trusted-session' }, async () => {
      await executeChatTool(request, 'leads_query', fixtures.leads_query, {
        execute: async () => ({ evidence: {},
          customerResult: { kind: 'outcome', title: 'Fixture', total: 0, records: [], fields: [], entries: [] },
          workOrderResult: { kind: 'outcome', title: 'Fixture', records: [] },
        }),
      });
      expect(savedTurn.proposalFamilies).toEqual([]);
    });
  });
  it('keeps legacy unknown metadata unknown instead of replacing it with a partial family list', async () => {
    const savedTurn = admittedTurn(); savedTurn.proposalFamilies = null;
    await withChatRequest({ authority, turn: savedTurn, sessionId: 'trusted-session' }, async () => {
      await executeChatTool(request, 'leads_query', fixtures.leads_query, {
        execute: async () => {
          const family: string = 'action';
          return { evidence: {}, [family]: { fixture: true } };
        },
      });
      expect(savedTurn.proposalFamilies).toBeNull();
      expect(admittedChatRequest(identity, id)?.staged?.proposalFamilies).toBeUndefined();
    });
  });
  it('does not stage proposal metadata from an interrupted tool', async () => {
    const savedTurn = admittedTurn();
    await withChatRequest({ authority, turn: savedTurn, sessionId: 'trusted-session' }, async () => {
      await expect(executeChatTool(request, 'leads_query', fixtures.leads_query, {
        execute: async () => {
          abort.abort();
          const family: string = 'action';
          return { evidence: {}, [family]: { fixture: true } };
        },
      })).rejects.toThrow();
      expect(savedTurn.proposalFamilies).toEqual([]);
      expect(admittedChatRequest(identity, id)?.staged?.proposalFamilies).toBeUndefined();
    });
  });
  it.each(Object.keys(fixtures).filter((name): name is ImplementedToolId => name in toolRegistry))(
    'executes %s through the same held transaction/session/evidence boundary', async name => {
      if (name === 'workflows_prepare') request = { ...request, surface: 'workflows.list' };
      const execute = vi.fn<ChatToolHandler>(async context => {
        expect(open).toBe(1);
        expect(context.db.isTransaction).toBe(true);
        expect(context.authority).toBe(authority);
        expect(context.turn).toBe(turn);
        expect(context.enabledPermissions).toBe(authority.enabledPermissions);
        return { evidence: { type: 'fictional' } };
      });
      expect(await executeChatTool(request, name, fixtures[name], { execute })).toEqual({ evidence: { type: 'fictional' } });
      expect(mocks.authorize).toHaveBeenCalledExactlyOnceWith(identity.userId, id, true, expect.any(Function),
        undefined, { reuseNestedAuthority: true });
      expect(mocks.validate).toHaveBeenCalledOnce();
      for (const [trx, current, turnId, access] of mocks.validate.mock.calls) {
        expect(trx).toBe(execute.mock.calls[0][0].db);
        expect(current).toBe(authority);
        expect(turnId).toBe(id);
        expect(access).toEqual({ sessionId: 'trusted-session', activeOnly: true });
      }
      expect(statements.at(-1)).toMatch(/^COMMIT/);
    },
  );
  it.each(Object.keys(fixtures).filter((name): name is ImplementedToolId => name in toolRegistry))(
    'denies revoked %s before invoking domain code', async name => {
      authority = { ...fullAuthority, enabledPermissions: ['assistant.use'] };
      // Help needs only assistant.use, so revoke that capability as well.
      if (name === 'search_help') authority = { ...authority, enabledPermissions: [] };
      const execute = vi.fn<ChatToolHandler>();
      await expect(executeChatTool(request, name, fixtures[name], { execute })).rejects.toThrow(AuthorizationAccessError);
      expect(execute).not.toHaveBeenCalled();
      expect(statements.at(-1)).toMatch(/^ROLLBACK/);
    },
  );
  it('rejects invalid model arguments without opening a transaction', async () => {
    await expect(executeChatTool(request, 'leads_query', { identity }, { execute: vi.fn() })).rejects.toThrow();
    expect(mocks.authorize).not.toHaveBeenCalled();
  });
  it.each(['session revoked', 'cancelled turn', 'expired lease', 'inherited evidence revoked'])(
    'does not execute when the owned-turn validator reports %s', async reason => {
      const failure = new Error(reason);
      mocks.validate.mockRejectedValueOnce(failure);
      const execute = vi.fn<ChatToolHandler>();
      await expect(executeChatTool(request, 'leads_query', fixtures.leads_query, { execute })).rejects.toBe(failure);
      expect(execute).not.toHaveBeenCalled();
      expect(statements.at(-1)).toMatch(/^ROLLBACK/);
    },
  );
  it('persists sources within the tool transaction without repeating turn authorization', async () => {
    const sources: HelpSource[] = [{ slug: 'fixture', version: 'a'.repeat(64), title: 'Fixture',
      anchor: 'fixture', heading: 'Fixture', href: '/help/fixture' }];
    const execute = vi.fn<ChatToolHandler>(async context => {
      await context.db.raw('select 1');
      return { evidence: {}, sources };
    });
    await expect(executeChatTool(request, 'search_help', fixtures.search_help, { execute })).resolves.toMatchObject({ sources });
    expect(mocks.validate).toHaveBeenCalledOnce();
    expect(mocks.sources).toHaveBeenCalledExactlyOnceWith(identity, id, sources, execute.mock.calls[0][0].db);
    expect(statements.at(-1)).toMatch(/^COMMIT/);
  });
  it('propagates source persistence failures without releasing a result', async () => {
    mocks.sources.mockRejectedValueOnce(new Error('Evidence persistence failed.'));
    const execute: ChatToolHandler = async () => ({ evidence: {}, sources: [{
      slug: 'fixture', version: 'a'.repeat(64), title: 'Fixture', anchor: 'fixture', heading: 'Fixture', href: '/help/fixture',
    }] });
    await expect(executeChatTool(request, 'search_help', fixtures.search_help, { execute }))
      .rejects.toThrow('Evidence persistence failed.');
    expect(statements.at(-1)).toMatch(/^ROLLBACK/);
  });
  it('persists an explicit empty source list instead of retaining older sources', async () => {
    const execute = vi.fn<ChatToolHandler>(async () => ({ evidence: {}, sources: [] }));
    await executeChatTool(request, 'search_help', fixtures.search_help, { execute });
    expect(mocks.sources).toHaveBeenCalledExactlyOnceWith(identity, id, [], execute.mock.calls[0][0].db);
  });
  it('prepares external work outside transactions and freshly admits execution afterward', async () => {
    const execute = vi.fn<ChatToolHandler>(async () => ({ evidence: {} }));
    const prepare = vi.fn(async () => {
      expect(open).toBe(0);
      expect(statements.at(-1)).toMatch(/^COMMIT/);
      authority = { ...authority, enabledPermissions: [] };
      return execute;
    });
    await expect(executeChatTool(request, 'search_help', fixtures.search_help, { prepare }))
      .rejects.toThrow(AuthorizationAccessError);
    expect(prepare).toHaveBeenCalledOnce();
    expect(execute).not.toHaveBeenCalled();
    expect(mocks.authorize).toHaveBeenCalledTimes(2);
  });
  it('does not spend on external work after initial admission fails', async () => {
    mocks.validate.mockRejectedValueOnce(new AuthorizationAccessError());
    const prepare = vi.fn();
    await expect(executeChatTool(request, 'search_help', fixtures.search_help, { prepare }))
      .rejects.toThrow(AuthorizationAccessError);
    expect(prepare).not.toHaveBeenCalled();
  });
  it('uses the Help adapter preparation outside the transaction and retrieves/persists with fresh authority', async () => {
    const vector = [0.1, 0.2], embedder = { model: 'fictional', dimensions: 2 };
    const source: HelpSource = { slug: 'fixture', version: 'a'.repeat(64), title: 'Fixture',
      anchor: 'fixture', heading: 'Fixture', href: '/help/fixture' };
    mocks.embed.mockImplementation(async () => {
      expect(open).toBe(0);
      return { vector, embedder };
    });
    mocks.retrieve.mockImplementation(async (trx, current) => {
      expect(open).toBe(1);
      expect(trx.isTransaction).toBe(true);
      expect(current).toBe(authority);
      return [{ source, text: 'Fictional help reference' }];
    });
    const result = await executeChatTool(request, 'search_help', fixtures.search_help, { prepare: prepareHelpSearch });
    expect(mocks.embed).toHaveBeenCalledExactlyOnceWith(identity.userId, id, fixtures.search_help.query, abort.signal, id);
    expect(mocks.retrieve).toHaveBeenCalledExactlyOnceWith(expect.any(Function), authority, vector, embedder);
    expect(result.sources).toEqual([source]);
    expect(mocks.sources).toHaveBeenCalledOnce();
    expect(mocks.authorize).toHaveBeenCalledTimes(2);
  });
  it('rolls back when interrupted after domain execution', async () => {
    const execute: ChatToolHandler = async () => { abort.abort(); return { evidence: {} }; };
    await expect(executeChatTool(request, 'leads_query', fixtures.leads_query, { execute })).rejects.toThrow('aborted');
    expect(statements.at(-1)).toMatch(/^ROLLBACK/);
  });
});
