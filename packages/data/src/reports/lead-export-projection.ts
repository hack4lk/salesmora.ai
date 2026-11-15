import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { z } from 'zod';
import { leadReportExportColumns, type AuthorizationContext, type LeadReportExportInput } from '@salesmora/contracts';
import { prepareLeadReportExportInTransaction } from './leads';

const text = z.string().trim().min(1).max(4000).refine(value => !/[\u0000-\u001f\u007f]/.test(value));
const evidenceSchema = z.object({
  id: z.uuid(), recordId: z.uuid(), label: text, cells: z.record(z.string(), text),
}).strict().refine(row => row.id === row.recordId);

/** Caller owns the current authorized transaction for preparation and complete iterator consumption. */
export async function prepareLeadReportCSVProjectionInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, raw: LeadReportExportInput,
) {
  const { input, scope, report, evidence } = await prepareLeadReportExportInTransaction(trx, context, raw);
  const columns = leadReportExportColumns(input);
  const dateBasis = report.view === 'intake' ? 'creation-date' as const
    : report.view === 'won' || report.view === 'lost' ? 'recorded-transition-date' as const : 'current-snapshot' as const;
  const coverage = report.view === 'won' || report.view === 'lost' ? report.coverage.explanation
    : report.view === 'attention' ? 'Inactive and unowned overlap; combined counts distinct Leads, not the category sum.'
      : 'Native authorized Leads population; each table breakdown reconciles independently.';
  const common = [report.view, input.dataset, dateBasis,
    'from' in report ? report.from : '', 'to' in report ? report.to : '',
    report.asOf, report.timezone, scope, report.archiveVisibility, coverage];
  let table: (string | number)[][] = [];
  if (input.dataset !== 'evidence') {
    if (report.view === 'intake' && input.dataset === 'intake-days') table = report.trend.map(row => [row.date, row.count]);
    else if (report.view === 'intake' && input.dataset === 'intake-sources') table = report.sources.map(row => [row.source, row.count]);
    else if ((report.view === 'pipeline' || report.view === 'age') && input.dataset === 'pipeline-stages') {
      table = Object.entries(report.stages).map(([stage, count]) => [stage, count]);
    } else if ((report.view === 'pipeline' || report.view === 'age') && input.dataset === 'age-bands') {
      table = Object.entries(report.ages).map(([band, count]) => [band, count]);
    } else if ((report.view === 'won' || report.view === 'lost') && input.dataset === 'outcomes') {
      table = (['won', 'lost'] as const).map(outcome => [outcome, report.counts[outcome]]);
    } else if (report.view === 'attention' && input.dataset === 'attention-categories') {
      table = (['inactive', 'unowned', 'combined'] as const).map(category => [category, report.counts[category], 'true']);
    } else throw new Error('The native Leads table does not match the requested CSV dataset.');
  }
  const count = input.dataset === 'evidence' ? report.evidenceTotal : table.length;
  async function* rows(signal?: AbortSignal): AsyncGenerator<readonly (string | number)[]> {
    signal?.throwIfAborted();
    if (input.dataset !== 'evidence') {
      for (const row of table) { signal?.throwIfAborted(); yield [...common, ...row]; }
      return;
    }
    const cursor = `lead_report_csv_${randomUUID().replaceAll('-', '')}`, sql = evidence.query.toSQL();
    await trx.raw(`DECLARE ?? NO SCROLL CURSOR FOR ${sql.sql}`, [cursor, ...sql.bindings]);
    let emitted = 0;
    const fields = columns.slice(common.length + 2);
    try {
      let batch = (await trx.raw<{ rows: unknown[] }>('FETCH FORWARD 100 FROM ??', [cursor])).rows;
      while (batch.length) {
        for (const saved of batch) {
          signal?.throwIfAborted();
          const row = evidenceSchema.parse(evidence.map(saved));
          if (Object.keys(row.cells).length !== fields.length || !fields.every(field => Object.hasOwn(row.cells, field))) {
            throw new Error('Native Leads CSV evidence columns do not match the selected view.');
          }
          emitted++;
          if (emitted > count) throw new Error('The Leads CSV population changed during generation.');
          yield [...common, row.recordId, row.label, ...fields.map(field => row.cells[field])];
        }
        signal?.throwIfAborted();
        batch = (await trx.raw<{ rows: unknown[] }>('FETCH FORWARD 100 FROM ??', [cursor])).rows;
      }
      if (emitted !== count) throw new Error('The Leads CSV population changed during generation.');
    } finally { await trx.raw('CLOSE ??', [cursor]); }
  }
  return { input, workspaceId: context.workspaceId, viewerId: context.userId, policyRevision: context.policy.revision,
    scope, archiveVisibility: report.archiveVisibility, asOf: report.asOf, today: report.today, timezone: report.timezone,
    dateBasis, coverage, count, columns, rows };
}
