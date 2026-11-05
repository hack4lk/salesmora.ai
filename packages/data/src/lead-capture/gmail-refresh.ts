import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { CaptureDraftConflictError } from './store';
import { gmailClock, gmailScope, blockCaptureGmailSources } from './gmail-connections';
import { CaptureGmailProviderError, type CaptureGmailConfiguration, type CaptureGmailProvider } from './gmail-provider';

/** Internal server/worker boundary; callers must authorize the operation before requesting a grant. */
export async function refreshCaptureGmailGrant(db: Knex, workspaceId: string, accountId: string, config: CaptureGmailConfiguration, provider: CaptureGmailProvider) {
  gmailScope(config, workspaceId);
  const binding = { environment: config.environment, workspaceId, recordId: accountId };
  const claim = await db.transaction(async trx => {
    const workspace = await trx('workspaces').where({ id: workspaceId }).whereNull('deletionRequestedAt').whereNull('suspendedAt').forUpdate().first('id');
    const account = await trx('captureGmailAccounts').where({ id: accountId, workspaceId, status: 'connected' }).first();
    const credential = await trx('captureGmailCredentials').where({ workspaceId, accountId }).first();
    if (!workspace || !account || !credential || credential.generation !== account.credentialGeneration) throw new CaptureGmailProviderError('authorization');
    const tokens = config.cipher.openTokens(binding, credential.envelope), now = await gmailClock(trx);
    if (tokens.accessToken && tokens.expiresAt && new Date(tokens.expiresAt).getTime() > now.getTime() + 60000) return { cached: tokens, account };
    if (credential.refreshLeaseUntil && credential.refreshLeaseUntil > now) throw new CaptureGmailProviderError('temporary');
    const leaseId = randomUUID();
    await trx('captureGmailCredentials').where({ id: credential.id }).update({ refreshLeaseId: leaseId, refreshLeaseUntil: new Date(now.getTime() + 90000) });
    return { tokens, account, leaseId };
  });
  if ('cached' in claim && claim.cached) return claim.cached;
  if (!('tokens' in claim) || !claim.tokens || !claim.leaseId) throw new CaptureGmailProviderError();
  try {
    const grant = await provider.refresh(claim.tokens.refreshToken);
    if (grant.subject !== claim.account.providerSubject || grant.email.toLowerCase() !== claim.account.email.toLowerCase()) throw new CaptureGmailProviderError('authorization');
    const tokens = { ...grant.tokens, refreshToken: grant.tokens.refreshToken ?? claim.tokens.refreshToken };
    const envelope = config.cipher.sealTokens(binding, tokens);
    await db.transaction(async trx => {
      const workspace = await trx('workspaces').where({ id: workspaceId }).whereNull('deletionRequestedAt').whereNull('suspendedAt').forUpdate().first('id');
      const account = await trx('captureGmailAccounts').where({ id: accountId, workspaceId, status: 'connected', credentialGeneration: claim.account.credentialGeneration }).first('id');
      if (!workspace || !account) throw new CaptureDraftConflictError();
      const changed = await trx('captureGmailCredentials').where({ workspaceId, accountId, generation: claim.account.credentialGeneration, refreshLeaseId: claim.leaseId }).update({ envelope: JSON.stringify(envelope), refreshLeaseId: null, refreshLeaseUntil: null, updatedAt: trx.fn.now() });
      if (changed !== 1) throw new CaptureDraftConflictError();
    });
    return tokens;
  } catch (error) {
    await db.transaction(async trx => {
      if (!await trx('workspaces').where({ id: workspaceId }).forUpdate().first('id')) return;
      const credential = await trx('captureGmailCredentials').where({ workspaceId, accountId, generation: claim.account.credentialGeneration, refreshLeaseId: claim.leaseId }).first('id');
      if (!credential) return; // Disconnect/reconnect won; never overwrite its generation.
      await trx('captureGmailCredentials').where({ id: credential.id }).update({ refreshLeaseId: null, refreshLeaseUntil: null });
      if (error instanceof CaptureGmailProviderError && error.kind === 'authorization') {
        const account = await trx('captureGmailAccounts').where({ workspaceId, id: accountId, status: 'connected', credentialGeneration: claim.account.credentialGeneration }).first('version');
        if (!account) return;
        await trx('captureGmailAccounts').where({ workspaceId, id: accountId }).update({ status: 'reconnect-required', version: account.version + 1, updatedAt: trx.fn.now() });
        await blockCaptureGmailSources(trx, workspaceId, accountId, null);
        await trx('captureGmailConnectionEvents').insert({ id: randomUUID(), workspaceId, accountId, kind: 'authorization-lost', accountVersion: account.version + 1 });
      }
    });
    throw error instanceof CaptureGmailProviderError || error instanceof CaptureDraftConflictError ? error : new CaptureGmailProviderError('temporary');
  }
}
