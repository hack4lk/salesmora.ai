import { capturePublicationResultSchema, captureDraftSavedSchema, captureDetailViewSchema, captureLifecycleSavedSchema } from '@salesmora/contracts';
export class CaptureRequestError extends Error { constructor(readonly status: number, message: string) { super(message); } }
async function captureMutation(path: string, method: 'POST' | 'PUT' | 'PATCH', input: unknown, signal?: AbortSignal) {
  const response = await fetch(path, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), cache: 'no-store', signal });
  const result = await response.json();
  if (!response.ok) throw new CaptureRequestError(response.status, typeof result.error === 'string' ? result.error : 'The draft could not be saved.');
  return result;
}
export function captureHref(workspaceId: string, sourceId?: string, setup = false) { return `/lead-capture${sourceId ? `/${sourceId}${setup ? '/setup' : ''}` : ''}?workspace=${encodeURIComponent(workspaceId)}`; }

export async function captureWrite(path: string, method: 'POST' | 'PUT' | 'PATCH', input: unknown) { return captureDraftSavedSchema.parse(await captureMutation(path, method, input)); }
export async function capturePublicationWrite(path: string, input: unknown) { return capturePublicationResultSchema.parse(await captureMutation(path, 'POST', input)); }
export async function captureLifecycleWrite(sourceId: string, input: unknown) { return captureLifecycleSavedSchema.parse(await captureMutation(`/api/lead-capture/${sourceId}/lifecycle`, 'POST', input, AbortSignal.timeout(20_000))); }
export async function captureReadSource(workspaceId: string, sourceId: string) {
  const response = await fetch(`/api/lead-capture/${sourceId}?workspace=${encodeURIComponent(workspaceId)}`, { cache: 'no-store', signal: AbortSignal.timeout(15_000) });
  const result = await response.json();
  if (!response.ok) throw new CaptureRequestError(response.status, typeof result.error === 'string' ? result.error : 'The source could not be loaded.');
  const view = captureDetailViewSchema.parse(result);
  if (view.detail.source.id !== sourceId || view.detail.source.workspaceId !== workspaceId) throw new Error('The source could not be loaded.');
  return view;
}

export async function captureScheduleWrite(sourceId: string, input: unknown, method: 'PUT'|'PATCH') { return capturePublicationResultSchema.parse(await captureMutation(`/api/lead-capture/${sourceId}/publication`, method, input, AbortSignal.timeout(20000))); }
