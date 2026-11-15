import { createHash } from 'node:crypto';
import type { Knex } from 'knex';
import { estimateReportExportInputSchema, estimateReportExportPreviewSchema, estimateReportExportGenerationSchema,
  type EstimateReportExportInput, type EstimateReportExportPreview, type PermissionId } from '@salesmora/contracts';
import { AuthorizationAccessError, type WorkspaceIdentity } from '../authorization/store';
import { reportExportLimits, withReportExportSnapshot } from './lead-export';
import { prepareEstimateReportCSVProjectionInTransaction } from './estimate-export-projection';
import { createReportCSVStream } from './report-export-stream';

function validate(identity: WorkspaceIdentity, raw: EstimateReportExportInput) {
  const input = estimateReportExportInputSchema.parse(raw);
  if (identity.workspaceId !== input.query.workspaceId) throw new AuthorizationAccessError();
  return input;
}
type Projection = Awaited<ReturnType<typeof prepareEstimateReportCSVProjectionInTransaction>>;
function preview(projection: Projection, limits: EstimateReportExportPreview['limits']): EstimateReportExportPreview {
  const { rows, ...metadata } = projection;
  void rows;
  return estimateReportExportPreviewSchema.parse({ ...metadata, limits });
}
function auditSelection(input: EstimateReportExportInput) {
  const { workspaceId, filters, ...query } = input.query;
  void workspaceId;
  const fingerprint = (value: string) => createHash('sha256').update(value).digest('hex');
  return JSON.stringify({ dataset: input.dataset, query: { ...query,
    filters: { ...filters, owners: filters.owners.map(fingerprint) } } });
}

/** Recounts under current export authority without consuming the evidence cursor. */
export async function previewEstimateReportExport(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: EstimateReportExportInput,
): Promise<EstimateReportExportPreview> {
  const input = validate(identity, raw), limits = reportExportLimits();
  return withReportExportSnapshot(db, identity, enabled, AbortSignal.timeout(limits.durationMs),
    async (trx, context) => preview(await prepareEstimateReportCSVProjectionInTransaction(trx, context, input), limits));
}

/** Consumers must drain or cancel; the completed audit precedes stream closure. */
export async function createEstimateReportCSVExport(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: EstimateReportExportInput,
  requestSignal?: AbortSignal,
) {
  const input = validate(identity, raw);
  return createReportCSVStream(db, identity, enabled, {
    report: 'estimates', label: 'Estimates', dataset: input.dataset, selection: auditSelection(input),
    prepare: async (trx, context, limits) => {
      const projection = await prepareEstimateReportCSVProjectionInTransaction(trx, context, input);
      return { preview: preview(projection, limits), rows: projection.rows };
    },
    auditScopes: value => ({ scope: value.scope === 'assigned_job' ? 'assigned' : 'workspace',
      outputScopes: JSON.stringify({ view: value.input.query.view, scope: value.scope,
        handoff: value.handoff, archiveVisibility: value.archiveVisibility }) }),
    generation: (value, id) => estimateReportExportGenerationSchema.parse({
      id, workspaceId: value.workspaceId, policyRevision: value.policyRevision, scope: value.scope,
      handoff: value.handoff, archiveVisibility: value.archiveVisibility, asOf: value.asOf, today: value.today,
      timezone: value.timezone, dateBasis: value.dateBasis, count: value.count, limits: value.limits,
    }),
  }, requestSignal);
}
