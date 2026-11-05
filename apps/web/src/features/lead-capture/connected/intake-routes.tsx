'use client';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { intakeDetailViewSchema, intakePreparedReviewSchema, type IntakeDetailView, type IntakeListView, type IntakePreparedReview, type IntakeQuery } from '@salesmora/contracts';
import { FormFeedback } from '@salesmora/ui';
import { IntakeReviewPage } from '../intake-review-page/intake-review-page';
import { IntakeDetailPage } from '../intake-detail-page/intake-detail-page';
import type { IntakeDecisionReviewModel } from '../intake-decision-review/intake-decision-review.validation';
import { intakeEvidence, intakeReview } from './intake-adapters';
class IntakeRequestError extends Error { constructor(readonly status: number, readonly code: string) { super('Intake Review could not be updated. Retry or reload the request.'); } }
async function request(path: string, input?: unknown, signal?: AbortSignal) {
  const response = await fetch(path, { method: input ? 'POST' : 'GET', headers: input ? { 'Content-Type': 'application/json' } : undefined, body: input ? JSON.stringify(input) : undefined, cache: 'no-store', signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000) });
  const data = await response.json(); if (!response.ok) throw new IntakeRequestError(response.status, data.code); return data;
}
const href = (workspaceId: string, intakeId?: string) => `/intake${intakeId ? `/${intakeId}` : ''}?workspace=${encodeURIComponent(workspaceId)}`;
const privateFailure = (error: unknown) => error instanceof IntakeRequestError && [401, 403, 404, 423].includes(error.status);
export function IntakeListRoute({ initial, query }: { initial: IntakeListView; query: IntakeQuery }) {
  const router = useRouter(), [pending, start] = useTransition(), [filters, setFilters] = useState({ search: query.search, sourceId: query.sourceId ?? '', status: query.status, flag: query.flag });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const navigate = (patch: Partial<typeof query>) => { const next = { ...query, ...patch }; const params = new URLSearchParams({ workspace: next.workspaceId, search: next.search, status: next.status, flag: next.flag, page: String(next.page), pageSize: String(next.pageSize) }); if (next.sourceId) params.set('sourceId', next.sourceId); start(() => router.push(`/intake?${params}`)); };
  return <IntakeReviewPage {...initial} canRead filters={filters} pending={pending} onFilters={value => { setFilters(value); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => navigate({ ...value, sourceId: value.sourceId || undefined, page: 1 }), 300); }} onOpen={row => router.push(href(initial.workspaceId, row.id))} onPage={page => navigate({ page })} onPageSize={pageSize => navigate({ page: 1, pageSize: pageSize as 25 | 50 | 100 })} onRetry={() => router.refresh()} />;
}
export function IntakeDetailRoute({ initial }: { initial: IntakeDetailView }) {
  const router = useRouter(), [view, setView] = useState(initial), [answers, setAnswers] = useState(initial.item.answers), [decision, setDecision] = useState<IntakeDecisionReviewModel['decision']>('create');
  const [prepared, setPrepared] = useState<IntakePreparedReview | null>(null), [revision, setRevision] = useState('preparing'), [retry, setRetry] = useState(0), [error, setError] = useState(false), [denied, setDenied] = useState(false);
  const mounted = useRef(true), sequence = useRef(0);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    if (view.item.status !== 'awaiting' || denied) return;
    const id = ++sequence.current, abort = new AbortController(), requestId = crypto.randomUUID();
    const timer = setTimeout(() => { setPrepared(null); setError(false); setRevision(requestId); void request('/api/intake/review', { workspaceId: view.workspaceId, intakeId: view.item.id, expectedVersion: view.item.version, answers, requestId }, abort.signal).then(data => {
      if (!mounted.current || id !== sequence.current || abort.signal.aborted) return;
      const next = intakePreparedReviewSchema.parse(data);
      if (next.detail.workspaceId !== view.workspaceId || next.detail.item.id !== view.item.id || next.detail.item.version !== view.item.version || next.reviewId !== requestId) throw Error('Invalid review identity');
      setView(next.detail); setPrepared(next);
    }).catch(failure => { if (!mounted.current || id !== sequence.current || abort.signal.aborted) return; if (privateFailure(failure)) setDenied(true); setError(true); }); }, 350);
    return () => { clearTimeout(timer); abort.abort(); };
  }, [answers, view.workspaceId, view.item.id, view.item.version, view.item.status, retry, denied]);
  // A prepared review expires without silently refreshing a decision already under review.
  useEffect(() => { if (!prepared) return; const timer = setTimeout(() => { setPrepared(null); setDecision('create'); setError(true); }, Math.max(0, Date.parse(prepared.expiresAt) - Date.now())); return () => clearTimeout(timer); }, [prepared]);
  if (denied) return <FormFeedback kind="error" message="This intake item or workspace is unavailable." />;
  const model = intakeReview(view, prepared, answers, decision, revision);
  return <div className="grid gap-6">{error && <div className="grid justify-items-start gap-3"><FormFeedback kind="error" message="The review could not be refreshed. Your corrections are retained. Retry before deciding." /><button type="button" className="min-h-11 rounded-xl border border-line bg-paper px-4 py-2 text-primary" onClick={() => { setDecision('create'); setRetry(value => value + 1); }}>Retry review checks</button></div>}{prepared && !prepared.assignmentReady && <FormFeedback kind="error" message="The configured assignee is unavailable. Fix the source assignment before creating a lead, or review the other outcomes." />}<IntakeDetailPage resolvedOutcome={view.decisionKind ?? undefined} review={model} evidence={intakeEvidence(view)} originalAnswers={view.receipt.originalAnswers} canRead canEdit={view.capabilities.canEdit} canReadMatches={view.capabilities.canReadMatches} timezone={view.timezone} matchesState={error ? 'error' : prepared || view.item.status !== 'awaiting' ? 'ready' : 'loading'} uncertainFieldIds={view.receipt.evidence.fields.filter(field => field.uncertain).map(field => field.fieldId)}
    onAnswers={value => { sequence.current++; setPrepared(null); setAnswers(value); setDecision('create'); }} onDecision={setDecision} onRetryMatches={() => { setDecision('create'); setRetry(value => value + 1); }} onLeave={() => router.push(href(view.workspaceId))}
    onReload={async () => { try { const next = intakeDetailViewSchema.parse(await request(`/api/intake/${view.item.id}?workspace=${encodeURIComponent(view.workspaceId)}`)); if (next.workspaceId !== view.workspaceId || next.item.id !== view.item.id) throw Error('Invalid intake identity'); sequence.current++; setPrepared(null); setView(next); setAnswers(next.item.answers); setDecision('create'); setRetry(value => value + 1); setError(false); } catch (failure) { if (privateFailure(failure)) setDenied(true); setError(true); throw failure; } }}
    onConfirm={async payload => { const { reviewRevision, ...input } = payload; try { const result = await request('/api/intake/decisions', { ...input, workspaceId: view.workspaceId, reviewId: reviewRevision }); if (result?.ok !== true) throw Error('Invalid decision result'); return { ok: true }; } catch (failure) { if (privateFailure(failure)) setDenied(true); return { ok: false, kind: failure instanceof IntakeRequestError && failure.status === 409 ? failure.code === 'capacity' ? 'capacity' : 'conflict' : 'error' }; } }} /></div>;
}
