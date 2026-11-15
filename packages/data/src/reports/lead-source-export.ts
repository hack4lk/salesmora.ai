import type { Knex } from 'knex';
import {
  leadSourceExportInputSchema, leadSourceExportPreviewSchema, leadSourceExportGenerationSchema,
  type LeadSourceExportInput, type LeadSourceExportPreview, type PermissionId,
} from '@salesmora/contracts';
import { AuthorizationAccessError, type WorkspaceIdentity } from '../authorization/store';
import { reportExportLimits, withReportExportSnapshot } from './lead-export';
import { prepareLeadSourceCSVProjectionInTransaction } from './lead-source-export-projection';
import { createReportCSVStream } from './report-export-stream';

type Projection = Awaited<ReturnType<typeof prepareLeadSourceCSVProjectionInTransaction>>;
function validate(identity: WorkspaceIdentity, raw: LeadSourceExportInput) {
  const input = leadSourceExportInputSchema.parse(raw);
  if (identity.workspaceId !== input.query.workspaceId) throw new AuthorizationAccessError();
  return input;
}
function preview(projection: Projection, limits: LeadSourceExportPreview['limits']): LeadSourceExportPreview {
  const { rows, ...metadata } = projection;
  void rows;
  return leadSourceExportPreviewSchema.parse({ ...metadata, limits });
}
function auditOutputScopes(projection: Pick<LeadSourceExportPreview,
  'leadScope' | 'leadArchiveVisibility' | 'conversion' | 'acceptedValue'>) {
  return { lead: projection.leadScope, leadArchiveVisibility: projection.leadArchiveVisibility,
    conversion: projection.conversion, acceptedValue: projection.acceptedValue };
}

/** Recomputes live authorized metadata for review; no evidence cursor is consumed. */
export async function previewLeadSourceExport(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: LeadSourceExportInput,
): Promise<LeadSourceExportPreview> {
  const input = validate(identity, raw), limits = reportExportLimits();
  return withReportExportSnapshot(db, identity, enabled, AbortSignal.timeout(limits.durationMs),
    async (trx, context) => preview(await prepareLeadSourceCSVProjectionInTransaction(trx, context, input), limits));
}

/** Consumers must drain or cancel the stream; success requires a complete response and audit. */
export async function createLeadSourceCSVExport(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: LeadSourceExportInput,
  requestSignal?: AbortSignal,
) {
  const input = validate(identity, raw);
  return createReportCSVStream(db, identity, enabled, {
    report: 'sources', label: 'Sources', dataset: input.dataset,
    selection: JSON.stringify({ dataset: input.dataset, query: {
      view: input.query.view, period: input.query.period, selected: input.query.selected,
    } }),
    prepare: async (trx, context, limits) => {
      const projection = await prepareLeadSourceCSVProjectionInTransaction(trx, context, input);
      return { preview: preview(projection, limits), rows: projection.rows };
    },
    auditScopes: value => ({ scope: value.leadScope, outputScopes: JSON.stringify(auditOutputScopes(value)) }),
    generation: (value, id) => leadSourceExportGenerationSchema.parse({
      id, workspaceId: value.workspaceId, policyRevision: value.policyRevision,
      leadScope: value.leadScope, leadArchiveVisibility: value.leadArchiveVisibility,
      conversion: value.conversion, acceptedValue: value.acceptedValue,
      asOf: value.asOf, today: value.today, timezone: value.timezone, dateBasis: value.dateBasis,
      count: value.count, limits: value.limits,
    }),
  }, requestSignal);
}

export { ReportExportLimitError, reportExportLimits } from './lead-export';
