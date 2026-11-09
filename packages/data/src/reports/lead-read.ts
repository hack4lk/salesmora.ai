import type { Knex } from 'knex';
import { leadReportQuerySchema, leadReportReadResultSchema, leadSources, leadStages,
  type LeadReportQuery, type AuthorizationContext, type LeadReportReadResult } from '@salesmora/contracts';
import { readLeadReportInTransaction, leadReportContext } from './leads';
import { resolveLeadReportExportScope } from './lead-export-access';

const stageLabels = { new: 'New', contacted: 'Contacted', 'estimate-sent': 'Estimate sent', won: 'Won', lost: 'Lost' };
const sourceLabels = { website: 'Website', referral: 'Referral', phone: 'Phone', gmail: 'Gmail', other: 'Other' };
/** Session-bound callers receive facets and a native projection under the same authorized transaction. */
export async function readLeadReportWithAuthorityInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, rawQuery: LeadReportQuery,
): Promise<LeadReportReadResult> {
  const query = leadReportQuerySchema.parse(rawQuery);
  const report = await readLeadReportInTransaction(trx, context, query);
  const auth = await leadReportContext(trx, context);
  const owners = [{ value: 'me', label: 'Me' }, { value: 'unassigned', label: 'No current primary owner' }];
  if (auth.scope === 'workspace') {
    const members = await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId')
      .where('m.workspaceId', context.workspaceId).whereNull('u.deletionRequestedAt')
      .orderBy('u.name').orderBy('u.id').select<{ id: string; label: string }[]>('u.id', 'u.name as label');
    owners.push(...members.map(member => ({ value: member.id, label: member.label })));
  }
  return leadReportReadResultSchema.parse({ workspaceId: context.workspaceId, viewerId: context.userId,
    policyRevision: context.policy.revision, scope: auth.scope, exportScope: resolveLeadReportExportScope(context),
    archiveVisibility: auth.archiveVisibility, query, report,
    options: { stages: leadStages.map(value => ({ value, label: stageLabels[value] })),
      sources: leadSources.map(value => ({ value, label: sourceLabels[value] })), owners } });
}
