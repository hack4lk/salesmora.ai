'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { captureChatResultSchema, type CaptureChatTicket } from '@salesmora/contracts';
import { CaptureAssistantResult } from './capture-result';
import type { CaptureAssistantClient } from './capture-result.types';
import { captureAssistantResultData as copy } from './capture-result.data';
export function ConnectedCaptureRead(props: { ticket: CaptureChatTicket; disabled: boolean; onNavigate: (href: string) => void }) {
  return <Read key={JSON.stringify(props.ticket)} {...props} />;
}
function Read({ ticket, disabled, onNavigate }: { ticket: CaptureChatTicket; disabled: boolean; onNavigate: (href: string) => void }) {
  const [unavailable, setUnavailable] = useState(false);
  const mounted = useRef(false), flight = useRef(false), latestDisabled = useRef(disabled), active = useRef<AbortController | null>(null);
  useEffect(() => { latestDisabled.current = disabled; }, [disabled]);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; active.current?.abort(); }; }, []);
  const reference = useMemo(() => ({ kind: 'result' as const, workspaceId: ticket.workspaceId, resultId: ticket.resultId, snapshotHash: ticket.snapshotHash }), [ticket]);
  const client = useMemo<CaptureAssistantClient>(() => ({
    async read(_reference, signal) {
      const query = new URLSearchParams({ workspaceId: ticket.workspaceId, turnId: ticket.turnId, resultId: ticket.resultId, snapshotHash: ticket.snapshotHash });
      const response = await fetch(`/api/chat/lead-capture?${query}`, { cache: 'no-store', signal });
      if (!response.ok) throw Error(copy.unavailable);
      const result = captureChatResultSchema.parse((await response.json()).result);
      if (result.id !== ticket.resultId || result.workspaceId !== ticket.workspaceId || result.operation !== ticket.operation) throw Error(copy.unavailable);
      return { kind: 'result', reference, retrievedAt: result.retrievedAt, content: { kind: 'capture_read', result } };
    },
    async decide() { throw Error('Read results cannot confirm business changes.'); },
  }), [ticket, reference]);
  async function open(sourceId: string) {
    if (disabled || unavailable || flight.current) return;
    flight.current = true; const abort = new AbortController(); active.current = abort;
    try {
      const binding = { workspaceId: ticket.workspaceId, turnId: ticket.turnId, resultId: ticket.resultId, snapshotHash: ticket.snapshotHash };
      const response = await fetch('/api/chat/lead-capture', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...binding, sourceId }), signal: abort.signal });
      if (!response.ok) throw Error(copy.unavailable);
      const { href } = await response.json(); if (typeof href !== 'string') throw Error(copy.unavailable);
      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin || url.pathname !== `/lead-capture/${sourceId}` || url.search !== `?workspace=${ticket.workspaceId}` || url.hash || url.username || url.password) throw Error(copy.unavailable);
      if (mounted.current && !abort.signal.aborted && !latestDisabled.current) onNavigate(url.pathname + url.search);
    } catch { if (mounted.current && !abort.signal.aborted) setUnavailable(true); }
    finally { flight.current = false; }
  }
  return <><CaptureAssistantResult reference={reference} client={client} disabled={disabled || unavailable} onRefresh={async () => {}} onOpen={record => { if (record.kind === 'source') void open(record.id); }} />{unavailable && <button type="button" className="min-h-11 rounded-xl border border-line p-3 text-sm text-primary" onClick={() => setUnavailable(false)}>{copy.retry}</button>}</>;
}
