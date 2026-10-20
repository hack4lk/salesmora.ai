import 'server-only';
import { readToolRegistry } from '@salesmora/agent';
import { searchAuthorizedHelp } from '../help';
import type { ChatToolHandler } from './types';

export const searchHelp: ChatToolHandler = async (context, args) => {
  const { query } = readToolRegistry.search_help.inputSchema.parse(args);
  await context.authorize('search_help');
  const matches = await searchAuthorizedHelp(context.identity.userId, context.identity.workspaceId, query, context.signal, context.turnId);
  return { evidence: { type: 'untrusted-help-reference', matches }, sources: matches.map(match => match.source) };
};
