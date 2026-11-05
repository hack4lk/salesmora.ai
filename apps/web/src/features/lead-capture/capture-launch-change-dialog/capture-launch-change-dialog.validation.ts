import { captureLaunchTiming, type CaptureLaunchTiming, type CaptureLaunchValue } from '../capture-setup-review/capture-setup-review.validation';
export type CaptureScheduledSource = {
  pendingRevision?: boolean;
  id: string; version: number; name: string; type: 'website' | 'gmail';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'archived';
  scheduledAt: string; timezone: string; canChange: boolean;
  readiness: 'ready' | 'checking' | 'blocked'; reason?: string;
};
export type CaptureLaunchChangeRequest = { source: CaptureScheduledSource; timing: CaptureLaunchTiming };
export function captureScheduledSourceIssue(source: CaptureScheduledSource, now: number): 'invalid' | 'unavailable' | 'forbidden' | 'elapsed' | 'checking' | 'blocked' | null {
  if (!source.id || !source.name.trim() || !Number.isSafeInteger(source.version) || source.version < 1 || !['website', 'gmail'].includes(source.type)) return 'invalid';
  if (source.status !== 'scheduled' && !(source.status === 'active' && source.pendingRevision)) return 'unavailable';
  if (source.canChange !== true) return 'forbidden';
  try { if (!/(Z|[+-]\d{2}:\d{2})$/.test(source.scheduledAt) || !Number.isFinite(Date.parse(source.scheduledAt))) return 'invalid'; new Intl.DateTimeFormat('en-US', { timeZone: source.timezone }).format(new Date(source.scheduledAt)); } catch { return 'invalid'; }
  if (!Number.isFinite(now) || Date.parse(source.scheduledAt) <= now) return 'elapsed';
  if (source.readiness !== 'ready') return source.readiness === 'checking' ? 'checking' : 'blocked';
  return null;
}
export function captureLaunchChangeTiming(source: CaptureScheduledSource, value: CaptureLaunchValue, now: number) {
  const result = captureLaunchTiming(value, source.timezone, now);
  return { ...result, unchanged: result.timing?.kind === 'scheduled' && Date.parse(result.timing.at) === Date.parse(source.scheduledAt) };
}
