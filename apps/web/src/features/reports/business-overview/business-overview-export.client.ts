import { businessOverviewExportInputSchema, businessOverviewExportPreviewSchema, businessOverviewExportGenerationSchema,
  type BusinessOverviewQuery, type BusinessOverviewReadResult, type BusinessOverviewExportPreview } from '@salesmora/contracts';
import { receiveReportCSV } from '../receive-report-csv';

export class OverviewCSVChangedError extends Error {
  constructor() { super('Overview export data or access changed. Refresh the preview and review again.'); }
}
export class OverviewCSVDeniedError extends Error {
  constructor() { super('Overview CSV requires Export reports and at least one underlying export permission. Ask a workspace owner or administrator to review Settings > Permissions, then reload report access.'); }
}
async function responseError(response: Response): Promise<never> {
  if ([401, 403, 404, 423].includes(response.status)) throw new OverviewCSVDeniedError();
  throw new Error(response.status === 422 ? 'Check the Overview period and technical CSV limits.'
    : 'Overview CSV could not be completed. Try again.');
}
export const overviewExportFilename = (today: string) => `salesmora-business-overview-summary-${today}.csv`;
export async function loadOverviewCSVPreview(query: BusinessOverviewQuery, authority: BusinessOverviewReadResult, signal: AbortSignal) {
  const input = businessOverviewExportInputSchema.parse({ query, dataset: 'summary' });
  const response = await fetch('/api/reports/overview/export/preview', {
    method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal,
  });
  if (!response.ok) return responseError(response);
  const preview = businessOverviewExportPreviewSchema.parse(await response.json());
  const { lead, job, estimate, calendar } = preview.scopes, read = authority.authority;
  if (JSON.stringify(preview.input) !== JSON.stringify(input) || preview.workspaceId !== authority.workspaceId ||
    preview.viewerId !== authority.viewerId || preview.policyRevision !== authority.policyRevision ||
    preview.today !== authority.report.today || preview.timezone !== authority.report.timezone ||
    lead && (!read.lead || read.lead.scope === 'assigned' && lead.scope !== 'assigned' ||
      read.lead.archives === 'excluded' && lead.archives !== 'excluded') ||
    job && (!read.job || read.job.scope === 'assigned' && job !== 'assigned') ||
    estimate && (!read.estimate || read.estimate.scope === 'assigned_job' && estimate.scope !== 'assigned_job' ||
      read.estimate.archives === 'excluded' && estimate.archives !== 'excluded') ||
    calendar && (!read.calendar || read.calendar.kind === 'own' && calendar.scope !== 'own')) throw new OverviewCSVChangedError();
  return preview;
}
export async function receiveOverviewCSV(preview: BusinessOverviewExportPreview, signal: AbortSignal): Promise<Blob> {
  const response = await fetch('/api/reports/overview/export', {
    method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preview.input), signal,
  });
  if (!response.ok) return responseError(response);
  return receiveReportCSV(response, preview.columns, businessOverviewExportGenerationSchema, metadata => {
    if (metadata.workspaceId !== preview.workspaceId || metadata.policyRevision !== preview.policyRevision ||
      JSON.stringify(metadata.scopes) !== JSON.stringify(preview.scopes) || metadata.count !== preview.count ||
      metadata.today !== preview.today || metadata.timezone !== preview.timezone ||
      JSON.stringify(metadata.limits) !== JSON.stringify(preview.limits) ||
      Date.parse(metadata.asOf) < Date.parse(preview.asOf)) throw new OverviewCSVChangedError();
  }, signal, 'Overview');
}
export { saveReportCSV as saveOverviewCSV } from '../save-report-csv';
