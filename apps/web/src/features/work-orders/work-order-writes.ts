'use client';
import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { workOrderSavedResultSchema } from '@salesmora/contracts';
import { createReceipts } from './work-order-client';
import { useApiMutation } from '../api/use-api-mutation';
import { invalidateWorkspaceResources } from '../api/api-read-options';
import { ApiRequestError } from '../api/api-request';
import { isApiAccessError } from '../api/api-query';

type Target = { id: string; version: number };

/** Serialized write calls against the work-order API with retry-safe submission ids and a shared error state. */
export function useWorkOrderWrites(workspaceId: string, fallback: string) {
  const [pending, setPending] = useState(false), [error, setError] = useState(''), [conflict, setConflict] = useState(false), [denied, setDenied] = useState(false);
  const client = useQueryClient();
  const mutation = useApiMutation('work-orders', raw => workOrderSavedResultSchema.parse(raw), fallback);
  const flight = useRef(false), receipts = useRef(createReceipts());
  async function run(url: string, method: 'POST' | 'PATCH', payload: object) {
    if (flight.current) return undefined;
    flight.current = true; setPending(true); setError(''); setConflict(false);
    try {
      const submissionId = receipts.current({ url, ...payload });
      const result = await mutation.mutateAsync({ path: url, method, body: { workspaceId, submissionId, ...payload } });
      const deleting = 'action' in payload && payload.action === 'delete';
      if (deleting) {
        client.removeQueries({ queryKey: ['api'], predicate: query => {
          const parameters = query.queryKey[6];
          return query.queryKey[3] === workspaceId && ['work-order-detail', 'work-order-visit'].includes(String(query.queryKey[4])) &&
            typeof parameters === 'object' && parameters !== null && 'id' in parameters && parameters.id === result.workOrderId;
        } });
      }
      try { await invalidateWorkspaceResources(client, workspaceId, ['work-orders', 'jobs', 'calendar', 'home', 'reports'], { refetchType: deleting ? 'none' : 'active' }); }
      catch { setError('Your change was saved, but work orders could not refresh. Reload the latest details.'); }
      return result;
    } catch (e) {
      setDenied(isApiAccessError(e));
      setError(e instanceof Error ? e.message : fallback); setConflict(e instanceof ApiRequestError && e.status === 409);
      return undefined;
    } finally { flight.current = false; setPending(false); }
  }
  return {
    pending, error, conflict, denied, clearError: () => { setError(''); setConflict(false); },
    patch: (target: Target, payload: object) => run(`/api/work-orders/${target.id}`, 'PATCH', { expectedVersion: target.version, ...payload }),
    create: (payload: object) => run('/api/work-orders', 'POST', payload),
  };
}

export const statusPayload = (to: string, reason = '') => ({ action: 'status', to, reason, confirmed: true });
