import { resolveCaptureLocalTime } from '@salesmora/contracts';
import { captureSetupReviewData as copy } from './capture-setup-review.data';
export type CaptureReviewSection = keyof typeof copy.sections;
export type CaptureReviewCheck = keyof typeof copy.checks;
export type CaptureSetupReviewDraft = {
  id: string; version: number; name: string; source: 'website' | 'gmail'; timezone: string;
  sections: readonly { id: CaptureReviewSection; rows: readonly { label: string; value: string }[] }[];
  checks: readonly { id: CaptureReviewCheck; status: 'ready' | 'blocked' | 'checking'; detail?: string }[];
};
export type CaptureLaunchValue = { mode: 'now' | 'scheduled'; localDateTime: string };
export type CaptureLaunchTiming = { kind: 'now' } | { kind: 'scheduled'; at: string; timezone: string; localDateTime: string };
export type CaptureLaunchRequest = { draft: CaptureSetupReviewDraft; timing: CaptureLaunchTiming };

/** Resolve a wall-clock time through Intl; reject gaps and folds rather than silently choosing an instant. */
export function resolveCaptureLaunchTime(local: string, timezone: string): { at?: string; error?: string } {
  const result = resolveCaptureLocalTime(local, timezone);
  return result.error ? { error: copy.errors[result.error] } : result;
}
/** Presentation checks supplement the authoritative launch boundary; never substitute for it. */
export function captureLaunchReadiness(draft: CaptureSetupReviewDraft): boolean {
  const checks: CaptureReviewCheck[] = ['source', 'fields', 'workflow', 'access', 'capacity', ...(draft.source === 'gmail' ? ['account', 'sample'] as const : [])];
  return !!draft.id && !!draft.name.trim() && Number.isSafeInteger(draft.version) && draft.version > 0 && ['website', 'gmail'].includes(draft.source)
    && new Set(draft.sections.map(section => section.id)).size === draft.sections.length
    && (Object.keys(copy.sections) as CaptureReviewSection[]).every(key => draft.sections.some(section => section.id === key && section.rows.length > 0))
    && new Set(draft.checks.map(check => check.id)).size === draft.checks.length
    && checks.every(id => draft.checks.some(check => check.id === id && check.status === 'ready'))
    && draft.checks.every(check => check.status === 'ready');
}
export function captureLaunchTiming(value: CaptureLaunchValue, timezone: string, now: number): { timing?: CaptureLaunchTiming; error?: string } {
  try { new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(now); } catch { return { error: copy.errors.zone }; }
  if (value.mode === 'now') return { timing: { kind: 'now' } };
  if (value.mode !== 'scheduled') return { error: copy.errors.date };
  const result = resolveCaptureLaunchTime(value.localDateTime, timezone);
  if (!result.at) return { error: result.error };
  if (Date.parse(result.at) <= now) return { error: copy.errors.future };
  return { timing: { kind: 'scheduled', at: result.at, timezone, localDateTime: value.localDateTime } };
}
