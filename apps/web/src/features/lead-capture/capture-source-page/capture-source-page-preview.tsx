'use client';

import { useEffect, useRef, useState } from 'react';
import { WorkspaceNavigation } from '@salesmora/ui';
import { CaptureSourcePage } from './capture-source-page';
import { captureSourcePageData as copy } from './capture-source-page.data';
import { defaultCaptureSourceFilters, type CaptureSourceFilters } from '../capture-source-toolbar/capture-source-toolbar';
import type { CaptureSourceAction, CaptureSourceListRow } from '../capture-source-list/capture-source-list';
import { CapturePauseResumeDialog } from '../capture-pause-resume-dialog/capture-pause-resume-dialog';
import { CaptureArchiveRestoreDialog } from '../capture-archive-restore-dialog/capture-archive-restore-dialog';
import { CaptureDuplicateDialog } from '../capture-duplicate-dialog/capture-duplicate-dialog';
import { captureDuplicateName } from '../capture-duplicate-dialog/capture-duplicate-dialog.validation';
import type { CaptureDuplicateRequest } from '../capture-duplicate-dialog/capture-duplicate-dialog.validation';
import type { CaptureIntakeRequest } from '../capture-pause-resume-dialog/capture-pause-resume-dialog.validation';
import type { CaptureArchiveRequest } from '../capture-archive-restore-dialog/capture-archive-restore-dialog.validation';
type Record = CaptureSourceListRow & { version: number; configurationVersion: number; configurationKind: 'approved' | 'draft' };
const allActions: readonly CaptureSourceAction[] = ['setup', 'edit', 'pause', 'resume', 'duplicate', 'archive', 'restore'];
const statuses = ['active', 'active', 'paused', 'scheduled', 'draft', 'archived'] as const;
const fixtures: Record[] = statuses.map((status, i) => ({ id: `source-${i}`, version: 1, configurationVersion: 1, configurationKind: status === 'draft' ? 'draft' : 'approved', name: copy.stories.names[i], source: i % 2 && i !== 5 ? 'gmail' : 'website', status, captured: status === 'draft' || status === 'scheduled' ? 0 : 42 + i, awaitingReview: i === 1 ? 4 : 0, lastActivityAt: status === 'draft' ? null : '2026-10-29T14:30:00Z', allowedActions: allActions }));
type PreviewRequest = CaptureDuplicateRequest | CaptureIntakeRequest | CaptureArchiveRequest;
export type CaptureSourcePagePreviewProps = {
  initialFilters?: CaptureSourceFilters; initialPageSize?: number; empty?: boolean; many?: boolean; readOnly?: boolean; canRead?: boolean;
  state?: 'ready' | 'loading' | 'error'; failActions?: boolean; holdActions?: boolean; longContent?: boolean;
  onCreate: () => void; onOpen: (row: CaptureSourceListRow) => void; onSetup: (row: CaptureSourceListRow) => void; onRequest: (request: PreviewRequest) => void;
};
/** Storybook-only in-memory adapter. No API, OAuth, persistence or provider calls. */
export function CaptureSourcePagePreview({ initialFilters = defaultCaptureSourceFilters, initialPageSize = 25, empty = false, many = false, readOnly = false, canRead = true, state: initialState = 'ready', failActions = false, holdActions = false, longContent = false, onCreate, onOpen, onSetup, onRequest }: CaptureSourcePagePreviewProps) {
  const [records, setRecords] = useState<Record[]>(() => empty ? [] : many ? Array.from({ length: 32 }, (_, i) => ({ ...fixtures[i % 5], id: `source-${i}`, name: `${fixtures[i % 5].name} ${i + 1}` })) : fixtures.map((row, i) => ({ ...row, name: longContent && i === 0 ? copy.stories.long : row.name })));
  const [filters, setFilters] = useState(initialFilters), [page, setPage] = useState(1), [size, setSize] = useState(initialPageSize), [state, setState] = useState(initialState);
  const [dialog, setDialog] = useState<{ row: Record; action: CaptureSourceAction } | null>(null), [name, setName] = useState(''), [message, setMessage] = useState('');
  const current = useRef(records), main = useRef<HTMLElement>(null), copiedRequests = useRef(new Set<string>()), copyCounter = useRef(0);
  useEffect(() => { current.current = records; }, [records]);
  useEffect(() => { if (message && !dialog) main.current?.focus(); }, [message, dialog]);
  const scoped = canRead ? records.map(row => ({ ...row, allowedActions: readOnly ? [] : row.allowedActions.filter(action => action !== 'resume' || row.configurationKind === 'approved') })) : [];
  const filtered = scoped.filter(row => (filters.view === 'archived' ? row.status === 'archived' : row.status !== 'archived') && (!filters.search.trim() || row.name.toLocaleLowerCase('en-US').includes(filters.search.trim().toLocaleLowerCase('en-US'))) && (filters.source === 'all' || row.source === filters.source) && (filters.view === 'archived' || filters.status === 'all' || row.status === filters.status));
  const activePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / size))), rows = filtered.slice((activePage - 1) * size, activePage * size);
  const summary = [{ label: copy.stories.fieldsLabel, value: copy.stories.fields }, { label: copy.stories.workflowLabel, value: copy.stories.workflow }];
  const confirm = async (request: PreviewRequest) => {
    onRequest(request);
    if (!canRead || readOnly) throw new Error(copy.stories.failed);
    if (holdActions) await new Promise<void>(() => {});
    if (failActions) throw new Error(copy.stories.failed);
    if ('sourceId' in request) {
      if (copiedRequests.current.has(request.requestId)) return;
      const original = current.current.find(row => row.id === request.sourceId);
      if (!original || original.version !== request.expectedVersion) throw new Error(copy.stories.conflict);
      copiedRequests.current.add(request.requestId); copyCounter.current += 1;
      setRecords(previous => [...previous, { ...original, id: `copy-${copyCounter.current}`, version: 1, configurationVersion: 1, configurationKind: 'draft', name: request.name, status: 'draft', captured: 0, awaitingReview: 0, lastActivityAt: null }]); setMessage(copy.stories.copied);
    } else {
      const original = current.current.find(row => row.id === request.source.id);
      if (!original || original.version !== request.source.version || !original.allowedActions.includes(request.action)) throw new Error(copy.stories.conflict);
      const status = request.action === 'archive' ? 'archived' : request.action === 'resume' ? 'active' : 'paused';
      setRecords(previous => previous.map(row => row.id === original.id ? { ...row, status, version: row.version + 1 } : row)); setMessage(copy.stories.changed);
    }
    setDialog(null);
  };
  const selected = dialog?.row;
  const base = selected ? { id: selected.id, version: selected.version, name: selected.name, type: selected.source, status: selected.status } : null;
  const close = () => setDialog(null);
  const dialogs = canRead && !readOnly && selected && base && dialog ? dialog.action === 'pause' || dialog.action === 'resume'
    ? <CapturePauseResumeDialog key={`${base.id}-${dialog.action}`} open action={dialog.action} source={{ ...base, canPause: selected.allowedActions.includes('pause'), canResume: selected.configurationKind === 'approved' && selected.allowedActions.includes('resume'), resumeReadiness: 'ready', approved: summary }} canRead onClose={close} onConfirm={confirm} />
    : dialog.action === 'archive' || dialog.action === 'restore'
      ? <CaptureArchiveRestoreDialog key={`${base.id}-${dialog.action}`} open action={dialog.action} source={{ ...base, canArchive: selected.allowedActions.includes('archive'), canRestore: selected.allowedActions.includes('restore'), restoreReadiness: 'ready' }} canRead onClose={close} onConfirm={confirm} />
      : dialog.action === 'duplicate' ? <CaptureDuplicateDialog key={base.id} open source={{ ...base, canDuplicate: selected.allowedActions.includes('duplicate'), readiness: 'ready', configuration: { kind: selected.configurationKind, version: selected.configurationVersion, summary } }} name={name} canRead onNameChange={setName} onClose={close} onConfirm={confirm} /> : null : null;
  return <div className="min-h-screen bg-canvas text-ink md:flex">
    <WorkspaceNavigation workspaceName={copy.stories.workspace} user={{ name: copy.stories.viewer, email: copy.stories.email, role: 'owner' }} currentPage="campaigns" contentId="capture-source-preview-content" authorizedPages={canRead ? ['home', 'campaigns', 'settings'] : ['home', 'settings']} availablePages={['campaigns']} onNavigate={() => {}} onAccountSettings={() => {}} onSignOut={() => {}} accountSettingsAvailable={false} />
    <main ref={main} id="capture-source-preview-content" tabIndex={-1} className="min-w-0 flex-1 px-4 py-6 focus-visible:focus-ring sm:px-8 sm:py-8"><p className="mb-6 mt-0 text-sm leading-6 text-muted">{copy.stories.preview}</p>{message && canRead && <p role="status" className="mb-5 mt-0 text-sm text-muted wrap-anywhere">{message}</p>}
      <CaptureSourcePage rows={rows} total={filtered.length} page={activePage} pageSize={size} filters={filters} state={state} canRead={canRead} canCreate={!readOnly} timezone="America/New_York"
        onFilters={next => { setFilters(next); setPage(1); }} onPage={setPage} onPageSize={next => { setSize(next); setPage(1); }} onRetry={() => setState('ready')}
        onCreate={() => { onCreate(); setMessage(copy.stories.create); }} onOpen={row => { onOpen(row); setMessage(copy.stories.open(row.name)); }}
        onAction={(row, action) => { if (readOnly || !canRead || !row.allowedActions.includes(action)) return; if (action === 'edit' || action === 'setup') { onSetup(row); setMessage(copy.stories.edit(row.name)); return; } const record = current.current.find(item => item.id === row.id); if (record) { setDialog({ row: structuredClone(record), action }); setName(captureDuplicateName(record.name)); setMessage(''); } }} dialogs={dialogs} />
    </main>
  </div>;
}
