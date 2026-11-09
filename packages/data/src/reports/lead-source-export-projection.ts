import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { z } from 'zod';
import {
  leadSourceExportColumns,
  leadSourceExportInputSchema,
  leadSources,
  type AuthorizationContext,
  type LeadSourceExportInput,
} from '@salesmora/contracts';
import { AuthorizationAccessError } from '../authorization/store';
import { scopedJobQuery } from '../jobs/query';
import { estimateReportContext } from './estimate-context';
import { leadReportContext } from './leads';
import { canExportLeadSourceDataset, resolveLeadSourceExportAccess } from './lead-source-export-access';
import {
  readLeadSourceReportInTransaction,
  sourceJobNumberLabelExpression,
  sourceLeadCohortQuery,
  sourceLeadNumberLabelExpression,
} from './lead-source';
import { sourceAcceptedEstimatesQuery, sourceEstimateEvidence } from './source-estimates';

const currency = 'USD';
const coverage = 'Current editable Lead source and business state as of the report snapshot.';

const cohortRowSchema = z.object({
  id: z.uuid(),
  label: z.string().trim().min(1),
  createdDate: z.iso.date(),
  source: z.enum(leadSources),
  archived: z.boolean(),
  linkedJobNumbers: z.string().optional(),
}).strict();

function cohortRowsQuery(trx: Knex.Transaction, context: AuthorizationContext, input: LeadSourceExportInput) {
  return leadReportContext(trx, context).then(auth => {
    const cohort = sourceLeadCohortQuery(trx, auth, input.query.period).toSQL();
    const conversion = input.dataset === 'converted';
    const jobs = conversion ? scopedJobQuery(trx, context).query
      .whereIn('j.sourceLeadId', trx.select('id').from('cohort'))
      .select('j.sourceLeadId')
      .select(trx.raw(`string_agg(${sourceJobNumberLabelExpression()},
        ', ' ORDER BY j."jobNumber", j.id) AS "linkedJobNumbers"`))
      .groupBy('j.sourceLeadId').toSQL() : undefined;
    return {
      sql: `WITH cohort AS MATERIALIZED (${cohort.sql})
        ${jobs ? `, linkedJobs AS MATERIALIZED (${jobs.sql})` : ''}
        SELECT l.id::text, ${sourceLeadNumberLabelExpression()} || ' / ' || l.name AS label,
          to_char(l."createdAt" AT TIME ZONE ?, 'YYYY-MM-DD') AS "createdDate",
          l.source, l."archivedAt" IS NOT NULL AS archived
          ${jobs ? ', j."linkedJobNumbers"' : ''}
        FROM cohort l ${jobs ? 'JOIN linkedJobs j ON j."sourceLeadId" = l.id' : ''}
        ORDER BY l."createdAt", l.id`,
      bindings: [...cohort.bindings, ...(jobs?.bindings ?? []), auth.timezone],
    };
  });
}

function acceptedRowsQuery(trx: Knex.Transaction, context: AuthorizationContext, input: LeadSourceExportInput) {
  return leadReportContext(trx, context).then(async auth => {
    const estimates = await estimateReportContext(trx, context);
    if (estimates.assigned || !estimates.includeArchived) throw new AuthorizationAccessError();
    const cohort = sourceLeadCohortQuery(trx, auth, input.query.period).toSQL();
    const accepted = sourceAcceptedEstimatesQuery(trx, estimates.query, auth.timezone).toSQL();
    return {
      sql: `WITH cohort AS MATERIALIZED (${cohort.sql}), accepted AS MATERIALIZED (${accepted.sql})
        SELECT * FROM accepted ORDER BY "acceptedDate" DESC, id`,
      bindings: [...cohort.bindings, ...accepted.bindings],
      today: auth.today,
    };
  });
}

function safeCount(value: number) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError('Sources CSV row count exceeds the safe integer range.');
  }
  return value;
}

