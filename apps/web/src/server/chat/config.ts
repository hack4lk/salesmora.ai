import 'server-only';
import { isFeatureFlagEnabled } from '@salesmora/data';
import { database } from '../workspaces/store';
import { testChatProviderEnabled } from './test-provider';
/** Explicit opt-in; a credential alone never enables conversation generation. */
export function liveChatEnabled() {
  return process.env.CHAT_ENABLED === 'true' && process.env.CHAT_MODEL === 'gpt-6-luna' &&
    !!process.env.OPENAI_API_KEY?.trim() &&
    !['LANGSMITH_TRACING', 'LANGCHAIN_TRACING_V2'].some(key => process.env[key] && process.env[key] !== 'false');
}
export function chatRuntimeAvailable() { return testChatProviderEnabled() || liveChatEnabled(); }
export async function workspaceChatAvailable(workspaceId: string) {
  return chatRuntimeAvailable() && await isFeatureFlagEnabled(database(), 'chat.enabled', workspaceId);
}
