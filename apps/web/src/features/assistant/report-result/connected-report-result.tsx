'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { reportAssistantResultResponseSchema, type ReportAssistantResultResponse,
  type ReportAssistantTicket } from '@salesmora/contracts';
import { reportHref } from '../../reports/report-navigation';
import { ReportResult, type ReportResultProps } from './report-result';

export function ConnectedReportResult({ ticket, workspaceId, turnId, disabled, onNavigate, onInvalidated }: {
  ticket: ReportAssistantTicket; workspaceId: string; turnId: string; disabled: boolean;
  onNavigate: (href: string) => void; onInvalidated?: () => void;
}) {
  const [current, setCurrent] = useState<ReportAssistantResultResponse>();
  const [state, setState] = useState<ReportResultProps['state']>('loading');
  const [opening, setOpening] = useState(false);
  const sequence = useRef(0), flight = useRef(false), mounted = useRef(false);
  const controllers = useRef(new Set<AbortController>());
  const invalidate = useCallback(() => { sequence.current++; }, []);
  const latest = useRef({ disabled, onInvalidated, onNavigate });
  useLayoutEffect(() => { latest.current = { disabled, onInvalidated, onNavigate }; }, [disabled, onInvalidated, onNavigate]);
  const fail = useCallback((status?: number) => {
    setCurrent(undefined);
    setState(status === 403 || status === 401 || status === 423 ? 'unavailable' : status === 409 ? 'stale' : 'error');
    latest.current.onInvalidated?.();
  }, []);
  const refresh = useCallback(async () => {
    if (flight.current) return;
    const token = ++sequence.current, controller = new AbortController();
    controllers.current.add(controller);
    let status: number | undefined;
    try {
      const params = new URLSearchParams({ workspaceId, turnId, resultId: ticket.id });
      const response = await fetch(`/api/chat/reports?${params}`, { cache: 'no-store', signal: controller.signal });
      status = response.status;
      if (!response.ok) throw new Error('Report result unavailable.');
      const next = reportAssistantResultResponseSchema.parse(await response.json());
      if (next.snapshot.selection.query.workspaceId !== workspaceId || next.snapshot.result.id !== ticket.id ||
        next.snapshot.result.area !== ticket.area || next.retrievedAt !== ticket.retrievedAt) {
        throw new Error('Report ticket does not match the saved result.');
      }
      if (mounted.current && token === sequence.current) { setCurrent(next); setState('ready'); }
    } catch (error) {
      if (!controller.signal.aborted && mounted.current && token === sequence.current) {
        if (!(error instanceof Error)) throw error;
        fail(status);
      }
    } finally { controllers.current.delete(controller); }
  }, [workspaceId, turnId, ticket.id, ticket.area, ticket.retrievedAt, fail]);
  useEffect(() => {
    mounted.current = true;
    void Promise.resolve().then(refresh);
    const active = controllers.current;
    const recheck = () => { if (document.visibilityState !== 'hidden') void refresh(); };
    window.addEventListener('focus', recheck);
    const timer = setInterval(recheck, 15000);
    return () => {
      mounted.current = false; invalidate();
      for (const controller of active) controller.abort();
      clearInterval(timer); window.removeEventListener('focus', recheck);
    };
  }, [refresh, invalidate]);
  async function open(id: string) {
    if (latest.current.disabled || flight.current || !current || state !== 'ready' || id !== ticket.id) return;
    flight.current = true; setOpening(true);
    const token = ++sequence.current, controller = new AbortController();
    controllers.current.add(controller);
    let status: number | undefined;
    try {
      const response = await fetch('/api/chat/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        signal: controller.signal, body: JSON.stringify({ workspaceId, turnId, resultId: id }) });
      status = response.status;
      if (!response.ok) throw new Error('Report navigation unavailable.');
      const value: unknown = await response.json();
      const expected = reportHref(current.snapshot.selection);
      if (!value || typeof value !== 'object' || !('href' in value) || value.href !== expected) {
        throw new Error('Report navigation does not match the saved query.');
      }
      if (mounted.current && token === sequence.current && !latest.current.disabled) latest.current.onNavigate(expected);
    } catch (error) {
      if (!controller.signal.aborted && mounted.current && token === sequence.current) {
        if (!(error instanceof Error)) throw error;
        fail(status);
      }
    } finally {
      controllers.current.delete(controller); flight.current = false;
      if (mounted.current) setOpening(false);
    }
  }
  const bound = current?.snapshot.result.id === ticket.id && current.snapshot.result.area === ticket.area &&
    current.snapshot.selection.query.workspaceId === workspaceId && current.retrievedAt === ticket.retrievedAt ? current : undefined;
  return <ReportResult result={bound?.snapshot.result} state={state === 'ready' && !bound ? 'loading' : state} disabled={disabled || opening}
    onOpenReport={id => { void open(id); }} />;
}
