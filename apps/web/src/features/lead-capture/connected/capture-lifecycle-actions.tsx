'use client';
import { useEffect, useRef, useState } from 'react';
import type { CaptureDetailView } from '@salesmora/contracts';
import { CapturePauseResumeDialog } from '../capture-pause-resume-dialog/capture-pause-resume-dialog';
import { CaptureArchiveRestoreDialog } from '../capture-archive-restore-dialog/capture-archive-restore-dialog';
import { captureConfigurationRows } from './capture-adapters';
import { captureLifecycleWrite, captureReadSource, CaptureRequestError } from './capture-api';
import { captureConnectedData as copy } from './capture-connected.data';

export type CaptureLifecycleAction = 'pause' | 'resume' | 'archive' | 'restore';
type Selection = { action: CaptureLifecycleAction; view: CaptureDetailView };
/** One frozen confirmation/retry state shared by list and dashboard hosts. */
export function useCaptureLifecycle(workspaceId: string, onChanged: () => void) {
  const [selection, setSelection] = useState<Selection | null>(null), [busy, setBusy] = useState(false), [denied, setDenied] = useState(false), [message, setMessage] = useState('');
  const [error, setError] = useState<{ kind: 'error' | 'conflict'; message: string }>();
  const lock = useRef(false), mounted = useRef(true), attempt = useRef<unknown>(null);
  const failedLoad = useRef<{ sourceId: string; action: CaptureLifecycleAction } | null>(null);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const unavailable = (failure: unknown) => failure instanceof CaptureRequestError && [401, 403, 404, 423].includes(failure.status);
  const clearDenied = () => { setDenied(true); setSelection(null); attempt.current = null; failedLoad.current = null; setMessage(''); };
  const fetchView = async (sourceId: string) => {
    const view = await captureReadSource(workspaceId, sourceId);
    if (!view.lifecycleReview || view.lifecycleReview.sourceId !== sourceId || view.lifecycleReview.sourceVersion !== view.detail.source.version || view.lifecycleReview.approvedVersion !== view.detail.source.approvedVersion) throw new Error(copy.unavailable);
    return view;
  };
  const load = async (sourceId: string, action: CaptureLifecycleAction) => {
    if (lock.current || denied) return false;
    lock.current = true; setBusy(true); setMessage('');
    try {
      const view = await fetchView(sourceId);
      if (!mounted.current) return false;
      setSelection({ action, view }); setError(undefined); attempt.current = null; failedLoad.current = null;
      return true;
    } catch (failure) {
      if (!mounted.current) return false;
      if (unavailable(failure)) clearDenied();
      else { setMessage(copy.failed); failedLoad.current = { sourceId, action }; }
      return false;
    } finally { lock.current = false; if (mounted.current) setBusy(false); }
  };
  const confirm = async () => {
    if (!selection || lock.current || denied) return;
    const { source, approved } = selection.view.detail;
    if (selection.action === 'resume' && !approved) return;
    attempt.current ??= { workspaceId, sourceId: source.id, expectedVersion: source.version, requestId: crypto.randomUUID(), action: selection.action, confirmed: true, ...(selection.action === 'resume' ? { configuration: { kind: 'approved', version: approved!.version } } : {}) };
    lock.current = true; setBusy(true); setError(undefined);
    try {
      const saved = await captureLifecycleWrite(source.id, attempt.current);
      if (saved.sourceId !== source.id) throw new Error(copy.lifecycleFailed);
      if (mounted.current) { setSelection(null); attempt.current = null; onChanged(); }
    } catch (failure) {
      if (!mounted.current) return;
      if (unavailable(failure)) clearDenied();
      else if (failure instanceof CaptureRequestError && failure.status === 409) setError({ kind: 'conflict', message: copy.lifecycleConflict });
      else if (failure instanceof CaptureRequestError && failure.status === 422) {
        attempt.current = null;
        setError({ kind: 'error', message: failure.message });
        try { const view = await fetchView(source.id); if (mounted.current) setSelection({ action: selection.action, view }); }
        catch (reloadFailure) { if (mounted.current && unavailable(reloadFailure)) clearDenied(); }
      } else setError({ kind: 'error', message: copy.lifecycleFailed });
    } finally { lock.current = false; if (mounted.current) setBusy(false); }
  };
  const close = () => { if (!lock.current) { setSelection(null); setError(undefined); attempt.current = null; onChanged(); } };
  const reload = async () => { if (selection && !await load(selection.view.detail.source.id, selection.action)) throw new Error(copy.failed); };
  let dialog = null;
  if (selection) {
    const { source, approved } = selection.view.detail, review = selection.view.lifecycleReview!;
    const common = { open: true, canRead: !denied, pending: busy, error, onClose: close, onConfirm: confirm, onReload: reload };
    dialog = selection.action === 'archive' || selection.action === 'restore' ? <CaptureArchiveRestoreDialog key={`${source.id}:archive`} {...common} action={selection.action} source={{ ...source, canArchive: review.canArchive, canRestore: review.canRestore, restoreReadiness: review.restoreReady ? 'ready' : 'blocked', restoreReason: review.restoreFailures.map(code => copy.readiness[code]).join(' ') }} />
      : <CapturePauseResumeDialog key={`${source.id}:${selection.action}`} {...common} action={selection.action} source={{ ...source, canPause: review.canPause, canResume: review.canResume, resumeReadiness: review.resumeReady ? 'ready' : 'blocked', resumeReason: review.resumeFailures.map(code => copy.readiness[code]).join(' ') || copy.lifecycleBlocked, approved: approved ? [{ label: copy.approvedVersion, value: String(approved.version) }, ...captureConfigurationRows(approved.configuration, selection.view.business)] : [] }} />;
  }
  return { open: load, dialog, busy, loading: busy && !selection, denied, message, retry: () => { const failed = failedLoad.current; if (failed) void load(failed.sourceId, failed.action); } };
}
