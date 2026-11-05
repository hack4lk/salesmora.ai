import { captureLaunchReadiness, captureLaunchTiming, type CaptureLaunchRequest } from '../capture-setup-review/capture-setup-review.validation';
import { validCapturePublication, type CapturePublication } from '../capture-publication-instructions/capture-publication-instructions.validation';
export type CaptureReviewLaunchRequest = CaptureLaunchRequest & { requestId: string };
export type CaptureReviewLaunchResult = {
  draftId: string; draftVersion: number; sourceId: string; sourceVersion: number; source: 'website' | 'gmail'; name: string;
  status: 'active' | 'scheduled'; scheduledAt?: string; timezone?: string; publication?: CapturePublication;
};
/** Presentation validation only. The launch adapter must atomically reauthorize, revalidate and reserve capacity. */
export function validCaptureReviewRequest(request: CaptureLaunchRequest, now: number): boolean {
  if (!captureLaunchReadiness(request.draft)) return false;
  const value = request.timing.kind === 'now' ? { mode: 'now' as const, localDateTime: '' } : { mode: 'scheduled' as const, localDateTime: request.timing.localDateTime };
  const timing = captureLaunchTiming(value, request.draft.timezone, now).timing;
  return !!timing && (timing.kind === 'now' ? request.timing.kind === 'now' : request.timing.kind === 'scheduled' && timing.at === request.timing.at && timing.timezone === request.timing.timezone && timing.localDateTime === request.timing.localDateTime);
}
/** Bind completion and public artifacts to the exact reviewed version and requested timing. */
export function validCaptureReviewResult(request: CaptureLaunchRequest, result: CaptureReviewLaunchResult): boolean {
  const scheduled = request.timing.kind === 'scheduled';
  if (result.draftId !== request.draft.id || result.draftVersion !== request.draft.version || result.name !== request.draft.name || result.source !== request.draft.source || !result.sourceId.trim() || !Number.isSafeInteger(result.sourceVersion) || result.sourceVersion < 1 || result.status !== (scheduled ? 'scheduled' : 'active')) return false;
  if (request.timing.kind === 'scheduled' ? result.scheduledAt !== request.timing.at || result.timezone !== request.timing.timezone : result.scheduledAt !== undefined) return false;
  if (result.source === 'gmail') return result.publication === undefined;
  const publication = result.publication;
  return !!publication && validCapturePublication(publication) && publication.id === result.sourceId && publication.version === result.sourceVersion && publication.name === result.name && publication.status === result.status && publication.scheduledAt === result.scheduledAt && (!scheduled || (publication.scheduledAt === result.scheduledAt && publication.timezone === result.timezone));
}
