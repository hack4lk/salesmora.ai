import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiRequest, ApiContractError, ApiRequestError, ApiTransportError } from './api-request';

const parse = (raw: unknown) => {
  if (typeof raw !== 'object' || raw === null || !('value' in raw) || typeof raw.value !== 'string') throw new Error('Invalid contract');
  return { value: raw.value };
};
const options = { parse, failureMessage: 'Could not load data.' };
afterEach(() => vi.unstubAllGlobals());

describe('API JSON transport', () => {
  it('validates results, uses private transport, and forwards cancellation', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ value: 'ready' }));
    vi.stubGlobal('fetch', fetch);
    const abort = new AbortController();
    expect(await apiRequest('/api/leads?workspace=one', { ...options, signal: abort.signal })).toEqual({ value: 'ready' });
    expect(fetch).toHaveBeenCalledWith('/api/leads?workspace=one', { method: 'GET', credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: abort.signal });
  });

  it('preserves status, safe server message, and structured conflict details', async () => {
    const conflict = { error: 'Reload this record.', version: 4, code: 'version_conflict' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(conflict, { status: 409 })));
    await expect(apiRequest('/api/leads/one', { ...options, method: 'PATCH', body: { version: 3 } })).rejects.toMatchObject({
      name: 'ApiRequestError', status: 409, message: conflict.error, details: conflict,
    });
  });

  it('sends writes once with a JSON body', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ value: 'saved' }));
    vi.stubGlobal('fetch', fetch);
    await apiRequest('/api/leads', { ...options, method: 'POST', body: { name: 'Lead' } });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/leads', expect.objectContaining({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"name":"Lead"}' }));
  });

  it('keeps denial status even when an error response is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Unavailable', { status: 403 })));
    await expect(apiRequest('/api/leads', options)).rejects.toMatchObject({ status: 403, message: options.failureMessage });
  });

  it('rejects malformed successful JSON and contract violations explicitly', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not JSON')));
    await expect(apiRequest('/api/leads', options)).rejects.toBeInstanceOf(ApiContractError);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ value: 12 })));
    await expect(apiRequest('/api/leads', options)).rejects.toBeInstanceOf(ApiContractError);
  });

  it('supports explicitly validated no-content results', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    await expect(apiRequest('/api/leads/one', { method: 'DELETE', failureMessage: options.failureMessage, parse: raw => {
      if (raw !== undefined) throw new Error('Expected no content');
      return true;
    } })).resolves.toBe(true);
  });

  it('distinguishes retryable network failures from cancellation', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(apiRequest('/api/leads', options)).rejects.toBeInstanceOf(ApiTransportError);
    const abort = new AbortController();
    abort.abort();
    const error = new DOMException('Aborted', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));
    await expect(apiRequest('/api/leads', { ...options, signal: abort.signal })).rejects.toBe(error);
  });

  it.each(['https://other.example/api/leads', '//other.example/api/leads', '/api/\\other', '/api/leads#fragment'])('rejects invalid transport path %s before making a request', async path => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    await expect(apiRequest(path, options)).rejects.toBeInstanceOf(ApiContractError);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('does not treat normal HTTP failures as network errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ error: 'Server failure' }, { status: 500 })));
    await expect(apiRequest('/api/leads', options)).rejects.toBeInstanceOf(ApiRequestError);
  });

  it('rejects invalid request bodies as contract errors before sending', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    await expect(apiRequest('/api/leads', { ...options, body: {} })).rejects.toBeInstanceOf(ApiContractError);
    await expect(apiRequest('/api/leads', { ...options, method: 'POST', body: 1n })).rejects.toBeInstanceOf(ApiContractError);
    expect(fetch).not.toHaveBeenCalled();
  });
});
