import type { ChatToolId, ChatSurfaceKey, LeadOperationId } from '@salesmora/contracts';
import type { ToolResult } from '@salesmora/agent';
import type { ChatIdentity } from '../store';

export interface ChatToolContext {
  identity: ChatIdentity;
  surface: ChatSurfaceKey;
  turnId: string;
  signal: AbortSignal;
  /** Reloads session, turn evidence and tool permissions from authoritative server state. */
  authorize: (tool: ChatToolId, operation?: LeadOperationId) => Promise<readonly ChatToolId[]>;
}
export type ChatToolHandler = (context: ChatToolContext, args: unknown) => Promise<ToolResult>;
