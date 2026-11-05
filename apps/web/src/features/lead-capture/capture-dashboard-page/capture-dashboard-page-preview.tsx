'use client';

import { useEffect, useRef, useState } from 'react';
import { WorkspaceNavigation } from '@salesmora/ui';
import { CaptureDashboardPage, type CaptureDashboardTab } from './capture-dashboard-page';
import { captureDashboardPageData as copy } from './capture-dashboard-page.data';
import { captureDashboardFixture, captureDashboardPublicationFixture } from './capture-dashboard-page.fixtures';
import { captureDashboardActions, type CaptureDashboardAction, type CaptureDashboardRecord } from './capture-dashboard-page.validation';
import { CapturePauseResumeDialog } from '../capture-pause-resume-dialog/capture-pause-resume-dialog';
import { CaptureArchiveRestoreDialog } from '../capture-archive-restore-dialog/capture-archive-restore-dialog';
import { CaptureDuplicateDialog } from '../capture-duplicate-dialog/capture-duplicate-dialog';
import { captureDuplicateName, type CaptureDuplicateRequest } from '../capture-duplicate-dialog/capture-duplicate-dialog.validation';
import type { CaptureIntakeRequest } from '../capture-pause-resume-dialog/capture-pause-resume-dialog.validation';
import type { CaptureArchiveRequest } from '../capture-archive-restore-dialog/capture-archive-restore-dialog.validation';
import { CaptureLaunchChangeDialog } from '../capture-launch-change-dialog/capture-launch-change-dialog';
import type { CaptureLaunchChangeRequest } from '../capture-launch-change-dialog/capture-launch-change-dialog.validation';
import type { CaptureLaunchValue } from '../capture-setup-review/capture-setup-review.validation';
export type CaptureDashboardPreviewRequest = CaptureIntakeRequest | CaptureArchiveRequest | CaptureDuplicateRequest | CaptureLaunchChangeRequest;
export type CaptureDashboardPagePreviewProps = {
  initialSource?: CaptureDashboardRecord; initialTab?: CaptureDashboardTab; canRead?: boolean; readOnly?: boolean; office?: boolean; noPublicationAccess?: boolean; noIntakeAccess?: boolean;
  state?: 'ready' | 'loading' | 'error'; totalsError?: boolean; failActions?: boolean; holdActions?: boolean; conflict?: boolean; wrongPublication?: boolean;
  onRequest: (request: CaptureDashboardPreviewRequest) => void; onEdit: (source: CaptureDashboardRecord) => void; onManageConnection: (source: CaptureDashboardRecord) => void; onBack: () => void; onCopy: (text: string) => void;
};
const clock = () => Date.parse(copy.stories.now);
/** In-memory adapter only: all counts, state transitions, publication and connection actions are simulated. */
export function CaptureDashboardPagePreview({ initialSource = captureDashboardFixture(), initialTab = 'overview', canRead = true, readOnly = false, office = false, noPublicationAccess = false, noIntakeAccess = false, state: initialState = 'ready', totalsError = false, failActions = false, holdActions = false, conflict = false, wrongPublication = false, onRequest, onEdit, onManageConnection, onBack, onCopy }: CaptureDashboardPagePreviewProps) {
  const [source, setSource] = useState(initialSource), [tab, setTab] = useState(initialTab), [state, setState] = useState(initialState), [totalsState, setTotalsState] = useState<'ready' | 'error'>(totalsError ? 'error' : 'ready');
  const [dialog, setDialog] = useState<{ source: CaptureDashboardRecord; action: CaptureDashboardAction } | null>(null), [name, setName] = useState(''), [value, setValue] = useState<CaptureLaunchValue>({ mode: 'scheduled', localDateTime: copy.stories.scheduledLocal });
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [error, setError] = useState<{ kind: 'conflict'; message: string }>();
  const current = useRef(source), main = useRef<HTMLElement>(null);
  useEffect(() => { current.current = source; }, [source]);
  useEffect(() => { if (message && message !== copy.stories.intake && !dialog) main.current?.focus(); }, [message, dialog]);
  const confirm = async (request: CaptureDashboardPreviewRequest) => {
    onRequest(request); setBusy(true);
    try {
      if (!canRead || readOnly) throw new Error(copy.stories.failure);
      if (holdActions) await new Promise<void>(() => {});
      if (failActions) throw new Error(copy.stories.failure);
      const record = current.current, id = 'sourceId' in request ? request.sourceId : request.source.id, version = 'sourceId' in request ? request.expectedVersion : request.source.version;
      const action = 'sourceId' in request ? 'duplicate' : 'timing' in request ? 'change-launch' : request.action;
      if (id !== record.id || version !== record.version || !captureDashboardActions(record).includes(action)) { setError({ kind: 'conflict', message: copy.stories.conflict }); throw new Error(copy.stories.conflict); }
      if ('sourceId' in request) setMessage(copy.stories.copied);
      else {
        const status = 'timing' in request ? request.timing.kind === 'now' ? 'active' : 'scheduled' : request.action === 'archive' ? 'archived' : request.action === 'resume' ? 'active' : 'paused';
        setSource({ ...record, status, version: record.version + 1, scheduledAt: 'timing' in request && request.timing.kind === 'scheduled' ? request.timing.at : undefined }); setMessage(copy.stories.changed);
      }
      setDialog(null);
    } finally { setBusy(false); }
  };
  const selected = dialog?.source, base = selected ? { id: selected.id, version: selected.version, name: selected.name, type: selected.type, status: selected.status } : null;
  const close = () => { if (!busy) setDialog(null); };
  const reload = async () => { const next = { ...current.current, version: current.current.version + 1 }; setSource(next); if (dialog) setDialog({ ...dialog, source: structuredClone(next) }); setError(undefined); };
  const dialogs = canRead && !readOnly && selected && base && dialog ? dialog.action === 'pause' || dialog.action === 'resume'
    ? <CapturePauseResumeDialog key={`${base.id}-${dialog.action}`} open action={dialog.action} source={{ ...base, canPause: selected.allowedActions.includes('pause'), canResume: selected.configuration.kind === 'approved' && selected.allowedActions.includes('resume'), resumeReadiness: selected.resumeReadiness, approved: selected.configuration.rows }} canRead pending={busy} error={error} onClose={close} onConfirm={confirm} onReload={reload} />
    : dialog.action === 'archive' || dialog.action === 'restore'
      ? <CaptureArchiveRestoreDialog key={`${base.id}-${dialog.action}`} open action={dialog.action} source={{ ...base, canArchive: selected.allowedActions.includes('archive'), canRestore: selected.allowedActions.includes('restore'), restoreReadiness: selected.restoreReadiness }} canRead pending={busy} error={error} onClose={close} onConfirm={confirm} onReload={reload} />
      : dialog.action === 'change-launch'
        ? <CaptureLaunchChangeDialog key={base.id} open source={{ ...base, scheduledAt: selected.scheduledAt!, timezone: selected.timezone, canChange: selected.allowedActions.includes('change-launch'), readiness: selected.resumeReadiness }} value={value} onChange={setValue} canRead pending={busy} error={error} onClose={close} onConfirm={confirm} onReload={reload} now={clock} />
        : <CaptureDuplicateDialog key={base.id} open source={{ ...base, canDuplicate: selected.allowedActions.includes('duplicate'), readiness: 'ready', configuration: { ...selected.configuration, summary: selected.configuration.rows } }} name={name} onNameChange={setName} canRead pending={busy} onClose={close} onConfirm={confirm} /> : null;
  const publication = captureDashboardPublicationFixture(source), intakeHref = '/storybook/intake-review?source=source-one';
  return <div className="min-h-screen bg-canvas text-ink md:flex">
    <WorkspaceNavigation workspaceName={copy.stories.workspace} user={{ name: copy.stories.viewer, email: copy.stories.email, role: 'owner' }} currentPage="campaigns" contentId="capture-dashboard-preview-content" authorizedPages={canRead ? ['home', 'campaigns', 'settings'] : ['home', 'settings']} availablePages={['campaigns']} onNavigate={() => {}} onAccountSettings={() => {}} onSignOut={() => {}} accountSettingsAvailable={false} />
    <main ref={main} onClickCapture={event => { const link = (event.target as Element).closest('a'); if (link?.getAttribute('href') === intakeHref) { event.preventDefault(); setMessage(copy.stories.intake); } }} id="capture-dashboard-preview-content" tabIndex={-1} className="min-w-0 flex-1 px-4 py-6 focus-visible:focus-ring sm:px-8 sm:py-8"><p className="mb-6 mt-0 text-sm leading-6 text-muted">{copy.stories.description}</p>{message && canRead && <p role="status" className="mb-5 mt-0 text-sm text-muted">{message}</p>}
      <CaptureDashboardPage source={readOnly ? { ...source, allowedActions: [] } : office ? { ...source, allowedActions: source.allowedActions.filter(action => action === 'archive') } : source} totals={source.configuration.kind === 'draft' ? { captured: 0, awaitingReview: 0, approved: 0 } : { captured: 42, awaitingReview: 4, approved: 30 }} tab={tab} onTab={setTab} publication={wrongPublication && publication ? { ...publication, id: 'other' } : publication} canRead={canRead} canEdit={!readOnly && !office} canManageConnection={!readOnly && !office} canReadPublication={!noPublicationAccess} canReadIntake={!noIntakeAccess} intakeHref={intakeHref} state={state} totalsState={totalsState} pending={busy}
        onBack={onBack} onRetry={() => setState('ready')} onRetryTotals={() => setTotalsState('ready')} onEdit={record => { onEdit(record); setMessage(copy.stories.edit); }} onManageConnection={record => { onManageConnection(record); setMessage(copy.stories.connection); }} onCopy={async text => { onCopy(text); }}
        onAction={(record, action) => { if (!canRead || readOnly || busy || !captureDashboardActions(record).includes(action)) return; setDialog({ source: structuredClone(record), action }); setName(captureDuplicateName(record.name)); setValue({ mode: 'scheduled', localDateTime: copy.stories.scheduledLocal }); setError(conflict ? { kind: 'conflict', message: copy.stories.conflict } : undefined); setMessage(''); }} dialogs={dialogs} />
    </main>
  </div>;
}
