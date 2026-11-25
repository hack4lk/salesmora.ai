import 'server-only';
import { toolRegistry, type ImplementedToolId } from '@salesmora/agent';
import { withDatabaseOperation } from '@salesmora/data';
import { authorizedWorkspace } from '../../authorization/permissions';
import { rememberTurnSources, validateTurnEvidenceInTransaction } from '../store';
import { admittedChatRequest, stageChatEvidence } from '../request-context';
import { proposalKinds } from '../history-proposals';
import { assertToolOperation } from './authorization';
import type { ChatToolContext, ChatToolHandler, ChatToolRequestContext } from './types';

export type ChatToolDefinition = { execute: ChatToolHandler; prepare?: never } | {
  execute?: never;
  /** External work runs after admission and outside a DB transaction. */
  prepare: (context: ChatToolRequestContext, args: unknown) => Promise<ChatToolHandler>;
};

async function withToolTransaction<T>(
  request: ChatToolRequestContext, name: ImplementedToolId, args: unknown,
  use: (context: ChatToolContext) => Promise<T>,
) {
  request.signal.throwIfAborted();
  const admitted = admittedChatRequest(request.identity, request.turnId);
  return authorizedWorkspace(request.identity.userId, request.identity.workspaceId, true, async (db, authority) => {
    const turn = admitted?.turn ?? await validateTurnEvidenceInTransaction(db, authority, request.turnId, {
      sessionId: request.sessionId, activeOnly: true,
    });
    assertToolOperation(authority, request.surface, name, args);
    request.signal.throwIfAborted();
    return use({ ...request, db, authority, turn, enabledPermissions: authority.enabledPermissions });
  }, undefined, { reuseNestedAuthority: true });
}

export async function executeChatTool(
  request: ChatToolRequestContext, name: ImplementedToolId, raw: unknown, definition: ChatToolDefinition,
) {
  request.signal.throwIfAborted();
  const args = toolRegistry[name].inputSchema.parse(raw);
  let handler: ChatToolHandler;
  if (definition.prepare) {
    const admitted = admittedChatRequest(request.identity, request.turnId);
    if (admitted) assertToolOperation(admitted.authority, request.surface, name, args);
    else await withDatabaseOperation('tool-admission', () => withToolTransaction(request, name, args, async () => {}));
    request.signal.throwIfAborted();
    handler = await definition.prepare(request, args);
  } else handler = definition.execute;
  return withDatabaseOperation('tool-execution', () => withToolTransaction(request, name, args, async context => {
    const result = await handler(context, args);
    request.signal.throwIfAborted();
    const families = proposalKinds.filter(kind => {
      if (kind === 'workflow') return !!result.workflowDraft;
      if (kind === 'customer') return !!result.customerResult?.draft;
      if (kind === 'workOrder' || kind === 'material') {
        const draft = result.workOrderResult?.draft;
        return !!draft && draft.action.startsWith('material-') === (kind === 'material');
      }
      return kind === 'calendar' ? result.calendarProposal : result[kind];
    });
    if (families.length && context.turn.proposalFamilies != null) {
      const prior = context.turn.proposalFamilies;
      const proposalFamilies = [...new Set([...prior, ...families])];
      if (!stageChatEvidence(request.identity, request.turnId, { proposalFamilies }))
        await context.db('chatTurns').where({ ...request.identity, id: request.turnId })
          .update({ proposalFamilies: JSON.stringify(proposalFamilies) });
    }
    if (result.sources)
      await rememberTurnSources(request.identity, request.turnId, result.sources, context.db);
    request.signal.throwIfAborted();
    return result;
  }));
}
