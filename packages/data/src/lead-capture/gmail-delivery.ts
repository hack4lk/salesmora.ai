import type { Knex } from 'knex';
import { captureIdSchema } from '@salesmora/contracts';
import { captureGmailConfiguration, googleCaptureProvider } from './gmail-provider';
import { refreshCaptureGmailGrant } from './gmail-refresh';
import { googleGmailSync } from './gmail-sync-provider';
import { openGmailEligibilityWindow, type GmailWorkerScope } from './gmail-sync-store';
import type { CaptureDeliveryAuthority } from './publication';

export function gmailWorkerScopes(env: Record<string, string | undefined>): GmailWorkerScope[] {
  if (env.CAPTURE_GMAIL_DELIVERY_ENABLED !== 'true') return [];
  const pairs = (env.CAPTURE_GMAIL_DELIVERY_SOURCES ?? '').split(',').map(value => value.trim());
  const grouped = new Map<string, string[]>();
  if (pairs.length > 100) throw Error('Invalid Gmail delivery scope.');
  for (const pair of pairs) {
    const [workspaceId, sourceId, extra] = pair.split(':');
    if (extra !== undefined || !captureIdSchema.safeParse(workspaceId).success || !captureIdSchema.safeParse(sourceId).success)
      throw Error('Invalid Gmail delivery scope.');
    const ids = grouped.get(workspaceId) ?? [];
    if (ids.includes(sourceId)) throw Error('Duplicate Gmail delivery source.');
    grouped.set(workspaceId, [...ids, sourceId]);
  }
  return [...grouped].map(([workspaceId, sourceIds]) => ({ workspaceId, sourceIds }));
}

export async function recordGmailWorkerReadiness(db: Knex, scopes: readonly GmailWorkerScope[]) {
  const rows = scopes.flatMap(scope => scope.sourceIds.map(sourceId => ({ workspaceId: scope.workspaceId, sourceId, checkedAt: db.raw('clock_timestamp()') })));
  if (rows.length) await db('captureGmailWorkerReadiness').insert(rows).onConflict(['workspaceId', 'sourceId']).merge(['checkedAt']);
}

export function gmailDeliveryAuthority(env: Record<string, string | undefined>): Pick<CaptureDeliveryAuthority, 'gmailReady' | 'gmailBaseline' | 'gmailOpen'> {
  const disabled = { gmailReady: async () => false };
  try {
    const scopes = gmailWorkerScopes(env);
    if (!scopes.length) return disabled;
    const config = captureGmailConfiguration(env);
    if (!config) return disabled;
    const scopeFor = (workspaceId: string, sourceId: string) =>
      scopes.find(scope => scope.workspaceId === workspaceId && scope.sourceIds.includes(sourceId) && config.workspaces.includes(workspaceId));
    return {
      async gmailReady(trx, workspaceId, sourceId, configuration) {
        if (!scopeFor(workspaceId, sourceId) || configuration.type !== 'gmail' || !configuration.connectionId) return false;
        if (!await trx.schema.hasTable('captureGmailWorkerReadiness')) return false;
        const ready = await trx('captureGmailWorkerReadiness').where({ workspaceId, sourceId })
          .whereRaw('"checkedAt" > clock_timestamp() - interval \'120 seconds\'').first('sourceId');
        if (!ready) return false;
        const account = await trx('captureGmailAccounts as a')
          .join('captureGmailCredentials as c', function () {
            this.on('a.id', '=', 'c.accountId').andOn('a.workspaceId', '=', 'c.workspaceId').andOn('a.credentialGeneration', '=', 'c.generation');
          })
          .where({ 'a.workspaceId': workspaceId, 'a.id': configuration.connectionId, 'a.status': 'connected', 'a.email': configuration.accountEmail })
          .first('a.id');
        return !!account;
      },
      async gmailBaseline(db, workspaceId, accountId) {
        const grant = await refreshCaptureGmailGrant(db, workspaceId, accountId, config, googleCaptureProvider(config));
        if (!grant.accessToken) throw Error('Gmail connection unavailable.');
        return (await googleGmailSync().profile(grant.accessToken)).historyId;
      },
      async gmailOpen(trx, workspaceId, sourceId, baseline) {
        const scope = scopeFor(workspaceId, sourceId);
        if (!scope) throw Error('Gmail delivery scope unavailable.');
        await openGmailEligibilityWindow(trx, scope, sourceId, baseline);
      },
    };
  } catch {
    return disabled;
  }
}
