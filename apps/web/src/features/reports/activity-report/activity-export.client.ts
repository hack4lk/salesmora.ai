import { activityReportExportInputSchema, activityReportExportPreviewSchema, activityReportExportGenerationSchema,
  type ActivityReportExportInput, type ActivityReportExportPreview, type ActivityReportQuery,
  type ActivityReportReadResult } from '@salesmora/contracts';
import { receiveReportCSV } from '../receive-report-csv';

export const activityExportLabels: Record<ActivityReportExportInput['dataset'], string> = {
  summary: 'Summary table', evidence: 'Selected events',
};
export function activityExportInput(query: ActivityReportQuery, dataset: ActivityReportExportInput['dataset']) {
  const { page, pageSize, ...unpaged } = query;
  void page; void pageSize;
  return activityReportExportInputSchema.parse({ dataset, query: unpaged });
}
export function activityExportFilename(input: ActivityReportExportInput, today: string) {
  return `salesmora-${input.query.view}-${input.dataset}-${today}.csv`;
}
export class ActivityCSVChangedError extends Error {
  constructor() { super('Activity export data or access changed. Refresh the preview and review again.'); }
}
export class ActivityCSVDeniedError extends Error {
  constructor() { super('This Activity selection is unavailable under current export access. Change the selection or reload access.'); }
}
async function responseError(response: Response): Promise<never> {
  if ([401, 403, 404, 423].includes(response.status)) throw new ActivityCSVDeniedError();
  throw new Error(response.status === 422 ? 'Check the Activity selection and technical CSV limits.'
    : 'Activity CSV could not be completed. Try again.');
}
export async function loadActivityCSVPreview(
  input: ActivityReportExportInput, authority: ActivityReportReadResult, signal: AbortSignal,
) {
  if (!authority.exportScopes.length ||
    input.query.filters.domains.some(domain => !authority.exportScopes.some(scope => scope.domain === domain))) {
    throw new ActivityCSVDeniedError();
  }
  const response = await fetch('/api/reports/activity/export/preview', {
    method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal,
  });
  if (!response.ok) return responseError(response);
  const preview = activityReportExportPreviewSchema.parse(await response.json());
  const scopes = preview.includedDomains.map(({ domain, scope }) => ({ domain, scope }));
  if (JSON.stringify(preview.input) !== JSON.stringify(input) || preview.workspaceId !== authority.workspaceId ||
    preview.viewerId !== authority.viewerId || preview.policyRevision !== authority.policyRevision ||
    JSON.stringify(scopes) !== JSON.stringify(authority.exportScopes) ||
    preview.includedDomains.some(item => authority.report.includedDomains.find(read => read.domain === item.domain)
      ?.archiveVisibility !== item.archiveVisibility) || preview.today !== authority.report.today ||
    preview.timezone !== authority.report.timezone) throw new ActivityCSVChangedError();
  return preview;
}
export async function receiveActivityCSV(preview: ActivityReportExportPreview, signal: AbortSignal): Promise<Blob> {
  const response = await fetch('/api/reports/activity/export', {
    method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preview.input), signal,
  });
  if (!response.ok) return responseError(response);
  return receiveReportCSV(response, preview.columns, activityReportExportGenerationSchema, metadata => {
    if (metadata.workspaceId !== preview.workspaceId || metadata.policyRevision !== preview.policyRevision ||
      JSON.stringify(metadata.includedDomains) !== JSON.stringify(preview.includedDomains) ||
      JSON.stringify(metadata.omittedDomains) !== JSON.stringify(preview.omittedDomains) ||
      metadata.count !== preview.count || metadata.today !== preview.today || metadata.timezone !== preview.timezone ||
      JSON.stringify(metadata.limits) !== JSON.stringify(preview.limits) ||
      Date.parse(metadata.asOf) < Date.parse(preview.asOf)) throw new ActivityCSVChangedError();
  }, signal, 'Activity');
}
export { saveReportCSV as saveActivityCSV } from '../save-report-csv';
