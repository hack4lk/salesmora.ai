'use client';
import { useRef, useState } from 'react';
import { createReceipts, workOrderRequest, WorkOrderRequestError } from './work-order-client';

type Target = { id: string; version: number };

/** Serialized write calls against the work-order API with retry-safe submission ids and a shared error state. */
export function useWorkOrderWrites(workspaceId: string, fallback: string) {
  const [pending, setPending] = useState(false), [error, setError] = useState(''), [conflict, setConflict] = useState(false);
  const flight = useRef(false), receipts = useRef(createReceipts());
  async function run<T>(url: string, method: 'POST' | 'PATCH', payload: object): Promise<T | undefined> {
    if (flight.current) return undefined;
    flight.current = true; setPending(true); setError(''); setConflict(false);
    try {
      const submissionId = receipts.current({ url, ...payload });
      return await workOrderRequest<T>(url, { method, body: JSON.stringify({ workspaceId, submissionId, ...payload }) }, fallback);
    } catch (e) {
      setError(e instanceof Error ? e.message : fallback); setConflict(e instanceof WorkOrderRequestError && e.status === 409);
      return undefined;
    } finally { flight.current = false; setPending(false); }
  }
  return {
    pending, error, conflict, clearError: () => { setError(''); setConflict(false); },
    patch: (target: Target, payload: object) => run<{ workOrderId: string; version: number }>(`/api/work-orders/${target.id}`, 'PATCH', { expectedVersion: target.version, ...payload }),
    create: (payload: object) => run<{ workOrderId: string; version: number }>('/api/work-orders', 'POST', payload),
  };
}

export const statusPayload = (to: string, reason = '') => ({ action: 'status', to, reason, confirmed: true });
