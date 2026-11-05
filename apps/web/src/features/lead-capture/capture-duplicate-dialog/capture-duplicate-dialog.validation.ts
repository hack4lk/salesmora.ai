import { captureDuplicateDialogData as copy } from './capture-duplicate-dialog.data';
export type CaptureDuplicateSource = {
  id: string; version: number; name: string; type: 'website' | 'gmail';
  status: 'draft' | 'active' | 'paused' | 'scheduled' | 'archived'; canDuplicate: boolean;
  readiness: 'ready' | 'checking' | 'blocked'; reason?: string;
  configuration: { kind: 'approved' | 'draft'; version: number; summary: readonly { label: string; value: string }[] };
};
export type CaptureDuplicateRequest = { sourceId: string; expectedVersion: number; configuration: { kind: 'approved' | 'draft'; version: number }; name: string; to: 'draft'; requestId: string };
export function captureDuplicateIssue(source: CaptureDuplicateSource): 'invalid' | 'forbidden' | 'checking' | 'blocked' | null {
  if (!source.id || !source.name.trim() || !Number.isSafeInteger(source.version) || source.version < 1 || !['website', 'gmail'].includes(source.type) || !['draft', 'active', 'paused', 'scheduled', 'archived'].includes(source.status)) return 'invalid';
  if (source.canDuplicate !== true) return 'forbidden';
  if (!['approved', 'draft'].includes(source.configuration.kind) || !Number.isSafeInteger(source.configuration.version) || source.configuration.version < 1 || !source.configuration.summary.length || source.configuration.summary.some(row => !row.label.trim() || !row.value.trim())) return 'invalid';
  if (source.readiness !== 'ready') return source.readiness === 'checking' ? 'checking' : 'blocked';
  return null;
}
export function validCaptureDuplicateName(value: string): boolean { return !!value.trim() && value.length <= 80; }
export function captureDuplicateName(original: string): string {
  let base = '';
  for (const char of (original.trim() || copy.defaultName)) { if (base.length + char.length + copy.suffix.length > 80) break; base += char; }
  return `${base.trimEnd()}${copy.suffix}`;
}
