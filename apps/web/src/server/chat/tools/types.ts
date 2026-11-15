import type { AuthorizationContext, ChatPageContext, ChatSurfaceKey, PermissionId } from '@salesmora/contracts';
import type { Knex } from '@salesmora/data';
import type { ToolResult } from '@salesmora/agent';
import type { ChatIdentity, validateTurnEvidenceInTransaction } from '../store';

export interface ChatToolContext {
  identity: ChatIdentity;
  surface: ChatSurfaceKey;
  turnId: string;
  pageContext: ChatPageContext;
  signal: AbortSignal;
  db: Knex.Transaction;
  authority: AuthorizationContext;
  turn: Awaited<ReturnType<typeof validateTurnEvidenceInTransaction>>;
  enabledPermissions: readonly PermissionId[];
}
export type ChatToolRequestContext = Pick<ChatToolContext, 'identity' | 'surface' | 'turnId' | 'pageContext' | 'signal'> & {
  sessionId: string;
};
export type ChatToolHandler = (context: ChatToolContext, args: unknown) => Promise<ToolResult>;
