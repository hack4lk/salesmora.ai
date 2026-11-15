import { estimateReportExportInputSchema, estimateReportExportPreviewSchema, estimateReportExportGenerationSchema,
  type EstimateReportExportInput, type EstimateReportExportPreview, type EstimateReportQuery,
  type EstimateReportReadResult } from '@salesmora/contracts';
import { receiveReportCSV } from '../receive-report-csv';

export const estimateExportLabels: Record<EstimateReportExportInput['dataset'], string> = {
  summary: 'Summary table', evidence: 'Selected evidence',
};
export function estimateExportInput(query: EstimateReportQuery, dataset: EstimateReportExportInput['dataset']) {
  const { page, pageSize, ...unpaged } = query;
  void page; void pageSize;
  return estimateReportExportInputSchema.parse({ dataset, query: unpaged });
}
export function estimateExportFilename(input: EstimateReportExportInput, today: string) {
  return `salesmora-${input.query.view}-${input.dataset}-${today}.csv`;
}
export class EstimateCSVChangedError extends Error {
  constructor() { super('Estimate export data or access changed. Refresh the preview and review again.'); }
}
export class EstimateCSVDeniedError extends Error {
  constructor() { super('This Estimate selection is unavailable under current export access. Change the selection or reload access.'); }
}
async function responseError(response: Response): Promise<never> {
  if ([401, 403, 404, 423].includes(response.status)) throw new EstimateCSVDeniedError();
  throw new Error(response.status === 422 ? 'Check the Estimate selection and technical CSV limits.'
    : 'Estimate CSV could not be completed. Try again.');
}
export async function loadEstimateCSVPreview(
  input: EstimateReportExportInput, authority: EstimateReportReadResult, signal: AbortSignal,
) {
  const access = authority.exportAccess;
  if (!access || input.query.view === 'estimate-current' && input.query.selected === 'handoff' && !access.handoff ||
    access.scope === 'assigned_job' && input.query.filters.parents.includes('lead')) throw new EstimateCSVDeniedError();
  const response = await fetch('/api/reports/estimates/export/preview', {
    method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal,
  });
  if (!response.ok) return responseError(response);
  const preview = estimateReportExportPreviewSchema.parse(await response.json());
  if (JSON.stringify(preview.input) !== JSON.stringify(input) || preview.workspaceId !== authority.workspaceId ||
    preview.viewerId !== authority.viewerId || preview.policyRevision !== authority.policyRevision ||
    preview.scope !== access.scope || preview.handoff !== access.handoff ||
    preview.archiveVisibility !== (input.query.view === 'estimate-current' ? 'excluded' : authority.authority.archives) ||
    preview.today !== authority.today || preview.timezone !== authority.report.timezone) throw new EstimateCSVChangedError();
  return preview;
}
export async function receiveEstimateCSV(preview: EstimateReportExportPreview, signal: AbortSignal): Promise<Blob> {
  const response = await fetch('/api/reports/estimates/export', {
    method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preview.input), signal,
  });
  if (!response.ok) return responseError(response);
  return receiveReportCSV(response, preview.columns, estimateReportExportGenerationSchema, metadata => {
    if (metadata.workspaceId !== preview.workspaceId || metadata.policyRevision !== preview.policyRevision ||
      metadata.scope !== preview.scope || metadata.handoff !== preview.handoff ||
      metadata.archiveVisibility !== preview.archiveVisibility || metadata.count !== preview.count ||
      metadata.today !== preview.today || metadata.timezone !== preview.timezone ||
      metadata.dateBasis !== preview.dateBasis || JSON.stringify(metadata.limits) !== JSON.stringify(preview.limits) ||
      Date.parse(metadata.asOf) < Date.parse(preview.asOf)) throw new EstimateCSVChangedError();
  }, signal, 'Estimate');
}
export { saveReportCSV as saveEstimateCSV } from '../save-report-csv';
