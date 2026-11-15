import type { Knex } from 'knex';
import type { EstimateReportFilters } from '@salesmora/contracts';
import { AuthorizationAccessError } from '../authorization/store';

export const estimateReportOwnerSQL = `CASE WHEN EXISTS (
  SELECT 1 FROM "workspaceMemberships" m WHERE m."workspaceId" = e."workspaceId" AND m."userId" = e."ownerId"
) THEN 'member:' || e."ownerId" ELSE 'unassigned' END`;

export function applyEstimateReportFilters(query: Knex.QueryBuilder, filters: EstimateReportFilters) {
  if (filters.owners.length > 0) query.whereRaw(
    `${estimateReportOwnerSQL} IN (${filters.owners.map(() => '?').join(', ')})`, filters.owners);
  if (filters.parents.length > 0) query.whereIn('e.parentType', filters.parents);
  return query;
}

export async function validateEstimateReportFilters(
  population: Knex.QueryBuilder, filters: EstimateReportFilters, trx: Knex.Transaction,
) {
  if (filters.owners.length === 0 && filters.parents.length === 0) return;
  const options = await population.clone().clearSelect().clearOrder()
    .distinct(trx.raw(`${estimateReportOwnerSQL} AS "ownerKey"`), 'e.parentType') as { ownerKey: string; parentType: string }[];
  if (filters.owners.some(owner => !options.some(option => option.ownerKey === owner)) ||
    filters.parents.some(parent => !options.some(option => option.parentType === parent))) throw new AuthorizationAccessError();
}
