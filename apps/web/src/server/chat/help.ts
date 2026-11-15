import 'server-only';
import { authorize } from '@salesmora/domain';
import { createOpenAIEmbedder, retrieveHelp, readHelpArticle } from '@salesmora/data';
import { chatUsageRecorder } from './request-context';
import { authorizedWorkspace } from '../authorization/permissions';
/** Call only after admission; provider work/accounting must not hold a protected transaction. */
export async function embedHelpQuery(userId: string, workspaceId: string, query: string, signal?: AbortSignal, turnId?: string) {
  if (!query.trim() || query.length > 1000) throw Error('Invalid help query');
  const embedder = createOpenAIEmbedder(process.env.OPENAI_API_KEY, undefined, { recorder: chatUsageRecorder({ userId, workspaceId }, turnId), phase: 'query_embedding' });
  const [vector] = await embedder.embed([query], signal);
  return { vector, embedder };
}
/** No public search endpoint yet: the future runtime controls query/rate limits and tool availability. */
export async function searchAuthorizedHelp(userId: string, workspaceId: string, query: string, signal?: AbortSignal, turnId?: string) {
  if (!query.trim() || query.length > 1000) throw Error('Invalid help query');
  await authorizedWorkspace(userId, workspaceId, false, async (_trx, context) => {
    if (!authorize(context, { permission: 'assistant.use' }).allowed) throw Error('Help access denied');
  });
  const { vector, embedder } = await embedHelpQuery(userId, workspaceId, query, signal, turnId);
  // Reload membership and grants after provider latency; policy is locked during retrieval.
  return authorizedWorkspace(userId, workspaceId, false, (trx, context) => retrieveHelp(trx, context, vector, embedder));
}
export function currentHelpArticle(userId: string, workspaceId: string, slug: string, version: string) {
  return authorizedWorkspace(userId, workspaceId, false, (trx, context) => readHelpArticle(trx, context, slug, version));
}
