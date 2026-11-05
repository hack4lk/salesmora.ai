import { captureSetupReviewData as review } from '../capture-setup-review/capture-setup-review.data';
import { capturePublicationInstructionsData as publication } from '../capture-publication-instructions/capture-publication-instructions.data';
import type { CaptureLaunchRequest, CaptureSetupReviewDraft } from '../capture-setup-review/capture-setup-review.validation';
import type { CaptureReviewLaunchResult } from './capture-review-page.validation';
const fixture = review.stories;
/** Saved summary/readiness fixtures; production must project the authoritative saved configuration. */
export function captureReviewFixture(source: 'website' | 'gmail' = 'website'): CaptureSetupReviewDraft {
  return { id: `${source}-draft`, version: 6, name: fixture.name, source, timezone: fixture.timezone,
    sections: [
      { id: 'source', rows: [{ label: fixture.nameLabel, value: fixture.name }, { label: fixture.typeLabel, value: source === 'gmail' ? fixture.gmail : fixture.website }, { label: fixture.destinationLabel, value: fixture.destination }, ...(source === 'gmail' ? [{ label: fixture.rulesLabel, value: fixture.rules }] : [])] },
      { id: 'fields', rows: [{ label: fixture.fieldsLabel, value: fixture.fields }, ...(source === 'gmail' ? [{ label: fixture.sampleLabel, value: fixture.sample }] : [])] },
      { id: 'workflow', rows: [{ label: fixture.assignmentLabel, value: fixture.assignment }, { label: fixture.stageLabel, value: fixture.stage }, { label: fixture.tagsLabel, value: fixture.tags }, { label: fixture.notificationsLabel, value: fixture.notifications }] },
    ], checks: (['source', 'fields', 'workflow', 'access', 'capacity', ...(source === 'gmail' ? ['account', 'sample'] as const : [])] as const).map(id => ({ id, status: 'ready' })),
  };
}
export function captureReviewResultFixture(request: CaptureLaunchRequest): CaptureReviewLaunchResult {
  const scheduled = request.timing.kind === 'scheduled' ? { scheduledAt: request.timing.at, timezone: request.timing.timezone } : {};
  const result: CaptureReviewLaunchResult = { draftId: request.draft.id, draftVersion: request.draft.version, sourceId: 'preview-source', sourceVersion: 1, name: request.draft.name, source: request.draft.source, status: request.timing.kind === 'scheduled' ? 'scheduled' : 'active', ...scheduled };
  if (result.source === 'website') result.publication = { id: result.sourceId, version: result.sourceVersion, name: result.name, status: result.status, ...scheduled, hostedUrl: publication.stories.url, embeds: [{ method: 'iframe', code: publication.stories.code }, { method: 'javascript', code: publication.stories.script }] };
  return result;
}
