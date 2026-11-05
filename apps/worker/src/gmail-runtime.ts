import { processCapturePublications, type Knex } from '@salesmora/data';
import { gmailDeliveryAuthority, gmailWorkerScopes, recordGmailWorkerReadiness } from '@salesmora/data/lead-capture/gmail-delivery';
import { captureGmailConfiguration, CaptureGmailProviderError, googleCaptureProvider } from '@salesmora/data/lead-capture/gmail-provider';
import { refreshCaptureGmailGrant } from '@salesmora/data/lead-capture/gmail-refresh';
import { googleCaptureMessages } from '@salesmora/data/lead-capture/gmail-messages-provider';
import { GmailSyncError, googleGmailSync } from '@salesmora/data/lead-capture/gmail-sync-provider';
import { startGmailCapture } from './gmail-capture.js';
import { gmailExtractor } from './gmail-extraction.js';

export async function startConfiguredGmailCapture(db: Knex, env: NodeJS.ProcessEnv = process.env) {
  const scopes = gmailWorkerScopes(env);
  const config = captureGmailConfiguration(env);
  const authority = gmailDeliveryAuthority(env);
  const key = env.OPENAI_API_KEY;
  if (!config || !authority.gmailOpen || !scopes.length || !key?.trim() ||
      scopes.some(scope => !config.workspaces.includes(scope.workspaceId)))
    throw Error('Configure scoped Gmail delivery, OAuth and AI credentials.');
  if (['LANGSMITH_TRACING', 'LANGCHAIN_TRACING_V2'].some(name => env[name] && env[name] !== 'false'))
    throw Error('Chat tracing must be disabled.');
  if (!await db.schema.hasTable('captureGmailWorkerReadiness'))
    throw Error('Apply the Gmail worker migrations before starting delivery.');

  const provider = googleCaptureProvider(config);
  await recordGmailWorkerReadiness(db, scopes);
  return startGmailCapture(db, scopes, {
    sync: googleGmailSync(),
    messages: googleCaptureMessages,
    extract: gmailExtractor(db, key),
    async grant(workspaceId, accountId) {
      try {
        const grant = await refreshCaptureGmailGrant(db, workspaceId, accountId, config, provider);
        if (!grant.accessToken) throw new GmailSyncError('authorization');
        return grant.accessToken;
      } catch (error) {
        if (error instanceof CaptureGmailProviderError && error.kind === 'authorization') throw new GmailSyncError('authorization');
        throw error;
      }
    },
    async beforeTick() {
      await recordGmailWorkerReadiness(db, scopes);
    },
    async beforeScope(scope) {
      await processCapturePublications(db, ['leadCapture.read', 'leadCapture.activate'],
        { websiteReady: async () => false, ...authority, scheduledType: 'gmail', scheduledSourceIds: scope.sourceIds },
        1, [scope.workspaceId]);
    },
  });
}