function sourceGroupRows(
  input: LeadSourceExportInput,
  report: Awaited<ReturnType<typeof readLeadSourceReportInTransaction>>,
  access: NonNullable<ReturnType<typeof resolveLeadSourceExportAccess>>,
) {
  const conversionAvailable = access.conversion.kind === 'available' && report.conversion.kind === 'available';
  const acceptedAvailable = access.acceptedValue.kind === 'available' && report.acceptedValue.kind === 'available';
  const conversionCoverage = conversionAvailable ? 'complete' : 'unavailable_permissions';
  const acceptedCoverage = acceptedAvailable ? 'complete'
    : report.acceptedValue.kind === 'unavailable' && report.acceptedValue.reason === 'invalid-money'
      ? 'invalid_money' : 'unavailable_permissions';
  const common = [
    'lead-source', input.dataset, 'lead-creation-cohort', input.query.period.from, input.query.period.to,
    report.asOf, report.timezone, report.scope, report.archiveVisibility, coverage,
  ];
  const rows: (string | number | null)[][] = report.groups.map(group => [
    ...common, 'source', group.source, group.cohort, conversionAvailable ? group.converted : null,
    conversionCoverage, acceptedAvailable ? group.acceptedEstimateCount : null,
    acceptedAvailable ? group.acceptedValueCents : null,
    acceptedAvailable ? currency : null, acceptedCoverage,
  ]);
  if (acceptedAvailable && report.acceptedValue.kind === 'available') rows.push([
    ...common, 'unattributed', null, null, null, conversionCoverage,
    report.acceptedValue.unattributedCount, report.acceptedValue.unattributedPreTaxCents, currency, acceptedCoverage,
  ]);
  return rows;
}

