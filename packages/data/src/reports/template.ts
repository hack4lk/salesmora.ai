import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { reportTemplateAreaSchema, reportTemplateConfigurationSchema, reportTemplateCreateSchema, reportTemplateDeleteSchema,
  reportTemplateSchema, reportTemplateUpdateSchema, leadReportQuerySchema, leadSourceQuerySchema, businessOverviewQuerySchema,
  calendarReportQuerySchema, jobReportQuerySchema, teamReportQuerySchema, estimateReportQuerySchema,
  activityReportQuerySchema, financialReportQuerySchema, type AuthorizationContext,
  type ReportTemplate, type ReportTemplateConfiguration } from '@salesmora/contracts';
import { resolveAuthorizedCollectionScope, resolveReportPeriod } from '@salesmora/domain';
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

export class ReportTemplateConflictError extends Error {
  constructor() { super('The template changed or its name is already in use. Reload and try again.'); }
}
function requireRead(context: AuthorizationContext, workspaceId: string) {
  if (workspaceId !== context.workspaceId || !resolveAuthorizedCollectionScope(context, 'reports.read').allowed) {
    throw new AuthorizationAccessError();
  }
}
function parseRow(row: Record<string, unknown>): ReportTemplate {
  return reportTemplateSchema.parse({ ...row,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt });
}
function owned(trx: Knex.Transaction, context: AuthorizationContext) {
  return trx('reportTemplates').where({ workspaceId: context.workspaceId, ownerId: context.userId });
}
async function selected(trx: Knex.Transaction, context: AuthorizationContext, id: string) {
  const row = await owned(trx, context).where({ id }).first('id', 'workspaceId', 'area', 'name', 'configuration',
    'version', 'createdAt', 'updatedAt');
  if (!row) throw new AuthorizationAccessError();
  return parseRow(row);
}
export async function listReportTemplatesInTransaction(trx: Knex.Transaction, context: AuthorizationContext, area: string) {
  requireRead(context, context.workspaceId);
  const parsed = reportTemplateAreaSchema.parse(area);
  const rows = await owned(trx, context).where({ area: parsed }).orderBy('name')
    .select('id', 'workspaceId', 'area', 'name', 'configuration', 'version', 'createdAt', 'updatedAt');
  return rows.map(parseRow);
}
async function resolveQuery(trx: Knex.Transaction, context: AuthorizationContext, raw: ReportTemplateConfiguration) {
  const configuration = reportTemplateConfigurationSchema.parse(raw);
  const workspace = await trx('workspaces').where({ id: context.workspaceId })
    .select(trx.raw(`to_char(CURRENT_TIMESTAMP AT TIME ZONE timezone, 'YYYY-MM-DD') AS today`)).first();
  if (typeof workspace?.today !== 'string') throw new Error('The report template clock is unavailable.');
  const resolved = configuration.period && resolveReportPeriod(configuration.period, workspace.today,
    configuration.area === 'calendar' ? 'calendar' : 'history');
  if (resolved && !resolved.range) throw new RangeError('The template period is invalid.');
  const query = { ...configuration.query, workspaceId: context.workspaceId,
    ...(configuration.area === 'overview' ? {} : { page: 1, pageSize: 25 }),
    ...(resolved?.range ? { period: { from: resolved.range.from, to: resolved.range.to } } : {}) };
  return { configuration, query };
}
/** Runs the actual report reader under current workspace authorization, never stored results or grants. */
export async function runReportTemplateConfigurationInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, raw: ReportTemplateConfiguration,
) {
  requireRead(context, context.workspaceId);
  const { configuration, query } = await resolveQuery(trx, context, raw);
  switch (configuration.area) {
    case 'overview': return readBusinessOverviewWithAuthorityInTransaction(trx, context, businessOverviewQuerySchema.parse(query));
    case 'leads': return readLeadReportWithAuthorityInTransaction(trx, context, leadReportQuerySchema.parse(query));
    case 'sources': {
      const parsed = leadSourceQuerySchema.parse(query);
      const result = await readLeadSourceReportWithAuthorityInTransaction(trx, context, parsed);
      if (parsed.selected === 'converted' && !result.canReadConversion ||
        parsed.selected === 'accepted-estimates' && !result.canReadAcceptedValue) throw new AuthorizationAccessError();
      return result;
    }
    case 'calendar': return readCalendarReportWithAuthorityInTransaction(trx, context, calendarReportQuerySchema.parse(query));
    case 'jobs': return readJobReportWithAuthorityInTransaction(trx, context, jobReportQuerySchema.parse(query));
    case 'team': return readTeamReportWithAuthorityInTransaction(trx, context, teamReportQuerySchema.parse(query));
    case 'estimates': {
      const parsed = estimateReportQuerySchema.parse(query);
      const result = await readEstimateReportWithAuthorityInTransaction(trx, context, parsed);
      if (parsed.view === 'estimate-current' && parsed.selected === 'handoff' && !result.authority.handoff) {
        throw new AuthorizationAccessError();
      }
      return result;
    }
    case 'activity': return readActivityReportWithAuthorityInTransaction(trx, context, activityReportQuerySchema.parse(query));
    case 'financial': {
      const parsed = financialReportQuerySchema.parse(query);
      const result = await readFinancialReportWithAuthorityInTransaction(trx, context, parsed);
      if (parsed.selected === 'materials' ? result.reports.materials.costs.kind === 'unavailable'
        : result.reports[parsed.selected].estimates.kind === 'unavailable') throw new AuthorizationAccessError();
      return result;
    }
  }
}
export async function createReportTemplateInTransaction(trx: Knex.Transaction, context: AuthorizationContext, raw: unknown) {
  const input = reportTemplateCreateSchema.parse(raw);
  requireRead(context, input.workspaceId);
  await runReportTemplateConfigurationInTransaction(trx, context, input.configuration);
  const id = randomUUID();
  try {
    await trx('reportTemplates').insert({ id, workspaceId: context.workspaceId, ownerId: context.userId,
      area: input.configuration.area, name: input.name, configuration: JSON.stringify(input.configuration) });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') throw new ReportTemplateConflictError();
    throw error;
  }
  return selected(trx, context, id);
}
export async function updateReportTemplateInTransaction(trx: Knex.Transaction, context: AuthorizationContext, id: string, raw: unknown) {
  const input = reportTemplateUpdateSchema.parse(raw);
  requireRead(context, input.workspaceId);
  const existing = await selected(trx, context, id);
  if (existing.version !== input.version) throw new ReportTemplateConflictError();
  if (input.configuration) {
    if (input.configuration.area !== existing.area) throw new RangeError('A template cannot change report area.');
    await runReportTemplateConfigurationInTransaction(trx, context, input.configuration);
  }
  try {
    const changed = await owned(trx, context).where({ id, version: input.version }).update({
      ...(input.name === undefined ? {} : { name: input.name }),
      ...(input.configuration === undefined ? {} : { configuration: JSON.stringify(input.configuration) }),
      version: input.version + 1, updatedAt: trx.fn.now(),
    });
    if (changed !== 1) throw new ReportTemplateConflictError();
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') throw new ReportTemplateConflictError();
    throw error;
  }
  return selected(trx, context, id);
}
export async function deleteReportTemplateInTransaction(trx: Knex.Transaction, context: AuthorizationContext, id: string, raw: unknown) {
  const input = reportTemplateDeleteSchema.parse(raw);
  requireRead(context, input.workspaceId);
  const existing = await selected(trx, context, id);
  if (existing.version !== input.version) throw new ReportTemplateConflictError();
  if (await owned(trx, context).where({ id, version: input.version }).delete() !== 1) throw new ReportTemplateConflictError();
}
export async function runReportTemplateInTransaction(trx: Knex.Transaction, context: AuthorizationContext, id: string) {
  requireRead(context, context.workspaceId);
  const template = await selected(trx, context, id);
  const result = await runReportTemplateConfigurationInTransaction(trx, context, template.configuration);
  return { template, result };
}
