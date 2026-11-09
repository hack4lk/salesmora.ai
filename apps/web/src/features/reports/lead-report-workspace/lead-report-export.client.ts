import { leadReportExportInputSchema, leadReportExportPreviewSchema, leadReportExportGenerationSchema,
  type LeadReportQuery, type LeadReportReadResult, type LeadReportExportInput, type LeadReportExportPreview } from '@salesmora/contracts';

export const leadExportLabels: Record<LeadReportExportInput['dataset'], string> = {
  evidence: 'Full selected evidence', 'intake-days': 'Daily intake table', 'intake-sources': 'Intake sources table',
  'pipeline-stages': 'Pipeline stages table', 'age-bands': 'Age bands table', outcomes: 'Outcomes table',
  'attention-categories': 'Attention categories table',
};
export function leadExportDatasets(view: LeadReportQuery['view']): LeadReportExportInput['dataset'][] {
  return ['evidence', ...(view === 'intake' ? ['intake-days', 'intake-sources'] as const
    : view === 'pipeline' ? ['pipeline-stages'] as const : view === 'age' ? ['age-bands'] as const
      : view === 'attention' ? ['attention-categories'] as const : ['outcomes'] as const)];
}
export function leadExportInput(query: LeadReportQuery, dataset: LeadReportExportInput['dataset']) {
  return leadReportExportInputSchema.parse({ dataset, query: Object.fromEntries(Object.entries(query)
    .filter(([key]) => key !== 'page' && key !== 'pageSize' && (dataset === 'evidence' || key !== 'trendBucket'))) });
}
export function leadExportFilename(input: LeadReportExportInput, today: string) {
  return `salesmora-leads-${input.query.view}-${input.dataset}-${today}.csv`;
}
export class LeadCSVChangedError extends Error {
  constructor() { super('Export data or access changed. Refresh the preview and review again.'); }
}
export class LeadCSVDeniedError extends Error {
  constructor() { super('This report export is unavailable under current access.'); }
}
async function responseError(response: Response): Promise<never> {
  if ([401, 403, 404, 423].includes(response.status)) throw new LeadCSVDeniedError();
  throw new Error(response.status === 422 ? 'Check the report selection and technical CSV limits.' : 'Report CSV could not be completed. Try again.');
}
export async function loadLeadCSVPreview(input: LeadReportExportInput, authority: LeadReportReadResult, signal: AbortSignal) {
  const response = await fetch('/api/reports/leads/export/preview', { method: 'POST', cache: 'no-store',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal });
  if (!response.ok) return responseError(response);
  const preview = leadReportExportPreviewSchema.parse(await response.json());
  if (JSON.stringify(preview.input) !== JSON.stringify(input) || preview.workspaceId !== authority.workspaceId ||
    preview.viewerId !== authority.viewerId || preview.policyRevision !== authority.policyRevision ||
    preview.scope !== authority.exportScope || preview.archiveVisibility !== authority.archiveVisibility ||
    preview.today !== authority.report.today || preview.timezone !== authority.report.timezone) throw new LeadCSVChangedError();
  return preview;
}
export async function receiveLeadCSV(preview: LeadReportExportPreview, signal: AbortSignal): Promise<Blob> {
  const response = await fetch('/api/reports/leads/export', { method: 'POST', cache: 'no-store',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(preview.input), signal });
  if (!response.ok) return responseError(response);
  if (!response.body) throw new Error('Report CSV response is incomplete.');
  const reader = response.body.getReader();
  let readerFailed = false;
  const cancel = () => { void reader.cancel().catch(() => console.error('Report CSV response cancellation failed.')); };
  signal.addEventListener('abort', cancel, { once: true });
  try {
    const encoded = response.headers.get('x-report-export');
    if (!encoded || encoded.length > 2048 || !/^[A-Za-z0-9_-]+$/.test(encoded)) throw new Error('Report CSV generation metadata is invalid.');
    const bytes = Uint8Array.from(atob(encoded.replaceAll('-', '+').replaceAll('_', '/')), char => char.charCodeAt(0));
    const metadata = leadReportExportGenerationSchema.parse(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)));
    if (metadata.workspaceId !== preview.workspaceId || metadata.policyRevision !== preview.policyRevision ||
      metadata.scope !== preview.scope || metadata.archiveVisibility !== preview.archiveVisibility ||
      metadata.count !== preview.count || metadata.today !== preview.today || metadata.timezone !== preview.timezone ||
      metadata.dateBasis !== preview.dateBasis || JSON.stringify(metadata.limits) !== JSON.stringify(preview.limits) ||
      Date.parse(metadata.asOf) < Date.parse(preview.asOf)) throw new LeadCSVChangedError();
    if (response.headers.get('content-type')?.toLowerCase() !== 'text/csv; charset=utf-8') throw new Error('Report CSV response type is invalid.');
    const chunks: ArrayBuffer[] = [];
    let size = 0, lines = 0, previous = -1;
    while (true) {
      signal.throwIfAborted();
      let next: ReadableStreamReadResult<Uint8Array>;
      try { next = await reader.read(); }
      catch (error) { readerFailed = true; throw error; }
      if (next.done) break;
      size += next.value.byteLength;
      if (size > metadata.limits.bytes) throw new Error('Report CSV exceeds the byte limit. No file was saved.');
      // Native report labels/cells reject control characters, so CRLF counts CSV records.
      for (const byte of next.value) { if (previous === 13 && byte === 10) lines++; previous = byte; }
      chunks.push(Uint8Array.from(next.value).buffer);
    }
    signal.throwIfAborted();
    const blob = new Blob(chunks, { type: 'text/csv; charset=utf-8' });
    const header = new TextEncoder().encode('\uFEFF' + preview.columns.map(column => `"${column}"`).join(',') + '\r\n');
    const receivedHeader = new Uint8Array(await blob.slice(0, header.length).arrayBuffer());
    if (receivedHeader.length !== header.length || !header.every((byte, index) => byte === receivedHeader[index]) ||
      lines !== metadata.count + 1 || previous !== 10) throw new Error('Report CSV response is incomplete or does not match the reviewed rows.');
    return blob;
  } catch (error) {
    if (!readerFailed) await reader.cancel().catch(() => console.error('Report CSV response cancellation failed.'));
    throw error;
  } finally { signal.removeEventListener('abort', cancel); reader.releaseLock(); }
}
export function saveLeadCSV(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = filename; link.hidden = true;
  try { document.body.append(link); link.click(); }
  finally { link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
}
