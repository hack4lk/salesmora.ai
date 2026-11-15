import type { ChatProposalFamily } from '@salesmora/contracts';
import type { Knex } from '@salesmora/data';

export async function readFixtureProposal(
  db: Knex, family: ChatProposalFamily, selector: { id?: string; workspaceId?: string; userId?: string },
) {
  return db('chatProposals').where({ family, ...selector }).orderBy('createdAt', 'desc').first();
}

export async function readFixtureProposalAudit(db: Knex, family: ChatProposalFamily, proposalId: string) {
  return db('chatProposalAudit').where({ family, proposalId }).orderBy('createdAt');
}
