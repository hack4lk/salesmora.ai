import { validCaptureSourceConfiguration, type CaptureSourceConfiguration } from '../capture-source-details/capture-source-details.validation';
import type { CaptureSourceDetailsProps } from '../capture-source-details/capture-source-details';
import type { CaptureDashboardSource } from '../capture-dashboard-summary/capture-dashboard-summary.validation';
import { validCapturePublication, type CapturePublication } from '../capture-publication-instructions/capture-publication-instructions.validation';
export type CaptureDashboardAction = 'pause' | 'resume' | 'archive' | 'restore' | 'duplicate' | 'change-launch';
export type CaptureDashboardRecord = CaptureDashboardSource & {
  version: number; configuration: CaptureSourceConfiguration; draftVersion?: number; availability: CaptureSourceDetailsProps['availability'];
  allowedActions: readonly CaptureDashboardAction[]; scheduledAt?: string; timezone: string;
  resumeReadiness: 'ready' | 'checking' | 'blocked'; restoreReadiness: 'ready' | 'checking' | 'blocked';
};
export function validCaptureDashboardRecord(source: CaptureDashboardRecord): boolean {
  if (!Number.isSafeInteger(source.version) || source.version < 1 || !validCaptureSourceConfiguration(source, source.configuration, source.draftVersion) || source.availability.type !== source.type || source.availability.type === 'gmail' && source.availability.status !== 'not-connected' && !source.availability.email?.trim()) return false;
  try { new Intl.DateTimeFormat('en-US', { timeZone: source.timezone }); } catch { return false; }
  return source.status !== 'scheduled' || !!source.scheduledAt && /(Z|[+-]\d{2}:\d{2})$/.test(source.scheduledAt) && Number.isFinite(Date.parse(source.scheduledAt));
}
/** Host capabilities narrow status-eligible actions; restoration never resumes intake. */
export function captureDashboardActions(source: CaptureDashboardRecord): readonly CaptureDashboardAction[] {
  if (!validCaptureDashboardRecord(source)) return [];
  const eligible: Record<CaptureDashboardSource['status'], readonly CaptureDashboardAction[]> = { draft: ['duplicate', 'archive'], active: ['pause', 'duplicate', 'archive'], paused: ['resume', 'duplicate', 'archive'], scheduled: ['change-launch', 'duplicate', 'archive'], archived: ['restore', 'duplicate'] };
  return eligible[source.status].filter(action => source.allowedActions.includes(action) && (action !== 'resume' || source.configuration.kind === 'approved'));
}
export function captureDashboardPublication(source: CaptureDashboardRecord, publication: CapturePublication | null): boolean {
  return source.type === 'website' && source.status !== 'draft' && !!publication && validCapturePublication(publication) && publication.id === source.id && publication.name === source.name && publication.version === source.configuration.version && publication.status === (source.intakeBlocked ? 'blocked' : source.status) && (source.status !== 'scheduled' || publication.scheduledAt === source.scheduledAt && publication.timezone === source.timezone);
}
