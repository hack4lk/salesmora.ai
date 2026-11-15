import { teamReportExportInputSchema, teamReportExportPreviewSchema, teamReportExportGenerationSchema,
  teamReportExportSelectionAllowed, type TeamReportExportInput, type TeamReportExportPreview,
  type TeamReportQuery, type TeamReportReadResult } from '@salesmora/contracts';
import { receiveReportCSV } from '../receive-report-csv';

export const teamExportLabels: Record<TeamReportExportInput['dataset'], string> = {
  summary: 'Summary table', owners: 'Lead owner workload', members: 'Job member workload',
  unassigned: 'Unassigned Job workload', evidence: 'Selected evidence',
};
export function teamExportDatasetsForView(view: TeamReportQuery['view'], assigned: boolean): TeamReportExportInput['dataset'][] {
  return view === 'team-leads' ? ['summary', 'owners', 'evidence']
    : assigned ? ['summary', 'members', 'evidence'] : ['summary', 'members', 'unassigned', 'evidence'];
}
export function teamExportInput(query: TeamReportQuery, dataset: TeamReportExportInput['dataset']) {
  const { page, pageSize, ...unpaged } = query;
  void page; void pageSize;
  return teamReportExportInputSchema.parse({ dataset, query: unpaged });
}
export function teamExportFilename(input: TeamReportExportInput, today: string) {
  return `salesmora-${input.query.view}-${input.dataset}-${today}.csv`;
}
export class TeamCSVChangedError extends Error {
  constructor() { super('Team export data or access changed. Refresh the preview and review again.'); }
}
export class TeamCSVDeniedError extends Error {
  constructor() { super('This Team selection is unavailable under current export access. Change the selection or reload access.'); }
}
async function responseError(response: Response): Promise<never> {
  if ([401, 403, 404, 423].includes(response.status)) throw new TeamCSVDeniedError();
  throw new Error(response.status === 422 ? 'Check the Team selection and technical CSV limits.'
    : 'Team CSV could not be completed. Try again.');
}
export async function loadTeamCSVPreview(input: TeamReportExportInput, authority: TeamReportReadResult, signal: AbortSignal) {
  const scope = authority.exportScopes[input.query.view === 'team-leads' ? 'leads' : 'jobs'];
  if (!scope || !teamReportExportSelectionAllowed(input, scope)) throw new TeamCSVDeniedError();
  const response = await fetch('/api/reports/team/export/preview', {
    method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal,
  });
  if (!response.ok) return responseError(response);
  const preview = teamReportExportPreviewSchema.parse(await response.json());
  if (JSON.stringify(preview.input) !== JSON.stringify(input) || preview.workspaceId !== authority.workspaceId ||
    preview.viewerId !== authority.viewerId || preview.policyRevision !== authority.policyRevision ||
    JSON.stringify(preview.scope) !== JSON.stringify(scope) ||
    preview.today !== authority.report.today || preview.timezone !== authority.report.timezone) throw new TeamCSVChangedError();
  return preview;
}
export async function receiveTeamCSV(preview: TeamReportExportPreview, signal: AbortSignal): Promise<Blob> {
  const response = await fetch('/api/reports/team/export', {
    method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preview.input), signal,
  });
  if (!response.ok) return responseError(response);
  return receiveReportCSV(response, preview.columns, teamReportExportGenerationSchema, metadata => {
    if (metadata.workspaceId !== preview.workspaceId || metadata.policyRevision !== preview.policyRevision ||
      JSON.stringify(metadata.scope) !== JSON.stringify(preview.scope) || metadata.archiveVisibility !== preview.archiveVisibility ||
      metadata.count !== preview.count || metadata.today !== preview.today || metadata.timezone !== preview.timezone ||
      metadata.dateBasis !== preview.dateBasis || JSON.stringify(metadata.limits) !== JSON.stringify(preview.limits) ||
      Date.parse(metadata.asOf) < Date.parse(preview.asOf)) throw new TeamCSVChangedError();
  }, signal, 'Team');
}
export { saveReportCSV as saveTeamCSV } from '../save-report-csv';
