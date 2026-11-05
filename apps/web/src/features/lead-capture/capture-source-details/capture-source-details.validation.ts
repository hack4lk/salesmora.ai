import { validCaptureDashboardSource, type CaptureDashboardSource } from '../capture-dashboard-summary/capture-dashboard-summary.validation';
export type CaptureSourceConfiguration = { kind: 'approved' | 'draft'; version: number; rows: readonly { label: string; value: string }[] };
/** Do not present an unpublished revision as the configuration currently in use. */
export function validCaptureSourceConfiguration(source: CaptureDashboardSource, configuration: CaptureSourceConfiguration | undefined, draftVersion?: number): configuration is CaptureSourceConfiguration {
  return validCaptureDashboardSource(source) && !!configuration
    && (configuration.kind === 'draft' ? ['draft', 'paused', 'archived'].includes(source.status) : configuration.kind === 'approved' && source.status !== 'draft')
    && Number.isSafeInteger(configuration.version) && configuration.version > 0
    && configuration.rows.length > 0 && configuration.rows.every(row => !!row.label.trim() && !!row.value.trim())
    && (draftVersion === undefined || configuration.kind === 'approved' && Number.isSafeInteger(draftVersion) && draftVersion > configuration.version);
}
