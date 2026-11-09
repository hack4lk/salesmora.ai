import type { Knex } from 'knex';
import { leadSourceQuerySchema, leadSourceReadResultSchema,
  type AuthorizationContext, type LeadSourceQuery, type LeadSourceReadResult } from '@salesmora/contracts';
import { addCalendarDays } from '@salesmora/domain';
import { readLeadSourceReportInTransaction } from './lead-source';
import { resolveLeadSourceExportAccess } from './lead-source-export-access';
import { leadReportContext } from './leads';

/** Authority flags reflect native availability; invalid frozen money does not revoke money access. */
export async function readLeadSourceReportWithAuthorityInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, rawQuery: LeadSourceQuery,
): Promise<LeadSourceReadResult> {
  const query = leadSourceQuerySchema.parse(rawQuery);
  const report = await readLeadSourceReportInTransaction(trx, context, query);
  return leadSourceReadResultSchema.parse({
    workspaceId: context.workspaceId, viewerId: context.userId, policyRevision: context.policy.revision,
    scope: report.scope, archiveVisibility: report.archiveVisibility, query, report,
    canReadConversion: report.conversion.kind === 'available',
    canReadAcceptedValue: report.acceptedValue.kind === 'available' || report.acceptedValue.reason === 'invalid-money',
    canExport: resolveLeadSourceExportAccess(context) !== null,
  });
}

export async function initialLeadSourceReportWithAuthorityInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext,
): Promise<LeadSourceReadResult> {
  const { today } = await leadReportContext(trx, context);
  return readLeadSourceReportWithAuthorityInTransaction(trx, context, {
    workspaceId: context.workspaceId, view: 'lead-source', period: { from: addCalendarDays(today, -29), to: today },
    selected: 'cohort', page: 1, pageSize: 25,
  });
}
