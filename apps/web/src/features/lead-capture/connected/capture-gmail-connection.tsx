'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ConfirmDialog } from '@salesmora/ui';
import { captureGmailAccountListSchema, captureGmailDisconnectReviewSchema, captureGmailDisconnectSavedSchema, captureGmailOAuthStartSchema, captureGmailSelectionSavedSchema } from '@salesmora/contracts';
import type { CaptureGmailAccountList, CaptureDetailView } from '@salesmora/contracts';
import { CaptureRequestError } from './capture-api';
type Intent = { kind: 'connect' | 'reconnect' | 'select'; accountId?: string };
type Options = { enabled: boolean; view: CaptureDetailView; canEdit: boolean; dirty: boolean; save: () => Promise<{ sourceVersion: number; draftVersion: number }>; onChanged: () => Promise<void> };
const empty: CaptureGmailAccountList = { available: false, accounts: [], capabilities: { canRead: false, canConnect: false, canReconnect: false, canSelect: false, canDisconnect: false } };
const path = '/api/lead-capture/gmail';
async function response(request: Promise<Response>) {
  const result = await request, body = await result.json();
  if (!result.ok) throw new CaptureRequestError(result.status, typeof body.error === 'string' ? body.error : 'Gmail connection could not be updated. Reload the account choices and try again.');
  return body;
}
export function useCaptureGmailConnection(options: Options) {
  const latest = useRef(options); useLayoutEffect(() => { latest.current = options; });
  const workspaceId = options.view.detail.source.workspaceId;
  const [data, setData] = useState(empty), [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [pending, setPending] = useState(false), [error, setError] = useState(''), [intent, setIntent] = useState<Intent>();
  const [review, setReview] = useState<ReturnType<typeof captureGmailDisconnectReviewSchema.parse>>();
  const [authorization, setAuthorization] = useState('');
  const lock = useRef(false), mounted = useRef(true), attempts = useRef(new Map<string, string>());
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const reload = useCallback(async (signal?: AbortSignal) => {
    try {
      const result = captureGmailAccountListSchema.parse(await response(fetch(`${path}/accounts?workspace=${workspaceId}`, { cache: 'no-store', signal })));
      if (mounted.current && !signal?.aborted) { setData(result); setStatus('ready'); setError(''); }
    } catch (failure) { if (mounted.current && !signal?.aborted) { setStatus('error'); setError(failure instanceof Error ? failure.message : 'Gmail accounts could not be loaded.'); } }
  }, [workspaceId]);
  useEffect(() => {
    if (!options.enabled) return;
    const abort = new AbortController();
    void Promise.resolve().then(() => { if (!abort.signal.aborted) return reload(abort.signal); });
    return () => abort.abort();
  }, [options.enabled, reload]);
  useEffect(() => {
    if (!authorization) return;
    // Let the wizard release its unsaved-work guard before the deliberate OAuth navigation.
    const frame = requestAnimationFrame(() => window.location.assign(authorization)); return () => cancelAnimationFrame(frame);
  }, [authorization]);
  const post = async (endpoint: string, input: Record<string, unknown>) => {
    const key = JSON.stringify([endpoint, input]), requestId = attempts.current.get(key) ?? crypto.randomUUID(); attempts.current.set(key, requestId);
    return response(fetch(`${path}/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...input, requestId }), cache: 'no-store', signal: AbortSignal.timeout(30000) }));
  };
  const run = async (work: () => Promise<void>) => {
    if (lock.current || !latest.current.canEdit || !mounted.current) return;
    lock.current = true; setPending(true); setError('');
    try { await work(); } catch (failure) {
      if (mounted.current) {
        if (failure instanceof CaptureRequestError && failure.status === 409 && !latest.current.dirty) { await latest.current.onChanged(); await reload(); }
        if (failure instanceof CaptureRequestError && [401, 403, 404, 423].includes(failure.status)) { setData(empty); setStatus('error'); }
        setError(failure instanceof Error ? failure.message : 'Gmail connection could not be updated.');
      }
      throw failure;
    }
    finally { lock.current = false; if (mounted.current) setPending(false); }
  };
  const execute = async (action: Intent) => run(async () => {
    const current = latest.current, source = current.view.detail.source, draft = current.view.detail.draft;
    if (!draft || !data.available) throw Error('Reload this Gmail draft before connecting an account.');
    const versions = current.dirty ? await current.save() : { sourceVersion: source.version, draftVersion: draft.version };
    const common = { workspaceId, sourceId: source.id, expectedVersion: versions.sourceVersion, expectedDraftVersion: versions.draftVersion };
    const account = data.accounts.find(item => item.id === action.accountId);
    if (action.kind === 'select') {
      if (!account || !data.capabilities.canSelect) throw Error('This Gmail account cannot be selected.');
      captureGmailSelectionSavedSchema.parse(await post('select', { ...common, accountId: account.id, expectedAccountVersion: account.version }));
      if (mounted.current) { await latest.current.onChanged(); await reload(); setIntent(undefined); }
    } else {
      if (!data.capabilities.canConnect || action.kind === 'reconnect' && !account) throw Error('This Gmail account cannot be connected.');
      const result = captureGmailOAuthStartSchema.parse(await post('connect', { ...common, reconnect: action.kind === 'reconnect' ? { accountId: account!.id, expectedAccountVersion: account!.version } : null }));
      const url = new URL(result.authorizationUrl);
      if (url.protocol !== 'https:' || url.hostname !== 'accounts.google.com' || url.pathname !== '/o/oauth2/v2/auth' || url.username || url.password) throw Error('Gmail returned an invalid authorization destination.');
      if (mounted.current) { setIntent(undefined); setAuthorization(url.href); }
    }
  });
  const request = (action: Intent) => {
    if (pending || lock.current || !options.canEdit) return;
    if (latest.current.dirty) setIntent(action); else void execute(action).catch(() => {});
  };
  const disconnect = (accountId: string) => {
    if (!data.capabilities.canDisconnect) return;
    if (latest.current.dirty) { setError('Save your draft before reviewing account disconnection. Your changes are preserved.'); return; }
    void run(async () => {
      const result = captureGmailDisconnectReviewSchema.parse(await response(fetch(`${path}/disconnect?workspace=${workspaceId}&accountId=${accountId}`, { cache: 'no-store', signal: AbortSignal.timeout(15000) })));
      if (mounted.current) setReview(result);
    }).catch(() => {});
  };
  const confirmDisconnect = () => run(async () => {
    if (!review) return;
    captureGmailDisconnectSavedSchema.parse(await post('disconnect', { workspaceId, accountId: review.account.id, expectedAccountVersion: review.account.version, reviewId: review.reviewId, confirmed: true }));
    if (mounted.current) { setReview(undefined); await latest.current.onChanged(); await reload(); }
  });
  return { ...data, status, pending, error, redirecting: !!authorization, reload: () => { void reload(); }, connect: () => request({ kind: 'connect' }), reconnect: (accountId: string) => request({ kind: 'reconnect', accountId }), select: (accountId: string) => request({ kind: 'select', accountId }), disconnect,
    dialogs: <>
      <ConfirmDialog open={!!intent} title="Save draft before changing Gmail connection" description="Save your current draft, then continue with the Gmail account change. Connecting an account does not launch capture." confirmLabel="Save draft and continue" pending={pending} error={error} onClose={() => setIntent(undefined)} onConfirm={async () => { if (intent) await execute(intent); }} />
      <ConfirmDialog open={!!review} title="Disconnect Gmail account" description={review ? `Remove Salesmora's stored access to ${review.account.email}. ${review.sources.length ? `Affected sources: ${review.sources.slice(0, 5).map(source => source.name).join(', ')}${review.sources.length > 5 ? ` and ${review.sources.length - 5} more` : ''}. Capture using this account will stop; reconnecting will not resume it automatically.` : 'No capture sources currently use this account.'} Existing leads and retained evidence remain. To revoke the grant across Google applications, also remove this app in your Google Account settings.` : ''} confirmLabel="Disconnect account" destructive pending={pending} error={error} onClose={() => setReview(undefined)} onConfirm={confirmDisconnect} />
    </> };
}
