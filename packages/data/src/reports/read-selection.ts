import type { Knex } from 'knex';
import { reportSelectionSchema, type AuthorizationContext, type ReportSelection, type ReportNativeRead } from '@salesmora/contracts';
import { AuthorizationAccessError } from '../authorization/store';
import { readLeadReportWithAuthorityInTransaction } from './lead-read';
import { readLeadSourceReportWithAuthorityInTransaction } from './lead-source-read';
import { readBusinessOverviewWithAuthorityInTransaction } from './business-overview-read';
import { readCalendarReportWithAuthorityInTransaction } from './calendar-read';
import { readJobReportWithAuthorityInTransaction } from './job-read';
import { readTeamReportWithAuthorityInTransaction } from './team-read';
import { readEstimateReportWithAuthorityInTransaction } from './estimate-read';
import { readActivityReportWithAuthorityInTransaction } from './activity-read';
import { readFinancialReportWithAuthorityInTransaction } from './financial-read';

/** Templates and assistant reads share exact native dispatch and selected-capability checks. */
export async function readReportSelectionInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, raw: ReportSelection,
): Promise<ReportNativeRead> {
  const selection = reportSelectionSchema.parse(raw);
  if (selection.query.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  switch (selection.area) {
    case 'overview': return { area: selection.area, read: await readBusinessOverviewWithAuthorityInTransaction(trx, context, selection.query) };
    case 'leads': return { area: selection.area, read: await readLeadReportWithAuthorityInTransaction(trx, context, selection.query) };
    case 'sources': {
      const read = await readLeadSourceReportWithAuthorityInTransaction(trx, context, selection.query);
      if (selection.query.selected === 'converted' && !read.canReadConversion ||
        selection.query.selected === 'accepted-estimates' && !read.canReadAcceptedValue) throw new AuthorizationAccessError();
      return { area: selection.area, read };
    }
    case 'calendar': return { area: selection.area, read: await readCalendarReportWithAuthorityInTransaction(trx, context, selection.query) };
    case 'jobs': return { area: selection.area, read: await readJobReportWithAuthorityInTransaction(trx, context, selection.query) };
    case 'team': return { area: selection.area, read: await readTeamReportWithAuthorityInTransaction(trx, context, selection.query) };
    case 'estimates': {
      const read = await readEstimateReportWithAuthorityInTransaction(trx, context, selection.query);
      if (selection.query.view === 'estimate-current' && selection.query.selected === 'handoff' && !read.authority.handoff) {
        throw new AuthorizationAccessError();
      }
      return { area: selection.area, read };
    }
    case 'activity': return { area: selection.area, read: await readActivityReportWithAuthorityInTransaction(trx, context, selection.query) };
    case 'financial': {
      const read = await readFinancialReportWithAuthorityInTransaction(trx, context, selection.query);
      if (selection.query.selected === 'materials' ? read.reports.materials.costs.kind === 'unavailable'
        : read.reports[selection.query.selected].estimates.kind === 'unavailable') throw new AuthorizationAccessError();
      return { area: selection.area, read };
    }
  }
}
