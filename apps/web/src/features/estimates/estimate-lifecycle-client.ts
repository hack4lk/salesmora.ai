export const estimateLifecycleData = {
  loadError: "Estimate history could not be loaded. Try again.",
  reviewError: "The withdrawal review could not be loaded. Reload and try again.",
  voidError: "The estimate could not be withdrawn. Retry this confirmation or reload and review again.",
  mismatch: "The estimate changed. Reload its current details and review again.",
  voided: "Estimate withdrawn. Its customer link is no longer available.",
  reviewLoading: "Loading the current withdrawal review...",
} as const;

export class EstimateLifecycleRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

export async function estimateLifecycleRequest<T>(url: string, fallback: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...init, cache: "no-store", headers: init.body ? { "Content-Type": "application/json" } : init.headers,
  });
  const body: unknown = await response.json();
  if (!response.ok) {
    const message = body && typeof body === "object" && "error" in body && typeof body.error === "string"
      ? body.error : fallback;
    throw new EstimateLifecycleRequestError(message, response.status);
  }
  return body as T;
}
