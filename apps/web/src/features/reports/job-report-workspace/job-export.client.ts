import { jobReportExportInputSchema, jobReportExportPreviewSchema, jobReportExportGenerationSchema,
  type JobReportExportInput, type JobReportExportPreview, type JobReportQuery, type JobReportReadResult } from '@salesmora/contracts';
import { receiveReportCSV } from '../receive-report-csv';

export const jobExportLabels: Record<JobReportExportInput['dataset'], string> = {
  summary: 'Summary table', days: 'Completion days table', status: 'Status groups', owner: 'Owner groups',
  service: 'Service groups', 'waiting-reasons': 'Waiting reason groups', evidence: 'Selected Job evidence',
};
export function jobExportDatasetsForView(view: JobReportQuery['view']): JobReportExportInput['dataset'][] {
  return view === 'lifecycle' ? ['summary', 'evidence'] : view === 'completion' ? ['summary', 'days', 'evidence']
    : ['summary', 'status', 'owner', 'service', 'waiting-reasons', 'evidence'];
}
export function jobExportInput(query: JobReportQuery, dataset: JobReportExportInput['dataset']) {
  const { page, pageSize, ...unpaged } = query;
  void page; void pageSize;
  return jobReportExportInputSchema.parse({ dataset, query: unpaged });
}
export function jobExportFilename(input: JobReportExportInput, today: string) {
  return `salesmora-${input.query.view}-${input.dataset}-${today}.csv`;
}
export class JobCSVChangedError extends Error {
  constructor() { super('Jobs export data or access changed. Refresh the preview and review again.'); }
}
export class JobCSVDeniedError extends Error {
  constructor() { super('This Jobs export is unavailable under current access.'); }
}
async function responseError(response: Response): Promise<never> {
  if ([401, 403, 404, 423].includes(response.status)) throw new JobCSVDeniedError();
  throw new Error(response.status === 422 ? 'Check the Jobs selection and technical CSV limits.'
    : 'Jobs CSV could not be completed. Try again.');
}
export async function loadJobCSVPreview(input: JobReportExportInput, authority: JobReportReadResult, signal: AbortSignal) {
  const response = await fetch('/api/reports/jobs/export/preview', {
    method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal,
  });
  if (!response.ok) return responseError(response);
  const preview = jobReportExportPreviewSchema.parse(await response.json());
  if (JSON.stringify(preview.input) !== JSON.stringify(input) || preview.workspaceId !== authority.workspaceId ||
    preview.viewerId !== authority.viewerId || preview.policyRevision !== authority.policyRevision ||
    preview.scope !== authority.exportScope || !authority.exportScope ||
    preview.today !== authority.today || preview.timezone !== authority.report.timezone) throw new JobCSVChangedError();
  return preview;
}
export async function receiveJobCSV(preview: JobReportExportPreview, signal: AbortSignal): Promise<Blob> {
  const response = await fetch('/api/reports/jobs/export', {
    method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preview.input), signal,
  });
  if (!response.ok) return responseError(response);
  return receiveReportCSV(response, preview.columns, jobReportExportGenerationSchema, metadata => {
    if (metadata.workspaceId !== preview.workspaceId || metadata.policyRevision !== preview.policyRevision ||
      metadata.scope !== preview.scope || metadata.archiveVisibility !== preview.archiveVisibility ||
      metadata.count !== preview.count || metadata.today !== preview.today || metadata.timezone !== preview.timezone ||
      metadata.dateBasis !== preview.dateBasis || JSON.stringify(metadata.limits) !== JSON.stringify(preview.limits) ||
      Date.parse(metadata.asOf) < Date.parse(preview.asOf)) throw new JobCSVChangedError();
  }, signal, 'Jobs');
}
export { saveReportCSV as saveJobCSV } from '../save-report-csv';
