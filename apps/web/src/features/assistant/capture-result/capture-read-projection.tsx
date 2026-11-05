'use client';
import type { CaptureChatResult } from '@salesmora/contracts';
import { CaptureSourceList } from '../../lead-capture/capture-source-list/capture-source-list';
import { CaptureDashboardSummary } from '../../lead-capture/capture-dashboard-summary/capture-dashboard-summary';
import { CaptureSourceDetails } from '../../lead-capture/capture-source-details/capture-source-details';
import { CapturePublicationInstructions } from '../../lead-capture/capture-publication-instructions/capture-publication-instructions';
import { CaptureReadinessChecks } from '../../lead-capture/capture-setup-review/capture-readiness-checks';
import { captureAssistantResultData as copy } from './capture-result.data';
import type { CaptureAssistantResultProps } from './capture-result';
const checkLabels = { configuration: 'Source configuration', fields: 'Capture fields', workflow: 'Lead workflow', access: 'Plan access', capacity: 'Published-source capacity', delivery: 'Delivery configuration', account: 'Gmail account', sample: 'Reviewed sample', permission: 'Launch permission', pending: 'Pending publication', workspace: 'Workspace state' };
export function CaptureReadProjection({ result, onOpen, onCopy }: { result: CaptureChatResult; onOpen: CaptureAssistantResultProps['onOpen']; onCopy?: CaptureAssistantResultProps['onCopy'] }) {
  if (result.operation === 'sources') return <><p className="m-0 text-sm text-muted">{copy.window(result.rows.length, result.total)}</p><CaptureSourceList rows={result.rows.map(source => ({ id: source.id, name: source.name, source: source.type, status: source.status, captured: source.metrics.captured, awaitingReview: source.metrics.awaitingReview, lastActivityAt: source.lastActivityAt, allowedActions: [] }))} timezone={result.timezone} view={result.filters.archived ? 'archived' : 'current'} canRead onAction={() => {}} onOpen={row => onOpen({ kind: 'source', id: row.id })} /></>;
  const source = result.operation === 'source_details' ? result.detail.source : result.source;
  const open = <button type="button" className="min-h-11 rounded-xl border border-line px-4 py-2 text-sm font-semibold text-primary focus-visible:focus-ring" onClick={() => onOpen({ kind: 'source', id: source.id })}>{copy.open}</button>;
  const configuration = result.operation === 'source_details' ? result.detail.approved?.configuration ?? result.detail.draft?.configuration : undefined;
  const version = result.operation === 'source_details' ? result.detail.approved?.version ?? result.detail.draft?.version : undefined;
  const rows = configuration ? [
    { label: 'Fields', value: configuration.fields?.map(field => field.label).join(', ') || 'Not configured' },
    { label: 'Assignment', value: configuration.workflow?.assignment.kind === 'teammate' ? `Teammate ID: ${configuration.workflow.assignment.teammateId}` : configuration.workflow ? 'Business default' : 'Not configured' },
    { label: 'Starting stage', value: configuration.workflow?.stage ?? 'Not configured' },
    { label: 'Tags', value: configuration.workflow?.tags.join(', ') || 'None' },
    { label: 'Assignment notifications', value: configuration.workflow ? configuration.workflow.notifyAssigned ? 'Enabled, subject to teammate preferences' : 'Off' : 'Not configured' },
  ] : [];
  return <><CaptureDashboardSummary source={{ ...source, intakeBlocked: source.block !== 'none' }} totals={source.metrics} canRead canReadIntake={false} actions={open} />
    {result.operation === 'source_details' && configuration && version && <><CaptureSourceDetails source={source} configuration={{ kind: result.detail.approved ? 'approved' : 'draft', version, rows }} availability={source.type === 'website' ? { type: 'website', status: result.installation ? result.installation.status === 'active' ? 'published' : 'unavailable' : 'unpublished' } : { type: 'gmail', status: 'not-connected' }} canRead canEdit={false} canManageConnection={false} canReadPublication={false} />{result.detail.approved && result.detail.draft && <p className="m-0 text-sm text-muted">A separate unpublished draft exists (version {result.detail.draft.version}). Open the source to review its changes.</p>}</>}
    {result.operation === 'installation' && <CapturePublicationInstructions publication={result.installation} canRead onCopy={onCopy} />}
    {result.operation === 'publication_review' && <CaptureReadinessChecks checks={result.review.checks.map(check => ({ id: check.code, label: checkLabels[check.code], status: check.ready ? 'ready' : 'blocked' }))} ready={result.review.ready} />}
  </>;
}
