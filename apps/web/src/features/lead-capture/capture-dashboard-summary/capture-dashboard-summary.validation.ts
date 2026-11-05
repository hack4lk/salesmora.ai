export type CaptureSourceTotals = { captured: number; awaitingReview: number; approved: number };
export type CaptureDashboardSource = {
  id: string; name: string; type: 'website' | 'gmail'; status: 'draft' | 'active' | 'paused' | 'scheduled' | 'archived';
  intakeBlocked?: boolean; attention?: string;
};
export function validCaptureSourceTotals(totals: CaptureSourceTotals | undefined): totals is CaptureSourceTotals {
  return !!totals && [totals.captured, totals.awaitingReview, totals.approved].every(count => Number.isSafeInteger(count) && count >= 0)
    && totals.awaitingReview + totals.approved <= totals.captured;
}
export function validCaptureDashboardSource(source: CaptureDashboardSource): boolean {
  return !!source.id && !!source.name.trim() && ['website', 'gmail'].includes(source.type) && ['draft', 'active', 'paused', 'scheduled', 'archived'].includes(source.status);
}
/** Navigation stays within this app; the host must supply a tenant/source-scoped Intake Review URL. */
export function validCaptureIntakeHref(href: string | undefined): href is string {
  if (!href || !href.startsWith('/') || href.startsWith('//') || /[\\\u0000-\u0020\u007f]/.test(href)) return false;
  try { return new URL(href, 'https://salesmora.invalid').origin === 'https://salesmora.invalid'; } catch { return false; }
}
