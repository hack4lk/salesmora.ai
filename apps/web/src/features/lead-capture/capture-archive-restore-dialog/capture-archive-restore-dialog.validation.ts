export type CaptureArchiveAction = 'archive' | 'restore';
export type CaptureArchiveSource = {
  id: string; version: number; name: string; type: 'website' | 'gmail';
  status: 'draft' | 'active' | 'paused' | 'scheduled' | 'archived';
  canArchive: boolean; canRestore: boolean;
  restoreReadiness: 'ready' | 'checking' | 'blocked'; restoreReason?: string;
};
export type CaptureArchiveRequest = { action: CaptureArchiveAction; source: CaptureArchiveSource; to: 'archived' | 'paused' };
/** Server enforcement must reauthorize/version-check and acquire a slot atomically on restoration. */
export function captureArchiveIssue(source: CaptureArchiveSource, action: CaptureArchiveAction): 'invalid' | 'unavailable' | 'forbidden' | 'checking' | 'blocked' | null {
  if (!source.id || !source.name.trim() || !Number.isSafeInteger(source.version) || source.version < 1 || !['website', 'gmail'].includes(source.type) || !['archive', 'restore'].includes(action)) return 'invalid';
  if (!['draft', 'active', 'paused', 'scheduled', 'archived'].includes(source.status) || (action === 'restore' ? source.status !== 'archived' : source.status === 'archived')) return 'unavailable';
  if ((action === 'archive' ? source.canArchive : source.canRestore) !== true) return 'forbidden';
  if (action === 'restore' && source.restoreReadiness !== 'ready') return source.restoreReadiness === 'checking' ? 'checking' : 'blocked';
  return null;
}
