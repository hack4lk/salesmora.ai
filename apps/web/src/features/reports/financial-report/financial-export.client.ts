import { financialReportExportInputSchema, financialReportExportPreviewSchema, financialReportExportGenerationSchema,
  type FinancialReportExportInput, type FinancialReportExportPreview, type FinancialReportQuery,
  type FinancialReportReadResult } from '@salesmora/contracts';
import { receiveReportCSV } from '../receive-report-csv';

export const financialExportLabels: Record<FinancialReportExportInput['dataset'], string> = {
  summary: 'Selected section summary', evidence: 'Selected section evidence',
};
export function financialExportInput(query: FinancialReportQuery, dataset: FinancialReportExportInput['dataset']) {
  const { page, pageSize, ...unpaged } = query;
  void page; void pageSize;
  return financialReportExportInputSchema.parse({ dataset, query: unpaged });
}
export function financialExportFilename(input: FinancialReportExportInput, today: string) {
  return `salesmora-${input.query.view}-${input.dataset}-${today}.csv`;
}
export class FinancialCSVChangedError extends Error {
  constructor() { super('Financial export data or access changed. Refresh the preview and review again.'); }
}
export class FinancialCSVDeniedError extends Error {
  constructor() { super('This Financial section is unavailable under current export access. Change the selection or reload access.'); }
}
async function responseError(response: Response): Promise<never> {
  if ([401, 403, 404, 423].includes(response.status)) throw new FinancialCSVDeniedError();
  throw new Error(response.status === 422 ? 'Check the Financial selection and technical CSV limits.'
    : 'Financial CSV could not be completed. Try again.');
}
export async function loadFinancialCSVPreview(
  input: FinancialReportExportInput, authority: FinancialReportReadResult, signal: AbortSignal,
) {
  const access = input.query.selected === 'materials' ? authority.exportAccess.materials : authority.exportAccess.estimates;
  if (!access) throw new FinancialCSVDeniedError();
  const response = await fetch('/api/reports/financial/export/preview', {
    method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal,
  });
  if (!response.ok) return responseError(response);
  const preview = financialReportExportPreviewSchema.parse(await response.json());
  const scope = typeof access === 'string' ? access : access.scope;
  const jobScope = typeof access === 'string' ? null : access.jobScope;
  if (JSON.stringify(preview.input) !== JSON.stringify(input) || preview.workspaceId !== authority.workspaceId ||
    preview.viewerId !== authority.viewerId || preview.policyRevision !== authority.policyRevision ||
    preview.scope !== scope || preview.jobScope !== jobScope ||
    preview.archiveVisibility !== (input.query.selected === 'accepted' ? authority.authority.estimates?.archives : 'excluded') ||
    preview.today !== authority.today || preview.timezone !== authority.timezone) throw new FinancialCSVChangedError();
  return preview;
}
export async function receiveFinancialCSV(preview: FinancialReportExportPreview, signal: AbortSignal): Promise<Blob> {
  const response = await fetch('/api/reports/financial/export', {
    method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preview.input), signal,
  });
  if (!response.ok) return responseError(response);
  return receiveReportCSV(response, preview.columns, financialReportExportGenerationSchema, metadata => {
    if (metadata.workspaceId !== preview.workspaceId || metadata.policyRevision !== preview.policyRevision ||
      metadata.section !== preview.section || metadata.scope !== preview.scope || metadata.jobScope !== preview.jobScope ||
      metadata.archiveVisibility !== preview.archiveVisibility ||
      metadata.count !== preview.count || metadata.today !== preview.today || metadata.timezone !== preview.timezone ||
      JSON.stringify(metadata.limits) !== JSON.stringify(preview.limits) ||
      Date.parse(metadata.asOf) < Date.parse(preview.asOf)) throw new FinancialCSVChangedError();
  }, signal, 'Financial');
}
export { saveReportCSV as saveFinancialCSV } from '../save-report-csv';
