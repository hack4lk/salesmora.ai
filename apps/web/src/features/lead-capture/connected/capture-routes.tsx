'use client';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { CaptureListView, CaptureDetailView, CaptureDraftStartContext, CaptureSourceListQuery } from '@salesmora/contracts';
import { ConfirmDialog, FormFeedback } from '@salesmora/ui';
import type { CaptureSourceFilters } from '../capture-source-toolbar/capture-source-toolbar';
import { CaptureSourcePage } from '../capture-source-page/capture-source-page';
import { CaptureSourceSelection, type CaptureSourceSelectionValue } from '../capture-source-selection/capture-source-selection';
import { CaptureSetupHeader } from '../capture-setup-header/capture-setup-header';
import { CaptureDashboardPage, type CaptureDashboardTab } from '../capture-dashboard-page/capture-dashboard-page';
import { captureInitialConfiguration, captureDashboardRecord } from './capture-adapters';
import { captureHref, captureWrite, CaptureRequestError } from './capture-api';
import { useCaptureLeaveGuard } from './use-capture-leave-guard';
import { useCaptureLifecycle } from './capture-lifecycle-actions';
import { captureConnectedData as copy } from './capture-connected.data';
export function CaptureListRoute({ initial, query }: { initial: CaptureListView; query: CaptureSourceListQuery }) {
  const router = useRouter(), [pending, start] = useTransition();
  const [filters, setFilters] = useState<CaptureSourceFilters>({ search: query.search, source: query.type ?? 'all', status: query.status === 'archived' ? 'all' : query.status ?? 'all', view: query.archived ? 'archived' : 'current' });
  const lifecycle = useCaptureLifecycle(query.workspaceId, () => start(() => router.refresh()));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const navigate = (patch: Partial<typeof query>) => { const next = { ...query, ...patch }; const params = new URLSearchParams({ workspace: next.workspaceId, search: next.search, archived: String(next.archived), page: String(next.page), pageSize: String(next.pageSize) }); if (next.type) params.set('type', next.type); if (next.status) params.set('status', next.status); start(() => router.push(`/lead-capture?${params}`)); };
  if (lifecycle.denied) return <FormFeedback kind="error" message={copy.unavailable} />;
  return <div className="grid gap-6">{lifecycle.message && <FormFeedback kind="error" message={lifecycle.message} />}{lifecycle.message && <button type="button" onClick={lifecycle.retry}>{copy.lifecycleRetry}</button>}{lifecycle.loading && <p role="status">{copy.lifecycleLoading}</p>}<CaptureSourcePage dialogs={lifecycle.dialog} rows={initial.rows.map(source => ({ id: source.id, name: source.name, source: source.type, status: source.status, captured: source.metrics.captured, awaitingReview: source.metrics.awaitingReview, lastActivityAt: source.lastActivityAt, attention: source.block === 'none' ? undefined : copy.blocks[source.block], allowedActions: [...(initial.permissions.canUpdate && source.status !== 'archived' && source.draftVersion ? source.status === 'draft' ? ['setup' as const] : ['edit' as const] : []), ...(initial.permissions.canPause && source.status === 'active' ? ['pause' as const] : []), ...(initial.permissions.canPause && source.status === 'paused' ? ['resume' as const] : []), ...(initial.permissions.canArchive ? source.status === 'archived' ? ['restore' as const] : ['archive' as const] : [])] }))} total={initial.total} page={initial.page} pageSize={initial.pageSize} timezone={initial.timezone} canRead canCreate={initial.permissions.canCreate} pending={pending || lifecycle.busy}
    filters={filters}
    onFilters={value => { setFilters(value); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => navigate({ search: value.search, type: value.source === 'all' ? undefined : value.source, status: value.status === 'all' ? undefined : value.status, archived: value.view === 'archived', page: 1 }), 300); }} onPage={page => navigate({ page })} onPageSize={size => navigate({ pageSize: size as 25 | 50 | 100, page: 1 })}
    onCreate={() => router.push(`/lead-capture/new?workspace=${query.workspaceId}`)} onOpen={row => router.push(captureHref(query.workspaceId, row.id))} onAction={(row, action) => { if (action === 'pause' || action === 'resume' || action === 'archive' || action === 'restore') void lifecycle.open(row.id, action); else router.push(captureHref(query.workspaceId, row.id, true)); }} /></div>;
}
export function CaptureNewRoute({ initial }: { initial: CaptureDraftStartContext }) {
  const router = useRouter(), [selection, setSelection] = useState<CaptureSourceSelectionValue>({ name: '', source: 'website' }), [pending, setPending] = useState(false), [error, setError] = useState(''), [denied, setDenied] = useState(false), [frozen, setFrozen] = useState(false);
  const { leave, setLeave } = useCaptureLeaveGuard(!!selection.name, pending);
  // Freeze uncertain attempts: retries use the identical identity and payload.
  const attempt = useRef<Parameters<typeof captureWrite>[2] | null>(null), lock = useRef(false), mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const create = async () => {
    if (lock.current || denied || !initial.permissions.canCreate) return;
    if (!selection.name.trim() || selection.name.length > 80 || !selection.source) { setError('Enter a name and choose a capture source.'); return; }
    attempt.current ??= { workspaceId: initial.workspaceId, requestId: crypto.randomUUID(), name: selection.name.trim(), configuration: captureInitialConfiguration(selection.source, initial.business) };
    setFrozen(true); lock.current = true; setPending(true); setError('');
    try { const saved = await captureWrite('/api/lead-capture', 'POST', attempt.current); if (mounted.current) router.replace(`${captureHref(initial.workspaceId, saved.sourceId, true)}&step=intake`); }
    catch (failure) { if (!mounted.current) return; if (failure instanceof CaptureRequestError) { if ([401, 404, 423].includes(failure.status)) setDenied(true); if ([403, 422].includes(failure.status)) { attempt.current = null; setFrozen(false); } } setError(failure instanceof Error ? failure.message : copy.failed); }
    finally { lock.current = false; if (mounted.current) setPending(false); }
  };
  if (denied) return <FormFeedback kind="error" message={copy.unavailable} />;
  return <div className="grid gap-6"><CaptureSetupHeader name={selection.name} source={selection.source ?? undefined} step="source" completedSteps={[]} dirty={!!selection.name} canEdit={initial.permissions.canCreate} pending={pending} showSave={false} onSave={async () => {}} onContinue={() => { void create(); }} onNavigate={() => router.push(captureHref(initial.workspaceId))}>
    {error && <FormFeedback kind="error" message={error} />}
    <CaptureSourceSelection value={selection} canRead canEdit={initial.permissions.canCreate && !frozen} pending={pending} gmailAccess={initial.business.gmailAccess} onChange={setSelection} />
    <ConfirmDialog open={leave !== null} title={copy.discardTitle} description={copy.discardDescription} confirmLabel={copy.discard} cancelLabel={copy.keep} onClose={() => setLeave(null)} onConfirm={() => { if (leave) { setSelection({ name: '', source: 'website' }); router.push(leave); setLeave(null); } }} />
    {frozen && !pending && <button type="button" onClick={() => { void create(); }}>{copy.retry}</button>}
  </CaptureSetupHeader></div>;
}
export function CaptureDetailRoute({ initial }: { initial: CaptureDetailView }) {
  const router = useRouter(), params = useSearchParams(), [tab, setTab] = useState<CaptureDashboardTab>(() => params.get('tab') === 'publication' && initial.installation ? 'publication' : 'overview'), [pending, setPending] = useState(false), [error, setError] = useState(''), [denied, setDenied] = useState(false), requestId = useRef<string | null>(null), lock = useRef(false), mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const [refreshing, startRefresh] = useTransition();
  const lifecycle = useCaptureLifecycle(initial.detail.source.workspaceId, () => startRefresh(() => router.refresh()));
  const source = initial.detail.source, scheduled = initial.publicationReview?.pending;
  const scheduledTime = scheduled ? new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'short', timeZone: scheduled.timezone }).format(new Date(scheduled.at)) + ` · ${scheduled.timezone}` : '';
  const edit = async () => {
    if (!initial.canEdit || lock.current) return; lock.current = true; setPending(true); setError('');
    try { if (!initial.detail.draft) { requestId.current ??= crypto.randomUUID(); await captureWrite(`/api/lead-capture/${source.id}/draft`, 'POST', { workspaceId: source.workspaceId, sourceId: source.id, expectedVersion: source.version, requestId: requestId.current }); } if (mounted.current) router.push(captureHref(source.workspaceId, source.id, true)); }
    catch (failure) { if (!mounted.current) return; if (failure instanceof CaptureRequestError && [401, 404, 423].includes(failure.status)) setDenied(true); setError(failure instanceof Error ? failure.message : copy.failed); }
    finally { lock.current = false; if (mounted.current) setPending(false); }
  };
  if (denied || lifecycle.denied) return <FormFeedback kind="error" message={copy.unavailable} />;
  return <div className="grid gap-6">{lifecycle.message && <FormFeedback kind="error" message={lifecycle.message} />}{lifecycle.message && <button type="button" onClick={lifecycle.retry}>{copy.lifecycleRetry}</button>}{lifecycle.loading && <p role="status">{copy.lifecycleLoading}</p>}{error && <FormFeedback kind="error" message={error} />}<p role="status">{source.approvedVersion === null ? copy.draftNotice : copy.approvedNotice}</p>{source.block !== 'none' && <p role="status">{copy.blocks[source.block]}</p>}{scheduled && <p role="status">{source.status === 'active' ? copy.pendingRevision(scheduled.configurationVersion, scheduledTime) : copy.pendingFirstPublication(scheduledTime)}</p>}<CaptureDashboardPage source={captureDashboardRecord(initial)} totals={source.metrics} publication={initial.installation ?? null} tab={tab} canRead canEdit={initial.canEdit} canManageConnection={false} canReadPublication={!!initial.installation} canReadIntake={false} pending={pending || lifecycle.busy || refreshing} dialogs={lifecycle.dialog} onTab={setTab} onBack={() => router.push(captureHref(source.workspaceId))} onRetry={() => router.refresh()} onRetryTotals={() => router.refresh()} onEdit={() => { void edit(); }} onManageConnection={() => {}} onAction={(_source, action) => { if (action === 'pause' || action === 'resume' || action === 'archive' || action === 'restore') void lifecycle.open(source.id, action); }} /></div>;
}
