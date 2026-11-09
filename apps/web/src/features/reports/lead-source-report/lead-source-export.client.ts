import {
  leadSourceExportGenerationSchema,
  leadSourceExportInputSchema,
  leadSourceExportPreviewSchema,
  type LeadSourceExportInput,
  type LeadSourceExportPreview,
  type LeadSourceReadResult,
} from '@salesmora/contracts';
import type { LeadSourceQuery } from '@salesmora/contracts';

export const sourceExportLabels: Record<LeadSourceExportInput['dataset'], string> = {
  'source-groups': 'Source groups table',
  cohort: 'Full cohort evidence',
  converted: 'Converted leads and linked Jobs',
  'accepted-estimates': 'Accepted Estimate evidence',
};

export function sourceExportInput(query: LeadSourceQuery, dataset: LeadSourceExportInput['dataset']) {
  const selected = dataset === 'converted' ? 'converted'
    : dataset === 'accepted-estimates' ? 'accepted-estimates' : 'cohort';
  return leadSourceExportInputSchema.parse({
    dataset,
    query: { workspaceId: query.workspaceId, view: query.view, period: query.period, selected },
  });
}

export function sourceExportFilename(input: LeadSourceExportInput, today: string) {
  return `salesmora-sources-${input.dataset}-${today}.csv`;
}

export class SourceCSVChangedError extends Error {
  constructor() { super('Sources export data or access changed. Refresh the preview and review again.'); }
}
export class SourceCSVDeniedError extends Error {
  constructor() { super('This Sources export is unavailable under current access.'); }
}

async function responseError(response: Response): Promise<never> {
  if ([401, 403, 404, 423].includes(response.status)) throw new SourceCSVDeniedError();
  throw new Error(response.status === 422
    ? 'Check the Sources selection and technical CSV limits.'
    : 'Sources CSV could not be completed. Try again.');
}

export async function loadSourceCSVPreview(
  input: LeadSourceExportInput,
  authority: LeadSourceReadResult,
  signal: AbortSignal,
) {
  const response = await fetch('/api/reports/sources/export/preview', {
    method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input), signal,
  });
  if (!response.ok) return responseError(response);
  const preview = leadSourceExportPreviewSchema.parse(await response.json());
  if (JSON.stringify(preview.input) !== JSON.stringify(input) ||
    preview.workspaceId !== authority.workspaceId || preview.viewerId !== authority.viewerId ||
    preview.policyRevision !== authority.policyRevision || preview.leadScope !== authority.scope ||
    preview.leadArchiveVisibility !== authority.archiveVisibility ||
    preview.today !== authority.report.today || preview.timezone !== authority.report.timezone ||
    !authority.canExport) throw new SourceCSVChangedError();
  return preview;
}

export async function receiveSourceCSV(preview: LeadSourceExportPreview, signal: AbortSignal): Promise<Blob> {
  const response = await fetch('/api/reports/sources/export', {
    method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preview.input), signal,
  });
  if (!response.ok) return responseError(response);
  if (!response.body) throw new Error('Sources CSV response is incomplete.');
  const reader = response.body.getReader();
  let readerFailed = false;
  const cancel = () => { void reader.cancel().catch(() => console.error('Sources CSV response cancellation failed.')); };
  signal.addEventListener('abort', cancel, { once: true });
  try {
    const encoded = response.headers.get('x-report-export');
    if (!encoded || encoded.length > 2048 || !/^[A-Za-z0-9_-]+$/.test(encoded)) {
      throw new Error('Sources CSV generation metadata is invalid.');
    }
    const bytes = Uint8Array.from(atob(encoded.replaceAll('-', '+').replaceAll('_', '/')),
      character => character.charCodeAt(0));
    const metadata = leadSourceExportGenerationSchema.parse(
      JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)),
    );
    if (metadata.id.length === 0 || metadata.workspaceId !== preview.workspaceId ||
      metadata.policyRevision !== preview.policyRevision || metadata.leadScope !== preview.leadScope ||
      metadata.leadArchiveVisibility !== preview.leadArchiveVisibility ||
      JSON.stringify(metadata.conversion) !== JSON.stringify(preview.conversion) ||
      JSON.stringify(metadata.acceptedValue) !== JSON.stringify(preview.acceptedValue) ||
      metadata.count !== preview.count || metadata.today !== preview.today ||
      metadata.timezone !== preview.timezone || metadata.dateBasis !== preview.dateBasis ||
      JSON.stringify(metadata.limits) !== JSON.stringify(preview.limits) ||
      Date.parse(metadata.asOf) < Date.parse(preview.asOf)) throw new SourceCSVChangedError();
    if (response.headers.get('content-type')?.toLowerCase() !== 'text/csv; charset=utf-8') {
      throw new Error('Sources CSV response type is invalid.');
    }
    const chunks: ArrayBuffer[] = [];
    let size = 0, lines = 0, previous = -1;
    while (true) {
      signal.throwIfAborted();
      let next: ReadableStreamReadResult<Uint8Array>;
      try { next = await reader.read(); }
      catch (error) { readerFailed = true; throw error; }
      if (next.done) break;
      size += next.value.byteLength;
      if (size > metadata.limits.bytes) throw new Error('Sources CSV exceeds the byte limit. No file was saved.');
      for (const byte of next.value) { if (previous === 13 && byte === 10) lines++; previous = byte; }
      chunks.push(Uint8Array.from(next.value).buffer);
    }
    signal.throwIfAborted();
    const blob = new Blob(chunks, { type: 'text/csv; charset=utf-8' });
    const header = new TextEncoder().encode('\uFEFF' + preview.columns.map(column => `"${column}"`).join(',') + '\r\n');
    const receivedHeader = new Uint8Array(await blob.slice(0, header.length).arrayBuffer());
    if (receivedHeader.length !== header.length || !header.every((byte, index) => byte === receivedHeader[index]) ||
      lines !== metadata.count + 1 || previous !== 10) {
      throw new Error('Sources CSV response is incomplete or does not match the reviewed rows.');
    }
    return blob;
  } catch (error) {
    if (!readerFailed) await reader.cancel().catch(() => console.error('Sources CSV response cancellation failed.'));
    throw error;
  } finally { signal.removeEventListener('abort', cancel); reader.releaseLock(); }
}

export { saveReportCSV as saveSourceCSV } from '../save-report-csv';
