import { createHash } from 'node:crypto';
import type { Knex } from 'knex';
import { teamReportExportInputSchema, teamReportExportPreviewSchema, teamReportExportGenerationSchema,
  type TeamReportExportInput, type TeamReportExportPreview, type PermissionId } from '@salesmora/contracts';
import { AuthorizationAccessError, type WorkspaceIdentity } from '../authorization/store';
import { reportExportLimits, withReportExportSnapshot } from './lead-export';
import { prepareTeamReportCSVProjectionInTransaction } from './team-export-projection';
import { createReportCSVStream } from './report-export-stream';

function validate(identity: WorkspaceIdentity, raw: TeamReportExportInput) {
  const input = teamReportExportInputSchema.parse(raw);
  if (identity.workspaceId !== input.query.workspaceId) throw new AuthorizationAccessError();
  return input;
}
type Projection = Awaited<ReturnType<typeof prepareTeamReportCSVProjectionInTransaction>>;
function preview(projection: Projection, limits: TeamReportExportPreview['limits']): TeamReportExportPreview {
  const { rows, ...metadata } = projection;
  void rows;
  return teamReportExportPreviewSchema.parse({ ...metadata, limits });
}
function auditSelection(input: TeamReportExportInput) {
  const { workspaceId, filters, selected, ...query } = input.query;
  void workspaceId;
  const fingerprint = (value: string) => createHash('sha256').update(value).digest('hex');
  const selection = selected.kind === 'member' || selected.kind === 'owner' && selected.id !== 'unassigned'
    ? { ...selected, id: fingerprint(selected.id) } : selected;
  return JSON.stringify({ dataset: input.dataset, query: { ...query, selected: selection,
    filters: { members: filters.members.map(fingerprint) } } });
}
/** Recounts under current source-specific export authority without consuming the evidence cursor. */
export async function previewTeamReportExport(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: TeamReportExportInput,
): Promise<TeamReportExportPreview> {
  const input = validate(identity, raw), limits = reportExportLimits();
  return withReportExportSnapshot(db, identity, enabled, AbortSignal.timeout(limits.durationMs),
    async (trx, context) => preview(await prepareTeamReportCSVProjectionInTransaction(trx, context, input), limits));
}
/** Consumers must drain or cancel; the completed audit precedes stream closure. */
export async function createTeamReportCSVExport(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: TeamReportExportInput,
  requestSignal?: AbortSignal,
) {
  const input = validate(identity, raw);
  return createReportCSVStream(db, identity, enabled, {
    report: 'team', label: 'Team', dataset: input.dataset, selection: auditSelection(input),
    prepare: async (trx, context, limits) => {
      const projection = await prepareTeamReportCSVProjectionInTransaction(trx, context, input);
      return { preview: preview(projection, limits), rows: projection.rows };
    },
    auditScopes: value => ({ scope: value.scope.kind, outputScopes: JSON.stringify({
      view: value.input.query.view, scope: value.scope.kind, archiveVisibility: value.archiveVisibility,
    }) }),
    generation: (value, id) => teamReportExportGenerationSchema.parse({
      id, workspaceId: value.workspaceId, policyRevision: value.policyRevision, scope: value.scope,
      archiveVisibility: value.archiveVisibility, asOf: value.asOf, today: value.today, timezone: value.timezone,
      dateBasis: value.dateBasis, count: value.count, limits: value.limits,
    }),
  }, requestSignal);
}
export { ReportExportLimitError, reportExportLimits } from './lead-export';
