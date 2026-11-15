import { createHash } from 'node:crypto';
import type { Knex } from 'knex';
import { activityReportExportInputSchema, activityReportExportPreviewSchema, activityReportExportGenerationSchema,
  type ActivityReportExportInput, type ActivityReportExportPreview, type PermissionId } from '@salesmora/contracts';
import { AuthorizationAccessError, type WorkspaceIdentity } from '../authorization/store';
import { reportExportLimits, withReportExportSnapshot } from './lead-export';
import { prepareActivityReportCSVProjectionInTransaction } from './activity-export-projection';
import { createReportCSVStream } from './report-export-stream';

function validate(identity: WorkspaceIdentity, raw: ActivityReportExportInput) {
  const input = activityReportExportInputSchema.parse(raw);
  if (identity.workspaceId !== input.query.workspaceId) throw new AuthorizationAccessError();
  return input;
}
type Projection = Awaited<ReturnType<typeof prepareActivityReportCSVProjectionInTransaction>>;
function preview(projection: Projection, limits: ActivityReportExportPreview['limits']): ActivityReportExportPreview {
  const { rows, ...metadata } = projection;
  void rows;
  return activityReportExportPreviewSchema.parse({ ...metadata, limits });
}
function auditSelection(input: ActivityReportExportInput) {
  const { workspaceId, filters, ...query } = input.query;
  void workspaceId;
  const fingerprint = (value: string) => createHash('sha256').update(value).digest('hex');
  return JSON.stringify({ dataset: input.dataset, query: { ...query,
    filters: { ...filters, actors: filters.actors.map(fingerprint) } } });
}
export async function previewActivityReportExport(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: ActivityReportExportInput,
): Promise<ActivityReportExportPreview> {
  const input = validate(identity, raw), limits = reportExportLimits();
  return withReportExportSnapshot(db, identity, enabled, AbortSignal.timeout(limits.durationMs),
    async (trx, context) => preview(await prepareActivityReportCSVProjectionInTransaction(trx, context, input), limits));
}
export async function createActivityReportCSVExport(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: ActivityReportExportInput,
  requestSignal?: AbortSignal,
) {
  const input = validate(identity, raw);
  return createReportCSVStream(db, identity, enabled, {
    report: 'activity', label: 'Activity', dataset: input.dataset, selection: auditSelection(input),
    prepare: async (trx, context, limits) => {
      const projection = await prepareActivityReportCSVProjectionInTransaction(trx, context, input);
      return { preview: preview(projection, limits), rows: projection.rows };
    },
    auditScopes: value => ({ scope: value.includedDomains.some(domain => domain.scope === 'workspace') ? 'workspace' : 'assigned',
      outputScopes: JSON.stringify({ view: 'activity', includedDomains: value.includedDomains, omittedDomains: value.omittedDomains }) }),
    generation: (value, id) => activityReportExportGenerationSchema.parse({
      id, workspaceId: value.workspaceId, policyRevision: value.policyRevision, asOf: value.asOf, today: value.today,
      timezone: value.timezone, includedDomains: value.includedDomains, omittedDomains: value.omittedDomains,
      count: value.count, limits: value.limits,
    }),
  }, requestSignal);
}
