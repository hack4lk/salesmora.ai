import { createHash } from 'node:crypto';
import type { Knex } from 'knex';
import { jobReportExportInputSchema, jobReportExportPreviewSchema, jobReportExportGenerationSchema,
  type JobReportExportInput, type JobReportExportPreview, type PermissionId } from '@salesmora/contracts';
import { AuthorizationAccessError, type WorkspaceIdentity } from '../authorization/store';
import { reportExportLimits, withReportExportSnapshot } from './lead-export';
import { prepareJobReportCSVProjectionInTransaction } from './job-export-projection';
import { createReportCSVStream } from './report-export-stream';

function validate(identity: WorkspaceIdentity, raw: JobReportExportInput) {
  const input = jobReportExportInputSchema.parse(raw);
  if (identity.workspaceId !== input.query.workspaceId) throw new AuthorizationAccessError();
  return input;
}
type Projection = Awaited<ReturnType<typeof prepareJobReportCSVProjectionInTransaction>>;
function preview(projection: Projection, limits: JobReportExportPreview['limits']): JobReportExportPreview {
  const { rows, ...metadata } = projection;
  void rows;
  return jobReportExportPreviewSchema.parse({ ...metadata, limits });
}
function auditSelection(input: JobReportExportInput) {
  const { workspaceId, filters, ...query } = input.query;
  void workspaceId;
  const fingerprint = (value: string) => createHash('sha256').update(value).digest('hex');
  const selection = query.view === 'workload' && query.selection.kind === 'group' &&
    (query.selection.group === 'owner' || query.selection.group === 'service')
    ? { ...query, selection: { ...query.selection, id: fingerprint(query.selection.id) } } : query;
  return JSON.stringify({ dataset: input.dataset, query: { ...selection,
    filters: { statuses: filters.statuses, owners: filters.owners.map(fingerprint), services: filters.services.map(fingerprint) } } });
}
/** Recounts under current export authority without consuming the evidence cursor. */
export async function previewJobReportExport(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: JobReportExportInput,
): Promise<JobReportExportPreview> {
  const input = validate(identity, raw), limits = reportExportLimits();
  return withReportExportSnapshot(db, identity, enabled, AbortSignal.timeout(limits.durationMs),
    async (trx, context) => preview(await prepareJobReportCSVProjectionInTransaction(trx, context, input), limits));
}
/** Consumers must drain or cancel; the completed audit precedes stream closure. */
export async function createJobReportCSVExport(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: JobReportExportInput,
  requestSignal?: AbortSignal,
) {
  const input = validate(identity, raw);
  return createReportCSVStream(db, identity, enabled, {
    report: 'jobs', label: 'Jobs', dataset: input.dataset, selection: auditSelection(input),
    prepare: async (trx, context, limits) => {
      const projection = await prepareJobReportCSVProjectionInTransaction(trx, context, input);
      return { preview: preview(projection, limits), rows: projection.rows };
    },
    auditScopes: value => ({ scope: value.scope, outputScopes: JSON.stringify({ jobs: value.scope,
      archiveVisibility: value.archiveVisibility }) }),
    generation: (value, id) => jobReportExportGenerationSchema.parse({
      id, workspaceId: value.workspaceId, policyRevision: value.policyRevision, scope: value.scope,
      archiveVisibility: value.archiveVisibility, asOf: value.asOf, today: value.today, timezone: value.timezone,
      dateBasis: value.dateBasis, count: value.count, limits: value.limits,
    }),
  }, requestSignal);
}
export { ReportExportLimitError, reportExportLimits } from './lead-export';