/** Builds unpaged evidence from the same authorized native cohort and attribution readers as Sources. */
export async function prepareLeadSourceCSVProjectionInTransaction(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  raw: LeadSourceExportInput,
) {
  const input = leadSourceExportInputSchema.parse(raw);
  if (input.query.workspaceId !== context.workspaceId) throw new AuthorizationAccessError();
  const resolvedAccess = resolveLeadSourceExportAccess(context);
  if (!resolvedAccess || !canExportLeadSourceDataset(resolvedAccess, input.dataset)) {
    throw new AuthorizationAccessError();
  }
  const access: NonNullable<ReturnType<typeof resolveLeadSourceExportAccess>> = resolvedAccess;
  const selected = input.dataset === 'converted' ? 'converted'
    : input.dataset === 'accepted-estimates' ? 'accepted-estimates' : 'cohort';
  const keepJobsRead = input.dataset === 'converted' || input.dataset === 'accepted-estimates' ||
    input.dataset === 'source-groups' && access.conversion.kind === 'available';
  const keepEstimatesRead = input.dataset === 'accepted-estimates' ||
    input.dataset === 'source-groups' && access.acceptedValue.kind === 'available';
  const reportContext = {
    ...context,
    enabledPermissions: context.enabledPermissions.filter(permission =>
      (keepJobsRead || permission !== 'jobs.read') &&
      (keepEstimatesRead || permission !== 'estimates.read')),
  };
  const report = await readLeadSourceReportInTransaction(trx, reportContext, {
    ...input.query, selected, page: 1, pageSize: 100,
  });
  const projectConversion = input.dataset === 'converted' || input.dataset === 'accepted-estimates' ||
    input.dataset === 'source-groups' && access.conversion.kind === 'available';
  if (projectConversion && access.conversion.kind === 'available' && report.conversion.kind !== 'available') {
    throw new Error('The Sources export conversion authority and native projection disagree.');
  }
  const projectAcceptedValue = input.dataset === 'accepted-estimates' ||
    input.dataset === 'source-groups' && access.acceptedValue.kind === 'available';
  if (projectAcceptedValue && access.acceptedValue.kind === 'available' && report.acceptedValue.kind === 'unavailable' &&
    report.acceptedValue.reason === 'permissions') {
    throw new Error('The Sources export accepted-value authority and native projection disagree.');
  }
  const columns = leadSourceExportColumns(input);
  const count = input.dataset === 'source-groups'
    ? safeCount(leadSources.length + Number(access.acceptedValue.kind === 'available' &&
      report.acceptedValue.kind === 'available'))
    : input.dataset === 'cohort' ? report.cohort
      : input.dataset === 'converted'
        ? report.conversion.kind === 'available' ? report.conversion.converted : 0
        : report.acceptedValue.kind === 'available' ? report.acceptedValue.estimateCount : 0;
  const acceptedValue = report.acceptedValue.kind === 'unavailable' &&
    report.acceptedValue.reason === 'invalid-money'
    ? { kind: 'unavailable' as const, reason: 'invalid-money' as const }
    : access.acceptedValue;
  const conversion = access.conversion;
  const common = [
    'lead-source', input.dataset, 'lead-creation-cohort', input.query.period.from, input.query.period.to,
    report.asOf, report.timezone, access.leadScope, access.leadArchiveVisibility, coverage,
  ];

  async function* rows(signal?: AbortSignal): AsyncGenerator<readonly (string | number | null)[]> {
    signal?.throwIfAborted();
    if (input.dataset === 'source-groups') {
      for (const row of sourceGroupRows(input, report, access)) {
        signal?.throwIfAborted();
        yield row;
      }
      return;
    }

    const cursor = `source_export_${randomUUID().replaceAll('-', '')}`;
    let projection: { sql: string; bindings: readonly Knex.RawBinding[] };
    let today = report.today;
    if (input.dataset === 'accepted-estimates') {
      const accepted = await acceptedRowsQuery(trx, context, input);
      projection = accepted;
      today = accepted.today;
    } else {
      projection = await cohortRowsQuery(trx, context, input);
    }
    await trx.raw(`DECLARE ?? NO SCROLL CURSOR FOR ${projection.sql}`, [cursor, ...projection.bindings]);
    let emitted = 0;
    try {
      let batch = (await trx.raw<{ rows: Record<string, unknown>[] }>(
        'FETCH FORWARD 100 FROM ??', [cursor],
      )).rows;
      while (batch.length) {
        for (const rawRow of batch) {
          signal?.throwIfAborted();
          if (input.dataset === 'accepted-estimates') {
            const item = sourceEstimateEvidence(rawRow, context.workspaceId, today);
            if (item.money.kind === 'unavailable' || !item.evidence) {
              throw new Error('Accepted source-Estimate evidence failed frozen-money verification.');
            }
            const evidence = item.evidence;
            emitted++;
            if (emitted > count) throw new Error('The Sources CSV population changed during generation.');
            yield [
              ...common, evidence.estimateNumber, evidence.revision, evidence.decisionVersion, evidence.label,
              evidence.acceptedDate, evidence.preTaxCents, currency, evidence.source,
              evidence.linkedLead?.recordId ?? null, evidence.linkedLead?.label ?? null,
              evidence.source === null ? 'unattributed' : 'attributed',
            ];
          } else {
            const row = cohortRowSchema.parse(rawRow);
            emitted++;
            if (emitted > count) throw new Error('The Sources CSV population changed during generation.');
            yield [
              ...common, row.id, row.label, row.createdDate, row.source, String(row.archived),
              ...(input.dataset === 'converted' ? [row.linkedJobNumbers ?? ''] : []),
            ];
          }
        }
        signal?.throwIfAborted();
        batch = (await trx.raw<{ rows: Record<string, unknown>[] }>(
          'FETCH FORWARD 100 FROM ??', [cursor],
        )).rows;
      }
      if (emitted !== count) throw new Error('The Sources CSV population changed during generation.');
    } finally {
      await trx.raw('CLOSE ??', [cursor]);
    }
  }

  return {
    input,
    workspaceId: context.workspaceId,
    viewerId: context.userId,
    policyRevision: context.policy.revision,
    leadScope: access.leadScope,
    leadArchiveVisibility: access.leadArchiveVisibility,
    conversion,
    acceptedValue,
    asOf: report.asOf,
    today: report.today,
    timezone: report.timezone,
    dateBasis: 'lead-creation-cohort' as const,
    coverage,
    count,
    columns,
    rows,
  };
}
