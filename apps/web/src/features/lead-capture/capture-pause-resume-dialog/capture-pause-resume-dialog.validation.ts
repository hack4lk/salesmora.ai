export type CaptureIntakeAction = 'pause' | 'resume';
export type CaptureIntakeSource = {
  id: string; version: number; name: string; type: 'website' | 'gmail';
  status: 'draft' | 'active' | 'paused' | 'scheduled' | 'archived';
  canPause: boolean; canResume: boolean;
  resumeReadiness: 'ready' | 'checking' | 'blocked'; resumeReason?: string;
  approved: readonly { label: string; value: string }[];
};
export type CaptureIntakeRequest = { action: CaptureIntakeAction; source: CaptureIntakeSource };
/** Presentation guards; the mutation boundary must reauthorize and compare the source version. */
export function captureIntakeIssue(source: CaptureIntakeSource, action: CaptureIntakeAction): 'invalid' | 'unavailable' | 'forbidden' | 'checking' | 'blocked' | null {
  if (!source.id || !source.name.trim() || !Number.isSafeInteger(source.version) || source.version < 1 || !['website', 'gmail'].includes(source.type) || !['pause', 'resume'].includes(action)) return 'invalid';
  if (source.status !== (action === 'pause' ? 'active' : 'paused')) return 'unavailable';
  if ((action === 'pause' ? source.canPause : source.canResume) !== true) return 'forbidden';
  if (action === 'resume') {
    if (!source.approved.length || source.approved.some(row => !row.label.trim() || !row.value.trim())) return 'invalid';
    if (source.resumeReadiness !== 'ready') return source.resumeReadiness === 'checking' ? 'checking' : 'blocked';
  }
  return null;
}
