import { chatProposalFamilies, type AuthorizationContext, type ChatProposalFamily } from '@salesmora/contracts';
import { AuthorizationAccessError, readProposalHistory, type Knex } from '@salesmora/data';
export type ProposalKind = ChatProposalFamily;
export const proposalKinds = chatProposalFamilies;
type ProposalState = 'pending' | 'confirmed' | 'cancelled' | 'superseded';

/** Discovery and recorded state only; review/confirmation authorization stays in the native helpers. */
export async function readHistoryProposalPresence(
  trx: Knex,
  identity: { userId: string; workspaceId: string },
  turnIds: readonly string[],
  families?: ReadonlyMap<string, unknown>,
  authority?: AuthorizationContext,
) {
  const present = new Map<string, Set<ProposalKind>>();
  const covered = new Set(turnIds);
  const states = new Map<string, Map<ProposalKind, ProposalState>>();
  for (const id of turnIds) {
    const value = families?.get(id);
    if (value == null) continue;
    if (!Array.isArray(value) || value.some(kind => typeof kind !== 'string' || !proposalKinds.some(candidate => candidate === kind)))
      throw new AuthorizationAccessError();
  }
  if (!authority || !trx.isTransaction || authority.userId !== identity.userId || authority.workspaceId !== identity.workspaceId)
    throw new AuthorizationAccessError();
  for (const row of await readProposalHistory(trx as Knex.Transaction, authority, turnIds, families)) {
    const kinds = present.get(row.turnId) ?? new Set<ProposalKind>();
    kinds.add(row.family); present.set(row.turnId, kinds);
    const byKind = states.get(row.turnId) ?? new Map<ProposalKind, ProposalState>();
    byKind.set(row.family, row.state); states.set(row.turnId, byKind);
  }
  return Object.assign((turnId: string, kind: ProposalKind) => present.get(turnId)?.has(kind) ?? false, {
    covers: (turnId: string) => covered.has(turnId),
    states: (turnId: string) => [...states.get(turnId) ?? []].map(([family, state]) => ({ family, state })),
  });
}
