'use client';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateLeadQueries } from '../../leads/leads-page/lead-queries';
import { intakeDetailViewSchema, intakeListViewSchema, intakeQuerySchema, intakeDecisionResultSchema, intakePreparedReviewSchema, type IntakeDetailView, type IntakeListView, type IntakePreparedReview, type IntakeQuery } from '@salesmora/contracts';
import { ApiQueryScopeBoundary, useApiQueryScope } from '../../api/api-query-provider';
import { useApiQuery } from '../../api/use-api-query';
import { useApiMutation } from '../../api/use-api-mutation';
import { apiReadOptions, invalidateWorkspaceResources } from '../../api/api-read-options';
import { ApiRequestError } from '../../api/api-request';
import { isApiAccessError } from '../../api/api-query';
import { FormFeedback } from '@salesmora/ui';
import { IntakeReviewPage } from '../intake-review-page/intake-review-page';
import { IntakeDetailPage } from '../intake-detail-page/intake-detail-page';
import type { IntakeDecisionReviewModel } from '../intake-decision-review/intake-decision-review.validation';
import { intakeEvidence, intakeReview } from './intake-adapters';
const href = (workspaceId: string, intakeId?: string) => `/intake${intakeId ? `/${intakeId}` : ''}?workspace=${encodeURIComponent(workspaceId)}`;
const privateFailure = isApiAccessError;
type IntakeListRouteProps = { initial: IntakeListView; query: IntakeQuery; viewerId: string; initialUpdatedAt: number };
export function IntakeListRoute(props: IntakeListRouteProps) {
  return <ApiQueryScopeBoundary scope={{ viewerId: props.viewerId, workspaceId: props.initial.workspaceId }}>
    <IntakeListContent key={`${props.viewerId}:${props.initial.workspaceId}`} {...props}/>
  </ApiQueryScopeBoundary>;
}
function IntakeListContent({ initial, query: initialQuery, initialUpdatedAt }: IntakeListRouteProps) {
  const search = useSearchParams(), scope = useApiQueryScope();
  const parameters = Object.fromEntries(search);
  const query = intakeQuerySchema.parse({ workspaceId: initial.workspaceId, search: parameters.search ?? initialQuery.search,
    status: parameters.status ?? initialQuery.status, flag: parameters.flag ?? initialQuery.flag, sourceId: parameters.sourceId || undefined,
    page: parameters.page ? Number(parameters.page) : initialQuery.page, pageSize: parameters.pageSize ? Number(parameters.pageSize) : initialQuery.pageSize });
  const queryParams = new URLSearchParams({ workspace: query.workspaceId, search: query.search, status: query.status, flag: query.flag, page: String(query.page), pageSize: String(query.pageSize) });
  if (query.sourceId) queryParams.set('sourceId', query.sourceId);
  const listQuery = useApiQuery({ ...apiReadOptions(scope, 'intake', query, `/api/intake?${queryParams}`, raw => intakeListViewSchema.parse(raw), 'Intake Review could not be loaded.'),
    initialData: JSON.stringify(query) === JSON.stringify(initialQuery) ? initial : undefined, initialDataUpdatedAt: initialUpdatedAt });
  const router = useRouter(), [pending, start] = useTransition();
  const rawParams = search.toString();
  const [draft, setDraft] = useState({ rawParams, filters: { search: query.search, sourceId: query.sourceId ?? '', status: query.status, flag: query.flag } });
  const filters = draft.rawParams === rawParams ? draft.filters : { search: query.search, sourceId: query.sourceId ?? '', status: query.status, flag: query.flag };
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const navigate = (patch: Partial<typeof query>) => { const next = { ...query, ...patch }; const params = new URLSearchParams({ workspace: next.workspaceId, search: next.search, status: next.status, flag: next.flag, page: String(next.page), pageSize: String(next.pageSize) }); if (next.sourceId) params.set('sourceId', next.sourceId); start(() => window.history.pushState(null, '', `/intake?${params}`)); };
  const denied = isApiAccessError(listQuery.error);
  useEffect(() => { if (denied) router.refresh(); }, [denied, router]);
  return <IntakeReviewPage {...(listQuery.data ?? initial)} canRead={!denied} filters={filters} state={listQuery.isError ? 'error' : listQuery.isPending ? 'loading' : 'ready'} pending={pending || listQuery.isFetching} onFilters={value => { setDraft({ rawParams, filters: value }); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => navigate({ ...value, sourceId: value.sourceId || undefined, page: 1 }), 300); }} onOpen={row => router.push(href(initial.workspaceId, row.id))} onPage={page => navigate({ page })} onPageSize={pageSize => navigate({ page: 1, pageSize: pageSize as 25 | 50 | 100 })} onRetry={() => void listQuery.refetch()} />;
}
type IntakeDetailRouteProps = { initial: IntakeDetailView; viewerId: string; initialUpdatedAt: number };
export function IntakeDetailRoute(props: IntakeDetailRouteProps) {
  return <ApiQueryScopeBoundary scope={{ viewerId: props.viewerId, workspaceId: props.initial.workspaceId }}>
    <IntakeDetailContent key={`${props.viewerId}:${props.initial.workspaceId}:${props.initial.item.id}`} {...props}/>
  </ApiQueryScopeBoundary>;
}
function IntakeDetailContent({ initial, initialUpdatedAt }: IntakeDetailRouteProps) {
  const queryClient = useQueryClient();
  const scope = useApiQueryScope();
  const detailOptions = apiReadOptions(scope, 'intake-detail', { id: initial.item.id },
    `/api/intake/${initial.item.id}?workspace=${encodeURIComponent(initial.workspaceId)}`, raw => intakeDetailViewSchema.parse(raw), 'Intake Review could not be loaded.');
  const detailQuery = useApiQuery({ ...detailOptions, initialData: initial, initialDataUpdatedAt: initialUpdatedAt });
  const reviewMutation = useApiMutation('intake-review', raw => intakePreparedReviewSchema.parse(raw), 'Intake review checks could not be prepared.');
  const reviewRequest = reviewMutation.mutateAsync;
  const decisionMutation = useApiMutation('intake', raw => intakeDecisionResultSchema.parse(raw), 'Intake Review could not be updated. Retry or reload the request.');
  const router = useRouter(), [view, setView] = useState(initial), [answers, setAnswers] = useState(initial.item.answers), [decision, setDecision] = useState<IntakeDecisionReviewModel['decision']>('create');
  const [prepared, setPrepared] = useState<IntakePreparedReview | null>(null), [revision, setRevision] = useState('preparing'), [retry, setRetry] = useState(0), [error, setError] = useState(false), [denied, setDenied] = useState(false);
  const mounted = useRef(true), sequence = useRef(0);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    if (view.item.status !== 'awaiting' || denied) return;
    const id = ++sequence.current, abort = new AbortController(), requestId = crypto.randomUUID();
    const timer = setTimeout(() => { setPrepared(null); setError(false); setRevision(requestId); void reviewRequest({ path: '/api/intake/review', method: 'POST', signal: AbortSignal.any([abort.signal, AbortSignal.timeout(20000)]), body: { workspaceId: view.workspaceId, intakeId: view.item.id, expectedVersion: view.item.version, answers, requestId } }).then(data => {
      if (!mounted.current || id !== sequence.current || abort.signal.aborted) return;
      const next = intakePreparedReviewSchema.parse(data);
      if (next.detail.workspaceId !== view.workspaceId || next.detail.item.id !== view.item.id || next.detail.item.version !== view.item.version || next.reviewId !== requestId) throw Error('Invalid review identity');
      setView(next.detail); setPrepared(next);
    }).catch(failure => { if (!mounted.current || id !== sequence.current || abort.signal.aborted) return; if (privateFailure(failure)) setDenied(true); setError(true); }); }, 350);
    return () => { clearTimeout(timer); abort.abort(); };
  }, [answers, view.workspaceId, view.item.id, view.item.version, view.item.status, retry, denied, reviewRequest]);
  // A prepared review expires without silently refreshing a decision already under review.
  useEffect(() => { if (!prepared) return; const timer = setTimeout(() => { setPrepared(null); setDecision('create'); setError(true); }, Math.max(0, Date.parse(prepared.expiresAt) - Date.now())); return () => clearTimeout(timer); }, [prepared]);
  if (denied || isApiAccessError(detailQuery.error)) return <FormFeedback kind="error" message="This intake item or workspace is unavailable." />;
  const model = intakeReview(view, prepared, answers, decision, revision);
  const detailFeedback = detailQuery.isError ? <div className="grid justify-items-start gap-3"><FormFeedback kind="error" message="Current intake details could not refresh. Your corrections are retained."/><button type="button" className="min-h-11 rounded-xl border border-line bg-paper px-4 py-2 text-primary" onClick={() => void detailQuery.refetch()}>Retry details</button></div> : null;
  return <div className="grid gap-6">{detailFeedback}{error && <div className="grid justify-items-start gap-3"><FormFeedback kind="error" message="The review could not be refreshed. Your corrections are retained. Retry before deciding." /><button type="button" className="min-h-11 rounded-xl border border-line bg-paper px-4 py-2 text-primary" onClick={() => { setDecision('create'); setRetry(value => value + 1); }}>Retry review checks</button></div>}{prepared && !prepared.assignmentReady && <FormFeedback kind="error" message="The configured assignee is unavailable. Fix the source assignment before creating a lead, or review the other outcomes." />}<IntakeDetailPage resolvedOutcome={view.decisionKind ?? undefined} review={model} evidence={intakeEvidence(view)} originalAnswers={view.receipt.originalAnswers} canRead canEdit={view.capabilities.canEdit} canReadMatches={view.capabilities.canReadMatches} timezone={view.timezone} matchesState={error ? 'error' : prepared || view.item.status !== 'awaiting' ? 'ready' : 'loading'} uncertainFieldIds={view.receipt.evidence.fields.filter(field => field.uncertain).map(field => field.fieldId)}
    onAnswers={value => { sequence.current++; setPrepared(null); setAnswers(value); setDecision('create'); }} onDecision={setDecision} onRetryMatches={() => { setDecision('create'); setRetry(value => value + 1); }} onLeave={() => router.push(href(view.workspaceId))}
    onReload={async () => { try { await queryClient.invalidateQueries({ queryKey: detailOptions.queryKey, refetchType: 'none' }); const next = await queryClient.fetchQuery(detailOptions); if (next.workspaceId !== view.workspaceId || next.item.id !== view.item.id) throw Error('Invalid intake identity'); sequence.current++; setPrepared(null); setView(next); setAnswers(next.item.answers); setDecision('create'); setRetry(value => value + 1); setError(false); } catch (failure) { if (privateFailure(failure)) setDenied(true); setError(true); throw failure; } }}
    onConfirm={async payload => { const { reviewRevision, ...input } = payload; try { await decisionMutation.mutateAsync({ path: '/api/intake/decisions', method: 'POST', body: { ...input, workspaceId: view.workspaceId, reviewId: reviewRevision } }); try { await Promise.all([invalidateLeadQueries(queryClient, view.workspaceId), invalidateWorkspaceResources(queryClient, view.workspaceId, ['intake'])]); } catch { setError(true); } return { ok: true }; } catch (failure) { if (privateFailure(failure)) setDenied(true); return { ok: false, kind: failure instanceof ApiRequestError && failure.status === 409 ? typeof failure.details === 'object' && failure.details !== null && 'code' in failure.details && failure.details.code === 'capacity' ? 'capacity' : 'conflict' : 'error' }; } }} /></div>;
}
