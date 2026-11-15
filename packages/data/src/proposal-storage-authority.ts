import type { Knex } from 'knex';
import { z } from 'zod';
import type { ChatProposalFamily } from '@salesmora/contracts';

export const legacyProposalSources = [
  ['action', 'chatActionDrafts', 'chatActionAudit'],
  ['estimateDraft', 'chatEstimateDrafts', 'chatEstimateDraftAudit'],
  ['estimateSharing', 'chatEstimateShares', 'chatEstimateShareAudit'],
  ['estimateDecision', 'chatEstimateDecisions', 'chatEstimateDecisionAudit'],
  ['estimateDraftAction', 'chatEstimateDraftActions', 'chatEstimateDraftActionAudit'],
  ['estimateVoid', 'chatEstimateVoids', 'chatEstimateVoidAudit'],
  ['estimateArchive', 'chatEstimateArchives', 'chatEstimateArchiveAudit'],
  ['estimateDraftDelete', 'chatEstimateDraftDeletes', 'chatEstimateDraftDeleteAudit'],
  ['estimateConversion', 'chatEstimateConversions', 'chatEstimateConversionAudit'],
  ['calendar', 'chatCalendarProposals', 'chatCalendarProposalAudit'],
  ['captureSetup', 'chatCaptureSetupProposals', 'chatCaptureSetupAudit'],
  ['captureSource', 'chatCaptureSourceProposals', 'chatCaptureSourceAudit'],
  ['customer', 'chatCustomerDrafts', null],
  ['workOrder', 'chatWorkOrderDrafts', null],
] as const satisfies readonly (readonly [ChatProposalFamily, string, string | null])[];

export const proposalStorageAuthoritySchema = z.object({
  id: z.literal(1), store: z.enum(['legacy', 'canonical']), contractVersion: z.literal(1),
});
type Store = z.infer<typeof proposalStorageAuthoritySchema>['store'];
const deployment = globalThis as typeof globalThis & { proposalStorageAuthority?: Store };

/** Once per process start, before serving traffic or starting workers; never a per-turn lookup. */
export async function initializeProposalStorage(db: Knex) {
  if (db.isTransaction) throw new Error('Proposal storage initialization requires a committed database connection.');
  const authority = proposalStorageAuthoritySchema.parse(await db('chatProposalStorage').where({ id: 1 }).first());
  if (authority.store !== 'canonical')
    throw new Error('This release requires canonical proposal storage; legacy storage is not supported.');
  for (const table of ['checkpoint_blobs', 'checkpoint_writes', 'checkpoints', 'checkpoint_migrations']) {
    if (await db.schema.hasTable(table))
      throw new Error('This release requires the graph checkpoint retirement migration before startup.');
  }
  if (deployment.proposalStorageAuthority !== undefined && deployment.proposalStorageAuthority !== authority.store)
    throw new Error('Proposal storage authority changed; drain and restart this process.');
  deployment.proposalStorageAuthority = authority.store;
  return authority.store;
}

export const canonicalProposalStorageInitialized = () => deployment.proposalStorageAuthority === 'canonical';
