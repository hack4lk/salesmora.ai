import { afterEach, describe, expect, it, vi } from 'vitest';
import { MutationObserver } from '@tanstack/react-query';
import {
  captureAssistantProposalTicketSchema, captureSetupViewSchema, initialCaptureSetupConfiguration,
  type CaptureChatTicket, type CaptureSetupView,
} from '@salesmora/contracts';
import { createApiQueryClient } from '../../api/api-query';
import { ApiContractError } from '../../api/api-request';
import { assistantResultMutationOptions, assistantResultOptions, readAssistantResult } from '../assistant-result-queries';
import { captureAssistantProposalFixture, captureAssistantWorkspace as workspaceId } from './capture-result.fixtures';
import { captureNavigationResponse, captureProposalResponse, captureReadResponse } from './capture-result.requests';

const sourceId = '00000000-0000-4000-8000-000000000002', resultId = '00000000-0000-4000-8000-000000000003';
const ticket: CaptureChatTicket = { workspaceId, resultId, turnId: sourceId, snapshotHash: 'a'.repeat(64), operation: 'sources' };
const result = { id: resultId, workspaceId, operation: 'sources', retrievedAt: '2026-11-02T12:00:00Z', timezone: 'America/New_York', rows: [], total: 0, page: 1, limit: 20, filters: { search: '', archived: false } };
const scope = { viewerId: 'viewer', workspaceId };
const path = '/api/chat/lead-capture/setup', resource = 'assistant-capture-setup';
function proposal(raw: unknown) {
  if (!raw || typeof raw !== 'object' || !('ticket' in raw)) throw Error('Missing ticket.');
  return { ticket: captureAssistantProposalTicketSchema.parse(raw.ticket) };
}
function setup(): CaptureSetupView {
  return {
    ticket: { ...captureAssistantProposalFixture().ticket, operation: 'create_source', target: { kind: 'new_source' } },
    review: { name: 'Fictional source', configuration: initialCaptureSetupConfiguration('website', { businessName: 'Fictional repairs', businessEmail: '', businessPhone: '' }), before: null, base: null, sample: null, findings: [] },
    receipt: null,
  };
}
afterEach(() => vi.unstubAllGlobals());

describe('capture assistant response binding', () => {
  it('accepts a matching read and rejects result, workspace and operation changes', () => {
    expect(captureReadResponse(ticket, { result })).toEqual(result);
    for (const patch of [{ id: sourceId }, { workspaceId: sourceId }, { operation: 'source_summary' }]) {
      expect(() => captureReadResponse(ticket, { result: { ...result, ...patch } })).toThrow();
    }
    expect(() => captureReadResponse(ticket, {})).toThrow();
  });
  it('validates the full proposal binding independently of object property ordering', () => {
    const view = setup();
    expect(captureProposalResponse(view.ticket, raw => captureSetupViewSchema.parse(raw), { view })).toEqual(view);
    const target = { ...captureAssistantProposalFixture().ticket.target };
    const pending = { ticket: { ...captureAssistantProposalFixture().ticket, target } };
    const ticket = pending.ticket;
    for (const patch of [
      { workspaceId: sourceId }, { proposalId: sourceId }, { inputHash: 'b'.repeat(64) },
      { operation: 'suggest_workflow' as const },
      { target: { ...target, sourceVersion: 10 } },
    ]) expect(() => captureProposalResponse(ticket, proposal, { view: { ticket: { ...ticket, ...patch } } })).toThrow();
    expect(captureProposalResponse(ticket, proposal, { view: { ticket: { ...ticket, target: { approvedVersion: 1, draftVersion: 1, sourceVersion: 2, sourceId, kind: 'source' } } } })).toEqual(pending);
  });
  it('binds scheduled-source decisions to the exact transition and configuration version', () => {
    const ticket = { ...captureAssistantProposalFixture('publication').ticket, operation: 'change_schedule' as const, transition: { transitionId: resultId, configurationVersion: 1 } };
    expect(captureProposalResponse(ticket, proposal, { view: { ticket } }).ticket).toEqual(ticket);
    for (const transition of [{ transitionId: sourceId, configurationVersion: 1 }, { transitionId: resultId, configurationVersion: 2 }]) {
      expect(() => captureProposalResponse(ticket, proposal, { view: { ticket: { ...ticket, transition } } })).toThrow();
    }
  });
  it.each(['confirm', 'cancel'] as const)('rejects a wrong %s outcome before applying callbacks', decision => {
    const view = setup();
    const parse = (raw: unknown) => captureSetupViewSchema.parse(raw);
    expect(() => captureProposalResponse(view.ticket, parse, { view }, decision)).toThrow();
    if (decision === 'cancel') expect(captureProposalResponse(view.ticket, parse, { view: { ...view, ticket: { ...view.ticket, state: 'cancelled' } } }, decision).ticket.state).toBe('cancelled');
  });
  it('rejects a mismatched receipt before caching a query result', async () => {
    const view = setup();
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ view: { ...view, ticket: { ...view.ticket, workspaceId: sourceId } } })));
    const client = createApiQueryClient({ testing: true });
    const parse = (raw: unknown) => captureProposalResponse(view.ticket, raw => captureSetupViewSchema.parse(raw), raw);
    await expect(readAssistantResult(client, scope, resource, path, parse, 'Unavailable.', new AbortController().signal)).rejects.toBeInstanceOf(ApiContractError);
    expect(client.getQueryData(assistantResultOptions(scope, resource, path, parse, 'Unavailable.').queryKey)).toBeUndefined();
    client.clear();
  });
  it.each(['confirm', 'cancel'] as const)('preserves the reviewed %s payload without automatically retrying', async decision => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => Response.json({}, { status: 409 }));
    vi.stubGlobal('fetch', fetch);
    const client = createApiQueryClient(), view = setup();
    const observer = new MutationObserver(client, assistantResultMutationOptions<CaptureSetupView>(client, scope, resource, 'Unavailable.'));
    const body = { workspaceId, proposalId: view.ticket.proposalId, inputHash: view.ticket.inputHash, decision };
    await expect(observer.mutate({
      path, body, signal: new AbortController().signal, changes: true,
      parse: raw => captureProposalResponse(view.ticket, raw => captureSetupViewSchema.parse(raw), raw, decision),
    })).rejects.toMatchObject({ status: 409 });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toEqual(body);
    client.clear();
  });
});

describe('capture assistant navigation', () => {
  const origin = 'https://app.example.test', href = `/lead-capture/${sourceId}?workspace=${workspaceId}`;
  it('accepts only the authorized source and workspace', () => {
    expect(captureNavigationResponse(workspaceId, sourceId, { href }, origin)).toBe(href);
  });
  it.each([
    'https://external.example.test/lead-capture', '/lead-capture',
    `/lead-capture/${resultId}?workspace=${workspaceId}`, `/lead-capture/${sourceId}?workspace=${sourceId}`,
    `${href}#unreviewed`, `${href}&extra=1`, `https://user:password@app.example.test${href}`,
  ])('rejects unsafe or changed navigation: %s', href => {
    expect(() => captureNavigationResponse(workspaceId, sourceId, { href }, origin)).toThrow();
  });
});
