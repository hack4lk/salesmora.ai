export class WorkOrderRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

export async function workOrderRequest<T>(url: string, init: RequestInit | undefined, fallback: string): Promise<T> {
  const response = await fetch(url, { ...init, cache: 'no-store', headers: { 'Content-Type': 'application/json', ...init?.headers } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new WorkOrderRequestError(body.error ?? fallback, response.status);
  return body as T;
}

/** Reuses the submission id while the same payload is retried so a lost response cannot apply twice. */
export function createReceipts() {
  let last: { payload: string; id: string } | undefined;
  return (payload: object) => {
    const key = JSON.stringify(payload);
    if (!last || last.payload !== key) last = { payload: key, id: crypto.randomUUID() };
    return last.id;
  };
}
