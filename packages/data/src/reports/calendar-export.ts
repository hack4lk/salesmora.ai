import { createHash } from 'node:crypto';
import type { Knex } from 'knex';
import {
  calendarExportInputSchema, calendarExportPreviewSchema, calendarExportGenerationSchema,
  type CalendarExportInput, type CalendarExportPreview, type PermissionId,
} from '@salesmora/contracts';
import { AuthorizationAccessError, type WorkspaceIdentity } from '../authorization/store';
import { reportExportLimits, withReportExportSnapshot } from './lead-export';
import { prepareCalendarCSVProjectionInTransaction } from './calendar-export-projection';
import { createReportCSVStream } from './report-export-stream';

function validate(identity: WorkspaceIdentity, raw: CalendarExportInput) {
  const input = calendarExportInputSchema.parse(raw);
  if (identity.workspaceId !== input.query.workspaceId) throw new AuthorizationAccessError();
  return input;
}
type Projection = Awaited<ReturnType<typeof prepareCalendarCSVProjectionInTransaction>>;
function preview(projection: Projection, limits: CalendarExportPreview['limits']): CalendarExportPreview {
  const { rows, ...metadata } = projection;
  void rows;
  return calendarExportPreviewSchema.parse({ ...metadata, limits });
}

/** Recounts under current export authority without consuming the evidence cursor. */
export async function previewCalendarExport(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: CalendarExportInput,
): Promise<CalendarExportPreview> {
  const input = validate(identity, raw), limits = reportExportLimits();
  return withReportExportSnapshot(db, identity, enabled, AbortSignal.timeout(limits.durationMs),
    async (trx, context) => preview(await prepareCalendarCSVProjectionInTransaction(trx, context, input), limits));
}

/** Consumers must drain or cancel; the completed audit precedes stream closure. */
export async function createCalendarCSVExport(
  db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: CalendarExportInput,
  requestSignal?: AbortSignal,
) {
  const input = validate(identity, raw);
  const { workspaceId, filters, ...query } = input.query;
  void workspaceId;
  return createReportCSVStream(db, identity, enabled, {
    report: 'calendar', label: 'Calendar', dataset: input.dataset,
    selection: JSON.stringify({ dataset: input.dataset, query: { ...query, filters: {
      recordTypes: filters.recordTypes,
      participants: filters.participants.map(id => createHash('sha256').update(id).digest('hex')),
    } } }),
    prepare: async (trx, context, limits) => {
      const projection = await prepareCalendarCSVProjectionInTransaction(trx, context, input);
      return { preview: preview(projection, limits), rows: projection.rows };
    },
    auditScopes: value => ({ scope: value.scope.kind, outputScopes: JSON.stringify(value.outputScopes) }),
    generation: (value, id) => calendarExportGenerationSchema.parse({
      id, workspaceId: value.workspaceId, policyRevision: value.policyRevision, scope: value.scope,
      outputScopes: value.outputScopes, asOf: value.asOf, today: value.today, timezone: value.timezone,
      dateBasis: value.dateBasis, count: value.count, limits: value.limits,
    }),
  }, requestSignal);
}

export { ReportExportLimitError, reportExportLimits } from './lead-export';
