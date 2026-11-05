/** Deliberate read-only aliases. Never OR legacy and canonical permissions or add a missing grant. */
export const legacyCapturePermissions = {
  'campaigns.read': 'leadCapture.read', 'campaigns.create': 'leadCapture.create', 'campaigns.update': 'leadCapture.update',
  'campaigns.activate': 'leadCapture.activate', 'campaigns.pause': 'leadCapture.pause', 'campaigns.archive': 'leadCapture.archive',
} as const;
export function canonicalCapturePermission(permission: string): string {
  return Object.hasOwn(legacyCapturePermissions, permission) ? legacyCapturePermissions[permission as keyof typeof legacyCapturePermissions] : permission;
}
export function canonicalCaptureResource(kind: string): string { return kind === 'campaign' ? 'capture_source' : kind; }
export function canonicalCaptureOrigin(origin: 'manual' | 'gmail' | 'campaign' | 'lead_capture'): 'manual' | 'gmail' | 'lead_capture';
export function canonicalCaptureOrigin(origin: string): string;
export function canonicalCaptureOrigin(origin: string): string { return origin === 'campaign' ? 'lead_capture' : origin; }
export function readPublishedCaptureSourceLimit(limits: { publishedCaptureSources?: number | null; publishedCampaigns?: number | null }): number | null {
  const current = limits.publishedCaptureSources, legacy = limits.publishedCampaigns;
  if (current !== undefined && legacy !== undefined && current !== legacy) throw new Error('Conflicting capture source limits');
  const value = current !== undefined ? current : legacy;
  if (value !== null && (!Number.isSafeInteger(value) || value! < 0)) throw new Error('Invalid capture source limit');
  return value!;
}
