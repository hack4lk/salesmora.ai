import { captureSourceDetailsData as details } from '../capture-source-details/capture-source-details.data';
import { capturePublicationInstructionsData as publication } from '../capture-publication-instructions/capture-publication-instructions.data';
import type { CapturePublication } from '../capture-publication-instructions/capture-publication-instructions.validation';
import { captureDashboardPageData as copy } from './capture-dashboard-page.data';
import type { CaptureDashboardRecord } from './capture-dashboard-page.validation';
export function captureDashboardFixture(type: 'website' | 'gmail' = 'website', status: CaptureDashboardRecord['status'] = 'active'): CaptureDashboardRecord {
  return { id: 'source-one', version: 4, name: type === 'website' ? details.stories.name : details.stories.gmailName, type, status,
    configuration: { kind: status === 'draft' ? 'draft' : 'approved', version: 2, rows: type === 'website' ? details.stories.rows : details.stories.gmailRows },
    availability: type === 'website' ? { type, status: status === 'draft' ? 'unpublished' : 'published' } : { type, status: 'connected', email: details.stories.email },
    allowedActions: ['pause', 'resume', 'archive', 'restore', 'duplicate', 'change-launch'], resumeReadiness: 'ready', restoreReadiness: 'ready', timezone: copy.stories.timezone, ...(status === 'scheduled' ? { scheduledAt: copy.stories.scheduledAt } : {}),
  };
}
export function captureDashboardPublicationFixture(source: CaptureDashboardRecord): CapturePublication | null {
  if (source.type !== 'website' || source.configuration.kind !== 'approved' || source.status === 'draft') return null;
  return { id: source.id, version: source.configuration.version, name: source.name, status: source.intakeBlocked ? 'blocked' : source.status, hostedUrl: publication.stories.url, embeds: [{ method: 'iframe', code: publication.stories.code }, { method: 'javascript', code: publication.stories.script }], ...(source.status === 'scheduled' ? { scheduledAt: source.scheduledAt, timezone: source.timezone } : {}) };
}
