import type { Knex } from 'knex';
import { financialReportExportInputSchema, financialReportExportPreviewSchema, financialReportExportGenerationSchema,
  type FinancialReportExportInput, type FinancialReportExportPreview, type PermissionId } from '@salesmora/contracts';
import { AuthorizationAccessError, type WorkspaceIdentity } from '../authorization/store';
import { reportExportLimits, withReportExportSnapshot } from './lead-export';
import { prepareFinancialReportCSVProjectionInTransaction } from './financial-export-projection';
import { createReportCSVStream } from './report-export-stream';

function validate(identity: WorkspaceIdentity, raw: FinancialReportExportInput) {
  const input = financialReportExportInputSchema.parse(raw);
  if (identity.workspaceId !== input.query.workspaceId) throw new AuthorizationAccessError();
  return input;
}
type Projection = Awaited<ReturnType<typeof prepareFinancialReportCSVProjectionInTransaction>>;
function preview(projection: Projection, limits: FinancialReportExportPreview['limits']): FinancialReportExportPreview {
  const { rows, ...metadata } = projection;
  void rows;
  return financialReportExportPreviewSchema.parse({ ...metadata, limits });
}
export async function previewFinancialReportExport(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: FinancialReportExportInput,
): Promise<FinancialReportExportPreview> {
  const input = validate(identity, raw), limits = reportExportLimits();
  return withReportExportSnapshot(db, identity, enabled, AbortSignal.timeout(limits.durationMs),
    async (trx, context) => preview(await prepareFinancialReportCSVProjectionInTransaction(trx, context, input), limits));
}
export async function createFinancialReportCSVExport(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: FinancialReportExportInput,
  requestSignal?: AbortSignal,
) {
  const input = validate(identity, raw);
  return createReportCSVStream(db, identity, enabled, {
    report: 'financial', label: 'Financial', dataset: input.dataset,
    selection: JSON.stringify({ dataset: input.dataset, selected: input.query.selected, period: input.query.period }),
    prepare: async (trx, context, limits) => {
      const projection = await prepareFinancialReportCSVProjectionInTransaction(trx, context, input);
      return { preview: preview(projection, limits), rows: projection.rows };
    },
    auditScopes: value => ({ scope: value.scope, outputScopes: JSON.stringify({
      section: value.section, scope: value.scope, jobScope: value.jobScope, archiveVisibility: value.archiveVisibility,
    }) }),
    generation: (value, id) => financialReportExportGenerationSchema.parse({
      id, workspaceId: value.workspaceId, policyRevision: value.policyRevision, asOf: value.asOf, today: value.today,
      timezone: value.timezone, section: value.section, scope: value.scope, jobScope: value.jobScope, archiveVisibility: value.archiveVisibility,
      count: value.count, limits: value.limits,
    }),
  }, requestSignal);
}
