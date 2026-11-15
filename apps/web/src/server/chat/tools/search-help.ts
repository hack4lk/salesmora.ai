import 'server-only';
import { readToolRegistry } from '@salesmora/agent';
import { retrieveHelp } from '@salesmora/data';
import { embedHelpQuery } from '../help';
import type { ChatToolHandler, ChatToolRequestContext } from './types';

export async function prepareHelpSearch(context: ChatToolRequestContext, args: unknown): Promise<ChatToolHandler> {
  const { query } = readToolRegistry.search_help.inputSchema.parse(args);
  const { vector, embedder } = await embedHelpQuery(
    context.identity.userId, context.identity.workspaceId, query, context.signal, context.turnId,
  );
  return async current => {
    const matches = await retrieveHelp(current.db, current.authority, vector, embedder);
    return { evidence: { type: 'untrusted-help-reference', matches }, sources: matches.map(match => match.source) };
  };
}
