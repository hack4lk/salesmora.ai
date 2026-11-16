export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details: unknown,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export class ApiTransportError extends Error {
  constructor(message: string, cause: unknown) {
    super(message, { cause });
    this.name = 'ApiTransportError';
  }
}

export class ApiContractError extends Error {
  constructor(message: string, cause: unknown) {
    super(message, { cause });
    this.name = 'ApiContractError';
  }
}

export interface ApiRequestOptions<T> {
  signal?: AbortSignal;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  parse: (raw: unknown) => T;
  failureMessage: string;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions<T>): Promise<T> {
  if (!path.startsWith('/api/') || /[\\#]/.test(path)) {
    throw new ApiContractError(options.failureMessage, new Error('Expected a same-origin API path.'));
  }
  let body: string | undefined;
  if (options.body !== undefined) {
    if (!options.method || options.method === 'GET') {
      throw new ApiContractError(options.failureMessage, new Error('GET requests cannot contain a JSON body.'));
    }
    try {
      body = JSON.stringify(options.body);
    } catch (error) {
      throw new ApiContractError(options.failureMessage, error);
    }
    if (body === undefined) throw new ApiContractError(options.failureMessage, new Error('Expected a JSON request body.'));
  }
  let response: Response;
  try {
    response = await fetch(path, {
      method: options.method ?? 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      redirect: 'error',
      signal: options.signal,
      ...(body !== undefined ? {
        headers: { 'Content-Type': 'application/json' },
        body,
      } : {}),
    });
  } catch (error) {
    if (options.signal?.aborted || (error instanceof Error && error.name === 'AbortError')) throw error;
    throw new ApiTransportError(options.failureMessage, error);
  }
  let raw: unknown;
  try {
    raw = response.status === 204 ? undefined : await response.json();
  } catch (error) {
    if (options.signal?.aborted || (error instanceof Error && error.name === 'AbortError')) throw error;
    if (!response.ok) throw new ApiRequestError(options.failureMessage, response.status, undefined);
    throw new ApiContractError(options.failureMessage, error);
  }
  if (!response.ok) {
    const message = typeof raw === 'object' && raw !== null && 'error' in raw && typeof raw.error === 'string'
      ? raw.error : options.failureMessage;
    throw new ApiRequestError(message, response.status, raw);
  }
  try {
    return options.parse(raw);
  } catch (error) {
    throw new ApiContractError(options.failureMessage, error);
  }
}
