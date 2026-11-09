import type { Knex } from 'knex';
import type { JobPeriodFilters } from '@salesmora/contracts';
import { AuthorizationAccessError } from '../authorization/store';

export function applyJobReportFilters(
  query: Knex.QueryBuilder,
  filters: JobPeriodFilters,
): Knex.QueryBuilder {
  if (filters.statuses.length) query.whereIn('j.status', filters.statuses);
  if (filters.owners.length) {
    query.andWhere(builder => {
      const ownerIds = filters.owners.filter(owner => owner !== 'unassigned')
        .map(owner => owner.slice('member:'.length));
      if (ownerIds.length) builder.whereIn('j.primaryOwnerId', ownerIds);
      if (filters.owners.includes('unassigned')) {
        if (ownerIds.length) builder.orWhereNull('j.primaryOwnerId');
        else builder.whereNull('j.primaryOwnerId');
      }
    });
  }
  if (filters.services.length) {
    query.andWhere(builder => {
      const serviceValues = filters.services.filter(service => service !== 'none')
        .map(service => service.slice('service:'.length));
      if (serviceValues.length) {
        builder.where(nested => {
          nested.whereRaw('btrim(j."service") = ?', [serviceValues[0]]);
          for (const service of serviceValues.slice(1)) {
            nested.orWhereRaw('btrim(j."service") = ?', [service]);
          }
        });
      }
      if (filters.services.includes('none')) {
        const blank = (nested: Knex.QueryBuilder) =>
          nested.whereNull('j.service').orWhereRaw('btrim(j."service") = ?', ['']);
        if (serviceValues.length) builder.orWhere(blank);
        else builder.where(blank);
      }
    });
  }
  return query;
}

export async function validateJobReportFilters(
  base: Knex.QueryBuilder,
  filters: JobPeriodFilters,
  trx: Knex.Transaction,
) {
  if (!filters.owners.length && !filters.services.length) return;
  const ownerRows = await base.clone().whereNotNull('j.primaryOwnerId')
    .distinct('j.primaryOwnerId').pluck('j.primaryOwnerId') as string[];
  const hasUnassigned = await base.clone().whereNull('j.primaryOwnerId').first('j.id');
  const serviceRows = await base.clone()
    .select(trx.raw(`CASE WHEN btrim(j."service") = '' THEN 'none' ELSE 'service:' || btrim(j."service") END AS "id"`))
    .distinct() as { id: string }[];
  const availableOwners = new Set([
    ...ownerRows.map(owner => `member:${owner}`),
    ...(hasUnassigned ? ['unassigned'] : []),
  ]);
  const availableServices = new Set(serviceRows.map(row => row.id));
  if (filters.owners.some(owner => !availableOwners.has(owner)) ||
    filters.services.some(service => !availableServices.has(service))) {
    throw new AuthorizationAccessError();
  }
}
