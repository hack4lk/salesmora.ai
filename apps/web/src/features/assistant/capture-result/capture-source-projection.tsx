'use client';
import type { CaptureSourceProposalView } from '@salesmora/contracts';
import { CaptureCancelLaunchDialog } from '../../lead-capture/capture-cancel-launch-dialog/capture-cancel-launch-dialog';
import { CaptureSetupReview } from '../../lead-capture/capture-setup-review/capture-setup-review';
import { CapturePauseResumeDialog } from '../../lead-capture/capture-pause-resume-dialog/capture-pause-resume-dialog';
import { CaptureArchiveRestoreDialog } from '../../lead-capture/capture-archive-restore-dialog/capture-archive-restore-dialog';
import { CaptureDuplicateDialog } from '../../lead-capture/capture-duplicate-dialog/capture-duplicate-dialog';
import { CaptureLaunchChangeDialog } from '../../lead-capture/capture-launch-change-dialog/capture-launch-change-dialog';
import { captureReviewFrom } from '../../lead-capture/connected/capture-review-adapter';
import { captureConfigurationRows } from '../../lead-capture/connected/capture-adapters';
import { captureConnectedData as copy } from '../../lead-capture/connected/capture-connected.data';
function wall(at: string, timezone: string) { const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(at)).map(part => [part.type, part.value])); return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`; }
/** Frozen server review using the same canonical dialogs and publication review as manual actions. */
export function CaptureSourceProjection({ view, pending, onConfirm, onClose }: {
  view: CaptureSourceProposalView;
  pending: boolean;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const source = view.source.detail.source, op = view.ticket.operation, business = view.source.business, approved = view.source.detail.approved;
  const common = { open: true, canRead: true, pending, onClose, onConfirm: async () => onConfirm() };
  const timing = view.timing?.kind === 'scheduled' ? { mode: 'scheduled' as const, localDateTime: wall(view.timing.at, view.timing.timezone) } : { mode: 'now' as const, localDateTime: '' };
  if (op === 'publish')
    return <CaptureSetupReview draft={captureReviewFrom(view.source)} value={timing} canRead canEdit={false} canLaunch={view.ready} pending={pending} timingReadOnly onChange={() => { }} onEdit={() => { }} onLaunch={onConfirm}/>;
  if (op === 'pause' || op === 'resume')
    return <CapturePauseResumeDialog {...common} action={op} source={{ ...source, canPause: !!view.source.lifecycleReview?.canPause, canResume: !!view.source.lifecycleReview?.canResume, resumeReadiness: view.ready ? 'ready' : 'blocked', resumeReason: view.checks.filter(check => !check.ready).map(check => copy.readiness[check.code]).join(' '), approved: approved ? [{ label: copy.approvedVersion, value: String(approved.version) }, ...captureConfigurationRows(approved.configuration, business)] : [] }}/>;
  if (op === 'archive' || op === 'restore')
    return <CaptureArchiveRestoreDialog {...common} action={op} source={{ ...source, canArchive: !!view.source.lifecycleReview?.canArchive, canRestore: !!view.source.lifecycleReview?.canRestore, restoreReadiness: view.ready ? 'ready' : 'blocked', restoreReason: view.checks.filter(check => !check.ready).map(check => copy.readiness[check.code]).join(' ') }}/>;
  if (op === 'duplicate') {
    const selected = view.configurationKind === 'approved' ? approved : view.source.detail.draft;
    if (!selected || !view.copyName)
      return <p role="alert">Select a saved configuration and a name before requesting a duplicate review.</p>;
    return <CaptureDuplicateDialog {...common} nameReadOnly name={view.copyName} onNameChange={() => { }} source={{ ...source, canDuplicate: true, readiness: view.ready ? 'ready' : 'blocked', configuration: { kind: view.configurationKind!, version: selected.version, summary: captureConfigurationRows(selected.configuration, business) } }}/>;
  }
  const schedule = view.source.publicationReview?.pending;
  if (!schedule)
    return <p role="alert">The pending launch is unavailable. Request a fresh review.</p>;
  if (op === 'change_schedule')
    return <CaptureLaunchChangeDialog {...common} timingReadOnly value={timing} onChange={() => { }} source={{ ...source, pendingRevision: source.status === 'active', scheduledAt: schedule.at, timezone: schedule.timezone, canChange: true, readiness: view.ready ? 'ready' : 'blocked', reason: view.checks.filter(check => !check.ready).map(check => copy.readiness[check.code]).join(' ') }}/>;
  return <CaptureCancelLaunchDialog open source={source} pendingLaunch={schedule} canCancel={view.ready} pending={pending} onClose={onClose} onConfirm={onConfirm}/>;
}
