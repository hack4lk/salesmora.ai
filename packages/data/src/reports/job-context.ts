import type { Knex } from 'knex';
import type { AuthorizationContext } from '@salesmora/contracts';
import { resolveAuthorizedCollectionScope } from '@salesmora/domain';
import { AuthorizationAccessError } from '../authorization/store';
import { scopedJobQuery } from '../jobs/query';

export async function jobReportContext(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  forceAssigned = false,
) {
  const report = resolveAuthorizedCollectionScope(context, 'reports.read');
  if (!report.allowed || report.resourceKind !== 'report' || !report.sourceScopes?.job) {
    throw new AuthorizationAccessError();
  }
  const { query, scope } = scopedJobQuery(trx, context, forceAssigned || report.sourceScopes.job === 'assigned');
  const workspace = await trx('workspaces').where({ id: context.workspaceId }).first('timezone');
  if (typeof workspace?.timezone !== 'string' || !workspace.timezone.trim()) {
    throw new Error('Workspace timezone is unavailable for the Jobs report.');
  }
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: workspace.timezone }).format();
  } catch (error) {
    if (error instanceof RangeError) {
      throw new Error('Workspace timezone is invalid for the Jobs report.', { cause: error });
    }
    throw error;
  }
  const clock = await trx.raw(
    `SELECT CURRENT_TIMESTAMP AS "asOf",
      to_char(CURRENT_TIMESTAMP AT TIME ZONE ?, 'YYYY-MM-DD') AS "today"`,
    [workspace.timezone],
  );
  const asOf = clock.rows[0]?.asOf instanceof Date
    ? clock.rows[0].asOf
    : new Date(clock.rows[0]?.asOf);
  const today = clock.rows[0]?.today;
  if (!Number.isFinite(asOf.getTime()) || typeof today !== 'string') {
    throw new Error('The database clock could not be resolved for the Jobs report.');
  }
  const scopeLabel = scope === 'assigned'
    ? 'Jobs where you are the current primary owner or a current supporting team member.'
    : 'All Jobs authorized by current workspace access.';
  return { query, scope, timezone: workspace.timezone, asOf, today, scopeLabel };
}
